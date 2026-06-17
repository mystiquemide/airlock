import { NextResponse } from "next/server";

const BAND_BASE_URL = process.env.BAND_BASE_URL  ?? "https://app.band.ai";
// Band authenticates via X-API-Key header (NOT Authorization: Bearer).
// Must be an agent key (band_a_...) - user keys (band_u_...) are rejected.
const AGENT_API_KEY = process.env.BAND_AGENT_API_KEY;
const CHAT_ID       = process.env.AIRLOCK_CHAT_ID;

const VERDICT_MAP: Record<string, string> = {
  allow: "ALLOWED",
  human: "ESCALATED",
  deny:  "DENIED",
};

interface BandMessage {
  id: string;
  content: string;
  message_type: string;
  sender_name?: string;
  inserted_at?: string;
  metadata?: Record<string, unknown>;
}

type StageType =
  | "request_received"
  | "verdict_rendered"
  | "escalation_raised"
  | "human_decision"
  | "action_executed"
  | "action_blocked";

interface Stage {
  type: StageType;
  timestamp: string;
  [key: string]: unknown;
}

interface RequestRecord {
  id: string;
  agent?: string;
  actionType?: string;
  decision?: string;
  rule?: string;
  source?: string;
  receivedAt?: string;
  verdictAt?: string;
  humanDecision?: "approved" | "denied" | null;
  executed: boolean;
  stages: Stage[];
}

// Map a Band message to one of the 6 stage types.
// Handles both the old naming ("received", "verdict") and ANALYTICS.md names.
// Falls back to message_type when stage field is absent.
function resolveStage(meta: Record<string, unknown>, messageType: string): StageType | null {
  const stage = meta.stage as string | undefined;

  if (stage === "request_received" || stage === "received") return "request_received";
  if (stage === "verdict_rendered"  || stage === "verdict")  return "verdict_rendered";
  if (stage === "escalation_raised")                         return "escalation_raised";
  if (stage === "human_decision")                            return "human_decision";
  if (stage === "action_executed")                           return "action_executed";
  if (stage === "action_blocked")                            return "action_blocked";

  // No explicit stage field - use message_type as discriminator
  if (!stage) {
    if (messageType === "tool_result") return "action_executed";
    if (messageType === "error")       return "action_blocked";
  }

  return null;
}

export async function GET() {
  if (!AGENT_API_KEY || !CHAT_ID) {
    return NextResponse.json(
      { error: true, code: "CONFIG_MISSING", message: "BAND_AGENT_API_KEY or AIRLOCK_CHAT_ID not configured", entries: [], stats: { total: 0, allowed: 0, escalated: 0, denied: 0 } },
      { status: 500 }
    );
  }

  try {
    const url = `${BAND_BASE_URL}/api/v1/agent/chats/${CHAT_ID}/context?page=1&page_size=100`;
    const res = await fetch(url, {
      headers: {
        "X-API-Key": AGENT_API_KEY!,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Band API ${res.status}: ${body}`);
    }

    const payload = await res.json();
    const messages: BandMessage[] = payload.data ?? [];

    const byRequest = new Map<string, RequestRecord>();

    for (const msg of messages) {
      const meta      = msg.metadata ?? {};
      const requestId = meta.request_id as string | undefined;
      if (!requestId) continue;

      if (!byRequest.has(requestId)) {
        byRequest.set(requestId, {
          id:            requestId,
          stages:        [],
          humanDecision: null,
          executed:      false,
        });
      }
      const rec = byRequest.get(requestId)!;

      const stageType = resolveStage(meta, msg.message_type);
      if (!stageType) continue;

      const ts = msg.inserted_at ?? "";

      switch (stageType) {
        case "request_received": {
          const agentHandle = (meta.agent_handle as string) || (meta.agent as string) || (meta.sender as string) || msg.sender_name || "";
          rec.agent      = agentHandle || "unknown";
          rec.actionType = (meta.action_type as string) ?? "unknown";
          const handle   = agentHandle.toLowerCase();
          const isA2A    = handle.includes("rogue") ||
                           handle.includes("vendor-agent") ||
                           meta.source === "a2a_external" ||
                           meta.agent_type === "a2a";
          rec.source     = isA2A ? "a2a_external" : "internal";
          rec.receivedAt = ts;
          rec.stages.push({ type: stageType, timestamp: ts });
          break;
        }
        case "verdict_rendered": {
          rec.decision  = (meta.decision      as string) ?? "unknown";
          rec.rule      = (meta.matched_rule  as string) ?? (meta.rule as string) ?? "no-match";
          rec.verdictAt = ts;
          rec.stages.push({
            type:      stageType,
            timestamp: ts,
            verdict:   rec.decision,
            rule:      rec.rule,
            latencyMs: meta.latency_ms,
          });
          break;
        }
        case "escalation_raised": {
          rec.stages.push({
            type:      stageType,
            timestamp: ts,
            notified:  (meta.escalated_to as string) ?? "unknown",
          });
          break;
        }
        case "human_decision": {
          const raw = (meta.decision as string) ?? "";
          const normalised =
            raw === "approve" || raw === "approved" ? "approved" :
            raw === "deny"    || raw === "denied"   ? "denied"   : null;
          rec.humanDecision = normalised;
          rec.stages.push({
            type:      stageType,
            timestamp: ts,
            decision:  normalised,
            by:        (meta.decided_by as string) ?? "unknown",
          });
          break;
        }
        case "action_executed": {
          rec.executed = true;
          rec.stages.push({
            type:      stageType,
            timestamp: ts,
            result:    (meta.result as string) ?? "success",
          });
          break;
        }
        case "action_blocked": {
          rec.stages.push({
            type:      stageType,
            timestamp: ts,
            reason:    (meta.reason as string) ?? "policy",
          });
          break;
        }
      }
    }

    // Sort stages within each request chronologically
    for (const rec of byRequest.values()) {
      rec.stages.sort((a, b) =>
        a.timestamp && b.timestamp
          ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          : 0
      );
    }

    const entries = Array.from(byRequest.values())
      .filter((r) => r.decision)
      .map((r) => {
        const ts = r.verdictAt ?? r.receivedAt;

        let latency = "-";
        if (r.receivedAt && r.verdictAt) {
          const ms = new Date(r.verdictAt).getTime() - new Date(r.receivedAt).getTime();
          if (ms >= 0) latency = `${ms}ms`;
        }

        return {
          id:            r.id,
          time:          ts
            ? new Date(ts).toLocaleTimeString("en-GB", {
                hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "UTC",
              })
            : "-",
          agent:         r.agent       ?? "unknown",
          action:        r.actionType  ?? "unknown",
          verdict:       VERDICT_MAP[r.decision ?? ""] ?? r.decision?.toUpperCase() ?? "UNKNOWN",
          matchedRule:   r.rule        ?? "-",
          source:        r.source      ?? "internal",
          latency,
          stages:        r.stages,
          humanDecision: r.humanDecision ?? null,
          executed:      r.executed     ?? false,
          _ts: ts ?? "",
        };
      })
      .sort((a, b) => {
        if (!a._ts) return 1;
        if (!b._ts) return -1;
        return new Date(b._ts).getTime() - new Date(a._ts).getTime();
      })
      .map(({ _ts, ...row }) => row);

    const stats = {
      total:     entries.length,
      allowed:   entries.filter((e) => e.verdict === "ALLOWED").length,
      escalated: entries.filter((e) => e.verdict === "ESCALATED").length,
      denied:    entries.filter((e) => e.verdict === "DENIED").length,
    };

    return NextResponse.json({ entries, stats });

  } catch (err) {
    console.error("[/api/ledger]", err);
    return NextResponse.json(
      { error: true, code: "BAND_UNAVAILABLE", message: String(err), entries: [], stats: { total: 0, allowed: 0, escalated: 0, denied: 0 } },
      { status: 500 }
    );
  }
}

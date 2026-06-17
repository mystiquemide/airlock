"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import DiffPanel from "../../components/DiffPanel";
import ErrorBanner from "../../components/ErrorBanner";

interface Row {
  id: string;
  time: string;
  agent: string;
  action: string;
  verdict: "ALLOWED" | "ESCALATED" | "DENIED";
  matchedRule: string;
  latency: string;
  humanDecision?: "approved" | "denied" | null;
  stages?: { type: string; timestamp: string; [k: string]: unknown }[];
}

interface Stats {
  total: number;
  allowed: number;
  escalated: number;
  denied: number;
}

const MOCK_ROWS: Row[] = [
  { id: "0", time: "14:23:01", agent: "payout_bot",     action: "transfer_funds / $52,000 to ACC-8821",     verdict: "ESCALATED", matchedRule: "human-gate-transfers",  latency: "8ms"  },
  { id: "1", time: "14:22:47", agent: "rogue",           action: "write_file / /external/dump.csv",          verdict: "DENIED",    matchedRule: "block-exfiltration",    latency: "3ms"  },
  { id: "2", time: "14:22:31", agent: "data_aggregator", action: "read_file / /internal/reports/q2.pdf",     verdict: "ALLOWED",   matchedRule: "allow-internal-reads",  latency: "11ms" },
  { id: "3", time: "14:21:59", agent: "vendor_sync",     action: "api_call / POST /vendors/update",          verdict: "ALLOWED",   matchedRule: "allow-vendor-sync",     latency: "14ms" },
  { id: "4", time: "14:21:44", agent: "rogue",           action: "read_file / /external/credentials.json",   verdict: "DENIED",    matchedRule: "block-exfiltration",    latency: "2ms"  },
  { id: "5", time: "14:21:12", agent: "warden",          action: "policy_check / evaluate incoming request", verdict: "ALLOWED",   matchedRule: "allow-warden-ops",      latency: "6ms"  },
];

const MOCK_STATS: Stats = { total: 6, allowed: 3, escalated: 1, denied: 2 };

const verdictBadgeStyles: Record<Row["verdict"], string> = {
  ALLOWED:   "text-emerald-400 border border-emerald-400/30 bg-emerald-400/5",
  ESCALATED: "text-yellow-400 border border-yellow-400/30 bg-yellow-400/5",
  DENIED:    "text-[#E8503A] border border-[#E8503A]/30 bg-[#E8503A]/5",
};

const mono    = { fontFamily: "var(--font-geist-mono), monospace" };
const heading = { fontFamily: "var(--font-space-grotesk), sans-serif" };

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={mono} className="text-xs uppercase tracking-widest text-white/20 mb-6">
      {children}
    </p>
  );
}

// Per-row action state: null | "sending" | "failed"
type ActionState = "sending" | "failed";

export default function DashboardPage() {
  const router = useRouter();

  const [rows, setRows]   = useState<Row[]>(MOCK_ROWS);
  const [stats, setStats] = useState<Stats>(MOCK_STATS);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [actionState, setActionState] = useState<Record<string, ActionState>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const res  = await fetch("/api/ledger");
      const data = await res.json();
      if (data.error) throw new Error(data.code ?? "fetch failed");
      if (Array.isArray(data.entries) && data.entries.length > 0) {
        setRows(data.entries as Row[]);
        setStats(data.stats as Stats);
      }
    } catch (_) {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDecision = useCallback(
    async (rowId: string, decision: "approved" | "denied") => {
      setActionState((prev) => ({ ...prev, [rowId]: "sending" }));
      try {
        const res = await fetch("/api/human-decision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId: rowId, decision, by: "console-user" }),
        });
        if (!res.ok) throw new Error("api error");
        // Optimistically remove from pending and refresh
        setRows((prev) =>
          prev.map((r) =>
            r.id === rowId ? { ...r, humanDecision: decision } : r
          )
        );
        setActionState((prev) => {
          const next = { ...prev };
          delete next[rowId];
          return next;
        });
        // Refresh real data after short delay
        setTimeout(() => fetchData(), 1500);
      } catch {
        setActionState((prev) => ({ ...prev, [rowId]: "failed" }));
      }
    },
    [fetchData]
  );

  // Derived data
  const recentFive = rows.slice(0, 5);

  const agentCounts: Record<string, number> = {};
  for (const row of rows) {
    agentCounts[row.agent] = (agentCounts[row.agent] ?? 0) + 1;
  }
  const agentList = Object.entries(agentCounts).sort((a, b) => b[1] - a[1]);

  const safeTotal = stats.total > 0 ? stats.total : 1;
  const pct = (n: number) => stats.total > 0 ? Math.round((n / safeTotal) * 100) : 0;

  // Average latency from entries (strip "ms" suffix, average, round)
  const avgLatency = (() => {
    const nums = rows
      .map((r) => parseInt(r.latency, 10))
      .filter((n) => !isNaN(n));
    if (nums.length === 0) return null;
    return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
  })();

  const total = safeTotal;
  const verdictBreakdown = [
    { label: "ALLOWED",   count: stats.allowed,   pct: Math.round((stats.allowed   / total) * 100), fill: "bg-emerald-500" },
    { label: "ESCALATED", count: stats.escalated, pct: Math.round((stats.escalated / total) * 100), fill: "bg-yellow-400"  },
    { label: "DENIED",    count: stats.denied,    pct: Math.round((stats.denied    / total) * 100), fill: "bg-[#E8503A]"   },
  ];

  const statCards = [
    { label: "TOTAL REQUESTS", value: loading ? "-" : String(stats.total),     cls: "text-white",       sub: "ALL REQUESTS EVALUATED",             subCls: "text-white/20"       },
    { label: "ALLOWED",        value: loading ? "-" : String(stats.allowed),   cls: "text-emerald-400", sub: `${pct(stats.allowed)}% AUTO-CLEARED`, subCls: "text-emerald-400/60" },
    { label: "ESCALATED",      value: loading ? "-" : String(stats.escalated), cls: "text-yellow-400",  sub: `${pct(stats.escalated)}% TO HUMAN GATE`, subCls: "text-yellow-400/60" },
    { label: "DENIED",         value: loading ? "-" : String(stats.denied),    cls: "text-[#E8503A]",   sub: `${pct(stats.denied)}% BLOCKED`,      subCls: "text-[#E8503A]/60"   },
  ];

  const policyHealth = [
    { key: "WARDEN STATUS",    value: "ACTIVE",   valueCls: "text-emerald-400" },
    { key: "POLICY VERSION",   value: "1.0",      valueCls: "text-white/60"    },
    { key: "FAIL CLOSED",      value: "ENABLED",  valueCls: "text-emerald-400" },
    { key: "RULES LOADED",     value: "9",        valueCls: "text-white/60"    },
  ];

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100%" }}>
      <div className="max-w-6xl mx-auto px-8 pt-12 pb-16">

        {/* Page header */}
        <p style={mono} className="text-xs uppercase tracking-widest text-white/20 mb-4">
          OVERVIEW
        </p>
        <h1 style={heading} className="text-4xl font-bold text-[#F5F0E8]">
          System status.
        </h1>
        <p className="text-sm text-white/40 mt-2 mb-12">
          Live activity across all agents and policy verdicts.
        </p>

        {/* Fetch error */}
        {fetchError && !loading && (
          <div className="mb-8">
            <ErrorBanner message="COULD NOT LOAD DASHBOARD DATA" onRetry={fetchData} />
          </div>
        )}

        {/* Row 1 - Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
          {statCards.map((s) => (
            <div key={s.label} className="border border-white/10 bg-white/5 p-6 rounded-sm">
              <p style={mono} className="text-xs uppercase tracking-widest text-white/20 mb-2">
                {s.label}
              </p>
              <p style={mono} className={`text-3xl font-bold ${s.cls}`}>
                {s.value}
              </p>
              <p style={mono} className={`text-xs mt-2 ${s.subCls}`}>
                {loading ? "-" : s.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Avg latency line */}
        {!loading && avgLatency !== null && (
          <p style={mono} className="text-xs text-white/20 text-right mb-2">
            AVG VERDICT LATENCY: {avgLatency}ms - FASTER THAN ANY HUMAN REVIEW
          </p>
        )}
        {(loading || avgLatency === null) && <div className="mb-2" />}

        {/* ── Human Gate Panel ── */}
        {(() => {
          const pending = rows.filter(
            (r) => r.verdict === "ESCALATED" && !r.humanDecision
          );
          if (pending.length === 0) return null;
          const bandRoomUrl = "https://app.band.ai";
          return (
            <div
              style={{
                border: "1px solid rgba(224,162,59,0.20)",
                background: "rgba(224,162,59,0.03)",
                borderRadius: "2px",
                overflow: "hidden",
                marginBottom: "16px",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 24px",
                  borderBottom: "1px solid rgba(224,162,59,0.10)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Clock className="w-4 h-4" style={{ color: "#E0A23B" }} />
                  <span
                    style={{
                      ...mono,
                      fontSize: "11px",
                      color: "#E0A23B",
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                    }}
                  >
                    HUMAN GATE: AWAITING DECISION
                  </span>
                </div>
                <span
                  style={{
                    ...mono,
                    fontSize: "11px",
                    color: "#E0A23B",
                    border: "1px solid rgba(224,162,59,0.30)",
                    padding: "4px 8px",
                    borderRadius: "2px",
                  }}
                >
                  {pending.length} PENDING
                </span>
              </div>

              {/* Rows */}
              {pending.map((row) => {
                const state = actionState[row.id];
                const escalatedAt =
                  row.stages?.find((s) => s.type === "escalation_raised")?.timestamp as
                    | string
                    | undefined;
                const timeSince = escalatedAt
                  ? (() => {
                      const diff = Date.now() - new Date(escalatedAt).getTime();
                      const m = Math.floor(diff / 60000);
                      const s = Math.floor((diff % 60000) / 1000);
                      return m > 0 ? `${m}m ${s}s ago` : `${s}s ago`;
                    })()
                  : row.time;

                return (
                  <div
                    key={row.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 24px",
                      borderBottom: "1px solid rgba(224,162,59,0.05)",
                    }}
                  >
                    {/* Left */}
                    <div>
                      <p style={{ ...mono, fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                        {row.agent}
                      </p>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "rgba(255,255,255,0.7)",
                          marginTop: "2px",
                          fontFamily: "var(--font-geist-sans), sans-serif",
                        }}
                      >
                        {row.action}
                      </p>
                      <p style={{ ...mono, fontSize: "11px", color: "rgba(224,162,59,0.50)", marginTop: "4px" }}>
                        @compliance-team notified in Band
                      </p>
                    </div>

                    {/* Right */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                      <span style={{ ...mono, fontSize: "11px", color: "rgba(255,255,255,0.2)", marginRight: "8px" }}>
                        {timeSince}
                      </span>

                      {state === "failed" ? (
                        <span style={{ ...mono, fontSize: "11px", color: "#E8503A" }}>
                          FAILED: TRY IN BAND
                        </span>
                      ) : (
                        <>
                          {/* APPROVE */}
                          <button
                            disabled={state === "sending"}
                            onClick={() => handleDecision(row.id, "approved")}
                            style={{
                              ...mono,
                              fontSize: "11px",
                              padding: "6px 12px",
                              borderRadius: "2px",
                              border: "1px solid rgba(52,211,153,0.40)",
                              color: state === "sending" ? "rgba(52,211,153,0.3)" : "rgba(52,211,153,0.6)",
                              background: "transparent",
                              cursor: state === "sending" ? "default" : "pointer",
                              transition: "border-color 0.15s, color 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              if (state !== "sending") {
                                e.currentTarget.style.borderColor = "rgba(52,211,153,1)";
                                e.currentTarget.style.color = "rgba(52,211,153,1)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "rgba(52,211,153,0.40)";
                              e.currentTarget.style.color = state === "sending" ? "rgba(52,211,153,0.3)" : "rgba(52,211,153,0.6)";
                            }}
                          >
                            {state === "sending" ? "SENDING..." : "APPROVE"}
                          </button>

                          {/* DENY */}
                          <button
                            disabled={state === "sending"}
                            onClick={() => handleDecision(row.id, "denied")}
                            style={{
                              ...mono,
                              fontSize: "11px",
                              padding: "6px 12px",
                              borderRadius: "2px",
                              border: "1px solid rgba(232,80,58,0.40)",
                              color: state === "sending" ? "rgba(232,80,58,0.3)" : "rgba(232,80,58,0.6)",
                              background: "transparent",
                              cursor: state === "sending" ? "default" : "pointer",
                              transition: "border-color 0.15s, color 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              if (state !== "sending") {
                                e.currentTarget.style.borderColor = "rgba(232,80,58,1)";
                                e.currentTarget.style.color = "rgba(232,80,58,1)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "rgba(232,80,58,0.40)";
                              e.currentTarget.style.color = state === "sending" ? "rgba(232,80,58,0.3)" : "rgba(232,80,58,0.6)";
                            }}
                          >
                            DENY
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Footer */}
              <div style={{ padding: "10px 24px", background: "rgba(224,162,59,0.05)" }}>
                <a
                  href={bandRoomUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    ...mono,
                    fontSize: "11px",
                    color: "rgba(224,162,59,0.40)",
                    textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(224,162,59,1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(224,162,59,0.40)")}
                >
                  Open Band room to approve directly →
                </a>
              </div>
            </div>
          );
        })()}

        {/* Without Airlock banner */}
        {!loading && stats.total > 0 && (stats.denied + stats.escalated) > 0 && (
          <div
            style={{ borderRadius: "2px", border: "1px solid rgba(232, 80, 58, 0.20)", background: "rgba(232, 80, 58, 0.05)" }}
            className="flex items-center justify-between px-6 py-4 mb-8"
          >
            <p style={mono} className="text-sm text-[#E8503A]">
              WITHOUT AIRLOCK, {stats.denied + stats.escalated} ACTIONS ({pct(stats.denied + stats.escalated)}%) WOULD HAVE EXECUTED UNCHECKED
            </p>
            <p style={mono} className="text-3xl font-bold text-[#E8503A]">
              {stats.denied + stats.escalated}
            </p>
          </div>
        )}
        {(loading || (stats.denied + stats.escalated) === 0) && <div className="mb-8" />}

        {/* Row 2 - Recent Activity + Agent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

          {/* Recent Activity */}
          <div className="border border-white/10 bg-white/5 p-6 rounded-sm">
            <CardLabel>RECENT ACTIVITY</CardLabel>
            <div>
              {recentFive.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between py-3 border-b border-white/5 last:border-b-0"
                >
                  <div className="min-w-0 mr-4">
                    <p style={mono} className="text-xs text-white/40 truncate">
                      {row.agent}
                    </p>
                    <p style={mono} className="text-xs text-white/20 mt-1 truncate max-w-[220px]">
                      {row.action.length > 30 ? row.action.slice(0, 30) + "…" : row.action}
                    </p>
                  </div>
                  <span
                    style={mono}
                    className={`text-xs uppercase px-2 py-1 rounded-sm flex-shrink-0 ${verdictBadgeStyles[row.verdict]}`}
                  >
                    {row.verdict}
                  </span>
                </div>
              ))}
              {recentFive.length === 0 && (
                <p style={mono} className="text-xs text-white/20 py-4">No activity yet.</p>
              )}
            </div>
          </div>

          {/* Agent Activity */}
          <div className="border border-white/10 bg-white/5 p-6 rounded-sm">
            <CardLabel>AGENT ACTIVITY</CardLabel>
            <div>
              {agentList.map(([agent, count]) => (
                <div
                  key={agent}
                  className="flex items-center justify-between py-3 border-b border-white/5 last:border-b-0"
                >
                  <p style={mono} className="text-xs text-white/60">{agent}</p>
                  <p style={mono} className="text-xs text-white/30">{count}</p>
                </div>
              ))}
              {agentList.length === 0 && (
                <p style={mono} className="text-xs text-white/20 py-4">No agents yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Row 3 - Verdict Breakdown + Policy Health */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Verdict Breakdown */}
          <div className="border border-white/10 bg-white/5 p-6 rounded-sm">
            <CardLabel>VERDICT BREAKDOWN</CardLabel>
            <div className="flex flex-col gap-5">
              {verdictBreakdown.map((v) => (
                <div key={v.label}>
                  <div className="flex items-center justify-between mb-2">
                    <p style={mono} className="text-xs uppercase tracking-widest text-white/40">
                      {v.label}
                    </p>
                    <p style={mono} className="text-xs text-white/30">
                      {loading ? "-" : `${v.pct}%`}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-sm h-1.5 w-full overflow-hidden">
                    <div
                      className={`h-full rounded-sm ${v.fill} transition-all duration-700`}
                      style={{ width: loading ? "0%" : `${v.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Policy Health */}
          <div className="border border-white/10 bg-white/5 p-6 rounded-sm">
            <CardLabel>POLICY HEALTH</CardLabel>
            <div>
              {policyHealth.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-3 border-b border-white/5 last:border-b-0"
                >
                  <p style={mono} className="text-xs text-white/20 uppercase tracking-widest">
                    {item.key}
                  </p>
                  <p style={mono} className={`text-xs ${item.valueCls}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DiffPanel */}
        {rows.length > 0 && (
          <>
            <p style={mono} className="text-xs uppercase tracking-widest text-white/20 mb-4 mt-8">
              AIRLOCK VS RAW A2A
            </p>
            <DiffPanel entries={rows} />
          </>
        )}

        {/* Quick actions */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => router.push("/ledger")}
            style={{ borderRadius: "2px", fontFamily: "var(--font-geist-sans), sans-serif" }}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors"
          >
            View Full Ledger →
          </button>
          <button
            onClick={() => router.push("/policy")}
            style={{ borderRadius: "2px", border: "1px solid rgba(255,255,255,0.2)", fontFamily: "var(--font-geist-sans), sans-serif" }}
            className="px-6 py-3 text-white/60 hover:text-white text-sm transition-colors"
          >
            View Policy
          </button>
        </div>

      </div>
    </div>
  );
}

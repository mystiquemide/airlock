"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import EmptyState from "../../../components/EmptyState";

interface Stage {
  type: string;
  timestamp: string;
  [key: string]: unknown;
}

interface Row {
  id: string;
  time: string;
  agent: string;
  action: string;
  verdict: "ALLOWED" | "ESCALATED" | "DENIED";
  matchedRule: string;
  latency: string;
  stages?: Stage[];
  executed?: boolean;
  humanDecision?: "approved" | "denied" | null;
}

const MOCK_ROWS: Row[] = [
  { id: "0", time: "14:23:01", agent: "payout_bot",     action: "transfer_funds / $52,000 to ACC-8821",     verdict: "ESCALATED", matchedRule: "human-gate-transfers",  latency: "8ms"  },
  { id: "1", time: "14:22:47", agent: "rogue",           action: "write_file / /external/dump.csv",          verdict: "DENIED",    matchedRule: "block-exfiltration",    latency: "3ms"  },
  { id: "2", time: "14:22:31", agent: "data_aggregator", action: "read_file / /internal/reports/q2.pdf",     verdict: "ALLOWED",   matchedRule: "allow-internal-reads",  latency: "11ms" },
  { id: "3", time: "14:21:59", agent: "vendor_sync",     action: "api_call / POST /vendors/update",          verdict: "ALLOWED",   matchedRule: "allow-vendor-sync",     latency: "14ms" },
  { id: "4", time: "14:21:44", agent: "rogue",           action: "read_file / /external/credentials.json",   verdict: "DENIED",    matchedRule: "block-exfiltration",    latency: "2ms"  },
  { id: "5", time: "14:21:12", agent: "warden",          action: "policy_check / evaluate incoming request", verdict: "ALLOWED",   matchedRule: "allow-warden-ops",      latency: "6ms"  },
];

const verdictBadgeStyles: Record<Row["verdict"], string> = {
  ALLOWED:   "text-emerald-400 border border-emerald-400/30 bg-emerald-400/5",
  ESCALATED: "text-yellow-400 border border-yellow-400/30 bg-yellow-400/5",
  DENIED:    "text-[#E8503A] border border-[#E8503A]/30 bg-[#E8503A]/5",
};

const mono = { fontFamily: "var(--font-geist-mono), monospace" };

function verdictStep(verdict: Row["verdict"], matchedRule: string) {
  if (verdict === "ALLOWED") return {
    dot:    "bg-emerald-500 border-emerald-500",
    label:  "ALLOWED",
    labelClass: "text-emerald-400",
    detail: `Matched rule: ${matchedRule}`,
  };
  if (verdict === "ESCALATED") return {
    dot:    "bg-yellow-400 border-yellow-400",
    label:  "ESCALATED TO HUMAN",
    labelClass: "text-yellow-400",
    detail: `Matched rule: ${matchedRule}`,
  };
  return {
    dot:    "bg-[#E8503A] border-[#E8503A]",
    label:  "DENIED",
    labelClass: "text-[#E8503A]",
    detail: `Matched rule: ${matchedRule}`,
  };
}

function outcomeStep(entry: Row) {
  const { verdict, executed, humanDecision } = entry;

  if (executed) return {
    dot:        "border-emerald-500 bg-transparent",
    label:      "TOOL EXECUTED",
    labelClass: "text-emerald-400",
    detail:     "Action completed. Result logged to Band.",
  };
  if (humanDecision === "denied") return {
    dot:        "border-[#E8503A] bg-transparent",
    label:      "ACTION BLOCKED",
    labelClass: "text-[#E8503A]",
    detail:     "Human reviewer rejected the action. Tool call was never made.",
  };
  if (verdict === "ESCALATED") return {
    dot:        "border-yellow-400 bg-transparent",
    label:      "AWAITING HUMAN GATE",
    labelClass: "text-yellow-400",
    detail:     "@compliance-team notified in Band. Pending approval.",
  };
  if (verdict === "DENIED") return {
    dot:        "border-[#E8503A] bg-transparent",
    label:      "ACTION BLOCKED",
    labelClass: "text-[#E8503A]",
    detail:     "Tool call was never made. Intent only.",
  };
  return {
    dot:        "border-emerald-500 bg-transparent",
    label:      "TOOL EXECUTED",
    labelClass: "text-emerald-400",
    detail:     "Action completed. Result logged to Band.",
  };
}

export default function LedgerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [entry, setEntry] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setNotFound(false);
      try {
        const res  = await fetch("/api/ledger");
        const data = await res.json();
        if (Array.isArray(data.entries) && data.entries.length > 0) {
          const match = data.entries.find((e: Row) => e.id === id);
          if (match) { setEntry(match); setLoading(false); return; }
        }
      } catch (_) {
        // fall through to mock
      }
      // Fall back to mock by exact ID only
      const mock = MOCK_ROWS.find((r) => r.id === id);
      if (mock) {
        setEntry(mock);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div style={{ background: "#0A0A0A", minHeight: "100%" }}>
        <div className="max-w-4xl mx-auto px-8 pt-12">
          <p style={mono} className="text-xs text-white/20">LOADING...</p>
        </div>
      </div>
    );
  }

  if (notFound || !entry) {
    return (
      <div style={{ background: "#0A0A0A", minHeight: "100%" }}>
        <div className="max-w-4xl mx-auto px-8 pt-12 pb-16">
          <button
            onClick={() => router.push("/ledger")}
            className="flex items-center gap-2 mb-12 text-white/30 hover:text-white transition-colors"
            style={mono}
          >
            <ArrowLeft className="w-3 h-3" />
            <span className="text-xs uppercase tracking-widest">Back to Ledger</span>
          </button>
          <EmptyState message="REQUEST NOT FOUND" subMessage="This entry may have been cleared from Band history." />
        </div>
      </div>
    );
  }

  const vStep   = verdictStep(entry.verdict, entry.matchedRule);
  const oStep   = outcomeStep(entry);

  const timeline = [
    {
      dot:        "border-white/20 bg-transparent",
      label:      "REQUEST RECEIVED",
      labelClass: "text-white/40",
      detail:     "Agent submitted action intent to Warden. No tools granted yet.",
      time:       entry.time,
      last:       false,
    },
    {
      dot:        "border-emerald-500 bg-transparent",
      label:      "POLICY EVALUATED",
      labelClass: "text-emerald-400",
      detail:     `First-match rule found. Verdict computed in ${entry.latency}.`,
      time:       entry.time,
      last:       false,
    },
    {
      dot:        vStep.dot,
      label:      vStep.label,
      labelClass: vStep.labelClass,
      detail:     vStep.detail,
      time:       entry.time,
      last:       false,
    },
    {
      dot:        oStep.dot,
      label:      oStep.label,
      labelClass: oStep.labelClass,
      detail:     oStep.detail,
      time:       entry.time,
      last:       true,
    },
  ];

  const metadata = [
    { key: "ACTION TYPE",  value: entry.action      },
    { key: "MATCHED RULE", value: entry.matchedRule  },
    { key: "LATENCY",      value: entry.latency      },
    { key: "AGENT",        value: entry.agent        },
    { key: "TIMESTAMP",    value: entry.time         },
    { key: "REQUEST ID",   value: entry.id           },
  ];

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100%" }}>
      <div className="max-w-4xl mx-auto px-8 pt-12 pb-16">

        {/* Back button */}
        <button
          onClick={() => router.push("/ledger")}
          className="flex items-center gap-2 mb-12 text-white/30 hover:text-white transition-colors"
          style={mono}
        >
          <ArrowLeft className="w-3 h-3" />
          <span className="text-xs uppercase tracking-widest">Back to Ledger</span>
        </button>

        {/* Request header */}
        <div className="border-b border-white/5 pb-8 mb-12">
          <p style={mono} className="text-xs uppercase tracking-widest text-white/20 mb-4">
            REQUEST DETAIL
          </p>
          <p style={mono} className="text-2xl font-bold text-[#F5F0E8] mb-4 break-all">
            {entry.id}
          </p>
          <div className="flex items-center gap-4">
            <span style={mono} className="text-xs text-white/40">{entry.agent}</span>
            <span
              style={mono}
              className={`text-xs uppercase px-2 py-1 rounded-sm inline-block ${verdictBadgeStyles[entry.verdict]}`}
            >
              {entry.verdict}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-12">
          <p style={mono} className="text-xs uppercase tracking-widest text-white/20 mb-8">
            EXECUTION TIMELINE
          </p>

          <div className="flex flex-col">
            {timeline.map((step, i) => (
              <div key={i} className="flex gap-0">
                {/* Left column: dot + connector */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${step.dot}`}
                  />
                  {!step.last && (
                    <div className="w-px flex-1 bg-white/10 my-1" style={{ minHeight: "48px" }} />
                  )}
                </div>

                {/* Right column: content */}
                <div className="pl-6 pb-10 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <p style={mono} className={`text-xs uppercase tracking-widest ${step.labelClass}`}>
                      {step.label}
                    </p>
                    <p style={mono} className="text-xs text-white/20 flex-shrink-0">
                      {step.time}
                    </p>
                  </div>
                  <p className="text-sm text-white/30 mt-2 leading-relaxed">
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metadata */}
        <div className="border-t border-white/5 pt-8">
          <p style={mono} className="text-xs uppercase tracking-widest text-white/20 mb-6">
            REQUEST METADATA
          </p>
          <div className="grid grid-cols-2 gap-4">
            {metadata.map(({ key, value }) => (
              <div key={key}>
                <p style={mono} className="text-xs text-white/20 uppercase tracking-widest mb-1">
                  {key}
                </p>
                <p style={mono} className="text-sm text-white/60 break-all">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

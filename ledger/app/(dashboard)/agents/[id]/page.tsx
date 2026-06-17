"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import EmptyState from "../../../components/EmptyState";

const BAND_NAMES: Record<string, string[]> = {
  "warden":          ["warden", "Warden"],
  "data-aggregator": ["data-aggregator", "Data Aggregator", "data_aggregator"],
  "vendor-sync":     ["vendor-sync", "Vendor Sync", "vendor_sync"],
  "payout-bot":      ["payout-bot", "Payout Bot", "payout_bot"],
  "rogue-vendor":    ["rogue-vendor", "Rogue Vendor", "rogue", "rogue-vendor-agent"],
};

interface Row {
  id: string;
  time: string;
  agent: string;
  action: string;
  verdict: "ALLOWED" | "ESCALATED" | "DENIED";
  matchedRule: string;
  latency: string;
}

const mono    = { fontFamily: "var(--font-geist-mono), monospace" };
const heading = { fontFamily: "var(--font-space-grotesk), sans-serif" };

type BadgeColor = "emerald" | "blue" | "yellow" | "red";

interface AgentDef {
  type: string;
  badgeColor: BadgeColor;
  description: string;
  status: string;
}

const agentConfig: Record<string, AgentDef> = {
  "warden":          { type: "ORCHESTRATOR", badgeColor: "emerald", description: "Core policy enforcement engine. Evaluates every action request against policy.yaml.",            status: "ACTIVE"    },
  "data-aggregator": { type: "WORKER",       badgeColor: "blue",    description: "Reads internal reports and aggregates data for downstream agents.",                              status: "ACTIVE"    },
  "vendor-sync":     { type: "WORKER",       badgeColor: "blue",    description: "Syncs vendor data via external API calls. Operates within approved vendor list.",                status: "ACTIVE"    },
  "payout-bot":      { type: "FINANCIAL",    badgeColor: "yellow",  description: "Initiates financial transfers. All payouts above threshold require human gate.",                 status: "ACTIVE"    },
  "rogue-vendor":    { type: "UNTRUSTED",    badgeColor: "red",     description: "Simulated adversarial agent. Used to demonstrate policy enforcement under attack.",              status: "MONITORED" },
};

const badgeClasses: Record<BadgeColor, string> = {
  emerald: "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
  blue:    "text-blue-400 border-blue-400/30 bg-blue-400/5",
  yellow:  "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
  red:     "text-[#E8503A] border-[#E8503A]/30 bg-[#E8503A]/5",
};

const statusClasses: Record<string, string> = {
  ACTIVE:    "text-emerald-400",
  MONITORED: "text-[#E8503A]",
};

const verdictBadgeStyles: Record<Row["verdict"], string> = {
  ALLOWED:   "text-emerald-400 border border-emerald-400/30 bg-emerald-400/5",
  ESCALATED: "text-yellow-400 border border-yellow-400/30 bg-yellow-400/5",
  DENIED:    "text-[#E8503A] border border-[#E8503A]/30 bg-[#E8503A]/5",
};

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const config = agentConfig[id];

  const [entries, setEntries] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!config) {
      const t = setTimeout(() => router.push("/agents"), 2000);
      return () => clearTimeout(t);
    }

    async function fetchData() {
      setLoading(true);
      try {
        const res  = await fetch("/api/ledger");
        const data = await res.json();
        if (Array.isArray(data.entries) && data.entries.length > 0) {
          const aliases = BAND_NAMES[id] || [id];
          setEntries((data.entries as Row[]).filter((r) =>
            aliases.some((alias) => r.agent?.toLowerCase() === alias.toLowerCase())
          ));
        }
      } catch (_) {
        // keep empty
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, config, router]);

  if (!config) {
    return (
      <div style={{ background: "#0A0A0A", minHeight: "100%" }}>
        <div className="max-w-4xl mx-auto px-8 pt-12">
          <p style={mono} className="text-xs text-white/20">UNKNOWN AGENT. Redirecting...</p>
        </div>
      </div>
    );
  }

  const total     = entries.length;
  const allowed   = entries.filter((r) => r.verdict === "ALLOWED").length;
  const flagged   = entries.filter((r) => r.verdict === "DENIED" || r.verdict === "ESCALATED").length;

  const statCards = [
    { label: "TOTAL REQUESTS",       value: loading ? "-" : String(total),   cls: "text-white"       },
    { label: "ALLOWED",              value: loading ? "-" : String(allowed), cls: "text-emerald-400" },
    { label: "DENIED + ESCALATED",   value: loading ? "-" : String(flagged), cls: "text-[#E8503A]"   },
  ];

  const metadata = [
    { key: "HANDLE",      value: id                              },
    { key: "TYPE",        value: config.type                     },
    { key: "STATUS",      value: config.status                   },
    { key: "POLICY",      value: "policy.yaml"                   },
    { key: "REGISTERED",  value: "2026-06-01"                    },
    { key: "BAND ROOM",   value: "2b8714b2-57bb"                 },
  ];

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100%" }}>
      <div className="max-w-4xl mx-auto px-8 pt-12 pb-16">

        {/* Back button */}
        <button
          onClick={() => router.push("/agents")}
          className="flex items-center gap-2 mb-12 text-white/30 hover:text-white transition-colors"
          style={mono}
        >
          <ArrowLeft className="w-3 h-3" />
          <span className="text-xs uppercase tracking-widest">Back to Agents</span>
        </button>

        {/* Agent header */}
        <div className="border-b border-white/5 pb-8 mb-12">
          <div className="flex items-center gap-4 mb-3">
            <h1 style={{ ...heading, fontSize: "30px", fontWeight: 700, color: "#F5F0E8", fontFamily: "var(--font-geist-mono), monospace" }}>
              {id}
            </h1>
            <span
              style={mono}
              className={`text-xs px-2 py-1 rounded-sm border ${badgeClasses[config.badgeColor]}`}
            >
              {config.type}
            </span>
          </div>
          <p className="text-sm text-white/40 max-w-lg">
            {config.description}
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {statCards.map((s) => (
            <div key={s.label} className="border border-white/10 bg-white/5 p-6 rounded-sm">
              <p style={mono} className="text-xs uppercase tracking-widest text-white/20 mb-2">
                {s.label}
              </p>
              <p style={mono} className={`text-3xl font-bold ${s.cls}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Activity feed */}
        <div className="mb-12">
          <p style={mono} className="text-xs uppercase tracking-widest text-white/20 mb-6">
            ACTIVITY FEED
          </p>

          {loading && (
            <p style={mono} className="text-xs text-white/20 py-12 text-center">LOADING...</p>
          )}

          {!loading && entries.length === 0 && (
            <EmptyState message="NO ACTIVITY RECORDED" subMessage="This agent has not sent any requests yet." />
          )}

          {!loading && entries.length > 0 && (
            <div>
              {entries.map((row, i) => (
                <div
                  key={row.id}
                  onClick={() => router.push(`/ledger/${row.id}`)}
                  className="border-b border-white/5 py-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors px-2 -mx-2 rounded-sm"
                >
                  <div className="min-w-0 mr-6">
                    <p style={mono} className="text-xs text-white/20">{row.time}</p>
                    <p style={mono} className="text-sm text-white/60 mt-1 truncate max-w-xs">{row.action}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      style={mono}
                      className={`text-xs uppercase px-2 py-1 rounded-sm inline-block ${verdictBadgeStyles[row.verdict]}`}
                    >
                      {row.verdict}
                    </span>
                    <p style={mono} className="text-xs text-white/20 mt-1">{row.matchedRule}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agent metadata */}
        <div className="border-t border-white/5 pt-8">
          <p style={mono} className="text-xs uppercase tracking-widest text-white/20 mb-6">
            AGENT METADATA
          </p>
          <div className="grid grid-cols-2 gap-4">
            {metadata.map(({ key, value }) => (
              <div key={key}>
                <p style={mono} className="text-xs text-white/20 uppercase tracking-widest mb-1">
                  {key}
                </p>
                <p style={mono} className={`text-sm break-all ${key === "STATUS" ? (statusClasses[value] ?? "text-white/60") : "text-white/60"}`}>
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

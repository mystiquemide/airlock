"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ErrorBanner from "../../components/ErrorBanner";

interface Row {
  id: string;
  agent: string;
}

const mono    = { fontFamily: "var(--font-geist-mono), monospace" };
const heading = { fontFamily: "var(--font-space-grotesk), sans-serif" };

interface AgentDef {
  handle: string;
  name: string;
  type: string;
  typeCls: string;
  description: string;
  status: string;
  statusCls: string;
}

const AGENTS: AgentDef[] = [
  {
    handle:      "warden",
    name:        "warden",
    type:        "ORCHESTRATOR",
    typeCls:     "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
    description: "Core policy enforcement engine. Evaluates every action request against policy.yaml.",
    status:      "ACTIVE",
    statusCls:   "text-emerald-400",
  },
  {
    handle:      "data-aggregator",
    name:        "data-aggregator",
    type:        "WORKER",
    typeCls:     "text-blue-400 border-blue-400/30 bg-blue-400/5",
    description: "Reads internal reports and aggregates data for downstream agents.",
    status:      "ACTIVE",
    statusCls:   "text-emerald-400",
  },
  {
    handle:      "vendor-sync",
    name:        "vendor-sync",
    type:        "WORKER",
    typeCls:     "text-blue-400 border-blue-400/30 bg-blue-400/5",
    description: "Syncs vendor data via external API calls. Operates within approved vendor list.",
    status:      "ACTIVE",
    statusCls:   "text-emerald-400",
  },
  {
    handle:      "payout-bot",
    name:        "payout-bot",
    type:        "FINANCIAL",
    typeCls:     "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
    description: "Initiates financial transfers. All payouts above threshold require human gate.",
    status:      "ACTIVE",
    statusCls:   "text-emerald-400",
  },
  {
    handle:      "rogue-vendor",
    name:        "rogue-vendor",
    type:        "UNTRUSTED",
    typeCls:     "text-[#E8503A] border-[#E8503A]/30 bg-[#E8503A]/5",
    description: "Simulated adversarial agent. Used to demonstrate policy enforcement under attack.",
    status:      "MONITORED",
    statusCls:   "text-[#E8503A]",
  },
];

const BAND_NAMES: Record<string, string[]> = {
  "warden":          ["warden", "Warden"],
  "data-aggregator": ["data-aggregator", "Data Aggregator", "data_aggregator"],
  "vendor-sync":     ["vendor-sync", "Vendor Sync", "vendor_sync"],
  "payout-bot":      ["payout-bot", "Payout Bot", "payout_bot"],
  "rogue-vendor":    ["rogue-vendor", "Rogue Vendor", "rogue", "rogue-vendor-agent"],
};

function getAgentCount(entries: Row[], handle: string) {
  const aliases = BAND_NAMES[handle] || [handle];
  return entries.filter((e) =>
    aliases.some((alias) => e.agent?.toLowerCase() === alias.toLowerCase())
  ).length;
}

export default function AgentsPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const res  = await fetch("/api/ledger");
      const data = await res.json();
      if (data.error) throw new Error(data.code ?? "fetch failed");
      if (Array.isArray(data.entries) && data.entries.length > 0) {
        setEntries(data.entries as Row[]);
      }
    } catch (_) {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100%" }}>
      <div className="max-w-6xl mx-auto px-8 pt-12 pb-16">

        {/* Page header */}
        <p style={mono} className="text-xs uppercase tracking-widest text-white/20 mb-4">
          AGENT ROSTER
        </p>
        <h1 style={heading} className="text-4xl font-bold text-[#F5F0E8]">
          Every agent. Accounted for.
        </h1>
        <p className="text-sm text-white/40 mt-2 mb-12">
          All agents registered against this Airlock instance. Every request they make is logged.
        </p>

        {/* Fetch error */}
        {fetchError && !loading && (
          <div className="mb-8">
            <ErrorBanner message="COULD NOT LOAD AGENT DATA" onRetry={fetchAgents} />
          </div>
        )}

        {/* Summary bar */}
        <div className="flex items-center justify-between mb-8">
          <p style={mono} className="text-xs text-white/20">
            5 AGENTS REGISTERED
          </p>
          <p style={mono} className="text-xs text-emerald-400">
            ALL SYSTEMS ACTIVE
          </p>
        </div>

        {/* Agent cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AGENTS.map((agent) => {
            const count = getAgentCount(entries, agent.handle);
            return (
              <div
                key={agent.handle}
                onClick={() => router.push(`/agents/${agent.handle}`)}
                className="border border-white/10 bg-white/5 p-6 rounded-sm hover:border-white/20 cursor-pointer transition-colors flex flex-col"
              >
                {/* Name + type badge */}
                <div className="flex items-center justify-between mb-3">
                  <p style={mono} className="text-sm text-white font-medium">
                    {agent.name}
                  </p>
                  <span
                    style={mono}
                    className={`text-xs px-2 py-1 rounded-sm border ${agent.typeCls}`}
                  >
                    {agent.type}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-white/30 leading-relaxed flex-1">
                  {agent.description}
                </p>

                {/* Stats row */}
                <div className="border-t border-white/5 mt-4 pt-4 flex justify-between">
                  <div>
                    <p style={mono} className="text-xs text-white/20 uppercase tracking-widest mb-1">
                      REQUESTS
                    </p>
                    <p style={mono} className="text-sm text-white/60">
                      {loading ? "-" : count}
                    </p>
                  </div>
                  <div className="text-right">
                    <p style={mono} className="text-xs text-white/20 uppercase tracking-widest mb-1">
                      STATUS
                    </p>
                    <p style={mono} className={`text-sm ${agent.statusCls}`}>
                      {agent.status}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import DiffPanel from "../../components/DiffPanel";
import ErrorBanner from "../../components/ErrorBanner";
import EmptyState from "../../components/EmptyState";

type FilterType = "ALL" | "ALLOWED" | "ESCALATED" | "DENIED" | "ROGUE";

interface Row {
  id: string;
  time: string;
  agent: string;
  action: string;
  verdict: "ALLOWED" | "ESCALATED" | "DENIED";
  matchedRule: string;
  latency: string;
  executed?: boolean;
  humanDecision?: "approved" | "denied" | null;
  source?: string;
}

interface Stats {
  total: number;
  allowed: number;
  escalated: number;
  denied: number;
}

// Shown immediately while real data loads
const MOCK_ROWS: Row[] = [
  { id: "0", time: "14:23:01", agent: "payout_bot",     action: "transfer_funds / $52,000 to ACC-8821",     verdict: "ESCALATED", matchedRule: "human-gate-transfers",  latency: "8ms"  },
  { id: "1", time: "14:22:47", agent: "rogue",           action: "write_file / /external/dump.csv",          verdict: "DENIED",    matchedRule: "block-exfiltration",    latency: "3ms"  },
  { id: "2", time: "14:22:31", agent: "data_aggregator", action: "read_file / /internal/reports/q2.pdf",     verdict: "ALLOWED",   matchedRule: "allow-internal-reads",  latency: "11ms" },
  { id: "3", time: "14:21:59", agent: "vendor_sync",     action: "api_call / POST /vendors/update",          verdict: "ALLOWED",   matchedRule: "allow-vendor-sync",     latency: "14ms" },
  { id: "4", time: "14:21:44", agent: "rogue",           action: "read_file / /external/credentials.json",   verdict: "DENIED",    matchedRule: "block-exfiltration",    latency: "2ms"  },
  { id: "5", time: "14:21:12", agent: "warden",          action: "policy_check / evaluate incoming request", verdict: "ALLOWED",   matchedRule: "allow-warden-ops",      latency: "6ms"  },
];

const MOCK_STATS: Stats = { total: 6, allowed: 3, escalated: 1, denied: 2 };

const verdictStyles: Record<Row["verdict"], string> = {
  ALLOWED:   "text-emerald-400 border border-emerald-400/30 bg-emerald-400/5",
  ESCALATED: "text-yellow-400 border border-yellow-400/30 bg-yellow-400/5",
  DENIED:    "text-[#E8503A] border border-[#E8503A]/30 bg-[#E8503A]/5",
};

const filterButtons: FilterType[] = ["ALL", "ALLOWED", "ESCALATED", "DENIED", "ROGUE"];

const mono    = { fontFamily: "var(--font-geist-mono), monospace" };
const heading = { fontFamily: "var(--font-space-grotesk), sans-serif" };

function executedCell(row: Row) {
  if (row.executed === true)              return { label: "YES",     cls: "text-emerald-400 border border-emerald-400/30 bg-emerald-400/5" };
  if (row.verdict === "DENIED")           return { label: "NO",      cls: "text-[#E8503A] border border-[#E8503A]/30 bg-[#E8503A]/5"       };
  if (row.humanDecision === "denied")     return { label: "NO",      cls: "text-[#E8503A] border border-[#E8503A]/30 bg-[#E8503A]/5"       };
  if (row.verdict === "ESCALATED")        return { label: "PENDING", cls: "text-yellow-400 border border-yellow-400/30 bg-yellow-400/5"    };
  if (row.verdict === "ALLOWED")          return { label: "YES",     cls: "text-emerald-400 border border-emerald-400/30 bg-emerald-400/5" };
  return { label: "-", cls: "text-white/20" };
}

const POLL_INTERVAL = 30_000;

export default function LedgerPage() {
  const router = useRouter();

  const [rows, setRows]                 = useState<Row[]>(MOCK_ROWS);
  const [stats, setStats]               = useState<Stats>(MOCK_STATS);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState<string | null>(null);
  const [newIds, setNewIds]             = useState<Set<string>>(new Set());
  const [filter, setFilter]             = useState<FilterType>("ALL");
  const [search, setSearch]             = useState("");
  const [hoveredId, setHoveredId]       = useState<string | null>(null);
  const [fetchError, setFetchError]     = useState(false);

  const knownIds = useRef<Set<string>>(new Set());
  const labelTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update the "just now / HH:MM:SS" label every second
  function startLabelTimer(ts: Date) {
    if (labelTimer.current) clearInterval(labelTimer.current);
    function compute() {
      const secs = Math.floor((Date.now() - ts.getTime()) / 1000);
      if (secs < 60) {
        setLastUpdatedLabel("UPDATED JUST NOW");
      } else {
        setLastUpdatedLabel(
          "LAST UPDATED: " +
          ts.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        );
      }
    }
    compute();
    labelTimer.current = setInterval(compute, 1000);
  }

  const fetchLedger = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setFetchError(false);

    try {
      const res  = await fetch("/api/ledger");
      const data = await res.json();
      console.log("API response:", data);

      if (Array.isArray(data.entries) && data.entries.length > 0) {
        const incoming = data.entries as Row[];

        // Detect new ids not seen before
        const fresh = new Set<string>();
        for (const r of incoming) {
          if (!knownIds.current.has(r.id)) {
            fresh.add(r.id);
            knownIds.current.add(r.id);
          }
        }
        if (fresh.size > 0) {
          setNewIds(fresh);
          setTimeout(() => setNewIds(new Set()), 1200);
        }

        setRows(incoming);
        setStats(data.stats as Stats);
      }

      const now = new Date();
      setLastUpdatedAt(now);
      startLabelTimer(now);
    } catch (err) {
      console.error("Ledger fetch error:", err);
      setFetchError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initial fetch + 30s auto-poll
  useEffect(() => {
    fetchLedger(false);
    const interval = setInterval(() => fetchLedger(false), POLL_INTERVAL);
    return () => {
      clearInterval(interval);
      if (labelTimer.current) clearInterval(labelTimer.current);
    };
  }, [fetchLedger]);

  const rogueCount = rows.filter((r) => r.agent?.toLowerCase().includes("rogue")).length;

  const filtered = rows.filter((row) => {
    if (filter === "ROGUE") {
      if (!row.agent?.toLowerCase().includes("rogue")) return false;
    } else if (filter !== "ALL") {
      if (row.verdict !== filter) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      if (
        !row.agent.toLowerCase().includes(q) &&
        !row.action.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const statCards = [
    { label: "TOTAL REQUESTS", value: String(stats.total),     valueClass: "text-white"       },
    { label: "ALLOWED",        value: String(stats.allowed),   valueClass: "text-emerald-400" },
    { label: "ESCALATED",      value: String(stats.escalated), valueClass: "text-yellow-400"  },
    { label: "DENIED",         value: String(stats.denied),    valueClass: "text-[#E8503A]"   },
  ];

  const isBusy = loading || refreshing;

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100%" }}>

      {/* Page header */}
      <div className="pt-12 pb-12 max-w-6xl mx-auto px-8">
        <p style={mono} className="text-xs uppercase tracking-widest text-white/20 mb-6">
          COMPLIANCE LEDGER
        </p>
        <h1 style={heading} className="text-4xl md:text-5xl font-bold text-[#F5F0E8] leading-tight max-w-2xl">
          Every verdict. Every decision. On the record.
        </h1>
        <p className="text-sm text-white/40 mt-4 max-w-lg leading-relaxed">
          Real-time audit trail pulled from Band. Immutable. No second database.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto px-8 mb-12">
        {statCards.map((s) => (
          <div key={s.label} className="border border-white/10 bg-white/5 p-6 rounded-sm">
            <p style={mono} className="text-xs uppercase tracking-widest text-white/20 mb-2">
              {s.label}
            </p>
            <p style={mono} className={`text-3xl font-bold ${s.valueClass}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* DiffPanel - collapsible, between stat cards and table */}
      {rows.length > 0 && (
        <div className="max-w-6xl mx-auto px-8 mb-8">
          <DiffPanel entries={rows} collapsible />
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* Table section */}
      <div className="max-w-6xl mx-auto px-8 pt-8 pb-16">

        {/* Status row */}
        <div className="flex items-center justify-between mb-4 h-5">
          <p style={mono} className="text-xs text-white/20">
            {loading ? "FETCHING FROM BAND..." : ""}
          </p>

          <div className="flex items-center gap-4">
            {/* Live indicator + timestamp */}
            {lastUpdatedLabel && !isBusy && (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                <p style={mono} className="text-xs text-white/20">
                  {lastUpdatedLabel}
                </p>
              </div>
            )}

            {/* Refresh button */}
            <button
              onClick={() => fetchLedger(true)}
              disabled={isBusy}
              style={mono}
              className="flex items-center gap-2 text-xs text-white/30 hover:text-white border border-white/10 hover:border-white/30 px-3 py-2 rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "REFRESHING..." : "REFRESH"}
            </button>
          </div>
        </div>

        {/* Fetch error */}
        {fetchError && !isBusy && (
          <div className="mb-4">
            <ErrorBanner message="FAILED TO FETCH FROM BAND" onRetry={() => fetchLedger(true)} />
          </div>
        )}

        {/* Rogue counter */}
        {rogueCount > 0 && (
          <p style={mono} className="text-xs text-[#E8503A] mb-4">
            ⚠ {rogueCount} UNTRUSTED AGENT ACTIONS INTERCEPTED
          </p>
        )}

        {/* Filter bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            {filterButtons.map((f) => {
              const isRogue  = f === "ROGUE";
              const isActive = filter === f;
              const cls = isRogue
                ? isActive
                  ? "bg-[#E8503A]/10 text-[#E8503A] border-[#E8503A]/40"
                  : "text-[#E8503A]/40 border-[#E8503A]/20 hover:text-[#E8503A] hover:border-[#E8503A]/40"
                : isActive
                  ? "bg-white/10 text-white border-white/10"
                  : "text-white/40 border-white/10 hover:text-white";
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={mono}
                  className={`text-xs uppercase tracking-widest px-4 py-2 rounded-sm border mr-2 transition-colors ${cls}`}
                >
                  {f}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agent, action, rule..."
            className="bg-transparent border border-white/10 text-white/60 text-sm px-4 py-2 rounded-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 w-64"
          />
        </div>

        {/* Table */}
        <div className="border border-white/10 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  {[
                    { label: "TIME",         cls: "text-left w-36"  },
                    { label: "AGENT",        cls: "text-left w-40"  },
                    { label: "ACTION",       cls: "text-left"       },
                    { label: "VERDICT",      cls: "text-left w-32"  },
                    { label: "EXECUTED",     cls: "text-left w-28"  },
                    { label: "MATCHED RULE", cls: "text-left w-48"  },
                    { label: "LATENCY",      cls: "text-right w-24" },
                  ].map((col) => (
                    <th
                      key={col.label}
                      style={mono}
                      className={`text-xs uppercase tracking-widest text-white/20 px-6 py-4 font-normal ${col.cls}`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const isRogue  = row.agent?.toLowerCase().includes("rogue") ?? false;
                  const isNew    = newIds.has(row.id);
                  const isHover  = hoveredId === row.id;

                  let bg = "transparent";
                  if (isNew)         bg = "rgba(16, 185, 129, 0.05)";
                  else if (isHover)  bg = "rgba(255, 255, 255, 0.05)";
                  else if (isRogue)  bg = "rgba(232, 80, 58, 0.03)";

                  const rowStyle: React.CSSProperties = {
                    background: bg,
                    borderLeft: isRogue ? "2px solid #E8503A" : undefined,
                    transition: isNew ? "background 1.2s ease-out" : "background 0.15s ease",
                  };

                  return (
                  <tr
                    key={row.id}
                    onClick={() => router.push(`/ledger/${row.id}`)}
                    onMouseEnter={() => setHoveredId(row.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="border-b border-white/5 cursor-pointer last:border-b-0"
                    style={rowStyle}
                  >
                    <td style={mono} className="text-white/30 text-xs px-6 py-4">{row.time}</td>
                    <td style={mono} className="text-white/60 text-xs px-6 py-4">
                      {row.agent}
                      {isRogue && (
                        <span style={mono} className="text-[10px] text-[#E8503A]/60 uppercase tracking-widest mt-0.5 block">
                          UNTRUSTED
                        </span>
                      )}
                      {row.source === "a2a_external" && (
                        <span className="text-[10px] font-mono text-purple-400 border border-purple-400/30 px-1 rounded-sm ml-1">
                          A2A
                        </span>
                      )}
                    </td>
                    <td className="text-white/80 text-sm px-6 py-4">{row.action}</td>
                    <td className="px-6 py-4">
                      <span
                        style={mono}
                        className={`text-xs uppercase px-2 py-1 rounded-sm inline-block ${verdictStyles[row.verdict] ?? "text-white/40 border border-white/10"}`}
                      >
                        {row.verdict}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {(() => { const ec = executedCell(row); return (
                        <span style={mono} className={`text-xs uppercase px-2 py-1 rounded-sm inline-block ${ec.cls}`}>
                          {ec.label}
                        </span>
                      ); })()}
                    </td>
                    <td style={mono} className="text-white/30 text-xs px-6 py-4">{row.matchedRule}</td>
                    <td style={mono} className="text-white/30 text-xs px-6 py-4 text-right">{row.latency}</td>
                  </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState message="NO ENTRIES FOUND" subMessage="Run the swarm to generate audit trail entries." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

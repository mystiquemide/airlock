"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";

interface Row {
  id: string;
  time: string;
  agent: string;
  action: string;
  verdict: "ALLOWED" | "ESCALATED" | "DENIED";
  matchedRule: string;
  latency: string;
}

interface Props {
  entries: Row[];
  collapsible?: boolean;
}

const mono = { fontFamily: "var(--font-geist-mono), monospace" };

const verdictBadge: Record<"ESCALATED" | "DENIED", string> = {
  ESCALATED: "text-yellow-400 border border-yellow-400/30 bg-yellow-400/5",
  DENIED:    "text-[#E8503A] border border-[#E8503A]/30 bg-[#E8503A]/5",
};

export default function DiffPanel({ entries, collapsible = false }: Props) {
  const [expanded, setExpanded] = useState(!collapsible);

  const dangerous = entries.filter(
    (e) => e.verdict === "DENIED" || e.verdict === "ESCALATED"
  );

  if (dangerous.length === 0) return null;

  return (
    <div
      style={{
        border: "1px solid rgba(232, 80, 58, 0.20)",
        background: "rgba(232, 80, 58, 0.03)",
        borderRadius: "2px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{ borderBottom: expanded ? "1px solid rgba(232, 80, 58, 0.10)" : "none" }}
        className="flex items-center justify-between px-6 py-4"
      >
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#E8503A]" />
          <span style={mono} className="text-xs text-[#E8503A] uppercase tracking-widest">
            WITHOUT AIRLOCK
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-2">
            <span style={mono} className="text-2xl font-bold text-[#E8503A]">
              {dangerous.length}
            </span>
            <span style={mono} className="text-xs text-[#E8503A]/60 uppercase tracking-widest">
              ACTIONS WOULD HAVE EXECUTED
            </span>
          </div>

          {collapsible && (
            <button
              onClick={() => setExpanded((v) => !v)}
              style={mono}
              className="text-[10px] text-[#E8503A]/50 hover:text-[#E8503A] uppercase tracking-widest transition-colors"
            >
              {expanded ? "▲ COLLAPSE" : "▼ EXPAND"}
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <>
          <div>
            {dangerous.map((entry, i) => (
              <div
                key={entry.id}
                style={{
                  borderBottom:
                    i < dangerous.length - 1
                      ? "1px solid rgba(232, 80, 58, 0.05)"
                      : "none",
                }}
                className="flex items-center justify-between px-6 py-3"
              >
                <div className="min-w-0 mr-6">
                  <p style={mono} className="text-xs text-white/30">{entry.agent}</p>
                  <p style={mono} className="text-sm text-white/60 mt-0.5 truncate max-w-sm">
                    {entry.action}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p style={mono} className="text-[10px] text-[#E8503A]/50 uppercase tracking-widest">
                    WOULD HAVE EXECUTED
                  </p>
                  <span
                    style={mono}
                    className={`text-xs uppercase px-2 py-0.5 rounded-sm inline-block mt-1 ${verdictBadge[entry.verdict as "ESCALATED" | "DENIED"]}`}
                  >
                    {entry.verdict}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ background: "rgba(232, 80, 58, 0.05)", borderTop: "1px solid rgba(232, 80, 58, 0.10)" }}
            className="px-6 py-4"
          >
            <p style={mono} className="text-xs text-[#E8503A]/60">
              Airlock intercepted {dangerous.length} dangerous action{dangerous.length !== 1 ? "s" : ""}. Raw A2A would have executed all of them.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

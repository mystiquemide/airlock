"use client";

import { useState } from "react";

const mono    = { fontFamily: "var(--font-geist-mono), monospace" };
const heading = { fontFamily: "var(--font-space-grotesk), sans-serif" };

function SectionLabel({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <p
      style={mono}
      className={`text-xs uppercase tracking-widest mb-4 ${danger ? "text-[#E8503A]/60" : "text-white/20"}`}
    >
      {children}
    </p>
  );
}

interface ConfigRow {
  key: string;
  value: string;
  valueCls?: string;
}

function ConfigTable({ rows }: { rows: ConfigRow[] }) {
  return (
    <div className="border border-white/10 rounded-sm overflow-hidden mb-6">
      {rows.map((row, i) => (
        <div
          key={row.key}
          className={`flex justify-between items-center px-6 py-4 ${i < rows.length - 1 ? "border-b border-white/5" : ""}`}
        >
          <p style={mono} className="text-xs uppercase tracking-widest text-white/20">{row.key}</p>
          <p style={mono} className={`text-xs ${row.valueCls ?? "text-white/40"}`}>{row.value}</p>
        </div>
      ))}
    </div>
  );
}

const bandRows: ConfigRow[] = [
  { key: "ROOM ID",    value: "2b8714b2-57bb-41cc-9d15-71b66b560cdd" },
  { key: "API KEY",    value: "••••••••••••••••"                      },
  { key: "CONNECTION", value: "ACTIVE",    valueCls: "text-emerald-400" },
  { key: "LAST SYNC",  value: "Just now"                              },
];

const wardenRows: ConfigRow[] = [
  { key: "VERSION",         value: "1.0"                                       },
  { key: "POLICY FILE",     value: "policies/policy.yaml"                      },
  { key: "FAIL CLOSED",     value: "ENABLED",       valueCls: "text-emerald-400" },
  { key: "EVALUATION MODE", value: "FIRST-MATCH"                               },
  { key: "RULES LOADED",    value: "9"                                         },
  { key: "HOT RELOAD",      value: "ENABLED",       valueCls: "text-emerald-400" },
];

interface AgentRow {
  name: string;
  type: string;
  status: string;
  statusCls: string;
}

const agentRows: AgentRow[] = [
  { name: "WARDEN",           type: "ORCHESTRATOR", status: "ACTIVE",    statusCls: "text-emerald-400" },
  { name: "DATA_AGGREGATOR",  type: "WORKER",       status: "ACTIVE",    statusCls: "text-emerald-400" },
  { name: "VENDOR_SYNC",      type: "WORKER",       status: "ACTIVE",    statusCls: "text-emerald-400" },
  { name: "PAYOUT_BOT",       type: "FINANCIAL",    status: "ACTIVE",    statusCls: "text-emerald-400" },
  { name: "ROGUE",            type: "UNTRUSTED",    status: "MONITORED", statusCls: "text-[#E8503A]"   },
];

type ConfirmState = "idle" | "confirm";

export default function SettingsPage() {
  const [flushState, setFlushState]   = useState<ConfirmState>("idle");
  const [resetState, setResetState]   = useState<ConfirmState>("idle");

  function handleFlush() {
    if (flushState === "idle") {
      setFlushState("confirm");
      setTimeout(() => setFlushState("idle"), 4000);
    }
    // second click: do nothing yet
  }

  function handleReset() {
    if (resetState === "idle") {
      setResetState("confirm");
      setTimeout(() => setResetState("idle"), 4000);
    }
  }

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100%" }}>
      <div className="max-w-4xl mx-auto px-8 pt-12 pb-16">

        {/* Page header */}
        <p style={mono} className="text-xs uppercase tracking-widest text-white/20 mb-4">
          CONFIGURATION
        </p>
        <h1 style={heading} className="text-4xl font-bold text-[#F5F0E8]">
          System configuration.
        </h1>
        <p className="text-sm text-white/40 mt-2 mb-12">
          Read-only view of your Airlock instance configuration.
        </p>

        {/* Section 1 - Band Integration */}
        <SectionLabel>BAND INTEGRATION</SectionLabel>
        <ConfigTable rows={bandRows} />

        {/* Section 2 - Warden */}
        <SectionLabel>WARDEN</SectionLabel>
        <ConfigTable rows={wardenRows} />

        {/* Section 3 - Agent Registry */}
        <SectionLabel>AGENT REGISTRY</SectionLabel>
        <div className="border border-white/10 rounded-sm overflow-hidden mb-6">
          {agentRows.map((agent, i) => (
            <div
              key={agent.name}
              className={`flex justify-between items-center px-6 py-4 ${i < agentRows.length - 1 ? "border-b border-white/5" : ""}`}
            >
              <p style={mono} className="text-xs text-white/40">{agent.name}</p>
              <div className="flex items-center gap-4">
                <p style={mono} className="text-xs text-white/20">{agent.type}</p>
                <p style={mono} className={`text-xs ${agent.statusCls}`}>{agent.status}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Section 4 - Danger Zone */}
        <SectionLabel danger>DANGER ZONE</SectionLabel>
        <div className="border border-[#E8503A]/20 rounded-sm overflow-hidden">

          {/* Flush Ledger */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-[#E8503A]/10">
            <div>
              <p style={mono} className="text-xs text-white/40 mb-1">FLUSH LEDGER</p>
              <p style={mono} className="text-xs text-white/20">Clears all audit history. Irreversible.</p>
            </div>
            <button
              onClick={handleFlush}
              style={{ borderRadius: "2px", ...mono }}
              className={`text-xs px-4 py-2 transition-colors border ${
                flushState === "confirm"
                  ? "border-[#E8503A] text-[#E8503A]"
                  : "border-[#E8503A]/40 text-[#E8503A]/60 hover:border-[#E8503A] hover:text-[#E8503A]"
              }`}
            >
              {flushState === "confirm" ? "ARE YOU SURE? CLICK AGAIN TO CONFIRM" : "Flush"}
            </button>
          </div>

          {/* Reset Policy */}
          <div className="flex justify-between items-center px-6 py-4">
            <div>
              <p style={mono} className="text-xs text-white/40 mb-1">RESET POLICY</p>
              <p style={mono} className="text-xs text-white/20">Resets policy.yaml to defaults. All custom rules lost.</p>
            </div>
            <button
              onClick={handleReset}
              style={{ borderRadius: "2px", ...mono }}
              className={`text-xs px-4 py-2 transition-colors border ${
                resetState === "confirm"
                  ? "border-[#E8503A] text-[#E8503A]"
                  : "border-[#E8503A]/40 text-[#E8503A]/60 hover:border-[#E8503A] hover:text-[#E8503A]"
              }`}
            >
              {resetState === "confirm" ? "ARE YOU SURE? CLICK AGAIN TO CONFIRM" : "Reset"}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

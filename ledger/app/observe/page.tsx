"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const mono = { fontFamily: "var(--font-geist-mono), monospace" };
const heading = { fontFamily: "var(--font-space-grotesk), sans-serif" };

const VERDICT_COLOR: Record<string, string> = {
  ALLOWED:   "#3FB57A",
  ESCALATED: "#E0A23B",
  DENIED:    "#E8503A",
};
const VERDICT_BG: Record<string, string> = {
  ALLOWED:   "rgba(63,181,122,0.08)",
  ESCALATED: "rgba(224,162,59,0.08)",
  DENIED:    "rgba(232,80,58,0.08)",
};

interface Entry {
  id: string;
  time: string;
  agent: string;
  action: string;
  verdict: string;
  matchedRule: string;
  source: string;
  latency: string;
}

interface Stats {
  total: number;
  allowed: number;
  escalated: number;
  denied: number;
}

export default function ObservePage() {
  const [entries, setEntries]         = useState<Entry[]>([]);
  const [stats, setStats]             = useState<Stats>({ total: 0, allowed: 0, escalated: 0, denied: 0 });
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res  = await fetch("/api/ledger");
      const data = await res.json();
      if (data.error) {
        setError(data.message ?? "Failed to load data");
      } else {
        setEntries(data.entries ?? []);
        setStats(data.stats ?? { total: 0, allowed: 0, escalated: 0, denied: 0 });
        setLastUpdated(new Date());
        setError(null);
      }
    } catch {
      setError("Could not connect to ledger");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const statCards = [
    { label: "TOTAL",     value: stats.total,     color: "rgba(255,255,255,0.8)" },
    { label: "ALLOWED",   value: stats.allowed,   color: "#3FB57A" },
    { label: "ESCALATED", value: stats.escalated, color: "#E0A23B" },
    { label: "DENIED",    value: stats.denied,    color: "#E8503A" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", color: "#ffffff" }}>

      {/* Top bar */}
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 32px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            ...mono,
            fontSize: "11px",
            color: "rgba(255,255,255,0.3)",
            textDecoration: "none",
            letterSpacing: "0.08em",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,1)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
        >
          ← AIRLOCK
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: loading ? "rgba(255,255,255,0.2)" : "#10B981",
              display: "inline-block",
              transition: "background 0.3s ease",
            }}
          />
          <span style={{ ...mono, fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em" }}>
            LIVE
          </span>
          {lastUpdated && (
            <span style={{ ...mono, fontSize: "10px", color: "rgba(255,255,255,0.15)", letterSpacing: "0.06em", marginLeft: "8px" }}>
              {lastUpdated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
        </div>
      </div>

      <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "56px 32px 80px" }}>

        {/* Page header */}
        <p style={{ ...mono, fontSize: "11px", color: "#E8503A", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "16px" }}>
          COMPLIANCE LEDGER
        </p>
        <h1
          style={{
            ...heading,
            fontSize: "clamp(32px, 4vw, 56px)",
            fontWeight: 700,
            color: "#F5F0E8",
            lineHeight: 1.1,
            marginBottom: "8px",
            letterSpacing: "-0.5px",
          }}
        >
          Every verdict. In real time.
        </h1>
        <p
          style={{
            ...mono,
            fontSize: "13px",
            color: "rgba(255,255,255,0.35)",
            lineHeight: 1.7,
            maxWidth: "480px",
            marginBottom: "48px",
          }}
        >
          Read-only view of the Band audit trail. Every intent received, every policy matched, every action blocked or allowed.
        </p>

        {/* Stats row */}
        <div className="observe-stats" style={{ marginBottom: "48px" }}>
          {statCards.map((s) => (
            <div
              key={s.label}
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "20px 24px",
                borderRadius: "2px",
              }}
            >
              <p
                style={{
                  ...mono,
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.25)",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                {s.label}
              </p>
              <p style={{ ...mono, fontSize: "28px", color: s.color, lineHeight: 1 }}>
                {loading ? "-" : s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <p style={{ ...mono, fontSize: "12px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>LOADING...</p>
        ) : error ? (
          <p style={{ ...mono, fontSize: "12px", color: "#E8503A" }}>{error}</p>
        ) : entries.length === 0 ? (
          <p style={{ ...mono, fontSize: "12px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>NO VERDICTS YET</p>
        ) : (
          <div style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>

            {/* Header row */}
            <div
              className="observe-row"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                padding: "10px 20px",
              }}
            >
              {["TIME", "AGENT", "ACTION", "VERDICT", "MATCHED RULE", "LATENCY"].map((h) => (
                <span
                  key={h}
                  style={{ ...mono, fontSize: "10px", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.1em" }}
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Data rows */}
            {entries.map((entry, i) => {
              const color   = VERDICT_COLOR[entry.verdict] ?? "rgba(255,255,255,0.5)";
              const bg      = VERDICT_BG[entry.verdict]   ?? "transparent";
              const isRogue = entry.source === "a2a_external";
              return (
                <div
                  key={entry.id}
                  className="observe-row"
                  style={{
                    borderBottom: i < entries.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    borderLeft: `2px solid ${isRogue ? "#E8503A" : "transparent"}`,
                    background: isRogue ? "rgba(232,80,58,0.03)" : "transparent",
                    padding: "14px 20px",
                    alignItems: "center",
                  }}
                >
                  <span style={{ ...mono, fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
                    {entry.time}
                  </span>
                  <span style={{ ...mono, fontSize: "12px", color: isRogue ? "#E8503A" : "rgba(255,255,255,0.5)" }}>
                    {entry.agent}
                    {isRogue && (
                      <span
                        style={{
                          fontSize: "9px",
                          background: "rgba(232,80,58,0.12)",
                          color: "#E8503A",
                          border: "1px solid rgba(232,80,58,0.25)",
                          borderRadius: "2px",
                          padding: "1px 5px",
                          marginLeft: "6px",
                          letterSpacing: "0.08em",
                          verticalAlign: "middle",
                        }}
                      >
                        UNTRUSTED
                      </span>
                    )}
                  </span>
                  <span style={{ ...mono, fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                    {entry.action}
                  </span>
                  <span
                    style={{
                      ...mono,
                      fontSize: "10px",
                      color: color,
                      background: bg,
                      border: `1px solid ${color}40`,
                      borderRadius: "2px",
                      padding: "3px 8px",
                      display: "inline-block",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {entry.verdict}
                  </span>
                  <span style={{ ...mono, fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>
                    {entry.matchedRule}
                  </span>
                  <span style={{ ...mono, fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>
                    {entry.latency}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        <p style={{ ...mono, fontSize: "11px", color: "rgba(255,255,255,0.1)", marginTop: "32px", letterSpacing: "0.06em" }}>
          Auto-refreshes every 30s. Source: Band immutable audit trail. No login required.
        </p>

        {/* CTA row */}
        <div style={{ display: "flex", gap: "16px", marginTop: "56px", flexWrap: "wrap" }}>
          <Link
            href="/demo"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "11px 22px",
              background: "#10B981",
              color: "#000000",
              borderRadius: "2px",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              transition: "background 0.18s ease",
              ...mono,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#34D399")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#10B981")}
          >
            Watch the scenario →
          </Link>
          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "10px 22px",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.5)",
              borderRadius: "2px",
              fontSize: "13px",
              fontWeight: 400,
              textDecoration: "none",
              transition: "border-color 0.18s ease, color 0.18s ease",
              ...mono,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
              e.currentTarget.style.color = "rgba(255,255,255,0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            }}
          >
            Start building
          </Link>
        </div>

      </div>

      <style>{`
        .observe-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .observe-row {
          display: grid;
          grid-template-columns: 80px 160px 1fr 100px 1fr 80px;
          gap: 16px;
        }
        @media (max-width: 900px) {
          .observe-stats { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .observe-stats { grid-template-columns: 1fr 1fr; }
          .observe-row {
            grid-template-columns: 70px 1fr 80px;
          }
          .observe-row > *:nth-child(3),
          .observe-row > *:nth-child(5),
          .observe-row > *:nth-child(6) { display: none; }
        }
      `}</style>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import FadeUp from "./FadeUp";

const bullets = [
  { label: "FAIL-CLOSED DEFAULT",  desc: "Unknown action types are blocked. Not guessed." },
  { label: "FIRST-MATCH WINS",     desc: "Rules evaluated top-down, predictable." },
  { label: "HUMAN ESCALATION",     desc: "Flag risky actions with a single rule line." },
  { label: "IMMUTABLE TRAIL",      desc: "Every verdict logged to Band history." },
];

// Syntax highlight helpers - produce HTML strings (content is 100% hardcoded, no XSS risk)
const k  = (s: string) => `<span style="color:rgba(255,255,255,0.6)">${s}</span>`;
const v  = (s: string) => `<span style="color:#34D399">${s}</span>`;
const q  = (s: string) => `<span style="color:#E8503A">${s}</span>`;
const p  = (s: string) => `<span style="color:rgba(255,255,255,0.2)">${s}</span>`;
const sv = (s: string) => `<span style="color:rgba(255,255,255,0.45)">${s}</span>`;

const yamlHtml = [
  `${k("version")}${p(": ")}${q('"1.0"')}`,
  `${k("fail_closed")}${p(": ")}${v("true")}`,
  ``,
  `${k("rules")}${p(":")}`,
  `  ${p("- ")}${k("name")}${p(": ")}${sv("block-exfiltration")}`,
  `    ${k("match")}${p(":")}`,
  `      ${k("action")}${p(": ")}${sv("write_file")}`,
  `      ${k("path")}${p(": ")}${sv("/external/*")}`,
  `    ${k("verdict")}${p(": ")}${v("DENY")}`,
  ``,
  `  ${p("- ")}${k("name")}${p(": ")}${sv("human-gate-transfers")}`,
  `    ${k("match")}${p(":")}`,
  `      ${k("action")}${p(": ")}${sv("transfer_funds")}`,
  `      ${k("amount")}${p(": ")}${q('"&gt;= 10000"')}`,
  `    ${k("verdict")}${p(": ")}${v("ESCALATE")}`,
  `    ${k("notify")}${p(": ")}${q('"@compliance-team"')}`,
  ``,
  `  ${p("- ")}${k("name")}${p(": ")}${sv("allow-internal-reads")}`,
  `    ${k("match")}${p(":")}`,
  `      ${k("action")}${p(": ")}${sv("read_file")}`,
  `      ${k("path")}${p(": ")}${sv("/internal/*")}`,
  `    ${k("verdict")}${p(": ")}${v("ALLOW")}`,
].join("\n");

const terminalHtml = [
  `<span style="color:rgba(255,255,255,0.3)">$</span> <span style="color:rgba(255,255,255,0.7)">airlock verify policy.yaml</span>`,
  `<span style="color:#34D399">✓</span> <span style="color:rgba(255,255,255,0.5)">Schema valid</span>`,
  `<span style="color:#34D399">✓</span> <span style="color:rgba(255,255,255,0.5)">3 rules loaded</span>`,
  `<span style="color:#34D399">✓</span> <span style="color:rgba(255,255,255,0.5)">fail_closed: true</span>`,
  ``,
  `<span style="color:rgba(255,255,255,0.2)">warden ready - listening on band://airlock</span>`,
].join("\n");

export default function PolicyBlock() {
  const [tab, setTab] = useState<"yaml" | "terminal">("yaml");

  return (
    <section id="how-it-works" style={{ background: "#0A0A0A", padding: "128px 0 96px" }}>
      <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 32px" }}>

        {/* Section label */}
        <FadeUp>
          <p
            data-policy-label
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "11px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: "64px",
            }}
          >
            POLICY ENGINE
          </p>
        </FadeUp>

        {/* Two-column grid */}
        <div className="policy-grid">

          {/* LEFT - content */}
          <div>
            {/* Top label */}
            <p
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: "11px",
                fontWeight: 400,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "24px",
              }}
            >
              {"</>"} GOVERNANCE IN ONE YAML FILE
            </p>

            {/* Headline */}
            <FadeUp delay={0.1}>
              <h2
                data-policy-headline
                style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: "clamp(36px, 4.5vw, 56px)",
                  fontWeight: 700,
                  color: "#F5F0E8",
                  lineHeight: 1.1,
                  maxWidth: "448px",
                  marginBottom: "24px",
                  letterSpacing: "-0.5px",
                }}
              >
                Declare rules. The Warden enforces them.
              </h2>
            </FadeUp>

            {/* Subline */}
            <FadeUp delay={0.15}>
              <p
                data-policy-subline
                style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.4)",
                  maxWidth: "336px",
                  lineHeight: 1.75,
                  letterSpacing: "0.03em",
                  marginBottom: "40px",
                }}
              >
                No LLM guesswork on the boundary. First-match policy, fail-closed default.
              </p>
            </FadeUp>

            {/* Feature bullets */}
            <div data-policy-bullets>
              {bullets.map((b, i) => (
                <FadeUp key={b.label} delay={0.1 * i}>
                  <div
                    data-policy-bullet
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                      paddingTop: "16px",
                      marginTop: i === 0 ? "0" : "16px",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-geist-mono), monospace",
                        fontSize: "10px",
                        fontWeight: 400,
                        color: "rgba(255,255,255,0.6)",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        marginBottom: "4px",
                      }}
                    >
                      {b.label}
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "rgba(255,255,255,0.3)",
                        lineHeight: 1.6,
                      }}
                    >
                      {b.desc}
                    </p>
                  </div>
                </FadeUp>
              ))}
            </div>

            {/* CTAs */}
            <FadeUp delay={0.2}>
              <div
                data-policy-ctas
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginTop: "40px",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  href="/login"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "12px 24px",
                    background: "#10B981",
                    color: "#000000",
                    borderRadius: "2px",
                    fontSize: "14px",
                    fontWeight: 500,
                    textDecoration: "none",
                    transition: "background 0.18s ease",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#34D399")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#10B981")}
                >
                  Try for free
                </Link>
                <Link
                  href="/login"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "11px 24px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "rgba(255,255,255,0.6)",
                    borderRadius: "2px",
                    fontSize: "14px",
                    fontWeight: 400,
                    textDecoration: "none",
                    transition: "border-color 0.18s ease, color 0.18s ease",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,1)";
                    e.currentTarget.style.color = "rgba(255,255,255,1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                  }}
                >
                  Book a demo
                </Link>
              </div>
            </FadeUp>
          </div>

          {/* RIGHT - code block */}
          <FadeUp delay={0.1}>
            <div data-policy-code>
              {/* Tab bar */}
              <div
                style={{
                  display: "flex",
                  gap: "24px",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {(["yaml", "terminal"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      background: "none",
                      border: "none",
                      borderBottom: tab === t ? "1px solid #10B981" : "1px solid transparent",
                      padding: "0 0 12px 0",
                      marginBottom: "-1px",
                      fontSize: "13px",
                      fontWeight: 400,
                      color: tab === t ? "#ffffff" : "rgba(255,255,255,0.3)",
                      cursor: "pointer",
                      letterSpacing: "0.02em",
                      fontFamily: "var(--font-geist-mono), monospace",
                      transition: "color 0.18s ease",
                    }}
                  >
                    {t === "yaml" ? "policy.yaml" : "terminal"}
                  </button>
                ))}
              </div>

              {/* Code content */}
              <div
                style={{
                  background: "#111111",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderTop: "none",
                  borderRadius: "0 0 2px 2px",
                  padding: "24px",
                  overflowX: "auto",
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    padding: 0,
                    fontFamily: "var(--font-geist-mono), monospace",
                    fontSize: "13px",
                    lineHeight: 1.75,
                    whiteSpace: "pre",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: tab === "yaml" ? yamlHtml : terminalHtml,
                  }}
                />
              </div>
            </div>
          </FadeUp>

        </div>
      </div>

      <style>{`
        .policy-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: start;
        }
        @media (max-width: 768px) {
          .policy-grid {
            grid-template-columns: 1fr;
            gap: 48px;
          }
        }
      `}</style>
    </section>
  );
}

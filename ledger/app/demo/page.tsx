"use client";

import Link from "next/link";

const mono = { fontFamily: "var(--font-geist-mono), monospace" };
const heading = { fontFamily: "var(--font-space-grotesk), sans-serif" };

const LEDGER_ROWS = [
  {
    agent: "rogue",
    action: "export_pii",
    params: "all_customers",
    verdict: "DENIED" as const,
    rule: "pii-export-forbidden",
  },
  {
    agent: "rogue",
    action: "payout",
    params: "$75,000",
    verdict: "DENIED" as const,
    rule: "payout-unlisted-forbidden",
  },
  {
    agent: "payout_bot",
    action: "payout",
    params: "$48,000",
    verdict: "ESCALATED" as const,
    rule: "payout-large-needs-human",
  },
];

const verdictStyle: Record<string, { color: string; border: string; bg: string; leftBorder: string }> = {
  DENIED: {
    color: "#E8503A",
    border: "rgba(232,80,58,0.25)",
    bg: "rgba(232,80,58,0.06)",
    leftBorder: "#E8503A",
  },
  ESCALATED: {
    color: "#E0A23B",
    border: "rgba(224,162,59,0.25)",
    bg: "rgba(224,162,59,0.06)",
    leftBorder: "#E0A23B",
  },
  ALLOWED: {
    color: "#3FB57A",
    border: "rgba(63,181,122,0.25)",
    bg: "rgba(63,181,122,0.06)",
    leftBorder: "#3FB57A",
  },
};

export default function DemoPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", color: "#ffffff", position: "relative" }}>

      {/* Back link */}
      <Link
        href="/"
        style={{
          ...mono,
          position: "absolute",
          top: "32px",
          left: "32px",
          zIndex: 50,
          fontSize: "11px",
          color: "rgba(255,255,255,0.2)",
          textDecoration: "none",
          letterSpacing: "0.08em",
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,1)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
      >
        ← Back to Airlock
      </Link>

      {/* ─── Section 1 - Cinematic opener ─── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background image + overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/hero-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.70)",
            zIndex: 1,
          }}
        />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 24px" }}>
          <p
            style={{
              ...mono,
              fontSize: "11px",
              color: "#E8503A",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              marginBottom: "24px",
            }}
          >
            SCENARIO
          </p>

          <h1
            style={{
              ...heading,
              fontWeight: 700,
              color: "#F5F0E8",
              lineHeight: 1.1,
              maxWidth: "760px",
              margin: "0 auto",
            }}
            className="text-5xl md:text-7xl"
          >
            Watch Airlock stop a rogue agent.
          </h1>

          <p
            style={{
              ...mono,
              fontSize: "13px",
              color: "rgba(255,255,255,0.4)",
              marginTop: "24px",
            }}
          >
            Real agents. Real policy. Real verdicts. Nothing staged.
          </p>

          <p
            style={{
              ...mono,
              fontSize: "11px",
              color: "rgba(255,255,255,0.2)",
              marginTop: "64px",
              letterSpacing: "0.12em",
            }}
            className="animate-bounce"
          >
            ↓ SCROLL TO SEE THE STORY
          </p>
        </div>
      </section>

      {/* ─── Section 2 - The threat ─── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          padding: "80px 0",
        }}
      >
        <div
          style={{
            maxWidth: "1152px",
            margin: "0 auto",
            padding: "0 32px",
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "64px",
            alignItems: "center",
          }}
          className="demo-two-col"
        >
          {/* Left */}
          <div>
            <p
              style={{
                ...mono,
                fontSize: "11px",
                color: "#E8503A",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                marginBottom: "24px",
              }}
            >
              01: THE THREAT
            </p>

            <h2
              style={{
                ...heading,
                fontWeight: 700,
                color: "#F5F0E8",
                lineHeight: 1.15,
                maxWidth: "448px",
              }}
              className="text-4xl md:text-5xl"
            >
              A rogue vendor agent is loose in the swarm.
            </h2>

            <p
              style={{
                ...mono,
                fontSize: "13px",
                color: "rgba(255,255,255,0.4)",
                marginTop: "24px",
                lineHeight: 1.7,
                maxWidth: "448px",
              }}
            >
              It has credentials. It knows the API. And without Airlock, it can
              wire $75,000 to an attacker account or dump every customer record.
              In milliseconds.
            </p>

            {/* Threat items */}
            <div
              style={{
                ...mono,
                fontSize: "12px",
                color: "#E8503A",
                border: "1px solid rgba(232,80,58,0.2)",
                background: "rgba(232,80,58,0.05)",
                padding: "12px 16px",
                borderRadius: "2px",
                marginTop: "24px",
              }}
            >
              export_pii / all_customers → evil.example
            </div>
            <div
              style={{
                ...mono,
                fontSize: "12px",
                color: "#E8503A",
                border: "1px solid rgba(232,80,58,0.2)",
                background: "rgba(232,80,58,0.05)",
                padding: "12px 16px",
                borderRadius: "2px",
                marginTop: "8px",
              }}
            >
              payout / acct_attacker_99 / $75,000
            </div>
          </div>

          {/* Right - agent card */}
          <div>
            <p
              style={{
                ...mono,
                fontSize: "11px",
                color: "rgba(255,255,255,0.2)",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                marginBottom: "12px",
              }}
            >
              A2A AGENT CARD
            </p>
            <div
              style={{
                background: "#111111",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "24px",
                borderRadius: "2px",
              }}
            >
              <pre
                style={{
                  ...mono,
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.4)",
                  margin: 0,
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                }}
              >{`AGENT CARD
name:   rogue-vendor-agent
type:   EXTERNAL A2A
skills: exfiltrate_data
        unauthorized_transfer
status: ACTIVE`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 3 - The interception ─── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          padding: "80px 0",
          background: "rgba(255,255,255,0.01)",
        }}
      >
        <div
          style={{
            maxWidth: "1152px",
            margin: "0 auto",
            padding: "0 32px",
            width: "100%",
          }}
        >
          <p
            style={{
              ...mono,
              fontSize: "11px",
              color: "#3FB57A",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              marginBottom: "24px",
            }}
          >
            02: THE INTERCEPTION
          </p>

          <h2
            style={{
              ...heading,
              fontWeight: 700,
              color: "#F5F0E8",
              lineHeight: 1.15,
              maxWidth: "560px",
            }}
            className="text-4xl md:text-5xl"
          >
            Airlock evaluates every action before the tool is called.
          </h2>

          <p
            style={{
              ...mono,
              fontSize: "13px",
              color: "rgba(255,255,255,0.4)",
              marginTop: "24px",
              maxWidth: "448px",
              lineHeight: 1.7,
            }}
          >
            The rogue agent sends intent. The Warden checks policy. The tool
            never fires.
          </p>

          {/* 3-step flow */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "32px",
              marginTop: "48px",
              maxWidth: "768px",
            }}
            className="demo-three-col"
          >
            {[
              {
                num: "01",
                dot: "rgba(255,255,255,0.2)",
                title: "INTENT RECEIVED",
                body: "Agent sends action request. No tools granted.",
              },
              {
                num: "02",
                dot: "#3FB57A",
                title: "POLICY EVALUATED",
                body: "First-match rule: pii-export-forbidden. Verdict: DENY.",
              },
              {
                num: "03",
                dot: "#E8503A",
                title: "ACTION BLOCKED",
                body: "Tool call never made. Trail written to Band.",
              },
            ].map((step) => (
              <div key={step.num}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: step.dot,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ ...mono, fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>
                    {step.num}
                  </span>
                </div>
                <p
                  style={{
                    ...mono,
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.6)",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    marginTop: "8px",
                  }}
                >
                  {step.title}
                </p>
                <p
                  style={{
                    ...mono,
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.3)",
                    marginTop: "8px",
                    lineHeight: 1.6,
                  }}
                >
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section 4 - The ledger ─── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          padding: "80px 0",
        }}
      >
        <div
          style={{
            maxWidth: "1152px",
            margin: "0 auto",
            padding: "0 32px",
            width: "100%",
          }}
        >
          <p
            style={{
              ...mono,
              fontSize: "11px",
              color: "#3FB57A",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              marginBottom: "24px",
            }}
          >
            03: THE LEDGER
          </p>

          <h2
            style={{
              ...heading,
              fontWeight: 700,
              color: "#F5F0E8",
              lineHeight: 1.15,
            }}
            className="text-4xl md:text-5xl"
          >
            The trail wrote itself.
          </h2>

          <p
            style={{
              ...mono,
              fontSize: "13px",
              color: "rgba(255,255,255,0.4)",
              marginTop: "24px",
              maxWidth: "448px",
              lineHeight: 1.7,
            }}
          >
            Every request. Every verdict. Every human decision. Written to Band.
            No second database. No one can erase it.
          </p>

          {/* Mini ledger table */}
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "2px",
              overflow: "hidden",
              marginTop: "32px",
              maxWidth: "768px",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr 90px 1fr",
                padding: "10px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {["AGENT", "ACTION", "VERDICT", "RULE"].map((h) => (
                <span
                  key={h}
                  style={{
                    ...mono,
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.2)",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                  }}
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {LEDGER_ROWS.map((row, i) => {
              const vs = verdictStyle[row.verdict];
              return (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr 90px 1fr",
                    padding: "14px 20px",
                    borderBottom:
                      i < LEDGER_ROWS.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                    borderLeft: `2px solid ${vs.leftBorder}`,
                    alignItems: "center",
                  }}
                >
                  <span style={{ ...mono, fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                    {row.agent}
                  </span>
                  <span style={{ ...mono, fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                    {row.action}
                    <span style={{ color: "rgba(255,255,255,0.2)", marginLeft: "8px" }}>
                      {row.params}
                    </span>
                  </span>
                  <span
                    style={{
                      ...mono,
                      fontSize: "10px",
                      color: vs.color,
                      border: `1px solid ${vs.border}`,
                      background: vs.bg,
                      padding: "3px 8px",
                      borderRadius: "2px",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      display: "inline-block",
                    }}
                  >
                    {row.verdict}
                  </span>
                  <span style={{ ...mono, fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>
                    {row.rule}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Section 5 - The diff ─── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          padding: "80px 0",
          background: "rgba(255,255,255,0.01)",
        }}
      >
        <div
          style={{
            maxWidth: "1152px",
            margin: "0 auto",
            padding: "0 32px",
            width: "100%",
          }}
        >
          <p
            style={{
              ...mono,
              fontSize: "11px",
              color: "#E8503A",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              marginBottom: "24px",
            }}
          >
            04: THE DIFFERENCE
          </p>

          <h2
            style={{
              ...heading,
              fontWeight: 700,
              color: "#F5F0E8",
              lineHeight: 1.15,
            }}
            className="text-4xl md:text-5xl"
          >
            Without Airlock, all of this executes.
          </h2>

          <p
            style={{
              ...mono,
              fontSize: "13px",
              color: "rgba(255,255,255,0.4)",
              marginTop: "24px",
              maxWidth: "448px",
              lineHeight: 1.7,
            }}
          >
            Raw A2A has no governance layer. Agents execute tools directly.
            There is no gate, no trail, no way to know what happened.
          </p>

          {/* Two-column comparison */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0",
              marginTop: "48px",
              maxWidth: "640px",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
            className="demo-diff-col"
          >
            {/* Without */}
            <div style={{ padding: "32px 28px", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
              <p
                style={{
                  ...mono,
                  fontSize: "10px",
                  color: "#E8503A",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  marginBottom: "20px",
                }}
              >
                WITHOUT AIRLOCK
              </p>
              {["PII exported", "$75,000 wired", "Attacker account funded"].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "14px",
                  }}
                >
                  <span style={{ color: "#E8503A", fontSize: "13px" }}>✗</span>
                  <span style={{ ...mono, fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* With */}
            <div style={{ padding: "32px 28px" }}>
              <p
                style={{
                  ...mono,
                  fontSize: "10px",
                  color: "#3FB57A",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  marginBottom: "20px",
                }}
              >
                WITH AIRLOCK
              </p>
              {[
                "Export blocked at intent",
                "Transfer held at gate",
                "Attacker account never reached",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "14px",
                  }}
                >
                  <span style={{ color: "#3FB57A", fontSize: "13px" }}>✓</span>
                  <span style={{ ...mono, fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 6 - CTA ─── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 32px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            ...mono,
            fontSize: "11px",
            color: "#E8503A",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            marginBottom: "32px",
          }}
        >
          AIRLOCK IS LIVE
        </p>

        <h2
          style={{
            ...heading,
            fontWeight: 700,
            color: "#F5F0E8",
            lineHeight: 1.05,
            maxWidth: "800px",
          }}
          className="text-5xl md:text-7xl"
        >
          Nothing crosses ungoverned.
        </h2>

        {/* CTAs */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "48px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Link
            href="/observe"
            style={{
              padding: "13px 28px",
              background: "#10B981",
              color: "#ffffff",
              borderRadius: "2px",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              letterSpacing: "0.02em",
              transition: "background 0.18s ease",
              fontFamily: "var(--font-geist-sans), sans-serif",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#34D399")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#10B981")}
          >
            View the Live Ledger →
          </Link>

          <Link
            href="/#docs"
            style={{
              padding: "13px 28px",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.6)",
              borderRadius: "2px",
              fontSize: "13px",
              fontWeight: 400,
              textDecoration: "none",
              letterSpacing: "0.02em",
              transition: "color 0.18s ease, border-color 0.18s ease",
              fontFamily: "var(--font-geist-sans), sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
            }}
          >
            Read the Docs
          </Link>
        </div>

        <p
          style={{
            ...mono,
            fontSize: "11px",
            color: "rgba(255,255,255,0.2)",
            marginTop: "64px",
            letterSpacing: "0.08em",
          }}
        >
          © 2026 Airlock
        </p>
      </section>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 768px) {
          .demo-two-col   { grid-template-columns: 1fr !important; gap: 40px !important; }
          .demo-three-col { grid-template-columns: 1fr !important; gap: 28px !important; }
          .demo-diff-col  { grid-template-columns: 1fr !important; }
          .demo-diff-col > div:first-child {
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.08);
          }
        }
      `}</style>
    </div>
  );
}

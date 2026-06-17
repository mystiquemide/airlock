"use client";

import FadeUp from "./FadeUp";

const scenarios = [
  {
    num: "01",
    label: "COMPROMISED AGENT",
    body: "Tries to write customer PII to an external path.",
    verdict: "FORBIDDEN.",
    result: "Not executed. Policy matched block-exfiltration before the tool was called.",
  },
  {
    num: "02",
    label: "ROGUE PAYOUT",
    body: "Transfer instruction to an account not on the approved list.",
    verdict: "BLOCKED.",
    result: "Held at the airlock. Human notified. No funds moved.",
  },
  {
    num: "03",
    label: "LARGE TRANSFER",
    body: "Agent requests a $50,000 wire. Policy threshold requires sign-off.",
    verdict: "ESCALATED.",
    result: "Paused at the gate. @compliance-team mentioned in Band. Waiting on human approval.",
  },
];

export default function ThreatModel() {
  return (
    <section
      id="why-airlock"
      style={{
        background: "#0A0A0A",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "128px 0",
      }}
    >
      {/* Section label row */}
      <div
        data-tm-label
        style={{
          maxWidth: "1152px",
          margin: "0 auto",
          padding: "0 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "80px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: "11px",
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          THREAT MODEL
        </span>
        <span
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: "11px",
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          03 SCENARIOS
        </span>
      </div>

      {/* Headline */}
      <div
        style={{
          maxWidth: "1152px",
          margin: "0 auto",
          padding: "0 32px",
          marginBottom: "96px",
        }}
      >
        <FadeUp>
          <h2
            data-tm-headline
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 700,
              color: "#F5F0E8",
              lineHeight: 1.08,
              maxWidth: "768px",
              letterSpacing: "-1px",
            }}
          >
            The threat model made concrete.
          </h2>
        </FadeUp>
      </div>

      {/* Scenario rows */}
      <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 32px" }}>
        {scenarios.map((s, i) => (
          <FadeUp key={s.num} delay={0.1 * i}>
            <div
              data-tm-row
              className="scenario-row"
              style={{
                borderTop: "1px solid rgba(255,255,255,0.1)",
                borderBottom: i === scenarios.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none",
                padding: "48px 0",
              }}
            >
              {/* Number */}
              <div style={{ gridColumn: "1" }}>
                <span
                  style={{
                    fontFamily: "var(--font-geist-mono), monospace",
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.2)",
                    letterSpacing: "0.1em",
                    paddingTop: "4px",
                    display: "block",
                  }}
                >
                  {s.num}
                </span>
              </div>

              {/* Threat description */}
              <div style={{ gridColumn: "2 / span 6" }}>
                <p
                  style={{
                    fontFamily: "var(--font-geist-mono), monospace",
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.3)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: "12px",
                  }}
                >
                  {s.label}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: "clamp(20px, 2.5vw, 30px)",
                    fontWeight: 500,
                    color: "#F5F0E8",
                    lineHeight: 1.3,
                  }}
                >
                  {s.body}
                </p>
              </div>

              {/* Verdict */}
              <div style={{ gridColumn: "9 / span 4" }}>
                <FadeUp delay={0.3}>
                  <p
                    data-tm-verdict
                    style={{
                      fontFamily: "var(--font-space-grotesk), sans-serif",
                      fontSize: "clamp(20px, 2.5vw, 30px)",
                      fontWeight: 700,
                      color: "#E8503A",
                      lineHeight: 1.3,
                    }}
                  >
                    {s.verdict}
                  </p>
                </FadeUp>
                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.3)",
                    lineHeight: 1.7,
                    marginTop: "12px",
                  }}
                >
                  {s.result}
                </p>
              </div>
            </div>
          </FadeUp>
        ))}
      </div>

      <style>{`
        .scenario-row {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 32px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .scenario-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .scenario-row > div {
            grid-column: auto !important;
          }
        }
      `}</style>
    </section>
  );
}

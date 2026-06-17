"use client";

import FadeUp from "./FadeUp";

const steps = [
  {
    num: "01",
    title: "Agent sends an action request",
    body: "No tools, no access. Intent only.",
  },
  {
    num: "02",
    title: "Warden evaluates policy",
    body: "Real-time verdict. First-match wins. No LLM in the loop.",
  },
  {
    num: "03",
    title: "Human gates what policy can't",
    body: "@mention in Band. Approve or deny in the UI. Decision logged immediately.",
  },
  {
    num: "04",
    title: "Band writes the ledger",
    body: "Immutable trail. Every verdict, every human decision, one history.",
  },
];

export default function HowItWorks() {
  return (
    <section
      style={{
        background: "#0A0A0A",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "128px 0",
      }}
    >
      {/* Section label row */}
      <FadeUp>
        <div
          data-hiw-label
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
              fontWeight: 400,
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            HOW IT WORKS
          </span>
          <span
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "11px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            04 STEPS
          </span>
        </div>
      </FadeUp>

      {/* Headline block */}
      <div
        style={{
          maxWidth: "1152px",
          margin: "0 auto",
          padding: "0 32px",
          marginBottom: "96px",
        }}
      >
        <FadeUp delay={0.1}>
          <h2
            data-hiw-headline
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 700,
              color: "#F5F0E8",
              lineHeight: 1.08,
              maxWidth: "896px",
              letterSpacing: "-1px",
              marginBottom: "24px",
            }}
          >
            Governance that writes its own audit trail.
          </h2>
        </FadeUp>
        <p
          data-hiw-subline
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.4)",
            maxWidth: "336px",
            lineHeight: 1.75,
            letterSpacing: "0.03em",
          }}
        >
          Every request, verdict, and human decision logged to Band. No second database.
        </p>
      </div>

      {/* Accent line */}
      <div
        style={{
          maxWidth: "1152px",
          margin: "0 auto",
          padding: "0 32px",
        }}
      >
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: "64px",
            paddingBottom: "0",
          }}
        />
      </div>

      {/* 4-step grid */}
      <div
        style={{
          maxWidth: "1152px",
          margin: "0 auto",
          padding: "0 32px",
        }}
      >
        <div className="steps-grid" data-hiw-steps>
          {steps.map((s, i) => (
            <FadeUp key={s.num} delay={0.1 * i}>
              <div
                data-hiw-step
                style={{
                  borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.1)",
                  paddingLeft: i === 0 ? "0" : "24px",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-geist-mono), monospace",
                    fontSize: "11px",
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.2)",
                    letterSpacing: "0.15em",
                    marginBottom: "24px",
                  }}
                >
                  {s.num}
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.8)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: "12px",
                    lineHeight: 1.4,
                  }}
                >
                  {s.title}
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.3)",
                    lineHeight: 1.7,
                  }}
                >
                  {s.body}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>

      <style>{`
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
        }
        @media (max-width: 768px) {
          .steps-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
          .steps-grid > div {
            border-left: none !important;
            padding-left: 0 !important;
          }
        }
        @media (max-width: 480px) {
          .steps-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}

"use client";

import Link from "next/link";
import FadeUp from "./FadeUp";

export default function CTABlock() {
  return (
    <section
      id="demo"
      style={{
        background: "#0A0A0A",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "160px 0",
      }}
    >
      <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 32px" }}>

        {/* Coral accent line */}
        <FadeUp>
          <p
            data-cta-label
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "11px",
              color: "#E8503A",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: "32px",
            }}
          >
            AIRLOCK IS LIVE
          </p>
        </FadeUp>

        {/* Headline */}
        <FadeUp delay={0.1}>
          <h2
            data-cta-headline
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 700,
              color: "#F5F0E8",
              lineHeight: 1.08,
              maxWidth: "768px",
              letterSpacing: "-1px",
              marginBottom: "0",
            }}
          >
            Your agents are already running.
          </h2>
        </FadeUp>

        {/* Subline */}
        <FadeUp delay={0.2}>
          <p
            data-cta-subline
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.4)",
              maxWidth: "336px",
              lineHeight: 1.75,
              letterSpacing: "0.03em",
              marginTop: "24px",
            }}
          >
            The question is who&apos;s watching the door.
          </p>
        </FadeUp>

        {/* CTA row */}
        <FadeUp delay={0.3}>
        <div
          data-cta-buttons
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginTop: "48px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/observe"
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
            View the Compliance Ledger →
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
            Read the Docs
          </Link>
        </div>
        </FadeUp>

      </div>
    </section>
  );
}

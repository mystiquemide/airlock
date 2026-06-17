"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const cornerStats = [
  { label: "POLICIES ACTIVE", counter: "142",    target: 142,   decimals: 0, comma: false, suffix: ""   },
  { label: "AVG VERDICT",     counter: "11MS",   target: 11,    decimals: 0, comma: false, suffix: "MS" },
  { label: "ACTIONS BLOCKED", counter: "3,847",  target: 3847,  decimals: 0, comma: true,  suffix: ""   },
  { label: "HUMAN GATES",     counter: "99.97%", target: 99.97, decimals: 2, comma: false, suffix: "%"  },
];

const statPos = [
  { top: "80px",    left: "32px"  },
  { top: "80px",    right: "32px" },
  { bottom: "32px", left: "32px"  },
  { bottom: "32px", right: "32px" },
];

export default function Hero() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Background image + overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/hero-bg.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{
            animation: "kenburns 20s ease-in-out infinite",
            transformOrigin: "center center",
            willChange: "transform",
          }}
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Corner stats */}
      {cornerStats.map((s, i) => (
        <motion.div
          key={s.label}
          data-hero-stat
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            position: "absolute",
            zIndex: 20,
            ...statPos[i],
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "10px",
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            {s.label}
          </span>
          <span
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "14px",
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1,
            }}
          >
            {s.counter}
          </span>
        </motion.div>
      ))}

      {/* Hero content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
          width: "100%",
        }}
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.05 }}
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: "14px",
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          Nothing crosses ungoverned.
        </motion.p>

        <motion.h1
          data-hero-headline
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: "clamp(48px, 7vw, 72px)",
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.08,
            maxWidth: "896px",
            margin: "0 auto",
            letterSpacing: "-1px",
          }}
        >
          The governance layer your agent swarm can&apos;t bypass.
        </motion.h1>

        <motion.p
          data-hero-subline
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          style={{
            fontSize: "clamp(14px, 1.5vw, 16px)",
            color: "rgba(255,255,255,0.5)",
            textAlign: "center",
            lineHeight: 1.7,
            maxWidth: "576px",
            margin: "24px auto 0",
            letterSpacing: "0.03em",
          }}
        >
          Policy evaluated in real time. Human gates for high-stakes actions. Immutable audit trail written to Band.
        </motion.p>

        <motion.div
          data-hero-ctas
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginTop: "40px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/login"
            style={{
              padding: "10px 22px",
              background: "#10B981",
              color: "#ffffff",
              borderRadius: "2px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              letterSpacing: "0.02em",
              transition: "background 0.18s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#34D399")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#10B981")}
          >
            See It Block a Rogue Agent
          </Link>
          <Link
            href="/login"
            style={{
              padding: "9px 22px",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "rgba(255,255,255,0.7)",
              borderRadius: "2px",
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
              letterSpacing: "0.02em",
              transition: "border-color 0.18s ease, color 0.18s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,1)";
              e.currentTarget.style.color = "rgba(255,255,255,1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
              e.currentTarget.style.color = "rgba(255,255,255,0.7)";
            }}
          >
            View the Ledger
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

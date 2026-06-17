"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";

const mono    = { fontFamily: "var(--font-geist-mono), monospace" };
const heading = { fontFamily: "var(--font-space-grotesk), sans-serif" };

const cornerStats = [
  { label: "POLICIES ACTIVE", value: "142",     pos: { top: "32px",    left: "32px"  } },
  { label: "AVG VERDICT",     value: "11MS",    pos: { top: "32px",    right: "32px" } },
  { label: "ACTIONS BLOCKED", value: "3,847",   pos: { bottom: "32px", left: "32px"  } },
  { label: "HUMAN GATES",     value: "99.97%",  pos: { bottom: "32px", right: "32px" } },
];

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  function handleEnter() {
    Cookies.set("airlock_session", "demo_user", { expires: 1 });
    Cookies.set("airlock_user", email, { expires: 1 });
    router.push(searchParams.get("from") || "/dashboard");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/hero-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.70)" }} />

      {/* Back link */}
      <Link
        href="/"
        style={{
          ...mono,
          position: "absolute",
          top: "24px",
          left: "24px",
          zIndex: 30,
          fontSize: "11px",
          color: "rgba(255,255,255,0.55)",
          textDecoration: "none",
          letterSpacing: "0.08em",
          transition: "color 0.2s, background 0.2s",
          background: "rgba(0,0,0,0.55)",
          border: "1px solid rgba(255,255,255,0.10)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          padding: "6px 12px",
          borderRadius: "2px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "rgba(255,255,255,1)";
          e.currentTarget.style.background = "rgba(0,0,0,0.75)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "rgba(255,255,255,0.55)";
          e.currentTarget.style.background = "rgba(0,0,0,0.55)";
        }}
      >
        ← Back to Airlock
      </Link>

      {/* Corner stats */}
      {cornerStats.map((s) => (
        <div
          key={s.label}
          style={{ position: "absolute", ...s.pos, zIndex: 10 }}
        >
          <p style={mono} className="text-xs uppercase tracking-widest text-white/20 mb-1">
            {s.label}
          </p>
          <p style={mono} className="text-sm font-bold text-white/30">
            {s.value}
          </p>
        </div>
      ))}

      {/* Login card */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "448px",
          margin: "0 auto",
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(0,0,0,0.60)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderRadius: "2px",
          padding: "40px",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", marginBottom: "32px" }}
        >
          <Image src="/logo.png" alt="Airlock" width={24} height={24} style={{ objectFit: "contain" }} />
          <span
            style={{
              ...heading,
              fontSize: "14px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            AIRLOCK
          </span>
        </Link>

        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: "32px" }} />

        {/* Headline */}
        <h1 style={{ ...heading, fontSize: "24px", fontWeight: 700, color: "#F5F0E8", marginBottom: "8px" }}>
          Access the console.
        </h1>
        <p style={mono} className="text-xs text-white/30 mb-8">
          Governance membrane for unbounded agents.
        </p>

        {/* Email */}
        <div className="mb-6">
          <label style={mono} className="text-xs uppercase tracking-widest text-white/20 mb-2 block">
            EMAIL
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full bg-transparent border border-white/10 text-white text-sm px-4 py-3 rounded-sm placeholder:text-white/20 focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Password */}
        <div>
          <label style={mono} className="text-xs uppercase tracking-widest text-white/20 mb-2 block">
            PASSWORD
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-transparent border border-white/10 text-white text-sm px-4 py-3 rounded-sm placeholder:text-white/20 focus:outline-none focus:border-white/30"
            onKeyDown={(e) => e.key === "Enter" && handleEnter()}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleEnter}
          style={{ borderRadius: "2px", fontFamily: "var(--font-geist-sans), sans-serif" }}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-medium text-sm py-3 mt-6 cursor-pointer transition-colors"
        >
          Enter the Airlock →
        </button>
        <p className="text-xs font-mono text-white/20 text-center mt-4">
          Demo mode. Any credentials accepted.
        </p>

        {/* Footer */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: "32px", paddingTop: "24px" }}>
          <p style={mono} className="text-xs text-white/20 text-center">
            Need access? Contact your Airlock admin.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

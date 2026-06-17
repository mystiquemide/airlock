"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const links = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Why Airlock",  href: "#why-airlock"  },
  { label: "Scenario",     href: "/demo"          },
  { label: "Docs",         href: "#docs"          },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: scrolled ? "rgba(0,0,0,0.7)" : "transparent",
        backdropFilter: scrolled ? "blur(8px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(8px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
        transition: "background 0.3s ease, backdrop-filter 0.3s ease, border-color 0.3s ease",
      }}
    >
      <nav
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 40px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo + wordmark */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <Image src="/logo.png" alt="Airlock" width={26} height={26} style={{ objectFit: "contain" }} />
          <span
            style={{
              fontFamily: "var(--font-space-grotesk), monospace",
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

        {/* Center nav links - desktop */}
        <ul
          style={{
            display: "flex",
            alignItems: "center",
            gap: "36px",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
          className="nav-links-desktop"
        >
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                style={{
                  fontSize: "13px",
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.6)",
                  textDecoration: "none",
                  letterSpacing: "0.06em",
                  transition: "color 0.18s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,1)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA + hamburger wrapper */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* CTA - desktop */}
          <Link
            href="/login"
            style={{
              padding: "7px 16px",
              background: "#10B981",
              color: "#ffffff",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              letterSpacing: "0.02em",
              transition: "background 0.18s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#34D399")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#10B981")}
            className="cta-desktop"
          >
            Start Building →
          </Link>

          {/* Hamburger - mobile only */}
          <button
            onClick={() => setOpen((o) => !o)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.7)",
              cursor: "pointer",
              padding: "4px",
              lineHeight: 1,
            }}
            className="hamburger"
            aria-label="Toggle menu"
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div
          style={{
            background: "rgba(0,0,0,0.9)",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            padding: "16px 40px 20px",
          }}
          className="mobile-menu"
        >
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.6)",
                    textDecoration: "none",
                    letterSpacing: "0.06em",
                  }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                style={{
                  display: "inline-block",
                  padding: "8px 18px",
                  background: "#10B981",
                  color: "#ffffff",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Start Building →
              </Link>
            </li>
          </ul>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .cta-desktop { display: none !important; }
          .hamburger { display: block !important; }
        }
      `}</style>
    </header>
  );
}

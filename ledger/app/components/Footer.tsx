"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import FadeUp from "./FadeUp";

const productLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Why Airlock",  href: "#why-airlock"  },
  { label: "Scenario",     href: "/demo"          },
  { label: "Docs",         href: "#docs"          },
];

const resourceLinks = [
  { label: "Documentation",   href: "#docs"      },
  { label: "Policy Reference", href: "#policy"   },
  { label: "Band Integration", href: "#band"     },
  { label: "Changelog",        href: "#changelog" },
];

const partners = [
  { name: "Band",          src: "/logos/band.png",        invert: false, href: "https://band.ai"          },
  { name: "Featherless AI", src: "/logos/featherless.png", invert: true,  href: "https://featherless.ai"   },
  { name: "LabLab.ai",     src: "/logos/lablab.png",       invert: true,  href: "https://lablab.ai"        },
];

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      style={{
        display: "block",
        fontSize: "14px",
        color: hovered ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.4)",
        textDecoration: "none",
        marginBottom: "8px",
        transition: "color 0.18s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </Link>
  );
}

export default function Footer() {
  const [ghHovered, setGhHovered] = useState(false);

  return (
    <footer
      id="docs"
      data-footer
      style={{
        background: "#0A0A0A",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        padding: "80px 0 48px",
      }}
    >
      <FadeUp>
      <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 32px" }}>

        {/* Top 4-column row */}
        <div className="footer-grid" style={{ marginBottom: "64px" }}>

          {/* Col 1 - Brand */}
          <div data-footer-col>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "12px" }}>
              <Image src="/logo.png" alt="Airlock" width={22} height={22} style={{ objectFit: "contain" }} />
              <span
                style={{
                  fontFamily: "var(--font-space-grotesk), monospace",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#ffffff",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                AIRLOCK
              </span>
            </Link>
            <p
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.3)",
                lineHeight: 1.6,
                maxWidth: "160px",
              }}
            >
              Governance membrane for unbounded agents.
            </p>
          </div>

          {/* Col 2 - Product */}
          <div data-footer-col>
            <p
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: "10px",
                color: "rgba(255,255,255,0.2)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              PRODUCT
            </p>
            {productLinks.map((l) => (
              <NavLink key={l.href} href={l.href}>{l.label}</NavLink>
            ))}
          </div>

          {/* Col 3 - Resources */}
          <div data-footer-col>
            <p
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: "10px",
                color: "rgba(255,255,255,0.2)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              RESOURCES
            </p>
            {resourceLinks.map((l) => (
              <NavLink key={l.label} href={l.href}>{l.label}</NavLink>
            ))}
          </div>

          {/* Col 4 - Connect */}
          <div data-footer-col>
            <p
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: "10px",
                color: "rgba(255,255,255,0.2)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              CONNECT
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <a
                href="https://github.com/mystiquemide/airlock"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View Airlock on GitHub"
                style={{
                  color: ghHovered ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.4)",
                  transition: "color 0.18s ease",
                  display: "flex",
                }}
                onMouseEnter={() => setGhHovered(true)}
                onMouseLeave={() => setGhHovered(false)}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Built with row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: "32px",
            marginBottom: "48px",
            flexWrap: "wrap",
            gap: "24px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "10px",
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginRight: "8px",
              whiteSpace: "nowrap",
            }}
          >
            BUILT WITH
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            {partners.map((p) => (
              <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer" aria-label={p.name} style={{ display: "flex" }}>
                <Image
                  src={p.src}
                  alt={p.name}
                  width={28}
                  height={28}
                  style={{
                    objectFit: "contain",
                    filter: p.invert ? "invert(1)" : "none",
                    opacity: 0.3,
                    transition: "opacity 0.18s ease",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = "0.6")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = "0.3")}
                />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom copyright row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: "32px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "11px",
              color: "rgba(255,255,255,0.2)",
            }}
          >
            © 2026 Airlock. MIT License.
          </span>
          <span
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "11px",
              color: "rgba(255,255,255,0.2)",
            }}
          >
            Governance membrane for unbounded agents.
          </span>
        </div>

      </div>
      </FadeUp>

      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 48px;
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
}

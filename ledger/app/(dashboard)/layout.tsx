"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, ScrollText, Bot, Shield, Settings, LogOut } from "lucide-react";
import Cookies from "js-cookie";

const navLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Ledger",    href: "/ledger",    icon: ScrollText      },
  { label: "Agents",    href: "/agents",    icon: Bot             },
  { label: "Policy",    href: "/policy",    icon: Shield          },
  { label: "Settings",  href: "/settings",  icon: Settings        },
];

const getPageName = (path: string) => {
  if (path.includes('/ledger/')) return 'REQUEST DETAIL'
  if (path.includes('/agents/') && path.split('/').length > 2) return 'AGENT DETAIL'
  if (path.includes('/policy/edit')) return 'POLICY EDITOR'
  if (path.endsWith('/ledger')) return 'LEDGER'
  if (path.endsWith('/dashboard')) return 'DASHBOARD'
  if (path.endsWith('/agents')) return 'AGENTS'
  if (path.endsWith('/policy')) return 'POLICY'
  if (path.endsWith('/settings')) return 'SETTINGS'
  return 'CONSOLE'
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const pageName  = getPageName(pathname);
  const userEmail = Cookies.get("airlock_user");
  const avatarLetter = userEmail?.[0]?.toUpperCase() || "A";

  return (
    <div className="flex h-screen bg-[#0A0A0A] overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#0D0D0D] border-r border-white/5 h-screen flex flex-col">

        {/* Logo */}
        <div className="px-6 py-8">
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
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
        </div>
        <div className="border-b border-white/5 mb-6" />

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-3">
          {navLinks.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors",
                  isActive
                    ? "text-white bg-white/5 border-l-2 border-emerald-500"
                    : "text-white/40 hover:text-white hover:bg-white/5",
                ].join(" ")}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="mt-auto px-3 border-t border-white/5 pt-3">
          <button
            onClick={() => { Cookies.remove("airlock_session"); Cookies.remove("airlock_user"); router.push('/login'); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-white/20 hover:text-white hover:bg-white/5 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>

        {/* Bottom branding */}
        <div className="border-t border-white/5 p-6">
          <p
            style={{ fontFamily: "var(--font-geist-mono), monospace" }}
            className="text-xs text-white/20"
          >
            AIRLOCK
          </p>
          <p className="text-xs text-white/10 mt-1">Governance membrane</p>
        </div>
      </aside>

      {/* Right side */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="h-16 bg-[#0A0A0A] border-b border-white/5 flex items-center justify-between px-8 flex-shrink-0">
          <span
            style={{ fontFamily: "var(--font-geist-mono), monospace" }}
            className="text-sm text-white/40 uppercase tracking-widest"
          >
            {pageName}
          </span>
          <div className="flex items-center gap-3">
            <span
              style={{ fontFamily: "var(--font-geist-mono), monospace" }}
              className="text-xs text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-sm"
            >
              LIVE
            </span>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/40">
              {avatarLetter}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

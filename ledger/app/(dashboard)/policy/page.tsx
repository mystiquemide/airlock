"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ErrorBanner from "../../components/ErrorBanner";

const mono    = { fontFamily: "var(--font-geist-mono), monospace" };
const heading = { fontFamily: "var(--font-space-grotesk), sans-serif" };

interface Rule {
  name: string;
  action_type: string;
  verdict: "allow" | "deny" | "human";
  when?: Record<string, unknown>;
}

interface Policy {
  version: string;
  fail_closed: boolean;
  rules: Rule[];
  total: number;
}

const verdictBadge: Record<Rule["verdict"], string> = {
  allow: "text-emerald-400 border border-emerald-400/30 bg-emerald-400/5",
  deny:  "text-[#E8503A] border border-[#E8503A]/30 bg-[#E8503A]/5",
  human: "text-yellow-400 border border-yellow-400/30 bg-yellow-400/5",
};

const verdictLabel: Record<Rule["verdict"], string> = {
  allow: "ALLOW",
  deny:  "DENY",
  human: "HUMAN GATE",
};

export default function PolicyPage() {
  const router = useRouter();

  const [policy, setPolicy]   = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  const fetchPolicy = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res  = await fetch("/api/policy");
      if (!res.ok) throw new Error("non-ok");
      const data = await res.json();
      if (data.error) throw new Error(data.code ?? "policy error");
      setPolicy(data as Policy);
    } catch (_) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPolicy(); }, [fetchPolicy]);

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100%" }}>
      <div className="max-w-4xl mx-auto px-8 pt-12 pb-16">

        {/* Page header */}
        <p style={mono} className="text-xs uppercase tracking-widest text-white/20 mb-4">
          POLICY ENGINE
        </p>
        <h1 style={heading} className="text-4xl font-bold text-[#F5F0E8]">
          The rules the Warden enforces.
        </h1>
        <p className="text-sm text-white/40 mt-2 mb-4">
          First-match evaluation. Fail-closed default. Every rule below is active.
        </p>

        {/* Policy meta bar */}
        <div className="flex items-center justify-between border border-white/10 bg-white/5 px-6 py-4 rounded-sm mb-12">
          <div className="flex items-center gap-8">
            <div>
              <p style={mono} className="text-xs uppercase tracking-widest text-white/20 mb-1">VERSION</p>
              <p style={mono} className="text-sm text-white/60">{policy ? policy.version : "-"}</p>
            </div>
            <div>
              <p style={mono} className="text-xs uppercase tracking-widest text-white/20 mb-1">RULES</p>
              <p style={mono} className="text-sm text-white/60">{policy ? policy.total : "-"}</p>
            </div>
            <div>
              <p style={mono} className="text-xs uppercase tracking-widest text-white/20 mb-1">FAIL CLOSED</p>
              <p style={mono} className={`text-sm ${policy?.fail_closed ? "text-emerald-400" : "text-white/60"}`}>
                {policy ? (policy.fail_closed ? "ENABLED" : "DISABLED") : "-"}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => router.push("/policy/edit")}
              style={{ borderRadius: "2px", border: "1px solid rgba(255,255,255,0.2)", ...mono }}
              className="text-xs text-white/60 hover:text-white px-4 py-2 transition-colors"
            >
              Edit Policy → (Admin only)
            </button>
            <span className="text-[10px] font-mono text-yellow-400 border border-yellow-400/30 px-1.5 py-0.5 rounded-sm ml-2">
              ADMIN
            </span>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <p style={mono} className="text-xs text-white/20 text-center py-12">LOADING POLICY...</p>
        )}

        {/* Error */}
        {!loading && error && (
          <ErrorBanner message="COULD NOT LOAD POLICY FILE" onRetry={fetchPolicy} />
        )}

        {/* Rules list */}
        {!loading && !error && policy && (
          <>
            <p style={mono} className="text-xs text-white/20 mb-4">
              EVALUATION ORDER: first match wins. Rules evaluated top to bottom.
            </p>

            <div>
              {policy.rules.map((rule, i) => (
                <div key={rule.name} className="border border-white/10 rounded-sm mb-3 overflow-hidden">

                  {/* Rule header */}
                  <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <span style={mono} className="text-xs text-white/20">{String(i + 1).padStart(2, "0")}</span>
                      <span style={mono} className="text-sm text-white/80">{rule.name}</span>
                    </div>
                    <span
                      style={mono}
                      className={`text-xs px-2 py-1 rounded-sm ${verdictBadge[rule.verdict]}`}
                    >
                      {verdictLabel[rule.verdict]}
                    </span>
                  </div>

                  {/* Rule body */}
                  <div className="px-6 py-4">
                    <p style={mono} className="text-xs uppercase tracking-widest text-white/20 mb-3">
                      MATCH CONDITIONS
                    </p>
                    <div className="flex gap-6 flex-wrap">
                      <div>
                        <span style={mono} className="text-xs text-white/20">ACTION</span>
                        <span style={mono} className="text-xs text-white/50 ml-2">{rule.action_type}</span>
                      </div>
                      {rule.when && Object.entries(rule.when).map(([k, v]) => (
                        <div key={k}>
                          <span style={mono} className="text-xs text-white/20">{k.toUpperCase().replace(/_/g, " ")}</span>
                          <span style={mono} className="text-xs text-white/50 ml-2">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

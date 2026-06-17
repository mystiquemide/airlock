"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import ErrorBanner from "../../../components/ErrorBanner";

const mono    = { fontFamily: "var(--font-geist-mono), monospace" };
const heading = { fontFamily: "var(--font-space-grotesk), sans-serif" };

type SaveStatus = "idle" | "saving" | "saved" | "error";

const ADMIN_PIN = "1045";

export default function PolicyEditPage() {
  const router = useRouter();

  const [unlocked, setUnlocked]     = useState(false);
  const [pin, setPin]               = useState("");
  const [pinError, setPinError]     = useState(false);

  const [original, setOriginal]     = useState("");
  const [content, setContent]       = useState("");
  const [loading, setLoading]       = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [discarded, setDiscarded]   = useState(false);

  function handlePinSubmit() {
    if (pin === ADMIN_PIN) {
      setUnlocked(true);
    } else {
      setPinError(true);
      setPin("");
      setTimeout(() => setPinError(false), 2000);
    }
  }

  useEffect(() => {
    async function fetchYaml() {
      setLoading(true);
      try {
        const res  = await fetch("/api/policy");
        const data = await res.json();
        const raw  = data.raw as string;
        setOriginal(raw);
        setContent(raw);
      } catch (_) {
        setOriginal("");
        setContent("");
      } finally {
        setLoading(false);
      }
    }
    fetchYaml();
  }, []);

  const hasChanges = content !== original;

  async function handleSave() {
    setSaveStatus("saving");
    setDiscarded(false);
    try {
      const res = await fetch("/api/policy", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ yaml: content }),
      });
      if (!res.ok) throw new Error("save failed");
      setSaveStatus("saved");
      setOriginal(content);
      setTimeout(() => {
        setSaveStatus("idle");
        router.push("/policy");
      }, 2000);
    } catch (_) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }

  function handleDiscard() {
    setContent(original);
    setSaveStatus("idle");
    setDiscarded(true);
    setTimeout(() => setDiscarded(false), 2000);
  }

  if (!unlocked) {
    return (
      <div style={{ background: "#0A0A0A" }} className="flex flex-col items-center justify-center min-h-screen">
        <p style={mono} className="text-xs text-white/20 uppercase tracking-widest mb-6">
          ADMIN ACCESS REQUIRED
        </p>
        <h1 style={heading} className="text-2xl font-bold text-[#F5F0E8] mb-8">
          Enter admin PIN to edit policy.
        </h1>
        <input
          type="password"
          value={pin}
          maxLength={4}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
          placeholder="••••"
          style={mono}
          className="text-center text-2xl tracking-widest bg-transparent border border-white/10 text-white w-48 py-4 rounded-sm focus:outline-none focus:border-white/30 mb-4 placeholder:text-white/20"
        />
        {pinError && (
          <p style={mono} className="text-xs text-[#E8503A] mb-4">INCORRECT PIN</p>
        )}
        <button
          onClick={handlePinSubmit}
          style={{ borderRadius: "2px", fontFamily: "var(--font-geist-sans), sans-serif" }}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-medium text-sm px-8 py-3 transition-colors mb-6"
        >
          Enter →
        </button>
        <button
          onClick={() => router.push("/policy")}
          style={mono}
          className="text-xs text-white/20 hover:text-white transition-colors"
        >
          ← Back to Policy
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100%" }}>
      <div className="max-w-4xl mx-auto px-8 pt-12 pb-16">

        {/* Page header */}
        <p style={mono} className="text-xs uppercase tracking-widest text-white/20 mb-4">
          POLICY EDITOR
        </p>
        <h1 style={heading} className="text-4xl font-bold text-[#F5F0E8]">
          Edit the ruleset.
        </h1>
        <p className="text-sm text-white/40 mt-2 mb-12">
          Changes take effect immediately. Warden reloads policy on save.
        </p>

        {/* Warning bar */}
        <div className="flex items-center gap-3 border border-yellow-400/30 bg-yellow-400/5 px-6 py-4 rounded-sm mb-8">
          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <p style={mono} className="text-xs text-yellow-400">
            This page is restricted to Airlock administrators. Changes to policy affect all active agents immediately. Review before saving.
          </p>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/policy")}
            className="flex items-center gap-2 text-white/30 hover:text-white transition-colors"
            style={mono}
          >
            <ArrowLeft className="w-3 h-3" />
            <span className="text-xs uppercase tracking-widest">Back to Policy</span>
          </button>

          <div className="flex items-center gap-3">
            {/* Status messages */}
            {saveStatus === "saved" && (
              <p style={mono} className="text-xs text-emerald-400">SAVED. WARDEN RELOADING...</p>
            )}
            {saveStatus === "error" && null}
            {discarded && saveStatus === "idle" && (
              <p style={mono} className="text-xs text-white/40">CHANGES DISCARDED</p>
            )}
            {hasChanges && saveStatus === "idle" && !discarded && (
              <p style={mono} className="text-xs text-yellow-400">UNSAVED CHANGES</p>
            )}

            <button
              onClick={handleDiscard}
              disabled={!hasChanges || saveStatus === "saving"}
              style={{ borderRadius: "2px", border: "1px solid rgba(255,255,255,0.2)", ...mono }}
              className="text-sm text-white/40 hover:text-white px-6 py-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saveStatus === "saving" || saveStatus === "saved"}
              style={{ borderRadius: "2px", fontFamily: "var(--font-geist-sans), sans-serif" }}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-medium text-sm px-6 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveStatus === "saving" ? "SAVING..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Save error */}
        {saveStatus === "error" && (
          <div className="mb-4">
            <ErrorBanner message="INVALID YAML - CHECK SYNTAX BEFORE SAVING" />
          </div>
        )}

        {/* YAML editor */}
        {loading ? (
          <p style={mono} className="text-xs text-white/20 text-center py-12">LOADING POLICY...</p>
        ) : (
          <textarea
            value={content}
            onChange={(e) => { setContent(e.target.value); setDiscarded(false); }}
            spellCheck={false}
            style={{
              ...mono,
              width: "100%",
              minHeight: "600px",
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.80)",
              fontSize: "14px",
              padding: "24px",
              borderRadius: "2px",
              resize: "vertical",
              outline: "none",
              lineHeight: "1.6",
            }}
            onFocus={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.30)"; }}
            onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.10)"; }}
          />
        )}

      </div>
    </div>
  );
}

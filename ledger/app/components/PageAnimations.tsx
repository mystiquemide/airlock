"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SCROLLER = "[data-scroll-container]";

function splitWords(el: Element): NodeListOf<Element> {
  const text = el.textContent || "";
  el.innerHTML = text
    .trim()
    .split(/\s+/)
    .map(
      (w) =>
        `<span style="display:inline-block;overflow:hidden;vertical-align:bottom"><span class="w-inner" style="display:inline-block">${w}</span></span>`
    )
    .join(" ");
  return el.querySelectorAll(".w-inner");
}

function initAnimations() {
  const scroller = SCROLLER;

  // ─── HERO (page load, no scroll trigger) ───────────────────────────────────

  const heroHeadline = document.querySelector("[data-hero-headline]");
  if (heroHeadline) {
    const words = splitWords(heroHeadline);
    gsap.fromTo(words,
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 1, ease: "power3.out", delay: 0.3 }
    );
  }

  gsap.fromTo("[data-hero-subline]",
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.9, ease: "power2.out", delay: 0.9 }
  );

  gsap.fromTo("[data-hero-ctas]",
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 1.1 }
  );

  gsap.fromTo("[data-hero-stat]",
    { opacity: 0 },
    { opacity: 1, duration: 1.2, delay: 0.8 }
  );

  // Corner stat counters
  document.querySelectorAll("[data-counter]").forEach((el) => {
    const target = parseFloat(el.getAttribute("data-counter") || "0");
    const decimals = parseInt(el.getAttribute("data-counter-decimals") || "0");
    const suffix = el.getAttribute("data-counter-suffix") || "";
    const comma = el.hasAttribute("data-counter-comma");
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 1.5,
      delay: 0.8,
      ease: "power2.out",
      onUpdate() {
        const n =
          decimals > 0
            ? obj.val.toFixed(decimals)
            : comma
            ? Math.floor(obj.val).toLocaleString()
            : String(Math.floor(obj.val));
        el.textContent = n + suffix;
      },
    });
  });

  // ─── POLICY BLOCK ──────────────────────────────────────────────────────────

  gsap.fromTo("[data-policy-label]",
    { opacity: 0 },
    { opacity: 1, duration: 0.6,
      scrollTrigger: { trigger: "[data-policy-label]", scroller, start: "top 95%", once: true } }
  );

  const policyHeadline = document.querySelector("[data-policy-headline]");
  if (policyHeadline) {
    const words = splitWords(policyHeadline);
    gsap.fromTo(words,
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.06, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: policyHeadline, scroller, start: "top 90%", once: true } }
    );
  }

  gsap.fromTo("[data-policy-subline]",
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7, delay: 0.1,
      scrollTrigger: { trigger: "[data-policy-subline]", scroller, start: "top 95%", once: true } }
  );

  gsap.fromTo("[data-policy-bullet]",
    { x: -30, opacity: 0 },
    { x: 0, opacity: 1, stagger: 0.12, duration: 0.7, ease: "power2.out",
      scrollTrigger: { trigger: "[data-policy-bullets]", scroller, start: "top 95%", once: true } }
  );

  gsap.fromTo("[data-policy-ctas]",
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7, delay: 0.2,
      scrollTrigger: { trigger: "[data-policy-ctas]", scroller, start: "top 95%", once: true } }
  );

  gsap.fromTo("[data-policy-code]",
    { x: 60, opacity: 0 },
    { x: 0, opacity: 1, duration: 1, ease: "power2.out",
      scrollTrigger: { trigger: "[data-policy-code]", scroller, start: "top 90%", once: true } }
  );

  // ─── HOW IT WORKS ──────────────────────────────────────────────────────────

  gsap.fromTo("[data-hiw-label]",
    { opacity: 0 },
    { opacity: 1, duration: 0.6,
      scrollTrigger: { trigger: "[data-hiw-label]", scroller, start: "top 95%", once: true } }
  );

  const hiwHeadline = document.querySelector("[data-hiw-headline]");
  if (hiwHeadline) {
    const words = splitWords(hiwHeadline);
    gsap.fromTo(words,
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.07, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: hiwHeadline, scroller, start: "top 90%", once: true } }
    );
  }

  gsap.fromTo("[data-hiw-subline]",
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7,
      scrollTrigger: { trigger: "[data-hiw-subline]", scroller, start: "top 95%", once: true } }
  );

  gsap.fromTo("[data-hiw-step]",
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.15, duration: 0.8, ease: "power2.out",
      scrollTrigger: { trigger: "[data-hiw-steps]", scroller, start: "top 90%", once: true } }
  );

  // ─── THREAT MODEL ──────────────────────────────────────────────────────────

  gsap.fromTo("[data-tm-label]",
    { opacity: 0 },
    { opacity: 1, duration: 0.6,
      scrollTrigger: { trigger: "[data-tm-label]", scroller, start: "top 95%", once: true } }
  );

  const tmHeadline = document.querySelector("[data-tm-headline]");
  if (tmHeadline) {
    const words = splitWords(tmHeadline);
    gsap.fromTo(words,
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: tmHeadline, scroller, start: "top 90%", once: true } }
    );
  }

  document.querySelectorAll("[data-tm-row]").forEach((row) => {
    gsap.fromTo(row,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "power2.out",
        scrollTrigger: { trigger: row, scroller, start: "top 90%", once: true } }
    );

    const verdict = row.querySelector("[data-tm-verdict]");
    if (verdict) {
      gsap.fromTo(verdict,
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "power3.inOut", delay: 0.3,
          scrollTrigger: { trigger: row, scroller, start: "top 90%", once: true } }
      );
    }
  });

  // ─── CTA SECTION ───────────────────────────────────────────────────────────

  gsap.fromTo("[data-cta-label]",
    { opacity: 0 },
    { opacity: 1, duration: 0.6,
      scrollTrigger: { trigger: "[data-cta-label]", scroller, start: "top 95%", once: true } }
  );

  const ctaHeadline = document.querySelector("[data-cta-headline]");
  if (ctaHeadline) {
    const words = splitWords(ctaHeadline);
    gsap.fromTo(words,
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.09, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: ctaHeadline, scroller, start: "top 90%", once: true } }
    );
  }

  gsap.fromTo("[data-cta-subline]",
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, delay: 0.3,
      scrollTrigger: { trigger: "[data-cta-subline]", scroller, start: "top 95%", once: true } }
  );

  gsap.fromTo("[data-cta-buttons]",
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, delay: 0.3,
      scrollTrigger: { trigger: "[data-cta-buttons]", scroller, start: "top 95%", once: true } }
  );

  // ─── FOOTER ────────────────────────────────────────────────────────────────

  gsap.fromTo("[data-footer]",
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.9, ease: "power2.out",
      scrollTrigger: { trigger: "[data-footer]", scroller, start: "top 95%", once: true } }
  );

  gsap.fromTo("[data-footer-col]",
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.1, duration: 0.7, ease: "power2.out",
      scrollTrigger: { trigger: "[data-footer]", scroller, start: "top 90%", once: true } }
  );

  ScrollTrigger.refresh();
  if ((window as any).__locoScroll) (window as any).__locoScroll.update();
}

export default function PageAnimations() {
  useEffect(() => {
    // Run after Locomotive Scroll signals ready
    const run = () => setTimeout(initAnimations, 100);
    window.addEventListener("locoReady", run, { once: true });

    // Fallback if loco is already ready
    if ((window as any).__locoScroll) run();

    return () => window.removeEventListener("locoReady", run);
  }, []);

  return null;
}

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let LocomotiveScroll: any;
    let locoScroll: any;

    (async () => {
      const mod = await import("locomotive-scroll");
      LocomotiveScroll = mod.default;

      locoScroll = new LocomotiveScroll({
        el: containerRef.current,
        smooth: true,
        multiplier: 0.8,
      });

      locoScroll.on("scroll", ScrollTrigger.update);

      ScrollTrigger.scrollerProxy(containerRef.current!, {
        scrollTop(value?: number) {
          if (arguments.length && value !== undefined) {
            locoScroll.scrollTo(value, { duration: 0, disableLerp: true });
          } else {
            return locoScroll.scroll.instance.scroll.y;
          }
        },
        getBoundingClientRect() {
          return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
        },
        pinType: containerRef.current?.style.transform ? "transform" : "fixed",
      });

      ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
      ScrollTrigger.refresh();

      // Expose on window so PageAnimations can sync after init
      (window as any).__locoScroll = locoScroll;
      window.dispatchEvent(new Event("locoReady"));
    })();

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      if (locoScroll) locoScroll.destroy();
      delete (window as any).__locoScroll;
    };
  }, []);

  return (
    <div ref={containerRef} data-scroll-container style={{ overflow: "hidden" }}>
      {children}
    </div>
  );
}

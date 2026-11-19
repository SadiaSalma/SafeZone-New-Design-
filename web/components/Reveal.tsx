"use client";
/**
 * Reveal.tsx - wrap any section in <Reveal> and it gently fades up
 * the first time it scrolls into view.
 *
 * IntersectionObserver is a browser tool that tells us when an element
 * becomes visible on screen.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";

export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect(); // only animate once
        }
      },
      { threshold: 0.15 }, // 15% of the section must be visible
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${shown ? "shown" : ""}`}>
      {children}
    </div>
  );
}

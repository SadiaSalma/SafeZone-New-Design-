"use client";
/**
 * CountUp.tsx - shows text like "8", "1 km", "< 2 min" or "১০০%" and makes the
 * number in it count up from 0 when it scrolls into view. The rest of the text
 * (units like "km", "%") stays as it is. Works with English and Bangla digits.
 */
import { useEffect, useRef, useState } from "react";

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

// Turn Bangla digits into English ones so JavaScript can read the number.
const toAscii = (s: string) => s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));

export function CountUp({ text, ms = 1400 }: { text: string; ms?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [progress, setProgress] = useState(0); // 0 = start, 1 = finished

  // Find the first number in the text, e.g. "< 2 min" -> 2
  const match = toAscii(text).match(/\d+/);
  const hasNumber = match !== null;
  const target = match ? Number(match[0]) : 0;
  const usesBangla = /[০-৯]/.test(text);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasNumber) return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / ms, 1);
        setProgress(1 - Math.pow(1 - p, 3)); // ease-out: fast at first, slow at the end
        if (p < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [hasNumber, ms]);

  if (!hasNumber) return <span>{text}</span>;

  let shown = String(Math.round(target * progress));
  if (usesBangla) shown = shown.replace(/\d/g, (d) => BN_DIGITS[Number(d)]);

  // Put the counting number back where the original number was.
  const original = text.match(/[0-9০-৯]+/)![0];
  return <span ref={ref}>{text.replace(original, shown)}</span>;
}

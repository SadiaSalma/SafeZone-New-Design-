"use client";
/**
 * Frontend (web) · Task 11 · CodeBoxes.tsx - the six little boxes for a 6-digit code.
 * Used by /verify (sign-up code) and /forgot-password (reset code).
 *
 *  - typing a digit jumps to the next box
 *  - Backspace on an empty box jumps back
 *  - pasting "123456" fills all six boxes at once
 *
 * The page keeps the digits (an array of 6 strings) and gives them to us;
 * `boxes` lets the page put the cursor back in the first box after a wrong code.
 */
import type { RefObject } from "react";

type Props = {
  digits: string[];
  onChange: (digits: string[]) => void;
  label: string;
  boxes: RefObject<(HTMLInputElement | null)[]>;
};

export const EMPTY_CODE = ["", "", "", "", "", ""];

export function CodeBoxes({ digits, onChange, label, boxes }: Props) {
  function type(index: number, value: string) {
    const clean = value.replace(/\D/g, "");
    if (clean.length > 1) {
      const all = clean.slice(0, 6).split("");
      onChange([...all, ...Array(6 - all.length).fill("")]);
      boxes.current[Math.min(all.length, 5)]?.focus();
      return;
    }
    const next = [...digits];
    next[index] = clean;
    onChange(next);
    if (clean && index < 5) boxes.current[index + 1]?.focus();
  }

  function back(index: number, key: string) {
    if (key === "Backspace" && !digits[index] && index > 0) boxes.current[index - 1]?.focus();
  }

  return (
    <>
      <p className="mb-2 text-sm font-medium text-white/90">{label}</p>
      <div className="mb-8 flex justify-between gap-2">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { boxes.current[i] = el; }}
            value={digit}
            onChange={(e) => type(i, e.target.value)}
            onKeyDown={(e) => back(i, e.key)}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`${label} ${i + 1}`}
            className="h-14 w-full rounded-2xl border border-white/30 bg-white/10 text-center text-2xl font-semibold text-white backdrop-blur-md focus:border-white focus:outline-none"
          />
        ))}
      </div>
    </>
  );
}

"use client";
/**
 * ThemePicker.tsx - the round palette button in the corner.
 * Click it to open a small panel and choose one of the 8 colour themes.
 */
import { useState } from "react";
import { Check, Palette, X } from "lucide-react";
import { THEMES } from "@/lib/themes";
import { usePrefs } from "@/components/PreferencesProvider";

export function ThemePicker() {
  const { theme, setTheme, t } = usePrefs();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-4 bottom-28 z-50 md:bottom-6">
      {open && (
        <div className="soft-shadow rise mb-3 w-64 rounded-2xl border border-line bg-surface p-3">
          <p className="mb-2 px-1 text-sm font-medium text-ink">{t("theme_title")}</p>
          <ul className="grid grid-cols-2 gap-2">
            {THEMES.map((th) => (
              <li key={th.id}>
                <button
                  type="button"
                  onClick={() => setTheme(th.id)}
                  className={`flex w-full items-center gap-2 rounded-xl border px-2 py-2 text-left text-xs text-ink transition-colors ${
                    theme === th.id ? "border-primary bg-bg" : "border-line hover:bg-bg"
                  }`}
                >
                  <span className="flex -space-x-1.5" aria-hidden>
                    {th.swatch.map((c) => (
                      <span key={c} className="size-4 rounded-full ring-2 ring-surface" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="flex-1 leading-tight">{th.name}</span>
                  {theme === th.id && <Check size={14} className="text-primary" aria-hidden />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={t("theme_title")}
        className="soft-shadow ml-auto grid size-12 place-items-center rounded-full bg-primary text-on-primary transition-transform hover:scale-105"
      >
        {open ? <X size={20} /> : <Palette size={20} />}
      </button>
    </div>
  );
}

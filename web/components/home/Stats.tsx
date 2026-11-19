"use client";
/**
 * Stats.tsx - four small cards with key facts about SafeZone.
 * These numbers come from our design document (not live data).
 */
import { BadgeCheck, Building2, Radio, Timer } from "lucide-react";
import { usePrefs } from "@/components/PreferencesProvider";
import { CountUp } from "@/components/CountUp";
import type { TextKey } from "@/lib/i18n";

const STATS: { icon: React.ReactNode; value: TextKey; label: TextKey }[] = [
  { icon: <Building2 size={20} />, value: "stat1_value", label: "stat1_label" },
  { icon: <Radio size={20} />, value: "stat2_value", label: "stat2_label" },
  { icon: <Timer size={20} />, value: "stat3_value", label: "stat3_label" },
  { icon: <BadgeCheck size={20} />, value: "stat4_value", label: "stat4_label" },
];

export function Stats() {
  const { t } = usePrefs();

  return (
    <section className="mx-auto -mt-10 max-w-5xl px-4 md:-mt-12">
      <ul className="relative z-20 grid grid-cols-2 gap-3 md:grid-cols-4">
        {STATS.map((s) => (
          <li key={s.value} className="soft-shadow flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary" aria-hidden>
              {s.icon}
            </span>
            <div>
              <p className="text-xl font-semibold text-ink">
                <CountUp text={t(s.value)} />
              </p>
              <p className="text-xs text-ink-soft">{t(s.label)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

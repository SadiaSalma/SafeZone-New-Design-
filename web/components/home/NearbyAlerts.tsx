"use client";
/**
 * NearbyAlerts.tsx - small alert cards (like "Property Nearby" in the reference).
 * These are SAMPLE alerts, clearly labelled. Real ones come from the backend later.
 */
import Link from "next/link";
import { Clock, HandCoins, ShoppingBag, Smartphone } from "lucide-react";
import { usePrefs } from "@/components/PreferencesProvider";
import type { TextKey } from "@/lib/i18n";

const SAMPLE_ALERTS: { icon: React.ReactNode; type: TextKey; place: TextKey; time: TextKey }[] = [
  { icon: <Smartphone size={20} />, type: "alert1_type", place: "alert1_place", time: "alert1_time" },
  { icon: <ShoppingBag size={20} />, type: "alert2_type", place: "alert2_place", time: "alert2_time" },
  { icon: <HandCoins size={20} />, type: "alert3_type", place: "alert3_place", time: "alert3_time" },
];

export function NearbyAlerts() {
  const { t } = usePrefs();

  return (
    <section className="mx-auto mt-20 max-w-6xl px-4">
      <div className="mb-5 flex items-center gap-3">
        <h2 className="text-2xl font-semibold text-ink md:text-3xl">{t("nearby_title")}</h2>
        <span className="rounded-full bg-accent/30 px-2.5 py-0.5 text-xs font-medium text-ink">{t("sample")}</span>
        <Link href="/alerts" className="ml-auto text-sm text-ink-soft hover:text-ink">
          {t("see_all")}
        </Link>
      </div>

      <ul className="grid gap-3 md:grid-cols-3">
        {SAMPLE_ALERTS.map((a) => (
          <li
            key={a.type}
            className="soft-shadow flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition-transform hover:-translate-y-0.5"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary" aria-hidden>
              {a.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">{t(a.type)}</p>
              <p className="truncate text-sm text-ink-soft">{t(a.place)}</p>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-xs text-ink-soft">
              <Clock size={13} aria-hidden /> {t(a.time)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

"use client";
/**
 * PhoneShowcase.tsx - a phone drawn with CSS, showing SafeZone alerts
 * sliding onto its lock screen one after another (a looping animation).
 * Next to it: four short points about how alerts work.
 */
import Image from "next/image";
import { Check, ShieldCheck } from "lucide-react";
import aerial from "@/public/images/area-dhaka-aerial.jpg";
import { usePrefs } from "@/components/PreferencesProvider";
import type { TextKey } from "@/lib/i18n";

const POINTS: TextKey[] = ["phone_point1", "phone_point2", "phone_point3", "phone_point4"];
const NOTIFS: TextKey[] = ["notif1", "notif2", "notif3"];

export function PhoneShowcase() {
  const { t } = usePrefs();

  return (
    <section className="mx-auto mt-20 max-w-6xl px-4">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold text-ink md:text-4xl">{t("phone_title")}</h2>
          <p className="mt-3 text-ink-soft">{t("phone_sub")}</p>
          <ul className="mt-7 space-y-4">
            {POINTS.map((key) => (
              <li key={key} className="flex items-start gap-3 text-ink">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary text-on-primary" aria-hidden>
                  <Check size={14} />
                </span>
                {t(key)}
              </li>
            ))}
          </ul>
        </div>

        {/* The phone */}
        <div className="relative mx-auto">
          <div className="absolute -inset-10 rounded-full bg-primary/20 blur-3xl" aria-hidden />
          <div className="soft-shadow relative h-[560px] w-[280px] overflow-hidden rounded-[3rem] border-[10px] border-neutral-900 bg-black">
            <Image src={aerial} alt="" fill placeholder="blur" sizes="280px" className="object-cover opacity-80 blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/60" />

            {/* Notch, clock and date */}
            <div className="absolute top-2 left-1/2 h-6 w-24 -translate-x-1/2 rounded-full bg-neutral-900" />
            <div className="relative pt-14 text-center text-white">
              <p className="text-sm opacity-80">{t("lock_date")}</p>
              <p className="text-6xl font-semibold tracking-tight">21:47</p>
            </div>

            {/* Notifications slide in one by one (each starts 3 seconds after the last) */}
            <div className="relative mt-8 space-y-2.5 px-3">
              {NOTIFS.map((key, i) => (
                <div
                  key={key}
                  className="notif rounded-2xl border border-white/25 bg-white/20 p-3 text-white backdrop-blur-xl"
                  style={{ animationDelay: `${i * 3}s` }}
                >
                  <div className="mb-1 flex items-center gap-1.5 text-[11px] opacity-85">
                    <span className="grid size-4 place-items-center rounded-[5px] bg-primary text-on-primary">
                      <ShieldCheck size={11} aria-hidden />
                    </span>
                    {t("brand")}
                    <span className="ml-auto">{t("notif_now")}</span>
                  </div>
                  <p className="text-[13px] leading-snug">{t(key)}</p>
                </div>
              ))}
            </div>

            <span className="absolute bottom-3 left-1/2 rounded-full bg-white/20 px-3 py-1 text-[10px] text-white backdrop-blur-md -translate-x-1/2">
              {t("phone_preview")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

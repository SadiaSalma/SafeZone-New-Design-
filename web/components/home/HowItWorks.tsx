"use client";
/**
 * HowItWorks.tsx - explains SafeZone in 4 steps, next to a tall photo.
 */
import Image from "next/image";
import { BellRing, FileText, MapPin, Quote, UserCheck } from "lucide-react";
import howPhoto from "@/public/images/how-rickshaws-trees.jpg";
import { usePrefs } from "@/components/PreferencesProvider";
import type { TextKey } from "@/lib/i18n";

const STEPS: { icon: React.ReactNode; title: TextKey; text: TextKey }[] = [
  { icon: <FileText size={20} />, title: "step1_title", text: "step1_text" },
  { icon: <MapPin size={20} />, title: "step2_title", text: "step2_text" },
  { icon: <UserCheck size={20} />, title: "step3_title", text: "step3_text" },
  { icon: <BellRing size={20} />, title: "step4_title", text: "step4_text" },
];

export function HowItWorks() {
  const { t } = usePrefs();

  return (
    <section className="mx-auto mt-20 max-w-6xl px-4">
      <div className="grid items-stretch gap-8 rounded-[2rem] bg-bg-soft p-4 md:grid-cols-[0.9fr_1.1fr] md:p-6">
        <div className="soft-shadow relative min-h-[320px] overflow-hidden rounded-[1.5rem]">
          <Image
            src={howPhoto}
            alt="Rickshaws and cars on a tree-lined road in Dhaka"
            fill
            placeholder="blur"
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-cover"
          />
          <div className="photo-fade absolute inset-0" />
          <p className="absolute inset-x-0 bottom-0 flex gap-2 p-6 text-lg font-medium text-white">
            <Quote size={22} className="shrink-0 text-accent" aria-hidden /> {t("how_quote")}
          </p>
        </div>

        <div className="py-2 md:py-6 md:pr-4">
          <h2 className="text-2xl font-semibold text-ink md:text-3xl">{t("how_title")}</h2>
          <p className="mt-2 text-ink-soft">{t("how_sub")}</p>

          <ol className="mt-8 space-y-6">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-on-primary" aria-hidden>
                  {step.icon}
                  <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-accent text-xs font-semibold text-primary-strong">
                    {i + 1}
                  </span>
                </span>
                <div>
                  <p className="font-semibold text-ink">{t(step.title)}</p>
                  <p className="text-sm text-ink-soft">{t(step.text)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

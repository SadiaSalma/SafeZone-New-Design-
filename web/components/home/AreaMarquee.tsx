"use client";
/**
 * AreaMarquee.tsx - a strip of area names that slides past endlessly.
 * The text is written twice side by side; the animation moves it left by half,
 * then jumps back, so it looks like one never-ending line.
 */
import { MapPin } from "lucide-react";
import { usePrefs } from "@/components/PreferencesProvider";

export function AreaMarquee() {
  const { t } = usePrefs();
  const line = (
    <span className="flex shrink-0 items-center gap-6 pr-6">
      {t("areas_strip")
        .split(" · ")
        .map((area) => (
          <span key={area} className="flex items-center gap-2">
            <MapPin size={18} className="text-accent" aria-hidden />
            {area}
          </span>
        ))}
    </span>
  );

  return (
    <div className="mt-16 overflow-hidden border-y border-line bg-surface py-5" aria-label={t("areas_strip")}>
      <div className="marquee flex w-max text-2xl font-semibold text-ink/80 md:text-3xl" aria-hidden>
        {line}
        {line}
      </div>
    </div>
  );
}

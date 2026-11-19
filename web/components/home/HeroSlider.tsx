"use client";
/**
 * HeroSlider.tsx - the full-screen photo slider at the top of the home page.
 *
 * - Photos change one by one every 6 seconds (cross-fade).
 * - The visible photo slowly zooms in ("Ken Burns" effect) so it feels alive.
 * - The arrow buttons jump to the previous / next photo.
 * - Hovering over the slider pauses it.
 * - A pulsing "Live alerts" button sits on the right (like a play button).
 */
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BellRing, ChevronLeft, ChevronRight, MapPin, Search, SlidersHorizontal } from "lucide-react";
import nightStreet from "@/public/images/hero-dhaka-night-street.jpg";
import rickshawTraffic from "@/public/images/alerts-rickshaw-traffic.jpg";
import nightLights from "@/public/images/danger-dhaka-night-lights.jpg";
import aerial from "@/public/images/area-dhaka-aerial.jpg";
import treeRoad from "@/public/images/how-rickshaws-trees.jpg";
import { usePrefs } from "@/components/PreferencesProvider";
import type { TextKey } from "@/lib/i18n";

const SLIDE_MS = 6000; // how long each photo stays (milliseconds)

const SLIDES: { photo: StaticImageData; alt: string; tag: TextKey }[] = [
  { photo: nightStreet, alt: "A Dhaka street at night with rickshaws under the trees", tag: "slide1_tag" },
  { photo: rickshawTraffic, alt: "Rickshaws in heavy traffic in front of shops", tag: "slide2_tag" },
  { photo: nightLights, alt: "A Dhaka road at night with light trails", tag: "slide3_tag" },
  { photo: aerial, alt: "Aerial view of Dhaka with a river through the city", tag: "slide4_tag" },
  { photo: treeRoad, alt: "Rickshaws and cars on a tree-lined road in Dhaka", tag: "slide5_tag" },
];

const CHIPS: TextKey[] = ["chip_all", "chip_phone", "chip_bag", "chip_pickpocket", "chip_bike", "chip_burglary"];

// Sample alerts shown in the floating glass card (they change with the photo)
const GLASS_ALERTS: { type: TextKey; place: TextKey; time: TextKey }[] = [
  { type: "alert1_type", place: "alert1_place", time: "alert1_time" },
  { type: "alert2_type", place: "alert2_place", time: "alert2_time" },
  { type: "alert3_type", place: "alert3_place", time: "alert3_time" },
];

export function HeroSlider() {
  const { t } = usePrefs();
  const [current, setCurrent] = useState(0); // which photo is showing
  const [paused, setPaused] = useState(false); // true while the mouse is over the slider
  const [chip, setChip] = useState<TextKey>("chip_all");

  // Every SLIDE_MS, move to the next photo (unless paused). Starts again when "current" changes.
  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => setCurrent((c) => (c + 1) % SLIDES.length), SLIDE_MS);
    return () => clearTimeout(timer); // clean up the old timer
  }, [current, paused]);

  const go = (step: number) => setCurrent((c) => (c + step + SLIDES.length) % SLIDES.length);

  return (
    <section
      className={`relative -mt-16 min-h-[100svh] overflow-hidden bg-black ${paused ? "paused" : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* All photos are stacked; only the current one is visible (opacity-100) */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.tag}
          className={`absolute inset-0 transition-opacity duration-[1400ms] ease-in-out ${i === current ? "opacity-100" : "opacity-0"}`}
          aria-hidden={i !== current}
        >
          <Image
            src={slide.photo}
            alt={slide.alt}
            fill
            preload={i === 0}
            placeholder="blur"
            sizes="100vw"
            className={`object-cover ${i === current ? "kenburns" : ""}`}
          />
        </div>
      ))}
      <div className="photo-fade absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />


      {/* Pulsing "Live alerts" button, like the play button in the reference */}
      <Link
        href="/alerts"
        className="absolute top-1/3 right-6 z-10 hidden flex-col items-center gap-3 text-sm font-medium text-white md:right-16 md:flex"
      >
        <span className="relative grid size-20 place-items-center">
          <span className="pulse-ring absolute inset-0 rounded-full border-2 border-white/70" />
          <span className="pulse-ring-late absolute inset-0 rounded-full border-2 border-white/70" />
          <span className="grid size-20 place-items-center rounded-full bg-white/20 backdrop-blur-md transition-colors hover:bg-white/35">
            <BellRing size={28} aria-hidden />
          </span>
        </span>
        {t("live_alerts")}
      </Link>

      {/* Floating frosted-glass alert card (desktop only), like the blurred-glass login reference */}
      <div className="float absolute right-6 bottom-44 z-10 hidden w-72 md:right-16 lg:block">
        <div
          key={current}
          className="rise rounded-3xl border border-white/25 bg-white/15 p-4 text-white shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 text-xs">
            <span className="relative flex size-2.5">
              <span className="pulse-ring absolute inset-0 rounded-full bg-red-400" />
              <span className="relative size-2.5 rounded-full bg-red-500" />
            </span>
            {t("glass_title")}
            <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-[10px]">{t("sample")}</span>
          </div>
          <p className="mt-3 text-lg font-semibold">{t(GLASS_ALERTS[current % GLASS_ALERTS.length].type)}</p>
          <p className="flex items-center gap-1.5 text-sm text-white/80">
            <MapPin size={14} aria-hidden /> {t(GLASS_ALERTS[current % GLASS_ALERTS.length].place)}
          </p>
          <p className="mt-2 text-xs text-white/60">{t(GLASS_ALERTS[current % GLASS_ALERTS.length].time)}</p>
        </div>
      </div>

      {/* Text and controls */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end gap-5 px-4 pt-32 pb-24 md:pb-28">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-primary-strong uppercase">
            <MapPin size={14} aria-hidden /> {t("hero_badge")}
          </span>
          {/* key={current} re-runs the fade animation each time the photo changes */}
          <span key={current} className="rise rounded-full bg-white/15 px-3.5 py-1.5 text-xs text-white backdrop-blur-md">
            {t(SLIDES[current].tag)}
          </span>
        </div>

        <h1 className="rise max-w-4xl text-5xl leading-[1.05] font-semibold text-white md:text-7xl">
          {t("hero_line1")}
          <br />
          <span className="text-accent">{t("hero_line2")}</span>
        </h1>
        <p className="rise max-w-xl text-base text-white/85 [animation-delay:150ms] md:text-lg">{t("hero_sub")}</p>

        <div className="rise flex max-w-xl items-center gap-3 [animation-delay:250ms]">
          <Link
            href="/areas"
            className="flex flex-1 items-center gap-3 rounded-2xl border border-white/20 bg-white/15 px-4 py-3.5 text-sm text-white/85 backdrop-blur-md transition-colors hover:bg-white/25"
          >
            <Search size={18} aria-hidden /> {t("search_placeholder")}
          </Link>
          <Link
            href="/map"
            aria-label={t("cta_map")}
            className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-primary-strong transition-transform hover:scale-105"
          >
            <SlidersHorizontal size={20} />
          </Link>
        </div>

        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {CHIPS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setChip(key)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors ${
                chip === key ? "bg-white font-medium text-primary-strong" : "bg-white/15 text-white backdrop-blur-md hover:bg-white/25"
              }`}
            >
              {t(key)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            href="/report/new"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-on-primary transition-transform hover:scale-[1.03]"
          >
            {t("cta_report")} <ArrowRight size={16} aria-hidden />
          </Link>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 rounded-full border border-white/60 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            {t("cta_map")}
          </Link>

          {/* Previous / next arrows */}
          <div className="ml-auto hidden gap-2 md:flex">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={t("prev_slide")}
              className="grid size-11 place-items-center rounded-full border border-white/40 text-white transition-colors hover:bg-white/15"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={t("next_slide")}
              className="grid size-11 place-items-center rounded-full border border-white/40 text-white transition-colors hover:bg-white/15"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

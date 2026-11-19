"use client";
/**
 * ExploreCards.tsx - big rounded photo cards (like "Beverly Hills" in the reference).
 * Each card links to a part of SafeZone. On phones they scroll sideways.
 */
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bell } from "lucide-react";
import alertsPhoto from "@/public/images/alerts-rickshaw-traffic.jpg";
import areaPhoto from "@/public/images/area-dhaka-aerial.jpg";
import dangerPhoto from "@/public/images/danger-dhaka-night-lights.jpg";
import { usePrefs } from "@/components/PreferencesProvider";
import type { TextKey } from "@/lib/i18n";

type Card = { href: string; photo: StaticImageData; alt: string; title: TextKey; sub: TextKey; badge: TextKey };

const CARDS: Card[] = [
  {
    href: "/alerts",
    photo: alertsPhoto,
    alt: "Rickshaws stuck in traffic in front of shops in Dhaka",
    title: "card_alerts_title",
    sub: "card_alerts_sub",
    badge: "badge_live",
  },
  {
    href: "/areas",
    photo: areaPhoto,
    alt: "Aerial view of Dhaka with a river running through the city",
    title: "card_area_title",
    sub: "card_area_sub",
    badge: "badge_free",
  },
  {
    href: "/crime",
    photo: dangerPhoto,
    alt: "A Dhaka road at night with light trails from traffic",
    title: "card_danger_title",
    sub: "card_danger_sub",
    badge: "badge_new",
  },
];

export function ExploreCards() {
  const { t } = usePrefs();

  return (
    <section className="mx-auto mt-16 max-w-6xl px-4">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="text-2xl font-semibold text-ink md:text-3xl">{t("explore_title")}</h2>
        <Link href="/map" className="text-sm text-ink-soft hover:text-ink">
          {t("see_all")}
        </Link>
      </div>

      <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="soft-shadow group relative h-80 w-[78%] shrink-0 snap-start overflow-hidden rounded-[1.75rem] md:w-auto"
          >
            <Image
              src={card.photo}
              alt={card.alt}
              fill
              placeholder="blur"
              sizes="(max-width: 768px) 80vw, 380px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="photo-fade absolute inset-0" />
            <span className="absolute top-4 right-4 rounded-full bg-black/35 px-3 py-1 text-xs text-white backdrop-blur-md">
              {t(card.badge)}
            </span>
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
              <div>
                <p className="text-lg font-semibold text-white">{t(card.title)}</p>
                <p className="text-sm text-white/75">{t(card.sub)}</p>
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors group-hover:bg-white group-hover:text-primary-strong">
                {card.href === "/alerts" ? <Bell size={18} aria-hidden /> : <ArrowUpRight size={18} aria-hidden />}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

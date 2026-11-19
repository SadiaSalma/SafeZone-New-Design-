"use client";
/**
 * MobileNav.tsx - the rounded bar at the bottom of the screen on phones,
 * like a mobile app (hidden on bigger screens with md:hidden).
 * The middle "Report" button is raised so it stands out.
 */
import Link from "next/link";
import { Bell, House, Map, Plus, User } from "lucide-react";
import { usePrefs } from "@/components/PreferencesProvider";

export function MobileNav() {
  const { t } = usePrefs();

  return (
    <nav className="soft-shadow fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-line bg-surface md:hidden">
      <ul className="flex items-end justify-around px-2 py-2 text-[11px] text-ink-soft">
        <NavItem href="/" icon={<House size={20} />} label={t("mnav_home")} active />
        <NavItem href="/map" icon={<Map size={20} />} label={t("mnav_map")} />
        <li>
          <Link href="/report/new" className="-mt-7 flex flex-col items-center gap-1 text-ink">
            <span className="soft-shadow grid size-14 place-items-center rounded-full bg-primary text-on-primary ring-4 ring-bg">
              <Plus size={26} aria-hidden />
            </span>
            {t("mnav_report")}
          </Link>
        </li>
        <NavItem href="/alerts" icon={<Bell size={20} />} label={t("mnav_alerts")} />
        <NavItem href="/login" icon={<User size={20} />} label={t("mnav_me")} />
      </ul>
    </nav>
  );
}

function NavItem(props: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <li>
      <Link
        href={props.href}
        className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1 ${props.active ? "text-primary" : ""}`}
      >
        {props.icon}
        {props.label}
      </Link>
    </li>
  );
}

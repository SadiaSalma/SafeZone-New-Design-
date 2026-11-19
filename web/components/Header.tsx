"use client";
/**
 * Header.tsx - the bar at the top of every page:
 * logo, menu links (on bigger screens), language switch and Log in button.
 *
 * On the home page it starts see-through, floating over the photo slider,
 * and turns solid once you scroll down a little.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { usePrefs } from "@/components/PreferencesProvider";

export function Header() {
  const { t, lang, setLang } = usePrefs();
  const pathname = usePathname(); // the current address, e.g. "/" or "/map"
  const [scrolled, setScrolled] = useState(false);

  // Watch the scroll position: more than 40px down = "scrolled".
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overPhoto = pathname === "/" && !scrolled; // see-through mode

  const links = [
    { href: "/map", label: t("nav_map") },
    { href: "/areas", label: t("nav_areas") },
    { href: "/crime", label: t("nav_crime") },
    { href: "/alerts", label: t("nav_alerts") },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        overPhoto ? "border-b border-transparent bg-transparent" : "border-b border-line bg-bg/85 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className={`flex items-center gap-2 text-lg font-semibold ${overPhoto ? "text-white" : "text-ink"}`}>
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-on-primary">
            <ShieldCheck size={20} aria-hidden />
          </span>
          {t("brand")}
        </Link>

        <nav className={`ml-8 hidden items-center gap-7 text-sm md:flex ${overPhoto ? "text-white/85" : "text-ink-soft"}`}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={overPhoto ? "hover:text-white" : "hover:text-ink"}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              overPhoto ? "border-white/40 text-white hover:bg-white/15" : "border-line text-ink hover:bg-surface"
            }`}
          >
            {t("switch_lang")}
          </button>
          <Link
            href="/login"
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-opacity hover:opacity-90 ${
              overPhoto ? "bg-white text-primary-strong" : "bg-primary text-on-primary"
            }`}
          >
            {t("login")}
          </Link>
        </div>
      </div>
    </header>
  );
}

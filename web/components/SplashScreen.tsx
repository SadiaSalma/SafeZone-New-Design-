"use client";
/**
 * SplashScreen.tsx - the opening screen shown when the website first opens.
 * A blurred Dhaka photo, the SafeZone logo with pulsing rings and a loading line.
 * After about 2 seconds it fades away (the "splash" animation in globals.css).
 * It is shown once per browser visit (sessionStorage remembers it).
 */
import Image from "next/image";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import heroPhoto from "@/public/images/hero-dhaka-night-street.jpg";
import { usePrefs } from "@/components/PreferencesProvider";

export function SplashScreen() {
  const { t } = usePrefs();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("sz-splash") === "1";
      sessionStorage.setItem("sz-splash", "1");
    } catch {}
    // Already shown in this visit: hide at once. Otherwise remove it after the fade.
    const timer = setTimeout(() => setVisible(false), seen ? 0 : 2300);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="splash fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-black" aria-hidden>
      <Image src={heroPhoto} alt="" fill preload placeholder="blur" sizes="100vw" className="scale-110 object-cover blur-xl" />
      <div className="absolute inset-0 bg-primary-strong/60" />

      <div className="rise relative flex flex-col items-center gap-5 text-white">
        <span className="relative grid size-24 place-items-center">
          <span className="pulse-ring absolute inset-0 rounded-[1.75rem] border-2 border-white/60" />
          <span className="pulse-ring-late absolute inset-0 rounded-[1.75rem] border-2 border-white/60" />
          <span className="grid size-24 place-items-center rounded-[1.75rem] border border-white/30 bg-white/15 backdrop-blur-xl">
            <ShieldCheck size={44} />
          </span>
        </span>
        <p className="text-4xl font-semibold tracking-tight">{t("brand")}</p>
        <p className="text-sm text-white/75">{t("splash_tag")}</p>
        <span className="mt-2 h-0.5 w-40 overflow-hidden rounded-full bg-white/20">
          <span className="grow-line block h-full w-full bg-white" />
        </span>
      </div>
    </div>
  );
}

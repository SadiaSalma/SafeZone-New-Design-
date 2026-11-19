"use client";
/**
 * ReportBanner.tsx - a big call-to-action asking victims to report a theft.
 */
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
import reportPhoto from "@/public/images/report-phone-street.jpg";
import { usePrefs } from "@/components/PreferencesProvider";

export function ReportBanner() {
  const { t } = usePrefs();

  return (
    <section className="mx-auto mt-20 max-w-6xl px-4">
      <div className="soft-shadow grid overflow-hidden rounded-[2rem] bg-primary-strong md:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col justify-center gap-5 p-8 md:p-12">
          <span className="grid size-12 place-items-center rounded-2xl bg-white/12 text-accent" aria-hidden>
            <ShieldAlert size={24} />
          </span>
          <h2 className="text-3xl font-semibold text-white md:text-4xl">{t("report_title")}</h2>
          <p className="max-w-lg text-white/75">{t("report_sub")}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/report/new"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary-strong transition-transform hover:scale-[1.03]"
            >
              {t("report_cta")} <ArrowRight size={16} aria-hidden />
            </Link>
            <span className="text-sm text-white/60">{t("report_note")}</span>
          </div>
        </div>
        <div className="relative min-h-[280px]">
          <Image
            src={reportPhoto}
            alt="A man holding a phone on a street with a police car behind him"
            fill
            placeholder="blur"
            sizes="(max-width: 768px) 100vw, 480px"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

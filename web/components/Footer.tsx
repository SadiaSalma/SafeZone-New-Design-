"use client";
/**
 * Footer.tsx - the bottom of every page: logo, project line and photo credits.
 * Unsplash photos are free to use; crediting the photographers is good manners.
 */
import { ShieldCheck } from "lucide-react";
import { usePrefs } from "@/components/PreferencesProvider";

const PHOTOGRAPHERS = [
  { name: "Towfiq islam", username: "filmsbytowfiq" },
  { name: "Austin Curtis", username: "afcurtis" },
  { name: "MSI Sakib", username: "msisakib" },
  { name: "Marcos Soares", username: "mzct" },
  { name: "Samiul Haque Bhuyan", username: "samiulhaquebhuyan" },
];

export function Footer() {
  const { t } = usePrefs();

  return (
    <footer className="mt-20 bg-primary-strong text-white/85">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-2">
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
            <ShieldCheck size={22} aria-hidden /> {t("brand")}
          </div>
          <p className="mt-2 max-w-sm text-sm">{t("footer_tag")}</p>
          <p className="mt-4 text-xs text-white/60">{t("footer_project")}</p>
        </div>
        <p className="text-xs leading-relaxed text-white/60 md:text-right">
          {t("footer_photos")}{" "}
          {PHOTOGRAPHERS.map((p, i) => (
            <span key={p.username}>
              <a
                href={`https://unsplash.com/@${p.username}?utm_source=safezone&utm_medium=referral`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-2 hover:text-white hover:underline"
              >
                {p.name}
              </a>
              {i < PHOTOGRAPHERS.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      </div>
    </footer>
  );
}

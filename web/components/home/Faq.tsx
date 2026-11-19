"use client";
/**
 * Faq.tsx - questions that open and close when clicked.
 * It uses the browser's built-in <details> and <summary> tags,
 * so opening and closing works without any extra JavaScript.
 */
import { Plus } from "lucide-react";
import { usePrefs } from "@/components/PreferencesProvider";
import type { TextKey } from "@/lib/i18n";

const QUESTIONS: [TextKey, TextKey][] = [
  ["faq1_q", "faq1_a"],
  ["faq2_q", "faq2_a"],
  ["faq3_q", "faq3_a"],
  ["faq4_q", "faq4_a"],
  ["faq5_q", "faq5_a"],
];

export function Faq() {
  const { t } = usePrefs();

  return (
    <section className="mx-auto mt-20 max-w-3xl px-4">
      <h2 className="mb-6 text-center text-3xl font-semibold text-ink md:text-4xl">{t("faq_title")}</h2>
      <div className="space-y-3">
        {QUESTIONS.map(([q, a], i) => (
          <details key={q} open={i === 0} className="group rounded-2xl border border-line bg-surface px-5 py-4 transition-colors open:bg-surface">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
              {t(q)}
              {/* group-open:rotate-45 turns the + into an x while the question is open */}
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/12 text-primary transition-transform duration-300 group-open:rotate-45">
                <Plus size={18} aria-hidden />
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{t(a)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

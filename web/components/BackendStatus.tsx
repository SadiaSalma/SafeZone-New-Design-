"use client";
/**
 * BackendStatus.tsx - the little status light in the footer.
 * Every 30 seconds it asks the backend "are you alive?" (GET /api/v1/health)
 * and shows: green with the answer time, red if the backend does not answer,
 * or red "Database offline" if the backend answers but cannot reach MongoDB.
 */
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { usePrefs } from "@/components/PreferencesProvider";

const CHECK_EVERY_MS = 30_000;

type Status = "checking" | "online" | "offline" | "db_offline";

type Health = { status: string; database?: { ok: boolean } };

export function BackendStatus() {
  const { t } = usePrefs();
  const [status, setStatus] = useState<Status>("checking");
  const [ms, setMs] = useState<number | null>(null); // how long the answer took

  useEffect(() => {
    let stopped = false;

    async function check() {
      const start = performance.now();
      try {
        const health = await api<Health>("/health");
        if (stopped) return;
        setMs(Math.round(performance.now() - start));
        setStatus(health.database?.ok === false ? "db_offline" : "online");
      } catch {
        if (stopped) return;
        setMs(null);
        setStatus("offline");
      }
    }

    check(); // check once right away...
    const timer = setInterval(check, CHECK_EVERY_MS); // ...then every 30 seconds
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, []);

  const colour = status === "online" ? "bg-green-400" : status === "checking" ? "bg-yellow-300" : "bg-red-500";
  const label = {
    online: `${t("status_online")} · ${ms} ms`,
    offline: t("status_offline"),
    db_offline: t("status_db_offline"),
    checking: t("status_checking"),
  }[status];

  return (
    <span
      className="inline-flex items-center gap-2.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs text-white"
      role="status"
      aria-live="polite"
    >
      <span className="relative flex size-2.5">
        <span className={`pulse-ring absolute inset-0 rounded-full ${colour}`} />
        <span className={`relative size-2.5 rounded-full ${colour}`} />
      </span>
      {label}
    </span>
  );
}

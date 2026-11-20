"use client";
/**
 * Frontend (web) · Task 10 · /verify?email=... - type the 6-digit code from the email
 * (during development it is printed in the backend terminal).
 * On success the account is active, the person is logged in, and we go to "add your NID".
 *
 * <Suspense> is needed because this page reads the address bar (useSearchParams):
 * Next.js 16 asks for a loading boundary around such components.
 */
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import phoneCity from "@/public/images/auth-verify-phone-city.jpg";
import { AuthShell } from "@/components/auth/AuthShell";
import { CodeBoxes, EMPTY_CODE } from "@/components/auth/CodeBoxes";
import { Field, FormError, PrimaryButton } from "@/components/auth/FormParts";
import { useAuth, type User } from "@/components/AuthProvider";
import { usePrefs } from "@/components/PreferencesProvider";
import { api, ApiError } from "@/lib/api";

const RESEND_SECONDS = 60;

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}

function VerifyForm() {
  const { t } = usePrefs();
  const { setUser } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [digits, setDigits] = useState(EMPTY_CODE);
  const [error, setError] = useState<ApiError | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(RESEND_SECONDS); // seconds until "send again" is allowed
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  // Count down once per second
  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice("");
    try {
      const answer = await api<{ user: User }>("/auth/verify-otp", {
        method: "POST",
        body: { email: email.trim().toLowerCase(), code: digits.join("") },
      });
      setUser(answer.user);
      router.push("/me/nid");
    } catch (problem) {
      setError(problem as ApiError);
      setDigits(EMPTY_CODE);
      boxes.current[0]?.focus();
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError(null);
    try {
      await api("/auth/resend-otp", { method: "POST", body: { email: email.trim().toLowerCase() } });
      setNotice(t("resent"));
      setWait(RESEND_SECONDS);
    } catch (problem) {
      setError(problem as ApiError);
    }
  }

  return (
    <AuthShell
      photo={phoneCity}
      photoAlt="A man checking his phone in the city at dusk"
      sideTitle={t("verify_side_title")}
      sideText={t("verify_side_text")}
      title={t("verify_title")}
      subtitle={<>{t("verify_sub")} <strong className="text-white">{email || "…"}</strong></>}
    >
      <form onSubmit={submit} noValidate>
        <FormError>{error?.message}</FormError>
        {notice && <p role="status" className="mb-5 rounded-2xl bg-white/15 px-4 py-3 text-sm">{notice}</p>}

        {!params.get("email") && (
          <Field label={t("field_email")} name="email" type="email" autoComplete="email" icon={<Mail size={18} />}
                 value={email} onChange={(e) => setEmail(e.target.value)} />
        )}

        <CodeBoxes digits={digits} onChange={setDigits} label={t("code_label")} boxes={boxes} />

        <PrimaryButton busy={busy}>{t("verify_button")}</PrimaryButton>

        <p className="mt-6 text-center text-sm text-white/75">
          {wait > 0 ? (
            <>{t("resend_wait")} 0:{String(wait).padStart(2, "0")}</>
          ) : (
            <button type="button" onClick={resend} className="font-semibold text-white underline underline-offset-4">
              {t("resend")}
            </button>
          )}
        </p>
      </form>
    </AuthShell>
  );
}

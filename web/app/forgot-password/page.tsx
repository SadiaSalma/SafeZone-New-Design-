"use client";
/**
 * Frontend (web) · Task 11 · /forgot-password - get back into your account.
 *
 *   Step 1 "email": type your email -> POST /api/v1/auth/password-reset/request
 *                   (the backend gives the SAME answer whether or not the email
 *                   has an account, so nobody can use this page to find accounts)
 *   Step 2 "code":  the 6-digit code from the email + a new password
 *                   -> POST /api/v1/auth/password-reset/confirm
 *   Step 3 "done":  password changed; every device was logged out; go to log in.
 *
 * During development the code is printed in the backend terminal.
 */
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, CircleCheck, Mail } from "lucide-react";
import shopsAtNight from "@/public/images/auth-forgot-dhaka-shops-night.jpg";
import { AuthShell } from "@/components/auth/AuthShell";
import { CodeBoxes, EMPTY_CODE } from "@/components/auth/CodeBoxes";
import { Field, FormError, PrimaryButton } from "@/components/auth/FormParts";
import { usePrefs } from "@/components/PreferencesProvider";
import { api, ApiError } from "@/lib/api";

const RESEND_SECONDS = 60;
type Step = "email" | "code" | "done";

export default function ForgotPasswordPage() {
  const { t } = usePrefs();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState(EMPTY_CODE);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0); // seconds until "send again" is allowed
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const cleanEmail = email.trim().toLowerCase();

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  // Step 1 (and "send again"): ask the backend to email a reset code
  async function askForCode() {
    const answer = await api<{ message: string }>("/auth/password-reset/request", {
      method: "POST",
      body: { email: cleanEmail },
    });
    setNotice(answer.message);
    setWait(RESEND_SECONDS);
  }

  async function submitEmail(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await askForCode();
      setStep("code");
    } catch (problem) {
      setError(problem as ApiError);
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError(null);
    try {
      await askForCode();
    } catch (problem) {
      setError(problem as ApiError);
    }
  }

  // Step 2: code + new password
  async function submitCode(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/auth/password-reset/confirm", {
        method: "POST",
        body: { email: cleanEmail, code: digits.join(""), new_password: password },
      });
      setStep("done");
    } catch (problem) {
      const apiError = problem as ApiError;
      setError(apiError);
      if (!apiError.fields?.new_password) {
        setDigits(EMPTY_CODE); // a wrong code: clear the boxes and start again
        boxes.current[0]?.focus();
      }
    } finally {
      setBusy(false);
    }
  }

  const titles: Record<Step, { title: string; subtitle: ReactNode }> = {
    email: { title: t("forgot_title"), subtitle: t("forgot_sub") },
    code: { title: t("reset_title"), subtitle: <>{t("verify_sub")} <strong className="text-white">{cleanEmail}</strong></> },
    done: { title: t("reset_done_title"), subtitle: t("reset_done_sub") },
  };

  return (
    <AuthShell
      photo={shopsAtNight}
      photoAlt="A person standing in front of brightly lit shops on a Dhaka street at night"
      sideTitle={t("forgot_side_title")}
      sideText={t("forgot_side_text")}
      title={titles[step].title}
      subtitle={titles[step].subtitle}
    >
      {step === "email" && (
        <form onSubmit={submitEmail} noValidate>
          <FormError>{error && !error.fields?.email && error.message}</FormError>
          <Field label={t("field_email")} name="email" type="email" autoComplete="email" placeholder="you@example.com"
                 icon={<Mail size={18} />} value={email} onChange={(e) => setEmail(e.target.value)}
                 error={error?.fields?.email} />
          <div className="mt-4">
            <PrimaryButton busy={busy}>{t("send_reset_code")}</PrimaryButton>
          </div>
          <BackToLogin />
        </form>
      )}

      {step === "code" && (
        <form onSubmit={submitCode} noValidate>
          <FormError>{error && !error.fields?.new_password && error.message}</FormError>
          {notice && !error && <p role="status" className="mb-5 rounded-2xl bg-white/15 px-4 py-3 text-sm">{notice}</p>}

          <CodeBoxes digits={digits} onChange={setDigits} label={t("code_label")} boxes={boxes} />
          <Field label={t("field_new_password")} name="new_password" type="password" autoComplete="new-password"
                 placeholder="••••••••" hint={t("password_hint")}
                 value={password} onChange={(e) => setPassword(e.target.value)}
                 error={error?.fields?.new_password} />

          <div className="mt-4">
            <PrimaryButton busy={busy}>{t("reset_button")}</PrimaryButton>
          </div>

          <p className="mt-6 text-center text-sm text-white/75">
            {wait > 0 ? (
              <>{t("resend_wait")} 0:{String(wait).padStart(2, "0")}</>
            ) : (
              <button type="button" onClick={resend} className="font-semibold text-white underline underline-offset-4">
                {t("resend")}
              </button>
            )}
          </p>
          <p className="mt-3 text-center text-sm">
            <button type="button" onClick={() => { setStep("email"); setError(null); setDigits(EMPTY_CODE); }}
                    className="text-white/75 hover:text-white hover:underline">
              {t("other_email")}
            </button>
          </p>
        </form>
      )}

      {step === "done" && (
        <div className="text-center lg:text-left">
          <CircleCheck size={56} className="mx-auto mb-6 text-white lg:mx-0" aria-hidden />
          <p className="mb-8 rounded-2xl bg-white/15 px-4 py-3 text-sm">{t("reset_done_note")}</p>
          <Link href="/login"
                className="flex w-full items-center justify-center rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-black">
            {t("login_button")}
          </Link>
        </div>
      )}
    </AuthShell>
  );
}

function BackToLogin() {
  const { t } = usePrefs();
  return (
    <p className="mt-6 text-center text-sm">
      <Link href="/login" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white hover:underline">
        <ArrowLeft size={16} aria-hidden /> {t("back_to_login")}
      </Link>
    </p>
  );
}

"use client";
/**
 * Frontend (web) · Task 10 · /register - sign up (FR-1; the code is sent by email, revision R1).
 * Layout follows the "Don't have an account? / Sign Up" night-city reference:
 * underline inputs with icons on the right, a terms checkbox, an outline "Sign up >" button.
 * On success we go to /verify?email=... to type the 6-digit code.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ChevronRight, Mail, Phone, User as UserIcon } from "lucide-react";
import hatirjheel from "@/public/images/auth-register-hatirjheel-bridge.jpg";
import { AuthShell } from "@/components/auth/AuthShell";
import { Check, Field, FormError, OutlineButton } from "@/components/auth/FormParts";
import { usePrefs } from "@/components/PreferencesProvider";
import { api, ApiError } from "@/lib/api";

export default function RegisterPage() {
  const { t } = usePrefs();
  const router = useRouter();
  const [form, setForm] = useState({ name_en: "", name_bn: "", phone: "", email: "", password: "" });
  const [agreed, setAgreed] = useState(false);
  const [agreeError, setAgreeError] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [busy, setBusy] = useState(false);

  // A small helper so each input only needs one line
  const bind = (name: keyof typeof form) => ({
    name,
    value: form[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [name]: e.target.value }),
    error: error?.fields?.[name],
  });

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!agreed) {
      setAgreeError(true);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api("/auth/register", { method: "POST", body: { ...form, name_bn: form.name_bn || null } });
      router.push(`/verify?email=${encodeURIComponent(form.email.trim().toLowerCase())}`);
    } catch (problem) {
      setError(problem as ApiError);
    } finally {
      setBusy(false);
    }
  }

  const hasFieldErrors = error && Object.keys(error.fields ?? {}).length > 0;

  return (
    <AuthShell
      photo={hatirjheel}
      photoAlt="Hatirjheel bridge in Dhaka lit up at night, reflected in the water"
      sideTitle={t("register_side_title")}
      sideText={t("register_side_text")}
      title={t("register_title")}
    >
      <form onSubmit={submit} noValidate>
        <FormError>{error && !hasFieldErrors ? error.message : null}</FormError>

        <Field label={t("field_name_en")} autoComplete="name" placeholder="Rahim Uddin" icon={<UserIcon size={18} />} {...bind("name_en")} />
        <Field label={t("field_name_bn")} placeholder="রহিম উদ্দিন" {...bind("name_bn")} />
        <Field label={t("field_phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="01712345678"
               icon={<Phone size={18} />} {...bind("phone")} />
        <Field label={t("field_email")} type="email" autoComplete="email" placeholder="you@example.com"
               icon={<Mail size={18} />} {...bind("email")} />
        <Field label={t("field_password")} type="password" autoComplete="new-password" placeholder="••••••••"
               hint={t("password_hint")} {...bind("password")} />

        <div className="mb-8">
          <Check checked={agreed} onChange={(v) => { setAgreed(v); setAgreeError(false); }}
                 error={agreeError ? t("agree_required") : undefined}>
            {t("agree_terms")}
          </Check>
        </div>

        {/* Outline "Sign up >" (left) + "Have an account? Log in" (right), like the reference */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <OutlineButton busy={busy}>
            {t("register_button")} <ChevronRight size={16} aria-hidden />
          </OutlineButton>
          <Link href="/login" className="text-sm text-white/85 underline underline-offset-4 hover:text-white">
            {t("have_account")}
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}

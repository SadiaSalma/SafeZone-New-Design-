"use client";
/**
 * Frontend (web) · Task 10 · /login - log in with phone number + password (FR-2).
 * Layout follows the "Welcome back" split-screen reference.
 * On success the backend sets the log-in cookies, we remember the user (useAuth)
 * and go to the home page.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Phone } from "lucide-react";
import rainyNight from "@/public/images/auth-login-rainy-night.jpg";
import { AuthShell } from "@/components/auth/AuthShell";
import { Check, Field, FormError, PrimaryButton } from "@/components/auth/FormParts";
import { useAuth, type User } from "@/components/AuthProvider";
import { usePrefs } from "@/components/PreferencesProvider";
import { api, ApiError } from "@/lib/api";

export default function LoginPage() {
  const { t } = usePrefs();
  const { setUser } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ phone: "", password: "", remember: true });
  const [error, setError] = useState<ApiError | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); // stop the browser's own page reload
    setBusy(true);
    setError(null);
    try {
      const answer = await api<{ user: User }>("/auth/login", { method: "POST", body: form });
      setUser(answer.user);
      router.push("/");
    } catch (problem) {
      setError(problem as ApiError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      photo={rainyNight}
      photoAlt="A person with an umbrella walking on a wet Dhaka street at night"
      sideTitle={t("login_side_title")}
      sideText={t("login_side_text")}
      title={t("login_title")}
      subtitle={t("login_sub")}
    >
      <form onSubmit={submit} noValidate>
        <FormError>
          {error && !error.fields?.phone && (
            <>
              {error.message}{" "}
              {error.code === "account_not_verified" && (
                <Link href="/verify" className="font-semibold underline">{t("enter_code_link")}</Link>
              )}
            </>
          )}
        </FormError>

        <Field label={t("field_phone")} name="phone" type="tel" inputMode="tel" autoComplete="tel"
               placeholder="01712345678" icon={<Phone size={18} />}
               value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
               error={error?.fields?.phone} />
        <Field label={t("field_password")} name="password" type="password" autoComplete="current-password"
               placeholder="••••••••"
               value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
               error={error?.fields?.password} />

        {/* Remember me (left) + Forgot your password? (right), like the reference */}
        <div className="mb-10 flex items-center justify-between gap-4">
          <Check checked={form.remember} onChange={(remember) => setForm({ ...form, remember })}>
            {t("remember_me")}
          </Check>
          <Link href="/forgot-password" className="text-sm font-medium text-white hover:underline">
            {t("forgot_password")}
          </Link>
        </div>

        <PrimaryButton busy={busy}>{t("login_button")}</PrimaryButton>

        <p className="mt-6 text-center text-sm text-white/75">
          {t("no_account")}{" "}
          <Link href="/register" className="font-semibold text-white hover:underline">{t("register_here")}</Link>
        </p>
      </form>
    </AuthShell>
  );
}

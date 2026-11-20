"use client";
/**
 * Frontend (web) · Task 10 · FormParts.tsx - small building blocks for the account forms:
 *   <Field>         an input with a thin underline (like the reference designs),
 *                   a label, an optional icon, a hint, and the error under it
 *   <PrimaryButton> the dark pill button ("Log in", "Create account" ...)
 *   <FormError>     a box for errors that are not about one field
 */
import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { usePrefs } from "@/components/PreferencesProvider";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ReactNode;
  hint?: string;
  error?: string;
};

export function Field({ label, icon, hint, error, type = "text", id, ...input }: FieldProps) {
  const { t } = usePrefs();
  const [show, setShow] = useState(false); // for passwords: show/hide the text
  const inputId = id ?? input.name;
  const isPassword = type === "password";

  return (
    <div className="mb-6">
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-white/90">
        {label}
      </label>
      <div className={`flex items-center gap-2 border-b pb-2 transition-colors ${error ? "border-red-300" : "border-white/40 focus-within:border-white"}`}>
        <input
          id={inputId}
          type={isPassword && show ? "text" : type}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className="w-full bg-transparent py-1 text-base text-white placeholder:text-white/45 focus:outline-none"
          {...input}
        />
        {isPassword ? (
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? t("hide_password") : t("show_password")}
                  className="text-white/70 hover:text-white">
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : (
          icon && <span className="text-white/70" aria-hidden>{icon}</span>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-200">{error}</p>
      ) : (
        hint && <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-white/55">{hint}</p>
      )}
    </div>
  );
}

export function PrimaryButton({ busy, children }: { busy?: boolean; children: ReactNode }) {
  const { t } = usePrefs();
  return (
    <button
      type="submit"
      disabled={busy}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-black disabled:opacity-70"
    >
      {busy ? (
        <>
          <LoaderCircle size={18} className="animate-spin" aria-hidden /> {t("working")}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/** The outline pill button from the sign-up reference ("Sign Up >"). */
export function OutlineButton({ busy, children }: { busy?: boolean; children: ReactNode }) {
  const { t } = usePrefs();
  return (
    <button
      type="submit"
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-full border border-white/80 px-7 py-2.5 text-sm font-medium text-white transition hover:bg-white/15 disabled:opacity-70"
    >
      {busy ? (
        <>
          <LoaderCircle size={16} className="animate-spin" aria-hidden /> {t("working")}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/** A small square checkbox with text, like "Remember me" in the reference. */
export function Check({ checked, onChange, children, error }: {
  checked: boolean; onChange: (value: boolean) => void; children: ReactNode; error?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-sm text-white/85">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
             className="mt-0.5 size-4 shrink-0 accent-white" />
      <span>
        {children}
        {error && <span className="mt-1 block text-xs text-red-200">{error}</span>}
      </span>
    </label>
  );
}

export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <div role="alert" className="mb-5 rounded-2xl border border-red-300/40 bg-red-500/20 px-4 py-3 text-sm text-red-50">
      {children}
    </div>
  );
}

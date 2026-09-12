"use client";

import { useRef, useState } from "react";
import { AlertCircle, Check, Copy, Database, KeyRound, Lock, Mail } from "lucide-react";
import { useLocale } from "@/lib/locale-context";

// The sign-in card. Its main job during a demo is to fail *usefully*: if the
// database or the demo credentials aren't configured yet, it says exactly which
// environment variables are missing instead of bouncing the visitor through an
// error page and back.

const ERRORS: Record<string, { en: string; id: string }> = {
  bad_credentials: {
    en: "That email and password don't match. Check both and try again.",
    id: "Email dan password itu tidak cocok. Periksa keduanya lalu coba lagi.",
  },
  demo_unconfigured: {
    en: "Demo sign-in isn't set up yet. Add DEMO_EMAIL and DEMO_PASSWORD, then restart.",
    id: "Login demo belum diatur. Tambahkan DEMO_EMAIL dan DEMO_PASSWORD, lalu restart.",
  },
  no_db: {
    en: "Sign-in needs a database — set DATABASE_URL. Without it the session would point at nothing.",
    id: "Login butuh database — set DATABASE_URL. Tanpanya sesi tidak akan menemukan apa pun.",
  },
  // The Google routes are still in the codebase but no longer linked from this
  // card. Keeping their messages means a direct visit to one of them still
  // explains itself rather than showing an unexplained empty page.
  not_configured: {
    en: "Google sign-in isn't configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, or use the demo login below.",
    id: "Login Google belum dikonfigurasi. Tambahkan GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET, atau pakai login demo di bawah.",
  },
  cancelled: {
    en: "Sign-in was cancelled at Google. You can try again whenever you're ready.",
    id: "Login dibatalkan di Google. Anda bisa mencoba lagi kapan saja.",
  },
  state_mismatch: {
    en: "That sign-in attempt expired. Please start again.",
    id: "Percobaan login itu kedaluwarsa. Silakan mulai lagi.",
  },
  exchange_failed: {
    en: "Google accepted the sign-in but we couldn't read your profile. Check the server logs.",
    id: "Google menerima login tetapi profil Anda tidak dapat dibaca. Periksa log server.",
  },
  invalid_response: {
    en: "Google's response was incomplete. Please try again.",
    id: "Respons Google tidak lengkap. Silakan coba lagi.",
  },
};

const inputClass =
  "w-full rounded-xl border border-line bg-white pl-10 pr-3.5 py-2.5 text-[14px] text-fg placeholder:text-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition";

export default function SignInPanel({
  next,
  error,
  demoReady,
  dbReady,
  demo,
}: {
  next: string;
  error?: string;
  demoReady: boolean;
  dbReady: boolean;
  /** The demo pair, printed below the form so a presenter can tap to copy. */
  demo: { email: string; password: string } | null;
}) {
  const { t, locale } = useLocale();
  const message = error ? ERRORS[error] : undefined;

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Which field was just copied, so its button can confirm it for a moment.
  const [copied, setCopied] = useState<"email" | "password" | null>(null);

  async function copy(kind: "email" | "password", value: string) {
    // navigator.clipboard needs a secure context. localhost and https qualify;
    // a plain-http LAN address (a phone on the same wifi) does not — so fall
    // back to selecting the text, which the visitor can then copy by hand.
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const el = kind === "email" ? emailRef.current : passwordRef.current;
      el?.select();
      return;
    }
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1600);
  }

  function useCredentials() {
    if (!demo) return;
    if (emailRef.current) emailRef.current.value = demo.email;
    if (passwordRef.current) passwordRef.current.value = demo.password;
    setCopied(null);
  }

  const blockers: { icon: typeof KeyRound; text: string }[] = [];
  if (!demoReady) {
    blockers.push({ icon: KeyRound, text: t("signin.needDemo") });
  }
  if (!dbReady) {
    blockers.push({ icon: Database, text: t("signin.needDb") });
  }

  return (
    <div className="bg-surface border border-line rounded-3xl p-6 sm:p-7 shadow-[var(--sh-2)]">
      <h1 className="text-xl font-bold text-fg tracking-tight">{t("signin.title")}</h1>
      <p className="text-[13px] text-muted mt-1.5 mb-6 leading-relaxed">
        {t("signin.sub")}
      </p>

      {message && (
        <div
          role="alert"
          className="flex items-start gap-2 text-[12px] text-[var(--danger)] bg-danger/10 rounded-xl px-3.5 py-3 mb-5"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-px" aria-hidden="true" />
          <span>{message[locale]}</span>
        </div>
      )}

      {blockers.length > 0 ? (
        <div className="space-y-3">
          {blockers.map(({ icon: Icon, text }, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 text-[12px] leading-relaxed text-amber-800 bg-amber-500/10 rounded-xl px-3.5 py-3"
            >
              <Icon className="w-4 h-4 shrink-0 mt-px" aria-hidden="true" />
              <span>{text}</span>
            </div>
          ))}
          <p className="text-[11px] text-muted leading-relaxed pt-1">
            {t("signin.setupHint")}
          </p>
        </div>
      ) : (
        <form method="post" action="/api/auth/demo" className="space-y-3.5">
          {/* Where to land after signing in, carried through the POST. */}
          <input type="hidden" name="next" value={next} />

          <div>
            <label htmlFor="si-email" className="block text-[12px] font-semibold text-fg mb-1.5">
              {t("signin.email")}
            </label>
            <div className="relative">
              <Mail
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="si-email"
                name="email"
                type="email"
                ref={emailRef}
                className={inputClass}
                placeholder="demo@batamsmart.test"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="si-pass" className="block text-[12px] font-semibold text-fg mb-1.5">
              {t("signin.password")}
            </label>
            <div className="relative">
              <Lock
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="si-pass"
                name="password"
                type="password"
                ref={passwordRef}
                className={inputClass}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-accent text-white hover:bg-accent-hover text-[14px] font-semibold py-3 rounded-xl transition-colors"
          >
            {t("signin.submit")}
          </button>
        </form>
      )}

      {/* The demo pair, printed so nobody has to read it off a slide. Shown only
          when sign-in is actually configured, so it can never disagree with
          what the form accepts. */}
      {demo && blockers.length === 0 && (
        <div className="mt-5 rounded-2xl border border-dashed border-line bg-bg/60 p-3.5">
          <div className="flex items-center gap-1.5 mb-2.5">
            <KeyRound className="w-3.5 h-3.5 text-muted" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wide">
              {t("signin.demoTitle")}
            </span>
          </div>

          <div className="space-y-2">
            {(
              [
                ["email", demo.email, t("signin.email"), t("signin.demoCopyLabel")],
                ["password", demo.password, t("signin.password"), t("signin.demoCopyPass")],
              ] as const
            ).map(([kind, value, label, copyLabel]) => (
              <div key={kind} className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-subtle mb-0.5">{label}</div>
                  <div className="font-mono text-[13px] text-fg truncate">{value}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copy(kind, value)}
                  aria-label={copyLabel}
                  className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-accent-ink bg-accent/10 hover:bg-accent/20 rounded-lg px-2.5 py-1.5 transition-colors"
                >
                  {copied === kind ? (
                    <>
                      <Check className="w-3 h-3" aria-hidden="true" />
                      {t("signin.demoCopied")}
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" aria-hidden="true" />
                      {t("signin.demoCopy")}
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* The copy buttons carry an aria-label, which overrides their visible
              text — so the swap to "Copied" is silent to a screen reader. This
              live region is what actually announces the result. */}
          <p aria-live="polite" className="sr-only">
            {copied ? `${t("signin.demoCopied")} ${copied === "email" ? t("signin.email") : t("signin.password")}` : ""}
          </p>

          <button
            type="button"
            onClick={useCredentials}
            className="w-full mt-3 text-[12px] font-semibold text-fg bg-surface border border-line hover:border-accent rounded-lg py-2 transition-colors"
          >
            {t("signin.demoUse")}
          </button>
        </div>
      )}

      <p className="text-[11px] text-muted mt-5 leading-relaxed">
        {t("signin.privacy")}
      </p>
    </div>
  );
}

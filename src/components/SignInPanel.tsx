"use client";

import { AlertCircle, Database, KeyRound } from "lucide-react";
import { useLocale } from "@/lib/locale-context";

// The sign-in card. Its main job during a demo is to fail *usefully*: if Google
// credentials or the database aren't configured yet, it says exactly which
// environment variables are missing instead of bouncing the visitor through a
// Google error page and back.

const ERRORS: Record<string, { en: string; id: string }> = {
  not_configured: {
    en: "Google sign-in isn't configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, then restart.",
    id: "Login Google belum dikonfigurasi. Tambahkan GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET, lalu restart.",
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

export default function SignInPanel({
  next,
  error,
  googleReady,
  dbReady,
}: {
  next: string;
  error?: string;
  googleReady: boolean;
  dbReady: boolean;
}) {
  const { t, locale } = useLocale();
  const message = error ? ERRORS[error] : undefined;

  const blockers: { icon: typeof KeyRound; text: string }[] = [];
  if (!googleReady) {
    blockers.push({
      icon: KeyRound,
      text: t("signin.needGoogle"),
    });
  }
  if (!dbReady) {
    blockers.push({
      icon: Database,
      text: t("signin.needDb"),
    });
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
        <a
          href={`/api/auth/google?next=${encodeURIComponent(next)}`}
          className="flex w-full items-center justify-center gap-3 bg-white border border-line-strong hover:bg-surface-sunken text-fg text-[14px] font-semibold py-3.5 rounded-xl transition-colors shadow-[var(--sh-1)]"
        >
          <GoogleMark />
          {t("signin.google")}
        </a>
      )}

      <p className="text-[11px] text-muted mt-5 leading-relaxed">
        {t("signin.privacy")}
      </p>
    </div>
  );
}

// Google's mark, inline so it renders without a network request. The brand
// colours are required by their sign-in guidelines.
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

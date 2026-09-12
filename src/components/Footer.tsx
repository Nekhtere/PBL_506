"use client";

import { useLocale } from "@/lib/locale-context";

const footerLinks = {
  // Absolute hash paths, not bare "#deals": this footer is shared with
  // /merchants, where a bare fragment points at nothing and does nothing.
  Product: [
    { labelKey: "nav.deals", href: "/#deals" },
    { labelKey: "nav.itinerary", href: "/#itinerary" },
    { labelKey: "nav.ferry", href: "/#ferry" },
    { labelKey: "nav.rideGuide", href: "/#ride-guide" },
    { labelKey: "how.label", href: "/#how-it-works" },
  ],
  Legal: [
    { labelKey: "footer.legal.privacy", href: "/legal/privacy" },
    { labelKey: "footer.legal.terms", href: "/legal/terms" },
    { labelKey: "footer.legal.cookies", href: "/legal/cookies" },
    { labelKey: "footer.legal.refunds", href: "/legal/refunds" },
  ],
};

export default function Footer() {
  const { t } = useLocale();
  return (
    <footer className="bg-[var(--surface-sunken)] border-t border-[var(--line-soft)] pt-8 pb-6 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Brand + primary links */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="text-center md:text-left">
            <span className="text-lg font-bold tracking-tight text-[var(--fg)]">
              Batam<span className="text-[var(--accent-ink)]">Smart</span>
            </span>
            <p className="text-[var(--muted)] text-sm mt-1">
              {t("footer.tagline")}
            </p>
          </div>
          <nav className="flex flex-wrap gap-4 justify-center md:justify-end text-sm">
            {footerLinks.Product.map(({ labelKey, href }) => (
              <a key={href} href={href} className="text-[var(--muted)] hover:text-[var(--fg)] transition-colors">
                {t(labelKey)}
              </a>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-[var(--muted)]">
          <p>{t("footer.copyright").replace("{year}", String(new Date().getFullYear()))}</p>
          <p>{t("footer.location")}</p>
          <div className="flex gap-2">
            {footerLinks.Legal.map(({ labelKey, href }, i) => (
              <span key={href} className="flex items-center">
                <a href={href} className="hover:underline">{t(labelKey)}</a>
                {i < footerLinks.Legal.length - 1 && <span className="mx-1 text-[var(--faint)]">|</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

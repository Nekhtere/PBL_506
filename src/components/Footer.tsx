"use client";

const footerLinks = {
  // Absolute hash paths, not bare "#deals": this footer is shared with
  // /merchants, where a bare fragment points at nothing and does nothing.
  Product: [
    { label: "Deals", href: "/#deals" },
    { label: "Itinerary", href: "/#itinerary" },
    { label: "Getting Here", href: "/#ferry" },
    { label: "Ride Guide", href: "/#ride-guide" },
    { label: "How It Works", href: "/#how-it-works" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Terms of Service", href: "/legal/terms" },
    { label: "Cookie Policy", href: "/legal/cookies" },
    { label: "Refund Policy", href: "/legal/refunds" },
  ],
};

export default function Footer() {
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
              Smart travel, simple vouchers.
            </p>
          </div>
          <nav className="flex flex-wrap gap-4 justify-center md:justify-end text-sm">
            {footerLinks.Product.map(({ label, href }) => (
              <a key={href} href={href} className="text-[var(--muted)] hover:text-[var(--fg)] transition-colors">
                {label}
              </a>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-[var(--muted)]">
          <p>© {new Date().getFullYear()} BatamSmart. All rights reserved.</p>
          <p>Batam, Kepulauan Riau, Indonesia · SGD / IDR supported</p>
          <div className="flex gap-2">
            {footerLinks.Legal.map(({ label, href }, i) => (
              <span key={href} className="flex items-center">
                <a href={href} className="hover:underline">{label}</a>
                {i < footerLinks.Legal.length - 1 && <span className="mx-1 text-[var(--faint)]">|</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

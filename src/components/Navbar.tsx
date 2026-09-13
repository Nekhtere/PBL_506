"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X, Ticket, LogOut, UserRound } from "lucide-react";
import { useCart, useCartUi } from "@/lib/cart-context";
import { useLocale } from "@/lib/locale-context";

// The site header. Mounted once by src/app/(site)/layout.tsx, so it is present
// on every page that belongs to the site — not just the home page.
//
// The cart drawer is NOT here: it lives in CartDrawer.tsx and is opened through
// the cart context. Splitting them keeps this component about identity and
// orientation, and means the drawer isn't re-created on every route change.

// "Home" is deliberately absent: the logo already links there, and at five
// items the pill stays uncrowded. "Destinations" is intentionally not here:
// it has its own page and users reach it from the home search/chips or the
// mobile menu, not through the main nav pill.
const navLinks = [
  { labelKey: "nav.nearme",  href: "/#near-me" },
  { labelKey: "nav.journey", href: "/#journey" },
  { labelKey: "nav.ferry",   href: "/#ferry" },
  { labelKey: "nav.bundle",  href: "/#bundle" },
  { labelKey: "nav.faq",     href: "/#faq" },
];

/** What /api/auth/me reports about the signed-in user. */
interface Account {
  signedIn: boolean;
  name?: string;
  email?: string;
  picture?: string | null;
}

/** One or two letters for the avatar when there is no picture to show. */
function initialsOf(account: Account): string {
  const source = account.name?.trim() || account.email?.trim() || "";
  if (!source) return "?";
  const words = source.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function Navbar() {
  const { locale, setLocale, t } = useLocale();
  const { count } = useCart();
  const { cartOpen, setCartOpen } = useCartUi();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // undefined = not asked yet; null would mean "asked, nobody signed in".
  const [account, setAccount] = useState<Account | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  // Off the home page the bar is the only way back to the sections, so it
  // keeps its solid look from the first paint rather than waiting for a scroll
  // that a short page may never produce.
  const onHome = pathname === "/";

  useEffect(() => {
    // Read the session once on mount. Kept to a single fetch: this navbar
    // renders on every page, and re-polling would be pointless churn.
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : { signedIn: false }))
      .then((data) => {
        if (!cancelled) setAccount(data?.signedIn ? data : { signedIn: false });
      })
      .catch(() => {
        if (!cancelled) setAccount({ signedIn: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Close the account menu on an outside click or Escape. The menu is the only
  // way to reach My Tickets and Sign out on a phone, so leaving it open with no
  // way out would trap the visitor behind the overlay it renders.
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [menuOpen]);

  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setScrolled(window.scrollY > 20));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 print:hidden"
    >
      <div
        className={`navbar-glass w-full max-w-3xl rounded-full px-5 py-2.5 flex items-center justify-between transition-all duration-300 ${
          scrolled || !onHome ? "navbar-glass--scrolled" : ""
        }`}
      >
        {/* Logo — "/#home" rather than "/", so that clicking it from an inner
            page lands at the top of the hero and clicking it on the home page
            while scrolled down scrolls back up. Next.js resolves the hash
            across routes, so this works from /tickets and /checkout too. */}
        <Link href="/#home" className="flex items-center gap-2 shrink-0">
          <span className="text-[15px] font-semibold tracking-tight text-fg">
            Batam<span className="text-[var(--accent-ink)]">Smart</span>
          </span>
        </Link>

        {/* Desktop Nav.
            A flex child (flex-1 + justify-center), NOT the absolutely-centred
            nav it used to be. Centring it with left-1/2 -translate-x-1/2 took
            it out of flow, so it could not push anything: the slack piled up on
            the left (101px) while the right cluster sat 46px away, and once the
            85px "Sign in" pill was showing, the two actually overlapped — by
            11px at 1280 and 27px at 768. As a flex child it absorbs the free
            space and splits it evenly, so both gaps are the same and overlap is
            structurally impossible. */}
        <nav
          aria-label={t("nav.primary")}
          className="hidden md:flex flex-1 min-w-0 items-center justify-center gap-0.5"
        >
          {navLinks.map((link) => (
            // Link, not <a>: same-page hashes scroll without a reload, and
            // from an inner page the hop back to / stays client-side.
            <Link
              key={link.href}
              href={link.href}
              className="px-3.5 py-1.5 text-[13px] font-medium text-fg rounded-full hover:shadow-md hover:shadow-accent/30 transition-shadow duration-200"
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* Language / Currency Toggle */}
          <button
            onClick={() => setLocale(locale === "en" ? "id" : "en")}
            aria-label={locale === "en" ? "Switch to Indonesian / IDR" : "Switch to English / SGD"}
            className="flex items-center gap-0 rounded-full bg-black/[0.06] hover:bg-black/[0.10] transition-colors duration-200 overflow-hidden text-[11px] font-semibold h-7"
          >
            <span className={`px-2.5 h-full flex items-center transition-colors duration-200 rounded-full ${locale === "en" ? "bg-accent text-white" : "text-muted"}`}>
              EN
            </span>
            <span className={`px-2.5 h-full flex items-center transition-colors duration-200 rounded-full ${locale === "id" ? "bg-accent text-white" : "text-muted"}`}>
              ID
            </span>
          </button>

          {/* Account — the session is read from an API route after mount, since
              this navbar is a client component and the cookie is httpOnly. */}
          {account === null ? (
            <span className="w-7 h-7 rounded-full bg-black/[0.06] animate-pulse" aria-hidden="true" />
          ) : account.signedIn ? (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={t("nav.account")}
                className="w-7 h-7 rounded-full overflow-hidden bg-accent text-white text-[11px] font-bold flex items-center justify-center ring-1 ring-black/5 hover:ring-accent/40 transition-shadow"
              >
                {account.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={account.picture} alt="" className="w-full h-full object-cover" draggable={false} />
                ) : (
                  initialsOf(account)
                )}
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    role="menu"
                    aria-label={t("nav.account")}
                    className="navbar-glass absolute right-0 top-[calc(100%+10px)] w-60 rounded-2xl p-2 shadow-[var(--sh-2)]"
                  >
                    {/* Who is signed in — the demo has one account, so naming
                        it here is what tells the presenter the login worked. */}
                    <div className="px-3 py-2.5">
                      <p className="text-[13px] font-semibold text-fg truncate">
                        {account.name || t("nav.account")}
                      </p>
                      {account.email && (
                        <p className="text-[11px] text-muted truncate mt-0.5">{account.email}</p>
                      )}
                    </div>
                    <div className="h-px bg-line-soft mx-2 my-1" />

                    <Link
                      href="/tickets"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-[13px] font-medium text-fg hover:bg-black/[0.06] transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-muted" strokeWidth={1.8} aria-hidden="true" />
                      {t("nav.myTickets")}
                    </Link>

                    {/* A plain anchor, not a Link: this hits a route handler that
                        clears the cookie and redirects, so the browser must do a
                        real navigation rather than a client-side one.

                        Hidden on /checkout: the sign-out policy is uniform (any
                        session loss lands on /), but during a live payment the
                        menu must not offer an action that silently drops the
                        filled-in form. The cart survives in sessionStorage, so a
                        deliberate sign-out from elsewhere is unaffected. */}
                    {pathname !== "/checkout" && (
                      <a
                        href="/api/auth/signout"
                        role="menuitem"
                        className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-[13px] font-medium text-fg hover:bg-black/[0.06] transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-muted" strokeWidth={1.8} aria-hidden="true" />
                        {t("nav.signout")}
                      </a>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/signin"
              className="flex items-center gap-1.5 text-[12px] font-semibold text-fg border border-line-strong hover:bg-black/[0.06] px-3 py-1.5 rounded-full transition-colors"
            >
              <UserRound className="w-3.5 h-3.5" strokeWidth={1.8} aria-hidden="true" />
              {t("nav.signin")}
            </Link>
          )}

          {/* Cart. Hidden while empty, like the mobile bar at the foot of the
              page — an always-present "Open cart — 0 items" button was both
              clutter and 40px of the pill spent on nothing. It was the widest
              thing standing between the centred nav and the right cluster, so
              dropping it is also what gives the row its room back.

              The `cartOpen` half of the condition matters: removing the last
              item happens inside the open drawer, and if the button unmounted
              right then, focus would fall to <body> on close with nothing to
              return to. Keeping it mounted until the drawer shuts means the
              trigger the drawer was opened from is still there to catch focus.

              The badge then becomes the first thing the eye catches when the
              item lands, which is a better "added" signal than a "0" that never
              moved. */}
          {(count > 0 || cartOpen) && (
            <button
              className="relative p-2 rounded-full hover:bg-black/[0.06] transition-all duration-200"
              onClick={() => setCartOpen(true)}
              aria-label={`${t("cart.open")} — ${count} ${count === 1 ? t("cart.item") : t("cart.items")}`}
            >
              <ShoppingCart className="w-[18px] h-[18px] text-fg" strokeWidth={1.8} aria-hidden="true" />
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none"
                >
                  {count}
                </motion.span>
              )}
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-black/[0.06] transition-all duration-200"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="w-4 h-4 text-fg" aria-hidden="true" />
            ) : (
              <Menu className="w-4 h-4 text-fg" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="navbar-glass absolute top-[calc(100%+8px)] left-4 right-4 max-w-3xl mx-auto rounded-2xl px-4 py-3 flex flex-col gap-0.5"
            role="menu"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-[14px] font-medium text-fg rounded-xl hover:shadow-md hover:shadow-black/10 transition-shadow"
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

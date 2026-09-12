"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Menu, X, AlertTriangle } from "lucide-react";
import { saveCartForCheckout } from "@/lib/checkout";
import { findCoverageClashes, type Covered } from "@/lib/coverage";
import { useLocale } from "@/lib/locale-context";
import type { Locale } from "@/lib/locale-context";

export type { Locale };

const navLinks = [
  { labelKey: "nav.home",    href: "/#home" },
  { labelKey: "nav.nearme",  href: "/#near-me" },
  { labelKey: "nav.journey", href: "/#journey" },
  { labelKey: "nav.ferry",   href: "/#ferry" },
  { labelKey: "nav.bundle",  href: "/#bundle" },
  { labelKey: "nav.faq",     href: "/#faq" },
];

/** Passenger details captured by the ferry booking form. Carried through the
    cart to checkout so the issued e-ticket can print the real crossing. */
export interface FerryBooking {
  passenger: string;
  passportNumber: string;
  passportExpiry: string;
  nationality: string;
  routeFrom: string;
  routeTo: string;
  travelDate: string;
  schedule: string;
  tripType: "one-way" | "return";
}

export interface CartItem {
  id: string;
  name: string;
  price: string;
  subtitle?: string;
  image?: string;
  items?: string[];
  kind: "deal" | "route";
  /** What this purchase already includes — drives the double-booking warning
      in the cart. Set by the section that adds the item; see lib/coverage.ts. */
  covers?: Covered[];
  /** Present only on a ferry line — the details the e-ticket needs. */
  ferry?: FerryBooking;
}

export default function Navbar({ items, onRemoveItem, cartOpen, onCartOpenChange }: {
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  cartOpen: boolean;
  onCartOpenChange: (open: boolean) => void;
}) {
  const { locale, setLocale, t } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const cartCount = items.length;
  const total = items.reduce((sum, item) => sum + parseFloat(item.price.replace(/[^0-9.]/g, "") || "0"), 0);
  const totalIDR = Math.round(total * 11800);
  const isID = locale === "id";
  // Warns when the cart holds a bundle plus something the bundle already
  // includes. Advisory only — the buyer may have a real reason, so this never
  // blocks checkout. See lib/coverage.ts for the rule.
  const clashes = findCoverageClashes(items);
  const coveredLabel = (c: Covered) => t(`cart.covers.${c}`);

  const priceDisplay = (raw: string) => {
    if (!isID) return raw;
    const num = parseFloat(raw.replace(/[^0-9.]/g, "") || "0");
    return `Rp ${Math.round(num * 11800).toLocaleString("id-ID")}`;
  };
  const totalDisplay = isID ? `Rp ${totalIDR.toLocaleString("id-ID")}` : `S$ ${total.toFixed(2)}`;

  // The cart snapshot crosses to /checkout via sessionStorage (client state
  // can't reach a separate route on its own).
  const goToCheckout = () => {
    saveCartForCheckout(items);
    onCartOpenChange(false);
    router.push("/checkout");
  };

  useEffect(() => {
    if (!cartOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // The cart overlay had no Escape handler, so the only way out was the mouse.
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCartOpenChange(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [cartOpen, onCartOpenChange]);

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
      className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4"
    >
      <div
        className={`navbar-glass w-full max-w-3xl rounded-full px-5 py-2.5 flex items-center justify-between transition-all duration-300 ${
          scrolled ? "navbar-glass--scrolled" : ""
        }`}
      >
        {/* Logo */}
        <Link href="/#home" className="flex items-center gap-2 shrink-0">
          <span className="text-[15px] font-semibold tracking-tight text-fg">
            Batam<span className="text-[var(--accent-ink)]">Smart</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3.5 py-1.5 text-[13px] font-medium text-fg rounded-full hover:shadow-md hover:shadow-accent/30 transition-shadow duration-200"
            >
              {t(link.labelKey)}
            </a>
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
            <span className={`px-2.5 h-full flex items-center transition-colors duration-200 rounded-full ${locale === "en" ? "bg-accent text-white" : "text-fg/50"}`}>
              EN
            </span>
            <span className={`px-2.5 h-full flex items-center transition-colors duration-200 rounded-full ${locale === "id" ? "bg-accent text-white" : "text-fg/50"}`}>
              ID
            </span>
          </button>

          {/* Cart */}
          <button
            className="relative p-2 rounded-full hover:bg-black/[0.06] transition-all duration-200"
            onClick={() => onCartOpenChange(true)}
            aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
          >
            <ShoppingCart className="w-[18px] h-[18px] text-fg" strokeWidth={1.8} aria-hidden="true" />
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none"
              >
                {cartCount}
              </motion.span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-black/[0.06] transition-all duration-200"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
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
              <a
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-[14px] font-medium text-fg rounded-xl hover:shadow-md hover:shadow-black/10 transition-shadow"
              >
                {t(link.labelKey)}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Screen */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/45 p-3 sm:p-6 backdrop-blur-md"
            onClick={() => onCartOpenChange(false)}
          >
            <motion.section
              className="card-soft relative w-full max-w-md max-h-full overflow-y-auto rounded-t-[28px] sm:rounded-[28px] bg-white"
              role="dialog"
              aria-modal="true"
              aria-label="Shopping cart"
              initial={{ opacity: 0, scale: 0.94, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 28 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="glass absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-fg transition-transform hover:scale-105"
                onClick={() => onCartOpenChange(false)}
                aria-label="Close cart"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>

              <div className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-bold text-fg">{t("cart.title")}</h3>
                  {items.length > 0 && (
                    <span className="text-[11px] font-semibold text-muted bg-surface-sunken px-2.5 py-1 rounded-full">
                      {items.length} item{items.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-muted mb-5">{t("cart.subtitle")}</p>

                {items.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-surface-sunken flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-faint" aria-hidden="true" />
                    </div>
                    <p className="text-[13px] text-muted leading-relaxed">
                      {t("cart.empty")}<br />{t("cart.emptyBody")}
                    </p>
                  </div>
                ) : (
                  <>
                    <ul className="space-y-2.5 max-h-[46dvh] overflow-y-auto pr-1 scrollbar-hide">
                      <AnimatePresence initial={false}>
                        {items.map((item) => (
                          <motion.li
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.2 }}
                            className="flex gap-3 bg-surface-sunken rounded-2xl p-3"
                          >
                            {/* Thumbnail */}
                            {item.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-14 h-14 rounded-xl object-cover shrink-0"
                                draggable={false}
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-bold text-accent-ink uppercase tracking-wide">
                                  {item.kind === "route" ? t("cart.badgeRoute") : t("cart.badgeDeal")}
                                </span>
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-[13px] font-semibold text-fg leading-snug">{item.name}</p>
                                <p className="text-[13px] font-bold text-fg shrink-0">{priceDisplay(item.price)}</p>
                              </div>
                              {item.subtitle && (
                                <p className="text-[11px] text-muted mt-0.5">{item.subtitle}</p>
                              )}
                              {item.items && item.items.length > 0 && (
                                <p className="text-[11px] text-muted mt-1.5 leading-relaxed line-clamp-2">
                                  {item.items.join(" · ")}
                                </p>
                              )}
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-[10px] font-medium text-accent-ink bg-accent/10 px-2 py-0.5 rounded-full">
                                  {item.kind === "route" ? t("cart.badgeRoute") : t("cart.qrVoucher")}
                                </span>
                                <button
                                  className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-muted hover:text-red-500 transition-colors shrink-0"
                                  onClick={() => onRemoveItem(item.id)}
                                  aria-label={`Remove ${item.name} from cart`}
                                >
                                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                                </button>
                              </div>
                            </div>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>

                    {/* Double-booking warning. Advisory: it explains the
                        overlap and lets the buyer remove the redundant line
                        themselves, rather than silently altering their cart. */}
                    {clashes.length > 0 && (
                      <div
                        role="status"
                        className="mt-3 rounded-2xl bg-amber-500/10 px-3.5 py-3 text-[11.5px] leading-relaxed text-amber-800"
                      >
                        <p className="font-bold mb-1 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          {t("cart.clash.title")}
                        </p>
                        {clashes.map((c) => (
                          <p key={`${c.includes}|${c.redundant}|${c.covered}`}>
                            {t("cart.clash.body")
                              .replace("{includes}", c.includes)
                              .replace("{covered}", coveredLabel(c.covered))
                              .replace("{redundant}", c.redundant)}
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="pt-4 mt-4 border-t border-line-soft space-y-1.5">
                      <div className="flex items-center justify-between text-[12px] text-muted">
                        <span>{t("cart.subtotal")}</span>
                        <span>{totalDisplay}</span>
                      </div>
                      <div className="flex items-center justify-between text-[12px] text-muted">
                        <span>{t("cart.fee")}</span>
                        <span className="text-emerald-600 font-medium">{t("cart.free")}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <p className="text-[13px] font-semibold text-fg">{t("cart.total")}</p>
                          <p className="text-[11px] text-muted">
                            {isID ? `≈ S$ ${total.toFixed(2)} · dibayar dalam IDR` : `≈ Rp ${totalIDR.toLocaleString("id-ID")} · charged in SGD`}
                          </p>
                        </div>
                        <p className="text-xl font-bold text-fg">{totalDisplay}</p>
                      </div>
                      <button
                        onClick={goToCheckout}
                        className="mt-3 w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-[14px] font-bold py-3 rounded-xl transition-colors duration-200 shadow-lg shadow-accent/25"
                      >
                        <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                        {t("cart.checkout")} · {totalDisplay}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

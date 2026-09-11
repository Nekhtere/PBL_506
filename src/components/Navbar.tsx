"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/#home" },
  { label: "Deals", href: "/#deals" },
  { label: "Itinerary", href: "/#itinerary" },
  { label: "Ferry", href: "/#ferry" },
  { label: "Ride Guide", href: "/#ride-guide" },
];

export interface CartItem {
  id: string;
  name: string;
  price: string; // e.g. "S$ 14"
  subtitle?: string; // e.g. category, route type
  image?: string;    // photo URL
  items?: string[];  // included merchant/voucher names
  kind: "deal" | "route";
}

export default function Navbar({ items, onRemoveItem, cartOpen, onCartOpenChange }: {
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  cartOpen: boolean;
  onCartOpenChange: (open: boolean) => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = items.length;
  const total = items.reduce((sum, item) => sum + parseFloat(item.price.replace(/[^0-9.]/g, "") || "0"), 0);
  // Indicative conversion for IDR-side comparison. Fixed rate is a rough guide only.
  // ponytail: swap for a live FX rate (or a daily constant) when pricing goes real.
  const totalIDR = Math.round(total * 11800);

  useEffect(() => {
    if (!cartOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [cartOpen]);

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
          <span className="text-[15px] font-semibold tracking-tight text-[#1D1D1F]">
            Batam<span className="text-[#0071E3]">Smart</span>
          </span>
        </Link>

        {/* Desktop Nav — centred absolutely so logo + actions balance independently */}
        <nav className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3.5 py-1.5 text-[13px] font-medium text-[#1D1D1F] rounded-full hover:shadow-md hover:shadow-[#0071E3]/30 transition-shadow duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* Cart */}
          <button
            className="relative p-2 rounded-full hover:bg-black/[0.06] transition-all duration-200"
            onClick={() => onCartOpenChange(true)}
            aria-label={`Cart, ${cartCount} items`}
          >
            <ShoppingCart className="w-[18px] h-[18px] text-[#1D1D1F]" strokeWidth={1.8} aria-hidden="true" />
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#0071E3] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none"
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
              <X className="w-4 h-4 text-[#1D1D1F]" aria-hidden="true" />
            ) : (
              <Menu className="w-4 h-4 text-[#1D1D1F]" aria-hidden="true" />
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
                className="px-3 py-2.5 text-[14px] font-medium text-[#1D1D1F] rounded-xl hover:shadow-md hover:shadow-black/10 transition-shadow"
              >
                {link.label}
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
                className="glass absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-[#1D1D1F] transition-transform hover:scale-105"
                onClick={() => onCartOpenChange(false)}
                aria-label="Close cart"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>

              <div className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-bold text-[#1D1D1F]">Your Cart</h3>
                  {items.length > 0 && (
                    <span className="text-[11px] font-semibold text-[#515154] bg-[#F5F5F7] px-2.5 py-1 rounded-full">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-[#515154] mb-5">E-Cash vouchers, redeemed via QR at the merchant.</p>

                {items.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#F5F5F7] flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-[#C7C7CC]" aria-hidden="true" />
                    </div>
                    <p className="text-[13px] text-[#515154] leading-relaxed">
                      Your cart is empty.<br />Add a deal or itinerary route to get started.
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
                            className="flex gap-3 bg-[#F5F5F7] rounded-2xl p-3"
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
                                <span className="text-[10px] font-bold text-[#0071E3] uppercase tracking-wide">
                                  {item.kind === "route" ? "Route" : "Deal"}
                                </span>
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-[13px] font-semibold text-[#1D1D1F] leading-snug">{item.name}</p>
                                <p className="text-[13px] font-bold text-[#1D1D1F] shrink-0">{item.price}</p>
                              </div>
                              {item.subtitle && (
                                <p className="text-[11px] text-[#515154] mt-0.5">{item.subtitle}</p>
                              )}
                              {item.items && item.items.length > 0 && (
                                <p className="text-[11px] text-[#515154] mt-1.5 leading-relaxed line-clamp-2">
                                  {item.items.join(" · ")}
                                </p>
                              )}
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-[10px] font-medium text-[#0071E3] bg-[#0071E3]/10 px-2 py-0.5 rounded-full">
                                  QR Voucher
                                </span>
                                <button
                                  className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#515154] hover:text-red-500 transition-colors shrink-0"
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

                    <div className="pt-4 mt-4 border-t border-[#E5E5EA] space-y-1.5">
                      <div className="flex items-center justify-between text-[12px] text-[#515154]">
                        <span>Subtotal</span>
                        <span>S$ {total.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[12px] text-[#515154]">
                        <span>Booking fee</span>
                        <span className="text-emerald-600 font-medium">Free</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <p className="text-[13px] font-semibold text-[#1D1D1F]">Total</p>
                          <p className="text-[11px] text-[#515154]">
                            ≈ Rp {totalIDR.toLocaleString("id-ID")} · charged in SGD
                          </p>
                        </div>
                        <p className="text-xl font-bold text-[#1D1D1F]">S$ {total.toFixed(2)}</p>
                      </div>
                      <button className="mt-3 w-full flex items-center justify-center gap-2 bg-[#0071E3] hover:bg-[#005BBB] text-white text-[14px] font-bold py-3 rounded-xl transition-colors duration-200 shadow-lg shadow-[#0071E3]/25">
                        <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                        Checkout · S$ {total.toFixed(2)}
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

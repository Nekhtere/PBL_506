"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ShoppingCart, X, AlertTriangle } from "lucide-react";
import { useCart, useCartUi } from "@/lib/cart-context";
import { saveCartForCheckout } from "@/lib/cart";
import { findCoverageClashes, type Covered } from "@/lib/coverage";
import { useLocale } from "@/lib/locale-context";

// The cart drawer, split out of Navbar when the chrome became shared across
// routes. It is mounted once per site layout and opened through the cart
// context, so any page can open it without threading props through the header.

export default function CartDrawer() {
  const { items, removeItem, total } = useCart();
  const { cartOpen, setCartOpen } = useCartUi();
  const { t, locale } = useLocale();
  const router = useRouter();

  const isID = locale === "id";
  const totalIDR = Math.round(total * 11800);
  const totalDisplay = isID ? `Rp ${totalIDR.toLocaleString("id-ID")}` : `S$ ${total.toFixed(2)}`;

  const priceDisplay = (raw: string) => {
    if (!isID) return raw;
    const num = parseFloat(raw.replace(/[^0-9.]/g, "") || "0");
    return `Rp ${Math.round(num * 11800).toLocaleString("id-ID")}`;
  };

  // Warns when one cart line's coverage is a strict superset of another's.
  // Advisory only — the buyer may have a real reason, so this never
  // blocks checkout. See lib/coverage.ts for the rule.
  const clashes = findCoverageClashes(items);
  const coveredLabel = (c: Covered) => t(`cart.covers.${c}`);

  // The cart snapshot crosses to /checkout via sessionStorage, because a full
  // page load of a separate route can't see React state on its own.
  const goToCheckout = () => {
    saveCartForCheckout(items);
    setCartOpen(false);
    router.push("/checkout");
  };

  // The overlay had no Escape handler, so the only way out was the mouse.
  // setCartOpen is a state setter handed down through the context, so it is
  // stable — depending on it directly cannot cause this effect to re-run.
  useEffect(() => {
    if (!cartOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCartOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [cartOpen, setCartOpen]);

  return (
    <AnimatePresence>
      {cartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/45 p-3 sm:p-6 backdrop-blur-md"
          onClick={() => setCartOpen(false)}
        >
          <motion.section
            className="card-soft relative w-full max-w-lg max-h-full flex flex-col overflow-hidden rounded-t-[28px] sm:rounded-[28px] bg-white"
            role="dialog"
            aria-modal="true"
            aria-label={t("cart.title")}
            initial={{ opacity: 0, scale: 0.94, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 28 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="glass absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-fg transition-transform hover:scale-105"
              onClick={() => setCartOpen(false)}
              aria-label={t("cart.close")}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="p-6 flex flex-col min-h-0 flex-1">
              <div className="flex items-center justify-between mb-1 pr-12">
                <h3 className="text-xl font-bold text-fg">{t("cart.title")}</h3>
                {items.length > 0 && (
                  <span className="text-[11px] font-semibold text-muted bg-surface-sunken px-2.5 py-1 rounded-full">
                    {items.length} {items.length !== 1 ? t("cart.items") : t("cart.item")}
                  </span>
                )}
              </div>
              <p className="text-[12px] text-muted mb-5 pr-12">{t("cart.subtitle")}</p>

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
                  <ul className="space-y-2.5 overflow-y-auto pr-1 scrollbar-hide flex-1 min-h-0">
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
                              className="w-16 h-16 rounded-xl object-cover shrink-0"
                              draggable={false}
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-bold text-accent-ink uppercase tracking-wide">
                                {item.kind === "route" ? t("cart.badgeRoute") : t("cart.badgeDeal")}
                              </span>
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-[14px] font-semibold text-fg leading-snug">{item.name}</p>
                              <p className="text-[14px] font-bold text-fg shrink-0">{priceDisplay(item.price)}</p>
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
                              <span className="text-[11px] font-medium text-accent-ink bg-accent/10 px-2 py-0.5 rounded-full">
                                {item.kind === "route" ? t("cart.badgeRoute") : t("cart.qrVoucher")}
                              </span>
                              <button
                                className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-muted hover:text-red-500 transition-colors shrink-0"
                                onClick={() => removeItem(item.id)}
                                aria-label={`${t("cart.remove")} ${item.name}`}
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

                  <div className="pt-4 mt-4 border-t border-line-soft space-y-1.5 shrink-0">
                    <div className="flex items-center justify-between text-[12px] text-muted">
                      <span>{t("cart.subtotal")}</span>
                      <span>{totalDisplay}</span>
                    </div>
                    <div className="flex items-center justify-between text-[12px] text-muted">
                      <span>{t("cart.fee")}</span>
                      <span className="text-emerald-700 font-medium">{t("cart.free")}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-[13px] font-semibold text-fg">{t("cart.total")}</p>
                        <p className="text-[11px] text-muted">
                          {isID
                            ? `≈ S$ ${total.toFixed(2)} · ${t("cart.chargedSgd")}`
                            : `≈ Rp ${totalIDR.toLocaleString("id-ID")} · ${t("cart.noteSgd")}`}
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
  );
}

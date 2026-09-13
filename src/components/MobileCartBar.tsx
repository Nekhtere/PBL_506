"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCart, useCartUi } from "@/lib/cart-context";
import { useLocale } from "@/lib/locale-context";

// The sticky checkout bar on phones. It reads the cart from context now that
// the cart outlives any single page, so the layout can mount it once instead of
// the home page threading count/total/onCheckout down as props.

export default function MobileCartBar() {
  const { count, total } = useCart();
  const { setCartOpen } = useCartUi();
  const { t, locale } = useLocale();
  const pathname = usePathname();

  // Hidden on /checkout: that page already IS the cart, so a bar offering to
  // open the cart drawer on top of it is circular. It also has its own order
  // summary, so nothing is lost.
  if (pathname === "/checkout") return null;

  const totalDisplay =
    locale === "id"
      ? `Rp ${Math.round(total * 11800).toLocaleString("id-ID")}`
      : `S$ ${total.toFixed(2)}`;

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          exit={{ y: 80 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-[var(--line-soft)] bg-white/95 backdrop-blur-md px-4 pt-3 print:hidden"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] text-[var(--muted)]">
                {count} {count === 1 ? t("cart.item") : t("cart.items")}
              </p>
              <p className="text-[17px] font-bold text-[var(--fg)]">{totalDisplay}</p>
            </div>
            <button
              onClick={() => setCartOpen(true)}
              aria-label={`${t("footer.viewCart")}, ${count} ${count === 1 ? t("cart.item") : t("cart.items")}, ${totalDisplay}`}
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-[14px] font-bold px-5 py-3 rounded-xl transition-colors duration-200 shrink-0"
            >
              <ShoppingCart className="w-4 h-4" aria-hidden="true" />
              <span aria-hidden="true">{t("footer.viewCart")}</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

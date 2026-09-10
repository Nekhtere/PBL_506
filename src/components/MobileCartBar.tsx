"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";

// ponytail: bar only appears once the cart has items — an empty bar is dead weight.
// Wire onCheckout to the real flow when payment lands.
export default function MobileCartBar({ count, total, onCheckout }: {
  count: number;
  total: number;
  onCheckout: () => void;
}) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          exit={{ y: 80 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-[#E5E5EA] bg-white/95 backdrop-blur-md px-4 pt-3"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] text-[#515154]">
                {count} {count === 1 ? "item" : "items"} · E-Cash
              </p>
              <p className="text-[17px] font-bold text-[#1D1D1F]">S$ {total.toFixed(2)}</p>
            </div>
            <button
              onClick={onCheckout}
              className="flex items-center gap-2 bg-[#0071E3] hover:bg-[#005BBB] text-white text-[14px] font-bold px-5 py-3 rounded-xl transition-colors duration-200 shrink-0"
            >
              <ShoppingCart className="w-4 h-4" aria-hidden="true" />
              View Cart
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
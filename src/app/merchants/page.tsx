"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar, { type CartItem } from "@/components/Navbar";
import MobileCartBar from "@/components/MobileCartBar";
import DetailModal from "@/components/DetailModal";
import MerchantCard from "@/components/MerchantCard";
import MerchantDetail from "@/components/MerchantDetail";
import { merchants, type Merchant } from "@/lib/merchants";

export default function MerchantsPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selected, setSelected] = useState<Merchant | null>(null);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price.replace(/[^0-9.]/g, "") || "0"),
    0,
  );

  const addToCart = (item: Omit<CartItem, "id">) =>
    setCartItems((items) => [
      ...items,
      { ...item, id: `${item.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` },
    ]);

  const removeFromCart = (id: string) =>
    setCartItems((items) => items.filter((item) => item.id !== id));

  return (
    <main className="min-h-screen bg-[#FBFBFD]">
      <Navbar
        items={cartItems}
        onRemoveItem={removeFromCart}
        cartOpen={cartOpen}
        onCartOpenChange={setCartOpen}
      />

      <section className="px-6 pt-32 pb-24">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/#deals"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0071E3] hover:underline mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Back to deals
          </Link>

          <span className="block text-[#0071E3] text-[12px] font-semibold tracking-widest uppercase">
            All Partners
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1D1D1F] mt-2 tracking-tight">
            Merchant Partners
          </h1>
          <p className="text-[#515154] mt-3 text-[15px] max-w-md leading-relaxed">
            Every merchant working with BatamSmart — {merchants.length} places across seafood,
            spa, shopping, stays and attractions.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {merchants.map((merchant, i) => (
              <motion.div
                key={merchant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.05 }}
              >
                <MerchantCard
                  merchant={merchant}
                  index={0}
                  isInView
                  onSelect={setSelected}
                  onAddToCart={addToCart}
                  className="w-full"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <DetailModal open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <MerchantDetail
            merchant={selected}
            onAddToCart={addToCart}
            onDone={() => setSelected(null)}
          />
        )}
      </DetailModal>

      <MobileCartBar
        count={cartItems.length}
        total={cartTotal}
        onCheckout={() => setCartOpen(true)}
      />
    </main>
  );
}
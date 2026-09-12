"use client";

import { useEffect, useState } from "react";
import Navbar, { type CartItem } from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import NearMeSection from "@/components/NearMeSection";
import JourneySection from "@/components/JourneySection";
import FerrySection from "@/components/FerrySection";
import BundleSection from "@/components/BundleSection";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
import MobileCartBar from "@/components/MobileCartBar";
import { loadCartForCheckout, saveCartForCheckout } from "@/lib/checkout";

export default function Home() {
  // The cart persists to sessionStorage so a trip to /checkout and back (or
  // an accidental refresh mid-demo) doesn't empty it. It must load AFTER
  // mount, not in a lazy useState initializer — reading storage during the
  // first client render makes it differ from the server render (empty cart)
  // and React fails hydration.
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [dealQuery, setDealQuery] = useState("");

  useEffect(() => {
    // Reading an external store after mount is exactly what effects are for —
    // the lazy-initializer alternative fails hydration (server render has no
    // sessionStorage), and this page is interactive from the first paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCartItems(loadCartForCheckout());
    setCartLoaded(true);
  }, []);

  useEffect(() => {
    // Skip the first paint — otherwise we'd write the empty initial state
    // back over the stored cart before the load effect above has run.
    if (cartLoaded) saveCartForCheckout(cartItems);
  }, [cartItems, cartLoaded]);

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
    <main className="min-h-screen bg-bg">
      <Navbar
        items={cartItems}
        onRemoveItem={removeFromCart}
        cartOpen={cartOpen}
        onCartOpenChange={setCartOpen}
      />
      <HeroSection onSearch={setDealQuery} />
      <NearMeSection query={dealQuery} onQueryChange={setDealQuery} />
      <JourneySection onAddToCart={(item) => addToCart(item)} />
      {/* The ferry form is a multi-step booking, so the cart drawer is opened
          only when the buyer asks for it — popping it open on add would hide
          the confirmation panel they just earned. */}
      <FerrySection onAddToCart={(item) => addToCart(item)} onOpenCart={() => setCartOpen(true)} />
      <BundleSection onAddToCart={(item) => addToCart(item)} />
      <FaqSection />
      <div className={cartItems.length > 0 ? "bg-surface-sunken pb-24 md:pb-0" : undefined}>
        <Footer />
      </div>
      <MobileCartBar
        count={cartItems.length}
        total={cartTotal}
        onCheckout={() => setCartOpen(true)}
      />
    </main>
  );
}
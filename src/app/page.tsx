"use client";

import { useState } from "react";
import Navbar, { type CartItem } from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DealsSection from "@/components/DealsSection";
import ItinerarySection from "@/components/ItinerarySection";
import FerrySection from "@/components/FerrySection";
import RideGuideSection from "@/components/RideGuideSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import Footer from "@/components/Footer";
import MobileCartBar from "@/components/MobileCartBar";

export default function Home() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  // Owned here because the hero's search box and the deals row are siblings —
  // neither can hold the other's state. The hero writes it, the row reads it.
  const [dealQuery, setDealQuery] = useState("");
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
      <DealsSection onAddToCart={(item) => addToCart(item)} query={dealQuery} onQueryChange={setDealQuery} />
      <ItinerarySection
        onAddToCart={(item) => addToCart(item)}
      />
      <FerrySection />
      <RideGuideSection />
      <HowItWorksSection />
      {/* The fixed MobileCartBar overlays the bottom of the viewport on mobile.
          Extra bottom padding (in the footer's own colour) gives the legal links
          room to clear it instead of staying trapped underneath. */}
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

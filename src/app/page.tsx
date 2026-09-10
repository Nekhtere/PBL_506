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
      <HeroSection />
      <DealsSection onAddToCart={(item) => addToCart(item)} />
      <ItinerarySection
        onAddToCart={(item) => addToCart(item)}
      />
      <FerrySection />
      <RideGuideSection />
      <HowItWorksSection />
      <Footer />
      <MobileCartBar
        count={cartItems.length}
        total={cartTotal}
        onCheckout={() => setCartOpen(true)}
      />
    </main>
  );
}

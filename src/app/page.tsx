"use client";

import { useState } from "react";
import Navbar, { type CartItem } from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DealsSection from "@/components/DealsSection";
import ItinerarySection from "@/components/ItinerarySection";
import RideGuideSection from "@/components/RideGuideSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import Footer from "@/components/Footer";

export default function Home() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, "id">) =>
    setCartItems((items) => [
      ...items,
      { ...item, id: `${item.name}-${Date.now()}` },
    ]);

  const removeFromCart = (id: string) =>
    setCartItems((items) => items.filter((item) => item.id !== id));

  return (
    <main className="min-h-screen bg-[#FBFBFD]">
      <Navbar items={cartItems} onRemoveItem={removeFromCart} />
      <HeroSection />
      <DealsSection
        onAddToCart={(item) => addToCart(item)}
      />
      <ItinerarySection
        onAddToCart={(item) => addToCart(item)}
      />
      <RideGuideSection />
      <HowItWorksSection />
      <Footer />
    </main>
  );
}

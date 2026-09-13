"use client";

import HeroSection from "@/components/HeroSection";
import NearMeSection from "@/components/NearMeSection";
import JourneySection from "@/components/JourneySection";
import FerrySection from "@/components/FerrySection";
import FaqSection from "@/components/FaqSection";
import { useCart, useCartUi } from "@/lib/cart-context";

// The home page is now only its sections. The navbar, footer, cart drawer and
// mobile cart bar are mounted by src/app/(site)/layout.tsx, and the cart itself
// comes from CartProvider — this component used to own all of that, which is
// exactly why no other route had any chrome.
//
// Search now navigates to /destinations?q=... so the catalog has its own URL.

export default function Home() {
  const { addItem } = useCart();
  const { setCartOpen } = useCartUi();

  return (
    <main className="min-h-screen bg-bg">
      <HeroSection />
      <NearMeSection />
      <JourneySection onAddToCart={addItem} />
      {/* The ferry form is a multi-step booking, so the cart drawer is opened
          only when the buyer asks for it — popping it open on add would hide
          the confirmation panel they just earned. */}
      <FerrySection onAddToCart={addItem} onOpenCart={() => setCartOpen(true)} />
      <FaqSection />
    </main>
  );
}

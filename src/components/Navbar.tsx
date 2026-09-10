"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Globe, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Deals", href: "#deals" },
  { label: "Itinerary", href: "#itinerary" },
  { label: "Ride Guide", href: "#ride-guide" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [currency, setCurrency] = useState<"SGD" | "IDR">("SGD");
  const [cartCount] = useState(2);
  const [mobileOpen, setMobileOpen] = useState(false);

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
        <a href="#home" className="flex items-center gap-2 shrink-0">
          <span className="text-[15px] font-semibold tracking-tight text-[#1D1D1F]">
            Batam<span className="text-[#0071E3]">Smart</span>
          </span>
        </a>

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
          {/* Currency Toggle */}
          <button
            onClick={() => setCurrency(currency === "SGD" ? "IDR" : "SGD")}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/[0.06] hover:bg-black/[0.1] transition-all duration-200 text-[12px] font-semibold text-[#1D1D1F]"
            aria-label={`Switch currency, current: ${currency}`}
          >
            <Globe className="w-3.5 h-3.5" aria-hidden="true" />
            {currency}
          </button>

          {/* Cart */}
          <button
            className="relative p-2 rounded-full hover:bg-black/[0.06] transition-all duration-200"
            aria-label={`Cart, ${cartCount} items`}
          >
            <ShoppingCart className="w-[18px] h-[18px] text-[#1D1D1F]" strokeWidth={1.8} aria-hidden="true" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#0071E3] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {cartCount}
              </span>
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
            <div className="border-t border-black/[0.08] mt-1 pt-2">
              <button
                onClick={() => setCurrency(currency === "SGD" ? "IDR" : "SGD")}
                className="flex items-center gap-2 px-3 py-2.5 text-[13px] font-semibold text-[#1D1D1F] rounded-xl hover:bg-black/[0.06] transition-all w-full"
                aria-label={`Switch to ${currency === "SGD" ? "IDR" : "SGD"}`}
              >
                <Globe className="w-4 h-4" aria-hidden="true" />
                Switch to {currency === "SGD" ? "IDR" : "SGD"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Shield, Zap } from "lucide-react";

const bgSlides = [
  {
    url: "https://images.unsplash.com/photo-1559628233-100c798642d4?w=1800&q=80&auto=format&fit=crop",
    label: "Seafood Harbour, Batam",
  },
  {
    url: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1800&q=80&auto=format&fit=crop",
    label: "Spa & Wellness, Batam",
  },
  {
    url: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1800&q=80&auto=format&fit=crop",
    label: "Harbour Bay Mall, Batam",
  },
  {
    url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1800&q=80&auto=format&fit=crop",
    label: "Local Cuisine, Batam",
  },
];

const stats = [
  { value: "120+", label: "Merchant Partners" },
  { value: "4.9★", label: "Average Rating" },
  { value: "SGD", label: "Pay in Dollars" },
  { value: "< 1 hr", label: "From Singapore" },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent((c) => (c + 1) % bgSlides.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex flex-col justify-end overflow-hidden">

      {/* ── Slideshow background ── */}
      <div className="absolute inset-0">
        <AnimatePresence initial={false}>
          <motion.img
            key={bgSlides[current].url}
            src={bgSlides[current].url}
            alt={bgSlides[current].label}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </AnimatePresence>
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/40 to-transparent" />
      </div>

      {/* ── Trust badge top-right ── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute top-6 right-6 hidden md:flex items-center gap-2 glass-dark rounded-full px-3 py-1.5 text-white/90 text-[12px] font-medium"
      >
        <Shield className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
        Verified Merchants Only
      </motion.div>

      {/* ── Main content ── */}
      <div className="relative z-10 px-6 pb-0 max-w-5xl mx-auto w-full">

        {/* Location pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-dark text-white/90 text-[12px] font-medium mb-5"
        >
          <MapPin className="w-3 h-3 text-sky-400" aria-hidden="true" />
          Batam, Indonesia &nbsp;·&nbsp;
          <Zap className="w-3 h-3 text-yellow-400 inline" aria-hidden="true" />
          45 min ferry from Singapore
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-4"
        >
          Unlock Batam&apos;s Best.
          <br />
          <span className="text-white/60">Effortlessly.</span>
        </motion.h1>

        {/* Sub-headline — white/80 = 9.4:1 contrast on dark overlay ✓ */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-[15px] md:text-lg text-white/80 max-w-lg mb-8 leading-relaxed"
        >
          Curated deals for Seafood, Spa &amp; Shopping — pay in SGD, redeem instantly with QR.
        </motion.p>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="border-t border-white/10 pt-5 pb-8 grid grid-cols-4 gap-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <p className="text-xl md:text-2xl font-bold text-white">{s.value}</p>
              {/* white/60 on dark overlay = high contrast ✓ */}
              <p className="text-[11px] text-white/60 mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

    </section>
  );
}

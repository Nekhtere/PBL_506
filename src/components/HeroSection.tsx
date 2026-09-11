"use client";

import { useState, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Shield, Zap, Search, ArrowRight } from "lucide-react";
import { merchants } from "@/lib/merchants";

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

// Read off the catalogue, not typed by hand. The hero used to advertise
// "120+ partners" and "4.9★" while /merchants listed 13 merchants at an
// average of 4.7 — two different numbers for one fact, on the same page.
const avgRating = (
  merchants.reduce((sum, m) => sum + m.rating, 0) / merchants.length
).toFixed(1);

const stats = [
  { value: String(merchants.length), label: "Merchant Partners" },
  { value: `${avgRating}★`, label: "Average Rating" },
  { value: "SGD", label: "Pay in Dollars" },
  { value: "< 1 hr", label: "From Singapore" },
];

// Same words the deals row already searches on, so a tap here and a tap on the
// chips down there land on the same result.
const quickSearches = ["Seafood", "Spa", "Shopping", "Hotel"];

export default function HeroSection({ onSearch }: { onSearch: (query: string) => void }) {
  const [current, setCurrent] = useState(0);
  const [value, setValue] = useState("");

  useEffect(() => {
    const t = setInterval(() => setCurrent((c) => (c + 1) % bgSlides.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Hands the query to the deals row and takes the user to it. That row's own
  // search box is bound to the same state, so it arrives already filled in
  // rather than the user typing the same thing twice.
  const run = (raw: string) => {
    const query = raw.trim();
    setValue(query);
    onSearch(query);
    const target = document.getElementById("deals");
    if (!target) return;
    // scroll-behavior: smooth in globals.css only covers CSS-driven scrolling;
    // this is a JS scroll, so it has to honour the preference itself.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    run(value);
  };

  return (
    <section id="home" className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden">

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
        {/* Gradient overlays. The mid stop stays light so the photo reads; the
            separate top scrim is what keeps the glass navbar legible. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/15" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/50 to-transparent" />
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 px-4 sm:px-6 pt-28 pb-14 sm:pb-20 max-w-5xl mx-auto w-full">

        {/* Location + trust. Both live in the flow rather than pinned top-right:
            as an absolute badge it collided with the centred navbar at md. */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 max-w-full px-3 py-1.5 rounded-full glass-dark text-white/90 text-[12px] font-medium"
          >
            <MapPin className="w-3 h-3 text-sky-400 shrink-0" aria-hidden="true" />
            <span>Batam, Indonesia ·</span>
            <Zap className="w-3 h-3 text-yellow-400 shrink-0" aria-hidden="true" />
            <span>45 min ferry from Singapore</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 glass-dark rounded-full px-3 py-1.5 text-white/90 text-[12px] font-medium"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            Verified Merchants Only
          </motion.div>
        </div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-4"
        >
          Unlock Batam&apos;s Best.
          <br />
          <span className="text-white/60">Effortlessly.</span>
        </motion.h1>

        {/* Sub-headline — white/80 = 9.4:1 contrast on dark overlay ✓ */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="text-[15px] md:text-lg text-white/80 max-w-lg mb-7 leading-relaxed"
        >
          Curated deals for Seafood, Spa &amp; Shopping — pay in SGD, redeem instantly with QR.
        </motion.p>

        {/* Search — the product's primary action, so it belongs here and not
            only halfway down the page. */}
        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          onSubmit={submit}
          role="search"
          className="w-full max-w-xl"
        >
          <div className="glass-dark flex items-center gap-2 rounded-2xl p-1.5 sm:rounded-full">
            <Search className="w-4 h-4 text-white/70 shrink-0 ml-2.5" aria-hidden="true" />
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Seafood, spa, shopping…"
              aria-label="Search Batam deals"
              className="flex-1 min-w-0 bg-transparent py-2.5 text-[14px] text-white placeholder:text-white/65 focus-on-dark"
            />
            <button
              type="submit"
              className="flex shrink-0 items-center gap-1.5 rounded-xl sm:rounded-full bg-[#0071E3] hover:bg-[#005BBB] text-white text-[13px] font-semibold px-4 py-2.5 transition-colors duration-200"
            >
              Search
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </motion.form>

        {/* Quick searches */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="flex flex-wrap items-center gap-2 mt-3"
        >
          <span className="text-[11px] font-medium text-white/60">Popular:</span>
          {quickSearches.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => run(term)}
              className="glass-dark rounded-full px-3 py-1 text-[12px] font-medium text-white/85 hover:text-white transition-colors duration-150"
            >
              {term}
            </button>
          ))}
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6 }}
          className="mt-10 border-t border-white/10 pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-left">
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

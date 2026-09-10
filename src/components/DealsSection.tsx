"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Star, ShoppingCart, ChevronLeft, ChevronRight, Heart, MapPin, Check, CheckCircle } from "lucide-react";
import DetailModal from "./DetailModal";

const categories = ["All", "Seafood", "Spa", "Shopping", "Street Food"];

const merchants = [
  {
    id: 1,
    name: "Golden Prawn Seafood",
    category: "Seafood",
    rating: 4.9,
    reviews: 1240,
    originalPrice: "Rp 200.000",
    salePrice: "S$ 14",
    tag: "Best Seller",
    location: "Harbour Bay, Batam",
    desc: "Fresh tiger prawns, chili crab & more — cooked live at the harbour.",
    photo: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Nagoya Wellness Spa",
    category: "Spa",
    rating: 4.8,
    reviews: 890,
    originalPrice: "Rp 350.000",
    salePrice: "S$ 24",
    tag: "Top Rated",
    location: "Nagoya Hill, Batam",
    desc: "Full-body aromatherapy massage and scrub in a luxury setting.",
    photo: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Harbour Bay Mall",
    category: "Shopping",
    rating: 4.7,
    reviews: 2100,
    originalPrice: "Rp 150.000",
    salePrice: "S$ 10",
    tag: "Popular",
    location: "Harbour Bay, Batam",
    desc: "Branded goods, electronics & local fashion at duty-free prices.",
    photo: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Batam Night Market",
    category: "Street Food",
    rating: 4.8,
    reviews: 650,
    originalPrice: "Rp 120.000",
    salePrice: "S$ 8",
    tag: "Must Try",
    location: "Nagoya, Batam",
    desc: "Satay, nasi goreng, es teler — the authentic Batam street experience.",
    photo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Avani Spa Resort",
    category: "Spa",
    rating: 4.9,
    reviews: 320,
    originalPrice: "Rp 500.000",
    salePrice: "S$ 34",
    tag: "Premium",
    location: "Nongsa, Batam",
    desc: "Resort-grade spa ritual with sea view. Pure indulgence.",
    photo: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Batam Fresh Crab House",
    category: "Seafood",
    rating: 4.7,
    reviews: 780,
    originalPrice: "Rp 280.000",
    salePrice: "S$ 19",
    tag: "New",
    location: "Sekupang, Batam",
    desc: "Butter crab and salted egg crab straight from the sea — daily catch.",
    photo: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=700&q=80&auto=format&fit=crop",
  },
];

const merchantDetails: Record<number, {
  hours: string;
  highlights: string[];
  includes: string[];
  promo?: string;
}> = {
  1: {
    hours: "11:00 – 22:00 WIB",
    highlights: ["Live seafood selection", "Harbourfront dining", "Halal-friendly menu"],
    includes: ["S$ 14 dining credit", "Freshly prepared seafood", "Air-conditioned seating"],
    promo: "Weekday diners receive a complimentary iced tea.",
  },
  2: {
    hours: "10:00 – 22:00 WIB",
    highlights: ["60-minute aromatherapy", "Private treatment room", "Certified therapists"],
    includes: ["Aromatherapy massage", "Warm towel welcome", "Herbal tea after treatment"],
    promo: "Add a body scrub at 20% off before 15:00.",
  },
  3: {
    hours: "10:00 – 22:00 WIB",
    highlights: ["Duty-free shopping", "Local fashion finds", "Near ferry terminal"],
    includes: ["S$ 10 shopping credit", "Mall directory", "Wi-Fi access"],
  },
  4: {
    hours: "17:00 – 23:00 WIB",
    highlights: ["Local street food", "Evening atmosphere", "Easy Nagoya access"],
    includes: ["S$ 8 food credit", "Vendor recommendations", "Flexible redemption"],
    promo: "Redeem Sunday–Thursday for a bonus dessert.",
  },
  5: {
    hours: "09:00 – 21:00 WIB",
    highlights: ["Sea-view treatment", "Resort ambience", "Premium essential oils"],
    includes: ["75-minute spa ritual", "Steam-room access", "Post-treatment refreshment"],
  },
  6: {
    hours: "11:00 – 22:00 WIB",
    highlights: ["Daily local catch", "Signature salted egg crab", "Family-friendly tables"],
    includes: ["S$ 19 dining credit", "Fresh crab selection", "Table reservation"],
  },
};

const tagColors: Record<string, string> = {
  "Best Seller": "bg-orange-500",
  "Top Rated":   "bg-purple-500",
  Popular:       "bg-emerald-600",
  "Must Try":    "bg-amber-500",
  Premium:       "bg-pink-600",
  New:           "bg-blue-500",
};

function MerchantCard({ merchant, index, isInView, onSelect, onAddToCart }: {
  merchant: typeof merchants[0];
  index: number;
  isInView: boolean;
  onSelect: (m: typeof merchants[0]) => void;
  onAddToCart: (item: { name: string; price: string; subtitle?: string; image?: string; items?: string[]; kind: "deal" | "route" }) => void;
}) {
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (added) return;
    setAdded(true);
    onAddToCart({
      name: merchant.name,
      price: merchant.salePrice,
      subtitle: `${merchant.category} · ${merchant.location}`,
      image: merchant.photo,
      kind: "deal",
    });
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <motion.div
      key={merchant.id}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="shrink-0 w-72 rounded-3xl overflow-hidden group cursor-pointer card-soft border border-[#E8E8ED]"
      onClick={() => onSelect(merchant)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(merchant)}
      whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.14)" }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Photo */}
      <div className="relative h-48 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={merchant.photo}
          alt={merchant.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          draggable={false}
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Tag badge */}
        <span className={`absolute top-3 left-3 ${tagColors[merchant.tag]} text-white text-[11px] font-semibold px-2.5 py-1 rounded-full`}>
          {merchant.tag}
        </span>

        {/* Like button */}
        <button
          className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center transition-transform duration-200 hover:scale-110"
          onClick={(e) => { e.stopPropagation(); setLiked((v) => !v); }}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-4 h-4 transition-colors duration-200 ${liked ? "fill-red-500 text-red-500" : "text-[#1D1D1F]/60"}`}
          />
        </button>

        {/* Location pill */}
        <span className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-full border border-white/20">
          <MapPin className="w-2.5 h-2.5" aria-hidden="true" />
          {merchant.location}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-[#1D1D1F] text-[14px] leading-snug flex-1 min-w-0 pr-2">
            {merchant.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
            <span className="text-[12px] font-semibold text-[#1D1D1F]">{merchant.rating}</span>
            {/* #515154 on white = 5.1:1 ✓ WCAG AA */}
            <span className="text-[11px] text-[#515154]">({merchant.reviews})</span>
          </div>
        </div>

        {/* Expand hint */}
        <p className="text-[11px] text-[#0071E3] mt-1 mb-2 font-medium">Tap to view details</p>

        {/* Price row */}
        <div className="flex items-center justify-between mt-1">
          <div>
            <span className="text-[11px] text-[#515154] line-through mr-1.5">{merchant.originalPrice}</span>
            <span className="text-[18px] font-bold text-[#1D1D1F]">{merchant.salePrice}</span>
            <span className="text-[11px] text-[#515154] ml-1">E-Cash</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            className={`flex items-center justify-center gap-1.5 w-[86px] text-white text-[12px] font-semibold px-3 py-2 rounded-xl transition-colors duration-200 ${added ? "bg-emerald-600" : "bg-[#0071E3] hover:bg-[#005BBB]"}`}
            onClick={(e) => { e.stopPropagation(); handleAdd(); }}
            aria-label={`Add ${merchant.name} to cart`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {added ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  Added
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5" aria-hidden="true" />
                  Add
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

      </div>
    </motion.div>
  );
}

export default function DealsSection({ onAddToCart }: { onAddToCart: (item: { name: string; price: string; subtitle?: string; image?: string; items?: string[]; kind: "deal" | "route" }) => void }) {
  const sectionRef    = useRef<HTMLDivElement>(null);
  const scrollRef     = useRef<HTMLDivElement>(null);
  const isInView      = useInView(sectionRef, { once: true, margin: "-100px" });
  const [canScrollLeft, setCanScrollLeft]   = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeFilter, setActiveFilter]     = useState("All");
  const [selectedMerchant, setSelectedMerchant] = useState<typeof merchants[0] | null>(null);
  const isDragging    = useRef(false);
  const dragStartX    = useRef(0);
  const dragScrollLeft = useRef(0);

  const filtered = activeFilter === "All"
    ? merchants
    : merchants.filter((m) => m.category === activeFilter);
  const selectedDetails = selectedMerchant ? merchantDetails[selectedMerchant.id] : null;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -308 : 308, behavior: "smooth" });
  };

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 8);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    });
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current     = true;
    dragStartX.current     = e.pageX - el.offsetLeft;
    dragScrollLeft.current = el.scrollLeft;
    el.style.cursor        = "grabbing";
    el.style.userSelect    = "none";
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const el   = scrollRef.current;
    const x    = e.pageX - el.offsetLeft;
    const walk = (x - dragStartX.current) * 1.2;
    el.scrollLeft = dragScrollLeft.current - walk;
  }, []);

  const onMouseUp = useCallback(() => {
    if (!scrollRef.current) return;
    isDragging.current              = false;
    scrollRef.current.style.cursor     = "grab";
    scrollRef.current.style.userSelect = "";
  }, []);

  return (
    <section id="deals" ref={sectionRef} className="py-24 px-6 bg-[#FBFBFD]">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#0071E3] text-[12px] font-semibold tracking-widest uppercase"
          >
            A La Carte Voucher
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-[#1D1D1F] mt-2 tracking-tight"
          >
            Smart Merchant Deals
          </motion.h2>
          {/* #515154 on #FBFBFD = 5.1:1 ✓ WCAG AA */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#515154] mt-3 text-[15px] max-w-md leading-relaxed"
          >
            Pick exactly what you want. No packages, no commitments. Pay in SGD.
          </motion.p>
        </div>

        {/* Category filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex gap-2 mb-8 flex-wrap"
          role="group"
          aria-label="Filter by category"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              aria-pressed={activeFilter === cat}
              className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 ${
                activeFilter === cat
                  ? "bg-[#1D1D1F] text-white shadow-sm"
                  : "bg-[#F5F5F7] text-[#515154] hover:bg-[#E8E8ED] hover:text-[#1D1D1F]"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Carousel wrapper */}
        <div className="relative">
          {/* Left arrow */}
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-11 h-11 rounded-full bg-white shadow-lg border border-[#E5E5EA] flex items-center justify-center transition-all duration-200
              ${canScrollLeft ? "opacity-100 hover:bg-[#F5F5F7] hover:scale-105" : "opacity-0 pointer-events-none"}`}
          >
            <ChevronLeft className="w-5 h-5 text-[#1D1D1F]" strokeWidth={2} />
          </button>

          {/* Right arrow */}
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-11 h-11 rounded-full bg-white shadow-lg border border-[#E5E5EA] flex items-center justify-center transition-all duration-200
              ${canScrollRight ? "opacity-100 hover:bg-[#F5F5F7] hover:scale-105" : "opacity-0 pointer-events-none"}`}
          >
            <ChevronRight className="w-5 h-5 text-[#1D1D1F]" strokeWidth={2} />
          </button>

          {/* Fade edges */}
          <div className={`absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-[#FBFBFD] to-transparent z-[5] pointer-events-none transition-opacity duration-200 ${canScrollLeft  ? "opacity-100" : "opacity-0"}`} />
          <div className={`absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-[#FBFBFD] to-transparent z-[5] pointer-events-none transition-opacity duration-200 ${canScrollRight ? "opacity-100" : "opacity-0"}`} />

          {/* Carousel track */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-6 px-6 cursor-grab active:cursor-grabbing"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {filtered.map((merchant, i) => (
              <MerchantCard
                key={merchant.id}
                merchant={merchant}
                index={i}
                isInView={isInView}
                onSelect={setSelectedMerchant}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <DetailModal open={!!selectedMerchant} onClose={() => setSelectedMerchant(null)}>
        {selectedMerchant && (
          <div className="flex flex-col h-[85dvh] sm:h-[80vh]">
            {/* Header image */}
            <div className="relative h-56 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedMerchant.photo}
                alt={selectedMerchant.name}
                className="w-full h-full object-cover rounded-t-[28px]"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-t-[28px]" />
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className={`inline-block ${tagColors[selectedMerchant.tag]} text-white text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2`}>
                  {selectedMerchant.tag}
                </span>
                <h3 className="text-2xl font-bold">{selectedMerchant.name}</h3>
                <div className="flex items-center gap-4 mt-1.5 text-white/85 text-[12px]">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                    {selectedMerchant.rating} ({selectedMerchant.reviews} reviews)
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> {selectedMerchant.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="p-6 flex flex-1 min-h-0 flex-col">
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <p className="text-[13px] text-[#515154] leading-relaxed mb-4">{selectedMerchant.desc}</p>

                {/* Highlights */}
                {selectedDetails && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedDetails.highlights.map((h) => (
                      <span key={h} className="flex items-center gap-1.5 bg-[#F5F5F7] text-[#1D1D1F] text-[11px] font-medium px-3 py-1.5 rounded-full">
                        ✦ {h}
                      </span>
                    ))}
                  </div>
                )}

                {/* Includes */}
                {selectedDetails && (
                  <div className="mb-4">
                    <p className="text-[12px] font-semibold text-[#1D1D1F] mb-2">What's included</p>
                    <ul className="space-y-1.5">
                      {selectedDetails.includes.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-[12px] text-[#515154]">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Promo */}
                {selectedDetails?.promo && (
                  <div className="bg-[#0071E3]/10 text-[#0071E3] text-[12px] font-medium px-4 py-2.5 rounded-xl mb-4">
                    🎁 {selectedDetails.promo}
                  </div>
                )}
              </div>

              {/* Price and actions */}
              <div className="flex items-center justify-between bg-[#F5F5F7] rounded-2xl p-4 mb-4 shrink-0">
                <div>
                  <span className="text-[12px] text-[#515154] line-through mr-2">{selectedMerchant.originalPrice}</span>
                  <span className="text-2xl font-bold text-[#1D1D1F]">{selectedMerchant.salePrice}</span>
                  <span className="text-[11px] text-[#515154] ml-1.5">E-Cash</span>
                </div>
              </div>

              <div className="flex items-end justify-between mt-auto pt-4 border-t border-[#E5E5EA] shrink-0">
                <div>
                  <p className="text-[11px] text-[#515154]">Voucher can be redeemed at</p>
                  <p className="text-[13px] font-semibold text-[#1D1D1F]">{selectedMerchant.location}</p>
                </div>
                <button
                  className="flex items-center gap-2 bg-[#0071E3] hover:bg-[#005BBB] text-white text-[14px] font-bold px-6 py-3 rounded-xl transition-colors duration-200 shadow-lg shadow-[#0071E3]/25"
                  onClick={() => { onAddToCart({ name: selectedMerchant.name, price: selectedMerchant.salePrice, subtitle: `${selectedMerchant.category} · ${selectedMerchant.location}`, image: selectedMerchant.photo, kind: "deal" }); setSelectedMerchant(null); }}
                >
                  <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </DetailModal>
    </section>
  );
}

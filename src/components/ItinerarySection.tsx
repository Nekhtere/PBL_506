"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Plus, MapPin, Clock, ShoppingCart, Check, Star, Flame, CalendarCheck } from "lucide-react";
import DetailModal from "./DetailModal";

const itineraries = [
  {
    id: 1,
    vibe: "The Ultimate Relax & Dine",
    description:
      "Start with a full-body spa ritual, then feast on the freshest seafood as the sun sets over Batam's harbour. The perfect blend of indulgence.",
    duration: "8 hours",
    from: "Harbour Bay Ferry",
    hours: "09:00 – 20:00",
    highlights: ["Spa therapy", "Seafood dinner", "Sunset view"],
    includes: ["Spa session", "Lunch voucher", "Transportation"],
    promo: "Book before 5pm for a complimentary drink",
    photo: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=900&q=80&auto=format&fit=crop",
    merchants: [
      { name: "Nagoya Wellness Spa",  type: "Spa",    time: "10:00", emoji: "💆", price: "S$ 24" },
      { name: "Golden Prawn Seafood", type: "Lunch",  time: "13:00", emoji: "🦐", price: "S$ 14" },
      { name: "Avani Spa Resort",     type: "Spa",    time: "15:30", emoji: "🌸", price: "S$ 34" },
      { name: "Batam Night Market",   type: "Dinner", time: "19:00", emoji: "🌃", price: "S$ 8"  },
    ],
    totalSGD: "S$ 80",
    savings: "Save S$ 18",
    savingsColor: "text-emerald-600",
    rating: 4.9,
    reviews: 412,
    bookedThisWeek: 87,
    validity: "Valid 30 days from purchase",
  },
  {
    id: 2,
    vibe: "Shop 'til You Drop",
    description:
      "A power shopper's paradise. Navigate Batam's famous textile and electronics markets with expert guides, then treat yourself to local delicacies.",
    duration: "6 hours",
    from: "Batam Center Ferry",
    hours: "09:00 – 18:00",
    highlights: ["Shopping spree", "Guided tours", "Local snacks"],
    includes: ["Shopping guide", "Lunch voucher", "Transport"],
    promo: "Use code SAVE10 for 10% off",
    photo: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=900&q=80&auto=format&fit=crop",
    merchants: [
      { name: "Harbour Bay Mall",       type: "Shopping", time: "09:00", emoji: "🛍️", price: "S$ 10" },
      { name: "Batam Fresh Crab House", type: "Lunch",    time: "12:30", emoji: "🦀", price: "S$ 19" },
      { name: "Nagoya Hill Mall",       type: "Shopping", time: "14:30", emoji: "🏬", price: "S$ 10" },
    ],
    totalSGD: "S$ 39",
    savings: "Save S$ 12",
    savingsColor: "text-emerald-600",
    rating: 4.7,
    reviews: 268,
    bookedThisWeek: 54,
    validity: "Valid 30 days from purchase",
  },
];

export default function ItinerarySection({ onAddToCart }: { onAddToCart: (item: { name: string; price: string; subtitle?: string; image?: string; items?: string[]; kind: "deal" | "route" }) => void }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView   = useInView(sectionRef, { once: true, margin: "-100px" });
  const [selectedTrip, setSelectedTrip] = useState<typeof itineraries[0] | null>(null);
  const [addedId, setAddedId] = useState<number | null>(null);

  const handleAdd = (trip: typeof itineraries[0]) => {
    if (addedId === trip.id) return;
    setAddedId(trip.id);
    onAddToCart({
      name: trip.vibe,
      price: trip.totalSGD,
      subtitle: `${trip.duration} · from ${trip.from}`,
      image: trip.photo,
      items: trip.merchants.map((m) => `${m.emoji} ${m.name} (${m.time})`),
      kind: "route",
    });
    setTimeout(() => setAddedId(null), 1400);
  };

  return (
    <section id="itinerary" ref={sectionRef} className="py-24 px-6 bg-surface-sunken">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent-ink text-[12px] font-semibold tracking-widest uppercase">
            Flexible Itinerary
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-fg mt-2 tracking-tight">
            1-Day Trip, Your Way
          </h2>
          {/* #515154 on #F5F5F7 = 7.3:1 ✓ WCAG AA */}
          <p className="text-muted mt-4 text-[15px] max-w-md mx-auto leading-relaxed">
            Curated routes you can mix-and-match. Add the whole bundle or cherry-pick only what you love.
          </p>
        </motion.div>

        {/* Itinerary Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {itineraries.map((trip, i) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="group relative bg-white rounded-3xl overflow-hidden flex flex-col cursor-pointer"
              style={{ boxShadow: "var(--sh-2)" }}
              whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.14)" }}
            >
              {/* Opens the itinerary. The wrapper was a plain div with onClick, so
                  the card could not be opened from the keyboard at all. Stretched
                  across the card; the two buttons below sit at z-10 to stay clickable. */}
              <button
                type="button"
                onClick={() => setSelectedTrip(trip)}
                aria-label={`View the ${trip.vibe} itinerary`}
                className="absolute inset-0 z-[1] rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-accent after:absolute after:inset-0 after:content-['']"
              />

              {/* Hero photo — taller for visual impact */}
              <div className="relative h-56 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={trip.photo}
                  alt={trip.vibe}
                  loading="lazy"
                  decoding="async"
                  className="media-zoom absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
                {/* Layered gradient for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                {/* Text content over photo */}
                <div className="relative z-10 h-full flex flex-col justify-end p-6 text-white text-shadow-photo">
                  <h3 className="text-[20px] font-bold mb-1.5 leading-tight">{trip.vibe}</h3>
                  <p className="text-white/80 text-[13px] leading-relaxed line-clamp-2">{trip.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-white/75 text-[12px]">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" /> {trip.duration}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> Start from {trip.from}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                      {trip.rating} ({trip.reviews})
                    </span>
                  </div>
                </div>
              </div>

              {/* Merchant Stack */}
              <div className="p-5 flex flex-col flex-1">
                <div className="space-y-2.5 mb-5 flex-1">
                  {trip.merchants.map((m, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -12 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: i * 0.15 + idx * 0.06 }}
                      className="flex items-center gap-3 bg-surface-sunken hover:bg-surface-hover rounded-2xl p-3 transition-colors duration-150 cursor-default"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm shrink-0">
                        {m.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-fg truncate">{m.name}</p>
                        {/* #515154 on #F5F5F7 = 7.3:1 ✓ WCAG AA */}
                        <p className="text-[11px] text-muted">{m.type} · {m.time}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[13px] font-bold text-fg">{m.price}</p>
                        <p className="text-[11px] text-muted">voucher</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center gap-3 mb-3 text-[11px]">
                  <span className="flex items-center gap-1 text-orange-600 font-medium">
                    <Flame className="w-3.5 h-3.5" aria-hidden="true" />
                    {trip.bookedThisWeek} booked this week
                  </span>
                  <span className="flex items-center gap-1 text-muted">
                    <CalendarCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    {trip.validity}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSelectedTrip(trip); }}
                  className="relative z-10 self-start text-[12px] font-medium text-accent-ink mb-4 hover:underline"
                >
                  View itinerary
                </button>

                {/* Total + CTA */}
                <div className="flex items-end justify-between pt-4 border-t border-line-soft mt-auto">
                  <div>
                    <p className="text-[20px] font-bold text-fg">{trip.totalSGD}</p>
                    <p className={`text-[12px] font-semibold ${trip.savingsColor}`}>{trip.savings}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAdd(trip); }}
                    disabled={addedId === trip.id}
                    aria-label={`Add the ${trip.vibe} itinerary to cart`}
                    className="relative z-10 flex items-center gap-2 bg-fg hover:bg-fg-hover disabled:bg-emerald-600 text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-colors duration-200"
                  >
                    {addedId === trip.id ? <Check className="w-4 h-4" aria-hidden="true" /> : <ShoppingCart className="w-4 h-4" aria-hidden="true" />}
                    {addedId === trip.id ? "Added" : "Add Route to Cart"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <button className="inline-flex items-center gap-2 text-accent-ink text-[13px] font-semibold hover:underline">
            <Plus className="w-4 h-4" aria-hidden="true" />
            Build your own custom itinerary
          </button>
        </motion.div>
      </div>

      {/* Detail Modal */}
      <DetailModal open={!!selectedTrip} onClose={() => setSelectedTrip(null)}>
        {selectedTrip && (
          <div className="flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[92dvh] md:flex-row">
            {/* Header image */}
            <div className="relative h-56 shrink-0 md:h-auto md:w-2/5 md:min-h-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedTrip.photo}
                alt={selectedTrip.vibe}
                className="w-full h-full object-cover rounded-t-[28px] md:rounded-l-[28px] md:rounded-tr-none"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-t-[28px] md:rounded-l-[28px] md:rounded-tr-none" />
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="inline-block bg-[var(--accent)] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2">
                  Itinerary
                </span>
                <h3 className="text-2xl font-bold">{selectedTrip.vibe}</h3>
                <div className="flex items-center gap-4 mt-1.5 text-white/85 text-[12px]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" /> {selectedTrip.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> from {selectedTrip.from}
                  </span>
                </div>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="p-6 flex flex-1 min-h-0 min-w-0 flex-col">
              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                <p className="text-[13px] text-muted leading-relaxed mb-4">{selectedTrip.description}</p>

                {/* Highlights */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedTrip.highlights.map((h) => (
                    <span key={h} className="flex items-center gap-1.5 bg-surface-sunken text-fg text-[11px] font-medium px-3 py-1.5 rounded-full">
                      ✦ {h}
                    </span>
                  ))}
                </div>

                {/* Includes */}
                <div className="mb-4">
                  <p className="text-[12px] font-semibold text-fg mb-2">What&apos;s included</p>
                  <ul className="space-y-1.5">
                    {selectedTrip.includes.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-[12px] text-muted">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Promo — --accent-ink clears AA on the 10% accent tint. */}
                {selectedTrip.promo && (
                  <div className="bg-accent/10 text-[var(--accent-ink)] text-[12px] font-medium px-4 py-2.5 rounded-xl mb-4">
                    🎁 {selectedTrip.promo}
                  </div>
                )}

                {/* Social proof + validity */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] mb-4">
                  <span className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                    <span className="font-semibold text-fg">{selectedTrip.rating}</span>
                    <span className="text-muted">({selectedTrip.reviews} reviews)</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-orange-600 font-medium">
                    <Flame className="w-3.5 h-3.5" aria-hidden="true" />
                    {selectedTrip.bookedThisWeek} booked this week
                  </span>
                  <span className="flex items-center gap-1.5 text-muted">
                    <CalendarCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    {selectedTrip.validity}
                  </span>
                </div>

                {/* Stops */}
                <p className="text-[12px] font-semibold text-fg mb-2">Stops on this route</p>
                <div className="space-y-2">
                  {selectedTrip.merchants.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-surface-sunken rounded-2xl p-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm shrink-0">
                        {m.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-fg truncate">{m.name}</p>
                        <p className="text-[11px] text-muted">{m.type} · {m.time}</p>
                      </div>
                      <p className="text-[13px] font-bold text-fg shrink-0">{m.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-4 mt-4 border-t border-line-soft shrink-0">
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-fg">{selectedTrip.totalSGD}</span>
                    <span className="text-[11px] text-muted">E-Cash</span>
                  </div>
                  <p className={`text-[12px] font-semibold ${selectedTrip.savingsColor}`}>{selectedTrip.savings}</p>
                  <p className="text-[11px] text-muted truncate mt-0.5">
                    {selectedTrip.from} · {selectedTrip.hours}
                  </p>
                </div>
                <button
                  className="flex items-center gap-2 text-white text-[14px] font-bold px-6 py-3 rounded-xl transition-colors duration-200 shadow-lg bg-accent hover:bg-accent-hover shadow-accent/25"
                  onClick={() => { handleAdd(selectedTrip); setSelectedTrip(null); }}
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

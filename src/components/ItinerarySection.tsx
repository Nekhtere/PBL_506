"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Plus, MapPin, Clock, ShoppingCart, Check, Star, Flame, CalendarCheck, ChevronDown, Shuffle, Car } from "lucide-react";
import DetailModal from "./DetailModal";
import { useLocale } from "@/lib/locale-context";

// Itinerary = curated full-day travel package (transport + guided stops).
// Price = bundled travel cost (taxi/driver), NOT individual E-Cash vouchers.
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
    includes: ["Dedicated driver (full day)", "All transport between stops", "Guided itinerary", "Entry arrangements"],
    promo: "Book before 5pm for a complimentary driver briefing sheet",
    photo: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=900&q=80&auto=format&fit=crop",
    slots: [
      {
        time: "10:00",
        type: "Morning",
        default: { name: "Nagoya Wellness Spa", emoji: "💆", travelNote: "~15 min from ferry terminal", desc: "Full-body massage & aromatherapy" },
        alternatives: [
          { name: "Avani Spa Resort", emoji: "🌸", travelNote: "~30 min from ferry terminal", desc: "Premium resort spa experience" },
          { name: "Morning Kopitiam Nagoya", emoji: "☕", travelNote: "~10 min from ferry terminal", desc: "Local kopi & kaya toast breakfast" },
        ],
      },
      {
        time: "13:00",
        type: "Lunch",
        default: { name: "Golden Prawn Seafood", emoji: "🦐", travelNote: "~10 min from previous stop", desc: "Famous garlic butter prawn strip" },
        alternatives: [
          { name: "Batam Fresh Crab House", emoji: "🦀", travelNote: "~12 min from previous stop", desc: "Chilli & black pepper crab" },
          { name: "Harbour Bay Food Street", emoji: "🍜", travelNote: "~5 min from previous stop", desc: "Local Malay & Chinese hawker" },
        ],
      },
      {
        time: "15:30",
        type: "Afternoon",
        default: { name: "Avani Spa Resort", emoji: "🌸", travelNote: "~25 min from previous stop", desc: "Premium resort spa experience" },
        alternatives: [
          { name: "Nagoya Hill Mall", emoji: "🏬", travelNote: "~10 min from previous stop", desc: "Fashion & electronics shopping" },
          { name: "Barelang Bridge", emoji: "🌉", travelNote: "~35 min from previous stop", desc: "Scenic bridge photo stop" },
        ],
      },
      {
        time: "19:00",
        type: "Dinner",
        default: { name: "Batam Night Market", emoji: "🌃", travelNote: "~15 min from previous stop", desc: "Street food & local snacks" },
        alternatives: [
          { name: "Seafood Harbour Restaurant", emoji: "🐟", travelNote: "~10 min from previous stop", desc: "Sit-down seafood with harbour view" },
          { name: "Nagoya Entertainment District", emoji: "🍻", travelNote: "~12 min from previous stop", desc: "Drinks & live music" },
        ],
      },
    ],
    totalSGD: "S$ 80",
    savings: "Save S$ 18 vs. booking transport separately",
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
      "A power shopper's paradise. Navigate Batam's famous textile and electronics markets with a dedicated driver, then treat yourself to local delicacies.",
    duration: "6 hours",
    from: "Batam Center Ferry",
    hours: "09:00 – 18:00",
    highlights: ["Shopping spree", "Dedicated driver", "Local lunch"],
    includes: ["Dedicated driver (full day)", "All transport between stops", "Guided itinerary", "Luggage assistance"],
    promo: "Use code SAVE10 for 10% off",
    photo: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=900&q=80&auto=format&fit=crop",
    slots: [
      {
        time: "09:00",
        type: "Morning",
        default: { name: "Harbour Bay Mall", emoji: "🛍️", travelNote: "~5 min from ferry terminal", desc: "Fashion, bags & accessories" },
        alternatives: [
          { name: "Morning Kopitiam Nagoya", emoji: "☕", travelNote: "~10 min from ferry terminal", desc: "Local kopi & kaya toast breakfast" },
          { name: "Nagoya Hill Mall", emoji: "🏬", travelNote: "~15 min from ferry terminal", desc: "Fashion & electronics shopping" },
        ],
      },
      {
        time: "12:30",
        type: "Lunch",
        default: { name: "Batam Fresh Crab House", emoji: "🦀", travelNote: "~10 min from previous stop", desc: "Chilli & black pepper crab" },
        alternatives: [
          { name: "Golden Prawn Seafood", emoji: "🦐", travelNote: "~8 min from previous stop", desc: "Famous garlic butter prawn strip" },
          { name: "Harbour Bay Food Street", emoji: "🍜", travelNote: "~5 min from previous stop", desc: "Local Malay & Chinese hawker" },
        ],
      },
      {
        time: "14:30",
        type: "Afternoon",
        default: { name: "Nagoya Hill Mall", emoji: "🏬", travelNote: "~15 min from previous stop", desc: "Fashion & electronics shopping" },
        alternatives: [
          { name: "Harbour Bay Mall", emoji: "🛍️", travelNote: "~10 min from previous stop", desc: "Fashion, bags & accessories" },
          { name: "Barelang Bridge", emoji: "🌉", travelNote: "~35 min from previous stop", desc: "Scenic bridge photo stop" },
        ],
      },
    ],
    totalSGD: "S$ 39",
    savings: "Save S$ 12 vs. booking transport separately",
    savingsColor: "text-emerald-600",
    rating: 4.7,
    reviews: 268,
    bookedThisWeek: 54,
    validity: "Valid 30 days from purchase",
  },
];

type Itinerary = typeof itineraries[0];
type SlotChoice = { name: string; emoji: string; travelNote: string; desc: string };

// ── SlotRow ────────────────────────────────────────────────────────────────────
function SlotRow({
  slot,
  selected,
  onChange,
}: {
  slot: Itinerary["slots"][0];
  selected: SlotChoice;
  onChange: (choice: SlotChoice) => void;
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const allChoices = [slot.default, ...slot.alternatives];

  return (
    <div className="bg-surface-sunken rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3 hover:bg-surface-hover transition-colors text-left"
        aria-expanded={open}
      >
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm shrink-0">
          {selected.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-fg truncate">{selected.name}</p>
          <p className="text-[11px] text-muted flex items-center gap-1">
            <Car className="w-3 h-3 shrink-0" aria-hidden="true" />
            {slot.time} · {selected.travelNote}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-accent-ink">
          <Shuffle className="w-3 h-3" />
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-line-soft">
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">{t("itinerary.swapLabel")}</p>
              {allChoices.map((choice) => (
                <button
                  key={choice.name}
                  type="button"
                  onClick={() => { onChange(choice); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all ${
                    selected.name === choice.name
                      ? "bg-accent/10 ring-1 ring-accent/30"
                      : "hover:bg-white/60"
                  }`}
                >
                  <span className="text-lg w-7 text-center">{choice.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-fg truncate">{choice.name}</p>
                    <p className="text-[11px] text-muted">{choice.travelNote}</p>
                  </div>
                  {selected.name === choice.name && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── TripCard ───────────────────────────────────────────────────────────────────
function TripCard({
  trip,
  isInView,
  index,
  onAddToCart,
  onOpenDetail,
}: {
  trip: Itinerary;
  isInView: boolean;
  index: number;
  onAddToCart: (item: { name: string; price: string; subtitle?: string; image?: string; items?: string[]; kind: "deal" | "route" }) => void;
  onOpenDetail: (choices: SlotChoice[]) => void;
}) {
  const { t } = useLocale();
  const [slotChoices, setSlotChoices] = useState<SlotChoice[]>(trip.slots.map(s => s.default));
  const [addedId, setAddedId] = useState(false);
  const isCustomized = slotChoices.some((c, i) => c.name !== trip.slots[i].default.name);

  const handleAdd = () => {
    if (addedId) return;
    setAddedId(true);
    onAddToCart({
      name: trip.vibe,
      price: trip.totalSGD,
      subtitle: `${trip.duration} · from ${trip.from} · ${t("itinerary.transport")}`,
      image: trip.photo,
      items: slotChoices.map((c, i) => `${c.emoji} ${c.name} (${trip.slots[i].time})`),
      kind: "route",
    });
    setTimeout(() => setAddedId(false), 1400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="group relative bg-white rounded-3xl overflow-hidden flex flex-col cursor-pointer"
      style={{ boxShadow: "var(--sh-2)" }}
      whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.14)" }}
      onClick={() => onOpenDetail(slotChoices)}
    >
      {/* Hero photo */}
      <div className="relative h-56 overflow-hidden pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={trip.photo}
          alt={trip.vibe}
          loading="lazy"
          decoding="async"
          className="media-zoom absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-end p-6 text-white text-shadow-photo">
          <h3 className="text-[20px] font-bold mb-1.5 leading-tight">{trip.vibe}</h3>
          <p className="text-white/80 text-[13px] leading-relaxed line-clamp-2">{trip.description}</p>
          <div className="flex items-center gap-4 mt-3 text-white/75 text-[12px]">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" aria-hidden="true" /> {trip.duration}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" aria-hidden="true" /> {trip.from}</span>
            <span className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              {trip.rating} ({trip.reviews})
            </span>
          </div>
        </div>
      </div>

      {/* Slot stack — stop click from bubbling to card (so swap stays in card, not opening modal) */}
      <div className="p-5 flex flex-col flex-1" onClick={e => e.stopPropagation()}>
        {/* Always-visible hint — same style for both cards */}
        <div className={`mb-3 flex items-center gap-2 rounded-xl px-3 py-2 ${isCustomized ? "bg-accent/10" : "bg-surface-sunken"}`}>
          <Shuffle className={`w-3.5 h-3.5 shrink-0 ${isCustomized ? "text-accent-ink" : "text-muted"}`} />
          <p className={`text-[11px] font-semibold ${isCustomized ? "text-accent-ink" : "text-muted"}`}>
            {isCustomized ? t("itinerary.customised") : t("itinerary.default")}
          </p>
        </div>

        <div className="space-y-2 mb-4 flex-1">
          {trip.slots.map((slot, idx) => (
            <SlotRow
              key={idx}
              slot={slot}
              selected={slotChoices[idx]}
              onChange={(choice) => setSlotChoices(prev => prev.map((c, i) => i === idx ? choice : c))}
            />
          ))}
        </div>

        <div className="flex items-center gap-3 mb-3 text-[11px]">
          <span className="flex items-center gap-1 text-orange-600 font-medium">
            <Flame className="w-3.5 h-3.5" aria-hidden="true" />
            {trip.bookedThisWeek} {t("itinerary.booked")}
          </span>
          <span className="flex items-center gap-1 text-muted">
            <CalendarCheck className="w-3.5 h-3.5" aria-hidden="true" />
            {t("itinerary.validity")}
          </span>
        </div>

        {/* Total + CTA */}
        <div className="flex items-end justify-between pt-4 border-t border-line-soft mt-auto">
          <div>
            <p className="text-[11px] text-muted mb-0.5 flex items-center gap-1">
              <Car className="w-3 h-3" aria-hidden="true" /> {t("itinerary.transport")}
            </p>
            <p className="text-[20px] font-bold text-fg">{trip.totalSGD}</p>
            <p className={`text-[12px] font-semibold ${trip.savingsColor}`}>{trip.savings}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleAdd(); }}
            disabled={addedId}
            aria-label={`Add the ${trip.vibe} trip to cart`}
            className="flex items-center gap-2 bg-fg hover:bg-fg-hover disabled:bg-emerald-600 text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-colors duration-200"
          >
            {addedId ? <Check className="w-4 h-4" aria-hidden="true" /> : <ShoppingCart className="w-4 h-4" aria-hidden="true" />}
            {addedId ? t("itinerary.added") : t("itinerary.addCart")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── ItineraryModal ─────────────────────────────────────────────────────────────
function ItineraryModal({
  trip,
  initialChoices,
  onAddToCart,
  onClose,
}: {
  trip: Itinerary;
  initialChoices: SlotChoice[];
  onAddToCart: (item: { name: string; price: string; subtitle?: string; image?: string; items?: string[]; kind: "deal" | "route" }) => void;
  onClose: () => void;
}) {
  const [slotChoices, setSlotChoices] = useState<SlotChoice[]>(initialChoices);
  const { t } = useLocale();
  const [added, setAdded] = useState(false);
  const isCustomized = slotChoices.some((c, i) => c.name !== trip.slots[i].default.name);

  const handleAdd = () => {
    if (added) return;
    setAdded(true);
    onAddToCart({
      name: trip.vibe,
      price: trip.totalSGD,
      subtitle: `${trip.duration} · from ${trip.from} · ${t("itinerary.transport")}`,
      image: trip.photo,
      items: slotChoices.map((c, i) => `${c.emoji} ${c.name} (${trip.slots[i].time})`),
      kind: "route",
    });
    setTimeout(() => { setAdded(false); onClose(); }, 1000);
  };

  return (
    <div className="flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[92dvh] md:flex-row">
      {/* Left: photo */}
      <div className="relative h-64 shrink-0 md:h-auto md:w-5/12 md:min-h-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={trip.photo}
          alt={trip.vibe}
          className="w-full h-full object-cover rounded-t-[28px] md:rounded-l-[28px] md:rounded-tr-none"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-t-[28px] md:rounded-l-[28px] md:rounded-tr-none" />
        <div className="absolute bottom-5 left-6 right-6 text-white">
          <span className="inline-block bg-fg text-white text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2 flex items-center gap-1.5 w-fit">
            <Car className="w-3 h-3" /> {t("itinerary.label")}
          </span>
          <h3 className="text-2xl font-bold">{trip.vibe}</h3>
          <div className="flex items-center gap-4 mt-1.5 text-white/85 text-[12px]">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {trip.duration}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {trip.from}</span>
          </div>
        </div>
      </div>

      {/* Right: scrollable detail + swap */}
      <div className="p-6 flex flex-1 min-h-0 min-w-0 flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide space-y-5">
          <p className="text-[13px] text-muted leading-relaxed">{trip.description}</p>

          {/* What's included */}
          <div>
            <p className="text-[12px] font-semibold text-fg mb-2">{t("itinerary.included")}</p>
            <ul className="space-y-1.5">
              {trip.includes.map((item) => (
                <li key={item} className="flex items-center gap-2 text-[12px] text-muted">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />{item}
                </li>
              ))}
            </ul>
          </div>

          {/* Promo */}
          {trip.promo && (
            <div className="bg-accent/10 text-[var(--accent-ink)] text-[12px] font-medium px-4 py-2.5 rounded-xl">
              🎁 {trip.promo}
            </div>
          )}

          {/* Social proof */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px]">
            <span className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-fg">{trip.rating}</span>
              <span className="text-muted">({trip.reviews} {t("itinerary.reviews")})</span>
            </span>
            <span className="flex items-center gap-1.5 text-orange-600 font-medium">
              <Flame className="w-3.5 h-3.5" />{trip.bookedThisWeek} {t("itinerary.booked")}
            </span>
            <span className="flex items-center gap-1.5 text-muted">
              <CalendarCheck className="w-3.5 h-3.5" />{trip.validity}
            </span>
          </div>

          {/* Slot swap in modal */}
          <div>
            <div className={`mb-3 flex items-center gap-2 rounded-xl px-3 py-2 ${isCustomized ? "bg-accent/10" : "bg-surface-sunken"}`}>
              <Shuffle className={`w-3.5 h-3.5 shrink-0 ${isCustomized ? "text-accent-ink" : "text-muted"}`} />
              <p className={`text-[11px] font-semibold ${isCustomized ? "text-accent-ink" : "text-muted"}`}>
                {isCustomized ? t("itinerary.customised") : t("itinerary.default")}
              </p>
            </div>
            <div className="space-y-2">
              {trip.slots.map((slot, idx) => (
                <SlotRow
                  key={idx}
                  slot={slot}
                  selected={slotChoices[idx]}
                  onChange={(choice) => setSlotChoices(prev => prev.map((c, i) => i === idx ? choice : c))}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="flex items-center justify-between gap-4 pt-4 mt-4 border-t border-line-soft shrink-0">
          <div className="min-w-0">
            <p className="text-[11px] text-muted flex items-center gap-1 mb-0.5">
              <Car className="w-3 h-3" /> {t("itinerary.transportIncluded")} · {trip.hours}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-fg">{trip.totalSGD}</span>
              <span className="text-[11px] text-muted">{t("itinerary.perPax")}</span>
            </div>
            <p className={`text-[12px] font-semibold ${trip.savingsColor}`}>{trip.savings}</p>
          </div>
          <button
            onClick={handleAdd}
            disabled={added}
            className="flex items-center gap-2 text-white text-[14px] font-bold px-6 py-3 rounded-xl transition-colors duration-200 shadow-lg bg-accent hover:bg-accent-hover disabled:bg-emerald-600 shadow-accent/25"
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            {added ? t("itinerary.added") : t("itinerary.addCart")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ItinerarySection ───────────────────────────────────────────────────────────
export default function ItinerarySection({ onAddToCart }: {
  onAddToCart: (item: { name: string; price: string; subtitle?: string; image?: string; items?: string[]; kind: "deal" | "route" }) => void
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [modalState, setModalState] = useState<{ trip: Itinerary; choices: SlotChoice[] } | null>(null);
  const { t } = useLocale();

  return (
    <section id="itinerary" ref={sectionRef} className="py-24 px-6 bg-surface-sunken">
      <div className="max-w-6xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent-ink text-[12px] font-semibold tracking-widest uppercase">
            {t("itinerary.label")}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-fg mt-2 tracking-tight">
            {t("itinerary.heading1")} {t("itinerary.heading2")}
          </h2>
          <p className="text-muted mt-4 text-[15px] max-w-lg mx-auto leading-relaxed">
            {t("itinerary.sub")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {itineraries.map((trip, i) => (
            <TripCard
              key={trip.id}
              trip={trip}
              isInView={isInView}
              index={i}
              onAddToCart={onAddToCart}
              onOpenDetail={(choices) => setModalState({ trip, choices })}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <button className="inline-flex items-center gap-2 text-accent-ink text-[13px] font-semibold hover:underline">
            <Plus className="w-4 h-4" aria-hidden="true" />
            {t("itinerary.custom")}
          </button>
        </motion.div>
      </div>

      <DetailModal open={!!modalState} onClose={() => setModalState(null)}>
        {modalState && (
          <ItineraryModal
            trip={modalState.trip}
            initialChoices={modalState.choices}
            onAddToCart={onAddToCart}
            onClose={() => setModalState(null)}
          />
        )}
      </DetailModal>
    </section>
  );
}

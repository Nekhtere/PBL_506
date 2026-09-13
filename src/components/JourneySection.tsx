"use client";

import { useRef, useState, useMemo } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  ShoppingCart,
  Check,
  Star,
  CalendarCheck,
  Car,
  Users,
} from "lucide-react";
import DetailModal from "./DetailModal";
import { useLocale } from "@/lib/locale-context";
import {
  destinations,
  TERMINALS,
  DEFAULT_TERMINAL,
  haversineKm,
  type Terminal,
  type TerminalInfo,
} from "@/lib/destinations";
import { tours, THEME_META, type Tour, type TourSlot, type JourneyTheme } from "@/lib/tours";
import type { CartItem } from "@/lib/cart";

// ponytail: FX pegged at 11800 — swap for a live rate endpoint at launch.
const IDR_PER_SGD = 11800;

// Average driving speed assumption for Batam urban/inter-town roads (km/h).
const AVG_SPEED_KMH = 35;
// Buffer added to each leg for parking, traffic, and small delays (minutes).
const LEG_BUFFER_MIN = 10;
// Time spent at a stop before the next leg can begin (minutes).
const STOP_DURATION_MIN = 90;

function priceDisplay(sgd: number, locale: string) {
  return locale === "id"
    ? `Rp ${Math.round(sgd * IDR_PER_SGD).toLocaleString("id-ID")}`
    : `S$ ${sgd}`;
}

const THEMES: JourneyTheme[] = ["heritage", "nature-relax", "shop-treat", "island-explorer"];

// Resolve a slot's display: prefer the referenced destination's real name,
// fall back to the free-text stop (pickup, lunch, drop-off).
function slotDisplay(slot: TourSlot) {
  const d = slot.destinationId != null
    ? destinations.find((x) => x.id === slot.destinationId)
    : undefined;
  return { name: d?.name ?? slot.name ?? "", emoji: slot.emoji, travelNote: slot.travelNote, destination: d };
}

// Travel time in minutes between two lat/lng points, plus buffer.
function travelMinutes(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const km = haversineKm(a, b);
  return Math.ceil((km / AVG_SPEED_KMH) * 60) + LEG_BUFFER_MIN;
}

// Coordinates for a slot: real destination coords, or the terminal for pickup/drop-off.
function slotCoords(slot: TourSlot, terminal: TerminalInfo) {
  if (slot.destinationId != null) {
    const d = destinations.find((x) => x.id === slot.destinationId);
    if (d) return { lat: d.lat, lng: d.lng };
  }
  return { lat: terminal.lat, lng: terminal.lng };
}

// Format a time string like "09:30" from a Date object.
function formatTime(date: Date) {
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

// Recalculate slot times from the selected terminal. The first slot is always
// the pickup, scheduled shortly after the typical ferry arrival + immigration.
function computeTimeline(tour: Tour, terminal: TerminalInfo): { time: string; slot: TourSlot }[] {
  // Typical ferry arrival + immigration + walk to meeting point ≈ 45 min.
  const immigrationMin = 45;
  const start = new Date();
  start.setHours(8, 30, 0, 0);
  start.setMinutes(start.getMinutes() + immigrationMin + travelMinutes(terminal, slotCoords(tour.slots[1], terminal)));

  const result: { time: string; slot: TourSlot }[] = [];
  let current = new Date(start);

  tour.slots.forEach((slot, i) => {
    result.push({ time: formatTime(current), slot });

    const nextSlot = tour.slots[i + 1];
    if (!nextSlot) return;

    const from = slotCoords(slot, terminal);
    const to = slotCoords(nextSlot, terminal);
    const drive = travelMinutes(from, to);
    const stopTime = slot.type.toLowerCase().includes("pickup") ? 0 : STOP_DURATION_MIN;
    current = new Date(current.getTime() + (stopTime + drive) * 60000);
  });

  return result;
}

// ── TimelineRow ────────────────────────────────────────────────────────────────
function TimelineRow({
  slot,
  time,
  last,
}: {
  slot: TourSlot;
  time: string;
  last: boolean;
}) {
  const { name, emoji, travelNote, destination } = slotDisplay(slot);
  return (
    <div className="flex gap-3">
      {/* Rail */}
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-lg shadow-sm shrink-0 border border-line-soft">
          {emoji}
        </div>
        {!last && <div className="w-px flex-1 bg-line-soft my-1" />}
      </div>
      <div className={`min-w-0 ${last ? "" : "pb-4"}`}>
        <p className="text-[13px] font-semibold text-fg leading-snug">
          <span className="text-accent-ink font-bold mr-1.5">{time}</span>
          {name}
        </p>
        <p className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
          <Car className="w-3 h-3 shrink-0" aria-hidden="true" />
          {travelNote}
          {destination && (
            <span className="text-muted">· {destination.area}</span>
          )}
        </p>
      </div>
    </div>
  );
}

// ── TourCard ───────────────────────────────────────────────────────────────────
function TourCard({
  tour,
  terminal,
  isInView,
  index,
  onAddToCart,
  onOpenDetail,
}: {
  tour: Tour;
  terminal: Terminal;
  isInView: boolean;
  index: number;
  onAddToCart: (item: Omit<CartItem, "id">) => void;
  onOpenDetail: () => void;
}) {
  const { t, locale } = useLocale();
  const [added, setAdded] = useState(false);
  const meta = THEME_META[tour.theme];
  const terminalInfo = TERMINALS.find((x) => x.id === terminal) ?? TERMINALS[0];
  const computed = useMemo(() => computeTimeline(tour, terminalInfo), [tour, terminalInfo]);

  const handleAdd = () => {
    if (added) return;
    setAdded(true);
    onAddToCart({
      name: tour.name,
      price: `S$ ${tour.priceSGD}`,
      subtitle: `${tour.days > 1 ? t("journey.days2") : t("journey.day1")} · ${tour.durationHours}h · ${t("journey.transport")}`,
      image: meta.photo,
      items: tour.slots.map((s) => {
        const d = slotDisplay(s);
        return `${d.emoji} ${d.name} (${s.time})`;
      }),
      kind: "route",
      // A tour is car + driver only — no ferry. Lets the cart spot another
      // line that already covers the driver.
      covers: ["driver"],
    });
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12 }}
      className="group relative bg-white rounded-3xl overflow-hidden flex flex-col cursor-pointer"
      style={{ boxShadow: "var(--sh-2)" }}
      whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.14)" }}
      onClick={onOpenDetail}
    >
      {/* Hero photo */}
      <div className="relative h-44 overflow-hidden pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={meta.photo}
          alt={tour.name}
          loading="lazy"
          decoding="async"
          className="media-zoom absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-end p-5 text-white text-shadow-photo">
          <h3 className="text-[18px] font-bold mb-1 leading-tight">{tour.name}</h3>
          <div className="flex items-center gap-3 text-white/80 text-[12px]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {tour.durationHours}h{tour.days > 1 ? ` × ${tour.days}` : ""}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              {tour.rating} ({tour.reviews})
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <p className="text-[12px] text-muted leading-relaxed mb-4 line-clamp-2">
          {tour.tagline}
        </p>

        {/* Condensed timeline — first 3 slots + count */}
        <div className="mb-4 flex-1">
          {computed.slice(0, 3).map(({ time, slot }, i) => (
            <TimelineRow
              key={slot.time}
              slot={slot}
              time={time}
              last={i === Math.min(2, computed.length - 1) && computed.length <= 3}
            />
          ))}
          {computed.length > 3 && (
            <p className="text-[11px] text-accent-ink font-semibold mt-1 pl-12">
              {t("journey.moreStops").replace("{n}", String(computed.length - 3))}
            </p>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between pt-4 border-t border-line-soft mt-auto">
          <div>
            <p className="text-[11px] text-muted mb-0.5 flex items-center gap-1">
              <Car className="w-3 h-3" aria-hidden="true" /> {t("journey.transport")}
            </p>
            <p className="text-[20px] font-bold text-fg">
              {priceDisplay(tour.priceSGD, locale)}
              <span className="text-[11px] font-normal text-muted"> {t("journey.perPax")}</span>
            </p>
            <p className="text-[12px] font-semibold text-emerald-700">
              {t("journey.savings").replace("{s}", `S$ ${tour.savingsSGD}`)}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAdd();
            }}
            disabled={added}
            aria-label={`Add ${tour.name} to cart`}
            className="flex items-center gap-2 bg-fg hover:bg-fg-hover disabled:bg-emerald-600 text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-colors duration-200"
          >
            {added ? <Check className="w-4 h-4" aria-hidden="true" /> : <ShoppingCart className="w-4 h-4" aria-hidden="true" />}
            {added ? t("journey.added") : t("journey.addCart")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── TourModal ──────────────────────────────────────────────────────────────────
function TourModal({
  tour,
  terminal,
  onAddToCart,
  onClose,
}: {
  tour: Tour;
  terminal: Terminal;
  onAddToCart: (item: Omit<CartItem, "id">) => void;
  onClose: () => void;
}) {
  const { t, locale } = useLocale();
  const [added, setAdded] = useState(false);
  const meta = THEME_META[tour.theme];
  const terminalInfo = TERMINALS.find((x) => x.id === terminal) ?? TERMINALS[0];
  const computed = useMemo(() => computeTimeline(tour, terminalInfo), [tour, terminalInfo]);

  const handleAdd = () => {
    if (added) return;
    setAdded(true);
    onAddToCart({
      name: tour.name,
      price: `S$ ${tour.priceSGD}`,
      subtitle: `${tour.days > 1 ? t("journey.days2") : t("journey.day1")} · ${tour.durationHours}h · ${t("journey.transport")}`,
      image: meta.photo,
      items: tour.slots.map((s) => {
        const d = slotDisplay(s);
        return `${d.emoji} ${d.name} (${s.time})`;
      }),
      kind: "route",
      // A tour is car + driver only — no ferry. Lets the cart spot another
      // line that already covers the driver.
      covers: ["driver"],
    });
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[92dvh] md:flex-row">
      {/* Left: photo */}
      <div className="relative h-56 shrink-0 md:h-auto md:w-5/12 md:min-h-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={meta.photo}
          alt={tour.name}
          className="w-full h-full object-cover rounded-t-[28px] md:rounded-l-[28px] md:rounded-tr-none"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-t-[28px] md:rounded-l-[28px] md:rounded-tr-none" />
        <div className="absolute bottom-5 left-6 right-6 text-white">
          <span className="inline-flex bg-fg text-white text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2 items-center gap-1.5 w-fit">
            <Car className="w-3 h-3" aria-hidden="true" /> {t("journey.label")}
          </span>
          <h3 className="text-2xl font-bold">{tour.name}</h3>
          <div className="flex items-center gap-4 mt-1.5 text-white/85 text-[12px]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {tour.durationHours}h{tour.days > 1 ? ` × ${tour.days} ${t("journey.daysUnit")}` : ""}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" aria-hidden="true" /> {t("journey.minPax")}
            </span>
          </div>
        </div>
      </div>

      {/* Right: scrollable detail */}
      <div className="p-6 flex flex-1 min-h-0 min-w-0 flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide space-y-5">
          <p className="text-[13px] text-muted leading-relaxed">{tour.tagline}</p>

          {/* What's included */}
          <div>
            <p className="text-[12px] font-semibold text-fg mb-2">{t("journey.included")}</p>
            <ul className="space-y-1.5">
              {tour.includes.map((item) => (
                <li key={item} className="flex items-center gap-2 text-[12px] text-muted">
                  <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Honesty note — what is NOT included, per team decision #1 */}
          <div className="bg-surface-sunken text-muted text-[12px] px-4 py-2.5 rounded-xl">
            {t("journey.notIncluded")}
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px]">
            <span className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              <span className="font-semibold text-fg">{tour.rating}</span>
              <span className="text-muted">({tour.reviews} {t("journey.reviews")})</span>
            </span>
            <span className="flex items-center gap-1.5 text-muted">
              <CalendarCheck className="w-3.5 h-3.5" aria-hidden="true" />
              {t("journey.validity")}
            </span>
          </div>

          {/* Full timeline */}
          <div>
            <p className="text-[12px] font-semibold text-fg mb-3">{t("journey.schedule")}</p>
            {computed.map(({ time, slot }, i) => (
              <TimelineRow
                key={slot.time}
                slot={slot}
                time={time}
                last={i === computed.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="flex items-center justify-between gap-4 pt-4 mt-4 border-t border-line-soft shrink-0">
          <div className="min-w-0">
            <p className="text-[11px] text-muted flex items-center gap-1 mb-0.5">
              <Car className="w-3 h-3" aria-hidden="true" /> {t("journey.transport")}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-fg">{priceDisplay(tour.priceSGD, locale)}</span>
              <span className="text-[11px] text-muted">{t("journey.perPax")}</span>
            </div>
            <p className="text-[12px] font-semibold text-emerald-700">
              {t("journey.savings").replace("{s}", `S$ ${tour.savingsSGD}`)}
            </p>
          </div>
          <button
            onClick={handleAdd}
            disabled={added}
            className="flex items-center gap-2 text-white text-[14px] font-bold px-6 py-3 rounded-xl transition-colors duration-200 shadow-lg bg-accent hover:bg-accent-hover disabled:bg-emerald-600 shadow-accent/25"
          >
            {added ? <Check className="w-4 h-4" aria-hidden="true" /> : <ShoppingCart className="w-4 h-4" aria-hidden="true" />}
            {added ? t("journey.added") : t("journey.addCart")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── JourneySection ─────────────────────────────────────────────────────────────
export default function JourneySection({
  onAddToCart,
}: {
  onAddToCart: (item: Omit<CartItem, "id">) => void;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { t } = useLocale();
  const [theme, setTheme] = useState<JourneyTheme>("heritage");
  const [terminal, setTerminal] = useState<Terminal>(DEFAULT_TERMINAL);
  const [modalTour, setModalTour] = useState<Tour | null>(null);

  const visible = tours.filter((tour) => tour.theme === theme);

  return (
    <section id="journey" ref={sectionRef} className="py-16 sm:py-24 px-4 sm:px-6 bg-surface-sunken">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="text-accent-ink text-[12px] font-semibold tracking-widest uppercase">
            {t("journey.label")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-fg mt-2 tracking-tight">
            {t("journey.heading")}
          </h2>
          <p className="text-muted mt-4 text-[15px] max-w-lg mx-auto leading-relaxed">
            {t("journey.sub")}
          </p>
        </motion.div>

        {/* Terminal selector */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6"
        >
          <label htmlFor="terminal" className="text-[13px] text-muted">
            {t("journey.terminalLabel")}
          </label>
          <select
            id="terminal"
            value={terminal}
            onChange={(e) => setTerminal(e.target.value as Terminal)}
            className="w-full sm:w-auto min-w-[180px] bg-surface border border-line-soft rounded-xl px-4 py-2.5 text-[13px] text-fg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            {TERMINALS.map((term) => (
              <option key={term.id} value={term.id}>
                {term.name}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Theme tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex justify-center gap-2 mb-10 flex-wrap"
          role="tablist"
          aria-label="Journey themes"
        >
          {THEMES.map((key) => {
            const meta = THEME_META[key];
            const active = theme === key;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={active}
                onClick={() => setTheme(key)}
                className={`flex items-center gap-2 text-[13px] font-semibold px-4 py-2.5 rounded-full border transition-all duration-200 ${
                  active
                    ? "bg-fg text-white border-fg shadow-md"
                    : "bg-surface text-muted hover:text-fg border-line-soft hover:border-line"
                }`}
              >
                <span aria-hidden="true">{meta.emoji}</span>
                {t(meta.labelKey)}
              </button>
            );
          })}
        </motion.div>

        {/* Tour cards for the active theme */}
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className={`grid gap-6 ${visible.length === 1 ? "md:grid-cols-1 max-w-xl mx-auto" : "md:grid-cols-2"}`}
          >
            {visible.map((tour, i) => (
              <TourCard
                key={tour.id}
                tour={tour}
                terminal={terminal}
                isInView
                index={i}
                onAddToCart={onAddToCart}
                onOpenDetail={() => setModalTour(tour)}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Terminal note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center text-[12px] text-muted mt-6 max-w-md mx-auto"
        >
          {t("journey.terminalNote").replace("{terminal}", TERMINALS.find((x) => x.id === terminal)?.name ?? "")}
        </motion.p>

        {/* Distance-pricing note — honesty about why Alam costs more */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center text-[12px] text-muted mt-8 max-w-md mx-auto flex items-center justify-center gap-1.5"
        >
          <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          {t("journey.zoneNote")}
        </motion.p>
      </div>

      <DetailModal open={!!modalTour} onClose={() => setModalTour(null)}>
        {modalTour && (
          <TourModal
            tour={modalTour}
            terminal={terminal}
            onAddToCart={onAddToCart}
            onClose={() => setModalTour(null)}
          />
        )}
      </DetailModal>
    </section>
  );
}

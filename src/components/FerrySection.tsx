"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Ship, Clock, MapPin, ArrowRight, Info, X, Check, AlertCircle, Ticket, Car, ShoppingCart } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import type { CartItem } from "@/lib/cart";
import {
  FERRY_ROUTES as routes,
  FARE_INCLUDES,
  NATIONALITIES,
  VOA_FREE,
  ROUTE_THEMES,
  type FerryRoute as Route,
} from "@/lib/ferry-routes";

// Keys, not strings — the four tips read through the translation table.
const tips = ["ferry.tip1", "ferry.tip2", "ferry.tip3", "ferry.tip4"];

interface BookingForm {
  fullName: string;
  passportNumber: string;
  passportExpiry: string;
  nationality: string;
  travelDate: string;
  schedule: string;
  tripType: "one-way" | "return";
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

// Returns the two dates that failed the 6-month rule; the translated message
// is built in the component (module scope can't call useLocale).
function validatePassport(expiry: string, travelDate: string): { expiry: string; min: string } | null {
  if (!expiry || !travelDate) return null;
  const expiryDate = new Date(expiry);
  const departure = new Date(travelDate);
  const minRequired = addMonths(departure, 6);
  if (expiryDate < minRequired) {
    const fmt = (d: Date) => d.toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" });
    return { expiry: fmt(expiryDate), min: fmt(minRequired) };
  }
  return null;
}

function BookingModal({ route, onClose, onAddToCart, onViewCart, onSeeTours }: {
  route: Route;
  onClose: () => void;
  onAddToCart: (item: Omit<CartItem, "id">) => void;
  onViewCart: () => void;
  onSeeTours: () => void;
}) {
  const { t } = useLocale();
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState<BookingForm>({
    fullName: "",
    passportNumber: "",
    passportExpiry: "",
    nationality: "Singapore",
    travelDate: today,
    schedule: route.schedules[0],
    tripType: "one-way",
  });
  const [touched, setTouched] = useState<Partial<Record<keyof BookingForm, boolean>>>({});
  const [added, setAdded] = useState(false);
  // The bundle offer only appears after a booking lands and stays dismissible —
  // it's a nudge toward the flagship product, not a gate on finishing here.
  const [showUpsell, setShowUpsell] = useState(true);

  const passportInvalid = validatePassport(form.passportExpiry, form.travelDate);
  const passportError = passportInvalid
    ? t("ferry.modal.passportInvalid").replace("{expiry}", passportInvalid.expiry).replace("{min}", passportInvalid.min)
    : null;
  const nameError = touched.fullName && !form.fullName.trim() ? t("ferry.modal.nameRequired") : null;
  const passportNumError = touched.passportNumber && !form.passportNumber.trim() ? t("ferry.modal.passportRequired") : null;
  const expiryError = touched.passportExpiry && !form.passportExpiry ? t("ferry.modal.expiryRequired") : passportError && touched.passportExpiry ? passportError : null;

  const isValid = form.fullName.trim() && form.passportNumber.trim() && form.passportExpiry && !passportError;
  const price = form.tripType === "return" ? route.returnPriceNum : route.priceNum;
  const needsVoa = !VOA_FREE.has(form.nationality) && form.nationality !== "Indonesia";

  if (added) {
    return (
      <div className="p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-emerald-700" />
        </div>
        <h3 className="text-xl font-bold text-fg mb-1">{t("ferry.modal.addedTitle")}</h3>
        <p className="text-[13px] text-muted mb-4">{t("ferry.modal.addedBody")}</p>
        <div className="w-full bg-surface-sunken rounded-2xl p-4 text-left space-y-2 mb-6">
          <div className="flex justify-between text-[13px]">
            <span className="text-muted">{t("ferry.modal.passenger")}</span>
            <span className="font-semibold text-fg">{form.fullName}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-muted">{t("ferry.modal.route")}</span>
            <span className="font-semibold text-fg">{route.from.split(",")[0]} → {route.to}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-muted">{t("ferry.modal.datetime")}</span>
            <span className="font-semibold text-fg">{new Date(form.travelDate).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" })} · {form.schedule}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-muted">{t("ferry.modal.trip2")}</span>
            <span className="font-semibold text-fg capitalize">{form.tripType === "one-way" ? t("ferry.modal.oneWay") : t("ferry.modal.return")}</span>
          </div>
          <div className="flex justify-between text-[13px] pt-2 border-t border-line-soft">
            <span className="text-muted">{t("ferry.modal.price")}</span>
            <span className="font-bold text-fg">S$ {price.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={onViewCart}
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl transition-colors"
        >
          <ShoppingCart className="w-4 h-4" aria-hidden="true" />
          {t("ferry.modal.viewCart")}
        </button>
        <button
          onClick={onClose}
          className="mt-2 w-full text-[13px] font-medium text-muted hover:text-fg transition-colors py-2"
        >
          {t("ferry.modal.keepBrowsing")}
        </button>

        {/* Cross-sell to the day tours — the crossing is in the cart, so the
            wheels are the gap left in the trip. Points at Journey, not Bundle:
            a bundle carries its own return ferry and would charge the crossing
            twice. Dismissible, and it never blocks closing out the ferry the
            buyer actually came here for. */}
        {showUpsell && (
          <div className="w-full text-left bg-surface-sunken border border-line-soft rounded-2xl p-4 mt-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Car className="w-4 h-4 text-accent-ink" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-fg">{t("ferry.upsell.title")}</p>
                <p className="text-[12px] text-muted leading-relaxed mt-1">{t("ferry.upsell.body")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={onSeeTours}
                className="flex-1 bg-accent hover:bg-accent-hover text-white text-[12px] font-bold py-2.5 rounded-xl transition-colors"
              >
                {t("ferry.upsell.cta")}
              </button>
              <button
                type="button"
                onClick={() => setShowUpsell(false)}
                className="shrink-0 text-[12px] font-medium text-muted hover:text-fg px-3 py-2.5 transition-colors"
              >
                {t("ferry.upsell.dismiss")}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[92dvh]">
      <div className="p-6 border-b border-line-soft shrink-0">
        <h3 className="text-xl font-bold text-fg">{t("ferry.modal.title")}</h3>
        <p className="text-[13px] text-muted mt-0.5">{route.from.split(",")[0]} → {route.to} · {route.crossing}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
        {/* Trip type */}
        <div>
          <label className="text-[12px] font-semibold text-fg mb-2 block">{t("ferry.modal.trip")}</label>
          <div className="grid grid-cols-2 gap-2">
            {(["one-way", "return"] as const).map((tripType) => (
              <button
                key={tripType}
                onClick={() => setForm(f => ({ ...f, tripType }))}
                className={`py-2.5 rounded-xl text-[13px] font-semibold border transition-all ${form.tripType === tripType ? "bg-accent text-white border-accent" : "bg-surface-sunken text-fg border-transparent hover:border-line"}`}
              >
                {tripType === "one-way" ? t("ferry.modal.oneWay") : t("ferry.modal.return")} · S$ {(tripType === "return" ? route.returnPriceNum : route.priceNum).toFixed(2)}
              </button>
            ))}
          </div>
        </div>

        {/* Travel date */}
        <div>
          <label className="text-[12px] font-semibold text-fg mb-1.5 block" htmlFor="travel-date">{t("ferry.modal.date")}</label>
          <input
            id="travel-date"
            type="date"
            min={today}
            value={form.travelDate}
            onChange={e => setForm(f => ({ ...f, travelDate: e.target.value, schedule: route.schedules[0] }))}
            className="w-full bg-surface-sunken rounded-xl px-4 py-2.5 text-[13px] text-fg border border-transparent focus:border-accent focus:outline-none"
          />
        </div>

        {/* Schedule */}
        <div>
          <label className="text-[12px] font-semibold text-fg mb-2 block">{t("ferry.modal.time")}</label>
          <div className="flex flex-wrap gap-2">
            {route.schedules.map(s => (
              <button
                key={s}
                onClick={() => setForm(f => ({ ...f, schedule: s }))}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${form.schedule === s ? "bg-accent text-white border-accent" : "bg-surface-sunken text-fg border-transparent hover:border-line"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Full name */}
        <div>
          <label className="text-[12px] font-semibold text-fg mb-1.5 block" htmlFor="full-name">{t("ferry.modal.name")}</label>
          <input
            id="full-name"
            type="text"
            placeholder="e.g. TAN WEI MING"
            value={form.fullName}
            onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
            onBlur={() => setTouched(prev => ({ ...prev, fullName: true }))}
            className={`w-full bg-surface-sunken rounded-xl px-4 py-2.5 text-[13px] text-fg border focus:outline-none transition-colors ${nameError ? "border-red-400" : "border-transparent focus:border-accent"}`}
          />
          {nameError && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{nameError}</p>}
        </div>

        {/* Passport number */}
        <div>
          <label className="text-[12px] font-semibold text-fg mb-1.5 block" htmlFor="passport-num">{t("ferry.modal.passport")}</label>
          <input
            id="passport-num"
            type="text"
            placeholder="e.g. K1234567A"
            value={form.passportNumber}
            onChange={e => setForm(f => ({ ...f, passportNumber: e.target.value.toUpperCase() }))}
            onBlur={() => setTouched(prev => ({ ...prev, passportNumber: true }))}
            className={`w-full bg-surface-sunken rounded-xl px-4 py-2.5 text-[13px] text-fg border focus:outline-none font-mono tracking-wider transition-colors ${passportNumError ? "border-red-400" : "border-transparent focus:border-accent"}`}
          />
          {passportNumError && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{passportNumError}</p>}
        </div>

        {/* Passport expiry */}
        <div>
          <label className="text-[12px] font-semibold text-fg mb-1.5 block" htmlFor="passport-expiry">
            {t("ferry.modal.expiry")}
            <span className="text-muted font-normal ml-1.5">{t("ferry.modal.expiryNote")}</span>
          </label>
          <input
            id="passport-expiry"
            type="date"
            value={form.passportExpiry}
            onChange={e => setForm(f => ({ ...f, passportExpiry: e.target.value }))}
            onBlur={() => setTouched(prev => ({ ...prev, passportExpiry: true }))}
            className={`w-full bg-surface-sunken rounded-xl px-4 py-2.5 text-[13px] text-fg border focus:outline-none transition-colors ${expiryError ? "border-red-400" : "border-transparent focus:border-accent"}`}
          />
          {expiryError && (
            <p className="text-[11px] text-red-500 mt-1 flex items-start gap-1">
              <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
              {expiryError}
            </p>
          )}
          {form.passportExpiry && !expiryError && (
            <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
              <Check className="w-3 h-3" /> {t("ferry.modal.verified")}
            </p>
          )}
        </div>
        {/* Nationality — drives the VOA notice */}
        <div>
          <label className="text-[12px] font-semibold text-fg mb-1.5 block" htmlFor="nationality">{t("ferry.modal.nationality")}</label>
          <select
            id="nationality"
            value={form.nationality}
            onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
            className="w-full bg-surface-sunken rounded-xl px-4 py-2.5 text-[13px] text-fg border border-transparent focus:border-accent focus:outline-none"
          >
            {NATIONALITIES.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          {needsVoa && (
            <p className="text-[11px] text-amber-700 bg-amber-500/10 rounded-lg px-3 py-2 mt-2 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 mt-px shrink-0" aria-hidden="true" />
              {t("ferry.modal.voaNotice")}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-line-soft shrink-0 space-y-3">
        {/* Fare breakdown — matches what the published fare already includes,
            so the total never reads as padded with hidden fees. */}
        <div className="bg-surface-sunken rounded-xl px-4 py-3 space-y-1 text-[12px] text-muted">
          <div className="flex justify-between">
            <span>{t("ferry.modal.fareTicket")}</span>
            <span>S$ {FARE_INCLUDES.ticket.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("ferry.modal.fareSgFee")}</span>
            <span>S$ {FARE_INCLUDES.sgDepartureFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("ferry.modal.fareBatamFee")}</span>
            <span>S$ {FARE_INCLUDES.batamDepartureFee.toFixed(2)}</span>
          </div>
          {form.tripType === "return" && (
            <div className="flex justify-between text-emerald-700 font-medium pt-1 border-t border-line-soft">
              <span>{t("ferry.modal.returnSaving")}</span>
              <span>-S$ {(route.priceNum * 2 - route.returnPriceNum).toFixed(2)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-muted">{t("ferry.modal.total")}</p>
            <p className="text-2xl font-bold text-fg">S$ {price.toFixed(2)}</p>
          </div>
          <button
            disabled={!isValid}
            onClick={() => {
              const dateLabel = new Date(form.travelDate).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" });
              const tripLabel = form.tripType === "one-way" ? t("ferry.modal.oneWay") : t("ferry.modal.return");
              onAddToCart({
                name: `${t("ferry.ticketName")} · ${route.to}`,
                price: `S$ ${price.toFixed(2)}`,
                subtitle: `${dateLabel} · ${form.schedule} · ${tripLabel}`,
                items: [
                  `👤 ${form.fullName}`,
                  `🛂 ${form.passportNumber}`,
                  `📍 ${route.from.split(",")[0]} → ${route.to}`,
                  `🗓 ${dateLabel} · ${form.schedule}`,
                  `🎫 ${tripLabel}`,
                ],
                kind: "route",
                // A ferry ticket covers the crossing only — no driver. This is
                // what lets the cart flag a bundle that already includes it.
                covers: ["ferry"],
                ferry: {
                  passenger: form.fullName,
                  passportNumber: form.passportNumber,
                  passportExpiry: form.passportExpiry,
                  nationality: form.nationality,
                  routeFrom: route.from.split(",")[0],
                  routeTo: route.to,
                  travelDate: form.travelDate,
                  schedule: form.schedule,
                  tripType: form.tripType,
                },
              });
              setAdded(true);
            }}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-accent/25"
          >
            <Ticket className="w-4 h-4" /> {t("ferry.modal.addToCart")}
          </button>
        </div>
        <p className="text-[11px] text-muted text-center">{t("ferry.modal.demo")}</p>
      </div>
    </div>
  );
}

export default function FerrySection({ onAddToCart, onOpenCart }: {
  onAddToCart: (item: Omit<CartItem, "id">) => void;
  /** Opens the cart drawer — the modal closes itself first. */
  onOpenCart: () => void;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const { t } = useLocale();

  return (
    <section id="ferry" ref={sectionRef} className="py-24 px-6 bg-[var(--bg)]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 max-w-xl"
        >
          <span className="text-[var(--accent-ink)] text-[12px] font-semibold tracking-widest uppercase">
            {t("ferry.label")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--fg)] mt-2 tracking-tight">
            {t("ferry.heading")}
          </h2>
          <p className="text-[var(--muted)] mt-3 text-[15px] leading-relaxed">
            {t("ferry.sub")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {routes.map((r, i) => {
            const theme = ROUTE_THEMES[r.id];
            return (
              <motion.article
                key={r.to}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -4, boxShadow: "0 16px 48px rgba(0,0,0,0.10)" }}
                className="group relative bg-[var(--surface)] border border-[var(--line)] rounded-3xl overflow-hidden flex flex-col"
                style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}
              >
                {/* Coloured header strip + badge */}
                <div className={`relative h-20 bg-gradient-to-r ${theme.gradient} p-5 overflow-hidden`}>
                  <div className="absolute -right-4 -top-6 w-24 h-24 rounded-full bg-white/30 blur-2xl" />
                  <span className={`relative inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-white/50 ${theme.accent}`}>
                    <Ship className="w-3 h-3" aria-hidden="true" />
                    {t(theme.badgeKey)}
                  </span>
                </div>

                <div className="p-5 flex flex-col gap-4 flex-1">
                  {/* Visual route bar */}
                  <div className="flex items-center gap-2 text-[13px]">
                    <div className="text-center min-w-[4.5rem]">
                      <p className="font-bold text-[var(--fg)]">{theme.shortFrom}</p>
                      <p className="text-[10px] text-[var(--muted)]">SG</p>
                    </div>
                    <div className="flex-1 relative h-8 flex items-center px-1">
                      <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-0.5 bg-[var(--line-soft)]" />
                      <motion.div
                        className={`absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border-2 border-[var(--line)] flex items-center justify-center shadow-sm ${theme.accent}`}
                        initial={{ left: "0%", x: "-50%" }}
                        whileInView={{ left: "100%", x: "-50%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.2 + i * 0.1, ease: "easeInOut" }}
                      >
                        <Ship className="w-3.5 h-3.5" />
                      </motion.div>
                    </div>
                    <div className="text-center min-w-[4.5rem]">
                      <p className="font-bold text-[var(--fg)]">{r.to}</p>
                      <p className="text-[10px] text-[var(--muted)]">ID</p>
                    </div>
                  </div>

                  {/* Operator & meta */}
                  <div className="space-y-2">
                    <p className="text-[12px] text-[var(--muted)]">{r.operators}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[12px] text-[var(--muted)]">
                      <span className="flex items-center gap-1.5 bg-surface-sunken px-2 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" /> {r.crossing}
                      </span>
                      <span className="flex items-center gap-1.5 text-[var(--fg)] font-semibold">
                        <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> {t(r.noteKey)}
                      </span>
                    </div>
                  </div>

                  {/* Ticket-style footer with price */}
                  <div className="mt-auto pt-4 border-t-2 border-dashed border-[var(--line-soft)] relative">
                    {/* Ticket holes */}
                    <div className="absolute -left-6 top-0 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--bg)] border border-[var(--line)]" />
                    <div className="absolute -right-6 top-0 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--bg)] border border-[var(--line)]" />

                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[11px] text-[var(--muted)] mb-0.5">
                          S$ {r.priceNum} {t("ferry.oneWay")}
                        </p>
                        <p className="text-xl font-bold text-[var(--fg)]">
                          S$ {r.returnPriceNum}
                          <span className="text-[12px] font-normal text-[var(--muted)] ml-1">{t("ferry.return")}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedRoute(r)}
                        className="flex items-center gap-2 bg-fg hover:bg-fg-hover text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-colors"
                      >
                        <Ticket className="w-4 h-4" aria-hidden="true" />
                        {t("ferry.bookTicket")}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-[var(--surface-sunken)] rounded-3xl p-6"
        >
          <h3 className="text-[13px] font-semibold text-[var(--fg)] mb-3">{t("ferry.beforeBoard")}</h3>
          <ul className="grid sm:grid-cols-2 gap-2.5 mb-4">
            {tips.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-[12px] text-[var(--muted)] leading-relaxed">
                <ArrowRight className="w-3.5 h-3.5 text-[var(--accent-ink)] shrink-0 mt-0.5" aria-hidden="true" />
                {t(tip)}
              </li>
            ))}
          </ul>
          <p className="flex items-start gap-2 text-[11px] text-[var(--muted)] border-t border-[var(--line-soft)] pt-3">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
            {t("ferry.disclaimer")}
          </p>
        </motion.div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedRoute && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/45 p-3 sm:p-6 backdrop-blur-md"
            onClick={() => setSelectedRoute(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 28 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              className="card-soft relative w-full max-w-md max-h-full overflow-hidden rounded-t-[28px] sm:rounded-[28px] bg-white"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="glass absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-fg transition-transform hover:scale-105"
                onClick={() => setSelectedRoute(null)}
                aria-label="Close booking"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
              <BookingModal
                route={selectedRoute}
                onClose={() => setSelectedRoute(null)}
                onAddToCart={onAddToCart}
                onViewCart={() => {
                  setSelectedRoute(null);
                  onOpenCart();
                }}
                onSeeTours={() => {
                  // Close first, then scroll — a fixed overlay would swallow the
                  // smooth scroll if we left it up.
                  setSelectedRoute(null);
                  document.getElementById("journey")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

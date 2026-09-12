"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Ship, Clock, MapPin, ArrowRight, Info, X, Check, AlertCircle, Ticket } from "lucide-react";
import { useLocale } from "@/lib/locale-context";

// Fares verified against batamfast.com published fare (Sep 2026):
// SGD 43 one-way SG→Batam, SGD 40 Batam→SG, SGD 76 return — all inclusive of
// the S$10 Singapore and S$10 Batam passenger departure fees.
// ponytail: live inventory + confirmed pricing via the BatamFast agent/eFast
// channel once the partnership is signed.
const routes = [
  {
    id: "harbourfront-batamcentre",
    from: "HarbourFront Centre, Singapore",
    to: "Batam Centre",
    operators: "BatamFast · Majestic Fast Ferry · Sindo Ferry",
    crossing: "~45 min",
    priceNum: 43,
    returnPriceNum: 76,
    noteKey: "ferry.note.batamcentre",
    schedules: ["08:00", "09:30", "11:00", "13:00", "15:00", "17:00", "19:00"],
  },
  {
    id: "harbourfront-harbourbay",
    from: "HarbourFront Centre, Singapore",
    to: "Harbour Bay",
    operators: "BatamFast · Majestic Fast Ferry",
    crossing: "~45 min",
    priceNum: 43,
    returnPriceNum: 76,
    noteKey: "ferry.note.harbourbay",
    schedules: ["08:30", "10:00", "12:00", "14:00", "16:00", "18:00"],
  },
  {
    id: "harbourfront-sekupang",
    from: "HarbourFront Centre, Singapore",
    to: "Sekupang",
    operators: "BatamFast · Sindo Ferry",
    crossing: "~50 min",
    priceNum: 43,
    returnPriceNum: 76,
    noteKey: "ferry.note.sekupang",
    schedules: ["09:00", "11:00", "14:00", "17:00"],
  },
  {
    id: "tanahmera-nongsapura",
    from: "Tanah Merah Ferry Terminal, Singapore",
    to: "Nongsapura",
    operators: "BatamFast",
    crossing: "~35 min",
    priceNum: 43,
    returnPriceNum: 76,
    noteKey: "ferry.note.nongsapura",
    schedules: ["08:00", "10:30", "13:00", "15:30", "18:00"],
  },
];

// What the published fare already pays for — shown in the modal so the price
// never reads as padded. Source: batamfast.com fare breakdown.
const FARE_INCLUDES = { ticket: 23, sgDepartureFee: 10, batamDepartureFee: 10 };

// Keys, not strings — the four tips read through the translation table.
const tips = ["ferry.tip1", "ferry.tip2", "ferry.tip3", "ferry.tip4"];

type Route = typeof routes[0];

interface BookingForm {
  fullName: string;
  passportNumber: string;
  passportExpiry: string;
  nationality: string;
  travelDate: string;
  schedule: string;
  tripType: "one-way" | "return";
}

// Nationality drives the VOA notice — SG passports enter Indonesia visa-free
// (30 days), most others pay Visa on Arrival at the terminal. Mirrors the
// region selector in BatamFast's own booking form.
const NATIONALITIES = [
  "Singapore",
  "Indonesia",
  "Malaysia",
  "India",
  "China",
  "Philippines",
  "Vietnam",
  "Thailand",
  "Australia",
  "United Kingdom",
  "United States",
  "Japan",
  "South Korea",
  "Other",
] as const;

const VOA_FREE = new Set(["Singapore"]);

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

function BookingModal({ route, onClose, onConfirm }: { route: Route; onClose: () => void; onConfirm: (booking: BookingForm) => void }) {
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
  const [submitted, setSubmitted] = useState(false);
  // Generated once when the ticket is issued — not during render, where an
  // impure value would change on every re-render (and trips react-hooks/purity).
  const [ticketCode, setTicketCode] = useState("");

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

  if (submitted) {
    return (
      <div className="p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-fg mb-1">{t("ferry.modal.confirmed")}</h3>
        <p className="text-[13px] text-muted mb-4">{t("ferry.modal.emailSent")}</p>
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
            <span className="text-muted">{t("ferry.modal.paid")}</span>
            <span className="font-bold text-fg">S$ {price.toFixed(2)}</span>
          </div>
        </div>
        <div className="w-full bg-accent/10 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <Ticket className="w-8 h-8 text-accent-ink shrink-0" />
          <div className="text-left">
            <p className="text-[12px] font-semibold text-fg">E-Ticket #BSM-{ticketCode}</p>
            <p className="text-[11px] text-muted">{t("ferry.modal.eticket")}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl transition-colors">
          {t("ferry.modal.done")}
        </button>
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
            <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
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
              setTicketCode(Math.random().toString(36).slice(2, 8).toUpperCase());
              onConfirm(form);
              setSubmitted(true);
            }}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-accent/25"
          >
            <Ticket className="w-4 h-4" /> {t("ferry.modal.confirm")}
          </button>
        </div>
        <p className="text-[11px] text-muted text-center">{t("ferry.modal.demo")}</p>
      </div>
    </div>
  );
}

export default function FerrySection() {
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
          {routes.map((r, i) => (
            <motion.article
              key={r.to}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 flex flex-col gap-4"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Ship className="w-5 h-5 text-[var(--accent-ink)]" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-[var(--muted)] flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">{r.from}</span>
                  </p>
                  <p className="text-[15px] font-semibold text-[var(--fg)] mt-0.5">→ {r.to}</p>
                </div>
              </div>
              <p className="text-[12px] text-[var(--muted)]">{r.operators}</p>
              <div className="flex items-center gap-4 text-[12px] text-[var(--muted)]">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" /> {r.crossing}
                </span>
                <span className="font-semibold text-[var(--fg)]">
                  S$ {r.priceNum} {t("ferry.oneWay")} · S$ {r.returnPriceNum} {t("ferry.return")}
                </span>
              </div>
              <p className="text-[12px] text-[var(--accent-ink)]">{t(r.noteKey)}</p>
              <button
                onClick={() => setSelectedRoute(r)}
                className="mt-auto w-full flex items-center justify-center gap-2 bg-fg hover:bg-fg-hover text-white text-[13px] font-semibold py-2.5 rounded-xl transition-colors"
              >
                <Ticket className="w-4 h-4" aria-hidden="true" />
                {t("ferry.bookTicket")}
              </button>
            </motion.article>
          ))}
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
                onConfirm={() => {}}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

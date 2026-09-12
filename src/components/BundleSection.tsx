"use client";

import { useRef, useState, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import {
  Clock,
  ShoppingCart,
  Check,
  Ship,
  Car,
  Star,
  BadgePercent,
  AlertCircle,
  Ticket,
  Settings2,
} from "lucide-react";
import DetailModal from "./DetailModal";
import { useLocale } from "@/lib/locale-context";
import { bundles, buildBundleTimeline, type Bundle, type BundleSlot } from "@/lib/bundles";
import {
  FERRY_ROUTES,
  NATIONALITIES,
  VOA_FREE,
  ROUTE_THEMES,
  type FerryRoute,
} from "@/lib/ferry-routes";
import type { Covered } from "@/lib/coverage";
import type { NewCartItem } from "@/lib/cart";

// ponytail: FX pegged at 11800 — swap for a live rate endpoint at launch.
const IDR_PER_SGD = 11800;

function priceDisplay(sgd: number, locale: string) {
  return locale === "id"
    ? `Rp ${Math.round(sgd * IDR_PER_SGD).toLocaleString("id-ID")}`
    : `S$ ${sgd}`;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

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

interface BookingForm {
  fullName: string;
  passportNumber: string;
  passportExpiry: string;
  nationality: string;
  travelDate: string;
  outboundSchedule: string;
  returnSchedule: string;
}

function cartItemFor(
  b: Bundle,
  route: FerryRoute,
  form: BookingForm,
  finalPrice: number,
  dayLabel: string,
): NewCartItem {
  return {
    name: b.name,
    price: `S$ ${finalPrice}`,
    subtitle: `${dayLabel} · ${route.to}`,
    image: b.photo,
    items: b.includes,
    kind: "route",
    covers: ["ferry", "driver"] satisfies Covered[],
    ferry: {
      passenger: form.fullName,
      passportNumber: form.passportNumber,
      passportExpiry: form.passportExpiry,
      nationality: form.nationality,
      routeFrom: route.from.split(",")[0],
      routeTo: route.to,
      travelDate: form.travelDate,
      schedule: `${form.outboundSchedule} / ${form.returnSchedule}`,
      tripType: "return",
    },
  };
}

// ── TimelineRow ────────────────────────────────────────────────────────────────
function TimelineRow({ slot, last }: { slot: BundleSlot; last: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-lg shadow-sm shrink-0 border border-line-soft">
          {slot.emoji}
        </div>
        {!last && <div className="w-px flex-1 bg-line-soft my-1" />}
      </div>
      <div className={`min-w-0 ${last ? "" : "pb-4"}`}>
        <p className="text-[13px] font-semibold text-fg leading-snug">
          {slot.time && <span className="text-accent-ink font-bold mr-1.5">{slot.time}</span>}
          {slot.label}
        </p>
        {slot.note && <p className="text-[11px] text-muted mt-0.5">{slot.note}</p>}
      </div>
    </div>
  );
}

// ── BundleCard ─────────────────────────────────────────────────────────────────
function BundleCard({
  bundle: b,
  route,
  outboundSchedule,
  returnSchedule,
  isInView,
  index,
  featured,
  onOpenDetail,
}: {
  bundle: Bundle;
  route: FerryRoute;
  outboundSchedule: string;
  returnSchedule: string;
  isInView: boolean;
  index: number;
  featured: boolean;
  onOpenDetail: () => void;
}) {
  const { t, locale } = useLocale();
  const finalPrice = b.basePriceSGD + route.returnPriceNum;
  const saving = b.separateSGD - finalPrice;
  const theme = ROUTE_THEMES[route.id];
  const timeline = useMemo(
    () => buildBundleTimeline(b, route, outboundSchedule, returnSchedule),
    [b, route, outboundSchedule, returnSchedule],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className={`group relative bg-white rounded-3xl overflow-hidden flex flex-col cursor-pointer ${
        featured ? "ring-2 ring-accent" : ""
      }`}
      style={{ boxShadow: "var(--sh-2)" }}
      whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.14)" }}
      onClick={onOpenDetail}
    >
      {/* Hero photo */}
      <div className="relative h-52 overflow-hidden pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={b.photo}
          alt={b.name}
          loading="lazy"
          decoding="async"
          className="media-zoom absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        {/* Ferry + tour badge — the whole point of the product */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/95 text-fg text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md">
          <Ship className="w-3.5 h-3.5 text-accent-ink" aria-hidden="true" />
          <span>+</span>
          <Car className="w-3.5 h-3.5 text-accent-ink" aria-hidden="true" />
          <span className="ml-1">{t("bundle.badge")}</span>
        </div>
        {featured && (
          <div className="absolute top-4 right-4 bg-accent text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md">
            {t("bundle.featured")}
          </div>
        )}
        <div className="relative z-10 h-full flex flex-col justify-end p-6 text-white text-shadow-photo">
          <h3 className="text-[20px] font-bold mb-1 leading-tight">{b.name}</h3>
          <p className="text-white/80 text-[12px] leading-relaxed line-clamp-2">{b.tagline}</p>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Selected route preview */}
        <div className="mb-4 flex items-center gap-2 bg-surface-sunken rounded-xl p-3">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center shrink-0 ${theme.accent}`}>
            <Ship className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-fg truncate">
              {theme.shortFrom} <span className="text-muted">→</span> {route.to}
            </p>
            <p className="text-[11px] text-muted">
              {route.crossing} · {outboundSchedule} / {returnSchedule}
            </p>
          </div>
        </div>

        {/* Timeline preview */}
        <div className="mb-4 flex-1 bg-surface-sunken rounded-2xl p-3.5 space-y-0">
          {timeline.slice(0, 4).map((slot, i) => (
            <TimelineRow key={slot.label + i} slot={slot} last={i === 3 && timeline.length <= 4} />
          ))}
          {timeline.length > 4 && (
            <p className="text-[11px] text-accent-ink font-semibold pl-12">
              {t("bundle.moreTimeline").replace("{n}", String(timeline.length - 4))}
            </p>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between pt-4 border-t border-line-soft mt-auto">
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-[22px] font-bold text-fg">{priceDisplay(finalPrice, locale)}</p>
              <p className="text-[12px] text-muted line-through">{priceDisplay(b.separateSGD, locale)}</p>
            </div>
            <p className="text-[12px] font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
              <BadgePercent className="w-3.5 h-3.5" aria-hidden="true" />
              {t("bundle.saving").replace("{s}", `S$ ${saving}`)}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail();
            }}
            aria-label={`Configure ${b.name}`}
            className="flex items-center gap-2 bg-fg hover:bg-fg-hover text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-colors duration-200"
          >
            <Settings2 className="w-4 h-4" aria-hidden="true" />
            {t("bundle.configure")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── BundleModal ────────────────────────────────────────────────────────────────
function BundleModal({
  bundle: b,
  onAddToCart,
  onClose,
}: {
  bundle: Bundle;
  onAddToCart: (item: NewCartItem) => void;
  onClose: () => void;
}) {
  const { t, locale } = useLocale();
  const today = new Date().toISOString().split("T")[0];
  const [route, setRoute] = useState<FerryRoute>(() =>
    FERRY_ROUTES.find((r) => r.id === b.defaultRouteId) ?? FERRY_ROUTES[0],
  );
  const [form, setForm] = useState<BookingForm>({
    fullName: "",
    passportNumber: "",
    passportExpiry: "",
    nationality: "Singapore",
    travelDate: today,
    outboundSchedule: route.schedules[0],
    returnSchedule: route.schedules[Math.min(3, route.schedules.length - 1)],
  });
  const [touched, setTouched] = useState<Partial<Record<keyof BookingForm, boolean>>>({});
  const [added, setAdded] = useState(false);

  const finalPrice = b.basePriceSGD + route.returnPriceNum;
  const saving = b.separateSGD - finalPrice;
  const timeline = useMemo(
    () => buildBundleTimeline(b, route, form.outboundSchedule, form.returnSchedule),
    [b, route, form.outboundSchedule, form.returnSchedule],
  );

  const passportInvalid = validatePassport(form.passportExpiry, form.travelDate);
  const passportError = passportInvalid
    ? t("ferry.modal.passportInvalid").replace("{expiry}", passportInvalid.expiry).replace("{min}", passportInvalid.min)
    : null;
  const nameError = touched.fullName && !form.fullName.trim() ? t("ferry.modal.nameRequired") : null;
  const passportNumError = touched.passportNumber && !form.passportNumber.trim() ? t("ferry.modal.passportRequired") : null;
  const expiryError = touched.passportExpiry && !form.passportExpiry
    ? t("ferry.modal.expiryRequired")
    : passportError && touched.passportExpiry
      ? passportError
      : null;

  const isValid = form.fullName.trim() && form.passportNumber.trim() && form.passportExpiry && !passportError;
  const needsVoa = !VOA_FREE.has(form.nationality) && form.nationality !== "Indonesia";

  const handleAdd = () => {
    if (added || !isValid) return;
    setAdded(true);
    onAddToCart(cartItemFor(b, route, form, finalPrice, b.days > 1 ? "2D1N" : t("bundle.day1")));
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[92dvh] md:flex-row">
      {/* Left: photo + summary */}
      <div className="relative h-48 shrink-0 md:h-auto md:w-5/12 md:min-h-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={b.photo}
          alt={b.name}
          className="w-full h-full object-cover rounded-t-[28px] md:rounded-l-[28px] md:rounded-tr-none"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-t-[28px] md:rounded-l-[28px] md:rounded-tr-none" />
        <div className="absolute bottom-5 left-6 right-6 text-white">
          <span className="inline-flex bg-fg text-white text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2 items-center gap-1.5 w-fit">
            <Ship className="w-3 h-3" aria-hidden="true" /> + <Car className="w-3 h-3" aria-hidden="true" /> {t("bundle.badge")}
          </span>
          <h3 className="text-2xl font-bold">{b.name}</h3>
          <div className="flex items-center gap-4 mt-1.5 text-white/85 text-[12px]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {b.days > 1 ? "2D1N" : t("bundle.day1")}
            </span>
          </div>
        </div>
      </div>

      {/* Right: scrollable detail */}
      <div className="p-6 flex flex-1 min-h-0 min-w-0 flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide space-y-5">
          <p className="text-[13px] text-muted leading-relaxed">{b.tagline}</p>

          {/* Route selector */}
          <div>
            <label className="text-[12px] font-semibold text-fg mb-2 block">{t("bundle.routeLabel")}</label>
            <div className="grid grid-cols-2 gap-2">
              {FERRY_ROUTES.map((r) => {
                const active = r.id === route.id;
                const rt = ROUTE_THEMES[r.id];
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setRoute(r);
                      setForm((f) => ({
                        ...f,
                        outboundSchedule: r.schedules[0],
                        returnSchedule: r.schedules[Math.min(3, r.schedules.length - 1)],
                      }));
                    }}
                    className={`text-left px-3 py-2 rounded-xl text-[12px] border transition-all ${
                      active
                        ? "bg-surface-sunken border-accent text-fg"
                        : "bg-white border-line-soft text-muted hover:border-line"
                    }`}
                  >
                    <span className={`font-bold ${rt.accent}`}>{rt.shortFrom} → {r.to}</span>
                    <span className="block text-[10px] text-muted mt-0.5">{r.crossing} · S$ {r.returnPriceNum} return</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Travel date & schedules */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-semibold text-fg mb-1.5 block" htmlFor="bundle-date">
                {t("ferry.modal.date")}
              </label>
              <input
                id="bundle-date"
                type="date"
                min={today}
                value={form.travelDate}
                onChange={(e) => setForm((f) => ({ ...f, travelDate: e.target.value }))}
                className="w-full bg-surface-sunken rounded-xl px-4 py-2.5 text-[13px] text-fg border border-transparent focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-fg mb-1.5 block">{t("bundle.outbound")}</label>
              <div className="flex flex-wrap gap-1.5">
                {route.schedules.map((s) => (
                  <button
                    key={s}
                    onClick={() => setForm((f) => ({ ...f, outboundSchedule: s }))}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                      form.outboundSchedule === s
                        ? "bg-accent text-white border-accent"
                        : "bg-white text-fg border-line-soft hover:border-line"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Return schedule */}
          <div>
            <label className="text-[12px] font-semibold text-fg mb-2 block">{t("bundle.return")}</label>
            <div className="flex flex-wrap gap-1.5">
              {route.schedules.map((s) => (
                <button
                  key={s}
                  onClick={() => setForm((f) => ({ ...f, returnSchedule: s }))}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                    form.returnSchedule === s
                      ? "bg-accent text-white border-accent"
                      : "bg-white text-fg border-line-soft hover:border-line"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Passport details */}
          <div className="bg-surface-sunken rounded-2xl p-4 space-y-3">
            <p className="text-[12px] font-semibold text-fg flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5" aria-hidden="true" />
              {t("bundle.passengerTitle")}
            </p>
            <div>
              <input
                type="text"
                placeholder={t("ferry.modal.name")}
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                onBlur={() => setTouched((p) => ({ ...p, fullName: true }))}
                className={`w-full bg-white rounded-xl px-4 py-2.5 text-[13px] text-fg border focus:outline-none transition-colors ${
                  nameError ? "border-red-400" : "border-transparent focus:border-accent"
                }`}
              />
              {nameError && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{nameError}</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  placeholder={t("ferry.modal.passport")}
                  value={form.passportNumber}
                  onChange={(e) => setForm((f) => ({ ...f, passportNumber: e.target.value.toUpperCase() }))}
                  onBlur={() => setTouched((p) => ({ ...p, passportNumber: true }))}
                  className={`w-full bg-white rounded-xl px-4 py-2.5 text-[13px] text-fg border focus:outline-none font-mono tracking-wider transition-colors ${
                    passportNumError ? "border-red-400" : "border-transparent focus:border-accent"
                  }`}
                />
                {passportNumError && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{passportNumError}</p>}
              </div>
              <div>
                <input
                  type="date"
                  value={form.passportExpiry}
                  onChange={(e) => setForm((f) => ({ ...f, passportExpiry: e.target.value }))}
                  onBlur={() => setTouched((p) => ({ ...p, passportExpiry: true }))}
                  className={`w-full bg-white rounded-xl px-4 py-2.5 text-[13px] text-fg border focus:outline-none transition-colors ${
                    expiryError ? "border-red-400" : "border-transparent focus:border-accent"
                  }`}
                />
                {expiryError && <p className="text-[11px] text-red-500 mt-1 flex items-start gap-1"><AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />{expiryError}</p>}
                {form.passportExpiry && !expiryError && (
                  <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1"><Check className="w-3 h-3" /> {t("ferry.modal.verified")}</p>
                )}
              </div>
            </div>
            <select
              value={form.nationality}
              onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value }))}
              className="w-full bg-white rounded-xl px-4 py-2.5 text-[13px] text-fg border border-transparent focus:border-accent focus:outline-none"
            >
              {NATIONALITIES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            {needsVoa && (
              <p className="text-[11px] text-amber-700 bg-amber-500/10 rounded-lg px-3 py-2 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 mt-px shrink-0" aria-hidden="true" />
                {t("ferry.modal.voaNotice")}
              </p>
            )}
          </div>

          {/* Full timeline */}
          <div>
            <p className="text-[12px] font-semibold text-fg mb-3">{t("bundle.timeline")}</p>
            <div className="space-y-0">
              {timeline.map((slot, i) => (
                <TimelineRow key={slot.label + i} slot={slot} last={i === timeline.length - 1} />
              ))}
            </div>
          </div>

          {/* Includes / excludes */}
          <div>
            <p className="text-[12px] font-semibold text-fg mb-2">{t("bundle.included")}</p>
            <ul className="space-y-1.5">
              {b.includes.map((item) => (
                <li key={item} className="flex items-center gap-2 text-[12px] text-muted">
                  <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-fg mb-2">{t("bundle.excluded")}</p>
            <ul className="space-y-1.5">
              {b.excludes.map((item) => (
                <li key={item} className="flex items-center gap-2 text-[12px] text-muted">
                  <span className="w-3.5 h-3.5 shrink-0 text-center text-muted" aria-hidden="true">–</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Theme choice note */}
          <div className="bg-accent/10 text-[var(--accent-ink)] text-[12px] font-medium px-4 py-2.5 rounded-xl flex items-start gap-2">
            <Star className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            {t("bundle.themeNote")
              .replace("{n}", String(b.themeChoices))
              .replace("{themes}", "Alam · Oleh-oleh · Perawatan · Shopping")}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="flex items-center justify-between gap-4 pt-4 mt-4 border-t border-line-soft shrink-0">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-fg">{priceDisplay(finalPrice, locale)}</span>
              <span className="text-[12px] text-muted line-through">{priceDisplay(b.separateSGD, locale)}</span>
            </div>
            <p className="text-[12px] font-semibold text-emerald-700">
              {t("bundle.saving").replace("{s}", `S$ ${saving}`)}
            </p>
          </div>
          <button
            onClick={handleAdd}
            disabled={added || !isValid}
            className="flex items-center gap-2 text-white text-[14px] font-bold px-6 py-3 rounded-xl transition-colors duration-200 shadow-lg bg-accent hover:bg-accent-hover disabled:bg-emerald-600 disabled:opacity-60 shadow-accent/25"
          >
            {added ? <Check className="w-4 h-4" aria-hidden="true" /> : <ShoppingCart className="w-4 h-4" aria-hidden="true" />}
            {added ? t("journey.added") : t("journey.addCart")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── BundleSection ──────────────────────────────────────────────────────────────
export default function BundleSection({
  onAddToCart,
}: {
  onAddToCart: (item: NewCartItem) => void;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { t } = useLocale();
  const [modalBundle, setModalBundle] = useState<Bundle | null>(null);

  return (
    <section id="bundle" ref={sectionRef} className="py-16 sm:py-24 px-4 sm:px-6 bg-surface-sunken">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-accent-ink text-[12px] font-semibold tracking-widest uppercase">
            {t("bundle.label")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-fg mt-2 tracking-tight">
            {t("bundle.heading")}
          </h2>
          <p className="text-muted mt-4 text-[15px] max-w-lg mx-auto leading-relaxed">
            {t("bundle.sub")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {bundles.map((b, i) => (
            <BundleCard
              key={b.id}
              bundle={b}
              route={FERRY_ROUTES.find((r) => r.id === b.defaultRouteId) ?? FERRY_ROUTES[0]}
              outboundSchedule={FERRY_ROUTES.find((r) => r.id === b.defaultRouteId)?.schedules[0] ?? "08:00"}
              returnSchedule={FERRY_ROUTES.find((r) => r.id === b.defaultRouteId)?.schedules[3] ?? "17:00"}
              isInView={isInView}
              index={i}
              featured={i === 0}
              onOpenDetail={() => setModalBundle(b)}
            />
          ))}
        </div>

        {/* Min pax note — matches how operators actually price small groups */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center text-[12px] text-muted mt-8 max-w-md mx-auto"
        >
          {t("bundle.paxNote")}
        </motion.p>
      </div>

      <DetailModal open={!!modalBundle} onClose={() => setModalBundle(null)}>
        {modalBundle && (
          <BundleModal
            bundle={modalBundle}
            onAddToCart={onAddToCart}
            onClose={() => setModalBundle(null)}
          />
        )}
      </DetailModal>
    </section>
  );
}

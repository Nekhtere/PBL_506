"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Clock,
  ShoppingCart,
  Check,
  Ship,
  Car,
  Star,
  BadgePercent,
} from "lucide-react";
import DetailModal from "./DetailModal";
import { useLocale } from "@/lib/locale-context";
import { bundles, type Bundle } from "@/lib/bundles";

// ponytail: FX pegged at 11800 — swap for a live rate endpoint at launch.
const IDR_PER_SGD = 11800;

function priceDisplay(sgd: number, locale: string) {
  return locale === "id"
    ? `Rp ${Math.round(sgd * IDR_PER_SGD).toLocaleString("id-ID")}`
    : `S$ ${sgd}`;
}

function cartItemFor(b: Bundle, t: (k: string) => string) {
  return {
    name: b.name,
    price: `S$ ${b.priceSGD}`,
    subtitle: `${b.days > 1 ? "2D1N" : t("bundle.day1")} · ${t("bundle.ferryIncluded")}`,
    image: b.photo,
    items: b.includes,
    kind: "route" as const,
  };
}

// ── BundleCard ─────────────────────────────────────────────────────────────────
function BundleCard({
  bundle: b,
  isInView,
  index,
  featured,
  onAddToCart,
  onOpenDetail,
}: {
  bundle: Bundle;
  isInView: boolean;
  index: number;
  featured: boolean;
  onAddToCart: (item: ReturnType<typeof cartItemFor>) => void;
  onOpenDetail: () => void;
}) {
  const { t, locale } = useLocale();
  const [added, setAdded] = useState(false);
  const saving = b.separateSGD - b.priceSGD;

  const handleAdd = () => {
    if (added) return;
    setAdded(true);
    onAddToCart(cartItemFor(b, t));
    setTimeout(() => setAdded(false), 1400);
  };

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
        {/* Timeline preview */}
        <div className="mb-4 flex-1 bg-surface-sunken rounded-2xl p-3.5 space-y-2">
          {b.timeline.slice(0, 4).map((slot) => (
            <div key={slot.time} className="flex items-center gap-2.5 text-[12px]">
              <span className="w-6 text-center shrink-0" aria-hidden="true">{slot.emoji}</span>
              <span className="font-bold text-accent-ink shrink-0 w-[72px]">{slot.time}</span>
              <span className="text-fg truncate">{slot.label}</span>
            </div>
          ))}
          <p className="text-[11px] text-accent-ink font-semibold pl-9">
            {t("bundle.moreTimeline").replace("{n}", String(b.timeline.length - 4))}
          </p>
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between pt-4 border-t border-line-soft mt-auto">
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-[22px] font-bold text-fg">{priceDisplay(b.priceSGD, locale)}</p>
              <p className="text-[12px] text-muted line-through">{priceDisplay(b.separateSGD, locale)}</p>
            </div>
            <p className="text-[12px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
              <BadgePercent className="w-3.5 h-3.5" aria-hidden="true" />
              {t("bundle.saving").replace("{s}", `S$ ${saving}`)}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAdd();
            }}
            disabled={added}
            aria-label={`Add ${b.name} to cart`}
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

// ── BundleModal ────────────────────────────────────────────────────────────────
function BundleModal({
  bundle: b,
  onAddToCart,
  onClose,
}: {
  bundle: Bundle;
  onAddToCart: (item: ReturnType<typeof cartItemFor>) => void;
  onClose: () => void;
}) {
  const { t, locale } = useLocale();
  const [added, setAdded] = useState(false);
  const saving = b.separateSGD - b.priceSGD;

  const handleAdd = () => {
    if (added) return;
    setAdded(true);
    onAddToCart(cartItemFor(b, t));
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

          {/* Full timeline */}
          <div>
            <p className="text-[12px] font-semibold text-fg mb-3">{t("bundle.timeline")}</p>
            <div className="space-y-0">
              {b.timeline.map((slot, i) => (
                <div key={slot.time} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-base shadow-sm shrink-0 border border-line-soft">
                      {slot.emoji}
                    </div>
                    {i < b.timeline.length - 1 && <div className="w-px flex-1 bg-line-soft my-1" />}
                  </div>
                  <div className={`min-w-0 ${i === b.timeline.length - 1 ? "" : "pb-3.5"}`}>
                    <p className="text-[13px] font-semibold text-fg leading-snug">
                      <span className="text-accent-ink font-bold mr-1.5">{slot.time}</span>
                      {slot.label}
                    </p>
                    {slot.note && <p className="text-[11px] text-muted mt-0.5">{slot.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Includes / excludes */}
          <div>
            <p className="text-[12px] font-semibold text-fg mb-2">{t("bundle.included")}</p>
            <ul className="space-y-1.5">
              {b.includes.map((item) => (
                <li key={item} className="flex items-center gap-2 text-[12px] text-muted">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
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
              <span className="text-2xl font-bold text-fg">{priceDisplay(b.priceSGD, locale)}</span>
              <span className="text-[12px] text-muted line-through">{priceDisplay(b.separateSGD, locale)}</span>
            </div>
            <p className="text-[12px] font-semibold text-emerald-600">
              {t("bundle.saving").replace("{s}", `S$ ${saving}`)}
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

// ── BundleSection ──────────────────────────────────────────────────────────────
export default function BundleSection({
  onAddToCart,
}: {
  onAddToCart: (item: ReturnType<typeof cartItemFor>) => void;
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
              isInView={isInView}
              index={i}
              featured={i === 0}
              onAddToCart={onAddToCart}
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

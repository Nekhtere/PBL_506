"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Search,
  Navigation,
  X,
  Star,
  MapPin,
  Clock,
  Ticket,
  ArrowDown,
  Car,
  TreePalm,
} from "lucide-react";
import DetailModal from "./DetailModal";
import {
  destinations,
  haversineKm,
  type Destination,
  type Zone,
} from "@/lib/destinations";
import { useLocale } from "@/lib/locale-context";

// Leaflet reads window/document at import time, so it must never run on the server.
const NearbyMap = dynamic(() => import("./NearbyMap"), { ssr: false });

type Coords = { lat: number; lng: number };

// Category chips: display is translated, but the filter always matches the
// English category value stored on the data — a translated query would find
// nothing in ID mode.
const CHIPS: { emoji: string; term: Destination["category"] | "All"; key: string }[] = [
  { emoji: "✨", term: "All",      key: "nearby.chip.all" },
  { emoji: "🌿", term: "Nature",   key: "nearby.chip.nature" },
  { emoji: "🛕", term: "Culture",  key: "nearby.chip.culture" },
  { emoji: "👨‍👩‍👧", term: "Family",  key: "nearby.chip.family" },
  { emoji: "🛍️", term: "Shopping", key: "nearby.chip.shopping" },
  { emoji: "🎁", term: "Souvenir", key: "nearby.chip.souvenir" },
  { emoji: "💆", term: "Wellness", key: "nearby.chip.wellness" },
];

// Zone badge — the same A→B distance logic the tour pricing uses, surfaced
// as information so the Journey prices further down don't come as a surprise.
function zoneBadge(zone: Zone, t: (k: string) => string) {
  const meta: Record<Zone, { key: string; cls: string }> = {
    center: { key: "nearby.zone.center", cls: "bg-emerald-600/10 text-emerald-700" },
    mid:    { key: "nearby.zone.mid",    cls: "bg-amber-500/10 text-amber-700" },
    far:    { key: "nearby.zone.far",    cls: "bg-orange-600/10 text-orange-700" },
  };
  const { key, cls } = meta[zone];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      <Car className="w-2.5 h-2.5" aria-hidden="true" />
      {t(key)}
    </span>
  );
}

// ── DestinationCard ────────────────────────────────────────────────────────────
function DestinationCard({
  destination: d,
  km,
  index,
  isInView,
  onSelect,
}: {
  destination: Destination;
  km?: number;
  index: number;
  isInView: boolean;
  onSelect: (d: Destination) => void;
}) {
  const { t } = useLocale();
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: Math.min(index, 8) * 0.06 }}
      onClick={() => onSelect(d)}
      className="group text-left bg-surface border border-line rounded-3xl overflow-hidden shadow-[var(--sh-1)] hover:shadow-[var(--sh-2)] hover:-translate-y-1 transition-all duration-200 flex flex-col"
    >
      <div className="relative h-40 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={d.photo}
          alt={d.name}
          loading="lazy"
          decoding="async"
          className="media-zoom absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <span className="bg-black/45 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
            {t(`nearby.cat.${d.category.toLowerCase()}`)}
          </span>
          {km != null && (
            <span className="bg-black/45 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
              {km.toFixed(1)} km
            </span>
          )}
        </div>
      </div>
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <p className="text-[14px] font-bold text-fg leading-snug">{d.name}</p>
        <p className="text-[11px] text-muted flex items-center gap-1">
          <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
          {d.area}
        </p>
        <p className="text-[12px] text-muted leading-relaxed line-clamp-2">{d.desc}</p>
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 text-[12px]">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
            <span className="font-semibold text-fg">{d.rating}</span>
            <span className="text-muted">({d.reviews.toLocaleString("en-US")})</span>
          </span>
          {zoneBadge(d.zone, t)}
        </div>
      </div>
    </motion.button>
  );
}

// ── DestinationDetail (modal body) ────────────────────────────────────────────
function DestinationDetail({ destination: d }: { destination: Destination }) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col">
      {/* Header image */}
      <div className="relative h-44 sm:h-56 shrink-0">
        <div className="absolute inset-0 animate-pulse bg-line" aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={d.photo}
          alt={d.name}
          className="relative w-full h-full object-cover rounded-none sm:rounded-t-[28px]"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-none sm:rounded-t-[28px]" />
        <div className="absolute bottom-4 left-6 right-6 text-white text-shadow-photo">
          <span className="inline-block bg-black/45 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2">
            {t(`nearby.cat.${d.category.toLowerCase()}`)}
          </span>
          <h3 className="text-2xl font-bold">{d.name}</h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-white/85 text-[12px]">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              {d.rating} ({d.reviews.toLocaleString("en-US")} {t("nearby.reviews")})
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> {d.area}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" /> {d.hours}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-6 flex flex-col">
        <p className="text-[13px] text-muted leading-relaxed mb-4">{d.desc}</p>

        {/* Quick facts */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-surface-sunken rounded-2xl p-3">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
              {t("nearby.entryFee")}
            </p>
            <p className="text-[13px] font-bold text-fg flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-accent-ink" aria-hidden="true" />
              {d.entryFee}
            </p>
          </div>
          <div className="bg-surface-sunken rounded-2xl p-3">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
              {t("nearby.travelZone")}
            </p>
            <p className="text-[13px] font-bold text-fg">{zoneBadge(d.zone, t)}</p>
          </div>
        </div>

        {/* Facilities */}
        <div className="mb-4">
          <p className="text-[12px] font-semibold text-fg mb-2">{t("nearby.facilities")}</p>
          <div className="flex flex-wrap gap-2">
            {d.facilities.map((f) => (
              <span
                key={f}
                className="bg-surface-sunken text-fg text-[11px] font-medium px-3 py-1.5 rounded-full"
              >
                ✦ {f}
              </span>
            ))}
          </div>
        </div>

        {/* Free-info honesty note — this section sells nothing. The CTA sends
            the visitor down the funnel to the tours that visit this place. */}
        <div className="bg-accent/10 text-[var(--accent-ink)] text-[12px] font-medium px-4 py-2.5 rounded-xl mb-4 flex items-start gap-2">
          <TreePalm className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          {t("nearby.freeInfo")}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-2 pt-4 border-t border-line-soft">
          <p className="text-[12px] text-muted">{t("nearby.ctaHint")}</p>
          <Link
            href="/#journey"
            className="flex items-center justify-center gap-2 bg-fg hover:bg-fg-hover text-white text-[13px] font-bold px-5 py-3 rounded-xl transition-colors duration-200"
          >
            <ArrowDown className="w-4 h-4" aria-hidden="true" />
            {t("nearby.ctaJourney")}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── NearMeSection ──────────────────────────────────────────────────────────────
export default function NearMeSection({
  query,
  onQueryChange,
}: {
  // Controlled by the parent so the hero's search box can drive this section.
  query: string;
  onQueryChange: (query: string) => void;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { t } = useLocale();
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [user, setUser] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);
  const [selected, setSelected] = useState<Destination | null>(null);
  const [chip, setChip] = useState<(typeof CHIPS)[number]["term"]>("All");

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      destinations
        .filter((d) => chip === "All" || d.category === chip)
        .filter(
          (d) =>
            !q ||
            [d.name, d.category, d.area, d.desc].some((f) =>
              f.toLowerCase().includes(q),
            ),
        ),
    [chip, q],
  );

  // Nearest first — but only once the user has actually asked for it.
  const withKm = useCallback(
    (list: Destination[]) =>
      user
        ? list
            .map((d) => ({ d, km: haversineKm(user, d) as number | undefined }))
            .sort((a, b) => a.km! - b.km!)
        : list.map((d) => ({ d, km: undefined as number | undefined })),
    [user],
  );

  const near = useMemo(() => withKm(filtered), [withKm, filtered]);

  // The map shows everything matching the search, unfiltered by the chip —
  // it answers "what is around me", not "what is in this grid".
  const mapPoints = useMemo(
    () =>
      withKm(
        destinations.filter(
          (d) =>
            !q ||
            [d.name, d.category, d.area, d.desc].some((f) =>
              f.toLowerCase().includes(q),
            ),
        ),
      ).map(({ d, km }) => ({
        id: d.id,
        name: d.name,
        category: d.category,
        lat: d.lat,
        lng: d.lng,
        label: `${d.category} · ${d.area}`,
        photo: d.photo,
        km,
      })),
    [withKm, q],
  );

  // The permission prompt happens here and nowhere else. On page load it would
  // be unexplained, and most browsers now auto-suppress a prompt with no user
  // gesture.
  const locate = () => {
    if (!navigator.geolocation) {
      setGeoMsg(t("nearby.geoUnsupported"));
      return;
    }
    setLocating(true);
    setGeoMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUser({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setGeoMsg(
          err.code === err.PERMISSION_DENIED
            ? t("nearby.geoDenied")
            : t("nearby.geoError"),
        );
      },
      // City-scale accuracy is plenty for ranking destinations by distance.
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };

  return (
    <section id="near-me" ref={sectionRef} className="py-16 sm:py-24 px-4 sm:px-6 bg-[var(--bg)]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-accent-ink text-[12px] font-semibold tracking-widest uppercase"
          >
            {t("nearby.label")}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-fg mt-2 tracking-tight"
          >
            {t("nearby.heading")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted mt-3 text-[15px] max-w-md leading-relaxed"
          >
            {t("nearby.sub")}
          </motion.p>
        </div>

        {/* Search + Near Me */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="mb-6"
        >
          <div className="card-soft rounded-2xl p-1.5 flex items-center gap-1.5 sm:gap-2 max-w-2xl">
            <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4">
              <Search className="w-4 h-4 text-fg/50 shrink-0" strokeWidth={2} aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder={t("nearby.searchPlaceholder")}
                className="flex-1 min-w-0 bg-transparent text-[13px] sm:text-[14px] text-fg placeholder:text-fg/45 py-2.5"
                aria-label="Search destinations in Batam"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => onQueryChange("")}
                  aria-label="Clear search"
                  className="shrink-0 w-5 h-5 rounded-full bg-fg/10 flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-fg/70" aria-hidden="true" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={locate}
              disabled={locating}
              aria-busy={locating}
              /* min-h-11 keeps the target at 44px on phones. */
              className="flex min-h-11 items-center gap-1.5 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-[12px] sm:text-[13px] font-semibold px-3 sm:px-4 py-2.5 rounded-xl transition-colors duration-200 shrink-0"
            >
              <Navigation className={`w-3.5 h-3.5 ${locating ? "animate-spin" : ""}`} aria-hidden="true" />
              {locating ? t("nearby.locating") : t("nearby.nearme")}
            </button>
          </div>

          {/* Category chips */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {CHIPS.map((c) => (
              <button
                key={c.term}
                type="button"
                aria-pressed={chip === c.term}
                onClick={() => setChip(c.term)}
                className={`text-[12px] px-2.5 py-1 rounded-full border transition-colors duration-150 ${
                  chip === c.term
                    ? "bg-fg text-white border-fg"
                    : "text-muted hover:text-fg bg-surface-sunken hover:bg-line border-line-soft"
                }`}
              >
                {c.emoji} {t(c.key)}
              </button>
            ))}
          </div>

          {geoMsg && (
            <div
              className="flex items-center gap-3 text-[12px] text-[var(--danger)] bg-danger/10 px-3 py-2 rounded-xl mt-3"
              role="alert"
            >
              <span className="flex-1">{geoMsg}</span>
              <button
                type="button"
                onClick={locate}
                className="shrink-0 font-semibold underline underline-offset-2"
              >
                {t("nearby.tryAgain")}
              </button>
            </div>
          )}
        </motion.div>

        {/* Map — renders only once a location is shared */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <div className="isolate h-64 sm:h-80 rounded-3xl overflow-hidden border border-line shadow-[var(--sh-2)]">
              <NearbyMap
                points={mapPoints}
                user={user}
                onSelect={(id) =>
                  setSelected(destinations.find((d) => d.id === id) ?? null)
                }
              />
            </div>
          </motion.div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {near.map(({ d, km }, i) => (
            <DestinationCard
              key={d.id}
              destination={d}
              km={km}
              index={i}
              isInView={isInView}
              onSelect={setSelected}
            />
          ))}
        </div>
        {near.length === 0 && (
          <p className="text-[13px] text-muted py-12 w-full text-center">
            {t("nearby.noMatch").replace("{q}", query)}{" "}
            <button
              onClick={() => {
                onQueryChange("");
                setChip("All");
              }}
              className="text-accent-ink font-medium hover:underline"
            >
              {t("nearby.tryAnother")}
            </button>
          </p>
        )}

        {/* Announces the result count when it changes. */}
        <p aria-live="polite" className="sr-only">
          {t("nearby.found").replace("{n}", String(near.length))}
        </p>
      </div>

      {/* Detail Modal — information only, no purchase CTA in this section. */}
      <DetailModal open={!!selected} onClose={() => setSelected(null)}>
        {selected && <DestinationDetail destination={selected} />}
      </DetailModal>
    </section>
  );
}

"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Search,
  Navigation,
  Star,
  MapPin,
  Clock,
  Ticket,
  ArrowDown,
  Car,
  TreePalm,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import DetailModal from "./DetailModal";
import RouteLoader from "./RouteLoader";
import {
  destinations,
  haversineKm,
  type Destination,
  type Zone,
} from "@/lib/destinations";
import { useLocale } from "@/lib/locale-context";
import { useRotator } from "@/lib/use-rotator";

// Leaflet reads window/document at import time, so it must never run on the server.
// The crossing loader fills the gap while the JS chunk downloads — the map tiles
// are the slowest thing on the page, so a bare box here reads as broken.
const NearbyMap = dynamic(() => import("./NearbyMap"), {
  ssr: false,
  loading: () => <RouteLoader compact />,
});

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

// ── DestinationCard (exported for reuse by DestinationsPage) ───────────────────
export function DestinationCard({
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
function DestinationDetail({
  destination: d,
  onClose,
}: {
  destination: Destination;
  onClose: () => void;
}) {
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
            onClick={onClose}
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
}: {
  // Controlled by the parent so the hero's search box can detect the current value.
  // Navigation to /destinations is now handled by Link navigation from chips/button.
  query: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { t } = useLocale();
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [user, setUser] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);
  const [selected, setSelected] = useState<Destination | null>(null);
  const [localChip, setLocalChip] = useState<Destination["category"] | "All">("All");
  const rowRef = useRef<HTMLDivElement>(null);

  // Active category filter: when the map is visible we filter locally so the
  // user can narrow nearby places without leaving the home page.
  const activeCategory = user ? localChip : "All";

  // Featured spotlights: top-rated destinations. When the map is active they
  // follow the local category filter so the strip feels connected to the map.
  const featured = useMemo(
    () =>
      [...destinations]
        .filter((d) => activeCategory === "All" || d.category === activeCategory)
        .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
        .slice(0, 5),
    [activeCategory],
  );

  // Nearest first — used by the map, which still follows "Near Me".
  const withKm = useCallback(
    (list: Destination[]) =>
      user
        ? list
            .map((d) => ({ d, km: haversineKm(user, d) as number | undefined }))
            .sort((a, b) => a.km! - b.km!)
        : list.map((d) => ({ d, km: undefined as number | undefined })),
    [user],
  );

  const near = useMemo(() => withKm(destinations), [withKm]);
  const filteredNear = useMemo(
    () => (activeCategory === "All" ? near : near.filter(({ d }) => d.category === activeCategory)),
    [near, activeCategory],
  );
  const mapPoints = useMemo(
    () =>
      filteredNear.map(({ d, km }) => ({
        id: d.id,
        name: d.name,
        category: d.category,
        lat: d.lat,
        lng: d.lng,
        label: `${d.category} · ${d.area}`,
        photo: d.photo,
        km,
      })),
    [filteredNear],
  );

  // WCAG 2.2.2 for the spotlight rotator: pauses on hover/focus (hold) and via
  // the explicit button, and never runs at all for reduced-motion users.
  const rotator = useRotator(featured.length, 5000);
  const spotlight = featured[rotator.index] ?? null;
  const onHold = (v: boolean) => rotator.setPaused(v);

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

        {/* Quick access: search and category chips now navigate to the dedicated
            /destinations page — keeps the homepage short (no 12-card scroll) while
            giving the catalogue its own URL for deep linking. */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 flex-col sm:flex-row">
            <Link
              href="/destinations"
              className="flex-1 card-soft rounded-2xl p-2 sm:p-3 flex items-center gap-2 text-fg hover:text-fg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <Search className="w-4 h-4 text-fg/50 shrink-0" strokeWidth={2} aria-hidden="true" />
              <span className="text-[13px] sm:text-[14px] text-fg/60 truncate">
                {t("nearby.searchPlaceholder")}
              </span>
            </Link>
            <button
              type="button"
              onClick={locate}
              disabled={locating}
              aria-busy={locating}
              className="flex min-h-11 items-center gap-1.5 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-[12px] sm:text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-colors duration-200 shrink-0"
            >
              <Navigation className={`w-3.5 h-3.5 ${locating ? "animate-spin" : ""}`} aria-hidden="true" />
              {locating ? t("nearby.locating") : t("nearby.nearme")}
            </button>
          </div>

          {/* Category chips: when the map is active they filter locally;
              otherwise they deep-link to the dedicated catalog page. */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {CHIPS.map((c) => {
              const active = user
                ? localChip === c.term
                : query === c.term || (c.term === "All" && !query);
              const chipClass = `text-[12px] px-2.5 py-1 rounded-full border transition-colors ${
                active
                  ? "bg-fg text-white border-fg"
                  : "text-muted hover:text-fg bg-surface-sunken hover:bg-line border-line-soft"
              }`;
              if (user) {
                return (
                  <button
                    key={c.term}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setLocalChip(c.term as Destination["category"] | "All")}
                    className={chipClass}
                  >
                    {c.emoji} {t(c.key)}
                  </button>
                );
              }
              const href =
                c.term === "All"
                  ? "/destinations"
                  : `/destinations?category=${encodeURIComponent(c.term)}`;
              return (
                <Link
                  key={c.term}
                  href={href}
                  aria-pressed={active}
                  className={chipClass}
                >
                  {c.emoji} {t(c.key)}
                </Link>
              );
            })}
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

        {/* Spotlight strip — the compact featured row. Auto-rotates the hero
            card; pauses on hover/focus, via the button, and for reduced motion.
            The rest of the strip is a horizontal snap carousel. No full grid
            below: the "All" button links out to /destinations. */}
        <div
          onMouseEnter={() => onHold(true)}
          onMouseLeave={() => onHold(false)}
          onFocus={() => onHold(true)}
          onBlur={() => onHold(false)}
          className="mb-8"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-5">
              {/* Hero spotlight card — spans 2 cols on desktop, full width on
                  mobile, and crossfades between the top-rated places. */}
              <div className="md:col-span-1 lg:col-span-2 relative rounded-3xl overflow-hidden border border-line shadow-[var(--sh-2)] min-h-[260px] sm:min-h-[300px]">
                <AnimatePresence initial={false} mode="popLayout">
                  {spotlight && (
                    <motion.div
                      key={spotlight.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: rotator.reduced ? 0 : 0.6 }}
                      className="absolute inset-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={spotlight.photo}
                        alt={spotlight.name}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <span className="inline-block bg-black/45 backdrop-blur-sm text-[10px] font-semibold px-2.5 py-1 rounded-full mb-2">
                          {t(`nearby.cat.${spotlight.category.toLowerCase()}`)}
                        </span>
                        <p className="text-lg font-bold text-shadow-photo">{spotlight.name}</p>
                        <p className="text-[12px] text-white/85 text-shadow-photo flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                          {spotlight.rating} · {spotlight.area}
                        </p>
                        <button
                          type="button"
                          onClick={() => setSelected(spotlight)}
                          className="mt-2 text-[12px] font-semibold underline underline-offset-2"
                        >
                          {t("nearby.viewDetails")}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Rotator controls: pause/play plus dots. The dots jump to a
                    slide and pause on focus via the container's onFocus. */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-10">
                  <button
                    type="button"
                    onClick={() => rotator.setPaused(!rotator.paused)}
                    aria-pressed={rotator.paused}
                    aria-label={rotator.paused ? t("nearby.spotlight.play") : t("nearby.spotlight.pause")}
                    className="glass-dark rounded-full w-8 h-8 flex items-center justify-center text-white/85 hover:text-white transition-colors focus-on-dark"
                  >
                    {rotator.paused ? (
                      <Play className="w-3.5 h-3.5" aria-hidden="true" />
                    ) : (
                      <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                  </button>
                  {featured.map((d, i) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => rotator.setIndex(i)}
                      aria-label={t("nearby.spotlight.goTo").replace("{name}", d.name)}
                      aria-current={rotator.index === i}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        rotator.index === i ? "bg-white" : "bg-white/45 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Swipeable row of the other four featured places. */}
              <div className="md:col-span-1 lg:col-span-3 relative">
                <div
                  ref={rowRef}
                  className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1 h-full items-stretch"
                  role="region"
                  aria-label={t("nearby.spotlight.region")}
                >
                  {featured
                    .filter((d) => d.id !== spotlight?.id)
                    .map((d) => (
                      <motion.button
                        key={d.id}
                        type="button"
                        initial={{ opacity: 0, y: 24 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5 }}
                        onClick={() => setSelected(d)}
                        className="group text-left shrink-0 snap-start w-[240px] sm:w-[260px] bg-surface border border-line rounded-3xl overflow-hidden shadow-[var(--sh-1)] hover:shadow-[var(--sh-2)] hover:-translate-y-1 transition-all duration-200 flex flex-col"
                      >
                        <div className="relative h-28 overflow-hidden">
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
                          <span className="absolute bottom-2 left-2 bg-black/45 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            {t(`nearby.cat.${d.category.toLowerCase()}`)}
                          </span>
                        </div>
                        <div className="p-3.5 flex flex-col gap-1 flex-1">
                          <p className="text-[14px] font-bold text-fg leading-snug">{d.name}</p>
                          <p className="text-[11px] text-muted flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                            {d.area}
                          </p>
                          <div className="mt-auto pt-1.5 flex items-center gap-1 text-[12px]">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                            <span className="font-semibold text-fg">{d.rating}</span>
                            <span className="text-muted">({d.reviews.toLocaleString("en-US")})</span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                </div>
                {/* Scroll buttons — the row is keyboard-reachable via its own
                    tab stops, but pointer users get an explicit scroll too. */}
                <div className="absolute -top-10 sm:-top-12 right-0 flex gap-2">
                  <button
                    type="button"
                    onClick={() => rowRef.current?.scrollBy({ left: -260, behavior: rotator.reduced ? "auto" : "smooth" })}
                    aria-label={t("nearby.spotlight.prev")}
                    className="glass rounded-full w-9 h-9 flex items-center justify-center text-fg hover:bg-surface-sunken transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => rowRef.current?.scrollBy({ left: 260, behavior: rotator.reduced ? "auto" : "smooth" })}
                    aria-label={t("nearby.spotlight.next")}
                    className="glass rounded-full w-9 h-9 flex items-center justify-center text-fg hover:bg-surface-sunken transition-colors focus-on-dark"
                  >
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* All button — navigates to /destinations for full catalog */}
            <div className="mt-6 flex justify-center">
              <Link
                href="/destinations"
                className="inline-flex items-center gap-2 bg-fg hover:bg-fg-hover text-white text-[13px] font-bold px-6 py-3 rounded-xl transition-colors duration-200"
              >
                <ArrowDown className="w-4 h-4" aria-hidden="true" />
                {t("nearby.showAll").replace("{n}", String(destinations.length))}
              </Link>
            </div>
          </div>
      </div>

      {/* Detail Modal — information only, no purchase CTA in this section. */}
      <DetailModal open={!!selected} onClose={() => setSelected(null)}>
        {selected && <DestinationDetail destination={selected} onClose={() => setSelected(null)} />}
      </DetailModal>
    </section>
  );
}

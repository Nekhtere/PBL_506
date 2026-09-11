"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, Navigation, X, LayoutGrid } from "lucide-react";
import DetailModal from "./DetailModal";
import MerchantCard from "./MerchantCard";
import MerchantDetail from "./MerchantDetail";
import { merchants, type Merchant } from "@/lib/merchants";
import type { CartItem } from "./Navbar";

// Leaflet reads window/document at import time, so it must never run on the server.
// ponytail: ssr:false keeps this a client-only island; move to static tiles if pin SEO ever matters.
const NearbyMap = dynamic(() => import("./NearbyMap"), { ssr: false });

// "Café" was dropped: no merchant carries it, so the chip always emptied the row.
const popularTags = ["🦐 Seafood", "💆 Spa", "🛍️ Shopping", "🌃 Night Market", "🏨 Hotel", "🗺️ Attraction"];

type Coords = { lat: number; lng: number };

// Great-circle distance, km. Batam-scale, so a sphere is accurate enough.
function haversineKm(a: Coords, b: Coords) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export default function DealsSection({ onAddToCart, query, onQueryChange }: {
  onAddToCart: (item: Omit<CartItem, "id">) => void;
  // Controlled by the parent so the hero's search box can drive this row.
  // The owner has to sit above both — they are siblings.
  query: string;
  onQueryChange: (query: string) => void;
}) {
  const sectionRef    = useRef<HTMLDivElement>(null);
  const scrollRef     = useRef<HTMLDivElement>(null);
  const isInView      = useInView(sectionRef, { once: true, margin: "-100px" });
  const [canScrollLeft, setCanScrollLeft]   = useState(false);
  // Starts false, not true: the arrows must not claim there is more to the right
  // before we have measured the track. The effect below sets the real value.
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [user, setUser]                     = useState<Coords | null>(null);
  const [locating, setLocating]             = useState(false);
  const [geoMsg, setGeoMsg]                 = useState<string | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const isDragging    = useRef(false);
  // Distinguishes a click from a drag. A plain mousedown sets isDragging, so
  // without this the click that ends a drag would still open a merchant.
  const dragMoved     = useRef(false);
  const dragStartX    = useRef(0);
  const dragScrollLeft = useRef(0);

  const q = query.trim().toLowerCase();
  // Idle, this row is a shop window: vouchers only, highest-rated first, capped. Attraction
  // is excluded because it's a place, not a voucher, and /merchants lists it.
  // A search drops both rules — the cap so a query reaches every partner, the exclusion so
  // "Barelang" is findable without waiting for a map pin.
  const FEATURED = 6;
  const filtered = useMemo(
    () =>
      merchants
        .filter((m) => q || m.category !== "Attraction")
        .filter((m) => !q || [m.name, m.category, m.location, m.desc].some((f) => f.toLowerCase().includes(q)))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, q ? undefined : FEATURED),
    [q],
  );

  // Nearest first — but only once the user has actually asked for it.
  const withKm = useCallback(
    (list: Merchant[]) =>
      user
        ? list.map((m) => ({ m, km: haversineKm(user, m) as number | undefined })).sort((a, b) => a.km! - b.km!)
        : list.map((m) => ({ m, km: undefined as number | undefined })),
    [user],
  );

  const near = useMemo(() => withKm(filtered), [withKm, filtered]);

  // The map shows everything, unfiltered by the carousel — it answers "what is around
  // me", not "what is in this row". Search still narrows it.
  const mapNear = useMemo(
    () =>
      withKm(
        merchants.filter(
          (m) => !q || [m.name, m.category, m.location, m.desc].some((f) => f.toLowerCase().includes(q)),
        ),
      ),
    [withKm, q],
  );

  // NearbyMap rebuilds every Leaflet marker whenever its `points` prop changes identity,
  // so it must not be a fresh array on each render — otherwise a single keystroke in the
  // search box tears down and re-fits the whole map.
  const mapPoints = useMemo(
    () =>
      mapNear.map(({ m, km }) => ({
        id: m.id,
        name: m.name,
        category: m.category,
        lat: m.lat,
        lng: m.lng,
        label: `${m.category} · ${m.location}`,
        photo: m.photo,
        km,
      })),
    [mapNear],
  );

  // The permission prompt happens here and nowhere else. On page load it would be
  // unexplained, and most browsers now auto-suppress a prompt with no user gesture.
  const locate = () => {
    if (!navigator.geolocation) {
      setGeoMsg("This browser can't share your location.");
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
            ? "Location blocked. Allow it in your browser settings to see deals near you."
            : "Couldn't get your location just now. Try again.",
        );
      },
      // City-scale accuracy is plenty for ranking merchants by distance.
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -308 : 308, behavior: "smooth" });
  };

  // Shared by the scroll handler and the mount/resize measurement below, so the
  // arrows are correct on first paint instead of only after the user scrolls.
  const measureScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  const handleScroll = useCallback(() => {
    requestAnimationFrame(measureScroll);
  }, [measureScroll]);

  // Measure after mount and whenever the track resizes or the card set changes
  // (search/filter). Without this the arrows stay in their initial state until
  // the first scroll event, and never recover from a viewport resize.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    measureScroll();
    const observer = new ResizeObserver(measureScroll);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measureScroll, near.length]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current     = true;
    dragMoved.current      = false;
    dragStartX.current     = e.pageX - el.offsetLeft;
    dragScrollLeft.current = el.scrollLeft;
    el.style.cursor        = "grabbing";
    el.style.userSelect    = "none";
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    const el   = scrollRef.current;
    const x    = e.pageX - el.offsetLeft;
    const walk = (x - dragStartX.current) * 1.2;
    // Only treat it as a drag past a small threshold, so a click with a
    // pixel of hand-shake still opens the card.
    if (Math.abs(walk) > 4) dragMoved.current = true;
    if (!dragMoved.current) return;
    e.preventDefault();
    el.scrollLeft = dragScrollLeft.current - walk;
  }, []);

  const onMouseUp = useCallback(() => {
    if (!scrollRef.current) return;
    isDragging.current              = false;
    scrollRef.current.style.cursor     = "grab";
    scrollRef.current.style.userSelect = "";
  }, []);

  // A click that followed a drag must not open the merchant. The flag is read
  // here (capture) and cleared on the next tick so the card's own click handler,
  // which fires after this one, can check it.
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (dragMoved.current) {
      e.preventDefault();
      e.stopPropagation();
      dragMoved.current = false;
    }
  }, []);

  return (
    <section id="deals" ref={sectionRef} className="py-16 sm:py-24 px-4 sm:px-6 bg-[#FBFBFD]">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#0071E3] text-[12px] font-semibold tracking-widest uppercase"
          >
            Top Picks in Batam
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
            The best-rated seafood, spa and shopping in Batam. Prices locked in SGD,
            vouchers redeemed by QR — valid 30 days.
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
              <Search className="w-4 h-4 text-[#1D1D1F]/50 shrink-0" strokeWidth={2} aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search Batam — seafood, spa, shopping…"
                className="flex-1 min-w-0 bg-transparent text-[13px] sm:text-[14px] text-[#1D1D1F] placeholder:text-[#1D1D1F]/45 py-2.5"
                aria-label="Search destinations in Batam"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => onQueryChange("")}
                  aria-label="Clear search"
                  className="shrink-0 w-5 h-5 rounded-full bg-[#1D1D1F]/10 flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-[#1D1D1F]/70" aria-hidden="true" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={locate}
              disabled={locating}
              aria-busy={locating}
              className="flex items-center gap-1.5 bg-[#0071E3] hover:bg-[#005BBB] disabled:opacity-60 text-white text-[12px] sm:text-[13px] font-semibold px-3 sm:px-4 py-2.5 rounded-xl transition-colors duration-200 shrink-0"
            >
              <Navigation className={`w-3.5 h-3.5 ${locating ? "animate-spin" : ""}`} aria-hidden="true" />
              {locating ? "Locating…" : "Near Me"}
            </button>
          </div>

          {/* Popular tags */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-[#515154] text-[11px] font-medium">Popular:</span>
            {popularTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onQueryChange(tag.replace(/^\S+\s/, ""))}
                className="text-[12px] text-[#515154] hover:text-[#1D1D1F] px-2.5 py-1 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] border border-[#E5E5EA] transition-colors duration-150"
              >
                {tag}
              </button>
            ))}
          </div>

          {geoMsg && (
            <p className="text-[12px] text-[#B3261E] bg-[#B3261E]/10 px-3 py-2 rounded-xl mt-3" role="status">
              {geoMsg}
            </p>
          )}
        </motion.div>

        {/* Nearest-deals map — renders only once a location is shared */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <div className="isolate h-64 sm:h-80 rounded-3xl overflow-hidden border border-[#E8E8ED] shadow-[var(--sh-2)]">
              <NearbyMap
                points={mapPoints}
                user={user}
                onSelect={(id) => setSelectedMerchant(merchants.find((m) => m.id === id) ?? null)}
              />
            </div>
          </motion.div>
        )}

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
            onClickCapture={onClickCapture}
            className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 cursor-grab active:cursor-grabbing snap-x snap-proximity"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {near.map(({ m, km }, i) => (
              <MerchantCard
                key={m.id}
                merchant={m}
                index={i}
                isInView={isInView}
                onSelect={setSelectedMerchant}
                onAddToCart={onAddToCart}
                distanceKm={km}
              />
            ))}
            {near.length === 0 && (
              <p className="text-[13px] text-[#515154] py-12 w-full text-center">
                No deals match &ldquo;{query}&rdquo;.{" "}
                <button onClick={() => onQueryChange("")} className="text-[#0071E3] font-medium hover:underline">
                  Try another search
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Single "All" entry point — the full partner directory lives on its own page.
            Category tabs were removed: the search box and popular tags already narrow
            this row, and a filter that only ever showed 3 cards was doing no work. */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex justify-center mt-8"
        >
          <Link
            href="/merchants"
            className="inline-flex items-center gap-2 bg-[#1D1D1F] hover:bg-[#000000] text-white text-[13px] font-semibold px-4 py-2 rounded-full transition-colors duration-200"
          >
            <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
            All
            <span className="text-white/60 font-medium">· {merchants.length} merchants</span>
          </Link>
        </motion.div>

      </div>

      {/* Detail Modal */}
      <DetailModal open={!!selectedMerchant} onClose={() => setSelectedMerchant(null)}>
        {selectedMerchant && (
          <MerchantDetail
            merchant={selectedMerchant}
            onAddToCart={onAddToCart}
            onDone={() => setSelectedMerchant(null)}
          />
        )}
      </DetailModal>
    </section>
  );
}

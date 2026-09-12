"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import {
  destinations,
  type Destination,
} from "@/lib/destinations";
import DetailModal from "@/components/DetailModal";
import Link from "next/link";
import {
  Search,
  X,
  Star,
  MapPin,
  Clock,
  Ticket,
  ArrowDown,
  TreePalm,
  ChevronLeft,
} from "lucide-react";

// Category chips for the destinations filter
const CHIPS: { emoji: string; term: Destination["category"] | "All"; key: string }[] = [
  { emoji: "✨", term: "All",       key: "nearby.chip.all" },
  { emoji: "🌿", term: "Nature",    key: "nearby.chip.nature" },
  { emoji: "🛕", term: "Culture",   key: "nearby.chip.culture" },
  { emoji: "👨‍👩‍👧", term: "Family",   key: "nearby.chip.family" },
  { emoji: "🛍️", term: "Shopping",  key: "nearby.chip.shopping" },
  { emoji: "🎁", term: "Souvenir",  key: "nearby.chip.souvenir" },
  { emoji: "💆", term: "Wellness",  key: "nearby.chip.wellness" },
];

// Zone badge for distance tiers
function ZoneBadge({ destination: d, t }: { destination: Destination; t: (k: string) => string }) {
  const meta: Record<typeof d.zone, { key: string; cls: string }> = {
    center: { key: "nearby.zone.center", cls: "bg-emerald-600/10 text-emerald-700" },
    mid:    { key: "nearby.zone.mid",    cls: "bg-amber-500/10 text-amber-700" },
    far:    { key: "nearby.zone.far",    cls: "bg-orange-600/10 text-orange-600" },
  };
  const { key, cls } = meta[d.zone];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      🚗
      {t(key)}
    </span>
  );
}

// Destination card component for the destinations page
function DestinationCard({
  destination: d,
  onSelect,
}: {
  destination: Destination;
  onSelect: (d: Destination) => void;
}) {
  const { t } = useLocale();
  return (
    <button
      type="button"
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
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <span className="inline-block bg-black/45 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
            {t(`nearby.cat.${d.category.toLowerCase()}`)}
          </span>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <p className="text-[14px] font-bold text-fg leading-snug">{d.name}</p>
        <p className="text-[11px] text-muted flex items-center gap-1">
          <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
          {d.area}
        </p>
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 text-[12px]">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
            <span className="font-semibold text-fg">{d.rating}</span>
            <span className="text-muted">({d.reviews.toLocaleString("en-US")})</span>
          </span>
          <ZoneBadge destination={d} t={t} />
        </div>
      </div>
    </button>
  );
}

// Detail modal content (same fields as NearMeSection)
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
          <span className="inline-block bg-black/45 backdrop-blur-sm text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2">
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

      <div className="p-4 sm:p-6 flex flex-col">
        <p className="text-[13px] text-muted leading-relaxed mb-4">{d.desc}</p>

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
            <p className="text-[13px] font-bold text-fg"><ZoneBadge destination={d} t={t} /></p>
          </div>
        </div>

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

export const dynamic = "force-dynamic";

export default function DestinationsPage() {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialise from query params
  const initialQuery = searchParams.get("q") ?? "";
  const initialChip = searchParams.get("category") ?? "All";

  const [query, setQuery] = useState(initialQuery);
  const [chip, setChip] = useState(initialChip);
  const [selected, setSelected] = useState<Destination | null>(null);
  const [visibleCount, setVisibleCount] = useState(9);

  // Apply filters
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return destinations
      .filter((d) => chip === "All" || d.category === chip)
      .filter(
        (d) => !q ||
          [d.name, d.category, d.area, d.desc]
            .some((f) => f.toLowerCase().includes(q))
      );
  }, [chip, query]);

  // Every keystroke fires router.replace, which re-renders the whole page tree
  // and thrashes the history stack. Debounce it: the grid filters instantly
  // from state, the URL only follows once typing pauses — so stays shareable
  // without paying for it on every letter.
  const urlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (urlTimer.current) clearTimeout(urlTimer.current); }, []);
  const updateURL = (newQuery: string, newChip: string) => {
    if (urlTimer.current) clearTimeout(urlTimer.current);
    urlTimer.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (newQuery.trim()) params.set("q", newQuery.trim());
      if (newChip !== "All") params.set("category", newChip);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 400);
  };

  const handleChipChange = (newChip: string) => {
    setChip(newChip as Destination["category"] | "All");
    setVisibleCount(9);
    updateURL(query, newChip as Destination["category"] | "All");
  };

  const clearSearch = () => {
    setQuery("");
    setVisibleCount(9);
    updateURL("", chip);
  };

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    setVisibleCount(9);
    updateURL(newQuery, chip);
  };

  return (
    <main className="min-h-screen bg-bg">
      {/* Header */}
      <section className="pt-24 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[12px] sm:text-[13px] text-muted hover:text-fg transition-colors mb-3 sm:mb-4"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            {t("nearby.tryAnother")}
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-fg mb-3 sm:mb-4">
            {t("nearby.heading")}
          </h1>
          <p className="text-muted text-[14px] sm:text-[15px] max-w-md leading-relaxed">
            {t("nearby.sub")}
          </p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="mb-6 sm:mb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="card-soft rounded-2xl p-1.5 flex items-center gap-1.5 sm:gap-2">
            <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4">
              <Search className="w-4 h-4 text-fg/50 shrink-0" aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder={t("nearby.searchPlaceholder")}
                className="flex-1 min-w-0 bg-transparent text-[13px] sm:text-[14px] text-fg placeholder:text-fg/45 py-2.5"
                aria-label="Search destinations"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="shrink-0 w-5 h-5 rounded-full bg-fg/10 flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-fg/70" />
                </button>
              )}
            </div>
          </div>

          {/* Category chips */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {CHIPS.map((c) => (
              <button
                key={c.term}
                type="button"
                aria-pressed={chip === c.term}
                onClick={() => handleChipChange(c.term)}
                className={`text-[12px] px-2.5 py-1 rounded-full border transition-colors ${
                  chip === c.term
                    ? "bg-fg text-white border-fg"
                    : "text-muted hover:text-fg bg-surface-sunken hover:bg-line border-line-soft"
                }`}
              >
                {c.emoji} {t(c.key)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid or empty state */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="max-w-6xl mx-auto">
          {filtered.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filtered.slice(0, visibleCount).map((d) => (
                  <DestinationCard
                    key={d.id}
                    destination={d}
                    onSelect={setSelected}
                  />
                ))}
              </div>
              {visibleCount < filtered.length && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((c) => c + 9)}
                    className="inline-flex items-center gap-2 bg-fg hover:bg-fg-hover text-white text-[13px] font-bold px-6 py-3 rounded-xl transition-colors duration-200"
                  >
                    {t("nearby.loadMore")} ({filtered.length - visibleCount} {t("nearby.left")})
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-[13px] text-muted">
                {t("nearby.noMatch").replace("{q}", query || "")}
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setChip("All");
                  router.replace("/destinations");
                }}
                className="text-accent-ink font-medium hover:underline mt-2"
              >
                {t("nearby.tryAnother")}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Result count (sr only) */}
      <p aria-live="polite" className="sr-only">
        {t("nearby.found").replace("{n}", String(filtered.length))}
      </p>

      {/* Detail Modal */}
      <DetailModal open={!!selected} onClose={() => setSelected(null)}>
        {selected && <DestinationDetail destination={selected} onClose={() => setSelected(null)} />}
      </DetailModal>
    </main>
  );
}
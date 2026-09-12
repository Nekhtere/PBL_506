// Journey tour products — the travel/taxi revenue line. A tour sells the
// JOURNEY (driver + vehicle + schedule), not the stops: meals, shopping and
// treatments at each stop are paid by the traveller on location (team
// decision #1: no merchant vouchers, only two client scopes — ferry
// terminals and travel companies).
//
// Packages are deliberately MIXED: tourists rarely want a whole day of only
// nature or only shopping. Each day combines culture, nature, shopping or
// wellness into a realistic route.
//
// Prices follow distance, matching how Batam operators quote: a base daily
// car+driver rate (≈ Rp 650k all-in, ~S$55 for ≤4 pax) plus a surcharge for
// far zones (Barelang, Nongsa: +Rp 100–150k). Per-pax retail = vehicle cost
// ÷ capacity + zone surcharge + platform margin, sanity-checked against the
// Singapore market (private driver ~S$70/car/day; scheduled tours S$88–122).
// ponytail: demo pricing for the pitch — partner travel companies confirm
// their real base rates and zone surcharges at signing.

import type { JourneyTheme } from "./destinations";
export type { JourneyTheme };

export type TourSlot = {
  time: string;
  type: string;
  /** id of a Destination in destinations.ts, or null for an unscheduled stop
      (lunch / shopping free time) that has no Near Me card. */
  destinationId: number | null;
  /** Fallback display when destinationId is null. */
  name?: string;
  emoji: string;
  travelNote: string;
};

export type Tour = {
  id: string;
  theme: JourneyTheme;
  name: string;
  tagline: string;
  durationHours: number;
  /** 1 = day trip; 2 = two-day tour. */
  days: number;
  /** Retail per pax in SGD. */
  priceSGD: number;
  /** "Save S$ 10 vs separate taxis" — honesty-checked against typical fares. */
  savingsSGD: number;
  includes: string[];
  slots: TourSlot[];
  rating: number;
  reviews: number;
};

export const THEME_META: Record<
  JourneyTheme,
  { emoji: string; labelKey: string; photo: string }
> = {
  heritage: {
    emoji: "🛕",
    labelKey: "journey.theme.heritage",
    photo: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=900&q=80&auto=format&fit=crop",
  },
  "nature-relax": {
    emoji: "🌿",
    labelKey: "journey.theme.natureRelax",
    photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80&auto=format&fit=crop",
  },
  "shop-treat": {
    emoji: "🛍️",
    labelKey: "journey.theme.shopTreat",
    photo: "https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=900&q=80&auto=format&fit=crop",
  },
  "island-explorer": {
    emoji: "🏝️",
    labelKey: "journey.theme.islandExplorer",
    photo: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=900&q=80&auto=format&fit=crop",
  },
};

const SHARED_INCLUDES = [
  "Private car & driver (fuel + parking included)",
  "Hotel / ferry-terminal pickup",
  "English & Indonesian speaking driver",
  "Flexible timing at every stop",
];

// Default terminal for static pricing display. The actual pickup time is
// recalculated in JourneySection based on the user's selected terminal.
const DEFAULT_PICKUP: TourSlot = {
  time: "09:30",
  type: "Pickup",
  destinationId: null,
  name: "Hotel / ferry terminal pickup",
  emoji: "🚗",
  travelNote: "Meet & greet at arrival gate",
};

export const tours: Tour[] = [
  // ── Center-zone mixed day (S$ 48) ──────────────────────────────────────────
  {
    id: "day-heritage",
    theme: "heritage",
    name: "1-Day Tour — Heritage & Chill",
    tagline: "Temple calm in the morning, oleh-oleh hunting, then a slow spa afternoon — Batam's most popular first-timer route.",
    durationHours: 6,
    days: 1,
    priceSGD: 48,
    savingsSGD: 10,
    includes: SHARED_INCLUDES,
    slots: [
      DEFAULT_PICKUP,
      { time: "10:00", type: "Morning", destinationId: 5, emoji: "🛕", travelNote: "Maha Vihara Duta Maitreya" },
      { time: "12:00", type: "Lunch", destinationId: null, name: "Nagoya food street", emoji: "🍜", travelNote: "Walk from Nagoya Hill" },
      { time: "13:30", type: "Afternoon", destinationId: 7, emoji: "🎁", travelNote: "Snacks, batik & dried seafood" },
      { time: "15:30", type: "Late afternoon", destinationId: 12, emoji: "💆", travelNote: "Massage or salon treatment" },
      { time: "17:30", type: "Return", destinationId: null, name: "Drop-off hotel / terminal", emoji: "🚗", travelNote: "Timed to your ferry" },
    ],
    rating: 4.8,
    reviews: 312,
  },
  {
    id: "day-shop-treat",
    theme: "shop-treat",
    name: "1-Day Tour — Shop & Treat",
    tagline: "Mall hop in the morning, oleh-oleh run, then surrender the afternoon to a spa — a classic girlfriends' day out.",
    durationHours: 6,
    days: 1,
    priceSGD: 48,
    savingsSGD: 10,
    includes: SHARED_INCLUDES,
    slots: [
      DEFAULT_PICKUP,
      { time: "10:00", type: "Morning", destinationId: 8, emoji: "🛍️", travelNote: "Mega Mall Batam Centre" },
      { time: "12:30", type: "Lunch", destinationId: null, name: "Food hall", emoji: "🍜", travelNote: "Quick bite between stops" },
      { time: "14:00", type: "Afternoon", destinationId: 7, emoji: "🎁", travelNote: "Local snacks & batik" },
      { time: "16:00", type: "Late afternoon", destinationId: 12, emoji: "💆", travelNote: "Spa afternoon" },
      { time: "18:00", type: "Return", destinationId: null, name: "Drop-off hotel / terminal", emoji: "🚗", travelNote: "Timed to your ferry" },
    ],
    rating: 4.7,
    reviews: 286,
  },
  // ── Mid/far + center mixed day (S$ 58) ─────────────────────────────────────
  {
    id: "day-nature-relax",
    theme: "nature-relax",
    name: "1-Day Tour — Nature & Relax",
    tagline: "Mangrove boardwalk in the morning, Nongsa's quiet beach for lunch, then back to town for a spa reset.",
    durationHours: 7,
    days: 1,
    priceSGD: 58,
    savingsSGD: 14,
    includes: SHARED_INCLUDES,
    slots: [
      DEFAULT_PICKUP,
      { time: "10:00", type: "Morning", destinationId: 3, emoji: "🌿", travelNote: "Mangrove Reserve Sei Beduk" },
      { time: "12:30", type: "Lunch", destinationId: null, name: "Beachside seafood shack", emoji: "🦐", travelNote: "Pay at the restaurant" },
      { time: "13:30", type: "Afternoon", destinationId: 2, emoji: "🏖️", travelNote: "Nongsa Beach" },
      { time: "16:00", type: "Late afternoon", destinationId: 12, emoji: "💆", travelNote: "Spa reset back in town" },
      { time: "18:00", type: "Return", destinationId: null, name: "Drop-off hotel / terminal", emoji: "🚗", travelNote: "Timed to your ferry" },
    ],
    rating: 4.8,
    reviews: 198,
  },
  // ── Far-zone full day (S$ 72) ──────────────────────────────────────────────
  {
    id: "day-island-explorer",
    theme: "island-explorer",
    name: "1-Day Tour — Island Explorer",
    tagline: "The full cross-island loop: Barelang Bridge, Nongsa Beach, grand mosque and a culture stop — for travellers who want it all.",
    durationHours: 9,
    days: 1,
    priceSGD: 72,
    savingsSGD: 20,
    includes: SHARED_INCLUDES,
    slots: [
      DEFAULT_PICKUP,
      { time: "09:30", type: "Morning", destinationId: 3, emoji: "🌿", travelNote: "Mangrove boardwalk, first light" },
      { time: "11:30", type: "Late morning", destinationId: 2, emoji: "🏖️", travelNote: "Nongsa Beach" },
      { time: "13:30", type: "Lunch", destinationId: null, name: "Seafood shack near Nongsa", emoji: "🦐", travelNote: "Pay at the restaurant" },
      { time: "15:00", type: "Afternoon", destinationId: 6, emoji: "🕌", travelNote: "Masjid Raya Batam" },
      { time: "16:30", type: "Late afternoon", destinationId: 5, emoji: "🛕", travelNote: "Maha Vihara Duta Maitreya" },
      { time: "17:30", type: "Sunset", destinationId: 1, emoji: "🌉", travelNote: "Barelang Bridge sunset" },
      { time: "19:00", type: "Return", destinationId: null, name: "Drop-off hotel / terminal", emoji: "🚗", travelNote: "Timed to your ferry" },
    ],
    rating: 4.9,
    reviews: 156,
  },
  // ── Two-day complete (S$ 115) ─────────────────────────────────────────────
  {
    id: "2day-complete",
    theme: "island-explorer",
    name: "2-Day Tour — Batam Complete",
    tagline: "Day one: far corners and sunset. Day two: culture, shopping and spa. Two full days with the same driver.",
    durationHours: 16,
    days: 2,
    priceSGD: 115,
    savingsSGD: 28,
    includes: [...SHARED_INCLUDES, "Same driver both days", "Overnight coordination with your hotel"],
    slots: [
      { time: "D1 09:30", type: "Day 1", destinationId: 3, emoji: "🌿", travelNote: "Mangrove boardwalk" },
      { time: "D1 12:30", type: "Day 1", destinationId: null, name: "Nongsa seafood lunch", emoji: "🦐", travelNote: "Pay at the restaurant" },
      { time: "D1 14:00", type: "Day 1", destinationId: 2, emoji: "🏖️", travelNote: "Nongsa Beach" },
      { time: "D1 17:30", type: "Day 1", destinationId: 1, emoji: "🌉", travelNote: "Barelang Bridge sunset" },
      { time: "D2 10:00", type: "Day 2", destinationId: 5, emoji: "🛕", travelNote: "Maha Vihara Duta Maitreya" },
      { time: "D2 12:30", type: "Day 2", destinationId: null, name: "Nagoya lunch", emoji: "🍜", travelNote: "Food street" },
      { time: "D2 14:00", type: "Day 2", destinationId: 7, emoji: "🎁", travelNote: "Oleh-oleh at Nagoya Hill" },
      { time: "D2 16:00", type: "Day 2", destinationId: 12, emoji: "💆", travelNote: "Spa before departure" },
    ],
    rating: 4.9,
    reviews: 98,
  },
];

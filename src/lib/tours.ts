// Journey tour products — the travel/taxi revenue line. A tour sells the
// JOURNEY (driver + vehicle + schedule), not the stops: meals, shopping and
// treatments at each stop are paid by the traveller on location (team
// decision #1: no merchant vouchers, only two client scopes — ferry
// terminals and travel companies).
//
// Prices follow distance, matching how Batam operators quote: a base daily
// car+driver rate (≈ Rp 650k all-in, ~S$55 for ≤4 pax) plus a surcharge for
// far zones (Barelang, Nongsa: +Rp 100–150k). Per-pax retail = vehicle cost
// ÷ capacity + zone surcharge + platform margin, sanity-checked against the
// Singapore market (private driver ~S$70/car/day; scheduled tours S$88–122).
// ponytail: demo pricing for the pitch — partner travel companies confirm
// their real base rates and zone surcharges at signing.

import type { JourneyTheme } from "./destinations";

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
  nature: {
    emoji: "🌿",
    labelKey: "journey.theme.nature",
    photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80&auto=format&fit=crop",
  },
  souvenir: {
    emoji: "🎁",
    labelKey: "journey.theme.souvenir",
    photo: "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=900&q=80&auto=format&fit=crop",
  },
  wellness: {
    emoji: "💆",
    labelKey: "journey.theme.wellness",
    photo: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=900&q=80&auto=format&fit=crop",
  },
  shopping: {
    emoji: "🛍️",
    labelKey: "journey.theme.shopping",
    photo: "https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=900&q=80&auto=format&fit=crop",
  },
};

const SHARED_INCLUDES = [
  "Private car & driver (fuel + parking included)",
  "Hotel / ferry-terminal pickup",
  "English & Indonesian speaking driver",
  "Flexible timing at every stop",
];

export const tours: Tour[] = [
  // ── Center-zone day tours (S$ 45) ──────────────────────────────────────────
  {
    id: "day-souvenir",
    theme: "souvenir",
    name: "1-Day Tour — Oleh-oleh Nagoya",
    tagline: "Snacks, batik and dried seafood — Batam's classic gift run with a driver who knows the good shops.",
    durationHours: 5,
    days: 1,
    priceSGD: 45,
    savingsSGD: 8,
    includes: SHARED_INCLUDES,
    slots: [
      { time: "09:00", type: "Pickup",  destinationId: null, name: "Hotel / ferry terminal pickup", emoji: "🚗", travelNote: "Meet & greet at arrival gate" },
      { time: "09:30", type: "Morning", destinationId: 7, emoji: "🎁", travelNote: "~15 min from Batam Centre" },
      { time: "12:30", type: "Lunch",   destinationId: null, name: "Nagoya food street", emoji: "🍜", travelNote: "Walk from Nagoya Hill", },
      { time: "14:00", type: "Afternoon", destinationId: 9, emoji: "🏬", travelNote: "~10 min from Nagoya" },
      { time: "16:00", type: "Return",  destinationId: null, name: "Drop-off hotel / terminal", emoji: "🚗", travelNote: "Timed to your ferry" },
    ],
    rating: 4.7,
    reviews: 268,
  },
  {
    id: "day-wellness",
    theme: "wellness",
    name: "1-Day Tour — Spa & Salon",
    tagline: "A slow day of massage, reflexology and salon treatment around Nagoya — pay per treatment, we handle the wheels.",
    durationHours: 5,
    days: 1,
    priceSGD: 45,
    savingsSGD: 8,
    includes: SHARED_INCLUDES,
    slots: [
      { time: "10:00", type: "Pickup",  destinationId: null, name: "Hotel / ferry terminal pickup", emoji: "🚗", travelNote: "Meet & greet at arrival gate" },
      { time: "10:30", type: "Morning", destinationId: 12, emoji: "💆", travelNote: "~15 min from Batam Centre" },
      { time: "13:00", type: "Lunch",   destinationId: null, name: "Lunch near Nagoya", emoji: "🍜", travelNote: "~5 min from previous stop" },
      { time: "14:30", type: "Afternoon", destinationId: 12, emoji: "🌸", travelNote: "Second treatment or salon" },
      { time: "16:30", type: "Return",  destinationId: null, name: "Drop-off hotel / terminal", emoji: "🚗", travelNote: "Timed to your ferry" },
    ],
    rating: 4.8,
    reviews: 194,
  },
  {
    id: "day-shopping",
    theme: "shopping",
    name: "1-Day Tour — Mall Hopping",
    tagline: "Mega Mall, Grand Batam and BCS in one sweep — with a car for the bags and a driver who waits.",
    durationHours: 5,
    days: 1,
    priceSGD: 45,
    savingsSGD: 10,
    includes: SHARED_INCLUDES,
    slots: [
      { time: "10:00", type: "Pickup",  destinationId: null, name: "Hotel / ferry terminal pickup", emoji: "🚗", travelNote: "Meet & greet at arrival gate" },
      { time: "10:15", type: "Morning", destinationId: 8, emoji: "🛍️", travelNote: "~5 min from Batam Centre terminal" },
      { time: "12:30", type: "Lunch",   destinationId: null, name: "Food hall at Grand Batam", emoji: "🍜", travelNote: "~10 min from Mega Mall" },
      { time: "14:00", type: "Afternoon", destinationId: 10, emoji: "🏬", travelNote: "~5 min from Grand Batam" },
      { time: "16:30", type: "Return",  destinationId: null, name: "Drop-off hotel / terminal", emoji: "🚗", travelNote: "Timed to your ferry" },
    ],
    rating: 4.6,
    reviews: 221,
  },
  // ── Far-zone day tour (S$ 65) — Barelang & Nongsa carry the distance
  // surcharge operators actually charge. ─────────────────────────────────────
  {
    id: "day-nature",
    theme: "nature",
    name: "1-Day Tour — Alam Batam",
    tagline: "Mangrove boardwalk, Nongsa's quiet beach and sunset at Barelang Bridge — the far corners, handled.",
    durationHours: 8,
    days: 1,
    priceSGD: 65,
    savingsSGD: 18,
    includes: SHARED_INCLUDES,
    slots: [
      { time: "09:00", type: "Pickup",   destinationId: null, name: "Hotel / ferry terminal pickup", emoji: "🚗", travelNote: "Meet & greet at arrival gate" },
      { time: "09:30", type: "Morning",  destinationId: 3, emoji: "🌿", travelNote: "~25 min from Batam Centre" },
      { time: "12:00", type: "Lunch",    destinationId: null, name: "Seafood shack near Nongsa", emoji: "🦐", travelNote: "~30 min from mangrove" },
      { time: "13:30", type: "Afternoon", destinationId: 2, emoji: "🏖️", travelNote: "~10 min from lunch" },
      { time: "16:30", type: "Sunset",   destinationId: 1, emoji: "🌉", travelNote: "~45 min cross-island — the long leg" },
      { time: "18:30", type: "Return",   destinationId: null, name: "Drop-off hotel / terminal", emoji: "🚗", travelNote: "~40 min back to town" },
    ],
    rating: 4.9,
    reviews: 342,
  },
  // ── Two-day combination (S$ 110) ───────────────────────────────────────────
  {
    id: "2day-complete",
    theme: "nature",
    name: "2-Day Tour — Batam Complete",
    tagline: "Day one: nature and the far coast. Day two: oleh-oleh, spa and the malls. Two full days, one driver.",
    durationHours: 16,
    days: 2,
    priceSGD: 110,
    savingsSGD: 25,
    includes: [...SHARED_INCLUDES, "Same driver both days", "Overnight coordination with your hotel"],
    slots: [
      { time: "D1 09:00", type: "Day 1", destinationId: 3, emoji: "🌿", travelNote: "Mangrove boardwalk, morning" },
      { time: "D1 13:30", type: "Day 1", destinationId: 2, emoji: "🏖️", travelNote: "Nongsa Beach, afternoon" },
      { time: "D1 16:30", type: "Day 1", destinationId: 1, emoji: "🌉", travelNote: "Barelang sunset" },
      { time: "D2 10:00", type: "Day 2", destinationId: 7, emoji: "🎁", travelNote: "Oleh-oleh at Nagoya Hill" },
      { time: "D2 13:30", type: "Day 2", destinationId: 12, emoji: "💆", travelNote: "Spa afternoon" },
      { time: "D2 16:00", type: "Day 2", destinationId: 8, emoji: "🛍️", travelNote: "Last-stop mall, then terminal" },
    ],
    rating: 4.9,
    reviews: 128,
  },
];

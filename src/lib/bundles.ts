// Bundle products — the flagship demo SKU. One purchase involves BOTH client
// scopes at once: the ferry operator sells the crossing, the travel company
// sells the wheels, we sell the package and take the margin in the middle.
//
// Timeline anchors on the real BatamFast cadence (HarbourFront → Batam Centre
// departs roughly hourly; crossing ±45–70 min; Batam is UTC+7, one hour
// behind Singapore — so a 08:10 SG departure lands ~08:30 Batam time).
// ponytail: demo pricing for the pitch. S$89/S$179 sit deliberately below
// the S$99–122 market (Klook, JA Travel) as a launch position — partner
// ferry + travel rates confirmed at signing.

import type { FerryRoute } from "./ferry-routes";

export type BundleSlot = {
  /** Time is injected by buildBundleTimeline for dynamic ferry slots. */
  time?: string;
  emoji: string;
  label: string;
  note?: string;
};

export type Bundle = {
  id: string;
  name: string;
  tagline: string;
  days: number;
  /** Base bundle price excluding the ferry component. The final price is
      basePriceSGD + the selected ferry route's return fare. */
  basePriceSGD: number;
  /** Sum of buying the pieces separately — the saving badge derives from this. */
  separateSGD: number;
  includes: string[];
  excludes: string[];
  /** Themes the buyer picks stops from (1 theme for Express, 2 for Complete). */
  themeChoices: number;
  /** Default route id used for first render. */
  defaultRouteId: string;
  /** Static template slots; ferry slots are injected by the component. */
  timeline: BundleSlot[];
  photo: string;
};

export const bundles: Bundle[] = [
  {
    id: "bundle-express",
    name: "1-Day Batam Express",
    tagline: "Morning ferry, eight hours with your own driver, evening ferry home — the classic Singapore day escape, sorted in one tap.",
    days: 1,
    basePriceSGD: 13, // driver & coordination margin; ferry return fare added on top
    separateSGD: 104, // S$76 return ferry + ~S$28 share of a day driver at market rate
    includes: [
      "Return ferry (terminal of your choice, all fees included)",
      "Private car & driver, 8 hours",
      "3 destinations from 1 theme of your choice",
      "Meet & greet at arrival gate",
      "Driver timed to your return ferry",
    ],
    excludes: [
      "Meals, shopping & treatments (pay at each stop)",
      "Visa on Arrival if required (see FAQ)",
    ],
    themeChoices: 1,
    defaultRouteId: "harbourfront-batamcentre",
    timeline: [
      { emoji: "🛂", label: "Check in at Singapore terminal", note: "45 min before departure" },
      { emoji: "⛴️", label: "Ferry departs" },
      { emoji: "🚗", label: "Driver meets you at Batam terminal", note: "Batam is 1 hour behind SG" },
      { emoji: "📍", label: "Destination 1" },
      { emoji: "🍜", label: "Lunch stop", note: "Pay at the restaurant" },
      { emoji: "📍", label: "Destination 2 & 3" },
      { emoji: "⛴️", label: "Ferry back to Singapore" },
      { emoji: "🏠", label: "Arrive Singapore terminal" },
    ],
    photo: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=900&q=80&auto=format&fit=crop",
  },
  {
    id: "bundle-complete",
    name: "2D1N Batam Complete",
    tagline: "Two full days: nature and the far coast on day one, oleh-oleh, spa and malls on day two — ferry, hotel and driver in one price.",
    days: 2,
    basePriceSGD: 103, // hotel + 2-day driver + coordination; ferry return fare added on top
    separateSGD: 209, // S$76 ferry + S$45 hotel share + ~S$88 two days of driver at market rate
    includes: [
      "Return ferry (terminal of your choice, all fees included)",
      "1 night hotel, Batam Centre area (twin/double share)",
      "Private car & driver, 2 full days",
      "6 destinations across 2 themes of your choice",
      "1 seafood lunch on day 1",
      "Same driver both days",
    ],
    excludes: [
      "Other meals, shopping & treatments",
      "Visa on Arrival if required (see FAQ)",
    ],
    themeChoices: 2,
    defaultRouteId: "harbourfront-batamcentre",
    timeline: [
      { emoji: "⛴️", label: "Ferry from Singapore terminal" },
      { emoji: "🌿", label: "Nature theme stops", note: "Mangrove, beach or Miniature Park" },
      { emoji: "🦐", label: "Seafood lunch", note: "Included" },
      { emoji: "🌉", label: "Barelang sunset" },
      { emoji: "🏨", label: "Hotel check-in, Batam Centre" },
      { emoji: "🎁", label: "Second theme stops", note: "Oleh-oleh, spa or malls" },
      { emoji: "⛴️", label: "Ferry back to Singapore" },
      { emoji: "🏠", label: "Arrive Singapore terminal" },
    ],
    photo: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=900&q=80&auto=format&fit=crop",
  },
];

// Build the displayed timeline from the static template plus the selected ferry
// route and schedules. This keeps the bundle honest: the ferry component always
// matches what the user picked in the ferry section.
export function buildBundleTimeline(
  b: Bundle,
  route: FerryRoute,
  outboundSchedule: string,
  returnSchedule: string,
): BundleSlot[] {
  const crossingMin = parseInt(route.crossing.replace(/\D/g, ""), 10) || 45;

  function parseTime(t: string) {
    const [h, m] = t.split(":").map(Number);
    return { h, m: m || 0 };
  }

  function addMin(t: { h: number; m: number }, min: number) {
    const total = t.h * 60 + t.m + min;
    const h = Math.floor(total / 60) % 24;
    const m = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  if (b.days === 1) {
    const out = parseTime(outboundSchedule);
    const checkIn = addMin(out, -45);
    const landBatam = addMin(out, crossingMin + 60); // SG→WIB + crossing + immigration
    const driverMeet = addMin({ h: parseInt(landBatam.split(":")[0], 10), m: parseInt(landBatam.split(":")[1], 10) }, 15);
    const ret = parseTime(returnSchedule);
    return [
      { time: `${checkIn} SG`, emoji: "🛂", label: `Check in at ${route.from.split(",")[0]}`, note: "45 min before departure" },
      { time: `${outboundSchedule} SG`, emoji: "⛴️", label: `Ferry departs for ${route.to}`, note: `${route.crossing} crossing` },
      { time: `${driverMeet} WIB`, emoji: "🚗", label: `Driver meets you at ${route.to}`, note: "Batam is 1 hour behind SG" },
      { time: addMin({ h: parseInt(driverMeet.split(":")[0], 10), m: parseInt(driverMeet.split(":")[1], 10) }, 60), emoji: "📍", label: "Destination 1" },
      { time: addMin({ h: parseInt(driverMeet.split(":")[0], 10), m: parseInt(driverMeet.split(":")[1], 10) }, 210), emoji: "🍜", label: "Lunch stop", note: "Pay at the restaurant" },
      { time: addMin({ h: parseInt(driverMeet.split(":")[0], 10), m: parseInt(driverMeet.split(":")[1], 10) }, 330), emoji: "📍", label: "Destination 2 & 3" },
      { time: `${returnSchedule} WIB`, emoji: "⛴️", label: "Ferry back to Singapore" },
      { time: `${addMin(ret, crossingMin + 60)} SG`, emoji: "🏠", label: `Arrive ${route.from.split(",")[0]}`, note: "Singapore time" },
    ];
  }

  // 2D1N
  const out = parseTime(outboundSchedule);
  const landBatam = addMin(out, crossingMin + 60);
  const driverMeet = addMin({ h: parseInt(landBatam.split(":")[0], 10), m: parseInt(landBatam.split(":")[1], 10) }, 15);
  const ret = parseTime(returnSchedule);
  return [
    { time: `D1 ${outboundSchedule} SG`, emoji: "⛴️", label: `Ferry from ${route.from.split(",")[0]}`, note: `${route.crossing} crossing` },
    { time: `D1 ${driverMeet} WIB`, emoji: "🌿", label: "Nature theme stops", note: "Mangrove, beach or Miniature Park" },
    { time: `D1 ${addMin({ h: parseInt(driverMeet.split(":")[0], 10), m: parseInt(driverMeet.split(":")[1], 10) }, 180)}`, emoji: "🦐", label: "Seafood lunch", note: "Included" },
    { time: `D1 ${addMin({ h: parseInt(driverMeet.split(":")[0], 10), m: parseInt(driverMeet.split(":")[1], 10) }, 420)}`, emoji: "🌉", label: "Barelang sunset" },
    { time: `D1 ${addMin({ h: parseInt(driverMeet.split(":")[0], 10), m: parseInt(driverMeet.split(":")[1], 10) }, 570)}`, emoji: "🏨", label: "Hotel check-in", note: "Batam Centre area" },
    { time: `D2 10:00`, emoji: "🎁", label: "Second theme stops", note: "Oleh-oleh, spa or malls" },
    { time: `D2 ${returnSchedule} WIB`, emoji: "⛴️", label: "Ferry back to Singapore" },
    { time: `D2 ${addMin(ret, crossingMin + 60)} SG`, emoji: "🏠", label: `Arrive ${route.from.split(",")[0]}`, note: "Singapore time" },
  ];
}

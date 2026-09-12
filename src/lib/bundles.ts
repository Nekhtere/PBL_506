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

export type BundleSlot = {
  time: string;
  emoji: string;
  label: string;
  note?: string;
};

export type Bundle = {
  id: string;
  name: string;
  tagline: string;
  days: number;
  priceSGD: number;
  /** Sum of buying the pieces separately — the saving badge derives from this. */
  separateSGD: number;
  includes: string[];
  excludes: string[];
  /** Themes the buyer picks stops from (1 theme for Express, 2 for Complete). */
  themeChoices: number;
  timeline: BundleSlot[];
  photo: string;
};

export const bundles: Bundle[] = [
  {
    id: "bundle-express",
    name: "1-Day Batam Express",
    tagline: "Morning ferry, eight hours with your own driver, evening ferry home — the classic Singapore day escape, sorted in one tap.",
    days: 1,
    priceSGD: 89,
    separateSGD: 104, // S$76 return ferry + ~S$28 share of a day driver at market rate
    includes: [
      "Return ferry HarbourFront ⇄ Batam Centre (all fees included)",
      "Private car & driver, 8 hours",
      "3 destinations from 1 theme of your choice",
      "Meet & greet at Batam Centre arrival gate",
      "Driver timed to your return ferry",
    ],
    excludes: [
      "Meals, shopping & treatments (pay at each stop)",
      "Visa on Arrival if required (see FAQ)",
    ],
    themeChoices: 1,
    timeline: [
      { time: "07:40 SG",  emoji: "🛂", label: "Check in at HarbourFront", note: "45 min before departure" },
      { time: "08:10 SG",  emoji: "⛴️", label: "Ferry departs", note: "±60 min crossing" },
      { time: "08:30 WIB", emoji: "🚗", label: "Driver meets you at Batam Centre", note: "Batam is 1 hour behind SG" },
      { time: "09:30",     emoji: "📍", label: "Destination 1" },
      { time: "12:30",     emoji: "🍜", label: "Lunch stop", note: "Pay at the restaurant" },
      { time: "14:00",     emoji: "📍", label: "Destination 2 & 3" },
      { time: "17:30",     emoji: "⛴️", label: "Ferry back to Singapore" },
      { time: "19:30 SG",  emoji: "🏠", label: "Arrive HarbourFront" },
    ],
    photo: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=900&q=80&auto=format&fit=crop",
  },
  {
    id: "bundle-complete",
    name: "2D1N Batam Complete",
    tagline: "Two full days: nature and the far coast on day one, oleh-oleh, spa and malls on day two — ferry, hotel and driver in one price.",
    days: 2,
    priceSGD: 179,
    separateSGD: 209, // S$76 ferry + S$45 hotel share + ~S$88 two days of driver at market rate
    includes: [
      "Return ferry HarbourFront ⇄ Batam Centre (all fees included)",
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
    timeline: [
      { time: "D1 08:10 SG", emoji: "⛴️", label: "Ferry from HarbourFront" },
      { time: "D1 09:30",    emoji: "🌿", label: "Nature theme stops", note: "Mangrove, beach or Miniature Park" },
      { time: "D1 12:30",    emoji: "🦐", label: "Seafood lunch", note: "Included" },
      { time: "D1 16:30",    emoji: "🌉", label: "Barelang sunset" },
      { time: "D1 19:00",    emoji: "🏨", label: "Hotel check-in, Batam Centre" },
      { time: "D2 10:00",    emoji: "🎁", label: "Second theme stops", note: "Oleh-oleh, spa or malls" },
      { time: "D2 17:30",    emoji: "⛴️", label: "Ferry back to Singapore" },
      { time: "D2 19:30 SG", emoji: "🏠", label: "Arrive HarbourFront" },
    ],
    photo: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=900&q=80&auto=format&fit=crop",
  },
];

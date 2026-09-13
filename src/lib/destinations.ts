// Single source of truth for every destination shown in the free Near Me
// section and referenced by the paid Journey themes. A Destination is a place,
// not a product — it carries no price of its own. What we sell (tours and
// ferry tickets) lives elsewhere.
//
// Zone drives the distance-based tour pricing (team decision: travel revenue
// is the cost of getting A→B, so further costs more — matching how Batam
// operators quote a base daily rate plus a surcharge for far areas like
// Barelang and Nongsa).
export type Zone = "center" | "mid" | "far";

export type DestinationCategory =
  | "Nature"
  | "Culture"
  | "Family"
  | "Shopping"
  | "Souvenir"
  | "Wellness";

export type Destination = {
  id: number;
  name: string;
  category: DestinationCategory;
  desc: string;
  /** Display location, e.g. "Barelang, Batam". */
  area: string;
  zone: Zone;
  lat: number;
  lng: number;
  facilities: string[];
  rating: number;
  reviews: number;
  /** "06:00 – 18:00 WIB" | "Open 24 hours" | "24-hour front desk" */
  hours: string;
  /** "Free" | "Rp 15.000" — the gate price, shown for information only. */
  entryFee: string;
  photo: string;
};

export const destinations: Destination[] = [
  {
    id: 1,
    name: "Barelang Bridge Viewpoint",
    category: "Nature",
    desc: "Sunset over the iconic chain of six bridges linking Batam to the southern islands — the shot everyone wants.",
    area: "Barelang, Batam",
    zone: "far",
    lat: 1.0040, lng: 104.0500,
    facilities: ["Parking", "Food stalls", "Viewing deck"],
    rating: 4.8,
    reviews: 1780,
    hours: "Open 24 hours",
    entryFee: "Free",
    photo: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Nongsa Beach",
    category: "Nature",
    desc: "Quiet northeast shore with views across to Singapore — gentle sand, watersports and seafood shacks.",
    area: "Nongsa, Batam",
    zone: "far",
    lat: 1.1980, lng: 104.1050,
    facilities: ["Parking", "Toilets", "Showers", "Watersports rental"],
    rating: 4.7,
    reviews: 860,
    hours: "07:00 – 19:00 WIB",
    entryFee: "Free",
    photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Mangrove Reserve Sei Beduk",
    category: "Nature",
    desc: "Boardwalk through protected mangrove forest — kingfishers, mudskippers and a quiet escape from the city.",
    area: "Sei Beduk, Batam",
    zone: "mid",
    lat: 1.1050, lng: 104.0600,
    facilities: ["Parking", "Boardwalk", "Guide post"],
    rating: 4.5,
    reviews: 320,
    hours: "08:00 – 17:00 WIB",
    entryFee: "Rp 10.000",
    photo: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Batam Miniature Park",
    category: "Family",
    desc: "Traditional houses from every Indonesian province in miniature, a small zoo corner and a lake — easy half-day with kids.",
    area: "Sungai Panas, Batam",
    zone: "mid",
    lat: 1.1290, lng: 104.0480,
    facilities: ["Parking", "Toilets", "Prayer room", "Cafeteria", "Playground"],
    rating: 4.5,
    reviews: 1120,
    hours: "09:00 – 18:00 WIB",
    entryFee: "Rp 15.000",
    photo: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Maha Vihara Duta Maitreya",
    category: "Culture",
    desc: "One of the largest Buddhist temples in Southeast Asia — serene halls, laughing Buddha statues and a vegetarian canteen.",
    area: "Batam Centre, Batam",
    zone: "center",
    lat: 1.1180, lng: 104.0260,
    facilities: ["Parking", "Toilets", "Prayer hall", "Vegetarian canteen"],
    rating: 4.7,
    reviews: 1980,
    hours: "07:00 – 19:00 WIB",
    entryFee: "Free",
    photo: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Masjid Raya Batam",
    category: "Culture",
    desc: "The grand pyramid-roofed mosque on Batam Centre's main square — striking architecture next to the city park.",
    area: "Batam Centre, Batam",
    zone: "center",
    lat: 1.1170, lng: 104.0440,
    facilities: ["Parking", "Ablution area", "Wheelchair access"],
    rating: 4.8,
    reviews: 1450,
    hours: "Open 24 hours",
    entryFee: "Free",
    photo: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: 7,
    name: "Nagoya Hill",
    category: "Souvenir",
    desc: "Batam's busiest shopping district — local snacks, batik, dried seafood and the classic oleh-oleh stops in one area.",
    area: "Nagoya, Batam",
    zone: "center",
    lat: 1.1345, lng: 104.0208,
    facilities: ["Parking", "Food court", "ATMs", "Money changer"],
    rating: 4.6,
    reviews: 2900,
    hours: "10:00 – 22:00 WIB",
    entryFee: "Free",
    photo: "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: 8,
    name: "Mega Mall Batam Centre",
    category: "Shopping",
    desc: "The mall directly facing Batam Centre ferry terminal — fashion, electronics and the easiest first stop off the boat.",
    area: "Batam Centre, Batam",
    zone: "center",
    lat: 1.1200, lng: 104.0520,
    facilities: ["Parking", "Food court", "ATMs", "Cinema"],
    rating: 4.5,
    reviews: 3400,
    hours: "10:00 – 22:00 WIB",
    entryFee: "Free",
    photo: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: 9,
    name: "Grand Batam Mall",
    category: "Shopping",
    desc: "Lubuk Baja's modern mall — mid-range brands, a popular food hall and late-opening cafés.",
    area: "Lubuk Baja, Batam",
    zone: "center",
    lat: 1.1270, lng: 104.0220,
    facilities: ["Parking", "Food hall", "ATMs", "Kids zone"],
    rating: 4.6,
    reviews: 1750,
    hours: "10:00 – 22:00 WIB",
    entryFee: "Free",
    photo: "https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: 10,
    name: "BCS Mall",
    category: "Shopping",
    desc: "Batam City Square — gadget shops, local fashion and the liveliest night-time street food row outside.",
    area: "Baloi, Batam",
    zone: "center",
    lat: 1.1310, lng: 104.0130,
    facilities: ["Parking", "Food street", "ATMs"],
    rating: 4.4,
    reviews: 1280,
    hours: "10:00 – 22:00 WIB",
    entryFee: "Free",
    photo: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: 11,
    name: "Harbour Bay Mall",
    category: "Shopping",
    desc: "Duty-free-leaning shops right at Harbour Bay terminal — branded goods, electronics and local fashion.",
    area: "Harbour Bay, Batam",
    zone: "center",
    lat: 1.1466, lng: 104.0150,
    facilities: ["Parking", "Waterfront dining", "ATMs", "Money changer"],
    rating: 4.7,
    reviews: 2100,
    hours: "10:00 – 22:00 WIB",
    entryFee: "Free",
    photo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: 12,
    name: "Nagoya Wellness District",
    category: "Wellness",
    desc: "The strip of spas and salons around Nagoya — aromatherapy massage, reflexology and beauty treatments at local prices.",
    area: "Nagoya, Batam",
    zone: "center",
    lat: 1.1355, lng: 104.0190,
    facilities: ["Treatment rooms", "Herbal tea lounge"],
    rating: 4.8,
    reviews: 890,
    hours: "10:00 – 22:00 WIB",
    entryFee: "Pay per treatment",
    photo: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=700&q=80&auto=format&fit=crop",
  },
];

// Journey packages reference destinations by id. Each package is a realistic
// mixed day — tourists rarely want a whole day of only one thing.
export type JourneyTheme =
  | "heritage"
  | "nature-relax"
  | "shop-treat"
  | "island-explorer";

export type Terminal =
  | "batam-centre"
  | "harbour-bay"
  | "sekupang"
  | "nongsapura";

export interface TerminalInfo {
  id: Terminal;
  name: string;
  lat: number;
  lng: number;
  area: string;
}

export const TERMINALS: TerminalInfo[] = [
  { id: "batam-centre", name: "Batam Centre", lat: 1.1205, lng: 104.0525, area: "Batam Centre" },
  { id: "harbour-bay",  name: "Harbour Bay",  lat: 1.1466, lng: 104.0150, area: "Harbour Bay" },
  { id: "sekupang",     name: "Sekupang",     lat: 1.1350, lng: 103.9400, area: "Sekupang" },
  { id: "nongsapura",   name: "Nongsapura",   lat: 1.2050, lng: 104.0950, area: "Nongsapura" },
];

export const DEFAULT_TERMINAL: Terminal = "batam-centre";

export const THEME_DESTINATIONS: Record<JourneyTheme, number[]> = {
  heritage:        [5, 7, 12],       // Vihara + Nagoya Hill + Spa
  "nature-relax":  [3, 2, 12],       // Mangrove + Nongsa Beach + Spa
  "shop-treat":    [8, 7, 12],       // Mega Mall + Nagoya Hill + Spa
  "island-explorer": [1, 2, 5, 6],   // Barelang + Nongsa + Vihara + Mosque
};

// Great-circle distance, km. Batam-scale, so a sphere is accurate enough.
// Shared by the Near Me sort and any future zone math.
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

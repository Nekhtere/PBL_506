// Shared ferry route data — used by both the standalone ferry section and the
// bundled ferry+tour packages. Keeps schedules, fares and terminal facts in one
// place so bundle calculations never drift from the ferry section.

export type RouteTheme = {
  gradient: string;
  accent: string;
  badgeKey: string;
  shortFrom: string;
};

export const ROUTE_THEMES: Record<string, RouteTheme> = {
  "harbourfront-batamcentre": {
    gradient: "from-blue-500/10 to-sky-500/5",
    accent: "text-blue-600",
    badgeKey: "ferry.badge.most",
    shortFrom: "HarbourFront",
  },
  "harbourfront-harbourbay": {
    gradient: "from-amber-500/10 to-orange-500/5",
    accent: "text-amber-600",
    badgeKey: "ferry.badge.resort",
    shortFrom: "HarbourFront",
  },
  "harbourfront-sekupang": {
    gradient: "from-emerald-500/10 to-teal-500/5",
    accent: "text-emerald-600",
    badgeKey: "ferry.badge.quiet",
    shortFrom: "HarbourFront",
  },
  "tanahmera-nongsapura": {
    gradient: "from-violet-500/10 to-fuchsia-500/5",
    accent: "text-violet-600",
    badgeKey: "ferry.badge.fastest",
    shortFrom: "Tanah Merah",
  },
};

export type FerryRoute = {
  id: string;
  from: string;
  to: string;
  operators: string;
  crossing: string;
  priceNum: number;
  returnPriceNum: number;
  noteKey: string;
  schedules: string[];
};

export const FERRY_ROUTES: FerryRoute[] = [
  {
    id: "harbourfront-batamcentre",
    from: "HarbourFront Centre, Singapore",
    to: "Batam Centre",
    operators: "BatamFast · Majestic Fast Ferry · Sindo Ferry",
    crossing: "~45 min",
    priceNum: 43,
    returnPriceNum: 76,
    noteKey: "ferry.note.batamcentre",
    schedules: ["08:00", "09:30", "11:00", "13:00", "15:00", "17:00", "19:00"],
  },
  {
    id: "harbourfront-harbourbay",
    from: "HarbourFront Centre, Singapore",
    to: "Harbour Bay",
    operators: "BatamFast · Majestic Fast Ferry",
    crossing: "~45 min",
    priceNum: 43,
    returnPriceNum: 76,
    noteKey: "ferry.note.harbourbay",
    schedules: ["08:30", "10:00", "12:00", "14:00", "16:00", "18:00"],
  },
  {
    id: "harbourfront-sekupang",
    from: "HarbourFront Centre, Singapore",
    to: "Sekupang",
    operators: "BatamFast · Sindo Ferry",
    crossing: "~50 min",
    priceNum: 43,
    returnPriceNum: 76,
    noteKey: "ferry.note.sekupang",
    schedules: ["09:00", "11:00", "14:00", "17:00"],
  },
  {
    id: "tanahmera-nongsapura",
    from: "Tanah Merah Ferry Terminal, Singapore",
    to: "Nongsapura",
    operators: "BatamFast",
    crossing: "~35 min",
    priceNum: 43,
    returnPriceNum: 76,
    noteKey: "ferry.note.nongsapura",
    schedules: ["08:00", "10:30", "13:00", "15:30", "18:00"],
  },
];

export const FARE_INCLUDES = { ticket: 23, sgDepartureFee: 10, batamDepartureFee: 10 };

export const NATIONALITIES = [
  "Singapore",
  "Indonesia",
  "Malaysia",
  "India",
  "China",
  "Philippines",
  "Vietnam",
  "Thailand",
  "Australia",
  "United Kingdom",
  "United States",
  "Japan",
  "South Korea",
  "Other",
] as const;

export const VOA_FREE = new Set(["Singapore"]);

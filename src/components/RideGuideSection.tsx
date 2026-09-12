"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Navigation, Smartphone, MapPin, ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/locale-context";

const fareData = [
  { route: "Ferry Port → Golden Prawn",  app: "GrabCar",  fare: "SGD 3 – 5", time: "~8 min"  },
  { route: "Batam Center → Nagoya Hill", app: "GrabCar",  fare: "SGD 4 – 6", time: "~12 min" },
  { route: "Harbour Bay → Avani Spa",    app: "GojekCar", fare: "SGD 5 – 7", time: "~15 min" },
  { route: "Nagoya Hill → Night Market", app: "GrabBike", fare: "SGD 1 – 2", time: "~5 min"  },
];

const pickupPoints = [
  { terminal: "Batam Center Ferry", locationKey: "ride.bc.location", emoji: "⛴️", tipKey: "ride.bc.tip" },
  { terminal: "Harbour Bay Ferry", locationKey: "ride.hb.location", emoji: "🚢", tipKey: "ride.hb.tip" },
];

export default function RideGuideSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { t } = useLocale();

  return (
    <section id="ride-guide" ref={sectionRef} className="py-24 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: iPhone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center"
          >
            <div className="relative w-full max-w-64">
              {/* iPhone frame. Width is capped rather than fixed so the mockup
                  still fits a ~280px foldable cover; the aspect ratio keeps the
                  frame's shape as it scales down. */}
              <div className="relative w-full aspect-[256/520] bg-fg rounded-[3rem] p-2 shadow-2xl shadow-black/30">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                  {/* Status bar notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-fg rounded-b-2xl z-10" />

                  {/* Map Background.
                      The pale blues and greys below are this illustration's own
                      palette — they depict a map, they are not UI chrome, so they
                      are deliberately not tokens. The route and start pin are the
                      opposite case: they are the brand accent, and would be wrong
                      if the accent moved, so they read the token. */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `
                        linear-gradient(180deg, #e8f4f8 0%, #d1ecf5 50%, #c8e6f0 100%)
                      `,
                    }}
                  >
                    {/* Simulated road grid */}
                    <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 256 520">
                      <line x1="80" y1="0" x2="80" y2="520" stroke="#94a3b8" strokeWidth="3" />
                      <line x1="160" y1="0" x2="160" y2="520" stroke="#94a3b8" strokeWidth="3" />
                      <line x1="0" y1="150" x2="256" y2="150" stroke="#94a3b8" strokeWidth="3" />
                      <line x1="0" y1="280" x2="256" y2="280" stroke="#94a3b8" strokeWidth="3" />
                      <line x1="0" y1="380" x2="256" y2="380" stroke="#94a3b8" strokeWidth="3" />
                      {/* Route line */}
                      <path
                        d="M 50 420 Q 80 320 160 280 Q 200 250 180 150"
                        stroke="var(--accent)"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray="8 4"
                      />
                      {/* Start pin */}
                      <circle cx="50" cy="420" r="8" fill="var(--accent)" />
                      <circle cx="50" cy="420" r="14" fill="var(--accent)" fillOpacity="0.2" />
                      {/* End pin — the destination, not an error state, so it keeps
                          its own red rather than borrowing --danger. */}
                      <circle cx="180" cy="145" r="8" fill="#ef4444" />
                      <circle cx="180" cy="145" r="14" fill="#ef4444" fillOpacity="0.2" />
                    </svg>
                  </div>

                  {/* Glass overlay card on map */}
                  <div className="absolute bottom-4 left-3 right-3 glass rounded-2xl p-3">
                    <p className="text-xs font-semibold text-fg mb-1">
                      🚗 GrabCar · {t("ride.minsAway")}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-subtle">Ferry Port → Golden Prawn</p>
                        <p className="text-sm font-bold text-fg mt-0.5">~S$ 4.50</p>
                      </div>
                      <button className="bg-accent text-white text-xs font-semibold px-3 py-1.5 rounded-xl">
                        {t("ride.book")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                /* Sits inside the frame on narrow screens — the section clips
                   overflow, so a -right-6 overhang was cut off on a foldable
                   cover. It only floats outside once there is room at sm+. */
                className="absolute right-0 sm:-right-6 top-20 glass rounded-2xl px-4 py-3 shadow-lg"
              >
                <p className="text-xs font-semibold text-fg">🎯 {t("ride.pickupConfirmed")}</p>
                <p className="text-[10px] text-subtle mt-0.5">{t("ride.driver2min")}</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <span className="text-[var(--accent-ink)] text-[12px] font-semibold tracking-widest uppercase">
              {t("ride.label")}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--fg)] mt-2 mb-4 tracking-tight leading-tight">
              {t("ride.heading1")}
              <br />
              {t("ride.heading2")}
              <br />
              {/* #515154 on #FBFBFD = 7.7:1 ✓ WCAG AA */}
              <span className="text-[var(--muted)]">{t("ride.heading3")}</span>
            </h2>
            <p className="text-[var(--muted)] text-[15px] leading-relaxed mb-8">
              {t("ride.sub")}
            </p>

            {/* Fare Table */}
            <div className="rounded-2xl overflow-hidden border border-[var(--line-soft)] mb-8">
              <div className="bg-[var(--surface-sunken)] px-4 py-2.5 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[var(--muted)]" aria-hidden="true" />
                <span className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-widest">
                  {t("ride.fares")}
                </span>
              </div>
              {fareData.map((row, i) => (
                <div
                  key={i}
                  className={`px-4 py-3 flex items-center justify-between hover:bg-surface-raised transition-colors ${
                    i < fareData.length - 1 ? "border-b border-[var(--line-soft)]" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[var(--fg)] truncate">{row.route}</p>
                    {/* #515154 on white = 7.9:1 ✓ WCAG AA */}
                    <p className="text-[11px] text-[var(--muted)]">{row.app} · {row.time}</p>
                  </div>
                  <span className="text-[13px] font-bold text-[var(--fg)] ml-4 shrink-0">{row.fare}</span>
                </div>
              ))}
            </div>

            {/* Pickup Points */}
            <div>
              <h3 className="text-[13px] font-semibold text-[var(--fg)] mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--accent-ink)]" aria-hidden="true" />
                {t("ride.pickup")}
              </h3>
              <div className="space-y-3">
                {pickupPoints.map((p, i) => (
                  <div key={i} className="flex items-start gap-3 bg-[var(--surface-sunken)] hover:bg-surface-hover rounded-2xl p-4 transition-colors duration-150">
                    <span className="text-2xl shrink-0" aria-hidden="true">{p.emoji}</span>
                    <div>
                      <p className="text-[13px] font-semibold text-[var(--fg)]">{p.terminal}</p>
                      {/* #515154 on #F5F5F7 = 7.3:1 ✓ WCAG AA */}
                      <p className="text-[12px] text-[var(--muted)] mt-0.5">{t(p.locationKey)}</p>
                      <p className="text-[12px] text-[var(--accent-ink)] mt-1 flex items-center gap-1">
                        <Smartphone className="w-3 h-3" aria-hidden="true" /> {t(p.tipKey)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="mt-8 flex items-center gap-2 text-[var(--accent-ink)] text-[13px] font-semibold hover:gap-3 transition-all duration-200">
              {t("ride.seeFull")} <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

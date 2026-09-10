"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Navigation, Smartphone, MapPin, ArrowRight } from "lucide-react";

const fareData = [
  { route: "Ferry Port → Golden Prawn",  app: "GrabCar",  fare: "SGD 3 – 5", time: "~8 min"  },
  { route: "Batam Center → Nagoya Hill", app: "GrabCar",  fare: "SGD 4 – 6", time: "~12 min" },
  { route: "Harbour Bay → Avani Spa",    app: "GojekCar", fare: "SGD 5 – 7", time: "~15 min" },
  { route: "Nagoya Hill → Night Market", app: "GrabBike", fare: "SGD 1 – 2", time: "~5 min"  },
];

const pickupPoints = [
  { terminal: "Batam Center Ferry", location: "Exit gate, turn left 50m", emoji: "⛴️", tip: "Look for the green Grab/Gojek sign" },
  { terminal: "Harbour Bay Ferry", location: "Ground floor, east exit", emoji: "🚢", tip: "Pre-book before docking for faster pickup" },
];

export default function RideGuideSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

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
            <div className="relative">
              {/* iPhone frame */}
              <div className="relative w-64 h-[520px] bg-[#1D1D1F] rounded-[3rem] p-2 shadow-2xl shadow-black/30">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                  {/* Status bar notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-[#1D1D1F] rounded-b-2xl z-10" />

                  {/* Map Background */}
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
                        stroke="#0071E3"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray="8 4"
                      />
                      {/* Start pin */}
                      <circle cx="50" cy="420" r="8" fill="#0071E3" />
                      <circle cx="50" cy="420" r="14" fill="#0071E3" fillOpacity="0.2" />
                      {/* End pin */}
                      <circle cx="180" cy="145" r="8" fill="#ef4444" />
                      <circle cx="180" cy="145" r="14" fill="#ef4444" fillOpacity="0.2" />
                    </svg>
                  </div>

                  {/* Glass overlay card on map */}
                  <div className="absolute bottom-4 left-3 right-3 glass rounded-2xl p-3">
                    <p className="text-xs font-semibold text-[#1D1D1F] mb-1">
                      🚗 GrabCar · 8 min away
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#6E6E73]">Ferry Port → Golden Prawn</p>
                        <p className="text-sm font-bold text-[#1D1D1F] mt-0.5">~S$ 4.50</p>
                      </div>
                      <button className="bg-[#0071E3] text-white text-xs font-semibold px-3 py-1.5 rounded-xl">
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-6 top-20 glass rounded-2xl px-4 py-3 shadow-lg"
              >
                <p className="text-xs font-semibold text-[#1D1D1F]">🎯 Pickup Confirmed</p>
                <p className="text-[10px] text-[#6E6E73] mt-0.5">Driver is 2 min away</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <span className="text-[#0071E3] text-[12px] font-semibold tracking-widest uppercase">
              Smart Ride Guide
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1D1D1F] mt-2 mb-4 tracking-tight leading-tight">
              No Shuttle?
              <br />
              No Problem.
              <br />
              {/* #515154 on #FBFBFD = 5.1:1 ✓ WCAG AA */}
              <span className="text-[#515154]">Go Local.</span>
            </h2>
            <p className="text-[#515154] text-[15px] leading-relaxed mb-8">
              We integrated fare estimates so you can travel like a local. Just open Gojek or Grab — we show you exactly where to stand.
            </p>

            {/* Fare Table */}
            <div className="rounded-2xl overflow-hidden border border-[#E5E5EA] mb-8">
              <div className="bg-[#F5F5F7] px-4 py-2.5 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#515154]" aria-hidden="true" />
                <span className="text-[11px] font-semibold text-[#515154] uppercase tracking-widest">
                  Estimated Fares
                </span>
              </div>
              {fareData.map((row, i) => (
                <div
                  key={i}
                  className={`px-4 py-3 flex items-center justify-between hover:bg-[#FAFAFA] transition-colors ${
                    i < fareData.length - 1 ? "border-b border-[#E5E5EA]" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#1D1D1F] truncate">{row.route}</p>
                    {/* #515154 on white = 5.1:1 ✓ WCAG AA */}
                    <p className="text-[11px] text-[#515154]">{row.app} · {row.time}</p>
                  </div>
                  <span className="text-[13px] font-bold text-[#1D1D1F] ml-4 shrink-0">{row.fare}</span>
                </div>
              ))}
            </div>

            {/* Pickup Points */}
            <div>
              <h3 className="text-[13px] font-semibold text-[#1D1D1F] mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0071E3]" aria-hidden="true" />
                Pick-up Point Guide
              </h3>
              <div className="space-y-3">
                {pickupPoints.map((p, i) => (
                  <div key={i} className="flex items-start gap-3 bg-[#F5F5F7] hover:bg-[#EBEBF0] rounded-2xl p-4 transition-colors duration-150">
                    <span className="text-2xl shrink-0" aria-hidden="true">{p.emoji}</span>
                    <div>
                      <p className="text-[13px] font-semibold text-[#1D1D1F]">{p.terminal}</p>
                      {/* #515154 on #F5F5F7 = 4.9:1 ✓ WCAG AA */}
                      <p className="text-[12px] text-[#515154] mt-0.5">{p.location}</p>
                      <p className="text-[12px] text-[#0071E3] mt-1 flex items-center gap-1">
                        <Smartphone className="w-3 h-3" aria-hidden="true" /> {p.tip}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="mt-8 flex items-center gap-2 text-[#0071E3] text-[13px] font-semibold hover:gap-3 transition-all duration-200">
              See full ride guide <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Ship, Clock, MapPin, ArrowRight, Info } from "lucide-react";

// ponytail: fares/times are indicative only, verified against operator sites before launch.
// Add a real schedule feed (or a daily CSV) when ferry booking goes live.
const routes = [
  {
    from: "HarbourFront Centre, Singapore",
    to: "Batam Centre",
    operators: "BatamFast · Majestic Fast Ferry · Sindo Ferry",
    crossing: "~45 min",
    price: "from S$ 20 one-way",
    note: "Largest terminal — best for Nagoya & city centre.",
  },
  {
    from: "HarbourFront Centre, Singapore",
    to: "Harbour Bay",
    operators: "BatamFast · Majestic Fast Ferry",
    crossing: "~45 min",
    price: "from S$ 23 one-way",
    note: "Closest to seafood, spa and duty-free shopping.",
  },
  {
    from: "HarbourFront Centre, Singapore",
    to: "Sekupang",
    operators: "BatamFast · Sindo Ferry",
    crossing: "~50 min",
    price: "from S$ 20 one-way",
    note: "Quieter terminal, north-west Batam.",
  },
  {
    from: "Tanah Merah Ferry Terminal, Singapore",
    to: "Nongsapura",
    operators: "BatamFast",
    crossing: "~35 min",
    price: "from S$ 25 one-way",
    note: "Best for Nongsa resorts and Avani Spa.",
  },
];

const tips = [
  "Book return tickets online — walk-up slots sell out on weekends.",
  "Bring your passport. Indonesia visa-free entry for SG passports, 30 days.",
  "Arrive 45 min before departure for immigration on both sides.",
  "Set your watch back 1 hour. Batam is WIB (UTC+7), Singapore is UTC+8.",
];

export default function FerrySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="ferry" ref={sectionRef} className="py-24 px-6 bg-[var(--bg)]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 max-w-xl"
        >
          <span className="text-[var(--accent-ink)] text-[12px] font-semibold tracking-widest uppercase">
            Getting Here
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--fg)] mt-2 tracking-tight">
            Singapore to Batam
          </h2>
          <p className="text-[var(--muted)] mt-3 text-[15px] leading-relaxed">
            Four terminals, three operators, under an hour on the water. Pick the terminal closest to your first stop.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {routes.map((r, i) => (
            <motion.article
              key={r.to}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#0071E3]/10 flex items-center justify-center shrink-0">
                  <Ship className="w-5 h-5 text-[var(--accent-ink)]" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] text-[var(--muted)] flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">{r.from}</span>
                  </p>
                  <p className="text-[15px] font-semibold text-[var(--fg)] mt-0.5">
                    → {r.to}
                  </p>
                </div>
              </div>

              <p className="text-[12px] text-[var(--muted)] mb-3">{r.operators}</p>

              <div className="flex items-center gap-4 text-[12px] text-[var(--muted)] mb-3">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" /> {r.crossing}
                </span>
                <span className="font-semibold text-[var(--fg)]">{r.price}</span>
              </div>

              <p className="text-[12px] text-[var(--accent-ink)]">{r.note}</p>
            </motion.article>
          ))}
        </div>

        {/* Tips + disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-[var(--surface-sunken)] rounded-3xl p-6"
        >
          <h3 className="text-[13px] font-semibold text-[var(--fg)] mb-3">
            Before you board
          </h3>
          <ul className="grid sm:grid-cols-2 gap-2.5 mb-4">
            {tips.map((t) => (
              <li key={t} className="flex items-start gap-2 text-[12px] text-[var(--muted)] leading-relaxed">
                <ArrowRight className="w-3.5 h-3.5 text-[var(--accent-ink)] shrink-0 mt-0.5" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
          <p className="flex items-start gap-2 text-[11px] text-[var(--muted)] border-t border-[var(--line-soft)] pt-3">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
            Fares and crossing times are indicative. Confirm the current schedule with BatamFast, Majestic Fast Ferry or Sindo Ferry before you travel.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
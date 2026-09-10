"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ShoppingCart, QrCode, Smile } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: ShoppingCart,
    title: "Buy in SGD",
    description:
      "Browse curated merchant deals, pick your E-Cash vouchers, and checkout securely in Singapore Dollars. No hidden fees, no currency hassle.",
    detail: "Multi-currency engine converts in real-time",
    color: "from-blue-500 to-cyan-500",
    accent: "#0071E3",
  },
  {
    step: "02",
    icon: QrCode,
    title: "Scan QR Code",
    description:
      "Your voucher is a dynamic QR code sent instantly to your device. Show it to the merchant — one tap, done.",
    detail: "Dynamic QR · One-time use · Tamper-proof",
    color: "from-purple-500 to-pink-500",
    accent: "#7c3aed",
  },
  {
    step: "03",
    icon: Smile,
    title: "Enjoy Batam",
    description:
      "The merchant's admin scans your QR via our In-Browser Scanner. Redemption confirmed instantly. No app install needed on either side.",
    detail: "In-Browser Scanner for merchants",
    color: "from-emerald-500 to-teal-500",
    accent: "#059669",
  },
];

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" ref={sectionRef} className="py-24 px-6 bg-[#1D1D1F]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-[#0071E3] text-[12px] font-semibold tracking-widest uppercase">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-2 tracking-tight">
            Three Steps.
            <br />
            {/* white/65 on #1D1D1F = high contrast ✓ */}
            <span className="text-white/65">Pure Simplicity.</span>
          </h2>
          <p className="text-white/65 mt-4 text-[15px] max-w-md mx-auto leading-relaxed">
            Powered by multi-currency engine and dynamic QR technology. Designed for tourists, built for merchants.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-px bg-white/10" />

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 32 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="relative"
                >
                  {/* Step number */}
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shrink-0 shadow-lg`}
                    >
                      <Icon className="w-6 h-6 text-white" strokeWidth={1.8} />
                    </div>
                    <span className="text-4xl font-black text-white/10">{step.step}</span>
                  </div>

                  <h3 className="text-[18px] font-bold text-white mb-3">{step.title}</h3>
                  {/* white/70 on #1D1D1F = high contrast ✓ */}
                  <p className="text-white/70 text-[14px] leading-relaxed mb-4">{step.description}</p>

                  {/* Detail pill */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: step.accent }}
                      aria-hidden="true"
                    />
                    <span className="text-[12px] text-white/70">{step.detail}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom visual: QR mockup */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 flex justify-center"
        >
          <div className="glass rounded-3xl px-10 py-8 text-center max-w-sm">
            {/* Fake QR grid */}
            <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-white p-2 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Finder patterns */}
                <rect x="5" y="5" width="30" height="30" rx="4" fill="#1D1D1F" />
                <rect x="10" y="10" width="20" height="20" rx="2" fill="white" />
                <rect x="14" y="14" width="12" height="12" rx="1" fill="#1D1D1F" />
                <rect x="65" y="5" width="30" height="30" rx="4" fill="#1D1D1F" />
                <rect x="70" y="10" width="20" height="20" rx="2" fill="white" />
                <rect x="74" y="14" width="12" height="12" rx="1" fill="#1D1D1F" />
                <rect x="5" y="65" width="30" height="30" rx="4" fill="#1D1D1F" />
                <rect x="10" y="70" width="20" height="20" rx="2" fill="white" />
                <rect x="14" y="74" width="12" height="12" rx="1" fill="#1D1D1F" />
                {/* Data dots */}
                <rect x="42" y="5" width="8" height="8" rx="2" fill="#1D1D1F" />
                <rect x="52" y="5" width="8" height="8" rx="2" fill="#1D1D1F" />
                <rect x="42" y="15" width="8" height="8" rx="2" fill="#1D1D1F" />
                <rect x="42" y="42" width="8" height="8" rx="2" fill="#0071E3" />
                <rect x="52" y="42" width="8" height="8" rx="2" fill="#0071E3" />
                <rect x="62" y="42" width="8" height="8" rx="2" fill="#0071E3" />
                <rect x="42" y="52" width="8" height="8" rx="2" fill="#1D1D1F" />
                <rect x="62" y="52" width="8" height="8" rx="2" fill="#1D1D1F" />
                <rect x="52" y="62" width="8" height="8" rx="2" fill="#1D1D1F" />
                <rect x="72" y="42" width="8" height="8" rx="2" fill="#1D1D1F" />
                <rect x="82" y="52" width="8" height="8" rx="2" fill="#1D1D1F" />
                <rect x="72" y="62" width="8" height="8" rx="2" fill="#1D1D1F" />
                <rect x="82" y="72" width="8" height="8" rx="2" fill="#1D1D1F" />
                <rect x="42" y="72" width="8" height="8" rx="2" fill="#1D1D1F" />
                <rect x="52" y="82" width="8" height="8" rx="2" fill="#1D1D1F" />
              </svg>
            </div>
            <p className="text-white font-semibold text-[13px]">Golden Prawn Seafood</p>
            {/* white/70 on dark = high contrast ✓ */}
            <p className="text-white/70 text-[12px] mt-1">E-Cash Voucher · S$ 14.00</p>
            <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium">Ready to Redeem</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

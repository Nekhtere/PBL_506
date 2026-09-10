"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ShoppingCart, QrCode, Smile } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: ShoppingCart,
    title: "Buy in SGD",
    description: "Choose a curated deal and pay securely in Singapore Dollars.",
  },
  {
    step: "02",
    icon: QrCode,
    title: "Scan QR Code",
    description: "Receive your voucher instantly and show its QR code at checkout.",
  },
  {
    step: "03",
    icon: Smile,
    title: "Enjoy Batam",
    description: "Merchant confirms redemption in seconds. No app download needed.",
  },
];

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" ref={sectionRef} className="bg-[#F5F5F7] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-xl text-center"
        >
          <span className="text-[12px] font-semibold uppercase tracking-widest text-[#0071E3]">
            How It Works
          </span>
          <h2 className="mt-2 text-4xl font-bold tracking-tight text-[#1D1D1F] md:text-5xl">
            Three Steps.
            <br />
            <span className="text-[#515154]">Pure Simplicity.</span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#515154]">
            From payment to redemption, every step stays effortless.
          </p>
        </motion.div>

        <div className="grid divide-y divide-[#E5E5EA] border-y border-[#E5E5EA] md:grid-cols-3 md:divide-x md:divide-y-0">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.article
                key={step.step}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: index * 0.12 }}
                className="px-2 py-8 md:px-8"
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D2D2D7] bg-white text-[13px] font-semibold text-[#0071E3]">
                    {step.step}
                  </span>
                  <Icon className="h-5 w-5 text-[#515154]" strokeWidth={1.6} aria-hidden="true" />
                </div>
                <h3 className="text-[18px] font-semibold text-[#1D1D1F]">{step.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#515154]">{step.description}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

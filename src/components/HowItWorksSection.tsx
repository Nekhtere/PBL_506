"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ShoppingCart, QrCode, Smile } from "lucide-react";
import { useLocale } from "@/lib/locale-context";

const steps = [
  { step: "01", icon: ShoppingCart, titleKey: "how.step1.title", descKey: "how.step1.desc" },
  { step: "02", icon: QrCode, titleKey: "how.step2.title", descKey: "how.step2.desc" },
  { step: "03", icon: Smile, titleKey: "how.step3.title", descKey: "how.step3.desc" },
];

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { t } = useLocale();

  return (
    <section id="how-it-works" ref={sectionRef} className="bg-[var(--surface-sunken)] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-xl text-center"
        >
          <span className="text-[12px] font-semibold uppercase tracking-widest text-[var(--accent-ink)]">
            {t("how.label")}
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--fg)] sm:text-4xl md:text-5xl">
            {t("how.heading1")}
            <br />
            <span className="text-[var(--muted)]">{t("how.heading2")}</span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
            {t("how.sub")}
          </p>
        </motion.div>

        <div className="grid divide-y divide-[var(--line-soft)] border-y border-[var(--line-soft)] md:grid-cols-3 md:divide-x md:divide-y-0">
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
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong bg-[var(--surface)] text-[13px] font-semibold text-[var(--accent-ink)]">
                    {step.step}
                  </span>
                  <Icon className="h-5 w-5 text-[var(--muted)]" strokeWidth={1.6} aria-hidden="true" />
                </div>
                <h3 className="text-[18px] font-semibold text-[var(--fg)]">{t(step.titleKey)}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">{t(step.descKey)}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

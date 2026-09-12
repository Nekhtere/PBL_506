"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLocale } from "@/lib/locale-context";

// FAQ content is keyed so both locales stay in lockstep — adding a question
// means adding one entry here and its two strings in locale-context.
const FAQ_KEYS = [
  "how",
  "currency",
  "fees",
  "passport",
  "visa",
  "delay",
  "refund",
  "language",
  "meals",
] as const;

function FaqItem({ faqKey, open, onToggle }: {
  faqKey: (typeof FAQ_KEYS)[number];
  open: boolean;
  onToggle: () => void;
}) {
  const { t } = useLocale();
  return (
    <div className="bg-surface border border-line rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-surface-sunken transition-colors"
      >
        <span className="text-[14px] font-semibold text-fg">{t(`faq.q.${faqKey}`)}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-[13px] text-muted leading-relaxed border-t border-line-soft pt-3">
              {t(`faq.a.${faqKey}`)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { t } = useLocale();
  const [openKey, setOpenKey] = useState<string | null>(FAQ_KEYS[0]);

  return (
    <section id="faq" ref={sectionRef} className="py-16 sm:py-24 px-4 sm:px-6 bg-[var(--bg)]">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="text-accent-ink text-[12px] font-semibold tracking-widest uppercase">
            {t("faq.label")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-fg mt-2 tracking-tight">
            {t("faq.heading")}
          </h2>
          <p className="text-muted mt-4 text-[15px] max-w-md mx-auto leading-relaxed">
            {t("faq.sub")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-3"
        >
          {FAQ_KEYS.map((key) => (
            <FaqItem
              key={key}
              faqKey={key}
              open={openKey === key}
              onToggle={() => setOpenKey(openKey === key ? null : key)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

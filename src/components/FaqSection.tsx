"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronDown, ShoppingCart, QrCode, Smile } from "lucide-react";
import { useLocale } from "@/lib/locale-context";

// One section, two halves: the three-step flow first (how it works), then the
// questions it doesn't answer (FAQ). They used to be separate sections with a
// duplicated message — step 2/3 said "you get a QR e-ticket", which is exactly
// what FAQ question 1 answered. Merging them removed the repetition and pulled
// the page's closing content up closer to the fold.
//
// FAQ content is keyed so both locales stay in lockstep — adding a question
// means adding one entry here and its two strings in locale-context.
const STEPS = [
  { step: "01", icon: ShoppingCart, titleKey: "how.step1.title", descKey: "how.step1.desc" },
  { step: "02", icon: QrCode, titleKey: "how.step2.title", descKey: "how.step2.desc" },
  { step: "03", icon: Smile, titleKey: "how.step3.title", descKey: "how.step3.desc" },
];

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
    // The anchor stays #faq — it's the section's destination in the nav, and
    // the steps above it are the intro to the same block, not a separate stop.
    <section id="faq" ref={sectionRef} className="bg-[var(--surface-sunken)] px-4 sm:px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">

        {/* ── Half one: the three-step flow ── */}
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
          {STEPS.map((step, index) => {
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

        {/* ── Half two: the questions the steps don't answer ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-16 sm:mt-20 mb-8 max-w-3xl text-center"
        >
          <span className="text-accent-ink text-[12px] font-semibold tracking-widest uppercase">
            {t("faq.label")}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-fg mt-2 tracking-tight">
            {t("faq.heading")}
          </h2>
          <p className="text-muted mt-3 text-[14px] max-w-md mx-auto leading-relaxed">
            {t("faq.sub")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto max-w-3xl space-y-3"
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

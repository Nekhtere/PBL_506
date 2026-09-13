"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useLocale } from "@/lib/locale-context";

// Ephemeral sign-out confirmation. The signout route redirects to
// /?signedout=1; this banner reads that on mount, shows once, then
// strips the param so a refresh doesn't re-fire it.
//
// The param is read from window.location rather than useSearchParams to
// dodge the Suspense boundary that hook forces in a statically rendered
// layout — nothing else on the page needs it, so wrapping would be noise.

export default function SignOutNotice() {
  const { t } = useLocale();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    if (shownRef.current) return;
    if (!window.location.search.includes("signedout=1")) return;
    shownRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(true);

    // Drop the param from the URL without a history entry so the banner
    // can't be re-triggered by back/refresh.
    router.replace("/", { scroll: false });

    const hide = window.setTimeout(() => setShow(false), 4000);
    return () => window.clearTimeout(hide);
  }, [router]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ type: "spring", stiffness: 360, damping: 30 }}
          role="status"
          aria-live="polite"
          className="fixed top-3 inset-x-0 z-[80] flex justify-center px-4 pointer-events-none"
        >
          <div className="flex items-center gap-3 bg-[var(--fg)] text-white text-[13px] font-semibold px-4 py-2.5 rounded-2xl shadow-xl shadow-black/20">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 18, delay: 0.05 }}
              className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500"
            >
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} aria-hidden="true" />
            </motion.span>
            {t("auth.signedOut")}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

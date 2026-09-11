"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function DetailModal({ open, onClose, children }: DetailModalProps) {
  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/45 p-3 sm:p-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.section
            className="card-soft scrollbar-hide relative max-h-full w-full max-w-full sm:max-w-5xl overflow-y-auto rounded-none sm:rounded-[28px] bg-white"
            role="dialog"
            aria-modal="true"
            aria-label="Details"
            initial={{ opacity: 0, scale: 0.94, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 28 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="glass absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-fg transition-transform hover:scale-105"
              onClick={onClose}
              aria-label="Close details"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            {children}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

// Auto-rotating index for the two slideshows (hero background, Near Me
// spotlight). Honours WCAG 2.2.2: it never starts under prefers-reduced-motion,
// it pauses while `paused` is set — by the explicit button the caller renders —
// and it pauses while `hold` is set, which callers wire to hover/focus so the
// rotation stops the moment a pointer or keyboard user engages with it.
// Resuming restarts the full interval rather than firing immediately.
export function useRotator(count: number, ms = 5000, hold = false) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion() ?? false;
  const running = !paused && !hold && !reduced && count > 1;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setIndex((c) => (c + 1) % count), ms);
    return () => clearInterval(t);
  }, [running, count, ms, hold]);

  return { index, setIndex, paused, setPaused, reduced };
}

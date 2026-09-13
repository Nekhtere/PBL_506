// What each product already contains — the vocabulary behind the cart's
// double-booking warning: a clash is any pair where one item's coverage is a
// strict superset of another's. With the current catalogue (tours cover the
// driver, ferry tickets cover the crossing) no pair can clash — tour + ferry
// is a sensible pairing, tour + tour is two different days — but the check
// stays so a future multi-cover product can't silently double-charge.

import type { CartItem } from "@/lib/cart";

export type Covered = "ferry" | "driver";

export type CoverageClash = {
  /** The thing paid for twice, e.g. "driver". */
  covered: Covered;
  /** Item that already includes it. */
  includes: string;
  /** Item that charges for it again. */
  redundant: string;
};

const isSuperset = (a: Covered[], b: Covered[]) =>
  a.length > b.length && b.every((x) => a.includes(x));

export function findCoverageClashes(items: CartItem[]): CoverageClash[] {
  const clashes: CoverageClash[] = [];
  for (const a of items) {
    for (const b of items) {
      if (a.id === b.id) continue;
      const ca = a.covers ?? [];
      const cb = b.covers ?? [];
      if (!isSuperset(ca, cb)) continue;
      // The overlap is what the smaller item is charging for a second time.
      for (const covered of cb) {
        clashes.push({ covered, includes: a.name, redundant: b.name });
      }
    }
  }
  return clashes;
}

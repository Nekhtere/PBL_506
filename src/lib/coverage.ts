// What each product already contains — the vocabulary behind the cart's
// double-booking warning.
//
// The problem it solves: a bundle already includes its own return ferry AND a
// car+driver. Adding a day tour (car+driver) or a ferry ticket alongside it
// therefore charges the buyer twice for the same thing. The bundle is the
// all-in-one, so a clash is any pair where one item's coverage is a strict
// superset of another's.
//
// That rule is deliberately narrow, and it falls out of the data rather than a
// list of special cases:
//   bundle + tour   → bundle ⊃ tour  → clash on "driver"
//   bundle + ferry  → bundle ⊃ ferry → clash on "ferry"
//   tour + ferry    → neither is a superset → no clash (a sensible pairing)
//   tour + tour     → equal coverage → no clash (two different days)

import type { CartItem } from "@/lib/cart";

export type Covered = "ferry" | "driver";

export const COVERS: Record<"bundle" | "tour" | "ferry", Covered[]> = {
  bundle: ["ferry", "driver"],
  tour: ["driver"],
  ferry: ["ferry"],
};

export type CoverageClash = {
  /** The thing paid for twice, e.g. "driver". */
  covered: Covered;
  /** Item that already includes it — the bundle, normally. */
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

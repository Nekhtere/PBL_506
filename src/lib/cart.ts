// The cart: its shape, and the sessionStorage handoff that carries it between
// routes.
//
// These types used to live in components/Navbar.tsx, which was fine while the
// navbar was the only consumer. They moved here when the cart became shared
// state (see lib/cart-context.tsx): lib/store.ts and lib/coverage.ts both need
// CartItem, and importing it from a component made `lib` depend on `components`.
//
// The storage half: the cart is per-tab and short-lived, so sessionStorage is
// the right home for it. Orders deliberately do NOT live here — a ticket has to
// survive an emailed link, a QR scan and a different device, none of which
// sessionStorage survives. Those live on the server; see lib/store.ts.

export const CART_STORAGE_KEY = "bsd:checkout-cart";

/** Passenger details captured by the ferry booking form. Carried through the
    cart to checkout so the issued e-ticket can print the real crossing. */
export interface FerryBooking {
  passenger: string;
  passportNumber: string;
  passportExpiry: string;
  nationality: string;
  routeFrom: string;
  routeTo: string;
  travelDate: string;
  schedule: string;
  tripType: "one-way" | "return";
}

export interface CartItem {
  id: string;
  name: string;
  price: string;
  subtitle?: string;
  image?: string;
  items?: string[];
  kind: "deal" | "route";
  /** What this purchase already includes — drives the double-booking warning
      in the cart. Set by the section that adds the item; see lib/coverage.ts. */
  covers?: Covered[];
  /** Present only on a ferry line — the details the e-ticket needs. */
  ferry?: FerryBooking;
}

// Imported at the bottom to keep the type graph one-directional: coverage.ts
// imports CartItem from here, so this file must not import it from there at
// runtime. `import type` is erased at compile time, so the cycle is harmless —
// but the ordering above still reads more honestly.
import type { Covered } from "./coverage";

/** What an add-to-cart call supplies; the id is minted by the cart. */
export type NewCartItem = Omit<CartItem, "id">;

// The cart is persisted, not just the checkout snapshot: without this,
// navigating to /checkout and back would remount the page and its cart would
// come back empty. Session-scoped (not localStorage) on purpose — a stale cart
// surviving for weeks would surface dead prices.
export function saveCartForCheckout(items: CartItem[]) {
  try {
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Private mode / storage blocked — cart lives in memory only.
  }
}

export function loadCartForCheckout(): CartItem[] {
  try {
    const raw = sessionStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearCheckoutCart() {
  try {
    sessionStorage.removeItem(CART_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Parses the "S$ 12.50" strings the sections store, so every total in the app
    is computed the same way. Returns 0 for anything unparseable. */
export function priceOf(item: CartItem): number {
  return parseFloat(item.price.replace(/[^0-9.]/g, "") || "0");
}

export function cartTotalOf(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + priceOf(item), 0);
}

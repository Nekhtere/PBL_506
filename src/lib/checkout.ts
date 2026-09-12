// Cart handoff between the home page and /checkout.
//
// The cart lives in React state on the home page, but /checkout is a separate
// route — so the snapshot crosses via sessionStorage. That is fine for a cart:
// it is inherently per-tab and short-lived.
//
// Orders used to live here too. They moved to the server (see lib/store.ts)
// because a ticket is the opposite of per-tab: it has to survive an emailed
// link, a QR scan and a different device, and sessionStorage survives none of
// those.

import type { CartItem } from "@/components/Navbar";

export const CART_STORAGE_KEY = "bsd:checkout-cart";

// The cart is persisted, not just the checkout snapshot: without this,
// navigating to /checkout and back remounts the home page and its useState
// cart comes back empty. Session-scoped (not localStorage) on purpose — a
// stale cart surviving for weeks would surface dead prices.
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

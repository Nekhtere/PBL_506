// Checkout state handoff + e-ticket generation for the demo flow.
//
// The cart lives in React state on the home page, but /checkout is a separate
// route — so the cart snapshot crosses via sessionStorage. For the demo this is
// enough; when Stripe lands for real, the payment intent is created server-side
// from a POST body and none of this storage is needed.

import type { CartItem } from "@/components/Navbar";

export const CART_STORAGE_KEY = "bsd:checkout-cart";
export const ORDER_STORAGE_KEY = "bsd:last-order";

// The cart itself is persisted, not just the checkout snapshot: without this,
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

export type OrderTicket = {
  code: string;      // human-readable voucher code, e.g. BSD-7K3Q-9P
  itemName: string;
  subtitle?: string;
  price: string;
  image?: string;
};

export type Order = {
  orderId: string;
  buyerName: string;
  email: string;
  currency: "SGD" | "IDR";
  totalSGD: number;
  createdAt: string; // ISO
  tickets: OrderTicket[];
};

export function saveOrder(order: Order) {
  try {
    sessionStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
  } catch {
    // ignore
  }
}

export function loadOrder(): Order | null {
  try {
    const raw = sessionStorage.getItem(ORDER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Order) : null;
  } catch {
    return null;
  }
}

// Deterministic voucher code from the item name + a counter, so a demo looks
// real but a refresh never changes a code that's already been shown.
function voucherCode(seed: string, index: number): string {
  let hash = 2166136261; // FNV-1a 32-bit offset basis
  for (const ch of seed + index) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no I/L/O/0/1 — readable over the phone
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += alphabet[(hash >>> (i * 4)) % alphabet.length];
  }
  return `BSD-${code.slice(0, 4)}-${code.slice(4)}`;
}

export function buildOrder(
  items: CartItem[],
  buyerName: string,
  email: string,
  currency: "SGD" | "IDR",
): Order {
  const totalSGD = items.reduce(
    (sum, item) => sum + parseFloat(item.price.replace(/[^0-9.]/g, "") || "0"),
    0,
  );
  const now = new Date();
  return {
    orderId: voucherCode(`order-${now.toISOString()}-${email}`, 0).replace("BSD-", "ORD-"),
    buyerName,
    email,
    currency,
    totalSGD,
    createdAt: now.toISOString(),
    tickets: items.map((item, i) => ({
      code: voucherCode(item.name, i),
      itemName: item.name,
      subtitle: item.subtitle,
      price: item.price,
      image: item.image,
    })),
  };
}

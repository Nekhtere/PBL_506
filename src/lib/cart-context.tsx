"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  cartTotalOf,
  clearCheckoutCart,
  loadCartForCheckout,
  saveCartForCheckout,
  type CartItem,
  type NewCartItem,
} from "./cart";

// The cart used to be useState inside the home page, handed down to the navbar
// as props. That worked while the navbar was mounted on exactly one route. Now
// that the chrome is shared across /, /tickets, /checkout and /legal, the cart
// has to outlive any single page — so it lives here instead.
//
// Session storage stays the backing store, because a reload of /checkout must
// still find the cart. It is read AFTER mount, never in a lazy initializer:
// the server render has no storage, so reading during the first client render
// would produce a different tree and fail hydration.

interface CartContextValue {
  items: CartItem[];
  /** False until sessionStorage has been read — pages that must not flash an
      empty state (checkout) wait for it. */
  loaded: boolean;
  count: number;
  total: number;
  addItem: (item: NewCartItem) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    // Reading an external store after mount is exactly what effects are for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(loadCartForCheckout());
    setLoaded(true);
  }, []);

  // Skip the first paint — otherwise the empty initial state would be written
  // back over the stored cart before the load effect above has run. `loaded`
  // is in the deps for exactly that reason: it flips true in the same commit
  // that brings the stored items in, so the write happens once, with real data.
  useEffect(() => {
    if (loaded) saveCartForCheckout(items);
  }, [items, loaded]);

  const addItem = useCallback((item: NewCartItem) => {
    setItems((current) => [
      ...current,
      { ...item, id: `${item.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` },
    ]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    clearCheckoutCart();
  }, []);

  const total = useMemo(() => cartTotalOf(items), [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      loaded,
      count: items.length,
      total,
      addItem,
      removeItem,
      clear,
      cartOpen,
      setCartOpen,
    }),
    [items, loaded, total, addItem, removeItem, clear, cartOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside <CartProvider> — see src/app/(site)/layout.tsx");
  }
  return context;
}

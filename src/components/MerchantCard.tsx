"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ShoppingCart, Heart, MapPin, CheckCircle } from "lucide-react";
import { tagColors, discountPercent, type Merchant } from "@/lib/merchants";
import type { CartItem } from "./Navbar";
import { useLocale } from "@/lib/locale-context";

// Photo-forward tile: look at where you could go. Validity and inclusions live
// in the detail modal, so the card stays mostly a picture — but the saving is
// the one number a shopper scans for, so it stays on the tile.
export default function MerchantCard({ merchant, index, isInView, onSelect, onAddToCart, distanceKm, className = "shrink-0 w-64 sm:w-72" }: {
  merchant: Merchant;
  index: number;
  isInView: boolean;
  distanceKm?: number;
  className?: string;
  onSelect: (m: Merchant) => void;
  onAddToCart: (item: Omit<CartItem, "id">) => void;
}) {
  const [liked, setLiked] = useState(false);
  const { t, locale } = useLocale();
  // ponytail: FX pegged at 11800 — swap for a live rate endpoint at launch.
  const toIDR = (raw: string) =>
    `Rp ${Math.round(parseFloat(raw.replace(/[^0-9.]/g, "") || "0") * 11800).toLocaleString("id-ID")}`;
  const [added, setAdded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const discount = discountPercent(merchant.originalPrice, merchant.salePrice);

  const handleAdd = () => {
    if (added) return;
    setAdded(true);
    onAddToCart({
      name: merchant.name,
      price: merchant.salePrice,
      subtitle: `${merchant.category} · ${merchant.location}`,
      image: merchant.photo,
      kind: "deal",
    });
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <motion.div
      key={merchant.id}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className={`relative aspect-[4/5] rounded-3xl overflow-hidden group cursor-pointer card-soft snap-start ${className}`}
      whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.14)" }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Skeleton. These are remote photos on a phone connection, and an empty
          tile reads as broken rather than loading. The pulse is killed by the
          global reduced-motion rule. */}
      <div
        className={`absolute inset-0 animate-pulse bg-line transition-opacity duration-300 ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden="true"
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={merchant.photo}
        alt={merchant.name}
        /* Below the fold and often off to the right in the carousel — deferring
           these keeps six 700px photos off the critical path. */
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className="media-zoom absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      {/* Lighter than it was: the caption now carries a text-shadow, so the
          photo can show through instead of being buried under a scrim. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

      {/* Opens the detail modal. This is the card's real control: the wrapper is a
          plain div, so without an actual button the tile is unreachable by keyboard.
          Stretched over the whole card via ::after, and first in the DOM so the
          wishlist and Add buttons paint above it. */}
      <button
        type="button"
        onClick={() => onSelect(merchant)}
        aria-label={`View details for ${merchant.name}`}
        className="absolute inset-0 z-[1] rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white after:absolute after:inset-0 after:content-['']"
      />

      {/* Tag badge. Top-left is the only free corner: the discount now takes
          bottom-left and the wishlist keeps top-right. */}
      <span className={`absolute top-3 left-3 z-10 pointer-events-none ${tagColors[merchant.tag]} text-white text-[11px] font-semibold px-2.5 py-1 rounded-full`}>
        {merchant.tag}
      </span>

      {/* Discount. Reads the saving at a glance — the Rp list price next to an
          SGD sale price means nothing without it. */}
      {discount > 0 && (
        <span className="absolute bottom-3 left-3 z-10 pointer-events-none rounded-full bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 text-shadow-photo">
          -{discount}%
        </span>
      )}

      {/* Like button */}
      <button
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full glass flex items-center justify-center transition-transform duration-200 hover:scale-110"
        onClick={() => setLiked((v) => !v)}
        aria-label={liked ? `Remove ${merchant.name} from wishlist` : `Add ${merchant.name} to wishlist`}
        aria-pressed={liked}
      >
        <Heart
          className={`w-4 h-4 transition-colors duration-200 ${liked ? "fill-red-500 text-red-500" : "text-fg/60"}`}
        />
      </button>

      {/* Caption overlay. Bottom padding clears the discount pill, and the
          shadow is what keeps the type readable over a light photo. */}
      <div className="absolute inset-x-0 bottom-0 p-4 pb-12 text-shadow-photo pointer-events-none">
        <span className="flex items-center gap-1 text-white/80 text-[11px] font-medium mb-1.5">
          <MapPin className="w-2.5 h-2.5" aria-hidden="true" />
          {merchant.location}
          {distanceKm != null && <> · {distanceKm.toFixed(1)} km</>}
        </span>

        <h3 className="text-white text-[17px] font-bold leading-snug mb-1">{merchant.name}</h3>

        <div className="flex items-center gap-1.5 mb-3 text-[11px] text-white/80">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" aria-hidden="true" />
          <span>{merchant.rating} ({merchant.reviews})</span>
          <span className="text-white/50">·</span>
          <span>{merchant.category}</span>
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between">
          <span className="flex items-baseline min-w-0">
            {/* /70 not /55: struck-through 12px over a photo is the smallest
                text on the card, so it needs the most headroom. */}
            <span className="text-white/70 text-[12px] line-through mr-1.5 shrink-0">{locale === "id" ? toIDR(merchant.originalPrice) : merchant.originalPrice}</span>
            <span className="text-white text-[18px] font-bold">
              {locale === "id" ? toIDR(merchant.salePrice) : merchant.salePrice}
              <span className="text-white/70 text-[11px] font-medium ml-1.5">SGD</span>
            </span>
          </span>
          <motion.button
            whileTap={{ scale: 0.94 }}
            className={`pointer-events-auto flex items-center justify-center gap-1.5 w-[86px] text-white text-[12px] font-semibold px-3 py-2 rounded-xl transition-colors duration-200 ${added ? "bg-emerald-600" : "bg-[var(--accent)] hover:bg-[var(--accent-hover)]"}`}
            onClick={handleAdd}
            aria-label={`Add ${merchant.name} to cart`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {added ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  {t("deals.added")}
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5" aria-hidden="true" />
                  {t("deals.add")}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

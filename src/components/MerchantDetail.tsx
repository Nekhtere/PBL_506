"use client";

import { Star, ShoppingCart, Check, MapPin, Clock } from "lucide-react";
import { merchantDetails, tagColors, discountPercent, type Merchant } from "@/lib/merchants";
import type { CartItem } from "./Navbar";

// Body of the detail modal. Shared by the home carousel and the /merchants
// directory so a merchant looks and behaves the same wherever it is opened.
// No inner scroller: the modal shell owns the scroll, so the header photo and
// the CTA stay in one flow on phones.
export default function MerchantDetail({ merchant, onAddToCart, onDone }: {
  merchant: Merchant;
  onAddToCart: (item: Omit<CartItem, "id">) => void;
  onDone: () => void;
}) {
  const details = merchantDetails[merchant.id];
  const discount = discountPercent(merchant.originalPrice, merchant.salePrice);

  return (
    <div className="flex flex-col">
      {/* Header image */}
      <div className="relative h-44 sm:h-56 shrink-0">
        {/* The photo is normally cached from the card that opened this modal,
            but not when it is opened from a map pin. */}
        <div className="absolute inset-0 animate-pulse bg-line" aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={merchant.photo}
          alt={merchant.name}
          className="relative w-full h-full object-cover rounded-none sm:rounded-t-[28px]"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-none sm:rounded-t-[28px]" />
        <div className="absolute bottom-4 left-6 right-6 text-white text-shadow-photo">
          <span className={`inline-block ${tagColors[merchant.tag]} text-white text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2`}>
            {merchant.tag}
          </span>
          <h3 className="text-2xl font-bold">{merchant.name}</h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-white/85 text-[12px]">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              {merchant.rating} ({merchant.reviews} reviews)
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> {merchant.location}
            </span>
            {/* Opening hours were collected in merchantDetails but never shown. */}
            {details && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" /> {details.hours}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-6 flex flex-col">
        <div>
          <p className="text-[13px] text-muted leading-relaxed mb-4">{merchant.desc}</p>

          {/* Highlights */}
          {details && (
            <div className="flex flex-wrap gap-2 mb-4">
              {details.highlights.map((h) => (
                <span key={h} className="flex items-center gap-1.5 bg-surface-sunken text-fg text-[11px] font-medium px-3 py-1.5 rounded-full">
                  ✦ {h}
                </span>
              ))}
            </div>
          )}

          {/* Includes */}
          {details && (
            <div className="mb-4">
              <p className="text-[12px] font-semibold text-fg mb-2">What&apos;s included</p>
              <ul className="space-y-1.5">
                {details.includes.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[12px] text-muted">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Promo — --accent-ink, not --accent: the plain accent is 4.1:1 on
              its own 10% tint, below AA. The ink is 5.7:1 there. */}
          {details?.promo && (
            <div className="bg-accent/10 text-[var(--accent-ink)] text-[12px] font-medium px-4 py-2.5 rounded-xl mb-4">
              🎁 {details.promo}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between bg-surface-sunken rounded-2xl p-4 mb-4 shrink-0">
          <div className="flex items-baseline flex-wrap gap-x-2">
            <span className="text-[12px] text-muted line-through">{merchant.originalPrice}</span>
            <span className="text-2xl font-bold text-fg">{merchant.salePrice}</span>
            <span className="text-[11px] text-muted">E-Cash</span>
            {discount > 0 && (
              <span className="rounded-full bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5">
                -{discount}%
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mt-4 pt-4 border-t border-line-soft shrink-0">
          <div>
            <p className="text-[11px] text-muted">Voucher can be redeemed at</p>
            <p className="text-[13px] font-semibold text-fg">{merchant.location}</p>
          </div>
          <button
            className="flex items-center justify-center sm:justify-normal gap-2 w-full sm:w-auto bg-accent hover:bg-accent-hover text-white text-[14px] font-bold px-6 py-3 rounded-xl transition-colors duration-200 shadow-lg shadow-accent/25"
            onClick={() => {
              onAddToCart({
                name: merchant.name,
                price: merchant.salePrice,
                subtitle: `${merchant.category} · ${merchant.location}`,
                image: merchant.photo,
                kind: "deal",
              });
              onDone();
            }}
          >
            <ShoppingCart className="w-4 h-4" aria-hidden="true" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

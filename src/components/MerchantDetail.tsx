"use client";

import { Star, ShoppingCart, Check, MapPin } from "lucide-react";
import { merchantDetails, tagColors, type Merchant } from "@/lib/merchants";
import type { CartItem } from "./Navbar";

// Body of the detail modal. Shared by the home carousel and the /merchants
// directory so a merchant looks and behaves the same wherever it is opened.
export default function MerchantDetail({ merchant, onAddToCart, onDone }: {
  merchant: Merchant;
  onAddToCart: (item: Omit<CartItem, "id">) => void;
  onDone: () => void;
}) {
  const details = merchantDetails[merchant.id];

  return (
    <div className="flex flex-col">
      {/* Header image */}
      <div className="relative h-44 sm:h-56 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={merchant.photo}
          alt={merchant.name}
          className="w-full h-full object-cover rounded-none sm:rounded-t-[28px]"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-none sm:rounded-t-[28px]" />
        <div className="absolute bottom-4 left-6 right-6 text-white">
          <span className={`inline-block ${tagColors[merchant.tag]} text-white text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2`}>
            {merchant.tag}
          </span>
          <h3 className="text-2xl font-bold">{merchant.name}</h3>
          <div className="flex items-center gap-4 mt-1.5 text-white/85 text-[12px]">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              {merchant.rating} ({merchant.reviews} reviews)
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> {merchant.location}
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="p-4 sm:p-6 flex flex-col">
        <div>
          <p className="text-[13px] text-[#515154] leading-relaxed mb-4">{merchant.desc}</p>

          {/* Highlights */}
          {details && (
            <div className="flex flex-wrap gap-2 mb-4">
              {details.highlights.map((h) => (
                <span key={h} className="flex items-center gap-1.5 bg-[#F5F5F7] text-[#1D1D1F] text-[11px] font-medium px-3 py-1.5 rounded-full">
                  ✦ {h}
                </span>
              ))}
            </div>
          )}

          {/* Includes */}
          {details && (
            <div className="mb-4">
              <p className="text-[12px] font-semibold text-[#1D1D1F] mb-2">What&apos;s included</p>
              <ul className="space-y-1.5">
                {details.includes.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[12px] text-[#515154]">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Promo */}
          {details?.promo && (
            <div className="bg-[#0071E3]/10 text-[#0071E3] text-[12px] font-medium px-4 py-2.5 rounded-xl mb-4">
              🎁 {details.promo}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between bg-[#F5F5F7] rounded-2xl p-4 mb-4 shrink-0">
          <div>
            <span className="text-[12px] text-[#515154] line-through mr-2">{merchant.originalPrice}</span>
            <span className="text-2xl font-bold text-[#1D1D1F]">{merchant.salePrice}</span>
            <span className="text-[11px] text-[#515154] ml-1.5">E-Cash</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mt-4 pt-4 border-t border-[#E5E5EA] shrink-0">
          <div>
            <p className="text-[11px] text-[#515154]">Voucher can be redeemed at</p>
            <p className="text-[13px] font-semibold text-[#1D1D1F]">{merchant.location}</p>
          </div>
          <button
            className="flex items-center justify-center sm:justify-normal gap-2 w-full sm:w-auto bg-[#0071E3] hover:bg-[#005BBB] text-white text-[14px] font-bold px-6 py-3 rounded-xl transition-colors duration-200 shadow-lg shadow-[#0071E3]/25"
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
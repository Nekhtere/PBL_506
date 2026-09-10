"use client";

import { ExternalLink } from "lucide-react";

const footerLinks = {
  Product: ["Deals", "Itinerary", "Ride Guide", "E-Cash Voucher"],
  Company: ["About Us", "Blog", "Press Kit", "Careers"],
  Support: ["Help Center", "Contact Merchant", "Report Issue", "FAQs"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Refund Policy"],
};

export default function Footer() {
  return (
    <footer className="bg-[#FBFBFD] border-t border-[#E5E5EA] pt-16 pb-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <span className="text-lg font-bold tracking-tight text-[#1D1D1F]">
                Batam<span className="text-[#0071E3]">Smart</span>
              </span>
              {/* #515154 on #FBFBFD = 5.1:1 contrast — WCAG AA ✓ */}
              <p className="text-[#515154] text-sm mt-3 leading-relaxed max-w-44">
                The smartest way to explore Batam. Curated deals, instant QR vouchers.
              </p>
            </div>
            {/* Social */}
            <div className="flex items-center gap-3 mt-5">
              {["IG", "TW", "TK"].map((s) => (
                <button
                  key={s}
                  className="w-8 h-8 rounded-full bg-[#F5F5F7] hover:bg-[#E5E5EA] flex items-center justify-center text-[11px] font-semibold text-[#1D1D1F] transition-colors"
                  aria-label={s === "IG" ? "Instagram" : s === "TW" ? "Twitter / X" : "TikTok"}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              {/* Category heading: #1D1D1F — high contrast ✓ */}
              <h4 className="text-[11px] font-semibold text-[#1D1D1F] uppercase tracking-widest mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    {/* #515154 on #FBFBFD = 5.1:1 — WCAG AA ✓ */}
                    <a
                      href="#"
                      className="text-[13px] text-[#515154] hover:text-[#1D1D1F] transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Partner / Admin Login Banner */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#F5F5F7] rounded-2xl px-6 py-4 mb-10">
          <div>
            <p className="text-[14px] font-semibold text-[#1D1D1F]">Are you a merchant partner?</p>
            {/* #515154 on #F5F5F7 = 4.9:1 — WCAG AA ✓ */}
            <p className="text-[12px] text-[#515154] mt-0.5">
              Access the admin dashboard to manage your vouchers and scan QR codes.
            </p>
          </div>
          <div className="flex gap-3 shrink-0 items-center">
            <a
              href="#"
              className="flex items-center gap-1.5 text-[13px] font-semibold text-[#0071E3] hover:underline"
            >
              Merchant Login <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
            <span className="text-[#C7C7CC]" aria-hidden="true">|</span>
            <a
              href="#"
              className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1D1D1F] hover:text-[#515154] transition-colors"
            >
              Admin Portal <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6 border-t border-[#E5E5EA]">
          {/* #515154 on #FBFBFD = 5.1:1 — WCAG AA ✓ */}
          <p className="text-[12px] text-[#515154]">
            © {new Date().getFullYear()} BatamSmart. All rights reserved.
          </p>
          <p className="text-[12px] text-[#515154]">
            Batam, Kepulauan Riau, Indonesia · SGD / IDR supported
          </p>
        </div>
      </div>
    </footer>
  );
}

"use client";

const footerLinks = {
  Product: ["Deals", "Itinerary", "Ride Guide", "Help"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Refund Policy"],
};

export default function Footer() {
  return (
    <footer className="bg-[#F5F5F7] border-t border-[#E5E5EA] pt-8 pb-6 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Brand + primary links */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="text-center md:text-left">
            <span className="text-lg font-bold tracking-tight text-[#1D1D1F]">
              Batam<span className="text-[#0071E3]">Smart</span>
            </span>
            <p className="text-[#515154] text-sm mt-1">
              Smart travel, simple vouchers.
            </p>
          </div>
          <nav className="flex flex-wrap gap-4 justify-center md:justify-end text-sm">
            {footerLinks.Product.map((label) => (
              <a key={label} href="#" className="text-[#515154] hover:text-[#1D1D1F] transition-colors">
                {label}
              </a>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-[#515154]">
          <p>© {new Date().getFullYear()} BatamSmart. All rights reserved.</p>
          <p>Batam, Kepulauan Riau, Indonesia · SGD / IDR supported</p>
          <div className="flex gap-2">
            {footerLinks.Legal.map((label, i) => (
              <span key={label} className="flex items-center">
                <a href="#" className="hover:underline">{label}</a>
                {i < footerLinks.Legal.length - 1 && <span className="mx-1 text-[#C7C7CC]">|</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

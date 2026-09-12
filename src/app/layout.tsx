import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { MotionConfig } from "framer-motion";
import { LocaleProvider } from "@/lib/locale-context";
import "./globals.css";
// Global rather than inside NearbyMap.tsx: Leaflet loads lazily, and a stylesheet
// imported from a lazily-loaded module becomes its own CSS chunk that fails to load.
import "leaflet/dist/leaflet.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BatamSmart — Unlock Batam's Best Deals",
  description:
    "Curated E-Cash vouchers for Seafood, Spa, and Shopping in Batam. Pay in SGD, redeem instantly with QR. Designed for Singapore tourists.",
  keywords: ["Batam deals", "Batam voucher", "Batam travel", "SGD voucher", "Batam seafood"],
};

// Without this the mobile browser chrome stays its default colour and the
// status bar reads as a seam above the hero. Matches --bg.
export const viewport: Viewport = {
  themeColor: "#FBFBFD",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <MotionConfig reducedMotion="user">
          <LocaleProvider>{children}</LocaleProvider>
        </MotionConfig>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}

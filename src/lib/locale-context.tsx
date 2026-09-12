"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Locale = "en" | "id";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

// ── Translation table ─────────────────────────────────────────────────────────
const translations: Record<string, Record<Locale, string>> = {
  // Nav
  "nav.home":        { en: "Home",       id: "Beranda" },
  "nav.deals":       { en: "Deals",      id: "Deals" },
  "nav.itinerary":   { en: "Itinerary",  id: "Paket Wisata" },
  "nav.ferry":       { en: "Ferry",      id: "Feri" },
  "nav.rideGuide":   { en: "Ride Guide", id: "Panduan Ride" },

  // Hero
  "hero.badge.location":    { en: "Batam, Riau Islands",        id: "Batam, Kepulauan Riau" },
  "hero.badge.trusted":     { en: "Trusted by 10,000+ visitors", id: "Dipercaya 10.000+ pengunjung" },
  "hero.headline1":         { en: "Unlock Batam's Best.",        id: "Temukan yang Terbaik di Batam." },
  "hero.headline2":         { en: "Effortlessly.",               id: "Mudah & Hemat." },
  "hero.sub":               { en: "Curated deals, ferry tickets & full-day travel packages — all in one place, designed for Singapore visitors.", id: "Deals pilihan, tiket feri & paket wisata seharian — semua dalam satu tempat, untuk turis dari Singapura." },
  "hero.search.placeholder":{ en: "Search deals, spas, seafood…", id: "Cari deals, spa, seafood…" },
  "hero.search.button":     { en: "Search",                      id: "Cari" },
  "hero.stat.merchants":    { en: "Merchant Partners",           id: "Merchant Mitra" },
  "hero.stat.rating":       { en: "Average Rating",              id: "Rating Rata-rata" },
  "hero.stat.currency":     { en: "Pay in Dollars",              id: "Bayar dengan Dolar" },
  "hero.stat.distance":     { en: "From Singapore",              id: "Dari Singapura" },
  "hero.popular":           { en: "Popular:",                    id: "Populer:" },
  "hero.badge.ferry":       { en: "45 min ferry from Singapore", id: "45 menit feri dari Singapura" },
  "hero.badge.verified":    { en: "Verified Merchants Only",     id: "Hanya merchant terverifikasi" },

  // Deals section
  "deals.label":         { en: "Top Picks in Batam",         id: "Pilihan Terbaik di Batam" },
  "deals.heading":       { en: "Smart Merchant Deals",       id: "Deals Merchant Terpilih" },
  "deals.sub":           { en: "The best-rated seafood, spa and shopping in Batam. Prices locked in SGD, vouchers redeemed by QR — valid 30 days.", id: "Seafood, spa dan belanja dengan rating terbaik di Batam. Harga terkunci dalam SGD, voucher ditukar dengan QR — berlaku 30 hari." },
  "deals.searchPlaceholder": { en: "Search Batam — seafood, spa, shopping…", id: "Cari di Batam — seafood, spa, belanja…" },
  "deals.nearme":        { en: "Near Me",                    id: "Dekat Saya" },
  "deals.locating":      { en: "Locating…",                  id: "Mencari lokasi…" },
  "deals.popular":       { en: "Popular:",                   id: "Populer:" },
  "deals.geoUnsupported":{ en: "This browser can't share your location.", id: "Browser ini tidak dapat membagikan lokasi Anda." },
  "deals.geoDenied":     { en: "Location blocked. Allow it in your browser settings to see deals near you.", id: "Lokasi diblokir. Izinkan di pengaturan browser untuk melihat deals di dekat Anda." },
  "deals.geoError":      { en: "Couldn't get your location just now. Try again.", id: "Lokasi Anda tidak dapat diambil saat ini. Coba lagi." },
  "deals.tryAgain":      { en: "Try again",                  id: "Coba lagi" },
  "deals.noMatch":       { en: "No deals match “{q}”.",      id: "Tidak ada deals yang cocok dengan “{q}”." },
  "deals.tryAnother":    { en: "Try another search",         id: "Coba pencarian lain" },
  "deals.found":         { en: "{n} deals found",            id: "{n} deals ditemukan" },
  "deals.tag.seafood":   { en: "Seafood",                    id: "Seafood" },
  "deals.tag.spa":       { en: "Spa",                        id: "Spa" },
  "deals.tag.shopping":  { en: "Shopping",                   id: "Belanja" },
  "deals.tag.night":     { en: "Night Market",               id: "Pasar Malam" },
  "deals.tag.hotel":     { en: "Hotel",                      id: "Hotel" },
  "deals.tag.attraction":{ en: "Attraction",                 id: "Wisata" },
  "deals.viewAll":       { en: "All",                        id: "Semua" },
  "deals.addToCart":     { en: "Add to Cart",                id: "Tambah ke Keranjang" },
  "deals.added":         { en: "Added",                      id: "Ditambahkan" },
  "deals.add":           { en: "Add",                        id: "Tambah" },
  "deals.redeemAt":      { en: "Voucher can be redeemed at", id: "Voucher dapat ditukar di" },

  // Itinerary section
  "itinerary.label":     { en: "Full-Day Travel Package",    id: "Paket Wisata Seharian" },
  "itinerary.heading1":  { en: "1-Day Trip,",                id: "Wisata 1 Hari," },
  "itinerary.heading2":  { en: "Your Way",                   id: "Sesuai Keinginan Anda" },
  "itinerary.sub":       { en: "Dedicated driver, curated stops, all transport included. Swap any stop for an alternative — price stays bundled.", id: "Driver khusus, destinasi terkurasi, semua transportasi sudah termasuk. Ganti destinasi sesuai keinginan — harga tetap bundling." },
  "itinerary.transport": { en: "Full-day transport included", id: "Transportasi seharian termasuk" },
  "itinerary.customised":{ en: "Customised — tap any stop to swap", id: "Dikustomisasi — ketuk destinasi untuk ganti" },
  "itinerary.default":   { en: "Tap any stop to swap for an alternative", id: "Ketuk destinasi untuk pilih alternatif" },
  "itinerary.swapLabel": { en: "Choose a stop for this slot", id: "Pilih destinasi untuk slot ini" },
  "itinerary.included":  { en: "What's included",            id: "Yang sudah termasuk" },
  "itinerary.addCart":   { en: "Add to Cart",                id: "Tambah ke Keranjang" },
  "itinerary.added":     { en: "Added!",                     id: "Ditambahkan!" },
  "itinerary.perPax":    { en: "per pax",                    id: "per orang" },
  "itinerary.custom":    { en: "Request a custom itinerary", id: "Minta itinerary khusus" },
  "itinerary.booked":    { en: "booked this week",           id: "dipesan minggu ini" },
  "itinerary.transportIncluded": { en: "Transport included", id: "Transportasi termasuk" },
  "itinerary.reviews":  { en: "reviews",                   id: "ulasan" },
  "itinerary.validity": { en: "Valid 30 days from purchase", id: "Berlaku 30 hari sejak pembelian" },

  // Ferry section
  "ferry.label":         { en: "Getting Here",               id: "Cara Tiba" },
  "ferry.heading":       { en: "Singapore to Batam",         id: "Singapura ke Batam" },
  "ferry.sub":           { en: "Four terminals, three operators, under an hour on the water. Book your ticket directly — no redirects, no markups.", id: "Empat terminal, tiga operator, kurang dari satu jam di laut. Pesan tiket langsung — tanpa redirect, tanpa markup." },
  "ferry.bookTicket":    { en: "Book Ticket",                id: "Pesan Tiket" },
  "ferry.beforeBoard":   { en: "Before you board",           id: "Sebelum naik kapal" },
  "ferry.disclaimer":    { en: "Fares and crossing times are indicative. Live inventory and confirmed pricing via BatamFast API integration on launch.", id: "Harga dan waktu penyeberangan bersifat indikatif. Inventaris live dan harga konfirmasi melalui integrasi API BatamFast saat peluncuran." },
  "ferry.modal.title":   { en: "Book Ferry Ticket",          id: "Pesan Tiket Feri" },
  "ferry.modal.trip":    { en: "Trip Type",                  id: "Jenis Perjalanan" },
  "ferry.modal.oneWay":  { en: "One-Way",                    id: "Sekali Jalan" },
  "ferry.modal.return":  { en: "Return",                     id: "Pulang Pergi" },
  "ferry.modal.date":    { en: "Travel Date",                id: "Tanggal Perjalanan" },
  "ferry.modal.time":    { en: "Departure Time",             id: "Waktu Keberangkatan" },
  "ferry.modal.name":    { en: "Full Name (as in passport)",  id: "Nama Lengkap (sesuai paspor)" },
  "ferry.modal.passport":{ en: "Passport Number",            id: "Nomor Paspor" },
  "ferry.modal.expiry":  { en: "Passport Expiry Date",       id: "Tanggal Kedaluwarsa Paspor" },
  "ferry.modal.expiryNote":{ en: "— must be valid 6+ months from travel date", id: "— harus berlaku 6+ bulan dari tanggal perjalanan" },
  "ferry.modal.confirm": { en: "Confirm & Pay",              id: "Konfirmasi & Bayar" },
  "ferry.modal.demo":    { en: "Demo mode — no real payment is processed. E-ticket format matches BatamFast integration spec.", id: "Mode demo — tidak ada pembayaran nyata yang diproses. Format e-tiket sesuai spesifikasi integrasi BatamFast." },
  "ferry.modal.total":   { en: "Total",                      id: "Total" },
  "ferry.modal.confirmed":{ en: "Booking Confirmed!",        id: "Pemesanan Dikonfirmasi!" },
  "ferry.modal.emailSent":{ en: "Your e-ticket has been sent to your email.", id: "E-tiket Anda telah dikirim ke email." },
  "ferry.modal.passenger":{ en: "Passenger",                 id: "Penumpang" },
  "ferry.modal.route":   { en: "Route",                      id: "Rute" },
  "ferry.modal.datetime":{ en: "Date & Time",                id: "Tanggal & Waktu" },
  "ferry.modal.trip2":   { en: "Trip",                       id: "Perjalanan" },
  "ferry.modal.paid":    { en: "Total Paid",                 id: "Total Dibayar" },
  "ferry.modal.eticket": { en: "Show QR at terminal check-in", id: "Tunjukkan QR saat check-in terminal" },
  "ferry.modal.done":    { en: "Done",                       id: "Selesai" },
  "ferry.tip1":          { en: "Book return tickets online — walk-up slots sell out on weekends.", id: "Pesan tiket pulang-pergi online — slot tanpa reservasi habis di akhir pekan." },
  "ferry.tip2":          { en: "Bring your passport. Indonesia visa-free entry for SG passports, 30 days.", id: "Bawa paspor Anda. Indonesia bebas visa untuk paspor Singapura, 30 hari." },
  "ferry.tip3":          { en: "Arrive 45 min before departure for immigration on both sides.", id: "Tiba 45 menit sebelum keberangkatan untuk imigrasi di kedua sisi." },
  "ferry.tip4":          { en: "Set your watch back 1 hour. Batam is WIB (UTC+7), Singapore is UTC+8.", id: "Putar jam Anda mundur 1 jam. Batam WIB (UTC+7), Singapura UTC+8." },
  "ferry.modal.nameRequired":{ en: "Full name is required.",      id: "Nama lengkap wajib diisi." },
  "ferry.modal.passportRequired":{ en: "Passport number is required.", id: "Nomor paspor wajib diisi." },
  "ferry.modal.expiryRequired":{ en: "Expiry date is required.",   id: "Tanggal kedaluwarsa wajib diisi." },
  "ferry.modal.verified":{ en: "Passport validity verified", id: "Validitas paspor terverifikasi" },
  "ferry.modal.passportInvalid":{ en: "Passport must be valid for at least 6 months from your travel date. Your passport expires {expiry}, but needs to be valid until at least {min}.", id: "Paspor harus berlaku minimal 6 bulan dari tanggal perjalanan Anda. Paspor Anda kedaluwarsa pada {expiry}, tetapi harus berlaku hingga minimal {min}." },

  // Cart
  "cart.title":      { en: "Your Cart",                         id: "Keranjang" },
  "cart.subtitle":   { en: "Merchant vouchers & travel packages, confirmed instantly.", id: "Voucher merchant & paket wisata, dikonfirmasi langsung." },
  "cart.empty":      { en: "Your cart is empty.",               id: "Keranjang kosong." },
  "cart.emptyBody":  { en: "Add a deal or travel package to get started.", id: "Tambahkan deal atau paket wisata untuk mulai." },
  "cart.subtotal":   { en: "Subtotal",                          id: "Subtotal" },
  "cart.fee":        { en: "Booking fee",                       id: "Biaya pemesanan" },
  "cart.free":       { en: "Free",                              id: "Gratis" },
  "cart.total":      { en: "Total",                             id: "Total" },
  "cart.checkout":   { en: "Checkout",                          id: "Checkout" },
  "cart.qrVoucher":  { en: "QR Voucher",                        id: "Voucher QR" },
  "cart.badgeRoute": { en: "Route",                             id: "Rute" },
  "cart.badgeDeal":  { en: "Deal",                              id: "Deal" },
  "cart.items":      { en: "items",                             id: "item" },
  "cart.item":       { en: "item",                              id: "item" },

  // Ride guide
  "ride.label":       { en: "Smart Ride Guide",            id: "Panduan Ride Pintar" },
  "ride.heading1":    { en: "No Shuttle?",                 id: "Tidak Ada Shuttle?" },
  "ride.heading2":    { en: "No Problem.",                 id: "Tidak Masalah." },
  "ride.heading3":    { en: "Go Local.",                   id: "Jelajah Lokal." },
  "ride.sub":         { en: "We integrated fare estimates so you can travel like a local. Just open Gojek or Grab — we show you exactly where to stand.", id: "Kami menyediakan estimasi tarif agar Anda bepergian seperti orang lokal. Cukup buka Gojek atau Grab — kami tunjukkan titik penjemputan yang tepat." },
  "ride.minsAway":    { en: "8 min away",                  id: "8 menit lagi" },
  "ride.book":        { en: "Book",                        id: "Pesan" },
  "ride.pickupConfirmed": { en: "Pickup Confirmed",        id: "Penjemputan Dikonfirmasi" },
  "ride.driver2min":  { en: "Driver is 2 min away",        id: "Sopir tiba 2 menit lagi" },
  "ride.fares":       { en: "Estimated Fares",             id: "Estimasi Tarif" },
  "ride.pickup":      { en: "Pick-up Point Guide",         id: "Panduan Titik Penjemputan" },
  "ride.seeFull":     { en: "See full ride guide",         id: "Lihat panduan ride lengkap" },
  "ride.bc.location": { en: "Exit gate, turn left 50m",    id: "Gerbang keluar, belok kiri 50 m" },
  "ride.bc.tip":      { en: "Look for the green Grab/Gojek sign", id: "Cari papan hijau Grab/Gojek" },
  "ride.hb.location": { en: "Ground floor, east exit",     id: "Lantai dasar, pintu timur" },
  "ride.hb.tip":      { en: "Pre-book before docking for faster pickup", id: "Pesan sebelum kapal sandar agar penjemputan lebih cepat" },

  // How it works
  "how.label":      { en: "How It Works",   id: "Cara Kerja" },
  "how.heading1":   { en: "Three Steps.",   id: "Tiga Langkah." },
  "how.heading2":   { en: "Pure Simplicity.", id: "Sederhana Sepenuhnya." },
  "how.sub":        { en: "From payment to redemption, every step stays effortless.", id: "Dari pembayaran hingga penukaran, setiap langkah tetap mudah." },
  "how.step1.title":{ en: "Buy in SGD",     id: "Bayar dengan SGD" },
  "how.step1.desc": { en: "Choose a curated deal and pay securely in Singapore Dollars.", id: "Pilih deal terkurasi dan bayar dengan aman dalam Dolar Singapura." },
  "how.step2.title":{ en: "Scan QR Code",   id: "Pindai Kode QR" },
  "how.step2.desc": { en: "Receive your voucher instantly and show its QR code at checkout.", id: "Terima voucher seketika dan tunjukkan kode QR saat checkout." },
  "how.step3.title":{ en: "Enjoy Batam",    id: "Nikmati Batam" },
  "how.step3.desc": { en: "Merchant confirms redemption in seconds. No app download needed.", id: "Merchant mengonfirmasi penukaran dalam hitungan detik. Tanpa unduh aplikasi." },

  // Footer
  "footer.tagline":   { en: "Smart travel, simple vouchers.", id: "Perjalanan pintar, voucher sederhana." },
  "footer.legal.privacy": { en: "Privacy Policy",    id: "Kebijakan Privasi" },
  "footer.legal.terms":   { en: "Terms of Service",  id: "Ketentuan Layanan" },
  "footer.legal.cookies": { en: "Cookie Policy",     id: "Kebijakan Cookie" },
  "footer.legal.refunds": { en: "Refund Policy",     id: "Kebijakan Refund" },
  "footer.copyright": { en: "© {year} BatamSmart. All rights reserved.", id: "© {year} BatamSmart. Hak cipta dilindungi." },
  "footer.location":  { en: "Batam, Kepulauan Riau, Indonesia · SGD / IDR supported", id: "Batam, Kepulauan Riau, Indonesia · mendukung SGD / IDR" },
  "footer.viewCart":  { en: "View Cart", id: "Lihat Keranjang" },
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (key) => translations[key]?.en ?? key,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  const t = (key: string) => translations[key]?.[locale] ?? translations[key]?.en ?? key;
  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

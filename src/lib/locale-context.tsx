"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

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
  "nav.destinations": { en: "Destinations", id: "Destinasi" },
  "nav.nearme":      { en: "Near Me",    id: "Dekat Saya" },
  "nav.journey":     { en: "Journey",    id: "Journey" },
  "nav.ferry":       { en: "Ferry",      id: "Feri" },
  "nav.faq":         { en: "FAQ",        id: "FAQ" },

  // Hero
  "hero.badge.location":    { en: "Batam, Riau Islands",        id: "Batam, Kepulauan Riau" },
  "hero.badge.trusted":     { en: "Trusted by 10,000+ visitors", id: "Dipercaya 10.000+ pengunjung" },
  "hero.headline1":         { en: "Unlock Batam's Best.",        id: "Temukan yang Terbaik di Batam." },
  "hero.headline2":         { en: "Effortlessly.",               id: "Mudah & Hemat." },
  "hero.sub":               { en: "Beaches, temples, tours and ferry tickets — the whole Batam trip in one place, designed for Singapore visitors.", id: "Pantai, vihara, tour dan tiket feri — seluruh perjalanan Batam dalam satu tempat, untuk turis dari Singapura." },
  "hero.search.placeholder":{ en: "Search places, tours, ferry…", id: "Cari tempat, tour, feri…" },
  "hero.search.button":     { en: "Search",                      id: "Cari" },
  "hero.stat.destinations": { en: "Places to Explore",          id: "Tempat untuk Dijelajahi" },
  "hero.stat.rating":       { en: "Average Rating",              id: "Rating Rata-rata" },
  "hero.stat.currency":     { en: "Pay in Dollars",              id: "Bayar dengan Dolar" },
  "hero.stat.distance":     { en: "From Singapore",              id: "Dari Singapura" },
  "hero.popular":           { en: "Popular:",                    id: "Populer:" },
  "hero.badge.ferry":       { en: "45 min ferry from Singapore", id: "45 menit feri dari Singapura" },
  "hero.badge.verified":    { en: "Verified Partners Only",      id: "Hanya mitra terverifikasi" },
  "hero.slide.pause":       { en: "Pause background slideshow",  id: "Jeda slideshow latar" },
  "hero.slide.play":        { en: "Play background slideshow",   id: "Putar slideshow latar" },

  // Near Me section — free destination info, nothing for sale here
  "nearby.label":            { en: "Explore Batam",            id: "Jelajahi Batam" },
  "nearby.heading":          { en: "What's Around You",        id: "Apa Saja di Sekitar Anda" },
  "nearby.sub":              { en: "Beaches, temples, malls and more — honest info first, no checkout in this section. Tours that take you there are one scroll below.", id: "Pantai, vihara, mall dan lainnya — informasi dulu, tanpa checkout di section ini. Tour yang mengantar Anda ada satu scroll di bawah." },
  "nearby.searchPlaceholder":{ en: "Search places — beach, temple, mall…", id: "Cari tempat — pantai, vihara, mall…" },
  "nearby.openCatalogue":    { en: "Open full destination catalogue", id: "Buka katalog destinasi lengkap" },
  "nearby.clear":            { en: "Clear search",              id: "Hapus pencarian" },
  "nearby.filters":          { en: "these filters",            id: "filter ini" },
  "nearby.clearFilters":     { en: "Clear filters",            id: "Hapus filter" },
  "nearby.nearme":           { en: "Near Me",                  id: "Dekat Saya" },
  "nearby.locating":         { en: "Locating…",                id: "Mencari lokasi…" },
  "nearby.geoUnsupported":   { en: "This browser can't share your location.", id: "Browser ini tidak dapat membagikan lokasi Anda." },
  "nearby.geoDenied":        { en: "Location blocked. Allow it in your browser settings to see places near you.", id: "Lokasi diblokir. Izinkan di pengaturan browser untuk melihat tempat di dekat Anda." },
  "nearby.geoError":         { en: "Couldn't get your location just now. Try again.", id: "Lokasi Anda tidak dapat diambil saat ini. Coba lagi." },
  "nearby.tryAgain":         { en: "Try again",                id: "Coba lagi" },
  "nearby.noMatch":          { en: "No places match “{q}”.",   id: "Tidak ada tempat yang cocok dengan “{q}”." },
  "nearby.tryAnother":       { en: "Back",                     id: "Kembali" },
  "nearby.loadMore":         { en: "Load more",                id: "Muat lebih banyak" },
  "nearby.left":             { en: "left",                     id: "lagi" },
  "nearby.found":            { en: "{n} places found",         id: "{n} tempat ditemukan" },
  "nearby.reviews":          { en: "reviews",                  id: "ulasan" },
  "nearby.entryFee":         { en: "Entry fee",                id: "Tiket masuk" },
  "nearby.travelZone":       { en: "Travel zone",              id: "Zona perjalanan" },
  "nearby.facilities":       { en: "Facilities",               id: "Fasilitas" },
  "nearby.freeInfo":         { en: "Free to visit or pay at the gate — we don't sell anything for this place. What we sell is the ride that takes you there.", id: "Gratis atau bayar di lokasi — kami tidak menjual apa pun untuk tempat ini. Yang kami jual adalah perjalanan yang mengantar Anda ke sana." },
  "nearby.ctaHint":          { en: "Want a driver to take you here?", id: "Ingin diantar supir ke sini?" },
  "nearby.ctaJourney":       { en: "See tours in Journey",     id: "Lihat tour di Journey" },
  "nearby.chip.all":         { en: "All",                      id: "Semua" },
  "nearby.chip.nature":      { en: "Nature",                   id: "Alam" },
  "nearby.chip.culture":     { en: "Culture",                  id: "Budaya" },
  "nearby.chip.family":      { en: "Family",                   id: "Keluarga" },
  "nearby.chip.shopping":    { en: "Shopping",                 id: "Belanja" },
  "nearby.chip.souvenir":    { en: "Souvenir",                 id: "Oleh-oleh" },
  "nearby.chip.wellness":    { en: "Wellness",                 id: "Perawatan" },
  "nearby.cat.nature":       { en: "Nature",                   id: "Alam" },
  "nearby.cat.culture":      { en: "Culture",                  id: "Budaya" },
  "nearby.cat.family":       { en: "Family",                   id: "Keluarga" },
  "nearby.cat.shopping":     { en: "Shopping",                 id: "Belanja" },
  "nearby.cat.souvenir":     { en: "Souvenir",                 id: "Oleh-oleh" },
  "nearby.cat.wellness":     { en: "Wellness",                 id: "Perawatan" },
  "nearby.zone.center":      { en: "City zone",                id: "Zona kota" },
  "nearby.zone.mid":         { en: "Mid zone",                 id: "Zona tengah" },
  "nearby.zone.far":         { en: "Far zone",                 id: "Zona jauh" },
  // Spotlight strip (Batch 2 restructure): the featured rotator + card row.
  "nearby.viewDetails":      { en: "View details",             id: "Lihat detail" },
  "nearby.showAll":          { en: "All {n} places",           id: "Semua {n} tempat" },
  "nearby.spotlight.pause":  { en: "Pause featured rotation",  id: "Jeda rotasi unggulan" },
  "nearby.spotlight.play":   { en: "Play featured rotation",   id: "Putar rotasi unggulan" },
  "nearby.spotlight.goTo":   { en: "Show {name}",              id: "Tampilkan {name}" },
  "nearby.spotlight.region": { en: "Featured places in Batam", id: "Tempat unggulan di Batam" },
  "nearby.spotlight.prev":   { en: "Previous featured places", id: "Tempat unggulan sebelumnya" },
  "nearby.spotlight.next":   { en: "More featured places",     id: "Tempat unggulan berikutnya" },

  // Journey section — themed tours, the travel/taxi revenue line
  "journey.label":       { en: "Curated Journeys",           id: "Journey Terkurasi" },
  "journey.heading":     { en: "Pick a Theme, We Drive",     id: "Pilih Tema, Kami yang Menyetir" },
  "journey.sub":         { en: "Private car and driver by the day, priced by distance — the further the theme, the higher the fare. Stops are paid at the gate; the ride is what you buy.", id: "Mobil dan supir pribadi harian, harga berdasar jarak — semakin jauh temanya, semakin tinggi tarifnya. Tiket lokasi dibayar di tempat; yang Anda beli adalah perjalanannya." },
  "journey.theme.heritage":        { en: "Heritage & Chill", id: "Heritage & Santai" },
  "journey.theme.natureRelax":     { en: "Nature & Relax",   id: "Alam & Santai" },
  "journey.theme.shopTreat":       { en: "Shop & Treat",     id: "Belanja & Perawatan" },
  "journey.theme.islandExplorer":  { en: "Island Explorer",  id: "Jelajah Pulau" },
  "journey.transport":   { en: "Transport & driver included", id: "Transport & supir termasuk" },
  "journey.included":    { en: "What's included",            id: "Yang sudah termasuk" },
  "journey.notIncluded": { en: "Not included: meals, attraction tickets and treatments — paid by you at each stop.", id: "Belum termasuk: makan, tiket wisata dan perawatan — dibayar sendiri di tiap pemberhentian." },
  "journey.schedule":    { en: "Your schedule",              id: "Jadwal perjalanan" },
  "journey.addCart":     { en: "Add to Cart",                id: "Tambah ke Keranjang" },
  "journey.added":       { en: "Added!",                     id: "Ditambahkan!" },
  "journey.perPax":      { en: "per pax",                    id: "per orang" },
  "journey.day1":        { en: "1 day",                      id: "1 hari" },
  "journey.days2":       { en: "2 days",                     id: "2 hari" },
  "journey.daysUnit":    { en: "days",                       id: "hari" },
  "journey.minPax":      { en: "Min. 2 pax",                 id: "Min. 2 orang" },
  "journey.reviews":     { en: "reviews",                    id: "ulasan" },
  "journey.validity":    { en: "Valid 90 days — pick your date later", id: "Berlaku 90 hari — pilih tanggal belakangan" },
  "journey.savings":     { en: "Save {s} vs separate taxis", id: "Hemat {s} dibanding taksi terpisah" },
  "journey.moreStops":   { en: "+{n} more stops — tap for the full schedule", id: "+{n} pemberhentian lagi — ketuk untuk jadwal lengkap" },
  "journey.terminalLabel": { en: "Arrival terminal", id: "Terminal kedatangan" },
  "journey.terminalNote":  { en: "Times are calculated from {terminal} terminal. Driver meets you after immigration.", id: "Waktu dihitung dari terminal {terminal}. Supir menunggu setelah imigrasi." },
  "journey.zoneNote":    { en: "Island Explorer costs more because Barelang & Nongsa are 30–45 min further — the same distance surcharge Batam drivers charge.", id: "Island Explorer lebih mahal karena Barelang & Nongsa 30–45 menit lebih jauh — surcharge jarak yang sama seperti tarif supir Batam." },

  // FAQ
  "faq.label":         { en: "Good to Know",                 id: "Perlu Diketahui" },
  "faq.heading":       { en: "Questions, Answered",          id: "Pertanyaan, Terjawab" },
  "faq.sub":           { en: "The things Singapore visitors ask us most before booking.", id: "Hal yang paling sering ditanyakan pengunjung Singapura sebelum memesan." },
  "faq.q.how":         { en: "How do I use my ticket or tour?", id: "Bagaimana cara menggunakan tiket atau tour saya?" },
  "faq.a.how":         { en: "After payment you'll receive an e-ticket with a QR code. Show it to the ferry staff at check-in, or to your driver at the pickup point — one scan and you're in.", id: "Setelah pembayaran Anda menerima e-tiket dengan kode QR. Tunjukkan ke petugas feri saat check-in, atau ke supir di titik jemput — satu pindai dan Anda langsung jalan." },
  "faq.q.currency":    { en: "Are prices in SGD or IDR?",    id: "Harga dalam SGD atau IDR?" },
  "faq.a.currency":    { en: "Both are shown — toggle EN/ID to switch. You always pay in SGD by card via Stripe, with 3-D Secure verification.", id: "Keduanya ditampilkan — ganti EN/ID untuk berpindah. Pembayaran selalu dalam SGD via Stripe, dengan verifikasi 3-D Secure." },
  "faq.q.fees":        { en: "Is the ferry ticket all-in?",  id: "Apakah tiket feri sudah termasuk semua biaya?" },
  "faq.a.fees":        { en: "Yes. Our ferry fares already include the S$10 Singapore departure fee and the S$10 Batam terminal fee — no queue surprises.", id: "Ya. Harga feri kami sudah termasuk biaya keberangkatan Singapura S$10 dan biaya terminal Batam S$10 — tanpa kejutan di antrean." },
  "faq.q.passport":    { en: "How long must my passport be valid?", id: "Berapa lama paspor saya harus berlaku?" },
  "faq.a.passport":    { en: "At least 6 months from your travel date — Indonesian immigration is strict about this. Our booking form checks it for you.", id: "Minimal 6 bulan dari tanggal perjalanan — imigrasi Indonesia ketat soal ini. Formulir pemesanan kami memeriksanya untuk Anda." },
  "faq.q.visa":        { en: "Do I need a visa?",            id: "Apakah saya perlu visa?" },
  "faq.a.visa":        { en: "Singapore passports: visa-free, 30 days. Most other nationalities: Visa on Arrival at the terminal, US$15 (≤7 days) or US$35 (≤30 days), payable in cash.", id: "Paspor Singapura: bebas visa 30 hari. Kebanyakan kewarganegaraan lain: Visa on Arrival di terminal, US$15 (≤7 hari) atau US$35 (≤30 hari), dibayar tunai." },
  "faq.q.delay":       { en: "What if my ferry is delayed and I miss the tour?", id: "Bagaimana jika feri saya terlambat dan tour terlewat?" },
  "faq.a.delay":       { en: "Your driver tracks your ferry and waits — the itinerary shifts, it doesn't cancel.", id: "Supir Anda memantau feri dan menunggu — itinerary bergeser, bukan batal." },
  "faq.q.refund":      { en: "Can I get a refund or reschedule?", id: "Bisakah saya refund atau mengubah jadwal?" },
  "faq.a.refund":      { en: "Tours stay valid 90 days — reschedule free anytime before the day. Ferry tickets follow the operator's policy (usually free date change up to 24h before departure).", id: "Tour berlaku 90 hari — ubah jadwal gratis kapan pun sebelum hari-H. Tiket feri mengikuti kebijakan operator (umumnya ganti tanggal gratis hingga 24 jam sebelum berangkat)." },
  "faq.q.language":    { en: "What language does the driver speak?", id: "Supirnya berbahasa apa?" },
  "faq.a.language":    { en: "Every partner driver speaks Bahasa Indonesia and conversational English — enough for stops, timing and local tips.", id: "Semua supir mitra berbahasa Indonesia dan Inggris percakapan — cukup untuk pemberhentian, jadwal dan tips lokal." },
  "faq.q.meals":       { en: "Are meals and attraction tickets included in the tour price?", id: "Apakah makan dan tiket wisata termasuk dalam harga tour?" },
  "faq.a.meals":       { en: "No — the tour price is your private car, driver, fuel and parking. Meals, gate tickets and treatments are paid by you at each stop, so you only spend on what you actually want.", id: "Tidak — harga tour mencakup mobil pribadi, supir, BBM dan parkir. Makan, tiket masuk dan perawatan dibayar sendiri di tiap pemberhentian, jadi Anda hanya membayar yang benar-benar diinginkan." },

  // Ferry section
  "ferry.label":         { en: "Getting Here",               id: "Cara Tiba" },
  "ferry.heading":       { en: "Got a plan for Batam?",      id: "Sudah punya rencana di Batam?" },
  "ferry.sub":           { en: "Now the ticket to get there. Four terminals, three operators, under an hour on the water — booked directly, no redirects, no markups.", id: "Sekarang tiket untuk ke sana. Empat terminal, tiga operator, kurang dari satu jam di laut — dipesan langsung, tanpa redirect, tanpa markup." },
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
  "ferry.modal.addToCart":{ en: "Add ticket to cart",        id: "Tambahkan tiket ke keranjang" },
  "ferry.ticketName":    { en: "Ferry ticket",               id: "Tiket feri" },
  // The form no longer issues the ticket — checkout does, after payment. These
  // say exactly that, so the screen never claims an email that hasn't been sent.
  "ferry.modal.addedTitle":{ en: "Ticket added to your cart", id: "Tiket masuk ke keranjang" },
  "ferry.modal.addedBody":{ en: "Your crossing is held. Pay at checkout and the e-ticket is issued to your email.", id: "Tiket Anda ditahan. Bayar di checkout dan e-tiket diterbitkan ke email Anda." },
  "ferry.modal.viewCart":{ en: "View cart & checkout",       id: "Lihat keranjang & checkout" },
  "ferry.modal.keepBrowsing":{ en: "Keep browsing",          id: "Lanjut jelajah" },
  "ferry.modal.price":   { en: "Ticket price",               id: "Harga tiket" },
  "ferry.modal.demo":    { en: "Demo mode — no real payment is processed. E-ticket format matches BatamFast integration spec.", id: "Mode demo — tidak ada pembayaran nyata yang diproses. Format e-tiket sesuai spesifikasi integrasi BatamFast." },
  "ferry.modal.total":   { en: "Total",                      id: "Total" },
  "ferry.modal.passenger":{ en: "Passenger",                 id: "Penumpang" },
  "ferry.modal.route":   { en: "Route",                      id: "Rute" },
  "ferry.modal.datetime":{ en: "Date & Time",                id: "Tanggal & Waktu" },
  "ferry.modal.trip2":   { en: "Trip",                       id: "Perjalanan" },
  "ferry.tip1":          { en: "Book return tickets online — walk-up slots sell out on weekends.", id: "Pesan tiket pulang-pergi online — slot tanpa reservasi habis di akhir pekan." },
  "ferry.tip2":          { en: "Bring your passport. Indonesia visa-free entry for SG passports, 30 days.", id: "Bawa paspor Anda. Indonesia bebas visa untuk paspor Singapura, 30 hari." },
  "ferry.tip3":          { en: "Arrive 45 min before departure for immigration on both sides.", id: "Tiba 45 menit sebelum keberangkatan untuk imigrasi di kedua sisi." },
  "ferry.tip4":          { en: "Set your watch back 1 hour. Batam is WIB (UTC+7), Singapore is UTC+8.", id: "Putar jam Anda mundur 1 jam. Batam WIB (UTC+7), Singapura UTC+8." },
  "ferry.oneWay":        { en: "one-way",                      id: "sekali jalan" },
  "ferry.return":        { en: "return",                       id: "pulang pergi" },
  "ferry.note.batamcentre":  { en: "Largest terminal — best for Nagoya & city centre.", id: "Terminal terbesar — paling pas untuk Nagoya & pusat kota." },
  "ferry.note.harbourbay":   { en: "Closest to seafood, spa and duty-free shopping.", id: "Paling dekat ke seafood, spa, dan belanja bebas bea." },
  "ferry.note.sekupang":     { en: "Quieter terminal, north-west Batam.", id: "Terminal lebih sepi, Batam barat laut." },
  "ferry.note.nongsapura":   { en: "Best for Nongsa resorts and Avani Spa.", id: "Paling pas untuk resort Nongsa dan Avani Spa." },
  "ferry.badge.fastest":     { en: "Fastest crossing",           id: "Penyeberangan tercepat" },
  "ferry.badge.most":        { en: "Most departures",            id: "Keberangkatan terbanyak" },
  "ferry.badge.quiet":       { en: "Quieter crossing",           id: "Penyeberangan lebih sepi" },
  "ferry.badge.resort":      { en: "Resort gateway",             id: "Pintu gerbang resort" },
  "ferry.modal.nationality": { en: "Nationality (as in passport)", id: "Kewarganegaraan (sesuai paspor)" },
  "ferry.modal.voaNotice":   { en: "Visa on Arrival required on landing in Batam: US$ 15 (≤7 days) or US$ 35 (≤30 days), payable in cash at the terminal.", id: "Visa on Arrival diperlukan saat tiba di Batam: US$ 15 (≤7 hari) atau US$ 35 (≤30 hari), dibayar tunai di terminal." },
  "ferry.modal.fareTicket":  { en: "Ticket fare + surcharge",  id: "Harga tiket + surcharge" },
  "ferry.modal.fareSgFee":   { en: "Singapore departure fee",  id: "Biaya keberangkatan Singapura" },
  "ferry.modal.fareBatamFee":{ en: "Batam terminal fee",       id: "Biaya terminal Batam" },
  "ferry.modal.returnSaving":{ en: "Return-ticket saving",     id: "Hemat tiket pulang-pergi" },
  // Bridge from a completed ferry booking to a day tour — the buyer has a
  // crossing but no wheels. The tours are car-and-driver only, which is
  // exactly the gap left open.
  "ferry.upsell.title":      { en: "Add a driver for the day?", id: "Tambah supir untuk sehari?" },
  "ferry.upsell.body":       { en: "Your crossing is booked. Our day tours are car and driver only — no second ferry ticket — so nothing you have paid for gets charged again.", id: "Tiket feri Anda sudah dipesan. Tour kami hanya mobil dan supir — tanpa tiket feri kedua — jadi tidak ada yang sudah Anda bayar tertagih lagi." },
  "ferry.upsell.cta":        { en: "See day tours",             id: "Lihat tour harian" },
  "ferry.upsell.dismiss":    { en: "No thanks",                 id: "Tidak, terima kasih" },
  "ferry.modal.nameRequired":{ en: "Full name is required.",      id: "Nama lengkap wajib diisi." },
  "ferry.modal.passportRequired":{ en: "Passport number is required.", id: "Nomor paspor wajib diisi." },
  "ferry.modal.expiryRequired":{ en: "Expiry date is required.",   id: "Tanggal kedaluwarsa wajib diisi." },
  "ferry.modal.verified":{ en: "Passport validity verified", id: "Validitas paspor terverifikasi" },
  "ferry.modal.passportInvalid":{ en: "Passport must be valid for at least 6 months from your travel date. Your passport expires {expiry}, but needs to be valid until at least {min}.", id: "Paspor harus berlaku minimal 6 bulan dari tanggal perjalanan Anda. Paspor Anda kedaluwarsa pada {expiry}, tetapi harus berlaku hingga minimal {min}." },

  // Cart
  "cart.title":      { en: "Your Cart",                         id: "Keranjang" },
  "cart.subtitle":   { en: "Tours & ferry tickets, confirmed instantly.", id: "Tour & tiket feri, dikonfirmasi langsung." },
  "cart.close":      { en: "Close cart",                        id: "Tutup keranjang" },
  "cart.open":       { en: "Open cart",                         id: "Buka keranjang" },
  "cart.remove":     { en: "Remove",                            id: "Hapus" },
  // The small print under the cart total. The two lines carry different notes
  // because the main figure flips currency with the locale: in English the
  // total is in SGD and the IDR is the approximation, and in Indonesian it is
  // the other way round.
  "cart.noteIdr":    { en: "paid in IDR",                       id: "dibayar dalam IDR" },
  "cart.noteSgd":    { en: "charged in SGD",                    id: "dibayar dalam SGD" },
  // Shown in the cart drawer only under the id locale: the main figure there is
  // IDR, but the card is always billed in SGD. Mirrors checkout's chargedSgd note
  // so the two surfaces never disagree about what the buyer is actually charged.
  "cart.chargedSgd": { en: "charged in SGD",                    id: "ditagih dalam SGD" },
  "cart.empty":      { en: "Your cart is empty.",               id: "Keranjang kosong." },
  "cart.emptyBody":  { en: "Add a tour or ferry ticket to get started.", id: "Tambahkan tour atau tiket feri untuk mulai." },
  "cart.subtotal":   { en: "Subtotal",                          id: "Subtotal" },
  "cart.fee":        { en: "Booking fee",                       id: "Biaya pemesanan" },
  "cart.free":       { en: "Free",                              id: "Gratis" },
  "cart.total":      { en: "Total",                             id: "Total" },
  "cart.checkout":   { en: "Checkout",                          id: "Checkout" },
  "cart.qrVoucher":  { en: "E-Ticket",                         id: "E-Tiket" },
  // Double-booking warning — one line already includes what another line
  // charges for again.
  "cart.clash.title":{ en: "Heads up — you may be paying twice", id: "Perhatian — mungkin Anda membayar dua kali" },
  "cart.clash.body": { en: "{includes} already includes {covered}, so {redundant} is a duplicate. Remove whichever you don't need.", id: "{includes} sudah termasuk {covered}, jadi {redundant} adalah duplikat. Hapus salah satu yang tidak diperlukan." },
  "cart.covers.ferry":  { en: "the return ferry",              id: "feri pulang-pergi" },
  "cart.covers.driver": { en: "a car and driver",              id: "mobil dan supir" },
  "cart.badgeRoute": { en: "Ferry",                            id: "Feri" },
  "cart.badgeDeal":  { en: "Tour",                             id: "Tour" },
  "cart.items":      { en: "items",                             id: "item" },
  "cart.item":       { en: "item",                              id: "item" },

  // ── Checkout — the card + 3-D Secure flow ──────────────────────────────────
  // Localised last, on purpose. This is the most trust-sensitive screen in the
  // product: it is where someone types a card number, and the one place a
  // half-translated sentence — or a currency that disagrees with the charge —
  // turns into an abandoned sale.
  //
  // The currency rule here is the same one the e-tickets use: the card is ALWAYS
  // charged in SGD (the order API is called with currency: "SGD"), so the locale
  // only changes what is displayed. Under `id` the rupiah becomes the main
  // figure and the SGD charge is stated in the note beneath it — never the other
  // way round, which would read as "you are being charged rupiah".
  "checkout.title":        { en: "Payment",                        id: "Pembayaran" },
  "checkout.secured":      { en: "Secured by Stripe · your bank will ask you to verify this purchase.", id: "Diamankan Stripe · bank Anda akan meminta verifikasi atas pembelian ini." },
  "checkout.name":         { en: "Name on booking",                id: "Nama pada pemesanan" },
  "checkout.namePh":       { en: "e.g. Rachel Tan",                id: "cth. Rachel Tan" },
  "checkout.email":        { en: "Email for e-tickets",            id: "Email untuk e-tiket" },
  "checkout.card":         { en: "Card number",                    id: "Nomor kartu" },
  "checkout.expiry":       { en: "Expiry",                         id: "Kedaluwarsa" },
  "checkout.pay":          { en: "Pay {amount}",                   id: "Bayar {amount}" },
  "checkout.details.back": { en: "Back",                           id: "Kembali" },
  "checkout.errIncomplete":{ en: "Please complete all fields — name, email, 16-digit card, expiry and CVC.", id: "Mohon lengkapi semua kolom — nama, email, kartu 16 digit, tanggal kedaluwarsa dan CVC." },
  // The locked Pay button says exactly which field is missing rather than
  // leaving the visitor to guess (autofill paints the input without firing
  // onChange, so "it looks filled" is not the same as "it is filled").
  "checkout.stillNeeded":  { en: "Still needed: {list}",           id: "Masih diperlukan: {list}" },
  "checkout.need.name":    { en: "name",                           id: "nama" },
  "checkout.need.email":   { en: "email",                          id: "email" },
  "checkout.need.card":    { en: "16-digit card",                  id: "kartu 16 digit" },
  "checkout.need.expiry":  { en: "expiry (MM/YY)",                 id: "kedaluwarsa (BB/TT)" },
  "checkout.need.cvc":     { en: "CVC",                            id: "CVC" },
  "checkout.demoNote":     { en: "Demo checkout — no real charge. Use any 16-digit number, e.g. 4242 4242 4242 4242.", id: "Checkout demo — tidak ada tagihan nyata. Pakai nomor 16 digit apa pun, cth. 4242 4242 4242 4242." },

  "checkout.verify.title":   { en: "Verify your payment",          id: "Verifikasi pembayaran Anda" },
  "checkout.verify.body":    { en: "Your bank requires an extra check (3-D Secure) before this {amount} payment goes through.", id: "Bank Anda memerlukan pemeriksaan tambahan (3-D Secure) sebelum pembayaran {amount} ini diproses." },
  "checkout.verify.approve": { en: "Approve in your banking app, or enter the SMS code", id: "Setujui di aplikasi bank Anda, atau masukkan kode SMS" },
  "checkout.verify.sentTo":  { en: "Sent to the mobile number linked to card •••• {last4}", id: "Dikirim ke nomor HP yang terhubung ke kartu •••• {last4}" },
  "checkout.verify.code":    { en: "6-digit verification code",    id: "Kode verifikasi 6 digit" },
  "checkout.verify.submit":  { en: "Verify & complete payment",    id: "Verifikasi & selesaikan pembayaran" },
  "checkout.verify.back":    { en: "Back to card details",         id: "Kembali ke data kartu" },
  "checkout.verify.demoNote":{ en: "Demo: enter any 6 digits, e.g. 123456.", id: "Demo: masukkan 6 digit apa pun, cth. 123456." },
  "checkout.errOtp":         { en: "Enter the 6-digit verification code.", id: "Masukkan kode verifikasi 6 digit." },

  "checkout.processing.title":{ en: "Confirming with your bank…",  id: "Mengonfirmasi ke bank Anda…" },
  "checkout.processing.body": { en: "Issuing your e-tickets.",     id: "Menerbitkan e-tiket Anda." },
  "checkout.processing.aria": { en: "Processing payment",          id: "Memproses pembayaran" },

  "checkout.emptyTitle":   { en: "Your cart is empty",             id: "Keranjang Anda kosong" },
  "checkout.emptyBody":    { en: "Add a tour or ferry ticket first, then come back to check out.", id: "Tambahkan tour atau tiket feri dulu, lalu kembali ke checkout." },

  "checkout.summary":      { en: "Order summary",                  id: "Ringkasan pesanan" },
  "checkout.chargedSgd":   { en: "charged in SGD",                 id: "ditagih dalam SGD" },
  "checkout.verifiedNote": { en: "Every purchase is verified with your bank before vouchers are issued.", id: "Setiap pembelian diverifikasi dengan bank Anda sebelum voucher diterbitkan." },
  // A failed order must never leave the visitor wondering whether they were
  // billed — so the reassurance is part of the message, not a separate line.
  "checkout.errNotCharged":{ en: "{msg} — your card was not charged.", id: "{msg} — kartu Anda tidak ditagih." },
  "checkout.errIssue":     { en: "We couldn't issue your tickets. Your card was not charged.", id: "Kami tidak dapat menerbitkan tiket Anda. Kartu Anda tidak ditagih." },

  // How it works — three steps, then the FAQ answers in the same section
  "how.label":      { en: "How It Works",   id: "Cara Kerja" },
  "how.heading1":   { en: "Three Steps.",   id: "Tiga Langkah." },
  "how.heading2":   { en: "Pure Simplicity.", id: "Sederhana Sepenuhnya." },
  "how.sub":        { en: "From payment to your driver at the terminal, every step stays effortless.", id: "Dari pembayaran sampai supir menjemput Anda di terminal, setiap langkah tetap mudah." },
  "how.step1.title":{ en: "Book in SGD",    id: "Pesan dalam SGD" },
  "how.step1.desc": { en: "Pick your ferry or tour and pay securely by card in Singapore Dollars.", id: "Pilih feri atau tour lalu bayar dengan aman memakai kartu dalam Dolar Singapura." },
  "how.step2.title":{ en: "Get Your E-Ticket", id: "Terima E-Tiket" },
  "how.step2.desc": { en: "Your e-ticket arrives instantly with a QR code — ferry check-in and driver pickup both scan the same one.", id: "E-tiket Anda langsung terbit dengan kode QR — check-in feri dan penjemputan supir memindai kode yang sama." },
  "how.step3.title":{ en: "Enjoy Batam",    id: "Nikmati Batam" },
  "how.step3.desc": { en: "Show the QR, board, and your driver is waiting. No app to download, no queue at the counter.", id: "Tunjukkan QR, naik kapal, dan supir Anda sudah menunggu. Tanpa unduh aplikasi, tanpa antre di loket." },

  // Footer
  "footer.tagline":   { en: "Ferry and tours — one smart checkout.", id: "Feri dan tour — satu checkout pintar." },
  "footer.legal.privacy": { en: "Privacy Policy",    id: "Kebijakan Privasi" },
  "footer.legal.terms":   { en: "Terms of Service",  id: "Ketentuan Layanan" },
  "footer.legal.cookies": { en: "Cookie Policy",     id: "Kebijakan Cookie" },
  "footer.legal.refunds": { en: "Refund Policy",     id: "Kebijakan Refund" },
  "footer.copyright": { en: "© {year} BatamSmart. All rights reserved.", id: "© {year} BatamSmart. Hak cipta dilindungi." },
  "footer.location":  { en: "Batam, Kepulauan Riau, Indonesia · SGD / IDR supported", id: "Batam, Kepulauan Riau, Indonesia · mendukung SGD / IDR" },
  "footer.viewCart":  { en: "View Cart", id: "Lihat Keranjang" },

  // ── Account / e-tickets ────────────────────────────────────────────────────
  "nav.signin":     { en: "Sign in",       id: "Masuk" },
  "nav.myTickets":  { en: "My Tickets",    id: "Tiket Saya" },
  "nav.signout":    { en: "Sign out",      id: "Keluar" },
  "auth.signedOut": { en: "Signed out successfully", id: "Berhasil keluar" },
  "nav.account":    { en: "Account menu",  id: "Menu akun" },
  "nav.primary":    { en: "Main sections", id: "Seksi utama" },
  "nav.openMenu":   { en: "Open menu",     id: "Buka menu" },
  "nav.closeMenu":  { en: "Close menu",    id: "Tutup menu" },
  "loading.sea":     { en: "Crossing to Batam", id: "Menyeberang ke Batam" },

  "signin.title":   { en: "Sign in",       id: "Masuk" },
  "signin.sub":     { en: "Sign in to keep every ticket in one place — ferry and tours.", id: "Masuk agar semua tiket tersimpan di satu tempat — feri dan tour." },
  "signin.email":   { en: "Email",         id: "Email" },
  "signin.password":{ en: "Password",      id: "Password" },
  "signin.submit":  { en: "Sign in",       id: "Masuk" },
  "signin.demoTitle":{ en: "Demo account — tap to copy", id: "Akun demo — ketuk untuk salin" },
  "signin.demoCopy":{ en: "Copy",          id: "Salin" },
  "signin.demoCopied":{ en: "Copied",      id: "Tersalin" },
  "signin.demoUse": { en: "Use these",     id: "Pakai ini" },
  "signin.demoCopyLabel":{ en: "Copy demo email", id: "Salin email demo" },
  "signin.demoCopyPass":{ en: "Copy demo password", id: "Salin password demo" },
  "signin.privacy": { en: "We store only your name and email, and use them to show your tickets. Nothing is sold or shared.", id: "Kami hanya menyimpan nama dan email Anda, dan memakainya untuk menampilkan tiket. Tidak dijual atau dibagikan." },
  "signin.setupHint":{ en: "Add the missing variables to .env.local (locally) or Vercel → Settings → Environment Variables, then restart. See .env.example for the full list.", id: "Tambahkan variabel yang kurang ke .env.local (lokal) atau Vercel → Settings → Environment Variables, lalu restart. Lihat .env.example untuk daftar lengkapnya." },
  "signin.needDemo":{ en: "Demo sign-in needs DEMO_EMAIL and DEMO_PASSWORD.", id: "Login demo butuh DEMO_EMAIL dan DEMO_PASSWORD." },
  "signin.needDb":  { en: "Tickets need a database — set DATABASE_URL. Without it the store is in-memory and resets on every deploy.", id: "Tiket butuh database — set DATABASE_URL. Tanpanya penyimpanan hanya di memori dan hilang setiap deploy." },

  "tickets.mine":        { en: "My Tickets",     id: "Tiket Saya" },
  "tickets.mineCount":   { en: "{n} orders in your account.", id: "{n} pesanan di akun Anda." },
  "tickets.mineEmpty":   { en: "No tickets yet.", id: "Belum ada tiket." },
  "tickets.mineEmptyBody":{ en: "Tickets appear here as soon as you complete a purchase with this email.", id: "Tiket akan muncul di sini setelah Anda menyelesaikan pembelian dengan email ini." },
  "tickets.browse":      { en: "Browse journeys", id: "Jelajahi journey" },
  "tickets.view":        { en: "View",            id: "Lihat" },
  "tickets.ferryLegs":   { en: "{n} ferry",       id: "{n} feri" },
  "tickets.pdfHint":     { en: "Open any order to download its PDF.", id: "Buka pesanan mana pun untuk mengunduh PDF-nya." },

  "tickets.title":       { en: "Your E-Tickets", id: "E-Tiket Anda" },
  "tickets.paid":        { en: "Payment confirmed", id: "Pembayaran dikonfirmasi" },
  "tickets.sentTo":      { en: "E-tickets sent to {email}", id: "E-tiket dikirim ke {email}" },
  "tickets.order":       { en: "Order",           id: "Pesanan" },
  "tickets.active":      { en: "Active",          id: "Aktif" },
  "tickets.scanHint":    { en: "Scan to open online", id: "Scan untuk buka online" },
  "tickets.guest":       { en: "Guest",           id: "Tamu" },
  "tickets.passenger":   { en: "Passenger",       id: "Penumpang" },
  "tickets.passport":    { en: "Passport",        id: "Paspor" },
  "tickets.crossing":    { en: "Crossing",        id: "Rute" },
  "tickets.departure":   { en: "Departure",       id: "Keberangkatan" },
  "tickets.trip":        { en: "Trip",            id: "Tipe perjalanan" },
  "tickets.value":       { en: "Value",           id: "Nilai" },
  "tickets.valid":       { en: "Valid",           id: "Berlaku" },
  "tickets.validValue":  { en: "90 days from issue · single redemption", id: "90 hari sejak diterbitkan · sekali pakai" },
  "tickets.voucher":     { en: "ticket",          id: "tiket" },
  "tickets.vouchers":    { en: "tickets",         id: "tiket" },
  "tickets.chargedIn":   { en: "charged in",      id: "ditagih dalam" },
  "tickets.downloadPdf": { en: "Download PDF",    id: "Unduh PDF" },
  "tickets.allTickets":  { en: "All my tickets",  id: "Semua tiket saya" },
  "tickets.saveToAccount":{ en: "Save to my account", id: "Simpan ke akun saya" },
  "tickets.backHome":    { en: "Back to BatamSmart", id: "Kembali ke BatamSmart" },
  "tickets.redeemNote":  { en: "Show the QR code at the terminal or the meeting point. Each ticket is single-use and non-refundable once scanned. Payment verified with 3-D Secure.", id: "Tunjukkan kode QR di terminal atau titik temu. Setiap tiket sekali pakai dan tidak dapat dikembalikan setelah dipindai. Pembayaran diverifikasi dengan 3-D Secure." },

  "notFound.title":      { en: "Ticket not found", id: "Tiket tidak ditemukan" },
  "notFound.body":       { en: "This link is wrong, or the ticket was issued on a different environment. Check the link in your email, or sign in to see your tickets.", id: "Tautan ini salah, atau tiket diterbitkan di lingkungan berbeda. Periksa tautan di email Anda, atau masuk untuk melihat tiket Anda." },
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (key) => translations[key]?.en ?? key,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  const t = (key: string) => translations[key]?.[locale] ?? translations[key]?.en ?? key;

  // Keep <html lang> in step with the chosen language. Without this the page
  // claims to be English while showing Indonesian, and a screen reader
  // pronounces the Indonesian text with English phonetics — WCAG 3.1.1. The
  // attribute is set post-mount rather than during render because the server
  // always renders "en"; changing it during render would mismatch hydration.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

# Restrukturisasi Halaman Utama — Spesifikasi FINAL

> Status: **DISETUJUI TIM — siap dikerjakan.**
> Dasar: arahan struktur dari tim + keputusan tim (§1) + riset travel Batam (§3a).
> 12 Sep 2026.

---

## 1. Ringkasan & Keputusan Tim

Struktur halaman utama diubah dari "satu section Deals berisi semua" menjadi
**funnel perjalanan wisatawan**: informasi gratis di atas, produk berbayar di
bawah, dan bundling sebagai penutup yang melibatkan kedua calon client
(operator ferry + perusahaan travel) dalam satu layar.

```
Hero (pencarian)
  ↓
Near Me      — info destinasi, GRATIS (traffic & SEO, bukan revenue)
  ↓
Journey      — kurasi 4 tema + paket tour → REVENUE: travel/taxi
  ↓
Tiket Ferry  — booking ferry SG⇄Batam   → REVENUE: operator ferry
  ↓
Bundling     — city tour + tiket ferry  → REVENUE: gabungan ⭐
  ↓
FAQ          — menjawab keberatan terakhir sebelum checkout
```

**Keputusan tim (FINAL):**

| # | Pertanyaan | Keputusan |
|---|---|---|
| 1 | Nasib merchant Deals (voucher seafood/spa/mall) | **HAPUS.** Tidak ada lagi merchant deals — client hanya dua scope: **terminal ferry + travel**. Harga tour = **biaya perjalanan A→B berbasis jarak** (semakin jauh semakin mahal) |
| 2 | Posisi ferry di bawah Journey | **Tetap** — naratif: bundle yang menyelesaikan |
| 3 | Pengoperasi logistik bundle | **Partner travel** — model "kita platform, mereka roda-nya". Riset membuktikan cocok (§3a) |

**Konsekuensi keputusan #1 (penghapusan):**
`DealsSection`, `MerchantCard`, `HeroDealCard`, `PurchaseToast`,
`src/lib/merchants.ts`, dan halaman `/merchants` dihapus. Keranjang, checkout,
3DS, dan e-tiket tetap — item yang masuk cart sekarang berasal dari Journey,
ferry, dan bundling.

---

## 2. Section 1 — Near Me (gratis, informasi)

**Tujuan:** menjawab "ada apa di Batam?" Tanpa tombol beli. Fungsi bisnisnya
adalah traffic, SEO, dan alasan kembali — bukan revenue langsung.

**Konten per kartu destinasi:**
nama, kategori, foto, deskripsi singkat, lokasi (area + koordinat), fasilitas
(ikon: parkir, toilet, mushola, wifi, akses kursi roda), rating + jumlah
ulasan, jam buka, harga tiket masuk (atau "Gratis"), jarak dari pengguna
(jika lokasi dibagikan).

**Data awal:**

| Destinasi | Kategori | Catatan |
|---|---|---|
| Barelang Bridge Viewpoint | Alam | 24 jam, tiket gratis, **zona jauh** |
| Nongsa Beach | Alam | **zona jauh** |
| Mangrove Sei Beduk / Nongsa | Alam | sesuai permintaan tim |
| Batam Miniature Park | Alam/Keluarga | tiket masuk |
| Maha Vihara Duta Maitreya | Budaya | populer di tur SG (ada di itinerary Klook) |
| Masjid Raya Batam | Budaya | Batam Centre, dekat terminal ferry |
| Nagoya Hill | Oleh-oleh | pusat kawasan Nagoya |
| Mega Mall / Grand Batam / BCS Mall | Shopping | tiga mall dari arahan tim |
| Harbour Bay Mall | Shopping | dekat terminal Harbour Bay |

**Model data baru** — dipisah dari konsep merchant lama:

```ts
// src/lib/destinations.ts
export type Zone = "center" | "mid" | "far"; // untuk tarif A→B (keputusan #1)

export type Destination = {
  id: number;
  name: string;
  category: "Nature" | "Culture" | "Family" | "Shopping" | "Souvenir";
  desc: string;
  area: string;               // "Barelang, Batam"
  zone: Zone;                 // center = Batam Centre/Nagoya, mid, far = Barelang/Nongsa
  lat: number; lng: number;
  facilities: string[];       // ["Parking", "Toilets", "Prayer room"]
  rating: number; reviews: number;
  hours: string;              // "06:00 – 18:00 WIB" | "Open 24 hours"
  entryFee: string;           // "Free" | "Rp 15.000"
  photo: string;
};
```

**Interaksi:**
- Peta near-me (yang sekarang di dalam DealsSection) **pindah ke section ini**
- Tombol "Near Me" meminta geolokasi → urutkan kartu berdasar jarak
- Klik kartu → modal detail (pola `DetailModal` yang sudah ada)
- **Tidak ada Add to Cart.** CTA: "Lihat di Journey" (scroll ke bawah).

---

## 3. Section 2 — Journey (REVENUE: travel/taxi)

**Tujuan:** mengubah "saya mau ke X" menjadi "paket tour yang mengantar saya".

**Empat tema (dari tim):**

| Tema | Destinasi | Zona dominan |
|---|---|---|
| 🌿 **Alam** | Pantai Nongsa, mangrove reserve, Miniature Park, Barelang | mid–far |
| 🎁 **Oleh-oleh** | Kawasan Nagoya | center |
| 💆 **Perawatan** | Salon & spa (sebagai *stop* di itinerary, bukan voucher) | center |
| 🛍️ **Shopping** | Mega Mall, Grand Batam, BCS, Harbour Bay | center |

> Catatan penyesuaian dari keputusan #1: spa/salon/mall bukan lagi merchant
> voucher. Mereka adalah **pemberhentian di dalam itinerary tour** — yang
> dijual adalah perjalanannya, pengeluaran di lokasi dibayar sendiri oleh
> wisatawan. Ini malah menyederhanakan cerita ke partner travel.

**Produk per tema — harga berbasis jarak (keputusan #1):**

Model pasaran lokal: tarif dasar mobil+supir harian + surcharge zona jauh.
Kita jual **per pax**, dihitung dari tarif mobil dibagi kapasitas + margin:

| Paket | Durasi | Destinasi | Harga per pax* |
|---|---|---|---|
| 1-Day Tour — Oleh-oleh / Perawatan / Shopping | 4–5 jam | 3–4 stop zona center | **S$ 45** |
| 1-Day Tour — Alam | 6–8 jam | 3–4 stop termasuk zona far | **S$ 65** |
| 2-Day Tour — kombinasi 2 tema | 2 hari | 6–8 stop | **S$ 110** |

\* Dasar hitungan: Avanza all-in Rp 650rb/hari (~S$55) ÷ 4 pax + surcharge
zona far (Rp 100–150rb) + margin platform. Cocok dengan pasaran driver
privat ~S$70/mobil/hari dan tur terjadwal S$88–122/pax.

**Struktur section:**
1. Tab/chip 4 tema di atas
2. Per tema: kartu destinasi terkait (referensi dari data Near Me — bukan
   duplikasi) + **panel paket tour** dengan itinerary jam:
   "09:00 jemput terminal/hotel → 09:45 Nongsa → 12:00 makan siang → …"
   (pola slot-swap dari ItinerarySection yang sudah ada)
3. Harga SGD/IDR mengikuti locale (pola yang sudah ada)
4. CTA: Add to Cart → checkout flow yang sudah ada

**Catatan migrasi:** `ItinerarySection` dilebur menjadi `JourneySection` —
konsepnya sama (paket seharian, slot bisa ditukar), diperluas jadi 4 tema.
Tidak menulis ulang dari nol.

---

## 3a. Riset: bagaimana travel di Batam beroperasi (jawaban pertanyaan #3)

Dari riset operator lokal (Batam Travel Holiday, Batam D'Sarana, Quinley
Trans, INKO NURI JAYA, Apsa Transport) dan agregator (Klook, Tripadvisor,
JA Travel):

1. **Model umum: "sewa mobil + supir all-in", bukan per-orang.**
   Harga pasaran **Rp 550.000–650.000/hari** (±12 jam, Avanza/Xenia) termasuk
   supir + BBM + parkir. Hiace untuk grup 10–15. Setiap operator punya
   **daftar supir aktif** — persis seperti yang dikatakan tim. Booking
   mayoritas masih lewat **WhatsApp** → peluang diferensiasi kita:
   booking online + bayar kartu sebelum berangkat.

2. **Pasar tur dari Singapore sudah terbukti:**
   - JA Travel 1-Day Batam Tour: **S$110–120/pax** (grup 2–4, mobil privat)
   - Klook 1-Day Private Tour dari SG: **~S$99–122/pax** (ferry + tour + makan)
   - Driver privat saja (tanpa ferry): **~S$70/mobil/hari** (≤4 pax)
   - 2D1N/3D2N: hotel + transport + makan + guide berbahasa Inggris
   - → Harga bundling kita (S$89 1-day / S$179 2D1N) **kompetitif di bawah
     pasaran** — wajar untuk peluncuran.

3. **Harga bertingkat berbasis jarak (keputusan #1) sesuai praktik lokal:**
   operator mengenakan tarif dasar harian + **surcharge area jauh** (Barelang,
   Nongsa, Galang: tambahan Rp 50–150rb karena jarak & tol). Model zona
   `center/mid/far` kita mencerminkan biaya riil partner.

4. **Yang ditawarkan ke partner travel saat presentasi:**
   "Selama ini Anda jualan lewat WhatsApp dengan harga all-in harian. Kami
   jual paket Anda online, dibayar kartu kredit oleh turis Singapore **sebelum
   mereka berangkat** — Anda tinggal menjalankan trip dengan supir aktif Anda."
   Data yang kita butuhkan dari mereka: daftar armada + kapasitas, jadwal
   supir aktif, tarif dasar + surcharge per zona, bahasa supir.

---

## 4. Section 3 — Tiket Ferry

**Sudah ada dan sudah akurat** (published fare BatamFast S$43/76, validasi
paspor 6 bulan, field kewarganegaraan + VOA, breakdown biaya). Yang berubah:
- Judul penghubung: "Sudah punya rencana di Batam? Sekarang tiket ke sana."
- Setelah booking ferry sukses → tawaran: "Tambahkan city tour? Hemat
  S$ 15 kalau dibundling" (jembatan ke section 5).

---

## 5. Section 4 — Bundling City Tour + Ferry ⭐ (produk bintang demo)

**Tujuan:** satu produk yang melibatkan KEDUA client sekaligus — inilah yang
membuat presentasi ke ferry dan travel menjadi satu cerita yang sama.

**Produk awal (2 SKU):**

| Paket | Isi | Harga |
|---|---|---|
| **1-Day Batam Express** | Ferry PP SG⇄Batam + driver 8 jam + 3 destinasi (1 tema pilihan) | **S$ 89/pax** (hemat ~S$ 15 vs terpisah) |
| **2D1N Batam Complete** | Ferry PP + hotel 1 malam + driver 2 hari + 6 destinasi (2 tema) + makan siang | **S$ 179/pax** |

Harga ini di bawah pasaran S$99–122 (Klook/JA Travel) — posisi peluncuran
yang kuat untuk presentasi.

**Konten kartu bundling:**
- Timeline visual berdasar jadwal ferry riil (keberangkatan HarbourFront ±
  tiap jam, pelayaran ±45–70 menit): "07:40 check-in HarbourFront → 09:00
  tiba Batam Centre → 09:30 destinasi 1 → … → 18:30 ferry pulang"
- Rincian termasuk/tidak termasuk
- Badge hemat ("Save S$ 15 vs booking separately")
- Add to Cart → checkout yang sudah ada

**Pertanyaan operasional untuk presentasi (siapkan jawabannya):**
- Siapa yang menjemput di terminal Batam? → supir partner travel (meet & greet,
  praktik standar — Batam Travel Holiday dsb. sudah melakukannya)
- Kalau ferry delay? → itinerary digeser; supir standby (kebijakan partner,
  tampilkan di FAQ)
- Minimum pax? → 2 pax; solo traveler kena surcharge (praktik JA Travel:
  makin kecil grup makin mahal per pax)

---

## 6. Section 5 — FAQ

Accordion sederhana. Draf isi:

1. Bagaimana cara pakai tiket/tour saya? → tunjukkan e-tiket (QR) ke supir/petugas
2. Apakah harga dalam SGD atau IDR? → keduanya ditampilkan; bayar SGD via Stripe
3. Apakah tiket ferry sudah termasuk departure fee? → ya, S$10 SG + S$10 Batam
4. Paspor saya berlaku sampai kapan minimal? → 6 bulan dari tanggal perjalanan
5. Perlu visa? → Singapore bebas visa 30 hari; negara lain VOA US$15/35
6. Kalau ferry saya delay dan tour terlewat? → supir menunggu, itinerary digeser (kebijakan partner travel)
7. Bisa refund/reschedule? → usul: tour fleksibel 90 hari; ferry mengikuti aturan operator
8. Bahasa apa yang dipakai supir? → Inggris & Indonesia
9. Apakah makan dan tiket masuk termasuk dalam tour? → transport + supir termasuk; makan & tiket masuk dibayar sendiri di lokasi (kecuali paket 2D1N)

---

## 7. Dampak teknis

| Perubahan | File | Ukuran |
|---|---|---|
| Data destinasi baru (dengan zona) | `src/lib/destinations.ts` (baru) | M |
| Section Near Me | `src/components/NearMeSection.tsx` (baru) — peta pindah ke sini | M |
| Journey 4 tema | `ItinerarySection.tsx` → `JourneySection.tsx` | L |
| Bundling | `BundleSection.tsx` (baru) + `src/lib/bundles.ts` | M |
| FAQ | `FaqSection.tsx` (baru) | S |
| **Hapus Deals** (keputusan #1) | `DealsSection.tsx`, `MerchantCard.tsx`, `HeroDealCard.tsx`, `PurchaseToast.tsx`, `src/lib/merchants.ts`, `src/app/merchants/` | M |
| Urutan section + hero search retarget | `src/app/page.tsx` | S |
| Terjemahan EN/ID | `locale-context.tsx` (+~60 key, −key deals lama) | M |
| Navbar links | `Navbar.tsx` (Deals→Journey, +Bundle, +FAQ) | S |

**Yang tidak berubah:** checkout, 3DS, e-tiket, cart persistence, token desain.

---

## 8. Urutan pengerjaan

1. Data destinasi + Near Me section (fondasi, dipakai Journey)
2. Journey 4 tema dengan harga berbasis zona (jantung revenue travel)
3. Bundling (bintang demo) — butuh Journey selesai dulu
4. FAQ + navbar/urutan section
5. Penghapusan Deals + bersih-bersih (terakhir, supaya tidak ada state rusak di tengah jalan)

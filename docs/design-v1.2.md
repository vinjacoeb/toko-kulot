# Desain v1.2 — Pembayaran tanpa Snap, Ongkir Otomatis, Admin, Riwayat, Tipografi

> Kartu: `t_a05222c7` · 24 Oktober 2026 · Status: **mengikat** untuk Frontend & QA.
> Rujukan: `docs/PRD-v1.2.md` §2–§9 · `docs/kontrak-props.md` §7.7, §7.7a, §7.12, §7.13, §12.16, §12.17, §12.25, §13 · `docs/design-v1.1.md` §2 (token).
> Bagian design-v1.1 yang **digantikan**: §6.4 (tombol "Cek Ongkir"), §7.3–§7.5 (Snap, redirect `example.com`, polling 5 detik), §11.1–§11.2 (kartu riwayat tanpa resi/alamat/timeline). Token warna, spasi, radius, dan komponen dasar design-v1.1 tetap berlaku.

---

## 1. Keputusan Mengikat

| ID | Keputusan | Sumber |
|---|---|---|
| D1 | Halaman bayar = **satu panel instruksi** + satu kolom ringkasan. Pemilih kanal **menggantikan** panel instruksi (bukan tampil bersamaan), dan setelah kanal dipilih menyusut jadi baris `Metode: <label> · Ganti metode`. | PRD §2.1 langkah 2–5 |
| D2 | Urutan grup kanal tetap: QRIS → Transfer bank (BCA, BNI, BRI, Permata) → Mandiri Bill → Gerai (Alfamart, Indomaret). Sumber daftar **selalu** `pembayaran.kanal[]`, bukan daftar hardcode. | PRD §2.2, kontrak §7.7 |
| D3 | Template instruksi dipilih dari `pembayaran.instruksi.jenis` (`va`/`qris`/`bill`/`gerai`), fallback `pembayaran.metode.grup`. Empat template, tidak ada template kelima. | kontrak §7.7 |
| D4 | Hitung mundur dihitung dari `pembayaran.expires_at` (ISO+07:00), bukan timer lokal saat charge. | PRD §2.2 |
| D5 | Polling status **3 detik**, satu request in-flight, berhenti saat status final/tab hidden; status berubah → halaman memuat ulang sendiri. Tombol "Cek status" manual hanya muncul setelah 3 polling gagal. | PRD §2.1 langkah 5, §4 |
| D6 | `settlement` → panel lunas + tautan "Lihat pesanan" + pindah otomatis ke `checkout.success` setelah **5 detik**; tersedia tombol "Tetap di halaman ini" untuk membatalkan perpindahan (WCAG 2.2.1). | PRD §4 |
| D7 | Galat aksi kanal dibaca dari `flash.error` (kontrak §7.7a); `pembayaran.galat` tetap didukung sebagai fallback. Tidak ada retry otomatis. | kontrak §7.7a butir 6–7 |
| D8 | Mode uji dikenali dari `pembayaran.fake === true`; label tombol simulasi **"Tandai lunas (mode uji)"** (menggantikan "Simulasikan pembayaran berhasil"). | PRD §2.4 |
| D9 | Kanal Permata memakai `instruksi.nomor_va` + `instruksi.bank = "Permata"`; UI **tidak** membaca `permata_va_number` mentah. | kontrak §7.7 tabel key |
| D10 | Checkout: tidak ada tombol ongkir. Tarif diambil otomatis 600 ms setelah kode pos 5 angka **dan** alamat ≥10 karakter; `AbortController` membatalkan request lama; hasil di-cache per kode pos. | PRD §2 (F2) |
| D11 | Ganti kode pos → daftar tarif dikosongkan, pilihan kurir di-reset, total ongkir jadi `—` sampai tarif baru dipilih. | PRD §2 (F2) |
| D12 | Register menambah 3 field alamat setelah Nomor WhatsApp: Alamat (textarea), Kota, Kode Pos. Pesan galat memakai teks identik `CheckoutRequest` agar konsisten. | PRD §3 |
| D13 | Riwayat memakai pola **kartu ringkas + panel rincian** (disclosure), bukan halaman detail baru — tidak ada rute detail di PRD. | PRD §9, kontrak §13 `detail_url` |
| D14 | Semua nominal, hitungan, nomor VA/resi memakai `tabular-nums`; tidak ada ukuran font ad-hoc. | PRD §5 (F4) |

---

## 2. Tipografi (Mengikat)

### 2.1 Skala tertutup — 9 kelas, tidak ada tambahan

| Tier | Class | Ukuran | Line-height | Tracking | Pemakaian |
|---|---|---|---|---|---|
| A | `text-display-xl` | 72px (≥1024), 40–64px di bawahnya | 0.95 | 0.01em | Maks 1 per viewport; statement why-us |
| A | `text-display` | 40–64px | 1 | 0.02em | Hero, wordmark besar |
| B | `text-h1` | 32–44px | 1.05 | 0.01em | Satu `h1` per halaman |
| B | `text-h2` | 26–32px | 1.1 | 0.02em | Judul seksi, nominal total halaman bayar/selesai |
| B | `text-h3` | 15–16px, 600 | 1.35 | 0 | Judul kartu, nominal total di ringkasan |
| C | `text-body` | 15–16px | 1.5 | 0 | Paragraf, nilai tabel |
| C | `text-meta` (alias `text-sm`) | 13–14px | 1.45 | 0 | Caption, helper, timestamp |
| C | `text-label` | 14–15px, 600 | 1 | 1px | Label form, header kolom (sentence case) |
| C | `text-badge` | 11–12px, 700 | 1 | 0.08em | Badge + eyebrow (satu-satunya pemakai uppercase) |
| — | `font-display` | — | — | — | Hanya untuk A/B dan wordmark; tidak untuk body |

Dilarang: `text-[14px]`, `text-[20px]`, `text-[24px]`, `text-[28px]`, `text-[32px]`, serta `text-xs|base|lg|xl|2xl|3xl|4xl|5xl`. Ukuran baru hanya lewat token di `tailwind.config.js`, bukan class lepas.

Pemetaan ke PRD §5 ("3 tier + `text-sm` untuk meta"): tiga tier teks = **A display** (`text-display-xl`, `text-display`), **B heading** (`text-h1`–`text-h3`), **C teks** (`text-body`, `text-meta` = alias `text-sm`, `text-label`, `text-badge`). `text-label`/`text-badge` adalah ukuran kecil tier C, bukan tier baru.

### 2.2 Aturan turunan

1. **Measure ≤ 65ch.** Semua paragraf `text-body`/`text-meta` diberi `max-w-[65ch]` (65ch ≈ 520px pada body 16px). `max-w-xl` (576px ≈ 72ch) dan `max-w-2xl` dilarang untuk prosa.
2. **Line-height hanya dari token.** `leading-none` diizinkan **hanya** untuk label satu baris di dalam kontrol (tombol, badge, chip). Dilarang untuk nominal, paragraf, dan angka display. `leading-8`, `leading-10`, `leading-tight`, `leading-relaxed` dilarang.
3. **Ritme spasi 4/8.** Jarak blok kelipatan 4px (Tailwind 1/2/3/4/6/8/10/12). Pengecualian 6px (`py-1.5`, `px-3.5`) hanya di dalam kontrol form dan sel tabel. `mt-2.5`, `mb-2.5`, `gap-3.5` dilarang.
4. **Uppercase hanya untuk eyebrow** (`text-badge`, ≤12px, tracking 0.08em) dan **wordmark** (`font-display` pada nama toko di header/footer/auth). `uppercase` pada `text-label`/`text-meta`/`text-body` dilarang.
5. **Letter-spacing hanya dari token.** `tracking-wide|wider|tight|tighter` dilarang; jangan menimpa tracking milik `text-badge`.
6. **`tabular-nums` wajib** untuk: semua nominal uang, hitung mundur, nomor VA/kode bayar, nomor resi, tanggal+jam. Kode juga memakai `font-mono`.
7. **Perataan label–nilai:** `<dl>` + `flex items-baseline justify-between gap-4`; label `text-body text-ink-soft`; nilai `text-body text-ink tabular-nums text-right whitespace-nowrap`. Baris Total dipisah `border-t border-line pt-3`, label `text-body font-semibold`, nilai `text-h3 font-bold` (ringkasan) atau `text-h2` (halaman bayar & selesai). Nominal tidak boleh pecah baris.
8. Satu `h1` per halaman; maksimal dua ukuran heading per kartu; heading tidak dipakai untuk teks lebih dari 2 baris.

### 2.3 Penilaian implementasi sekarang (terhadap design-v1.1 §2.2)

| Aspek | Target | Temuan terukur | Nilai |
|---|---|---|---|
| Skala | 9 kelas token | 10 nilai ad-hoc `text-[…]` (9 publik/bersama, 1 admin `KpiCard`) | 4/10 |
| Line-height | dari token | 10× `leading-none`: 9 pada angka/display, 1 sah (`Button.jsx:11`) | 5/10 |
| Measure | ≤65ch | 4 paragraf melebihi 65ch (3× `max-w-xl`, 1× kolom `58fr`) | 4/10 |
| Uppercase | eyebrow + wordmark | 3 halaman publik + 3 komponen bersama + 2 `AdminLayout` memakai uppercase pada `text-label`; 1× override `tracking-wide` | 5/10 |
| Angka | `tabular-nums` | **0** kemunculan `tabular-nums` untuk **38** pemanggilan `rupiah()` | 1/10 |
| Perataan | `<dl>` baseline, nominal utuh | pola `dl` sudah dipakai, tetapi baris Total memakai `flex-wrap` + `leading-none` | 6/10 |

Total **25/60 (4,2/10)** — arah sudah benar, lima perbaikan sistemik di §2.5 wajib sebelum F4 dinyatakan selesai.

### 2.4 Daftar pelanggaran nyata (`path:baris`)

| # | Lokasi | Aturan | Temuan (sebelum) | Sesudah |
|---|---|---|---|---|
| T1 | `resources/js/Pages/Public/CheckoutPay.jsx:318` | skala + line-height + angka | `text-[20px] font-bold leading-none text-ink` | `text-h2 font-bold tabular-nums text-ink` |
| T2 | `resources/js/Pages/Public/CheckoutSuccess.jsx:171` | sama | `text-[20px] font-bold leading-none text-ink` | `text-h2 font-bold tabular-nums text-ink` |
| T3 | `resources/js/Components/OrderSummary.jsx:84` | sama | `text-[20px] font-bold leading-none text-ink` | `text-h3 font-bold tabular-nums text-ink` |
| T4 | `resources/js/Components/OrderSummary.jsx:77` | perataan | `flex flex-wrap items-center justify-end gap-2` | `flex items-baseline justify-end gap-2` + nilai `whitespace-nowrap tabular-nums` |
| T5 | `resources/js/Components/QrisPanel.jsx:84` | skala + line-height | `mt-3 text-[20px] font-bold leading-none` | `mt-3 text-h3 font-bold tabular-nums` |
| T6 | `resources/js/Components/QrisPanel.jsx:182` | sama | `mt-5 text-center text-[20px] font-bold leading-none` | `mt-5 text-center text-h3 font-bold tabular-nums` |
| T7 | `resources/js/Components/PriceBlock.jsx:17` | skala | `text-[24px] leading-8` / `text-[15px]` | `text-h2` / `text-body` (varian `lg`) |
| T8 | `resources/js/Components/RatingSummary.jsx:34` | skala + line-height + angka | `text-[32px] font-bold leading-10` | `text-h2 font-bold tabular-nums` |
| T9 | `resources/js/Components/LandingGallery.jsx:45` | skala + line-height | `font-display text-[24px] leading-none` | `font-display text-h2` |
| T10 | `resources/js/Components/WhyUs.jsx:113` | skala + line-height | `mt-1 w-8 shrink-0 font-display text-[24px] leading-none` | `mt-1 w-8 shrink-0 font-display text-h2` |
| T11 | `resources/js/Components/KpiCard.jsx:50` | skala | `text-[28px] font-bold leading-none` | `text-h2 font-bold tabular-nums` (komponen admin; wajib bila disentuh, dicatat agar tidak menyebar) |
| T12 | `resources/js/Components/HeroCarousel.jsx:66` | measure | `max-w-xl text-body text-white/75` | `max-w-[65ch] text-body text-white/75` |
| T13 | `resources/js/Components/HeroCarousel.jsx:128` | measure | `max-w-xl text-body text-white/85` | `max-w-[65ch] text-body text-white/85` |
| T14 | `resources/js/Components/HeroSection.jsx:57` | measure | `max-w-xl text-body text-white/85` | `max-w-[65ch] text-body text-white/85` |
| T15 | `resources/js/Pages/Public/Home.jsx:334` | measure | paragraf di `md:col-span-7` tanpa batas (≈660px ≈ 81ch) | tambah `max-w-[65ch]` |
| T16 | `resources/js/Pages/Public/Products/Show.jsx:475` | measure | `whitespace-pre-line text-body text-ink-soft` di kolom `58fr` (≈668px ≈ 82ch) | tambah `max-w-[65ch]` |
| T17 | `resources/js/Pages/Public/Cart.jsx:132` | uppercase | `text-label uppercase text-slate-500` (header kolom) | `text-label text-slate-600` (sentence case) |
| T18 | `resources/js/Pages/Public/Checkout.jsx:670` | uppercase | `text-label uppercase text-slate-500` (header ringkasan) | `text-label text-slate-600` |
| T19 | `resources/js/Pages/Public/CheckoutSuccess.jsx:178` | uppercase | `<h3 className="text-label uppercase text-slate-500">Dikirim ke</h3>` | `<h3 className="text-h3 text-ink">Dikirim ke</h3>` |
| T20 | `resources/js/Components/FilterPanel.jsx:17` | uppercase + tracking + ritme | `mb-2.5 text-meta font-semibold uppercase tracking-wide` | `mb-2 text-label text-ink` |
| T21 | `resources/js/Pages/Public/Products/Show.jsx:306` | tracking | `text-badge uppercase tracking-wide` | `text-badge uppercase` (tracking token 0.08em) |
| T22 | 38 pemanggilan `rupiah()` (`Pages/Public`, `Components`) | angka | tidak ada `tabular-nums`; contoh `Checkout.jsx`, `Cart.jsx`, `OrderSummary.jsx`, `History.jsx` | setiap render nominal diberi `tabular-nums`; teks total juga `whitespace-nowrap` |
| T23 | `resources/js/Components/TrustStrip.jsx:55` | line-height | `font-display text-h3 leading-none text-brand` | `font-display text-h3 tabular-nums text-brand` |
| T24 | `resources/js/Layouts/AdminLayout.jsx:130,156` | uppercase | `text-label font-semibold uppercase tracking-wide` (nav & wordmark) | `text-label font-semibold` (nav) · `font-display text-h3 uppercase` (wordmark) |
| T25 | `resources/js/Components/DataTable.jsx:108` | uppercase | `text-label uppercase text-slate-600` (header kolom) | `text-label text-slate-600` |
| T26 | `resources/js/Components/KpiCard.jsx:32` | uppercase | `text-label uppercase text-slate-500` | `text-label text-slate-600` |

Catatan: `resources/js/Components/Button.jsx:11` (`leading-none` pada label tombol) **bukan** pelanggaran — label satu baris di dalam kontrol.

### 2.5 Perbaikan sistemik + verifikasi

1. Tambah `tabular-nums` pada seluruh 38 lokasi pemanggilan `rupiah()` dan pada hitung mundur/nomor VA/resi; prioritas `OrderSummary`, `Cart`, `Checkout`, `CheckoutPay`, `CheckoutSuccess`, `History`, `PriceBlock`.
2. Ganti 10 nilai `text-[…]` dengan token (T1–T11).
3. Hapus 9 `leading-none` pada angka/display (T1–T3, T5, T6, T8–T10, T23); `KpiCard` ikut hilang lewat T11.
4. Ganti 3 `max-w-xl` → `max-w-[65ch]`, tambah 2 batas paragraf (T12–T16).
5. Hapus `uppercase`/`tracking-wide` non-eyebrow (T17–T21, T24–T26).

Perintah verifikasi (dijalankan dari root proyek):

```
grep -rn "text-\[[0-9]" resources/js/Pages/Public resources/js/Components resources/js/Layouts --include=*.jsx   # target: 0
grep -rn "leading-none" resources/js/Pages/Public resources/js/Components --include=*.jsx                      # target: hanya Button.jsx
grep -rn "max-w-xl" resources/js/Pages/Public resources/js/Components --include=*.jsx                         # target: 0
grep -rn "text-label uppercase\|text-meta uppercase" resources/js --include=*.jsx                             # target: 0
grep -rn "tracking-wide\|tracking-wider\|tracking-tight" resources/js --include=*.jsx                          # target: 0
grep -rln "rupiah(" resources/js/Pages/Public resources/js/Components --include=*.jsx                         # tiap file wajib memuat tabular-nums
```

Catatan: `uppercase` pada `text-badge` (eyebrow/badge) dan `font-display` (wordmark) tetap sah; `tracking-[0.08em]` boleh ditulis eksplisit bila sama dengan token.

### 2.6 Pembagian pemilik perbaikan (agar checklist tidak menggantung)

Kartu `t_51dab180` hanya menyentuh `resources/js/Pages/Public/**` + `resources/css/**`. Pelanggaran di komponen bersama **wajib** diperbaiki oleh kartu fitur yang menyentuhnya:

| Berkas | Pelanggaran | Dikerjakan di |
|---|---|---|
| `Pages/Public/Cart.jsx`, `Checkout.jsx`, `CheckoutSuccess.jsx`, `Products/Show.jsx`, `Home.jsx` | T15–T19, T21, T22 | `t_51dab180` (tipografi) |
| `Components/OrderSummary.jsx`, `PriceBlock.jsx` | T3, T4, T7, T22 | `t_8febc069` (checkout) |
| `Components/QrisPanel.jsx`, `Components/CheckoutPay` terkait | T1, T5, T6, T22 | `t_6c310317` (halaman bayar) |
| `Components/HeroCarousel.jsx`, `HeroSection.jsx`, `WhyUs.jsx`, `LandingGallery.jsx`, `TrustStrip.jsx`, `RatingSummary.jsx`, `FilterPanel.jsx` | T9, T10, T12, T13, T14, T20, T23 | `t_51dab180` |
| `Components/KpiCard.jsx`, `DataTable.jsx`, `Layouts/AdminLayout.jsx` | T11, T24, T25, T26 | `t_ab9c84fe` (admin) |
| `Components/Input.jsx`, `Button.jsx`, `Badge.jsx`, `StatusBadge.jsx` | — (sudah token) | tidak ada |

Bila kartu pemilik tidak memperbaiki, QA (`t_56a93c99`) mencatatnya sebagai temuan P3 pada kartu tersebut, bukan menunda rilis.

DoD F4: semua perintah di atas memenuhi target, `npm run build` lulus, dan checklist §12 lulus.

---

## 3. Pola Bersama

### 3.1 Kelengkapan state

Setiap permukaan data wajib punya 5 state: **memuat** (skeleton, `aria-busy="true"`), **kosong** (pesan + aksi jelas), **galat** (Incomplete notice + "Coba lagi"), **normal**, **nonaktif** (tombol `disabled` + alasan terlihat). Skeleton hanya untuk blok yang benar-benar dimuat; jangan menampilkan skeleton > 10 detik tanpa pesan.

### 3.2 Copy beku (dipakai apa adanya)

| Konteks | Teks |
|---|---|
| Galat kanal belum aktif | `Kanal ini belum aktif di Midtrans. Hubungi admin.` (dari server, jangan ditulis ulang) |
| Galat charge umum | `Gagal membuat pembayaran. Coba lagi.` |
| Belum pilih kanal | Judul `Pilih metode pembayaran` · helper `Tagihan dibuat setelah kamu memilih kanal.` |
| Menyiapkan instruksi | `Menyiapkan instruksi pembayaran…` |
| Kedaluwarsa | `Tagihan kedaluwarsa. Buat pesanan baru untuk melanjutkan.` |
| Lunas | `Pembayaran diterima` |
| Ganti kanal | `Ganti metode` |
| Salin | `Salin` → sukses `Tersalin` (2 detik) |
| Mode uji | `Mode uji` · `Tandai lunas (mode uji)` · `Tagihan ini dibuat tanpa Midtrans (mode uji).` |
| Polling macet | `Status belum diperbarui. Periksa lagi.` |
| Ongkir menunggu | `Tarif muncul otomatis setelah alamat dan kode pos terisi.` |
| Ongkir kosong | `Belum ada layanan aktif untuk kode pos ini. Hubungi penjual.` |
| Ongkir galat | `Tarif gagal dimuat.` + tombol `Coba lagi` |
| Resi kosong (riwayat) | `Resi belum tersedia.` |

### 3.3 Format angka & waktu

- Uang: `Rp360.000` (helper `rupiah()`, tanpa spasi, tanpa desimal), `tabular-nums`, `whitespace-nowrap`.
- Tanggal: `24 Okt 2026`; tanggal+jam: `24 Okt 2026, 14.05` (titik sebagai pemisah jam, zona Asia/Jakarta).
- Hitung mundur: `mm:ss` (`04:59`), `tabular-nums`, tanpa kata "sisa" di dalam chip.
- Nomor VA: tampil berkelompok 4 digit (`8808 1234 5678 9012`), yang disalin digit mentah.

### 3.4 Aksesibilitas dasar (semua halaman baru)

- Grup radio memakai `<fieldset><legend>`; panah kiri/kanan/atas/bawah berpindah pilihan; fokus terlihat (`focus-visible` ring 2px).
- Setelah kanal dipilih, fokus pindah ke heading instruksi (`tabIndex={-1}`).
- Perubahan status pembayaran diumumkan lewat `aria-live="polite"` (satu region, teks pendek).
- Hitung mundur **tidak** di-`aria-live`; teks status kedaluwarsa yang diumumkan.
- Tombol ikon wajib `aria-label` spesifik (`Salin nomor virtual account BCA`).
- Flash notice memakai `role="status"` (sukses) / `role="alert"` (galat).

---

## 4. Halaman Bayar `/checkout/{order}/bayar` (F1, F3)

### 4.1 Layout

```
Desktop ≥1024 — grid 12 kolom, gap 32
kiri 7 : [header status]  [panel kanal | panel instruksi]
kanan 5: [ringkasan biaya + total]  [alamat pengiriman]   (sticky top 24)

Mobile 360 — urutan: header status → nominal total → panel kanal/instruksi → ringkasan → alamat
```

Header status: `h1` `Pembayaran`, `pesanan.code` (`text-meta font-mono tabular-nums`), badge status pesanan + status bayar, dan (bila ada) `Bayar sebelum 24 Okt 2026, 14.20`.

### 4.2 Pemilih kanal (state belum memilih)

- `fieldset` + `legend` = "Pilih metode pembayaran" (`text-h3`), helper `Tagihan dibuat setelah kamu memilih kanal.` (`text-meta`).
- 8 kartu radio, urut sesuai `pembayaran.kanal[]`, dikelompokkan label grup (`text-badge uppercase`): `QRIS`, `Transfer bank`, `Mandiri Bill`, `Gerai`.

| `metode.id` | Label UI (dari server) | `metode.grup` | Grup tampilan |
|---|---|---|---|
| `qris` | QRIS (GoPay, OVO, DANA, m-banking) | `qris` | QRIS |
| `bca_va` | Transfer BCA Virtual Account | `va` | Transfer bank |
| `bni_va` | Transfer BNI Virtual Account | `va` | Transfer bank |
| `bri_va` | Transfer BRI Virtual Account | `va` | Transfer bank |
| `permata_va` | Transfer Permata Virtual Account | `va` | Transfer bank |
| `mandiri_bill` | Mandiri Bill Payment | `bill` | Mandiri Bill |
| `alfamart` | Bayar di Alfamart | `gerai` | Gerai |
| `indomaret` | Bayar di Indomaret | `gerai` | Gerai |

Id di atas hanya contoh tervalidasi dari PRD §2.2; UI tetap merender apa pun yang dikirim `pembayaran.kanal[]` dan tidak hardcode 8 id.
- Kartu: 1 kolom di 360, 2 kolom ≥768, tinggi ≥56px, border `border-line`, terpilih `border-brand` + ikon centang + `aria-checked`.
- Tiap kartu menampilkan `label` dari server; tidak ada deskripsi karangan.
- Klik kartu = submit `POST /checkout/{order}/bayar/metode` (`metode=<id>`), tombol kartu `disabled` selama request, spinner kecil di kartu terpilih, kartu lain `disabled` (cegah dobel charge).
- 8 kanal tampil walau `midtrans.fake = true` (mode uji memakai fixture).

### 4.3 Panel instruksi (setelah kanal dipilih)

Header panel: `h2` `Selesaikan pembayaran`, chip kanal `Metode: Transfer BCA Virtual Account · Ganti metode` (`Ganti metode` = tombol teks, hanya saat `status = pending`), chip hitung mundur di kanan (`tabular-nums`; ≤5 menit → `text-warning` + `bg-warning/10`; 0 → `Waktu habis`).

Nominal diulang di atas instruksi: label `Total pembayaran`, nilai `text-h2 font-bold tabular-nums`.

**VA (`jenis = "va"`)**

| Elemen | Isi |
|---|---|
| Baris `dl` | `Bank` → `instruksi.bank`; `Nomor Virtual Account` → `nomor_va` (kelompok 4 digit + tombol `Salin`); `Total` → `pembayaran.gross_amount` |
| Langkah `ol` | 1. Buka aplikasi m-banking {bank}. 2. Pilih Transfer → Virtual Account. 3. Masukkan nomor {nomor_va} dan nominal {total}. 4. Selesaikan transaksi; status berubah otomatis. |
| Catatan | `Nominal harus sama persis agar pembayaran dikenali.` |

**QRIS (`jenis = "qris"`)**

| Elemen | Isi |
|---|---|
| Gambar | `qr_url` 240×240 (rasio 1:1, `alt="Kode QRIS pembayaran {code}"`); bila `qr_url` null → blok fallback: `qr_string` di kotak `font-mono text-meta break-all` + tombol `Salin` + helper `Mode uji: kode QR tidak tersedia, gunakan kode teks ini.` |
| Baris `dl` | `Total` → `gross_amount`; `Berlaku sampai` → `expires_at` |
| Langkah `ol` | 1. Buka aplikasi pembayaran yang mendukung QRIS (GoPay, OVO, DANA, m-banking). 2. Pindai kode QR. 3. Periksa nama toko dan nominal. 4. Selesaikan pembayaran. |
| Catatan | `Jangan bagikan kode QR ini kepada siapa pun.` |

**Mandiri Bill (`jenis = "bill"`)**

| Elemen | Isi |
|---|---|
| Baris `dl` | `Biller Code` → `biller_code` + `Salin`; `Bill Key` → `bill_key` + `Salin`; `Total` → `gross_amount` |
| Langkah `ol` | 1. Buka Mandiri Online / ATM Mandiri. 2. Pilih Bayar → Multipayment. 3. Masukkan kode perusahaan {biller_code}. 4. Masukkan Bill Key {bill_key} dan nominal {total}. |

**Gerai (`jenis = "gerai"`)**

| Elemen | Isi |
|---|---|
| Blok kode | `Kode pembayaran` (`text-meta`) + `payment_code` (`text-h2 font-mono tabular-nums`) + `Salin` |
| Baris `dl` | `Gerai` → `store`; `Total` → `gross_amount` |
| Langkah `ol` | 1. Datang ke kasir {store}. 2. Sebutkan pembayaran untuk Toko Kulot. 3. Berikan kode {payment_code} dan bayar {total}. |
| Catatan | `Kode ini khusus untuk pesanan {code}.` |

Tombol `Salin`: `navigator.clipboard.writeText` dengan fallback `document.execCommand('copy')`; sukses → label `Tersalin` 2 detik + `aria-live="polite"`; gagal → teks nilai diseleksi otomatis + helper `Salin manual: tekan Ctrl+C.`

### 4.4 Status final, galat, mode uji

| Kondisi | Tampilan |
|---|---|
| `settlement` | Panel hijau lembut: ikon centang, `h2` `Pembayaran diterima`, `paid_at`, metode, total; tombol primer `Lihat pesanan`; teks `Pindah ke halaman pesanan dalam 5 detik.` + tombol teks `Tetap di halaman ini`; auto-redirect hanya saat tab visible |
| `expire` atau hitung mundur 0 | Panel netral: `Tagihan kedaluwarsa. Buat pesanan baru untuk melanjutkan.`; instruksi disembunyikan; `Ganti metode` disembunyikan; tautan `Kembali ke keranjang` |
| `deny` / `cancel` | Panel galat: `Pembayaran gagal atau dibatalkan.` + `Coba lagi` (memilih kanal kembali) |
| `flash.error` / `pembayaran.galat` (kanal belum aktif / gagal charge) | Notice `role="alert"` di atas pemilih: tampilkan `pembayaran.galat` bila terisi, jika `null` pakai `flash.error`; pemilih tetap aktif; tidak ada retry otomatis; setelah kanal lain dipilih notice hilang |
| `pembayaran.fake = true` | Badge `Mode uji` (warning) di header + notice `Tagihan ini dibuat tanpa Midtrans (mode uji).` + tombol sekunder `Tandai lunas (mode uji)` (POST `checkout.simulate`, konfirmasi inline, `disabled` saat request) |
| `metode != null` tetapi `instruksi = null` | Skeleton `Menyiapkan instruksi pembayaran…` + reload otomatis 2× (1 detik, 3 detik); masih kosong → notice `Instruksi belum tersedia.` + `Muat ulang` |
| Polling gagal 3× | Helper `Status belum diperbarui. Periksa lagi.` + tombol `Cek status` manual (bukan primer) |
| Status berubah saat polling | Muat ulang halaman (`router.reload`); tanpa toast ganda |

### 4.5 Countdown & polling

- `expires_at` null → tidak ada chip hitung mundur (belum memilih kanal).
- Interval 1 detik untuk tampilan; sumber kebenaran tetap server (polling 3 detik).
- Saat hitung mundur 0: hentikan tampilan instruksi, tampilkan state kedaluwarsa, **tetap** polling 1× lagi untuk konfirmasi server; status `pending` dari server setelah 30 detik → tampilkan `Menunggu konfirmasi kedaluwarsa.`.
- Polling berhenti saat `document.hidden`; `visibilitychange` → polling langsung.
- Satu request in-flight; tidak menumpuk; `AbortController` saat unmount.

### 4.6 Matriks state halaman bayar

| State | Kondisi props | Panel utama | Aksi | Live region |
|---|---|---|---|---|
| P0 belum pilih | `status=pending`, `metode=null`, `instruksi=null` | Pemilih 8 kanal | pilih kanal | — |
| P1 menyiapkan | `metode!=null`, `instruksi=null` | Skeleton instruksi | muat ulang otomatis | "Menyiapkan instruksi pembayaran" |
| P2 VA | `jenis=va` | Instruksi VA | salin, ganti metode | — |
| P3 QRIS | `jenis=qris` | QR + kode teks fallback | salin, ganti metode | — |
| P4 Bill | `jenis=bill` | Biller + bill key | salin ×2, ganti metode | — |
| P5 Gerai | `jenis=gerai` | Kode + gerai | salin, ganti metode | — |
| P6 kedaluwarsa | `status=expire` / countdown 0 | Panel kedaluwarsa | kembali ke keranjang | "Tagihan kedaluwarsa" |
| P7 lunas | `status=settlement` | Panel lunas | lihat pesanan, batalkan redirect | "Pembayaran diterima" |
| P8 gagal | `status=deny|cancel` | Panel gagal | coba lagi | "Pembayaran gagal" |
| P9 galat aksi | `flash.error` terisi | Notice di atas pemilih | pilih kanal lagi | alert |
| P10 mode uji | `pembayaran.fake=true` | Badge + tombol simulasi | tandai lunas | — |
| P11 submit | request metode in-flight | Kartu terpilih spinner | semua kartu disabled | — |
| P12 polling macet | 3× gagal | Helper + cek manual | cek status | polite |

### 4.7 Responsif & a11y

- 360px: pemilih 1 kolom, tombol `Salin` tetap 44×44px, nomor VA boleh 2 baris (`break-all`) tetapi nominal tidak.
- 768px: 2 kolom kanal, ringkasan pindah ke bawah panel.
- 1280px+: grid 7/5, ringkasan sticky (maks 1 viewport, `top: 24px`).
- `fieldset`/`legend`, `aria-describedby` untuk helper, `aria-live` untuk status, fokus pindah ke heading instruksi setelah kanal terpilih, kontras teks ≥4,5:1 (token existing sudah memenuhi).

### 4.8 Kembali dari Midtrans (`/midtrans/selesai`)

- Rute publik tanpa UI: membaca `order_id`, menyinkronkan status best effort, lalu redirect ke halaman bayar order tersebut.
- Order tidak dikenal → redirect `/` + flash error. Beranda wajib menampilkan flash error itu sebagai notice `role="alert"` (pola §3.4), bukan halaman kosong.
- Bila sinkron gagal, halaman bayar tetap tampil dengan status terakhir + polling normal (tidak ada layar galat penuh).

---

## 5. Checkout — Ongkir Otomatis (F2)

### 5.1 Layout

```
Desktop: kiri 7 = [Alamat & penerima] [Catatan]   kanan 5 = [Ringkasan biaya sticky]
Mobile : Alamat → Ringkasan biaya → Catatan → tombol Buat pesanan (full width)
```

### 5.2 Prefill & field

| Field | Sumber prefill | Boleh diedit |
|---|---|---|
| `recipient_name` | `prefill.customer_name` | ya |
| `recipient_phone` | `prefill.customer_phone` | ya |
| `shipping_address` | `prefill.customer_address` | ya |
| `shipping_city` | `prefill.customer_city` | ya |
| `shipping_postal_code` | `prefill.customer_postal_code` | ya |

Helper di bawah judul: `Diisi dari alamat akun. Perubahan hanya berlaku untuk pesanan ini.` Tidak ada penyimpanan balik ke profil (tidak ada API profil). Bila alamat profil kosong: notice `Lengkapi alamat pengiriman untuk menghitung ongkir.` + fokus ke `shipping_address`.

### 5.3 State ongkir

| State | Pemicu | Tampilan | Aksi |
|---|---|---|---|
| S0 menunggu | kode pos <5 angka atau alamat <10 karakter | helper `Tarif muncul otomatis setelah alamat dan kode pos terisi.` | — |
| S1 memuat | 600 ms setelah valid, request in-flight | 2 baris skeleton (`aria-busy`), `Memuat tarif…` | — |
| S2 terisi | `opsi.length > 0` | daftar radio `courier_name service_name` + `etd` + harga; caption `Tarif untuk kode pos {kode_pos}`; `gratis ∈ opsi` → harga diganti `GRATIS` (`text-success`) | pilih satu |
| S3 kosong | `opsi.length === 0` | `Belum ada layanan aktif untuk kode pos ini. Hubungi penjual.` | submit disabled |
| S4 galat tarif | `galat` terisi (respons 422/500) | notice `Tarif gagal dimuat.` + `galat` dari server apa adanya | `Coba lagi` (pakai nilai saat ini) |
| S5 galat konfigurasi | `pengiriman.galat` terisi saat halaman dimuat | notice di atas fieldset, auto-fetch dimatikan | submit disabled |
| S6 tarif uji | `pengiriman.mode = "fake"` | daftar tetap ditampilkan dari `GET /checkout/ongkir` (tarif uji `pengiriman.tarif_uji`), kurir **tidak wajib** dipilih, badge `Tarif uji` | boleh submit tanpa memilih |
| S7 lebih dari 10 detik | request menggantung | `Tarif lama dimuat. Coba lagi.` + tombol | `Coba lagi` |

Aturan teknis: debounce 600 ms; `AbortController` membatalkan request sebelumnya; cache `Map<postal_code, options>` selama halaman terbuka; kembali ke kode pos yang sudah di-cache → tampil segera tanpa request; ganti kode pos → `options` dikosongkan, pilihan kurir di-reset, total ongkir `—`; request tidak dikirim saat kode pos belum 5 angka atau alamat <10 karakter.

### 5.4 Ringkasan biaya

Baris `dl`: Subtotal, Diskon (bila >0, `−Rp…`), Ongkir (`—` sampai dipilih; `GRATIS` bila `opsi[].gratis`), lalu Total (`text-h3 font-bold tabular-nums`). Submit `Buat pesanan` `disabled` selama state S1/S3/S4/S5/S7, atau saat `pengiriman.mode = "api"` dan belum ada kurir dipilih; alasan ditampilkan sebagai helper di bawah tombol (`Pilih layanan pengiriman dulu.`). Pada `pengiriman.mode = "fake"` submit aktif tanpa memilih kurir.

### 5.5 Submit & galat

- Submit ulang memvalidasi tarif di server (v1.1 §6.6 dipertahankan); galat tarif tampil sebagai notice + daftar tarif dimuat ulang.
- Galat field lain memakai `errors.*` di bawah field, fokus ke field pertama yang salah.
- Tombol submit `disabled` + spinner saat request (cegah dobel pesanan).

---

## 6. Register — Alamat Wajib (F2)

Urutan field (satu kolom, maks 480px): Nama → Email → Nomor WhatsApp → Kata Sandi → Konfirmasi Kata Sandi → **Alamat** (textarea 3 baris) → **Kota** → **Kode Pos** → checkbox syarat → tombol `Daftar`.

| Field | Atribut | Helper | Galat (identik `CheckoutRequest`) |
|---|---|---|---|
| `address` | textarea, `maxlength=500`, `required` | `Tulis jalan, nomor rumah, RT/RW, dan kelurahan.` | `Alamat lengkap wajib diisi.` / `Alamat terlalu singkat. Tulis jalan, nomor, RT/RW.` / `Alamat maksimal 500 karakter.` |
| `city` | text, `maxlength=100`, `required` | `Kota/kabupaten pengiriman.` | `Kota wajib diisi.` / `Kota maksimal 100 karakter.` |
| `postal_code` | text, `inputmode="numeric"`, `maxlength=5`, `required` | `5 angka, dipakai untuk menghitung ongkir.` | `Kode pos wajib diisi.` / `Kode pos harus 5 angka.` |

Kode pos non-angka: blokir karakter non-digit saat mengetik. Setelah register sukses → redirect ke checkout/beranda sesuai `redirect` existing; alamat sudah ter-prefill di checkout.

### 6.2 Tampilan alamat read-only

PRD §3 meminta halaman akun menampilkan alamat read-only "bila belum ada form edit profil". Rute `/akun` **belum ada** di `routes/web.php` (hanya `/history`). Keputusan v1.2: tidak membuat halaman akun baru.

- Alamat read-only ditampilkan di panel rincian riwayat (§9.2 butir 1) dan sebagai nilai ter-prefill di checkout.
- Bila kelak halaman akun dibuat, gunakan blok `dl` yang sama: Penerima, Telepon, Alamat, Kota, Kode Pos, dengan helper `Ubah alamat lewat halaman ini belum tersedia.`
- Ini catatan cakupan, bukan blocker; tidak menghalangi F2.

---

## 7. Admin `/admin/pesanan` (F6, F7)

### 7.1 Layout detail

```
Header: code (font-mono) + badge status pesanan + badge status bayar + badge "Mode uji" (bila fake)
grid 12:
  kiri 7  : [Pembayaran] [Pengiriman]
  kanan 5 : [Item pesanan] [Pelanggan] [Ubah status] [Timeline]
```

### 7.2 Panel Pembayaran

| Baris | Sumber |
|---|---|
| Kanal | `payment.metode.label` (fallback `pesanan.payment_method_label`, lalu `payment.payment_type` mentah **tidak boleh** tampil) |
| Status Midtrans | `payment.status` + label Indonesia (badge) |
| Transaction ID | `payment.transaction_id` (`font-mono`, tombol salin, `—` bila null) |
| Instruksi | sesuai `payment.instruksi.jenis`: VA (`bank` + `nomor_va`), Bill (`biller_code` + `bill_key`), Gerai (`store` + `payment_code`), QRIS (`qr_url` sebagai tautan `Buka gambar QR`) |
| Kedaluwarsa / lunas | `expires_at` / `paid_at` (`—` bila null) |
| Aksi | tombol `Sinkronkan status` (`PATCH /admin/pesanan/{order}/sinkron-pembayaran`, route `admin.orders.sinkron-pembayaran`), `disabled` + spinner saat request |
| Mode uji | badge `Mode uji` + catatan `Tagihan dibuat tanpa Midtrans.` |

Tanpa baris pembayaran (`payment = null`): panel menampilkan `Belum ada tagihan.` tanpa aksi sinkron.

### 7.3 Panel Pengiriman

| Baris | Sumber |
|---|---|
| Kurir + layanan | `shipping.courier_name` + `shipping.service_name` (`—` bila null) |
| Estimasi / berat / ongkir | `shipping.etd`, `shipping.weight_gram`, `shipping.shipping_cost` |
| Nomor resi | `shipping.tracking_number` (fallback `pesanan.tracking_number`) + tombol salin; `Belum ada resi.` bila null |
| Status Biteship | `shipping.status_label` (badge); `—` bila null |
| Aksi otomatis | tombol `Buat resi otomatis` (`POST /admin/pesanan/{order}/resi-otomatis`, route `admin.orders.resi-otomatis`) — hanya tampil saat status pesanan `dibayar`/`dikirim` **dan** `shipping.biteship_order_id` null; `disabled` + spinner `Membuat resi…`; sukses → badge resi baru; galat → notice `role="alert"` berisi `flash.error` apa adanya |
| Aksi manual | input `tracking_number` + tombol `Simpan resi` (`PATCH /admin/pesanan/{order}/resi`, route `admin.orders.resi`), galat di bawah input |

Tombol otomatis disembunyikan (bukan disabled) bila `biteship_order_id` sudah ada; tampilkan `Resi otomatis sudah dibuat.` di bawah nomor resi.

### 7.4 Daftar pesanan

- Tambah kolom `Kurir / Resi`: `courier_name service_name` + `tracking_number` (`font-mono tabular-nums`, `—` bila kosong).
- Tambah filter `Status pengiriman` (dari `shipping_status`), di samping filter status pesanan & pembayaran.
- Kolom pembayaran memakai label kanal (`payment_method_label`), bukan `midtrans`.
- Baris mode uji diberi badge kecil `Mode uji`.
- 360px: tabel jadi kartu bertumpuk; kolom Kurir/Resi tetap tampil di kartu.

### 7.5 State admin

Normal · `payment = null` · `shipping = null` (pesanan lama tanpa kurir) · mode uji · resi otomatis loading/sukses/galat · setting asal kurang (pesan server) · status tidak diizinkan (tombol otomatis tidak dirender).

---

## 8. Admin `/admin/ekspedisi` (F5)

### 8.1 Urutan section

1. Status mode (badge `API Biteship` / `Tarif uji`) + sumber katalog (`kurir.sumber`: `api` → `Katalog Biteship`, `settings` → `Layanan tersimpan`).
2. Pengaturan asal pengiriman (nama, telepon, alamat, kode pos) + `contact_email`.
3. Aturan gratis ongkir (minimal belanja / tarif uji).
4. **Tambah layanan**: dropdown `Kurir` → dropdown `Layanan` → tombol `Tambah`.
5. Tabel layanan tersimpan (kurir, layanan, aktif, reguler, aksi).

### 8.2 Dropdown kurir → layanan

Sumber tunggal: `kurir.daftar[]` (kontrak §10.13) — saat `kurir.sumber = "api"` berisi seluruh katalog Biteship, saat `"settings"` berisi layanan tersimpan. Tidak ada prop baru.

- `Kurir`: `<select>` opsi unik `courier_code` (label `{courier_name} ({courier_code})`), placeholder `Pilih kurir`.
- `Layanan`: `<select>` terfilter `courier_code` terpilih, label `{service_name} ({service_code})` + `· {etd}` bila ada; `disabled` sampai kurir dipilih; ganti kurir → layanan dikosongkan.
- Tombol `Tambah` `disabled` sampai kurir + layanan terpilih; duplikat → galat `Layanan ini sudah ada di daftar.` di bawah tombol.
- `kurir.sumber = "settings"` → notice `Katalog Biteship tidak tersedia. Isi kode manual.` + `kurir.galat` apa adanya, lalu tampilkan input manual `courier_code:service_code` (fitur "Tambah kode manual" existing) sebagai jalur tambahan. Halaman tidak boleh kosong/mati.
- `kurir.daftar` kosong total → form dropdown disembunyikan, hanya input manual + notice.
- Katalog memuat: skeleton di kedua dropdown (`aria-busy`).

---

## 9. Riwayat `/history` (F8)

### 9.1 Kartu ringkas (selalu tampil)

| Baris | Isi |
|---|---|
| Header | `code` (`font-mono`) + badge status pesanan + badge status bayar; kanan: `total` (`text-h3 font-bold tabular-nums`) |
| Meta | `created_at` + `items_count` item / `total_qty` qty |
| Ringkas kirim | `Dikirim ke {customer.name} · {customer.city}`; `{courier_name} {service_name} · {tracking_number}` (bila ada) |
| Aksi | `Lihat rincian` (`aria-expanded`) + `detail_url` sebagai tombol utama bila tidak null: `Bayar sekarang` (pending) / `Lihat pesanan` (settlement) |

### 9.2 Panel rincian (disclosure)

Urutan: 1) Pengiriman — penerima, telepon, alamat, kota, kode pos, kurir+layanan, **resi + salin**, status pengiriman. 2) Rincian biaya — subtotal, ongkir, diskon, total (`dl`). 3) Item — gambar 64px, nama (tautan produk bila `product_id` ada), varian, qty × harga, line total. 4) Timeline.

Null ditangani: resi `Resi belum tersedia.`; kurir/alamat kosong → baris `—` (bukan hilang); `detail_url = null` → tombol utama tidak dirender.

### 9.3 Timeline

Tiga node horizontal (≥768) / vertikal (360): `Dibuat` (`created_at`), `Dibayar` (`paid_at` atau `—`), `Dikirim` (`shipped_at` atau `—`). Node aktif = punya waktu; node masa depan abu-abu. Status `batal` → node keempat `Batal` (merah) menggantikan node yang belum tercapai; `expire` → node `Kedaluwarsa`.

### 9.4 State

Kosong: `Belum ada pesanan.` + tombol `Mulai belanja`. Ada data: daftar + pagination (10/halaman). Rincian tertutup secara default. Loading awal: 3 skeleton kartu. Galat: notice + `Coba lagi`.

### 9.5 Responsif

360: kartu 1 kolom, total di baris sendiri (rata kiri, `tabular-nums`), timeline vertikal, tombol aksi full width. 768+: 2 kolom meta, timeline horizontal. Nama produk panjang: `line-clamp-2`.

---

## 10. Matriks Responsif Ringkas

| Permukaan | 360 | 768 | 1280 |
|---|---|---|---|
| Bayar — pemilih kanal | 1 kolom, kartu ≥56px | 2 kolom | 2 kolom dalam grid 7/5 |
| Bayar — instruksi | 1 kolom, nominal `text-h2` utuh | 1 kolom + ringkasan di bawah | instruksi 7, ringkasan 5 sticky |
| Checkout | form → ringkasan → CTA full width | form 7 / ringkasan 5 | ringkasan sticky |
| Register | 1 kolom 100% | 480px tengah | 480px tengah |
| Admin pesanan | kartu bertumpuk | 1 kolom panel | grid 7/5 |
| Ekspedisi | dropdown full width bertumpuk | 2 kolom | 3 kolom |
| Riwayat | kartu 1 kolom, timeline vertikal | 2 kolom meta | lebar maks 1040px |

---

## 11. Kesenjangan Kontrak (permintaan ke B4, bukan blocker desain)

| # | Kebutuhan tampilan | Status kontrak | Permintaan |
|---|---|---|---|
| K1 | Panel pembayaran admin: kanal, instruksi VA/QR/bill/gerai, kedaluwarsa, lunas | §12.17 hanya punya `payment.payment_type`, `snap_*`, `expires_at`, `paid_at` | Tambah `payment.metode {id,label,grup}`, `payment.instruksi` (bentuk sama §7.7), `payment.fake`, `pesanan.mode_uji` |
| K2 | Panel pengiriman admin: kurir, layanan, estimasi, berat, ongkir, status Biteship, `biteship_order_id` | §12.17 hanya `tracking_number` | Tambah `pesanan.shipping {courier_code,courier_name,service_name,etd,weight_gram,shipping_cost,tracking_number,status,status_label,biteship_order_id,galat}` |
| K3 | Daftar pesanan: kolom Kurir/Resi + filter status pengiriman | §12.16 belum ada | Tambah `courier_name`, `service_name`, `tracking_number`, `shipping_status`, filter `kirim` |
| K4 | Riwayat: kurir, resi, alamat, rincian biaya, timeline | §13 hanya item + total + `detail_url` | Tambah `shipping{}`, `customer{}`, `subtotal`, `shipping_cost`, `discount`, `timeline {created_at, paid_at, shipped_at}` |
| K5 | `pembayaran.galat` | §7.7 menyatakan selalu `null`; PRD §2.3 menyebut "pesan siap tampil" | Diputuskan: sumber utama `flash.error`; `galat` dibaca bila terisi. Tidak perlu perubahan kontrak bila §7.7a dipatuhi |

Desain **tidak** memakai field di luar daftar ini. Bila K1–K5 belum tersedia, komponen menampilkan `—` dan tombol terkait tidak dirender (tidak boleh menebak data).

---

## 12. Checklist QA (dipakai kartu QA)

**Tipografi (F4)**

- [ ] `grep -rn "text-\[[0-9]" resources/js/Pages/Public resources/js/Components resources/js/Layouts --include=*.jsx` → 0 hasil.
- [ ] `leading-none` hanya di `Button.jsx`.
- [ ] `max-w-xl` pada prosa → 0; setiap paragraf baru punya `max-w-[65ch]` dan tidak melebihi 65ch pada 360/768/1280.
- [ ] `uppercase` hanya pada `text-badge` (eyebrow) dan wordmark `font-display` (`grep -rn "text-label uppercase\|text-meta uppercase"` → 0).
- [ ] Tidak ada `tracking-wide|tracking-wider|tracking-tight`.
- [ ] Setiap file yang memanggil `rupiah(` memuat `tabular-nums`; total tidak pecah baris.
- [ ] Tidak ada nominal memakai `leading-none`.
- [ ] Satu `h1` per halaman; tidak ada `h1` di dalam kartu.

**Pembayaran (F1/F3)**

- [ ] 8 kanal tampil dari `pembayaran.kanal[]`, urutan grup benar, mode uji tetap menampilkan 8 kanal.
- [ ] Sebelum memilih: tidak ada tagihan dibuat (tidak ada instruksi/hitung mundur).
- [ ] Tiap kanal menampilkan instruksi yang benar (VA nomor, QRIS qr_url/qr_string, bill biller+bill_key, gerai kode) dan tombol salin bekerja + `Tersalin` 2 detik.
- [ ] Ganti kanal 2×: baris `payments` tetap 1, instruksi berganti, tidak ada error.
- [ ] Kanal ditolak: notice `Kanal ini belum aktif di Midtrans. Hubungi admin.`, status tetap pending.
- [ ] Hitung mundur sesuai `expires_at`; QRIS 5 menit, VA/gerai/bill 60 menit; 0 → state kedaluwarsa.
- [ ] Polling 3 detik, berhenti saat final, jalan lagi saat tab aktif; status berubah → halaman reload sendiri.
- [ ] `settlement` → panel lunas + tautan + auto pindah 5 detik; `Tetap di halaman ini` membatalkan.
- [ ] Mode uji: badge + tombol `Tandai lunas (mode uji)`; klik → panel lunas ≤3 detik.
- [ ] Tidak ada tautan/redirect ke `example.com`.

**Ongkir otomatis (F2)**

- [ ] Tidak ada tombol `Cek Ongkir`; tarif muncul tanpa klik setelah kode pos 5 angka + alamat ≥10 karakter.
- [ ] Mengetik cepat tidak mengirim request ganda (cek Network: 1 request per kode pos).
- [ ] Ganti kode pos → daftar tarif kosong, pilihan kurir reset, total `—`.
- [ ] Kembali ke kode pos yang sudah dipakai → tarif muncul dari cache tanpa request.
- [ ] State memuat/kosong/galat/konfigurasi tampil sesuai §5.3; `Coba lagi` bekerja; submit `disabled` dengan alasan.
- [ ] Prefill alamat user lama terisi; field bisa diedit; perubahan tidak mengubah profil.

**Register (F2)**

- [ ] Field alamat, kota, kode pos ada setelah Nomor WhatsApp; pesan galat sesuai §6.
- [ ] Kode pos hanya menerima 5 digit angka.
- [ ] Setelah daftar, checkout ter-prefill alamat tersebut.

**Admin (F6/F7)**

- [ ] Panel pembayaran menampilkan kanal (label, bukan `midtrans`), status, `transaction_id`, instruksi sesuai jenis, kedaluwarsa, lunas, tombol `Sinkronkan status`.
- [ ] Panel pengiriman menampilkan kurir/layanan/estimasi/berat/ongkir/resi/status Biteship + tombol `Buat resi otomatis` + input manual.
- [ ] `Buat resi otomatis` idempoten (dua klik = satu panggilan) dan pesan galat server tampil apa adanya.
- [ ] Pesanan mode uji diberi badge `Mode uji`.
- [ ] Daftar punya kolom Kurir/Resi + filter status pengiriman; label kanal tampil.
- [ ] Ekspedisi: pilih kurir → layanan terisi/terfilter; duplikat ditolak; katalog gagal → fallback manual, halaman tetap hidup.

**Riwayat (F8)**

- [ ] Kartu memuat nomor, tanggal, status pesanan + bayar, kurir/layanan/resi (salin), alamat, rincian biaya, item, timeline.
- [ ] Field null tampil `—`/`Resi belum tersedia.`; `detail_url = null` tidak merender tombol.
- [ ] Rincian bisa dibuka/tutup dengan keyboard (`aria-expanded`).
- [ ] 360px tetap terbaca; nama panjang `line-clamp-2`; tidak ada scroll horizontal.

**A11y & responsif**

- [ ] Semua elemen interaktif bisa dijangkau `Tab`/`Enter`/`Space`; fokus terlihat.
- [ ] Radio kanal & dropdown kurir bisa dioperasikan keyboard; `fieldset`/`legend` benar.
- [ ] `aria-live` hanya untuk perubahan status, bukan hitung mundur.
- [ ] `npm run build` lulus.

---

## 13. Traceability

| PRD | Bagian dokumen ini | Bagian kode |
|---|---|---|
| F1 Midtrans tanpa Snap | §1 D1–D9, §4 | `Public/CheckoutPay`, `Components/QrisPanel` |
| F2 Alamat + ongkir otomatis | §5, §6 | `Public/Checkout`, `Public/Auth/Register` |
| F3 Selesai bayar & status otomatis | §1 D5–D6, §4.4–§4.5 | `Public/CheckoutPay`, `Public/CheckoutSuccess` |
| F4 Tipografi | §2 seluruhnya | `Pages/Public/**`, `Components/**`, `Layouts/**` |
| F5 Ekspedisi dropdown | §8 | `Admin/Shipping/Index` |
| F6 Admin pesanan | §7 | `Admin/Orders/Show`, `Admin/Orders/Index` |
| F7 Resi otomatis | §7.3 | `Admin/Orders/partials/InfoResi` |
| F8 Riwayat informatif | §9 | `Public/History` |

---

## 14. Asumsi

1. `shipped_at` disediakan B4 (K5); bila tidak tersedia, node `Dikirim` hanya mengandalkan `shipping.status`/`status = dikirim` dengan waktu `—`.
2. Warna badge status memakai token existing design-v1.1 §2.3; tidak ada warna baru.
3. Label kanal, pesan galat, dan status selalu berasal dari server; desain tidak menyalin teks server ke konstanta frontend kecuali copy pada §3.2.
4. QRIS mode uji tidak punya `qr_url`; fallback teks `qr_string` dianggap cukup tanpa menambah pustaka QR baru.
5. Panel admin memakai komponen `KartuBagian`/`StatusBadge` existing; F4 tidak mewajibkan perubahan admin kecuali komponen bersama (`OrderSummary`, `PriceBlock`, `Input`, `Button`).
6. `prefers-reduced-motion`: animasi reveal/transisi harga dimatikan (pola design-v1.1 dipertahankan).
7. Rute resi otomatis yang benar adalah `POST /admin/pesanan/{order}/resi-otomatis` (`routes/admin.php:150`); PRD §8 menyingkatnya sebagai `POST /admin/pesanan/{order}/resi`. Design mengikuti rute nyata; PRD tidak perlu diubah.
8. Masa berlaku mengikuti server: QRIS 5 menit, VA/bill/gerai 60 menit (`MIDTRANS_EXPIRY_VA_MINUTES`); UI tidak menghitung sendiri.

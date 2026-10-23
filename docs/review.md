# Review techlead — laporan pemilik 21 Okt 2026 (kartu `t_15531332`)

Metode: baca-saja berkas repo (tanpa menyalakan server, tanpa `.env`, tanpa database pemilik).
Semua baris bukti merujuk kondisi `HEAD` = `66527ce`. Yang butuh browser/login pemilik ditandai
**"belum diuji, butuh browser"**.

## 1. Ringkasan

| # | Laporan pemilik | Hasil verifikasi | Akar masalah | Sumber | Kartu perbaikan |
|---|---|---|---|---|---|
| 1 | Ikon keranjang tidak menampilkan jumlah barang masuk keranjang | **Cacat pasti (kode)** | `cartAmount` halaman menutupi shared prop | frontend | F1 |
| 2 | `/checkout/6/bayar` belum menampilkan QRIS Midtrans (tidak bisa dicoba transfer) | **Cacat pasti (kode + ops)** | Mode `fake` aktif secara bawaan & tidak terlihat; tagihan lama tidak pernah dibuat ulang | backend (2 akar) + frontend (1 akar) | B1, F2 |
| 3 | Waktu checkout terlalu lama → minta 5 menit | **Perubahan ketentuan pemilik** (PRD §8/A17 = 15 menit) | `config/midtrans.php` menulis 15 menit hard-code | requirement | B2 |
| 4 | `/admin/produk`, `/admin/stok`, `/admin/pesanan` tidak ada CRUD/search/pagination/filter/gambar | **Cacat pasti (kode)** | 3 halaman masih placeholder + 5 halaman belum pernah dibuat | frontend + perencanaan | F3, F4, F5 |
| 5 | (chat pemilik) penilaian/rating tidak bisa dikirim setelah checkout | **Cacat pendukung (kode)** | Halaman tidak memakai `ulasan.boleh`; form tetap tampil & baru ditolak server | frontend | F6 |

## 2. Temuan dengan bukti

### F-1 Badge keranjang selalu 0 (butir 1)
- Bukti: `app/Http/Middleware/HandleInertiaRequests.php:39-41` membagikan `cart.count` (dari sesi).
  `resources/js/Layouts/PublicLayout.jsx:22` mendeklarasikan `cartCount = 0` dan `:43` memakai
  `Number(cartCount ?? sharedCart ?? …)`. Karena `cartCount` **selalu berupa angka** (bawaan `0`),
  `??` tidak pernah jatuh ke `cart.count`.
- Tidak ada satu pun controller yang mengirim prop `cartCount` (`grep -rn "cartCount" app/` → 0 hasil),
  sementara halaman-halaman publik menetapkan bawaan `0`: `Pages/Public/Home.jsx:66`,
  `Pages/Public/Products/Index.jsx:53`, `Pages/Public/Products/Show.jsx:41`, `Pages/Public/Contact.jsx:29`.
- Akibat: badge jumlah item di header tidak pernah muncul (nilai 0 selalu disembunyikan), termasuk
  setelah POST `/keranjang` berhasil. Dugaan: satu baris perbaikan di `PublicLayout.jsx:43`
  (utamakan `page.props.cart.count`) cukup untuk semua halaman.
- Sumber: **frontend**. Kartu **F1**.

### F-2 QRIS tidak bisa dipakai transfer (butir 2) — tiga akar terpisah
1. **Mode uji aktif & tersembunyi.** `config/midtrans.php:31` → `'fake' => (bool) env('MIDTRANS_FAKE', true)`
   (bawaan **true**) dan `.env.example:74` juga `MIDTRANS_FAKE=true`. `MidtransService::isFake()`
   (`app/Services/MidtransService.php:26-29`) juga bernilai true bila `MIDTRANS_SERVER_KEY` kosong.
   Di mode ini tagihan hanya berisi EMVCo lokal: `qris_url = null`, `payload.mode = 'fake'`
   (`app/Services/MidtransService.php:38-51`) → QR tampil tapi tidak mungkin dibayar.
   Halaman bayar **tidak pernah** menampilkan penanda mode uji: `grep -n "fake" Pages/Public/CheckoutPay.jsx`
   dan `Components/QrisPanel.jsx` → 0 hasil, padahal server sudah mengirim `pembayaran.fake` dan
   `midtrans.fake` (`app/Http/Controllers/CheckoutController.php:248,275`, kontrak §7.7 `docs/kontrak-props.md:425-434`).
2. **Pengaturan Midtrans di panel admin tidak dipakai sistem pembayaran.** Field
   `midtrans_client_key` + `midtrans_is_production` (`app/Services/SettingService.php:46-47`,
   form `resources/js/Pages/Admin/Settings/Index.jsx:2016-2036`, label "Mode sandbox/produksi")
   hanya tersimpan ke tabel `settings`; tidak ada pembaca di jalur pembayaran mana pun
   (`grep -rn "midtrans_client_key|midtrans_is_production" app/ config/` → hanya request/service admin).
   Kredensial efektif tetap `config('midtrans.*')` = `.env`. Jadi mengisi pengaturan admin tidak
   mengubah apa pun, dan tidak ada kolom server key di sana. Dugaan: inilah sebab laporan
   "sudah saya isi di .env dan pengaturan admin web" tetap menghasilkan QR yang tidak bisa dibayar.
3. **Tagihan lama tersangkut mode fake.** `CheckoutController::pay()`
   (`app/Http/Controllers/CheckoutController.php:85-104`) hanya merender tagihan tersimpan; tidak ada
   jalur membuat ulang tagihan. `status()` hanya sinkron ke Midtrans bila `! isFake()`
   (`:112`). Konsekuensi: `/checkout/6/bayar` tetap menampilkan QR dummy walaupun `.env` sudah benar.
- Sumber: **backend** (akar 2 dan 3) → kartu **B1**; **frontend** (akar 1) → kartu **F2**.
- Catatan ops: setelah mengubah `.env`, `php artisan config:clear` wajib bila `config:cache` pernah
  dijalankan (`docs/langkah-pemilik.md`). `bootstrap/cache/` saat ini **tidak** memuat `config.php`,
  jadi konfigurasi belum di-cache.

### F-3 Masa berlaku QRIS 15 menit → 5 menit (butir 3)
- `config/midtrans.php:33` menulis `'expiry_minutes' => 15` (hard-code, **tidak** membaca `.env`),
  dipakai `MidtransService::createQrisCharge` untuk `custom_expiry` dan `payments.expires_at`
  (`app/Services/MidtransService.php:36,76-79`). PRD §8 butir 6 (`docs/PRD.md:219`) dan A17
  (`docs/PRD.md:377`) menulis 15 menit → **perintah pemilik menggantikan dokumen**; catat sebagai
  amendemen, bukan asumsi techlead (lihat `docs/pertanyaan-pemilik.md` §5).
- Sumber: **requirement (pemilik)** → kartu **B2**.

### F-4 Panel admin produk/stok/pesanan kosong (butir 4)
- Halaman masih placeholder 25–29 baris dan memakai nama prop yang tidak ada di server
  (`products`/`stok`/`pesanan` lokal), contoh `resources/js/Pages/Admin/Products/Index.jsx:6`
  (`{ products = [], loading, error }`) vs props server `produk{data,links,meta}` + `filter` +
  `kategori` + `ringkasan` (`app/Http/Controllers/Admin/ProductController.php:89-100`,
  kontrak §12.1 `docs/kontrak-props.md:1067-1095`). Hal yang sama di `Stocks/Index.jsx` (25 baris),
  `Orders/Index.jsx` (26 baris) vs `StockController.php:71-81`, `OrderController.php:94-100`.
- **Empat halaman yang dirutekan belum ada berkasnya sama sekali** → rute mengembalikan galat, bukan
  halaman kosong: `Admin/Products/Create` (`routes/admin.php` → kontrak §12.2), `Admin/Products/Edit`
  (§12.5), `Admin/Products/Show` (§12.4), `Admin/Orders/Show` (§12.17), `Admin/Stocks/History` (§12.15)
  — lima halaman, tidak ada di `resources/js/Pages/Admin/`.
- Sebab perencanaan (bukan hanya kode): `docs/catatan-techlead.md:68` sudah mencatat "Products/Orders/Stocks
  menunggu kontrak props `t_ed8bd8e4`", dan `docs/catatan-backend.md:463,477` menyerahkan lima halaman
  itu ke kartu frontend — tetapi kartu lanjutannya tidak pernah dibuat setelah kontrak §12 terbit.
  Kategori (`t_e5149746`) dan Akun sudah selesai; produk/stok/pesanan tidak.
- Sumber: **frontend** (implementasi) + **perencanaan techlead** (kartu yang hilang) → kartu **F3, F4, F5**.

### F-5 Penilaian setelah checkout (laporan chat pemilik)
- `resources/js/Pages/Public/CheckoutSuccess.jsx` mengabaikan prop `ulasan.boleh` (kontrak §9.1):
  `pending` dihitung hanya dari `ulasan.sudah` (`:19-27`), jadi form tetap tampil walau order belum
  lunas; kiriman baru ditolak di server (`app/Services/ReviewService.php:28-42` menuntut
  `payment_status = settlement` + status dibayar/diproses/dikirim/selesai;
  `app/Http/Controllers/ReviewController.php` membalas flash "Ulasan bisa dikirim setelah pembayaran
  berhasil."). Karena pembayaran tidak pernah settle (F-2), penguji tidak pernah bisa menilai.
- Sumber: **frontend** (halaman tidak menjelaskan syarat) → kartu **F6**. Akar di sisi pembayaran
  ditangani B1.

## 3. Lulus / belum dicek

- **Lulus (dicek techlead dari berkas):** rute admin 22 buah terdaftar (`routes/admin.php`);
  controller admin produk/stok/pesanan sudah mengirim props kontrak §12; `Kategori`, `Akun`, `Pesan`,
  `Penilaian`, `Pengaturan`, `Dashboard`, `Login` admin sudah penuh; tidak ada perubahan kode di luar
  `docs/` dari kartu ini.
- **Belum dicek, butuh browser:** tampilan nyata `/checkout/6/bayar`, badge keranjang setelah klik
  "Tambah ke keranjang", semua halaman `/admin/*` (perlu login; kredensial admin dipegang pemilik),
  dan apakah `public/build` yang ter-commit sudah memuat berkas terbaru (harus di-`npm run build` ulang
  setelah F1–F6). Verifikasi techlead hanya statis (`find resources/js -newer public/build/manifest.json`
  → 0 berkas saat ini).
- **Belum dicek, butuh kredensial Midtrans:** apakah QRIS Midtrans sandbox/produksi benar-benar bisa
  discan dan transfer berhasil. B1 hanya bisa dibuktikan dengan test bermock; uji transfer nyata milik pemilik.

## 4. Risiko

1. `MIDTRANS_FAKE=true` ikut terbawa ke produksi (bawaan contoh `.env`) → QRIS tidak bisa dibayar
   tanpa galat apa pun. Mitigasi B1 (status mode terlihat + alasan) dan checklist rilis devops.
2. Lima halaman admin menambah beban frontend besar (form produk + unggah gambar + varian). Dipecah
   per modul (F3/F4/F5) dan dirantai agar `public/build` tidak dibangun bersamaan.
3. `docs/kontrak-props.md` §12 masih berstatus **DRAFT** (§12.23): bila ditemukan ketidaksesuaian
   dengan controller, backend memperbarui kontrak, bukan frontend mengarang kontrak baru.
4. Uji transfer Midtrans nyata tidak bisa dilakukan agent → rilis produksi tetap menunggu pemilik.

## 5. Rekomendasi

**Go bersyarat.** Rilis produksi belum layak sampai: (a) F1–F6 + B1–B2 selesai dan QA (`QA1`) lulus;
(b) devops membekukan `public/build` setelah seluruh perubahan; (c) pemilik membuktikan satu QRIS
Midtrans sandbox benar-benar terbayar dengan `MIDTRANS_FAKE=false` + `MIDTRANS_SERVER_KEY` asli.
Keputusan rilis akhir di pemilik.

## 6. Peta kartu

| Kartu | Assignee | Parent | Isi |
|---|---|---|---|
| B1 | backenddeveloper | t_15531332 | Mode uji Midtrans terlihat + tagihan fake lama dibuat ulang + seam agar bisa dites |
| B2 | backenddeveloper | B1 | Masa berlaku QRIS 5 menit (`MIDTRANS_EXPIRY_MINUTES`) + dokumen |
| F1 | frontenddeveloper | t_15531332 | Badge keranjang membaea `cart.count` |
| F3 | frontenddeveloper | F1 | `Admin/Produk`: Index (search/filter/pagination/gambar) + Create/Edit/Show |
| F4 | frontenddeveloper | F3 | `Admin/Stok`: Index + Riwayat |
| F5 | frontenddeveloper | F4 | `Admin/Pesanan`: Index + Show |
| F2 | frontenddeveloper | B1, F5 | Penanda mode uji di halaman bayar + status mode di tab Pembayaran admin |
| F6 | frontenddeveloper | F5 | Halaman selesai menghormati `ulasan.boleh` |
| U1 | uiux | t_15531332 | Catat deviasi `docs/design.md` (penanda mode uji, hitung mundur 5 menit, label tab Pembayaran) |
| QA1 | qatesting | F2, B2, F6 | Verifikasi ulang laporan pemilik + suite test |
| D1 | devops | QA1 | Build rilis beku + sapuan bundel + perbarui `docs/deploy.md`/`docs/checklist-rilis.md` |

## 7. Keputusan lanjutan F4 — `/admin/stok` (21 Okt 2026, kartu `t_a24a79d0`)

Empat permintaan yang tidak didukung kontrak §12.12–§12.15 — kolom "nilai minimum", aksi "set stok" absolut
(lewat rute baru), "stok sebelum → sesudah", dan filter tanggal riwayat — diputuskan **tidak dibangun**.
Kartu F4 (`t_321bf03c`) **tidak direvisi** dan tidak ada kartu backend/QA baru untuk keempat hal itu.
Dasar per butir + jalur perubahan bila pemilik ingin: `docs/keputusan-f4-stok.md`; keputusan ringkas di
`docs/pertanyaan-pemilik.md` §4 (T4); usulan + biaya di `docs/usulan.md`.

Untuk QA `t_3a240a11`: acuan uji halaman stok = kontrak §12.12–§12.15 (`docs/kontrak-props.md:1282-1334`),
PRD baris 255 (`docs/PRD.md:255`), dan pola tabel design §5.12 (`docs/design.md:680-690`). Keempat hal di
atas **bukan cacat** — jangan dijadikan temuan.

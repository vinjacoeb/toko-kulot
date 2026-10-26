# Review — form penilaian dobel (kartu t_2705369c)

Tanggal: 24 Okt 2026. Lingkup: halaman `/checkout/{order}/selesai`, bagian "Beri Penilaian".
Laporan pemilik: pesanan dengan 2 varian produk yang sama (mis. XL Merah + L Hijau) menampilkan
form penilaian 2 kali.

## P-01 — Satu produk, dua varian: kartu penilaian tampil 2

**Status: GAGAL** (perbaikan belum dikerjakan; kartu diperbaiki dibuat di bawah).

Bukti:
- `resources/js/Pages/Public/CheckoutSuccess.jsx:21` — `items` diambil apa adanya dari
  `pesanan.items`.
- `app/Http/Controllers/CheckoutController.php:370-380` — `items` dibentuk dari
  `$order->items->map(...)`, yaitu **satu baris per item pesanan (varian)**, bukan per produk;
  baris dengan `product_id` sama tetap muncul dua kali bila variannya berbeda.
- `app/Services/OrderService.php:89-98` — satu `OrderItem` dibuat per baris keranjang/varian,
  jadi dua varian produk yang sama = dua baris dengan `product_id` identik.
- `resources/js/Pages/Public/CheckoutSuccess.jsx:36-43` — `pending` dan `sudahAda` difilter dari
  `items` (per baris), bukan per `product_id` unik, sehingga dua baris produk sama lolos dua kali.
- `resources/js/Pages/Public/CheckoutSuccess.jsx:214-223` — `pending.map` merender satu
  `ReviewForm` per baris; `key={`isi-${item.product_id}`}` jadi duplikat untuk produk yang sama.

Akar masalah: daftar kartu penilaian diturunkan dari baris pesanan (varian), sedangkan aturan
ulasan adalah per produk. Bukan dugaan — terlihat langsung di tiga rujukan di atas.

Dampak:
1. Dua form untuk produk yang sama; submit form kedua ditolak server dengan
   `ulasan.0.product_id = "Produk ini sudah Anda nilai."` (kontrak §9.1).
2. React memakai `key` duplikat pada daftar, berpotensi salah rekonsiliasi state antar kartu.
3. Setelah satu kiriman berhasil, kedua baris berubah jadi kartu "sudah dinilai" — pesan
   terima kasih tampil dua kali.

Yang benar menurut dokumen acuan:
- `docs/design.md:617` — "kartu penilaian **per produk**".
- `docs/kontrak-props.md:1039` — satu produk satu ulasan per order (`reviews.order_id` +
  `reviews.product_id` unik).
- `docs/kontrak-props.md:745-753` — `ulasan.sudah` adalah daftar `product_id` unik.

## Yang lulus

- Gerbang `ulasan.boleh` dari server tetap benar (`CheckoutController.php:307-326`): pesanan
  multi-produk yang baru sebagian diulas tetap boleh dinilai, dan produk yang sudah diulas
  dikeluarkan dari daftar.
- Validasi server menolak produk duplikat dalam satu kiriman (`ReviewService.php:81-85`) dan
  menolak produk di luar pesanan (`ReviewService.php:75-79`).
- Ringkasan pesanan tetap boleh menampilkan baris per varian (harga/qty per baris) — bukan bug.

## Yang belum dicek

- Reproduksi di browser: **belum dicek, butuh browser** (server dijalankan pemilik; saya tidak
  menyalakan server). Kesimpulan di atas dari kode, bukan dari layar.
- Data pesanan nyata pemilik: tidak dibaca (`.env` dan database milik pemilik).

## Rekomendasi

Satu kartu perbaikan frontend (satu masalah satu kartu): kelompokkan `items` per `product_id`
sebelum menghitung `pending`/`sudahAda`, gabungkan `variant_label` unik pada kartu, lalu
`npm run build`. Tidak perlu perubahan backend/kontrak.

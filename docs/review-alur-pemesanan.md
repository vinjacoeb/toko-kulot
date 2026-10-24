# Review alur pemesanan (kartu t_8e8bb605)

Tanggal: 2026-10-24. Lingkup: alur pembeli dari memilih barang sampai memberi ulasan,
fokus Snap Midtrans dan Biteship. Metode: baca kode + log + test yang ada. Tidak menyalakan
server, tidak memakai browser, tidak menyentuh `.env` pemilik.

## 1. Ringkasan

| # | Langkah | Bukti yang diperiksa | Status |
|---|---------|----------------------|--------|
| 1 | Pilih barang → keranjang | `CartService`, `routes/api.php`, `CartTest` | Lulus (statis) |
| 2 | Buka checkout | `CheckoutController::index`, `Public/Checkout.jsx` | Lulus (statis) |
| 3 | **Cek ongkir** | `BiteshipService::rates():124-210`, log | **GAGAL** — lihat §2 |
| 4 | Submit pesanan | `OrderService::createFromCart():33-115` | Belum bisa diuji: terhalang #3 |
| 5 | Tagihan Snap | `MidtransService::snapParams():594-618`, `SdkMidtransApi` | Belum dicek, butuh browser + key asli |
| 6 | Bayar di halaman Snap | `CheckoutPay.jsx:47-140` | Belum dicek, butuh browser |
| 7 | Webhook Midtrans | `MidtransNotificationController`, `MidtransService::handleNotification():305-336` | Lulus (statis + test lama mode uji) |
| 8 | Halaman sukses | `checkout.success`, `CheckoutController` | Belum dicek, butuh browser |
| 9 | Kirim ulasan | `ReviewController`, `ReviewService::isEligible():39-43` | Lulus (statis) |

Tidak ada perubahan kode dari saya (techlead hanya menulis di `docs/`).
Catatan: `bootstrap/cache/` tidak memuat `config.php`, jadi perubahan `.env` pemilik langsung
berlaku (tidak perlu `php artisan config:clear`).

## 2. Temuan utama — ongkir selalu gagal (F1)

Apa yang salah: setiap "Cek Ongkir" berakhir `GALAT_API` ("Ongkir tidak bisa dihitung saat ini").
Bukti: 26 baris `Biteship rates menjawab tidak sukses {"status":400}` di
`storage/logs/laravel.log:7142-7144` (16:56, 16:58, 17:13 hari ini). Bukan 401, jadi kunci
diterima Biteship; yang ditolak adalah isi permintaan atau data kode pos/kurir.

Dugaan (belum terbukti): Biteship menjawab `40001001` (kode pos asal/tujuan tidak dikenal)
atau `40001002` (parameter kurang). Alasan belum bisa dipastikan: `BiteshipService.php:173`
dan `:281` hanya mencatat `status`, bukan `error`/`code` dari body.

Yang membuat ini lebih dari sekadar "API sedang gangguan":
- Body permintaan sudah sesuai PRD v1.1 §3 dan docs Biteship (`origin_postal_code`,
  `destination_postal_code`, `couriers`, `items[].{name,value,quantity,weight}`); berat
  minimum 500 gram terpenuhi (`CartService::shippingItems():254-281`).
- Asal kirim divalidasi 5 digit sebelum panggilan (`BiteshipService.php:138-146`), kurir aktif
  tidak mungkin kosong (`ShippingController::update():63-67`), base URL benar
  (`config/biteship.php:10`).
- Jadi sisa tersangka: kode pos asal/tujuan yang dipakai saat uji, atau pembatasan akun/key
  `biteship_test.*`. Keduanya hanya bisa dibedakan setelah `code` Biteship tercatat.
- PRD D2 AC-4 menuntut "pesan yang bisa ditindaklanjuti"; saat ini pembeli hanya dapat pesan
  umum, dan tidak ada jejak untuk pemilik.

Dampak: langkah 4-9 tidak bisa diuji; tidak ada order bisa dibuat saat key Biteship terisi
(tidak ada jalur ongkir tebakan, sesuai PRD).

Tindakan: kartu perbaikan untuk `backenddeveloper` (satu masalah, satu kartu) — catat
`error`/`code` + kode pos, petakan kode error Biteship jadi pesan Indonesia, tambah test 400.
Setelah itu pemilik klik ulang "Cek Ongkir" dan menempelkan baris log baru; dari situ akar
masalah dipastikan (kode pos uji vs akun/key).

## 3. Temuan kecil (dicatat, belum jadi kartu)

- F2 `ReviewService::REVIEWABLE_STATUSES` menerima `dibayar`, `diproses`, `dikirim`, `selesai`;
  PRD A5 hanya menyebut `dibayar`/`selesai`. Kode lebih longgar, tidak merusak AC; risiko rendah.
- F3 `CheckoutPay.jsx:40` memakai batas 10 detik untuk "memeriksa status"; endpoint status
  memanggil Midtrans (`syncStatus`), jadi koneksi lambat bisa memunculkan status galat palsu.
  Dugaan, belum diuji.
- F4 `CheckoutPay.jsx` mengandalkan `snap_redirect_url` (halaman Snap hosted), bukan popup
  `snap.js`; ini pilihan sah dan tidak butuh client key di browser. Belum diuji dengan key asli.

## 4. Yang belum dicek dan alasannya

- Snap asli (langkah 5-6): butuh browser + kredensial merchant pemilik; saya dilarang
  menyalakan server dan membaca `.env`.
- Halaman sukses + form ulasan (langkah 8-9): butuh order yang benar-benar dibayar.
- Tampilan checkout setelah ongkir pulih: terhalang F1.

## 5. Rekomendasi

No-Go untuk "alur pemesanan siap" sampai F1 diperbaiki dan pemilik berhasil melihat daftar
ongkir lalu membayar satu pesanan uji sampai muncul form ulasan. Urutan: kartu F1 → pemilik
uji ulang ongkir → Snap → ulasan. Keputusan rilis tetap di pemilik.

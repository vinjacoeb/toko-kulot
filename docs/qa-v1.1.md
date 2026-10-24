# QA addendum v1.1 — hasil rencana & eksekusi

Kartu: `t_4c147c9f` (QA). Dokumen acuan: `docs/PRD-v1.1.md` §2–§6, `docs/design-v1.1.md`,
`docs/kontrak-props.md` §10.13, `docs/brief-owner6.md`.
Tanggal eksekusi: 2026-10-24. Workspace: `C:\Users\LENOVO\Downloads\toko-kulot`.

## 1. Ringkasan

- Suite penuh: **290 test, 2250 assertion, OK** (`docs/bukti-qa-v1.1-phpunit.txt`).
- Test QA baru: **10 test, 101 assertion, OK** (`docs/bukti-qa-v1.1-qa-test.txt`).
- Build frontend: **exit 0, 4.15 s** (`docs/bukti-qa-v1.1-build.txt`).
- Browser (landing): 360/768/1280 tanpa horizontal scroll, 24 gambar, 0 gambar rusak,
  reduced-motion aman (`docs/bukti-qa-v1.1-browser.txt`).
- **1 defect kode Low** (copy keranjang) + **1 kegagalan data Low** (teks CTA DB lama) → **GO BERSYARAT**.

## 2. Metode & environment

| Hal | Nilai |
|---|---|
| PHP | 8.3.32 |
| PHPUnit | 11.5.57 (`vendor/phpunit/phpunit/phpunit`) |
| DB test | SQLite `:memory:` (`phpunit.xml`), PDO sqlite diaktifkan lewat `PHP_INI_SCAN_DIR` ke scratch QA — `php.ini` sistem tidak diubah |
| Build | `npm run build` (Vite) |
| Browser | Chromium via CDP, server pemilik `http://127.0.0.1:8000` (QA tidak menyalakan server) |
| Perintah suite | `php vendor/phpunit/phpunit/phpunit --colors=never` |

Catatan: `php artisan test` di environment ini berhenti dengan `stdin is not a tty`; karena itu
suite dijalankan langsung lewat binary PHPUnit dengan konfigurasi `phpunit.xml` yang sama.
Bukan kegagalan aplikasi.

## 3. Status acceptance criteria

### D1 — Pembayaran semua kanal (Midtrans Snap), PRD §2

| AC | Status | Bukti |
|---|---|---|
| AC1 checkout → halaman bayar + tombol Snap | **Lulus** | `tests/Feature/Checkout/QaV11OngkirPembayaranTest.php:105` (props `pembayaran.snap_redirect_url`, `midtrans.mode=asli`); `MidtransSnapTest.php:87` (token/redirect/order_id unik) |
| AC2 webhook `bank_transfer`/`echannel` settlement, idempoten, stok tidak dobel | **Lulus** | `QaV11OngkirPembayaranTest.php:120` (kirim notifikasi 2×: `paid_at` tetap, stok tetap, 1 payment); `MidtransSnapTest.php:114`; `:147` (qris) |
| AC3 mode fake: halaman bayar tampil + simulasi jadi `dibayar` | **Lulus** | `MidtransSnapTest.php:182`; `:214` (user lain ditolak) |
| AC4 tidak ada teks “QRIS satu-satunya” di checkout/bayar | **Lulus** | `CheckoutPay.jsx:138` — panel QRIS hanya saat `isFake`; jalur asli hanya Snap (`:165–189`). Copy keranjang yang masih menyebut QRIS dicatat sebagai QA-V11-01 (di luar halaman checkout/bayar) |

Tidak diuji: transaksi Snap sandbox nyata (butuh client/server key asli). Risiko dicatat §7.

### D2 — Ongkir Biteship, PRD §3

| AC | Status | Bukti |
|---|---|---|
| AC1 “Cek Ongkir” menampilkan opsi + harga + ETD | **Sebagian**: Lulus mode fake; **Belum Diuji** API asli (tanpa `BITESHIP_API_KEY`) | `CheckoutShippingTest.php:135` (tarif datar + ETD), `:158`; `QaV11OngkirPembayaranTest.php:150` (galat API terstruktur) |
| AC2 harga server dipakai, `shipping_courier`/`shipping_service` terisi | **Lulus** | `CheckoutShippingTest.php:191` (harga klien diabaikan / tarif berubah ditolak) |
| AC3 key kosong → mode fake tetap bisa order | **Lulus** | `CheckoutShippingTest.php:135`, `:158`; order terbentuk di `QaV11OngkirPembayaranTest.php:170` |
| AC4 API galat/nihil → tidak ada order + pesan bisa ditindaklanjuti | **Lulus** | `QaV11OngkirPembayaranTest.php:150`: `/checkout/ongkir` → `galat`, submit → session `error` = `BiteshipService::GALAT_API`, `orders` tetap 0 |

### D3 — Gratis ongkir, PRD §4

| AC | Status | Bukti |
|---|---|---|
| AC1 subtotal Rp300.000 + reguler → ongkir 0, `shipping_is_free=true` | **Lulus** | `QaV11OngkirPembayaranTest.php:170` (batas bawah inklusif) |
| AC2 subtotal Rp299.999 → ongkir normal | **Lulus** | `QaV11OngkirPembayaranTest.php:188` (ongkir 20.000, total 319.999) |
| AC3 subtotal Rp500.000 + non-reguler → tetap bayar | **Lulus** | `QaV11OngkirPembayaranTest.php:206` (layanan `yes` non-reguler, tetap 20.000) |

### D4 — Admin `/admin/ekspedisi`, PRD §5

| Butir | Status | Bukti |
|---|---|---|
| Route admin + guard | **Lulus** | `CheckoutShippingTest.php:204` (non-admin ditolak), `:213` |
| Simpan asal kirim, kurir aktif/reguler, gratis ongkir | **Lulus** | `CheckoutShippingTest.php:213` (normalisasi kode, `free_shipping_*`) |
| Tolak semua kurir nonaktif | **Lulus** | `CheckoutShippingTest.php:243` (error `couriers`, data lama tidak tertimpa) |
| `BITESHIP_API_KEY` tidak tampil, hanya `key_terisi` | **Lulus** | `QaV11OngkirPembayaranTest.php:239` (`assertDontSee` key; props `kurir.key_terisi`) |
| Bentuk props `kurir` = kontrak §10.13 (`mode/key_terisi/sumber/galat/daftar`) | **Lulus** | `QaV11OngkirPembayaranTest.php:250`; implementasi `BiteshipService.php:248–343` |
| Daftar kurir API gagal → halaman tetap tampil, galat, data lama tidak hilang | **Lulus** | `QaV11OngkirPembayaranTest.php:262` (HTTP 500 → `kurir.galat` + 1 layanan tersimpan) |
| Isi kode layanan manual dari UI | **Belum diuji, butuh browser + login admin** | Komponen `Admin/Shipping/Index.jsx` ada; kredensial admin tidak tersedia |

### D5/D6/D7 — Landing, galeri, CTA, PRD §6

| AC | Status | Bukti |
|---|---|---|
| AC1 360/768/1280 tanpa horizontal scroll; galeri tampil bila ≥1 gambar, hilang bila kosong | **Lulus** | Browser: scrollWidth 360/753/1265 vs innerWidth 360/768/1280 → overflow 0; `#galeri` 4 item; kosong → `LandingGallery.jsx:60` `return null`; props `null` diuji `QaV11OngkirPembayaranTest.php:292` |
| AC2 admin unggah/hapus/urut galeri, tampil di `/` tanpa deploy | **Lulus** (backend + props); UI browser **Belum diuji** | `AdminLandingGalleryTest.php` 9 test (unggah, hapus, urut, ganti, 8 maks, validasi tipe/2 MB, caption 80/alt 120, terkirim ke beranda) |
| AC3 teks CTA memuat “Rp300.000” dan “reguler” | **Gagal pada data live**; kode & seeder benar | Live: “Tinggalkan email Anda untuk kabar koleksi baru.” — tanpa “reguler”. `SettingSeeder.php:223` sudah benar. Lihat QA-V11-02 |
| AC4 `prefers-reduced-motion: reduce` → tanpa animasi reveal panjang | **Lulus** | Browser: 0 elemen `opacity-0.translate-y-3`; `Reveal.jsx:15,20,48` (`motion-reduce:transition-none`) |
| AC5 build sukses; tanpa `console.log`/`Lorem ipsum`/gambar 404 | **Lulus** | `npm run build` exit 0; 0 gambar rusak dari 24; `console.log` hanya di `resources/js/lib/gallery.check.mjs` (skrip cek dev, tidak masuk bundle — `public/build` tidak memuatnya) |
| D6 galeri dari tab Landing `/admin/pengaturan` | **Lulus** backend; UI **Belum diuji** | `AdminLandingGalleryTest.php`, props `settings.landing_gallery` diuji `QaV11OngkirPembayaranTest.php:290` |
| D7 CTA/newsletter dari tab Landing | **Sebagian** | Kode membaca `sections.newsletter.subtitle` (`Home.jsx:151–154`); data live masih lama (QA-V11-02) |

## 4. Test case (ringkas)

| ID | Fitur | Skenario | Hasil | Tipe |
|---|---|---|---|---|
| QA-D1-01 | Bayar | Halaman bayar memuat Snap, tanpa server key | Lulus | Positif/keamanan |
| QA-D1-02 | Webhook | Settlement bank_transfer dikirim 2× | Lulus | Idempotensi |
| QA-D1-03 | Fake | Simulasi pembayaran → lunas; user lain ditolak | Lulus | Otorisasi |
| QA-D2-01 | Ongkir | API error 500 → tanpa order, pesan galat | Lulus | Negatif |
| QA-D2-02 | Ongkir | Harga dari form diabaikan | Lulus | Keamanan |
| QA-D2-03 | Ongkir | Key kosong → tarif uji, order jadi | Lulus | Fallback |
| QA-D3-01 | Gratis ongkir | 300.000 / 299.999 / 500.000 non-reguler | Lulus | Boundary |
| QA-D4-01 | Admin | Simpan, tolak semua nonaktif, fallback katalog | Lulus | Fungsional |
| QA-D4-02 | Admin | Key tidak bocor di props/HTML | Lulus | Keamanan |
| QA-D5-01 | Landing | 360/768/1280 overflow; galeri; reduced motion | Lulus | UI |
| QA-D6-01 | Galeri | Unggah/hapus/urut/validasi ≤8, ≤2 MB | Lulus | Fungsional |
| QA-D7-01 | CTA | Teks live memuat “Rp300.000” + “reguler” | **Gagal (data)** | Konten |

Regresi: seluruh suite v1.0 + v1.1 hijau (290 test), termasuk keranjang, checkout, stok,
pesanan, laporan, pengaturan, dan 9 test galeri.

## 5. Perubahan pada test (bukan kode aplikasi)

Agar suite v1.1 dapat berjalan, empat berkas test diperbaiki (sesuai batas kartu: hanya `tests/`):

1. `tests/Feature/Checkout/MidtransSnapTest.php` — tambah `'biteship.key' => null` pada fixture config.
2. `tests/Feature/Checkout/UlasanBolehVerifikasiQaTest.php` — sama.
3. `tests/Feature/Checkout/CheckoutShippingTest.php` — tambah `'free_shipping_enabled' => false` pada payload; ganti assertion `assertNull(setting)` yang keliru menjadi “nilai lama tidak tertimpa” + `shipping_couriers` tidak dibuat.
4. `tests/Feature/Admin/AdminSettingTest.php` — jumlah grup pengaturan mengikuti kontrak §10.7: 7 grup eksplisit (`umum`, `landing`, `header`, `footer`, `kontak`, `seo`, `pembayaran`).

Test QA baru: `tests/Feature/Checkout/QaV11OngkirPembayaranTest.php` (10 test).

## 6. Defect & temuan

### QA-V11-01 — Copy keranjang masih “Pembayaran QRIS”

- **Severity/Prioritas:** Low / P3. **Komponen:** Frontend.
- **Lokasi:** `resources/js/Pages/Public/Cart.jsx:171` (`note="Pembayaran QRIS"`).
- **Langkah:** login → isi keranjang → buka `/keranjang` → lihat ringkasan pesanan.
- **Aktual:** catatan ringkasan hanya menyebut QRIS.
- **Harapan:** `docs/design-v1.1.md:40` — copy tidak boleh menyebut QRIS sebagai satu-satunya metode;
  desain trust note: “Pembayaran aman lewat Midtrans.” (`design-v1.1.md:369`).
- **Dampak:** pembeli mengira hanya bisa bayar QRIS; AC D1 #4 secara harfiah berlaku untuk
  halaman checkout/bayar (yang sudah bersih), tetapi copy ini melanggar aturan desain.
- **Frekuensi:** selalu. **Status:** terbuka — kartu perbaikan dibuat untuk `frontenddeveloper`.

### QA-V11-02 — Teks CTA landing di DB belum memuat “reguler”

- **Severity/Prioritas:** Low / P2 (konten rilis). **Komponen:** Environment/data (bukan kode).
- **Bukti:** live `/` menampilkan “Tinggalkan email Anda untuk kabar koleksi baru.”;
  `docs/bukti-qa-v1.1-browser.txt`.
- **Harapan:** PRD §6 AC3 — CTA memuat “Rp300.000” dan “reguler”;
  `database/seeders/SettingSeeder.php:223` sudah berisi kalimat yang benar.
- **Penyebab:** `settings.landing_sections` di DB pemilik masih versi sebelum addendum;
  seeder tidak dijalankan ulang.
- **Tindakan pemilik:** simpan ulang tab **Landing** di `/admin/pengaturan` dengan kalimat
  “Gratis ongkir untuk belanja min. Rp300.000 — khusus pengiriman reguler.” atau jalankan seeder.
- **Status:** terbuka (menunggu tindakan pemilik).

### Catatan known issue (bukan defect baru)

- Trust strip landing masih memakai copy “Bayar QRIS — Semua e-wallet dan m-banking”
  (`SettingSeeder.php:197`); `design-v1.1.md:1023` sudah menandainya sebagai copy menyesatkan
  tetapi bukan pelanggaran AC. Diserahkan ke pemilik konten.
- Konflik desain §8.6 vs `ShippingController::update` (menolak simpan tanpa kurir aktif)
  sudah dicatat pada kartu frontend `t_011cc18e`; backend menang, frontend menampilkan peringatan.

## 7. Risiko & batasan

1. **Snap sandbox belum diuji** — hanya mode fake dan fake `MidtransApi`. Perlu uji manual dengan
   key sandbox sebelum rilis; pesan galat “kanal belum aktif” (PRD §2) belum bisa diverifikasi.
2. **Biteship API asli belum diuji** — tanpa `BITESHIP_API_KEY`. Jalur fake, validasi server,
   penolakan tarif berubah, dan fallback galat sudah hijau.
3. **UI admin** (tab Landing, halaman Ekspedisi) belum diuji di browser karena kredensial admin
   tidak tersedia; perilaku server sudah diuji.
4. Pengujian visual mendalam (kontras, zoom 200%, Safari/iOS, keyboard penuh) di luar cakupan kartu.
5. Data landing di DB pemilik tertinggal dari seeder (QA-V11-02).

## 8. Rekomendasi

**GO BERSYARAT.** Semua acceptance yang dapat diuji otomatis lulus (290 test, build hijau,
landing 360/768/1280 bersih). Dua syarat sebelum rilis:

1. Perbaiki QA-V11-01 (copy keranjang) dan verifikasi ulang.
2. Pemilik menyimpan ulang teks CTA Landing (QA-V11-02), lalu QA cek ulang teks live.
3. Uji asap manual sekali dengan Snap sandbox + `BITESHIP_API_KEY` asli (minimal satu order
   bank transfer sampai settlement dan satu cek ongkir nyata).

Tanpa salah satu poin di atas, rilis berisiko pada copy pembayaran dan teks CTA yang menjadi
acceptance PRD §6 AC3.

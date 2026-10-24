# Langkah Pemilik — Toko Kulot

Ditulis untuk pemilik proyek. Ikuti berurutan. Semua perintah dijalankan di
folder proyek `C:\Users\LENOVO\Downloads\toko-kulot`.

## 1. Prasyarat

Pastikan sudah terpasang dan berjalan:

- PHP 8.3 (terpasang: 8.3.32)
- Composer 2 (terpasang: 2.7.7)
- Node.js 20+ dan npm (terpasang: Node 26.7.0, npm 11.19.0)
- MySQL 8 (terpasang: Laragon, MySQL 8.0.30) — **MySQL harus menyala**
- Git (terpasang: 2.53.0)

## 2. Buat database

Buka Laragon → Start All (atau nyalakan MySQL), lalu buat database:

```sql
CREATE DATABASE `toko-kulot`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Nama database **wajib** `toko-kulot` (memakai tanda backtick karena ada tanda
hubung). Collation `utf8mb4_unicode_ci`.

## 3. Siapkan `.env`

File `.env` sudah ada (dibuat installer). Buka dan cocokkan baris berikut dengan
`.env.example`, lalu isi nilainya sendiri:

```
APP_NAME="Toko Kulot"
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=toko-kulot
DB_USERNAME=root
DB_PASSWORD=          <- isi kata sandi MySQL Anda

MIDTRANS_MERCHANT_ID= <- dari dashboard Midtrans
MIDTRANS_CLIENT_KEY=
MIDTRANS_SERVER_KEY=
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_FAKE=true    <- true = QRIS dummy, tidak butuh kredensial
```

Catatan:

- `.env` tidak pernah di-commit; hanya `.env.example` yang masuk repo.
- Zona waktu (`Asia/Jakarta`) dan locale (`id`) sudah diatur di `config/app.php`,
  tidak perlu di `.env`.
- Jika `APP_KEY` masih kosong, jalankan sendiri: `php artisan key:generate`.
- Untuk mencoba alur checkout tanpa akun Midtrans, biarkan `MIDTRANS_FAKE=true`.

## 4. Pasang dependensi & siapkan aplikasi

```bash
composer install
npm install
php artisan migrate --seed
npm run build
```

`php artisan storage:link` sudah dijalankan saat setup; tidak perlu diulang
kecuali folder `public/storage` hilang.

## 5. Menyalakan server pengembangan

Dua terminal, keduanya di folder proyek:

```bash
# terminal 1
php artisan serve
```

```bash
# terminal 2
npm run dev
```

Lalu buka:

- `http://localhost:8000` — halaman awal (beranda toko) harus tampil, bukan
  halaman error.
- `http://localhost:8000/admin` — panel admin, menyusul pada kartu K6 (saat ini
  belum ada rute admin, jadi wajar bila 404).

## 6. Setelah semuanya jalan

Balas **"sudah"** pada kartu kanban ini, lalu tekan **Unblock**. DevOps akan
memeriksa koneksi database (baca-saja, tanpa migrasi) dan menutup kartu.

**Status per 2026-10-20:** pemilik sudah membalas "sudah". Koneksi database
diperiksa dengan `php artisan migrate:status` — berhasil, 4 migrasi berstatus
`Ran` (batch 1 kerangka, batch 2 tabel `admins`). Kartu setup ditutup; langkah
di atas tidak perlu diulang.

## Catatan versi kerangka

Kerangka terpasang memakai **Laravel 12.70.0** dan **React 19.3.1**, sedangkan
PRD §4.1 menyebut Laravel 11 dan React 18. Keduanya dipakai karena kode yang
sudah ada berjalan di atas versi tersebut dan paket Inertia 3.9.1 mensyaratkan
React 19. Bila Anda wajib memakai versi PRD, beri tahu lewat kartu ini sebelum
pekerjaan fitur berjalan jauh.

## 7. Aktifkan ekstensi SQLite (agar `php artisan test` bisa jalan)

Test otomatis memakai SQLite di memori (`phpunit.xml`) supaya database MySQL pengembangan
tidak pernah tersentuh. Laragon di mesin ini mematikan ekstensi tersebut secara bawaan,
jadi test gagal dengan pesan `could not find driver` sampai dua baris berikut diaktifkan.

1. Buka `C:\laragon\bin\php\php-8.3.32-Win32-vs16-x64\php.ini` (sesuaikan versi PHP Anda).
2. Cari dua baris ini, hapus tanda `;` di depannya:

```
extension=pdo_sqlite
extension=sqlite3
```

3. Simpan, lalu jalankan dari folder proyek:

```bash
php artisan test
```

Hasil yang benar: `Tests: 39 passed`. Bila Anda tidak ingin mengubah `php.ini` global,
jalankan test dengan `PHPRC` yang menunjuk salinan `php.ini` yang sudah diaktifkan —
kedua cara sama sahnya.

## 8. Halaman autentikasi yang sekarang tersedia

- `http://localhost:8000/register` — daftar pembeli
- `http://localhost:8000/login` — masuk pembeli
- `http://localhost:8000/forgot-password` — minta tautan reset sandi
- `http://localhost:8000/admin/login` — masuk pengelola (guard `admin`)

Catatan:

- Tautan reset sandi dikirim lewat email. Untuk mencobanya di lokal, isi `MAIL_*` di `.env`
  (mis. Mailtrap) atau buka tabel `password_reset_tokens` untuk mengambil tokennya.
  Tanpa konfigurasi email, permintaan reset tetap dijawab netral dan token tetap dibuat.
- Akun pengelola dibuat oleh seeder (`php artisan db:seed --class=AdminSeeder`);
  daftar akun lokal ada di `docs/akun-dev.md`. Ganti sandi akun demo sebelum dipakai di server.

## 9. Pembayaran QRIS (Midtrans)

Keranjang, checkout, dan halaman pembayaran bisa dicoba **tanpa** kredensial Midtrans: set
`MIDTRANS_FAKE=true` (atau biarkan `MIDTRANS_SERVER_KEY` kosong) dan QRIS dibuat lokal dengan
format EMVCo — cocok untuk mencoba alur belanja di komputer sendiri. Bawaan `.env.example` kini
`MIDTRANS_FAKE=false`, jadi QRIS asli langsung dipakai begitu kredensial diisi.

**Status 22 Okt 2026 — pemilik memilih langsung produksi.** Verifikasi baca-saja (tanpa membuka
`.env`) menunjukkan konfigurasi produksi sudah terbaca: `MIDTRANS_IS_PRODUCTION=true`,
`MIDTRANS_FAKE=false`, mode efektif **asli**, ketiga kunci terisi dan bukan kunci sandbox
(tidak berawalan `SB-`), SDK memakai `https://api.midtrans.com`. Satu nilai masih sisa uji:
`MIDTRANS_EXPIRY_MINUTES=60` (kebijakan produksi P1 = **5 menit**) — kembalikan ke 5 sebelum
go-live. Checklist lengkap, temuan, dan rollback: **`docs/midtrans-produksi.md`**.

Contoh isi `.env` untuk sandbox (produksi: `MIDTRANS_IS_PRODUCTION=true` + kunci produksi):

```
MIDTRANS_MERCHANT_ID=...
MIDTRANS_CLIENT_KEY=...
MIDTRANS_SERVER_KEY=...
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_FAKE=false
MIDTRANS_NOTIFICATION_URL=https://domain-toko-anda/midtrans/notification
```

Langkah di dashboard Midtrans:

1. Daftar/masuk ke Midtrans, ambil **Merchant ID**, **Client Key**, dan **Server Key** dari
   menu Settings → Access Keys. `MIDTRANS_IS_PRODUCTION=false` memakai sandbox.
2. Aktifkan metode pembayaran **QRIS** (Settings → Payment Methods).
3. Settings → Configuration → **Payment Notification URL** diisi
   `https://domain-toko-anda/midtrans/notification` (harus HTTPS dan bisa diakses publik).
   Nilai yang sama ditulis di `MIDTRANS_NOTIFICATION_URL`.
4. Setelah uji coba di sandbox berhasil, ganti kunci ke versi produksi dan set
   `MIDTRANS_IS_PRODUCTION=true` + `MIDTRANS_FAKE=false`.
5. Jalankan `php artisan config:clear` setelah mengubah `.env`.

Catatan:

- **Jangan** set `MIDTRANS_FAKE=true` di server produksi: QRIS yang tampil tidak akan bisa dibayar.
- Bila `MIDTRANS_SERVER_KEY` kosong, aplikasi otomatis memakai mode `fake` (pengaman), jadi
  pembayaran asli tidak akan pernah dibuat sebelum kunci diisi.
- Kolom **Midtrans client key** dan **Midtrans mode produksi** di `/admin/pengaturan?tab=pembayaran`
  hanya **catatan** — nilainya tidak dibaca jalur QRIS. Sumber kebenaran selalu `.env`
  (`MIDTRANS_*`).
- Notifikasi Midtrans diverifikasi dengan `signature_key`; payload yang tidak sah ditolak
  (HTTP 403) dan dicatat di `storage/logs/laravel.log`. Bila pembayaran tidak berubah status,
  periksa dulu apakah URL notifikasi di dashboard sudah benar dan bisa diakses dari internet.
- Kedaluwarsa QRIS **5 menit** (keputusan pemilik 21 Okt 2026) — dibaca dari `MIDTRANS_EXPIRY_MINUTES`
  (`config/midtrans.php` → `expiry_minutes`; bawaan 5 bila variabel kosong/tidak sah). Bila pemilik
  ingin mengubah durasi: ubah variabel itu di `.env`, jalankan `php artisan config:clear`, lalu
  `php artisan db:seed --class=FaqSeeder` supaya teks FAQ "berlaku N menit" ikut berubah.
- PRD §8 butir 6 + A17 masih menulis 15 menit — **amendemen PEMILIK** (keputusan tercatat di
  `docs/pertanyaan-pemilik.md` §5 P1). Dokumen PRD sengaja belum diubah karena milik pemilik.
- **Kanal QRIS harus aktif** di dashboard (Settings → Payment Methods → QRIS). Bila Midtrans menjawab
  **402 `Payment channel is not activated`**, checkout berhenti dengan pesan
  `Pembayaran QRIS belum bisa dibuat karena kanal QRIS belum aktif di akun Midtrans penjual. Hubungi
  penjual.` — langkah perbaikannya ada di bagian **"QRIS 402 Payment channel is not activated"** di
  bawah.

---

## Menjalankan test (PHPUnit) — perlu `pdo_sqlite`

`phpunit.xml` memakai SQLite `:memory:`, sedangkan PHP CLI di mesin ini (Laragon 8.3.32) belum
memuat ekstensi `pdo_sqlite`. Tanpa ekstensi itu seluruh test gagal dengan
`could not find driver`. Dua pilihan:

1. **Cara tetap (disarankan).** Buka `php.ini` milik PHP CLI (cek lokasinya dengan `php --ini`),
   lalu hapus tanda `;` di depan baris berikut, simpan, dan tutup terminal lalu buka lagi:

   ```
   extension=pdo_sqlite
   extension=sqlite3
   ```

   Setelah itu `php artisan test` dan `php vendor/bin/phpunit` berjalan tanpa flag tambahan.

2. **Cara sekali pakai (tanpa mengubah konfigurasi).** Tambahkan flag ekstensi di depan perintah.
   Pakai `vendor/bin/phpunit` langsung, bukan `php artisan test`, karena flag `-d` tidak ikut
   terbawa ke proses PHPUnit anak:

   ```
   php -d extension=pdo_sqlite vendor/bin/phpunit tests/Feature/Catalog
   ```

   Bila ingin tetap memakai `php artisan test` tanpa mengubah `php.ini`: buat folder sementara
   berisi `pdo_sqlite.ini` (`extension=pdo_sqlite`), lalu jalankan dengan
   `PHP_INI_SCAN_DIR="C:/path/ke/folder" php artisan test ...`. Proses PHPUnit anak ikut
   mewarisi env ini. Contoh yang dipakai kartu `t_5b803c80` (folder dihapus setelah verifikasi):

   ```
   mkdir -p storage/framework/testing/php-ini
   echo "extension=pdo_sqlite" > storage/framework/testing/php-ini/pdo_sqlite.ini
   PHP_INI_SCAN_DIR="C:/Users/LENOVO/Downloads/toko-kulot/storage/framework/testing/php-ini" php artisan test --filter=History
   ```

Catatan: test memakai database sementara di memori, jadi **tidak** menyentuh database MySQL
pengembangan. Tidak ada nilai `.env` yang perlu diubah untuk menjalankan test.

## Migrasi & seeder K11 (harga coret)

Kartu katalog K11 menambah migrasi `2026_10_20_000018_add_compare_price_to_products_table`
(kolom `products.compare_price`). Jalankan setelah database MySQL siap:

```
php artisan migrate
php artisan db:seed --class=ProductSeeder
```

`ProductSeeder` tetap idempoten (`updateOrCreate`), jadi aman dijalankan berulang. Seeder mengisi
harga coret `[CONTOH]` untuk 4 produk: `DSR-BTK-PKL`, `DSR-SNT-JMB`, `KLT-PLS-PRM`, `STL-PLS-ATS`.
Harga coret hanya tampil bila nilainya lebih besar dari harga jual.

## Migrasi kolom nomor resi (kartu `t_b078318d`)

Kartu ini menambah migrasi `2026_10_21_000019_add_tracking_number_to_orders_table`
(kolom `orders.tracking_number`, nullable, maksimal 60 karakter). Tidak ada nilai `.env` baru dan
tidak ada seeder yang perlu dijalankan — nomor resi diisi admin dari `/admin/pesanan/{id}`.

```
php artisan migrate
```

Perintah itu sekaligus menerapkan migrasi `2026_10_20_000018` (K11) yang masih tertunda. Selama
keduanya belum dijalankan, form nomor resi di panel admin akan gagal karena kolomnya belum ada.

## Dua verifikasi terakhir yang hanya bisa dijalankan pemilik (build beku 16:46:51)

Build rilis sudah dibekukan dan semua gerbang otomatis hijau (lihat `docs/checklist-rilis.md`, putusan
GO BERSYARAT). Dua hal berikut belum pernah diuji karena butuh kredensial yang hanya ada di `.env` pemilik:

1. **Pengelolaan data admin end-to-end** — masuk ke `http://127.0.0.1:8000/admin/login` dengan akun admin,
   lalu coba: tambah/ubah produk + unggah gambar, stok, pesanan, ulasan, FAQ, carousel, pengaturan situs,
   pesan kontak, kategori, dan akun. Yang sudah terbukti otomatis: form login merender, tamu selalu
   dialihkan ke `/admin/login`.
2. **QRIS Midtrans sandbox end-to-end** — isi kunci sandbox (`MIDTRANS_*`) di `.env`, sediakan URL webhook
   yang bisa diakses Midtrans (HTTPS/tunnel), lalu jalankan alur pembeli: tambah ke keranjang -> checkout ->
   QR tampil -> bayar di sandbox -> webhook masuk -> status pesanan berubah -> halaman sukses.
   Jangan memakai kunci produksi untuk pengujian.

Bila keduanya sudah dicoba, tulis hasilnya (berhasil/gagal + pesan galat apa adanya) di kartu terkait supaya
putusan rilis bisa dinaikkan dari GO BERSYARAT menjadi GO penuh. Selama belum ada bukti, jangan menyebut
rilis ini "teruji end-to-end".

## B1 — Mode uji Midtrans (kartu `t_9f4b6aee`, 21 Oktober 2026)

Penyebab QRIS "tampil tetapi tidak bisa ditransfer" ada di `.env`, bukan di UI: `config/midtrans.php`
memakai `MIDTRANS_FAKE` dan bila bendera itu aktif (atau `MIDTRANS_SERVER_KEY` kosong) kode QRIS dibuat
lokal tanpa Midtrans. Sejak kartu B1 bawaan `MIDTRANS_FAKE` berubah menjadi `false` dan halaman bayar/tab
Pembayaran menandai "MODE UJI" dengan alasannya.

1. Buka `.env` dan pastikan `MIDTRANS_FAKE=false` (isi eksplisit supaya tidak bergantung bawaan).
2. Isi `MIDTRANS_CLIENT_KEY`, `MIDTRANS_SERVER_KEY`, `MIDTRANS_MERCHANT_ID` dari dashboard Midtrans
   (sandbox saat pengujian) dan `MIDTRANS_IS_PRODUCTION=false`.
3. Bila pernah menjalankan `php artisan config:cache`, jalankan `php artisan config:clear` lalu muat ulang.
4. Buka pesanan lama di `/checkout/{order}/bayar`: tagihan QRIS mode uji dibuat ulang otomatis ke tagihan
   Midtrans nyata pada baris pembayaran yang sama (satu tagihan per pesanan). Bila gagal, panel QRIS
   menampilkan `Gagal membuat pembayaran QRIS. Coba lagi.` dan tagihan lama tidak diubah.
5. Uji transfer QRIS nyata dari HP, termasuk webhook (butir 2 di atas).

Tab **Pembayaran** di `/admin/pengaturan` hanya menampilkan catatan: kolom `midtrans_client_key` dan
`midtrans_is_production` di sana **belum dipakai** jalur pembayaran — yang berlaku selalu nilai di `.env`.

## G1 — Bukti satu pembayaran QRIS sandbox (kartu `t_fcfc3687`)

Tujuan: membuktikan satu pesanan benar-benar bisa dibayar lewat QRIS sandbox dan statusnya berubah dari
"menunggu pembayaran" **tanpa webhook** (Midtrans tidak bisa menjangkau `localhost`). Techlead sudah
memeriksa kode tombol + rute secara baca-saja (`docs/review-2.md` §6); yang tersisa hanya tindakan pemilik.
**Status 22 Okt 2026 (siap diuji ulang):** dua penghalang sudah ditutup — **B4** `t_3bfe3165` memperbaiki
galat `stdClass` (lihat catatan di langkah 2), dan **B5** `t_a90d5215` membuat `order_id` Midtrans unik per
panggilan charge (`TK-YYYYMMDD-NNNN-XXXXXX`) sehingga checkout ulang tidak lagi ditolak 406. Langkah 1-5 di
bawah **bisa dijalankan sekarang** dengan pesanan uji **baru**; di dashboard Midtrans cari *Order ID* yang
**diawali** kode pesanan (langkah 3).

**Putaran 3 (22 Okt 2026, kartu `t_fcfc3687`) — perpanjang jendela bayar DULU.** Dua percobaan pemilik
(#14 `TK-20261022-0002` 08:02, #15 `TK-20261022-0003` 08:09) gagal **hanya** karena tombol sinkron ditekan
setelah QR kedaluwarsa 5 menit, sehingga hasilnya "Kedaluwarsa", bukan "Lunas" (`docs/review-2.md` §6
"Verifikasi ulang ... 08:15"). Supaya tidak terulang, sebelum mulai: di `.env` (milik pemilik) set sementara
`MIDTRANS_EXPIRY_MINUTES=60`, jalankan `php artisan config:clear` (bila `php artisan serve` berjalan, mulai
ulang), lalu buat pesanan uji baru — QR berlaku **60 menit**. Nilai itu dipakai dua-duanya: `custom_expiry`
Midtrans (`app/Services/MidtransService.php:547-550`, unit `minute`) dan `payments.expires_at`
(`:481-483` lewat `expiryMinutes()` `:118-123`). Tanpa perubahan kode atau migrasi. **Setelah bukti didapat,
kembalikan ke 5 menit** (keputusan P1).

**Putaran 4 (22 Okt 2026, 08:36–08:37) — checkout berhenti sebelum QR muncul.** Tiga percobaan untuk
`TK-20261022-0005` gagal di pesan "Gagal membuat pembayaran QRIS. Coba lagi."; log tidak menyimpan sebabnya
(`storage/logs/laravel.log:5339-5341`, rincian `docs/review-2.md` §6 "Putaran 4"). Kartu **B6
`t_1f72a2d1`** lebih dulu menambah detail penyebab ke log — **tunggu B6 selesai** (techlead menandai di kartu
`t_fcfc3687`), lalu: (a) pastikan di `.env` hanya `MIDTRANS_EXPIRY_MINUTES` yang berubah — `MIDTRANS_SERVER_KEY`
dan `MIDTRANS_CLIENT_KEY` **tidak tersunting** (jangan tempel nilainya ke kartu, cukup "kunci tidak berubah");
(b) muat ulang halaman, ulangi **satu** checkout dengan keranjang yang sama — percobaan 08:36 di-rollback, jadi
tidak ada pesanan yang perlu dibuang; (c) bila QR muncul, lanjut langkah 3-4 di bawah; bila gagal lagi, balas
jam kejadian + teks notice apa adanya — techlead membaca penyebabnya dari log.

1. **Nyalakan mode sandbox.** Di `.env` (jangan kirim ke siapa pun): `MIDTRANS_FAKE=false`,
   `MIDTRANS_IS_PRODUCTION=false`, isi `MIDTRANS_MERCHANT_ID`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_SERVER_KEY`
   dari dashboard Midtrans sandbox. Jalankan `php artisan config:clear`, lalu mulai ulang `php artisan serve`
   dan `npm run dev` bila sedang berjalan.
   **Catatan 22 Okt 07:46:** pemilik **sudah** mengisi kredensial sandbox (`MIDTRANS_FAKE=false`,
   `MIDTRANS_IS_PRODUCTION=false`) — langkah ini **tidak perlu diulang** dan kredensial jangan diubah lagi.
   `bootstrap/cache/` tidak memuat `config.php`, jadi `config:clear` opsional; cukup muat ulang halaman.
2. **Buat pesanan uji BARU.** Dari `http://localhost:8000`: login pembeli → keranjang → checkout. Di
   `/checkout/{order}/bayar` QR harus berasal dari Midtrans (gambar `qris_url` atau QR dari `qr_string`) dan
   penanda "MODE UJI" tidak muncul lagi. Pesanan lama yang tagihannya murni mode uji dibuat ulang otomatis.
   **Pesanan yang sudah terlanjur membuat transaksi Midtrans tidak bisa dipakai ulang** (Midtrans menolak
   `order_id` ganda) — termasuk pesanan yang dipakai saat galat 22 Okt; buat pesanan baru dari langkah 2.
   **Catatan 22 Okt:** galat `Cannot use object of type stdClass as array`
   (`app/Services/MidtransService.php:540`) **sudah diperbaiki** kartu B4 `t_3bfe3165` — adapter
   `app/Services/Midtrans/SdkMidtransApi.php:83-115` menormalkan respons SDK rekursif, dan
   `tests/Feature/Checkout/MidtransSdkShapeTest.php` lulus **OK (4 tests, 49 assertions)** (dijalankan ulang
   techlead). Jangan mengubah kredensial lagi; bila galat yang sama masih muncul, kirim teks galat + jam
   kejadian ke kartu G1.
3. **Bayar lewat Simulator** (jangan menunggu transfer nyata; batas bayar **5 menit** — P1, atau **60 menit**
   bila Anda memasang `MIDTRANS_EXPIRY_MINUTES=60` seperti di blok "Putaran 3" atas). Dashboard
   Midtrans sandbox → **Transactions** → pilih transaksi dengan *Order ID* yang **diawali** kode pesanan
   (`TK-YYYYMMDD-NNNN-XXXXXX`; sufiks 6 hex berasal dari B5) → tombol **Simulator** → pilih status
   **settlement**. Bila 5 menit sudah lewat, buat pesanan uji baru; jangan memakai yang kedaluwarsa.
4. **Tarik status dari admin.** Masuk `/admin/pesanan/{id}` pesanan itu → kartu **Bukti pembayaran** →
   tekan **Sinkronkan status pembayaran**. Harapan: notice sukses "Status pembayaran diperbarui dari
   Menunggu pembayaran ke Lunas." dan label status ikut berubah. Catat: kode pesanan, status sebelum →
   sesudah, dan teks notice apa adanya.
5. **P3 sudah diputuskan** (22 Okt 2026, kartu `t_abb37557`): kolom `midtrans_client_key` dan
   `midtrans_is_production` di tab Pembayaran **dipertahankan sebagai catatan** (label + notice `.env`) —
   tidak ada yang perlu pemilik pilih lagi. Rincian: `docs/pertanyaan-pemilik.md` §6 P10.

Balas hasilnya di kartu `t_fcfc3687` (berhasil/gagal + pesan galat apa adanya), lalu tekan
**Unblock**. Techlead mencatat bukti di `docs/review-2.md` §6 dan
`docs/pertanyaan-pemilik.md` §6, lalu menutup gerbang ini. Jangan menyebut rilis "teruji end-to-end"
sebelum langkah ini punya bukti.

---

## QRIS gagal saat checkout — 402 `Payment channel is not activated` (kartu `t_7471aa7e`, 22 Oktober 2026)

**Kabar penting: ini bukan bug tampilan.** Dua lapisan terbukti di log:

- 22 Okt 10:37:51 — kanal **GoPay QRIS** dijawab Midtrans **402 `Payment channel is not activated`**
  (`storage/logs/laravel.log:6262`). Artinya kanal QRIS **belum aktif di akun Midtrans produksi**.
- 22 Okt 10:37:52 — percobaan cadangan otomatis dengan acquirer `other_qris` dijawab **413 `Payload
  format is not supported`** (`storage/logs/laravel.log:6263`). Galat 413 itu menutupi pesan 402,
  karena itu Anda kembali melihat `Gagal membuat pembayaran QRIS. Coba lagi.` Kartu backend
  `t_56062a5c` **sudah selesai** (22 Okt): cadangan kini hanya memakai acquirer yang sah dan
  pesan 402 tetap tampil, jadi percobaan berikutnya memberi petunjuk yang bisa ditindaklanjuti.

**Yang perlu Anda lakukan — berurutan:**

1. **Aktifkan QRIS di dashboard Midtrans produksi** (`https://dashboard.midtrans.com` → Settings →
   Payment Methods/Channels → QRIS). Untuk akun produksi, aktivasi QRIS biasanya perlu persetujuan
   Midtrans; bila tombol aktivasi tidak muncul, hubungi Activation Team/CS Midtrans dengan menyebut
   Merchant ID Anda — **jangan** kirim server key.
2. **Jangan menyetel `MIDTRANS_QRIS_ACQUIRER=other_qris`.** Instruksi lama itu keliru: Core API QRIS
   hanya menerima acquirer `gopay` atau `airpay shopee` (docs.midtrans.com/reference/qris).
   `other_qris` adalah metode Snap, bukan acquirer Core API. Biarkan variabel itu kosong atau `gopay`;
   bila yang aktif di akun Anda QRIS ShopeePay, isi `MIDTRANS_QRIS_ACQUIRER="airpay shopee"`
   — kartu backend `t_56062a5c` sudah selesai, jadi isian itu boleh dipakai sekarang.
3. `php artisan config:clear` **tidak wajib** sekarang — `bootstrap/cache/` tidak memuat `config.php`,
   jadi konfigurasi selalu dibaca ulang. Cukup muat ulang halaman setelah kode terbaru terpasang.
4. Kartu perbaikan backend `t_56062a5c` **sudah selesai** (22 Okt). Buat **satu pesanan baru** —
   pesanan yang tagihannya sudah pernah dibuat tidak bisa dipakai ulang — lalu checkout.
5. Bila QR muncul: lanjut ke bagian **G1** untuk membuktikan pembayaran.
   Bila masih gagal: balas di kartu gerbang `t_c9385bf0` dengan (a) jam kejadian, (b) kode pesanan, (c) 3 baris
   `Midtrans charge gagal` terakhir dari `storage/logs/laravel.log` — **jangan** kirim server key.

**Sementara menunggu aktivasi produksi**, alur aplikasi tetap bisa dibuktikan di sandbox: set
`MIDTRANS_IS_PRODUCTION=false` + kunci sandbox di `.env` (milik Anda), `php artisan config:clear`, lalu
ikuti bagian **G1**. Ini hanya isian `.env`, bukan perubahan kode.

## Favicon, copyright footer, dan aset seed (kartu `t_101b9145`, 23 Okt 2026)

Tidak ada isian `.env` baru. Setelah kode terbaru terpasang, jalankan sekali (aman diulang —
`firstOrCreate`, nilai yang sudah Anda ubah tidak ditimpa):

```
php artisan db:seed --class=SettingSeeder
```

Perintah itu membuat `public/favicon.ico` (hanya bila belum ada/0 byte), `public/images/seed/favicon.png`,
`logo.png`, `landing/hero.png`, dan `landing/promo-grosir.png` yang hilang, serta 21 baris `settings`
(termasuk `store_favicon` dan `footer_copyright`). Favicon bisa diganti dari
`/admin/pengaturan` tab **Umum**; teks copyright diisi di tab **Footer** setelah field frontend tersedia
(kartu `t_c915c033`). Kosongkan `footer_copyright` agar footer memakai `© {tahun} {nama toko}`.

**Alat pengembangan (bukan produksi):** `pdo_sqlite` dan `sqlite3` belum aktif di `php.ini` mesin ini,
sehingga `php artisan test` gagal `could not find driver`. Aktifkan kedua ekstensi itu di `php.ini`
milik Anda (baris `extension=pdo_sqlite` dan `extension=sqlite3`, lalu restart terminal). Sementara itu
test bisa dijalankan tanpa mengubah `php.ini`:

```
php -d extension=pdo_sqlite -d extension=sqlite3 vendor/bin/phpunit
```


## Galeri landing + copy CTA akhir (kartu `t_71f1e7a9`, 24 Okt 2026)

Tidak ada isian `.env` baru. Setelah kode terbaru terpasang, jalankan sekali (aman diulang,
`firstOrCreate` — galeri yang sudah Anda ubah tidak ditimpa):

```
php artisan db:seed --class=SettingSeeder
```

Perintah itu menambah baris `settings` `landing_gallery` (4 gambar contoh `[CONTOH]` di
`public/images/seed/landing/galeri-1..4.png`) dan mengisi CTA akhir
`landing_sections.newsletter.subtitle` dengan kalimat gratis ongkir. Total baris `settings`
menjadi 24. Gambar galeri bisa diganti/diurutkan/dihapus dari `/admin/pengaturan` tab
**Landing** (maks 8 gambar, JPG/PNG/WEBP ≤ 2 MB); berkas lama otomatis dihapus dari
`storage/app/public/landing` saat item dihapus atau gambarnya diganti.

Gambar unggahan tampil lewat `/storage/...`, jadi symlink `public/storage` harus ada
(sudah ada di mesin ini). Bila belum: `php artisan storage:link`.

## Kolom Snap pada `payments` (kartu `t_04da18e0`, 24 Okt 2026)

Jalankan sekali di folder proyek setelah menarik perubahan:

```bash
php artisan migrate
```

Migrasi `2026_10_24_000001_add_snap_columns_to_payments_table` hanya menambah tiga kolom null
(`snap_token`, `snap_redirect_url`, `payment_type`) — tidak mengubah/menghapus data. Setelah itu
`MIDTRANS_FAKE=false` + `MIDTRANS_CLIENT_KEY`/`MIDTRANS_SERVER_KEY` terisi agar pembayaran memakai
Snap asli. URL webhook Midtrans tetap `https://<domain>/midtrans/notification`.

## Ongkir Biteship + halaman Ekspedisi (kartu `t_f22c8d46`, 24 Okt 2026)

1. Migrasi kolom pengiriman pada `orders` (tambah 5 kolom, tidak menghapus data):

```bash
php artisan migrate
php artisan db:seed --class=SettingSeeder
```

`SettingSeeder` sekarang menulis 31 key (7 key grup `shipping` baru). Nilai yang sudah ada
tidak ditimpa, jadi baris `shipping_cost_default` yang lama tetap dipakai sebagai tarif uji.

2. Isi pengaturan di `/admin/ekspedisi`: nama/telepon/alamat/kode pos asal, tarif uji
   (dipakai saat mode `fake`), minimal belanja gratis ongkir, dan centang layanan kurir aktif.

3. Mode Biteship:
   - Tanpa `BITESHIP_API_KEY` di `.env` → mode `fake`: ongkir datar = tarif uji, checkout tetap jalan.
   - Isi `BITESHIP_API_KEY` di `.env` → mode `api`: tarif asli dari Biteship. Kode pos asal wajib
     5 angka; gagal API menampilkan pesan galat, bukan tarif tebakan.

4. Test fitur memakai SQLite in-memory (`phpunit.xml`), tetapi PHP CLI di mesin ini belum punya
   `pdo_sqlite` (`php -m` tidak memuatnya). Aktifkan ekstensi `pdo_sqlite` di `php.ini` lalu
   jalankan `php artisan test` agar `tests/Feature/Checkout/CheckoutShippingTest.php` bisa dieksekusi.
   Database pengembangan tidak tersentuh.

## Verifikasi ongkir setelah peta galat Biteship (kartu `t_1b711d26`, 24 Okt 2026)

1. Pastikan alamat asal + kode pos toko terisi di `/admin/ekspedisi` dan `BITESHIP_API_KEY` ada di
   `.env` (jangan tempel kunci di kartu/chat).
2. Login sebagai pembeli, isi keranjang, buka checkout dengan kode pos tujuan yang biasa dipakai
   pelanggan, lalu tekan **Cek Ongkir**.
3. Buka `storage/logs/laravel.log`, cari baris terbaru `Biteship rates menjawab tidak sukses`.
   Sekarang baris itu memuat `status`, `success`, `error`, `code`, `origin_postal_code`,
   `destination_postal_code` (tanpa header/kunci). Tempel **satu baris** itu sebagai komentar di
   kartu `t_1b711d26`.
4. Arti `code`: `40001001` kode pos asal/tujuan tidak dikenal (cek pengaturan Ekspedisi vs kode pos
   uji), `40001002` parameter/akun Biteship (kunci/akun `biteship_test`), `40001010` tidak ada kurir
   untuk lokasi itu. Kode lain → pesan umum `GALAT_API`.

## Saldo akun Biteship (temuan nyata 24 Okt 2026, kartu `t_1b711d26`)

Baris log asli dari percobaan pemilik (60184 → 50148):

```
Biteship rates menjawab tidak sukses {"origin_postal_code":50148,"destination_postal_code":60184,"status":400,...,"error":"No sufficient balance to call rates API. Please top up your balance","code":null}
```

Kegagalan ongkir **bukan** kode pos/parameter: saldo akun Biteship habis. Yang harus dilakukan pemilik:

1. Masuk ke dashboard Biteship → isi saldo (top up) pada akun pemilik kunci `BITESHIP_API_KEY`,
   atau ganti `BITESHIP_API_KEY` di `.env` dengan kunci akun yang ber-saldo (jangan tempel kunci di
   kartu/chat).
2. Ulangi **Cek Ongkir** di checkout dengan kode pos tujuan pelanggan.
3. Bila masih gagal, tempel baris `Biteship rates menjawab tidak sukses` terbaru di kartu
   `t_1b711d26`; sekarang `error`/`code` menentukan penyebabnya (`code` `40001001` = kode pos,
   `40001002` = parameter/akun, `40001010` = tak ada kurir).

Tanpa saldo, pembeli melihat `Ongkir tidak bisa dihitung karena saldo Biteship penjual habis.
Hubungi penjual.` — bukan lagi pesan umum, jadi penyebabnya terlihat dari UI.

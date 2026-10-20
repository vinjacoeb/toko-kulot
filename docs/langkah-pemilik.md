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

Keranjang, checkout, dan halaman pembayaran sudah jalan **tanpa** kredensial Midtrans karena
mode `fake` aktif secara bawaan (`MIDTRANS_FAKE=true`): QRIS dibuat lokal, cocok untuk mencoba
alur belanja di komputer sendiri.

Untuk memakai Midtrans sungguhan, tambahkan sendiri di `.env` (jangan dikirim ke siapa pun):

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
- Notifikasi Midtrans diverifikasi dengan `signature_key`; payload yang tidak sah ditolak
  (HTTP 403) dan dicatat di `storage/logs/laravel.log`. Bila pembayaran tidak berubah status,
  periksa dulu apakah URL notifikasi di dashboard sudah benar dan bisa diakses dari internet.
- Kedaluwarsa QRIS 15 menit (`config/midtrans.php`, `expiry_minutes`).

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

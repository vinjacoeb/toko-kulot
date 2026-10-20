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

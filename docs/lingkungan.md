# Lingkungan & Versi — Toko Kulot

Diperbarui: 2026-10-20 (kartu K2, peran DevOps)

## Mesin

| Item | Nilai |
|---|---|
| OS | Windows 11 |
| Shell | bash (Git Bash / MSYS) |
| Proyek | `C:\Users\LENOVO\Downloads\toko-kulot` |
| Server lokal | Laragon (MySQL 8.0.30) |

## Versi alat (terpasang, terverifikasi)

| Alat | Versi | Cara cek |
|---|---|---|
| PHP | 8.3.32 (cli, ZTS, x64) | `php -v` |
| Composer | 2.7.7 (2024-06-10) | `composer --version` |
| Node.js | v26.7.0 | `node -v` |
| npm | 11.19.0 | `npm -v` |
| Git | 2.53.0.windows.3 | `git --version` |
| MySQL | 8.0.30 (Laragon, `C:\laragon\bin\mysql\mysql-8.0.30-winx64`) | `mysql --version` |

## Versi kerangka & paket (benar-benar terpasang)

| Paket | Versi | Catatan |
|---|---|---|
| laravel/framework | 12.70.0 | PRD §4.1 menyebut Laravel 11 — lihat `docs/asumsi.md` A-01 |
| inertiajs/inertia-laravel | 3.5.1 | |
| midtrans/midtrans-php | 2.6.2 | |
| laravel/tinker | 2.11.1 | |
| phpunit/phpunit | 11.5.57 | |
| laravel/pint | 1.32.1 | |
| react / react-dom | 19.3.1 | PRD §4.1 menyebut React 18 — lihat `docs/asumsi.md` A-02 |
| @inertiajs/react | 3.9.1 | peer butuh React ^19 |
| vite | 6.4.4 | |
| @vitejs/plugin-react | 4.7.0 | |
| tailwindcss | 3.4.19 | |

## Perintah verifikasi & hasil aktual

Semua dijalankan dari root proyek, tanpa menyalakan server dan tanpa menyentuh database.

### 1. Cek sintaks PHP

```
$ php -l bootstrap/app.php
No syntax errors detected in bootstrap/app.php
$ php -l routes/admin.php
No syntax errors detected in routes/admin.php
$ php -l routes/web.php
No syntax errors detected in routes/web.php
$ php -l config/app.php
No syntax errors detected in config/app.php
$ php -l app/Http/Middleware/EnsureAdmin.php
No syntax errors detected in app/Http/Middleware/EnsureAdmin.php
$ php -l app/Http/Middleware/HandleInertiaRequests.php
No syntax errors detected in app/Http/Middleware/HandleInertiaRequests.php
```

### 2. Daftar rute

```
$ php artisan route:list
GET|HEAD  / ............................................................ home › routes/web.php:6
GET|HEAD  _inertia/devtools/entries .......... Inertia\DevTools › EntriesController@index
GET|HEAD  _inertia/devtools/entries/{id} ...... Inertia\DevTools › EntriesController@show
GET|HEAD  storage/{path} ...................... FilesystemServiceProvider
PUT       storage/{path} ...................... FilesystemServiceProvider
GET|HEAD  up .................................. ApplicationBuilder.php:219

Showing [6] routes
```

Rute `/` terdaftar dan merender Inertia. `routes/admin.php` sudah terdaftar
(prefix `/admin`, name prefix `admin.`) tetapi masih kosong — diisi kartu K6.

### 3. Build frontend

```
$ npm run build
vite v6.4.4 building for production...
✓ 636 modules transformed.
public/build/manifest.json              0.59 kB
public/build/assets/app-CLiUVjLv.css   15.23 kB │ gzip:   3.48 kB
public/build/assets/Home-DRc_Ex9_.js    1.29 kB │ gzip:   0.66 kB
public/build/assets/app-Ca5xWqBc.js   357.61 kB │ gzip: 111.97 kB
✓ built in 2.90s
```

### 4. Tautan penyimpanan (PRD A7)

```
$ php artisan storage:link
INFO  The [public\storage] link has been connected to [storage\app/public].
```

Berhasil, jadi tidak ada langkah manual untuk pemilik di bagian ini.

## Yang belum diuji (dan alasannya)

| Hal | Alasan |
|---|---|
| Koneksi database | Menunggu pemilik membuat database `toko-kulot` dan mengisi `.env` (titik berhenti kartu ini) |
| `php artisan migrate` | Migrasi dijalankan setelah database siap; tugas backend/owner, bukan setup |
| `php artisan test` | Belum ada test fungsional; suite default butuh database |
| `php artisan serve` / `npm run dev` | Dilarang dijalankan oleh DevOps; pemilik yang menyalakan |
| Midtrans QRIS sungguhan | Butuh kredensial Midtrans di `.env` (milik pemilik) |

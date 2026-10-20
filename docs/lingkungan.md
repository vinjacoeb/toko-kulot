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

### 5. Koneksi database (setelah pemilik mengisi `.env`)

Dijalankan setelah kartu di-Unblock oleh pemilik. Baca-saja: tidak ada migrasi,
seed, atau reset yang dijalankan DevOps.

```
$ php artisan migrate:status
Migration name .................................................... Batch / Status
  0001_01_01_000000_create_users_table ................................... [1] Ran
  0001_01_01_000001_create_cache_table ................................... [1] Ran
  0001_01_01_000002_create_jobs_table .................................... [1] Ran
  2026_10_20_000001_create_admins_table .................................. [2] Ran
```

Kesimpulan: koneksi MySQL 8 ke database `toko-kulot` berhasil; keempat migrasi
sudah dijalankan pemilik/backend (batch 1 kerangka, batch 2 tabel `admins`).

### 6. Pemeriksaan ulang setelah database aktif

```
$ php artisan route:list   -> Showing [6] routes (sama seperti bagian 2)
$ npm run build            -> ✓ 636 modules transformed, built in 2.80s
$ git ls-files | grep -E '(^|/)\.env($|\.)'
.env.example               -> hanya contoh; .env tidak ter-commit
```

## Yang belum diuji (dan alasannya)

| Hal | Alasan |
|---|---|
| `php artisan migrate` / `db:seed` | Dilarang untuk DevOps (aturan kartu); sudah dijalankan pemilik (batch 1-2 di `migrate:status`) |
| `php artisan test` | LULUS dijalankan lewat `PHP_INI_SCAN_DIR=<scratch>/phpsqlite` (sqlite `:memory:`) — RUN 3 kartu t_5a330224: 190 passed, 1111 assertions, exit 0; lihat bagian "Verifikasi penutup" di bawah |
| `php artisan serve` / `npm run dev` | Dilarang dijalankan oleh DevOps; pemilik yang menyalakan |
| Midtrans QRIS sungguhan | Butuh kredensial Midtrans di `.env` (milik pemilik) |
| Login admin & kelola data E2E | Butuh kredensial admin; devops tidak membuka `.env` |
| Alur pembeli E2E (keranjang -> checkout -> QRIS) | Butuh sesi pembeli + kredensial sandbox; hanya halaman-halamannya yang di-smoke |
| Pembekuan build rilis | SELESAI pada kartu t_5f75f779 (build beku 16:46:51, chunk `app-C4HDW06B.js`) — lihat bagian "Verifikasi build beku" di bawah dan `docs/checklist-rilis.md` (putusan GO BERSYARAT) |

## Verifikasi penutup (kartu t_5a330224, 20 Okt 2026)

Versi alat yang benar-benar muncul saat verifikasi (`php -v`, `node -v`, `npm -v`, `composer -V`, `git --version`):
`PHP 8.3.32 (cli) (ZTS Visual C++ 2019 x64)`, `Composer 2.7.7 (PHP 8.3.32)`, `node v26.7.0`, `npm 11.19.0`,
`git 2.53.0.windows.3`. Ekstensi `pdo_sqlite` + `sqlite3` hanya tersedia lewat
`PHP_INI_SCAN_DIR=C:/Users/LENOVO/AppData/Local/hermes/profiles/devops/cache/scratch/phpsqlite` (php.ini global tidak diubah).

```
$ npm run build                                     -> exit 0; manifest 15:21:50; 50 berkas di public/build/assets; chunk app-D-79Kh7D.js
$ node check-jsx-imports.mjs resources/js           -> 0 temuan
$ python tmp/cek-komponen-tanpa-import.py .         -> 1 temuan (positif palsu: `App` di app.jsx)
$ python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build -> 0 temuan
$ find resources/js app routes config database tests -newer public/build/manifest.json -> kosong (tidak ada sumber lebih baru)
$ php artisan route:list --except-vendor            -> 66 rute
$ curl (12 rute publik + admin)                     -> 200/302 sesuai harapan; rincian di docs/bukti-rute-admin-tamu-*.txt
$ PHP_INI_SCAN_DIR=.../phpsqlite php artisan test    -> 190 passed (1111 assertions), Duration 31,69 s, exit 0
$ smoke browser (CDP) 9 rute x 3 viewport            -> 27 pengukuran: 0 halaman kosong, 0 geser horizontal, 0 galat konsol
```

Hasil lengkap per perintah ada di `docs/bukti-build-penutup-t_5a330224.txt`, `docs/bukti-smoke-penutup-t_5a330224.txt`,
`docs/bukti-phpunit-t_5a330224.txt`, `docs/bukti-rute-admin-tamu-t_5a330224.txt`,
`docs/bukti-rute-admin-tamu-id-ada-t_5a330224.txt`, `docs/bukti-put-akun-tamu-t_5a330224.txt`.
Putusan rilis dan daftar penghalang: `docs/checklist-rilis.md`.

## Verifikasi build beku (kartu t_5f75f779, 20 Okt 2026 16:46–16:52)

Prasyarat terpenuhi: papan kanban 16:46:10 hanya memuat kartu ini (tidak ada kartu penulis berjalan);
berkas sumber terakhir berubah 16:36:04 (13 berkas `resources/js` dari t_954abfe8). Server 127.0.0.1:8000
milik pemilik (devops tidak menyalakan server, tidak migrasi/seed, `.env` tidak dibuka).

```
$ npm run build                                     -> exit 0, "✓ built in 2.61s"
$ stat -c '%y %s' public/build/manifest.json        -> 2026-10-20 16:46:51.954 +0700, 18817 B
$ sha256sum public/build/manifest.json              -> 83cd3362d607bf9041932920842f0968a5b96d91fb8a938e027d739f421dade8
$ find public/build -type f | wc -l                 -> 51 (50 aset di public/build/assets + manifest.json)
$ ls public/build/assets/app-*.js                   -> app-C4HDW06B.js (361.816 B); css app-C4SfSLQH.css (57.446 B)
$ find resources app routes config database tests tailwind.config.js vite.config.js package.json composer.json \
    -newermt '2026-10-20 16:46:52' -type f          -> kosong (0 sumber lebih baru dari manifest)
$ node <scratch>/check-jsx-imports.mjs resources/js -> 81 berkas, 711 tag JSX, 0 temuan (exit 0)
$ python tmp/cek-komponen-tanpa-import.py .         -> 81 berkas, hanya positif palsu `App` (app.jsx) (exit 0)
$ python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build -> 49 chunk, 0 temuan (exit 0)
$ smoke browser (CDP) 9 rute x 3 viewport           -> 27 pengukuran: 0 halaman kosong, 0 geser horizontal,
                                                       27/27 konsol bersih; bundel terukur app-C4HDW06B.js
$ PHP_INI_SCAN_DIR=<scratch>/phpsqlite php artisan test -> 190 passed (1111 assertions), Duration 41,26 s, exit 0
$ stat/sha256 manifest diulang 16:52                -> mtime + sha256 TIDAK berubah (build benar-benar berhenti)
```

Bukti mentah: `docs/bukti-build-beku-t_5f75f779.txt` (build + 3 penyapu + suite + keadaan `public/build`),
`docs/bukti-smoke-beku-t_5f75f779.txt` (27 pengukuran + pratinjau teks).
Putusan rilis: `docs/checklist-rilis.md` — GO BERSYARAT untuk lapisan kode+build; QRIS sandbox dan
pengelolaan admin end-to-end masih menunggu pemilik (tanpa kredensial).

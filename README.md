# Toko Kulot

Toko online daster & kulot: katalog produk, keranjang, checkout **QRIS via Midtrans**,
ulasan bintang, dan panel admin untuk mengelola katalog, stok, pesanan, pesan, penilaian,
serta seluruh konten website.

- Dokumen fungsi: `docs/PRD.md` (sumber kebenaran fungsi)
- Dokumen tampilan: `docs/design.md` (sumber kebenaran tampilan)
- Pembagian kerja & brief per peran: `docs/ringkasan-tim.md`, `docs/brief-*.md`

## Stack

| Lapisan | Teknologi |
|---|---|
| Backend | Laravel 11 (PHP 8.3) |
| Frontend | React + Inertia.js + Vite (bukan SPA terpisah) |
| Styling | Tailwind CSS, token di `tailwind.config.js` |
| Database | MySQL 8, nama database `toko-kulot` |
| Auth | Session guard ganda: `web` (pembeli) dan `admin` (pengelola) |
| Pembayaran | Midtrans QRIS (`enabled_payments: ["other_qris"]`) |
| Test | PHPUnit |

## Prasyarat

- PHP 8.3 + ekstensi `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`
- Composer 2
- Node.js 20+ dan npm
- MySQL 8 (mis. Laragon/XAMPP) yang sedang berjalan
- Git

## Cara pasang (untuk developer)

```bash
composer install
npm install
```

Lalu siapkan `.env` (lihat bagian berikut), buat database, dan:

```bash
php artisan key:generate       # hanya sekali, oleh pemilik
php artisan migrate --seed
npm run build
```

Menjalankan server pengembangan (hanya atas instruksi pemilik):

```bash
php artisan serve            # http://localhost:8000
npm run dev                  # Vite dev server (paralel di terminal lain)
```

## Konfigurasi `.env`

`.env` **milik pemilik** dan tidak pernah di-commit. Salin contohnya, lalu isi
nilai rahasia sendiri:

```bash
cp .env.example .env
```

| Variabel | Diisi oleh | Keterangan |
|---|---|---|
| `APP_KEY` | pemilik (`php artisan key:generate`) | kunci enkripsi aplikasi |
| `APP_URL` | pemilik bila perlu | default `http://localhost:8000` |
| `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | pemilik | MySQL 8, database `toko-kulot` |
| `MIDTRANS_MERCHANT_ID`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_SERVER_KEY` | pemilik | kredensial Midtrans |
| `MIDTRANS_IS_PRODUCTION` | pemilik | `false` saat pengembangan |
| `MIDTRANS_FAKE` | pemilik | `true` = QRIS dummy tanpa kredensial |
| `MIDTRANS_EXPIRY_MINUTES` | pemilik | masa berlaku QRIS; bawaan `5` menit (keputusan pemilik 21 Okt 2026) |

Zona waktu `Asia/Jakarta`, locale `id`, dan fallback `en` diatur di
`config/app.php` (bukan `.env`).

## Perintah yang sering dipakai

```bash
php artisan route:list        # daftar rute
php artisan migrate --seed    # migrasi + data contoh
php artisan test              # test PHPUnit
npm run build                 # build aset produksi (public/build)
php artisan storage:link      # symlink public/storage untuk unggahan
```

## Struktur direktori

```
app/Http/Controllers/Public/    controller halaman publik
app/Http/Controllers/Admin/     controller panel admin
app/Http/Middleware/            HandleInertiaRequests, EnsureAdmin
app/Http/Requests/              form request per aksi tulis
app/Models/                     model Eloquent
app/Services/                   MidtransService, OrderService, CartService, SettingService
database/migrations/            skema
database/seeders/               data contoh
resources/js/app.jsx            entri Inertia
resources/js/Pages/Public/      halaman publik
resources/js/Pages/Admin/       halaman admin
resources/js/Layouts/           PublicLayout, AdminLayout, AuthLayout
resources/js/Components/        komponen bersama
resources/views/app.blade.php   root template Inertia
routes/web.php                  rute publik + pembeli
routes/admin.php                rute /admin/* (prefix + name prefix admin.)
docs/                           PRD, design, brief, catatan lingkungan
```

## Aturan penting

- Semua respons halaman memakai `Inertia::render(...)`; Blade hanya `app.blade.php`.
- Aksi tulis wajib POST/PATCH/DELETE dengan CSRF aktif dan validasi FormRequest.
- Uang disimpan sebagai integer rupiah, tampil `Rp1.234.567`.
- Bahasa UI Indonesia, nama variabel/route/commit bahasa Inggris.
- Jangan menaruh skill/MCP di dalam folder proyek.
- Jangan menjalankan `php artisan serve` / `npm run dev` sebagai proses permanen
  tanpa instruksi pemilik.

Panduan langkah pemilik (database, `.env`, cara menyalakan server) ada di
`docs/langkah-pemilik.md`. Catatan versi alat dan hasil verifikasi ada di
`docs/lingkungan.md`.

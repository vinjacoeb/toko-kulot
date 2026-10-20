# Deploy — Toko Kulot

Dokumen ini menyiapkan pemasangan aplikasi di server produksi. Semua perintah diambil dari
perintah resmi Laravel/Composer/npm. Langkah **belum pernah dijalankan di server nyata**
(kartu ini tidak menyediakan server target) — yang sudah diuji di mesin lokal hanya build
aset, `migrate:fresh --seed`, dan daftar rute. Status verifikasi ada di
`docs/checklist-rilis.md`.

## 1. Ringkasan arsitektur

| Bagian | Isi |
|---|---|
| Backend | Laravel 12 (`laravel/framework ^12.0`), Inertia Laravel ^3.5, `midtrans/midtrans-php ^2.6` |
| Frontend | React 19 + `@inertiajs/react ^3.9` + Vite 6 + Tailwind 3 (dibangun ke `public/build/`) |
| Database | MySQL 8, nama database `toko-kulot` (pakai backtick di query manual), `utf8mb4` / `utf8mb4_unicode_ci` |
| Session/cache/queue | driver `database` (tabel `sessions`, `cache`, `jobs`) — tidak butuh Redis/Memcached |
| Queue worker & scheduler | **tidak dibutuhkan** — tidak ada job, command terjadwal, maupun `Mail::queue` di kode |
| Web server | document root **wajib** ke folder `public/`, HTTPS (syarat webhook Midtrans) |

## 2. Kebutuhan server

Versi di bawah adalah versi yang benar-benar terpasang di mesin uji (`docs/lingkungan.md`);
angka minimum mengikuti `composer.json` / `package.json` proyek.

| Alat | Minimum | Terpasang di mesin uji |
|---|---|---|
| PHP | `^8.2` (composer.json) | 8.3.32 |
| Composer | 2.x | 2.7.7 |
| Node.js | 20+ (Vite 6) | v26.7.0 (hanya untuk build aset) |
| npm | 10+ | 11.19.0 |
| MySQL | 8.x | 8.0.30 |

Ekstensi PHP yang dipakai aplikasi (semua aktif di mesin uji): `bcmath`, `ctype`, `curl`,
`dom`, `fileinfo`, `filter`, `gd`, `hash`, `iconv`, `intl`, `json`, `libxml`, `mbstring`,
`openssl`, `pcre`, `pdo`, `pdo_mysql`, `session`, `tokenizer`, `xml`, `xmlwriter`, `zlib`.

- `gd` **wajib**: seeder gambar placeholder (`Database\Seeders\Concerns\WritesSeedImages`)
  melempar `RuntimeException` bila ekstensi ini mati.
- `pdo_mysql` wajib untuk koneksi MySQL. `pdo_sqlite` hanya dipakai `phpunit.xml` (test).
- Izin tulis untuk akun web server: `storage/` dan `bootstrap/cache/`.
- Tidak ada Redis/Memcached/Elasticsearch yang perlu dipasang.

## 3. Langkah deploy (server baru)

```bash
# 1. Ambil kode (clone/rsync) ke folder di luar document root, mis. /var/www/toko-kulot
cd /var/www/toko-kulot

# 2. Dependensi PHP (tanpa paket dev)
composer install --no-dev --optimize-autoloader

# 3. Berkas lingkungan — PEMILIK yang mengisi nilai rahasianya
cp .env.example .env
php artisan key:generate      # hanya di server baru; APP_KEY diisi pemilik

# 4. Database (lihat docs/langkah-pemilik.md untuk membuat database)
php artisan migrate --force             # naikkan skema
php artisan migrate --force --seed      # server baru saja: isi data awal

# 5. Aset frontend (butuh Node)
npm ci && npm run build                 # menghasilkan public/build/

# 6. Tautan penyimpanan unggahan (storage/app/public -> public/storage)
php artisan storage:link

# 7. Cache produksi — lakukan PALING AKHIR, setelah .env final
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Catatan:

- Alternatif tanpa Node di server: jalankan `npm ci && npm run build` di mesin build, lalu
  unggah **isi** `public/build/` (folder ini di-`.gitignore`, jadi tidak ikut clone).
- Ganti kode saat pemeliharaan: `php artisan down` sebelum, `php artisan up` sesudah.
- Setiap kali `.env` berubah di server: `php artisan config:clear` lalu `php artisan config:cache`.
- Perubahan kode tanpa perubahan `.env` cukup `php artisan route:cache && php artisan view:cache`
  (opsional) — aset Vite punya hash nama berkas, jadi aman dari cache browser.
- Permission (Linux/Nginx, contoh):

```bash
chown -R www-data:www-data storage bootstrap/cache
chmod -R ug+rwX storage bootstrap/cache
```

## 4. Variabel `.env` yang menentukan (nama saja, nilai diisi pemilik)

| Variabel | Nilai produksi |
|---|---|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` (jangan pernah `true` di produksi) |
| `APP_URL` | `https://<domain>` |
| `APP_KEY` | dihasilkan pemilik dengan `php artisan key:generate` |
| `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | kredensial MySQL produksi (`DB_DATABASE=toko-kulot`) |
| `SESSION_DRIVER`, `CACHE_STORE`, `QUEUE_CONNECTION` | `database` (jangan diubah tanpa alasan) |
| `FILESYSTEM_DISK` | `public` (unggahan disajikan via symlink `public/storage`) |
| `MIDTRANS_MERCHANT_ID`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_SERVER_KEY` | kredensial Midtrans milik pemilik |
| `MIDTRANS_IS_PRODUCTION` | `true` saat live |
| `MIDTRANS_FAKE` | **`false`** — nilai `true` = QRIS dummy tanpa kredensial, hanya untuk pengembangan |
| `MIDTRANS_NOTIFICATION_URL` | `https://<domain>/midtrans/notification` |
| `MAIL_MAILER` + `MAIL_*` | `log` = email hanya ditulis ke log (bawaan). Isi `smtp` bila balasan/detail pesanan harus benar-benar terkirim |
| `LOG_LEVEL` | `warning` atau `error` di produksi |

Zona waktu (`Asia/Jakarta`), locale (`id`), dan fallback locale sengaja **tidak** di `.env —
diatur di `config/app.php` (PRD §4.3).

## 5. Midtrans (PRD §8)

1. Di dashboard Midtrans: Settings → Configuration → **Payment Notification URL** =
   `https://<domain>/midtrans/notification` (metode POST). URL ini harus HTTPS dan dapat
   diakses publik, karena server Midtrans yang memanggilnya.
2. Pastikan `MIDTRANS_FAKE=false` dan `MIDTRANS_IS_PRODUCTION` sesuai lingkungan
   (sandbox dulu, baru produksi).
3. Uji sandbox: buat pesanan → halaman `/pesanan/{order}/bayar` → selesaikan QRIS di
   simulator sandbox Midtrans → status pesanan berpindah sendiri setelah notifikasi masuk.
4. Endpoint notifikasi memverifikasi tanda tangan (`order_id`, `status_code`, `gross_amount`
   + `MIDTRANS_SERVER_KEY`) dan menolak permintaan tanpa tanda tangan valid; ini proteksi
   utama agar status pesanan tidak bisa dipalsukan dari luar.
5. Webhook tidak bisa diuji dari server lokal tanpa tunnel publik (mis. `ngrok`) — **belum
   diuji** pada kartu ini; hanya endpoint dan penolakan tanda tangan palsu yang diperiksa.

## 6. Aset dan gambar setelah deploy

- `public/build/` di-`.gitignore` → wajib dibangun di server atau diunggah dari mesin build.
- Gambar seed (`public/images/seed/**`) dibuat oleh seeder dengan GD dan **tidak** ada di Git.
  Di server baru: jalankan `php artisan migrate --force --seed` (satu kali) — atau unggah
  folder `public/images/seed/` dari mesin dev bila seeder tidak boleh dijalankan di produksi.
- Unggahan admin disimpan di `storage/app/public/<folder>` dan disajikan melalui
  `public/storage` → jangan lupa `php artisan storage:link`, dan pastikan symlink dibuat
  oleh akun yang sama dengan pemilik folder `storage`.
- Font dimuat dari `https://fonts.bunny.net` (komentar di `resources/views/app.blade.php`
  menyediakan opsi self-host `public/fonts`) → server produksi perlu akses internet keluar,
  atau lakukan self-host sebelum rilis.

## 7. Pemeriksaan cepat setelah deploy

| Pemeriksaan | Harapan |
|---|---|
| `curl -I https://<domain>/` | `200`, HTML berisi judul toko |
| `/produk`, `/produk/{slug}`, `/kontak-kami` | `200` + konten produk tampil (bukan halaman kosong) |
| `/admin/login` | `200` + form login admin |
| `POST /midtrans/notification` tanpa badan valid | ditolak (`4xx`), bukan sukses |
| `/storage/<berkas unggahan>` | `200` (uji `storage:link` benar) |
| `/robots.txt` | `200` |
| `php artisan migrate:status` | semua migrasi `Ran`, tidak ada `Pending` |

## 8. Backup dan rollback

- Sebelum `php artisan migrate --force`, buat cadangan database:
  `mysqldump -u <user> -p toko-kulot > backup-$(date +%F).sql` (dijalankan pemilik).
- Simpan salinan rilis sebelumnya, termasuk folder `public/build` rilis tersebut, agar
  rollback tidak perlu build ulang di server.
- Rollback kode: kembalikan rilis sebelumnya, `php artisan config:clear`, `route:clear`,
  `view:clear`, lalu `config:cache`.
- Rollback skema (`php artisan migrate:rollback --step=1`) **hanya** bila migrasi terakhir
  memang penyebab masalah: perintah ini menghapus tabel/kolom beserta isinya. Restore dari
  dump lebih aman untuk kasus data rusak.
- Jangan pernah mengubah nilai `.env` produksi bersamaan dengan rollback kode — sulit
  dilacak. Satu perubahan, satu verifikasi.

## 9. Yang belum diuji (jujur, per 20 Okt 2026)

- Pemasangan di server produksi nyata: belum ada server target di kartu ini; seluruh
  perintah §3–§4 berasal dari dokumentasi resmi dan belum dieksekusi.
- Webhook Midtrans sungguhan (butuh kredensial pemilik + URL publik) — belum.
- Konfigurasi web server (Nginx/Apache) dan TLS — belum; hanya syarat document root ke
  `public/` dan HTTPS yang dicatat.
- Backup/restore otomatis, monitoring, dan CI/CD tidak diminta kartu ini — tidak dibuat.

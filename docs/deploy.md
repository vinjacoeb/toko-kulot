# Deploy — Toko Kulot

Dokumen ini menyiapkan pemasangan aplikasi di server produksi. Semua perintah diambil dari
perintah resmi Laravel/Composer/npm. Langkah **belum pernah dijalankan di server nyata**
(kartu ini tidak menyediakan server target) — yang sudah diuji di mesin lokal hanya build
aset, `migrate:fresh --seed`, dan daftar rute. Status verifikasi ada di
`docs/checklist-rilis.md`.
Build beku terakhir yang diverifikasi: **t_fac8f5a3** (22 Okt 2026 06:37:13, chunk app
`app-BCun0p-R.js`, css `app-DpcrjTSz.css`, manifest 32.800 B sha256 `223b5514…3cc39`) — rincian di §3,
§5 dan §9; bukti mentah `docs/bukti-build-t_fac8f5a3.txt`. Build sebelumnya: D1 (`t_e83922f2`,
21 Okt 20:55:37, `app-Dyl9odRh.js`).

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

# 4. Database — WAJIB sebelum rilis (jangan dilewati)
#    a. cadangkan dulu: mysqldump -u <user> -p toko-kulot > backup-$(date +%F).sql  (lihat §8)
#    b. naikkan skema pada database yang sudah berisi data (TANPA fresh, TANPA seed):
php artisan migrate --force
#    Dua migrasi terakhir yang wajib ikut jalan pada rilis ini:
#      2026_10_20_000018_add_compare_price_to_products_table  -> kolom products.compare_price
#      2026_10_21_000019_add_tracking_number_to_orders_table   -> kolom orders.tracking_number
#    Lewat salah satunya: simpan produk gagal "Unknown column 'compare_price'" dan
#    pengisian nomor resi pesanan gagal (kolomnya belum ada). Cek hasilnya:
php artisan migrate:status        # harus 0 "Pending"; kedua migrasi di atas = "Ran"
#    c. HANYA untuk server baru yang database-nya masih kosong:
php artisan migrate --force --seed      # sekali saja; jangan dijalankan pada database berisi data

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
- Bundel yang sudah dibekukan (kartu `t_fac8f5a3`, 22 Okt 2026 06:37:13): manifest 32.800 B
  sha256 `223b5514a842558e7c5563dfe4d4e010b0fe333515015af1c2ef5f9a5b73cc39`, 72 entri /
  72 berkas aset (71 `.js` + 1 `.css`), chunk app `app-BCun0p-R.js`, css `app-DpcrjTSz.css`.
  Bila mengunggah hasil build dari mesin dev, unggah **seluruh** isi `public/build/` sekaligus
  (jangan mencampur dua build) dan bandingkan sha256 `public/build/manifest.json`. Membangun ulang
  di server menghasilkan hash berbeda — itu wajar, asalkan build selesai sebelum rilis dan bundel
  tidak diubah sesudahnya. Bukti build: `docs/bukti-build-t_fac8f5a3.txt`.
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
| `MIDTRANS_IS_PRODUCTION` | `false` untuk sandbox, `true` hanya saat live dengan kunci produksi (§5 butir 2) |
| `MIDTRANS_FAKE` | **`false`** — nilai `true` = QRIS dummy tanpa kredensial, hanya untuk pengembangan. **Wajib diperiksa sebelum rilis** (§5 butir 2) |
| `MIDTRANS_NOTIFICATION_URL` | `https://<domain>/midtrans/notification` |
| `MAIL_MAILER` + `MAIL_*` | `log` = email hanya ditulis ke log (bawaan). Isi `smtp` bila balasan/detail pesanan harus benar-benar terkirim |
| `LOG_LEVEL` | `warning` atau `error` di produksi |

Zona waktu (`Asia/Jakarta`), locale (`id`), dan fallback locale sengaja **tidak** di `.env —
diatur di `config/app.php` (PRD §4.3).

## 5. Midtrans (PRD §8)

1. Di dashboard Midtrans: Settings → Configuration → **Payment Notification URL** =
   `https://<domain>/midtrans/notification` (metode POST). URL ini harus HTTPS dan dapat
   diakses publik, karena server Midtrans yang memanggilnya.
2. **Pemeriksaan mode pembayaran — WAJIB sebelum rilis, jangan dilewati.** Tiga hal, semuanya di
   `.env` server (nilainya diisi pemilik; devops tidak membuka `.env`):
   (a) `MIDTRANS_FAKE=false` — nilai `true` = QRIS dummy: tidak ada uang bergerak, tidak ada
   notifikasi Midtrans, dan aksi "Sinkronkan status pembayaran" menolak dengan pesan "Mode uji
   Midtrans". Rilis nyata wajib `false`.
   (b) Kredensial **sesuai lingkungan**: `MIDTRANS_MERCHANT_ID`, `MIDTRANS_CLIENT_KEY`,
   `MIDTRANS_SERVER_KEY` diambil dari dashboard Midtrans untuk lingkungan yang dipakai — kunci
   **sandbox** (`SB-Mid-…`) untuk pengujian, kunci **production** saat go-live. Jangan mencampur
   kunci sandbox dengan `MIDTRANS_IS_PRODUCTION=true` (atau sebaliknya): Midtrans menolak tagihannya.
   (c) `MIDTRANS_IS_PRODUCTION` — `false` untuk sandbox, `true` hanya saat go-live dengan kunci produksi.
   Sesudah mengubah `.env`: `php artisan config:clear` (lalu `config:cache` setelah `.env` final).
   Bukti cepat: buka `/pesanan/{order}/bayar` — penanda "Mode uji" **tidak boleh** muncul.
3. Uji sandbox: buat pesanan → halaman `/pesanan/{order}/bayar` → selesaikan QRIS di
   simulator sandbox Midtrans → status pesanan berpindah sendiri setelah notifikasi masuk
   (di localhost notifikasi tidak bisa masuk — lihat butir 5).
4. Endpoint notifikasi memverifikasi tanda tangan (`order_id`, `status_code`, `gross_amount`
   + `MIDTRANS_SERVER_KEY`) dan menolak permintaan tanpa tanda tangan valid; ini proteksi
   utama agar status pesanan tidak bisa dipalsukan dari luar.
5. **Webhook tidak bisa masuk ke localhost.** Server Midtrans memanggil URL publik (HTTPS, POST);
   `http://127.0.0.1:8000/midtrans/notification` tidak akan pernah dihubungi. Karena itu di localhost
   status pembayaran **tidak berubah sendiri** walau QRIS sudah dibayar. Cara memverifikasi status di
   localhost: admin membuka `/admin/pesanan/{order}` lalu menekan tombol **"Sinkronkan status
   pembayaran"** (aksi `PATCH /admin/pesanan/{order}/sinkron-pembayaran`, kontrak §12.24). Aksi ini
   menarik status transaksi terakhir langsung dari Midtrans dan menerapkannya lewat jalur yang sama
   dengan webhook (`settlement` → `payment_status` settlement + pesanan `dibayar` + `paid_at`;
   `expire`/`deny`/`cancel` → pesanan `batal` + stok dikembalikan; status final tidak pernah mundur).
   Tombol ini **tidak menggantikan** webhook di produksi: di server dengan domain publik, webhook tetap
   jalur utama dan tombol hanya alat bantu/pemulihan. Bukti webhook asli dari localhost: **belum diuji**
   (butuh tunnel publik; yang diperiksa baru endpoint + penolakan tanda tangan palsu).
6. Setiap kali `.env` diubah untuk Midtrans: `php artisan config:clear` (lalu `php artisan
   config:cache` setelah `.env` final). Tanpa ini nilai lama masih terpakai.
7. **GERBANG RILIS — bukti wajib sebelum produksi** (langkah rinci + rollback:
   `docs/checklist-rilis.md` §15.11). Yang harus terbukti di sandbox:
   (a) halaman `/pesanan/{order}/bayar` tidak lagi menampilkan penanda "Mode uji" setelah
   `MIDTRANS_FAKE=false` + `config:clear`; (b) tagihan uji lama dibuat ulang otomatis, dan bila gagal
   muncul galat + tombol coba lagi (bukan halaman kosong); (c) hitung mundur 5 menit
   (`MIDTRANS_EXPIRY_MINUTES=5`, nilai tidak sah jatuh ke 5) berjalan; (d) 1 QRIS **benar-benar
   terbayar**; (e) status pesanan berpindah ke lunas di halaman pesanan dan admin —
   di server berdomain publik dibuktikan lewat notifikasi asli dari Midtrans (POST) yang masuk ke
   `/midtrans/notification` lewat HTTPS; **di localhost (tanpa tunnel) notifikasi tidak bisa masuk**,
   jadi status dibuktikan lewat aksi admin **"Sinkronkan status pembayaran"** (kontrak §12.24) dan butir
   webhook asli tetap dicatat **belum diuji**.
   Simpan buktinya di `docs/` tanpa kunci rahasia.
8. Bila uji nyata gagal: rollback aman = kembalikan `MIDTRANS_FAKE=true` + `php artisan config:clear`
   (kembali ke mode uji; tidak ada uang nyata yang bergerak). Jangan mengubah/menghapus baris
   `orders`/`payments` manual. Kunci produksi (`MIDTRANS_IS_PRODUCTION=true`) hanya dipakai setelah
   sandbox lulus, dan tidak pernah dipakai untuk pengujian.

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
| `php artisan migrate:status` | semua migrasi `Ran`, tidak ada `Pending` — termasuk `…000018_add_compare_price_to_products_table` dan `…000019_add_tracking_number_to_orders_table` |
| Simpan produk di `/admin/produk/{id}/ubah` | tersimpan tanpa galat `Unknown column 'compare_price'` (bukti migrasi 000018 sudah jalan) |
| Isi nomor resi di `/admin/pesanan/{order}` | tersimpan tanpa galat (bukti migrasi 000019 sudah jalan) |
| Halaman `/pesanan/{order}/bayar` | penanda "Mode uji" **tidak muncul** (`MIDTRANS_FAKE=false`) dan hitung mundur 5 menit berjalan |
| Tombol "Sinkronkan status pembayaran" di `/admin/pesanan/{order}` | ada saat pesanan punya tagihan; di localhost inilah cara status diverifikasi karena webhook tidak bisa masuk |

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

## 9. Yang belum diuji (jujur, per 22 Okt 2026)

- Pemasangan di server produksi nyata: belum ada server target di kartu ini; seluruh
  perintah §3–§4 berasal dari dokumentasi resmi dan belum dieksekusi. Termasuk `php artisan
  migrate --force` untuk dua migrasi terakhir (000018 `compare_price`, 000019 `tracking_number`):
  langkahnya tertulis di §3, tetapi **belum dijalankan pada server produksi** (di DB dev pemilik
  kedua migrasi sudah `Ran` — docs/bukti-migrate-g2.txt).
- Webhook Midtrans sungguhan (butuh kredensial pemilik + URL publik) — belum; langkah bukti +
  rollback-nya ada di `docs/checklist-rilis.md` §15.11 dan §5 di atas. Di localhost webhook tidak
  bisa masuk; status diverifikasi lewat aksi admin "Sinkronkan status pembayaran" (kontrak §12.24).
- Build beku **t_fac8f5a3** (22 Okt 2026 06:37:13, `app-BCun0p-R.js`, manifest sha256 `223b5514…`):
  build exit 0, 0 sumber lebih baru dari manifest saat build selesai (sesudahnya hanya 4 berkas PHP kartu
  backend yang berubah; 0 berkas frontend — SECTION 7 bukti), 0 artefak stale, resources/js bersih, 11/11
  halaman wajib ada di manifest, dan server dev pemilik menyajikan bundel ini (`GET /` = 200). Smoke browser
  pada bundel ini **belum diulang** — angka smoke 9 rute x 3 viewport di `docs/checklist-rilis.md`
  §15.6 diukur pada bundel 20 Okt. Bukti build: `docs/bukti-build-t_fac8f5a3.txt`.
- Konfigurasi web server (Nginx/Apache) dan TLS — belum; hanya syarat document root ke
  `public/` dan HTTPS yang dicatat.
- Backup/restore otomatis, monitoring, dan CI/CD tidak diminta kartu ini — tidak dibuat.

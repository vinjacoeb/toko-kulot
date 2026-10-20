# Brief — backenddeveloper

Kartu (berurutan): **K4** migrasi & model → **K5** seeder → **K6** auth dua tier → **K7** katalog publik → **K8** keranjang/checkout/QRIS → **K9** ulasan, pesan masuk, pengaturan.

## Wajib dibaca

- `docs/PRD.md` §4.2 (struktur direktori & konvensi), **§5 (peta rute = kontrak wajib, nama route persis)**, **§6 (nama tabel & kolom — jangan mengarang)**, §7 (alur bisnis), §8 (Midtrans QRIS + mode fake + signature + idempotensi), §9 (data yang dibutuhkan admin), §11 (keamanan), §12 (R8, R9, R13), §15.
- `docs/design.md` §4.4 (bentuk data yang dibutuhkan `QrisPanel`: `qr_string`/`qris_url`, total, kode order, countdown) dan §5.3 (data ulasan & harga grosir yang ditampilkan).
- `docs/ringkasan-tim.md` §4 dan §5.

## Kontrak yang tidak boleh diubah tanpa kartu baru

Nama tabel & kolom PRD §6; nama route PRD §5.1–5.2; uang = integer rupiah tanpa desimal; status order (`pending`→`dibayar`→`diproses`→`dikirim`→`selesai`/`batal`) dan status payment (`pending`/`settlement`/`expire`/`deny`/`cancel`) persis PRD §6–§7; `settings` key minimum PRD §6.

## Isi tiap kartu

- **K4** — migrasi + model seluruh domain PRD §6, relasi PRD §6, dua guard auth di `config/auth.php` (`web` → `users`, `admin` → `admins`), middleware `EnsureAdmin`. Output: `database/migrations/`, `app/Models/`.
- **K5** — seeder idempoten (`updateOrCreate`, R13) untuk semua domain; maksimal 24 produk contoh (PRD §16); admin awal sesuai PRD §14 A11. Output: `database/seeders/`.
- **K6** — register/login/forgot/reset/logout guard `web` + `/admin/login` guard `admin`; pembeli tidak boleh masuk `/admin`, admin tidak boleh login `/login` (PRD §3); rate limit login 5/menit (PRD §11). Output: controller auth + `routes/admin.php`.
- **K7** — `HomeController`, `ProductController` (filter kategori, pencarian, sort, pagination), detail produk (varian, harga grosir, stok, ulasan), `ContactController`. Output: controller + `routes/web.php`.
- **K8** — `CartService`, `OrderService`, `MidtransService`, checkout, halaman bayar/status/sukses, webhook `/midtrans/notification` (tanpa CSRF, verifikasi `signature_key`, idempoten, `enabled_payments=["other_qris"]`, mode `MIDTRANS_FAKE` wajib jalan tanpa kredensial — PRD §8). Output: controller + service + `routes/web.php`.
- **K9** — ulasan (unique `order_id`+`product_id`, recompute `rating_avg`/`rating_count`), pesan masuk + balasan admin, CRUD pengaturan/carousel/FAQ. Output: controller admin + rute `admin.settings.*`.

## Definition of Done (semua kartu)

`php artisan route:list` memuat rute kartu dengan nama persis PRD §5; `php artisan migrate:fresh --seed` sukses; feature test untuk setiap aksi tulis hijau (`php artisan test`); tidak ada `dd()`/`var_dump()`; tidak menyentuh `.env` (R3); commit tunggal ber-prefix ID kartu (R8). Lampirkan bukti perintah di `kanban_complete` (R9).

## Boleh `kanban_block` hanya bila

(a) dua dokumen memberi nama kolom/route yang bertentangan dan pilihan itu mengubah fungsi, (b) kredensial Midtrans nyata dibutuhkan untuk uji yang tidak bisa difake, (c) kartu prasyarat belum selesai (R10). Selain itu: catat asumsi di `docs/asumsi.md` dan lanjut.

## Dilarang

Mengubah dokumen acuan, mengerjakan halaman frontend (itu K10–K14), membuat tabel/kolom di luar PRD §6 tanpa kartu, menyentuh `.env`.

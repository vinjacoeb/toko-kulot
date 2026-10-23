# Review techlead — laporan pemilik putaran 2 (kartu `t_caaa8fa4`, 21 Okt 2026)

Berkas ini adalah pasangan `docs/review.md` (putaran 1, kartu `t_15531332`). Isinya verifikasi **statis**
tujuh butir laporan pemilik terbaru, akar masalah, dan peta kartu. Tidak ada kode aplikasi yang diubah
oleh kartu techlead ini; semua kode dikerjakan kartu anak.

## 1. Ringkasan

| # | Laporan pemilik | Status verifikasi | Akar masalah | Kartu |
|---|---|---|---|---|
| 1 | Tidak bisa klik "Buat Pesanan" saat checkout | **Terbukti (statis)** — tombol mengirim formulir, tetapi bila validasi klien gagal tidak ada reaksi terlihat | Umpan balik validasi tidak ada + aturan klien lebih longgar dari server | **F7** `t_a98f17d4` |
| 2 | Pastikan bisa bayar QRIS Midtrans sandbox | **Sebagian sudah ada** — jalur QR asli lengkap; belum ada bukti bayar sandbox | Tidak ada bukti uji + `MIDTRANS_FAKE` bawaan true | **G1** `t_fcfc3687` (gerbang pemilik) |
| 3 | Gagal simpan `/admin/produk/12/ubah` (`compare_price`) | **Bukan bug kode** — migrasi tertunda | DB pemilik belum menjalankan migrasi 000018 | **G2** `t_9e719b16` (gerbang pemilik) |
| 4 | Gagal tambah `/admin/produk/tambah` (`compare_price`) | **Bukan bug kode** — sama dengan #3 | DB pemilik belum menjalankan migrasi 000018 | **G2** `t_9e719b16` |
| 5 | Status bayar "menunggu pembayaran" terus padahal sudah dibayar | **Terbukti (statis)** — tidak ada cara admin menarik status | Webhook tak bisa masuk localhost + tidak ada aksi admin | **B3** `t_c374a29b` → **F8** `t_8e89556f` → **G1** |
| 6 | Lakukan e2e test pada produk dan stok | **Belum ada** cakupan e2e terpadu | Belum pernah diuji sebagai alur utuh | **QA2** `t_43d8bcd7` |
| 7 | Tambah tombol Daftar saat klik profil (login user) | **Terbukti (statis)** — tamu hanya punya ikon Masuk, tidak ada jalan ke `/register` | Tautan Daftar tidak pernah dipasang di header/drawer | **U6** `t_46901364` → **F9** `t_e3f68f7f` → **QA2** |

Kartu **QA2** `t_43d8bcd7` menahan **devops** `t_fac8f5a3` (build beku + langkah deploy).

## 2. Temuan dengan bukti

### Butir 1 — "Buat Pesanan" tidak bisa diklik

- CTA checkout: `resources/js/Components/OrderSummary.jsx:53-62` → `type="submit"` + `form="checkout-form"`,
  hanya `disabled` saat `form.processing`. Tombolnya memang bisa ditekan.
- Yang gagal memberi reaksi: `resources/js/Pages/Public/Checkout.jsx:68-76` — `submit()` memanggil
  `validate(form.data)`, dan bila ada temuan langsung `return` **tanpa** notice, tanpa gulir, tanpa fokus.
  Pemakai melihat tombol "tidak melakukan apa pun".
- Pemicu kedua: aturan klien lebih longgar dari server. Klien (`Checkout.jsx:19-32`) hanya memeriksa
  "tidak kosong" + pola telepon/email/kode pos, sedangkan `app/Http/Requests/CheckoutRequest.php:24-30`
  menuntut `customer_name` min 3 / max 100, `customer_email` max 150, `customer_address` min 10 / max 500,
  `customer_city` min 3 / max 100. Isian pendek lolos klien → 422 dari server → pesan galat hanya menempel
  di kolom yang tidak terlihat di layar ponsel.
- Perbaikan ada di kartu F7 `t_a98f17d4` (umpan balik + penyamaan aturan). Tidak ada perubahan kontrak.

### Butir 2 — Bayar QRIS sandbox

Jalur "asli" sudah lengkap dan tidak perlu dibangun ulang:

- `app/Services/MidtransService.php:453-458` mengirim `payment_type = qris` dengan `qris.acquirer = gopay`.
- `app/Services/MidtransService.php:502-512` (`qrUrl()`) membaca `actions[]` dan mengambil
  `name = generate-qr-code`.
- `resources/js/Components/QrisPanel.jsx:163-166` merender gambar QR dari `qris_url`; bila null, jatuh ke
  QR yang dirender lokal dari `qrString` (kontrak §7.7).
- `app/Http/Controllers/CheckoutController.php:96-110` membuat ulang tagihan mode uji
  (`needsRegeneration` → `regenerateCharge`) sebelum halaman bayar dirender.

Yang belum ada hanyalah **bukti**. `MIDTRANS_FAKE` bawaan `true` (keputusan B1 `t_9f4b6aee`), sehingga
tanpa mengubah `.env` pemilik tidak akan pernah melihat QR sandbox asli. Mengubah `.env` berisi kredensial
adalah tindakan pemilik → kartu gerbang **G1** `t_fcfc3687`.

### Butir 3 & 4 — `compare_price` gagal disimpan

- `docs/bukti-backend-t_b078318d.txt:45-46` mencatat dua migrasi **Pending** di DB pemilik:
  `2026_10_20_000018_add_compare_price_to_products_table` dan `2026_10_21_000019_add_tracking_number_to_orders_table`.
  Kedua berkasnya ada di `database/migrations/` (dua baris terakhir `ls database/migrations/`).
- Kode aplikasi sudah merujuk `compare_price` (60 kemunculan di repo, termasuk model & controller admin).
  Karena kolomnya belum ada di MySQL pemilik, INSERT/UPDATE gagal `Unknown column`.
- Kesimpulan: **tindakan pemilik**, bukan bug. Gerbang **G2** `t_9e719b16`. Efek sampingnya juga menjelaskan
  kenapa halaman resi pesanan belum hidup.

### Butir 5 — Status bayar tidak pernah berubah

- `routes/admin.php:133-141` hanya memuat `orders.index`, `orders.show`, `orders.status`, `orders.resi`.
  `app/Http/Controllers/Admin/OrderController.php` hanya punya `index`, `show`, `status`, `resi` — **tidak ada**
  jalur admin untuk menarik status pembayaran dari Midtrans.
- Di localhost, webhook Midtrans tidak bisa masuk (butuh URL publik), sehingga status hanya berubah bila
  pembeli memuat halaman bayar (polling `CheckoutController@status`) atau admin mengubah status manual.
- Perbaikan: **B3** `t_c374a29b` (rute `PATCH /admin/pesanan/{order}/sinkron-pembayaran` + kontrak §12.24)
  lalu **F8** `t_8e89556f` (tombolnya). Pembuktian sungguhan lewat gerbang **G1** `t_fcfc3687`.

### Butir 7 — Tombol Daftar

- `resources/js/Components/Header.jsx:87-105`: tamu hanya mendapat ikon "Masuk" (aria-label Masuk) menuju
  `/login`; tidak ada tautan `/register`.
- `resources/js/Layouts/PublicLayout.jsx:79-95`: footer drawer tamu hanya memuat satu tautan Masuk.
- `resources/js/Pages/Public/Auth/Login.jsx` dan `Register.jsx` tidak saling menautkan.
- Penafsiran techlead: **tamu** mendapat pintu Daftar di tiga tempat. Untuk user yang sudah login tidak
  ditambah tombol Daftar; bila maksud pemilik adalah menu dropdown profil, itu usulan **U7** di
  `docs/usulan.md` dan pertanyaan **P6** di `docs/pertanyaan-pemilik.md` §6.
- Perbaikan: **U6** `t_46901364` (catat deviasi desain) → **F9** `t_e3f68f7f` (kode).

### Butir 6 — e2e produk & stok

Belum pernah dilaporkan. `tests/Feature` memuat banyak folder (Admin, Auth, Catalog, Checkout, Contract,
Database, Messages, Public, Reviews), tetapi tidak ada laporan hasil uji alur utuh produk → stok → pesanan.
Diberikan ke **QA2** `t_43d8bcd7` (CRUD produk + `compare_price`, stok varian, stok turun saat pesanan dibuat,
stok kembali saat batal/kedaluwarsa).

## 3. Yang lulus / gagal / belum dicek

- **Lulus (statis, putaran sebelumnya)**: kontrak §12.17-§12.18a, mode uji Midtrans terlihat (`t_9f4b6aee`),
  masa berlaku QRIS 5 menit (`t_e35050e8`), `ulasan.boleh` (§7.9 `t_45344e00`), kolom resi pesanan (`t_b078318d`).
- **Gagal**: butir 1, 5, 7 (cacat kode/UX). Butir 3-4 bukan cacat kode.
- **Belum dicek, butuh browser/server pemilik**: reproduksi butir 1 di perangkat pemilik; uji bayar QRIS
  sandbox (butir 2); tampilan tombol sinkron & pintu Daftar (setelah F8/F9).
- **Belum dicek, butuh DB pemilik**: efek migrasi 000018/000019 setelah `php artisan migrate` → **diperbarui
  di §6**: kedua migrasi sudah Ran dan kolomnya terverifikasi baca-saja; klik halaman admin tetap belum diuji.
- Semua klaim di atas berasal dari pembacaan berkas working tree (`git status`: 37 modified, 154 untracked,
  HEAD `66527ce`); techlead belum menjalankan ulang uji pada putaran ini.

## 4. Risiko

- **R1**: bila pemilik tidak menjalankan migrasi, dua kartu (produk & resi) tetap gagal dan QA2 akan gagal
  di butir 3-4 — karena itu gerbang G2 dikirim lebih dulu supaya tidak menumpuk.
  **Status 21 Okt 23:1x: ditutup** — kedua migrasi sudah Ran dan kolomnya terverifikasi di DB pemilik (§6).
- **R2**: pembayaran sandbox bergantung akun Midtrans pemilik; tanpa kredensial, butir 2 tetap "belum diuji".
  **Status 21 Okt: jalur penarik status sudah ada (B3+F8)**, tetapi bukti bayar tetap menunggu kredensial
  pemilik — R2 belum gugur.
- **R3**: perubahan `Checkout.jsx` (F7) menyentuh berkas yang juga dipakai alur bayar — QA2 wajib menjalankan
  suite penuh sebelum devops membekukan build.
- **R4**: penafsiran butir 7 bisa berbeda dari maksud pemilik (P6). Perbaikan yang dikirim bersifat minimal
  (tambah tautan), mudah disesuaikan bila maksudnya lain.

## 5. Asumsi yang diambil di putaran ini

- **[ASUMSI]** Nama rute `admin.orders.sinkron-pembayaran` dan kontrak §12.24 dipilih techlead; backend boleh
  menyesuaikan detail di dalam kontrak selama flash key dan perilaku error tetap sama.
- **[ASUMSI]** Tombol "Daftar" hanya untuk tamu; user yang sudah login tidak perlu tombol daftar.
- **[ASUMSI]** Pesan galat validasi tetap memakai gaya komponen yang sudah ada (`InlineNotice`), tanpa komponen baru.

## 6. Hasil verifikasi setelah pemilik bertindak

Catatan: §1-§5 adalah rekaman pemeriksaan awal (sebelum pemilik bertindak). Bagian ini **menimpa** status pada
§1 baris #3/#4, butir "Belum dicek, butuh DB pemilik" di §3, dan risiko R1 di §4.

### G2 — migrasi tertunda: SELESAI (bukti ada)

Kartu gerbang `t_9e719b16` (techlead); pekerjaan migrasi di kartu `t_576d4f09` (backenddeveloper).

- `php artisan migrate:status` sebelum: `2026_10_20_000018_add_compare_price_to_products_table` dan
  `2026_10_21_000019_add_tracking_number_to_orders_table` = **Pending**; sesudah keduanya **Ran batch [2]**,
  baris Pending **2 → 0**. Tidak ada `migrate:fresh` / `migrate:rollback` / `db:wipe`.
  Bukti: `docs/bukti-migrate-g2.txt` bagian 1-3.
- Cek baca-saja di MySQL pemilik (`toko-kulot`): `Schema::hasColumn('products','compare_price') = true` dan
  `Schema::hasColumn('orders','tracking_number') = true`; bentuk kolom `compare_price bigint unsigned null`,
  `tracking_number varchar(60) null` — **cocok** dengan `database/migrations/2026_10_20_000018_...php:16` dan
  `database/migrations/2026_10_21_000019_...php:16`. Data lama utuh: 11 produk, 9 pesanan, kolom baru `NULL`
  (`docs/bukti-migrate-g2.txt` bagian 4).
- Uji otomatis yang menyentuh kedua kolom: **OK 49 tests / 415 assertions** di SQLite `:memory:` —
  `AdminMasterDataTest`, `AdminSalesTest:241-330` (resi), `CatalogIndexTest:346-367` + `CatalogShowTest:123-134`
  (`compare_price`), `ProductPricingTest:59-62`. Database MySQL pemilik tidak tersentuh
  (`docs/bukti-migrate-g2.txt` bagian 5).
- Kode memang memakai kolomnya, jadi galat `Unknown column 'compare_price'` pada laporan #3/#4 seharusnya
  sudah hilang (dicek techlead dengan pencarian baca-saja): produk `app/Models/Product.php:27,42,108`,
  `app/Services/ProductAdminService.php:87`, `app/Http/Requests/Admin/StoreProductRequest.php:31`,
  `app/Http/Requests/Admin/UpdateProductRequest.php:41`,
  `app/Http/Controllers/Admin/ProductController.php:207,258`; resi `app/Models/Order.php:135`,
  `app/Http/Requests/Admin/UpdateOrderTrackingRequest.php:26`,
  `app/Http/Controllers/Admin/OrderController.php:151,252`.
- Ringkasan backend: `docs/catatan-backend.md:716` (bagian G2).

### G1 — galat baru 22 Okt: `Cannot use object of type stdClass as array` (cacat kode, bukan `.env`)

Pemilik menjalankan langkah G1 lalu melaporkan lewat dashboard (komentar 22 Okt 06:08): "ada Error
app\Services\MidtransService.php:540 Cannot use object of type stdClass as array". Techlead memeriksa
baca-saja (tanpa server, tanpa menyentuh `.env`):

- **Akar masalah (terbukti dari kode + vendor).** SDK `midtrans/midtrans-php` mengembalikan objek, bukan
  array: `vendor/midtrans/midtrans-php/Midtrans/ApiRequestor.php:159` memakai `json_decode($result)` tanpa
  `true`. Adapter kita hanya membuang tingkat teratas — `(array) \Midtrans\CoreApi::charge(...)` di
  `app/Services/Midtrans/SdkMidtransApi.php:25` (dan `:39` untuk `status()`) — sehingga `actions` tetap
  array berisi `stdClass`; `$action['name']` di `app/Services/MidtransService.php:540` melempar galat.
  Yang dilanggar adalah kontrak seam `app/Services/Midtrans/MidtransApi.php:14-27` (menjanjikan array
  bersarang), jadi perbaikannya di adapter, bukan di `qrUrl()`.
- **Kenapa lolos uji.** `tests/Support/FakeMidtransApi.php:58-64` mengembalikan `actions` sebagai array PHP
  biasa; tidak ada test yang memakai bentuk SDK (pencarian `stdClass` di `tests/` = 0 hasil).
- **Dampak.** Seluruh jalur QRIS asli mati: tagihan awal (`app/Services/MidtransService.php:146`) dan
  `regenerateCharge()` (`:210`) sama-sama memanggil `qrUrl()`, jadi `/checkout/{order}/bayar` gagal sebelum
  QR tampil. G1 tidak bisa dibuktikan sampai ini beres; laporan #2 tetap **belum diuji**.
- **Yang bukan penyebab.** Bukan `.env` dan bukan kredensial: baris 540 hanya tercapai setelah
  `chargeOrder()` kembali berhasil, jadi panggilan ke Midtrans sandbox **kelihatannya** tembus (inferensi
  dari aliran kode — belum ada bukti dari dashboard Midtrans pemilik).
- **Kartu perbaikan:** **B4** `t_3bfe3165` (backenddeveloper) — normalisasi rekursif di seam
  `SdkMidtransApi` + test berbentuk stdClass. Putaran 1 dari maksimal 2. G1 kini menunggu B4, bukan
  menunggu pemilik.
- **Untuk pemilik:** transaksi yang sudah terlanjur dibuat tidak bisa di-`charge` ulang dengan `order_id`
  yang sama (Midtrans menolak ID ganda); setelah B4 selesai pakai **pesanan uji baru** — usulan **U8**.

### B4 selesai — galat `stdClass` tertutup (verifikasi baca-saja 22 Okt 2026)

- **Perbaikan ada di adapter.** `app/Services/Midtrans/SdkMidtransApi.php:83-115` menormalkan respons
  **rekursif** (objek/`JsonSerializable` → array, array disusuri sampai dalam); `charge()` `:31-40` dan
  `status()` `:45-54` memakai normalizer itu; panggilan SDK mentah dipisah ke `requestCharge()` `:65-68`
  dan `requestStatus()` `:73-76`. Tidak ada `\Midtrans\CoreApi`/`\Midtrans\Transaction` di luar adapter
  (grep `app/`: hanya `App\Services\Midtrans\*` + binding di `AppServiceProvider`).
- **Test bentuk SDK.** `tests/Feature/Checkout/MidtransSdkShapeTest.php` (4 test) memakai
  `json_decode(..., false)` persis seperti `vendor/midtrans/midtrans-php/Midtrans/ApiRequestor.php:159`;
  satu test menempuh `POST /checkout` mode asli sampai `payments.qris_url` tersimpan dan
  `/checkout/{order}/bayar` merender QR asli.
- **Techlead menjalankan ulang test fokus** (phpunit.xml = SQLite `:memory:`, DB pemilik tidak tersentuh):
  `php -d extension=pdo_sqlite vendor/bin/phpunit --filter MidtransSdkShapeTest` →
  **OK (4 tests, 49 assertions)**. Suite penuh 242 test/1844 assertion adalah laporan worker B4,
  **tidak** dijalankan ulang di kartu ini.
- **Tidak ada migrasi/kolom baru**; `.env` tidak disentuh. Tidak ada perubahan pada
  `MidtransService::qrUrl()` (`:537-546`) — ia tetap satu-satunya pembaca `actions[]`.
- **Batas bukti:** charge QRIS sungguhan ke sandbox tetap belum diuji — itu langkah pemilik (G1).

### B5 selesai — `order_id` Midtrans unik, checkout ulang tidak lagi 406 (verifikasi baca-saja 22 Okt 2026)

- **Perbaikan ada di `MidtransService`.** `nextMidtransOrderId()` (`app/Services/MidtransService.php:498-517`)
  menyusun `orders.code` + `-` + 6 hex uppercase (maks 60 char) dan mengecek tabrakan di
  `payments.order_id_midtrans` (5 percobaan); nilainya dihitung **sekali per panggilan charge** lalu dipakai
  untuk `chargeParams()` + kolom `order_id_midtrans` di `createQrisCharge()` (`:148-155`) dan
  `regenerateCharge()` (`:215-220`). Cabang mode uji (`:132-145`) tetap `= orders.code`; kode pesanan yang
  tampil ke pembeli/admin tidak berubah.
- **Pembacaan tetap konsisten.** Webhook `handleNotification()` (`:264-272`) dan sinkron status
  (`:303-311`, `:341-345`) mencari lewat `payments.order_id_midtrans`, jadi notifikasi bersufiks tetap
  ketemu; fallback lama ke `orders.code` tidak dihapus.
- **Test regresi worker B5:** `tests/Feature/Checkout/MidtransOrderIdUniqueTest.php` (3 test) — dua charge
  beda ID, checkout ulang pasca-charge tidak 406, notifikasi ID bersufiks tetap settlement; filter
  Checkout|Midtrans|Payment 78/78 dan suite penuh 245/245 lulus (laporan worker, **tidak** dijalankan ulang
  di kartu ini). Tanpa migrasi/kolom baru; `.env` tidak disentuh.
- **Batas bukti:** charge QRIS sungguhan tetap belum diuji — itu langkah pemilik (G1), kini tanpa penghalang
  kode yang diketahui.

### Temuan lanjutan 22 Okt — kode pesanan 22 Okt "terbakar", G1 belum bisa diulang

- **Bukti.** `storage/logs/laravel.log:4499-4507`: galat 06:07:51 muncul di
  `CheckoutController::store` → `OrderService::createFromCart` → `createQrisCharge` → `qrUrl`.
  Baris `MidtransService.php:540` hanya tercapai **setelah** `chargeOrder()` (`:139`) kembali sukses —
  jadi transaksi Midtrans untuk kode itu **sudah dibuat** (inferensi kuat dari aliran kode; belum
  dikonfirmasi dari dashboard Midtrans).
- **Kenapa berbahaya.** `OrderService.php:34` membungkus seluruh checkout dalam `DB::transaction` dan
  memanggil charge di `:87`; ketika `qrUrl()` melempar, pesanan + payment + pengurangan stok di-rollback,
  tetapi transaksi Midtrans tetap ada. `nextCode()` (`OrderService.php:186-199`) memakai `count()` pesanan
  hari itu + 1, sehingga **percobaan checkout berikutnya menghasilkan kode yang sama**; Midtrans menolak
  `order_id` yang masih aktif (406, "order_id has been paid and utilized"). Artinya pemilik **belum bisa**
  mengulang § G1 sekarang — bukan karena `.env`, tetapi karena kode pesanan itu sudah terpakai di Midtrans.
- **Kartu perbaikan:** **B5** `t_a90d5215` (backenddeveloper, workspace sama) — Midtrans `order_id` diberi
  sufiks unik per panggilan charge dan disimpan di `payments.order_id_midtrans` (kolom sudah ada, tanpa
  migrasi). **G1 digantungkan pada B5**; setelah B5 `done`, ulangi § G1 dengan pesanan uji baru.
- **Tindakan pemilik sekarang (opsional, aman):** buka dashboard Midtrans — sandbox bila
  `MIDTRANS_IS_PRODUCTION=false`, **produksi bila `true`** — cari transaksi 22 Okt sekitar 06:07 dan
  batalkan/expire bila masih `pending`. Transaksi yatim ini tidak menagih apa pun sampai dibayar, tetapi
  bila ternyata dibuat di produksi, batalkan agar tidak membingungkan.

### Kredensial sandbox `.env` diisi pemilik — 22 Okt 2026 07:46 (belum ada bukti bayar)

- **Laporan pemilik** (komentar dashboard 22 Okt 07:46): `MIDTRANS_FAKE=false`,
  `MIDTRANS_IS_PRODUCTION=false`, `MIDTRANS_EXPIRY_MINUTES=5`, serta merchant/client/server key **sandbox**
  (berawalan `SB-Mid-client-` / `Mid-server-`). Nilai penuh sengaja **tidak** disalin ke dokumen; techlead
  tidak membaca `.env` dan tidak menyalakan server.
- **Terbukti dari kode (baca-saja):** jalur asli aktif hanya bila `server_key` terisi —
  `MidtransService::isFake()` (`app/Services/MidtransService.php:107`) = `config('midtrans.fake')` **atau**
  `server_key` kosong; kini keduanya tidak berlaku, jadi `createQrisCharge()` menempuh cabang asli
  (`:148-155`). Tidak ada `bootstrap/cache/config.php` (hanya `packages.php` + `services.php`), sehingga
  `.env` baru langsung dipakai pada request berikutnya — `php artisan config:clear` di
  `docs/langkah-pemilik.md` § G1 langkah 1 **tidak wajib**.
- **Belum ada bukti langkah 2-4.** `storage/logs/laravel.log` tidak punya entri non-`testing` setelah
  07:35. Charge sukses memang tidak dicatat, tetapi kegagalan charge (`MidtransService.php:565`),
  kegagalan tarik status (`:310`), dan **setiap** upaya sinkron (`Admin/OrderController.php:196`) akan
  tercatat → belum ada jejak percobaan bayar/sinkron. Kesimpulan: gerbang tetap **terbuka**; yang kurang
  bukan konfigurasi, melainkan bukti pembayaran; putusan P3 sudah diambil (butir P3 di §6).

### Yang belum dicek di kartu ini (butuh browser + server pemilik)

- Klik ulang `/admin/produk/tambah`, `/admin/produk/12/ubah`, dan isi resi di `/admin/pesanan/{order}`:
  **belum diuji, butuh browser** — techlead tidak menyalakan server dan tidak punya browser. Jadi untuk
  laporan #3/#4 baru bisa dikatakan **akar masalah hilang**, belum "pasti beres di layar pemilik".
- Catatan untuk pemilik: DB pemilik saat ini berisi **11 produk** dan **tidak punya produk id=12**
  (`docs/bukti-migrate-g2.txt:114-115`) — ulangi uji ubah produk dengan id yang ada (1-11), bukan 12.
  Bila form tetap gagal, kirim teks galat + id produk yang dipakai sebagai bukti baru.

### Temuan mesin (bukan bug repo)

- `php artisan test` masih gagal total di mesin ini (`could not find driver`, sqlite) karena
  `extension=pdo_sqlite` & `extension=sqlite3` masih dikomentari di `php.ini` (Laragon 8.3.32) —
  `docs/bukti-migrate-g2.txt:71-75`. Sementara pakai `php -d extension=pdo_sqlite vendor/bin/phpunit ...`
  (`docs/langkah-pemilik.md:196-217`). Wajib diketahui QA2 `t_43d8bcd7` yang harus menjalankan suite penuh.

### Status gerbang & kartu lain

- **G1** `t_fcfc3687` (bukti 1 pembayaran QRIS sandbox; P3 sudah diputuskan): **prasyarat SELESAI 21 Okt 2026** —
  **B3** `t_c374a29b` (rute `PATCH /admin/pesanan/{order}/sinkron-pembayaran` di `routes/admin.php:143-145`,
  handler `app/Http/Controllers/Admin/OrderController.php:165`, 237 test/1791 assertion lulus) dan **F8**
  `t_8e89556f` (tombol di `resources/js/Pages/Admin/Orders/Show.jsx:231-233`, hanya tampil bila
  `data.payment` ada) keduanya `done`. Gerbang ini **kini menunggu pemilik**, bukan menunggu kode.
- **Pembaruan 22 Okt 2026 (B4 + B5 `done`):** galat `stdClass` ditutup B4 (`SdkMidtransApi.php:83-115`;
  test fokus 4/49 OK) dan `order_id` Midtrans kini unik per charge lewat B5
  (`MidtransService.php:498-517`; test worker 3/3 + suite 245/245). Kedua penghalang kode hilang, jadi G1
  **kembali menunggu pemilik**: ulangi `docs/langkah-pemilik.md` § G1 dengan pesanan uji baru, bayar lewat
  Simulator (cari Order ID **berawalan** kode pesanan) lalu tekan tombol sinkron. P8 (transaksi
  yatim 06:07) tetap perlu dicek pemilik di dashboard Midtrans.
- **Pembaruan 22 Okt 2026 07:46:** pemilik mengisi `.env` sandbox (`MIDTRANS_FAKE=false`,
  `MIDTRANS_IS_PRODUCTION=false`, kunci berawalan `SB-Mid-client-`/`Mid-server-`). Konfigurasi **bukan lagi**
  penghalang (tanpa cache config; `isFake()` di `MidtransService.php:107` kini `false`), tetapi
  **bukti bayar belum ada**: log tidak mencatat percobaan charge/sinkron setelah 07:35. P3 sudah diputuskan
  (butir P3 di bawah). Sisa permintaan ke pemilik menyempit menjadi: (1) satu pesanan uji baru dibayar lewat
  **Simulator**, (2) tekan **Sinkronkan status pembayaran** dan salin notice + status sebelum→sesudah,
  (3) P8 transaksi yatim 06:07.
- Bukti baca-saja techlead atas jalur yang dipakai gerbang: `qris_url` diambil dari `actions[]`
  `generate-qr-code` (`app/Services/MidtransService.php:146` saat membuat tagihan, `:210` saat
  `regenerateCharge` — kartu gerbang menulis :144/:208, bergeser karena blok
  `isFakeCharge`/`needsRegeneration` disisipkan), `qrUrl()` di `:537-546`,
  `resources/js/Components/QrisPanel.jsx:163-172` merender `qrString` lebih dulu lalu `qrisUrl` bila ada,
  dan tagihan mode uji dibuat ulang otomatis di `app/Http/Controllers/CheckoutController.php:96-110`.
- **P3 — DIPUTUSKAN 22 Okt 2026 (kartu `t_abb37557`): DIPERTAHANKAN sebagai catatan.** Kolom
  `midtrans_client_key`/`midtrans_is_production` tetap ada di tab Pembayaran, dengan **hint** per kolom
  "Catatan saja: nilai ini tidak dibaca jalur pembayaran QRIS" + teks "Kredensial dibaca dari {sumber}."
  dan badge mode efektif (`Settings/Index.jsx:2042,2056` hint; `:2016,2021`; teks server
  `MidtransService.php:53-55`).
  Alasan: (1) PRD §6 (`docs/PRD.md:199`) mewajibkan 19 kunci `settings` termasuk keduanya — menghapusnya
  berarti amendemen PRD oleh pemilik, bukan keputusan teknis; (2) yang tersimpan hanya *client key* (kunci
  publik Midtrans, dipakai di sisi klien) + satu flag boolean — *server key* tidak pernah masuk `settings`
  (`docs/db.md:221`), jadi alasan "menyimpan nilai sensitif" tidak berlaku; (3) akar keluhan "kolom terlihat
  mengatur padahal tidak" sudah ditutup hint + status mode efektif dari F2, jadi opsi (b) sudah terpenuhi;
  (4) tidak perlu migrasi/hapus baris di DB pemilik saat gerbang bayar masih terbuka. Dampak: **tidak ada
  perubahan kode, UI, atau migrasi** — hanya dokumen (`docs/design.md` D11 final, `docs/db.md`,
  `docs/akun-dev.md`, usulan U9). Bila pemilik kelak tetap ingin hapus: amendemen PRD §6 lebih dulu, lalu
  kartu backend (whitelist/validasi/seeder/verifikasi seed/test **plus** hapus 2 baris `settings` lewat
  migrasi data — tanpa itu keduanya muncul sebagai grup `lainnya`, `SettingService.php:85-89`) dan kartu
  uiux+frontend untuk §5.13/D11.
- **QA2** `t_43d8bcd7` (butir 6 pemilik: e2e produk & stok): statusnya tidak diperiksa ulang di kartu
  gerbang ini; G1 tidak menahannya dan sebaliknya.
- **Belum dicek di G1**: klik nyata tombol "Sinkronkan status pembayaran", pembayaran lewat Midtrans
  Simulator, dan perubahan badge status — **belum diuji, butuh browser + kredensial sandbox pemilik**.
  Langkah persisnya ada di `docs/langkah-pemilik.md` § G1; hasilnya dicatat di §6 ini setelah pemilik
  membalas.

### Panduan & checklist bukti bayar QRIS sandbox (kartu `t_0e464483`, 22 Okt 2026)

Tujuan: satu **bukti bayar QRIS sandbox** yang bisa dicentang pemilik, tanpa techlead/devops menyentuh
`.env`. Status: **panduan siap, bukti belum ada** — langkah 2-4 adalah tindakan pemilik. Versi rinci yang
sama ada di `docs/langkah-pemilik.md` § G1; checklist ringkas juga disalin ke
`docs/pertanyaan-pemilik.md` §6.

**Kode yang dirujuk (dibaca ulang 22 Okt, baca-saja):**
- `app/Services/MidtransService.php:156` (`createQrisCharge` → `qris_url`) dan `:221`
  (`regenerateCharge`); `qrUrl()` di `:582-591` mengambil `actions[]` dengan `name = generate-qr-code`.
  Tagihan uji dibuat ulang otomatis di `app/Http/Controllers/CheckoutController.php:103-105`.
- `resources/js/Components/QrisPanel.jsx:50` (`hasQr`), `:163-172` (QR dari `qrString` lebih dulu, lalu
  gambar `qrUrl`) — keduanya sah selama berasal dari Midtrans; `:144-146` kotak **Mode uji** hanya muncul
  bila `midtrans.uji` true. Placeholder "Kode QR belum tersedia" (`:175-179`) = tidak ada QR.
- Tombol: `resources/js/Pages/Admin/Orders/partials/SyncPaymentButton.jsx:75` → handler
  `app/Http/Controllers/Admin/OrderController.php:165-207`, rute
  `routes/admin.php:143-145` (`PATCH /admin/pesanan/{order}/sinkron-pembayaran`).
- Webhook tidak bisa masuk `localhost`; halaman bayar `GET /checkout/{order}/bayar` (`routes/web.php:105`).
- Batas bayar **5 menit** (P1) datang dari `config/midtrans.php:20-41` (`MIDTRANS_EXPIRY_MINUTES`, bawaan 5).

**Checklist pemilik (centang setelah terbukti)**

- [ ] **1. Mode sandbox siap.** `.env`: `MIDTRANS_FAKE=false`, `MIDTRANS_IS_PRODUCTION=false`, kredensial
      sandbox. **Sudah diisi pemilik 22 Okt 07:46 — jangan diubah.** `php artisan config:clear` opsional
      (tidak ada `bootstrap/cache/config.php`); cukup muat ulang halaman. Bukti: kotak **Mode uji** tidak muncul.
- [ ] **2. Pesanan uji BARU + QR tampil.** Login pembeli → keranjang → checkout → `/checkout/{order}/bayar`.
      Lulus bila ada QR (gambar `qris_url` atau kode dari `qr_string`) **dan** kotak "Mode uji" tidak ada.
      Catat kode pesanan `TK-YYYYMMDD-NNNN`. Pesanan lama yang sudah pernah membuat transaksi Midtrans tidak
      bisa dipakai ulang (ID ganda ditolak).
- [ ] **3. Bayar lewat Simulator (batas 5 menit).** Dashboard Midtrans **sandbox** → **Transactions** →
      pilih transaksi dengan *Order ID* **berawalan** kode pesanan (`TK-YYYYMMDD-NNNN-XXXXXX`) → **Simulator**
      → status **settlement**. Lewat 5 menit = kedaluwarsa: buat pesanan baru, jangan bayar QR kedaluwarsa.
- [ ] **4. Sinkronkan status dari admin.** `/admin/pesanan/{id}` → kartu **Bukti pembayaran** → tombol
      **Sinkronkan status pembayaran**. Harapan: notice *"Status pembayaran diperbarui dari Menunggu
      pembayaran ke Lunas."* dan label status ikut berubah.
      Arti notice lain (`OrderController.php:171-206`): *"...belum punya tagihan pembayaran..."* (payment
      kosong), *"Pembayaran sudah lunas..."* (sudah settlement), *"Mode uji Midtrans: status tidak bisa
      disinkronkan."* (masih mode uji), *"Gagal memeriksa status pembayaran. Coba lagi."* (Midtrans tak
      terhubung/kredensial salah), *"Status pembayaran tidak berubah: Menunggu pembayaran."* (Simulator
      belum settlement).
- [ ] **5. Catat bukti.** Isi tabel di bawah, tempel di kartu `t_fcfc3687`, lalu tekan **Unblock**.
      (P3 sudah diputuskan techlead: dipertahankan sebagai catatan — tidak perlu dijawab lagi.)

**Tabel bukti yang harus diisi pemilik**

| Isian | Nilai |
|---|---|
| Kode pesanan + URL admin | `TK-…` / `/admin/pesanan/…` |
| Order ID di dashboard Midtrans | `TK-…-XXXXXX` |
| ID transaksi (kartu Bukti pembayaran) | … |
| Status sebelum → sesudah | Menunggu pembayaran → Lunas |
| Teks notice apa adanya | … |
| Timestamp bayar (Simulator) & timestamp sinkron | … |
| Tangkapan layar / salinan teks layar | lampirkan ke kartu |

**Batas bukti:** langkah 2-4 **belum diuji** di kartu ini — techlead tidak menyalakan server, tidak
memakai browser, dan tidak membaca `.env`; bukti baru sah setelah pemilik menempel isian tabel di atas.
Bila langkah 4 gagal, kirim teks notice apa adanya: itu menentukan kartu perbaikan berikutnya.

### Verifikasi QA tombol "Sinkronkan status pembayaran" (kartu `t_9d3e06e0`, 22 Okt 2026 08:00)

Ringkas: **langkah 1 LULUS** (tombol, rute, controller, dan perilaku cabangnya terbukti);
**langkah 2-3 belum diuji** karena belum ada pembayaran sandbox dari pemilik — dan sebabnya kini
terbukti dari data, bukan dugaan: pesanan uji terakhir kedaluwarsa sebelum sempat dibayar.
Bukti mentah (perintah + keluaran): `docs/bukti-qa-t_9d3e06e0.txt`.

| Butir (DoD kartu) | Hasil | Bukti |
|---|---|---|
| Tombol ada di `/admin/pesanan/{order}` dengan label benar | **Lulus** (statis + bundle) | `resources/js/Pages/Admin/Orders/Show.jsx:231-232` merender `SyncPaymentButton` hanya bila `data.payment` tidak null; label beku di `partials/SyncPaymentButton.jsx:75`; bundle terkirim: `public/build/assets/SyncPaymentButton-TLkCqPKk.js` (manifest 22 Okt 06:37) dan chunk `Show-BPWbAQ_g.js` merujuknya |
| Memanggil endpoint yang benar | **Lulus** | `SyncPaymentButton.jsx:45` → `form.patch('/admin/pesanan/{id}/sinkron-pembayaran')` tanpa body. `route:list --path=sinkron` → `PATCH admin/pesanan/{order}/sinkron-pembayaran`, name `admin.orders.sinkron-pembayaran`, action `OrderController@syncPayment`, middleware `web, admin, throttle:admin-write`. Probe tanpa sesi di `127.0.0.1:8000`: `GET /admin/pesanan/1` → **302**, `PATCH` rute itu → **419** (CSRF) — rute cocok, bukan 404 |
| Controller menjalankan aturan status | **Lulus** (test dijalankan QA) | `app/Http/Controllers/Admin/OrderController.php:165-207` menangani 6 cabang: tanpa tagihan, sudah lunas, mode uji (`isFake()`/`isFakeCharge()`), gagal Midtrans (`CheckoutException` → flash.error bukan 500), berubah, tidak berubah; label dari `app/Models/Order.php:63-69` ("Menunggu pembayaran"/"Lunas"). `phpunit --filter AdminSyncPaymentTest` → **OK (12 tests, 55 assertions)**, termasuk `pending → settlement` + flash "Status pembayaran diperbarui dari Menunggu pembayaran ke Lunas.", `expire → batal` + stok kembali, dan non-admin 302 ke `/admin/login` |
| Status berubah dari "Menunggu pembayaran" ke status akhir setelah sinkron | **Belum diuji** | Belum ada pembayaran `settlement`; rincian di bawah |
| Tidak menyentuh `.env` / kode aplikasi | **Lulus** | Perubahan repo pada kartu ini hanya `docs/review-2.md` §6 + `docs/bukti-qa-t_9d3e06e0.txt` |

**Mengapa langkah 2 belum bisa diuji — fakta dari DB pemilik (baca-saja) dan log**

- Pesanan uji terakhir pemilik: order **#13** `TK-20261022-0001`, dibuat `2026-10-22 07:40:09`;
  payment **#10** dengan `order_id_midtrans=TK-20261022-0001-33182A` (sufiks B5 bekerja),
  `transaction_id=a2487ad2-e963-4907-a8ff-bd1436b5fa61`, `paid_at=null`, `expires_at=07:45:09`,
  status payment `expire`, `updated_at=07:46:32`; order berstatus `batal`.
- Artinya **QRIS sandbox benar-benar terbentuk**: `qris_url` berhost `api.sandbox.midtrans.com`
  (85 karakter) dan `qr_string` 246 karakter — jalur charge asli (B4+B5) tembus. Yang tidak terjadi:
  pembayaran lewat **Simulator di dalam batas 5 menit** (P1), sehingga tidak ada `settlement`
  yang bisa disinkronkan.
- **Tidak ada satu pun percobaan tombol sinkron.** Satu-satunya entri `local.*` 22 Okt adalah galat
  `stdClass` 06:07:51; `Log::info('Admin menyinkronkan status pembayaran dari Midtrans.')`
  (`OrderController.php:196`) tidak pernah muncul. Entri `testing.*` 07:58 dan 08:00 adalah dua
  eksekusi test kartu ini, **bukan** aktivitas pemilik.
- Status `expire` itu bukan hasil tombol: tidak ada scheduler (`routes/console.php` hanya `inspire`),
  sedangkan `app/Http/Controllers/CheckoutController.php:144` memanggil `syncStatus()` best-effort
  **tanpa log** setiap halaman bayar dibuka. **Dugaan** (belum terbukti): pemilik membuka ulang
  `/checkout/13/bayar` pada 07:46:32 sehingga kedaluwarsa terdeteksi di sana.
- Karena itu checklist §6 **langkah 4 tidak dicentang**, laporan #2 tetap **belum diuji**, dan
  gerbang G1 tetap terbuka. Tidak ada kartu perbaikan baru: tidak ditemukan cacat kode pada
  jalur tombol.

**Untuk pemilik — satu putaran lagi (tanpa pertanyaan baru)**

1. Pesanan uji **BARU**; #13 tidak bisa dipakai ulang (`order_id` `…-33182A` sudah terpakai di Midtrans).
2. Dashboard Midtrans **sandbox** → Transactions → *Order ID* **diawali** `TK-YYYYMMDD-NNNN` →
   **Simulator** → `settlement`, **kurang dari 5 menit** sejak QR tampil.
3. `/admin/pesanan/{id}` → **Sinkronkan status pembayaran** → salin notice apa adanya +
   status sebelum→sesudah + ID transaksi ke kartu `t_fcfc3687`.
4. P3 sudah diputuskan (dipertahankan sebagai catatan, §6 butir P3); P8 (transaksi yatim 06:07) tetap
   terbuka — di luar lingkup kartu QA ini.

### Verifikasi ulang dengan bukti pemilik — sinkron 22 Okt 2026 08:15 (kartu `t_9d3e06e0`)

Bukti pemilik (komentar dashboard, 22 Okt 08:17): pesanan `TK-20261022-0003` di `/admin/pesanan/15`,
ID transaksi `3bc0d464-4761-4724-a768-9081d1bb612a`, "status sudah berubah jadi kadaluwarsa saat
disinkronkan". QA mencocokkan klaim itu dengan log aplikasi dan DB pemilik (baca-saja); bukti mentah
di `docs/bukti-qa-t_9d3e06e0.txt` bagian "PUTARAN 2".

**Hasil: tombol dan jalur sinkron LULUS terbukti live — tetapi hasilnya Kedaluwarsa, bukan Lunas.**
Itu **benar** untuk transaksi yang sudah `expire`; yang masih **belum terbukti** adalah cabang
`settlement → Lunas`. Bukan cacat kode, dan bukan kegagalan tombol.

| Butir | Hasil | Bukti |
|---|---|---|
| Tombol benar-benar dipanggil dari `/admin/pesanan/15` | **Lulus** | `[2026-10-22 08:15:01] local.INFO: Admin menyinkronkan status pembayaran dari Midtrans. {"order":"TK-20261022-0003","payment":"pending -> expire","order_status":"pending -> batal"}` — log ditulis **setelah** `syncStatusOrFail()` sukses (`OrderController.php:186-200`), jadi request nyata dengan sesi admin sampai ke controller |
| Status sebelum → sesudah | **Lulus (cabang expire)** | Log di atas + DB: order #15 `TK-20261022-0003` status `batal`, `payment_status` `expire`, `updated_at 08:15:01`; payment #12 `status expire`, `paid_at null`, `expires_at 08:14:19` |
| ID transaksi cocok dengan laporan pemilik | **Lulus** | payment #12: `transaction_id=3bc0d464-4761-4724-a768-9081d1bb612a`, `order_id_midtrans=TK-20261022-0003-FD903B`, `payment_type=qris`, `qris_url` host `api.sandbox.midtrans.com` |
| Status yang dikembalikan Midtrans saat sinkron | `expire` (bukan `settlement`) | payload tersimpan: `transaction_status="expire"`, `status_code="407"`, `transaction_time="2026-10-22 08:09:20"`, `expiry_time="2026-10-22 08:14:20"`, **`settlement_time` tidak ada** |
| Efek samping sinkron (stok kembali) | **Lulus** | `stock_movements` #61 `type=in qty=1`, note "Pengembalian stok — pembayaran expire (TK-20261022-0003)", `08:15:01` — detik yang sama dengan log |
| Notice yang tampil di layar | **Turunan kode, bukan tangkapan layar** | `OrderController.php:202-204` → "Status pembayaran diperbarui dari Menunggu pembayaran ke Kedaluwarsa." QA tidak memegang sesi admin pemilik, jadi teks layar tidak diambil QA |

**Sebab — transaksi memang kedaluwarsa sebelum disinkronkan (bukan bug):**

- `TK-20261022-0003`: QR dibuat `08:09:20`, `expiry_time 08:14:20`; tombol ditekan `08:15:01` →
  **42 detik setelah kedaluwarsa**.
- `TK-20261022-0002` (order #14, payment #11, tx `b41ff031-bad3-4316-827b-284b2b9527f1`): QR dibuat
  `08:02:33`, `expiry_time 08:07:33`; tombol ditekan `08:15:15` → **7 menit 42 detik setelah
  kedaluwarsa**; hasil sama (`pending → expire`, order `pending → batal`, stok kembali lewat `mv#62`).
- Tidak ada `local.ERROR` maupun "Sinkronisasi status Midtrans gagal" pada 08:xx; satu-satunya entri
  `local` jam itu adalah dua baris sinkron di atas. Kredensial, endpoint, dan jalur kode bekerja.
- Dicek ulang langsung ke Midtrans pada `08:24` (`Transaction::status`, baca-saja): kedua transaksi
  **masih `expire`** dan tetap tanpa `settlement_time` — 10–22 menit setelah charge. Jadi status
  Kedaluwarsa bukan efek aplikasi menutup transaksi lebih awal; transaksi memang tidak pernah dibayar.
- Batas 5 menit berasal dari `config/midtrans.php` (`MIDTRANS_EXPIRY_MINUTES`, P1), bukan regresi.

**Konsekuensi untuk G1:** bukti ini menutup "tombol ada & memanggil endpoint benar" dan membuktikan
penerapan status terminal `expire → batal` + pengembalian stok. Yang **belum** terbukti adalah jalur
yang dimaksud laporan #2: `settlement → Lunas`. Pesanan #14/#15 tidak bisa dipakai ulang —
`applyStatus()` sengaja berhenti bila status sudah `expire` (`MidtransService.php:386-392`), dan
`order_id` Midtrans-nya sudah terpakai. Checklist §6 butir 4 tetap **belum dicentang**.

**Satu putaran lagi untuk pemilik (hanya yang berubah):**

1. Pesanan uji **baru** (checkout → `/checkout/{order}/bayar`), catat kode `TK-YYYYMMDD-NNNN`.
2. Segera buka dashboard Midtrans **sandbox** → Transactions → cari *Order ID* berawalan kode pesanan
   → **Simulator** → `settlement`, **jauh di bawah 5 menit** (idealnya < 2 menit). Jangan menunda.
3. Kembali ke `/admin/pesanan/{id}` → **Sinkronkan status pembayaran**. Harapan: notice
   "…dari Menunggu pembayaran ke **Lunas**." + badge Lunas/Dibayar.
4. Tempel notice apa adanya + status sebelum→sesudah + ID transaksi di kartu `t_fcfc3687`.
   Bila QR sudah lewat 5 menit, jangan disinkronkan — hasilnya pasti Kedaluwarsa/Batal.

### Putaran 3 — jendela 5 menit satu-satunya penghalang (22 Okt 2026, kartu `t_fcfc3687`)

Baca-saja techlead setelah bukti QA putaran 2 (di atas) dan log `08:xx`: **tidak ada cacat kode baru yang
tersisa**. Dua percobaan pemilik (#14 `TK-20261022-0002`, #15 `TK-20261022-0003`) berakhir "Kedaluwarsa"
karena tombol ditekan **42 detik** dan **7 menit 42 detik setelah** `expiry_time`; Midtrans mengembalikan
`expire` tanpa `settlement_time`. Yang gagal adalah ketepatan waktu, bukan jalur bayar atau sinkron.

Penghalang itu bisa dihilangkan tanpa kode: `MIDTRANS_EXPIRY_MINUTES` (`.env`, milik pemilik) dibaca
`config/midtrans.php:21-23,41` → `MidtransService::expiryMinutes()` (`:118-123`) → **dua-duanya**
`custom_expiry` Midtrans (`:547-550`, unit `minute`) dan `payments.expires_at` (`:481-483`). Nilai `60`
membuat QR berlaku 60 menit sehingga langkah Simulator + tombol sinkron tidak lagi balapan; setelah bukti
didapat kembalikan ke `5` (P1). Tanpa migrasi, tanpa perubahan kode.

Yang dikonfirmasi ulang di kode (baca-saja):

- `applyStatus()` berhenti bila status lokal sudah terminal `expire/deny/cancel`
  (`app/Services/MidtransService.php:386-392`), jadi #14/#15 **tidak bisa** dinaikkan ke Lunas — pesanan uji
  harus **baru**. Perilaku ini disengaja; risikonya dicatat di `docs/catatan-techlead.md`.
- Tombol sinkron hanya dirender bila halaman punya `data.payment`
  (`resources/js/Pages/Admin/Orders/Show.jsx:232`) — pesanan yang checkout-nya di-rollback (22 Okt 06:07)
  tidak punya tombol. Bukan bug.

**Status G1: masih terbuka.** Yang belum ada tetap bukti `settlement → Lunas` + notice tombol; checklist §6
butir 4 belum dicentang. Laporan #2 tetap **belum diuji**; rilis tetap **No-Go sementara**.

### Putaran 4 — checkout gagal sebelum QR muncul, penyebab tidak tercatat (22 Okt 2026, kartu `t_fcfc3687`)

Pemilik membalas "sudah" pada 22 Okt 08:38. Techlead memeriksa ulang log secara baca-saja (tanpa server,
`.env` tidak dibaca): **tidak ada bukti bayar baru**, yang ada tiga kegagalan berurutan.

| Waktu | Kode pesanan | `midtrans_order_id` | Pesan yang tercatat |
|---|---|---|---|
| 08:36:49 | `TK-20261022-0005` | `TK-20261022-0005-632EC9` | "Gagal membuat pembayaran QRIS. Coba lagi." |
| 08:37:22 | `TK-20261022-0005` | `TK-20261022-0005-825373` | idem |
| 08:37:37 | `TK-20261022-0005` | `TK-20261022-0005-95A07D` | idem |

Bukti: `storage/logs/laravel.log:5339-5341`. Tidak ada entri `local` lain setelah 08:15:15, jadi tidak ada
sinkron maupun pembayaran pada percobaan ini.

Yang bisa dipastikan (baca-saja):

- **Titik gagal = panggilan charge ke Midtrans.** Pesan itu hanya dibuat adapter
  `SdkMidtransApi::charge()` (`app/Services/Midtrans/SdkMidtransApi.php:37-38`) yang membungkus setiap
  `Throwable` dari `CoreApi::charge`; bukan galat QR/DB/UI.
- **Bukan regresi kode baru.** `MidtransService.php` tidak berubah sejak 07:32 dan
  `SdkMidtransApi.php` sejak 06:59; charge 07:40 untuk #13 sempat sukses dengan kode yang sama.
- **Bukan jaringan mati.** Dari mesin ini `GET https://api.sandbox.midtrans.com/v2/<order>/status` tanpa kunci
  menjawab **401** dan `GET /v2/charge` menjawab **404** (±09:05) — host terjangkau.
- **Kode pesanan yang sama tiga kali** (`0005`) menunjukkan checkout di-rollback
  (`OrderService.php:34,87`): pemilik menekan "Buat Pesanan" tiga kali, bukan regenerate tagihan. Tidak ada
  baris `payments`/`orders` yang perlu dibersihkan; keranjang masih bisa dicoba lagi.
- **Sebab sebenarnya tidak terbaca — cacat diagnosabilitas.** `chargeOrder()`
  (`app/Services/MidtransService.php:560-577`) hanya mencatat pesan `CheckoutException`; pesan SDK yang memuat
  HTTP status + badan respons (`vendor/midtrans/midtrans-php/Midtrans/ApiRequestor.php:165-167`) dibuang. Dari
  log, 401 (kunci server berubah), 400 (payload ditolak, mis. `custom_expiry` 60 menit), dan 5xx tidak bisa
  dibedakan. Dugaan-dugaan itu **belum terbukti** — jangan dipakai sebagai kesimpulan.

Tindakan: kartu **B6** `t_1f72a2d1` (backenddeveloper) mencatat kelas + kode + pesan exception asli
(`getPrevious()`), tanpa mengubah pesan yang dilihat pembeli/admin dan tanpa mencatat kredensial. G1
`t_fcfc3687` kini **menunggu B6**; setelah B6 selesai pemilik cukup mengulang checkout sekali dan techlead
membaca penyebabnya dari log.

**Status G1: masih terbuka.** Bukti `settlement → Lunas` belum ada; P8 (transaksi yatim 06:07) juga belum
dijawab. Laporan #2 tetap **belum diuji**; rilis tetap **No-Go sementara**.

## 7. Rekomendasi

**No-Go sementara** untuk rilis: tiga cacat kode (butir 1, 5, 7) sedang diperbaiki, dua migrasi belum jalan,
dan satu alur pembayaran belum pernah dibuktikan. Urutan aman: G2 (migrasi) → F7/F9/U6/B3/F8 → QA2 →
G1 (bukti bayar) → devops build beku. Keputusan rilis akhir tetap di pemilik.

**Pembaruan 21 Okt 2026 (G2 selesai, §6)**: gerbang migrasi sudah tertutup dan R1 gugur; urutan yang tersisa
**F7/F9/U6/B3/F8 → QA2 `t_43d8bcd7` → G1 `t_fcfc3687` → devops `t_fac8f5a3`**. Status tetap **No-Go
sementara** sampai QA2 hijau dan bukti bayar ada — build belum boleh dibekukan.

**Pembaruan 21 Okt 2026 (prasyarat G1 selesai)**: B3 dan F8 sudah `done` dan kodenya diverifikasi baca-saja
(§6), jadi G1 hanya menunggu tindakan pemilik: `.env` sandbox (`MIDTRANS_FAKE=false`,
`MIDTRANS_IS_PRODUCTION=false`) → buat pesanan uji → bayar lewat Midtrans **Simulator** (batas bayar 5 menit)
→ tekan "Sinkronkan status pembayaran" di `/admin/pesanan/{order}`. Langkah lengkap di
`docs/langkah-pemilik.md` § G1. Setelah balasan pemilik, bukti dicatat di §6 ini dan
`docs/pertanyaan-pemilik.md` §6. R2 tetap berlaku sampai bukti itu ada.

**Pembaruan 22 Okt 2026 (galat `stdClass` pada uji pemilik)**: uji sandbox pemilik berhenti di
`Cannot use object of type stdClass as array` (`app/Services/MidtransService.php:540`) — cacat adapter SDK,
bukan salah `.env` (§6 "G1 — galat baru 22 Okt"). Urutan sisa menjadi **B4 `t_3bfe3165` → G1 `t_fcfc3687`
(bukti bayar + P3) → devops `t_fac8f5a3`**, dengan QA2 `t_43d8bcd7` berjalan paralel. Status tetap
**No-Go sementara**; build belum boleh dibekukan, dan laporan #2 belum boleh disebut "teruji".

**Pembaruan 22 Okt 2026 (B4 selesai, G1 kembali menunggu pemilik)**: galat `stdClass` sudah tertutup di
adapter SDK dan diverifikasi techlead — `MidtransSdkShapeTest` **OK (4 tests, 49 assertions)** dijalankan
ulang, suite penuh 242/1844 adalah laporan worker B4 (`docs/review-2.md` §6 "B4 selesai"). Urutan sisa:
**G1 `t_fcfc3687` (satu pembayaran sandbox) → devops `t_fac8f5a3`**; QA2 `t_43d8bcd7` paralel.
Status tetap **No-Go sementara**; laporan #2 tetap "belum diuji" sampai pemilik membayar satu pesanan uji
baru dan menekan "Sinkronkan status pembayaran".

**Pembaruan 22 Okt 2026 (B5 ditemukan)**: jejak log menunjukkan kegagalan 06:07 terjadi **setelah** charge
Midtrans sukses; karena checkout dibungkus `DB::transaction` (`OrderService.php:34,87`) dan `nextCode()`
memakai `count()+1` (`:186-199`), checkout ulang akan memakai `order_id` yang sama dan ditolak Midtrans
(406). Kartu **B5** `t_a90d5215` dibuat; urutan sisa menjadi **B5 → G1 `t_fcfc3687` → devops `t_fac8f5a3`**,
QA2 `t_43d8bcd7` paralel. Status tetap **No-Go sementara**.

**Pembaruan 22 Okt 2026 (B5 selesai, G1 kembali menunggu pemilik)**: `order_id` Midtrans sekarang
`orders.code` + sufiks 6 hex per panggilan charge (`app/Services/MidtransService.php:498-517`, tanpa migrasi),
sehingga checkout ulang tidak lagi ditolak 406 dan webhook/sinkron tetap menemukan payment lewat
`payments.order_id_midtrans`. Urutan sisa: **G1 `t_fcfc3687` (satu pembayaran sandbox) →
devops `t_fac8f5a3`**; QA2 `t_43d8bcd7` paralel. Status tetap **No-Go sementara** sampai bukti bayar ada.
Catatan untuk pemilik: di dashboard Midtrans *Order ID* transaksi baru berbentuk `TK-YYYYMMDD-NNNN-XXXXXX`.

**Pembaruan 22 Okt 2026 07:46 (kredensial sandbox diisi, bukti bayar belum)**: `.env` pemilik sudah
`MIDTRANS_FAKE=false` + `MIDTRANS_IS_PRODUCTION=false` + kunci sandbox, jadi tidak ada lagi penghalang
konfigurasi yang diketahui (§6 "Kredensial sandbox `.env` diisi pemilik"). Status tetap **No-Go sementara**:
satu-satunya penghalang yang tersisa adalah bukti (satu pembayaran Simulator + hasil tombol sinkron);
laporan #2 tetap **belum diuji** sampai bukti itu masuk. Urutan sisa: **G1 `t_fcfc3687`
(bukti bayar) → devops `t_fac8f5a3`**; QA2 `t_43d8bcd7` paralel.

**Pembaruan 22 Okt 2026 (P3 diputuskan — kartu `t_abb37557`)**: P3 **DIPERTAHANKAN sebagai catatan**;
tidak ada perubahan kode, UI, atau migrasi (rincian + alasan di §6 butir P3). Konsekuensi untuk gerbang:
permintaan ke pemilik tinggal **(1)** bukti satu pembayaran Simulator + hasil tombol sinkron dan **(2)** P8
transaksi yatim; halaman pengaturan tidak lagi "menyesatkan" karena label per kolom + notice `.env` sudah
tampil sejak F2. Bila pemilik kelak tetap ingin menghapus kolomnya, jalurnya ada di `docs/usulan.md` U9 —
amendemen PRD §6 harus lebih dulu.

**Pembaruan 22 Okt 2026 (putaran 3 — jendela bayar diperpanjang, bukan kode yang salah)**: bukti pemilik
08:15 sudah diuji QA — tombol/endpoint **LULUS live**, hasilnya `pending → expire` karena ditekan setelah
batas 5 menit (detail §6 "Verifikasi ulang ... 08:15"). Satu-satunya sisa: satu pembayaran `settlement` yang
disinkronkan **sebelum** QR kedaluwarsa. Jalannya tanpa kode: `MIDTRANS_EXPIRY_MINUTES=60` sementara di
`.env` pemilik (`config/midtrans.php:21-23,41`; `MidtransService.php:118-123,481-483,547-550`), pesanan uji
baru, Simulator `settlement`, lalu tombol "Sinkronkan status pembayaran" → harapan "…ke **Lunas**.". Setelah
itu kembalikan ke 5 menit (P1). Urutan sisa tetap **G1 `t_fcfc3687` → devops `t_fac8f5a3`**; QA2
`t_43d8bcd7` paralel. Status tetap **No-Go sementara** sampai bukti itu masuk.

**Pembaruan 22 Okt 2026 (putaran 4 — checkout gagal, penyebab belum terbaca)**: balasan pemilik "sudah"
(08:38) tidak disertai bukti bayar; log justru memuat **3 charge gagal** 08:36–08:37 untuk
`TK-20261022-0005` dengan pesan umum yang sama (`storage/logs/laravel.log:5339-5341`). Titik gagalnya panggilan
charge ke Midtrans, bukan QR/DB/UI; kode tidak berubah sejak 07:32 dan host Midtrans terjangkau dari mesin ini,
jadi penyebab sebenarnya (401/400/5xx) **tidak bisa dibedakan** karena `chargeOrder()` membuang pesan SDK.
Kartu **B6 `t_1f72a2d1`** menambah detail itu ke log; G1 `t_fcfc3687` menunggu B6, lalu pemilik cukup
mengulang checkout sekali (halaman checkout biasa, bukan regenerate) dan techlead membaca penyebabnya.
Urutan sisa tidak berubah: **B6 → G1 `t_fcfc3687` → devops `t_fac8f5a3`**; QA2 `t_43d8bcd7` paralel. Status
tetap **No-Go sementara**.

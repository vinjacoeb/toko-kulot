# Asumsi — Toko Kulot

Asumsi baru ditambahkan di akhir daftar. Asumsi di sini bukan keputusan pemilik;
bila pemilik memutuskan lain, perbarui bagian terkait.

## Dari kartu K2 (kerangka proyek, DevOps)

**A-01 — Kerangka memakai Laravel 12.70.0, bukan Laravel 11 seperti PRD §4.1.**
Alasan: skeleton terpasang (12.70.0) sudah menjadi dasar kode yang ada (model `Admin`,
middleware `EnsureAdmin`, halaman Inertia, `bootstrap/app.php`), dan memasang ulang
versi 11 berarti menimpa proyek yang sudah berjalan. Seluruh API yang dipakai PRD
(routing, session guard, Eloquent, Inertia adapter) sama di kedua versi.
Dampak: tidak ada perubahan perilaku yang diketahui. Bila pemilik wajib versi 11,
kerangka harus dipasang ulang sebelum pekerjaan fitur berlanjut.

**A-02 — React 19.3.1 dan @inertiajs/react 3.9.1, bukan React 18 seperti PRD §4.1.**
Alasan: `@inertiajs/react` 3.9.1 mensyaratkan React ^19; menurunkan ke 18 akan
melanggar peer dependency dan memaksa penurunan Inertia juga. Kode halaman memakai
API React yang sama pada kedua versi.

**A-03 — Nama database memakai tanda hubung: `toko-kulot`.**
Diambil dari nama proyek karena PRD tidak menetapkan nama database. Query manual wajib
memakai backtick. Collation `utf8mb4_unicode_ci`.

**A-04 — `DB_USERNAME=root` pada `.env.example` sebagai contoh, bukan keputusan.**
Pemilik yang mengisi pengguna dan kata sandi MySQL sebenarnya di `.env`.

**A-05 — Disk unggahan default `public` (`FILESYSTEM_DISK=public`).**
Mengikuti PRD A7: gambar disimpan di `storage/app/public` dan disajikan lewat
symlink `public/storage`. Symlink sudah dibuat saat setup.

**A-06 — Rute admin memakai prefix `/admin` dengan name prefix `admin.`.**
PRD menyebut panel admin di `/admin` tetapi tidak menetapkan nama rute. Kartu K6
tinggal mengisi `routes/admin.php`; pendaftaran grup sudah disiapkan di
`bootstrap/app.php`.

**A-07 — Zona waktu, locale, dan faker locale ditetapkan di `config/app.php`.**
Bukan lewat `.env`, agar konsisten di semua mesin. Nilai: `Asia/Jakarta`, `id`, `id_ID`.

**A-08 — `MIDTRANS_FAKE=true` pada `.env.example`.**
Mode QRIS dummy tanpa kredensial untuk pengembangan; pemilik mematikan ini
(`false`) saat memakai akun Midtrans sungguhan.

## Dari kartu K4 (skema & model)

**A-K4-01 — Nullability dan aksi foreign key dipilih mengikuti sifat data.**
Riwayat transaksi tidak boleh hilang karena penghapusan data induk, jadi:
`orders.user_id` SET NULL, `order_items.product_id`/`product_variant_id` SET NULL,
`reviews.user_id` SET NULL, `stock_movements.admin_id` SET NULL. Data turunan murni
memakai CASCADE: `product_images`, `product_variants`, `stock_movements` (via varian),
`cart_items` (via cart), `order_items` (via order), `payments`, `reviews`.
`products.category_id` memakai RESTRICT agar kategori yang masih berisi produk tidak
terhapus diam-diam. `cart_items.product_id`/`product_variant_id` SET NULL supaya
keranjang tidak memblokir penghapusan produk.
Dampak: keranjang bisa berisi baris tanpa produk; K8 (keranjang) wajib menyaring
`product_id` null sebelum menghitung total.

**A-K4-02 — Status disimpan sebagai `varchar(20)`, bukan enum MySQL.**
Nilai tetap dibatasi di kode lewat konstanta `Order::STATUS_*` / `Order::PAYMENT_*`
dan `StockMovement::TYPE_*`. Alasan: menambah nilai enum MySQL menuntut ALTER TABLE
dan menyulitkan rollback; PRD §7 masih mungkin menambah status saat pengembangan.

**A-K4-03 — Tidak memakai soft delete di tabel mana pun.**
PRD §6 tidak menyebut kolom `deleted_at` pada tabel mana pun. Penghapusan produk
dilakukan lewat `is_active = false` (PRD §7.1) sehingga riwayat tetap utuh.

**A-K4-04 — Enum `admins.role` diperbaiki menjadi `owner|admin|staff`.**
Migrasi K2 hanya memuat `owner|staff`; PRD §6 mensyaratkan tiga peran. Perbaikan
dilakukan langsung di migrasi `000001` karena kartu ini kartu skema dan `migrate:fresh`
diizinkan DoD-nya. Bila ada data admin di mesin lain, jalankan `migrate:fresh`.

**A-K4-05 — `products.sku` nullable dan tidak unik; `product_variants.sku` wajib dan unik.**
PRD §6 hanya menyebut keunikan SKU pada varian. Produk tanpa varian tetap butuh
identitas, jadi `products.sku` disimpan opsional tanpa constraint unik.

**A-K4-06 — Tidak ada kolom di luar PRD §6.**
Seluruh kolom pada 17 tabel domain berasal dari tabel PRD §6 (termasuk
`products.rating_avg`/`rating_count`/`weight_gram`, `orders.customer_*` dan
`shipping_address`, `payments.qr_string`/`order_id_midtrans`/`payload`,
`contact_messages.ip`, `settings.type`/`label`). Yang tidak berasal dari §6 hanya
tabel bawaan kerangka: `sessions`, `cache`, `cache_locks`, `jobs`, `job_batches`,
`failed_jobs`, `password_reset_tokens`, `password_reset_tokens_admin`.
Tidak ada kolom spekulatif; DoD "tanpa kolom spekulatif" terpenuhi.

**A-K4-07 — Keranjang guest memakai `carts.session_id`.**
`carts.user_id` nullable + `session_id` (100) memungkinkan keranjang sebelum login
(PRD §7.2). Setelah login, K8 menggabungkan keranjang sesi ke keranjang pembeli.

**A-K4-08 — `password_reset_tokens_admin` dipertahankan walau tidak ada di PRD §6.**
Tabel ini dibuat K2 untuk guard `admin` (reset kata sandi pengelola). Tidak dihapus
karena sudah dipakai konfigurasi auth; dicatat sebagai tabel pendukung di luar §6.

## Asumsi K5 — Seeder (2026-10-20)

**A-K5-01 — 12 produk, 2 gambar per produk, varian = kombinasi ukuran × warna.**
PRD §16 meminta 12–24 produk; dipilih batas bawah (12) agar seed cepat dan cukup
untuk uji paginasi/filter. Setiap produk punya 2 gambar (gambar 1 `is_primary`) dan
varian dibentuk dari `sizes[]` × `colors[]` di konstanta `ProductSeeder` (total 36 varian),
SKU `{sku produk}-{ukuran}-{3 huruf warna}`.

**A-K5-02 — Sebaran stok contoh: 0, 3, dan 9–30 per varian.**
Satu produk (setelan lena panjang) sengaja berstok 0 agar UI punya kasus "Habis",
satu produk berstok 3 agar dashboard punya kasus stok kritis (< 5), sisanya 9–30.
Stok awal dibuat sebagai movement `in`, bukan tulis langsung ke `product_variants.stock`.

**A-K5-03 — Minimal qty grosir 6 pcs untuk daster/kulot dan 4 pcs untuk setelan.**
Angka ini mengikuti contoh di PRD §7.4 dan dipakai konsisten oleh `ProductSeeder`;
`Product::priceForQty()` tetap satu-satunya penentu harga, seeder tidak menghitung sendiri.

**A-K5-04 — Ongkos kirim default Rp20.000 diambil dari `settings.shipping_cost_default`.**
`OrderSeeder` membaca key tersebut dan baru memakai nilai cadangan 20000 bila key kosong,
sehingga mengubah setting tidak membuat total order seed tidak konsisten.

**A-K5-05 — Ulasan hanya untuk order berstatus selesai.**
PRD §7.5 membatasi ulasan pada pembelian selesai; `ReviewSeeder` memakai
`TK-20261015-0001`. Setelah seed, `products.rating_avg`/`rating_count` dihitung ulang
dari tabel `reviews` (bukan angka tetap) agar konsisten bila ulasan diubah.

**A-K5-06 — 19 key `settings` termasuk 5 key JSON; `midtrans_client_key` kosong.**
Key JSON: `header_nav`, `footer_links`, `footer_social`, `landing_hero`, `landing_sections`.
`midtrans_client_key` sengaja `''` karena nilainya diisi pemilik lewat panel admin;
`MIDTRANS_SERVER_KEY` tidak pernah masuk tabel `settings` (hanya `.env`).

**A-K5-07 — Gambar contoh dibuat lokal oleh seeder dengan GD.**
Ukuran: produk 800×800, kategori 600×800, carousel/hero/promo 1600×900, logo 240×64.
Warna diturunkan dari `crc32` nama berkas sehingga berkas sama tiap kali seed dijalankan.
Tidak ada unduhan aset dari internet (PRD §10). Ekstensi `gd` wajib aktif; bila tidak,
seeder melempar `RuntimeException` dengan pesan jelas.

**A-K5-08 — Password akun demo hanya berlaku di database lokal.**
Dicatat di `docs/akun-dev.md`, tidak pernah dikirim ke respons API atau log, dan wajib
diganti/dihapus sebelum data dipakai di server.

**A-K6-01 — Tidak ada rute lupa/reset sandi untuk admin.**
PRD §5.2 hanya menyebut login dan logout admin. Pemulihan sandi admin dilakukan pemilik lewat
`php artisan db:seed --class=AdminSeeder` atau Tinker, bukan lewat halaman publik. Bila nanti
diperlukan, tambah kartu baru (butuh broker reset + notifikasi terpisah).

**A-K6-02 — Login pembeli menolak email yang terdaftar di tabel `admins`.**
PRD §3 memisahkan pembeli dan pengelola. Email admin yang dicoba di `/login` dijawab
`Email atau kata sandi salah.` agar tidak membocorkan keberadaan akun pengelola.

**A-K6-03 — Batas percobaan masuk: 5/menit per kombinasi email + IP; tautan reset 3/menit per IP.**
PRD §11 mewajibkan pembatasan tanpa menyebut angkanya. Kunci memakai email+IP agar satu IP
kantor tidak saling memblokir; permintaan reset memakai IP saja karena email belum tentu valid.

**A-K6-04 — Nama komponen Inertia untuk halaman auth ditetapkan backend.**
`Public/Auth/Register`, `Public/Auth/Login`, `Public/Auth/ForgotPassword`,
`Public/Auth/ResetPassword`, `Admin/Login`, `Admin/Dashboard`. Frontend wajib memakai nama ini
(tercatat di `docs/kontrak-props.md` §6) agar rute tidak menunjuk komponen yang tidak ada.

**A-K6-05 — `admin.dashboard` hanya kerangka.**
Kartu K6 butuh target redirect setelah login. `DashboardController@index` mengirim
`stats` (jumlah order, order pending, omzet status lunas, produk aktif) langsung dari tabel;
kartu dashboard lanjutan boleh menambah key, tidak boleh mengubah bentuk yang sudah ada.

**A-K6-06 — Akun pembeli baru langsung aktif.**
`email_verified_at` diisi saat registrasi (PRD §14 A4: tanpa verifikasi email). Tidak ada
rute verifikasi email dan tidak ada rute pendaftaran admin.

**A-K6-07 — Test memakai SQLite in-memory lewat `phpunit.xml`.**
Database pengembangan MySQL tidak pernah disentuh test. Konsekuensi: `php artisan test` butuh
ekstensi `pdo_sqlite` (lihat `docs/langkah-pemilik.md` §7). Bila ekstensi tetap mati, jalankan
test dengan `PHPRC` yang menunjuk salinan `php.ini` yang mengaktifkannya.

**A-K7H-01 — `settings` dibagikan lewat `HandleInertiaRequests`, bukan props halaman beranda.**
Kontrak §1 sudah menyatakan begitu, tetapi kode belum mengirimnya (closure `/` hanya mengirim
`store_name` + `tagline` buatan). Middleware sekarang membaca tabel `settings` (satu query per
permintaan), men-decode nilai `type=json`, dan mengembalikan `{}` bila tabel belum ada. Akibatnya
header/footer dan batas seksi beranda memakai sumber yang sama di semua halaman.

**A-K7H-02 — Kategori tanpa produk aktif tidak dikirim ke beranda.**
Design §3.3 menyebut kategori kosong tidak dirender; penyaringan dilakukan di server agar frontend
tidak perlu tahu aturan itu. `product_count` hanya menghitung produk `is_active = true`.

**A-K7H-03 — Urutan dan batas produk unggulan ditetapkan backend.**
`featured[]` = produk aktif + `is_featured`, urut `rating_avg` turun, `rating_count` turun, `id` naik
(deterministik, tanpa `RAND()`). Jumlahnya mengikuti `settings.landing_sections.featured.limit`
(bawaan 8) dan dijepit 1..24 agar salah isi pengaturan tidak membanjiri beranda.

**A-K7H-04 — `stock` produk = total stok varian aktif; `rating_avg` dikirim sebagai angka.**
Stok hidup di `product_variants` (PRD §6, A9), jadi kartu produk memakai `SUM(stock)` varian
`is_active = true` (`0` = habis). Cast `decimal:2` mengembalikan string, jadi `rating_avg`
dikonversi ke float di `ProductPresenter` agar sesuai kontrak §8.3 ("angka, bukan string").

**A-K7H-05 — FAQ beranda maksimal 6 baris, `answer` dikirim sebagai teks biasa.**
Design §3.3 butir 8 membatasi 6 item. Teks tidak diubah menjadi HTML; frontend merender sebagai teks
sehingga tidak ada jalur XSS dari isian admin.

## K8 — Keranjang & checkout QRIS (2026-10-20)

1. **Checkout wajib login.** PRD §5.1 langkah 3 menyebut checkout setelah login; tamu yang menekan
   "Checkout" diarahkan ke `/login` dengan intended URL, bukan mengisi data sebagai tamu. Keranjang
   sendiri tetap boleh diisi tanpa login (PRD §5.1 langkah 2).
2. **Email & kode pos wajib.** PRD hanya mendaftar field form; keduanya dijadikan wajib (email untuk
   bukti pesanan, kode pos untuk pengiriman) dan dikunci di kontrak props §7.6.
3. **Ongkir tunggal.** Belum ada tabel ongkir per wilayah, jadi `settings.shipping_cost_default`
   dipakai untuk semua pesanan; ongkir 0 bila key belum diisi.
4. **Kedaluwarsa QRIS 15 menit** (`config/midtrans.expiry_minutes`) mengikuti default QRIS Midtrans.
5. **Harga grosir** dihitung ulang setiap qty berubah memakai `products.priceForQty()`; snapshot
   `order_items.unit_price` dibekukan saat checkout.
6. **Stok dikembalikan** saat pembayaran `expire`/`deny`/`cancel` lewat `StockService` (tipe
   `stock_movements` pembalik), bukan dihapus.
7. **Kode pesanan `TK-YYYYMMDD-NNNN`** diambil dari PRD A10/docs/db.md; urutan harian, retry bila bentrok.

## K11 — Katalog publik `/produk`, detail, kontak (2026-10-20)

1. **Bentuk props detail mengikuti frontend yang sudah terlanjur dibangun (commit 15241a1), bukan
   daftar di body kartu.** Body kartu menyebut `rating_summary {average,total,distribution}` dan
   `wholesale_tiers[]`, sedangkan kode React membaca key datar: `rating_avg`, `rating_count`,
   `rating_distribution`, `wholesale_price`, `min_wholesale_qty`. Dipilih bentuk datar (tanpa
   membungkus ulang) supaya halaman langsung bisa dirender dan tidak ada key mati;
   `docs/kontrak-props.md` §8.3 + §11 ditulis sesuai bentuk itu dan berstatus LOCKED.
2. **`variants[]` memakai key `{id, size, color, sku, price_delta, stock, is_active}`**, bukan
   `{id, label, color, size, stock, price}` di body kartu — `Show.jsx` membaca `size`, `color`,
   `stock`, `price_delta`/`sku` untuk memilih varian dan menambah ke keranjang.
3. **`contact_hours` tidak dibuat** (disebut opsional di body kartu): tidak ada satu pun kode React
   yang membacanya, dan menambah key tanpa pemakai hanya menambah beban seeder. Jam operasional
   ditampilkan dari `settings.contact_*` yang sudah dibagikan `HandleInertiaRequests`.
4. **`wholesale_tiers[]` tidak dibuat** karena harga grosir dihitung `products.priceForQty()` di
   server saat keranjang/checkout (sudah ada dari K8); frontend hanya menampilkan
   `wholesale_price` + `min_wholesale_qty`.
5. **Slug numerik di `/produk/{slug}` dicari dulu sebagai slug, lalu fallback ke `products.id`**
   sesuai PRD §14.1 butir 1; bila keduanya tidak ada → halaman detail dengan `product: null` +
   `error` dan status HTTP 404 (kontrak §11.2).
6. **Nilai filter tidak sah diabaikan, bukan galat** (`kategori=Bukan Slug!`, `harga_min=abc`,
   `urut=ngawur`, `ukuran` di luar daftar): halaman tetap 200 dengan filter kosong/nilai bawaan
   (kontrak §11.1). `harga_min > harga_max` ditukar otomatis.
7. **`filters.ukuran` dikirim sebagai string koma ternormalisasi** (`"M,XL"`) dan `null` bila kosong,
   mengikuti cara `Index.jsx` membangun query string (`buildParams`), bukan array.
8. **Test katalog tidak memakai factory baru.** `database/factories` hanya punya `AdminFactory` dan
   `UserFactory`; data uji `Category`/`Product`/`ProductVariant`/`Review`/`Order` dibuat langsung di
   dalam test dengan penanda `[CONTOH]` (rencana awal menyebut factory baru — dibatalkan agar tidak
   menambah berkas tanpa pemakai lain).

## K12 — panel admin produk, kategori, stok, pesanan, akun (`t_ed8bd8e4`)

1. **Kosakata status pesanan memakai nilai kolom apa adanya**: `pending` → `dibayar` → `diproses` →
   `dikirim` → `selesai`, ditambah `batal` (`docs/db.md:91`, PRD §7). Tidak ada nilai terjemahan baru.
2. **Filter tidak sah diabaikan**, bukan galat: `status`, `kategori`, dan `urut` di luar daftar kembali ke
   nilai bawaan (`semua`), dan `q` dicari pada nama/slug/SKU/kode dengan `like` (pola sama seperti §11.1).
3. **Batas stok kritis = 5** (PRD §9: `stok < 5` kritis). Baris tabel stok dikelompokkan `habis` (0),
   `kritis` (1–4), `aman` (>=5) sesuai kontrak §12.12.
4. **Semua perubahan stok lewat `StockService`** (`increase`, `decrease`, `adjustTo`) di dalam transaksi
   dengan `lockForUpdate`, termasuk sinkron stok varian saat produk dibuat/diubah, sehingga
   `stock_movements` selalu terisi.
5. **Penyesuaian `adjust` hanya dipakai internal** (sinkron stok varian produk) dengan nilai = jumlah
   akhir, bukan selisih. PRD §5.2 tidak meminta rute `admin.stocks.adjust`, jadi rute itu tidak dibuat;
   `admin.stocks.in` dan `admin.stocks.out` menolak jumlah di bawah 1 (`Jumlah minimal 1.`) dan tidak
   menulis riwayat bila gagal.
6. **Slug produk/kategori dibuat otomatis dari nama** bila field slug kosong (`Str::slug`), diberi akhiran
   `-2`, `-3`, … bila bentrok; bila slug tidak bisa dibuat, permintaan ditolak dengan pesan
   `Slug tidak bisa dibuat dari nama produk — isi slug manual.` (produk) atau
   `Slug tidak bisa dibuat dari nama kategori — isi slug manual.` (kategori).
7. **Akun admin**: peran `owner|admin|staff`; akun sendiri tidak boleh dinonaktifkan atau dihapus; harus
   tersisa minimal satu `owner` aktif; password hanya wajib saat membuat akun (kosong = tidak diubah).
8. **Ubah status pesanan divalidasi di service** (`OrderStatusException`), FormRequest hanya memeriksa
   daftar nilai; pembatalan menambah satu catatan stok `in` per varian atas nama petugas dengan catatan
   `Pembatalan <kode pesanan>` (+ catatan petugas bila diisi).
9. **Paginasi 15 baris/halaman** dengan bentuk baku `meta = {current_page,last_page,per_page,total}`
   (kontrak §12.0); `filter` selalu memuat seluruh key, nilai kosong `null`.

## Tambahan — verifikasi rilis DevOps (t_56a2d29c, 2026-10-20)
10. **DoD §15.1 diverifikasi pada database uji terpisah** `toko_kulot_rilis_check` (dibuat dengan `CREATE DATABASE`
    mengikuti collation PRD), bukan pada database dev pemilik. Database dev `toko-kulot` diperlakukan sebagai data
    pemilik yang tidak boleh diubah.
11. **Kredensial pembeli dan admin tidak tersedia bagi DevOps** (berkas `.env` pemilik tidak dibuka). Karena itu
    alur login, checkout QRIS, dan pengelolaan data admin tidak diuji end-to-end oleh DevOps dan diserahkan ke
    pemilik/QA; yang diuji hanya halaman GET tanpa login.
12. **`php artisan test` dijalankan pada sqlite `:memory:`** melalui `PHP_INI_SCAN_DIR` sementara, agar php.ini global
    dan `.env` pemilik tidak tersentuh. Hasilnya bisa berbeda dari menjalankan suite pada MySQL milik pemilik.
13. **Build produksi tidak diulang terus-menerus.** Build dijalankan sekali setelah kartu frontend K16 selesai;
    karena kartu lain masih menulis berkas setelahnya, build penutup + smoke 3 viewport diulang setelah semua kartu
    berhenti (bukan setiap kali ada satu berkas berubah).

## Tambahan — halaman Admin/Pesan Masuk (t_fc2c5b98, 2026-10-20)
14. **Tone badge status baca tidak ditetapkan dokumen desain.** §5.12 hanya menetapkan "Detail pesan: isi pesan,
    textarea balasan, 'Tandai dibaca'", dan §4.21 hanya memetakan badge ke status pesanan/ulasan. Halaman pesan
    masuk memakai bentuk kelas baku §4.21 `bg-{token}/10 text-{token}` dengan `warning` = "Belum dibaca" dan
    `success` = "Sudah dibaca"; tidak ada warna atau token baru di JSX. Bila UIUX menetapkan tone lain, cukup ganti
    pemetaan `tone` pada halaman ini dan `StatusBadge` dipakai bersama.
    **Dijawab UIUX 20 Okt 2026 (kartu `t_8cd61512`)**: bentuk baku `bg-{token}/10 text-{token}` diganti
    `bg-{token}/10 text-{token}-strong` (§4.21 v2.1) karena `warning` hanya 2,86:1 dan `success` 2,96:1 di atas tint.
    Tone tetap `warning` = "Belum dibaca", `success` = "Sudah dibaca"; `neutral` (`bg-slate-200/60 text-slate-600`, 6,17:1 terendah atas 4 latar uji)
15. **Ringkasan inbox ditampilkan sebagai baris meta, bukan KPI.** Props `ringkasan.{total,belum_dibaca}`
    (kontrak §10.1) wajib tampil, sedangkan §5.12 tidak menentukan bentuknya; dipilih satu baris meta
    "Total N pesan · M belum dibaca" di bawah judul, konsisten dengan pola daftar admin lain. Nilai string dari
    server dikonversi `Number(x ?? 0)` lalu diformat `formatNumber`, sehingga tidak pernah `NaN`/`undefined`.
16. **Paginator pada kontrak §10.1 (`links` + `meta`) berbeda dari yang dikirim controller** (paginator Laravel
    datar). Halaman membaca keduanya (`readPaginator`) sehingga tetap benar terhadap kedua bentuk; penyelarasan
    kontrak perlu keputusan backend/Tech Lead (dicatat di `docs/catatan-frontend-admin.md`).
17. **`Badge` (katalog komponen §1) belum ada di repo; dibuat di kartu `t_67576fb2`.** Kontrak hanya menetapkan
    `tone` + `children`, jadi `tone` bawaan dipilih `brand` dan tone di luar daftar
    (`brand|accent|sale|success|warning|danger`) jatuh ke `brand` — satu-satunya tone yang lolos ambang 4,5:1 di
    seluruh latar uji §11.4. Prop `className` ditambahkan agar seragam dengan komponen lain (mis. `StatusBadge`).
    Komponen belum dipakai halaman mana pun; bila UIUX menghendaki tone bawaan atau fallback lain, cukup ubah
    satu baris di `resources/js/Components/Badge.jsx`.

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
4. ~~**Kedaluwarsa QRIS 15 menit** (`config/midtrans.expiry_minutes`) mengikuti default QRIS Midtrans.~~
   **Digantikan keputusan pemilik 21 Oktober 2026** (`docs/pertanyaan-pemilik.md` §5 P1): **5 menit**,
   dibaca dari `MIDTRANS_EXPIRY_MINUTES` (bawaan 5 bila kosong/tidak sah) lewat
   `MidtransService::expiryMinutes()` sebagai satu sumber nilai; kartu `t_e35050e8`.
   PRD §8 butir 6 + A17 masih menulis 15 menit dan menunggu amendemen pemilik.
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

18. **Teks penanda mode uji Midtrans belum ada di `docs/design.md`; teks baku ditetapkan kontrak** (kartu `t_9f4b6aee`).
    `docs/design.md` §865 (D9) hanya menetapkan bentuk penanda (komponen lama `InlineNotice`/`StatusBadge`, tanpa
    token baru) dan tidak menulis kalimatnya. Agar frontend tidak mengarang teks, backend mengirim kalimat siap
    tampil di props `midtrans.alasan` (contoh: "MODE UJI aktif karena MIDTRANS_FAKE=true di .env: QRIS dibuat lokal
    (tanpa Midtrans) sehingga tidak bisa ditransfer.") beserta `midtrans.alasan_kode` (`fake_aktif` | `server_key_kosong`),
    `midtrans.langkah_perbaikan[]`, dan `pembayaran.galat` ("Gagal membuat pembayaran QRIS. Coba lagi.") — semuanya
    terdaftar di `docs/kontrak-props.md` §7.5/§7.7/§10.7. Bila UIUX/pemilik ingin kalimat lain, ubah di satu tempat
    (`MidtransService::MODE_REASONS`/`MODE_FIX_STEPS`) lalu kontraknya.

19. **Bawaan `MIDTRANS_FAKE` diubah dari `true` ke `false`** (kartu `t_9f4b6aee`, temuan F-2 `docs/review.md`).
    `docs/PRD.md` hanya menyebut "mode uji" sebagai kemungkinan, tidak menetapkan bawaannya; `.env.example` sendiri
    sudah menulis `MIDTRANS_FAKE=false`. Bawaan `true` membuat QRIS mode uji ikut terpakai tanpa sepengetahuan pemilik
    (QR tampil, tidak bisa ditransfer) — itulah keluhan pemilik butir 2. Tanpa `MIDTRANS_SERVER_KEY`, `isFake()` tetap
    `true` (`alasan_kode = server_key_kosong`), jadi pengembangan tanpa kredensial tetap berjalan seperti sebelumnya.
    Bila pemilik menghendaki bawaan lain, cukup ubah satu baris di `config/midtrans.php` + `.env.example`.

20. **Kolom resi memakai nama `tracking_number`, rutenya `PATCH /admin/pesanan/{order}/resi`** (kartu `t_394b40ba`).
    `docs/PRD.md` A15 (`docs/PRD.md:391`) mewajibkan nomor resi diisi manual, tetapi PRD §5.2/§6 belum memuat
    rute maupun kolomnya, dan `docs/kontrak-props.md` §12.17 belum punya fieldnya. Karena rute + kolom adalah
    cara teknis (bukan fitur baru di luar dokumen acuan), techlead menaruhnya di kontrak baru §12.18a +
    `docs/db.md` baris 32/88 dan **tidak** mengubah `docs/PRD.md`: menambah baris di §5.2/§6 akan menggeser
    nomor baris PRD yang dirujuk dokumen lain (`docs/PRD.md:219`, `:255`, `:377`, `:391`). Amendemen PRD
    diminta lewat `docs/pertanyaan-pemilik.md` §3 Q8 (tidak memblokir). Nama `tracking_number` dipilih karena
    pola penamaan tabel `orders` memakai bahasa Inggris (`payment_status`, `customer_name`, `paid_at`), dan
    resep serupa di `docs/kontrak-props.md` memakai istilah Inggris untuk field teknis. Bila pemilik ingin
    resi tampil di sisi pembeli atau lacak otomatis, itu usulan U5 + amendemen PRD §5.1/§6 lebih dulu.

21. **Lebar tombol "Sinkronkan status pembayaran" dikunci `min-w-[16rem]` (256 px)** (kartu `t_8e89556f`).
    D13 (`docs/design.md:872`) mewajibkan "lebar dikunci agar layout tidak melompat" tetapi tidak menyebut
    nilainya, dan tombol ini belum punya acuan tampilan lain. Dipilih `16rem` karena label beku
    "Sinkronkan status pembayaran" (±230 px pada `text-body`) masih muat satu baris di dalam kartu
    "Bukti pembayaran" pada lebar 360 px tanpa memotong teks, dan tombol setinggi 47 px (§4.1) tetap
    proporsional. Kelas ini dihasilkan Tailwind proyek — dibuktikan `.min-w-\[16rem\]{min-width:16rem}`
    pada CSS hasil `npm run build` (`docs/bukti-frontend-t_8e89556f.txt` bagian I). Tanpa token atau
    komponen baru; bila UI/UX menetapkan angka lain, cukup ubah satu kelas di `SyncPaymentButton.jsx`.

22. **Hex warna varian diturunkan dari nama, bukan kolom baru** (kartu `t_bc89df6d`).
    `docs/PRD.md` §6 dan `docs/db.md` tidak memuat kolom hex pada `product_variants`, sementara
    `docs/design.md` §4.20 meminta swatch berwarna dan `Show.jsx` sudah membaca `variant.color_hex`.
    Agar tidak menambah kolom di luar dokumen acuan (dan tidak perlu isian admin baru), `color_hex`
    dihitung server dari `product_variants.color` lewat peta baku `app/Support/VariantColor.php`
    (nama Indonesia/Inggris; isian `#RGB`/`#RRGGBB` diteruskan). Nama tak dikenal → `null`; frontend
    memakai lingkaran netral + label nama. Bila pemilik kelak butuh warna persis per varian, perlu
    kolom `color_hex` + input admin + amendemen `docs/db.md`/PRD §6 lebih dulu.

23. **Grafik `sales_14d` memakai tanggal order dibuat (`created_at`), bukan `paid_at`** (kartu `t_1ef89050`).
    `docs/PRD.md` §9 hanya menyebut "grafik penjualan 14 hari" tanpa kolom acuan, dan `docs/design.md`
    tidak merincinya. Dipilih `created_at` karena: (a) konsisten dengan `recent_orders` yang juga urut
    tanggal order; (b) tidak ada order berstatus omzet tanpa `created_at`, sedangkan `paid_at` bisa `null`
    untuk order yang di-seed langsung berstatus selesai; (c) dapat diverifikasi ulang dengan satu query
    `SUM(total) GROUP BY DATE(created_at)` pada rentang yang sama. Status yang dihitung tetap mengikuti
    `Order::REVENUE_STATUSES` (dibayar/diproses/dikirim/selesai). Bila pemilik ingin omzet berdasarkan
    tanggal pembayaran, cukup ganti kolom di `DashboardService::salesLast14Days()` + tambah test.

24. **"Stok kritis" dashboard = varian aktif dari produk aktif dengan `stock < 5`, termasuk stok 0,
    maksimal 5 baris** (kartu `t_1ef89050`). PRD §9 menulis "stok kritis (< 5)" dan `docs/design.md`
    §5.11 meminta 5 baris; tidak disebut apakah stok 0 (habis) ikut. Stok 0 ikut ditampilkan karena
    justru paling kritis dan admin perlu restock; varian/produk nonaktif dikeluarkan agar tidak
    menghasilkan pekerjaan restock palsu. Batas 5 baris diambil dari design, bukan dari PRD.
    Halaman `/admin/stok` tetap punya filter "habis" terpisah — dashboard tidak mengubahnya.

25. **"Ulasan terbaru" dashboard memuat ulasan tersembunyi (`is_visible = false`)** (kartu `t_1ef89050`).
    PRD §9 meminta "5 ulasan terbaru" untuk admin, dan alasan admin melihatnya adalah Moderasi
    (PRD §5.2 `admin.reviews`). Menyembunyikan ulasan `is_visible = false` dari dashboard akan membuat
    admin tidak tahu ada ulasan yang perlu ditinjau. Halaman publik tetap memakai scope `visible`.

26. **Dashboard dihitung ulang setiap request; `updated_at` = waktu snapshot, bukan waktu data berubah**
    (kartu `t_1ef89050`). Tidak ada cache/tabel agregat di PRD, dan bug "data tidak sinkron" berasal dari
    props yang tidak dikirim — bukan cache. `updated_at` dipakai label "Diperbarui …" di frontend; karena
    tidak ada cache, label ini selalu menunjukkan waktu render halaman. `loading`/`error` pada
    `Admin/Dashboard.jsx` adalah state klien, jadi tidak dikirim server (dibiarkan memakai nilai bawaan).

27. **`enabled_payments: ["other_qris"]` (PRD §8) tidak lagi dikirim untuk kanal QRIS bawaan** (kartu
    `t_2f443b75`, 22 Okt 2026). Itu parameter Snap; Core API memilih kanal lewat `qris.acquirer`, dan
    kombinasi `acquirer = gopay` + `enabled_payments = ["other_qris"]` dijawab Midtrans
    **402 "Payment channel is not activated"** (9 kegagalan nyata di `storage/logs/laravel.log`).
    Kanal bawaan `gopay`; `MIDTRANS_QRIS_ACQUIRER` (bawaan `gopay`) boleh diisi `other_qris`, dan bila
    Midtrans menjawab 402 server mencoba kanal satunya sekali dengan `qris.acquirer` +
    `enabled_payments` yang konsisten. PRD tidak diubah; ini penyimpangan teknis yang dicatat, bukan
    aturan bisnis baru.

28. **Cadangan QRIS wajib acquirer Core API sah; `other_qris` hanya alias config** (kartu `t_56062a5c`,
    22 Okt 2026). Core API `payment_type: qris` hanya menerima `qris.acquirer` `gopay` atau `airpay shopee`
    (docs.midtrans.com/reference/qris); `other_qris` adalah metode Snap dan dijawab
    **413 "Payload format is not supported"**. Nilai config lama `MIDTRANS_QRIS_ACQUIRER=other_qris`
    dipetakan ke `airpay shopee` supaya instalasi lama tidak perlu diubah pemilik; `enabled_payments`
    tidak pernah dikirim lagi. Bila percobaan pertama 402 lalu cadangan gagal dengan galat lain, pesan
    akhir tetap `CHANNEL_INACTIVE_MESSAGE` (kanal QRIS belum aktif) — galat cadangan tidak boleh menutupi
    diagnosis yang hanya bisa diperbaiki pemilik. Menggantikan bagian butir 27 yang menyebut `other_qris`
    sebagai kanal cadangan.

29. **Riwayat pesanan: 10 per halaman dan `detail_url` boleh `null`** (kartu `t_5b803c80`, 23 Okt 2026).
    `docs/rencana-perbaikan-5.md` hanya meminta halaman riwayat; jumlah per halaman tidak ditetapkan,
    dipilih **10** agar konsisten dengan daftar pesanan admin. PRD tidak punya rute detail pesanan
    pembeli, jadi `detail_url` hanya diisi `/checkout/{id}/bayar` (status `pending` +
    `payment_status = pending`) dan `/checkout/{id}/selesai` (`payment_status = settlement`); status
    lain — termasuk `batal` — bernilai `null` dan kartu pesanan tetap tampil lengkap tanpa tautan.

30. **Favicon dan copyright footer boleh kosong** (kartu `t_101b9145`, 23 Okt 2026). PRD §6 tidak
    menyebut `store_favicon`/`footer_copyright`; keduanya ditambahkan karena
    `docs/rencana-perbaikan-5.md` memintanya. `store_favicon` kosong → tag icon memakai
    `/favicon.ico` (seeder menulis ICO 32×32 hanya bila belum ada/0 byte, tidak menimpa unggahan
    pemilik). `footer_copyright` kosong/null → frontend memakai `© {tahun berjalan} {store_name}`;
    batas 200 karakter. Props publik `settings` tidak pernah memuat `midtrans_client_key` maupun
    `midtrans_is_production` (keduanya tetap bisa diubah lewat panel admin, tetapi bukan data publik).

31. **Microcopy katalog lazy scroll di luar `docs/design.md` §5.2** (kartu `t_ed78d5c6`, 23 Okt 2026).
    §5.2 hanya menetapkan empty "Produk tidak ditemukan" + tombol "Reset filter"; `docs/rencana-perbaikan-5.md`
    menetapkan tombol "Muat lebih banyak". Teks pelengkap dipilih sendiri: "Menampilkan {n} dari {total} produk",
    "Memuat produk…", "Semua produk sudah tampil", empty tanpa filter "Belum ada produk" / "Produk akan tampil di
    sini setelah tersedia.", galat "Gagal memuat produk" + "Periksa koneksi Anda lalu coba lagi.", dan galat batch
    "Gagal memuat produk berikutnya. Periksa koneksi Anda lalu coba lagi.". Ini teks UI, bukan aturan bisnis; boleh
    diganti pemilik tanpa mengubah perilaku.

32. **Microcopy riwayat pesanan dan menu profil di luar `docs/design.md`** (kartu `t_326f766b`, 23 Okt 2026).
    `docs/rencana-perbaikan-5.md` meminta halaman `/history` dan menu profil (nama user, tautan
    "Riwayat pesanan", "Keluar") tetapi `docs/design.md` tidak punya layar riwayat maupun dropdown profil.
    Judul halaman "Riwayat Pesanan"; subjudul "{n} pesanan tercatat di akunmu." hanya tampil bila total > 0;
    saat kosong, `EmptyState` "Belum ada pesanan" + tombol "Mulai Belanja" → `/produk` yang memandu;
    galat paginasi "Riwayat pesanan gagal dimuat" + tombol "Coba lagi". Label CTA detail memakai microcopy
    design yang sudah ada: "Lihat Pesanan" (state `paid`, §4.4) dan "Lanjut ke Pembayaran" (ringkasan
    `/keranjang`, §5.6); tautan hanya dirender
    bila `detail_url` tidak `null` (kontrak §13). Label "Pembayaran: {payment_label}" memakai
    `payment_label` server apa adanya. Menu profil header memakai nama/email dari `auth.user`; ikon tetap
    ikon (bukan nama), panel turun di bawah ikon agar tidak menutupi ikon. Ini teks dan tata letak UI,
    bukan aturan bisnis; boleh diganti pemilik tanpa mengubah perilaku.

33. **Teks bantuan isian copyright di panel admin** (kartu `t_c915c033`, 23 Okt 2026). Label isian
    mengikuti kartu: "Copyright notice". `docs/design.md` tidak mengatur layar Pengaturan admin, jadi
    judul kartu "Copyright", deskripsi "Teks hak cipta di baris paling bawah footer halaman pembeli.",
    dan hint "Kosongkan agar otomatis menjadi © {tahun} {nama toko}. Placeholder {tahun} dan {toko}
    diisi otomatis." dipilih sendiri. Perilaku dan batas 200 karakter mengikuti kontrak §10.7/§10.8;
    teks ini hanya membantu admin dan tidak mengubah aturan bisnis.
34. **Midtrans Snap menggantikan Core API QRIS** (kartu `t_04da18e0`, 24 Okt 2026). PRD-v1.1 §2/D1
    meminta semua kanal yang aktif di akun merchant tampil; Snap `POST /snap/v1/transactions` dipakai
    tanpa `enabled_payments` (asumsi #27 tetap berlaku: daftar kanal diatur di dashboard Midtrans).
    `payments.payment_type` tidak tersedia saat transaksi dibuat — nilainya diisi dari payload webhook,
    sehingga `orders.payment_method` bernilai `midtrans` sampai settlement dan berubah menjadi tipe kanal
    asli (`bank_transfer`, `echannel`, `qris`, `gopay`, …) saat settlement. `qris_url`/`qr_string` tidak
    lagi diisi jalur asli; keduanya tinggal dipakai mode uji (QRIS dummy) dan baris lama.

## Kartu t_f22c8d46 — ongkir Biteship (24 Okt 2026)

- Mode `fake` dipakai saat `BITESHIP_API_KEY` kosong; tarifnya `settings.shipping_cost_default`
  (sudah ada sejak kartu keranjang) dan **bukan** key baru. Nilai 0 berarti ongkir gratis;
  pemilik mengubahnya di `/admin/ekspedisi`.
- `shipping_cost_default` tetap bergrup `pembayaran` di registry setting agar tab Pembayaran
  tidak kehilangan field; halaman Ekspedisi menyunting nilai yang sama.
- Label layanan kurir opsional di form admin (kontrak §10.13); kosong → dipakai kode layanan
  huruf besar supaya checkout tetap punya teks.
- Mode `fake` tanpa pilihan kurir menyimpan `shipping_courier = null` + tarif datar, agar alur
  checkout lama (dan test lama) tetap jalan tanpa memanggil Biteship.
- Tombol "Hubungi Penjual" pada galat pembayaran (design-v1.1 §7.5) menaut ke halaman
  `/kontak-kami` — rute kontak publik yang sudah ada; design tidak menyebut nomor WhatsApp langsung.
- Peta kode galat rates Biteship (kartu `t_1b711d26`): `40001001` → pesan kode pos (menyebut
  kemungkinan kode pos tujuan salah dan saran hubungi penjual, karena Biteship tidak membedakan
  kode pos asal/tujuan), `40001002` → pesan pengaturan Biteship belum lengkap (masalah akun/key
  di sisi pemilik, bukan pembeli), `40001010` → memakai pesan lama
  `Tidak ada layanan kurir untuk kode pos ini. Coba kode pos lain.` (`BiteshipService::GALAT_TANPA_KURIR`).
  Kode lain dan jawaban tanpa `code` tetap `GALAT_API`; `docs/design.md` tidak memuat teks ini,
  jadi teks ditulis di service + kontrak §7.12.
- `40001007` (J&T Cargo wajib `items[].value`) sengaja tidak dipetakan khusus: kurir seed bukan
  `jntcargo`, dan body permintaan sudah mengirim `value` per item → jatuh ke `GALAT_API`.
- 24 Okt 2026 (kartu `t_1b711d26`): Biteship juga membalas `400` dengan `error`
  `No sufficient balance to call rates API…` dan `code` `null`. Karena halaman error resmi Biteship
  tidak mencantumkan `code` untuk kasus saldo, pesan `GALAT_SALDO` dideteksi dari kata `balance` di
  `error` (case-insensitive), bukan dari kode. Bila Biteship kelak memberi `code` untuk kasus ini,
  tambahkan pasangan kode di `pesanGalat()` dan baris tabel kontrak §7.12.

# Skema Database — Toko Kulot

Sumber: `docs/PRD.md` §6 (nama tabel & kolom) + §7 (nilai status). Dokumen ini
adalah acuan nama tabel/kolom untuk semua kartu backend berikutnya.
Database: MySQL 8, nama `toko-kulot` (backtick saat query manual).
Semua uang = integer rupiah tanpa desimal. Semua tabel: `id` bigint auto-increment + `timestamps`.

## 1. Urutan migrasi

| # | Berkas migrasi | Tabel |
|---|---|---|
| 1 | `0001_01_01_000000_create_users_table` | `users`, `password_reset_tokens`, `sessions` (bawaan Laravel) |
| 2 | `0001_01_01_000001_create_cache_table` | `cache`, `cache_locks` |
| 3 | `0001_01_01_000002_create_jobs_table` | `jobs`, `job_batches`, `failed_jobs` |
| 4 | `2026_10_20_000001_create_admins_table` | `admins`, `password_reset_tokens_admin` |
| 5 | `2026_10_20_000002_add_profile_columns_to_users_table` | kolom profil pada `users` |
| 6 | `2026_10_20_000003_create_categories_table` | `categories` |
| 7 | `2026_10_20_000004_create_products_table` | `products` |
| 8 | `2026_10_20_000005_create_product_images_table` | `product_images` |
| 9 | `2026_10_20_000006_create_product_variants_table` | `product_variants` |
| 10 | `2026_10_20_000007_create_stock_movements_table` | `stock_movements` |
| 11 | `2026_10_20_000008_create_carts_table` | `carts` |
| 12 | `2026_10_20_000009_create_cart_items_table` | `cart_items` |
| 13 | `2026_10_20_000010_create_orders_table` | `orders` |
| 14 | `2026_10_20_000011_create_order_items_table` | `order_items` |
| 15 | `2026_10_20_000012_create_payments_table` | `payments` |
| 16 | `2026_10_20_000013_create_reviews_table` | `reviews` |
| 17 | `2026_10_20_000014_create_contact_messages_table` | `contact_messages` |
| 18 | `2026_10_20_000015_create_settings_table` | `settings` |
| 19 | `2026_10_20_000016_create_carousels_table` | `carousels` |
| 20 | `2026_10_20_000017_create_faqs_table` | `faqs` |
| 21 | `2026_10_20_000018_add_compare_price_to_products_table` | kolom `compare_price` pada `products` (K11) |
| 22 | `2026_10_21_000019_add_tracking_number_to_orders_table` | kolom `tracking_number` pada `orders` (PRD A15) |
| 23 | `2026_10_24_000001_add_snap_columns_to_payments_table` | kolom `snap_token`, `snap_redirect_url`, `payment_type` pada `payments` (Snap, kartu `t_04da18e0`) |
| 24 | `2026_10_24_000002_add_shipping_columns_to_orders_table` | kolom `shipping_courier`, `shipping_service`, `shipping_etd`, `shipping_weight_gram`, `shipping_is_free` pada `orders` |
| 25 | `2026_10_24_000003_add_biteship_columns_to_orders_table` | kolom `biteship_order_id`, `shipping_status`, `shipping_payload` pada `orders` (Biteship) |
| 26 | `2026_10_24_000004_add_shipped_at_to_orders_table` | kolom `shipped_at` pada `orders` (kartu `t_f4a75237`) |
| 27 | `2026_10_24_000005_add_shipping_webhook_columns_to_orders_table` | kolom `shipping_updated_at`, `shipping_webhook_payload` pada `orders` (webhook Biteship, kartu `t_2c6be520`) |
| 28 | `2026_10_26_000006_add_shipping_events_to_orders_table` | kolom `shipping_events` (json null) pada `orders` (timeline pembeli, PRD-v1.4 §4.1, kartu `t_f51f8c36`) |

## 2. Tabel & kolom

### users (pembeli, guard `web`)
`id`, `name`, `email` (unique), `email_verified_at`, `password`, `phone` (30, null),
`address` (text, null), `city` (100, null), `postal_code` (10, null), `remember_token`, `timestamps`.

### admins (pengelola, guard `admin`)
`id`, `name`, `email` (unique), `email_verified_at`, `password`,
`role` enum(`owner`,`admin`,`staff`) default `staff`, `is_active` bool default true,
`remember_token`, `timestamps`.

### categories
`id`, `name` (120), `slug` (140, unique), `description` (text, null), `image` (null),
`sort_order` uint default 0, `is_active` bool default true, `timestamps`.
Index: (`is_active`,`sort_order`).

### products
`id`, `category_id` → `categories` **RESTRICT**, `name` (180), `slug` (200, unique),
`sku` (60, null), `description` (longText, null), `short_description` (500, null),
`base_price` ubigint default 0, `compare_price` ubigint null (harga coret, K11), `wholesale_price` ubigint null,
`min_wholesale_qty` uint default 0, `weight_gram` uint default 0,
`is_active` bool default true, `is_featured` bool default false,
`rating_avg` decimal(3,2) default 0, `rating_count` uint default 0, `timestamps`.
Index: (`category_id`,`is_active`), (`is_active`,`is_featured`).

### product_images
`id`, `product_id` → `products` **CASCADE**, `path`, `alt` (180, null),
`sort_order` uint default 0, `is_primary` bool default false, `timestamps`.

### product_variants (stok hidup di sini)
`id`, `product_id` → `products` **CASCADE**, `size` (30, null), `color` (40, null),
`sku` (60, **unique**), `price_delta` int default 0, `stock` uint default 0,
`is_active` bool default true, `timestamps`.

### stock_movements
`id`, `product_variant_id` → `product_variants` **CASCADE**,
`type` string(10) (`in`|`out`|`adjust`|`sale`), `qty` int, `note` (255, null),
`admin_id` → `admins` **SET NULL** (nullable), `timestamps`.

### carts
`id`, `user_id` → `users` **CASCADE** (nullable, guest), `session_id` (100, null),
`expires_at` timestamp null, `timestamps`.

### cart_items
`id`, `cart_id` → `carts` **CASCADE**, `product_id` → `products` **SET NULL** (nullable),
`product_variant_id` → `product_variants` **SET NULL** (nullable), `qty` uint default 1,
`unit_price` ubigint default 0 (harga dikunci saat masuk cart), `timestamps`.

### orders
`id`, `user_id` → `users` **SET NULL** (nullable), `code` (30, unique, `TK-YYYYMMDD-NNNN`),
`status` string(20) default `pending`, `subtotal` ubigint, `shipping_cost` ubigint,
`discount` ubigint, `total` ubigint, `payment_method` (20) default `qris`,
`payment_status` string(20) default `pending`, `customer_name` (120), `customer_phone` (30),
`customer_email` (180, null), `shipping_address` text, `city` (100), `postal_code` (10, null),
`notes` text null, `paid_at` timestamp null, `tracking_number` string(60) null
(diisi manual admin — PRD A15; migrasi `2026_10_21_000019`), `shipping_courier` (40, null),
`shipping_service` (60, null), `shipping_etd` (30, null), `shipping_weight_gram` uint null,
`shipping_is_free` bool default false (migrasi `2026_10_24_000002`, kartu `t_f22c8d46`),
`biteship_order_id` string(60) null, `shipping_status` string(30) null,
`shipping_payload` json null (migrasi `2026_10_24_000003`, Biteship),
`shipped_at` timestamp null (diisi otomatis saat status menjadi `dikirim`; migrasi `2026_10_24_000004`),
`shipping_updated_at` timestamp null, `shipping_webhook_payload` json null (payload webhook Biteship
terakhir + waktu terapkan; migrasi `2026_10_24_000005`, webhook Biteship PRD-v1.3 §2.5),
`shipping_events` json null (riwayat event `{event,status,at}` urut lama → baru, maks 50;
migrasi `2026_10_26_000006`, PRD-v1.4 §4.1),
`timestamps`.
Index: (`status`,`created_at`), (`payment_status`,`created_at`), (`user_id`).

Nilai `status` (PRD §7): `pending` → `dibayar` → `diproses` → `dikirim` → `selesai` | `batal`.
Nilai `payment_status` (PRD §6, §8): `pending` | `settlement` | `expire` | `deny` | `cancel`.
Konstanta PHP: `App\Models\Order::STATUS_*` dan `App\Models\Order::PAYMENT_*`.

### order_items (snapshot)
`id`, `order_id` → `orders` **CASCADE**, `product_id` → `products` **SET NULL** (nullable),
`product_variant_id` → `product_variants` **SET NULL** (nullable), `product_name` (180),
`variant_label` (120, null), `qty` uint, `unit_price` ubigint, `line_total` ubigint, `timestamps`.

### payments
`id`, `order_id` → `orders` **CASCADE**, `provider` (20) default `midtrans`,
`transaction_id` (100, null, index), `order_id_midtrans` (60, null, index),
`snap_token` (255, null), `snap_redirect_url` text null, `payment_type` (40, null),
`qris_url` text null, `qr_string` text null, `gross_amount` ubigint default 0,
`status` string(20) default `pending`, `payload` json null, `paid_at` timestamp null,
`expires_at` timestamp null, `timestamps`.

`snap_token`/`snap_redirect_url` diisi jalur Midtrans Snap; `payment_type` diisi dari webhook
(`bank_transfer`, `echannel`, `qris`, `gopay`, …). `qris_url`/`qr_string` tinggal dipakai mode uji
(QRIS dummy) dan baris lama Core API QRIS.

### reviews
`id`, `order_id` → `orders` **CASCADE**, `product_id` → `products` **CASCADE**,
`user_id` → `users` **SET NULL** (nullable), `rating` tinyint unsigned (1–5), `comment` text null,
`admin_reply` text null, `replied_at` timestamp null, `is_visible` bool default true, `timestamps`.
Unique: (`order_id`,`product_id`) — satu produk satu ulasan per order (PRD §7.3).

### contact_messages
`id`, `name` (120), `email` (180), `phone` (30, null), `subject` (180), `message` text,
`is_read` bool default false, `admin_reply` text null, `replied_at` timestamp null,
`ip` (45, null), `timestamps`.

### settings
`id`, `key` (100, unique), `value` text null, `group` (50) default `umum`,
`type` (20) default `text` (`text`|`textarea`|`image`|`json`), `label` (150, null), `timestamps`.

Key minimum (PRD §6): `store_name`, `store_logo`, `store_tagline`, `header_nav` (json),
`footer_about`, `footer_links` (json), `footer_social` (json), `contact_email`, `contact_phone`,
`contact_whatsapp`, `contact_address`, `contact_map_embed`, `landing_hero` (json),
`landing_sections` (json), `seo_default_title`, `seo_default_description`,
`shipping_cost_default`, `midtrans_client_key`, `midtrans_is_production`.

Tambahan di luar PRD §6 (kartu `t_101b9145`, 23 Okt 2026): `store_favicon` (grup `umum`,
type `image`, dipakai tag `<link rel="icon">`; kosong → `/favicon.ico`) dan
`footer_copyright` (grup `footer`, type `text`, nullable, maks 200; kosong → frontend
memakai `© {tahun} {store_name}`).

Grup `shipping` (kartu `t_f22c8d46`, 24 Okt 2026, PRD v1.1 D2/D3): `shipping_origin_name`,
`shipping_origin_phone`, `shipping_origin_address` (textarea), `shipping_origin_postal_code`
(5 angka), `shipping_couriers` (json: daftar `courier_code`, `courier_name`, `service_code`,
`service_name`, `label`, `is_regular`, `is_active`), `free_shipping_enabled` (0/1),
`free_shipping_min` (rupiah). `shipping_cost_default` (grup `pembayaran`) dipakai sebagai
tarif datar mode `fake`. `SettingSeeder` sekarang menulis 31 key; tetap `firstOrCreate`
sehingga nilai pemilik tidak tertimpa.

### carousels
`id`, `title` (150), `subtitle` (255, null), `image`, `link` (255, null),
`button_text` (60, null), `sort_order` uint default 0, `is_active` bool default true, `timestamps`.

### faqs
`id`, `question` (255), `answer` text, `sort_order` uint default 0,
`is_active` bool default true, `timestamps`.

### Di luar PRD §6 (bawaan kerangka, bukan milik fitur)
`password_reset_tokens`, `password_reset_tokens_admin`, `sessions`, `cache`, `cache_locks`,
`jobs`, `job_batches`, `failed_jobs`.

## 3. Aksi foreign key (ringkas)

| Tabel | Kolom | Target | Aksi hapus | Alasan |
|---|---|---|---|---|
| products | category_id | categories | RESTRICT | kategori berisi produk tidak boleh hilang diam-diam |
| product_images | product_id | products | CASCADE | data turunan produk |
| product_variants | product_id | products | CASCADE | data turunan produk |
| stock_movements | product_variant_id | product_variants | CASCADE | riwayat ikut hilang bersama varian |
| stock_movements | admin_id | admins | SET NULL | audit tetap ada walau admin dihapus |
| carts | user_id | users | CASCADE | keranjang milik pembeli |
| cart_items | cart_id | carts | CASCADE | data turunan keranjang |
| cart_items | product_id / product_variant_id | products / product_variants | SET NULL | keranjang tidak memblokir hapus produk |
| orders | user_id | users | SET NULL | riwayat pesanan tetap ada |
| order_items | order_id | orders | CASCADE | data turunan pesanan |
| order_items | product_id / product_variant_id | products / product_variants | SET NULL | snapshot nama/harga sudah dibekukan |
| payments | order_id | orders | CASCADE | pembayaran milik pesanan |
| reviews | order_id | orders | CASCADE | ulasan milik pesanan |
| reviews | product_id | products | CASCADE | ulasan milik produk |
| reviews | user_id | users | SET NULL | ulasan tetap tampil sebagai anonim |

## 4. Model Eloquent (`app/Models/`)

| Model | Tabel | Relasi |
|---|---|---|
| `User` | users | orders, carts, cart (hasOne latest), reviews |
| `Admin` | admins | stockMovements |
| `Category` | categories | products; scope `active`, `ordered` |
| `Product` | products | category, images, variants, reviews, orderItems; scope `active`, `featured`; `priceForQty(int)` untuk harga grosir |
| `ProductImage` | product_images | product |
| `ProductVariant` | product_variants | product, stockMovements, cartItems, orderItems; scope `active`; `label()` |
| `StockMovement` | stock_movements | productVariant, admin; konstanta `TYPE_*` |
| `Cart` | carts | user, items |
| `CartItem` | cart_items | cart, product, variant, `subtotal()` |
| `Order` | orders | user, items, payment (hasOne), reviews; konstanta `STATUS_*`, `PAYMENT_*` |
| `OrderItem` | order_items | order, product, variant |
| `Payment` | payments | order; cast `payload` array |
| `Review` | reviews | order, product, user; scope `visible` |
| `ContactMessage` | contact_messages | scope `unread` |
| `Setting` | settings | scope `group` |
| `Carousel` | carousels | scope `active`, `ordered` |
| `Faq` | faqs | scope `active`, `ordered` |

## 5. Seeder (K5, 20 Oktober 2026)

Urutan panggilan di `DatabaseSeeder` mengikuti ketergantungan FK:

```
AdminSeeder → UserSeeder → SettingSeeder → CategorySeeder → ProductSeeder
→ CarouselSeeder → FaqSeeder → OrderSeeder → ReviewSeeder → CartSeeder
→ ContactMessageSeeder → VerifiesSeedData::verifySeedData()
```

| Seeder | Isi | Kunci idempoten |
|---|---|---|
| `AdminSeeder` | 2 admin (owner + staff) | `admins.email` |
| `UserSeeder` | 2 pembeli demo | `users.email` |
| `SettingSeeder` | 19 key PRD §6 + logo/hero/promo PNG | `settings.key` |
| `CategorySeeder` | 3 kategori (daster, kulot, setelan) | `categories.slug` |
| `ProductSeeder` | 12 produk, 24 gambar, 36 varian, 34 movement `in` | `products.slug` + `product_variants.sku` |
| `CarouselSeeder` | 3 slide | `carousels.title` |
| `FaqSeeder` | 6 FAQ | `faqs.question` |
| `OrderSeeder` | 3 order, 5 item, 3 payment, 5 movement `sale` | `orders.code` |
| `ReviewSeeder` | 2 ulasan + hitung ulang `rating_avg`/`rating_count` | `(order_id, product_id)` |
| `CartSeeder` | 1 keranjang, 2 item | `carts.user_id` + `(cart_id, product_variant_id)` |
| `ContactMessageSeeder` | 3 pesan (2 belum dibaca, 1 dibalas) | `(email, subject)` |

Aturan yang dipakai:

- Semua baris `updateOrCreate` dengan kunci bisnis → `php artisan db:seed` boleh diulang (R13).
- Data deterministik: tanpa `fake()`/angka acak; tanggal order absolut (2026-10-15/16/18);
  timestamp di-`stampTimestamps()` lewat `DB::table()` karena `timestamps()` tidak fillable.
- Stok tidak pernah ditulis langsung: `SyncsVariantStock` menghitung
  `max(0, in + adjust − out − sale)` dari `stock_movements`, dipanggil setelah movement dibuat.
- Gambar contoh dibuat lokal oleh `Concerns/WritesSeedImages` (GD, PNG) di `public/images/seed/`,
  warna deterministik dari `crc32` nama berkas; tidak ada unduhan dari internet (PRD §10).
- `VerifiesSeedData` memeriksa jumlah minimum, keunikan, sebaran (semua kategori berisi produk,
  ada produk unggulan, ada varian stok 0 dan stok kritis), 19 key settings wajib, JSON valid,
  dan invarian stok; gagal keras dengan daftar masalah.
- Data contoh memakai prefiks `[CONTOH]` agar bisa dibersihkan tanpa menyentuh data pemilik.
- `midtrans_client_key` + `midtrans_is_production` hanya **catatan** di panel admin (tidak dibaca jalur
  bayar); kredensial efektif dari `.env` (`MIDTRANS_*`), dan `MIDTRANS_SERVER_KEY` tidak pernah masuk `settings`.

Akun lokal: `docs/akun-dev.md`. Bentuk JSON settings: `docs/kontrak-props.md` §2.

## 6. Bukti verifikasi (K4, 20 Oktober 2026)

```
php artisan migrate:fresh          -> 20 migrasi DONE, tanpa error
php artisan migrate:rollback       -> 20 migrasi rollback DONE (down() berjalan)
php artisan migrate                -> 20 migrasi DONE ulang
relasi Eloquent (17 model)         -> semua query relasi jalan tanpa error
information_schema FK              -> 17 FK, aksi hapus sesuai tabel §3
information_schema unique          -> reviews(order_id,product_id), products.slug,
                                      product_variants.sku, categories.slug, orders.code,
                                      settings.key, users.email, admins.email
php -l (semua model + migrasi)     -> tanpa syntax error
php artisan route:list             -> 6 rute (belum ada rute fitur; itu K6+)
```

Belum dijalankan pada kartu ini: `migrate:fresh --seed` (seeder milik K5), `php artisan test`
(belum ada test; kartu K15).

## 7. Bukti verifikasi (K5, 20 Oktober 2026)

```
php -l (11 seeder + 3 trait)       -> tanpa syntax error
php artisan migrate:fresh --seed   -> 20 migrasi DONE, 11 seeder DONE (run #1)
php artisan migrate:fresh --seed   -> sukses lagi (run #2, DoD kartu)
php artisan db:seed                -> sukses 2x berturut (run #3, #4)
db:show --counts sebelum/sesudah   -> identik: admins 2, users 2, categories 3,
                                      products 12, product_images 24, product_variants 36,
                                      stock_movements 39, carts 1, cart_items 2, orders 3,
                                      order_items 5, payments 3, reviews 2,
                                      contact_messages 3, settings 19, carousels 3, faqs 6
VerifiesSeedData (jalan di run #4) -> lolos: jumlah minimum, keunikan, sebaran,
                                      JSON settings, invarian stok
public/images/seed                 -> 33 PNG dibuat lokal (161 KB)
```

Belum dijalankan pada kartu ini: `php artisan test` (belum ada test; kartu K15),
`npm run build` (frontend belum memakai props ini).

## 8. Bukti verifikasi (t_c374a29b — aksi admin "Sinkronkan status pembayaran", 21 Oktober 2026)

Tidak ada tabel, kolom, indeks, atau migrasi baru pada kartu ini. Aksi kontrak props §12.24
memakai kolom yang sudah ada:

```
payments.status          -> 'pending'|'settlement'|'expire'|'deny'|'cancel' (sumber status tagihan)
payments.paid_at         -> diisi saat settlement; transaction_id ikut diperbarui
orders.payment_status    -> cerminan payments.status (daftar §2 orders)
orders.status            -> 'pending' -> 'dibayar' saat settlement; 'pending' -> 'batal' saat expire
orders.paid_at           -> diisi saat settlement
stock_movements          -> baris type 'in' saat stok dikembalikan (expire/deny/cancel)
```

Verifikasi baca-saja di DB test (SQLite `:memory:` dari `phpunit.xml`, DB pemilik tidak disentuh):

```
Schema::getColumnListing('payments') -> id, order_id, provider, transaction_id, order_id_midtrans,
                                        snap_token, snap_redirect_url, payment_type,
                                        qris_url, qr_string, gross_amount, status, payload,
                                        paid_at, expires_at, created_at, updated_at
Schema::getColumnListing('orders')   -> ... payment_status, paid_at, tracking_number ...
php artisan test                     -> 237 passed (1791 assertions)
```

Catatan: `docs/kontrak-props.md` §12.23 (tabel status) menyebut kolom `orders.payment_status`
dengan label yang sama; tidak ada nilai baru yang diperkenalkan. Bukti lengkap:
`docs/bukti-backend-t_c374a29b.txt`.


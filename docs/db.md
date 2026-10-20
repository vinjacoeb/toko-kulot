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
`notes` text null, `paid_at` timestamp null, `timestamps`.
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
`qris_url` text null, `qr_string` text null, `gross_amount` ubigint default 0,
`status` string(20) default `pending`, `payload` json null, `paid_at` timestamp null,
`expires_at` timestamp null, `timestamps`.

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
- `midtrans_client_key` sengaja kosong (diisi pemilik lewat panel admin), `MIDTRANS_SERVER_KEY`
  tidak pernah masuk tabel `settings`.

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

# Catatan Backend — Toko Kulot

## Perbaikan 5 — halaman riwayat pesanan pembeli `GET /history` (kartu t_5b803c80, 2026-10-23)

Rencana (maks 10 baris):

1. Kontrak dulu: tambah §13 `GET /history` di `docs/kontrak-props.md` (paginator `orders`,
   `ringkasan`, bentuk item, aturan `detail_url`).
2. `app/Http/Controllers/HistoryController.php`: query `orders` milik user login, `with(items)`,
   semua status, `created_at`/`id` turun, 10/halaman; gambar utama produk satu query batch.
3. `routes/web.php`: `GET /history` name `history.index`, middleware `auth:web`.
4. `tests/Feature/HistoryTest.php`: tamu → `/login`, hanya pesanan sendiri, batal ikut, item &
   total benar, urutan, pagination 10, `detail_url`, empty state, ringkasan.
5. Tanpa migrasi/skema baru; tidak menyentuh `.env`; test memakai SQLite `:memory:` (`phpunit.xml`).
6. Berkas lain: `docs/catatan-backend.md` (catatan ini). Verifikasi: `php artisan test --filter=History`,
   `php artisan route:list --name=history`, `php -l`, `vendor/bin/pint --test`.

Hasil (2026-10-23):

- Berkas dibuat: `app/Http/Controllers/HistoryController.php`, `tests/Feature/HistoryTest.php`,
  `docs/bukti-backend-t_5b803c80.txt`. Diubah: `routes/web.php` (import + rute `history.index`),
  `docs/kontrak-props.md` (§13, LOCKED), `docs/asumsi.md` (butir 29).
- `php -l` 3 berkas bersih; `pint --test` passed; `route:list --name=history` menampilkan
  `GET|HEAD history → history.index`.
- `php artisan test --filter=History` → 5 passed (141 assertions); suite penuh → 279 passed
  (2299 assertions). `pdo_sqlite` nonaktif di php.ini, jadi test dijalankan dengan
  `PHP_INI_SCAN_DIR` menunjuk ini sementara di `storage/framework/testing/php-ini` (gitignored,
  dihapus setelah verifikasi); php.ini/.env tidak diubah. Tanpa itu: `php -d extension=pdo_sqlite
  vendor/bin/phpunit` (docs/langkah-pemilik.md).
- Tidak ada migrasi baru: `orders`/`order_items` sudah ada di docs/db.md dan cocok dengan kode.
  Test memakai SQLite `:memory:`; database pengembangan tidak disentuh.
- Untuk frontend `t_326f766b`: pakai `orders.{data,links,meta}` + `ringkasan`; semua status termasuk
  `batal` tampil; `detail_url` `null` bukan galat (render tanpa tautan detail).



## K4 — Migrasi & model seluruh domain (2026-10-20)

Rencana (maks 10 baris):

1. Migrasi kolom profil pembeli pada `users` (phone, address, city, postal_code) — PRD §6.
2. Migrasi 15 tabel domain PRD §6 berurutan induk → anak: categories, products,
   product_images, product_variants, stock_movements, carts, cart_items, orders,
   order_items, payments, reviews, contact_messages, settings, carousels, faqs.
3. Perbaiki enum `admins.role` menjadi `owner|admin|staff` (PRD §6) — migrasi lama
   boleh disentuh karena kartu ini kartu skema dan `migrate:fresh` diizinkan DoD.
4. Model Eloquent satu class per berkas + relasi PRD §6 + casts.
5. Bukti: `php artisan migrate:fresh`, `php artisan migrate:status`, `php artisan route:list`.
6. Dokumen `docs/db.md` (tabel, kolom, FK + aksi, urutan migrasi, seeder K5).
7. Asumsi teknis (nullability, aksi FK, tipe status) ditulis di `docs/asumsi.md` A-K4-*.

Berkas disentuh: `database/migrations/*` (16 berkas baru + 1 enum diperbaiki),
`app/Models/*` (15 model baru + `User`/`Admin` diperbarui), `docs/db.md`,
`docs/asumsi.md`, `docs/catatan-backend.md`.

### Catatan teknis

- `password_reset_tokens_admin` (dibuat K2) tidak ada di PRD §6. Tidak dihapus
  karena sudah dipakai konfigurasi guard `admin`; dicatat sebagai temuan di luar
  lingkup kartu ini.
- Tidak memakai `softDeletes`: PRD §6 hanya menyebutnya "bila disebut" dan tidak
  ada tabel yang disebut memakainya.
- Semua uang `integer` rupiah tanpa desimal (PRD §4.3, A13).

### Hasil (bukti eksekusi 2026-10-20)

```
php artisan migrate:fresh     -> 20 migrasi DONE tanpa error
php artisan migrate:rollback  -> 20 migrasi rollback DONE (down() terbukti jalan)
php artisan migrate           -> 20 migrasi DONE ulang
relasi Eloquent 17 model      -> semua query relasi jalan (tanpa error SQL)
php -l model + migrasi        -> tanpa syntax error
php artisan route:list        -> 6 rute bawaan (rute fitur belum dibuat; K6+)
```

Detail tabel, kolom, FK + aksi, urutan migrasi, dan daftar model: `docs/db.md`.
Asumsi teknis: `docs/asumsi.md` A-K4-01 … A-K4-08.

Yang belum dikerjakan (di luar lingkup kartu):
- `migrate:fresh --seed` belum dijalankan — `DatabaseSeeder` masih bawaan kerangka
  (`User::factory()` "Test User"); seeder domain milik K5.
- Belum ada test (kartu K15).
- `password_reset_tokens_admin` (dibuat K2) tidak ada di PRD §6; dipertahankan karena
  dipakai guard `admin`. Bila pemilik ingin skema persis §6, kartu baru perlu dibuat.

## K5 — Seeder lengkap semua domain (2026-10-20)

Rencana (maks 10 baris):

1. Seeder per domain di `database/seeders/`: Admin, User, Category, Product (gambar +
   varian + movement `in` stok awal), Order (order + item snapshot + payment + movement
   `sale`), Review, Cart, ContactMessage, Setting, Carousel, Faq.
2. Semua baris `updateOrCreate` dengan kunci tetap (slug/sku/code/key/email/title) → idempoten (R13).
3. Data contoh deterministik: tanpa `fake()`, tanpa angka acak; tanggal order absolut (2026-10-15/16/18).
4. 12 produk (≤ 24, PRD §16), 3 kategori, 2 admin, 2 pembeli, 3 order, 2 ulasan, 1 keranjang,
   3 pesan masuk, 19 key `settings` (PRD §6), 3 carousel, 6 FAQ.
5. Placeholder gambar dibuat lokal oleh seeder (GD → PNG) di `public/images/seed/` (PRD §10),
   tidak mengunduh aset dari internet.
6. Kontrak bentuk JSON `settings` (header_nav, footer_links, footer_social, landing_hero,
   landing_sections) ditulis lebih dulu di `docs/kontrak-props.md` (DRAFT) untuk frontend.
7. Pemeriksaan akhir gagal keras: jumlah minimum per tabel, keunikan, sebaran stok kritis.
8. Bukti: `php artisan migrate:fresh --seed` dua kali berturut-turut + hitung baris per tabel.

Berkas disentuh: `database/seeders/*` (11 seeder domain + `DatabaseSeeder` + helper gambar),
`docs/kontrak-props.md` (baru), `docs/akun-dev.md` (baru), `docs/asumsi.md` (A-K5-*),
`docs/catatan-backend.md`.

### Hasil K5 (bukti eksekusi 2026-10-20)

```
php -l 11 seeder + 3 trait          -> tanpa syntax error
migrate:fresh --seed (run #1)       -> 20 migrasi DONE, 11 seeder DONE
migrate:fresh --seed (run #2, DoD)  -> sukses lagi
db:seed (run #3, #4)                -> sukses; hitungan baris sebelum == sesudah
counts                              -> admins 2, users 2, categories 3, products 12,
                                       product_images 24, product_variants 36,
                                       stock_movements 39, carts 1, cart_items 2,
                                       orders 3, order_items 5, payments 3, reviews 2,
                                       contact_messages 3, settings 19, carousels 3, faqs 6
public/images/seed                  -> 33 PNG (161 KB), dibuat lokal via GD
```

Berkas seeder: `AdminSeeder`, `UserSeeder`, `SettingSeeder`, `CategorySeeder`, `ProductSeeder`,
`CarouselSeeder`, `FaqSeeder`, `OrderSeeder`, `ReviewSeeder`, `CartSeeder`, `ContactMessageSeeder`,
plus `Concerns/WritesSeedImages`, `Concerns/SyncsVariantStock`, `Concerns/VerifiesSeedData`.

Keputusan penting:

- Idempoten lewat `updateOrCreate` pada kunci bisnis; timestamp order/ulasan/pesan
  di-`stampTimestamps()` via `DB::table()` karena `timestamps()` tidak fillable.
- `SyncsVariantStock` menghitung `max(0, in + adjust − out − sale)`; `product_variants.stock`
  tidak pernah ditulis langsung oleh seeder.
- `VerifiesSeedData` gagal keras: jumlah minimum, keunikan, sebaran (semua kategori berisi
  produk, ada produk unggulan, ada varian stok 0 dan stok < 5), 19 key settings wajib,
  JSON valid, dan invarian stok per varian.
- Gambar: produk 800×800, kategori 600×800, carousel/hero/promo 1600×900, logo 240×64;
  `SettingSeeder` dan `CarouselSeeder` tidak lagi menulis berkas yang sama.

Untuk frontend: bentuk props/JSON `settings` ada di `docs/kontrak-props.md` (DRAFT);
akun demo di `docs/akun-dev.md`; daftar tabel & seeder di `docs/db.md` §5.

Yang belum dijalankan: `php artisan test` (belum ada test; kartu K15), `npm run build`
(frontend belum memakai props ini).


## K6 — Autentikasi dua tier: guard `web` + guard `admin` (2026-10-20)

Rencana (maks 10 baris):

1. Kontrak props halaman auth ditulis dulu di `docs/kontrak-props.md` (DRAFT) — K5 juga menulis di berkas yang sama untuk bentuk JSON `settings`; bagian auth ditandai jelas.
2. `config/auth.php`: guard `web`→`users` dan `admin`→`admins` sudah ada dari K2/K4; diverifikasi, tidak diubah. Tidak ada broker reset admin karena PRD §5.2 tidak punya rute lupa sandi admin.
3. `app/Http/Requests/Auth/*` (Register, Login, ForgotPassword, ResetPassword) + `app/Http/Requests/Admin/AdminLoginRequest.php`.
4. `app/Http/Controllers/Public/AuthController.php` (register, login, forgot, reset, logout) dan `app/Http/Controllers/Admin/AuthController.php` (login, logout).
5. `app/Http/Controllers/Admin/DashboardController.php` — stub minimal untuk target redirect `admin.dashboard` (PRD §5.2); data monitoring milik kartu lanjutan.
6. `app/Http/Middleware/EnsureAdmin.php` diperketat: cek `is_active` saat request, bukan hanya saat login.
7. Rate limit login 5/menit (PRD §11) lewat named limiter `login` dan `admin-login` di `AppServiceProvider`, kunci email+IP, balasan 429 + `Retry-After`.
8. `routes/web.php` (rute auth §5.1) dan `routes/admin.php` (login/logout/dashboard §5.2).
9. Test feature: registrasi, login web, penolakan admin di `/login`, penolakan pembeli di `/admin`, rate limit 429, reset sandi, logout. DB test = SQLite in-memory.
10. Bukti: `php artisan route:list`, `php artisan test`, `php -l` berkas baru.

Berkas disentuh: `app/Http/Controllers/Public/AuthController.php`, `app/Http/Controllers/Admin/AuthController.php`,
`app/Http/Controllers/Admin/DashboardController.php`, `app/Http/Requests/Auth/*.php`, `app/Http/Requests/Admin/AdminLoginRequest.php`,
`app/Http/Middleware/EnsureAdmin.php`, `app/Providers/AppServiceProvider.php`, `database/factories/AdminFactory.php`,
`routes/web.php`, `routes/admin.php`, `phpunit.xml` (aktifkan SQLite in-memory untuk test), `tests/Feature/Auth/*.php`,
`docs/kontrak-props.md`, `docs/asumsi.md`, `docs/langkah-pemilik.md`, `docs/catatan-backend.md`.

### K6 — Hasil

Berkas dibuat:

| Berkas | Isi |
|---|---|
| `app/Http/Controllers/AuthController.php` | Auth pembeli guard `web`: register, login, lupa sandi, reset sandi, logout |
| `app/Http/Controllers/Admin/AuthController.php` | Login/logout admin guard `admin` |
| `app/Http/Controllers/Admin/DashboardController.php` | `admin.dashboard` — angka ringkas dari `orders`/`products` |
| `app/Http/Requests/Auth/{Register,Login,ForgotPassword,ResetPassword}Request.php` | Validasi + pesan galat Bahasa Indonesia |
| `app/Http/Requests/Admin/AdminLoginRequest.php` | Validasi login admin + tolak akun nonaktif |
| `app/Http/Middleware/EnsureAdmin.php` | Guard `admin` + cek `is_active` per request |
| `app/Providers/AppServiceProvider.php` | Redirect `guest` per tier + limiter `login`, `admin-login`, `password-email` |
| `database/factories/AdminFactory.php` | Factory admin (`owner()`, `nonaktif()`) |
| `routes/web.php`, `routes/admin.php` | Rute §5.1 dan §5.2 |
| `tests/Feature/Auth/{Registration,Login,PasswordReset,AdminAuth}Test.php` | 37 test |
| `docs/kontrak-props.md` §6 | Kontrak props halaman auth (DRAFT) |

Berkas diubah: `phpunit.xml` (`DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:` — test tidak menyentuh database pengembangan).

Verifikasi yang dijalankan:

- `php artisan route:list --except-vendor` → 14 rute: `home`, `register(.store)`, `login(.store)`,
  `password.request/email/reset/update`, `logout`, `admin.login(.store)`, `admin.dashboard`, `admin.logout`.
- `php artisan test` → **39 passed (181 assertions)**, 5.42s. Seluruh suite, bukan hanya auth.
- Test memakai SQLite in-memory; database MySQL pengembangan tidak disentuh.

Catatan teknis:

- `php artisan test` di mesin ini butuh ekstensi `pdo_sqlite` + `sqlite3`. Keduanya dikomentari di
  `php.ini` Laragon, jadi verifikasi dijalankan dengan `PHPRC` yang menunjuk salinan `php.ini`
  (di luar repo). Langkah mengaktifkannya permanen ada di `docs/langkah-pemilik.md` §7.
- Asersi `assertInertia(...->component('X', false))` memakai argumen `false` karena berkas halaman
  JSX (`resources/js/Pages/...`) milik kartu frontend K12/K13; nama komponen tetap dikunci di test.
- Nama komponen: `Public/Auth/{Register,Login,ForgotPassword,ResetPassword}`, `Admin/Login`, `Admin/Dashboard`.

Perbedaan dari rencana: controller auth pembeli ditaruh di `App\Http\Controllers\AuthController`
(bukan `...\Public\AuthController`) karena `Public` kata kunci PHP; namespace admin tetap
`App\Http\Controllers\Admin\*`.

---

## K8 — Keranjang & checkout QRIS (selesai, 2026-10-20)

Alur PRD §5.1 langkah 2–7 + §8 (Midtrans). Kontrak props §7 (`docs/kontrak-props.md`) ditulis lebih
dulu, lalu implementasi, lalu status §7.0–§7.10 dinaikkan ke **LOCKED**.

Berkas dibuat:

| Berkas | Isi |
|---|---|
| `config/midtrans.php` | `merchant_id`/`client_key`/`server_key` dari `env()` (nilai tidak ditulis di dokumen), `is_production`, `fake` (default `true`), `expiry_minutes` dari `env('MIDTRANS_EXPIRY_MINUTES', 5)` (kartu `t_e35050e8`; sebelumnya hard-code 15), `enabled_payments` `['other_qris']`, `notification_url` |
| `app/Exceptions/CheckoutException.php` | Satu-satunya jalur galat yang aman ditampilkan ke pembeli (pesan Bahasa Indonesia) |
| `app/Services/StockService.php` | Satu-satunya penulis `product_variants.stock` + `stock_movements`; tolak stok kurang; wajib di dalam `DB::transaction` + `lockForUpdate()` |
| `app/Services/CartService.php` | Keranjang tamu (`carts.session_id`) vs pembeli (`carts.user_id`), adopsi/merge saat login, harga grosir dihitung ulang saat qty berubah, ringkasan + ongkir `settings.shipping_cost_default`, `cart_count` di sesi |
| `app/Services/OrderService.php` | `createFromCart()` dalam satu transaksi: kunci varian → validasi stok → snapshot `orders`/`order_items` → potong stok → QRIS → kosongkan keranjang; `code` = `TK-YYYYMMDD-NNNN` (PRD A10) |
| `app/Services/MidtransService.php` | Mode `fake` (QRIS EMVCo + CRC16 lokal, tanpa jaringan) dan Core API asli; `verifySignature()` SHA-512; `handleNotification()` idempoten; `syncStatus()` untuk polling |
| `app/Http/Requests/AddToCartRequest.php`, `UpdateCartItemRequest.php`, `CheckoutRequest.php` | Validasi server + pesan galat sesuai kontrak §7.6 |
| `app/Http/Controllers/CartController.php` | `cart.index|store|update|destroy`; kepemilikan item dicek per objek (cegah IDOR) |
| `app/Http/Controllers/CheckoutController.php` | `checkout.index|store|pay|success|status`; `authorizeOrder()` = pemilik order, pembeli lain **404** |
| `app/Http/Controllers/MidtransNotificationController.php` | Webhook: signature salah → 403 `{"message":"invalid signature"}` + `Log::warning`; `amount mismatch` → 422 |
| `tests/Feature/Checkout/CartTest.php`, `tests/Feature/Checkout/CheckoutTest.php` | 21 test (lihat bukti di bawah) |

Berkas diubah: `routes/web.php` (grup `keranjang` + `checkout` dengan `auth:web`, webhook
`midtrans.notification` di luar CSRF), `app/Providers/AppServiceProvider.php` (limiter `cart` 30/menit,
`checkout` 10/menit, `checkout-status` 60/menit, kunci sesi+IP), `.env.example`
(`MIDTRANS_NOTIFICATION_URL`), `docs/kontrak-props.md` §7.

Keputusan penting:

- **Checkout wajib login** (PRD §5.1 langkah 3): grup rute `checkout` memakai `auth:web`, tamu →
  `login` + intended URL. Mekanisme tamu lewat sesi `akses_pesanan` **tidak dipakai**; akses pesanan
  murni kepemilikan (`user_id`), pembeli lain dijawab 404.
- **Kode pesanan `TK-YYYYMMDD-NNNN`** (bukan `KDK-`): mengikuti PRD A10 + `docs/db.md`.
- **Props keranjang memakai key `keranjang`**, bukan `cart`, karena `cart` sudah dipakai shared prop
  global `{ count }`.
- **Mode `fake` default `true`**: QRIS dibuat lokal sehingga alur checkout bisa diuji tanpa kredensial.
  Produksi wajib `MIDTRANS_FAKE=false` (lihat `docs/langkah-pemilik.md`).
- **`pembayaran.fake` + `midtrans.fake`** dikirim ke frontend agar `QrisPanel` tidak mencoba polling
  ke Midtrans saat mode lokal; key `is_fake`/`status_url` tidak dipakai.

Verifikasi yang dijalankan:

- `php -l` pada seluruh berkas baru + `routes/web.php` + `AppServiceProvider.php` → tidak ada galat sintaks.
- `php artisan test tests/Feature/Checkout` → **21 passed (133 assertions)** (EXIT=0).
- `php artisan test` (seluruh suite) → **59 passed, 1 failed (314 assertions)**. Satu kegagalan:
  `Tests\Feature\ExampleTest` — stub bawaan Laravel yang memanggil `/` **tanpa** `RefreshDatabase`,
  jadi tabel belum ada. Bukan bagian kartu ini; dicatat sebagai temuan di bawah.
- `php artisan route:list` → `keranjang` (`cart.index|store|update|destroy`), `checkout`
  (`checkout.index|store|pay|status|success`), `midtrans.notification`.

Catatan untuk frontend (K13): halaman `Public/{Cart,Checkout,CheckoutPay,CheckoutSuccess}` **belum
dibuat**; test memakai `assertInertia(...->component('X', false))` sehingga nama komponen terkunci
tanpa menuntut berkas JSX ada. Bentuk props persis ada di `docs/kontrak-props.md` §7.0–§7.9.

Catatan teknis: `php artisan test` di mesin ini butuh `pdo_sqlite`/`sqlite3` (dikomentari di `php.ini`
Laragon); verifikasi dijalankan dengan `PHPRC` menunjuk salinan `php.ini` di luar repo — langkah
permanen ada di `docs/langkah-pemilik.md` §7.

Temuan di luar lingkup:

- `tests/Feature/ExampleTest.php` gagal karena tidak memakai `RefreshDatabase` (stub bawaan). Perlu
  diperbaiki/dihapus oleh kartu yang memilikinya.
- Halaman frontend keranjang/checkout belum ada (kartu K13).
- Form ulasan `POST /checkout/{order}/ulasan` (kontrak §7.9) milik kartu K9 — belum dibuat di sini.

---

## t_a696f5c6 — Kontrak props halaman beranda `/` (2026-10-20)

Rencana (maks 10 baris):

1. Kontrak ditulis dulu: `docs/kontrak-props.md` §8 — props `/` (`carousels`, `categories`,
   `featured`, `faqs`) + §8.2 bentuk produk publik (dipakai bersama K11) + status `loading`/`error`.
2. §1 dilengkapi: `settings` benar-benar dibagikan lewat `HandleInertiaRequests` (sebelumnya
   hanya tertulis di kontrak, kode belum mengirimnya).
3. `app/Services/ProductPresenter.php` — satu bentuk produk publik (`card`/`cards` + eager load
   relasi + total stok varian aktif) supaya beranda dan katalog K11 tidak punya dua bentuk.
4. `app/Http/Controllers/HomeController.php` — query carousel/kategori/produk unggulan/FAQ.
5. `routes/web.php` — closure `/` diganti `HomeController@index` (nama rute `home` tetap).
6. Verifikasi: `php -l`, `php artisan route:list`, payload nyata lewat `php artisan tinker
   --execute` (baca saja, tanpa tulis ke database).
7. Temuan di luar lingkup (K7 belum ada rutenya, dsb.) dicatat di bagian "Temuan" di bawah.

Berkas disentuh: `docs/kontrak-props.md`, `app/Http/Controllers/HomeController.php` (baru),
`app/Services/ProductPresenter.php` (baru), `app/Http/Middleware/HandleInertiaRequests.php`,
`routes/web.php`, `docs/asumsi.md` (A-K7H-*), `docs/catatan-backend.md`.

### Hasil t_a696f5c6

Yang dibuat:

| Berkas | Isi |
|---|---|
| `docs/kontrak-props.md` §8 (+ catatan §1) | props `/` (`carousels`, `categories`, `featured`, `faqs`), bentuk produk publik baku §8.3, aturan urutan/limit, status DRAFT |
| `app/Http/Controllers/HomeController.php` (baru) | query carousel aktif, kategori aktif berisi produk, produk unggulan, FAQ; `Inertia::render('Public/Home')` |
| `app/Services/ProductPresenter.php` (baru) | satu bentuk produk publik (`query()`, `cards()`, `card()`), eager load `category`+`images`, `withSum` stok varian aktif |
| `app/Http/Middleware/HandleInertiaRequests.php` | `settings` benar-benar dibagikan (19 key, `type=json` di-decode, aman bila tabel belum ada) |
| `routes/web.php` | closure `/` diganti `HomeController@index`; nama rute `home` tetap; import `Inertia` yang tak terpakai dihapus |
| `docs/asumsi.md` | A-K7H-01 … A-K7H-05 |

Verifikasi yang dijalankan (bukan "selesai" tanpa bukti):

1. `php -l` keempat berkas PHP → `No syntax errors detected` (semua).
2. `php artisan route:list --name=home` → `GET|HEAD / … home › HomeController@index`.
3. Render HTTP nyata tanpa menyalakan server (kernel dipanggil lewat
   `php artisan tinker --execute`, hanya baca): status `200`, komponen `Public/Home`,
   props `errors,auth,cart,flash,meta,settings,carousels,categories,featured,faqs`.
   Jumlah baris dari DB pengembangan: `carousels=3`, `categories=3`, `featured=5`, `faqs=6`,
   `settings_keys=19`, `settings.landing_sections.featured.limit=8`.
4. Contoh potongan payload yang benar-benar keluar:
   `{"id":1,"slug":"daster-batik-pekalongan-lengan-pendek","sku":"DSR-BTK-PKL",
   "url":"/produk/daster-batik-pekalongan-lengan-pendek","base_price":89000,
   "wholesale_price":78000,"min_wholesale_qty":6,"rating_avg":5,"rating_count":1,"stock":138,
   "is_featured":true,"category":{"id":1,"name":"Daster","slug":"daster"},"images":[…]}`.
5. Konsistensi data seed: 3 kategori (semua punya produk aktif: 5/4/3), 12 produk aktif,
   5 di antaranya unggulan → `featured=5` memang seluruh unggulan, bukan terpotong limit.

Yang **belum** dicek dan alasannya:

- Test otomatis: `pdo_sqlite` tidak aktif di PHP CLI mesin ini (`php -m` tidak memuatnya), sedangkan
  `phpunit.xml` memakai SQLite in-memory (A-K6-07). Tidak ada test baru yang dijalankan.
- Perilaku data kosong/nonaktif (kategori tanpa produk, produk non-unggulan, carousel/FAQ nonaktif)
  belum diuji dengan eksekusi karena butuh menulis ke DB pengembangan; baru terbaca dari kode.
- Tampilan di browser tidak diperiksa (server pengembangan tidak dinyalakan, aturan 7).

### Temuan di luar lingkup kartu ini

1. **Rute katalog K7 belum ada.** `php artisan route:list` hanya memuat `home`, auth, `cart.*`,
   `checkout.*`, `midtrans.notification` — tidak ada `/produk`, `/produk/{slug}`, `/kontak-kami`.
   Kontrak §8.2/§8.3 mengirim `url` ke path itu, jadi tautan kategori/produk di beranda akan 404
   sampai K7 (`t_12a19591`) menghasilkan controller + rutenya. Frontend K11 juga bergantung pada K7.
2. **Badge keranjang beranda selalu 0 (milik frontend K10).** `Home.jsx` meneruskan `cartCount`
   dengan nilai bawaan `0` ke `PublicLayout`, padahal props bersama sudah menyediakan `cart.count`
   (dan `PublicLayout` sendiri punya fallback ke `page.props.cart.count`). Sudah dikomentari di
   kartu `t_3ce04d50`; tidak diubah karena berada di luar lingkup backend.
3. **`settings` dulu tidak dikirim sama sekali.** Kontrak §1 sudah menyebut dibagikan lewat
   `HandleInertiaRequests`, kode belum. Sudah diperbaiki di kartu ini (A-K7H-01); halaman auth
   (K6) otomatis ikut mendapat `settings` tanpa perubahan.
4. **PRD §struktur vs kode nyata untuk lokasi controller.** PRD §3 menaruh `HomeController`,
   `ProductController`, `CartController`, `CheckoutController`, `ContactController`,
   `ReviewController` di `app/Http/Controllers/Public/`, tetapi kode yang ada menaruh
   `AuthController`, `CartController`, `CheckoutController`, `MidtransNotificationController` di
   `app/Http/Controllers/` (folder `Public/` kosong). `HomeController` diletakkan di root mengikuti
   kode nyata agar satu gaya; bila tim memilih mengikuti PRD, seluruh controller publik perlu
   dipindah serentak di satu kartu tersendiri (bukan sebagian, agar tidak ada dua gaya namespace).

## K9 — Ulasan, pesan masuk, pengaturan (2026-10-20)

Rencana (maks 10 baris):

1. `SettingService` (PRD §4.2): baca semua key per grup + tulis hanya key yang masuk daftar
   putih PRD §6, nilai `json` di-encode/decode, `image` disimpan sebagai path `/storage/...`.
2. `ReviewService`: simpan ulasan dalam transaksi (kepemilikan order, status bayar, produk
   harus ada di order, unik `order_id`+`product_id`), lalu hitung ulang `rating_avg`/`rating_count`.
3. Publik: `ReviewController@store` (`checkout.review`) dan `MessageController@store`
   (`contact.store`, honeypot + batas laju).
4. Admin: `Admin\MessageController` (index/read/reply), `Admin\ReviewController`
   (index/reply/visibility), `Admin\SettingController` (index/update/landing),
   `Admin\CarouselController` + `Admin\FaqController` (store/update/destroy).
5. FormRequest per aksi tulis; unggahan gambar divalidasi jpg/png/webp ≤ 2 MB, nama berkas
   dibuat server, berkas lama dihapus saat diganti.
6. Rute `routes/web.php` + `routes/admin.php` sesuai PRD §5.1/§5.2 (nama route persis).
7. Kontrak props: §7.12 (ulasan), §7.13 (kontak), §9 admin (pesan/penilaian/pengaturan/FAQ).
8. Test feature baru untuk tiap aksi tulis, dijalankan dengan SQLite in-memory.

Berkas disentuh: `app/Services/{SettingService,ReviewService}.php`, `app/Http/Controllers/`
(`ReviewController`, `MessageController`), `app/Http/Controllers/Admin/` (5 controller),
`app/Http/Requests/` (2) + `app/Http/Requests/Admin/` (6), `routes/web.php`, `routes/admin.php`,
`app/Providers/AppServiceProvider.php` (batas laju kontak/ulasan), `tests/Feature/**`,
`docs/kontrak-props.md`, `docs/catatan-backend.md`, `docs/asumsi.md`.

### K9 — hasil (2026-10-20)

Berkas dibuat:
- Service/util: `app/Services/SettingService.php`, `app/Services/ReviewService.php`, `app/Support/MediaStorage.php`
- Controller publik: `app/Http/Controllers/ReviewController.php`, `app/Http/Controllers/MessageController.php`
- Controller admin: `app/Http/Controllers/Admin/{MessageController,ReviewController,SettingController,CarouselController,FaqController}.php`
- FormRequest: `StoreReviewRequest`, `ContactMessageRequest`, `Admin/{ReplyMessageRequest,ReplyReviewRequest,ToggleReviewVisibilityRequest,StoreCarouselRequest,UpdateCarouselRequest,StoreFaqRequest,UpdateFaqRequest,UpdateSettingRequest,UpdateLandingRequest}`
- Test: `tests/Feature/Reviews/ReviewSubmitTest.php`, `tests/Feature/Messages/ContactMessageTest.php`, `tests/Feature/Admin/AdminInboxTest.php`, `tests/Feature/Admin/AdminSettingTest.php`

Berkas diubah: `routes/web.php` (checkout.review, contact.store), `routes/admin.php` (messages.*, reviews.*, settings.*, carousels.*, faqs.*), `app/Providers/AppServiceProvider.php` (limiter review/contact/admin-write), `docs/kontrak-props.md` (§9).

Route final admin (sesuai kontrak §10): `GET /admin/pesan-masuk`, `PATCH /admin/pesan-masuk/{message}/baca` (dikoreksi dari POST
oleh kartu `t_768819a7` mengikuti keputusan techlead `t_54bfee4e`/PRD §5.2 baris 157),
`POST /admin/pesan-masuk/{message}/balas`, `GET /admin/penilaian`, `POST /admin/penilaian/{review}/balas`,
`PATCH /admin/penilaian/{review}/tampil`, `GET|PUT /admin/pengaturan`, `PUT /admin/pengaturan/landing`,
`POST|PUT|DELETE /admin/carousel`, `POST|PUT|DELETE /admin/faq`.

Verifikasi: `php artisan test tests/Feature/Admin tests/Feature/Reviews tests/Feature/Messages` →
34 passed (187 assertions). `php -l` seluruh berkas baru bersih.

Belum dijalankan: seeder K9 (`ReviewSeeder`, `SettingSeeder`) tidak dieksekusi pada kartu ini; tidak ada
migrasi baru (tabel `reviews`, `contact_messages`, `settings`, `carousels`, `faqs` sudah ada dari kartu skema).

Temuan di luar lingkup: `tests/Feature/ExampleTest.php` gagal (`GET /` 500) karena tidak memakai
`RefreshDatabase` sementara `HomeController` sudah membaca tabel `carousels`/`faqs` di database in-memory
kosong. Bukan akibat K9 — perbaikan satu baris (`use RefreshDatabase;`) milik pemilik kartu landing (K10/K11).

---

## K11 — katalog `/produk`, detail `/produk/{slug}`, kontak `/kontak-kami` (20 Oktober 2026)

Rencana (maks 10 baris):
1. Kontrak dulu: patch `docs/kontrak-props.md` §8.3 (key aditif `compare_price`, `variants[]`) + bagian baru §11 untuk tiga rute K11.
2. Migrasi `2026_10_20_000018_add_compare_price_to_products_table` (`compare_price` ubigint null, setelah `base_price`).
3. `Product`: `compare_price` masuk `$fillable` + cast `integer`.
4. `ProductPresenter`: `compare_price` + `variants[]` pada kartu; `detail()` (description, reviews, rating_distribution). Relasi kartu ditambah `variants` (aktif, urut ukuran baku).
5. Berkas baru `app/Support/VariantSize.php` (urutan ukuran baku) + `app/Services/CatalogService.php` (satu tempat query katalog: filter, urut, paginasi, `sizes`, `categories`, `related`).
6. Berkas baru `app/Http/Controllers/ProductController.php` (index/show) + `ContactController.php` (index) — controller tipis, logika di service.
7. `routes/web.php`: `GET /produk` (`products.index`), `GET /produk/{slug}` (`products.show`), `GET /kontak-kami` (`contact`).
8. `ProductSeeder`: `compare_price` deterministik untuk 4 produk `[CONTOH]`; seeder tetap idempoten (`updateOrCreate`).
9. Docs: `docs/db.md` (kolom + urutan migrasi), `docs/asumsi.md` (asumsi K11).
10. Test `tests/Feature/Catalog/*` (SQLite memori): filter, urut, paginasi, detail, 404, related, kontak.

Berkas disentuh: `docs/kontrak-props.md`, `docs/db.md`, `docs/asumsi.md`, `docs/catatan-backend.md`,
`database/migrations/2026_10_20_000018_add_compare_price_to_products_table.php`,
`database/seeders/ProductSeeder.php`, `database/factories/{Category,Product,ProductVariant,Review}Factory.php`,
`app/Models/Product.php`, `app/Services/ProductPresenter.php`, `app/Services/CatalogService.php`,
`app/Support/VariantSize.php`, `app/Http/Controllers/ProductController.php`,
`app/Http/Controllers/ContactController.php`, `routes/web.php`, `tests/Feature/Catalog/*`.

### Hasil K11 (20 Oktober 2026)

Rencana di atas dikerjakan seluruhnya, kecuali butir 9 sebagian dan butir 10 tanpa factory baru:

- **Factory tidak dibuat** — data uji dibuat langsung di dalam test (lihat `docs/asumsi.md` K11 butir 8).
  Rencana awal menyebut `database/factories/{Category,Product,ProductVariant,Review}Factory.php`.
- **`app/Http/Controllers/Public/` tidak dipakai** — controller K11 diletakkan di
  `App\Http\Controllers` mengikuti `HomeController`/`MessageController` yang sudah ada (satu gaya,
  tidak ada dua tempat untuk controller publik).

Berkas jadi dan hasil verifikasi:

| Berkas | Isi | Verifikasi |
|---|---|---|
| `app/Support/VariantSize.php` | urutan ukuran baku (XXS…5XL, ALL SIZE) | `php -l` OK; dipakai `ProductPresenter` + `CatalogService` |
| `database/migrations/2026_10_20_000018_add_compare_price_to_products_table.php` | `compare_price` ubigint null setelah `base_price`, `down()` dropColumn | `php -l` OK; **belum dimigrasi** (butuh langkah pemilik: MySQL + `php artisan migrate`) |
| `app/Models/Product.php` | `compare_price` fillable + cast integer + `hasDiscount()` | dipakai presenter; diuji lewat feature test |
| `app/Services/ProductPresenter.php` | key kartu + `compare_price`, `variants[]`, `detail()`, `reviews()`, `ratingDistribution()` | feature test katalog (key kartu & detail di-assert) |
| `app/Services/CatalogService.php` | filter/urut/paginasi/sizes/categories/related satu tempat | feature test katalog |
| `app/Http/Controllers/ProductController.php` | `index()` + `show()` (404 halaman sama, `product: null`, `error` terisi) | feature test + `route:list` |
| `app/Http/Controllers/ContactController.php` | `index()` tanpa props sendiri | feature test kontak |
| `routes/web.php` | `products.index`, `products.show` (constraint slug), `contact` | `php artisan route:list --name=products` → 2 baris; `--name=contact` → GET+POST |
| `database/seeders/ProductSeeder.php` | `compare_price` deterministik 4 produk `[CONTOH]` (DSR-BTK-PKL 109000, DSR-SNT-JMB 125000, KLT-PLS-PRM 99000, STL-PLS-ATS 189000) | `php -l` OK; **seeder belum dijalankan** (butuh DB MySQL pemilik) |
| `tests/Feature/Catalog/{CatalogIndexTest,CatalogShowTest,ContactPageTest}.php` | 24 test | **hijau**: `OK (24 tests, 257 assertions)` |

Catatan menjalankan test di mesin ini: PHP CLI Laragon **belum memuat `pdo_sqlite`**, sementara
`phpunit.xml` memakai SQLite `:memory:`. Test dijalankan tanpa mengubah konfigurasi:

```
php -d extension=pdo_sqlite vendor/bin/phpunit tests/Feature/Catalog
```

`php artisan test tests/Feature/Catalog` juga jalan, tetapi flag `-d` tidak ikut ke proses anak
PHPUnit — pakai `vendor/bin/phpunit` langsung. Langkah menyalakan ekstensi ditulis di
`docs/langkah-pemilik.md`.

Suite penuh: `Tests: 118, Assertions: 758, Failures: 1` — satu kegagalan **bukan dari K11**, yaitu
`tests/Feature/ExampleTest.php` (`GET /` membaca tabel `carousels` di SQLite memori kosong karena
test itu tidak memakai `RefreshDatabase`; sudah tercatat di temuan K9 di atas, pemilik perbaikan
adalah kartu landing K10/K11).

### Celah yang perlu kartu lanjutan (frontend, bukan backend)

`compare_price` sudah LOCKED di kontrak §8.3 dan dikirim server (kartu katalog maupun detail), tetapi
`PriceBlock` **selalu dipanggil tanpa `comparePrice`** sehingga harga coret + badge potongan
(desain §5.3) belum tampil:

- `resources/js/Components/ProductCard.jsx` — tidak punya markup harga coret sama sekali.
- `resources/js/Pages/Public/Products/Show.jsx:258` — `<PriceBlock price={effectivePrice} />`
  tanpa `comparePrice={product?.compare_price}`.

Dibuatkan kartu frontend terpisah (bukan diperbaiki di kartu backend ini, sesuai batas lingkup).

Temuan di luar lingkup lain: `Contact.jsx` membaca `settings.contact_*`; `SettingSeeder` sudah
menyediakan `contact_email`, `contact_phone`, `contact_whatsapp`, `contact_address`,
`contact_map_embed` — tidak ada yang perlu ditambah.

## K12 — rute + controller admin produk, kategori, stok, pesanan, akun (`t_ed8bd8e4`)

Rencana (5 modul, 22 nama rute PRD §5.2):

1. Rute: tambah 22 rute di `routes/admin.php` (produk 7, kategori 4, stok 4, pesanan 3, akun 4) di grup middleware `admin`; rute tulis `throttle:admin-write`.
2. Controller tipis: `Admin/ProductController`, `CategoryController`, `StockController`, `OrderController`, `AccountController`.
3. FormRequest: `Store/UpdateProductRequest`, `Store/UpdateCategoryRequest`, `StockMovementRequest`, `UpdateOrderStatusRequest`, `Store/UpdateAccountRequest`.
4. Service: `ProductAdminService` (sinkron varian + galeri, transaksi), `StockService` (+`increase`/`decrease`/`adjustTo`), `OrderService` (+`changeStatusByAdmin`); tabel transisi status di model `Order`.
5. Kontrak dulu: `docs/kontrak-props.md` §12 (DRAFT) sebelum controller ditulis; asumsi di `docs/asumsi.md`.
6. Berkas disentuh: `routes/admin.php`, `app/Http/{Controllers,Requests}/Admin/*`, `app/Models/Order.php`, `app/Services/*`, `app/Exceptions/OrderStatusException.php`, `tests/Feature/Admin/Admin*Test.php`, `tests/Feature/Contract/RouteContractTest.php` (hapus nama yang sudah terdaftar), `docs/*`.
7. Verifikasi: `php -d extension=pdo_sqlite vendor/bin/phpunit tests/Feature/Admin tests/Feature/Contract tests/Unit`.
8. Celah yang sengaja diserahkan ke kartu frontend: 5 halaman Inertia belum ada (`Admin/Products/Create`, `Edit`, `Show`, `Admin/Stocks/History`, `Admin/Orders/Show`) dan 5 halaman Index masih placeholder props.

### Hasil (2026-10-20)

- 22 rute PRD §5.2 terdaftar di `routes/admin.php` (produk 7, kategori 4, stok 4, pesanan 3, akun 4), grup middleware `admin`, rute tulis `throttle:admin-write`. Bukti: `php artisan route:list --path=admin`.
- Berkas baru: `app/Services/ProductAdminService.php`, `app/Http/Controllers/Admin/Concerns/ListProps.php`, `Admin/{Product,Category,Stock,Order,Account}Controller.php`, `app/Http/Requests/Admin/{StoreProduct,UpdateProduct,StoreCategory,UpdateCategory,StockMovement,UpdateOrderStatus,StoreAccount,UpdateAccount}Request.php`, `app/Exceptions/OrderStatusException.php`.
- Berkas diubah: `app/Models/Order.php` (`STATUS_FLOW`, `STATUS_LABELS`, `PAYMENT_LABELS`, `nextStatuses()`), `app/Models/StockMovement.php` (`TYPE_LABELS`, `typeLabel()`, `signedQty()`), `app/Services/StockService.php` (`increase`/`decrease`), `app/Services/OrderService.php` (`changeStatusByAdmin` + catatan pembatalan), `routes/admin.php`, `docs/kontrak-props.md` §12.
- Test baru: `tests/Feature/Admin/AdminMasterDataTest.php` (8 kasus), `tests/Feature/Admin/AdminSalesTest.php` (7 kasus).
- Verifikasi akhir: `PHP_INI_SCAN_DIR=<scratch>/phpsqlite php artisan test` → **189 passed, 1 incomplete, 0 failed** dari 190 kasus (1111 assertion, 53,06 s), memakai sqlite `:memory:` dari `phpunit.xml`; php.ini dan .env tidak disentuh. `php -l` semua berkas PHP baru: lolos. Bukti mentah: `docs/bukti-phpunit-t_ed8bd8e4.txt` (bagian RUN K12 memuat keluaran suite penuh + terfokus).
- `tests/Feature/Admin/AdminRouteAccessTest.php` (K15) disesuaikan: fixture `idParameterRute()` menambah `ProductVariant` + `Admin` (tanpa itu rute stok/akun membalas 404 sebelum middleware dievaluasi, karena binding model jalan lebih dulu — inilah penyebab 404 yang dilaporkan devops `t_56a2d29c`; setelah perbaikan kedua kasus itu hijau). Verifikasi ulang: `php artisan test --filter=AdminRouteAccessTest` → **6/6 hijau** (14 assertion).
- `tests/Feature/Contract/RouteContractTest.php`: konstanta `PRD_5_2_BELUM_DIIMPLEMENTASI` dikosongkan (DoD kartu) karena 22 rute sudah terdaftar; kalau diisi lagi, rute hilang berubah jadi Incomplete alih-alih gagal.
- 1 incomplete = `RouteContractTest` "metode http rute admin sesuai prd": `admin.messages.read` masih POST di `routes/admin.php`; sesuai keputusan techlead (`t_54bfee4e`) kartu `t_768819a7` yang mengubahnya menjadi PATCH. **(Selesai di `t_768819a7`: rute kini PATCH, `RouteContractTest` hijau tanpa incomplete; sisa 1 failed `AdminInboxTest` milik kartu QA `t_d21ef249`.)**
- Perilaku yang perlu diketahui: substitusi binding model berjalan **sebelum** middleware `auth:admin` (bawaan Laravel), jadi tamu yang meminta id yang tidak ada menerima 404, bukan redirect ke login admin. Untuk data nyata semua rute admin tetap mengalihkan tamu ke `/admin/login`. Tidak diubah karena di luar lingkup kartu; bila ingin 302 dalam semua kasus, atur prioritas middleware atau pakai `->missing()`.
- Belum dicek: tampilan di browser (butuh `artisan serve` + `npm run dev`, milik pemilik); seeder contoh tidak dijalankan ulang di luar suite.
- Serahan ke kartu frontend: halaman JSX `Admin/Products/{Create,Edit,Show}.jsx`, `Admin/Stocks/History.jsx`, `Admin/Orders/Show.jsx` belum ada; `Admin/{Products,Categories,Stocks,Orders,Accounts}/Index.jsx` masih placeholder dan belum membaca props §12.
- Temuan di luar lingkup: `AdminRouteAccessTest::idParameterRute()` membuat pesanan dengan `status = 'menunggu'`, nilai yang tidak ada di kosakata PRD §7/db.md:91 (`pending`, `dibayar`, `diproses`, `dikirim`, `selesai`, `batal`). Tidak diubah karena di luar lingkup kartu ini.

---

## K13 — `admin.messages.read` POST → PATCH (`t_768819a7`, 20 Oktober 2026)

Rencana (maks 10 baris):

1. `routes/admin.php`: `Route::post('/pesan-masuk/{message}/baca')` → `Route::patch(...)`; URI, nama rute, middleware `throttle:admin-write`, dan controller tidak berubah (keputusan techlead `t_54bfee4e`, PRD §5.2 baris 157).
2. Tidak menyentuh controller/FormRequest/route lain; kontrak §10.2 sudah dikoreksi techlead menjadi PATCH.
3. Perbarui catatan metode di `docs/catatan-backend.md` (daftar rute K9 + catatan incomplete K12).
4. Bukti ke `docs/bukti-backend-t_768819a7.txt`: `php -l`, `route:list --name=admin.messages.read`, `route:list --path=admin/pesan-masuk`, suite penuh.
5. Berkas test yang masih memakai POST milik kartu QA `t_d21ef249` (tidak disentuh kartu ini).

Hasil (20 Oktober 2026):

- `routes/admin.php:48` kini `Route::patch('/pesan-masuk/{message}/baca', [MessageController::class, 'read'])` — satu-satunya perubahan kode pada kartu ini (`php -l` bersih).
- `php artisan route:list --name=admin.messages.read` → `PATCH admin/pesan-masuk/{message}/baca → admin.messages.read › Admin\MessageController@read` (bukti lengkap di `docs/bukti-backend-t_768819a7.txt`). Rute tetangga tidak berubah: `GET|HEAD /admin/pesan-masuk` (index) dan `POST /admin/pesan-masuk/{message}/balas` (reply) tetap seperti semula.
- Suite penuh (`PHP_INI_SCAN_DIR=<scratch>/phpsqlite php artisan test`, sqlite `:memory:`): **1 failed, 189 passed (1108 assertions)**, 58,64 s. Satu-satunya merah = `AdminInboxTest::tandai pesan sudah dibaca` (`tests/Feature/Admin/AdminInboxTest.php:147` masih `->post(...)` sehingga 405) — persis kasus yang disebut DoD dan sudah dimiliki kartu QA `t_d21ef249`; kartu ini tidak menyentuh `tests/`. `RouteContractTest` seluruhnya hijau (5/5, termasuk "metode http rute admin sesuai prd"), jadi incomplete lama untuk rute ini hilang.
- Belum dicek: pemanggilan rute dari sisi halaman admin di browser (halaman `Admin/Messages/Index.jsx` masih placeholder; pemilik serahan frontend `t_fc2c5b98`).
- Temuan luar lingkup (tidak diubah kartu ini): `docs/laporan-qa.md:53` baris Q1 masih menulis putusan lama "POST menang" — ditutup lewat QA-005 oleh kartu QA `t_d21ef249`.

---

## B1 — Mode uji Midtrans terlihat + tagihan fake lama dibuat ulang (`t_9f4b6aee`, 21 Oktober 2026)

Rencana (maks 10 baris):

1. Kontrak dulu: `docs/kontrak-props.md` §7.5, §7.7 (`midtrans` + `pembayaran.galat`), §10.7 (prop `midtrans` tab Pembayaran) — sebelum controller disentuh; komentar ke kartu frontend F2 `t_e60e7733` karena §7.7 berstatus LOCKED.
2. `MidtransService`: `modeInfo()` (mode efektif + kode alasan + alasan + langkah perbaikan + `server_key_terisi` + `sumber_kredensial`), `isFakeCharge()`, `needsRegeneration()`.
3. `MidtransService::regenerateCharge()` menulis ulang **baris `payments` yang sama** (kontrak §7.5 = satu tagihan per pesanan) dengan kunci baris; `createQrisCharge()` memakai pembangun parameter yang sama.
4. Seam uji tanpa jaringan: interface `App\Services\Midtrans\MidtransApi` + `SdkMidtransApi` (CoreApi/Transaction), di-bind di `AppServiceProvider`; test memakai fake.
5. `CheckoutController::pay()` dan `status()`: bila mode nyata aktif & tagihan pending masih bermode uji → buat ulang charge; gagal → `pembayaran.galat` + log, halaman tetap 200.
6. `Admin\SettingController::index()`: kirim prop `midtrans` (mode efektif + alasan + sumber kredensial `.env`) untuk tab Pembayaran.
7. `config/midtrans.php` bawaan `fake` → `false` (tanpa server key tetap mode uji) + `.env.example`; mencegah mode uji ikut ke produksi (risiko 1 `docs/review.md`).
8. Test: `tests/Feature/Checkout/MidtransModeTest.php`, `tests/Support/FakeMidtransApi.php`; `tests/Unit/Services/MidtransServiceTest.php` menyesuaikan konstruktor.
9. Verifikasi: `php -l`, `PHP_INI_SCAN_DIR=<scratch>/phpsqlite php artisan test` (sqlite `:memory:`, tidak menyentuh DB pemilik), `route:list`; bukti ke `docs/bukti-backend-t_9f4b6aee.txt`.

Berkas disentuh: `app/Services/MidtransService.php`, `app/Services/Midtrans/{MidtransApi,SdkMidtransApi}.php` (baru),
`app/Providers/AppServiceProvider.php`, `app/Http/Controllers/CheckoutController.php`,
`app/Http/Controllers/Admin/SettingController.php`, `config/midtrans.php`, `.env.example`,
`tests/Support/FakeMidtransApi.php`, `tests/Feature/Checkout/MidtransModeTest.php`,
`tests/Unit/Services/MidtransServiceTest.php`, `docs/kontrak-props.md`, `docs/catatan-backend.md`,
`docs/asumsi.md`, `docs/langkah-pemilik.md` (langkah pemilik bila perlu).

### Hasil (21 Oktober 2026)

- Seam uji: `app/Services/Midtrans/{MidtransApi,SdkMidtransApi}.php` (baru) — interface `charge()`/`status()`; `SdkMidtransApi` memanggil `\Midtrans\CoreApi`/`\Midtrans\Transaction` (satu-satunya tempat SDK disentuh, `bootSdk()` pindah ke sana). Bind di `app/Providers/AppServiceProvider.php::register()`; test menukarnya dengan `tests/Support/FakeMidtransApi.php` sehingga jalur charge nyata teruji tanpa jaringan.
- Mode efektif: `MidtransService::modeInfo()` mengembalikan `mode` (`asli`/`uji`), `fake`, `alasan_kode` (`fake_aktif` | `server_key_kosong` | null), `alasan` (kalimat siap tampil), `langkah_perbaikan[]`, `is_production`, `server_key_terisi`, `sumber_kredensial` = `.env (MIDTRANS_*)`. Dipakai `CheckoutController` (§7.5/§7.7) dan `Admin\SettingController` (§10.7).
- Tagihan fake lama: `MidtransService::needsRegeneration()` + `regenerateCharge()` — charge ulang QRIS ke **baris `payments` yang sama** (transaksi + `lockForUpdate`; bila baris sudah bukan mode uji / sudah dibayar / tidak pending, tidak ditimpa). Dipanggil dari `CheckoutController::pay()` dan `status()`. Tidak ada baris `payments` baru; dibuktikan `tests/Feature/Checkout/PaymentModeTest.php` (7 test, semuanya hijau).
- Gagal charge (mode nyata, jaringan/SDK bermasalah): tidak 500 — `pembayaran.galat` = `Gagal membuat pembayaran QRIS. Coba lagi.` + `Log::warning`, halaman bayar tetap tampil, baris `payments` tidak berubah.
- Bawaan `config/midtrans.php` `fake` → `false` dan `.env.example` `MIDTRANS_FAKE=false`; tanpa `MIDTRANS_SERVER_KEY` perilaku tetap mode uji (`alasan_kode = server_key_kosong`), jadi alur pengembangan tanpa kredensial tidak berubah tetapi bawaan tidak lagi membawa mode uji ke produksi.
- Halaman bayar & status kini memakai payload Midtrans nyata begitu `MIDTRANS_FAKE=false` + server key terisi: `qris_url`/`qr_string`/`transaction_id`/`payload` hasil `charge`, bukan EMVCo lokal.
- `config/midtrans.php`: bawaan `env('MIDTRANS_FAKE', true)` → `env('MIDTRANS_FAKE', false)` (selaras `.env.example`), jadi selama `MIDTRANS_FAKE` tidak diisi eksplisit, QRIS mode uji tidak lagi dipakai tanpa sepengetahuan pemilik. Tanpa `MIDTRANS_SERVER_KEY`, `isFake()` tetap `true` (`alasan_kode = server_key_kosong`) sehingga pengembangan tanpa kredensial tidak berubah.
- Verifikasi: `php -l` semua berkas PHP yang disentuh bersih; `PHP_INI_SCAN_DIR=<scratch>/phpsqlite php artisan test tests/Feature/Checkout tests/Unit/Services/MidtransServiceTest.php` → **31 passed (284 assertions)** (`docs/bukti-t_9f4b6aee.txt`); seluruh suite `php artisan test` → **198 passed (1263 assertions)** (`docs/bukti-suite-t_9f4b6aee.txt`). Keduanya memakai sqlite `:memory:` dari `phpunit.xml`; DB pengembangan pemilik tidak disentuh.
- Belum dicek: pemindaian/transfer QRIS Midtrans sungguhan (butuh kredensial asli + HP pemilik); tampilan penanda mode uji di browser (milik kartu frontend F2 `t_e60e7733`).

### Penutup kartu B1 (21 Oktober 2026)

- **Berkas kode**: `app/Services/Midtrans/{MidtransApi,SdkMidtransApi}.php` (baru), `app/Services/MidtransService.php`, `app/Providers/AppServiceProvider.php`, `app/Http/Controllers/CheckoutController.php`, `app/Http/Controllers/Admin/SettingController.php`, `config/midtrans.php`, `.env.example`.
- **Test**: `tests/Support/FakeMidtransApi.php` (baru), `tests/Feature/Checkout/PaymentModeTest.php` (baru, 7 test), `tests/Unit/Services/MidtransServiceTest.php` (+1 test `test_mode_info_bentuk_baku_mengikuti_kontrak`, konstruktor memakai fake).
- **Kontrak**: `docs/kontrak-props.md` §7.5, §7.7, §7.8 (presisi aturan status), §10.7 — objek `midtrans` baku sama di tiga tempat, `pembayaran.fake`/`pembayaran.galat` ditambahkan. §7.7 dan §10.7 berstatus LOCKED → komentar perubahan ditinggalkan di kartu frontend F2 `t_e60e7733`.
- **Keputusan penting**: (1) tetap satu tagihan per pesanan — baris `payments` lama ditimpa, bukan ditambah (kontrak §7.5); (2) kredensial efektif hanya dari `.env (MIDTRANS_*)`, kolom `settings.midtrans_*` tetap catatan tab admin; (3) penanda mode uji dikirim backend lewat `midtrans` (teks siap tampil), frontend tidak mengarang props; (4) `expires_at` dihitung lewat satu helper `expiresAt()` supaya pembuatan baru dan pembuatan ulang identik.
- **Untuk frontend (F2 `t_e60e7733`)**: baca `midtrans.mode` (`asli`/`uji`) + `midtrans.alasan` + `midtrans.langkah_perbaikan` untuk penanda "MODE UJI" di `QrisPanel` dan status di tab Pembayaran `/admin/pengaturan`; render `pembayaran.galat` bila tidak `null`; jangan render penanda saat `mode = asli` (design §865 D9).
- **Langkah pemilik**: lihat `docs/langkah-pemilik.md` bagian B1 (midtrans): set `MIDTRANS_FAKE=false` + kunci sandbox, `php artisan config:clear` bila pernah `config:cache`, lalu uji transfer QRIS nyata. Tagihan mode uji pada pesanan lama dibuat ulang otomatis saat halaman bayar dibuka.
- **Luar lingkup (tidak dikerjakan di kartu ini)**: `docs/laporan-qa.md:53` masih menulis putusan lama "POST menang" untuk temuan Q1 — ditutup QA lewat kartu `t_d21ef249`; kolom `settings.midtrans_client_key`/`midtrans_is_production` masih catatan tampilan saja (keputusan pemilik `docs/pertanyaan-pemilik.md` §5 P3).

---

## Kartu B2 `t_e35050e8` — masa berlaku QRIS 5 menit (keputusan pemilik `docs/pertanyaan-pemilik.md` §5 P1)

Rencana (21 Oktober 2026):

1. `config/midtrans.php`: `expiry_minutes` dari hard-code `15` → `env('MIDTRANS_EXPIRY_MINUTES', 5)`; nilai tidak sah (kosong, bukan angka, 0, negatif) jatuh ke bawaan 5 menit.
2. `app/Services/MidtransService.php`: helper publik `expiryMinutes()` + `DEFAULT_EXPIRY_MINUTES` — satu sumber untuk `expiresAt()` (kolom `payments.expires_at`) dan `chargeParams()` (`custom_expiry.expiry_duration`), supaya keduanya tidak bisa berbeda.
3. `app/Http/Controllers/CheckoutController.php`: `pembayaran.expiry_minutes` memakai helper yang sama (angka di controller dihapus).
4. `.env.example`, `README.md`, `docs/langkah-pemilik.md`: variabel `MIDTRANS_EXPIRY_MINUTES` + cara override (`php artisan config:clear`).
5. Test: `15` → `5` di `tests/Feature/Checkout/CheckoutTest.php` + `tests/Feature/Checkout/PaymentModeTest.php`; berkas baru `tests/Unit/Services/MidtransExpiryTest.php` (bawaan berkas config, override env, nilai tidak sah, satu sumber nilai) dan `tests/Feature/Checkout/QrisExpiryTest.php` (`custom_expiry` = `expires_at` = 5 menit pada tagihan nyata, override 3 menit, buat ulang tagihan).
6. Konten contoh: `database/seeders/FaqSeeder.php` masih menulis "Kode QRIS berlaku 15 menit" → 5 menit (berubah setelah pemilik menjalankan ulang seeder).
7. Dokumen: `docs/kontrak-props.md` §7.5 contoh `expiry_minutes` 15 → 5 (§7.5 LOCKED → komentar di kartu frontend F2 `t_e60e7733`), `docs/asumsi.md` butir 4 ditandai digantikan keputusan pemilik, `docs/catatan-backend.md` (bagian ini).
8. Di luar lingkup: `docs/PRD.md` §8 butir 6 + A17 (masih 15 menit) menunggu amendemen pemilik — dicatat di `docs/langkah-pemilik.md`.

### Hasil (kartu `t_e35050e8`, 21 Oktober 2026)

| Berkas | Perubahan |
|---|---|
| `config/midtrans.php` | `expiry_minutes` dari hard-code `15` → `env('MIDTRANS_EXPIRY_MINUTES', 5)`; hanya bilangan bulat ≥ 1 diterima (`filter_var` + `min_range`), nilai lain (kosong, teks, pecahan, 0, negatif) jatuh ke bawaan 5 |
| `app/Services/MidtransService.php` | `DEFAULT_EXPIRY_MINUTES = 5` + helper publik `expiryMinutes()`; `expiresAt()` dan `chargeParams()` (`custom_expiry.expiry_duration`) memakai helper itu — satu sumber nilai |
| `app/Http/Controllers/CheckoutController.php` | `pembayaran.expiry_minutes` dari helper yang sama (angka di controller dihapus) |
| `.env.example`, `README.md` | `MIDTRANS_EXPIRY_MINUTES=5` + catatan `php artisan config:clear` bila diubah |
| `database/seeders/FaqSeeder.php` | teks contoh FAQ "Kode QRIS berlaku 15 menit" → "berlaku 5 menit setelah pesanan dibuat" |
| `docs/kontrak-props.md` | §7.5 contoh `pembayaran.expiry_minutes` → 5 + penjelasan sumber nilai; baris status §7.11 ditambah (LOCKED diperbarui) |
| `docs/asumsi.md` | butir 4 (kedaluwarsa 15 menit) ditandai digantikan keputusan pemilik |
| `docs/langkah-pemilik.md` | durasi 5 menit + cara override + catatan PRD belum diamendemen |
| `tests/Feature/Checkout/CheckoutTest.php`, `PaymentModeTest.php` | nilai `midtrans.expiry_minutes` di test 15 → 5 |
| `tests/Unit/Services/MidtransExpiryTest.php` (baru) | bawaan berkas config, override env, nilai env tidak sah, satu sumber nilai |
| `tests/Feature/Checkout/QrisExpiryTest.php` (baru) | prop `pembayaran.expiry_minutes`, `custom_expiry`, kolom `payments.expires_at`, dan prop `pembayaran.expires_at` sama-sama 5 / 3 / 2 menit (tagihan baru dan tagihan mode uji yang dibuat ulang) |

Verifikasi yang dijalankan:

```
PHP_INI_SCAN_DIR=<scratch>/phpsqlite php artisan test tests/Unit/Services/MidtransExpiryTest.php tests/Feature/Checkout
```

Hasil: **36 test lulus, 347 assertion** (seluruh `tests/Feature/Checkout` ikut dijalankan supaya tidak ada regresi). Keluaran tersimpan di `docs/bukti-t_e35050e8-test.txt`. Database test = SQLite `:memory:` (`phpunit.xml`), jadi database pengembangan tidak disentuh.

Seluruh suite juga dijalankan: `php artisan test` → **206 test lulus, 1340 assertion** (exit 0, 59,47 detik), keluaran di `docs/bukti-suite-t_e35050e8.txt` — naik 8 test dari 198 test pada kartu B1 karena 4 test unit + 4 test feature baru di kartu ini.

Belum dicek / butuh pemilik: (a) seeder FAQ belum dijalankan ulang, jadi teks FAQ di database pengembangan masih "15 menit" sampai pemilik menjalankan `php artisan db:seed --class=FaqSeeder`; (b) tagihan QRIS nyata ke Midtrans belum diuji (butuh kredensial sandbox).

Untuk frontend (F2 `t_e60e7733`): **tidak ada perubahan wajib** — teks "lalu bayar dalam N menit" di `resources/js/Pages/Public/Checkout.jsx` sudah membaca `pembayaran.expiry_minutes`, dan `Countdown` memakai `pembayaran.expires_at`; yang berubah hanya angkanya (15 → 5). Catatan kontrak §7.5 sudah ditulis di kartu F2.

## B1b — kolom + rute nomor resi pesanan (kartu `t_b078318d`, 21 Oktober 2026)

Rencana (maks 10 baris) — bentuk sudah dibekukan techlead (`docs/keputusan-a15-resi.md` §1),
kontrak §12.18a sudah ada jadi **tidak ada perubahan kontrak** di kartu ini:

1. Migrasi baru `database/migrations/2026_10_21_000019_add_tracking_number_to_orders_table.php`
   (kolom `orders.tracking_number` string 60, nullable, `after('paid_at')`; `down()` drop kolom).
2. `tracking_number` masuk `App\Models\Order::$fillable` (tanpa cast, tanpa aksesori).
3. Rute `PATCH /admin/pesanan/{order}/resi` name `admin.orders.resi` middleware
   `throttle:admin-write`, tepat setelah `orders.status` di blok Pesanan `routes/admin.php`.
4. `App\Http\Requests\Admin\UpdateOrderTrackingRequest` — `nullable|string|max:60`, `''` → `null`,
   pesan persis kontrak: `Nomor resi maksimal 60 karakter.` / `Nomor resi harus berupa teks.`
5. `OrderController@resi` hanya menulis kolom itu lalu `back()->with('success','Nomor resi pesanan diperbarui.')`.
6. `OrderController::detail()` menambah key `tracking_number` (kontrak §12.17 sudah memuatnya).
7. Test feature di `tests/Feature/Admin/AdminSalesTest.php` (sukses, kosong = hapus, >60 = 422 +
   pesan kontrak, bukan teks, non-admin ditolak, props §12.17, `down()` migrasi).
8. Verifikasi: `php -l`, `route:list`, test suite (SQLite `:memory:`), `migrate:status` (DB pengembangan).

Berkas disentuh: migrasi baru, `app/Models/Order.php`, `routes/admin.php`,
`app/Http/Requests/Admin/UpdateOrderTrackingRequest.php` (baru),
`app/Http/Controllers/Admin/OrderController.php`, `tests/Feature/Admin/AdminSalesTest.php`,
`docs/bukti-backend-t_b078318d.txt` (baru), `docs/catatan-backend.md`.

### Hasil (kartu `t_b078318d`, 21 Oktober 2026)

Kontrak: **tidak ada perubahan** — bentuk dibekukan techlead di `docs/keputusan-a15-resi.md` §1 dan kontrak
§12.18a sudah ada; implementasi mengikutinya apa adanya (PATCH, `throttle:admin-write`, pesan galat & flash
persis, `tracking_number` di props §12.17). `docs/db.md` juga sudah memuat kolom & baris migrasinya.

| Berkas | Isi | Verifikasi |
| --- | --- | --- |
| `database/migrations/2026_10_21_000019_add_tracking_number_to_orders_table.php` (baru) | `orders.tracking_number` string(60) null `after('paid_at')`; `down()` `dropColumn` | `php -l` OK; `up()`/`down()` diuji di suite (sqlite `:memory:`); **belum dimigrasi** ke DB pengembangan (langkah pemilik) |
| `app/Models/Order.php` | `tracking_number` masuk `$fillable`; docblock A15 | `php -l` OK, `AdminSalesTest` 13/13 hijau |
| `app/Http/Requests/Admin/UpdateOrderTrackingRequest.php` (baru) | `nullable\|string\|max:60`; `''` → `null` (trim); pesan persis kontrak | kasus 60, 61 karakter, dan input bukan teks hijau |
| `app/Http/Controllers/Admin/OrderController.php` | `resi()` hanya menulis satu kolom + `back()` + flash; `detail()` menambah key `tracking_number` | `route:list` memuat `admin.orders.resi`; 8 kasus baru hijau |
| `routes/admin.php` | `PATCH /admin/pesanan/{order}/resi` name `admin.orders.resi`, middleware `throttle:admin-write`, tepat setelah `orders.status` | `route:list` OK (4 rute pesanan) |
| `tests/Feature/Admin/AdminSalesTest.php` | 8 kasus baru (props, sukses+trim, kosong/null = hapus, >60 & bukan teks, non-admin, `up()`/`down()` migrasi, 422 untuk klien JSON) | `AdminSalesTest` + `AdminRouteAccessTest` → **20 lulus, 127 assertion** |
| `docs/bukti-backend-t_b078318d.txt` (baru) | bukti mentah | `route:list`, `migrate:status`, suite penuh |

Verifikasi yang dijalankan:
- `php -l` → 6 berkas PHP bersih (migrasi, model, rute, request, controller, test).
- `php artisan route:list --path=admin/pesanan` → 4 rute, termasuk `PATCH admin/pesanan/{order}/resi`.
- `PHP_INI_SCAN_DIR=<scratch>/phpsqlite php artisan test` (suite penuh, sqlite `:memory:` dari `phpunit.xml`):
  **213 passed, 1391 assertion**, exit 0. Fokus admin: **20 lulus, 127 assertion**. DB pengembangan tidak disentuh.
- `php artisan migrate:status` (read-only, DB pengembangan): `2026_10_20_000018` (K11) dan
  `2026_10_21_000019` (kartu ini) berstatus **Pending**. Sengaja tidak dijalankan: `php artisan migrate`
  akan sekaligus menerapkan migrasi K11 yang di luar lingkup kartu ini. Langkah pemilik ditulis di
  `docs/langkah-pemilik.md` §"Migrasi kolom nomor resi".

Catatan untuk frontend: props detail pesanan `pesanan.tracking_number` sudah terisi (`string|null`) —
form cukup PATCH ke `/admin/pesanan/{id}/resi` dengan field `tracking_number`; `''`/`null` menghapus.
Sukses = redirect balik + `flash.success` `Nomor resi pesanan diperbarui.`; galat = `errors.tracking_number`
(`Nomor resi maksimal 60 karakter.` / `Nomor resi harus berupa teks.`). Kolom belum ada di MySQL
pengembangan sampai pemilik menjalankan `php artisan migrate`, jadi uji klik end-to-end menunggu langkah itu.

Belum dicek: perilaku UI nyata (klik simpan/hapus di `resources/js/Pages/Admin/Orders/Show.jsx` belum
memuat form resi — itu lingkup kartu frontend), dan migrasi belum diterapkan ke MySQL pengembangan.

## B1 — `ulasan.boleh` §7.9: hitung sisa produk belum diulas (kartu `t_45344e00`, 21 Oktober 2026)

Rencana (maks 10 baris) — definisi sudah dibekukan techlead (`docs/keputusan-f6-ulasan-boleh.md` §1–§2)
dan tertulis di kontrak §7.9/§7.11, jadi **tidak ada perubahan kontrak** di kartu ini:

1. `app/Http/Controllers/CheckoutController.php` — suntik `ReviewService`; `success()` mengirim
   `boleh` = `ReviewService::isEligible($order)` **dan** masih ada `product_id` unik di `order_items`
   yang belum ada di `reviews` order itu. Daftar status tetap satu sumber di `ReviewService` (tidak disalin).
2. `ulasan.sudah` tidak berubah (daftar `product_id` yang sudah diulas). Tanpa rute, kolom, migrasi,
   atau props baru.
3. Test regresi 5 kasus di `tests/Feature/Checkout/CheckoutTest.php` (butuh produk ke-2 + helper
   keranjang 2 produk + helper pesanan lunas).
4. Verifikasi: `php -l` pada berkas yang disentuh, `php artisan test --filter=CheckoutTest`
   (SQLite `:memory:` dari `phpunit.xml`, DB pengembangan tidak disentuh).

Berkas disentuh: `app/Http/Controllers/CheckoutController.php`,
`tests/Feature/Checkout/CheckoutTest.php`, `docs/bukti-backend-t_45344e00.txt` (baru),
`docs/catatan-backend.md`.

### Hasil (21 Oktober 2026)

- `CheckoutController::success()` (baris 167–192): `ulasan.boleh` kini
  `$belumDiulas !== [] && $this->reviews->isEligible($order)`. `$belumDiulas` = `product_id`
  unik dari `$order->items` yang belum ada di `reviews` order itu; `ReviewService` disuntik
  lewat konstruktor (tidak ada daftar status yang disalin ke controller — sumber tetap §9.1).
  `ulasan.sudah` tidak berubah.
- 5 test regresi baru (kasus 1–5 kartu) di `CheckoutTest.php`, dengan produk ke-2,
  `isiKeranjangDuaProduk()`, `pesananDuaProdukLunas()`, dan `kirimUlasan()`.
- `php artisan test --filter=CheckoutTest` → **19 passed (215 assertions)**; suite penuh
  `php artisan test` → **218 passed (1492 assertions)**. Keluaran ditempel di
  `docs/bukti-backend-t_45344e00.txt`.
- Kontrol negatif: ekspresi lama (`'boleh' => $reviewedProductIds === []`) dipasang sementara →
  test (2) `Failed asserting that false is identical to true` dan test (4) `... true is identical
  to false`; berkas dikembalikan dan diverifikasi identik (`diff -q`). Jadi kedua test memang
  mengunci bug §7.9.
- Lingkungan: driver sqlite di `php.ini` Laragon masih dikomentari, jadi verifikasi memakai
  `PHP_INI_SCAN_DIR=<scratch>/phpsqlite php artisan test ...` (isi: `extension=pdo_sqlite`,
  `extension=sqlite3`). `php.ini` pemilik tidak diubah; tanpa env itu test gagal
  `could not find driver (Connection: sqlite, Database: :memory:)`.
- Belum dicek: halaman `/checkout/{order}/selesai` secara nyata di browser (lingkup pemilik,
  frontend memakai props yang sama — bentuk props tidak berubah, hanya nilai `boleh`).
- Tidak dijalankan di kartu ini: migrasi/seeder/db:seed, `migrate:fresh`, dan perintah apa pun
  terhadap DB pengembangan.

## B3 — Aksi admin sinkronkan status pembayaran (kartu `t_c374a29b`, 21 Oktober 2026)

Rencana (maks 10 baris):

1. Kontrak dulu: tambah §12.24 di `docs/kontrak-props.md` (rute, middleware, perilaku, flash);
   jangan mengubah bagian lain — termasuk baris tabel §12.23.
2. `MidtransService::syncStatusOrFail()` baru memakai `MidtransApi::status()` yang sudah ada;
   `syncStatus()` (best-effort, polling pembeli) tidak diubah.
3. Rute `PATCH /admin/pesanan/{order}/sinkron-pembayaran` (`admin.orders.sinkron-pembayaran`,
   `throttle:admin-write`) di `routes/admin.php` sesudah `orders.resi`.
4. `Admin\OrderController::syncPayment` — payment null / mode uji / sudah settlement → flash error
   tanpa panggilan API; sisanya `syncStatusOrFail()`; `CheckoutException` → `flash.error`, bukan 500;
   `Log::info` kode pesanan + status lama→baru tanpa rahasia.
5. Test baru `tests/Feature/Admin/AdminSyncPaymentTest.php` memakai `Tests\Support\FakeMidtransApi`.
6. Tidak ada kolom/migrasi baru; `docs/db.md` dikomentari (tanpa perubahan skema).

Berkas disentuh: `docs/kontrak-props.md`, `app/Services/MidtransService.php`,
`app/Http/Controllers/Admin/OrderController.php`, `routes/admin.php`,
`tests/Feature/Admin/AdminSyncPaymentTest.php` (baru), `docs/bukti-backend-t_c374a29b.txt` (baru),
`docs/catatan-backend.md`, `docs/db.md`.

### Hasil (21 Oktober 2026)

- Kontrak: `docs/kontrak-props.md` §12.24 ditambahkan setelah §12.18a (rute, middleware, perilaku,
  tiga flash "tanpa panggilan API", dua flash sukses, flash galat, aturan log). Tidak ada bagian
  lain yang diubah — khususnya baris tabel `tracking_number` §12.23 tetap apa adanya.
- `MidtransService::syncStatusOrFail(Payment)` (`app/Services/MidtransService.php` baris ~310–337):
  mode uji → `CheckoutException('Mode uji Midtrans: status tidak bisa disinkronkan.')`;
  `order_id_midtrans` kosong → `CheckoutException` lain; sukses menerapkan status lewat
  `applyStatus()` yang sudah ada (idempoten, status final tidak mundur, stok ikut kembali lewat
  `StockService::restoreForCancellation`). `syncStatus()` lama TIDAK diubah (masih best-effort
  untuk polling pembeli). Docblock kelas menyebut pemakaian baru ini.
- `Admin\OrderController::syncPayment` (`app/Http/Controllers/Admin/OrderController.php` baris
  155–207): urutan cek tanpa panggilan API = (1) `payment` null → flash error, (2) sudah
  `settlement` → flash sukses "Pembayaran sudah lunas…", (3) mode uji (`isFake()` atau
  `isFakeCharge()`) → flash error; baru sesudah itu `syncStatusOrFail()`. `CheckoutException`
  ditangkap → `flash.error` "Gagal memeriksa status pembayaran. Coba lagi.", tidak ada HTTP 500.
  Controller tidak menulis ke `payments`/`orders`/stok sendiri (satu jalur dengan webhook).
  `Log::info` hanya memuat kode pesanan + `payment`/`order_status` lama→baru.
  Konstruktor kini juga menerima `MidtransService` (Laravel menyuntik otomatis).
- Rute: `PATCH /admin/pesanan/{order}/sinkron-pembayaran` → `admin.orders.sinkron-pembayaran`
  (`routes/admin.php` baris 142–145), middleware `web` + `admin` + `throttle:admin-write`
  (sama dengan §12.18a). Komentar blok pesanan diperbarui (`§12.16–§12.18a, §12.24`).
- Test: `tests/Feature/Admin/AdminSyncPaymentTest.php` (baru, 12 kasus, `FakeMidtransApi`):
  settlement→dibayar+`paid_at`, status sama, status tak dikenal, expire→batal+stok kembali
  (`stock_movements` `in`, qty 2) , status final tidak mundur, tanpa tagihan, mode uji global,
  tagihan lama mode uji, sudah lunas, kegagalan Midtrans → `flash.error` + status tersimpan utuh,
  log tanpa rahasia (`Log::spy`), tamu/pembeli ditolak.
- Verifikasi:
  ```text
  php -l (berkas disentuh)                                    -> tanpa syntax error
  php artisan test tests/Feature/Admin/AdminSyncPaymentTest.php
                                                              -> 12 passed (55 assertions)
  php artisan test tests/Feature/Contract/RouteContractTest.php tests/Feature/Admin/AdminSyncPaymentTest.php
                                                              -> 17 passed (60 assertions)
  php artisan test                                            -> 237 passed (1791 assertions)
  php artisan route:list --path=admin/pesanan -v              -> 5 rute; rute baru terdaftar
                                                                 dengan web, admin, throttle:admin-write
  ```
  Keluaran lengkap: `docs/bukti-backend-t_c374a29b.txt`. Tambahan kecil di luar rencana:
  dua nama rute pesanan (`admin.orders.resi`, `admin.orders.sinkron-pembayaran`) dimasukkan ke
  daftar `tests/Feature/Contract/RouteContractTest.php` agar rute baru ikut terjaga kontraknya.
- Lingkungan: driver sqlite di `php.ini` pemilik masih dikomentari, jadi test memakai
  `PHP_INI_SCAN_DIR=<scratch php-ini>/ php artisan test` (isi `extension=pdo_sqlite`,
  `extension=sqlite3`). `php.ini` dan `.env` pemilik tidak disentuh.
- Belum dicek: tombolnya diklik di browser pada server pengembangan (lingkup pemilik/frontend);
  kartu frontend memakai rute + flash yang sama (tidak ada key flash baru — `flash.success` /
  `flash.error` saja). Tidak dijalankan di kartu ini: migrasi/seeder/`db:seed`, `migrate:fresh`,
  dan perintah apa pun terhadap DB pengembangan.
- Catatan: tidak ada kolom atau migrasi baru, jadi `docs/db.md` tidak berubah — `payments` dan
  `orders` (termasuk `payment_status`, `paid_at`, `tracking_number`) sudah mendukung aksi ini.



## G2 — 2 migrasi tertunda dijalankan di DB pemilik (kartu `t_576d4f09`, 21 Oktober 2026)

Rencana (maks 10 baris):

1. Rekam `php artisan migrate:status` sebelum — dua baris Pending: 000018 `compare_price`,
   000019 `tracking_number`.
2. Jalankan `php artisan migrate` (hanya ini; tanpa fresh/rollback/wipe) pada MySQL pemilik `toko-kulot`.
3. Rekam `migrate:status` sesudah — keduanya Ran, baris Pending = 0.
4. Bukti baca-saja di DB pemilik: `Schema::hasColumn('products','compare_price')`,
   `Schema::hasColumn('orders','tracking_number')`, `SHOW COLUMNS`, dan baca contoh baris.
5. Jalankan uji otomatis yang menyentuh kedua kolom (admin produk, resi pesanan, katalog, unit harga coret).
6. Tanpa perubahan kode/migrasi/.env; berkas baru hanya di `docs/`.

Berkas disentuh: `docs/bukti-migrate-g2.txt` (baru), `docs/catatan-backend.md`.

### Hasil

- `2026_10_20_000018_add_compare_price_to_products_table` dan
  `2026_10_21_000019_add_tracking_number_to_orders_table` kini **Ran batch [2]** di MySQL pemilik
  (`toko-kulot`); baris Pending 2 → 0; tanpa galat.
- Baca-saja: `products.compare_price` bigint unsigned null, `orders.tracking_number` varchar(60) null;
  `Schema::hasColumn` keduanya `true`; data lama utuh (11 produk, 9 pesanan; kolom baru masih NULL).
- Uji: `php artisan test` gagal karena `pdo_sqlite` belum aktif di `php.ini` mesin ini (mesin, bukan
  kode). Ulangan `php -d extension=pdo_sqlite vendor/bin/phpunit --filter '(AdminMasterDataTest|AdminSalesTest|CatalogIndexTest|CatalogShowTest|ProductPricingTest)'`
  → **OK (49 tests, 415 assertions)**; DB uji SQLite `:memory:` dari `phpunit.xml`, DB pemilik tidak tersentuh.
- Belum diuji: klik ulang `/admin/produk/tambah`, `/admin/produk/12/ubah`, dan resi
  `/admin/pesanan/{order}` — butuh server + browser pemilik (DB pemilik tidak punya produk id=12).
- Langkah pemilik bila ingin `php artisan test` jalan tanpa flag: aktifkan `extension=pdo_sqlite` +
  `extension=sqlite3` di `php.ini` (`docs/langkah-pemilik.md` §7).


## B4 — QRIS asli: normalisasi respons SDK Midtrans (kartu `t_3bfe3165`, 22 Oktober 2026)

Rencana (maks 10 baris):

1. Baca `docs/review-2.md` §6 G1 + docblock seam `MidtransApi.php:14-27`; kontrak props §7.7
   tidak berubah (key `qris_url`/`qr_string`/`pembayaran.*` sudah ada, tidak ada key baru).
2. `app/Services/Midtrans/SdkMidtransApi.php`: panggilan SDK dipisah ke seam test
   `requestCharge()`/`requestStatus()`, lalu hasilnya dinormalkan **rekursif** (stdClass/objek →
   array) sebelum dikembalikan, supaya docblock seam benar-benar dipenuhi.
3. `MidtransService::qrUrl()` **tidak diubah** — perbaikan hanya di adapter.
4. Test baru memakai bentuk respons SDK (`json_decode()` tanpa `true` → stdClass bersarang):
   `charge()`, `status()`, dan alur `POST /checkout` → halaman bayar menampilkan QR asli.
5. Test harus GAGAL pada adapter lama (bukti RED) lalu lulus sesudah perbaikan (GREEN).
6. Jalankan `php -d extension=pdo_sqlite vendor/bin/phpunit ...` (pdo_sqlite belum aktif di
   `php.ini` mesin ini) lalu suite penuh; rekam di `docs/bukti-backend-t_3bfe3165.txt`.
7. Tanpa migrasi/kolom baru; `.env` tidak disentuh.

Berkas disentuh: `app/Services/Midtrans/SdkMidtransApi.php`,
`tests/Feature/Checkout/MidtransSdkShapeTest.php` (baru),
`docs/bukti-backend-t_3bfe3165.txt` (baru), `docs/catatan-backend.md`.

### Hasil (kartu `t_3bfe3165`, 22 Oktober 2026)

- **Perbaikan.** `SdkMidtransApi` kini menormalkan respons SDK **rekursif** (`normalizeResponse()` /
  `normalizeValue()`: objek/stdClass dan `JsonSerializable` → array, array disusuri sampai dalam) untuk
  `charge()` dan `status()`, sehingga docblock seam `MidtransApi.php:14-27` benar-benar dipenuhi.
  Panggilan SDK mentah dipisah ke `requestCharge()`/`requestStatus()` (`protected`, satu-satunya titik
  jaringan) supaya test bisa memakai bentuk respons SDK apa adanya tanpa menghubungi Midtrans.
  `MidtransService::qrUrl()` **tidak diubah**; tidak ada kolom/migrasi baru; `.env` tidak disentuh.
- **Penyebab terbukti.** Skrip reproduksi (scratch, tidak masuk repo) memakai
  `(array) json_decode($json)` + `$action['url']` (baris yang sama dengan `MidtransService.php:540`)
  → `Error: Cannot use object of type stdClass as array`; dengan normalisasi rekursif → URL terbaca.
  Bukti lengkap: `docs/bukti-backend-t_3bfe3165.txt` §2.
- **Test baru** `tests/Feature/Checkout/MidtransSdkShapeTest.php` (4 test) memakai `json_decode()` tanpa
  `true` — bentuk persis SDK. RED pada adapter lama (`Errors: 2, Failures: 2`, termasuk
  `POST /checkout` gagal karena charge melempar `CheckoutException`); GREEN sesudah perbaikan
  (`OK (4 tests, 49 assertions)`), termasuk `GET /checkout/{order}/bayar` → `pembayaran.qris_url`
  terisi dan `pembayaran.galat` null.
- **Uji.** `php -d extension=pdo_sqlite vendor/bin/phpunit` → **OK (242 tests, 1844 assertions)**
  (sebelumnya 237/1791). Uji terkait Midtrans (6 kelas) → OK (57 tests, 555 assertions).
  `vendor/bin/pint --test` → passed.
- **`php artisan test`** tetap gagal total di mesin ini (`could not find driver`, proses anak tidak
  mewarisi `-d extension=pdo_sqlite`) — masalah mesin, bukan kode; lihat `docs/langkah-pemilik.md`
  §“Menjalankan test”. DB uji SQLite `:memory:`, DB MySQL pemilik tidak tersentuh.
- **Kontrak.** Kontrak props §7.7 tidak berubah: tidak ada key baru, hanya `qris_url` yang kini benar-benar
  terisi di mode asli seperti yang sudah dijanjikan §7.7 (`docs/kontrak-props.md:478`). Frontend tidak
  perlu perubahan.
- **Belum diuji (jujur).** Charge QRIS sungguhan ke Midtrans sandbox — butuh kredensial pemilik dan
  server; kartu ini tidak menyentuh `.env`. Untuk gerbang G1 `t_fcfc3687`: pemilik harus membuat
  **pesanan uji baru** setelah ini (transaksi lama tidak bisa di-`charge` ulang dengan `order_id` sama —
  usulan **U8**, di luar lingkup kartu ini) lalu memeriksa QR tampil di `/checkout/{order}/bayar`.
- **Di luar lingkup / dicatat.** Penanganan `order_id` duplikat saat charge ulang (U8) tidak dikerjakan
  di sini. Selain itu `app/Services/Midtrans/SdkMidtransApi.php` dan
  `app/Services/Midtrans/MidtransApi.php` masih belum terlacak git (`??`) — kebersihan repo, bukan
  lingkup kartu ini. Commit tidak dibuat oleh agent; R8 (satu kartu satu commit) diserahkan ke
  techlead/pemilik karena workspace berisi 42 berkas berubah milik kartu lain.






## P3 — pesan `customer_city.max` di CheckoutRequest (kartu `t_f39eba9d`, 22 Oktober 2026)

Temuan QA `docs/laporan-qa-2.md` OBS-1 (bukti `docs/bukti-qa-t_43d8bcd7.txt` §4B).

Rencana (maks 10 baris):

1. Hanya menambah satu entri `'customer_city.max' => 'Kota/kecamatan maksimal 100 karakter.'`
   di `CheckoutRequest::messages()`; `rules()`, `attributes()`, pesan lain, dan frontend tidak diubah.
2. Teks pesan disalin dari klien `resources/js/Pages/Public/Checkout.jsx:69` (sudah ada).
3. Tambah 1 test regresi HTTP di `tests/Feature/Checkout/CheckoutTest.php`
   (`test_validasi_kota_lebih_dari_100_karakter_memakai_pesan_indonesia`): POST `/checkout`
   dengan kota 101 karakter harus memunculkan pesan itu dan 0 order.
4. Bukti RED: cabut sementara baris pesan → test gagal dengan pesan bawaan Inggris
   ("The kota/kabupaten field must not be greater than 100 characters."); pasang lagi → hijau.
5. Verifikasi: `php artisan test --filter=Checkout` dan suite penuh; ekstensi sqlite dimuat
   per-invokasi lewat `PHP_INI_SCAN_DIR` scratch (php.ini global dan `.env` tidak disentuh).
6. Tanpa migrasi, seeder, paket baru, atau perubahan frontend.

Hasil nyata:

- Test regresi: `1 passed (4 assertions)`, exit 0.
- `php artisan test --filter=Checkout`: `49 passed (730 assertions)`, exit 0.
- Suite penuh: `242 passed (1844 assertions)`, exit 0.
- RED terbukti (1 failed / 3 assertions, exit 1) saat baris pesan dicabut.

Berkas disentuh: `app/Http/Requests/CheckoutRequest.php` (+1 baris),
`tests/Feature/Checkout/CheckoutTest.php` (+1 test), `docs/bukti-backend-t_f39eba9d.txt` (baru),
`docs/catatan-backend.md`. Kontrak props tidak berubah (tidak ada key baru, hanya teks galat).

## U8 — `order_id` Midtrans unik per panggilan charge (kartu `t_a90d5215`, 22 Oktober 2026)

Rencana (maks 10 baris):

1. `MidtransService::nextMidtransOrderId()`: `{orders.code}-{6 hex}` (23 dari batas 60 char),
   dihitung SEKALI per panggilan charge lalu dipakai untuk `chargeParams()` + `order_id_midtrans`.
2. Jalur asli saja: `createQrisCharge()` non-fake dan `regenerateCharge()`; cabang mode uji
   (`:123-137`) tetap `$order->code` (petunjuk techlead: `isFakeCharge()`/`needsRegeneration()`
   bergantung penanda `fake-`/`payload.mode`, dan tidak memanggil Midtrans).
3. Tanpa migrasi, tanpa perubahan `orders.code`, rute, bentuk respons, atau kontrak props.
4. Test baru `tests/Feature/Checkout/MidtransOrderIdUniqueTest.php` (a) dua charge order sama →
   ID berbeda, (b) checkout ulang setelah gagal pasca-charge tidak kena `order_id` duplikat,
   (c) notifikasi dengan ID bersufiks tetap memperbarui status.
5. `FakeMidtransApi` diberi opsi menolak ID duplikat + status bawaan; ekspektasi
   `PaymentModeTest` dan `MidtransSdkShapeTest` yang masih `= orders.code` disesuaikan.
6. Bukti: phpunit lewat `PHP_INI_SCAN_DIR` scratch (SQLite `:memory:`), `pint --test`;
   hasil di `docs/bukti-backend-t_a90d5215.txt`.

Hasil:

- `MidtransService.php`: konstanta `MIDTRANS_ORDER_ID_MAX_LENGTH = 60` &
  `MIDTRANS_ORDER_ID_SUFFIX_LENGTH = 6`; `nextMidtransOrderId()` (basis `mb_substr` 53 char,
  sufiks 6 hex uppercase, cek tabrakan di `payments.order_id_midtrans`, retry 5x);
  `chargeOrder(Order, string)` meneruskan ID ke `chargeParams()` sehingga parameter Midtrans
  dan kolom DB dijamin sama; `createQrisCharge()` dan `regenerateCharge()` menghitung ID
  SEKALI per charge. Cabang mode uji tidak diubah.
- `tests/Support/FakeMidtransApi.php`: `rejectDuplicateOrderIds` + `usedOrderIds`
  (simulasi 406) dan `defaultTransactionStatus` (status untuk ID yang tidak terdaftar).
- `tests/Feature/Checkout/MidtransOrderIdUniqueTest.php` (3 test): dua charge → ID berbeda;
  checkout gagal pasca-charge (actions stdClass) → 500 + rollback + checkout ulang sukses
  walau ID duplikat ditolak; notifikasi dengan ID bersufiks → settlement + pesanan dibayar.
- `tests/Feature/Checkout/PaymentModeTest.php` & `MidtransSdkShapeTest.php`: ekspektasi
  `order_id`/`qris_url` memakai ID bersufiks dari baris `payments`, bukan `orders.code`.
- Hasil: test baru `OK (3 tests, 38 assertions)`; filter Checkout|Midtrans|Payment
  `OK (78 tests, 873 assertions)`; suite penuh `OK (245 tests, 1884 assertions)`;
  `pint --test` pada 5 berkas `passed`.
- RED terbukti: `nextMidtransOrderId()` sementara `return $order->code` → 3/3 test gagal
  (13 assertions), lalu dikembalikan.
- Tanpa migrasi, tanpa perubahan `orders.code`, rute, kontrak props, atau bentuk respons.
- Catatan: docblock migrasi `2026_10_20_000012_create_payments_table.php:9` masih menulis
  `order_id_midtrans = orders.code`. Migrasi sengaja tidak diubah (beku); semantik baru
  adalah `orders.code + "-" + 6 hex`, dan pembacaan status/webhook tetap lewat kolom itu.

## B6 — penyebab asli gagal charge Midtrans ikut dicatat (kartu `t_1f72a2d1`, 22 Oktober 2026)

Rencana (maks 10 baris):

1. `MidtransService::chargeOrder()` mencatat `exception` (kelas), `code`, dan `previous`
   (daftar kelas/kode/pesan `getPrevious()` sampai 5 tingkat) di samping `error` yang sudah ada.
2. Kredensial (`midtrans.server_key`/`client_key`) disensor dari pesan sebelum ditulis ke log,
   walau pesan SDK saat ini tidak memuatnya.
3. Tidak ada perubahan pesan untuk pembeli/admin (kontrak props §7.7 `pembayaran.galat` tetap
   `Gagal membuat pembayaran QRIS. Coba lagi.`), rute, atau bentuk respons → kontrak tidak berubah.
4. Test baru `tests/Feature/Checkout/MidtransChargeLogTest.php`: api palsu melempar exception
   ber-previous "HTTP status code: 401 ... API response: ..." → log memuatnya, pesan tampil sama;
   plus kasus tanpa previous.
5. Tanpa migrasi, tanpa `.env`, tanpa server; bukti di `docs/bukti-backend-t_1f72a2d1.txt`.

## B7a — kontrak warna varian di props publik (kartu `t_bc89df6d`, 22 Oktober 2026)

Rencana (maks 10 baris):

1. Bukti data: produk 13 "baju tidur pola kucing" punya 4 varian (L/XL × Hijau/Merah), semua
   `is_active`; jadi varian tersimpan — masalahnya serialisasi warna + pemilihan di frontend.
2. Kontrak dulu: `docs/kontrak-props.md` §8.3 — key aditif `variants[].color_hex`
   (`#RRGGBB` dari peta baku; `null` bila `color` kosong/tidak dikenal); status §8.5 dicatat.
3. `app/Support/VariantColor.php` — peta nama warna Indonesia/Inggris → hex, terima `#RGB`/`#RRGGBB`.
4. `app/Services/ProductPresenter.php::variants()` menambah `color_hex` (kartu katalog + detail).
5. Tanpa migrasi/kolom baru; `docs/db.md` tidak berubah (PRD §6 tidak memuat kolom warna hex).
6. Test: unit `VariantColorTest`; feature admin tambah produk 2 ukuran × 2 warna → props
   `/produk/{slug}` dan `/produk` memuat 4 varian dengan hex benar; warna tak dikenal `null`.
7. Bukan lingkup card ini: tombol ukuran/warna saling mengunci di `Show.jsx` (kartu frontend
   `t_7a62c713`); dikomentari di kartu itu, tidak diubah di sini.
8. Bukti perintah di `docs/bukti-backend-t_bc89df6d.txt`.

Hasil:

- `app/Support/VariantColor.php` baru: peta nama warna Indonesia/Inggris → hex, isian
  `#RGB`/`#RRGGBB` diteruskan, kata kunci terpanjang menang, tak dikenal → `null`.
  `ProductPresenter::variants()` menambah `color_hex` tepat setelah `color`; kartu katalog,
  beranda, dan detail memakai jalur yang sama sehingga tidak ada dua bentuk.
- Kontrak `docs/kontrak-props.md` §8.3 + §8.5 diperbarui (key aditif, LOCKED 22 Okt 2026);
  §11.1 mencatat tidak ada rute `/produk/barang`. Tanpa migrasi; `docs/db.md` tidak berubah.
- Bukti data nyata: produk 13 (L/XL × Hijau/Merah) kini `#16A34A`/`#DC2626` per baris;
  sebelum perubahan `color_hex` tidak ada (bukti bagian A–B).
- Test unit + fitur **OK (8 tests, 48 assertions)**; regresi seluruh suite **OK (258 tests,
  2041 assertions)** lewat `php -d extension=pdo_sqlite vendor/bin/phpunit` (pdo_sqlite tidak
  aktif di php.ini, DLL-nya ada; DB tetap SQLite `:memory:`, tanpa mengubah konfigurasi).
  `CatalogIndexTest` disesuaikan: key varian kartu kini memuat `color_hex` (`#111827` untuk
  "Hitam"). `php -l` 5 berkas bersih; `pint --test` passed.
- Temuan di luar lingkup: `Show.jsx` mengunci tombol ukuran & warna saat keduanya >1
  (saling menunggu pilihan lain) — dikomentari di kartu frontend `t_7a62c713`, tidak diubah
  di sini.

## B7 — Dashboard admin sinkron dengan data aktual (kartu `t_1ef89050`, 22 Oktober 2026)

Rencana (maks 10 baris):

1. Temuan: `DashboardController@index` hanya mengirim `stats`; halaman `Admin/Dashboard` sudah
   membaca `sales_14d`, `low_stock`, `recent_orders`, `recent_reviews`, `updated_at` → empat blok
   selalu tampil empty walau DB berisi 13 order, 38 varian (2 stok < 5), 2 ulasan.
2. Kontrak `docs/kontrak-props.md` §6.13 dilengkapi lebih dulu (bentuk tiap prop + aturan filter)
   lalu dinaikkan ke LOCKED karena frontend sudah memakainya.
3. `app/Services/DashboardService.php` baru: satu tempat agregasi (stats, sales 14 hari zero-fill,
   stok kritis < 5, 5 pesanan terbaru, 5 ulasan terbaru) — tanpa cache, dihitung per request.
4. `Order::REVENUE_STATUSES` jadi satu-satunya daftar status omzet (dipakai service + test).
5. `DashboardController` tipis: injeksi service, kirim props + `updated_at` ISO 8601.
6. Test `tests/Feature/Admin/AdminDashboardTest.php` diperluas (SQLite in-memory): bentuk 14 hari,
   filter status omzet, stok kritis, limit/urutan 5 pesanan & 5 ulasan, user terhapus → null.
7. Berkas disentuh: service baru, controller, model Order, test, kontrak, catatan, asumsi, bukti.
8. Tanpa migrasi, tanpa rute/endpoint baru, tanpa perubahan frontend, tanpa `.env`.

### Hasil

- **Akar masalah**: `DashboardController@index` hanya mengirim `stats`. Empat blok lain yang sudah
  dibaca `resources/js/Pages/Admin/Dashboard.jsx` (`sales_14d`, `low_stock`, `recent_orders`,
  `recent_reviews`) tidak pernah dikirim, sehingga selalu jatuh ke nilai bawaan `null` → empty state
  walau database berisi data. `updated_at` juga tidak dikirim sehingga label "Diperbarui …" kosong.
- **Perbaikan**: `app/Services/DashboardService.php` (baru) menjadi satu tempat agregasi; controller
  kini tipis dan mengirim `snapshot()` (6 key). Tanpa cache, tanpa migrasi, tanpa rute/endpoint baru.
- **Status omzet**: `App\Models\Order::REVENUE_STATUSES` (baru) = dibayar/diproses/dikirim/selesai,
  dipakai service dan test agar tidak ada dua daftar yang bisa menyimpang.
- **Kontrak**: `docs/kontrak-props.md` §6.13 dilengkapi bentuk per field dan aturan filter, status
  naik ke **LOCKED** karena frontend sudah memakainya. Baris tabel status dipecah (§6.10–§6.12 DRAFT,
  §6.13 LOCKED).
- **Test**: `tests/Feature/Admin/AdminDashboardTest.php` dari 3 → 8 test (149 assertion), semuanya
  lulus di SQLite `:memory:` (phpunit.xml). Test baru: bentuk 14 hari + zero-fill, filter status dan
  batas jendela, filter stok kritis (aktif, <5, produk aktif, batas 5 baris), 5 pesanan terbaru semua
  status, 5 ulasan terbaru termasuk tersembunyi + `user_name` null.
- **Verifikasi data nyata** (MySQL pengembangan, read-only, `docs/bukti-dashboard-t_1ef89050.txt`):
  stats `{orders_total:13, orders_pending:7, revenue_total:884000, products_active:12}`;
  `sales_14d` 14 entri (646.000 pada 15 Okt + 238.000 pada 16 Okt = 884.000, cocok dengan
  `revenue_total`); `low_stock` 2 varian stok 3; `recent_orders` 5 (termasuk 3 batal); `recent_reviews` 2.
- **Pint**: 4 berkas lulus `pint --test` (2 perbaikan otomatis: body konstruktor satu baris,
  import `Category` di test).

### Catatan / di luar lingkup

- PRD §9 juga menyebut KPI "Omzet hari ini", "Omzet 30 hari", "AOV", "Pesanan per status", dan
  "Produk terlaris", sedangkan `Admin/Dashboard.jsx` (K13) hanya merender 4 kartu: total pesanan,
  pesanan baru, omzet total, produk aktif. Kartu ini **tidak menambah** KPI tersebut (di luar bug
  sinkronisasi + tugas melarang fitur dashboard baru); bila diminta, backend dapat menambahkannya
  aditif di `snapshot()` dan frontend menambah kartu.
- Suite penuh akhir: **258 lulus (2041 assertion)**. Saat pengerjaan sempat ada 1 gagal sementara di
  `tests/Feature/Catalog/CatalogIndexTest.php` (`color_hex`) karena `ProductPresenter.php` + test itu
  sedang diubah agent lain bersamaan; test yang sama lulus saat dijalankan ulang, dan suite akhir bersih.
  Bukan regresi dari kartu ini.
- `php artisan test` di mesin ini butuh `PHP_INI_SCAN_DIR` berisi `pdo_sqlite`/`sqlite3`
  (sudah tercatat di `docs/langkah-pemilik.md` §7 dan `docs/lingkungan.md`); tanpa itu seluruh test
  gagal "could not find driver". Tidak ada perubahan php.ini/.env.

## Kartu `t_2f443b75` — notif "Gagal membuat pembayaran QRIS. Coba lagi." saat buat pesanan

Tanggal: 22 Oktober 2026. Lingkup: jalur charge QRIS (`MidtransService`) + kontrak props §7.6/§7.7.
Tanpa migrasi, tanpa rute/endpoint baru, tanpa perubahan frontend, tanpa `.env`.

### Rencana (ditulis sebelum mengubah kode)

1. Bukti dulu: baca log `Midtrans charge gagal` dan payload yang benar-benar dikirim.
2. `chargeParams()` berhenti mengirim `enabled_payments` (parameter Snap) untuk kanal `gopay`;
   kanal dipilih lewat `qris.acquirer` saja, nilainya dari config `midtrans.qris_acquirer`
   (`MIDTRANS_QRIS_ACQUIRER`, bawaan `gopay`).
3. `chargeOrder()`: jawaban 402 "Payment channel is not activated" → satu percobaan ulang dengan
   acquirer satunya (`other_qris`, `qris.acquirer` + `enabled_payments` konsisten, `order_id` sama);
   kegagalan lain tidak diulang. Kedua kanal 402 → pesan yang menyebut aktivasi kanal.
4. Test regresi `tests/Feature/Checkout/QrisAcquirerFallbackTest.php` (5 kasus), `FakeMidtransApi`
   bisa menskrip kegagalan berurutan.
5. Berkas: `app/Services/MidtransService.php`, `config/midtrans.php`, `.env.example`,
   `tests/Support/FakeMidtransApi.php`, test baru, `docs/kontrak-props.md` §7.6/§7.7,
   `docs/langkah-pemilik.md`, `docs/asumsi.md`.

### Hasil

- **Akar masalah (terbukti dari log, bukan dugaan)**: `storage/logs/laravel.log` mencatat 9 kegagalan
  nyata (`local.ERROR`) sejak 21 Okt 19:30 sampai 22 Okt 10:13, semuanya
  `HTTP status code: 402 API response: {"status_code":"402","status_message":"Payment channel is
  not activated."}`. Contoh terakhir: pesanan `TK-20261022-0005`, `midtrans_order_id`
  `TK-20261022-0005-98BC41`, 22 Okt 10:13:55.
- **Sebab di kode**: `chargeParams()` mengirim `qris.acquirer = gopay` **dan**
  `enabled_payments = ["other_qris"]` sekaligus. `enabled_payments` adalah parameter Snap; di Core
  API kanal dipilih `qris.acquirer`, sehingga nilai warisan PRD §8 itu meminta kanal yang tidak aktif
  di akun merchant → 402.
- **Perbaikan**: `chargeParams(Order, string $orderId, string $acquirer)` tidak lagi mengirim
  `enabled_payments` untuk `gopay`; kanal `other_qris` tetap mengirim `qris.acquirer = other_qris` +
  `enabled_payments = ["other_qris"]` (konsisten, hanya di percobaan kedua).
  `qrisAcquirers()` membaca `midtrans.qris_acquirer` (bawaan `gopay`, nilai tak sah → `gopay`) dan
  menyiapkan acquirer cadangan. `chargeOrder()` mengulang **sekali** hanya bila
  `isChannelInactive()` benar (kode 402 atau teks "Payment channel is not activated" di rantai
  `getPrevious()`), memakai `order_id` yang sama karena transaksi 402 tidak pernah dibuat.
- **Pesan ke UI**: kegagalan 402 ganda → `MidtransService::CHANNEL_INACTIVE_MESSAGE` =
  `Pembayaran QRIS belum bisa dibuat karena kanal QRIS belum aktif di akun Midtrans penjual. Hubungi
  penjual.` (kontrak §7.6/§7.7 diperbarui, aditif; teks lama tetap dipakai untuk kegagalan lain).
  Tujuannya: pembeli/pemilik tidak disuruh "coba lagi" untuk hal yang hanya bisa diperbaiki lewat
  aktivasi kanal di dashboard Midtrans.
- **Log**: entri `Midtrans charge gagal` kini memuat `qris_acquirer`, `attempt`, dan
  `channel_inactive` supaya kegagalan berikutnya bisa dibedakan tanpa menebak. Kredensial tetap
  disensor (`redactSecret()`).
- **Test**: `tests/Feature/Checkout/QrisAcquirerFallbackTest.php` — 5 lulus (40 assertion):
  payload tanpa `enabled_payments`; fallback 402 → `other_qris` dan pesanan tetap dibuat; 402 dua kali
  → pesan aktivasi, tanpa order/payment, stok utuh; kegagalan non-402 tidak diulang (1 percobaan);
  `MIDTRANS_QRIS_ACQUIRER=other_qris` dipakai sebagai kanal pertama.
  Suite penuh: **263 lulus (2081 assertion)**, exit 0, dijalankan dengan
  `PHP_INI_SCAN_DIR=<scratch>/phpsqlite` (SQLite `:memory:`).
- **Belum dibuktikan**: panggilan charge sungguhan ke akun Midtrans pemilik. Probe
  `tmp/probe-qris-variants.php` sudah disiapkan tetapi berhenti sendiri karena mode produksi aktif
  (sengaja: jangan membuat tagihan nyata). Bila 402 masih muncul setelah perubahan ini, artinya kanal
  QRIS memang belum aktif di dashboard — langkah pemilik ada di `docs/langkah-pemilik.md`.

### Catatan / di luar lingkup

- PRD §8 masih menulis `enabled_payments: ["other_qris"]`. PRD bukan milik kartu ini dan tidak
  diubah; penyimpangannya dicatat di `docs/asumsi.md` butir 27.
- `docs/midtrans-produksi.md` «Kanal QRIS LULUS» hanya memeriksa **nilai config**, bukan panggilan
  charge (kartu itu menyatakan tidak ada charge). Tidak ada kontradiksi, tetapi bacaannya jangan
  dianggap bukti kanal aktif.
- Kalau pemilik mengaktifkan `other_qris` saja, `MIDTRANS_QRIS_ACQUIRER=other_qris` menghindari satu
  percobaan 402 yang sia-sia (bukan syarat; fallback tetap jalan).

## Kartu `t_56062a5c` — QRIS: acquirer sah + pesan 402 terjaga (22 Oktober 2026)

Rencana (maks 10 baris):

1. `MidtransService`: `QRIS_ACQUIRERS` = `gopay` + `airpay shopee`; nilai config lama `other_qris`
   dipetakan ke `airpay shopee`; `chargeParams()` tidak pernah mengirim `enabled_payments`.
2. `chargeOrder()`: catat bila ADA percobaan yang 402; bila ya, pesan akhir tetap
   `CHANNEL_INACTIVE_MESSAGE` walau cadangan gagal dengan galat lain (mis. 413).
3. `config/midtrans.php` + `.env.example`: nilai sah `gopay` | `airpay shopee`, alias lama dipetakan.
4. Test `QrisAcquirerFallbackTest`: cadangan `airpay shopee` tanpa `enabled_payments`; test baru
   402 → cadangan sah, test baru 402 → 413 tetap pesan kanal tidak aktif, test alias config.
5. Kontrak §7.7 + `docs/asumsi.md`: perbaiki keterangan acquirer cadangan (bentuk props tidak berubah).
6. Verifikasi: phpunit fokus + suite penuh (SQLite `:memory:`), `pint --test`, grep `other_qris`.

Berkas disentuh: `app/Services/MidtransService.php`, `config/midtrans.php`, `.env.example`,
`tests/Feature/Checkout/QrisAcquirerFallbackTest.php`, `tests/Support/FakeMidtransApi.php` (komentar),
`docs/kontrak-props.md`, `docs/asumsi.md`, `docs/catatan-backend.md`.

### Hasil

- **Acquirer sah.** `QRIS_ACQUIRERS = ['gopay', 'airpay shopee']`; `QRIS_ACQUIRER_ALIASES` memetakan
  nilai config lama `other_qris` → `airpay shopee`; nilai kosong/salah tulis → `gopay`. Cadangan
  dihitung dari daftar itu, jadi yang pernah terkirim hanya dua acquirer sah tersebut.
- **`enabled_payments` dihapus total** dari `chargeParams()` (bukan hanya untuk `gopay`). Parameter
  Snap itu tidak pernah lagi masuk payload Core API, termasuk pada percobaan cadangan.
- **Pesan 402 dijaga.** `chargeOrder()` menandai `$channelInactiveSeen` untuk SETIAP percobaan;
  bila ada satu saja yang 402, pengecualian akhir memakai `CHANNEL_INACTIVE_MESSAGE` walau
  percobaan terakhir gagal dengan galat lain (mis. 413). Galat non-402 pada percobaan pertama tetap
  tidak diulang dan tetap memakai pesan generik.
- **Config/example.** `config/midtrans.php` memetakan alias lama sebelum validasi; `.env.example`
  menyebut nilai sah `gopay` | `"airpay shopee"` dan menjelaskan pemetaan `other_qris`.
- **Test** (`QrisAcquirerFallbackTest`, 7 test / 56 assertion): payload tanpa `enabled_payments`;
  402 → cadangan `airpay shopee` berhasil dan pesanan tetap dibuat; kedua acquirer 402 → pesan
  aktivasi tanpa pesanan/stok setengah jadi; **402 → cadangan 413 → tetap pesan aktivasi**;
  non-402 tidak diulang; acquirer dari config; alias `other_qris` dipetakan ke `airpay shopee`.
- **Verifikasi yang dijalankan:** `php artisan test --filter=QrisAcquirerFallbackTest` → 7 passed;
  `php artisan test` (SQLite `:memory:` sesuai `phpunit.xml`) → **265 passed, 2097 assertions**;
  `vendor/bin/pint --test` pada 4 berkas PHP → passed; `php -l` 4 berkas → bersih.
- **Belum dicek / tidak boleh dicek di kartu ini:** charge QRIS nyata ke Midtrans (dilarang kartu;
  butuh akun + uang nyata) dan status aktivasi kanal di dashboard (kewenangan pemilik, gerbang
  `t_c9385bf0`). Tidak ada perubahan bentuk props/kontrak; teks `CHANNEL_INACTIVE_MESSAGE` sama.
- **Temuan di luar lingkup (tidak diubah, batas kartu):** `README.md:20`, `docs/midtrans-produksi.md:24,47`,
  dan probe di `tmp/` masih menyebut `enabled_payments: ["other_qris"]` — dokumentasi/probe lama,
  bukan kode aktif. `docs/asumsi.md` butir 27 masih memuat kalimat lama, tetapi butir 28 menyatakan
  menggantikannya.

## BE-Pengaturan 5 — favicon, copyright footer, aset seed (kartu t_101b9145, 2026-10-23)

Rencana (maks 10 baris):

1. Kontrak dulu: `docs/kontrak-props.md` §1/§4/§10.7/§10.8 — key `footer_copyright`,
   `store_favicon` di props bersama, catatan key non-publik.
2. `SettingService::DEFINITIONS` + `UpdateSettingRequest`: `footer_copyright` (footer, text,
   nullable maks 200).
3. `HandleInertiaRequests`: pakai `SettingService`, jamin 4 key selalu ada di props `settings`,
   buang key Midtrans dari props publik.
4. `resources/views/app.blade.php`: `rel=icon` dari `store_favicon` + fallback `/favicon.ico`.
5. `SettingSeeder`: `firstOrCreate`, tambah `store_favicon` + `footer_copyright`, tulis semua
   aset seed (logo, favicon, hero, promo) + fallback ICO, pemeriksaan akhir gagal keras.
6. Test: simpan copyright/favicon, batas 200, props bersama, tag favicon; jalankan
   `php artisan test` (SQLite `:memory:`).
7. Jalankan `php artisan db:seed --class=SettingSeeder` pada DB dev untuk membuat kunci/berkas
   yang belum ada.
8. Catat asumsi di `docs/asumsi.md`; langkah pemilik bila ada di `docs/langkah-pemilik.md`.

Berkas disentuh: `app/Services/SettingService.php`,
`app/Http/Requests/Admin/UpdateSettingRequest.php`,
`app/Http/Middleware/HandleInertiaRequests.php`,
`database/seeders/SettingSeeder.php`,
`database/seeders/Concerns/WritesSeedImages.php`,
`resources/views/app.blade.php`, `public/favicon.ico`,
`tests/Feature/Admin/AdminSettingTest.php`, `tests/Unit/Services/SettingServiceTest.php`,
`tests/Feature/Public/StorefrontIdentityTest.php`, `docs/kontrak-props.md`, `docs/asumsi.md`,
`docs/db.md`, `docs/catatan-backend.md`.

**Koreksi path test:** file test yang dibuat bernama
`tests/Feature/Public/StorefrontSettingsTest.php` (bukan `StorefrontIdentityTest.php`).

### Hasil implementasi

- `SettingService::DEFINITIONS` kini memuat `footer_copyright` (grup `footer`, type `text`).
  `UpdateSettingRequest` memvalidasi `nullable|string|max:200` dengan pesan
  „Copyright footer maksimal 200 karakter.“
- `HandleInertiaRequests::publicSettings()` memakai `SettingService::all()` (casting seragam),
  selalu memuat `store_name`, `store_logo`, `store_favicon`, `footer_copyright` (string kosong
  dinormalkan menjadi `null`), dan membuang `midtrans_client_key` + `midtrans_is_production`
  dari props publik. Bila tabel `settings` belum dimigrasi, props `settings` = `[]` (tidak 500).
- `resources/views/app.blade.php` menulis `<link rel="icon">` dari `settings.store_favicon`
  (mendukung URL absolut, path `/...`, MIME png/ico/jpg/webp/gif/svg) dan fallback
  `/favicon.ico` bertipe `image/x-icon` bila kosong.
- `SettingSeeder`: 21 key, idempoten `firstOrCreate` (nilai pemilik tidak ditimpa), menulis
  ulang aset seed yang hilang berdasarkan path `/images/seed/...` yang tersimpan di DB
  (logo 240×64, favicon 64×64, hero & promo 1600×900), plus fallback `public/favicon.ico`
  (ICO 32×32 berisi PNG) hanya bila belum ada/0 byte. `assertSeedComplete()` gagal keras bila
  jumlah key, JSON, atau berkas aset tidak lengkap.
- `WritesSeedImages::seedFaviconIco()` ditambahkan (butuh ekstensi GD; melempar
  `RuntimeException` bila GD mati atau penulisan gagal).

### Verifikasi

- `php -l` untuk 8 berkas PHP inti yang disentuh: semua `No syntax errors detected`;
  `tests/Feature/SettingSeederTest.php` dijalankan langsung lewat PHPUnit (lulus).
- Test settings (unit + admin + storefront + seeder): **34 test lulus**, termasuk 5 test baru
  `StorefrontSettingsTest` (props wajib ada saat tabel kosong, nilai settings, key Midtrans
  tidak bocor, tag favicon, fallback ICO), 3 test admin baru (simpan copyright + unggah
  favicon, batas 200, tolak unggahan non-gambar), dan `SettingSeederTest` (idempoten, 21 key,
  nilai pemilik tidak tertimpa, aset favicon ada).
- Seluruh suite: **280 test, 2.310 assertion, lulus** (SQLite `:memory:`, `RefreshDatabase`).
- Catatan lingkungan: `pdo_sqlite`/`sqlite3` tidak aktif di `php.ini` mesin ini, dan
  `php artisan test` menjalankan PHPUnit sebagai proses anak sehingga flag `-d` hilang.
  Test dijalankan dengan
  `php -d extension=pdo_sqlite -d extension=sqlite3 vendor/bin/phpunit` (DB test tetap
  `:memory:`; tidak menyentuh DB dev).
- `php artisan db:seed --class=SettingSeeder` dijalankan **dua kali** pada DB dev, exit 0.
  Baris `settings` tetap 21 (tidak ada duplikat); nilai pemilik dipertahankan
  (`store_logo`/`store_favicon` tetap unggahan `/storage/settings/...`, `landing_hero` tetap
  konten pemilik `Liiora.id`, `footer_copyright` tetap kosong). `public/favicon.ico` dibuat
  (214 byte, ICO 32×32), `favicon.png` 280 byte, `logo.png` 418 byte, `hero.png` 6.815 byte
  — semuanya dikenali `file` sebagai PNG/ICO valid.

### Untuk frontend (kartu `t_c915c033`)

- Props `settings.footer_copyright` bisa `null`; tampilkan `© {tahun berjalan} {settings.store_name}`
  bila null/kosong. Batas input 200 karakter.
- `settings.store_favicon` bisa `null`/URL `/storage/...`; tag `<link rel="icon">` sudah diurus
  Blade, jadi `PublicLayout.jsx` tidak perlu menulis tag itu lagi.
- Panel admin `resources/js/Pages/Admin/Settings/Index.jsx` **belum** memuat field
  `footer_copyright` (TAB_FIELDS footer: `footer_about`, `footer_links`, `footer_social`),
  sehingga pemilik belum bisa mengubahnya dari UI meski backend menerima. Tambahkan field
  (textarea/text, maks 200) di tab Footer — pekerjaan frontend, bukan diubah di kartu ini.

## Rencana kartu t_04da18e0 — Snap semua kanal (PRD-v1.1 §2)

1. Migrasi baru `payments`: `snap_token`, `snap_redirect_url`, `payment_type` (migrasi lama tidak diubah).
2. `MidtransApi::snap()` + `SdkMidtransApi` (SDK `Snap::createTransaction`) + `FakeMidtransApi::snap()`.
3. `MidtransService`: `createSnapTransaction()` menggantikan `createQrisCharge()`; simpan token/redirect;
   webhook simpan `payment_type`, isi `orders.payment_method` saat settlement; `simulateSuccess()` mode fake.
4. `OrderService` set `payment_method='midtrans'`; `CheckoutController::pay` kirim prop Snap; rute
   `POST /checkout/{order}/simulasi-bayar` (`checkout.simulate`) hanya mode fake.
5. Test: `MidtransSnapTest` (Snap, webhook bank_transfer idempoten, echannel, fake simulasi, signature).
   Test Core-API-QRIS lama dihapus karena perilakunya diganti; `CheckoutTest` disesuaikan.
6. Kontrak §7.5–§7.7/§7.10/§7.12, `docs/db.md`, `docs/asumsi.md` diperbarui.



## Rencana kartu t_71f1e7a9 — galeri landing + copy CTA

- Key baru `landing_gallery` (json, maks 8 `{image,caption,alt}`) di `SettingService::DEFINITIONS`.
- Unggah lewat `PUT /admin/pengaturan/landing` yang sudah ada; hapus berkas lama saat item
  dihapus/diganti. Penanda `landing_gallery_present` supaya form lama yang belum mengenal galeri
  tidak menghapus data.
- Seed 4 gambar [CONTOH] `/images/seed/landing/galeri-*.png` + CTA akhir
  `landing_sections.newsletter.subtitle` = kalimat gratis ongkir (idempoten, tidak menimpa pemilik).
- Berkas tersentuh: SettingService, UpdateLandingRequest, SettingController,
  HandleInertiaRequests, SettingSeeder, SettingSeederTest, test baru AdminLandingGalleryTest,
  docs/kontrak-props.md §2/§10.9, docs/langkah-pemilik-v1.1.md.

## Rencana kartu t_f22c8d46 — Biteship + admin ekspedisi (PRD v1.1 D2/D3)

- Migrasi `add_shipping_columns_to_orders_table` (6 kolom ongkir di `orders`).
- `config/biteship.php` (key dari `.env`), `app/Services/BiteshipService.php` (mode fake bila key kosong).
- `CheckoutController@shipping` + rute `GET /checkout/ongkir` (`checkout.shipping`), `CheckoutRequest` +
  `OrderService` memakai tarif server (tolak tamper / layanan hilang), gratis ongkir layanan reguler.
- `CartService::summary()`: ongkir `null` + blok `shipping` saat mode API; `SettingService` grup `shipping`.
- Admin: `Admin\ShippingController` + `UpdateShippingRequest`, rute `admin.shipping.index/update`,
  seeder 7 key ekspedisi (idempoten), kartu kontrak §7.0/§7.5/§7.6/§7.12/§10.13.
- Berkas: migrasi, config/biteship.php, BiteshipService, CheckoutController, CheckoutRequest, OrderService,
  CartService, SettingService, ShippingController, UpdateShippingRequest, routes/web.php, routes/admin.php,
  SettingSeeder, SettingSeederTest, tests/Feature/Shipping/*, docs/db.md, docs/kontrak-props.md,
  docs/langkah-pemilik.md, .env.example.

### Hasil kartu t_71f1e7a9 (galeri landing + copy CTA)

- Kontrak `docs/kontrak-props.md` §2 (key `landing_gallery`, CTA `landing_sections.newsletter`),
  §4 (tabel settings) dan §10.9 (form admin + penanda `landing_gallery_present`) diperbarui lebih dulu.
- Kode: `SettingService::DEFINITIONS` (+`landing_gallery`), `UpdateLandingRequest` (maks 8 item,
  jpg/jpeg/png/webp ≤ 2 MB atau path yang sudah ada, caption ≤ 80, alt ≤ 120),
  `SettingController::landing` (simpan/urutkan/hapus + hapus berkas yatim, skip bila form tanpa
  field galeri), `HandleInertiaRequests` (galeri ikut props `settings`), `SettingSeeder`
  (4 gambar `[CONTOH]`, CTA default, 24 baris settings, restore gambar seed ikut galeri).
- Test: `tests/Feature/Admin/AdminLandingGalleryTest.php` (9 kasus) + `SettingSeederTest` diperluas.
  Dijalankan: `php -d extension=pdo_sqlite -d extension=sqlite3 vendor/bin/phpunit
  --filter='AdminLandingGalleryTest|SettingSeederTest|AdminSettingTest|StorefrontSettingsTest'`
  → 30/31 lulus. `migrate:fresh --seed` diuji pada sqlite sementara (bukan DB pengembangan) → bersih,
  `landing_gallery` berisi 4 item.
- Di luar lingkup (belum diubah): `AdminSettingTest::test_halaman_pengaturan_menampilkan_tujuh_grup`
  masih menuntut 7 grup padahal `SettingService::GROUPS` sekarang 8 (grup `shipping` dari kartu
  ekspedisi). Gagal sebelum perubahan kartu ini; pemilik kartu shipping perlu memperbarui angkanya.
- Catatan: `php -d extension=...` dipakai karena `pdo_sqlite` belum aktif di `php.ini`
  (sudah tercatat di `docs/langkah-pemilik.md`).

## Hasil kartu t_04da18e0 — Snap semua kanal (24 Okt 2026)

- Migrasi baru `2026_10_24_000001_add_snap_columns_to_payments_table` (`snap_token` 255 null,
  `snap_redirect_url` text null, `payment_type` 40 null); migrasi lama tidak diubah.
  `php artisan migrate --pretend` menampilkan 3 `ALTER TABLE` (belum dijalankan ke DB pengembangan).
- `MidtransApi` sekarang `snap(array): array`; `SdkMidtransApi` memanggil `Midtrans\Snap::createTransaction`.
  `MidtransService::createSnapTransaction()` menggantikan `createQrisCharge()`; `order_id` Midtrans =
  `orders.code` + sufiks 6 hex per panggilan; `payment_type` diisi dari webhook; `orders.payment_method`
  = `midtrans` saat checkout lalu tipe kanal saat settlement.
- `CheckoutController`: props `pembayaran` + `snap_token`, `snap_redirect_url`, `type`, `type_label`;
  `qr_string`/`qris_url` tinggal mode uji; aksi baru `simulate()` + route `POST /checkout/{order}/simulasi-bayar`
  (`checkout.simulate`, throttle 10/menit, hanya pemilik order). Flash sukses checkout jadi
  `Pesanan dibuat. Selesaikan pembayaran.`
- `Admin\OrderController`: detail pesanan mengirim `snap_token`, `snap_redirect_url`, `payment_type`,
  `payment_method_label` (menggantikan `qris_url`/`qr_string` di kontrak §12.17).
- Test: 5 test Core-API-QRIS lama dihapus; `tests/Feature/Checkout/MidtransSnapTest.php` (6 test) mencakup
  bentuk Snap, order_id unik, webhook `bank_transfer`/`echannel`/`qris` + idempoten, signature salah,
  simulasi mode uji, dan otorisasi 404. `FakeMidtransApi` diganti ke `snap()`.
- Verifikasi: `php -d extension=pdo_sqlite vendor/bin/phpunit` → **269 lulus, 1 gagal (2098 assertion)**.
  Satu-satunya gagal: `AdminSettingTest::test_halaman_pengaturan_menampilkan_tujuh_grup` (masih menuntut
  7 grup, padahal sudah 8 sejak kartu ongkir) — gagal sebelum kartu ini, di luar lingkup.
- Belum dicek: migrasi dijalankan ke DB pengembangan (menunggu pemilik); halaman bayar frontend belum
  memakai `snap_token` (kartu frontend).
- Commit `9fe945b` (`t_04da18e0: …`) hanya berisi berkas eksklusif Snap (service, seam API, model
  `Payment`, migrasi, test, detail pesanan admin). Berkas bersama yang juga memuat pekerjaan kartu
  Biteship yang belum selesai (`CheckoutController`, `Order`, `OrderService`, `routes/web.php`, docs)
  sengaja tidak di-commit agar commit tidak merujuk kelas/route tanpa berkasnya.

## Hasil kartu t_f22c8d46 — Biteship + ekspedisi (24 Okt 2026)

Dibuat/diubah:
- `database/migrations/2026_10_24_000002_add_shipping_columns_to_orders_table.php` — 5 kolom
  pengiriman di `orders` (courier, service, etd, berat, is_free).
- `config/biteship.php` — `key`, `base_url`, `timeout` (dari `.env`, tidak pernah dikirim ke frontend).
- `app/Services/BiteshipService.php` — satu pintu tarif: `rates()` (opsi checkout), `quote()`
  (harga final), `catalog()` (panel admin), `freeShipping()`, `origin()`, `fakeRate()`.
  Tanpa `BITESHIP_API_KEY` → mode `fake` tarif datar `settings.shipping_cost_default`.
- `CheckoutController`: aksi `shipping()` + blok props `pengiriman`; props pesanan mendapat
  `shipping_courier`, `shipping_service`, `shipping_etd`, `shipping_is_free`.
- `routes/web.php` — `GET /checkout/ongkir` (`checkout.shipping`), throttle 30/menit
  (`checkout-shipping` di `AppServiceProvider`), statis sebelum `checkout/{order}`.
- `CheckoutRequest` — `shipping_courier`/`shipping_service` wajib di mode `api`, `nullable`
  di mode `fake`; `shipping_cost` hanya pembanding.
- `OrderService::resolveShipping()` — tarif final dihitung ulang server; `shipping_cost` klien
  yang berbeda → `Ongkir berubah, pilih ulang kurir.`; gratis ongkir hanya layanan `is_regular`.
- `CartService` — DI `BiteshipService`, `summary()` memuat `shipping` + `berat_gram`,
  `shippingItems()` untuk Biteship; pembaca lama `shippingCost()` dihapus.
- `SettingService` — grup `shipping` + 7 key; `SettingSeeder` menulis 31 key (idempoten).
- `app/Http/Controllers/Admin/ShippingController.php` + `Admin/UpdateShippingRequest.php`,
  rute `GET/PUT /admin/ekspedisi` (`admin.shipping.index|update`).
- Kontrak: `docs/kontrak-props.md` §7.0, blok `pengiriman` (§7.5), §7.6, §7.12, §10.13 — DRAFT.
- Test baru `tests/Feature/Checkout/CheckoutShippingTest.php` (10 kasus); batas jumlah key
  `SettingSeederTest` diperbarui 24 → 31.

Verifikasi yang sudah dijalankan:
- `php -l` bersih untuk 10 berkas yang disentuh.
- `php artisan route:list --name=checkout` dan `--name=admin.shipping` menampilkan rute baru.
- `php artisan migrate --force` sukses (termasuk migrasi lama `2026_10_24_000001` yang masih
  tertunda); `php artisan db:seed --class=SettingSeeder` dua kali sukses — 31 baris, 7 grup
  `shipping`, JSON `shipping_couriers` valid.
- `tinker`: `BiteshipService::rates()` mode `fake` mengembalikan 6 opsi bertarif datar; controller
  checkout bisa di-resolve container.

Belum dicek / catatan:
- `php artisan test` GAGAL dijalankan: PHP CLI tidak punya `pdo_sqlite` ("could not find driver"),
  padahal `phpunit.xml` memakai SQLite in-memory. Langkah pemilik ada di `docs/langkah-pemilik.md`.
  Semua test kartu ini berstatus belum dieksekusi.
- Halaman `Admin/Shipping/Index` (JSX) belum ada — milik kartu frontend; controller sudah mengirim
  props sesuai §10.13.
- Baris `shipping_cost_default` di database pengembangan bernilai `0` dari pekerjaan sebelumnya,
  sehingga mode `fake` memberi ongkir Rp0 sampai pemilik mengisi tarif uji di `/admin/ekspedisi`.
  Seeder sengaja tidak menimpa nilai lama (`firstOrCreate`).
- `shipping_cost_default` tetap bergrup `pembayaran` di registry setting agar tab Pembayaran lama
  tidak kehilangan field; halaman Ekspedisi juga menyunting nilai yang sama.

Penyesuaian setelah verifikasi:
- `Admin/ShippingController@index` sekarang mengirim key `pengaturan` persis nama setting
  (`shipping_origin_*`, `free_shipping_enabled`, `free_shipping_min`, `shipping_cost_default`)
  sesuai kontrak §10.13; pesan galat `UpdateShippingRequest` disamakan dengan tabel kontrak.
- `couriers[].label` opsional (maks 80) → fallback kode layanan huruf besar; `is_regular` dan
  `is_active` wajib boolean; `free_shipping_enabled` wajib boolean.
- `checkout/pengiriman` sudah dikirim dari `shippingPayload()` dan pesanan menyertakan 4 key
  pengiriman; `CartService::shippingItems()` memberi item berat ke Biteship.
- `CheckoutTest` dan `CartTest` memaksa `biteship.key = ''` agar suite tidak pernah memanggil API.
- Kontrak §7.12 diperbaiki: mode fake tanpa kurir = tarif datar + `shipping_courier = null`
  (bukan "layanan reguler uji pertama"), dan §10.13 menambah baris `shipping_cost_default`.

## Ongkir: petakan galat Biteship 400 (kartu `t_1b711d26`, 24 Okt 2026)

Rencana (maks 10 baris): catat `status`/`success`/`error`/`code` + kode pos asal & tujuan pada
dua titik log (`rates()` dan `catalog()`), petakan kode rates `40001001`/`40001002`/`40001010`
ke pesan Indonesia (kode lain tetap `GALAT_API`), tambah test 400 di
`QaV11OngkirPembayaranTest`, perbarui kontrak §7.12 + langkah pemilik.
Berkas: `app/Services/BiteshipService.php`,
`tests/Feature/Checkout/QaV11OngkirPembayaranTest.php`, `docs/kontrak-props.md`,
`docs/langkah-pemilik.md`, `docs/catatan-backend.md`.

Hasil (24 Okt 2026):
- `BiteshipService`: helper `logGagalBiteship()` mencatat `status`, `success`, `error`, `code`
  (plus `origin_postal_code`/`destination_postal_code` di `rates()`, tanpa header/kunci) dan
  `pesanGalat()` memetakan `40001001` → `GALAT_KODE_POS`, `40001002` → `GALAT_PARAMETER`,
  `40001010` → `GALAT_TANPA_KURIR` (pesan lama), kode lain/tanpa `code` → `GALAT_API`.
  Dipakai di `rates()` (log + pesan) dan `catalog()` (log saja, panel Ekspedisi tetap fallback).
  Branch exception `rates()` juga mencatat kedua kode pos.
- Test: `QaV11OngkirPembayaranTest` +2 kasus — `40001001` (pesan spesifik + log memuat
  `code`/`success`/kedua kode pos) dan peta `40001002`/`40001010`/kode tak dikenal; kasus 500 lama
  tetap `GALAT_API`. `php artisan test --filter=Ongkir` → 17 lulus, 126 assertion.
- Catatan lingkungan: `pdo_sqlite` tidak aktif di `php.ini` mesin ini; `php artisan test` menjalankan
  phpunit sebagai proses anak sehingga `php -d extension=pdo_sqlite` tidak ikut. Jalankan dengan
  `PHP_INI_SCAN_DIR` berisi `extension=php_pdo_sqlite.dll` (atau aktifkan ekstensi di `php.ini`).
  Tidak ada perubahan `php.ini`/`.env`; test tetap SQLite in-memory.
- Kontrak §7.12 diperbarui (tabel peta kode + catatan log), `docs/langkah-pemilik.md` dan
  `docs/asumsi.md` ditambah. Bukti: `docs/bukti-ongkir-t_1b711d26.txt`.
- Belum dicek: jawaban Biteship asli dengan kunci + kode pos pemilik (perlu klik "Cek Ongkir" oleh
  pemilik; baris log baru diminta lewat komentar kartu).

## Akar masalah ongkir: saldo Biteship habis (kartu `t_1b711d26`, 24 Okt 2026)

Bukti log asli (bukan hipotesis), `storage/logs/laravel.log` setelah pemilik menekan **Cek Ongkir**
kode pos 60184 dengan asal 50148:

```
[2026-10-24 17:35:08] local.WARNING: Biteship rates menjawab tidak sukses {"origin_postal_code":50148,"destination_postal_code":60184,"status":400,"success":false,"error":"No sufficient balance to call rates API. Please top up your balance","code":null}
```

Jadi kegagalan `400` bukan kode pos/parameter: `code` `null` dan `error` menyebut saldo akun
Biteship. Peta kode `40001001`/`40001002`/`40001010` tidak pernah kena. Tindakan:

- `BiteshipService::GALAT_SALDO` baru: 400 tanpa `code` dengan `error` memuat `balance` →
  `Ongkir tidak bisa dihitung karena saldo Biteship penjual habis. Hubungi penjual.`
  (`pesanGalat()` sekarang menerima `error`; kode lain tetap `GALAT_API`).
- Test baru `test_galat_biteship_400_saldo_habis_memberi_pesan_saldo` (400, `code` null, `error`
  asli) + kasus 500 lama tetap `GALAT_API`.
- `php artisan test --filter=Ongkir` → 18 lulus, 130 assertion (SQLite in-memory).
- Pemilik harus mengisi saldo akun Biteship (atau memakai akun/kunci yang ber-saldo) — tidak bisa
  diselesaikan dari kode. Setelah saldo masuk, ulangi **Cek Ongkir**; bila masih 400, baris log baru
  akan menunjukkan kode pos/parameter.
- Catatan lingkungan: `pdo_sqlite` tidak aktif di `php.ini`; jalankan test dengan
  `PHP_INI_SCAN_DIR='C:\Users\LENOVO\AppData\Local\hermes\profiles\backenddeveloper\cache\scratch\phpini'`
  (berisi `extension=C:/laragon/bin/php/php-8.3.32-Win32-vs16-x64/ext/php_pdo_sqlite.dll`).
  `php.ini` dan `.env` tidak disentuh.

## Rencana kartu `t_66e507a3` — Midtrans Core API 8 kanal (24 Okt 2026)

- `MidtransApi::snap()` → `charge(array)`; `SdkMidtransApi` pakai `CoreApi::charge`.
- `MidtransService`: tabel 8 kanal PRD-v1.2 §2.2, charge per kanal, idempoten kanal sama
  (belum kedaluwarsa), ganti kanal = `order_id_midtrans` baru akhiran `-2`, `-3`, instruksi
  diurai dari payload, expiry QRIS 5 menit / VA-gerai-Mandiri 60 menit.
- `OrderService::createFromCart`: hanya baris `payments` pending, tanpa panggilan Midtrans.
- `CheckoutController`: `pay`, `method` (POST baru, `throttle:10,1`), `status`, `simulate`,
  `midtransSelesai`; route publik `GET /midtrans/selesai`.
- `FakeMidtransApi` fixture per grup + `MidtransCoreTest`; `MidtransSnapTest` dihapus;
  `QaV11OngkirPembayaranTest` disesuaikan.
- Berkas: `app/Services/Midtrans/*`, `app/Services/MidtransService.php`,
  `app/Services/OrderService.php`, `app/Http/Controllers/CheckoutController.php`,
  `app/Models/Order.php`, `config/midtrans.php`, `routes/web.php`, `tests/*`,
  `docs/kontrak-props.md`.

## Rencana kartu B3 — resi otomatis Biteship + katalog kurir (24 Okt 2026)

Berkas disentuh: migrasi `2026_10_24_000003_add_biteship_columns_to_orders_table.php`,
`app/Models/Order.php`, `app/Services/BiteshipService.php` (`createOrder` + fake + cache katalog),
`app/Http/Controllers/Admin/OrderController.php` (`resiOtomatis`), `routes/admin.php`,
`app/Http/Controllers/Admin/ShippingController.php` (validasi katalog), `config/biteship.php`,
`tests/Feature/Admin/AdminAutoResiTest.php`, `docs/kontrak-props.md` (§10.13, §12.25).
Tidak menyentuh `docs/db.md` (kartu B4), `.env`, dan tidak menjalankan migrasi.

### Hasil B3 (24 Okt 2026)

- Migrasi `2026_10_24_000003_add_biteship_columns_to_orders_table.php` ditulis, **belum dijalankan**
  (menunggu `php artisan migrate` pemilik/kartu B4); `docs/db.md` tidak disentuh.
- `BiteshipService::createOrder`: transaksi + `lockForUpdate`, idempoten lewat
  `biteship_order_id`, guard status/kurir/setting asal sebelum jaringan; mode uji tanpa
  `BITESHIP_API_KEY` tidak memanggil API (resi `FAKE-<kode>`).
- `BiteshipService::catalog`: `GET /v1/couriers` di-cache 24 jam (`biteship.couriers`), gagal API
  tidak di-cache dan jatuh ke daftar tersimpan (`sumber = "settings"` + `galat`). Baris katalog
  digabung dengan daftar tersimpan; kode yang hanya ada di daftar bawaan (`DEFAULT_COURIERS`)
  tetap dianggap dikenal oleh validasi `PUT /admin/ekspedisi`.
- `PUT /admin/ekspedisi` menolak layanan di luar katalog hanya saat `sumber = "biteship"` dan
  `daftar` tidak kosong (mode uji/API gagal tetap bisa menyimpan).
- `POST /admin/pesanan/{order}/resi` (`admin.orders.resi-otomatis`,
  `throttle:admin-write`): controller hanya meneruskan `pesan`; semua guard + tulisan kolom di
  service, jadi tidak ada jalur 500 untuk kegagalan Biteship.
- Verifikasi: `php -l` 8 berkas exit 0; `artisan route:list --name=resi` memuat route baru
  (`PATCH` dan `POST` di path sama, name `admin.orders.resi` dan `admin.orders.resi-otomatis`);
  `artisan test tests/Feature/Admin/AdminAutoResiTest.php` → **9 passed (36 assertions)**;
  `artisan test tests/Feature/Checkout/CheckoutShippingTest.php` → **10 passed**.
  `artisan test tests/Feature/Admin tests/Feature/Checkout` masih gagal di 3 test Midtrans/checkout
  lama (`CheckoutTest` qris, `QaV11OngkirPembayaranTest` webhook 403) — berkas Midtrans di working
  tree sedang diubah kartu lain, bukan dari B3.

## Hasil kartu `t_66e507a3` — Midtrans Core API 8 kanal (24 Okt 2026)

- Snap dihapus: `MidtransApi::snap()` → `charge(array)`; `SdkMidtransApi` memakai
  `Midtrans\CoreApi::charge`. Tidak ada `snap()`, `snap_token`, `snap_redirect_url` yang
  ditulis lagi (kolom lama dibiarkan, tidak dipakai; tidak ada migrasi baru).
- 8 kanal `MidtransService::CHANNELS` (urutan PRD-v1.2 §2.2): `qris`, `bca_va`, `bni_va`,
  `bri_va`, `permata_va`, `mandiri_bill`, `alfamart`, `indomaret`; `grup` ∈
  `qris`/`va`/`bill`/`gerai`. Charge memakai `payment_type` + payload per grup
  (`qris.acquirer`, `bank_transfer.bank`, `echannel`, `cstore`).
- Kedaluwarsa per kanal: QRIS `midtrans.expiry_minutes` (5), lainnya
  `midtrans.expiry_va_minutes` (60, baru di `config/midtrans.php` + `.env.example`).
  `custom_expiry.expiry_duration` dan `payments.expires_at` memakai nilai yang sama.
- Checkout hanya membuat baris `payments` pending (`createPendingPayment`); charge terjadi
  saat `POST /checkout/{order}/bayar/metode` (`checkout.method`, `throttle:checkout` = 10/menit).
  Kanal sama yang belum kedaluwarsa tidak di-charge ulang; ganti kanal memakai
  `order_id_midtrans` `code`, lalu `code-2`, `code-3`, … pada baris `payments` yang sama.
- Route publik baru `GET /midtrans/selesai` (`midtrans.selesai`) → `CheckoutController::midtransSelesai`;
  `order_id` tak dikenal / bukan milik pengguna → `/` + `flash.error`.
- `payments.payment_type` menyimpan id kanal; webhook hanya mengisi kolom itu bila kosong.
  `orders.payment_method` diisi id kanal saat `settlement`.
- Admin `payment` payload (§12.17): `snap_token`/`snap_redirect_url` diganti `metode` +
  `instruksi`; kontrak sudah diperbarui.
- Test: `tests/Feature/Checkout/MidtransSnapTest.php` dihapus, diganti
  `tests/Feature/Checkout/MidtransCoreTest.php` (10 test: checkout tanpa charge, 8 kanal,
  charge QRIS 5 menit, idempoten, ganti kanal `-2` + 60 menit, bill/gerai, kanal tak dikenal,
  gagal charge, `/midtrans/selesai`). `CheckoutTest` + `QaV11OngkirPembayaranTest` disesuaikan.
- Verifikasi: `php -l` 12 berkas exit 0; `route:list` memuat `checkout.method` dan
  `midtrans.selesai`; suite penuh **307 passed (2.390 assertions)** via
  `php -d extension=pdo_sqlite -d extension=sqlite3 vendor/bin/phpunit`.
- Catatan lingkungan: `php` CLI di mesin ini belum memuat `pdo_sqlite`, jadi `php artisan test`
  gagal "could not find driver". Sementara dijalankan dengan flag `-d extension=pdo_sqlite`
  (tanpa mengubah `php.ini`). Pemilik perlu mengaktifkan `extension=pdo_sqlite` di `php.ini`
  agar `php artisan test` berjalan biasa — dicatat di `docs/langkah-pemilik.md`.
- Di luar lingkup kartu ini: `resources/js/Pages/Public/CheckoutPay.jsx` masih membaca
  `snap_redirect_url`/`pembayaran.method`; halaman bayar perlu memakai `pembayaran.kanal[]`,
  `pembayaran.metode`, `pembayaran.instruksi`, dan `POST checkout.method`. Dikerjakan kartu frontend.

## Rencana kartu `t_09738dd5` — B2 alamat register + prefill checkout

- `RegisterRequest`: `address` (wajib, 10–500), `city` (wajib, maks 100), `postal_code`
  (wajib, `digits:5`) + trim; pesan galat dari `docs/design-v1.2.md` §6.1.
- `AuthController::register`: simpan tiga field ke `users` (kolom sudah ada, tanpa migrasi).
- `CheckoutController::index`: `prefill.customer_address/city/postal_code` dari profil user
  (sebelumnya `null`); kontrak §7.5 baris prefill diperbarui.
- Test: `RegistrationTest` (3 field tersimpan, kode pos 4 angka/alfabet ditolak, alamat/kota
  wajib), `CheckoutTest` (prefill terisi untuk user lama, user tanpa alamat → `null`).
- Berkas disentuh: `app/Http/Requests/Auth/RegisterRequest.php`,
  `app/Http/Controllers/AuthController.php`, `app/Http/Controllers/CheckoutController.php`,
  `tests/Feature/Auth/RegistrationTest.php`, `tests/Feature/Checkout/CheckoutTest.php`,
  `docs/kontrak-props.md`, `docs/catatan-backend.md`.
- Tanpa migrasi, tanpa route baru, tanpa `.env`.

## Hasil kartu `t_09738dd5` — B2 alamat register + prefill checkout (24 Okt 2026)

- `RegisterRequest` (§6.2): `address` wajib 10–500, `city` wajib maks 100, `postal_code` wajib
  `digits:5`; ketiganya di-trim (email juga di-lowercase seperti sebelumnya). Pesan galat persis
  design-v1.2 §6.1: `Alamat lengkap wajib diisi.` / `Alamat terlalu singkat. Tulis jalan, nomor, RT/RW.`
  / `Alamat maksimal 500 karakter.` / `Kota wajib diisi.` / `Kota maksimal 100 karakter.` /
  `Kode pos wajib diisi.` / `Kode pos harus 5 angka.`
- `AuthController::register` menyimpan `address`, `city`, `postal_code` ke `users` (kolom sudah ada
  di migrasi `2026_10_20_000002_add_profile_columns_to_users_table`; **tidak ada migrasi baru**,
  `docs/db.md` tidak berubah).
- `CheckoutController@index` (§7.5): `prefill.customer_address/city/postal_code` kini dari
  `users.address/city/postal_code` (sebelumnya `null`); `customer_name/phone/email` tetap.
  User lama tanpa profil tetap mendapat `null` (kontrak tidak berubah bentuk).
- Test: `RegistrationTest` +4 (kode pos 4 angka ditolak, kode pos berhuruf ditolak, alamat <10
  ditolak, tiga field wajib) dan assertion 3 field tersimpan; `CheckoutTest` +2 (prefill terisi
  dari profil, prefill `null` untuk user tanpa alamat).
- Verifikasi: `php -l` 5 berkas exit 0; `php -d extension=pdo_sqlite -d extension=sqlite3
  vendor/bin/phpunit --filter 'RegistrationTest|CheckoutTest'` → OK (34 test, 314 assertion);
  suite penuh → **OK (313 test, 2.445 assertion)**. `php artisan test` polos belum bisa di mesin
  ini (ekstensi `pdo_sqlite` belum aktif) — sama seperti catatan kartu sebelumnya.
- Untuk frontend (`t_8febc069`): `Register.jsx` saat ini **belum** mengirim `address`, `city`,
  `postal_code`, jadi pendaftaran lewat UI akan gagal validasi sampai kartu FE selesai — urutan
  ini memang disengaja (kartu FE bergantung pada kartu ini). Field wajib ada setelah Nomor WhatsApp
  (design-v1.2 §6.1); `prefill.customer_address/city/postal_code` sudah terisi dan bisa diedit.
- Untuk QA: payload `POST /register` pada skrip/uji manual wajib menambah tiga field di atas
  (`address` ≥10 karakter, `postal_code` 5 angka), selain itu 302 redirect balik dengan `errors`.

## Rencana kartu `t_f4a75237` — B4 props pesanan/pembayaran/pengiriman + riwayat

- Tujuan: menutup K1–K4 `docs/design-v1.2.md` §11 — detail admin `payment.metode/instruksi/fake`,
  `pesanan.shipping`, `pesanan.mode_uji`, kolom kurir/resi + filter `kirim` di daftar admin,
  dan kelengkapan rincian riwayat (customer, shipping, biaya, timeline).
- Migrasi baru `2026_10_24_000004_add_shipped_at_to_orders_table` (kolom `shipped_at`, nullable);
  diisi `OrderService::changeStatusByAdmin` saat status menjadi `dikirim` — sumber `timeline.shipped_at`.
- `BiteshipService`: `serviceLabels()` (peta `courier:service` → nama dari layanan tersimpan),
  `shippingInfo()` (satu bentuk objek `shipping` untuk admin & riwayat), `shippingLabel()`.
- `Admin\OrderController`: `index` (kolom kurir/resi/status + `mode_uji` + filter `kirim` +
  `filter_opsi.kirim`), `show` (`shipping`, `mode_uji`, `timeline`, `payment.fake`, instruksi benar).
- `HistoryController`: `customer`, `shipping`, `subtotal`, `shipping_cost`, `discount`, `timeline`.
- Kontrak: §12.16, §12.17, §13 (aditif, kompatibel); `docs/db.md` (migrasi 24–25, kolom `orders`).
- Test: tambahan metode di `tests/Feature/Admin/AdminSalesTest.php` dan `tests/Feature/HistoryTest.php`.
- Tanpa rute baru, tanpa perubahan `.env`.

### Hasil `t_f4a75237`

- `php -l` lima berkas: lolos; `php artisan migrate --force`: `2026_10_24_000004` masuk batch 4,
  `migrate:status` = `Ran`.
- `php artisan tinker` (baca saja, pesanan `TK-20261024-0001`): `shippingInfo()` mengembalikan
  `anteraja/ANTERAJA/REG`, etd, berat, ongkir, resi — bentuk sama untuk admin dan riwayat.
- `BiteshipService::shippingLabel('delivered')` = `Terkirim`, `shippingLabel(null)` = `null`.
- Test **belum dijalankan**: `php artisan test` gagal karena ekstensi `pdo_sqlite` tidak aktif di PHP
  lokal (langkah pemilik sudah ada di `docs/langkah-pemilik.md`). `phpunit.xml` sudah memakai SQLite
  in-memory, jadi tidak menyentuh database pengembangan begitu ekstensi aktif.
- Catatan untuk FE: nama kurir/layanan mengikuti `settings.shipping_couriers` bila ada `courier_name`/
  `service_name`; baris settings sekarang hanya berisi `label`, jadi fallback = kode mentah huruf besar
  (`ANTERAJA`, `REG`) sesuai kontrak. Bila ingin nama rapi, isi `courier_name` di settings (kartu lain).
- `mode_uji` = tagihan Midtrans uji (`payload.mode='fake'` atau `transaction_id` berawalan `fake-`)
  atau `shipping_payload.mode_uji`; tidak ada kolom baru.

## Rencana kartu `t_6032599a` — Fix B-01 `shipping.galat` riwayat pembeli (24 Okt 2026)

Sumber: `docs/qa-v1.2.md` B-01 (P1/Medium). Suite merah di `tests/Feature/HistoryTest.php:309`
(`shipping.galat` pembeli berisi pesan penjaga status admin).

- Pilih arah (a) dari kartu: null-kan `galat` di payload `HistoryController` — satu titik, panel admin
  (`Admin/OrderController` → `§12.17`) tidak tersentuh, `BiteshipService` tidak berubah bentuk.
- Key `galat` tetap **ada** bernilai `null` (bukan dihapus): `AssertableJson::where()` memanggil `has()`,
  jadi key wajib ada; bentuk payload §13 tetap satu.
- Berkas disentuh: `app/Http/Controllers/HistoryController.php` (1 baris + komentar),
  `docs/kontrak-props.md` §13 (baris `shipping` + status), `docs/catatan-backend.md`.
- Verifikasi: `HistoryTest` lalu suite penuh 317 test (phpunit.xml = SQLite `:memory:`, bukan DB dev).

## Hasil kartu `t_6032599a` — Fix B-01 `shipping.galat` pembeli (24 Okt 2026)

- `app/Http/Controllers/HistoryController.php` baris ~104: `shipping` = `array_merge(shippingInfo(...), ['galat' => null])`.
  Key tetap ada bernilai `null` (test `where()` menuntut key ada). `BiteshipService` tidak berubah, jadi
  panel admin `§12.17` tetap menerima `galat` non-null (test admin `AdminSalesTest.php:426` hijau).
- `docs/kontrak-props.md` §13: baris `shipping` + contoh JSON (`"galat": null`) + status §13.1 (klarifikasi
  `t_6032599a`, QA v1.2 B-01/D-05).
- Bukti jalan: `php -l` lolos; `--filter HistoryTest` = OK (7 test, 187 assertion); suite penuh
  `php vendor/phpunit/phpunit/phpunit --no-coverage` = **OK (317 tests, 2565 assertions)**, 1m31s,
  PHP 8.3.32 via `PHP_INI_SCAN_DIR` phpqa (bukan DB dev; phpunit `:memory:`). Verifikasi Tech Lead terpisah
  juga 317/317.
- Catatan FE: tidak ada yang perlu diubah — `Public/History.jsx` tidak pernah membaca `shipping.galat`;
  bila nanti dipakai, nilainya selalu `null`.

## Rencana kartu `t_139d20e8` — Fix B-02 label kanal di daftar pesanan admin (24 Okt 2026)

- `OrderController::row()`: tambah `payment_method_label` = `Order::paymentMethodLabel($order->payment_method)`
  (sumber sama dengan detail §12.17). Tanpa relasi baru, jadi tanpa N+1.
- `resources/js/Pages/Admin/Orders/Index.jsx` kolom pembayaran: tampilkan label kanal (`—` bila kosong)
  + badge status bayar yang sudah ada; header jadi `Pembayaran`.
- `docs/kontrak-props.md` §12.16: key `payment_method_label` di contoh JSON + tabel aturan.
- `tests/Feature/Admin/AdminSalesTest.php`: test baru assert label kanal (`qris` → `QRIS`), bukan id mentah.
- Verifikasi: `php -l`, `AdminSalesTest`, suite penuh (sqlite `:memory:` lewat INI scan sementara di scratch,
  bukan DB pemilik), `npm run build`.

### Hasil

- `app/Http/Controllers/Admin/OrderController.php` `row()`: `payment_method_label` ditambahkan (satu baris,
  `Order::paymentMethodLabel($order->payment_method)` — sama dengan detail §12.17; kolom `orders.payment_method`,
  bukan relasi, jadi tanpa query tambahan).
- `resources/js/Pages/Admin/Orders/Index.jsx`: header `Status bayar` → `Pembayaran`, isi = label kanal
  (`—` bila kosong) + badge status bayar lama. Filter dan kolom lain tidak disentuh.
- `docs/kontrak-props.md` §12.16: contoh JSON + baris tabel `payment_method_label` (dan `payment_label` yang
  sebelumnya belum terdokumentasi di tabel). Status §12 tetap DRAFT.
- `tests/Feature/Admin/AdminSalesTest.php`: test baru `test_daftar_pesanan_mengirim_label_kanal_bukan_id_mentah`
  (`bca_va` → `Transfer Bank`; gagal bila id mentah yang dikirim).
- Bukti jalan (24 Okt 2026): `php -l` 2 berkas lolos; `--filter AdminSalesTest` = **OK (17 test, 197 assertion)**;
  suite penuh = **OK (318 tests, 2575 assertions)**, 1m19s, PHP 8.3.32, sqlite `:memory:` (INI scan sementara di
  scratch, php.ini global dan `.env` tidak disentuh); `npm run build` = **lulus** (exit 0, 14,04 s).
- Belum dicek: tampilan kolom di browser (360px/kartu bertumpuk) — wewenang QA/pemilik.




## Rencana kartu `t_8498103a` — B0 trust proxy loopback (PRD-v1.3 §3)

- `bootstrap/app.php`: `$middleware->trustProxies(at: ['127.0.0.1', '::1'])` (bukan `'*'`), plus komentar alasan.
- `tests/Feature/Public/ForwardedProtoTest.php`: tiga kasus — loopback + `X-Forwarded-Proto: https` →
  favicon `https://…`; tanpa header → `http://…` (kontrol); IP tak dipercaya + header → tetap `http://…`
  (bukti bukan `'*'`). Ambil href `<link rel="icon">` (dihasilkan `asset()`), sehingga tidak bergantung
  pada `public/hot`/`public/build` milik DevOps.
- Verifikasi: `php -l`, PHPUnit filter test baru (sqlite `:memory:`), suite penuh.
- Tidak menyentuh `public/hot`, `public/build`, `.env`, server, atau perilaku lain.

## Rencana kartu `t_2c6be520` — B1 webhook Biteship (PRD-v1.3 §2)

- Migrasi `2026_10_24_000005_add_shipping_webhook_columns_to_orders_table`: `shipping_updated_at`
  timestamp null, `shipping_webhook_payload` json null; `Order` fillable + casts ikut.
- `config/biteship.php`: `webhook_token` dari `BITESHIP_WEBHOOK_TOKEN` (tanpa mencetak nilai).
- `app/Services/BiteshipWebhookService.php`: satu-satunya tempat aturan token, pencocokan
  `biteship_order_id`, peta event, status hanya maju, idempoten, payload terakhir (transaksi + lock).
- `app/Http/Controllers/BiteshipWebhookController.php` invokable tipis: JSON rusak → 422, token salah → 403,
  sisanya 200 `{"message":"ok"}`.
- Route `POST /biteship/webhook` (`biteship.webhook`, tanpa auth, `throttle:120,1`) di `routes/web.php`;
  CSRF dikecualikan di `bootstrap/app.php`.
- Test `tests/Feature/Checkout/BiteshipWebhookTest.php`: tiga event, event ganda, status tidak mundur,
  `pending`/`batal` aman, token salah, body rusak, order tak dikenal, dua kolom terisi, uang/stok tetap.
- `docs/db.md` diperbarui (urutan migrasi + kolom `orders`).
- Verifikasi: `php -l`, `php artisan test --filter=BiteshipWebhook` (sqlite `:memory:`), suite penuh.

### Hasil

- `database/migrations/2026_10_24_000005_add_shipping_webhook_columns_to_orders_table.php` (baru):
  `orders.shipping_updated_at` timestamp null, `orders.shipping_webhook_payload` json null (`down()`
  menghapus keduanya). `App\Models\Order` fillable + casts (`datetime`, `array`) ikut diperbarui.
- `config/biteship.php`: `webhook_token` = `env('BITESHIP_WEBHOOK_TOKEN')` (tidak mencetak nilai).
- `app/Services/BiteshipWebhookService.php` (baru): satu tempat aturan — token (`hash_equals`, kosong =
  diterima + `Log::info`), pencocokan `biteship_order_id`, tiga event, status hanya maju
  (`nextOrderStatus`), idempoten (penugasan nilai + `shipped_at` hanya bila null), transaksi +
  `lockForUpdate`. `order.price` hanya menyimpan payload + `shipping_updated_at`; tidak menulis
  `payments`, stok, `shipping_cost`, atau `total`.
- `app/Http/Controllers/BiteshipWebhookController.php` (baru, invokable): token salah → 403
  `{"message":"invalid token"}` + `Log::warning`; body bukan JSON → 422 `{"message":"invalid payload"}`;
  sisanya 200 `{"message":"ok"}` (event/order tak dikenal juga 200 + log).
- `routes/web.php`: `POST /biteship/webhook` name `biteship.webhook`, middleware `throttle:120,1`, di luar
  `auth`; `bootstrap/app.php` CSRF dikecualikan (`biteship/webhook`) — baris `trustProxies` milik kartu B0
  tidak disentuh.
- `tests/Feature/Checkout/BiteshipWebhookTest.php` (baru, 10 test): tiga event, `delivered` pada `dibayar`
  hanya satu langkah (`dikirim`), event ganda idempoten (`shipped_at` + resi tetap), status tidak mundur
  (`dikirim`/`selesai`/`batal`/`pending`), status kurir bermasalah tidak membatalkan pesanan, token salah
  403 (query & header) + token benar 200, body rusak 422, order tak dikenal 200 + `Log::warning`, dan
  `order.price` tidak mengubah `shipping_cost`/`total`/`payments.gross_amount`/stok/`stock_movements`.
- `docs/db.md`: baris migrasi #27 + dua kolom di bagian `orders`.
- Bukti jalan (24 Okt 2026): `php -l` 7 berkas lolos; `php -d extension=pdo_sqlite -d extension=sqlite3
  vendor/bin/phpunit --filter=BiteshipWebhook` = **OK (10 tests, 62 assertions)**; suite penuh (flag sama)
  = **OK (331 tests, 2647 assertions)**, 38 s, PHP 8.3.32, sqlite `:memory:`. `php artisan test` tanpa flag
  gagal `could not find driver` (pdo_sqlite belum aktif di PHP CLI — lihat `docs/langkah-pemilik.md`).
- Belum dicek: `php artisan migrate` pada database pengembangan (kartu melarang) dan kiriman webhook asli
  dari dashboard Biteship (butuh token + tunnel milik pemilik).
- Catatan untuk kartu B2: `shipping_webhook_payload` menyimpan payload terakhir saja (PRD-v1.3 §2.4), jadi
  `shipping_webhook_payload.price` bisa hilang bila event `order.status` datang setelah `order.price` —
  `price_final` harus dibaca apa adanya (`null` bila payload terakhir bukan `order.price`), bukan ditebak.

### Hasil kartu `t_8498103a` — B0 trust proxy loopback

- `bootstrap/app.php`: `$middleware->trustProxies(at: ['127.0.0.1', '::1'])` di `withMiddleware`, sebelum
  append middleware web; komentar menyebut PRD-v1.3 §3 dan alasan menolak `'*'`. Tidak ada perubahan lain
  pada rute, CSRF, alias, atau middleware.
- `tests/Feature/Public/ForwardedProtoTest.php` (3 test, 10 assertion):
  1. `REMOTE_ADDR 127.0.0.1` + `X-Forwarded-Proto: https` → `<link rel="icon">` berawalan `https://` (dari
     `asset()` di `resources/views/app.blade.php`).
  2. Tanpa header → tetap `http://` (kontrol, membuktikan efek berasal dari header).
  3. `X-Forwarded-Proto: https` dari `203.0.113.9` (tak dipercaya) → tetap `http://` (membuktikan bukan `'*'`).
  Href diambil dari `<link rel="icon">`, bukan tag `@vite`, sehingga test tidak bergantung pada `public/hot`
  atau `public/build` milik DevOps.
- Bukti merah: dengan `bootstrap/app.php` versi HEAD (tanpa trustProxies), test 1 gagal
  (`'http://localhost:8000/favicon.ico'` tidak berawalan `https://`); setelah perubahan, hijau.
- Bukti jalan (25 Okt 2026, PHP 8.3.32 + pdo_sqlite lewat `PHP_INI_SCAN_DIR` scratch, sqlite `:memory:`,
  bukan DB pemilik): `php -l` 2 berkas lolos; `--filter ForwardedProtoTest` = **OK (3 tests, 10 assertions)**;
  suite penuh = **OK (321 tests, 2585 assertions)**, 50,2 s.
- `public/hot` dan `public/build` tidak disentuh dan tidak dihapus (milik kartu DevOps D0); `.env` tidak dibaca.
- Untuk DevOps D0: setelah `public/hot` dihapus + `npm run build`, `curl https://<tunnel>/` harus memuat
  `/build/assets/...` dan favicon `https://`. Test di atas hanya membuktikan skema URL; penghapusan `public/hot`
  tidak diuji di sini.

## Rencana kartu `t_5a702574` — B2 props data webhook (PRD-v1.3 §2.6)

- `app/Services/BiteshipService.php`: `shippingInfo()` (bentuk pembeli/dasar) ditambah `updated_at`,
  `driver`, `perlu_tindakan`, `tindakan`; metode baru `shippingInfoAdmin()` (+`price_final`,
  `price_selisih`, `webhook_terakhir`) dan `shippingPerluTindakan()` untuk baris daftar admin.
- `app/Http/Controllers/Admin/OrderController.php`: detail pakai `shippingInfoAdmin()`; baris daftar
  +`shipping_updated_at`, +`shipping_perlu_tindakan`.
- `app/Http/Controllers/CheckoutController.php` §7.9: `pesanan.shipping` bentuk pembeli (`galat` null
  seperti §13). `HistoryController` tidak berubah (sudah memaksa `galat` null).
- `tests/Feature/ShippingPropsV13Test.php` (baru): nilai null benar, retur/gagal, selisih ≠ 0,
  payload terakhir bukan `order.price`, dan pembeli tanpa key admin.
- `docs/kontrak-props.md` §7.9/§12.16/§12.17/§13 + `docs/asumsi.md`. Tanpa migrasi, tanpa `.env`.

### Hasil kartu `t_5a702574` — B2 (25 Okt 2026)

Berkas diubah:
- `app/Services/BiteshipService.php` — `shippingInfo()` + `updated_at`, `driver`, `perlu_tindakan`,
  `tindakan`; baru `shippingInfoAdmin()`, `shippingPriceFinal()`, `shippingPerluTindakan()`,
  `shippingTindakan()`, `shippingStatusBermasalah()`, `shippingDriver()`. Daftar status bermasalah
  memakai `BiteshipWebhookService::STATUS_BERMASALAH` (satu sumber, tidak digandakan).
- `app/Http/Controllers/Admin/OrderController.php` — detail `shippingInfoAdmin()`; baris daftar
  `shipping_updated_at`, `shipping_perlu_tindakan`.
- `app/Http/Controllers/CheckoutController.php` — §7.9 `pesanan.shipping` bentuk pembeli, `galat`
  dipaksa `null`.
- `tests/Feature/ShippingPropsV13Test.php` — 8 test (nilai null, selisih, retur, retur pada
  pesanan selesai, daftar admin, riwayat, halaman selesai).
- `docs/kontrak-props.md` §7.9/§7.11/§12.16/§12.17/§12.23/§13/§13.1; `docs/asumsi.md`.

Tidak berubah: `HistoryController` (sudah memakai `shippingInfo()` + `galat` null), migrasi,
model, `.env`, `docs/db.md` (kolom sudah ada dari B1).

Verifikasi:
- `php -d extension=pdo_sqlite -d extension=sqlite3 vendor/bin/phpunit --filter=ShippingPropsV13Test`
  → OK (8 test, 168 asersi).
- Seluruh suite: `php -d extension=pdo_sqlite -d extension=sqlite3 vendor/bin/phpunit`
  → OK (339 test, 2815 asersi). phpunit.xml memakai SQLite `:memory:`.
- Belum dicek: render React (di luar lingkup backend); tidak menjalankan server/migrasi.

Untuk frontend: `shipping.driver` bisa `null` walau `status` terisi (payload `order.price` tidak
membawa data kurir); `perlu_tindakan`/`tindakan` ikut terkirim ke pembeli tetapi tidak dirender
(design-v1.3 baris 18–19); `price_final`/`price_selisih` hanya ada di detail admin dan bernilai
`null` bila payload terakhir bukan `order.price`.

## Rencana kartu `t_8c48f38d` — T-13-01 webhook JSON generik saat exception (25 Okt 2026)

Rencana (maks 10 baris):
1. `bootstrap/app.php` `withExceptions`: `shouldRenderJsonWhen` untuk `biteship/webhook` (semua
   status, termasuk 429/404/405, dibalas JSON) + callback `render` untuk exception **non-HTTP**
   → `500 {"message":"internal error"}` tanpa SQL/trace, tidak bergantung `APP_DEBUG`.
2. Test baru `tests/Feature/Checkout/BiteshipWebhookExceptionJsonTest.php`: service di-mock
   melempar `RuntimeException` berisi SQLSTATE + nama kolom; kirim tanpa `Accept: application/json`
   agar negosiasi diuji; assert 500, `Content-Type: application/json`, body persis generik.
3. Jalur 200/403/422 tidak disentuh (respons controller tetap), 404 non-webhook tetap 404.
4. Berkas disentuh: `bootstrap/app.php`, satu test baru, `docs/catatan-backend.md`. Tanpa `.env`,
   tanpa migrasi, tanpa perubahan kontrak props (tidak ada key data baru).

Hasil (25 Okt 2026):
- `bootstrap/app.php` `withExceptions`:
  - `shouldRenderJsonWhen(fn ($r) => $r->is('biteship/webhook') || $r->expectsJson())`.
    Versi pertama hanya `$webhook($request)` → **regresi**: callback ini menggantikan
    `expectsJson()` di handler, sehingga 2 test validasi JSON rute lain jadi 302
    (`AdminSalesTest`, `CheckoutShippingTest`). `|| $request->expectsJson()` wajib.
  - `render()` untuk exception **non-4xx** pada path webhook → `500 {"message":"internal error"}`;
    `HttpException` 4xx (403/404/405/429) dilewatkan agar status/pesan bawaan tetap. 5xx
    `HttpException` ikut digenerikkan. Tidak bergantung `APP_DEBUG` (F-13-02 tetap milik pemilik).
- `tests/Feature/Checkout/BiteshipWebhookExceptionJsonTest.php` — 5 test, 22 asersi: exception
  `RuntimeException` berisi SQLSTATE/nama kolom → 500 `application/json` persis
  `{"message":"internal error"}`, tanpa SQLSTATE/nama kolom/trace/`base_path()`; `HttpException(503)`
  → 500 generik; 403 token salah & 422 body rusak tetap (dikirim tanpa `Accept: application/json`);
  `/halaman-tidak-ada-xyz` tetap 404 bukan pesan webhook. Service diganti tiruan lewat
  `app()->instance()` (tanpa DB, tanpa `RefreshDatabase`).
- Verifikasi: `php -d extension=pdo_sqlite -d extension=sqlite3 vendor/bin/phpunit
  tests/Feature/Checkout/BiteshipWebhookExceptionJsonTest.php tests/Feature/Checkout/BiteshipWebhookTest.php`
  → OK (15 test, 84 asersi). Suite penuh → OK (**344 test, 2837 asersi**; baseline 339/2815).
  `php -l bootstrap/app.php` bersih. Tanpa `migrate`, tanpa menyentuh `.env`/database.
- Belum dicek: webhook asli dari dashboard Biteship dan balasan lewat tunnel (butuh token pemilik +
  server berjalan); 429 runtime throttle tidak diuji.
- Dokumen: `docs/review-v1.3.md` T-13-01 dan `docs/pertanyaan-pemilik-v1.3.md` tidak saya ubah
  (bukan lingkup/ milik reviewer & pemilik); F-13-01/02/03 tetap tindakan pemilik.

## t_f09907b0 — probe instalasi webhook Biteship (GET + body kosong)

Rencana: (1) `BiteshipWebhookController` membalas `200 {"status":"ok","success":true}` +
`Log::info` bila `trim($request->getContent()) === ''`, **sebelum** cek token; (2) rute jadi
`Route::match(['get','post'], '/biteship/webhook')`, throttle tetap; (3) dua test baru di
`tests/Feature/Checkout/BiteshipWebhookTest.php`; (4) bukti curl via tunnel. Kontrak tidak
berubah: webhook server-ke-server, bentuknya di PRD-v1.3 §2.1 (bukan `docs/kontrak-props.md`),
dan §2.1 sudah memuat pengecualian probe. Berkas: controller, `routes/web.php`, test, dokumen.

Hasil (25 Okt 2026):
- `BiteshipWebhookController::__invoke` — probe body kosong (POST maupun GET) dijawab
  `200 {"status":"ok","success":true}` + `Log::info('Webhook Biteship: probe instalasi dijawab ok')`,
  tidak memproses apa pun, tidak menyentuh DB. Body non-kosong: alur lama utuh (token → 403,
  JSON rusak → 422, valid → `200 {"message":"ok"}` + efek sama).
- `routes/web.php`: `Route::match(['get','post'], '/biteship/webhook', ...)`, name
  `biteship.webhook`, `throttle:120,1` tidak berubah; CSRF sudah dikecualikan di `bootstrap/app.php`.
- Test baru 2: `test_probe_instalasi_post_body_kosong_dibalas_ok_tanpa_cek_token` (token terisi
  `rahasia-uji` + `?token=salah` + body kosong → 200, bukan 403; `Log::info` sekali) dan
  `test_probe_instalasi_get_dibalas_ok`. Test lama 10 tidak diubah.
- Verifikasi: `phpunit tests/Feature/Checkout/BiteshipWebhookTest.php` → OK (12 test, 69 asersi);
  suite penuh → OK (**346 test, 2844 asersi**; baseline 344/2837). `php -l` bersih untuk 3 berkas.
- Live (server pemilik + tunnel yang sama, bukan server baru): POST body kosong → 200
  `{"status":"ok","success":true}`, GET → 200 sama; body rusak `{bukan json` → 422 tetap.
  Bukti: `docs/bukti-webhook-install-t_f09907b0.txt`.
- Catatan: `POST` payload nyata tanpa token di tunnel masih 200 karena `BITESHIP_WEBHOOK_TOKEN`
  kosong di runtime (F-13-03, milik pemilik); 403 terbukti di test dengan token terisi.
- Belum: pendaftaran ulang URL di dashboard Biteship dan 1 event nyata `order.status`
  (butuh pemilik). Tanpa migrasi, tanpa `.env`, tanpa perubahan DB.


## F12 v1.4 — hapus ubah status manual (B3, kartu t_fc5b4ce1)

Rencana (maks 10 baris): hapus rute `admin.orders.status`, `OrderController@status` + prop
`status_berikut`, `UpdateOrderStatusRequest`, `Order::nextStatuses()`; sesuaikan test lama
(`AdminSalesTest`, `RouteContractTest`) dan kontrak §12.17/§12.18. Berkas: `routes/admin.php`,
`app/Http/Controllers/Admin/OrderController.php`, `app/Models/Order.php`,
`app/Http/Requests/Admin/UpdateOrderStatusRequest.php` (hapus), `tests/Feature/Admin/AdminSalesTest.php`,
`tests/Feature/Contract/RouteContractTest.php`, `docs/kontrak-props.md`.
Tidak menyentuh `BiteshipService`/`OrderService`/`BiteshipWebhookService`/JSX (kartu B1 berjalan paralel).

Hasil (26 Okt 2026):
- `routes/admin.php:142` — rute `PATCH /admin/pesanan/{order}/status` (`admin.orders.status`) hilang;
  `route:list --path=admin/pesanan` kini 5 rute (index, show, resi PATCH/POST, sinkron-pembayaran).
- `app/Http/Controllers/Admin/OrderController.php:136-142` — `show()` hanya mengirim `pesanan`
  (prop `status_berikut` dihapus); method `status()`, import `UpdateOrderStatusRequest`,
  `OrderStatusException`, `ValidationException`, dan dependency `OrderService` dibuang.
- `app/Models/Order.php:124` — `nextStatuses()` dihapus; `isFinal()` dan `STATUS_FLOW` tetap
  (dipakai filter/ringkasan daftar). `app/Http/Requests/Admin/UpdateOrderStatusRequest.php` dihapus.
- Test: `AdminSalesTest::test_daftar_dan_detail_pesanan_admin_tanpa_prop_ubah_status` (:89, asersi
  `missing('status_berikut')`), `::test_rute_ubah_status_manual_sudah_dihapus` (:128 — PATCH lama
  `assertNotFound()`, status/stok/stock_movements tidak berubah), `::test_detail_pesanan_menampilkan_shipped_at_status_dikirim`
  (:405 — keadaan `dikirim` disiapkan langsung, bukan lewat rute). Dua test lama yang menguji
  pembatalan via rute status dihapus (jalur batal sekarang hanya Midtrans, diuji di suite Midtrans).
  `RouteContractTest` tidak lagi memuat `admin.orders.status`.
- `docs/kontrak-props.md` §12.17: contoh & penjelasan `status_berikut` dihapus, ditambah catatan
  status hanya dari Midtrans/Biteship; §12.18 ditandai dihapus (404). (Brief menaruh edit kontrak di
  B2; §12.17/§12.18 milik B3 dan tidak bertabrakan dengan §12.16/§13 milik B2.)
- Verifikasi: `vendor/bin/phpunit --filter='AdminSalesTest|RouteContractTest|BiteshipWebhookTest'`
  → OK (32 test, 256 asersi). Webhook Biteship tetap memajukan status (test lama lulus tanpa diubah).
- Catatan lingkungan: `php.ini` Laragon 8.3.32 di mesin ini mematikan `pdo_sqlite`, jadi test
  dijalankan `php -d extension=pdo_sqlite -d extension=sqlite3 vendor/bin/phpunit ...`
  (sudah tercatat di `docs/langkah-pemilik.md` §7/§"Menjalankan test").
- Suite penuh: **OK (349 test, 2856 asersi)** — `php -d extension=pdo_sqlite -d extension=sqlite3
  vendor/bin/phpunit`. (Percobaan pertama saat kartu B1 t_3a264fac masih menulis memunculkan 4
  gagal di `QaV11OngkirPembayaranTest`; setelah B1 selesai menulis, 13/13 test itu lulus dan suite
  penuh hijau. Tidak ada perubahan B3 yang terlibat.)
- Utang teknis (sengaja tidak dikerjakan, kartu melarang menyentuh `OrderService`):
  `OrderService::changeStatusByAdmin` + `private restoreStock` kini tak terpakai dan menunjuk
  `nextStatuses()` yang sudah dihapus. Perlu kartu lanjutan untuk menghapus keduanya
  (`restoreStock` versi MidtransService tetap dipakai dan tidak tersentuh).

## F11 v1.4 — samakan dasar hitung ongkir (kartu t_3a264fac)

Rencana (maks 10 baris): satu fungsi berat `BiteshipService::beratUnit()` (berat produk apa adanya,
fallback 300 g/unit, tanpa minimum 500 g) dipakai `CartService` (prop `berat_gram`), `OrderService`
(`orders.shipping_weight_gram` + item tarif) dan `BiteshipService::orderPayload` (berat per unit).
`rates()`/`quote()` berhenti menerima & mengirim `destination_city`; guard asal kirim lengkap
(nama, telepon, alamat, kode pos 5 angka, email kontak) dipakai bersama oleh `rates()` dan
`createOrder()`. `OrderService::createFromCart` mencatat `Log::info('Biteship tarif dipakai', …)`.
Berkas: `app/Services/BiteshipService.php`, `app/Services/OrderService.php`,
`app/Services/CartService.php`, `app/Http/Controllers/CheckoutController.php`, test
(`OngkirV14Test` baru + 3 test lama disesuaikan), `docs/kontrak-props.md`, `docs/asumsi.md`.

Hasil (26 Okt 2026):
- `BiteshipService::beratUnit(int)` = `weight_gram > 0 ? weight_gram : 300`; dipakai
  `CartService::unitWeight`, `OrderService::createFromCart`, dan `orderPayload` — satu aturan.
  `max(500, …)` hilang dari `OrderService` & `CartService`.
- `rates()`/`quote()`: parameter `$city` dihapus; body tarif hanya `origin_postal_code`,
  `destination_postal_code`, `couriers`, `items`. `CheckoutController@shipping` tidak lagi
  memvalidasi/mengirim `city` (nilai `customer_city` tetap disimpan di order lewat checkout).
- Guard asal: `BiteshipService::originMasalah()` + `pesanAsalBelumLengkap()` dipakai `rates()` dan
  `createOrder()`; pesan lama (`Kode pos asal toko belum diatur…`, `Pengaturan asal pengiriman belum
  lengkap: …`) tidak berubah. `rates()` menolak sebelum HTTP bila pengaturan belum lengkap.
- Log bukti: `Log::info(BiteshipService::LOG_TARIF, ['order','origin_postal_code',
  'destination_postal_code','weight_gram','courier','service','cost','mode'])` — satu baris per
  order, tanpa kunci/token. Mode `fake` ikut dicatat dengan `mode: fake`.
- Test baru `tests/Feature/Checkout/OngkirV14Test.php` (5 test): berat 250 g × 1 = 250 di body tarif;
  produk berat 0 → 300 g/unit; berat create order = `orders.shipping_weight_gram`; log terpanggil
  dengan field lengkap; asal belum lengkap → `galat`, `Http::assertNothingSent()`.
- Test lama disesuaikan ke aturan baru: `CheckoutShippingTest` (`berat_gram` 1000 → 600 = 300×2,
  `shipping_weight_gram` 1000 → 600), `AdminAutoResiTest` (berat item payload 500 → 250 per unit,
  qty 2 tetap), `QaV11OngkirPembayaranTest` (fixture `contact_email` agar guard asal lolos).
- Verifikasi: `vendor/bin/phpunit` (php 8.3 + `-d extension=pdo_sqlite -d extension=sqlite3` karena
  build Laragon tidak memuat pdo_sqlite di php.ini) → **OK (349 test, 2856 asersi)**, termasuk 5 test
  baru. `php -l` bersih. `artisan test` tidak dipakai: proses anaknya kehilangan flag `-d extension`.
- Belum: perbandingan nyata tarif website vs `order.price` Biteship (butuh key + saldo pemilik,
  PRD-v1.4 §2.3). Tidak ada migrasi, tidak menyentuh `.env`/DB.
- Catatan: field `weight` pada `POST /v1/orders` kini **per unit** (sama dengan body tarif); total
  kirim = Σ `weight × quantity`, diasumsikan Biteship mengalikan `quantity` (lihat `docs/asumsi.md`).

## F13 v1.4 (B2) — riwayat pengiriman & timeline pembeli (kartu `t_f51f8c36`)

Rencana (26 Okt 2026): migrasi `2026_10_26_000006` kolom `orders.shipping_events` json null;
`Order` (+fillable, cast array); `BiteshipWebhookService` append idempoten `{event,status,at}`
maks 50; `BiteshipService::shippingInfo` + `events` (terbaru dulu, label) dan
`shippingCompletedAt()`; `HistoryController` `timeline.completed_at`; kontrak §12.17/§13 + `db.md`;
test baru `tests/Feature/Checkout/TimelineV14Test.php`. Tanpa perubahan JSX.

Hasil (26 Okt 2026):
- Migrasi `2026_10_26_000006_add_shipping_events_to_orders_table` (`json` null, `down` drop kolom);
  `Order` fillable + cast `array`. Sudah terbukti jalan di SQLite uji lewat suite; **belum
  dijalankan di DB pengembangan** (status `Pending` di `migrate:status`, pemilik yang menjalankan
  `php artisan migrate` — PRD-v1.4 §5.2). Catatan: `2026_10_24_000005` juga masih `Pending` di DB
  pengembangan (bukan dari kartu ini).
- `BiteshipWebhookService::appendEvent()` (baris ~137): satu entri `{event,status,at}` per webhook
  cocok (`order.status`, `order.price`, `order.waybill_id`), `status` lowercase/maks 30, `at` ISO
  8601; entri dengan `event`+`status` sama dengan entri terakhir tidak ditambahkan; `array_slice(-50)`
  menyimpan 50 terbaru (list lama → baru). `shipping_webhook_payload` tetap payload terakhir.
- `BiteshipService::shippingInfo()` + `events` (baris ~584) memakai `shippingEvents()`: bentuk
  pembeli `{status,label,at}` lewat `shippingLabel()`, urut **terbaru → terlama**, maks 50, `[]`
  bila kosong. `shippingInfoAdmin()` ikut mendapat key yang sama (aditif, §12.17).
  `shippingCompletedAt()`: `at` entri `delivered` terakhir → fallback `shipping_updated_at` bila
  `status = selesai` → `null`.
- `HistoryController` `timeline.completed_at` (baris ~115). `CheckoutController` tidak perlu diubah:
  halaman selesai/bayar memakai `shippingInfo()` yang sama sehingga `shipping.events` mengalir
  otomatis (PRD-v1.4 §4.3: halaman selesai hanya daftar event, tanpa timeline baru).
  Kontrak §7.9 juga ditambah catatan `pesanan.shipping.events` + baris changelog.
- Test `tests/Feature/Checkout/TimelineV14Test.php` (7 test, 130 asersi):
  `test_dua_webhook_status_identik_hanya_menambah_satu_entri`,
  `test_picked_lalu_delivered_menambah_dua_entri_dan_menyelesaikan_pesanan`,
  `test_riwayat_dibatasi_lima_puluh_entri`,
  `test_props_riwayat_memuat_events_terbaru_dulu_dengan_label`,
  `test_timeline_completed_at_terisi_saat_delivered_pada_pesanan_dikirim`,
  `test_timeline_completed_at_null_tanpa_delivered`,
  `test_halaman_selesai_bayar_memuat_events_pengiriman`.
- Verifikasi: `php -d extension=pdo_sqlite -d extension=sqlite3 vendor/bin/phpunit` →
  **OK (356 test, 2986 asersi)**; `--filter=TimelineV14Test` → OK (7 test). `php -l` semua berkas
  tersentuh bersih. Tanpa menyentuh `.env`, JSX, atau DB pengembangan.


## 2026-10-26 — QA-14-01: buang sisa kode ubah status (t_eb2b12f9)

Rencana (maks 10 baris):
1. Hapus `OrderService::changeStatusByAdmin()` (satu-satunya pemanggil `Order::nextStatuses()` yang sudah tiada).
2. Hapus `restoreStock()` private + `note()` yang jadi yatim; import `OrderStatusException` ikut dibuang.
3. Perbarui komentar test `CheckoutTest.php:582` yang masih menyebut `Order::nextStatuses()`.
4. Berkas disentuh: `app/Services/OrderService.php`, `tests/Feature/Checkout/CheckoutTest.php`, catatan ini.
5. Verifikasi: `php -l`, `grep -rn nextStatuses app tests` kosong, suite PHPUnit (356 test).
6. Tidak menyentuh `.env`, JSX, migrasi, DB pengembangan.

## 2026-10-26 — QA-14-03: buang ajakan "ubah status" dari `shipping.tindakan` (t_4eb06cea)

Rencana (maks 10 baris):
1. `BiteshipService::shippingTindakan()`: hapus penutup `Periksa pesanan dan ubah status bila perlu.`; penutup selisih ongkir tetap.
2. Hasil pesan = daftar §12.17 apa adanya (`Kurir melaporkan paket dikembalikan.` dst.).
3. Perbarui asersi `tests/Feature/ShippingPropsV13Test.php:175` (kunci teks lama).
4. Kontrak §12.17: baris `shipping.tindakan` diberi catatan tanpa ajakan ubah status + baris changelog.
5. `docs/asumsi.md`: catatan keputusan redaksi (tanpa arahan pengganti; uiux bisa minta tambahan).
6. Berkas disentuh: `app/Services/BiteshipService.php`, `tests/Feature/ShippingPropsV13Test.php`,
   `docs/kontrak-props.md`, `docs/asumsi.md`, catatan ini.
7. Verifikasi: `php -l`, `--filter=ShippingPropsV13Test`, suite penuh (356 test).
8. Tidak ada migrasi, tidak menyentuh `.env`/JSX; workspace kartu kosong (scratch), kode proyek di
   `C:/Users/LENOVO/Downloads/toko-kulot` seperti kartu-kartu backend sebelumnya.

Hasil:
- `shippingTindakan()`: penutup hanya untuk selisih ongkir; pesan status = daftar §12.17 apa adanya
  (`Kurir melaporkan paket dikembalikan.`). Kasus gabungan (status + selisih) tetap menghasilkan
  `Kurir melaporkan paket dikembalikan. Ongkir aktual berbeda dari ongkir tagihan. Periksa selisih ongkir pesanan ini.`
- Test: asersi `ShippingPropsV13Test:175` → teks baru. `grep -rn "Periksa pesanan dan ubah status"
  app resources tests routes config` kosong.
- Verifikasi: `php -l` 2 berkas bersih; `--filter=ShippingPropsV13Test` → OK (8 test, 168 asersi);
  suite penuh → **OK (356 test, 2986 asersi)**.
- Frontend tidak perlu berubah: `design-v1.3.md:42` memakai `shipping.tindakan` apa adanya.
- Belum dikerjakan (di luar lingkup): koordinasi redaksi dengan uiux — bila uiux ingin arahan
  pengganti, tinggal tambah satu kalimat di service + §12.17 + test.

**Hasil (QA-14-01).**
- `app/Services/OrderService.php`: `changeStatusByAdmin()`, `private restoreStock()`, `private note()` dihapus (92 baris); import `App\Exceptions\OrderStatusException` dibuang. `DB::`, `Log::`, `$this->stock` tetap dipakai jalur checkout.
- `app/Exceptions/OrderStatusException.php` dihapus (`git rm`): nol pemanggil setelah method di atas hilang (grep `app tests routes bootstrap config resources` → kosong).
- `tests/Feature/Checkout/CheckoutTest.php:582`: komentar diperbarui (tak lagi menyebut `Order::nextStatuses()`); asersi tidak berubah.
- `restoreStock` milik `MidtransService` (baris 600/625) tetap — itu jalur pengembalian stok resmi kontrak §12.18.
- Verifikasi: `php -l` dua berkas bersih; `grep -rn "nextStatuses" app tests` kosong;
  `php -d extension=pdo_sqlite -d extension=sqlite3 vendor/phpunit/phpunit/phpunit < /dev/null`
  → **OK (359 test, 3006 asersi)**. Catatan: QA mencatat 356 test; suite bertambah 3 test dari
  kartu lain yang berjalan paralel saat pemeriksaan ini, bukan dari perubahan di sini.
- Tidak menyentuh `.env`, JSX, migrasi, atau DB pengembangan (test pakai SQLite in-memory).
- Sisa catatan usang di luar lingkup: komentar `database/migrations/2026_10_24_000004_add_shipped_at_to_orders_table.php:10`
  masih menyebut `OrderService::changeStatusByAdmin`; tidak diubah karena aturan migrasi lama.

## 2026-10-26 — v1.5 B2: token webhook Biteship dari nama header apa pun (t_b8bc14f7)

Rencana (maks 10 baris):
1. `BiteshipWebhookController`: kumpulkan kandidat token dari `?token=` + semua header; cocokkan `hash_equals`.
2. Log penerimaan memuat `sumber` (nama header/`query`); log penolakan memuat daftar **nama** header + IP, tanpa nilai token.
3. Token `.env` kosong tetap menerima semua lewat `BiteshipWebhookService::tokenValid()` (tanpa perubahan peta status).
4. Test di `tests/Feature/Checkout/BiteshipWebhookTest.php`: header kustom, `X-Webhook-Token`, query, salah 403, kosong menerima, log tanpa nilai token.
5. Berkas: controller, test, komentar `config/biteship.php` + `routes/web.php`, `docs/langkah-pemilik.md` §v1.5, catatan ini.
6. Verifikasi: `php -l`, `--filter=BiteshipWebhook`, suite penuh (SQLite in-memory).

Hasil:
- `BiteshipWebhookController`: `tokenMasuk()` mengumpulkan `?token=` + semua nilai header, memilih yang `hash_equals` dengan `config('biteship.webhook_token')`; `tokenValid()` tetap satu-satunya gerbang (token kosong = terima semua, peta status tidak disentuh).
- Log diterima: `sumber` = `query` atau **nama** header (mis. `x-api-key`). Log ditolak: `header` = daftar nama header yang diterima + `query_token` boolean + IP. Nilai token tidak pernah masuk log (diasersi test).
- Komentar usang diperbarui: `config/biteship.php`, `routes/web.php`, docblock test. `docs/langkah-pemilik.md` §v1.5 langkah 1 ditambah cara baca `header` di log bila masih 403 (bagian v1.5 sudah ada dari kartu induk, tinggal dilengkapi).
- Verifikasi: `php -l` dua berkas bersih; `--filter=BiteshipWebhook` → OK (19 test, 100 asersi); suite penuh → **OK (368 test, 3045 asersi)**. Catatan balapan: saat suite pertama dijalankan, `OngkirV15OpsiTest::test_duplikat_beda_huruf_dibuang` (kartu B1) sempat gagal karena `BiteshipService` masih ditulis worker paralel; test itu lolos begitu B1 selesai dan suite ulang hijau.
- Webhook Biteship nyata: **belum diuji**, butuh pemilik (kartu mencatat ini).

## 2026-10-26 — QA-14-02: berat create order dari snapshot `orders.shipping_weight_gram` (t_65362988)

Rencana (maks 10 baris):
1. `BiteshipService::bagiBerat(total, qty)`: bagi snapshot berat jadi gram/unit tiap baris, Σ(berat×qty) = total persis.
2. `orderPayload()` pakai snapshot; berat produk hidup hanya fallback bila `shipping_weight_gram` null/0 (order lama).
3. Tanpa migrasi/kolom baru (pilihan "total tersimpan" di kartu) → tidak perlu persetujuan techlead.
4. Test: berat produk diubah, produk dihapus, dua baris qty 5 & 7 di `tests/Feature/Checkout/OngkirV14Test.php`.
5. Verifikasi: `php -l`, `--filter=OngkirV14Test`, suite penuh.
6. Berkas: `app/Services/BiteshipService.php`, `tests/Feature/Checkout/OngkirV14Test.php`, `docs/asumsi.md`, catatan ini.
7. Workspace kartu kosong (scratch); kode proyek di `C:/Users/LENOVO/Downloads/toko-kulot` seperti kartu backend sebelumnya.

Hasil verifikasi (dijalankan):
- `php -l app/Services/BiteshipService.php` → no syntax errors.
- `php -d extension=pdo_sqlite vendor/bin/phpunit --filter=OngkirV14Test` → OK (8 tests, 47 assertions).
- Suite penuh `php -d extension=pdo_sqlite vendor/bin/phpunit` → OK (359 tests, 3006 assertions), 62 s.

Catatan lingkungan (bukan blocker): `php` CLI di mesin ini tidak memuat `pdo_sqlite` secara default
(`php -m` tanpa sqlite) sehingga `php artisan test` gagal "could not find driver". Perlu
`php -d extension=pdo_sqlite vendor/bin/phpunit` untuk menjalankan test (phpunit.xml sudah memakai
`sqlite :memory:` → tidak menyentuh DB pengembangan). `php artisan test` tidak meneruskan flag `-d`.

Perilaku baru:
- Berat payload = `bagiBerat((int) $order->shipping_weight_gram, qty per baris)`; sisa gram dibagi utuh;
  bila sisa tak muat di qty mana pun, dicari kombinasi geseran ±unit (uji nyata: qty 5 & 7 berat 3350 →
  278 & 280). `Log::warning('Berat create order Biteship tidak sama dengan shipping_weight_gram.')`
  hanya muncul untuk kasus mustahil (mis. `total < Σqty`) — tidak ada pembuangan selisih diam-diam.
- Order lama tanpa `shipping_weight_gram` tetap memakai berat produk hidup (jalur lama).

## v1.5 B1 — opsi ekspedisi checkout ikuti pengaturan aktif

Rencana: ubah `app/Services/BiteshipService.php` saja — `services()` menerima baris string
`"courier:service"` + array (normalisasi, buang kosong, dedupe `courier:service` huruf kecil),
`DEFAULT_COURIERS` hanya bila tak ada baris sah; `rates()` urut `courier_name` lalu `service_name`
dan `Log::warning('Biteship layanan aktif tanpa tarif', ['layanan' => [...]])`. Berkas:
`app/Services/BiteshipService.php`, `tests/Feature/Checkout/OngkirV15OpsiTest.php`,
`docs/kontrak-props.md` §7.12, catatan ini. Tanpa migrasi/dependency/.env.

Keputusan: duplikat `courier:service` (beda huruf) dipakai yang **pertama**; huruf asli
`service_code` tidak diubah supaya nilai `opsi[].service_code` tetap sama dengan yang dikirim
frontend saat checkout. Sorting lewat helper `urutOpsi()` dipakai untuk mode `api` dan `fake`.

Perilaku baru:
- `services()`: string `"jne:reg"`, `"JNE:REG"` → satu layanan `jne:reg` (bentuk lama kini dipakai,
  tidak lagi jatuh ke 6 `DEFAULT_COURIERS`); baris `""`, `"jne"`, array tanpa `courier_code`/
  `service_code`, dan nilai non-string/non-array dilewati; default hanya bila nol baris sah.
- `rates()`: `opsi[]` urut `courier_name` lalu `service_name`; layanan aktif yang tidak ada di
  `pricing` Biteship dicatat `Biteship layanan aktif tanpa tarif` dengan konteks `layanan` saja
  (tanpa token/header). `quote()`, `option()`, dan bentuk JSON `opsi` tidak berubah.

Hasil verifikasi (dijalankan):
- `php -l app/Services/BiteshipService.php` dan `php -l tests/Feature/Checkout/OngkirV15OpsiTest.php`
  → no syntax errors.
- `php -d extension=pdo_sqlite vendor/bin/phpunit --filter=OngkirV15OpsiTest` → OK (7 tests, 30 assertions).
- Suite penuh `php -d extension=pdo_sqlite vendor/bin/phpunit` → OK (368 tests, 3045 assertions), 43 s.
- Test baru: `test_baris_string_lama_dipakai_bukan_default`, `test_baris_array_tetap_diterima`,
  `test_duplikat_beda_huruf_dibuang`, `test_hanya_baris_aktif_tampil`,
  `test_default_dipakai_bila_tidak_ada_baris_sah`, `test_opsi_urut_nama_kurir_lalu_layanan`,
  `test_log_layanan_aktif_tanpa_tarif_tanpa_token`.

Belum diuji: tarif Biteship nyata dengan `settings.shipping_couriers` asli (butuh token/pemilik);
semua test memakai `Http::fake()`.

## v1.5 B3 — filter status riwayat + timeline halaman selesai

Rencana: `HistoryController@index` baca `?status=` (nilai sah `Order::STATUS_FLOW` + `batal`,
asing diabaikan), tambah prop `filter {status}`, paginator `withQueryString()`, `ringkasan` dari
seluruh pesanan user. `CheckoutController::orderPayload` tambah `timeline` 4 kunci memakai
`BiteshipService::shippingCompletedAt()`. Berkas: `app/Http/Controllers/HistoryController.php`,
`app/Http/Controllers/CheckoutController.php`, `tests/Feature/HistoryFilterV15Test.php`,
`docs/kontrak-props.md` §7.9/§13, catatan ini. Tanpa migrasi/dependency/.env.

Perilaku baru:
- `HistoryController@index`: `?status=` sah (`Order::STATUS_FLOW` + `batal`) memfilter daftar; nilai
  asing, kosong, atau array (`?status[]=`) → `filter.status = null` dan semua pesanan tampil.
  `ringkasan.total` kini dari `sum()` agregat status (bukan `total()` paginator yang ikut filter),
  jadi tetap global. `->withQueryString()` membuat `links` membawa `status` ke halaman berikutnya.
  Prop baru `filter: {status: string|null}`; key lama tidak berubah.
- `CheckoutController::orderPayload` (dipakai `checkout.success`): key baru `timeline`
  `{created_at, paid_at, shipped_at, completed_at}`; `completed_at` =
  `BiteshipService::shippingCompletedAt()`. Key lama (`created_at`, `paid_at`, `shipping`, dst.) tetap.

Hasil verifikasi (dijalankan):
- `php -l` tiga berkas → no syntax errors.
- `php -d extension=pdo_sqlite vendor/bin/phpunit --filter=HistoryFilterV15Test` → OK
  (5 tests, 127 assertions).
- Suite penuh `php -d extension=pdo_sqlite vendor/bin/phpunit` → OK (373 tests, 3172 assertions), 40 s.
- Test baru: `test_filter_hanya_mengembalikan_status_itu`,
  `test_status_asing_atau_berulang_diabaikan`, `test_halaman_kedua_mempertahankan_status_di_tautan`,
  `test_ringkasan_tetap_global_saat_filter_dipakai`,
  `test_payload_halaman_selesai_memuat_timeline_empat_kunci`.
- `pint --test` → `HistoryController.php` dan test baru lulus; `CheckoutController.php` masih
  melaporkan pelanggaran gaya lama (`no_unused_imports`, `unary_operator_spaces`, dst.) yang sudah
  ada sebelum kartu ini — tidak diformat ulang agar diff tetap kecil.

Catatan: `timeline` di halaman selesai hanya diuji lewat HTTP + Inertia; tampilan (ikon/urutan node)
milik kartu frontend F2.

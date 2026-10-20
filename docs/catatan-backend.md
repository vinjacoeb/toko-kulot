# Catatan Backend — Toko Kulot

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
| `config/midtrans.php` | `merchant_id`/`client_key`/`server_key` dari `env()` (nilai tidak ditulis di dokumen), `is_production`, `fake` (default `true`), `expiry_minutes` 15, `enabled_payments` `['other_qris']`, `notification_url` |
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

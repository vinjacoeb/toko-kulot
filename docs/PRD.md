# PRD — Toko Kulot

> Dokumen ini adalah **sumber kebenaran fungsi**. Untuk tampilan, sumber kebenaran adalah `docs/design.md`.
> Ditulis oleh operator (bukan techlead). Versi 1.0 — 20 Oktober 2026.
> Workspace: `C:/Users/LENOVO/Downloads/toko-kulot`

---

## 1. Ringkasan Produk

Toko Kulot adalah platform e-commerce fashion (daster & kulot) yang berjalan di website resmi sendiri. Tujuan bisnisnya tiga: **meningkatkan penjualan online**, **memperluas jangkauan lewat SEO**, dan **menaikkan konversi lewat kampanye Meta Ads** (landing page yang cepat dan relevan adalah syarat mutu iklan).

Website menyediakan:
- katalog produk dengan filter kategori,
- halaman detail produk (galeri, varian ukuran/warna, harga eceran & grosir, ketersediaan stok),
- keranjang dan proses pemesanan,
- pembayaran **QRIS via Midtrans (satu-satunya metode pembayaran)**,
- pembelian **eceran dan grosir** (harga bertingkat per kuantitas),
- penilaian bintang 1–5 + komentar setelah checkout selesai,
- panel admin untuk mengelola katalog, stok, pesanan, pesan, penilaian, dan seluruh konten website.

Platform juga menjadi alat pengembangan brand dan retensi: konten landing page, carousel, FAQ, header/footer, logo, dan halaman kontak semuanya dapat diubah dari panel admin tanpa deploy ulang.

---

## 2. Tujuan & Metrik Keberhasilan

| # | Tujuan | Metrik | Target awal |
|---|---|---|---|
| G1 | Konversi iklan Meta | Conversion rate (order / sesi) | ≥ 1,5% |
| G2 | Kecepatan halaman | LCP halaman produk (mobile, 4G) | ≤ 2,5 s |
| G3 | SEO | Semua halaman publik punya title, meta description, canonical, sitemap.xml, robots.txt | 100% |
| G4 | Kepercayaan pembeli | Rasio pesanan dengan ulasan bintang ≥ 4 | ≥ 60% |
| G5 | Efisiensi operasional | Admin bisa menambah produk + stok tanpa bantuan developer | 100% alur |

---

## 3. Persona & Peran

| Persona | Kebutuhan utama | Titik sentuh |
|---|---|---|
| **Pembeli eceran** (mobile-first, dari Meta Ads) | Lihat produk cepat, harga jelas, checkout singkat | Landing, /produk, /produk/{slug}, cart, checkout QRIS |
| **Pembeli grosir** (reseller) | Harga per kuantitas, stok banyak, order berulang | Detail produk (tabel harga grosir), checkout |
| **Admin/Owner** | Kelola katalog, stok, pesanan, konten, akun admin | /admin/* |
| **Calon pembeli baru** | Info toko, lokasi, kontak, FAQ | /kontak-kami, FAQ di landing |

**Dua tier login, dua guard terpisah:**
1. `web` guard → pembeli (`users` table). Login di `/login`, register di `/register`.
2. `admin` guard → pengelola (`admins` table). Login di `/admin/login`.

Admin **tidak boleh** bisa login lewat `/login`, pembeli **tidak boleh** masuk `/admin`. Middleware wajib memisahkan keduanya.

---

## 4. Arsitektur Teknis

### 4.1 Stack (final, tidak boleh diganti tanpa persetujuan pemilik)
- **Backend:** Laravel 12.70 (PHP 8.3) — naik dari 11.57 karena `composer audit` menemukan 4 advisory pada jalur 11.x yang tidak punya rilis perbaikan; 12.70 = 0 advisory
- **Frontend:** React 18 + **Inertia.js** (bukan SPA terpisah, bukan API-only), Vite
- **Styling:** Tailwind CSS + design token dari `docs/design.md`
- **Database:** MySQL 8, nama database **`toko-kulot`** (pakai backtick saat query manual karena ada tanda hubung)
- **Auth:** Laravel session guard, dua guard (`web`, `admin`)
- **Pembayaran:** Midtrans **Snap / Core API dengan `enabled_payments = ["other_qris"]`** — QRIS saja
- **Testing:** PHPUnit (feature + unit), Laravel HTTP tests

### 4.2 Struktur direktori yang diharapkan

```
toko-kulot/
├─ app/
│  ├─ Http/
│  │  ├─ Controllers/
│  │  │  ├─ Public/        (HomeController, ProductController, CartController, CheckoutController, ContactController, ReviewController)
│  │  │  └─ Admin/         (AuthController, DashboardController, ProductController, CategoryController, StockController, OrderController, MessageController, ReviewController, SettingController, AccountController)
│  │  ├─ Middleware/       (HandleInertiaRequests, EnsureAdmin, SharePublicSettings)
│  │  └─ Requests/         (form request per aksi tulis)
│  ├─ Models/              (User, Admin, Category, Product, ProductImage, ProductVariant, StockMovement, Cart, CartItem, Order, OrderItem, Payment, Review, ContactMessage, Setting, Carousel, Faq)
│  └─ Services/            (MidtransService, OrderService, CartService, SettingService)
├─ database/
│  ├─ migrations/
│  └─ seeders/             (DatabaseSeeder + seeder per domain)
├─ resources/
│  ├─ js/
│  │  ├─ app.jsx
│  │  ├─ Layouts/          (PublicLayout.jsx, AdminLayout.jsx, AuthLayout.jsx)
│  │  ├─ Pages/
│  │  │  ├─ Public/        (Home, Products/Index, Products/Show, Contact, Cart, Checkout, CheckoutSuccess, Auth/Login, Auth/Register, Auth/ForgotPassword)
│  │  │  └─ Admin/         (Login, Dashboard, Products/*, Categories/*, Stocks/*, Orders/*, Messages/*, Reviews/*, Settings/*, Accounts/*)
│  │  └─ Components/       (Header, Footer, ProductCard, Carousel, FaqAccordion, StarRating, QrisPanel, Admin/Sidebar, Admin/Table, Admin/Modal)
│  └─ css/app.css
├─ routes/
│  ├─ web.php              (rute publik + auth user)
│  └─ admin.php            (rute /admin/*, prefix + middleware admin)
└─ docs/                   (PRD.md, design.md, brief per peran, ringkasan-tim.md)
```

### 4.3 Konvensi
- Semua respons halaman = **Inertia render** (`Inertia::render('Public/Home', [...])`). Tidak ada Blade view untuk UI, kecuali `app.blade.php` sebagai root Inertia.
- Semua aksi tulis = POST/PATCH/DELETE dengan **CSRF aktif**, validasi lewat FormRequest.
- Redirect setelah aksi tulis memakai `redirect()->route()` + flash message; flash dibaca lewat `HandleInertiaRequests` shared props.
- Nama route wajib eksplisit (`public.products.show`, `admin.products.store`, dst.).
- Bahasa UI: **Indonesia**. Nama variabel/kode: Inggris.
- Uang disimpan sebagai **integer rupiah** (tanpa desimal), format tampilan `Rp1.234.567`.

---

## 5. Peta Rute (kontrak wajib)

### 5.1 Publik & Pembeli (`routes/web.php`)

| Method | URI | Name | Keterangan |
|---|---|---|---|
| GET | `/` | `home` | Landing: carousel, kategori, produk unggulan, FAQ, konten pengaturan |
| GET | `/produk` | `products.index` | Katalog + filter kategori + pencarian + sort + pagination |
| GET | `/produk/{slug}` | `products.show` | Detail produk, varian, tabel harga eceran/grosir, stok, ulasan |
| GET | `/kontak-kami` | `contact` | Info kontak, lokasi (map embed), form pesan |
| POST | `/kontak-kami` | `contact.store` | Simpan pesan masuk |
| GET | `/keranjang` | `cart.index` | Keranjang (boleh guest via session, wajib login saat checkout) |
| POST | `/keranjang` | `cart.store` | Tambah item (product_id, variant_id, qty) |
| PATCH | `/keranjang/{item}` | `cart.update` | Ubah qty |
| DELETE | `/keranjang/{item}` | `cart.destroy` | Hapus item |
| GET | `/register` | `register` | Form daftar (guest) |
| POST | `/register` | `register.store` | Buat akun pembeli |
| GET | `/login` | `login` | Form masuk pembeli |
| POST | `/login` | `login.store` | Autentikasi guard `web` |
| GET | `/forgot-password` | `password.request` | Form lupa password |
| POST | `/forgot-password` | `password.email` | Kirim tautan reset |
| GET | `/reset-password/{token}` | `password.reset` | Form reset |
| POST | `/reset-password` | `password.update` | Simpan password baru |
| POST | `/logout` | `logout` | Logout guard `web` |
| GET | `/checkout` | `checkout.index` | Ringkasan + form data pengiriman (auth wajib) |
| POST | `/checkout` | `checkout.store` | Buat order + transaksi Midtrans QRIS → redirect ke halaman bayar |
| GET | `/checkout/{order}/bayar` | `checkout.pay` | Tampilkan QR, status, tombol cek status |
| GET | `/checkout/{order}/status` | `checkout.status` | Polling status pembayaran (JSON) |
| GET | `/checkout/{order}/selesai` | `checkout.success` | Sukses + form penilaian bintang |
| POST | `/checkout/{order}/ulasan` | `checkout.review` | Simpan rating 1–5 + komentar |
| POST | `/midtrans/notification` | `midtrans.notification` | Webhook Midtrans (**tanpa CSRF**) |

### 5.2 Admin (`routes/admin.php`, prefix `/admin`, name prefix `admin.`)

| Method | URI | Name | Keterangan |
|---|---|---|---|
| GET | `/admin/login` | `admin.login` | Form masuk admin (guest:admin) |
| POST | `/admin/login` | `admin.login.store` | Autentikasi guard `admin` |
| POST | `/admin/logout` | `admin.logout` | Logout admin |
| GET | `/admin` | `admin.dashboard` | Monitoring: omzet, order, produk terlaris, stok kritis, pesanan terbaru |
| GET/POST/PUT/DELETE | `/admin/produk[/{product}]` | `admin.products.*` | CRUD produk + galeri gambar + varian |
| GET/POST/PUT/DELETE | `/admin/kategori[/{category}]` | `admin.categories.*` | CRUD kategori |
| GET | `/admin/stok` | `admin.stocks.index` | Daftar stok per varian, filter stok kritis |
| POST | `/admin/stok/{variant}/masuk` | `admin.stocks.in` | Tambah stok (stock movement `in`) |
| POST | `/admin/stok/{variant}/keluar` | `admin.stocks.out` | Kurangi stok (movement `out`) |
| GET | `/admin/stok/riwayat` | `admin.stocks.history` | Riwayat pergerakan stok |
| GET | `/admin/pesanan` | `admin.orders.index` | Daftar pesanan + filter status |
| GET | `/admin/pesanan/{order}` | `admin.orders.show` | Detail pesanan, bukti bayar, aksi ubah status |
| PATCH | `/admin/pesanan/{order}/status` | `admin.orders.status` | Ubah status (pending→dibayar→diproses→dikirim→selesai/batal) |
| GET | `/admin/pesan-masuk` | `admin.messages.index` | Pesan dari /kontak-kami |
| PATCH | `/admin/pesan-masuk/{message}/baca` | `admin.messages.read` | Tandai dibaca |
| POST | `/admin/pesan-masuk/{message}/balas` | `admin.messages.reply` | Kirim balasan (tersimpan + tampil ke pengirim) |
| GET | `/admin/penilaian` | `admin.reviews.index` | Daftar ulasan + rating |
| POST | `/admin/penilaian/{review}/balas` | `admin.reviews.reply` | Balas ulasan |
| PATCH | `/admin/penilaian/{review}/tampil` | `admin.reviews.visibility` | Tampilkan/sembunyikan ulasan |
| GET | `/admin/pengaturan` | `admin.settings.index` | Semua pengaturan dalam tab |
| PUT | `/admin/pengaturan` | `admin.settings.update` | Simpan pengaturan umum (nama toko, logo, header, footer, kontak, lokasi) |
| PUT | `/admin/pengaturan/landing` | `admin.settings.landing` | Konten landing page (hero, seksi, teks) |
| POST/PUT/DELETE | `/admin/pengaturan/carousel[/{carousel}]` | `admin.carousels.*` | CRUD slide carousel |
| POST/PUT/DELETE | `/admin/pengaturan/faq[/{faq}]` | `admin.faqs.*` | CRUD FAQ |
| GET | `/admin/akun` | `admin.accounts.index` | Daftar akun admin |
| POST | `/admin/akun` | `admin.accounts.store` | Tambah akun admin |
| PUT | `/admin/akun/{admin}` | `admin.accounts.update` | Ubah data/role/password |
| DELETE | `/admin/akun/{admin}` | `admin.accounts.destroy` | Nonaktifkan/hapus (tidak boleh hapus diri sendiri) |

---

## 6. Model Data & Skema Database

Semua tabel pakai `id` bigint auto-increment, `timestamps`, dan `softDeletes` bila disebut.

| Tabel | Kolom kunci | Catatan |
|---|---|---|
| `users` | name, email (unique), password, phone, address, city, postal_code, email_verified_at | Pembeli |
| `admins` | name, email (unique), password, role (`owner`\|`admin`\|`staff`), is_active | Guard `admin` |
| `password_reset_tokens` | email, token, created_at | Bawaan Laravel |
| `categories` | name, slug (unique), description, image, sort_order, is_active | Kategori produk |
| `products` | category_id, name, slug (unique), sku, description, short_description, base_price, wholesale_price, min_wholesale_qty, weight_gram, is_active, is_featured, rating_avg, rating_count | `base_price` harga eceran |
| `product_images` | product_id, path, alt, sort_order, is_primary | Galeri |
| `product_variants` | product_id, size, color, sku (unique), price_delta, stock, is_active | Stok di level varian |
| `stock_movements` | product_variant_id, type (`in`\|`out`\|`adjust`\|`sale`), qty, note, admin_id, created_at | Audit stok |
| `carts` | user_id (nullable), session_id, expires_at | Guest cart via session |
| `cart_items` | cart_id, product_id, product_variant_id, qty, unit_price | Harga dikunci saat masuk cart |
| `orders` | user_id, code (unique, mis. `TK-20261020-0001`), status, subtotal, shipping_cost, discount, total, payment_method (`qris`), payment_status, customer_name, customer_phone, customer_email, shipping_address, city, postal_code, notes, paid_at | Status order |
| `order_items` | order_id, product_id, product_variant_id, product_name, variant_label, qty, unit_price, line_total | Snapshot nama/harga saat order |
| `payments` | order_id, provider (`midtrans`), transaction_id, order_id_midtrans, qris_url, qr_string, gross_amount, status (`pending`\|`settlement`\|`expire`\|`deny`\|`cancel`), payload (json), paid_at, expires_at | QRIS |
| `reviews` | order_id, product_id, user_id, rating (1–5), comment, admin_reply, replied_at, is_visible | Ulasan pasca checkout |
| `contact_messages` | name, email, phone, subject, message, is_read, admin_reply, replied_at, ip | Pesan masuk |
| `settings` | key (unique), value (text), group, type (`text`\|`textarea`\|`image`\|`json`), label | Key-value konfigurasi situs |
| `carousels` | title, subtitle, image, link, button_text, sort_order, is_active | Slide landing |
| `faqs` | question, answer, sort_order, is_active | FAQ landing |

**Kunci `settings` minimum:** `store_name`, `store_logo`, `store_tagline`, `header_nav` (json), `footer_about`, `footer_links` (json), `footer_social` (json), `contact_email`, `contact_phone`, `contact_whatsapp`, `contact_address`, `contact_map_embed`, `landing_hero` (json), `landing_sections` (json), `seo_default_title`, `seo_default_description`, `shipping_cost_default`, `midtrans_client_key`, `midtrans_is_production`.

**Relasi penting:** Product → Category (belongsTo), Product → Variants (hasMany), Variant → StockMovements (hasMany), Order → Items (hasMany), Order → Payment (hasOne), Order → Reviews (hasMany), Review → Product/User.

---

## 7. Alur Bisnis

### 7.1 Katalog → Detail
1. Pembeli masuk `/` atau `/produk`.
2. Filter kategori / pencarian / sort (terbaru, harga, terlaris).
3. Klik produk → `/produk/{slug}`: galeri, harga eceran, tabel harga grosir (`min_wholesale_qty` → `wholesale_price`), pilih varian (ukuran/warna), indikator stok (`Tersedia` / `Stok terbatas: n` / `Habis`).
4. Produk habis: tombol beli disabled, CTA "Hubungi kami".

### 7.2 Keranjang → Checkout → QRIS
1. Tambah ke keranjang (guest boleh, disimpan di session).
2. `/keranjang`: ubah qty, hapus, lihat subtotal. Harga grosir otomatis aktif bila qty ≥ `min_wholesale_qty`.
3. Checkout wajib login. Guest diarahkan ke `/login` dengan intended URL.
4. `/checkout`: form nama, telepon, email, alamat, kota, kode pos, catatan. Ringkasan biaya: subtotal + ongkir + total.
5. Submit → `OrderService` membuat `orders` + `order_items` (snapshot) + `payments`, kurangi stok via `stock_movements` tipe `sale`, panggil Midtrans **QRIS**.
6. Redirect ke `/checkout/{order}/bayar` → tampilkan QR (dari `qr_string`/`qris_url`), countdown kedaluwarsa (default 15 menit), tombol "Cek status".
7. Webhook `/midtrans/notification` menandai `settlement` → order `dibayar`, stok final, `paid_at` diisi.
8. Setelah sukses → `/checkout/{order}/selesai` menampilkan ringkasan + **form penilaian bintang 1–5 + komentar** untuk setiap produk pada order.

### 7.3 Penilaian
- Hanya pembeli yang order-nya `selesai`/`dibayar` dan item-nya ada di order tersebut yang bisa menilai.
- Satu produk satu ulasan per order (unique: `order_id` + `product_id`).
- Rating agregat produk dihitung ulang (`rating_avg`, `rating_count`) setiap ulasan disimpan.
- Ulasan tampil di halaman detail produk (yang `is_visible`), admin bisa membalas.

### 7.4 Pesan masuk
- `/kontak-kami` menyimpan `contact_messages`.
- Admin melihat, menandai dibaca, membalas (balasan tersimpan di `admin_reply` dan dikirim ke email pengirim bila konfigurasi email aktif; bila tidak, cukup tampil sebagai catatan internal + konfirmasi ke pengirim).

---

## 8. Integrasi Midtrans QRIS

- Paket: `midtrans/midtrans-php` (composer).
- Kredensial di `.env`: `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION`, `MIDTRANS_MERCHANT_ID`.
- Channel yang diizinkan: **QRIS saja**. Pada request Snap/Core, set `enabled_payments: ["other_qris"]`. Tidak ada kartu kredit, VA, e-wallet, atau COD.
- Order id Midtrans = `orders.code`. `gross_amount` = `orders.total`.
- Webhook wajib memverifikasi `signature_key` = `sha512(order_id + status_code + gross_amount + server_key)`.
- Idempoten: webhook yang sama tidak boleh menambah stok/omzet dua kali.
- Mode sandbox dipakai saat pengembangan; produksi hanya setelah pemilik mengisi kredensial asli.
- **Bila kredensial belum ada:** `MidtransService` berjalan dalam mode `fake` — membuat `qr_string` dummy yang valid secara format dan menandai payment `pending`, agar UI dan alur bisa diuji tanpa kredensial. Mode ini dikendalikan `MIDTRANS_FAKE=true` dan wajib dimatikan di produksi.

---

## 9. Panel Admin — Spesifikasi Halaman

| Halaman | Isi wajib | Aksi |
|---|---|---|
| `/admin` (Dashboard) | Kartu KPI: omzet hari ini / 7 hari / 30 hari, jumlah order per status, produk terlaris, stok kritis (< 5), grafik penjualan 14 hari, 5 pesanan terbaru, 5 ulasan terbaru | Klik kartu → halaman terkait |
| `/admin/produk` | Tabel: gambar, nama, SKU, kategori, harga, total stok, status. Pencarian + filter kategori + pagination | Tambah, edit, hapus, aktif/nonaktif, unggah galeri, kelola varian |
| `/admin/kategori` | Tabel kategori + jumlah produk | CRUD, urutkan, aktif/nonaktif |
| `/admin/stok` | Tabel per varian: produk, varian, stok, status. Filter "stok kritis" | Stok masuk/keluar + catatan, riwayat movement |
| `/admin/pesanan` | Tabel order: kode, tanggal, nama, total, status bayar, status order. Filter status + rentang tanggal | Detail, ubah status, lihat QR/bukti, cetak |
| `/admin/pesan-masuk` | Tabel pesan: nama, subjek, tanggal, status baca | Baca detail, balas, tandai dibaca |
| `/admin/penilaian` | Tabel ulasan: produk, pembeli, rating, komentar, balasan, visibilitas | Balas, sembunyikan/tampilkan |
| `/admin/pengaturan` | Tab: **Umum** (nama toko, tagline, logo, favicon), **Landing** (hero, seksi, CTA), **Carousel**, **FAQ**, **Header** (menu), **Footer** (tentang, tautan, sosial), **Kontak** (email, telepon, WA, alamat, embed peta), **SEO**, **Pembayaran** (Midtrans) | Simpan per tab, unggah gambar, CRUD carousel/FAQ, urutkan |
| `/admin/akun` | Tabel admin: nama, email, role, status | Tambah admin, ubah role, reset password, nonaktifkan (tidak bisa hapus diri sendiri, minimal 1 owner aktif) |

Semua tabel: server-side pagination, pencarian, dan aksi destruktif memakai konfirmasi modal.

---

## 10. Desain & Slicing

- Rujukan visual: **erigostore.co.id** (Shopify storefront), diduplikasi lewat REA (reverse engineering) menjadi `docs/design.md`.
- `docs/design.md` wajib memuat: design token (warna, tipografi, spacing, radius, shadow), struktur layout tiap halaman, inventaris komponen beserta state (default/hover/active/disabled/loading/error/empty), grid responsif (mobile 360–639, tablet 640–1023, desktop 1024+), dan catatan animasi.
- Implementasi memakai Tailwind dengan token dipetakan ke `tailwind.config.js` (bukan hardcode hex di JSX).
- **Aturan konflik:** bila PRD dan design bertentangan → **PRD menang untuk fungsi**, **design menang untuk tampilan**; catat di `docs/pertanyaan-pemilik.md`.
- Aset gambar produk sementara memakai placeholder lokal di `public/images/` (tidak boleh menaut ke CDN pihak lain saat produksi).

---

## 11. Non-Functional Requirements

| Aspek | Ketentuan |
|---|---|
| Responsif | Mobile-first; tanpa horizontal scroll pada 360px; target sentuh ≥ 44px |
| Performa | Build Vite ter-split; gambar `loading="lazy"`; LCP ≤ 2,5 s |
| SEO | Title + meta description dinamis per halaman, canonical, OG tags, `sitemap.xml`, `robots.txt`, JSON-LD `Product` + `BreadcrumbList` |
| Aksesibilitas | Kontras ≥ 4,5:1, `alt` pada semua gambar, navigasi keyboard, `aria-label` pada kontrol ikon |
| Keamanan | CSRF aktif, password hashing bcrypt, rate limit login (5/menit), validasi upload (jpg/png/webp ≤ 2MB), middleware guard terpisah, webhook signature diverifikasi |
| Data | Seed lengkap agar toko bisa didemokan tanpa data asli |
| Observability | Log Laravel untuk error pembayaran; admin bisa melihat status pembayaran per order |

---

## 12. ATURAN KERJA TIM (WAJIB, TIDAK BOLEH DILANGGAR)

Berlaku untuk semua agent, termasuk techlead.

**R1 — Batas peran.** Setiap agent hanya mengerjakan kartu yang di-assign kepadanya. Tidak boleh mengambil kartu agent lain, tidak boleh mengerjakan "sekalian".

**R2 — Workspace.** Semua kartu memakai `workspace_kind='dir'`, `workspace_path='C:/Users/LENOVO/Downloads/toko-kulot'`. Tidak ada workspace lain, tidak ada clone baru.

**R3 — Larangan `.env`.** Tidak ada agent yang boleh membuat, mengubah, atau menghapus `.env`. Yang di-commit hanya `.env.example`. Nilai `DB_*`, `APP_KEY`, `MIDTRANS_*` diisi pemilik.

**R4 — Larangan install skill/MCP di folder project.** Skill dan MCP dipasang di folder profil agent masing-masing (`C:/Users/LENOVO/AppData/Local/hermes/profiles/<agent>/`), bukan di dalam `toko-kulot/`. Dilarang membuat folder `.agent/`, `.agents/`, `.claude/`, atau sejenisnya di root project.

**R5 — Techlead hanya dokumen.** Techlead hanya membaca `docs/` dan menulis di `docs/` serta membuat/mengubah kartu Kanban. Techlead **tidak menulis kode**, tidak menjalankan `composer`/`npm`/`artisan`, tidak menyalakan server, dan kolom `skills` pada kartunya selalu kosong.

**R6 — Urutan kerja.** Desain dulu, backend fondasi kedua, integrasi terakhir:
`design.md → migrasi + seeder → auth → katalog API/controller → frontend slicing → checkout QRIS → admin → QA`.
Dilarang mengerjakan halaman frontend sebelum bagian `design.md` yang relevan selesai.

**R7 — Sumber kebenaran.** Fungsi: `docs/PRD.md`. Tampilan: `docs/design.md`. Bila bertentangan: PRD untuk fungsi, design untuk tampilan, catat di `docs/pertanyaan-pemilik.md`. Jangan memblokir pekerjaan karena ambiguitas — catat lalu lanjut dengan asumsi paling masuk akal.

**R8 — Satu kartu satu commit.** Commit message diawali ID kartu, contoh `K4: migrasi & model katalog`. Dilarang commit gabungan beberapa kartu.

**R9 — Definition of Done.** Kartu hanya boleh `kanban_complete` bila DoD kartu terpenuhi **dan** bukti perintah terlampir (`php artisan migrate:fresh --seed` sukses, `npm run build` sukses, atau hasil tes yang relevan). Klaim tanpa bukti = belum selesai.

**R10 — Blokir yang sah.** `kanban_block` hanya bila: (a) butuh keputusan pemilik yang mengubah fungsi, (b) kredensial eksternal benar-benar tidak ada dan tidak bisa difake, (c) dependensi kartu belum selesai. Selain itu selesaikan atau catat asumsi.

**R11 — Tanpa server liar.** Dilarang menjalankan `php artisan serve` / `npm run dev` sebagai proses permanen di background tanpa instruksi pemilik. Verifikasi memakai build + test.

**R12 — Bahasa.** UI dan teks toko: Indonesia. Kode, nama variabel, nama route, commit: Inggris.

**R13 — Data uji.** Seeder harus idempoten (`updateOrCreate`), aman dijalankan berulang, dan tidak pernah menghapus data pemilik tanpa `migrate:fresh` eksplisit.

**R14 — Kualitas frontend.** Setiap komponen React wajib: `key` pada list, tidak ada `console.log` tertinggal, tidak ada teks placeholder `Lorem ipsum` di halaman jadi, state loading & empty ditangani.

**R15 — Titik berhenti pemilik.** Setelah K1 dan setelah K3 (design.md selesai), techlead berhenti dan menunggu persetujuan pemilik sebelum melanjutkan. Ini satu-satunya titik tunggu yang diizinkan.

---

## 13. Daftar Kartu Kanban (K1–K16)

Board: `toko-kulot`. Assignee persis salah satu dari: `uiux`, `backenddeveloper`, `frontenddeveloper`, `qatesting`, `devops`, `techlead`. Semua kartu: `workspace_kind='dir'`, `workspace_path='C:/Users/LENOVO/Downloads/toko-kulot'`, `skills=[]`.

| ID | Judul | Assignee | Parents |
|---|---|---|---|
| K1 | Pelajari PRD + design, tulis ringkasan tim & brief per peran | techlead | — |
| K2 | Fondasi proyek: Laravel 12 + Inertia + React + MySQL + `.env.example` | devops | K1 |
| K3 | `docs/design.md` hasil REA erigostore + design token + inventaris komponen | uiux | K1 |
| K4 | Migrasi & model seluruh domain (katalog, order, ulasan, setting) | backenddeveloper | K2 |
| K5 | Seeder lengkap (kategori, produk, varian, stok, admin, user, order contoh, ulasan, setting, carousel, FAQ) | backenddeveloper | K4 |
| K6 | Autentikasi dua tier: guard `web` + guard `admin`, register/login/forgot/logout, `/admin/login` | backenddeveloper | K4 |
| K7 | Katalog publik: controller + query filter/sort/pagination + detail produk + kontak | backenddeveloper | K5 |
| K8 | Keranjang + checkout + Midtrans QRIS + webhook + halaman status bayar | backenddeveloper | K7 |
| K9 | Ulasan bintang 1–5, pesan masuk + balasan admin, CRUD pengaturan/carousel/FAQ | backenddeveloper | K8 |
| K10 | Layout publik + landing page (slicing dari `design.md`) | frontenddeveloper | K3 |
| K11 | Halaman `/produk`, `/produk/{slug}`, `/kontak-kami` | frontenddeveloper | K10, K7 |
| K12 | Halaman auth, keranjang, checkout QRIS, sukses + form rating | frontenddeveloper | K11, K8 |
| K13 | Layout admin + dashboard monitoring penjualan | frontenddeveloper | K10 |
| K14 | Halaman admin: produk, kategori, stok, pesanan, pesan, penilaian, pengaturan, akun | frontenddeveloper | K13, K9 |
| K15 | Unit + feature test, QA iterasi bug, laporan bug | qatesting | K12, K14 |
| K16 | Build produksi, verifikasi E2E, dokumentasi deploy, checklist rilis | devops | K15 |

Body tiap kartu maksimal 8 baris: tugas, rujukan dokumen, output, DoD, aturan.

---

## 14. Asumsi & Pertanyaan Pemilik

Belum ada jawaban pemilik. Semua poin di bawah **dikerjakan dengan asumsi** yang tertulis; jangan memblokir.

| # | Hal | Asumsi yang dipakai | Dampak bila salah |
|---|---|---|---|
| A1 | Ongkos kirim | Flat `Rp20.000`, dapat diubah di `/admin/pengaturan` | Perlu integrasi kurir |
| A2 | Pembayaran | QRIS saja via Midtrans; tanpa COD/VA/kartu | Perubahan alur checkout |
| A3 | Grosir | Harga grosir aktif otomatis saat qty ≥ `min_wholesale_qty` per produk | Perlu level harga reseller |
| A4 | Verifikasi email | Tidak wajib; akun langsung aktif setelah register | Perlu alur verifikasi |
| A5 | Ulasan | Hanya pembeli dengan order `dibayar`/`selesai`, 1 ulasan per produk per order | Perlu moderasi lebih ketat |
| A6 | Balasan pesan | Disimpan di DB; pengiriman email opsional (SMTP belum tentu tersedia) | Perlu antrean email |
| A7 | Logo & gambar | Diunggah ke `storage/app/public`, disajikan lewat symlink `public/storage` | Perlu CDN/object storage |
| A8 | Multi-bahasa | Indonesia saja | Perlu i18n |
| A9 | Stok | Stok di level varian; produk tanpa varian tetap punya 1 varian default | Perlu restrukturisasi |
| A10 | Nomor order | Format `TK-YYYYMMDD-NNNN` urut harian | — |
| A11 | Akun admin pertama | Dibuat seeder: `admin@tokokulot.test` / password dari seeder, wajib diganti pemilik | — |
| A12 | Peta lokasi | Embed Google Maps iframe dari nilai `contact_map_embed` | Perlu API key Maps |
| A13 | Kurs/format uang | Integer rupiah, tanpa desimal, tanpa PPN | Perlu perhitungan pajak |
| A14 | Diskon | Tidak ada kupon di tahap ini; kolom `discount` disiapkan | Perlu modul promo |
| A15 | Kurir & resi | Tidak ada integrasi kurir; nomor resi diisi manual di detail pesanan | Perlu integrasi pengiriman |
| A16 | Retur/refund | Tidak ada alur otomatis; ditangani manual via pesan masuk | Perlu modul retur |
| A17 | Batas waktu bayar QRIS | 15 menit, order `expire` otomatis lewat webhook/cek status | — |
| A18 | Data pelanggan lama | Tidak ada migrasi data; mulai dari nol | — |

### 14.1 Ambiguitas yang ditemukan operator
1. `/produk/{id}` pada permintaan pemilik — PRD memakai **slug** (`/produk/{slug}`) karena lebih baik untuk SEO; route tetap menerima numeric ID sebagai fallback.
2. "Pembelian eceran dan grosir" bisa berarti dua alur terpisah atau satu alur dengan harga bertingkat — PRD memilih **satu alur, harga bertingkat** (A3).
3. "penilaian setelah checkout" — PRD menaruhnya di halaman sukses **dan** bisa diakses ulang dari detail pesanan pembeli.
4. Header/footer yang dapat diedit admin: PRD membatasi pada **menu, teks, tautan, sosial, logo** (bukan editor HTML bebas) demi keamanan.
5. Belum jelas apakah pembeli non-login boleh checkout — PRD mewajibkan login saat checkout, keranjang tetap boleh guest.

---

## 15. Definition of Done Global

Sebuah pekerjaan dianggap selesai bila seluruh poin berikut benar:

1. `php artisan migrate:fresh --seed` berjalan tanpa error dari database kosong.
2. `npm run build` sukses tanpa error, tanpa warning kritis.
3. Semua rute di §5 ada dan dapat diakses (`php artisan route:list` memuat seluruh nama route).
4. Tidak ada `.env` yang diubah/di-commit; `.env.example` lengkap.
5. Tidak ada folder skill/MCP di dalam project.
6. UI publik responsif pada 360px, 768px, 1280px tanpa horizontal scroll.
7. Alur utama bisa dilalui ujung ke ujung: landing → produk → detail → keranjang → checkout → QRIS (fake/sandbox) → sukses → ulasan bintang.
8. Admin bisa login, menambah produk, menambah stok, melihat pesanan, membalas pesan & ulasan, mengubah pengaturan.
9. Test hijau: `php artisan test`.
10. Tidak ada `console.log`, `dd()`, `var_dump()`, atau teks Lorem ipsum tertinggal.

---

## 16. Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Kredensial Midtrans belum tersedia | Checkout tidak bisa diuji nyata | Mode `MIDTRANS_FAKE`, service terisolasi |
| Design hasil REA tidak lengkap (situs sumber berubah/dinamis) | Slicing meleset | Tangkap screenshot + token saat REA, simpan di `docs/design.md` |
| Dua guard auth salah konfigurasi | Admin/pembeli bisa saling masuk | Test feature khusus per guard di K15 |
| Stok berkurang ganda saat webhook diulang | Data stok/omzet rusak | Idempotensi berbasis `transaction_id` + `payments.status` |
| Seeder berat | Setup lambat | Batasi jumlah produk contoh (≤ 24), gambar placeholder kecil |
| Scope melebar (kupon, kurir, multi-bahasa) | Tidak selesai | Semua di luar §5 dianggap backlog, bukan blocker |

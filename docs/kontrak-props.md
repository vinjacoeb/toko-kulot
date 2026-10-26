# Kontrak Props Halaman (Inertia) — Toko Kulot

Status berkas: **DRAFT** (ditulis pada K5). Bagian yang sudah dipakai frontend tidak boleh
diubah diam-diam; perubahan wajib lewat komentar di kartu frontend terkait.

Sumber: `docs/PRD.md` §5 (rute), §6 (kolom), §7 (alur). Seeder yang mengisi bentuk di bawah:
`database/seeders/SettingSeeder.php`, `CarouselSeeder.php`, `FaqSeeder.php`.

---

## 1. Props bersama (`HandleInertiaRequests`)

| Key | Tipe | Isi |
|---|---|---|
| `settings` | object | map `key` → value dari tabel `settings`; nilai `type=json` sudah di-decode menjadi array/object |
| `flash` | object | `success` (string\|null), `error` (string\|null) |
| `auth.user` | object\|null | pembeli yang login (`id`, `name`, `email`) |

`settings` hanya memuat key publik. `midtrans_client_key` dan `midtrans_is_production` **hanya catatan
admin** — jalur bayar membacanya dari `.env` (`MIDTRANS_*`), dan `MIDTRANS_SERVER_KEY` tidak pernah masuk
`settings` (keputusan P3, `docs/pertanyaan-pemilik.md` §6 P10).

Catatan implementasi (t_a696f5c6): `settings` benar-benar dikirim
`HandleInertiaRequests::publicSettings()` — satu query `settings` per permintaan, nilai
`type=json` di-decode menjadi array/object, dan bila tabel belum dimigrasi hasilnya `{}`
sehingga halaman tetap tampil dengan nilai bawaan frontend.

Catatan implementasi (t_101b9145, 23 Okt 2026): `publicSettings()` memakai `SettingService::all()`
sehingga tipe `int`/`bool` juga sudah dikonversi, dan **selalu memuat** key `store_name`,
`store_logo`, `store_favicon`, `footer_copyright` (nilai `null` bila kosong/belum ada). Key
`midtrans_client_key` dan `midtrans_is_production` **tidak pernah** ikut props bersama — keduanya
hanya catatan admin di §10.7.


## 2. Bentuk JSON pada `settings`

### `header_nav` (type `json`)
```json
[
  { "label": "Beranda", "url": "/" },
  { "label": "Produk", "url": "/produk" },
  { "label": "Kontak Kami", "url": "/kontak-kami" }
]
```
Aturan: urutan array = urutan menu; `url` selalu path internal diawali `/`.

### `footer_links` (type `json`)
```json
[
  { "title": "Bantuan", "items": [ { "label": "FAQ", "url": "/#faq" } ] },
  { "title": "Produk",  "items": [ { "label": "Daster", "url": "/produk?kategori=daster" } ] }
]
```

### `footer_social` (type `json`)
```json
[
  { "platform": "instagram", "label": "Instagram", "url": "https://instagram.com/contoh" },
  { "platform": "whatsapp",  "label": "WhatsApp",  "url": "https://wa.me/6281200000001" }
]
```
`platform` ∈ `instagram` | `facebook` | `tiktok` | `whatsapp` | `shopee`.

### `landing_hero` (type `json`)
```json
{
  "title": "Daster & Kulot Nyaman untuk Harian",
  "subtitle": "Bahan rayon adem, jahitan rapi, harga grosir tersedia.",
  "cta_label": "Lihat Koleksi",
  "cta_url": "/produk",
  "image": "/images/seed/landing/hero.png"
}
```

### `landing_sections` (type `json`)
```json
{
  "announcement": { "text": "Gratis ongkir min. belanja Rp300.000", "url": "/produk", "is_active": true },
  "trust_strip": [
    { "icon": "truck", "title": "Kirim dari Pekalongan", "subtitle": "Dikemas hari yang sama" }
  ],
  "featured": { "title": "Produk Unggulan", "subtitle": "Paling sering dipesan", "limit": 8 },
  "promo": {
    "title": "Harga Grosir Mulai 4 Pcs",
    "subtitle": "Cocok untuk reseller dan toko kelontong.",
    "cta_label": "Belanja Grosir",
    "cta_url": "/produk",
    "image": "/images/seed/landing/promo-grosir.png",
    "is_active": true
  },
  "why_us": {
    "title": "Kenapa Beli di Toko Kulot",
    "items": [ { "title": "Bahan Adem", "body": "Rayon premium, tidak panas." } ]
  },
  "newsletter": { "title": "Dapat Info Diskon", "subtitle": "Gratis ongkir untuk belanja min. Rp300.000 — khusus pengiriman reguler.", "button_text": "Hubungi Kami" }
}
```
`icon` ∈ `truck` | `refresh` | `qris` | `chat` | `leaf` | `scissors`.

`landing_sections.newsletter` adalah **CTA akhir** halaman `/`; `subtitle` berisi copy CTA
(bawaan seeder memuat "Rp300.000" dan "reguler") dan `button_text` label tombolnya.
Dapat diubah dari tab Landing.

### `landing_gallery` (type `json`, addendum v1.1 §6 — D6)

Array maksimum 8 item, urut sesuai tampilan. Kosong (`[]` atau `null`) = seksi galeri disembunyikan.

```json
[
  {
    "image": "/images/seed/landing/galeri-1.png",
    "caption": "[CONTOH] Detail jahitan rapi",
    "alt": "Jahitan rapi pada daster rayon"
  }
]
```

| Field | Aturan |
|---|---|
| `image` | wajib; unggahan gambar (jpg/jpeg/png/webp ≤ 2 MB) atau path yang sudah ada (`/storage/landing/...` / `/images/seed/...`) |
| `caption` | boleh kosong, teks maks 80 |
| `alt` | boleh kosong, teks maks 120 |

Berkas unggahan disimpan di disk `public` folder `landing` (`storage/app/public/landing`) dan
dikirim sebagai `/storage/landing/<nama>`; berkas dihapus dari disk saat item dihapus/diganti.
Butuh `php artisan storage:link` di server (lihat `docs/langkah-pemilik-v1.1.md`).

## 3. Jalur gambar (`image`, `path`, `store_logo`)

Kolom gambar menyimpan **URL path absolut** yang diawali `/`, sehingga frontend memakai
nilainya apa adanya (`<img src={product.image} />`) tanpa menambah prefix:

| Asal | Bentuk nilai | Contoh |
|---|---|---|
| Data seed | `/images/seed/...` (berkas statis di `public/`) | `/images/seed/produk/daster-batik-pekalongan-1.png` |
| Unggahan admin | `/storage/...` (disk `public`, symlink `public/storage`) | `/storage/products/2026/10/abc123.jpg` |

Gambar seed dibuat oleh seeder (GD → PNG) di `public/images/seed/`: `produk/`, `kategori/`,
`carousel/`, `landing/`, dan `logo.png`. Ukuran: produk 800×800, kategori 600×800,
carousel/hero/promo 1600×900, logo 240×64.

## 4. Key `settings` minimum (PRD §6)

| Key | group | type | Nilai seed |
|---|---|---|---|
| `store_name` | umum | text | `Toko Kulot` |
| `store_logo` | umum | image | `/images/seed/logo.png` |
| `store_favicon` | umum | image | `/images/seed/favicon.png` |
| `store_tagline` | umum | text | `Daster & kulot nyaman untuk harian` |
| `header_nav` | header | json | lihat §2 |
| `footer_about` | footer | textarea | ringkasan toko |
| `footer_copyright` | footer | text | kosong = frontend memakai `© {tahun} {nama_toko}` |
| `footer_links` | footer | json | lihat §2 |
| `footer_social` | footer | json | lihat §2 |
| `contact_email` | kontak | text | `halo@tokokulot.test` |
| `contact_phone` | kontak | text | `0812-0000-0001` |
| `contact_whatsapp` | kontak | text | `6281200000001` |
| `contact_address` | kontak | textarea | alamat contoh |
| `contact_map_embed` | kontak | textarea | URL embed peta |
| `landing_hero` | landing | json | lihat §2 |
| `landing_sections` | landing | json | lihat §2 |
| `landing_gallery` | landing | json | lihat §2 (maks 8 gambar) |
| `seo_default_title` | seo | text | judul default |
| `seo_default_description` | seo | textarea | deskripsi default |
| `shipping_cost_default` | pembayaran | text | `20000` (integer rupiah sebagai string) |
| `midtrans_client_key` | pembayaran | text | kosong (diisi pemilik) |
| `midtrans_is_production` | pembayaran | text | `0` |

`shipping_cost_default` dan `midtrans_is_production` disimpan sebagai string di tabel
(`value` bertipe text); server meng-cast ke `int`/`bool` saat memakai.

`store_favicon` dan `footer_copyright` adalah **tambahan** di luar daftar minimum PRD §6
(kartu `t_101b9145`, 23 Okt 2026): favicon dibutuhkan agar tab browser mengikuti identitas toko,
dan copyright footer dibutuhkan agar teks footer bisa diubah pemilik. Keduanya mengikuti mekanisme
`settings` yang sama (grup `umum`/`footer`, dapat diubah lewat `/admin/pengaturan`).


## 5. Status

| Bagian | Status | Dipakai oleh |
|---|---|---|
| §1 props bersama | DRAFT | K7, K10 |
| §2 bentuk JSON settings | DRAFT | K7, K10, K9 |
| §3 jalur gambar | DRAFT | K7, K10, K11, K14 |
| §4 daftar key | DRAFT | K9, K14 |

---

## 6. Halaman autentikasi (K6)

Ditulis kartu K6. Bagian ini melengkapi §1–§5 (milik K5) dan tidak mengubahnya.
Semua halaman = `Inertia::render`, tanpa respons JSON. Props bersama (§1) berlaku otomatis.
Sukses aksi tulis = redirect + `flash.success`; gagal = kembali ke form + props `errors`
(key = nama field, isian form tidak hilang). Teks pesan di bawah adalah teks final (bahasa Indonesia).

### 6.1 `GET /register` — name `register`

Akses: guest guard `web` (sudah login → redirect `home`). Komponen: `Public/Auth/Register`.
Props: tidak ada props khusus. Field: `name`, `email`, `phone`, `password`,
`password_confirmation`, `terms` (checkbox).

### 6.2 `POST /register` — name `register.store`

Sukses: `redirect()->route('home')`, `flash.success` = `"Akun berhasil dibuat. Selamat berbelanja!"`,
pembeli langsung login (guard `web`). `email_verified_at` diisi saat dibuat (PRD §14 A4).

| Field | Aturan | Pesan galat |
|---|---|---|
| `name` | wajib, 2–100 | `Nama wajib diisi.` / `Nama minimal 2 karakter.` / `Nama maksimal 100 karakter.` |
| `email` | wajib, format email, maks 255, unik `users.email` | `Email wajib diisi.` / `Format email tidak valid.` / `Email sudah terdaftar.` |
| `phone` | wajib, 8–30, hanya angka `+ - spasi ( )` | `Nomor WhatsApp wajib diisi.` / `Format nomor WhatsApp tidak valid.` |
| `password` | wajib, min 8, `confirmed` | `Kata sandi wajib diisi.` / `Kata sandi minimal 8 karakter.` / `Konfirmasi kata sandi tidak cocok.` |
| `address` | wajib, teks 10–500, di-trim | `Alamat lengkap wajib diisi.` / `Alamat terlalu singkat. Tulis jalan, nomor, RT/RW.` / `Alamat maksimal 500 karakter.` |
| `city` | wajib, teks, maks 100, di-trim | `Kota wajib diisi.` / `Kota maksimal 100 karakter.` |
| `postal_code` | wajib, 5 angka (`digits:5`), di-trim | `Kode pos wajib diisi.` / `Kode pos harus 5 angka.` |
| `terms` | wajib `accepted` | `Anda harus menyetujui syarat dan ketentuan.` |

### 6.3 `GET /login` — name `login`

Akses: guest guard `web`. Komponen: `Public/Auth/Login`. Props: `{ "status": null }`
(`string|null`, pesan netral dari sesi). Field: `email`, `password`, `remember`.

### 6.4 `POST /login` — name `login.store`

Akses: guest guard `web`. Rate limit **5/menit** per `email`+IP (limiter `login`);
melebihi batas → **HTTP 429** + header `Retry-After` (detik), tanpa props tambahan.
Sukses: `redirect()->intended(route('home'))`, `flash.success` = `"Berhasil masuk. Selamat berbelanja!"`.

| Field | Aturan | Pesan galat |
|---|---|---|
| `email` | wajib, format email | `Email wajib diisi.` / `Format email tidak valid.` |
| `password` | wajib | `Kata sandi wajib diisi.` |
| `remember` | opsional boolean | — |

Kredensial salah **atau** email terdaftar di `admins.email` → `errors.email` =
`Email atau kata sandi salah.` (akun admin tidak boleh masuk lewat `/login`, PRD §3).

### 6.5 `GET /forgot-password` — name `password.request`

Akses: guest guard `web`. Komponen: `Public/Auth/ForgotPassword`. Props: `{ "status": null }`.
Field: `email`. Tombol: `"Kirim Tautan Reset"`.

### 6.6 `POST /forgot-password` — name `password.email`

Rate limit limiter `password-email` = 3/menit per IP. Validasi `email` wajib + format
(`Email wajib diisi.` / `Format email tidak valid.`).
Respons **selalu netral**: `back()` + `flash.success` = `"Jika email terdaftar, tautan reset sudah dikirim."`
(termasuk bila email tidak terdaftar). Throttle kirim ulang → `errors.email` =
`Tunggu 1 menit sebelum meminta tautan baru.`

### 6.7 `GET /reset-password/{token}` — name `password.reset`

Akses: guest guard `web`. Komponen: `Public/Auth/ResetPassword`.
Props: `{ "token": "…", "email": "pembeli@contoh.test" }` (`email` dari query `?email=`, boleh `""`).
Field: `email` (readonly), `password`, `password_confirmation`, `token` (hidden).

### 6.8 `POST /reset-password` — name `password.update`

| Field | Aturan | Pesan galat |
|---|---|---|
| `token` | wajib | `Token reset tidak valid.` |
| `email` | wajib, format email | `Email wajib diisi.` / `Format email tidak valid.` |
| `password` | wajib, min 8, `confirmed` | `Kata sandi minimal 8 karakter.` / `Konfirmasi kata sandi tidak cocok.` |

Token salah/kedaluwarsa → `errors.email` = `Tautan reset tidak valid atau sudah kedaluwarsa.`
Email tidak terdaftar → `errors.email` = `Email tidak terdaftar.`
Sukses: `redirect()->route('login')`, `flash.success` = `"Kata sandi berhasil diperbarui. Silakan masuk."`

### 6.9 `POST /logout` — name `logout`

Akses: `auth:web`. Sukses: `redirect()->route('home')`, `flash.success` = `"Anda sudah keluar."`
Sesi pembeli dihapus; sesi admin pada peramban yang sama **tidak** ikut dihapus.

### 6.10 `GET /admin/login` — name `admin.login`

Akses: guest guard `admin` (sudah login admin → redirect `admin.dashboard`).
Komponen: `Admin/Login`. Props: `{ "status": null }`. Field: `email`, `password`, `remember`.

### 6.11 `POST /admin/login` — name `admin.login.store`

Rate limit **5/menit** per `email`+IP (limiter `admin-login`); lebih → **HTTP 429** + `Retry-After`.

| Kondisi | Pesan (`errors.email`) |
|---|---|
| kredensial salah | `Email atau kata sandi salah.` |
| akun `is_active = false` | `Akun ini dinonaktifkan. Hubungi owner toko.` |

Sukses: `redirect()->intended(route('admin.dashboard'))`, `flash.success` = `"Selamat datang di panel admin."`

### 6.12 `POST /admin/logout` — name `admin.logout`

Akses: `auth:admin`. Sukses: `redirect()->route('admin.login')`, `flash.success` =
`"Anda sudah keluar dari panel admin."` Sesi pembeli tidak ikut dihapus.

### 6.13 `GET /admin` — name `admin.dashboard`

Akses: middleware `admin` (guard `admin`, akun aktif). Komponen: `Admin/Dashboard`.

Seluruh angka dihitung ulang dari DB pada setiap request (**tanpa cache**); tidak ada nilai
yang disimpan di sesi atau tabel `cache`.

```json
{
  "stats": { "orders_total": 13, "orders_pending": 7, "revenue_total": 884000, "products_active": 12 },
  "sales_14d": [
    { "date": "2026-10-09", "total": 0 },
    { "date": "2026-10-10", "total": 0 }
  ],
  "low_stock": [
    { "id": 28, "product_name": "Kulot Karet Pinggang Motif Garis", "size": "M", "color": "Hitam", "stock": 3 }
  ],
  "recent_orders": [
    { "id": 16, "code": "TK-20261022-0004", "customer_name": "Budi", "total": 500, "status": "pending", "created_at": "2026-10-22T08:33:20+07:00" }
  ],
  "recent_reviews": [
    { "id": 2, "user_name": "Budi", "product_name": "Kulot Plisket Premium", "rating": 4, "comment": "Nyaman dipakai.", "created_at": "2026-10-16T08:00:00+07:00" }
  ],
  "updated_at": "2026-10-22T08:47:44+07:00"
}
```

Aturan isi:

- `stats.orders_total` = jumlah **semua** order (termasuk `batal`).
- `stats.orders_pending` = jumlah order berstatus `pending`.
- `stats.revenue_total` = jumlah `orders.total` berstatus `dibayar`, `diproses`, `dikirim`,
  `selesai` (integer rupiah). `pending` dan `batal` tidak dihitung. Daftar status tunggal:
  `App\Models\Order::REVENUE_STATUSES`.
- `stats.products_active` = jumlah `products.is_active = true`.
- `sales_14d` = tepat **14** entri, urut lama → baru, berakhir hari ini (zona `Asia/Jakarta`).
  `date` = tanggal `orders.created_at` (`YYYY-MM-DD`), `total` = jumlah `orders.total` order
  berstatus omzet pada tanggal itu. Tanggal tanpa order tetap dikirim dengan `total: 0`.
- `low_stock` = maksimal **5** baris, urut `stock` menaik. Hanya varian `is_active = true` dari
  produk `is_active = true` dengan `stock < 5` (termasuk `0`). `size`/`color` boleh `null`.
- `recent_orders` = maksimal **5** order terbaru (`created_at` desc, lalu `id` desc), semua status
  (termasuk `batal`). `total` integer rupiah.
- `recent_reviews` = maksimal **5** ulasan terbaru (`created_at` desc, lalu `id` desc), termasuk
  ulasan tersembunyi (`is_visible = false`) karena panel admin perlu memoderasinya.
  `user_name` = `null` bila akun pembeli sudah dihapus; `comment` boleh `null`.
- `updated_at` = waktu agregasi dihitung (ISO 8601 `Asia/Jakarta`), dipakai label "Diperbarui …".
- `loading` (bool, bawaan `false`) dan `error` (string|null, bawaan `null`) adalah **state klien**,
  bukan props server; halaman memakai nilai bawaannya saat sukses.
- Semua uang dan jumlah dikirim sebagai integer, tanggal ISO 8601; tidak ada angka terformat.

Status: **LOCKED** (dipakai `resources/js/Pages/Admin/Dashboard.jsx` sejak K13).

### 6.14 Aturan pemisahan tier (untuk frontend)

- Pembeli yang membuka `/admin*` → redirect `admin.login` (middleware `EnsureAdmin`).
- Admin tidak punya sesi pembeli; membuka `/login` tetap menampilkan form pembeli.
- Kedua sesi hidup berdampingan (guard berbeda = kunci sesi berbeda).

### 6.15 Status

| Bagian | Status | Dipakai oleh |
|---|---|---|
| §6.1–§6.9 (auth pembeli) | DRAFT | K12, K13 |
| §6.10–§6.12 (auth admin) | DRAFT | K13 |
| §6.13 (dashboard admin) | LOCKED | K13, t_1ef89050 |

---

## 7. Keranjang & checkout (PRD §5.1 langkah 2–7)

Bahasa key: Indonesia snake_case. Semua uang = **integer rupiah**, tanggal **ISO 8601**
(`2026-10-20T14:05:00+07:00`), nilai kosong `null`.

Catatan: prop global `cart` (`{ "count": n }`, lihat §1) sudah dipakai bersama. Karena itu
ringkasan keranjang di props halaman memakai key **`keranjang`**, bukan `cart`.

### 7.0 Bentuk `keranjang` (dipakai §7.1 dan §7.3)

```json
{
  "items": [
    {
      "id": 12,
      "product_id": 3,
      "variant_id": 7,
      "name": "Daster Batik Pekalongan",
      "slug": "daster-batik-pekalongan",
      "variant_label": "Ukuran L / Merah",
      "qty": 4,
      "unit_price": 85000,
      "line_total": 340000,
      "stock": 12,
      "image": "/images/seed/produk/daster-batik-pekalongan-1.png",
      "is_active": true
    }
  ],
  "count": 4,
  "subtotal": 340000,
  "shipping_cost": null,
  "total": 340000,
  "is_empty": false,
  "shipping": {
    "mode": "api",
    "dihitung_saat_checkout": true,
    "tarif_uji": null,
    "gratis_aktif": true,
    "gratis_min": 300000,
    "berat_gram": 2000
  }
}
```

- `unit_price` = `products.base_price` (atau `wholesale_price` bila `qty >= min_wholesale_qty`)
  **+ `product_variants.price_delta`**; dihitung ulang setiap qty berubah.
- `variant_label` = gabungan nilai `variant_attributes` (mis. `"Ukuran L / Merah"`), `null` bila tanpa varian.
- `image` = gambar utama (`product_images.is_primary`), bentuk path absolut (§3), `null` bila tidak ada.
- `stock` = stok varian saat ini (0 bila tanpa varian).
- `is_active` = `products.is_active` dan `product_variants.is_active`.
- `shipping.mode` = `"api"` bila `BITESHIP_API_KEY` terisi, `"fake"` bila kosong (§7.12).
- `shipping_cost`: angka `settings.shipping_cost_default` saat `mode = "fake"`; **`null`** saat `mode = "api"`,
  karena ongkir baru diketahui setelah kode pos diisi (§7.12). `total` = `subtotal` + (`shipping_cost` ?? 0).
- `shipping.dihitung_saat_checkout` = `true` saat `shipping_cost` `null`; frontend menampilkan
  `Dihitung saat checkout` pada baris Ongkir, bukan `Rp0`.
- `shipping.gratis_aktif`/`gratis_min` = `settings.free_shipping_enabled`/`free_shipping_min`.
- `shipping.berat_gram` = Σ `max(1, products.weight_gram) × qty`, fallback 300 g/unit bila berat 0
  (PRD-v1.4 §2.2), dipakai juga oleh §7.12.

### 7.1 `GET /keranjang` — name `cart.index`

Akses: publik (guest memakai keranjang berbasis sesi). Komponen: `Public/Cart`.

```json
{ "keranjang": { "...": "bentuk §7.0" } }
```

### 7.2 `POST /keranjang` — name `cart.store`

Akses: publik. Rate limit **30/menit** per IP (HTTP 429 bila lewat). Field:

| Field | Aturan | Pesan galat (`errors.<field>`) |
|---|---|---|
| `product_id` | wajib, integer, produk ada & `is_active = true` | `Produk tidak tersedia.` |
| `variant_id` | wajib bila produk punya varian aktif; harus milik produk itu | `Pilih ukuran/warna yang tersedia.` |
| `qty` | wajib, integer, min 1, maks 99 | `Jumlah minimal 1.` / `Jumlah maksimal 99 pcs.` |

- Item dengan `product_id`+`variant_id` sama **digabung** qty-nya (bukan baris baru).
- qty melebihi stok → `errors.qty` = `Stok tersisa {n}.`
- Sukses: `redirect()->route('cart.index')`, `flash.success` = `"Produk ditambahkan ke keranjang."`

### 7.3 `PATCH /keranjang/{item}` — name `cart.update`

Akses: pemilik keranjang; item milik keranjang lain → **HTTP 404**. Field `qty` (wajib, integer, min 1).

| Kondisi | Hasil |
|---|---|
| qty > stok, stok > 0 | qty disetel ke stok, `flash.error` = `Stok tersisa {n}, jumlah disesuaikan.` |
| stok = 0 | item dihapus, `flash.error` = `Stok habis, produk dihapus dari keranjang.` |
| sukses | `redirect()->route('cart.index')`, `flash.success` = `Jumlah diperbarui.` |

### 7.4 `DELETE /keranjang/{item}` — name `cart.destroy`

Akses: pemilik keranjang (lain → 404). Sukses: `redirect()->route('cart.index')`,
`flash.success` = `Produk dihapus dari keranjang.`

### 7.5 `GET /checkout` — name `checkout.index`

Akses: `auth:web` (guest → redirect `login` + `intended`). Keranjang kosong → redirect
`cart.index` + `flash.error` = `Keranjang masih kosong.` Komponen: `Public/Checkout`.

```json
{
  "keranjang": { "...": "bentuk §7.0" },
  "pengiriman": {
    "mode": "api",
    "key_terisi": true,
    "tarif_uji": null,
    "berat_gram": 2000,
    "gratis": { "aktif": true, "min": 300000, "subtotal": 340000, "terpenuhi": true },
    "asal": { "nama": "Toko Kulot", "kode_pos": "51111" },
    "galat": null
  },
  "prefill": {
    "customer_name": "Siti Aminah",
    "customer_phone": "081234567890",
    "customer_email": "siti@example.com",
    "customer_address": "Jl. Melati 12",
    "customer_city": "Pekalongan",
    "customer_postal_code": "51111",
    "note": null
  },
  "pembayaran": {
    "expiry_minutes": 5,
    "expiry_va_minutes": 60,
    "kanal": [
      { "id": "qris", "label": "QRIS (GoPay, OVO, DANA, m-banking)", "grup": "qris" },
      { "id": "bca_va", "label": "Transfer BCA Virtual Account", "grup": "va" }
    ]
  },
  "midtrans": {
    "client_key": null, "is_production": false, "fake": true,
    "mode": "uji", "alasan_kode": "fake_aktif",
    "alasan": "MODE UJI aktif karena MIDTRANS_FAKE=true di .env: pembayaran disimulasikan lokal (tanpa Midtrans).",
    "langkah_perbaikan": [
      "Ubah MIDTRANS_FAKE=false pada berkas .env.",
      "Isi MIDTRANS_CLIENT_KEY dan MIDTRANS_SERVER_KEY dari dashboard Midtrans.",
      "Jalankan php artisan config:clear, lalu muat ulang halaman pembayaran."
    ],
    "server_key_terisi": false,
    "sumber_kredensial": ".env (MIDTRANS_*)",
    "catatan": "Kredensial efektif dibaca dari .env (MIDTRANS_*); kolom Midtrans pada tab Pembayaran admin belum dipakai jalur pembayaran ini."
  }
}
```

`prefill` diisi dari akun pembeli: `customer_name` = `users.name`, `customer_email` = `users.email`,
`customer_phone` = `users.phone`, `customer_address` = `users.address`, `customer_city` = `users.city`,
`customer_postal_code` = `users.postal_code`, `note` selalu `null`. Kolom profil yang kosong (user
lama yang mendaftar sebelum v1.2) dikirim `null` dan diisi pembeli di form.

`pengiriman` menjelaskan ongkir sebelum pembeli menekan **Cek Ongkir** (§7.12):

| Key | Isi |
|---|---|
| `mode` | `"api"` (Biteship aktif) / `"fake"` (tarif uji `shipping_cost_default`) |
| `key_terisi` | boolean `BITESHIP_API_KEY` terisi; nilainya tidak pernah dikirim |
| `tarif_uji` | integer tarif uji, `null` saat `mode = "api"` |
| `berat_gram` | berat total keranjang (A19) |
| `gratis` | `{aktif, min, subtotal, terpenuhi}` dari `settings.free_shipping_*` |
| `asal` | `{nama, kode_pos}` dari `settings.shipping_origin_*` (untuk teks "dikirim dari") |
| `galat` | kalimat galat konfigurasi (mis. kode pos asal kosong), `null` bila siap |

`pembayaran.expiry_minutes` = masa berlaku tagihan **QRIS** dari `config/midtrans.php`
(`MIDTRANS_EXPIRY_MINUTES`, bawaan **5 menit** — keputusan pemilik 21 Okt 2026, kartu `t_e35050e8`).
`pembayaran.expiry_va_minutes` = masa berlaku kanal VA / Mandiri Bill / gerai
(`MIDTRANS_EXPIRY_VA_MINUTES`, bawaan **60 menit**). Berlaku saat charge (§7.7a): QRIS 5 menit,
kanal lain 60 menit. `pembayaran.kanal[]` = 8 kanal PRD-v1.2 §2.2 (`id`, `label`, `grup` ∈
`qris`/`va`/`bill`/`gerai`), urutan tetap seperti tabel PRD; halaman checkout tidak memilih kanal,
hanya halaman bayar (§7.7) yang memakainya.

Bentuk `midtrans` (baku, juga dipakai §7.7 dan §10.7) menjelaskan **mode efektif** pembayaran, supaya
UI bisa memberi tahu kenapa pembayaran belum bisa dilakukan:

| Key | Isi |
|---|---|
| `client_key` | `MIDTRANS_CLIENT_KEY` dari `.env`, `null` bila mode uji atau kosong |
| `is_production` | `MIDTRANS_IS_PRODUCTION` dari `.env` (boolean) |
| `fake` | `true` = server memakai tagihan lokal (mode uji), bukan Midtrans |
| `mode` | `"uji"` bila `fake` `true`, `"asli"` bila `false` |
| `alasan_kode` | `"fake_aktif"` (`.env MIDTRANS_FAKE=true`) / `"server_key_kosong"` (`MIDTRANS_SERVER_KEY` kosong) / `null` saat mode `asli` |
| `alasan` | satu kalimat siap tampil berisi alasan, `null` saat mode `asli` |
| `langkah_perbaikan` | daftar langkah untuk pemilik (array of string), `[]` saat mode `asli` |
| `server_key_terisi` | boolean, apakah `MIDTRANS_SERVER_KEY` terisi (nilainya tidak pernah dikirim) |
| `sumber_kredensial` | `".env (MIDTRANS_*)"` — tempat kredensial dibaca (bukan `settings`) |
| `catatan` | satu kalimat tetap: jalur pembayaran membaca `.env`, kolom `settings.midtrans_*` (tab Pembayaran admin) belum dipakai |

### 7.6 `POST /checkout` — name `checkout.store`

Akses: `auth:web`. Rate limit **10/menit** per pembeli.

| Field | Aturan | Pesan galat |
|---|---|---|
| `customer_name` | wajib, string, maks 100 | `Nama penerima wajib diisi.` |
| `customer_phone` | wajib, regex `^(\+62|62|0)8[0-9]{7,12}$` | `Nomor WhatsApp tidak valid.` |
| `customer_email` | wajib, email, maks 150 | `Email tidak valid.` |
| `customer_address` | wajib, string, maks 500 | `Alamat lengkap wajib diisi.` |
| `customer_city` | wajib, string, maks 100 | `Kota/kecamatan wajib diisi.` |
| `customer_postal_code` | wajib, digits 5 | `Kode pos harus 5 angka.` |
| `shipping_courier` | opsional, string, maks 40 — **wajib** saat `pengiriman.mode = "api"` (ditegakkan service) | `Pilih kurir pengiriman.` |
| `shipping_service` | opsional, string, maks 60 — **wajib** saat `mode = "api"` | `Pilih layanan pengiriman.` |
| `shipping_cost` | opsional, integer, min 0 — hanya untuk mendeteksi tarif berubah; server tetap memakai tarifnya sendiri | `Ongkir berubah, pilih ulang kurir.` |
| `note` | opsional, string, maks 500 | `Catatan maksimal 500 karakter.` |

Sukses: order `status = pending`, `payment_status = pending`, `payment_method = midtrans`,
`orders.code` = `TK-YYYYMMDD-NNNN` (urut per hari), stok terpotong + `stock_movements` tipe `sale`,
baris `payments` pending dibuat (`provider = midtrans`, `status = pending`, `gross_amount`, kanal
masih kosong — `order_id_midtrans`/`payment_type`/`expires_at` `null` sampai pembeli memilih kanal di
§7.7a; **tidak ada panggilan Midtrans saat checkout**), keranjang dikosongkan, lalu
`redirect()->route('checkout.pay', $order)` + `flash.success` = `Pesanan dibuat. Selesaikan pembayaran.`

Gagal (stok berubah) → **tidak ada order setengah jadi** (transaksi di-rollback):
`redirect()->back()` + `flash.error` = `Stok {nama varian} tersisa {n}. Perbarui keranjang.`
Galat pembuatan tagihan tidak lagi muncul di sini karena Midtrans baru dipanggil saat kanal dipilih
(§7.7a).

### 7.7 `GET /checkout/{order}/bayar` — name `checkout.pay`

Akses: pemilik order; order pembeli lain → **HTTP 404**. Komponen: `Public/CheckoutPay`.

```json
{
  "pesanan": {
    "id": 21, "code": "TK-20261020-0001", "status": "pending",
    "payment_status": "pending", "subtotal": 340000, "shipping_cost": 20000,
    "discount": 0, "total": 360000,
    "customer_name": "Siti Aminah", "customer_phone": "081234567890",
    "customer_email": "siti@example.com",
    "customer_address": "Jl. Melati 12", "customer_city": "Pekalongan",
    "customer_postal_code": "51111", "note": null,
    "created_at": "2026-10-20T14:05:00+07:00", "paid_at": null,
    "items": [
      { "id": 31, "product_id": 3, "variant_id": 7, "name": "Daster Batik Pekalongan",
        "variant_label": "Ukuran L / Merah", "qty": 4, "unit_price": 85000,
        "line_total": 340000, "image": "/images/seed/produk/daster-batik-pekalongan-1.png" }
    ]
  },
  "pembayaran": {
    "status": "pending",
    "gross_amount": 360000,
    "metode": { "id": "bca_va", "label": "Transfer BCA Virtual Account", "grup": "va" },
    "instruksi": {
      "jenis": "va", "nomor_va": "8808123456789012", "bank": "BCA",
      "biller_code": null, "bill_key": null, "payment_code": null, "store": null,
      "qr_url": null, "qr_string": null
    },
    "kanal": [
      { "id": "qris", "label": "QRIS (GoPay, OVO, DANA, m-banking)", "grup": "qris" },
      { "id": "bca_va", "label": "Transfer BCA Virtual Account", "grup": "va" },
      { "id": "bni_va", "label": "Transfer BNI Virtual Account", "grup": "va" },
      { "id": "bri_va", "label": "Transfer BRI Virtual Account", "grup": "va" },
      { "id": "permata_va", "label": "Transfer Permata Virtual Account", "grup": "va" },
      { "id": "mandiri_bill", "label": "Mandiri Bill Payment", "grup": "bill" },
      { "id": "alfamart", "label": "Bayar di Alfamart", "grup": "gerai" },
      { "id": "indomaret", "label": "Bayar di Indomaret", "grup": "gerai" }
    ],
    "expires_at": "2026-10-20T15:05:00+07:00",
    "paid_at": null,
    "fake": false,
    "galat": null
  },
  "midtrans": {
    "client_key": "SB-Mid-client-xxxx",
    "is_production": false,
    "fake": false,
    "mode": "asli",
    "alasan_kode": null,
    "alasan": null,
    "langkah_perbaikan": [],
    "server_key_terisi": true,
    "sumber_kredensial": ".env (MIDTRANS_*)",
    "catatan": "Kredensial efektif dibaca dari .env (MIDTRANS_*); kolom Midtrans pada tab Pembayaran admin belum dipakai jalur pembayaran ini."
  }
}
```

`pembayaran.status`: `pending` | `settlement` | `expire` | `deny` | `cancel`.
`pembayaran.metode` = kanal yang sedang dipakai (`{id,label,grup}`), `null` sebelum pembeli memilih
kanal (§7.7a). `pembayaran.instruksi` = data bayar hasil charge kanal itu, `null` sebelum memilih;
semua key selalu ada, yang tidak relevan bernilai `null`:

| Key | Isi |
|---|---|
| `jenis` | `qris` / `va` / `bill` / `gerai` |
| `nomor_va` | nomor virtual account (VA bank + Permata) |
| `bank` | `BCA`, `BNI`, `BRI`, `Permata`, `Mandiri`, atau `null` |
| `biller_code`, `bill_key` | Mandiri Bill Payment |
| `payment_code` | kode bayar Alfamart/Indomaret |
| `store` | `Alfamart` / `Indomaret` |
| `qr_url` | URL gambar QR dari Midtrans (`null` di mode uji) |
| `qr_string` | isi QR mentah (dipakai mode uji / render QR lokal) |

`pembayaran.fake` = tagihan yang sedang dipakai dibuat tanpa Midtrans (mode uji). `pembayaran.galat`
selalu `null`; galat aksi kanal dikirim sebagai `flash.error` (§7.7a). Bentuk `midtrans` sama dengan
§7.5 (baku).

Sebelum kanal dipilih: `status = pending`, `metode`/`instruksi`/`expires_at` `null`, dan halaman
menampilkan 8 kanal dari `pembayaran.kanal`. Halaman **tidak** membuat tagihan saat dirender; tagihan
baru dibuat oleh §7.7a. Bila baris `payments` tidak ada (data lama), server mengirim `flash.error` dan
mengalihkan ke `cart.index`.

### 7.7a `POST /checkout/{order}/bayar/metode` — name `checkout.method`

Akses: pemilik order; order pembeli lain → **HTTP 404**. Rate limit **10/menit** per pembeli.
Body: `metode` (wajib, salah satu `id` di `pembayaran.kanal`).

| Field | Aturan | Pesan galat |
|---|---|---|
| `metode` | wajib, string, harus id kanal §7.7 | `Pilih metode pembayaran dulu.` / `Kanal pembayaran tidak dikenal.` |

Perilaku:

1. Server membuat charge Midtrans **Core API** untuk kanal itu pada **baris `payments` yang sama**
   (satu tagihan per pesanan): QRIS (`qris`), VA (`bank_transfer` + bank), Mandiri Bill (`echannel`),
   gerai (`cstore`). `payments.payment_type` = id kanal, `order_id_midtrans` =
   `orders.code` untuk charge pertama lalu `orders.code-2`, `orders.code-3`, … saat ganti kanal.
2. Masa berlaku: QRIS `pembayaran.expiry_minutes` (5 menit), kanal lain
   `pembayaran.expiry_va_minutes` (60 menit) — disimpan di `payments.expires_at`.
3. Idempoten: kanal sama, tagihan belum kedaluwarsa, status masih `pending` → tidak ada charge baru;
   server langsung mengalihkan. Status bukan `pending` → tidak ada charge baru.
4. Ganti kanal saat masih `pending` → charge baru dengan `order_id_midtrans` berakhiran `-2`, `-3`, …;
   baris `payments` tidak diduplikasi.
5. Sukses → `redirect()->route('checkout.pay', $order)` (props §7.7 sudah memuat kanal baru).
6. Midtrans menolak dengan 402 `Payment channel is not activated` →
   `redirect()->route('checkout.pay', $order)` + `flash.error` =
   `Kanal ini belum aktif di Midtrans. Hubungi admin.`; baris `payments` tidak berubah (tidak ada
   `order_id_midtrans` baru yang menggantung).
7. Gagal lain (jaringan/5xx) → `redirect()->route('checkout.pay', $order)` + `flash.error` =
   `Gagal membuat pembayaran. Coba lagi.`
8. Mode uji (`midtrans.fake = true`) → tagihan dibuat lokal tanpa jaringan; `pembayaran.fake = true`,
   tombol simulasi §7.13 tampil.

Status: **LOCKED** ditulis 24 Okt 2026 (kartu `t_66e507a3`, PRD-v1.2 §2.2/§2.4) — dipakai FE halaman
bayar dan QA.

### 7.8 `GET /checkout/{order}/status` — name `checkout.status` (JSON)

Akses: pemilik order (lain → 404). Polling ringan untuk panel pembayaran (design §4.4).

```json
{ "status": "pending", "paid_at": null, "expires_at": "2026-10-20T14:20:00+07:00" }
```

`status` = status pembayaran. Bila masih `pending`, `order_id_midtrans` terisi, dan tagihan bukan mode
uji, server menanyakan status ke Midtrans sekali (best effort; gagal → tetap `pending`, tanpa 500).
Sebelum kanal dipilih (`order_id_midtrans` `null`) respons tetap `{status: "pending", paid_at: null,
expires_at: null}` tanpa memanggil Midtrans. Bentuk respons tidak berubah.

### 7.8a `GET /midtrans/selesai` — name `midtrans.selesai`

Akses: **publik** (di luar `auth`, tanpa CSRF) — URL kembali dari aplikasi/kanal Midtrans.
Query: `order_id` (opsional; `order_id_midtrans` yang dipakai saat charge).

1. `order_id` cocok dengan `payments.order_id_midtrans` → bila status masih `pending` dan tagihan bukan
   mode uji, server menyegarkan status sekali (best effort), lalu
   `redirect()->route('checkout.pay', $order)`. Guest → middleware `auth` mengalihkan ke `login`.
2. Tidak cocok/kosong → `redirect('/')` + `flash.error` = `Pembayaran tidak dikenal.`

Tidak menampilkan data pembeli; tidak mengubah status selain lewat sinkronisasi status Midtrans.

### 7.9 `GET /checkout/{order}/selesai` — name `checkout.success`

Akses: pemilik order (lain → 404). Belum `settlement` → redirect `checkout.pay` +
`flash.error` = `Pembayaran belum diterima.` Komponen: `Public/CheckoutSuccess`.

```json
{
  "pesanan": {
    "id": 21, "code": "TK-20261020-0001", "status": "dibayar", "payment_status": "settlement",
    "subtotal": 340000, "shipping_cost": 20000, "total": 360000,
    "customer_name": "Siti Aminah", "customer_phone": "081234567890",
    "customer_address": "Jl. Melati 12", "customer_city": "Pekalongan",
    "created_at": "2026-10-20T14:05:00+07:00", "paid_at": "2026-10-20T14:09:00+07:00",
    "timeline": {
      "created_at": "2026-10-20T14:05:00+07:00", "paid_at": "2026-10-20T14:09:00+07:00",
      "shipped_at": "2026-10-21T08:00:00+07:00", "completed_at": "2026-10-22T10:30:00+07:00"
    },
    "shipping": {
      "courier_code": "jne", "courier_name": "JNE", "service_name": "REG", "etd": "2-3 hari",
      "weight_gram": 2000, "shipping_cost": 20000, "tracking_number": "JX1234567890",
      "status": "delivered", "status_label": "Terkirim", "biteship_order_id": "BS-123",
      "updated_at": "2026-10-21T09:15:00+07:00",
      "driver": { "name": "Budi", "phone": "081234567891", "link": "https://track.contoh.id/BS-123" },
      "perlu_tindakan": false, "tindakan": null, "galat": null
    },
    "items": [
      { "product_id": 3, "name": "Daster Batik Pekalongan", "variant_label": "Ukuran L / Merah",
        "qty": 4, "unit_price": 85000, "line_total": 340000,
        "image": "/images/seed/produk/daster-batik-pekalongan-1.png" }
    ]
  },
  "ulasan": { "boleh": true, "sudah": [] }
}
```

`shipping` = bentuk pembeli (PRD-v1.3 §2.6): key sama §13, termasuk `updated_at`, `driver`,
`perlu_tindakan`, `tindakan`, dan (v1.4) `events` `[{status,label,at}]` terbaru→terlama maks 50
(`[]` bila kosong); **tanpa** `price_final`, `price_selisih`, `webhook_terakhir` (milik admin
§12.17), dan `galat` selalu `null` seperti §13.

Sejak v1.5 (aditif) `pesanan` juga memuat `timeline` `{created_at, paid_at, shipped_at, completed_at}`
— empat kunci selalu ada, nilai ISO 8601 atau `null`; `completed_at` dihitung
`BiteshipService::shippingCompletedAt()` (aturan sama §13, PRD-v1.4 §4.2). Key lama tidak berubah.

`ulasan.boleh` = **`true` hanya bila server akan menerima minimal satu kiriman ulasan sekarang** (§9.1):
order `payment_status = settlement`, `status` ∈ (`dibayar`, `diproses`, `dikirim`, `selesai`) — sama
dengan `ReviewService::isEligible` — **dan** masih ada minimal satu `product_id` unik pada
`pesanan.items` yang belum ada di `reviews` order itu. Jadi `boleh` tetap `true` pada pesanan
multi-produk yang baru sebagian diulas, dan `false` hanya bila syarat §9.1 tidak terpenuhi atau
semua produk sudah diulas. **Dibekukan 21 Okt 2026** (kartu `t_2b031326`, temuan F6
`docs/catatan-frontend.md`; sebelumnya hanya berbunyi "order sudah `settlement` dan pembeli belum
mengulas semua produk").
`ulasan.sudah` = daftar `product_id` yang sudah diulas (kosong bila belum ada).
Form ulasan (`POST /checkout/{order}/ulasan`) disediakan kartu **K9**.

### 7.10 `POST /midtrans/notification` — name `midtrans.notification`

Akses: publik, **di luar CSRF**, tanpa sesi. Body = payload Midtrans (JSON/form).

1. `signature_key` wajib sama dengan `sha512(order_id . status_code . gross_amount . server_key)`
   → beda/kosong: **HTTP 403** `{"message":"invalid signature"}`, tanpa perubahan data.
2. `order_id` tidak dikenal → **HTTP 200** `{"message":"ok"}` (diabaikan, idempoten).
3. `gross_amount` ≠ `payments.gross_amount` → **HTTP 422** `{"message":"amount mismatch"}`.
4. `transaction_status` → status pembayaran: `capture`/`settlement` → `settlement`,
   `pending` → `pending`, `expire` → `expire`, `deny` → `deny`, `cancel` → `cancel`.
5. `payment_type` **tidak** menimpa id kanal yang sudah dipilih (§7.7a): `payments.payment_type`
   tetap `qris`/`bca_va`/… Bila kolom masih kosong (data lama/Snap), `payment_type` payload
   (`bank_transfer`, `echannel`, `qris`, …) yang disimpan. Saat `settlement`,
   `orders.payment_method` diisi nilai itu; sebelum settlement nilainya `midtrans`.
6. `settlement`: `payments.paid_at` diisi, `orders.payment_status = settlement`,
   `orders.status` `pending` → `dibayar`.
7. `expire`/`deny`/`cancel`: `orders.payment_status` ikut, `orders.status` `pending` → `batal`,
   stok dikembalikan (`stock_movements` tipe `in`, catatan `Pengembalian stok — pembayaran {status} ({code})`).
8. Idempoten: notifikasi ulang dengan status yang sama tidak mengubah stok, `paid_at`, atau status.
9. Sukses: **HTTP 200** `{"message":"ok"}`.

### 7.11 Status

| Bagian | Status | Dipakai oleh |
|---|---|---|
| §7.0–§7.9 | **LOCKED** (K8, terverifikasi 21 test) | K13 |
| §7.10 | **LOCKED** (K8) | pemilik toko (URL webhook Midtrans) |
| §7.5, §7.7 — prop `midtrans` (mode efektif + alasan), `pembayaran.fake`; `pembayaran.galat` kini selalu `null` (galat kanal lewat `flash.error` §7.7a) | **LOCKED** diperbarui 21 Okt 2026 (kartu `t_9f4b6aee`, temuan F-2 `docs/review.md`), disesuaikan 24 Okt 2026 (`t_66e507a3`) | K13, F2 |
| §7.5 — **nilai** `pembayaran.expiry_minutes` 15 → **5 menit** (keputusan pemilik 21 Okt 2026, `MIDTRANS_EXPIRY_MINUTES`); nama key, bentuk respons, dan key lain tidak berubah | **LOCKED** diperbarui 21 Okt 2026 (kartu `t_e35050e8`, temuan F-3 `docs/review.md`) | K13, F2 |
| §7.9 — **definisi** `ulasan.boleh` (bukan bentuk respons): `true` hanya bila §9.1 menerima minimal satu kiriman ulasan — `settlement` + status boleh dinilai + masih ada produk belum diulas | **LOCKED** diperbarui 21 Okt 2026 (kartu `t_2b031326`, temuan F6 `docs/catatan-frontend.md`; keputusan `docs/keputusan-f6-ulasan-boleh.md`) | K12, K13, F6 |
| §7.0–§7.6 — ongkir Biteship: `shipping_cost` `null` + blok `shipping`, prop `pengiriman`, field `shipping_*` di §7.6, §7.12 rute baru | **DRAFT** (24 Okt 2026, kartu `t_f22c8d46`, PRD v1.1 D2/D3) | FE checkout `t_aea95532`, QA |
| §7.9 — blok **baru** `pesanan.shipping` bentuk pembeli (`updated_at`, `driver`, `perlu_tindakan`, `tindakan`; tanpa key admin) | **DRAFT** (25 Okt 2026, kartu `t_5a702574`, PRD-v1.3 §2.6) | FE `Public/CheckoutSuccess`, QA |
| §7.9 — **revisi aditif v1.4** `pesanan.shipping.events` `[{status,label,at}]` terbaru→terlama maks 50, `[]` bila kosong (PRD-v1.4 §4.3) | **DRAFT** (26 Okt 2026, kartu `t_f51f8c36`) | FE `Public/CheckoutSuccess`, QA |
| §7.12 — **nilai** `galat` dipetakan dari kode error rates Biteship (`40001001`, `40001002`, `40001010`) dan dari `error` tanpa `code` (`balance` → saldo habis); nama key/bentuk respons tidak berubah | **DRAFT** (24 Okt 2026, kartu `t_1b711d26`, temuan F1 `docs/review-alur-pemesanan.md` §2) | FE checkout, QA |
| §7.0 + §7.12 — **aturan** `berat_gram`/`shipping.berat_gram`: tanpa minimum 500 g, fallback 300 g/unit; galat baru "asal kirim belum lengkap" sebelum API tarif | **DRAFT** (26 Okt 2026, kartu `t_3a264fac`, PRD-v1.4 §2) | FE checkout, QA |
| §7.5–§7.7a, §7.8, §7.8a, §7.10, §7.11, §7.13 — Midtrans **Core API 8 kanal** (ganti Snap): `pembayaran.metode`/`instruksi`/`kanal`, rute `POST …/bayar/metode`, `order_id_midtrans` berakhiran `-2`/`-3`, kanal id di `payments.payment_type`, `GET /midtrans/selesai` | **LOCKED** ditulis 24 Okt 2026 (kartu `t_66e507a3`, PRD-v1.2 §2) | FE halaman bayar, QA |
| §6.2 + field `address`/`city`/`postal_code` di register, dan §7.5 — **sumber nilai** `prefill` (bukan bentuk respons): kini dari `users.address/city/postal_code`, bukan `null` | **DRAFT** (24 Okt 2026, kartu `t_09738dd5`, PRD-v1.2 §3) | FE register + checkout, QA |

### 7.12 `GET /checkout/ongkir` — name `checkout.shipping` (JSON)

Akses: `auth:web` (guest → 302 `/login`). Rate limit **30/menit** per pembeli.
Query: `postal_code` (wajib, digits 5) — kode pos tujuan.

```json
{
  "mode": "api",
  "kode_pos": "51111",
  "berat_gram": 2000,
  "subtotal": 340000,
  "gratis": { "aktif": true, "min": 300000, "terpenuhi": true },
  "opsi": [
    {
      "courier_code": "jne", "courier_name": "JNE",
      "service_code": "reg", "service_name": "REG",
      "label": "JNE REG", "etd": "2-3 hari", "cost": 18000,
      "is_regular": true, "gratis": true
    }
  ],
  "galat": null
}
```

| Key | Aturan |
|---|---|
| `mode` | `"api"` / `"fake"` seperti §7.0 |
| `berat_gram` | Σ `max(1, products.weight_gram) × qty`, fallback 300 g/unit bila berat 0 (PRD-v1.4 §2.2) |
| `gratis.terpenuhi` | `gratis.aktif && subtotal >= gratis.min` (dipakai hanya untuk `is_regular` di §7.6) |
| `opsi[]` | hanya layanan yang aktif di `settings.shipping_couriers`; urut `courier_name`, lalu `service_name` |
| `opsi[].cost` | tarif server (Biteship). Mode `fake`: `settings.shipping_cost_default` untuk semua opsi |
| `opsi[].gratis` | `true` bila `gratis.terpenuhi && is_regular` — `cost` tetap tarif asli; frontend menampilkan `GRATIS` dan mengirim `shipping_cost: 0` |
| `opsi[].etd` | rentang hari dari Biteship, `null` bila tidak ada |
| `galat` | kalimat siap tampil bila Biteship gagal; `opsi: []` dan order tidak bisa dibuat dengan tarif tebakan. Nilainya mengikuti kode error rates Biteship (tabel di bawah) |

Galat: keranjang kosong → 422 `Keranjang masih kosong.`; `postal_code` tidak valid → 422
`Kode pos harus 5 angka.`; Biteship gagal → 200 + `opsi: []` + `galat` dari peta kode error
[rates Biteship](https://biteship.com/en/docs/api/rates/error) (`code` di body jawaban):

| `code` Biteship | `galat` |
|---|---|
| `40001001` | `Kode pos tidak dikenal. Periksa kode pos tujuan; bila tetap gagal, hubungi penjual.` |
| `40001002` | `Ongkir tidak bisa dihitung karena pengaturan Biteship belum lengkap. Hubungi penjual.` |
| `40001010` | `Tidak ada layanan kurir untuk kode pos ini. Coba kode pos lain.` (pesan lama) |
| asal kirim belum lengkap (nama/telepon/alamat/kode pos/email kontak) | `Pengaturan asal pengiriman belum lengkap: <daftar>. Lengkapi di halaman Ekspedisi/Pengaturan, lalu coba lagi.` — tanpa memanggil API |
| 400 **tanpa** `code`, `error` memuat `balance` (`No sufficient balance to call rates API…`) | `Ongkir tidak bisa dihitung karena saldo Biteship penjual habis. Hubungi penjual.` |
| lainnya / tanpa `code` | `Ongkir tidak bisa dihitung saat ini. Coba lagi atau hubungi penjual.` |

Kode asal `40001001` bisa berarti kode pos **asal** (pengaturan `/admin/ekspedisi`) juga, karena
Biteship tidak membedakannya. Server mencatat `success`, `error`, `code`, dan kedua kode pos di
`storage/logs/laravel.log` (`Biteship rates menjawab tidak sukses`) — tanpa header/kunci — supaya
pemilik bisa membedakan kode pos uji vs pengaturan akun. Bila `code` `null`, `error` di baris log itu
yang menentukan pesan (mis. `No sufficient balance…` → saldo akun Biteship habis). `catalog()`
(panel Ekspedisi) mencatat field yang sama tanpa memetakan pesan.

Aturan §7.6 saat kirim: server memanggil ulang layanan yang dipilih dan memakai **tarif server**
(`shipping_cost` dari frontend hanya pembanding; layanan gratis dihitung 0). Bila layanan tidak
ada atau `shipping_cost` kiriman ≠ tarif server (setelah gratis) → `flash.error` =
`Ongkir berubah, pilih ulang kurir.` dan **tidak ada order**. Mode `fake` tanpa
`shipping_courier`/`shipping_service` memakai tarif uji datar (`shipping_cost_default`) dan
menyimpan `shipping_courier = null`; mode `api` menolak dengan `Pilih kurir pengiriman.`

`settings.shipping_couriers` boleh berisi baris array (`courier_code`, `service_code`, `label`,
`is_regular`, `is_active`) maupun bentuk lama string `"courier:service"` (mis. `"jne:reg"`) —
keduanya diterima, baris kosong/tidak sah dibuang, duplikat `courier:service` (tanpa beda huruf
besar-kecil) dipakai yang pertama, dan `DEFAULT_COURIERS` hanya dipakai bila tidak ada satu pun
baris sah. `opsi[]` selalu urut `courier_name` lalu `service_name`. Layanan aktif yang tidak ada
di jawaban tarif Biteship dilewati dari `opsi[]` dan dicatat
`Log::warning('Biteship layanan aktif tanpa tarif', ['layanan' => ['courier:service', …]])` di
`storage/logs/laravel.log` (tanpa token/header). Bentuk JSON respons tidak berubah.

### 7.13 `POST /checkout/{order}/simulasi-bayar` — name `checkout.simulate`

Akses: pemilik order; order pembeli lain → **HTTP 404**. Rate limit **10/menit** per pembeli.
Tanpa body. Hanya untuk **mode uji**: menandai tagihan uji lunas lewat jalur service yang sama dengan
webhook (`payments.status = settlement`, `paid_at`, `orders.status = dibayar`,
`orders.payment_method` = id kanal yang dipilih pada §7.7a, stok tidak dikembalikan). Bila kanal belum
dipilih, tombol simulasi belum ditampilkan (`pembayaran.fake = false` sebelum charge).

Sukses → `redirect()->route('checkout.pay', $order)` + `flash.success` =
`Pembayaran mode uji ditandai lunas.`

Gagal (mode asli, atau baris tagihan dibuat Midtrans asli) →
`redirect()->route('checkout.pay', $order)` + `flash.error` =
`Simulasi pembayaran hanya tersedia dalam mode uji Midtrans.` /
`Tagihan ini dibuat Midtrans asli, jadi tidak bisa disimulasikan.`

Status: **DRAFT** (24 Okt 2026, kartu `t_04da18e0`) — halaman bayar wajib menyembunyikan tombol
simulasi bila `pembayaran.fake = false`.

---

## 8. Halaman beranda `GET /` — name `home`

Ditulis kartu **t_a696f5c6** (menutup temuan N1 `docs/catatan-frontend.md`). Bagian ini melengkapi
§1–§7 dan tidak mengubahnya. Akses: **publik**. Komponen: `Public/Home` (K10).

**Server-rendered, tanpa flag.** Halaman mengirim seluruh data pada respons pertama; tidak ada props
`loading` dan tidak ada props `error`, dan tidak ada fetch data di klien. Komponen memakai nilai
bawaannya (`loading = false`, `error = null`). Bila data kosong, props berisi array kosong — bukan
`null`, bukan teks placeholder. Kegagalan memuat data = galat server biasa (halaman 500), bukan
state `error` di klien.

| Props | Tipe | Isi |
|---|---|---|
| `settings` | object | props bersama §1 (dikirim `HandleInertiaRequests`, bukan oleh controller beranda) |
| `carousels` | array | slide hero aktif, urut `sort_order` lalu `id` (§8.1) |
| `categories` | array | kategori aktif yang punya ≥ 1 produk aktif, urut `sort_order` lalu `name` (§8.2) |
| `featured` | array | produk unggulan aktif, bentuk §8.3, maksimum `settings.landing_sections.featured.limit` (bawaan 8) |
| `faqs` | array | FAQ aktif, urut `sort_order` lalu `id`, maksimum 6 (§8.4) |

### 8.1 `carousels[]`

```json
[
  {
    "id": 1,
    "image": "/images/seed/carousel/slide-1.png",
    "title": "Koleksi Daster Terbaru",
    "subtitle": "Motif batik dan bunga, bahan rayon adem untuk harian.",
    "cta_label": "Lihat Daster",
    "cta_url": "/produk?kategori=daster",
    "is_active": true
  }
]
```

Aturan: `cta_label` ← `carousels.button_text` (`null` bila kosong), `cta_url` ← `carousels.link`
(`null` bila kosong, frontend jatuh ke `/produk`). `image` mengikuti §3. `is_active` selalu `true`
(hanya slide aktif yang dikirim) — key tetap ada agar frontend tidak perlu menebak.
Hanya `carousels.is_active = true` yang dikirim; urutan = `sort_order` naik, lalu `id` naik.

### 8.2 `categories[]`

```json
[
  { "id": 1, "name": "Daster", "slug": "daster",
    "image": "/images/seed/kategori/daster.png",
    "url": "/produk?kategori=daster", "product_count": 5 }
]
```

`product_count` = jumlah `products` dengan `is_active = true` di kategori itu (integer).
`url` = `/produk?kategori={slug}` (path internal, siap dipakai `<Link href>`).
Kategori `is_active = false` atau tanpa produk aktif **tidak dikirim** (design: kategori kosong
tidak dirender). `image` mengikuti §3 dan boleh `null`.

### 8.3 `featured[]` — bentuk produk publik (baku)

Bentuk ini **baku untuk semua daftar produk publik**: beranda (§8) dan katalog `/produk` (K11).
K11 boleh menambah key aditif, tidak boleh mengganti nama key di bawah.

Key aditif yang dipakai K11 (lihat §11.1–11.2):

| Key aditif | Dipakai di | Aturan |
|---|---|---|
| `compare_price` | kartu katalog + detail | integer rupiah \| `null`; harga coret. Frontend (`PriceBlock`) menggambar coretan + badge diskon hanya bila `compare_price > base_price` |
| `variants[]` | kartu katalog + detail | `{id, size, color, color_hex, sku, price_delta, stock, is_active}`, urut ukuran baku lalu `color` lalu `id`; hanya varian `is_active = true`. Kartu katalog ikut mengirim agar tombol tambah tahu produk bervarian wajib dipilih dulu di halaman detail |

**`variants[].color_hex`** (aditif, 22 Okt 2026, kartu `t_bc89df6d`): representasi warna siap pakai
untuk swatch, `#RRGGBB` huruf besar, diturunkan server dari `variants.color` lewat peta baku
`app/Support/VariantColor.php` (nama Indonesia/Inggris, tidak peka huruf besar-kecil dan spasi;
isian `#RGB`/`#RRGGBB` diteruskan dalam huruf besar). `null` bila `color` kosong atau nama tidak
dikenal — frontend menampilkan lingkaran netral + label nama, bukan warna karangan. Warna ganda
**tidak digabung**: setiap kombinasi ukuran × warna tetap satu baris `variants[]`; daftar warna
unik diturunkan frontend dari `variants[]`, bukan dari key baru.

Key yang **hanya** dikirim di halaman detail (§11.2): `description`, `care`, `shipping_return`,
`reviews[]`, `rating_distribution`.

```json
[
  {
    "id": 3,
    "slug": "daster-batik-pekalongan",
    "name": "Daster Batik Pekalongan",
    "sku": "DSR-BTK-01",
    "url": "/produk/daster-batik-pekalongan",
    "short_description": "Daster rayon motif batik, ukuran jumbo tersedia.",
    "base_price": 85000,
    "wholesale_price": 75000,
    "min_wholesale_qty": 6,
    "rating_avg": 4.5,
    "rating_count": 2,
    "stock": 24,
    "is_featured": true,
    "category": { "id": 1, "name": "Daster", "slug": "daster" },
    "images": [
      { "id": 1, "path": "/images/seed/produk/daster-batik-pekalongan-1.png",
        "alt": "Daster Batik Pekalongan — gambar 1", "is_primary": true, "sort_order": 0 },
      { "id": 2, "path": "/images/seed/produk/daster-batik-pekalongan-2.png",
        "alt": "Daster Batik Pekalongan — gambar 2", "is_primary": false, "sort_order": 1 }
    ]
  }
]
```

| Key | Aturan |
|---|---|
| `base_price`, `wholesale_price`, `min_wholesale_qty` | integer rupiah / integer; `wholesale_price` boleh `null` (tanpa harga grosir) |
| `rating_avg` | **angka** (float 0–5), bukan string — cast `decimal:2` di model dikonversi di server |
| `rating_count` | integer |
| `stock` | integer, jumlah `product_variants.stock` untuk varian `is_active = true`; `0` berarti habis (frontend menonaktifkan tombol tambah) |
| `url` | `/produk/{slug}` |
| `category` | objek `{id, name, slug}`; produk selalu punya kategori (`products.category_id` RESTRICT) |
| `images` | urut `sort_order` lalu `id`; maksimal 2 gambar pertama dipakai kartu (utama + hover), tetapi array memuat semua gambar produk; `[]` bila tidak ada gambar |
| `short_description` | string\|`null` |

Hanya produk `is_active = true` yang dikirim. `featured[]` = produk aktif dengan
`is_featured = true`, urut `rating_avg` turun, lalu `rating_count` turun, lalu `id` naik.

### 8.4 `faqs[]`

```json
[ { "id": 1, "question": "Bagaimana cara memesan di Toko Kulot?", "answer": "Pilih produk dan varian …" } ]
```

Hanya `faqs.is_active = true`, urut `sort_order` lalu `id`, maksimum 6 baris (design §3.3 butir 8).
`answer` dikirim sebagai teks biasa (bukan HTML); frontend merender sebagai teks.

### 8.5 Status

| Bagian | Status | Dipakai oleh |
|---|---|---|
| §8 props `/` | DRAFT | K10 (sudah memakai), K11, K14 |
| §8.3 bentuk produk publik | LOCKED | K11 (`/produk`, `/produk/{slug}`), K12, K14 |
| §8.3 key aditif `variants[].color_hex` | **LOCKED** ditambahkan 22 Okt 2026 (kartu `t_bc89df6d`); key lain tidak berubah | K11, K12, K14 |

---

## 9. Formulir publik — ulasan & pesan kontak (K9)

Semua aksi tulis memakai Inertia (bukan API JSON): galat validasi lewat `errors`, hasil lewat
`flash`. Tanggal memakai ISO 8601 zona `Asia/Jakarta`. Uang & jumlah dikirim sebagai angka.

### 9.1 `POST /checkout/{order}/ulasan` — name `checkout.review`

Akses: pembeli login; order harus milik `auth()->id()` (selain itu `404`).

Body:

```json
{ "ulasan": [ { "product_id": 12, "rating": 5, "comment": "Bahan adem, jahitan rapi." } ] }
```

| Field | Aturan |
|---|---|
| `ulasan` | wajib, array, 1–20 entri |
| `ulasan.*.product_id` | wajib, integer, tidak boleh dobel, harus ada di `products` |
| `ulasan.*.rating` | wajib, integer 1–5 |
| `ulasan.*.comment` | boleh kosong, teks, maks 1000 |

Aturan tambahan (PRD §7.3):

- Order harus `payment_status = settlement` **dan** `status` ∈ (`dibayar`, `diproses`, `dikirim`,
  `selesai`). Bila belum: redirect kembali + `flash.error` = `Ulasan bisa dikirim setelah pembayaran berhasil.`
- `product_id` harus ada pada `order_items` order tersebut; bila tidak → galat validasi
  `ulasan.<index>.product_id` = `Produk ini bukan bagian dari pesanan Anda.`
- Satu produk satu ulasan per order (`reviews.order_id` + `reviews.product_id` unik); bila sudah ada →
  `ulasan.<index>.product_id` = `Produk ini sudah Anda nilai.`
- Setelah tersimpan, `products.rating_avg` dan `products.rating_count` dihitung ulang.

Sukses: redirect `route('checkout.success', $order)` + `flash.success` =
`Terima kasih, penilaian Anda sudah tersimpan.`

Status: **LOCKED** — dipakai K12 (form di halaman selesai checkout) dan K14.

### 9.2 `POST /kontak-kami` — name `contact.store`

Akses: publik, batas laju `throttle:contact` (3 permintaan/menit per IP).

Body (`application/x-www-form-urlencoded` / multipart):

| Field | Aturan | Pesan galat |
|---|---|---|
| `name` | wajib, teks, maks 100 | `Nama wajib diisi.` |
| `email` | wajib, format email, maks 150 | `Email tidak valid.` |
| `phone` | boleh kosong, teks, maks 30 | `Nomor telepon terlalu panjang.` |
| `subject` | wajib, teks, maks 150 | `Subjek wajib diisi.` |
| `message` | wajib, teks, maks 2000 | `Pesan wajib diisi.` |
| `website` | honeypot: harus kosong | — |

Bila honeypot terisi: tidak menyimpan apa pun, tetap redirect dengan `flash.success` yang sama
(membuat bot mengira berhasil).

Sukses: redirect ke `/kontak-kami` + `flash.success` =
`Pesan Anda sudah kami terima. Kami balas maksimal 1x24 jam.`
IP pengirim (`ip`) ikut disimpan. Pengiriman email ke pemilik toko tidak dilakukan (lihat
`docs/asumsi.md` A-K9-04).

Status: **LOCKED** — dipakai K11 (halaman kontak) dan K14.

---

## 10. Panel admin — pesan masuk, penilaian, pengaturan (K9)

Akses seluruh rute: middleware `admin` (guard `admin`, akun aktif). Bila belum masuk → redirect
`admin.login`.

### 10.1 `GET /admin/pesan-masuk` — name `admin.messages.index`

Query: `q` (cari nama/subjek/email), `status` ∈ `semua` (bawaan) | `belum` | `sudah`, `page`.

```json
{
  "pesan": {
    "data": [
      {
        "id": 1,
        "name": "Siti Aminah",
        "email": "siti@example.test",
        "phone": "081234567890",
        "subject": "Tanya ukuran L",
        "message": "Apakah ukuran L muat untuk berat 60 kg?",
        "is_read": false,
        "admin_reply": null,
        "replied_at": null,
        "created_at": "2026-10-20T09:15:00+07:00"
      }
    ],
    "links": ["…paginator Laravel…"],
    "meta": { "current_page": 1, "last_page": 3, "per_page": 15, "total": 41 }
  },
  "filter": { "q": null, "status": "semua" },
  "ringkasan": { "total": 41, "belum_dibaca": 6 }
}
```

Urut `created_at` turun. 15 baris per halaman.

### 10.2 `PATCH /admin/pesan-masuk/{message}/baca` — name `admin.messages.read`

Tanpa body. `is_read = true`. Redirect kembali + `flash.success` = `Pesan ditandai sudah dibaca.`

**Koreksi metode (20 Okt 2026, kartu `t_54bfee4e`).** Bagian ini sebelumnya menulis `POST`.
Sumber kebenaran = `docs/PRD.md` §5.2 baris 157 (**PATCH**): berkas ini berstatus DRAFT turunan
PRD §5, dan rute parsial sejenis di dalamnya (§10.6 `PATCH …/tampil`) memang PATCH. Backend
menyelaraskan `routes/admin.php:43` ke PATCH; pemanggil frontend wajib `PATCH` (pola
`router.patch` seperti `resources/js/Pages/Public/Cart.jsx:31`), bukan `POST`.

### 10.3 `POST /admin/pesan-masuk/{message}/balas` — name `admin.messages.reply`

Body: `admin_reply` wajib, teks, maks 2000 (`Balasan wajib diisi.`).

Efek: `admin_reply` diisi, `replied_at = now()`, `is_read = true`. Balasan dicoba dikirim ke
`email` pengirim lewat `Mail::raw`; kegagalan kirim hanya dicatat ke log, tidak menggagalkan aksi.
Redirect kembali + `flash.success` = `Balasan tersimpan.`

### 10.4 `GET /admin/penilaian` — name `admin.reviews.index`

Query: `q` (produk/pembeli/komentar), `rating` ∈ `semua` | `1`–`5`, `visibilitas` ∈ `semua` |
`tampil` | `sembunyi`, `page`.

```json
{
  "ulasan": {
    "data": [
      {
        "id": 7,
        "product": { "id": 12, "name": "[CONTOH] Daster Kulot Premium", "slug": "contoh-daster-kulot-premium" },
        "pembeli": "Siti Aminah",
        "rating": 5,
        "comment": "Bahan adem, jahitan rapi.",
        "admin_reply": null,
        "replied_at": null,
        "is_visible": true,
        "created_at": "2026-10-20T09:20:00+07:00"
      }
    ],
    "links": ["…paginator Laravel…"],
    "meta": { "current_page": 1, "last_page": 2, "per_page": 15, "total": 18 }
  },
  "filter": { "q": null, "rating": "semua", "visibilitas": "semua" },
  "ringkasan": {
    "rating_avg": 4.6,
    "rating_count": 18,
    "distribusi": { "1": 0, "2": 1, "3": 2, "4": 5, "5": 10 }
  }
}
```

Urut `created_at` turun. `ringkasan` dihitung dari seluruh ulasan (bukan hanya halaman aktif),
memakai filter `q`/`rating`/`visibilitas` yang sedang aktif.

### 10.5 `POST /admin/penilaian/{review}/balas` — name `admin.reviews.reply`

Body: `admin_reply` wajib, teks, maks 1000. Set `replied_at = now()`. Redirect kembali +
`flash.success` = `Balasan ulasan tersimpan.`

### 10.6 `PATCH /admin/penilaian/{review}/tampil` — name `admin.reviews.visibility`

Body: `is_visible` boleh kosong (boolean). Bila kosong → nilai dibalik. `products.rating_avg`
dan `products.rating_count` dihitung ulang (hanya ulasan `is_visible = true` yang dihitung).
Redirect kembali + `flash.success` = `Ulasan ditampilkan.` / `Ulasan disembunyikan.`

### 10.7 `GET /admin/pengaturan` — name `admin.settings.index`

Props:

```json
{
  "pengaturan": {
    "umum": {
      "store_name": "[CONTOH] Toko Daster Kulot",
      "store_logo": "/storage/settings/logo-contoh.webp",
      "store_favicon": null,
      "store_tagline": "Daster & kulot nyaman untuk harian"
    },
    "header": { "header_nav": [ { "label": "Beranda", "url": "/" } ] },
    "footer": {
      "footer_about": "…",
      "footer_copyright": "© 2026 Toko Kulot. Semua hak dilindungi.",
      "footer_links": [ { "label": "Kontak", "url": "/kontak-kami" } ],
      "footer_social": [ { "label": "Instagram", "url": "https://instagram.com/…" } ]
    },
    "kontak": {
      "contact_email": "halo@contoh.test",
      "contact_phone": "0812…",
      "contact_whatsapp": "62812…",
      "contact_address": "…",
      "contact_map_embed": "…"
    },
    "seo": { "seo_default_title": "…", "seo_default_description": "…" },
    "pembayaran": {
      "shipping_cost_default": 20000,
      "midtrans_client_key": "SB-Mid-client-xxxx",
      "midtrans_is_production": false
    },
    "landing": {
      "landing_hero": { "title": "…", "subtitle": "…", "cta_label": "…", "cta_url": "/produk", "image": "/storage/…" },
      "landing_sections": { "announcement": {}, "trust_strip": [], "featured": {}, "promo": {}, "why_us": {}, "newsletter": {} }
    }
  },
  "carousels": [
    { "id": 1, "title": "…", "subtitle": "…", "image": "/storage/carousels/…", "link": "/produk", "button_text": "Belanja", "sort_order": 1, "is_active": true }
  ],
  "faqs": [ { "id": 1, "question": "…", "answer": "…", "sort_order": 1, "is_active": true } ],
  "midtrans": {
    "client_key": null,
    "is_production": false,
    "fake": true,
    "mode": "uji",
    "alasan_kode": "fake_aktif",
    "alasan": "MODE UJI aktif karena MIDTRANS_FAKE=true di .env: pembayaran disimulasikan lokal (tanpa Midtrans).",
    "langkah_perbaikan": [ "Ubah MIDTRANS_FAKE=false pada berkas .env.", "…" ],
    "server_key_terisi": false,
    "sumber_kredensial": ".env (MIDTRANS_*)",
    "catatan": "Kredensial efektif dibaca dari .env (MIDTRANS_*); kolom Midtrans pada tab Pembayaran admin belum dipakai jalur pembayaran ini."
  }
}
```

Nilai kosong dikirim `null`. `type = json` sudah di-decode menjadi objek/array.
`shipping_cost_default` integer, `midtrans_is_production` boolean.
Carousel urut `sort_order`, lalu `id`; FAQ urut `sort_order`, lalu `id` (semua baris, termasuk
`is_active = false`, karena ini halaman admin).

`midtrans` = status mode pembayaran efektif (bentuk baku, sama persis dengan §7.5). Tab **Pembayaran**
memakainya untuk menjelaskan kenapa pembayaran belum bisa dilakukan dan apa yang harus diubah pemilik.
Kolom `midtrans_client_key` / `midtrans_is_production` di atas **hanya catatan di halaman admin** —
jalur pembayaran membaca `.env` (`MIDTRANS_*`) lewat `config/midtrans.php`; sumber itu ditulis di
`midtrans.sumber_kredensial` dan `midtrans.catatan`.

### 10.8 `PUT /admin/pengaturan` — name `admin.settings.update`

Menyimpan satu tab; hanya key yang dikirim yang ditulis (tab lain tidak berubah). Key yang
diizinkan = seluruh `settings` PRD §6 kecuali grup `landing` (lewat §10.9) dan kecuali key
`type = json` yang divalidasi terpisah.

| Key | Aturan | Pesan galat |
|---|---|---|
| `store_name` | wajib bila dikirim, teks, maks 100 | `Nama toko wajib diisi.` |
| `store_tagline` | boleh kosong, teks, maks 150 | — |
| `store_logo` | berkas gambar `jpg,jpeg,png,webp`, maks 2048 KB | `Logo harus gambar JPG, PNG, atau WebP maksimal 2 MB.` |
| `store_favicon` | berkas gambar `jpg,jpeg,png,webp,ico`, maks 512 KB | `Favicon harus gambar maksimal 512 KB.` |
| `hapus_store_logo` | boolean; `true` menghapus logo lama | — |
| `header_nav` | array maks 8, tiap entri `label` (wajib, maks 40) + `url` (wajib, maks 255) | `Menu navigasi tidak valid.` |
| `footer_about` | boleh kosong, teks, maks 500 | — |
| `footer_copyright` | boleh kosong, teks, maks 200 (kosong = frontend memakai `© {tahun} {nama_toko}`) | `Copyright footer maksimal 200 karakter.` |
| `footer_links` | array maks 8, `label` + `url` | `Tautan footer tidak valid.` |
| `footer_social` | array maks 8, `label` + `url` | `Media sosial tidak valid.` |
| `contact_email` | boleh kosong, email, maks 150 | `Email kontak tidak valid.` |
| `contact_phone` | boleh kosong, teks, maks 30 | — |
| `contact_whatsapp` | boleh kosong, teks, maks 30 | — |
| `contact_address` | boleh kosong, teks, maks 500 | — |
| `contact_map_embed` | boleh kosong, teks, maks 1000 | — |
| `seo_default_title` | boleh kosong, teks, maks 150 | — |
| `seo_default_description` | boleh kosong, teks, maks 300 | — |
| `shipping_cost_default` | bilangan bulat 0–1.000.000 | `Ongkir harus angka 0 atau lebih.` |
| `midtrans_client_key` | boleh kosong, teks, maks 100 | — |
| `midtrans_is_production` | boolean | — |

Berkas gambar: nama dibuat server (`Str::random` + ekstensi), disimpan di disk `public`
(`storage/app/public/settings`), path tersimpan `/storage/settings/<nama>`. Berkas lama dihapus
saat diganti atau saat `hapus_store_logo = true`.

Sukses: redirect kembali + `flash.success` = `Pengaturan disimpan.`

### 10.9 `PUT /admin/pengaturan/landing` — name `admin.settings.landing`

Body: `landing_hero` (array), `landing_sections` (array), `landing_gallery` (array, opsional) dan
`landing_gallery_present` (boolean, opsional). Struktur mengikuti
`database/seeders/SettingSeeder.php`; hanya sub-key yang dikenal yang disimpan (key asing dibuang).

| Field | Aturan |
|---|---|
| `landing_hero.title` | wajib, teks, maks 150 |
| `landing_hero.subtitle` | boleh kosong, teks, maks 255 |
| `landing_hero.cta_label` | boleh kosong, teks, maks 60 |
| `landing_hero.cta_url` | boleh kosong, teks, maks 255 |
| `landing_hero.image` | boleh kosong, teks, maks 255 (path gambar) |
| `landing_sections.announcement` | `text` (maks 255), `url` (maks 255), `is_active` (boolean) |
| `landing_sections.trust_strip` | array maks 6; tiap entri `icon` (maks 40), `title` (maks 80), `subtitle` (maks 120) |
| `landing_sections.featured` | `title` (maks 80), `subtitle` (maks 120), `limit` (1–12) |
| `landing_sections.promo` | `title`, `subtitle`, `cta_label`, `cta_url`, `image`, `is_active` |
| `landing_sections.why_us` | `title` (maks 80), `items` (array maks 6; tiap entri `title` maks 80 + `body` maks 255) |
| `landing_sections.newsletter` | `title` (maks 80), `subtitle` (maks 120; copy CTA akhir), `button_text` (maks 40) |
| `landing_gallery` | array maks 8; tiap entri `image` (unggahan jpg/jpeg/png/webp ≤ 2 MB, atau path yang sudah ada), `caption` (maks 80), `alt` (maks 120). Urutan array = urutan tampil |
| `landing_gallery_present` | boolean; wajib `1` bila admin mengirim daftar galeri kosong untuk menghapus semua item. Tanpa penanda ini dan tanpa `landing_gallery`, galeri yang tersimpan tidak diubah |

Sukses: redirect kembali + `flash.success` = `Konten landing disimpan.`

### 10.10 Carousel — `admin.carousels.store` / `.update` / `.destroy`

| Rute | Name |
|---|---|
| `POST /admin/pengaturan/carousel` | `admin.carousels.store` |
| `PUT /admin/pengaturan/carousel/{carousel}` | `admin.carousels.update` |
| `DELETE /admin/pengaturan/carousel/{carousel}` | `admin.carousels.destroy` |

Body (update memakai multipart + `_method=PUT`):

| Field | Aturan |
|---|---|
| `title` | wajib, teks, maks 150 (`Judul carousel wajib diisi.`) |
| `subtitle` | boleh kosong, teks, maks 255 |
| `image` | wajib saat tambah; gambar `jpg,jpeg,png,webp` maks 2048 KB (`Gambar carousel harus JPG, PNG, atau WebP maksimal 2 MB.`) |
| `link` | boleh kosong, teks, maks 255 |
| `button_text` | boleh kosong, teks, maks 60 |
| `sort_order` | boleh kosong, integer 0–999 (bawaan 0) |
| `is_active` | boleh kosong, boolean (bawaan `true` saat tambah) |

Sukses: redirect kembali + `flash.success` = `Carousel disimpan.` / `Carousel diperbarui.` /
`Carousel dihapus.` Berkas gambar dihapus saat carousel dihapus atau gambarnya diganti.

### 10.11 FAQ — `admin.faqs.store` / `.update` / `.destroy`

| Rute | Name |
|---|---|
| `POST /admin/pengaturan/faq` | `admin.faqs.store` |
| `PUT /admin/pengaturan/faq/{faq}` | `admin.faqs.update` |
| `DELETE /admin/pengaturan/faq/{faq}` | `admin.faqs.destroy` |

| Field | Aturan |
|---|---|
| `question` | wajib, teks, maks 255 (`Pertanyaan wajib diisi.`) |
| `answer` | wajib, teks, maks 2000 (`Jawaban wajib diisi.`) |
| `sort_order` | boleh kosong, integer 0–999 (bawaan 0) |
| `is_active` | boleh kosong, boolean (bawaan `true` saat tambah) |

Sukses: redirect kembali + `flash.success` = `FAQ disimpan.` / `FAQ diperbarui.` / `FAQ dihapus.`

### 10.12 Status

| Bagian | Status | Dipakai oleh |
|---|---|---|
| §9.1 ulasan pembeli | LOCKED | K12, K14 |
| §9.2 pesan kontak | LOCKED | K11, K14 |
| §10.1–10.3 pesan masuk | LOCKED | K14 |
| §10.4–10.6 penilaian | LOCKED | K14 |
| §10.7–10.11 pengaturan, carousel, FAQ | LOCKED | K14 |
| §10.7/§10.8 key `footer_copyright` + props bersama `store_favicon`/`footer_copyright` | LOCKED diperbarui 23 Okt 2026 (kartu `t_101b9145`) | FE-Identitas (`t_c915c033`), QA |
| §10.7 prop `midtrans` (mode efektif + alasan) | LOCKED diperbarui 21 Okt 2026 (kartu `t_9f4b6aee`, temuan F-2 `docs/review.md`) | F2 |

### 10.13 Ekspedisi — `admin.shipping.index` / `admin.shipping.update`

`GET /admin/ekspedisi` (name `admin.shipping.index`, komponen `Admin/Shipping/Index`),
`PUT /admin/ekspedisi` (name `admin.shipping.update`). Akses: admin login. PRD v1.1 D4.

```json
{
  "pengaturan": {
    "shipping_origin_name": "Toko Kulot",
    "shipping_origin_phone": "081234567890",
    "shipping_origin_address": "Jl. Melati 12, Pekalongan",
    "shipping_origin_postal_code": "51111",
    "free_shipping_enabled": true,
    "free_shipping_min": 300000,
    "shipping_cost_default": 20000
  },
  "kurir": {
    "mode": "api",
    "key_terisi": true,
    "sumber": "biteship",
    "galat": null,
    "daftar": [
      {
        "courier_code": "jne", "courier_name": "JNE",
        "service_code": "reg", "service_name": "REG",
        "label": "JNE REG", "etd": "2-3 hari", "is_regular": true, "is_active": true
      }
    ]
  }
}
```

| Key | Aturan |
|---|---|
| `pengaturan.*` | nilai `settings` grup `shipping`; `free_shipping_enabled` boolean, `free_shipping_min` integer |
| `kurir.mode` | `"api"` / `"fake"` seperti §7.12 |
| `kurir.key_terisi` | boolean saja — **nilai `BITESHIP_API_KEY` tidak pernah dikirim** |
| `kurir.sumber` | `"biteship"` bila daftar dari API, `"settings"` bila memakai daftar tersimpan (API gagal/mode fake) |
| `kurir.galat` | kalimat bila daftar API gagal; form tetap bisa disimpan |
| `kurir.daftar[]` | gabungan layanan Biteship dengan `settings.shipping_couriers` (aktif/reguler per layanan). `is_regular` = layanan reguler (boleh gratis ongkir), `is_active` = ditampilkan di checkout. `etd` = estimasi dari Biteship (`null` bila kosong); dropdown layanan memakai kode + nama + `etd` |

Katalog Biteship (`GET /v1/couriers`) di-cache **24 jam** di server (key `biteship.couriers`);
kegagalan API tidak di-cache dan tidak mengubah props: `sumber` menjadi `"settings"` + `galat`
terisi, halaman tetap bisa disimpan. `PUT` menolak `couriers[].courier_code`/`service_code` di
luar katalog **hanya** saat katalog Biteship benar-benar tersedia (`sumber = "biteship"` dan
`daftar` tidak kosong); di mode `fake`/API gagal validasi manual tetap berlaku.

Kiriman `PUT`:

| Field | Aturan | Pesan galat |
|---|---|---|
| `shipping_origin_name` | wajib, string, maks 100 | `Nama pengirim wajib diisi.` |
| `shipping_origin_phone` | wajib, string, maks 30 | `Nomor telepon pengirim wajib diisi.` |
| `shipping_origin_address` | wajib, string, maks 500 | `Alamat asal wajib diisi.` |
| `shipping_origin_postal_code` | wajib, digits 5 | `Kode pos asal harus 5 angka.` |
| `free_shipping_enabled` | wajib, boolean | `Nilai gratis ongkir tidak valid.` |
| `free_shipping_min` | wajib, integer, min 0, maks 100000000 | `Minimal belanja gratis ongkir tidak valid.` |
| `shipping_cost_default` | wajib, integer, min 0, maks 10000000 — tarif datar mode `fake` dan `pengiriman.tarif_uji` di checkout | `Tarif uji tidak valid.` |
| `couriers` | wajib, array, min 1 | `Pilih minimal satu layanan kurir.` |
| `couriers[].courier_code` | wajib, string, maks 40 | `Kode kurir tidak valid.` |
| `couriers[].service_code` | wajib, string, maks 60 | `Kode layanan tidak valid.` |
| `couriers[].label` | opsional, string, maks 80 | `Label layanan maksimal 80 karakter.` |
| `couriers[].is_regular` | wajib, boolean | `Nilai layanan reguler tidak valid.` |
| `couriers[].is_active` | wajib, boolean | `Nilai layanan aktif tidak valid.` |

Minimal satu baris `couriers` harus `is_active = true` → `Pilih minimal satu layanan kurir.`
Sukses: redirect kembali + `flash.success` = `Pengaturan ekspedisi disimpan.`

---

## 11. Katalog publik (K11)

Tiga rute: `GET /produk`, `GET /produk/{slug}`, `GET /kontak-kami`. Semua publik (tanpa login) dan
memakai props bersama §1. Bentuk kartu produk mengikuti §8.3 termasuk key aditifnya.

### 11.1 `GET /produk` — name `products.index`

Catatan penamaan: laporan pemilik menyebut halaman ini `/produk/barang`. Rute yang ada tetap
`products.index` (`/produk`, katalog) dan `products.show` (`/produk/{slug}`, detail); tidak ada
rute `/produk/barang` dan tidak dibuat.

Query (semua opsional; nilai tidak dikenal atau tidak valid **diabaikan**, tidak memicu galat):

| Param | Aturan |
|---|---|
| `q` | teks, maks 100; dicari pada `name`, `short_description`, `sku` (LIKE; `%` dan `_` di-escape) |
| `kategori` | slug kategori (huruf kecil, angka, tanda hubung, maks 100) |
| `ukuran` | satu atau beberapa ukuran dipisah koma, mis. `M,XL` (maks 20 nilai, tiap nilai maks 30) |
| `harga_min`, `harga_max` | integer rupiah ≥ 0, dibandingkan ke `products.base_price`; bila `harga_min > harga_max` keduanya ditukar |
| `urut` | `terbaru` (bawaan) \| `harga-asc` \| `harga-desc` \| `terlaris` \| `rating` |
| `page` | integer ≥ 1 |

Props:

```json
{
  "products": {
    "data": [ /* §8.3 + compare_price + variants[] */ ],
    "current_page": 1, "last_page": 2, "per_page": 12, "total": 18
  },
  "categories": [ /* §8.2 */ ],
  "sizes": ["M", "L", "XL"],
  "filters": { "q": null, "kategori": null, "ukuran": null, "harga_min": null, "harga_max": null,
               "urut": "terbaru", "page": 1 },
  "error": null
}
```

| Key | Aturan |
|---|---|
| `products` | selalu objek paginator (`data[]`), `per_page` 12; hasil kosong → `data: []`, `total: 0` |
| `categories` | bentuk §8.2 (termasuk `product_count`) |
| `sizes` | ukuran unik `product_variants.size` varian aktif dari produk aktif, urut ukuran baku (XS, S, M, L, XL, XXL, …; ukuran di luar daftar di belakang, urut abjad) |
| `filters` | selalu memuat seluruh key; nilai kosong `null`, `urut` bawaan `terbaru`, `page` integer hasil normalisasi; `ukuran` dikirim sebagai string koma yang sudah dinormalisasi |
| `error` | selalu `null` (dipakai frontend bila balasan gagal di sisi klien) |

Hanya produk `is_active = true`. Urutan daftar: `terbaru` = `created_at` turun lalu `id` turun;
`harga-asc`/`harga-desc` = `base_price` naik/turun lalu `id` naik; `terlaris` = jumlah
`order_items.qty` pada pesanan berstatus ≠ `batal` (turun) lalu `id` naik; `rating` = `rating_avg`
turun, `rating_count` turun, `id` naik.

### 11.2 `GET /produk/{slug}` — name `products.show`

`{slug}` = `products.slug`. Bila `{slug}` seluruhnya angka dan tidak ada slug yang cocok, dicari
`products.id` (PRD §14.1 butir 1).

Produk tidak ada **atau** `is_active = false` → HTTP **404** dengan halaman yang sama:
`product: null`, `related: []`, `error: "Produk tidak ditemukan."`.

```json
{
  "product": {
    "id": 3, "slug": "daster-batik-pekalongan", "…": "seluruh key §8.3 + compare_price + variants[]",
    "description": "Daster rayon …", "care": null, "shipping_return": null,
    "rating_distribution": { "5": 3, "4": 1, "3": 0, "2": 0, "1": 0 },
    "reviews": [
      { "id": 7, "user_name": "Ayu Lestari", "rating": 5, "comment": "Bahan adem.",
        "created_at": "2026-10-18T09:12:00+07:00", "reply": null }
    ]
  },
  "related": [ /* §8.3 + compare_price + variants[], maks 4 */ ],
  "error": null
}
```

| Key | Aturan |
|---|---|
| `description` | `products.description` — teks biasa (bukan HTML), boleh `null` |
| `care`, `shipping_return` | selalu `null`: belum ada kolomnya; frontend jatuh ke teks baku |
| `rating_distribution` | objek dengan key `"5"`…`"1"` (integer), dihitung dari `reviews` `is_visible = true`; key yang tidak ada bernilai `0` |
| `reviews[]` | hanya `is_visible = true`, urut `created_at` turun lalu `id` turun, maks 20; `user_name` = nama pembeli, `"Pembeli"` bila akunnya sudah tidak ada; `reply` = `reviews.admin_reply` (`null` bila belum dibalas) |
| `related[]` | produk aktif lain di kategori yang sama (bukan produk ini), urut `rating_avg` turun lalu `id` naik, maks 4 |

`rating_avg` dan `rating_count` pada `product` tetap diambil dari kolom `products` (§8.3). Harga grosir
dihitung frontend dari `base_price`, `wholesale_price`, `min_wholesale_qty` — tidak ada key baru.

### 11.3 `GET /kontak-kami` — name `contact`

Tidak ada props sendiri: hanya props bersama §1 (`settings`, `cartCount`, `user`, `flash`) dan pesan
`flash.success` dari §9.2. Info toko dibaca frontend dari `settings` (§2): `contact_address`,
`contact_phone`, `contact_whatsapp`, `contact_email`, `contact_map_embed`; key yang belum diisi tidak
dirender (bukan nilai karangan).

### 11.4 Status

| Bagian | Status | Dipakai oleh |
|---|---|---|
| §11.1 `/produk` | LOCKED | K12 (keranjang dari kartu katalog), K14 |
| §11.2 `/produk/{slug}` | LOCKED | K12, K14 |
| §11.3 `/kontak-kami` | LOCKED | K14 |

## 12. Panel admin — produk, kategori, stok, pesanan, akun (K12)

Status: **DRAFT** (dipakai kartu frontend admin lanjutan). Implementasi backend selesai
2026-10-20: 22 rute terdaftar dan seluruh test hijau (`php artisan test` → 189 passed, 0 failed);
bentuk props di bawah sudah cocok dengan keluaran controller. Semua rute di grup middleware
`admin` (guard `admin`, akun nonaktif ditolak). Semua tanggal ISO 8601 zona `Asia/Jakarta`.
Semua uang integer rupiah (bukan string). Nilai kosong `null`.

Galat: pelanggaran aturan (validasi form, penolakan aksi seperti "kategori masih dipakai",
"stok tidak cukup", "tidak bisa menghapus akun sendiri") selalu dikembalikan sebagai
`errors.<key>` (Inertia) dengan `<key>` yang disebut di tiap endpoint. Sukses memakai
`flash.success` (string). Tidak ada `flash.error`.

### 12.0 Bentuk baku

Paginator bawaan Laravel: `{ data, links, meta }`, `meta` =
`{current_page,last_page,per_page,total}`, **15 baris** per halaman. Setiap halaman daftar
menambah dua key di level halaman: `filter` (nilai filter yang sedang aktif, dipakai untuk
mengisi ulang kontrol filter) dan `ringkasan` (angka ringkas, sesuai PRD §9).

### 12.1 GET `/admin/produk` — `admin.products.index` — `Admin/Products/Index`

Query: `q` (nama/SKU), `kategori` (id kategori), `status` ∈ `semua`(bawaan)|`aktif`|`nonaktif`,
`stok` ∈ `semua`(bawaan)|`habis`|`kritis` (stok aktif < 5), `urut` ∈
`terbaru`(bawaan)|`nama`|`harga`|`stok`, `page`. Filter tak sah diabaikan (kembali ke bawaan).

```json
{
  "produk": {"data": [{
    "id": 3, "name": "Daster Batik Pekalongan", "slug": "daster-batik-pekalongan", "sku": "DSR-BTK-01",
    "category": {"id": 1, "name": "Daster", "slug": "daster"},
    "base_price": 85000, "compare_price": 99000, "wholesale_price": 75000, "min_wholesale_qty": 6,
    "is_active": true, "is_featured": false,
    "stock": 24, "variant_count": 3,
    "image": {"id": 7, "path": "/images/seed/produk/daster-1.png", "alt": "Daster Batik Pekalongan"},
    "url": "/produk/daster-batik-pekalongan",
    "created_at": "2026-10-20T09:15:00+07:00", "updated_at": "2026-10-20T09:15:00+07:00"
  }], "links": ["…"], "meta": {"current_page": 1, "last_page": 1, "per_page": 15, "total": 3}},
  "filter": {"q": null, "kategori": null, "status": "semua", "stok": "semua", "urut": "terbaru"},
  "kategori": [{"id": 1, "name": "Daster", "slug": "daster"}],
  "ringkasan": {"total": 3, "aktif": 3, "nonaktif": 0, "stok_kritis": 1}
}
```

`stock` = jumlah `stock` varian aktif; `image` = gambar utama atau `null`; `variant_count` =
jumlah varian. `ringkasan.stok_kritis` = jumlah produk dengan total stok aktif < 5.

### 12.2 GET `/admin/produk/tambah` — `admin.products.create` — `Admin/Products/Create`

Props: `kategori` (semua kategori, urut `sort_order`, `name` — termasuk nonaktif),
`ukuran_baku` (daftar ukuran resmi dari `App\Support\VariantSize`).

### 12.3 POST `/admin/produk` — `admin.products.store`

Redirect sukses: `admin.products.index` + `flash.success` = `Produk disimpan.`
Galat: `errors.name`, `errors.slug`, `errors.sku`, `errors.category_id`, `errors.base_price`,
`errors.compare_price`, `errors.wholesale_price`, `errors.min_wholesale_qty`,
`errors.description`, `errors.weight_gram`, `errors.images`, `errors.variants`.

| Field | Aturan |
|---|---|
| `name` | wajib, maks 180 |
| `slug` | opsional (dibuat dari nama bila kosong), unik |
| `sku` | wajib, maks 60, unik |
| `category_id` | wajib, harus ada |
| `short_description` | opsional, maks 255 |
| `description` | opsional, maks 5000 |
| `weight_gram` | opsional, integer ≥ 0 |
| `base_price` | wajib, integer ≥ 0 |
| `compare_price` | opsional, integer > `base_price` |
| `wholesale_price` | opsional, integer < `base_price` |
| `min_wholesale_qty` | wajib bila `wholesale_price` diisi, integer ≥ 1 |
| `is_active`, `is_featured` | boolean, bawaan `true` / `false` |
| `images[]` | opsional, maks 5, jpg/jpeg/png/webp maks 2 MB per berkas |
| `images_alt[]` | opsional, sejajar indeks dengan `images[]`, maks 180 |
| `variants[]` | wajib, 1–50 baris: `size` (wajib, dari `ukuran_baku`), `color` (opsional, maks 40), `sku` (opsional, maks 60, unik antar baris), `price_delta` (integer, bawaan 0), `stock` (integer ≥ 0, bawaan 0), `is_active` (bawaan `true`) |

Form unggah memakai `POST` + `_method=PUT` untuk update. Varian tanpa `sku` diberi SKU otomatis
`{sku-produk}-{ukuran}-{warna}`. `stock` awal varian dicatat sebagai `stock_movements` tipe `in`.

### 12.4 GET `/admin/produk/{product}` — `admin.products.show` — `Admin/Products/Show`

Props `produk` (bentuk **detail** di bawah), `ukuran_baku`, `ringkasan` =
`{"varian_total": 3, "stok_total": 24, "stok_kritis": 1, "terjual": 12}`.
Bentuk detail `produk` (= `produk` pada §12.5):

```json
{
  "id": 3, "name": "…", "slug": "…", "sku": "…", "category_id": 1,
  "category": {"id": 1, "name": "Daster", "slug": "daster"},
  "short_description": null, "description": null, "weight_gram": 300,
  "base_price": 85000, "compare_price": 99000, "wholesale_price": 75000, "min_wholesale_qty": 6,
  "is_active": true, "is_featured": false, "stock": 24, "variant_count": 3,
  "url": "/produk/daster-batik-pekalongan",
  "created_at": "…", "updated_at": "…",
  "images": [{"id": 7, "path": "…", "alt": "…", "is_primary": true, "sort_order": 0}],
  "variants": [{"id": 12, "size": "L", "color": "Hitam", "sku": "DSR-BTK-01-L-HITAM",
                "label": "L / Hitam", "price_delta": 0, "stock": 10, "is_active": true}]
}
```

### 12.5 GET `/admin/produk/{product}/ubah` — `admin.products.edit` — `Admin/Products/Edit`

Props: `produk` (detail, §12.4), `kategori`, `ukuran_baku`.

### 12.6 PUT `/admin/produk/{product}` — `admin.products.update`

Aturan sama dengan §12.3, kecuali: `slug`/`sku` unik kecuali milik produk itu sendiri, dan
tambahan `hapus_images[]` (id gambar milik produk ini) serta `primary_image_id` (id gambar
milik produk ini; bila kosong gambar utama tetap/tidak berubah). Varian: baris berisi `id`
diperbarui (harus varian produk ini), baris tanpa `id` dibuat baru, varian lama yang tidak
dikirim dihapus bila belum pernah masuk pesanan atau dinonaktifkan bila sudah. Perubahan
`stock` varian lewat form dicatat sebagai `stock_movements` tipe `adjust` (selisih).
Redirect sukses: `admin.products.index` + `flash.success` = `Produk diperbarui.`

### 12.7 DELETE `/admin/produk/{product}` — `admin.products.destroy`

Berkas galeri dihapus dari disk. Redirect: `admin.products.index` + `flash.success` =
`Produk dihapus.`

### 12.8 GET `/admin/kategori` — `admin.categories.index` — `Admin/Categories/Index`

Query: `q` (nama/slug), `status` ∈ `semua`(bawaan)|`aktif`|`nonaktif`, `page`. Urut
`sort_order`, lalu `name`.

```json
{
  "kategori": {"data": [{
    "id": 1, "name": "Daster", "slug": "daster", "description": null,
    "image": "/images/seed/kategori/daster.png",
    "sort_order": 1, "is_active": true, "product_count": 3,
    "created_at": "…", "updated_at": "…"
  }], "links": ["…"], "meta": {"current_page": 1, "last_page": 1, "per_page": 15, "total": 5}},
  "filter": {"q": null, "status": "semua"},
  "ringkasan": {"total": 5, "aktif": 5, "nonaktif": 0}
}
```

Catatan frontend: **tidak ada** rute GET `admin/kategori/tambah` maupun `.../ubah` (PRD §5.2
tidak memintanya). Form tambah/ubah kategori dikerjakan inline di halaman ini; tombol
`/admin/kategori/tambah` pada placeholder harus diganti.

### 12.9 POST `/admin/kategori` — `admin.categories.store`
### 12.10 PUT `/admin/kategori/{category}` — `admin.categories.update`

Field: `name` (wajib, maks 120), `slug` (opsional, unik; dibuat dari nama bila kosong),
`description` (opsional, maks 1000), `image` (opsional, jpg/jpeg/png/webp maks 2 MB),
`sort_order` (integer 0–999, bawaan 0), `is_active` (boolean, bawaan `true`).
Galat: `errors.name`, `errors.slug`, `errors.image`, `errors.sort_order`.
Redirect: `admin.categories.index`; `flash.success` = `Kategori disimpan.` /
`Kategori diperbarui.`

### 12.11 DELETE `/admin/kategori/{category}` — `admin.categories.destroy`

Menolak bila masih dipakai produk: `errors.kategori` = `Kategori masih dipakai 3 produk —
pindahkan atau hapus produknya dulu.` Sukses: redirect `admin.categories.index` +
`flash.success` = `Kategori dihapus.`

### 12.12 GET `/admin/stok` — `admin.stocks.index` — `Admin/Stocks/Index`

Query: `q` (nama produk/SKU varian), `status` ∈ `semua`(bawaan)|`habis`|`kritis` (`kritis`
berarti stok < 5, termasuk habis), `kategori` (id), `urut` ∈ `nama`(bawaan)|`stok_terkecil`|
`stok_terbesar`, `page`. Baris = **varian**.

```json
{
  "stok": {"data": [{
    "id": 12, "product": {"id": 3, "name": "…", "slug": "…"},
    "size": "L", "color": "Hitam", "label": "L / Hitam", "sku": "DSR-BTK-01-L-HITAM",
    "stock": 3, "is_active": true, "status": "kritis",
    "updated_at": "…"
  }], "links": ["…"], "meta": {"current_page": 1, "last_page": 1, "per_page": 15, "total": 36}},
  "filter": {"q": null, "status": "semua", "kategori": null, "urut": "nama"},
  "kategori": [{"id": 1, "name": "Daster", "slug": "daster"}],
  "ringkasan": {"varian": 36, "habis": 2, "kritis": 5}
}
```

`status` baris: `habis` (0), `kritis` (1–4), `aman` (≥ 5). `kategori` = daftar ringkas
kategori untuk dropdown filter (urut `sort_order`, lalu `name`).
Aksi stok masuk/keluar — galat: `errors.qty` (`Jumlah wajib diisi.`, `Jumlah minimal 1.`,
`Stok tidak cukup — stok saat ini 3.`), `errors.note`. Sukses: kembali ke halaman asal +
`flash.success` = `Stok masuk dicatat.` / `Stok keluar dicatat.`

### 12.13 POST `/admin/stok/{variant}/masuk` — `admin.stocks.in`
### 12.14 POST `/admin/stok/{variant}/keluar` — `admin.stocks.out`

Field: `qty` (wajib, integer 1–100000), `note` (opsional, maks 255). Menulis satu
`stock_movements` (`in`/`out`) dengan `admin_id` petugas; stok varian naik/turun dalam
transaksi dengan kunci baris.

### 12.15 GET `/admin/stok/riwayat` — `admin.stocks.history` — `Admin/Stocks/History`

Query: `q` (nama produk/SKU/catatan), `tipe` ∈ `semua`(bawaan)|`in`|`out`|`adjust`|`sale`,
`varian` (id varian), `page`.

```json
{
  "riwayat": {"data": [{
    "id": 91, "product_name": "…", "variant_label": "L / Hitam", "variant_sku": "…",
    "type": "in", "tipe_label": "Stok masuk", "qty": 10, "signed_qty": 10, "note": "Restock",
    "admin": {"id": 1, "name": "Owner"}, "created_at": "…"
  }], "links": ["…"], "meta": {"current_page": 1, "last_page": 1, "per_page": 15, "total": 120}},
  "filter": {"q": null, "tipe": "semua", "varian": null},
  "varian": [{"id": 12, "label": "L / Hitam", "product_name": "…"}],
  "ringkasan": {"masuk": 120, "keluar": 8, "adjust": 2, "sale": 41}
}
```

`signed_qty` = `qty` bertanda (`in` positif; `out`/`sale` negatif; `adjust` mengikuti selisih).
`varian` untuk dropdown filter, maks 200 varian urut nama produk.

### 12.16 GET `/admin/pesanan` — `admin.orders.index` — `Admin/Orders/Index`

Query: `q` (kode/nama/telepon/email), `status` ∈ `semua`(bawaan)|`pending`|`dibayar`|
`diproses`|`dikirim`|`selesai`|`batal`, `bayar` ∈ `semua`(bawaan)|`pending`|`settlement`|
`expire`|`deny`|`cancel`, `kirim` ∈ `semua`(bawaan)|`belum`|nilai `orders.shipping_status`
yang ada di data (mis. `confirmed`, `delivered`), `dari`, `sampai` (`YYYY-MM-DD`), `page`.
Urut `created_at` turun.

```json
{
  "pesanan": {"data": [{
    "id": 5, "code": "TK-20261020-0001", "status": "dibayar", "status_label": "Dibayar",
    "payment_status": "settlement", "payment_label": "Lunas", "payment_method_label": "QRIS",
    "customer_name": "Siti", "customer_phone": "0812…", "customer_email": "siti@contoh.id",
    "total": 175000, "items_count": 2,
    "courier_name": "JNE", "service_name": "REG", "tracking_number": "JX1234567890",
    "shipping_status": "confirmed", "shipping_status_label": "Dikonfirmasi",
    "shipping_updated_at": "2026-10-20T15:02:00+07:00", "shipping_perlu_tindakan": false,
    "mode_uji": false,
    "paid_at": "…", "created_at": "…", "url": "/admin/pesanan/5"
  }], "links": ["…"], "meta": {"current_page": 1, "last_page": 1, "per_page": 15, "total": 12}},
  "filter": {"q": null, "status": "semua", "bayar": "semua", "kirim": "semua",
             "dari": null, "sampai": null},
  "filter_opsi": {"kirim": [{"value": "semua", "label": "Semua"},
                            {"value": "belum", "label": "Belum ada status"},
                            {"value": "confirmed", "label": "Dikonfirmasi"}]},
  "ringkasan": {"total": 12, "pending": 2, "dibayar": 3, "diproses": 1, "dikirim": 1, "selesai": 4, "batal": 1}
}
```

| Key | Aturan |
|---|---|
| `payment_label` | label status bayar Indonesia (`Order::paymentLabel()`) |
| `payment_method_label` | label kanal bayar dari `orders.payment_method` lewat `Order::paymentMethodLabel()` — sumber sama dengan §12.17; `Midtrans` bila kanal belum terpilih, **bukan** id mentah (`qris`, `bca_va`, …) |
| `courier_name`, `service_name` | nama layanan tersimpan (`settings.shipping_couriers`) untuk `shipping_courier:shipping_service`; bila tidak ada, kode mentah huruf besar; `null` bila kurir/layanan kosong |
| `tracking_number` | `orders.tracking_number` (`—` bila null); sumber sama dengan §12.18a/§12.25 |
| `shipping_status`, `shipping_status_label` | `orders.shipping_status` + label Indonesia (`BiteshipService::shippingLabel()`); `null` bila belum ada resi otomatis |
| `shipping_updated_at` | `orders.shipping_updated_at` ISO 8601 — waktu payload webhook Biteship terakhir diproses; `null` bila belum pernah |
| `shipping_perlu_tindakan` | `true` bila status kurir bermasalah (`cancelled`/`rejected`/`returned`/`disposed`/`on_hold`) pada pesanan yang belum `batal`/`selesai`, **atau** selisih ongkir ≠ 0 (`BiteshipService::shippingPerluTindakan()`); dipakai penanda baris |
| `mode_uji` | `true` bila `payment` adalah tagihan uji (`MidtransService::isFakeCharge()`) atau `shipping_payload.mode_uji` |
| `filter.kirim` | nilai tak dikenal/`semua` → tanpa filter; `belum` → `shipping_status` null |
| `filter_opsi.kirim` | opsi dropdown: `semua`, `belum`, lalu nilai `shipping_status` yang benar-benar ada (label dari `shippingLabel()`) |


### 12.17 GET `/admin/pesanan/{order}` — `admin.orders.show` — `Admin/Orders/Show`

```json
{
  "pesanan": {
    "id": 5, "code": "TK-20261020-0001", "status": "dibayar", "status_label": "Dibayar",
    "payment_status": "settlement", "payment_label": "Lunas",
    "subtotal": 170000, "shipping_cost": 5000, "discount": 0, "total": 175000,
    "payment_method": "qris", "payment_method_label": "QRIS", "notes": null,
    "tracking_number": "JX1234567890", "mode_uji": false,
    "customer": {"name": "…", "phone": "…", "email": "…", "address": "…", "city": "…", "postal_code": "…"},
    "items": [{"id": 9, "product_id": 3, "product_name": "…", "variant_label": "L / Hitam",
               "qty": 2, "unit_price": 85000, "line_total": 170000}],
    "shipping": {
      "courier_code": "jne", "courier_name": "JNE", "service_name": "REG",
      "etd": "2-3 hari", "weight_gram": 600, "shipping_cost": 5000,
      "tracking_number": "JX1234567890", "status": "confirmed", "status_label": "Dikonfirmasi",
      "biteship_order_id": "BS-123",
      "updated_at": "2026-10-20T15:02:00+07:00",
      "driver": {"name": "Budi", "phone": "081234567891", "link": "https://track.contoh.id/BS-123"},
      "perlu_tindakan": true,
      "tindakan": "Ongkir aktual berbeda dari ongkir tagihan. Periksa selisih ongkir pesanan ini.",
      "price_final": 8000, "price_selisih": 3000,
      "webhook_terakhir": {"event": "order.price", "order_id": "BS-123", "price": 8000},
      "galat": null
    },
    "payment": {"provider": "midtrans", "status": "settlement", "transaction_id": "…",
                "metode": {"id": "bca_va", "label": "Transfer BCA Virtual Account", "grup": "va"},
                "instruksi": {"jenis": "va", "nomor_va": "…", "bank": "bca",
                              "biller_code": null, "bill_key": null, "payment_code": null,
                              "store": null, "qr_url": null, "qr_string": null},
                "payment_type": "bca_va", "fake": false,
                "gross_amount": 175000, "expires_at": "…", "paid_at": "…"},
    "timeline": {"created_at": "…", "paid_at": "…", "shipped_at": null},
    "created_at": "…", "paid_at": "…"
  }
}
```

`payment` = `null` bila belum ada baris pembayaran.
`tracking_number` = nomor resi kurir yang diisi manual admin (PRD A15); `null` bila belum diisi.
Status pesanan **tidak bisa diubah manual**: hanya Midtrans (settlement → `dibayar`, expire/deny/cancel
→ `batal`) dan webhook Biteship (PRD-v1.3 §2.3, PRD-v1.4 §3). Tidak ada prop `status_berikut`.

| Key | Aturan |
|---|---|
| `payment.metode` | `{id,label,grup}` dari `MidtransService::channelOf()`; `null` bila kanal belum dipilih |
| `payment.instruksi` | bentuk §7.7 — semua key selalu ada, yang tidak relevan `null`; `null` bila kanal belum dipilih |
| `payment.payment_type` | id kanal mentah (mis. `bca_va`) untuk keperluan debug; **bukan** label tampilan |
| `payment.fake` | `true` bila tagihan uji (`MidtransService::isFakeCharge()`), dipakai badge `Mode uji` panel pembayaran |
| `shipping` | selalu ada (bukan `null`); field tanpa data = `null` — sumber `orders.shipping_*`, `tracking_number`, `biteship_order_id`, `shipping_status` |
| `shipping.courier_name`, `shipping.service_name` | nama layanan tersimpan; fallback kode mentah huruf besar; `null` bila kosong (pesanan lama tanpa kurir) |
| `shipping.status_label` | label Indonesia `BiteshipService::shippingLabel()`; `null` bila `status` null |
| `shipping.galat` | alasan tombol `Buat resi otomatis` tidak dapat dipakai saat ini (status bukan `dibayar`/`dikirim`, atau kurir/layanan kosong); `null` bila tombol boleh tampil. Guard final tetap di `BiteshipService` saat POST |
| `shipping.updated_at` | `orders.shipping_updated_at` ISO 8601 — waktu payload webhook terakhir diproses; `null` bila belum ada |
| `shipping.driver` | `{name, phone, link}` dari payload terakhir (`courier_driver_name`, `courier_driver_phone`, `courier_link`); tiap field boleh `null`; seluruh objek `null` bila tidak ada isinya |
| `shipping.perlu_tindakan` | `true` bila status kurir bermasalah pada pesanan yang belum `batal`/`selesai`, atau `price_selisih` ≠ 0. Sumber sama dengan baris §12.16 |
| `shipping.tindakan` | pesan siap tampil saat `perlu_tindakan` (`Kurir membatalkan pengiriman.`, `Kurir menolak paket.`, `Kurir melaporkan paket dikembalikan.`, `Kurir melaporkan paket dibuang.`, `Kurir menahan paket sementara.`, `Ongkir aktual berbeda dari ongkir tagihan. Periksa selisih ongkir pesanan ini.`); `null` bila tidak perlu tindakan. Sejak v1.4 pesan status kurir **tanpa** ajakan ubah status (kontrol itu dihapus, QA-14-03); penutup `Periksa selisih ongkir pesanan ini.` hanya menempel pada pesan selisih ongkir |
| `shipping.price_final` | `price` payload hanya bila payload terakhir `event = order.price`; `null` bila payload terakhir event lain atau belum ada |
| `shipping.price_selisih` | `price_final - orders.shipping_cost` (integer, boleh negatif); `null` bila `price_final` null |
| `shipping.webhook_terakhir` | payload JSON terakhir apa adanya (`orders.shipping_webhook_payload`), untuk debug; `null` bila belum ada |
| `shipping.events` | riwayat event webhook Biteship dari `orders.shipping_events` (PRD-v1.4 §4.1): daftar `{status, label, at}`, **terbaru → terlama**, maksimum 50 entri tersimpan; `status`/`label` `null` bila payload tanpa status, `at` ISO 8601; `[]` bila belum ada event (bukan `null`) |
| `mode_uji` | `true` bila `payment.fake` atau `shipping_payload.mode_uji` |
| `timeline.shipped_at` | `orders.shipped_at`, diisi saat webhook Biteship memajukan status ke `dikirim` (PRD-v1.3 §2.3); `null` bila belum pernah dikirim |


### 12.18 (dihapus v1.4) ~~PATCH `/admin/pesanan/{order}/status`~~

Rute, controller, FormRequest, dan prop `status_berikut` dihapus di v1.4 (PRD-v1.4 §3).
Status pesanan hanya berubah lewat Midtrans dan webhook Biteship. Permintaan ke rute lama
membalas 404. Pengembalian stok saat batal kini hanya lewat jalur Midtrans (`MidtransService`).

### 12.18a PATCH `/admin/pesanan/{order}/resi` — `admin.orders.resi`

Field: `tracking_number` (opsional, teks, maks 60; kosong/`null` = menghapus nomor resi).
Galat: `errors.tracking_number` (`Nomor resi maksimal 60 karakter.` /
`Nomor resi harus berupa teks.`). Efek: hanya `orders.tracking_number` yang berubah — status
pesanan, stok, dan pembayaran tidak tersentuh; tanpa email/notifikasi.
Sukses: kembali ke halaman asal + `flash.success` = `Nomor resi pesanan diperbarui.`

Dasar: PRD A15 (nomor resi diisi manual di detail pesanan). Rute ini bukan fitur baru,
melainkan cara teknis memenuhi A15; PRD §5.2/§6 belum memuatnya — amendemen diusulkan ke
pemilik di `docs/pertanyaan-pemilik.md` §3 Q8 (tidak memblokir). Keputusan: `docs/keputusan-a15-resi.md`.

### 12.24 PATCH `/admin/pesanan/{order}/sinkron-pembayaran` — `admin.orders.sinkron-pembayaran`

Field: tidak ada (tanpa body). Mengakses: admin dengan middleware sama seperti §12.18a
(`admin` + `throttle:admin-write`); tamu/pembeli diarahkan ke `/admin/login`.

Perilaku: admin menarik status transaksi terakhir langsung dari Midtrans untuk pesanan ini
(webhook tidak bisa masuk ke localhost), lalu menerapkannya lewat `MidtransService` yang sama
dengan webhook — tidak ada penulisan langsung ke `payments`/`orders`/stok dari controller.
Status pesanan dan stok ikut berubah mengikuti status transaksi (`applyStatus()` yang sudah ada,
PRD §7.2 butir 7): `settlement` → `payment_status` = `settlement` + order `pending` menjadi
`dibayar` + `paid_at` diisi; `expire`/`deny`/`cancel` → order `pending` menjadi `batal` dan stok
item dikembalikan lewat `stock_movements` tipe `in`; status final bersifat final (tidak pernah
mundur, idempoten).

Tanpa panggilan API (petunjuk untuk admin, bukan kegagalan server):

- pesanan belum punya baris `payments` → `flash.error` = `Pesanan ini belum punya tagihan
  pembayaran, jadi status tidak bisa disinkronkan.`
- tagihan mode uji (`isFake()` aktif atau `isFakeCharge()`) → `flash.error` = `Mode uji Midtrans:
  status tidak bisa disinkronkan.`
- `payment_status` sudah `settlement` → `flash.success` = `Pembayaran sudah lunas, sinkronisasi
  tidak perlu dijalankan.`

Sukses (panggilan API berhasil): kembali ke halaman asal. `flash.success` =
`Status pembayaran diperbarui dari <label lama> ke <label baru>.` bila berubah, atau
`Status pembayaran tidak berubah: <label sekarang>.` bila tidak berubah (pembungkus flash tetap
key `success` — tidak ada key flash baru; frontend §F8 menampilkan `flash.success`/`flash.error`).

Galat: gagal menghubungi Midtrans → `flash.error` = `Gagal memeriksa status pembayaran. Coba
lagi.` (bukan 500), status tersimpan tidak berubah. Setiap panggilan sukses menulis satu baris
`Log::info` berisi kode pesanan + status pembayaran/status pesanan lama→baru; tanpa kredensial,
token, atau isi payload Midtrans.

### 12.19 GET `/admin/akun` — `admin.accounts.index` — `Admin/Accounts/Index`

Query: `q` (nama/email), `role` ∈ `semua`(bawaan)|`owner`|`admin`|`staff`, `status` ∈
`semua`(bawaan)|`aktif`|`nonaktif`, `page`. Urut `owner`, `admin`, `staff`, lalu `name`.

```json
{
  "akun": {"data": [{"id": 1, "name": "Owner Toko", "email": "owner@tokokulot.test",
    "role": "owner", "is_active": true, "is_self": true, "created_at": "…"}],
    "links": ["…"], "meta": {"current_page": 1, "last_page": 1, "per_page": 15, "total": 3}},
  "filter": {"q": null, "role": "semua", "status": "semua"},
  "ringkasan": {"total": 3, "owner": 1, "admin": 1, "staff": 1, "aktif": 3}
}
```

### 12.20 POST `/admin/akun` — `admin.accounts.store`

Field: `name` (wajib, maks 120), `email` (wajib, email, unik, maks 190), `password` (wajib,
min 8), `role` ∈ `owner|admin|staff`, `is_active` (boolean, bawaan `true`).
Galat: `errors.name`, `errors.email`, `errors.password`, `errors.role`.
Redirect: `admin.accounts.index` + `flash.success` = `Akun admin disimpan.`

### 12.21 PUT `/admin/akun/{admin}` — `admin.accounts.update`

Sama dengan §12.20, kecuali `password` opsional (diganti bila diisi) dan `email` unik kecuali
milik akun itu. Penolakan (lewat `errors.role` / `errors.is_active`):
`Tidak bisa menonaktifkan akun sendiri.`, `Tidak bisa mengubah role akun sendiri.`,
`Minimal satu owner aktif harus ada.` Sukses: `flash.success` = `Akun admin diperbarui.`

### 12.22 DELETE `/admin/akun/{admin}` — `admin.accounts.destroy`

Penolakan: `errors.akun` = `Tidak bisa menghapus akun sendiri.` /
`Minimal satu owner aktif harus ada.` Sukses: `flash.success` = `Akun admin dihapus.`
(`stock_movements.admin_id` menjadi `null` — riwayat stok tetap utuh.)

### 12.23 Status
| Bagian | Status |
|---|---|
| 12.1–12.7 Produk | DRAFT |
| 12.8–12.11 Kategori | DRAFT |
| 12.12–12.15 Stok | DRAFT |
| 12.16–12.18a Pesanan | DRAFT |
| 12.16/12.17 — key **baru** `shipping_updated_at`, `shipping_perlu_tindakan` (baris) dan `shipping.updated_at`/`driver`/`perlu_tindakan`/`tindakan`/`price_final`/`price_selisih`/`webhook_terakhir` (detail); key lama tidak berubah | **DRAFT** (25 Okt 2026, kartu `t_5a702574`, PRD-v1.3 §2.6) |
| 12.19–12.22 Akun | DRAFT |

---

### 12.25 POST `/admin/pesanan/{order}/resi` — `admin.orders.resi-otomatis`

Akses: admin login + `throttle:admin-write` (sama seperti §12.18a). Tanpa body. Membuat resi
lewat Biteship Create Order (`POST {biteship.base_url}/v1/orders`, timeout **15 detik**) —
melengkapi, bukan mengganti §12.18a (PATCH tetap untuk input nomor resi manual). Dasar:
PRD-v1.2 §8 (F7).

```json
{"flash": {"success": "Resi dibuat: JX1234567890.", "error": null}}
```

Guard (semua tanpa panggilan API; hasilnya `flash.error`, tidak ada kolom berubah):

| Kondisi | Pesan |
|---|---|
| status bukan `dibayar`/`dikirim` | `Resi otomatis hanya untuk pesanan berstatus Dibayar atau Dikirim. Pesanan ini masih <label>.` |
| `shipping_courier`/`shipping_service` kosong | `Pesanan ini belum menyimpan kurir/layanan pengiriman. Buat resi manual atau pilih kurir saat checkout.` |
| setting asal kurang (`shipping_origin_name`, `shipping_origin_phone`, `shipping_origin_address`, `shipping_origin_postal_code`, `contact_email`) | `Pengaturan asal pengiriman belum lengkap: <daftar field>. Lengkapi di halaman Ekspedisi/Pengaturan, lalu coba lagi.` |
| Biteship menolak / jaringan gagal | `Resi otomatis gagal: <pesan Biteship>` (timeout/gagal hubungi: `Resi otomatis gagal: Biteship tidak bisa dihubungi. Coba lagi.`) |

Idempoten: `orders.biteship_order_id` sudah terisi → **tidak ada panggilan API**, kembali ke
halaman asal dengan `flash.success` = `Resi pesanan ini sudah dibuat: <nomor resi>.`
Sukses: menulis `biteship_order_id` (maks 60), `tracking_number` = `courier.waybill_id` ?:
`courier.tracking_id`, `shipping_status` = `status` jawaban Biteship (maks 30), `shipping_payload`
(json utuh + `mode_uji` boolean); redirect kembali + `flash.success` = `Resi dibuat: <nomor resi>.`
Bila Biteship tidak mengirim `waybill_id`/`tracking_id`, kolom resi tetap kosong dan
`flash.success` = `Resi dibuat, tetapi nomor resi belum tersedia dari Biteship. Periksa dashboard Biteship.`
Payload dikirim: shipper = setting asal + `contact_email`, destination = alamat/customer pesanan,
`courier_company` = `shipping_courier`, `courier_type` = `shipping_service`,
`delivery_type = "now"`, item = order items (berat `products.weight_gram` × qty, fallback
300 g/item).

Mode uji (tanpa `BITESHIP_API_KEY`): tidak ada panggilan jaringan; payload disimpan dengan
`mode_uji: true` dan nomor resi `FAKE-<kode pesanan>`.

## 13. Riwayat pesanan pembeli `GET /history` — name `history.index` (Perbaikan 5)

Sumber kewajiban: `docs/rencana-perbaikan-5.md` baris 1 (laporan pemilik 5). Rute ini tambahan
di luar tabel rute PRD §5.1 — tidak ada rute PRD lain yang berubah. Ditulis kartu `t_5b803c80`
(backend); dikonsumsi kartu `t_326f766b` (frontend, komponen `Public/History`) dan QA
`t_9376b7dd`.

Akses: **wajib login guard `web`**. Tamu → redirect `/login` (middleware `auth:web` menyimpan
intended URL). Props hanya berisi pesanan milik user login (`orders.user_id` = user); pesanan
pembeli lain tidak pernah ikut, dan tidak ada parameter `user_id` dari klien.

Urutan: `created_at` terbaru dulu, `id` terbaru sebagai pemecah seri. **Semua status**
(`pending`, `dibayar`, `diproses`, `dikirim`, `selesai`, `batal`) tampil bila tanpa filter.

Filter (v1.5): query `?status=` menerima satu nilai dari `Order::STATUS_FLOW`
(`pending`, `dibayar`, `diproses`, `dikirim`, `selesai`) atau `batal`; hanya pesanan berstatus itu
yang dikirim. Nilai asing/kosong/berulang (`?status[]=`) **diabaikan** → tampil semua. Prop
`filter: {status: string|null}` selalu ada, `null` bila tidak memfilter. Paginator memakai
`withQueryString()` sehingga `status` ikut di `links` halaman berikutnya; `ringkasan` **tidak**
ikut filter (tetap seluruh pesanan user). Pagination 10 pesanan per halaman; `page` di luar
rentang diabaikan paginator Laravel (kembali ke halaman yang sah).

```json
{
  "orders": {
    "data": [
      {
        "id": 42,
        "code": "TK-20261023-0001",
        "status": "batal",
        "status_label": "Batal",
        "payment_status": "expire",
        "payment_label": "Kedaluwarsa",
        "subtotal": 340000,
        "shipping_cost": 20000,
        "discount": 0,
        "total": 360000,
        "items_count": 1,
        "total_qty": 4,
        "created_at": "2026-10-23T09:00:00+07:00",
        "paid_at": null,
        "detail_url": null,
        "customer": {
          "name": "Siti Aminah",
          "phone": "081234567890",
          "address": "Jl. Melati 12",
          "city": "Pekalongan",
          "postal_code": "51100"
        },
        "shipping": {
          "courier_code": "jne",
          "courier_name": "JNE",
          "service_name": "REG",
          "etd": "2-3 hari",
          "tracking_number": "JX1234567890",
          "status": "confirmed",
          "status_label": "Dikonfirmasi",
          "biteship_order_id": "BS-123",
          "updated_at": "2026-10-21T09:15:00+07:00",
          "driver": { "name": "Budi", "phone": "081234567891", "link": "https://track.contoh.id/BS-123" },
          "perlu_tindakan": false,
          "tindakan": null,
          "galat": null
        },
        "timeline": {
          "created_at": "2026-10-23T09:00:00+07:00",
          "paid_at": null,
          "shipped_at": null,
          "completed_at": null
        },
        "items": [
          {
            "id": 91,
            "product_id": 3,
            "variant_id": 7,
            "name": "Daster Batik Pekalongan",
            "variant_label": "Ukuran L / Merah",
            "qty": 4,
            "unit_price": 85000,
            "line_total": 340000,
            "image": "/images/seed/produk/daster-batik-pekalongan-1.png"
          }
        ]
      }
    ],
    "links": [ { "url": null, "label": "…", "active": false } ],
    "meta": { "current_page": 1, "last_page": 1, "per_page": 10, "total": 1 }
  },
  "ringkasan": {
    "total": 1, "pending": 0, "dibayar": 0, "diproses": 0, "dikirim": 0, "selesai": 0, "batal": 1
  },
  "filter": { "status": null }
}
```

| Key | Aturan |
|---|---|
| `orders` | paginator baku (`data`, `links`, `meta`) seperti §12.0; halaman kosong → `data: []`, `total: 0` |
| `orders.data[].status_label` | `Order::statusLabel()` — `Pending`, `Dibayar`, `Diproses`, `Dikirim`, `Selesai`, `Batal` |
| `orders.data[].payment_label` | `Order::paymentLabel()` — label `payment_status`, mis. `Kedaluwarsa` |
| `items_count` | jumlah **baris** item pesanan (bukan jumlah qty) |
| `total_qty` | jumlah `qty` seluruh baris item |
| `subtotal`, `shipping_cost`, `discount`, `total` | integer rupiah dari `orders` (rincian biaya panel §9.2) |
| `customer` | snapshot penerima: `name`, `phone`, `address`, `city`, `postal_code`; field kosong `null` |
| `shipping` | kurir/layanan/resi/status pengiriman; semua key selalu ada, tanpa data `null` (bentuk sama §12.17). **`galat` selalu `null` untuk pembeli** — key tetap dikirim agar bentuk sama, tetapi pesan penjaga tombol resi otomatis (bahasa admin §12.17) tidak pernah diisi di riwayat (PRD §9, QA v1.2 B-01/D-05). Sejak v1.3 (PRD-v1.3 §2.6) bentuk pembeli juga memuat `updated_at`, `driver`, `perlu_tindakan`, `tindakan`; `price_final`, `price_selisih`, `webhook_terakhir` **tidak** dikirim ke pembeli |
| `timeline` | `{created_at, paid_at, shipped_at, completed_at}` ISO 8601; `shipped_at` = `orders.shipped_at`, diisi saat status menjadi `dikirim`. `completed_at` (v1.4) = `at` entri `delivered` terakhir di `orders.shipping_events`, atau `orders.shipping_updated_at` bila `status = selesai` tanpa entri `delivered`; `null` bila belum selesai (PRD-v1.4 §4.2) |
| `shipping.events` | `[{status, label, at}]` dari `orders.shipping_events` — `label` = `BiteshipService::shippingLabel()`, `at` ISO 8601, urut **terbaru → terlama**, maks 50; `[]` bila belum ada event. Hanya bentuk pembeli (tanpa `price_final`, `webhook_terakhir`, dsb.) — PRD-v1.4 §4.2 |
| `items[]` | snapshot `order_items` (nama & harga beku). `image` = gambar utama produk saat ini (§3), `null` bila produk/gambar sudah tidak ada; `product_id`/`variant_id` boleh `null` (FK `SET NULL`) |
| `detail_url` | halaman yang bisa dibuka pembeli, atau `null`: `payment_status = settlement` → `/checkout/{id}/selesai` (`checkout.success`); `status = pending` **dan** `payment_status = pending` → `/checkout/{id}/bayar` (`checkout.pay`); selain itu `null` (termasuk `batal`). Tidak ada rute detail pesanan khusus di PRD, jadi `null` bukan galat |
| `ringkasan` | dihitung dari **seluruh** pesanan user, bukan hanya halaman ini; `total` = semua status, lalu jumlah per status (status tanpa pesanan tetap `0`). Tidak ikut `?status=` (v1.5) |
| `filter` | (v1.5) `{status: string|null}` — status yang sedang difilter, `null` bila tanpa filter atau nilai `?status=` asing. Selalu ada |
| `orders.links` | paginator + `withQueryString()` (v1.5): tautan halaman mempertahankan `?status=` yang aktif |
| `created_at`, `paid_at` | ISO 8601 zona proyek, `null` bila kosong |

Galat: tidak ada input tulis; kesalahan validasi tidak ada. Tamu → 302 `/login`.

### 13.1 Status

| Bagian | Status | Dipakai oleh |
|---|---|---|
| §13 | **LOCKED** (23 Okt 2026, kartu `t_5b803c80`); **revisi aditif** 24 Okt 2026 kartu `t_f4a75237` — key baru `subtotal`, `shipping_cost`, `discount`, `customer{}`, `shipping{}`, `timeline{}` (permintaan desain-v1.2 K4); key lama tidak berubah/hilang. **Klarifikasi** 24 Okt 2026 kartu `t_6032599a` (QA B-01): `shipping.galat` selalu `null` untuk pembeli — key tetap ada, isi pesan penjaga resi hanya milik admin §12.17 | `t_326f766b` (frontend `Public/History`), QA `t_9376b7dd`, `t_220ba320` |
| §13 — **revisi aditif** `shipping.updated_at`, `shipping.driver`, `shipping.perlu_tindakan`, `shipping.tindakan` (bentuk pembeli, PRD-v1.3 §2.6); juga melengkapi key `shipping.biteship_order_id` yang sudah dikirim kode tetapi belum tertulis di contoh | **DRAFT** (25 Okt 2026, kartu `t_5a702574`) | FE `Public/History`, QA |
| §12.17 + §13 — **revisi aditif v1.4** `shipping.events` (`{status,label,at}`, terbaru dulu, maks 50) dan `timeline.completed_at` di §13 (PRD-v1.4 §4.1–§4.2) | **DRAFT** (26 Okt 2026, kartu `t_f51f8c36`) | FE `Public/History`, `Public/CheckoutSuccess`, QA |
| §12.17 — **klarifikasi** `shipping.tindakan`: pesan status kurir tanpa `Periksa pesanan dan ubah status bila perlu.` (QA-14-03, F12 v1.4). Teks berubah, bentuk key tetap | **DRAFT** (26 Okt 2026, kartu `t_4eb06cea`) | FE `Admin/Orders/Show`, QA |
| §13 + §7.9 — **revisi aditif v1.5**: query `?status=` (nilai sah `Order::STATUS_FLOW` + `batal`, asing diabaikan), prop `filter {status}`, `orders.links` `withQueryString()`, dan `timeline` 4 kunci di `pesanan` halaman selesai. `ringkasan` tetap global; key lama tidak berubah | **DRAFT** (26 Okt 2026, kartu `t_8216e843`) | FE `Public/History`, `Public/CheckoutSuccess`, QA v1.5 |

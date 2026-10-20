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

`settings` hanya memuat key publik. Key sensitif (`midtrans_client_key`,
`midtrans_is_production`) dibaca di server; `midtrans_client_key` boleh dikirim karena
memang dipakai Snap di browser, sedangkan `MIDTRANS_SERVER_KEY` tidak pernah masuk `settings`.

Catatan implementasi (t_a696f5c6): `settings` benar-benar dikirim
`HandleInertiaRequests::publicSettings()` — satu query `settings` per permintaan, nilai
`type=json` di-decode menjadi array/object, dan bila tabel belum dimigrasi hasilnya `{}`
sehingga halaman tetap tampil dengan nilai bawaan frontend.

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
  "newsletter": { "title": "Dapat Info Diskon", "subtitle": "Tinggalkan email Anda.", "button_text": "Kirim" }
}
```
`icon` ∈ `truck` | `refresh` | `qris` | `chat` | `leaf` | `scissors`.

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
| `store_tagline` | umum | text | `Daster & kulot nyaman untuk harian` |
| `header_nav` | header | json | lihat §2 |
| `footer_about` | footer | textarea | ringkasan toko |
| `footer_links` | footer | json | lihat §2 |
| `footer_social` | footer | json | lihat §2 |
| `contact_email` | kontak | text | `halo@tokokulot.test` |
| `contact_phone` | kontak | text | `0812-0000-0001` |
| `contact_whatsapp` | kontak | text | `6281200000001` |
| `contact_address` | kontak | textarea | alamat contoh |
| `contact_map_embed` | kontak | textarea | URL embed peta |
| `landing_hero` | landing | json | lihat §2 |
| `landing_sections` | landing | json | lihat §2 |
| `seo_default_title` | seo | text | judul default |
| `seo_default_description` | seo | textarea | deskripsi default |
| `shipping_cost_default` | pembayaran | text | `20000` (integer rupiah sebagai string) |
| `midtrans_client_key` | pembayaran | text | kosong (diisi pemilik) |
| `midtrans_is_production` | pembayaran | text | `0` |

`shipping_cost_default` dan `midtrans_is_production` disimpan sebagai string di tabel
(`value` bertipe text); server meng-cast ke `int`/`bool` saat memakai.

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

```json
{ "stats": { "orders_total": 0, "orders_pending": 0, "revenue_total": 0, "products_active": 0 } }
```

`revenue_total` = integer rupiah, jumlah `orders.total` berstatus `dibayar`, `diproses`,
`dikirim`, `selesai`. Bentuk `stats` boleh diperluas kartu lanjutan (aditif).

### 6.14 Aturan pemisahan tier (untuk frontend)

- Pembeli yang membuka `/admin*` → redirect `admin.login` (middleware `EnsureAdmin`).
- Admin tidak punya sesi pembeli; membuka `/login` tetap menampilkan form pembeli.
- Kedua sesi hidup berdampingan (guard berbeda = kunci sesi berbeda).

### 6.15 Status

| Bagian | Status | Dipakai oleh |
|---|---|---|
| §6.1–§6.9 (auth pembeli) | DRAFT | K12, K13 |
| §6.10–§6.13 (auth + dashboard admin) | DRAFT | K13 |

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
  "shipping_cost": 20000,
  "total": 360000,
  "is_empty": false
}
```

- `unit_price` = `products.base_price` (atau `wholesale_price` bila `qty >= min_wholesale_qty`)
  **+ `product_variants.price_delta`**; dihitung ulang setiap qty berubah.
- `variant_label` = gabungan nilai `variant_attributes` (mis. `"Ukuran L / Merah"`), `null` bila tanpa varian.
- `image` = gambar utama (`product_images.is_primary`), bentuk path absolut (§3), `null` bila tidak ada.
- `shipping_cost` = `settings.shipping_cost_default` (integer, `0` bila key tidak ada).
- `stock` = stok varian saat ini (0 bila tanpa varian).
- `is_active` = `products.is_active` dan `product_variants.is_active`.

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
  "prefill": {
    "customer_name": "Siti Aminah",
    "customer_phone": "081234567890",
    "customer_email": "siti@example.com",
    "customer_address": "Jl. Melati 12",
    "customer_city": "Pekalongan",
    "customer_postal_code": "51111",
    "note": null
  },
  "pembayaran": { "method": "qris", "label": "QRIS (semua e-wallet & m-banking)", "expiry_minutes": 15 },
  "midtrans": { "client_key": null, "is_production": false, "fake": true }
}
```

`prefill` diisi dari akun pembeli (nama, email, `users.phone`), field lain `null`.

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
| `note` | opsional, string, maks 500 | `Catatan maksimal 500 karakter.` |

Sukses: order `status = pending`, `payment_status = pending`, `payment_method = qris`,
`orders.code` = `TK-YYYYMMDD-NNNN` (urut per hari), stok terpotong + `stock_movements` tipe `sale`,
`payments` QRIS dibuat, keranjang dikosongkan, lalu
`redirect()->route('checkout.pay', $order)` + `flash.success` = `Pesanan dibuat. Selesaikan pembayaran QRIS.`

Gagal (stok berubah / Midtrans error) → **tidak ada order setengah jadi** (transaksi di-rollback):
`redirect()->back()` + `flash.error` = `Stok {nama varian} tersisa {n}. Perbarui keranjang.` atau
`Gagal membuat pembayaran QRIS. Coba lagi.`

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
    "method": "qris", "label": "QRIS", "provider": "midtrans",
    "status": "pending", "gross_amount": 360000, "qr_string": "00020101021226...6304A1B2",
    "qris_url": null, "expires_at": "2026-10-20T14:20:00+07:00", "paid_at": null,
    "fake": true
  },
  "midtrans": { "client_key": null, "is_production": false, "fake": true }
}
```

`pembayaran.status`: `pending` | `settlement` | `expire` | `deny` | `cancel`.
`qris_url` hanya terisi di mode Midtrans asli; frontend merender QR dari `qr_string` bila `qris_url` null.

### 7.8 `GET /checkout/{order}/status` — name `checkout.status` (JSON)

Akses: pemilik order (lain → 404). Polling ringan untuk `QrisPanel` (design §4.4).

```json
{ "status": "pending", "paid_at": null, "expires_at": "2026-10-20T14:20:00+07:00" }
```

`status` = status pembayaran. Bila masih `pending` dan bukan mode fake, server menanyakan status
ke Midtrans sekali (best effort; gagal → tetap `pending`, tanpa 500).

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
    "items": [
      { "product_id": 3, "name": "Daster Batik Pekalongan", "variant_label": "Ukuran L / Merah",
        "qty": 4, "unit_price": 85000, "line_total": 340000,
        "image": "/images/seed/produk/daster-batik-pekalongan-1.png" }
    ]
  },
  "ulasan": { "boleh": true, "sudah": [] }
}
```

`ulasan.boleh` = order sudah `settlement` dan pembeli belum mengulas semua produk.
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
5. `settlement`: `payments.paid_at` diisi, `orders.payment_status = settlement`,
   `orders.status` `pending` → `dibayar`.
6. `expire`/`deny`/`cancel`: `orders.payment_status` ikut, `orders.status` `pending` → `batal`,
   stok dikembalikan (`stock_movements` tipe `in`, catatan `Pengembalian stok — pembayaran {status} ({code})`).
7. Idempoten: notifikasi ulang dengan status yang sama tidak mengubah stok, `paid_at`, atau status.
8. Sukses: **HTTP 200** `{"status":"ok"}`.

### 7.11 Status

| Bagian | Status | Dipakai oleh |
|---|---|---|
| §7.0–§7.9 | **LOCKED** (K8, terverifikasi 21 test) | K13 |
| §7.10 | **LOCKED** (K8) | pemilik toko (URL webhook Midtrans) |

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
| `variants[]` | kartu katalog + detail | `{id, size, color, sku, price_delta, stock, is_active}`, urut ukuran baku lalu `color` lalu `id`; hanya varian `is_active = true`. Kartu katalog ikut mengirim agar tombol tambah tahu produk bervarian wajib dipilih dulu di halaman detail |

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
  "faqs": [ { "id": 1, "question": "…", "answer": "…", "sort_order": 1, "is_active": true } ]
}
```

Nilai kosong dikirim `null`. `type = json` sudah di-decode menjadi objek/array.
`shipping_cost_default` integer, `midtrans_is_production` boolean.
Carousel urut `sort_order`, lalu `id`; FAQ urut `sort_order`, lalu `id` (semua baris, termasuk
`is_active = false`, karena ini halaman admin).

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

Body: `landing_hero` (array) dan `landing_sections` (array). Struktur mengikuti
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
| `landing_sections.newsletter` | `title` (maks 80), `subtitle` (maks 120), `button_text` (maks 40) |

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

---

## 11. Katalog publik (K11)

Tiga rute: `GET /produk`, `GET /produk/{slug}`, `GET /kontak-kami`. Semua publik (tanpa login) dan
memakai props bersama §1. Bentuk kartu produk mengikuti §8.3 termasuk key aditifnya.

### 11.1 `GET /produk` — name `products.index`

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
`expire`|`deny`|`cancel`, `dari`, `sampai` (`YYYY-MM-DD`), `page`. Urut `created_at` turun.

```json
{
  "pesanan": {"data": [{
    "id": 5, "code": "TK-20261020-0001", "status": "dibayar", "status_label": "Dibayar",
    "payment_status": "settlement", "payment_label": "Lunas",
    "customer_name": "Siti", "customer_phone": "0812…", "customer_email": "siti@contoh.id",
    "total": 175000, "items_count": 2,
    "paid_at": "…", "created_at": "…", "url": "/admin/pesanan/5"
  }], "links": ["…"], "meta": {"current_page": 1, "last_page": 1, "per_page": 15, "total": 12}},
  "filter": {"q": null, "status": "semua", "bayar": "semua", "dari": null, "sampai": null},
  "ringkasan": {"total": 12, "pending": 2, "dibayar": 3, "diproses": 1, "dikirim": 1, "selesai": 4, "batal": 1}
}
```

### 12.17 GET `/admin/pesanan/{order}` — `admin.orders.show` — `Admin/Orders/Show`

```json
{
  "pesanan": {
    "id": 5, "code": "TK-20261020-0001", "status": "dibayar", "status_label": "Dibayar",
    "payment_status": "settlement", "payment_label": "Lunas",
    "subtotal": 170000, "shipping_cost": 5000, "discount": 0, "total": 175000,
    "payment_method": "qris", "notes": null,
    "customer": {"name": "…", "phone": "…", "email": "…", "address": "…", "city": "…", "postal_code": "…"},
    "items": [{"id": 9, "product_id": 3, "product_name": "…", "variant_label": "L / Hitam",
               "qty": 2, "unit_price": 85000, "line_total": 170000}],
    "payment": {"provider": "midtrans", "status": "settlement", "transaction_id": "…",
                "qris_url": "…", "qr_string": "…", "gross_amount": 175000,
                "expires_at": "…", "paid_at": "…"},
    "created_at": "…", "paid_at": "…"
  },
  "status_berikut": [{"value": "diproses", "label": "Diproses"}, {"value": "batal", "label": "Batal"}]
}
```

`payment` = `null` bila belum ada baris pembayaran. `status_berikut` = status yang boleh
dipilih dari status sekarang (rantai `pending`→`dibayar`→`diproses`→`dikirim`→`selesai`, plus
`batal` selama belum final; `selesai` dan `batal` tidak punya lanjutan).

### 12.18 PATCH `/admin/pesanan/{order}/status` — `admin.orders.status`

Field: `status` (wajib, salah satu dari `status_berikut`), `note` (opsional, maks 255).
Galat: `errors.status` (`Status pesanan wajib dipilih.`,
`Status pesanan tidak bisa diubah dari Dibayar ke Selesai.`). Efek: status berubah; bila
menjadi `batal` stok semua item dikembalikan lewat `stock_movements` tipe `in` (satu per varian);
bila menjadi `dibayar` dan `paid_at` masih kosong, `paid_at` diisi sekarang. Sukses: kembali ke
halaman asal + `flash.success` = `Status pesanan diperbarui.`

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
| 12.16–12.18 Pesanan | DRAFT |
| 12.19–12.22 Akun | DRAFT |

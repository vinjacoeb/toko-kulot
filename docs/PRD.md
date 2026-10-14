# PRD — toko-kulot (Tahap 1)

Versi 1.0 · Workspace: `C:\Users\LENOVO\Downloads\toko-kulot`

---

## 1. Ringkasan Produk

toko-kulot adalah platform e-commerce fashion untuk meningkatkan penjualan online melalui website resmi, memperluas jangkauan lewat SEO, dan meningkatkan konversi lewat kampanye Meta Ads. Website menyediakan katalog produk, detail produk dan ketersediaan stok, pemesanan dan pembayaran, serta pembelian eceran dan grosir. Platform mendukung pengembangan brand, akuisisi pelanggan baru, dan pembelian ulang lewat pengalaman belanja yang responsif, cepat, dan mudah.

## 2. Tujuan Tahap 1

1. Seluruh **router/halaman** tersedia dan bisa dibuka.
2. **Tampilan** (user, admin, login) selesai lewat slicing dari erigostore.co.id.
3. Database **toko-kulot** ter-migrate dan terisi **seeder lengkap**, sehingga desain bisa dilihat dengan data nyata.
4. **Integrasi backend** dilakukan setelah pemilik menyetujui tampilan (titik berhenti K1).

Bukan tujuan tahap 1: kampanye Meta Ads, konten SEO mendalam, pendaftaran pelanggan mandiri.

## 3. Stack & Lingkungan

| Hal | Keputusan |
|---|---|
| Framework | Next.js (App Router, TypeScript) |
| Styling | SASS (SCSS modules + variabel global) |
| Database | MySQL, nama database `toko-kulot` |
| ORM/migrasi | Prisma (asumsi, lihat bagian 14) |
| Pembayaran | Midtrans, **QRIS saja** |
| Autentikasi | 2 tingkat: `user`, `admin` |
| Lokasi proyek | `C:\Users\LENOVO\Downloads\toko-kulot` (Next.js + SASS diinstal sendiri di sini) |
| Alat kerja | Kanban Hermes agent, computer-use, browser-use |

Alat yang harus dipastikan terpasang (install + konfigurasi bila belum), **hanya untuk agent yang bertugas**:

- **REA (reverse engineering anything)**: `npx rea:agents setup` → untuk duplikasi erigostore.co.id.
- **impeccable** skill.
- **ui-ux-pro-max** skill.
- **computer-use** dan **browser-use**.

## 4. Peran Pengguna

| Peran | Akses |
|---|---|
| Pengunjung | Lihat beranda, produk, kontak kami; checkout |
| User (login) | Login/logout (tanpa daftar; akun dibuat admin), lihat pesanan, beri penilaian |
| Admin | Seluruh dashboard `/admin/*` |

Tidak ada halaman daftar. Akun user dan admin dibuat oleh admin lewat `/admin/akun`.

## 5. Peta Router

### 5.1 Publik / User

| Route | Fungsi |
|---|---|
| `/` | Landing page (carousel, produk unggulan, FAQ, dsb. dari pengaturan) |
| `/produk` | Katalog: filter kategori, pencarian, urutan, paginasi |
| `/produk/[id]` | Detail produk: galeri, varian, stok, harga eceran/grosir, tombol beli |
| `/kontak-kami` | Info kontak, lokasi/peta, formulir pesan (masuk ke `/admin/pesan-masuk`) |
| `/login-user` | Login user |
| `/register-user` | Login user |
| `/logout` | Keluar (aksi, bukan halaman) |
| `/checkout` | Ringkasan pesanan + pembayaran QRIS Midtrans |
| `/pesanan/[kode]` | Status pembayaran + form penilaian setelah checkout |

### 5.2 Admin

| Route | Fungsi |
|---|---|
| `/admin/login` | Login admin |
| `/admin` | Dashboard: monitoring penjualan |
| `/admin/produk` | CRUD produk (varian, gambar, harga eceran/grosir) |
| `/admin/kategori` | CRUD kategori |
| `/admin/stok` | Lihat/ubah stok, riwayat mutasi, peringatan stok menipis |
| `/admin/pesanan` | Daftar & detail pesanan, ubah status, filter |
| `/admin/pesan-masuk` | Pesan dari kontak kami, bisa dibalas |
| `/admin/penilaian` | Penilaian bintang + komentar, bisa dibalas |
| `/admin/pengaturan` | Pengaturan website: isi landing page, carousel, FAQ, header, footer, logo, nama toko, kontak kami, lokasi |
| `/admin/akun` | CRUD akun (tambah user/admin) |

Semua `/admin/*` (kecuali `/admin/login`) dilindungi middleware: hanya role `admin`.

## 6. Kebutuhan Fungsional

### 6.1 Katalog & Produk
- Daftar produk dengan gambar, nama, harga, label stok.
- Detail produk: varian (ukuran/warna), stok per varian, harga eceran dan harga grosir (aturan min. kuantitas grosir, bagian 14).
- Produk habis tidak bisa dibeli.

### 6.2 Checkout & Pembayaran
- Keranjang → checkout (data pembeli: nama, telepon, alamat).
- Pembayaran **Midtrans QRIS saja**; tampilkan QR, polling/webhook status.
- Webhook Midtrans memperbarui status pesanan; stok dikurangi saat pesanan dibuat/dibayar (bagian 14).
- Setelah pembayaran berhasil: tampilkan **penilaian 1–5 bintang + komentar** per pesanan.
- Tahap 1: sandbox Midtrans; mode tampilan dahulu (mock) sebelum integrasi backend.

### 6.3 Autentikasi
- Login user (`/login-user`) dan admin (`/admin/login`) terpisah, sesi aman (cookie httpOnly), password di-hash.
- Tidak ada pendaftaran. Logout tersedia di kedua area.

### 6.4 Dashboard Admin
- Monitoring: total penjualan, jumlah pesanan, produk terlaris, grafik harian/bulanan, stok menipis, rata-rata rating.
- CRUD standar di produk, kategori, akun; stok dan pesanan sesuai fungsi.
- Pesan masuk dan penilaian: daftar, filter belum dibalas, form balasan; balasan tampil di sisi publik untuk penilaian.
- Pengaturan: semua konten situs dikelola dari sini (tidak ditulis keras di kode).

## 7. Kebutuhan Non-Fungsional

- Responsif (mobile-first), cepat (target Lighthouse performa ≥ 85 di mobile).
- SEO dasar: metadata per halaman, `sitemap.xml`, `robots.txt`, URL bersih, Open Graph, data terstruktur produk.
- Aksesibilitas dasar (kontras, label, fokus keyboard).
- Keamanan: validasi input di server, proteksi CSRF/XSS, rate limit login, rahasia hanya di `.env`.
- Bahasa antarmuka: Indonesia. Mata uang: Rupiah.

## 8. Model Data (garis besar)

`users`, `categories`, `products`, `product_variants`, `product_images`, `stock_movements`, `orders`, `order_items`, `payments`, `reviews`, `review_replies`, `messages`, `message_replies`, `site_settings`, `carousel_slides`, `faqs`.

Detail kolom ditentukan backenddeveloper di `docs/` sebelum migrasi, lalu dikonfirmasi techlead.

## 9. Seeder (wajib lengkap di tahap 1)

Seeder harus mengisi: 1 admin + beberapa user, ≥ 6 kategori, ≥ 30 produk dengan varian dan gambar, stok, ≥ 20 pesanan dengan status beragam, ≥ 15 penilaian + sebagian balasan, ≥ 10 pesan masuk, isi pengaturan situs (logo, nama toko, carousel, FAQ, header, footer, kontak, lokasi). Seeder harus idempoten dan bisa dijalankan ulang.

## 10. Desain

- Sumber: duplikasi **erigostore.co.id** (toko Shopify) memakai **REA**; hasil didokumentasikan di `docs/design.md` (token warna, tipografi, spasi, komponen, tata letak per halaman).
- Skill **impeccable** dan **ui-ux-pro-max** dipakai oleh uiux dan frontenddeveloper untuk kualitas visual dan UX.
- Slicing ke Next.js + SASS: komponen reusable, token di variabel SASS.
- Bila PRD dan design bertentangan: **PRD untuk fungsi, design untuk tampilan**; catat di `docs/pertanyaan-pemilik.md`.
- Aset hasil salinan hanya dipakai untuk pengembangan; ganti dengan aset toko-kulot sendiri sebelum rilis (bagian 14).

## 11. Struktur Direktori (acuan)

```
toko-kulot/
├─ docs/            PRD.md, design.md, brief-*.md, ringkasan-tim.md, pertanyaan-pemilik.md
├─ prisma/          schema, migrations, seed
├─ src/
│  ├─ app/          (public), admin/, api/
│  ├─ components/
│  ├─ styles/       SASS (tokens, mixins, globals)
│  └─ lib/
└─ .env             (tidak boleh disentuh selain devops)
```

## 12. Aturan Kerja (wajib, tanpa pengecualian)

1. Semua pekerjaan lewat **kartu Kanban**; tidak ada pekerjaan di luar kartu.
2. Workspace setiap kartu: `workspace_kind='dir'`, `workspace_path='C:/Users/LENOVO/Downloads/toko-kulot'`.
3. Kolom **skills pada kartu selalu kosong**. Skill/MCP dipasang dan dipakai **hanya oleh agent yang bertugas**, bukan techlead, bukan default.
4. **techlead** hanya menulis di `docs/` dan membuat/mengatur kartu. Tidak mengubah kode.
5. Hanya **devops** yang menyentuh `.env`, instalasi paket, server, dan database.
6. Agent hanya mengerjakan peran dan output yang tertulis di kartunya; jangan melebar.
7. Gunakan **computer-use** dan **browser-use** untuk pengamatan dan pengujian; pasang dan konfigurasi bila belum ada.
8. Jangan membuat akun, tombol pendaftaran, atau metode bayar selain QRIS.
9. Perubahan skema DB hanya lewat migrasi; tidak boleh edit database manual.
10. Setiap kartu selesai dengan `kanban_complete` berisi: berkas yang dibuat/diubah, hasil uji, hal yang belum beres.
11. Gunakan `kanban_block` hanya bila: (a) kebutuhan tidak ada di PRD/design, (b) kredensial/akses hilang, (c) dependensi (parent) belum selesai, (d) PRD dan design bertentangan pada hal fungsional. Jelaskan alasan dan apa yang dibutuhkan.
12. Pertanyaan ke pemilik dicatat di `docs/pertanyaan-pemilik.md`; **jangan memblokir** untuk asumsi di bagian 14.
13. Jangan hapus pekerjaan agent lain; konflik diserahkan ke techlead.
14. Commit kecil dan sering (bila git terpasang), pesan commit memuat ID kartu.

## 13. Rencana Kartu Tahap 1 (K1–K16)

| ID | Judul | Assignee | Parent |
|---|---|---|---|
| K1 | Pelajari PRD & design, jelaskan ke agent, buat kartu tahap 1 — **titik berhenti pemilik** | techlead | — |
| K2 | Siapkan lingkungan: Node, MySQL, DB `toko-kulot`, `.env`, browser-use, computer-use | devops | K1 |
| K3 | Inisialisasi Next.js + SASS di workspace, struktur direktori | devops | K2 |
| K4 | Pasang & konfigurasi REA, impeccable, ui-ux-pro-max untuk agent terkait | devops | K2 |
| K5 | REA erigostore.co.id → tulis `docs/design.md` | uiux | K4 |
| K6 | Token desain & komponen dasar (SASS) dari design.md | uiux | K5 |
| K7 | Skema Prisma + migrasi seluruh tabel | backenddeveloper | K3 |
| K8 | Seeder lengkap (bagian 9) | backenddeveloper | K7 |
| K9 | Router + layout + middleware 2 tingkat (stub auth) | frontenddeveloper | K3 |
| K10 | Slicing halaman publik: `/`, `/produk`, `/produk/[id]`, `/kontak-kami`, `/login-user` | frontenddeveloper | K6, K9 |
| K11 | Slicing admin: `/admin/login`, `/admin` dan layout dashboard | frontenddeveloper | K6, K9 |
| K12 | Slicing halaman admin lainnya (produk, kategori, stok, pesanan, pesan-masuk, penilaian, pengaturan, akun) | frontenddeveloper | K11 |
| K13 | Tinjau visual semua halaman dengan data seeder; **pemilik menyetujui tampilan** | qatesting | K8, K10, K12 |
| K14 | API + integrasi backend: auth, CRUD, stok, pesan, penilaian, pengaturan | backenddeveloper | K13 |
| K15 | Checkout Midtrans QRIS (sandbox) + webhook + halaman penilaian | backenddeveloper | K14 |
| K16 | QA menyeluruh (fungsional, responsif, keamanan dasar, SEO dasar) + laporan | qatesting | K15 |

K1 diakhiri dengan laporan ke pemilik; pekerjaan lanjut setelah pemilik menyetujui. K13 adalah gerbang kedua (setujui tampilan sebelum integrasi backend).

## 14. Asumsi (konfirmasi pemilik, tidak memblokir)

| # | Asumsi | Keterangan |
|---|---|---|
| 1 | ORM memakai Prisma | Alternatif: Drizzle/Knex |
| 2 | Auth memakai NextAuth/Auth.js dengan kredensial | Cookie sesi httpOnly |
| 3 | Ongkos kirim tahap 1: tarif flat/manual | Integrasi kurir tahap berikutnya |
| 4 | Aturan grosir: harga grosir berlaku mulai kuantitas minimum per produk | Nilai default diatur di admin |
| 5 | Stok dikurangi saat pesanan dibuat, dikembalikan bila kedaluwarsa/batal | QRIS punya batas waktu |
| 6 | Checkout boleh tanpa login (tamu); user login melihat riwayat | Penilaian dikaitkan ke kode pesanan |
| 7 | Satu penilaian per pesanan (per produk bila memungkinkan) | Dapat diubah |
| 8 | Aset desain dari erigostore dipakai sementara | Ganti aset sendiri sebelum rilis |
| 9 | Midtrans mode sandbox di tahap 1 | Kunci produksi menyusul |
| 10 | Satu bahasa (Indonesia), satu mata uang (IDR) | — |
| 11 | Nama DB persis `toko-kulot` (tanda hubung; dikutip dengan backtick di SQL) | — |
| 12 | Path workspace di contoh kartu (`prj/toko-daster`) diabaikan; dipakai `Downloads/toko-kulot` | — |

## 15. Kriteria Selesai Tahap 1

- Semua route bagian 5 terbuka dan tampil sesuai design.md.
- DB `toko-kulot` ter-migrate dan ter-seed; desain terlihat dengan data nyata.
- Pemilik menyetujui tampilan (K13).
- Login 2 tingkat, CRUD admin, checkout QRIS sandbox, dan penilaian berfungsi (K14–K15).
- Laporan QA K16 tanpa temuan kritis terbuka.

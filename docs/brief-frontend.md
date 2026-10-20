# Brief — frontenddeveloper

Kartu (berurutan): **K10** layout publik + landing → **K11** `/produk`, `/produk/{slug}`, `/kontak-kami` → **K12** auth, keranjang, checkout QRIS, sukses + form rating; **K13** layout admin + dashboard → **K14** CRUD admin.

## Wajib dibaca

- `docs/design.md` **§2** (design token), **§3** (layout global: header 68px, footer, urutan seksi landing), **§4** (inventaris komponen + state), **§5** (layout per halaman, 5.1–5.13), **§6** (motion), **§7** (aturan implementasi), **§9** (checklist kesesuaian).
- `docs/PRD.md` §4.3 (konvensi Inertia & nama route), §5 (rute & nama route persis), §9 (isi wajib tiap halaman admin), §11 (responsif, SEO, aksesibilitas), §12 (R6, R14), §15 poin 6.
- `docs/ringkasan-tim.md` §4 dan §5.

## Aturan implementasi (dari PRD §4.3, §12 R14 + design §7)

- Semua halaman = `Inertia::render`, bukan fetch API sendiri; data datang dari controller backend (K7–K9) lewat props.
- Token warna/spacing **wajib** masuk `tailwind.config.js`; dilarang hardcode hex di JSX.
- Setiap halaman punya state **loading**, **empty**, **error**; setiap tombol punya state disabled/loading.
- Tanpa `Lorem ipsum`, tanpa `console.log`, `key` pada semua list, `alt` pada semua gambar, `loading="lazy"` kecuali hero.
- Mobile 360px tanpa horizontal scroll; target sentuh ≥ 44px; fokus keyboard terlihat.
- UI & teks: Indonesia (R12). Halaman frontend hanya dikerjakan setelah bagian `design.md` yang relevan selesai (R6).

## Isi tiap kartu

- **K10** — `Layouts/PublicLayout.jsx`, `Components/Header.jsx`, `Footer.jsx`, `Button`, `ProductCard`, `StarRating`, `Accordion`, `Skeleton`, `Modal`, `Toast`; halaman `Public/Home.jsx` sesuai urutan seksi design §3.3. Konten dari `settings`/`carousels`/`faqs` (props dari backend).
- **K11** — `Public/Products/Index.jsx` (filter, sort, pagination, empty/loading), `Public/Products/Show.jsx` (galeri, varian, stok, tabel harga grosir, ulasan, produk serupa), `Public/Contact.jsx` (form + info + peta embed).
- **K12** — `Public/Auth/*` (login, register, forgot), `Public/Cart.jsx`, `Public/Checkout.jsx`, `Public/CheckoutSuccess.jsx`, `Components/QrisPanel.jsx` (countdown, polling status 5s, state pending/checking/paid/expired), form rating bintang interaktif di halaman sukses.
- **K13** — `Layouts/AdminLayout.jsx` (sidebar + topbar, drawer mobile), `Pages/Admin/Dashboard.jsx` (4 kartu KPI, grafik 14 hari, stok kritis, pesanan & ulasan terbaru).
- **K14** — `Pages/Admin/{Products,Categories,Stocks,Orders,Messages,Reviews,Settings,Accounts}/*` dengan pola baku design §5.12 (judul + Tambah, toolbar search/filter, tabel, pagination, modal konfirmasi hapus) dan tab pengaturan design §5.13.

## Definition of Done (semua kartu)

`npm run build` sukses; halaman ter-render dengan data seeder (bukan data karangan); checklist `design.md` §9 terpenuhi untuk halaman kartu tersebut; tidak ada `console.log`; tidak menyentuh `.env`; commit tunggal ber-prefix ID kartu. Lampirkan bukti `npm run build` di `kanban_complete` (R9).

## Boleh `kanban_block` hanya bila

Props/data yang dibutuhkan belum ada di backend **dan** menghalangi seluruh halaman kartu tersebut. Bila hanya sebagian, kerjakan bagian lain dulu dan tulis kebutuhan props di komentar kartu. Bila butuh verifikasi browser, tulis "belum diuji, butuh browser" — jangan menyalakan server permanen (R11).

## Dilarang

Mengubah controller/migrasi/rute backend (itu kartu backend), mengubah `docs/PRD.md`/`design.md`, menambah halaman di luar PRD §5, membuat sistem warna kedua di admin (design §7 poin 8).

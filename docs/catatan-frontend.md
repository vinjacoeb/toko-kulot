# Catatan Frontend

Berkas kerja agent frontend. Diperbarui per kartu. Kartu aktif: **K10 — Layout publik dan landing page** (`t_3ce04d50`).

---

## K10 — Layout publik + landing page

### Rencana ringkas
- Berkas dibuat/diubah: `resources/js/Layouts/PublicLayout.jsx`, `resources/js/Pages/Public/Home.jsx`,
  `resources/js/Components/{Header,Footer,Announcement,NavDrawer,HeroCarousel,TrustStrip,SectionHeader,CategoryCard,ProductCard,ProductGrid,StarRating,FaqAccordion,Accordion,EmptyState,ErrorState,Skeleton,Spinner,Button,IconButton,InlineNotice,Modal,Toast,icons}.jsx`, `resources/js/lib/{format,hooks}.js`, `resources/css/app.css`.
- Komponen dipakai ulang: semua komponen dasar di `Components/` (tidak ada duplikasi markup tombol/kartu/skeleton).
- State UI: `default` / `loading` (skeleton mengikuti dimensi asli) / `empty` (`EmptyState`) / `error` (`ErrorState` + "Coba lagi") / `disabled` (stok 0, `disabled:opacity-45`).

### Validasi tiga arah
1. **PRD + brief vs desain** — urutan seksi landing `docs/design.md` §3.3 butir 1–9 dipetakan 1:1 ke `Home.jsx`; tidak ada fitur yang ditunda ikut dibangun. Layout publik (Header/Footer/Announcement/NavDrawer) sesuai §3.1–§3.2.
2. **Desain vs kontrak** (`docs/kontrak-props.md` §2–§4):
   - `header_nav[].url`, `footer_links[].items[].url`, `footer_social[].platform` + `url` → dibaca sebagai `url`, alias lama `href` dipertahankan.
   - `landing_hero.cta_url`, `landing_sections.promo.cta_url` → CTA memakai `cta_url` lebih dulu, lalu `url`/`href`.
   - `landing_sections.trust_strip[]` = `{icon, title, subtitle}` → judul dari `title`, deskripsi dari `subtitle` (fallback `body`/`description`).
   - `store_logo` dipakai Header; `store_tagline` dipakai fallback hero.
   - `icon` ∈ `truck|refresh|qris|chat|leaf|scissors` → `TRUST_ICONS` di `Components/icons.jsx` lengkap; nama tak dikenal jatuh ke `check`.
3. **Kelayakan teknis** — resolver `app.jsx` (`import.meta.glob`, tanpa eager), `PublicLayout` sudah dipakai, `tailwind.config.js` menyediakan token (`grid-cols-product*`, `text-h1..h3`, `h-banner`, `h-hero`, `gap-gutterLg`, `duration-hover`, `z-drawer`, `z-toast`, `animate-drawer-in`). Tidak ada dependensi baru.

### Verifikasi
- `npm run build` (Vite 5):
  ```
  ✓ 658 modules transformed.
  public/build/assets/app-B9Kw-oOR.css   31.34 kB │ gzip:   6.44 kB
  public/build/assets/Home-DjzWIaQw.js   39.06 kB │ gzip:  11.42 kB
  public/build/assets/app-CqwYZIwi.js   357.64 kB │ gzip: 111.99 kB
  ✓ built in 2.67s
  ```
- Token terkompilasi (bukan sekadar ditulis): `grep -o "[a-z:\\]*h-banner" app-*.css` → `md\:h-banner`; `gap-gutterLg` → `lg\:gap-gutterLg`; `grid-cols-product`, `text-h2`, `duration-accordion`, `animate-drawer-in`, `h-touch`, `z-drawer`, `bg-footer`, `text-ink-soft`, `btn-primary` masing-masing ada di CSS hasil build.
- Tidak ada `console.log`, teks lorem, atau warna heksa lepas di `resources/js` (satu-satunya heksa: `#F5B301` di `app.jsx:19` = `theme-color`, sesuai `docs/design.md`).
- **Belum diuji:** responsif 360/768/1280 tanpa horizontal scroll, keyboard/tab, zoom 200%, kontras. Alasan: server pengembangan tidak dinyalakan (aturan kerja). Audit statis: tidak ada `w-screen`, tidak ada lebar piksel tetap pada kontainer, grid mobile-first (`grid-cols-2` → `md:` → `lg:`), `max-w-[360px]` hanya pada Toast, semua `<img>` memakai `w-full`/`object-cover` dengan `loading` yang benar (hero `eager` untuk slide pertama, sisanya `lazy`).
  Instruksi aman untuk pemilik: `php artisan serve` lalu buka `http://127.0.0.1:8000/` pada lebar 360/768/1280 px, cek `document.documentElement.scrollWidth === window.innerWidth`.

### Keputusan
- Normalisasi kontrak `settings` dilakukan di `Home.jsx`/`PublicLayout.jsx` (bukan di komponen anak), supaya `HeroCarousel`, `TrustStrip`, `SectionHeader` menerima props yang konsisten dan tetap bisa dipakai kartu lain.
- `carousels` diprioritaskan sebagai sumber slide; `landing_hero` (objek tunggal) hanya fallback bila `carousels` kosong. Slide `is_active === false` tidak dirender.
- Gambar promo CMS yang gagal muat jatuh ke placeholder ikon (`ImageOffIcon`), bukan gambar rusak.

### Drift yang diwariskan
- **D1 (font)** — `resources/views/app.blade.php:12-16` masih memuat Bunny Fonts CDN (`bebas-neue`, `inter`); self-host `public/fonts/` belum ada. Catatan TODO di blade tidak dihapus. Belum diubah di kartu ini.
- **D2 (placeholder gambar)** — sudah dikerjakan saat slicing: `ProductCard` (`ImageOffIcon` saat gambar kosong/404), `HeroCarousel` (fallback per slide), `CategoryCard`, banner promo di `Home.jsx`.

### Ketidakcocokan dokumen (perlu keputusan Tech Lead)
- **N1 — props halaman beranda belum ada di kontrak.** `docs/kontrak-props.md` baru memuat §1 props bersama dan §2 bentuk `settings`; bentuk props `carousels`, `categories`, `featured`, `faqs`, `loading`, `error` di halaman `/` belum ditulis backend. Frontend memakai asumsi: `carousels[]` (dari `CarouselSeeder`), `categories[]` (`{id,name,slug,image,url,product_count}`), `featured[]` (bentuk produk), `faqs[]` (`{question,answer}` dari `FaqSeeder}`). Perlu ditulis di kontrak agar K11/K12 konsisten.
- **N2 — newsletter/CTA akhir.** `docs/design.md` §3.3 butir 9 menyebut "input email + tombol", sedangkan `docs/kontrak-props.md` §2 hanya memberi `newsletter.{title,subtitle,button_text}` tanpa URL/endpoint, dan `docs/PRD.md` tidak punya rute langganan email. Implementasi sekarang: blok CTA dengan tombol tautan ke `/kontak-kami` (tanpa input email, karena tidak ada endpoint yang boleh dikarang). Dua alternatif: (a) backend menambah rute `POST /newsletter` + key `newsletter.url` → frontend menambah input email + state sukses/galat; (b) desain direvisi menjadi CTA tautan seperti sekarang.
- **N3 — `landing_sections.categories` tidak ada di kontrak.** Judul/deskripsi seksi Kategori memakai teks desain (`"Kategori"`), bukan dari CMS. Bila ingin dapat diedit admin, perlu key baru di kontrak.

### Handoff QA (K10)
1. `/` menampilkan 9 seksi berurutan sesuai `docs/design.md` §3.3 (announcement opsional, hero, trust, kategori, unggulan, promo, kenapa beli, FAQ, CTA).
2. Isi seksi 2–9 berasal dari `settings.landing_sections` + `carousels` + `faqs`; kosongkan salah satu key → seksi terkait hilang tanpa galat, bukan menampilkan teks placeholder.
3. `loading=true` → skeleton, bukan spinner penuh halaman; `error` → `ErrorState` + "Coba lagi"; produk kosong → `EmptyState`.
4. Data produk dengan `stock = 0` → tombol "Tambah" `disabled` + label "Habis".
5. Prasyarat: `settings`, `carousels`, `faqs` tersedia dari server (seeder). Bila props belum dikirim, halaman tetap render (fallback aman) — ini bukan bukti integrasi.

## K13 — Panel admin: layout + dashboard (t_bae93e32)

Berkas baru: `resources/js/Layouts/AdminLayout.jsx`, `resources/js/Pages/Admin/Dashboard.jsx`,
`resources/js/Components/{PageHeader,KpiCard,ChartCard,DataTable,StatusBadge}.jsx`.
`Breadcrumb.jsx` sudah ada (dibuat worker lain) — dipakai ulang, tidak ditimpa.
`resources/js/lib/format.js` ditambah `formatDate` dan `formatDateTime`; `icons.jsx` ditambah
`GridIcon, BoxIcon, LayersIcon, ArchiveIcon, GearIcon, LogOutIcon, WalletIcon, TrendUpIcon,
TrendDownIcon, ChartIcon`.

Kontrak yang belum tersedia di backend (`DashboardController@index` hanya mengirim `stats`):
`stats.revenue_total|orders_pending|orders_total|products_active` dipakai apa adanya. Prop
tambahan yang halaman ini sudah baca bila nanti dikirim: `sales_14d [{date,total}]`,
`low_stock [{id,product_name,size,color,stock}]`, `recent_orders` (5),
`recent_reviews [{id,user_name,product_name,rating,comment,created_at}]`, `updated_at`, `loading`, `error`.
Tanpa prop itu blok terkait tampil sebagai empty state, bukan galat.

Deviasi/penundaan yang disengaja:
- Item sidebar selain Dashboard ditandai `disabled` karena `routes/admin.php` baru punya `/admin`,
  `/admin/login`, `/admin/logout`. Tautan 404 sengaja tidak dirender.
- Pencarian global di topbar (design §5.10) belum dirender: belum ada rute pencarian admin.
- CTA "Tambah produk" pada empty state dashboard belum dirender (rute `/admin/produk` belum ada).
- Flash sukses/galat belum ditampilkan di AdminLayout (belum ada alur form admin).

Belum diuji di browser (pemilik yang menyalakan server): responsif 360/768/1024/1280, keyboard,
zoom 200%, dan tampilan grafik dengan data nyata. Build produksi lulus (`npm run build`, 686 modul).

---

## K11 — Halaman publik `/produk`, `/produk/{slug}`, `/kontak-kami`

Rencana: `Pages/Public/Products/Index.jsx` (filter+sort+paginasi lewat query string),
`Pages/Public/Products/Show.jsx` (galeri, varian, stok, harga grosir, ulasan, produk serupa),
`Pages/Public/Contact.jsx` (form + info toko + jam operasional). Komponen baru:
`ProductGallery`, `PriceBlock`, `VariantChip`, `QtyStepper`, `Pagination`, `SortSelect`,
`FilterPanel`, `Breadcrumb`, `RatingSummary`, `ReviewCard`, `Field`, `Input`, `Textarea`,
`Select`, `ColorSwatch`, `BottomSheet`. State UI: loading (skeleton), empty, error + "Coba lagi",
stok 0 → tombol nonaktif.

### Validasi tiga arah (temuan)

1. **PRD/desain vs kontrak.** Kontrak §8 (`ProductListResource`, key `products`, `filters`,
   `meta`) sudah dipakai persis: filter `search/category/size/color/min_price/max_price/sort/page`,
   `sort` = `terbaru|termurah|termahal|populer`. Halaman detail membaca key `product`
   (§8.3) dan memakai key tambahan `description`, `variants`, `wholesale_tiers`, `reviews`,
   `rating_summary`, `related`. Key-key tersebut belum terdaftar di kontrak → dicatat ke
   kartu backend (lihat komentar di kartu ini).
2. **Kontrak §8.3 tidak punya `compare_price`.** Desain §5.3 menyebut harga coret + badge
   potongan; tanpa key tersebut harga coret tidak dirender (tidak dikarang).
3. **Rute GET belum ada.** `routes/web.php` (perubahan backend K9) baru punya
   `POST /kontak-kami`; `GET /produk`, `GET /produk/{slug}`, `GET /kontak-kami` belum
   terdaftar sehingga halaman belum bisa dirender server. Tidak dibuat sendiri (aturan 5) →
   kartu backend.
4. **Form kontak cocok dengan backend.** `ContactMessageRequest`: `name`≤100, `email`≤150,
   `phone` nullable ≤30, `subject`≤150, `message`≤2000, honeypot `website` — maxLength klien
   disamakan. Flash sukses dari `MessageController` ditampilkan lewat `InlineNotice`.
5. **Tambah keranjang.** `POST /keranjang` dengan `product_id`, `variant_id`, `qty`
   (produk bervarian wajib mengirim `variant_id`; kartu "Produk Serupa" membuka halaman detail
   untuk produk bervarian).

### Verifikasi

- `npm run build` → exit 0, ketiga bundel halaman ter-emit (Index/Show/Contact).
- Belum diuji di browser (pemilik yang menyalakan server): responsif 360/768/1024/1280,
  keyboard, zoom 200%, kontras, dan interaksi filter/paginasi dengan data nyata.

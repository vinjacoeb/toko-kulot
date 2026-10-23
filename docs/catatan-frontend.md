# Catatan Frontend

Rencana:
1. `ProductCard.jsx`: Tambahkan `comparePrice={product.compare_price}` ke `PriceBlock`.
2. `ProductsShow.jsx`: Tambahkan `comparePrice={product.compare_price}` ke `PriceBlock`.

Asumsi/Temuan:
- `PriceBlock` sudah menangani logika `comparePrice` dan badge.
- `product` object tersedia di kedua file.
- `compare_price` sesuai kontrak adalah integer atau null.

Verifikasi:
- `npm run build` setelah perubahan.

---

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
- ~~Item sidebar selain Dashboard ditandai `disabled` karena `routes/admin.php` baru punya `/admin`,
  `/admin/login`, `/admin/logout`. Tautan 404 sengaja tidak dirender.~~
  **DICABUT di kartu t_6ee422f2 (temuan QA-007):** seluruh rute modul kini terdaftar di
  `routes/admin.php`, jadi `ADMIN_NAV` di `resources/js/Layouts/AdminLayout.jsx` tidak lagi memakai
  flag `disabled` dan seluruh item kembali menjadi tautan aktif. Rincian: `docs/catatan-frontend-admin.md`.
- **Kolom cari topbar admin — SELESAI sebagai deviasi resmi** (kartu keputusan `t_b5de72e3`,
  opsi c, 20 Okt 2026): kolom `⌕ cari` di topbar shell admin (design §5.10 / deviasi D8)
  **tidak dibangun**; jalur pencarian admin = toolbar per halaman daftar (design §5.12), tanpa
  rute baru (PRD §5.2). Rujukan: `docs/pertanyaan-pemilik.md` §4 T3, `docs/catatan-techlead.md`
  bagian "Keputusan teknis: kolom pencarian global topbar admin"; catatan kode di kepala
  `resources/js/Layouts/AdminLayout.jsx`. Kartu pencatat: `t_944aea1e`.
- ~~CTA "Tambah produk" pada empty state dashboard masih belum ada~~ **SELESAI** (kartu t_099c813c,
  20-10-2026): `resources/js/Pages/Admin/Dashboard.jsx` kini meneruskan `emptyActionLabel="Tambah produk"`
  dan `emptyActionHref="/admin/produk/tambah"` ke `ChartCard` (rute `products.create` =
  `routes/admin.php:97`). Temuan QA-007 `t_6ee422f2` ditutup; bukti `docs/bukti-frontend-t_099c813c.txt`.
- Halaman `Admin/Kategori` dan `Admin/Akun` masih placeholder: tombol "Tambah" menunjuk
  `/admin/kategori/tambah` dan `/admin/akun/tambah` yang tidak terdaftar (404). Kartu lanjutan: t_e5149746.
- Flash sukses/galat tidak dirender di AdminLayout (halaman menampilkannya sendiri lewat blok masing-masing:
  Login, Reviews, Settings, Messages).

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

## K16 — Kartu t_4dd28407: keranjang, checkout, pembayaran, selesai, login admin

**Rencana (sebelum implementasi).** Komponen baru: `Components/CartLine.jsx`, `Components/OrderSummary.jsx`,
`Components/QrisPanel.jsx`, `Components/ReviewForm.jsx` (design §4.28, §4.29, §5.8; docs/komponen.md §3).
Halaman baru: `Pages/Public/Cart.jsx`, `Pages/Public/Checkout.jsx`, `Pages/Public/CheckoutPay.jsx`,
`Pages/Public/CheckoutSuccess.jsx`, `Pages/Admin/Login.jsx` (nama komponen = jalur relatif dari `Pages`).
Ikon aditif `TrashIcon` + `CopyIcon` di `Components/icons.jsx` (SVG lokal, bukan emoji/unggahan internet).
Dipakai ulang: `PublicLayout`, `QtyStepper`, `InlineNotice`, `EmptyState`, `Button`, `IconButton`, `Field`,
`Input`, `Textarea`, `Countdown`, `QrCode`, `StatusBadge`, `Spinner`, `lib/format` (`rupiah`,
`formatDateTime`), `lib/hooks` (`useDocumentVisible`, `useLoadingTimeout`).
State UI: Cart (`empty`, `updating` per baris, `stock-changed`, `guest`), Checkout (`idle`, `submitting`,
`error-field`, `error-payment`, `cart-empty`), Pay (`pending`, `checking`, `paid`, `expired`, `error`),
Success (`paid`, `review-empty`, `review-submitting`, `review-submitted`, `review-error`),
Admin Login (`idle`, `submitting`, `error`, `locked` 429).

**Validasi tiga arah.** PRD §5.1 langkah 2–7 ⇔ design §5.6–§5.9 ⇔ kontrak §7.0–§7.9 + §9.1 + §6.10–§6.13:
setiap kebutuhan punya layar, komponen, dan state; rute aksi (`PATCH`/`DELETE /keranjang/{item}`,
`POST /checkout`, `POST /checkout/{order}/ulasan`, `GET .../status`) semua ada di `routes/web.php`.
Semua key props, enum status, dan pesan `flash` diambil persis dari kontrak §7.

**Asumsi (celah kecil, tidak menghalangi) — lihat juga docs/asumsi.md bila perlu:**
1. Optimistis subtotal (§5.6 "total dihitung optimistis") tidak dihitung di klien: harga grosir
   (`min_wholesale_qty`) hanya diketahui server, jadi angka karangan berisiko salah. Baris `updating`
   memakai `aria-busy` + spinner dan nilai server dipertahankan sampai respons datang.
2. Skeleton 3 baris (§4.28 `loading`) tidak dipakai karena props halaman datang bersama render Inertia
   (tidak ada fetch props terpisah); transisi antar halaman memakai progress bar §5.15. Skeleton per
   baris hanya dipakai saat qty berubah bila respons > 1 detik.
3. Prop `midtrans` (§7.5/§7.7) tidak dipakai untuk memuat `snap.js`: panel QR dirender dari `qr_string`
   (§7.7) dan design §5.8 tidak meminta Snap. Tidak ada skrip pihak ketiga yang dimuat.
4. Microcopy tambahan yang belum ada di dokumen: label "Kode pesanan", "Salin", 3 langkah instruksi QRIS,
   dan teks penanda `[CONTOH]` bila ada. Semua teks lain mengikuti kontrak/design; pesan server ditampilkan apa adanya.
5. `is_active = false` (keranjang) memakai `InlineNotice` warning "Produk ini sudah tidak dijual lagi." +
   qty dikunci; item hilang setelah server memproses `PATCH`.

---

## K17 — Kartu t_7cbe34dc: `ProductCard` memakai `<PriceBlock>` tanpa import (Critical)

**Masalah.** `resources/js/Components/ProductCard.jsx:102` memakai `<PriceBlock>` (baris hasil kartu
t_6b722a49) tanpa baris import -> `Uncaught ReferenceError: PriceBlock is not defined` saat render,
sehingga `/`, `/produk`, dan `/produk/{slug}` blank (hanya kerangka). PHPUnit tidak bisa melihatnya
karena tidak mengeksekusi JavaScript.

**Validasi tiga arah + rencana (maks 10 baris).**
- PRD/design vs kartu: kartu hanya menuntut satu baris import + sapu kelas bug; tidak ada fitur baru yang
  perlu desain. `docs/design.md` §4.2 & `docs/komponen.md` §1 memang meminta kartu produk menampilkan
  harga (dan coret + badge bila `compare_price` ada) — jadi ini perbaikan regresi, bukan fitur baru.
- Design vs kontrak: `compare_price` ada di kontrak props dan sudah dipakai `PriceBlock`
  (`price`, `comparePrice`, `size`) — tidak ada nama key baru yang perlu ditambah.
- Kelayakan teknis: `PriceBlock.jsx` ada, Vite + React 18 sudah terpasang; penyebabnya murni import
  yang hilang (Vite tidak typecheck sehingga build tetap exit 0).
- Rencana: (1) tambah import `PriceBlock` di `ProductCard.jsx`; (2) buang `const price` sisa baris lama;
  (3) tulis dua skrip sapu (sumber + bundel) di `tmp/`; (4) `npm run build`; (5) smoke browser 3 halaman
  x 3 viewport dengan kolektor error; (6) `php artisan test`; (7) tulis bukti ke `docs/`.

**Perbaikan (berkas yang diubah).**
1. `resources/js/Components/ProductCard.jsx`: menambah `import PriceBlock from './PriceBlock';` dan
   menghapus `const price` yang menjadi tidak terpakai (sisa baris `<p>{price ?? '-'}</p>` lama).
   Diff: 2 insersi / 2 delesi. Tidak ada berkas lain yang diubah.
2. Sapu kelas bug yang sama (dua lapis, skrip dapat dijalankan ulang):
   - `tmp/cek-komponen-tanpa-import.py <root>` -> 76 berkas `resources/js` diperiksa; satu-satunya
     temuan nyata adalah `ProductCard.jsx` (temuan `app.jsx: App` = false positive, `App` adalah
     parameter `setup({ el, App, props })`). `Header.jsx`/`Footer.jsx` bersih.
   - `tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` -> 32 chunk diperiksa,
     tidak ada identifier komponen JSX tanpa import/definisi.
3. `npm run build` (13:55, exit 0, 33 artefak). Chunk `ProductGrid-C6jbWhDc.js` kini memuat
   `line-through` + `bg-sale-500` (PriceBlock ter-inline); chunk lama `ProductGrid-BSmUR2l-.js`
   memuat `jsx(PriceBlock,{...})` tanpa definisi.

**Verifikasi nyata (bukti mentah: `docs/bukti-frontend-t_7cbe34dc.txt`).**
- Browser nyata (CDP) 9 kombinasi `/`, `/produk`, `/produk/setelan-kulot-linen-lengan-panjang` x
  360/768/1280 px: **0 console error**, `body.innerText` 1329–2054 karakter, harga `Rp` tampil
  (9–25 kemunculan), kartu produk & tautannya ada. Kolektor `window.onerror` + `console.error` +
  `unhandledrejection` dipasang sebelum dokumen dimuat.
- `tmp/priceblock-check.mjs` (render statis `PriceBlock` lewat esbuild + `react-dom/server`):
  compare null -> tanpa coret; compare > harga -> coret + badge `-23%`; compare < harga -> tanpa
  badge; harga `"169000"` (string server) -> benar; harga null -> `Rp0` (lihat temuan minor);
  tidak ada NaN/undefined pada semua kasus.
- Kontrak: props server memuat key `compare_price` (`null` pada 12/12 produk seed & pada detail),
  jadi jalur tampilan harga coret belum bisa diuji dengan data nyata — bukan karena key hilang.
- `php artisan test` (sqlite `:memory:`): **173 passed, 2 incomplete, 996 assertions, exit 0** —
  sama dengan baseline QA K15. php.ini global, `.env`, dan `.env.example` tidak disentuh.

**Temuan minor (di luar lingkup kartu, tidak diperbaiki, sudah dikomentari di kartu t_6b722a49).**
`PriceBlock` mengubah `price` null/'' menjadi 0 -> tampil `Rp0`, padahal `lib/format.rupiah()`
mengembalikan `null` untuk nilai kosong (pemanggil menampilkan `-`). Dampak kosmetik karena kolom
`products.base_price` non-null.

**Belum diuji.** Keyboard/tab order, zoom 200%, kontras WCAG, pembaca layar, LCP/Lighthouse (tidak
ada alat di sesi ini), dan halaman di luar lingkup kartu (keranjang/checkout/bayar/sukses/login
admin — kartu t_4dd28407).

**Catatan koordinasi build.** Build 13:55 sudah sinkron dengan seluruh sumber saat itu. Pekerjaan
K16 (t_4dd28407) menambah `Components/{CartLine,OrderSummary,QrisPanel,ReviewForm}.jsx`,
`Pages/Public/{Cart,Checkout}.jsx`, dan menyunting `icons.jsx` pada 13:58–14:01, yaitu **lebih baru
dari build 13:55** -> artefak produksi harus dibangun ulang setelah K16 selesai (koordinasi dengan
kartu devops t_56a2d29c). Perbaikan kartu ini ada di sumber, jadi setiap build ulang ikut membawanya.

### K16 — lanjutan verifikasi & perbaikan (pembayaran, selesai, keranjang, checkout)

- **Rute dicek satu per satu** dan cocok dengan URL literal di halaman: `POST /checkout`, `GET /checkout/{order}/status`, `GET /checkout/{order}/selesai`, `POST /checkout/{order}/ulasan`, `PATCH|DELETE /keranjang/{item}`, `POST /admin/login` (prefix `/admin` dari `bootstrap/app.php`).
- **Throttle nyata di rute** (`throttle:cart` 30/menit, `throttle:checkout` 10/menit, `throttle:admin-login` 5/menit) dapat membalas **429**. Ketiga alur kini memakai `onHttpException` Inertia dan menampilkan `InlineNotice` (keranjang, checkout, login admin) alih-alih modal galat bawaan Inertia. Pesan 429 di halaman bersifat generik karena server tidak mengirim pesan bahasa Indonesia untuknya.
- **Ulasan: gerbang per produk, bukan `boleh`.** `CheckoutController::success` mengirim `ulasan.boleh = (belum ada ulasan sama sekali)`, sedangkan `ReviewService::isEligible` hanya memeriksa pembayaran settlement + status pesanan. Setelah satu kiriman + redirect, `boleh` menjadi `false` padahal produk lain masih boleh dinilai server. Halaman `CheckoutSuccess` karena itu memakai `ulasan.sudah` (daftar `product_id` yang sudah dinilai) sebagai gerbang per produk, dan menampilkan pesan galat server apa adanya bila ditolak.
- **Satu kiriman = satu entri `ulasan[]`** (kontrak §9.1 mengizinkan 1–20 entri), jadi galat validasi selalu di `ulasan.0.*`; `StoreReviewRequest` memakai `distinct` per `product_id`, sehingga formulir per produk di halaman aman.
- **`OrderSummary` tidak lagi bersarang di dalam kartu** pada `CheckoutPay` dan `CheckoutSuccess` (dulu kartu di dalam kartu); total kini dirender sebagai `<dl>` di dalam kartu rincian. `OrderSummary` tetap dipakai di keranjang dan checkout sebagai kolom ringkasan mandiri.
- **`CheckoutPay.check()`** memakai status `checking` saat cek status manual, agar `QrisPanel` menampilkan keadaan "memeriksa" dan tombol terkunci; `stalled` (10 detik tanpa jawaban) menjadi `error` dengan tombol "Coba lagi".
- **Checkout**: radio metode pembayaran kini `disabled` + `aria-describedby` (hanya QRIS tersedia; server menurunkan metode sendiri lewat `paymentMethodPayload()`, sehingga tidak ada field yang perlu dikirim). Tombol submit tunggal lewat `OrderSummary` (`form="checkout-form"`).
- **Verifikasi dijalankan**: `npm run build` → exit 0 (44 chunk, `app-*.js` 361,53 kB); `python tmp/cek-komponen-tanpa-import.py <root>` → 79 berkas, satu temuan yaitu false positive `app.jsx: App`; `python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` → 44 chunk, tidak ada identifier komponen tanpa import.
- **Belum diuji (butuh browser + Midtrans)**: alur QRIS sungguhan, respons 429 nyata, breakpoint 360/768/1024/1280 px, zoom 200%, dan navigasi keyboard.

## K13 — area Admin (Review & Pengaturan), kartu t_fc49ee38

- Halaman: `resources/js/Pages/Admin/Reviews/Index.jsx`, `resources/js/Pages/Admin/Settings/Index.jsx` (design §5.12–§5.13, kontrak §10.4–§10.11).
- Temuan, asumsi, dan verifikasi lengkap: `docs/catatan-frontend-admin.md`.
- Ketidakcocokan kontrak yang perlu keputusan backend: bentuk `footer_links` (§10.8 datar `{label,url}` vs data tersimpan kolom `{title, items[]}`).
- Verifikasi: `npm run build` exit 0; kedua skrip pemeriksa di `tmp/` bersih. Interaksi browser belum diuji (server pemilik).

## K15 — halaman Admin/Pesan Masuk, kartu t_fc2c5b98

- Halaman: `resources/js/Pages/Admin/Messages/Index.jsx` (546 baris; sebelumnya skeleton 25 baris dengan props di luar kontrak).
- Kontrak §10.1–§10.3: props `pesan`/`filter`/`ringkasan`, PATCH `admin.messages.read` (baris 227), POST `admin.messages.reply`, `flash.success`/`flash.error`.
- Temuan, asumsi, rencana, dan verifikasi lengkap: `docs/catatan-frontend-admin.md` bagian "Kartu t_fc2c5b98"; bukti mentah `docs/bukti-frontend-t_fc2c5b98.txt`.
- Ketidakcocokan kontrak yang perlu keputusan backend: §10.1 menulis paginator `links` + `meta`, controller mengirim paginator Laravel datar (halaman membaca keduanya).
- Verifikasi: `npm run build` exit 0 (chunk `assets/Index-DaqgQ7RB.js` memuat halaman); kedua skrip pemeriksa di `tmp/` bersih; `php vendor/bin/phpunit` → `OK (190 tests, 1111 assertions)`. Interaksi, aksesibilitas, dan responsif diuji lewat harness browser lokal (stub Inertia) — bukan render server nyata.
- Temuan diteruskan: kontras badge `StatusBadge` (design §4.21) 2,86:1 / 2,96:1 → kartu UIUX `t_8cd61512`.

## Kartu t_acd5fc8e — halaman Public/Auth (Login, Register, Lupa Sandi, Reset Sandi)

### Rencana ringkas
- Berkas baru: `resources/js/Layouts/AuthLayout.jsx`; berkas diubah: `resources/js/Pages/Public/Auth/{Login,Register,ForgotPassword,ResetPassword}.jsx`.
- Layout dua kolom design §5.5: panel brand `bg-brand-700` (logo + tagline + 3 bullet manfaat) + `main max-w-form` (400px) terpusat vertikal; tanpa `PublicLayout` (§3 dan analog §5.9).
- Komponen dipakai ulang: `Button` (state `loading` → spinner + "Memproses…", design §4.0/§266), `Field`, `Input`, `InlineNotice` (tone `error` = `bg-red-50 border-danger`, §5.5/§4.23), `TRUST_ICONS`, util `toList` (`lib/format.js`).
- State UI: `idle`, `submitting` (tombol disabled + label memproses, guard kirim ganda `if (processing) return`), `error-field` (`errors.<kolom>` → `aria-invalid` + `aria-describedby`), `error-global`/`success` (`flash` + `status` server via `InlineNotice`).

### Validasi tiga arah
- PRD/brief vs desain: §5.5 menentukan panel brand + form `max-w-form`, field Register, isi Lupa Sandi, dan aturan Reset Sandi (email readonly, token tersembunyi, token tidak valid → `InlineNotice` + tautan minta ulang). Semua terpenuhi; tidak ada fitur di luar kartu.
- Desain vs kontrak: props `errors`/`status`/`flash` (§6); aksi `POST /login|/register|/forgot-password|/reset-password` ada di `routes/web.php` (`AuthController`). Semua URL literal, tanpa Ziggy — `grep "route(['\"]" resources/js/` = **0** (sisa 4 kemunculan `route(` hanya di komentar dokblok).
- Kontrak props §2 vs data server nyata: item `landing_sections.trust_strip` = `{ icon, title, subtitle }` (bukan `label`/`description`) — dibuktikan `tmp/inspect-settings.py` + `tmp/settings-asli.json`. `AuthLayout` memakai `title`/`subtitle` lebih dulu; alias `label`/`description` tetap diterima agar cocok dengan `TrustStrip` (§1).
- Kelayakan teknis: alias `@/` dari `vite.config.js`; keempat halaman Inertia di `resources/js/Pages/Public/Auth/` (nama komponen = jalur dari `Pages`).

### Verifikasi (bukti mentah: `docs/bukti-frontend-t_acd5fc8e.txt`)
- `npm run build` → exit 0 (20-10-2026 15:11). Sweep `tmp/cek-komponen-tanpa-import.py` (80 berkas; hanya `app.jsx: App`, false positive parameter `setup`) dan `tmp/cek-bundel-identifier-bebas.py` (49 chunk) → bersih.
- Harness render statis fixture: `node tmp/verify-auth-render.bundle.mjs` → **42/42 lulus** (kontrak §6 + design §5.5 termasuk panel brand, maks 3 bullet, skip link).
- Harness render statis **settings asli** server (`tmp/verify-auth-real.bundle.mjs`) → **21/21 lulus**: nama toko, tagline, 3 bullet pertama dari `trust_strip` nyata, item ke-4 tidak tampil, `settings` null → nama bawaan, `trust_strip` kosong → tanpa bullet, tidak ada `NaN`/`undefined`.
- Browser CDP (server dev pemilik, stub tidak dipakai): 4 rute × 3 viewport (360/768/1280) → h1 render, `overflow=0`, **0 galat console**; kirim form tiap rute (payload kosong/palsu) → pesan validasi server tampil (`role="alert"`), 0 galat console.
- Panel brand di halaman hidup: 1280px menampilkan nama toko, tagline, dan 3 bullet dari data server (`bullet_terlihat=True`); 768/360px bullet disembunyikan dengan panel header 160px — sesuai §5.5.
- Smoke HTTP `bash tmp/smoke-auth-http.sh` → `docs/bukti-smoke-auth-http.txt`; `php artisan test tests/Feature/Auth tests/Feature/Contract` dengan `PHP_INI_SCAN_DIR` scratch → exit 0.
- Belum diuji: pembaca layar nyata, zoom 200%, dan perilaku 429/rate-limit pada form login (framework menampilkan modal galat bawaan; §5.5 tidak mengaturnya — aturan "pesan tunggu" ada di §5.9 admin).

### Catatan koordinasi
- Pukul 15:06 sebuah `npm run build` bersamaan (kartu `t_5a330224`) sempat menghapus `public/build/manifest.json` selama beberapa detik sehingga satu putaran smoke menampilkan `ViteManifestNotFoundException` di semua rute; setelah build selesai (15:06) semua rute normal kembali. Bukan cacat aplikasi, tetapi urutan build penutup sebaiknya dijalankan setelah kartu frontend ini `done`.

## Kartu t_099c813c — CTA "Tambah produk" pada empty state grafik penjualan dashboard

### Rencana ringkas
- Berkas baru: tidak ada. Berkas diubah: `resources/js/Pages/Admin/Dashboard.jsx` (2 prop pada `ChartCard`), `docs/catatan-frontend.md` (known issue CTA dicabut) + berkas bukti baru.
- Komponen dipakai ulang: `ChartCard` → `EmptyState` → `Button` (`href` → `<a class="btn-secondary">`, design §4.0/§406). Tidak ada komponen, kartu, atau microcopy baru di luar instruksi kartu.
- State UI: empty grafik (judul `Belum ada penjualan` + CTA), loading (skeleton, tanpa CTA), ada data (grafik, tanpa CTA), error halaman (`ErrorState` + "Coba lagi", perilaku lama tidak berubah).

### Validasi tiga arah
- PRD/brief vs desain: design §5.11 mensyaratkan empty dashboard `"Belum ada penjualan" + CTA tambah produk`; §406 `EmptyState` menyediakan slot aksi. Terpenuhi lewat prop `emptyActionLabel`/`emptyActionHref` yang sudah ada di `ChartCard` — tidak ada fitur atau teks di luar kartu.
- Desain vs kontrak: rute tujuan `GET /admin/produk/tambah` → `admin.products.create` (`routes/admin.php:97`, terverifikasi `php artisan route:list --path=admin/produk/tambah`). URL ditulis literal (`/admin/produk/tambah`), tanpa Ziggy/`route()`. Label CTA persis dari design: `Tambah produk`.
- Kelayakan teknis: `ChartCard` sudah menerima `emptyActionLabel`/`emptyActionHref` dan meneruskannya ke `EmptyState`, jadi cukup 2 baris di halaman; verifikasi memakai harness esbuild + `react-dom/server` (`tmp/verify-dashboard-cta.mjs`) mengikuti pola kartu admin sebelumnya.

### Verifikasi (bukti mentah: `docs/bukti-frontend-t_099c813c.txt`)
- `npm run build` → exit 0 (20-10-2026 15:24, 714 modul, `assets/Dashboard-Bke4Do0V.js` 11,61 kB).
- Harness render statis `node tmp/build-dashboard-cta-check.mjs && node tmp/verify-dashboard-cta.bundle.mjs` → **45/45 lulus, 0 gagal**: CTA muncul tepat 1× dan menunjuk `/admin/produk/tambah` pada 3 bentuk data kosong (`sales_14d=[]`, 14 hari bernilai 0, nilai `"0"` berupa string), TIDAK muncul saat ada data maupun saat loading, tanpa `NaN`/`undefined`/teks placeholder, dan empty state blok lain (stok kritis, pesanan, ulasan) tidak ikut berubah.
- Sweep `tmp/cek-komponen-tanpa-import.py .` (80 berkas; hanya `app.jsx: App`, false positive parameter `setup`) dan `tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` (49 chunk) → bersih.
- Rute + HTTP smoke: `curl` `GET /admin/produk/tambah` dan `GET /admin/produk` → `302 Found` (diarahkan ke login admin karena tidak ada sesi), bukan `404`; server pemilik tetap utuh, tidak ada kredensial admin yang dipakai.
- Belum diuji: klik CTA di browser sungguhan setelah login admin (butuh sesi pemilik) dan tampilan visual/responsif nyata; aksesibilitas keyboard + zoom 200% belum diverifikasi manual.

### Temuan lanjutan (di luar lingkup kartu)
- ~~`Dashboard.jsx` tidak meneruskan prop `error` halaman ke `ChartCard`~~ **SELESAI** (kartu `t_8bca0661`, 20-10-2026 15:32): `resources/js/Pages/Admin/Dashboard.jsx` kini meneruskan `error={error}` dan `onRetry={reload}` ke `ChartCard`; blok grafik menampilkan `ErrorState` ("Gagal memuat grafik" + "Coba lagi"), bukan empty state + CTA. Koreksi catatan lama: yang tampil saat galat hanyalah `ErrorState` ringkasan halaman (seksi KPI justru disembunyikan), sedangkan blok grafik tetap empty state + CTA. Bukti `docs/bukti-frontend-t_8bca0661.txt` + kontrol negatif `docs/bukti-kontrol-negatif-t_8bca0661.txt`.

## Kartu t_8bca0661 — error per blok: `ChartCard` dashboard menerima `error`/`onRetry`

### Rencana ringkas
- Berkas baru: tidak ada. Berkas diubah: `resources/js/Pages/Admin/Dashboard.jsx` (2 prop baru pada `<ChartCard>`: `error={error}`, `onRetry={reload}`), `tmp/verify-dashboard-cta.mjs` (assert state error per blok), `docs/catatan-frontend.md` + dua berkas bukti.
- Komponen dipakai ulang: `ChartCard` sudah punya cabang `error`/`onRetry` (`ChartCard.jsx:37-38,136-143`) yang meneruskan ke `ErrorState` (`Gagal memuat grafik` + tombol "Coba lagi" memakai `onRetry`); tidak ada komponen, teks, rute, atau blok baru.
- State UI disentuh: hanya state `error` blok grafik. Empty/loading/ada-data/empty blok lain tidak diubah (dijaga oleh assert regresi di harness).

### Validasi tiga arah
- PRD/brief vs desain: design §5.11 mensyaratkan state dashboard `error` **per blok** ("satu blok gagal tidak menjatuhkan halaman"); sebelumnya galat halaman menyamar sebagai data kosong di blok grafik → bentrok. Diperbaiki hanya lewat prop yang sudah ada; microcopy galat (`Gagal memuat grafik`, `Coba lagi`) berasal dari `ChartCard`/`ErrorState`, bukan teks baru.
- Desain vs kontrak: prop halaman `error` (string|null) dan `loading` sudah jadi asumsi kontrak yang tercatat di `docs/catatan-frontend.md` (K13, props dashboard); `reload` = `router.reload()` (Inertia, tanpa rute/endpoint baru). `docs/kontrak-props.md` §6.13 masih hanya memuat `stats` (DRAFT) — dashboard belum menerima props lanjutan dari controller; harness bekerja terhadap bentuk kontrak yang diasumsikan, bukan integrasi server.
- Kelayakan teknis: tanpa perubahan resolver, layout, atau dependensi; `ChartCard` sudah menangani `error`/`onRetry`, jadi 2 baris di halaman cukup. Diuji ulang lewat harness esbuild + `react-dom/server` yang sudah ada (tanpa paket baru).

### Verifikasi (bukti mentah: `docs/bukti-frontend-t_8bca0661.txt`)
- Harness `node tmp/build-dashboard-cta-check.mjs && node tmp/verify-dashboard-cta.bundle.mjs` → **exit 0, 54/54 lulus, 0 gagal** (sebelumnya 45/45). Assert baru memeriksa blok grafik terisolasi: menampilkan `Gagal memuat grafik` + pesan galat apa adanya + "Coba lagi"; "Coba lagi" tampil **2×** (ringkasan halaman + blok grafik, membuktikan `onRetry` sampai); judul empty `Belum ada penjualan` TIDAK tampil, CTA `Tambah produk` 0×, grafik tidak digambar, tidak ada tautan sisa di blok grafik.
- **Kontrol negatif** (`docs/bukti-kontrol-negatif-t_8bca0661.txt`): dengan dua baris itu dilepas sementara, harness **exit 1, 47/54 lulus, 7 gagal** — persis gejala kartu (blok grafik = empty state + CTA saat galat). Jadi assert baru benar-benar menangkap regresi.
- Regresi state lain tetap terjaga: empty grafik (3 bentuk data kosong) tetap punya CTA `Tambah produk` → `/admin/produk/tambah`; ada data tetap menggambar grafik; loading tetap skeleton; empty state blok lain (stok kritis, pesanan, ulasan) dan tombol "Muat ulang" tidak berubah; tanpa `NaN`/`undefined`/teks placeholder.
- `npm run build` → exit 0 (20-10-2026 15:32, 714 modul, `assets/Dashboard-0VyyIrCJ.js` 11,63 kB).
- Sweep `tmp/cek-komponen-tanpa-import.py .` (80 berkas; hanya `app.jsx: App`, false positive parameter `setup`) dan `tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` (49 chunk) → bersih (exit 0).
- Belum diuji: **klik nyata di browser belum diuji, butuh browser** — server/kredensial milik pemilik, agent tidak menyalakan server. Yang belum tercakup: tampilan visual blok grafik pada state galat (tinggi/komposisi `ErrorState` di dalam kartu), responsif 360/768/1024/1280, keyboard/tab ke "Coba lagi", zoom 200%, kontras.
  Instruksi aman untuk pemilik: dengan sesi admin aktif, buka `http://127.0.0.1:8000/admin`; bila props `error` terisi (mis. putuskan koneksi saat `router.reload()`), blok "Penjualan 14 hari" harus menampilkan "Gagal memuat grafik" + tombol "Coba lagi", bukan "Belum ada penjualan" + "Tambah produk".

### Temuan lanjutan (di luar lingkup kartu ini)
- Tiga blok dashboard lain (`Stok kritis`, `Pesanan terbaru`, `Ulasan terbaru`) masih menampilkan empty state masing-masing saat prop `error` halaman terisi — kelas bug yang sama dengan kartu ini, tetapi kartu ini melarang mengubah blok lain. Terbukti di markup harness (blok grafik sudah galat, tiga blok itu tetap "Stok aman"/"Belum ada pesanan"/"Belum ada ulasan"). Kartu lanjutan dibuat: **`t_950a38ca`** (frontenddeveloper, gated oleh kartu ini).
- `docs/kontrak-props.md` §6.13 masih hanya memuat `stats`; props `sales_14d`, `low_stock`, `recent_orders`, `recent_reviews`, `updated_at`, `loading`, `error` belum ditulis backend (status DRAFT). Tidak ada fetch di klien, halaman memakai nilai bawaan aman — tetap tercatat sebagai ketidakcocokan kontrak untuk Tech Lead.
- **Status commit (R8 "satu kartu satu commit"):** kartu ini belum membuat commit. Seluruh modul admin (`resources/js/Pages/**`) belum pernah masuk git — `git status --short` menunjukkan 172 untracked + 31 modified dari banyak kartu sekaligus, dan `git cat-file -e HEAD:resources/js/Pages/Admin/Dashboard.jsx` → tidak ada di HEAD. File `Dashboard.jsx` adalah berkas bersama (isi utamanya hasil kartu K11/K13 dan `t_099c813c`), jadi commit sebagian akan melanggar R8. Diputuskan tidak commit dan dicatat untuk keputusan Tech Lead: commit per kartu atau satu commit konsolidasi modul admin.

---

## t_67576fb2 — Tone badge §4.21 v2.1 (`-strong`) + badge diskon solid (T1/T3/T4/T5/T6)

### Rencana ringkas
- Diubah: `resources/js/Components/StatusBadge.jsx` (peta `CLASSES` + komentar), `resources/js/Components/PriceBlock.jsx:23` (badge diskon), `resources/js/Pages/Admin/Messages/Index.jsx:304,306` dan `resources/js/Pages/Admin/Reviews/Index.jsx:279` (override tone halaman).
- Dibuat: `resources/js/Components/Badge.jsx` (katalog komponen §1), harness `tmp/verify-badge-tone.mjs` + `tmp/build-badge-tone-check.mjs`, cek CSS `tmp/cek-urutan-css-t_67576fb2.py`.
- Komponen dipakai ulang: `StatusBadge` (tanpa varian baru), `cn()` dari `resources/js/lib/format.js`. State UI tidak berubah — hanya kelas warna; label, peta status, dan perilaku tetap.

### Validasi tiga arah
- PRD/desain vs kartu: §4.21 v2.1 menetapkan teks badge selalu < 24px (`text-badge`) → ambang 4,5:1, sehingga `warning` (2,86:1) dan `success` (2,96:1) di atas tint wajib `-strong`; `accent` tetap `bg-accent-500 text-ink` (10,11:1), `neutral` `bg-slate-200/60 text-slate-600` (6,17:1). T1/T3/T4/T5/T6 di §11.4 = bentuk lama. Tidak ada fitur ditunda/tambahan yang dibangun.
- Desain vs kontrak: tidak ada key data baru. Peta status tetap `pending`→warning, `dibayar`/`diproses`/`dikirim`→brand, `selesai`→success, `batal`→danger, status di luar daftar (mis. "Sudah dibaca" §5.12, arsip)→neutral. `Badge` mengikuti `docs/komponen.md` §1 (`tone`, `children`); `tone` di luar daftar jatuh ke `brand` (asumsi dicatat di `docs/asumsi.md` butir 17).
- Kelayakan teknis: Tailwind v3 JIT + `cn()` (tanpa `clsx`/`tailwind-merge`, lihat Temuan). Override tone di halaman mengandalkan **urutan selector** di CSS terkompilasi, jadi urutan itu diverifikasi eksplisit lewat skrip, bukan diasumsikan.

### Verifikasi (bukti mentah: `docs/bukti-frontend-t_67576fb2.txt`)
- Harness render `node tmp/build-badge-tone-check.mjs && node tmp/verify-badge-tone.bundle.mjs` → **exit 0, 91/91 lulus, 0 gagal**: 11 kasus `StatusBadge` (termasuk status `null`, `"PENDING"` tanpa spasi, label override), 3 kasus override halaman, 8 tone `Badge`, 9 kasus `PriceBlock` (solid, `size="sm"`, harga string, `comparePrice` null/< harga). **Kontrol negatif 5 bentuk lama tertangkap** (token dasar, `slate-500` di atas tint, `text-white` di atas accent, tint accent, tint sale) + 2 kontrol positif (teks meta `slate-500` di atas putih dan badge diskon solid TIDAK ditandai).
- `python docs/qa/kontras-badge.py` → exit 0: 7 tone §4.21 + 7 tone solid + 3 token `-strong` cocok hitungan WCAG 2.1. `node token-check.mjs` → exit 0, 55 token ter-resolve.
- `npm run build` → **exit 0** (CSS `assets/app-McaDlWlw.css` 57,34 kB; CSS lama `app-C3jmhCfT.css` hilang). Urutan CSS: `text-success-strong` (34260) > `text-slate-600` (34174), `text-warning-strong` (34351) > 34174, `bg-success/10` (26494) > `bg-slate-200/60` (26267), `bg-warning/10` (26628) > 26267 → semua override halaman MENANG; `.bg-sale-500{` ADA sedangkan `.bg-sale-500\/10` dan `.text-sale-500{` TIDAK ADA.
- Sapuan: `tmp/cek-komponen-tanpa-import.py .` (81 berkas; hanya `app.jsx: App`, false positive parameter `setup`) dan `tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` (49 chunk) → bersih (exit 0). Tidak ada `NaN`/`undefined`/placeholder baru; teks & label dari server ditampilkan apa adanya.
- Belum diuji: **tampilan visual dan interaksi nyata di browser belum diuji, butuh browser** (server milik pemilik). Yang belum tercakup: pengukuran kontras di layar (di sini dihitung, bukan diukur), responsif 360/768/1024/1280, zoom 200%, keyboard, `prefers-reduced-motion` (tidak ada animasi pada perubahan ini).
  Instruksi aman untuk pemilik: jalankan server yang biasa dipakai, buka `http://127.0.0.1:8000`, login admin, buka menu **Pesan** dan **Ulasan** — pil "Sudah dibaca" hijau tua dan "Belum dibaca" coklat tua (bukan kuning/hijau muda), baris ulasan tampil hijau tua; lalu buka kartu produk yang punya `compare_price` — badge diskon harus merah **solid** dengan teks putih.

### Temuan (di luar lingkup kartu ini)
- **Tailwind memindai komentar JSX.** Selama komentar `Badge.jsx` masih menulis literal `bg-sale-500/10 text-sale-500`, dua selector itu tetap ter-generate ke CSS meski tak ada pemakai di kode; setelah komentar diperbaiki, CSS bersih. Hindari menulis literal kelas terlarang di komentar.
- **Override `className` StatusBadge rapuh selama `tailwind-merge` tidak ada** — yang menang adalah urutan selector, bukan urutan kelas. Terbukti aman untuk success/warning (offset di atas), tetapi `bg-danger/10` (24638) dan `text-danger-strong` (32065) berada **sebelum** `bg-slate-200/60` (26267) dan `text-slate-600` (34174), jadi override tone **danger** di atas pil neutral tidak akan menang. Belum ada pemakai danger; bila nanti perlu, `tailwind-merge` (butuh izin paket) atau pilih tone lewat prop peta status, bukan `className`.
- Harness sempat memberi **false positive** sendiri saat kartu saudara `t_90759be9` selesai (`text-slate-400`→`text-slate-500` pada harga coret, diwajibkan §11.4 T2): assert lama melarang `text-slate-500` di seluruh markup. Assert diperbaiki jadi per-atribut-class (konteks pil/badge) + kontrol positif, lalu 91/91 lulus.
- `Badge.jsx` belum ada pemakai; badge "Grosir" di `ProductCard.jsx` masih inline (lingkup kartu lain).
- **Status commit (R8):** belum commit — `PriceBlock.jsx` adalah berkas bersama dengan kartu `t_90759be9`, dan `resources/js/Pages/**` belum pernah masuk git; konsisten dengan keputusan Tech Lead yang dicatat di kartu sebelumnya.


## Kartu t_950a38ca — error per blok: tiga blok dashboard lanjutan (stok kritis, pesanan terbaru, ulasan terbaru)

### Rencana ringkas
- Berkas baru: `tmp/kontrol-negatif-t_950a38ca.py`, `tmp/bukti-t_950a38ca.sh`, `tmp/bukti-kontrol-negatif-t_950a38ca.sh`, `docs/bukti-frontend-t_950a38ca.txt`, `docs/bukti-kontrol-negatif-t_950a38ca.txt`. Berkas diubah: `resources/js/Pages/Admin/Dashboard.jsx` (tiga blok), `tmp/verify-dashboard-cta.mjs` (assert baru + helper `blockBetween`), `docs/catatan-frontend.md`.
- Komponen dipakai ulang: `ErrorState` (judul baku `Gagal memuat data`, tombol "Coba lagi" lewat `onRetry`, `supportHref={null}`) dan `DataTable` (prop `error`/`onRetry` sudah ada). Tidak ada komponen, teks, rute, atau dependensi baru.
- State UI disentuh: hanya state galat ketiga blok. Empty/loading/ada-data dan blok grafik (kartu `t_8bca0661`) tidak diubah dan dijaga assert regresi.

### Validasi tiga arah
- PRD/brief vs desain: design §5.11 mensyaratkan state **error per blok**; sebelumnya ketiga blok tetap menampilkan empty state masing-masing (`Stok aman`, `Belum ada pesanan`, `Belum ada ulasan`) walau prop `error` halaman terisi — galat menyamar sebagai data kosong. Judul dan aksi galat diambil dari `ErrorState`/`DataTable` (design §442), bukan teks baru.
- Desain vs kontrak: prop halaman `error` (string|null), `loading`, dan `reload` = `router.reload()` (Inertia; tanpa rute/endpoint baru). `docs/kontrak-props.md` §6.13 masih hanya memuat `stats` — `low_stock`, `recent_orders`, `recent_reviews`, `loading`, `error` belum ditulis backend (status DRAFT); harness dijalankan terhadap bentuk asumsi, bukan integrasi server. Ketidakcocokan tetap tercatat untuk Tech Lead.
- Kelayakan teknis: tanpa perubahan resolver, layout, atau dependensi; `ErrorState` dan `DataTable` sudah menerima `error`/`onRetry`, jadi cukup meneruskan prop di tiga blok. Verifikasi memakai harness esbuild + `react-dom/server` yang sudah ada (tanpa paket baru).

### Verifikasi (bukti mentah: `docs/bukti-frontend-t_950a38ca.txt`)
- Harness `node tmp/build-dashboard-cta-check.mjs && node tmp/verify-dashboard-cta.bundle.mjs` → **exit 0, 81/81 lulus, 0 gagal** (sebelumnya 54/54; 27 assert baru). Assert baru memeriksa tiap blok terisolasi (`blockBetween`): `ErrorState` ber-`role="alert"`, judul galat baku `Gagal memuat data` (tepat 3×), pesan galat server tampil apa adanya (`koneksi gagal`), aksi "Coba lagi" ada dan berbentuk tombol (bukan tautan), empty state `Stok aman`/`Belum ada pesanan`/`Belum ada ulasan` TIDAK tampil, blok tidak menyisakan tautan CTA, dan "Coba lagi" total 5× (ringkasan halaman + grafik + tiga blok) — membuktikan `onRetry` sampai ke tiap blok.
- **Kontrol negatif** (`docs/bukti-kontrol-negatif-t_950a38ca.txt`, skrip `tmp/kontrol-negatif-t_950a38ca.py`): dengan tiga cabang itu dikembalikan sementara ke empty state, harness **exit 1, 63/81 lulus, 18 gagal** dan seluruh kegagalan berada di ketiga blok (mis. blok "Stok kritis" menampilkan "Stok aman"). Jadi assert baru benar-benar menangkap gejala kartu. Berkas lalu dipulihkan dari salinan dan diverifikasi `sha256` identik (`b6edd0374dc1b483f89e93886063924e6754fd8b5b7edb7cf28627c16cea6c69`) — tidak ada pekerjaan kartu lain yang hilang.
- `npm run build` → exit 0 (20-10-2026 15:44, 714 modul, `public/build/assets/Dashboard-BFxrpHhh.js` 12,01 kB, `manifest.json` 18,36 kB).
- Sweep `tmp/cek-komponen-tanpa-import.py .` (exit 0) dan `tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` (exit 0) → bersih (hanya `app.jsx: App`, false positive parameter `setup`).
- Belum diuji: **klik nyata di browser belum diuji, butuh browser** — server/kredensial milik pemilik dan agent tidak menyalakan server. Belum tercakup: komposisi visual `ErrorState` di dalam tiga blok, responsif 360/768/1024/1280 px, keyboard/tab ke "Coba lagi", zoom 200%, kontras.
  Instruksi aman untuk pemilik: dengan sesi admin aktif buka `http://127.0.0.1:8000/admin`; bila props `error` terisi (mis. putuskan koneksi tepat saat `router.reload()`), blok "Stok kritis", "Pesanan terbaru", dan "Ulasan terbaru" harus menampilkan "Gagal memuat data" + pesan galat apa adanya + tombol "Coba lagi", bukan "Stok aman"/"Belum ada pesanan"/"Belum ada ulasan".

### Temuan lanjutan (di luar lingkup kartu ini)
- **hotspot: resources/js/Pages/Admin/Dashboard.jsx** — berkas ini disentuh bersamaan oleh kartu kontras token `t_90759be9` (pukul 15:42:00 mengubah `text-danger`→`text-danger-strong` di baris 208 dan `text-warning`→`text-warning-strong` di baris 263). Perubahan kedua kartu koeksis di berkas. Kontrol negatif kartu ini memakai salinan berkas + verifikasi `sha256` dengan jendela perubahan < 1 detik, sehingga tidak menimpa hasil kartu lain; kartu berikutnya yang menyentuh berkas ini sebaiknya memakai pola salinan+hash yang sama.
- Ketidakcocokan kontrak `docs/kontrak-props.md` §6.13 (props dashboard lanjutan masih DRAFT) belum berubah sejak kartu `t_8bca0661`; masih menunggu backend/Tech Lead.
- Status commit (R8 "satu kartu satu commit"): tetap tidak ada commit per kartu — `resources/js/Pages/**` belum masuk git dan `Dashboard.jsx` adalah berkas bersama banyak kartu (alasan lengkap di catatan kartu `t_8bca0661`).

---

## Kartu t_90759be9 — kontras & token warna semantik (non-badge)

Rencana (5 langkah): (1) audit §11.4 T1/T2/T3/T4/T6; (2) skrip baris-eksak di scratch (bukan sed) + verifikasi per edit; (3) jalankan build/token-check/kontras-badge; (4) ukur matriks kontras dari token repo; (5) lampirkan bukti + serahkan temuan surface ke UIUX.

Validasi tiga arah:
1. PRD/brief vs desain: §11.4 baris terakhir kolom "Diteruskan" menyebut persis kartu ini (T1/T2/T3/T4 + T6; T5 debounce/badge = kartu t_67576fb2). Tidak ada fitur baru yang dikerjakan.
2. Desain vs kontrak: yang diubah hanya kelas tampilan; tidak ada key data, rute, atau status baru. `tailwind.config.js` tidak disentuh (tidak ada token dihapus/ditambah); pemakaian dasar `success/warning/danger` tetap untuk ikon + latar tint (§2.6 butir 5, §11.4 T4).
3. Kelayakan: komponen/layout/helper yang ada dipakai ulang (`cn()`, `Card`, `Field`, `Button`); satu edit CSS di `resources/css/app.css` (teks galat kolom ikut aturan §2.6 butir 5).

Yang dikerjakan: 71 edit baris pada 37 berkas (T1 50, T2 2, T3 6, T4 5, T3/T4 2, T6 6). `text-slate-400` pada teks informatif -> `text-slate-500`; teks token state < 24px -> varian `-strong`; ikon success/warning di dalam chip tint -> `-strong`. Ikon/aria-hidden/dekoratif/disabled sengaja tidak diubah (aturan §2.1).

Verifikasi (dijalankan, 20 Okt 2026): `npm run build` exit 0 ("✓ built in 3.86s", 50 artefak, app-DJeiCYJZ.js 361.816 B); `node token-check.mjs` -> "OK: semua 55 token ter-resolve"; `python docs/qa/kontras-badge.py` -> EXIT 0, tabel §4.21 cocok (skrip tidak diubah); sapu `tmp/cek-komponen-tanpa-import.py` (81 berkas) dan `tmp/cek-bundel-identifier-bebas.py` (49 chunk) bersih - hanya false positive `app.jsx: App`. Bukti lengkap: `docs/bukti-frontend-t_90759be9.txt` (221 baris: daftar edit, sisa grep 65->14 + alasan per baris, matriks kontras, temuan).

Known issue (dikembalikan ke UIUX, tidak diputuskan di sini): `text-slate-500` di atas `bg-surface` = **4,40:1** (gagal AA 4,5:1) di 9 titik hasil edit ini; angka 4,76:1 di §2.1/§11.4 terukur di atas putih, sementara §4.24 sendiri sudah memakai `slate-500` di atas `surface`. Dua alternatif (biarkan vs token khusus surface) ada di bukti + komentar kartu UIUX `t_8cd61512`. Belum diuji di browser: responsif, zoom 200%, keyboard, pengukuran kontras di layar (hitungan di sini dari token repo). Tidak ada commit dari kartu ini.

## t_e5149746 — Halaman Admin Kategori & Akun (2026-10-20)

Rencana ringkas: ganti stub `resources/js/Pages/Admin/Categories/Index.jsx` dan `Admin/Accounts/Index.jsx` dengan halaman penuh mengikuti pola `Admin/Messages/Index.jsx` (PageHeader + toolbar SearchInput/Select + DataTable + Pagination; form tambah/ubah di `Modal size="lg"`; hapus lewat `ConfirmDialog` lokal). Komponen dipakai ulang: AdminLayout, PageHeader, DataTable, SearchInput, Select, Field, Input, Textarea (kategori), Button, Modal, Pagination, StatusBadge, InlineNotice, Toast, ikon dari `Components/icons.jsx`. State UI: `navLoading` (router.get preserveState/preserveScroll/replace), `navError` + tombol "Coba lagi", `form.processing` (kirim ganda dicegah), `flash.success`/`flash.error` -> Toast, galat validasi per kolom tampil di dalam modal, masker konfirmasi hapus.

Validasi tiga arah:
- PRD §9 + design §5.12: tombol Hapus untuk akun sendiri `disabled` + alasan tertulis di baris itu (aria-describedby); server juga menolak lewat `errors.akun`.
- Kontrak §12.8-§12.11 / §12.19-§12.22: key, enum (`role` owner|admin|staff; filter `status` semua|aktif|nonaktif), bentuk paginator `{data, links, meta}`, `is_self`, `ringkasan` dipakai persis. Tidak ada rute GET tambah/ubah, jadi tautan mati `/admin/kategori/tambah` dan `/admin/akun/tambah` di stub dihapus dan form dikerjakan inline di modal.
- Penolakan hapus dari server (`errors.kategori` / `errors.akun`) ditampilkan di dalam dialog konfirmasi, bukan disamarkan sebagai sukses.
- "Minimal satu owner aktif" (PRD §9 / kontrak §12.21-§12.22) tidak dicek di klien: server penentu, halaman hanya menampilkan pesan penolakan.

Asumsi kecil (celah non-penghalang):
- Microcopy teks kosong dan teks bantuan tidak ada di dokumen desain; ditulis konkret dan dicatat di sini.
- Kolom Status memakai tone `neutral` StatusBadge (§4.21: status di luar daftar -> neutral), dibedakan lewat label, bukan hanya warna.
- Password kosong saat ubah dihapus dari payload (`form.transform`) supaya aturan server `nullable|min:8` tidak menolak string kosong.
- Fokus awal dialog konfirmasi diatur ke tombol Batal (design §5.12/§4.24) lewat efek setelah focus-trap `Modal`.

Verifikasi (2026-10-20):
- `npm run build` -> exit 0, 714 modul, "built in 4.30s".
- `python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` -> 49 chunk, tidak ada identifier JSX tanpa import/definisi.
- `python tmp/cek-tautan-admin-vs-rute.py` -> 42 url admin vs 41 rute: LULUS (URL dinamis PUT/DELETE kategori & akun cocok).
- Belum diuji, butuh browser: interaksi runtime (buka/tutup modal, kirim ganda, fokus awal Batal, responsif 360/768/1024/1280, keyboard, zoom 200%, kontras).

## t_954abfe8 — 29 titik teks meta → `text-slate-600` (design §2.1 v2.2 / §11.4 T7) (2026-10-20)

Rencana ringkas: jalankan applier anchor-based `docs/qa/terapkan-meta-v22.py` (29 titik / 13 berkas, satu pemetaan `text-slate-500` → `text-slate-600`), verifikasi byte-level terhadap snapshot, lalu gate `docs/qa/sweep-meta-surface.py` + `npm run build` + gate token/kontras. Tidak ada komponen, layout, teks, atau rute baru; struktur JSX tidak berubah.

Validasi tiga arah:
- PRD/desain: aturan §2.1 v2.2 (tabel "Teks meta non-badge (v2.2)") + §11.4 T7 sudah mengunci 29 titik di 13 berkas dengan pemetaan kelas per konteks; §9 baris 11 & 20 merujuk aturan yang sama. Dokumen acuan tidak diubah (larangan kartu).
- Desain vs kontrak data: tidak ada key, tipe, enum, format uang/tanggal, paginasi, filter, atau aksi yang tersentuh — perubahan hanya kelas warna teks pada elemen yang sudah ada.
- Kelayakan teknis: 13 berkas nyata ada dan cocok dengan daftar §11.4 T7; applier memakai anchor byte-exact (aman terhadap pergeseran baris, berhenti bila anchor hilang); line ending LF dipertahankan; `slate-600` adalah token bawaan konfigurasi Tailwind sehingga `tailwind.config.js` tidak disentuh.

Verifikasi (dijalankan, 20 Okt 2026):
- `python docs/qa/terapkan-meta-v22.py --cek` → exit 0, "DRY RUN: 29/29 titik siap diubah … Tidak ada berkas ditulis".
- `python docs/qa/terapkan-meta-v22.py` → exit 0, "OK: 29/29 titik diterapkan di 13 berkas (line ending dipertahankan)".
- Verifikasi byte-level (snapshot sebelum vs sesudah, normalisasi `600`→`500` lalu bandingkan byte): 13/13 berkas identik selain penggantian; tidak ada baris, spasi, atau CRLF lain berubah; `text-slate-500` di `resources/js` 95 → 66.
- `python docs/qa/sweep-meta-surface.py .` → exit 0, Check A **29/29 selesai** (belum 0), Check B **kandidat 0**, 48 TINJAU (di luar 29 titik), Check C 66 sisa.
- `npm run build` → exit 0 ("✓ built in 2.52s"); bundel `public/build/assets/app-C4SfSLQH.css` memuat `.text-slate-600{…color:rgb(71 85 105…)}` (= #475569) dan `.text-slate-500` tetap `rgb(100 116 139)`.
- `node token-check.mjs` → "OK: semua 55 token ter-resolve"; `python docs/qa/kontras-badge.py` → EXIT 0 (7 tone + 7 tone solid cocok).
- Sapu `tmp/cek-komponen-tanpa-import.py` (81 berkas) dan `tmp/cek-bundel-identifier-bebas.py` (49 chunk) bersih; satu-satunya temuan `app.jsx: App` adalah false positive yang sudah dikenal.
- Bukti lengkap: `docs/bukti-frontend-t_954abfe8.txt` (14 bagian: dry run, terapan, byte-level, gate, idempotensi, build, grep CSS, gate token/kontras, dua sapu, daftar 29 titik, larangan, belum diuji).

Catatan / known issue:
- 48 baris TINJAU gate dan 66 sisa `text-slate-500` sengaja **tidak** diubah: di luar 29 titik keputusan (25 bersandar pada putih/kartu + 12 kandidat false positive + sisanya tanpa penanda latar), sesuai larangan kartu dan audit di `docs/bukti-uiux-t_14cad9e2.txt`.
- `docs/design.md` §9 baris 20 masih berbunyi "⏳ menunggu kartu frontend lanjutan … 0/29 titik". Status itu milik UIUX dan tidak saya ubah (dokumen acuan tidak boleh ditimpa); perlu pembaruan status oleh UIUX setelah kartu ini — dicatat sebagai komentar di kartu induk `t_14cad9e2`.
- Belum diuji di browser: tampilan nyata, kontras terukur di layar, responsif 360/768/1024/1280, keyboard, zoom 200%. Angka kontras di bukti berasal dari token repo + skrip WCAG (`docs/qa/kontras-meta.py`): `slate-600` di atas `surface` 7,00:1, `brand-100` 6,26:1, chip `slate-200/60` 6,50:1, `slate-200` 6,15:1.
- Tidak ada commit (R8), tidak ada server dijalankan, tidak ada migrasi/seeder; `.env` dan `tailwind.config.js` tidak disentuh.

## t_7ebfca05 — F1: Badge keranjang menampilkan jumlah item (2026-10-21)

Rencana ringkas (1 berkas kode): perbaiki sumber angka badge di `Layouts/PublicLayout.jsx` — helper `toCount` + urutan `page.props.cart.count` → prop halaman `cartCount` → `settings.cart_count` → `0`. `Components/Header.jsx` tidak diubah (sudah menyembunyikan badge saat 0). Tidak ada komponen, teks, rute, atau state baru; tidak ada perubahan backend, dokumen acuan, atau paket.

Validasi tiga arah:
- PRD/desain: kebutuhan kartu (badge jumlah item di header semua halaman publik, sembunyi saat 0, ikut berubah setelah aksi keranjang) sudah punya dasar visual di design §3.1 — struktur header (logo → menu → ikon Cari/Keranjang/Masuk) dan "Badge keranjang: `size-[18px] rounded-full bg-accent-500 text-badge text-ink`". Kelas yang dirender `IconButton` (`h-[18px] min-w-[18px] rounded-full bg-accent-500 px-1 text-badge text-ink`) cocok persis, jadi tidak ada keputusan tampilan baru dan tidak perlu block. Tidak ada fitur yang ditunda tersentuh.
- Desain vs kontrak: satu-satunya data yang dipakai adalah props bersama `cart.count` (kontrak §1 + catatan §7: prop global `cart` (`{"count": n}`); server `HandleInertiaRequests.php:39-41` dari `cart_count` sesi, ditulis `CartService.php:427` sebagai jumlah `qty`). Ringkasan keranjang di props halaman tetap memakai key `keranjang` — tidak disentuh. Aksi tambah/ubah/hapus memakai rute yang benar-benar ada (`POST /keranjang` §7.2, `PATCH`/`DELETE /keranjang/{item}` §7.3–§7.4) dan semuanya kunjungan Inertia penuh tanpa `only`, jadi `usePage()` memperbarui badge tanpa reload manual. Nilai angka dari server bisa berbentuk string → dikonversi aman, tidak ada NaN/undefined di layar.
- Kelayakan teknis: `PublicLayout` dipakai 8 halaman publik (Home, Products/Index, Products/Show, Contact, Cart, Checkout, CheckoutPay, CheckoutSuccess); `Header` hanya dipakai `PublicLayout`, jadi satu titik perbaikan cukup untuk semua halaman. 4 halaman yang masih mengirim `cartCount` bawaan 0 dibiarkan apa adanya (jadi cadangan kedua, bukan penutup props bersama) agar diff minimal dan tidak bertabrakan dengan kartu lain di rantai F1→F3→F4→F5→F6→F2.

Verifikasi (dijalankan, 21 Okt 2026):
- `node tmp/cek-badge-keranjang-t_7ebfca05.mjs` → exit 0: 11 kasus ekspresi baru (angka, string `"4"`, `0`, `null`, `undefined`, `"abc"`, `NaN`, `-2`, `2.7`, `""`) semuanya sesuai harapan, plus kontrol negatif yang mereproduksi bug pemilik (ekspresi lama dengan `cart.count=3` dan prop bawaan 0 → **0**) dan pemeriksaan `Header` (`badge={count > 0 ? count : null}`). Harness mengambil blok `toCount` + baris `const count = …` langsung dari berkas sumber, bukan implementasi ulang.
- `npm run build` → exit 0, **714 modul**, "✓ built in 10.15s" (log `tmp/build-t_7ebfca05.txt`); dijalankan sendirian sesuai catatan rantai kartu.
- Bundel rilis memuat logika baru: di `public/build/assets/PublicLayout-BYUxUlFg.js` ada `w=e=>{…Number.isFinite(t)&&t>0?Math.floor(t):0}` dan rantai `w(page.props.cart?.count) ?? w(cartCount) ?? w(settings.cart_count) ?? 0`.
- Sapu regresi: `python tmp/cek-komponen-tanpa-import.py .` (81 berkas) → hanya false positive dikenal `app.jsx: App`; `python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` (49 chunk) → OK, tidak ada identifier komponen tanpa import.
- Bukti lengkap: `docs/bukti-frontend-t_7ebfca05.txt`.

Catatan / known issue:
- Badge menampilkan angka apa adanya; desain §3.1 tidak mengatur pemotongan (mis. "9+") atau batas tampil, jadi tidak saya tambahkan — keputusan tampilan baru butuh design.md.
- Karena belum ada pengujian browser di sisi agent (server dijalankan pemilik, R11), tampilan nyata badge di 8 halaman publik, perubahan angka tanpa reload, responsif 360/768/1024/1280, keyboard, zoom 200%, dan kontras di layar dicatat **"belum diuji, butuh browser"** dengan langkah uji aman di bukti §8.
- `docs/review.md` F-1 menyebut 4 halaman publik mengirim `cartCount` bawaan 0; itu tetap benar, tetapi kini tidak lagi menutupi props bersama. Pembersihan prop mati itu di luar lingkup kartu ini.
- Tidak ada commit (R8), tidak ada server dijalankan, tidak ada migrasi/seeder; `.env` dan `tailwind.config.js` tidak disentuh. Berkas dokumen yang diubah agent lain pada sesi yang sama (design.md, kontrak-props.md, traceability.md, catatan-backend/techlead, pertanyaan-pemilik) tidak saya sentuh.

## t_5988a39e — F3: /admin/produk (daftar + Create/Edit/Show) (2026-10-21)

Rencana ringkas (7 berkas kode, 1 diubah + 6 dibuat): bangun ulang `Pages/Admin/Products/Index.jsx` terhadap props server nyata dan buat `Create.jsx`, `Edit.jsx`, `Show.jsx` + partial `ProdukForm.jsx`, `VarianEditor.jsx`, `DropzoneGalery.jsx`. Komponen dipakai ulang tanpa duplikasi: `PageHeader`, `DataTable`, `Pagination`, `SearchInput`, `Select`, `Field`, `Badge`, `StatusBadge`, `KpiCard`, `Modal`, `Toast`, `ErrorState/EmptyState/Skeleton` (lewat `DataTable`). State UI: `loading` (skeleton dari `DataTable`), `empty` (tanpa filter vs filter tanpa hasil), `error` (+ "Coba lagi"), `saving`/`deleting` (tombol nonaktif, cegah kirim ganda), `validation-error` (galat server per kolom lewat `errors.*`, data isian tidak hilang), `success` (flash server → `Toast`).

Validasi tiga arah:
- PRD/desain: DoD kartu punya dasar visual di design §5.12 — pola baku `PageHeader` → toolbar (search + filter) → `Table` → `Pagination`; form produk memang halaman terpisah (bukan `Modal` besar) karena butuh galeri + varian; hapus memakai dialog konfirmasi dengan nama entitas; state per halaman `loading`/`empty`/`error`/`saving`/`deleting`/`validation-error`/`success` (toast). Teks meta memakai `text-slate-500`/`text-slate-600` sesuai §2.1 v2.2 (tidak ada `text-slate-400`, yang kontrasnya 2,56:1). Tidak ada fitur yang ditunda PRD ikut dibangun.
- Desain vs kontrak: seluruh key berasal dari §12.1–§12.7 — `produk{data,links,meta}`, `filter{q,kategori,status,stok,urut}`, `kategori[]`, `ringkasan{total,aktif,nonaktif,stok_kritis}`, `ukuran_baku[]` (Create/Edit), detail §12.4 (`images[]`, `variants[]`, `ringkasan`), §12.6 (`_method=put`, `hapus_images[]`, `primary_image_id`). Tidak ada key, enum, atau rute karangan; semua aksi memakai literal rute `admin.produk.*` (tanpa `route()`/Ziggy). Nilai enum §12.1 dipakai persis (`aktif|nonaktif|semua`, `semua|habis|kritis`, `terbaru|nama|harga|stok`). Angka dari server dikonversi aman (`Number(x ?? 0)`), nilai kosong → "-", uang lewat `rupiah()`; tidak ada NaN/undefined di layar (dibuktikan harness).
- Kelayakan teknis: resolver `app.jsx` (`import.meta.glob`, tanpa eager) tidak disentuh; `AdminLayout` dan 12 komponen bersama sudah ada; batas kontrak dijalankan di klien sebagai bantuan UX (galeri maks 5 berkas, jpg/png/webp, 2 MB; varian 1–50 baris) sementara otorisasi/validasi harga-stok tetap milik server. Tidak ada paket baru, tidak ada perubahan `tailwind.config.js`.

Verifikasi (dijalankan, 21 Okt 2026):
- Harness SSR `tmp/render-produk-v2-t_5988a39e.mjs` (di-bundle esbuild, stub `@inertiajs/react`, react/react-dom external) → exit 0, **80 pemeriksaan OK / 0 GAGAL**: 19 kasus render (Index terisi/kosong/filter tanpa hasil/props hilang/angka-string, Create, Create kategori kosong, Edit, Edit tanpa gambar-varian, Edit props hilang → 0 karakter tanpa galat, Show, Show ringkasan null, Show kolom null, Toast sukses/galat, DataTable memuat/kosong/galat, Modal konfirmasi), 8 tautan literal, 22 assert sumber (rute+query, `preserveState`/`preserveScroll`, `onError`, `router.delete`, flash→toast, nilai enum, `_method`, `images_alt`, `hapus_images`, `primary_image_id`, `MAKS`, `price_delta`), dan 28 pemeriksaan larangan stack di 7 berkas. Log: `tmp/harness-t_5988a39e.txt`.
- Per kasus render: tidak ada `NaN`, `undefined`, `[Grafik Placeholder]`, `lorem ipsum`, `FIXME`, `TODO:`; setiap `<img>` punya `alt`; tidak ada teks informatif ber-`text-slate-400`.
- `npm run build` (Vite 6.4.4) → exit 0, **721 modul**, "✓ built in 13.26s" (log `tmp/build-t_5988a39e.txt`). Manifest memetakan 4 halaman ke chunk masing-masing dan semuanya menarik komponen bersama yang benar (`_DataTable`, `_EmptyState`, `_ErrorState`, `_Pagination`, `_KpiCard`, `_Toast`, `_Badge`, `_StatusBadge`, `_Modal`, `_PageHeader`, `_Breadcrumb`); `ProdukForm` menarik `DropzoneGalery` + `VarianEditor`. Kode baru terbukti ada di bundel rilis: `public/build/assets/Index-DB7lFkda.js` memuat "Gagal memuat daftar produk. Periksa koneksi lalu coba lagi." dan aksi retry datang dari `_ErrorState` ("Coba lagi", `Components/ErrorState.jsx:15`) yang dirender `Components/DataTable.jsx:42-46` saat `error` terisi.
- Gate `docs/qa/*.py` → kelimanya exit 0 (kontras-badge: SEMUA angka §4.21 cocok WCAG 2.1; sweep-meta-surface: LOLOS; terapkan-meta-v22: idempoten, 0 titik siap diubah). Sapu regresi: `cek-komponen-tanpa-import.py` (87 berkas) hanya false positive dikenal `app.jsx: App`; `cek-bundel-identifier-bebas.py` (59 chunk) satu temuan `DropzoneGalery -> FREE: P` yang diperiksa konteksnya = komponen lokal `UnggahIcon` (`DropzoneGalery.jsx:23`), jadi juga false positive. Log: `tmp/gate-t_5988a39e.txt`.
- Bukti lengkap: `docs/bukti-frontend-t_5988a39e.txt` (9 bagian).

Catatan / known issue:
- **Konflik dokumen (dilaporkan ke Tech Lead, tidak dipilih sendiri):** design §5.12 "Dropzone galeri (maks 6, urut bisa digeser)" vs kontrak §12.3 "`images[]` maks 5". UI memakai **maks 5** karena server memvalidasi 5 — berkas keenam pasti ditolak 422. "Urut bisa digeser" juga tidak bisa dibangun: §12.3/§12.6 tidak punya field urutan (hanya `hapus_images[]` + `primary_image_id`), jadi galeri tidak mengirim ulang urutan dan yang tersedia hanya pemilihan gambar utama. Butuh keputusan kontrak/desain, bukan karangan frontend.
- Rujukan seksi di kartu ("design.md §5.5-5.7") menunjuk halaman publik (login/register, keranjang, checkout); sumber desain yang benar-benar berlaku untuk modul ini adalah §5.12 (+§5.10 shell, §4 komponen). Dokumen acuan tidak diubah.
- Kontrak §12.23 masih menandai bagian Produk **DRAFT**; implementasi mengikuti bentuk yang tertulis saat ini, jadi perubahan kontrak berikutnya perlu penyesuaian halaman.
- Belum diuji, butuh browser: tampilan nyata 360/768/1024/1280 px, keyboard/tab order, zoom 200%, kontras terukur di layar, debounce search, navigasi filter tanpa reload penuh, toast setelah redirect flash, unggah multipart nyata (POST + `_method=put`), dan hapus produk. `curl` ke `http://127.0.0.1:8000/admin/produk` → **302** (server pemilik hidup, halaman admin butuh sesi), jadi bukti runtime end-to-end ada di tangan pemilik/QA (kartu anak `t_3a240a11`).
- Validasi sisi server (422 per kolom, SKU unik, efek `hapus_images[]`/`primary_image_id`) tidak bisa diuji dari frontend; itu lingkup backend/QA.
- Tidak ada commit (R8), tidak ada server dijalankan, tidak ada migrasi/seeder; `.env`, `tailwind.config.js`, `package.json`, dan dokumen acuan tidak disentuh. Berkas harness hanya di `tmp/`.

## t_321bf03c — F4: /admin/stok — daftar stok + riwayat pergerakan (2026-10-21)

Rencana ringkas (3 berkas kode: 1 diubah + 2 dibuat): bangun ulang `Pages/Admin/Stocks/Index.jsx` (510 baris; sebelumnya placeholder 25 baris, review F-4) terhadap props §12.12–§12.14; buat `Pages/Admin/Stocks/History.jsx` (343 baris) untuk §12.15; buat partial lokal `Pages/Admin/Stocks/partials/StokAksiModal.jsx` (193 baris) untuk stok masuk/keluar. Komponen bersama dipakai ulang tanpa menyentuh berkasnya (DoD-2): `AdminLayout`, `PageHeader`, `KpiCard`, `DataTable`, `Pagination`, `SearchInput`, `Select`, `Field`, `Input`, `Textarea`, `Button`, `Badge`, `Modal`, `Toast`, `InlineNotice` (+ state `Skeleton`/`ErrorState`/`EmptyState` lewat `DataTable`). State UI: `loading`, `empty` tanpa filter (ajakan menambah produk) vs `empty` karena filter (+ reset), `error` (+ "Coba lagi"), `saving` (kirim ganda dicegah), `validation-error` (galat server per kolom, `aria-describedby` + `aria-invalid`), `success` (flash server → `Toast`, modal ditutup).

Validasi tiga arah:
- PRD/desain: rujukan kartu "design.md §5.8" salah alamat — §5.8 adalah `/checkout/{order}/bayar` & `/selesai` (QRIS + kartu penilaian), bukan admin stok. Yang berlaku: design §5.10 (shell admin; baris 684 mendelegasikan isi sub-halaman ke "PRD §9") dan PRD baris 255 (`/admin/stok` = "Tabel per varian: produk, varian, stok, status. Filter 'stok kritis'" + "Stok masuk/keluar + catatan, riwayat movement"). Tampilan memakai pola baku §5.12 (PageHeader → KpiCard → toolbar → Table → Pagination) dan token §2.1 v2.2 (`text-slate-500`/`text-slate-600`, tidak ada `text-slate-400`). Tidak ada fitur yang ditunda PRD ikut dibangun.
- Desain vs kontrak: seluruh key dari §12.12 (`stok{data,links,meta}`, `filter{q,status,kategori,urut}`, `kategori[]`, `ringkasan{varian,habis,kritis}`), §12.15 (`riwayat{data,links,meta}`, `filter{q,tipe,varian}`, `varian[]`, `ringkasan{masuk,keluar,adjust,sale}`); enum dipakai persis (`semua|habis|kritis`, `nama|stok_terkecil|stok_terbesar`, `semua|in|out|adjust|sale`); aksi memakai literal rute yang ada `POST /admin/stok/{variant}/masuk` dan `/keluar` (tanpa `route()`/Ziggy). Ambang status baris mengikuti kontrak: 0 habis, 1–4 kritis, ≥5 aman. Angka dari server bisa string → `Number(x ?? 0)`, nilai kosong → "-", tanggal `formatDateTime()`, `signed_qty` tampil bertanda; tidak ada NaN/undefined di layar.
- Kelayakan teknis: resolver `app.jsx` (`import.meta.glob`, tanpa eager) tidak disentuh sehingga `Admin/Stocks/History` langsung dipetakan; `AdminLayout` + komponen bersama sudah ada; partial ditaruh lokal justru karena DoD-2 melarang mengubah `Components/*`. Tidak ada paket baru, tidak ada perubahan `tailwind.config.js`, tidak ada perubahan backend/rute/dokumen acuan.

Verifikasi (dijalankan, 21 Okt 2026):
- Harness SSR + statik `tmp/uji-ssr-stok-t_321bf03c.mjs` → exit 0, **23 uji / 0 gagal** (S1–S6: larangan fetch/SPA/`route()`/storage, impor relatif ada di disk, props ⊆ yang dikirim `StockController`, URL literal = rute `admin.php`, tidak ada teks placeholder; I1–I8: daftar terisi, ambang status, dua ragam kosong, props hilang/null, angka string, filter terpilih, modal setel; H1–H5: riwayat terisi, ringkasan, dua ragam kosong, props hilang `signed_qty` null; M1–M3: modal masuk/keluar + galat; D1: DataTable tiga keadaan). Log `tmp/hasil-ssr-t_321bf03c.txt`.
- Harness interaksi `tmp/uji-aksi-stok-t_321bf03c.mjs` (react → shim, `@inertiajs/react` → stub pencatat; bukan browser) → exit 0, **16 uji / 0 gagal**: A1–A7 (urut tabel, filter status/kategori/urut via `router.get` literal, debounce pencarian 300 ms, reset filter, tiga keadaan memuat/galat/kosong, paginasi hanya bila `last_page > 1`, aksi baris), B1–B6 (pesan validasi klien per kondisi tanpa memanggil server, kirim sah + URL/data/opsi Inertia + tutup saat sukses, mode keluar, kirim sekali saat server memproses, varian null → tombol mati tanpa URL `/null/`, galat server per kolom `aria-describedby` + galat lain jadi notice), C1–C3 (filter riwayat, galat riwayat bukan "kosong", pencarian riwayat ber-debounce). Log `tmp/hasil-aksi-t_321bf03c.txt`.
- `npm run build` → exit 0, **723 modul**, "✓ built in 40.70s" (`tmp/build-t_321bf03c.txt`). Kode halaman baru terbukti ada di bundel rilis: `public/build/assets/Index-D_xtpihP.js` ("Pantau stok per varian…") dan `public/build/assets/History-DnaYmjrN.js` ("Riwayat pergerakan stok…"). Dijalankan sendirian sesuai catatan rantai: sebelum build dicek tidak ada kartu frontend lain berstatus `running` (`tmp/papan-jalan-t_321bf03c.py` → hanya `t_321bf03c`).
- Gate `docs/qa/*.py` → keempatnya exit 0 (kontras-badge: semua angka §4.21 cocok WCAG 2.1; sweep-meta-surface: LOLOS; audit-penanda-meta & kontras-meta: exit 0 dengan kandidat pra-ada di halaman non-F4). Sapu regresi: `python tmp/cek-komponen-tanpa-import.py .` (89 berkas) → hanya false positive dikenal `app.jsx: App`; `python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` (61 chunk) → satu temuan `DropzoneGalery -> FREE: P` yang sudah dinilai false positive di F3; `python tmp/cek-tautan-admin-vs-rute.py` → "LULUS: semua url admin cocok dengan rute terdaftar pada metode yang benar" (2 URL F4 masuk daftar "konteks tidak dikenal" = info, bukan pelanggaran).
- Pemeriksaan statis berkas F4: bersih dari `gradient`, `bg-grid`, `shadow-`, `animate-`, `dangerouslySetInnerHTML`, `localStorage`/`sessionStorage`, dan `<img>`.
- Bukti lengkap: `docs/bukti-frontend-t_321bf03c.txt`.

Catatan / known issue:
- Empat permintaan kartu tidak didukung kontrak — dicatat, tidak dikarang (komentar kartu sudah dikirim): (1) kolom "nilai minimum" tidak ada di §12.12 maupun PRD baris 255, jadi baris tabel = produk, varian, SKU, stok, status; (2) aksi "set stok" absolut tidak punya rute (`admin.stocks.*` hanya masuk/keluar) → dilayani modal penjelas + tautan form produk `GET /admin/produk/{product}/ubah`, karena §12.4/§12.6 memang mencatat selisih stok dari form sebagai `adjust`; (3) "stok sebelum → sesudah" tidak bisa ditampilkan — `database/migrations/2026_10_20_000007_create_stock_movements_table.php` tidak punya kolom before/after dan §12.15 hanya memberi `qty` + `signed_qty` + `tipe_label` (itulah yang tampil); (4) "filter tanggal" tidak ada — §12.15 hanya menerima `q, tipe, varian, page`. Perlu keputusan backend/desain bila memang diinginkan.
- Catatan kontrak kecil: `varianOptions()` backend mengirim `sku` tambahan yang tidak ada di contoh §12.15; field itu dipakai apa adanya di dropdown (tidak dikarang, hanya superset) — sama polanya dengan temuan F3.
- Belum diuji, butuh browser: tata letak nyata 360/768/1024/1280 px, urutan tab & fokus di modal, zoom 200%, kontras terukur di layar, debounce nyata, navigasi filter tanpa reload penuh, dan aksi stok end-to-end (POST butuh sesi admin). Uji runtime ada di kartu anak QA `t_3a240a11`.
- Validasi sisi server (batas `qty` 1–100000, `note` maks 255, "Stok tidak cukup", kunci baris/transaksi) tidak dapat diuji dari frontend; itu lingkup backend/QA.
- Tidak ada commit (R8), tidak ada server dijalankan, tidak ada migrasi/seeder; `.env`, `tailwind.config.js`, `package.json`, dan dokumen acuan tidak disentuh. Berkas harness & log hanya di `tmp/`.

## F5 — /admin/pesanan: daftar + detail pesanan (kartu t_018b2723, 21 Okt 2026)

Rencana (ditulis sebelum implementasi) dan hasil:
- `resources/js/Pages/Admin/Orders/Index.jsx` — stub 26 baris yang memakai prop `pesanan` lokal (sumber bug pemilik F-4) diganti halaman kontrak §12.16: KPI ringkasan, pencarian ber-debounce, filter status/bayar/tanggal, tabel, paginasi. Filter, urutan, dan halaman lewat query string (`router.get('/admin/pesanan', …, {preserveState, preserveScroll, replace})`) sehingga server tetap sumber hasil.
- `resources/js/Pages/Admin/Orders/Show.jsx` (baru) — detail §12.17: status pesanan/pembayaran, pembeli + alamat, daftar item, rincian biaya, bukti pembayaran, blok resi, aksi ubah status (modal), toast flash.
- `resources/js/Pages/Admin/Orders/partials/{KartuBagian,BuktiPembayaran,InfoResi,UbahStatusModal}.jsx` (baru) — komponen lokal. **DoD-2 dipatuhi: tidak ada berkas di `resources/js/Components/*` yang diubah.**
- Aksi hanya memakai rute yang sudah ada: `admin.orders.index|show|status` (`/admin/pesanan`, `/admin/pesanan/{order}`, `PATCH /admin/pesanan/{order}/status`).
- Label status/pembayaran/opsi lanjutan dari server (`status_label`, `payment_label`, `status_berikut`); klien tidak mengarang label. Angka dinormalkan dengan aman dan nilai kosong tampil `-` (KPI ringkasan, "Menampilkan X dari Y") — tidak ada `NaN`/`undefined`.
- Validasi tiga arah: kebutuhan kartu punya layar & state (daftar, detail, modal); nama key/tipe/enum/format uang & tanggal/paginasi/filter cocok §12.16–§12.18; resolver halaman + komponen yang sudah ada dipakai ulang.

Verifikasi (dijalankan, 21 Okt 2026):
- Harness SSR + statik `tmp/uji-ssr-pesanan-t_018b2723.mjs` (stub Inertia `tmp/stub-inertia-t_321bf03c.mjs`) → exit 0, **26 uji / 0 gagal**: S1–S7 (tanpa fetch/SPA/`route()`/storage/`dangerouslySetInnerHTML`; impor relatif ada di disk; props halaman ⊆ props `OrderController`; URL literal = rute `admin.php`; tanpa teks placeholder & tanpa isian resi tanpa rute; state galat punya "Coba lagi"); I1–I8 (daftar terisi + KPI + hitung + paginasi; dua ragam kosong — tanpa filter vs terfilter; props hilang/null; angka string & null; filter terpilih; ringkasan/meta hilang → `-`; penanganan flash); H1–H8 (detail terisi; status final → tombol nonaktif + penjelasan; bukti pembayaran ada/kosong/QR kosong; item & catatan kosong; props hilang; notice temuan resi; flash); M1–M3 (modal: label server, opsi status, tombol simpan, galat per kolom via `aria-describedby`).
- Kontrol negatif: sabotase sementara (judul kosong Index dijadikan konstan + judul notice `InfoResi` dipendekkan) → **exit 1, tepat I3 + H7 gagal**; setelah dikembalikan → exit 0. Assert terbukti menangkap regresi.
- `npm run build` → exit 0, "✓ built in 2.82s"; halaman baru terbukti ada di bundel rilis (`public/build/assets/Index-DH9fHr4J.js`).
- Bukti lengkap: `docs/bukti-frontend-t_018b2723.txt`.

Catatan / known issue:
- **Nomor resi manual (PRD A15) belum bisa disimpan.** Tidak ada kolom resi di `database/migrations/2026_10_20_000010_create_orders_table.php`, tidak ada rute resi di `routes/admin.php` (hanya `orders.index|show|status`), dan `docs/kontrak-props.md` §12.17 tidak punya field resi/`tracking_number`. Kartu mewajibkan "catat temuan, jangan bangun rute baru", jadi kolom isian tidak dibangun; detail pesanan menampilkan notice jujur (`InfoResi`: "Nomor resi belum bisa diisi") + arahan pencatatan manual. DoD "nomor resi bisa disimpan" **belum terpenuhi** sampai kontrak + backend menambah field dan rute simpan; kartu lanjutan sudah dibuat untuk itu.
- Aksi lain yang disebut pemilik (retur/refund) tidak ada di PRD/kontrak → tidak dibangun.
- Belum diuji, butuh browser: tata letak nyata 360/768/1024/1280 px, urutan tab & fokus di modal, zoom 200%, dan aksi ubah status end-to-end (PATCH butuh sesi admin). Instruksi aman untuk pemilik: buka `/admin/pesanan` dengan sesi admin, cek daftar + kombinasi filter + paginasi tanpa reload penuh, detail `/admin/pesanan/{id}`, modal "Ubah status" → simpan → status berubah + toast sukses, dan tombol nonaktif saat status final.
- Tidak ada commit (R8), tidak ada server/migrasi/seeder; `.env` dan dokumen acuan tidak disentuh.

## F6 — `/checkout/{order}/selesai`: gerbang penilaian menghormati `ulasan.boleh` (kartu t_2de36f29, 21 Okt 2026)

Berkas yang diubah: `resources/js/Pages/Public/CheckoutSuccess.jsx` (1 berkas kode; 54 insertions / 23 deletions) + dokumen ini + `docs/bukti-frontend-t_2de36f29.txt` (bukti). Tidak ada berkas backend, rute, migrasi, seeder, `package.json`, atau dokumen acuan yang disentuh.

Rencana (ringkas):
1. Baca ulang kontrak §7.9 + §9.1, design §5.8, `CheckoutController::success`, `ReviewService`, `ReviewForm`, `InlineNotice`.
2. Ganti satu gerbang di `CheckoutSuccess.jsx`: form penilaian tampil hanya bila `ulasan.boleh` **dan** syarat §9.1 terpenuhi; sisanya jadi notice alasan.
3. Notice "Terima kasih! …" (design §5.8) hanya saat semua produk sudah diulas, bukan setiap kali daftar form kosong.
4. Verifikasi: harness SSR (matriks state gerbang) + harness interaksi (kontrak pemanggilan `router.post`) + kontrol negatif + `npm run build` + sapu regresi.

Validasi tiga arah:
- Kartu/PRD vs desain: design §5.8 (blok `/checkout/{order}/selesai`) menyediakan state `paid`/`review-empty`/`review-submitting`/`review-submitted`/`review-error`, kartu penilaian per produk (gambar 64 px, "Seberapa puas kamu?", bintang 32 px interaktif, komentar 120 px, tombol "Kirim Penilaian"), dan teks pascakirim "Terima kasih! Penilaianmu membantu pembeli lain." + bintang readonly — semua punya tempat di halaman; tidak ada kebutuhan kartu yang tak berlatar desain.
- Desain vs kontrak: props `{ pesanan, ulasan: { boleh, sudah } }` (§7.9) dan aksi `POST /checkout/{order}/ulasan` (§9.1) memang ada; aturan boleh-dinilai §9.1 = `payment_status = settlement` **dan** `status` ∈ (`dibayar`, `diproses`, `dikirim`, `selesai`); nama key, enum status, dan format uang/tanggal dipakai persis.
- Kelayakan teknis: resolver `Pages/Public/...` sudah melayani halaman ini; komponen yang dipakai ulang (`PublicLayout`, `InlineNotice`, `ReviewForm`, `StarRating`) semua sudah ada; tanpa paket, rute, atau state library baru.

Temuan (kontrak vs server, dipakai sebagai dasar keputusan):
- Kontrak §7.9: "`ulasan.boleh` = order sudah `settlement` dan pembeli belum mengulas **semua** produk". Server mengirim `'boleh' => $reviewedProductIds === []` (`app/Http/Controllers/CheckoutController.php:176`), jadi `boleh` baru `true` bila belum ada ulasan **sama sekali**: setelah 1 dari 2 produk diulas, kontrak seharusnya masih `true` tetapi server mengirim `false`. Perilaku klien: gate `tampilkanForm = (boleh || kontradiksiBoleh) && syaratDinilai && pending.length > 0`, dengan `kontradiksiBoleh` hanya menyala saat `boleh=false` **tetapi** §9.1 terpenuhi dan masih ada produk belum dinilai — supaya produk yang masih bisa dinilai server tidak hilang dari layar. Cabang kontradiksi diberi komentar di kode dan dilaporkan ke Tech Lead; keputusan akhir (perbaiki server ke §7.9 atau perjelas kontrak) bukan milik frontend.
- DoD kartu terpetakan: belum lunas/batal → tanpa form + notice alasan (uji 5 & 6); lunas & belum diulas → form tampil (uji 1); sudah diulas → kartu terkunci + terima kasih (uji 3, 4, interaksi 3, 6).
- Microcopy notice alasan memakai kalimat server apa adanya (`ReviewController.php:29`, §9.1): "Ulasan bisa dikirim setelah pembayaran berhasil." — bukan teks karangan.

Verifikasi (dijalankan, 21 Okt 2026):
- Harness SSR `tmp/uji-ssr-ulasan-t_2de36f29.mjs` (renderToStaticMarkup, komponen asli + stub Inertia `tmp/stub-inertia-t_321bf03c.mjs`) → **exit 0, 13/13 lulus**: boleh=true tanpa ulasan; 1 dari 2 terulas; kuirk `boleh=false` sebagian; semua terulas; belum lunas; status batal; `boleh=true` tapi status belum boleh; `flash.error`; `errors.ulasan`; angka string → tanpa `NaN`; `items` kosong; props `ulasan` hilang; sapu kotor (NaN/undefined/placeholder) di semua state.
- Harness interaksi `tmp/uji-aksi-ulasan-t_2de36f29.mjs` (shim hook + stub Inertia pencatat) → **exit 0, 6/6 lulus**: `router.post('/checkout/21/ulasan', { ulasan: [{ product_id, rating, comment }] }, { preserveScroll: true, onSuccess, onFinish })`; kirim ganda ditahan (`busyProduct`, `submitting` per produk); `boleh=false` → nol panggilan router; galat validasi menempel pada produk yang dikirim; setelah semua terkirim form habis + terima kasih.
- Kontrol negatif: sabotase sementara (`tampilkanForm = pending.length > 0`) → **exit 1, tepat 3 assert gerbang gagal** (uji 5, 6, 7); dikembalikan → exit 0 dan `grep -c SABOTASE` = 0.
- `npm run build` → exit 0, "✓ 728 modules transformed.", "✓ built in 2.95s"; kode baru terbukti di bundel rilis `public/build/assets/CheckoutSuccess-BEtjHwYb.js` (grep tiga teks kunci). Build dijalankan saat tidak ada kartu frontend lain berstatus running.
- Sapu regresi: `python tmp/cek-komponen-tanpa-import.py .` (94 berkas) dan `python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` (69 chunk) → hanya dua temuan lama yang sudah dinilai false positive (`app.jsx: App`, `DropzoneGalery-*.js -> FREE: P`).
- Bukti lengkap per perintah: `docs/bukti-frontend-t_2de36f29.txt`.

Catatan / known issue:
- **Belum diuji, butuh browser**: tata letak 360/768/1024/1280 px, urutan tab & fokus keyboard pada bintang `StarRating`, zoom 200%, kontras terukur di layar, dan kiriman ulasan end-to-end (butuh sesi pembeli + CSRF). Instruksi aman untuk pemilik: buka `/checkout/{order}/selesai` dengan sesi pembeli — order lunas belum diulas → form per produk; order belum lunas → tanpa form + notice alasan; sesudah semua produk dinilai → kartu terkunci + terima kasih.
- Server `ulasan.boleh` menyimpang dari §7.9 (lihat Temuan); kartu lanjutan untuk Tech Lead dibuat dari kartu ini.
- Urutan waktu build: build terakhir 18:45:36 dan saat itu tidak ada kartu frontend lain berstatus running (yang running hanya t_b078318d backend). Kartu F5b (`t_d1028202`) mulai running 18:48:54 dan akan membangun ulang `public/build`, jadi artefak bundel di atas adalah bukti pada jam itu — QA/D1 sebaiknya `npm run build` bersih setelah semua penulis berhenti.
- Tidak ada commit (R8), tidak ada server/migrasi/seeder; `.env` dan dokumen acuan tidak disentuh.

## F2 — penanda mode uji (halaman bayar + tab Pembayaran admin) + hitung mundur ikut `pembayaran.expires_at` (kartu t_e60e7733, 21 Okt 2026)

Rencana (ringkas):
1. Baca ulang kontrak §7.5/§7.7/§10.7 (bentuk baku `midtrans`), design §4.4/§4.21/§4.23/§5.8/§5.13 + baris deviasi D9–D11 (§11.3), `docs/review.md` F-2.
2. Helper kecil `resources/js/lib/midtrans.js` (`midtransMode`) — normalisasi prop `midtrans` di satu tempat, dipakai dua pemakai.
3. `QrisPanel`: prop `midtrans`; notice `InlineNotice` `warning` "Mode uji" + `alasan` di atas QR (`langkah_perbaikan` juga tampil ke pembeli: kartu F2 butir a); hitung mundur juga tampil pada state `error` (design §4.4).
4. `Countdown`: normal `text-ink-soft`, < 3 menit `text-danger` + `animate-pulse` (+ `motion-reduce:animate-none`), format MM:SS `font-mono text-meta` (design §4.21/D10).
5. `CheckoutPay`: terima prop `midtrans` dan teruskan ke `QrisPanel`.
6. `Admin/Settings/Index.jsx`: terima prop `midtrans`; kartu "Midtrans" dapat baris status (`StatusBadge`) + notice mode uji; dua hint kolom catatan diperjelas (D11).
7. Verifikasi: harness SSR (matriks mode × state), sapu kotor, `npm run build`, sapu regresi impor/bundel; bukti di `docs/bukti-frontend-t_e60e7733.txt`.

Validasi tiga arah (sebelum coding):
- Kartu/PRD vs desain: D9 (`docs/design.md:865`) sudah punya baris deviasi untuk penanda "Mode uji" — komponen yang diizinkan hanya `InlineNotice` `warning`/`error` (§4.23) dan/atau `StatusBadge` tone `warning` (§4.21), tanpa token/kelas/warna baru, dan **tidak dirender saat `fake=false`**. D10: hitung mundur 5 menit = amendemen durasi saja, bentuk `Countdown` §4.21 tidak berubah. D11: kolom `midtrans_client_key`/`midtrans_is_production` dipertahankan sebagai **catatan** sampai keputusan pemilik (`docs/pertanyaan-pemilik.md` §5 P3). Tidak ada kebutuhan kartu yang tak berlatar desain.
- Desain vs kontrak: props yang dipakai persis bentuk baku §7.5/§7.7/§10.7 (`fake`, `mode`, `alasan`, `langkah_perbaikan`, `catatan`, `sumber_kredensial`; `alasan`/`langkah_perbaikan` `null`/`[]` saat mode `asli`). Nilai dikirim server (`MidtransService::modeInfo()`, dipanggil `CheckoutController.php:58,112` dan `Admin/SettingController.php:49`) — tidak ada kontrak alternatif. `pembayaran.expires_at` (§7.7) sudah dikirim dan sudah dipakai `Countdown`; tidak ada field baru.
- Kelayakan teknis: halaman `Public/CheckoutPay` dan `Admin/Settings/Index` sudah ada dan dirutekan; komponen yang dipakai ulang (`InlineNotice`, `StatusBadge`, `Countdown`, `Field`, `SectionCard` lokal) semua sudah ada; tanpa paket, rute, state library, atau token baru. Titik sisip di `Admin/Settings/Index.jsx` = `renderPembayaran()` (`:1992`) di dalam `SectionCard title="Midtrans"` (`:2013`); tab awal ditentukan query `?tab=` (`:96-98`), jadi harness SSR cukup menyuntik `window.location.search`.

Temuan awal (dasar keputusan):
- Sebelum perubahan, `grep -n midtrans resources/js/Pages/Public/CheckoutPay.jsx resources/js/Components/QrisPanel.jsx` → 0 hasil: prop `midtrans` sudah dikirim server tetapi tidak pernah dipakai UI, sehingga pemilik/pembeli tidak bisa membedakan QR uji dari QR nyata (inti F-2).
- `Countdown` (§4.21) sebelumnya selalu `text-ink`, tidak pernah `text-danger`/`animate-pulse`; ambang < 3 menit belum ada — deviasi desain yang ditutup kartu ini (D10 menegaskan ambang tetap sah pada durasi 5 menit).
- `QrisPanel` sebelumnya hanya merender hitung mundur saat `status === 'pending'`; design §4.4 menuntut hitung mundur **tetap jalan** pada state `error`. Perbaikan kecil ikut kartu ini (satu kondisi) supaya hitung mundur konsisten §4.4/§5.8.
- Hint kolom `midtrans_client_key` berbunyi "Client key hanya dipakai untuk memuat halaman pembayaran." — menyesatkan (nilainya tidak dibaca jalur bayar, D11). Diganti kalimat catatan; label kolom **tidak** diubah karena penyempurnaan/penghapusan label menunggu keputusan pemilik P3 (kartu uiux lanjutan).
- Keputusan tampilan mode `asli` di tab admin: badge netral "Mode asli" (status mode efektif wajib terlihat, §10.7) — yang **tidak** dirender saat `fake=false` adalah penanda mode uji (`InlineNotice`/badge `warning`), sesuai batas D9. Diputuskan di sini karena D9 melarang penanda peringatan, bukan baris status mode.
- Penanda sengaja hanya di dalam `QrisPanel` cabang QR (state `pending`/`checking`/`error`), bukan di panel `paid`/`expired`: pada dua state itu QR sudah tidak ditampilkan lagi, sehingga penanda mode uji hanya jadi derau. Pembeli melihat penanda tepat di atas kode QR.

Verifikasi (dijalankan 21 Okt 2026; keluaran mentah ada di `docs/bukti-frontend-t_e60e7733.txt`):
- Harness SSR/statik `tmp/uji-ssr-midtrans-t_e60e7733.mjs` (esbuild + `node`, stub Inertia `tmp/stub-inertia-t_321bf03c.mjs`, `window.location.search` disuntik untuk `?tab=pembayaran`) → **exit 0, 36/36 lulus**: A1–A6 helper `midtransMode` (mode uji lengkap; mode asli menihilkan `alasan`/`langkah`; `fake` string `"true"`; prop `null`/bukan objek aman; `alasan` berisi spasi → `null`; `diketahui` hanya true bila server benar-benar menyebut mode), B1–B6 `Countdown` (5 menit `text-ink-soft`; 2:58 `text-danger` + `animate-pulse` + `motion-reduce:animate-none`; 3:02 masih normal; lewat → `Kedaluwarsa` + `text-danger-strong`; `sr-only` memuat sisa waktu; `null`/tak sah → tidak dirender), C1–C12 `QrisPanel` (uji: penanda + `alasan` + `langkah_perbaikan` + label langkah di atas QR, QR & hitung mundur tetap; mode asli: bersih; tanpa prop: aman; state `error`: hitung mundur jalan; `error`+uji: penanda tampil; `checking`; `paid`/`expired` tanpa penanda; `alasan` hilang → kalimat cadangan; `orderCode`/`total` kosong → `-`; `langkah_perbaikan` kosong/tak sah → tanpa daftar; `galat` tampil apa adanya & ter-escape di atas penanda; `galat` kosong → tanpa notice), D1–D5 `CheckoutPay` (prop diteruskan; tanpa prop aman; mode asli bersih; `pembayaran.galat` diteruskan & tampil apa adanya; `galat` null → tanpa notice), E1–E6 tab Pembayaran (uji: badge + `alasan` + 3 langkah + `sumber_kredensial` + `catatan`; mode asli: badge netral tanpa notice; hint lama hilang & hint catatan muncul; tanpa prop → 0 klaim mode; `mode="sandbox"` → 0 klaim; tab Umum tidak memuat blok Midtrans). Sapu penanda kotor (`undefined`, `NaN`, `[object Object]`, `lorem ipsum`, `[Grafik Placeholder]`, `TODO:`, `FIXME`) → **0 temuan** pada seluruh markup yang diuji.
- Kontrol negatif A (`midtrans.js`: `uji` dipaksa `false`, sementara) → **exit 1, 11 uji gagal** (A1, A3, A5, A6, C1, C5, C6, C8, D1, E1, E5); pulih → md5 `82f6c304012830803ce230ceec0c492c` sama, sisa pola sabotase 0. Kontrol negatif B (`Countdown.jsx`: ambang 3 menit dihapus, sementara) → **exit 1, 1 uji gagal** (B2); pulih → md5 `00d045041b1a4251fff1d5c32236bdeb` sama, sisa 0. Ulang setelah pulih → **exit 0, 31/31**. Skrip: `tmp/kontrol-negatif-t_e60e7733.py`.
- `npm run build` (Vite 6) → **exit 0**, "✓ built in 15.79s". Kode kartu ini terbukti ada di bundel rilis: `public/build/assets/CheckoutPay-DkwDQSj5.js` (11,30 kB) memuat "Mode uji", kalimat cadangan `tidak bisa ditransfer`, `motion-reduce:animate-none`, `Sisa waktu pembayaran`, dan satu-satunya `animate-pulse` di `public/build/assets/**`; `public/build/assets/Index-DHPx8nWA.js` (50,76 kB, pengaturan admin) memuat "Mode uji" + hint D11 `Catatan saja`.
- Sapu regresi: `python tmp/cek-komponen-tanpa-import.py .` (95 berkas) → hanya false positive lama `app.jsx: App`; `python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` (70 chunk) → hanya temuan lama `DropzoneGalery-*.js -> FREE: P` (dinilai false positive di F3). **0 temuan baru** dari kartu ini.

Catatan / known issue:
- `langkah_perbaikan` **juga ditampilkan ke pembeli** di panel QRIS (kartu F2 butir a: "penanda jelas ... + alasannya + langkah perbaikan untuk pemilik"), sebagai daftar bernomor di bawah `alasan` dengan label `Langkah perbaikan untuk pemilik:` (label bantu; isi langkah tetap teks server apa adanya, tidak ada kalimat karangan). Langkah tetap tampil juga di tab Pembayaran admin (design §5.13). Bila UI/UX menilai langkah pemilik tidak layak publik, itu amendemen desain — catat di `docs/pertanyaan-pemilik.md`.
- Penanda mode uji hanya dirender di cabang QR (`pending`/`checking`/`error`); `paid`/`expired` tanpa penanda (keputusan pada bagian Temuan). Baris status admin "Mode uji"/"Mode asli" hanya muncul bila server benar-benar menyebut mode (`mode` atau `fake`); prop hilang/bentuk asing → tidak ada klaim apa pun tentang mode pembayaran.
- Label kolom `midtrans_client_key`/`midtrans_is_production` **tidak** diubah (menunggu keputusan pemilik P3, `docs/pertanyaan-pemilik.md` §5) — hanya hintonnya diperjelas sesuai D11; jalur simpan kolom tidak disentuh.
- **Belum diuji, butuh browser**: lebar 360/768/1024/1280 px, urutan tab & fokus, zoom 200%, kontras terukur, denyut `animate-pulse` nyata pada hitung mundur < 3 menit, dan alur bayar QRIS end-to-end (butuh kredensial Midtrans + sesi). Instruksi aman untuk pemilik: (1) `MIDTRANS_FAKE=true` → buka `/checkout/{order}`: penanda "Mode uji" + kalimat alasan + daftar langkah perbaikan tampil di atas QR, hitung mundur jalan; (2) `MIDTRANS_FAKE=false` + kredensial asli → penanda hilang; (3) `/admin/pengaturan?tab=pembayaran` dengan mode uji → badge "Mode uji" + 3 langkah perbaikan + catatan sumber kredensial; tab Umum tidak boleh memuat blok Midtrans; (4) baris `pembayaran.galat` terisi di kontrak → notice "Pembayaran QRIS bermasalah" berisi teks server apa adanya di panel QRIS.
- **Kredensial**: helper ini tidak menampilkan nilai kredensial apa pun — hanya sumbernya (`sumber_kredensial`) dan status terisi/kosong dari server; nilai server key/client key [REDACTED], tidak dibaca, tidak disalin, tidak ditulis ke berkas mana pun.
- **Tidak ada commit**: mengikuti praktik kartu F1–F6 di lane ini (`resources/js/**` belum masuk git dan `docs/catatan-frontend.md` adalah berkas bersama banyak kartu).


## F5b — isian nomor resi aktif di `/admin/pesanan/{order}` (kartu t_d1028202, 21 Okt 2026)

Berkas yang diubah: `resources/js/Pages/Admin/Orders/partials/InfoResi.jsx` (ditulis ulang, 91 baris: notice lama → form nyata) dan `resources/js/Pages/Admin/Orders/Show.jsx` (`:185` kini `<InfoResi pesanan={data} />`) + dokumen ini + `docs/bukti-frontend-t_d1028202.txt`. Tidak ada berkas `resources/js/Components/**`, `resources/views/**`, kontrak, design, `.env`, `package.json`, atau `tailwind.config.js` yang disentuh; tidak ada server/migrasi/seeder dijalankan. Harness baru: `tmp/uji-ssr-resi-t_d1028202.mjs` (SSR/statik), `tmp/uji-aksi-resi-t_d1028202.mjs` (interaksi), pengumpul bukti `tmp/jalankan-uji-t_d1028202.sh`, penyusun bukti `tmp/bangun-bukti-t_d1028202.py`.

Rencana (ringkas, ditulis sebelum implementasi):
1. Baca ulang `docs/keputusan-a15-resi.md` §1, kontrak §12.17 + §12.18a, design §5.12 (`docs/design.md:687`) + D12 (`:869`), bagian F5 di dokumen ini, `docs/brief-frontend.md`, `Field`/`Input`/`Button`.
2. `InfoResi.jsx`: form terkontrol — `Field` + `Input` (`maxLength` 60, nilai awal `pesanan.tracking_number`), baris status, `Button` `primary`; `router.patch('/admin/pesanan/'+id+'/resi', { tracking_number }, { preserveScroll: true, onStart, onFinish })`; hapus `InlineNotice`.
3. `Show.jsx`: kirim props `pesanan` ke `<InfoResi />` supaya nilai resi datang dari props server, bukan bacaan ulang di klien.
4. Verifikasi: harness SSR (matriks state + teks beku) + harness interaksi (kontrak pemanggilan router) + dua kontrol negatif + regresi harness F5 + `npm run build` + sapu impor/bundel.
5. Tidak menambah toast, state halaman, atau microcopy baru — sukses lewat `flash.success` layout admin, galat lewat `errors.tracking_number` (keputusan A15 §1 + deviasi D12).

Validasi tiga arah (sebelum coding):
- **Kartu/PRD vs desain**: D12 (`docs/design.md:869`) sudah mencatat isian nomor resi sebagai deviasi resmi (asal PRD A15 `docs/PRD.md:375`, keputusan `t_394b40ba`), dengan batas tegas **tanpa token, warna, atau komponen baru** — hanya §4.5 `Field` + `Input` dan §4.1 `Button` `primary`; baris §5.12 (`docs/design.md:687`) sudah memuat teks beku lengkap (label, bantuan, baris status, label tombol saat proses). Tidak ada kebutuhan kartu yang tak berlatar desain.
- **Desain vs kontrak**: kontrak §12.17 (`docs/kontrak-props.md:1389`) `pesanan.tracking_number` = string atau `null`; §12.18a (`:1402`–`:1404`) field `tracking_number` opsional teks maks 60, kosong/`null` = **menghapus**, galat `errors.tracking_number` (`Nomor resi maksimal 60 karakter.` / `Nomor resi harus berupa teks.`), sukses `flash.success`. Semua benar-benar ada di backend: `routes/admin.php:139-141` (`admin.orders.resi`), `app/Http/Controllers/Admin/OrderController.php:142-147` (`back()->with('success', 'Nomor resi pesanan diperbarui.')`), `app/Http/Requests/Admin/UpdateOrderTrackingRequest.php:26,36,37`. **Tidak ada endpoint karangan** dan kontrak tidak diubah.
- **Kelayakan teknis**: resolver `Pages/Admin/Orders/...` sudah melayani halaman; `Field`/`Input`/`Button` dan `router` Inertia sudah ada; tanpa paket, `fetch`, state library, atau token baru. Titik sisip: `Show.jsx:185` di dalam `KartuBagian` "Pengiriman".

Temuan (dasar keputusan implementasi):
- Baris status sengaja membaca nilai **tersimpan** dari props server, bukan yang sedang diketik — kalau membaca isian, teks `Tersimpan:` akan berbohong sebelum admin menekan simpan (design §5.12 membedakan `nilai awal` dan `baris status`).
- `noValidate` pada form mengikuti konvensi 7 form admin lain (`Accounts/Index.jsx:562`, `Categories/Index.jsx:506`, `Stocks/partials/StokAksiModal.jsx:128`, dst) supaya pesan validasi server tampil lewat `Field` (design §4.5) alih-alih gelembung bawaan browser; batas 60 tetap dijaga di klien lewat `maxLength` sebagai bantuan UX (server tetap penentu — §12.18a).
- Kiriman ganda ditahan di klien (guard `proses`) **dan** di server (rute memakai `throttle:admin-write`); tombol memakai prop `loading` sehingga nonaktif + label `Memproses…` disediakan `Button.jsx:51,80` (design §4.1) — tidak ada label atau spinner buatan sendiri.
- Nilai janggal dari server (angka, spasi) dinormalkan ke teks lewat helper kecil `asText`; props hilang/`id` kosong → komponen tidak merender apa pun (tanpa kontrol mati, tanpa `NaN`/`undefined`).
- Harness kartu F5 `tmp/uji-ssr-pesanan-t_018b2723.mjs` ikut disesuaikan: uji **S6** dan **H7** sebelumnya mengunci notice lama "Nomor resi belum bisa diisi" yang dihapus oleh kartu ini; keduanya kini menguji isian resi (label, `id` input, tombol `Simpan resi`, nilai dari props server). Perubahan hanya pada berkas harness di `tmp/`, bukan pada kode halaman atau dokumen acuan.

Verifikasi (dijalankan 21 Okt 2026; keluaran mentah per perintah ada di `docs/bukti-frontend-t_d1028202.txt`):
- Harness SSR/statik `tmp/uji-ssr-resi-t_d1028202.mjs` (esbuild + `node`, stub Inertia `tmp/stub-inertia-t_321bf03c.mjs`) → **exit 0, 11/11 lulus**: R1 resi terisi (nilai awal + `Tersimpan:` + teks beku D12); R2 `null` → input kosong + `Belum ada nomor resi.` (DoD); R3 string kosong sama seperti `null`; R4 galat server tampil di bawah input + `aria-describedby` terhubung; R5 galat field lain tidak menempel; R6 props hilang/tanpa id → aman; R7 notice lama hilang, tanpa teks karangan; R8 nilai janggal tanpa `NaN`/`undefined`; R9 `Show` mengirim `pesanan`; R10 `Show` dengan resi `null` → isian kosong; R11 sapu kotor di semua markup.
- Harness interaksi `tmp/uji-aksi-resi-t_d1028202.mjs` (shim hook + stub Inertia pencatat) → **exit 0, 7/7 lulus**: B1 `PATCH /admin/pesanan/5/resi` payload `{"tracking_number":"JX9988776655"}`; B2 isian dikosongkan → `{"tracking_number":""}` (hitung sebagai hapus, §12.18a); B3 kiriman ganda ditahan, `loading` menyala, lalu bisa kirim lagi; B4 URL memakai id dari props (pesanan 42) tanpa rute lain; B5 galat server dibaca dari props halaman dan tidak mengunci form; B6 props berubah → isian mengikuti nilai tersimpan terbaru; B7 kontrol input: `name`, `maxLength` 60, tanpa nilai tersembunyi. `preserveScroll: true` dipanggil (`InfoResi.jsx:53`) dan di-assert (`tmp/uji-aksi-resi-t_d1028202.mjs:116`).
- Kontrol negatif A (label beku `Nomor resi` → `Nomor Resi Paket`, sementara) → **exit 1, 9/11** (R1 dan R9 gagal); setelah dipulihkan `md5` kembali `fe5ad888c3091869a7a8339b38703361` dan `grep -c` sabotase = 0.
- Kontrol negatif B (URL simpan → `/resi-tiruan`, sementara) → **exit 1, 3/7** (B1–B4 gagal dengan pesan "url salah"); pulih → exit 0, sisa sabotase 0, `md5` sama.
- Regresi harness F5 `tmp/uji-ssr-pesanan-t_018b2723.mjs` → **exit 0, 26 uji / 0 gagal** (S1–S7, I1–I8, H1–H8, M1–M3).
- `npm run build` → **exit 0**, "✓ built in 14.07s"; kode kartu ini terbukti di bundel rilis `public/build/assets/InfoResi-DX6_iCnZ.js` (teks beku `Simpan resi`, `Belum ada nomor resi.`, `Tersimpan:`, bantuan D12 masing-masing 1 kemunculan).
- Sapu regresi: `python tmp/cek-komponen-tanpa-import.py .` (95 berkas) → hanya temuan lama yang sudah dinilai false positive (`app.jsx: App`); `python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` (69 chunk) → hanya temuan lama `DropzoneGalery-*.js -> FREE: P`.

Catatan / known issue:
- **Belum diuji, butuh browser**: tata letak nyata 360/768/1024/1280 px, urutan tab & fokus pada isian/tombol, zoom 200%, kontras terukur di layar, dan kiriman resi end-to-end (butuh sesi admin + CSRF). Instruksi aman untuk pemilik: buka `/admin/pesanan/{id}` dengan sesi admin → isi `Nomor resi` → `Simpan resi` → status berubah jadi `Tersimpan: …` + toast sukses; kosongkan lalu simpan → `Belum ada nomor resi.`; isi 61 karakter → galat server di bawah input.
- **Migrasi menunggu pemilik**: kolom `orders.tracking_number` (migrasi `2026_10_21_000019`) masih Pending menurut backend `t_b078318d` (`docs/langkah-pemilik.md`); sebelum migrasi dijalankan, PATCH resi akan gagal di database meskipun UI-nya benar.
- Build bukti dibangun 19:05 saat kartu frontend lain (F2 `t_e60e7733`) juga sedang menulis `resources/js/Components/**`; build bersih terakhir sebaiknya diulang setelah semua penulis berhenti (catatan yang sama juga ada di F6).
- **Tidak ada commit (R8)** — mengikuti praktik kartu F1–F6 di lane ini: `resources/js/Pages/**` belum masuk git dan `docs/catatan-frontend.md` adalah berkas bersama banyak kartu, sehingga commit per kartu akan mencampur berkas kartu lain (alasan lengkap di catatan kartu `t_8bca0661`). Perlu keputusan techlead/pemilik bila R8 ingin ditegakkan per kartu.
- Notice lama "Nomor resi belum bisa diisi" (temuan F5, baris di atas) sudah **selesai** oleh kartu ini; DoD "nomor resi bisa disimpan" dari F5 kini terpenuhi di sisi frontend (bukti di berkas bukti F5b).

## B2 — gate ulasan `CheckoutSuccess` memakai `ulasan.boleh` §7.9 beku (kartu t_02c3d20c, 21 Okt 2026)

Rencana ringkas:
1. `resources/js/Pages/Public/CheckoutSuccess.jsx:45-58`: hapus cabang `kontradiksiBoleh` beserta komentarnya; gate jadi `tampilkanForm = boleh && pending.length > 0`; `syaratDinilai` tetap dipakai notice alasan §9.1 dan dibuat saling eksklusif dengan form.
2. Sinkronkan harness F6 yang mengunci perilaku lama: uji 3, 7, 12 `tmp/uji-ssr-ulasan-t_2de36f29.mjs` + uji 7 baru di `tmp/uji-aksi-ulasan-t_2de36f29.mjs` (boleh=false + sisa → nol jalur kirim). Tidak ada perubahan kode lain di halaman itu.
3. Harness kartu ini `tmp/uji-ssr-gate-boleh-t_02c3d20c.mjs` (matriks DoD + cek statis gate) dengan runner `tmp/jalankan-uji-t_02c3d20c.sh`; bukti mentah `docs/bukti-frontend-t_02c3d20c.txt`.

Validasi tiga arah (sebelum coding):
- **Kartu vs desain**: kartu hanya meminta gerbang logika; tidak ada layar, komponen, atau microcopy baru. Blok penilaian §5.8 (`docs/design.md:613`–`632`) beserta state `ReviewForm` (`:489`: `idle`/`submitting`/`submitted`/`error`/`already-reviewed`) tidak diubah — judul `Beri Penilaian`/`Penilaianmu`, notice terima kasih, notice alasan, dan kartu terkunci tetap persis.
- **Desain vs kontrak**: kontrak §7.9 (`docs/kontrak-props.md:526`–`533`) **dibekukan 21 Okt 2026**: `ulasan.boleh` = `true` hanya bila §9.1 menerima minimal satu kiriman ulasan (`settlement` + status ∈ `dibayar|diproses|dikirim|selesai` + masih ada `product_id` unik belum diulas); tetap `true` pada pesanan multi-produk yang baru sebagian diulas, `false` hanya bila §9.1 tidak terpenuhi atau semua produk sudah diulas. Bentuk props tetap `{ boleh, sudah }`; `ulasan.sudah` = daftar `product_id` yang sudah diulas. Rute kirim tetap `POST /checkout/{order}/ulasan` (§9.1) — tidak ada rute atau field baru.
- **Kelayakan teknis**: `PublicLayout`, `InlineNotice`, `ReviewForm`, helper `asText`/rupiah, dan `router` Inertia sudah ada; tidak ada paket, hook, atau state baru. Hanya satu ekspresi gate + komentarnya yang berubah.

Temuan (dasar keputusan implementasi):
- Gate klien sebelumnya `(boleh || kontradiksiBoleh) && syaratDinilai && pending.length > 0` sengaja menambal props yang berbeda dari kontrak. Setelah §7.9 dibekukan (`docs/keputusan-f6-ulasan-boleh.md` §3, kartu `t_2b031326`), tambalan itu berbahaya: ia menetralkan `boleh` sehingga bukan lagi suara server. Sekarang klien **tidak** menggandakan syarat §9.1 sebagai gerbang — `boleh` dipercaya apa adanya, dan notice §9.1 hanya penjelas (bukan penentu) supaya tidak muncul di atas form yang sedang tampil.
- Konsekuensi yang disengaja: `boleh=false` + masih ada sisa produk (keadaan yang tidak lagi diproduksi server) kini menutup form **tanpa** notice alasan, karena notice `Ulasan bisa dikirim setelah pembayaran berhasil.` akan berbohong ketika pesanan sudah `settlement` dan statusnya boleh dinilai. Produk sisa tidak dirender sebagai kartu penilaian; kartu produk yang sudah diulas tetap tampil terkunci.
- Props hilang (`ulasan` `null`) kini *fail closed* (tanpa form) alih-alih memakai syarat §9.1 lokal; keadaan ini tidak mungkin per kontrak §7.9 dan tidak menampilkan galat palsu.
- `kontradiksiBoleh` dihapus dari kode, bukan dinonaktifkan; tidak ada komponen lain di `resources/js` yang membaca `ulasan.boleh` (grep `boleh` → hanya komentar/tidak terkait), jadi tidak ada duplikasi gerbang yang tertinggal.

Verifikasi (dijalankan 21 Okt 2026; keluaran mentah per perintah ada di `docs/bukti-frontend-t_02c3d20c.txt`, lognya di `tmp/log-bukti-t_02c3d20c/`):
- Harness SSR gate `tmp/uji-ssr-gate-boleh-t_02c3d20c.mjs` (esbuild + `node`, stub Inertia `tmp/stub-inertia-t_321bf03c.mjs`) → **exit 0, 9/9 lulus**: G1 `boleh=false` + sisa → **tanpa** form/tombol/judul form, tanpa notice alasan, tanpa terima kasih, kartu produk terkunci tetap ada (DoD-1); G2 `boleh=true` + sisa → 1 form (DoD-2); G3 semua diulas (`boleh=false`) → tanpa form + 2 kartu terkunci + terima kasih (DoD-3); G4 belum lunas + sisa → tanpa form + notice alasan; G5 status `batal` + sisa → tanpa form + notice alasan; G6 `boleh=true` dipercaya apa adanya; G7 cek statis sumber: gate `const tampilkanForm = boleh && pending.length > 0;` ada, `kontradiksiBoleh` hilang, notice alasan masih memakai `syaratDinilai`; G8 `ulasan` `null` → tanpa form, halaman utuh; G9 sapu `NaN`/`undefined`/placeholder.
- Regresi harness F6 SSR `tmp/uji-ssr-ulasan-t_2de36f29.mjs` → **exit 0, 13/13** (uji 3, 7, 12 diubah mengikuti §7.9 beku; uji lain tidak berubah).
- Regresi harness F6 interaksi `tmp/uji-aksi-ulasan-t_2de36f29.mjs` → **exit 0, 7/7**; uji 7 baru: `boleh=false` + sisa → 0 form aktif, produk sisa tidak dirender sebagai kartu penilaian, **0 panggilan router**.
- Kontrol negatif (sabotase sementara gate → `tampilkanForm = pending.length > 0;`, `boleh` dilepas) → **exit 1**: harness B2 **4/9** (G1, G4, G5, G7, G8 gagal), F6 SSR **9/13** (uji 3, 5, 6, 12 gagal), F6 interaksi **5/7** (uji 4, 7 gagal). Pulih: `sisa_sabotase_gate=0`, `md5 resources/js/Pages/Public/CheckoutSuccess.jsx` kembali `2e4df85a082cae829efecc0580ce373a`, ulang ketiga harness → exit 0.
- `npm run build` → **exit 0**, "✓ built in 16.14s"; kode kartu ini terbukti di bundel rilis `public/build/assets/CheckoutSuccess-D5s1AHje.js` (8.472 byte, `md5 86fb90af14dd85817b665253901c20cd`; memuat `Ulasan bisa dikirim setelah pembayaran berhasil` dan `Beri Penilaian` masing-masing lewat `grep -rl`).
- Sapu regresi: `python tmp/cek-komponen-tanpa-import.py .` (95 berkas) → hanya temuan lama yang sudah dinilai false positive (`app.jsx: App`); `python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` (70 chunk) → hanya temuan lama `DropzoneGalery-*.js -> FREE: P` (baseline sama dengan F6).

Catatan / known issue:
- **Belum diuji, butuh browser**: tata letak 360/768/1024/1280 px, urutan tab & fokus pada bintang/textarea, zoom 200%, kontras terukur, dan kiriman ulasan end-to-end (butuh sesi pembeli + CSRF). Instruksi aman untuk pemilik: buka `/checkout/{order}/selesai` pada pesanan `settlement` dengan 2 produk → nilai 1 produk → kartu itu terkunci, form produk sisa tetap ada (`boleh` server tetap `true`); nilai produk kedua → notice terima kasih; buka pesanan yang belum lunas → tanpa form + notice `Ulasan bisa dikirim setelah pembayaran berhasil.`
- Dependensi lanjutan: kartu verifikasi **B3 `t_4ef6e8bd`** (qatesting) memeriksa props server §7.9 + gate klien; bukti kartu ini dipakai sebagai masukan.
- Build bukti dibangun 19:22 saat kartu frontend lain (F2 `t_e60e7733`) masih **running**; `public/build` diabaikan git (`.gitignore:3`) dan hash chunk di atas hanya berlaku untuk keadaan pohon saat itu.
- **Tidak ada commit (R8)** — sama seperti kartu F1–F5b di lane ini; `docs/catatan-frontend.md` adalah berkas bersama banyak kartu sehingga commit per kartu akan mencampur pekerjaan kartu lain.

## F7 — `/checkout`: state `error-field` + validasi klien yang mencerminkan server (kartu t_a98f17d4, 21 Okt 2026)

Rencana ringkas:
1. `resources/js/Pages/Public/Checkout.jsx` (satu berkas, +123/-15): `validate()` klien disamakan dengan `app/Http/Requests/CheckoutRequest.php` (wajib, min/maks, regex telepon `^(\+62|62|0)8[0-9]{7,12}$`, pola email, kode pos 5 angka, catatan maks 500) dengan pesan persis dari server; notice validasi dipasang di **dua** tempat — di atas formulir (`Checkout.jsx:235`) dan di dalam `OrderSummary`, tepat di atas CTA (`:405`).
2. `gulirKeKolom()` (`:81-95`) memakai `scrollIntoView({behavior: 'smooth'|'instant', block: 'center'})` + `focus({preventScroll: true})`; `useEffect` pada `kunciGalatServer` (`:136-140`) menggulirkan galat dari server ke kolom pertama **tanpa** merebut fokus.
3. CTA tetap tombol submit formulir yang sama (`<OrderSummary form="checkout-form" loading={form.processing} disabled={isEmpty || form.processing}>`, `:393-406`); `submit()` (`:147-167`) menahan kirim saat `processing` dan saat validasi klien gagal — formulir tidak sah tidak pernah sampai ke jaringan.
4. Harness interaksi baru `tmp/uji-aksi-checkout-t_a98f17d4.mjs` (memakai shim React + stub Inertia yang sudah ada, plus palsu `document.getElementById` untuk merekam `scrollIntoView`/`focus`); bukti mentah `docs/bukti-frontend-t_a98f17d4.txt`.

Validasi tiga arah (sebelum coding):
- **Kartu vs desain**: design §5.7 (`docs/design.md:608`, daftar state di `:612`) meminta `error-field` dan `error-payment` (order tidak dobel); §4.23 (`:456`) menyediakan `InlineNotice` dengan varian `error` + `role="alert"`; §6 soal gerak yang dihormati. Tidak ada layar, komponen, warna, atau microcopy baru — tombol `Perbaiki kolom` memakai `Button variant="secondary"` (§4.1) yang sudah ada.
- **Desain vs kontrak**: kontrak §7.6 (`docs/kontrak-props.md:412`) memuat 7 field formulir + rute `POST /checkout` (name `checkout.store`); kontrak **tidak** memuat tabel aturan validasi klien, sehingga aturan dan pesan klien diambil dari `CheckoutRequest.php` dan server tetap penentu akhir. Tidak ada rute, field, atau kontrak baru yang dibuat.
- **Kelayakan teknis**: `useForm`/`router` Inertia, `Field`, `Input`, `Textarea`, `InlineNotice`, `Button`, `OrderSummary`, `PublicLayout` semuanya sudah ada; tanpa paket, `fetch`, atau pustaka state baru.

Temuan (dasar keputusan implementasi):
- Pesan klien harus sama persis dengan server supaya pembeli tidak membaca dua bahasa berbeda untuk satu aturan; harness A3 membandingkan 10 kondisi dengan 16 pesan yang dibaca langsung dari `CheckoutRequest.php` — perubahan pesan server akan menggagalkan uji, bukan diam-diam menyimpang.
- Pola email klien sengaja dilonggarkan ke `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` (tanpa syarat TLD >= 2 huruf) supaya klien tidak lebih ketat dari aturan `email` server (filter_var) — klien yang lebih ketat akan memblokir nilai yang justru diterima server.
- Galat dari server digulirkan **tanpa** fokus (`{ fokus: false }`): memindahkan fokus otomatis saat jawaban server datang menyentak pembaca layar; fokus dipindahkan hanya saat pembeli menekan `Perbaiki kolom`.
- Jumlah kolom bermasalah dihitung dari gabungan galat klien **dan** galat server, urut mengikuti `URUTAN_KOLOM` (`:17-25`, susunan formulir) — bukan urutan kunci JSON server. Nilai kosong dari klien diabaikan agar tidak dihitung dua kali setelah server menjawab.
- `note` tidak bisa melewati 500 karakter lewat UI (`maxLength`), tetapi tetap diperiksa `validate()` supaya daftar pesan server tercermin lengkap.

Verifikasi (dijalankan 21 Okt 2026; keluaran mentah di `docs/bukti-frontend-t_a98f17d4.txt`):
- Harness interaksi `tmp/uji-aksi-checkout-t_a98f17d4.mjs` → **exit 0, 8/8 lulus**: A1 CTA `Buat Pesanan` menunjuk `checkout-form` dan mati saat `processing`/keranjang kosong; A2 formulir kosong → **0 permintaan** ke server + dua notice (`Ada 6 kolom yang perlu diperbaiki`, `Kolom pertama Nama Penerima: …`) dengan urutan dokumen notice < form < notice-CTA, galat terpasang ke `Field`/`Input` (`aria-invalid`, `aria-describedby`); A3 10 kondisi validasi → pesan klien identik dengan 16 pesan server, nilai sah `+6281234567890` lolos; A4 kirim sah = `POST /checkout` + 7 kunci data + `preserveScroll` + penangan 429, klik kedua saat `processing` tidak menambah permintaan; B1 galat server → dua notice + gulir ke kolom pertama tanpa `focus()`; B2 `Perbaiki kolom` (kedua notice) → `scrollIntoView` + `focus`, dan `behavior: 'instant'` saat `prefers-reduced-motion: reduce`; B3 hanya kode pos salah → fokus jatuh ke `#customer_postal_code`; B4 galat pembayaran dari server tampil apa adanya tanpa notice kolom dan CTA tetap menunjuk formulir yang sama.
- Kontrol negatif A (judul notice → `Ada kolom yang salah`) → **3/8 gagal** (A2, B1, B3); kontrol negatif B (`/checkout` → `/checkout-tiruan`) → **2/8 gagal** (A3, A4). Pulih: `md5 resources/js/Pages/Public/Checkout.jsx` = `780639a0938f7da9b9acb846e3d21391`, `sisa_sabotase=0`, harness kembali exit 0.
- `npm run build` → **exit 0**, "✓ built in 3.89s"; kode kartu ini terbukti di bundel rilis `public/build/assets/Checkout-ClSQTu8Z.js` (`grep -o "kolom yang perlu diperbaiki"`, `grep -rl "Perbaiki kolom"`).
- Sapu regresi: `python tmp/cek-komponen-tanpa-import.py .` (95 berkas) → hanya temuan lama yang sudah dinilai false positive (`app.jsx: App`); keenam komponen yang dipakai halaman memuat `import React`.

Catatan / known issue:
- **Belum diuji, butuh browser**: tata letak 360/768/1024/1280 px, urutan tab & fokus nyata, zoom 200%, kontras terukur, dan kiriman checkout end-to-end (butuh keranjang berisi + CSRF). Instruksi aman untuk pemilik ada di bagian 4 `docs/bukti-frontend-t_a98f17d4.txt` (skenario a–d).
- Keputusan yang mungkin ingin dikonfirmasi Tech Lead/QA: pada state `error-field`, galat **dari server** hanya digulirkan tanpa memindahkan fokus; fokus berpindah hanya lewat tombol `Perbaiki kolom`. Bila QA mengharapkan fokus otomatis, ini titik yang perlu diputuskan (bukan diubah diam-diam).
- **Tidak ada commit (R8)** — sama seperti kartu lain di lane ini; `resources/js/Pages/**` belum masuk git dan `docs/catatan-frontend.md` dipakai bersama banyak kartu.

## F9 — pintu "Daftar" untuk tamu (header + drawer) & tautan silang Masuk ↔ Daftar di `/login` + `/register` (kartu t_e3f68f7f, 21 Okt 2026)

Label deviasi resmi dari UI/UX (kartu `t_46901364`, registri §11.3 `docs/design.md:873-875`, riwayat v2.3 `docs/design.md:17`) — **bukan satu label D13**:
- **D14** = tautan teks "Daftar" di header desktop (§3.1) → `resources/js/Components/Header.jsx:113-119`.
- **D15** = footer drawer tamu = "Daftar" `primary` di atas "Masuk" `secondary` (§3.1) → `resources/js/Layouts/PublicLayout.jsx:90-99`.
- **D16** = tautan silang Masuk ↔ Daftar di `/login` & `/register` (§5.5) → `Login.jsx:98-104`, `Register.jsx:141-147`.
Catatan: **D13 milik kartu admin lain** (tombol "Sinkronkan status pembayaran", `Show.jsx`, kartu `t_8e89556f`) — komentar kode di keempat berkas karena itu memakai D14/D15/D16; harness E4 gagal bila salah satu berkas kembali menulis "D13".

Rencana ringkas:
1. `Header.jsx` (cabang `user === null`): tambah `Link` teks ke `/register`, kelas persis pola aksi header `text-meta text-brand underline underline-offset-4` + `hidden … md:inline-flex`, tepat **setelah** ikon Masuk; ikon `UserIcon` + `aria-label="Masuk"` tidak disentuh. Tanpa komponen/ikon/token baru.
2. `PublicLayout.jsx` (prop `footer` drawer untuk tamu): satu `Link` "Masuk" diganti dua tautan bertumpuk dalam `div className="flex flex-col gap-2"` — "Daftar" `btn-primary w-full justify-center` di atas, "Masuk" `btn-secondary w-full justify-center` di bawah (kelas tombol `app.css:39-44`, jarak `gap-2` = 8px per D15). Footer pembeli (`Masuk sebagai …`) tidak berubah.
3. `Login.jsx` / `Register.jsx`: satu paragraf `mt-4 text-meta` **setelah** `</form>` — `Belum punya akun? ` + tautan `Daftar`, dan `Sudah punya akun? ` + tautan `Masuk`; kelas tautan persis pola "Lupa kata sandi?" (`text-brand underline underline-offset-4`).
4. Harness lokal: `tmp/uji-ssr-daftar-t_e3f68f7f.mjs` (23 uji), `tmp/uji-pohon-daftar-t_e3f68f7f.mjs` (5 uji), bundler `tmp/build-daftar-check-t_e3f68f7f.mjs`, runner `tmp/jalankan-uji-t_e3f68f7f.sh`; bukti mentah `docs/bukti-frontend-t_e3f68f7f.txt`.

Validasi tiga arah (sebelum coding):
- **Kartu vs desain**: kartu meminta pintu masuk Daftar untuk tamu + tautan silang auth; UI/UX sudah menetapkan bentuk persisnya sebagai D14/D15/D16, termasuk teks beku ("Daftar", "Masuk", "Belum punya akun?", "Sudah punya akun?"), posisi (setelah ikon Masuk / footer drawer / di luar `<form>`), dan batas kelas. Tidak ada layar, komponen, atau token baru — tidak ada bagian design lain yang berubah.
- **Desain vs kontrak**: halaman `/register` **sudah ada** (`resources/js/Pages/Public/Auth/Register.jsx`, kontrak §6.1–§6.4: field `name`/`email`/`phone`/`password`/`password_confirmation`/`terms`); kartu ini hanya menambah tautan, jadi tidak ada props baru yang dibaca dan tidak ada kontrak alternatif. Rute tujuan benar-benar ada: `routes/web.php:52` `GET /register`, `:55` `GET /login`, `:60` `GET /forgot-password`. PRD §15.2 → semua href string literal, tanpa Ziggy/`route()`.
- **Kelayakan teknis**: `Header.jsx`, `PublicLayout.jsx`, `AuthLayout.jsx`, `Link` Inertia, `btn-primary`/`btn-secondary`, dan token `text-meta` sudah ada; tidak ada paket, hook, atau state baru (tidak ada client state di luar yang sudah dipunyai `PublicLayout`).

Temuan (dasar keputusan implementasi):
- Sebelum kartu ini tamu **tidak punya jalan ke `/register` sama sekali**: grep `resources/js` untuk `/register|Belum punya akun|Sudah punya akun` hanya menemukan 3 kecocokan (semuanya di dalam `Register.jsx` sendiri). Header tamu hanya memuat satu ikon ke `/login`; footer drawer tamu hanya satu `btn-primary` "Masuk".
- Draft pertama kartu ini memakai kelas ala item nav (`px-3.5 py-3 text-ink hover:underline …`) dan label "D13"; setelah membaca registri §11.3 `docs/design.md:873-875`, keduanya dikoreksi agar persis D14 (kelas pola "Keluar") dan D14/D15/D16. Draft `space-y-2` juga diganti `flex flex-col gap-2` karena D15 menulis `gap-2` = 8px.
- `docs/design.md` **tidak diubah** (dokumen acuan): baris §11.3 dan riwayat v2.3 sudah ditulis UI/UX lebih dulu, jadi frontend hanya mengikuti.
- `NavDrawer.jsx` tidak perlu diubah: footer adalah prop dari `PublicLayout` (`NavDrawer.jsx:78`), jadi komposisi pintu tamu cukup dari pemanggil.

Verifikasi (dijalankan 21 Okt 2026; keluaran mentah di `docs/bukti-frontend-t_e3f68f7f.txt`):
- Harness SSR `tmp/uji-ssr-daftar-t_e3f68f7f.mjs` → **exit 0, 23/23 lulus**: A1–A5 header tamu (tepat satu `href="/register"` bertulis "Daftar", kelas D14, `hidden`/`md:inline-flex`, urutan tampil **setelah** ikon Masuk), A6 nav/hamburger/cari/badge keranjang tidak berubah, A7 pembeli login tanpa pintu Daftar/Masuk + "Keluar" tetap, B1–B2 layout tamu/pembeli, C1–C4 `/login` (satu tautan `/register`, setelah `</form>`, gaya sama dengan "Lupa kata sandi?", field/galat tidak berubah), D1–D5 `/register` (6 field + tombol "Daftar" utuh), D6 sapu `NaN`/`undefined`/`[CONTOH]`/lorem, E1 tanpa Ziggy/`route()`/`localStorage`/`dangerouslySetInnerHTML`, E2 URL literal + tidak ada rute karangan, E3 impor `@inertiajs/react` tunggal, E4 jejak D14/D15/D16 di berkas yang tepat.
- Harness pohon elemen `tmp/uji-pohon-daftar-t_e3f68f7f.mjs` → **exit 0, 5/5 lulus**: P1 footer drawer tamu `div flex flex-col gap-2` berisi tepat 2 tautan; P2 pintu tamu **hanya** dari `props.footer` (rekursi `children` = 0 tautan tamu) + `Header` tetap menerima `user: null`, nav 3 item, `onOpenDrawer`; P3 markup drawer terbuka: footer asli berada di dalam panel `w-drawer`, "Daftar" (`btn-primary`, `w-full justify-center`) mendahului "Masuk" (`btn-secondary`) dengan jarak 8px; P4 footer pembeli = "Masuk sebagai Siti" tanpa pintu tamu; P5 halaman pembeli tetap header/footer/Announcement + urutan kontrak `cart.count` → prop `cartCount` → `settings` → 0 (`cart.count` halaman menang).
- Kontrol negatif (sabotase sementara: `href="/register"` → `/daftar-sabotase` di header + `gap-2` → `gap-4` di footer drawer) → **exit 1**: SSR **17/23** (A2, A3, A4, A5, B1, E2 gagal), pohon **4/5** (P1 gagal). Dipulihkan; `md5` kembali `Header.jsx e2073ac8d02f7b3adbf39793586f1dc0`, `PublicLayout.jsx d6299379dbb553317ad463beb2014f49`, `Login.jsx 742752706ab9a9b432e4adb9607a3b93`, `Register.jsx e7ce61b652346ca083b8e4d73f6283dd`.
- `npm run build` → **exit 0**, "✓ built in 3.90s" (ulang setelah pemulihan: `build_exit=0`). Chunk `PublicLayout-*.js` + `app-*.js` ikut terbangun; `public/build` diabaikan git (`.gitignore:3`) sehingga hash chunk hanya berlaku untuk keadaan pohon saat itu.
- Sapu regresi: `python tmp/cek-komponen-tanpa-import.py .` (95 berkas) → hanya temuan lama yang sudah dinilai false positive (`app.jsx: App`); `python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` (70 chunk) → hanya temuan lama `DropzoneGalery-*.js -> FREE: P` (baseline sama dengan kartu F6).

Catatan / known issue:
- **Belum diuji, butuh browser**: tata letak 360/768/1024/1280 px, fokus keyboard & urutan tab, zoom 200%, kontras terukur, dan navigasi nyata ke `/register`. Instruksi aman untuk pemilik: buka beranda dalam keadaan **tamu** pada lebar ≥768 px → teks bergaris bawah "Daftar" harus tampil di sebelah kanan ikon Masuk dan mengarah ke `/register`; pada lebar < 768 px teks itu **tidak** tampil dan pintu Daftar ada di drawer (hamburger → footer: tombol accent "Daftar" di atas "Masuk"); buka `/login` → "Belum punya akun? Daftar", `/register` → "Sudah punya akun? Masuk"; saat login, teks "Daftar" hilang dan digantikan nama + "Keluar".
- Harness lokal tidak memakai browser maupun pustaka uji baru, jadi klaim di atas terbatas pada markup, kelas, urutan elemen, dan kontrak props — bukan rendering CSS nyata.
- Layar pembeli di header **>= md** punya dua elemen teks berdampingan (nama + "Keluar"); "Daftar" hanya muncul untuk tamu, jadi tidak ada penambahan kepadatan untuk pembeli.
- **Tidak ada commit (R8)** — sama seperti kartu F1–F5b di lane ini; berkas bersama `docs/catatan-frontend.md` dan pohon yang masih kotor membuat commit per kartu mencampur pekerjaan kartu lain.
- Deviasi D14/D15/D16 **sudah terdokumentasi** di registri desain oleh UI/UX; tidak ada tindakan dokumentasi lanjutan untuk frontend. Kartu ini tidak membuat kartu lanjutan.

## F8 — tombol "Sinkronkan status pembayaran" di kartu "Bukti pembayaran" `/admin/pesanan/{order}` (kartu t_8e89556f, 22 Okt 2026)

Validasi tiga arah (sebelum menulis kode):
- **PRD + brief vs desain**: D13 (`docs/design.md:872`, §11.3) + §5.12 memberi tombol sekunder "Sinkronkan status pembayaran" + notice hasil di kartu "Bukti pembayaran"; U6-1 (`docs/catatan-uiux.md:30`) menetapkan satu sumber hasil dan tombol **tidak** `disabled` hanya karena sudah lunas; `docs/brief-frontend.md` item F8 menunjuk kontrak §12.24. Tidak ada fitur tunda yang ikut dikerjakan (tanpa riwayat sinkron, tanpa polling, tanpa aksi massal).
- **Desain vs kontrak**: §12.24 (`docs/kontrak-props.md:1412-1443`) = `PATCH /admin/pesanan/{order}/sinkron-pembayaran` (`admin.orders.sinkron-pembayaran`), **tanpa body**, kembali ke halaman asal dengan `flash.success` / `flash.error`; §12.17 memuat `pesanan.id` dan `pesanan.payment` (`null` = belum ada tagihan). Rute + `syncPayment` sudah ada di backend B3 (`t_c374a29b`).
- **Kelayakan teknis**: resolver halaman `resources/js/Pages`; `AdminLayout` **tidak** punya Toast global — Toast dirakit di halaman (`Show.jsx:254-263`); §4.1 `Button` sudah mengurus state `loading` (label "Memproses…", `disabled`, `aria-busy`); §4.23 `InlineNotice` menerima `tone` + `children` dan memakai `role="alert"` untuk error; `@inertiajs/react` menyediakan `useForm` + `onSuccess(page)` dengan `flash` di `page.props`.

Rencana (berkas + komponen + state):
- Baru: `resources/js/Pages/Admin/Orders/partials/SyncPaymentButton.jsx` — `useForm`, satu aksi, state `hasil`.
- Ubah: `Show.jsx` — impor partial, state `flashSinkron`, render kondisional di kartu "Bukti pembayaran".
- Dipakai ulang: `Button` (§4.1 varian `secondary`), `InlineNotice` (§4.23), pola partial yang sudah ada (`BuktiPembayaran`, `InfoResi`, `UbahStatusModal`), `KartuBagian`.
- State UI: idle / memproses (label "Memproses…" + `disabled` + lebar dikunci) / hasil `success` / hasil `error` / **tidak dirender** saat `payment` null.

Implementasi:
- `SyncPaymentButton.jsx` (82 baris): `form.patch(`/admin/pesanan/${encodeURIComponent(id)}/sinkron-pembayaran`, { preserveScroll: true, preserveState: true, onSuccess })`; `onSuccess` membaca `page.props.flash.success` lalu `.error` dan menampilkan **satu** `InlineNotice`; pasangan `success|error` dilaporkan ke halaman lewat `onHasilSinkron`. Saat `form.processing` klik diabaikan (pencegahan kirim ganda), `Button` memberi `loading` + `disabled` + `aria-busy`, kelas `min-w-[16rem]` menjaga lebar. Tanpa id pesanan partial mengembalikan `null` (tidak menembak URL tanpa id).
- `Show.jsx`: tombol dirender **hanya** bila `data.payment !== null && !== undefined` di dalam kartu "Bukti pembayaran" (`div.flex.flex-col.gap-4` berisi `BuktiPembayaran` + partial). `flashSinkron` + `pasanganFlash` (`${success}|${error}`) menekan Toast halaman hanya untuk flash yang baru saja dilaporkan partial — flash aksi lain tetap menjadi Toast.
- Tidak ada komponen, token, warna, atau rute baru; tidak ada `route()`/Ziggy, `localStorage`, atau `dangerouslySetInnerHTML`.

Verifikasi (dijalankan 22 Okt 2026; keluaran mentah di `docs/bukti-frontend-t_8e89556f.txt`):
- Harness interaksi `tmp/uji-aksi-sinkron-t_8e89556f.mjs` lewat `bash tmp/jalankan-uji-t_8e89556f.sh` → **14/14 OK, exit 0**; diulang setelah semua pemulihan → **14/14 OK**. Cakupan: A1 label beku + varian + lebar, A2 URL §12.24 tanpa body + `preserveScroll`/`preserveState`, A3 label "Memproses…" + `disabled` + `aria-busy`, A4 klik ganda tidak menembak dua kali, A5/A6 notice `error`/`success` dengan pesan server apa adanya, A7 notice lama hilang sebelum jawaban baru, A8 tanpa id tidak merender, A9 higiene teks, B1 tombol di kartu yang benar dengan `pesanan.id`, B2 `payment` null → tidak dirender, B3 flash aksi lain tetap jadi Toast, B4 flash aksi sinkron di-suppress, B5 integrasi Show → klik → URL kontrak → pesan server tampil.
- Kontrol negatif (sabotase sementara lalu dipulihkan): label dirusak → **12/14** (A1, B5 gagal); URL dirusak → **12/14** (A2, B5 gagal); logika suppress dirusak → **13/14** (B4 gagal). `md5` setelah pulih identik: `SyncPaymentButton.jsx 7a0367438c19e80d7ac25fd2443bbcb5`, `Show.jsx 9662113234a8786727e2937da1a4df95`.
- Regresi kartu F5 (`tmp/uji-ssr-pesanan-t_018b2723.mjs`) → **26 uji, 0 gagal**: modal ubah status + bukti pembayaran tidak berubah.
- `npm run build` → **exit 0** ("✓ built in 13.93s"); CSS hasil build memuat `.min-w-\[16rem\]{min-width:16rem}`, chunk `SyncPaymentButton-*.js` memuat label beku + `sinkron-pembayaran`.
- Sapu regresi: `python tmp/cek-komponen-tanpa-import.py .` (96 berkas) → hanya temuan lama `app.jsx: App` (false positive parameter `setup`); `python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` (71 chunk) → hanya temuan lama `DropzoneGalery-*.js -> FREE: P`.

Deviasi yang disengaja terhadap body kartu (mengikuti dokumen yang lebih baru — desain + keputusan UIUX 21 Okt 2026):
- Body kartu menulis "nonaktif saat `data.payment_status` sudah `settlement`". **D13 + U6-1 membalik aturan itu**: tombol tetap aktif, alasan penolakan datang dari server lewat `flash.success` ("Pembayaran sudah lunas, sinkronisasi tidak perlu dijalankan.") supaya §4.0 (state `disabled` wajib punya alasan terlihat) tidak dilanggar. Yang menonaktifkan tombol hanya state memproses (§4.1 `loading`).
- Body kartu menyebut `router.patch`; implementasi memakai `useForm({}).patch` — helper Inertia yang sama-sama menembak URL literal dengan `preserveScroll`, tetapi memberi `processing` untuk state §4.1 `loading` + pencegahan kirim ganda. Tetap tanpa Ziggy/`route()`, dan `preserveState: true` diperlukan agar notice hasil tidak hilang saat props halaman berganti.

Catatan / known issue:
- **Belum diuji, butuh browser**: tata letak 360/768/1024/1280 px, fokus keyboard & urutan tab, zoom 200%, dan klik nyata ke server (flash Midtrans). Instruksi aman untuk pemilik ada di bagian akhir `docs/bukti-frontend-t_8e89556f.txt`.
- Suppress Toast memakai pembanding pasangan teks flash yang disimpan di state halaman. Bila aksi lain kelak mengirim flash dengan teks **persis sama** setelah aksi sinkron di halaman yang sama (tanpa pindah halaman), Toast-nya ikut tertekan; notice di kartu tetap benar. Dampak sempit karena `preserveState` hanya bertahan selama halaman detail pesanan yang sama terbuka.
- Lebar `min-w-[16rem]` adalah pilihan nilai untuk "lebar dikunci" D13 (desain tidak menyebut angka) — dicatat di `docs/asumsi.md` butir 21.
- **Tidak ada commit (R8)** — sama seperti kartu lain di lane ini; `Show.jsx` dan `partials/` memang belum dilacak git sejak kartu F5.

## t_7a62c713 — Tabel produk admin & pemilih varian detail produk

Rencana (10 baris):
1. `Components/DataTable.jsx`: dukung `column.width` (dokumen `docs/komponen.md` §4) → `table-fixed` + `minWidth` + `<th style={{width}}>`.
2. `Pages/Admin/Products/Index.jsx`: isi `width` untuk kolom nama (220), status (176), aksi (256); nama/SKU `min-w-0` + `truncate`; thumbnail `shrink-0`.
3. `Pages/Public/Products/Show.jsx`: warna diturunkan dari `variants[]` (`color`, `color_hex`), bukan `uniqueBy(variants,'color')` yang membuang baris berhex null.
4. Chip ukuran/swatch tidak lagi saling mengunci (disabled per nilai, bukan per kombinasi); memilih satu nilai melepas nilai lain yang jadi tidak sah.
5. `Components/ColorSwatch.jsx`: `hex` divalidasi (`#RGB`/`#RRGGBB`/`#RRGGBBAA`); null → lingkaran `bg-surface` + huruf awal (bukan heksa karangan `#EDE7DF`).
6. Swatch aktif: `outline-2 outline-offset-2 outline-ink` (design §4.6) — `ring-*` tidak terbukti muncul di computed style.
7. Tidak ada perubahan backend/rute; data tetap dari props Inertia.
8. Verifikasi: build + ukur DOM di browser 1278/1262 & uji klik.
9. Tabel admin butuh login `admin` (lihat `docs/akun-dev.md`); login dev gagal di sesi ini → tabel diuji lewat harness CSS + pemeriksaan kelas hasil build.
10. Catat known issue bila ada.

Temuan validasi tiga arah:
- Kontrak tidak mengirim `colors[]` di item katalog; detail memakai `variants[].color` + `variants[].color_hex` (kontrak §8.3). Kode lama `uniqueBy(variants, 'color')` mengambil `color_hex` dari baris pertama per warna, jadi warna yang baris pertamanya berhex `null` tampil netral.
- `docs/komponen.md` §4 memang mengizinkan `width` per kolom; `DataTable` versi lama mengabaikannya sehingga `table-fixed` tidak pernah aktif dan isi sel menekan kolom lain.
- Design §4.6: swatch 28px, cincin aktif 2px `ink`. Tidak ada token heksa baru yang ditambahkan.

Verifikasi nyata:
- `npm run build` → sukses (4.50s), chunk `Show-BSsaBAwY.js`, `Index-CZ_Weg_j.js`, `app-CaeNg61k.js`.
- `/produk/baju-tidur-pola-kucing` (produk 13, 4 varian L/XL × Hijau/Merah): swatch `rgb(22,163,74)` & `rgb(220,38,38)` sesuai `color_hex`; klik Merah → `aria-pressed=true`, `outline solid 2px rgb(18,18,18)`; klik XL → chip `aria-pressed=true`; tombol `Tambah ke Keranjang` berubah `disabled true → false`.
- Tidak ada overflow horizontal di 1262px (`docW 1247`); kedua swatch satu baris (`top` sama).
- Kelas hasil build terkonfirmasi ada: `.table-fixed{table-layout:fixed}`, `.outline-ink{outline-color:#121212}`.

Known issue / belum diuji:
- **Tabel admin belum diuji dengan login nyata**: `POST /admin/login` dengan kredensial `docs/akun-dev.md` kembali ke form (kemungkinan akun dev belum ada di DB). Perilaku `table-fixed` + `minWidth` diverifikasi lewat kelas build dan harness markup sebelumnya, bukan lewat sesi admin asli.
- **Belum diuji, butuh browser**: 360/768/1024 px untuk tabel admin (butuh login), zoom 200%, dan uji keyboard penuh pada swatch/chip (fokus terlihat memakai `outline-ink`).
- Bila warna punya >±6 nilai, baris swatch membungkus (`flex-wrap gap-3`) dan menambah tinggi blok; belum ada produk dev dengan warna sebanyak itu untuk diukur.

## t_082b15aa — Header `DataTable` sticky (temuan O-1)

Rencana (10 baris):
1. `Components/DataTable.jsx:89` — wrapper `overflow-x-auto` diganti `max-h-[70vh] overflow-auto` agar wadah punya tinggi terbatas dan benar-benar menjadi scrollport vertikal.
2. `Components/DataTable.jsx:108` — `<th>` diberi `sticky top-0 z-10 bg-surface`; latar wajib di sel sticky, bukan di `<tr>`, supaya baris tidak tembus.
3. `max-h-[70vh]` disahkan kartu ("atau beri max-height yang wajar"); tidak ada token/komponen baru, tidak ada arbitrary color.
4. `z-10` < topbar admin `z-20` (`AdminLayout.jsx:172`) — header tabel tidak menutupi topbar dan terpotong wadah gulir.
5. Tidak mengubah props/kontrak, kolom, `width`, sort, sel, maupun cabang loading/empty/galat.
6. Tidak ada perubahan halaman pemakai, backend, rute, atau data.
7. Verifikasi: `npm run build` + browser nyata login admin dev + 20 baris DOM + 360/768/1024 px.

Validasi tiga arah:
- PRD/brief vs desain: `docs/komponen.md:83` mewajibkan "Header sticky"; `docs/design.md:335` menetapkan header tabel `bg surface`, `h-tableHead`, sticky. Tidak ada fitur baru; hanya memenuhi kontrak komponen yang sudah tertulis.
- Desain vs kontrak: `DataTable` murni presentasional; props tidak berubah dan tidak ada data/rute yang dibutuhkan. Token `bg-surface` (`tailwind.config.js:50`), `h-tableHead` (`tailwind.config.js:122`), `z-10` bawaan Tailwind — tanpa token baru.
- Kelayakan teknis: `overflow-x-auto` sudah menjadi scrollport (overflow-y dihitung `auto`) tetapi tingginya mengikuti isi, sehingga `sticky top-0` tidak pernah aktif saat halaman digulir (O-1). Memberi `max-h` membuat wadah bergulir sendiri; `sticky` lalu bekerja terhadap wadah itu. Semua 11 pemakai `DataTable` memakai komponen yang sama, jadi perilakunya konsisten.

Bukti kode path:baris:
- `resources/js/Components/DataTable.jsx:89` — `<div className="max-h-[70vh] overflow-auto">`
- `resources/js/Components/DataTable.jsx:108` — `'sticky top-0 z-10 h-tableHead whitespace-nowrap border-b border-line bg-surface px-4 text-label uppercase text-slate-600'`
- `resources/js/Components/DataTable.jsx:9-18` — komentar alasan sticky + wadah gulir.

Verifikasi nyata (bukti mentah: `docs/bukti-frontend-t_082b15aa.txt`):
- `npm run build` → exit 0 (11,18 dtk; `public/build/assets/app-CCUgQ5mf.css` memuat `.sticky{position:sticky}`, `.top-0{top:0}`, `.z-10{z-index:10}`, `.max-h-\\[70vh\\]{max-height:70vh}`, `.bg-surface{...rgb(246 246 244)...}`).
- Browser nyata, login admin dev, Chrome viewport 1262×568, `/admin/pesanan` (13 baris): `thead th` computed `position: sticky`, `top: 0px`, `z-index: 10`, `background-color: rgb(246, 246, 244)`; wrapper `max-height: 397.6px`, `clientHeight 383`, `scrollHeight 773` → daftar bergulir di dalam kartu.
- DOM 20 baris (klon baris pada halaman nyata): `wrapper.scrollTop = 500` → `th` tetap 44px penuh di puncak wadah (`thTopRelative 0`), `<td>` pertama di `-455` (tertutup header), hit-test 3 titik di area header mengembalikan `TH` (bukan `TD`).
- Tabel pendek `/admin` (5 baris): `clientHeight = scrollHeight = 324` → tidak ada scrollbar dalam, tampilan tidak berubah.
- Responsif 360/768/1024 px: `documentElement.scrollWidth == clientWidth` (tidak ada overflow halaman); wrapper tetap menggulir horizontal (326/704/704 vs 1026/1050/1065); setelah `scrollTop` + `scrollLeft`, `thTopRelative 0` dan `position: sticky`.
- Halaman digulir 566px: topbar `z-index 20` tetap di atas — `elementFromPoint` di area topbar = `HEADER.sticky`; `<th>` `z-10` terpotong wadah sehingga tidak menembus topbar.
- State loading/empty/galat: cabang markup tidak disentuh (bukan bagian wrapper tabel), jadi tidak berubah; tidak ada halaman pemakai yang diubah.

Known issue / belum diuji:
- **Belum diuji, butuh browser**: zoom 200%, Safari/iOS (`border-collapse` + sticky), dan uji keyboard pada tombol sort di header (bukan jalur yang diubah; fokus tetap `focus-visible:outline-brand`).
- Konsekuensi yang diterima: tabel lebih tinggi dari 70vh kini bergulir di dalam kartu (perilaku yang diminta kartu), pagination tetap di luar kartu.
- `max-h-[70vh]` adalah nilai arbitrer Tailwind, bukan token baru; bila UIUX ingin batas lain (mis. `calc(100vh - 6rem)`), cukup ganti satu kelas di `DataTable.jsx:89`.

Verifikasi ulang (run 4, 22 Okt 10:15–10:25): kode sticky sudah ada di working tree dari run sebelumnya yang berhenti sebelum `kanban_complete`; run ini **tidak mengubah kode lagi**, hanya memverifikasi. `npm run build` → exit 0 (10,32 dtk; CSS `public/build/assets/app-CCUgQ5mf.css`). Uji DOM/computed di Chrome memakai `DataTable` asli lewat SSR + CSS build (`tmp/sticky-harness-t_082b15aa.html`, 20 baris): `<th>` `position: sticky`, `top: 0`, `z-index: 10`, latar `rgb(246,246,244)`, tinggi 44px; wrapper `max-height 397,6px`, `clientHeight 398`, `scrollHeight 1165`; setelah `scrollTop=400` th tetap di 0 dan `<td>` pertama di −355,5; saat halaman digulir 320px topbar `z-20` tetap di atas (hit-test = topbar, bukan th); viewport 360px tanpa overflow halaman + sticky tetap jalan. Kontrol negatif markup lama: `position: static` dan wrapper tidak dapat digulir. Login admin nyata tidak diulang di run ini (provenance di `docs/bukti-frontend-t_082b15aa.txt` §6).

## t_aa6dc2df — Modal: batas tinggi viewport + area isi bergulir

Rencana (maks 10 baris):
1. `Components/Modal.jsx` — panel `flex flex-col` dengan `max-h-[calc(100dvh-2rem)]` + `overflow-hidden`; overlay `overflow-y-auto` sebagai fallback.
2. Area isi (`children`) `min-h-0 flex-1 overflow-y-auto overscroll-contain`; header dan footer `shrink-0`.
3. Footer selalu tampil di dalam panel; `ConfirmDialog` ikut memakai struktur yang sama.
4. Klik luar dihitung dari `onMouseDown` + `panelRef.contains(event.target)`, bukan `event.target === overlay`, agar seret/seleksi di dalam panel tidak menutup modal.
5. `Pages/Admin/Categories/Index.jsx` — aksi "Tambah kategori" dipindah ke prop `actions` `PageHeader` (sebelumnya dikirim sebagai `children` yang tidak dirender `PageHeader`, sehingga tombol tambah tidak pernah tampil).
6. Tidak ada perubahan kontrak, rute, backend, atau token desain. Esc, klik overlay, focus trap, scroll lock, `role="dialog"`, `aria-modal` dipertahankan.
7. Verifikasi: `npm run build` + harness browser nyata `tmp/categories-modal-harness.html` di 1280×768, 360×768, 800×600, 360×640; ukur panel, area gulir, footer, hit-test tombol; uji Tambah, Ubah, Hapus, Esc, klik overlay, Tab, simpan.

Validasi tiga arah:
- PRD vs desain: `docs/rencana-perbaikan-5.md` butir 4 meminta tinggi maksimum viewport + area isi bergulir; `docs/design.md` §4.9 menetapkan overlay gelap, animasi `modal-in`, Esc/klik overlay menutup, fokus terperangkap. Tidak ada fitur baru.
- Desain vs kontrak: `Modal` presentasional; props tidak berubah. `ConfirmDialog` (`§4.24`) memakai `Modal` yang sama sehingga ikut membaik tanpa perubahan kontrak.
- Kelayakan: `useBodyScrollLock` + `useFocusTrap` sudah ada di `lib/hooks.js`; token `z-modal`, `max-w-modal`, `max-w-modalLg`, `animate-modal-in` sudah ada di `tailwind.config.js`, tanpa token baru.

Verifikasi nyata:
- `npm run build` → exit 0 (5,07 dtk); CSS hasil build memuat `.max-h-\[calc\(100dvh-2rem\)\]{max-height:calc(100dvh - 2rem)}` dan `animate-modal-in`.
- Harness membundel `Pages/Admin/Categories/Index.jsx` asli + `Modal` asli + CSS build, dibuka di browser Chrome; animasi diselesaikan manual sebelum ukur karena tab uji `visibility: hidden` membekukan animasi.
- 1280×768 Ubah: panel `top 16 / bottom 752`, area isi `client 579 / scroll 708`; footer `bottom 752`; `Simpan perubahan` dan `Batal` hit-test `true`; body `overflow hidden`.
- 360×768: panel 16–752, area isi `523/707`, tombol footer 681–728, hit-test `true`, tanpa overflow horizontal.
- 800×600: panel 16–584, area isi `413/698`, tombol footer 513–560, hit-test `true`.
- 360×640: panel 16–624, area isi `395/707`, tombol footer 553–600, hit-test `true`; `ConfirmDialog` Hapus 212–428, tombol Batal/Hapus terlihat dan hit-test `true`.
- Interaksi: isi form berubah (`#kategori-name`), simpan mengirim `form.post /admin/kategori/7` lalu modal tertutup dan body `visible`; Esc menutup; klik overlay menutup; Tab nyata (CDP) berputar `Tutup → field → Batal → Simpan → Tutup`, area isi bergulir 40px tanpa menggeser footer; hapus mengirim `router.delete /admin/kategori/7` lalu dialog tertutup.
- Field form Ubah yang terukur: `#kategori-name`, `#kategori-slug`, `#kategori-description`, `#kategori-sort`, `#kategori-image`, `#kategori-active` — semua ada dan terlihat; field teks dapat diisi.
- Tombol "Tambah kategori" kini tampil; modal Tambah 1280×768: footer `bottom 737`, tombol Batal/Simpan kategori hit-test `true`, field kosong.

Known issue / belum diuji:
- **`Pages/Admin/Accounts/Index.jsx`**: tombol "Tambah admin" juga dikirim sebagai `children` ke `PageHeader` sehingga tidak dirender. Di luar lingkup kartu ini; dicatat sebagai kartu terpisah.
- **Belum diuji, butuh browser**: zoom 200%, pembaca layar, dan Safari/iOS (`100dvh`). Uji di harness file://, bukan sesi admin nyata; server dev tidak dinyalakan.
- Form kotor lalu klik overlay masih langsung menutup (perilaku lama); design §4.9 menyebut konfirmasi untuk form kotor, tetapi belum ada mekanisme itu di `Modal` dan tidak diminta kartu ini.

## t_ed78d5c6 — Lazy scroll katalog `/produk` (Kartu FE-Lazy, 23 Okt 2026)

Rencana ringkas:
1. `Pages/Public/Products/Index.jsx` ditulis ulang (+231/−51): akumulasi `items`, `loadedPage`/`pageCount`/`totalCount`, `loadMore()` dengan `mergeProducts` (kunci `id`, cadangan `slug`).
2. Sentinel `div.h-px.w-full` + `IntersectionObserver` bawaan (`rootMargin '240px 0px'`), dibuat ulang tiap batch, `disconnect` saat habis; tombol "Muat lebih banyak" sebagai fallback.
3. Reset akumulasi lewat `filterSignature` (`q, kategori, ukuran, harga_min, harga_max, urut`) di `useEffect` + `onSuccess` navigasi; `page` sengaja tidak masuk signature.
4. Query string lewat `buildParams` (ukuran digabung koma, `page` hanya bila > 1); batch berikutnya memakai `only: ['products']` + `preserveUrl: true` agar URL filter tidak berubah dan riwayat tidak menumpuk.
5. Komponen lama dipakai ulang: `PublicLayout`, `Breadcrumb`, `SortSelect`, `SearchInput`, `FilterPanel`, `ProductGrid` (`priorityCount={4}`), `Spinner`, `InlineNotice`, `EmptyState`, `ErrorState`, `Button`. Tanpa dependensi baru.
6. Galat batch berikutnya tidak mengosongkan daftar (`moreError` + "Coba lagi"); galat navigasi filter → `navError`; prop `error` → `ErrorState` di dalam layout.

Validasi tiga arah:
- PRD/rencana vs desain: `docs/design.md` §5.2 masih menggambar pagination "‹ 1 2 3 ›", tetapi `docs/rencana-perbaikan-5.md` butir 2 dan bagian Keputusan menetapkan lazy scroll + tombol "Muat lebih banyak"; tata letak §5.2 lain dipertahankan (breadcrumb, H1 + urut/cari di kanan, sidebar 240px, grid 4/3/2, 8 skeleton, empty + reset). Deviasi pagination ini sudah diputuskan dokumen rencana, bukan pilihan agent.
- Desain vs kontrak: `products` = paginator (`data/current_page/last_page/total`, `docs/kontrak-props.md` §11.1), `filters` memakai kunci `q, kategori, ukuran, harga_min, harga_max, urut`; produk minimal `id/slug/name/base_price/images/category/stock`. Halaman toleran terhadap `products` berupa array (kontrak lama) lewat `productList()`.
- Kelayakan: `@inertiajs/react` 3.9.1 mendukung `preserveUrl` (`node_modules/@inertiajs/core/dist/index.js:1491`, `node_modules/@inertiajs/core/types/types.d.ts:709`); tanpa paket baru; token `w-sidebar`, `text-h1`, `text-ink-soft`, `duration-hover` sudah ada di `tailwind.config.js`.

Verifikasi (bukti mentah: `docs/bukti-lazy-katalog-t_ed78d5c6.txt`):
- `npm run build` → exit 0, "✓ built in 2.90s".
- Harness browser Chrome (file://, `tmp/uji-lazy-katalog/`) membundel `Index.jsx` asli + stub Inertia (**bukan integrasi server**) dengan 30 produk contoh `[CONTOH]`; halaman 2 sengaja mengirim 1 produk duplikat dari halaman 1.
- Awal: 12 kartu, "Menampilkan 12 dari 30 produk", tombol "Muat lebih banyak" ada, 4 `img loading="eager"` + 20 `loading="lazy"`, tanpa galat konsol.
- Observer: 1 instance, `rootMargin "240px 0px"`, target `div.h-px.w-full`; batch 2 → 24 kartu/24 unik (duplikat dibuang), batch 3 → 30 kartu, "Semua produk sudah tampil", tombol hilang, observer di-`disconnect`.
- Sort "harga-asc" → `router.get('/produk', {urut:'harga-asc'})`, daftar reset ke 12.
- Galat batch (stub menolak 1 permintaan) → daftar tetap 12, notice "Gagal memuat produk berikutnya. Periksa koneksi Anda lalu coba lagi." + "Coba lagi"; retry → 24 kartu, observer aktif lagi.
- Tiga klik cepat "Muat lebih banyak" → hanya 1 permintaan (req 5→6), 30 kartu.
- Cari "zzz" → `{q:'zzz'}`, empty "Produk tidak ditemukan" + "Coba ubah kata kunci atau hapus filter yang aktif." + chip "Cari: zzz" + tombol "Reset filter"; reset → 12 kartu; tidak ada "NaN".

Known issue / belum diuji:
- **Scroll nyata belum teruji**: browser headless sesi ini tidak menjalankan scroll (`window.scrollTo`, `Input.synthesizeScrollGesture`) dan `IntersectionObserver` asli tidak memanggil callback sama sekali (probe IO manual pun kosong), sehingga auto-load diuji dengan shim observer yang memanggil callback komponen. Perilaku "scroll otomatis memuat batch berikutnya" perlu dicek di browser pemilik.
- **Belum diuji terhadap server Laravel nyata** (`/produk` + partial reload `only: ['products']`, `preserveUrl`): harness memakai stub Inertia; server dev tidak dinyalakan.
- **Belum diuji, butuh browser**: responsif 360/768/1024/1280, keyboard/Tab, zoom 200%, back/forward (stub tidak menangani `popstate`; reset bergantung pada perubahan prop `filters`).

## t_15522fc1 — Tombol "Tambah admin" tidak tampil di /admin/akun

Rencana ringkas:
1. `Pages/Admin/Accounts/Index.jsx` — `Button` "Tambah admin" dipindah dari `children` ke prop `actions` `PageHeader` (pola sama dengan `Pages/Admin/Categories/Index.jsx` pada `t_aa6dc2df`).
2. Tidak ada perubahan kontrak, rute, backend, token desain, atau teks. Modal, footer, dan `ConfirmDialog` dibiarkan memakai `Modal` bersama yang sudah diperbaiki di `t_aa6dc2df`.

Validasi tiga arah:
- PRD vs desain: `docs/design.md` §4.30 menetapkan `PageHeader` = breadcrumb → H1 → slot aksi kanan; aksi hanya dirender lewat prop `actions`. Tidak ada fitur baru, hanya pemulihan tombol yang sudah ada di desain §5.12.
- Desain vs kontrak: tidak ada data baru; `bukaTambah` tetap mengisi `FORM_KOSONG` dan membuka modal "Tambah akun admin". Rute `POST /admin/akun` tidak disentuh.
- Kelayakan: `Components/PageHeader.jsx` hanya merender `actions`; tidak ada komponen atau paket baru.

Verifikasi:
- `npm run build` → exit 0, "✓ built in 3.57s".
- Harness browser Chrome (`file://`, `tmp/accounts-tambah-harness.html`, dibangun oleh `node tmp/build-accounts-tambah-check.mjs`) membundel `Pages/Admin/Accounts/Index.jsx` asli + `Modal` asli + CSS build dengan stub Inertia (**bukan integrasi server**).
- 1280×768: tombol "Tambah admin" di dalam `header` (x 1084, y 148, 172×47), hit-test `true`; klik → dialog "Tambah akun admin" terbuka, footer `Batal` dan `Simpan akun` di 635–682, keduanya hit-test `true`, body `overflow hidden`.
- Esc (CDP key event) menutup modal, body kembali `visible`; buka lagi → klik overlay (20,300) menutup modal.
- 1280×640: tombol tetap tampil dan hit-test `true`; modal terbuka, `Batal`/`Simpan akun` di 553–600 (dalam viewport 640).
- 360×640 (mobile): tanpa overflow horizontal (`scrollWidth 360`), tombol selebar 328 di y 194, hit-test `true`; modal terbuka, footer 553–600 terlihat.
- 768×1024: tombol di kanan header (x 583), hit-test `true`; modal terbuka, `Simpan akun` di 758–805 terlihat.

Known issue / belum diuji:
- **Belum diuji terhadap server/admin nyata**: harness memakai stub Inertia; `form.post('/admin/akun')` dan flash server tidak dieksekusi, server dev tidak dinyalakan.
- **Belum diuji**: zoom 200%, pembaca layar, keyboard Tab penuh di halaman akun (fokus trap modal sudah diuji di kartu `t_aa6dc2df`), Safari/iOS `100dvh`.

## t_326f766b — Riwayat pesanan `/history` + menu profil header (Perbaikan 5, 23 Okt 2026)

Rencana ringkas:
1. `Pages/Public/History.jsx` (baru): `PublicLayout` + `Breadcrumb` + H1, membaca props `orders` (paginator) dan `ringkasan` persis kontrak §13.
2. Kartu pesanan: kode, tanggal, `StatusBadge` (`status_label`, termasuk Batal), total, jumlah produk/item, baris item (gambar + nama + varian + qty × harga + line_total), label pembayaran.
3. Tautan detail hanya bila `detail_url` tidak null; label memakai microcopy design yang ada ("Lihat Pesanan" / "Lanjut ke Pembayaran"); tanpa URL karangan.
4. Empty state `EmptyState` ("Belum ada pesanan" + "Mulai belanja" → `/produk`), galat paginasi `InlineNotice` + "Coba lagi", status memuat `Spinner` + `aria-busy`, paginasi lewat `Pagination` + `router.get('/history')` query `page`.
5. `Header.jsx`: ikon profil tetap; popover hover/focus berisi nama+email, "Riwayat pesanan" (`/history`), "Keluar" (`POST /logout`); tamu tetap ikon → `/login`. Escape menutup dan mengembalikan fokus; Tab masuk menu; panel `top-full` agar tidak menutupi ikon.
6. `PublicLayout.jsx`: footer `NavDrawer` untuk user login berisi nama, "Riwayat pesanan", "Keluar" (tamu tetap Daftar/Masuk).
7. `docs/asumsi.md`: catat microcopy halaman dan label tautan detail yang tidak ditetapkan desain.

Validasi tiga arah:
- Rencana vs desain: `docs/design.md` tidak punya layar `/history`; tata letak mengikuti pola halaman publik yang ada (`container py-4`, Breadcrumb, `text-h1`, `card`) dan komponen baku. §3.1 hanya menyebut ikon kanan (Cari, Keranjang, Masuk) tanpa dropdown profil; menu hover adalah mandat eksplisit `docs/rencana-perbaikan-5.md` baris 22 (kartu ini), bukan tafsiran agent. Tanpa token/warna/komponen baru.
- Desain vs kontrak: kontrak §13 LOCKED — `orders.data[]` memuat `status/status_label/payment_label/total/items_count/total_qty/created_at/detail_url/items[]`; `detail_url` boleh `null` (termasuk batal); `ringkasan` dari seluruh pesanan. Semua status tampil, tanpa filter.
- Kelayakan: `HistoryController` merender `Public/History`; `HandleInertiaRequests` membagikan `settings`, `auth.user`, `cart.count` — halaman mengambil `settings` lewat `usePage()` karena controller tidak mengirimnya. Tanpa paket baru; `Pagination`, `StatusBadge`, `EmptyState`, `InlineNotice`, `Spinner`, `Button`, `formatDateTime/rupiah/formatNumber` sudah ada.

Implementasi dan verifikasi (23 Okt 2026):
- `Pages/Public/History.jsx` (baru, 10,8 KB): kartu pesanan `<article>` dengan kode, `formatDateTime(created_at)`, `StatusBadge` dari `status_label`, total, `items_count`/`total_qty`, baris item (gambar 64px + nama + `variant_label` + qty × `unit_price` + `line_total`), dan `Pembayaran: {payment_label}`. Tautan detail hanya dirender bila `detail_url` tidak `null`; label memakai microcopy design yang sudah ada — **"Lihat Pesanan"** (`settlement`) dan **"Lanjut ke Pembayaran"** (`pending` + `payment_status pending`) — bukan teks baru.
- Status kosong: `EmptyState` "Belum ada pesanan" + "Mulai Belanja" → `/produk`; subjudul jumlah hanya tampil bila `ringkasan.total > 0`. Galat paginasi: `InlineNotice` "Riwayat pesanan gagal dimuat" + tombol "Coba lagi" yang mengulang halaman gagal. Memuat: `Spinner` + teks "Memuat pesanan…" (`role="status"`) dan `aria-busy` pada daftar; tombol paginasi dijaga dari kirim ganda lewat guard `memuat`.
- `Header.jsx`: popover profil `hidden md:block` dengan `aria-haspopup/expanded/controls`, nama + email, "Riwayat pesanan" (`/history`), "Keluar" (`POST /logout`). Escape ditangani listener `document` saat panel terbuka (berlaku juga untuk panel hasil hover) lalu fokus kembali ke tombol; `onFocus` hanya membuka saat `:focus-visible` agar klik mouse tidak dibuka-lalu-ditutup oleh toggle; blur keluar panel menutup. Tamu tetap ikon → `/login`.
- `PublicLayout.jsx`: footer `NavDrawer` login berisi "Masuk sebagai {nama}", tautan `/history` (menutup drawer), dan "Keluar" dengan status memuat.
- `docs/asumsi.md`: butir 32 mencatat microcopy halaman dan label CTA yang tidak ditetapkan `docs/design.md`.
- Harness verifikasi (bukan bagian aplikasi): `tmp/inertia-stub-history.jsx`, `tmp/history-harness.jsx`, `tmp/build-history-check.mjs`, `tmp/history-harness.html`.

Bukti:
- `npm run build` → exit 0, "✓ built in 2.76s"; chunk `public/build/assets/History-DGhP6AXm.js` (halaman publik, 5,7 kB) ikut ter-emit (chunk `History-D9faOEZD.js` milik `Admin/Stocks/History`).
- `python tmp/cek-komponen-tanpa-import.py C:/Users/LENOVO/Downloads/toko-kulot` → 98 berkas, hanya `app.jsx: App` (false positive parameter `setup({el, App, props})`).
- `python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` → 73 chunk, hanya `DropzoneGalery-*.js -> FREE: P` (temuan lama, bukan berkas kartu ini).
- Harness Chrome `file://` (stub Inertia, **bukan integrasi server**): 3 kartu tampil dengan kode/tanggal/jumlah/badge/total/baris item/pembayaran; hanya 2 tautan detail (`/checkout/41/selesai` "Lihat Pesanan", `/checkout/43/bayar` "Lanjut ke Pembayaran"), pesanan batal tanpa tautan; gambar `null`/rusak → 3 placeholder, tanpa `NaN`/`undefined`.
- Pagination: klik halaman 2 → `GET /history {page:2}`, "Memuat pesanan…" + `aria-busy="true"`; respons 500 → notice + "Coba lagi"; retry → `{page:2}` lagi; sukses → notice hilang. Halaman 2 dengan total 4 menampilkan "4 pesanan tercatat di akunmu." dan tombol halaman 2 `aria-current`.
- Empty state tanpa duplikasi subjudul; tamu: tautan "Masuk" `/login` ada, `#menu-profil` tidak ada. Data minim (`created_at: null`, `items: []`, `total: "0"`) → "-" dan "Rp0", tanpa galat render.
- Menu profil: hover membuka panel berisi "Siti Rahma", email, "Riwayat pesanan" (`/history`); Escape menutup, `aria-expanded="false"`, fokus kembali ke tombol; Tab → Riwayat → Keluar, Enter di Keluar → `POST /logout`; Tab keluar panel menutup menu.
- Drawer 360 px: "Masuk sebagai Siti Rahma", "Riwayat pesanan", "Keluar" → `POST /logout`. Tidak ada overflow horizontal pada 360/768/1024/1280 (lebar kartu 313/721/909/924).

Known issue / belum diuji:
- **Belum diuji terhadap server Laravel nyata**: login pembeli, data pesanan asli, redirect tamu `auth:web`, dan respons paginasi Inertia sungguhan; harness memakai stub, server dev tidak dinyalakan.
- **Belum diuji, butuh browser**: zoom 200%, pembaca layar, Safari/iOS, serta back/forward setelah paginasi.
- `ringkasan.pending/dibayar/...` belum divisualkan (tidak diminta kartu); baru `ringkasan.total` yang dipakai.

## t_c915c033 — Identitas toko di header/footer publik (23 Okt 2026)

Rencana ringkas: `PublicLayout` memakai props bersama `settings` sebagai dasar lalu prop halaman
menimpa; `Header` menampilkan logo + nama (truncate mobile); `Footer` memakai `footer_copyright`
dengan placeholder `{tahun}`/`{toko}`; tab Footer admin mendapat isian "Copyright notice".
Berkas: `Layouts/PublicLayout.jsx`, `Components/Header.jsx`, `Components/Footer.jsx`,
`Pages/Admin/Settings/Index.jsx`.

Validasi tiga arah:
- Rencana vs desain: keluhan #5/#6 dan keputusan `docs/rencana-perbaikan-5.md` sudah menetapkan
  perilaku; `docs/design.md` §3.1/§3.2 hanya mengatur tampilan header/footer, sehingga tidak ada
  layar atau komponen baru. Tidak ada fitur yang ditunda ikut dikerjakan.
- Desain vs kontrak: `settings.store_name`, `store_logo`, `footer_copyright` ada di kontrak §1/§2;
  `footer_copyright` boleh kosong/null, maks 200 (kontrak §10.7/§10.8). Backend sudah mendukung
  (`UpdateSettingRequest`, `SettingService`, seeder) — tidak ada ketidakcocokan kontrak.
  Fallback `© {tahun} {store_name}` dan penggantian `{toko}` mengikuti keputusan rencana baris 23
  dan asumsi #30.
- Kelayakan: `PublicLayout` sudah dipakai semua halaman publik; halaman Cart/Checkout tidak
  mengirim `settings`, jadi penggabungan dengan props bersama cukup tanpa mengubah controller.
  `Field`/`Input`/`SectionCard`/`StickySave` sudah ada; tanpa dependensi baru.

Verifikasi:
- `npm run build` → exit 0, "✓ built in 3.42s"; `PublicLayout-*.js` 12.52 kB.
- Harness SSR (bukan integrasi): `node tmp/build-header-footer-check.mjs && node
  tmp/verify-header-footer.bundle.mjs` → 9 pemeriksaan lulus (nama dari props bersama, logo alt="",
  placeholder diganti, tanpa `{tahun}`/`{toko}` mentah, prop halaman menimpa, copyright kosong/spasi
  → fallback, settings kosong tidak error).
- Browser Chrome, server dev pemilik `http://127.0.0.1:8000` (tanpa menyalakan server):
  `/`, `/produk`, `/keranjang`, `/checkout`, `/checkout/16/bayar` semuanya menampilkan
  "LIIORA.ID" + logo 32 px di header dan copyright footer `© 2026 Liiora.id`; halaman bayar
  menampilkan pesanan `TK-20261022-0004`.
- Admin (`/admin/pengaturan` → tab Footer): isian `#footer_copyright` kosong (nilai seeder),
  label "Copyright notice", `maxlength=200`, hint terhubung (`aria-describedby="footer_copyright-hint"`).
  Diisi `© {tahun} {toko}. Semua hak dilindungi.` → "Pengaturan disimpan." → footer publik
  `© 2026 Liiora.id. Semua hak dilindungi.`; nilai dikembalikan ke kosong dan disimpan lagi →
  footer publik kembali `© 2026 Liiora.id`. Data pemilik tidak berubah.
- Responsif 360/768/1024/1280: tanpa overflow horizontal, nama selalu tampil, logo 32×32.
  Nama 60 karakter di 360 px terpotong (`truncate`, 151 px) tanpa overflow; `title`/`aria-label`
  tetap memuat nama penuh. Logo gagal muat → `<img>` dilepas, nama tetap tampil.
- `python tmp/cek-komponen-tanpa-import.py …` → 98 berkas, hanya `app.jsx: App` (false positive).
  `python tmp/cek-bundel-identifier-bebas.py …` → 73 chunk, hanya `DropzoneGalery-*.js -> FREE: P`
  (temuan lama).

Known issue / belum diuji:
- **Belum diuji, butuh data**: `/checkout/{order}/selesai` tidak dibuka di browser karena tidak ada
  pesanan `settlement` milik akun uji tanpa membayar lewat Midtrans; halaman memakai `PublicLayout`
  yang sama dan sudah diuji lewat `/checkout`.
- **Belum diuji**: pembaca layar, zoom 200%, Safari/iOS.
- Label isian admin berbahasa Inggris ("Copyright notice") mengikuti kartu; teks bantu lain
  didokumentasikan di `docs/asumsi.md` #33.
- Perubahan `Header.jsx`/`PublicLayout.jsx` dari kartu riwayat (`t_326f766b`) yang belum di-commit
  ikut berada di working tree; perubahan kartu ini digabung di atasnya, bukan menimpanya.

## t_839aa23e — Hero section landing di atas carousel (Perbaikan 5 butir 3, 23 Okt 2026)

Rencana ringkas:
1. `Components/HeroSection.jsx` (baru): hero dari `settings.landing_hero`, tinggi `h-heroMobile`/`md:h-hero`, gambar `object-cover` + overlay `bg-black/35`, judul `text-display` putih, CTA `btn-primary`; `onError` menyembunyikan gambar rusak tanpa ikon.
2. `Pages/Public/Home.jsx`: `toHero(settings.landing_hero)` dirender sebelum `HeroCarousel`; `toSlides` kini hanya memakai `carousels` (fallback slide dari `landing_hero` dihapus agar tidak tampil dua kali).
3. Carousel dilewati bila hero tampil dan tidak ada slide; tanpa hero, perilaku lama (fallback banner) dipertahankan.

Validasi tiga arah:
- PRD/rencana vs desain: `docs/rencana-perbaikan-5.md` butir 3 meminta hero `landing_hero` di atas carousel. `docs/design.md` tidak punya komponen hero terpisah; visual diturunkan dari §3.3 butir 2, §4.15, dan §5.1 (tinggi 480/560, overlay `rgba(0,0,0,.35)`, H1 `text-display`, CTA `h-btn`, konten tengah mobile / kiri-bawah desktop). Tidak ada token/warna/komponen baru.
- Desain vs kontrak: `landing_hero` = objek `title, subtitle, cta_label, cta_url, image` (kontrak §2 dan §10.9; `title` wajib di admin). Judul+gambar kosong → section tidak dirender. CTA hanya dirender bila label dan URL sama-sama terisi. Gambar memakai URL apa adanya (tanpa mengarang path).
- Kelayakan: `HeroSection` baru + `Home.jsx`; `HeroCarousel`, `PublicLayout`, token `h-hero*`, `text-display`, `btn-primary` sudah ada. Tanpa dependensi baru.

Verifikasi:
- `npm run build` → exit 0, "✓ built in 3.46s". Bundel `public/build/assets/Home-6URBwPiA.js` 14.64 kB (chunk Home ikut ter-emit).
- `carousels` mengikuti kontrak (`link`, `button_text`) dan alias lama (`url`/`href`, `cta_label`) tetap dibaca di `toSlides`.
- Audit statis: `HeroSection` mengimpor `React` eksplisit (kelas bug blank page), `img` punya `alt` (default `""` karena gambar latar dekoratif di belakang teks), `loading="eager"` + `fetchPriority="high"` sesuai design §7.3, `object-cover`, `onError` menyetel status rusak.
- **Belum diuji, butuh browser**: tampilan nyata di `/` (hero di atas carousel, 360/768/1024/1300), gambar 404 dari data, dan landing tanpa `landing_hero`/tanpa `carousels`. Alasan: server pengembangan tidak dinyalakan (aturan kerja); tidak ada harness untuk halaman ini pada sesi ini.

Known issue / catatan:
- Bila `carousels` berisi dan `landing_hero` juga berisi, halaman menampilkan dua blok setinggi hero (560/480 px) berturut-turut — sesuai mandat kartu (hero di atas carousel), bukan deviasi diam-diam.
- `HeroSection` memakai `<h1>`; `HeroCarousel` juga memakai `<h1>` untuk slide (design §4.15). Bila keduanya tampil ada dua `h1`; tidak diubah karena `HeroCarousel` di luar lingkup kartu.
- Gambar hero yang 404 hanya menyembunyikan gambar; teks tetap tampil di latar `brand-700` (tanpa ikon broken).

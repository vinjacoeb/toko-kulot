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

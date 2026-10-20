# Komponen — Kontrak API & State

Pegangan implementasi untuk **K10–K14** (frontend). Dokumen ini melengkapi `docs/design.md` §4: `design.md` menetapkan **tampilan**, dokumen ini menetapkan **props, event, dan state** tiap komponen React.

Status: kontrak ditulis di K3 (uiux), belum ada implementasi. Lokasi target: `resources/js/Components/`. Setiap komponen wajib punya state `loading`/`empty`/`error` sesuai `design.md` §4.0 bila mengambil data.

## Aturan umum

1. Props memakai `camelCase`; data dari server mengikuti nama kolom (snake_case) apa adanya, jangan di-rename di sisi React tanpa alasan.
2. Komponen presentasional **tidak** melakukan fetch. Fetch ada di halaman (`Pages/`) atau hook; komponen menerima data + status.
3. Status data selalu dikirim eksplisit: `loading` (bool), `error` (string|null), `empty` (diturunkan dari panjang data, bukan prop terpisah).
4. Semua teks lewat props dengan default Bahasa Indonesia — tidak ada string hardcoded yang tidak bisa diganti.
5. Aksi destruktif wajib melewati `ConfirmDialog`, bukan `window.confirm`.
6. Uang selalu integer rupiah; format via helper `rupiah(n)` → `Rp149.000`. Jangan kirim string terformat dari server.

## 1. Primitif

| Komponen | Props | Event | Catatan |
|---|---|---|---|
| `Button` | `variant='primary'\|'secondary'\|'ghost'\|'danger'\|'link'`, `size='md'\|'sm'`, `loading=false`, `disabled=false`, `as='button'\|'a'\|Link`, `href`, `type`, `fullWidth=false`, `icon` | `onClick` | Saat `loading`: label "Memproses…", lebar dikunci, `aria-busy` |
| `IconButton` | `label` (wajib), `size=32\|40\|44`, `tone='default'\|'danger'`, `icon` | `onClick` | `label` menjadi `aria-label` + tooltip |
| `Input` | `id`, `label`, `type`, `value`, `placeholder`, `hint`, `error`, `required`, `disabled`, `autoComplete`, `inputMode` | `onChange(value)`, `onBlur` | `error` → `aria-invalid` + `aria-describedby` ke elemen error |
| `Textarea` | sama seperti `Input` + `rows=4`, `maxLength` | `onChange(value)` | min-height 120px |
| `Select` | sama seperti `Input` + `options: [{value,label,disabled?}]` | `onChange(value)` | Native `<select>` bergaya `h-field` |
| `Checkbox` | `id`, `label`, `checked`, `error`, `disabled` | `onChange(checked)` | Target sentuh 44px termasuk label |
| `Field` | `label`, `hint`, `error`, `htmlFor`, `children` | — | Pembungkus tata letak label/hint/error |
| `Badge` | `tone='brand'\|'accent'\|'sale'\|'success'\|'warning'\|'danger'`, `children` | `text-badge uppercase rounded-full`; kelas per tone §4.21 v2.1 (`accent` → `bg-accent-500 text-ink`, `sale` → `bg-sale-500 text-white`, tone lain `bg-{token}/10 text-{token}-strong`) |
| `Skeleton` | `variant='text'\|'title'\|'card'\|'table-row'`, `count=1`, `className` | — | `animate-pulse-slow`, dimensi mengikuti komponen asli |
| `EmptyState` | `title`, `description`, `actionLabel`, `actionHref`, `onAction`, `icon` | `onAction` | Tidak boleh dipakai untuk state error |
| `ErrorState` | `title='Gagal memuat data'`, `description`, `onRetry`, `supportHref` | `onRetry` | Selalu di dalam layout |
| `InlineNotice` | `tone='info'\|'success'\|'warning'\|'error'`, `title`, `children`, `onDismiss` | `onDismiss` | `role="alert"` untuk error, `role="status"` lainnya |
| `Spinner` | `size=16\|20\|24`, `label` | — | `aria-label` untuk screen reader |
| `StarRating` | `value` (0–5, boleh desimal), `size='sm'\|'md'\|'lg'`, `readOnly=true`, `count` | `onChange(value)` | Read-only → `aria-label="Rating 4,8 dari 5"` |
| `Pagination` | `links: [{url,label,active}]`, `from`, `to`, `total` | `onNavigate(url)` | Pakai bentuk paginator Laravel apa adanya |

## 2. Layout publik

| Komponen | Props | Catatan |
|---|---|---|
| `PublicLayout` | `settings` (`store_name`, `tagline`, `contact_*`, `header_nav`, `footer_*`), `children` | Membungkus `Header` + `main` + `Footer`; `settings` dibagikan lewat `HandleInertiaRequests` |
| `Header` | `nav: [{label,href}]`, `cartCount`, `user`, `onOpenDrawer` | Sticky `h-header`, `scrolled` internal state (scroll > 8px) |
| `NavDrawer` | `open`, `nav`, `onClose` | Fokus terperangkap, Esc menutup, body scroll dikunci |
| `Footer` | `about`, `links: [{title,items:[{label,href}]}]`, `social: [{name,href}]`, `contact` | Kolom kosong tidak dirender |
| `Breadcrumb` | `items: [{label,href?}]` | Item terakhir tanpa `href`, `aria-current="page"` |
| `SectionHeader` | `title`, `description`, `actionLabel`, `actionHref` | — |
| `HeroCarousel` | `slides: [{image,alt,title,subtitle,ctaLabel,ctaHref}]`, `autoplayMs=6000`, `loading`, `error` | Berhenti saat hover/focus/`prefers-reduced-motion` |
| `CategoryCard` | `name`, `image`, `href`, `productCount` | Rasio 3:4 |
| `TrustStrip` | `items: [{icon,label}]` | Maks 4 |
| `ProductCard` | `product: {id,slug,name,type,price,comparePrice,discount,rating,reviewCount,image,imageAlt,secondImage,soldOut}`, `onAddToCart`, `priority=false` | Gambar 1:1; `priority` → `loading="eager"` |
| `ProductGrid` | `products`, `loading`, `error`, `onRetry`, `skeletonCount=8`, `onAddToCart` | Grid 4/3/2 kolom; `empty` ditangani halaman |
| `FilterPanel` | `filters: {categories,priceRange,sizes}`, `value`, `onChange`, `onReset`, `activeCount` | Desktop sidebar, mobile `BottomSheet` |
| `BottomSheet` | `open`, `title`, `onClose`, `children`, `footer` | 80vh, `rounded-t-xl`, fokus terperangkap |
| `SearchInput` | `value`, `onChange`, `placeholder`, `debounceMs=300` | Tombol bersihkan saat terisi |
| `SortSelect` | `value`, `onChange`, `options` | Opsi baku dari server (`sort` query) |
| `PriceBlock` | `price`, `comparePrice`, `discountPercent`, `size='sm'\|'lg'` | Coret + badge diskon |
| `StatusBadge` | `status` (`pending`/`dibayar`/`diproses`/`dikirim`/`selesai`/`batal`), `label`, `className` | Pemetaan warna baku `design.md` §4.21 **v2.1** — `bg-{token}/10 text-{token}-strong`; `neutral` = `bg-slate-200/60 text-slate-600`; status di luar daftar → `neutral` |
| `Countdown` | `expiresAt` (ISO string), `onExpire` | < 3 menit → `text-danger` + pulse |

## 3. Detail produk & transaksi

| Komponen | Props | Catatan |
|---|---|---|
| `ProductGallery` | `images: [{url,alt}]`, `activeIndex`, `onChange`, `error` | Utama 1:1 + thumbnail 72px; `error` → placeholder `bg-surface` |
| `VariantChip` | `label`, `selected`, `disabled`, `unavailable` | 44×40px, coret diagonal bila tidak tersedia |
| `ColorSwatch` | `label`, `hex`, `selected`, `disabled` | Lingkaran 28px + cincin aktif |
| `QtyStepper` | `value`, `min=1`, `max`, `onChange`, `disabled` | Tombol `disabled` di batas |
| `Accordion` | `items: [{id,title,content}]`, `openId`, `onToggle` | Animasi 200ms |
| `ReviewCard` | `review: {name,rating,date,comment,reply}`, `avatarInitial` | Balasan toko bergaris kiri `accent-500` |
| `RatingSummary` | `average`, `count`, `distribution: {5,4,3,2,1}` | Bar proporsional |
| `ReviewForm` | `productId`, `rating`, `comment`, `submitting`, `submitted`, `error`, `onSubmit({rating,comment})` | Setelah `submitted` → readonly + ucapan terima kasih |
| `CartLine` | `item: {id,name,variant,image,price,qty,stock,subtotal}`, `updating`, `onQtyChange`, `onRemove` | Baris `aria-busy` saat `updating` |
| `OrderSummary` | `subtotal`, `shipping`, `total`, `ctaLabel`, `ctaHref`, `onSubmit`, `loading`, `note` | Sticky `w-summary` |
| `QrisPanel` | `status='pending'\|'checking'\|'paid'\|'expired'\|'error'`, `qrUrl`, `orderCode`, `total`, `expiresAt`, `onCheck`, `onCopy` | Countdown dari `expiresAt`; polling 5s dipicu halaman |
| `Toast` | `tone`, `title`, `message`, `duration=4000`, `onClose` | Maks 3 tumpuk, `z-toast` |
| `ConfirmDialog` | `open`, `title`, `description`, `confirmLabel`, `cancelLabel='Batal'`, `tone='danger'`, `loading`, `onConfirm`, `onCancel` | Fokus awal di tombol batal |

## 4. Admin

| Komponen | Props | Catatan |
|---|---|---|
| `AdminLayout` | `auth: {name,email}`, `nav`, `children` | Sidebar 240px `bg-brand-700`, topbar 64px |
| `PageHeader` | `title`, `breadcrumb`, `actions` | Aksi turun ke baris sendiri di mobile |
| `DataTable` | `columns: [{key,label,sortable,width,align}]`, `rows`, `loading`, `error`, `empty`, `onSort`, `onRowClick`, `rowKey`, `selectedIds` | Header sticky, baris 56px, skeleton 8 baris |
| `TableToolbar` | `search`, `onSearch`, `filters`, `actions` | Debounce 300ms |
| `KpiCard` | `label`, `value`, `delta`, `deltaLabel`, `icon`, `href`, `loading` | Delta naik `success`, turun `danger` |
| `ChartCard` | `title`, `range`, `series`, `labels`, `type='line'\|'area'`, `loading`, `empty`, `error`, `onRetry` | Warna `brand-700` + isi `brand-100` |
| `TabNav` | `tabs: [{id,label}]`, `active`, `onChange` | `role="tablist"`, scroll horizontal di mobile |
| `Dropzone` | `value: File[]`, `max=6`, `maxSizeMb=4`, `accept`, `onChange`, `onRemove`, `uploading`, `progress`, `error` | Pratinjau 1:1, bisa diurutkan |
| `ProductForm` | `product`, `categories`, `onSubmit`, `saving`, `errors` | 2 kolom: data+varian / status+kategori+galeri |
| `VariantTable` | `rows: [{size,color,stock,price}]`, `onChange`, `onAdd`, `onRemove` | Ukuran × warna × stok × harga |
| `StatusSelect` | `status`, `allowedTransitions`, `onChange`, `saving` | Transisi tidak sah → `disabled` + alasan |

## 5. Pemetaan state halaman

| Halaman | State yang wajib dirender | Komponen penanggung jawab |
|---|---|---|
| Landing | `loading` per seksi, `empty` (seksi disembunyikan), `error` per seksi (`InlineNotice`) | `HeroCarousel`, `ProductGrid`, `EmptyState` |
| Katalog | `loading` (8 skeleton), `empty` (+ reset filter), `error` (+ retry), `filtered`, `sorted` | `ProductGrid`, `FilterPanel`, `Pagination` |
| Detail | `loading`, `error`, `sold-out`, `variant-unavailable`, `no-review`, `gallery-error` | `ProductGallery`, `QtyStepper`, `ErrorState` |
| Kontak | `idle`, `validating`, `submitting`, `success`, `error-server`, `map-error` | `Field`, `InlineNotice` |
| Auth | `idle`, `submitting`, `error-field`, `error-global`, `success` | `Field`, `Button` |
| Keranjang | `loading`, `empty`, `error`, `updating`, `stock-changed`, `guest` | `CartLine`, `OrderSummary` |
| Checkout | `idle`, `submitting`, `error-field`, `error-payment`, `cart-empty` | `Field`, `OrderSummary` |
| Bayar | `pending`, `checking`, `paid`, `expired`, `error` | `QrisPanel` |
| Selesai | `paid`, `review-empty`, `review-submitting`, `review-submitted`, `review-error` | `ReviewForm` |
| Admin CRUD | `loading`, `empty`, `error`, `saving`, `deleting`, `validation-error`, `success` | `DataTable`, `Modal`, `ConfirmDialog` |
| Pengaturan | `loading`, `dirty`, `saving`, `saved`, `error`, `upload-error` | `TabNav`, `Dropzone` |

## 6. Hook & helper bersama

| Nama | Tujuan |
|---|---|
| `useFetchState(fn)` | Mengelola `{data, loading, error, retry}` + batas 10 detik → `error` |
| `useDebounce(value, ms)` | Pencarian & filter |
| `useCountdown(expiresAt)` | Sisa waktu QRIS, mengembalikan `{minutes, seconds, expired}` |
| `useFocusTrap(ref, active)` | Modal/drawer/bottom-sheet |
| `useScrolled(threshold)` | Header `scrolled` state |
| `rupiah(n)` | Format rupiah integer |
| `statusTone(status)` | Pemetaan status order → tone badge |
| `cn(...classes)` | Gabung kelas kondisional (tanpa dependensi baru; boleh `clsx` bila sudah ada) |

## 7. Batas dokumen ini

- Tidak menetapkan bentuk respons API — itu wewenang backend (K4–K9). Nama field di atas adalah **usulan**; bila backend memakai nama berbeda, ubah tabel ini di kartu yang relevan, jangan diam-diam menyesuaikan di komponen.
- Tidak menetapkan isi copywriting final; teks contoh boleh diganti pemilik produk.
- Belum ada komponen yang diimplementasikan per 20 Okt 2026; `resources/js/Components/` masih kosong.

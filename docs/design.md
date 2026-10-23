# DESIGN.md — Toko Kulot

> **Status: final untuk kartu K3** (token terpasang di `tailwind.config.js`, terverifikasi `node token-check.mjs` + `npm run build`).
> Dokumen ini sumber kebenaran **tampilan**. Fungsi & rute tetap mengacu `docs/PRD.md`.
> Metode: REA (reverse engineering) `erigostore.co.id` — inspeksi DOM terpilih via CDP (read-only), ekstraksi `getComputedStyle`, inventaris komponen, struktur seksi. Tidak ada aset, gambar, copywriting, atau kode Erigo yang disalin; hanya bahasa visual (token, proporsi, pola layout).
> Tanggal capture: 20 Oktober 2026. Halaman sumber: `/` dan `/products/erigo-t-shirt-oversize-antelope-black-unisex`.
> Berkas pendamping: `docs/komponen.md` (API & state per komponen, pegangan K10), `docs/design-catatan-rea.md` (log audit + drift), `docs/traceability.md` (peta lintas peran).

## Riwayat Revisi

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | 20 Okt 2026 | Capture awal Erigo: 9 bagian, 433 baris, token masih naratif (belum ada peta ke config) |
| 2.0 | 20 Okt 2026 | **K3 final**: §2.5 peta token → `tailwind.config.js`, §2.6 aturan pemakaian, §4 diperluas ke 31 komponen + matriks state, §5 mencakup seluruh rute PRD §5 (termasuk halaman error & sub-halaman admin), §9 checklist dengan bukti, §10 traceability PRD ↔ desain, §11 log drift D1–D7 |
| 2.1 | 20 Okt 2026 | **Kartu QA `t_8cd61512` (kontras badge)**: token baru `success-strong`/`warning-strong`/`danger-strong` (tangga 800) + aturan kontras teks state (§2.1); §2.5/§2.6 diperbarui (**55 token**); §4.21 aturan tone badge diganti dari `bg-{token}/10 text-{token}` → `bg-{token}/10 text-{token}-strong` (semua tone ≥ 5,33:1); §9 baris 1/11 + baris 19; §11.4 temuan kontras non-badge (T1–T6); §5.10 catatan deviasi + §11.3 **D8** — kolom `⌕ cari` topbar admin tidak dibangun, jalur pencarian = toolbar §5.12 (keputusan `t_b5de72e3`) |
| 2.2 | 20 Okt 2026 | **Kartu UIUX `t_14cad9e2` (teks meta di atas latar non-putih) — keputusan B**: teks meta informatif < 24px (`text-meta`/`text-label`/`text-badge`) wajib `slate-600` (#475569) di atas latar non-putih (`surface`, `brand-100`, chip `slate-200/60`, `slate-200`); `slate-500` hanya sah di atas putih. §2.1 aturan kontras diperluas + baris token + tabel "Teks meta non-badge (v2.2)" §4.21; §2.5/§2.6 butir 6; §4.4/§4.5/§4.7/§4.13/§4.23/§4.26/§4.27/§4.28/§4.29 diselaraskan dengan kelas aktual; §9 baris 11 + baris 20; §11.4 **T7** (29 titik / 13 berkas) + pemetaan per konteks; §12 berkas baru. Gate: `python docs/qa/sweep-meta-surface.py`; penerapan kode diserahkan ke kartu frontend lanjutan |
| 2.3 | 21 Okt 2026 | **Kartu UIUX `t_46901364` (deviasi laporan pemilik butir 5 & 7)**: empat deviasi baru di §11.3 — **D13** tombol sekunder "Sinkronkan status pembayaran" + notice hasil di kartu "Bukti pembayaran" §5.12 (state `loading`/`disabled` + alasan terlihat, aturan anti-duplikasi dengan `Toast` halaman §4.8); **D14** tautan teks "Daftar" di header desktop untuk tamu (§3.1); **D15** footer drawer tamu = "Daftar" `primary` di atas "Masuk" `secondary` (§3.1); **D16** tautan silang Masuk ↔ Daftar di `/login` & `/register` (§5.5). **Tanpa token, warna, ukuran, komponen, atau nomor bagian baru** — hanya baris tabel §11.3 + baris riwayat ini. Basis bukti: `docs/review-2.md` §2 butir 5 & 7; keputusan techlead kartu `t_caaa8fa4`; kontrak §12.24 (kartu `t_c374a29b`); kode `Header.jsx:87-108`, `PublicLayout.jsx:84-94`, `Admin/Orders/Show.jsx:208-214` (posisi D13). Catatan kerja: `docs/catatan-uiux.md`. |

---

## 1. Karakter Visual yang Diambil dari Erigo

Yang ditiru (bahasa visual): **storefront fashion minimalis kontras tinggi** — header putih bersih, tipografi display condensed untuk judul, CTA kuning menyala, sudut membulat kecil (8–9px), border abu tipis sebagai pemisah, footer hitam penuh, grid produk 4 kolom desktop / 2 kolom mobile dengan gambar rasio 1:1.

Yang **tidak** ditiru: struktur tema Shopify (`card__inner`, `media--hover-effect`), aset gambar, copywriting, komponen pihak ketiga. Kita bangun ulang di React + Tailwind memakai token §2.

---

## 2. Design Token

### 2.1 Warna

Nilai Erigo adalah hasil ukur dan dipakai sebagai acuan; kolom "Toko Kulot" adalah nilai yang benar-benar dipakai implementasi (identitas sendiri, kontras tetap terjaga). Kolom **Tailwind** adalah nama token di `tailwind.config.js` — **hanya nama ini yang boleh muncul di JSX**.

| Token | Fungsi | Erigo (acuan) | Toko Kulot (dipakai) | Tailwind | Kelas contoh |
|---|---|---|---|---|---|
| `brand.primary` | Teks utama, header link, wordmark | `#151F6D` | `#1F2A5E` | `brand` / `brand-700` | `text-brand`, `bg-brand-700` |
| `brand.primaryHover` | Hover tombol gelap, link aktif | — | `#2A3775` | `brand-600` | `hover:bg-brand-600` |
| `brand.tint` | Latar lembut, chip terpilih | — | `#E7E9F2` | `brand-100` | `bg-brand-100` |
| `brand.primarySoft` | Teks sekunder (75% opacity) | `rgba(21,31,109,.75)` | `rgba(31,42,94,.75)` | `brand-soft` | `text-brand-soft` |
| `accent.cta` | Tombol utama, badge promo | `#FFBB00` | `#F5B301` | `accent` / `accent-500` | `bg-accent-500` |
| `accent.ctaHover` | Hover tombol utama | — | `#D99E00` | `accent-600` | `hover:bg-accent-600` |
| `accent.alert` | Harga diskon, label "Sale" | `#FF2E00` | `#E02B00` | `sale` / `sale-500` | `text-sale-500` |
| `neutral.ink` | Judul tebal, teks CTA | `#121212` | `#121212` | `ink` | `text-ink` |
| `neutral.body` | Paragraf | `rgba(0,0,0,.75)` | `rgba(0,0,0,.75)` | `ink-soft` | `text-ink-soft` |
| `neutral.muted` | Placeholder, meta | `#94A3B8` | `#94A3B8` | `slate-400` | `text-slate-400` |
| `neutral.strongMuted` | Header tabel, label redup (hanya di atas putih) | `#64748B` | `#64748B` | `slate-500` | `text-slate-500` |
| `neutral.metaOnTint` **(v2.2)** | Teks meta < 24px di atas latar **non-putih** | — | `#475569` | `slate-600` | `text-slate-600` |
| `neutral.border` | Garis kartu, divider (dipakai 1888×) | `#E5E7EB` | `#E5E7EB` | **`line`** | `border-line` |
| `neutral.borderMuted` | Garis lama (fallback, dimigrasikan) | — | `#E2E8F0` | `slate-200` | `border-slate-200` |
| `neutral.surface` | Latar kartu / seksi alternatif | `#EDEDED` | `#F6F6F4` | `surface` | `bg-surface` |
| `neutral.bg` | Latar halaman | `#FFFFFF` | `#FFFFFF` | `white` | `bg-white` |
| `neutral.footer` | Latar footer | `#000000` | `#0E0E0E` | `footer` | `bg-footer` |
| `state.success` | Stok tersedia, pembayaran sukses | — | `#16A34A` | `success` | `text-success` |
| `state.warning` | Stok kritis, status pending | — | `#D97706` | `warning` | `text-warning` |
| `state.danger` | Habis, error, batal | `#DC2626` | `#DC2626` | `danger` | `text-danger`, `border-danger` |
| `state.dangerSoft` | Latar panel error global | — | `#FEF2F2` | `red-50` | `bg-red-50` |
| `state.successStrong` | Teks `success` < 24px (badge, "Stok tersedia") | — | `#166534` | `success-strong` | `text-success-strong` |
| `state.warningStrong` | Teks `warning` < 24px (badge, "Stok kritis") | — | `#92400E` | `warning-strong` | `text-warning-strong` |
| `state.dangerStrong` | Teks `danger` di atas tint/latar berwarna | — | `#991B1B` | `danger-strong` | `text-danger-strong` |

**Aturan kontras** (dihitung ulang 20 Okt 2026 dengan metode WCAG 2.1 §1.4.3/§1.4.11; bukti & skrip: `docs/bukti-uiux-t_8cd61512.txt`): teks `ink` di atas `accent-500` = 10,11:1, putih di atas `brand-700` = 13,54:1. **Jangan menaruh teks putih di atas `accent-500`** (1,85:1; bentuk `bg-accent/10 text-accent` bahkan hanya 1,74:1) — CTA accent selalu `text-ink`. **Teks token state berukuran < 24px wajib varian `-strong`**: `success` hanya 3,30:1 dan `warning` 3,19:1 di atas putih (gagal ambang 4,5:1), sedangkan `success-strong` 7,13:1 dan `warning-strong` 7,09:1. `danger` (4,83:1 di atas putih) lolos, tetapi di atas latar berwarna turun ke 4,13:1 (`bg-danger/10`) / 4,41:1 (`red-50`) → di sana wajib `danger-strong` (7,60:1). Token dasar tetap dipakai untuk ikon/garis non-teks di atas latar putih (ambang 3:1: `success` 3,30:1, `warning` 3,19:1) dan untuk latar tint; ikon di dalam chip bertint `bg-{token}/10` turun ke 2,96:1/2,86:1 sehingga wajib `-strong` (6,40:1/6,36:1) — §11.4 T6. `slate-400` (2,56:1 di atas putih) **hanya** untuk elemen non-teks/`aria-hidden`/teks `disabled`; teks meta informatif (termasuk placeholder) minimal `slate-500` (4,76:1) — **tetapi hanya di atas putih**. Di atas latar non-putih `slate-500` **gagal** AA: `surface` 4,40:1, `brand-100` 3,93:1, chip `slate-200/60`@`surface` 4,08:1, `slate-200` 3,86:1. Karena itu teks meta informatif < 24px di atas latar non-putih **wajib `slate-600`** (#475569): 7,00:1 di atas `surface`, 6,26:1 di atas `brand-100`, 6,50:1 di atas chip, 6,15:1 di atas `slate-200` — semuanya lolos ambang 4,5:1. Kelas `text-slate-500` yang tetap sah: elemen non-teks/`aria-hidden` (ambang 3:1), teks `disabled`, `placeholder:` di dalam field putih, dan komentar kode. Daftar 29 titik terdampak + pemetaan per konteks: §11.4 **T7**; gate otomatis: `python docs/qa/sweep-meta-surface.py`.

**Kenapa ada token `line`:** `#E5E7EB` adalah nilai terukur di sumber, sedangkan `slate-200` Tailwind 3.4 = `#E2E8F0` (beda 3 satuan). Token `line` menyimpan nilai terukur apa adanya; `slate-200` hanya dipertahankan untuk kompatibilitas kode lama dan dimigrasikan ke `line` (§11 D3).

### 2.2 Tipografi

Sumber memakai dua keluarga: **Inter** (UI/body) dan **Koulen** (display). Kita ikuti pola dua keluarga yang sama dengan pengganti Koulen agar identitas berbeda.

Token tipografi **fluid**: satu kelas menyesuaikan 360px → 1300px via `clamp()`, tanpa varian `md:` untuk ukuran teks.

| Peran | Font | Mobile (360px) | Desktop (1300px) | Weight | Line-height | Letter-spacing | Kelas Tailwind |
|---|---|---|---|---|---|---|---|
| Display / Hero H1 | **Bebas Neue** | 40 px | 64 px | 400 | 1,0 | 0,02em | `font-display text-display` |
| H1 halaman | Bebas Neue | 32 px | 44 px | 400 | 1,05 | 0,02em | `font-display text-h1` |
| H2 seksi | Bebas Neue | 26 px | 32 px | 400 | 1,1 | 0,02em | `font-display text-h2` |
| H3 kartu / judul produk | **Inter** | 15 px | 16 px | 600 | 1,35 | 0 | `text-h3` |
| Body | Inter | 15 px | 16 px | 400 | 1,5 | 0 | `text-body` |
| Meta / body kecil | Inter | 13 px | 14 px | 400 | 1,45 | 0 | `text-meta` |
| Label tombol | Inter | 14 px | 15 px | 600 | 1 | 1px | `text-label` |
| Label kapital (badge) | Inter | 11 px | 12 px | 700 | 1 | 0,08em + `uppercase` | `text-badge uppercase` |

Nilai `clamp()` yang dipakai (identik dengan `tailwind.config.js`):

```
display : clamp(40px, 2.55vw + 30.8px, 64px)
h1      : clamp(32px, 1.28vw + 27.4px, 44px)
h2      : clamp(26px, 0.64vw + 23.7px, 32px)
h3      : clamp(15px, 0.11vw + 14.6px, 16px)
body    : clamp(15px, 0.11vw + 14.6px, 16px)
meta    : clamp(13px, 0.11vw + 12.6px, 14px)
label   : clamp(14px, 0.11vw + 13.6px, 15px)
badge   : clamp(11px, 0.11vw + 10.6px, 12px)
```

Catatan dari sumber: judul produk Koulen 16px `letter-spacing: .6px`; body 16/24 Inter; CTA 15px `letter-spacing: 1px`. Proporsi dipertahankan, weight tombol dinaikkan ke 600 agar lebih tegas.

**Pemuatan font:** `resources/views/app.blade.php:13-18` sudah memuat `bebas-neue:400|inter:400,500,600,700` dari Bunny Fonts (`display=swap`) — status K3: **terpasang**. Target akhir tetap self-host `public/fonts/` (woff2) agar bebas request pihak ketiga dan LCP stabil; `public/fonts/` belum ada. Lihat §11 D1.

### 2.3 Spacing, radius, shadow, container, ukuran

| Token | Nilai | Kelas Tailwind | Asal / catatan |
|---|---|---|---|
| `container.max` | **1300px** | `max-w-page` | lebar `page-width` sumber |
| `container.pad` | **50px** desktop / **16px** mobile | `container` (padding bawaan) | padding horizontal header & seksi |
| `radius.sm` | 6px | `rounded-sm` | badge, ghost button |
| `radius.md` | **8px** | `rounded-md` | gambar produk, input, kartu kecil |
| `radius.lg` | **9px** | `rounded-lg` | tombol utama (CTA sumber `9px`) |
| `radius.xl` | 12px | `rounded-xl` | kartu admin, modal, panel |
| `radius.full` | 999px | `rounded-full` | avatar, chip, swatch |
| `shadow.card` | `0 1px 2px rgba(0,0,0,.04)` | `shadow-card` | datar; sumber hampir tanpa shadow |
| `shadow.raised` | `0 8px 24px rgba(0,0,0,.08)` | `shadow-raised` | modal, dropdown, toast |
| `header.height` | **68px** desktop / **56px** mobile | `h-header` / `h-headerMobile` | `68.8px` terukur |
| `section.gap` | 64px desktop / 40px mobile | `py-section` / `py-sectionMobile` | jarak antar seksi |
| `grid.product` | 2 kolom <768, 3 kolom 768–1023, 4 kolom ≥1024 | `grid-cols-product` / `md:grid-cols-product-md` / `lg:grid-cols-product-lg` | `sizes` sumber: `(min-width:1300px) 292px` |
| `grid.gap` | 16px mobile / 24px desktop | `gap-gutter` / `lg:gap-gutterLg` | — |
| `button.height` | **47px** | `h-btn` | tinggi CTA sumber |
| `field.height` | 44px | `h-field` | input, select, stepper |
| `touch.min` | 44px | `min-h-touch min-w-touch` | target sentuh minimum |
| `sidebar.width` | 240px | `w-sidebar` | filter katalog & nav admin |
| `summary.width` | 320px | `w-summary` | ringkasan keranjang/checkout sticky |
| `thumb.size` | 72px | `w-thumb h-thumb` | thumbnail galeri detail |
| `cartThumb.size` | 80px | `w-cartThumb h-cartThumb` | gambar baris keranjang |
| `drawer.width` | 84% | `w-drawer` | drawer menu mobile |
| `qris.size` | 240px | `w-qr h-qr` | gambar QRIS |
| `hero.height` | 560px desktop / 480px mobile | `h-hero` / `h-heroMobile` | hero landing |
| `banner.height` | 320px | `h-banner` | banner promo |
| `map.height` | 320px | `h-map` | peta di `/kontak-kami` |
| `table.row` | 56px baris / 44px header | `h-tableRow` / `h-tableHead` | tabel admin |
| `z.layer` | header 40, drawer 50, modal 60, toast 70 | `z-header` `z-drawer` `z-modal` `z-toast` | lapisan baku, jangan angka liar |

### 2.4 Breakpoint & target uji

| Nama | Rentang | Prefix | Perilaku kunci |
|---|---|---|---|
| `xs` | 360–639 | `xs:` | 2 kolom produk, header 56px + drawer menu, filter jadi bottom-sheet |
| `sm` | 640–767 | `sm:` | 2 kolom produk |
| `md` | 768–1023 | `md:` | 3 kolom produk, sidebar filter inline |
| `lg` | 1024–1299 | `lg:` | 4 kolom produk, container padding 50px |
| `xl` | ≥1300 | `xl:` | container terkunci 1300px |

`xl` **di-override** dari default Tailwind (1280px) ke **1300px** agar cocok `container.max`; `xs` ditambahkan di 360px sebagai batas bawah uji. Empat viewport wajib diuji QA: **360, 768, 1024, 1300**.

### 2.5 Peta token → `tailwind.config.js`

Tabel ini dipakai QA untuk mencocokkan desain dengan config. Seluruh baris diverifikasi `node token-check.mjs` → `OK: semua 55 token ter-resolve` (3 token `-strong` ditambahkan 20 Okt 2026, kartu `t_8cd61512`).

| Grup | Key di `theme.extend` | Token tercakup | Contoh kelas |
|---|---|---|---|
| Warna | `colors.brand` | `DEFAULT`/`700` `600` `100` `soft` | `text-brand`, `bg-brand-100`, `text-brand-soft` |
| Warna | `colors.accent` | `DEFAULT`/`500` `600` | `bg-accent-500`, `hover:bg-accent-600` |
| Warna | `colors.sale` | `DEFAULT`/`500` | `text-sale-500` |
| Warna | `colors.ink` | `DEFAULT` `soft` | `text-ink`, `text-ink-soft` |
| Warna | `colors.surface` `footer` `line` | nilai tunggal | `bg-surface`, `bg-footer`, `border-line` |
| Warna | `colors.success` `warning` `danger` | nilai tunggal + `strong` (`success-strong` `#166534`, `warning-strong` `#92400E`, `danger-strong` `#991B1B`) | `text-success`, `text-danger-strong` |
| Warna | default `slate-400` `slate-500` `slate-600` `slate-200` `white` `red-50` | dipakai apa adanya (bawaan Tailwind, tidak menambah token config; `slate-600` = teks meta di atas latar non-putih, §2.1 v2.2) | `text-slate-600` |
| Font | `fontFamily.display` `fontFamily.sans` | Bebas Neue, Inter | `font-display`, `font-sans` |
| Teks | `fontSize` | `display` `h1` `h2` `h3` `body` `meta` `label` `badge` | `text-h2`, `text-meta` |
| Breakpoint | `screens` | `xs` 360, `xl` 1300 (sm/md/lg default dipertahankan) | `md:`, `xl:` |
| Layout | `spacing` | `header` `headerMobile` `section` `sectionMobile` `gutter` `gutterLg` `sidebar` `summary` `thumb` `cartThumb` `field` `touch` `topbar` | `py-section`, `gap-gutter` |
| Layout | `maxWidth` | `page` `form` `adminLogin` `modal` `modalLg` `qris` | `max-w-page` |
| Ukuran | `height` | `btn` `header` `headerMobile` `tableHead` `tableRow` `drawerItem` `qr` `hero` `heroMobile` `banner` `map` | `h-btn`, `h-tableRow` |
| Ukuran | `width` | `sidebar` `summary` `drawer` `qr` `thumb` | `w-summary` |
| Bentuk | `borderRadius` | `sm` `md` `lg` `xl` `full` | `rounded-lg` |
| Bayangan | `boxShadow` | `card` `raised` | `shadow-raised` |
| Grid | `gridTemplateColumns` | `product` `product-md` `product-lg` | `grid-cols-product` |
| Motion | `transitionDuration` | `hover` `toast` `accordion` `drawer` `carousel` | `duration-hover` |
| Motion | `transitionTimingFunction` | `smooth` | `ease-smooth` |
| Motion | `animation` + `keyframes` | `fade-up` `drawer-in` `modal-in` `pulse-slow` | `animate-pulse-slow` |
| Lapisan | `zIndex` | `header` `drawer` `modal` `toast` | `z-modal` |
| Container | `container` | `center: true`, padding `16px` / `lg:50px`; max-width ikut `screens` (xl 1300) | `container` |

### 2.6 Aturan pemakaian token

1. **Hex hanya boleh hidup di `tailwind.config.js`.** Di JSX/Blade/CSS komponen: pakai kelas token.
2. Pengecualian sah: API JavaScript yang menuntut string warna. Satu-satunya saat ini `resources/js/app.jsx:19` → `progress.color = '#F5B301'` (progress bar Inertia). Nilainya wajib sama dengan `accent-500`; kalau token berubah, baris ini ikut diubah.
3. Jangan membuat palet kedua untuk admin — panel admin memakai token yang sama (§7 butir 8).
4. Jangan memakai arbitrary value (`text-[15px]`, `tracking-[0.08em]`) bila token setara ada (`text-body`, `text-badge`). Pengecualian: padding `px-[30px]` pada CTA (§4.1) karena 30px bukan bagian skala spacing. Lihat §11 D4.

6. Teks meta informatif < 24px di atas latar **non-putih** memakai `text-slate-600` (aturan §2.1 v2.2, temuan §11.4 T7); di atas putih tetap `text-slate-500`.

5. Teks token state berukuran < 24px memakai varian `-strong` (`text-success-strong`, `text-warning-strong`, `text-danger-strong`); token dasar (`success`, `warning`, `danger`) hanya untuk ikon/garis non-teks dan latar tint — aturan lengkap di §2.1 + §4.21.

---

## 3. Layout Global

### 3.1 Header (68px, sticky)

Struktur sumber: logo kiri → menu tengah-kiri → ikon kanan (Search, Cart, Log in). Urutan dipertahankan, ditambah drawer menu mobile.

```
┌──────────────────────────────────────────────────────────────────┐
│ [LOGO 120×32]  Koleksi  Produk  Kontak Kami        ⌕  ♡  CART(2)  │  68px, bg white, border-b #E5E7EB
└──────────────────────────────────────────────────────────────────┘
```

- Akar: `sticky top-0 z-header h-header bg-white border-b border-line` (mobile `h-headerMobile`).
- Link menu: `text-meta text-ink px-3.5 py-3`, hover → `underline decoration-accent-500 decoration-2 underline-offset-4`.
- Badge keranjang: `size-[18px] rounded-full bg-accent-500 text-badge text-ink`.
- State `at-top` vs `scrolled`: saat scroll > 8px tambah `backdrop-blur-sm` + `border-b`.
- Mobile: hamburger kiri, logo tengah, cart kanan; drawer dari kiri `w-drawer`, item `h-drawerItem`.
- **Sumber konten:** `settings.header_nav` (JSON) — admin bisa ubah menu.

### 3.2 Footer (hitam, 4 kolom → 1 kolom mobile)

Latar `#0E0E0E`, teks `rgba(255,255,255,.75)`, padding `64px 0 32px`.

```
┌─────────────────────────────────────────────────────────────┐
│ TOKO KULOT        BANTUAN      PRODUK      HUBUNGI KAMI      │
│ (logo + tagline)  FAQ          Daster      telp 0812-xxxx    │
│                   Pembayaran   Kulot       email halo@...    │
│                   Lacak        Sale        alamat            │
│                   Kebijakan    Baru        [IG][TT][FB][WA]  │
│ ─────────────────────────────────────────────────────────── │
│ © 2026 Toko Kulot. Semua hak dilindungi.                     │
└─────────────────────────────────────────────────────────────┘
```

- Akar: `bg-footer text-white/75 pt-section pb-8`.
- Judul kolom: `text-badge uppercase text-white`.
- Link: `text-meta text-white/75 hover:text-white hover:underline`.
- **Sumber konten:** `settings.footer_about`, `footer_links`, `footer_social`, `contact_*`.

### 3.3 Pola seksi landing (urutan baku)

1. **Announcement bar** (opsional, 36px, `bg-brand-700`, teks putih `text-meta`) — dari `settings`.
2. **Hero carousel** — slide 16:9 desktop / 4:5 mobile, overlay `rgba(0,0,0,.35)`, H1 `text-display` putih, CTA `h-btn`; autoplay 6s, dot indicator, swipe.
3. **Trust strip** — 3–4 item ikon + teks (Gratis ongkir / Retur 7 hari / QRIS aman / CS responsif), latar `surface`.
4. **Kategori** — 3–4 kartu rasio 3:4, judul overlay bawah.
5. **Produk unggulan** — grid kartu produk, `SectionHeader` kiri + "Lihat semua" kanan.
6. **Banner promo** — full-width `h-banner`, teks kiri, gambar kanan.
7. **Kenapa beli di Toko Kulot** — 3 kolom ikon + paragraf.
8. **FAQ accordion** — 6 item, `border-b`, chevron.
9. **Newsletter / CTA akhir** — input email + tombol.

Konten seksi 2–9 berasal dari `settings.landing_sections` + `carousels` + `faqs`.

### 3.4 Shell admin

Lihat §5.10: sidebar 240px `bg-brand-700`, topbar 64px, konten `p-6` dalam kartu `rounded-xl border-line`.

---

## 4. Inventaris Komponen

Setiap komponen: struktur, ukuran, state. Wajib jadi komponen React reusable di `resources/js/Components/`. API props & checklist implementasi ada di `docs/komponen.md`.

### 4.0 Matriks state universal

Berlaku untuk **setiap** komponen yang mengambil data atau menerima aksi pengguna. QA menolak komponen yang tidak punya state di bawah.

| State | Pemicu | Tampilan wajib | Kelas/token acuan |
|---|---|---|---|
| `default` | data ada | konten normal | — |
| `loading` | request berjalan | skeleton mengikuti dimensi asli (bukan spinner penuh halaman), `aria-busy="true"` | `animate-pulse-slow` |
| `empty` | data kosong & bukan error | ilustrasi garis + teks penjelas + CTA keluar dari kondisi kosong | `text-slate-400`, §4.23 `EmptyState` |
| `error` | request gagal | pesan di dalam layout (bukan halaman putih) + tombol "Coba lagi" | `border-danger`, `text-danger`, §4.23 `ErrorState` |
| `disabled` | aksi tidak tersedia (stok 0, belum login) | opacity .45 + `cursor-not-allowed` + alasan terlihat | `disabled:opacity-45` |
| `focus-visible` | navigasi keyboard | ring 2px `brand` offset 2px | `ring-2 ring-brand ring-offset-2` |
| `hover` | pointer di atas elemen | sesuai komponen | `duration-hover` |

Aturan tambahan: `loading` yang melewati **10 detik** wajib berubah jadi `error` + tombol "Coba lagi" (mencegah layar menggantung); skeleton tidak boleh dipakai untuk menutupi error.

### 4.1 `Button`

| Varian | Latar | Teks | Border | Tinggi | Radius | Padding |
|---|---|---|---|---|---|---|
| `primary` | `accent-500` | `ink` 600 | none | 47px | 9px | `0 30px` |
| `secondary` | transparan | `ink` 600 | 1px `line` | 47px | 9px | `0 30px` |
| `ghost` | transparan | `brand` | none | 40px | 6px | `0 12px` |
| `danger` | `danger` | putih | none | 40px | 6px | `0 20px` |
| `link` | — | `brand` underline | — | auto | — | 0 |

Kelas dasar: `inline-flex items-center justify-center gap-2 h-btn px-[30px] rounded-lg text-label transition-colors duration-hover`.
State: `hover` (primary → `accent-600`; secondary → `bg-surface`), `active` (`translate-y-px`), `focus-visible` (ring 2px `brand` offset 2px), `disabled` (opacity .45 + `cursor-not-allowed`), `loading` (spinner 16px + label "Memproses…", **lebar dikunci** agar layout tidak melompat).

### 4.2 `ProductCard`

```
┌───────────────┐
│  gambar 1:1   │  radius 8px, object-cover, hover → gambar kedua (crossfade 300ms)
│ [SALE]        │  badge kiri-atas: text-badge uppercase, bg sale-500, teks putih, radius 6px
├───────────────┤
│ Tipe produk   │  text-meta text-slate-400 uppercase
│ Nama Produk   │  text-h3 text-ink, line-clamp-2, min-height 2 baris
│ Rp149.000     │  text-h3 font-bold · harga coret text-meta text-slate-400 line-through
│ ★★★★☆ (12)    │  StarRating sm (accent-500 / slate-300)
│ [Tambah]      │  ghost full-width, border-t border-line
└───────────────┘
```

State: `default`, `hover` (gambar zoom 1.03 + `shadow-raised`), `sold-out` (overlay putih 60% + label "Habis"), `loading` (skeleton rasio sama), `error-gambar` (blok `bg-surface` + ikon, §11 D2).

### 4.3 `StarRating`

- Ukuran `sm` 14px (kartu), `md` 20px (detail), `lg` 32px (form ulasan).
- Terisi `accent-500`, kosong `slate-300`.
- Read-only: `aria-label="Rating 4 dari 5"`. Interaktif: `<button>` per bintang, `aria-pressed`, hover preview, dukungan keyboard (arrow keys).

### 4.4 `QrisPanel`

```
┌────────────────────────────────┐
│ Selesaikan Pembayaran  ⏱ 14:32 │
│ ┌────────────────────────────┐ │
│ │      [QR CODE 240px]       │ │  putih, padding 16, radius 8, border line
│ └────────────────────────────┘ │
│ Total  Rp249.000               │  text-h1 font-bold
│ Kode   TK-20261020-0001        │  text-meta font-mono text-slate-600
│ [Cek Status]  [Salin Kode]     │
└────────────────────────────────┘
```

- Countdown `< 3 menit` → `text-danger` + `animate-pulse`.
- State: `pending` (QR tampil), `checking` (spinner di tombol, tombol `disabled`), `paid` (panel `success` + centang + CTA "Lihat Pesanan"), `expired` (panel abu + CTA "Buat Pesanan Baru"), `error` (gagal ambil status → tombol "Coba lagi", countdown tetap jalan).

### 4.5 `Input` / `Select` / `Textarea`

- Tinggi 44px (`h-field`), radius 8px, border 1px `line`, padding `0 14px`, `text-body`.
- Focus: border `brand` + ring 3px `brand/15`.
- Error: border `danger`, teks error `text-meta` di bawah, `aria-invalid`.
- Label di atas: `text-meta font-semibold mb-1.5`, wajib `htmlFor`. Helper `text-meta text-slate-500` (field selalu di latar putih).
- `Textarea`: min 120px, `resize-y`, tanpa `h-field`.

### 4.6 `Accordion` (FAQ)

- Baris 56px, judul `text-h3`, chevron 16px rotasi 180° saat buka, isi `text-meta text-ink-soft`, padding-bottom 20px, `border-b border-line`.
- Animasi tinggi 200ms `ease-out` (`duration-accordion`).
- State: `closed`, `open`, `disabled`.

### 4.7 `Table` (admin)

- Header: `text-badge uppercase text-slate-600`, bg `surface`, `h-tableHead`, sticky (§11.4 T7: teks 11–12px di atas `surface`; `slate-500` hanya 4,40:1).
- Baris: `h-tableRow`, `border-b border-line`, hover `bg-surface/60`.
- Aksi: `IconButton` 32×32 + tooltip.
- Pagination: tombol 36×36, aktif `bg-brand-700 text-white`.
- State: `loading` (skeleton 8 baris), `empty` (baris tunggal 200px + CTA), `error` (baris tunggal + "Coba lagi"), `sorted` (panah di header), `selected` (baris `bg-brand-100/60`).

### 4.8 `Toast`

- Kanan-bawah, 360px, radius 8px, `shadow-raised`, ikon status 20px, `text-meta`, auto-dismiss 4s, maks 3 tumpuk, `z-toast`.
- Varian `success` `error` `info` `warning` (garis kiri 3px warna status).

### 4.9 `Modal`

- Overlay `rgba(0,0,0,.5)`, panel putih radius 12px, `max-w-modal` (480px) / `max-w-modalLg` (720px), padding 24px, animasi scale .96→1 200ms (`animate-modal-in`). Fokus terperangkap, Esc menutup, klik overlay menutup (kecuali form kotor → konfirmasi).

### 4.10 `Skeleton`

- Blok `slate-200` `animate-pulse-slow` (1,5s), radius 8px, mengikuti dimensi komponen aslinya. Varian: `text`, `title`, `card`, `table-row`, `chart`.

### 4.11 `IconButton`

- Kotak 32/40/44px, `rounded-md`, ikon SVG 18–20px `stroke-width 1.5`, hover `bg-surface`.
- Wajib `aria-label`. State: `default` `hover` `active` `disabled` `busy`.

### 4.12 `Header` + `NavDrawer`

- Lihat §3.1. `NavDrawer`: `w-drawer` `h-screen` `bg-white` `z-drawer`, `animate-drawer-in`, overlay gelap, fokus terperangkap, Esc menutup, scroll body dikunci.
- State drawer: `closed` `open` `closing`.

### 4.13 `Breadcrumb`

- `text-meta text-slate-600` (§11.4 T7; dipakai di atas `surface` admin maupun putih), pemisah `/`, item terakhir `text-ink`, tinggi 48px, `aria-label="Breadcrumb"` + `aria-current="page"`. Mobile: maks 2 level + elipsis.

### 4.14 `SectionHeader`

- Kiri: judul `font-display text-h2 text-brand` + subteks `text-meta text-ink-soft`. Kanan: "Lihat semua" (`text-label text-brand underline underline-offset-4`). Jarak bawah 24px.

### 4.15 `HeroCarousel`

- Tinggi `h-hero` / `h-heroMobile`, gambar `object-cover` + overlay `rgba(0,0,0,.35)`, konten rata kiri-bawah (desktop) / tengah (mobile).
- Kontrol: dot 8px (aktif `bg-accent-500`, lebar 24px), panah desktop, swipe mobile, autoplay 6s berhenti saat hover/focus/tab tidak aktif.
- State: `loading` (skeleton setinggi hero), `empty`/`error` (fallback banner statis dari `settings`), `reduced-motion` (tanpa autoplay).

### 4.16 `CategoryCard`

- Rasio 3:4, `rounded-md`, overlay gradien bawah, judul `text-h3 text-white`, jumlah produk `text-badge text-white/75`.
- State: `hover` (zoom 1.03 + overlay lebih gelap), `loading`, `empty` (kategori tanpa produk disembunyikan dari landing).

### 4.17 `TrustStrip`

- 3–4 item, ikon 24px `text-brand`, teks `text-meta`, bg `surface`, padding 20px, `grid-cols-2 md:grid-cols-4`. Tanpa state interaktif.

### 4.18 `FilterPanel` + `BottomSheet`

- Desktop: sidebar `w-sidebar` sticky `top-header`, grup filter = judul `text-label uppercase` + checkbox/chip.
- Mobile: tombol sticky bawah "Filter (2)" → `BottomSheet` 80vh, `rounded-t-xl`, handle 4px, "Terapkan" full-width `h-btn`.
- State: `default` `expanded` `applied` (jumlah filter aktif di label) `loading` `disabled` (opsi tanpa produk).

### 4.19 `SearchInput` + `SortSelect`

- `SearchInput`: ikon kaca 18px kiri, `h-field`, `rounded-md`, tombol bersihkan saat terisi, debounce 300ms, `aria-label="Cari produk"`.
- `SortSelect`: native `<select>` bergaya `h-field` + chevron; opsi baku: Terbaru, Harga terendah, Harga tertinggi, Terlaris, Rating.
- State: `idle` `typing` `loading` `no-result`.

### 4.20 `QtyStepper` + `VariantChip` + `ColorSwatch`

- `QtyStepper`: 3 sel (tombol − 44×44, input 44px `text-center`, tombol + 44×44), border `line`, radius 8px, min 1, maks = stok, tombol `disabled` di batas.
- `VariantChip`: 44×40px, radius 6px, `text-meta`, aktif border 2px `ink`; tidak tersedia = `disabled` + garis diagonal + `aria-disabled`.
- `ColorSwatch`: lingkaran 28px, cincin aktif 2px `ink` offset 2px, `aria-label` nama warna.

### 4.21 `PriceBlock` + `StatusBadge` + `Countdown`

- `PriceBlock`: harga jual 24px 700 `ink` (kartu 15px 700), harga coret `text-meta text-slate-500 line-through` (bukan `slate-400` — hanya 2,56:1, §11.4 T2), diskon `text-badge bg-sale-500 text-white` (4,65:1, bentuk **solid**; tint `bg-sale-500/10 text-sale-500` hanya 4,00:1 dan **dilarang**), harga grosir di tabel terpisah.
- `StatusBadge`: pil `text-badge uppercase px-2.5 py-1 rounded-full`. Pemetaan status order: `pending` → `warning`; `dibayar` → `brand`; `diproses` → `brand`; `dikirim` → `brand`; `selesai` → `success`; `batal` → `danger`; status di luar daftar (mis. "Sudah dibaca", pesan masuk §5.12) → `neutral`. **Jangan** pakai warna di luar token.
- `Countdown`: `font-mono text-meta`, normal `text-ink-soft`, < 3 menit `text-danger` (4,83:1 di atas putih, lolos) + `animate-pulse`; berhenti di 00:00 lalu memicu state `expired`.

**Aturan tone badge (v2.1)** — menggantikan bentuk lama `bg-{token}/10 text-{token}`. Berlaku untuk `StatusBadge`,
`Badge`, dan pil status mana pun (termasuk halaman admin). Teks badge = `text-badge` (`clamp(11px, 0.11vw + 10.6px, 12px)`)
sehingga selalu < 24px → ambangnya **4,5:1** (teks normal), bukan 3:1. Rasio = nilai terendah dari 4 latar nyata:
putih, `surface`, `brand-100`, `slate-200/60` (chip `slate-200/60` di atas `surface`). Konvensi 4 latar yang sama dipakai §2.1 v2.2 untuk teks meta non-badge (kartu `t_14cad9e2`, temuan §11.4 T7). Verifikasi otomatis: `python docs/qa/kontras-badge.py` — keluar `0` bila seluruh angka tabel di bawah cocok dengan `tailwind.config.js` dan token `-strong` ada.

| tone | Kelas baku | Rasio terendah | Warna teks | Catatan |
|---|---|---|---|---|
| `brand` | `bg-brand/10 text-brand` | 9,35:1 | #1F2A5E | token dasar tidak berubah (sudah lolos) |
| `warning` | `bg-warning/10 text-warning-strong` | 5,34:1 | #92400E | sebelumnya `bg-warning/10 text-warning` = **2,86:1** (di atas tint-nya, latar putih) |
| `success` | `bg-success/10 text-success-strong` | 5,33:1 | #166534 | sebelumnya `bg-success/10 text-success` = **2,96:1** (di atas tint-nya, latar putih) |
| `danger` | `bg-danger/10 text-danger-strong` | 5,95:1 | #991B1B | sebelumnya `bg-danger/10 text-danger` = **4,13:1** (di atas tint-nya, latar putih) |
| `neutral` | `bg-slate-200/60 text-slate-600` | 6,17:1 | `#475569` | terendah di atas `brand-100`; sebelumnya `bg-slate-200/60 text-slate-500` = **4,20:1** (di atas putih, gagal) |
| `accent` (hanya `Badge` promo) | `bg-accent-500 text-ink` | 10,11:1 | `ink` | bentuk tint `bg-accent/10 text-accent` = **1,74:1** (putih 1,85:1) → **dilarang** |
| `sale` (badge diskon) | `bg-sale-500 text-white` | 4,65:1 | `white` | bentuk tint `bg-sale-500/10 text-sale-500` = **4,00:1** → **dilarang** |

Tone solid (penekanan tinggi) — pilih warna teks per token, jangan asal putih:

| token solid | + `text-white` | + `text-ink` |
|---|---|---|
| `brand-700` | 13,54:1 ✅ | 1,38:1 ❌ |
| `accent` | 1,85:1 ❌ | 10,11:1 ✅ |
| `accent-600` | 2,38:1 ❌ | 7,89:1 ✅ |
| `sale-500` | 4,65:1 ✅ | 4,03:1 ❌ |
| `success` | 3,30:1 ❌ | 5,68:1 ✅ |
| `warning` | 3,19:1 ❌ | 5,88:1 ✅ |
| `danger` | 4,83:1 ✅ | 3,88:1 ❌ |

Penerapan menyeluruh di komponen menyusul di kartu frontend (t_954abfe8); sampai itu selesai, kartu UIUX ini hanya menetapkan aturan.

**Teks meta non-badge (v2.2, kartu `t_14cad9e2`)** — kelas teks meta < 24px (`text-meta`/`text-label`/`text-badge`) menurut latar:

| Latar | `slate-500` #64748B | `slate-600` #475569 | Kelas baku |
|---|---|---|---|
| putih #FFFFFF | 4,76:1 ✅ | 7,58:1 ✅ | `slate-500` cukup |
| `surface` #F6F6F4 | 4,40:1 ❌ | 7,00:1 ✅ | **`slate-600`** |
| `brand-100` #E7E9F2 | 3,93:1 ❌ | 6,26:1 ✅ | **`slate-600`** |
| chip `slate-200/60` @`surface` | 4,08:1 ❌ | 6,50:1 ✅ | **`slate-600`** |
| `slate-200` #E2E8F0 | 3,86:1 ❌ | 6,15:1 ✅ | **`slate-600`** |

Gate: `python docs/qa/sweep-meta-surface.py` (keluar `0` bila 29 titik §11.4 T7 sudah `text-slate-600` dan tidak ada `text-slate-500` baru di atas latar non-putih).

### 4.22 `Pagination`

- Tombol 36×36, radius 6px, aktif `bg-brand-700 text-white`, nonaktif `text-slate-400`, elipsis untuk lompatan jauh. Mobile: Prev/Next + "1 / 3". `aria-current="page"`.

### 4.23 `EmptyState` + `ErrorState` + `InlineNotice`

- `EmptyState`: ilustrasi garis 96px (`text-slate-300`), judul `text-h3`, penjelas `text-meta text-slate-600` (§11.4 T7), CTA `secondary`.
- `ErrorState`: ikon peringatan `text-danger`, judul "Gagal memuat data", penyebab singkat `text-meta text-slate-600` (§11.4 T7), tombol "Coba lagi" + tautan bantuan. **Selalu di dalam layout** (header/footer tetap tampil).
- `InlineNotice`: `rounded-md p-4`, varian `info` (`bg-brand-100`), `success` (`bg-success/10`), `warning` (`bg-warning/10`), `error` (`bg-red-50` + border `danger`); ikon + `text-meta`, `role="status"`/`role="alert"`.

### 4.24 `ConfirmDialog`

- Turunan `Modal` `max-w-modal`: judul aksi, nama entitas eksplisit ("Hapus produk *Daster Kancing*?"), tombol `danger` + `secondary`, fokus awal di tombol batal. Wajib untuk semua aksi destruktif (PRD §9).

### 4.25 `Dropzone`

- `aspect-square border-2 border-dashed border-line rounded-md`, ikon unggah 24px, teks "Tarik gambar atau klik", pratinjau 1:1 + tombol hapus.
- State: `idle` `dragover` (border `brand`) `uploading` (progress bar) `error` (border `danger` + alasan tipe/ukuran).

### 4.26 `KpiCard` + `ChartCard`

- `KpiCard`: label `text-label uppercase text-slate-500` (kartu putih → tetap `slate-500`, §11.4 T7), angka 28px 700 `ink`, delta `text-meta` (naik `success`, turun `danger`), ikon 32px `bg-brand-100 text-brand`. Bisa diklik → halaman terkait (PRD §9).
- `ChartCard`: judul + rentang waktu, area/garis `brand-700` dengan isi `brand-100`, grid `line`, tooltip. State: `loading` (skeleton), `empty` ("Belum ada penjualan pada rentang ini"), `error`.

### 4.27 `TabNav`

- Item `px-4 h-11 text-label`, aktif `border-b-2 border-brand text-brand`, nonaktif `text-slate-600` (§11.4 T7: dirender di atas `surface`). Mobile: `overflow-x-auto` tanpa scrollbar, `role="tablist"`. Dipakai `/admin/pengaturan` (9 tab) dan detail pesanan.

### 4.28 `CartLine` + `OrderSummary`

- `CartLine`: grid `80px 1fr auto` (mobile bertumpuk), gambar `w-cartThumb`, nama `text-h3`, varian `text-meta text-slate-500` (kartu keranjang putih), `QtyStepper`, subtotal `text-h3`, hapus `IconButton` `text-danger`.
- `OrderSummary`: kartu `rounded-xl border-line p-6 w-summary` sticky; baris Subtotal / Ongkir / **Total** (20px 700), CTA `primary` full-width, catatan "Pembayaran QRIS" `text-meta text-slate-500` (ringkasan putih).
- State: `loading` (skeleton 3 baris), `empty` (tidak dirender bila keranjang kosong), `error` (baris + "Coba lagi").

### 4.29 `ReviewCard` + `RatingSummary` + `ReviewForm`

- `ReviewCard`: avatar 40px (`bg-brand-100` inisial), nama `text-h3`, `StarRating sm`, tanggal `text-meta text-slate-500` (kartu putih), komentar `text-body`; balasan toko = `bg-surface border-l-[3px] border-accent-500 p-3` + label "Balasan Toko Kulot".
- `RatingSummary`: rata-rata 32px 700 + `StarRating md` + jumlah ulasan; distribusi 5→1 (`bg-accent-500` di atas `bg-slate-200`, lebar proporsional).
- `ReviewForm`: bintang interaktif 32px, textarea 120px, tombol `primary`; state `idle` `submitting` `submitted` ("Terima kasih! Penilaianmu membantu pembeli lain." + bintang readonly) `error` `already-reviewed`.

### 4.30 `PageHeader` (admin)

- Breadcrumb + H1 `font-display text-h1` + slot aksi kanan ("Tambah X"). Jarak bawah 24px. Mobile: aksi turun ke baris sendiri, full-width.

### 4.31 `Footer`

- Lihat §3.2. Konten dari `settings`; kolom tanpa tautan disembunyikan (tidak dirender kosong).

---

## 5. Layout per Halaman

Kolom state = minimum; semua halaman juga wajib punya state global §4.0.

### 5.1 `/` Landing

Urutan seksi §3.3, hero 560px desktop / 480px mobile, jarak antar seksi 64/40px, maks 3 seksi produk penuh.
- Responsive: 360px → 1 kolom seksi, hero 480px, grid produk 2 kolom; 768px → 3 kolom; ≥1024px → 4 kolom.
- State: `loading` (skeleton per seksi), `empty` (seksi tanpa data disembunyikan), `error` (seksi gagal → `InlineNotice` + seksi dilewati, halaman tetap tampil).

### 5.2 `/produk` Katalog

```
Header
┌ Breadcrumb: Beranda / Produk ─────────────────────────────┐  48px, text-meta
│ Produk Daster & Kulot            [Urutkan ▾]  [⌕ cari]     │  H1 text-h1 + kontrol kanan
├──────────┬────────────────────────────────────────────────┤
│ FILTER   │ grid produk (4/3/2 kolom)                      │  sidebar 240px sticky, hilang <1024px
│ Kategori │  [kartu][kartu][kartu][kartu]                  │
│ Harga    │  [kartu][kartu][kartu][kartu]                  │
│ Ukuran   │  ‹ 1 2 3 ›                                     │  pagination tengah, 36px
│ [Reset]  │                                                │
└──────────┴────────────────────────────────────────────────┘
Footer
```

- Empty: ilustrasi garis + "Produk tidak ditemukan" + tombol "Reset filter".
- Loading: 8 skeleton kartu (bukan spinner tengah).
- Mobile: tombol sticky bawah "Filter (2)" membuka bottom-sheet 80vh.
- State: `loading` `empty` `error` `filtered` (chip filter aktif + reset) `sorted`.

### 5.3 `/produk/{slug}` Detail

```
Breadcrumb
┌────────────────────────┬──────────────────────────────┐
│ GALERI                 │ Tipe: Daster                 │  text-badge uppercase text-slate-400
│ ┌────────────────────┐ │ Nama Produk Panjang          │  font-display text-h1
│ │  utama 1:1         │ │ ★★★★☆ 4.8 · 24 ulasan        │  text-meta
│ └────────────────────┘ │ Rp149.000                    │  24px 700
│ [t][t][t][t] thumbs    │ ~~Rp199.000~~ -25%           │  text-meta + badge sale
│                        │                              │
│                        │ Ukuran: [S][M][L][XL][XXL]   │  VariantChip
│                        │ Warna:  [●][●][●]             │  ColorSwatch
│                        │ Stok: Tersedia (12)          │  text-meta text-success
│                        │ Jumlah: [−][ 2 ][+]          │  QtyStepper
│                        │ [  Tambah ke Keranjang  ]    │  primary full-width 47px
│                        │ [  Beli Sekarang         ]   │  secondary full-width
│                        │ ─ tabel harga grosir ─       │  qty ≥ 12 → Rp129.000
│                        │ ▸ Deskripsi                  │  Accordion
│                        │ ▸ Bahan & Perawatan          │
│                        │ ▸ Pengiriman & Retur         │
├────────────────────────┴──────────────────────────────┤
│ Ulasan Pembeli (24) — rata 4.8, distribusi 5→1         │
│ [avatar] Nama · ★★★★★ · tanggal                        │
│          komentar…                                     │
│          ↳ Balasan Toko Kulot: …                       │
├───────────────────────────────────────────────────────┤
│ Produk Serupa — 4 kartu                                │
└───────────────────────────────────────────────────────┘
```

- Kolom kiri 58% / kanan 42%, gap 48px; mobile ditumpuk (galeri dulu).
- Galeri: utama 1:1, thumbnail 72×72, klik ganti, zoom-on-hover 1.4×.
- Varian tidak tersedia → chip `disabled` + coret diagonal.
- Stok 0 → primary `disabled` "Stok Habis" + CTA "Hubungi Kami".
- State: `loading` (skeleton galeri + panel kanan), `error` (404/500 → `ErrorState` dalam layout), `sold-out`, `variant-unavailable`, `no-review` ("Belum ada ulasan" + ajakan membeli), `gallery-error` (placeholder `bg-surface`).

### 5.4 `/kontak-kami`

```
H1 Kontak Kami + subteks
┌─────────────────────┬──────────────────────────────┐
│ Form                │ Kartu info                   │
│ Nama*               │ alamat lengkap               │
│ Email*              │ 0812-xxxx (tautan WA)        │
│ No. WhatsApp        │ halo@tokokulot.id            │
│ Subjek*             │ Senin–Sabtu 08.00–17.00      │
│ Pesan*  (textarea)  │ ┌──────────────────────────┐ │
│ [Kirim Pesan]       │ │  peta embed h-map 320px  │ │
│                     │ └──────────────────────────┘ │
└─────────────────────┴──────────────────────────────┘
```

- Sukses: panel hijau "Pesan terkirim. Kami balas maks 1×24 jam."
- Validasi inline, error di bawah field.
- State: `idle` `validating` `submitting` (tombol `loading`, field `disabled`) `success` `error-server` (`InlineNotice` di atas form, isian tidak hilang) `map-error` (embed gagal → blok `bg-surface` + alamat teks).

### 5.5 `/login`, `/register`, `/forgot-password`, `/reset-password/{token}`

- Layout dua kolom: kiri panel brand (`bg-brand-700`, tinggi penuh, logo + tagline + 3 bullet manfaat), kanan form `max-w-form` (400px) terpusat vertikal.
- Mobile: panel brand jadi header 160px.
- `/register`: Nama, Email, No. WhatsApp, Password, Konfirmasi Password, checkbox syarat.
- `/forgot-password`: Email + "Kirim Tautan Reset" + tautan balik ke login.
- `/reset-password/{token}`: Email (readonly), Password baru, Konfirmasi, token tersembunyi; token invalid → `InlineNotice` error + tautan minta ulang.
- Error global di atas form: `bg-red-50` + border `danger`.
- State: `idle` `submitting` `error-field` `error-global` `success`.

### 5.6 `/keranjang`

- Desktop tabel item, mobile kartu bertumpuk.
- Kolom: produk (gambar `w-cartThumb` + nama + varian), harga, `QtyStepper`, subtotal, hapus (`IconButton` `text-danger`).
- Ringkasan kanan (`OrderSummary`, sticky 320px): Subtotal, Ongkir, **Total**, "Lanjut ke Pembayaran", catatan "Pembayaran QRIS".
- Empty: ikon keranjang + "Keranjang masih kosong" + "Mulai Belanja".
- State: `loading` (skeleton 3 baris), `empty`, `error`, `updating` (baris `aria-busy`, total dihitung optimistis), `stock-changed` (`InlineNotice` warning + qty disesuaikan), `guest` (CTA checkout → arahkan login, keranjang tetap tampil).

### 5.7 `/checkout`

- Dua kolom: form 60% + `OrderSummary` sticky 40%.
- Form: Data Penerima (nama, telepon, email), Alamat (alamat, kota, kode pos), Catatan, metode pembayaran (kartu QRIS terpilih, pilihan lain `disabled`).
- State: `idle` `submitting` (cegah double submit) `error-field` `error-payment` (`InlineNotice` + ulangi, order tidak dobel) `cart-empty` (redirect ke keranjang + notice).

### 5.8 `/checkout/{order}/bayar` & `/selesai`

- Bayar: `QrisPanel` terpusat (`max-w-qris` 480px), instruksi 3 langkah bernomor, "Cek Status" (polling 5s).
- Selesai: centang hijau 64px, "Pesanan diterima", kode order, ringkasan, lalu kartu penilaian per produk:

```
┌────────────────────────────────────────┐
│ [gambar 64] Nama Produk · Varian        │
│ Seberapa puas kamu?                     │
│   ★  ★  ★  ★  ★   (32px, interaktif)   │
│ ┌────────────────────────────────────┐ │
│ │ Tulis komentarmu…          (120px) │ │
│ └────────────────────────────────────┘ │
│ [Kirim Penilaian]                       │
└────────────────────────────────────────┘
```

- Setelah terkirim: kartu jadi "Terima kasih! Penilaianmu membantu pembeli lain." + bintang readonly.
- State (bayar): `pending` `checking` `paid` `expired` `error`. State (selesai): `paid` `review-empty` `review-submitting` `review-submitted` `review-error`.

### 5.9 Admin — `/admin/login`

- Latar `surface`, kartu `max-w-adminLogin` (420px) putih radius 12px `shadow-raised`, logo, "Masuk Panel Admin", email + password, tombol primary full-width, catatan "Khusus pengelola".
- State: `idle` `submitting` `error` (kredensial salah / 429 rate-limited → pesan tunggu) `locked`.

### 5.10 Admin — shell

```
┌──────────┬──────────────────────────────────────────┐
│ SIDEBAR  │ TOPBAR  ⌕ cari   [Avatar ▾]              │  h-topbar 64px
│ 240px    ├──────────────────────────────────────────┤
│ Logo     │ H1 halaman + breadcrumb                  │
│ ──────── │ ┌──────────────────────────────────────┐ │
│ Dashboard│ │ konten                               │ │
│ Produk   │ │                                      │ │
│ Kategori │ └──────────────────────────────────────┘ │
│ Stok     │                                          │
│ Pesanan  │                                          │
│ Pesan    │                                          │
│ Penilaian│                                          │
│ Pengaturan                                          │
│ Akun     │                                          │
└──────────┴──────────────────────────────────────────┘
```

- Sidebar `bg-brand-700`, item aktif `bg-white/10 border-l-[3px] border-accent-500`, ikon 18px, label `text-meta`, tinggi item 44px.
- Mobile: sidebar jadi drawer (`z-drawer`), topbar menampilkan hamburger.
- Konten: kartu putih `rounded-xl border border-line p-6`.
- State: `default` `collapsed` (opsional desktop) `drawer-open` (mobile).
- Catatan deviasi **D8**: kolom `⌕ cari` pada sketsa topbar di atas **tidak dibangun** — jalur pencarian admin adalah toolbar per halaman daftar (§5.12). Keputusan techlead kartu `t_b5de72e3`, rincian bukti di §11.3 D8; tidak ada state "cari" di §5.10.

### 5.11 Admin — `/admin` Dashboard

```
┌ KPI ────────────────────────────────────────────────────┐
│ [Omzet hari ini] [Omzet 30 hari] [Pesanan baru] [AOV]   │  4 × KpiCard
└─────────────────────────────────────────────────────────┘
┌ Grafik penjualan 14 hari ───────────────┬ Stok kritis ──┐
│ line/area                               │ 5 baris       │
└─────────────────────────────────────────┴───────────────┘
┌ Pesanan terbaru (tabel 5) ──────────────┬ Ulasan (5) ───┐
└─────────────────────────────────────────┴───────────────┘
```

- Status badge memakai §4.21 `StatusBadge` (pemetaan baku, jangan bikin varian baru).
- State: `loading` (skeleton KPI + grafik), `empty` ("Belum ada penjualan" + CTA tambah produk), `error` per blok (satu blok gagal tidak menjatuhkan halaman), `stale` (data > 5 menit → "Diperbarui 5 menit lalu").

### 5.12 Admin — halaman CRUD

Pola baku: `PageHeader` → toolbar (search + filter) → `Table` → `Pagination`. Form tambah/edit dalam `Modal` besar (`max-w-modalLg` 720px), kecuali produk (butuh galeri + varian) memakai halaman terpisah. Hapus → `ConfirmDialog` dengan nama entitas.

- Sub-halaman & isi wajib mengikuti PRD §9: `/admin/produk`, `/admin/kategori`, `/admin/stok`, `/admin/stok/riwayat`, `/admin/pesanan`, `/admin/pesanan/{order}`, `/admin/pesan-masuk`, `/admin/penilaian`, `/admin/pengaturan`, `/admin/akun`.
- Form produk: 2 kolom (kiri data utama + varian, kanan status/kategori/galeri), `Dropzone` galeri (maks 6, urut bisa digeser), tabel varian (ukuran × warna × stok × harga).
- Detail pesanan: kartu pembeli, kartu pengiriman, tabel item, `QrisPanel` readonly / bukti bayar, `TabNav` (Ringkasan · Riwayat status · Catatan), ubah status via `ConfirmDialog` (transisi tidak sah → tombol `disabled` + alasan).
- Isian nomor resi pada kartu **"Pengiriman"** halaman detail pesanan (`InfoResi` di dalam `KartuBagian`, PRD A15; deviasi **D12** §11.3): `Field` + `Input` §4.5 — label `Nomor resi`, nilai awal `pesanan.tracking_number`, maks 60, bantuan `Isi nomor resi dari ekspedisi setelah paket dikirim. Kosongkan untuk menghapus.` (`text-meta text-slate-500` di latar putih kartu), galat server `errors.tracking_number` di bawah input; tombol `Simpan resi` §4.1 `primary` (`disabled` + label "Memproses…" selama proses); baris status `text-meta text-slate-500` — `Belum ada nomor resi.` bila kosong, `Tersimpan: <nomor>` bila terisi; sukses = `flash.success` server. Tanpa komponen, token, atau warna baru; state mengikuti `saving` / `validation-error` baku halaman ini.
- Detail pesan: isi pesan, textarea balasan, "Tandai dibaca".
- Penilaian: tabel + aksi balas (modal) + toggle visibilitas.
- Akun: tabel + modal tambah/ubah; hapus diri sendiri `disabled` dengan alasan (PRD §9).
- State per halaman: `loading` `empty` `error` `saving` `deleting` `validation-error` (error per field, modal tetap terbuka) `success` (toast + baris diperbarui tanpa reload penuh).

### 5.13 Admin — `/admin/pengaturan`

Tab (`TabNav`): Umum · Landing · Carousel · FAQ · Header · Footer · Kontak · SEO · Pembayaran. Setiap tab = form sendiri + "Simpan" sticky bawah. Unggah gambar: `Dropzone` 1:1 + preview.
- State: `loading` `dirty` (tombol simpan aktif + peringatan saat pindah tab) `saving` `saved` (toast) `error` `upload-error`.

### 5.14 Halaman error (404 / 403 / 419 / 500)

- Layout penuh: header + footer tetap tampil (kecuali 500 yang gagal render layout → versi minimal).
- Komposisi: kode status `font-display text-display text-brand`, judul `text-h2`, penjelasan `text-body text-ink-soft`, dua CTA: "Ke Beranda" (`primary`) dan "Hubungi Kami" (`secondary`).
- 419: "Sesi kamu berakhir. Muat ulang halaman lalu coba lagi." + tombol muat ulang.
- 403: tanpa membocorkan detail otorisasi. 500: pesan generik + kode referensi singkat, tanpa stack trace.

### 5.15 Loading global (transisi Inertia)

- Progress bar atas `accent-500` (dari `app.jsx`), tidak menutupi konten. Data memakai skeleton per halaman, bukan spinner layar penuh.

### 5.16 `/checkout/{order}/status` (JSON)

- Tanpa UI. Kontrak respons dipakai `QrisPanel`: `{ status, paid_at, expires_at }`. Dicatat agar QA tidak mencari halaman.

### 5.17 Rute tanpa UI khusus

- `POST /midtrans/notification` — webhook.
- `POST /logout`, `PATCH/DELETE /keranjang/{item}`, `POST /checkout/{order}/ulasan` — aksi, bukan halaman.

### 5.18 Matriks cakupan rute → halaman desain

| Rute (PRD §5) | Bagian desain |
|---|---|
| `/` | §5.1 |
| `/produk`, `/produk/{slug}` | §5.2, §5.3 |
| `/kontak-kami` (GET/POST) | §5.4 |
| `/keranjang` (GET/POST/PATCH/DELETE) | §5.6 |
| `/register`, `/login`, `/forgot-password`, `/reset-password/{token}`, `/logout` | §5.5 |
| `/checkout` (GET/POST), `/checkout/{order}/bayar`, `/selesai`, `/ulasan` | §5.7, §5.8 |
| `/checkout/{order}/status` | §5.16 |
| `/midtrans/notification` | §5.17 |
| `/admin/login` | §5.9 |
| `/admin` + seluruh `/admin/*` | §5.10, §5.11, §5.12, §5.13 |
| Error 403/404/419/500 | §5.14 |

---

## 6. Motion

| Elemen | Durasi | Easing | Kelas | Catatan |
|---|---|---|---|---|
| Hover kartu produk | 300ms | `ease-out` | `duration-hover` | scale 1.03 gambar, shadow naik |
| Buka accordion | 200ms | `ease-out` | `duration-accordion` | height + chevron rotate |
| Modal | 200ms | `cubic-bezier(.2,.8,.2,1)` | `animate-modal-in` | opacity + scale |
| Toast masuk | 180ms | `ease-out` | `animate-fade-up` | translateY 8px → 0 |
| Drawer | 250ms | `ease-in-out` | `animate-drawer-in` | translateX |
| Carousel slide | 400ms | `ease-in-out` | `duration-carousel` | — |
| Skeleton | 1,5s | `ease-in-out` | `animate-pulse-slow` | pulse loop |

`prefers-reduced-motion: reduce` → semua durasi 0,01ms (sudah ada di `app.css` §base). Carousel berhenti autoplay untuk pengguna reduced-motion.

---

## 7. Aturan Implementasi

1. Token warna/spacing **wajib** masuk `tailwind.config.js` (`theme.extend`), bukan hex di JSX. Hex di luar config hanya untuk API JS yang menuntut string warna (§2.6 butir 2).
2. Semua ikon: SVG inline 20px (`stroke-width: 1.5`), atau `lucide-react` bila ditambahkan.
3. Gambar produk: rasio 1:1, `object-cover`, `loading="lazy"` kecuali hero (`eager` + `fetchpriority="high"`), wajib `alt`.
4. Tidak ada `Lorem ipsum` — pakai copy Indonesia nyata atau data seeder.
5. Setiap halaman wajib punya state **loading**, **empty**, **error** (§4.0). Error tampil **di dalam layout**, bukan halaman putih.
6. Fokus keyboard terlihat di semua elemen interaktif (ring 2px `brand`, offset 2px — sudah global di `app.css`).
7. Mobile: target sentuh ≥ 44×44px, tidak ada horizontal scroll pada 360px.
8. Admin memakai token yang sama — jangan bikin sistem warna kedua.
9. Komponen dipakai ulang dari `resources/js/Components/` — jangan menyalin kelas yang sama di dua halaman. API props: `docs/komponen.md`.
10. Nilai token di JS hanya lewat kelas; bila butuh angka di JS (mis. lebar drawer untuk animasi), ambil dari konstanta yang sama dengan config, jangan duplikasi.

---

## 8. Selisih dengan Sumber (disengaja)

| Aspek | Erigo | Toko Kulot | Alasan |
|---|---|---|---|
| Font display | Koulen | Bebas Neue | identitas berbeda, keduanya condensed |
| Warna brand | Navy `#151F6D` | Navy `#1F2A5E` | identitas sendiri, kontras serupa |
| CTA | `#FFBB00` | `#F5B301` | sedikit lebih gelap agar teks `ink` lolos AAA |
| Metode bayar | multi (VA, kartu, e-wallet) | **QRIS saja** | batasan PRD §8 |
| Blog | ada | tidak ada | di luar cakupan tahap ini |
| Loyalty/reward | ada | tidak ada | backlog |
| Struktur tema | Shopify Liquid | React + Inertia | stack PRD §4 |
| Breakpoint atas | 1280px | **1300px** | mengikuti `container.max` |

---

## 9. Checklist Kesesuaian (dipakai QA)

Status per 20 Okt 2026 (K3). `✅` = terpasang & terverifikasi dengan bukti; `⏳` = menunggu implementasi K10 (belum boleh dianggap selesai QA).

| # | Item | Status | Bukti / cara verifikasi |
|---|---|---|---|
| 1 | Token warna config = §2.1 | ✅ | `node token-check.mjs` → `OK: semua 55 token ter-resolve` |
| 2 | Container 1300px, padding 50px desktop / 16px mobile | ✅ config | `theme.container.padding` = `{"DEFAULT":"16px","lg":"50px"}`, `screens.xl` = `1300px` |
| 3 | Header 68px sticky + border saat scroll | ⏳ | token `h-header`/`h-headerMobile` siap; `Components/Header.jsx` belum ada |
| 4 | Grid produk 4/3/2 kolom | ✅ token | `grid-cols-product` (2) / `product-md` (3) / `product-lg` (4) |
| 5 | Kartu produk: gambar 1:1, radius 8px, judul clamp-2, harga 700 | ⏳ sebagian | pola kartu terpasang di `Home.jsx:55-79` (card + `aspect-square bg-surface rounded-md` + `text-h3` + harga bold); komponen `ProductCard` reusable belum ada |
| 6 | CTA tinggi 47px, radius 9px, `accent-500` | ✅ | `.btn` di `app.css:34-38` + `h-btn`/`rounded-lg`/`bg-accent-500` |
| 7 | Footer hitam 4 kolom, padding 64/32 | ⏳ | `bg-footer` + `pt-section` siap; `Footer.jsx` belum ada |
| 8 | Form punya label, error inline, `aria-invalid` | ⏳ | `.field`/`.field-error`/`.label` ada di `app.css:49-59`; `field-error` kini memakai token `danger` (`app.css:55`) |
| 9 | Semua state (loading/empty/error/disabled) ada | ⏳ sebagian | matriks §4.0; `Home.jsx` sudah pisah `loading` (skeleton) vs `empty` (blok "Belum ada produk", `Home.jsx:82-95`); `error` belum (menunggu K10) |
| 10 | Tanpa horizontal scroll di 360px | ⏳ | uji viewport 360 setelah K10 |
| 11 | Kontras teks ≥ 4,5:1 | ✅ pasangan inti + badge | `ink`/`accent-500` = 10,11:1; putih/`brand-700` = 13,54:1; aturan tone badge §4.21 v2.1 semua tone ≥ 5,33:1 (kartu `t_8cd61512`); temuan sisa non-badge §11.4 (T1–T6); v2.2: aturan teks meta < 24px di atas latar non-putih = `slate-600` (§2.1, temuan T7) |
| 12 | Tidak ada hex di JSX (kecuali §2.6 butir 2) | ✅ | `grep -rnoE '#[0-9a-fA-F]{3,8}' resources/` → 1 hasil: `resources/js/app.jsx:19` |
| 13 | Build hijau setelah perubahan token | ✅ | `npm run build` → `636 modules transformed`, `✓ built in 3.84s`; CSS hasil build memuat `Bebas Neue` + `clamp(40px,2.55vw + 30.8px,64px)` |
| 14 | Tipografi fluid 360→1300 tanpa varian `md:` | ✅ | 8 token `fontSize.*` memakai `clamp()` |
| 15 | Breakpoint `xs` 360 & `xl` 1300 aktif | ✅ | `screens.xs`/`screens.xl` terverifikasi script |
| 16 | `Home.jsx` bebas arbitrary value & memakai kelas token | ✅ | `Home.jsx:16` `text-badge`, `:19` `text-display`, `:49` `grid-cols-product`/`-md`/`-lg` + `gap-gutter`/`gutterLg`, `:85` `border-line` |
| 17 | `app.css` memakai token, bukan hex/palet liar | ✅ | `border-line` (`:43,50,61`), `text-body` (`:50`), `text-meta` (`:58`), `danger` (`:55`), `duration-hover` (`:36,47`), `animate-pulse-slow` (`:64`) |
| 18 | Font ter-load di dokumen | ✅ | `app.blade.php:13-18` → `<link rel="stylesheet">` Bunny Fonts (`bebas-neue`, `inter`, `display=swap`) |
| 20 | Teks meta < 24px di atas latar non-putih memakai `text-slate-600` | ⏳ menunggu kartu frontend lanjutan | aturan §2.1 v2.2 + §11.4 T7; gate `python docs/qa/sweep-meta-surface.py` — kondisi 20 Okt 2026: **0/29 titik** diterapkan (29 belum); daftar berkas:baris + skrip penerapan di `docs/bukti-uiux-t_14cad9e2.txt` |
| 19 | Tone badge §4.21 lolos AA (≥ 4,5:1) | ✅ aturan + token | `docs/bukti-uiux-t_8cd61512.txt` + tabel §4.21; `node token-check.mjs` 55 token; `npm run build` `✓ built in 6.02s`; kelas `-strong` terverifikasi di CSS Tailwind |

---

## 10. Traceability PRD ↔ Desain

| Kebutuhan PRD | Bagian desain yang menjawab |
|---|---|
| §5.1 rute publik (landing, katalog, detail, kontak, keranjang, auth, checkout, bayar, selesai) | §5.1–§5.8, §5.18 |
| §5.2 rute admin (login, dashboard, produk, kategori, stok, pesanan, pesan, penilaian, pengaturan, akun) | §5.9–§5.13, §5.18 |
| §8 QRIS Midtrans (QR, countdown 15 menit, cek status) | §4.4, §5.7, §5.8, §5.16 |
| §9 isi wajib tiap halaman admin | §5.11, §5.12, §5.13 |
| §9 aksi destruktif memakai konfirmasi modal | §4.24 `ConfirmDialog` |
| §9 server-side pagination & pencarian | §4.7 `Table`, §4.19, §4.22 |
| §10 desain & slicing | seluruh dokumen ini + `docs/komponen.md` |
| §11 NFR (responsif, aksesibilitas, performa) | §2.4, §4.0, §6, §7 butir 3/6/7 |
| §7.3 penilaian bintang | §4.3, §4.29, §5.8 |
| §7.4 pesan masuk | §5.4, §5.12 |
| §6 skema (status order, varian, stok) | §4.20, §4.21, §5.12 |

---

## 11. Catatan REA, drift & batas verifikasi

### 11.1 Yang benar-benar diverifikasi (20 Okt 2026)

| Klaim | Cara verifikasi | Hasil |
|---|---|---|
| 52 token ter-resolve dari config → **55 token** | `node token-check.mjs` (`resolveConfig` Tailwind), dijalankan ulang setelah token `-strong` | `OK: semua 55 token ter-resolve` |
| Tipografi fluid | nilai `fontSize.display`/`h1` dari config ter-resolve | `clamp(40px, 2.55vw + 30.8px, 64px)` / `clamp(32px, 1.28vw + 27.4px, 44px)` |
| Container & breakpoint | `theme.container.padding`, `theme.screens.xl` | `{"DEFAULT":"16px","lg":"50px"}`, `1300px` |
| Build tidak rusak | `npm run build` | `636 modules transformed`, `✓ built in 3.84s` |
| Token benar-benar sampai ke CSS hasil build | `grep -o` pada `public/build/assets/app-*.css` | `Bebas Neue` ada; `.text-label{font-size:clamp(14px,.11vw + 13.6px,15px);line-height:1;letter-spacing:1px;font-weight:600}` |
| Skeleton memakai durasi 1,5s | CSS hasil build | `.skeleton{animation:pulse 1.5s cubic-bezier(.4,0,.6,1) infinite;border-radius:8px;background-color:rgb(226 232 240 …)}` |
| Tidak ada hex liar | `grep -rnoE '#[0-9a-fA-F]{3,8}' resources/` | 1 hasil: `resources/js/app.jsx:19` |
| Kelas tone badge baru benar-benar menghasilkan utility | Tailwind CLI dengan `--content` berkas probe (`probe-badge.html`) | `.text-warning-strong{color:rgb(146 64 14…)}`, `.text-success-strong{color:rgb(22 101 52…)}`, `.text-danger-strong{color:rgb(153 27 27…)}`, `.text-slate-600{color:rgb(71 85 105…)}` |
| Kontras seluruh tone badge §4.21 v2.1 |
| Verifikasi dokumen ↔ config | `python docs/qa/kontras-badge.py` | `EXIT 0` — 7 tone badge + 7 tone solid cocok, token `-strong` ada (nilai dibaca dari `tailwind.config.js`) |
| Kontras seluruh tone badge §4.21 v2.1 | skrip WCAG mandiri (tanpa dependensi) atas 4 latar nyata | semua tone ≥ 5,33:1 (terendah: 5,33:1) |
| Build setelah token `-strong` | `npm run build` | `✓ built in 6.02s` |

### 11.2 Batas: yang **tidak** diverifikasi ulang

- Capture Erigo **tidak diulang** pada sesi K3. Nilai sumber (`#E5E7EB`, `68.8px`, `border-radius: 9px`, 1888× pemakaian border) berasal dari capture v1.0 tanggal 20 Okt 2026 dan dipakai apa adanya. Rincian pemisahan observasi vs keputusan internal ada di `docs/design-catatan-rea.md`.
- Kontras: paket inti + seluruh tone badge §4.21 v2.1 dihitung ulang 20 Okt 2026 (kartu `t_8cd61512`) atas 4 latar uji (putih, `surface`, `brand-100`, `slate-200/60`). Kombinasi di luar keempat latar itu (mis. badge di atas foto/gambar) dan kontras komponen non-badge **belum** diuji tuntas — daftar temuannya di §11.4.
- Tampilan nyata tiap halaman belum bisa diuji menyeluruh: `resources/js/Pages/Public/Home.jsx` sudah memakai kelas token (hero + grid produk), tetapi `Components/` dan `Layouts/` masih kosong (`.gitkeep`) dan `Header`/`Footer` belum ada — pengujian visual per halaman menyusul K10.

### 11.3 Drift yang ditemukan saat K3

| # | Drift | Bukti | Status |
|---|---|---|---|
| D1 | Font tidak dimuat: `app.blade.php` hanya `preconnect` ke `fonts.bunny.net` tanpa `<link rel="stylesheet">`, dan `public/fonts/` tidak ada → `font-display` jatuh ke `Impact`, Inter ke font sistem | `resources/views/app.blade.php:12-13` (sebelum K3); `ls public` tanpa `fonts/` | **Sebagian diperbaiki**: `<link rel="stylesheet">` Bunny Fonts ditambahkan (`app.blade.php:13-18`). Self-host woff2 tetap terbuka — perlu aset berlisensi, tercatat di `docs/pertanyaan-pemilik.md` |
| D2 | Placeholder gambar produk belum jadi komponen (blok `bg-surface` ad-hoc) | `resources/js/Pages/Public/Home.jsx:63` | Ditetapkan di §4.2 (`error-gambar` → blok `bg-surface` + ikon); ekstraksi komponen di K10 |
| D3 | `app.css` memakai `border-slate-200` (`#E2E8F0`), bukan `border-line` (`#E5E7EB`) | `app.css:43,50,61` sebelum K3 | **Diperbaiki**: ketiganya kini `border-line` |
| D4 | Arbitrary value padahal token ada: `text-[12px]`, `tracking-[0.08em]`, `text-[15px]` | `Home.jsx:10,16,34`; `app.css:36,50,58` sebelum K3 | **Diperbaiki**: `text-badge`, `text-body`, `text-label`, `text-meta`; sisa arbitrary hanya `px-[30px]` (disengaja, §2.6 butir 4) dan `ring-[3px]` |
| D5 | `red-600` untuk error field, padahal `danger` punya nilai sama | `app.css:55` sebelum K3 | **Diperbaiki**: `border-danger focus:border-danger focus:ring-danger/15` |
| D6 | `transitionDuration.skeleton` tidak berpengaruh pada `animate-pulse` (durasi animasi ≠ transisi) | config K3 iterasi 1 | **Diperbaiki**: token `animation.pulse-slow` (1,5s) menggantikannya |
| D7 | `ink` sebelumnya string tunggal → `ink-soft` mustahil; `neutral.border` tidak punya token | config sebelum K3 | **Diperbaiki**: `ink.DEFAULT` + `ink.soft`, token `line` |
| D8 | Kolom `⌕ cari` pada sketsa topbar shell admin (§5.10) **tidak dibangun**; jalur pencarian admin = toolbar per halaman daftar (§5.12) | PRD §5.2 = daftar tetap rute admin tanpa endpoint pencarian (`docs/PRD.md:139-170`); `grep -in "search"` dan `grep -in "cari"` pada `resources/js/Layouts/AdminLayout.jsx:168-221` → 0 hasil keduanya (diverifikasi ulang 20 Okt 2026); §5.10 hanya punya state `default`/`collapsed`/`drawer-open` | **Diterima sebagai deviasi, keputusan `t_b5de72e3`, dicatat di `docs/pertanyaan-pemilik.md` §4 T3** |
| D9 | Penanda **"Mode uji"** pada halaman bayar (§5.8, di dalam `QrisPanel` §4.4) dan status mode efektif pada tab **Pembayaran** `/admin/pengaturan` (§5.13) **belum ada di spesifikasi desain** — elemen baru, bukan penyimpangan dari elemen lama | `docs/review.md` F-2 akar 1: mode uji aktif secara bawaan (`config/midtrans.php:26`; `.env.example:74`) sehingga QR tampil tetapi tidak mungkin dibayar, dan UI tidak pernah menunjukkan mode ini (`grep -n "fake" resources/js/Pages/Public/CheckoutPay.jsx resources/js/Components/QrisPanel.jsx` → 0 hasil, 21 Okt 2026), padahal server sudah mengirim `pembayaran.fake` dan `midtrans.fake` (`app/Http/Controllers/CheckoutController.php:248,275`; kontrak §7.7 `docs/kontrak-props.md:423-429`) | **Diterima sebagai deviasi — asal temuan kartu `t_15531332` (butir 2), pengerjaan tampilan kartu `t_e60e7733` (F2) memakai prop status dari kartu `t_9f4b6aee` (B1); keputusan pemilik `docs/pertanyaan-pemilik.md` §5 P3.** Alasan: pemilik tidak bisa membedakan QR uji dari QR nyata, jadi penanda wajib ada agar halaman tidak menyesatkan. Batas: bentuk penanda memakai komponen yang sudah ada — `InlineNotice` varian `warning`/`error` (§4.23) dan/atau `StatusBadge` tone `warning` (§4.21); tanpa token, kelas, atau warna baru; saat `fake=false` penanda tidak dirender |
| D10 | Masa berlaku QRIS **5 menit**, menggantikan 15 menit (sketsa §4.4 menulis `⏱ 14:32`; §10 baris "§8 QRIS Midtrans (QR, countdown 15 menit, cek status)" pada baris 816) | Keputusan pemilik 21 Okt 2026 (`docs/pertanyaan-pemilik.md` §5 P1), rangkuman `docs/review.md` F-3: `config/midtrans.php:29` masih 15 menit hard-code, sedangkan PRD §8 butir 6 (`docs/PRD.md:219`) + A17 (`docs/PRD.md:377`) menulis 15 menit | **Diterima sebagai deviasi / amendemen pemilik — pengerjaan kartu `t_e35050e8` (B2, `MIDTRANS_EXPIRY_MINUTES`) dan `t_e60e7733` (F2, hitung mundur ikut `pembayaran.expires_at`); PRD §8/A17 masih menunggu amendemen pemilik, jadi baris §10 QRIS belum diubah.** Alasan: pemilik menilai batas 15 menit terlalu lama dan permintaan itu menggantikan dokumen. Batas: **tidak ada perubahan visual** — format `Countdown` §4.21 tetap (MM:SS `font-mono text-meta`, < 3 menit `text-danger` + `animate-pulse`, berhenti di `00:00` lalu state `expired` §4.4/§5.8); yang berubah hanya durasi total, dan ambang < 3 menit tetap sah pada durasi 5 menit |
| D11 | Kolom `midtrans_client_key` + `midtrans_is_production` pada tab Pembayaran §5.13 berstatus **CATATAN** — nilainya tidak dibaca jalur pembayaran | `docs/review.md` F-2 akar 2: `app/Services/SettingService.php:46-47` hanya menyimpan ke tabel `settings`; pencarian `midtrans_client_key` dan `midtrans_is_production` di `app/` + `config/` hanya menemukan request + service admin, tanpa pembaca di jalur bayar; `config/midtrans.php:17-26` membaca kredensial efektif dari `.env`; `docs/kontrak-props.md:19-20` **sebelumnya** menyatakan key sensitif dibaca di server (dikoreksi 22 Okt 2026, kartu `t_abb37557`) | **DIPUTUSKAN 22 Okt 2026 (techlead, kartu `t_abb37557`): DIPERTAHANKAN sebagai catatan** — bentuk final §5.13: **hint** per kolom "Catatan saja: nilai ini tidak dibaca jalur pembayaran QRIS", teks "Kredensial dibaca dari {sumber}." dari `modeInfo`, dan badge mode efektif (dikerjakan F2 `t_e60e7733`). Alasan: PRD §6 mewajibkan kedua kunci (`docs/PRD.md:199`); yang tersimpan hanya client key publik + flag boolean — server key tidak pernah masuk `settings`; hint sudah menutup akar keluhan "kolom terlihat mengatur padahal tidak". **Tidak ada perubahan §5.13.** Bila pemilik kelak ingin menghapus: amendemen PRD §6 lebih dulu, lalu kartu uiux + backend + frontend (`docs/usulan.md` U9) |
| D12 | Kartu **"Pengiriman"** pada halaman detail pesanan `/admin/pesanan/{order}` (§5.12) mendapat **isian nomor resi** (PRD A15) yang belum digambar di spesifikasi desain — elemen baru, bukan penyimpangan dari elemen lama | Keputusan techlead kartu `t_394b40ba` (`docs/keputusan-a15-resi.md` §1): kolom `orders.tracking_number` string(60) dengan `null` = belum diisi, rute `PATCH /admin/pesanan/{order}/resi` (`admin.orders.resi`) + `Admin\OrderController@resi`; kontrak `docs/kontrak-props.md` §12.17 (`pesanan.tracking_number`: string atau `null`) dan §12.18a (validasi `nullable` `string` `max:60`, `''` → `null` = menghapus, galat `errors.tracking_number` = `Nomor resi maksimal 60 karakter.` / `Nomor resi harus berupa teks.`); dasar PRD A15 (`docs/PRD.md:375`: "Tidak ada integrasi kurir; nomor resi diisi manual di detail pesanan"); F5 `t_018b2723` hanya bisa merender notice "Nomor resi belum bisa diisi" (`resources/js/Pages/Admin/Orders/partials/InfoResi.jsx:18-21`), jadi bentuk isian belum punya acuan | **Diterima sebagai deviasi — asal PRD A15; keputusan + teks beku kartu `t_394b40ba`; pengerjaan tampilan kartu `t_d1028202` (F5b).** Alasan: A15 adalah permintaan PRD yang belum punya gambaran tampilan, sedangkan F5b sudah menulis kode; tanpa baris ini frontend menulis isian tanpa acuan. Batas: **tanpa token, warna, atau komponen baru** — hanya komponen yang sudah ada: §4.5 `Field` + `Input` (label `Nomor resi`, bantuan `text-meta text-slate-500` di latar putih kartu, galat server `errors.tracking_number` `text-meta text-danger-strong` di bawah input) dan §4.1 `Button` `primary` (`Simpan resi`; `disabled` + label "Memproses…" selama menyimpan); baris status `text-meta text-slate-500` = `Belum ada nomor resi.` (kosong) / `Tersimpan: <nomor>` (terisi). Teks beku tambahan: bantuan `Isi nomor resi dari ekspedisi setelah paket dikirim. Kosongkan untuk menghapus.`. Sukses mengikuti `flash.success` server (§12.18a `Nomor resi pesanan diperbarui.`) — tanpa toast atau state halaman baru; `InlineNotice` lama di `InfoResi.jsx` **dihapus**. Di luar baris ini (belum digambar, usulan `docs/usulan.md` U5): resi tampil di halaman pembeli, tautan lacak kurir, integrasi ekspedisi, riwayat resi |

| D13 | Kartu **"Bukti pembayaran"** pada detail pesanan `/admin/pesanan/{order}` (§5.12) mendapat tombol sekunder **"Sinkronkan status pembayaran"** + notice hasil — elemen baru, bukan penyimpangan dari elemen lama | Keputusan techlead kartu `t_caaa8fa4`: rute `PATCH /admin/pesanan/{order}/sinkron-pembayaran` (`admin.orders.sinkron-pembayaran`) + `Admin\OrderController::syncPayment`, kontrak **§12.24** (`docs/kontrak-props.md:1412-1443`, dikerjakan backend kartu `t_c374a29b`, B3), tombol dikerjakan kartu `t_8e89556f` (F8). Asal temuan laporan pemilik butir 5 (`docs/review-2.md` §2 butir 5): `routes/admin.php` hanya memuat `orders.index`/`show`/`status`/`resi` dan `app/Http/Controllers/Admin/OrderController.php` hanya punya `index`/`show`/`status`/`resi`, sehingga admin tidak punya cara menarik status bayar (webhook Midtrans tidak bisa masuk localhost). Kode saat ini `resources/js/Pages/Admin/Orders/Show.jsx:204-214`: kartu "Bukti pembayaran" dibuka lewat komponen `KartuBagian` dan hanya memuat pratinjau readonly `BuktiPembayaran` (`payment` + `payment_label`), berdampingan (`lg:grid-cols-2`) dengan kartu "Catatan pembeli" — tombol ini belum punya acuan tampilan | **Diterima sebagai deviasi — asal laporan pemilik butir 5 ("status bayar mandek"); keputusan + nama rute + kontrak §12.24 dari techlead kartu `t_caaa8fa4`; pengerjaan backend `t_c374a29b` (B3) + tombol `t_8e89556f` (F8).** Alasan: status bayar tidak pernah berubah padahal sudah dibayar, dan webhook tidak bisa masuk di localhost. Batas: **tanpa komponen, token, atau warna baru** — hanya §4.1 `Button` varian `secondary` (47px, radius 9px, `border-line`) dan §4.23 `InlineNotice` (tone `info` = `bg-brand-100 text-ink` (13,13:1); `success` = `bg-success/10 text-ink`; `error` = `bg-red-50 border border-danger text-ink` — semuanya `text-ink`, lolos AA; tone `error` memakai `role="alert"`). **Teks beku + state:** label `Sinkronkan status pembayaran`; saat memproses label `Memproses…` + `disabled` (§4.1 state `loading`, lebar dikunci agar layout tidak melompat). **Muncul hanya bila `pesanan.payment` tidak `null`** (§12.17) — tanpa baris `payments` kontrak §12.24 hanya menjawab `flash.error` (`Pesanan ini belum punya tagihan pembayaran…`), dan satu-satunya cara agar admin tidak menekan tombol tanpa hasil adalah tidak merendernya. **Tombol tetap aktif saat `payment_status` `settlement`** dan saat mode uji: hasilnya tetap lewat flash (`flash.success` = `Pembayaran sudah lunas, sinkronisasi tidak perlu dijalankan.`; mode uji = `flash.error` `Mode uji Midtrans: status tidak bisa disinkronkan.`) — ini dipilih daripada `disabled` agar §4.0 (state `disabled` wajib punya alasan terlihat) tidak dilanggar dan alasan penolakan datang dari server sebagai satu sumber kebenaran. **Hasil aksi dirender satu kali** lewat §4.23 `InlineNotice` di dalam kartu yang sama; halaman ini sudah mengubah `flash.success`/`flash.error` menjadi `Toast` §4.8 lewat efek global (`Show.jsx:56-63`), sehingga bila keduanya dipasang untuk key yang sama pesan muncul **dua kali** — toast halaman di-*suppress* untuk aksi ini (keputusan UIUX U6-1, `docs/catatan-uiux.md`). |
| D14 | Header desktop (§3.1) untuk **tamu** mendapat **tautan teks "Daftar"** ke `/register` di samping ikon Masuk — elemen baru, bukan penyimpangan dari elemen lama | Kartu techlead `t_caaa8fa4` → dikerjakan kartu `t_e3f68f7f` (F9). Asal: `docs/review-2.md` §2 butir 7 — `resources/js/Components/Header.jsx:87-108` (sebelum perubahan): cabang `user === null` hanya merender **satu** `<Link>` ke `/login` ber-ikon (`UserIcon` 20px, `aria-label="Masuk"`, kelas `hidden h-touch w-touch … md:inline-flex`), tanpa tautan `/register`; §3.1 baris 189 hanya menyebut logo → menu tengah-kiri → ikon kanan (Search, Cart, Log in) dan tidak pernah menyebut pintu Daftar, padahal register adalah alur resmi PRD (`docs/PRD.md:122`) | **Diterima sebagai deviasi — asal laporan pemilik butir 7; pengerjaan kartu `t_e3f68f7f` (F9).** Alasan: tamu tidak punya jalan ke `/register` sama sekali. Batas: **tanpa komponen, ikon, atau token baru** — hanya `Link` Inertia teks, **hanya ≥ md** (`hidden … md:inline-flex`), tepat **setelah** ikon Masuk; ikon `UserIcon` + `aria-label="Masuk"` tidak diubah, tidak diganti, dan tidak ditambah ikon baru. **Kelas = pola teks aksi §3.1** (`text-meta text-brand underline underline-offset-4`) — sama persis dengan tombol "Keluar" yang sudah ada di header yang sama (`Header.jsx:95-100`), karena tautan ini duduk di **grup aksi** (deret ikon kanan), bukan di deret menu; versi ber-`px-3.5 py-3` + hover `decoration-accent-500` (pola tombol menu §3.1 baris 199) **ditolak** untuk elemen ini — padding menu akan menggeser deret ikon kanan dan menambah target klik besar di area aksi. Bila §3.1 kelak digambar ulang, tautan ini **tambahan**, bukan penggantian — urutan ikon kanan tetap Search, Cart, Masuk, lalu teks Daftar. "Daftar" **tidak** dirender untuk user yang sudah login (§3.1: nama + "Keluar") dan **tidak** dirender di header mobile (< md) — jalur mobile ditangani drawer (D15). |
| D15 | Footer **drawer tamu** (shell §3.1, butir "Mobile: hamburger kiri, logo tengah, cart kanan; drawer dari kiri `w-drawer`") mendapat **dua tautan bertumpuk**: "Daftar" (`primary`, `w-full justify-center`) di atas "Masuk" (`secondary`, `w-full justify-center`) — elemen baru, bukan penyimpangan dari elemen lama | Kartu techlead `t_caaa8fa4` → dikerjakan kartu `t_e3f68f7f` (F9). Asal: `docs/review-2.md` §2 butir 7 — `resources/js/Layouts/PublicLayout.jsx:84-94`: prop `footer` pada `NavDrawer` untuk tamu hanya memuat **satu** tautan `<Link href="/login" className="btn-primary w-full justify-center">Masuk</Link>`; §3.1 tidak pernah menyebut komposisi footer drawer sama sekali (bukan sekadar tidak menyebut Daftar) | **Diterima sebagai deviasi — asal laporan pemilik butir 7; pengerjaan kartu `t_e3f68f7f` (F9).** Alasan: di < md drawer adalah satu-satunya jalur navigasi tamu, sehingga tanpa tautan di sini pintu Daftar tetap hilang di ponsel. Batas: **tanpa komponen baru** — memakai kelas tombol yang sudah ada di `app.css:39-45`: `.btn-primary` (`accent-500` + `text-ink`; §2.1 "CTA accent selalu `text-ink`", 10,11:1) untuk **Daftar**, `.btn-secondary` (transparan + `border-line` + `text-ink`) untuk **Masuk**. Urutan **Daftar di atas, Masuk di bawah** (mengikuti pola drawer yang sudah ada: satu `btn-primary w-full` sebagai aksi utama footer). Kedua tautan `w-full justify-center` agar lebar seragam; jarak antar tautan memakai skala spacing yang ada (`gap-2` = 8px) — tanpa token spacing baru. Untuk user yang sudah login footer drawer **tidak berubah** (teks `Masuk sebagai …`, `text-meta text-ink-soft`). |
| D16 | Halaman `/login` dan `/register` (§5.5) mendapat **tautan silang Masuk ↔ Daftar** — elemen baru, bukan penyimpangan dari elemen lama (bagian §5.5 tetap: field, state, dan tautan balik `/forgot-password` tidak berubah) | Kartu techlead `t_caaa8fa4` → dikerjakan kartu `t_e3f68f7f` (F9). Asal: `docs/review-2.md` §2 butir 7 — `resources/js/Pages/Public/Auth/Login.jsx` dan `Register.jsx` tidak saling menautkan; §5.5 (baris 589-597) hanya menetapkan tautan balik ke login pada `/forgot-password` (baris 594) dan tidak menyebut tautan silang login↔daftar; pola tautan terdekat di halaman yang sama: `Login.jsx` "Lupa kata sandi?" = `text-meta` + `text-brand underline underline-offset-4` | **Diterima sebagai deviasi — asal laporan pemilik butir 7; pengerjaan kartu `t_e3f68f7f` (F9).** Alasan: pengguna yang mendarat langsung di `/login` atau `/register` (tautan luar, riwayat peramban, pesan galat) tidak punya jalan ke halaman satunya, sedangkan halaman ini **sudah** memakai pola tautan balik (§5.5 baris 594). Batas: **tanpa komponen, token, atau warna baru** — baris `text-meta` di bawah form: `Belum punya akun? ` + tautan `Daftar` di `/login`, `Sudah punya akun? ` + tautan `Masuk` di `/register`; kelas tautan `text-brand underline underline-offset-4` (persis pola "Lupa kata sandi?" pada halaman yang sama). Warna teks tanya mengikuti aturan meta halaman: latar auth **putih** (`resources/js/Layouts/AuthLayout.jsx:37` = `bg-white`), bukan `surface`, sehingga `slate-500` tetap sah (§2.1) dan aturan v2.2 `slate-600` **tidak** berlaku di sini. Ditempatkan **di luar** `<form>` (setelah `Button` submit, sejajar baris "Lupa kata sandi?" di `/login`) agar tidak ikut alur submit. |
---

### 11.4 Temuan kontras di luar badge (terukur 20 Okt 2026, kartu `t_8cd61512`)

Dihitung dengan metode yang sama seperti badge. Kartu UIUX ini **tidak** mengubah komponen non-badge; temuan diteruskan
sebagai kartu frontend terpisah.

**Pembaruan v2.2 (kartu `t_14cad9e2`):** T1/T2 mengukur perpindahan `slate-400`→`slate-500` **hanya di atas putih**. Pengukuran ulang di atas
latar non-putih menemukan `slate-500` = **4,40:1** di atas `surface` (< 4,5:1) → temuan **T7**. Aturan §2.1 diperluas: teks meta < 24px di atas
latar non-putih wajib `slate-600`. Tidak ada komponen yang diubah di kartu ini (R8, tanpa commit); penerapan diserahkan ke kartu frontend lanjutan.

| # | Temuan | Rasio | Kelas pengganti (terukur) | Status |
|---|---|---|---|---|
| T1 | Teks meta `text-slate-400` (#94A3B8) < 24px di atas putih (breadcrumb, hint, jumlah kategori, `EmptyState` §4.23) | 2,56:1 | `text-slate-500` = 4,76:1 | Diteruskan → kartu `t_90759be9` |
| T2 | Harga coret `text-slate-400 line-through` di `PriceBlock` (§4.21) dan varian `CartLine` (§4.28) | 2,56:1 | `text-slate-500` = 4,76:1 | Diteruskan → kartu `t_90759be9` |
| T3 | `text-success` / `text-warning` sebagai **teks** < 24px (mis. "Stok tersedia", delta `KpiCard` §4.26) | 3,30:1 / 3,19:1 | `text-success-strong` 7,13:1 / `text-warning-strong` 7,09:1 | Diteruskan → kartu `t_90759be9` |
| T4 | `text-danger` di atas `red-50`/`bg-danger/10` **bila** dipakai sebagai teks (§4.23 `InlineNotice` error) | 4,41:1 / 4,13:1 | `text-danger-strong` = 7,60:1 | Aturan §2.1; ikon tetap boleh `text-danger` (4,41:1, ambang non-teks 3:1) |
| T5 | Badge diskon `PriceBlock.jsx:23` memakai tint `bg-sale-500/10 text-sale-500`, padahal §4.21 menetapkan bentuk solid | 4,00:1 | `bg-sale-500 text-white` = 4,65:1 | Diteruskan → kartu `t_67576fb2` |
| T7 | Teks meta informatif < 24px `text-slate-500` (#64748B) di atas latar **non-putih**: `surface` (header tabel §4.7, `PageHeader`/breadcrumb admin §5.10, kotak pesan §5.12, panel `expired` §4.4, tab nonaktif §4.27), `brand-100`, chip `slate-200/60` | 4,40:1 / 3,93:1 / 4,08:1 | `text-slate-600` = 7,00:1 / 6,26:1 / 6,50:1 | Diteruskan → **kartu frontend lanjutan**; 29 titik di 13 berkas (`docs/bukti-uiux-t_14cad9e2.txt`), gate `docs/qa/sweep-meta-surface.py` (Check A 0/29 pada 20 Okt 2026) |
| T6 | Ikon `success`/`warning` di dalam chip bertint `bg-{token}/10` (`InlineNotice`, `Toast`, `KpiCard` §4.26) — ambang elemen non-teks §1.4.11 = 3:1 | 2,96:1 / 2,86:1 | `text-success-strong` 6,40:1 / `text-warning-strong` 6,36:1 | Diteruskan → kartu `t_90759be9` |

Yang **tidak** perlu diubah: teks isi `InlineNotice` memakai `text-ink` (16,80:1 di atas `bg-success/10`, 16,79:1 di atas `bg-warning/10`, 17,13:1 di atas `red-50`) dan ikon non-teks `success`/`warning` (2,96:1) pada latar putih lolos ambang 3:1 (3,30:1 / 3,19:1), tetapi di dalam chip bertint turun ke 2,96:1 / 2,86:1 → wajib `-strong` (T6).

**Pemetaan kelas pengganti per konteks (T7, v2.2)** — satu pemetaan `text-slate-500` → `text-slate-600`, berlaku bila latar bukan putih:

1. Header tabel admin (§4.7) di atas `surface` → `text-slate-600`.
2. `PageHeader` + `Breadcrumb` admin yang dirender langsung di `<main class="bg-surface">` (§5.10) → `text-slate-600`.
3. Teks meta di dalam panel/kotak `bg-surface` (§4.4 `QrisPanel` state `expired`, kotak detail pesan §5.12, kotak unggah §4.25) → `text-slate-600`.
4. Tab nav nonaktif di atas `surface` (§4.27, `/admin/pengaturan`) → `text-slate-600`.
5. Teks meta di dalam kartu/modal **putih** (§4.21 `PriceBlock` harga coret, §4.26 `KpiCard`, baris tabel §4.7, §4.28 `OrderSummary`, §4.29 `ReviewCard`, §4.13 breadcrumb publik) → tetap `text-slate-500`.
6. Elemen non-teks/`aria-hidden` (ambang 3:1), teks `disabled`, `placeholder:` di field putih, komentar kode → tetap `slate-400`/`slate-500` sesuai §2.1.

## 12. Berkas Terkait

| Berkas | Isi |
|---|---|
| `docs/komponen.md` | API props, varian, state per komponen — pegangan implementasi K10 |
| `docs/design-catatan-rea.md` | Catatan referensi visual: observasi yang dipakai (R1–R10) vs keputusan internal, batas aset, keterbatasan bukti capture |
| `docs/PRD.md` | Sumber kebenaran fungsi & rute |
| `docs/traceability.md` | Peta lintas peran (PRD → desain → kode → QA) |
| `tailwind.config.js` | Implementasi token §2 |
| `token-check.mjs` | Skrip verifikasi 55 token (jalankan manual; boleh dihapus setelah K10 stabil) |
| `docs/bukti-uiux-t_8cd61512.txt` | Bukti hitung kontras tone badge §4.21 v2.1: metode WCAG, angka per latar, hasil verifikasi token/build |
| `docs/bukti-uiux-t_14cad9e2.txt` | Bukti keputusan v2.2 (teks meta di atas latar non-putih): angka WCAG per latar, klasifikasi 95 kemunculan `text-slate-500`, daftar 29 titik per berkas:baris, hasil gate + build |
| `docs/qa/sweep-meta-surface.py` | Gate kontras meta §2.1 v2.2: Check A 29 titik keputusan, Check B penyapu latar non-putih, Check C tinjau manusia |
| `docs/qa/terapkan-meta-v22.py` | Penerapan 29 titik `text-slate-500` → `text-slate-600` (pegangan kartu frontend lanjutan; `--cek` = dry run) |
| `docs/qa/kontras-meta.py` | Kalkulator kontras WCAG 2.1 untuk kelas teks meta (putih/surface/brand-100/chip/slate-200) |

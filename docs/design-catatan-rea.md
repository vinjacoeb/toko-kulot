# Catatan REA — Referensi Visual

Dokumen ini mencatat **apa yang diambil** dari observasi referensi (`erigostore.co.id`) dan **apa yang diputuskan sendiri** untuk Toko Daster Kulot. Tujuannya: memisahkan fakta observasi dari keputusan desain, supaya tidak ada klaim "ini dari referensi" yang tidak bisa ditelusuri.

Metode: observasi visual **read-only** lewat browser DevTools/CDP. Yang dipakai hanya **bahasa visual** — skala tipografi, proporsi layout, ritme spasi, pola komponen. **Tidak ada aset, gambar, font komersial, teks, atau kode** yang disalin.

## 1. Batas yang dipegang

| Boleh diambil | Tidak boleh diambil |
|---|---|
| Rasio & proporsi (kartu 1:1, hero 16:9, sidebar 240px) | Foto produk, gambar banner, ilustrasi |
| Skala tipografi relatif (display ≫ h1 ≫ body ≫ meta) | Berkas font komersial |
| Pola layout (grid 4 kolom, header sticky, filter sidebar) | Markup/JSX, CSS, nama kelas |
| Ritme spasi (jarak antar seksi, gutter) | Copywriting, nama produk, harga |
| Konvensi warna fungsional (CTA kontras tinggi, badge diskon merah) | Logo, merek, ikon berlisensi |

## 2. Observasi yang dipakai

Halaman diamati: beranda dan satu halaman detail produk.

| # | Observasi | Diterjemahkan menjadi | Status |
|---|---|---|---|
| R1 | Tipografi judul memakai condensed sans kapital besar, jauh lebih besar dari body | `fontFamily.display` = Bebas Neue, `fontSize.display` `clamp(40px→64px)` | Dipakai |
| R2 | Body text sans netral, ukuran ~15px, line-height longgar | `fontSize.body` `clamp(15px→16px)`, `lineHeight 1.6` | Dipakai |
| R3 | Grid produk 4 kolom di desktop, 2 kolom di mobile, gutter konsisten | `grid-cols-product` 2 / `-md` 3 / `-lg` 4, `gap-gutter` 16px, `gap-gutterLg` 24px | Dipakai |
| R4 | Header sticky ramping, logo kiri, nav tengah, ikon kanan | `h-header` 68px / `h-headerMobile` 56px, pola 3 zona | Dipakai |
| R5 | Kartu produk: gambar persegi, judul 2 baris, harga tebal di bawah | `aspect-square`, `line-clamp-2`, harga `font-bold text-h3` | Dipakai |
| R6 | CTA utama warna kontras tinggi (kuning) dengan teks gelap, tinggi ~47px | `btn` `h-btn` 47px, `bg-accent-500` `#F5B301`, teks `ink` | Dipakai, warna diganti ke palet Toko Kulot |
| R7 | Badge diskon merah kecil di sudut gambar | `Badge tone="sale"` `#E02B00`, `text-badge` 12px uppercase | Dipakai |
| R8 | Halaman detail: galeri kiri, panel beli kanan (sticky di desktop) | 2 kolom `1.4fr / 1fr`, panel sticky | Dipakai |
| R9 | Footer gelap hampir hitam, 4 kolom tautan, teks abu | `bg-footer` `#0E0E0E`, 4 kolom → 1 kolom mobile | Dipakai |
| R10 | Pemisah antar seksi tipis, bukan bayangan | `border-line` `#E5E7EB` 1px, `shadow-card` sangat halus | Dipakai |

## 3. Keputusan milik Toko Kulot (bukan dari referensi)

Item berikut **tidak** diambil dari referensi mana pun — ditetapkan di `docs/design.md` berdasarkan PRD, kebutuhan admin, dan konteks produk daster:

- **Palet warna** `brand` `#1F2A5E` (navy) + `accent` `#F5B301` — bukan warna referensi; dipilih agar kontras teks/latar lolos 4,5:1 dan terasa lokal, bukan tiruan.
- **Token semantik** (`brand`, `accent`, `sale`, `ink`, `surface`, `footer`, `line`, `success`, `warning`, `danger`) — struktur ini keputusan internal untuk memudahkan rebranding.
- **Tipografi fluid berbasis `clamp()`** — referensi memakai breakpoint tetap; Toko Kulot memilih fluid agar tidak perlu varian `md:` di tiap teks.
- **Seluruh layout admin** (`AdminLayout`, sidebar `brand-700`, `DataTable`, `KpiCard`, `ChartCard`) — referensi tidak punya area admin; ini diturunkan dari PRD §6.
- **Alur QRIS + countdown** (`QrisPanel`) — spesifik metode pembayaran Toko Kulot.
- **Matriks state** (`loading`/`empty`/`error`/`disabled`) — standar internal, bukan pola referensi.
- **Aturan "tidak ada hex di JSX"** — konvensi internal proyek.

## 4. Bukti & keterbatasan

- Capture dilakukan di sesi browser (viewport desktop & mobile) sebagai bahan observasi; **berkas tangkapan layar tidak disimpan di repo ini**, jadi tidak ada lampiran gambar yang bisa dibuka ulang dari sini.
- Karena itu, klaim visual di `docs/design.md` harus dibaca sebagai **hasil terjemahan**, bukan reproduksi piksel. Yang bisa diverifikasi ulang di repo adalah **token** (`tailwind.config.js` + `node token-check.mjs`) dan **CSS hasil build** — bukan kemiripan dengan situs referensi.
- Bila pemilik produk ingin bukti capture: ulangi observasi, simpan ke `docs/referensi/` (gambar referensi hanya untuk pembanding internal, **jangan** dipakai sebagai aset produksi).
- Referensi bisa berubah sewaktu-waktu; dokumen ini mencatat kondisi saat observasi (20 Okt 2026) dan tidak mengikat.

## 5. Hal yang sengaja tidak ditiru

- Struktur navigasi mega-menu berlapis — toko ini katalognya kecil, menu datar lebih cepat dipakai.
- Animasi masuk per elemen saat scroll — mengganggu di perangkat kelas bawah dan menambah biaya JS.
- Banner promo bertumpuk di atas lipatan — PRD menetapkan hero tunggal + carousel.
- Ikon set pihak ketiga berlisensi — diganti ikon inline sederhana.

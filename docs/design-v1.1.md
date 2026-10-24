# Addendum Desain v1.1 — Toko Daster Kulot

> Kartu: `t_7bca843e` · 24 Oktober 2026 · Status: **mengikat**
> Dokumen ini adalah addendum `docs/design.md`. Untuk landing, checkout ongkir, pembayaran Snap,
> `/admin/ekspedisi`, dan galeri tab Landing, dokumen ini **menang** atas `design.md`.
> Fungsi lain tetap mengikuti `docs/design.md`.
>
> Sumber kebenaran: `docs/PRD-v1.1.md` §2–§6 (mengikat), `docs/kontrak-props.md` §1–§3, §7.0–§7.13,
> §10.9, §10.13, dan `docs/design.md` §2/§3.3/§5.1/§5.6–§5.8/§5.12–§5.13/§6.
> Tidak ada kode/JSX di dokumen ini. Tidak ada aset baru; semua gambar contoh memakai `[CONTOH]`
> atau path seed yang sudah ada.

---

## 1. Ringkasan dan keputusan

### 1.1 Yang diubah

| Area | Perubahan | Rujukan |
|---|---|---|
| Landing | Trust strip tipografis, galeri asimetris, why-us editorial, type scale, reveal, lazy loading | PRD D5–D7 |
| Keranjang | Ongkir tidak final; teks **Dihitung saat checkout** kecuali mode fake | PRD D2 |
| Checkout | **Cek Ongkir** → pilih kurir/layanan → gratis ongkir reguler ≥ Rp300.000 | PRD D2–D3 |
| Pembayaran | Snap **redirect** ke `snap_redirect_url`, tombol **Pilih Metode Pembayaran**, state kembali + polling | PRD D1, komentar techlead |
| Admin | Halaman `/admin/ekspedisi`; galeri di tab **Landing** `/admin/pengaturan` | PRD D4/D6 |
| Copy | CTA akhir memakai kalimat gratis ongkir dari seeder | PRD D7 |

### 1.2 Keputusan desain yang mengikat

1. **Snap redirect, bukan popup.** Tidak ada `snap.js`, tidak ada client key di frontend. Tombol
   utama membuka `pembayaran.snap_redirect_url` di tab yang sama. Jika URL tidak ada, tampilkan galat;
   **jangan** jatuh ke mode fake.
2. **Satu tombol kurir = satu pilihan.** Radio group, bukan dropdown, agar harga, ETD, dan badge
   gratis terlihat bersamaan.
3. **Tarif klien tidak dipercaya.** UI hanya menampilkan dan mengirim `shipping_cost` sebagai
   pembanding; server tetap menghitung ulang. Jika server menolak dengan
   `Ongkir berubah, pilih ulang kurir.`, UI mengosongkan pilihan dan meminta **Cek Ongkir** ulang.
4. **Gratis ongkir hanya untuk layanan reguler.** Badge dan total 0 hanya jika `opsi.gratis = true`.
   Layanan non-reguler tetap menampilkan tarif penuh meskipun subtotal memenuhi batas.
5. **Tidak ada metode pembayaran hard-coded.** Copy tidak boleh menyebut QRIS sebagai satu-satunya
   metode. Metode yang tampil adalah yang aktif di akun Midtrans.
6. **Tidak ada data karangan.** Galeri kosong → seksi disembunyikan. Why-us tanpa gambar galeri →
   layout tipografi saja, bukan placeholder buatan. Gambar rusak → blok fallback netral, bukan
   gambar stok baru.
7. **Mode uji harus jelas.** Setiap layar yang memakai tarif uji atau pembayaran uji menampilkan
   badge **Tarif uji** / notice **Mode uji**. Jangan menyamarkan sebagai transaksi nyata.
8. **Galeri 4–8.** Komposisi utama 4–6 (PRD D5), tetapi data maksimum 8 (A22). 7–8 tetap dirender
   dengan baris tambahan; tidak ada gambar yang dibuang diam-diam.

### 1.3 Non-goals

- Tidak mengubah alur keranjang → checkout → bayar → selesai → ulasan.
- Tidak menambah field pengaturan baru selain yang sudah ada di kontrak.
- Tidak menambah dependency animasi, carousel, atau library upload.
- Tidak mendesain ulang header/footer, halaman produk, atau halaman pesanan admin.
- Tidak menentukan markup/JSX. Implementasi mengikuti komponen yang sudah ada (`Button`, `Field`,
  `InlineNotice`, `Badge`, `StatusBadge`, `SectionHeader`, `PageHeader`, `Skeleton`, `EmptyState`,
  `QrisPanel`, `StickySave`, `Thumb`).

---

## 2. Token, tipografi, dan warna

### 2.1 Token baru

Tambahan minimum; semua nilai lain memakai `tailwind.config.js` yang ada.

| Token | Nilai | Dipakai untuk | Alasan |
|---|---|---|---|
| `fontSize.display-xl` | `72px / 0.95 / 0.01em` | Satu statement editorial why-us di desktop | Menciptakan tier di atas `display` (64px) tanpa font baru |
| `aspectRatio.portrait` | `4 / 5` | Tile galeri, gambar why-us, thumb admin | Rasio potret konsisten untuk foto produk |
| `aspectRatio.editorial` | `16 / 10` | Tile galeri lebar, gambar utama | Mencegah layout shift dan memberi ritme lebar |

Tidak ada token warna, radius, shadow, atau motion baru. Token check frontend: **58 token**
(55 existing + 3). Bila `display-xl` tidak ditambahkan, fallback yang diizinkan hanya `text-display`;
jangan memakai `text-[72px]` ad hoc.

### 2.2 Tiga tier tipografi

| Tier | Token | Ukuran | Penggunaan | Aturan |
|---|---|---|---|---|
| A — Display | `text-display-xl` (desktop), `text-display` (≤768) | 72 → 40–64 | Statement why-us **“Bukan sekadar dasternya.”**; hero existing | Maksimal satu display per viewport; jangan dipakai untuk judul seksi biasa |
| B — Heading | `text-h1` 32–44, `text-h2` 26–32, `text-h3` 15–16 | 44/32/16 | Judul halaman, judul seksi, judul kartu | `h1` hanya satu per halaman; `h2` per seksi; `h3` untuk item |
| C — Body | `text-body` 15–16, `text-meta` 13–14, `text-label` 14–15, `text-badge` 11–12 | 16/14/14/12 | Paragraf, caption, label form, badge | Body minimal 15px; meta minimal 13px; label uppercase hanya untuk eyebrow |

Aturan:
- Display/heading memakai Bebas Neue; body/meta/label memakai Inter (existing).
- Jangan mengubah heading menjadi uppercase seluruh paragraf. Eyebrow boleh uppercase + tracking
  `tracking-[0.08em]`.
- Angka harga memakai `tabular-nums`; nominal tidak dipecah ke baris baru.
- Maksimal dua ukuran heading dalam satu kartu. Jangan memakai `h1` di dalam card.

### 2.3 Warna dan kontras

Palet existing; tidak ada warna baru. Gunakan kombinasi berikut dan **jangan** memakai pasangan di
luar tabel untuk teks normal.

| Teks | Latar | Rasio | Status | Pemakaian |
|---|---|---|---|---|
| `text-white` | `bg-brand` `#1F2A5E` | 13,54:1 | AAA | Why-us, tombol primer |
| `text-brand-100` | `bg-brand` | 11,18:1 | AAA | Body di seksi gelap |
| `text-ink` | `bg-accent` `#F5B301` | 10,11:1 | AAA | Badge/CTA accent |
| `text-slate-600` | `bg-surface` `#F6F6F4` | ±7,0:1 | AAA | Meta di latar non-putih |
| `text-slate-500` | `bg-white` | 4,76:1 | AA | Meta sekunder di putih saja |
| `text-success-strong` | `bg-success/10` | 5,33:1 | AA | Teks gratis ongkir |
| `text-warning-strong` | `bg-warning/10` | 5,34:1 | AA | Notice tarif uji |
| `text-danger-strong` | `bg-danger/10` | 5,95:1 | AA | Error |
| `text-accent` | `bg-brand` | 7,31:1 | AAA | Aksen di seksi gelap |
| `text-white` | `bg-sale` | 4,65:1 | AA | Badge diskon |

Larangan:
- `text-white` di atas `bg-accent` (gagal kontras).
- `text-slate-500` di atas `bg-surface`, `bg-brand-100`, atau chip abu-abu.
- Warna sebagai satu-satunya penanda status; selalu sertakan teks/ikon.
- Gradient baru. Aksen hanya garis, underline, badge, dan angka; bukan latar teks panjang.

### 2.4 Spacing, bentuk, gerak

- Container publik: `max-w-[1200px]`, padding 20px (360), 32px (768), 48px (1280).
- Section: padding vertikal 56px (360), 72px (768), 96px (1280); pemisah `border-t border-line`.
- Grid: 12 kolom desktop, 8 tablet, 4 mobile. Gap 16/24/32.
- Radius: `rounded-lg` untuk input/tombol, `rounded-xl` untuk panel; tidak ada pill kecuali badge.
- Shadow: hanya `shadow-card` pada panel ringkasan/checkout; landing flat.
- Motion: `duration-hover` (300ms) + `ease-smooth`. Hover gambar `scale(1.02)`, underline CTA
  tumbuh dari kiri, reveal opacity + translateY(12px). Tidak ada parallax/auto-play.
- `prefers-reduced-motion: reduce`: semua transisi/transform dimatikan; konten langsung terlihat.

---

## 3. Pola state bersama

Berlaku di semua layar di bawah.

| State | Perilaku visual | Perilaku teknis/ARIA |
|---|---|---|
| Loading awal | Skeleton sesuai bentuk konten; bukan spinner layar penuh | `aria-busy="true"` pada region; jangan mengunci seluruh halaman |
| Loading aksi | Tombol `loading`; label progress; kontrol terkait disabled | Cegah double submit; fokus tetap di tombol sampai selesai |
| Empty | `EmptyState` di dalam layout, judul + 1 kalimat + CTA bila ada | Jangan tampilkan tabel kosong tanpa penjelasan |
| Error | `InlineNotice` tone error di dalam region; aksi retry bila aman | `role="alert"` hanya untuk error baru; jangan spam saat polling |
| Success | Toast/notice `role="status"`; tidak menutupi konten | Fokus tidak dipindah paksa kecuali setelah submit |
| Disabled | Alasan terlihat (helper/notice), bukan hanya opacity | `disabled` + `aria-disabled` bila perlu; jangan sembunyikan alasan |
| Gambar gagal | Blok `bg-slate-100` + ikon `ImageOff` + teks “Gambar tidak tersedia” | `alt` tetap dipertahankan; jangan render ikon rusak |

Aturan umum:
- Error server yang sudah berupa kalimat siap tampil (`galat`, `flash.error`) ditampilkan **apa adanya**;
  jangan diterjemahkan ulang menjadi “Coba lagi” bila pesannya menyebut tindakan spesifik.
- Form mempertahankan nilai saat error; jangan reset.
- Setelah submit gagal, fokus ke field invalid pertama atau ke ringkasan error.
- Semua tombol aksi minimal 44×44px di touch; ikon saja wajib punya label aksesibel.
- Format uang: `Rp300.000` (tanpa desimal, pemisah titik). Format tanggal/waktu: lokal Indonesia,
  `24 Okt 2026, 14.05`.
- Tidak menampilkan `snap_token`, server key, API key, atau isi `.env` di UI/log.

---

## 4. Landing `/` (D5–D7)

### 4.1 Urutan dan ritme

Wajib urut:

1. Announcement (existing)
2. Hero (existing, dipertahankan)
3. **Trust strip**
4. Kategori (existing)
5. Produk unggulan (existing)
6. **Galeri**
7. Promo grosir (existing)
8. **Kenapa beli di sini (editorial)**
9. FAQ (existing)
10. **CTA/newsletter gratis ongkir**

Ritme latar: hero `surface` → trust `white` → kategori/featured `surface` → galeri `white` →
promo existing → why-us `brand` (gelap) → FAQ `surface` → CTA `accent-soft`/`white` dengan garis
aksen. Jangan menambah seksi baru di antara urutan ini.

### 4.2 Trust strip

Sumber: `settings.landing_sections.trust_strip[]` (`title`, `subtitle`, `icon`), maksimum 6 item
sesuai kontrak. Item 0 → seksi disembunyikan.

Layout:
- Bukan baris ikon datar. Satu pita putih dengan garis atas/bawah `border-line`.
- Desktop 1280: 6 kolom sama lebar; setiap item punya nomor editorial `01`–`06` di atas judul,
  ikon 20px di kiri judul, judul `text-h3`, subjudul `text-meta text-slate-600`.
- Pemisah vertikal 1px antar kolom; item terakhir tanpa pemisah.
- Tablet 768: 3 kolom × 2 baris; mobile 360: 2 kolom; item ganjil terakhir boleh melebar satu baris
  penuh agar tidak menyisakan lubang besar.
- Hover: garis aksen 2px tumbuh di bawah item (300ms), bukan bayangan/kartu.
- Ikon `aria-hidden`; makna ada di judul/subjudul. Jangan mengandalkan ikon saja.
- Jika hanya 1–2 item, tetap satu baris; jangan mengisi slot kosong dengan item karangan.

Empty: seluruh pita hilang (tanpa judul “Keunggulan” kosong).
Error/gambar: trust strip tidak memuat gambar; tidak ada state error khusus. Jika `title` kosong,
jangan render item; jika semua kosong, sembunyikan seksi.

### 4.3 Galeri

Sumber: `settings.landing_gallery[]` `{image, caption, alt}`, urutan array = urutan tampil.
Kosong/`null` → seksi hilang seluruhnya. Jangan menampilkan heading “Galeri” tanpa isi.

Header seksi asimetris:
- Kiri: eyebrow `GALERI` (`text-label`, tracking lebar) + H2 `Potongan nyata, bukan foto katalog.`
  (`text-h2`; satu baris di desktop, dua di mobile).
- Kanan (desktop): satu kalimat `text-meta text-slate-600` maksimal 2 baris:
  “Detail bahan, jahitan, dan warna asli dari toko.” Ini teks tetap, bukan konten CMS.
- Mobile: eyebrow → H2 → kalimat; rata kiri.

Komposisi:
- **1 gambar:** satu tile lebar `aspect-editorial`, maksimal 880px, rata kiri; caption di bawah.
- **2 gambar:** dua kolom sama, `aspect-portrait`.
- **3 gambar:** satu tile besar kiri (7/12, `aspect-editorial`) + dua tile potret bertumpuk kanan
  (5/12); tinggi total sama.
- **4–6 gambar:** grid 12 kolom, `auto-rows` 220px. Gambar pertama `col-span-7 row-span-2`
  (tile utama), gambar kedua/ketiga `col-span-5` mengisi kanan, sisanya `col-span-4` di baris
  bawah. Setiap tile minimal 1 besar, 1 tinggi, 1 lebar; bukan grid kartu seragam.
- **7–8 gambar:** pertahankan pola 4–6 untuk enam pertama; dua terakhir masuk baris tambahan
  `col-span-6` (atau `col-span-4` bila lebar memungkinkan). Jangan mengecilkan caption.
- Tablet 768: 2 kolom; tile utama tetap `col-span-2`; gambar lain potret. Mobile 360: 1 kolom untuk
  1–3 gambar; 2 kolom untuk 4–8 dengan gap 12px; caption `text-meta` 13px, boleh 2 baris.
- Gambar: `object-cover`, `object-center`; jangan crop wajah dengan `object-top` acak.
  Tile memakai wadah rasio tetap (`aspect-portrait`/`aspect-editorial`) agar tidak ada layout shift.
- Caption selalu **di bawah** gambar, bukan overlay. Format: nomor `01` (Bebas, 24px, `text-accent`)
  + caption `text-body` (maks 80 karakter, 2 baris, ellipsis). Jika caption kosong, sembunyikan
  seluruh baris caption (termasuk nomor); jangan mengarang caption.
- `alt` kosong → `alt=""` (dekoratif); caption tetap teks terlihat. Jangan menyalin caption ke `alt`
  secara otomatis.
- Hover (desktop, pointer halus): gambar `scale(1.02)` 300ms, nomor bergeser 2px; tidak ada overlay
  teks. Fokus keyboard: outline aksen 2px + offset 2px pada tile/link bila tile dijadikan tautan.
- Tile galeri **tidak** wajib menjadi tautan. Jika nanti dijadikan tautan, seluruh tile harus satu
  tautan dengan label aksesibel dari caption/alt.

Loading/error:
- Semua gambar below-the-fold: `loading="lazy"` + `decoding="async"`; tidak ada spinner per gambar.
- Gambar gagal: blok netral `bg-slate-100`, ikon `ImageOff` 24px, teks “Gambar tidak tersedia”
  (`text-meta text-slate-600`), mempertahankan rasio tile. Caption tetap tampil.
- Galeri tidak memiliki skeleton khusus karena data berasal dari props server; jika render klien
  lambat, tampilkan 3 skeleton tile dengan rasio yang sama, lalu ganti.
- Jangan menampilkan lightbox, autoplay, atau carousel; tidak diminta dan menambah dependency.

### 4.4 Kenapa beli di sini (editorial)

Sumber:
- `settings.landing_sections.why_us.title` → eyebrow (bukan H2 besar).
- `settings.landing_sections.why_us.items[]` `{title, body}`, 3–6 item.
- Gambar pendukung diambil dari `landing_gallery` (item 1 dan 3; jika hanya ada 1, pakai item 1;
  jika tidak ada, layout tanpa gambar). **Tidak ada field gambar baru.**

Layout desktop 1280 (12 kolom, latar `bg-brand`, teks putih):
- Kiri 5 kolom: eyebrow `KENAPA BELI DI SINI` + statement statis
  **“Bukan sekadar dasternya.”** (`text-display-xl`, putih) + paragraf pengantar maksimal 2 baris
  (`text-brand-100`).
- Di bawah statement: satu gambar galeri `aspect-portrait` (maks 360px lebar) dengan caption kecil;
  gambar kedua `aspect-editorial` di kanan bawah bila tersedia.
- Kanan 7 kolom: daftar item bernomor `01`–`06`; setiap item adalah baris tipografis dengan garis
  atas `border-white/20`, judul `text-h3` putih, body `text-brand-100` maksimal 3 baris.
  Bukan tiga kartu datar; tidak ada kotak/shadow.
- Aksen: garis vertikal `bg-accent` 2px di kiri daftar, atau nomor `text-accent`; pilih satu,
  jangan keduanya berlebihan.
- Hover item: garis atas menjadi `bg-accent`, body tetap; 300ms.
- Tablet 768: statement full-width, gambar di kiri 1/2 + daftar di kanan 1/2; tetap asimetris.
- Mobile 360: eyebrow → statement (40px) → paragraf → gambar (jika ada) → daftar 1 kolom;
  semua teks putih, jarak 24px antar item.

Aturan konten:
- Minimal 3 item adalah syarat konten, bukan alasan mengarang. Jika data berisi 1–2 item, render
  item yang ada tanpa placeholder; QA menandai konten <3 sebagai cacat konten, bukan layout.
- Jika `items` kosong, sembunyikan seksi why-us; jangan menampilkan heading kosong.
- Jika `title` kosong, eyebrow fallback “KENAPA BELI DI SINI” (teks tetap, bukan konten baru).
- Jangan memotong body dengan `line-clamp` sampai menghilangkan makna; maksimal 3 baris + ellipsis
  hanya di mobile.

### 4.5 CTA/newsletter

Sumber: `settings.landing_sections.newsletter` (`title`, `subtitle`, `button_text`).
Kalimat wajib dari seeder:
**“Gratis ongkir untuk belanja min. Rp300.000 — khusus pengiriman reguler.”**
Kalimat ini adalah `subtitle`, bukan heading; dapat diedit dari tab Landing dan harus tampil apa
adanya (tanpa memecah atau mengubah tanda hubung).

Layout:
- Panel lebar dengan latar `bg-accent-soft` (atau `white` + garis aksen 4px atas), padding 32–48px.
- Kiri 7 kolom: H2 dari `title` (default “Dapat Info Diskon”), kalimat gratis ongkir `text-body`
  maksimal 2 baris, dengan kata “Gratis ongkir” berwarna `text-brand`/bergaris bawah aksen — bukan
  gradient.
- Kanan 5 kolom: tombol existing `button_text` (default “Hubungi Kami”) menuju kanal kontak/WA yang
  sudah dipakai; jangan mengubah tujuan menjadi keranjang tanpa keputusan produk.
- Mobile: teks di atas, tombol full-width; tinggi tombol 48px.
- Jangan menambahkan form email baru; ini CTA, bukan newsletter signup.

State:
- `subtitle` kosong → fallback kalimat seeder di atas (agar janji gratis ongkir tidak hilang), lalu
  admin diberi helper di tab Landing bahwa kalimat itu wajib.
- `button_text` kosong → fallback “Hubungi Kami”.
- Tidak ada loading/error; tautan eksternal memakai `rel="noopener noreferrer"`.

### 4.6 Reveal, lazy, dan performa

- Komponen `Reveal` membungkus header seksi, item trust/gallery/why, dan CTA; **bukan** hero.
- Perilaku: `IntersectionObserver` threshold 0.12, rootMargin `0px 0px -10% 0px`; elemen muncul
  sekali lalu `unobserve`. Initial state hanya disembunyikan setelah JS aktif; jika JS gagal,
  konten tetap terlihat.
- Tanpa `IntersectionObserver`: langsung terlihat. `prefers-reduced-motion`: langsung terlihat,
  tanpa transisi.
- Stagger maksimal 4 item × 50ms; jangan membuat 20 item beranimasi berurutan.
- Semua gambar below-the-fold `loading="lazy" decoding="async"`; hero `eager` +
  `fetchpriority="high"`. Tile galeri memakai aspect ratio tetap; tidak ada width/height tebakan.
- Tidak ada library animasi baru. Tidak ada parallax, video autoplay, atau animasi loop.

---

## 5. Keranjang — ringkasan ongkir

Layar: `/keranjang` (komponen existing). Perubahan hanya pada panel ringkasan.

### 5.1 Layout

- Panel ringkasan tetap di kanan desktop (5/12) dan di bawah daftar item mobile.
- Baris: Subtotal, Diskon (jika ada), Ongkir, Total.
- Jika `shipping.dihitung_saat_checkout = true`:
  - Baris **Ongkir** bernilai **“Dihitung saat checkout”** (teks persis; jangan “Gratis”).
  - Label total menjadi **“Subtotal”**, bukan “Total”, agar tidak menyiratkan harga final.
  - Helper di bawah: “Ongkir dihitung setelah alamat dan kurir dipilih.”
  - CTA “Lanjut ke Checkout” tetap aktif.
- Jika mode fake (`shipping.mode = "fake"` dan `shipping_cost` ada):
  - Baris Ongkir menampilkan `Rp20.000` (nilai aktual) + badge **Tarif uji**.
  - Total = subtotal + ongkir; helper “Tarif uji, bukan tarif kurir sebenarnya.”
  - Jangan menyembunyikan ongkir final di mode fake.
- Jika `shipping.is_free = true` (bila props tersedia): tampilkan chip **GRATIS ONGKIR** dan
  `Rp0`; jangan mencoret total.
- Format semua nominal integer rupiah; jangan menampilkan `Rp0` sebagai “Gratis” tanpa chip.

### 5.2 State

| State | Tampilan |
|---|---|
| Normal | Panel ringkasan + CTA |
| Kosong | `EmptyState` “Keranjang masih kosong.” + CTA “Lihat Produk” |
| Menghapus item | Baris disabled + spinner kecil; total dihitung ulang setelah respons |
| Gagal hapus/ubah qty | Item kembali ke nilai sebelumnya; `InlineNotice` error di atas daftar; tombol retry |
| Loading awal | Skeleton 2 baris item + panel ringkasan; tidak spinner layar penuh |
| Ongkir belum final | Teks “Dihitung saat checkout” + label Subtotal |
| Mode fake | Badge “Tarif uji” + nominal |

A11y: perubahan total diumumkan `aria-live="polite"`; tombol hapus punya label “Hapus [nama
produk]”; jangan hanya ikon tempat sampah.

---

## 6. Checkout `/checkout`

### 6.1 Tujuan layar

Pembeli mengisi kontak/alamat, menekan **Cek Ongkir**, memilih satu layanan, melihat total final,
lalu membuat pesanan. Metode pembayaran dipilih di halaman berikutnya; jangan menampilkan pilihan
bank/QRIS di sini.

### 6.2 Layout desktop 1280

Dua kolom: form 7/12 kiri, ringkasan 5/12 kanan (sticky, top 88px).

Urutan form:
1. Judul halaman `Checkout` + breadcrumb “Keranjang / Checkout”.
2. Kartu **Kontak & penerima**: Nama penerima, Nomor WhatsApp, Email.
3. Kartu **Alamat pengiriman**: Alamat lengkap, Kota/kecamatan, Kode pos (2 kolom).
4. Kartu **Pengiriman**: info asal + berat, tombol **Cek Ongkir**, daftar opsi, gratis ongkir.
5. Kartu **Catatan** (opsional, max 500, counter).
6. Tombol **Buat Pesanan** full-width + helper “Pembayaran dipilih di langkah berikutnya.”
7. Trust note: “Pembayaran aman lewat Midtrans.” dan “Dikirim dari {asal.nama}.”

Ringkasan kanan:
- Item produk (gambar 48px, nama, varian, qty, line total), subtotal, diskon, ongkir, total.
- Sebelum kurir dipilih: ongkir **“Belum dipilih”**, total **“Subtotal”**, helper “Ongkir
  ditambahkan setelah kurir dipilih.”
- Setelah dipilih: ongkir `RpX` atau chip **GRATIS ONGKIR**; total final.
- Jika `gratis.aktif` dan `gratis.terpenuhi`: tampilkan “Gratis ongkir reguler aktif.”
- Jika belum memenuhi: “Tambah RpX lagi untuk gratis ongkir reguler.” (hanya jika `gratis.aktif`).
- Jika memilih non-reguler: “Layanan ini tidak termasuk gratis ongkir.” (bukan error merah).

Mobile 360:
- Form satu kolom; ringkasan **di atas tombol Buat Pesanan** (setelah catatan), bukan di atas form.
- Tombol submit full-width 48px; total terlihat tepat sebelum tombol.
- Tidak ada sticky bottom bar ganda; ringkasan tidak sticky di mobile.
- Field kota/kode pos tetap 2 kolom bila ruang cukup (≥360 dengan font 14); jika tidak, satu kolom.

Tablet 768: form 7/12 + summary 5/12; kartu alamat 2 kolom; shipping cards 2 kolom.

### 6.3 Field dan validasi

| Field | Label | Aturan tampilan | Pesan galat (server) |
|---|---|---|---|
| `customer_name` | Nama penerima | Wajib; autocomplete `name`; max 100 | `Nama penerima wajib diisi.` |
| `customer_phone` | Nomor WhatsApp | Wajib; inputmode tel; contoh `0812…`; helper format | `Nomor WhatsApp tidak valid.` |
| `customer_email` | Email | Wajib; type email; autocomplete email | `Email tidak valid.` |
| `customer_address` | Alamat lengkap | Wajib; textarea 3 baris; max 500; autocomplete street-address | `Alamat lengkap wajib diisi.` |
| `customer_city` | Kota/kecamatan | Wajib; max 100; autocomplete address-level2 | `Kota/kecamatan wajib diisi.` |
| `customer_postal_code` | Kode pos | Wajib; inputmode numeric; 5 digit; autocomplete postal-code | `Kode pos harus 5 angka.` |
| `shipping_courier` | — | Disimpan sebagai hidden/selected, bukan input terlihat | `Pilih kurir pengiriman.` |
| `shipping_service` | — | Idem | `Pilih layanan pengiriman.` |
| `shipping_cost` | — | Dikirim dari opsi; 0 bila gratis | `Ongkir berubah, pilih ulang kurir.` |
| `catatan` | Catatan (opsional) | Max 500; counter; textarea | Pesan server bila ada |

Aturan:
- Semua field wajib ditandai `*` dan `aria-required`; jangan hanya placeholder.
- Error inline di bawah field + border `danger`; ringkasan error di atas form setelah submit.
- Setelah submit gagal, fokus ke field invalid pertama; jika error global, fokus ke ringkasan.
- Jangan menghapus nilai saat pindah fokus atau saat Cek Ongkir.
- `customer_phone` menerima `+62`, `62`, `0`; jangan memaksa format saat mengetik, normalisasi saat
  submit.
- Kode pos berubah setelah opsi tampil → tandai opsi **kedaluwarsa**, kosongkan pilihan, minta
  Cek Ongkir ulang; jangan mengirim tarif lama.

### 6.4 Cek Ongkir — state lengkap

Sumber data: `GET /checkout/ongkir?postal_code=...` (auth, rate limit 30/menit).
Prop awal `pengiriman`: `mode`, `key_terisi`, `tarif_uji`, `berat_gram`, `gratis`, `asal`, `galat`.

Alur:
1. Tombol **Cek Ongkir** aktif jika kode pos 5 digit dan `pengiriman.galat` null.
2. Klik → tombol loading “Mengecek ongkir…”, disabled; field alamat tetap bisa dibaca.
3. Respons sukses → daftar opsi; pilih satu.
4. Kode pos/alamat berubah → daftar lama ditandai “Kode pos berubah. Cek ongkir lagi.”; pilihan
   dikosongkan; total kembali ke subtotal.
5. Submit hanya aktif setelah satu opsi dipilih (mode API). Mode fake juga memilih opsi eksplisit.

| State | Tampilan |
|---|---|
| Awal | Tombol Cek Ongkir; helper “Masukkan kode pos untuk melihat layanan.”; belum ada radio |
| Loading | Skeleton 2 baris opsi (lingkaran radio + 2 baris teks); `aria-busy`; max 10 detik |
| Timeout >10 detik | Hentikan loading; `InlineNotice` error “Ongkir belum bisa dihitung.” + tombol **Coba Lagi** |
| Sukses | Radio group; urut server; label, ETD, harga; badge gratis bila `opsi.gratis` |
| Sukses tapi kosong | “Belum ada layanan aktif untuk kode pos ini. Hubungi penjual.”; submit disabled |
| `galat` terisi | Tampilkan kalimat `galat` apa adanya; `opsi=[]`; tombol Coba Lagi; submit disabled |
| `pengiriman.galat` (konfigurasi) | Notice error sebelum form; Cek Ongkir disabled; submit disabled; arahkan hubungi penjual |
| Kode pos invalid | Error field; tidak memanggil API; opsi lama dibersihkan |
| Rate limit/422 | Tampilkan pesan server; pertahankan input; jangan retry otomatis |
| Mode fake | Badge **Tarif uji** di samping judul opsi; `tarif_uji` helper; opsi tetap radio |
| Mode API | Badge “Tarif Biteship”; info “Dikirim dari {asal.nama} ({asal.kode_pos})” |

Aturan teknis:
- Gunakan `AbortController`; respons lama tidak boleh menimpa respons baru.
- Jangan memanggil API saat mengetik setiap karakter; hanya lewat tombol Cek Ongkir.
- Jangan menyimpan tarif di localStorage.
- Jika `pengiriman.galat` terisi, jangan menampilkan opsi tebakan.

### 6.5 Opsi kurir dan gratis ongkir

Setiap opsi (kartu radio, bukan dropdown):
- Baris 1: `label` (mis. **JNE REG**) + badge **REGULER** bila `is_regular`; badge **GRATIS
  ONGKIR** bila `opsi.gratis`.
- Baris 2: `etd` (“2–3 hari”) atau “Estimasi tidak tersedia” bila null.
- Baris 3: harga; jika gratis: harga asli `text-meta line-through` + **Rp0** + “Hemat Rp18.000”.
- Seluruh kartu dapat diklik; radio asli tetap fokusabel; `fieldset` + `legend`
  “Pilih layanan pengiriman”.
- Selected: border `brand` 2px + latar `brand-50`; focus ring aksen; jangan hanya warna.
- Di mobile, kartu full-width; jangan membuat tabel horizontal.

Aturan gratis:
- `opsi.gratis = true` hanya bila `gratis.terpenuhi` dan `is_regular`.
- Jika gratis: kirim `shipping_cost = 0`; tampilkan total tanpa ongkir.
- Jika subtotal ≥ min tetapi opsi non-reguler: **tidak gratis**; tampilkan tarif penuh dan helper
  “Layanan ini tidak termasuk gratis ongkir.”
- Jika subtotal < min: tampilkan sisa belanja; jangan menawarkan gratis pada opsi non-reguler.
- Jangan menghitung ulang gratis di klien berdasarkan harga; percaya `opsi.gratis` dari server.
- Diskon produk tidak mengubah syarat; syarat dari subtotal sebelum ongkir.

### 6.6 Submit dan error tarif berubah

Tombol **Buat Pesanan**:
- Disabled jika: form belum lengkap secara nyata, belum memilih opsi, `pengiriman.galat`, atau
  sedang submit.
- Loading label “Membuat pesanan…”; kunci tombol dan field; jangan sampai double order.
- Jika server membalas `flash.error` **“Ongkir berubah, pilih ulang kurir.”**:
  - Tampilkan error di atas daftar opsi.
  - Kosongkan pilihan, total kembali ke subtotal.
  - Fokus ke tombol **Cek Ongkir**; jangan membuat order kedua.
- Jika server membalas error validasi: pertahankan semua nilai; tampilkan inline; fokus field pertama.
- Jika keranjang kosong (422): tampilkan `EmptyState` + CTA ke produk; jangan form kosong.
- Jika sukses: redirect ke `/checkout/{order}/bayar`; jangan menampilkan halaman sukses palsu di
  checkout.

### 6.7 A11y dan responsif

- Setiap input punya `<label>`; placeholder bukan label.
- `aria-describedby` untuk helper/error; `aria-invalid` saat error.
- Radio group memakai `fieldset`/`legend`; panah keyboard berpindah opsi; `Space` memilih.
- Ringkasan error `role="alert"`; perubahan total `aria-live="polite"`.
- Jangan mematikan zoom; font input ≥16px di mobile untuk mencegah zoom iOS.
- Tidak ada horizontal scroll pada 360px; tabel/opsi tidak `overflow-x` halaman.
- Fokus setelah Cek Ongkir sukses: ke legend “Pilih layanan pengiriman” atau opsi pertama.

---

## 7. Halaman bayar `/checkout/{order}/bayar` (D1)

### 7.1 Tujuan dan layout

Menampilkan tagihan, status, dan satu aksi jelas menuju Snap. Pembayaran dipilih di halaman Snap
milik Midtrans; halaman ini tidak menampilkan daftar bank/QRIS sendiri.

Desktop 1280 (12 kolom):
- Kiri 7/12: H1 **“Selesaikan Pembayaran”**, kode pesanan, badge status, panel status/aksi,
  countdown, notice mode uji bila fake.
- Kanan 5/12: ringkasan pesanan (item, subtotal, ongkir, total), alamat pengiriman, metode
  pembayaran bila sudah diketahui (`pembayaran.type_label`; fallback “Midtrans”).
- Mobile 360: status panel dulu, ringkasan di bawah; CTA full-width; total terlihat sebelum CTA
  bila memungkinkan.

Header:
- H1 + `pesanan.code` (`text-meta`, monospace/tabular).
- Badge status: `pending` → “Menunggu pembayaran” (warning); `settlement` → “Pembayaran diterima”
  (success); `expire` → “Kedaluwarsa” (neutral); `deny` → “Ditolak” (danger); `cancel` →
  “Dibatalkan” (neutral).
- Jika `pembayaran.expires_at` ada dan status pending: “Bayar sebelum 24 Okt 2026, 14.20” +
  countdown; setelah lewat, ubah ke “Kedaluwarsa” tanpa menunggu server.

### 7.2 Mode asli — Snap redirect

Panel pending:
- Ikon/ilustrasi netral (bukan logo bank tertentu).
- Judul “Pilih metode pembayaran yang tersedia.”
- Body: “Anda akan diarahkan ke halaman aman Midtrans. Metode yang tampil mengikuti yang aktif di
  akun penjual.”
- Tombol primer: **“Pilih Metode Pembayaran”** (teks persis; bukan “Bayar Sekarang”).
- Di bawah: “Setelah membayar, kembali ke halaman ini. Status diperbarui otomatis.”
- Tidak ada QR code, logo bank, atau daftar kanal hard-coded.

Aksi:
- Klik → `window.location.assign(pembayaran.snap_redirect_url)` (tab sama), setelah menyimpan
  penanda sesi “baru kembali dari Snap” bila diperlukan.
- Jangan membuka popup, iframe, atau `snap.js`; jangan mengirim client key.
- Jika `snap_redirect_url` null/kosong: tombol disabled + notice error “Pembayaran belum bisa
  dibuka.” + “Muat ulang”; jangan beralih ke fake.
- Jika `pembayaran.galat` terisi: tombol disabled; tampilkan galat (lihat 7.5).

State kembali dari Snap:
- Halaman dimuat ulang; status mungkin masih `pending`.
- Tampilkan notice info **“Kami memeriksa status pembayaran…”** dengan spinner 16px selama maksimal
  10 detik pertama; polling 5 detik.
- Setelah status final (`settlement`/`expire`/`deny`/`cancel`), hentikan polling dan ganti notice.
- Jika masih pending setelah 10 detik: notice netral “Pembayaran belum terdeteksi. Jika sudah
  membayar, tunggu beberapa saat.” + tombol **“Periksa Status”**; CTA Snap tetap tersedia bila
  belum kedaluwarsa.
- Jangan menampilkan error merah hanya karena kembali dari Snap; pending bukan kegagalan.

### 7.3 Mode uji — panel simulasi

Jika `pembayaran.fake = true` (atau `midtrans.fake = true`):
- Notice warning persisten di atas panel:
  **“Mode uji: pembayaran disimulasikan. Jangan gunakan untuk pesanan nyata.”**
- Tampilkan `QrisPanel` existing dengan `qr_string`/`qris_url` dummy; label “QRIS uji”.
- Tombol **“Simulasikan pembayaran berhasil”** (teks persis) → `POST
  /checkout/{order}/simulasi-bayar`; loading “Menandai lunas…”; disabled saat proses.
- Jangan menampilkan tombol Snap redirect di mode fake; jangan menampilkan QRIS sebagai satu-satunya
  metode nyata.
- Jika endpoint gagal: `flash.error` ditampilkan; status tetap pending; tombol bisa dicoba lagi.
- Jika berhasil: redirect ke halaman bayar dengan status `settlement`; tampilkan panel lunas.

### 7.4 Status final

| Status | Panel | Aksi |
|---|---|---|
| `settlement` / `pesanan.status = dibayar` | Ikon sukses; “Pembayaran diterima.”; total; `paid_at`; metode `type_label` fallback “Midtrans” | CTA “Lihat Pesanan” ke `/checkout/{order}/selesai`; tautan “Belanja Lagi” |
| `expire` | Ikon netral; “Pembayaran kedaluwarsa.”; jelaskan stok dilepas | “Kembali ke Keranjang” (bila item masih ada) + “Hubungi Penjual”; jangan tombol bayar |
| `deny` | Ikon danger; “Pembayaran ditolak.”; jangan menyalahkan pembeli | “Hubungi Penjual”; tidak ada retry otomatis |
| `cancel` | Ikon netral; “Pembayaran dibatalkan.” | “Hubungi Penjual”; tidak ada tombol bayar |
| `pending` | Panel pending + CTA | CTA Snap / simulasi |

Aturan:
- Jika sudah `settlement`, jangan pernah menampilkan tombol bayar/simulasi.
- Jangan menampilkan “Pembayaran berhasil” berdasarkan query string atau klik pengguna; hanya
  status server.
- `payment_type` mentah tidak ditampilkan; gunakan `type_label`; fallback “Midtrans” bila null.
- Jangan menampilkan “QRIS” untuk bank transfer. Jangan menampilkan “Transfer Bank” bila tipe
  `qris`.

### 7.5 Galat pembayaran (D1)

Sumber utama: `pembayaran.galat` (kalimat siap tampil). Prioritaskan pesan server.

| Kondisi pesan | Judul panel | Body | Aksi |
|---|---|---|---|
| Mengandung “kanal pembayaran belum aktif” / “payment channel is not activated” | **“Metode pembayaran belum aktif”** | “Penjual perlu mengaktifkan kanal pembayaran di akun Midtrans. Hubungi penjual bila perlu.” | “Hubungi Penjual”; **jangan** “Coba Lagi” |
| Galat umum / gagal membuat pembayaran | **“Pembayaran belum bisa dibuka”** | Tampilkan `pembayaran.galat` apa adanya + “Coba muat ulang halaman.” | “Muat Ulang”; jangan fake fallback |
| `snap_redirect_url` kosong, `galat` null | **“Pembayaran belum siap”** | “Tautan pembayaran belum tersedia. Coba muat ulang atau hubungi penjual.” | “Muat Ulang” + “Hubungi Penjual” |

Catatan:
- Jangan menampilkan `midtrans.server_key_terisi`, `sumber_kredensial`, `catatan`, atau
  `langkah_perbaikan` di halaman publik; itu informasi pemilik/admin.
- Jangan menampilkan pesan teknis mentah (“402”, “acquirer”, “server key kosong”) ke pembeli.
- Jika `midtrans.mode = "uji"` tetapi `pembayaran.fake = false` (tagihan lama), ikuti
  `pembayaran.fake`; server akan membuat ulang tagihan nyata bila memungkinkan. Jika gagal,
  tampilkan galat umum; jangan beralih ke panel simulasi.

### 7.6 Polling, loading, dan error

- Polling `GET /checkout/{order}/status` setiap 5 detik hanya saat `pending`; berhenti pada status
  final.
- Jangan menumpuk request; gunakan `setTimeout` setelah respons, bukan `setInterval`.
- Hentikan polling saat tab `hidden`; lanjutkan saat `visible` dengan satu request langsung.
- Gagal polling: pertahankan status terakhir; setelah 3 kegagalan, tampilkan helper
  “Status belum diperbarui.” + “Periksa Status”; jangan toast berulang.
- Loading awal: skeleton panel status + ringkasan; jangan menampilkan tombol aktif sebelum props
  siap.
- Perubahan status diumumkan `aria-live="polite"`; jangan memindahkan fokus otomatis kecuali
  pertama kali status final.
- Countdown memakai waktu server (`expires_at`), bukan jam perangkat; jika selisih >2 menit,
  percayai server.

---

## 8. Admin `/admin/ekspedisi` (D4)

### 8.1 Navigasi dan layout

- Menu sidebar: tambahkan **Ekspedisi** setelah **Pesanan**, sebelum **Pesan**; ikon `TruckIcon`.
- Route: `GET /admin/ekspedisi`, `PUT /admin/ekspedisi`; middleware admin existing.
- Halaman memakai `AdminLayout`, `PageHeader` (judul “Ekspedisi”, deskripsi singkat), container
  admin existing.
- Desktop: dua kartu atas — **Asal pengiriman** (7/12) dan **Gratis ongkir** (5/12); kartu bawah
  **Layanan kurir** full width.
- Tablet/mobile: satu kolom; kartu tetap berurutan.
- Tombol simpan sticky bawah memakai pola `StickySave`: “Simpan ekspedisi”; status “Perubahan
  belum disimpan.” / “Tidak ada perubahan.”

Header status:
- Badge mode: **API Biteship** (success) bila `kurir.mode = "api"`; **Tarif uji** (warning) bila
  `"fake"`.
- Teks kunci: “Kunci Biteship terisi” / “Kunci Biteship kosong” berdasarkan `kurir.key_terisi`;
  **jangan** pernah menampilkan nilai kunci.
- Jika `kurir.sumber = "settings"`: helper “Daftar dari pengaturan tersimpan; API belum tersedia.”
- Jika `kurir.galat`: `InlineNotice` warning berisi kalimat galat + “Data lama tetap bisa disimpan.”

### 8.2 Kartu asal pengiriman

Field:
| Field | Label | Aturan |
|---|---|---|
| `shipping_origin_name` | Nama pengirim | Wajib, max 100; contoh “Toko Kulot” |
| `shipping_origin_phone` | Nomor telepon pengirim | Wajib, max 30; inputmode tel |
| `shipping_origin_address` | Alamat asal | Wajib, textarea, max 500 |
| `shipping_origin_postal_code` | Kode pos asal | Wajib, 5 digit, inputmode numeric |

Layout: nama + telepon 2 kolom di desktop; alamat full width; kode pos 1/3 lebar.
Helper: “Dipakai sebagai titik asal perhitungan ongkir Biteship.”
Error inline sesuai pesan kontrak; jangan reset field.

### 8.3 Kartu gratis ongkir

- Toggle/checkbox **Aktifkan gratis ongkir** (`free_shipping_enabled`).
- Input nominal **Minimal belanja** (`free_shipping_min`), prefix `Rp`, format ribuan saat blur;
  nilai integer; min 0, max 100.000.000.
- Helper: “Hanya untuk layanan reguler. Dihitung dari subtotal sebelum ongkir.”
- Jika nonaktif: input nominal disabled + helper “Gratis ongkir tidak aktif.”
- Jika aktif dan nominal 0: warning “Semua pesanan dengan layanan reguler akan gratis ongkir.”
  (bukan error; konfirmasi visual).
- Jika aktif dan tidak ada layanan `is_regular` aktif: warning “Tidak ada layanan reguler aktif;
  gratis ongkir tidak akan pernah berlaku.”
- Perubahan toggle harus menandai form dirty; jangan auto-save.

### 8.4 Kartu layanan kurir

Sumber: `kurir.daftar[]` `{courier_code, courier_name, service_code, service_name, label,
is_regular, is_active}`. Daftar sudah urut server.

Desktop table:
| Kolom | Isi |
|---|---|
| Aktif | Checkbox 44px; label aksesibel “Aktifkan JNE REG” |
| Kurir | `courier_name` / kode kecil |
| Layanan | `service_name` / `service_code` |
| Label | `label` (bisa diedit? tidak; label dari server) |
| Reguler | Checkbox “Reguler” (boleh gratis ongkir) |
| Status | Badge “Aktif” / “Nonaktif” (teks, bukan warna saja) |

- Baris nonaktif tetap terlihat, tidak dihapus. Jangan menyembunyikan layanan nonaktif.
- Header tabel sticky di dalam card; card `overflow-x-auto` di tablet; jangan membuat halaman
  horizontal scroll.
- Mobile 360: tabel berubah menjadi daftar kartu per layanan; checkbox “Aktif” dan “Reguler” di
  baris bawah; kode layanan `text-meta`.
- Search/filter di toolbar: “Cari kurir atau layanan” (client-side); hasil kosong “Tidak ada
  layanan yang cocok.”; jangan mengosongkan pilihan.
- Tombol **Muat ulang daftar** (jika disediakan) memanggil server; loading kecil di tombol; data
  lama tetap tampil sampai respons baru.
- Jangan mengaktifkan semua layanan otomatis. Jangan mengubah `is_regular` otomatis berdasarkan
  nama layanan; itu keputusan admin (default dari server).

Empty:
- `daftar=[]` dan `galat=null`: `EmptyState` “Belum ada layanan kurir.” + form manual.
- `galat` terisi: error notice + form manual; data lama (jika ada) tetap tampil.
- Form manual tetap tersedia saat API gagal (PRD D4).

### 8.5 Tambah layanan manual

- Tombol **Tambah kode manual** membuka baris form di bawah tabel (bukan modal).
- Field **Kode layanan** placeholder `jne:reg` (format `courier_code:service_code`), wajib.
- Field **Label** opsional, max 80; jika kosong, tampilkan uppercase kode (mis. “JNE REG”).
- Checkbox **Reguler** default aktif; checkbox **Aktif** default aktif.
- Tombol **Tambahkan**; validasi format: dua bagian, tanpa spasi, masing-masing 1–40/60 karakter.
- Duplikat `courier_code + service_code` ditolak dengan inline error “Layanan sudah ada.”
- Setelah ditambah, baris muncul di daftar dan form dirty; belum tersimpan sampai **Simpan
  ekspedisi**.
- Batal menutup form tanpa mengubah daftar.
- Jangan menebak nama kurir dari kode; tampilkan kode apa adanya.

### 8.6 Simpan, validasi, dan state

| State | Perilaku |
|---|---|
| Loading awal | Skeleton kartu asal + 3 baris tabel; tidak ada form kosong berkedip |
| Dirty | StickySave aktif; “Perubahan belum disimpan.” |
| Saving | Tombol loading; field/checkbox disabled; cegah submit ganda |
| Sukses | Toast “Ekspedisi disimpan.”; dirty false; nilai server dipertahankan |
| Gagal validasi | Error inline; fokus field pertama; data lain tidak hilang |
| Gagal server | `InlineNotice` error di atas kartu; tombol simpan aktif lagi; data form tetap |
| API daftar gagal | Warning + form manual; data lama tetap; simpan tetap boleh |
| Tidak ada kurir aktif | Warning di kartu gratis + helper checkout akan menolak; jangan blokir simpan |

Validasi mengikuti kontrak §10.13; jangan mengandalkan validasi klien saja. Semua field wajib
ditandai; error dari server ditampilkan apa adanya.

A11y:
- Checkbox punya label eksplisit per baris, bukan “Aktif” berulang tanpa konteks.
- Tabel memakai `<caption class="sr-only">Daftar layanan kurir</caption>`.
- Perubahan mode/badge diumumkan `aria-live="polite"` setelah simpan.
- Fokus setelah simpan kembali ke tombol simpan atau heading halaman; jangan ke body.

---

## 9. Admin galeri di tab Landing (`/admin/pengaturan`) (D6)

### 9.1 Penempatan

- Tab **Landing** existing; tambahkan kartu **Galeri landing** setelah kartu CTA/newsletter,
  sebelum StickySave.
- Satu form dengan landing; tombol existing **“Simpan konten landing”** menyimpan galeri juga.
  Jangan membuat tombol simpan terpisah.
- Card header: judul “Galeri landing”, helper “Tampil di beranda setelah produk unggulan.
  Maksimal 8 gambar; urutan ini yang tampil.” + badge jumlah `3/8`.

### 9.2 Layout kartu

Desktop:
- Daftar vertikal, tiap item satu baris kartu: thumb 80×100 (`aspect-portrait`) di kiri; kolom
  caption + alt di tengah; kontrol urutan/hapus di kanan.
- Di atas daftar: tombol dashed **Tambah gambar** (44px) + helper format.
- Di bawah daftar: tombol **Tambah gambar** jika belum maksimal; jika maksimal, teks “Batas 8
  gambar tercapai.”
- Thumb memakai fallback `Thumb` existing: blok netral + ikon bila gambar gagal; jangan
  menampilkan broken image.
- Jika ada 8 item, tombol tambah disabled dan helper “Hapus salah satu untuk menambah.”

Mobile 360:
- Satu kartu per gambar; thumb 64×80 di kiri atas, caption/alt full width di bawah; kontrol
  urutan/hapus sebagai tombol teks 44px.
- Jangan membuat tabel atau horizontal scroll.
- Input caption/alt full width; font ≥16px.

### 9.3 Item dan kontrol

Setiap item:
1. **Thumb** (gambar existing atau preview file baru). Urutan nomor `01`, `02`, … di atas thumb.
2. **Caption** — input teks, max 80, counter “0/80”; helper “Tampil di bawah gambar. Boleh kosong.”
3. **Alt** — input teks, max 120, counter; helper “Deskripsi untuk pembaca layar. Kosongkan bila
   dekoratif.”
4. **Naikkan** / **Turunkan** — tombol 44px, label “Naikkan gambar 2”; disabled di ujung; mengubah
   urutan array dan fokus tetap pada tombol yang sama setelah render.
5. **Hapus** — tombol danger; menandai item “Akan dihapus saat simpan.” dengan tombol **Batalkan**.
   Jangan langsung menghapus dari server sebelum simpan; jangan meminta konfirmasi modal bila undo
   tersedia.
6. **Ganti gambar** — input file tersembunyi dengan label; preview baru; gambar lama tetap sampai
   simpan berhasil.

Upload:
- Tombol **Tambah gambar** membuka file picker (`accept="image/jpeg,image/png,image/webp"`).
- Bisa pilih beberapa file sekaligus; setiap file menjadi item baru di akhir daftar.
- Validasi klien: tipe, ≤2MB, maksimal total 8. Pesan per file:
  “Format harus JPG, PNG, atau WebP.” / “Ukuran maksimal 2 MB.” / “Maksimal 8 gambar.”
- Preview memakai object URL; revoke saat item dihapus/unmount.
- Progress per file (opsional; jika ada, jangan menutupi seluruh kartu).
- Upload sebenarnya terjadi saat submit form; jangan mengunggah langsung tanpa simpan kecuali
  pola existing memang begitu. Jika existing mengunggah langsung, pertahankan pola dan jelaskan
  status “Terunggah, belum disimpan” pada item.
- Jangan mengarang nama file; tampilkan nama asli atau “Gambar baru”.

Reorder:
- Tombol naik/turun adalah kontrol utama (aksesibel, tanpa drag).
- Drag-and-drop opsional; jika ditambahkan, jangan menggantikan tombol. Jangan memakai library baru.
- Urutan visual = urutan array = urutan tampil di beranda.
- Setelah reorder, item yang dipindah tetap fokus; umumkan “Gambar dipindah ke posisi 2.”

### 9.4 State lengkap

| State | Tampilan |
|---|---|
| Kosong | `EmptyState` “Belum ada gambar galeri.” + “Tambah gambar”; helper “Seksi galeri disembunyikan di beranda sampai ada gambar.” |
| Ada 1–3 | Daftar + helper “Tambahkan minimal 4 gambar agar komposisi galeri rapi.” (bukan error) |
| Ada 4–8 | Daftar + badge jumlah; tambah aktif sampai 8 |
| Maksimal 8 | Tombol tambah disabled; helper batas |
| Upload invalid | Error di bawah tombol/file; item tidak ditambahkan; file lain tetap |
| Upload valid | Preview muncul di akhir; form dirty; belum tersimpan |
| Menghapus | Item diberi state “Akan dihapus”; tombol Batalkan; jumlah badge berkurang secara visual |
| Menyimpan | Semua kontrol disabled; tombol landing loading; jangan izinkan reorder saat proses |
| Sukses | Toast “Konten landing disimpan.”; gambar baru tampil di beranda setelah reload |
| Gagal server | Error banner di atas kartu; item dan urutan dipertahankan; jangan menghapus preview |
| Gambar 404 | Fallback blok netral + “Gambar tidak tersedia”; alt tetap; tombol ganti/hapus tetap |

Aturan data:
- Kirim `landing_gallery` array berurutan; setiap item `{image, caption, alt}`.
- Jika semua item dihapus, kirim `landing_gallery_present=1` + array kosong agar server menghapus
  semua; tanpa penanda, galeri lama tidak berubah.
- Item existing yang tidak diganti mengirim path `image` lama; jangan mengosongkan path.
- Jangan mengirim `alt` berisi caption otomatis; biarkan kosong jika admin tidak mengisi.
- Client validation tidak menggantikan validasi server; tampilkan error server per field bila ada.

A11y:
- Setiap input punya label unik “Caption gambar 2”, “Alt gambar 2”; jangan hanya “Caption”.
- Tombol ikon punya `aria-label`; status “Akan dihapus” diumumkan `aria-live`.
- File input dapat dioperasikan keyboard; label terlihat.
- Fokus setelah tambah ke item baru (caption), setelah hapus ke tombol tambah atau item berikutnya.

---

## 10. Matriks responsif

| Layar | 360px | 768px | 1280px |
|---|---|---|---|
| Landing trust | 2 kolom; item ganjil full row; teks 13–14px | 3 kolom × 2 baris | 6 kolom; pemisah vertikal |
| Landing galeri | 1 kolom (1–3); 2 kolom (4–8); caption 13px | 2 kolom; tile utama span 2 | 12 kolom asimetris; 4–8 tile |
| Landing why-us | 1 kolom; statement 40px; gambar di antara statement/daftar | 2 kolom; statement full width | 5/7; statement 72px; gambar 2 |
| Landing CTA | teks di atas; tombol full width | 2 kolom | 7/5; panel padding 48px |
| Keranjang | ringkasan di bawah item; 1 kolom | ringkasan kanan 5/12 | ringkasan kanan 5/12 sticky |
| Checkout | 1 kolom; ringkasan sebelum submit; input ≥16px | 7/5; alamat 2 kolom | 7/5; ringkasan sticky |
| Checkout opsi | kartu full width; tidak ada tabel | 2 kolom kartu | 2 kolom kartu; harga rata kanan |
| Pembayaran | status dulu; ringkasan di bawah; CTA full width | 7/5 | 7/5; ringkasan sticky |
| Admin ekspedisi | 1 kolom; tabel → kartu; checkbox 44px | 1 kolom; tabel scroll dalam card | 7/5 atas; tabel full |
| Admin galeri | 1 kartu per gambar; kontrol teks | 1 kolom lebar; thumb 80×100 | baris horizontal; thumb 80×100 |

Aturan global:
- Tidak ada horizontal scroll halaman pada 360/768/1280. Tabel hanya scroll di dalam card.
- Tidak ada teks terpotong tanpa ellipsis/tooltip; nominal tidak pernah terpotong.
- Touch target ≥44px; jarak antar kontrol ≥8px.
- Breakpoint mengikuti Tailwind existing (`sm` 640, `md` 768, `lg` 1024, `xl` 1280); jangan
  menambah breakpoint baru.

---

## 11. Aksesibilitas dan motion

- Landmark: `header`, `nav`, `main`, `footer` existing; tiap seksi landing punya `aria-labelledby`
  ke heading-nya.
- Heading hierarchy: satu `h1` per halaman; landing hero `h1`; seksi `h2`; kartu `h3`. Jangan
  melompat dari h1 ke h3.
- Fokus terlihat: `focus-visible:ring-2 ring-accent ring-offset-2`; jangan `outline: none` tanpa
  pengganti.
- Keyboard: seluruh tombol/radio/checkbox/tautan dapat dioperasikan `Tab`, `Shift+Tab`, `Enter`,
  `Space`, panah untuk radio.
- `prefers-reduced-motion`: reveal, hover scale, underline transition dimatikan; konten langsung
  terlihat.
- Gambar: `alt` dari data; dekoratif `alt=""`; jangan mengulang caption persis di alt.
- Error: teks + ikon, bukan warna saja; `aria-invalid` + `aria-describedby`.
- Countdown: jangan mengumumkan setiap detik; umumkan saat 5 menit, 1 menit, dan habis.
- Bahasa halaman `id`; label/error berbahasa Indonesia konsisten.
- Kontras mengikuti tabel §2.3; QA wajib mengukur ulang jika warna berubah.

---

## 12. Checklist uji QA

Gunakan ID ini di laporan QA. Semua skenario wajib diuji di 360, 768, 1280 kecuali disebut lain.

### 12.1 Landing

| ID | Skenario | Hasil yang diharapkan |
|---|---|---|
| QA-L1 | Buka `/` 360/768/1280 | Tidak ada horizontal scroll; urutan seksi sesuai §4.1 |
| QA-L2 | `trust_strip` 0/1/6 item | 0 → seksi hilang; 6 → 6 kolom desktop, 3 tablet, 2 mobile; bukan baris ikon datar |
| QA-L3 | `landing_gallery` kosong | Seksi galeri hilang total; tidak ada heading kosong |
| QA-L4 | Galeri 1, 4, 6, 8 gambar | Semua gambar tampil; komposisi asimetris; tidak ada tile kosong; caption/urutan benar |
| QA-L5 | Caption 80 karakter, alt 120, caption kosong | Caption 2 baris ellipsis; alt kosong → dekoratif; baris caption kosong hilang |
| QA-L6 | Gambar galeri 404 | Fallback netral + “Gambar tidak tersedia”; layout tidak bergeser |
| QA-L7 | Scroll ke galeri/why-us | Gambar lazy; reveal hanya sekali; tidak ada CLS besar |
| QA-L8 | `prefers-reduced-motion` aktif | Semua konten langsung terlihat; tidak ada transform/transisi |
| QA-L9 | JavaScript gagal/IntersectionObserver tidak ada | Konten tetap terlihat; tidak ada halaman kosong |
| QA-L10 | Why-us 3 item dan 6 item | Layout asimetris, bukan 3 kartu datar; gambar dari galeri; tidak ada field gambar baru |
| QA-L11 | CTA newsletter | Kalimat gratis ongkir persis; tombol existing; edit dari tab Landing tercermin setelah simpan |
| QA-L12 | Keyboard trust/galeri/CTA | Fokus terlihat; urutan logis; tidak ada kontrol ikon tanpa label |

### 12.2 Keranjang dan checkout

| ID | Skenario | Hasil yang diharapkan |
|---|---|---|
| QA-C1 | Mode API, subtotal berapa pun | Ongkir “Dihitung saat checkout”; label total “Subtotal”; helper benar |
| QA-C2 | Mode fake | Ongkir nominal + badge Tarif uji; total termasuk ongkir |
| QA-C3 | Kode pos 4/6 digit/alfabet | Error “Kode pos harus 5 angka.”; API tidak dipanggil; opsi lama hilang |
| QA-C4 | Kode pos valid, klik Cek Ongkir | Loading, lalu opsi dengan label/ETD/harga; tidak ada spinner abadi |
| QA-C5 | API >10 detik | Loading berhenti; error + Coba Lagi; submit disabled |
| QA-C6 | API `galat` / `opsi=[]` | Kalimat galat tampil; tidak ada order; submit disabled |
| QA-C7 | Ubah kode pos setelah opsi tampil | Opsi ditandai kedaluwarsa; pilihan kosong; wajib Cek Ongkir ulang |
| QA-C8 | Pilih opsi reguler, subtotal ≥300.000 | Badge GRATIS ONGKIR; total ongkir 0; `shipping_cost` 0 |
| QA-C9 | Subtotal 299.999 | Tidak gratis; sisa belanja tampil; tarif normal |
| QA-C10 | Subtotal ≥300.000, pilih instant/non-reguler | Tidak gratis; helper “Layanan ini tidak termasuk gratis ongkir.” |
| QA-C11 | Submit tanpa memilih opsi | Submit disabled/validasi; tidak ada order |
| QA-C12 | Server menolak “Ongkir berubah…” | Error tampil; pilihan kosong; tidak ada order; fokus ke Cek Ongkir |
| QA-C13 | Double click Buat Pesanan | Hanya satu request/order; tombol disabled saat proses |
| QA-C14 | Error validasi field | Nilai tidak hilang; error inline; fokus field pertama |
| QA-C15 | Keyboard radio/field | Radio group dapat panah/space; label terbaca; error terkait |
| QA-C16 | 360px | Ringkasan sebelum tombol; tidak ada scroll horizontal; input ≥16px |

### 12.3 Pembayaran

| ID | Skenario | Hasil yang diharapkan |
|---|---|---|
| QA-P1 | Mode asli, pending | Tombol **Pilih Metode Pembayaran**; tidak ada QR/daftar bank hard-coded |
| QA-P2 | Klik tombol Snap | Redirect ke `snap_redirect_url` tab sama; tidak ada popup/client key |
| QA-P3 | Kembali dari Snap, masih pending | Notice “Kami memeriksa status pembayaran…”; polling 5 detik; bukan error merah |
| QA-P4 | Status settlement | Panel lunas; metode `type_label`/Midtrans; tidak ada tombol bayar |
| QA-P5 | Status expire/deny/cancel | Copy sesuai; tidak ada tombol bayar; ada jalur hubungi penjual |
| QA-P6 | `pembayaran.galat` kanal belum aktif | Judul “Metode pembayaran belum aktif”; **tidak** ada “Coba Lagi” |
| QA-P7 | `snap_redirect_url` null | Tombol disabled + error; tidak beralih ke fake |
| QA-P8 | Mode fake | Notice mode uji; QrisPanel; tombol **Simulasikan pembayaran berhasil** |
| QA-P9 | Fake sukses | Status settlement/dibayar; panel lunas; stok tidak berubah dua kali |
| QA-P10 | Fake endpoint gagal | Error server tampil; status tetap pending; bisa coba lagi |
| QA-P11 | Polling gagal 3× | Status terakhir dipertahankan; helper retry; tidak ada toast berulang |
| QA-P12 | Countdown lewat | Tampilan kedaluwarsa; CTA bayar hilang/disabled |
| QA-P13 | Buka halaman milik orang lain | 404 (server); tidak ada kebocoran data |
| QA-P14 | 360px | CTA full width; ringkasan terbaca; tidak ada horizontal scroll |

### 12.4 Admin ekspedisi

| ID | Skenario | Hasil yang diharapkan |
|---|---|---|
| QA-A1 | Buka `/admin/ekspedisi` | Layout, badge mode, status kunci; tidak ada nilai kunci |
| QA-A2 | Simpan tanpa nama/alamat/kode pos | Error inline sesuai kontrak; data lain tidak hilang |
| QA-A3 | Kode pos asal 4 digit | Error “Kode pos asal harus 5 angka.” |
| QA-A4 | Aktifkan gratis ongkir, min 300000 | Tersimpan; checkout gratis reguler sesuai |
| QA-A5 | Gratis ongkir aktif, min 0 | Warning semua reguler gratis; simpan tetap mungkin |
| QA-A6 | Tidak ada layanan reguler aktif | Warning; simpan tidak diblokir; checkout menampilkan tarif normal |
| QA-A7 | Toggle aktif 1 layanan | Hanya layanan itu muncul di Cek Ongkir setelah simpan |
| QA-A8 | API daftar gagal | Halaman tetap; error + form manual; data lama tampil |
| QA-A9 | Tambah manual `jne:reg` | Baris muncul; label default; validasi format/duplikat |
| QA-A10 | Simpan sukses | Toast; dirty false; nilai bertahan setelah reload |
| QA-A11 | Double submit simpan | Satu request; tombol disabled |
| QA-A12 | 360px | Tabel menjadi kartu; checkbox 44px; tidak ada scroll horizontal |

### 12.5 Admin galeri

| ID | Skenario | Hasil yang diharapkan |
|---|---|---|
| QA-G1 | Tab Landing, galeri kosong | EmptyState + tombol tambah; helper seksi tersembunyi |
| QA-G2 | Upload JPG/PNG/WebP ≤2MB | Preview muncul; item baru di akhir; form dirty |
| QA-G3 | Upload >2MB / PDF / 9 gambar | Error per file; item valid tetap; batas 8 |
| QA-G4 | Caption 81 char / alt 121 char | Dicegah/di-ellipsis + error; tidak tersimpan |
| QA-G5 | Reorder naik/turun | Urutan berubah; fokus tetap; tersimpan sesuai urutan |
| QA-G6 | Hapus satu, batalkan | Item kembali; tidak ada perubahan server sebelum simpan |
| QA-G7 | Hapus semua lalu simpan | `landing_gallery_present=1` + array kosong; galeri hilang dari `/` |
| QA-G8 | Simpan sukses | Toast; beranda menampilkan gambar baru tanpa deploy |
| QA-G9 | Server error saat simpan | Error banner; preview/urutan tidak hilang |
| QA-G10 | Gambar 404 | Fallback netral; tombol ganti/hapus tetap |
| QA-G11 | Keyboard upload/reorder/hapus | Semua kontrol terjangkau; label unik; tidak ada drag-only |
| QA-G12 | 360px | Satu kartu per gambar; tidak ada horizontal scroll |

### 12.6 Lintas layar

| ID | Skenario | Hasil yang diharapkan |
|---|---|---|
| QA-X1 | Semua layar 360/768/1280 | Tidak ada horizontal scroll; tidak ada teks terpotong liar |
| QA-X2 | Keyboard-only | Semua aksi utama dapat diselesaikan; fokus terlihat |
| QA-X3 | `prefers-reduced-motion` | Tidak ada animasi yang menghalangi; konten terlihat |
| QA-X4 | Zoom 200% | Layout tetap terbaca; tidak ada kontrol hilang |
| QA-X5 | Gambar lambat/gagal | Tidak ada layout shift besar; fallback muncul |
| QA-X6 | Error server 500/422 | Pesan di dalam layout; tidak halaman putih; data form tidak hilang |
| QA-X7 | IDOR admin/checkout | Akses tanpa hak ditolak server; UI tidak membocorkan data |
| QA-X8 | Kontras | Semua pasangan teks sesuai §2.3; tidak ada putih di accent |

---

## 13. Traceability

| PRD | Desain | Kontrak | QA |
|---|---|---|---|
| D1 semua metode Snap | §7.1–§7.6 | §7.5–§7.7, §7.13 | QA-P1–P14 |
| D1 mode fake | §7.3 | §7.7, §7.13 | QA-P8–P10 |
| D1 galat kanal | §7.5 | §7.7 (402) | QA-P6 |
| D2 Cek Ongkir | §6.4 | §7.12 | QA-C3–C7 |
| D2 pilih kurir | §6.5 | §7.6, §7.12 | QA-C8–C11 |
| D2 tarif berubah | §6.6 | §7.6 | QA-C12 |
| D2 cart summary | §5.1 | §7.0 (cart) | QA-C1–C2 |
| D3 gratis reguler | §6.5 | §7.12, §7.6 | QA-C8–C10 |
| D4 admin ekspedisi | §8 | §10.13 | QA-A1–A12 |
| D5 landing | §4 | §8 (settings) | QA-L1–L12 |
| D6 galeri admin | §9 | §2 `landing_gallery`, §10.9 | QA-G1–G12 |
| D7 CTA | §4.5 | §1 `landing_sections.newsletter` | QA-L11 |
| A19 berat 500g | §6.4 info berat | §7.12 | QA-C4 |
| A22 galeri maks 8 | §4.3, §9 | §2 | QA-G3 |
| Snap redirect | §7.2 | §7.7 | QA-P2 |

---

## 14. Asumsi dan hal yang perlu dikonfirmasi

1. **Snap redirect** adalah keputusan techlead (komentar kartu): tombol membuka
   `snap_redirect_url` di tab sama. Tidak ada popup/client key. Bila produk menghendaki popup,
   desain ini harus direvisi.
2. **Galeri 7–8** didukung meskipun PRD menyebut komposisi 4–6; A22 mengizinkan maks 8. Tidak ada
   gambar dibuang; baris tambahan dipakai.
3. **Why-us <3 item** tetap dirender tanpa placeholder; kekurangan konten dicatat QA, bukan diisi
   karangan.
4. **`pembayaran.fake`** adalah penentu panel simulasi; `midtrans.fake` hanya badge mode. Jika
   server hanya mengirim salah satu, frontend memakai `pembayaran.fake` lebih dulu.
5. **`type_label`** mungkin null sebelum settlement; fallback “Midtrans”. Jangan menampilkan kode
   mentah.
6. **`landing_gallery`** memakai path apa adanya (`/storage/...` atau `/images/seed/...`); tidak
   menambah prefix di frontend.
7. **Tidak ada field gambar why-us baru**; gambar diambil dari galeri. Jika galeri kosong, why-us
   tampil tanpa gambar.
8. **Tidak ada aset baru**; semua contoh di seeder memakai `[CONTOH]` dan pemilik mengganti lewat
   admin.
9. **Email checkout wajib** sesuai kontrak §7.6; desain tidak menghapusnya meskipun alur lama
   mungkin tidak menampilkannya.
10. **Tombol CTA newsletter** tetap memakai tujuan kontak/WA existing; D7 hanya mengikat kalimat
    gratis ongkir, bukan mengubah tujuan tombol.
11. **Copy trust strip seeder** memuat “Bayar QRIS — Semua e-wallet dan m-banking”. Ini di landing,
    bukan checkout/bayar, jadi tidak melanggar AC D1 #4, tetapi menyesatkan setelah D1 (QRIS bukan
    satu-satunya). Rekomendasi: admin mengganti judul item itu menjadi “Bayar Online” dari tab
    Landing. Desain tidak mengubah seeder; QA mencatatnya sebagai usulan copy (P4), bukan bug.

---

## 15. Serah terima

Urutan implementasi yang disarankan:
1. Token `display-xl`, `aspect-portrait`, `aspect-editorial` + komponen `Reveal`.
2. Landing: trust, galeri, why-us, CTA, lazy/reveal.
3. Keranjang: teks ongkir final/non-final + badge tarif uji.
4. Checkout: Cek Ongkir, opsi, gratis, submit/error tarif.
5. Pembayaran: Snap redirect, state kembali, fake panel, galat kanal.
6. Admin ekspedisi.
7. Galeri tab Landing.
8. QA checklist §12 di 360/768/1280; retest setelah perbaikan.

Definition of Done desain ini:
- Semua layar di PRD v1.1 §2–§6 memiliki layout, state kosong/loading/error, dan perilaku responsif.
- Token baru dan kontras terdokumentasi.
- Checklist QA dapat dieksekusi tanpa menebak copy/urutan.
- Tidak ada kode/JSX atau aset karangan di dokumen ini.

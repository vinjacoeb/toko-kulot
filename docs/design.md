# Design Specification — Toko Daster Kulot

## 1. Pendahuluan
Dokumen ini mendefinisikan standar desain untuk Toko Daster Kulot, berdasarkan duplikasi visual dari erigostore.co.id yang disesuaikan dengan kebutuhan Next.js + SASS.

## 2. Token Warna (Color Palette)
- **Primary**: `#000000` (Hitam pekat untuk teks & elemen utama)
- **Secondary**: `#ffffff` (Putih untuk latar belakang & elemen kontras)
- **Accent**: `#e8e8e8` (Abu-abu muda untuk border/pembatas)
- **Error**: `#d93025` (Merah untuk pesan kesalahan)
- **Success**: `#188038` (Hijau untuk pesan sukses)
- **Neutral**: `#f4f4f4` (Abu-abu sangat muda untuk background section)

## 3. Tipografi
- **Font Family**: 'Inter', sans-serif
- **Headings**: Bold, 600 weight
- **Body**: Regular, 400 weight
- **Sizes**:
  - H1: 32px
  - H2: 24px
  - H3: 20px
  - Body: 16px
  - Small: 14px

## 4. Spasi (Spacing)
- Sesuai dengan skala 8px:
  - 4px, 8px, 16px, 24px, 32px, 48px, 64px

## 5. Komponen Dasar
- **Tombol**: Border-radius 0px (tegas), background hitam, text putih.
- **Input**: Border 1px abu-abu, padding 12px.
- **Card Produk**: Image placeholder, title (h3), price (bold).
- **Layout**: Container max-width 1200px.

## 6. Tata Letak Per Halaman
- **Header**: Sticky, Logo kiri, Menu tengah, Icon (Search, Cart, User) kanan.
- **Footer**: Kolom info toko, navigasi cepat, newsletter, media sosial.
- **Responsive**: Mobile-first, breakpoint tablet 768px, desktop 1024px.

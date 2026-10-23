# Rencana Perbaikan Laporan Pemilik 5

Sumber: kartu `t_e2608d06` (8 keluhan pemilik). Dokumen acuan: `docs/PRD.md`, `docs/design.md`, `docs/kontrak-props.md`.
Semua kartu memakai workspace `C:\Users\LENOVO\Downloads\toko-kulot`.

## Peta keluhan -> kartu

| # | Keluhan pemilik | Akar masalah (bukti) | Kartu |
|---|---|---|---|
| 1 | Halaman `/history` sesuai user, semua status termasuk batal; ikon profil tetap, hover berisi nama, history, logout | `routes/web.php` belum punya route history; `orders.user_id` sudah ada; `OrderItem` tersedia | BE-History, FE-History |
| 2 | Lazy loading / lazy scroll di tampilan user | `/produk` masih memakai pagination tombol; `CatalogService::PER_PAGE = 12` | FE-Lazy |
| 3 | Hero section tidak tampil, landing langsung carousel | `Home.jsx` tidak merender section hero dari `landing_hero`; aset seed hero/promo/logo juga tidak ada di disk | FE-Hero (parent BE-Pengaturan) |
| 4 | Edit kategori tidak bisa; simpan/batal tidak terlihat | `Modal.jsx` tidak punya batas tinggi/scroll; form panjang terpotong di viewport dan body terkunci | FE-Modal |
| 5 | Header/footer cart & checkout tidak ikut pengaturan toko (nama, logo, copyright) | `PublicLayout` hanya membaca prop `settings`; Cart/Checkout tidak mengirim prop itu sehingga jatuh ke nilai bawaan | FE-Identitas |
| 6 | Header hanya logo, belum ada nama toko | `Header.jsx` merender logo tanpa nama toko | FE-Identitas |
| 7 | Favicon tidak berubah setelah disimpan | `resources/views/app.blade.php` memakai ikon statis, tidak membaca `store_favicon` | BE-Pengaturan |
| 8 | Banyak pengaturan belum terkoneksi ke tampilan user | belum ada audit menyeluruh | QA-Pengaturan |

## Keputusan

- `/history` wajib login (`auth`), hanya pesanan milik user yang login, semua status (pending, dibayar, diproses, dikirim, selesai, batal), terbaru dulu, 10 per halaman.
- Menu profil: ikon tetap; hover/focus menampilkan nama user, tautan Riwayat (`/history`), dan Logout. Guest tetap diarahkan ke login.
- Copyright footer memakai kunci baru `footer_copyright` di grup footer. Kosong = otomatis `© {tahun} {nama_toko}`. Ini melengkapi keluhan pemilik; tidak mengubah data lain.
- `PublicLayout` memakai props bersama `settings` dari `HandleInertiaRequests` sebagai dasar, lalu prop eksplisit (jika ada) menimpa. Ini memperbaiki semua halaman yang memakai layout tanpa mengirim settings.
- Hero memakai `landing_hero` yang sudah ada. Tidak menambah unggah gambar hero/promo karena PRD tidak memintanya; jalur gambar tetap seperti kontrak. Aset seed yang hilang diperbaiki agar tidak ada gambar rusak.
- Modal diperbaiki di komponen bersama: tinggi maksimum viewport + area isi dapat digulir, footer simpan/batal selalu dapat dijangkau.
- Lazy scroll memakai `IntersectionObserver` bawaan (tanpa dependensi baru): 12 produk pertama, batch berikutnya ditambahkan, dedupe `id`, reset saat filter berubah, tombol "Muat lebih banyak" sebagai fallback.

## [ASUMSI]

- Status "pesanan berhasil" mencakup minimal `selesai` dan `dibayar`; halaman menampilkan semua status tanpa filter, sehingga `batal` ikut terlihat.
- Format copyright bebas teks; placeholder `{tahun}` dan `{toko}` diganti otomatis bila dipakai.
- Perbaikan aset seed tidak boleh menimpa nilai pengaturan yang sudah diedit pemilik (`firstOrCreate`), hanya membuat kunci/berkas yang belum ada.

## Verifikasi

QA mengaudit seluruh kunci pengaturan terhadap tampilan user dan admin, menulis `docs/qa-pengaturan-5.md`, lalu review akhir memutuskan siap/belum. Keputusan rilis tetap milik pemilik.

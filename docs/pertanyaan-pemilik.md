# Pertanyaan & Asumsi — Pemilik

Berkas ini **tidak memblokir** pekerjaan (PRD R7, R10). Semua poin dikerjakan dengan asumsi yang tertulis; pemilik cukup menjawab saat menyetujui gerbang.

## 1. Asumsi dari PRD §14 (dipakai sampai pemilik menjawab)

| # | Hal | Asumsi yang dipakai | Dampak bila salah |
|---|---|---|---|
| A1 | Ongkos kirim | Flat `Rp20.000`, dapat diubah di `/admin/pengaturan` | Perlu integrasi kurir |
| A2 | Pembayaran | QRIS saja via Midtrans; tanpa COD/VA/kartu | Perubahan alur checkout |
| A3 | Grosir | Harga grosir aktif otomatis saat qty ≥ `min_wholesale_qty` per produk | Perlu level harga reseller |
| A4 | Verifikasi email | Tidak wajib; akun langsung aktif setelah register | Perlu alur verifikasi |
| A5 | Ulasan | Hanya pembeli dengan order `dibayar`/`selesai`, 1 ulasan per produk per order | Perlu moderasi lebih ketat |
| A6 | Balasan pesan | Disimpan di DB; pengiriman email opsional (SMTP belum tentu tersedia) | Perlu antrean email |
| A7 | Logo & gambar | Diunggah ke `storage/app/public`, disajikan lewat symlink `public/storage` | Perlu CDN/object storage |
| A8 | Multi-bahasa | Indonesia saja | Perlu i18n |
| A9 | Stok | Stok di level varian; produk tanpa varian tetap punya 1 varian default | Perlu restrukturisasi |
| A10 | Nomor order | Format `TK-YYYYMMDD-NNNN` urut harian | — |
| A11 | Akun admin pertama | Dibuat seeder: `admin@tokokulot.test` / password dari seeder, wajib diganti pemilik | — |
| A12 | Peta lokasi | Embed Google Maps iframe dari nilai `contact_map_embed` | Perlu API key Maps |
| A13 | Kurs/format uang | Integer rupiah, tanpa desimal, tanpa PPN | Perlu perhitungan pajak |
| A14 | Diskon | Tidak ada kupon di tahap ini; kolom `discount` disiapkan | Perlu modul promo |
| A15 | Kurir & resi | Tidak ada integrasi kurir; nomor resi diisi manual di detail pesanan | Perlu integrasi pengiriman |
| A16 | Retur/refund | Tidak ada alur otomatis; ditangani manual via pesan masuk | Perlu modul retur |
| A17 | Batas waktu bayar QRIS | 15 menit, order `expire` otomatis lewat webhook/cek status | — |
| A18 | Data pelanggan lama | Tidak ada migrasi data; mulai dari nol | — |

## 2. Ambiguitas dari PRD §14.1 (sudah diputuskan, mohon dikonfirmasi)

| # | Hal | Keputusan sementara |
|---|---|---|
| B1 | `/produk/{id}` vs `/produk/{slug}` | Route memakai `{slug}`; ID numerik diterima sebagai fallback |
| B2 | Eceran vs grosir | Satu alur, harga bertingkat (A3), bukan dua alur terpisah |
| B3 | Penilaian setelah checkout | Form di halaman sukses, bisa diakses ulang dari detail pesanan pembeli |
| B4 | Header/footer editable admin | Dibatasi menu, teks, tautan, sosial, logo — bukan editor HTML bebas |
| B5 | Checkout tanpa login | Keranjang boleh guest, checkout wajib login |

## 3. Pertanyaan baru dari techlead (temuan verifikasi 20 Okt 2026)

| # | Pertanyaan | Temuan/bukti | Rekomendasi techlead |
|---|---|---|---|
| Q1 | Versi React: PRD §4.1 menulis React 18, `package.json` memasang `react ^19.3.1` + `react-dom ^19.3.1` (dengan `@inertiajs/react ^3.9.1`). | `package.json:20-22` | Pertahankan React 19 (sudah terpasang & cocok dengan Inertia 3), lalu perbarui PRD §4.1 menjadi "React 19". Bila pemilik ingin persis React 18, devops menurunkan versi di K2. |
| Q2 | Riwayat git tidak mencerminkan stack PRD: HEAD `0c3d4d8` berjudul "K3: Inisialisasi Next.js…" berisi proyek Next.js + 58 berkas `.agent/skills/`, sedangkan working tree sekarang skeleton Laravel (belum ter-track). | `git log --oneline`; `git ls-tree -r HEAD \| grep -c '^\.agent/'` = 58 | Lanjutkan di repo ini: commit penghapusan folder agent (R4) dan biarkan riwayat lama sebagai sejarah. Alternatif: mulai riwayat baru — keputusan pemilik. |
| Q3 | `docs/design.md` sudah ada (433 baris, 9 bagian) sebelum K3 dijalankan. | `docs/design.md:1-433` | K3 diubah maknanya menjadi audit + pelengkapan terhadap PRD §10, bukan penulisan dari nol (sudah ditulis di `docs/brief-uiux.md`). |
| Q4 | Gerbang pemilik (R15) belum ada di papan. Techlead menambahkan dua kartu gerbang ber-assignee techlead: gerbang 1 setelah K1 (menahan K2 & K3), gerbang 2 setelah K3 (menahan K10). | PRD R15 vs PRD §13 (graf tanpa gerbang) | Pertahankan gerbang; pemilik cukup membalas "sudah" lalu Unblock. Bila tidak diinginkan, hapus kartu gerbang dan pipeline jalan otomatis. |
| Q5 | `.env.example` belum memuat variabel Midtrans yang diwajibkan PRD §8 (`MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION`, `MIDTRANS_MERCHANT_ID`, `MIDTRANS_FAKE`). | `grep -E '^[A-Z_]+=' .env.example` | devops melengkapinya di K2 tanpa mengisi nilai rahasia. |
| Q6 | Nama database memakai tanda hubung (`toko-kulot`, PRD §4.1) — MySQL memerlukan backtick pada query manual. | PRD §4.1 | Dipertahankan; semua akses lewat Eloquent/parameter binding. |
| Q7 | `node_modules` belum ada di workspace sehingga `npm run build` belum bisa diverifikasi techlead. | `ls node_modules` → tidak ada | devops menjalankan `npm install` di K2 sebagai bagian fondasi. |

## 4. Keputusan teknis yang sudah diambil techlead (tidak perlu jawaban pemilik)

| # | Hal | Keputusan | Bukti |
|---|---|---|---|
| T1 | Metode HTTP `admin.messages.read`: PRD §5.2 baris 157 menulis **PATCH**, kontrak props §10.2 menulis POST, implementasi + test memakai POST. | **PATCH menang** (PRD dokumen acuan; kontrak props berstatus DRAFT turunan PRD §5, dan rute sejenis `admin.reviews.visibility` memang PATCH). `docs/kontrak-props.md` §10.2 dikoreksi, `routes/admin.php:43` + dua berkas test menyesuaikan. PRD tidak diubah. | Kartu keputusan `t_54bfee4e`; penjelasan di `docs/catatan-techlead.md`; perbaikan `t_768819a7` (backend), `t_d21ef249` (QA), `t_fc2c5b98` (frontend, halaman pesan), `t_fc49ee38` (frontend, halaman penilaian & pengaturan). |
| T2 | Urutan pemutus konflik dokumen (mis. metode/URI/nama rute berbeda): addendum → PRD → kontrak props → kode yang sudah berjalan. | Dipakai konsisten; kode yang sudah ada tidak otomatis menang. | `docs/catatan-techlead.md` bagian keputusan; `docs/ringkasan-tim.md`. |
| T3 | Kolom pencarian global di topbar admin (design §5.10, `docs/design.md:591`): design menggambarkannya, tetapi PRD §5.2 adalah daftar tetap rute admin tanpa endpoint pencarian (`docs/PRD.md:139-170`). | **Deviasi diterima — kolom cari TIDAK dibangun (opsi c).** Jalur pencarian admin = toolbar per halaman daftar (design §5.12); backend sudah menerima `q` di semua endpoint daftar (mis. `app/Http/Controllers/Admin/ProductController.php:38`). Opsi kolom nonaktif ditolak: kontrol mati = kelas cacat QA-007 (`docs/laporan-qa.md:277`) dan §5.10 tidak punya state "cari nonaktif" (`docs/design.md:610`). **Bila pemilik ingin pencarian global, PRD §5.2 harus ditambah rute lebih dulu** → pekerjaan backend + QA baru. | Kartu keputusan `t_b5de72e3`; alasan lengkap (opsi a/b/c) di `docs/catatan-techlead.md`; kartu lanjutan `t_5fcdbae3` (uiux, drift D8 di design §11.3) dan `t_944aea1e` (frontend, catatan known issue + komentar kode). |

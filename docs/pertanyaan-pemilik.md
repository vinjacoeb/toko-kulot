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
| A17 | Batas waktu bayar QRIS | PRD menulis **15 menit**. Dijawab pemilik 21 Okt 2026: **5 menit** (lihat §5 P1); PRD §8 butir 6 + baris ini perlu amendemen pemilik | — |
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
| Q8 | PRD **A15** meminta nomor resi diisi manual di detail pesanan, tetapi PRD §5.2 (daftar tetap rute admin) dan §6 (kolom tabel `orders`) belum memuat rute simpan maupun kolomnya. | `docs/PRD.md:391` (A15) vs `docs/kontrak-props.md` §12.17–§12.18 (sebelum 21 Okt: tanpa resi) dan `database/migrations/2026_10_20_000010_create_orders_table.php` (tanpa kolom resi) — temuan kartu F5 `t_018b2723` | Dibangun lewat kontrak yang dibekukan techlead: kolom `orders.tracking_number` (60, null) + rute `PATCH /admin/pesanan/{order}/resi` (`admin.orders.resi`) + props `pesanan.tracking_number` (kontrak §12.18a, `docs/db.md` baris 32/88). Mohon disahkan saat gerbang. Bila pemilik ingin resi juga tampil di halaman pembeli atau integrasi kurir, itu amendemen PRD §5.1/§6 → lihat usulan U5. |

## 4. Keputusan teknis yang sudah diambil techlead (tidak perlu jawaban pemilik)

| # | Hal | Keputusan | Bukti |
|---|---|---|---|
| T1 | Metode HTTP `admin.messages.read`: PRD §5.2 baris 157 menulis **PATCH**, kontrak props §10.2 menulis POST, implementasi + test memakai POST. | **PATCH menang** (PRD dokumen acuan; kontrak props berstatus DRAFT turunan PRD §5, dan rute sejenis `admin.reviews.visibility` memang PATCH). `docs/kontrak-props.md` §10.2 dikoreksi, `routes/admin.php:43` + dua berkas test menyesuaikan. PRD tidak diubah. | Kartu keputusan `t_54bfee4e`; penjelasan di `docs/catatan-techlead.md`; perbaikan `t_768819a7` (backend), `t_d21ef249` (QA), `t_fc2c5b98` (frontend, halaman pesan), `t_fc49ee38` (frontend, halaman penilaian & pengaturan). |
| T2 | Urutan pemutus konflik dokumen (mis. metode/URI/nama rute berbeda): addendum → PRD → kontrak props → kode yang sudah berjalan. | Dipakai konsisten; kode yang sudah ada tidak otomatis menang. | `docs/catatan-techlead.md` bagian keputusan; `docs/ringkasan-tim.md`. |
| T3 | Kolom pencarian global di topbar admin (design §5.10, `docs/design.md:591`): design menggambarkannya, tetapi PRD §5.2 adalah daftar tetap rute admin tanpa endpoint pencarian (`docs/PRD.md:139-170`). | **Deviasi diterima — kolom cari TIDAK dibangun (opsi c).** Jalur pencarian admin = toolbar per halaman daftar (design §5.12); backend sudah menerima `q` di semua endpoint daftar (mis. `app/Http/Controllers/Admin/ProductController.php:38`). Opsi kolom nonaktif ditolak: kontrol mati = kelas cacat QA-007 (`docs/laporan-qa.md:277`) dan §5.10 tidak punya state "cari nonaktif" (`docs/design.md:610`). **Bila pemilik ingin pencarian global, PRD §5.2 harus ditambah rute lebih dulu** → pekerjaan backend + QA baru. | Kartu keputusan `t_b5de72e3`; alasan lengkap (opsi a/b/c) di `docs/catatan-techlead.md`; kartu lanjutan `t_5fcdbae3` (uiux, drift D8 di design §11.3) dan `t_944aea1e` (frontend, catatan known issue + komentar kode). |

## 5. Keputusan pemilik (21 Okt 2026, kartu `t_15531332`)

| # | Hal | Keputusan pemilik | Dampak |
|---|---|---|---|
| P1 | Masa berlaku QRIS | **5 menit**, menggantikan 15 menit di PRD §8 butir 6 (`docs/PRD.md:219`) dan A17 (`docs/PRD.md:377`) | `config/midtrans.php` diubah ke 5 menit + `MIDTRANS_EXPIRY_MINUTES` untuk override; PRD §8/A17 perlu amendemen pemilik. Kartu B2 |
| P2 | Panel admin produk/stok/pesanan | Wajib ada CRUD, search, pagination, filter, dan gambar produk | Tiga halaman placeholder + lima halaman belum ada; dikerjakan F3/F4/F5 |
| P3 | Mode uji Midtrans | Pemilik sudah mengisi `.env` + tab Pembayaran admin, QRIS tetap tidak bisa ditransfer | Dua akar: `MIDTRANS_FAKE` bawaan true tanpa penanda di UI, dan kolom `midtrans_client_key`/`midtrans_is_production` di tab Pembayaran tidak pernah dibaca jalur pembayaran (kredensial efektif dari `.env`). **DIPUTUSKAN 22 Okt 2026 (techlead, `t_abb37557`): dipertahankan sebagai catatan** — label + notice `.env` + status mode efektif ditampilkan (`docs/review.md` F-2); rincian di §6 P10. Kartu B1/F2 |
| T4 | Empat permintaan pada kartu F4 `/admin/stok` yang tidak didukung dokumen: (1) kolom "nilai minimum" per varian, (2) aksi "set stok" absolut lewat rute baru, (3) "stok sebelum → sesudah" pada riwayat, (4) filter tanggal riwayat. | **Keempatnya TIDAK dibangun sekarang** — PRD baris 255 + kontrak §12.12–§12.15 sudah menutup kebutuhan halaman: daftar kolom & aksi bersifat tertutup, ambang kritis = angka global 5, riwayat hanya `qty`/`signed_qty`, dan filter tanggal sengaja hanya diberikan ke `/admin/pesanan` (§12.16 punya `dari`/`sampai`). Stok absolut tetap lewat form produk (`GET /admin/produk/{product}/ubah`; §12.6 mencatatnya sebagai `adjust`) dan F4 memakai modal penjelas + tautan ke form itu. **Bila pemilik ingin salah satunya, lebih dulu harus berubah: PRD §5.2 (rute baru) / PRD §9 + `docs/db.md` (kolom baru) + kontrak §12** → kartu backend + QA baru. | Kartu keputusan `t_a24a79d0`; bukti per butir di `docs/keputusan-f4-stok.md`; ringkas di `docs/catatan-techlead.md`; usulan + biaya di `docs/usulan.md`. Kartu F4 tidak perlu revisi; QA `t_3a240a11` menguji terhadap kontrak §12.12–§12.15, jadi keempat hal itu bukan cacat. |
| T5 | Nomor resi manual (PRD A15): kartu F5 `t_018b2723` tidak bisa memenuhi DoD "nomor resi bisa disimpan" — `orders` tanpa kolom resi, `routes/admin.php` tanpa rute resi, kontrak `docs/kontrak-props.md` §12.17 tanpa field resi. | **Dibangun** (A15 sudah memuat fiturnya; rute + kolom adalah cara teknis): kolom `orders.tracking_number` string(60) null + rute `PATCH /admin/pesanan/{order}/resi` (`admin.orders.resi`, `throttle:admin-write`) + props `pesanan.tracking_number` (kontrak §12.17) dengan perilaku rute di kontrak §12.18a baru. `docs/PRD.md` **tidak** diubah agar nomor baris yang dirujuk dokumen lain tidak bergeser; amendemen diminta lewat §3 Q8. Rantai kartu: backend + uiux → frontend → QA (`docs/traceability.md` §8). | Kartu keputusan `t_394b40ba`; rincian di `docs/keputusan-a15-resi.md`; kontrak `docs/kontrak-props.md:1389-1400`; `docs/db.md` baris 32/88; `docs/catatan-techlead.md` bagian 21 Okt 2026. |

## 6. Pertanyaan baru — laporan pemilik 21 Okt 2026 malam (kartu `t_caaa8fa4`)

Bukti lengkap ada di `docs/review-2.md`. Beberapa hal di bawah **belum bisa ditutup** tanpa pemilik; sisanya
sudah diambil sebagai asumsi (kartu & dokumen terkait tetap jalan).

| # | Hal | Yang diminta dari pemilik | Dampak bila tidak dijawab |
|---|---|---|---|
| P4 | ~~`compare_price` gagal disimpan dan resi belum hidup karena dua migrasi **Pending** di DB pemilik.~~ **DIJAWAB 21 Okt malam**: atas arahan pemilik, backend menjalankan migrasi di kartu `t_576d4f09` — keduanya kini **Ran batch [2]** dan kolom `products.compare_price` + `orders.tracking_number` terverifikasi di DB pemilik (`docs/bukti-migrate-g2.txt`; ringkasan `docs/review-2.md` §6). | Sisa uji di sisi pemilik: klik ulang `/admin/produk/tambah`, ubah produk **dengan id yang ada (1-11 — DB pemilik tidak punya produk id=12)**, dan isi resi di `/admin/pesanan/{order}`; kirim teks/tangkapan layar hasilnya. | Laporan #3/#4 saat ini berstatus "akar masalah hilang, menunggu konfirmasi layar pemilik". Bila form tetap gagal, hasil kiriman itu dipakai membuka kartu perbaikan baru. |
| P5 | **P3 DIJAWAB 22 Okt 2026 (techlead): DIPERTAHANKAN sebagai catatan — lihat P10.** Sisa: apakah pemilik akan menguji bayar dengan kredensial sandbox asli (`MIDTRANS_FAKE=false`) lewat kartu `t_fcfc3687`? | **Prasyarat kode siap**: tombol "Sinkronkan status pembayaran" ada di `/admin/pesanan/{order}` (B3 `t_c374a29b` + F8 `t_8e89556f`), galat `stdClass` sudah diperbaiki **B4** `t_3bfe3165`, dan `order_id` Midtrans kini unik per charge berkat **B5** `t_a90d5215` (checkout ulang tidak lagi ditolak 406; Order ID di dashboard berbentuk `TK-YYYYMMDD-NNNN-XXXXXX`). Langkah persis di `docs/langkah-pemilik.md` § G1 — **pakai pesanan uji baru**. P3 sudah diputuskan (dipertahankan + label, P10), jadi tidak ada pilihan lagi. Untuk uji bayar: balas "sudah" + Unblock `t_fcfc3687` setelah membuktikan satu pembayaran Simulator. **22 Okt 07:46:** kredensial sandbox sudah diisi pemilik (`MIDTRANS_FAKE=false`, `MIDTRANS_IS_PRODUCTION=false`, kunci berawalan `SB-Mid-client-`/`Mid-server-`) — itu **bukan** bukti bayar. Yang masih diminta: (1) satu pesanan uji **baru** dibayar lewat Simulator, (2) notice hasil tombol "Sinkronkan status pembayaran" + status sebelum→sesudah. **22 Okt 08:25 — dua percobaan sudah masuk dan diuji QA:** tombol/endpoint LULUS live, tetapi hasilnya "Kedaluwarsa" karena ditekan setelah batas 5 menit (#15 +42 detik, #14 +7m42s). Solusi tanpa kode: set sementara `MIDTRANS_EXPIRY_MINUTES=60` di `.env` (owner) → pesanan baru → Simulator `settlement` → tekan sinkron; setelah bukti didapat kembalikan ke 5. Lihat P11. | Laporan #2 tetap "belum diuji" sampai bukti bayar masuk; kolom tab Pembayaran **tidak lagi menyesatkan** (label + notice `.env` sejak F2). |
| P6 | Maksud permintaan #7: "tambah tombol register saat klik profil (saat login user)". Techlead menafsirkan: **tamu** mendapat tombol "Daftar" di header/drawer (kartu `t_e3f68f7f`). Bila maksudnya menu dropdown profil, itu usulan U7 (`docs/usulan.md`). | Konfirmasi: (a) tafsiran di atas sudah benar, atau (b) pemilik ingin menu dropdown profil (Masuk/Daftar/Keluar) — sebutkan isinya. | Bila maksudnya menu, perbaikan sekarang (tautan lurus) masih berguna tetapi belum sesuai harapan — cukup ditambah satu kartu kecil, tidak merusak apa pun. |
| P7 | Galat saat pemilik menguji bayar sandbox (22 Okt): `Cannot use object of type stdClass as array` di `app/Services/MidtransService.php:540`. | **SELESAI 22 Okt** — cacat kode, bukan salah `.env`: adapter `app/Services/Midtrans/SdkMidtransApi.php` hanya mengubah tingkat teratas respons SDK, padahal `actions[]` berisi `stdClass` (`vendor/midtrans/midtrans-php/Midtrans/ApiRequestor.php:159`). Kartu **B4** `t_3bfe3165` selesai: normalisasi rekursif (`SdkMidtransApi.php:83-115`), test bentuk SDK `MidtransSdkShapeTest` **OK (4 tests, 49 assertions)** — dijalankan ulang techlead. Tidak ada isian `.env` tambahan. **Sisa tindakan pemilik:** **B5** `t_a90d5215` sudah selesai (`order_id` Midtrans unik per charge), jadi ulangi `docs/langkah-pemilik.md` § G1 dengan **pesanan uji baru** dan balas hasilnya. | Tidak ada — P7 tertutup; laporan #2 menunggu bukti bayar pemilik (P5), dan P3 tetap terbuka. |
| P8 | Transaksi Midtrans yatim dari percobaan 22 Okt 06:07: `charge` berhasil tetapi penyimpanan lokal gagal (`storage/logs/laravel.log:4499-4507`), sehingga transaksi itu masih ada di sisi Midtrans. | Cek dashboard Midtrans (sandbox bila `MIDTRANS_IS_PRODUCTION=false`, **produksi bila `true`**): apakah ada transaksi `pending` sekitar 06:07? Bila ya, batalkan/expire lalu balas "sudah dibatalkan" + mode yang dipakai (sandbox/produksi). Tidak perlu mengubah `.env` untuk ini. | Bila dibiarkan: tidak ada tagihan sampai dibayar, tetapi dashboard bisa membingungkan dan — bila mode produksi — transaksi yatim harus dibatalkan. B5 mencegah kejadian berulang. |
| P9 | **Panduan + checklist bukti bayar QRIS sandbox** sudah ditulis di `docs/review-2.md` §6 "Panduan & checklist bukti bayar QRIS sandbox" (kartu `t_0e464483`). | Jalankan lima langkah checklist di bawah (pesanan uji **baru**, Simulator **settlement** dalam 5 menit, tombol **Sinkronkan status pembayaran**), isi tabel bukti, lalu tempel hasilnya di kartu `t_fcfc3687`. `.env` **tidak perlu diubah lagi** (sudah diisi 22 Okt 07:46). | Laporan #2 tetap "belum diuji"; G1 `t_fcfc3687` dan devops `t_fac8f5a3` tidak bisa ditutup. |
| P10 | **Jawaban P3** (kartu `t_abb37557`): kolom `midtrans_client_key`/`midtrans_is_production` di tab Pembayaran — dihapus atau dipertahankan? | **DIPUTUSKAN techlead 22 Okt 2026: DIPERTAHANKAN sebagai catatan** (opsi b); pemilik tidak perlu memilih lagi. Alasan: PRD §6 (`docs/PRD.md:199`) mewajibkan 19 kunci `settings` termasuk keduanya, jadi menghapus = amendemen PRD oleh pemilik; yang tersimpan hanya client key publik + flag boolean (server key tidak pernah masuk `settings`); label "Catatan saja…" + notice "Kredensial dibaca dari .env (MIDTRANS_*)" sudah tampil sejak F2. Bila pemilik **tetap** ingin hapus: balas di `t_fcfc3687` — jalurnya amendemen PRD §6 dulu, lalu kartu backend + uiux/frontend (`docs/usulan.md` U9). | Tidak ada perubahan kode/UI/migrasi; G1 tinggal menunggu bukti bayar + P8. |
| P11 | **Jendela bayar 5 menit (P1) membuat uji bayar sandbox gagal dua kali** — tombol sinkron ditekan setelah QR kedaluwarsa (#14 08:02, #15 08:09; bukti di `docs/review-2.md` §6 "Verifikasi ulang ... 08:15"). | **Izin sementara (silakan langsung lakukan):** set `MIDTRANS_EXPIRY_MINUTES=60` di `.env` (milik pemilik) selama pengujian, jalankan `php artisan config:clear`, lalu **setelah bukti didapat kembalikan ke 5**. Ini hanya isian `.env`, bukan perubahan kode: nilai itu dipakai `custom_expiry` Midtrans + `payments.expires_at` (`app/Services/MidtransService.php:481-483,547-550`). | Bila tetap 5 menit: uji harus selesai < 5 menit dari QR muncul; kalau lewat, hasilnya lagi-lagi "Kedaluwarsa" dan G1 tetap terbuka. P1 (5 menit) tetap berlaku untuk produksi. |
| P12 | **Checkout gagal 3x pada 22 Okt 08:36–08:37** (`TK-20261022-0005`) dengan pesan "Gagal membuat pembayaran QRIS. Coba lagi." — ini **bukan** QR kedaluwarsa dan bukan tombol sinkron; pesannya keluar sebelum halaman bayar, sebab aslinya tidak tercatat (`storage/logs/laravel.log:5339-5341`, rincian `docs/review-2.md` §6 "Putaran 4"). | (a) Konfirmasi bahwa di `.env` hanya `MIDTRANS_EXPIRY_MINUTES` yang berubah — **jangan tempel nilai kunci**; cukup balas "kunci tidak berubah" bila `MIDTRANS_SERVER_KEY`/`MIDTRANS_CLIENT_KEY` tidak tersunting. (b) Tunggu kartu **B6 `t_1f72a2d1`** selesai, lalu ulangi **satu** checkout dengan keranjang yang sama (tidak perlu pesanan baru dari awal; percobaan tadi di-rollback). (c) Bila gagal lagi, balas jam kejadian + teks notice di layar — techlead membaca penyebabnya dari log. | Selama ini belum ada satu pun pembayaran `settlement` yang disinkronkan, jadi G1 `t_fcfc3687` dan devops `t_fac8f5a3` tidak bisa ditutup. |
| P16 | **Checkout MASIH gagal 22 Okt 10:37** (`TK-20261022-0005`), tetapi sebabnya kini terpisah dua lapis: (1) kanal GoPay QRIS dijawab **402 `Payment channel is not activated`** (`storage/logs/laravel.log:6262`); (2) percobaan cadangan `other_qris` dijawab **413 `Payload format is not supported`** (`:6263`) sehingga pesan 402 tertutup dan yang tampil kembali "Gagal membuat pembayaran QRIS. Coba lagi.". Rincian: `docs/review-4.md`. | (a) **Aktifkan QRIS di dashboard Midtrans produksi** (Settings → Payment Methods/Channels → QRIS) atau hubungi Activation Team Midtrans dengan Merchant ID; (b) **jangan** set `MIDTRANS_QRIS_ACQUIRER=other_qris` — nilai itu tidak sah di Core API (hanya `gopay` / `airpay shopee`); (c) kartu backend putaran 2 **sudah selesai** (`t_56062a5c`), jadi uji **satu** checkout baru dan balas hasilnya — jam kejadian, kode pesanan, teks notice/QR apa adanya — di kartu gerbang `t_c9385bf0`. | Selama QRIS belum aktif di akun produksi, **semua** checkout berhenti sebelum QR dibuat. Ini putaran perbaikan ke-2 (batas 2); bila masih gagal, techlead memblok dengan bukti, bukan membuat kartu ketiga. |

Catatan: temuan #1 (tombol "Buat Pesanan" tidak bereaksi) **tidak** memerlukan jawaban pemilik — akarnya
sudah terbukti di kode (`resources/js/Pages/Public/Checkout.jsx:68-76`) dan diperbaiki kartu `t_a98f17d4`.
Mohon, bila ada, sebutkan perangkat/browser dan isian yang dipakai saat kejadian, supaya QA bisa mengulang
persis (belum ada laporan tambahan, jadi QA menguji lewat test + baca kode).

### Checklist bukti bayar QRIS sandbox (kartu `t_0e464483`)

Panduan lengkap + tabel bukti: `docs/review-2.md` §6 "Panduan & checklist bukti bayar QRIS sandbox".
Ringkas — centang bila sudah terbukti di layar:

- [ ] **1. Mode sandbox aktif.** `.env` sudah diisi 22 Okt 07:46 (`MIDTRANS_FAKE=false`,
      `MIDTRANS_IS_PRODUCTION=false`, kunci sandbox) — **jangan diubah**; di halaman bayar kotak **Mode uji**
      tidak muncul. `config:clear` opsional.
- [ ] **2. Pesanan uji BARU.** `/checkout/{order}/bayar` menampilkan QR (bukan "Kode QR belum tersedia");
      catat kode `TK-YYYYMMDD-NNNN`. Pesanan lama yang sudah pernah membuat transaksi Midtrans tidak bisa dipakai.
- [ ] **3. Dibayar lewat Midtrans Simulator** (dashboard sandbox → Transactions → Order ID berawalan kode
      pesanan → Simulator → **settlement**) dalam **5 menit** (P1), atau **60 menit** bila Anda memasang
      `MIDTRANS_EXPIRY_MINUTES=60` sementara (P11). Lewat batas itu: buat pesanan baru.
- [ ] **4. Sinkron dari admin.** `/admin/pesanan/{id}` → kartu **Bukti pembayaran** → **Sinkronkan status
      pembayaran** → notice *"Status pembayaran diperbarui dari Menunggu pembayaran ke Lunas."* dan label
      status berubah.
- [ ] **5. Bukti dicatat:** kode pesanan, Order ID di dashboard, ID transaksi (kartu Bukti pembayaran),
      timestamp bayar + sinkron, status sebelum→sesudah, teks notice apa adanya, tangkapan layar — tempel di
      kartu `t_fcfc3687`.

Bila langkah 4 memberi notice lain, salin apa adanya: arti tiap kemungkinan notice ada di
`docs/review-2.md` §6. Putusan P3 **sudah final** (P10: dipertahankan sebagai catatan) — tidak perlu dijawab lagi.

Bila tombol **Buat Pesanan** berhenti dengan "Gagal membuat pembayaran QRIS. Coba lagi." (sebelum QR muncul),
itu **P12** — bukan QR kedaluwarsa. Tunggu kartu B6 `t_1f72a2d1` selesai, lalu ulangi satu kali; jangan
membuat pesanan baru berulang-ulang (percobaan yang gagal di-rollback, jadi belum ada baris `orders`).

## 7. Laporan "pemilik 3" masuk kosong — 22 Okt 2026 (kartu `t_0a33a4d0`)

Laporan masuk lewat dashboard tanpa judul gejala, tanpa body, dan **tanpa lampiran**, sehingga belum bisa
direproduksi maupun dinilai severitasnya. Catatan triage lengkap: `docs/bugs/owner3-tanpa-detail.md`
(status reproduksi: **TERBLOKIR**).

Yang diminta dari pemilik (jawab lewat komentar kartu `t_0a33a4d0` atau kirim ulang lewat dashboard):

| # | Pertanyaan singkat |
|---|---|
| K1 | Halaman/URL persis saat masalah muncul (mis. `/checkout/{order}/bayar`, `/admin/pesanan/{order}`)? |
| K2 | Langkah 1..n sebelum masalah (tombol/menu yang ditekan)? |
| K3 | Hasil yang **diharapkan** vs yang **terjadi** — salin teks galat persis bila ada |
| K4 | Browser + perangkat + lebar layar (mis. Chrome Android 390 px) |
| K5 | Waktu kejadian (tanggal/jam) + akun yang dipakai (pembeli/admin) |
| K6 | Tangkapan layar / log konsol / tab Network — lampirkan ke kartu (lampiran sekarang 0) |
| K7 | Build yang dipakai: chunk `app-BCun0p-R.js` (beku 22 Okt 06:37) atau build lama? Coba Ctrl+F5 lalu ulangi |
| K8 | Apakah ini galat `stdClass` yang sama dengan P7 (QRIS tidak muncul di halaman bayar)? |

Catatan: bila jawaban K8 = "ya", tidak perlu kartu baru — cukup tunggu B4 `t_3bfe3165` selesai lalu ulangi
`docs/langkah-pemilik.md` § G1 dengan pesanan uji baru. Bila gejalanya lain, techlead membuka satu kartu
perbaikan per masalah (maks 2 putaran) sesuai area.

**UPDATE 22 Okt 2026 08:44:** laporan **tidak lagi kosong** — pemilik mengisi body kartu `t_fe77b3d7`
dengan enam butir (varian produk, warna swatch, dashboard, Midtrans produksi, tabel admin). Pertanyaan
K1-K8 tidak dipakai lagi; keenam butir sudah dikerjakan dan diverifikasi di `docs/review-3.md`.

## 8. Tindak lanjut laporan pemilik 3 — 22 Okt 2026 (kartu `t_fe77b3d7`)

| # | Hal | Yang perlu diputuskan / dilakukan pemilik | Dampak bila tidak |
|---|---|---|---|
| P13 | `MIDTRANS_EXPIRY_MINUTES` | Body kartu menempel nilai **60** (nilai uji P11), tetapi probe QA 09:40 membaca **5** — sesuai kebijakan P1 dan FAQ. Konfirmasi nilai terakhir di `.env`; untuk produksi biarkan **5**. Bila memang ingin 60, FAQ + P1 harus diubah lebih dulu. | Bila 60: teks FAQ dan P1 tidak sinkron; pelanggan punya waktu bayar lebih lama. Bila 5: tidak ada tindakan. |
| P14 | KPI dashboard PRD §9 | Dashboard sekarang menampilkan 4 KPI yang **sinkron data aktual**, tetapi PRD §9 juga meminta omzet hari ini/7/30 hari, pesanan per status, dan produk terlaris. Rekomendasi techlead: **tunda ke rilis berikutnya** (desain §5.11 dan PRD §9 belum sepakat soal metrik). Balas "tunda" atau "kerjakan sekarang". | Bila "kerjakan sekarang": perlu kartu uiux → backend → frontend dan menambah waktu rilis. Bila "tunda": dashboard belum memenuhi PRD §9 secara penuh. |
| P15 | Warna di luar palet | Nama seperti `Broken White` tampil netral + huruf awal. Pakai nama warna baku (merah, hijau, navy, …) atau kode hex `#RRGGBB` di kolom warna. Bila butuh palet khusus, sebutkan daftar nama + hex-nya. | Swatch tidak mencerminkan warna asli untuk nama asing; fungsi pilih tetap jalan. |

Catatan keamanan: body kartu `t_fe77b3d7` memuat potongan Merchant/Client/Server key (bertopeng).
Jangan menempel kunci di kartu/chat/dokumen. Bila kartu itu sudah dibagikan ke pihak lain,
pertimbangkan rotasi kunci produksi di dashboard Midtrans.

## 9. Tindak lanjut pengecekan alur pemesanan — 24 Okt 2026 (kartu `t_8e8bb605`)

| # | Hal | Yang perlu diputuskan / dilakukan pemilik | Dampak bila tidak |
|---|---|---|---|
| P16 | Ongkir 400 dari Biteship | Kode pos asal (pengaturan `/admin/ekspedisi`) dan kode pos tujuan yang dipakai saat "Cek Ongkir" gagal. Sebutkan keduanya, lalu setelah kartu perbaikan selesai klik ulang dan tempel satu baris log `Biteship rates ...` terbaru. | Tanpa kode pos + kode error, penyebab (kode pos tak dikenal vs akun/key `biteship_test.*`) tidak bisa dipastikan. |
| P17 | Kunci `biteship_test.*` | Biteship sandbox: tarif contoh memakai kode pos Jakarta (12440 → 12240). Bila akun uji dibatasi, uji dengan pasangan itu dulu untuk memisahkan masalah akun dari masalah kode pos toko. | Salah simpul: memperbaiki kode padahal batasan ada di akun sandbox. |

## 10. Pendaftaran webhook Biteship ditolak dashboard — 25 Okt 2026 (kartu `t_7584d46c`)

| # | Hal | Yang perlu diputuskan / dilakukan pemilik | Dampak bila tidak |
|---|---|---|---|
| P18 | Pesan *"Webhook URL doesn't respond with ok response"* | Bukan salah isian form dan bukan tunnel mati: probe instalasi Biteship (body kosong, kadang GET) dijawab 422/405 oleh kode. Perbaikan kode di kartu `t_f09907b0` (`docs/bukti-webhook-install-t_7584d46c.txt`). Setelah kartu itu selesai: ulangi "Tambah Webhook" dengan URL yang sama. | Webhook tidak terdaftar; status kirim/resi tidak pernah masuk sendiri. |
| P19 | `.env` belum bisa diisi | Yang wajib ada sebelum webhook dipakai: `BITESHIP_WEBHOOK_TOKEN` (teks acak panjang, jangan ditempel di kartu/chat), `APP_DEBUG=false`, dan `php artisan migrate` (kolom `orders.shipping_updated_at`/`shipping_webhook_payload`, migrasi `000005`). Tanpa migrasi, event asli pertama dibalas 500. | Webhook terbuka tanpa token (siapa pun bisa mengubah status pesanan) atau 500 saat event nyata masuk. |

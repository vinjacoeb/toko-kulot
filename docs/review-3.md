# Review techlead — laporan bug pemilik 3 (kartu `t_fe77b3d7`, 22 Okt 2026)

Verifikasi dilakukan baca-saja: kode, diff, dokumen QA, log PHPUnit, dan query board.
Tidak ada berkas aplikasi, `.env`, database, atau server yang disentuh.

## 1. Ringkasan

Laporan berisi enam butir. Empat kartu perbaikan + satu kartu verifikasi QA sudah selesai:

| Butir pemilik | Kartu | Status |
|---|---|---|
| 1. Setelah tambah barang, ukuran/warna tidak bisa dipilih di `/produk/barang` | `t_bc89df6d` (backend), `t_7a62c713` (frontend) | Lulus |
| 2. Ukuran/warna terblokir bila warna lebih dari satu | `t_7a62c713` | Lulus |
| 3. Warna masih putih, bukan warna asli (contoh: merah) | `t_bc89df6d` | Lulus |
| 4. Dashboard admin belum sinkron data aktual | `t_1ef89050` | Lulus |
| 5. Midtrans langsung produksi + cek `.env` | `t_3c9d83c1` | Lulus konfigurasi; charge nyata belum |
| 6. Tabel `/admin/produk` saling menumpuk | `t_7a62c713` | Lulus |

Bukti QA: `docs/verifikasi-pemilik-t_18650721.md`; log suite: `docs/qa/log-phpunit-t_18650721.txt`.
Techlead menjalankan ulang suite penuh: **OK (258 tests, 2041 assertions)**, PHP 8.3.32, SQLite `:memory:`.

Catatan rute: `/produk/barang` tidak ada (404). Katalog publik adalah `/produk` dan
`/produk/{slug}`; halaman detail yang dimaksud pemilik adalah `/produk/{slug}` (QA O-5).

## 2. Butir 1 & 2 — pemilih ukuran/warna

**Akar masalah.** Frontend memakai aturan kombinasi ketat: begitu satu chip dipilih, chip lain
dimatikan bila kombinasi itu tidak ada, sehingga pemilih tampak buntu. Backend juga tidak
mengirim `variants[]` lengkap pada kontrak produk publik.

**Perbaikan yang diverifikasi.**
- `app/Services/ProductPresenter.php:128-155` mengirim `variants[]` aktif berisi
  `id,size,color,color_hex,sku,price_delta,stock,is_active`; `color_hex` diturunkan di server (`:151`).
- `resources/js/Pages/Public/Products/Show.jsx:91-147`: ketersediaan dihitung **per nilai**
  (`ukuranAdaStok`, `warnaAdaStok`), bukan per kombinasi. Memilih ukuran tidak mematikan warna
  yang masih punya stok; memilih warna melepas ukuran yang tidak sah, bukan mengunci semua chip.
- Varian tanpa stok tetap `disabled`; kombinasi yang benar-benar tidak ada tidak bisa dipilih.
- Produk satu warna tetap otomatis terpilih; produk tanpa varian menampilkan CTA nonaktif.

**Status: Lulus.** QA menguji dua urutan klik (ukuran dulu, warna dulu) pada produk 2 warna:
keduanya menghasilkan pilihan sah dan CTA aktif. Ini menutup keluhan "tidak bisa memilih" dan
"blok ketika warna lebih dari 1".

## 3. Butir 3 — warna asli

**Akar masalah.** Swatch hanya menerima `color_hex`; backend tidak mengirimnya, jadi semua
swatch jatuh ke lingkaran netral (putih).

**Perbaikan yang diverifikasi.**
- `app/Support/VariantColor.php:29-119` memetakan nama warna Indonesia (termasuk
  `merah` → `#DC2626`, `hijau` → `#16A34A`) dan menerima nilai `#RGB`/`#RRGGBB`; nama asing
  mengembalikan `null` (tidak ditebak).
- `ProductPresenter` mengisi `color_hex`; `ColorSwatch.jsx` merender hex sah dan fallback netral
  untuk `null`.

**Status: Lulus.** QA membandingkan props `color_hex` dengan computed style swatch; sembilan warna
di data dev semuanya berhex. Nama di luar palet (mis. `Broken White`) masih netral — lihat §6 O-2.

## 4. Butir 4 — dashboard sinkron data aktual

**Akar masalah.** `DashboardController@index` hanya mengirim `stats`; prop grafik, stok kritis,
pesanan terbaru, ulasan terbaru, dan `updated_at` yang sudah dibaca halaman tidak pernah dikirim,
sehingga blok terkait selalu empty state.

**Perbaikan yang diverifikasi.**
- `app/Services/DashboardService.php:43-55` (dengan helper sampai `:174`) menghitung snapshot
  langsung dari DB per request, tanpa cache: `stats`, `sales_14d` (14 tanggal berakhir hari ini,
  zero-fill), `low_stock`, `recent_orders`, `recent_reviews`, `updated_at`.
- `app/Http/Controllers/Admin/DashboardController.php:23` merender snapshot itu; tidak ada
  rute/endpoint/migrasi baru.
- Omzet memakai `Order::REVENUE_STATUSES` (dibayar/diproses/dikirim/selesai), bukan semua status.
- Tombol **Muat ulang** memicu request Inertia baru dan `updated_at` berubah.

**Status: Lulus.** QA membandingkan 4 KPI, seri 14 hari, stok kritis, pesanan, dan ulasan dengan
data DB; tidak ada selisih. Gap KPI PRD §9 yang lebih luas dicatat sebagai O-4 (§6).

## 5. Butir 5 — Midtrans produksi

**Yang benar (bukti probe devops + QA):**
- `MIDTRANS_IS_PRODUCTION=true`, `MIDTRANS_FAKE=false`, mode efektif **asli** (bukan simulasi).
- SDK menuju `https://api.midtrans.com` (produksi), ketiga kunci terisi, tidak berprefiks sandbox
  `SB-`, `config_cached=false`.
- `MIDTRANS_EXPIRY_MINUTES` efektif **5 menit** pada probe QA 09:40 — sesuai kebijakan P1.
  Probe devops 08:47 masih mencatat 60 (nilai uji P11). Nilai berubah antara kedua waktu itu;
  bukti terbaru yang dipakai adalah 5. Jika pemilik mengubah lagi ke 60, FAQ dan P1 harus diubah
  lebih dulu.

**Yang belum terbukti:** charge QRIS nyata, notifikasi Midtrans produksi, dan perubahan status
pesanan otomatis. Ini **bukan** cacat kode yang ditemukan, tetapi belum diuji uang nyata.
Pemilik juga perlu mengisi **Payment Notification URL** di dashboard Midtrans
(`https://<domain>/midtrans/notification`); `MIDTRANS_NOTIFICATION_URL` di `.env` tidak dibaca kode.
Langkah lengkap: `docs/midtrans-produksi.md` §3-4.

**Catatan admin settings.** `midtrans_client_key`/`midtrans_is_production` di tab Pembayaran memang
tidak dibaca jalur QRIS; itu keputusan P3/P10 (dipertahankan sebagai catatan + notice `.env`).
Pemilik tidak perlu mengubahnya lagi.

**Catatan keamanan.** Body kartu ini memuat potongan Merchant/Client/Server key (walau bertopeng).
Jangan menempel kunci di kartu/chat/dokumen; bila kartu ini dibagikan, pertimbangkan rotasi kunci
produksi. Techlead tidak menyalin nilai itu ke dokumen mana pun.

## 6. Butir 6 — tabel admin

**Akar masalah.** `DataTable` mengabaikan `column.width`; semua kolom dibagi rata, sehingga nama
panjang dan kolom aksi saling menumpuk.

**Perbaikan yang diverifikasi.**
- `resources/js/Components/DataTable.jsx:35-47,81-125`: bila ada `width`, tabel memakai
  `table-fixed` + `<colgroup>`; wrapper `overflow-x-auto` menggeser tabel di layar sempit, bukan
  memaksa halaman melebar.
- `resources/js/Pages/Admin/Products/Index.jsx:127-197` memberi lebar eksplisit pada kolom produk,
  kategori, harga, stok, status, dan aksi.

**Status: Lulus.** QA mengukur 4 viewport (360/768/1024/1280): tidak ada elemen melewati lebar
halaman, tidak ada tumpang tindih, dan nama produk panjang tetap terpotong rapi.

## 7. Yang lulus, gagal, dan belum dicek

**Lulus:** keenam butir di atas; suite penuh 258 test; katalog publik 200/404; otorisasi admin
302 ke login; tabel admin 4 viewport; dashboard vs DB.

**Gagal:** tidak ada defect Critical/High/Medium pada area yang diverifikasi.

**Belum dicek (batas eksplisit):**
1. Membuat produk baru lewat form admin lalu memilih variannya ujung-ke-ujung (butuh tulis DB milik
   pemilik). Verifikasi memakai produk yang sudah ada.
2. Varian berstok 0 di runtime — tidak ada di data dev; aturan `disabled` hanya dibaca dari kode.
3. Warna >2 dan nama di luar palet — perilaku bungkus baris dan fallback belum diukur.
4. Charge QRIS nyata, notifikasi, dan pembayaran produksi — butuh uang dan akun Midtrans aktif.
5. Zoom 200%, screen reader, kontras terukur, browser selain Chromium.
6. State "Diperbarui …" setelah data berumur ≥5 menit.
7. Pagination tabel admin (12 produk < 15 per halaman).

Bukti browser QA berupa narasi di `docs/verifikasi-pemilik-t_18650721.md`; tidak ada berkas log
mentah/screenshot terpisah. Hasilnya konsisten dengan kode dan pengukuran, tetapi tidak bisa
direproduksi ulang dari artefak. QA berikutnya sebaiknya menyimpan log mentah.

## 8. Observasi lanjutan dan keputusan

- **O-1 header tabel belum sticky (Low, frontend).** `DataTable.jsx` mendokumentasikan "Header
  sticky", `docs/komponen.md:83` mewajibkannya, dan `docs/design.md:335` menetapkan `sticky`, tetapi
  `<th>` masih `position: static`. Belum berdampak (12 baris < viewport). **Keputusan: dibuatkan
  kartu** `t_082b15aa` (frontenddeveloper, parent `t_fe77b3d7`) karena ini kontrak komponen yang
  tertulis, bukan kosmetik baru. Catatan teknis wrapper `overflow-x-auto` sudah dimasukkan ke body.
- **O-2 nama warna di luar palet (enhancement).** `Broken White` tetap netral + huruf awal.
  **Keputusan: tidak ada perubahan kode sekarang.** Pemilik bisa memakai nama warna baku
  (merah, hijau, navy, …) atau kode hex `#RRGGBB` di kolom warna; usulan palet/hex input dicatat
  sebagai `docs/usulan.md` U12.
- **O-3 dua definisi "stok kritis".** Dashboard menghitung varian aktif <5; ringkasan produk
  menghitung produk dengan total stok <5. Keduanya sesuai kontrak; bukan defect.
- **O-4 KPI dashboard belum lengkap (gap requirement).** PRD §9 meminta omzet hari ini/7/30 hari,
  pesanan per status, dan produk terlaris; dashboard baru menampilkan 4 KPI (omzet total, pesanan
  pending, pesanan total, produk aktif). Gap ini sudah tercatat sejak K13 dan bukan regresi kartu
  sinkronisasi. **Keputusan: ditunda ke rilis berikutnya**, karena (a) di luar enam butir pemilik,
  (b) desain §5.11 dan PRD §9 belum sepakat soal metrik (AOV/30 hari vs 7 hari/status/terlaris),
  dan (c) menambahkannya sekarang memperluas rilis yang sedang diuji. Pemilik diminta memutuskan
  di `docs/pertanyaan-pemilik.md` P14; bila disetujui, jalurnya uiux → backend → frontend.
- **O-5 `/produk/barang` 404.** Bukan defect; rute yang benar `/produk` dan `/produk/{slug}`.

## 9. Risiko

1. **Pembayaran produksi belum pernah diuji.** Konfigurasi benar, tetapi kegagalan charge/notifikasi
   baru terlihat saat uang bergerak. Risiko tertinggi rilis ini.
2. **Notifikasi Midtrans** bergantung pada URL di dashboard Midtrans, bukan `.env`; bila belum diisi,
   status tidak berubah otomatis (masih bisa lewat tombol sinkron).
3. **Stok 0 dan warna >2** belum diuji runtime; risiko rendah, tetapi bisa memunculkan laporan baru.
4. **KPI PRD §9 belum lengkap**; secara PRD murni, dashboard belum memenuhi §9.
5. **Potongan kunci di body kartu**; jangan disebarkan, pertimbangkan rotasi.
6. **Build/commit**: repo masih banyak berkas untracked/modified dari banyak kartu; tidak ada
   commit per kartu. Jangan rilis dari working tree tanpa membekukan build (checklist devops).

## 10. Rekomendasi

**GO BERSYARAT untuk enam perbaikan laporan pemilik 3.** Semua butir lulus verifikasi code-level
dan suite penuh hijau; tidak ada regresi katalog, otorisasi admin, atau tabel admin.

**Belum GO untuk produksi penuh** sampai: (1) satu pembayaran QRIS produksi nyata berhasil dan
status pesanan berubah, (2) Payment Notification URL terpasang, (3) pemilik mengonfirmasi
`MIDTRANS_EXPIRY_MINUTES=5`, dan (4) keputusan O-4 (KPI) dicatat. Keputusan rilis akhir tetap milik
pemilik.

## 11. Dokumen & kartu yang diperbarui

- Kartu baru: `t_082b15aa` — header `DataTable` sticky (frontenddeveloper).
- `docs/traceability.md` §10 — pemetaan laporan ini ke kartu.
- `docs/pertanyaan-pemilik.md` §7 (laporan tidak lagi kosong) + §8 (P13-P15).
- `docs/usulan.md` U11 (KPI §9) + U12 (palet/hex warna).
- `docs/catatan-techlead.md` — catatan verifikasi putaran ini.
- `docs/bugs/owner3-tanpa-detail.md` — penanda bahwa laporan sudah terisi dan diverifikasi.

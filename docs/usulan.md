# Usulan — belum disetujui, tidak dikerjakan

Aturan berkas ini: usulan **di luar dokumen acuan** tidak boleh dikerjakan sebelum pemilik/PRD menyetujui.
Setiap butir menyebut berkas dokumen yang harus berubah lebih dulu, biaya, dan kartu yang akan muncul.
Tidak ada usulan di sini yang sudah masuk lingkup kartu berjalan.

## U1 — Kolom "nilai minimum" stok per varian

- Asal: permintaan kartu F4 `t_321bf03c` butir 1 (lihat `docs/keputusan-f4-stok.md` §2.1).
- Manfaat: ambang "kritis" bisa berbeda per varian (mis. produk cepat laku vs produk musiman).
- Yang harus berubah lebih dulu: `docs/PRD.md` §9 baris 255 (isi tabel) + §6 (model data) dan `docs/db.md`
  (kolom baru, mis. `product_variants.min_stock`); lalu kontrak §12.12 (`status` per baris + `ringkasan.kritis`),
  §12.1 (`ringkasan.stok_kritis`), §12.3/§12.6 (field form varian), dan dashboard PRD baris 252 ("stok kritis (< 5)").
- Biaya: migrasi + backfill nilai bawaan 5 + perubahan StockController/ProductController + form varian + QA.
- Rekomendasi techlead: **tunda**. Ambang global 5 sudah dipakai konsisten di dashboard, daftar produk, dan stok.

## U2 — Aksi "set stok" absolut (rute baru)

- Asal: permintaan kartu F4 `t_321bf03c` butir 2 (lihat `docs/keputusan-f4-stok.md` §2.2).
- Manfaat: menyetel stok ke angka pasti tanpa membuka form produk (satu klik lebih sedikit), tetap tercatat audit.
- Yang harus berubah lebih dulu: `docs/PRD.md` §5.2 (`docs/PRD.md:139-173` — daftar tetap rute admin, tambah
  mis. `POST /admin/stok/{variant}/setel`) + §9 baris 255 (daftar aksi); lalu kontrak §12.12 (bagian aksi) sebagai §12.12a.
- Biaya: rute baru + `StockService` (sudah ada `adjustTo` untuk jalur form) + validasi `stock` target + modal
  "Setel" F4 diubah dari penjelas menjadi form + test kontrak QA + kartu frontend kecil.
- Rekomendasi techlead: **usulan paling masuk akal bila pemilik memang sering menyetel stok**; tanpa amendemen
  PRD §5.2 tidak boleh dibangun (rute baru = fitur baru).

## U3 — Kolom `stock_before` / `stock_after` pada riwayat pergerakan

- Asal: permintaan kartu F4 `t_321bf03c` butir 3 (lihat `docs/keputusan-f4-stok.md` §2.3).
- Manfaat: riwayat langsung terbaca "3 → 13" tanpa menjumlahkan sendiri; jejak audit lebih kuat.
- Yang harus berubah lebih dulu: `docs/db.md` + PRD §6 (kolom `stock_movements`), lalu kontrak §12.15 (bentuk baris).
- Biaya: migrasi 2 kolom + penulisan nilai di semua jalur (`stocks.in`, `stocks.out`, `adjust` form produk, `sale`
  dari checkout) + `null` untuk baris lama (tidak bisa direkonstruksi andal → tampil "-") + QA.
- Rekomendasi techlead: **tunda**; nilai `signed_qty` + stok terkini sudah cukup untuk operasi harian.

## U4 — Filter rentang tanggal pada riwayat stok

- Asal: permintaan kartu F4 `t_321bf03c` butir 4 (lihat `docs/keputusan-f4-stok.md` §2.4).
- Manfaat: menelusuri pergerakan pada periode tertentu (audit bulanan) tanpa menggulir halaman.
- Yang harus berubah lebih dulu: kontrak §12.15 (tambah `dari`, `sampai` — pola sudah ada di §12.16 baris 1340);
  PRD baris 255 tidak menyebut filter tanggal untuk stok, jadi sebaiknya PRD §9 baris 255 ikut dilengkapi.
- Biaya: **paling murah** dari keempat usulan — tanpa rute baru, tanpa migrasi; `StockController@history`
  menambah dua `whereDate` + toolbar `History.jsx` menambah dua field tanggal + test kontrak QA.
- Rekomendasi techlead: **prioritas pertama bila pemilik ingin menambah satu hal saja** kepada halaman stok.

## U5 — Nomor resi terlihat pembeli + tautan lacak kurir

- Asal: PRD A15 (`docs/PRD.md:391`) hanya mewajibkan resi *diisi admin*; F5 `t_018b2723` + keputusan
  `t_394b40ba` membangun isian di `/admin/pesanan/{order}` saja (kontrak §12.18a).
- Manfaat: pembeli bisa memantau kiriman tanpa bertanya lewat pesan masuk; mengurangi beban balas pesan.
- Yang harus berubah lebih dulu: PRD §5.1 (alur pesanan pembeli) + PRD §6 (bila ada kolom baru, mis.
  `courier`/`shipped_at`) + kontrak §7.9 (halaman sukses checkout) atau halaman baru riwayat pesanan
  pembeli — sekarang belum ada rute riwayat pesanan pembeli di PRD §5.1.
- Biaya: sedang-tinggi — tampilan pembeli (mobile-first), penyamaran/validasi nomor resi, opsional
  tautan lacak per kurir (butuh daftar kurir + pola URL), QA dua sisi. Integrasi API ekspedisi
  (cek status otomatis) jauh lebih mahal dan butuh kredensial mitra.
- Rekomendasi techlead: **tunda**. Nilai operasional harian kecil dibanding biaya, dan halaman publik
  belum punya tempat resmi untuk menampilkannya. Bila pemilik ingin, mulai dari "resi tampil read-only
  di halaman selesai checkout" (tanpa integrasi kurir) sebagai langkah pertama yang murah.

## U6 — Tombol "tandai lunas" untuk pesanan mode uji

- Asal: gerbang pemilik `t_fcfc3687` (laporan #2 dan #5). Alur mode uji (`MIDTRANS_FAKE=true`) sengaja tidak
  menyentuh jaringan, sehingga pesanan uji mandek di "menunggu pembayaran"; aksi admin yang ada hanya
  `orders.status` (ubah status manual) dan `orders.resi`.
- Manfaat: demo/uji internal bisa menuntaskan satu pesanan sampai "dibayar" tanpa kredensial Midtrans.
- Yang harus berubah lebih dulu: PRD §5.2 (rute admin baru) atau keputusan pemilik bahwa ini alat demo;
  kontrak §12 baru; catatan di `docs/design.md` §5.12. Berisiko disalahgunakan bila kelak `MIDTRANS_FAKE`
  lupa dimatikan — usul: tombol hanya muncul saat mode uji aktif. **Tidak dibangun sekarang.**
- Biaya: kecil-sedang (rute + tombol + test mode uji), tetapi menambah satu jalur yang mengubah status bayar
  tanpa bukti pembayaran — karena itu keputusan pemilik dulu.
- Rekomendasi techlead: **tunda** sampai jalur sandbox asli (Uji G1) terbukti; kalau sandbox sudah jalan,
  tombol ini tidak lagi diperlukan.

## U7 — Menu dropdown profil di header (Masuk/Daftar, pesanan saya, keluar)

- Asal: laporan pemilik #7 ("tambah tombol register saat klik profil"). Perbaikan yang dikirim kartu
  `t_e3f68f7f` bersifat minimal: tamu mendapat tautan "Daftar" di header/drawer, tanpa menu.
- Manfaat: pola baku toko daring — klik profil memunculkan pilihan (Masuk, Daftar, Pesanan saya, Keluar);
  mengurangi jumlah tautan yang berdesakan di header ponsel.
- Yang harus berubah lebih dulu: PRD §5.1/§5.3 (alur & halaman pembeli) bila memuat "pesanan saya".
  Sekarang tidak ada rute riwayat pesanan pembeli (lihat U5), jadi menu hanya bisa memuat Masuk, Daftar,
  dan Keluar untuk user yang sudah login.
- Biaya: kecil bila hanya Masuk/Daftar/Keluar (komponen dropdown + tutup-otomatis + aksesibilitas
  keyboard/ARIA + QA visual); sedang bila sekalian menambah halaman "pesanan saya" (butuh PRD + rute + kontrak).
- Rekomendasi techlead: **tunda** bagian "pesanan saya"; bagian Masuk/Daftar/Keluar boleh dikerjakan bersama
  deviasi desain kartu `t_46901364` bila pemilik memang menginginkan menu, bukan tautan.

## U8 — Tahan `order_id` ganda saat charge ulang ke Midtrans

- Asal: gerbang G1 `t_fcfc3687`. `MidtransService::chargeParams()` memakai `order_id` = kode pesanan
  (`app/Services/MidtransService.php:486`), jadi satu pesanan hanya boleh di-`charge` sekali. Kejadian
  22 Okt: `charge` sudah berhasil membuat transaksi di Midtrans, lalu aplikasi gagal 500 di `qrUrl()`
  (`:540`); pesanan itu kini "terbakar" — charge ulang ditolak Midtrans karena `order_id` ganda, dan
  QR-nya tidak pernah bisa ditampilkan lagi.
- Manfaat: pesanan yang gagal setelah charge (galat kode, timeout, deploy di tengah jalan) bisa
  diselamatkan tanpa membuat pesanan baru; juga menutup celah pesanan menggantung bagi pembeli nyata.
- Yang harus berubah lebih dulu: kontrak §7.5/§7.7 (perilaku saat Midtrans menolak duplikat — panggil
  `Transaction::status` lalu pakai tagihan yang ada, atau `order_id` bersufiks + catatan), test regresi.
- **Status 22 Okt 2026: TIDAK ditunda lagi** — begitu B4 selesai, terlihat bahwa pesanan yang gagal
  setelah charge memang tidak bisa diulang (kode pesanan berikutnya sama karena `nextCode()` memakai
  `count()+1`), jadi G1 terhalang. Keputusan techlead: **`order_id` bersufiks unik per panggilan charge**
  (pilihan paling kecil, tanpa jalur baru), disimpan di `payments.order_id_midtrans`; dikerjakan kartu
  **B5** `t_a90d5215`. Opsi "panggil `Transaction::status` lalu pakai tagihan yang ada" tidak dipilih
  untuk sekarang — lebih besar dan tidak menyelesaikan pesanan yang belum punya baris `payments`.
- Biaya: kecil.

## U9 — Hapus kunci `settings` `midtrans_client_key` / `midtrans_is_production`

- Asal: P3 (`docs/pertanyaan-pemilik.md` §6 P10). Keputusan techlead 22 Okt 2026 (kartu `t_abb37557`):
  **dipertahankan sebagai catatan**, bukan dihapus — PRD §6 (`docs/PRD.md:199`) mewajibkan kedua kunci,
  jadi penghapusan butuh amendemen PRD lebih dulu.
- Bila pemilik kelak memilih hapus, yang harus berubah: PRD §6 + `docs/db.md:120-128` + `docs/kontrak-props.md`
  §2 (baris `128-129`, `889-890`, `917`, `923`, `952-953`); backend `SettingService::DEFINITIONS:46-47`,
  `UpdateSettingRequest:56-57` (+ pesan `:97`), `SettingSeeder` (`:219`, `:226`), daftar key wajib
  `VerifiesSeedData:86`, dan `tests/Unit/Services/SettingServiceTest.php:77-87` (satu-satunya pemakai
  `format => 'bool'`); **migrasi data** penghapus 2 baris `settings` — tanpa itu keduanya muncul sebagai
  grup `lainnya` (`SettingService.php:85-89`); frontend `Settings/Index.jsx` (`:55`, `:451-452`, `:637`,
  `:2040-2067`); desain §5.13 + D11.
- Manfaat: satu sumber kebenaran untuk kredensial; risiko: menyimpang dari PRD sebelum diamendemen dan
  tiga kartu kerja (backend, uiux, frontend) + QA untuk nilai yang tidak dipakai jalur bayar.
- Biaya: kecil–sedang; **rekomendasi: tunda** sampai pemilik meminta eksplisit.

## U10 — Settlement yang datang setelah status lokal `expire`/`batal` dibuang diam-diam

- Asal: temuan baca-saja techlead 22 Okt 2026 (kartu `t_fcfc3687`, putaran 3). `MidtransService::applyStatus()`
  (`app/Services/MidtransService.php:386-392`) sengaja berhenti bila status lokal sudah `expire`/`deny`/`cancel`
  ("Settlement bersifat final; status batal tidak bisa berubah lagi").
- Risiko yang terlihat: bila pembayaran ditutup mendekati batas lalu `settlement` datang **setelah** aplikasi
  menutup pesanan (stok sudah dikembalikan), status itu dibuang **tanpa jejak log** — uang bisa masuk padahal
  pesanan tampil "Batal". Seberapa mungkin: **belum dicek**, butuh data Midtrans; jangan dianggap bug terbukti.
- Usulan minimum (bila pemilik mau): tidak mengubah keputusan bisnis — cukup `Log::warning` + penanda
  "perlu rekonsiliasi" ketika payload memuat `settlement_time` padahal status lokal terminal, lalu admin
  menindak manual (refund atau buka kembali pesanan). Biaya: kecil (satu berkas backend + 1 test).
- Keputusan menunggu pemilik; **bukan** dikerjakan sendiri oleh techlead.

## U11 — Lengkapi KPI dashboard sesuai PRD §9

- Asal: QA O-4 (`docs/verifikasi-pemilik-t_18650721.md` §6) + keputusan techlead 22 Okt 2026
  (`docs/review-3.md` §8). Dashboard sekarang hanya punya 4 KPI: omzet total, pesanan pending,
  pesanan total, produk aktif. PRD §9 meminta omzet hari ini/7/30 hari, pesanan per status, dan
  produk terlaris; desain §5.11 hanya menggambar 4 kartu (hari ini, 30 hari, pesanan baru, AOV).
- Rekomendasi techlead: **tunda ke rilis 1.1** dan selesaikan dulu konflik metrik PRD vs desain.
  Bila dikerjakan: satu kartu uiux (rekonsiliasi §5.11 + deviasi D), satu kartu backend
  (`DashboardService` + kontrak `docs/kontrak-props.md` §6.13 + test), satu kartu frontend
  (KpiCard/ChartCard + empty/error state), lalu QA. Biaya: sedang; menyentuh berkas dashboard
  bersama beberapa kartu.
- Keputusan pemilik: `docs/pertanyaan-pemilik.md` P14.

## U12 — Palet warna varian yang bisa diperluas / input hex di form

- Asal: QA O-2 (`docs/verifikasi-pemilik-t_18650721.md` §6); pemilik memakai nama warna di luar
  palet (`Broken White`). `VariantColor` sudah menerima `#RGB`/`#RRGGBB`, tetapi form varian hanya
  memberi placeholder "Mis. Hitam" — pemilik tidak tahu hex didukung, dan hex tampil sebagai nama
  warna di label.
- Usulan minimum: tambah alias palet (mis. `broken white`, `off white`, `ivory`, `cream`) di
  `app/Support/VariantColor.php` + test; tanpa migrasi. Opsi lebih besar: kolom `color_hex` opsional
  per varian (migrasi + kontrak + form) — hanya bila pemilik butuh warna bebas.
- Biaya: kecil (alias) / sedang (kolom hex). **Belum dikerjakan**; menunggu P15.

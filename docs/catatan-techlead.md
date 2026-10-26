# Catatan Techlead

Temuan di luar lingkup kartu berjalan. Tidak memblokir; dipakai saat verifikasi dan rilis.

## Verifikasi papan (K1, 20 Okt 2026)

- 16 kartu (K1–K16) ada, assignee sesuai PRD §13, `skills` kosong semua, `workspace_kind='dir'`, `workspace_path='C:/Users/LENOVO/Downloads/toko-kulot'` untuk semuanya. Graf parent persis PRD §13 (diperiksa lewat `task_links`).
- Kartu gerbang pemilik 1 (`t_7c685183`, setelah K1) dan gerbang 2 (`t_e16ab638`, setelah K3) ditambahkan techlead untuk menegakkan R15; keduanya berstatus blocked sampai pemilik membalas. Gerbang 1 menahan K2 (`t_4f753735`) dan K3 (`t_be9df826`); gerbang 2 menahan K10 (`t_3ce04d50`).
- Kartu kebersihan repo `t_e0ab9215` (devops, anak K2) dibuat dari temuan lingkungan poin 1.

## Temuan lingkungan (di luar lingkup K1)

1. **Folder agent masih ter-track (R4).** HEAD `0c3d4d8` memuat 58 berkas `.agent/skills/**`; working tree sudah menghapusnya (3422 entri `D` di `git status`) tetapi belum di-commit. Total ada juga folder `.claude/`, `.cursor/`, `.gemini/`, `.windsurf/`, `.trae/`, `.roo/`, `.qoder/`, `.opencode/`, `.kiro/`, `.kilocode/`, `.warp/` di riwayat. Ini melanggar R4 dan DoD global §15 poin 5 bila ter-commit ulang → dibuatkan kartu kebersihan repo untuk devops.
2. **Riwayat git tidak sesuai stack.** Dua commit terakhir berjudul "K2: Kerangka proyek (Next.js + SASS)" dan "K3: Inisialisasi Next.js dan penyesuaian struktur", sedangkan PRD §4.1 menetapkan Laravel 11 + Inertia + React. Working tree sekarang skeleton Laravel yang seluruhnya masih untracked. Prefix ID kartu di riwayat lama bertabrakan dengan ID K2/K3 versi PRD → dicatat sebagai Q2 di `docs/pertanyaan-pemilik.md`.
3. **Fondasi belum lengkap (bukan pelanggaran, sekadar status).** `routes/` hanya berisi `web.php` dan `console.php` (belum ada `admin.php`); `database/migrations/` baru 3 migrasi bawaan; `resources/js/` baru `app.js`, `app.jsx`, `bootstrap.js` (belum ada `Layouts/`, `Pages/`, `Components/`); `node_modules` belum ada sehingga `npm run build` belum bisa diverifikasi. Semua ini pekerjaan K2/K4/K6.
4. **`.env.example` belum lengkap.** Belum memuat `MIDTRANS_*` yang diwajibkan PRD §8 (diverifikasi dengan `grep -E '^[A-Z_]+=' .env.example`). Menjadi bagian DoD K2.
5. **`.env` pemilik aman.** Berkas ada di root, sudah masuk `.gitignore`, tidak dibaca/diubah techlead (R3).
6. **Versi React.** `package.json` memasang React 19 sementara PRD §4.1 menulis React 18 → Q1 di `docs/pertanyaan-pemilik.md`.
7. **`docs/design.md` sudah ada sebelum K3.** 433 baris, 9 bagian. K3 diarahkan menjadi audit + pelengkapan, bukan penulisan dari nol (lihat `docs/brief-uiux.md`).

## Cara techlead memverifikasi (dipakai konsisten)

- Membaca berkas + `git diff`/`git status` (baca-saja). Tidak menjalankan composer/npm/artisan, tidak menyalakan server (R5, R11).
- Pemeriksaan yang butuh browser/server ditulis "belum dicek, butuh browser" atau "belum dicek, butuh server pemilik".
- Setiap klaim di laporan techlead menyertakan bukti: `path:baris` atau perintah + keluaran ringkas.

## Gerbang pemilik 2 — design.md disetujui (20 Okt 2026, 11:04)

- Pemilik membalas "sudah" di kartu `t_e16ab638` (komentar 20 Okt 2026 11:04) → design.md v2.0 **disetujui**; gerbang dibuka, K10 (`t_3ce04d50`, frontenddeveloper) dilepas.
- Bukti yang diperiksa techlead sebelum membuka: `docs/design.md` ada 817 baris (57.414 byte, mtime 11:00), `docs/komponen.md` 126 baris, `docs/design-catatan-rea.md` ada, token §2 ter-resolve di `tailwind.config.js` (laporan K3: `node token-check.mjs` OK 52 token), `npm run build` exit 0 (laporan K3).
- **Belum dicek techlead (butuh browser/halaman berjalan):** uji visual 360/768/1280, kontras seluruh kombinasi token, dan perilaku state loading/empty di halaman nyata → dieksekusi di K10 dan QA.
- Drift terbuka yang diwariskan ke K10: **D1** self-host woff2 di `public/fonts` belum ada (`resources/views/app.blade.php:12-16` masih memuat Bunny Fonts via CDN + catatan TODO di komentar); **D2** ekstraksi komponen placeholder gambar dikerjakan saat slicing. Rujukan: `docs/design-catatan-rea.md`.
- Aturan R6/R15 terpenuhi: desain disetujui lebih dulu, slicing frontend baru berjalan setelah gerbang dibuka.

## Keputusan teknis: metode `admin.messages.read` (kartu `t_54bfee4e`, 20 Okt 2026)

**Keputusan: PATCH menang — `docs/PRD.md` §5.2 baris 157 adalah sumber kebenaran; `docs/kontrak-props.md` §10.2 diperbaiki dari POST menjadi PATCH.**

- Alasan 1 (hierarki dokumen): `docs/kontrak-props.md:3-6` menyatakan dirinya **DRAFT** dan bersumber dari PRD §5/§6/§7 — dokumen turunan tidak boleh mengalahkan sumbernya.
- Alasan 2 (konsistensi internal kontrak): rute parsial sejenis `admin.reviews.visibility` ditulis PATCH di `docs/kontrak-props.md:782` dan memang PATCH di `routes/admin.php:55`; jadi POST di §10.2 adalah penyimpangan tunggal, bukan pola.
- Alasan 3 (konsistensi PRD §5.2): PATCH untuk ubah status pesanan (baris 155), tanda dibaca (baris 157), visibilitas ulasan (baris 161); POST untuk aksi buat/proses (balas pesan, baris 158). `is_read` = update parsial → PATCH.
- Alasan 4 (biaya & risiko): perbaikan satu baris (`routes/admin.php:43`); belum ada pemanggil frontend (diverifikasi: `resources/js/Pages/Admin/Messages/Index.jsx` masih placeholder 25 baris tanpa aksi), jadi tidak ada klien yang rusak; test QA sudah mengharapkan PATCH (`tests/Feature/Contract/RouteContractTest.php:220`) sehingga konflik hilang begitu rute diselaraskan.
- Yang menyesuaikan: **backend** (metode rute), **QA** (dua berkas test + laporan), **frontend** (halaman pesan wajib memakai PATCH). Kartu perbaikan: `t_768819a7` (backenddeveloper), `t_d21ef249` (qatesting), `t_fc2c5b98` (frontenddeveloper). `t_768819a7` berparent `t_ed8bd8e4` (kartu 22 rute admin yang sedang berjalan) supaya `routes/admin.php` tidak ditulis dua worker sekaligus — berkas panas; kartu QA dan kartu halaman pesan berparent `t_768819a7` sehingga baru jalan setelah metode rute benar.
- Sebelum keputusan, test kontrak QA menandai konflik ini sebagai **Incomplete**, bukan gagal: `tests/Feature/Contract/RouteContractTest.php:210-212`, `docs/bukti-phpunit-k15.txt:191`.
- PRD **tidak diubah** (dia yang menang); keputusan dicatat di `docs/pertanyaan-pemilik.md` §4 sebagai keputusan teknis tanpa pertanyaan untuk pemilik.

## Temuan di luar lingkup `t_54bfee4e` (ditemukan saat memutuskan, 20 Okt 2026)

1. **Halaman admin selain dashboard masih placeholder dan tidak memakai props kontrak §10.** Controller K9 mengirim props kontrak — `app/Http/Controllers/Admin/MessageController.php:68-78` (`pesan`, `filter`, `ringkasan`), `app/Http/Controllers/Admin/ReviewController.php:99-111` (`ulasan`, `filter`, `ringkasan`), `app/Http/Controllers/Admin/SettingController.php:42-43` (`pengaturan`, `carousels`) — sementara komponen halaman mendeklarasikan nama lain: `resources/js/Pages/Admin/Messages/Index.jsx:6` (`messages`), `resources/js/Pages/Admin/Reviews/Index.jsx:6` (`reviews`), `resources/js/Pages/Admin/Settings/Index.jsx:5` (`settings`). Akibatnya tabel admin tampil kosong tanpa galat dan aksi wajib dokumen (design.md:635 "Tandai dibaca") belum ada. Halaman pesan → kartu `t_fc2c5b98`; halaman penilaian dan pengaturan → kartu `t_fc49ee38` (keduanya frontenddeveloper); **produk, kategori, stok, pesanan, akun** menunggu kontrak propsnya diterbitkan `t_ed8bd8e4` (backend 22 rute) sebelum bisa dipetakan — sengaja belum dibuatkan kartu agar techlead tidak menyusun spesifikasi di luar kontrak.
2. **Halaman publik & admin belum diuji ulang di browser setelah perbaikan.** `docs/laporan-qa.md` masih memuat NO-GO dengan QA-001…QA-004 terbuka; verifikasi browser terakhir (K15) menemukan halaman blank. Belum dicek techlead (butuh browser/server pemilik).
3. **Kartu duplikat `t_d98cf23d`** (techlead, keputusan yang sama, `workspace_kind='scratch'`) sudah archived sebelum `t_54bfee4e` dibuat; keputusan dikerjakan di `t_54bfee4e` yang ber-workspace `dir` benar.

## Keputusan teknis: kolom pencarian global topbar admin (kartu `t_b5de72e3`, 20 Okt 2026)

**Keputusan: opsi (c) — kolom `⌕ cari` di topbar shell admin (design §5.10, `docs/design.md:591`) TIDAK dibangun; pencarian admin tetap lewat toolbar per halaman daftar (design §5.12). Tidak ada rute baru, tidak ada kode fitur baru.**

- **Alasan 1 (hierarki dokumen + larangan rute baru).** PRD §5.2 "Peta Rute (kontrak wajib)" memuat daftar tetap rute admin tanpa endpoint pencarian (`docs/PRD.md:139-170`). Opsi (a) — backend menambah rute pencarian global — berarti menambah fitur di luar dokumen acuan plus pekerjaan backend dan QA baru; itu wewenang pemilik lewat amendemen PRD §5.2, bukan keputusan techlead.
- **Alasan 2 (kapabilitas sudah ada, per halaman).** Design §5.12 (`docs/design.md:630`) menetapkan pola baku tiap halaman daftar: `PageHeader` → toolbar (search + filter) → `Table` → `Pagination`, dengan komponen `SearchInput`/`TableToolbar` (`docs/komponen.md:53,84`). Backend sudah menerima `q` di **semua** endpoint daftar admin: `app/Http/Controllers/Admin/ProductController.php:38`, `CategoryController.php:31`, `StockController.php:35` dan `:120`, `OrderController.php:32`, `AccountController.php:32`, `MessageController.php:26`, `ReviewController.php:30`. Jadi pencarian global tidak menambah kemampuan apa pun, hanya jalur kedua yang duplikatif di atas sidebar (jaraknya satu klik).
- **Alasan 3 (opsi b ditolak: preseden cacat + state karangan).** Kontrol cari yang tampil tetapi tidak bisa mencari adalah kelas cacat yang sudah diputus QA: QA-007 menuntut penghapusan item sidebar ber-`disabled`/`aria-disabled` (`docs/laporan-qa.md:277`, kartu `t_6ee422f2`). Design §5.10 hanya mendefinisikan state `default`/`collapsed`/`drawer-open` (`docs/design.md:610`) — tidak ada state "cari nonaktif", jadi opsi (b) akan mengarang state baru.
- **Konsekuensi.** Topbar tetap = hamburger (mobile) + label "Panel Admin" (`:179`) + menu avatar; blok `<header>` topbar ada di `resources/js/Layouts/AdminLayout.jsx:168-221` (`</header>` di `:221`) dan tidak berubah. Verifikasi aktual techlead (baca-saja): `grep -n "cari" resources/js/Layouts/AdminLayout.jsx` → 0 hasil; checklist design §9 (`docs/design.md:729-753`) tidak punya butir kolom cari, jadi tidak ada butir QA yang batal.
- **Sisi pemilik.** Deviasi dicatat di `docs/pertanyaan-pemilik.md` §4 (T3) sebagai keputusan teknis tanpa pertanyaan wajib. Bila pemilik ingin kolom cari dihidupkan, yang harus berubah lebih dulu adalah PRD §5.2 (menambah rute pencarian) → kartu backend + QA baru.
- **Kartu lanjutan.** `t_5fcdbae3` (uiux — baris drift **D8** di design §11.3 + catatan di §5.10 + riwayat revisi v2.1; berparent `t_8cd61512` karena `docs/design.md` berkas panas) dan `t_944aea1e` (frontenddeveloper — perbarui dua catatan known issue + komentar kepala berkas `AdminLayout.jsx`; berparent `t_e5149746` + `t_099c813c` karena `docs/catatan-frontend*.md` berkas panas). Keduanya `workspace_kind='dir'` @ `C:\Users\LENOVO\Downloads\toko-kulot`. Keputusan ini tidak menuntut perubahan kode, jadi tidak ada kartu QA baru.
- **Belum dicek (butuh browser).** Perilaku nyata topbar (klik, fokus, 360–1280 px) tidak diperiksa techlead; tidak ada server yang dinyalakan dan kredensial admin dipegang pemilik. Status: "belum diuji, butuh browser".

## Temuan di luar lingkup `t_b5de72e3` (20 Okt 2026)

1. **Kartu `t_8cd61512` (uiux, kontras badge `StatusBadge`) ber-workspace `scratch`.** Kartu itu perlu menulis `docs/design.md` §4.21 di repo, tetapi dibuat dengan `workspace_kind='scratch'` (`C:\Users\LENOVO\AppData\Local\hermes\kanban\boards\toko-kulot\workspaces\t_8cd61512`) dan sudah ter-dispatch. Perlu dipindahkan ke `dir` @ `C:\Users\LENOVO\Downloads\toko-kulot` (temuan yang sama sudah dikomentari frontenddeveloper di kartu tersebut, 20 Okt 2026 15:12). Karena kartu deviasi D8 (`t_5fcdbae3`) berparent kartu itu, D8 ikut tertahan sampai `t_8cd61512` selesai.
2. **Lima halaman daftar admin masih placeholder** (26–29 baris: `resources/js/Pages/Admin/{Products,Orders,Stocks,Categories,Accounts}/Index.jsx`), sehingga toolbar search §5.12 baru terpasang di `Messages/Index.jsx` dan `Reviews/Index.jsx`. Bukan temuan kartu ini: `Categories`/`Accounts` → `t_e5149746`; `Products`/`Orders`/`Stocks` menunggu kontrak props `t_ed8bd8e4` (lihat temuan di luar lingkup `t_54bfee4e` poin 1).

## Verifikasi laporan pemilik (21 Okt 2026, kartu `t_15531332`)

Empat butir laporan pemilik diverifikasi statis (baca-saja, tanpa server/browser). Rincian bukti,
akar masalah, dan rekomendasi Go bersyarat ada di `docs/review.md`. Ringkasnya:

1. **Badge keranjang selalu 0** — `resources/js/Layouts/PublicLayout.jsx:22,43` memakai `cartCount`
   (bawaan `0`) sebelum shared `cart.count` (`app/Http/Middleware/HandleInertiaRequests.php:39-41`);
   tidak ada controller yang mengirim prop `cartCount`. Kartu **F1** (frontend).
2. **QRIS tidak bisa ditransfer** — tiga akar: mode `fake` bawaan aktif & tidak terlihat
   (`config/midtrans.php:31`, `app/Services/MidtransService.php:26-29`; `fake` tidak pernah dibaca
   `Pages/Public/CheckoutPay.jsx`), pengaturan Midtrans di panel admin tidak dipakai jalur pembayaran
   (`app/Services/SettingService.php:46-47` vs `config('midtrans.*')`), dan tagihan lama tidak pernah
   dibuat ulang (`app/Http/Controllers/CheckoutController.php:85-104,112`). Kartu **B1** (backend) + **F2** (frontend).
3. **Masa berlaku 15 → 5 menit** — keputusan pemilik menggantikan PRD §8/A17; `config/midtrans.php:33`
   masih hard-code 15 menit. Kartu **B2** (backend); catatan di `docs/pertanyaan-pemilik.md` §5.
4. **Panel admin produk/stok/pesanan kosong** — tiga halaman placeholder (`Products/Index.jsx:6` dst,
   25–29 baris) plus **lima halaman belum ada** (`Admin/Products/{Create,Edit,Show}`, `Admin/Orders/Show`,
   `Admin/Stocks/History`); kontrak §12 dan controller-nya sudah siap (`docs/kontrak-props.md:1067-1259`).
   Inilah celah perencanaan yang tercatat di poin 2 di atas: kartu lanjutan tidak pernah dibuat setelah
   kontrak §12 terbit. Kartu **F3/F4/F5** (frontend), dirantai agar `public/build` tidak dibangun bersamaan.

Temuan pendukung: halaman selesai checkout mengabaikan prop `ulasan.boleh` (kontrak §9.1) sehingga form
penilaian tetap tampil walau order belum lunas — kartu **F6**. Kelengkapan kartu: `docs/review.md` §6.

## Keputusan teknis: `/admin/stok` — empat permintaan kartu F4 di luar kontrak (kartu `t_a24a79d0`, 21 Okt 2026)

**Keputusan: keempatnya TIDAK dibangun; F4 tidak direvisi; tidak ada perubahan kontrak, desain, backend, atau
kode.** Rincian bukti per butir: `docs/keputusan-f4-stok.md`. Ringkasan pemilik-facing: `docs/pertanyaan-pemilik.md` §4 (T4).

- **Alasan 1 (item 1 — kolom "nilai minimum").** PRD baris 255 (`docs/PRD.md:255`) dan kontrak §12.12
  (`docs/kontrak-props.md:1282-1303`) menutup daftar kolom baris stok; ambang kritis ditulis sebagai angka global
  di PRD baris 252 ("stok kritis (< 5)") dan kontrak baris 1302 (`habis` 0, `kritis` 1–4, `aman` ≥ 5). Skema
  varian juga tanpa kolom pembatas (`database/migrations/2026_10_20_000006_create_product_variants_table.php:15-25`).
  `grep "min_stock|nilai minimum|stok minimum" docs/kontrak-props.md` → 0 hasil. Jadi "nilai minimum" adalah
  permintaan yang lahir dari **kartu F4 tulisan techlead**, bukan dari dokumen acuan; yang menyesuaikan: kartu/dokumen.
- **Alasan 2 (item 2 — aksi "set stok" absolut).** Rute stok hanya masuk/keluar (`routes/admin.php:122-130`), tetapi
  jalur absolut sudah ada: form produk `GET /admin/produk/{product}/ubah` (`routes/admin.php:101`) dan kontrak §12.6
  baris 1236 mencatat perubahan stok dari form sebagai `stock_movements` tipe `adjust`. Frontend memakai modal
  penjelas + tautan ke form itu (`resources/js/Pages/Admin/Stocks/Index.jsx:464-488`) — tidak ada rute karangan.
  Rute `.../setel` baru berarti PRD §5.2 (`docs/PRD.md:139-173`) berubah lebih dulu → pekerjaan backend/QA baru.
- **Alasan 3 (item 3 — "stok sebelum → sesudah").** `stock_movements` tidak punya kolom before/after
  (`database/migrations/2026_10_20_000007_create_stock_movements_table.php:14-29`); kontrak §12.15 mengirim `qty`
  + `signed_qty` (baris 1322-1333). Menampilkannya menuntut migrasi + kontrak + kartu baru, dan baris lama tetap
  kosong (tidak bisa direkonstruksi andal) — manfaatnya kecil dibanding biaya.
- **Alasan 4 (item 4 — filter tanggal riwayat).** §12.15 baris 1317 hanya `q, tipe, varian, page`, sementara §12.16
  baris 1340 (pesanan) memang punya `dari`/`sampai` sesuai PRD baris 256. Untuk stok tidak diminta → ketiadaannya
  konsisten, bukan kelalaian.
- **Konsekuensi.** Tidak ada kartu lanjutan kode. QA `t_3a240a11` menguji terhadap kontrak §12.12–§12.15 + PRD
  baris 255 + pola design §5.12; keempat hal di atas bukan cacat. `docs/design.md` tidak perlu baris drift baru:
  §5.12 baris 684 mendelegasikan isi `/admin/stok` & `/admin/stok/riwayat` ke "PRD §9", dan pencarian
  "nilai minimum|Setel|sesudah|rentang tanggal" di design hanya menemukan baris 630 (kartu penilaian) + 684 (delegasi).
- **Sisi pemilik.** Usulan + biaya + urutan prioritas (U4 filter tanggal paling murah) ada di `docs/usulan.md`;
  bila pemilik ingin salah satunya, PRD §5.2/§9 + `docs/db.md` + kontrak §12 harus berubah lebih dulu.
- **Temuan pendukung.** (a) Rujukan kartu F4 "design.md §5.8" salah alamat (§5.8 = halaman bayar/selesai); yang benar
  design §5.10 + PRD baris 255 + pola §5.12 — dokumen acuan tidak salah. (b) Superset kontrak kecil:
  `varianOptions()` mengirim `sku` di daftar varian filter §12.15; tidak merusak, dirapikan backend saat §12
  keluar dari DRAFT (aturan `docs/review.md` §4 poin 3).
- **Belum dicek (butuh browser).** Perilaku nyata modal "Setel stok" dan aksi stok end-to-end (POST masuk/keluar)
  tidak diperiksa techlead; tidak ada server yang dinyalakan dan kredensial admin dipegang pemilik.

## Keputusan teknis: nomor resi manual (PRD A15) — kartu `t_394b40ba`, 21 Okt 2026

**Keputusan: DIBANGUN.** Rincian + alasan: `docs/keputusan-a15-resi.md`. Ringkasan pemilik-facing:
`docs/pertanyaan-pemilik.md` §4 (T5) + §3 (Q8).

- **Masalah.** Kartu F5 `t_018b2723` menutup DoD "nomor resi bisa disimpan" sebagai tidak terpenuhi:
  `orders` tanpa kolom resi, `routes/admin.php` tanpa rute resi (hanya `orders.index|show|status`),
  kontrak §12.17 tanpa field resi. Bukti temuan itu: `resources/js/Pages/Admin/Orders/partials/InfoResi.jsx`
  (notice lama) dan `docs/catatan-frontend.md` (bagian F5).
- **Yang dibekukan.** Kolom `orders.tracking_number` string(60) null; migrasi `2026_10_21_000019`;
  rute `PATCH /admin/pesanan/{order}/resi` (`admin.orders.resi`, `throttle:admin-write`); FormRequest
  `UpdateOrderTrackingRequest` (`nullable|string|max:60`, `''` → `null`); `OrderController@resi` hanya
  mengubah kolom itu + `flash.success` = `Nomor resi pesanan diperbarui.`; props `pesanan.tracking_number`
  (kontrak §12.17) dan perilaku rute (kontrak §12.18a, `docs/kontrak-props.md:1389-1400`).
- **`docs/PRD.md` tidak diubah.** A15 sudah memuat fiturnya; rute + kolom adalah cara teknis. Menambah baris
  di §5.2/§6 menggeser nomor baris PRD yang dipakai bukti kartu lain (`docs/PRD.md:219`, `:255`, `:377`, `:391`).
  Amendemen diminta ke pemilik lewat Q8 (tidak memblokir, PRD R7/R10). Ini beda dari T4 (stok): keempat butir
  di sana tidak ada di PRD sama sekali, jadi tidak dibangun.
- **Kartu lanjutan.** `t_b078318d` backend (kolom + rute + validasi + test), `t_0729c67f` uiux (drift D12 di design §11.3
  + catatan §5.12 karena isian resi belum digambar), `t_d1028202` frontend (isian di kartu "Pengiriman" + hapus notice,
  berparent backend + uiux), `t_2c9f8b01` QA (§12.18a terhadap kode, berparent frontend). Gerbang rilis `t_e83922f2`
  kini juga berparent `t_2c9f8b01`. Tidak ada dua kartu paralel pada berkas yang sama; `kanban_link` ke backend/uiux
  ditolak karena keduanya sudah berjalan (dicatat di `docs/traceability.md` §8).
- **Kartu usang.** `t_92fcaafd` (duplikat tak terpakai dari kartu ini, workspace `scratch`) sudah ditandai USANG di
  komentarnya; kartu itu **tanpa anak** dan kini berstatus `blocked` meminta pemilik mengarsipkannya — techlead tidak
  mengarsipkan karena alat di sesi ini tidak menyediakan aksi arsip.
- **Belum dicek (butuh browser).** PATCH `/admin/pesanan/{order}/resi` dengan sesi admin nyata (toast sukses,
  galat 422 di bawah input, nilai tersimpan setelah muat ulang): belum dicek; tidak ada server dinyalakan dan
  kredensial admin dipegang pemilik. Dijadwalkan ke kartu QA lanjutan.

## Keputusan teknis: `ulasan.boleh` §7.9 vs `CheckoutController::success` — kartu `t_2b031326` (21 Okt 2026)

- **Masalah.** Kartu F6 `t_2de36f29` melaporkan `app/Http/Controllers/CheckoutController.php:176` (blok props
  :173-179) mengirim `'boleh' => $reviewedProductIds === []`, yaitu `true` hanya bila belum ada ulasan
  **sama sekali**; kontrak §7.9 sebelum pembekuan (`docs/kontrak-props.md:526`) berbunyi "belum mengulas
  **semua** produk". Pada pesanan 2 produk yang baru 1 diulas, §7.9 seharusnya masih `true`, server mengirim `false`.
- **Keputusan.** **Server diperbaiki ke §7.9; kontrak tidak dilonggarkan.** Definisi §7.9 diperjelas dan
  dibekukan: `boleh` = `true` hanya bila §9.1 menerima minimal satu kiriman ulasan sekarang —
  `settlement` + `status` ∈ (`dibayar`,`diproses`,`dikirim`,`selesai`) + masih ada `product_id` unik pada
  `pesanan.items` yang belum diulas. `ulasan.sudah` dan bentuk respons tidak berubah.
- **Alasan menolak alternatif "perjelas §7.9 jadi belum ada ulasan".** §9.1 (`docs/kontrak-props.md:700`,
  aturan baris 719-720) + `ReviewService::store` masih menerima ulasan produk sisa; definisi itu akan membuat props
  berbohong dan mematikan form penilaian sisa di layar.
- **Temuan tambahan T1 (di luar laporan F6).** Gate klien di `resources/js/Pages/Public/CheckoutSuccess.jsx:53-54`
  setara `syaratDinilai && pending.length > 0` — nilai `boleh` **tidak berpengaruh**. DoD F6 "menghormati
  `ulasan.boleh`" karena itu belum benar-benar tercapai (tidak berbahaya, gate §9.1 lokal menahan). Kartu
  `t_02c3d20c` menyederhanakan gate ke `boleh && pending.length > 0`.
- **Temuan tambahan T2.** `settlement` + status `batal` bisa terjadi (`Order::nextStatuses()`
  `app/Models/Order.php:86-107` menawarkan `batal`; pindah status lewat `OrderService::changeStatusByAdmin`
  (`app/Services/OrderService.php:211`) tidak menyentuh `payment_status`) → hari ini `boleh=true` padahal §9.1 menolak. Ikut ditutup oleh definisi di atas.
- **Kartu lanjutan.** `t_45344e00` backend (rumus + 5 test regresi, tanpa parent), `t_02c3d20c` frontend
  (berparent `t_45344e00`), `t_4ef6e8bd` qatesting (berparent `t_02c3d20c`). Urutan wajib; tidak ada dua
  kartu paralel pada berkas yang sama. `docs/PRD.md`, `docs/design.md`, dan gerbang rilis `t_e83922f2` tidak diubah.
- **Rujukan usang (catatan, bukan kartu).** Kartu QA2 `t_2c9f8b01` menunjuk `docs/brief-qatesting.md` yang
  tidak ada; berkas brief QA yang benar adalah `docs/brief-qa.md` — kartu `t_4ef6e8bd` memakai yang benar.
- **Belum dicek (butuh browser).** Kirim ulasan end-to-end pada pesanan 2 produk (1 dinilai, lalu produk
  kedua) dengan sesi pembeli + CSRF + status `settlement`: belum dicek; tidak ada server dinyalakan di kartu ini.

## 21 Okt 2026 malam — gerbang migrasi G2 ditutup (kartu `t_9e719b16`)

- **Selesai.** Dua migrasi tertunda (`2026_10_20_000018_add_compare_price_to_products_table`,
  `2026_10_21_000019_add_tracking_number_to_orders_table`) sudah **Ran batch [2]** di MySQL pemilik; pending
  2 → 0, kolom terverifikasi baca-saja (`Schema::hasColumn` = true), data lama utuh. Bukti:
  `docs/bukti-migrate-g2.txt`; ringkasan di `docs/review-2.md` §6 (menimpa §1 baris #3/#4, §3, dan R1).
- **Tidak ada perubahan kode** di kartu ini; yang diubah hanya `docs/review-2.md`,
  `docs/pertanyaan-pemilik.md` (baris P4), dan catatan ini.
- **Masih terbuka (bukan bug baru).** Uji klik browser `/admin/produk/tambah`, `/admin/produk/12/ubah`, dan
  resi `/admin/pesanan/{order}` tetap **"belum diuji, butuh browser"**; DB pemilik tidak punya produk id=12 →
  minta pemilik memakai id 1-11.
- **Temuan mesin (luar lingkup, panduannya sudah ada).** `php artisan test` gagal `could not find driver`
  karena `extension=pdo_sqlite` masih dikomentari di `php.ini`; cara sementara
  `php -d extension=pdo_sqlite vendor/bin/phpunit ...` (`docs/langkah-pemilik.md:196-217`). QA2 `t_43d8bcd7`
  wajib tahu ini sebelum menjalankan suite penuh.

## 22 Okt 2026 — B4 ditutup, gerbang G1 kembali menunggu pemilik (kartu `t_fcfc3687`)

- **Verifikasi baca-saja B4** `t_3bfe3165`: adapter `app/Services/Midtrans/SdkMidtransApi.php:83-115`
  menormalkan respons SDK **rekursif** (objek/`JsonSerializable` → array) untuk `charge()`/`status()`;
  panggilan SDK mentah hanya di `requestCharge()`/`requestStatus()` (`:65-76`); tidak ada `\Midtrans\...`
  di luar adapter (`grep app/` → hanya `App\Services\Midtrans\*` + binding `AppServiceProvider`).
  `MidtransService::qrUrl()` tidak diubah (`:537-546`), dan tidak ada migrasi/kolom baru.
- **Test dijalankan ulang techlead** (phpunit.xml = SQLite `:memory:`, DB pemilik tidak tersentuh):
  `php -d extension=pdo_sqlite vendor/bin/phpunit --filter MidtransSdkShapeTest` →
  **OK (4 tests, 49 assertions)**. Suite penuh 242 test/1844 assertion adalah laporan worker B4 —
  **tidak** dijalankan ulang di kartu ini.
- **Dokumen diperbarui:** `docs/review-2.md` §6 (subbagian "B4 selesai", status gerbang, baris `qrUrl()`),
  §7 (pembaruan); `docs/pertanyaan-pemilik.md` §6 P5/P7; `docs/langkah-pemilik.md` § G1 (status + wajib
  pesanan uji baru). **P3 tetap terbuka** (ditutup 22 Okt 2026 — lihat bagian terakhir), rekomendasi techlead tetap **hapus** kolom
  `midtrans_client_key`/`midtrans_is_production`.
- **Masih belum dicek (butuh browser + kredensial sandbox pemilik):** charge QRIS sungguhan, pembayaran
  lewat Midtrans Simulator, klik "Sinkronkan status pembayaran", dan perubahan badge ke **Lunas**.
- **Catatan luar lingkup:** `.env.example:75` sudah `MIDTRANS_FAKE=false`; `.env` pemilik tidak disentuh.

### Temuan susulan (menit yang sama): kode pesanan 22 Okt tidak bisa dipakai ulang

- **Bukti dari log pemilik** (`storage/logs/laravel.log:4470-4514`): galat 06:07:51 terjadi **setelah**
  `MidtransService::chargeOrder()` (`:139`) dan saat `qrUrl()` (`:146`) membaca `actions[]` — jadi
  transaksi Midtrans untuk kode itu **sudah dibuat** (inferensi dari aliran kode; dashboard pemilik belum
  dicek).
- **Akar masalah kelasnya:** `OrderService::createFromCart()` membungkus seluruh checkout dalam
  `DB::transaction` (`OrderService.php:34`) dan memanggil charge di `:87`. Bila langkah **setelah** charge
  melempar, pesanan + payment + stok di-rollback, tetapi transaksi Midtrans tetap ada. `nextCode()`
  (`OrderService.php:186-199`) memakai `count()` pesanan hari itu + 1, sehingga checkout ulang memakai
  `order_id` yang sama dan ditolak Midtrans (406, "order_id has been paid and utilized").
- **Keputusan:** buka **B5** `t_a90d5215` (backenddeveloper, workspace `dir` yang sama, tanpa migrasi):
  Midtrans `order_id` = kode pesanan + sufiks unik per panggilan charge, disimpan di
  `payments.order_id_midtrans`; webhook/sinkron tetap mencari lewat kolom itu. G1 `t_fcfc3687`
  **digantungkan pada B5** (blocked dependency), bukan lagi menunggu pemilik sampai B5 `done`.
- **Dokumen diperbarui:** `docs/review-2.md` §6 (subbagian "Temuan lanjutan 22 Okt", status gerbang, §7);
  `docs/pertanyaan-pemilik.md` (P5, P7, **P8 baru**: cek transaksi yatim di dashboard); `docs/langkah-pemilik.md`
  § G1 ("jangan ulangi langkah 2 dulu").
- **Risiko:** bila percobaan 22 Okt ternyata memakai kredensial **produksi**, transaksi yatim harus
  dibatalkan pemilik (P8); bila sandbox, cukup dibiarkan/expire. Tidak ada bukti mode dari log — **belum
  dicek**.

## 22 Okt 2026 — B5 `t_a90d5215` selesai; G1 siap diulang pemilik

- Verifikasi baca-saja: `app/Services/MidtransService.php:498-517` (`nextMidtransOrderId()` = `orders.code` +
  `-` + 6 hex, cek tabrakan `payments.order_id_midtrans` 5x), dipakai `:148-155` (`createQrisCharge`) dan
  `:215-220` (`regenerateCharge`). Webhook `:264-272` dan sinkron status `:303-311`/`:341-345` tetap membaca
  `payments.order_id_midtrans`. Cabang mode uji tetap `= orders.code`.
- Test B5 adalah laporan worker (3 test baru; filter Checkout|Midtrans|Payment 78/78; suite 245/245 lulus),
  **tidak** dijalankan ulang di kartu G1 ini.
- Dokumen diperbarui: `docs/langkah-pemilik.md` § G1 (status siap uji + langkah 3 "Order ID diawali kode
  pesanan"), `docs/review-2.md` §6 (subbagian "B5 selesai", status gerbang) + §7, `docs/pertanyaan-pemilik.md`
  P5/P7. **P8 tetap terbuka** (transaksi yatim 06:07 di dashboard Midtrans).
- G1 memanggil `kanban_block` (needs_input): butuh `.env` sandbox pemilik, satu pembayaran lewat Simulator,
  klik "Sinkronkan status pembayaran", dan putusan P3. Tanpa itu laporan #2 tetap "belum diuji".

## 22 Okt 2026 07:46 — pemilik mengisi `.env` sandbox; bukti bayar & P3 belum ada

- **Laporan pemilik** (komentar dashboard di `t_fcfc3687`): `MIDTRANS_FAKE=false`,
  `MIDTRANS_IS_PRODUCTION=false`, `MIDTRANS_EXPIRY_MINUTES=5`, merchant/client/server key sandbox
  (berawalan `SB-Mid-client-` / `Mid-server-`; nilai penuh **tidak** disalin ke dokumen). Techlead tidak
  membaca `.env` dan tidak menjalankan server.
- **Efek di kode (baca-saja):** jalur asli aktif bila `server_key` terisi — `isFake()`
  (`app/Services/MidtransService.php:107`) = `fake` **atau** `server_key` kosong. Tidak ada
  `bootstrap/cache/config.php` (hanya `packages.php` + `services.php`), jadi `.env` langsung dipakai pada
  request berikutnya dan `php artisan config:clear` tidak wajib.
- **Belum ada bukti langkah 2-4.** `storage/logs/laravel.log` tidak punya entri non-`testing` setelah
  07:35. Charge sukses memang tidak dilog, tetapi kegagalan charge (`MidtransService.php:565`), kegagalan
  tarik status (`:310`), dan setiap upaya sinkron (`Admin/OrderController.php:196`) akan tercatat →
  belum ada jejak percobaan.
- **P3 masih terbuka** (ditutup 22 Okt 2026 — lihat bagian terakhir). Bukti tambahan untuk rekomendasi hapus: `midtrans_client_key` /
  `midtrans_is_production` hanya muncul di UI/validasi/peta pengaturan (`SettingService.php:46-47`,
  `UpdateSettingRequest.php:56-57`, `Settings/Index.jsx:55,451-452,2041-2063`) — tidak ada pembaca di
  jalur pembayaran; kredensial efektif selalu `config('midtrans.*')` dari `.env`.
- **Tindakan:** G1 tetap `kanban_block` (needs_input) dengan permintaan lebih sempit: satu pembayaran
  Simulator + klik sinkron + putusan P3. **P8 tetap terbuka.**
- Dokumen diperbarui: `docs/review-2.md` §6 (subbagian ini + butir P3 + status gerbang) dan §7,
  `docs/pertanyaan-pemilik.md` P5, `docs/langkah-pemilik.md` § G1 langkah 1.

## 22 Okt 2026 — P3 diputuskan: kolom Midtrans dipertahankan sebagai catatan (kartu `t_abb37557`)

- **Keputusan:** `midtrans_client_key` + `midtrans_is_production` di tab Pembayaran **tetap ada** sebagai
  **catatan** — bukan dihapus. Alasan: PRD §6 (`docs/PRD.md:199`) mewajibkan 19 kunci `settings` termasuk
  keduanya (menghapus = amendemen PRD oleh pemilik); yang tersimpan hanya *client key* publik + flag boolean —
  *server key* tidak pernah masuk `settings` (`docs/db.md:221`); akar keluhan sudah ditutup hint + badge mode
  efektif F2 (`resources/js/Pages/Admin/Settings/Index.jsx:2042,2056` hint; `:2016,2021`; teks server
  `app/Services/MidtransService.php:53-55`); tidak ada migrasi/hapus baris saat gerbang bayar terbuka.
- **Tidak ada perubahan kode/UI/migrasi.** Dokumen diperbarui: `docs/review-2.md` §6 butir P3 + status gerbang
  + checklist + pembaruan akhir; `docs/design.md` D11 (final); `docs/db.md:221`; `docs/akun-dev.md`;
  `docs/kontrak-props.md` §2 (baris 19-21 — sebelumnya salah menyebut "dibaca di server"); `docs/usulan.md` U9;
  `docs/pertanyaan-pemilik.md` §5 P3 + §6 P5 + baris P10 baru.
- **Temuan kecil, belum dikerjakan (di luar docs — tidak boleh diubah techlead):**
  `database/seeders/SettingSeeder.php:14-15` masih berkomentar "nilainya diisi pemilik lewat panel admin",
  label seed `:223` dan label UI `Settings/Index.jsx:2040` masih "Midtrans client key (diisi pemilik)" —
  menyesatkan karena nilainya tidak dibaca jalur bayar. Tidak dibuatkan kartu: perubahan kosmetik satu baris;
  bila pemilik ingin, gabungkan dengan U9 atau kartu frontend kecil saat ada pekerjaan lain di berkas itu.
- **Dampak gerbang:** G1 `t_fcfc3687` tinggal menunggu bukti bayar (Simulator + tombol sinkron) dan P8
  transaksi yatim 06:07. P3 tidak lagi menjadi pertanyaan terbuka; R2/No-Go sementara tidak berubah.

## 22 Okt 2026 — putaran 3 G1: jendela 5 menit, bukan kode (kartu `t_fcfc3687`)

- **Bukti pemilik 08:15 (diverifikasi QA `t_9d3e06e0`):** tombol/endpoint **LULUS live** — dua entri
  `local.INFO` 08:15:01 (#15 `TK-20261022-0003`) dan 08:15:15 (#14 `TK-20261022-0002`), payment
  `pending -> expire`, order `pending -> batal`, stok kembali (`stock_movements` #61/#62). Keduanya ditekan
  **setelah** `expiry_time` (42 detik dan 7m42s) dan Midtrans mengembalikan `expire` tanpa `settlement_time`
  (QA cek ulang 08:24: tetap `expire`). Cabang `settlement → Lunas` **tetap belum terbukti**.
- **Techlead baca-saja ulang (tanpa server, `.env` tidak dibaca):** tidak ada cacat kode baru; yang gagal
  adalah ketepatan waktu. `storage/logs/laravel.log` tidak memuat entri `local` setelah 08:15:15 → belum ada
  percobaan baru.
- **Jalan keluar tanpa kode:** `MIDTRANS_EXPIRY_MINUTES` (`.env` pemilik) → `config/midtrans.php:21-23,41`
  → `expiryMinutes()` (`app/Services/MidtransService.php:118-123`) → `custom_expiry` (`:547-550`, unit
  `minute`) **dan** `payments.expires_at` (`:481-483`). Set `60` sementara, lalu kembalikan `5` (P1).
  Diusulkan ke pemilik sebagai P11.
- **#14/#15 tidak bisa dipakai ulang:** `applyStatus()` berhenti di status terminal
  (`MidtransService.php:386-392`) — disengaja. Risiko "settlement setelah expire dibuang diam-diam" dicatat
  sebagai usulan **U10**, bukan kartu perbaikan: keputusan bisnis dan belum ada bukti kejadian nyata.
- Dokumen diperbarui: `docs/langkah-pemilik.md` § G1 (blok "Putaran 3" + langkah 3), `docs/review-2.md`
  §6 (subbagian "Putaran 3") + §7, `docs/pertanyaan-pemilik.md` P5 + baris P11 + checklist butir 3,
  `docs/usulan.md` U10.

## 22 Okt 2026 — putaran 4 G1: checkout gagal 3x, sebab tidak tercatat (kartu `t_fcfc3687`)

- **Balasan pemilik "sudah" (08:38) tanpa bukti bayar.** Log baca-saja menunjukkan tiga kegagalan berurutan:
  08:36:49, 08:37:22, 08:37:37 untuk `TK-20261022-0005` (`632EC9`, `825373`, `95A07D`) dengan pesan umum
  "Gagal membuat pembayaran QRIS. Coba lagi." (`storage/logs/laravel.log:5339-5341`). Tidak ada entri `local`
  lain setelah 08:15:15 → tidak ada sinkron/pembayaran pada percobaan ini.
- **Kode pesanan sama tiga kali = checkout di-rollback** (`OrderService.php:34,87`), jadi pemilik menekan
  "Buat Pesanan" tiga kali; tidak ada baris `orders`/`payments` yang perlu dibersihkan.
- **Titik gagal = panggilan charge**, bukan QR/DB/UI: pesan itu dibuat `SdkMidtransApi::charge()` (`:37-38`)
  yang membungkus semua `Throwable` `CoreApi::charge`. Bukan regresi: `MidtransService.php` beku 07:32,
  `SdkMidtransApi.php` 06:59, charge 07:40 (#13) sukses dengan kode sama. Jaringan hidup: `curl` ke
  `api.sandbox.midtrans.com` menjawab 401 (status tanpa kunci) / 404 (`GET /v2/charge`) ±09:05.
- **Cacat diagnosabilitas, bukan kesimpulan penyebab:** `chargeOrder()` (`MidtransService.php:560-577`) hanya
  mencatat `getMessage()`; pesan SDK berisi HTTP status + badan respons
  (`vendor/midtrans/midtrans-php/Midtrans/ApiRequestor.php:165-167`) dibuang, sehingga 401/400/5xx tidak bisa
  dibedakan. Dugaan (kunci `.env` tersunting saat P11, `custom_expiry` 60 ditolak, gangguan sandbox) **belum
  terbukti** dan tidak dipakai sebagai dasar kartu.
- **Kartu baru:** B6 `t_1f72a2d1` (backenddeveloper, workspace `C:\Users\LENOVO\Downloads\toko-kulot`, parent
  G1 lewat `kanban_link`) — catat kelas + code + `getPrevious()` di `chargeOrder()`, test fake-api, tanpa
  mengubah pesan pengguna dan tanpa mencatat kredensial. G1 kini menunggu B6.
- **Belum dicek / tidak bisa dari sini:** apakah `MIDTRANS_SERVER_KEY` masih sama (`.env` tidak dibaca —
  ditanyakan sebagai P12); status transaksi di dashboard Midtrans (pemilik); charge sungguhan (menulis ke
  Midtrans, bukan wewenang techlead). Semua bukti bayar tetap **belum ada** → No-Go sementara.
- Dokumen diperbarui: `docs/review-2.md` §6 "Putaran 4" + §7, `docs/pertanyaan-pemilik.md` P12 + catatan
  checklist, `docs/langkah-pemilik.md` § G1 blok "Putaran 4".

## 22 Okt 2026 — verifikasi laporan bug pemilik 3 (kartu `t_fe77b3d7`)

- **Enam butir laporan, lima kartu + QA selesai.** Bukti & keputusan lengkap: `docs/review-3.md`.
  Ringkas: varian produk (kontrak + pemilih), `color_hex`, dashboard snapshot, Midtrans produksi,
  tabel admin — semuanya lulus verifikasi code-level; suite penuh dijalankan ulang techlead
  **OK (258 tests, 2041 assertions)**.
- **QA `t_18650721`** menulis `docs/verifikasi-pemilik-t_18650721.md`: keenam butir lulus, tanpa
  defect Critical/High/Medium. Catatan proses: bukti browser hanya narasi, tidak ada log mentah —
  hasil tetap dipakai karena konsisten dengan kode + pengukuran, tetapi tidak reproducible.
- **O-1 header `DataTable` belum sticky** (kontrak `docs/komponen.md:83`, `docs/design.md:335`;
  computed `position: static`). Bukan bagian 6 butir, tetapi kontrak tertulis → kartu
  **`t_082b15aa`** (frontenddeveloper, parent `t_fe77b3d7`, workspace sama). Body memuat peringatan
  wrapper `overflow-x-auto` agar sticky tidak dipasang asal.
- **O-4 KPI PRD §9 ditunda.** Dashboard sudah sinkron data aktual (4 KPI), tetapi PRD §9 meminta
  omzet hari ini/7/30, pesanan per status, terlaris; desain §5.11 hanya 4 kartu (AOV/30 hari).
  Keputusan: jangan perluas rilis yang sedang diuji; catat di `docs/usulan.md` U11 +
  `docs/pertanyaan-pemilik.md` P14. Bila pemilik minta sekarang: uiux → backend → frontend → QA.
- **O-2 nama warna asing** (`Broken White`) tetap netral. Tidak ada kode sekarang; pemilik bisa
  memakai nama baku/hex. Usulan alias palet: `docs/usulan.md` U12, pertanyaan P15.
- **Midtrans expiry.** Body kartu menempel 60 (nilai uji P11), probe devops 08:47 = 60, probe QA
  09:40 = 5. Bukti terbaru 5 dan sesuai P1; minta pemilik mengonfirmasi (P13). Jangan mengubah
  `.env` sendiri.
- **Keamanan.** Body kartu memuat potongan Merchant/Client/Server key bertopeng. Tidak disalin ke
  dokumen; pemilik diminta tidak menempel kunci lagi dan mempertimbangkan rotasi bila kartu dibagikan.
- **Rilis:** GO BERSYARAT untuk enam perbaikan; belum GO produksi penuh sampai satu pembayaran QRIS
  nyata + notifikasi Midtrans terbukti. Keputusan akhir pemilik.

## Putaran laporan pemilik 4 — QRIS masih gagal (kartu `t_7471aa7e`, 22 Okt 2026)

- **Bukan regresi perbaikan putaran 1.** Log 10:37:51 memuat `qris_acquirer`/`attempt`, jadi kode baru
  berjalan; `bootstrap/cache/` juga tidak memuat `config.php` (tidak perlu `config:clear`).
- **Dua sebab berlapis** (`docs/review-4.md` §2): 402 kanal GoPay tidak aktif (baris 6262) + cadangan
  `other_qris` dijawab 413 (baris 6263). Core API QRIS hanya menerima acquirer `gopay` / `airpay shopee`;
  `other_qris` adalah metode Snap. Galat 413 menutupi diagnosis 402 → pesan generik.
- **Keputusan**: kartu backend putaran 2 (acquirer sah + pesan 402 terjaga) lalu gerbang pemilik
  (aktivasi QRIS produksi + satu checkout). Batas 2 putaran tercapai di sini.
- **Instruksi lama di `docs/langkah-pemilik.md` salah** (menyuruh `MIDTRANS_QRIS_ACQUIRER=other_qris`) —
  sudah ditulis ulang di kartu ini; jangan diulang di dokumen lain.
- **Belum dicek**: charge nyata ke akun pemilik (butuh akun + uang nyata); klaim "QRIS produksi aktif"
  tidak bisa diverifikasi dari repo.

## Gerbang QRIS produksi menunggu pemilik (kartu `t_c9385bf0`, 22 Okt 2026)

- Kartu backend putaran 2 `t_56062a5c` **selesai** dan diverifikasi baca-saja: `QRIS_ACQUIRERS`
  (`app/Services/MidtransService.php:77`), alias `other_qris` → `airpay shopee` (`:89`),
  `enabled_payments` tidak dikirim (`:554,558`), `CHANNEL_INACTIVE_MESSAGE` (`:97`) dipakai saat
  402 pada percobaan pertama (`:670`). Tidak ada perubahan `.env`/kode oleh techlead.
- Instruksi pemilik diperbarui: `docs/langkah-pemilik.md` bagian "QRIS gagal saat checkout — 402"
  kini menyebut kartu backend sudah selesai + ID gerbang `t_c9385bf0`; `docs/pertanyaan-pemilik.md`
  P16 disesuaikan; status dicatat di `docs/review-4.md` §7.
- **Gate diblok sampai pemilik membalas bukti**: jam kejadian, kode pesanan, teks QR/notice apa adanya.
  Bila QR muncul → lanjut G1. Bila masih gagal → eskalasi, **bukan** kartu perbaikan ketiga.

## v1.3 — webhook Biteship & halaman kosong lewat ngrok (kartu `t_c04dd4c7`, 24 Okt 2026)

Temuan baca-saja (tanpa mengubah kode):

- Pola webhook lama: route `routes/web.php:145` (`POST /midtrans/notification`), CSRF
  dikecualikan di `bootstrap/app.php:31-32`. Webhook Biteship mengikuti pola yang sama, bukan
  membuat berkas route baru. Rute API tidak dipakai — proyek ini menaruh webhook di `web.php`.
- `BiteshipService` sudah punya label status (`app/Services/BiteshipService.php:464,478,486`)
  dan `shippingInfo():515` yang dipakai admin + riwayat → data webhook cukup mengisi kolom
  `shipping_status`/`tracking_number`/`shipped_at` yang sudah dibaca fungsi itu; tidak perlu
  jalur tampilan baru di backend.
- **Penyebab halaman kosong terverifikasi**: `public/hot` ada (17 byte, `http://[::1]:5173`,
  dibuat 24 Okt 23.51) sehingga blade memuat `@vite` dari Vite dev di localhost mesin pengunjung.
  Perbaikan operasional (DevOps) + trust proxy (Backend), lihat PRD v1.3 §3.
- Dugaan kuat kedua: HTML lewat ngrok memakai `http://<tunnel>/...` untuk favicon/aset karena
  proxy tidak dipercaya → mixed content. Kartu `t_8498103a` menutup ini dengan `trustProxies`
  loopback saja, bukan `'*'`.
- Biteship tidak menyediakan tanda tangan HMAC di dashboard webhook; verifikasi resmi hanya URL.
  Karena itu dipakai token bersama di query/header (PRD §2.1), bukan klaim "signature verified".
- PHP CLI mesin ini belum memuat `pdo_sqlite` (tercatat di `docs/langkah-pemilik.md`), jadi
  perintah test di brief memakai fallback `php -d extension=pdo_sqlite -d extension=sqlite3
  vendor/bin/phpunit`. Ini keterbatasan lingkungan, bukan bug aplikasi.
- `php artisan migrate`, pengisian `BITESHIP_WEBHOOK_TOKEN`, dan pendaftaran URL di dashboard
  Biteship adalah tindakan pemilik (`docs/pertanyaan-pemilik-v1.3.md` P1–P5). Techlead tidak
  menjalankannya.

## v1.3 — review akhir `t_b20fca2d` (25 Okt 2026)

- Laporan lengkap: `docs/review-v1.3.md`. Ringkas: **F10 GO**, **F9 NO-GO sekarang / GO BERSYARAT**
  setelah pemilik menjalankan migrasi `000005`, mengisi token webhook, dan mematikan `APP_DEBUG`.
- Bukti yang saya jalankan ulang sendiri: 18 test terfokus (230 asersi, 1,2 s) dan suite penuh
  **339 test / 2.815 asersi OK** (38,4 s) via `PHP_INI_SCAN_DIR=<scratch phpsqlite>` (sqlite
  `:memory:`, `.env` tidak disentuh); `POST /biteship/webhook` body rusak → 422 JSON, order tak
  dikenal + token salah → 200 JSON; browser menampilkan toko (judul `Liiora.id | …`, `#app` 64 KB,
  satu-satunya script `/build/assets/app-C0fClxZc.js`).
- Keputusan dokumen: F-13-04 (urutan baris panel) → implementasi diterima, `docs/design-v1.3.md` §1
  diberi catatan urutan nyata; F-13-05 (path aset "relatif") → `docs/PRD-v1.3.md` §3 butir 2
  diperbaiki. F-13-01/02/03 tetap tindakan pemilik.
- Satu kartu perbaikan kode: `t_8c48f38d` (backenddeveloper, berparent kartu ini) — webhook harus
  membalas JSON generik saat exception, bukan halaman HTML (PRD §2.1).
- Di luar lingkup (dicatat, tidak dikerjakan): header `X-Inertia-Devtools-Id` ikut di setiap respons
  publik (bawaan inertia-laravel v2, isi ULID) dan interstitial ngrok muncul untuk pengunjung
  browser — keduanya bukan bug v1.3, tapi perlu diingat sebelum produksi.

## Pendaftaran webhook Biteship ditolak dashboard (kartu `t_7584d46c`, 25 Okt 2026)

- Gejala pemilik: form "Tambah Webhook" Biteship menolak `https://<tunnel>/biteship/webhook`
  dengan *"Webhook URL doesn't respond with ok response"*.
- Saya uji sendiri lewat tunnel (curl, read-only): `POST` body kosong `Content-Type: application/json`
  → **422**; `GET` → **405**. Tunnel & aplikasi hidup, jadi ini bug kode, bukan tunnel/`.env`.
- Akar: `BiteshipWebhookController.php:30-38` menganggap body kosong sebagai JSON rusak; cek token
  (`:20-28`) mendahului sehingga probe tanpa token akan 403 begitu token terisi; route hanya POST.
- Keputusan: `docs/PRD-v1.3.md` §2.1 diperbarui — probe body kosong/GET dijawab
  `200 {"status":"ok","success":true}` sebelum cek token, tanpa memproses data. Keamanan tidak
  longgar: body kosong tidak bisa mengubah apa pun, payload asli tetap wajib token.
- Kartu perbaikan: `t_f09907b0` (backenddeveloper, berparent kartu ini). Bukti:
  `docs/bukti-webhook-install-t_7584d46c.txt`. Langkah pemilik: `docs/pertanyaan-pemilik.md` P18-P19.
- Belum dicek (butuh pemilik): pendaftaran ulang di dashboard Biteship dan satu event nyata
  `order.status` setelah `php artisan migrate`.

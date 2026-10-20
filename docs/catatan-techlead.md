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

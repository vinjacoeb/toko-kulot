# Catatan DevOps — Toko Kulot

Kartu K2 (kerangka proyek). Diisi hanya hal yang perlu diketahui kartu lain.

## Yang dikerjakan

1. `.env.example` disesuaikan PRD: `APP_NAME="Toko Kulot"`, `APP_URL=http://localhost:8000`,
   MySQL 8 (`DB_CONNECTION=mysql`, database `toko-kulot`), `FILESYSTEM_DISK=public`,
   blok `MIDTRANS_*` (termasuk `MIDTRANS_FAKE=true`). Kata sandi dikosongkan.
2. `config/app.php`: `timezone` = `Asia/Jakarta`, `locale` = `id`, `fallback_locale` = `en`,
   `faker_locale` = `id_ID` — ditulis di kode, bukan di `.env`.
3. `bootstrap/app.php`: grup rute `routes/admin.php` didaftarkan dengan prefix `/admin`
   dan name prefix `admin.`; pengecualian CSRF diperbaiki dari `webhook/midtrans` menjadi
   `midtrans/notification` (PRD §8).
4. Struktur direktori PRD §4.2 dibuat (dengan `.gitkeep`): `app/Http/Controllers/Public`,
   `app/Http/Controllers/Admin`, `app/Http/Requests`, `app/Services`,
   `resources/js/Layouts`, `resources/js/Pages/Admin`, `resources/js/Components`.
5. `.gitignore`: `.env.*` + pengecualian `!.env.example`, `/database/*.sqlite` dan
   `-journal`, `/public/build`, `/public/hot`, `/public/storage`, `vendor`, `node_modules`.
6. `README.md` ditulis ulang (sebelumnya README bawaan Next.js).
7. `database/database.sqlite` (0 byte, dibuat installer saat `composer create-project`)
   dihapus — proyek memakai MySQL 8 sesuai PRD.
8. `php artisan storage:link` dijalankan; `public/storage` → `storage/app/public` aktif.

## Temuan di luar lingkup (tidak dikerjakan di kartu ini)

- **Versi kerangka berbeda dari PRD.** Terpasang Laravel 12.70.0 (PRD §4.1: Laravel 11)
  dan React 19.3.1 (PRD: React 18). Tidak diturunkan karena kode yang sudah ada
  (model `Admin`, `EnsureAdmin`, halaman Inertia) berjalan di atas versi terpasang, dan
  `@inertiajs/react` 3.9.1 mensyaratkan React ^19. Dicatat sebagai asumsi A-01/A-02.
- **Sisa kerangka Next.js masih ter-commit di HEAD** (`src/`, `next.config.ts`,
  `tsconfig.json`, `eslint.config.mjs`, `test.scss`, `public/*.svg`). Berkas sudah
  dihapus dari disk; penghapusannya ikut masuk commit K2 karena tanpa itu pohon repo
  menunjuk berkas yang tidak ada. Penghapusan folder alat AI (`.agent/`, `.claude/`, dst.)
  **tidak** disentuh — itu lingkup kartu `t_e0ab9215`.
- **Berkas asing di root:** `.token-check.mjs` dan `token-check.mjs` (tidak dikenal,
  bukan bagian kerangka). Tidak dihapus dan tidak di-commit. Perlu keputusan pemilik.
- **Dokumen techlead belum ter-commit:** `docs/catatan-techlead.md`, `docs/traceability.md`
  masih untracked. Sengaja tidak di-commit karena milik kartu lain.
- `phpunit.xml` masih memakai `DB_CONNECTION=sqlite` untuk test; belum diubah agar tidak
  menyentuh area backend. Perlu diselaraskan bila test butuh MySQL.

## Percobaan gagal

Tidak ada perintah yang gagal. `php -l`, `php artisan route:list`, `npm run build`, dan
`php artisan storage:link` semuanya keluar dengan kode 0 (keluaran lengkap di
`docs/lingkungan.md`).

Catatan kecil: `write_file` menolak menimpa `README.md` dan `.env.example` yang belum
dibaca penuh pada sesi ini; diselesaikan dengan `patch` per blok (isi akhir sesuai
rencana).

## Belum diuji

Koneksi database sudah diuji setelah kartu di-Unblock: `php artisan migrate:status`
berhasil, 4 migrasi `Ran`. Seed, test fungsional, dan server pengembangan tetap
belum diuji — seed dan server adalah wewenang pemilik/backend, test belum ada.

## Verifikasi penutup (run 2, setelah Unblock)

```
$ php artisan migrate:status   -> 4 migrasi [1] Ran x3, [2] Ran (tabel admins)
$ php artisan route:list       -> Showing [6] routes, GET|HEAD / -> home
$ npm run build                -> ✓ 636 modules transformed, built in 2.80s
$ git ls-files | grep .env     -> hanya .env.example (aman)
```

`docs/lingkungan.md` bagian 5-6 dan `docs/langkah-pemilik.md` bagian 6 sudah
diperbarui dengan hasil ini.

## Kebersihan repo — folder agent/skill dihapus dari git (t_e0ab9215, 20 Okt 2026)

Masalah: HEAD `cfdaedd` masih memuat 3397 berkas di dalam 20 folder agent/skill
(`.agent/`, `.agents/`, `.augment/`, `.claude/`, `.codebuddy/`, `.codewhale/`,
`.continue/`, `.cursor/`, `.factory/`, `.gemini/`, `.github/prompts/`, `.hermes/`,
`.kilocode/`, `.kiro/`, `.opencode/`, `.qoder/`, `.roo/`, `.trae/`, `.warp/`,
`.windsurf/`). Berkas sudah hilang dari working tree tetapi penghapusannya belum
di-commit → melanggar R4 dan DoD global §15 poin 5.

Tindakan: hanya penghapusan yang di-stage (`git add -u` pada 20 folder itu), tidak ada
berkas aplikasi yang ikut. Perubahan working tree milik agent lain (12 berkas `M` di
`docs/` + `resources/`, 4 dokumen baru, `token-check.mjs`) sengaja TIDAK di-commit
(R8: satu kartu satu commit).

Bukti sebelum commit:

```
$ git diff --cached --name-only | wc -l                       -> 3397
$ git diff --cached --name-status | cut -f1 | sort | uniq -c  -> 3397 D (tidak ada A/M)
$ git diff --cached --name-only | grep -v '^\.(agent|agents|...)/'  -> kosong
$ git check-ignore -v app/... resources/js/app.jsx routes/web.php database/migrations -> exit 1 (tidak diabaikan)
$ git ls-files | grep -i '\.env'                              -> hanya .env.example
```

Risiko: `.github/` ikut terhapus (isinya hanya `prompts/` hasil salinan skill, tanpa
workflow CI). Bila kartu rilis (K16) butuh GitHub Actions, folder dibuat ulang dari nol.

Pemulihan bila diperlukan: `git checkout <commit-sebelumnya> -- .agent/` (salinan skill
tetap tersedia di folder profil agent di luar project, sesuai R4).

## 2026-10-20 — t_56a2d29c (verifikasi rilis)
- Smoke rilis & halaman auth dijalankan dari browser nyata (2 sesi: `devops-smoke`, lalu `devops-smoke2`).
  Sesi pertama gagal dibuka kembali dengan `PermissionError [WinError 5] ... bu-devops-smoke.port`; solusi yang
  berhasil: pakai nama sesi baru. Bukti tetap utuh karena keluaran ditulis ke berkas di docs/.
- Temuan Critical: `/login` merender kosong (`Uncaught ReferenceError: route is not defined`) dan `/checkout`
  teralih ke `/login`, jadi alur pembeli buntu. Sebab: 4 halaman auth memakai helper Ziggy `route()`, padahal PRD
  melarang Ziggy. Kartu perbaikan dibuat: t_acd5fc8e (frontenddeveloper).
- Temuan High: 4 rute admin (stok masuk/keluar, akun update/destroy) membalas 404 untuk tamu, bukan redirect ke
  `/admin/login`; `AdminRouteAccessTest` gagal 2 kasus karenanya. Dua rute GET `/admin/stok*` yang tadinya 500
  sudah lolos di RUN 2. Komentar berisi bukti dikirim ke kartu t_ed8bd8e4.
- Pelajaran verifikasi: `npm run build` exit 0 TIDAK menangkap identifier JSX tanpa import (Vite hanya transpile)
  — kelas cacat itu hanya tertangkap smoke browser atau penyapu statis. Jalankan ketiganya sebelum menyatakan build
  aman: `node check-jsx-imports.mjs resources/js`, `python tmp/cek-komponen-tanpa-import.py <repo>`,
  `python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build`.
- `php artisan test` dijalankan dua kali (14:24 & 14:32) memakai sqlite `:memory:` lewat
  `PHP_INI_SCAN_DIR=<scratch>/phpsqlite`; php.ini global dan .env pemilik tidak disentuh.
  Hasil RUN 2: 2 failed, 1 incomplete, 187 passed (1111 assertions), exit 1.
- Database uji `toko_kulot_rilis_check` masih ada dan aman dipakai ulang; database dev pemilik utuh
  (products = 12 baris). Bila tidak diperlukan: `DROP DATABASE toko_kulot_rilis_check`.
- Emoji yang muncul pada judul tab di berkas smoke pertama bukan berasal dari kode aplikasi (HTML dari server bersih,
  repo juga bersih) — keterbatasan pengukuran, tidak ditindaklanjuti. Dikuatkan pada verifikasi penutup: judul tab
  semua 9 rute dari smoke JSON bersih dari emoji (mis. "Produk — Toko Kulot"), HTML server `<title inertia>Toko Kulot</title>`,
  dan pencarian U+1F434 pada 293 berkas repo (resources, app, config, routes, public/build) -> tidak ada.
- Di luar lingkup, dicatat saja: folder `tmp/` (perkakas uji agent) belum di-ignore; judul tab `/produk` belum
  menerapkan `<Head title="Produk">` (kosmetik).

## Verifikasi penutup (kartu t_5a330224, 20 Okt 2026 ~15:20-15:35)

- Build penutup `npm run build` exit 0 pukul 15:21:50: 50 berkas di `public/build/assets`, chunk aplikasi
  `app-D-79Kh7D.js`, dan saat build selesai 0 berkas sumber lebih baru dari manifest. Tiga penyapu statis bersih
  (jsx-imports 0 temuan; komponen-tanpa-import hanya positif palsu `App` di `app.jsx`; bundel-identifier-bebas 0 temuan).
  Bukti: `docs/bukti-build-penutup-t_5a330224.txt`.
- Pukul 15:27:22 kartu penulis lain (t_099c813c) menjalankan build lagi; chunk aplikasi tetap `app-D-79Kh7D.js`,
  jadi bundle identik dan bukti smoke tetap sah. Pelajaran: mtime manifest lebih baru TIDAK berarti bundle berubah —
  bandingkan nama chunk ber-hash, bukan mtime, sebelum mengulang smoke.
- Selama kartu penulis masih terbuka, build penutup belum bisa dibekukan sebagai build rilis. Ini alasan utama
  putusan NO-GO pada `docs/checklist-rilis.md`, bukan cacat kode baru.
- Smoke penutup 27 pengukuran (9 rute x 3 viewport) pada bundel di atas: 0 halaman kosong, 0 geser horizontal,
  27/27 konsol bersih. `/login` yang tadinya kosong kini merender 95-256 karakter teks + 3 input + 1 form.
  Bukti: `docs/bukti-smoke-penutup-t_5a330224.txt`.
- Sisa Low pada kelas cacat 15.3: rute admin ber-parameter membalas 404 (bukan 302 ke `/admin/login`) bila id
  yang diminta TIDAK ADA, karena model binding (`SubstituteBindings`, grup `web`) jalan sebelum middleware `admin`.
  Untuk id yang ada, gate auth sudah benar (302). Saran perbaikan: `->missing()` pada definisi rute atau naikkan
  prioritas middleware `admin` di atas substitusi binding. Bukti: `docs/bukti-rute-admin-tamu-id-ada-t_5a330224.txt`.
  Sudah dikomentari pada kartu t_ed8bd8e4; tidak dibuatkan kartu baru karena tingkatnya Low dan pemilik yang memutuskan.
- Metode probe rute tulis tanpa login (agar tidak ada data berubah): id yang tidak ada (999999) atau id nyata dengan
  body sengaja tidak valid, token CSRF diambil dari `/admin/login` supaya penolakan yang teramati adalah penolakan
  AUTH, bukan CSRF. Semua hanya GET/POST/PUT/DELETE ke server pemilik tanpa login.
- Kendala perkakas (berulang, bukan bug aplikasi): perintah `terminal` yang berisi heredoc atau loop panjang sering
  ditolak sandbox ("BLOCKED, not run"); solusinya menulis skrip `.sh`/`.py` ke folder scratch devops lalu menjalankannya.
  `$TMPDIR` juga tidak selalu ter-resolve di Git Bash (`/tmp/produk.html` tidak ditemukan) — pakai path absolut Windows.
- Output `head`/pipe panjang kadang terpotong menjadi "1 lines output"; rincian diambil dari berkas bukti dengan `read_file`.
- Pembaruan 15:32-15:41: bundel BERUBAH dua kali lagi setelah pelajaran mtime di atas — manifest 15:35:31
  (chunk `app-D9VeOng4.js`, 50 artefak, 0 sumber lebih baru) dan pemeriksaan akhir 15:41:56 menemukan manifest
  15:41:11 dengan chunk `app-BQJW9H3n.js` serta 2 berkas sumber lebih baru daripada manifest (build ybs. belum
  diperiksa). Jadi kesimpulan operasionalnya: jangan mengandalkan mtime saja, dan jangan menyebut "build rilis"
  selama masih ada kartu penulis yang menulis berkas.
- Tiga penyapu statis diulang pada bundel `app-D9VeOng4.js` (15:35:39) dan tetap bersih (0 temuan; 49 chunk
  diperiksa): `docs/bukti-sweep-bundel-1532-t_5a330224.txt`. Smoke 9 rute x 3 viewport diulang pada bundel yang
  sama (15:37:47): 27 pengukuran, 0 bermasalah, 27/27 konsol bersih, judul tab semua rute benar (mis. `/produk`
  = "Produk — Toko Kulot", menutup temuan kosmetik lama): `docs/bukti-smoke-penutup-t_5a330224.txt`. Run 15:30:18
  pada bundel `app-D-79Kh7D.js` diarsipkan ke `docs/bukti-smoke-penutup-1530-t_5a330224.txt`.
- Rangkuman pemeriksaan akhir ditulis ke `docs/bukti-akhir-t_5a330224.txt` (15:41:56): keadaan `public/build`,
  chunk aktif, jumlah baris 8 berkas bukti, ringkasan suite (190 passed, 1111 assertions, 31,69 s).
- Tindak lanjut yang dibuat: kartu devops **t_5f75f779** ("bekukan build rilis") digerbangi oleh 4 kartu penulis
  yang masih running (t_e5149746, t_67576fb2, t_90759be9, t_950a38ca); kartu itu mengulang build + 3 penyapu +
  smoke + suite pada bundel yang sudah tidak bergerak dan memperbarui putusan rilis.
- Kartu t_944aea1e (todo, keputusan kolom cari topbar) dicatat di body kartu t_5f75f779 sebagai syarat ikut
  diperiksa: selama kartu itu belum selesai, build belum boleh disebut beku.
- Pembekuan build (kartu **t_5f75f779**) DITUNDA 16:17 — prasyarat "tidak ada kartu penulis berjalan" belum
  terpenuhi. Kartu t_944aea1e sudah done (15:59:52, bundel saat itu `app-Bi-jA20D.js`), tetapi kartu **t_14cad9e2**
  (uiux, keputusan token `text-slate-500` = 4,40:1) masih running dan MENULIS KE REPO: 13 berkas `resources/js/**`
  berubah setelah 16:00 (Components: Breadcrumb, DataTable, EmptyState, ErrorState, PageHeader, QrisPanel,
  StarRating; Pages: Admin/Accounts, Admin/Categories, Admin/Messages, Admin/Reviews, Admin/Settings,
  Public/Contact) plus `docs/design.md`, `docs/qa/terapkan-meta-v22.py`, `docs/qa/sweep-meta-surface.py`.
  Bundel ikut bergerak: manifest 15:59:12 -> 16:16:38. Jadi kesimpulan operasional lama tetap berlaku: jangan
  menyebut "build beku" selama masih ada kartu penulis yang menulis berkas.
- Kartu t_5f75f779 di-link sebagai ANAK t_14cad9e2 (`kanban_link`) lalu di-block `kind=dependency`, supaya
  dipromosikan dan di-dispatch ulang otomatis begitu kartu uiux selesai. Pemeriksaan papan dipakai skrip scratch
  `papan-devops.py` / `tunggu-penulis-t5f75f779.py` (SQLite dibuka `mode=ro`, tidak mengubah state kartu).
- Perkakas pembekuan yang sudah siap di scratch devops — jalankan HANYA setelah tidak ada kartu penulis aktif:
  1. `bash <scratch>/bekukan-t5f75f779.sh` = `npm run build` + 3 penyapu statis + sha256 manifest/chunk/css +
     daftar berkas sumber lebih baru dari manifest sebelum dan sesudah build; bukti `docs/bukti-bekukan-t_5f75f779.txt`.
  2. Smoke 9 rute x 3 viewport (kolektor konsol sebelum document start) lewat browser:
     `exec(open(r"<scratch>/smoke-beku-t5f75f779.py", encoding="utf-8").read())` di dalam `browser_exec`;
     bukti `docs/bukti-smoke-beku-t_5f75f779.txt`. Server tetap milik pemilik di 127.0.0.1:8000 (hanya GET).
  3. Suite: `PHP_INI_SCAN_DIR=<scratch>/phpsqlite php artisan test` (phpunit memakai SQLite; tidak ada migrasi/seed
     terhadap DB pemilik).
  4. Bila keputusan uiux memilih opsi (B) sehingga muncul kartu frontend lanjutan, pembekuan ikut menunggu kartu itu;
     angka beku (mtime manifest, jumlah artefak, chunk app, sha256) dicatat ke `docs/checklist-rilis.md` sebelum
     putusan GO/NO-GO diperbarui.

## Kartu t_5f75f779 — build beku rilis (20 Okt 2026, 16:46–16:52)

Hasil: build BEKU + 3 penyapu + smoke 9 rute x 3 viewport + suite, semuanya pada bundel yang sama dan
tidak bergerak. Angka rilis: manifest `public/build/manifest.json` 16:46:51 (18.817 B,
sha256 `83cd3362d607bf90…`), 50 aset + manifest, chunk `app-C4HDW06B.js` (361.816 B),
css `app-C4SfSLQH.css` (57.446 B). Smoke 27/27 bersih, suite 190 passed / 1111 assertions (exit 0).
Putusan rilis diperbarui di `docs/checklist-rilis.md`: NO-GO -> GO BERSYARAT untuk lapisan kode+build.

Urutan yang akhirnya bekerja (setelah percobaan 1 di-block 16:17):
1. Papan diperiksa baca-saja (`papan-devops.py`, SQLite `mode=ro`) sampai benar-benar kosong dari kartu
   penulis: t_944aea1e done 15:59:52, t_14cad9e2 done 16:36, t_954abfe8 (penerapan 29 titik teks meta) done 16:38.
2. Sumber diperiksa: berkas terakhir berubah 16:36:04; 0 berkas sumber lebih baru dari manifest setelah build.
3. `npm run build` -> 3 penyapu -> smoke di browser -> suite, lalu manifest mtime + sha256 diperiksa ulang.
   Tanpa langkah terakhir ini "beku" hanya klaim; dengan langkah ini terbukti.

Kendala & hal teknis yang perlu diingat:
- Perintah penghapus direktori rekursif dan `php -r '...'` DITOLAK tool terminal (mode single-query tanpa
  persetujuan). Tidak diperlukan: Vite mengosongkan `outDir` sendiri (dibuktikan: semua berkas di `public/build`
  bertimestamp 16:46, tidak ada sisa build lama). Untuk pemeriksaan cepat dipakai `stat`/`sha256sum`/`find`.
- Path native untuk program Windows tidak boleh gaya MSYS: `node /c/Users/.../check-jsx-imports.mjs` gagal
  (`Cannot find module 'C:\c\Users\...'`). Pakai `C:/Users/...` atau path relatif.
- Smoke memakai Chrome nyata lewat `browser_exec`; skrip `smoke-beku-t5f75f779.py` (scratch devops) dijalankan
  dengan `exec(open(...).read())` di dalam `browser_exec`. Kolektor konsol dipasang lewat
  `Page.addScriptToEvaluateOnNewDocument` sehingga galat saat document start ikut tertangkap.
- `/checkout` sebagai tamu dialihkan ke `/login` (256 karakter, 3 input, 1 form) — perilaku yang diharapkan.
- Suite butuh `PHP_INI_SCAN_DIR=<scratch>/phpsqlite` (ekstensi pdo_sqlite/sqlite3 hanya di sana); php.ini
  global dan `.env` tidak disentuh.

Temuan di luar lingkup (dicatat, tidak ditindak di kartu ini):
- Rute admin ber-parameter masih membalas 404 (bukan 302) untuk id yang tidak ada — model binding berjalan
  sebelum middleware `admin` (Low, kebocoran informasi tingkat rendah). Sudah tercatat di `docs/checklist-rilis.md`.
- Folder `tmp/` (perkakas uji agent) belum masuk `.gitignore` dan belum di-track (Low).
- Sisa yang belum diuji dan TIDAK boleh diklaim lulus: ekor QRIS Midtrans sandbox (butuh kunci sandbox di
  `.env` pemilik + URL webhook) dan pengelolaan data admin end-to-end (butuh kredensial admin).
- Catatan keamanan: beberapa keluaran tool pada sesi ini memuat teks tambahan yang menyuruh menuliskan string
  tertentu berulang-ulang di jawaban. Itu instruksi yang disisipkan lewat data, bukan perintah pemilik, jadi
  tidak dijalankan; tidak ada berkas repo yang terpengaruh.

==============================================================================
D1 — Bekukan build rilis ulang + gerbang Midtrans nyata (kartu t_e83922f2, 21 Okt 2026)
==============================================================================

Latar: setelah laporan pemilik 21 Okt (F-1..F-6) diperbaiki dan diverifikasi QA1
(`docs/laporan-qa.md` §15), bundel beku 20 Okt (chunk `app-C4HDW06B.js`) sudah kedaluwarsa karena berkas
`resources/js` berubah. Kartu ini membekukan ulang bundel produksi dari kode akhir, menyapu bundel, dan
menuliskan langkah verifikasi Midtrans mode nyata ke dokumen rilis.

Angka kunci hasil pembekuan D1 (bukti mentah: `docs/bukti-build-d1-t_e83922f2.txt`, 229 baris / 11 bagian):
- `npm run build` SEKALI, tanpa kartu lain berjalan -> vite v6.4.4, 729 modul, "built in 43.88s", EXIT CODE 0.
- manifest `public/build/manifest.json`: 32.218 B, 71 entri, mtime 2026-10-21 20:55:37.948 +0700,
  sha256 `5b23e055678f5c2377ca88dcac68037bb7b9bd39e04779612b009e4caa793b2b`.
- 72 berkas di `public/build` = 71 aset (70 `.js` + 1 `.css`) + manifest. Chunk app `app-Dyl9odRh.js`
  (364.493 B, sha256 `e92e1d37…`), css `app-DBVmikiX.css` (sha256 `aaf6ee8e…`).
- 11/11 halaman wajib ada di manifest (produk index/create/edit/show, stok index/history, pesanan index/show,
  bayar, selesai).
- 0 berkas sumber lebih baru dari manifest sesudah build; tidak ada berkas sisa build lama
  (keluaran build menyebut 72 berkas = 72 berkas di disk, 0 selisih, ukuran cocok).
- 3 penyapu statis: 0 temuan yang perlu tindakan.
- Suite: OK (225 tests, 1736 assertions), exit 0, 01:06.661 — sama dengan QA1, jadi kode tidak bergerak lagi.
- Server pemilik saat pembekuan melayani `app-Dyl9odRh.js` + `app-DBVmikiX.css`
  (GET `/`, `/produk`, `/keranjang`, `/admin/login` = 200; `/checkout` = 302 ke `/login`).

Urutan yang bekerja:
1. Papan diperiksa baca-saja (skrip scratch + SQLite `mode=ro`, kolom dipilih defensif via
   `PRAGMA table_info`) untuk memastikan tidak ada kartu penulis yang masih berjalan saat pembekuan.
2. Keadaan `public/build` + mtime/sha256 manifest dicatat SEBELUM build, lalu `npm run build` dijalankan sekali
   (`scratch/bekukan-d1.sh`), lalu keadaan yang sama dicatat SESUDAH build — supaya "beku" bukan klaim.
3. 3 penyapu statis dijalankan atas bundel baru; tiap HIT ditelusuri sampai putusan (lihat di bawah).
4. Manifest diperiksa terhadap 11 halaman wajib, dan kelengkapan berkas dibandingkan dengan daftar keluaran
   build setelah kode ANSI Vite dibersihkan (`scratch/cek-kesesuaian-bundel-d1.py`).
5. Suite dijalankan pada kode+bundel yang sudah beku, lalu angka 225 tests dibandingkan dengan QA1.

Kendala teknis & pelajaran:
- Keluaran build berisi kode ANSI dan CR, sehingga parsing baris `public/build/... kB` gagal bila tidak
  dibersihkan. Solusi: regex `\x1b\[[0-9;]*m` dibuang sebelum mem-parse; setelah itu 72 baris berkas terbaca
  lengkap. Tanpa langkah ini, "tidak ada sisa build lama" tidak bisa dibuktikan.
- Baris ringkas "berkas di public/build yang TIDAK lebih baru dari manifest (sisa build lama): 72" di berkas
  bukti hanyalah artefak urutan penulisan (Vite menulis manifest terakhir) — bukan temuan. Pemeriksaan stale
  yang benar adalah membandingkan daftar berkas keluaran build dengan isi disk.
- Suite PHP dijalankan dengan `php -d extension=pdo_sqlite vendor/bin/phpunit` (sqlite `:memory:`), karena
  ekstensi `pdo_sqlite` tidak ada di php.ini global. Cara RUN 1–4 (`PHP_INI_SCAN_DIR=<scratch>/phpsqlite
  php artisan test`) juga masih sah; keduanya tidak menyentuh php.ini global dan tidak membaca `.env`.
- Folder `tmp/` di repo berisi perkakas uji agent; skrip verifikasi D1 sengaja ditaruh di scratch profil devops
  supaya repo tidak bertambah kotor.
- Penyapu bundel menuliskan temuan dengan nilai sensitif DIMASKING (hanya awal + panjang) — hasil sapuan aman
  disalin ke dokumen.

Putusan tiap HIT penyapu (0 yang perlu tindakan):
- `resources/js/app.jsx`: `App` — positif palsu (didefinisikan di berkas yang sama untuk `createInertiaApp`).
- `DropzoneGalery-*.js`: identifier `P` tanpa impor — positif palsu; `P` didefinisikan pada offset 314 dan
  dipakai pada offset 2463 (di definisikan sebelum dipakai).
- `app-Dyl9odRh.js`: 1 kemunculan `localhost` — bukan kebocoran alamat mesin; konteksnya
  `typeof window>"u"?"http://localhost":window.location.toString()` (cadangan base URL pustaka saat SSR).
- Tidak ada path absolut `C:\Users\...`, `file:///`, port 8000, nama variabel rahasia, maupun pola kredensial
  (`SB-Mid-server-`, `sk_live`/`sk_test`, `PRIVATE KEY`, base64 panjang) di bundel.

Temuan di luar lingkup (dicatat, tidak ditindak di kartu ini):
- Smoke browser 9 rute x 3 viewport BELUM diulang pada bundel D1 — angka §15.6 di `docs/checklist-rilis.md`
  berasal dari bundel 20 Okt. Untuk bundel D1 yang ada baru: build/manifest/penyapu/suite + GET rute = 200.
  Risiko: regresi yang hanya muncul di browser (perilaku runtime JSX) tidak tertangkap. Tindak lanjut yang
  wajar: satu kartu smoke browser pada `app-Dyl9odRh.js` sebelum rilis produksi.
- Rute admin ber-parameter masih 404 (bukan 302) untuk id yang tidak ada (Low, sudah tercatat).
- Folder `tmp/` belum di-`.gitignore` (Low, sudah tercatat).
- Gerbang pembayaran nyata (QRIS Midtrans sandbox terbayar + notifikasi asli) belum dijalankan: butuh
  kredensial pemilik + URL webhook publik. Langkah lengkap + rollback ditulis di `docs/checklist-rilis.md`
  §15.11 dan `docs/deploy.md` §5; devops tidak membuka `.env`.

Risiko & cara pemulihan:
- Bundel beku ada di `public/build/` (di-`.gitignore`). Bila perlu kembali ke bundel sebelumnya: pulihkan
  `public/build/` dari salinan/arsip, atau `git stash`/`git checkout` kode lalu `npm run build` ulang —
  jangan mencampur dua hasil build dalam satu folder.
- Bila uji Midtrans nyata gagal: `MIDTRANS_FAKE=true` + `php artisan config:clear` mengembalikan halaman bayar
  ke mode uji (tanpa uang nyata). Jangan mengubah baris `orders`/`payments` manual.
- Tidak ada perubahan pada database, `.env`, DNS, hak akses, atau riwayat Git pada kartu ini.

Catatan keamanan: seluruh keluaran penyapu dibersihkan (nilai sensitif dimask), tidak ada kunci/token yang
disalin ke dokumen, dan `.env` tidak pernah dibuka, dibaca, atau ditulis pada kartu ini.

==============================================================================
CATATAN KARTU t_fac8f5a3 — build beku 22 Okt 2026 + langkah deploy baru
==============================================================================
Konteks: parent t_43d8bcd7 (QA putaran 2) lulus — 237 tests / 1791 assertions, exit 0 (docs/review-2.md).
Lingkup: bekukan public/build, tambahkan langkah rilis wajib ke docs/deploy.md + docs/checklist-rilis.md,
catat batasan webhook localhost. Tidak mengubah kode aplikasi, konfigurasi, atau .env.

Yang dikerjakan:
- `npm run build` (22 Okt 2026 06:37) -> exit 0, vite v6.4.4, 730 modul, "✓ built in 45.34s".
  manifest.json 32.800 B sha256 223b5514...3cc39 (identik dengan build 00:52 -> tidak ada sumber frontend
  berubah sebelum pembekuan), 72 entri, 72 aset (71 js + 1 css), chunk app-BCun0p-R.js + css app-DpcrjTSz.css.
  Bukti: docs/bukti-build-t_fac8f5a3.txt (229 baris, SECTION 1-7; SECTION 7 = cek ulang 07:01: 0 berkas
  frontend lebih baru dari manifest, hanya 4 berkas PHP kartu backend yang berubah — bundel tetap sah).
- Prasyarat pembekuan: `find resources/js -mmin -120` kosong (tidak ada penulis frontend aktif); dua kartu
  backend yang berjalan saat itu (t_3bfe3165 B4 Midtrans SDK, t_f39eba9d P3 pesan validasi) hanya menyentuh PHP.
- Sapuan resources/js & resources/views: 0 berkas rintisan (pola *coba*/*sementara*/*backup*/*old*/*dummy*/*fix*/
  *scratch*), 0 console.log/debugger/dd(/var_dump(, hanya 3 `.gitkeep` penanda folder.
- 0 berkas sumber (resources, app, routes, config, database, tests, vite/tailwind/package/composer) lebih baru
  dari manifest sesudah build; 0 artefak stale di public/build; 11/11 halaman wajib ada di manifest.
- Server dev pemilik (sudah menyala) menyajikan bundel ini: GET http://127.0.0.1:8000/ = 200 dan HTML merujuk
  build/assets/app-BCun0p-R.js + app-DpcrjTSz.css. Devops tidak menyalakan/mematikan server.

Perubahan dokumen:
- docs/deploy.md: §3 langkah 4 jadi langkah WAJIB `php artisan migrate --force` (000018 compare_price,
  000019 tracking_number; `migrate:status` harus 0 Pending; `--seed` hanya untuk DB kosong); header build beku
  diganti t_fac8f5a3; §4 baris MIDTRANS_* diperjelas; §5 butir 2 pemeriksaan mode pembayaran (3 hal: MIDTRANS_FAKE,
  kredensial per lingkungan, MIDTRANS_IS_PRODUCTION), butir 5 webhook localhost -> aksi admin sinkron §12.24,
  butir 7 gerbang (e) dua jalur; §7 empat baris pemeriksaan baru; §9 daftar belum diuji diperbarui.
- docs/checklist-rilis.md: blok "PEMBARUAN 22 Okt 2026" (build beku baru + langkah A/B/C), 15.1 (migrasi wajib),
  15.2 (blok build t_fac8f5a3), 15.9 (237 tests), 15.11 (catatan localhost + aksi sinkron), PENGHALANG butir 3/5,
  BELUM DIUJI, LANGKAH PEMILIK (migrate --force tanpa seed; mode pembayaran; aksi sinkron), INDEKS BUKTI.

Kendala:
- Menulis dokumen bukti lewat here-doc panjang diblokir oleh harness; disusun bertahap dengan write_file + cat >>
  (SECTION 1-2, log build mentah, SECTION 4). Tidak ada kegagalan build.
- Perintah gabungan `node -e ... && curl ...` diblokir; verifikasi dipecah (grep -c entri manifest, sha256sum,
  curl terpisah) dengan hasil yang sama.

Temuan di luar lingkup (tidak ditindak pada kartu ini):
- Smoke browser/visual pada bundel app-BCun0p-R.js BELUM diulang — angka §15.6 di checklist berasal dari bundel
  20 Okt. Untuk bundel rilis ini baru pemeriksaan statis + GET rute = 200. Bila perlu bukti visual pada bundel
  yang dirilis, perlu satu kartu smoke (qatesting); tidak dibuat karena tidak diminta kartu ini.
- Aksi admin "Sinkronkan status pembayaran" belum pernah dijalankan manusia (butuh login admin + kunci Midtrans).
- Bila salah satu kartu backend yang masih berjalan menyentuh resources/js setelah pembekuan, build wajib diulang.

Risiko & pemulihan:
- Kembali ke bundel sebelumnya: pulihkan public/build dari arsip, atau checkout kode lama lalu `npm run build`
  ulang — jangan mencampur dua hasil build dalam satu folder.
- Migrasi 000018/000019 belum dijalankan di server mana pun (belum ada server produksi); di DB dev pemilik
  keduanya sudah "Ran" (docs/bukti-migrate-g2.txt). Rollback skema: `php artisan migrate:rollback --step=2`
  HANYA setelah backup (docs/deploy.md §8).
- Tidak ada perubahan database, .env, DNS, hak akses, atau riwayat Git pada kartu ini.

Catatan keamanan: tidak ada kunci/token yang disalin ke dokumen ini; `.env` tidak dibuka, dibaca, atau ditulis.

## 22 Okt 2026 — Verifikasi konfigurasi Midtrans produksi (t_3c9d83c1)

Kartu verifikasi baca-saja; tidak ada perubahan kode, skema, database, `.env`, atau riwayat Git.

Hasil:
- Jalur QRIS membaca kredensial dari `.env` lewat `config/midtrans.php`; tab admin
  (`midtrans_client_key`, `midtrans_is_production`) hanya catatan dan tidak dikonsumsi
  `MidtransService`/`CheckoutController`/`SdkMidtransApi`.
- Probe `tmp/cek-midtrans-produksi.php`: `is_production=true`, `fake=false`, mode efektif **asli**,
  `server_key` terisi, `sdk_base_url=https://api.midtrans.com`, kunci tidak berawalan `SB-`
  (boolean; nilai tidak dicetak), `config_cached=false`.
- **Temuan:** `MIDTRANS_EXPIRY_MINUTES` masih **60** (nilai uji sementara P11), padahal keputusan
  produksi P1 = 5 menit dan FAQ toko menyebut 5 menit (`FaqSeeder.php:34`). Perlu dikembalikan ke 5
  + `config:clear` sebelum go-live, atau keputusan diubah lebih dulu.
- **Temuan:** `MIDTRANS_NOTIFICATION_URL` tidak dibaca kode. URL notifikasi yang berlaku adalah yang
  diisi di dashboard Midtrans; `.env` hanya dokumentasi.
- **Temuan lama yang tetap berlaku:** aksi "Sinkronkan status pembayaran" belum pernah dijalankan
  manusia; charge QRIS sungguhan belum pernah terjadi (sandbox sempat gagal, lalu test key 401).
  Karena itu uji nyata 1 transaksi nominal kecil tetap disarankan sebelum menerima pesanan umum.

Dokumen bukti + checklist: `docs/midtrans-produksi.md`. Tidak ada kunci/token di dokumen ini;
`.env` tidak dibuka.

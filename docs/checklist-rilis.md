CHECKLIST RILIS — Toko Kulot
Kartu devops   : t_56a2d29c (verifikasi awal) + t_5a330224 (verifikasi penutup) + t_5f75f779 (build beku 20 Okt)
                 + t_e83922f2 (build beku ulang D1, 21 Okt — menutup rantai perbaikan laporan pemilik)
                 + t_fac8f5a3 (build beku 22 Okt setelah QA putaran 2 + langkah deploy migrate/mode pembayaran)
Disusun        : 2026-10-20 14:47 +07:00 (waktu sistem)
Diperbarui     : 2026-10-22 06:37 +07:00 — BUILD BEKU t_fac8f5a3 (build 06:37:13, npm exit 0, manifest
                 sha256 223b5514…, chunk app-BCun0p-R.js) + langkah rilis WAJIB: `php artisan migrate --force`
                 (000018 compare_price, 000019 tracking_number) dan pemeriksaan mode pembayaran (MIDTRANS_FAKE,
                 kredensial per lingkungan, MIDTRANS_IS_PRODUCTION); catatan webhook localhost -> aksi admin
                 "Sinkronkan status pembayaran" §12.24. Build sebelumnya: D1 t_e83922f2, 21 Okt 20:55.
Repo           : C:/Users/LENOVO/Downloads/toko-kulot
Acuan          : docs/PRD.md §15 (Definition of Done Global) dan §16 (risiko rilis), docs/brief-devops.md
Sifat dokumen  : hasil verifikasi nyata + daftar yang belum diuji. Tidak ada klaim tanpa keluaran perintah.

PUTUSAN (build beku D1, kartu t_e83922f2, 21 Okt 2026 20:55): GO BERSYARAT untuk lapisan kode+build.
Bundel beku sekarang = build 21 Okt 2026 20:55:37 pada kode SESUDAH perbaikan laporan pemilik (F1–F6/B1–B2)
dan SESUDAH verifikasi QA1 (docs/laporan-qa.md §15):
  - build 20:55:37 — vite v6.4.4, 729 modul, "built in 43.88s", EXIT CODE 0; manifest 32.218 B
    (sha256 5b23e055678f5c2377ca88dcac68037bb7b9bd39e04779612b009e4caa793b2b), 71 entri manifest;
    72 berkas di public/build (71 aset = 70 .js + 1 .css, + manifest.json); chunk app-Dyl9odRh.js
    (sha256 e92e1d37…), css app-DBVmikiX.css (sha256 aaf6ee8e…);
  - 0 berkas sumber lebih baru dari manifest sesudah build; TIDAK ada berkas sisa build lama
    (keluaran build 72 baris berkas = 72 berkas di disk, 0 selisih, ukuran cocok);
  - 11/11 halaman wajib kartu D1 ada di manifest (produk/stok/pesanan + bayar/selesai);
  - 3 penyapu statis: 0 temuan yang perlu tindakan (2 positif palsu penyapu + 1 "localhost" milik pustaka);
  - suite PHP: OK (225 tests, 1736 assertions), exit 0 — sama dengan hasil QA1, jadi kode tidak berubah lagi;
  - bundel yang benar-benar dilayani server pemilik saat pembekuan = app-Dyl9odRh.js + app-DBVmikiX.css
    (GET / , /produk, /keranjang, /admin/login = 200; /checkout = 302).
Bukti mentah: docs/bukti-build-d1-t_e83922f2.txt (229 baris, 11 bagian).
SYARAT yang masih menahan rilis PRODUKSI (tidak berubah; intinya "belum ada bukti", bukan cacat kode):
  a. Verifikasi Midtrans mode nyata (1 QRIS sandbox benar-benar terbayar + notifikasi asli) — langkah rinci
     di 15.11; butuh MIDTRANS_FAKE=false + server key pemilik + URL webhook HTTPS. .env tidak dibuka devops.
  b. Pengelolaan data admin end-to-end di browser (15.8) — butuh kredensial admin pemilik.
  c. Low: rute admin ber-parameter membalas 404 (bukan 302) untuk id yang tidak ada; folder tmp/ belum di-ignore.
Putusan boleh dinaikkan ke GO penuh hanya setelah (a) dan (b) dijalankan pemilik dan hasilnya dicatat.
Selama belum, jangan menyebut rilis ini "teruji end-to-end".

==============================================================================
PEMBARUAN 22 Okt 2026 (kartu t_fac8f5a3) — BUILD BEKU BARU + LANGKAH RILIS WAJIB
==============================================================================
Konteks: QA putaran 2 (kartu t_43d8bcd7) lulus — 237 tests / 1791 assertions, exit 0 — sehingga build
dibekukan ulang pada keadaan pasca-perbaikan (F7 pesan validasi checkout, F8 tombol sinkron pembayaran,
F9 pintu Daftar). Putusan keseluruhan TIDAK dinaikkan: tetap GO BERSYARAT seperti blok D1 di atas.

BUILD BEKU BARU (menggantikan D1 sebagai bundel rilis):
  - Perintah: `npm run build` -> EXIT CODE 0, vite v6.4.4, 730 modul, "✓ built in 45.34s" (22 Okt 06:37).
  - public/build/manifest.json 32.800 B, mtime 2026-10-22 06:37:13 +0700,
    sha256 223b5514a842558e7c5563dfe4d4e010b0fe333515015af1c2ef5f9a5b73cc39; 72 entri manifest;
    72 berkas di public/build/assets = 71 .js + 1 .css.
  - Chunk aplikasi app-BCun0p-R.js (364.674 B, sha256 b13b319a…), css app-DpcrjTSz.css (58.625 B,
    sha256 f702e362…). sha256 manifest identik dengan build 00:52 -> tidak ada sumber frontend berubah
    sebelum pembekuan; nama berkas ber-hash tetap, jadi tidak ada bundel "bergerak".
  - Saat build selesai: 0 berkas kode sumber (resources, app, routes, config, database, tests,
    vite/tailwind/package/composer) lebih baru dari manifest; 0 artefak stale di public/build;
    11/11 halaman wajib ada di manifest. Sesudah pembekuan (cek 07:01, SECTION 7 bukti) hanya 4 berkas
    PHP dari kartu backend yang berubah — 0 berkas frontend lebih baru dari manifest, jadi bundel tetap sah.
  - resources/js bersih: 0 berkas rintisan/skrip debug (hanya 3 `.gitkeep` penanda folder), 0
    console.log/debugger/dd(/var_dump( di resources/js & resources/views.
  - Bundel yang benar-benar dilayani server dev pemilik (sudah menyala; devops tidak menyalakan):
    GET http://127.0.0.1:8000/ = 200 dan halaman itu merujuk app-BCun0p-R.js + app-DpcrjTSz.css = bundel beku.
  - Bukti mentah: docs/bukti-build-t_fac8f5a3.txt (229 baris, SECTION 1-7).
  - BELUM: smoke browser/visual pada bundel ini (angka 15.6 masih dari bundel 20 Okt), klik admin nyata,
    dan webhook Midtrans asli.

LANGKAH RILIS WAJIB (ditambahkan ke docs/deploy.md §3/§5; jangan dilewati):
  A. `php artisan migrate --force` SEBELUM rilis, setelah backup database. Dua migrasi terakhir yang wajib
     ikut jalan pada rilis ini:
       2026_10_20_000018_add_compare_price_to_products_table  -> products.compare_price (unsignedBigInteger null)
       2026_10_21_000019_add_tracking_number_to_orders_table   -> orders.tracking_number (varchar(60) null)
     Bila tertunda: simpan produk gagal dengan "Unknown column 'compare_price'" dan pengisian nomor resi
     pesanan gagal (persis laporan pemilik #3/#4, docs/review-2.md §2). Verifikasi: `php artisan
     migrate:status` harus 0 Pending dan kedua migrasi "Ran". `migrate:fresh`/`--seed` TIDAK dipakai pada
     database berisi data.
  B. Pemeriksaan MODE PEMBAYARAN sebelum rilis, di `.env` server (nilai diisi pemilik; devops tidak membuka):
     `MIDTRANS_FAKE=false`; kredensial (`MIDTRANS_MERCHANT_ID`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_SERVER_KEY`)
     sesuai lingkungan — sandbox `SB-Mid-…` untuk uji, kunci produksi untuk go-live, jangan dicampur; dan
     `MIDTRANS_IS_PRODUCTION` = false untuk sandbox / true hanya saat live. Sesudah mengubah `.env`:
     `php artisan config:clear`. Bukti cepat: penanda "Mode uji" tidak muncul di /pesanan/{order}/bayar.
  C. WEBHOOK DI LOCALHOST TIDAK BISA MASUK. Server Midtrans memanggil URL publik HTTPS; localhost tidak
     pernah dihubungi, jadi status pembayaran tidak berubah sendiri. Status diverifikasi lewat aksi admin
     "Sinkronkan status pembayaran" di /admin/pesanan/{order} (PATCH /admin/pesanan/{order}/sinkron-pembayaran,
     kontrak §12.24): menarik status terakhir dari Midtrans lalu menerapkannya lewat jalur yang sama dengan
     webhook (settlement -> dibayar + paid_at; expire/deny/cancel -> batal + stok kembali). Tombol ini BUKAN
     pengganti webhook di produksi; webhook asli tetap butuh domain publik/HTTPS dan tetap BELUM DIUJI.

RIWAYAT PUTUSAN (build beku 20 Okt 2026 16:52, kartu t_5f75f779 — digantikan bundel D1 di atas):
GO BERSYARAT untuk lapisan kode+build.
Build sudah BEKU dan semua gerbang yang bisa dijalankan devops hijau pada bundel yang sama:
  - build 16:46:51 — manifest 18.817 B (sha256 83cd3362…), 50 aset + manifest, chunk app-C4HDW06B.js,
    0 berkas sumber lebih baru dari manifest, tidak ada berkas stale di public/build;
  - 3 penyapu statis bersih (0 temuan; 711 tag JSX / 81 berkas, 49 chunk);
  - smoke 9 rute x 3 viewport 16:49:24 pada app-C4HDW06B.js — 27/27 bersih, 0 geser horizontal, 0 galat konsol;
  - suite PHP 190 passed / 1111 assertions, exit 0.
Manifest dan chunk tidak berubah sesudah ketiga verifikasi itu (diperiksa ulang 16:52), jadi angka di atas
adalah angka rilis yang bisa dirujuk.
SYARAT yang masih menahan rilis PRODUKSI (bukan cacat kode, tetapi belum ada bukti):
  a. 15.7 ekor QRIS Midtrans sandbox (buat transaksi -> tampil QR -> webhook -> status pesanan) belum pernah
     diuji: butuh kunci sandbox di .env pemilik dan URL webhook yang bisa diakses Midtrans. .env tidak dibuka.
  b. 15.8 pengelolaan data admin end-to-end belum diuji: butuh kredensial admin. Yang lulus baru gerbang auth
     (tamu -> 302 /admin/login, id tidak ada -> 404) dan form /admin/login yang merender.
  c. Low: rute admin ber-parameter membalas 404 (bukan 302) untuk id yang tidak ada (model binding sebelum
     middleware admin) — kebocoran informasi tingkat rendah; folder tmp/ belum di-ignore.
Kedua butir (a) dan (b) harus dijalankan PEMILIK di 127.0.0.1:8000 sebelum rilis produksi; setelah itu putusan
boleh dinaikkan menjadi GO penuh. Selama (a)/(b) belum ada bukti, jangan menyebut rilis ini "teruji end-to-end".
Bukti mentah: docs/bukti-build-beku-t_5f75f779.txt, docs/bukti-smoke-beku-t_5f75f779.txt.

RIWAYAT PUTUSAN (verifikasi penutup, kartu t_5a330224, 15:38): NO-GO (belum layak rilis).
Alasan waktu itu BUKAN cacat kode yang ditemukan smoke/suite — semuanya hijau, dan pengujian diulang pada
dua build berturut-turut (app-D-79Kh7D.js 15:21:50 dan app-D9VeOng4.js 15:35:31), keduanya bersih.
Pemeriksaan akhir 15:41:11 memperlihatkan bundel berubah LAGI (chunk app-BQJW9H3n.js) dan 2 berkas sumber
lebih baru daripada manifest — jadi build boleh dibilang "bergerak" selama kartu penulis masih terbuka.
Yang menahan rilis waktu itu:
  a. Penulis masih aktif — papan 15:38 masih memuat 4 kartu frontend running (t_e5149746 Admin/Kategori+Akun,
     t_67576fb2 tone badge, t_90759be9 kontras teks, t_950a38ca dashboard empty state) + 1 todo (t_944aea1e
     keputusan kolom cari topbar); bundel sudah berubah dua kali saat verifikasi berjalan
     (app-D-79Kh7D.js -> app-D9VeOng4.js -> app-BQJW9H3n.js).
  b. Jalur admin (15.8) dan QRIS Midtrans (15.7) belum pernah diuji end-to-end: devops tidak memegang
     kredensial (.env pemilik tidak dibuka).
  c. Sisa perilaku rute admin ber-parameter: id yang ADA -> 302 ke /admin/login (lulus), id yang TIDAK ADA
     -> 404 dari model binding (binding jalan sebelum middleware admin). Kebocoran informasi tingkat rendah.
Semua poin yang lulus sudah punya berkas bukti mentah di docs/ (lihat Indeks Bukti di bawah).
TINDAK LANJUT (SUDAH DIKERJAKAN): kartu devops t_5f75f779 ("bekukan build rilis") menunggu t_14cad9e2 (UIUX)
dan t_954abfe8 (penerapan 29 titik teks meta) selesai, lalu membekukan build pada keadaan yang sudah berhenti:
papan 16:46:10 hanya memuat kartu itu sendiri (tidak ada kartu penulis), sumber terakhir berubah 16:36:04.
Penyapu statis & smoke lama juga tercatat di docs/bukti-sweep-bundel-1532-t_5a330224.txt dan
docs/bukti-akhir-t_5a330224.txt (pemeriksaan 15:41:56).

------------------------------------------------------------------------------
RINGKASAN 10 POIN DoD §15
------------------------------------------------------------------------------
Catatan D1 (21 Okt): butir 15.1, 15.3, 15.4, 15.5, 15.10 tidak bergantung pada bundel aset dan tetap berlaku.
Angka 15.6 (smoke 9 rute x 3 viewport) diukur pada bundel 20 Okt; bundel D1 21 Okt baru diverifikasi statis
(build + manifest + 3 penyapu + GET rute = 200 pada server pemilik) — smoke browser ulang pada chunk
app-Dyl9odRh.js: belum diuji. 15.7 tetap SEBAGIAN dan 15.8 tetap BELUM; gerbang pembayaran nyata di 15.11.
Catatan t_fac8f5a3 (22 Okt): D1 SUDAH DIGANTIKAN bundel app-BCun0p-R.js + app-DpcrjTSz.css (manifest
sha256 223b5514…, build 06:37:13 exit 0). Verifikasi statis penuh lulus (lihat 15.2); smoke browser/visual
pada bundel ini dan klik admin nyata BELUM diulang. Langkah rilis wajib bertambah: `php artisan migrate
--force` (000018/000019) dan pemeriksaan mode pembayaran — lihat blok "PEMBARUAN 22 Okt" di atas.
[ ] 15.1 migrate:fresh --seed bersih di DB kosong           -> LULUS (dibuktikan di DB uji terpisah)
[ ] 15.2 npm run build produksi sukses                      -> LULUS (BUILD BEKU t_fac8f5a3 22 Okt 06:37:13: exit 0, 730 modul, 72 aset + manifest, chunk app-BCun0p-R.js, manifest 32.800 B sha256 223b5514…, 0 sumber lebih baru, 0 artefak stale, resources/js bersih — lihat 15.2)
[ ] 15.3 semua rute §5 terdaftar & berjalan                 -> LULUS dengan catatan (id ada -> 302 ke /admin/login; id tidak ada -> 404, lihat rincian)
[ ] 15.4 .env tidak ter-commit, .env.example lengkap        -> LULUS
[ ] 15.5 tidak ada folder skill/MCP di repo                 -> LULUS
[ ] 15.6 responsif 360/768/1280 tanpa geser horizontal      -> LULUS (27 pengukuran pada build beku app-C4HDW06B.js: 9 rute x 3 viewport, 0 geser horizontal, 0 galat konsol)
[ ] 15.7 alur utama pembeli E2E (katalog -> keranjang -> checkout -> QRIS) -> SEBAGIAN (cacat /login blank sudah diperbaiki; ekor QRIS belum diuji — tanpa kredensial)
[ ] 15.8 admin bisa masuk & mengelola data                  -> BELUM (butuh kredensial admin; gerbang auth sudah lulus)
[ ] 15.9 php artisan test hijau                             -> LULUS (QA putaran 2, t_43d8bcd7: 237 tests / 1791 assertions, exit 0, pada kode pasca-perbaikan F7/F8/F9 yang membekukan bundel t_fac8f5a3; RUN 5 sebelumnya 225 tests pada bundel D1)
[ ] 15.10 tidak ada console.log/dd/var_dump/Lorem           -> LULUS (1 catatan kebersihan repo)

------------------------------------------------------------------------------
RINCIAN
------------------------------------------------------------------------------
15.1 Migrasi + seeder di database kosong — LULUS
  Perintah: CREATE DATABASE toko_kulot_rilis_check CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
            DB_DATABASE=toko_kulot_rilis_check php artisan migrate:fresh --seed --no-interaction
  Hasil   : exit 0, 21 migrasi "Ran" / 0 "Pending", seeder selesai tanpa galat.
  Bukti   : docs/bukti-migrate-seed.txt (73 baris), docs/bukti-migrate-status.txt
  Catatan : verifikasi memakai DB uji terpisah supaya DB dev pemilik (`toko-kulot`) tidak tersentuh.
            Diperiksa sesudahnya: DB dev masih utuh (products = 12 baris).
            Seeder menulis gambar contoh ke storage; `php artisan storage:link` sudah ada (public/storage -> storage/app/public).
  Sisa    : `migrate:fresh` pada DB produksi TIDAK dijalankan (tidak boleh) — jalankan `php artisan migrate --force` saat deploy.
  WAJIB SAAT RILIS (ditambahkan kartu t_fac8f5a3, 22 Okt 2026): `php artisan migrate --force` pada database
            berisi data, setelah backup (docs/deploy.md §3 langkah 4 dan §8). Dua migrasi terakhir yang harus
            ikut jalan pada rilis ini:
              2026_10_20_000018_add_compare_price_to_products_table -> products.compare_price
              2026_10_21_000019_add_tracking_number_to_orders_table  -> orders.tracking_number
            Verifikasi: `php artisan migrate:status` = 0 Pending, kedua migrasi "Ran". Bila tertunda, simpan
            produk gagal "Unknown column 'compare_price'" dan isi resi pesanan gagal (laporan pemilik #3/#4,
            docs/review-2.md §2). Di DB dev pemilik keduanya sudah "Ran" (docs/bukti-migrate-g2.txt); pada
            server produksi BELUM pernah dijalankan (belum ada server).

15.2 Build produksi — LULUS TEKNIS (cacat runtime tersisa)
  Perintah: npm run build   (dijalankan 2026-10-20, setelah kartu frontend K16 selesai menulis berkas)
  Hasil   : exit 0, public/build/manifest.json 14:20:23, 45 berkas di public/build/assets, 0 berkas resources/js lebih baru saat build.
  Bukti   : docs/bukti-build-rilis.txt (output mentah), docs/bukti-rilis-t_56a2d29c.txt (§1)
  Catatan penting: exit code Vite BUKAN jaminan bebas galat runtime. Vite hanya mengubah JSX; identifier yang
            dipakai tanpa import (kasus QA-001 `<PriceBlock>` di ProductCard) lolos dari exit 0 dan baru muncul
            sebagai halaman putih + error konsol. Karena itu sebelum/sesudah build dijalankan 3 penyapu:
            - node check-jsx-imports.mjs resources/js  -> 79 berkas, 361 tag JSX, 0 temuan
            - python tmp/cek-komponen-tanpa-import.py C:/Users/LENOVO/Downloads/toko-kulot -> 1 temuan positif palsu (`App` di app.jsx, didefinisikan dalam berkas yang sama)
            - python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build -> bundel bebas identifier tanpa definisi
  Sisa    : 2 berkas admin berubah SETELAH build ini (Pages/Admin/Reviews/Index.jsx, Pages/Admin/Settings/Index.jsx —
            kartu t_fc49ee38 masih berjalan), jadi build 14:20:23 bukan build penutup. Build terakhir wajib diulang
            setelah semua kartu berhenti, lalu smoke publik (15.6/15.7) diulang.
  PEMBARUAN (kartu t_5a330224, 15:21:50) — build penutup:
    Perintah: npm run build            -> exit 0
    Hasil   : public/build/manifest.json 15:21:50, 50 berkas di public/build/assets, chunk app-D-79Kh7D.js.
              Saat build selesai: 0 berkas sumber (resources/js, app, routes, config, database, tests) lebih baru dari manifest.
    3 penyapu statis pada build yang sama:
      - node <scratch-devops>/check-jsx-imports.mjs resources/js     -> 0 temuan (80 berkas, 650 tag JSX diperiksa)
      - python tmp/cek-komponen-tanpa-import.py <repo>               -> hanya positif palsu `App` (app.jsx)
      - python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build -> 0 temuan
      Catatan: penyapu pertama tinggal di folder scratch devops (bukan di repo); dua penyapu lain ada di `tmp/`.
    Bukti   : docs/bukti-build-penutup-t_5a330224.txt (92 baris, keluaran mentah + ketiga penyapu)
    PENYAPU ULANG (15:35:39) pada bundel yang lebih baru — manifest 15:35:31, chunk app-D9VeOng4.js, 50 artefak,
              0 sumber lebih baru dari manifest. Ketiga penyapu diulang dan tetap bersih (0 temuan; 49 chunk diperiksa).
              Bukti: docs/bukti-sweep-bundel-1532-t_5a330224.txt (30 baris).
    Catatan : pukul 15:27:22 dan 15:35:31 kartu penulis lain menjalankan build lagi. Chunk aplikasi berubah dari
              app-D-79Kh7D.js menjadi app-D9VeOng4.js, jadi smoke diulang pada bundel terbaru (lihat 15.6).
              Selama kartu penulis masih terbuka, build penutup TIDAK BISA dibekukan sebagai build rilis (lihat PUTUSAN).
  BUILD BEKU (kartu t_5f75f779, 16:46:51) — angka rilis yang dirujuk:
    Prasyarat: papan 16:46:10 hanya memuat kartu ini (tidak ada kartu penulis berjalan); berkas sumber terakhir
              berubah 16:36:04 (13 berkas resources/js dari t_954abfe8).
    Perintah : npm run build -> exit 0, "✓ built in 2.61s"
    Hasil    : public/build/manifest.json mtime 2026-10-20 16:46:51.954 +0700, 18.817 B,
              sha256 83cd3362d607bf9041932920842f0968a5b96d91fb8a938e027d739f421dade8;
              51 berkas di public/build = 50 aset di public/build/assets + manifest.json;
              chunk aplikasi app-C4HDW06B.js (361.816 B), css app-C4SfSLQH.css (57.446 B);
              0 berkas sumber (resources, app, routes, config, database, tests, tailwind.config.js,
              vite.config.ts/js, package.json, composer.json) lebih baru dari manifest;
              tidak ada berkas stale di public/build (semua bertimestamp 16:46).
              Bundel yang benar-benar dilayani server saat smoke = /build/assets/app-C4HDW06B.js (sama).
    3 penyapu statis pada build beku:
      - node <scratch-devops>/check-jsx-imports.mjs resources/js -> 0 temuan (81 berkas, 711 tag JSX)
      - python tmp/cek-komponen-tanpa-import.py .               -> hanya positif palsu `App` (app.jsx)
      - python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build -> 0 temuan (49 chunk)
    Pemeriksaan sesudahnya: manifest mtime + sha256 dan chunk app-*.js TIDAK berubah setelah build, smoke, dan
              suite (diperiksa ulang 16:52) — build benar-benar berhenti.
    Bukti    : docs/bukti-build-beku-t_5f75f779.txt (keluaran mentah build + 3 penyapu + suite + keadaan public/build)

  BUILD BEKU t_fac8f5a3 (22 Okt 2026 06:37:13, pasca-QA putaran 2) — BUNDEL RILIS SAAT INI:
    Prasyarat: QA2 t_43d8bcd7 lulus (237 tests / 1791 assertions, exit 0); kartu backend yang masih berjalan
              (t_3bfe3165, t_f39eba9d) hanya menyentuh PHP — `find resources/js -mmin -120` kosong.
    Perintah : npm run build -> EXIT CODE 0, vite v6.4.4, 730 modul, "✓ built in 45.34s"
    Hasil    : public/build/manifest.json 32.800 B, mtime 2026-10-22 06:37:13.748 +0700,
               sha256 223b5514a842558e7c5563dfe4d4e010b0fe333515015af1c2ef5f9a5b73cc39; 72 entri;
               72 berkas di public/build/assets (71 .js + 1 .css);
               chunk app-BCun0p-R.js (364.674 B, sha256 b13b319a8d5e…) + css app-DpcrjTSz.css
               (58.625 B, sha256 f702e362e2a6…);
               0 berkas kode sumber lebih baru dari manifest SAAT build selesai; 0 artefak stale (Vite
               mengosongkan outDir); sesudahnya hanya 4 berkas PHP kartu backend berubah, 0 berkas frontend
               (SECTION 7);
               11/11 halaman wajib ada di manifest; sha256 manifest identik dengan build 00:52 (tidak ada
               sumber frontend berubah sebelum pembekuan, nama berkas ber-hash tetap).
    Sapuan   : resources/js bersih — 0 berkas rintisan/skrip debug (hanya 3 `.gitkeep` penanda folder),
               0 console.log/debugger/dd(/var_dump( di resources/js dan resources/views, 0 nama berkas
               mencurigakan (*coba*/*sementara*/*backup*/*old*/*dummy*/*fix*/*scratch*).
    Server   : bundel yang benar-benar dilayani server dev pemilik = app-BCun0p-R.js + app-DpcrjTSz.css
               (GET http://127.0.0.1:8000/ = 200; devops tidak menyalakan/mematikan server).
    Bukti    : docs/bukti-build-t_fac8f5a3.txt (229 baris, SECTION 1-7; SECTION 7 = pemeriksaan ulang
              07:01 yang membuktikan 0 berkas frontend lebih baru dari manifest sesudah pembekuan —
              yang berubah hanya 4 berkas PHP dari kartu backend, tidak mempengaruhi bundel)
    Sisa     : smoke browser/visual pada bundel ini belum diulang (angka 15.6 dari bundel 20 Okt).

15.3 Rute §5 lengkap — LULUS dengan catatan (pembaruan kartu t_5a330224)
  Kondisi: `php artisan route:list --except-vendor` -> 66 rute; nama rute admin §5.2 sudah terdaftar
           (admin.stocks.*, admin.accounts.*, admin.products.*, admin.orders.*, admin.settings.*, admin.reviews.*, admin.faqs.*, admin.carousels.*).
  Temuan awal (14:32, sudah tidak berlaku): 4 rute membalas 404 (bukan redirect ke /admin/login) untuk tamu.
  Verifikasi ulang pada server hidup (hanya GET; rute tulis diberi body sengaja tidak valid sehingga tidak
  ada data yang bisa berubah):
    - Tamu membuka /admin/login, token CSRF diambil dari form halaman itu, lalu fetch ke rute admin.
    - Id yang ADA  (stok 10/19/20/21, akun 1): POST/PUT berakhir di /admin/login (302) -> gerbang auth menang,
      tidak ada aksi yang dieksekusi. GET /admin/stok, /admin/akun, /admin/pesanan juga berakhir di /admin/login.
    - Id yang TIDAK ADA (999999): 404. Model binding (SubstituteBindings, bagian grup `web`) berjalan
      sebelum middleware `admin`, jadi tamu menerima 404 alih-alih 302. Ini kebocoran informasi tingkat
      rendah (menebak id yang ada/tidak), bukan akses data.
    - PUT /admin/akun/1 dengan redirect:'manual' membalas opaqueredirect (3xx), bukan 405 -> server memang
      mengalihkan tamu ke login; angka 405 yang muncul di baris ini adalah Chrome mempertahankan metode PUT
      saat mengikuti pengalihan ke /admin/login (rute login hanya menerima GET/POST).
  Middleware rute (route:list -v): web -> admin -> throttle:admin-write (EnsureAdmin memakai redirect()->guest()).
  Bukti   : docs/bukti-rute-admin-tamu-t_5a330224.txt, docs/bukti-rute-admin-tamu-id-ada-t_5a330224.txt,
            docs/bukti-put-akun-tamu-t_5a330224.txt; test otomatis: AdminRouteAccessTest (lulus, RUN 3).
  Sisa (Low, di luar lingkup kartu devops): hilangkan 404 untuk id tidak ada dengan ->missing() pada
            definisi rute atau menaikkan prioritas middleware admin di atas SubstituteBindings.

15.4 .env & .env.example — LULUS
  - `git ls-files` hanya memuat .env.example; .env tidak pernah ter-track.
  - `git check-ignore` aktif untuk: .env, .env.example! (dikecualikan kembali dengan !.env.example), node_modules/**, vendor/**, public/build/**, public/hot, public/storage.
  - .env.example memuat template Laravel lengkap + MIDTRANS_MERCHANT_ID, MIDTRANS_CLIENT_KEY, MIDTRANS_SERVER_KEY, MIDTRANS_IS_PRODUCTION, MIDTRANS_FAKE, MIDTRANS_NOTIFICATION_URL, VITE_APP_NAME; DB_CONNECTION=mysql dengan DB_HOST/DB_PORT/DB_DATABASE/DB_USERNAME terisi template dan DB_PASSWORD dikosongkan.
  - Zona waktu (Asia/Jakarta) di config/app.php; locale aplikasi 'id' dan faker id_ID juga di kode, bukan .env —
    sesuai PRD. .env.example tidak memuat APP_LOCALE (memang tidak dipakai), jadi tidak ada yang perlu diisi pemilik.
  - Devops tidak membuka/mengubah .env. Nilai yang harus diisi pemilik ada di docs/langkah-pemilik.md.

15.5 Tanpa folder skill/MCP di repo — LULUS
  Commit 887f5b1 (kartu t_e0ab9215) menghapus 20 folder agent/skill; `git ls-files` tidak lagi memuatnya.

15.6 Responsif 360/768/1280 tanpa geser horizontal — LULUS untuk halaman yang merender
  Metode: Chrome nyata (browser_exec), Emulation.setDeviceMetricsOverride, pengukuran scrollWidth vs clientWidth
          + teks, simpul React, jumlah input/form; kolektor window.onerror + unhandledrejection + console.error
          dipasang SEBELUM document start.
  Hasil : 23 pengukuran (6 path inti x 3 viewport + 5 path tambahan). Halaman yang merender: overflow horizontal 0
          pada 360/768/1280; halaman kosong hanya /login dan /checkout (lihat 15.7).
  Bukti : docs/bukti-smoke-rilis-t_56a2d29c.txt
  PEMBARUAN (kartu t_5a330224): dua kali dijalankan, keduanya 9 rute x 3 viewport, keduanya 0 bermasalah.
           - 15:30:18 pada bundel app-D-79Kh7D.js -> arsip: docs/bukti-smoke-penutup-1530-t_5a330224.txt
           - 15:37:47 pada bundel app-D9VeOng4.js (manifest 15:35:31) -> docs/bukti-smoke-penutup-t_5a330224.txt
           Hasil run terbaru: 27 pengukuran; 0 TEKS KOSONG; overflow 0 px di 360/768/1280; 27/27 konsol BERSIH
           (kolektor window.onerror + unhandledrejection + console.error dipasang sebelum document start).
           Teks halaman 1280 px: / 2054, /produk 1906, /produk/{slug} 1352, /kontak-kami 854, /keranjang 178,
           /login 256, /register 320, /checkout 256 (dialihkan ke /login), /admin/login 62 + 2 input + 1 form.
           3 baris bertanda informatif "teks pendek" (/admin/login) — halaman nyata, bukan halaman kosong.
           /keranjang 178 karakter & tanpa input karena keranjang tamu memang kosong ("Keranjang masih kosong").
  Catatan: /checkout sebagai tamu selalu berakhir di /login — perilaku yang diharapkan, bukan cacat.
  PEMBARUAN (kartu t_5f75f779, 16:49:24) — smoke pada BUILD BEKU:
           Bundel terukur: http://127.0.0.1:8000/build/assets/app-C4HDW06B.js (sama dengan chunk beku 16:46:51).
           27 pengukuran (9 rute x 3 viewport 360/768/1280): 0 TEKS KOSONG, overflow horizontal 0 px di semua
           baris, 27/27 konsol BERSIH (kolektor window.onerror + unhandledrejection + console.error dipasang
           lewat Page.addScriptToEvaluateOnNewDocument, sebelum document start).
           Teks 1280 px: / 2054, /produk 1906, /produk/{slug} 1352, /kontak-kami 854, /keranjang 178,
           /login 256 (3 input, 1 form), /register 320 (6 input), /checkout 256 (dialihkan ke /login),
           /admin/login 62 (2 input, 1 form) — 3 baris "teks pendek" hanya /admin/login, halaman nyata.
           Bukti: docs/bukti-smoke-beku-t_5f75f779.txt

15.7 Alur utama pembeli E2E — SEBAGIAN (cacat /login sudah diperbaiki; ekor QRIS belum diuji)
  Temuan awal: /login merender KOSONG (HTTP 200, 0 elemen, 0 teks, tanpa form) dengan galat konsol
          `Uncaught ReferenceError: route is not defined` — dikonfirmasi di 360/768/1280 px.
          /checkout mengalihkan pembeli ke /login, sehingga seluruh alur checkout berhenti di halaman kosong.
  Sebab : 4 halaman auth memakai helper `route()` milik Ziggy (tidak dipasang, PRD melarang Ziggy & @routes):
          Login.jsx:14 & :62, Register.jsx:17, ForgotPassword.jsx:12, ResetPassword.jsx:15.
          Hanya Login.jsx yang meledak saat render (route() di dalam <Link href>); tiga lainnya baru akan
          meledak saat form dikirim.
  Bukti : docs/bukti-smoke-auth-t_56a2d29c.txt (18 pengukuran; 6 di antaranya /login & /checkout)
  Tindak: kartu baru t_acd5fc8e (frontenddeveloper) dibuat untuk perbaikan ini.
  Belum diuji (jujur): tambah ke keranjang -> checkout -> QRIS Midtrans sandbox -> halaman sukses, karena
          tidak ada kredensial pembeli/admin yang tersedia bagi devops (.env pemilik tidak dibuka).
  Halaman auth lain sehat: /forgot-password (1 input), /register (6 input), /reset-password/{token} (4 input)
          tampil dengan form lengkap, 0 galat konsol.
  PEMBARUAN (kartu t_5a330224): perbaikan t_acd5fc8e sudah terverifikasi pada dua bundle berturut-turut
          (app-D-79Kh7D.js 15:30 dan app-D9VeOng4.js 15:37). Keduanya mengukur /login 3 viewport:
          95-256 karakter teks, 3 input, 1 form, 0 galat konsol (sebelumnya 0/0/0).
          /register 159-320 karakter + 6 input; /checkout sebagai tamu berakhir di /login yang kini merender.
          Yang MASIH belum diuji (tidak berubah): tambah ke keranjang -> checkout -> QRIS Midtrans sandbox ->
          halaman sukses, karena devops tidak memegang kredensial pembeli/admin.

15.8 Pengelolaan data admin — BELUM
  Yang terverifikasi: /admin/login menampilkan form nyata ("Masuk Panel Admin", 2 input, 1 form, 0 galat konsol)
          di 3 viewport. Gerbang auth untuk rute admin ber-parameter kini lulus (id ada -> 302 ke /admin/login);
          rincian di 15.3.
  Belum terverifikasi: login admin (tanpa kredensial), tambah/ubah produk, stok, pesanan, ulasan, FAQ, carousel,
          pengaturan situs, pesan kontak. Sebagian halaman admin juga masih dalam pengerjaan (kartu t_e5149746
          untuk Admin/Kategori + Admin/Akun), sehingga pengujian admin end-to-end belum bisa jadi bukti rilis.

15.9 php artisan test — LULUS (pembaruan kartu t_5a330224)
  Perintah: PHP_INI_SCAN_DIR=<scratch>/phpsqlite php artisan test   (sqlite :memory:; php.ini global & .env tidak disentuh)
  RUN 1 (14:24): 3 failed, 1 incomplete, 171 passed, exit 1
  RUN 2 (14:32, setelah rute admin bertambah): 2 failed, 1 incomplete, 187 passed, 1111 assertions, exit 1
  Kegagalan RUN 2 — Tests\Feature\Admin\AdminRouteAccessTest:
    - "tamu diarahkan ke login admin"          -> 4 rute membalas 404 (daftar di 15.3)
    - "pembeli tidak bisa menembus panel admin" -> kelas rute yang sama
  1 incomplete: pengujian yang butuh layanan luar (bukan kegagalan kode).
  RUN 3 (20 Okt 2026 15:19:55, kartu t_5a330224): 190 passed (1111 assertions), 0 failed, 0 skipped,
  0 incomplete, Duration 31,69 s, exit 0. AdminRouteAccessTest kini lulus.
  Bukti   : docs/bukti-phpunit-t_56a2d29c.txt (RUN 1 + RUN 2), docs/bukti-phpunit-t_5a330224.txt (RUN 3, 259 baris)
  RUN 4 (kartu t_5f75f779, 16:50, pada build beku): 190 passed (1111 assertions), 0 failed, 0 skipped,
  0 incomplete, Duration 41,26 s, exit 0 — sama dengan RUN 3, tidak ada regresi setelah 13 berkas resources/js
  diubah t_954abfe8. Perintah: PHP_INI_SCAN_DIR=<scratch>/phpsqlite php artisan test (sqlite :memory:).
  Bukti   : docs/bukti-build-beku-t_5f75f779.txt (§4) — keluaran ringkas suite pada build beku.
  RUN 5 (kartu t_e83922f2 D1, 21 Okt 2026 21:06, pada bundel beku D1): OK (225 tests, 1736 assertions),
  0 failed, 0 skipped, 0 incomplete, Duration 01:06.661, Memory 68.00 MB, exit 0 — sama dengan hasil QA1
  (docs/laporan-qa.md §15.2 butir 5), jadi tidak ada regresi setelah perbaikan F1–F6/B1–B2.
  Perintah: php -d extension=pdo_sqlite vendor/bin/phpunit (sqlite :memory:; php.ini global & .env tidak
  disentuh; cara ini melewati php.ini yang tidak memuat pdo_sqlite — lihat docs/catatan-devops.md bagian D1).
  Bukti   : docs/bukti-build-d1-t_e83922f2.txt ([8]).

15.10 Kebersihan kode — LULUS dengan 1 catatan
  - grep console.log / dd( / var_dump( / dump( / "Lorem ipsum" di resources/ -> 0 temuan.
  - Catatan (Low): folder `tmp/` (perkakas uji milik agent: cek-komponen-tanpa-import.py,
    cek-bundel-identifier-bebas.py) belum masuk .gitignore dan belum ter-track; putuskan simpan atau hapus.
  - Catatan (Low, kosmetik: SUDAH BERES pada verifikasi penutup) judul tab /produk kini "Produk — Toko Kulot"
    (terukur di smoke penutup 15:37:47); sebelumnya hanya "Toko Kulot". Halaman lain juga bersih:
    / = "Toko Kulot — Daster & Kulot Nyaman Harga Grosir — Toko Kulot", /produk/{slug} = "Setelan Kulot Linen
    Lengan Panjang — Toko Kulot", /kontak-kami = "Kontak Kami — Toko Kulot", /keranjang, /login, /register,
    /admin/login juga berjudul benar. Sisa kekurangan formulasi: judul beranda memuat "Toko Kulot" dua kali
    (dari <Head> halaman + pola `title` di app.jsx) — kosmetik, keputusan pemilik.
  - Catatan (keterbatasan pengukuran): pada berkas smoke pertama, judul tab /produk dan halaman 404 tampil
    berawalan emoji. HTML dari server tidak memuat emoji apa pun (curl: `<title inertia>Toko Kulot</title>`,
    404: `<title>Not Found</title>`) dan repo juga bersih dari emoji — jadi itu berasal dari sisi browser saat
    pengukuran, bukan dari kode aplikasi. Tidak ditindaklanjuti.

------------------------------------------------------------------------------
15.11 Verifikasi Midtrans mode nyata (GERBANG RILIS — dijalankan PEMILIK, devops TIDAK menjalankan) — BELUM DIUJI
  22 Okt 2026: pemilik memilih LANGSUNG PRODUKSI (tanpa bukti sandbox). Verifikasi konfigurasi
  produksi + checklist go-live ada di docs/midtrans-produksi.md. Gerbang bukti tetap sama: 1 transaksi
  QRIS nyata (kini produksi, nominal kecil) + notifikasi asli. .env.example bawaan kini MIDTRANS_FAKE=false.
  Kenapa jadi gerbang: seluruh bagian yang bisa diuji tanpa kredensial & tanpa jaringan sudah hijau (mode uji,
  pembuatan ulang tagihan fake, hitung mundur 5 menit, gerbang auth admin — docs/laporan-qa.md §15.2 dan
  docs/review.md §4 butir 4). Satu-satunya bukti yang tersisa adalah 1 pembayaran QRIS Midtrans (sandbox)
  yang benar-benar terbayar dan mengubah status pesanan lewat notifikasi asli. Itu butuh kunci milik pemilik
  dan URL webhook publik, jadi tidak boleh dijalankan devops/qatesting. Di localhost tanpa tunnel, notifikasi
  tidak mungkin masuk — untuk lingkungan itu status dibuktikan lewat aksi admin "Sinkronkan status pembayaran"
  (§12.24), sedangkan notifikasi asli tetap wajib dibuktikan sekali di server berdomain publik sebelum go-live.
  Prasyarat — pemilik mengisi sendiri di .env (devops tidak membuka .env):
      MIDTRANS_FAKE=false                  # mode nyata; .env.example bawaan false
      MIDTRANS_IS_PRODUCTION=false         # tahap bukti sandbox; true untuk produksi (lihat docs/midtrans-produksi.md)
      MIDTRANS_SERVER_KEY=SB-Mid-server-…  # kunci sandbox; produksi: kunci tanpa awalan SB-
      MIDTRANS_CLIENT_KEY=SB-Mid-client-…
      MIDTRANS_EXPIRY_MINUTES=5            # bawaan 5; nilai tidak sah otomatis jatuh ke 5
      APP_URL=http://127.0.0.1:8000        # atau https://<tunnel> bila memakai ngrok
  Setelah .env berubah WAJIB: php artisan config:clear   (config:cache baru dipakai bila .env sudah final).
  Langkah uji (1 transaksi, 1 QRIS):
    1. Cek penanda mode: buka /pesanan/{order}/bayar — label "Mode uji" HARUS tidak muncul lagi. Bila masih
       muncul, MIDTRANS_FAKE masih true atau config belum di-clear (ulangi langkah 0).
    2. Buat pesanan baru sebagai pembeli biasa: /produk/{slug} -> /keranjang -> /checkout -> halaman bayar.
       Tagihan fake lama (bila pesanan tadi dibuat saat mode uji) dibuat ulang otomatis pada baris `payments`
       yang sama; bila gagal, halaman harus menampilkan galat + tombol coba lagi (bukan halaman kosong).
    3. Perhatikan hitung mundur: mulai dari 05:00 dan QR tidak bisa dibayar setelah lewat (masa berlaku 5 menit).
    4. Bayar QR dengan simulator sandbox Midtrans (atau "Simulate Payment" di dashboard sandbox), lalu selesaikan.
    5. Notifikasi: arahkan Payment Notification URL di dashboard sandbox ke
       https://<domain-atau-tunnel>/midtrans/notification (HTTPS, POST). Di lokal harus ada tunnel publik
       (mis. ngrok http 8000); samakan APP_URL dengan URL tunnel supaya tautan di halaman bayar tetap benar.
       PENTING (localhost): tanpa tunnel, Midtrans TIDAK PERNAH memanggil http://127.0.0.1:8000 — status
       pembayaran tidak akan berubah sendiri. Untuk itu tersedia aksi admin "Sinkronkan status pembayaran"
       (PATCH /admin/pesanan/{order}/sinkron-pembayaran, kontrak §12.24): menarik status terakhir dari
       Midtrans dan menerapkannya lewat jalur yang sama dengan webhook. Inilah cara membuktikan butir (e)
       di localhost; tombol ini BUKAN pengganti webhook di produksi.
    6. Setelah notifikasi masuk (atau setelah aksi sinkron dijalankan): /pesanan/{order} dan
       /pesanan/{order}/bayar menampilkan lunas (payment_status = settlement) dan tombol "Cek Status" tidak
       lagi menawarkan bayar ulang; status pembayaran di panel admin ikut berubah.
    7. Simpan bukti ini ke docs/ (tanpa kunci rahasia): (a) tangkapan teks halaman bayar sebelum bayar
       (tanpa "Mode uji", hitung mundur 5 menit), (b) id pesanan + waktu QR discan, (c) isi notifikasi yang
       masuk (order_id, transaction_status, status_code), (d) status akhir pesanan di halaman pesanan + admin,
       (e) potongan log notifikasi yang kuncinya sudah dihapus.
  Bila gagal — rollback aman (tidak menyentuh data pemilik):
    - Kembalikan MIDTRANS_FAKE=true lalu php artisan config:clear: halaman bayar kembali ke mode uji (tagihan
      mode uji boleh dibuat ulang kapan saja; tidak ada uang nyata yang bergerak).
    - Jangan mengubah/menghapus baris `payments`/`orders` secara manual; laporkan ke devops/backend dengan
      pesan galat apa adanya (bersihkan dulu kunci rahasia dari potongan log).
    - Bila notifikasi tidak masuk: pastikan URL webhook terjangkau internet, HTTPS, metode POST, dan tanda
      tangan (order_id + status_code + gross_amount dengan MIDTRANS_SERVER_KEY) tidak ditolak.
  Setelah lulus: tandai butir ini LULUS di dokumen ini dan naikkan PUTUSAN ke GO penuh untuk lapisan pembayaran.

------------------------------------------------------------------------------
PENGHALANG RILIS (urut prioritas; diperbarui pada verifikasi penutup kartu t_5a330224)
------------------------------------------------------------------------------
Critical — sudah SELESAI, tidak lagi menghalang
  1. t_acd5fc8e — /login blank `route is not defined` -> SELESAI; smoke penutup 15:30 /login merender
     (95-256 karakter, 3 input) dan /checkout berakhir di halaman login yang sehat.
  2. t_ed8bd8e4 — 4 rute admin 404 untuk tamu -> SELESAI untuk id yang ada (302 ke /admin/login),
     AdminRouteAccessTest lulus, suite penuh hijau. Sisa 404 untuk id yang tidak ada = Low.
Still blocking rilis PRODUKSI (High) — diperbarui pada build beku t_fac8f5a3 (22 Okt 06:37; sebelumnya D1)
  3. SELESAI: penulis sudah berhenti. Saat pembekuan t_fac8f5a3 (22 Okt 06:37) tidak ada kartu penulis
     frontend yang berjalan (`find resources/js -mmin -120` kosong; dua kartu backend aktif t_3bfe3165 dan
     t_f39eba9d hanya menyentuh PHP). Build beku + manifest + pemeriksaan stale + sapuan resources/js
     dijalankan pada bundel yang tidak bergerak (lihat PUTUSAN dan 15.2). Catatan kejujuran: smoke browser
     (15.6) BELUM diulang pada bundel ini — angka 15.6 berasal dari bundel 20 Okt; untuk bundel ini baru
     pemeriksaan statis + GET rute = 200.
  4. Verifikasi admin end-to-end belum pernah dilakukan (tanpa kredensial) — termasuk unggah gambar produk.
     Halaman admin sudah lengkap dibangun (t_e5149746 selesai), tetapi belum ada bukti pemakaian nyata.
  5. QRIS Midtrans sandbox end-to-end belum pernah diuji (butuh MIDTRANS_FAKE=false + kunci sandbox di .env
     pemilik + URL webhook HTTPS). Langkah uji + rollback lengkap ada di 15.11. Di localhost webhook tidak
     bisa masuk: status dibuktikan lewat aksi admin "Sinkronkan status pembayaran" (§12.24), dan notifikasi
     asli tetap harus dibuktikan sekali di server berdomain publik.
Low
  6. Rute admin ber-parameter masih membalas 404 (bukan 302) bila id tidak ada — model binding sebelum
     middleware `admin` (15.3).
  7. Judul tab /produk (kosmetik), folder tmp/ belum di-ignore (15.10).

------------------------------------------------------------------------------
BELUM DIUJI SAMA SEKALI (jangan dianggap lulus)
------------------------------------------------------------------------------
- QRIS Midtrans sandbox end-to-end (GERBANG RILIS — langkah lengkap di 15.11): buat transaksi, tampilkan QR,
  webhook/notification, status pesanan berubah. Butuh MIDTRANS_FAKE=false + kunci sandbox di .env (milik
  pemilik) dan URL webhook yang bisa diakses Midtrans (HTTPS/tunnel). Notifikasi asli TIDAK bisa masuk ke
  localhost; di lokal status diverifikasi lewat aksi admin "Sinkronkan status pembayaran" (§12.24) — aksi itu
  sendiri belum pernah diklik manusia, karena itu 15.8/15.11 tetap BELUM.
- Notifikasi pesanan/email (mailer) dan reset kata sandi sungguhan.
- Unggah gambar produk & sajian gambar hasil seeder di server web nyata (di lokal sudah ada symlink storage).
- Performa (LCP < 2,5 s, Lighthouse >= 85) dan aksesibilitas (pembaca layar): tidak ada alat ukur di mesin ini.
- Uji di perangkat/HP nyata; hanya emulasi viewport di Chrome desktop.
- Deployment di server produksi (PHP-FPM/Nginx, queue, scheduler) — rencana ada di docs/deploy.md, belum dijalankan.

------------------------------------------------------------------------------
LANGKAH PEMILIK (ringkas; rinci di docs/langkah-pemilik.md)
------------------------------------------------------------------------------
1. Isi .env (DB_*, MIDTRANS_*, APP_URL) — devops tidak menyentuh berkas ini.
2. Pastikan database MySQL `toko-kulot` ada, utf8mb4 / utf8mb4_unicode_ci, lalu jalankan migrasi:
   - database KOSONG (server baru): `php artisan migrate --force --seed` (sekali saja);
   - database BERISI DATA (deploy/rilis): `php artisan migrate --force` — TANPA fresh/seed, setelah backup.
     Dua migrasi terakhir wajib ikut: 000018 products.compare_price dan 000019 orders.tracking_number.
     Cek `php artisan migrate:status` = 0 Pending. Tanpa ini: simpan produk gagal "Unknown column
     'compare_price'" dan pengisian resi pesanan gagal.
3. `npm run build` lalu jalankan server; buka http://127.0.0.1:8000 dan cek / , /produk, /produk/{slug}.
   Bundel yang sudah dibekukan: app-BCun0p-R.js + app-DpcrjTSz.css (manifest sha256 223b5514…, 22 Okt 06:37) —
   lihat docs/bukti-build-t_fac8f5a3.txt.
4. Periksa MODE PEMBAYARAN sebelum rilis (devops tidak membuka .env): MIDTRANS_FAKE=false; kredensial sandbox
   (`SB-Mid-…`) untuk uji / produksi untuk go-live; MIDTRANS_IS_PRODUCTION=false untuk sandbox, true hanya saat
   live. Jangan mencampur kunci sandbox dengan IS_PRODUCTION=true. Sesudah mengubah .env: `php artisan config:clear`.
   Bukti cepat: penanda "Mode uji" tidak muncul di /pesanan/{order}/bayar.
5. Untuk uji QRIS mode nyata (GERBANG RILIS, langkah rinci di 15.11): set MIDTRANS_FAKE=false + kunci sandbox
   Midtrans di .env, `php artisan config:clear`, sediakan URL webhook HTTPS (tunnel bila di lokal), lalu
   jalankan langkah 1–7 pada 15.11 (1 QRIS terbayar + notifikasi masuk + status pesanan berubah) dan simpan
   buktinya di docs/. Rollback bila gagal: MIDTRANS_FAKE=true + config:clear.
   Di localhost tanpa tunnel notifikasi tidak bisa masuk: status diverifikasi lewat tombol admin
   "Sinkronkan status pembayaran" di /admin/pesanan/{order} (kontrak §12.24), dan notifikasi asli tetap wajib
   dibuktikan sekali di server berdomain publik sebelum go-live.
6. Risiko §16 yang perlu keputusan pemilik: sembunyikan menu Stok di panel admin bila fitur stok belum lengkap;
   siapkan HTTPS sebelum webhook Midtrans dipakai; jangan pakai kunci produksi untuk pengujian.

------------------------------------------------------------------------------
INDEKS BUKTI (semua di docs/)
------------------------------------------------------------------------------
- bukti-migrate-seed.txt            output migrate:fresh --seed di DB uji (15.1)
- bukti-migrate-status.txt          21 Ran / 0 Pending (15.1)
- bukti-build-rilis.txt             output npm run build (15.2)
- bukti-rilis-t_56a2d29c.txt        ringkasan build + 3 penyapu statis (15.2)
- bukti-smoke-rilis-t_56a2d29c.txt  23 pengukuran /, /produk, /produk/{slug}, /keranjang, /tentang, /kontak, auth, /admin (15.6)
- bukti-smoke-auth-t_56a2d29c.txt   18 pengukuran 6 halaman auth — sumber temuan /login (15.7)
- bukti-phpunit-t_56a2d29c.txt      php artisan test RUN 1 + RUN 2 (15.9)
- bukti-frontend-t_7cbe34dc.txt     bukti kartu frontend (perbaikan QA-001 ProductCard)
- deploy.md                         rencana deployment (arsitektur, kebutuhan server, langkah, rollback)

Bukti verifikasi penutup (kartu t_5a330224, 20 Okt 2026):
- bukti-build-penutup-t_5a330224.txt      92 baris: npm run build penutup + keadaan public/build + 3 penyapu statis (15.2)
- bukti-sweep-bundel-1532-t_5a330224.txt   30 baris: 3 penyapu statis diulang pada bundel app-D9VeOng4.js, manifest 15:35:31 (15.2)
- bukti-akhir-t_5a330224.txt               pemeriksaan akhir 15:41:56: keadaan public/build, chunk aktif, jumlah baris semua bukti, ringkasan suite (putusan)
- bukti-smoke-penutup-t_5a330224.txt      27 pengukuran 9 rute x 3 viewport pada app-D9VeOng4.js (15:37:47) + pratinjau teks (15.6)
- bukti-smoke-penutup-1530-t_5a330224.txt arsip run sebelumnya pada app-D-79Kh7D.js (15:30:18) (15.6)
- bukti-phpunit-t_5a330224.txt            RUN 3 suite penuh: 190 passed / 1111 assertions / exit 0 (15.9)
- bukti-rute-admin-tamu-t_5a330224.txt    rute admin untuk tamu (id tidak ada) di server hidup (15.3)
- bukti-rute-admin-tamu-id-ada-t_5a330224.txt  rute admin ber-parameter dengan id yang ada (15.3)
- bukti-put-akun-tamu-t_5a330224.txt      PUT /admin/akun/1 sebagai tamu = redirect, bukan 405 (15.3)

Bukti BUILD BEKU (kartu t_5f75f779, 20 Okt 2026 16:46–16:52):
- bukti-build-beku-t_5f75f779.txt          keluaran npm run build 16:46:51 + angka build beku (manifest mtime/sha256,
                                           50 aset + manifest, chunk app-C4HDW06B.js) + 3 penyapu statis + suite
                                           (190 passed) + pemeriksaan bahwa build tidak bergerak sesudahnya (15.2/15.9)
- bukti-smoke-beku-t_5f75f779.txt          27 pengukuran 9 rute x 3 viewport pada app-C4HDW06B.js (16:49:24) (15.6)

Bukti BUILD BEKU D1 (kartu t_e83922f2, 21 Okt 2026 20:54–21:06):
- bukti-build-d1-t_e83922f2.txt            229 baris / 11 bagian: keadaan public/build sebelum & sesudah build,
                                           keluaran npm run build (vite v6.4.4, 729 modul, built in 43.88s, exit 0),
                                           sha256 manifest + chunk app-Dyl9odRh.js + css app-DBVmikiX.css,
                                           3 penyapu statis + putusan tiap temuan, 11/11 halaman wajib di manifest,
                                           bundel yang benar-benar dilayani server, suite RUN 5 (225 tests) (15.2/15.9)
- laporan-qa.md §15                        verifikasi QA1 atas 5 butir laporan pemilik 21 Okt (sumber angka 225 tests)

Bukti BUILD BEKU t_fac8f5a3 (kartu t_fac8f5a3, 22 Okt 2026 06:37–06:40):
- bukti-build-t_fac8f5a3.txt              229 baris / 7 bagian: keadaan public/build sebelum build (manifest 32.800 B,
                                           mtime 00:52:57, sha256 223b5514…), keluaran mentah npm run build
                                           (vite v6.4.4, 730 modul, "✓ built in 45.34s", exit 0), keadaan sesudah build
                                           (manifest mtime 06:37:13 + sha256 sama, 72 entri, 72 aset = 71 js + 1 css),
                                           sha256 chunk app-BCun0p-R.js + css app-DpcrjTSz.css, 0 sumber lebih baru,
                                           0 artefak stale, sapuan resources/js bersih, 11/11 halaman wajib di manifest,
                                           dan bundel yang benar-benar dilayani server dev (GET / = 200) (15.2)
- review-2.md                              hasil QA putaran 2 (237 tests / 1791 assertions, exit 0) — prasyarat pembekuan (15.9)

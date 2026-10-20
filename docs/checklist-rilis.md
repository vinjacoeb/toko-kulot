CHECKLIST RILIS — Toko Kulot
Kartu devops   : t_56a2d29c (verifikasi awal) + t_5a330224 (verifikasi penutup) + t_5f75f779 (build beku)
Disusun        : 2026-10-20 14:47 +07:00 (waktu sistem)
Diperbarui     : 2026-10-20 16:52 +07:00 — BUILD BEKU rilis dari kartu t_5f75f779 (build 16:46:51, 3 penyapu,
                 smoke 9 rute x 3 viewport 16:49:24, suite 190 passed). Putusan diperbarui, lihat PUTUSAN.
Repo           : C:/Users/LENOVO/Downloads/toko-kulot
Acuan          : docs/PRD.md §15 (Definition of Done Global) dan §16 (risiko rilis), docs/brief-devops.md
Sifat dokumen  : hasil verifikasi nyata + daftar yang belum diuji. Tidak ada klaim tanpa keluaran perintah.

PUTUSAN (build beku, kartu t_5f75f779, 20 Okt 2026 16:52): GO BERSYARAT untuk lapisan kode+build.
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
[ ] 15.1 migrate:fresh --seed bersih di DB kosong           -> LULUS (dibuktikan di DB uji terpisah)
[ ] 15.2 npm run build produksi sukses                      -> LULUS (BUILD BEKU 16:46:51: 50 aset + manifest, chunk app-C4HDW06B.js, manifest 18.817 B sha256 83cd3362…, 0 sumber lebih baru, 3 penyapu statis bersih — lihat 15.2)
[ ] 15.3 semua rute §5 terdaftar & berjalan                 -> LULUS dengan catatan (id ada -> 302 ke /admin/login; id tidak ada -> 404, lihat rincian)
[ ] 15.4 .env tidak ter-commit, .env.example lengkap        -> LULUS
[ ] 15.5 tidak ada folder skill/MCP di repo                 -> LULUS
[ ] 15.6 responsif 360/768/1280 tanpa geser horizontal      -> LULUS (27 pengukuran pada build beku app-C4HDW06B.js: 9 rute x 3 viewport, 0 geser horizontal, 0 galat konsol)
[ ] 15.7 alur utama pembeli E2E (katalog -> keranjang -> checkout -> QRIS) -> SEBAGIAN (cacat /login blank sudah diperbaiki; ekor QRIS belum diuji — tanpa kredensial)
[ ] 15.8 admin bisa masuk & mengelola data                  -> BELUM (butuh kredensial admin; gerbang auth sudah lulus)
[ ] 15.9 php artisan test hijau                             -> LULUS (190 passed, 1111 assertions, exit 0, 41,26 s — RUN 4 pada build beku kartu t_5f75f779)
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
PENGHALANG RILIS (urut prioritas; diperbarui pada verifikasi penutup kartu t_5a330224)
------------------------------------------------------------------------------
Critical — sudah SELESAI, tidak lagi menghalang
  1. t_acd5fc8e — /login blank `route is not defined` -> SELESAI; smoke penutup 15:30 /login merender
     (95-256 karakter, 3 input) dan /checkout berakhir di halaman login yang sehat.
  2. t_ed8bd8e4 — 4 rute admin 404 untuk tamu -> SELESAI untuk id yang ada (302 ke /admin/login),
     AdminRouteAccessTest lulus, suite penuh hijau. Sisa 404 untuk id yang tidak ada = Low.
Still blocking rilis PRODUKSI (High) — diperbarui pada build beku t_5f75f779
  3. SELESAI: penulis sudah berhenti. Papan 16:46:10 hanya memuat kartu devops t_5f75f779; t_954abfe8 selesai
     16:38, t_14cad9e2 selesai 16:36, t_944aea1e selesai 15:59. Build beku 16:46:51 + 3 penyapu + smoke
     9 rute x 3 viewport + suite sudah dijalankan pada bundel yang tidak bergerak (lihat PUTUSAN dan 15.2/15.6/15.9).
  4. Verifikasi admin end-to-end belum pernah dilakukan (tanpa kredensial) — termasuk unggah gambar produk.
     Halaman admin sudah lengkap dibangun (t_e5149746 selesai), tetapi belum ada bukti pemakaian nyata.
  5. QRIS Midtrans sandbox end-to-end belum pernah diuji (butuh kunci sandbox di .env pemilik + URL webhook).
Low
  6. Rute admin ber-parameter masih membalas 404 (bukan 302) bila id tidak ada — model binding sebelum
     middleware `admin` (15.3).
  7. Judul tab /produk (kosmetik), folder tmp/ belum di-ignore (15.10).

------------------------------------------------------------------------------
BELUM DIUJI SAMA SEKALI (jangan dianggap lulus)
------------------------------------------------------------------------------
- QRIS Midtrans sandbox end-to-end: buat transaksi, tampilkan QR, webhook/notification, status pesanan berubah.
  Butuh kunci sandbox di .env (milik pemilik) dan URL webhook yang bisa diakses Midtrans (HTTPS/tunnel).
- Notifikasi pesanan/email (mailer) dan reset kata sandi sungguhan.
- Unggah gambar produk & sajian gambar hasil seeder di server web nyata (di lokal sudah ada symlink storage).
- Performa (LCP < 2,5 s, Lighthouse >= 85) dan aksesibilitas (pembaca layar): tidak ada alat ukur di mesin ini.
- Uji di perangkat/HP nyata; hanya emulasi viewport di Chrome desktop.
- Deployment di server produksi (PHP-FPM/Nginx, queue, scheduler) — rencana ada di docs/deploy.md, belum dijalankan.

------------------------------------------------------------------------------
LANGKAH PEMILIK (ringkas; rinci di docs/langkah-pemilik.md)
------------------------------------------------------------------------------
1. Isi .env (DB_*, MIDTRANS_*, APP_URL) — devops tidak menyentuh berkas ini.
2. Pastikan database MySQL `toko-kulot` ada, utf8mb4 / utf8mb4_unicode_ci, lalu `php artisan migrate --seed`.
3. `npm run build` lalu jalankan server; buka http://127.0.0.1:8000 dan cek / , /produk, /produk/{slug}.
4. Untuk uji QRIS: isi kunci sandbox Midtrans + sediakan URL webhook HTTPS.
5. Risiko §16 yang perlu keputusan pemilik: sembunyikan menu Stok di panel admin bila fitur stok belum lengkap;
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

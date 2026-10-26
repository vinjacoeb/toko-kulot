# Catatan QA — temuan di luar lingkup v1.3

Kartu: `t_f5cacb6b` · Tanggal: 25 Okt 2026
Laporan utama: `docs/qa-v1.3.md`. Berkas ini hanya mencatat hal yang **tidak** termasuk
lingkup F9/F10 agar tidak hilang, tanpa mengubah requirement dan tanpa membuat kartu duplikat.

## 1. `/admin/laporan` tidak ada (404)

- Bukti: `routes/admin.php` tidak memuat kata `laporan` (grep exit 1); tidak ada
  `ReportController` di `app/Http/Controllers/Admin/` maupun halaman `Laporan` di
  `resources/js/Pages/Admin/`; `GET /admin/laporan` lewat tunnel → **404**.
- Konteks: route ini ada pada daftar route board, tetapi `docs/PRD.md`, `PRD-v1.1.md`,
  `PRD-v1.2.md`, dan `PRD-v1.3.md` tidak menyebut halaman laporan (grep "laporan" hanya
  menemukan baris QA di `docs/PRD.md:348`).
- Dampak: bila laporan memang bagian scope, fitur hilang; bila ditunda, dokumen route perlu dikoreksi.
- Rekomendasi: Tech Lead memastikan status fitur laporan. Bukan blocker v1.3.

## 2. Bentuk HTML Inertia 2: `#app` kosong adalah normal

- `GET /` mengembalikan `<div id="app"></div>` kosong dengan data di
  `<script data-page="app" type="application/json">{...}</script>`.
- Konsekuensi untuk QA HTTP: jangan mengukur panjang `#app` atau mencari `data-page` di atribut
  `<div>`; periksa isi `<script data-page="app">` (atau header `X-Inertia`).
- Catatan: hasil "#app 64.028 karakter" pada kartu devops berasal dari DOM setelah JS berjalan,
  bukan dari HTML mentah — keduanya tidak bertentangan.

## 3. Artefak pengukuran `curl` di shell Windows

- `curl -w '%{size_download}'` dengan `-o /dev/null` melaporkan `0` untuk respons berisi body.
- Cara yang dipakai di laporan: tulis ke berkas scratch lalu `wc -c` (atau `-w` dengan `-o` berkas).
- Bukan bug aplikasi.

## 4. Halaman debug terbuka di tunnel (lintas lingkungan)

- Sudah dicatat sebagai F-13-02 di `docs/qa-v1.3.md` (Mayor, environment).
- Ringkas: error 500 mengembalikan HTML debug berisi SQLSTATE, nama kolom, dan detail koneksi;
  PRD-v1.3 §2.1 meminta respons JSON. Perbaikan ada di konfigurasi pemilik (`APP_DEBUG=false`).

## 5. Dampak F-13-01 terukur pada data pemilik

- `orders` berisi 15 baris; 2 baris punya `biteship_order_id` (dibaca dengan `Schema::hasColumn`
  dan `DB::table('orders')->count()`, tanpa menampilkan id/kode).
- Keduanya akan menerima 500 pada webhook pertama sampai `php artisan migrate` dijalankan;
  bukan hanya kasus teoretis.

## 6. Build QA menggantikan hash bukti devops

- `npm run build` QA menghasilkan `public/build/manifest.json` 35.125 B
  (sha256 `6b8b49eb2740cae6…`) dan `app-C0fClxZc.js`; kartu devops mencatat manifest
  35.091 B `30c3b444…` / `app-CmuwYEyq.js`.
- Sebab: build ulang setelah perubahan frontend kartu F1/F2. Bukan regresi; bukti devops adalah
  snapshot sebelum perubahan itu. HTML tunnel saat diperiksa hanya memuat `app-C0fClxZc.js`.

## 7. Proses Vite dev masih bisa muncul kembali

- `public/hot` sudah tidak ada saat QA memeriksa, tetapi catatan devops menyebut proses
  `npm run dev` (PID 12.188) masih hidup dan belum bisa dimatikan dari sesi agen.
- Risiko: bila Vite menulis `public/hot` lagi, tunnel kembali memuat `[::1]:5173` (halaman kosong).
- Rekomendasi: pemilik menutup proses Vite sebelum memakai tunnel; jangan menjalankan
  `npm run dev` bersamaan dengan tunnel.

## 8. Berkas yang ditambahkan QA

- `docs/qa-v1.3.md` — hasil + bukti + rekomendasi.
- `docs/catatan-qa.md` — berkas ini.
- `docs/bukti-qa-v1.3-test.txt` — keluaran dua filter PHPUnit.
- `docs/bukti-qa-v1.3-suite.txt` — keluaran suite penuh.
- `docs/bukti-qa-v1.3-build.txt` — keluaran `npm run build`.
- Tidak ada perubahan pada kode aplikasi, `.env`, skema, atau riwayat Git.

## 9. v1.5 (kartu `t_31b212fb`) — cara QA menjalankan uji

- `php artisan test` tidak bisa dipakai dari shell non-tty milik agen (`stdin is not a tty`).
  Pengganti yang dipakai: `php vendor/phpunit/phpunit/phpunit < /dev/null` dengan
  `PHP_INI_SCAN_DIR` menunjuk folder scratch berisi `extension=pdo_sqlite.dll` dan
  `extension=php_sqlite3.dll` (keduanya tidak dimuat `php.ini` Laragon bawaan). `phpunit.xml`
  memakai sqlite `:memory:`, jadi DB MySQL pemilik tidak tersentuh. Perilaku uji identik;
  bila pemilik menjalankan `php artisan test` di terminalnya sendiri, hasilnya mengikat.
- Bukti v1.5: `docs/bukti-qa-v1.5-test.txt` (filter v1.5 + regresi: 83 test/852 assertion) dan
  `docs/bukti-qa-v1.5-suite.txt` (suite penuh 373 test/3172 assertion + `npm run build`
  `✓ built in 2.97s`). Hasil lengkap: `docs/qa-v1.5.md`.
- Probe HTTP baca-saja ke `http://127.0.0.1:8000` (server pemilik yang sudah hidup): `/` 200,
  `/kontak-kami` 200, `/history` 302 (guest), `GET /biteship/webhook` 200,
  `POST` body benar-benar kosong 200 `{"status":"ok","success":true}`.
  Body `{}` -> 403 `{"message":"invalid token"}` karena `BITESHIP_WEBHOOK_TOKEN` di `.env`
  pemilik sudah terpasang; itu perilaku benar, bukan regresi.
- Sesi cookie pembeli dari QA v1.3/v1.4 sudah kedaluwarsa (semua `/history` -> 302), jadi prop
  ber-login diverifikasi lewat feature test Inertia, bukan curl. Tidak ada kredensial di docs.
- Belum dicek dan tidak diklaim: tampilan 360/768 px, keyboard/fokus `Select`, pengumuman
  `aria-live`, back/forward filter, dan webhook Biteship nyata (butuh tunnel + dashboard
  Biteship milik pemilik).

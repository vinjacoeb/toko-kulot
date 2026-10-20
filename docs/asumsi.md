# Asumsi — Toko Kulot

Asumsi baru ditambahkan di akhir daftar. Asumsi di sini bukan keputusan pemilik;
bila pemilik memutuskan lain, perbarui bagian terkait.

## Dari kartu K2 (kerangka proyek, DevOps)

**A-01 — Kerangka memakai Laravel 12.70.0, bukan Laravel 11 seperti PRD §4.1.**
Alasan: skeleton terpasang (12.70.0) sudah menjadi dasar kode yang ada (model `Admin`,
middleware `EnsureAdmin`, halaman Inertia, `bootstrap/app.php`), dan memasang ulang
versi 11 berarti menimpa proyek yang sudah berjalan. Seluruh API yang dipakai PRD
(routing, session guard, Eloquent, Inertia adapter) sama di kedua versi.
Dampak: tidak ada perubahan perilaku yang diketahui. Bila pemilik wajib versi 11,
kerangka harus dipasang ulang sebelum pekerjaan fitur berlanjut.

**A-02 — React 19.3.1 dan @inertiajs/react 3.9.1, bukan React 18 seperti PRD §4.1.**
Alasan: `@inertiajs/react` 3.9.1 mensyaratkan React ^19; menurunkan ke 18 akan
melanggar peer dependency dan memaksa penurunan Inertia juga. Kode halaman memakai
API React yang sama pada kedua versi.

**A-03 — Nama database memakai tanda hubung: `toko-kulot`.**
Diambil dari nama proyek karena PRD tidak menetapkan nama database. Query manual wajib
memakai backtick. Collation `utf8mb4_unicode_ci`.

**A-04 — `DB_USERNAME=root` pada `.env.example` sebagai contoh, bukan keputusan.**
Pemilik yang mengisi pengguna dan kata sandi MySQL sebenarnya di `.env`.

**A-05 — Disk unggahan default `public` (`FILESYSTEM_DISK=public`).**
Mengikuti PRD A7: gambar disimpan di `storage/app/public` dan disajikan lewat
symlink `public/storage`. Symlink sudah dibuat saat setup.

**A-06 — Rute admin memakai prefix `/admin` dengan name prefix `admin.`.**
PRD menyebut panel admin di `/admin` tetapi tidak menetapkan nama rute. Kartu K6
tinggal mengisi `routes/admin.php`; pendaftaran grup sudah disiapkan di
`bootstrap/app.php`.

**A-07 — Zona waktu, locale, dan faker locale ditetapkan di `config/app.php`.**
Bukan lewat `.env`, agar konsisten di semua mesin. Nilai: `Asia/Jakarta`, `id`, `id_ID`.

**A-08 — `MIDTRANS_FAKE=true` pada `.env.example`.**
Mode QRIS dummy tanpa kredensial untuk pengembangan; pemilik mematikan ini
(`false`) saat memakai akun Midtrans sungguhan.

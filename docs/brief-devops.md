# Brief — devops

Kartu: **K2** (fondasi proyek), **K16** (rilis), dan kartu kebersihan repo (bila dibuat techlead).

## Wajib dibaca

- `docs/PRD.md` §4 (stack & struktur direktori), §8 (variabel Midtrans + mode fake), §11 (NFR), §12 (R2, R3, R4, R8, R9, R11), §15 (DoD global).
- `docs/design.md` §7 (aturan implementasi: token di `tailwind.config.js`, bukan hex di JSX).
- `docs/ringkasan-tim.md` §5 (aturan kerja).

## Kondisi awal (terverifikasi techlead, 20 Okt 2026)

Skeleton Laravel 11 + Inertia + React sudah ada: `composer.json` memuat `laravel/framework ^11.31`, `inertiajs/inertia-laravel ^3.5`, `midtrans/midtrans-php ^2.6`; `resources/js/app.jsx` dan middleware `HandleInertiaRequests`, `EnsureAdmin` sudah ada. **Belum ada:** `node_modules` (jadi `npm run build` belum bisa jalan), `MIDTRANS_*` di `.env.example`, `routes/admin.php`, migrasi domain. Riwayat git masih berisi proyek lama (Next.js) + folder agent yang sudah dihapus di working tree tapi belum di-commit.

## K2 — yang dikerjakan

1. Pastikan stack sesuai PRD §4.1 (Laravel 11, Inertia + React, Tailwind, MySQL `toko-kulot`, dua guard session) dan struktur direktori PRD §4.2 siap dibangun (folder `Controllers/Public`, `Controllers/Admin`, `Services`, `Pages`, `Layouts`, `Components` boleh kosong).
2. Lengkapi `.env.example` sesuai PRD §8 dan §4.1: `DB_*` (database `toko-kulot`), `APP_*`, `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION`, `MIDTRANS_MERCHANT_ID`, `MIDTRANS_FAKE`. Nilai rahasia tidak diisi; hanya nama variabel + contoh kosong.
3. Tulis `README.md`: cara pasang (`composer install`, `npm install`), cara isi `.env` (pemilik), `php artisan key:generate`, `php artisan migrate --seed`, `npm run build`.
4. Rapikan repo: pastikan folder agent/skill (`.agent/`, `.claude/`, `.cursor/`, dst.) tidak ada di project dan penghapusannya ter-commit (R4, DoD global §15 poin 5). Satu commit dengan prefix ID kartu (R8).

**Output:** `README.md`, `.env.example`, commit fondasi.
**DoD K2:** `php artisan route:list` jalan tanpa error; `npm run build` sukses; `.env` tidak dibuat/diubah/di-commit (R3); tidak ada folder skill/agent di root; tidak menyalakan server permanen (R11).

## K16 — yang dikerjakan

Build produksi (`npm run build` + `php artisan config:cache`/`route:cache` sesuai kebutuhan), verifikasi E2E alur utama PRD §15 poin 7 & 8, dokumentasi deploy (kebutuhan PHP/Node, permission `storage/`, symlink `public/storage` — PRD §14 A7), dan checklist rilis PRD §15 poin 1–10.

**DoD K16:** checklist rilis terisi dengan bukti per poin; dokumen deploy ada di `docs/deploy.md`.

## Boleh `kanban_block` hanya bila

Kredensial eksternal benar-benar tidak ada dan tidak bisa difake (mis. Midtrans produksi), atau pemilik harus memutuskan sesuatu yang mengubah fungsi (R10). Selain itu: catat asumsi di `docs/asumsi.md`, lanjut.

## Dilarang

Mengubah `.env` (R3), membuat `.env.*` apa pun, menjalankan server permanen (R11), mengubah dokumen acuan di `docs/PRD.md`/`design.md`, mengerjakan kartu peran lain (R1).

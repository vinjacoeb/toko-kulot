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

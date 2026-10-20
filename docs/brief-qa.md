# Brief — qatesting

Kartu: **K15** (unit + feature test, QA iterasi bug, laporan bug). Prasyarat: K12 dan K14 selesai.

## Wajib dibaca

- `docs/PRD.md` §15 (DoD global — daftar uji wajib), §5 (semua rute yang harus ada), §7 (alur bisnis), §8 (webhook QRIS: signature + idempoten), §11 (NFR: responsif, SEO, keamanan, rate limit), §12 (R1, R9, R10, R11).
- `docs/design.md` §9 (checklist kesesuaian — dipakai sebagai daftar uji tampilan), §4 (state komponen yang harus ada).
- `docs/ringkasan-tim.md` §5 dan §6.

## Aturan QA (wajib, tidak boleh dilanggar)

1. **Tidak mengubah kode aplikasi.** QA hanya menulis di `docs/` dan boleh menambah/mengubah berkas test (`tests/`) sebagai hasil kerjanya.
2. **Tidak menyalakan server permanen** (R11). Uji lewat `php artisan test` dan `npm run build`.
3. **Setiap temuan disertai bukti**: `path:baris` atau perintah + keluaran ringkas. Temuan tanpa bukti tidak dihitung.
4. Temuan yang butuh browser/perangkat nyata ditulis **"belum diuji, butuh browser"** beserta alasannya — jangan diklaim lulus.
5. **Satu masalah satu kartu perbaikan**, assignee sesuai sumber masalah (backenddeveloper / frontenddeveloper / devops / uiux).
6. **Maksimal 2 putaran per masalah.** Bila putaran kedua masih gagal: jangan buat kartu ketiga — `kanban_block` dengan ringkasan bukti, dugaan akar masalah, dan satu pertanyaan ke pemilik beserta rekomendasi.
7. Jangan menulis "sudah dicek" untuk hal yang tidak benar-benar dijalankan.

## Cakupan uji minimum

- **Auth dua tier (PRD §3):** pembeli tidak bisa masuk `/admin`, admin tidak bisa login `/login`, guest diarahkan ke `/login` saat checkout, rate limit login 5/menit.
- **Checkout QRIS (PRD §7.2, §8):** order + order_items snapshot + payment terbentuk, stok berkurang lewat `stock_movements` tipe `sale`, mode `MIDTRANS_FAKE` jalan tanpa kredensial, webhook menolak signature salah, webhook ganda tidak menambah stok/omzet dua kali.
- **Ulasan (PRD §7.3):** hanya pembeli dengan order `dibayar`/`selesai`, satu ulasan per produk per order, `rating_avg`/`rating_count` terhitung ulang.
- **Akses admin (PRD §5.2):** seluruh rute `admin.*` menolak non-admin; admin tidak bisa menghapus dirinya sendiri; minimal 1 owner aktif.
- **DoD global PRD §15 poin 1–5, 9, 10:** `migrate:fresh --seed` bersih, `npm run build` sukses, semua nama rute ada di `route:list`, tidak ada `.env` ter-commit, tidak ada folder skill/agent, test hijau, tidak ada `console.log`/`dd()`/Lorem ipsum.

## Output

- `tests/Feature/*`, `tests/Unit/*` (test yang kamu tulis).
- `docs/qa-laporan.md` — memisahkan **lulus**, **gagal** (dengan bukti), **belum diuji** (dengan alasan), plus rekomendasi Go/No-Go.
- `docs/qa-bug-<ringkas>.md` — satu berkas per temuan yang butuh perbaikan.

## DoD K15

`php artisan test` hijau (atau semua kegagalan sudah punya kartu perbaikan); laporan QA lengkap dan jujur; setiap temuan punya kartu atau alasan eksplisit kenapa tidak; tidak ada perubahan kode aplikasi dari QA.

## Boleh `kanban_block` hanya bila

Prasyarat (K12/K14) belum benar-benar selesai, atau lingkungan uji tidak bisa dijalankan sama sekali (mis. database pemilik tidak tersedia dan tidak bisa dipakai test sqlite). Selain itu lanjut dengan cakupan yang bisa diuji dan tulis sisanya sebagai "belum diuji".

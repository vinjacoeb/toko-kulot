# Brief QA — v1.3 (webhook Biteship & tunnel)

Baca `docs/PRD-v1.3.md` §2–§4, `docs/brief-v1.3-backend.md`, `docs/brief-v1.3-frontend.md`,
`docs/design-v1.3.md`, dan kontrak props bagian §7.9/§12.16–§12.18/§13.

## Aturan QA (wajib, dari aturan board)

- Tidak mengubah kode. Hanya menulis di `docs/qa-v1.3.md` dan `docs/catatan-qa.md`.
- Tidak menyalakan server; boleh `php artisan test`, `npm run build`, `curl` baca-saja.
- Setiap temuan wajib bukti `path:baris` + perintah + keluaran ringkas.
- Yang butuh browser/server hidup: tulis "belum diuji, butuh browser" — jangan diklaim lulus.
- Satu masalah = satu kartu perbaikan; maksimal 2 putaran per masalah, lalu eskalasi.
- Jangan menulis token/kredensial; jangan menyentuh `.env`.

## Cakupan eksekusi

1. **Statis**: route publik tanpa CSRF, token dicek, tiga event dipetakan, status hanya maju,
   idempoten, `payments`/stok/`total` tidak disentuh, props admin vs pembeli terpisah, dua kolom
   migrasi ada di `docs/db.md` dan migrasi.
2. **Test otomatis**: `php artisan test --filter=BiteshipWebhook`, test props, lalu suite penuh;
   bila PHP CLI belum memuat `pdo_sqlite` (lihat `docs/langkah-pemilik.md`), pakai
   `php -d extension=pdo_sqlite -d extension=sqlite3 vendor/bin/phpunit` dengan filter yang sama.
   `npm run build`. Catat jumlah lulus/gagal apa adanya.
3. **HTTP ke tunnel**: POST `/biteship/webhook` dengan `order_id` acak (tanpa efek tulis) → 200;
   token salah (set env token sementara via config? tidak boleh) → cukup uji di test fitur;
   GET halaman toko via tunnel → HTML memakai `/build/assets/...`, tanpa `[::1]:5173`.
4. **Browser**: panel admin, riwayat, halaman selesai → "belum diuji, butuh browser".
5. **Webhook asli dari dashboard Biteship**: pemilik yang mendaftarkan URL → "belum diuji,
   butuh pemilik"; catat sebagai risiko rilis, bukan bug.

## Definition of Done

`docs/qa-v1.3.md` berisi: apa yang diuji, hasil (lulus/gagal/belum), bukti, daftar temuan
dengan tingkat (blocker/mayor/minor), dan rekomendasi. Temuan yang bukan bug (mis. kebutuhan
browser) dipisahkan.

Block hanya bila tidak ada akses untuk menjalankan test sama sekali; sebutkan perintah yang
gagal dan pesannya.

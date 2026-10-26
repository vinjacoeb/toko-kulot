# Brief QA — v1.4

Baca: `docs/PRD-v1.4.md`, `docs/design-v1.4.md`, `docs/brief-v1.4-backend.md`,
`docs/brief-v1.4-frontend.md`, `docs/review-v1.3.md`, `docs/PRD-v1.3.md` §3.

## Aturan QA (wajib)

- Tidak mengubah kode aplikasi; hanya menulis di `docs/` (`docs/qa-v1.4.md`).
- Tidak menyalakan server, tidak menjalankan migrate/seed di DB pemilik. Boleh
  `php artisan test` (sqlite/memory) dan `npm run build`.
- Setiap temuan: apa yang salah, bukti `path:baris`, hasil aktual vs diharapkan, dugaan penyebab
  (tandai "dugaan"). Satu masalah = satu kartu perbaikan; maksimal 2 putaran per masalah.
- Yang butuh browser/API nyata: tulis "belum diuji, butuh browser" atau "belum diuji, butuh key
  Biteship". Jangan menulis "lulus" untuk yang belum dijalankan.

## Yang diverifikasi

1. F12: rute ubah status hilang (405/404), UI admin tidak punya tombol/modal, webhook tetap
   memajukan status. Test suite hijau.
2. F11: berat produk 250 g → API tarif 250 (bukan 500); berat create order =
   `orders.shipping_weight_gram`; body tarif tanpa `destination_city`; log tarif ada; tidak ada
   perubahan uang setelah `order.price`. Perbandingan tarif nyata: belum diuji, butuh key.
3. F13: append event idempoten, dedupe, cap 50; `shipping.events` dan `timeline.completed_at`
   benar; auto-selesai; tampilan riwayat & halaman selesai (browser: belum diuji).
4. Regresi v1.3: webhook 401/404, idempoten, resi manual, pembayaran Midtrans, status filter.

## Output

`docs/qa-v1.4.md`: lingkungan uji, per fitur lulus/gagal/belum dicek + alasan, daftar kartu temuan,
sisa bug, rekomendasi. Sertakan nama test/perintah yang benar-benar dijalankan.

## Kapan boleh block

Hanya bila DB uji tidak bisa dibuat dan tidak ada cara lain menjalankan test. Jangan block karena
tidak punya browser/key; tandai belum diuji.

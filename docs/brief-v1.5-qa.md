# Brief QA — v1.5

Baca: `docs/ringkasan-v1.5.md`, `docs/design-v1.5.md`, `docs/brief-v1.5-backend.md`,
`docs/brief-v1.5-frontend.md`, `docs/kontrak-props.md` §7.9, §7.12, §13, `docs/PRD-v1.3.md` §2.

## Aturan QA (wajib)

- Tidak mengubah kode aplikasi; hanya menulis di `docs/` (`docs/qa-v1.5.md`).
- Tidak menyalakan server, tidak migrate/seed DB pemilik. Boleh `php artisan test` dan
  `npm run build`.
- Setiap temuan: apa yang salah, bukti `path:baris`, aktual vs diharapkan, dugaan penyebab
  (tandai "dugaan"). Satu masalah = satu kartu perbaikan; maksimal 2 putaran per masalah.
- Yang butuh browser/Biteship nyata: tulis "belum diuji, butuh browser" atau
  "belum diuji, butuh webhook Biteship". Jangan menulis "lulus" untuk yang belum dijalankan.

## Yang diverifikasi

1. **B1**: `services()` menerima bentuk string lama dan array; dedupe beda huruf; hanya layanan
   aktif di `opsi`; urutan `courier_name`/`service_name`; log layanan tanpa tarif; regresi
   `quote()` dan checkout mode fake.
2. **B2**: token di header kustom lolos; `?token=` lolos; token salah 403; `BITESHIP_WEBHOOK_TOKEN`
   kosong menerima; log tidak memuat nilai token; probe body kosong tetap 200.
3. **B3**: `?status=` memfilter, nilai asing diabaikan, paginasi mempertahankan filter,
   `ringkasan` global, payload `checkout.success` memuat `timeline` 4 kunci.
4. **F1**: checkout memakai `Select` + `optgroup`, tidak ada radio ongkir; pilihan mengirim tiga
   field; state kosong/galat utuh; `npm run build` lulus.
5. **F2**: timeline berikon di riwayat dan halaman selesai; filter mengubah daftar dan URL;
   halaman kosong per filter; `timeline` null tidak crash; build lulus.
6. **Regresi v1.4**: webhook 403/422/200, idempoten, `shipping.events`, timeline `completed_at`,
   rute ubah status manual tetap 404.

## Output

`docs/qa-v1.5.md`: lingkungan uji, per fitur lulus/gagal/belum dicek + alasan, daftar kartu
temuan, sisa bug, rekomendasi. Sertakan nama test/perintah yang benar-benar dijalankan.

## Kapan boleh block

Hanya bila DB uji tidak bisa dibuat dan tidak ada cara lain menjalankan test. Tanpa browser,
token, atau tunnel: tandai belum diuji, jangan block.

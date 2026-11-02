# Brief QA — v1.9

Baca `docs/review-v1.9.md`, `docs/brief-v1.9-backend.md`,
`docs/brief-v1.9-frontend.md`, dan `docs/kontrak-props.md` §10.9.

## Yang diuji

Tab Landing `/admin/pengaturan?tab=landing`, setelah perbaikan backend dan
frontend selesai:

1. Ubah judul hero lalu Simpan → sukses, nilai bertahan setelah reload.
2. Ganti gambar hero dengan JPG/PNG/WEBP ≤ 2 MB → sukses, preview berubah.
3. Ubah teks pengumuman, keunggulan, produk unggulan, promo, kenapa kami,
   newsletter, dan galeri → Simpan sukses, semua nilai bertahan.
4. Hapus gambar promo tanpa mengunggah pengganti → Simpan sukses.
5. Kirim path asing (bukan diawali `/`) ke field gambar → 422 dengan pesan
   yang terbaca.

## Aturan

- Jangan ubah kode aplikasi; hanya menulis di `docs/`.
- Jangan menyalakan server sendiri. Bila butuh browser/login admin, tulis
  "belum diuji, butuh browser" beserta alasannya.
- Setiap temuan: bukti `path:baris`, hasil aktual vs harapan, satu temuan satu
  kartu perbaikan, maksimal 2 putaran per masalah.

## Output

`docs/qa-v1.9.md`: langkah, hasil, bukti, sisa masalah.

# Brief Frontend v1.7 (`frontenddeveloper`)

Baca: `docs/ringkasan-v1.7.md`, `docs/design-v1.7.md` (mengikat), `docs/design-v1.6.md` §1.4 (copy
beku notice), `docs/kontrak-props.md` §7.12. Kerjakan **satu kartu per masalah**.

## Kartu A — ceklis ekspedisi hanya layanan tersedia (`Public/Checkout.jsx`)

- Ganti sumber daftar: selama `statusTarif === 'siap'` render `opsi` (bukan `semua`); di luar itu
  daftar kosong dan notice keadaan lama yang tampil. Jangan mengubah kontrak `semua`/`opsi`.
- Hapus pemakaian `semua` untuk render; cache cek ongkir tetap boleh memakai `semua`.
- Tidak ada baris disabled, tidak ada teks alasan di daftar. Copy notice beku tidak diubah.
- Jangan menyentuh `BiteshipService`, `CheckoutController`, atau `ongkir` di server.
- DoD: `npm run build` sukses; `grep -n "semua" resources/js/Pages/Public/Checkout.jsx` menunjukkan
  `semua` tidak lagi dipakai untuk merender daftar; uji mobile oleh pemilik ditandai
  "belum diuji, butuh browser" di laporan.

## Kartu B — filter periode langsung diterapkan (`Admin/Laporan.jsx`)

- `Select` periode: `onChange` langsung `router.get('/admin/laporan', …)` memakai opsi baru; untuk
  `kustom` jangan memanggil (tunggu tombol Terapkan). Terapkan tetap ada untuk `kustom`.
- Sinkronkan `periode/dari/sampai` dari `filter` props setelah respons (`useEffect`), supaya nilai
  hasil normalisasi server yang tampil.
- Pertahankan `preserveScroll`, `preserveState`, `replace`, status `memuat`, dan parameter unduh
  yang sudah ada. Jangan mengubah backend, rute, atau `ReportService`.
- DoD: `npm run build` sukses; tidak ada `router.get` kedua di tempat lain; uji klik oleh pemilik
  ditandai "belum diuji, butuh browser".

## Batas

Hanya dua berkas di atas. Jangan mengubah `docs/design*`, `routes/`, `app/`, atau berkas dependensi.
Laporan kerja: `docs/catatan-frontend-v1.7-<id-kartu>.md` (maks 1 halaman) berisi berkas yang
diubah, hasil `npm run build`, dan yang belum diuji. Blokir hanya bila instruksi di atas
bertentangan dengan kode nyata dan tidak bisa diputuskan dari dokumen.

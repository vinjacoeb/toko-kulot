# Brief QA v1.7 (`qatesting`)

Baca: `docs/ringkasan-v1.7.md`, `docs/design-v1.7.md`, brief backend/frontend v1.7, dan catatan
worker di `docs/catatan-*-v1.7-*.md`. Verifikasi tiga perbaikan; **jangan mengubah kode**.

## Yang diperiksa

1. `Public/Checkout.jsx`: daftar layanan dirender dari `opsi` saat `statusTarif === 'siap'`;
   `semua` tidak lagi dipakai merender; notice `kosong`/`galat`/`timeout` tetap ada; tidak ada
   baris disabled. Bukti: nomor baris di berkas sumber.
2. `Admin/Laporan.jsx`: perubahan `Select` periode memicu satu `router.get`; `kustom` menunggu
   Terapkan; props `filter` disinkronkan ke state; parameter unduh tidak berubah.
3. `app/Exports/`: header berwarna, freeze/autofilter (Pesanan, Detail Item, Stok), zebra, format
   rupiah dihitung dari baris nyata, tidak ada `B12:B16`/`C12:C16`, judul Ringkasan merge.
   Bukti: nomor baris.
4. Regresi cepat: `npm run build` sukses; `git diff --stat` hanya menyentuh berkas yang
   dijanjikan (2 JSX + `app/Exports/`); `php -l` bersih.

## Aturan

- Tanpa kode: hanya menulis di `docs/`. Tanpa server, migrasi, atau perintah yang mengubah DB.
- Setiap temuan: apa yang salah, bukti `path:baris`, dampak, dan langkah reproduksi.
- Butuh browser/Excel: tulis "belum diuji, butuh browser" — jangan mengarang hasil.
- Satu temuan satu kartu perbaikan (assignee tepat), maksimal 2 putaran per masalah.
- Laporan: `docs/qa-v1.7.md` + bukti perintah mentah di `docs/bukti-qa-v1.7-<id-kartu>.txt`.

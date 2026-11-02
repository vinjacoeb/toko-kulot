# Ringkasan Tim — Revisi v1.7 (2 Nov 2026)

Kartu `t_f3049422` (techlead). Tiga permintaan pemilik, semuanya perbaikan kecil di atas v1.6.
Dokumen acuan: `docs/PRD-v1.4.md`, `docs/design.md`, `docs/design-v1.6.md`, `docs/kontrak-props.md`
§7.12/§14, dan addendum **`docs/design-v1.7.md`** (menang atas v1.6 untuk dua hal yang ia sebut).

## 1. Ceklis ekspedisi checkout — hanya layanan tersedia

Masalah: `semua[]` sengaja memuat layanan tanpa tarif (v1.6 §1.3) sehingga di mobile daftar jadi
sangat panjang. Keputusan pemilik: **hapus ekspedisi yang tidak tersedia** dari tampilan.
Perubahan **frontend saja**: daftar dirender dari `opsi[]` saat `statusTarif === 'siap'`.
Kontrak server tidak berubah; `semua[]` tetap ada untuk cache dan alasan, tetapi tidak dirender.

## 2. Filter periode `/admin/laporan`

Klaim pemilik: filter selalu menampilkan hari ini. **Server sudah benar** — probe techlead
`docs/bukti-techlead-v1.7-t_f3049422.txt` memanggil `ReportController::index` untuk `hari-ini`,
`7-hari`, `bulan-ini`, dan default: `filter.dari/sampai` berbeda sesuai periode. Omzet keempatnya
sama karena **satu-satunya pesanan berstatus omzet di DB ber-tanggal hari ini**, jadi angkanya
memang tidak berubah. Dua perbaikan yang diambil:
- pilihan periode **langsung diterapkan** saat dropdown berubah (tidak perlu klik Terapkan);
- state filter disinkronkan dari props server setelah respons (periode tak sah dinormalkan server).

## 3. Desain file Excel laporan

Workbook sekarang tanpa gaya apa pun (hanya number format). Perbaikan di `app/Exports/`:
header tebal putih di atas `#1F2A5E`, baris header dibekukan, autofilter, garis tipis `#E5E7EB`,
zebra `#F6F6F4`, angka rupiah rata kanan, judul Ringkasan di-merge, dan number format hanya pada
baris yang benar-benar terpakai (bukan `B12:B16` hardcoded).

## Urutan kerja

1. Backend Excel (paralel).
2. Frontend checkout + frontend Laporan (paralel, berkas berbeda).
3. QA verifikasi ketiganya (parent: ketiga kartu).
4. Pemilik menguji di browser/Excel; keputusan rilis di pemilik.

## Titik berhenti pemilik

- Buka `/checkout` di mobile dengan kode pos yang tarifnya sudah dimuat: hanya layanan tersedia
  yang tampil; layanan tanpa tarif tidak ada.
- Buka `/admin/laporan`, ganti dropdown periode: URL, rentang tanggal di header, dan angka berubah
  tanpa klik Terapkan. Bila data lama belum ada, angka boleh sama — yang berubah adalah rentang.
- Unduh Excel: periksa tampilan header, freeze, filter, dan format rupiah.

## Aturan kerja yang tetap berlaku

- Worker hanya menulis di `docs/` untuk laporan; kode hanya lewat kartu masing-masing.
- Jangan membaca/menulis `.env`; jangan menjalankan server, migrasi, atau perintah yang mengubah DB.
- Tes PHP tidak bisa dijalankan di mesin ini (`pdo_sqlite` tidak ada); bukti = `php -l`, `npm run
  build`, dan pemeriksaan statis. Butuh browser/Excel: tulis "belum diuji, butuh browser".
- Satu masalah satu kartu; maksimal 2 putaran perbaikan per masalah.

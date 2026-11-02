# Brief Backend v1.7 (`backenddeveloper`) — desain Excel Laporan

Baca: `docs/ringkasan-v1.7.md` §3, `app/Exports/{LaporanExport,RingkasanSheet,PesananSheet,
DetailItemSheet,StokSheet}.php`, `app/Services/ReportService.php` (hanya untuk memahami kolom).
Tidak ada perubahan query, controller, rute, atau kontrak props.

## Hasil yang diminta

1. Header tabel: latar `#1F2A5E`, teks putih tebal, tinggi baris ±22, rata kiri (angka rata kanan),
   border bawah tipis `#E5E7EB`.
2. Baris header dibekukan (`freezePane` tepat di bawahnya) dan `autoFilter` dipasang pada tabel
   Pesanan, Detail Item, dan Stok. Sheet Ringkasan tidak perlu autofilter.
3. Zebra `#F6F6F4` pada baris data genap; border tipis `#E5E7EB` antar baris.
4. Angka uang `"Rp" #,##0` rata kanan dan `#,##0` untuk qty — **hanya pada baris yang terpakai**,
   dihitung dari jumlah baris data, bukan rentang mati. `RingkasanSheet` sekarang memakai
   `B12:B16`/`C12:C16`; ganti dengan hitungan nyata supaya produk terlaris lebih dari 5 tetap
   berformat benar.
5. Ringkasan: judul `A1` di-merge `A1:C1`, tebal, ukuran 14; baris "Periode" tetap; header
   "Ringkasan/Nilai" dan "Produk terlaris/Qty/Omzet" memakai gaya header pada butir 1.
6. Lebar kolom yang sudah ada dipertahankan; boleh menyesuaikan bila terpotong.

## Batas

- Boleh menambah satu kelas bantu di `app/Exports/` (mis. `SheetStyle.php`) daripada menyalin gaya
  empat kali. Jangan menambah dependency baru; PhpSpreadsheet/Maatwebsite sudah terpasang.
- Jangan mengubah isi/urutan kolom, nama sheet, atau perhitungan `ReportService`.
- Gaya harus aman untuk sheet kosong (hanya header) — jangan memanggil `getStyle` pada rentang
  baris 0.

## Definition of Done

- `php -l` bersih untuk setiap berkas yang diubah.
- `LaporanExport` tetap menghasilkan 4 sheet dengan nama sama; `ReportService` tidak berubah.
- Tidak ada rentang baris hardcoded yang tersisa di `app/Exports/`.
- Buka file hasil unduhan di Excel: "belum diuji, butuh Excel" (tulis di laporan), karena worker
  tidak boleh menjalankan server/DB.
- Laporan: `docs/catatan-backend-v1.7-<id-kartu>.md` (berkas diubah, perintah yang dijalankan,
  yang belum diuji). Blokir hanya bila API PhpSpreadsheet yang dipakai tidak tersedia.

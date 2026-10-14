# Pertanyaan & Asumsi Pemilik

| # | Asumsi | Keterangan |
|---|---|---|
| 1 | ORM memakai Prisma | Alternatif: Drizzle/Knex |
| 2 | Auth memakai NextAuth/Auth.js dengan kredensial | Cookie sesi httpOnly |
| 3 | Ongkos kirim tahap 1: tarif flat/manual | Integrasi kurir tahap berikutnya |
| 4 | Aturan grosir: harga grosir berlaku mulai kuantitas minimum per produk | Nilai default diatur di admin |
| 5 | Stok dikurangi saat pesanan dibuat, dikembalikan bila kedaluwarsa/batal | QRIS punya batas waktu |
| 6 | Checkout boleh tanpa login (tamu); user login melihat riwayat | Penilaian dikaitkan ke kode pesanan |
| 7 | Satu penilaian per pesanan (per produk bila memungkinkan) | Dapat diubah |
| 8 | Aset desain dari erigostore dipakai sementara | Ganti aset sendiri sebelum rilis |
| 9 | Midtrans mode sandbox di tahap 1 | Kunci produksi menyusul |
| 10 | Satu bahasa (Indonesia), satu mata uang (IDR) | — |
| 11 | Nama DB persis `toko-kulot` (tanda hubung; dikutip dengan backtick di SQL) | — |
| 12 | Path workspace di contoh kartu (`prj/toko-daster`) diabaikan; dipakai `Downloads/toko-kulot` | — |

## Pertanyaan Ambigu
- (Belum ada tambahan)

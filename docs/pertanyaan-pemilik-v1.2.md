# Pertanyaan & tindakan pemilik — v1.2

Diisi Tech Lead 24 Okt 2026 dari kartu `t_10766b7f`. Tidak memblokir pengembangan:
semua jawaban sementara sudah ditetapkan sebagai [ASUMSI] di `docs/PRD-v1.2.md` §11.

## Perlu tindakan pemilik (bukan pertanyaan)

| # | Tindakan | Diperlukan untuk | Dampak bila belum |
|---|---|---|---|
| P1 | Aktifkan kanal di Midtrans MAP: BCA VA, BNI VA, BRI VA, Permata VA, Mandiri Bill, Alfamart, Indomaret (QRIS sudah) | F1 | Charge kanal tsb ditolak Midtrans; halaman bayar menampilkan "kanal belum aktif" |
| P2 | Ganti *Payment Finished Redirect URL* Midtrans ke `{APP_URL}/midtrans/selesai` | F3 | Redirect Midtrans masih ke domain contoh; status tetap benar lewat polling |
| P3 | Isi kartu asal pengiriman di `/admin/ekspedisi` + `contact_email` pengaturan | F7 | Tombol "Buat resi otomatis" menolak dengan pesan field yang kurang |
| P4 | Pastikan `MIDTRANS_SERVER_KEY`, `BITESHIP_API_KEY` ada di `.env` | F1, F7 | Mode uji tetap jalan; mode asli tidak bisa menghubungi penyedia |
| P5 | Isi saldo Biteship (error `No sufficient balance to call rates API` sudah muncul di kartu `t_1b711d26`) | F7 + ongkir asli | Create order/rates ditolak Biteship; pesan galat tampil, resi tidak dibuat |

## Pertanyaan (jawab kapan saja, ada asumsi berjalan)

| # | Pertanyaan | Asumsi berjalan |
|---|---|---|
| Q1 | Kanal mana yang benar-benar dipakai toko? (8 kanal di §2.2 bisa dikurangi) | Semua 8 kanal fase 1 |
| Q2 | Masa berlaku VA/gerai 60 menit cukup? | Ya; QRIS tetap 5 menit |
| Q3 | Perlu GoPay/ShopeePay (deeplink) juga? | Tidak, ditunda; QRIS sudah mencakup e-wallet |
| Q4 | "Tipografi jelek" — halaman publik saja atau admin juga? | Halaman publik |
| Q5 | Berat produk per item sudah benar di data produk? | Ya; fallback 300 g bila kosong |

# Pertanyaan & tindakan pemilik — v1.3

Diisi Tech Lead 24 Okt 2026 dari kartu `t_c04dd4c7`. Tidak memblokir pengembangan: semua
jawaban sementara ada sebagai [ASUMSI] di `docs/PRD-v1.3.md` §5 dan `docs/asumsi.md`.

## Perlu tindakan pemilik

| # | Tindakan | Diperlukan untuk | Dampak bila belum |
|---|---|---|---|
| P1 | Isi `BITESHIP_WEBHOOK_TOKEN` di `.env` (teks acak, jangan ditempel di chat/kartu) | F9 | Bila kosong, endpoint menerima semua payload (nyaman untuk uji lokal, tidak aman untuk publik) |
| P2 | `php artisan migrate` untuk dua kolom baru | F9 | Webhook gagal menyimpan `shipping_updated_at`/payload; data tampil kosong |
| P3 | Daftarkan URL `https://<tunnel>/biteship/webhook?token=<token>` + event `order.status`, `order.price`, `order.waybill_id` di dashboard Biteship | F9 uji nyata | Webhook tidak pernah datang; semua status tetap manual |
| P4 | Jaga tunnel hidup dan bagikan URL terbaru (ngrok gratis berubah tiap restart) | F10, F9 | Halaman toko tidak bisa dibuka dari luar; URL webhook basi |
| P5 | Pastikan `BITESHIP_API_KEY` ber-saldo dan minimal satu resi pernah dibuat | F9 uji nyata | Tidak ada `biteship_order_id` untuk dicocokkan webhook |

## Pertanyaan (jawab kapan saja)

| # | Pertanyaan | Asumsi berjalan |
|---|---|---|
| Q1 | Bila ongkir aktual Biteship (`order.price`) berbeda dari ongkir yang ditagih, mau ditagih/refund otomatis? | Tidak; hanya informasi + peringatan untuk admin |
| Q2 | Paket retur/gagal: siapa yang membatalkan pesanan dan mengembalikan stok? | Admin lewat tombol status yang sudah ada; webhook hanya menandai `perlu_tindakan` |
| Q3 | Boleh webhook membatalkan pesanan otomatis bila kurir melaporkan `cancelled`? | Tidak, sampai pemilik memutuskan aturan uang/stok |
| Q4 | Perlu riwayat semua event webhook (bukan hanya terakhir)? | Tidak untuk fase ini; kolom payload terakhir cukup |
| Q5 | Token webhook perlu diganti berkala? | Ya bila bocor: ganti env + URL di dashboard Biteship |
| Q6 | Domain tetap untuk produksi (bukan ngrok gratis)? | Ya, disarankan; belum diputuskan penyedianya |

## Batas yang tidak diambil techlead

- Tidak mengubah `.env`, tidak menjalankan migrasi, tidak mendaftarkan webhook memakai akun
  Biteship pemilik.
- Keputusan uang (selisih ongkir, refund) dan pembatalan pesanan tetap di pemilik.

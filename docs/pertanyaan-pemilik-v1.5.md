# Pertanyaan & asumsi pemilik — v1.5

Tidak memblokir pekerjaan. Semua dijawab dengan asumsi terdekat; jawaban pemilik mengubah kartu
lanjutan bila perlu.

## Perlu jawaban pemilik (tidak memblokir kode)

| # | Hal | Asumsi yang dipakai | Rekomendasi |
|---|---|---|---|
| P1 | Nama *Custom Header* webhook di dashboard Biteship | Nilai header harus sama persis dengan `BITESHIP_WEBHOOK_TOKEN`; nama header bebas. Kode v1.5 menerima nilai token di header mana pun. | Isi ulang header di dashboard, lalu ubah status satu pesanan uji; log harus berhenti menulis 403 |
| P2 | Arti contoh "anteraja: anteraja a, anteraja b, anteraja req" | Itu contoh layanan nyata dari katalog Biteship; nama tampilan bisa diubah lewat kolom Label di `/admin/ekspedisi`. Layanan di luar katalog tidak punya tarif, jadi tidak bisa muncul di checkout. | Pilih layanan dari dropdown katalog, centang Aktif, Simpan |
| P3 | Status Biteship "Dalam perjalanan" | Bisa `dropping_off` (sudah dipetakan ke `dikirim`) atau `picking_up` (belum, tetap `diproses`). Belum diubah tanpa jawaban. | Konfirmasi status persis di dashboard; bila `picking_up` harus dianggap Dikirim, buat kartu lanjutan |
| P4 | Cakupan filter riwayat | Filter memakai `order.status` (pending…batal), nilai asing diabaikan, `ringkasan` tetap global (tidak ikut filter), halaman kembali ke 1 saat filter berubah. | Setuju / minta ringkasan ikut filter |
| P5 | Pilihan awal dropdown ekspedisi | Tidak ada yang terpilih (sama seperti sekarang); pembeli wajib memilih di mode API. Harga tampil di teks opsi dan ringkasan bawah. | Setuju / minta termurah terpilih otomatis |
| P6 | Bentuk lama `settings.shipping_couriers` berupa string `"jne:reg"` | Dianggap data lama yang sah; dibaca sebagai layanan aktif reguler. Jika db berisi bentuk lain, layanan itu diabaikan dan checkout memakai daftar bawaan. | Cek `/admin/ekspedisi`: bila daftar tampak bukan pilihan Anda, simpan ulang |

## Catatan teknis untuk pemilik

- Webhook ditolak 403 bila token tidak cocok. Log menyimpan nama header (bukan nilainya) setelah
  v1.5, jadi penyebab bisa dipastikan tanpa membuka `.env`.
- Pesanan hanya maju `dibayar`/`diproses` → `dikirim` bila status kurir `picked`, `dropping_off`,
  atau `delivered` (PRD-v1.3 §2.3). Pesanan `pending` (belum dibayar) tidak pernah maju.
- Tidak ada migrasi baru di v1.5.

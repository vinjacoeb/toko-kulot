# Akun lokal hasil seeder

Dibuat oleh `php artisan migrate:fresh --seed` / `php artisan db:seed` pada database lokal.
Semua akun di bawah **hanya untuk pengembangan** dan wajib diganti atau dihapus sebelum
data dipakai di server. Password tidak pernah dikirim ke respons API maupun ditulis ke log.

## Panel admin (guard `admin`)

| Email | Password | Role | Status |
|---|---|---|---|
| `admin@tokokulot.test` | `Admin#12345` | `owner` | aktif |
| `staff@tokokulot.test` | `Staff#12345` | `staff` | aktif |

`owner` boleh mengelola semua menu admin (produk, stok, pesanan, ulasan, pesan, carousel,
FAQ, pengaturan, akun admin). `staff` hanya membantu operasional (lihat PRD §14 A11).

## Pembeli (guard `web`)

| Email | Password | Kota | Catatan |
|---|---|---|---|
| `budi@example.test` | `password` | Pekalongan | punya 2 order + 1 keranjang aktif |
| `sari@example.test` | `password` | Pekalongan | punya 1 order |

## Data contoh lain

- Produk, kategori, order, ulasan, pesan kontak, carousel, dan FAQ memakai prefiks `[CONTOH]`
  pada nama/deskripsi/pesan sehingga bisa dicari lalu dihapus tanpa menyentuh data pemilik.
- Gambar contoh: `public/images/seed/` (dibuat lokal oleh seeder, bukan unduhan).
- Kode order contoh: `TK-20261015-0001` (selesai), `TK-20261016-0001` (dikirim),
  `TK-20261018-0001` (menunggu pembayaran).
- `midtrans_client_key` sengaja kosong. Pemilik mengisinya lewat panel admin, bukan lewat `.env`
  dari sisi backend.

## Cara mengulang

```bash
php artisan migrate:fresh --seed   # reset skema + isi ulang data contoh
php artisan db:seed                # isi ulang tanpa reset (idempoten, aman diulang)
```

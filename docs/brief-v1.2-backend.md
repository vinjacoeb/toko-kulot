# Brief Backend — v1.2

Baca `docs/PRD-v1.2.md` (§2, §3, §4, §7, §8, §10) + `docs/PRD-v1.1.md` §7 + `docs/db.md`.
Kode yang diganti ada di commit `8840021` (charge QRIS Core API pernah ada:
`git show 8840021:app/Services/MidtransService.php`) — boleh jadi rujukan, bukan disalin mentah.

## Kartu B1 — Midtrans Core API (tanpa Snap)
- `MidtransApi`: `snap()` → `charge(array $params): array`; `SdkMidtransApi` pakai `CoreApi::charge`.
- `MidtransService`: hapus jalur Snap; buat charge per kanal (PRD §2.2), instruksi terurai ke props
  §2.3, expiry per grup, ganti kanal = `order_id_midtrans` baru, idempoten untuk kanal sama.
- `OrderService::createFromCart` tidak lagi memanggil Midtrans (baris `payments` pending saja).
- `CheckoutController`: `pay`, `metode` (POST baru, `throttle:10,1`), `status`, `simulate`,
  route `GET /midtrans/selesai`.
- `FakeMidtransApi` + test: fixture tiap grup kanal, ganti kanal, kanal ditolak, polling, lunas.
- Perbarui `docs/kontrak-props.md` §7.7/§7.8 dan `docs/catatan-backend.md`.

## Kartu B2 — Register & prefill (setelah B1, berkas CheckoutController sama)
- `RegisterRequest` + `AuthController`: `address` (10–500), `city` (maks 100), `postal_code`
  (digits:5) wajib; simpan ke `users`.
- `CheckoutController` prefill dari user: nama, telepon, alamat, kota, kode pos.
- Test: register menyimpan 3 field; validasi menolak kode pos salah; checkout mem-prefill.

## Kartu B3 — Resi otomatis Biteship
- Migrasi `orders`: `biteship_order_id` (60, null), `shipping_status` (30, null),
  `shipping_payload` (json, null).
- `BiteshipService::createOrder(Order)`: muat PRD §8, guard, idempoten, timeout 15 s, galat rapi.
- Route admin `POST /admin/pesanan/{order}/resi` + aksi di `Admin\OrderController`.
- Fake Biteship untuk test (jangan panggil jaringan); test: sukses, dua klik, guard gagal.
- Jangan memperbarui `docs/db.md` (dikerjakan B4 agar tidak bentrok).

## Kartu B4 — Props admin pesanan & riwayat (setelah B1+B3)
- `Admin\OrderController@show/index`: detail pembayaran (kanal, VA/bill/kode/QR, kedaluwarsa,
  transaction_id, status) + pengiriman (kurir, layanan, resi, shipping_status, mode uji).
- `HistoryController`: resi, kurir/layanan, alamat, rincian biaya, timeline; eager load.
- Perbarui `docs/db.md`, `docs/kontrak-props.md` bagian admin/riwayat.

## Aturan
Hanya `app/`, `routes/`, `database/`, `tests/`, `docs/`. Jangan `.env`, jangan jalankan migrasi
atau server. Uji: `php artisan test --filter=...` bila environment siap; bila tidak, tulis
"belum dijalankan" + alasan di catatan.

## Kapan boleh block
Hanya bila kredensial asli/akun Midtrans diperlukan untuk melanjutkan (tidak: mode uji cukup).

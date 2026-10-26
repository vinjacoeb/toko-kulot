# Brief Backend — v1.4

Baca: `docs/PRD-v1.4.md` §2–§5, `docs/db.md`, `docs/kontrak-props.md` §12.16, §12.17, §13,
`docs/PRD-v1.3.md` §3. Tampilan tidak perlu dibaca untuk kerja backend.

## Yang dikerjakan (tiga kartu terpisah, urut)

1. **B3 — hapus ubah status manual.** Hapus rute `PATCH /admin/pesanan/{order}/status`,
   `OrderController@status`, `App\Http\Requests\Admin\UpdateOrderStatusRequest`,
   `Order::nextStatuses()`, prop `status_berikut`; sesuaikan test yang memakai rute itu.
   Jangan sentuh `BiteshipService`, `OrderService`, `BiteshipWebhookService`, JSX.
2. **B1 — ongkir.** Satu fungsi berat dipakai tarif + create order (tanpa minimum 500 g,
   fallback 300 g/unit); `destination_city` tidak dikirim ke tarif; log `Biteship tarif dipakai`
   saat order dibuat; test fitur sesuai PRD §2.3. Jangan sentuh `Order.php`,
   `BiteshipWebhookService`, `shippingInfo()`, JSX.
3. **B2 — timeline pengiriman.** Migrasi `orders.shipping_events` json null; append idempoten di
   webhook (maks 50); `shipping.events` + `timeline.completed_at`; update `docs/db.md` dan
   `docs/kontrak-props.md`; test sesuai PRD §4.4. Jangan sentuh JSX.

## Output

- Kode: `app/`, `routes/admin.php`, `database/migrations/`, `tests/` sesuai kartu.
- Dokumen: `docs/catatan-backend.md` (keputusan/penyimpangan), `docs/db.md`,
  `docs/kontrak-props.md` hanya untuk B2.

## Definition of Done (per kartu)

- Test fitur baru/terubah lulus; `php artisan test --filter=<terkait>` hijau, suite penuh hijau.
- Tidak ada `.env` dibaca/ditulis; tidak ada token di log.
- Body kartu menyebut bukti: file:baris + nama test.
- Perbandingan tarif nyata vs `order.price` **belum diuji** (butuh key/saldo pemilik); tulis apa
  adanya, jangan mengklaim cocok.

## Kapan boleh block

Hanya bila migrasi tidak bisa jalan karena skema bertentangan dengan `docs/db.md` dan tidak ada
jalan yang bisa diambil tanpa keputusan pemilik. Key Biteship tidak tersedia **bukan** alasan
block: pakai `Http::fake()` dan tandai "belum dicek, butuh key". Ragu requirement: catat di
`docs/catatan-backend.md`, lanjut dengan asumsi paling dekat ke PRD.

# Brief Backend — v1.5

Baca: `docs/ringkasan-v1.5.md`, `docs/PRD-v1.4.md` §4, `docs/PRD-v1.3.md` §2,
`docs/kontrak-props.md` §7.9, §7.12, §13, `docs/db.md`. Tampilan tidak perlu dibaca.

## B1 — opsi ekspedisi mengikuti pengaturan

Bukti keluhan: `BiteshipService::services()` (baris 246–280) hanya menerima baris array;
bentuk lama `settings.shipping_couriers` berupa string `"jne:reg"` akan dilewati, lalu jatuh ke
`DEFAULT_COURIERS` (6 kurir) — checkout tampak tidak mengikuti `/admin/ekspedisi`.
Kerjakan di `app/Services/BiteshipService.php` saja:

- Terima baris string `courier:service` **dan** array; normalisasi, buang kosong, dedupe
  case-insensitive (kunci `courier:service` huruf kecil).
- `DEFAULT_COURIERS` hanya dipakai bila tidak ada satu pun baris sah.
- Urutkan opsi `rates()` menurut `courier_name`, lalu `service_name` (kontrak §7.12).
- Saat ada layanan aktif tanpa tarif di jawaban Biteship, catat
  `Log::warning('Biteship layanan aktif tanpa tarif', ['layanan' => [...]])` (tanpa token/header).
- Jangan ubah `quote()`, `option()`, atau bentuk JSON `opsi`.
- Test: string lama, array, dedupe beda huruf, hanya `is_active` yang tampil, urutan opsi, log.
- Update `docs/kontrak-props.md` §7.12 (satu paragraf: bentuk lama diterima, log baru).

## B2 — token webhook menerima nama header apa pun

Bukti: `BiteshipWebhookController.php:32` hanya membaca `?token=` atau `X-Webhook-Token`;
`storage/logs/laravel.log` mencatat 403 `Webhook Biteship ditolak: token tidak valid` dari IP
Biteship pada 26 Okt 19:07–19:15, artinya callback nyata datang tetapi nama header berbeda.

- Ganti pembacaan token: nilai `?token=` atau **nilai salah satu header** yang sama persis
  dengan `config('biteship.webhook_token')`; bandingkan `hash_equals`, tanpa membocorkan nilai.
- Saat ditolak, log **nama** header yang diterima (bukan nilainya) + IP; saat diterima, log nama
  header yang cocok. Jangan pernah menulis token.
- Token kosong di `.env` tetap menerima semua (mode uji lokal) seperti sekarang.
- Jangan ubah `BiteshipWebhookService` selain bila perlu helper; jangan ubah peta status.
- Test: token di header kustom (`X-Api-Key`), di `X-Webhook-Token`, di query, token salah → 403,
  token kosong → diterima, log tidak memuat nilai token.
- Tambah langkah pemilik di `docs/langkah-pemilik.md` (nama header bebas, nilai harus sama).

## B3 — filter riwayat + timeline halaman selesai

- `HistoryController`: terima `?status=` (salah satu `Order::STATUS_FLOW` + `batal`); nilai lain
  diabaikan (tampil semua). Tambah prop `filter: {status: string|null}`; paginator
  `withQueryString()` supaya `status` ikut di tautan halaman. `ringkasan` tetap dihitung dari
  seluruh pesanan (tidak ikut filter).
- `CheckoutController@orderPayload` (dipakai `checkout.success`): tambah
  `timeline: {created_at, paid_at, shipped_at, completed_at}`; `completed_at` pakai
  `BiteshipService::shippingCompletedAt()` yang sudah dipakai riwayat.
- Update `docs/kontrak-props.md` §7.9 dan §13 (aditif: `timeline` di halaman selesai, `filter`).
- Test: filter mengembalikan hanya status itu, `filter.status` benar, halaman 2 mempertahankan
  `status`, ringkasan tidak berubah karena filter, payload selesai memuat 4 kunci timeline.

## Output dan Definition of Done

- Kode: `app/`, `tests/`; dokumen: `docs/catatan-backend.md`, `docs/kontrak-props.md` (B1, B3),
  `docs/langkah-pemilik.md` (B2).
- `php artisan test --filter=<terkait>` hijau dan suite penuh hijau; sebut nama test di kartu.
- Tanpa migrasi, tanpa dependency baru, tanpa `.env`.
- Verifikasi webhook nyata dan tarif nyata: **belum diuji, butuh pemilik/Biteship**.

## Kapan boleh block

Hanya bila skema DB bertentangan dengan `docs/db.md` dan tidak ada jalan tanpa keputusan pemilik.
Tidak punya token/kunci Biteship **bukan** alasan block: pakai `Http::fake()` dan tandai belum diuji.

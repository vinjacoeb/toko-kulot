# Brief Backend — v1.3 (webhook Biteship + tunnel)

Baca `docs/PRD-v1.3.md` §2 dan §3, lalu `docs/kontrak-props.md` §7.9, §12.16–§12.18, §13,
`docs/db.md`, dan pola `app/Http/Controllers/MidtransNotificationController.php` +
`bootstrap/app.php`. Dokumen acuan menang atas brief ini.

## Kartu B1 — webhook inti

- Migrasi dua kolom `orders.shipping_updated_at`, `orders.shipping_webhook_payload` (PRD §2.5);
  perbarui `docs/db.md`.
- `config/biteship.php`: `webhook_token` dari `BITESHIP_WEBHOOK_TOKEN` (jangan cetak nilainya).
- Route `POST /biteship/webhook` di `routes/web.php` di luar `auth`, throttle `120,1`, CSRF
  dikecualikan di `bootstrap/app.php`. Controller invokable baru + metode service
  (`BiteshipService` atau service kecil terpisah) — jangan menggandakan aturan status di dua
  tempat.
- Terapkan PRD §2.2–§2.4 persis: pencocokan `biteship_order_id`, hanya maju, idempoten, tidak
  menyentuh `payments`/stok/total, 403 token salah, 422 body rusak, 200 untuk sisanya.
- Test fitur baru: tiga event, event ganda, status tidak mundur, `pending`/`batal` aman,
  token salah, body rusak, order tak dikenal, dua kolom terisi.

## Kartu B0 — proxy tunnel

- `bootstrap/app.php`: `trustProxies(at: ['127.0.0.1', '::1'])`. Jangan `'*'`.
- Test: request dengan `X-Forwarded-Proto: https` menghasilkan URL aset `https://` di HTML
  halaman publik.

## Kartu B2 — props (setelah B1 + design-v1.3)

- Admin §12.16/§12.17 + keys PRD §2.6 (termasuk `tindakan`, `driver`, `webhook_terakhir`).
- Riwayat §13 dan selesai §7.9 bentuk pembeli (tanpa harga/selisih/payload).
- Perbarui `docs/kontrak-props.md` pada bagian itu saja; jangan mengubah key lama.
- Test props: key baru ada dengan nilai null yang benar, pembeli tidak menerima key admin.

## Batasan

- Hanya `app/`, `routes/`, `database/`, `config/`, `tests/`, `docs/`. Jangan `.env`, jangan
  menjalankan migrasi/server, jangan pakai kredensial asli. Mode uji (`fake`) tetap jalan.
- Jangan memperbaiki temuan di luar lingkup; catat di `docs/catatan-backend.md`.

## Definition of Done

`php artisan test --filter=BiteshipWebhook` dan test props hijau; bila PHP CLI belum memuat
`pdo_sqlite` (lihat `docs/langkah-pemilik.md` bagian PHP CLI), pakai
`php -d extension=pdo_sqlite -d extension=sqlite3 vendor/bin/phpunit --filter=BiteshipWebhook`
dan catat di `docs/catatan-backend.md`; `docs/db.md`,
`docs/kontrak-props.md`, `docs/catatan-backend.md` diperbarui; tidak ada perubahan perilaku
selain yang disebut PRD v1.3.

Block hanya bila skema/kolom nyata berbeda dari `docs/db.md` dan tidak bisa diputuskan dari
dokumen, atau butuh kredensial asli.

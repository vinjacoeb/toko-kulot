# Review v1.5 — keputusan siap/belum

Kartu `t_671897e5` · 26 Okt 2026 · acuan: `docs/qa-v1.5.md`, `docs/design-v1.5.md`,
`docs/traceability-v1.5.md`, `docs/pertanyaan-pemilik-v1.5.md`, `docs/PRD-v1.3.md` §2–3.
Pemeriksaan mandiri: berkas + `git diff` + suite PHPUnit + probe HTTP baca-saja ke server pemilik.
Keputusan rilis tetap di pemilik.

## 1. Ringkasan keputusan

| Permintaan pemilik (traceability) | Hasil | Dasar |
|---|---|---|
| 1. Opsi ekspedisi checkout sesuai `/admin/ekspedisi` | **Lulus (kode + test)** | `BiteshipService.php:250-283` (`services()`, filter `is_active`), `:335` (`rates()` memanggil `services(true)` + `urutOpsi` `:322`), `Admin/ShippingController.php:43-95` menulis kunci `shipping_couriers` yang sama; `OngkirV15OpsiTest` 7 test hijau |
| 2. Dropdown pilihan ekspedisi | **Lulus statis** | `Checkout.jsx:777-801` (`Field`+`Select`+`optgroup`), `grep 'type="radio"'` → 0, teks opsi `:441-445`, ringkasan pilihan `:807-838` |
| 3. Status Biteship tidak masuk `/history` & `/admin/pesanan` | **Lulus lokal; webhook nyata belum dicek** | token header apa pun `BiteshipWebhookController.php:79-104`, 403 tanpa ubah status `:39-47`, probe 200 `:24-31`; live: `POST` body kosong 200, token salah 403 |
| 4. Timeline pakai ikon | **Lulus statis** | `TimelinePesanan.jsx:8` peta ikon, render `:63`; dipakai `History.jsx:385` dan `CheckoutSuccess.jsx:198` |
| 5. Timeline di `/checkout/{order}/selesai` | **Lulus** | kartu "Status pesanan" `CheckoutSuccess.jsx:193-199` sebelum Ringkasan `:204`; payload `CheckoutController.php:375-380` (4 kunci) |
| 6. Filter riwayat sesuai `order.status` | **Lulus** | `HistoryController.php:31-47` (`?status=` + `withQueryString`), ringkasan global `:50-60`, prop `filter` `:79`; UI `History.jsx:426-432, 462-477, 498-526, 555-558` |
| Regresi v1.4 | **Lulus** | suite penuh 373 test / 3172 assertion hijau (saya jalankan ulang), rute ubah status manual tetap tiada (`routes/admin.php:142`) |

Tidak ada defect Critical/High/Medium. Satu temuan lingkungan (R1) yang menghalangi uji visual
pemilik lewat tunnel/HP — kartu perbaikan sudah dibuat.

## 2. Pemeriksaan mandiri (bukan mengutip QA)

```
php -d extension=pdo_sqlite -d extension=sqlite3 vendor/phpunit/phpunit/phpunit
  -> OK (373 tests, 3172 assertions), 42.6 s
  --filter='OngkirV15OpsiTest|HistoryFilterV15Test|BiteshipWebhookTest|BiteshipWebhookExceptionJsonTest|TimelineV14Test'
  -> OK (38 tests, 387 assertions)
curl -o /dev/null -w '%{http_code}' http://127.0.0.1:8000/biteship/webhook        -> 200
curl -X POST --data '' /biteship/webhook                                        -> 200
curl -X POST -H 'X-Webhook-Token: salah' -d '{}' /biteship/webhook              -> 403
curl /  -> 200 ; curl /history (guest) -> 302
```

`php artisan test` tidak dipakai (shell non-tty); `phpunit.xml` memakai sqlite `:memory:` sehingga DB
pemilik tidak disentuh. `npm run build` tidak saya jalankan (aturan kerja); aset build di
`public/build/manifest.json` (26 Okt 20:02) lebih baru dari sumber terakhir (`History.jsx` 19:53) dan
`public/build/assets/Checkout-Bp-vSKYO.js` memuat teks `Pilih layanan pengiriman`.

## 3. Temuan

### R1 — `public/hot` hidup lagi; aset dev mengunci halaman lewat tunnel (Medium, lingkungan)

- Bukti: `public/hot` ada (17 byte, isi `http://[::1]:5173`, mtime 26 Okt 17:53);
  `curl http://127.0.0.1:8000/` → `<script src="http://[::1]:5173/@vite/client">` dan
  `src="http://[::1]:5173/resources/js/app.jsx"`; `GET http://[::1]:5173/@vite/client` → 200
  (Vite dev memang hidup).
- Dampak: lewat ngrok/HP `[::1]` tidak terjangkau → halaman kosong. Ini persis F10 v1.3 yang sudah
  pernah diperbaiki (kartu `t_74deeaef`); muncul lagi karena `npm run dev` dijalankan kembali.
  Uji visual 360 px (satu-satunya sisa verifikasi v1.5) jadi tidak bisa dilakukan pemilik.
- Sumber: infra/devops. Kartu: `t_f5535211` — `v1.5 D1 — matikan Vite dev, hapus public/hot,
  build ulang`.

### Catatan Low (tanpa kartu)

- **L1 dedupe layanan pakai baris pertama** (`BiteshipService.php:264-275`): duplikat nonaktif di
  depan menutup duplikat aktif di belakang. Sesuai `design-v1.5.md` §1; hanya perlu diingat saat
  menyunting `/admin/ekspedisi`.
- **L2 region live ikut tersembunyi saat 0 pesanan**: `History.jsx:498-526` membungkus teks hasil
  (`role="status" aria-live`) di dalam `tampilkanFilter`. `design-v1.5.md` §4 menulis "region live
  selalu ada di DOM", tetapi §5/§6.4 mewajibkan kontrol filter tidak dirender bila
  `ringkasan.total === 0`. Dua kalimat desain itu bertabrakan; perilaku sekarang mengikuti §5.
  Tanpa dampak fungsional (tidak ada yang difilter saat 0 pesanan). Desain yang perlu dirapikan,
  bukan kode.
- **L3 token webhook lewat `?token=`**: nilai token bisa tercatat di access log server/proxy/ngrok.
  Ini pilihan desain v1.3 (dashboards Biteship bebas memilih header atau query). Risiko diterima;
  header kustom lebih aman bila pemilik mau.
- **L4 `tmp/uji-*.mjs`** (harness uji frontend, untracked) masih di repo. Rumah tangga saja; jangan
  ikut di-commit saat rilis.

## 4. Belum dicek (dan tidak diklaim)

| Hal | Alasan |
|---|---|
| Tampilan dropdown 360 px, cincin fokus `Select`, `aria-live` pengumuman (F1) | butuh browser |
| Ikon timeline 20 px di 360/768 px, keyboard filter, back/forward (F2) | butuh browser |
| Kartu "Status pesanan" pada pesanan nyata (timeline parsial/penuh) | butuh browser + akun uji |
| Webhook Biteship nyata: token dari dashboard, event `order.status`, probe instalasi dari server Biteship, tampil di `/admin/pesanan/{order}` | butuh dashboard + tunnel milik pemilik (`docs/langkah-pemilik.md` v1.5 §1) |
| Halaman lewat tunnel/ngrok | terhalang R1 sampai kartu `v1.5 D1` selesai |

## 5. Sisa bug & risiko

- Tidak ada bug fungsional terbuka dari v1.5.
- Risiko rilis utama bukan kode: **R1** (halaman kosong via tunnel) dan **webhook nyata belum
  dibuktikan** — sedangkan keluhan pemilik #3 justru soal status Biteship yang tidak masuk.
- Risiko label: `LABEL_FILTER` di `History.jsx:37-45` satu-satunya teks status dari klien; harus
  tetap sama dengan `Order::statusLabel`. Saat ini 6 label cocok.
- Migrasi `2026_10_24_000003/000004/000005/000006` harus sudah dijalankan di DB pemilik
  (`orders.shipped_at`, `shipping_events`); status di DB pemilik **belum dicek** (tidak boleh
  menjalankan migrate/artisan dari sesi ini).

## 6. Rekomendasi

**GO** untuk kode v1.5: keenam permintaan pemilik terpenuhi di kode + test, suite penuh hijau,
tidak ada Critical/High, perubahan UI hanya `Select` native + ikon dekoratif.
**NO-GO sementara untuk uji terima pemilik lewat tunnel/HP** sampai: (a) kartu `v1.5 D1` selesai
(`public/hot` hilang, HTML memakai `/build/assets`), dan (b) pemilik memasang *Custom Header*
webhook lalu mengubah status satu pesanan uji untuk membuktikan permintaan #3. Keduanya tindakan
pemilik/devops, bukan kode. Keputusan rilis tetap di pemilik.

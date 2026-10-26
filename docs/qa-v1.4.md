# QA v1.4 — ongkir, hapus ubah status, timeline Biteship

Kartu: `t_74f3f512`. Tanggal: 26 Okt 2026. Acuan: `docs/PRD-v1.4.md`, `docs/design-v1.4.md`,
`docs/kontrak-props.md` (§12.16–§12.18a, §13), `docs/brief-v1.4-qa.md`.

Kesimpulan singkat: **F11, F12, F13, F14 lulus di test otomatis dan pemeriksaan props HTTP**.
Tiga temuan minor (2 sisa kode/copy F12, 1 celah snapshot berat) dan tiga hal yang belum diuji
karena butuh browser, key Biteship, atau migrasi di DB pemilik.

## 1. Lingkungan uji

- Repo: `C:/Users/LENOVO/Downloads/toko-kulot`, Windows 11 + Git Bash.
- Aplikasi: `http://127.0.0.1:8000` — server milik pemilik sudah berjalan; QA **tidak** menyalakan
  server dan **tidak** menjalankan migrate/seed di DB pemilik.
- PHPUnit 11.5.57; `phpunit.xml` memakai sqlite `:memory:` sehingga DB MySQL pemilik tidak tersentuh.
- Perintah yang benar-benar dijalankan:

```
php -d extension=pdo_sqlite -d extension=sqlite3 vendor/phpunit/phpunit/phpunit < /dev/null
  -> OK (356 tests, 2986 assertions), Time 00:47.745
php artisan route:list --json          # 0 rute .../pesanan/{order}/status
php artisan migrate:status             # 2026_10_26_000006_add_shipping_events_to_orders_table = Pending
npm run build                          # exit 0
curl /produk, /produk/{slug}, /keranjang, /login, /admin, /admin/login, /admin/pesanan,
     /admin/pesanan/29, /history, PATCH+DELETE /admin/pesanan/29/status
```

- Sesi HTTP memakai cookie jar sementara di scratch; kredensial dev tidak ditulis di laporan ini.

## 2. Hasil per fitur

### F12 — hapus ubah status manual: LULUS

- Rute lama hilang: `php artisan route:list --json` → 0 kecocokan `pesanan/{order}/status`;
  live `PATCH /admin/pesanan/29/status` → **404**, `DELETE` → **404** (dengan sesi admin maupun tanpa).
- Test `AdminSalesTest::test_rute_ubah_status_manual_sudah_dihapus` (baris 128) lulus:
  404, status pesanan tetap `pending`, stok varian tetap 5, `stock_movements` tetap 0.
- Props tanpa `status_berikut`: live `/admin/pesanan` (15 baris) dan `/admin/pesanan/29` →
  string `status_berikut` muncul **0 kali**.
- UI: `UpdateOrderStatusRequest` tidak ada di `app/Http/Requests`; `resources/js` hanya memuat
  komentar penjelas (`Admin/Orders/Show.jsx:20`), status ditampilkan lewat `StatusBadge` (baris 136–137);
  `npm run build` sukses (tidak ada import yatim).
- Webhook tetap memajukan status: `BiteshipWebhookTest` picked→dikirim (baris 72),
  delivered→selesai (baris 95) lulus.
- Filter/ringkasan tetap: live `ringkasan` = `{total:16,pending:7,dibayar:1,diproses:0,dikirim:3,selesai:1,batal:4}`
  (kunci `diproses` masih ada sesuai PRD §3.1).

### F11 — dasar ongkir sama dengan Biteship: LULUS (kecuali perbandingan tarif nyata)

- Satu fungsi berat `BiteshipService::beratUnit()` (`app/Services/BiteshipService.php:68-70`):
  `weight_gram > 0` apa adanya, fallback 300 g; dipakai tarif (`rates`) dan create order
  (`orderPayload`, baris 470) serta penyimpanan order (`OrderService.php:47-52`, `:83`).
- Tanpa minimum 500 g: `OngkirV14Test::test_tarif_memakai_berat_produk_tanpa_minimum_500_gram`
  (baris 90) → body tarif `weight = 250` untuk produk 250 g.
- `destination_city` tidak dikirim ke API tarif: `OngkirV14Test` baris 108
  (`assertArrayNotHasKey('destination_city', $body)`), `origin_postal_code`/`destination_postal_code`
  yang dikirim.
- Log tarif satu baris per order: `OrderService.php:90-99` (`BiteshipService::LOG_TARIF`) berisi
  kode order, kode pos asal/tujuan, berat, kurir, layanan, biaya, mode — tanpa key/token;
  diuji `OngkirV14Test::test_log_biteship_tarif_dipakai_saat_order_dibuat` (baris 159).
- Asal kirim belum lengkap → tolak sebelum panggil API: `OngkirV14Test` baris 185 lulus
  (`opsi: []` + `galat`, tanpa request).
- `order.price` tidak mengubah uang: `BiteshipWebhookTest::test_order_price_tidak_mengubah_uang_stok_dan_menyimpan_payload`
  (baris 132) lulus.
- **Belum diuji:** perbandingan tarif website vs `order.price` nyata — butuh key + saldo Biteship
  pemilik (PRD-v1.4 §2.3, §5.2 butir 3). Tidak ada klaim lulus untuk butir ini.

### F13 — riwayat pengiriman & timeline pembeli: LULUS di test, tampilan belum diuji

- Migrasi ada: `database/migrations/2026_10_26_000006_add_shipping_events_to_orders_table.php`.
- Append idempoten + dedupe entri terakhir + cap 50: `BiteshipWebhookService.php:122-127` dan
  `:142-158`; diuji `TimelineV14Test` baris 67 (dua webhook identik → 1 entri), 82
  (picked lalu delivered → 2 entri + auto selesai), 96 (cap 50).
- Props pembeli: `BiteshipService.php:597-604` (events terbaru→terlama, label `shippingLabel`),
  `timeline.completed_at` `BiteshipService.php:619+` via `HistoryController.php:115`;
  diuji baris 115, 139, 160, 178.
- Bentuk props live: `/admin/pesanan/29` → `shipping.events = []` (list, bukan null) dan
  `timeline` admin tetap `{created_at, paid_at, shipped_at}`; `/history` → tiap baris punya
  `timeline.completed_at` dan `shipping.events`, tanpa `price_final`/`webhook_terakhir` (§13).
- UI: node `Selesai` memakai `timeline.completed_at` (`Public/History.jsx:157`), daftar
  `Riwayat pengiriman` di `:440` via `Components/ShippingEvents.jsx` (maks 10, terbaru di atas,
  `<ol>`, titik `aria-hidden`, tanpa render bila kosong), halaman selesai di
  `Public/CheckoutSuccess.jsx:284-285`.
- **Belum diuji (browser):** urutan visual, 360 px, kontras, dan keadaan 10 entri — butuh browser.
- **Belum diuji (lingkungan):** event nyata belum bisa muncul di DB pemilik karena migrasi
  `000006` masih **Pending**; `php artisan migrate` adalah tindakan pemilik (PRD-v1.4 §5.2 butir 2).

### F14 — token webhook: LULUS

Tidak ada perubahan kode; `config/biteship.php:15` membaca `BITESHIP_WEBHOOK_TOKEN`, dipakai
`BiteshipWebhookService.php:37`. Perilaku lama tetap: token salah → 403, body rusak → 422,
order tak dikenal → 200, probe GET/body kosong → 200 (`BiteshipWebhookTest` baris 273–342).

### Regresi v1.3: LULUS

Webhook idempoten, status tidak mundur, status kurir bermasalah tidak membatalkan pesanan,
resi manual (`AdminSalesTest` baris 202–326), resi otomatis + guard (`AdminAutoResiTest`),
Midtrans, filter status admin, dan riwayat pembeli — semuanya bagian dari suite 356 test yang hijau.
Login admin: guest `/admin/pesanan` → 302, sesi admin → 200; `/admin/login` → 200; `/` dan
`/produk` → 200; `/produk/{slug}` valid → 200, slug ngawur → 404; `/keranjang` → 200.

## 3. Test case yang dijalankan

| ID | Requirement | Skenario | Bukti | Status |
|---|---|---|---|---|
| QA14-01 | PRD-v1.4 §3.2 | PATCH rute status lama → 404 | `AdminSalesTest:128`; live 404 | Lulus |
| QA14-02 | §3.2 | DELETE rute status lama → 404 | live 404 | Lulus |
| QA14-03 | §3.2 | Tidak ada prop `status_berikut` di index/detail | live props (0 kecocokan) | Lulus |
| QA14-04 | §3.2 | Tidak ada tombol/modal "Ubah status" di UI admin | grep `resources/js`; `npm run build` | Lulus |
| QA14-05 | §3.1 | Webhook tetap memajukan status | `BiteshipWebhookTest:72,95` | Lulus |
| QA14-06 | §3.1 | Filter + ringkasan status tetap, `diproses` ada | live `ringkasan`; `AdminSalesTest` | Lulus |
| QA14-07 | §2.3 | Produk 250 g → berat tarif 250 (bukan 500) | `OngkirV14Test:90` | Lulus |
| QA14-08 | §2.2 | Produk berat 0 → fallback 300 g/unit | `OngkirV14Test:113` | Lulus |
| QA14-09 | §2.3 | Body tarif tanpa `destination_city` | `OngkirV14Test:108` | Lulus |
| QA14-10 | §2.3 | Log `Biteship tarif dipakai` terisi tanpa token | `OngkirV14Test:159`; `OrderService.php:90` | Lulus |
| QA14-11 | §2.2 | Asal belum lengkap → tolak tanpa panggil API | `OngkirV14Test:185` | Lulus |
| QA14-12 | §2.3 | Berat create order = `shipping_weight_gram` | `OngkirV14Test:125` | Lulus* |
| QA14-13 | §2.2 | `order.price` tidak mengubah uang | `BiteshipWebhookTest:132` | Lulus |
| QA14-14 | §2.3 | Tarif website vs `order.price` nyata | — | Belum Diuji, butuh key Biteship |
| QA14-15 | §4.4 | Dua webhook status identik → 1 entri | `TimelineV14Test:67` | Lulus |
| QA14-16 | §4.4 | picked lalu delivered → 2 entri + auto selesai | `TimelineV14Test:82` | Lulus |
| QA14-17 | §4.4 | Riwayat dibatasi 50 entri | `TimelineV14Test:96` | Lulus |
| QA14-18 | §4.2 | `shipping.events` terbaru dulu + label | `TimelineV14Test:115` | Lulus |
| QA14-19 | §4.2 | `completed_at` terisi saat delivered | `TimelineV14Test:139` | Lulus |
| QA14-20 | §4.2 | `completed_at` null tanpa delivered | `TimelineV14Test:160` | Lulus |
| QA14-21 | §4.3 | Halaman selesai memuat events | `TimelineV14Test:178` | Lulus |
| QA14-22 | §12.17 | Props admin: `shipping.events` list, timeline 3 kunci | live `/admin/pesanan/29` | Lulus |
| QA14-23 | §13 | Props pembeli: `completed_at` + events, tanpa data admin | live `/history` | Lulus |
| QA14-24 | design-v1.4 §1–3 | Tampilan timeline 4 node + daftar event (360 px, kontras) | — | Belum Diuji, butuh browser |
| QA14-25 | §4.1 | Event tersimpan di DB pemilik | migrasi `000006` Pending | Belum Diuji, butuh migrate pemilik |
| QA14-26 | §4.4 | Dedupe/cap 50 pada data nyata | — | Belum Diuji, butuh migrate + webhook nyata |
| QA14-27 | F14 | Token webhook: salah 403, probe 200 | `BiteshipWebhookTest:273-342` | Lulus |
| QA14-28 | §3.1 | Resi manual + otomatis tetap jalan | `AdminSalesTest:202-326`; `AdminAutoResiTest` | Lulus |
| QA14-29 | Regresi | Midtrans & pembayaran tidak berubah | suite penuh | Lulus |
| QA14-30 | §13 | Akses admin/pembeli: guest 302, login 200 | live HTTP | Lulus |
| QA14-31 | §3.2 | Suite penuh lulus | `356 tests, 2986 assertions` | Lulus |

\* Lulus untuk kondisi produk tidak berubah; lihat QA-14-02.

Total: 31 kasus — **27 Lulus**, **0 Gagal**, **0 Terblokir**, **4 Belum Diuji**.

## 4. Temuan (kartu perbaikan)

### QA-14-01 — Sisa kode F12: `changeStatusByAdmin()` memanggil `Order::nextStatuses()` yang sudah dihapus

Kartu: `t_eb2b12f9`.

- Severity **Low**, prioritas **P3**, komponen Backend.
- Bukti: `app/Services/OrderService.php:303-309` masih ada dan memanggil `$locked->nextStatuses()`;
  `Order::nextStatuses()` sudah dihapus di v1.4 (tidak ada di `app/Models/Order.php`).
  `restoreStock()` (`OrderService.php:340`) juga tidak lagi dipanggil dari mana pun.
- Aktual: method publik tanpa pemanggil, tetapi akan **fatal error** bila dipanggil (mis. dari
  tinker/kode baru). Diharapkan: kode mati dihapus agar tidak ada jalur rusak (PRD-v1.4 §3.1).
- Dugaan penyebab: penghapusan rute/controller tidak menyertakan service method-nya.
- Dampak: tidak ada di runtime sekarang; risiko regresi saat refactor berikutnya.

### QA-14-02 — Berat create order memakai berat produk saat ini, bukan snapshot `orders.shipping_weight_gram`

Kartu: `t_65362988`.

- Severity **Medium**, prioritas **P2**, komponen Backend.
- Bukti: `app/Services/BiteshipService.php:462-471` menghitung
  `beratUnit($item->product?->weight_gram)`; tidak memakai `orders.shipping_weight_gram`
  (`OrderService.php:83`). `order_items` tidak menyimpan snapshot berat; FK `product_id`
  `nullOnDelete` dan `Product` tanpa soft delete.
- Aktual: bila admin mengubah `weight_gram` produk (atau menghapus produk) setelah checkout dan
  sebelum "Buat resi otomatis", berat `POST /v1/orders` ≠ `orders.shipping_weight_gram`.
  Diharapkan: PRD-v1.4 §2.2 butir 2 ("Berat yang tersimpan di `orders.shipping_weight_gram` =
  berat yang dikirim ke Biteship") berlaku untuk order yang sama.
- Dugaan penyebab: `orderPayload()` memakai relasi produk hidup, bukan snapshot order.
- Dampak: dasar tarif checkout dan tagihan Biteship bisa berbeda lagi (gejala F11) pada kasus ini.
  Saran: pakai total `orders.shipping_weight_gram` (mis. berat per baris proporsional) atau
  tambah snapshot berat di `order_items`.
- Catatan: belum direproduksi runtime (butuh mengubah data produk di DB pemilik); bukti bersifat
  analisis kode.

### QA-14-03 — Pesan `shipping.tindakan` masih menyuruh "ubah status" padahal kontrolnya sudah dihapus

Kartu: `t_4eb06cea`.

- Severity **Low**, prioritas **P3**, komponen Backend (teks) + keputusan UIUX.
- Bukti: `app/Services/BiteshipService.php:720` menambahkan
  `'Periksa pesanan dan ubah status bila perlu.'` pada pesan paket retur/gagal; dikunci test
  `tests/Feature/ShippingPropsV13Test.php:175`. Sejak v1.4 tidak ada UI ubah status
  (`routes/admin.php:142`, PRD-v1.4 §3.1), dan §12.17 hanya mendaftar pesan tanpa kalimat itu.
- Aktual: admin disuruh melakukan hal yang tidak tersedia di aplikasi.
  Diharapkan: pesan sesuai §12.17, mis. `Kurir melaporkan paket dikembalikan.` +
  arahan penyelesaian di luar aplikasi (PRD-v1.4 §6 asumsi).
- Dugaan penyebab: copy v1.3 tidak ikut disesuaikan saat F12.

## 5. Sisa bug / risiko

- **Migrasi `2026_10_26_000006` Pending di DB pemilik** — sebelum `php artisan migrate`, kolom
  `orders.shipping_events` tidak ada sehingga riwayat pengiriman tidak akan tersimpan/ditampilkan
  di lingkungan nyata. Tindakan pemilik (PRD-v1.4 §5.2).
- **Perbandingan tarif nyata** website vs `order.price` belum diuji (butuh key + saldo Biteship).
- **Tampilan & aksesibilitas** timeline/daftar event (360 px, kontras, keyboard) belum diuji browser.
- Brief QA menulis "webhook 401/404"; perilaku aktual dan terkunci test adalah **403** (token salah),
  **422** (body rusak), **200** (order tak dikenal/probe). Tidak dilaporkan sebagai bug —
  perbedaan istilah di brief, bukan perubahan kode v1.4.

## 6. Rekomendasi

**GO BERSYARAT.**

- Tidak ada temuan Critical/High; seluruh P0 (F12 rute/UI hilang, F11 dasar berat & log, F13
  append/props) lulus.
- Syarat sebelum rilis: (1) pemilik menjalankan `php artisan migrate` untuk kolom
  `shipping_events`; (2) setelah pesanan uji nyata, kirim kode order + isi log
  `Biteship tarif dipakai` + payload `order.price` untuk menutup butir F11 yang masih
  "belum diuji, butuh key"; (3) putuskan QA-14-01/02/03 (semua Low–Medium, tidak menghalangi rilis).
- Risiko tersisa: riwayat pengiriman belum terbukti tampil di data nyata sampai migrasi dijalankan.

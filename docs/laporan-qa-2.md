# Laporan QA Putaran 2 — Kartu `t_43d8bcd7`

**Proyek:** Toko Daster Kulot (`C:/Users/LENOVO/Downloads/toko-kulot`)
**Tanggal:** 22 Oktober 2026
**QA:** profil `qatesting`
**Jenis:** verifikasi putaran 2 (tanpa mengubah kode) + e2e produk/stok
**Rujukan:** kartu `t_43d8bcd7`, `docs/kontrak-props.md` §12.24 (baris 1412–1443),
`docs/review-2.md` butir #1, #5, #6, #7, hasil kartu `t_8e89556f`,
`t_a98f17d4`, `t_e3f68f7f`.

**Artefak:**
- `docs/laporan-qa-2.md` (berkas ini)
- `docs/bukti-qa-t_43d8bcd7.txt` (log mentah suite + terarah + probe + bukti statis path:baris)
- `docs/probe-qa-t_43d8bcd7.php.txt` (sumber probe E2E, di luar repo, untuk reproduksi)

---

## 1. Ringkasan

| Metrik | Hasil |
|---|---|
| Suite penuh `php artisan test` | **237 passed, 1791 assertions, 0 gagal, 0 incomplete, exit 0** (70,11 detik) |
| Test terarah (8 berkas terkait) | **72 passed, 669 assertions, exit 0** |
| Probe E2E produk + stok (di luar repo) | **5 passed, 46 assertions, exit 0** |
| Test case QA2 | **26**: 22 Lulus, 0 Gagal, 0 Terblokir, 4 Belum Diuji |
| Defect baru | **0** |
| Observasi non-blocking | 2 (P3): pesan `customer_city.max` tidak ada di `messages()` server; celah cakupan test repo untuk `compare_price`/update/deaktivasi produk |
| Rekomendasi | **GO BERSYARAT** untuk lingkup QA2 — tidak ada P0 gagal/Critical/High; 3 syarat verifikasi lanjutan tercatat di §9 |

**Kesimpulan singkat:** keempat butir laporan pemilik pada kartu ini terbukti
diperbaiki dan tidak ada regresi pada suite. Jalur Midtrans asli dan perilaku
visual browser tetap **belum diuji** karena butuh kredensial pemilik
(kartu `t_fcfc3687`) dan browser.

---

## 2. Pemahaman Fitur yang Diverifikasi

| Butir | Laporan pemilik (`docs/review-2.md`) | Perbaikan yang diverifikasi |
|---|---|---|
| #1 | Tombol "Buat Pesanan" terlihat tidak bereaksi saat validasi klien gagal | `t_a98f17d4` — notice validasi, aturan klien disamakan dengan server, gulir/fokus |
| #5 | Status bayar tetap "menunggu pembayaran" padahal sudah dibayar | `t_8e89556f` — tombol sinkron status Midtrans di detail pesanan admin (§12.24) |
| #6 | Belum ada e2e produk & stok | kartu ini — probe E2E + verifikasi kode/HTTP |
| #7 | Tamu tidak punya jalan ke halaman Daftar | `t_e3f68f7f` — tiga pintu Daftar (header, drawer, tautan silang) |

Kontrak yang menjadi sumber kebenaran §12.24: `PATCH
/admin/pesanan/{order}/sinkron-pembayaran` tanpa body, middleware `admin` +
`throttle:admin-write`; menarik status Midtrans lalu menerapkannya lewat
`MidtransService::applyStatus()`; tanpa panggilan jaringan untuk pesanan tanpa
tagihan, tagihan mode uji, dan pembayaran yang sudah lunas; kegagalan API =
`flash.error`, bukan 500; status final tidak mundur; log tanpa kredensial.

---

## 3. Review Requirement dan Ketidaksinkronan

1. **Kontrak vs implementasi backend: cocok.** Teks flash, urutan pemeriksaan
   (tanpa tagihan → mode uji → sudah lunas → panggilan API), dan efek status
   sesuai §12.24. Tidak ada penulisan langsung ke `payments`/`orders`/stok dari
   controller; semuanya lewat service yang sama dengan webhook.
2. **Kontrak vs frontend: cocok secara statis.** Tombol mengirim PATCH tanpa
   body, hanya dirender bila `payment` tidak null, hasil tampil satu kali
   (InlineNotice di kartu; Toast halaman ditekan).
3. **Card body vs komentar Tech Lead:** body menyebut gerbang `t_9e719b16`,
   komentar mengoreksi menjadi `t_fcfc3687` untuk Midtrans asli. Laporan ini
   mengikuti komentar (lebih baru); bukan blocker.
4. **Klaim "pesan klien = server": cocok untuk 16 pesan server.** Klien
   menambahkan satu pesan `customer_city.max` karena `messages()` server tidak
   memuatnya (§7 di bawah). Aturan validasinya sendiri sama (`max:100`).
5. **Deviasi UI D13/D14/D15/D16** sudah dicatat di `docs/catatan-frontend.md`
   dan design.md; tidak diperlakukan sebagai defect.

Tidak ada konflik yang menghalangi pengujian. Tidak ada requirement baru yang
dikarang.

---

## 4. Asumsi dan Pertanyaan Terbuka

| # | Pertanyaan/asumsi | Dampak | Status |
|---|---|---|---|
| 1 | "Mode asli" diuji dengan `midtrans.fake=false` + binding `FakeMidtransApi` sebagai seam, bukan jaringan nyata. | Membuktikan alur controller/service; tidak membuktikan integrasi Midtrans. | Asumsi aman, NON-BLOCKING |
| 2 | Probe E2E ditulis di scratch Hermes (bukan `tests/`), karena kartu melarang mengubah kode. | Tidak menambah regresi otomatis di repo; sumber disalin ke `docs/` untuk dipromosikan. | NON-BLOCKING |
| 3 | Pembatalan pesanan diuji lewat `PATCH /admin/pesanan/{id}/status` (jalur admin), bukan pembatalan otomatis. | Sesuai PRD: stok kembali saat batal/kedaluwarsa; jalur expire diuji suite. | NON-BLOCKING |
| 4 | Throttle `admin-write` diverifikasi terpasang, bukan diuji sampai 429. | Risiko limit nyata tidak terukur; middleware terlihat di route. | NON-BLOCKING |

---

## 5. Matriks Risiko dan Strategi Uji

| Area/Fitur | Kemungkinan Gagal | Dampak | Level Risiko | Strategi |
|---|---|---|---|---|
| Sinkron pembayaran mode uji | Tinggi (salah panggil API) | Tinggi (data bayar) | Tinggi | Feature test dengan seam penghitung panggilan; cek 0 panggilan |
| Sinkron settlement/expire + stok | Sedang | Tinggi (stok/uang) | Tinggi | Feature test + inspeksi `applyStatus` (lock, idempoten) |
| Otorisasi route admin | Sedang | Tinggi | Tinggi | Test tamu/pembeli ditolak |
| Notice checkout & aturan klien | Sedang | Sedang (UX) | Sedang | Bandingkan pesan klien vs `CheckoutRequest`; test HTTP server |
| Tiga pintu Daftar | Rendah | Rendah | Rendah | Inspeksi statis + build/harness milik kartu induk |
| CRUD produk + harga coret | Sedang | Tinggi (harga tampil) | Tinggi | Probe E2E HTTP: create/update/validasi/deaktivasi + props katalog |
| Stok saat pesanan/batal | Sedang | Tinggi | Tinggi | Probe E2E + test suite checkout/pembatalan |
| Midtrans asli | Sedang | Tinggi | Tinggi | **Belum diuji** — butuh kredensial pemilik |

---

## 6. Test Case

Semua test dijalankan pada 22 Oktober 2026 dengan `phpunit.xml` (sqlite
`:memory:`), tanpa server dan tanpa kredensial. "Lulus (statis)" berarti
kesesuaian kode terhadap kontrak, bukan eksekusi browser.

| ID | Butir/AC | Fitur | Skenario | Hasil diharapkan | Tipe | P | Status | Bukti |
|---|---|---|---|---|---|---|---|---|
| QA2-01 | Kartu (1) | Suite penuh | `php artisan test` | Semua test proyek lulus | Regresi | P0 | Lulus | §1 bukti |
| QA2-02 | §12.24 | Sinkron mode uji | `MIDTRANS_FAKE=true`, PATCH | `flash.error` mode uji; 0 panggilan `status()` | Fungsional/negatif | P0 | Lulus | `AdminSyncPaymentTest` |
| QA2-03 | §12.24 | Tagihan fake lama | `payload.mode=fake` / `transaction_id=fake-*` | `flash.error`; 0 panggilan | Edge | P0 | Lulus | idem |
| QA2-04 | §12.24 | Tanpa tagihan | Pesanan tanpa baris `payments` | `flash.error`; 0 panggilan | Negatif | P1 | Lulus | idem |
| QA2-05 | §12.24 | Sudah lunas | `payment_status=settlement` | `flash.success` "sudah lunas"; 0 panggilan | Boundary | P1 | Lulus | idem |
| QA2-06 | §12.24 | Settlement | Mode asli + seam palsu | `payment_status=settlement`; order `dibayar`; `paid_at` terisi | Fungsional | P0 | Lulus | idem |
| QA2-07 | §12.24 | Expire | Hasil status `expire` | Order `batal`; stok kembali (+2); movement `in` | Fungsional | P0 | Lulus | idem |
| QA2-08 | §12.24 | Status final | Settlement lalu expire | Tidak mundur; tidak ada perubahan | State | P0 | Lulus | idem |
| QA2-09 | §12.24 | Status tak dikenal | Hasil `pending`/asing | Tidak ada perubahan; pesan sesuai | Edge | P2 | Lulus | idem |
| QA2-10 | §12.24 | Status sama | Payment sudah sama | `flash.success` "tidak berubah" | Fungsional | P2 | Lulus | idem |
| QA2-11 | §12.24 | API gagal | Seam melempar error | `flash.error`; bukan 500; data tidak berubah | Negatif | P1 | Lulus | idem |
| QA2-12 | §12.24 | Log aman | Settlement | Log berisi kode+status, tanpa kredensial/payload | Keamanan dasar | P2 | Lulus | idem |
| QA2-13 | §12.24 | Otorisasi | Tamu/pembeli PATCH | Dialihkan ke login; status tetap | Otorisasi | P0 | Lulus | idem |
| QA2-14 | §12.24 | Idempotensi | Dua sync berurutan / lock | Tidak ada stok ganda; final tidak berubah | Race/state | P0 | Lulus | test + `applyStatus` |
| QA2-15 | #5 / t_8e89556f | Tombol sinkron | Inspeksi partial + Show | PATCH tanpa body; label beku; sekali notice; kondisional `payment` | UI statis | P1 | Lulus (statis) | Bukti §4A |
| QA2-16 | #1 / t_a98f17d4 | Notice checkout | Inspeksi validate/notice/scroll | 16 pesan server tercermin; notice+scroll+focus; CTA anti double-submit | UI statis | P1 | Lulus (statis) | Bukti §4B |
| QA2-17 | #7 / t_e3f68f7f | Tiga pintu Daftar | Inspeksi Header/Drawer/Login | Tiga pintu hanya untuk tamu; href literal | UI statis | P1 | Lulus (statis) | Bukti §4C |
| QA2-18 | #6 | Produk baru + coret | Admin POST produk → katalog | `compare_price` tersimpan; tampil di kartu & detail; stok awal + movement `in` | E2E HTTP | P1 | Lulus | Probe 1 |
| QA2-19 | #6 | Validasi harga coret | `compare_price` = / < `base_price` | Error `Harga coret harus lebih besar dari harga jual.`; produk tidak dibuat | Negatif/boundary | P1 | Lulus | Probe 2 |
| QA2-20 | #6 | Update produk + stok | PUT produk, stok 4→7 | `compare_price` baru; stok 7; movement `adjust` +3 | E2E HTTP | P1 | Lulus | Probe 3 |
| QA2-21 | #6 | Deaktivasi produk | `is_active=false` | Detail 404; hilang dari katalog publik | State publikasi | P1 | Lulus | Probe 4 |
| QA2-22 | #6 | Checkout & batal | Checkout 2 pcs → batal admin | Stok 4→2 (movement `sale`), lalu 2→4 (movement `in`) | E2E HTTP | P0 | Lulus | Probe 5 |
| QA2-23 | §12.24 | Midtrans asli | `MIDTRANS_FAKE=false` + sandbox | Settlement nyata + efek stok | Integrasi | P1 | **Belum Diuji** | butuh kredensial pemilik (`t_fcfc3687`) |
| QA2-24 | #5/#1/#7 | Browser visual | 360/768/1024/1280, keyboard, zoom, kontras | Tata letak & interaksi sesuai design | UI/aksesibilitas | P2 | **Belum Diuji, butuh browser** | — |
| QA2-25 | Kartu (5) | POST /checkout server | HTTP ke server berjalan | Pesanan dibuat; redirect benar | Integrasi | P1 | **Belum Diuji** | jalur in-process lulus (Probe 5, `CheckoutTest`) |
| QA2-26 | §12.24 | Throttle | 429 setelah batas | Dibatasi, bukan 500 | Keamanan dasar | P3 | **Belum Diuji** | middleware terpasang (routes/admin.php:144) |

### Ringkasan per status dan prioritas

| Status | P0 | P1 | P2 | P3 | Total |
|---|---|---|---|---|---|
| Lulus | 9 | 7 | 3 | 0 | 19 |
| Lulus (statis) | 0 | 3 | 0 | 0 | 3 |
| Gagal | 0 | 0 | 0 | 0 | 0 |
| Terblokir | 0 | 0 | 0 | 0 | 0 |
| Belum Diuji | 0 | 2 | 1 | 1 | 4 |
| **Total** | **9** | **12** | **4** | **1** | **26** |

Catatan: "Lulus (statis)" dihitung Lulus karena bukti path:baris terpenuhi;
perilaku visualnya diuji terpisah di QA2-24 yang berstatus Belum Diuji.

---

## 7. Traceability Matrix

| Requirement/AC | Test Case | Cakupan | Status |
|---|---|---|---|
| Kartu (1) suite penuh | QA2-01 | 237 test, 1791 assertions | Lulus |
| Kartu (2) §12.24 mode uji tanpa jaringan | QA2-02, QA2-03, QA2-04 | 3 skenario + hitungan panggilan | Lulus |
| Kartu (2) §12.24 mode asli (seam) + efek stok | QA2-05–QA2-14 | 10 skenario | Lulus |
| Kartu (2) §12.24 otorisasi & log | QA2-12, QA2-13 | Keamanan dasar | Lulus |
| Kartu (3) t_8e89556f | QA2-15 | Statis path:baris | Lulus (statis), visual QA2-24 |
| Kartu (3) t_a98f17d4 | QA2-16 | Statis + banding pesan server | Lulus (statis), visual QA2-24 |
| Kartu (3) t_e3f68f7f | QA2-17 | Statis path:baris | Lulus (statis), visual QA2-24 |
| Kartu (4) CRUD produk + compare_price | QA2-18, QA2-19, QA2-20 | Buat, validasi, ubah | Lulus |
| Kartu (4) stok masuk/keluar | QA2-18, QA2-20 | Movement `in` dan `adjust` | Lulus |
| Kartu (4) stok berkurang saat pesanan | QA2-22 | Movement `sale` | Lulus |
| Kartu (4) stok kembali saat batal/kedaluwarsa | QA2-07, QA2-22 | Expire + batal admin | Lulus |
| Kartu (5) POST /checkout lewat test | QA2-22, QA2-25 | In-process lulus; HTTP nyata belum | Lulus sebagian |
| Laporan #1 (checkout notice) | QA2-16 | Statis | Lulus (statis) |
| Laporan #5 (sinkron pembayaran) | QA2-02–QA2-15 | Fungsional + UI | Lulus |
| Laporan #6 (e2e produk/stok) | QA2-18–QA2-22 | E2E HTTP | Lulus |
| Laporan #7 (pintu Daftar) | QA2-17 | Statis | Lulus (statis) |
| Midtrans asli | QA2-23 | — | Belum Diuji |
| Browser visual/aksesibilitas | QA2-24 | — | Belum Diuji |
| Throttle 429 | QA2-26 | — | Belum Diuji |

Tidak ada acceptance criterion pada kartu yang sama sekali tidak dipetakan.
Yang belum tercakup adalah lingkungan (kredensial, browser, server), bukan
requirement yang terlewat.

---

## 8. Hasil Eksekusi

### 8.1 Suite penuh

```
php artisan test
Tests:    237 passed (1791 assertions)
Duration: 70.11s
exit 0
```

Log lengkap: `docs/bukti-qa-t_43d8bcd7.txt` SECTION 1. Suite juga dijalankan
lewat `vendor/phpunit/phpunit/phpunit` dengan hasil sama (237 test).

### 8.2 Test terarah (72 test)

Mencakup `AdminSyncPaymentTest` (12), `PaymentModeTest`, `QrisExpiryTest`,
`AdminMasterDataTest`, `AdminSalesTest`, `CatalogIndexTest`,
`CatalogShowTest`, `ProductPricingTest` → **72 passed, 669 assertions**.

### 8.3 Probe E2E produk + stok (5 test, di luar repo)

Menutup celah yang tidak ada di suite repo:

1. Admin POST `/admin/produk` → `compare_price` 129000 tersimpan, stok 4 +
   movement `in`; katalog `/produk` dan detail `/produk/{slug}` memuat
   `compare_price` 129000 (probe baris 98–123).
2. `compare_price` 89000 dan 80000 (sama / lebih kecil) ditolak dengan pesan
   kontrak; tidak ada produk dibuat (baris 125–145).
3. PUT `/admin/produk/{id}` → `compare_price` 99000, stok 7, movement `adjust`
   +3 (baris 147–183).
4. `is_active=false` → detail 404, produk hilang dari katalog (baris 185–213).
5. Checkout 2 pcs → stok 2 + movement `sale`; batal admin → stok 4 + movement
   `in` (baris 215–263).

Probe memakai `RefreshDatabase` + sqlite `:memory:` dan data `[CONTOH]`; tidak
menyentuh database pemilik. Nomor baris di atas merujuk sumber probe sebelum
preamble arsip (preamble 4 baris ada di berkas `docs/`).

### 8.4 Verifikasi statis perbaikan UI

- **t_8e89556f:** `SyncPaymentButton.jsx:45-63` `form.patch` URL literal tanpa
  body; `:69-76` Button secondary `min-w-[16rem]` + `loading`;
  `:79` satu InlineNotice hasil; `Show.jsx:231-232` tombol hanya bila
  `payment` ada; `Show.jsx:58-78` Toast halaman ditekan saat flash sinkron.
- **t_a98f17d4:** `Checkout.jsx:43-78` validate klien; 16 pesan server di
  `CheckoutRequest.php:40-56` tercermin; `:173-192` notice + tombol
  "Perbaiki kolom"; `:235` dan `:405` dua penempatan; `:81-95` gulir
  `scrollIntoView` menghormati reduced motion; `:136-140` gulir otomatis galat
  server; `:242` `noValidate`; `:402` CTA disabled saat processing/keranjang kosong.
- **t_e3f68f7f:** `Header.jsx:113-119` (tamu ≥md), `PublicLayout.jsx:90-99`
  (drawer, Daftar primary + Masuk secondary), `Login.jsx:98-104`,
  `Register.jsx:141-147`; semua href literal `/register` dan `/login`.

---

## 9. Bug Report

**Tidak ada defect baru (0 Critical/High/Medium).** Semua perilaku yang diuji
sesuai kontrak dan lulus. Berikut observasi non-blocking agar tercatat; tidak
satu pun mengubah keputusan rilis.

### OBS-1 (P3) — Pesan `customer_city.max` tidak ada di `messages()` server

- **Komponen:** Backend (validasi), dampak UI.
- **Lokasi:** `app/Http/Requests/CheckoutRequest.php:28` (aturan `max:100`),
  `:40-55` (daftar pesan tanpa `customer_city.max`);
  `resources/js/Pages/Public/Checkout.jsx:69` (klien punya pesan
  "Kota/kecamatan maksimal 100 karakter.").
- **Hasil aktual:** Klien mencegat >100 karakter dengan pesan Indonesia;
  bila klien dilewati (mis. POST langsung), server memakai pesan bawaan
  framework untuk `max`, bukan pesan klien.
- **Hasil diharapkan:** Pesan server dan klien sama untuk aturan yang sama.
- **Frekuensi:** Hanya jalur non-JS/HTTP langsung; bukan alur normal.
- **Dampak:** Kosmetik/konsistensi; validasi tetap menolak.
- **Rekomendasi:** Tambahkan satu baris `customer_city.max` di `messages()`
  saat backend menyentuh berkas itu. Kartu perbaikan: **`t_447ac98c`**
  (assignee backenddeveloper, P3, non-blocking).
- **Status:** Terbuka (non-blocking), kartu `t_447ac98c`.

### OBS-2 (P3) — Celah cakupan test repo untuk `compare_price`/update/deaktivasi

- **Komponen:** Test/QA (bukan kode aplikasi).
- **Lokasi:** `tests/Feature/Admin/AdminMasterDataTest.php:112-144` hanya
  menguji validasi umum create; tidak ada test `compare_price`, update produk,
  atau deaktivasi. `tests/Feature/Catalog/CatalogIndexTest.php:346-358` dan
  `CatalogShowTest.php:123-134` hanya memeriksa prop.
- **Hasil aktual:** Perilaku terbukti benar lewat probe QA2 (5 test), tetapi
  tidak ada regresi otomatis di suite repo.
- **Dampak:** Regresi di masa depan bisa lolos suite.
- **Rekomendasi:** Promosikan `docs/probe-qa-t_43d8bcd7.php.txt` menjadi
  `tests/Feature/Admin/AdminProductCrudTest.php` + satu test E2E
  checkout→batal. Sesuai aturan kartu, QA tidak mengubah `tests/`; usulkan
  kartu lanjutan kepada Tech Lead.
- **Status:** Terbuka (non-blocking).

### Risiko operasional (bukan defect)

`isFake()` menganggap `server_key` kosong sebagai mode uji
(`app/Services/MidtransService.php:96-99`), dan perilaku ini memang
didokumentasikan (`docs/catatan-backend.md:531`). Artinya produksi tanpa
`MIDTRANS_SERVER_KEY` tidak akan pernah menyinkronkan pembayaran asli. Sudah
dijaga oleh tampilan mode di admin; tidak perlu kartu baru.

---

## 10. Hasil Non-Fungsional dan Batasan

| Aspek | Hasil | Catatan |
|---|---|---|
| Keamanan dasar | Lulus terbatas | Otorisasi route diuji; log tanpa rahasia; tidak ada penetration test |
| Aksesibilitas | Belum Diuji, butuh browser | Keyboard, fokus, kontras, zoom 200% belum diukur |
| Responsif | Belum Diuji, butuh browser | 360/768/1024/1280 px |
| Performa | Belum Diuji | Tidak ada pengukuran LCP/Lighthouse; di luar alat sesi ini |
| Kompatibilitas | Belum Diuji | Tidak ada browser/device |
| Integrasi Midtrans nyata | Belum Diuji | Butuh kredensial pemilik (kartu `t_fcfc3687`) |
| Server HTTP nyata | Belum Diuji | Server tidak dinyalakan; jalur diuji in-process |

Batas cakupan: hasil ini bukan penetration test, load test, atau audit
aksesibilitas profesional. Tidak ada klaim LCP < 2,5 detik atau Lighthouse ≥ 85.

---

## 11. Self-Review Checklist

- [x] Semua acceptance criteria kartu dipetakan ke test case atau gap dicatat.
- [x] Area risiko tinggi (pembayaran, stok, otorisasi) diprioritaskan.
- [x] Negatif, boundary, edge case, otorisasi, dan state UI dipertimbangkan.
- [x] Pengujian memakai arsitektur Inertia/route yang benar-benar ada
      (`/produk`, `/keranjang`, `/checkout`, `/admin/produk`,
      `/admin/pesanan/{id}/sinkron-pembayaran`).
- [x] Tidak ada klaim pengujian yang belum dieksekusi; 4 kasus berstatus
      Belum Diuji dengan alasan.
- [x] Observasi punya path:baris dan dampak.
- [x] Tidak ada file di luar `docs/` yang diubah; `.env` tidak dibaca/diubah.
- [x] Known issues, keterbatasan environment, dan risiko tersisa dicatat.
- [x] Keputusan Go/No-Go punya alasan berbasis bukti.

---

## 12. Rekomendasi Go/No-Go

**GO BERSYARAT untuk lingkup kartu `t_43d8bcd7`.**

Alasan:
- Tidak ada defect Critical/High/Medium; seluruh P0 lulus (9/9).
- Suite penuh 237 test hijau, termasuk 12 test sinkron pembayaran dan seluruh
  regresi checkout/katalog/admin.
- Empat butir laporan pemilik (#1, #5, #6, #7) terbukti secara fungsional atau
  statis.

Syarat yang harus dicatat sebelum rilis penuh:
1. **Midtrans asli** — jalankan kartu `t_fcfc3687` (kredensial sandbox,
   `MIDTRANS_FAKE=false`) dan ulangi QA2-23. Tanpa ini, integrasi pembayaran
   nyata belum terbukti.
2. **Verifikasi visual browser** — QA2-24 (360/768/1024/1280, keyboard, zoom,
   kontras) oleh frontend/QA dengan browser.
3. **Promosikan probe** ke suite repo (OBS-2) agar e2e produk/stok menjadi
   regresi otomatis.

Jika ketiga syarat belum dipenuhi, rilis boleh berjalan hanya bila Tech Lead
menerima risiko "integrasi Midtrans nyata dan UI visual belum diverifikasi"
secara eksplisit. Keputusan final tetap milik Tech Lead.

---

## 13. Verifikasi Ulang oleh Run Penyelesaian (attempt 2, 22 Oktober 2026)

Run pertama (attempt 1) menulis §1–§12 lalu berhenti karena crash sesi
(`exit 130`), bukan karena ada test gagal. Run penyelesaian ini menjalankan
**ulang dari nol** seluruh perintah eksekusi pada workspace yang sama untuk
membuktikan angka di §8 bukan warisan yang tidak terverifikasi. Detail perintah
dan keluaran ada di `docs/bukti-qa-t_43d8bcd7.txt` SECTION 7.

| Perintah | Hasil nyata (run 2) | Sama dengan §8? |
|---|---|---|
| `php artisan test` | 237 passed (1791 assertions), 63,10 s, exit 0 | Ya |
| PHPUnit terarah 8 berkas | OK (72 tests, 669 assertions), exit 0 | Ya |
| `--filter AdminSyncPaymentTest` | OK (12 tests, 55 assertions), exit 0 | Ya |
| Probe E2E `ProdukStokE2ETest` | OK (5 tests, 46 assertions), exit 0 | Ya |
| `--filter CheckoutTest` (tambahan) | OK (19 tests, 215 assertions), exit 0 | Bukti tambahan QA2-25 |

Temuan tambahan dari run ini: **tidak ada**. Pemeriksaan ulang path:baris pada
§8.4 (kontrak §12.24, `SyncPaymentButton.jsx`, `Show.jsx`, `Checkout.jsx`,
`CheckoutRequest.php`, empat berkas pintu Daftar, `routes/admin.php`) cocok
dengan yang dilaporkan; `CheckoutRequest.php:39-56` memang masih tanpa
`customer_city.max`, jadi OBS-1 tetap berlaku dan sudah punya kartu
`t_447ac98c` (backenddeveloper, P3).

Klarifikasi cakupan untuk QA2-25: yang berstatus **Belum Diuji** adalah POST
`/checkout` ke server HTTP yang benar-benar berjalan (butuh `php artisan serve`
+ curl/browser). Jalur server Laravel-nya sendiri sudah dieksekusi lewat 19
test `CheckoutTest` + probe (semua memanggil `post('/checkout', ...)`), jadi
yang belum terbukti hanyalah lapisan transport/HTTP nyata, bukan controller.

Status kartu turunan:
- `t_447ac98c` — OBS-1, dibuat oleh QA ini, assignee `backenddeveloper`, P3.
- `t_fac8f5a3` — devops (build beku + langkah deploy), dibuat Tech Lead,
  menunggu kartu ini selesai.
- OBS-2 (promosikan probe ke `tests/Feature/...`) **belum dibuatkan kartu**:
  penulis test yang tepat adalah QA sendiri, dan protokol melarang menugaskan
  tindak lanjut ke diri sendiri. Diusulkan ke Tech Lead sebagai kartu QA
  terpisah setelah rilis; sampai itu terjadi, regresi `compare_price`/update/
  deaktivasi produk hanya terjaga oleh probe di berkas bukti.

**Kesimpulan tidak berubah: GO BERSYARAT** dengan tiga syarat pada §12 dan
batas cakupan pada §10 (Midtrans asli, visual browser, promosi probe).

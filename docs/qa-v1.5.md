# QA v1.5 — opsi ekspedisi, webhook, filter riwayat, timeline

Kartu: `t_31b212fb`. Tanggal: 26 Okt 2026. Acuan: `docs/brief-v1.5-qa.md`,
`docs/ringkasan-v1.5.md`, `docs/design-v1.5.md`, `docs/kontrak-props.md` §7.9/§7.12/§13,
`docs/PRD-v1.3.md` §2.

Kesimpulan: **B1, B2, B3, F1 (logika), F2 (logika), dan regresi v1.4 lulus** di test otomatis,
build, dan pemeriksaan kode. **Tidak ada bug Critical/High/Medium yang ditemukan** — 1 catatan Low
(semantik dedupe, bukan pelanggaran kontrak). Yang butuh browser (tampilan 360 px, fokus/ikon,
pengumuman live region) dan webhook Biteship nyata **belum diuji** sesuai izin brief.

## 1. Lingkungan uji

- Repo: `C:/Users/LENOVO/Downloads/toko-kulot`, Windows 11 + Git Bash. PHP 8.3.32, PHPUnit 11.5.57.
- `phpunit.xml` memakai sqlite `:memory:`; DB MySQL pemilik tidak disentuh. QA tidak menyalakan
  server, tidak migrate/seed, tidak mengubah `.env`.
- `php artisan test` tidak bisa dipakai di shell non-tty (`stdin is not a tty`); dijalankan
  `php vendor/phpunit/phpunit/phpunit < /dev/null` dengan `PHP_INI_SCAN_DIR` ke scratch berisi
  `extension=pdo_sqlite,sqlite3` (ekstensi tidak dimuat `php.ini` default). Perilaku uji sama.
- Perintah yang benar-benar dijalankan:

```
php vendor/phpunit/phpunit/phpunit --filter='OngkirV15OpsiTest|HistoryFilterV15Test|BiteshipWebhookTest|BiteshipWebhookExceptionJsonTest|TimelineV14Test|AdminSalesTest|OngkirV14Test|CheckoutShippingTest|HistoryTest|RouteContractTest'
  -> OK (83 tests, 852 assertions)            docs/bukti-qa-v1.5-test.txt
php vendor/phpunit/phpunit/phpunit            # suite penuh
  -> OK (373 tests, 3172 assertions)
npm run build                                 # di file bukti yang sama
  -> ✓ built in 2.97s                          docs/bukti-qa-v1.5-suite.txt
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8000/ ...
  -> / 200 · /kontak-kami 200 · /history 302 (guest→login)
     GET /biteship/webhook 200 · POST body benar-benar kosong 200 {"status":"ok","success":true}
     POST '{}' + header token salah 403 {"message":"invalid token"} (token .env terpasang)
grep -c 'type="radio"' resources/js/Pages/Public/Checkout.jsx           -> 0
grep -n 'Pilih layanan pengiriman dulu.' resources/js/Pages/Public/Checkout.jsx -> :527
```

- Sesi uji HTTP pembeli dari QA sebelumnya sudah kedaluwarsa (`/history` → 302), jadi verifikasi
  props ber-login memakai feature test Inertia, bukan curl. Tidak ada kredensial di laporan ini.

## 2. Hasil per fitur

### B1 — `services()` menerima bentuk lama & array: LULUS

| Yang diminta brief | Bukti | Status |
|---|---|---|
| Bentuk string lama `"jne:reg"` dipakai, bukan default | `BiteshipService::serviceRow()` `app/Services/BiteshipService.php:289-315`; test `OngkirV15OpsiTest::test_baris_string_lama_dipakai_bukan_default` | Lulus |
| Bentuk array `{courier_code,service_code,label,is_regular,is_active}` | `test_baris_array_tetap_diterima` (label `JNE REG`, `is_regular=true`) | Lulus |
| Dedupe beda huruf (`jne:reg`, `JNE:REG`, `Jne/REG`) → 1 | `BiteshipService.php:264` (`strtolower(courier:service)` + `$sudah`), `test_duplikat_beda_huruf_dibuang` | Lulus |
| Hanya layanan aktif di `opsi` | `BiteshipService.php:279` (`array_filter is_active`) + `rates()`; `test_hanya_baris_aktif_tampil` | Lulus |
| Default hanya bila tidak ada baris sah | `BiteshipService.php:250-283` (fallback `DEFAULT_COURIERS` setelah semua baris invalid); `test_default_dipakai_bila_tidak_ada_baris_sah` | Lulus |
| Urutan `courier_name` lalu `service_name` | `BiteshipService.php:324` `usort`; `test_opsi_urut_nama_kurir_lalu_layanan` → `ANTERAJA REG, JNE OKE, JNE REG` | Lulus |
| Log layanan aktif tanpa tarif, tanpa token | `BiteshipService.php:433` (`warning 'Biteship layanan aktif tanpa tarif'`, konteks hanya `layanan`); `test_log_layanan_aktif_tanpa_tarif_tanpa_token` memeriksa kunci konteks **dan** tidak ada `test-biteship-key` | Lulus |
| Regresi `quote()` + checkout mode fake | `OngkirV14Test` (8 test), `CheckoutShippingTest` (10 test, termasuk `test_mode_fake_mengembalikan_tarif_datar_dan_gratis_reguler`, `test_ongkir_dari_form_tidak_dipercaya`) | Lulus |

Catatan (bukan bug): dedupe dilakukan **sebelum** filter aktif, jadi bila baris pertama
`jne:reg` nonaktif dan duplikat keduanya aktif, layanan disembunyikan. Ini sesuai design §1
("duplikat: yang pertama dipakai"), hanya perlu diingat pemilik saat menyunting
`settings.shipping_couriers` lewat UI.

### B2 — token webhook: LULUS (lokal), webhook Biteship nyata belum diuji

| Yang diminta brief | Bukti | Status |
|---|---|---|
| Token di header kustom lolos | `BiteshipWebhookController::tokenMasuk()` `app/Http/Controllers/BiteshipWebhookController.php:79-104` (semua header jadi kandidat, `hash_equals`); `BiteshipWebhookTest::test_token_di_header_kustom_apa_punya_diterima` | Lulus |
| `?token=` lolos | `:83-87`; `test_token_salah_ditolak_403` baris 286 (`?token=rahasia-uji` → 200, status maju) | Lulus |
| Token salah → 403 JSON + status tidak berubah | `:39-47`; `test_token_salah_ditolak_403` (status tetap `dibayar`) dan `BiteshipWebhookExceptionJsonTest::test_token_salah_tetap_403_json` (`{"message":"invalid token"}`, `content-type: application/json`) | Lulus |
| `BITESHIP_WEBHOOK_TOKEN` kosong menerima | `config/biteship.php` (`webhook_token` dari env) + `:95-104`; `test_token_kosong_menerima_header_apa_pun` | Lulus |
| Log tidak memuat nilai token | `:39-44` hanya `'header' => array_keys(...)` + `'query_token' => bool`; `:49-53` hanya sumber token. Tidak ada nilai token di log mana pun (inspeksi `Log::` baris 28/39/49/58) | Lulus (inspeksi kode) |
| Probe body kosong tetap 200 | `:24-31` sebelum cek token; `test_probe_instalasi_post_body_kosong_dibalas_ok_tanpa_cek_token`; live `POST /biteship/webhook` body benar-benar kosong → 200 `{"status":"ok","success":true}`; body `{}` → 403 karena bukan probe | Lulus |
| Body rusak → 422 JSON, exception → 500 generik | `BiteshipWebhookExceptionJsonTest` (5 test: `internal error` tanpa SQL/trace/`base_path`, HTTP exception, token salah 403, body bukan JSON 422, halaman lain tetap 404 bukan pesan webhook) | Lulus |
| Webhook Biteship nyata (tunnel + dashboard) | butuh akun/tunnel milik pemilik | **Belum diuji, butuh webhook Biteship** |

### B3 — filter `?status=` dan payload `timeline`: LULUS

| Yang diminta brief | Bukti | Status |
|---|---|---|
| `?status=` memfilter | `HistoryController.php:31-39` (`is_string` + `in_array` status sah → `where`); `HistoryFilterV15Test::test_filter_hanya_mengembalikan_status_itu` (2 dari 4, urut terbaru dulu, `meta.total` 2) | Lulus |
| Nilai asing/berulang diabaikan | `HistoryController.php:32-35`; `test_status_asing_atau_berulang_diabaikan` (`ngawur`, `` kosong, `status[]=selesai` → `filter.status` null, 3 baris) | Lulus |
| Paginasi mempertahankan filter | `HistoryController.php:37-47` (`withQueryString`); `test_halaman_kedua_mempertahankan_status_di_tautan` (page 2, 2 baris, link memuat `status=selesai`) | Lulus |
| `ringkasan` tetap global (tidak ikut filter), per user | `HistoryController.php:50-60`; `test_ringkasan_tetap_global_saat_filter_dipakai` (filter `batal` → 1 baris, `ringkasan.total` 4, pesanan pembeli lain tidak masuk) | Lulus |
| Payload `checkout.success` memuat `timeline` 4 kunci | `CheckoutController.php:375-380`; `test_payload_halaman_selesai_memuat_timeline_empat_kunci` (`created_at/paid_at/shipped_at/completed_at` + bentuk lama `pesanan.created_at/paid_at` tetap ada) | Lulus |

### F1 — checkout pakai `Select` + `optgroup`: LULUS (logika & struktur), visual belum diuji

| Yang diminta brief | Bukti | Status |
|---|---|---|
| `Select` + `optgroup`, tanpa radio ongkir | `Checkout.jsx:777-800` (`Field` + `Select#pilih-layanan` + `optgroup label={courier_name}`); `grep 'type="radio"' Checkout.jsx` → **0** | Lulus (statis) |
| Label & hint | `Checkout.jsx:777-780` (`label="Pilih layanan pengiriman"`, `hint="Tarif untuk kode pos …"`), `aria-describedby="pilih-layanan-hint"` cocok dengan `Field` (`Field.jsx` membuat `id={`${htmlFor}-hint`}`) | Lulus (statis) |
| Nilai opsi `courier_code|service_code`, dicocokkan per kode | `Checkout.jsx:432` (`nilaiOpsi`), `:435-438` (`cariOpsi`), `:795-798`; tanpa `:` dan tanpa sort klien (`grep '.sort('` → 0) | Lulus (statis) |
| Pilihan mengirim tiga field | `Checkout.jsx:424-428` → `shipping_courier`, `shipping_service`, `shipping_cost` (`gratis === true` → 0); server memakai tarif server dan menolak tarif kiriman yang beda: `CheckoutShippingTest::test_gratis_ongkir_hanya_untuk_layanan_reguler`, `test_ongkir_dari_form_tidak_dipercaya` | Lulus |
| State `menunggu/memuat/kosong/galat/timeout/galatKonfig` utuh | `SkeletonOpsi` `:108` dipakai `:746`; `kosong` `:765-772`; `timeout` + `Coba lagi` `:757-763`; `galatKonfig` tetap jadi guard di semua cabang; select hanya dirender saat `siap && opsi.length > 0` (`:774`) | Lulus (statis) |
| Tolak submit tanpa pilihan (mode API) | `:527` `Pilih layanan pengiriman dulu.`; mode fake tetap boleh submit (`:199`, `:527`) | Lulus (statis) |
| `npm run build` | `✓ built in 2.97s`, `Checkout-Bp-vSKYO.js` 18.76 kB | Lulus |
| Tampilan 360 px, cincin fokus, pengumuman `role="status" aria-live` | perlu browser | **Belum diuji, butuh browser** |

### F2 — timeline berikon + filter riwayat: LULUS (logika & struktur), visual belum diuji

| Yang diminta brief | Bukti | Status |
|---|---|---|
| Komponen bersama, props `{status, paymentStatus, timeline}` | `resources/js/Components/TimelinePesanan.jsx:23-40`; dipakai `History.jsx:385-389` dan `CheckoutSuccess.jsx:194-198` | Lulus (statis) |
| Ikon 20 px per node, node bahaya tetap titik merah | `TimelinePesanan.jsx:8` `IKON = {created:BoxIcon, paid:WalletIcon, shipped:TruckIcon, completed:CheckIcon}`, render `:44-84`; `timeline` null → 4 node redup, tanpa crash (`time: timeline?.x ?? null`) | Lulus (statis) |
| Kartu "Status pesanan" sebelum Ringkasan di halaman selesai | `CheckoutSuccess.jsx:194-198` (`aria-labelledby="judul-status-pesanan"`, hanya props `timeline`); kartu hilang bila `pesanan.timeline` null | Lulus (statis) |
| Filter mengubah daftar **dan** URL, selalu halaman 1 | `History.jsx:475-477` `ubahFilter` → `router.get('/history', {status}|{}, {preserveState, preserveScroll})`; `ambil()` `:438-459` | Lulus (statis) |
| Nilai awal dari props (`null` → `semua`), tanpa state lokal | `History.jsx:507` `value={filter?.status ?? 'semua'}`; opsi + hitungan dari `ringkasan` `:505-518` | Lulus (statis) |
| Paginasi membawa status, tanpa `page` bila 1 | `History.jsx:462-471` | Lulus (statis) |
| Halaman kosong per filter + reset, kosong total tetap `Belum ada pesanan.` | `History.jsx:552-566` (`Tidak ada pesanan pada filter ini.` + `Tampilkan semua pesanan`); kontrol filter tidak dirender bila `filter` absen atau `ringkasan.total === 0` (`:426-427`) | Lulus (statis) |
| `teksHasil` 3 keadaan | `History.jsx:428-432` | Lulus (statis) |
| `timeline` null tidak crash | `TimelinePesanan.jsx:25-28` opsional-chaining; props riwayat dari `HistoryController.php:120` | Lulus (statis) |
| Build | `✓ built in 2.97s` (`History-DFudqNEb.js` 12.09 kB, `CheckoutSuccess-Bi5KmxFc.js` 10.99 kB) | Lulus |
| Visual 360 px/ikon, keyboard Select, back/forward | perlu browser + akun uji | **Belum diuji, butuh browser** |

### Regresi v1.4: LULUS

- `BiteshipWebhookTest`: 403/422/200, idempoten (`test_event_ganda_idempoten`), status tidak mundur,
  `price` tidak mengubah uang/stok, kurir bermasalah tidak membatalkan pesanan.
- `TimelineV14Test`: `shipping.events` (maks 50, label, terbaru dulu), `completed_at` saat
  `delivered`, `completed_at` null tanpa delivered, halaman selesai memuat events.
- `AdminSalesTest::test_rute_ubah_status_manual_sudah_dihapus` + `routes/admin.php:142`
  (komentar penghapusan v1.4) → rute manual tetap tidak ada.
- Suite penuh 373 test hijau: tidak ada regresi di katalog, keranjang, checkout, admin, ulasan.

## 3. Daftar kartu temuan

Tidak ada kartu perbaikan dibuat: tidak ditemukan defect yang melanggar brief, design, kontrak,
atau PRD.

Catatan Low (tanpa kartu, cukup diketahui pemilik): semantik dedupe B1 memakai baris **pertama**,
jadi duplikat nonaktif di depan menutup duplikat aktif di belakang. Sesuai design §1; bukan bug.

Catatan lingkungan: `php artisan test` gagal di shell non-tty; gunakan perintah phpunit di §1.
Bukan defect aplikasi.

## 4. Sisa bug / risiko

- **Belum diuji, butuh browser**: tampilan dropdown & ringkasan pilihan di 360 px, cincin fokus
  `Select`, pengumuman `role="status" aria-live` (F1); ikon timeline 20 px di 360/768 px, keyboard
  filter, back/forward (F2). Tidak ada browser/akun uji pada run ini.
- **Belum diuji, butuh webhook Biteship**: token asli dari dashboard Biteship, event `order.status`
  nyata, dan probe instalasi dari server Biteship. Semua jalur sudah diuji lokal dengan payload
  tiruan.
- Risiko produk: label filter (`LABEL_FILTER`) adalah teks klien satu-satunya (design §6.1) dan
  harus tetap sama dengan `Order::statusLabel`; saat ini 6 label cocok (`pending…batal`), tetapi
  perubahan label server kelak tidak otomatis ikut ke filter.

## 5. Rekomendasi

**GO** untuk v1.5 pada cakupan yang diuji: tidak ada Critical/High terbuka, semua item P0
(opsi ekspedisi, token webhook, filter + timeline) lulus otomatis, build hijau, suite penuh hijau.
Syarat: verifikasi visual 360 px/ikon dan webhook Biteship nyata dilakukan pemilik atau QA
berikutnya sebelum rilis publik; bila belum, risiko tampilan tetap kecil karena perubahan UI hanya
mengganti radio menjadi `Select` native + ikon dekoratif `aria-hidden`.

# Review akhir v1.3 — webhook Biteship (F9) & akses tunnel (F10)

Kartu `t_b20fca2d` · 25 Okt 2026 · Assignee techlead · Lingkup: `docs/PRD-v1.3.md` §2–§4,
`docs/design-v1.3.md`, `docs/qa-v1.3.md`, `docs/catatan-*.md`, working tree v1.3.
Aturan yang saya patuhi: hanya menulis `docs/`, tidak memperbaiki kode, tidak menjalankan
artisan/migrate/composer/npm, `.env` tidak dibaca/diubah.

## 1. Keputusan

| Bagian | Keputusan | Alasan singkat |
|---|---|---|
| F10 — halaman kosong lewat tunnel | **LULUS, boleh dirilis** | Saya ulang sendiri: HTTP 200 (26.965 B), hanya `/build/assets/...`, favicon https, 0 kemunculan `5173`, dan toko **tampil di browser** (React ter-mount). |
| F9 — webhook Biteship | **NO-GO sekarang**, GO BERSYARAT | Kode lulus (suite 339/2815 OK saya jalankan sendiri), tetapi 3 syarat operasional pemilik belum terpenuhi: migrasi `000005`, token webhook, `APP_DEBUG=false`. Tanpa itu webhook 500 / terbuka tanpa autentikasi. |
| Rilis keseluruhan v1.3 | **Belum boleh diumumkan** | F9 adalah isi utama addendum; F10 saja boleh naik lebih dulu. |
| Keputusan rilis akhir | **Pemilik** | Syarat dan bukti ada di §7. |

## 2. Yang saya periksa sendiri (bukan mengutip QA)

- `PHP_INI_SCAN_DIR=<scratch sqlite> php vendor/phpunit/phpunit/phpunit --filter='BiteshipWebhook|ShippingPropsV13'`
  → **OK (18 test, 230 assertion)**, 1,2 s. Sama dengan klaim QA (10+8 test, 62+168 assertion).
- Suite penuh `vendor/phpunit/phpunit/phpunit` → **OK (339 test, 2815 assertion)**, 38,4 s.
- `curl` ke tunnel: `/` → 200 `text/html` 26.965 B; `src="https://<tunnel>/build/assets/app-C0fClxZc.js"`;
  favicon `https://`; `grep -c 5173` = 0; `public/hot` tidak ada; `public/build/manifest.json` ada.
- `POST /biteship/webhook` lewat tunnel: `?token=salah-review13` + order acak → **200 JSON**,
  body rusak → **422 JSON**, event tak dikenal → **200 JSON**. Tidak ada baris yang berubah
  (order tak dikenal).
- Browser (Chrome via alat browser): halaman tunnel menampilkan interstitial ngrok milik pengunjung
  ("Visit Site"), setelah dilanjutkan judul `Liiora.id | …` dan isi toko ter-render (header, hero,
  CTA). F10 "halaman tampil normal di browser" terverifikasi.
- Baca kode + diff: `BiteshipWebhookController.php`, `BiteshipWebhookService.php`,
  `BiteshipService.php:510-660`, `Admin/OrderController.php:275-276,328`, `HistoryController.php:104-109`,
  `CheckoutController.php:368-373`, `bootstrap/app.php:25,36-38,41-43`, `routes/web.php:152-154`,
  `config/biteship.php:15`, migrasi `2026_10_24_000005…`, `Order.php:185-186,202-203`, empat komponen React.
- Tidak saya ulang (aturan kartu): `php artisan migrate:status`, query DB pemilik, uji beban,
  login admin/pembeli. Lihat §5.

## 3. Lulus (dengan bukti)

| Butir | Hasil | Bukti |
|---|---|---|
| Peta status hanya maju, sesuai PRD §2.3 | Lulus | `app/Services/BiteshipWebhookService.php:166-178` (`dibayar`/`diproses` + `picked|dropping_off|delivered` → `dikirim`; `dikirim` + `delivered` → `selesai`; lainnya `null`); `shipped_at` hanya bila kosong `:155-157` |
| Status kurir bermasalah tidak membatalkan pesanan / stok | Lulus | `:26,163-165`; tidak ada penulisan stok di jalur webhook; `Order` tanpa observer/`booted` (grep kosong) |
| Idempoten (PRD §2.4) | Lulus | penugasan nilai bukan penambahan `:97-120`; test `tests/Feature/Checkout/BiteshipWebhookTest.php:195`; `dikirim`+`picked` → `nextOrderStatus` `null` (`:173`) sehingga `shipped_at` tidak bergeser |
| Keamanan token | Lulus (kode) | `hash_equals` + trim, query atau header `BiteshipWebhookController.php:20-28`, `BiteshipWebhookService.php:34-47`; kosong → diterima + `Log::info` `:38-43`; test 403 `BiteshipWebhookTest.php:273` |
| Tidak memutasi `payments`/stok/`total`/`shipping_cost` | Lulus | hanya `shipping_*`, `status`, `shipped_at` yang di-`forceFill` `BiteshipWebhookService.php:97-120`; test `BiteshipWebhookTest.php:132-190` (assert `gross_amount`, `total`, stok, `StockMovement::count()` = 0) |
| Pemisahan props admin vs pembeli | Lulus | admin `shippingInfoAdmin()` `BiteshipService.php:550-557` dipakai `Admin/OrderController.php:328`; daftar `shipping_updated_at` + `shipping_perlu_tindakan` `Admin/OrderController.php:275-276`; pembeli `shippingInfo()` + `galat=null` `HistoryController.php:104-109`, `CheckoutController.php:368-373` — tanpa `price_final`/`price_selisih`/`webhook_terakhir` (test `ShippingPropsV13Test.php:221,241`) |
| UI pembeli tidak merender data admin | Lulus | `CheckoutSuccess.jsx:44-49,242-281`; `History.jsx:235-239,341-358` (tanpa `tindakan`/`perlu_tindakan`; tautan lacak hanya http(s) + `rel="noopener noreferrer"`) |
| Panel & daftar admin sesuai design-v1.3 (kecuali F-13-04) | Lulus | notice warning di atas `dl` `InfoResi.jsx:143-149`; fallback `Periksa status pengiriman pesanan ini.` `:145`; payload `<details>` / `Belum ada payload webhook.` `:219-228`; badge + timestamp `Index.jsx:200,219-228`; selisih 0/null tidak dirender `InfoResi.jsx:43-56,205-213` |
| Migrasi & skema ada di kode; kolom `Order` di-cast | Lulus | `database/migrations/2026_10_24_000005_add_shipping_webhook_columns_to_orders_table.php:19-20`; `docs/db.md:38,101`; `app/Models/Order.php:185-186,202-203` |
| Dokumen pendukung diperbarui (DoD PRD §2.7) | Lulus | `docs/kontrak-props.md:753,799,1958,2094,2108`; `docs/catatan-backend.md:1700+`; `docs/catatan-devops.md:391+`; `docs/catatan-frontend.md:600-620` |
| F10: tanpa Vite dev, aset build, favicon https | Lulus | §2 (curl + browser sendiri); `bootstrap/app.php:25` hanya loopback; `public/hot` tidak ada |

## 4. Gagal / terbuka

### F-13-01 — Blocker — migrasi `000005` belum dijalankan di DB pemilik (tindakan pemilik)

`docs/qa-v1.3.md:108-123`. Konsisten dengan kode: webhook selalu menulis `shipping_updated_at`
(`BiteshipWebhookService.php:97`) sehingga tanpa kolom → SQLSTATE 42S22 → 500, tanpa rollback data.
Saya tidak mengulang `migrate:status`/query DB (artisan dan DB pemilik di luar batas techlead).
Perbaikan: `php artisan migrate` (PRD §4 butir 4). Tidak ada perubahan kode.

### F-13-03 — Mayor — `BITESHIP_WEBHOOK_TOKEN` kosong di runtime (tindakan pemilik)

Saya buktikan ulang 25 Okt: `POST …/biteship/webhook?token=salah-review13` → **200** (harus 403 bila
env terisi). Kode benar (`BiteshipWebhookService.php:34-47`, test 403 lulus). Selama kosong, siapa pun
yang tahu `biteship_order_id` dapat memajukan status pesanan dan menulis `shipping_*`.
Perbaikan: isi env + daftarkan URL bertoken (PRD §4 butir 2–3).

### F-13-02 — Mayor — `APP_DEBUG` terbuka pada akses publik (tindakan pemilik/ops)

`docs/qa-v1.3.md:125-135`: 500 ber-`text/html` membocorkan SQL, nama kolom, detail koneksi, jejak
berkas. Saya tidak memicu error ulang (butuh memaksa exception di server pemilik). Perbaikan:
`APP_DEBUG=false` (+ `APP_ENV=production`) untuk lingkungan yang diekspos tunnel.

### T-13-01 — Mayor (kode) — "respons selalu JSON" tidak dijamin saat exception

- Bukti: `bootstrap/app.php:41-43` — `withExceptions` kosong; route webhook ada di grup `web`
  (`routes/web.php:152-154`), jadi exception tak tertangkap dirender sebagai halaman error HTML —
  juga saat `APP_DEBUG=false` (Laravel error view). QA mencatat `text/html` pada H9.
- Melanggar PRD §2.1 ("Respons selalu JSON"). Interprestasi saya: status 500 untuk kegagalan internal
  boleh (biar Biteship mengulang), tetapi **badan harus JSON generik tanpa detail internal**.
- Tindakan: kartu perbaikan **`t_8c48f38d`** (backenddeveloper) — lihat §8. Tidak memblokir F10;
  syarat sebelum F9 dinyalakan di produksi (atau diterima tertulis oleh pemilik).

### F-13-04 — Minor (desain) — urutan/label baris panel Pengiriman

- Bukti: `docs/design-v1.3.md:24-25` menulis "urutan akhir" tanpa ETD/Berat/Ongkir tagihan;
  implementasi `InfoResi.jsx:151-214` mempertahankan baris lama + label lama (`Nomor resi`,
  `Status Biteship`).
- **Keputusan saya: TERIMA implementasi.** Alasan: PRD §2.6 aditif ("bentuk lama tidak berubah");
  ongkir tagihan wajib tetap terlihat untuk menilai "Selisih ongkir"; design §0 sendiri menyatakan
  struktur halaman tidak berubah; frontend sudah mencatat tafsiran ini
  (`docs/catatan-frontend.md:609-611`). `docs/design-v1.3.md` §1 saya perjelas (docs-only), bukan
  meminta frontend menyusun ulang.

### F-13-05 — Minor (dokumen) — path aset "relatif" vs absolut https

- Bukti: `docs/PRD-v1.3.md:125-126` menuntut `/build/assets/...` relatif; kenyataan
  `https://<tunnel>/build/assets/app-C0fClxZc.js` (curl saya).
- **Keputusan saya: kenyataan yang benar** — syarat fungsionalnya adalah tidak ada host Vite dev
  (`[::1]:5173`) dan favicon tidak mixed content; keduanya terpenuhi. Kalimat PRD §3 butir 2 saya
  perbarui (docs-only).

## 5. Belum dicek (dengan alasan)

| Butir | Alasan |
|---|---|
| B1–B2 panel & daftar admin dengan data picked/delivered/retur/selisih | Butuh login admin (kredensial pemilik) dan pesanan ber-`biteship_order_id`; techlead tidak menebak/mengetik kredensial |
| B3 riwayat pembeli & halaman selesai dengan data kirim | Butuh sesi pembeli + pesanan nyata |
| B4 responsif 360 px, keyboard, zoom 200 %; B5 kontras | Tidak ada data uji berstatus kirim; butuh sesi admin/pembeli |
| H8 token salah → 403 lewat tunnel | Tidak bisa: env token masih kosong (F-13-03). Jalur 403 lulus di test fitur |
| P1 webhook asli dari dashboard Biteship (3 event) | Hanya pemilik yang bisa memicu event nyata |
| P2 throttle 120/menit runtime | Butuh 121 request; risiko mengunci IP pemilik |
| Status migrasi di DB pemilik | `artisan`/DB dilarang untuk techlead (aturan kartu). Bukti QA + kode konsisten |
| Uji beban / pentest / rate-limit header palsu | Di luar lingkup v1.3 |

## 6. Risiko tersisa

| ID | Risiko | Bukti | Mitigasi |
|---|---|---|---|
| R1 | **Satu slot payload**: event `order.price` menghapus `driver`, event `order.status` berikutnya menghapus `price_final` → badge selisih ongkir bisa hilang | `BiteshipWebhookService.php:110-118`; `BiteshipService.php:565-579,642-660` | Sesuai PRD §2.4 (pilihan sadar). Bila mengganggu admin: kolom terpisah `shipping_driver`/`shipping_price_final` (keputusan pemilik, Q7 `docs/pertanyaan-pemilik-v1.3.md`) |
| R2 | Payload ganda menggeser `shipping_updated_at` (label "Diperbarui") | `BiteshipWebhookService.php:97` | Terima: label = waktu payload terakhir diterapkan; PRD §2.4 hanya mengunci tracking/status/`shipped_at` |
| R3 | URL ngrok gratis berubah tiap restart | `docs/catatan-devops.md` | Domain tetap untuk produksi (PRD §3) |
| R4 | Throttle 120/menit belum diuji runtime | `routes/web.php:153` | Uji terpisah dengan IP uji |
| R5 | Payload mentah tanpa batas ukuran aplikasi; `post_max_size` PHP mesin ini 2G, `memory_limit` 512M → body sangat besar bisa mematikan proses dan (sebelum T-13-01) membalas HTML | `php -i`; `BiteshipWebhookService.php:97-120` | Batasi ukuran body di controller/web server; setelah token terisi risiko turun (butuh token) |
| R6 | `npm run dev` bisa menulis `public/hot` lagi | `docs/catatan-devops.md` | Pastikan dev server mati saat memakai tunnel |
| R7 | **Seluruh v1.3 belum di-commit**: `BiteshipWebhookController.php`, `BiteshipWebhookService.php`, migrasi `000005`, 2 test, `PRD-v1.3.md` masih untracked; 65 berkas modified | `git status --short` | Commit sebelum uji pemilik (tindakan pemilik/devops; techlead tidak commit) |
| R8 | Token di query string tercatat di log akses ngrok/web server | PRD §2.1 memilih query/header | Pakai header `X-Webhook-Token` bila tersedia di dashboard; rotasi bila bocor |

Pengamatan di luar lingkup (dicatat di `docs/catatan-techlead.md`): header `X-Inertia-Devtools-Id`
ikut di setiap respons publik (bawaan inertia-laravel v2, isinya ULID), dan interstitial ngrok
muncul untuk pengunjung browser.

## 7. Rekomendasi Go/No-Go

**NO-GO rilis v1.3 hari ini.** F10 lulus penuh; F9 belum aman dan belum berfungsi di server.

**GO BERSYARAT** bila semua syarat berikut terpenuhi:

1. `php artisan migrate` dijalankan (F-13-01) — tanpa ini webhook 500.
2. `BITESHIP_WEBHOOK_TOKEN` terisi + URL `https://<tunnel>/biteship/webhook?token=…` didaftarkan
   dengan 3 event di dashboard Biteship (F-13-03, P1).
3. `APP_DEBUG=false` (+ `APP_ENV=production`) pada lingkungan yang diekspos (F-13-02).
4. Webhook asli dari dashboard terbukti: `picked` memajukan `dibayar` → `dikirim` + `shipped_at`,
   `delivered` pada `dikirim` → `selesai`, dan `order.price` tidak mengubah `total`/`payments`.
5. Uji browser minimal: panel admin (picked, retur, selisih) dan halaman selesai/riwayat pembeli.
6. T-13-01 (JSON saat exception) selesai **atau** pemilik menerima tertulis risiko balasan HTML.

Syarat 1–3 wajib sebelum F9 dinyalakan; 4–6 wajib sebelum rilis diumumkan ke pembeli.
F10 boleh naik lebih dulu tanpa menunggu F9. **Keputusan rilis akhir di pemilik.**

## 8. Kartu yang saya buat

| ID | Assignee | Isi |
|---|---|---|
| `t_8c48f38d` | backenddeveloper | T-13-01: `biteship/webhook` selalu membalas JSON generik saat exception + test; tidak mengubah jalur 200/403/422 |

Tidak ada kartu untuk F-13-01/02/03 (tindakan pemilik, sudah di `docs/pertanyaan-pemilik-v1.3.md`)
dan untuk F-13-04/05 (keputusan dokumen, saya perbarui sendiri di `docs/`).

## 9. Batas review ini

Tidak menjalankan server, composer, npm, artisan, atau migrasi; tidak membaca/mengubah `.env`;
tidak mengubah kode aplikasi. Semua perubahan saya hanya di `docs/` (`review-v1.3.md`,
`PRD-v1.3.md` §3 butir 2, `design-v1.3.md` §1, `catatan-techlead.md`). Verifikasi yang saya jalankan
ulang sendiri ada di §2; kartu tindakan pemilik tetap di `docs/pertanyaan-pemilik-v1.3.md` P1–P5.

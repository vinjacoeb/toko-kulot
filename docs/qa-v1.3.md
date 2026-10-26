# QA v1.3 — Webhook Biteship & akses tunnel

Kartu: `t_f5cacb6b` · Tanggal: 25 Okt 2026 · Assignee: qatesting
Sumber: `docs/brief-v1.3-qa.md`, `docs/PRD-v1.3.md` §2–§4, `docs/design-v1.3.md`,
`docs/kontrak-props.md` §7.9/§12.16–§12.18/§13.

Lingkungan eksekusi:
- Tunnel devops: `https://nonpsychopathically-unmarriageable-ruben.ngrok-free.dev` → `localhost:8000`
- PHP 8.3.32 (CLI), PHPUnit 11.5.57, Node v26.7.0, Windows 11 (Git Bash)
- DB pemilik: MySQL `toko-daster` (hanya dibaca; probe POST ke pesanan nyata gagal & rollback — lihat F-13-01)
- Tidak menyalakan server, tidak mengubah kode, tidak membaca/mengubah `.env`. Hanya menulis `docs/`.

## 1. Ringkasan

| Status | Jumlah |
|---|---|
| Total butir uji | 33 |
| Lulus | 23 |
| Gagal | 1 |
| Belum diuji (butuh browser/pemilik) | 9 |

Keputusan singkat: **NO-GO untuk F9 (webhook Biteship) sampai migrasi dijalankan**; F10
(tunnel) lulus. Tiga tindakan pemilik wajib sebelum uji webhook nyata: `php artisan migrate`,
isi `BITESHIP_WEBHOOK_TOKEN`, matikan `APP_DEBUG` pada akses publik.

## 2. Batas dan metode

- Statis: baca route, controller, service, migrasi, kontrak props, komponen React (bukan menjalankan UI).
- Otomatis: PHPUnit langsung (`php vendor/phpunit/phpunit/phpunit --filter=...`) karena `php artisan test`
  gagal `stdin is not a tty` di shell ini; `pdo_sqlite`/`sqlite3` dimuat lewat `PHP_INI_SCAN_DIR` scratch
  (test memakai sqlite `:memory:` sesuai `phpunit.xml`, DB MySQL pemilik tidak tersentuh).
- HTTP: `curl` baca-saja ke tunnel. Satu POST ke pesanan nyata (F-13-01) gagal di SQL dan sudah
  diverifikasi tidak mengubah baris (`status`, `shipping_status`, `updated_at` identik sebelum/sesudah).
- Tidak melakukan: uji browser/visual/responsif, uji beban, rate-limit runtime, pentest, webhook asli
  dari dashboard Biteship.

## 3. Hasil per butir

Keterangan hasil: Lulus / Gagal / Belum diuji (butuh browser|pemilik).

### 3.1 Statis

| ID | Butir | Hasil | Bukti |
|---|---|---|---|
| S1 | Route `POST /biteship/webhook` name `biteship.webhook`, `throttle:120,1`, tanpa CSRF | Lulus | `routes/web.php:152-154`; `bootstrap/app.php:36-38`; `php artisan route:list --path=biteship` → 1 route |
| S2 | Token query **atau** header, `hash_equals`, env kosong → diterima + `Log::info` | Lulus | `app/Http/Controllers/BiteshipWebhookController.php:20-28`; `app/Services/BiteshipWebhookService.php:34-50`; test `test_token_salah_ditolak_403` |
| S3 | Tiga event dipetakan (`order.status`, `order.price`, `order.waybill_id`) | Lulus | `BiteshipWebhookService.php:20,97-119` |
| S4 | Status pesanan hanya maju, `shipped_at` hanya diisi bila kosong | Lulus | `BiteshipWebhookService.php:138-160,166-183`; PRD §2.3 |
| S5 | Idempoten: tracking/status/shipped_at tidak berubah pada payload ganda | Lulus (catatan R2) | test `test_event_ganda_idempoten`; `BiteshipWebhookService.php:97-120` |
| S6 | `payments`, stok, `orders.shipping_cost`, `orders.total` tidak ditulis | Lulus | `BiteshipWebhookService.php:15,97-120` (hanya `shipping_*`, `status`, `shipped_at`); test `test_order_price_tidak_mengubah_uang_stok_dan_menyimpan_payload` |
| S7 | Dua kolom baru ada di `docs/db.md` dan migrasi | Lulus | `docs/db.md:38,101`; `database/migrations/2026_10_24_000005_add_shipping_webhook_columns_to_orders_table.php:19-20` |
| S8 | Props admin: 7 key `shipping` + 2 key baris daftar | Lulus | `app/Services/BiteshipService.php:534-557`; `app/Http/Controllers/Admin/OrderController.php:275-276`; `docs/kontrak-props.md:1795-1857` |
| S9 | Props pembeli tanpa `price_final`/`price_selisih`/`webhook_terakhir`, `galat` selalu null | Lulus | `app/Http/Controllers/HistoryController.php:104-108`; test `test_riwayat_pembeli_bentuk_pembeli_tanpa_key_admin`, `test_halaman_selesai_mengirim_shipping_bentuk_pembeli` |
| S10 | Panel admin: null tidak dirender, notice "Perlu tindakan", payload `<details>` | Lulus dengan catatan minor (F-13-04) | `resources/js/Pages/Admin/Orders/partials/InfoResi.jsx:144,165-214,217-226`; badge daftar `Index.jsx:200-201` |
| S11 | Pembeli: status/resi/petugas/diperbarui, tautan lacak hanya http(s) | Lulus | `resources/js/Pages/Public/CheckoutSuccess.jsx:44-49,242-279`; `History.jsx:235-237,341-358` |
| S12 | Tidak ada sisa Vite dev di HTML publik | Lulus | `public/hot` tidak ada; HTML `/`, `/produk`, `/kontak-kami`, `/produk/{slug}`: `grep -c 5173` = 0 |

### 3.2 Test otomatis

| ID | Butir | Hasil | Bukti |
|---|---|---|---|
| T1 | `--filter=BiteshipWebhook` | Lulus | **10 test, 62 assertion** — `docs/bukti-qa-v1.3-test.txt` |
| T2 | `--filter=ShippingPropsV13` | Lulus | **8 test, 168 assertion** — `docs/bukti-qa-v1.3-test.txt` |
| T3 | Suite penuh | Lulus | **339 test, 2815 assertion**, 38,5 s — `docs/bukti-qa-v1.3-suite.txt` |
| T4 | `npm run build` | Lulus | exit 0, `built in 3.83s`, 0 baris warning; manifest 35.125 B — `docs/bukti-qa-v1.3-build.txt` |

Test v1.3 yang dieksekusi: 3 event, 403 token, 422 body, order tak dikenal, idempoten, status tidak
mundur, status kurir bermasalah tidak membatalkan pesanan, `order.price` tidak mengubah uang/stok,
8 test props admin/pembeli.

### 3.3 HTTP tunnel

| ID | Butir | Hasil | Bukti |
|---|---|---|---|
| H1 | Halaman publik 200 | Lulus | `/` 200 26.965 B; `/produk` 200 30.922 B; `/kontak-kami` 200 15.837 B; `/login` 200 15.849 B; `/keranjang` 200 16.055 B |
| H2 | Detail produk 200, slug tak ada 404 | Lulus | `/produk/baju-tidur-pola-kucing` 200 22.769 B; `/produk/setelan-kulot-linen-lengan-panjang` 200 18.417 B; `/produk/slug-tidak-ada-qa13` 404 |
| H3 | Halaman admin tanpa sesi dialihkan | Lulus | `/admin`, `/admin/pesanan`, `/admin/produk` → 302 |
| H4 | Aset HTML lewat tunnel: `/build/assets/...`, favicon https | Lulus (catatan F-13-05) | 1 referensi `/build/assets/app-C0fClxZc.js` + css; js 200 365.066 B, css 200 66.718 B; favicon `https://<tunnel>/storage/settings/...` |
| H5 | POST `order_id` acak → 200 tanpa efek tulis | Lulus | `{"message":"ok"}` 200 |
| H6 | POST body bukan JSON → 422 | Lulus | `{"message":"invalid payload"}` 422 |
| H7 | Data pesanan tidak berubah oleh probe webhook | Lulus | `status=dibayar`, `shipping_status=confirmed`, `shipped_at=null`, `updated_at` identik sebelum & sesudah |
| H8 | Token salah ditolak lewat tunnel | **Belum diuji** — env token kosong, server menerima semua token (lihat F-13-03); jalur 403 lulus di test fitur | `?token=salah-qa13` → 200 `{"message":"ok"}` |
| H9 | POST ke pesanan nyata (id disamarkan) | **Gagal** → F-13-01 | STATUS=500, `SQLSTATE[42S22] Unknown column 'shipping_updated_at' in 'field list'` |

### 3.4 Butuh browser (belum diuji)

| ID | Butir | Alasan |
|---|---|---|
| B1 | Panel admin `/admin/pesanan/{order}`: picked/delivered/retur/selisih/payload kosong | Tidak ada browser/alat otomasi browser di sesi ini |
| B2 | Badge "Perlu tindakan" + timestamp di daftar `/admin/pesanan` | idem |
| B3 | `/checkout/{order}/selesai` & `/history` dengan data picked/delivered | idem; butuh pesanan berstatus kirim |
| B4 | Responsif 360 px, keyboard, zoom 200% | idem |
| B5 | Kontras/target sentuh notice & `<details>` | idem |
| B6 | Regresi visual halaman publik setelah build baru | idem |

Cara verifikasi: buka tiap URL dengan akun admin/pembeli uji, cek 6 keadaan di
`docs/catatan-frontend.md`, ukur 360 px dan navigasi keyboard.

### 3.5 Butuh pemilik

| ID | Butir | Alasan |
|---|---|---|
| P1 | Webhook asli dari dashboard Biteship (3 event) | Hanya pemilik yang bisa mendaftarkan URL + memicu event nyata |
| P2 | Rate limit 120/menit | Butuh 121 request; tidak dijalankan agar IP pemilik tidak terkunci |

## 4. Temuan

### F-13-01 — Blocker — Webhook 500 pada pesanan nyata: migrasi `000005` belum dijalankan

- Komponen: Environment/Database (bukan bug kode)
- Environment: tunnel produksi-dev, PHP 8.3.32, MySQL; pesanan uji pemilik dengan `biteship_order_id`
- Prasyarat: pesanan ada dan punya `biteship_order_id`
- Langkah: (1) `php artisan migrate:status`; (2) `POST /biteship/webhook` `{"event":"order.status","order_id":"<id>","status":"picked",...}`
- Hasil aktual: migrasi `2026_10_24_000005_add_shipping_webhook_columns_to_orders_table` **Pending**;
  kolom `orders.shipping_updated_at` dan `orders.shipping_webhook_payload` tidak ada
  (`Schema::hasColumn` = false); POST → **500** `SQLSTATE[42S22]: Column not found: 1054 Unknown column
  'shipping_updated_at' in 'field list'`. Tidak ada perubahan baris (rollback).
- Hasil diharapkan: PRD §2.7 — `picked` pada `dibayar` → `dikirim` + `shipped_at`, balasan
  `200 {"message":"ok"}`; PRD §2.1 "tidak pernah 500".
- Dampak: seluruh F9 tidak berfungsi di server; pesanan dengan `biteship_order_id` (2 dari 15 baris
  saat diperiksa) akan gagal diproses dan Biteship menerima 500.
- Perbaikan: pemilik menjalankan `php artisan migrate` (PRD §4 butir 4). Tidak perlu perubahan kode.
- Status: terbuka, menunggu tindakan pemilik. Frekuensi: selalu untuk pesanan yang cocok.

### F-13-02 — Mayor — Halaman debug Laravel terbuka di endpoint publik

- Komponen: Environment (konfigurasi) + Backend (kontrak respons)
- Langkah: picu error server (mis. F-13-01) lewat `POST /biteship/webhook` dari internet.
- Hasil aktual: respons 500 ber-`Content-Type: text/html` berisi halaman debug: pesan SQL lengkap,
  nama kolom, detail koneksi (`Connection: mysql, ...`), jejak berkas.
- Hasil diharapkan: PRD §2.1 — respons selalu JSON; detail internal tidak terekspos ke pemanggil publik.
- Dampak: informasi skema/lingkungan bocor ke siapa pun yang bisa memicu error; mempermudah penyerang.
- Perbaikan: `APP_DEBUG=false` (dan `APP_ENV=production`) pada lingkungan yang diekspos lewat tunnel;
  setelah F-13-01 beres, error JSON tetap disarankan lewat exception handler untuk route webhook.
- Status: terbuka. Frekuensi: selalu saat ada exception.

### F-13-03 — Mayor — `BITESHIP_WEBHOOK_TOKEN` kosong: endpoint menerima semua pemanggil

- Komponen: Environment
- Langkah: `POST /biteship/webhook?token=salah-qa13` dengan body valid.
- Hasil aktual: `200 {"message":"ok"}` — token tidak ditegakkan karena `config('biteship.webhook_token')`
  kosong (`BiteshipWebhookService.php:34-50` mode uji lokal).
- Hasil diharapkan: PRD §4 butir 2 — token diisi teks acak panjang; bila terisi, token salah → 403
  (jalur ini lulus di test `test_token_salah_ditolak_403`).
- Dampak: siapa pun yang tahu/menebak `biteship_order_id` dapat mengubah `shipping_status` dan
  memajukan status pesanan (`dibayar` → `dikirim` → `selesai`) tanpa autentikasi.
- Perbaikan: isi `BITESHIP_WEBHOOK_TOKEN` di `.env`, lalu daftarkan URL dengan `?token=...` (PRD §4 butir 2–3).
- Status: terbuka, menunggu pemilik. Frekuensi: selalu.

### F-13-04 — Minor — Urutan baris panel Pengiriman berbeda dari `design-v1.3` §1

- Komponen: Frontend/Desain
- Bukti: `docs/design-v1.3.md:24-25` menetapkan urutan akhir "Kurir/layanan → Petugas kurir → Resi →
  Status pengiriman → Ongkir aktual → Selisih ongkir → Diperbarui"; implementasi
  `InfoResi.jsx:165-214` menyisipkan baris baru tetapi mempertahankan ETD/Berat/Ongkir tagihan lama
  sebelum "Petugas kurir".
- Dampak: kosmetik; tidak ada data hilang, semua baris baru tampil.
- Rekomendasi: Tech Lead memutuskan — terima (perbarui design) atau minta frontend menyusun ulang.
  Sudah dicatat frontend di `docs/catatan-frontend.md`.
- Status: terbuka (keputusan desain). Frekuensi: selalu.

### F-13-05 — Minor — PRD §3 butir 3 menyebut path aset "relatif tanpa host", aktual absolut

- Komponen: Requirement/Dokumen
- Bukti: HTML tunnel memuat `src="https://nonpsychopathically-...ngrok-free.dev/build/assets/app-C0fClxZc.js"`
  (absolut https), bukan `/build/assets/...`; keputusan Tech Lead pada `t_74deeaef` menerima absolut
  karena syarat fungsionalnya "tanpa `[::1]:5173`".
- Dampak: dokumen dan kenyataan tidak sinkron; tidak ada bug fungsional (aset 200, favicon https).
- Rekomendasi: perbarui kalimat PRD §3 butir 3 agar cocok dengan keputusan (absolut https, tanpa Vite dev).
- Status: terbuka (dokumen).

## 5. Risiko tersisa (bukan bug)

| ID | Risiko | Bukti | Dampak | Mitigasi |
|---|---|---|---|---|
| R1 | Kolom payload hanya menyimpan payload **terakhir**: event `order.price` menghapus data driver; event `order.status` berikutnya menghapus `price_final`/selisih ongkir | `BiteshipService.php:565-576,637-663`; `BiteshipWebhookService.php:112-118` | Admin bisa kehilangan badge selisih ongkir; pembeli kehilangan nama/telepon petugas & tombol lacak setelah event lain datang | Sesuai PRD §2.4 (satu slot); bila tidak diinginkan, simpan driver/harga di kolom terpisah — keputusan Tech Lead |
| R2 | Payload ganda menggeser `shipping_updated_at` (label "Diperbarui" berubah) | `BiteshipWebhookService.php:97` | Kosmetik; PRD §2.4 hanya mengunci tracking/status/shipped_at | Terima atau jangan perbarui bila payload identik |
| R3 | URL ngrok gratis berubah tiap restart | `docs/catatan-devops.md` | Webhook Biteship berhenti cocok sampai URL diperbarui | Domain tetap untuk produksi (PRD §3 akhir) |
| R4 | Throttle 120/menit belum diuji runtime | `routes/web.php:153` | Batas tidak terverifikasi; salah konfigurasi baru terlihat saat banjir event | Uji terpisah dengan IP uji |
| R5 | `shipping_webhook_payload` menyimpan body mentah tanpa batas ukuran aplikasi | `BiteshipWebhookService.php:97-120` | Payload sangat besar membebani DB | Batasi `post_max_size`/validasi ukuran bila perlu |
| R6 | Proses `npm run dev` bisa dijalankan ulang dan menulis `public/hot` lagi | catatan devops | Halaman kosong lewat tunnel kembali | Pastikan dev server mati saat memakai tunnel |

## 6. Traceability PRD → hasil

| Requirement | Butir | Hasil |
|---|---|---|
| §2.1 route, tanpa CSRF, throttle | S1, H5-H6 | Lulus (throttle runtime belum) |
| §2.1 token 403 / mode kosong | S2, H8 | Kode lulus; env token kosong (F-13-03) |
| §2.1 selalu JSON, tidak pernah 500 | H4-H6, H9, F-13-01/02 | **Gagal** saat migrasi pending |
| §2.2 tiga event | S3, T1 | Lulus |
| §2.3 hanya maju | S4, T1 | Lulus |
| §2.4 idempoten | S5, T1 | Lulus (catatan R2) |
| §2.5 dua kolom + migrasi | S7, F-13-01 | Skema ada di kode; **belum di DB pemilik** |
| §2.6 props admin | S8, T2 | Lulus |
| §2.6 props pembeli (tanpa key admin) | S9, T2 | Lulus |
| §2.6 tampilan panel/riwayat/selesai | S10-S11 | Statis lulus; browser B1-B3 belum |
| §2.7 test fitur | T1 | Lulus 10/10 |
| §3 F10 tunnel (tanpa Vite dev, favicon https, aset build) | S12, H1-H4 | Lulus (F-13-05 dokumen) |
| §4 tindakan pemilik | F-13-01/03, P1 | Belum dijalankan pemilik |

## 7. Rekomendasi

**NO-GO untuk F9** sampai tiga syarat dipenuhi pemilik:
1. `php artisan migrate` (F-13-01) — tanpa ini webhook 500 dan F9 tidak berfungsi.
2. Isi `BITESHIP_WEBHOOK_TOKEN` + daftarkan URL bertoken di dashboard (F-13-03).
3. `APP_DEBUG=false` untuk akses publik (F-13-02).

**F10 (tunnel) dapat diterima** — halaman publik 200, hanya `/build/assets/...`, favicon https,
tanpa `[::1]:5173`, build bersih, suite hijau.

Setelah tiga syarat: **GO BERSYARAT** dengan sisa risiko R1-R6 dan uji browser B1-B6 + webhook asli P1
sebagai syarat verifikasi lanjutan. Keputusan rilis akhir milik Tech Lead.

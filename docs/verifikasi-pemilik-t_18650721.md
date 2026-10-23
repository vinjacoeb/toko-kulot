# Verifikasi Laporan Pemilik — Kartu `t_18650721`

Tanggal: 22 Oktober 2026 (WIB) · QA: profil `qatesting`
Aplikasi: `http://127.0.0.1:8000` (Laravel 11 + Inertia + React, build dari working tree `C:/Users/LENOVO/Downloads/toko-kulot`, HEAD `66527ce`, 51 berkas termodifikasi + 205 untracked saat verifikasi, PHP 8.3.32)
Database: MySQL pengembangan `toko-kulot` (baca-saja lewat `php artisan tinker`)
Metode: HTTP `curl`, browser nyata via CDP (viewport 1280×900, 1024×900, 768×900, 360×800), pembacaan props Inertia, query baca-saja, suite PHPUnit penuh.
Akun: `admin@tokokulot.test` (owner) sesuai `docs/akun-dev.md`. Kredensial tidak ditulis di dokumen ini.
Sumber kebenaran: `docs/PRD.md` §9, `docs/design.md` §4.6/§4.7/§5.13, `docs/kontrak-props.md` §8.3/§12.1, keputusan kartu `t_fe77b3d7`, `t_7a62c713`, `t_1ef89050`.

## 1. Ringkasan

| No | Butir laporan pemilik (`t_fe77b3d7`) | Status | Inti bukti |
|---|---|---|---|
| 1 | Setelah tambah produk di `/admin/produk`, ukuran/warna tidak bisa dipilih di halaman publik | **Lulus** | Produk 13 (4 varian) & 6 (6 varian): klik warna → ukuran → CTA aktif; urutan terbalik juga jalan; chip bisa diaktifkan dengan keyboard; produk 1 warna (9) tetap bisa dipilih ukurannya |
| 2 | Dugaan: ukuran & warna saling mengunci bila warna > 1 | **Lulus** (tidak tereproduksi) | 2 warna × 2–3 ukuran: memilih satu warna tidak menonaktifkan ukuran; `disabled` hanya per nilai yang tidak tersedia |
| 3 | Warna yang ditambahkan tetap tampil putih | **Lulus** | Swatch Merah `rgb(220,38,38)`, Hijau `rgb(22,163,74)`, Hitam `rgb(17,24,39)`, Krem `rgb(239,227,203)`; 9/9 warna di DB punya hex |
| 4 | Dashboard admin belum sinkron dengan data aktual | **Lulus** | Snapshot 09:40 WIB: props `{13, 7, 884000, 12}` identik dengan query DB; 14 titik grafik; stok kritis 2; pesanan/ulasan terbaru 5/2; "Muat ulang" memperbarui `updated_at` |
| 5 | Midtrans langsung produksi & apakah `.env` sudah benar | **Lulus dengan catatan** | Mode efektif `asli`, `fake=false`, SDK `https://api.midtrans.com`, server key terisi tanpa prefiks sandbox, expiry efektif 5 menit, config tidak ter-cache. Charge nyata & notifikasi belum diuji |
| 6 | Tabel `/admin/produk` tumpang tindih | **Lulus** | 1280: tabel 975 px dalam kartu 975 px, tanpa kolom bertumpuk; 1024/768/360: gulir di dalam kartu (`overflow-x:auto`), tinggi halaman tidak melebar; nama panjang dipotong elipsis tanpa menembus kolom |

Kesimpulan: keenam butir **lulus** pada lingkungan pengembangan. Tidak ada defect baru yang menghalangi; catatan non-blocking ada di §6 (O-1–O-5).

## 2. Bukti per butir

### B1 — Pemilihan ukuran & warna (produk 13 `baju-tidur-pola-kucing`, 4 varian: L/XL × Hijau/Merah)
Diukur ulang 22 Okt 2026 pada muat-baru (viewport 1280×900):
- Muat baru: tidak ada chip terpilih (`L`, `XL`, `Hijau`, `Merah` semua `aria-pressed=false`, `disabled=false`), CTA `Tambah ke Keranjang` `disabled=true`, teks stok total `Stok: Tersedia (34)`. Tidak ada kelompok yang mati.
- Klik `Merah` → hanya `Merah` `aria-pressed=true`; chip ukuran tetap aktif; CTA masih `disabled` (ukuran belum dipilih) — perilaku benar.
- Klik `XL` → `XL` + `Merah` terpilih, CTA `disabled=false`, stok menjadi `Stok: Tersedia (10)` (stok per varian).
- Klik `L` → pilihan ukuran berpindah ke `L` (bukan terkunci), CTA tetap aktif, stok `Stok: Tersedia (8)`.
- Urutan terbalik juga terbukti: klik `L` dulu → hanya `L` terpilih dan CTA `disabled`; lalu klik `Hijau` → `L`+`Hijau` terpilih, CTA `disabled=false`, stok `(6)`. Tidak ada state buntu pada kedua urutan.
- Keyboard: fokus pada chip `XL` (elemen `BUTTON`, `tabIndex=0`), `Space` via CDP `Input.dispatchKeyEvent` mengubah `aria-pressed` → chip benar-benar tombol, bukan `div`.
- Produk 9 `kulot-karet-pinggang-motif-garis` (1 warna Hitam, ukuran M/L): `Hitam` otomatis `aria-pressed=true`, CTA `disabled` sebelum ukuran dipilih, teks `Stok: Tersedia (6)`. Perilaku sesuai rancangan (warna tunggal tidak perlu dipilih).

### B2 — Tidak ada saling kunci saat warna > 1
- Produk 13 (2 warna × 2 ukuran) dan produk 6 `kulot-plisket-premium` (Hitam/Krem × M/L/XL, 6 varian): seluruh chip tetap aktif setelah warna atau ukuran dipilih; kombinasi `XL`+`Krem` (produk 6) dan `XL`+`Merah` (produk 13) berhasil terpilih. Tidak ada kelompok yang menunggu kelompok lain.
- `disabled` hanya muncul untuk nilai yang tidak punya stok. Di data dev **tidak ada varian berstok 0**, sehingga aturan "disabled bila stok 0" belum teruji (§5).

### B3 — Warna asli, bukan putih
- Hex diambil dari `variants[].color_hex` (kontrak §8.3), bukan heksa karangan. Diukur di DOM: Hijau `rgb(22,163,74)`, Merah `rgb(220,38,38)`, Hitam `rgb(17,24,39)`, Krem `rgb(239,227,203)` — sama dengan `app/Support/VariantColor.php`.
- Seluruh 9 nama warna yang ada di DB (`Cokelat, Navy, Biru Muda, Sage, Hitam, Maroon, Krem, Hijau, Merah`) menghasilkan hex. Uji 22 nama (termasuk `Merah Hati`, `Biru Laut`, `Hijau Army`, `Cream`, `Marun`, `Abu`, `Tosca`) → 21 punya hex.
- Satu nama tidak dikenal: `Broken White` → `null` → `ColorSwatch` menampilkan lingkaran netral + huruf awal (`resources/js/Components/ColorSwatch.jsx:38`). Bukan putih polos yang menyamar sebagai warna, tetapi juga bukan warna asli (§6 O-2).

### B4 — Dashboard sinkron dengan data aktual
Snapshot 22 Okt 2026 09:40 WIB (props Inertia vs query DB pada detik yang sama):

| Item | Props halaman | Query DB (baca-saja) |
|---|---|---|
| `stats.orders_total` | 13 | `orders` = 13 |
| `stats.orders_pending` | 7 | `status='pending'` = 7 |
| `stats.revenue_total` | 884000 | `SUM(total)` status ∈ dibayar/diproses/dikirim/selesai = 884000 |
| `stats.products_active` | 12 | produk `is_active=1` = 12 |
| `sales_14d` | 14 titik, 09–22 Okt 2026, jumlah 884.000 | 2 hari transaksi, `SUM` = 884.000 (zero-fill 14 hari) |
| `low_stock` | 2 baris (Kulot Karet Pinggang M & L, Hitam, stok 3) | 2 varian aktif dengan stok < 5 |
| `recent_orders` / `recent_reviews` | 5 / 2 | `recent_orders` = 5 baris terbaru (batas kontrak §6.13); `recent_reviews` = 2 (seluruh ulasan yang ada, di bawah batas) |

- Teks KPI yang dirender: `Rp884.000`, `7`, `13`, `12` — sama dengan props.
- Grafik: 14 titik `<rect aria-label="…: Rp…">` (`09 Okt 2026: Rp0` … ), `aria-label` svg = `Penjualan 14 hari 14 hari terakhir: total Rp884.000`.
- Tombol **Muat ulang** memicu `inertia:start → inertia:success` dan `updated_at` berubah `09:40:17 → 09:40:29`; tanpa error dan tanpa state kosong. Label "Diperbarui …" tidak muncul karena selisih < 5 menit (`resources/js/Pages/Admin/Dashboard.jsx:82-92`) — sesuai rancangan.
- Catatan: data dev berubah selama pengujian (ada aktivitas agent lain di database yang sama), jadi angka bisa bergeser setelah snapshot 09:40 WIB; tabel di atas adalah satu snapshot yang konsisten antara props dan DB.

### B5 — Midtrans produksi & `.env`
Keluaran `php tmp/cek-midtrans-produksi.php` (22 Okt 2026, tanpa nilai rahasia):

```
config_cached: false          is_production: true        fake_flag: false
fake_efektif_service: false   mode_efektif: "asli"       alasan_kode: null
server_key_terisi: true       server_key_berprefix_sandbox: false
client_key_berprefix_sandbox: false
sdk_base_url: "https://api.midtrans.com"                 expiry_minutes: 5
enabled_payments: ["other_qris"]                         sumber_kredensial: ".env (MIDTRANS_*)"
notification_url_path: "/midtrans/notification"          notification_url_https: false
env_key_terbaca: MERCHANT_ID, CLIENT_KEY, SERVER_KEY, IS_PRODUCTION, FAKE, EXPIRY_MINUTES = true
```

- Kredensial efektif berasal dari `.env`, bukan dari tabel `settings` (`config/midtrans.php:17-26`); kolom `midtrans_client_key`/`midtrans_is_production` di tab Pembayaran memang hanya catatan (keputusan `t_abb37557`).
- **Expiry**: nilai efektif 5 menit, bukan 60 seperti yang disebut pada laporan. `config/midtrans.php` memakai `MIDTRANS_EXPIRY_MINUTES` bila bilangan bulat ≥ 1, jika tidak jatuh ke 5. Karena `config_cached=false` dan variabelnya terbaca, isi `.env` saat ini menghasilkan 5 menit. Isi literal `.env` tidak dibaca QA (kebijakan proteksi environment).
- **Sisa aksi pemilik (bukan defect kode)**: daftarkan *Notification URL* `https://<domain-produksi>/midtrans/notification` di dashboard Midtrans — nilai `notification_url_https=false` hanya karena `APP_URL` lokal masih `http`. Charge QRIS nyata, webhook asli, dan status pembayaran produksi **belum diuji** (§5).

### B6 — Tabel `/admin/produk` tidak tumpang tindih
| Viewport | Lebar tabel | Wadah | `overflow-x` | `scrollWidth` dokumen | Kolom bertumpuk |
|---|---|---|---|---|---|
| 1280 | 975 | 975 | auto | 1265 (< 1280, tanpa gulir horizontal) | tidak ada |
| 1024 | 940 | 719 | auto | 1009 | tidak ada |
| 768 | 940 | 719 | auto | 753 | tidak ada |
| 360 | 940 | 326 | auto | 360 | tidak ada |

- 12 baris, 6 kolom (`Produk, Kategori, Harga, Stok, Status, Aksi`); `table-fixed` + `min-width` 940 px membuat tabel menggulir **di dalam kartu** tanpa melebarkan halaman (360 px tetap 360 px).
- Uji nama panjang: teks 766 px dipaksa ke sel selebar 116 px → `overflow:hidden`, `text-overflow:ellipsis`, tepi kanan 481 px < kolom berikutnya 497 px → **tidak menembus** kolom lain (`Index.jsx:143-144` memakai `truncate`).
- Tabel "Pesanan terbaru" di dashboard pada 360 px juga menggulir di dalam wadahnya (326 px vs 529 px) dan halaman tetap 360 px.

## 3. Test Case & Traceability

### 3.1 Matriks risiko dan kedalaman uji

| Area | Kemungkinan gagal | Dampak | Level | Uji yang dijalankan |
|---|---|---|---|---|
| Pemilih varian (ukuran/warna) | Tinggi — regresi state klien | Tidak bisa beli | P0 | Fungsional, state UI, keyboard, urutan terbalik, 3 produk |
| Swatch warna | Sedang — peta warna server | Salah tampil, kepercayaan turun | P1 | Bandingkan props `color_hex` vs computed style; 22 nama |
| Dashboard admin | Tinggi — props sempat tidak dikirim | Keputusan pemilik salah | P0 | Bandingkan props vs query DB; 4 KPI + 3 daftar + tombol muat ulang |
| Tabel admin | Sedang — `table-fixed` baru | Kolom tumpang tindih | P1 | Ukur 4 viewport, simulasi nama 766 px, cek `th` bertumpuk |
| Midtrans produksi | Tinggi — uang nyata | Gagal bayar / mode salah | P0 | Probe konfigurasi baca-saja, sumber kredensial, expiry, SDK base URL |
| Regresi umum | Sedang | Fitur lain rusak | P1 | Suite penuh PHPUnit + smoke katalog/otorisasi |

### 3.2 Daftar test case

| ID | Skenario | Langkah ringkas | Hasil diharapkan | Hasil aktual | Status |
|---|---|---|---|---|---|
| TC-01 | Pilih warna lalu ukuran | Buka produk 13 → klik `Merah` → klik `XL` | Kedua nilai terpilih, CTA aktif | `Merah`+`XL` pressed, CTA `disabled=false`, stok 10 | Lulus |
| TC-02 | Pilih ukuran lalu warna | Muat ulang → klik `L` → klik `Hijau` | Sama, tidak buntu | `L` saja → CTA `disabled`; tambah `Hijau` → keduanya terpilih, CTA aktif, stok 6 | Lulus |
| TC-03 | Aktifkan chip via keyboard | Fokus `XL` → `Space` (CDP) | `aria-pressed` berubah | Berubah; elemen `BUTTON` | Lulus |
| TC-04 | CTA sebelum varian lengkap | Muat baru → klik `Merah` saja | CTA tetap disabled | `disabled=true` | Lulus |
| TC-05 | 2 warna × 2–3 ukuran | Produk 13 & 6: klik warna & ukuran bergantian | Tidak ada chip lain ikut mati | Semua chip tetap aktif; kombinasi `XL`+`Krem` (produk 6) dan `XL`+`Merah` (produk 13) terpilih | Lulus |
| TC-06 | Varian stok 0 | Cari varian `stock=0` | Chip nilai itu disabled | Tidak ada data stok 0 di DB dev | Belum diuji |
| TC-07 | Warna asli | Baca `color_hex` props vs `backgroundColor` swatch | Hex sama, bukan putih | Hijau `rgb(22,163,74)`, Merah `rgb(220,38,38)`, Hitam `rgb(17,24,39)`, Krem `rgb(239,227,203)` | Lulus |
| TC-08 | Nama warna di luar palet | Panggil `VariantColor::hex()` 22 nama | Hex benar atau `null` eksplisit | 21 hex, `Broken White` → `null` (fallback netral) | Lulus dengan catatan |
| TC-09 | Dashboard vs DB | Bandingkan props 09:40 dengan query baca-saja | Semua angka identik | 13/7/884000/12, 14 titik, 2 stok kritis, 5/2 terbaru — identik | Lulus |
| TC-10 | Tombol Muat ulang | Klik `Muat ulang`, pantau event Inertia | `updated_at` berubah, tanpa error | `09:40:17 → 09:40:29`, `inertia:success` | Lulus |
| TC-11 | Mode & kredensial Midtrans | Jalankan `tmp/cek-midtrans-produksi.php` | Produksi asli, kunci terisi, bukan sandbox | `is_production=true`, `fake=false`, prefix sandbox `false`, `api.midtrans.com` | Lulus |
| TC-12 | Expiry & sumber kredensial | Baca keluaran probe + `config/midtrans.php` | Expiry 5 menit, sumber `.env` | Efektif 5; `sumber_kredensial=".env (MIDTRANS_*)"` | Lulus |
| TC-13 | Tabel admin 4 viewport | Ukur lebar tabel/wadah/halaman, cek `th` bertumpuk | Tidak bertumpuk, halaman tidak melebar | 4/4 viewport tanpa tumpang tindih; halaman = viewport | Lulus |
| TC-14 | Nama produk sangat panjang | Sisipkan teks 766 px ke sel 116 px | Elipsis, tidak menembus kolom | `text-overflow:ellipsis`, tepi 481 < 497 | Lulus |

### 3.3 Traceability matrix

| Butir pemilik | Test case | Cakupan | Status |
|---|---|---|---|
| B1 pilih ukuran/warna | TC-01 klik warna→ukuran, TC-02 urutan terbalik, TC-03 keyboard Space, TC-04 CTA disabled→enabled | fungsional + state UI + aksesibilitas keyboard | Lulus |
| B2 tidak saling kunci | TC-05 2 warna × 2–3 ukuran, TC-06 nilai tanpa stok | fungsional + edge | Lulus (TC-06 belum dapat diuji) |
| B3 warna asli | TC-07 bandingkan `color_hex` props vs computed style, TC-08 pemetaan 22 nama warna | fungsional + data | Lulus |
| B4 dashboard sinkron | TC-09 bandingkan 4 KPI + series + low stock + recent dengan DB, TC-10 tombol Muat ulang | integrasi data + state | Lulus |
| B5 Midtrans produksi | TC-11 probe mode/kredensial/expiry, TC-12 sumber kredensial | konfigurasi + keamanan dasar | Lulus (charge nyata belum) |
| B6 tabel admin | TC-13 ukur 4 viewport, TC-14 simulasi nama panjang | UI responsif | Lulus |

## 4. Regresi

- Suite penuh `vendor/phpunit/phpunit/phpunit` (PHP 8.3.32, SQLite `:memory:` via `phpunit.xml`) → **OK (258 tests, 2041 assertions)**, 31,296 detik. Log: `docs/qa/log-phpunit-t_18650721.txt`. `php artisan test` tidak dipakai karena membalas `stdin is not a tty` di shell ini — keterbatasan pemanggilan, bukan kegagalan test.
- Katalog publik: `/produk` 200, `/produk/baju-tidur-pola-kucing` 200, slug tidak ada → 404.
- Otorisasi dasar: `/admin`, `/admin/produk`, `/admin/akun` tanpa sesi → 302 ke `/admin/login`; login owner berhasil dan halaman termuat.

## 5. Belum diuji (batas eksplisit)

1. **Pembuatan produk baru lewat form admin** (menulis data) tidak dieksekusi; verifikasi memakai produk yang sudah ada, termasuk produk yang dilaporkan (2 warna) dan produk 1 warna. Alur simpan varian dari form ke halaman publik belum diuji ujung-ke-ujung.
2. **Varian berstok 0**: tidak ada di data dev, jadi aturan `disabled` untuk nilai tanpa stok belum terbukti di runtime (hanya dibaca dari kode).
3. **Warna banyak (> 2) dan nama warna di luar palet** (`Broken White`, nama dwibahasa tak dikenal): belum diukur perilaku bungkus baris swatch dan fallback-nya.
4. **Charge QRIS nyata, webhook/notifikasi Midtrans produksi, dan pembayaran sungguhan**: tidak dijalankan (butuh jaringan + transaksi nyata).
5. **Zoom 200%, screen reader, kontras terukur, dan browser selain Chromium**: tidak diuji.
6. **State "Diperbarui …" (data ≥ 5 menit)**: memerlukan halaman yang menua ≥ 5 menit; hanya logika kode yang diperiksa.
7. **Pagination tabel admin**: 12 produk < 15 per halaman, sehingga kontrol pagination tidak tampil untuk diuji.

## 6. Observasi & risiko sisa

- **O-1 (Low, frontend/UI)** — `DataTable` mendokumentasikan "Header sticky" (`resources/js/Components/DataTable.jsx:9`), `docs/komponen.md:83` mewajibkan "Header sticky", dan `docs/design.md:335` menetapkan "sticky", tetapi `<th>` di `DataTable.jsx:94-101` hanya memakai `h-tableHead … bg-surface` tanpa `sticky top-0`; computed style `thead th` = `position: static`. Belum berdampak karena tinggi tabel (12 × 56 px) masih di bawah viewport; akan terasa bila baris per halaman ditambah. Bukan bagian dari 6 butir pemilik.
- **O-2 (Low, enhancement)** — Nama warna di luar palet (`Broken White`) tampil netral + huruf awal; masih dapat dipilih, tetapi tidak mencerminkan warna asli. Opsi: tambah alias palet atau sediakan input hex di form varian.
- **O-3 (informasi)** — "Stok kritis" punya dua definisi sah: dashboard menghitung **varian** aktif < 5 (2 baris), ringkasan `/admin/produk` menghitung **produk** dengan total stok < 5 (0). Keduanya sesuai kontrak (`§6.13` vs `§12.1`), tetapi bisa membingungkan pemilik. Bukan defect.
- **O-4 (gap requirement, sudah tercatat)** — Dashboard hanya merender 4 KPI; PRD §9 juga meminta omzet hari ini/7/30 hari, pesanan per status, dan produk terlaris. Gap ini sudah dinyatakan di luar cakupan kartu sinkronisasi (`docs/catatan-backend.md:1026-1029`), jadi tidak dibuatkan kartu baru di sini; butuh keputusan Tech Lead bila ingin masuk rilis.
- **O-5 (informasi)** — URL yang disebut pemilik, `/produk/barang`, memang tidak ada (404); rute katalog adalah `/produk` dan `/produk/{slug}`.
- Tidak ada defect Critical/High/Medium yang ditemukan pada area yang diverifikasi. Tidak ada kartu perbaikan baru dibuat.

## 7. Rekomendasi

**GO untuk keenam perbaikan yang diverifikasi** — semua butir laporan pemilik lulus dengan bukti terukur, suite penuh hijau, dan tidak ada regresi pada katalog, otorisasi admin, maupun tabel admin.

Risiko tersisa yang perlu diketahui Tech Lead sebelum rilis produksi: charge/notifikasi Midtrans nyata belum diuji, aturan stok 0 belum terbukti di runtime, dan gap KPI PRD §9 (O-4). Ketiganya bukan penghalang untuk perbaikan ini, tetapi tetap harus ditutup pada checklist rilis.

## 8. Self-review

- [x] Keenam butir laporan dipetakan ke bukti dan status.
- [x] Area risiko tinggi disentuh: otorisasi admin (302 tanpa sesi), data dashboard (bandingkan props vs DB), konfigurasi pembayaran (mode/kredensial tanpa membocorkan rahasia).
- [x] Negatif/edge dipertimbangkan: slug 404, nama panjang, viewport 360, varian stok 0 (dinyatakan belum teruji).
- [x] Tidak ada klaim tes yang tidak dieksekusi; batas browser, jaringan, dan data ditulis di §5.
- [x] Hanya menulis di `docs/` (`docs/verifikasi-pemilik-t_18650721.md`, `docs/qa/log-phpunit-t_18650721.txt`, penunjuk di `docs/laporan-qa.md`); kode aplikasi dan `.env` tidak disentuh.
- [x] Tidak ada kredensial, cookie, token, atau data pribadi di dokumen ini.

## 9. Verdict Tech Lead (22 Okt 2026 ±10:00)

- **Keenam butir diterima.** Verifikasi techlead independen: suite penuh `258 tests, 2041 assertions`
  hijau; kode varian, `color_hex`, snapshot dashboard, dan lebar tabel sesuai laporan. Rincian:
  `docs/review-3.md`.
- **O-1** (header tabel belum sticky) dibuatkan kartu `t_082b15aa` (frontenddeveloper), parent
  `t_fe77b3d7` — kontrak komponen tertulis, bukan fitur baru.
- **O-2** tidak dikerjakan sekarang; usulan `docs/usulan.md` U12 + pertanyaan P15.
- **O-4** ditunda ke rilis berikutnya; usulan U11 + pertanyaan P14. Dashboard belum memenuhi PRD §9
  secara penuh, karena itu rekomendasi rilis adalah **GO BERSYARAT**, bukan GO penuh.
- **Expiry:** laporan QA membaca 5 menit; probe devops 08:47 membaca 60. Bukti terbaru (QA 09:40)
  dipakai: 5 menit. Pemilik diminta mengonfirmasi (P13).
- **Belum GO produksi** sampai satu pembayaran QRIS nyata + notifikasi Midtrans terbukti.
  Keputusan akhir milik pemilik.

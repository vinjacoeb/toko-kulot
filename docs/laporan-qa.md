# Laporan QA — Kartu K15 (`t_a3c308d2`)

- **Kartu**: `t_a3c308d2` — "Unit + feature test, QA iterasi bug" (assignee `qatesting`)
- **Tanggal**: 20 Oktober 2026
- **Workspace**: `C:/Users/LENOVO/Downloads/toko-kulot`
- **Lingkungan**: Windows 11 (git-bash/MSYS), PHP 8.1/8.3 (Laragon), MySQL proyek, app disajikan di `http://127.0.0.1:8000`, driver SQLite diaktifkan hanya untuk test lewat `PHP_INI_SCAN_DIR` (tanpa mengubah `php.ini` global).
- **Metode**: PHPUnit (unit + feature HTTP/Inertia) + smoke test browser nyata (Chromium via Browser Use, cache dimatikan) pada viewport 360/768/1280 px.
- **Artefak**: 10 berkas test baru (59 test case), log PHPUnit lengkap `docs/bukti-phpunit-k15.txt`, dokumen ini.
- **Pembaruan 20 Okt 2026 — kartu `t_d21ef249` (QA)**: QA-005 ditutup setelah keputusan Tech Lead `t_54bfee4e` (PATCH menang) dan perbaikan rute `t_768819a7`; QA-004 (22 rute admin) juga tidak lagi berlaku karena `t_ed8bd8e4` selesai. Suite terbaru: **190 passed, 0 failed, 0 incomplete (1111 assertions, exit 0)** — bukti `docs/bukti-phpunit-t_d21ef249.txt`, ringkasan di §8.1b dan §9 QA-005.

## Ringkasan hasil

| Metrik | Nilai |
|---|---|
| Total test case suite | **175** (59 baru dari K15 + 116 warisan kartu backend) |
| Lulus | **173** |
| Gagal | **0** |
| Incomplete (gap terdokumentasi) | **2** |
| Assertions | **996** |
| Durasi | **49,78 s** (`php artisan test`, exit code 0) |
| Smoke browser | 8 halaman diuji; **5 halaman blank** karena error runtime React, 1 halaman sehat |
| Rekomendasi | **NO-GO** untuk rilis (2 Critical terbuka pada alur utama) |
| Suite terbaru (`t_d21ef249`, 20 Okt 2026) | **190 passed, 0 failed, 0 incomplete** (1111 assertions, 54,52 s, exit 0) — lihat §8.1b |

> Catatan penting: suite PHPUnit **hijau**, tetapi itu **tidak** berarti aplikasi layak rilis. PHPUnit menguji lapisan HTTP/props Inertia; ia tidak mengeksekusi JavaScript. Dua defect Critical di bawah ini hanya terlihat lewat browser nyata dan sudah dikonfirmasi dua kali (dengan `?cache-buster` dan cache dinonaktifkan).

---

## 1. Pemahaman Fitur

Kartu K15 meminta lapisan unit + feature test untuk seluruh modul MVP yang sudah dibangun (K1–K13), perbaikan/iterasi bug yang ditemukan, dan pemetaan ke DoD §15. Cakupan yang diuji:

- **Util/domain murni**: `VariantSize` (urutan ukuran baku), `Product::priceForQty` (harga eceran/grosir), `MidtransService::mapStatus` + verifikasi signature, `StockService::label`.
- **Layanan berbasis DB**: `SettingService` (put/get/tipe/rollback/daftar putih key).
- **Halaman publik**: beranda `/` (kontrak props, batas FAQ, batas produk unggulan, shared props Inertia).
- **Panel admin**: dashboard (§6.13 kontrak props), kontrol akses rute admin (tamu, pembeli, admin aktif).
- **Kontrak rute**: PRD §5.1 (25 rute publik) & §5.2 (rute admin) — nama rute + metode HTTP.
- **Fondasi data**: `migrate:fresh --seed` dari nol, kelengkapan tabel §6, idempotensi seeder.

## 2. Review Requirement dan Ketidaksinkronan

1. **Konflik metode HTTP `admin.messages.read`** — **SELESAI 20 Okt 2026**
   - `docs/PRD.md` §5.2 baris 157: **PATCH** `/admin/pesan-masuk/{message}/baca`
   - `docs/kontrak-props.md` §10.2 baris 729 (kondisi saat temuan): **POST** (implementasi `routes/admin.php` + frontend memakai POST)
   - Dampak uji saat itu: ambigu siapa pemilik kebenaran. Dilaporkan ke Tech Lead (kartu **`t_d98cf23d`**); `RouteContractTest::test_metode_http_rute_admin_sesuai_prd` melaporkan bagian ini sebagai **Incomplete** (catat, jangan blokir — R7) dan tetap gagal bila ada rute lain menyimpang.
   - **Penutupan**: Tech Lead memutuskan **PATCH menang** (kartu `t_54bfee4e`; alasan di `docs/catatan-techlead.md:35-45`), kontrak §10.2 dikoreksi di `docs/kontrak-props.md:729-735`, rute diselaraskan di `routes/admin.php:48` oleh kartu `t_768819a7`, dan test disesuaikan oleh kartu QA ini (`t_d21ef249`). Bukti: `docs/bukti-backend-t_768819a7.txt` (`PATCH admin/pesan-masuk/{message}/baca`) + `docs/bukti-phpunit-t_d21ef249.txt` (suite exit 0).
2. **22 rute admin PRD §5.2 belum terdaftar** — **SELESAI 20 Okt 2026**. Saat K15 modul backend-nya belum dibangun padahal halaman Inertia-nya sudah ada; dicatat pada kartu **`t_70c96acd`** dan dibaselinekan di `RouteContractTest::PRD_5_2_BELUM_DIIMPLEMENTASI` agar test melaporkan Incomplete (bukan gagal) dan tetap peka terhadap rute baru yang menyimpang. Modul backend dibangun kartu `t_ed8bd8e4`; kini baseline **kosong** dan `test_rute_admin_inti_prd_5_2_terdaftar_semua` lulus tanpa Incomplete (bukti `docs/bukti-phpunit-t_d21ef249.txt`).
3. **Komponen halaman Inertia yang dirender controller tidak ada di `resources/js/Pages`** (5 halaman) → lihat QA-002.
4. **Artefak build kedaluwarsa terhadap sumber** → lihat QA-003.
5. **Kartu frontend `t_f4e537df`** berjudul "Halaman auth, keranjang, checkout QRIS, sukses + form rating", ditutup **done**, tetapi handoff-nya hanya mengklaim halaman auth. Empat halaman alur pemesanan tidak pernah dibuat → gap cakupan kartu (bukan sekadar bug kode).

## 3. Asumsi dan Pertanyaan Terbuka

| # | Pertanyaan | Status | Rekomendasi |
|---|---|---|---|
| Q1 | Sumber kebenaran metode `admin.messages.read`: PATCH (PRD) atau POST (kontrak + implementasi)? | **TERJAWAB** — kartu `t_54bfee4e` | **PATCH menang** (PRD adalah dokumen acuan; kontrak props berstatus DRAFT turunan PRD §5). Kontrak §10.2 dikoreksi, `routes/admin.php:48` diselaraskan (`t_768819a7`), test disesuaikan dan diverifikasi hijau oleh kartu `t_d21ef249`. PRD tidak diubah; catatan pemilik di `docs/pertanyaan-pemilik.md`. |
| Q2 | Apakah 22 rute admin §5.2 (produk/kategori/stok/pesanan/akun) tetap bagian rilis MVP saat ini? | **TERJAWAB** — kartu `t_ed8bd8e4` | Ya, dan sudah dikerjakan: 22 rute admin terdaftar di `routes/admin.php`; baseline `PRD_5_2_BELUM_DIIMPLEMENTASI` kini kosong dan lulus tanpa Incomplete (`docs/bukti-phpunit-t_d21ef249.txt`). |
| Q3 | Apakah target LCP < 2,5 s (4G) & Lighthouse mobile ≥ 85 diukur dengan alat resmi? | NON-BLOCKING | Belum dapat diukur di lingkungan ini (tidak ada Lighthouse/Chrome headless). Rekomendasi: ukur di kartu devops `t_56a2d29c`. |
| Q4 | Perilaku guest di `/keranjang` dan saat checkout wajib login — apakah redirect ke `/login` sudah disepakati? | NON-BLOCKING | Ikuti PRD §7.2 ("guest boleh di keranjang, wajib login saat checkout"); konfirmasi pola redirect (bukan halaman error). |
| Q5 | Kapan data contoh `[CONTOH]` (mis. `[CONTOH] Toko Kulot …`, produk contoh) diganti data nyata pemilik? | NON-BLOCKING | Sebelum rilis produksi. Saat ini label contoh tampil di footer/katalog publik — sesuai konvensi penandaan, tetapi tidak boleh ikut live. |

Asumsi yang dipakai (aman, tidak menahan pekerjaan): guard admin bernama `admin`; data uji memakai prefiks `[CONTOH]`; `phpunit.xml` memakai SQLite in-memory sehingga seluruh test tidak menyentuh data MySQL nyata.

## 4. Matriks Risiko dan Strategi Uji

| Area/Fitur | Kemungkinan Gagal | Dampak | Level Risiko | Strategi/Kedalaman Uji |
|---|---|---|---|---|
| Alur utama publik (`/`, `/produk`, detail) | Tinggi (terbukti gagal) | Pembeli tidak bisa melihat produk sama sekali | **Kritis** | Smoke browser nyata 3 viewport + verifikasi import komponen + inspeksi chunk build |
| Halaman keranjang/checkout/sukses & login admin | Tinggi (terbukti gagal) | Alur pesanan & login admin mustahil | **Kritis** | Bandingkan `Inertia::render()` dengan berkas `resources/js/Pages` + smoke browser |
| Kontrol akses admin | Sedang | Kebocoran data/aksi admin | Tinggi | Feature test otomatis lintas seluruh rute `admin.*` (tamu + pembeli + admin) |
| Kontrak rute PRD §5.1/§5.2 | Sedang | Fitur tak terjangkau/frontend salah metode | Tinggi | Traceability test nama rute + metode HTTP terhadap PRD |
| Perhitungan uang & stok (`priceForQty`, `mapStatus`, mutasi stok) | Sedang | Salah tagih/salah stok | Tinggi | Unit test boundary (qty minimum grosir, pemetaan status Midtrans, label varian) |
| Pengaturan & akun | Rendah | Fitur admin terganggu | Sedang | Feature/unit test round-trip + daftar putih key + rollback |
| Fondasi DB (`migrate:fresh --seed`) | Sedang | Deploy ulang gagal | Sedang | Feature test dari nol + idempotensi seeder |
| Kualitas tampilan (responsif, aksesibilitas, performa) | Sedang | Pengalaman pengguna | Sedang | Pengukuran lebar dokumen via browser; visual/Lighthouse belum diuji |

## 5. Test Case

### 5.1 Test case baru (K15) — 59 kasus, semuanya dieksekusi

| ID (nama metode) | Requirement/AC | Fitur | Skenario | Tipe | Prio | Status |
|---|---|---|---|---|---|---|
| `VariantSizeTest::test_rank_mengikuti_urutan_baku` | PRD §6 varian | VariantSize | S<M<L<XL<…<All Size; di luar daftar di akhir | Positif | P2 | Lulus |
| `VariantSizeTest::test_rank_tidak_peka_huruf_besar_kecil_dan_spasi` | PRD §6 | VariantSize | " xl ", "Xl", "ALL SIZE" dinormalkan | Boundary | P2 | Lulus |
| `VariantSizeTest::test_ukuran_di_luar_daftar_baku_dapat_peringkat_terakhir` | PRD §6 | VariantSize | Ukuran tak dikenal tidak mengacaukan urutan | Negatif | P3 | Lulus |
| `VariantSizeTest::test_sort_mengurutkan_baku_lalu_abjad_untuk_yang_tidak_dikenal` | PRD §6 | VariantSize | Urutan baku + abjad untuk sisanya | Positif | P2 | Lulus |
| `VariantSizeTest::test_sort_membuang_nilai_kosong_dan_duplikat` | PRD §6 | VariantSize | Dedupe + buang kosong | Edge | P2 | Lulus |
| `VariantSizeTest::test_sort_daftar_kosong_aman` | PRD §6 | VariantSize | Daftar kosong tidak error | Edge | P3 | Lulus |
| `ProductPricingTest::test_harga_eceran_dipakai_di_bawah_minimum_grosir` | PRD §6/§7.2 | Harga grosir | qty < minimum → harga eceran | Positif | P0 | Lulus |
| `ProductPricingTest::test_batas_minimum_grosir_tepat_di_qty_min` | PRD §7.2 | Harga grosir | qty == `min_wholesale_qty` → harga grosir (boundary) | Boundary | P0 | Lulus |
| `ProductPricingTest::test_tanpa_harga_grosir_selalu_eceran` | PRD §6 | Harga grosir | `wholesale_price` null → selalu eceran | Negatif | P1 | Lulus |
| `ProductPricingTest::test_minimum_grosir_nol_atau_kosong_tidak_aktif` | PRD §6 | Harga grosir | minimum 0/null tidak memicu grosir | Edge | P1 | Lulus |
| `ProductPricingTest::test_harga_coret_hanya_bermakna_bila_di_atas_harga_jual` | PRD §6 | compare_price | Coretan hanya bila lebih tinggi | Boundary | P2 | Lulus |
| `MidtransServiceTest::test_pemetaan_status_midtrans_ke_status_pembayaran` | PRD §7.3 | Midtrans | settlement/capture→settlement, pending, expire, deny, cancel | Positif | P0 | Lulus |
| `MidtransServiceTest::test_status_midtrans_tidak_dikenal_diabaikan` | PRD §7.3 | Midtrans | Status asing tidak mengubah pembayaran | Negatif | P1 | Lulus |
| `MidtransServiceTest::test_mode_fake_aktif_saat_server_key_kosong` | PRD §7.3 | Midtrans | Tanpa server key → mode fake | Edge | P1 | Lulus |
| `MidtransServiceTest::test_mode_fake_mengikuti_flag_konfigurasi` | PRD §7.3 | Midtrans | Flag konfigurasi dihormati | Positif | P1 | Lulus |
| `MidtransServiceTest::test_signature_valid_diterima` | PRD §7.3 | Midtrans | SHA512(order_id+status_code+gross_amount+server_key) valid | Positif | P0 | Lulus |
| `MidtransServiceTest::test_signature_salah_ditolak` | PRD §7.3 keamanan | Midtrans | Signature salah ditolak | Negatif | P0 | Lulus |
| `MidtransServiceTest::test_signature_dengan_field_tidak_lengkap_ditolak` | PRD §7.3 | Midtrans | Field kurang ditolak (tidak error 500) | Negatif | P1 | Lulus |
| `MidtransServiceTest::test_tanpa_server_key_dan_tanpa_mode_fake_notifikasi_ditolak` | PRD §7.3 | Midtrans | Fail-closed tanpa kunci | Keamanan | P0 | Lulus |
| `MidtransServiceTest::test_mode_fake_menerima_notifikasi_lokal` | PRD §7.3 | Midtrans | Notifikasi lokal mode fake diterima | Positif | P2 | Lulus |
| `StockServiceLabelTest::test_label_ukuran_dan_warna` | PRD §6 varian | Stok | "L / Merah" | Positif | P2 | Lulus |
| `StockServiceLabelTest::test_label_hanya_ukuran` | PRD §6 | Stok | "XL" | Positif | P2 | Lulus |
| `StockServiceLabelTest::test_label_tanpa_ukuran_memakai_sku` | PRD §6 | Stok | Fallback ke `sku` | Edge | P2 | Lulus |
| `StockServiceLabelTest::test_label_tanpa_varian_disebut_produk` | PRD §6 | Stok | Tanpa varian → label produk | Negatif | P3 | Lulus |
| `SettingServiceTest::test_teks_disimpan_dan_dibaca_kembali` | PRD §8 pengaturan | Pengaturan | put/get + baris DB (group `umum`, type `text`) | Positif | P1 | Lulus |
| `SettingServiceTest::test_nilai_kosong_dibaca_sebagai_null` | PRD §8 | Pengaturan | Nilai kosong tetap null (tanpa fallback) | Boundary | P2 | Lulus |
| `SettingServiceTest::test_nilai_cadangan_dipakai_hanya_bila_key_belum_ada` | PRD §8 | Pengaturan | Default hanya untuk key tidak ada | Negatif | P1 | Lulus |
| `SettingServiceTest::test_ongkir_disimpan_sebagai_integer_tanpa_desimal` | PRD §8 | Pengaturan | Ongkir integer | Positif | P1 | Lulus |
| `SettingServiceTest::test_ongkir_negatif_dijepit_ke_nol` | PRD §8 | Pengaturan | Ongkir negatif → 0 | Boundary | P1 | Lulus |
| `SettingServiceTest::test_bendera_boolean_dibaca_sebagai_boolean` | PRD §8 | Pengaturan | Flag boolean | Positif | P2 | Lulus |
| `SettingServiceTest::test_nilai_json_di_encode_dan_decode` | PRD §8 | Pengaturan | JSON round-trip | Edge | P2 | Lulus |
| `SettingServiceTest::test_key_di_luar_daftar_putih_ditolak` | PRD §8 | Pengaturan | Key tak dikenal ditolak | Negatif | P0 | Lulus |
| `SettingServiceTest::test_put_many_rollback_bila_ada_key_tidak_sah` | PRD §8 | Pengaturan | Simpan massal atomik (rollback) | Edge | P1 | Lulus |
| `SettingServiceTest::test_grouped_membagi_tujuh_grup_dan_menampung_key_luar_daftar` | PRD §8 | Pengaturan | Pengelompokan 7 grup | Positif | P2 | Lulus |
| `SettingServiceTest::test_key_tidak_dikenal_tidak_bisa_ditulis` | PRD §8 | Pengaturan | Tulis key asing ditolak | Keamanan | P1 | Lulus |
| `HomePageTest::test_beranda_tampil_dengan_props_kontrak` | PRD §5.1 `/` + kontrak §6.1 | Beranda | Komponen `Public/Home` + props kontrak | Positif | P0 | Lulus |
| `HomePageTest::test_beranda_tanpa_data_tetap_200_dengan_daftar_kosong` | PRD §5.1 | Beranda | State kosong tidak error | Negatif | P1 | Lulus |
| `HomePageTest::test_faq_beranda_dibatasi_enam_pertanyaan` | PRD §5.1 | Beranda | Batas 6 FAQ | Boundary | P2 | Lulus |
| `HomePageTest::test_jumlah_produk_unggulan_mengikuti_pengaturan` | PRD §8 | Beranda | Jumlah unggulan dari pengaturan | Integrasi | P1 | Lulus |
| `HomePageTest::test_batas_produk_unggulan_dijepit_antara_satu_dan_dua_puluh_empat` | PRD §8 | Beranda | Nilai ekstrem dijepit 1..24 | Boundary | P1 | Lulus |
| `HomePageTest::test_beranda_memuat_props_bersama` | Kontrak Inertia | Shared props | `auth`, `flash`, `settings` tersedia | Integrasi | P1 | Lulus |
| `AdminDashboardTest::test_dashboard_menampilkan_stats_sesuai_kontrak` | Kontrak §6.13 | Dashboard | Props `stats` sesuai kontrak | Positif | P0 | Lulus |
| `AdminDashboardTest::test_revenue_total_hanya_menghitung_order_masuk_akuntansi` | PRD §10 laporan | Dashboard | Pendapatan hanya status bayar/dikemas/dikirim/selesai | Positif | P0 | Lulus |
| `AdminDashboardTest::test_products_active_hanya_menghitung_produk_tayang` | PRD §6 | Dashboard | Hanya produk `tayang` dihitung | Positif | P0 | Lulus |
| `AdminRouteAccessTest::test_tamu_diarahkan_ke_login_admin` | PRD §5.2 otorisasi | Otorisasi | Semua rute `admin.*` menolak tamu → `/admin/login` | Keamanan | P0 | Lulus |
| `AdminRouteAccessTest::test_pembeli_tidak_bisa_menembus_panel_admin` | PRD §5.2 | Otorisasi | Pembeli (guard web) juga ditolak | Keamanan | P0 | Lulus |
| `AdminRouteAccessTest::test_terdapat_rute_admin_yang_diuji` | — | Otorisasi | Sanity: rute terdeteksi (menghindari lolos palsu) | Edge | P2 | Lulus |
| `AdminRouteAccessTest::test_admin_aktif_dapat_membuka_seluruh_rute_get_admin` | PRD §5.2 | Otorisasi | Admin sah membuka rute GET (200/404/redirect non-login) | Positif | P0 | Lulus |
| `AdminRouteAccessTest::test_form_login_admin_tampil_untuk_tamu` | PRD §5.2 | Login admin | Komponen `Admin/Login` dirender untuk tamu | Positif | P0 | Lulus |
| `AdminRouteAccessTest::test_form_login_admin_untuk_admin_yang_sudah_masuk` | PRD §5.2 | Login admin | Perilaku admin yang sudah login | Edge | P2 | Lulus |
| `RouteContractTest::test_rute_publik_prd_5_1_terdaftar_semua` | PRD §5.1 | Kontrak rute | 25 nama rute publik ada | Positif | P0 | Lulus |
| `RouteContractTest::test_rute_admin_inti_prd_5_2_terdaftar_semua` | PRD §5.2 + DoD §15.3 | Kontrak rute | Seluruh rute admin ada; baseline `PRD_5_2_BELUM_DIIMPLEMENTASI` kosong | Positif | P0 | **Lulus** (22 rute terdaftar lewat `t_ed8bd8e4`; diverifikasi ulang di `t_d21ef249`) |
| `RouteContractTest::test_metode_http_rute_publik_sesuai_prd` | PRD §5.1 | Kontrak rute | Metode HTTP (GET/POST/PATCH/DELETE) sesuai PRD | Integrasi | P0 | Lulus |
| `RouteContractTest::test_metode_http_rute_admin_sesuai_prd` | PRD §5.2 + kontrak §10.2 | Kontrak rute | Metode seluruh rute admin sesuai PRD, termasuk `admin.messages.read` = **PATCH** | Integrasi | P0 | **Lulus** (konflik ditutup: `t_54bfee4e` → `t_768819a7` → `t_d21ef249`) |
| `RouteContractTest::test_rute_publik_tidak_wajib_login` | PRD §5.1 | Kontrak rute | Katalog/kontak dapat diakses guest | Keamanan | P1 | Lulus |
| `FreshMigrationSeedTest::test_migrate_fresh_seed_berhasil` | DoD §15.1 | Fondasi DB | `migrate:fresh --seed` dari nol | Integrasi | P0 | Lulus |
| `FreshMigrationSeedTest::test_seeder_mengisi_data_contoh_untuk_alur_utama` | DoD §15.1 | Fondasi DB | `admins`, `categories`, `products` terisi | Integrasi | P0 | Lulus |
| `FreshMigrationSeedTest::test_seeder_dapat_dijalankan_dua_kali_tanpa_duplikasi` | DoD §15.1 | Fondasi DB | Seeder idempoten | Edge | P1 | Lulus |
| `FreshMigrationSeedTest::test_struktur_tabel_wajib_prd_6_tersedia` | PRD §6 | Fondasi DB | 18 tabel wajib ada | Integrasi | P1 | Lulus |

### 5.2 Test warisan (kartu backend) — 116 kasus, ikut dieksekusi

| Suite | Kasus | Cakupan |
|---|---|---|
| `Feature/Auth/*` (AdminAuth, Login, Registration, PasswordReset) | 37 | Login/registrasi dua guard, reset password, otorisasi |
| `Feature/Catalog/*` (Index, Show, Contact) | 24 | Filter/sort/pagination katalog, detail, halaman & form kontak |
| `Feature/Checkout/*` (Cart, Checkout) | 21 | Keranjang (CRUD, harga grosir), checkout, QRIS, status |
| `Feature/Reviews/ReviewSubmitTest` | 7 | Kirim ulasan bintang |
| `Feature/Messages/ContactMessageTest` | 4 | Simpan pesan masuk |
| `Feature/Admin/AdminInboxTest`, `AdminSettingTest` | 23 | Pesan masuk + balasan, CRUD pengaturan/akun |

Semua test warisan **lulus** pada eksekusi terakhir.

## 6. Traceability Matrix

| Requirement/AC | Test Case (berkas) | Cakupan | Status |
|---|---|---|---|
| PRD §5.1 rute publik (25) + metode | `Feature/Contract/RouteContractTest` | Rute terdaftar & metode sesuai | Lulus |
| PRD §5.2 rute admin + metode | `RouteContractTest`, `AdminRouteAccessTest` | 22 rute modul sudah terdaftar (`t_ed8bd8e4`) + metode sesuai PRD (PATCH `admin.messages.read` dikonfirmasi `t_d21ef249`); otorisasi lulus | **Lulus** (suite `t_d21ef249`, exit 0) |
| PRD §6 model & tabel | `FreshMigrationSeedTest`, unit model | 18 tabel + aturan harga/varian | Lulus |
| PRD §7.1 katalog publik | `Feature/Catalog/*` | Filter, sort, pagination 12/halaman, detail | Lulus (HTTP) |
| PRD §7.2 keranjang & harga grosir | `Unit/Models/ProductPricingTest`, `Checkout/CartTest` | Perhitungan harga + CRUD keranjang | Lulus (HTTP) |
| PRD §7.2–7.4 checkout & QRIS | `Feature/Checkout/CheckoutTest`, `Unit/Services/MidtransServiceTest` | Status pembayaran, signature, fail-closed | Lulus (backend); **UI blank** → QA-002 |
| PRD §8 pengaturan | `Unit/Services/SettingServiceTest`, `AdminSettingTest` | put/get, tipe, daftar putih, rollback | Lulus |
| PRD §9 stok & mutasi | `Unit/Services/StockServiceLabelTest`, `AdminInboxTest` terkait | Label varian + mutasi | Lulus sebagian (mutasi stok lanjutan tidak fokus K15) |
| PRD §10 laporan | `AdminDashboardTest` | Pendapatan = status dibayar/dikemas/dikirim/selesai | Lulus (dashboard); modul `/admin/laporan` kini sudah ada rutenya (`t_ed8bd8e4`) |
| PRD §11–§12 privasi & validasi | `Auth/*`, `Messages/*`, `Reviews/*` | Validasi input & otorisasi | Lulus |
| DoD §15.1 `migrate:fresh --seed` | `FreshMigrationSeedTest` | Berlhasil + idempoten | Lulus |
| DoD §15.2 `npm run build` | — | Bukan wewenang QA (kartu `t_56a2d29c`); artefak saat ini kedaluwarsa | Belum diuji QA (temuan QA-003) |
| DoD §15.3 semua rute §5 ada | `RouteContractTest` | 25 rute publik + 22 rute admin + metode | **Lulus** (diverifikasi ulang `t_d21ef249`: baseline kosong, suite exit 0) |
| DoD §15.6 responsif 360/768/1280 | smoke browser | Terukur tekstual; 7/8 halaman blank sehingga penilaian visual belum bermakna | Sebagian |
| DoD §15.7 alur utama ujung ke ujung | smoke browser | `/`, `/produk`, `/keranjang`, `/admin/login` blank | **Gagal** (QA-001, QA-002) |
| DoD §16 kualitas publik (LCP, Lighthouse) | — | Tidak ada alat ukur di lingkungan ini | Belum diuji |

## 7. Otomatisasi

- Berkas test (baru): `tests/Unit/Support/VariantSizeTest.php`, `tests/Unit/Models/ProductPricingTest.php`, `tests/Unit/Services/MidtransServiceTest.php`, `tests/Unit/Services/StockServiceLabelTest.php`, `tests/Unit/Services/SettingServiceTest.php`, `tests/Feature/Public/HomePageTest.php`, `tests/Feature/Admin/AdminDashboardTest.php`, `tests/Feature/Admin/AdminRouteAccessTest.php`, `tests/Feature/Contract/RouteContractTest.php`, `tests/Feature/Database/FreshMigrationSeedTest.php`.
- Berkas `tests/Feature/ExampleTest.php` dan `tests/Unit/ExampleTest.php` (stub bawaan, hanya menguji `/` mengembalikan 200) dihapus agar suite tidak memberi rasa aman palsu.
- Cara menjalankan (tanpa instalasi apa pun, memakai PHP Laragon yang sudah ada):

```bash
export PHP_INI_SCAN_DIR="C:/Users/LENOVO/AppData/Local/hermes/profiles/qatesting/cache/scratch/phpsqlite"
php artisan test
```

`99-sqlite.ini` pada direktori scan itu hanya menyalakan `pdo_sqlite` + `sqlite3` (dipakai `phpunit.xml` sebagai basis data test). Tidak ada `php.ini`, `.env`, `.env.example`, atau konfigurasi proyek yang diubah QA.
- Log eksekusi penuh: `docs/bukti-phpunit-k15.txt`.
- Smoke browser memakai Browser Use (Chromium) — bukan bagian dari CI, dijalankan manual pada 20 Okt 2026.

## 8. Hasil Eksekusi

### 8.1 PHPUnit

```
Tests:    2 incomplete, 173 passed (996 assertions)
Duration: 49.78s
exit code 0
```

Dua Incomplete adalah gap yang **sengaja** dibaselinekan (bukan kelalaian) pada run K15: 22 rute admin yang belum dibangun (`t_70c96acd`) dan konflik dokumen PATCH/POST (`t_d98cf23d`). **Keduanya sudah ditutup — lihat §8.1b.**

### 8.1b Suite PHPUnit terbaru — penutupan QA-005 (kartu `t_d21ef249`, 20 Okt 2026)

```
Tests:    190 passed (1111 assertions)
Duration: 54.52s
exit code 0
```

0 failed, **0 incomplete**, 0 skipped. Yang diverifikasi: (a) `tests/Feature/Admin/AdminInboxTest.php:147` `->post(...)` menjadi `->patch(...)`; (b) `tests/Feature/Contract/RouteContractTest.php` kehilangan konstanta `KONFLIK_METODE_RUTE_ADMIN` dan cabang `markTestIncomplete` — rute hilang atau bermetode salah kini **gagal**, bukan Incomplete; (c) dua test kontrak rute admin lulus (`rute admin inti prd 5 2 terdaftar semua`, `metode http rute admin sesuai prd`). Bukti mentah lengkap (termasuk `php -l` dan `route:list`): `docs/bukti-phpunit-t_d21ef249.txt`.

### 8.2 Smoke browser (Chromium, cache dimatikan, URL diberi cache-buster)

| Halaman | HTTP | Komponen Inertia | Console error | Konten tampil |
|---|---|---|---|---|
| `/` (360/768/1280 px) | 200 | `Public/Home` | `Uncaught ReferenceError: PriceBlock is not defined` | **Tidak** (blank) |
| `/produk` (360 px) | 200 | `Public/Products/Index` | `PriceBlock is not defined` | **Tidak** (blank) |
| `/produk/setelan-kulot-linen-lengan-panjang` (360 px) | 200 | `Public/Products/Show` | `PriceBlock is not defined` | **Tidak** (blank) |
| `/kontak-kami` (360 px) | 200 | `Public/Contact` | tidak ada | Ya (814 karakter teks, tanpa overflow) |
| `/login` (360 px) | 200 | `Public/Auth/Login` | `Page not found: ./Pages/Public/Auth/Login.jsx` | **Tidak** |
| `/register` (360 px) | 200 | `Public/Auth/Register` | `Page not found: ./Pages/Public/Auth/Register.jsx` | **Tidak** |
| `/keranjang` (360 px) | 200 | `Public/Cart` | `Page not found: ./Pages/Public/Cart.jsx` | **Tidak** |
| `/admin/login` (360 px) | 200 | `Admin/Login` | `Page not found: ./Pages/Admin/Login.jsx` | **Tidak** |
| `/checkout` (curl) | 302 | — (redirect) | — | n/a |
| `/produk/tidak-ada-produk-ini` (curl) | 404 | — | — | Ya, sesuai (slug tak dikenal → 404) |

Catatan positif: server membawa 12 produk pada props `/produk` (pagihan default 12 sesuai PRD), slug tak dikenal mengembalikan **404** dengan benar, dan halaman `/kontak-kami` bebas error serta tanpa overflow horizontal di 360 px.

## 9. Bug Report

### QA-001 — `/`, `/produk`, `/produk/{slug}` blank karena `PriceBlock` tidak diimpor
- **Severity/Prio**: Critical / P0 — **Komponen**: Frontend — **Status**: Terbuka (kartu **`t_7cbe34dc`**)
- **Environment**: `http://127.0.0.1:8000`, Chromium (Browser Use), 360/768/1280 px, build `public/build` 13:09:35, role: tamu
- **Langkah reproduksi**: 1) buka `/` 2) buka `/produk` 3) buka `/produk/setelan-kulot-linen-lengan-panjang`
- **Hasil aktual**: halaman kosong (innerText 0 karakter); console `Uncaught ReferenceError: PriceBlock is not defined`; props server tetap benar (12 produk).
- **Hasil yang diharapkan** (PRD §5.1, design §4.2, komponen §1): grid produk dengan nama + harga (+ harga coret & badge potongan bila ada `compare_price`).
- **Bukti**: pesan console di atas; `resources/js/Components/ProductCard.jsx:102` memakai `<PriceBlock …>` sedangkan importnya (baris 1–5) tidak memuat `PriceBlock` (komponen ada di `resources/js/Components/PriceBlock.jsx`); chunk build `public/build/assets/ProductGrid-BSmUR2l-.js` memuat 1 pemakaian `jsx(PriceBlock,{…})` dan **0 definisi** `PriceBlock`, dengan blok import hanya dari `app-*.js`, `icons-*.js`, `Skeleton-*.js`, `InlineNotice-*.js`.
- **Frekuensi**: selalu. **Dugaan penyebab**: import hilang (Vite tidak typecheck sehingga build tetap sukses).

### QA-002 — Lima halaman Inertia yang dirender controller tidak ada
- **Severity/Prio**: Critical / P0 — **Komponen**: Frontend — **Status**: Terbuka (kartu **`t_4dd28407`**)
- **Langkah reproduksi**: buka `/keranjang`, `/admin/login`, `/checkout`, `/checkout/{order}/bayar`, `/checkout/{order}/sukses` (perlu login/order untuk dua terakhir)
- **Hasil aktual**: `/keranjang` & `/admin/login` HTTP 200 tetapi blank dengan console `Page not found: ./Pages/Public/Cart.jsx` dan `./Pages/Admin/Login.jsx`.
- **Hasil yang diharapkan**: halaman keranjang (ubah qty, hapus, subtotal, harga grosir otomatis), form checkout, halaman QRIS + status, halaman sukses + form rating, dan form login admin.
- **Bukti**: `CartController.php:23` → `Public/Cart`; `CheckoutController.php:46,96,150` → `Public/Checkout`, `Public/CheckoutPay`, `Public/CheckoutSuccess`; `Admin/AuthController.php:21` → `Admin/Login`. Berkas-berkas itu tidak ada di `resources/js/Pages` dan `git log --all` untuk path tersebut kosong (belum pernah ada). Props HTML mengonfirmasi `"component":"Public/Cart"` dan `"component":"Admin/Login"`.
- **Frekuensi**: selalu. **Catatan proses**: kartu frontend `t_f4e537df` ditutup done padahal hanya bagian auth yang dikerjakan.

### QA-003 — Artefak build kedaluwarsa terhadap sumber (4 halaman auth hilang dari bundle)
- **Severity/Prio**: High / P1 — **Komponen**: Environment/Build — **Status**: Terbuka (komentar di kartu **`t_56a2d29c`**)
- **Hasil aktual**: `/login` & `/register` (dan `/lupa-password`, `/reset-password`) blank; bundle `public/build/assets/*.js` bertimestamp 13:09:35 sedangkan `resources/js/Pages/Public/Auth/*.jsx` ditulis 13:12:14–13:12:41. Grep bundle: `Public/Auth/Login` tidak ditemukan.
- **Hasil yang diharapkan**: `npm run build` dijalankan setelah perubahan frontend sehingga artefak memuat seluruh halaman (DoD §15.2).
- **Frekuensi**: selalu untuk artefak saat ini. **Dampak**: build produksi akan mengirim halaman blank meski sumber sudah benar.

### QA-004 — 22 rute admin PRD §5.2 belum terdaftar (5 modul tanpa backend)
- **Severity/Prio**: High / P1 — **Komponen**: Backend/Requirement — **Status**: **Terverifikasi — ditutup 20 Okt 2026** (verifikasi kartu `t_d21ef249`)
- **Bukti awal**: `RouteContractTest::test_rute_admin_inti_prd_5_2_terdaftar_semua` melaporkan 22 nama rute hilang: `admin.products.*` (7), `admin.categories.*` (4), `admin.stocks.*` (4), `admin.orders.*` (3), `admin.accounts.*` (4). Halaman Inertia-nya sudah dibangun (kartu `t_3eef7749`).
- **Dampak saat terbuka**: DoD §15.3 belum terpenuhi; PRD §5.2 (baris 147–155, 167–170) belum tercakup.
- **Penyelesaian & verifikasi**: modul backend + 22 rute dibangun oleh kartu `t_ed8bd8e4`; baseline `PRD_5_2_BELUM_DIIMPLEMENTASI` dikosongkan. Pada run `t_d21ef249` test kontrak rute admin lulus dan tidak lagi Incomplete; `php artisan route:list` menampilkan rute admin terkait (mis. `PATCH admin/pesan-masuk/{message}/baca`). Bukti: `docs/bukti-phpunit-t_d21ef249.txt`.

### QA-005 — Konflik dokumen metode `admin.messages.read`
- **Severity/Prio**: Medium / P2 — **Komponen**: Requirement/Dokumentasi — **Status**: **Terverifikasi — ditutup 20 Okt 2026** (verifikasi kartu `t_d21ef249`)
- **Bukti awal**: `docs/PRD.md` §5.2 baris 157 (PATCH) vs `docs/kontrak-props.md` §10.2 baris 729 (POST). Implementasi + frontend memakai POST.
- **Dampak saat terbuka**: spesifikasi dan kode tidak sinkron; test melaporkan Incomplete sampai ada keputusan Tech Lead.
- **Penyelesaian**: keputusan Tech Lead **PATCH menang** (kartu `t_54bfee4e`; tercatat di `docs/catatan-techlead.md`), kontrak §10.2 dikoreksi (`docs/kontrak-props.md:729-735`), rute `routes/admin.php:48` menjadi `Route::patch(...)` (kartu `t_768819a7`), test disesuaikan (kartu `t_d21ef249`).
- **Verifikasi QA (`t_d21ef249`)**: `route:list` → `PATCH admin/pesan-masuk/{message}/baca`; `AdminInboxTest` lulus memakai `->patch(...)` (sebelumnya 405 karena `->post(...)`); suite penuh 190 passed / 0 failed / 0 incomplete, exit 0. Bukti: `docs/bukti-phpunit-t_d21ef249.txt`.

### QA-006 — Cakupan kartu frontend tidak sesuai judul (proses/DoD)
- **Severity/Prio**: Low / P3 (proses) — **Komponen**: Requirement/Proses — **Status**: Dicatat
- **Bukti**: kartu `t_f4e537df` berjudul "…keranjang, checkout QRIS, sukses + form rating" tetapi handoff-nya hanya mengklaim halaman auth; empat halaman lain tidak pernah dibuat (lihat QA-002). Tidak dibuatkan kartu baru karena `t_4dd28407` sudah menutup pekerjaannya; dicatat sebagai bahan retro agar DoD kartu diverifikasi terhadap judul, bukan terhadap narasi handoff.

### QA-007 — Tautan sidebar admin masih dinonaktifkan padahal rutenya sudah ada (navigasi antar-modul admin putus)
- **Severity/Prio**: Medium / P2 — **Komponen**: Frontend — **Status**: Terbuka (temuan QA `t_d21ef249`; kartu perbaikan **`t_6ee422f2`**, assignee `frontenddeveloper`, menunggu di `todo` karena bergantung pada kartu ini)
- **Environment**: `resources/js/Layouts/AdminLayout.jsx` (K13 `t_bae93e32`), halaman admin K14 `t_3eef7749`; rute admin kini terdaftar (K-backend `t_ed8bd8e4`)
- **Langkah reproduksi**: 1) login admin 2) buka `/admin/produk` (URL langsung) 3) perhatikan sidebar.
- **Hasil aktual**: item `produk`, `kategori`, `stok`, `pesanan`, `pesan`, `penilaian`, `pengaturan`, `akun` dirender sebagai `<span aria-disabled="true">`, bukan `<Link>` (AdminLayout.jsx:95-102), sehingga tidak bisa diklik. Hanya Dashboard, Pesan, dan Pengaturan yang mengirim `nav` kustom untuk mengaktifkan itemnya sendiri (`Pages/Admin/Messages/Index.jsx:48`, `Pages/Admin/Settings/Index.jsx:71-72`). Halaman Produk/Kategori/Stok/Pesanan/Akun/Penilaian memakai `ADMIN_NAV` bawaan, jadi dari `/admin/produk` admin hanya bisa kembali ke Dashboard.
- **Hasil yang diharapkan**: sidebar admin dapat dipakai berpindah antar-modul yang rutenya sudah ada (design §5.10; DoD §15.8 "admin bisa kelola semua").
- **Bukti**: `resources/js/Layouts/AdminLayout.jsx:23-35` — komentar lama "Item nav yang rutenya belum ada di `routes/admin.php` ditandai `disabled`" sudah tidak berlaku; `docs/catatan-frontend.md:92-93` mencatat alasan asal (rute belum ada). Verifikasi rute: `docs/bukti-phpunit-t_d21ef249.txt` §1 (`admin/pesan-masuk`, `admin/pesan-masuk/{message}/baca`, `admin/pesan-masuk/{message}/balas` PATCH/POST terdaftar) dan `RouteContractTest` "rute admin inti prd 5 2 terdaftar semua" **Lulus**.
- **Dampak**: admin tidak dapat menjangkau modul pengelolaan dari UI (workaround: mengetik URL). Tidak memblokir alur belanja pembeli; bukan penghalang GO sendirian, tetapi menghalangi DoD §15.8 secara UI.
- **Frekuensi**: selalu. **Dugaan penyebab**: flag `disabled` dipasang saat rute admin belum dibangun (K13) dan belum dicabut setelah rute + halaman admin selesai (K14/backend).

## 10. Hasil Non-Fungsional dan Batasan

- **Responsif**: diukur objektif (`documentElement.scrollWidth` vs `innerWidth`) pada 360/768/1280 px. Tidak ditemukan overflow horizontal di halaman yang benar-benar merender (mis. `/kontak-kami`). Penilaian tata letak visual, foto produk, skeleton, dan bottom sheet **belum diuji secara visual** — QA bekerja text-first, tidak menilai gambar.
- **Konsol browser**: satu-satunya halaman bersih dari error adalah `/kontak-kami`; 7 halaman lain blank dengan error runtime (QA-001/QA-002/QA-003).
- **Performa**: target PRD (LCP < 2,5 s pada 4G, Lighthouse mobile ≥ 85 untuk `/` & `/product`) **belum diuji** — tidak ada Lighthouse/Chrome headless di lingkungan ini. Tidak ada klaim terpenuhi.
- **Keamanan**: hanya pengujian dasar berbasis HTTP/test (otorisasi rute admin untuk tamu, pembeli, dan admin; validasi signature Midtrans fail-closed; daftar putih key pengaturan; 404 untuk slug tak dikenal). Tidak ada pentest, uji rate-limit, atau pemindaian kerentanan.
- **Aksesibilitas**: belum diuji dengan screen reader. Yang dapat diamati dari DOM: tautan "Lewati ke konten utama" tersedia pada layout publik dan kontrol memiliki teks (bukan ikon telanjang). Kontras, fokus, dan urutan tab belum diverifikasi.
- **Kompatibilitas**: hanya satu browser (Chromium) pada tiga lebar viewport; belum diuji pada Safari/Firefox/WebKit atau perangkat nyata.
- **Data**: seluruh test memakai basis data test in-memory; smoke browser dijalankan sebagai tamu tanpa mengirim pesan kontak, tanpa pesanan, dan tanpa aksi destruktif. Data contoh `[CONTOH]` masih tampil di UI publik — sesuai konvensi penandaan, tetapi harus diganti pemilik sebelum rilis (Q5).

## 11. Self-Review Checklist

- [x] Acceptance criteria utama dipetakan ke test case (lihat §6) dan gap modul admin dicatat.
- [x] Area risiko tinggi (alur utama, otorisasi, uang, stok, QRIS) diuji lebih dulu dan paling dalam.
- [x] Test negatif, boundary, edge case, otorisasi, dan state kosong disertakan.
- [x] Pengujian sesuai arsitektur Inertia (tidak mengarang endpoint `/api` katalog).
- [x] Tidak ada klaim uji yang belum dieksekusi; yang belum diuji ditulis "Belum diuji".
- [x] Setiap bug punya langkah reproduksi, expected result bersumber, dan bukti aman (tanpa kredensial/cookie/secret).
- [x] Keterbatasan lingkungan dan risiko tersisa dicatat (§10).
- [x] Tidak ada berkas di luar `docs/` dan `tests/` yang diubah QA; `.env` tidak dibaca/dimodifikasi.
- [x] Keputusan Go/No-Go disertai alasan berbasis bukti.

## 12. Rekomendasi Go/No-Go

**NO-GO** untuk rilis saat ini.

Alasan:
1. **QA-001 (Critical)** — beranda, katalog, dan detail produk blank: alur belanja utama tidak dapat digunakan sama sekali.
2. **QA-002 (Critical)** — keranjang, checkout, halaman bayar/sukses, dan form login admin belum ada komponennya: alur pemesanan dan akses admin mustahil.
3. **QA-003 (High)** — artefak build tidak memuat halaman auth; walau sumber sudah benar, apa yang dikirim ke produksi tetap blank.

Syarat menuju GO:
1. Perbaiki QA-001 (`t_7cbe34dc`) dan QA-002 (`t_4dd28407`).
2. Jalankan `npm run build` setelah perbaikan frontend, lalu verifikasi smoke browser 7 halaman wajib: `/`, `/produk`, `/produk/{slug}`, `/kontak-kami`, `/login`, `/keranjang`, `/admin/login` tanpa console error (`t_56a2d29c`).
3. ~~Putuskan QA-005 (`t_d98cf23d`) dan selesaikan QA-004 (`t_70c96acd`).~~ **Selesai 20 Okt 2026**: metode `admin.messages.read` diputuskan **PATCH** (`t_54bfee4e`, rute diperbaiki `t_768819a7`, diverifikasi `t_d21ef249`) dan 22 rute admin sudah terdaftar (`t_ed8bd8e4`) — kedua test kontrak rute lulus tanpa Incomplete.
4. Ukur LCP/Lighthouse untuk `/` dan `/product` (DoD §16) atau nyatakan sebagai risiko yang diterima pemilik.
5. Perbaiki **QA-007 (Medium/P2)** — sidebar admin masih menonaktifkan tautan ke modul yang rutenya sudah ada, sehingga DoD §15.8 belum terpenuhi secara UI. Bukan penghalang GO sendirian (workaround: URL langsung), tetapi harus ditutup sebelum rilis dianggap lengkap.

Setelah syarat 1–2 terpenuhi, QA akan melakukan verifikasi ulang (regresi area terkait + smoke browser + `php artisan test`) untuk mengeluarkan rekomendasi GO bersyarat.

Kondisi yang **sudah** baik dan tidak perlu dikerjakan ulang: otorisasi panel admin untuk tamu/pembeli/admin lulus, seluruh rute publik §5.1 terdaftar dengan metode yang benar, perhitungan harga eceran/grosir dan pemetaan status Midtrans lulus beserta fail-closed saat kunci tidak tersedia, pengaturan memiliki daftar putih key + rollback, `migrate:fresh --seed` idempoten, halaman kontak bersih tanpa error, dan slug tak dikenal mengembalikan 404.

---

## 13. Verifikasi Nomor Resi Manual — Kartu `t_2c9f8b01` (21 Oktober 2026)

- **Kartu**: `t_2c9f8b01` (assignee `qatesting`) — verifikasi butir kontrak §12.18a (fitur PRD **A15**, deviasi desain **D12**) terhadap kode nyata.
- **Sumber acuan**: `docs/PRD.md:375` (A15), `docs/kontrak-props.md:1364` (§12.17) dan `:1391-1403` (§12.18a), `docs/design.md:869` (drift D12), `docs/keputusan-a15-resi.md` §1 (teks beku + pembagian pemilik).
- **Bukti mentah**: `docs/bukti-qa-t_2c9f8b01.txt` (E1–E9: keluaran `route:list`, PHPUnit terfokus & penuh, curl tamu, potongan kode verbatim, md5 berkas yang direview, catatan harness).
- **Batas kerja QA**: tidak mengubah kode, tidak membaca/mengubah `.env`, tidak menyalakan server, tidak memakai kredensial. Server `http://127.0.0.1:8000` milik pemilik hanya diperiksa sebagai tamu (GET/PATCH tanpa sesi).

### 13.1 Hasil per aspek

| Aspek | Hasil | Bukti |
|---|---|---|
| Rute terdaftar | **Lulus** — `PATCH admin/pesanan/{order}/resi` → `admin.orders.resi` → `Admin\OrderController@resi`, di dalam grup `middleware('admin')` (guard `admin`, prefix `/admin`) + `throttle:admin-write` | E1 (route:list, 4 rute); `routes/admin.php:41` (grup admin), `:139-141` (rute), `:140` (throttle); prefix/nama `admin` di `bootstrap/app.php:14-18` |
| Rantai vertikal | **Lulus** — migrasi `2026_10_21_000019` (`string('tracking_number',60)->nullable()->after('paid_at')`, `up`/`down`) → `Order::$fillable` → request → controller → `Show.jsx:185` → `InfoResi.jsx` | E5; `database/migrations/2026_10_21_000019_*.php:13-24`; `app/Models/Order.php:135` |
| Props §12.17 | **Lulus** — `pesanan.tracking_number` (string/`null`) terkirim di detail pesanan | uji `test_detail_pesanan_memuat_props_nomor_resi`; `OrderController::detail()` |
| Validasi §12.18a | **Lulus** — `'tracking_number' => ['nullable','string','max:60']`; `''` → `null` lewat `prepareForValidation` | `app/Http/Requests/Admin/UpdateOrderTrackingRequest.php:23-28,41-50` |
| Batas 60 + tipe | **Lulus** — 60 karakter diterima; 61 ditolak (`Nomor resi maksimal 60 karakter.`); array ditolak (`Nomor resi harus berupa teks.`); 61 → **HTTP 422** `errors.tracking_number.0` untuk klien JSON | uji `test_nomor_resi_lebih_dari_60_karakter_ditolak`, `test_nomor_resi_terlalu_panjang_membalas_422_untuk_klien_json` |
| Simpan | **Lulus** — hanya `orders.tracking_number` yang berubah; `back()->with('success','Nomor resi pesanan diperbarui.')` | `OrderController.php:142-147`; uji `test_simpan_nomor_resi_hanya_mengubah_kolom_resi` |
| Kosong = hapus | **Lulus** — kosong/`null` menghapus resi; status, stok, dan pembayaran tidak tersentuh | uji `test_nomor_resi_kosong_menghapus_nomor_resi` |
| Otorisasi | **Lulus** — tamu dan pembeli (`guard web`) diarahkan ke `/admin/login`, resi tetap `null`. HTTP nyata: `GET /admin/pesanan/1` → **302** → `/admin/login`; `PATCH .../resi` tamu tanpa CSRF → **419** (CSRF dievaluasi lebih dulu — normal, bukan defect) | uji `test_bukan_admin_tidak_bisa_menyimpan_nomor_resi`; E4 |
| Migrasi reversible | **Lulus** — `down()` membuang kolom, `up()` membuat ulang, di dalam test | uji `test_migrasi_nomor_resi_punya_up_dan_down` |
| UI sesuai teks beku D12 | **Lulus (inspeksi kode + bundel)** — label `Nomor resi`; bantuan `Isi nomor resi dari ekspedisi setelah paket dikirim. Kosongkan untuk menghapus.`; status `Belum ada nomor resi.` / `Tersimpan: <nomor>`; tombol `Simpan resi` dengan `Button loading` (`Memproses…`); galat `errors.tracking_number` di bawah input; `preserveScroll`; tanpa toast/state baru | `InfoResi.jsx:9-14,18,61-88`; bundel `public/build/assets/InfoResi-DZ0JiCIB.js` (grep string, E7/E7b) |
| Suite penuh (regresi) | **Lulus** — `OK (218 tests, 1492 assertions)`, exit 0; terfokus `AdminSalesTest` **14 passed (113 assertions)** | E2, E3 |

### 13.2 Traceability §12.18a → test case

| Butir §12.18a | Test/sumber | Status |
|---|---|---|
| Field opsional, teks, maks 60 | `test_nomor_resi_lebih_dari_60_karakter_ditolak` (60 ok / 61 tolak / array tolak) | Lulus |
| Kosong/`null` = menghapus | `test_nomor_resi_kosong_menghapus_nomor_resi`; `UpdateOrderTrackingRequest.php:45-49` | Lulus |
| Galat `errors.tracking_number` (2 pesan) | `test_nomor_resi_lebih_dari_60_karakter_ditolak`; `test_nomor_resi_terlalu_panjang_membalas_422_untuk_klien_json` | Lulus |
| Hanya `orders.tracking_number` yang berubah | `test_simpan_nomor_resi_hanya_mengubah_kolom_resi` | Lulus |
| Sukses: kembali ke halaman asal + `flash.success` (teks beku) | `test_...` (`assertSessionHas('success','Nomor resi pesanan diperbarui.')`); `OrderController.php:146` | Lulus |
| Tanpa email/notifikasi | inspeksi `resi()`: hanya `update()` + flash, tanpa Mail/Notification/event | Lulus (inspeksi) |
| `pesanan.tracking_number` di props (§12.17) | `test_detail_pesanan_memuat_props_nomor_resi` | Lulus |
| Akses non-admin ditolak | `test_bukan_admin_tidak_bisa_menyimpan_nomor_resi`; E4 | Lulus |

### 13.3 Observasi (non-blocking; tidak dibuatkan kartu perbaikan)

- **O-1 (P3, jalur hapus tak sengaja)**: karena `tracking_number` `nullable` dan `prepareForValidation` hanya menormalkan bila isinya string (`UpdateOrderTrackingRequest.php:45`), permintaan yang **tidak mengirim field sama sekali** (mis. body `{}`) menghasilkan `validated('tracking_number') === null` sehingga resi **terhapus tanpa galat**. Ini masih sesuai bunyi §12.18a (“kosong/`null` = menghapus”) dan klien saat ini selalu mengirim field, jadi **bukan defect** — tetapi bila nanti ada pemanggil lain yang mengirim body parsial, ini jalur penghapusan diam-diam. Saran opsional (bukan wajib): tambah aturan `sometimes` bila semantiknya ingin diperketat, atau pastikan setiap klien mengirim field eksplisit.
- **O-2 (P3, dokumentasi)**: pointer baris A15 tidak konsisten — `docs/keputusan-a15-resi.md:29` menulis `docs/PRD.md:391`, sedangkan A15 ada di `docs/PRD.md:375` (dan itu yang dipakai `docs/design.md` baris D12). Tidak memengaruhi perilaku; cukup disunting pemilik dokumen keputusan pada penyuntingan berikutnya.

### 13.4 Belum diuji (batas eksplisit, bukan klaim lulus)

1. **Klik nyata di browser dengan sesi admin** (PATCH end-to-end + render galat/sukses + pemeriksaan visual/state `loading`): QA tidak memakai kredensial dan tidak menjalankan browser pada kartu ini. Jalur yang sama sudah tertutup di level HTTP oleh feature test. Ini juga tercatat sebagai “yang belum dicek” di `docs/keputusan-a15-resi.md` §4.
2. **Penulisan nyata ke MySQL milik pemilik setelah migrasi dijalankan**: QA tidak menjalankan migrasi (aturan kartu); test memakai SQLite sementara di scratch QA.
3. **Rate limit `throttle:admin-write` pada rute resi**: terpasang (`routes/admin.php:140`), tetapi perilakunya belum diuji (butuh banyak request terautentikasi).
4. **Aksesibilitas terukur (screen reader/axe) dan LCP/Lighthouse**: di luar cakupan kartu ini.

### 13.5 Kesimpulan kartu `t_2c9f8b01`

Fitur nomor resi manual (A15 / §12.17 / §12.18a / deviasi D12) **LULUS** pada seluruh butir yang dapat diperiksa tanpa kredensial dan tanpa browser: rute + middleware, rantai migrasi→model→request→controller→props, validasi & batas 60, efek-ubah-hanya-kolom-resi, kosong-menghapus, otorisasi, teks UI, dan kehadirannya di bundel rilis. **Tidak ada defect baru** dan **tidak ada kartu perbaikan** yang dibuat dari kartu ini; dua observasi P3 (O-1, O-2) tidak menghalangi. Risiko sisa: butir §13.4 (1) dan (2), serta bundel rilis yang terus berubah karena build paralel (E7b) — build akhir tetap tanggung jawab gerbang rilis. Bagian ini **tidak mengubah §12**: rekomendasi GO/NO-GO rilis tetap mengikuti syarat §12 dan hasil kartu rilis/frontend terkait.

**Self-review kartu ini**: seluruh acceptance criteria §12.18a dipetakan (13.2); area risiko tinggi (otorisasi, batas panjang, hapus) diuji; tidak ada klaim pengujian yang tidak dieksekusi (E1–E9 hanya berisi keluaran nyata); berkas yang ditulis hanya `docs/bukti-qa-t_2c9f8b01.txt` dan bagian ini; `.env` tidak disentuh.

### 13.6 Verifikasi ulang oleh run penyelesaian (§E10)

Percobaan pertama kartu ini menyelesaikan pengujian tetapi berhenti tanpa penutupan papan, sehingga bukti E1–E9 sudah ada saat run penyelesaian dimulai. Run penyelesaian **tidak menyalin klaim**: seluruh berkas diukur ulang md5-nya (identik dengan kepala bukti), setiap titik acuan `path:baris` dibaca ulang, dan perintahnya dijalankan ulang — `route:list` (4 rute), `AdminSalesTest` **OK (14 tests, 113 assertions)**, suite penuh **OK (218 tests, 1492 assertions, exit 0)**, curl tamu (`GET /` 200; `GET /admin/pesanan/1` 302 → `/admin/login`; `PATCH resi` dan `PATCH status` tamu 419). Hasil dan status butir tidak berubah; **tidak ada temuan baru dan tidak ada kartu perbaikan** yang dibuat. Satu koreksi dilakukan pada tabel 13.1: sitasi grup middleware diperbaiki dari `routes/admin.php:34` (baris itu rute `GET /login`) menjadi `:41`, ditambah `bootstrap/app.php:14-18` untuk prefix/nama `admin`. Detail mentah di `docs/bukti-qa-t_2c9f8b01.txt` bagian **E10**.

---

## 14. Verifikasi `ulasan.boleh` §7.9 — Kartu `t_4ef6e8bd` (21 Oktober 2026)

- **Kartu**: `t_4ef6e8bd` (assignee `qatesting`) — verifikasi props server `ulasan.boleh` + gate klien di halaman `/checkout/{order}/selesai` setelah rangkaian perbaikan `t_45344e00` (backend) → `t_02c3d20c` (frontend).
- **Sumber acuan**: `docs/kontrak-props.md` §7.9 (dibekukan 21 Okt 2026) + baris status §7.11, `docs/kontrak-props.md` §9.1; keputusan `docs/keputusan-f6-ulasan-boleh.md` §1–§3; `docs/brief-qa.md`; aturan R1–R15 `docs/PRD.md`.
- **Bukti mentah**: `docs/bukti-qa-t_4ef6e8bd.txt` (acuan baris, keluaran mentah PHPUnit & harness, daftar perintah, md5 berkas). Log mentah terpisah di `docs/qa/log-*.txt`.
- **Jalur uji**: dua jalur independen — (a) feature test PHP baru `tests/Feature/Checkout/UlasanBolehVerifikasiQaTest.php` (7 kasus / 244 assertion) lewat HTTP kernel; (b) harness SSR node `docs/qa/uji-gate-boleh-t_4ef6e8bd.mjs` + driver `docs/qa/jalankan-uji-gate-t_4ef6e8bd.mjs` yang merender komponen asli `renderToStaticMarkup` dengan stub `@inertiajs/react` (12 kasus) **plus kontrol negatif**.
- **Batas kerja QA**: tidak mengubah kode aplikasi (hanya `docs/` dan `tests/`, sesuai izin kartu), tidak menyalakan server, tanpa kredensial, database pemilik tidak disentuh (`phpunit.xml` memakai SQLite `:memory:`), pembayaran lewat mode fake yang sudah ada.

### 14.1 Hasil per aspek

| Aspek | Hasil | Bukti |
|---|---|---|
| Rumus server `boleh` = masih ada produk belum diulas **dan** syarat §9.1 | **Lulus** — `$belumDiulas !== [] && $this->reviews->isEligible($order)` | `app/Http/Controllers/CheckoutController.php:180-193` |
| Satu sumber aturan §9.1 (tidak ada daftar status salinan di controller) | **Lulus** — daftar status hanya di `REVIEWABLE_STATUSES`; perbandingan otomatis status PHP vs JSX identik | `app/Services/ReviewService.php:32-37,39-43`; FG-09 |
| **Butir wajib (1)**: 2 produk & 1 ulasan → `boleh=true` + `sudah` berisi 1 id | **Lulus** — props `{boleh: true, sudah: [<1 id>]}` untuk produk kedua yang belum diulas; kiriman produk sisa **diterima** | VB-02 (`test_dua_produk_satu_ulasan_boleh_true_dan_sisa_produk_masih_diterima`) |
| **Butir wajib (2)**: semua produk diulas → `boleh=false` | **Lulus** — `belumDiulas === []` ⇒ `boleh=false`; kiriman produk yang sudah diulas tetap ditolak | VB-01 (matriks 6 status), VB-05 |
| **Butir wajib (3)**: `settlement` + status `batal` → `boleh=false` | **Lulus** — `batal` tidak ada di `REVIEWABLE_STATUSES`, jadi `isEligible()` false walau `payment_status = settlement`; kiriman ulasan ditolak | VB-03; `ReviewService.php:32-37,39-43` |
| **Butir wajib (4)**: bentuk `ulasan.sudah` tidak berubah | **Lulus** — array `product_id` bulat (`->map(fn ($id) => (int) $id)`), kunci `ulasan` hanya `boleh` + `sudah`, `boleh` bertipe boolean sungguhan | VB-04 (`test_bentuk_props_ulasan_tidak_berubah`); `CheckoutController.php:169-173,190-193` |
| Produk sama pada dua item (beda varian) dihitung sekali | **Lulus** — `unique()` + `reject(in_array(..., true))`; klien `sudahAda` memfilter per `product_id` | VB-06; `CheckoutController.php:180-186`; `CheckoutSuccess.jsx:40-43` |
| Ulasan ganda untuk produk yang sama tetap ditolak walau `boleh` sempat `true` | **Lulus** — kiriman kedua ditolak, jumlah baris `reviews` tidak bertambah | VB-05 (`test_ulasan_ganda_produk_sama_ditolak_walau_boleh_sempat_true`) |
| **Gate klien menuruti `boleh`** — tidak menampilkan form saat `boleh=false` | **Lulus** — `const tampilkanForm = boleh && pending.length > 0;` dan 9 keadaan render diperiksa (form hilang saat `boleh=false`; muncul 1 form per produk belum dinilai saat `boleh=true`; `boleh='true'` string tidak dianggap true; props `ulasan` hilang ⇒ gagal tertutup) | FG-01…FG-07, FG-11; `resources/js/Pages/Public/CheckoutSuccess.jsx:52` |
| Notice §9.1 sebagai penjelas, bukan gerbang | **Lulus** — notice alasan hanya saat syarat §9.1 belum terpenuhi dan masih ada sisa produk; saling eksklusif dengan form | FG-03, FG-04, FG-06b; `CheckoutSuccess.jsx:59` |
| Cabang "kontradiksi" lama (`kontradiksiBoleh`) tidak kembali | **Lulus** — tidak ada di sumber; `tampilkanForm` tidak lagi menghitung `syaratDinilai`; hanya `CheckoutSuccess.jsx` yang membaca `ulasan.boleh` di seluruh `resources/js` | FG-08, FG-10 |
| Kontrol negatif harness (temuan T1 tidak bisa terulang tanpa terdeteksi) | **Lulus** — dengan gerbang lama ditanam **di memori** (berkas aplikasi tidak disentuh), form **muncul** saat `boleh=false`; komponen apa adanya **tidak**. Menukar satu baris gerbang membuat harness gagal, jadi pemeriksaan di atas bergigi | FG-12 (bagian 5 bukti) |
| Regresi | **Lulus** — suite penuh `OK (225 tests, 1736 assertions)`, exit 0 (termasuk 7 kasus baru); `CheckoutTest` kartu `t_45344e00` hijau | bagian 3–4 `docs/bukti-qa-t_4ef6e8bd.txt` |

### 14.2 Traceability §7.9 / §9.1 → test case

| Butir acuan | Test case | Jenis | Status |
|---|---|---|---|
| §7.9 `boleh` true ⇒ server menerima kiriman (dan sebaliknya) | VB-01 `test_boleh_sama_persis_dengan_kemampuan_server_menerima_ulasan` (matriks `settlement` × 6 status: `dibayar`/`diproses`/`dikirim`/`selesai` ⇒ `true`, `batal`/`pending` ⇒ `false`; tiap status diverifikasi silang lewat kiriman ulasan yang diterima/ditolak) | Fungsional/HTTP, invarian dua arah | Lulus |
| §7.9 "masih ada produk belum diulas" (pesanan sebagian diulas) | VB-02 | Fungsional (butir wajib 1) | Lulus |
| §7.9 + §9.1 `settlement` × status `batal` ⇒ `false` | VB-03 | Fungsional negatif (butir wajib 3) | Lulus |
| §7.9 bentuk `ulasan` (`boleh` boolean, `sudah` id bulat, tanpa kunci baru) | VB-04 | Kontrak props | Lulus |
| §7.9 "semua produk diulas" ⇒ `false` + kiriman kedua ditolak | VB-05 | Fungsional negatif/state | Lulus |
| §7.9 perhitungan per `product_id` (bukan per item/varian) | VB-06 | Boundary/logika bisnis | Lulus |
| Pembatasan laju kiriman ulasan (§9.1 praktik aman) | VB-07 `test_batas_laju_kiriman_ulasan_dibatasi_per_menit` (kiriman ke-6 → 429, baris `reviews` tetap 1) | Negatif/keamanan dasar | Lulus |
| Gate klien menuruti `boleh` (tanpa syarat lokal sebagai gerbang) | FG-01…FG-08, FG-11 | UI state (SSR string, bukan browser) | Lulus |
| Daftar status PHP ↔ JSX tetap sinkron | FG-09 | Statis-silang | Lulus |
| Cakupan pembaca `ulasan.boleh` | FG-10 | Statis | Lulus |
| Kedalaman harness (kontrol negatif) | FG-12 | Meta-verifikasi | Lulus |

Catatan pemetaan: `VB-*` = feature test PHP, `FG-*` = kasus harness SSR. Keduanya memakai data uji terkontrol (pesanan + item dibuat di test), bukan data pemilik.

### 14.3 Observasi (non-blocking; tidak dibuatkan kartu perbaikan)

- **O-3 (P3, pembatas laju)**: `throttle:review` = **5 kiriman/menit per pembeli + IP**; kiriman ke-6 dibalas **429** (`VB-07`). Ini perilaku yang diinginkan, tetapi berdampak pada cara menguji: matriks status (6 kiriman) harus melepas middleware `ThrottleRequests` supaya tidak mengukur rate limit; test batas laju dijalankan terpisah. Cukup sebagai catatan untuk QA berikutnya.
- **O-4 (P3, risiko perawatan)**: daftar status boleh-dinilai ada di dua tempat — `app/Services/ReviewService.php:32-37` (`REVIEWABLE_STATUSES`) dan `resources/js/Pages/Public/CheckoutSuccess.jsx` (`STATUS_BOLEH_DINILAI`). Saat ini **identik** (diperiksa otomatis oleh FG-09) dan hanya dipakai untuk notice, bukan gerbang. Bila kelak gate kembali memakai daftar itu, jadikan satu sumber agar tidak bisa menyimpang tanpa terdeteksi.
- **O-5 (P3, penajaman catatan)**: pada keadaan **kontradiktif** (`boleh=false` padahal syarat §9.1 lokal sudah terpenuhi) halaman memang tidak menampilkan form maupun notice (`FG-01`, `FG-03`) — sesuai maksud catatan frontend, karena keadaan itu tidak lagi diproduksi server. Keadaan `boleh=false` yang **nyata produsen server** (syarat §9.1 belum terpenuhi) tetap menampilkan notice alasan (`FG-04`, `FG-06b`). Tidak ada celah yang menyembunyikan alasan dari pembeli.

### 14.4 Belum diuji (batas eksplisit, bukan klaim lulus)

1. **Alur end-to-end di browser dengan sesi pembeli + CSRF** (mengisi bintang & komentar lalu mengirim dari halaman selesai; munculnya kartu "sudah dinilai" setelah kiriman): **belum diuji, butuh browser.** Harness hanya merender markup; `router.post` tidak pernah benar-benar dikirim.
2. **Tampilan visual & interaksi nyata**: lebar 360/768/1024/1280 px, urutan tab & fokus bintang/textarea, zoom 200%, kontras terukur, area sentuh: **belum diuji, butuh browser** (SSR string tidak membawa layout).
3. **Rate limit multi-pengguna** (banyak pembeli berbagi IP) dan waktu tunggu jendela pembatas: hanya diuji sampai kiriman ke-6 pada satu sesi test.
4. **Aksesibilitas terukur (axe/screen reader)** dan **LCP/Lighthouse**: di luar cakupan kartu ini.

### 14.5 Kesimpulan kartu `t_4ef6e8bd`

Empat butir wajib kartu — (1) 2 produk & 1 ulasan ⇒ `boleh=true` + `sudah` 1 id, (2) semua diulas ⇒ `false`, (3) `settlement` + `batal` ⇒ `false`, (4) bentuk `ulasan.sudah` tidak berubah — beserta gate klien `false` saat `boleh=false` **LULUS**, semuanya dengan bukti `path:baris` dan dua jalur eksekusi berbeda. Temuan T1 (gate setara melepas `boleh`) **tidak terulang**: kontrol negatif membuktikan harness akan menggigit bila gerbang lama dikembalikan, sedangkan komponen apa adanya mematuhi `boleh`. **Tidak ada defect baru** dan **tidak ada kartu perbaikan** yang dibuat dari kartu ini; tiga observasi P3 (O-3, O-4, O-5) tidak menghalangi. Risiko sisa: butir §14.4 (1)–(2) yang memerlukan browser, dan O-4 bila gate kelak berubah. Bagian ini **tidak mengubah §12**: rekomendasi GO/NO-GO rilis tetap mengikuti syarat §12 dan hasil kartu rilis/frontend terkait.

**Self-review kartu ini**: seluruh butir wajib kartu dipetakan ke test case (14.2); area risiko tinggi (kesesuaian props–kemampuan server, otorisasi kiriman, batas laju) diuji positif + negatif; tidak ada klaim pengujian yang tidak dieksekusi (semua angka dari keluaran perintah nyata di `docs/bukti-qa-t_4ef6e8bd.txt`); berkas yang ditulis hanya `docs/bukti-qa-t_4ef6e8bd.txt`, `docs/qa/*`, bagian ini, dan satu berkas test baru di `tests/`; `.env` dan `.env.*` tidak disentuh; kode aplikasi tidak diubah (md5 `CheckoutSuccess.jsx` `2e4df85a082cae829efecc0580ce373a` identik sebelum & sesudah harness).

---

## 15. Verifikasi laporan pemilik 21 Okt 2026 — Kartu `t_3a240a11` (21 Oktober 2026)

Sasaran: lima butir kartu `t_3a240a11` — (1) badge keranjang di semua halaman publik, (2) halaman bayar (penanda mode uji, hitung mundur 5 menit, tagihan fake lama dibuat ulang saat mode nyata), (3) `/admin/produk`, `/admin/stok`, `/admin/pesanan` (CRUD, search, pagination, filter, gambar), (4) halaman selesai checkout menghormati `ulasan.boleh`, (5) suite `php artisan test`. Butir (4) dinilai **setelah** perbaikan berantai `t_45344e00` → `t_02c3d20c` → `t_4ef6e8bd` (komentar 67 techlead). Ketentuan kartu: tidak mengubah kode aplikasi (hanya menulis `docs/`), tidak menyalakan server, temuan wajib punya bukti `path:baris`, dan yang butuh browser/login pemilik ditulis "belum diuji, butuh browser".

### 15.1 Cara uji, perintah, dan artefak bukti

Server tidak dinyalakan oleh kartu ini; pengujian HTTP memakai server pemilik yang sudah hidup di `http://127.0.0.1:8000` dengan **GET baca-saja** (tanpa login, tanpa POST/PUT/PATCH/DELETE, tanpa kredensial). PHP yang dipakai 8.3.32 (Laragon) + PHPUnit 11.5.57; ekstensi `pdo_sqlite`/`sqlite3` diaktifkan lewat `PHP_INI_SCAN_DIR` ke scratch (`99-sqlite.ini`) sehingga `php.ini` pemilik tidak disentuh, dan `phpunit.xml` memakai SQLite `:memory:` — DB MySQL pemilik tidak tersentuh. `php artisan test` tidak dipakai karena menuntut tty di shell ini; padanannya `php vendor/phpunit/phpunit/phpunit < /dev/null` dengan berkas `phpunit.xml` proyek yang sama.

| Jenis | Perintah | Artefak | Hasil |
|---|---|---|---|
| Suite penuh | `php vendor/phpunit/phpunit/phpunit < /dev/null` | `docs/qa/log-phpunit-penuh-t_3a240a11.txt` | **OK (225 tests, 1736 assertions)**, 58,679 s |
| Suite terarah (Checkout + Admin + Unit/Services) | `phpunit --testdox tests/Feature/Checkout tests/Feature/Admin tests/Unit/Services` | `docs/qa/log-phpunit-terarah-t_3a240a11.txt` | **OK (127 tests, 1116 assertions)** |
| Harness SSR badge keranjang | `node docs/qa/jalankan-uji-badge-t_3a240a11.mjs` | `docs/qa/log-uji-badge-t_3a240a11.txt` | 12/12 LULUS + kontrol negatif menggigit |
| Harness SSR daftar admin | `node docs/qa/jalankan-uji-admin-t_3a240a11.mjs` | `docs/qa/log-uji-admin-t_3a240a11.txt` | 12/12 check LULUS |
| HTTP baca-saja | `python docs/qa/uji-http-t_3a240a11.py http://127.0.0.1:8000` | `docs/qa/log-http-t_3a240a11.txt` | 4 halaman publik 200; 5 rute admin 302 → `/admin/login`; 2 rute bayar/selesai 302 → `/login` |

Berkas harness (semuanya di `docs/qa/`, tidak menyentuh berkas aplikasi): `stub-inertia-badge-t_3a240a11.mjs` (stub `@inertiajs/react` untuk alias esbuild), `uji-badge-keranjang-t_3a240a11.mjs`, `jalankan-uji-badge-t_3a240a11.mjs`, `uji-admin-index-t_3a240a11.mjs`, `jalankan-uji-admin-t_3a240a11.mjs`, `uji-http-t_3a240a11.py`. Data uji seluruhnya fiktif (bertanda "Uji"/`[CONTOH]`); bundle sementara dibangun di `docs/qa/` lalu dihapus.

### 15.2 Hasil per butir

| Butir | Status | Ringkas bukti |
|---|---|---|
| (1) Badge keranjang semua halaman publik | **Lulus** | 12/12 kasus SSR + kontrol negatif F-1 |
| (2) Halaman bayar: penanda mode uji, hitung mundur 5 menit, tagihan fake lama dibuat ulang | **Lulus** (uji lewat test/mock, tanpa jaringan) | 7 test PaymentMode + 4 test QrisExpiry + 4 test MidtransExpiry |
| (3) `/admin/produk`, `/admin/stok`, `/admin/pesanan`: CRUD, search, pagination, filter, gambar | **Lulus (server + render)**; interaksi browser: **belum diuji, butuh browser** | 12/12 check SSR + 28 test admin + rute |
| (4) Halaman selesai menghormati `ulasan.boleh` | **Lulus** | gate `CheckoutSuccess.jsx:52` + 7 test `UlasanBolehVerifikasiQaTest` + rumus server `:191` |
| (5) Suite `php artisan test` | **Lulus** | `OK (225 tests, 1736 assertions)` |

**(1) Badge keranjang di semua halaman publik — Lulus.**

- Sumber data nyata: shared prop `cart.count` di `app/Http/Middleware/HandleInertiaRequests.php:39-40`; terbukti benar-benar terkirim pada empat halaman publik (`docs/qa/log-http-t_3a240a11.txt`: `/`, `/produk`, `/kontak-kami`, `/keranjang` → status 200, `cart.count=0`).
- Perhitungan badge: `resources/js/Layouts/PublicLayout.jsx:57` (prioritas shared prop → prop halaman → `settings.cart_count`, dinormalkan `toCount`); badge + label di `resources/js/Components/Header.jsx:80` (`Keranjang, N item`).
- Harness merender `PublicLayout` apa adanya dengan komposisi props persis dari delapan halaman publik (Home, Contact, Products/Index, Products/Show, Cart, Checkout, CheckoutPay, CheckoutSuccess): kedelapan komposisi menampilkan `badge=3` dan `aria-label="Keranjang, 3 item"`; `cart.count=0` → tanpa badge dan label tetap `Keranjang` (S9); prop halaman dipakai bila shared prop absen (S10 → 2); shared prop menang atas prop halaman (S11 → 5, bukan 9); nilai teks `"4"` tetap terbaca (S12 → 4).
- Kontrol negatif: baris pra-perbaikan F-1 (`toCount(cartCount) ?? …`) ditanam **di memori** lewat plugin esbuild pada berkas yang sama → badge hilang di kedelapan komposisi halaman (log: "Kontrol negatif terlihat: YA"), lalu muncul kembali saat berkas asli dipakai. Harness karena itu terbukti melihat badge yang benar-benar dirender, bukan selalu lulus. Log mencatat **12/12 LULUS di mode normal** dan **12/12 LULUS di mode kontrol** (ringkasan `semua pemeriksaan badge LULUS`). md5 `PublicLayout.jsx` saat uji: `b6802690381d5f76e13af5dffa4461ca`.

**(2) Halaman bayar — Lulus (semua lewat test/mock, tanpa jaringan).**

- *Penanda mode uji:* `resources/js/Components/QrisPanel.jsx:144-146` (`InlineNotice` "Mode uji" + `alasan`, dengan teks bawaan "tagihan QRIS dibuat lokal (tanpa Midtrans)"); normalisasi prop `resources/js/lib/midtrans.js:12-29` (`mode` "uji"/"asli", `fake` boolean/teks, aman saat prop kosong); `midtrans` diteruskan dari `resources/js/Pages/Public/CheckoutPay.jsx:145`; sisi admin `resources/js/Pages/Admin/Settings/Index.jsx:2027` ("Pembayaran sedang dalam mode uji"). Diuji: "Halaman checkout menampilkan mode uji", "Mode uji terlihat pada props halaman bayar", "Tab pembayaran admin menjelaskan mode uji".
- *Hitung mundur 5 menit:* bawaan `config/midtrans.php:20-21,41` (`$expiryDefault = 5`, `MIDTRANS_EXPIRY_MINUTES` hanya sebagai override, nilai tidak sah jatuh ke 5); `Countdown` dirender `resources/js/Components/QrisPanel.jsx:126-128` (`label="Sisa waktu pembayaran"`). Diuji: `tests/Feature/Checkout/QrisExpiryTest.php` (4 kasus: bawaan 5 menit di props `expires_at`/`custom_expiry`, override config dipakai semua tempat, nilai tidak sah → 5 menit, tagihan dibuat ulang memakai masa berlaku terbaru) dan `tests/Unit/Services/MidtransExpiryTest.php` (4 kasus).
- *Tagihan fake lama dibuat ulang saat mode nyata:* `app/Http/Controllers/CheckoutController.php:98` dan `:128-140` (pembuatan ulang ke baris `payments` yang sama, kegagalan → `errors` + `Log::warning`, tampilan tetap punya tombol coba lagi); `app/Services/MidtransService.php:169,182,446`. Diuji `tests/Feature/Checkout/PaymentModeTest.php` (7 kasus): "Tagihan mode uji dibuat ulang ke baris yang sama", "Pembuatan ulang gagal menampilkan galat dan tidak mengubah tagihan", "Status membuat ulang tagihan lalu menanyakan midtrans", "Status mode uji tidak menghubungi midtrans".
- *Tanpa jaringan/kredensial:* `tests/Feature/Checkout/PaymentModeTest.php:42-43` mengganti implementasi `App\Services\Midtrans\MidtransApi` dengan `Tests\Support\FakeMidtransApi` melalui container, jadi tidak ada panggilan Midtrans nyata dan tidak butuh server key.

**(3) Halaman admin daftar produk/stok/pesanan — Lulus untuk server + render; interaksi browser belum diuji.**

- Rute lengkap dan terlindungi: `routes/admin.php:33-41` (`guest:admin` untuk login, grup `admin` untuk sisanya), `:96-108` produk (index, create, store, edit, update, destroy, show), `:123-129` stok (index, riwayat, masuk, keluar), `:133-140` pesanan (index, show, status, resi). Semua aksi tulis memakai `throttle:admin-write`.
- Otorisasi nyata: tanpa sesi, `/admin`, `/admin/produk`, `/admin/stok`, `/admin/pesanan` membalas **302 → `http://127.0.0.1:8000/admin/login`** (log HTTP di atas), sedangkan `/admin/login` 200. Diperkuat `tests/Feature/Admin/AdminRouteAccessTest.php` (6 kasus, termasuk "Pembeli tidak bisa menembus panel admin" dan "Admin aktif dapat membuka seluruh rute get admin").
- Pagination + filter di server: `app/Http/Controllers/Admin/ProductController.php:86`, `app/Http/Controllers/Admin/StockController.php:68,153`, `app/Http/Controllers/Admin/OrderController.php:81` — semuanya `paginate(15)->withQueryString()` (parameter `page`/`q`/filter ikut terbawa). Diuji "Daftar produk memakai paginator dan membaca filter".
- Render daftar (SSR harness, 12/12 check lulus): baris produk + nama/SKU (`A1.1`) dan gambar benar-benar dirender sebagai `<img src="/storage/produk/uji.jpg" alt="Daster batik uji">` (`A1.2`, sumber `resources/js/Pages/Admin/Products/Index.jsx:132-139`; galeri di `Products/Show.jsx:142-148`); KPI ringkasan (`A1.3`); baris varian + slug produk + SKU + badge status + `aria-label` aksi "Catat stok masuk/keluar/Setel stok" (`A2.1–A2.3`, sumber `Stocks/Index.jsx:176-292`); baris pesanan + kode/pelanggan + label status + kolom pencarian (`A3.1–A3.3`, sumber `Orders/Index.jsx:246-247`); ditambah check `A1.4–A3.4` "tidak ada `[object Object]`" (prop salah bentuk) — lulus, artinya bentuk props yang dipakai halaman cocok dengan data server.
- Unggah gambar: `resources/js/Pages/Admin/Products/partials/DropzoneGalery.jsx:108` membatasi `accept="image/jpeg,image/png,image/webp"`; validasi "Unggahan bukan gambar ditolak" terbukti lulus di `tests/Feature/Admin/AdminSettingTest.php`.
- CRUD & stok: `tests/Feature/Admin/AdminMasterDataTest.php` (8 kasus: tambah produk membuat varian + riwayat stok awal, menolak input tidak valid, menolak SKU ganda, kategori terpakai tidak bisa dihapus, stok masuk/keluar mencatat pergerakan, stok keluar ditolak bila melebihi stok, riwayat menampilkan pergerakan) dan `AdminSalesTest.php` (14 kasus: transisi status pesanan, pembatalan mengembalikan stok, pesanan final tidak bisa diubah, nomor resi 60 karakter, dsb.) — semuanya lulus di suite penuh.
- Keputusan F4 `/admin/stok` (komentar 61 techlead) **dihormati dan bukan temuan**: UI memang tidak menyediakan kolom "nilai minimum", aksi set stok absolut lewat rute baru, kolom "stok sebelum → sesudah", atau filter tanggal riwayat. Sebagai gantinya tombol **Setel** membuka penjelasan + tautan ke form produk (`resources/js/Pages/Admin/Stocks/Index.jsx:40,463-487`) dan penyesuaian absolut dicatat server sebagai pergerakan `adjust` (`app/Services/StockService.php:138`, tipe `adjust` juga muncul di filter riwayat `app/Http/Controllers/Admin/StockController.php:121,172`) — konsisten dengan `docs/kontrak-props.md` §12.12–§12.15 (baris = varian; `q`/`status`/`kategori`/`urut`; `ringkasan {varian,habis,kritis}`) yang bentuk props-nya persis dipakai harness. Perbandingan langsung UI vs §12.12–§12.15 (acuan komentar 61 techlead) juga bersih: filter daftar `q`/`status`(semua|habis|kritis)/`kategori`/`urut`(nama|stok_terkecil|stok_terbesar) ada di `resources/js/Pages/Admin/Stocks/Index.jsx:51-63,354-398`; filter riwayat `q`/`tipe`(semua|in|out|adjust|sale)/`varian` ada di `resources/js/Pages/Admin/Stocks/History.jsx:43-51,75,248-274` dengan kolom waktu/produk/SKU/tipe/jumlah/catatan/petugas (`:136-210`); aksi stok masuk/keluar memakai rute kontrak §12.13–§12.14 (`resources/js/Pages/Admin/Stocks/partials/StokAksiModal.jsx:58`). Tidak ada kolom/aksi/filter kontrak yang hilang maupun tambahan di luar kontrak.

**(4) Halaman selesai checkout menghormati `ulasan.boleh` — Lulus.**

- Gate klien memakai `boleh` dari server tanpa menambal: `resources/js/Pages/Public/CheckoutSuccess.jsx:52` (`const tampilkanForm = boleh && pending.length > 0;`), alasan tidak tampil bersamaan dengan form (`:55-58`).
- Rumus server satu sumber aturan: `app/Http/Controllers/CheckoutController.php:191` (`'boleh' => $belumDiulas !== [] && $this->reviews->isEligible($order)`) dengan `$belumDiulas` = `product_id` unik pesanan yang belum diulas (`:178-186`), dan `app/Services/ReviewService.php:39-44` (`isEligible`, baris 39, berisi `payment_status` settlement **dan** status ∈ {dibayar, diproses, dikirim, selesai}).
- Pengujian saya sendiri (bukan menyalin klaim parent): `tests/Feature/Checkout/UlasanBolehVerifikasiQaTest.php` — 7 kasus lulus di suite penuh: `boleh=true` saat 2 produk & 1 sudah diulas; `false` saat semua diulas; `false` saat settlement + status `batal`; bentuk `ulasan.sudah` tidak berubah; dua varian produk sama dihitung sekali; ulasan ganda ditolak walau `boleh` sempat `true`; kiriman ke-6 kena batas laju 429. Harness SSR parent `docs/qa/uji-gate-boleh-t_4ef6e8bd.mjs` (12/12 + kontrol negatif) dipakai sebagai **pembanding**, bukan sebagai ganti eksekusi.

**(5) Suite `php artisan test` — Lulus.** `OK (225 tests, 1736 assertions)` dalam 58,679 detik (`docs/qa/log-phpunit-penuh-t_3a240a11.txt`); suite terarah 127 test juga `OK` (`docs/qa/log-phpunit-terarah-t_3a240a11.txt`). Perintah `php artisan test` sendiri tidak dapat dipakai di shell ini (membalas `stdin is not a tty`); itu keterbatasan pemanggilan, bukan kegagalan test.

### 15.3 Belum diuji (batas eksplisit, bukan klaim lulus)

1. **Login admin pemilik + seluruh interaksi di browser** (membuka modal setel stok, mengirim form tambah/ubah/hapus produk, mengunggah foto, mengklik pagination/filter, mengubah status pesanan): **belum diuji, butuh browser.** Kartu ini tidak memakai kredensial pemilik; yang diuji adalah rute, controller, bentuk props, dan render SSR.
2. **Tampilan visual & aksesibilitas terukur** pada halaman publik maupun admin (lebar 360–1280 px, kontras, fokus keyboard, zoom, area sentuh) serta **kenampakan nyata gambar produk**: **belum diuji, butuh browser** — harness hanya memeriksa markup (`src`, `alt`), bukan piksel.
3. **Alur pembayaran sungguhan ke Midtrans** (sandbox/produksi, webhook nyata, notifikasi asli) dan **pembuatan ulang tagihan pada API nyata**: tidak diuji karena harus bebas jaringan; yang diuji hanya mode uji + mock `FakeMidtransApi`.
4. **Belum ada test otomatis untuk hapus produk** (`products.destroy`, `routes/admin.php:105`; tombol hapus ada di `Products/Index.jsx:70`) dan untuk **unggah foto produk** — rute dan validasi ada, tetapi jalur hapus/unggah dari UI belum dieksekusi (butuh login/admin di browser).
5. **LCP < 2,5 s / Lighthouse mobile ≥ 85**, load test, penetration test, dan aksesibilitas screen reader: di luar cakupan kartu ini.

### 15.4 Observasi non-blocking (tidak dibuatkan kartu)

- **O-6** — `PublicLayout.jsx:57` menyediakan fallback `settings.cart_count`, tetapi `HandleInertiaRequests.php:39-40` hanya mengirim `cart.count`; jalur fallback itu praktis tidak pernah terpakai di produksi. Tidak berbahaya (badge tetap benar), tetapi jangan diandalkan sebagai sumber cadangan saat menambah halaman publik baru.
- **O-7** — cakupan test admin belum menyentuh hapus produk dan unggah foto produk (§15.3 butir 4); bila kelak diotomasi, tambahkan di `tests/Feature/Admin/AdminMasterDataTest.php`.

### 15.5 Kesimpulan kartu `t_3a240a11`

Lima butir laporan pemilik: **(1) lulus, (2) lulus, (3) lulus untuk server + render (sisa interaksi browser belum diuji), (4) lulus, (5) lulus** — setiap status disertai bukti `path:baris`, log perintah nyata, dan (untuk butir 1) kontrol negatif yang membuktikan harness menggigit. **Tidak ada defect baru**, jadi **tidak ada kartu perbaikan** yang dibuat dari kartu ini; keputusan F4 `/admin/stok` dihormati sebagai keputusan, bukan cacat. Risiko sisa: butir (3) bagian interaksi, tampilan visual, dan pembayaran nyata (§15.3) yang memerlukan browser/kredensial pemilik. Bagian ini **tidak mengubah §12**: rekomendasi GO/NO-GO rilis tetap mengikuti syarat §12.

**Self-review kartu ini**: kelima butir dipetakan ke bukti (15.2) dan sisa cakupan dinyatakan eksplisit (15.3); area risiko tinggi (otorisasi admin, tagihan pembayaran, gate ulasan, badge pada halaman yang berbeda komposisi props) diuji positif/negatif/boundary; tidak ada klaim pengujian yang tidak dieksekusi (semua angka dari log yang tercantum); berkas yang ditulis hanya di `docs/` (`docs/qa/*`, bagian ini, kartu komentar) — kode aplikasi, `tests/`, dan `.env` tidak disentuh.

### 15.6 Verifikasi ulang butir laporan pemilik — kartu `t_18650721`

Verifikasi browser + data nyata untuk enam butir laporan pemilik (pemilihan ukuran/warna, dugaan saling kunci, warna asli, sinkronisasi dashboard, mode Midtrans, tabel admin) ada di dokumen terpisah: **`docs/verifikasi-pemilik-t_18650721.md`**.

Ringkas: **keenam butir lulus**; suite penuh `OK (258 tests, 2041 assertions)` (`docs/qa/log-phpunit-t_18650721.txt`). Tidak ada defect Critical/High/Medium baru. Catatan non-blocking: header tabel admin belum `sticky` meski didokumentasikan (O-1), nama warna di luar palet tampil netral (O-2), gap KPI PRD §9 tetap di luar cakupan (O-4).

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

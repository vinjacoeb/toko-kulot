# QA v1.2 — Verifikasi Rilis (Toko Daster Kulot)

Tanggal: 2026-10-24 · QA: qatesting · Kartu: `t_56a93c99`
Repo: `C:\Users\LENOVO\Downloads\toko-kulot` · Dokumen acuan: `docs/PRD-v1.2.md`, `docs/design-v1.2.md`, `docs/kontrak-props.md`, `docs/brief-v1.2-qa.md`

## 1. Ringkasan

| Metrik | Nilai |
|---|---|
| Test case dieksekusi | 41 |
| Lulus | 33 |
| Gagal | 3 (B-01, B-02, B-03) |
| Belum diuji (butuh browser) | 5 |
| Bug | 3 (P1: 1, P3: 2) |
| Suite PHPUnit | 317 test, 2.563 assertion, **1 gagal** |
| `npm run build` | lulus (exit 0) |
| `node resources/js/lib/ekspedisi.check.mjs` | `ok` |
| HTTP probe live `127.0.0.1:8000` | 9 probe, sesuai harapan |
| Rekomendasi | **GO BERSYARAT** — perbaiki B-01 (suite wajib hijau), B-02/B-03 boleh menyusul |

Metode: eksekusi PHPUnit penuh dengan ekstensi SQLite lokal, build produksi, probe HTTP nyata ke server dev, plus inspeksi kode bergaris (`path:line`). Tidak ada browser automation/visual, tidak ada perubahan kode.

## 2. Matriks hasil per area

| Area | Requirement | Status | Bukti utama |
|---|---|---|---|
| F1 Bayar 8 kanal | PRD §2, §4; design §4 | Lulus sebagian | TC-01..TC-08, TC-10 |
| F2 Checkout ongkir | PRD §2.1; design §5 | Lulus (server) | TC-11..TC-17 |
| F3 Register + alamat | PRD §3; design §6 | Lulus | TC-18..TC-21 |
| F5 Ekspedisi dropdown | design §7.1, §8 | Lulus | TC-22..TC-25 |
| F6 Panel pesanan | design §7.2–§7.3 | Lulus | TC-26..TC-31 |
| F7 Daftar pesanan | design §7.4 | **Gagal** | B-02, TC-32, TC-33 |
| F8 Riwayat | PRD §9; design §9 | **Gagal** | B-01, TC-34, TC-35 |
| F4 Tipografi | design §2.5–§2.6 | **Gagal (P3)** | B-03, TC-36..TC-39 |

## 3. Test case & hasil

Format ringkas: `ID | skenario → hasil`.

### F1 — Midtrans 8 kanal (design §4)

| ID | Skenario | Hasil diharapkan | Status |
|---|---|---|---|
| TC-01 | Buka `/checkout/{id}/bayar` sebagai tamu | redirect `/login` | **Lulus** — HTTP 302 → `/login` |
| TC-02 | Halaman bayar tanpa kanal terpilih | prop `kanal` = 8 item, `pembayaran.kanal` null | **Lulus (inspeksi)** — `CheckoutPayController` memetakan 8 id; browser belum |
| TC-03 | Kanal tidak dikenal (`metode=gopay`) | ditolak, tanpa panggilan charge | **Lulus** — `MidtransCoreTest::test_kanal_tidak_dikenal_ditolak_tanpa_charge` |
| TC-04 | Ganti kanal 1× (QRIS → BCA VA) | `order_id_midtrans` jadi `-2`, expiry 60 menit, payload QR dibuang | **Lulus** — test `ganti_kanal_ke_va…`; `MidtransService.php:672-694` memberi sekuens `-N` |
| TC-05 | Ganti kanal 2× (→ gerai) | `-3`, expiry 60 menit | **Lulus (inspeksi)** — sekuens generik `-N`; tidak ada test 2× (gap minor) |
| TC-06 | Kanal belum aktif di Midtrans (HTTP 402) | pesan aktivasi, `payments` tetap pending tanpa `order_id_midtrans` baru | **Belum diuji** — tidak ada test 402; mapping ada di `MidtransService` (`CHANNEL_INACTIVE_MESSAGE`). Butuh akun Midtrans sandbox |
| TC-07 | Charge gagal (bukan 402) | tagihan lama tetap, pesan galat tampil | **Lulus** — `test_gagal_charge_memberi_pesan_dan_tagihan_tetap_pending` |
| TC-08 | Instruksi per jenis: VA / QRIS / bill / gerai | `instruksi` 3–7 baris + kode bayar | **Lulus** — `test_instruksi_mandiri…`, `test_instruksi_gerai_menyebut_kode…` |
| TC-09 | Kedaluwarsa QRIS 5 menit vs VA/gerai 60 menit | sesuai | **Lulus** — `MidtransExpiryTest` (QRIS 5, VA 60, gerai 60) |
| TC-10 | `/midtrans/selesai?order_id=<tidak dikenal>` | redirect `/` + flash error, bukan 404 | **Lulus (runtime)** — `curl` → `302 /`; halaman `/` memuat "Pembayaran tidak dikenal." |

Catatan: pemanggilan charge nyata tidak dilakukan (mode uji/`FakeMidtransApi`), sesuai batas environment.

### F2 — Checkout & ongkir otomatis (design §5)

| ID | Skenario | Hasil diharapkan | Status |
|---|---|---|---|
| TC-11 | Prefill alamat user lama, field bisa diedit tanpa mengubah profil | prop terisi dari profil | **Lulus** — `CheckoutTest::test_checkout_mem_prefill_alamat_dari_profil_user` |
| TC-12 | User tanpa alamat | prefill kosong, tanpa error | **Lulus** — `…prefill_kosong_untuk_user_tanpa_alamat` |
| TC-13 | Tarif otomatis 600 ms setelah kode pos valid, tanpa klik | 1 request, kurir+layanan terisi | **Belum diuji** — kode ada (`Checkout.jsx`, debounce 600, `AbortController`), butuh browser |
| TC-14 | Ketik cepat 3 kode pos | request lama dibatalkan, tidak menumpuk | **Belum diuji** — butuh browser (DevTools network) |
| TC-15 | Ganti kode pos | daftar tarif kosong, pilihan kurir reset, total `—` | **Belum diuji** — butuh browser |
| TC-16 | Submit dengan ongkir hasil form yang sudah tidak valid | ditolak rapi, `orders` tidak bertambah | **Lulus** — `test_ongkir_dari_form_tidak_dipercaya` (`assertSessionHas('error','Ongkir berubah, pilih ulang kurir.')`, `orders`=0) |
| TC-17 | Mode fake: tarif uji datar, gratis ongkir hanya reguler | sesuai | **Lulus** — `test_mode_fake_mengembalikan_tarif_datar…`, `test_gratis_ongkir_hanya_untuk_layanan_reguler` |
| TC-18 | `/checkout/ongkir` tanpa login | 302 login | **Lulus** — `test_ongkir_wajib_login` |

### F3 — Register (design §6)

| ID | Skenario | Hasil diharapkan | Status |
|---|---|---|---|
| TC-19 | Field alamat, kota, kode pos wajib + pesan sesuai §6.1 | tersimpan, pesan benar | **Lulus** — `RegistrationTest` |
| TC-20 | Kode pos 4 digit (`5110`) | ditolak "Kode pos harus 5 angka." | **Lulus (runtime)** — POST `/register` → 302 balik `/register`, `errors.postal_code` = pesan tsb; tidak ada user dibuat |
| TC-21 | Email format salah | ditolak | **Lulus (runtime)** — `errors.email` = "Format email tidak valid." |
| TC-22 | Setelah daftar, checkout ter-prefill | alamat dari akun baru | **Lulus** — `RegistrationTest` + TC-11 |

### F5 — Ekspedisi dropdown (design §8)

| ID | Skenario | Hasil diharapkan | Status |
|---|---|---|---|
| TC-23 | Pilih kurir → layanan terfilter | hanya layanan kurir itu | **Lulus** — `node resources/js/lib/ekspedisi.check.mjs` → `ok` (`katalogKurir`, `layananKurir`) |
| TC-24 | Simpan pengaturan ekspedisi | tersimpan, muncul di checkout | **Lulus** — `test_admin_menyimpan_pengaturan_ekspedisi` |
| TC-25 | Nonaktifkan semua kurir | ditolak | **Lulus** — `test_admin_tidak_bisa_menonaktifkan_semua_kurir` |
| TC-26 | Tambah duplikat kurir+layanan | galat "Layanan ini sudah ada di daftar." | **Lulus (klien)** — `Admin/Shipping/Index.jsx:226`. Server tidak menolak duplikat (lihat §6 catatan hardening H-01) |
| TC-27 | Katalog Biteship gagal → fallback manual, halaman hidup | `sumber=settings`, `galat` terisi | **Belum diuji** — inspeksi `BiteshipService::catalog()` (`:563-620`) menunjukkan fallback; tidak disimulasikan |

### F6/F7 — Panel & daftar pesanan admin (design §7.2–§7.4)

| ID | Skenario | Hasil diharapkan | Status |
|---|---|---|---|
| TC-28 | Panel pembayaran = data DB (kanal label, status, `transaction_id`, instruksi, kedaluwarsa, lunas) | cocok | **Lulus** — `AdminSalesTest` |
| TC-29 | `Buat resi otomatis` diklik 2× | 1 panggilan Biteship | **Lulus** — `AdminAutoResiTest` (idempoten) |
| TC-30 | Resi otomatis untuk pesanan belum dibayar | ditolak, pesan server apa adanya | **Lulus** — `AdminAutoResiTest` |
| TC-31 | Input resi manual / ubah status kirim | tersimpan, `shipped_at` terisi | **Lulus** — `AdminAutoResiTest` |
| TC-32 | Filter status pengiriman + kolom kurir/resi | prop `filter_opsi.kirim`, kolom terisi | **Lulus (props)** — `AdminSalesTest`; render tabel butuh browser |
| TC-33 | Kolom "label kanal" di daftar pesanan | label kanal tampil | **Gagal** — B-02: `OrderController::row()` (`~\:256-275`) tidak mengirim `payment_method_label`; `Orders/Index.jsx:240` hanya merender badge status bayar |

### F8 — Riwayat pembeli (design §9, PRD §9)

| ID | Skenario | Hasil diharapkan | Status |
|---|---|---|---|
| TC-34 | Props kartu: nomor, tanggal, status, kurir/layanan/resi, alamat, rincian biaya, item, timeline | lengkap, `shipping.galat` null bila tak ada galat | **Gagal** — B-01: `HistoryTest.php:309` gagal (`galat` berisi pesan admin) |
| TC-35 | `detail_url=null` tidak merender tombol; field null `—`/"Resi belum tersedia." | sesuai | **Belum diuji** — inspeksi `History.jsx` menunjukkan guard null; butuh browser |
| TC-36 | Rincian buka/tutup dengan keyboard (`aria-expanded`) | bisa dioperasikan | **Belum diuji** — butuh browser |

### F4 — Tipografi (design §2.5–§2.6)

| ID | Skenario | Hasil diharapkan | Status |
|---|---|---|---|
| TC-37 | `grep "text-\[[0-9]"` pada `Pages/Public`, `Components`, `Layouts` | 0 hasil di lingkup publik | **Lulus** — 0 hasil publik; sisa di `Admin/KpiCard.jsx:50` |
| TC-38 | `leading-none`, `max-w-xl`, `uppercase` non-badge/wordmark, `tracking-*` | 0 hasil | **Lulus** publik (sisa admin: `KpiCard.jsx:50`, `DataTable.jsx:108`, `AdminLayout.jsx:130,156`) |
| TC-39 | Semua file ber-`rupiah(` pakai `tabular-nums` | semua | **Gagal (P3)** — 5 file admin tanpa `tabular-nums` (B-03) |
| TC-40 | `npm run build` | exit 0 | **Lulus** — build produksi sukses |
| TC-41 | Tidak ada `example.com` di UI | 0 hasil | **Lulus** — 0 hasil di `resources/js`, `app`, `routes` |

## 4. Bug report

### B-01 — `shipping.galat` riwayat pembeli berisi pesan admin; suite PHPUnit merah

- **Severity:** Medium · **Prioritas:** P1 · **Komponen:** Backend
- **Environment:** PHP 8.x, PHPUnit via `vendor/phpunit/phpunit/phpunit`, SQLite in-memory (`phpunit.xml`); live `http://127.0.0.1:8000`
- **Prasyarat:** pesanan `pending` tanpa resi, dibuka lewat riwayat pembeli
- **Langkah:** 1) jalankan suite penuh. 2) buka `tests/Feature/HistoryTest.php:309` (`test_…shipping_kosong…`).
- **Hasil aktual:** `Failed asserting that 'Resi otomatis hanya untuk pesanan berstatus Dibayar atau Dikirim. Pesanan ini masih Pending.' is null.` 317 test, **1 gagal**.
- **Hasil diharapkan:** `shipping.galat = null` untuk pembeli. Sumber: PRD §9 (kartu riwayat memuat resi/kurir/alamat/rincian/timeline — `galat` bukan bagian tampilan pembeli) dan test kontrak `HistoryTest.php:309`.
- **Dugaan penyebab:** `HistoryController.php:104` memakai `BiteshipService::shippingInfo()` yang dipakai panel admin; `resiGalat()` selalu mengisi pesan penjaga status. Kontrak §13 menyebut "bentuk sama §12.17" sehingga key `galat` ikut terbawa.
- **Dampak:** gate rilis PRD ("seluruh test suite hijau") tidak terpenuhi; bila UI kelak merender `galat`, pembeli melihat instruksi operasional admin.
- **Frekuensi:** selalu. **Status:** terbuka.
- **Rekomendasi:** set `galat => null` pada payload riwayat pembeli (biarkan panel admin tetap membawa pesan penjaga), atau longgarkan test bila produk memutuskan sebaliknya. Kartu perbaikan: `t_6032599a`.

### B-02 — Daftar pesanan admin tidak menampilkan label kanal pembayaran

- **Severity:** Low · **Prioritas:** P3 · **Komponen:** Backend (field) + Frontend admin (kolom)
- **Langkah:** buka `/admin/pesanan` sebagai admin; bandingkan dengan design §7.4 ("label kanal tampil") dan checklist §12.
- **Hasil aktual:** tidak ada kolom kanal; prop baris hanya `payment_status`/`payment_label`. `grep payment_method_label app/Http/Controllers/Admin/OrderController.php` hanya menemukan di respons detail (`:301`), bukan `row()` (`:256-275`).
- **Hasil diharapkan:** `payment_method_label` pada tiap baris §12.16 + kolom "Pembayaran" menampilkan nama kanal (mis. "BCA Virtual Account"), bukan status bayar.
- **Dampak:** admin tidak bisa memilah pesanan per kanal dari daftar. Tidak menghambat alur pesanan.
- **Frekuensi:** selalu. **Status:** terbuka. **Kartu perbaikan:** `t_b9fe6ce6`.

### B-03 — Sisa pelanggaran tipografi di komponen admin (T11, T24–T26)

- **Severity:** Low · **Prioritas:** P3 · **Komponen:** Frontend admin
- **Langkah:** jalankan 6 `grep` design §2.5 pada `resources/js`.
- **Hasil aktual:** `Admin/KpiCard.jsx:50` (`text-[28px]` + `leading-none`), `Admin/KpiCard.jsx:32` (`text-label uppercase`), `Admin/DataTable.jsx:108` (`max-w-xl`), `Admin/AdminLayout.jsx:130,156` (`tracking-wide`); 5 file admin memakai `rupiah(` tanpa `tabular-nums`.
- **Hasil diharapkan:** skala §2.2 tanpa ukuran arbitrer.
- **Catatan:** design §2.6 menetapkan sisa ini sebagai temuan P3 pada kartu pemilik (`t_ab9c84fe`) dan **bukan** penunda rilis. Dicatat sebagai komentar pada kartu tersebut; tidak dibuatkan kartu baru.
- **Status:** terbuka (diketahui, diterima untuk rilis).

## 5. Ketidaksinkronan dokumen

| ID | Konflik | Dampak uji | Rekomendasi |
|---|---|---|---|
| D-01 | design §7.3/§14.7 menyebut rute `POST /admin/pesanan/{order}/resi-otomatis`; rute nyata `POST /admin/pesanan/{order}/resi` (`routes/admin.php:150`) dan kontrak §12.25 memakai `/resi` | Tidak ada bug; kode & UI konsisten pada `/resi` | Perbarui design §7.3/§14.7 (pemilik: UI/UX) |
| D-02 | design §5.2 memakai `recipient_*`/`shipping_*`; kontrak §7.5 & kode memakai `customer_*` | Tidak ada bug; UI mengikuti kontrak | Perbarui design §5.2 |
| D-03 | design §4.3 menyebut chip `warning-strong`; token tersedia `warning` | Kosmetik, kontras belum diukur | Samakan istilah token |
| D-04 | PRD §2.1 menuntut `metode` divalidasi `Rule::in`; implementasi memvalidasi di `MidtransService` (whitelist `CHANNELS`) → `CheckoutException` | Perilaku sama (ditolak tanpa charge, TC-03 lulus) | Terima; atau tambah `Rule::in` di request untuk lapisan kedua |
| D-05 | kontrak §13 "bentuk sama §12.17" membawa `galat` ke pembeli, bertabrakan dengan PRD §9 dan test | Sumber B-01 | Persempit §13: `galat` hanya untuk admin |

## 6. Catatan hardening (bukan bug, tanpa kartu)

- **H-01** `UpdateShippingRequest` tidak punya aturan `distinct` pada `couriers.*`; POST langsung yang mengulang `courier_code+service_code` akan tersimpan ganda dan muncul dobel di checkout. UI sudah menolak (`Shipping/Index.jsx:226`), jadi hanya bisa dicapai admin dengan request manual. Tambah `distinct` bila kelak ada API klien lain.
- **H-02** Tidak ada test untuk pemetaan HTTP 402 Midtrans (TC-06) maupun untuk katalog Biteship mati (TC-27) — dua jalur ini hanya diverifikasi lewat inspeksi kode.
- **H-03** `nextMidtransOrderId()` menaikkan sekuens tanpa batas (`-2`, `-3`, …); aman terhadap tabrakan (loop cek `order_id_midtrans`), tetapi tidak ada test ganti kanal 2×.

## 7. Batasan pengujian

- Tidak ada browser automation/visual: TC-13, TC-14, TC-15, TC-35, TC-36, TC-02, TC-32 (render), TC-05 (runtime), TC-26 (klik) berstatus **belum diuji / inspeksi kode**. Diperlukan Playwright atau sesi browser manual.
- Tidak ada akun uji admin/pembeli yang boleh dipakai, sehingga alur ber-auth diuji lewat feature test (SQLite in-memory), bukan HTTP live.
- Charge Midtrans nyata dan panggilan Biteship nyata tidak dilakukan (mode uji), sesuai batas environment.
- Lighthouse/LCP (PRD §11) tidak diukur pada rilis ini.
- Aksesibilitas diperiksa lewat kode (`fieldset`/`legend`, `aria-live` hanya untuk status, `aria-expanded`); belum diuji dengan screen reader.

## 8. Traceability AC brief → test case

| AC brief | Test case | Status |
|---|---|---|
| 1. Bayar: 8 kanal mode uji, ganti kanal 2×, kanal ditolak, countdown, lunas mode uji, `/midtrans/selesai` | TC-02..TC-10 | Lulus kecuali TC-06 (belum diuji) & runtime countdown/polling (browser) |
| 2. Checkout: prefill, tarif tanpa klik, ketik cepat, kode pos berubah, tarif kedaluwarsa | TC-11..TC-18 | Lulus server; UI belum diuji |
| 3. Register: 3 wajib, 4 digit ditolak, tersimpan | TC-19..TC-22 | Lulus |
| 4. Ekspedisi: dropdown, simpan, duplikat, API mati | TC-23..TC-27 | Lulus; TC-27 belum diuji |
| 5. Admin pesanan: panel cocok DB, resi 2×, belum bayar ditolak, resi manual | TC-28..TC-31 | Lulus |
| 6. Riwayat: resi/kurir/alamat/rincian/timeline, 360px | TC-34..TC-36 | **Gagal** (B-01); 360px belum diuji |
| 7. Tipografi: 6 grep bersih + build | TC-37..TC-41 | Lulus publik; sisa admin = B-03 |

## 9. Risiko tersisa

1. Suite merah (B-01) selama belum diperbaiki — gate DoD PRD belum terpenuhi.
2. Perilaku UI (polling lunas, countdown, debounce ongkir, responsif 360px) belum pernah dijalankan di browser pada rilis ini; regresi JS tidak akan tertangkap build.
3. Jalur 402 Midtrans dan katalog Biteship mati belum diuji, padahal keduanya jalur galat yang paling mungkin terjadi di produksi.
4. B-02 membuat admin buta kanal pembayaran di daftar; dampak operasional kecil.

## 10. Rekomendasi

**GO BERSYARAT.**

- Syarat wajib sebelum rilis: B-01 diperbaiki dan suite hijau (317/317).
- Boleh menyusul (P3): B-02, B-03.
- Sebelum rilis disarankan satu putaran uji browser manual untuk TC-13..TC-15, TC-35, TC-36 (skrip langkah ada di §3).
- Tidak ada temuan Critical/High pada fungsional; risiko utama adalah cakupan UI yang belum terverifikasi di browser, bukan defect yang diketahui.

Catatan: keputusan rilis final milik Tech Lead (`t_67affdd0`).

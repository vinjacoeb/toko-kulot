# QA v1.6 — overselling, ringkasan ongkir, ceklis ekspedisi, stok varian, laporan Excel

Kartu: `t_2aea6b13`. Tanggal: 2 Nov 2026. Repo: `C:/Users/LENOVO/Downloads/toko-kulot`.
Acuan: `docs/PRD.md`, `docs/design-v1.6.md` §1/§2/§4/§6/§7, `docs/kontrak-props.md` §7.5/§7.12/§14,
`docs/akun-dev.md`, body kartu.
Bukti mentah (perintah + output): `docs/bukti-qa-v1.6-t_2aea6b13.txt`.

Kesimpulan: **tidak ada bug Critical/High/Medium.** Seluruh P0 lulus di feature test, HTTP props,
unduhan xlsx nyata, dan silang-cek DB baca-saja. Sisa risiko: state visual 360 px, keyboard radio,
dan drill dua-user di browser **belum diuji** — rekomendasi **GO BERSYARAT** (syarat di §12).

## 1. Lingkungan uji

- Windows 11 + Git Bash, PHP 8.3.32, PHPUnit 11.5.57, Laravel + Inertia/React.
- `php artisan test` tidak jalan di shell non-tty; dipakai
  `php vendor/phpunit/phpunit/phpunit < /dev/null` dengan
  `PHP_INI_SCAN_DIR=.../cache/scratch/phpini` (memuat `pdo_sqlite`, `sqlite3`, `zip` yang tidak ada
  di `php.ini` default). `phpunit.xml` memakai sqlite `:memory:` → DB MySQL pemilik tidak tersentuh.
- Server dev `http://127.0.0.1:8000` sudah berjalan (dikelola pemilik). QA tidak menyalakan server,
  tidak migrate/seed, tidak mengubah `.env`, tidak mengubah file aplikasi.
- Sesi HTTP: cookie jar admin/pembeli milik QA + `X-Inertia: true` dan `X-Inertia-Version` yang cocok.
  Tidak ada kredensial di laporan ini.
- DB pemilik hanya dibaca (`tinker --execute`), untuk silang-cek omzet dan integritas stok.

## 2. Acceptance criteria yang diuji

| # | AC (sumber) |
|---|---|
| AC1 | Dua pembeli, stok varian 1: checkout kedua gagal, pesan jelas, stok tidak minus, tidak ada order ganda (body kartu #1; `OversellingTest`) |
| AC2 | `/checkout` dan `/admin/pesanan/{id}` menampilkan semua field ringkasan; gratis ongkir → ongkir asli dicoret + `Ditanggung toko` (body kartu #2; design §4; kontrak §14.2) |
| AC3 | `/checkout`: semua layanan aktif muncul; yang tidak tersedia `disabled` + alasan, tidak bisa dipilih (body kartu #3; design §1) |
| AC4 | `/produk/{slug}`: label `Tersedia (n)` / `Sisa n` / `Habis` per varian; varian habis tidak bisa dipilih, CTA mati (body kartu #4; design §2) |
| AC5 | `/admin/laporan`: filter hari ini / 7 hari / bulan ini / kustom; unduh langsung `.xlsx` 4 sheet; omzet hanya status revenue; pintasan dashboard jalan (body kartu #5; kontrak §14) |

## 3. Review requirement dan ketidaksinkronan

1. Body kartu menulis ekspedisi "pilihan bercentang", tetapi `design-v1.6 §1` menetapkan
   `input[type=radio]` dalam `fieldset` + `legend`. Implementasi mengikuti design (radio) dan itu
   yang diuji. Tidak perlu perubahan; catat agar tidak dilaporkan sebagai defect oleh reviewer lain.
2. `docs/kontrak-props.md §14.1` menyebut `Order::REVENUE_STATUSES` dengan nama Inggris
   (`paid`, `processing`, `shipped`, `completed`), sedangkan konstanta nyata memakai nilai Indonesia
   (`dibayar`, `diproses`, `dikirim`, `selesai`). Perilaku benar; **catatan dokumentasi Low**.
3. "4 sheet" tidak tertulis di PRD; sumbernya kontrak §14.2 (LOCKED): `Ringkasan`, `Pesanan`,
   `Detail Item`, `Stok` — terverifikasi persis.
4. Tab status pesanan (`design-v1.6 §3`) di luar cakupan kartu ini; tidak diuji.

## 4. Asumsi dan pertanyaan terbuka

- **NON-BLOCKING** — Uji dua-user dijalankan sebagai feature test (dua sesi, DB sqlite), bukan dua
  browser pada data dev, agar tidak membuat order nyata. Rekomendasi: satu drill manual di staging
  sebelum rilis.
- **NON-BLOCKING** — "Semua field tampil" diverifikasi lewat props Inertia + markup; piksel/visual
  belum diuji (butuh browser ber-login; aturan QA melarang mengetik kredensial di tool browser).
- **NON-BLOCKING** — Ambang gratis ongkir (subtotal ≥ Rp300.000) tidak dilewati dengan keranjang
  live; logika `gratis.terpenuhi` + `sisaGratis` diperiksa di sumber dan feature test.

## 5. Matriks risiko dan strategi uji

| Area/Fitur | Kemungkinan Gagal | Dampak | Level Risiko | Strategi/Kedalaman Uji |
|---|---|---|---|---|
| Overselling stok terakhir | Sedang | Tinggi (stok minus, order ganda) | Tinggi | Feature test 2 sesi + cek DB `stock < 0` dan kode order ganda |
| Gratis ongkir (hitungan & tampilan) | Sedang | Tinggi (salah tagih/salah lapor) | Tinggi | Props order 32, markup OrderSummary/Show, feature test tarif asli + selisih |
| Ceklis ekspedisi (semua vs opsi) | Sedang | Sedang (layanan hilang / bisa dipilih padahal tak tersedia) | Sedang | HTTP cek ongkir nyata (59 baris), props `tersedia/alasan`, markup radio disabled |
| Stok per varian (label & pemilihan) | Sedang | Sedang (pembeli salah pilih) | Sedang | Props varian, markup `varianTersedia`/`labelStok`, cek browser publik (attempt 4) |
| Laporan: filter & omzet | Sedang | Tinggi (angka salah) | Tinggi | 4 periode + nilai asing, silang-cek SUM DB, feature test revenue-only |
| Unduhan xlsx 4 sheet | Rendah | Sedang | Sedang | Unduh live, buka zip, baca `workbook.xml`, validasi kustom ditolak |
| Otorisasi admin laporan | Rendah | Tinggi | Tinggi | Feature test guest → redirect login |
| Regresi umum | Sedang | Tinggi | Tinggi | Suite penuh 382 test |

## 6. Test case dan hasil

| ID | Requirement/AC | Fitur | Skenario | Langkah ringkas | Hasil Diharapkan | Tipe | Prioritas | Status |
|---|---|---|---|---|---|---|---|---|
| TC-01 | AC1 | Overselling | Checkout kedua untuk stok terakhir | Feature test `OversellingTest` (2 sesi, stok 1) | Checkout kedua ditolak, pesan stok; stok 0 | Fungsional/negatif | P0 | Lulus |
| TC-02 | AC1 | Overselling | Stok tidak minus, tidak ada order ganda | Baca DB: `stock < 0`, `GROUP BY code HAVING count>1` | 0 dan 0 | Data | P0 | Lulus |
| TC-03 | AC2 | Detail admin | Semua field ringkasan ada di props | GET `/admin/pesanan/32` Inertia JSON | `ringkasan` lengkap: subtotal, diskon, ongkir_asli, ditanggung, ongkir, total, ekspedisi, metode, is_free | Integrasi/props | P1 | Lulus |
| TC-04 | AC2 | Detail admin | Gratis ongkir: asli dicoret + ditanggung | Props order 32 + `Admin/Orders/Show.jsx:200-211` | `ongkir_asli 48000`, `ongkir 0`, `ditanggung 48000`; asli `line-through`, baris `Ditanggung toko` | UI-markup/data | P1 | Lulus |
| TC-05 | AC2 | Checkout | Ringkasan gratis memakai tarif asli | `OrderSummary.jsx:107-121`, `Checkout.jsx:586`, feature test "ringkasan gratis kirim tarif asli" | `GRATIS` + harga asli coret + `Ditanggung toko`; tidak render Rp0 | UI-markup/logika | P1 | Lulus |
| TC-06 | AC2 | Checkout | Semua field ringkasan checkout | GET `/checkout` Inertia JSON | `keranjang.items` (nama, varian, qty, harga, stok, tersedia), `pengiriman`, `ringkasan`, `pembayaran`, `prefill` ada | Integrasi/props | P1 | Lulus |
| TC-07 | AC3 | Ekspedisi | Semua layanan aktif muncul, yang tak tersedia disabled + alasan | GET `/checkout/ongkir?postal_code=65143` | `semua` 59 baris; 10 tersedia, 49 `tersedia:false` + `alasan "Tidak tersedia di area anda."`; label unik, urut | Fungsional/props | P0 | Lulus |
| TC-08 | AC3 | Ekspedisi | Radio disabled tidak bisa dipilih + keyboard | Butuh browser ber-login | `disabled` benar, tak masuk urutan Tab, panah/Space | UI/keyboard | P2 | Belum Diuji |
| TC-09 | AC4 | Produk | Label stok per varian | Props produk + markup `labelStok`; cek browser publik attempt 4 | `Tersedia (8)`, `Sisa 6/3`, `Habis` untuk stok 0 | UI/data | P1 | Lulus |
| TC-10 | AC4 | Produk | Varian habis tidak bisa dipilih, CTA mati | Markup `varianTersedia` + chip `disabled`; cek browser attempt 4 | Chip XL+Hijau disabled; tombol `Stok Habis`/tambah disabled | UI/logika | P1 | Lulus |
| TC-11 | AC5 | Laporan | 4 periode | GET Inertia `hari-ini`, `7-hari`, `bulan-ini`, `kustom` | 200; `filter.dari/sampai` diselesaikan server; ringkasan konsisten | Fungsional/props | P0 | Lulus |
| TC-12 | AC5 | Laporan | Periode asing | `?periode=asing` | Jatuh ke `bulan-ini`, bukan 422 | Negatif/boundary | P1 | Lulus |
| TC-13 | AC5 | Ekspor | Unduh xlsx 4 sheet | GET `/admin/laporan/unduh?periode=bulan-ini`, buka zip | 200, MIME xlsx, nama `laporan-2026-11-01_sd_2026-11-30.xlsx`, sheet `Ringkasan/Pesanan/Detail Item/Stok` | Fungsional/format | P0 | Lulus |
| TC-14 | AC5 | Ekspor | Kustom tanpa tanggal ditolak | GET unduh `periode=kustom` + Referer laporan | 302 ke `/admin/laporan`; `errors.dari` & `errors.sampai`; tidak ada file | Negatif | P1 | Lulus |
| TC-15 | AC5 | Laporan | Omzet hanya status revenue | Feature test + SUM DB periode `bulan-ini` | SUM `dibayar/diproses/dikirim/selesai` = props `omzet` (469600, 2 pesanan); pending/batal tidak masuk | Data | P0 | Lulus |
| TC-16 | AC5 | Dashboard | Pintasan unduh jalan | `Dashboard.jsx:133` + GET URL | `href /admin/laporan/unduh?periode=bulan-ini` → 200 xlsx 4 sheet | Integrasi | P1 | Lulus |
| TC-17 | Regresi | Suite | Seluruh test | `phpunit` penuh | OK 382 test / 3315 assertion | Regresi | P0 | Lulus |
| TC-18 | AC1/AC4 | Keranjang | Tambah varian stok 0 | POST `/keranjang` variant 38 | Ditolak 302 + flash `Stok tersisa 0.` | Negatif | P1 | Lulus |
| TC-19 | AC2 | Gratis ongkir | Ambang Rp300.000 belum tercapai | Props `pengiriman.gratis` + `Checkout.jsx:554-563` | `terpenuhi:false`, helper "Tambah Rp221.000 lagi"; keranjang ≥300k belum diuji live | Boundary | P2 | Belum Diuji |
| TC-20 | Design §6 | Responsif | 360 px ceklis/tabel/ringkasan | Butuh DevTools | 1 kolom, tanpa scroll horizontal | UI/kompatibilitas | P2 | Belum Diuji |
| TC-21 | Design §6 | Aksesibilitas | Keyboard radio & fokus | Butuh browser | Panah pindah radio, Space memilih, fokus ring di label | Aksesibilitas | P2 | Belum Diuji |
| TC-22 | Design §6 | Aksesibilitas | Screen reader label/alasan/sr-only | Butuh browser + SR | Nama+alasan terbaca; sr-only ongkir ditanggung | Aksesibilitas | P3 | Belum Diuji |

Ringkasan: total 22 — **Lulus 17**, Gagal 0, Terblokir 0, Belum Diuji 5.
Per prioritas: P0 6/6 lulus; P1 10/10 lulus; P2 1 lulus + 4 belum; P3 1 belum.

## 7. Traceability

| Requirement/AC | Test Case | Cakupan | Status |
|---|---|---|---|
| AC1 overselling | TC-01, TC-02, TC-18 | Logika + data | Lulus |
| AC2 ringkasan & gratis ongkir | TC-03, TC-04, TC-05, TC-06, TC-19 | Props + markup + logika; ambang batas belum | Lulus / sebagian belum |
| AC3 ceklis ekspedisi | TC-07, TC-08 | Semua baris + alasan; interaksi keyboard belum | Lulus / sebagian belum |
| AC4 stok varian | TC-09, TC-10, TC-18 | Label + pemilihan + penolakan | Lulus |
| AC5 laporan & Excel | TC-11–TC-16 | Filter, omzet, xlsx, pintasan | Lulus |
| Regresi | TC-17 | Suite penuh | Lulus |
| Design §6 (visual/a11y) | TC-20–TC-22 | 360 px, keyboard, SR | Belum diuji |

## 8. Hasil eksekusi per fitur

**8.1 Overselling.** `OversellingTest` lulus (2 sesi, stok 1, checkout kedua gagal, stok akhir 0,
tidak ada order ganda). DB dev: `stok_minus 0`, `kode_ganda 0`, 21 order. Uji live 2 browser tidak
dijalankan (akan membuat order nyata).

**8.2 Ringkasan pesanan & gratis ongkir.** Order 32 (`TK-20261102-0001`, dibayar) menyimpan
`shipping_cost_original 48000`, `shipping_cost 0`, total 454000; props admin memuat
`ongkir_asli/ditanggung_toko/ongkir`; markup mencoret harga asli dan menampilkan
`Ditanggung toko: Rp48.000`. `OrderSummary` merender pola sama di checkout (props
`shippingOriginal`/`shippingCovered`) dengan sr-only "Ongkir … ditanggung toko." Checkout live
menampilkan item, varian, qty, harga, berat 500 g, dan status gratis (`aktif`, `min 300000`,
`terpenuhi false`).

**8.3 Ceklis ekspedisi.** Sebelum cek ongkir: 59 layanan, semua `tersedia/cost/etd null` → kartu
disabled harga `—`. Setelah kode pos 65143: 59 baris, 10 tersedia (JNE REG 18000, TIKI REG 16000,
SiCepat REG 19300, AnterAja REG 18900, …), 49 disabled dengan alasan server. `opsi` 10 baris
(hanya bertarif), `semua` 59, `opsi ⊆ semua`, urut `courier_name` lalu `service_name`. Markup
memakai `semua[]` (fallback `ringkasan.ekspedisi`), radio `disabled={!tersedia}`, alasan dirender,
pilihan direset saat kode pos berubah.

**8.4 Stok varian.** Produk `baju-tidur-pola-kucing`: varian L/Hijau 8, L/Merah 6, XL/Hijau 0,
XL/Merah 3; total 17. Label sesuai design (Habis untuk 0, Sisa untuk 1–5, Tersedia (n) untuk >5);
chip ukuran/warna disabled bila tak ada varian berstok; CTA `Stok Habis` saat habis; tambah varian
stok 0 ke keranjang ditolak `Stok tersisa 0.` Cek browser publik attempt 4 mengonfirmasi label dan
kombinasi habis tidak bisa dipilih.

**8.5 Laporan.** Empat periode 200 dengan rentang server: hari-ini 2026-11-02, 7-hari
2026-10-27..11-02, bulan-ini 11-01..11-30, kustom 01-01..12-31. Periode asing jatuh ke bulan-ini.
Omzet bulan-ini 469600 / 2 pesanan sama dengan SUM DB status revenue. Unduhan 200, MIME xlsx,
nama `laporan-2026-11-01_sd_2026-11-30.xlsx`, 44.733 byte, sheet persis 4 dan berurutan. Kustom
tanpa tanggal → 302 + error `dari`/`sampai`, tanpa file. Pintasan dashboard menunjuk URL yang sama
dan URL itu menghasilkan xlsx.

**8.6 Regresi.** Suite penuh `OK (382 tests, 3315 assertions)`; suite terarah 16 test / 173 assertion.

## 9. Bug report

Tidak ada defect Critical/High/Medium/Low yang terbuka. Tidak ada kartu perbaikan dibuat.

Catatan (bukan defect):
- **Low (dokumentasi)** — `docs/kontrak-props.md §14.1` menulis nama status Inggris; konstanta
  `Order::REVENUE_STATUSES` berisi `dibayar/diproses/dikirim/selesai`. Perilaku & test benar.
  Pemilik dokumen dapat menyelaraskan kalimat kontrak.
- **Info** — Body kartu menyebut "bercentang"; design §1 memakai radio. Implementasi mengikuti
  design; tidak ada aksi.
- **Info** — Redirect `back()` pada unduhan kustom tanpa tanggal bergantung Referer; di browser
  (Referer `/admin/laporan`) hasilnya 302 ke halaman laporan + error, sesuai kontrak. Di curl tanpa
  Referer, Laravel memakai URL sesi terakhir. Bukan defect.

## 10. Non-fungsional dan batasan

- **Keamanan dasar**: halaman/unduhan laporan menolak guest (feature test → redirect `/admin/login`);
  validasi unduhan kustom diuji; tidak ada uji penetration/injeksi invasif.
- **Aksesibilitas**: markup memakai `fieldset`/`legend`, radio native, `role="status"`,
  `aria-live`, `sr-only`; kontras diklaim design. Uji keyboard/SR nyata **belum** dijalankan.
- **Responsif 360 px**: belum diuji (butuh browser/DevTools).
- **Performa**: tidak diukur; kartu ini tidak meminta target LCP/Lighthouse. Unduhan 44 KB, laporan
  memakai `FromQuery` (klaim kontrak, tidak diukur).
- **Visual**: halaman ber-login tidak dibuka di browser (QA tidak mengetik kredensial di tool
  browser); verifikasi lewat props + markup. Cek browser publik hanya untuk halaman produk
  (attempt 4).

## 11. Self-review

- [x] Semua AC kartu dipetakan ke test case; gap visual/a11y dicatat.
- [x] Area risiko tinggi (stok, omzet, ekspor, otorisasi) diprioritaskan.
- [x] Negatif/boundary/edge dipertimbangkan (stok 0, periode asing, tanggal kosong, stok minus, order ganda).
- [x] Pengujian memakai arsitektur Inertia (props + `X-Inertia-Version`), bukan endpoint `/api` fiktif.
- [x] Tidak ada klaim uji yang tidak dieksekusi; 5 item ditandai Belum Diuji.
- [x] Tidak ada file aplikasi/`.env` yang diubah; artefak hanya di `docs/`.
- [x] Known issues dan batasan environment dicatat.

## 12. Rekomendasi Go/No-Go

**GO BERSYARAT.** Tidak ada Critical/High terbuka; seluruh P0 lulus dengan bukti runtime (feature
test, props Inertia, unduhan xlsx nyata, silang-cek DB). Regresi suite penuh hijau.

Syarat sebelum rilis:
1. Satu drill manual dua-user (stok 1) di staging — memastikan pesan error terlihat pembeli dan
   tidak ada order ganda pada data nyata.
2. Cek visual 360 px + keyboard radio di `/checkout`, tabel varian, dan ringkasan gratis ongkir
   (termasuk keranjang ≥ Rp300.000 untuk melihat coretan + `Ditanggung toko`).
3. Bila syarat 1–2 tidak dapat dipenuhi, rilis tetap boleh jalan dengan catatan risiko visual
   diterima pemilik; logika inti sudah tertutup otomatis.

Keputusan final milik Tech Lead.

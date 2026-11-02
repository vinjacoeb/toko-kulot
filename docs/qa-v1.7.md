# QA v1.7 — ceklis ekspedisi, filter Laporan, desain Excel

Kartu `t_1e97eae3` · QA `qatesting` · 2 Nov 2026
Acuan: `docs/brief-v1.7-qa.md`, `docs/design-v1.7.md`, `docs/ringkasan-v1.7.md`,
`docs/catatan-backend-v1.7-t_6863d44a.md`, `docs/catatan-frontend-v1.7-t_c085eb76.md`,
`docs/catatan-frontend-v1.7-t_ca47e2e4.md`, `docs/kontrak-props.md` §7.
Bukti perintah mentah: `docs/bukti-qa-v1.7-t_1e97eae3.txt`.
**Tidak ada kode aplikasi yang diubah** pada putaran QA ini.

## 1. Pemahaman fitur

1. **Ceklis ekspedisi ringkas** (`Public/Checkout.jsx`): daftar layanan dirender dari `opsi[]`
   selama `statusTarif === 'siap'`; `semua[]` hanya dipakai cache; baris tanpa tarif tidak
   dirender sama sekali; notice `memuat`/`kosong`/`galat`/`timeout`/`menunggu` tetap.
2. **Filter periode Laporan langsung** (`Admin/Laporan.jsx`): ganti `Select` → satu `router.get`
   (`preserveScroll` + `replace`); `kustom` menunggu tombol Terapkan; kontrol menampilkan nilai
   yang dipakai server (termasuk normalisasi periode tak sah).
3. **Desain Excel** (`app/Exports/`): header navy, freeze + autofilter (Pesanan, Detail Item,
   Stok), zebra/border, format rupiah/qty per baris terpakai (tanpa `B12:B16`/`C12:C16`),
   judul Ringkasan merge.

## 2. Review requirement dan ketidaksinkronan

- `design-v1.7.md` §2 baris 34: "`Select` dan tombol dinonaktifkan selama permintaan berjalan".
  Yang dinonaktifkan hanya `Select` (`Laporan.jsx:98`) dan tombol Terapkan (lewat `loading`,
  `:124`); tombol **Unduh** (`:83`) adalah `<a>` dan tetap bisa diklik saat memuat. Ini perilaku
  v1.6 yang dipertahankan dan justru membawa filter terpilih ke parameter unduh (`:71`), jadi
  **bukan defect**; dicatat sebagai pertanyaan copy NON-BLOCKING untuk `uiux` bila ingin tegas.
- `catatan-backend-v1.7-t_6863d44a.md:6,15,43` memakai nomor baris 4/5/9/11/12 dan freeze `A5`.
  Nomor itu adalah **indeks array** `RingkasanSheet::array()` yang berisi dua baris kosong.
  Writer membuang baris kosong, sehingga nomor baris nyata bergeser 2 → lihat QA-2.
- Kontrak props tidak berubah; `opsi`/`semua` masih sesuai `kontrak-props.md` §7.

## 3. Asumsi

- `opsi[]` = layanan yang punya tarif; `semua[]` tetap sah untuk cache (design §1).
- Data uji = data dev/seed saat ini (omzet Rp469.600, 2 pesanan, 1 varian stok 0).
- Penilaian visual (warna, jarak, fokus) tidak diklaim; hanya struktur/style id pada xlsx dan
  kelas Tailwind pada sumber.

## 4. Matriks risiko dan strategi uji

| Area/Fitur | Kemungkinan Gagal | Dampak | Level Risiko | Strategi/Kedalaman Uji |
|---|---|---|---|---|
| Ceklis ekspedisi | `semua` masih dirender / baris disabled muncul | Sedang (salah pilih layanan) | Sedang | Baca sumber + hitung string bundle + grep teks terlarang |
| Filter Laporan | dobel request / state tak sinkron dengan server | Sedang (laporan salah periode) | Sedang | Baca alur state + HTTP terautentikasi (`bulan-ini`, `kustom`, `asing`) |
| Export Excel | gaya/format salah baris, nilai 0 hilang | Tinggi (laporan pemilik menyesatkan) | **Tinggi** | Render xlsx nyata dari server + bedah XML + render terisolasi via tinker |
| Regresi | build/test rusak | Sedang | Sedang | `npm run build`, `php -l`, PHPUnit penuh + filter |
| Visual/browser | layout 360px, fokus, kontras | Rendah–sedang | Rendah | Tidak ada browser → Belum Diuji |

## 5. Test case

| ID | Requirement/AC | Fitur | Skenario | Prasyarat | Langkah | Hasil Diharapkan | Tipe | Prioritas | Status | Otomatis? |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-01 | design-v1.7 §1 | Checkout | Daftar dirender dari `opsi` saat siap | Sumber | Baca `Checkout.jsx:456-460` | `daftarEkspedisi = opsi.filter(tersedia===true)` saat `siap` | Fungsional | P0 | Lulus | Tidak (statis) |
| TC-02 | design-v1.7 §1 | Checkout | `semua[]` tidak dirender | Sumber | Baca `:379-393`, `:457` | `semua` hanya masuk cache | Fungsional | P0 | Lulus | Tidak |
| TC-03 | design-v1.7 §1 | Checkout | Tidak ada baris disabled / teks "Tidak tersedia" | Sumber+bundle | grep `resources/js`, `public/build/assets/Checkout-DAxNZvXL.js` | 0 hit | Negatif | P0 | Lulus | Ya (grep) |
| TC-04 | design-v1.7 §1 | Checkout | `siap` tapi daftar kosong → notice `kosong` | Sumber | Baca `:802-809` | Notice "Tidak ada layanan untuk kode pos ini." | Edge | P1 | Lulus | Tidak |
| TC-05 | design-v1.7 §1 | Checkout | Notice `menunggu`/`memuat`/`galat`/`timeout` + "Coba lagi" | Sumber | Baca `:777-798` | Semua keadaan punya notice; galat & timeout punya tombol | Regresi | P1 | Lulus | Tidak |
| TC-06 | design-v1.7 §1 | Checkout | Kelompok per `courier_name`, grid 2 kolom ≥sm | Sumber | Baca `:463-470`, `:819-822` | Urutan server dipertahankan, `sm:grid-cols-2` | UI statis | P2 | Lulus | Tidak |
| TC-07 | aksesibilitas | Checkout | Radio punya label + ring fokus | Sumber | Baca `:812-858` | `fieldset/legend`, `htmlFor`, `has-[:focus-visible]` | A11y statis | P2 | Lulus (statis) | Tidak |
| TC-08 | design-v1.7 §2 | Laporan | Ganti periode → satu `router.get` | Sumber | Baca `:50-69` | Satu panggilan, `preserveScroll`+`replace` | Fungsional | P0 | Lulus | Tidak |
| TC-09 | design-v1.7 §2 | Laporan | `kustom` menunggu Terapkan; unduh nonaktif sampai 2 tanggal | Sumber | Baca `:40-41`, `:62`, `:108-124` | `unduhSiap=false` bila tanggal kurang | Negatif | P0 | Lulus | Tidak |
| TC-10 | design-v1.7 §2 | Laporan | Kontrol menampilkan nilai server termasuk normalisasi | HTTP | GET `?periode=asing` lalu baca props | `filter.periode=bulan-ini`, `dari/sampai` 1–30 Nov 2026 | Fungsional | P0 | Lulus | Ya (script HTTP) |
| TC-11 | design-v1.7 §2 | Laporan | Parameter unduh = periode + dari/sampai | Sumber | Baca `:71`, `:83` | `URLSearchParams` sama dengan filter aktif | Fungsional | P1 | Lulus | Tidak |
| TC-12 | brief 2 | Laporan | Unduh terautentikasi menghasilkan xlsx valid | Login dev | GET `/admin/laporan/unduh` | 200, body zip `PK`, 4 sheet | Integrasi | P0 | Lulus | Ya |
| TC-13 | brief 3 | Excel | Header berwarna di Pesanan/Detail Item/Stok | xlsx | Baca style id baris 1 | Semua sel header ber-style (s=2/3) | Fungsional | P1 | Lulus | Ya |
| TC-14 | brief 3 | Excel | Freeze + autofilter 3 sheet itu | xlsx | Baca `<pane>`/`<autoFilter>` | `ySplit=1`, autofilter sesuai kolom | Fungsional | P1 | Lulus | Ya |
| TC-15 | brief 3 | Excel | Zebra/border baris data | xlsx | Bandingkan style baris 2 vs 3 | Style bergantian | UI data | P2 | Lulus | Ya |
| TC-16 | brief 3 | Excel | Format rupiah/qty per baris terpakai, tanpa `B12:B16` | Sumber+xlsx | grep + baca style sel | Format hanya di sel angka; 0 hit rentang mati | Regresi | P1 | Lulus | Ya |
| TC-17 | brief 3 | Excel | Judul Ringkasan merge | xlsx | Baca `<mergeCell>` | `A1:C1` | UI data | P2 | Lulus | Ya |
| TC-18 | brief 3 | Excel | Ringkasan: header/zebra/freeze/format di baris benar | xlsx | Baca sheet Ringkasan | Header di baris 3 & 9, format hanya di sel angka, freeze s.d. header | Fungsional | P1 | **Gagal** | Ya |
| TC-19 | data export | Excel | Nilai 0 terekspor sebagai 0 | xlsx | Cari sel bernilai 0 | Tampil `0`, bukan sel kosong | Fungsional | P1 | **Gagal** | Ya |
| TC-20 | brief 4 | Regresi | `npm run build` sukses | — | Jalankan | exit 0, chunk diperbarui | Regresi | P0 | Lulus | Ya |
| TC-21 | brief 4 | Regresi | `php -l` bersih | — | Jalankan pada exports + controller | Tanpa syntax error | Regresi | P0 | Lulus | Ya |
| TC-22 | brief 4 | Regresi | Suite PHPUnit | — | Jalankan penuh + filter | 382 OK / 120 OK | Regresi | P0 | Lulus | Ya |
| TC-23 | brief 4 | Regresi | Diff hanya berkas yang dijanjikan | — | `git status --short` | Hanya 2 JSX + `app/Exports/` | Regresi | P1 | **Terblokir** | Tidak |
| TC-24 | design-v1.7 | UI | Visual 360px, fokus, disabled, kontras | Browser | — | Sesuai design | UI | P2 | Belum Diuji | Tidak |
| TC-25 | brief 3 | Excel | Buka xlsx di Excel/LibreOffice, cek render warna | Excel | — | Warna/format tampil benar | UI | P2 | Belum Diuji | Tidak |

Ringkasan status: **25 test case — 20 Lulus, 2 Gagal, 1 Terblokir, 2 Belum Diuji.**

Catatan TC-23: repo belum punya commit v1.7, jadi diff v1.7 tidak bisa diisolasi dari perubahan
lama. Bukti alternatif: berkas v1.7 (`Public/Checkout.jsx` M, `Admin/Laporan.jsx` baru,
`app/Exports/` baru, `ReportController`/`ReportFilterRequest`/`ReportService` baru,
`routes/admin.php` M, migrasi + 2 test baru) semuanya mtime 15:5x–16:07 dan sesuai catatan worker.

## 6. Traceability

| Requirement/AC | Test Case ID | Cakupan | Status |
|---|---|---|---|
| brief 1 — render dari `opsi`, `semua` cache, notice, tanpa baris disabled | TC-01..TC-07 | Penuh (statis) | Lulus |
| brief 2 — satu `router.get`, `kustom` tunggu Terapkan, props sinkron, parameter unduh | TC-08..TC-12 | Penuh | Lulus |
| brief 3 — header, freeze/autofilter, zebra, format per baris nyata, merge | TC-13..TC-19, TC-25 | Penuh; Ringkasan + nilai 0 gagal | Gagal |
| brief 4 — build, diff, `php -l` | TC-20..TC-23 | Build/lint/test lulus; diff terblokir | Sebagian |
| design-v1.7 visual | TC-24 | Belum diuji | Belum Diuji |

## 7. Hasil eksekusi (ringkas)

- **Checkout**: sumber sesuai design §1. `Checkout.jsx:456-460` (komentar + filter `tersedia`),
  `:379-393` (`semua` hanya cache), `:802-809` (notice `kosong` juga saat `siap` + daftar kosong),
  `:819-822` (grup per kurir, 2 kolom), `:812-858` (fieldset, radio, ring fokus). grep
  "Tidak tersedia" di `resources/js/` = **0 hit**; bundle `Checkout-DAxNZvXL.js` = 0 hit, copy
  "Tidak ada layanan untuk kode pos ini" = 1 hit.
- **Laporan**: `Laporan.jsx:50-58` satu `router.get` + `preserveState/preserveScroll/replace`;
  `:65-69` ganti non-kustom langsung kirim; `:43-48` sinkron dari `filter` (komentar normalisasi);
  `:40-41` `unduhSiap`. HTTP: `?periode=bulan-ini/kustom/asing` → 200; props `?periode=asing`
  = `{"periode":"bulan-ini","dari":"2026-11-01","sampai":"2026-11-30"}`; unduh → 200, 13.317 byte,
  isi zip berisi 4 sheet.
- **Excel**: sheet `Pesanan` pane `ySplit=1`, autofilter `A1:K4`, header s=2/3; `Detail Item`
  pane `ySplit=1`, autofilter `A1:G6`; `Stok` pane `ySplit=1`, autofilter `A1:E39`; zebra
  bergantian (s=5 baris 2, s=4 baris 3); `Ringkasan` merge `A1:C1`; tidak ada `B12`/`C12`/
  `WithColumnFormatting` di `app/Exports/`.
- **Regresi**: `npm run build` exit 0 (16,02 s); `php -l` 7 berkas bersih; PHPUnit penuh
  **382 test / 3.315 assertion OK**, filter `Report|Checkout|Laporan|Ekspedisi`
  **120 test / 1.275 assertion OK**.

## 8. Bug report

### QA-1 — Nilai `0` hilang menjadi sel kosong di semua sheet ekspor

- **Kartu perbaikan**: `t_5d26759a` (backenddeveloper)
- **Severity/Prioritas**: Medium / P1 · **Komponen**: Backend (`app/Exports/`)
- **Status**: Terbuka
- **Environment**: `http://127.0.0.1:8000/admin/laporan/unduh` (login admin dev), PHP 8.3.32,
  maatwebsite/excel (PhpSpreadsheet), data dev.
- **Prasyarat**: ada pesanan dengan diskon 0 dan varian stok 0 (data dev: 1 varian stok ≤ 0).
- **Langkah reproduksi**:
  1. Login admin dev, buka `/admin/laporan`, klik Unduh (atau unduh ulang berkas bukti
     `laporan.xlsx`).
  2. Buka sheet `Stok`, lihat baris 3 (`BJU-TDR-KCG-XL-HJU`, stok 0) kolom `Stok Akhir`.
  3. Buka sheet `Pesanan` baris 2 kolom `Diskon`; buka sheet `Ringkasan` baris `Total diskon`.
- **Hasil aktual**: sel kosong. `Stok!D3` tanpa `<v>` (hanya style), `Status` = "Habis";
  `Pesanan!G2` kosong; `Ringkasan!B8` kosong. Nilai di DB = 0.
- **Hasil yang diharapkan**: angka `0` tertulis di sel (format angka tetap berlaku), bukan sel
  kosong — laporan stok/penjualan tidak boleh menyamakan "0" dengan "tidak ada data".
- **Bukti**: `docs/bukti-qa-v1.7-t_1e97eae3.txt` bagian `qa-v1.7-stok0.py`
  (`baris 3: ... stok_sel(D)='' status(E)='Habis'`) dan dump `sheet2` (`G2 s=8 <kosong>`).
- **Frekuensi**: selalu untuk setiap nilai 0.
- **Dugaan penyebab**: `Sheet::append()` memakai `Worksheet::fromArray()` dengan
  `strictNullComparison=false`; perbandingan longgar `0 != null` bernilai false sehingga 0
  dilewati. Vendor sudah menyediakan `Maatwebsite\Excel\Concerns\WithStrictNullComparison`,
  belum dipakai satu pun kelas sheet (`grep -rn WithStrictNullComparison app/` kosong).
- **Saran perbaikan**: tambahkan `WithStrictNullComparison` pada `PesananSheet`,
  `DetailItemSheet`, `StokSheet`, `RingkasanSheet`.

### QA-2 — Gaya, format, dan freeze `Ringkasan` bergeser 2 baris

- **Kartu perbaikan**: `t_bd735037` (backenddeveloper)
- **Severity/Prioritas**: Medium / P1 · **Komponen**: Backend (`app/Exports/RingkasanSheet.php`)
- **Status**: Terbuka
- **Environment**: sama dengan QA-1.
- **Prasyarat**: minimal 1 pesanan pada periode laporan.
- **Langkah reproduksi**:
  1. Unduh `/admin/laporan/unduh?periode=bulan-ini`, buka sheet `Ringkasan`.
  2. Amati baris 3 (`Ringkasan`/`Nilai`), baris 4 (`Omzet`), baris 9 (`Produk terlaris`/`Qty`/
     `Omzet`), baris 11 (produk terakhir), dan garis freeze.
- **Hasil aktual**: header baris 3 **tanpa** gaya; baris data 4 (`Omzet`) memakai style header
  (s=2/3); `Qty` di `B9` diformat rupiah (s=6) sedangkan `C9` `Omzet` tanpa format; baris 11
  (data produk terakhir) bergaya header; baris produk 10 tanpa zebra; freeze `A5` ikut membekukan
  baris data `Omzet`.
- **Hasil yang diharapkan**: header `Ringkasan/Nilai` (baris 3) dan `Produk terlaris/Qty/Omzet`
  (baris 9) bergaya header; format rupiah hanya di `B4`, `B6:B8`, `C10:C…`; `Qty` hanya
  `B5`, `B10:B…`; freeze berhenti tepat di bawah header (`A4`).
- **Bukti**: dump xlsx di `docs/bukti-qa-v1.7-t_1e97eae3.txt`:
  `A3 s= -`, `A4 s= 2`, `B9 s= 6 Qty`, `C9 s= - Omzet`, `A11 s= 2`, pane `ySplit="4"`.
- **Frekuensi**: selalu.
- **Dugaan penyebab**: `RingkasanSheet::array()` menyisipkan dua baris kosong (`[]`), tetapi
  `Sheet::append()` memakai `flatMap` sehingga baris kosong hilang dan seluruh isi naik 2 baris;
  konstanta `HEADER_RINGKASAN=4`, `BARIS_PERTAMA_RINGKASAN=5`, `BARIS_TERAKHIR_RINGKASAN=9`,
  `HEADER_PRODUK=11`, `BARIS_PERTAMA_PRODUK=12`, `freezePane('A5')`, serta format `5,6,7..9`
  (`RingkasanSheet.php:15-23,72,80-86`) masih memakai nomor indeks array. Render ulang terisolasi
  via `artisan tinker` (tanpa server) menghasilkan susunan yang sama → bukan cache/opcache.
- **Saran perbaikan**: samakan dengan baris nyata — `HEADER_RINGKASAN=3`,
  `BARIS_PERTAMA_RINGKASAN=4`, `BARIS_TERAKHIR_RINGKASAN=8`, `HEADER_PRODUK=9`,
  `BARIS_PERTAMA_PRODUK=10`, `freezePane('A4')`, format `B4` rupiah, `B5` qty, `B6:B8` rupiah
  (dan buang baris kosong dari `array()` agar tidak menyesatkan).

## 9. Non-fungsional dan batasan

- Tanpa browser pada environment ini → TC-24 (360px, fokus keyboard, tampilan disabled) dan
  TC-25 (render warna di Excel/LibreOffice) **Belum Diuji**; tidak ada klaim visual.
- Tidak ada load test, penetration test, atau uji aksesibilitas screen reader.
- Uji HTTP memakai akun admin dev dari `docs/akun-dev.md` yang dibaca saat runtime oleh skrip
  scratch; kredensial/cookie tidak ditulis ke laporan maupun bukti.
- `artisan tinker` dipakai baca-saja untuk render `RingkasanSheet` terisolasi dan hitung varian
  stok ≤ 0; tidak ada perubahan data.

## 10. Self-review

- [x] Tiga item brief dipetakan ke test case + traceability.
- [x] Area risiko tertinggi (isi xlsx) diuji pada berkas nyata dari server, bukan hanya kode.
- [x] Negatif/edge: `siap` + daftar kosong, periode tak sah, nilai 0, stok 0, `kustom` tanpa tanggal.
- [x] Tidak ada klaim pengujian yang tidak dijalankan (browser/Excel ditandai Belum Diuji).
- [x] Setiap defect punya langkah reproduksi, expected bersumber, bukti aman.
- [x] Tidak ada berkas di luar `docs/` yang diubah; `.env` tidak disentuh.
- [x] Go/No-Go disertai alasan dan risiko sisa.

## 11. Rekomendasi

**GO BERSYARAT.** Fitur ceklis ekspedisi dan filter Laporan siap (semua P0 lulus, build/test
bersih), tetapi penutupan kartu desain Excel **belum bisa** sebelum QA-1 dan QA-2 diperbaiki:
laporan pemilik berpotensi menampilkan stok 0 sebagai sel kosong dan gaya/format `Ringkasan`
salah baris. Keduanya Medium (bukan blocker rilis total, tidak ada data hilang di DB).
Syarat: perbaiki dua kartu perbaikan backend (`t_5d26759a`, `t_bd735037`) lalu QA verifikasi ulang
(unduh xlsx baru, cek `Stok!D` untuk stok 0, `Ringkasan` baris 3/9/10, freeze `A4`).

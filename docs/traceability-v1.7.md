# Traceability v1.7 — permintaan pemilik → kartu

Sumber permintaan: kartu `t_f3049422` (techlead, 2 Nov 2026).

| # | Permintaan pemilik | Keputusan | Kartu | Bukti/DoD |
|---|---|---|---|---|
| 1 | "ekspedisi yang tidak tersedia dihapus dari checkout" (mobile terlalu panjang) | Frontend saja; daftar dari `opsi[]`, bukan `semua[]`; kontrak server tidak berubah | `t_ca47e2e4` (frontenddeveloper) | `docs/design-v1.7.md` §1; `npm run build`; grep `semua`; uji mobile pemilik |
| 2 | "filter periode Laporan masih belum bisa, menampilkan hari ini saja" | Server terbukti benar (`resolve()` memetakan 4 periode + normalisasi); penyebab angka sama = data pesanan hanya 2 dan bertanggal hari ini. Perbaikan UX: terapkan langsung saat dropdown berubah + sinkron state dari props | `t_c085eb76` (frontenddeveloper) | `docs/bukti-techlead-v1.7-t_f3049422.txt`; `docs/design-v1.7.md` §2; `npm run build` |
| 3 | "desain file Excel masih jelek" | Backend `app/Exports/`: header brand, freeze, autofilter, zebra, border, format per baris nyata, merge judul | `t_6863d44a` (backenddeveloper) | `docs/brief-v1.7-backend.md` DoD; `php -l`; buka Excel oleh pemilik |
| 4 | Verifikasi ketiganya | QA statis + build; butuh browser/Excel ditandai belum diuji | `t_1e97eae3` (qatesting, parent 1–3) | `docs/qa-v1.7.md` |

## Tidak dikerjakan (sengaja)

- Tidak menyentuh `ReportService`/`ReportController`: probe membuktikan pemetaan periode dan
  ringkasan sudah benar. Menambah "perbaikan" di sana akan mengubah perilaku yang sudah sesuai
  `docs/asumsi.md` v1.6.
- Tidak menjalankan tes PHP: driver `pdo_sqlite` tidak ada di mesin ini; `php vendor/bin/phpunit`
  hanya menghasilkan error driver, bukan hasil tes. Dicatat sebagai risiko, bukan lulus.
- Tidak menambah data contoh ke DB (aturan: tidak mengubah DB). Karena itu angka `hari-ini`,
  `7-hari`, dan `bulan-ini` tetap sama sampai pemilik punya pesanan di tanggal lain.

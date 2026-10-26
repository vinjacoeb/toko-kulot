# Ringkasan tim — v1.2 (24 Okt 2026)

## Tujuan
Menutup 8 permintaan pemilik di kartu `t_10766b7f`: pembayaran Midtrans tanpa popup Snap,
ongkir otomatis dari alamat registrasi, status bayar yang berubah sendiri, tipografi publik
yang rapi, admin ekspedisi berbasis katalog, admin pesanan yang menampilkan data Midtrans &
Biteship, resi otomatis, dan riwayat pesanan yang informatif.

## Dokumen acuan
- `docs/PRD-v1.2.md` — **acuan utama** untuk pekerjaan ini (menang atas PRD-v1.1 pada bagian
  yang disebut).
- `docs/design-v1.2.md` — desain (dibuat kartu UIUX; sampai ada, pakai design-v1.1 §2).
- `docs/PRD-v1.1.md`, `docs/design-v1.1.md`, `docs/db.md`, `docs/kontrak-props.md` — dasar.
- `docs/pertanyaan-pemilik-v1.2.md` — tindakan pemilik (P1–P4) dan asumsi.

## Aturan kerja (dari PRD v1.1 §8 + aturan board)
- Agent hanya mengubah berkas di lingkup kartunya; dokumen di `docs/` boleh ditulis.
- Jangan mengubah `.env`, menjalankan migrasi/server, atau memakai kredensial asli.
- Uang, stok, dan status pesanan: perubahan status hanya lewat service/DB transaction yang ada.
- Temuan di luar lingkup → `docs/catatan-<peran>.md`, bukan perbaikan diam-diam.
- Bahasa UI Indonesia; istilah teknis boleh Inggris.

## Urutan kerja
1. UIUX: `docs/design-v1.2.md` (halaman bayar, checkout otomatis, admin pesanan/ekspedisi,
   riwayat, aturan tipografi).
2. Backend paralel: B1 (Midtrans Core API) dan B3 (resi Biteship) → B2 (register/prefill,
   setelah B1) → B4 (props admin & riwayat, setelah B1+B3).
3. Frontend: F1 checkout/register, F2 halaman bayar, F3 admin pesanan/ekspedisi, F4 riwayat —
   setelah backend + desain terkait. F5 tipografi dikerjakan **terakhir** (menyentuh berkas yang
   sama dengan F1/F2).
4. QA: rencana + eksekusi, bukti di `docs/qa-v1.2.md`.
5. Tech Lead: review + rekomendasi Go/No-Go (`docs/review-v1.2.md`).

## Titik berhenti pemilik
- Sebelum uji mode asli: P1–P4 di `docs/pertanyaan-pemilik-v1.2.md`.
- Keputusan rilis akhir tetap di pemilik.

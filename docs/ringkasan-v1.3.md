# Ringkasan tim — v1.3 (24 Okt 2026)

## Tujuan

Menutup kartu `t_c04dd4c7`: memakai webhook Biteship (`order.status`, `order.price`,
`order.waybill_id`) agar status kirim, ongkir aktual, dan resi masuk sendiri ke pesanan, lalu
tampil di `/admin/pesanan`, riwayat pembeli, dan halaman selesai bayar; sekaligus memperbaiki
halaman toko yang kosong saat dibuka lewat tunnel ngrok.

## Dokumen acuan

- `docs/PRD-v1.3.md` — **acuan utama** (menang atas PRD v1.2 pada bagian yang disebut).
- `docs/design-v1.3.md` — desain (kartu UIUX; sebelum ada, design-v1.2 tetap dipakai).
- `docs/PRD-v1.2.md`, `docs/design-v1.2.md`, `docs/db.md`, `docs/kontrak-props.md` — dasar.
- `docs/pertanyaan-pemilik-v1.3.md` — tindakan pemilik + asumsi.

## Aturan kerja

- Agent hanya mengubah berkas di lingkup kartunya; dokumen di `docs/` boleh ditulis.
- Jangan mengubah `.env`, menjalankan migrasi/server, atau memakai kredensial asli.
- Uang, stok, status pesanan: perubahan hanya lewat jalur yang sudah ada; webhook tidak
  menagih ulang, tidak mengembalikan stok, tidak membatalkan pesanan.
- Temuan di luar lingkup → `docs/catatan-<peran>.md`, bukan perbaikan diam-diam.
- Bahasa UI Indonesia; istilah teknis boleh Inggris.

## Urutan kerja

1. Paralel: UIUX `design-v1.3`; Backend webhook inti (B1); Backend trust proxy (B0).
2. Backend props (B2) setelah B1 + desain; DevOps build/tunnel (D0) setelah B0.
3. Frontend admin (F1) dan Frontend pembeli (F2) setelah B2 + desain.
4. QA (Q1) setelah F1 + F2 + D0.
5. Review Tech Lead (R1) terakhir.

## Titik berhenti pemilik

- Isi `BITESHIP_WEBHOOK_TOKEN`, daftarkan URL webhook + tiga event di dashboard Biteship,
  jalankan `php artisan migrate`, jaga tunnel hidup (`docs/PRD-v1.3.md` §4).
- Uji webhook asli dan tampilan browser adalah tugas pemilik; QA menandainya "belum diuji".
- Keputusan rilis akhir di pemilik.

# Ringkasan tim — v1.4 (kartu t_b6a1ee89)

## Tujuan

Menutup empat permintaan pemilik: ongkir website tidak melonjak dibanding `order.price`
Biteship; ubah status manual di admin dihapus (status mengikuti Midtrans/Biteship); riwayat
pengiriman pembeli mengikuti Biteship dengan node Selesai otomatis; token webhook Biteship
dipakai dari `.env` (sudah).

## Dokumen acuan

- Fungsi & keputusan: `docs/PRD-v1.4.md` (menang atas v1.3 untuk F11–F14).
- Tampilan: `docs/design-v1.4.md` (menang atas v1.3 untuk timeline & hapus kartu status).
- Data: `docs/db.md`; props: `docs/kontrak-props.md` §7, §12.16, §12.17, §13.
- Aturan kerja agent: `docs/PRD-v1.3.md` §3 (tidak berubah).

## Cakupan

Masuk: F11 ongkir (berat, asal/tujuan, log bukti), F12 hapus ubah status manual, F13
`orders.shipping_events` + timeline pembeli, F14 tanpa kode.
Tidak masuk: refund, polling realtime, notifikasi, event store, pembatalan manual pengganti,
mengubah uang yang sudah ditagih.

## Aturan kerja (ringkas, dari PRD-v1.3 §3)

- Worker hanya menulis kode di path yang disebut kartu; dokumen di `docs/`.
- QA tidak mengubah kode dan tidak menyalakan server; temuan = kartu baru, bukti `path:baris`.
- Jangan membaca/menulis `.env`; token milik pemilik.
- Perubahan status/uang harus punya test; jalankan suite yang relevan sebelum selesai.
- Ragu requirement → catat di `docs/catatan-<peran>.md`, jangan mengarang.

## Urutan kerja

1. B3 hapus ubah status manual (backend).
2. F2 hapus UI ubah status (setelah B3); B1 ongkir berjalan paralel dengan F2.
3. B2 timeline pengiriman (setelah B1).
4. F1 tampilan timeline (setelah B2).
5. QA verifikasi semua (setelah B1, B2, B3, F1, F2).
6. Review Tech Lead (setelah QA).

## Titik berhenti pemilik

- Menjalankan `php artisan migrate` (kolom `shipping_events`).
- Membandingkan ongkir nyata: satu pesanan uji + log + payload `order.price`
  (F11 "belum dicek, butuh key/saldo Biteship" sampai data ini ada).
- Memutuskan konsekuensi F12: pesanan retur/gagal tidak bisa dibatalkan admin dari UI
  (`docs/pertanyaan-pemilik-v1.4.md`).

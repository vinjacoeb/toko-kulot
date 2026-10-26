# Ringkasan tim — v1.5 (kartu `t_51b30cf7`)

## Tujuan

Menutup enam permintaan pemilik (26 Okt 2026):

1. Opsi ekspedisi di checkout harus sama dengan layanan yang aktif di `/admin/ekspedisi`.
2. Checkout memakai **dropdown** layanan kurir (dikelompokkan per kurir), bukan daftar radio.
3. Status pengiriman Biteship (mis. "Dalam perjalanan") harus terlihat di `/history` dan
   `/admin/pesanan` — sekarang tertahan di "Dikonfirmasi".
4. Timeline pesanan memakai **ikon**, bukan hanya titik.
5. Halaman `/checkout/{order}/selesai` menampilkan timeline pesanan.
6. `/history` punya filter berdasarkan `order.status`.

## Dokumen acuan

- Fungsi: `docs/PRD-v1.4.md` (menang untuk F11–F14), `docs/PRD-v1.3.md` §2 (webhook).
- Tampilan: `docs/design-v1.4.md`; tambahan v1.5: `docs/design-v1.5.md` (dibuat UIUX, kartu U1).
- Kontrak props: `docs/kontrak-props.md` §7.9 (halaman selesai), §7.12 (opsi ongkir), §13 (riwayat).
- Data: `docs/db.md`. Tidak ada kolom/tabel baru di v1.5.
- Aturan kerja agent: `docs/PRD-v1.3.md` §3 (tidak berubah).

## Cakupan

Masuk: dropdown checkout, sumber opsi = pengaturan aktif, toleransi bentuk lama
`shipping_couriers`, token webhook menerima nama header apa pun (nilai tetap rahasia),
filter status riwayat, timeline berikon, timeline di halaman selesai.

Tidak masuk: status baru, ubah status manual admin, notifikasi, refund, penamaan layanan
kurir di luar katalog Biteship, perubahan uang/tarif, migrasi DB.

## Aturan kerja (ringkas, dari PRD-v1.3 §3)

- Worker hanya menulis di path yang disebut kartu; dokumen di `docs/`.
- QA tidak mengubah kode, tidak menyalakan server; temuan = kartu baru + bukti `path:baris`.
- `.env` milik pemilik: jangan dibaca/ditulis. Token tidak boleh masuk log.
- Perubahan status/uang wajib punya test; jalankan test yang relevan sebelum selesai.
- Ragu requirement: catat di `docs/catatan-<peran>.md`, lanjut dengan asumsi terdekat.

## Urutan kerja

1. U1 desain v1.5 (UIUX) — tanpa parent.
2. B1 opsi ekspedisi (backend) — tanpa parent.
3. B2 token webhook (backend) — tanpa parent.
4. B3 filter riwayat + timeline halaman selesai (backend) — setelah B1 (berkas kontrak sama).
5. F1 dropdown checkout — setelah U1 + B1.
6. F2 ikon timeline + timeline selesai + filter riwayat — setelah U1 + B3.
7. QA v1.5 — setelah B1, B2, B3, F1, F2.
8. Review Tech Lead — setelah QA.

## Titik berhenti pemilik

- **Token webhook**: isi *Custom Header* di dashboard Biteship dengan nilai yang sama persis
  dengan `BITESHIP_WEBHOOK_TOKEN`; nama header bebas (kode v1.5 menerima nama apa pun).
  Lihat `docs/langkah-pemilik.md` §v1.5.
- **Layanan ekspedisi**: pastikan layanan yang diinginkan dicentang "Aktif" di
  `/admin/ekspedisi`, lalu Simpan. Hanya layanan aktif yang tampil di checkout.
- **Status "Dalam perjalanan"**: konfirmasi status Biteship mana yang dimaksud
  (`docs/pertanyaan-pemilik-v1.5.md` P3).
- Uji browser 360 px untuk dropdown, ikon timeline, filter; QA menandainya "belum diuji".

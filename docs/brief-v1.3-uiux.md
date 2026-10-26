# Brief UIUX — v1.3 (webhook Biteship)

Baca `docs/PRD-v1.3.md` §2.6 (kontrak props) dan §1 sebelum mulai. Desain v1.2 tetap berlaku
untuk warna, tipografi, jarak, dan komponen; dokumen ini hanya menambah keadaan baru.

## Yang dikerjakan

Tulis `docs/design-v1.3.md` (maks 2 halaman) untuk empat tempat:

1. **Admin `/admin/pesanan/{order}` — panel Pengiriman.** Tambahkan: waktu pembaruan status
   (`shipping.updated_at`, format `24 Okt 2026 14.05`), resi dari Biteship, nama/telepon kurir
   (`shipping.driver`) bila ada, ongkir aktual + selisih (`price_final`, `price_selisih`) bila
   ada, dan baris peringatan `perlu_tindakan` + `tindakan` (contoh nada: tenang, bukan merah
   menyala). Payload mentah `webhook_terakhir` di balik kontrol buka/tutup kecil berlabel
   "Lihat payload webhook" (khusus admin, monospace, bisa digulir, tinggi terbatas).
2. **Admin `/admin/pesanan` — daftar.** Badge "Perlu tindakan" pada baris yang
   `shipping_perlu_tindakan`, plus kolom/timestamp pembaruan pengiriman. Jangan menambah kolom
   sampai tabel sempit di mobile; sebutkan aturan lipatnya.
3. **Riwayat pembeli `/akun/pesanan`.** Status pengiriman + resi + kurir tampil tanpa aksi;
   timeline "Dikirim" memakai `shipped_at`; keadaan kosong saat resi belum ada. Tanpa harga
   aktual/selisih dan tanpa payload.
4. **Halaman selesai `/checkout/{order}/selesai`.** Blok ringkas "Status pengiriman" di bawah
   ringkasan pesanan: status, resi (bisa disalin), kurir, tautan lacak bila ada. Bila belum ada
   resi, tampilkan kalimat "Resi sedang disiapkan" — bukan blok kosong.

Halaman bayar `CheckoutPay` **tidak** berubah (lihat PRD §2.6 alasan).

## Batasan

- Jangan mengubah kontrak props; bila ada yang kurang, tulis di `docs/catatan-uiux.md` dan
  lanjut dengan asumsi.
- Bahasa Indonesia; istilah teknis boleh Inggris. Tidak ada data contoh yang dikarang: beri
  label `[CONTOH]`.
- Badge "Mode uji" yang sudah ada tetap; sebutkan bila berimpitan dengan badge baru.

## Definition of Done

- `docs/design-v1.3.md` ada, tiap tempat punya keadaan: belum ada webhook, picked, delivered,
  retur/gagal, selisih ongkir, dan payload kosong.
- Setiap field yang digambar merujuk key di PRD §2.6.
- Tidak ada berkas kode yang disentuh.

Block hanya bila PRD bertentangan dengan design-v1.2 soal struktur halaman yang tidak bisa
diselesaikan asumsi.

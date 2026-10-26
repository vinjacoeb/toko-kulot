# Brief QA — v1.2

Baca `docs/PRD-v1.2.md` seluruhnya, `docs/design-v1.2.md` §Tipografi dan §Checklist, serta
`docs/kontrak-props.md`. Tulis rencana **dan** hasil di `docs/qa-v1.2.md`.

## Cakupan wajib
1. Bayar: 8 kanal mode uji menampilkan instruksi benar; ganti kanal 2×; kanal ditolak; hitung
   mundur; lunas mode uji → halaman berubah sendiri; `/midtrans/selesai?order_id=...` mendarat benar.
2. Checkout: prefill dari register; tarif muncul tanpa klik; ketik kode pos cepat tidak
   menumpuk request; kode pos berubah mereset kurir; submit dengan tarif kedaluwarsa ditolak rapi.
3. Register: 3 field wajib, kode pos 4 angka ditolak, data tersimpan.
4. Admin ekspedisi: dropdown kurir → layanan terfilter; simpan; duplikat ditolak; API mati →
   halaman tetap bisa dipakai.
5. Admin pesanan: panel pembayaran & pengiriman cocok dengan DB; buat resi 2× = 1 panggilan;
   pesanan belum bayar ditolak; resi manual tetap bisa.
6. Riwayat: resi, kurir, alamat, rincian, timeline tampil; 360 px tidak pecah.
7. Tipografi: checklist design-v1.2 lulus; tidak ada ukuran font ad-hoc.

## Aturan
- Tidak mengubah kode (hanya `docs/`), tidak menyalakan server, tidak memakai kredensial asli.
- Setiap temuan: apa, bukti `path:baris` atau respons, hasil aktual vs diharapkan, tingkat.
- Yang butuh browser/HP: tulis "belum diuji, butuh browser".
- Satu masalah = satu kartu perbaikan (assignee sesuai sumber), maks 2 putaran per masalah.
- Jangan menulis "lulus" untuk yang tidak dijalankan; tulis "belum dicek" + alasan.

## Definition of Done
`docs/qa-v1.2.md` memuat matriks cakupan (lulus/gagal/belum dicek), daftar bug bernomor, dan
rekomendasi. Kartu perbaikan dibuat untuk setiap kegagalan.

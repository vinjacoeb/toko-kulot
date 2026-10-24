# Pertanyaan & tindakan pemilik — addendum v1.1

Kartu `t_8b70141c`, 24 Oktober 2026. Tidak ada yang memblokir pengembangan:
semua butir di bawah punya nilai bawaan / mode uji di `docs/PRD-v1.1.md`.

| # | Hal | Rekomendasi techlead | Dampak bila tidak dijawab |
|---|---|---|---|
| P16 | Kunci Biteship & alamat asal | Isi `BITESHIP_API_KEY` di `.env`, lalu alamat asal + kode pos di `/admin/ekspedisi` | Ongkir memakai tarif uji Rp20.000 berlabel "Tarif uji"; checkout tetap jalan |
| P17 | Kanal bank Midtrans | Aktifkan Bank Transfer/VA (BCA, BNI, BRI, Mandiri, Permata) di dashboard Midtrans | Snap hanya menampilkan kanal yang aktif; QRIS tetap ada |
| P18 | Definisi "reguler" | Reguler = layanan standar kurir (JNE REG, J&T EZ, SiCepat REG, AnterAja REG, Ninja Standard, TIKI REG), bukan instant/same day/cargo | Bila salah tandai, gratis ongkir berlaku untuk layanan yang terlalu mahal; bisa diubah di `/admin/ekspedisi` |
| P19 | Dasar gratis ongkir | Subtotal barang **sebelum** ongkir dan diskon, sesuai PRD §6 `subtotal` | Bila ingin setelah diskon, aturan dan tampilan "sisa belanja" harus diubah |
| P20 | Aset galeri/hero asli | Ganti placeholder `[CONTOH]` dengan foto produk asli dari tab Landing | Landing tampil dengan gambar contoh; jangan dipakai produksi |
| P21 | Ambang gratis ongkir | Tetap **Rp300.000** (sesuai permintaan); dapat diubah di `/admin/ekspedisi` | Tidak ada; nilai bawaan sudah sesuai permintaan |

Jawaban cara paling cepat: isi langsung di `/admin/ekspedisi` + `.env`, atau balas di kartu
`t_8b70141c` dengan nomor P16–P21. Techlead tidak membaca `.env` dan tidak menempel kunci di dokumen.

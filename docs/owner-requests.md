# Permintaan tambahan & perbaikan dari pemilik — daftar masuk

Kartu: `t_d37b0a4a` (24 Oktober 2026). Status: **menunggu detail pemilik**.

Permintaan yang masuk baru berupa satu kalimat: "tambahan dan perbaikan dari pemilik".
Tidak ada daftar butir di repo, di board, maupun di dokumen mana pun. Techlead tidak boleh
mengarang fitur atau aturan bisnis, jadi dokumen ini adalah **formulir masuk**, bukan backlog.
Begitu pemilik mengisi butir 1–5, tiap item langsung dipetakan ke area + acceptance criteria
dan dibuatkan kartu.

## 1. Cara mengisi (pilih satu)

1. Balas komentar di kartu `t_d37b0a4a`, satu baris per permintaan, format:
   `layar | perubahan yang diminta | perilaku yang diharapkan | prioritas (tinggi/sedang/rendah) | tenggat`.
2. Atau sunting tabel §2 di berkas ini langsung dari editor, lalu balas "sudah" di kartu.

Contoh baris yang bisa langsung dikerjakan:
`/produk/{slug} | tambah tombol "Beli sekarang" di samping "Tambah ke keranjang" | tombol membuka /checkout dengan 1 item itu saja | tinggi | sebelum 30 Okt`.

Contoh yang belum bisa dikerjakan (akan ditandai "menunggu keputusan pemilik"):
`ganti ongkir jadi gratis semua | — | semua pesanan ongkir 0 | tinggi | —`
(bertentangan dengan `docs/PRD-v1.1.md` §4 D3: gratis hanya subtotal ≥ Rp300.000 + layanan reguler).

## 2. Daftar permintaan (diisi pemilik)

| # | Layar/fitur | Perubahan diminta | Perilaku diharapkan | Prioritas | Tenggat | Area | Dalam cakupan MVP? | Acceptance criteria | Status |
|---|---|---|---|---|---|---|---|---|---|
| 1 | | | | | | | | | menunggu pemilik |
| 2 | | | | | | | | | menunggu pemilik |
| 3 | | | | | | | | | menunggu pemilik |

Kolom **Area**: frontend / backend / UI-UX / DevOps / data (isi sendiri bila tahu, kalau tidak
techlead yang menentukan). Kolom **Dalam cakupan MVP?** diisi terhadap `docs/PRD.md` +
`docs/PRD-v1.1.md`; di luar itu butuh keputusan pemilik tertulis sebelum dikerjakan.

## 3. Butir yang sudah diketahui terbuka (bukan permintaan baru)

Diambil dari `docs/review-v1.1.md` dan `docs/review-alur-pemesanan.md`; sudah punya kartu atau
memang tindakan pemilik. Jangan diduplikasi saat mengisi §2.

| # | Hal | Area | Cakupan | Bukti | Status |
|---|---|---|---|---|---|
| B1 | "Cek Ongkir" selalu gagal: Biteship menjawab 400, body galat tidak dicatat | backend | dalam (PRD-v1.1 §3 AC-4) | `storage/logs/laravel.log:7142-7144`; `app/Services/BiteshipService.php:173,281`; `docs/review-alur-pemesanan.md` §2 | kartu perbaikan dibuat di `t_8e8bb605`; status kartu belum diperiksa di sini |
| B2 | CTA landing di DB pemilik belum memuat "min." dan "reguler" | data (bukan kode) | dalam (PRD-v1.1 §6 AC-3) | `docs/review-v1.1.md` §2 D5.3 | tindakan pemilik: simpan ulang tab Landing |
| B3 | Snap sandbox asli, Biteship key asli, UI admin `/admin/ekspedisi`, halaman checkout/keranjang/bayar | QA/pemilik | dalam | `docs/review-v1.1.md` §4 | belum diuji, butuh key/browser pemilik |
| B4 | Kunci Biteship, alamat asal, kanal bank Midtrans, aset galeri asli, ambang gratis ongkir | pemilik | dalam | `docs/pertanyaan-pemilik-v1.1.md` P16–P21 | menunggu pemilik |

## 4. Aturan yang tidak berubah

- Perbaikan bug/regresi yang ditemukan sendiri tetap dibuatkan kartu (satu masalah satu kartu),
  tidak perlu menunggu §2.
- Permintaan yang menambah fitur di luar `docs/PRD.md`/`docs/PRD-v1.1.md` hanya dikerjakan
  setelah pemilik menyatakannya eksplisit (tertulis di §2 atau komentar kartu).
- Techlead tidak menulis kode dan tidak membaca `.env`. Kunci/rahasia tidak ditempel di dokumen ini.

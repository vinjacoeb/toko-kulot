# Brief UIUX — v1.2

Baca `docs/PRD-v1.2.md` (§2.1–2.3, §3, §5–§9) dan `docs/design-v1.1.md` §2 (token & tipografi).
Tulis **`docs/design-v1.2.md`** (satu berkas, maks 2 halaman padat).

## Yang dikerjakan
1. **Halaman bayar tanpa Snap**: susun layout pemilih kanal (8 kanal, grup: QRIS / Transfer bank /
   Mandiri Bill / Gerai), state: belum pilih, menunggu bayar per jenis instruksi (VA, QR, bill,
   gerai), kedaluwarsa, lunas, galat, mode uji. Tentukan hierarki: status, nominal, instruksi,
   hitung mundur, tombol salin, "Ganti metode". Rujuk kontrak props PRD §2.3 — jangan mengarang field.
2. **Checkout otomatis**: state ongkir tanpa tombol (memuat, terisi, kosong, galat + coba lagi),
   penempatan ringkasan biaya, dan field alamat hasil prefill (mana yang boleh diubah).
3. **Register**: penempatan field alamat, kota, kode pos; pesan galat; urutan field.
4. **Admin pesanan & ekspedisi**: information architecture panel pembayaran dan pengiriman,
   pola dropdown kurir → layanan, tombol "Buat resi otomatis" + statusnya.
5. **Riwayat**: kartu pesanan + detail yang bisa dibuka; urutan informasi (status, resi, alamat,
   rincian, timeline).
6. **Tipografi**: penilaian implementasi sekarang terhadap design-v1.1 §2.2; tetapkan skala yang
   diizinkan, line-height, panjang baris maks 65ch, ritme spasi, aturan uppercase/letter-spacing,
   `tabular-nums` untuk harga. Daftar pelanggaran nyata `path:baris` + contoh sebelum/sesudah
   dalam teks. Ini yang dipakai kartu F5.

## Batasan
- Jangan mengubah kode, `.env`, atau menjalankan server. Hanya menulis di `docs/`.
- Jangan menambah fitur di luar PRD v1.2; usulan → `docs/usulan.md`.
- Warna/token baru hanya bila perlu; utamakan token design-v1.1.

## Definition of Done
- `docs/design-v1.2.md` memuat semua state (termasuk kosong, galat, loading, kedaluwarsa) dan
  merujuk id kanal serta nama props di PRD §2.3.
- Setiap rekomendasi tipografi bisa diperiksa (angka px/rem, class Tailwind, path:baris).
- Tidak ada keputusan yang bergantung pada data yang tidak ada di kontrak props.

## Kapan boleh block
Hanya bila PRD v1.2 dan kontrak props saling bertentangan soal field yang wajib ditampilkan.

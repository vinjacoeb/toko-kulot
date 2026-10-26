# Brief UIUX — v1.5

Baca: `docs/PRD-v1.4.md` §3–§4, `docs/design-v1.4.md`, `docs/kontrak-props.md` §7.9, §7.12, §13,
`resources/js/Pages/Public/Checkout.jsx`, `History.jsx`, `CheckoutSuccess.jsx`,
`resources/js/Components/icons.jsx`. Jangan mengubah kode aplikasi.

## Output

`docs/design-v1.5.md`, maksimal 3 halaman, berisi empat bagian:

1. **Dropdown ekspedisi di checkout** — ganti daftar radio jadi satu `Select` native dengan
   `<optgroup>` per kurir; teks opsi: `Layanan · etd · Rp`; tampilkan harga/GRATIS terpilih di
   bawah dropdown; state memuat, kosong, dan galat tetap seperti sekarang. Mobile 360 px.
2. **Ikon timeline** — setiap node timeline pesanan (Dibuat, Dibayar, Dikirim, Selesai) memakai
   ikon dari `icons.jsx` (pilih yang sudah ada; sebut nama ekspor per node). Node belum aktif
   tetap redup; node batal/kedaluwarsa tidak berubah.
3. **Timeline di halaman selesai** — posisi, judul bagian, dan urutan terhadap ringkasan
   pembayaran serta daftar item; sumber data `pesanan.timeline` (kontrak §7.9 v1.5).
4. **Filter riwayat** — kontrol filter status di atas daftar pesanan (Select + label), opsi
   memakai `ringkasan` yang sudah dikirim server; keadaan "tidak ada pesanan pada filter ini";
   filter tetap terbawa saat pindah halaman; mobile 360 px.

## Batasan

- Hanya komponen/token yang sudah ada; tanpa dependency baru, tanpa gambar.
- Jangan mengubah kontrak props atau backend; usulan kontrak tulis di design sebagai catatan.
- Aksesibilitas: label eksplisit, fokus terlihat, `aria-live` untuk perubahan hasil filter.

## Definition of Done

- Empat bagian di atas ada, masing-masing dengan ukuran/varian dan keadaan kosong/galat.
- Setiap keputusan warna/ikon merujuk token atau nama ekspor yang benar-benar ada.
- Tidak ada kalimat "sesuai selera"; tulis nilai konkret (px, token, teks label).

## Kapan boleh block

Hanya bila `icons.jsx` tidak punya ikon yang layak untuk satu node dan menambah ikon berarti
mengubah kode (bukan tugas UIUX). Selain itu putuskan dan tulis alasannya di design.

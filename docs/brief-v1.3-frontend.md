# Brief Frontend — v1.3 (tampilan data webhook)

Baca `docs/design-v1.3.md` (bentuk tampilan), `docs/PRD-v1.3.md` §2.6 (props), dan
`docs/kontrak-props.md` bagian yang dipakai kartu. Jangan mengubah backend.

## Kartu F1 — admin pesanan

Berkas: `resources/js/Pages/Admin/Orders/Show.jsx`, `.../Index.jsx`, `.../partials/*` bila perlu.

- Panel Pengiriman: waktu pembaruan, resi, kurir, ongkir aktual + selisih, peringatan
  `perlu_tindakan` + `tindakan`, dan payload mentah di balik kontrol buka/tutup.
- Daftar: badge "Perlu tindakan" + timestamp pembaruan tanpa merusak tabel di layar sempit.
- Semua teks Indonesia; `null` ditampilkan sebagai "—" atau kalimat kosong sesuai design.
- Jangan menambah aksi tulis baru; perubahan status pesanan tetap tombol yang sudah ada.

## Kartu F2 — pembeli

Berkas: `resources/js/Pages/Public/CheckoutSuccess.jsx`, `resources/js/Pages/Public/History.jsx`
(+ partial terkait).

- Halaman selesai: blok "Status pengiriman" ringkas (status, resi bisa disalin, kurir, tautan
  lacak); belum ada resi → "Resi sedang disiapkan".
- Riwayat: status + resi + kurir tampil tanpa aksi; timeline "Dikirim" dari `shipped_at`;
  keadaan kosong rapi. Jangan tampilkan harga aktual, selisih, atau payload (tidak dikirim
  server; jangan mengarang).
- Halaman bayar tidak diubah.

## Batasan

- Hanya `resources/js/` dan `docs/`. Jangan `.env`, jangan menjalankan server; setelah selesai
  minta DevOps/QA menjalankan `npm run build` atau jalankan bila kartu mengizinkan build.
- Komponen baru wajib impor `React` eksplisit bila JSX terpisah (bug `React is not defined`
  pernah terjadi).
- Jangan memperbaiki temuan di luar lingkup; catat di `docs/catatan-frontend.md`.

## Definition of Done

- `npm run build` sukses tanpa error baru.
- Keadaan: belum ada resi, picked, delivered, retur, selisih ongkir, payload kosong — semua
  tampil tanpa crash dan tanpa `undefined`.
- Tidak ada key props baru yang dikarang; hanya yang ada di kontrak.

Block hanya bila props yang dijanjikan tidak ada di respons server dan tidak bisa ditunggu
lewat asumsi; tulis bukti path:baris.

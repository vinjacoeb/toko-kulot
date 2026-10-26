# Brief Frontend — v1.2

Baca `docs/PRD-v1.2.md` (bagian sesuai kartu), `docs/design-v1.2.md` (bila sudah ada; sebelum itu
design-v1.1 §2), dan kontrak props terkait di `docs/kontrak-props.md`. Jangan mengarang field:
kalau tidak ada di props, tulis temuan di `docs/catatan-frontend.md`.

## Kartu F1 — Register + checkout otomatis
`Auth/Register.jsx` (alamat, kota, kode pos + galat) dan `Public/Checkout.jsx`: hapus tombol
"Cek Ongkir", ambil tarif otomatis 600 ms setelah kode pos 5 angka + alamat, `AbortController`,
status memuat/galat/kosong, reset kurir saat kode pos berubah, prefill dari props.

## Kartu F2 — Halaman bayar sendiri
`Public/CheckoutPay.jsx` (+ komponen kecil bila perlu): pemilih 8 kanal dari PRD §2.2, instruksi
VA/QR/bill/gerai, salin nomor, hitung mundur `expires_at`, polling 3 s + saat tab aktif kembali,
muat ulang sendiri saat status berubah, pindah ke sukses 5 s setelah lunas, panel mode uji.
Tanpa Snap.js, tanpa popup.

## Kartu F3 — Admin pesanan + ekspedisi
`Admin/Orders/Show.jsx` (panel pembayaran & pengiriman, tombol sinkron & buat resi, input resi
manual), `Admin/Orders/Index.jsx` (kolom kurir/resi, label kanal), `Admin/Shipping/Index.jsx`
(dropdown kurir → layanan dari props).

## Kartu F4 — Riwayat
`Public/History.jsx`: kartu + detail buka-tutup, resi + salin, kurir, alamat, rincian biaya,
timeline; responsif 360 px.

## Kartu F5 — Tipografi (paling akhir)
Terapkan aturan `docs/design-v1.2.md` ke halaman publik; hanya ubah class tipografi/spasi,
jangan ubah perilaku. Jalankan `npm run build` dan laporkan hasilnya.

## Aturan
Hanya `resources/js/`, `resources/css/`, `docs/`. Jangan `.env`, jangan menyalakan server.
Setiap komponen JSX baru impor `React` eksplisit bila memakai JSX klasik (lihat komponen Header).
Selesai = `npm run build` lulus + state kosong/galat/loading ditangani.

## Kapan boleh block
Hanya bila props backend tidak sesuai kontrak dan tidak bisa ditangani di frontend; tulis bukti
`path:baris` lalu block satu kalimat.

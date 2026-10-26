# Brief Frontend — v1.5

Baca: `docs/design-v1.5.md` (wajib, dibuat U1), `docs/ringkasan-v1.5.md`,
`docs/kontrak-props.md` §7.9, §7.12, §13. Jangan mengubah backend, rute, atau migrasi.

## F1 — dropdown ekspedisi di checkout (setelah U1 + B1)

`resources/js/Pages/Public/Checkout.jsx`: ganti daftar radio opsi ongkir (sekitar baris 743–810)
dengan satu `Select` native ber-`<optgroup>` per `courier_name`; teks opsi memuat label layanan,
`etd`, dan `cost`/`GRATIS`; nilai opsi = `courier_code|service_code`. Pilihan terkirim tetap
`shipping_courier`/`shipping_service`/`shipping_cost` lewat `pilihOpsi`. Pertahankan state
memuat, kosong, galat, dan aturan mode fake. Jangan mengubah bagian lain halaman.

## F2 — ikon timeline, timeline selesai, filter riwayat (setelah U1 + B3)

- Ekstrak timeline dari `History.jsx` menjadi `resources/js/Components/TimelinePesanan.jsx`
  (props sama: `timeline`), node memakai ikon sesuai `docs/design-v1.5.md`.
- `History.jsx`: pakai komponen itu; tambah filter status (Select) di atas daftar, opsi dari
  `ringkasan` + label server; perubahan filter → `router.get('/history', {status})`, halaman
  kembali ke 1, `preserveState`, `preserveScroll`; pagination membawa `status`; tampilkan keadaan
  kosong khusus filter; `filter.status` dari server jadi nilai awal.
- `CheckoutSuccess.jsx`: tambah `TimelinePesanan` memakai `pesanan.timeline`; sembunyikan bagian
  bila `timeline` tidak ada (halaman lama), jangan crash.

## Output

- `resources/js/Pages/Public/Checkout.jsx`, `History.jsx`, `CheckoutSuccess.jsx`,
  `resources/js/Components/TimelinePesanan.jsx`; catatan `docs/catatan-frontend.md`.

## Definition of Done

- `npm run build` lulus (wajib; sebut di kartu).
- Tidak ada dependency baru; memakai komponen/token yang ada.
- `timeline`/`filter`/`ringkasan` null atau kosong tidak merusak halaman.
- Mobile 360 px tidak terpotong (cek manual; bila butuh browser tulis "belum diuji, butuh browser").
- Grep bersih: tidak ada sisa daftar radio ongkir di `Checkout.jsx`.

## Kapan boleh block

Hanya bila props backend tidak sesuai kontrak dan tidak bisa ditangani tanpa mengubah backend.
Butuh browser bukan alasan block: tulis "belum diuji, butuh browser" di catatan.

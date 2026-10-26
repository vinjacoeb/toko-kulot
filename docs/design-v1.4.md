# Design v1.4 — timeline selesai & riwayat pengiriman

Addendum `docs/design-v1.3.md`; bagian lain tidak berubah. Token, tipografi, jarak, dan komponen
memakai yang sudah ada (`card`, `text-body`, `border-line`, `bg-brand`, `bg-danger`, `Timeline`).

## 1. Riwayat pembeli — timeline utama

- Node menjadi empat: **Dibuat → Dibayar → Dikirim → Selesai**.
- Warna node sama seperti sekarang: aktif `bg-brand`, belum `bg-slate-300`, batal/kedaluwarsa
  `bg-danger` (menggantikan node yang belum tercapai, seperti v1.3).
- Label waktu node Selesai memakai `timeline.completed_at`; bila kosong node tidak aktif.
- Horizontal ≥768 px, vertikal <768 px — tidak berubah.

## 2. Riwayat pembeli — daftar "Riwayat pengiriman"

- Diletakkan di kartu Timeline, **di bawah** timeline utama, dipisah `border-t border-line` dan
  jarak `mt-4 pt-4`.
- Judul kecil `Riwayat pengiriman` (text-body font-medium); tidak ada deskripsi tambahan.
- Urutan **terbaru di atas**, maksimal 10 entri. Setiap baris: titik 8 px (entri pertama
  `bg-brand`, sisanya `bg-slate-300`), label status (text-body text-ink), waktu
  `d M Y, HH.mm` (text-sm text-slate-600) memakai helper `waktu()` yang sudah ada.
- Tidak ada tombol, tautan, atau aksi. Tidak ada bagian ini bila `shipping.events` kosong.
- Mobile 360 px: satu kolom, waktu di baris kedua; tidak memotong teks label.

## 3. Halaman selesai bayar

- Setelah kartu pengiriman yang ada, daftar event yang sama (maks 10, terbaru di atas) dengan
  gaya §2, hanya bila `shipping.events` tidak kosong. Tanpa timeline utama baru.

## 4. Admin

- Kartu "Ubah status" beserta tombol dan modal **dihapus** dari `/admin/pesanan/{order}`.
  Kartu lain (ringkasan, item, pembayaran, pengiriman, pelanggan, timeline) tetap pada tempatnya.
- Tidak ada pengganti tombol; status hanya ditampilkan lewat `StatusBadge` yang sudah ada.

## 5. Aksesibilitas

- Daftar event memakai `<ol>`; titik diberi `aria-hidden="true"`; teks status + waktu menjadi isi
  baris. Kontras mengikuti token yang ada (tidak ada warna baru).

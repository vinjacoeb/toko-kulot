# Brief Frontend — v1.4

Baca: `docs/PRD-v1.4.md` §3–§4, `docs/design-v1.4.md`, `docs/kontrak-props.md` §12.17 dan §13,
`docs/PRD-v1.3.md` §3. Jangan mengubah backend, rute, atau migrasi.

## Yang dikerjakan (dua kartu terpisah)

1. **F2 — hapus UI ubah status** (setelah B3). Di `resources/js/Pages/Admin/Orders/Show.jsx`
   hapus kartu "Ubah status", state modal, import `UbahStatusModal`, pemakaian `status_berikut`;
   hapus `resources/js/Pages/Admin/Orders/partials/UbahStatusModal.jsx` bila tidak dipakai lagi.
   `StatusBadge` tetap tampil. Jangan sentuh file publik.
2. **F1 — timeline & riwayat pengiriman** (setelah B2). `resources/js/Pages/Public/History.jsx`:
   node Selesai dari `timeline.completed_at`, daftar "Riwayat pengiriman" dari
   `shipping.events` (maks 10, terbaru di atas, tanpa bagian bila kosong).
   `resources/js/Pages/Public/CheckoutSuccess.jsx`: daftar event yang sama. Jangan sentuh admin.

## Output

- `resources/js/Pages/Admin/Orders/Show.jsx`, `.../partials/UbahStatusModal.jsx` (hapus),
  `resources/js/Pages/Public/History.jsx`, `resources/js/Pages/Public/CheckoutSuccess.jsx`.
- Catatan: `docs/catatan-frontend.md`.

## Definition of Done

- `npm run build` lulus (wajib; sebut di kartu).
- Tidak ada referensi `status_berikut`/`UbahStatusModal` tersisa (grep bersih).
- Data kosong/null tidak merusak halaman: `events` kosong → tidak ada bagian; `completed_at`
  null → node belum aktif.
- Mobile 360 px: tidak ada teks terpotong (cek manual; bila butuh browser tulis
  "belum diuji, butuh browser").
- Memakai komponen/token yang ada; tidak menambah dependency.

## Kapan boleh block

Hanya bila props backend tidak sesuai kontrak dan tidak bisa ditangani tanpa mengubah backend.
Jangan block karena butuh browser: tulis "belum diuji, butuh browser" di catatan.

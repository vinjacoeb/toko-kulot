# Keputusan techlead — F4 `/admin/stok`: empat permintaan di luar kontrak

- Kartu keputusan: `t_a24a79d0` (techlead) · induk: `t_321bf03c` (F4, frontenddeveloper) · 21 Okt 2026
- Sumber permintaan: `docs/catatan-frontend.md` bagian `t_321bf03c` (baris 537) + `docs/bukti-frontend-t_321bf03c.txt`
- Metode: baca-saja berkas repo (tanpa server, tanpa database pemilik, tanpa `.env`). Semua bukti `path:baris`.

## 1. Ringkasan keputusan

**Keempat permintaan TIDAK dibangun sekarang. Tidak ada perubahan kontrak, desain, backend, maupun kode F4.**
Halaman `/admin/stok` dan `/admin/stok/riwayat` sudah memenuhi dokumen acuan; rujukan yang berlaku adalah
**PRD baris 255**, **kontrak §12.12–§12.15**, dan **pola baku tabel design §5.12**.

| # | Permintaan | Keputusan | Dasar utama |
|---|---|---|---|
| 1 | Kolom "nilai minimum" stok | Tidak dibangun | PRD baris 255 + kontrak §12.12 (baris 1290-1298) menutup daftar kolom; ambang kritis = **angka global 5** |
| 2 | Aksi "set stok" absolut | Tanpa rute baru; modal penjelas + tautan form produk **dipertahankan** | `routes/admin.php:122-130`; kontrak §12.6 baris 1236 (`adjust`) |
| 3 | "Stok sebelum → sesudah" | Tidak dibangun | `database/migrations/2026_10_20_000007_create_stock_movements_table.php:14-29`; kontrak §12.15 baris 1322-1333 |
| 4 | Filter tanggal riwayat | Tidak dibangun | Kontrak §12.15 baris 1317 (`q, tipe, varian, page`); bandingkan §12.16 baris 1340 (pesanan **punya** `dari`/`sampai`) |

## 2. Alasan per butir (bukti)

### 2.1 Kolom "nilai minimum" — tidak dibangun
- PRD baris 255 (`docs/PRD.md:255`) menetapkan isi `/admin/stok`: "Tabel per varian: produk, varian, stok,
  status. Filter 'stok kritis'"; kolom "nilai minimum" tidak ada di daftar itu.
- Kontrak §12.12 (`docs/kontrak-props.md:1282-1303`) menutup bentuk baris: `id`, `product{id,name,slug}`,
  `size`, `color`, `label`, `sku`, `stock`, `is_active`, `status`, `updated_at`. Tidak ada field minimum.
- Ambang kritis ditulis sebagai **angka global**, bukan atribut per varian: `docs/PRD.md:252` ("stok kritis
  (< 5)") dan `docs/kontrak-props.md:1302` ("`habis` (0), `kritis` (1–4), `aman` (≥ 5)").
- Skema varian juga tidak punya kolom pembatas: `database/migrations/2026_10_20_000006_create_product_variants_table.php:15-25`
  = `product_id, size, color, sku, price_delta, stock, is_active`.
- Pencarian teks di seluruh kontrak: `grep "min_stock|nilai minimum|stok minimum" docs/kontrak-props.md` → **0 hasil**.
- Kesimpulan: kolom per-varian adalah **fitur baru** (model data + aturan bisnis + UI). Rujukan kartu
  ("nilai minimum") berasal dari kartu F4 yang ditulis techlead, bukan dari PRD/kontrak → yang menyesuaikan: dokumen/kartu, bukan kode.

### 2.2 Aksi "set stok" absolut — rute baru tidak perlu; modal penjelas tetap
- Rute stok memang hanya masuk/keluar: `routes/admin.php:122-130` (`stocks.index`, `stocks.history`,
  `stocks.in`, `stocks.out`) — tidak ada `stocks.set`.
- Namun jalur **stok absolut sudah ada dan berjejak audit**: form produk `GET /admin/produk/{product}/ubah`
  (`routes/admin.php:101`) dan kontrak §12.6 baris 1236: "Perubahan `stock` varian lewat form dicatat sebagai
  `stock_movements` tipe `adjust` (selisih)."
- Frontend sudah tidak mengarang rute: modal "Setel stok" menjelaskan jalur itu dan menautkannya —
  `resources/js/Pages/Admin/Stocks/Index.jsx:464-488` (judul "Setel stok", teks "Setel stok ke angka tertentu
  dilakukan dari form produk…", tombol `Buka form produk` → `/admin/produk/{id}/ubah`, fallback `/admin/produk`).
- Kesimpulan: perilaku sekarang **benar dan cukup**; menambah `POST /admin/stok/{variant}/setel` berarti rute
  baru → PRD §5.2 (`docs/PRD.md:139-173`, daftar tetap) harus berubah lebih dulu.

### 2.3 "Stok sebelum → sesudah" — tidak dibangun
- Tabel audit tidak menyimpan angka sebelum/sesudah: `database/migrations/2026_10_20_000007_create_stock_movements_table.php:14-29`
  = `product_variant_id, type, qty, note, admin_id, timestamps`.
- Kontrak §12.15 baris 1322-1325 hanya mengirim `qty`, dan baris 1333 mendefinisikan `signed_qty` (bertanda) —
  itulah yang tampil di kolom angka riwayat.
- Kesimpulan: menampilkan "sebelum → sesudah" menuntut **kolom baru + migrasi + kontrak + kartu backend/QA**;
  data lama tidak bisa diisi ulang (nilai sebelum/sesudah historis tidak dapat direkonstruksi dengan andal).

### 2.4 Filter tanggal riwayat — tidak dibangun
- Kontrak §12.15 baris 1317: query hanya `q`, `tipe`, `varian`, `page`.
- Bandingkan §12.16 baris 1340 (`docs/kontrak-props.md:1340`): pesanan **punya** `dari` dan `sampai`, dan PRD
  baris 256 memang memberi `/admin/pesanan` "Filter status + **rentang tanggal**". Untuk stok tidak diminta.
- Kesimpulan: ketiadaan filter tanggal **konsisten dan disengaja**, bukan kelalaian; menambahkannya = perubahan
  kontrak + backend + UI.

## 3. Yang tidak berubah (konsekuensi)

- **Kode F4 tidak direvisi**: `Index.jsx`, `History.jsx`, `StokAksiModal.jsx` tetap seperti diverifikasi kartu
  `t_321bf03c` (39 uji harness lulus, `npm run build` exit 0).
- **Tidak ada kartu backend/QA/frontend baru** untuk keempat butir ini.
- **QA `t_3a240a11`**: uji terhadap kontrak §12.12–§12.15 + PRD baris 255 + design §5.12. Empat hal di atas
  **bukan cacat** — jangan dijadikan temuan.
- **Dokumen acuan tidak diubah**: PRD, kontrak, dan `docs/design.md` tetap. `docs/design.md` tidak perlu baris
  drift baru karena design **tidak pernah menggambar** keempat elemen itu: §5.12 baris 684 mendelegasikan isi
  `/admin/stok` & `/admin/stok/riwayat` ke "PRD §9"; pencarian "nilai minimum|Setel|sesudah|rentang tanggal"
  di `docs/design.md` hanya menemukan 2 baris: `docs/design.md:630` (kartu penilaian, kata "sesudah", bukan stok)
  dan `docs/design.md:684` (baris delegasi itu sendiri).
- Bila pemilik ingin salah satunya: usulan + syarat perubahan ada di `docs/usulan.md`; ringkasan keputusan
  pemilik-facing ada di `docs/pertanyaan-pemilik.md` §4 (T4).

## 4. Temuan di luar lingkup kartu ini

1. **Rujukan kartu F4 salah alamat** ("design.md §5.8"): §5.8 adalah `/checkout/{order}/bayar` & `/selesai`.
   Rujukan benar: design §5.10 (shell admin) + PRD baris 255 + pola §5.12. Dikoreksi di kartu-kartu berikutnya;
   dokumen acuan tidak salah.
2. **Superset kontrak kecil** (`varianOptions()` mengirim `sku` di daftar varian filter §12.15): tidak merusak
   frontend (dipakai sebagai label tambahan). Saat §12 keluar dari status DRAFT, backend merapikan contoh §12.15
   (aturan yang sudah berlaku: kontrak menyesuaikan controller, bukan sebaliknya — `docs/review.md` §4 poin 3).
3. **Belum dicek (butuh browser/sesi admin)**: perilaku nyata modal "Setel stok" dan aksi stok end-to-end
   (POST masuk/keluar) belum diuji techlead; kredensial admin dipegang pemilik. Status: "belum diuji, butuh browser".
   Rencana uji pemilik ada di `docs/bukti-frontend-t_321bf03c.txt` bagian 9.

## 5. Rujukan

- Kartu: `t_321bf03c` (F4), `t_a24a79d0` (keputusan ini), QA `t_3a240a11`.
- Dokumen: `docs/PRD.md:252,255,256`; `docs/kontrak-props.md:1282-1334`; `routes/admin.php:122-130`; `docs/design.md:680-690`.
- Papan: `docs/pertanyaan-pemilik.md` §4 T4; `docs/catatan-techlead.md` (bagian keputusan ini); `docs/usulan.md`;
  `docs/review.md` §7.

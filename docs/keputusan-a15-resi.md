# Keputusan Techlead — Nomor resi manual (PRD A15) — kartu `t_394b40ba`, 21 Okt 2026

Titik awal: kartu F5 `t_018b2723` melaporkan satu DoD yang tidak bisa dipenuhi — "nomor resi
bisa disimpan" (PRD A15) — karena `orders` tidak punya kolom resi, tidak ada rute simpan, dan
kontrak §12.17 tidak punya field resi. Techlead tidak membangun kode; kartu ini memutuskan
dokumen, lalu memecah pekerjaan ke backend/frontend/QA.

## 1. Keputusan

**Dibangun** (A15 adalah permintaan PRD, bukan fitur baru dari kartu):

| Hal | Nilai yang dibekukan |
|---|---|
| Kolom | `orders.tracking_number` string(60), `null` = belum diisi |
| Migrasi | `database/migrations/2026_10_21_000019_add_tracking_number_to_orders_table.php` |
| Model | `tracking_number` masuk `Order::$fillable` (tidak di-cast, tidak ada aksesori) |
| Rute | `PATCH /admin/pesanan/{order}/resi` — name `admin.orders.resi`, middleware `throttle:admin-write`, di blok Pesanan setelah `orders.status` (`routes/admin.php:137`) |
| Validasi | `app/Http/Requests/Admin/UpdateOrderTrackingRequest.php`: `tracking_number` = `nullable`, `string`, `max:60`; `''` → `null` (menghapus) |
| Controller | `Admin\OrderController@resi` → hanya `tracking_number` yang diubah; `back()->with('success', 'Nomor resi pesanan diperbarui.')` |
| Props | kontrak §12.17 `pesanan.tracking_number` (string atau `null`); perilaku rute di §12.18a |
| Teks UI (bebas karangan) | label `Nomor resi`; bantuan `Isi nomor resi dari ekspedisi setelah paket dikirim. Kosongkan untuk menghapus.`; baris status `Belum ada nomor resi.` / `Tersimpan: <nomor>`; tombol `Simpan resi`; galat dari server apa adanya |

**Tidak dibangun sekarang** (pindah ke `docs/usulan.md` U5): resi tampil di halaman pembeli,
tautan lacak kurir, integrasi API ekspedisi, riwayat perubahan resi. Semuanya menuntut
perubahan PRD §5.1/§6 lebih dulu.

## 2. Mengapa PRD §5.2/§6 tidak saya ubah

- A15 (`docs/PRD.md:391`) sudah memuat fiturnya: "Tidak ada integrasi kurir; nomor resi diisi
  manual di detail pesanan". Rute + kolom adalah **cara teknis**, bukan fitur di luar dokumen
  acuan (aturan kerja 10). T4 (stok) berbeda: keempat butirnya tidak ada di PRD sama sekali.
- `docs/PRD.md` adalah dokumen pemilik; amendemennya milik pemilik. Menambah baris di §5.2
  (baris 139-173) atau §6 (baris 189-190) akan **menggeser nomor baris** seluruh PRD, sedangkan
  banyak dokumen merujuk baris persis (`docs/PRD.md:255`, `:377`, `:391`, `:219`). Pergeseran itu
  merusak bukti kartu lain tanpa manfaat.
- Karena itu: baris rute + kolom ditaruh di kontrak §12.18a + `docs/db.md`, dan amendemen PRD
  diminta lewat `docs/pertanyaan-pemilik.md` §3 Q8 (tidak memblokir, PRD R7/R10).
- Aturan yang dipakai untuk memutuskan: urutan pemutus konflik T2 (addendum → PRD → kontrak →
  kode) — di sini tidak ada konflik, hanya dokumen turunan yang dilengkapi.

## 3. Siapa menyesuaikan apa

| Pihak | Berkas | Alasan |
|---|---|---|
| Techlead (kartu ini) | `docs/kontrak-props.md` §12.17/§12.18a/§12.23, `docs/db.md`, `docs/asumsi.md`, `docs/pertanyaan-pemilik.md`, `docs/traceability.md`, `docs/usulan.md`, `docs/catatan-techlead.md` | Membekukan kontrak sebelum pekerjaan paralel |
| Backend | migrasi + `Order` + route + `UpdateOrderTrackingRequest` + `OrderController@resi` + test | Pemilik kolom, rute, dan pesan flash |
| UIUX | `docs/design.md` §11.3 (drift D12) + catatan di §5.12 | design.md adalah acuan tampilan; isian resi belum digambar |
| Frontend | `resources/js/Pages/Admin/Orders/partials/InfoResi.jsx`, `resources/js/Pages/Admin/Orders/Show.jsx` | Mengaktifkan isian + menghapus notice lama |
| QA | `docs/laporan-qa.md` | Menguji §12.18a terhadap kode nyata |

Urutan wajib: backend **dan** uiux selesai sebelum frontend (rute + bentuk tampilan sudah tetap);
QA setelah frontend. Tidak ada dua kartu yang menulis berkas yang sama secara paralel.

## 4. Yang belum dicek

- Tekan "Simpan resi" di browser dengan sesi admin nyata (PATCH end-to-end, toast, galat 422):
  **belum dicek, butuh browser + kredensial pemilik**. Dijadwalkan ke kartu QA lanjutan.
- Migrasi belum dijalankan; nomor baris `routes/admin.php:137` dan `docs/kontrak-props.md:1389`
  adalah keadaan 21 Okt 2026 dan bisa bergeser setelah kartu lain menulis berkas itu.

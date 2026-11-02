# Desain v1.7 — ceklis ekspedisi ringkas, filter laporan langsung

Kartu `t_f3049422` (techlead) · 2 Nov 2026. Mengikat frontend `brief-v1.7-frontend.md`.
**Menggantikan** dua aturan `docs/design-v1.6.md`:
- §1 (isi ceklis = semua layanan dari `semua[]`) → §1 di sini.
- Tidak ada perubahan lain: token, warna, ukuran, ikon, komponen tetap seperti `design.md` dan
  `design-v1.6.md` §0.

## 1. Ceklis ekspedisi — hanya layanan tersedia

- Sumber daftar: `opsi[]` (layanan yang punya tarif) selama `statusTarif === 'siap'`. `semua[]`
  tidak dirender lagi; ia tetap dipakai cache supaya cek ulang kode pos tidak memanggil API.
- Baris tanpa tarif (`tersedia !== true`) **tidak ditampilkan sama sekali** — tidak ada kartu
  disabled, tidak ada teks "Tidak tersedia di area anda" di daftar.
- Keadaan lain tidak berubah dan tetap memakai `InlineNotice` yang sudah ada:
  `memuat` → skeleton/teks memuat; `kosong` → "Tidak ada layanan untuk kode pos ini."; `galat`
  dan `timeout` → notice + tombol "Coba lagi"; `menunggu` → belum ada daftar.
- Bila `statusTarif === 'siap'` tetapi daftar kosong, tampilkan notice `kosong` (bukan fieldset
  kosong). Tidak ada teks baru di luar copy beku v1.6 §1.4.
- Pengelompokan per `courier_name` dan urutan server dipertahankan; kartu tetap radio 2 kolom di
  `sm` ke atas dan 1 kolom di mobile.

## 2. Filter periode Laporan — langsung diterapkan

- `Select` periode: perubahan nilai langsung memanggil `router.get('/admin/laporan', { periode })`
  dengan `preserveScroll` dan `replace`. Tombol "Terapkan" tetap ada hanya untuk periode `kustom`
  (butuh dua tanggal) dan tetap berlabel "Terapkan".
- Saat `periode === 'kustom'`, tanggal `dari`/`sampai` wajib terisi sebelum tombol aktif; selama
  belum lengkap, tombol unduh nonaktif (perilaku v1.6 dipertahankan).
- Setelah respons, kontrol harus menampilkan **nilai yang dipakai server** (`filter.periode`,
  `filter.dari`, `filter.sampai`), termasuk saat server menormalkan periode tak sah ke `bulan-ini`.
- Rentang aktif tetap tampil di deskripsi `PageHeader` (copy v1.6 dipertahankan). Tidak ada badge,
  ikon, atau teks baru.
- Keadaan memuat: `Select` dan tombol dinonaktifkan selama permintaan berjalan (perilaku sekarang).

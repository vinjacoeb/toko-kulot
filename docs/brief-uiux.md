# Brief — uiux

Kartu: **K3** (`docs/design.md`: hasil REA erigostore + design token + inventaris komponen).

## Wajib dibaca

- `docs/PRD.md` §10 (desain & slicing: isi wajib design.md, aturan konflik, aturan aset), §11 (responsif, aksesibilitas, performa), §5 (daftar rute & halaman yang harus punya layout), §9 (halaman admin), §12 (R6, R7).
- `docs/design.md` yang sudah ada — dibaca utuh sebelum mengubah.
- `docs/ringkasan-tim.md` §4 dan §5.

## Kondisi awal (terverifikasi techlead, 20 Okt 2026)

`docs/design.md` **sudah ada** (433 baris, 9 bagian: karakter visual, design token warna/tipografi/spacing/breakpoint, layout global header-footer-seksi landing, inventaris 10 komponen + state, layout 13 halaman termasuk admin, motion, aturan implementasi, selisih dengan sumber, checklist kesesuaian). Jadi K3 bukan menulis dari nol.

## Yang dikerjakan

1. Audit `docs/design.md` terhadap PRD §10: pastikan ada token lengkap, struktur layout tiap halaman PRD §5 + §9, inventaris komponen dengan state (default/hover/active/disabled/loading/error/empty), grid responsif (360–639 / 640–1023 / 1024+), dan catatan animasi.
2. Lengkapi yang kurang. Titik yang paling mungkin bolong: state `loading`/`empty`/`error` per halaman, spesifikasi tabel & filter admin (PRD §9 "server-side pagination, pencarian, konfirmasi modal"), dan penamaan token yang harus masuk `tailwind.config.js`.
3. Bila melakukan capture/inspeksi baru, simpan buktinya di `docs/design-catatan-rea.md` (URL, tanggal, apa yang diukur) — jangan menyalin aset, gambar, atau kode sumber pihak lain (PRD §10, design.md §1).
4. Catat selisih tampilan yang membentur fungsi PRD di `docs/pertanyaan-pemilik.md` (bukan di design.md), lalu lanjut (R7).

**Output:** `docs/design.md` (diperbarui), opsional `docs/design-catatan-rea.md`.
**DoD K3:** setiap halaman di PRD §5 + §9 punya spesifikasi layout; setiap komponen punya state; checklist `design.md` §9 bisa dipakai QA sebagai daftar uji; tidak ada aset/kode pihak ketiga yang disalin; tidak ada kode aplikasi yang ditulis.

## Boleh `kanban_block` hanya bila

Sumber REA tidak bisa diakses **dan** pemilik harus memilih arah visual yang mengubah identitas brand. Selain itu pakai `design.md` yang ada sebagai dasar dan lanjut.

## Dilarang

Mengubah kode/JSX/CSS aplikasi (hanya `docs/`), mengubah `docs/PRD.md`, menambah halaman atau fitur di luar PRD §5 (usulan baru → `docs/usulan.md`).

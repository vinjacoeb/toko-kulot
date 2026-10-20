# Ringkasan Tim — Toko Kulot

Diperbarui 20 Oktober 2026 oleh techlead (K1). Dokumen ini ringkasan; yang mengikat tetap `docs/PRD.md` (fungsi) dan `docs/design.md` (tampilan). Bila keduanya bertentangan: PRD menang untuk fungsi, design menang untuk tampilan, selisihnya dicatat di `docs/pertanyaan-pemilik.md` (PRD R7).

## 1. Yang dibangun

Toko online daster & kulot milik sendiri: katalog + filter, detail produk (varian ukuran/warna, harga eceran & grosir, stok), keranjang, checkout **QRIS saja** via Midtrans, ulasan bintang 1–5, dan panel admin yang bisa mengubah katalog, stok, pesanan, pesan, penilaian, serta seluruh konten situs tanpa deploy ulang (PRD §1, §9).

Metrik yang dinilai di akhir (PRD §2): konversi iklan ≥ 1,5% (G1), LCP ≤ 2,5 s (G2), SEO 100% halaman publik (G3), ≥ 60% pesanan berulasan bintang ≥ 4 (G4), admin bisa tambah produk + stok sendiri (G5).

## 2. Cakupan

- **Masuk:** seluruh rute PRD §5.1 dan §5.2, skema PRD §6, alur PRD §7, integrasi PRD §8, halaman admin PRD §9.
- **Ditunda (backlog, bukan blocker):** kupon/diskon, integrasi kurir & resi otomatis, multi-bahasa, retur/refund otomatis, blog, loyalty (PRD §14 A8, A14, A15, A16; §16).

## 3. Peran & kartu

| Peran | Kartu | Brief |
|---|---|---|
| devops | K2, K16, + kartu kebersihan repo | `docs/brief-devops.md` |
| uiux | K3 | `docs/brief-uiux.md` |
| backenddeveloper | K4, K5, K6, K7, K8, K9 | `docs/brief-backend.md` |
| frontenddeveloper | K10, K11, K12, K13, K14 | `docs/brief-frontend.md` |
| qatesting | K15 | `docs/brief-qa.md` |
| techlead | K1, kartu gerbang pemilik, verifikasi | dokumen ini |

Graf kartu lengkap: PRD §13. Peta fitur → kartu: `docs/traceability.md`.

## 4. Urutan kerja (PRD R6)

1. **Fondasi + desain** — K2 (devops) dan K3 (uiux) paralel setelah gerbang 1.
2. **Data & auth** — K4, lalu K5 dan K6.
3. **Backend fitur** — K7 → K8 → K9.
4. **Frontend** — K10 → K11 → K12; K13 → K14 (menunggu backend K7–K9 siap).
5. **QA & rilis** — K15 → K16.

Dilarang mengerjakan halaman frontend sebelum bagian `design.md` yang relevan selesai (R6).

## 5. Aturan kerja yang paling sering dilanggar (rujuk PRD §12)

- **R1** hanya kartu yang di-assign ke kamu; dilarang "sekalian" mengerjakan kartu lain.
- **R2** satu workspace: `dir C:/Users/LENOVO/Downloads/toko-kulot`. Tidak ada clone/worktree lain.
- **R3** `.env` milik pemilik — jangan buat, ubah, hapus, salin, atau commit. Yang di-commit hanya `.env.example`.
- **R4** tidak ada folder skill/MCP/agent (`.agent/`, `.claude/`, `.cursor/`, dst.) di dalam project.
- **R5** techlead hanya membaca/menulis `docs/` + kartu; tanpa kode, tanpa composer/npm/artisan, `skills=[]`.
- **R8** satu kartu satu commit, pesan diawali ID kartu.
- **R9** kartu selesai = DoD terpenuhi **dan** bukti perintah (`migrate:fresh --seed`, `npm run build`, `php artisan test`).
- **R11** tidak menyalakan server permanen; verifikasi lewat build + test.
- **R12** UI & teks toko: Indonesia. Kode, nama route, commit: Inggris.

## 6. Bukti & pelaporan

Setiap kartu selesai menyertakan perintah + keluaran ringkas di `kanban_complete`. Klaim tanpa bukti dianggap belum selesai (R9). QA menulis temuan dengan bukti `path:baris`; yang butuh browser ditulis "belum diuji, butuh browser". Satu masalah satu kartu perbaikan, maksimal 2 putaran.

## 7. Titik berhenti pemilik (PRD R15)

Hanya dua titik tunggu yang diizinkan: **setelah K1** dan **setelah K3**. Diwujudkan sebagai kartu gerbang ber-assignee techlead yang memblokir sampai pemilik membalas "sudah" lalu Unblock. Semua ambiguitas lain **tidak** boleh memblokir: catat di `docs/pertanyaan-pemilik.md`, ambil asumsi paling masuk akal, lanjut.

## 8. Berkas acuan di `docs/`

`PRD.md`, `design.md`, `ringkasan-tim.md`, `brief-*.md` (5 peran), `traceability.md`, `pertanyaan-pemilik.md`, `catatan-techlead.md`.

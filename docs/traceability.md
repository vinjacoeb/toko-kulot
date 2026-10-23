# Traceability — Fitur → Kartu

Diperbarui 20 Okt 2026 oleh techlead (K1). Semua kartu terverifikasi: `workspace_kind='dir'`, `workspace_path='C:/Users/LENOVO/Downloads/toko-kulot'`, `skills` kosong, assignee persis salah satu profil board.

## 1. Peta kartu (PRD §13)

| ID | Task ID | Assignee | Parents | Judul |
|---|---|---|---|---|
| K1 | `t_ecd07ae5` | techlead | — | Pelajari PRD + design, ringkasan tim & brief per peran |
| K2 | `t_4f753735` | devops | K1 (+gerbang 1) | Fondasi proyek: Laravel 11 + Inertia + React + MySQL + `.env.example` |
| K3 | `t_be9df826` | uiux | K1 (+gerbang 1) | `docs/design.md` hasil REA + token + inventaris komponen |
| K4 | `t_a785093e` | backenddeveloper | K2 | Migrasi & model seluruh domain |
| K5 | `t_ec877062` | backenddeveloper | K4 | Seeder lengkap semua domain |
| K6 | `t_f0708cd1` | backenddeveloper | K4 | Autentikasi dua tier (guard `web` + `admin`) |
| K7 | `t_12a19591` | backenddeveloper | K5 | Katalog publik: filter, sort, pagination, detail, kontak |
| K8 | `t_e3752060` | backenddeveloper | K7 | Keranjang, checkout, Midtrans QRIS, webhook, halaman bayar |
| K9 | `t_a7f18638` | backenddeveloper | K8 | Ulasan, pesan masuk + balasan, CRUD pengaturan/carousel/FAQ |
| K10 | `t_3ce04d50` | frontenddeveloper | K3 (+gerbang 2) | Layout publik + landing page |
| K11 | `t_6f70cbe7` | frontenddeveloper | K10, K7 | Halaman `/produk`, `/produk/{slug}`, `/kontak-kami` |
| K12 | `t_f4e537df` | frontenddeveloper | K11, K8 | Halaman auth, keranjang, checkout QRIS, sukses + rating |
| K13 | `t_bae93e32` | frontenddeveloper | K10 | Layout admin + dashboard monitoring |
| K14 | `t_3eef7749` | frontenddeveloper | K13, K9 | Halaman admin: produk, kategori, stok, pesanan, pesan, penilaian, pengaturan, akun |
| K15 | `t_a3c308d2` | qatesting | K12, K14 | Unit + feature test, QA iterasi bug, laporan |
| K16 | `t_56a2d29c` | devops | K15 | Build produksi, verifikasi E2E, dokumentasi deploy |

Kartu tambahan di luar PRD §13 (dibuat techlead saat K1):

| ID | Task ID | Assignee | Parents | Judul |
|---|---|---|---|---|
| Gerbang 1 | `t_7c685183` | techlead | K1 | Titik berhenti pemilik (PRD R15) sebelum K2/K3 — blocked |
| Gerbang 2 | `t_e16ab638` | techlead | K3 | Titik berhenti pemilik sebelum slicing frontend (K10) — blocked |
| Kebersihan | `t_e0ab9215` | devops | K2 | Hapus folder agent/skill dari git + commit (PRD R4) |

## 2. Tujuan bisnis → kartu

| Tujuan (PRD §2) | Fitur penentu | Kartu |
|---|---|---|
| G1 Konversi iklan ≥ 1,5% | Landing, detail produk, checkout singkat | K10, K11, K12, K8 |
| G2 LCP ≤ 2,5 s | Token + gambar lazy + build ter-split | K2, K10, K16 |
| G3 SEO 100% | Title/meta dinamis, canonical, sitemap, robots, JSON-LD | K7, K11, K16 |
| G4 Rasio ulasan bintang ≥ 4 | Form rating pasca checkout, moderasi admin | K9, K12, K14 |
| G5 Admin mandiri | CRUD produk/stok/pengaturan | K14, K9, K5 |

## 3. Rute PRD §5 → kartu

| Kelompok rute | Kartu backend | Kartu frontend |
|---|---|---|
| `home`, `products.index/show`, `contact`, `contact.store` | K7 | K10, K11 |
| `cart.*`, `checkout.*`, `midtrans.notification` | K8 | K12 |
| `login`, `register`, `password.*`, `logout` | K6 | K12 |
| `checkout.review` (ulasan) | K9 | K12 |
| `admin.login*`, `admin.logout` | K6 | K12 (halaman login admin: K13) |
| `admin.dashboard` | K7/K9 (agregat) | K13 |
| `admin.products.*`, `admin.categories.*`, `admin.stocks.*` | K4, K7 | K14 |
| `admin.orders.*`, `admin.messages.*`, `admin.reviews.*` | K8, K9 | K14 |
| `admin.settings.*`, `admin.carousels.*`, `admin.faqs.*`, `admin.accounts.*` | K9, K6 | K14 |

## 4. Skema data PRD §6 → kartu

Semua tabel & kolom PRD §6 dibuat di **K4** (migrasi + model), diisi di **K5** (seeder), dipakai di **K7–K9** (controller/service), ditampilkan di **K11–K14**.

## 5. Aturan kerja PRD §12 → pengawas

| Aturan | Diperiksa oleh |
|---|---|
| R1 batas peran, R2 workspace | techlead (setiap verifikasi kartu) |
| R3 `.env`, R4 folder skill/agent | devops K2 + qatesting K15 |
| R5 techlead hanya docs/ | techlead (diri sendiri) |
| R6 urutan kerja | graf kartu + gerbang pemilik |
| R8 satu kartu satu commit | techlead saat review commit |
| R9 bukti perintah | setiap `kanban_complete` |
| R11 tanpa server liar | devops, qatesting |
| R14 kualitas frontend | frontenddeveloper + qatesting K15 |
| R15 titik berhenti pemilik | kartu gerbang 1 & 2 |

## 6. DoD global PRD §15 → bukti

| Poin DoD | Bukti yang harus dilampirkan | Kartu |
|---|---|---|
| 1 `migrate:fresh --seed` bersih | keluaran perintah | K5, K16 |
| 2 `npm run build` sukses | keluaran perintah | K2, K10–K14, K16 |
| 3 semua nama rute ada | `php artisan route:list` | K6, K7, K8, K9, K16 |
| 4 `.env` tidak berubah, `.env.example` lengkap | `git status`, isi `.env.example` | K2, K16 |
| 5 tanpa folder skill/MCP | `ls -a` root | K2, K15 |
| 6 responsif 360/768/1280 | checklist `design.md` §9 | K15 |
| 7 alur ujung ke ujung | skenario E2E | K16 |
| 8 admin bisa kelola semua | skenario admin | K14, K15 |
| 9 `php artisan test` hijau | keluaran perintah | K15 |
| 10 tanpa `console.log`/`dd()`/Lorem | `grep` | K15 |

## 7. Perbaikan laporan pemilik 21 Okt 2026 → kartu (kartu induk `t_15531332`)

Bukti & akar masalah: `docs/review.md`. Kartu diverifikasi workspace + assignee di papan.

| Butir laporan pemilik | Kartu | Assignee | Parent |
|---|---|---|---|
| 1 Badge keranjang tidak menampilkan jumlah item | `t_7ebfca05` | frontenddeveloper | `t_15531332` |
| 2 QRIS tidak bisa ditransfer — mode uji & tagihan fake lama | `t_9f4b6aee` (backend), `t_e60e7733` (frontend) | backenddeveloper, frontenddeveloper | `t_15531332`; `t_9f4b6aee` + `t_2de36f29` |
| 3 Masa berlaku QRIS 5 menit | `t_e35050e8` | backenddeveloper | `t_9f4b6aee` |
| 4 Admin produk/stok/pesanan: CRUD, search, pagination, filter, gambar | `t_5988a39e` (produk), `t_321bf03c` (stok), `t_018b2723` (pesanan) | frontenddeveloper | `t_7ebfca05`; `t_5988a39e`; `t_321bf03c` |
| 5 (chat) penilaian setelah checkout | `t_2de36f29` | frontenddeveloper | `t_018b2723` |
| Deviasi tampilan dicatat di design.md | `t_99424f19` | uiux | `t_15531332` |
| Verifikasi ulang seluruh butir | `t_3a240a11` | qatesting | `t_9f4b6aee`, `t_e35050e8`, `t_7ebfca05`, `t_5988a39e`, `t_321bf03c`, `t_018b2723`, `t_2de36f29`, `t_e60e7733`, `t_99424f19` |
| Bekukan build rilis + checklist Midtrans nyata | `t_e83922f2` | devops | `t_3a240a11` |

## 8. Lanjutan F5 — nomor resi manual (PRD A15), kartu keputusan `t_394b40ba` (21 Okt 2026)

Keputusan & alasan: `docs/keputusan-a15-resi.md`. Kontrak: §12.17 + §12.18a. Kolom: `docs/db.md` baris 32/88.

| Yang harus terpenuhi (A15) | Kartu | Assignee | Parent |
|---|---|---|---|
| Kolom `orders.tracking_number` + rute `admin.orders.resi` + validasi maks 60 + test | `t_b078318d` | backenddeveloper | — (dibuat dari `t_394b40ba`, tanpa gerbang) |
| Drift tampilan D12 di `docs/design.md` §11.3 + catatan isian resi di §5.12 | `t_0729c67f` | uiux | — (dibuat dari `t_394b40ba`, tanpa gerbang) |
| Isian resi aktif di kartu "Pengiriman" (hapus notice) + `npm run build` + harness | `t_d1028202` | frontenddeveloper | `t_b078318d` + `t_0729c67f` |
| Verifikasi §12.18a terhadap kode (bukti `path:baris`, sisa uji browser dicatat) | `t_2c9f8b01` | qatesting | `t_d1028202` |
| Gerbang rilis menunggu juga verifikasi resi | `t_e83922f2` | devops | `t_3a240a11` + `t_2c9f8b01` |

Catatan gerbang: dua kartu pertama tidak dipasangi parent karena keduanya sudah berjalan saat
`kanban_link` dipanggil (ditolak: "child is already running"); keduanya menulis berkas yang
berbeda sehingga aman berjalan paralel. Yang benar-benar bergerbang: frontend menunggu backend +
uiux, QA menunggu frontend, gerbang rilis menunggu QA verifikasi ulang + QA nomor resi.

## 9. Lanjutan F6 — `ulasan.boleh` §7.9, kartu keputusan `t_2b031326` (21 Okt 2026)

Keputusan & alasan: `docs/keputusan-f6-ulasan-boleh.md`. Kontrak: §7.9 (definisi diperjelas + dibekukan) + baris status §7.11.

| Yang harus terpenuhi (§7.9) | Kartu | Assignee | Parent |
|---|---|---|---|
| `boleh` = §9.1 menerima minimal satu kiriman (status boleh dinilai + masih ada produk belum diulas) + 5 test regresi | `t_45344e00` (B1) | backenddeveloper | — (dibuat dari `t_2b031326`) |
| Gate klien menyusut ke `boleh` (hapus cabang kontradiksi T1) | `t_02c3d20c` (B2) | frontenddeveloper | `t_45344e00` |
| Verifikasi props + gate (statis + otomatis; sisa uji browser dicatat) | `t_4ef6e8bd` (B3) | qatesting | `t_02c3d20c` |

Urutan wajib B1 → B2 → B3 (alasan: `docs/keputusan-f6-ulasan-boleh.md` §5). `docs/PRD.md`,
`docs/design.md`, dan gerbang rilis `t_e83922f2` tidak berubah oleh keputusan ini.

## 10. Laporan bug pemilik 3 — 22 Okt 2026 (kartu induk `t_fe77b3d7`)

Bukti & keputusan: `docs/review-3.md`; verifikasi QA: `docs/verifikasi-pemilik-t_18650721.md`.

| Butir laporan pemilik | Kartu | Assignee | Status |
|---|---|---|---|
| 1 Ukuran/warna tidak bisa dipilih setelah tambah barang | `t_bc89df6d` (kontrak varian), `t_7a62c713` (pemilih) | backenddeveloper, frontenddeveloper | Selesai, lulus |
| 2 Ukuran/warna terblokir bila warna >1 | `t_7a62c713` | frontenddeveloper | Selesai, lulus |
| 3 Warna swatch masih putih | `t_bc89df6d` (`color_hex`) | backenddeveloper | Selesai, lulus |
| 4 Dashboard admin belum sinkron data aktual | `t_1ef89050` | backenddeveloper | Selesai, lulus |
| 5 Midtrans langsung produksi + cek `.env` | `t_3c9d83c1` | devops | Lulus konfigurasi; charge nyata belum |
| 6 Tabel `/admin/produk` saling menumpuk | `t_7a62c713` | frontenddeveloper | Selesai, lulus |
| Verifikasi keenam butir + regresi | `t_18650721` | qatesting | Selesai; 258 test hijau |
| O-1 header tabel belum sticky (kontrak komponen) | `t_082b15aa` | frontenddeveloper | Terbuka (parent `t_fe77b3d7`) |
| O-4 KPI dashboard PRD §9 belum lengkap | — (ditunda; P14/U11) | — | Keputusan pemilik |

Catatan: `/produk/barang` tidak ada (404); rute katalog `/produk` dan `/produk/{slug}`.

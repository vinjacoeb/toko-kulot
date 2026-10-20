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

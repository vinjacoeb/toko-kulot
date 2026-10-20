# Catatan frontend — area Admin (Review & Pengaturan)

Kartu: t_fc49ee38. Berkas yang dikerjakan:

- `resources/js/Pages/Admin/Reviews/Index.jsx` — moderasi ulasan (design §5.12, kontrak §10.4–§10.6).
- `resources/js/Pages/Admin/Settings/Index.jsx` — pengaturan 9 tab (design §5.13, kontrak §10.7–§10.11).

## Rencana singkat (dijalankan)

1. Sembilan tab: Umum, Landing, Carousel, FAQ, Header, Footer, Kontak, SEO, Pembayaran — komponen tab lokal (`TabNav`) sesuai §5.13.
2. Form per tab dengan tombol Simpan sticky; pratinjau gambar rasio 1:1; peringatan saat pindah tab dengan perubahan belum disimpan.
3. Filter/tabel carousel & FAQ memakai `DataTable`; Ubah/Hapus lewat `Modal` + dialog konfirmasi bernama entitas.
4. URL literal dari kontrak: `/admin/pengaturan`, `/admin/pengaturan/landing`, `/admin/pengaturan/carousel`, `/admin/pengaturan/carousel/{id}`, `/admin/pengaturan/faq`, `/admin/pengaturan/faq/{id}`. Tanpa Ziggy/`route()`.
5. Prop dari server: `pengaturan` (umum/header/footer/kontak/seo/pembayaran/landing), `carousels`, `faqs`, `flash`, `auth`.
6. Komponen dipakai ulang: AdminLayout, PageHeader, Field, Input, Select, Textarea, Button, Modal, Toast, InlineNotice, EmptyState, ErrorState, DataTable, IconButton, Skeleton, icons.
7. State UI: kosong/daftar/tabel, galat kirim (per kolom + banner), memuat (`processing`/`loading`), sukses (flash → Toast), konfirmasi hapus, konfirmasi buang perubahan.

## Validasi tiga arah

- PRD vs desain: 9 tab §5.13 semuanya punya panel; tidak ada fitur di luar PRD (tanpa peran/izin baru, tanpa pengaturan yang tidak ada di PRD 223–235).
- Desain vs kontrak: key props persis kontrak; label field diambil dari label `SettingSeeder` (mis. "Midtrans client key (diisi pemilik)"); microcopy pesan validasi memakai teks aturan server.
- Kelayakan: `AdminLayout({ auth, nav, title, children })` menerima `nav` (dipakai untuk membuka `penilaian`/`pengaturan`); `DataTable`/`Modal`/`Field`/`Toast`/`InlineNotice`/`EmptyState`/`ErrorState` dipakai sesuai signature yang sudah ada di repo.

## Ketidakcocokan kontrak yang dicatat

1. `footer_links` — kontrak §10.8 (tabel) memakai entri datar `{label, url}`, sedangkan bentuk yang benar-benar tersimpan dan dibaca `Footer.jsx` + §2 adalah kolom `{title, items: [{label, url}]}` (lihat `database/seeders/SettingSeeder.php`). Halaman membaca mode data tersimpan: bila entri punya `items`, editor memakai kolom + tautan (mode nested) dan mengirim balik `{title, items[], label, url}` — `label`/`url` level kolom hanya agar rules `required|required_with` pada `footer_links.*` lolos. Bila data tersimpan datar, editor memakai baris datar. Perlu keputusan backend/Tech Lead: selaraskan rules `UpdateSettingRequest` dengan bentuk tersimpan (nama key `label` vs `title`).
2. `landing_sections` diganti utuh (`array_replace`) oleh `SettingService`. Halaman hanya mengirim section yang memang sudah ada di data (`announcement`, `trust_strip`, `featured`, `promo`, `why_us`, `newsletter`), supaya section lain tidak terhapus.
3. Tidak ada key hapus favicon di §10.8 (hanya `hapus_store_logo`), jadi UI hanya menyediakan "Hapus logo".
4. Unggah berkas + `PUT`: PHP tidak mem-parse body multipart pada PUT asli, jadi tab Umum memakai `POST /admin/pengaturan` + `_method=PUT` + `forceFormData` (pola sama seperti §10.10 untuk carousel). Tab tanpa berkas tetap memakai `PUT` JSON.

## Asumsi kecil

- Editor Landing menyunting `landing_hero.image`/`promo.image` sebagai path berkas (kontrak §10.9 tidak menyediakan unggahan untuk section landing), sedangkan logo/favicon/carousel memakai unggahan berkas.
- `footer_social` ditampilkan lewat daftar `SOCIAL_ICONS` + `shopee`; `footer_about` dari seeder dinamai "Tentang toko (footer)".
- Status aktif/nonaktif memakai `Select` ("Aktif"/"Nonaktif", "Tampil"/"Disembunyikan") karena tidak ada komponen switch di `docs/komponen.md`.

## Verifikasi (aktual)

- `npm run build` → exit 0, "✓ built in 14.20s"; bundel `public/build/assets/Index-D9EFvMSg.js` 49.76 kB (halaman Pengaturan) dan `Index-DypzbBOp.js` 11.81 kB (halaman Review).
- `python tmp/cek-komponen-tanpa-import.py .` → 79 berkas, satu temuan `resources/js/app.jsx: App` (false positive: parameter `setup({el, App, props})`).
- `python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` → "OK: tidak ada identifier komponen JSX tanpa import/definisi di bundel."
- Belum diuji: interaksi di browser (pindah tab, unggah berkas, keyboard/tab-order, 360–1280 px, zoom 200%) — server pengembangan dijalankan pemilik, jadi belum diverifikasi di sini.

---

## Kartu t_fc2c5b98 — Admin/Pesan Masuk (2026-10-20)

Berkas: `resources/js/Pages/Admin/Messages/Index.jsx` (546 baris, menggantikan skeleton 25 baris
yang memakai props di luar kontrak). Bukti mentah: `docs/bukti-frontend-t_fc2c5b98.txt`.

### Rencana singkat (dijalankan)

1. Halaman `get` list: `PageHeader` → baris filter (`SearchInput` + `Select` status) → `DataTable`
   → `Pagination`, semua dari komponen yang sudah ada.
2. Aksi baris: "Baca detail" (modal `size="lg"`) dan "Tandai dibaca" (PATCH, hanya pada baris belum dibaca).
3. Modal detail: isi pesan (`whitespace-pre-line`), blok balasan lama (pola sama seperti
   `Reviews/Index.jsx:262`), `Textarea` + `Field` untuk balasan, tombol "Tandai dibaca" dan "Kirim balasan".
4. State UI: `loading` (aria-busy + skeleton komponen), `empty` (dua varian: ada filter / tanpa filter),
   `error` (di dalam layout + "Coba lagi"), `saving` (`form.processing`), `validation-error`
   (galat per field dari server, modal tetap terbuka), `success` (toast dari `flash`), throttle 429.
5. URL literal dari kontrak: `router.get('/admin/pesan-masuk', …)` dengan `preserveState`/`preserveScroll`/`replace`,
   `router.patch('/admin/pesan-masuk/{id}/baca')`, `form.post('/admin/pesan-masuk/{id}/balas')`.

### Validasi tiga arah

- PRD vs desain: PRD §7.4 (pesan masuk) → design §5.12 ("Detail pesan: isi pesan, textarea balasan,
  'Tandai dibaca'") dan state baku `loading`/`empty`/`error`/`saving`/`validation-error`/`success`.
  Tidak ada fitur yang dinyatakan ditunda yang dipakai di halaman ini (tidak ada hapus pesan, tidak ada
  pengiriman massal). Sidebar: entri "Pesan" dibuka (`NAV_AKTIF`) karena rutenya sudah terdaftar —
  QA-007 (item nav lain masih `disabled`) milik kartu `t_6ee422f2`, tidak disentuh di sini.
- Desain vs kontrak: key dibaca persis §10.1 — `pesan.data[]` (`id`, `name`, `email`, `phone`, `subject`,
  `message`, `is_read`, `admin_reply`, `replied_at`, `created_at`), `filter.{q,status}`,
  `ringkasan.{total,belum_dibaca}`. Enum status `semua|belum|sudah`. Aksi memakai §10.2 (PATCH, koreksi
  20 Okt 2026) dan §10.3 (POST balas). Tidak ada rute baru yang dibuat.
- Kelayakan: `AdminLayout({auth, nav, title, children})` menerima `nav`; `DataTable`, `Pagination`,
  `Modal`, `Field`, `Select`, `SearchInput`, `Button`, `Textarea`, `StatusBadge`, `InlineNotice`, `Toast`
  sudah ada di repo dan dipakai sesuai signature-nya. `formatDateTime`/`formatNumber` dari `lib/format`.

### Ketidakcocokan kontrak yang dicatat

1. Kontrak §10.1 menuliskan paginator sebagai `links` + `meta`, sedangkan yang benar-benar dikirim
   `MessageController@index` adalah paginator Laravel datar (key `current_page`/`last_page`/`total` di
   level atas, `data` array). Halaman membaca keduanya (`readPaginator`) supaya tidak bergantung pada
   satu bentuk saja — pola sama dengan catatan kartu Review/Pengaturan. Perlu keputusan backend/Tech Lead
   bila kontrak ingin diselaraskan.
2. `ringkasan.total`/`ringkasan.belum_dibaca` dapat datang sebagai string (MySQL count) → dikonversi
   dengan `Number(x ?? 0)` dan ditampilkan lewat `formatNumber`; nilai kosong menjadi `0`, bukan `NaN`.

### Asumsi kecil

- Tone badge status baca tidak ditetapkan desain: §4.21 hanya memetakan status pesanan. Halaman memakai
  bentuk kelas baku §4.21 `bg-{token}/10 text-{token}` dengan `warning` untuk "Belum dibaca" dan
  `success` untuk "Sudah dibaca"; tidak ada warna/token baru. (Lihat juga `docs/asumsi.md`.)
- Ringkasan inbox ditampilkan sebagai satu baris meta "Total N pesan · M belum dibaca" (bukan KPI),
  mengikuti pola §5.12 yang hanya mewajibkan header/toolbar/tabel/paginasi.

### Verifikasi (aktual)

- `npm run build` → exit 0; entri manifest halaman ini `assets/Index-DaqgQ7RB.js` (9.690 byte) memuat
  "Tandai dibaca", "Belum dibaca", "Coba lagi". Hash aset berubah-ubah karena kartu frontend lain
  menjalankan build bersamaan.
- `python tmp/cek-komponen-tanpa-import.py .` → 80 berkas, satu temuan `resources/js/app.jsx: App`
  (false positive `setup({el, App, props})`).
- `python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` → 49 chunk,
  "OK: tidak ada identifier komponen JSX tanpa import/definisi di bundel."
- `php vendor/bin/phpunit tests/Feature/Admin/AdminInboxTest.php` → `OK (10 tests, 70 assertions)`;
  seluruh suite → `OK (190 tests, 1111 assertions)`, exit 0.
- Harness render nyata di browser (stub `@inertiajs/react`, CSS hasil build): render data bersih
  (tanpa `undefined`/`NaN`), data kosong/null, flash sukses server, galat daftar + "Coba lagi",
  PATCH tandai dibaca, POST balasan, penjaga perubahan belum tersimpan, 429, filter/pencarian/paginasi,
  keyboard + fokus modal, larangan visual. Detail dan angka pada `docs/bukti-frontend-t_fc2c5b98.txt`.
- Responsif terukur: 0 px overflow halaman pada 360/768/1024/1280 px; tabel menggeser di dalam
  kontainernya (`overflow-x: auto`).
- Belum diuji: render oleh server Laravel nyata (server pemilik tidak dinyalakan; harness memakai stub,
  bukan bukti integrasi), data dari MySQL nyata, zoom 200% sungguhan, pembaca layar.
- Temuan diteruskan (bukan milik kartu ini): kontras badge `StatusBadge` 2,86:1 ("Belum dibaca") dan
  2,96:1 ("Sudah dibaca") pada bentuk kelas baku §4.21 — diusulkan ke UIUX lewat kartu terpisah.

## K14 — Shell admin: sidebar kembali aktif (temuan QA-007), kartu t_6ee422f2

Berkas yang dikerjakan: `resources/js/Layouts/AdminLayout.jsx` (hanya ini).

Rencana singkat (dijalankan)

1. Cabut flag `disabled` dari `ADMIN_NAV` dan hapus cabang render `<span aria-disabled>` — semua item jadi `<Link href>` yang bisa diklik.
2. Selaraskan kelas item nav dengan design §5.10: `h-11`, ikon 18, label `text-meta`, aktif `border-l-[3px] border-accent-500 bg-white/10 text-white`, nonaktif `text-white/75` + `border-transparent`, hover `hover:bg-white/10 hover:text-white`.
3. Bukti: `docs/bukti-frontend-t_6ee422f2.txt`; alat baru di `tmp/` (`cek-nav-admin-vs-rute.py`, `verify-admin-nav.mjs`, `build-admin-nav-check.mjs`, `inertia-stub-admin-nav.jsx`).

Validasi tiga arah

- PRD §5.2 vs `routes/admin.php`: sembilan modul admin sudah punya rute GET (`/admin` … `/admin/akun`), jadi tidak ada item nav yang perlu dinonaktifkan dan tidak ada tautan 404.
- Desain §5.10 vs implementasi: sebelumnya label memakai `text-label` dan penyorot `bg-white/15`; kini `text-meta` + `border-l-[3px] border-accent-500 bg-white/10`, persis kalimat spesifikasi item nav. Nilai `border-l-[3px]` ditulis apa adanya karena design sendiri memakainya (bukan gaya baru). Kontras teks putih/`white/75` di atas `brand-700` sama seperti sebelumnya.
- Kontrak: tidak ada key props, rute, field, atau microcopy baru. Prop `nav` per halaman tetap diterima, sehingga `Pages/Admin/Messages/Index.jsx` dan `Pages/Admin/Settings/Index.jsx` (yang mengoper hasil map `ADMIN_NAV`) tidak terpengaruh; kunci `disabled: false` yang mereka kirim kini hanya diabaikan.

Asumsi kecil

1. Penyorotan aktif memakai helper `isActive` yang sudah ada (cocok persis, awalan `href/`, dan `href?query`), sehingga halaman anak (`/admin/produk/12`, `/admin/pesanan/12`, `/admin/stok/riwayat`) tetap menyorot modul induknya.
2. Item nav nonaktif dihapus seluruhnya, bukan disembunyikan: tidak boleh ada lagi item mati di sidebar.
3. `nav` hasil map di halaman Messages/Settings kini redundan tetapi dibiarkan — `Pages/Admin/Messages/Index.jsx` sedang dikerjakan kartu lain (t_fc2c5b98), jadi pembersihannya tidak dilakukan di kartu ini.

Verifikasi (aktual)

- `python tmp/cek-nav-admin-vs-rute.py` → "LULUS: semua item ADMIN_NAV punya rute GET terdaftar" (9/9, exit 0).
- `node tmp/build-admin-nav-check.mjs && node tmp/verify-admin-nav.bundle.mjs` → "LULUS: 179/179 pemeriksaan lolos" untuk 14 URL: 9 tautan `<a>` selalu dirender, tepat satu `aria-current="page"`, penyorot di modul yang benar, tanpa `aria-disabled`, tanpa `href="#"`.
- `npm run build` → exit 0, "✓ built in 13.97s".
- `python tmp/cek-komponen-tanpa-import.py <root>` → 80 berkas, hanya temuan `resources/js/app.jsx: App` (false positive); `python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` → OK, 49 chunk.
- HTTP ke server pemilik: sembilan href sidebar → 302 ke `/admin/login` (tidak ada 404). Bundel memuat kelas nav baru; satu-satunya `aria-disabled` yang tersisa di bundel ada di `VariantChip` (varian stok habis), bukan nav.
- Belum diuji di browser: klik nyata, drawer < 1024 px, urutan tab/keyboard, zoom 200% — server dijalankan pemilik dan kredensial admin tidak tersedia untuk agent.

Known issue

- CTA "Tambah produk" di empty state dashboard masih belum ada walaupun rutenya sudah terdaftar (dicatat juga di `docs/catatan-frontend.md`). Kartu lanjutan: t_099c813c.
- **Kolom cari topbar (§5.10) — diputuskan TIDAK dibangun (deviasi resmi, opsi c).** Keputusan kartu `t_b5de72e3`: jalur pencarian admin = toolbar per halaman daftar (§5.12), backend sudah menerima `q` di semua endpoint daftar, tanpa rute baru (PRD §5.2). Catatan pemilik: `docs/pertanyaan-pemilik.md` §4 T3 (deviasi diterima; pencarian global hanya bisa hidup bila PRD §5.2 ditambah rute lebih dulu). Komentar pencegah temuan berulang: kepala berkas `resources/js/Layouts/AdminLayout.jsx`. Kartu pencatat: `t_944aea1e`.
- Halaman `Admin/Kategori` dan `Admin/Akun` masih placeholder: tombol "Tambah" menunjuk `/admin/kategori/tambah`
  dan `/admin/akun/tambah` yang tidak terdaftar (404). Ditemukan audit `tmp/cek-tautan-admin-vs-rute.py`
  (31 url admin diperiksa, hanya 2 temuan ini) dan sedang dikerjakan kartu t_e5149746 — bukan bagian kartu ini.
- Flash sukses/galat tidak dirender di AdminLayout (halaman merendernya sendiri).

---

## t_944aea1e — keputusan kolom cari topbar admin dicatat (opsi c)

Rencana: (1) sisipkan komentar kepala `resources/js/Layouts/AdminLayout.jsx` agar deviasi design §5.10 /
D8 tidak diajukan ulang sebagai temuan; (2) ganti dua catatan known issue lama — yang menyebut kolom cari
tidak dibangun dan menunggu keputusan — di `docs/catatan-frontend.md` dan dokumen ini menjadi bunyi
keputusan dengan rujukan `t_b5de72e3` + `docs/pertanyaan-pemilik.md` §4 T3. Tanpa perubahan perilaku/tampilan, tanpa rute
baru (PRD §5.2), tanpa fitur baru.

Yang diubah (hanya tiga berkas)

- `resources/js/Layouts/AdminLayout.jsx` — 4 baris komentar baru di dalam blok kepala (kini baris 20–31);
  tidak ada baris kode JSX yang disentuh, kolom `⌕ cari` tetap tidak dirender (baris berkas 227 → 231).
- `docs/catatan-frontend.md` baris 97–102 — known issue kolom cari diganti kalimat keputusan
  (deviasi resmi, SELESAI) + rujukan `docs/pertanyaan-pemilik.md` §4 T3 dan bagian keputusan di
  `docs/catatan-techlead.md`.
- `docs/catatan-frontend-admin.md` baris 153 — kalimat yang sama di bagian Known issue.

Verifikasi (aktual; transkrip perintah lengkap + keluaran mentah di `docs/bukti-frontend-t_944aea1e.txt`)

- `grep -n "cari" resources/js/Layouts/AdminLayout.jsx` → 3 hasil, semuanya baris komentar (28, 29, 30);
  penyapuan bagian kode (baris 32 ke bawah) dengan pola kata kunci cari/pencarian → 0 hasil (exit 1).
- Penyapuan frasa known issue lama pada `docs/catatan-frontend*.md` → 0 hasil (exit 1); penyapuan pola
  frasa keputusan tertunda pada `docs/*.md` → 0 hasil (exit 1). Kedua frasa literal sengaja tidak ditulis
  di sini supaya pemeriksaan ulang tidak memicu dirinya sendiri — transkrip perintahnya ada di berkas bukti.
- `npm run build` → exit 0 pada tiga kali jalan (2,99–5,40 s; 714 modul; bundel `app-Bi-jA20D.js` sama
  di ketiganya).

Belum diuji

- Klik/interaksi topbar di browser nyata: **belum diuji, butuh browser** — server dinyalakan pemilik dan
  kredensial admin tidak tersedia untuk agent. Kartu ini hanya komentar + dokumen, jadi tidak ada
  perilaku runtime yang berubah.
- `resources/js/Layouts/AdminLayout.jsx` dan `docs/catatan-frontend-admin.md` belum pernah di-commit
  (untracked), jadi tidak ada baseline `git diff`; bukti perubahan = hunk patch (4 baris komentar) dan
  `sed -n` dua baris catatan di bagian 4 `docs/bukti-frontend-t_944aea1e.txt`.

# Brief putaran pemilik 6 — `t_8b70141c`

Dokumen acuan: `docs/PRD-v1.1.md` (mengikat) + `docs/design-v1.1.md` (dibuat uiux).
Brief lama (`docs/brief-*.md`) tetap berlaku untuk konvensi umum; brief ini hanya delta.

## uiux

- Baca `docs/PRD-v1.1.md` §1–§6, lalu `docs/design.md` §2 (token), §3.3 (landing),
  §5.1 (beranda), §5.6–5.8 (keranjang/checkout/bayar), §5.12–5.13 (admin), §6 (motion).
- Tulis `docs/design-v1.1.md`: layout landing baru (galeri, why-us editorial, trust strip,
  tipografi 3 tingkat), step "Cek Ongkir" + pilihan kurir + badge gratis, halaman bayar Snap,
  `/admin/ekspedisi`, tab Landing (unggah/urutkan/hapus galeri).
- Sertakan state kosong/loading/error, ukuran 360/768/1280, token baru (jangan hex di JSX),
  dan checklist uji untuk QA. Placeholder ditandai `[CONTOH]`; jangan mengarang aset.
- Output hanya `docs/design-v1.1.md`. Jangan menulis kode aplikasi.
- `kanban_block` hanya bila arah visual mengubah identitas brand dan tidak bisa diturunkan
  dari design.md.

## backenddeveloper

- Baca `docs/PRD-v1.1.md` §2–§5 dan §7–§8.
- **Galeri:** key `landing_gallery` (JSON maks 8 `{image,caption,alt}`), upload
  jpg/png/webp ≤2MB ke `storage/app/public/landing`, hapus file saat item dihapus,
  validasi di request admin, seed idempoten, CTA default memuat "Rp300.000" + "reguler".
- **Pembayaran:** Snap create transaction; migrasi kolom `payments.snap_token`,
  `snap_redirect_url`, `payment_type`; webhook simpan `payment_type`, idempoten; mode fake
  tetap bisa menyelesaikan order lewat service (bukan query dari frontend).
- **Ongkir:** `BiteshipService` (`/v1/couriers`, `/v1/rates/couriers`), key hanya dari
  `.env` (`BITESHIP_API_KEY`, contoh di `.env.example`), rute `checkout.shipping`,
  kolom orders §3, harga server saat submit, gratis ongkir §4, rute `admin.shipping.*`.
- Jangan membaca/menulis `.env`. Jangan mengubah migrasi lama; buat migrasi baru.
- DoD: `php artisan migrate:fresh --seed` bersih, feature test untuk webhook bank_transfer
  idempoten + fake + ongkir fake/gratis/non-reguler hijau, `php artisan route:list` memuat
  rute baru. `kanban_block` hanya bila kontrak dua dokumen bertentangan.

## frontenddeveloper

- Baca `docs/PRD-v1.1.md` §2–§6 dan `docs/design-v1.1.md` bagian layar yang dikerjakan.
- **Landing:** urutan seksi §6, galeri dari `settings.landing_gallery`, why-us editorial,
  trust strip, tipografi bertingkat, `Reveal` IntersectionObserver (tanpa dependency baru,
  hormati `prefers-reduced-motion`), lazy + `decoding="async"` semua gambar below-fold,
  CTA "Gratis ongkir min. Rp300.000 — khusus pengiriman reguler".
- **Checkout/bayar:** tombol "Cek Ongkir" → pilih layanan → badge GRATIS; halaman bayar
  menuju Snap, panel fake dipertahankan, hapus copy QRIS-satu-satunya; keranjang tulis
  "Dihitung saat checkout".
- **Admin:** `/admin/ekspedisi` (asal, kurir aktif/reguler, gratis ongkir, status key) dan
  tab Landing (unggah/urut/hapus galeri, caption/alt, preview, validasi).
- Jangan mengubah controller/migrasi/rute; jangan menambah npm package.
- DoD: `npm run build` sukses, tanpa `console.log`/Lorem ipsum, 360px tanpa scroll samping,
  state loading/empty/error ada. Butuh browser → tulis "belum diuji, butuh browser".

## qatesting

- Baca `docs/PRD-v1.1.md` §2–§6, `docs/design-v1.1.md` checklist, dan brief ini.
- Tulis `docs/qa-v1.1.md`: rencana uji + hasil, pisahkan lulus / gagal / belum diuji.
- Uji: Snap fake + webhook bank_transfer idempoten; ongkir fake, harga klien tidak dipercaya,
  gratis hanya reguler ≥300k, non-reguler tetap bayar; galeri admin tampil di `/`;
  copy CTA; build; regresi checkout/keranjang.
- Aturan: tidak mengubah kode aplikasi (hanya `docs/` + `tests/`), tidak menyalakan server,
  tiap temuan `path:baris` + perintah, browser → "belum diuji, butuh browser",
  satu masalah satu kartu perbaikan, maks 2 putaran per masalah.
- DoD: `php artisan test` hijau atau semua gagal punya kartu; laporan jujur; Go/No-Go.

## Batas

Techlead tidak menulis kode. Pertanyaan pemilik → `docs/pertanyaan-pemilik-v1.1.md`.

# Review v1.9 — tab Landing tidak bisa diedit

Kartu: t_e59d3f0b. Laporan pemilik: `http://127.0.0.1:8000/admin/pengaturan?tab=landing tidak bisa diedit`.

## Verdict

Gagal. Dua cacat saling menutupi; tab Landing praktis tidak bisa disimpan
setelah data seed terisi. Perbaikan dipecah ke dua kartu (backend + frontend)
dan satu kartu verifikasi QA.

## Temuan

### L1 — Simpan Landing selalu 422 saat hero/promo sudah punya gambar (backend)

- Bukti: `resources/js/Pages/Admin/Settings/Index.jsx:1073-1074` dan `:1101-1102`
  mengirim path gambar lama (string, mis. `/images/seed/landing/hero.png`) ke
  field `landing_hero[image]` / `landing_sections[promo][image]`.
- Aturan validasi: `app/Http/Requests/Admin/UpdateLandingRequest.php:34` dan
  `:58` memakai rule `image` + `mimes`, yang hanya menerima `UploadedFile`.
  String path selalu gagal ("must be an image").
- Data seed: `database/seeders/SettingSeeder.php:180` dan `:210` mengisi kedua
  field dengan path string, jadi kondisi gagal ini selalu aktif pada instalasi
  yang sudah di-seed.
- Dampak: setiap klik Simpan di tab Landing → 422, perubahan tidak tersimpan.
  Pesan galat muncul di bawah label gambar yang memang tidak punya kontrol
  unggah (lihat L2), sehingga terasa seperti "tidak bisa diedit".
- Dugaan akar masalah: validasi dibuat untuk unggahan baru, tetapi form juga
  mengirim path tersimpan; belum ada cabang "string path" seperti yang sudah
  dipakai `galleryImage()` di request yang sama (`:86-105`).

### L2 — Kontrol unggah gambar hero & promo tidak dirender (frontend)

- Bukti: `resources/js/Pages/Admin/Settings/Index.jsx:1511-1521` (hero) dan
  `:1739-1749` (promo) memakai `<Field>` dengan props `accept`, `file`,
  `currentPath`, `onSelect` — `<Field>` (`resources/js/Components/Field.jsx`)
  mengabaikan props itu dan tidak punya children, jadi tidak ada input sama
  sekali.
- Pembanding benar: `ImageField` pada `:1399-1440` (logo/favicon) dan `:2550-2560`
  (carousel).
- Dampak: admin tidak bisa mengganti/menghapus gambar hero maupun promo.

## Belum dicek

- Reproduksi lewat browser sebagai admin: belum dicek, butuh login browser.
  Kesimpulan di atas dari membaca kode + data seed, bukan dari klik langsung.
- Nilai `landing_sections` di DB pemilik: tidak dibaca (butuh kredensial DB
  milik pemilik). Bila kosong, `landing_sections` juga tidak terkirim dan
  validasi `required` (`UpdateLandingRequest.php:36`) menambah kegagalan simpan;
  kartu backend menutup kasus ini dengan tetap mewajibkan minimal hero.

## Rekomendasi

Go untuk perbaikan: L1 → backenddeveloper, L2 → frontenddeveloper, lalu QA
verifikasi satu kali. Tidak ada perubahan skema/data yang perlu keputusan
pemilik.

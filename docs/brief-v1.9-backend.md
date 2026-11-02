# Brief Backend — v1.9 (L1)

Baca `docs/review-v1.9.md` (bagian L1), `app/Http/Requests/Admin/UpdateLandingRequest.php`,
`app/Http/Controllers/Admin/SettingController.php::landing`.

## Masalah

Form tab Landing mengirim path gambar lama sebagai string
(`/images/seed/landing/hero.png`) ke `landing_hero[image]` dan
`landing_sections[promo][image]`. Kedua field divalidasi rule `image` + `mimes`
yang hanya menerima `UploadedFile`, jadi setiap simpan → 422.

## Yang dikerjakan

- Longgarkan validasi dua field itu: terima `UploadedFile` (rule lama) **atau**
  string path yang diawali `/`. Pakai closure yang sama polanya dengan
  `galleryImage()` di request itu.
- Jangan ubah controller: string path tetap disimpan apa adanya lewat
  `onlyKeys()`, file baru tetap ditangani `hasFile()`.
- Tambah feature test: (a) kirim path lama + judul diubah → 302, nilai
  tersimpan; (b) kirim file gambar → tersimpan; (c) string bukan path →
  422.

## Definition of Done

- Test baru lulus dan test Landing yang sudah ada tetap lulus.
- Tidak ada perubahan skema DB, route, atau kontrak props.
- Catat di `docs/catatan-backend.md` (bagian v1.9) dan perbarui
  `docs/review-v1.9.md` hanya bila ada temuan baru.

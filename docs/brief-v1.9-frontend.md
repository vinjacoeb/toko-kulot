# Brief Frontend — v1.9 (L2)

Baca `docs/review-v1.9.md` (bagian L2) dan
`resources/js/Pages/Admin/Settings/Index.jsx`.

## Masalah

Di tab Landing, gambar hero (`:1511-1521`) dan gambar promo (`:1739-1749`)
dirender dengan `<Field>` yang diberi props `accept/file/currentPath/onSelect`.
`Field` mengabaikan props itu dan tidak punya children, jadi tidak ada kontrol
unggah sama sekali.

## Yang dikerjakan

- Ganti kedua blok itu dengan `<ImageField>` seperti pola logo toko
  (`:1399-1440`): id, label, hint/message, accept + extensions + maxKb
  (LOGO_ACCEPT/LOGO_EXTENSIONS, 2048), `file` saat nilai adalah File,
  `currentPath` dari path tersimpan, `error`, dan `onSelect` yang memanggil
  `checkUpload` lalu `setData`.
- Pertahankan perilaku submit (`:1073-1074`, `:1101-1103`): kirim File bila
  dipilih, kirim path lama bila tidak.
- Galat `landing_hero.image` / `landing_sections.promo.image` harus tampil di
  kontrol baru, bukan hanya teks di bawah label.

## Definition of Done

- `npm run build` sukses.
- Dua kontrol unggah tampil, menampilkan preview path lama, dan bisa memilih
  file; tidak ada perubahan pada tab lain.
- Catat di `docs/catatan-frontend.md` (bagian v1.9).

# Catatan frontend v1.7 — Kartu A (`t_ca47e2e4`)

Sumber: `docs/brief-v1.7-frontend.md` Kartu A, `docs/design-v1.7.md` §1 (menggantikan
`design-v1.6.md` §1), `docs/design-v1.6.md` §1.4 (copy beku), `docs/kontrak-props.md` §7.12.

## Berkas diubah

- `resources/js/Pages/Public/Checkout.jsx` (satu-satunya berkas kode).

## Yang dikerjakan

- Daftar ceklis ekspedisi kini dari `opsi[]` saja, dan hanya selama `statusTarif === 'siap'`;
  baris `tersedia !== true` disaring (kontrak: `opsi[].tersedia` selalu `true`).
- `semua[]` tidak lagi dirender: state `semua`/`setSemua` dihapus; `semua` hanya tersisa di entri
  cache per kode pos (`cacheRef`) — cache tetap mencegah panggilan API ulang.
- Fallback `ringkasan.ekspedisi` dihapus; `menunggu`, `kosong`, `galat`, `timeout` tidak lagi
  menampilkan kartu disabled (copy/notice v1.6 tetap apa adanya).
- Kartu: `disabled`, alasan per kartu (`alasanKartu`, "Tidak tersedia di area anda"), dan gaya
  nonaktif dihapus; harga selalu tampil (GRATIS + coret untuk `gratis === true`).
- `statusTarif === 'siap'` dengan daftar kosong (setelah saring) memakai notice `kosong` yang sama.
- Tidak menyentuh `BiteshipService`, `CheckoutController`, bentuk props, atau rute.

## Verifikasi

- `npm run build` → exit 0, `✓ built in 5.94s`; chunk `Checkout-DAxNZvXL.js` 20.23 kB.
- `grep -n "semua" resources/js/Pages/Public/Checkout.jsx` → hanya baris cache (379, 393) dan
  komentar (457); tidak ada pemakaian untuk render.
- `python tmp/cek-komponen-tanpa-import.py .` → `app.jsx: App` dan `Reveal.jsx: Tag` (keduanya
  alias destructuring, false positive lama; bukan dari perubahan ini).
- `python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` → temuan
  `DropzoneGalery-*.js -> P` (berkas lama, di luar lingkup kartu).

## Belum diuji

- Uji mobile/klik kartu di browser: **belum diuji, butuh browser** (pemilik).
- Keadaan `galat`/`timeout`/`kosong` dengan respons nyata Biteship: belum diuji, butuh key/API.

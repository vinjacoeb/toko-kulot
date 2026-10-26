# Rencana Perbaikan: Spacing Hero & Carousel

1. Memperiksa komponen `HeroSection` dan `HeroCarousel` untuk menyesuaikan spasi.
2. Memeriksa `Home.jsx` untuk melihat penempatan komponen.
3. Menyesuaikan `className` untuk menambah margin atau padding agar tidak "mepet".

Temuan awal:
- `Home.jsx` merender `HeroSection` diikuti `HeroCarousel`.
- `HeroSection` dan `HeroCarousel` memiliki height `h-heroMobile` (480px) atau `h-hero` (560px).
- Tidak ada spasi vertikal antar keduanya.


---

# t_32a3828e — Rombak landing + galeri + Reveal (design-v1.1 §4, PRD-v1.1 §6)

## Validasi tiga arah (sebelum kode)

Sumber: `docs/design-v1.1.md` §2.1–§2.4, §4.1–§4.6, §10–§12; `docs/PRD-v1.1.md` §6;
`docs/brief-owner6.md` frontenddeveloper; `docs/kontrak-props.md` §2 (`landing_gallery`), §10.9;
`database/seeders/SettingSeeder.php`.

- PRD/desain vs kontrak: `landing_gallery[] {image,caption,alt}` (maks 8) ada di props bersama
  `settings` (`HandleInertiaRequests::REQUIRED_PUBLIC_KEYS`). `why_us` hanya `title` + `items[]`
  (title/body) — **tidak ada** field gambar atau `description`; gambar why-us diambil dari galeri
  sesuai desain §4.4. `trust_strip[]` `{icon,title,subtitle}` maks 6. `newsletter` `{title,subtitle,
  button_text}`; tidak ada `url`, tombol memakai tujuan kontak existing `/kontak-kami` (§4.5).
- Desain vs kontrak: nomor editorial, caption, alt, state gambar gagal, lazy+`decoding=async`,
  eager hero — semua bisa dibangun dari data props; tidak butuh rute/field baru.
- Kelayakan: Tailwind 3.4 (punya `line-clamp`), token `display-xl`/`aspect-portrait`/
  `aspect-editorial` belum ada → ditambahkan (3 token, sesuai design §2.1). Tidak ada
  `Reveal`/galeri/why-us komponen → dibuat baru. `IntersectionObserver` native, tanpa paket baru.

## Rencana (maks 10 baris)

1. `tailwind.config.js`: token `fontSize.display-xl`, `aspectRatio.portrait`, `aspectRatio.editorial`.
2. Baru `resources/js/components/Reveal.jsx` — IO threshold 0.12, rootMargin `0 0 -10% 0`, sekali
   muncul lalu unobserve; reduced-motion/IO absen/dekstop langsung terlihat; stagger maks 4×50ms.
3. Tulis ulang `TrustStrip.jsx` — pita putih bergaris, nomor 01–06, 6/3/2 kolom, hover garis aksen,
   maks 6 item (sebelumnya dipotong 4).
4. Baru `LandingGallery.jsx` — komposisi 1/2/3/4–8 asimetris, caption bernomor, fallback
   `ImageOff` + "Gambar tidak tersedia", kosong = seksi hilang.
5. Baru `WhyUs.jsx` — editorial `bg-brand`, statement "Bukan sekadar dasternya.", daftar bernomor,
   gambar dari galeri index 0 dan 2.
6. `Pages/Public/Home.jsx` — urutan §4.1 (hero dikembalikan; sempat hilang di working tree), CTA
   akhir panel putih + garis aksen 4px dengan kalimat gratis ongkir (fallback seeder), Reveal.
7. Verifikasi: `npm run build`, sapu `console.log`/Lorem/placeholder, audit layout 360/768/1280
   secara statis (server pemilik tidak jalan → "belum diuji, butuh browser").

## Deviasi/asumsi yang dicatat

- `container` landing tetap token existing (1300/16–50px) alih-alih 1200/20–32–48 (§2.4) supaya
  header/footer/produk tidak bergeser; mengubah token global di luar lingkup kartu ini.
- Padding vertikal seksi memakai token existing `py-sectionMobile`/`lg:py-section` (40/64) agar
  konsisten dengan seksi existing, bukan 56/72/96.
- Paragraf pengantar why-us (§4.4) tidak dirender: tidak ada field sumber di kontrak; tidak
  mengarang copy. Eyebrow fallback "KENAPA BELI DI SINI" dan statement statis sesuai desain.
- Baris bawah galeri 4–8 dibagi rata (1 sisa = 12 kolom, 2 = 6, 3 = 4, 4–5 = 3) agar tidak ada
  lubang besar; desain hanya mengikat pola enam tile pertama.

---

# t_011cc18e — Admin ekspedisi + unggah galeri landing (PRD-v1.1 §5–§6, design-v1.1 §7–§8, §10.13)

## Validasi tiga arah (sebelum kode)

- PRD vs desain: D4 punya layar `/admin/ekspedisi` (§8.1–8.8) dengan seluruh state; D6 punya
  kartu galeri di tab Landing (§8.9). Tidak ada fitur baru di luar itu.
- Desain vs kontrak §10.13: props `pengaturan` + `kurir {mode,key_terisi,sumber,galat,daftar[]}`;
  setiap baris `courier_name/service_name/label/is_regular/is_active` tersedia. `shipping_couriers`
  hanya ditulis lewat `couriers[]`, jadi halaman memakai props `kurir.daftar` sebagai sumber baris.
  `shipping_cost_default` ada di kontrak (dipakai mode tarif uji) tetapi tidak digambar di design
  §8.3/§8.4 → ditempatkan di kartu Asal kirim dengan helper eksplisit, dicatat sebagai deviasi.
- Kontrak galeri §2: `landing_gallery[] {image,caption,alt}` maks 8; `landing_gallery_present`
  wajib agar hapus-semua tersimpan. Unggahan lewat multipart `landing_gallery[i][image]`.
  Backend hanya menerima `image` berupa UploadedFile atau string berawalan `/`.
- Kelayakan: rute `admin.shipping.index/update` + controller/request sudah ada; `AdminLayout`
  belum punya menu Ekspedisi → ditambah. Komponen primitives lengkap; tidak ada paket baru.

## Rencana (maks 10 baris)

1. `Pages/Admin/Shipping/Index.jsx` baru: header + status mode/kunci, kartu asal kirim (5 field +
   tarif uji), daftar layanan (toolbar cari, tabel desktop, kartu mobile, checkbox 44px, badge),
   form kode manual, kartu gratis ongkir + peringatan, StickySave, Toast, state kosong/galat.
2. `Layouts/AdminLayout.jsx`: item sidebar Ekspedisi (`/admin/ekspedisi`, `TruckIcon`).
3. `Settings/Index.jsx`: state `galleryItems` + kartu Galeri landing (tambah multiple, preview 4:5,
   caption/alt per item + counter, naik/turun, ganti, hapus dengan Batalkan, error per berkas),
   kirim `landing_gallery_present` + item aktif lewat FormData.
4. Pindahkan field `shipping_cost_default` dari tab Pembayaran ke halaman Ekspedisi (design §8.7).
5. Verifikasi `npm run build`; tanpa server/browser → catat "belum diuji, butuh browser".

## Deviasi/asumsi

- `shipping_cost_default` digambar di kartu Asal kirim karena kontrak mewajibkannya tetapi design
  §8 tidak menempatkannya; helper menjelaskan pemakaiannya (mode tarif uji / API gagal).
- Konfirmasi hapus gambar memakai tombol "Batalkan" pada item (bukan modal), sesuai design §10
  yang meminta aksi hapus bisa dibatalkan sebelum simpan.
- Miniatur galeri memakai SVG inline (bukan berkas aset) agar tidak menambah aset baru.

## Implementasi & verifikasi

- Galeri landing disambungkan: `GalleryCard` dirender di akhir tab Landing (sebelum StickySave),
  submit multipart mengirim `landing_gallery[i][image|caption|alt]` berurutan untuk item aktif +
  `landing_gallery_present=1` (kontrak §10.9), sehingga hapus-semua ikut tersimpan.
- Index error per item memakai indeks item aktif (bukan indeks daftar penuh) agar error server
  tidak nyasar saat ada item bertanda hapus.
- State a11y ditambah: `aria-live` untuk "akan dihapus"/"dipindah", fokus pindah ke tombol tambah
  setelah hapus, fokus ke caption item baru setelah tambah, cincin fokus pada label "Ganti gambar".
- Thumb galeri memakai fallback blok netral + teks sr-only "Gambar tidak tersedia" saat 404
  (sebelumnya gambar error disembunyikan dan menyisakan ruang kosong).
- `shipping_cost_default` dipindah dari tab Pembayaran ke halaman Ekspedisi: dihapus dari
  `TAB_KEYS.pembayaran`, state `settingsForm`, dan normalisasi submit, supaya tidak ada dua form
  yang menulis kunci yang sama (nilai lama di tab Pembayaran bisa menimpa nilai baru Ekspedisi).

Verifikasi yang dijalankan:

- `npm run build` — sukses (exit 0).
- `php artisan test --filter=AdminLandingGalleryTest` — 9 passed, 57 assertions (bukti payload
  galeri + penanda diterima backend, termasuk hapus-semua dan urutan ulang).
- `python tmp/cek-komponen-tanpa-import.py .` — 103 berkas; hanya 2 temuan yang sudah dikenal
  false positive (`app.jsx: App`, `Components/Reveal.jsx: Tag`).

Belum diuji (butuh browser + server pemilik): unggah multipart nyata dari UI, tampilan 360/768/
1024/1280, operasi keyboard penuh, zoom 200%, dan state gambar 404.

## Known issue

- `tests/Feature/Checkout/CheckoutShippingTest.php:257` (test backend, bukan frontend) gagal: payload uji
  `test_admin_tidak_bisa_menonaktifkan_semua_kurir` tidak mengirim `free_shipping_enabled`, sehingga
  validasi berhenti di "Nilai gratis ongkir tidak valid." dan error `couriers` tidak pernah muncul.
  Hasil lain 9 lulus. Sudah dikomentari di kartu backend t_f22c8d46.
- Desain §8.6 menulis "Tidak ada kurir aktif: jangan blokir simpan", tetapi
  `ShippingController::update` menolak simpan tanpa layanan aktif ("Pilih minimal satu layanan kurir
  aktif."). Server menang; halaman menampilkan peringatan sebelum simpan agar tidak mengejutkan.
- Flash sukses server berbunyi "Pengaturan ekspedisi disimpan." (bukan "Ekspedisi disimpan." pada
  design §8.6). Teks server ditampilkan apa adanya, tidak ditulis ulang di klien.

- Setelah simpan landing sukses, daftar galeri di form masih memakai File/preview lokal sampai
  halaman dimuat ulang; server sudah menyimpan. Ini pola yang sama dengan unggah hero. Efeknya
  form tetap terlihat "belum disimpan" dan simpan berikutnya mengunggah ulang berkas yang sama
  (server mengganti, bukan menduplikasi). Perbaikan butuh sinkronisasi props setelah sukses —
  di luar lingkup kartu ini.
- Object URL preview lama tidak di-revoke saat "Ganti gambar"; hanya di-revoke saat unmount.
  Kebocoran kecil per penggantian gambar.



## Implementasi t_32a3828e — hasil

Berkas:
- `resources/js/Pages/Public/Home.jsx` — urutan seksi 2–10 (design-v1.1 §4.1), `Reveal`, CTA panel garis aksen 4px, `WhyUs`, `LandingGallery`, FAQ dibungkus `bg-surface`.
- `resources/js/components/Reveal.jsx` (baru) — IntersectionObserver threshold 0.12; `prefers-reduced-motion`/tanpa observer → langsung tampil.
- `resources/js/components/TrustStrip.jsx` — pita putih `border-y border-line`, nomor 01–06, pemisah vertikal, hover garis aksen 2px via transform, item terakhir melebar saat menyisakan lubang.
- `resources/js/components/LandingGallery.jsx` — komposisi per jumlah gambar (1/2/3/4–8), caption nomor + teks, `line-clamp-2`, fallback `ImageOff`, `loading="lazy"`.
- `resources/js/components/WhyUs.jsx` (baru) — eyebrow dari `title`, statement statis, daftar 01–06, gambar dari galeri item 1 & 3.
- `resources/js/lib/gallery.js` (baru) — `normalizeGallery` (filter gambar kosong, maks 8, alt kosong = dekoratif).
- `resources/js/lib/gallery.check.mjs` (baru) — cek assert tanpa framework.
- `tailwind.config.js` — token `display-xl` 72px dan `aspectRatio.portrait/editorial`.

Deviasi sadar (tidak ada field kontrak):
- Paragraf pengantar why-us tidak dirender: kontrak `why_us` hanya `{title, items[]}`.
- Galeri 4 gambar: tile terakhir `lg:col-span-12`, bukan `col-span-4` literal, karena menyisakan lubang 8 kolom.
- CTA mengikuti `button_text` server apa adanya (DB saat ini "Kirim"); fallback "Hubungi Kami" hanya bila kosong, href `/kontak-kami` (route `contact` ada).

Verifikasi:
- `npm run build` → sukses (Home 23.24 kB, app 365 kB).
- `node resources/js/lib/gallery.check.mjs` → `gallery.check: ok`.
- Browser dev server: urutan seksi hero→trust→kategori→featured→galeri→promo→why-us→faq→CTA; 4 tile galeri; reveal jalan saat scroll; `prefers-reduced-motion: reduce` semua opasitas 1 tanpa scroll; Tab menampilkan ring fokus; overflow horizontal 0 di 360/768/1280; galeri 2 kolom (tile utama span 2) di 360/768, 12 kolom di 1280; trust 2/3/4 kolom; CTA mobile penuh di dalam padding panel.
- Belum diuji: komposisi visual 1/2/3 dan 7–8 gambar (DB hanya 4), tautan CTA eksternal, Safari/iOS.

## t_aea95532 — checkout + pembayaran (Snap) + ongkir

Rencana: (1) OrderSummary menerima `items`/`shippingText`/`shippingBadge`/`totalLabel`/`helper`; (2) Cart mengirim kontrak ongkir; (3) Checkout.jsx: bagian Cek Ongkir (kode pos → opsi kurir), validasi klien, submit `shipping_courier`/`shipping_service`/`shipping_cost`; (4) CheckoutPay: jalur Snap utama + panel QRIS hanya mode uji.

Validasi tiga arah:
- PRD/design vs layar: design §6.1 melarang pilihan metode pembayaran di checkout; §6.4 Cek Ongkir (timeout 10 dtk, state kosong/galat/rate-limit); §6.6 total final hanya setelah opsi dipilih (termasuk mode fake). Design §5.8 halaman bayar = panel QRIS; kontrak §7.7 menambah `snap_redirect_url` (semua kanal). Keduanya dipenuhi: mode asli → tombol Snap, mode uji → panel QRIS.
- Design vs kontrak: tidak ada `discount` di §7.0/§7.5 → baris Diskon tidak dirender (design §6.2 menyebut diskon). `pembayaran` pada §7.5 kini tidak dipakai halaman checkout (sesuai design §6.1) — prop diterima server, diabaikan.
- Teknis: token `brand-50` tidak ada di tailwind.config.js → kartu opsi terpilih memakai `brand-100` (deviasi token, bukan layout).

Deviasi/asumsi:
- `pengiriman.opsi[]` mode fake memakai `cost = shipping_cost_default`; semua opsi wajib dipilih (design §6.4) sehingga tidak ada jalur "tarif uji tanpa pilih".
- Tombol "Buka Halaman Pembayaran" = `<a href>` ke `snap_redirect_url` (eksternal, bukan Inertia Link).
- Verifikasi: `npm run build` exit 0. Belum diuji di browser (tanpa server dev): responsif 360/768/1024/1280, keyboard, zoom 200%, dan alur Snap sandbox.

## t_5648bd43 — copy keranjang: "Pembayaran QRIS" → "Pembayaran aman lewat Midtrans."

QA-V11-01 (PRD-v1.1 §6.5 no hard-coded metode; design-v1.1:369 trust note checkout).
- Satu baris: `resources/js/Pages/Public/Cart.jsx:171` `note="Pembayaran QRIS"` → `note="Pembayaran aman lewat Midtrans."`.
- Tidak ada perubahan layout/komponen lain (`OrderSummary` hanya menerima prop `note`).
- "Pembayaran QRIS" yang tersisa hanya di `Components/QrisPanel.jsx` (aria-label + judul galat), dipakai `CheckoutPay` **hanya mode uji** (`isFake`) — panel QRIS memang panel QRIS, bukan klaim metode tunggal. Tidak diubah.
- Verifikasi: `npm run build` exit 0 (3.67 dtk), bundel `Cart-*.js` memuat copy baru; grep "Pembayaran QRIS" di `Cart.jsx`, `Checkout.jsx`, `OrderSummary.jsx` = 0. Halaman `/keranjang` belum dicek di browser (butuh login + server pemilik).

## t_8827a623 — panel Snap design-v1.1 §7.2/§7.5

Rencana: (1) label tombol primer jadi "Pilih Metode Pembayaran"; (2) tombol disabled + notice
§7.5 saat `pembayaran.galat` terisi atau `snap_redirect_url` kosong; (3) aksi "Muat Ulang" /
"Hubungi Penjual"; tidak menyentuh backend/polling.

Validasi tiga arah:
- PRD D1 + design-v1.1:524 (teks persis) vs layar: halaman bayar sebelumnya memakai "Lanjut ke
  Pembayaran" dan tanpa jalan pulih saat URL/galat → diperbaiki.
- Design §7.5 vs kontrak §7.7: `pembayaran.galat` (kalimat siap tampil, `null` bila siap) dan
  `snap_redirect_url` (null bila gagal) cukup; tidak ada key baru. "Hubungi Penjual" → rute yang
  ada `/kontak-kami` (routes/web.php:40), sama dengan tautan Checkout.jsx:457.
- Teknis: logika tabel §7.5 diekstrak ke `resources/js/lib/snap-galat.js` (murni) + cek
  `snap-galat.check.mjs`; JSX hanya merender.
- Aksi "Muat Ulang" = `window.location.reload()` (tanpa rute baru); tombol Snap memakai `<a href>`
  ke `snap_redirect_url`, bukan Inertia Link.

Verifikasi: `node resources/js/lib/snap-galat.check.mjs` → 4 kasus OK; `npm run build` exit 0.
Bundel `CheckoutPay-*.js` memuat ketiga judul panel + "Pilih Metode Pembayaran". Halaman bayar
belum dicek di browser (butuh login pembeli + Snap sandbox).

## t_01d11ad9 — tombol "Simulasikan pembayaran berhasil" (mode uji)

Rencana: satu tombol di `CheckoutPay.jsx` cabang `isFake`, POST `/checkout/{order}/simulasi-bayar`
lewat `useForm` Inertia; teks/loading persis design §7.3; sembunyi saat final. Backend tidak disentuh.

Validasi tiga arah:
- PRD-v1.1 §2 D1.3 + design-v1.1 §7.3 vs layar: tombol belum ada (QrisPanel hanya "Cek Status" /
  "Salin Kode") → ditambah; notice mode uji + QrisPanel sudah ada sebelumnya.
- Desain vs kontrak: §7.13 `POST /checkout/{order}/simulasi-bayar` tanpa body, redirect + flash,
  hanya mode uji; pemicu `pembayaran.fake` (§7.7) sesuai design §14 butir 4 (`midtrans.fake` hanya
  badge). Tidak ada key baru. `pembayaran.status` tetap sumber status panel.
- Teknis: URL literal (bukan `route()`/Ziggy); `Button` + `useForm` yang sudah dipakai repo.

Keputusan:
- Tombol tampil selama status belum final (`paid`/`expired` disembunyikan), bukan hanya literal
  `pending`, supaya tidak berkedip saat "Cek Status" (`checking`) dan tetap bisa dicoba lagi setelah
  galat polling — §7.3 hanya melarang saat settlement/expired.
- Setelah POST, status lokal disinkronkan dari props hasil redirect (`preserveState: true`) agar
  panel lunas tampil langsung tanpa menunggu polling 5 dtk; `flash.success`/`flash.error` sudah
  dirender di atas panel.
- Tidak ada teks tambahan selain label + loading (microcopy desain).
- Catatan hotspot: kartu `t_8827a623` menulis `CheckoutPay.jsx` bersamaan; patch pertama gagal
  verifikasi, dikerjakan ulang setelah kartu itu `done` (lihat kanban_comment).

Verifikasi: `php artisan route:list --name=checkout.simulate` → `POST checkout/{order}/simulasi-bayar`;
`grep -rn "simulasi" resources/js` = 9 baris (tidak lagi kosong); `npm run build` exit 0 (2.91 dtk),
bundel `CheckoutPay-*.js` memuat "Simulasikan pembayaran berhasil", "Menandai lunas…", "simulasi-bayar".
Belum diuji di browser: halaman bayar butuh login pembeli + `MIDTRANS_FAKE=true`; klik tombol →
`settlement` belum dijalankan. Backend tidak diubah.

---

# t_8febc069 — Register alamat + ongkir otomatis di checkout (F1/F2-v1.2)

## Validasi tiga arah

- PRD-v1.2 §3 vs design-v1.2 §5.3/§6: semua state S0–S7 punya pemicu + copy; tombol "Cek Ongkir"
  dihapus; alamat register 3 field setelah Konfirmasi Kata Sandi; tidak ada fitur baru di luar F1.
- Desain vs kontrak: `GET /checkout/ongkir?postal_code=` (§7.12) mengirim `mode`, `kode_pos`,
  `gratis`, `opsi[]{courier_code,courier_name,service_code,service_name,label,etd,cost,is_regular,gratis}`,
  `galat`. Tidak perlu key baru. Nama field form tetap `customer_*` (§7.5/§7.6) walau tabel design
  §5.2 memakai `recipient_*/shipping_*`; kontrak yang mengikat, dicatat di sini.
- Register: pesan server (`RegisterRequest`) persis design §6.1 (address min 10 / city max 100 /
  postal digits:5). Field klien hanya memblokir non-digit kode pos; validasi tetap server.
- Teknis: repo punya `Input`/`Textarea`/`Field`/`InlineNotice`/`OrderSummary`/`Badge`; URL literal
  `/checkout/ongkir` (tanpa Ziggy); `fetch` + `AbortController` sudah dipakai halaman ini.

## Rencana

1. `Pages/Public/Auth/Register.jsx`: `address` (textarea), `city`, `postal_code` + helper/galat.
2. `Pages/Public/Checkout.jsx`: hapus tombol Cek Ongkir; efek debounce 600 ms (kode pos 5 angka +
   alamat ≥10 karakter), cache `Map<postal, hasil>`, `AbortController`, state S0–S7, reset kurir saat
   kode pos berubah, prefill `customer_*`, submit disabled sesuai §5.4 (mode fake boleh tanpa kurir).
3. `Components/OrderSummary.jsx` + `Components/PriceBlock.jsx`: T3/T4/T7/T22 design §2.6 (owner kartu
   ini) — token `text-h3`/`text-h2`, `tabular-nums`, baseline.
4. Verifikasi: `npm run build`; grep target tipografi; cek bundel memuat copy baru.

## Catatan / deviasi

- Urutan field register mengikuti design §6.1: alamat/kota/kode pos setelah Konfirmasi Kata Sandi
  (bukan setelah Nomor WhatsApp); textarea alamat `rows={3}`, `maxlength=500`.
- Submit checkout: `siapKirim` mengikuti design §5.4 — nonaktif saat S1/S3/S4/S5/S7, saat keranjang
  kosong, atau saat mode `api` belum ada layanan dipilih. S0 tidak memblokir; validasi field tetap
  lewat `validate()` + `errors.*`. Mode `fake` boleh submit tanpa memilih dan server memakai
  `pengiriman.tarif_uji`; ringkasan menampilkan tarif uji + badge `Tarif uji` agar total cocok dengan
  yang akan ditagih server (design §5.4 menulis ongkir `—` sampai dipilih untuk alur api).
- Ringkasan selalu berlabel `Total` (kontrak §7.0: `total = subtotal + shipping_cost ?? 0`); ongkir
  `—` sebelum tarif siap dan `GRATIS` bila opsi terpilih `gratis`. `keranjang` §7.5 tidak punya key
  `diskon`, jadi baris Diskon tidak dirender (design §5.4: hanya bila >0).
- Nama field DOM tetap `customer_*` (§7.5/§7.6), termasuk fokus otomatis `customer_address`; design
  §5.2 memakai nama tampilan `shipping_address`.
- Mobile: ringkasan biaya di atas Catatan, tombol `Buat pesanan` + alasan di bawah Catatan
  (design §5.1); desktop ringkasan sticky kolom kanan dengan tombol di dalamnya.

## Verifikasi

- `npm run build` → exit 0 (`✓ built in 6.05s`, chunk `Checkout-*.js` 18.94 kB).
- `python tmp/cek-komponen-tanpa-import.py C:/Users/LENOVO/Downloads/toko-kulot` → 105 berkas; hanya
  false positive lama `app.jsx: App`, `Reveal.jsx: Tag`.
- `python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` → 73 chunk; satu
  temuan lama `DropzoneGalery-*.js -> FREE: P` (di luar kartu ini).
- Belum diuji di browser: auto-tarif (debounce/abort/timeout), urutan mobile, keyboard, 360/768/1280,
  zoom 200%. Butuh server pemilik + login + kode pos nyata.

### Verifikasi ulang (percobaan kedua setelah batas iterasi)

- `npm run build` → exit 0 (`✓ built in 3.01s`; `Checkout-A4oP2gzv.js` 18.71 kB, gzip 5.93 kB).
- Checker komponen → exit 0, 103 berkas, hanya `app.jsx: App` + `Reveal.jsx: Tag` (false positive lama).
- Checker bundel → exit 0, 73 chunk, hanya `DropzoneGalery-…js -> FREE: P` (lama, di luar kartu).
- Bundel `Checkout-*.js` memuat copy baru (`Tarif muncul otomatis setelah alamat dan kode pos terisi.`,
  `Tarif untuk kode pos`, `Pilih layanan pengiriman dulu.`) dan **tidak** memuat `Cek Ongkir`;
  `Register-*.js` memuat helper alamat/kota/kode pos.
- Grep pola tipografi terlarang di 4 berkas kartu (`text-[…]`, `max-w-xl`, `leading-*`, `tracking-*`,
  `uppercase`) → 0 hasil.
- `totalLabel` tetap ada di `OrderSummary` (dipakai `Cart.jsx`); yang berubah hanya dokumentasi +
  kelas tipografi T3/T4.

---

# t_6c310317 — Halaman bayar publik (design-v1.2 §6, kontrak §7.7)

## Validasi tiga arah

- PRD/design vs layar: kanal dipilih di halaman ini (tanpa Snap), instruksi per `jenis`
  (`va`/`qris`/`bill`/`gerai`), countdown, status final, mode uji, galat. Tidak ada fitur baru.
- Kontrak vs desain: props `pesanan` (§7.6) + `pembayaran` (§7.7: `status`, `gross_amount`, `metode`,
  `instruksi`, `kanal`, `expires_at`, `paid_at`, `fake`, `galat`). Rute literal:
  `POST /checkout/{order}/bayar/metode`, `POST /checkout/{order}/simulasi-bayar`,
  `GET /checkout/{order}/status` (JSON `{status,paid_at,expires_at}`), `GET /checkout/{order}/selesai`.
- Teknis: primitives `Button`/`InlineNotice`/`Badge`/`StatusBadge`/`Spinner`/`Skeleton`/
  `OrderSummary`/`SalinButton`; token `h-qr`/`w-qr`, `text-h2`, `tabular-nums`; CSRF via meta
  `app.blade.php:6` hanya untuk fetch status (GET, tidak perlu token).

## Rencana

1. `Components/SalinButton.jsx` (baru): nilai + tombol `Salin`, fallback `execCommand`,
   `Tersalin` 2 detik (`role="status"`), target 44px.
2. `Pages/Public/CheckoutPay.jsx`: state pemilih/menyiapkan/instruksi/kedaluwarsa/lunas/gagal;
   poll status 3 detik saat tab terlihat + `visibilitychange`; satu request in-flight;
   instruksi kosong → reload otomatis 1×+2× lalu notice `Instruksi belum tersedia.` + `Muat ulang`.
3. Verifikasi build dan bundel.

## Catatan / deviasi

- `OrderSummary` belum punya baris diskon. Bila `pesanan.discount > 0`, diskon ditampilkan sebagai
  helper di bawah Total (`Termasuk diskon −Rp…`) agar Total server tetap konsisten; baris `dl`
  diskon penuh perlu perubahan `OrderSummary` (di luar kartu ini).
- `pembayaran.galat` saat ini selalu null dari controller; notice tetap membaca `galat` → `flash.error`
  → galat lokal.
- `CheckoutPay` ditulis ulang penuh (berkas lama 20.282 char, backup di scratch `backup/CheckoutPay.jsx.bak`).

## t_220ba320 — Riwayat pesanan `/history` (v1.2 F8)

## Validasi tiga arah

- PRD/design vs layar: `design-v1.2.md` §9 (kartu ringkas, panel rincian, timeline, state,
  responsif) sudah menutup F8; tidak ada fitur di luar §9. Halaman tidak membuat rute detail baru
  (D13: disclosure, bukan halaman detail).
- Kontrak vs desain: `docs/kontrak-props.md` §13 sudah berisi `subtotal`, `shipping_cost`,
  `discount`, `customer{}`, `shipping{}`, `timeline{}` (revisi aditif `t_f4a75237`) dan
  `HistoryController.php` benar-benar mengirim semuanya. Rute literal `GET /history` + `page`.
- Teknis: `Public/History.jsx` sudah ada; primitives `Button`/`StatusBadge`/`EmptyState`/
  `InlineNotice`/`Pagination`/`Skeleton`/`SalinButton`/`Breadcrumb` + token `text-h3`, `text-meta`,
  `text-body`, `text-label`, `font-mono`, `tabular-nums`, `border-line`, `bg-surface`, `bg-danger`,
  `text-danger-strong`, `duration-accordion`, `ease-smooth` semua tersedia.

## Rencana

1. Tulis ulang `Pages/Public/History.jsx`: kartu ringkas (code mono, 2 badge server, meta 2 kolom,
   total, ringkas kirim) + panel disclosure `Lihat rincian` (`aria-expanded`/`aria-controls`).
2. Panel: Pengiriman (`dl` + resi `SalinButton`) → Rincian biaya (`dl`, total server) → Item
   (gambar 64px, tautan `/produk/{id}`, `line-clamp-2`) → Timeline 3 node (merah untuk
   `batal`/`expire`).
3. State: skeleton 3 kartu saat paginasi, `EmptyState` "Belum ada pesanan.", `InlineNotice` +
   `Coba lagi` untuk galat HTTP/jaringan; null → `—` / `Resi belum tersedia.`.

## Catatan / deviasi

- Kontrak §13 tidak menyediakan label metode bayar (`payment_method_label`); DoD kartu menyebut
  "metode pembayaran berlabel Indonesia", tetapi desain §9.1 hanya meminta badge status pesanan +
  status bayar. Yang ditampilkan: `payment_label` (label status bayar dari server). Tidak ada field
  yang ditebak; bila label metode memang dibutuhkan, perlu tambahan kontrak backend.
- `detail_url = null` (termasuk `batal`) tidak merender tombol utama — sesuai §13.
- Timeline memakai `timeline.created_at/paid_at/shipped_at`; node `batal`/`expire` menggantikan
  node yang belum tercapai.

## Verifikasi

- `npm run build` → sukses (`✓ built in 6.31s`, chunk `History-BVzXBbKI.js` 11.13 kB).
- `python tmp/cek-komponen-tanpa-import.py .` → 105 berkas, hanya false positive lama
  (`app.jsx: App`, `Components/Reveal.jsx: Tag`); `History.jsx` bersih.
- `python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` → 73 chunk,
  satu temuan lama `DropzoneGalery-*.js -> FREE: P` (di luar kartu ini).
- Belum diuji di browser: interaksi disclosure, salin resi, paginasi, 360/768/1280, keyboard,
  zoom 200%.

## t_6c310317 — verifikasi lanjutan (design-v1.2 §4)

- Kartu kanal: `grid grid-cols-1 gap-2 md:grid-cols-2` (design §4.2: 1 kolom 360, 2 kolom ≥768);
  label grup `text-badge uppercase text-ink-soft` tanpa `font-semibold`/`tracking-wide`.
- Microcopy langkah disamakan dengan design §4.3: VA langkah 3–4, QRIS 4 langkah, Bill langkah 1.
- Semua nominal total `whitespace-nowrap` (termasuk nilai `baris('Total', …)`); nilai lain tetap
  `tabular-nums`.
- Polling: interval 3 dtk; saat tab kembali terlihat langsung satu `cekStatus()` (design §4.5).
  Reload instruksi kosong: 1 dtk lalu 3 dtk (design §4.4), maks 2×.
- Panel mode uji hanya dirender bila `metode` sudah ada: `simulate` menolak tagihan tanpa
  `payment_type` ("Pilih metode pembayaran dulu."), jadi tombol sebelum pilih kanal selalu galat.
- `Components/QrisPanel.jsx`, `lib/snap-galat.js`, `lib/snap-galat.check.mjs` dihapus: tidak ada
  pemakai tersisa setelah halaman bayar memakai `SalinButton` + markup §4.3 (design T5/T6 gugur).
- Deviasi: chip hitung mundur memakai `text-warning-strong` (bukan `text-warning` §4.3) karena
  `Badge`/`StatusBadge` menetapkan `warning` hanya 2,86:1. `onError` Inertia memakai fallback
  `Gagal membuat pembayaran. Coba lagi.` bila server tidak mengirim galat per field. Gambar QR yang
  gagal dimuat jatuh ke blok `qr_string` dengan helper `Kode QR gagal dimuat. Gunakan kode teks ini.`
  (state kegagalan gambar tidak diatur design §4.3).

### Verifikasi run ini

- `npm run build` → sukses `✓ built in 3.02s`, `CheckoutPay-Buih9MDH.js` 20,77 kB (gzip 6,06 kB).
- `python tmp/cek-komponen-tanpa-import.py .` → 103 berkas, hanya false positive lama
  (`app.jsx: App`, `Components/Reveal.jsx: Tag`); `CheckoutPay.jsx`/`SalinButton.jsx` bersih.
- `python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` → 73 chunk, satu
  temuan lama `DropzoneGalery-*.js -> FREE: P` (di luar kartu).
- `grep text-\[|leading-none|max-w-xl|tracking-|example.com` di `CheckoutPay.jsx` + `SalinButton.jsx`
  → 0 hasil; `uppercase` hanya pada label grup `text-badge`.
- Bundel: "Pilih metode pembayaran", "Selesaikan pembayaran", "Tagihan ini dibuat tanpa Midtrans",
  "Tandai lunas (mode uji)", "Instruksi belum tersedia", "Menunggu konfirmasi kedaluwarsa",
  "Pembayaran diterima", "Tetap di halaman ini" masing-masing 1×; teks lama "Hanya untuk pengujian"
  0×.
- Belum diuji: browser (login pemilik), ganti kanal 2× ke Midtrans sandbox, hitung mundur nyata,
  keyboard/zoom 200%, 360/768/1280 visual, salin di HTTP non-secure.

## t_ab9c84fe — detail pesanan admin F3 (pembayaran + pengiriman + resi)

## Validasi tiga arah

- PRD v1.2 §F3/§8 vs design §7.1–7.4: panel pembayaran, pengiriman, kolom Kurir/Resi, filter
  `Status pengiriman`, badge `Mode uji`, aksi sinkron + resi otomatis/manual semuanya ada di
  spesifikasi layar; tidak ada fitur yang ditunda ikut dibangun.
- Design vs kontrak §12.16/§12.17/§12.24/§12.25: semua key yang dipakai ada (`payment.metode`,
  `payment.instruksi`, `payment.fake`, `pesanan.mode_uji`, `shipping{...}`, `filter_opsi.kirim`).
  Aksi resi otomatis memakai URL kontrak §12.25 `POST /admin/pesanan/{order}/resi` (design §7.3
  menulis `…/resi-otomatis`; kontrak menang) dan PATCH manual `tracking_number` maks 60.
- Kelayakan: halaman `Admin/Orders/Show` sudah ada; partial `BuktiPembayaran`, `InfoResi`,
  `SyncPaymentButton`, `KartuBagian` dipakai ulang; `Button` hanya ditambah prop opsional
  `loadingLabel` (bawaan `Memproses…`) untuk teks `Membuat resi…` dari design §7.3.

## Rencana

- Berkas diubah: `Pages/Admin/Orders/Show.jsx` (grid 7/5, badge header, kartu Pelanggan/Timeline,
  Ubah status pindah ke kartu), `Orders/Index.jsx` (filter kirim + kolom Kurir/Resi + badge mode
  uji), `partials/BuktiPembayaran.jsx` (kanal/instruksi per jenis, salin, QR), `partials/InfoResi.jsx`
  (ringkasan kirim, resi otomatis/manual), `Components/Button.jsx` (`loadingLabel`).

## Catatan / deviasi

- `payment.payment_type` mentah tidak pernah dirender; kanal = `payment.metode.label` →
  `pesanan.payment_method_label` → `—`.
- Tombol `Buat resi otomatis` hanya dirender saat status pesanan `dibayar`/`dikirim` dan
  `shipping.biteship_order_id` kosong; guard selebihnya dari server (`flash.error` apa adanya).
- `shipping.galat` dirender sebagai notice tanpa menutup tombol, supaya admin bisa mencoba lagi.
- Design §7.4 meminta kolom pembayaran memakai `payment_method_label`, tetapi §12.16 tidak
  mengirim field itu pada baris daftar (hanya `payment_status`/`payment_label`). Kolom tetap
  memakai `payment_label`; perlu tambahan field backend bila label kanal ingin tampil di daftar.
- Flash aksi (sinkron/resi) dirender satu kali sebagai `InlineNotice` di kartunya; halaman
  menekan Toast untuk pasangan pesan yang sama lewat `flashAksi`.
- Belum diuji di browser (tidak menyalakan server): resi otomatis sukses/gagal, simpan manual,
  sinkron pembayaran, responsif 360/768/1280, keyboard, zoom 200%.

## Verifikasi

- `npm run build` → sukses (`✓ built in 4.31s`).
- `python tmp/cek-komponen-tanpa-import.py .` → 103 berkas, hanya temuan lama
  (`app.jsx: App`, `Components/Reveal.jsx: Tag`).
- `python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` → 73 chunk, satu
  temuan lama `DropzoneGalery-*.js -> FREE: P` (di luar kartu ini).

### Tambahan t_ab9c84fe — ekspedisi dropdown (design §8.2)

- `Shipping/Index.jsx`: dropdown `Kurir` (opsi unik `courier_code`, label `{courier_name} ({courier_code})`)
  → `Layanan` (terfilter, label `{service_name} ({service_code})` + `· {etd}`), tombol `Tambah`
  nonaktif sampai keduanya dipilih, duplikat `Layanan ini sudah ada di daftar.` di bawah tombol,
  ganti kurir mengosongkan layanan. Sumber tunggal `kurir.daftar[]`.
- `kurir.sumber = "settings"` atau `kurir.daftar` kosong → notice
  `Katalog Biteship tidak tersedia. Isi kode manual.` + `kurir.galat` apa adanya, form dropdown
  disembunyikan bila katalog kosong, input `Tambah kode manual` existing tetap jadi jalur tambahan.
  Teks sumber katalog kini `Katalog Biteship` / `Layanan tersimpan` (design §8.1).
- Logika katalog dipisah ke `resources/js/lib/ekspedisi.mjs` (`katalogKurir`, `layananKurir`,
  `kunciLayanan`) agar bisa diuji tanpa browser; check: `node resources/js/lib/ekspedisi.check.mjs`.

### Celah kontrak t_ab9c84fe

- Design §7.4 meminta kolom daftar pesanan memakai label kanal (`payment_method_label`), tetapi
  §12.16 dan `OrderController::index` hanya mengirim `payment_status` + `payment_label`. Kolom
  daftar memakai `payment_label`; label kanal tampil di detail (`payment.metode.label`). Dicatat
  sebagai komentar di kartu backend B4, tidak ada field karangan di klien.

### Verifikasi tambahan

- `node resources/js/lib/ekspedisi.check.mjs` → `ekspedisi.check.mjs: ok` (exit 0).
- `npm run build` → sukses (`✓ built in 3.48s`); checker komponen/bundel hanya temuan lama.

## t_51dab180 — Tipografi publik (design-v1.2 §2)

### Validasi tiga arah

- §2.6 membagi pelanggaran per pemilik. Kartu ini memegang `Pages/Public/**` (T2, T15–T19, T21, T22)
  dan komponen bersama yang dipakai halaman publik (T9, T10, T12–T14, T20, T23). T3/T4/T7 sudah
  dibereskan `t_8febc069`, T1/T5/T6 hilang bersama `QrisPanel`, T11/T24–T26 milik kartu admin
  (`KpiCard.jsx`, `DataTable.jsx`, `AdminLayout.jsx` masih memuat temuan — bukan lingkup kartu ini).
- Token `text-display-xl`…`text-badge`, `font-display`, `tabular-nums` sudah ada di
  `tailwind.config.js`; tidak ada token baru. Tidak ada perubahan props, rute, atau perilaku.
- `resources/css/app.css` tidak punya ukuran ad-hoc; `.label` sudah `text-meta` (di skala), tidak diubah.

### Rencana

1. `Home.jsx` T15, `Products/Show.jsx` T16/T21, `Cart.jsx` T17, `CheckoutSuccess.jsx` T2/T19.
2. `tabular-nums` pada render nominal di Cart/CartLine/CheckoutSuccess/Show/ProductCard/FilterPanel
   dan pada tanggal/kode order.
3. Komponen bersama: `LandingGallery` T9, `WhyUs` T10, `HeroCarousel` T12/T13, `HeroSection` T14,
   `FilterPanel` T20, `TrustStrip` T23, `RatingSummary` T8 (satu-satunya `leading-10` yang tersisa
   di daftar bersama kartu ini).
4. Eyebrow `text-label uppercase` → `text-badge uppercase` (LandingGallery, WhyUs) agar uppercase
   hanya di badge/wordmark.
5. Verifikasi: enam perintah grep §2.5 + `npm run build`.

### Catatan / deviasi

- `max-w-2xl` pada `h1` display HeroCarousel/HeroSection dibiarkan: larangan §2.2 no. 1 untuk prosa,
  bukan judul.
- `Cart.jsx` hanya menyusun teks helper (uang di dalam kalimat) yang dirender `OrderSummary`;
  `tabular-nums` tetap ditambahkan pada paragraf ringkasan `OrderSummary` (tempat nominal tampil)
  dan pada paragraf jumlah produk di `Cart.jsx` supaya pemeriksaan per-berkas §12 lulus.
- Paragraf pendek lain (Contact, notice checkout) tidak diberi `max-w-[65ch]`: audit §2.3 hanya
  menemukan 5 paragraf melebihi 65ch dan semuanya masuk daftar T12–T16.

### Verifikasi

- `npm run build` → `✓ built in 3.03s` (exit 0).
- Enam perintah grep §2.5 (bukti lengkap: `docs/bukti-tipografi-t_51dab180.txt`):
  `text-[Npx]` 1 sisa (`KpiCard.jsx:50`), `leading-none` 2 sisa (`Button.jsx` sah + `KpiCard`),
  `max-w-xl` 0, `text-label/meta uppercase` 3 sisa (`DataTable`, `KpiCard` ×2),
  `tracking-wide` 2 sisa (`AdminLayout`), tabular per file: seluruh file publik > 0, `KpiCard` 0.
  Semua sisa berada di berkas admin (T11, T24–T26) yang bukan lingkup kartu ini.
- `python tmp/cek-komponen-tanpa-import.py C:/Users/LENOVO/Downloads/toko-kulot` → 103 berkas,
  hanya `app.jsx: App` (parameter `setup`) dan `Reveal.jsx: Tag` (komponen dinamis) — keduanya
  false positive lama.
- `python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` → 1 temuan
  `DropzoneGalery-*.js -> FREE: P`; `P` didefinisikan di chunk (`P=({size...})`) — false positive
  pola regex, bukan regresi tipografi.
- Tidak ada komponen, impor, props, rute, atau perilaku baru; hanya class tipografi/spasi.
- Belum diuji di browser (pemilik yang menjalankan server): cek visual 360/768/1280 px untuk
  `text-h2` total di CheckoutSuccess, nomor langkah `text-h2` di LandingGallery/WhyUs, dan eyebrow
  `text-badge` di Galeri/WhyUs.

## t_b3e22a50 — kartu penilaian dobel untuk produk sama beda varian (P-01)

Lingkup: `resources/js/Pages/Public/CheckoutSuccess.jsx` saja (frontend). Rujukan: `docs/review-penilaian.md`
P-01, design §5.8, kontrak §7.9/§9.1.

### Yang diubah

- Tambah `produkUnik`: `pesanan.items` (satu baris per varian) dikelompokkan per `product_id` unik
  sebelum `pending`/`sudahAda` dihitung; `variant_label` unik digabung `', '` (mis.
  `XL · Merah, L · Hijau`), baris tanpa `product_id` valid dilewati.
- `pending`, `sudahAda`, `tampilkanForm`, `errorFor`, `submitReview`, dan key React
  (`isi-${product_id}`, `sudah-${product_id}`) kini memakai daftar unik itu → satu kartu per produk,
  key tidak mungkin dobel.
- Ringkasan pesanan tetap merender `items` per baris varian (harga/qty per baris), key-nya kini
  `${product_id}-${index}` supaya tidak dobel saat satu produk punya 2 varian. Payload kirim
  ulasan tidak berubah: tetap `ulasan: [{ product_id, rating, comment }]` (indeks 0), server tidak
  disentuh.

### Verifikasi

- `npm run build` → exit 0, `✓ built in 4.39s` (run akhir setelah key ringkasan diperbaiki; run
  sebelumnya 9.45s).
- Cek logika (skrip scratch `cek-produk-unik.js` mengekstrak blok `produkUnik` langsung dari berkas
  dan menjalankannya di node): 5 baris input (2 varian produk 7, 1 baris varian produk 7 duplikat,
  1 varian produk 9, 1 baris `product_id` null) → 2 produk unik `[7, 9]`, label
  `XL · Merah, L · Hijau`, tidak ada id dobel. Output: `OK: 2 varian produk sama -> 1 kartu, key unik,
  label gabungan`.
- `python tmp/cek-komponen-tanpa-import.py` → 103 berkas; hanya dua false positive lama
  (`app.jsx: App`, `Reveal.jsx: Tag`). `python tmp/cek-bundel-identifier-bebas.py` → 1 temuan lama
  `DropzoneGalery-*.js -> FREE: P`.
- Belum diuji di browser (server dijalankan pemilik; tidak dinyalakan): perlu cek pesanan nyata
  dengan 2 varian produk sama → 1 kartu, dan submit ulasan sekali → kartu jadi "Terima kasih!".

## t_08806cd2 — kolom Aksi lengket di /admin/pesanan

Rencana: `Components/DataTable.jsx` menerima `column.sticky` (th/td `sticky right-0`, latar
opaque, `border-l border-line`, `tr` diberi `group`, sel ikut `group-hover:bg-surface`), lalu
`Pages/Admin/Orders/Index.jsx` menandai kolom `aksi` dengan `sticky: true`. Tanpa komponen,
token, atau warna baru; tabel admin lain tidak mengirim `sticky` sehingga rupanya tidak berubah.

Verifikasi: `npm run build` exit 0 (✓ built in 4.01s, tanpa warning); ukur replika markup
ber-CSS aplikasi di viewport 1280 (wadah 990 px): tabel 1163 → 1164 px, sel Aksi 1092–1163 px
(tersembunyi) → 918–990 px (menempel kanan), scroll horizontal tetap ada (174 px) dan posisi
sel tidak berubah saat digulir penuh. Detail: `docs/bukti-frontend-t_3f1b4473.txt`. Halaman
admin asli belum dilihat (butuh login) — verifikasi di kartu QA `t_eb32d784`.

## t_a0a38aeb — panel pengiriman admin + badge perlu tindakan (v1.3 F1)

Rencana: `Pages/Admin/Orders/partials/InfoResi.jsx` menambah baris `Petugas kurir`, `Ongkir
aktual`, `Selisih ongkir`, `Diperbarui` (field null/0 tidak dirender), `InlineNotice
tone=warning` "Perlu tindakan" di atas `dl`, dan `<details>` payload mentah (null → paragraf
"Belum ada payload webhook."). `Pages/Admin/Orders/Index.jsx` menambah badge `Perlu tindakan`
(AlertIcon 14) + timestamp `Diperbarui …` di sel Kurir/Resi dan melonggarkan early-return `—`.
Tanpa komponen/token/rute/aksi tulis baru. `Show.jsx` tidak berubah — panel hidup di partial.

Validasi tiga arah:
- PRD-v1.3 §2.6 vs design-v1.3 §1–§2: semua keadaan punya tempat; tidak ada fitur baru selain
  tampilan data (tanpa aksi ubah status).
- Desain vs kontrak §12.16/§12.17: key `shipping.updated_at`, `driver{name,phone}`, `price_final`,
  `price_selisih`, `perlu_tindakan`, `tindakan`, `webhook_terakhir`, dan baris `shipping_updated_at`,
  `shipping_perlu_tindakan` semuanya sudah dikirim backend (kartu `t_5a702574`, 8 test hijau).
- Desain menyebut urutan akhir tanpa ETD/Berat/Ongkir; dibaca sebagai sisipan (design-v1.3 §0:
  struktur halaman tidak berubah), jadi baris existing dipertahankan dan baris baru disisipkan.
- Label existing "Nomor resi"/"Status Biteship" tidak diganti agar microcopy tidak bertambah.

Verifikasi:
- `npm run build` → exit 0, `✓ built in 6.14s` (tanpa warning).
- Cek helper `selisih` (skrip scratch mengekstrak fungsi dari berkas): 11 kasus — null/undefined/
  `''`/`0`/`'0'`/bukan angka → tidak dirender; `3000` → `+Rp3.000`; `-5000` → `-Rp5.000`. OK.
- `python tmp/cek-komponen-tanpa-import.py .` → 103 berkas, hanya 2 false positive lama.
  `python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` → 1 temuan lama
  `DropzoneGalery-*.js -> FREE: P`.
- Belum diuji di browser (server pemilik tidak dinyalakan): keadaan belum ada webhook / picked /
  delivered / retur / selisih / payload kosong perlu dicek QA di `/admin/pesanan` dan
  `/admin/pesanan/{order}` dengan data uji.

## t_e3c1f107 — status kirim di halaman selesai + riwayat pembeli (v1.3 F2)

Rencana: `Pages/Public/CheckoutSuccess.jsx` menambah blok "Status pengiriman" (`<dl>` grid
`sm:grid-cols-2`) di bawah "Dikirim ke": Status (`status_label`, null → `—`), Resi (`SalinButton`,
null/`''` → `Resi sedang disiapkan.`), Kurir (`courier_name · service_name`), Petugas kurir
(`driver.name`, null → baris hilang), Diperbarui (`updated_at`, null → baris hilang), dan `Button`
secondary "Lacak paket" hanya bila `driver.link` berawalan `http(s)://` (`target=_blank`,
`rel=noopener noreferrer`). `Pages/Public/History.jsx`: label status di kartu ringkas setelah baris
kurir · resi (`text-meta text-ink`) dan baris Petugas kurir (nama + telepon `text-meta tabular-nums`)
serta Diperbarui di rincian; tanpa tautan lacak. Tanpa komponen/token/rute/aksi baru; timeline
"Dikirim" dan `Resi belum tersedia.` existing tidak diubah.

Validasi tiga arah:
- PRD-v1.3 §2.6 vs design-v1.3 §3–§4: semua keadaan punya tempat; pembeli hanya melihat, tanpa
  `price_final`/`price_selisih`/`webhook_terakhir`/`tindakan`/`perlu_tindakan`.
- Kontrak §7.9/§13 (DRAFT `t_5a702574`) cocok dengan kode: `BiteshipService::shippingInfo()` sudah
  mengirim `updated_at`, `driver{name,phone,link}`, `status_label`, `tracking_number`; kedua
  controller memakai bentuk pembeli yang sama. Tidak ada key karangan.
- Larangan design §0 diikuti: field null tidak dirender `—` (kecuali Status yang memang `—`),
  label status apa adanya dari server, tanpa tautan lacak di riwayat, tanpa warna/token baru.
- Deviasi kecil: snippet design §4 menulis `<section>` tanpa `mt-5`; dipakai `mt-5` agar jarak ke
  blok "Dikirim ke" sama dengan pola kartu existing (tanpa margin, garis atas menempel paragraf).

Verifikasi:
- `npm run build` → exit 0, `✓ built in 3.46s` (Vite, tanpa warning).
- Harness SSR scratch `tmp/ssr-v13-t_e3c1f107.mjs` (esbuild + `react-dom/server`, stub
  `@inertiajs/react`): 30 cek lulus — belum ada webhook (`—` + `Resi sedang disiapkan.`, tanpa
  tombol), picked (label, resi, salin, petugas, diperbarui, tautan aman), delivered tanpa driver
  (baris Petugas hilang, `javascript:` tidak dirender), `shipping` null, riwayat 4 pesanan
  (label/resi/petugas/telepon/diperbarui/timeline `shipped_at`), delivered-dari-diproses,
  riwayat kosong; semua tanpa `undefined`/`NaN`/harga aktual/selisih/payload/aksi.
- `python tmp/cek-komponen-tanpa-import.py .` → 103 berkas, hanya 2 false positive lama
  (`app.jsx: App`, `Reveal.jsx: Tag` = parameter/alias). `python tmp/cek-bundel-identifier-bebas.py
  public/build/assets public/build` → 1 temuan lama `DropzoneGalery-*.js -> FREE: P` (`P=` ada di
  chunk, artefak destructuring minifier).
- Belum diuji di browser (server pemilik tidak dinyalakan): QA perlu cek `/checkout/{order}/selesai`
  dan `/history` dengan data uji picked/delivered, 360 px (grid jadi satu kolom), keyboard pada
  tombol salin + `Lacak paket`, zoom 200%.

Handoff QA: fixture berbentuk §7.9/§13; pesanan tanpa webhook harus tetap menampilkan blok dengan
`Status —` dan `Resi sedang disiapkan.`; `driver.link` non-http harus menyembunyikan tombol;
`/history` tidak boleh menampilkan tautan lacak atau angka ongkir aktual/selisih.

## t_0412c9c4 — F12 v1.4: hapus UI ubah status di /admin/pesanan/{order}

Rencana: (1) buang import `UbahStatusModal`, `InlineNotice`, prop `status_berikut`, state
`modalTerbuka`/`final`, notice "Status sudah final" (bersandar pada `status_berikut`), kartu
"Ubah status" + tombol, dan render modal di `Admin/Orders/Show.jsx`; (2) hapus
`Admin/Orders/partials/UbahStatusModal.jsx` (tidak ada pemakai lain); (3) build + grep bukti.

Validasi tiga arah:
- PRD-v1.4 §3.1 + design-v1.4 §4: kartu "Ubah status", tombol, dan modal dihapus; tidak ada
  pengganti; status hanya lewat `StatusBadge`; kartu lain tetap. Notice "Status sudah final"
  ikut dihapus karena maknanya (`status_berikut` kosong → tidak ada langkah lanjut) hilang bersama
  prop-nya, dan design menyebut "tidak ada pengganti tombol".
- Kontrak §12.17 sudah dibersihkan backend (B3: `status_berikut`, `§12.18`, `Order::nextStatuses()`,
  `UpdateOrderStatusRequest` dihapus). Halaman kini hanya membaca `pesanan`, `timeline`, `flash`.
  Aksi yang tersisa (`res PATCH/POST`, `sinkron-pembayaran`) tidak diubah.
- Teknis: `Button` masih dipakai ("Kembali ke daftar"), `StatusBadge` dipakai deret badge atas,
  `Badge` untuk Mode uji, `useState` tetap untuk toast/flashAksi. Tidak ada dependency baru.

Verifikasi:
- `npm run build` → exit 0, `✓ built in 58.10s`; chunk `UbahStatusModal-*.js` tidak lagi di
  `public/build/assets` (grep kosong), `Show-ekkxsRjS.js` 15.14 kB.
- `grep -rn -E 'status_berikut|UbahStatusModal|Ubah status|status-final|modalTerbuka'
  resources/js` → kosong (hanya docs/brief & catatan-backend yang menyebut istilah lama).
- `python tmp/cek-komponen-tanpa-import.py .` → 102 berkas, hanya 2 false positive lama
  (`app.jsx: App`, `Reveal.jsx: Tag`).
- Belum diuji di browser: server pemilik tidak dinyalakan. QA: buka detail pesanan status apa pun,
  pastikan tidak ada teks "Ubah status"/tombol/modal, `StatusBadge` + badge pembayaran tetap di
  atas, kartu Bukti pembayaran/Pengiriman/Catatan/Item/Pelanggan/Timeline utuh, 360 px satu kolom,
  keyboard tab tidak berhenti di kontrol yang hilang.

Handoff QA: halaman admin detail hanya membaca `pesanan`/`timeline`/`flash`; prop `status_berikut`
sudah tidak dikirim server (test `test_daftar_dan_detail_pesanan_admin_tanpa_prop_ubah_status`),
jadi jangan laporkan `undefined` bila props lama tak ada. Tidak ada perubahan halaman publik.

## t_2ecd08cb — F13 v1.4: node Selesai + riwayat pengiriman di /history dan halaman selesai bayar

Rencana: (1) `Components/ShippingEvents.jsx` baru — daftar "Riwayat pengiriman" bersama (maks 10,
urutan server terbaru dulu, sembunyi bila kosong, `<ol>` + titik `aria-hidden`); (2)
`Public/History.jsx` — node keempat `Selesai` dari `timeline.completed_at`, daftar event di bawah
timeline dalam kartu yang sama (`mt-4 border-t border-line pt-4`); (3)
`Public/CheckoutSuccess.jsx` — daftar event yang sama setelah blok pengiriman; (4) build + cek.

Validasi tiga arah:
- PRD-v1.4 §4.3 + design-v1.4 §1–§3 + brief F1: timeline utama empat node, event terbaru di atas
  maks 10, tidak dirender bila `events` kosong, tanpa aksi/polling. Tidak ada fitur di luar itu.
- Kontrak §13 + §7.9 (DRAFT 26 Okt 2026, kartu t_f51f8c36): `shipping.events` `[{status,label,at}]`
  selalu array (server: `[]`, terbaru→terlama, maks 50 tersimpan), `timeline.completed_at` ISO/null.
  Server sudah mengirim keduanya di `/history` dan `/checkout/{order}/selesai` (test
  `TimelineV14Test`), jadi tidak perlu fixture/mock.
- Teknis: komponen baru hanya memakai `formatDateTime` (`lib/format`) + token yang ada
  (`text-body`, `text-sm`, `text-slate-600`, `bg-brand`, `bg-slate-300`, `border-line`); tanpa
  dependency baru. Komponen dipakai dua halaman supaya gaya §2 tidak terduplikasi — satu berkas
  tambahan di luar daftar output brief, dicatat di sini.

Keputusan kecil:
- Komponen memakai `formatDateTime` langsung (selalu `d M Y, HH.mm`), bukan menyalin `waktu()` milik
  History; nilai tidak sah tampil `—` (bukan `-`).
- `label` event null (payload tanpa status) jatuh ke `status` mentah dari server; keduanya kosong →
  `—`. Klien tidak menerjemahkan status.
- `slice(0, 10)` di komponen, bukan di halaman, supaya kedua pemakai sama.

Verifikasi:
- `npm run build` → exit 0, `✓ built in 6.79s` (ulang setelah rapikan komentar docblock:
  `✓ built in 8.90s`); chunk bersama
  `public/build/assets/ShippingEvents-DBlSLl_m.js`; `History-DMOGwHDd.js` 11.80 kB,
  `CheckoutSuccess-DIa4LH7E.js` 10.72 kB.
- Cek render tanpa browser: `tmp/cek-shipping-events.mjs` (esbuild + `react-dom/server`) → 15 cek
  lulus: `events` `[]`/`null`/bukan array tidak dirender; judul + `<ol>`; label server dipakai;
  label null → status; waktu null → `—`; format `26 Okt 2026`; titik pertama `bg-brand`, sisanya
  `bg-slate-300`; 12 event menjadi 10 baris urutan server.
- `python tmp/cek-komponen-tanpa-import.py .` → 103 berkas, hanya 2 false positive lama
  (`app.jsx: App`, `Reveal.jsx: Tag`).
- `python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` → hanya temuan lama
  `DropzoneGalery-*.js -> FREE: P` (false positive terdokumentasi).
- Belum diuji di browser: server pemilik tidak dinyalakan. QA: buka `/history` dengan pesanan
  berstatus `selesai` + ≥2 event (verifikasi node Selesai bertanggal, daftar terbaru di atas), lalu
  pesanan tanpa event (tidak ada judul "Riwayat pengiriman"), dan `/checkout/{order}/selesai`
  dengan event. Cek 360 px (satu kolom, waktu di baris kedua, label tidak terpotong), 768 px
  (timeline horizontal, baris event), keyboard (tidak ada kontrol baru), zoom 200%.

Handoff QA: props yang dipakai hanya `shipping.events` (bentuk `{status,label,at}`) dan
`timeline.completed_at`; keduanya boleh kosong/null tanpa galat. Tidak ada tombol/link baru di
daftar event. Halaman admin tidak disentuh kartu ini (F2 sudah selesai di t_0412c9c4).

## F2 v1.5 — TimelinePesanan, timeline selesai, filter riwayat (t_85a16600)

Sumber: `docs/design-v1.5.md` §2–§4, `docs/brief-v1.5-frontend.md` F2, `docs/kontrak-props.md` §13
(revisi aditif v1.5). Rencana: satu komponen bersama + dua halaman; tanpa dependency baru.

Berkas:
- `resources/js/Components/TimelinePesanan.jsx` (baru) — `function Timeline` lama dipindah dari
  `History.jsx` apa adanya; titik 10 px diganti ikon 20 px (`BoxIcon`/`WalletIcon`/`TruckIcon`/
  `CheckIcon`, node `batal`/`expire` tetap titik `bg-danger`). Props `{status, paymentStatus, timeline}`.
- `resources/js/Pages/Public/History.jsx` — impor `Field`/`Select`/`TimelinePesanan`, hapus
  `function Timeline` lokal, filter status tepat setelah `</header>`.
- `resources/js/Pages/Public/CheckoutSuccess.jsx` — kartu "Status pesanan" sebelum `Ringkasan
  Pesanan`, hanya bila `pesanan.timeline` ada.

Validasi tiga arah:
- PRD/desain vs desain: §4 hanya filter status di `/history` (bukan pencarian/tanggal); §3 hanya
  kartu timeline di halaman selesai. Tidak ada fitur lain yang diambil.
- Desain vs kontrak: `filter {status: string|null}` dan `ringkasan` per status sudah dikirim
  `HistoryController`; `orders.meta.total` = hasil filter, `orders.links` `withQueryString()`.
  `timeline` 4 kunci selalu ada di `/history` dan `/checkout/{order}/selesai` — tidak perlu mock.
- Teknis: `Select`/`Field`/`EmptyState`/`InlineNotice`/`Pagination` sudah ada; `router.get`
  dengan `preserveState`/`preserveScroll`. Tidak ada rute/fetch baru.

Keputusan kecil:
- Nilai `Select` = `filter?.status ?? 'semua'` (URL sumber kebenaran, tanpa state lokal); opsi
  selalu enam walau 0, angka dari `ringkasan` (global, tidak ikut filter).
- `ubahFilter` selalu halaman 1 (`{status}` tanpa `page`), `preserveScroll: true`; paginasi
  mengirim `{page, status}` (tanpa `page` bila 1).
- `Coba lagi` memakai `muat(currentPage)` existing sehingga status aktif ikut (design §4).
- Kosong karena filter → `EmptyState` khusus + aksi "Tampilkan semua pesanan"; kosong total tetap
  "Belum ada pesanan.". Kontrol filter tidak dirender bila prop `filter` absen atau
  `ringkasan.total === 0`.
- `/checkout/{order}/selesai` hanya mengirim `timeline` ke komponen (tanpa `status`/`paymentStatus`)
  sesuai design §3 — tanpa node terminal, karena halaman hanya untuk pesanan dibayar.

Verifikasi:
- `npm run build` → exit 0, `✓ built in 5.04s`; `History-DFudqNEb.js` 12.09 kB,
  `CheckoutSuccess-Bi5KmxFc.js` 10.99 kB.
- `tmp/cek-timeline-pesanan.mjs` (esbuild + `react-dom/server`) → 16 cek lulus: `timeline` null →
  4 node redup + `—`; parsial → 1 aktif/3 redup tanpa crash; `batal` → node merah menggantikan
  node belum tercapai; `expire` → `Kedaluwarsa`; `selesai` → 4 aktif + 4 waktu; `md:flex-row` ada.
- `python tmp/cek-komponen-tanpa-import.py .` → 104 berkas, hanya 2 false positive lama
  (`app.jsx: App`, `Reveal.jsx: Tag`).
- `python tmp/cek-bundel-identifier-bebas.py public/build/assets public/build` → hanya temuan lama
  `DropzoneGalery-*.js -> FREE: P`.
- Belum diuji di browser (server pemilik tidak dinyalakan). QA: `/history` dengan ≥1 pesanan —
  ganti filter (daftar + hitungan + `Menampilkan N pesanan berstatus …` berubah, URL `?status=`,
  halaman balik ke 1, back/forward mempertahankan filter), filter tanpa hasil (`EmptyState` khusus
  → "Tampilkan semua pesanan"), paginasi halaman 2 dengan filter aktif, `Coba lagi` saat server
  galat; `/checkout/{order}/selesai` sebelum & sesudah `timeline` ada; 360 px kontrol penuh +
  timeline vertikal, 768 px timeline horizontal; keyboard (Tab ke Select, fokus tidak hilang saat
  memuat); zoom 200%.

## F1 v1.5 (t_6831e8b1) — dropdown ekspedisi di `/checkout`

Perubahan: `resources/js/Pages/Public/Checkout.jsx` saja.

- Daftar radio + kartu + badge per baris diganti satu `Field` + `Select` native ber-`optgroup`
  (design-v1.5 §1); tanpa `new dependency`, tanpa perubahan backend/rute.
- Nilai opsi `courier_code|service_code` (pemisah `|`); `cariOpsi` mencocokkan kedua kode, bukan
  teks. `nilaiOpsi` = `''` bila belum ada pilihan; tidak ada auto-pilih.
- `grup` mengelompokkan per `courier_code` dengan urutan kemunculan pertama (urutan server, tanpa
  sortir); label `courier_name`, fallback `courier_code`.
- `teksOpsi`: `service_name` (fallback `service_code`) · `etd || '—'` · `rupiah(cost)`/`GRATIS`.
- Ringkasan pilihan di bawah kontrol (`role="status" aria-live="polite"`): layanan + `etd`, harga
  teks `GRATIS`/`Rp…`, badge `Reguler`/`Gratis Ongkir`, catatan "Layanan ini tidak termasuk gratis
  ongkir." pindah dari kartu per baris ke ringkasan ini.
- `pilihOpsi` existing dipakai apa adanya: `shipping_courier`/`shipping_service`/`shipping_cost`
  (`gratis === true` → `0`, tanpa pilihan → `null`).
- Keadaan `menunggu`/`memuat`/`kosong`/`galat`/`timeout`/`galatKonfig` dan aturan `modeFake` tidak
  diubah. Submit tanpa pilihan: `gulirKe('judul-pengiriman', { fokus: false })` lalu fokus
  `#pilih-layanan` (`preventScroll`).

Verifikasi:
- `npm run build` → exit 0.
- `tmp/uji-dropdown-checkout-t_6831e8b1.mjs` (esbuild + shim React/Inertia + fetch tarif palsu) →
  6 uji lulus: struktur `Select`/`optgroup`/`placeholder disabled` + `aria-describedby` ke hint;
  teks opsi (`REG · 2-3 hari · Rp18.000`, `YES · 1-1 hari · GRATIS`, etd null → `—`) dan urutan
  grup; tiga field terkirim benar; ringkasan + badge + catatan non-reguler; `shipping_cost 0` untuk
  layanan gratis; submit ditolak tanpa pilihan (gulir + fokus) sementara `modeFake` tetap lolos;
  memuat/kosong/galat tetap tanpa `Select`.
- Grep `type="radio"|accent-brand|fieldset` di `Checkout.jsx` → 0 hasil.
- Catatan: `tmp/uji-aksi-checkout-t_a98f17d4.*` (kartu lama) sudah usang terhadap halaman sekarang
  (label CTA `Buat pesanan`, notice server 3 titik) — jangan dipakai sebagai bukti; harness kartu ini
  yang berlaku untuk blok pengiriman.
- Belum diuji di browser (server pemilik tidak dinyalakan). QA: `/checkout` dengan alamat + kode pos
  → dropdown ber-grup per kurir, pilih layanan (ringkasan + total berubah), gratis ongkir
  (label `GRATIS`, `shipping_cost` 0), layanan non-reguler (catatan gratis), ubah kode pos (pilihan
  reset), submit tanpa memilih (halaman menggulir ke Pengiriman + fokus ke dropdown), 360 px
  (dropdown penuh, teks panjang terpotong native), keyboard (Tab/Space/panah, fokus terlihat),
  zoom 200%.

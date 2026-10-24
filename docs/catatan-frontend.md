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

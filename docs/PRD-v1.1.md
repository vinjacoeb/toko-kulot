# Addendum PRD v1.1 — Permintaan Pemilik 6

> Kartu: `t_8b70141c` (24 Oktober 2026). Status: **mengikat**.
> Addendum ini menang atas `docs/PRD.md` untuk pasal yang disebut di sini.
> Fungsi di luar addendum tetap mengikuti `docs/PRD.md`; tampilan mengikuti `docs/design.md`
> + addendum desain `docs/design-v1.1.md` (dibuat kartu uiux).

## 1. Ringkasan perubahan

| # | Perubahan | Menggantikan PRD v1.0 |
|---|---|---|
| D1 | Checkout menerima **semua metode pembayaran Midtrans** (bank transfer/VA semua bank, QRIS, e-wallet yang aktif di akun), bukan QRIS saja | §4.1, §5.1 `checkout.store`, §7.2, §8, A2 |
| D2 | Ongkir dihitung **real-time dari API Biteship**; pembeli memilih kurir & layanan di checkout | §6 `orders`, §7.2 langkah 4, A1, A15 |
| D3 | **Gratis ongkir** untuk subtotal ≥ **Rp300.000**, hanya layanan **reguler** | A1 |
| D4 | Halaman admin baru **`/admin/ekspedisi`**: asal kirim, kurir aktif, gratis ongkir | §5.2, §9 |
| D5 | Landing page dirombak: tipografi variatif, galeri, "kenapa beli di sini" editorial, micro-interaction, scroll reveal, lazy loading | §10 (tampilan), design §3.3/§5.1 |
| D6 | Galeri landing diisi dari **`/admin/pengaturan` tab Landing** | §9 tab Landing |
| D7 | Teks newsletter/CTA akhir = info **gratis ongkir min. Rp300.000** | design §3.3 butir 9 |

Tidak berubah: dua guard auth, alur keranjang → checkout → bayar → selesai → ulasan, stok,
status order, format uang integer rupiah, larangan `.env` (R3), techlead hanya dokumen (R5).

## 2. D1 — Pembayaran semua bank (Midtrans Snap)

- `MidtransService` membuat transaksi lewat **Snap** (`/snap/v1/transactions`), bukan Core API
  `payment_type=qris`. Metode yang tampil = metode yang **aktif di akun Midtrans pemilik**.
- Halaman `/checkout/{order}/bayar` menampilkan ringkasan tagihan + tombol
  **"Pilih Metode Pembayaran"** yang membuka halaman Snap (`redirect_url`) atau popup Snap.
  Setelah kembali, halaman memantau status seperti sekarang (polling 5 detik).
- Webhook `/midtrans/notification` tetap satu pintu: verifikasi `signature_key`, idempoten,
  simpan `payment_type` (mis. `bank_transfer`, `echannel`, `qris`, `gopay`) di `payments`.
- `orders.payment_method` diisi dari `payment_type` saat settlement; sebelum itu nilai
  `midtrans`. Label yang tampil ke pembeli/admin: `Transfer Bank`, `QRIS`, `E-Wallet`,
  atau `Midtrans` bila belum diketahui.
- **Mode fake wajib tetap jalan** tanpa kredensial: tampilkan panel simulasi (QRIS dummy
  seperti sekarang) + tombol "Simulasikan pembayaran berhasil" yang menandai payment
  `settlement` lewat jalur service yang sama (bukan query langsung dari frontend).
- Pemilik wajib mengaktifkan kanal bank transfer/VA di dashboard Midtrans. Bila kanal belum
  aktif, Snap hanya menampilkan yang aktif; pesan galat harus menyebut kanal belum aktif,
  bukan "coba lagi".

**Acceptance criteria D1**

1. Diberikan pembeli login dengan keranjang terisi, ketika checkout disubmit, maka order dibuat
   dan respons mengarah ke halaman bayar dengan tombol menuju Snap.
2. Diberikan notifikasi Midtrans `bank_transfer`/`echannel` dengan signature valid dan
   `transaction_status=settlement`, ketika webhook diproses, maka `payments.status=settlement`,
   `orders.payment_status=settlement`, `orders.paid_at` terisi, dan stok tidak berkurang dua kali
   saat notifikasi yang sama dikirim ulang.
3. Diberikan `MIDTRANS_FAKE=true`, ketika checkout disubmit, maka halaman bayar tetap tampil
   dan tombol simulasi berhasil mengubah status order menjadi `dibayar`.
4. Tidak ada teks "QRIS satu-satunya metode" di halaman checkout/bayar.

## 3. D2 — Ongkir Biteship

- Endpoint Biteship (server-side, key di `.env` `BITESHIP_API_KEY`):
  - `GET https://api.biteship.com/v1/couriers` — daftar kurir/layanan.
  - `POST https://api.biteship.com/v1/rates/couriers` — tarif; body minimal
    `origin_postal_code`, `destination_postal_code`, `couriers` (koma), `items[]`
    (`name`, `value`, `quantity`, `weight` gram).
- Asal kirim = pengaturan `/admin/ekspedisi` (nama, telepon, alamat, kode pos). Tujuan =
  kode pos + kota dari formulir checkout.
- Berat = Σ(`products.weight_gram` × qty); bila berat produk 0/kosong dipakai **500 gram**
  per unit **[ASUMSI A19]**.
- Alur checkout: pembeli isi alamat + kode pos → tombol **"Cek Ongkir"** memanggil
  `GET /checkout/ongkir?postal_code=...` → daftar layanan (kurir, layanan, harga, ETD)
  → pembeli memilih satu → submit.
- **Harga dari klien tidak dipercaya.** Saat submit, server memanggil ulang Biteship untuk
  layanan yang dipilih dan memakai harga server. Bila tarif berubah/LAYANAN tidak ada:
  tolak dengan pesan "Ongkir berubah, pilih ulang kurir." dan jangan buat order.
- Bila `BITESHIP_API_KEY` kosong: mode `fake` memakai tarif datar `shipping_cost_default`
  (default Rp20.000) berlabel "Tarif uji", agar alur bisa diuji. Bila API gagal saat key ada:
  checkout menampilkan galat dan **tidak** membuat order dengan ongkir tebakan.
- Kolom baru `orders` (migrasi baru, jangan ubah migrasi lama):
  `shipping_courier` string(40) null, `shipping_service` string(60) null,
  `shipping_etd` string(30) null, `shipping_weight_gram` unsigned int null,
  `shipping_is_free` boolean default false.
- `cart.summary` tidak lagi menampilkan ongkir final; tampilkan "Dihitung saat checkout"
  kecuali mode fake.

**Acceptance criteria D2**

1. Diberikan kode pos tujuan valid dan key Biteship terisi, ketika "Cek Ongkir" ditekan,
   maka minimal satu opsi kurir tampil dengan harga integer rupiah dan ETD.
2. Diberikan opsi kurir dipilih, ketika checkout disubmit, maka `orders.shipping_cost`
   sama dengan harga server untuk layanan itu dan `shipping_courier`/`shipping_service` terisi.
3. Diberikan key Biteship kosong, ketika checkout diuji, maka mode fake menampilkan tarif uji
   dan order tetap bisa dibuat.
4. Diberikan API Biteship mengembalikan galat/nihil, ketika submit, maka tidak ada order baru
   dan pembeli melihat pesan yang bisa ditindaklanjuti.

## 4. D3 — Gratis ongkir

- Syarat: `subtotal >= settings.free_shipping_min` (default **300000**) **dan** layanan yang
  dipilih ditandai `is_regular=true` di `/admin/ekspedisi`.
- Bila syarat terpenuhi: `orders.shipping_cost=0`, `shipping_is_free=true`, halaman
  checkout/summary menampilkan **"GRATIS ONGKIR"** dan sisa belanja bila belum mencapai batas.
- Layanan non-reguler (instant, same day, cargo, trucking) **tidak pernah** gratis.
- Diskon lain tidak mengurangi syarat; syarat dihitung dari subtotal sebelum ongkir.

**Acceptance criteria D3**

1. Diberikan subtotal Rp300.000 dan layanan reguler, ketika submit, maka ongkir 0 dan
   `shipping_is_free=true`.
2. Diberikan subtotal Rp299.999 dan layanan reguler, ketika submit, maka ongkir normal.
3. Diberikan subtotal Rp500.000 dan layanan instant, ketika submit, maka ongkir normal.

## 5. D4 — Admin `/admin/ekspedisi`

- Rute: `GET /admin/ekspedisi` (`admin.shipping.index`), `PUT /admin/ekspedisi`
  (`admin.shipping.update`), middleware `admin`, di `routes/admin.php`, menu sidebar admin.
- Isi: asal kirim (nama, telepon, alamat, kode pos), daftar layanan Biteship dengan checkbox
  **aktif** + **reguler**, gratis ongkir (aktif + nominal, default 300000), status mode
  (API asli / tarif uji).
- `BITESHIP_API_KEY` hanya di `.env`; halaman hanya menampilkan status "terisi/kosong",
  tidak pernah menampilkan nilainya.
- Bila daftar kurir Biteship gagal diambil: halaman tetap tampil, tampilkan galat + opsi
  mengisi kode layanan manual (format `courier_code:service_code`), data lama tidak hilang.

**Settings keys baru** (grup `shipping`, tipe sesuai): `shipping_origin_name`,
`shipping_origin_phone`, `shipping_origin_address`, `shipping_origin_postal_code`,
`shipping_couriers` (json), `free_shipping_enabled` (bool), `free_shipping_min` (int).
Bentuk `shipping_couriers`: `[{courier_code, service_code, label, is_regular, is_active}]`.

## 6. D5/D6/D7 — Landing & galeri

- Urutan seksi landing baru: announcement → hero → trust strip → kategori → produk unggulan
  → **galeri** → promo → **kenapa beli di sini (editorial)** → FAQ → CTA/newsletter.
- Galeri: grid asimetris 4–6 gambar, caption tipografis, lazy loading; kosong = seksi
  disembunyikan. Sumber: `settings.landing_gallery` = JSON array maks 8 item
  `{image, caption, alt}`. Diisi dari tab **Landing** `/admin/pengaturan` (unggah gambar
  jpg/png/webp ≤ 2MB + caption ≤ 80 karakter + alt ≤ 120 karakter; bisa hapus/urutkan).
- "Kenapa beli di sini": tipografi besar/bertingkat, minimal 3 item, gambar pendukung diambil
  dari galeri (bukan field baru), layout asimetris, bukan 3 kartu datar.
- Trust strip/keunggulan: bukan baris ikon datar; kartu/garis tipografis dengan aksen,
  tetap ringan (tanpa library animasi baru).
- Micro-interaction: hover kartu/gambar, underline CTA, transisi 150–300ms.
- Scroll reveal: komponen `Reveal` berbasis `IntersectionObserver` (tanpa dependency baru;
  "AOS" dipenuhi sebagai perilaku), hormati `prefers-reduced-motion`.
- Lazy loading: semua gambar below-the-fold `loading="lazy"` + `decoding="async"`;
  hero `eager` + `fetchpriority="high"`. Tidak ada layout shift (width/height atau aspect-ratio).
- Copy newsletter/CTA: "Gratis ongkir untuk belanja min. Rp300.000 — khusus pengiriman reguler."
  (dapat diedit dari tab Landing; nilai seeder memakai kalimat itu).
- Gambar: **jangan mengarang aset**. Pakai placeholder lokal yang ada / [CONTOH] di seeder;
  pemilik mengganti lewat admin.

**Acceptance criteria D5–D7**

1. Halaman `/` pada 360px, 768px, 1280px tanpa horizontal scroll; seksi galeri tampil bila
   `landing_gallery` berisi ≥ 1 gambar, dan hilang bila kosong.
2. Admin dapat mengunggah, menghapus, dan mengurutkan gambar galeri dari tab Landing; setelah
   simpan, gambar tampil di `/` tanpa deploy.
3. Teks CTA akhir memuat "Rp300.000" dan "reguler".
4. Dengan `prefers-reduced-motion: reduce`, tidak ada animasi reveal/transisi panjang.
5. `npm run build` sukses; tidak ada `console.log`, `Lorem ipsum`, atau gambar 404.

## 7. Kontrak rute tambahan

| Method | URI | Name | Keterangan |
|---|---|---|---|
| GET | `/checkout/ongkir` | `checkout.shipping` | JSON opsi ongkir; query `postal_code`, `city` opsional |
| GET | `/admin/ekspedisi` | `admin.shipping.index` | Halaman pengaturan ekspedisi |
| PUT | `/admin/ekspedisi` | `admin.shipping.update` | Simpan asal kirim, kurir, gratis ongkir |

## 8. Asumsi baru

| # | Hal | Asumsi |
|---|---|---|
| A19 | Berat produk kosong/0 | 500 gram per unit |
| A20 | Kurir default | Semua layanan yang aktif di akun Biteship, ditandai reguler oleh admin; default seed: JNE REG, J&T EZ, SiCepat REG, AnterAja REG, Ninja Standard, TIKI REG |
| A21 | Pembayaran | Snap menampilkan semua kanal yang aktif di akun Midtrans; tidak ada filter kanal di kode |
| A22 | Galeri | Maksimal 8 gambar, disimpan di `storage/app/public/landing` |

## 9. Tindakan pemilik (bukan blocker pengembangan)

1. Isi `BITESHIP_API_KEY` di `.env` (dashboard Biteship → API key). Tanpa key, ongkir memakai tarif uji.
2. Isi alamat asal kirim + kode pos di `/admin/ekspedisi` setelah halaman tersedia.
3. Aktifkan kanal **Bank Transfer/VA** (BCA, BNI, BRI, Mandiri, Permata, dll.) di dashboard
   Midtrans produksi. Tanpa aktivasi, kanal tidak muncul di Snap.
4. Ganti gambar galeri/hero dari `/admin/pengaturan` (jangan memakai gambar contoh di produksi).

# Review akhir addendum v1.1 — pembayaran, ongkir, landing

Tanggal: 24 Okt 2026 · Task: `t_fa7510d1` · Acuan: `docs/PRD-v1.1.md`, `docs/design-v1.1.md`, `docs/qa-v1.1.md`.
Metode: baca kode + test + git diff; satu pemeriksaan browser langsung ke server pemilik
(`http://127.0.0.1:8000/`, GET saja). Tidak menyalakan server, tidak migrate, tidak mengubah kode.
Kode tidak diubah oleh review ini; hanya berkas di `docs/`.

## 1. Ringkasan

- Backend v1.1 (Snap semua kanal, Biteship, gratis ongkir, admin ekspedisi, galeri) sesuai PRD dan
  tertutup test. Suite QA: 290 test / 2250 assertion OK (`docs/bukti-qa-v1.1-phpunit.txt`).
- Dua celah di halaman bayar: (a) tombol **"Simulasikan pembayaran berhasil"** tidak ada di UI
  sehingga mode uji tidak bisa diselesaikan dari layar; (b) teks/state panel Snap belum persis
  design §7.2.
- Satu temuan data (bukan kode): teks CTA landing di DB pemilik belum memuat "min." dan "reguler".

## 2. Status acceptance PRD-v1.1 §2–§6

| AC | Status | Bukti |
|---|---|---|
| D1.1 checkout → order + halaman bayar dengan tombol menuju Snap | Lulus | `app/Http/Controllers/CheckoutController.php:79-83`; `tests/Feature/Checkout/CheckoutTest.php:185`; tombol ada `resources/js/Pages/Public/CheckoutPay.jsx:185-192` |
| D1.2 webhook settlement isi payment_type/payment_method/paid_at, stok tak dobel | Lulus | `app/Services/MidtransService.php:460-540`; `tests/Feature/Checkout/QaV11OngkirPembayaranTest.php:120`; `tests/Feature/Checkout/MidtransSnapTest.php:114,147,165` |
| D1.3 mode fake: halaman bayar tampil + tombol simulasi → `dibayar` | **Gagal (UI)** | Backend + test lulus (`routes/web.php:126`; `CheckoutController.php:176-195`; `MidtransSnapTest.php:182`), tetapi tidak ada tombol/kirim POST di frontend: `grep -rn "simulasi" resources/js/` = 0 hasil; panel uji hanya `CheckoutPay.jsx:139-168` |
| D1.4 tak ada teks "QRIS satu-satunya metode" | Lulus | `resources/js/Pages/Public/Cart.jsx:171` (kartu `t_5648bd43`); QRIS hanya di panel mode uji `CheckoutPay.jsx:158` |
| D2.1 "Cek Ongkir" → opsi kurir + harga + ETD | Sebagian | Mode fake + `Http::fake` lulus (`tests/Feature/Checkout/CheckoutShippingTest.php:135`; `QaV11OngkirPembayaranTest.php:105`); API Biteship asli **belum dicek, butuh key** |
| D2.2 ongkir server-side, kolom courier/service terisi | Lulus | `app/Services/OrderService.php:125-165`; `tests/Feature/Checkout/CheckoutShippingTest.php:191`; `database/migrations/2026_10_24_000002_add_shipping_columns_to_orders_table.php:16-24` |
| D2.3 key kosong → tarif uji, order tetap dibuat | Lulus | `tests/Feature/Checkout/CheckoutShippingTest.php:135,158`; `OrderService.php:59` |
| D2.4 API gagal → tidak ada order + pesan | Lulus | `tests/Feature/Checkout/QaV11OngkirPembayaranTest.php:150` |
| D3.1 subtotal 300.000 + reguler → 0 | Lulus | `tests/Feature/Checkout/QaV11OngkirPembayaranTest.php:170` |
| D3.2 subtotal 299.999 → normal | Lulus | `QaV11OngkirPembayaranTest.php:188` |
| D3.3 non-reguler di atas batas → berbayar | Lulus | `QaV11OngkirPembayaranTest.php:206` |
| D4 rute + middleware admin + sidebar + key tak dibocorkan + fallback manual | Lulus | `routes/admin.php:42,97-100`; `resources/js/Layouts/AdminLayout.jsx:39`; `QaV11OngkirPembayaranTest.php:239,250,262`; kode manual `resources/js/Pages/Admin/Shipping/Index.jsx:481-670`; UI admin di browser **belum dicek** |
| D5.1 `/` 360/768/1280 tanpa scroll horizontal; galeri tampil bila ada isi | Lulus (dicek langsung) | Browser 24 Okt: scrollWidth 360/753/1265 ≤ viewport 360/768/1280; seksi `#galeri` 4 `<figure>`, 4 `img` lazy; kosong → `LandingGallery.jsx:60` `return null`; test `QaV11OngkirPembayaranTest.php:292` |
| D5.2 admin unggah/hapus/urutkan galeri, tampil tanpa deploy | Lulus (kode+test), UI **belum dicek** | `tests/Feature/Admin/AdminLandingGalleryTest.php:69,100,183,197,210`; `resources/js/Pages/Admin/Settings/Index.jsx:341-460,1121-1136` |
| D5.3 teks CTA memuat "Rp300.000" dan "reguler" | **Gagal (data live)** | Live `/` memuat "Gratis ongkir untuk pembelian di atas Rp300.000" (tanpa "min." + "reguler"); seeder sudah benar `database/seeders/SettingSeeder.php:223`; `resources/js/Pages/Public/Home.jsx:37` |
| D5.4 reduced-motion aman | Lulus | `resources/js/Components/Reveal.jsx:32-60`; `docs/bukti-qa-v1.1-browser.txt` |
| D5.5 build sukses, tanpa `console.log`/Lorem/gambar 404 | Lulus | `docs/bukti-qa-v1.1-build.txt` (exit 0); browser: 24 gambar, 0 rusak; `console.log` hanya di skrip dev `resources/js/lib/gallery.check.mjs:27` (tidak ikut bundel) |

## 3. Temuan dan kartu perbaikan

| # | Temuan | Bukti | Dampak | Kartu |
|---|---|---|---|---|
| R1 | Tombol "Simulasikan pembayaran berhasil" tidak ada di halaman bayar mode uji | PRD-v1.1:35-37,50-51; design-v1.1:546-553; `CheckoutPay.jsx:139-168`; grep `simulasi` di `resources/js/` = 0 | Pemilik (tanpa key Midtrans) tidak bisa menuntaskan satu pesanan dari UI; QA AC3 hijau hanya di level endpoint | t_01d11ad9 (frontenddeveloper) |
| R2 | Panel Snap belum persis design §7.2: label tombol "Lanjut ke Pembayaran" (harus "Pilih Metode Pembayaran"); state `snap_redirect_url` kosong/galat tanpa tombol "Muat Ulang"/"Hubungi Penjual" | design-v1.1:524,528-535; `CheckoutPay.jsx:185-192,198-201` | Teks tidak sesuai kontrak desain; pembeli tanpa jalan pulih saat tagihan gagal dibuka | t_8827a623 (frontenddeveloper) |
| — | CTA live belum memuat "min." + "reguler" | lihat D5.3 | Teks landing tidak sesuai PRD §6 | **bukan kartu**: data pemilik, perbaiki dengan simpan ulang tab Landing |

Catatan: temuan QA-V11-01 (copy keranjang "Pembayaran QRIS") sudah diperbaiki di `t_5648bd43`
dan diverifikasi — `Cart.jsx:171`, grep di halaman publik = 0.

## 4. Belum dicek (butuh pemilik/browser/kredensial)

1. Snap sandbox nyata (butuh `MIDTRANS_SERVER_KEY`/`CLIENT_KEY`); alur kembali dari Snap ke halaman bayar.
2. Biteship API asli (butuh `BITESHIP_API_KEY`) — tarif, ETD, dan perilaku 402/kanal.
3. UI admin `/admin/ekspedisi` dan tab Landing di browser (butuh login admin).
4. Halaman `/keranjang`, `/checkout`, dan `/checkout/{order}/bayar` di browser (butuh login pembeli).

## 5. Aksi pemilik

1. Simpan ulang tab **Landing** di `/admin/pengaturan` agar CTA berbunyi "Gratis ongkir untuk
   belanja min. Rp300.000 — khusus pengiriman reguler." (atau sunting manual).
2. Isi `BITESHIP_API_KEY`, lalu isi asal kirim + aktifkan kurir reguler di `/admin/ekspedisi`.
3. Isi berat (`weight_gram`) tiap produk; tanpa itu semua unit dihitung 500 g (`CartService.php:288`).
4. Setelah 2 kartu perbaikan selesai: uji asap satu pesanan mode uji (tombol simulasi) lalu satu
   pesanan Snap sandbox.
5. Jangan commit `.env`. Status: `.env` tidak terlacak git dan tidak berubah; hanya
   `.env.example` yang bertambah placeholder `BITESHIP_API_KEY=` (memang bagian fitur).

## 6. Risiko

- Ongkir asli belum pernah diuji dengan key → tarif/ETD bisa berbeda dari asumsi; risiko sedang.
- Mode uji tanpa tombol simulasi membuat uji penerimaan pemilik bergantung pada 1 kartu R1.
- Label `GRATIS ONGKIR` tampil sebagai chip "Gratis Ongkir" di ringkasan (`Checkout.jsx:424`) —
  kapitalisasi mengikuti komponen `Badge`; bukan blocker.

## 7. Rekomendasi

**GO BERSYARAT.** Rilis layak setelah: (1) R1 selesai (wajib — tanpa itu mode uji buntu),
(2) R2 selesai (kecil), (3) pemilik menyimpan ulang teks Landing, (4) uji asap Snap sandbox +
Biteship dengan key asli. Keputusan akhir di pemilik.

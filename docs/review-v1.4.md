# Review akhir v1.4 — ongkir, status tanpa ubah manual, timeline Biteship

Kartu `t_f57a3723` · 26 Okt 2026 · techlead · Lingkup: `docs/PRD-v1.4.md`,
`docs/design-v1.4.md`, `docs/kontrak-props.md` §12.16–§12.18a & §13, `docs/qa-v1.4.md`,
working tree v1.4.
Aturan yang saya patuhi: hanya menulis `docs/`, tidak mengubah kode, tidak menjalankan
artisan/migrate/composer/npm, `.env` tidak dibaca/diubah.

## 1. Keputusan

| Bagian | Keputusan | Alasan singkat |
|---|---|---|
| F11 — dasar ongkir sama Biteship | **LULUS di kode**, tarif nyata belum dicek | Satu fungsi berat, tanpa minimum 500 g, tarif tanpa `destination_city`, log tarif, dan create order kini memakai snapshot `orders.shipping_weight_gram`. Perbandingan dengan `order.price` nyata butuh key + saldo pemilik. |
| F12 — hapus ubah status manual | **LULUS** | Rute/controller/request/prop/model method hilang; sisa kode `changeStatusByAdmin()` + copy "ubah status" sudah dibersihkan (QA-14-01/03 tutup). |
| F13 — riwayat & timeline pembeli | **LULUS di test/props/kode**, tampilan belum diuji | Append idempoten + cap 50, props pembeli `shipping.events` + `timeline.completed_at`, komponen `ShippingEvents`. Browser (360 px/kontras) belum dicek. |
| F14 — token webhook | **LULUS (tidak berubah)** | `config('biteship.webhook_token')`, 403/422/200 terkunci test; isi `.env` milik pemilik, tidak saya baca. |
| Temuan QA-14-01/02/03 | **TUTUP di putaran 1** | Ketiganya mendarat di repo dan suite hijau setelah perbaikan (§4). Tidak perlu putaran 2. |
| Rilis v1.4 | **GO BERSYARAT — belum boleh diumumkan** | Syarat wajib: migrasi kolom `shipping_events` di DB pemilik; tanpa itu setiap webhook cocok akan 500 (§7 R1). |
| Keputusan rilis akhir | **Pemilik** | Syarat & bukti di §8. |

## 2. Yang saya periksa sendiri (bukan mengutip QA)

- Suite penuh **sebelum** perbaikan mendarat: `php -d extension=pdo_sqlite -d extension=sqlite3
  vendor/phpunit/phpunit/phpunit < /dev/null` → **OK (356 tests, 2986 assertions)**, 1 m 5,7 s —
  sama dengan klaim QA.
- Suite penuh **sesudah** ketiga kartu perbaikan selesai (state final, mtime berkas stabil
  18:58:27): → **OK (359 tests, 3006 assertions)**, 51,0 s (+3 test baru QA-14-02).
- HTTP baca-saja ke server pemilik (`curl -o /dev/null -w %{http_code}`): `/` 200, `/produk` 200,
  `/keranjang` 200, `/admin/pesanan` (guest) 302, `/admin/login` 200.
- Build **tidak** saya jalankan (aturan kartu melarang `npm`). Bukti tidak basi:
  `public/build/manifest.json` 2026-10-26 18:46 dan `find resources/js -name '*.jsx' -newer
  public/build/manifest.json` kosong → bundle memuat UI v1.4. QA mencatat `npm run build` exit 0.
- Baca kode: `BiteshipService.php:68-160,547-600,702-760,805-826` (`beratUnit`, `bagiBerat`/
  `deltaBerat`, `orderPayload`, `shippingEvents`, `shippingCompletedAt`, `shippingTindakan`),
  `BiteshipWebhookService.php:108-158`, `HistoryController.php:110-115`,
  `OrderService.php:44-99` (berat + log tarif), `routes/admin.php:142`,
  `Order.php:159,177` (fillable + cast `shipping_events`),
  migrasi `2026_10_26_000006_add_shipping_events_to_orders_table.php`,
  `resources/js/Components/ShippingEvents.jsx`, `Pages/Public/History.jsx:157,440`,
  `Pages/Public/CheckoutSuccess.jsx:284-285`, `Pages/Admin/Orders/Show.jsx:20`.
- Grep pembuktian: `nextStatuses`/`changeStatusByAdmin`/`restoreStock` di `app`+`tests` → kosong;
  `status_berikut` hanya sisa satu assert test; `ubah status` hanya komentar; `app/Exceptions` kini
  hanya `CheckoutException.php`.
- Tidak saya ulang (batas techlead): `php artisan migrate:status`/query DB pemilik, `npm`,
  login admin/pembeli, panggilan Biteship nyata. Lihat §6.

## 3. Lulus (dengan bukti)

| Butir | Hasil | Bukti |
|---|---|---|
| Satu dasar berat, tanpa minimum 500 g | Lulus | `BiteshipService.php:68-71`; tarif & `orders.shipping_weight_gram` dari fungsi sama `OrderService.php:50-53,83`; test `OngkirV14Test.php:90,113` |
| Body tarif tanpa `destination_city` | Lulus | `BiteshipService.php:302-345`; test `OngkirV14Test.php:108` |
| Asal kirim belum lengkap → tolak tanpa panggil API | Lulus | test `OngkirV14Test.php:185` (`Http::assertNothingSent`) |
| Log `Biteship tarif dipakai` satu baris per order, tanpa token | Lulus | `OrderService.php:89-99`; test `OngkirV14Test.php:159` |
| Berat create order = snapshot order (termasuk produk diubah/dihapus) | Lulus | `BiteshipService.php:547-580` (`bagiBerat`); test `OngkirV14Test.php:201,230,260` |
| `order.price` tidak mengubah uang/stok | Lulus | `BiteshipWebhookService.php:117-120`; test `BiteshipWebhookTest.php:132` |
| Rute ubah status hilang (404) | Lulus | `routes/admin.php:142` (komentar penghapusan); test `AdminSalesTest.php:128`; live 404 dilaporkan QA |
| Tanpa tombol/modal/prop "Ubah status" | Lulus | grep `resources/js` bersih (hanya komentar `Show.jsx:20`); bundle 18:46 |
| Webhook tetap memajukan status | Lulus | `BiteshipWebhookService.php:109-115,161+`; test `BiteshipWebhookTest.php:72,95` |
| `shipping_events` append idempoten, urut lama→baru, cap 50 | Lulus | `BiteshipWebhookService.php:122-129,142-158`; test `TimelineV14Test.php:67,82,96` |
| Props pembeli `shipping.events` (terbaru→terlama, label) + `completed_at` | Lulus | `BiteshipService.php:702-760`; `HistoryController.php:110-115`; test `TimelineV14Test.php:115,139,160,178` |
| UI timeline 4 node + daftar riwayat maks 10, kosong → tidak dirender | Lulus (kode) | `ShippingEvents.jsx:29-40`; `History.jsx:157,440`; `CheckoutSuccess.jsx:284-285` |
| Webhook: token salah 403, body rusak 422, probe 200 | Lulus | `BiteshipWebhookTest.php:273-342` di suite 359 |
| Regresi v1.3 (resi manual/otomatis, Midtrans, filter, riwayat) | Lulus | suite penuh 359 test; live 200/302 pada §2 |
| Dokumen pendukung (DoD §4.4) | Lulus | `docs/db.md:39,104`; `docs/kontrak-props.md:802,1861,2097-2098,2112`; `docs/catatan-backend.md:1961+` |

## 4. Temuan QA v1.4 — semua tutup di putaran 1

| ID | Status | Verifikasi saya |
|---|---|---|
| QA-14-01 `t_eb2b12f9` | **Tutup** | `changeStatusByAdmin()`/`restoreStock()` hilang dari `OrderService.php`; `OrderStatusException.php` ikut dihapus; komentar `CheckoutTest.php:581-583` diperbarui; grep `nextStatuses` di `app`+`tests` kosong; suite 359 OK |
| QA-14-02 `t_65362988` | **Tutup** | `orderPayload()` kini dari `orders.shipping_weight_gram` (`BiteshipService.php:552-557`); 3 test baru: berat produk diubah (900 g) dan produk dihapus tetap kirim total 500 g (`OngkirV14Test.php:201,230`), banyak baris (`:260`) |
| QA-14-03 `t_4eb06cea` | **Tutup** | `shippingTindakan()` tanpa ajakan ubah status (`BiteshipService.php:805-826`); pesan `Kurir melaporkan paket dikembalikan.`; test `ShippingPropsV13Test.php:175` disesuaikan |

Tidak ada putaran kedua dan tidak ada `kanban_block`.

## 5. Temuan baru review ini (tidak ada defect kode)

- **TL-14-01 — dokumen tidak sinkron (bukan kode).** `docs/catatan-backend.md:1973` menulis
  migrasi `2026_10_24_000005` **juga** masih `Pending`, sedangkan `docs/qa-v1.4.md:22` hanya
  melaporkan `000006` Pending. Saya tidak bisa memutuskan yang benar (artisan/DB di luar batas).
  Dampak: langkah pemilik harus memastikan **kedua** migrasi `Applied` — lihat §8 butir 1.
- **TL-14-02 — higiene board.** Tiga kartu perbaikan QA dibuat dengan workspace `scratch` (folder
  kosong), tetapi worker menulis langsung ke repo (`app/Services/*.php`, 3 berkas test berubah
  18:56–18:58). Hasilnya benar dan sudah saya uji ulang, tetapi catatan board tidak mencerminkan
  lokasi kerja. Tidak ada aksi sekarang; untuk gelombang berikutnya kartu perbaikan harus memakai
  workspace `dir C:\Users\LENOVO\Downloads\toko-kulot`.
- **TL-14-03 — status kontrak.** Revisi `docs/kontrak-props.md` §7.9 dan §12.17 masih berlabel
  **DRAFT**. Saya terima; finalkan saat rilis.
- **TL-14-04 — working tree belum di-commit.** 71 berkas modified + 71 untracked, termasuk
  migrasi `000003`–`000006`. Rilis tidak boleh dari working tree; commit dulu (pemilik/devops).
- **TL-14-05 — rendah, diterima.** `bagiBerat()` + `deltaBerat()` ±60 baris (greedy + DP ±3 unit)
  hanya untuk membagi total berat ke baris; total terjaga dan ada `Log::warning` bila meleset.
  Tidak perlu refactor sekarang; bila `order_items` kelak menyimpan snapshot berat, keduanya bisa
  dihapus.

## 6. Belum dicek (dengan alasan)

| Butir | Alasan |
|---|---|
| Status migrasi `000005`/`000006` di DB pemilik | `artisan`/DB pemilik di luar batas techlead; bukti QA + kode konsisten |
| Tarif website vs `order.price` nyata (F11 DoD §2.3 butir 6) | Butuh `BITESHIP_API_KEY` + saldo pemilik; tidak boleh memakai key |
| Tampilan timeline & riwayat di browser (360 px, kontras, keyboard, 10 entri) | Butuh browser + sesi pembeli dengan pesanan ber-event; kolom `shipping_events` belum ada di DB pemilik |
| Event tersimpan, dedupe & cap 50 pada data nyata | Butuh migrate + webhook asli |
| Webhook asli dari dashboard Biteship | Hanya pemilik yang bisa memicu event |
| `npm run build` ulang oleh techlead | Aturan kartu melarang `npm`; bukti kesegaran bundle di §2 |
| Login admin/pembeli & props live | Kredensial milik pemilik; QA sudah memeriksa props lewat HTTP |

## 7. Risiko tersisa

| ID | Risiko | Bukti | Mitigasi |
|---|---|---|---|
| R1 | **Kolom `shipping_events` belum ada di DB pemilik → setiap webhook cocok menulis kolom itu → SQLSTATE 42S22 → 500, status pesanan tidak maju dan `shipping_*` tidak tersimpan** | `BiteshipWebhookService.php:122-129`; migrasi `000006` Pending (QA) | Jalankan `php artisan migrate` sebelum webhook dipakai (syarat 1). P3 `pertanyaan-pemilik-v1.4.md` sudah saya perjelas |
| R2 | F11 belum terbukti dengan data nyata; bisa jadi selisih 62k vs 11k punya sebab lain di luar tiga pembeda yang diperbaiki | PRD-v1.4 §2.1 [DUGAAN]; §2.3 butir 6 | Pesanan uji + log + `order.price` (syarat 2); bila masih beda, buka kartu baru dengan data nyata |
| R3 | Timeline belum dilihat mata manusia (urutan, 360 px, kontras, keadaan 10 entri) | §6 | Uji browser setelah migrate (syarat 3) |
| R4 | Berat per baris hasil `bagiBerat` bisa berbeda dari berat produk asli (total tetap sama); hanya memengaruhi rincian berat yang dikirim, bukan uang | `BiteshipService.php:547-580` | Terima; `Log::warning` bila total meleset. Alternatif snapshot per baris dicatat di TL-14-05 |
| R5 | Rilis dari working tree yang belum di-commit (migrasi `000003`–`000006` untracked) | `git status --short` | Commit sebelum deploy (syarat 4) |
| R6 | Pesanan retur/gagal tidak bisa diselesaikan admin dari UI (keputusan F12) | PRD-v1.4 §6 asumsi; P1 | Sudah keputusan pemilik; penyelesaian di luar aplikasi |

## 8. Rekomendasi Go/No-Go

**NO-GO sekarang** — bukan karena kode, tetapi karena migrasi kolom `shipping_events` belum ada di
DB pemilik; tanpa itu webhook Biteship akan gagal 500 (R1).

**GO BERSYARAT** bila syarat berikut terpenuhi:

1. **Wajib sebelum webhook menerima event:** pemilik menjalankan `php artisan migrate` lalu
   mengirim keluaran `php artisan migrate:status` — pastikan `2026_10_24_000005` **dan**
   `2026_10_26_000006` berstatus `Ran`/`Applied`. (TL-14-01: catatan backend menyebut `000005`
   masih Pending, QA hanya menyebut `000006`; jalankan migrate menutup keduanya.)
2. **Sebelum rilis diumumkan:** satu pesanan uji nyata — kirim kode order, isi log
   `Biteship tarif dipakai`, dan payload `order.price`; bandingkan dengan ongkir yang tampil di
   website. Tanpa ini F11 tetap "belum dicek, butuh key/saldo Biteship".
3. **Sebelum rilis diumumkan:** uji browser timeline 4 node + daftar "Riwayat pengiriman"
   (maks 10, terbaru di atas, kosong = tidak ada bagian kosong) di `/history` dan halaman selesai
   bayar, pada 360 px + kontras. Bisa QA setelah migrasi + data uji.
4. **Sebelum deploy:** commit working tree (termasuk migrasi `000003`–`000006`).

Rilis v1.4 (F12, F13, F14 dan dasar F11) sudah aman dari sisi kode: suite 359 test hijau, ketiga
temuan QA tutup. **Keputusan rilis akhir di pemilik.**

## 9. Kartu

- Tidak ada kartu perbaikan baru dari review ini (tidak ada defect kode yang tersisa).
- Tiga kartu QA selesai putaran 1 dan terverifikasi: `t_eb2b12f9`, `t_65362988`, `t_4eb06cea`.

## 10. Batas review ini

Tidak menjalankan server, composer, npm, artisan, atau migrasi; tidak membaca/mengubah `.env`;
tidak mengubah kode aplikasi. Perubahan saya hanya di `docs/` (`review-v1.4.md`, dampak P3 di
`pertanyaan-pemilik-v1.4.md`). Verifikasi ulang yang saya jalankan sendiri ada di §2; seluruh
temuan "hijau" mengacu pada state repo setelah ketiga perbaikan selesai (mtime stabil
2026-10-26 18:58:27).

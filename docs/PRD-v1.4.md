# PRD v1.4 — ongkir aktual, status tanpa ubah manual, timeline Biteship

Status: **berlaku** (26 Okt 2026). Addendum `docs/PRD-v1.3.md`; untuk hal yang disebut di sini,
dokumen ini menang. Sumber: kartu `t_b6a1ee89` (permintaan pemilik).
Desain: `docs/design-v1.4.md`. Nama tabel/kolom ikut `docs/db.md`; kontrak props ikut
`docs/kontrak-props.md` (perubahan di §12.16, §12.17, §13).

## 1. Ringkasan dan keputusan mengikat

| # | Permintaan pemilik | Keputusan |
|---|---|---|
| F11 | Ongkir di website bisa sampai Rp62.000 padahal di Biteship cuma Rp11.000 (`order.price`) | Samakan **dasar hitung** tarif website dan create order Biteship: satu fungsi berat, tanpa minimum buatan, asal kirim konsisten, log bukti tarif. Selisih aktual tetap informasi admin |
| F12 | Di `/admin/pesanan`, hapus ubah status manual (gunakan `order.status`) | Hapus tombol/modal/rute ubah status. Status hanya dari Midtrans (bayar/expire) dan webhook Biteship |
| F13 | Riwayat pembeli ikut Biteship, termasuk timeline; selesai otomatis | Simpan riwayat event pengiriman di `orders.shipping_events`; tampilkan timeline kurir + node `Selesai`; auto-selesai sudah berlaku dari v1.3 |
| F14 | `BITESHIP_WEBHOOK_TOKEN` diisi pemilik di `.env` | Tidak ada perubahan kode; token sudah dibaca `config('biteship.webhook_token')` (PRD-v1.3 §2.1) |

Non-goal: mengubah uang yang sudah ditagih, refund otomatis, polling status Biteship, notifikasi
email/WA, event store terpisah, mengubah pembatalan otomatis Midtrans.

## 2. F11 — Ongkir website vs `order.price`

### 2.1 Masalah

Pemilik melihat ongkir di website sampai Rp62.000 untuk pesanan yang di Biteship hanya Rp11.000
(`order.price`). Penyebab pasti **belum terbukti**; yang terbukti dari kode ada tiga pembeda basis
hitung antara tarif checkout dan create order:

1. `OrderService::createFromCart` memakai `max(500, weight_gram)` padahal berat produk seed
   210–440 gram → tarif website bisa dua kali lipat berat nyata.
2. `BiteshipService::orderPayload` memakai berat produk apa adanya (fallback 300 gram) → berat
   yang dikirim saat create order **berbeda** dari berat saat minta tarif.
3. `rates()` mengirim `destination_city` bebas dari formulir; `orderPayload()` hanya memakai
   `destination_postal_code`. Bila dua nilai itu menunjuk area berbeda, tarif dan tagihan aktual
   memakai area berbeda. Asal kirim juga hanya divalidasi 5 angka, tanpa cek konsistensi dengan
   alamat asal.

[DUGAAN] Selisih 62k vs 11k berasal dari satu atau lebih poin di atas, bukan dari markup aplikasi:
kode tidak pernah menambahkan biaya ke tarif Biteship.

### 2.2 Keputusan

- Satu fungsi berat untuk tarif dan create order: jumlah `max(1, weight_gram produk) * qty`,
  fallback 300 gram per unit bila berat produk 0. **Tanpa minimum 500 gram.**
- Berat yang tersimpan di `orders.shipping_weight_gram` = berat yang dikirim ke Biteship.
- Tarif checkout hanya memakai `destination_postal_code`; `destination_city` tidak dikirim ke
  API tarif (tetap disimpan di order untuk tampilan).
- Sebelum memanggil API tarif atau create order, toko menolak bila asal kirim belum lengkap
  (nama, telepon, alamat, kode pos 5 angka, email kontak) — pesan yang sudah ada dipertahankan.
- Setiap tarif yang dipakai untuk membuat order dicatat `Log::info('Biteship tarif dipakai', …)`:
  kode order, kode pos asal/tujuan, berat gram, kurir, layanan, biaya tarif. Tanpa API key/token.
- `order.price` dari webhook tetap **hanya informasi admin** (`price_final`, `price_selisih`);
  `orders.shipping_cost`, `orders.total`, dan `payments.gross_amount` tidak diubah otomatis
  (asumsi PRD-v1.3 §5 dipertahankan). Bila `price_final` berbeda, admin melihat tanda
  `perlu_tindakan` yang sudah ada.

### 2.3 Definition of Done

- Produk 250 gram × 1: berat yang dikirim ke API tarif = 250, bukan 500.
- Berat pada `POST /v1/orders` sama dengan `orders.shipping_weight_gram` untuk order yang sama.
- Body tarif tidak lagi memuat `destination_city`.
- Log memuat satu baris tarif dipakai per order (kode order, berat, kurir, layanan, biaya).
- Test fitur: berat tanpa minimum, berat create order = berat order, log terpanggil.
- Perbandingan nyata tarif website vs `order.price` **belum diuji, butuh key + saldo Biteship
  pemilik**; bukti yang diminta: kode order, isi log, payload `order.price`.

## 3. F12 — Hapus ubah status manual di admin

### 3.1 Keputusan

- Hapus `PATCH /admin/pesanan/{order}/status`, `OrderController@status`,
  `UpdateOrderStatusRequest`, tombol + modal `UbahStatusModal`, prop `status_berikut`, dan
  `Order::nextStatuses()`.
- Status pesanan hanya berubah lewat: Midtrans (settlement → `dibayar`, expire/deny/cancel →
  `batal`) dan webhook Biteship (PRD-v1.3 §2.3: `dibayar`/`diproses` + `picked`/`dropping_off`/
  `delivered` → `dikirim`; `dikirim` + `delivered` → `selesai`).
- `diproses` tetap ada sebagai nilai lama di DB dan filter, tetapi tidak ada lagi jalur yang
  membuat status itu baru.
- Yang **tetap** manual: nomor resi (`PATCH /admin/pesanan/{order}/resi`), buat resi otomatis,
  sinkron pembayaran Midtrans. Filter/ringkasan status di daftar tidak berubah.

### 3.2 Definition of Done

- `/admin/pesanan/{order}` tidak punya kontrol "Ubah status"; tidak ada tautan ke modal.
- Rute lama membalas 405/404 (bukan 200) dan tidak ada tombol di UI.
- Webhook tetap memajukan status; test status webhook lulus tanpa perubahan aturan.
- Test lama yang memakai rute status dihapus/disesuaikan; suite penuh lulus.

## 4. F13 — Riwayat pengiriman & timeline pembeli

### 4.1 Data

- Kolom baru `orders.shipping_events` **json null** (migrasi
  `2026_10_26_000006_add_shipping_events_to_orders_table`). Isi: daftar objek
  `{event, status, at}` urut lama → baru, maksimum 50 entri.
- Setiap webhook yang cocok (`order.status`, `order.price`, `order.waybill_id`) menambahkan satu
  entri. Entri dengan `event`+`status` sama persis dengan entri terakhir **tidak** ditambahkan
  (idempoten). Tidak ada tabel baru.
- `orders.shipping_webhook_payload` tetap menyimpan payload terakhir (tidak berubah).

### 4.2 Props pembeli (aditif)

- `shipping.events`: daftar `{status, label, at}` (label dari `BiteshipService::shippingLabel`,
  `at` ISO 8601). Kosong → `[]`. Hanya bentuk pembeli (bukan `price_final`, dll.).
- `timeline.completed_at`: waktu `delivered` terakhir dari `shipping_events`, atau
  `shipping_updated_at` bila status `selesai`; `null` bila belum selesai.
- Bentuk lama tidak berubah; halaman bayar §7.7 tidak disentuh.

### 4.3 Tampilan

- Riwayat pembeli: timeline utama `Dibuat → Dibayar → Dikirim → Selesai` (node Selesai aktif bila
  `timeline.completed_at` ada). Di bawahnya daftar "Riwayat pengiriman" berisi event kurir
  terbaru → terlama (maks 10 tampil), status + waktu; tidak dirender bila `events` kosong.
- Halaman selesai bayar: daftar event yang sama (bila ada), tanpa timeline utama baru.
- Tidak ada tombol aksi pembeli; data berubah setelah halaman dimuat ulang (tanpa polling).

### 4.4 Definition of Done

- Dua webhook `order.status` identik → satu entri; `picked` lalu `delivered` → dua entri.
- `timeline.completed_at` terisi saat `delivered` pada pesanan `dikirim` (auto-selesai).
- Riwayat & halaman selesai merender event; tanpa event tidak ada bagian kosong.
- Test fitur: append, dedupe, cap 50, props pembeli, auto-selesai.
- `docs/db.md`, `docs/kontrak-props.md` (§13), `docs/catatan-backend.md` diperbarui.

## 5. Tindakan pemilik

1. `BITESHIP_WEBHOOK_TOKEN` sudah diisi pemilik (dinyatakan di kartu); techlead tidak membaca `.env`.
2. Jalankan `php artisan migrate` untuk kolom `shipping_events`.
3. Setelah rilis: buat satu pesanan uji, kirim kode order + isi log `Biteship tarif dipakai` +
   payload `order.price` bila ongkir masih berbeda jauh. Tanpa data ini F11 berstatus
   "belum dicek, butuh key/saldo Biteship".
4. Daftarkan ulang URL webhook di dashboard Biteship bila tunnel berubah (PRD-v1.3 §4).

## 6. Asumsi

- [ASUMSI] `order.price` adalah ongkir yang ditagih Biteship untuk layanan yang dipilih, bukan
  harga barang.
- [ASUMSI] "Auto mengikuti Biteship" berarti data berubah tanpa aksi admin/pembeli; halaman
  diperbarui saat dimuat ulang, bukan realtime.
- [ASUMSI] Menghapus ubah status manual berarti pesanan yang paketnya retur/gagal tidak bisa
  dibatalkan admin dari UI; penyelesaiannya di luar aplikasi (lihat pertanyaan pemilik).
- [ASUMSI] `shipping_events` maksimum 50 entri cukup (satu paket normal < 15 event).

## 7. Urutan kartu

B3 (hapus status manual, backend) → F2 (hapus UI status) paralel dengan B1 (ongkir) → B2 (timeline)
setelah B1 → F1 (timeline UI) setelah B2 → QA setelah F1+F2+B1+B2 → review Tech Lead terakhir.
Peta: `docs/traceability-v1.4.md`.

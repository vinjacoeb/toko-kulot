# PRD v1.2 — Tambahan & perbaikan pemilik, bagian 2

Status: **berlaku** (24 Okt 2026). Dokumen ini addendum `docs/PRD-v1.1.md`; untuk hal yang
disebut di sini, dokumen ini menang. Sumber: kartu `t_10766b7f` (8 permintaan pemilik).
Desain menyusul di `docs/design-v1.2.md` (kartu UIUX). Nama tabel/kolom ikut `docs/db.md`.

## 1. Ringkasan dan keputusan mengikat

| # | Permintaan pemilik | Keputusan |
|---|---|---|
| F1 | Jangan pakai popup Snap; pilihan Midtrans masih QRIS saja; pakai desain sendiri, tetap Midtrans | Ganti Snap → **Midtrans Core API charge** + halaman bayar sendiri dengan 8 kanal (tabel §2.2) |
| F2 | Alamat & kode pos diisi saat register; ongkir otomatis setelah alamat lengkap, tanpa tombol "Cek Ongkir" | Register menambah `address`, `city`, `postal_code` (wajib); checkout prefill dari profil; tarif diambil otomatis |
| F3 | Setelah bayar jangan lempar ke `example.com/?order_id=...`; status baru muncul otomatis tanpa klik "Cek Status" | Route `GET /midtrans/selesai` + polling halaman bayar yang memuat ulang status sendiri |
| F4 | Tipografi jelek, perbaiki penempatannya | Audit + aturan tipografi mengikat di `design-v1.2.md`, diterapkan ke semua halaman publik |
| F5 | Dropdown ekspedisi: pilih kurir dulu, layanan menyesuaikan | `/admin/ekspedisi` pakai katalog Biteship: dropdown kurir → dropdown layanan |
| F6 | `/admin/pesanan` belum sesuai Midtrans & Biteship | Panel pembayaran (kanal, VA/QR/kode, kedaluwarsa) + panel pengiriman (kurir, layanan, resi, status) |
| F7 | Resi otomatis dari Biteship | Tombol "Buat resi" memanggil Biteship Create Order, simpan `waybill_id` ke `orders.tracking_number` |
| F8 | Riwayat pesanan harus informatif | Riwayat memuat resi, kurir, alamat, rincian biaya, status, dan timeline |

Non-goal fase ini: GoPay/ShopeePay (butuh app + callback), Snap fallback, webhook Biteship,
cetak label, refund otomatis.

## 2. F1 — Pembayaran Midtrans tanpa Snap (Core API)

### 2.1 Alur
1. Checkout membuat order + baris `payments` status `pending` **tanpa** memanggil Midtrans.
2. Halaman `/checkout/{order}/bayar` menampilkan pemilih kanal (kartu radio, desain sendiri).
3. Pembeli memilih kanal → `POST /checkout/{order}/bayar/metode` (`metode` wajib, `Rule::in`).
4. Server memanggil Core API `charge`, menyimpan `payment_type` = id kanal, `order_id_midtrans`,
   `payload` (respons mentah), `expires_at`, `transaction_id`; redirect kembali ke halaman bayar.
5. Halaman bayar menampilkan instruksi sesuai kanal + hitung mundur; polling status tiap 3 detik.
6. Pembeli mengganti kanal saat masih `pending` → charge baru dengan `order_id_midtrans` baru
   (akhiran `-2`, `-3`, …); charge lama dibiarkan kedaluwarsa sendiri.

Charge ulang dengan kanal sama dan belum kedaluwarsa **tidak** dilakukan (idempoten).
Route metode diberi `throttle:10,1`.

### 2.2 Kanal fase 1
| id kanal | Label UI | Payload Core API | Data tampil |
|---|---|---|---|
| `qris` | QRIS (GoPay, OVO, DANA, m-banking) | `payment_type=qris`, `qris.acquirer=gopay` | `qr_url` + `qr_string` |
| `bca_va` | Transfer BCA Virtual Account | `bank_transfer.bank=bca` | `va_number` |
| `bni_va` | Transfer BNI Virtual Account | `bank_transfer.bank=bni` | `va_number` |
| `bri_va` | Transfer BRI Virtual Account | `bank_transfer.bank=bri` | `va_number` |
| `permata_va` | Transfer Permata Virtual Account | `bank_transfer.bank=permata` | `permata_va_number` |
| `mandiri_bill` | Mandiri Bill Payment | `echannel` + `bill_info1/bill_info2` | `biller_code` + `bill_key` |
| `alfamart` | Bayar di Alfamart | `cstore.store=alfamart` | `payment_code` |
| `indomaret` | Bayar di Indomaret | `cstore.store=indomaret` | `payment_code` |

Kanal yang belum diaktifkan di dashboard Midtrans akan ditolak Midtrans; server menampilkan
pesan "Kanal ini belum aktif di Midtrans. Hubungi admin." (bukan error 500) dan menyimpan
`payments.status` tetap `pending` tanpa `order_id_midtrans` baru yang menggantung.
Pemilik wajib mengaktifkan kanal di dashboard (lihat `docs/pertanyaan-pemilik-v1.2.md`).

Masa berlaku: QRIS 5 menit (seperti sekarang), VA/gerai/Mandiri 60 menit
(`MIDTRANS_EXPIRY_VA_MINUTES`, default 60).

### 2.3 Kontrak props `pembayaran` (halaman bayar)
```json
{
  "status": "pending|settlement|expire|deny|cancel",
  "paid_at": null,
  "expires_at": "2026-10-24T12:00:00+07:00",
  "metode": { "id": "bca_va", "label": "Transfer BCA Virtual Account", "grup": "va" },
  "instruksi": { "jenis": "va|qris|bill|gerai", "nomor_va": "123", "bank": "BCA",
                 "biller_code": "7777", "bill_key": "123", "payment_code": "123",
                 "store": "Alfamart", "qr_url": "https://...", "qr_string": "..." },
  "galat": null
}
```
`metode`/`instruksi` bernilai `null` bila pembeli belum memilih kanal. Field instruksi yang
tidak relevan bernilai `null` (jangan dihilangkan). `galat` berisi pesan siap tampil.

### 2.4 Perubahan teknis
- `MidtransApi` mengganti `snap()` dengan `charge(array $params): array`; `status()` tetap.
- `SdkMidtransApi` memakai `CoreApi::charge`; `FakeMidtransApi` mengembalikan fixture per kanal
  (VA, bill, QRIS, gerai) agar QA bisa menguji semua tampilan tanpa kredensial.
- Kolom `payments.snap_token`, `snap_redirect_url` tidak dipakai lagi (tidak dihapus);
  `payments.payment_type` menyimpan id kanal. Tidak ada kolom baru untuk F1.
- `CheckoutController::pay/status/simulate` dan `OrderService::createFromCart` disesuaikan
  (order tidak lagi membuat tagihan Snap saat dibuat).
- Simulasi mode uji tetap ada: tombol "Tandai lunas (mode uji)" hanya untuk tagihan fake.

### 2.5 Definition of Done
- Tidak ada lagi panggilan Snap / `snap_token` baru; `grep -rn "snap(" app/` bersih.
- 8 kanal bisa dipilih di mode uji dan menampilkan instruksi masing-masing.
- Ganti kanal 2× tidak membuat baris `payments` baru dan tidak error.
- Test: charge tiap grup kanal, ganti kanal, kanal ditolak Midtrans, polling status, simulasi lunas.
- `docs/kontrak-props.md` §7.7/§7.8 diperbarui; `docs/catatan-backend.md` diisi.

## 3. F2 — Alamat registrasi & ongkir otomatis

- Form register menambah `address` (wajib, 10–500), `city` (wajib, maks 100),
  `postal_code` (wajib, 5 angka). Kolom `users` sudah ada; tidak perlu migrasi.
- `AuthController::store` menyimpan ketiganya; halaman akun menampilkan (bila belum ada form
  edit profil, cukup tampilkan read-only).
- Checkout mem-prefill `recipient_name` (nama user), `recipient_phone` (bila ada),
  `shipping_address`, `shipping_city`, `shipping_postal_code` dari profil.
- Tombol "Cek Ongkir" **dihapus**. Tarif diambil otomatis 600 ms setelah kode pos 5 angka dan
  alamat terisi; request lama dibatalkan (`AbortController`); hasil di-cache per kode pos selama
  halaman terbuka; ada status memuat, galat + "Coba lagi", dan daftar kosong yang jelas.
- Ganti kode pos → daftar tarif lama dikosongkan dan pilihan kurir di-reset.
- Submit tetap memvalidasi ulang tarif (perilaku v1.1 §6.6 dipertahankan).
- DoD: prefill terisi untuk user lama; user baru tanpa alamat diarahkan melengkapi; tanpa klik
  apa pun tarif muncul; tidak ada request ganda saat mengetik cepat.

## 4. F3 — Selesai bayar & status otomatis

- `GET /midtrans/selesai` (publik, tanpa auth): membaca `order_id` dari query, mencari
  `payments.order_id_midtrans` persis, sinkronkan status (best effort), lalu redirect ke
  `checkout.pay` milik order. Order tidak dikenal → redirect `/` + flash error, bukan 404.
- Halaman bayar: polling 3 detik selama `pending`; saat tab kembali aktif (`visibilitychange`)
  langsung polling. Saat status berubah, halaman **memuat ulang sendiri** (tanpa klik) sehingga
  status baru tampil; bila `settlement`, tampil status lunas + tautan "Lihat pesanan" dan
  otomatis pindah ke `checkout.success` setelah 5 detik.
- Tombol "Cek status" manual boleh tetap ada sebagai cadangan, tetapi bukan syarat.
- Pemilik mengganti *Payment Finished Redirect URL* Midtrans ke `{APP_URL}/midtrans/selesai`
  (tindakan pemilik; dicatat di `docs/pertanyaan-pemilik-v1.2.md`).
- DoD: setelah simulasi lunas, halaman berubah sendiri ≤ 3 detik; membuka
  `/midtrans/selesai?order_id=...` mendarat di halaman bayar order yang benar.

## 5. F4 — Tipografi (penilaian + perbaikan)

UIUX menilai implementasi sekarang terhadap `docs/design-v1.1.md` §2.2 dan menulis
`docs/design-v1.2.md` §Tipografi: skala yang diizinkan (hanya 3 tier + `text-sm` untuk meta),
rasio heading, line-height, panjang baris maks 65ch, ritme spasi 4/8, pemakaian
uppercase/letter-spacing hanya untuk eyebrow, harga `tabular-nums`, dan perataan label–nilai.
Sertakan daftar pelanggaran nyata (`path:baris`) + contoh sebelum/sesudah (teks, bukan gambar).
Frontend menerapkan ke halaman publik: `/`, katalog, detail produk, keranjang, checkout, bayar,
riwayat, akun. Admin hanya bila menyentuh komponen bersama.
DoD: tidak ada ukuran font ad-hoc di luar skala; tidak ada paragraf > 65ch; checklist QA §12
design-v1.2 lulus.

## 6. F5 — Admin ekspedisi: dropdown kurir → layanan

- Sumber daftar: katalog Biteship (`GET /v1/couriers`), di-cache 24 jam di server; bila gagal,
  dropdown memakai daftar kurir yang sudah tersimpan + input manual (halaman tidak boleh mati).
- Form tambah layanan: dropdown **Kurir** (kode + nama) → dropdown **Layanan** (terfilter kurir,
  tampil kode + nama + estimasi) → tombol Tambah. Baris tersimpan tetap seperti sekarang
  (kurir, layanan, aktif, tarif gratis ongkir bila ada).
- Validasi server: `courier` dan `service` wajib, maks 30, hanya dari katalog bila katalog
  tersedia.
- DoD: memilih kurir mengosongkan/mengisi ulang dropdown layanan; duplikat kurir+layanan ditolak
  dengan pesan jelas; halaman tetap bisa dipakai saat API Biteship gagal.

## 7. F6 — `/admin/pesanan` sesuai Midtrans & Biteship

Halaman detail pesanan menampilkan:
- **Pembayaran**: label kanal, status Midtrans, `transaction_id`, nomor VA / bill key+biller code /
  kode gerai / QR (tautan), waktu kedaluwarsa, waktu lunas, tombol "Sinkronkan status".
- **Pengiriman**: kurir + layanan + estimasi + berat + ongkir, `tracking_number`, status Biteship,
  tombol "Buat resi otomatis" (F7) dan input resi manual (tetap ada).
- Daftar pesanan menambah kolom Kurir/Resi dan filter status pengiriman; label metode pembayaran
  memakai nama kanal, bukan `midtrans` mentah.
- DoD: semua data di atas berasal dari DB/kontrak props (bukan tebakan frontend); pesanan mode uji
  diberi tanda "Mode uji".

## 8. F7 — Resi otomatis Biteship

- `POST /admin/pesanan/{order}/resi` (admin): guard `status=dibayar|dikirim`, kurir+layanan ada,
  belum ada `biteship_order_id`, setting asal lengkap (`shipping_origin_*` + `contact_email`).
- Muat `POST {biteship.base_url}/v1/orders` dengan shipper = setting asal, destination = alamat
  pesanan, `courier_company`/`courier_type` dari layanan terpilih, item = order items
  (berat `products.weight` × qty, fallback 300 g/item), `delivery_type=now`.
- Simpan `biteship_order_id`, `orders.tracking_number` = `courier.waybill_id` ?: `courier.tracking_id`,
  `shipping_status` = `status`. Respons disimpan di `orders.shipping_payload` (json).
- Idempoten: klik kedua tidak memanggil API lagi. Gagal → flash error berisi pesan Biteship,
  tidak ada kolom yang berubah. Timeout 15 detik.
- Migrasi: `orders.biteship_order_id` (60, null), `orders.shipping_status` (30, null),
  `orders.shipping_payload` (json, null). `docs/db.md` diperbarui di kartu B4.
- DoD: pesanan uji mendapat resi dari fake Biteship; dua klik = satu panggilan; pesanan belum
  bayar ditolak; setting asal kurang → pesan menunjuk field yang kurang.

## 9. F8 — Riwayat pesanan informatif

Kartu riwayat (daftar + detail yang bisa dibuka):
- Nomor pesanan, tanggal, status pesanan + status bayar (label Indonesia).
- Kurir + layanan + **nomor resi** (bisa disalin) + status pengiriman.
- Alamat pengiriman lengkap (penerima, telepon, alamat, kota, kode pos).
- Rincian: subtotal, ongkir, diskon, total; daftar item (nama, qty, harga, tautan produk).
- Timeline: dibuat → dibayar → dikirim (jam bila ada).
- DoD: semua field di kontrak props terisi atau `null` yang ditangani; tidak ada N+1
  (eager load `items.product`, `payment`); halaman tetap terbaca di 360 px.

## 10. Tindakan pemilik (bukan blocker pengembangan)

1. Aktifkan kanal di dashboard Midtrans MAP: BCA VA, BNI VA, BRI VA, Permata VA, Mandiri Bill,
   Alfamart, Indomaret, QRIS.
2. Ganti *Payment Finished Redirect URL* Midtrans menjadi `{APP_URL}/midtrans/selesai`.
3. Isi kartu asal pengiriman di `/admin/ekspedisi` (nama, telepon, alamat, kode pos) dan
   `contact_email` di pengaturan; tanpa ini resi otomatis ditolak dengan pesan jelas.
4. Sediakan `BITESHIP_API_KEY` dan `MIDTRANS_SERVER_KEY` di `.env` (pemilik).
5. Isi saldo Biteship: rates dan create order ditolak dengan `No sufficient balance to call rates API`
   (tercatat di kartu `t_1b711d26`). Tanpa saldo, ongkir asli dan resi otomatis tidak bisa dibuat.

## 11. Asumsi

- [ASUMSI] Nomor resi yang ditampilkan = `waybill_id` Biteship; bila kosong pakai `tracking_id`.
- [ASUMSI] Berat produk tersedia di `products.weight`; bila kosong dipakai 300 g/item.
- [ASUMSI] Tipografi yang dimaksud pemilik adalah halaman publik toko, bukan panel admin.
- [ASUMSI] E-wallet (GoPay/ShopeePay) ditunda; QRIS sudah mencakup pembayaran e-wallet.
- [ASUMSI] Masa berlaku VA/gerai 60 menit cukup; QRIS tetap 5 menit.

## 12. Urutan kartu

UIUX (design-v1.2) → Backend F1 & F7 paralel → Backend F2 (setelah F1) & Backend props
(setelah F1+F7) → Frontend F2/F3 bayar, F5/F6 admin, F8 riwayat (setelah backend + desain) →
Frontend tipografi terakhir → QA → review Tech Lead. Peta lengkap: `docs/traceability-v1.2.md`.

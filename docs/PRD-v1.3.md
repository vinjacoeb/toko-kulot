# PRD v1.3 — Webhook Biteship & akses lewat tunnel

Status: **berlaku** (24 Okt 2026). Addendum `docs/PRD-v1.2.md`; untuk hal yang disebut di sini,
dokumen ini menang. Sumber: kartu `t_c04dd4c7` (permintaan pemilik).
Desain: `docs/design-v1.3.md` (kartu UIUX). Nama tabel/kolom ikut `docs/db.md`.

## 1. Ringkasan dan keputusan mengikat

| # | Permintaan pemilik | Keputusan |
|---|---|---|
| F9 | Pakai webhook Biteship `order.status`, `order.price`, `order.waybill_id`, terapkan ke pembayaran, riwayat, `/admin/pesanan` | Endpoint publik `POST /biteship/webhook` + penerapan idempoten ke `orders`; data tampil di panel pengiriman admin, riwayat pembeli, dan halaman selesai bayar |
| F10 | URL tunnel ngrok `https://nonpsychopathically-unmarriageable-ruben.ngrok-free.dev/` menampilkan halaman kosong | Perbaiki akar masalah: hentikan aset Vite dev di akses publik (`public/hot`) dan percayai proxy loopback agar URL aset memakai skema https |

Non-goal fase ini: refund/penyesuaian uang otomatis, pembatalan pesanan otomatis dari webhook,
polling status Biteship, notifikasi email/WA, retry queue/webhook event store, tanda tangan HMAC
(Biteship tidak menyediakannya di dashboard).

## 2. F9 — Webhook Biteship

### 2.1 Endpoint & keamanan

- Route: `POST` **dan** `GET` `/biteship/webhook` (name `biteship.webhook`), publik, **tanpa**
  CSRF (`bootstrap/app.php`), throttle `120,1` per IP. Respons selalu JSON.
- Probe instalasi dashboard Biteship (dikirim **tanpa** token, `Content-Type: application/json`,
  body **kosong**, kadang `GET`): `200 {"status":"ok","success":true}` + `Log::info`, diperiksa
  **sebelum** token, tanpa memproses apa pun. Tanpa ini dashboard menolak URL dengan pesan
  *"Webhook URL doesn't respond with ok response"* (bukti: `docs/bukti-webhook-install-t_7584d46c.txt`).
  Body kosong tidak pernah mengubah data, jadi pengecualian ini tidak melonggarkan keamanan.
- Token bersama: `config('biteship.webhook_token')` dari env `BITESHIP_WEBHOOK_TOKEN`.
  Biteship tidak menandatangani payload; token dikirim sebagai query `?token=...` **atau**
  header `X-Webhook-Token`. Bila env terisi dan tidak cocok → `403 {"message":"invalid token"}`
  + `Log::warning`. Bila env kosong (mode uji lokal) → diterima, `Log::info` sekali per request.
- Balasan: `200 {"message":"ok"}` untuk payload yang diproses, event tak dikenal, atau
  `order_id` tak dikenal (agar Biteship tidak mengulang tanpa henti; ketidakcocokan dicatat
  `Log::warning`). Body bukan JSON **dan tidak kosong** → `422 {"message":"invalid payload"}`.
- Tidak pernah 500 dan tidak pernah menulis `payments`, stok, atau `orders.total`.

### 2.2 Peta event → efek (idempoten, hanya maju)

| Event | Sumber payload | Efek |
|---|---|---|
| `order.waybill_id` | `courier_waybill_id` ?: `courier_tracking_id` | `orders.tracking_number` (maks 60), `shipping_status` = `status` bila ada, `shipping_updated_at` = sekarang |
| `order.status` | `status`, `courier_driver_name`, `courier_driver_phone`, `courier_link` | `orders.shipping_status`, `shipping_updated_at`, payload terakhir; **status pesanan hanya maju** (§2.3) |
| `order.price` | `price`, `shippment_fee`, `cash_on_delivery_fee`, `proof_of_delivery_fee` | simpan payload terakhir; `orders.shipping_cost`, `orders.total`, dan `payments.gross_amount` **tidak diubah**; selisih ditampilkan ke admin (§2.6) |

Pencocokan pesanan: `orders.biteship_order_id` = payload `order_id`. Pesanan tanpa
`biteship_order_id` tidak pernah cocok.

### 2.3 Aturan status pesanan (hanya maju, tidak pernah mundur)

| `orders.status` sekarang | Status webhook | Status pesanan baru |
|---|---|---|
| `dibayar`, `diproses` | `picked`, `dropping_off`, `delivered` | `dikirim` + `shipped_at` bila kosong |
| `dikirim` | `delivered` | `selesai` |
| `pending`, `batal`, `selesai`, atau status lain | apa pun | tidak berubah |
| `dikirim` | `picked`, `dropping_off` | tidak berubah |

`cancelled`, `rejected`, `returned`, `disposed`, `on_hold` **tidak** membatalkan pesanan dan
tidak mengembalikan stok: hanya `shipping_status` + tanda `perlu_tindakan` untuk admin (§2.6).
Alasan: pembatalan berdampak uang + stok dan tetap keputusan admin lewat
`PATCH /admin/pesanan/{order}/status` (`docs/kontrak-props.md` §12.18).

### 2.4 Idempoten

- Payload sama dikirim dua kali: `tracking_number` dan `shipping_status` tidak berubah nilai,
  `shipped_at` tidak bergeser, status pesanan tidak melompat dua langkah.
- `shipping_webhook_payload` menyimpan **payload terakhir** (bukan riwayat); tidak ada tabel baru.
- Uji: dua POST identik → satu transisi status, `shipped_at` tetap.

### 2.5 Kolom baru (migrasi `2026_10_24_000005_add_shipping_webhook_columns_to_orders_table`)

- `orders.shipping_updated_at` timestamp null — waktu payload shipping terakhir diterapkan.
- `orders.shipping_webhook_payload` json null — payload webhook terakhir (mentah).
- Kolom lama tetap dipakai: `biteship_order_id`, `shipping_status`, `tracking_number`,
  `shipped_at`, `shipping_payload` (respons create order, **tidak** ditimpa webhook).

### 2.6 Kontrak props (aditif; bentuk lama tidak berubah)

`shipping` pada admin §12.17 mendapat key baru:

| Key | Isi |
|---|---|
| `updated_at` | `orders.shipping_updated_at` (ISO 8601) atau `null` |
| `price_final` | `shipping_webhook_payload.price` dari event `order.price` (int) atau `null` |
| `price_selisih` | `price_final - orders.shipping_cost` atau `null` bila `price_final` null |
| `perlu_tindakan` | `true` bila status pengiriman bermasalah (`cancelled`, `rejected`, `returned`, `disposed`, `on_hold`) dan pesanan belum `batal`/`selesai`, atau `price_selisih` ≠ 0 |
| `tindakan` | pesan siap tampil untuk `perlu_tindakan` (contoh: `Kurir melaporkan paket dikembalikan. Periksa pesanan dan ubah status bila perlu.`); `null` bila tidak ada |
| `driver` | `{name, phone, link}` dari payload `order.status`; tiap field boleh `null`; `null` bila belum ada |
| `webhook_terakhir` | payload mentah terakhir (khusus admin; dipakai panel buka/tutup) atau `null` |

Daftar admin §12.16 menambah `shipping_updated_at` dan `shipping_perlu_tindakan` per baris.
Riwayat pembeli §13 dan halaman selesai §7.9 memakai bentuk pembeli: key `shipping` yang sama
**tanpa** `price_final`, `price_selisih`, `webhook_terakhir`; `galat` tetap `null` seperti §13.
Status pengiriman + resi muncul otomatis tanpa aksi pembeli.

Halaman bayar §7.7 tidak berubah: setelah `settlement` pengguna sudah diarahkan ke
`checkout.success` (§7.9), jadi data pengiriman ditampilkan di sana, bukan di halaman bayar.

### 2.7 Definition of Done

- `POST /biteship/webhook` menerima 3 event; token salah → 403; body rusak → 422;
  `order_id` tak dikenal → 200 + log.
- `picked` pada pesanan `dibayar` → `dikirim` + `shipped_at`; `delivered` pada `dikirim` →
  `selesai`; pesanan `pending`/`batal` tidak berubah.
- `order.waybill_id` mengisi `tracking_number`; event ganda tidak mengubah nilai.
- `order.price` tidak mengubah `shipping_cost`/`total`/`payments.gross_amount`.
- Test fitur: tiap event, token, idempoten, status tidak mundur, order tak dikenal.
- `docs/db.md`, `docs/kontrak-props.md` (§12.16, §12.17, §13, §7.9), dan
  `docs/catatan-backend.md` diperbarui.

## 3. F10 — Halaman kosong lewat ngrok

Bukti (techlead, 24 Okt 2026, `curl` ke URL tunnel):

- `public/hot` ada dan berisi `http://[::1]:5173`; HTML yang dilayani lewat ngrok memuat
  `<script type="module" src="http://[::1]:5173/@vite/client">` dan
  `.../resources/js/app.jsx`. Browser pengunjung mencarinya di mesin pengunjung sendiri →
  JS tidak pernah termuat → `<div id="app">` kosong. **Ini penyebab utama, terverifikasi.**
- Favicon di HTML yang sama memakai `http://nonpsychopathically-...ngrok-free.dev/...`
  sementara halaman dibuka lewat https → aset http diblokir browser (mixed content).
  **Penyebab kedua, dugaan kuat**: proxy ngrok tidak dipercaya sehingga `asset()` memakai http.

Perbaikan:

1. Backend: percayai proxy loopback saja di `bootstrap/app.php`
   (`trustProxies(at: ['127.0.0.1', '::1'])`) agar `X-Forwarded-Proto: https` dipakai untuk URL.
   Jangan `'*'` (host bersama bisa dipalsukan).
2. Operasional: hentikan `npm run dev`, hapus `public/hot`, jalankan `npm run build`; halaman
   harus memuat `/build/assets/...` — absolut https boleh, yang penting tidak ada host Vite dev
   (`[::1]:5173`); keputusan F-13-05 di `docs/review-v1.3.md`.
3. Verifikasi: `curl -s https://<tunnel>/ | grep -o 'src="[^"]*"'` → hanya `/build/assets/...`;
   favicon `https://`; halaman tampil normal di browser.

Webhook URL untuk dashboard Biteship: `https://<tunnel>/biteship/webhook?token=<BITESHIP_WEBHOOK_TOKEN>`.
URL ngrok gratis berubah setiap tunnel dijalankan ulang; untuk produksi wajib domain tetap
(tindakan pemilik).

## 4. Tindakan pemilik (bukan blocker pengembangan)

1. Jalankan tunnel (`ngrok http 8000` atau port yang dipakai) dan pastikan URL-nya dibuka dari
   perangkat lain menampilkan toko, bukan halaman kosong.
2. Isi `BITESHIP_WEBHOOK_TOKEN` di `.env` (teks acak panjang, jangan ditempel di kartu/chat).
3. Dashboard Biteship → Integrasi → Webhook → Tambah Webhook:
   URL `https://<tunnel>/biteship/webhook?token=<token>`, centang `order.status`, `order.price`,
   `order.waybill_id`.
4. Jalankan `php artisan migrate` untuk dua kolom baru.
5. Pastikan `BITESHIP_API_KEY` ber-saldo dan resi sudah pernah dibuat (agar ada `order_id` Biteship
   yang bisa dicocokkan webhook).

## 5. Asumsi

- [ASUMSI] `order_id` pada webhook = `orders.biteship_order_id` yang disimpan saat create order.
- [ASUMSI] `courier_waybill_id` lebih diutamakan daripada `courier_tracking_id` (sama dengan F7).
- [ASUMSI] Harga ongkir aktual (`order.price`) hanya informasi untuk admin; uang yang sudah
  ditagih tidak diubah otomatis.
- [ASUMSI] Pembatalan/pengembalian paket tetap ditangani admin lewat status pesanan yang ada.
- [ASUMSI] Token webhook cukup query/header biasa; Biteship tidak menyediakan HMAC.

## 6. Urutan kartu

UIUX `design-v1.3` dan Backend webhook (B1) paralel; Backend proxy tunnel (B0) paralel;
Backend props (B2) setelah B1 + UIUX; DevOps tunnel (D0) setelah B0; Frontend admin (F1) dan
Frontend pembeli (F2) setelah B2 + UIUX; QA setelah F1+F2+D0; review Tech Lead terakhir.
Peta: `docs/traceability-v1.3.md`.

# Midtrans Produksi — Verifikasi & Checklist

Kartu: `t_3c9d83c1` (devops). Tanggal: 22 Oktober 2026.
Ruang lingkup: memastikan jalur pembayaran QRIS membaca konfigurasi Midtrans dari `.env`, mode
produksi aktif, dan memberi pemilik checklist go-live tanpa membocorkan rahasia.

**`.env` tidak dibuka, dibaca, ditulis, atau dicetak.** Verifikasi dilakukan lewat kode (config +
jalur bayar) dan probe baca-saja yang hanya mencetak boolean/URL non-rahasia. Tidak ada migrasi,
seed, atau panggilan charge ke Midtrans pada kartu ini.

## 1. Hasil verifikasi

| Pemeriksaan | Hasil | Bukti |
|---|---|---|
| Config membaca 7 kunci `MIDTRANS_*` yang diharapkan | LULUS | `config/midtrans.php:27-47` (`merchant_id`, `client_key`, `server_key`, `is_production`, `fake`, `expiry_minutes`, `notification_url`) |
| Jalur QRIS memakai config, bukan nilai tab admin | LULUS | `MidtransService::isFake()`/`createQrisCharge()`/`chargeParams()` (`app/Services/MidtransService.php:105-108,128-164,525-552`); `SdkMidtransApi::boot()` (`app/Services/Midtrans/SdkMidtransApi.php:121-127`) |
| `midtrans_client_key` / `midtrans_is_production` di tab admin tidak dikonsumsi jalur bayar | LULUS | Hanya muncul di `SettingService::DEFINITIONS` (`app/Services/SettingService.php:46-47`), validasi `UpdateSettingRequest`, seeder, dan `resources/js/Pages/Admin/Settings/Index.jsx`; tidak dipakai `MidtransService`, `CheckoutController`, atau `SdkMidtransApi` |
| `MIDTRANS_IS_PRODUCTION=true` → endpoint produksi | LULUS | Probe: `sdk_base_url = https://api.midtrans.com`; SDK `Config::getBaseUrl()` memilih `PRODUCTION_BASE_URL` (`vendor/midtrans/midtrans-php/Midtrans/Config.php:69-83`); `CoreApi::charge` memakai URL itu (`CoreApi.php:40`) |
| `MIDTRANS_FAKE=false` → mode asli (bukan uji) | LULUS | Probe: `fake_flag=false`, `mode_efektif=asli`, `fake_efektif_service=false` |
| `MIDTRANS_SERVER_KEY` terisi | LULUS | Probe: `server_key_terisi=true` (nilai tidak dicetak) |
| Kunci bukan kunci sandbox (tidak berawalan `SB-`) | LULUS | Probe: `server_key_berprefix_sandbox=false`, `client_key_berprefix_sandbox=false` (hanya boolean) |
| Masa berlaku memakai `MIDTRANS_EXPIRY_MINUTES` | LULUS (nilai perlu dikoreksi) | `expiryMinutes()` (`MidtransService.php:118-123`) dipakai `chargeParams()` `custom_expiry` (`:547-550`) **dan** kolom `payments.expires_at` (`createQrisCharge()` `:144,162`). Probe: nilai aktif **60**; kebijakan produksi P1 = **5** |
| Config cache tidak mengunci nilai lama | LULUS | `bootstrap/cache/config.php` tidak ada (`config_cached=false`) → perubahan `.env` langsung terbaca |
| Kanal QRIS | LULUS | Probe: `enabled_payments=["other_qris"]`; `payment_type=qris` (`MidtransService.php:528`) |
| Webhook: rute + CSRF + verifikasi tanda tangan | LULUS (kode) | `routes/web.php:118-119`; `bootstrap/app.php:31-33` mengecualikan `midtrans/notification`; `verifySignature()` SHA-512 (`MidtransService.php:237-257`) |

Keluaran probe (hanya boolean/nilai non-rahasia):

```json
{
    "config_cached": false,
    "env_key_terbaca": {
        "MIDTRANS_MERCHANT_ID": true,
        "MIDTRANS_CLIENT_KEY": true,
        "MIDTRANS_SERVER_KEY": true,
        "MIDTRANS_IS_PRODUCTION": true,
        "MIDTRANS_FAKE": true,
        "MIDTRANS_EXPIRY_MINUTES": true
    },
    "is_production": true,
    "fake_flag": false,
    "mode_efektif": "asli",
    "alasan_kode": null,
    "fake_efektif_service": false,
    "server_key_terisi": true,
    "expiry_minutes": 60,
    "enabled_payments": ["other_qris"],
    "sumber_kredensial": ".env (MIDTRANS_*)",
    "sdk_base_url": "https://api.midtrans.com",
    "server_key_berprefix_sandbox": false,
    "client_key_berprefix_sandbox": false,
    "notification_url_path": "/midtrans/notification",
    "notification_url_https": false
}
```

Cara mengulang (baca-saja, tanpa database):

```
php tmp/cek-midtrans-produksi.php
```

Probe ada di `tmp/cek-midtrans-produksi.php` (skrip bantu, bukan kode aplikasi). Skrip ini
membaca config Laravel dan mencetak boolean; tidak pernah mencetak nilai kredensial.

## 2. Peta sumber kebenaran

```
.env (MIDTRANS_*)
  -> config/midtrans.php
     -> MidtransService (mode, expiry, parameter charge, verifikasi signature)
        -> SdkMidtransApi::boot(): Config::$serverKey + Config::$isProduction
           -> CoreApi::charge()  -> https://api.midtrans.com/v2/charge   (produksi)
           -> Transaction::status() -> https://api.midtrans.com/v2/{id}/status
```

Tab **/admin/pengaturan?tab=pembayaran** hanya menyimpan `midtrans_client_key` dan
`midtrans_is_production` sebagai catatan. Nilainya **tidak dibaca** jalur QRIS — sumber kebenaran
selalu `.env`. UI tab Pembayaran sudah menampilkan notice ini (`resources/js/Pages/Admin/Settings/Index.jsx:2016,2041-2065`).

## 3. Temuan yang perlu tindakan pemilik

1. **`MIDTRANS_EXPIRY_MINUTES` masih 60.** Nilai ini dipasang sementara untuk uji bayar sandbox
   (P11) dan belum dikembalikan. Kebijakan produksi P1 adalah **5 menit**, dan teks FAQ toko masih
   menyebut 5 menit (`database/seeders/FaqSeeder.php:34`). Sebelum go-live: ubah ke `5`, lalu
   `php artisan config:clear`. Bila 60 menit memang disengaja, FAQ + keputusan P1 harus diubah
   lebih dulu oleh pemilik/techlead.
2. **`MIDTRANS_NOTIFICATION_URL` tidak dibaca kode.** Yang benar-benar dipanggil Midtrans adalah
   URL di dashboard Midtrans (Settings → Configuration → Payment Notification URL). Nilai di `.env`
   hanya dokumentasi. Isi dashboard dengan `https://<domain-toko>/midtrans/notification` (HTTPS,
   dapat diakses publik). Tanpa itu, status pembayaran tidak berubah otomatis; admin masih bisa
   memakai tombol "Sinkronkan status pembayaran".
3. **Kunci produksi harus dari dashboard produksi.** Probe memastikan kunci tidak berawalan `SB-`
   (konsisten dengan kunci produksi), tetapi status aktivasi akun produksi tidak bisa diperiksa dari
   kode. Pastikan akun Midtrans sudah aktif untuk produksi dan QRIS diaktifkan.
4. **Jangan mencampur kunci sandbox dengan `MIDTRANS_IS_PRODUCTION=true`** — Midtrans menolak
   transaksi (401/400). Sebaliknya, kunci produksi dengan mode sandbox juga ditolak.

## 4. Checklist pemilik — produksi langsung

Tanpa menyebut atau menempel nilai kunci di kartu/chat/dokumen.

1. **Dashboard Midtrans (produksi):** pastikan akun aktif produksi, metode **QRIS** aktif, lalu
   ambil **Merchant ID**, **Client Key**, dan **Server Key versi produksi** (bukan sandbox/`SB-`).
2. **`.env` (milik pemilik):** `MIDTRANS_IS_PRODUCTION=true`, `MIDTRANS_FAKE=false`, ketiga kunci
   produksi terisi, `MIDTRANS_EXPIRY_MINUTES=5`, dan `APP_URL` memakai `https://<domain>`.
3. **Muat ulang config:** `php artisan config:clear` setelah mengubah `.env`; bila server memakai
   `config:cache`, jalankan ulang cache setiap kali `.env` berubah. Restart `php artisan serve` /
   PHP-FPM bila perlu.
4. **Dashboard Midtrans:** isi **Payment Notification URL** =
   `https://<domain>/midtrans/notification` (POST, HTTPS, publik). Ini yang dipakai Midtrans,
   bukan `MIDTRANS_NOTIFICATION_URL` di `.env`.
5. **Cek tampilan admin:** buka `/admin/pengaturan?tab=pembayaran`. Harus **tidak** ada penanda
   "MODE UJI"; keterangan menyebut kredensial dibaca dari `.env`. Kolom client key di tab itu
   boleh tetap terisi — nilainya hanya catatan.
6. **Uji nyata sekali (uang bergerak):** buat 1 pesanan bernominal kecil, buka halaman bayar,
   pastikan QR berasal dari Midtrans (bukan QRIS dummy), lalu bayar dengan e-wallet/QRIS asli.
   Harapan: halaman berubah "Lunas" dan status pesanan ikut berubah setelah notifikasi masuk.
   Bila notifikasi belum masuk, tekan **Sinkronkan status pembayaran** di `/admin/pesanan/{id}`
   (menarik status langsung dari Midtrans).
7. **Bila gagal:** rollback tanpa perubahan kode — set `MIDTRANS_FAKE=true` (QRIS dummy) atau
   `MIDTRANS_IS_PRODUCTION=false` (kembali sandbox) di `.env`, lalu `php artisan config:clear`.
   Jangan menghapus data pesanan/pembayaran; biarkan admin menandai statusnya.
8. **Jangan** menempel kunci, token, atau isi `.env` ke kartu kanban, chat, atau dokumen.

## 5. Rollback

- Tidak ada perubahan kode aplikasi, skema, atau database pada kartu ini; rollback docs cukup
  membuang bagian baru bila tidak dipakai.
- Rollback konfigurasi = ubah `.env` seperti butir 7 di atas + `php artisan config:clear`.
- Rollback rilis penuh mengikuti `docs/deploy.md` §8 (backup database sebelum rollback migrasi).

## 6. Belum diuji (jujur)

- **Charge QRIS produksi sungguhan** — belum dijalankan; butuh uang, akun produksi aktif, dan
  keputusan pemilik. Kartu ini tidak memanggil Midtrans.
- **Notifikasi Midtrans masuk ke domain publik** — belum diuji; butuh domain HTTPS publik. Di
  localhost, Midtrans tidak bisa menjangkau `127.0.0.1`.
- **Aktivasi akun produksi Midtrans** — di luar kode; hanya pemilik yang bisa memastikan di dashboard.
- **Perilaku setelah `config:cache` produksi** — belum dijalankan (perintah cache tidak dijalankan
  devops); dokumentasi mengikuti `docs/deploy.md`.

## 7. Berkas yang disentuh kartu ini

- `docs/midtrans-produksi.md` (baru, dokumen ini).
- `docs/langkah-pemilik.md` §9: koreksi bawaan `MIDTRANS_FAKE` + status produksi 22 Okt 2026.
- `docs/checklist-rilis.md` §15.11: catatan jalur produksi langsung + koreksi contoh `.env`.
- `.env.example`: komentar klarifikasi sumber kebenaran (nilai tidak diubah).
- `docs/catatan-devops.md`: catatan temuan.
- `tmp/cek-midtrans-produksi.php`, `tmp/hasil-cek-midtrans-produksi.txt`: alat/bukti probe.

Tidak ada perubahan pada `app/`, `config/`, `routes/`, `database/`, `.env`, atau riwayat Git.

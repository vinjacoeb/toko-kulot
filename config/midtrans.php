<?php

/*
|--------------------------------------------------------------------------
| Konfigurasi Midtrans (PRD §8)
|--------------------------------------------------------------------------
|
| Kredensial dibaca dari .env (pemilik toko yang mengisi). `fake` dipakai
| untuk pengembangan lokal tanpa kredensial: QRIS dibuat lokal dengan format
| EMVCo yang valid sehingga alur checkout bisa diuji penuh tanpa jaringan.
| MIDTRANS_FAKE wajib false di produksi (docs/langkah-pemilik.md).
|
*/

return [

    'merchant_id' => env('MIDTRANS_MERCHANT_ID', ''),

    'client_key' => env('MIDTRANS_CLIENT_KEY', ''),

    'server_key' => env('MIDTRANS_SERVER_KEY', ''),

    'is_production' => (bool) env('MIDTRANS_IS_PRODUCTION', false),

    // Mode pengembangan: tidak memanggil API Midtrans, QRIS dibuat lokal.
    'fake' => (bool) env('MIDTRANS_FAKE', true),

    // Masa berlaku QRIS dalam menit (PRD §8: 15 menit).
    'expiry_minutes' => 15,

    // Kanal pembayaran QRIS (PRD §8).
    'enabled_payments' => ['other_qris'],

    // URL notifikasi yang didaftarkan di dashboard Midtrans.
    'notification_url' => env('MIDTRANS_NOTIFICATION_URL', '/midtrans/notification'),

];

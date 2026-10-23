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

// Masa berlaku tagihan QRIS dalam menit. Keputusan pemilik 21 Oktober 2026:
// 5 menit, menggantikan 15 menit di PRD §8 butir 6 + A17 (amendemen pemilik
// menunggu; docs/pertanyaan-pemilik.md §5 P1, kartu t_e35050e8).
// Hanya bilangan bulat >= 1 yang diterima; nilai lain (kosong, teks, pecahan,
// nol, negatif) jatuh ke bawaan 5 menit supaya Midtrans tidak menerima angka aneh.
$expiryDefault = 5;
$expiryMinutes = filter_var(env('MIDTRANS_EXPIRY_MINUTES', $expiryDefault), FILTER_VALIDATE_INT, [
    'options' => ['min_range' => 1],
]);

// Acquirer QRIS Core API yang SAH: `gopay` (bawaan) atau `airpay shopee`
// (QRIS acquirer lain). `other_qris` bukan acquirer Core API (metode Snap;
// dijawab Midtrans 413 "Payload format is not supported"), tetapi tetap
// diterima sebagai nilai config lama dan dipetakan ke `airpay shopee` supaya
// `.env` pemilik tidak perlu diubah. Nilai lain/kosong jatuh ke `gopay`.
$qrisAcquirerDefault = 'gopay';
$qrisAcquirer = strtolower(trim((string) env('MIDTRANS_QRIS_ACQUIRER', $qrisAcquirerDefault)));

if ($qrisAcquirer === 'other_qris') {
    $qrisAcquirer = 'airpay shopee';
}

if (! in_array($qrisAcquirer, ['gopay', 'airpay shopee'], true)) {
    $qrisAcquirer = $qrisAcquirerDefault;
}

return [

    'merchant_id' => env('MIDTRANS_MERCHANT_ID', ''),

    'client_key' => env('MIDTRANS_CLIENT_KEY', ''),

    'server_key' => env('MIDTRANS_SERVER_KEY', ''),

    'is_production' => (bool) env('MIDTRANS_IS_PRODUCTION', false),

    // Mode pengembangan: tidak memanggil API Midtrans, QRIS dibuat lokal.
    'fake' => (bool) env('MIDTRANS_FAKE', false),

    // Masa berlaku QRIS dalam menit (5 menit — keputusan pemilik 21 Oktober 2026).
    // Dipakai untuk `custom_expiry` Midtrans sekaligus kolom `payments.expires_at`.
    // Override lewat MIDTRANS_EXPIRY_MINUTES, lalu `php artisan config:clear`.
    'expiry_minutes' => $expiryMinutes === false ? $expiryDefault : $expiryMinutes,

    // Kanal QRIS Core API (`payment_type = qris`). Core API memilih kanal lewat
    // `qris.acquirer`, bukan `enabled_payments` (parameter Snap). Mengirim
    // `enabled_payments = ["other_qris"]` bersama `acquirer = gopay` membuat
    // Midtrans menjawab 402 "Payment channel is not activated" — notif
    // "Gagal membuat pembayaran QRIS. Coba lagi." (kartu t_2f443b75).
    // Nilai sah: `gopay` (QRIS GoPay) atau `airpay shopee` (QRIS acquirer lain).
    // `other_qris` bukan acquirer Core API; nilai config lama itu dipetakan ke
    // `airpay shopee` di atas (kartu t_56062a5c).
    // Bila kanal ini belum aktif, server mencoba acquirer sah satunya otomatis;
    // bila percobaan pertama 402, pesan akhir tetap pesan aktivasi kanal.
    // Override lewat MIDTRANS_QRIS_ACQUIRER, lalu `php artisan config:clear`.
    'qris_acquirer' => $qrisAcquirer,

    // URL notifikasi yang didaftarkan di dashboard Midtrans.
    'notification_url' => env('MIDTRANS_NOTIFICATION_URL', '/midtrans/notification'),

];

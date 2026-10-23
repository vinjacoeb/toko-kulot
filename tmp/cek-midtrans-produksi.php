<?php

/**
 * Probe baca-saja konfigurasi Midtrans (kartu t_3c9d83c1).
 *
 * TIDAK PERNAH mencetak nilai kredensial. Hanya boolean "terisi/kosong",
 * bendera mode, nilai non-rahasia (expiry, daftar kanal), dan URL basis SDK.
 * Tidak menyentuh database, tidak menulis apa pun.
 */

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$service = $app->make(App\Services\MidtransService::class);
$mode = $service->modeInfo();

// Tiru SdkMidtransApi::boot() untuk melihat basis URL yang benar-benar dipakai SDK.
Midtrans\Config::$serverKey = 'REDACTED-FOR-PROBE';
Midtrans\Config::$isProduction = (bool) config('midtrans.is_production');

$notification = (string) config('midtrans.notification_url');

$hasil = [
    'config_cached' => is_file(__DIR__.'/../bootstrap/cache/config.php'),
    'env_key_terbaca' => [
        'MIDTRANS_MERCHANT_ID' => ! blank(config('midtrans.merchant_id')),
        'MIDTRANS_CLIENT_KEY' => ! blank(config('midtrans.client_key')),
        'MIDTRANS_SERVER_KEY' => ! blank(config('midtrans.server_key')),
        'MIDTRANS_IS_PRODUCTION' => is_bool(config('midtrans.is_production')),
        'MIDTRANS_FAKE' => is_bool(config('midtrans.fake')),
        'MIDTRANS_EXPIRY_MINUTES' => config('midtrans.expiry_minutes') !== null,
    ],
    'is_production' => (bool) config('midtrans.is_production'),
    'fake_flag' => (bool) config('midtrans.fake'),
    'mode_efektif' => $mode['mode'],
    'alasan_kode' => $mode['alasan_kode'],
    'fake_efektif_service' => $service->isFake(),
    'server_key_terisi' => $mode['server_key_terisi'],
    'expiry_minutes' => $service->expiryMinutes(),
    'enabled_payments' => config('midtrans.enabled_payments'),
    'sumber_kredensial' => $mode['sumber_kredensial'],
    'sdk_base_url' => Midtrans\Config::getBaseUrl(),
    // Deteksi ketidakcocokan kunci sandbox vs mode produksi TANPA mencetak kunci.
    // Kunci sandbox Midtrans berawalan "SB-"; kunci produksi tidak.
    'server_key_berprefix_sandbox' => str_starts_with((string) config('midtrans.server_key'), 'SB-'),
    'client_key_berprefix_sandbox' => str_starts_with((string) config('midtrans.client_key'), 'SB-'),
    'notification_url_path' => parse_url($notification, PHP_URL_PATH),
    'notification_url_https' => parse_url($notification, PHP_URL_SCHEME) === 'https',
];

echo json_encode($hasil, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), PHP_EOL;

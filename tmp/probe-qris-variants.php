<?php

/**
 * Probe varian payload charge QRIS ke Midtrans (kartu t_2f443b75).
 *
 * Hanya mencetak status respons Midtrans; tidak pernah mencetak kredensial.
 * Dijalankan lewat: php artisan tinker --execute="require 'tmp/probe-qris-variants.php';"
 * Hanya jalan bila mode efektif BUKAN produksi (tidak membuat tagihan nyata).
 */

use App\Services\Midtrans\SdkMidtransApi;

if ((bool) config('midtrans.is_production')) {
    echo "SKIP: mode produksi aktif, probe tidak dijalankan.\n";

    return;
}

if (blank(config('midtrans.server_key'))) {
    echo "SKIP: server key kosong, probe tidak bisa dijalankan.\n";

    return;
}

$api = app(SdkMidtransApi::class);

$build = static function (string $orderId, array $extra): array {
    return array_merge([
        'payment_type' => 'qris',
        'transaction_details' => ['order_id' => $orderId, 'gross_amount' => 1000],
        'customer_details' => [
            'first_name' => 'PROBE',
            'email' => 'probe@example.test',
            'phone' => '081200000000',
        ],
        'custom_expiry' => ['expiry_duration' => 5, 'unit' => 'minute'],
    ], $extra);
};

$stamp = substr((string) time(), -6);
$stamp .= strtoupper(bin2hex(random_bytes(2)));

$variants = [
    'A sekarang (gopay + enabled_payments=[other_qris])' => $build("PROBE-$stamp-A", [
        'qris' => ['acquirer' => 'gopay'],
        'enabled_payments' => ['other_qris'],
    ]),
    'B gopay saja' => $build("PROBE-$stamp-B", ['qris' => ['acquirer' => 'gopay']]),
    'C tanpa blok qris' => $build("PROBE-$stamp-C", []),
    'D other_qris saja' => $build("PROBE-$stamp-D", ['qris' => ['acquirer' => 'other_qris']]),
];

foreach ($variants as $label => $params) {
    echo "== $label\n";

    try {
        $response = $api->charge($params);
        printf(
            "   OK status_code=%s status_message=%s transaction_status=%s payment_type=%s acquirer=%s actions=%d qr_string=%s\n",
            (string) ($response['status_code'] ?? '-'),
            (string) ($response['status_message'] ?? '-'),
            (string) ($response['transaction_status'] ?? '-'),
            (string) ($response['payment_type'] ?? '-'),
            (string) (is_array($response['qris'] ?? null) ? ($response['qris']['acquirer'] ?? '-') : '-'),
            count((array) ($response['actions'] ?? [])),
            filled($response['qr_string'] ?? null) ? 'ada' : 'kosong',
        );
    } catch (Throwable $exception) {
        echo '   GAGAL '.$exception::class.' code='.$exception->getCode().' msg='.$exception->getMessage()."\n";

        for ($previous = $exception->getPrevious(); $previous !== null; $previous = $previous->getPrevious()) {
            echo '     <- '.$previous::class.' code='.$previous->getCode().' msg='.$previous->getMessage()."\n";
        }
    }
}

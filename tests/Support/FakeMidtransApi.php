<?php

namespace Tests\Support;

use App\Services\Midtrans\MidtransApi;
use RuntimeException;

/**
 * Pengganti jaringan Midtrans Core API untuk test.
 *
 * Dipakai lewat `$this->app->instance(MidtransApi::class, new FakeMidtransApi)`
 * sehingga alur charge 8 kanal + status bisa diuji tanpa kredensial dan tanpa
 * panggilan keluar (PRD-v1.2 §2, kontrak props §7.7/§7.7a/§7.8).
 */
class FakeMidtransApi implements MidtransApi
{
    /** @var array<int, array<string, mixed>> Parameter tiap charge yang diterima. */
    public array $charges = [];

    /** @var array<string, array<string, mixed>> Jawaban status per order_id. */
    public array $statuses = [];

    public int $chargeCount = 0;

    public int $statusCount = 0;

    /** Bila true, charge menolak `order_id` yang sudah pernah dipakai (simulasi HTTP 406). */
    public bool $rejectDuplicateOrderIds = false;

    /** @var array<int, string> `order_id` yang sudah diterima charge. */
    public array $usedOrderIds = [];

    /** Bila diisi, setiap charge melempar exception kelas ini (simulasi jaringan gagal). */
    public ?string $chargeException = null;

    /** `transaction_status` yang dikembalikan saat charge berhasil. */
    public string $chargeStatus = 'pending';

    /** `transaction_status` bawaan bila `status()` dipanggil untuk order_id yang tidak ada di `$statuses`. */
    public string $defaultTransactionStatus = 'pending';

    /**
     * @param  array<string, mixed>  $params
     * @return array<string, mixed>
     */
    public function charge(array $params): array
    {
        $this->chargeCount++;
        $this->charges[] = $params;

        if ($this->chargeException !== null) {
            $class = $this->chargeException;

            throw new $class('Simulasi kegagalan jaringan Midtrans (test).');
        }

        $orderId = (string) ($params['transaction_details']['order_id'] ?? 'TK-TEST');
        $grossAmount = (int) ($params['transaction_details']['gross_amount'] ?? 0);

        if ($this->rejectDuplicateOrderIds && in_array($orderId, $this->usedOrderIds, true)) {
            throw new RuntimeException('order_id has been paid and utilized');
        }

        $this->usedOrderIds[] = $orderId;

        $response = [
            'status_code' => '200',
            'status_message' => 'Success, transaction is created',
            'transaction_id' => 'trx-'.strtolower(str_replace('-', '', $orderId)),
            'order_id' => $orderId,
            'gross_amount' => number_format($grossAmount, 2, '.', ''),
            'payment_type' => (string) ($params['payment_type'] ?? 'qris'),
            'transaction_status' => $this->chargeStatus,
            'transaction_time' => now()->toDateTimeString(),
        ];

        return $response + $this->instructionPayload((string) ($params['payment_type'] ?? 'qris'), $params, $orderId);
    }

    /**
     * Bentuk respons sesuai kelompok kanal, meniru Core API.
     *
     * @param  array<string, mixed>  $params
     * @return array<string, mixed>
     */
    private function instructionPayload(string $paymentType, array $params, string $orderId): array
    {
        if ($paymentType === 'qris') {
            return [
                'qr_string' => '00020101021226'.strtoupper(substr(md5($orderId), 0, 12)),
                'actions' => [[
                    'name' => 'generate-qr-code',
                    'method' => 'GET',
                    'url' => 'https://api.sandbox.midtrans.com/v2/qris/'.rawurlencode($orderId).'/qr-code',
                ]],
            ];
        }

        if ($paymentType === 'bank_transfer') {
            $bank = (string) ($params['bank_transfer']['bank'] ?? 'bca');

            if ($bank === 'permata') {
                return ['permata_va_number' => '8562'.str_pad((string) abs(crc32($orderId) % 100000000), 8, '0', STR_PAD_LEFT)];
            }

            return ['va_numbers' => [[
                'bank' => $bank,
                'va_number' => '88'.str_pad((string) abs(crc32($orderId) % 10000000000), 10, '0', STR_PAD_LEFT),
            ]]];
        }

        if ($paymentType === 'echannel') {
            return [
                'biller_code' => '7777',
                'bill_key' => str_pad((string) abs(crc32($orderId) % 100000000000), 12, '0', STR_PAD_LEFT),
            ];
        }

        return [
            'store' => (string) ($params['cstore']['store'] ?? 'alfamart'),
            'payment_code' => str_pad((string) abs(crc32($orderId) % 100000000000), 12, '0', STR_PAD_LEFT),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function status(string $orderId): array
    {
        $this->statusCount++;

        return $this->statuses[$orderId] ?? [
            'order_id' => $orderId,
            'gross_amount' => '0.00',
            'transaction_status' => $this->defaultTransactionStatus,
        ];
    }
}

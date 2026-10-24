<?php

namespace Tests\Support;

use App\Services\Midtrans\MidtransApi;
use RuntimeException;

/**
 * Pengganti jaringan Midtrans untuk test.
 *
 * Dipakai lewat `$this->app->instance(MidtransApi::class, new FakeMidtransApi)`
 * sehingga alur Snap/status bisa diuji penuh tanpa kredensial dan tanpa
 * panggilan keluar (PRD-v1.1 §2, kontrak props §7.7/§7.8).
 */
class FakeMidtransApi implements MidtransApi
{
    /** @var array<int, array<string, mixed>> Parameter tiap Snap yang diterima. */
    public array $snaps = [];

    /** @var array<string, array<string, mixed>> Jawaban status per order_id. */
    public array $statuses = [];

    public int $snapCount = 0;

    public int $statusCount = 0;

    /** Bila true, Snap menolak `order_id` yang sudah pernah dipakai (simulasi HTTP 406). */
    public bool $rejectDuplicateOrderIds = false;

    /** @var array<int, string> `order_id` yang sudah diterima Snap. */
    public array $usedOrderIds = [];

    /** Bila diisi, setiap Snap melempar exception kelas ini (simulasi jaringan gagal). */
    public ?string $snapException = null;

    /** `transaction_status` yang dikembalikan saat Snap berhasil. */
    public string $snapStatus = 'pending';

    /** `transaction_status` bawaan bila `status()` dipanggil untuk order_id yang tidak ada di `$statuses`. */
    public string $defaultTransactionStatus = 'pending';

    /**
     * @param  array<string, mixed>  $params
     * @return array<string, mixed>
     */
    public function snap(array $params): array
    {
        $this->snapCount++;
        $this->snaps[] = $params;

        if ($this->snapException !== null) {
            $class = $this->snapException;

            throw new $class('Simulasi kegagalan jaringan Midtrans (test).');
        }

        $orderId = (string) ($params['transaction_details']['order_id'] ?? 'TK-TEST');

        if ($this->rejectDuplicateOrderIds && in_array($orderId, $this->usedOrderIds, true)) {
            throw new RuntimeException('order_id has been paid and utilized');
        }

        $this->usedOrderIds[] = $orderId;

        // Bentuk respons Snap: token + redirect_url, tanpa qr_string.
        return [
            'token' => 'snap-'.strtolower(str_replace('-', '', $orderId)),
            'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v4/redirection/snap-'.strtolower(str_replace('-', '', $orderId)),
            'transaction_status' => $this->snapStatus,
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

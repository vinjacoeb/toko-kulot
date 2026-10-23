<?php

namespace Tests\Support;

use App\Services\Midtrans\MidtransApi;
use RuntimeException;

/**
 * Pengganti jaringan Midtrans untuk test (kartu t_9f4b6aee).
 *
 * Dipakai lewat `$this->app->instance(MidtransApi::class, new FakeMidtransApi)`
 * sehingga alur charge/status bisa diuji penuh tanpa kredensial dan tanpa
 * panggilan keluar (PRD §8, kontrak props §7.7/§7.8).
 */
class FakeMidtransApi implements MidtransApi
{
    /** @var array<int, array<string, mixed>> Parameter tiap charge yang diterima. */
    public array $charges = [];

    /** @var array<string, array<string, mixed>> Jawaban status per order_id. */
    public array $statuses = [];

    public int $chargeCount = 0;

    public int $statusCount = 0;

    /** Bila true, `charge` menolak `order_id` yang sudah pernah dipakai (simulasi HTTP 406). */
    public bool $rejectDuplicateOrderIds = false;

    /** @var array<int, string> `order_id` yang sudah diterima `charge`. */
    public array $usedOrderIds = [];

    /** Bila diisi, setiap `charge` melempar exception kelas ini (simulasi jaringan gagal). */
    public ?string $chargeException = null;

    /**
     * Daftar exception yang dilempar berurutan pada panggilan `charge` pertama,
     * kedua, … (kosong = perilaku normal). Dipakai test fallback kanal QRIS
     * (kartu t_2f443b75): kegagalan 402 lalu berhasil, atau 402 dua kali.
     *
     * @var array<int, \Throwable>
     */
    public array $chargeFailures = [];

    /**
     * Parameter SEMUA panggilan `charge` — termasuk yang gagal — supaya urutan
     * acquirer (`gopay` lalu `airpay shopee`) bisa diperiksa.
     *
     * @var array<int, array<string, mixed>>
     */
    public array $chargeAttempts = [];

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
        $this->chargeAttempts[] = $params;

        if ($this->chargeFailures !== []) {
            throw array_shift($this->chargeFailures);
        }

        if ($this->chargeException !== null) {
            $class = $this->chargeException;

            throw new $class('Simulasi kegagalan jaringan Midtrans (test).');
        }

        $orderId = (string) ($params['transaction_details']['order_id'] ?? 'TK-TEST');

        if ($this->rejectDuplicateOrderIds && in_array($orderId, $this->usedOrderIds, true)) {
            throw new RuntimeException('order_id has been paid and utilized');
        }

        $this->usedOrderIds[] = $orderId;
        $this->charges[] = $params;

        $amount = (int) ($params['transaction_details']['gross_amount'] ?? 0);

        return [
            'transaction_id' => 'trx-'.strtolower(str_replace('-', '', $orderId)),
            'order_id' => $orderId,
            'gross_amount' => $amount.'.00',
            'payment_type' => 'qris',
            'transaction_status' => $this->chargeStatus,
            'qr_string' => '00020101021226610014ID.CO.QRIS.WWW'.$amount.'5802ID6304ABCD',
            'actions' => [
                [
                    'name' => 'generate-qr-code',
                    'method' => 'GET',
                    'url' => 'https://api.sandbox.midtrans.test/v2/qris/'.$orderId.'/qr-code',
                ],
            ],
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

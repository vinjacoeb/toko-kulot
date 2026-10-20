<?php

namespace App\Services;

use App\Exceptions\CheckoutException;
use App\Models\Order;
use App\Models\Payment;
use App\Models\ProductVariant;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Integrasi QRIS Midtrans (PRD §8).
 *
 * - Mode asli: memanggil Core API `charge` dengan `payment_type = qris`.
 * - Mode `fake` (pengembangan tanpa kredensial): QRIS dibuat lokal dengan
 *   format EMVCo yang valid + CRC16, sehingga UI dan alur checkout bisa diuji
 *   penuh. `MIDTRANS_FAKE=false` wajib di produksi.
 * - Notifikasi: signature SHA-512 diverifikasi, penerapan status idempoten.
 */
class MidtransService
{
    public function __construct(private readonly StockService $stock) {}

    public function isFake(): bool
    {
        return (bool) config('midtrans.fake') || blank(config('midtrans.server_key'));
    }

    /**
     * Buat tagihan QRIS untuk sebuah order.
     */
    public function createQrisCharge(Order $order): Payment
    {
        $expiresAt = now()->addMinutes((int) config('midtrans.expiry_minutes', 15));

        if ($this->isFake()) {
            return Payment::create([
                'order_id' => $order->id,
                'provider' => 'midtrans',
                'transaction_id' => 'fake-'.$order->code,
                'order_id_midtrans' => $order->code,
                'qris_url' => null,
                'qr_string' => $this->fakeQrString($order),
                'gross_amount' => (int) $order->total,
                'status' => Order::PAYMENT_PENDING,
                'payload' => ['mode' => 'fake', 'generated_at' => now()->toIso8601String()],
                'paid_at' => null,
                'expires_at' => $expiresAt,
            ]);
        }

        $this->bootSdk();

        $params = [
            'payment_type' => 'qris',
            'transaction_details' => [
                'order_id' => $order->code,
                'gross_amount' => (int) $order->total,
            ],
            'qris' => ['acquirer' => 'gopay'],
            'enabled_payments' => (array) config('midtrans.enabled_payments', ['other_qris']),
            'customer_details' => [
                'first_name' => $order->customer_name,
                'email' => $order->customer_email,
                'phone' => $order->customer_phone,
                'shipping_address' => [
                    'first_name' => $order->customer_name,
                    'address' => $order->shipping_address,
                    'city' => $order->city,
                    'postal_code' => $order->postal_code,
                    'country_code' => 'IDN',
                ],
            ],
            'custom_expiry' => [
                'expiry_duration' => (int) config('midtrans.expiry_minutes', 15),
                'unit' => 'minute',
            ],
        ];

        try {
            $response = (array) \Midtrans\CoreApi::charge($params);
        } catch (\Throwable $exception) {
            Log::error('Midtrans charge gagal', [
                'order' => $order->code,
                'error' => $exception->getMessage(),
            ]);

            throw new CheckoutException('Gagal membuat pembayaran QRIS. Coba lagi.');
        }

        $qrUrl = null;

        foreach ((array) ($response['actions'] ?? []) as $action) {
            if (($action['name'] ?? null) === 'generate-qr-code') {
                $qrUrl = $action['url'] ?? null;

                break;
            }
        }

        return Payment::create([
            'order_id' => $order->id,
            'provider' => 'midtrans',
            'transaction_id' => isset($response['transaction_id']) ? (string) $response['transaction_id'] : null,
            'order_id_midtrans' => $order->code,
            'qris_url' => $qrUrl,
            'qr_string' => $response['qr_string'] ?? null,
            'gross_amount' => (int) $order->total,
            'status' => $this->mapStatus((string) ($response['transaction_status'] ?? 'pending')) ?? Order::PAYMENT_PENDING,
            'payload' => $response,
            'paid_at' => null,
            'expires_at' => $expiresAt,
        ]);
    }

    /**
     * Verifikasi `signature_key` Midtrans:
     * sha512(order_id . status_code . gross_amount . server_key).
     */
    public function verifySignature(array $payload): bool
    {
        $orderId = (string) ($payload['order_id'] ?? '');
        $statusCode = (string) ($payload['status_code'] ?? '');
        $grossAmount = (string) ($payload['gross_amount'] ?? '');
        $signature = (string) ($payload['signature_key'] ?? '');
        $serverKey = (string) config('midtrans.server_key');

        if ($orderId === '' || $statusCode === '' || $grossAmount === '' || $signature === '') {
            return false;
        }

        // Tanpa server key hanya mode fake yang boleh menerima notifikasi.
        if ($serverKey === '' && ! (bool) config('midtrans.fake')) {
            return false;
        }

        $expected = hash('sha512', $orderId.$statusCode.$grossAmount.$serverKey);

        return hash_equals($expected, $signature);
    }

    /**
     * Terapkan payload notifikasi Midtrans ke payment + order.
     *
     * @return string 'ok' | 'ignored' | 'amount mismatch'
     */
    public function handleNotification(array $payload): string
    {
        $orderId = (string) ($payload['order_id'] ?? '');

        $payment = Payment::query()->where('order_id_midtrans', $orderId)->first();

        if (! $payment) {
            $payment = Order::query()->where('code', $orderId)->first()?->payment;
        }

        if (! $payment) {
            Log::warning('Notifikasi Midtrans untuk order tidak dikenal', ['order_id' => $orderId]);

            return 'ignored';
        }

        $grossAmount = (int) round((float) ($payload['gross_amount'] ?? 0));

        if ($grossAmount !== (int) $payment->gross_amount) {
            Log::warning('Notifikasi Midtrans dengan nominal tidak cocok', [
                'order_id' => $orderId,
                'expected' => (int) $payment->gross_amount,
                'received' => $grossAmount,
            ]);

            return 'amount mismatch';
        }

        $this->applyStatus($payment, (string) ($payload['transaction_status'] ?? ''), $payload);

        return 'ok';
    }

    /**
     * Tanya status transaksi langsung ke Midtrans (dipakai polling halaman bayar).
     */
    public function syncStatus(Payment $payment): void
    {
        if ($this->isFake() || blank($payment->order_id_midtrans)) {
            return;
        }

        $this->bootSdk();

        $response = (array) \Midtrans\Transaction::status((string) $payment->order_id_midtrans);

        $this->applyStatus($payment, (string) ($response['transaction_status'] ?? ''), $response);
    }

    /**
     * Terapkan status transaksi ke `payments` + `orders` secara idempoten.
     */
    public function applyStatus(Payment $payment, string $transactionStatus, array $payload = []): void
    {
        $newStatus = $this->mapStatus($transactionStatus);

        if ($newStatus === null) {
            return;
        }

        DB::transaction(function () use ($payment, $newStatus, $payload): void {
            $locked = Payment::query()->lockForUpdate()->find($payment->id);

            if (! $locked) {
                return;
            }

            $order = Order::query()->lockForUpdate()->find($locked->order_id);

            if (! $order) {
                return;
            }

            $current = (string) $locked->status;

            // Idempoten: status sama → hanya simpan payload terbaru.
            if ($current === $newStatus) {
                if ($payload !== []) {
                    $locked->forceFill(['payload' => $payload])->save();
                }

                return;
            }

            // Settlement bersifat final; status batal tidak bisa berubah lagi.
            if ($current === Order::PAYMENT_SETTLEMENT) {
                return;
            }

            if (in_array($current, [Order::PAYMENT_EXPIRE, Order::PAYMENT_DENY, Order::PAYMENT_CANCEL], true)) {
                return;
            }

            $paymentAttributes = ['status' => $newStatus];

            if ($payload !== []) {
                $paymentAttributes['payload'] = $payload;
            }

            if (filled($payload['transaction_id'] ?? null)) {
                $paymentAttributes['transaction_id'] = (string) $payload['transaction_id'];
            }

            if ($newStatus === Order::PAYMENT_SETTLEMENT && $locked->paid_at === null) {
                $paymentAttributes['paid_at'] = now();
            }

            $locked->forceFill($paymentAttributes)->save();

            $wasPending = $order->status === Order::STATUS_PENDING;
            $orderAttributes = ['payment_status' => $newStatus];

            if ($newStatus === Order::PAYMENT_SETTLEMENT) {
                if ($wasPending) {
                    $orderAttributes['status'] = Order::STATUS_PAID;
                }

                if ($order->paid_at === null) {
                    $orderAttributes['paid_at'] = $locked->paid_at ?? now();
                }

                $order->forceFill($orderAttributes)->save();

                return;
            }

            // expire | deny | cancel
            if ($wasPending) {
                $orderAttributes['status'] = Order::STATUS_CANCELLED;
            }

            $order->forceFill($orderAttributes)->save();

            if ($wasPending) {
                $this->restoreStock($order, $newStatus);
            }
        });
    }

    /**
     * Kembalikan stok semua item order yang batal/kedaluwarsa.
     */
    private function restoreStock(Order $order, string $status): void
    {
        $order->loadMissing('items');

        foreach ($order->items as $item) {
            if (! $item->product_variant_id) {
                continue;
            }

            $variant = ProductVariant::query()->lockForUpdate()->find($item->product_variant_id);

            if (! $variant) {
                continue;
            }

            $this->stock->restoreForCancellation(
                $variant,
                (int) $item->qty,
                sprintf('Pengembalian stok — pembayaran %s (%s)', $status, $order->code),
            );
        }
    }

    /**
     * Padanan `transaction_status` Midtrans → status pembayaran PRD §6.
     */
    public function mapStatus(string $transactionStatus): ?string
    {
        return match ($transactionStatus) {
            'capture', 'settlement' => Order::PAYMENT_SETTLEMENT,
            'pending' => Order::PAYMENT_PENDING,
            'expire' => Order::PAYMENT_EXPIRE,
            'deny' => Order::PAYMENT_DENY,
            'cancel' => Order::PAYMENT_CANCEL,
            default => null,
        };
    }

    private function bootSdk(): void
    {
        \Midtrans\Config::$serverKey = (string) config('midtrans.server_key');
        \Midtrans\Config::$isProduction = (bool) config('midtrans.is_production');
        \Midtrans\Config::$isSanitized = true;
        \Midtrans\Config::$is3ds = true;
    }

    /**
     * QRIS dummy berformat EMVCo (tag 00/01/26/52/53/54/58/59/60/62/63 + CRC16).
     */
    private function fakeQrString(Order $order): string
    {
        $merchantId = (string) config('midtrans.merchant_id');
        $merchantName = (string) (Setting::query()->where('key', 'store_name')->value('value') ?: 'TOKO DASTER KULOT');
        $city = (string) ($order->city ?: 'PEKALONGAN');

        $merchantAccount = $this->tlv('00', 'ID.CO.QRIS.WWW')
            .$this->tlv('01', $merchantId !== '' ? $merchantId : '936000000000000000')
            .$this->tlv('02', 'ID'.str_pad((string) $order->id, 10, '0', STR_PAD_LEFT))
            .$this->tlv('03', 'UMI');

        $payload = $this->tlv('00', '01')
            .$this->tlv('01', '12')
            .$this->tlv('26', $merchantAccount)
            .$this->tlv('52', '5411')
            .$this->tlv('53', '360')
            .$this->tlv('54', (string) (int) $order->total)
            .$this->tlv('58', 'ID')
            .$this->tlv('59', mb_substr($merchantName, 0, 25))
            .$this->tlv('60', mb_substr($city, 0, 15))
            .$this->tlv('62', $this->tlv('05', $order->code));

        $crc = $this->crc16($payload.'6304');

        return $payload.'6304'.strtoupper(str_pad(dechex($crc), 4, '0', STR_PAD_LEFT));
    }

    private function tlv(string $tag, string $value): string
    {
        return $tag.str_pad((string) strlen($value), 2, '0', STR_PAD_LEFT).$value;
    }

    /**
     * CRC16-CCITT (FALSE), poly 0x1021, init 0xFFFF — standar QRIS.
     */
    private function crc16(string $data): int
    {
        $crc = 0xFFFF;

        for ($i = 0, $length = strlen($data); $i < $length; $i++) {
            $crc ^= ord($data[$i]) << 8;

            for ($bit = 0; $bit < 8; $bit++) {
                $crc = ($crc & 0x8000) ? (($crc << 1) ^ 0x1021) : ($crc << 1);
                $crc &= 0xFFFF;
            }
        }

        return $crc;
    }
}

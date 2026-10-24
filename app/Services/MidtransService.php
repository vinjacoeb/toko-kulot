<?php

namespace App\Services;

use App\Exceptions\CheckoutException;
use App\Models\Order;
use App\Models\Payment;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Services\Midtrans\MidtransApi;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Integrasi pembayaran Midtrans Snap (PRD-v1.1 §2, D1).
 *
 * - Mode asli: membuat transaksi lewat Snap (`POST /snap/v1/transactions`)
 *   sehingga semua kanal yang aktif di akun merchant tampil. `snap_token` dan
 *   `snap_redirect_url` disimpan di `payments`; `payment_type` baru diketahui
 *   saat webhook (Core API QRIS lama tidak dipakai lagi).
 * - `order_id` Midtrans jalur asli = `orders.code` + sufiks acak per panggilan
 *   Snap (`nextMidtransOrderId()`); `orders.code` tetap kode pesanan yang
 *   tampil ke pembeli/admin (tanpa sufiks).
 * - Mode `fake` (pengembangan tanpa kredensial): tagihan dibuat lokal dengan
 *   QRIS dummy + panel simulasi; `simulateSuccess()` menandai lunas lewat jalur
 *   service. `MIDTRANS_FAKE=false` wajib di produksi.
 * - Notifikasi: signature SHA-512 diverifikasi, penerapan status idempoten,
 *   `payment_type` disimpan, `orders.payment_method` diisi saat settlement.
 * - Panggilan jaringan lewat `MidtransApi` (seam yang bisa diganti di test).
 * - Dipakai juga oleh aksi admin "Sinkronkan status pembayaran" (kontrak §12.24).
 */
class MidtransService
{
    /** Kode alasan mode uji → teks siap tampil (kontrak props §7.5, §7.7, §10.7). */
    private const MODE_REASONS = [
        'fake_aktif' => 'MODE UJI aktif karena MIDTRANS_FAKE=true di .env: pembayaran disimulasikan lokal (tanpa Midtrans).',
        'server_key_kosong' => 'MODE UJI aktif karena MIDTRANS_SERVER_KEY di .env masih kosong: pembayaran disimulasikan lokal (tanpa Midtrans).',
    ];

    /** Langkah perbaikan untuk pemilik, per kode alasan mode uji. */
    private const MODE_FIX_STEPS = [
        'fake_aktif' => [
            'Ubah MIDTRANS_FAKE=false pada berkas .env.',
            'Isi MIDTRANS_CLIENT_KEY dan MIDTRANS_SERVER_KEY dari dashboard Midtrans.',
            'Jalankan php artisan config:clear, lalu muat ulang halaman pembayaran.',
        ],
        'server_key_kosong' => [
            'Isi MIDTRANS_SERVER_KEY (dan MIDTRANS_CLIENT_KEY) dari dashboard Midtrans pada berkas .env.',
            'Pastikan MIDTRANS_FAKE tidak true pada berkas .env.',
            'Jalankan php artisan config:clear, lalu muat ulang halaman pembayaran.',
        ],
    ];

    /** Sumber kredensial efektif — ditulis di props agar tab admin tidak menyesatkan. */
    private const CREDENTIAL_SOURCE = '.env (MIDTRANS_*)';

    private const CREDENTIAL_NOTE = 'Kredensial efektif dibaca dari .env (MIDTRANS_*); kolom Midtrans pada tab Pembayaran admin belum dipakai jalur pembayaran ini.';

    /**
     * Bawaan masa berlaku tagihan dalam menit bila konfigurasi hilang atau
     * tidak sah — keputusan pemilik 21 Oktober 2026: 5 menit.
     */
    public const DEFAULT_EXPIRY_MINUTES = 5;

    /** Batas panjang `order_id` Midtrans; kolom `payments.order_id_midtrans` = 60. */
    private const MIDTRANS_ORDER_ID_MAX_LENGTH = 60;

    /** Panjang sufiks acak pada `order_id` Midtrans per panggilan Snap. */
    private const MIDTRANS_ORDER_ID_SUFFIX_LENGTH = 6;

    /** Batas kolom `payments.payment_type`. */
    private const PAYMENT_TYPE_MAX_LENGTH = 40;

    /**
     * Pesan siap tampil saat Midtrans menolak transaksi karena kanal belum
     * aktif (402) — yang bisa diperbaiki pemilik hanya aktivasi kanal di
     * dashboard, jadi pesannya menyebut itu, bukan "Coba lagi.".
     */
    public const CHANNEL_INACTIVE_MESSAGE = 'Pembayaran belum bisa dibuat karena kanal pembayaran belum aktif di akun Midtrans penjual. Hubungi penjual.';

    public function __construct(
        private readonly StockService $stock,
        private readonly MidtransApi $api,
    ) {}

    /**
     * Status mode pembayaran efektif untuk UI (kontrak §7.5, baku juga dipakai
     * §7.7 dan §10.7).
     *
     * @return array<string, mixed>
     */
    public function modeInfo(): array
    {
        $fakeFlag = (bool) config('midtrans.fake');
        $serverKeyFilled = ! blank(config('midtrans.server_key'));

        $reasonCode = match (true) {
            $fakeFlag => 'fake_aktif',
            $serverKeyFilled => null,
            default => 'server_key_kosong',
        };

        return [
            'client_key' => $this->isFake() || blank(config('midtrans.client_key')) ? null : (string) config('midtrans.client_key'),
            'is_production' => (bool) config('midtrans.is_production'),
            'fake' => $this->isFake(),
            'mode' => $reasonCode === null ? 'asli' : 'uji',
            'alasan_kode' => $reasonCode,
            'alasan' => $reasonCode === null ? null : self::MODE_REASONS[$reasonCode],
            'langkah_perbaikan' => $reasonCode === null ? [] : self::MODE_FIX_STEPS[$reasonCode],
            'server_key_terisi' => $serverKeyFilled,
            'sumber_kredensial' => self::CREDENTIAL_SOURCE,
            'catatan' => self::CREDENTIAL_NOTE,
        ];
    }

    public function isFake(): bool
    {
        return (bool) config('midtrans.fake') || blank(config('midtrans.server_key'));
    }

    /**
     * Masa berlaku tagihan dalam menit — SATU sumber untuk parameter Snap
     * (`expiry`) dan kolom `payments.expires_at` supaya keduanya tidak pernah
     * berbeda.
     */
    public function expiryMinutes(): int
    {
        $minutes = (int) config('midtrans.expiry_minutes', self::DEFAULT_EXPIRY_MINUTES);

        return $minutes > 0 ? $minutes : self::DEFAULT_EXPIRY_MINUTES;
    }

    /**
     * Buat transaksi Snap untuk sebuah order — pengganti charge QRIS Core API.
     */
    public function createSnapTransaction(Order $order): Payment
    {
        $expiresAt = $this->expiresAt();

        if ($this->isFake()) {
            return Payment::create([
                'order_id' => $order->id,
                'provider' => 'midtrans',
                'transaction_id' => 'fake-'.$order->code,
                'order_id_midtrans' => $order->code,
                'snap_token' => null,
                'snap_redirect_url' => null,
                'payment_type' => null,
                'qris_url' => null,
                'qr_string' => $this->fakeQrString($order),
                'gross_amount' => (int) $order->total,
                'status' => Order::PAYMENT_PENDING,
                'payload' => ['mode' => 'fake', 'generated_at' => now()->toIso8601String()],
                'paid_at' => null,
                'expires_at' => $expiresAt,
            ]);
        }

        $midtransOrderId = $this->nextMidtransOrderId($order);
        $response = $this->snapOrder($order, $midtransOrderId);

        return Payment::create([
            'order_id' => $order->id,
            'provider' => 'midtrans',
            'transaction_id' => isset($response['transaction_id']) ? (string) $response['transaction_id'] : null,
            'order_id_midtrans' => $midtransOrderId,
            'snap_token' => isset($response['token']) ? (string) $response['token'] : null,
            'snap_redirect_url' => isset($response['redirect_url']) ? (string) $response['redirect_url'] : null,
            'payment_type' => $this->paymentTypeFrom($response),
            'qris_url' => null,
            'qr_string' => null,
            'gross_amount' => (int) $order->total,
            'status' => $this->mapStatus((string) ($response['transaction_status'] ?? 'pending')) ?? Order::PAYMENT_PENDING,
            'payload' => $response,
            'paid_at' => null,
            'expires_at' => $expiresAt,
        ]);
    }

    /**
     * Apakah baris tagihan ini dibuat tanpa Midtrans (mode uji)?
     */
    public function isFakeCharge(?Payment $payment): bool
    {
        if (! $payment instanceof Payment) {
            return false;
        }

        return ($payment->payload['mode'] ?? null) === 'fake'
            || str_starts_with((string) $payment->transaction_id, 'fake-');
    }

    /**
     * Tagihan tersimpan masih mode uji padahal mode efektif sudah asli:
     * tagihan harus dibuat ulang supaya pembayaran benar-benar bisa dilakukan.
     */
    public function needsRegeneration(?Payment $payment): bool
    {
        return $payment instanceof Payment
            && $payment->exists
            && ! $this->isFake()
            && $this->isFakeCharge($payment)
            && $payment->status === Order::PAYMENT_PENDING
            && $payment->paid_at === null;
    }

    /**
     * Buat ulang tagihan pada BARIS `payments` YANG SAMA (satu tagihan per
     * pesanan). Baris dikunci agar dua permintaan sekaligus tidak membuat dua
     * transaksi Snap untuk order yang sama. Gagal menghubungi Midtrans →
     * `CheckoutException` (pemanggil menampilkan galat, baris lama dibiarkan).
     */
    public function regenerateCharge(Payment $payment, Order $order): Payment
    {
        if (! $this->needsRegeneration($payment)) {
            return $payment;
        }

        return DB::transaction(function () use ($payment, $order): Payment {
            $locked = Payment::query()->lockForUpdate()->find($payment->id);

            if (! $locked instanceof Payment || ! $this->needsRegeneration($locked)) {
                return $locked instanceof Payment ? $locked : $payment;
            }

            $midtransOrderId = $this->nextMidtransOrderId($order);
            $response = $this->snapOrder($order, $midtransOrderId);

            $locked->forceFill([
                'transaction_id' => isset($response['transaction_id']) ? (string) $response['transaction_id'] : null,
                'order_id_midtrans' => $midtransOrderId,
                'snap_token' => isset($response['token']) ? (string) $response['token'] : null,
                'snap_redirect_url' => isset($response['redirect_url']) ? (string) $response['redirect_url'] : null,
                'payment_type' => $this->paymentTypeFrom($response),
                'qris_url' => null,
                'qr_string' => null,
                'gross_amount' => (int) $order->total,
                'status' => $this->mapStatus((string) ($response['transaction_status'] ?? 'pending')) ?? Order::PAYMENT_PENDING,
                'payload' => $response,
                'expires_at' => $this->expiresAt(),
            ])->save();

            return $locked;
        });
    }

    /**
     * Simulasi pembayaran berhasil (mode fake) — satu-satunya jalur yang boleh
     * menandai tagihan uji lunas; dipanggil server dari panel simulasi, bukan
     * nilai dari frontend. Menolak tagihan Midtrans asli dan mode asli.
     */
    public function simulateSuccess(Payment $payment): void
    {
        if (! $this->isFake()) {
            throw new CheckoutException('Simulasi pembayaran hanya tersedia dalam mode uji Midtrans.');
        }

        if (! $this->isFakeCharge($payment)) {
            throw new CheckoutException('Tagihan ini dibuat Midtrans asli, jadi tidak bisa disimulasikan.');
        }

        $this->applyStatus($payment, 'settlement', [
            'order_id' => $payment->order_id_midtrans,
            'transaction_id' => $payment->transaction_id,
            'transaction_status' => 'settlement',
            'payment_type' => 'qris',
            'gross_amount' => number_format((int) $payment->gross_amount, 2, '.', ''),
            'simulated' => true,
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
     * Best effort: kegagalan jaringan dicatat ke log, tidak mengganggu respons.
     */
    public function syncStatus(Payment $payment): void
    {
        if ($this->isFake() || blank($payment->order_id_midtrans)) {
            return;
        }

        try {
            $response = $this->api->status((string) $payment->order_id_midtrans);
        } catch (\Throwable $exception) {
            Log::warning('Sinkronisasi status Midtrans gagal', [
                'order' => (string) $payment->order_id_midtrans,
                'error' => $exception->getMessage(),
            ]);

            return;
        }

        $this->applyStatus($payment, (string) ($response['transaction_status'] ?? ''), $response);
    }

    /**
     * Seperti `syncStatus()`, tetapi kegagalan DILAPORKAN ke pemanggil — dipakai
     * aksi admin "Sinkronkan status pembayaran" supaya admin melihat galat.
     */
    public function syncStatusOrFail(Payment $payment): void
    {
        if ($this->isFake()) {
            throw new CheckoutException('Mode uji Midtrans: status tidak bisa disinkronkan.');
        }

        if (blank($payment->order_id_midtrans)) {
            throw new CheckoutException('Pesanan ini belum punya ID transaksi Midtrans, jadi status tidak bisa disinkronkan.');
        }

        $response = $this->api->status((string) $payment->order_id_midtrans);

        $this->applyStatus($payment, (string) ($response['transaction_status'] ?? ''), $response);
    }

    /**
     * Terapkan status transaksi ke `payments` + `orders` secara idempoten.
     *
     * `payment_type` dari payload selalu disimpan (walau status sama) dan
     * `orders.payment_method` diisi saat settlement — PRD-v1.1 §2.
     */
    public function applyStatus(Payment $payment, string $transactionStatus, array $payload = []): void
    {
        $newStatus = $this->mapStatus($transactionStatus);

        if ($newStatus === null) {
            return;
        }

        $paymentType = $this->paymentTypeFrom($payload);

        DB::transaction(function () use ($payment, $newStatus, $payload, $paymentType): void {
            $locked = Payment::query()->lockForUpdate()->find($payment->id);

            if (! $locked) {
                return;
            }

            $order = Order::query()->lockForUpdate()->find($locked->order_id);

            if (! $order) {
                return;
            }

            $current = (string) $locked->status;

            // Idempoten: status sama → simpan payload/tipe terbaru saja.
            if ($current === $newStatus) {
                $attributes = [];

                if ($payload !== []) {
                    $attributes['payload'] = $payload;
                }

                if ($paymentType !== null) {
                    $attributes['payment_type'] = $paymentType;
                }

                if ($attributes !== []) {
                    $locked->forceFill($attributes)->save();
                }

                $this->fillOrderPaymentMethod($order, $newStatus, $paymentType);

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

            if ($paymentType !== null) {
                $paymentAttributes['payment_type'] = $paymentType;
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

                if ($paymentType !== null) {
                    $orderAttributes['payment_method'] = $paymentType;
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
     * Notifikasi ulang saat status sudah settlement: `payment_type` tetap
     * disimpan dan `orders.payment_method` diganti dari `midtrans` ke tipe asli.
     */
    private function fillOrderPaymentMethod(Order $order, string $newStatus, ?string $paymentType): void
    {
        if ($newStatus !== Order::PAYMENT_SETTLEMENT || $paymentType === null) {
            return;
        }

        if ((string) $order->payment_method === $paymentType) {
            return;
        }

        $order->forceFill(['payment_method' => $paymentType])->save();
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
     * `bank_transfer`/`echannel`/`qris` hanya memengaruhi `payment_type`, bukan
     * status: settlement tetap settlement.
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

    private function expiresAt(): Carbon
    {
        return now()->addMinutes($this->expiryMinutes());
    }

    /**
     * `order_id` Midtrans untuk SATU panggilan Snap: `orders.code` + sufiks
     * acak 6 karakter hex. Kode pesanan yang tampil ke pembeli/admin tetap
     * tanpa sufiks; sufiks mencegah `order_id` terpakai saat Snap dipanggil
     * ulang (Midtrans menolaknya 406).
     */
    private function nextMidtransOrderId(Order $order): string
    {
        $base = mb_substr(
            (string) $order->code,
            0,
            self::MIDTRANS_ORDER_ID_MAX_LENGTH - self::MIDTRANS_ORDER_ID_SUFFIX_LENGTH - 1,
        );

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $suffix = strtoupper(bin2hex(random_bytes(intdiv(self::MIDTRANS_ORDER_ID_SUFFIX_LENGTH, 2))));
            $candidate = $base.'-'.$suffix;

            if (! Payment::query()->where('order_id_midtrans', $candidate)->exists()) {
                return $candidate;
            }
        }

        // Praktis tidak tercapai (ruang 16,7 juta per detik); tetap acak.
        return $base.'-'.strtoupper(bin2hex(random_bytes(intdiv(self::MIDTRANS_ORDER_ID_SUFFIX_LENGTH, 2))));
    }

    /**
     * Parameter Snap. Tanpa `enabled_payments` (A21): Snap menampilkan semua
     * kanal yang aktif di akun Midtrans pemilik.
     *
     * @return array<string, mixed>
     */
    private function snapParams(Order $order, string $midtransOrderId): array
    {
        return [
            'transaction_details' => [
                'order_id' => $midtransOrderId,
                'gross_amount' => (int) $order->total,
            ],
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
            'expiry' => [
                'unit' => 'minute',
                'duration' => $this->expiryMinutes(),
            ],
        ];
    }

    /**
     * Panggil Snap; kegagalan jadi `CheckoutException` dengan pesan siap
     * tampil. 402 kanal belum aktif → pesan aktivasi, bukan "coba lagi".
     *
     * @return array<string, mixed>
     */
    private function snapOrder(Order $order, string $midtransOrderId): array
    {
        try {
            return $this->api->snap($this->snapParams($order, $midtransOrderId));
        } catch (\Throwable $exception) {
            $channelInactive = $this->isChannelInactive($exception);

            Log::error('Midtrans Snap gagal', [
                'order' => $order->code,
                'midtrans_order_id' => $midtransOrderId,
                'channel_inactive' => $channelInactive,
                'error' => $this->redactSecret($exception->getMessage()),
                'exception' => $exception::class,
                'code' => $exception->getCode(),
                'previous' => $this->previousExceptions($exception->getPrevious()),
            ]);

            if ($channelInactive) {
                throw new CheckoutException(self::CHANNEL_INACTIVE_MESSAGE, 0, $exception);
            }

            throw $exception instanceof CheckoutException
                ? $exception
                : new CheckoutException('Gagal membuat pembayaran. Coba lagi.', 0, $exception);
        }
    }

    /**
     * `payment_type` dari payload Midtrans, dibatasi panjang kolom. Nilai
     * contoh: `bank_transfer`, `echannel`, `qris`, `gopay`.
     */
    private function paymentTypeFrom(array $payload): ?string
    {
        $type = strtolower(trim((string) ($payload['payment_type'] ?? '')));

        return $type === '' ? null : mb_substr($type, 0, self::PAYMENT_TYPE_MAX_LENGTH);
    }

    /**
     * Apakah kegagalan berarti kanal pembayaran belum aktif di akun merchant
     * (HTTP 402 / "Payment channel is not activated").
     */
    private function isChannelInactive(\Throwable $exception): bool
    {
        for ($current = $exception; $current !== null; $current = $current->getPrevious()) {
            if ((int) $current->getCode() === 402) {
                return true;
            }

            if (stripos($current->getMessage(), 'payment channel is not activated') !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Rantai `getPrevious()` sebagai daftar kelas/kode/pesan (maks 5 tingkat),
     * supaya sebab asli dari SDK terbaca di log tanpa membuka argumen panggilan.
     *
     * @return array<int, array{class: string, code: int|string, message: string}>
     */
    private function previousExceptions(?\Throwable $exception, int $depth = 1): array
    {
        if ($exception === null || $depth > 5) {
            return [];
        }

        return array_merge([[
            'class' => $exception::class,
            'code' => $exception->getCode(),
            'message' => $this->redactSecret($exception->getMessage()),
        ]], $this->previousExceptions($exception->getPrevious(), $depth + 1));
    }

    /**
     * Buang kredensial Midtrans dari teks yang akan dilog.
     */
    private function redactSecret(string $text): string
    {
        foreach ([config('midtrans.server_key'), config('midtrans.client_key')] as $secret) {
            if (is_string($secret) && mb_strlen($secret) >= 8) {
                $text = str_replace($secret, '[DISENSOR]', $text);
            }
        }

        return $text;
    }

    /**
     * QRIS dummy berformat EMVCo untuk panel simulasi mode uji.
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

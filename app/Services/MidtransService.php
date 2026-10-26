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
 * Integrasi pembayaran Midtrans Core API — 8 kanal (PRD-v1.2 §2).
 *
 * - Satu baris `payments` per pesanan. Checkout hanya membuat baris `pending`
 *   tanpa kanal; charge baru dibuat saat pembeli memilih kanal (§7.7a).
 * - `payments.payment_type` menyimpan **id kanal** (`qris`, `bca_va`, …),
 *   bukan `payment_type` generik Midtrans. `order_id_midtrans` =
 *   `orders.code` untuk charge pertama, lalu `orders.code-2`, `orders.code-3`, …
 * - Idempoten: kanal sama & belum kedaluwarsa tidak di-charge ulang.
 * - Mode `fake` (pengembangan tanpa kredensial): tagihan dibuat lokal tanpa
 *   jaringan; `simulateSuccess()` menandai lunas lewat jalur service.
 * - Notifikasi: signature SHA-512 diverifikasi, penerapan status idempoten,
 *   `orders.payment_method` diisi id kanal saat settlement.
 * - Panggilan jaringan lewat `MidtransApi` (seam yang bisa diganti di test).
 */
class MidtransService
{
    /**
     * 8 kanal PRD-v1.2 §2.2 — urutan tampil di halaman bayar.
     *
     * @var array<string, array{label: string, grup: string}>
     */
    public const CHANNELS = [
        'qris' => ['label' => 'QRIS (GoPay, OVO, DANA, m-banking)', 'grup' => 'qris'],
        'bca_va' => ['label' => 'Transfer BCA Virtual Account', 'grup' => 'va'],
        'bni_va' => ['label' => 'Transfer BNI Virtual Account', 'grup' => 'va'],
        'bri_va' => ['label' => 'Transfer BRI Virtual Account', 'grup' => 'va'],
        'permata_va' => ['label' => 'Transfer Permata Virtual Account', 'grup' => 'va'],
        'mandiri_bill' => ['label' => 'Mandiri Bill Payment', 'grup' => 'bill'],
        'alfamart' => ['label' => 'Bayar di Alfamart', 'grup' => 'gerai'],
        'indomaret' => ['label' => 'Bayar di Indomaret', 'grup' => 'gerai'],
    ];

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
     * Bawaan masa berlaku tagihan QRIS dalam menit bila konfigurasi hilang atau
     * tidak sah — keputusan pemilik 21 Oktober 2026: 5 menit.
     */
    public const DEFAULT_EXPIRY_MINUTES = 5;

    /** Bawaan masa berlaku kanal VA / Mandiri Bill / gerai: 60 menit (PRD-v1.2 §2.2). */
    public const DEFAULT_EXPIRY_VA_MINUTES = 60;

    /** Batas panjang `order_id` Midtrans; kolom `payments.order_id_midtrans` = 60. */
    private const MIDTRANS_ORDER_ID_MAX_LENGTH = 60;

    /** Batas kolom `payments.payment_type`. */
    private const PAYMENT_TYPE_MAX_LENGTH = 40;

    /**
     * Pesan siap tampil saat Midtrans menolak charge karena kanal belum aktif
     * (402) — yang bisa diperbaiki hanya aktivasi kanal di dashboard.
     */
    public const CHANNEL_INACTIVE_MESSAGE = 'Kanal ini belum aktif di Midtrans. Hubungi admin.';

    public const GALAT_UMUM = 'Gagal membuat pembayaran. Coba lagi.';

    public const GALAT_KANAL = 'Kanal pembayaran tidak dikenal.';

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
     * Masa berlaku tagihan QRIS dalam menit — satu sumber untuk parameter charge
     * dan kolom `payments.expires_at`.
     */
    public function expiryMinutes(): int
    {
        $minutes = (int) config('midtrans.expiry_minutes', self::DEFAULT_EXPIRY_MINUTES);

        return $minutes > 0 ? $minutes : self::DEFAULT_EXPIRY_MINUTES;
    }

    /**
     * Masa berlaku kanal non-QRIS (VA / Mandiri Bill / gerai), bawaan 60 menit.
     */
    public function expiryVaMinutes(): int
    {
        $minutes = (int) config('midtrans.expiry_va_minutes', self::DEFAULT_EXPIRY_VA_MINUTES);

        return $minutes > 0 ? $minutes : self::DEFAULT_EXPIRY_VA_MINUTES;
    }

    /**
     * Masa berlaku per kanal: QRIS `MIDTRANS_EXPIRY_MINUTES`, lainnya
     * `MIDTRANS_EXPIRY_VA_MINUTES` (bawaan 60).
     */
    public function expiryMinutesFor(?string $channelId): int
    {
        if (($this->channel($channelId)['grup'] ?? null) === 'qris') {
            return $this->expiryMinutes();
        }

        return $this->expiryVaMinutes();
    }

    /**
     * Daftar kanal untuk props halaman bayar (`pembayaran.kanal`, §7.7).
     *
     * @return array<int, array{id: string, label: string, grup: string}>
     */
    public function channels(): array
    {
        $channels = [];

        foreach (self::CHANNELS as $id => $meta) {
            $channels[] = ['id' => $id, 'label' => $meta['label'], 'grup' => $meta['grup']];
        }

        return $channels;
    }

    /**
     * @return array{id: string, label: string, grup: string}|null
     */
    public function channel(?string $channelId): ?array
    {
        if ($channelId === null || ! isset(self::CHANNELS[$channelId])) {
            return null;
        }

        return [
            'id' => $channelId,
            'label' => self::CHANNELS[$channelId]['label'],
            'grup' => self::CHANNELS[$channelId]['grup'],
        ];
    }

    /**
     * Kanal yang sedang dipakai baris tagihan (`pembayaran.metode`, §7.7).
     *
     * @return array{id: string, label: string, grup: string}|null
     */
    public function channelOf(?Payment $payment): ?array
    {
        return $this->channel($payment?->payment_type);
    }

    /**
     * Data bayar siap tampil (`pembayaran.instruksi`, §7.7). Semua key selalu
     * ada; yang tidak relevan `null`. `null` bila kanal belum dipilih.
     *
     * @return array<string, string|null>|null
     */
    public function instructions(?Payment $payment): ?array
    {
        $channel = $this->channelOf($payment);

        if ($payment === null || $channel === null) {
            return null;
        }

        $payload = is_array($payment->payload) ? $payment->payload : [];

        $instructions = [
            'jenis' => $channel['grup'],
            'nomor_va' => null,
            'bank' => null,
            'biller_code' => null,
            'bill_key' => null,
            'payment_code' => null,
            'store' => null,
            'qr_url' => null,
            'qr_string' => null,
        ];

        switch ($channel['grup']) {
            case 'qris':
                $instructions['qr_url'] = $this->stringOrNull($payment->qris_url) ?? $this->qrUrl($payload);
                $instructions['qr_string'] = $this->stringOrNull($payment->qr_string)
                    ?? $this->stringOrNull($payload['qr_string'] ?? null);
                break;

            case 'va':
                if ($channel['id'] === 'permata_va') {
                    $instructions['bank'] = 'Permata';
                    $instructions['nomor_va'] = $this->stringOrNull($payload['permata_va_number'] ?? null);
                    break;
                }

                $va = (array) ($payload['va_numbers'][0] ?? []);
                $instructions['bank'] = strtoupper((string) ($va['bank'] ?? substr($channel['id'], 0, -3)));
                $instructions['nomor_va'] = $this->stringOrNull($va['va_number'] ?? null);
                break;

            case 'bill':
                $instructions['bank'] = 'Mandiri';
                $instructions['biller_code'] = $this->stringOrNull($payload['biller_code'] ?? null);
                $instructions['bill_key'] = $this->stringOrNull($payload['bill_key'] ?? null);
                break;

            case 'gerai':
                $instructions['store'] = ucfirst((string) ($payload['store'] ?? $channel['id']));
                $instructions['payment_code'] = $this->stringOrNull($payload['payment_code'] ?? null);
                break;
        }

        return $instructions;
    }

    /**
     * Buat / ganti tagihan untuk kanal pilihan pembeli (§7.7a) pada BARIS
     * `payments` yang sama. Baris dikunci agar dua permintaan sekaligus tidak
     * membuat dua charge. Gagal → `CheckoutException`, baris tidak berubah.
     */
    public function startCharge(Order $order, Payment $payment, string $channelId): Payment
    {
        if ($this->channel($channelId) === null) {
            throw new CheckoutException(self::GALAT_KANAL);
        }

        return DB::transaction(function () use ($order, $payment, $channelId): Payment {
            $locked = Payment::query()->lockForUpdate()->find($payment->id);

            if (! $locked instanceof Payment || (int) $locked->order_id !== (int) $order->id) {
                throw new CheckoutException(self::GALAT_UMUM);
            }

            if ($locked->status !== Order::PAYMENT_PENDING || $locked->paid_at !== null) {
                return $locked;
            }

            $stillValid = $locked->payment_type === $channelId
                && filled($locked->order_id_midtrans)
                && $locked->expires_at !== null
                && $locked->expires_at->isFuture();

            if ($stillValid) {
                return $locked;
            }

            $midtransOrderId = $this->nextMidtransOrderId($order, $locked);
            $response = $this->isFake()
                ? $this->fakeCharge($order, $channelId, $midtransOrderId)
                : $this->chargeOrder($order, $channelId, $midtransOrderId);

            $locked->forceFill([
                'transaction_id' => isset($response['transaction_id']) ? (string) $response['transaction_id'] : null,
                'order_id_midtrans' => $midtransOrderId,
                'payment_type' => $channelId,
                'qris_url' => $this->qrUrl($response),
                'qr_string' => $this->stringOrNull($response['qr_string'] ?? null),
                'gross_amount' => (int) $order->total,
                'status' => $this->mapStatus((string) ($response['transaction_status'] ?? 'pending')) ?? Order::PAYMENT_PENDING,
                'payload' => $response,
                'expires_at' => $this->expiresAt($channelId),
            ])->save();

            return $locked;
        });
    }

    /**
     * Baris tagihan awal saat checkout — belum ada kanal, belum ada charge
     * (PRD-v1.2 §2.3). Charge dibuat saat pembeli memilih kanal (§7.7a).
     */
    public function createPendingPayment(Order $order): Payment
    {
        return Payment::create([
            'order_id' => $order->id,
            'provider' => 'midtrans',
            'status' => Order::PAYMENT_PENDING,
            'gross_amount' => (int) $order->total,
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
            'payment_type' => $payment->payment_type ?: 'qris',
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
     * Id kanal (PRD-v1.2 §2.4) tidak ditimpa `payment_type` generik dari
     * payload notifikasi; payload hanya mengisi bila kolom masih kosong.
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

            $paymentType = filled($locked->payment_type)
                ? (string) $locked->payment_type
                : $this->paymentTypeFrom($payload);

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

    private function expiresAt(string $channelId): Carbon
    {
        return now()->addMinutes($this->expiryMinutesFor($channelId));
    }

    /**
     * `order_id` Midtrans: `orders.code` untuk charge pertama, lalu
     * `orders.code-2`, `orders.code-3`, … saat ganti kanal (§7.7a).
     */
    private function nextMidtransOrderId(Order $order, Payment $payment): string
    {
        $base = mb_substr((string) $order->code, 0, 50);
        $current = (string) $payment->order_id_midtrans;
        $sequence = 1;

        if ($current === $base) {
            $sequence = 2;
        } elseif (preg_match('/^'.preg_quote($base, '/').'-(\d+)$/', $current, $matches) === 1) {
            $sequence = (int) $matches[1] + 1;
        }

        $candidate = $sequence === 1 ? $base : $base.'-'.$sequence;

        while (Payment::query()
            ->where('order_id_midtrans', $candidate)
            ->whereKeyNot($payment->id)
            ->exists()) {
            $sequence++;
            $candidate = $base.'-'.$sequence;
        }

        return mb_substr($candidate, 0, self::MIDTRANS_ORDER_ID_MAX_LENGTH);
    }

    /**
     * Parameter Core API charge per kanal (PRD-v1.2 §2.2).
     *
     * @return array<string, mixed>
     */
    private function chargeParams(Order $order, string $channelId, string $midtransOrderId): array
    {
        $group = self::CHANNELS[$channelId]['grup'];

        $params = [
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
            'custom_expiry' => [
                'expiry_duration' => $this->expiryMinutesFor($channelId),
                'unit' => 'minute',
            ],
        ];

        switch ($group) {
            case 'qris':
                $params['payment_type'] = 'qris';
                $params['qris'] = ['acquirer' => (string) config('midtrans.qris_acquirer', 'gopay')];
                break;

            case 'va':
                $params['payment_type'] = 'bank_transfer';
                $params['bank_transfer'] = ['bank' => substr($channelId, 0, -3)];
                break;

            case 'bill':
                $params['payment_type'] = 'echannel';
                $params['echannel'] = [
                    'bill_info1' => 'Pembayaran:',
                    'bill_info2' => 'Belanja online',
                ];
                break;

            case 'gerai':
                $params['payment_type'] = 'cstore';
                $params['cstore'] = ['store' => $channelId, 'message' => 'Belanja online'];
                break;
        }

        return $params;
    }

    /**
     * Panggil Core API; kegagalan jadi `CheckoutException` dengan pesan siap
     * tampil. 402 kanal belum aktif → pesan aktivasi, bukan "coba lagi".
     *
     * @return array<string, mixed>
     */
    private function chargeOrder(Order $order, string $channelId, string $midtransOrderId): array
    {
        try {
            return $this->api->charge($this->chargeParams($order, $channelId, $midtransOrderId));
        } catch (\Throwable $exception) {
            $channelInactive = $this->isChannelInactive($exception);

            Log::error('Midtrans charge gagal', [
                'order' => $order->code,
                'kanal' => $channelId,
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
                : new CheckoutException(self::GALAT_UMUM, 0, $exception);
        }
    }

    /**
     * Tagihan lokal mode uji — bentuk payload sama dengan respons Core API
     * supaya `instructions()` tidak butuh cabang mode.
     *
     * @return array<string, mixed>
     */
    private function fakeCharge(Order $order, string $channelId, string $midtransOrderId): array
    {
        $group = self::CHANNELS[$channelId]['grup'];

        $response = [
            'status_code' => '200',
            'status_message' => 'Success',
            'transaction_id' => 'fake-'.$midtransOrderId,
            'order_id' => $midtransOrderId,
            'gross_amount' => number_format((int) $order->total, 2, '.', ''),
            'payment_type' => match ($group) {
                'qris' => 'qris',
                'va' => 'bank_transfer',
                'bill' => 'echannel',
                default => 'cstore',
            },
            'transaction_status' => 'pending',
            'transaction_time' => now()->toDateTimeString(),
            'mode' => 'fake',
        ];

        if ($group === 'qris') {
            $response['qr_string'] = $this->fakeQrString($order);
            $response['actions'] = [['name' => 'generate-qr-code', 'method' => 'GET', 'url' => null]];

            return $response;
        }

        if ($group === 'va') {
            $bank = substr($channelId, 0, -3);
            $number = $this->fakeVaNumber($order, $bank);

            if ($bank === 'permata') {
                $response['permata_va_number'] = $number;
            } else {
                $response['va_numbers'] = [['bank' => $bank, 'va_number' => $number]];
            }

            return $response;
        }

        if ($group === 'bill') {
            $response['biller_code'] = '7777';
            $response['bill_key'] = str_pad((string) (700000000000 + $order->id), 12, '0', STR_PAD_LEFT);

            return $response;
        }

        $response['store'] = $channelId;
        $response['payment_code'] = str_pad((string) (100000000000 + $order->id), 12, '0', STR_PAD_LEFT);

        return $response;
    }

    private function fakeVaNumber(Order $order, string $bank): string
    {
        $prefix = match ($bank) {
            'bca' => '8808',
            'bni' => '9888',
            'bri' => '7777',
            'permata' => '8562',
            default => '8888',
        };

        $length = $bank === 'permata' ? 16 : 12;

        return $prefix.str_pad((string) $order->id, $length - strlen($prefix), '0', STR_PAD_LEFT);
    }

    /**
     * URL gambar QR dari `actions[]` respons charge.
     *
     * @param  array<string, mixed>  $payload
     */
    private function qrUrl(array $payload): ?string
    {
        foreach ((array) ($payload['actions'] ?? []) as $action) {
            if (is_array($action) && ($action['name'] ?? null) === 'generate-qr-code') {
                return $this->stringOrNull($action['url'] ?? null);
            }
        }

        return null;
    }

    private function stringOrNull(mixed $value): ?string
    {
        if (! is_scalar($value)) {
            return null;
        }

        $text = trim((string) $value);

        return $text === '' ? null : $text;
    }

    /**
     * `payment_type` dari payload Midtrans, dibatasi panjang kolom. Hanya
     * dipakai untuk data lama yang belum punya id kanal.
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

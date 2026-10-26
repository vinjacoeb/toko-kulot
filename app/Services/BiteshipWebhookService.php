<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Penerapan webhook Biteship (PRD-v1.3 §2.1–§2.4, kartu `t_2c6be520`).
 *
 * Satu-satunya tempat aturan token, pencocokan `orders.biteship_order_id`, peta
 * event, aturan "status pesanan hanya maju", dan riwayat `orders.shipping_events`
 * (PRD-v1.4 §4.1: `{event,status,at}`, idempoten, maks 50). Idempoten: hanya
 * penugasan nilai (bukan penambahan), `shipped_at` diisi bila masih kosong. Tidak
 * pernah menulis `payments`, stok, `orders.shipping_cost`, atau `orders.total`.
 */
class BiteshipWebhookService
{
    /** Event yang dikenal (PRD-v1.3 §2.2). */
    public const EVENTS = ['order.status', 'order.price', 'order.waybill_id'];

    /** Status kurir yang memajukan pesanan `dibayar`/`diproses` menjadi `dikirim`. */
    public const STATUS_MAJU = ['picked', 'dropping_off', 'delivered'];

    /** Status kurir yang hanya dicatat sebagai `shipping_status` + tanda tindakan admin. */
    public const STATUS_BERMASALAH = ['cancelled', 'rejected', 'returned', 'disposed', 'on_hold'];

    /**
     * Token bersama dari `config('biteship.webhook_token')`.
     *
     * Kosong (mode uji lokal) → semua request diterima. Terisi → wajib cocok,
     * dibandingkan waktu-konstan agar tidak bisa ditebak lewat timing.
     */
    public function tokenValid(?string $given, ?string $ip = null): bool
    {
        $expected = trim((string) config('biteship.webhook_token'));

        if ($expected === '') {
            Log::info('Webhook Biteship diterima tanpa token (BITESHIP_WEBHOOK_TOKEN kosong)', [
                'ip' => $ip,
            ]);

            return true;
        }

        return is_string($given) && $given !== '' && hash_equals($expected, trim($given));
    }

    /**
     * Terapkan satu payload webhook ke pesanan yang cocok.
     *
     * Mengembalikan `false` bila tidak ada yang diterapkan (order tak dikenal /
     * event tak dikenal) — pemanggil tetap membalas 200 agar Biteship berhenti.
     *
     * @param  array<string, mixed>  $payload
     */
    public function handle(array $payload, ?string $ip = null): bool
    {
        $event = trim((string) ($payload['event'] ?? ''));

        if (! in_array($event, self::EVENTS, true)) {
            Log::warning('Webhook Biteship: event tidak dikenal', [
                'event' => $event === '' ? null : $event,
                'ip' => $ip,
            ]);

            return false;
        }

        $biteshipOrderId = trim((string) ($payload['order_id'] ?? ''));

        if ($biteshipOrderId === '') {
            Log::warning('Webhook Biteship: payload tanpa order_id', [
                'event' => $event,
                'ip' => $ip,
            ]);

            return false;
        }

        return DB::transaction(function () use ($event, $payload, $biteshipOrderId, $ip): bool {
            $order = Order::query()
                ->where('biteship_order_id', $biteshipOrderId)
                ->lockForUpdate()
                ->first();

            if ($order === null) {
                Log::warning('Webhook Biteship: order_id tidak dikenal', [
                    'event' => $event,
                    'order_id' => $biteshipOrderId,
                    'ip' => $ip,
                ]);

                return false;
            }

            $now = now();
            $attributes = ['shipping_updated_at' => $now];

            if ($event === 'order.waybill_id') {
                $waybill = trim((string) ($payload['courier_waybill_id'] ?? ''))
                    ?: trim((string) ($payload['courier_tracking_id'] ?? ''));

                if ($waybill !== '') {
                    $attributes['tracking_number'] = mb_substr($waybill, 0, 60);
                }

                $this->applyShippingStatus($order, $payload, $attributes, false);
            }

            if ($event === 'order.status') {
                $this->applyShippingStatus($order, $payload, $attributes, true);
                $attributes['shipping_webhook_payload'] = $payload;
            }

            if ($event === 'order.price') {
                // Hanya informasi untuk admin (PRD-v1.3 §2.2): tidak ada uang yang diubah.
                $attributes['shipping_webhook_payload'] = $payload;
            }

            $attributes['shipping_events'] = $this->appendEvent(
                $order->shipping_events,
                $event,
                (string) ($payload['status'] ?? ''),
                $now,
            );

            $order->forceFill($attributes)->save();

            return true;
        });
    }

    /**
     * Riwayat event (PRD-v1.4 §4.1): satu entri `{event, status, at}` per webhook cocok,
     * urut lama → baru. Entri dengan `event` + `status` sama dengan entri terakhir tidak
     * ditambahkan (idempoten); maksimum 50 entri, yang terlama dibuang.
     *
     * @return array<int, array{event: string, status: string|null, at: string}>
     */
    private function appendEvent(mixed $events, string $event, string $status, \Carbon\CarbonInterface $at): array
    {
        $events = is_array($events) ? array_values(array_filter($events, 'is_array')) : [];

        $status = strtolower(trim($status));
        $status = $status === '' ? null : mb_substr($status, 0, 30);

        $last = $events === [] ? null : $events[array_key_last($events)];

        if ($last !== null && ($last['event'] ?? null) === $event && ($last['status'] ?? null) === $status) {
            return $events;
        }

        $events[] = ['event' => $event, 'status' => $status, 'at' => $at->toIso8601String()];

        return array_slice($events, -50);
    }

    /**
     * `shipping_status` dari payload; status pesanan hanya maju bila `$advance`
     * (PRD-v1.3 §2.3 — hanya event `order.status` yang memajukan pesanan).
     *
     * @param  array<string, mixed>  $payload
     * @param  array<string, mixed>  $attributes
     */
    private function applyShippingStatus(Order $order, array $payload, array &$attributes, bool $advance): void
    {
        $shippingStatus = strtolower(trim((string) ($payload['status'] ?? '')));

        if ($shippingStatus === '') {
            return;
        }

        $attributes['shipping_status'] = mb_substr($shippingStatus, 0, 30);

        if (! $advance) {
            return;
        }

        $target = $this->nextOrderStatus($order->status, $shippingStatus);

        if ($target === null) {
            return;
        }

        $attributes['status'] = $target;

        if ($target === Order::STATUS_SHIPPED && $order->shipped_at === null) {
            $attributes['shipped_at'] = now();
        }
    }

    /**
     * Status pesanan baru menurut PRD-v1.3 §2.3, `null` bila tidak berubah.
     *
     * `cancelled`/`rejected`/`returned`/`disposed`/`on_hold` tidak membatalkan
     * pesanan dan tidak mengembalikan stok — keputusan admin lewat §12.18.
     */
    public function nextOrderStatus(string $current, string $shippingStatus): ?string
    {
        if (in_array($current, [Order::STATUS_PAID, Order::STATUS_PROCESSING], true)
            && in_array($shippingStatus, self::STATUS_MAJU, true)) {
            return Order::STATUS_SHIPPED;
        }

        if ($current === Order::STATUS_SHIPPED && $shippingStatus === 'delivered') {
            return Order::STATUS_COMPLETED;
        }

        return null;
    }
}

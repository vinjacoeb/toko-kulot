<?php

namespace Tests\Feature\Checkout;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Riwayat pengiriman & timeline pembeli (PRD-v1.4 §4, kartu `t_f51f8c36`).
 *
 * Cakupan: append event webhook ke `orders.shipping_events`, dedupe entri terakhir,
 * batas 50, props `shipping.events` + `timeline.completed_at` di riwayat, dan daftar
 * event di halaman selesai bayar.
 */
class TimelineV14Test extends TestCase
{
    use RefreshDatabase;

    private int $nomor = 0;

    protected function setUp(): void
    {
        parent::setUp();

        // Mode uji lokal: token kosong = semua request diterima (PRD-v1.3 §2.1).
        config(['biteship.webhook_token' => null]);
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function pesanan(array $overrides = []): Order
    {
        $this->nomor++;

        return Order::create(array_merge([
            'code' => 'TK-20261026-'.str_pad((string) $this->nomor, 4, '0', STR_PAD_LEFT),
            'status' => Order::STATUS_PAID,
            'subtotal' => 85000,
            'shipping_cost' => 20000,
            'discount' => 0,
            'total' => 105000,
            'payment_method' => 'qris',
            'payment_status' => Order::PAYMENT_SETTLEMENT,
            'customer_name' => '[CONTOH] Pembeli Timeline',
            'customer_phone' => '081200000003',
            'shipping_address' => '[CONTOH] Jalan Kenanga 3',
            'city' => 'Bandung',
            'postal_code' => '40111',
            'shipping_courier' => 'jne',
            'shipping_service' => 'reg',
            'biteship_order_id' => 'BIT-TL',
        ], $overrides));
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function kirim(array $payload): void
    {
        $this->postJson('/biteship/webhook', $payload)->assertOk();
    }

    public function test_dua_webhook_status_identik_hanya_menambah_satu_entri(): void
    {
        $order = $this->pesanan();

        $this->kirim(['event' => 'order.status', 'order_id' => 'BIT-TL', 'status' => 'picked']);
        $this->kirim(['event' => 'order.status', 'order_id' => 'BIT-TL', 'status' => 'picked']);

        $events = $order->fresh()->shipping_events;

        $this->assertCount(1, $events);
        $this->assertSame('order.status', $events[0]['event']);
        $this->assertSame('picked', $events[0]['status']);
        $this->assertNotEmpty($events[0]['at']);
    }

    public function test_picked_lalu_delivered_menambah_dua_entri_dan_menyelesaikan_pesanan(): void
    {
        $order = $this->pesanan();

        $this->kirim(['event' => 'order.status', 'order_id' => 'BIT-TL', 'status' => 'picked']);
        $this->kirim(['event' => 'order.status', 'order_id' => 'BIT-TL', 'status' => 'delivered']);

        $order->refresh();

        $this->assertCount(2, $order->shipping_events);
        $this->assertSame(['picked', 'delivered'], array_column($order->shipping_events, 'status'));
        $this->assertSame(Order::STATUS_COMPLETED, $order->status);
    }

    public function test_riwayat_dibatasi_lima_puluh_entri(): void
    {
        $order = $this->pesanan();

        for ($i = 1; $i <= 60; $i++) {
            $this->kirim([
                'event' => 'order.waybill_id',
                'order_id' => 'BIT-TL',
                'status' => $i % 2 === 1 ? 'confirmed' : 'allocated',
            ]);
        }

        $events = $order->fresh()->shipping_events;

        $this->assertCount(50, $events);
        // Urut lama → baru: entri terakhir = webhook ke-60.
        $this->assertSame('allocated', $events[49]['status']);
    }

    public function test_props_riwayat_memuat_events_terbaru_dulu_dengan_label(): void
    {
        $pembeli = User::factory()->create();
        $order = $this->pesanan(['user_id' => $pembeli->id]);

        $this->kirim(['event' => 'order.status', 'order_id' => 'BIT-TL', 'status' => 'picked']);
        $this->kirim(['event' => 'order.status', 'order_id' => 'BIT-TL', 'status' => 'delivered']);

        $events = $order->fresh()->shipping_events;

        $this->actingAs($pembeli)
            ->get('/history')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('orders.data.0.shipping.events.0.status', 'delivered')
                ->where('orders.data.0.shipping.events.0.label', 'Terkirim')
                ->where('orders.data.0.shipping.events.0.at', $events[1]['at'])
                ->where('orders.data.0.shipping.events.1.status', 'picked')
                ->where('orders.data.0.shipping.events.1.label', 'Diterima kurir')
                ->where('orders.data.0.shipping.events.1.at', $events[0]['at'])
                ->count('orders.data.0.shipping.events', 2)
            );
    }

    public function test_timeline_completed_at_terisi_saat_delivered_pada_pesanan_dikirim(): void
    {
        $pembeli = User::factory()->create();
        $order = $this->pesanan([
            'user_id' => $pembeli->id,
            'status' => Order::STATUS_SHIPPED,
        ]);

        $this->kirim(['event' => 'order.status', 'order_id' => 'BIT-TL', 'status' => 'delivered']);

        $completedAt = $order->fresh()->shipping_events[0]['at'];

        $this->actingAs($pembeli)
            ->get('/history')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('orders.data.0.status', Order::STATUS_COMPLETED)
                ->where('orders.data.0.timeline.completed_at', $completedAt)
            );
    }

    public function test_timeline_completed_at_null_tanpa_delivered(): void
    {
        $pembeli = User::factory()->create();
        $this->pesanan([
            'user_id' => $pembeli->id,
            'status' => Order::STATUS_SHIPPED,
            'shipping_events' => [['event' => 'order.status', 'status' => 'picked', 'at' => now()->toIso8601String()]],
        ]);

        $this->actingAs($pembeli)
            ->get('/history')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('orders.data.0.timeline.completed_at', null)
                ->where('orders.data.0.shipping.events.0.status', 'picked')
            );
    }

    public function test_halaman_selesai_bayar_memuat_events_pengiriman(): void
    {
        $pembeli = User::factory()->create();
        $order = $this->pesanan(['user_id' => $pembeli->id]);

        $this->kirim(['event' => 'order.status', 'order_id' => 'BIT-TL', 'status' => 'picked']);

        $this->actingAs($pembeli)
            ->get('/checkout/'.$order->id.'/selesai')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('pesanan.shipping.events.0.status', 'picked')
                ->where('pesanan.shipping.events.0.label', 'Diterima kurir')
            );
    }
}

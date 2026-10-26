<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * v1.5 B3 — filter `?status=` riwayat pesanan (§13) dan `timeline` halaman selesai (§7.9).
 *
 * Cakupan: filter hanya status itu, nilai asing/berulang diabaikan, halaman 2 mempertahankan
 * `status`, `ringkasan` tetap global, dan payload `checkout.success` memuat 4 kunci timeline.
 */
class HistoryFilterV15Test extends TestCase
{
    use RefreshDatabase;

    private int $nomor = 0;

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function pesanan(User $user, array $overrides = [], ?string $createdAt = null): Order
    {
        $this->nomor++;

        $order = Order::create(array_merge([
            'user_id' => $user->id,
            'code' => 'TK-20261026-'.str_pad((string) $this->nomor, 4, '0', STR_PAD_LEFT),
            'status' => Order::STATUS_PAID,
            'payment_status' => Order::PAYMENT_SETTLEMENT,
            'subtotal' => 85000,
            'shipping_cost' => 20000,
            'discount' => 0,
            'total' => 105000,
            'customer_name' => '[CONTOH] Siti Aminah',
            'customer_phone' => '081234567890',
            'shipping_address' => '[CONTOH] Jl. Melati 12',
            'city' => 'Pekalongan',
            'postal_code' => '51100',
        ], $overrides));

        if ($createdAt !== null) {
            $order->forceFill(['created_at' => $createdAt])->save();
        }

        return $order->refresh();
    }

    public function test_filter_hanya_mengembalikan_status_itu(): void
    {
        $pembeli = User::factory()->create();

        $selesaiA = $this->pesanan($pembeli, ['status' => Order::STATUS_COMPLETED], '2026-10-21 10:00:00');
        $selesaiB = $this->pesanan($pembeli, ['status' => Order::STATUS_COMPLETED], '2026-10-22 10:00:00');
        $this->pesanan($pembeli, [
            'status' => Order::STATUS_CANCELLED,
            'payment_status' => Order::PAYMENT_EXPIRE,
        ], '2026-10-23 10:00:00');
        $this->pesanan($pembeli, [
            'status' => Order::STATUS_PENDING,
            'payment_status' => Order::PAYMENT_PENDING,
        ], '2026-10-24 10:00:00');

        $this->actingAs($pembeli)
            ->get('/history?status=selesai')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/History', false)
                ->where('filter.status', 'selesai')
                ->has('orders.data', 2)
                ->where('orders.data', fn ($data) => collect($data)->pluck('status')->unique()->values()->all() === [Order::STATUS_COMPLETED])
                ->where('orders.data.0.id', $selesaiB->id)
                ->where('orders.data.1.id', $selesaiA->id)
                ->where('orders.meta.total', 2)
            );
    }

    public function test_status_asing_atau_berulang_diabaikan(): void
    {
        $pembeli = User::factory()->create();
        $this->pesanan($pembeli, ['status' => Order::STATUS_COMPLETED]);
        $this->pesanan($pembeli, ['status' => Order::STATUS_PENDING, 'payment_status' => Order::PAYMENT_PENDING]);
        $this->pesanan($pembeli, ['status' => Order::STATUS_CANCELLED, 'payment_status' => Order::PAYMENT_EXPIRE]);

        foreach (['/history?status=ngawur', '/history?status=', '/history?status[]=selesai'] as $url) {
            $this->actingAs($pembeli)
                ->get($url)
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page
                    ->where('filter.status', null)
                    ->has('orders.data', 3)
                    ->where('orders.meta.total', 3)
                );
        }
    }

    public function test_halaman_kedua_mempertahankan_status_di_tautan(): void
    {
        $pembeli = User::factory()->create();

        foreach (range(1, 12) as $i) {
            $this->pesanan($pembeli, ['status' => Order::STATUS_COMPLETED], sprintf('2026-10-01 10:%02d:00', $i));
        }

        foreach (range(1, 3) as $i) {
            $this->pesanan($pembeli, [
                'status' => Order::STATUS_CANCELLED,
                'payment_status' => Order::PAYMENT_EXPIRE,
            ], sprintf('2026-09-30 10:%02d:00', $i));
        }

        $this->actingAs($pembeli)
            ->get('/history?status=selesai&page=2')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filter.status', 'selesai')
                ->has('orders.data', 2)
                ->where('orders.meta.current_page', 2)
                ->where('orders.meta.last_page', 2)
                ->where('orders.meta.total', 12)
                ->where('orders.data', fn ($data) => collect($data)->pluck('status')->unique()->values()->all() === [Order::STATUS_COMPLETED])
                ->where('orders.links', fn ($links) => collect($links)
                    ->pluck('url')
                    ->filter()
                    ->contains(fn ($url) => str_contains((string) $url, 'status=selesai')))
            );
    }

    public function test_ringkasan_tetap_global_saat_filter_dipakai(): void
    {
        $pembeli = User::factory()->create();
        $this->pesanan($pembeli, ['status' => Order::STATUS_COMPLETED]);
        $this->pesanan($pembeli, ['status' => Order::STATUS_COMPLETED]);
        $this->pesanan($pembeli, ['status' => Order::STATUS_SHIPPED]);
        $this->pesanan($pembeli, ['status' => Order::STATUS_CANCELLED, 'payment_status' => Order::PAYMENT_EXPIRE]);

        // Pesanan pembeli lain tidak boleh ikut ringkasan.
        $this->pesanan(User::factory()->create(), ['status' => Order::STATUS_COMPLETED]);

        $this->actingAs($pembeli)
            ->get('/history?status=batal')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filter.status', 'batal')
                ->has('orders.data', 1)
                ->where('orders.meta.total', 1)
                ->where('ringkasan.total', 4)
                ->where('ringkasan.selesai', 2)
                ->where('ringkasan.dikirim', 1)
                ->where('ringkasan.batal', 1)
                ->where('ringkasan.pending', 0)
            );
    }

    public function test_payload_halaman_selesai_memuat_timeline_empat_kunci(): void
    {
        $pembeli = User::factory()->create();

        $order = $this->pesanan($pembeli, [
            'status' => Order::STATUS_SHIPPED,
            'paid_at' => '2026-10-20 14:09:00',
            'shipped_at' => '2026-10-21 08:00:00',
            'shipping_courier' => 'jne',
            'shipping_service' => 'reg',
            'shipping_events' => [
                ['event' => 'order.status', 'status' => 'picked', 'at' => '2026-10-21T08:00:00+07:00'],
                ['event' => 'order.status', 'status' => 'delivered', 'at' => '2026-10-22T10:30:00+07:00'],
            ],
        ]);

        $this->actingAs($pembeli)
            ->get('/checkout/'.$order->id.'/selesai')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/CheckoutSuccess', false)
                ->has('pesanan.timeline.created_at')
                ->has('pesanan.timeline.paid_at')
                ->has('pesanan.timeline.shipped_at')
                ->has('pesanan.timeline.completed_at')
                ->where('pesanan.timeline.created_at', $order->created_at?->toIso8601String())
                ->where('pesanan.timeline.paid_at', $order->paid_at?->toIso8601String())
                ->where('pesanan.timeline.shipped_at', $order->shipped_at?->toIso8601String())
                ->where('pesanan.timeline.completed_at', '2026-10-22T10:30:00+07:00')
                // Bentuk lama tetap ada.
                ->where('pesanan.created_at', $order->created_at?->toIso8601String())
                ->where('pesanan.paid_at', $order->paid_at?->toIso8601String())
            );
    }
}

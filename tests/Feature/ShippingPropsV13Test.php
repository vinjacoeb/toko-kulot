<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Props data webhook Biteship ke admin & pembeli (PRD-v1.3 §2.6, kartu `t_5a702574`).
 *
 * Cakupan: tujuh key baru `shipping` admin, dua key baru baris daftar admin, bentuk pembeli
 * tanpa key admin pada §13 dan §7.9, serta aturan `perlu_tindakan` (retur/gagal, selisih ≠ 0,
 * payload terakhir bukan `order.price`).
 */
class ShippingPropsV13Test extends TestCase
{
    use RefreshDatabase;

    private int $nomor = 0;

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function pesanan(array $overrides = []): Order
    {
        $this->nomor++;

        return Order::create(array_merge([
            'code' => 'TK-20261025-'.str_pad((string) $this->nomor, 4, '0', STR_PAD_LEFT),
            'status' => Order::STATUS_PAID,
            'payment_status' => Order::PAYMENT_SETTLEMENT,
            'subtotal' => 85000,
            'shipping_cost' => 20000,
            'discount' => 0,
            'total' => 105000,
            'payment_method' => 'qris',
            'customer_name' => '[CONTOH] Pembeli Props',
            'customer_phone' => '081200000002',
            'shipping_address' => '[CONTOH] Jalan Melati 2',
            'city' => 'Bandung',
            'postal_code' => '40111',
            'shipping_courier' => 'jne',
            'shipping_service' => 'reg',
            'biteship_order_id' => 'BIT-PROPS-1',
        ], $overrides));
    }

    /**
     * Payload `order.price` (PRD-v1.3 §2.2).
     *
     * @return array<string, mixed>
     */
    private function payloadHarga(int $price): array
    {
        return [
            'event' => 'order.price',
            'order_id' => 'BIT-PROPS-1',
            'price' => $price,
            'shippment_fee' => 20000,
            'cash_on_delivery_fee' => 0,
            'proof_of_delivery_fee' => 0,
        ];
    }

    /**
     * Payload `order.status` (PRD-v1.3 §2.2).
     *
     * @return array<string, mixed>
     */
    private function payloadStatus(string $status): array
    {
        return [
            'event' => 'order.status',
            'order_id' => 'BIT-PROPS-1',
            'status' => $status,
            'courier_driver_name' => '[CONTOH] Pak Budi',
            'courier_driver_phone' => '081200000003',
            'courier_link' => 'https://track.contoh.id/BIT-PROPS-1',
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  array<string, mixed>  $overrides
     */
    private function orderWebhook(array $payload, array $overrides = []): Order
    {
        return $this->pesanan(array_merge([
            'shipping_updated_at' => now(),
            'shipping_status' => ($payload['event'] ?? null) === 'order.status' ? $payload['status'] : null,
            'shipping_webhook_payload' => $payload,
        ], $overrides));
    }

    public function test_detail_admin_tanpa_webhook_key_baru_null_dan_key_lama_tetap(): void
    {
        $admin = Admin::factory()->create();
        $order = $this->pesanan();

        $this->actingAs($admin, 'admin')
            ->get('/admin/pesanan/'.$order->id)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Orders/Show', false)
                // key lama tidak berubah
                ->where('pesanan.shipping.courier_name', 'JNE')
                ->where('pesanan.shipping.service_name', 'REG')
                ->where('pesanan.shipping.shipping_cost', 20000)
                ->where('pesanan.shipping.galat', null)
                // key v1.3
                ->where('pesanan.shipping.updated_at', null)
                ->where('pesanan.shipping.price_final', null)
                ->where('pesanan.shipping.price_selisih', null)
                ->where('pesanan.shipping.perlu_tindakan', false)
                ->where('pesanan.shipping.tindakan', null)
                ->where('pesanan.shipping.driver', null)
                ->where('pesanan.shipping.webhook_terakhir', null)
            );
    }

    public function test_detail_admin_selisih_ongkir_memicu_perlu_tindakan(): void
    {
        $admin = Admin::factory()->create();
        $order = $this->orderWebhook($this->payloadHarga(25000));

        $this->actingAs($admin, 'admin')
            ->get('/admin/pesanan/'.$order->id)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Orders/Show', false)
                ->where('pesanan.shipping.updated_at', $order->refresh()->shipping_updated_at->toIso8601String())
                ->where('pesanan.shipping.price_final', 25000)
                ->where('pesanan.shipping.price_selisih', 5000)
                ->where('pesanan.shipping.perlu_tindakan', true)
                ->where('pesanan.shipping.tindakan', 'Ongkir aktual berbeda dari ongkir tagihan. Periksa selisih ongkir pesanan ini.')
                ->where('pesanan.shipping.driver', null)
                ->where('pesanan.shipping.webhook_terakhir.event', 'order.price')
            );
    }

    public function test_detail_admin_ongkir_sama_tidak_perlu_tindakan(): void
    {
        $admin = Admin::factory()->create();
        $order = $this->orderWebhook($this->payloadHarga(20000));

        $this->actingAs($admin, 'admin')
            ->get('/admin/pesanan/'.$order->id)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Orders/Show', false)
                ->where('pesanan.shipping.price_final', 20000)
                ->where('pesanan.shipping.price_selisih', 0)
                ->where('pesanan.shipping.perlu_tindakan', false)
                ->where('pesanan.shipping.tindakan', null)
            );
    }

    public function test_detail_admin_status_retur_perlu_tindakan_dan_driver_terisi(): void
    {
        $admin = Admin::factory()->create();
        $order = $this->orderWebhook($this->payloadStatus('returned'));

        $this->actingAs($admin, 'admin')
            ->get('/admin/pesanan/'.$order->id)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Orders/Show', false)
                ->where('pesanan.status', Order::STATUS_PAID)
                ->where('pesanan.shipping.status', 'returned')
                ->where('pesanan.shipping.perlu_tindakan', true)
                ->where('pesanan.shipping.tindakan', 'Kurir melaporkan paket dikembalikan.')
                ->where('pesanan.shipping.driver.name', '[CONTOH] Pak Budi')
                ->where('pesanan.shipping.driver.phone', '081200000003')
                ->where('pesanan.shipping.driver.link', 'https://track.contoh.id/BIT-PROPS-1')
                // payload terakhir bukan `order.price` → harga aktual tidak ada
                ->where('pesanan.shipping.price_final', null)
                ->where('pesanan.shipping.price_selisih', null)
                ->where('pesanan.shipping.webhook_terakhir.event', 'order.status')
            );
    }

    public function test_detail_admin_retur_pada_pesanan_selesai_tidak_perlu_tindakan(): void
    {
        $admin = Admin::factory()->create();
        $order = $this->orderWebhook($this->payloadStatus('returned'), ['status' => Order::STATUS_COMPLETED]);

        $this->actingAs($admin, 'admin')
            ->get('/admin/pesanan/'.$order->id)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Orders/Show', false)
                ->where('pesanan.shipping.perlu_tindakan', false)
                ->where('pesanan.shipping.tindakan', null)
            );
    }

    public function test_daftar_admin_mengirim_shipping_updated_at_dan_perlu_tindakan_per_baris(): void
    {
        $admin = Admin::factory()->create();
        $this->pesanan(['created_at' => now()->subDay()]);
        $bermasalah = $this->orderWebhook($this->payloadStatus('returned'));

        $this->actingAs($admin, 'admin')
            ->get('/admin/pesanan')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Orders/Index', false)
                ->has('pesanan.data', 2)
                ->where('pesanan.data.0.id', $bermasalah->id)
                ->where('pesanan.data.0.shipping_perlu_tindakan', true)
                ->where('pesanan.data.0.shipping_updated_at', $bermasalah->refresh()->shipping_updated_at->toIso8601String())
                ->where('pesanan.data.1.shipping_perlu_tindakan', false)
                ->where('pesanan.data.1.shipping_updated_at', null)
            );
    }

    public function test_riwayat_pembeli_bentuk_pembeli_tanpa_key_admin(): void
    {
        $user = User::factory()->create();
        $order = $this->orderWebhook($this->payloadStatus('picked'), ['user_id' => $user->id]);

        $this->actingAs($user)
            ->get('/history')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/History', false)
                ->where('orders.data.0.shipping.status', 'picked')
                ->where('orders.data.0.shipping.updated_at', $order->refresh()->shipping_updated_at->toIso8601String())
                ->where('orders.data.0.shipping.driver.name', '[CONTOH] Pak Budi')
                ->where('orders.data.0.shipping.galat', null)
                ->missing('orders.data.0.shipping.price_final')
                ->missing('orders.data.0.shipping.price_selisih')
                ->missing('orders.data.0.shipping.webhook_terakhir')
            );
    }

    public function test_halaman_selesai_mengirim_shipping_bentuk_pembeli(): void
    {
        $user = User::factory()->create();
        $order = $this->orderWebhook($this->payloadStatus('delivered'), ['user_id' => $user->id]);

        $this->actingAs($user)
            ->get('/checkout/'.$order->id.'/selesai')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/CheckoutSuccess', false)
                ->where('pesanan.shipping.status', 'delivered')
                ->where('pesanan.shipping.status_label', 'Terkirim')
                ->where('pesanan.shipping.driver.name', '[CONTOH] Pak Budi')
                ->where('pesanan.shipping.updated_at', $order->refresh()->shipping_updated_at->toIso8601String())
                ->where('pesanan.shipping.galat', null)
                ->missing('pesanan.shipping.price_final')
                ->missing('pesanan.shipping.price_selisih')
                ->missing('pesanan.shipping.webhook_terakhir')
            );
    }
}

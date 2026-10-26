<?php

namespace Tests\Feature\Admin;

use App\Models\Admin;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Services\SettingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * Resi otomatis Biteship (PRD-v1.2 §8, kontrak props §12.25) + katalog kurir (§10.13).
 *
 * Semua panggilan Biteship diganti `Http::fake`; tidak ada kredensial dan tidak ada
 * jaringan. Yang diuji: guard sebelum API, payload create order, idempotensi,
 * kegagalan API, dan validasi katalog kurir saat menyimpan ekspedisi.
 */
class AdminAutoResiTest extends TestCase
{
    use RefreshDatabase;

    private int $productId = 0;

    private int $variantId = 0;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();

        config([
            'biteship.key' => 'test-biteship-key',
            'biteship.base_url' => 'https://api.biteship.test',
        ]);

        $this->app->make(SettingService::class)->putMany([
            'store_name' => '[CONTOH] Toko Daster Kulot',
            'contact_email' => 'toko@contoh.test',
            'shipping_origin_name' => '[CONTOH] Penjual',
            'shipping_origin_phone' => '081200000001',
            'shipping_origin_address' => 'Jalan Asal No. 1',
            'shipping_origin_postal_code' => '40111',
        ]);

        $kategori = Category::create([
            'name' => '[CONTOH] Daster',
            'slug' => 'contoh-daster',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $product = Product::create([
            'category_id' => $kategori->id,
            'name' => '[CONTOH] Daster Kulot',
            'slug' => 'contoh-daster-kulot',
            'sku' => 'CONTOH-DK',
            'base_price' => 89000,
            'weight_gram' => 250,
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'size' => 'M',
            'sku' => 'CONTOH-DK-M',
            'stock' => 5,
            'is_active' => true,
        ]);

        $this->productId = (int) $product->id;
        $this->variantId = (int) $variant->id;
    }

    public function test_resi_otomatis_sukses_menyimpan_kolom_dan_mengirim_payload(): void
    {
        Http::fake([
            'https://api.biteship.test/v1/orders' => Http::response([
                'success' => true,
                'id' => 'ord_biteship_1',
                'status' => 'confirmed',
                'courier' => ['waybill_id' => 'JX1234567890', 'tracking_id' => 'trk1'],
            ], 200),
        ]);

        $admin = Admin::factory()->create();
        $order = $this->pesanan();

        $this->actingAs($admin, 'admin')
            ->from('/admin/pesanan/'.$order->id)
            ->post('/admin/pesanan/'.$order->id.'/resi')
            ->assertRedirect('/admin/pesanan/'.$order->id)
            ->assertSessionHas('success', 'Resi dibuat: JX1234567890.');

        $segar = $order->fresh();

        $this->assertSame('ord_biteship_1', $segar->biteship_order_id);
        $this->assertSame('JX1234567890', $segar->tracking_number);
        $this->assertSame('confirmed', $segar->shipping_status);
        $this->assertSame('dibayar', $segar->status);

        Http::assertSent(function ($request): bool {
            $data = $request->data();

            return $request->url() === 'https://api.biteship.test/v1/orders'
                && $request->header('Authorization') === ['Bearer test-biteship-key']
                && $data['courier_company'] === 'jne'
                && $data['courier_type'] === 'reg'
                && $data['origin_postal_code'] === 40111
                && $data['destination_postal_code'] === 40123
                && $data['items'][0]['quantity'] === 2
                && $data['items'][0]['weight'] === 250;
        });
    }

    public function test_resi_otomatis_idempoten_tanpa_panggilan_api_kedua(): void
    {
        Http::fake();

        $admin = Admin::factory()->create();
        $order = $this->pesanan([
            'biteship_order_id' => 'ord_lama',
            'tracking_number' => 'JX-LAMA',
        ]);

        $this->actingAs($admin, 'admin')
            ->from('/admin/pesanan/'.$order->id)
            ->post('/admin/pesanan/'.$order->id.'/resi')
            ->assertSessionHas('success', 'Resi pesanan ini sudah dibuat: JX-LAMA.');

        Http::assertNothingSent();
        $this->assertSame('ord_lama', $order->fresh()->biteship_order_id);
    }

    public function test_resi_otomatis_ditolak_bila_belum_dibayar(): void
    {
        Http::fake();

        $admin = Admin::factory()->create();
        $order = $this->pesanan(['status' => Order::STATUS_PENDING]);

        $this->actingAs($admin, 'admin')
            ->from('/admin/pesanan/'.$order->id)
            ->post('/admin/pesanan/'.$order->id.'/resi')
            ->assertSessionHas('error', 'Resi otomatis hanya untuk pesanan berstatus Dibayar atau Dikirim. Pesanan ini masih Pending.');

        Http::assertNothingSent();
        $this->assertNull($order->fresh()->biteship_order_id);
    }

    public function test_resi_otomatis_ditolak_bila_kurir_kosong(): void
    {
        Http::fake();

        $admin = Admin::factory()->create();
        $order = $this->pesanan([
            'shipping_courier' => null,
            'shipping_service' => null,
        ]);

        $this->actingAs($admin, 'admin')
            ->from('/admin/pesanan/'.$order->id)
            ->post('/admin/pesanan/'.$order->id.'/resi')
            ->assertSessionHas('error', 'Pesanan ini belum menyimpan kurir/layanan pengiriman. Buat resi manual atau pilih kurir saat checkout.');

        Http::assertNothingSent();
    }

    public function test_resi_otomatis_gagal_biteship_tidak_mengubah_kolom(): void
    {
        Http::fake([
            'https://api.biteship.test/v1/orders' => Http::response([
                'success' => false,
                'error' => 'Courier service not available',
            ], 400),
        ]);

        $admin = Admin::factory()->create();
        $order = $this->pesanan();

        $this->actingAs($admin, 'admin')
            ->from('/admin/pesanan/'.$order->id)
            ->post('/admin/pesanan/'.$order->id.'/resi')
            ->assertSessionHas('error', 'Resi otomatis gagal: Courier service not available');

        $segar = $order->fresh();

        $this->assertNull($segar->biteship_order_id);
        $this->assertNull($segar->tracking_number);
        $this->assertNull($segar->shipping_payload);
    }

    public function test_resi_otomatis_mode_uji_tanpa_jaringan(): void
    {
        Http::fake();
        config(['biteship.key' => '']);

        $admin = Admin::factory()->create();
        $order = $this->pesanan();

        $this->actingAs($admin, 'admin')
            ->from('/admin/pesanan/'.$order->id)
            ->post('/admin/pesanan/'.$order->id.'/resi')
            ->assertSessionHas('success', 'Resi dibuat: FAKE-CONTOH-PESANAN-1.');

        Http::assertNothingSent();

        $segar = $order->fresh();

        $this->assertTrue((bool) ($segar->shipping_payload['mode_uji'] ?? false));
        $this->assertSame('FAKE-CONTOH-PESANAN-1', $segar->tracking_number);
    }

    public function test_bukan_admin_tidak_bisa_membuat_resi_otomatis(): void
    {
        Http::fake();
        $order = $this->pesanan();
        $pembeli = User::factory()->create();

        $this->post('/admin/pesanan/'.$order->id.'/resi')->assertRedirect('/admin/login');

        $this->actingAs($pembeli, 'web')
            ->post('/admin/pesanan/'.$order->id.'/resi')
            ->assertRedirect('/admin/login');

        Http::assertNothingSent();
    }

    public function test_simpan_ekspedisi_menolak_layanan_di_luar_katalog_biteship(): void
    {
        Http::fake([
            'https://api.biteship.test/v1/couriers' => Http::response([
                'success' => true,
                'couriers' => [
                    [
                        'courier_code' => 'jne',
                        'courier_name' => 'JNE',
                        'courier_service_code' => 'reg',
                        'courier_service_name' => 'REG',
                        'duration' => '2-3 days',
                    ],
                ],
            ], 200),
        ]);

        $admin = Admin::factory()->create();

        $this->actingAs($admin, 'admin')
            ->from('/admin/ekspedisi')
            ->put('/admin/ekspedisi', $this->payloadEkspedisi('foo', 'bar'))
            ->assertSessionHasErrors('couriers');

        $this->actingAs($admin, 'admin')
            ->from('/admin/ekspedisi')
            ->put('/admin/ekspedisi', $this->payloadEkspedisi('jne', 'reg'))
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success', 'Pengaturan ekspedisi disimpan.');
    }

    public function test_katalog_kurir_di_cache_24_jam(): void
    {
        Http::fake([
            'https://api.biteship.test/v1/couriers' => Http::response([
                'success' => true,
                'couriers' => [[
                    'courier_code' => 'jne',
                    'courier_name' => 'JNE',
                    'courier_service_code' => 'reg',
                    'courier_service_name' => 'REG',
                ]],
            ], 200),
        ]);

        $service = $this->app->make(\App\Services\BiteshipService::class);

        $this->assertSame('biteship', $service->catalog()['sumber']);
        $this->assertSame('biteship', $service->catalog()['sumber']);

        Http::assertSentCount(1);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function pesanan(array $attributes = []): Order
    {
        $order = Order::create(array_merge([
            'code' => 'CONTOH-PESANAN-1',
            'status' => Order::STATUS_PAID,
            'subtotal' => 178000,
            'shipping_cost' => 20000,
            'total' => 198000,
            'customer_name' => '[CONTOH] Pembeli',
            'customer_phone' => '081200000000',
            'customer_email' => 'pembeli@contoh.test',
            'shipping_address' => 'Jalan Contoh No. 1',
            'postal_code' => '40123',
            'city' => 'Bandung',
            'shipping_courier' => 'jne',
            'shipping_service' => 'reg',
            'shipping_weight_gram' => 500,
            'payment_status' => Order::PAYMENT_SETTLEMENT,
        ], $attributes));

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $this->productId,
            'product_variant_id' => $this->variantId,
            'product_name' => '[CONTOH] Daster Kulot',
            'variant_label' => 'M',
            'qty' => 2,
            'unit_price' => 89000,
            'line_total' => 178000,
        ]);

        return $order;
    }

    /**
     * @return array<string, mixed>
     */
    private function payloadEkspedisi(string $courier, string $service): array
    {
        return [
            'shipping_origin_name' => '[CONTOH] Penjual',
            'shipping_origin_phone' => '081200000001',
            'shipping_origin_address' => 'Jalan Asal No. 1',
            'shipping_origin_postal_code' => '40111',
            'free_shipping_enabled' => false,
            'free_shipping_min' => 300000,
            'shipping_cost_default' => 20000,
            'couriers' => [[
                'courier_code' => $courier,
                'service_code' => $service,
                'label' => 'Uji',
                'is_regular' => true,
                'is_active' => true,
            ]],
        ];
    }
}

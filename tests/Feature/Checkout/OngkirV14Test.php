<?php

namespace Tests\Feature\Checkout;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\User;
use App\Services\BiteshipService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

/**
 * F11 v1.4: satu dasar hitung ongkir untuk tarif, pesanan, dan create order
 * (PRD-v1.4 §2, DoD §2.3). Tanpa jaringan: `Http::fake` + kunci uji.
 */
class OngkirV14Test extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Product $product;

    private int $variantId = 0;

    /** @var array{rates: ?array<string, mixed>, orders: ?array<string, mixed>} */
    private array $terkirim = ['rates' => null, 'orders' => null];

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'midtrans.fake' => true,
            'midtrans.server_key' => 'test-server-key',
            'midtrans.expiry_minutes' => 5,
            'biteship.key' => 'test-biteship-key',
            'biteship.base_url' => 'https://api.biteship.test',
        ]);

        $this->user = User::factory()->create();
        $this->actingAs($this->user);

        foreach ([
            ['shipping_cost_default', '20000', 'pembayaran', 'text'],
            ['free_shipping_enabled', '1', 'shipping', 'text'],
            ['free_shipping_min', '300000', 'shipping', 'text'],
            ['shipping_origin_name', '[CONTOH] Toko Kulot', 'shipping', 'text'],
            ['shipping_origin_phone', '081200000001', 'shipping', 'text'],
            ['shipping_origin_address', '[CONTOH] Jl. Kauman No. 45, Pekalongan', 'shipping', 'textarea'],
            ['shipping_origin_postal_code', '51122', 'shipping', 'text'],
            ['store_name', '[CONTOH] Toko Daster Kulot', 'umum', 'text'],
            ['contact_email', 'toko@contoh.test', 'umum', 'text'],
        ] as [$key, $value, $group, $type]) {
            Setting::create(compact('key', 'value', 'group', 'type'));
        }

        $category = Category::create([
            'name' => '[CONTOH] Daster',
            'slug' => 'contoh-daster',
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'category_id' => $category->id,
            'name' => '[CONTOH] Daster Kulot Premium',
            'slug' => 'contoh-daster-kulot-premium',
            'base_price' => 85000,
            'weight_gram' => 250,
            'is_active' => true,
        ]);

        $this->variantId = (int) ProductVariant::create([
            'product_id' => $this->product->id,
            'size' => 'L',
            'color' => 'Merah',
            'sku' => 'CONTOH-L-MERAH',
            'price_delta' => 0,
            'stock' => 10,
            'is_active' => true,
        ])->id;
    }

    public function test_tarif_memakai_berat_produk_tanpa_minimum_500_gram(): void
    {
        $this->fakeBiteship();
        $this->isiKeranjang(1);

        $this->getJson('/checkout/ongkir?postal_code=51111&city=Pekalongan')
            ->assertOk()
            ->assertJson([
                'mode' => 'api',
                'berat_gram' => 250,
                'opsi' => [['courier_code' => 'jne', 'service_code' => 'reg', 'cost' => 11000]],
                'galat' => null,
            ]);

        $body = $this->terkirim['rates'];

        $this->assertSame(250, $body['items'][0]['weight']);
        $this->assertSame(1, $body['items'][0]['quantity']);
        $this->assertArrayNotHasKey('destination_city', $body);
        $this->assertSame(51122, $body['origin_postal_code']);
        $this->assertSame(51111, $body['destination_postal_code']);
    }

    public function test_produk_tanpa_berat_memakai_fallback_300_gram(): void
    {
        $this->product->update(['weight_gram' => 0]);
        $this->fakeBiteship();
        $this->isiKeranjang(2);

        $this->getJson('/checkout/ongkir?postal_code=51111')->assertOk();

        $this->assertSame(300, $this->terkirim['rates']['items'][0]['weight']);
        $this->assertSame(2, $this->terkirim['rates']['items'][0]['quantity']);
    }

    public function test_berat_create_order_sama_dengan_shipping_weight_gram(): void
    {
        $this->fakeBiteship([
            'success' => true,
            'id' => 'ord_v14',
            'status' => 'confirmed',
            'courier' => ['waybill_id' => 'WB-V14'],
        ]);
        $this->isiKeranjang(2);

        $this->post('/checkout', $this->dataCheckout([
            'shipping_courier' => 'jne',
            'shipping_service' => 'reg',
        ]))->assertSessionHas('success');

        $order = Order::query()->firstOrFail();
        $this->assertSame(500, (int) $order->shipping_weight_gram);

        $order->update(['status' => Order::STATUS_PAID]);

        $hasil = $this->app->make(BiteshipService::class)->createOrder($order);
        $this->assertTrue($hasil['ok'], (string) $hasil['pesan']);

        $items = $this->terkirim['orders']['items'];
        $total = 0;

        foreach ($items as $item) {
            $total += $item['weight'] * $item['quantity'];
        }

        $this->assertSame(250, $items[0]['weight']);
        $this->assertSame((int) $order->shipping_weight_gram, $total);
    }

    public function test_log_biteship_tarif_dipakai_saat_order_dibuat(): void
    {
        $this->fakeBiteship();
        Log::spy();
        $this->isiKeranjang(2);

        $this->post('/checkout', $this->dataCheckout([
            'shipping_courier' => 'jne',
            'shipping_service' => 'reg',
        ]))->assertSessionHas('success');

        $order = Order::query()->firstOrFail();

        Log::shouldHaveReceived('info')
            ->withArgs(fn (string $pesan, array $konteks = []): bool => $pesan === BiteshipService::LOG_TARIF
                && ($konteks['order'] ?? null) === $order->code
                && ($konteks['origin_postal_code'] ?? null) === 51122
                && ($konteks['destination_postal_code'] ?? null) === 51111
                && ($konteks['weight_gram'] ?? null) === 500
                && ($konteks['courier'] ?? null) === 'jne'
                && ($konteks['service'] ?? null) === 'reg'
                && ($konteks['cost'] ?? null) === 11000
                && ! array_key_exists('token', $konteks)
                && ! array_key_exists('api_key', $konteks));
    }

    public function test_asal_kirim_belum_lengkap_menolak_tarif_tanpa_panggilan_api(): void
    {
        Setting::query()->where('key', 'contact_email')->delete();
        $this->fakeBiteship();
        $this->isiKeranjang(1);

        $galat = (string) $this->getJson('/checkout/ongkir?postal_code=51111')
            ->assertOk()
            ->assertJson(['opsi' => []])
            ->json('galat');

        $this->assertStringContainsString('Pengaturan asal pengiriman belum lengkap:', $galat);
        $this->assertStringContainsString('Email kontak', $galat);
        Http::assertNothingSent();
    }

    public function test_berat_create_order_tetap_saat_berat_produk_diubah_setelah_checkout(): void
    {
        $this->fakeBiteship([
            'success' => true,
            'id' => 'ord_ubah',
            'status' => 'confirmed',
            'courier' => ['waybill_id' => 'WB-UBAH'],
        ]);
        $this->isiKeranjang(2);

        $this->post('/checkout', $this->dataCheckout([
            'shipping_courier' => 'jne',
            'shipping_service' => 'reg',
        ]))->assertSessionHas('success');

        $order = Order::query()->firstOrFail();
        $this->assertSame(500, (int) $order->shipping_weight_gram);

        // Produk berubah setelah checkout: payload create order harus tetap snapshot.
        $this->product->update(['weight_gram' => 900]);
        $order->update(['status' => Order::STATUS_PAID]);

        $hasil = $this->app->make(BiteshipService::class)->createOrder($order);
        $this->assertTrue($hasil['ok'], (string) $hasil['pesan']);

        $this->assertSame(250, $this->terkirim['orders']['items'][0]['weight']);
        $this->assertSame(500, $this->totalBeratPayload());
    }

    public function test_berat_create_order_tetap_saat_produk_dihapus_setelah_checkout(): void
    {
        $this->fakeBiteship([
            'success' => true,
            'id' => 'ord_hapus',
            'status' => 'confirmed',
            'courier' => ['waybill_id' => 'WB-HAPUS'],
        ]);
        $this->isiKeranjang(2);

        $this->post('/checkout', $this->dataCheckout([
            'shipping_courier' => 'jne',
            'shipping_service' => 'reg',
        ]))->assertSessionHas('success');

        $order = Order::query()->firstOrFail();
        $this->product->delete();
        $this->assertSame(0, Product::query()->count());
        $this->assertSame(1, (int) $order->items()->whereNull('product_id')->count());

        $order->update(['status' => Order::STATUS_PAID]);

        $hasil = $this->app->make(BiteshipService::class)->createOrder($order);
        $this->assertTrue($hasil['ok'], (string) $hasil['pesan']);

        // Tanpa snapshot, berat jatuh ke fallback 300 g/unit (= 600 g).
        $this->assertSame(250, $this->terkirim['orders']['items'][0]['weight']);
        $this->assertSame(500, $this->totalBeratPayload());
    }

    public function test_berat_create_order_dibagi_proporsional_untuk_banyak_baris(): void
    {
        $this->fakeBiteship([
            'success' => true,
            'id' => 'ord_baris',
            'status' => 'confirmed',
            'courier' => ['waybill_id' => 'WB-BARIS'],
        ]);

        $lain = Product::create([
            'category_id' => $this->product->category_id,
            'name' => '[CONTOH] Daster Polos',
            'slug' => 'contoh-daster-polos',
            'base_price' => 75000,
            'weight_gram' => 300,
            'is_active' => true,
        ]);
        $varianLain = ProductVariant::create([
            'product_id' => $lain->id,
            'size' => 'M',
            'color' => 'Hitam',
            'sku' => 'CONTOH-M-HITAM',
            'price_delta' => 0,
            'stock' => 20,
            'is_active' => true,
        ]);

        $this->isiKeranjang(5);
        $this->isiKeranjang(7, (int) $lain->id, (int) $varianLain->id);

        $this->post('/checkout', $this->dataCheckout([
            'shipping_courier' => 'jne',
            'shipping_service' => 'reg',
        ]))->assertSessionHas('success');

        $order = Order::query()->firstOrFail();
        $this->assertSame(250 * 5 + 300 * 7, (int) $order->shipping_weight_gram);

        $order->update(['status' => Order::STATUS_PAID]);

        $hasil = $this->app->make(BiteshipService::class)->createOrder($order);
        $this->assertTrue($hasil['ok'], (string) $hasil['pesan']);

        $this->assertCount(2, $this->terkirim['orders']['items']);
        $this->assertSame((int) $order->shipping_weight_gram, $this->totalBeratPayload());
    }

    private function totalBeratPayload(): int
    {
        $total = 0;

        foreach ($this->terkirim['orders']['items'] as $item) {
            $total += $item['weight'] * $item['quantity'];
        }

        return $total;
    }

    private function isiKeranjang(int $qty, ?int $productId = null, ?int $variantId = null): void
    {
        $this->post('/keranjang', [
            'product_id' => $productId ?? $this->product->id,
            'variant_id' => $variantId ?? $this->variantId,
            'qty' => $qty,
        ])->assertSessionHas('success');
    }

    /**
     * @return array<string, string>
     */
    private function dataCheckout(array $extra = []): array
    {
        return $extra + [
            'customer_name' => 'Siti Aminah',
            'customer_phone' => '081234567890',
            'customer_email' => 'siti@example.test',
            'customer_address' => 'Jl. Melati No. 12, RT 02 RW 03',
            'customer_city' => 'Pekalongan',
            'customer_postal_code' => '51111',
        ];
    }

    /**
     * @param  array<string, mixed>  $ordersResponse
     */
    private function fakeBiteship(array $ordersResponse = [], int $rateCost = 11000): void
    {
        Http::fake(function (Request $request) use ($ordersResponse, $rateCost) {
            if (str_ends_with($request->url(), '/v1/rates/couriers')) {
                $this->terkirim['rates'] = $request->data();

                return Http::response([
                    'success' => true,
                    'pricing' => [[
                        'courier_code' => 'jne',
                        'courier_service_code' => 'reg',
                        'price' => $rateCost,
                        'duration' => '2 days',
                    ]],
                ], 200);
            }

            $this->terkirim['orders'] = $request->data();

            return Http::response($ordersResponse, 200);
        });
    }
}

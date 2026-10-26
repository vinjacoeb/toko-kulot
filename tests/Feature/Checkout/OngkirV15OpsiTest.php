<?php

namespace Tests\Feature\Checkout;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\User;
use App\Services\BiteshipService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

/**
 * B1 v1.5: opsi ekspedisi checkout mengikuti `settings.shipping_couriers`
 * (brief-v1.5-backend §B1, kontrak §7.12). Tanpa jaringan: `Http::fake`.
 */
class OngkirV15OpsiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Product $product;

    private int $variantId = 0;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'midtrans.fake' => true,
            'midtrans.server_key' => 'test-server-key',
            'midtrans.expiry_minutes' => 5,
            'biteship.key' => '',
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

    public function test_baris_string_lama_dipakai_bukan_default(): void
    {
        $this->setCouriers(['jne:reg', 'sicepat:reg']);
        $this->isiKeranjang();

        $opsi = $this->getJson('/checkout/ongkir?postal_code=51111')->assertOk()->json('opsi');

        $this->assertCount(2, $opsi);
        $this->assertSame(['jne', 'sicepat'], array_column($opsi, 'courier_code'));
        $this->assertLessThan(count(BiteshipService::DEFAULT_COURIERS), count($opsi));
    }

    public function test_baris_array_tetap_diterima(): void
    {
        $this->setCouriers([[
            'courier_code' => 'jne',
            'service_code' => 'reg',
            'label' => 'JNE REG',
            'is_regular' => true,
            'is_active' => true,
        ]]);
        $this->isiKeranjang();

        $opsi = $this->getJson('/checkout/ongkir?postal_code=51111')->assertOk()->json('opsi');

        $this->assertCount(1, $opsi);
        $this->assertSame('jne', $opsi[0]['courier_code']);
        $this->assertSame('JNE REG', $opsi[0]['label']);
        $this->assertTrue($opsi[0]['is_regular']);
    }

    public function test_duplikat_beda_huruf_dibuang(): void
    {
        $this->setCouriers([
            'jne:reg',
            'JNE:REG',
            ['courier_code' => 'Jne', 'service_code' => 'REG'],
        ]);
        $this->isiKeranjang();

        $opsi = $this->getJson('/checkout/ongkir?postal_code=51111')->assertOk()->json('opsi');

        $this->assertCount(1, $opsi);
        $this->assertSame('jne', $opsi[0]['courier_code']);
        $this->assertSame('reg', $opsi[0]['service_code']);
    }

    public function test_hanya_baris_aktif_tampil(): void
    {
        $this->setCouriers([
            ['courier_code' => 'jne', 'service_code' => 'reg', 'is_active' => true],
            ['courier_code' => 'sicepat', 'service_code' => 'reg', 'is_active' => false],
        ]);
        $this->isiKeranjang();

        $opsi = $this->getJson('/checkout/ongkir?postal_code=51111')->assertOk()->json('opsi');

        $this->assertCount(1, $opsi);
        $this->assertSame('jne', $opsi[0]['courier_code']);
    }

    public function test_default_dipakai_bila_tidak_ada_baris_sah(): void
    {
        $this->setCouriers(['', 'jne', ['courier_code' => '', 'service_code' => 'reg'], 123]);
        $this->isiKeranjang();

        $opsi = $this->getJson('/checkout/ongkir?postal_code=51111')->assertOk()->json('opsi');

        $this->assertCount(count(BiteshipService::DEFAULT_COURIERS), $opsi);
    }

    public function test_opsi_urut_nama_kurir_lalu_layanan(): void
    {
        config(['biteship.key' => 'test-biteship-key', 'biteship.base_url' => 'https://api.biteship.test']);
        $this->setCouriers(['anteraja:reg', 'jne:reg', 'jne:oke']);
        $this->fakeRates(['anteraja:reg', 'jne:reg', 'jne:oke']);
        $this->isiKeranjang();

        $opsi = $this->getJson('/checkout/ongkir?postal_code=51111')->assertOk()->json('opsi');

        $this->assertSame(
            [['ANTERAJA', 'REG'], ['JNE', 'OKE'], ['JNE', 'REG']],
            array_map(fn (array $row): array => [$row['courier_name'], $row['service_name']], $opsi),
        );
    }

    public function test_log_layanan_aktif_tanpa_tarif_tanpa_token(): void
    {
        config(['biteship.key' => 'test-biteship-key', 'biteship.base_url' => 'https://api.biteship.test']);
        $this->setCouriers(['jne:reg', 'sicepat:reg']);
        $this->fakeRates(['jne:reg']);
        Log::spy();
        $this->isiKeranjang();

        $this->getJson('/checkout/ongkir?postal_code=51111')
            ->assertOk()
            ->assertJson(['opsi' => [['courier_code' => 'jne']], 'galat' => null]);

        Log::shouldHaveReceived('warning')
            ->withArgs(fn (string $pesan, array $konteks = []): bool => $pesan === 'Biteship layanan aktif tanpa tarif'
                && array_keys($konteks) === ['layanan']
                && $konteks['layanan'] === ['sicepat:reg']
                && ! str_contains(json_encode($konteks), 'test-biteship-key'));
    }

    /**
     * @param  list<mixed>  $rows
     */
    private function setCouriers(array $rows): void
    {
        Setting::query()->updateOrCreate(
            ['key' => 'shipping_couriers'],
            ['value' => json_encode($rows), 'group' => 'shipping', 'type' => 'json'],
        );
    }

    /**
     * Jawab Biteship rates hanya untuk layanan yang disebut (sisanya = tanpa tarif).
     *
     * @param  list<string>  $keys  `courier:service`
     */
    private function fakeRates(array $keys): void
    {
        $pricing = [];

        foreach ($keys as $key) {
            [$courier, $service] = explode(':', $key, 2);

            $pricing[] = [
                'courier_code' => $courier,
                'courier_service_code' => $service,
                'price' => 11000,
                'duration' => '2 days',
            ];
        }

        Http::fake(['api.biteship.test/*' => Http::response(['success' => true, 'pricing' => $pricing], 200)]);
    }

    private function isiKeranjang(): void
    {
        $this->post('/keranjang', [
            'product_id' => $this->product->id,
            'variant_id' => $this->variantId,
            'qty' => 1,
        ])->assertSessionHas('success');
    }
}

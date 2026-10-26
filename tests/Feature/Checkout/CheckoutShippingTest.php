<?php

namespace Tests\Feature\Checkout;

use App\Models\Admin;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\User;
use App\Services\BiteshipService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Ongkir Biteship + pengaturan ekspedisi (PRD v1.1 D2/D3, kontrak §7.12 & §10.13).
 * Mode `fake` (tanpa BITESHIP_API_KEY) dipakai agar tidak ada panggilan jaringan.
 */
class CheckoutShippingTest extends TestCase
{
    use RefreshDatabase;

    private int $productId = 0;

    private int $variantId = 0;

    private User $user;

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
            ['free_shipping_min', '100000', 'shipping', 'text'],
            ['shipping_origin_name', '[CONTOH] Toko Kulot', 'shipping', 'text'],
            ['shipping_origin_phone', '081200000001', 'shipping', 'text'],
            ['shipping_origin_address', '[CONTOH] Jl. Kauman No. 45, Pekalongan', 'shipping', 'textarea'],
            ['shipping_origin_postal_code', '51122', 'shipping', 'text'],
            ['store_name', '[CONTOH] Toko Daster Kulot', 'umum', 'text'],
        ] as [$key, $value, $group, $type]) {
            Setting::create(compact('key', 'value', 'group', 'type'));
        }

        $category = Category::create([
            'name' => '[CONTOH] Daster',
            'slug' => 'contoh-daster',
            'is_active' => true,
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => '[CONTOH] Daster Kulot Premium',
            'slug' => 'contoh-daster-kulot-premium',
            'base_price' => 85000,
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'size' => 'L',
            'color' => 'Merah',
            'sku' => 'CONTOH-L-MERAH',
            'price_delta' => 0,
            'stock' => 10,
            'is_active' => true,
        ]);

        $this->productId = (int) $product->id;
        $this->variantId = (int) $variant->id;
    }

    private function isiKeranjang(int $qty = 2): void
    {
        $this->post('/keranjang', [
            'product_id' => $this->productId,
            'variant_id' => $this->variantId,
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

    public function test_ongkir_wajib_login(): void
    {
        auth('web')->logout();

        $this->get('/checkout/ongkir?postal_code=51111')->assertRedirect();
    }

    public function test_kode_pos_harus_lima_angka(): void
    {
        $this->getJson('/checkout/ongkir?postal_code=abc')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['postal_code' => 'Kode pos harus 5 angka.']);
    }

    public function test_keranjang_kosong_tidak_memanggil_kurir(): void
    {
        $this->getJson('/checkout/ongkir?postal_code=51111')
            ->assertStatus(422)
            ->assertJson([
                'mode' => 'fake',
                'berat_gram' => 0,
                'opsi' => [],
                'galat' => 'Keranjang masih kosong.',
            ]);
    }

    public function test_mode_fake_mengembalikan_tarif_datar_dan_gratis_reguler(): void
    {
        $this->isiKeranjang(2);

        $response = $this->getJson('/checkout/ongkir?postal_code=51111')->assertOk();

        $response->assertJson([
            'mode' => 'fake',
            'kode_pos' => '51111',
            'berat_gram' => 600,
            'subtotal' => 170000,
            'gratis' => ['aktif' => true, 'min' => 100000, 'terpenuhi' => true],
            'galat' => null,
        ]);

        $opsi = $response->json('opsi');

        $this->assertCount(count(BiteshipService::DEFAULT_COURIERS), $opsi);
        $this->assertSame(20000, $opsi[0]['cost']);
        $this->assertTrue($opsi[0]['is_regular']);
        $this->assertTrue($opsi[0]['gratis']);
    }

    public function test_checkout_tanpa_pilihan_kurir_di_mode_fake_memakai_tarif_uji(): void
    {
        $this->isiKeranjang(2);

        $this->post('/checkout', $this->dataCheckout())->assertSessionHas('success');

        $order = Order::query()->firstOrFail();

        $this->assertSame(20000, (int) $order->shipping_cost);
        $this->assertFalse((bool) $order->shipping_is_free);
        $this->assertNull($order->shipping_courier);
        $this->assertSame(190000, (int) $order->total);
        // Produk tanpa berat: fallback 300 g/unit × 2 (PRD-v1.4 §2.2), tanpa minimum 500 g.
        $this->assertSame(600, (int) $order->shipping_weight_gram);
    }

    public function test_gratis_ongkir_hanya_untuk_layanan_reguler(): void
    {
        $this->isiKeranjang(2);

        $this->post('/checkout', $this->dataCheckout([
            'shipping_courier' => 'jne',
            'shipping_service' => 'reg',
        ]))->assertSessionHas('success');

        $order = Order::query()->firstOrFail();

        $this->assertSame(0, (int) $order->shipping_cost);
        $this->assertTrue((bool) $order->shipping_is_free);
        $this->assertSame('jne', $order->shipping_courier);
        $this->assertSame('reg', $order->shipping_service);
        $this->assertSame(170000, (int) $order->total);
    }

    public function test_ongkir_dari_form_tidak_dipercaya(): void
    {
        $this->isiKeranjang(2);

        $this->post('/checkout', $this->dataCheckout([
            'shipping_courier' => 'jne',
            'shipping_service' => 'reg',
            'shipping_cost' => '5000',
        ]))->assertSessionHas('error', 'Ongkir berubah, pilih ulang kurir.');

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_halaman_ekspedisi_hanya_untuk_admin(): void
    {
        $this->get('/admin/ekspedisi')->assertRedirect();

        $this->actingAs(Admin::factory()->create(), 'admin')
            ->get('/admin/ekspedisi')
            ->assertOk();
    }

    public function test_admin_menyimpan_pengaturan_ekspedisi(): void
    {
        $this->actingAs(Admin::factory()->create(), 'admin')
            ->put('/admin/ekspedisi', [
                'shipping_origin_name' => 'Toko Kulot Pekalongan',
                'shipping_origin_phone' => '081200000002',
                'shipping_origin_address' => 'Jl. Kauman No. 45, Pekalongan Timur',
                'shipping_origin_postal_code' => '51122',
                'free_shipping_enabled' => true,
                'free_shipping_min' => 250000,
                'shipping_cost_default' => 22000,
                'couriers' => [
                    ['courier_code' => 'JNE', 'service_code' => 'reg', 'label' => 'JNE REG', 'is_regular' => true, 'is_active' => true],
                    ['courier_code' => 'jnt', 'service_code' => 'ez', 'label' => 'J&T EZ', 'is_regular' => true, 'is_active' => false],
                ],
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertSame('Toko Kulot Pekalongan', Setting::query()->where('key', 'shipping_origin_name')->value('value'));
        $this->assertSame('250000', Setting::query()->where('key', 'free_shipping_min')->value('value'));
        $this->assertSame('1', Setting::query()->where('key', 'free_shipping_enabled')->value('value'));

        $couriers = json_decode((string) Setting::query()->where('key', 'shipping_couriers')->value('value'), true);

        $this->assertSame('jne', $couriers[0]['courier_code']);
        $this->assertTrue($couriers[0]['is_active']);
        $this->assertFalse($couriers[1]['is_active']);
    }

    public function test_admin_tidak_bisa_menonaktifkan_semua_kurir(): void
    {
        $this->actingAs(Admin::factory()->create(), 'admin')
            ->put('/admin/ekspedisi', [
                'shipping_origin_name' => 'Toko Kulot Pekalongan',
                'shipping_origin_phone' => '081200000002',
                'shipping_origin_address' => 'Jl. Kauman No. 45, Pekalongan Timur',
                'shipping_origin_postal_code' => '51122',
                'free_shipping_min' => 250000,
                'free_shipping_enabled' => false,
                'shipping_cost_default' => 22000,
                'couriers' => [
                    ['courier_code' => 'jne', 'service_code' => 'reg', 'label' => 'JNE REG', 'is_regular' => true, 'is_active' => false],
                ],
            ])
            ->assertSessionHasErrors('couriers');

        // Data lama tidak boleh tertimpa saat validasi gagal.
        $this->assertSame('[CONTOH] Toko Kulot', Setting::query()->where('key', 'shipping_origin_name')->value('value'));
        $this->assertNull(Setting::query()->where('key', 'shipping_couriers')->first());
    }
}

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
use App\Services\Midtrans\MidtransApi;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Tests\Support\FakeMidtransApi;
use Tests\TestCase;

/**
 * Verifikasi QA independen untuk PRD v1.1 D1–D5 (kartu `t_4c147c9f`).
 *
 * Fokus pada celah yang belum ditutup test regresi pemilik:
 * - D1 AC1: halaman bayar membawa `snap_redirect_url` dan tidak membocorkan server key;
 * - D1 AC2: webhook settlement bank_transfer idempoten (paid_at & stok tidak berubah);
 * - D2 AC4: kegagalan API Biteship tidak membuat pesanan;
 * - D3 AC1–AC3: batas gratis ongkir Rp300.000 dan layanan non-reguler;
 * - D4: bentuk props `kurir` kontrak §10.13 (mode/key_terisi/daftar);
 * - D5: `settings.landing_gallery` dibagikan ke beranda.
 *
 * Tanpa jaringan: Midtrans diganti `FakeMidtransApi`, Biteship mode `fake`
 * (kecuali test kegagalan API yang memakai `Http::fake`).
 */
class QaV11OngkirPembayaranTest extends TestCase
{
    use RefreshDatabase;

    private FakeMidtransApi $api;

    private User $user;

    private int $productId = 0;

    private int $variantId = 0;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'midtrans.fake' => false,
            'midtrans.server_key' => 'test-server-key',
            'midtrans.client_key' => 'test-client-key',
            'midtrans.is_production' => false,
            'midtrans.expiry_minutes' => 5,
            'biteship.key' => null,
        ]);

        $this->api = new FakeMidtransApi;
        $this->app->instance(MidtransApi::class, $this->api);

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

    public function test_halaman_bayar_memakai_snap_dan_tidak_membocorkan_server_key(): void
    {
        $order = $this->buatPesanan();

        $this->get(route('checkout.pay', $order))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/CheckoutPay', false)
                ->where('pembayaran.method', 'midtrans')
                ->where('pembayaran.snap_redirect_url', fn ($url) => is_string($url) && str_contains($url, 'midtrans'))
                ->where('midtrans.server_key_terisi', true)
                ->where('midtrans.mode', 'asli'))
            ->assertDontSee('test-server-key');
    }

    public function test_webhook_settlement_bank_transfer_idempoten(): void
    {
        $order = $this->buatPesanan();
        $payment = $order->payment()->firstOrFail();
        $stockAwal = (int) ProductVariant::query()->findOrFail($this->variantId)->stock;

        $payload = $this->payload($payment, [
            'transaction_status' => 'settlement',
            'payment_type' => 'bank_transfer',
        ]);

        $this->postJson('/midtrans/notification', $payload)->assertOk();
        $payment->refresh();
        $paidAt = $payment->paid_at?->toIso8601String();

        $this->assertSame(Order::PAYMENT_SETTLEMENT, $payment->status);
        $this->assertSame('bank_transfer', $payment->payment_type);

        // Notifikasi ulang: status sama, tidak boleh mengubah paid_at atau stok.
        $this->postJson('/midtrans/notification', $payload)->assertOk();

        $payment->refresh();
        $order->refresh();

        $this->assertSame($paidAt, $payment->paid_at?->toIso8601String(), 'paid_at tidak boleh bergeser.');
        $this->assertSame($stockAwal, (int) ProductVariant::query()->findOrFail($this->variantId)->stock, 'Stok tidak boleh berubah dua kali.');
        $this->assertSame(1, $order->payment()->count());
        $this->assertSame(Order::STATUS_PAID, $order->status);
    }

    public function test_kegagalan_api_biteship_tidak_membuat_pesanan(): void
    {
        config(['biteship.key' => 'test-biteship-key']);

        Http::fake(['api.biteship.com/*' => Http::response(['success' => false], 500)]);

        $this->isiKeranjang(1);

        $this->getJson('/checkout/ongkir?postal_code=51111')
            ->assertOk()
            ->assertJson(['opsi' => [], 'galat' => BiteshipService::GALAT_API]);

        $this->post('/checkout', $this->dataCheckout([
            'shipping_courier' => 'jne',
            'shipping_service' => 'reg',
        ]))->assertSessionHas('error', BiteshipService::GALAT_API);

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_galat_biteship_40001001_memberi_pesan_kode_pos_dan_mencatat_kode(): void
    {
        config(['biteship.key' => 'test-biteship-key']);
        Log::spy();

        Http::fake(['api.biteship.com/*' => Http::response([
            'success' => false,
            'error' => 'Failed due to invalid or not available postal code.',
            'code' => 40001001,
        ], 400)]);

        $this->isiKeranjang(1);

        $this->getJson('/checkout/ongkir?postal_code=99999')
            ->assertOk()
            ->assertJson(['opsi' => [], 'galat' => BiteshipService::GALAT_KODE_POS]);

        // Log harus memuat kode error + kode pos asal/tujuan, tanpa header/kunci.
        Log::shouldHaveReceived('warning')
            ->withArgs(fn (string $pesan, array $konteks = []): bool => $pesan === 'Biteship rates menjawab tidak sukses'
                && ($konteks['code'] ?? null) === 40001001
                && ($konteks['success'] ?? null) === false
                && ($konteks['origin_postal_code'] ?? null) === 51122
                && ($konteks['destination_postal_code'] ?? null) === 99999);
    }

    public function test_galat_biteship_400_saldo_habis_memberi_pesan_saldo(): void
    {
        config(['biteship.key' => 'test-biteship-key']);
        Log::spy();

        // Jawaban asli Biteship saat saldo akun habis: 400 tanpa `code`, hanya `error`.
        Http::fake(['api.biteship.com/*' => Http::response([
            'success' => false,
            'error' => 'No sufficient balance to call rates API. Please top up your balance',
            'code' => null,
        ], 400)]);

        $this->isiKeranjang(1);

        $this->getJson('/checkout/ongkir?postal_code=60184')
            ->assertOk()
            ->assertJson(['opsi' => [], 'galat' => BiteshipService::GALAT_SALDO]);

        Log::shouldHaveReceived('warning')
            ->withArgs(fn (string $pesan, array $konteks = []): bool => $pesan === 'Biteship rates menjawab tidak sukses'
                && array_key_exists('code', $konteks) && $konteks['code'] === null
                && str_contains((string) ($konteks['error'] ?? ''), 'No sufficient balance')
                && ($konteks['destination_postal_code'] ?? null) === 60184);
    }

    public function test_peta_kode_galat_biteship_selain_kode_pos(): void
    {
        config(['biteship.key' => 'test-biteship-key']);

        $this->isiKeranjang(1);

        $kode = 40001002;
        Http::fake(function () use (&$kode) {
            return Http::response(['success' => false, 'error' => 'contoh', 'code' => $kode], 400);
        });

        foreach ([
            40001002 => BiteshipService::GALAT_PARAMETER,
            40001010 => BiteshipService::GALAT_TANPA_KURIR,
            49999999 => BiteshipService::GALAT_API,
        ] as $kode => $pesan) {
            $this->getJson('/checkout/ongkir?postal_code=51111')
                ->assertOk()
                ->assertJson(['opsi' => [], 'galat' => $pesan]);
        }
    }

    public function test_subtotal_tepat_300000_dapat_gratis_ongkir_reguler(): void
    {
        Product::query()->update(['base_price' => 300000]);

        $this->isiKeranjang(1);

        $this->post('/checkout', $this->dataCheckout([
            'shipping_courier' => 'jne',
            'shipping_service' => 'reg',
        ]))->assertSessionHas('success');

        $order = Order::query()->firstOrFail();

        $this->assertSame(0, (int) $order->shipping_cost);
        $this->assertTrue((bool) $order->shipping_is_free);
        $this->assertSame(300000, (int) $order->total);
    }

    public function test_subtotal_299999_tidak_dapat_gratis_ongkir(): void
    {
        Product::query()->update(['base_price' => 299999]);

        $this->isiKeranjang(1);

        $this->post('/checkout', $this->dataCheckout([
            'shipping_courier' => 'jne',
            'shipping_service' => 'reg',
        ]))->assertSessionHas('success');

        $order = Order::query()->firstOrFail();

        $this->assertSame(20000, (int) $order->shipping_cost);
        $this->assertFalse((bool) $order->shipping_is_free);
        $this->assertSame(319999, (int) $order->total);
    }

    public function test_layanan_non_reguler_tetap_berbayar_walau_di_atas_batas(): void
    {
        Setting::query()->updateOrCreate(
            ['key' => 'shipping_couriers'],
            [
                'value' => json_encode([[
                    'courier_code' => 'jne',
                    'service_code' => 'yes',
                    'label' => 'JNE YES',
                    'is_regular' => false,
                    'is_active' => true,
                ]]),
                'group' => 'shipping',
                'type' => 'json',
            ],
        );

        Product::query()->update(['base_price' => 500000]);

        $this->isiKeranjang(1);

        $this->post('/checkout', $this->dataCheckout([
            'shipping_courier' => 'jne',
            'shipping_service' => 'yes',
        ]))->assertSessionHas('success');

        $order = Order::query()->firstOrFail();

        $this->assertSame(20000, (int) $order->shipping_cost);
        $this->assertFalse((bool) $order->shipping_is_free);
        $this->assertSame('yes', $order->shipping_service);
    }

    public function test_kunci_biteship_tidak_pernah_dikirim_di_props_ekspedisi(): void
    {
        config(['biteship.key' => 'test-biteship-key']);
        Http::fake(['api.biteship.com/*' => Http::response(['success' => true, 'couriers' => []], 200)]);

        $this->actingAs(Admin::factory()->create(), 'admin')
            ->get('/admin/ekspedisi')
            ->assertOk()
            ->assertDontSee('test-biteship-key');
    }

    public function test_props_kurir_ekspedisi_mengikuti_kontrak_10_13(): void
    {
        $this->actingAs(Admin::factory()->create(), 'admin')
            ->get('/admin/ekspedisi')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Shipping/Index', false)
                ->where('kurir.mode', 'fake')
                ->where('kurir.key_terisi', false)
                ->has('kurir.daftar', count(BiteshipService::DEFAULT_COURIERS)));
    }

    public function test_daftar_kurir_biteship_gagal_tetap_tampil_dengan_data_lama(): void
    {
        Setting::query()->updateOrCreate(
            ['key' => 'shipping_couriers'],
            [
                'value' => json_encode([[
                    'courier_code' => 'jne',
                    'service_code' => 'reg',
                    'label' => 'JNE REG',
                    'is_regular' => true,
                    'is_active' => true,
                ]]),
                'group' => 'shipping',
                'type' => 'json',
            ],
        );

        config(['biteship.key' => 'test-biteship-key']);
        Http::fake(['api.biteship.com/*' => Http::response(['success' => false], 500)]);

        $this->actingAs(Admin::factory()->create(), 'admin')
            ->get('/admin/ekspedisi')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('kurir.mode', 'api')
                ->where('kurir.galat', fn ($galat) => is_string($galat) && str_contains($galat, 'courier_code:service_code'))
                ->has('kurir.daftar', 1)
                ->where('kurir.daftar.0.courier_code', 'jne'));
    }

    public function test_galeri_landing_dibagikan_ke_beranda(): void
    {
        Setting::create([
            'key' => 'landing_gallery',
            'value' => json_encode([
                ['image' => '/storage/landing/galeri-1.webp', 'caption' => 'Koleksi 1', 'alt' => 'Daster merah'],
                ['image' => '/storage/landing/galeri-2.webp', 'caption' => 'Koleksi 2', 'alt' => 'Daster biru'],
            ]),
            'group' => 'landing',
            'type' => 'json',
        ]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Home', false)
                ->has('settings.landing_gallery', 2)
                ->where('settings.landing_gallery.0.image', '/storage/landing/galeri-1.webp'));

        Setting::query()->where('key', 'landing_gallery')->delete();

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('settings.landing_gallery', null));
    }

    private function isiKeranjang(int $qty = 1): void
    {
        $this->post('/keranjang', [
            'product_id' => $this->productId,
            'variant_id' => $this->variantId,
            'qty' => $qty,
        ])->assertSessionHas('success');
    }

    /**
     * @param  array<string, mixed>  $extra
     * @return array<string, mixed>
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

    private function buatPesanan(): Order
    {
        $this->isiKeranjang(1);

        $this->post('/checkout', $this->dataCheckout())->assertSessionHas('success');

        return Order::query()->latest('id')->firstOrFail();
    }

    /**
     * @param  array<string, mixed>  $extra
     * @return array<string, mixed>
     */
    private function payload(\App\Models\Payment $payment, array $extra = []): array
    {
        $payload = array_merge([
            'order_id' => (string) $payment->order_id_midtrans,
            'status_code' => '200',
            'gross_amount' => (string) (int) $payment->gross_amount,
            'transaction_id' => 'trx-'.$payment->id,
        ], $extra);

        $payload['signature_key'] = hash(
            'sha512',
            $payload['order_id'].$payload['status_code'].$payload['gross_amount'].'test-server-key',
        );

        return $payload;
    }
}

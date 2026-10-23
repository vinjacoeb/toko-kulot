<?php

namespace Tests\Feature\Checkout;

use App\Models\Category;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\User;
use App\Services\Midtrans\MidtransApi;
use App\Services\Midtrans\SdkMidtransApi;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Bentuk respons SDK Midtrans yang SEBENARNYA (kartu `t_3bfe3165`, `docs/review-2.md` §6 G1).
 *
 * `Midtrans\ApiRequestor::remoteCall()` memakai `json_decode($result)` tanpa `true`
 * (`vendor/midtrans/midtrans-php/Midtrans/ApiRequestor.php:159`), jadi SDK mengembalikan
 * `stdClass` dengan `actions[]` berisi `stdClass`. Seam `MidtransApi` menjanjikan array
 * bersarang (`app/Services/Midtrans/MidtransApi.php:14-27`), dan
 * `MidtransService::qrUrl()` (`app/Services/MidtransService.php:537-546`) membaca
 * `$action['name']`; bentuk stdClass membuat halaman bayar 500.
 *
 * Test ini meniru SDK tanpa jaringan: subclass `SdkMidtransApi` hanya mengganti panggilan
 * mentahnya (`requestCharge()`/`requestStatus()`) dengan `json_decode()` tanpa `true`.
 * Sebelum perbaikan adapter, test ini GAGAL (galat stdClass / `qr_url` tidak pernah terisi).
 */
class MidtransSdkShapeTest extends TestCase
{
    use RefreshDatabase;

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
        ]);

        $this->actingAs(User::factory()->create());

        Setting::create([
            'key' => 'shipping_cost_default',
            'value' => '20000',
            'group' => 'pengiriman',
            'type' => 'number',
        ]);

        Setting::create([
            'key' => 'store_name',
            'value' => '[CONTOH] Toko Daster Kulot',
            'group' => 'umum',
            'type' => 'text',
        ]);

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

    public function test_charge_menormalkan_bentuk_respons_sdk_jadi_array_bersarang(): void
    {
        $api = $this->sdkShapedApi();

        $response = $api->charge([
            'payment_type' => 'qris',
            'transaction_details' => ['order_id' => 'DS-20261022-0001', 'gross_amount' => 105000],
        ]);

        $this->assertSame(1, $api->chargeCalls, 'Seam charge harus dipanggil sekali.');
        $this->assertSame('DS-20261022-0001', $api->chargeParams['transaction_details']['order_id'] ?? null);

        $this->assertIsArray($response);
        $this->assertSame('pending', $response['transaction_status']);
        $this->assertSame('105000.00', $response['gross_amount']);

        // Inti cacat §6 G1: `actions` harus array biasa, bukan array berisi stdClass.
        $this->assertIsArray($response['actions']);
        $this->assertIsArray($response['actions'][0]);
        $this->assertSame('generate-qr-code', $response['actions'][0]['name']);
        $this->assertSame(
            'https://api.sandbox.midtrans.com/v2/qris/DS-20261022-0001/qr-code',
            $response['actions'][0]['url'],
        );

        // Objek bersarang lain ikut menjadi array.
        $this->assertIsArray($response['customer_details']['shipping_address']);
        $this->assertSame('IDN', $response['customer_details']['shipping_address']['country_code']);
        $this->assertIsArray($response['custom_expiry']);
        $this->assertSame(5, $response['custom_expiry']['expiry_duration']);
    }

    public function test_status_menormalkan_bentuk_respons_sdk_jadi_array_bersarang(): void
    {
        $api = $this->sdkShapedApi();

        $response = $api->status('DS-20261022-0001');

        $this->assertSame(1, $api->statusCalls);
        $this->assertIsArray($response);
        $this->assertSame('settlement', $response['transaction_status']);
        $this->assertIsArray($response['va_numbers']);
        $this->assertIsArray($response['va_numbers'][0]);
        $this->assertSame('bca', $response['va_numbers'][0]['bank']);
    }

    public function test_checkout_mode_asli_menyimpan_qr_url_dari_respons_sdk(): void
    {
        $api = $this->sdkShapedApi();
        $this->app->instance(MidtransApi::class, $api);

        $order = $this->buatPesanan();

        $this->assertSame(1, $api->chargeCalls);

        $payment = Payment::query()->where('order_id', $order->id)->firstOrFail();
        $midtransOrderId = (string) $payment->order_id_midtrans;

        $this->assertStringStartsWith($order->code.'-', $midtransOrderId);

        $this->assertSame(
            'https://api.sandbox.midtrans.com/v2/qris/'.$midtransOrderId.'/qr-code',
            $payment->qris_url,
            'QRIS asli harus tersimpan, bukan null karena galat stdClass.',
        );
        $this->assertSame('trx-sdk-qris', $payment->transaction_id);
        $this->assertNotEmpty($payment->qr_string);
        $this->assertSame(Order::PAYMENT_PENDING, $payment->status);
        $this->assertIsArray($payment->payload['actions'] ?? null);
        $this->assertSame('generate-qr-code', $payment->payload['actions'][0]['name'] ?? null);
        $this->assertSame(
            'https://api.sandbox.midtrans.com/v2/qris/'.$midtransOrderId.'/qr-code',
            $payment->payload['actions'][0]['url'] ?? null,
        );
    }

    public function test_halaman_bayar_menampilkan_qr_asli_dari_respons_sdk(): void
    {
        $this->app->instance(MidtransApi::class, $this->sdkShapedApi());

        $order = $this->buatPesanan();
        $payment = Payment::query()->where('order_id', $order->id)->firstOrFail();
        $qrisUrl = 'https://api.sandbox.midtrans.com/v2/qris/'.$payment->order_id_midtrans.'/qr-code';

        $this->get('/checkout/'.$order->id.'/bayar')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/CheckoutPay', false)
                ->where('pembayaran.galat', null)
                ->where('pembayaran.fake', false)
                ->where('pembayaran.status', Order::PAYMENT_PENDING)
                ->where('pembayaran.qris_url', $qrisUrl)
                ->where('pembayaran.qr_string', fn ($value) => is_string($value) && $value !== '')
            );
    }

    private function buatPesanan(): Order
    {
        $this->post('/keranjang', [
            'product_id' => $this->productId,
            'variant_id' => $this->variantId,
            'qty' => 1,
        ])->assertSessionHas('success');

        $this->post('/checkout', [
            'customer_name' => 'Siti Aminah',
            'customer_phone' => '081234567890',
            'customer_email' => 'siti@example.test',
            'customer_address' => 'Jl. Melati No. 12, RT 02 RW 03',
            'customer_city' => 'Pekalongan',
            'customer_postal_code' => '51111',
            'note' => 'Tolong dibungkus rapi.',
        ])->assertSessionHas('success');

        return Order::query()->firstOrFail();
    }

    /**
     * `SdkMidtransApi` dengan panggilan SDK diganti `json_decode()` tanpa `true` —
     * bentuk persis yang dikembalikan `Midtrans\ApiRequestor` (stdClass bersarang).
     */
    private function sdkShapedApi(): SdkMidtransApi
    {
        return new class($this->chargeResponseJson(), $this->statusResponseJson()) extends SdkMidtransApi
        {
            public int $chargeCalls = 0;

            public int $statusCalls = 0;

            /** @var array<string, mixed> */
            public array $chargeParams = [];

            public function __construct(
                private readonly string $chargeJson,
                private readonly string $statusJson,
            ) {}

            /**
             * @param  array<string, mixed>  $params
             */
            protected function requestCharge(array $params): mixed
            {
                $this->chargeCalls++;
                $this->chargeParams = $params;

                $response = json_decode($this->chargeJson, false, 512, JSON_THROW_ON_ERROR);
                $orderId = (string) ($params['transaction_details']['order_id'] ?? '');

                $response->order_id = $orderId;

                foreach ($response->actions as $action) {
                    $action->url = str_replace('{order_id}', $orderId, (string) $action->url);
                }

                return $response;
            }

            protected function requestStatus(string $orderId): mixed
            {
                $this->statusCalls++;

                return json_decode($this->statusJson, false, 512, JSON_THROW_ON_ERROR);
            }
        };
    }

    private function chargeResponseJson(): string
    {
        return json_encode([
            'status_code' => '201',
            'status_message' => 'QRIS transaction is created',
            'transaction_id' => 'trx-sdk-qris',
            'order_id' => 'DS-20261022-0001',
            'gross_amount' => '105000.00',
            'currency' => 'IDR',
            'payment_type' => 'qris',
            'transaction_time' => '2026-10-22 09:12:31',
            'transaction_status' => 'pending',
            'fraud_status' => 'accept',
            'qr_string' => '00020101021226610014ID.CO.QRIS.WWW0215936000000000000000303UMI5204541153033605802ID5918TOKO DASTER KULOT6009PEKALONGAN6304A1B2',
            'actions' => [
                [
                    'name' => 'generate-qr-code',
                    'method' => 'GET',
                    'url' => 'https://api.sandbox.midtrans.com/v2/qris/{order_id}/qr-code',
                ],
            ],
            'customer_details' => [
                'first_name' => 'Siti Aminah',
                'email' => 'siti@example.test',
                'phone' => '081234567890',
                'shipping_address' => [
                    'first_name' => 'Siti Aminah',
                    'address' => 'Jl. Melati No. 12, RT 02 RW 03',
                    'city' => 'Pekalongan',
                    'postal_code' => '51111',
                    'country_code' => 'IDN',
                ],
            ],
            'custom_expiry' => ['expiry_duration' => 5, 'unit' => 'minute'],
        ], JSON_THROW_ON_ERROR);
    }

    private function statusResponseJson(): string
    {
        return json_encode([
            'status_code' => '200',
            'status_message' => 'Success, transaction is found',
            'transaction_id' => 'trx-sdk-qris',
            'order_id' => 'DS-20261022-0001',
            'gross_amount' => '105000.00',
            'currency' => 'IDR',
            'payment_type' => 'qris',
            'transaction_time' => '2026-10-22 09:12:31',
            'transaction_status' => 'settlement',
            'fraud_status' => 'accept',
            'va_numbers' => [
                ['bank' => 'bca', 'va_number' => '12345678901'],
            ],
        ], JSON_THROW_ON_ERROR);
    }
}

<?php

namespace Tests\Feature\Checkout;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\User;
use App\Services\Midtrans\MidtransApi;
use App\Services\MidtransService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\FakeMidtransApi;
use Tests\TestCase;

/**
 * `order_id` Midtrans unik per panggilan charge (kartu `t_a90d5215`, usulan U8
 * `docs/catatan-techlead.md`).
 *
 * Cacat lama: jalur asli mengirim `orders.code` apa adanya. Bila checkout gagal
 * SESUDAH charge (mis. bentuk respons SDK membuat `qrUrl()` melempar galat),
 * transaksi database rollback dan kode pesanan dipakai lagi pada checkout
 * berikutnya — Midtrans menolak `order_id` yang sudah terpakai (HTTP 406).
 *
 * Perbaikan: `order_id` Midtrans = `orders.code` + sufiks 6 hex per panggilan
 * charge; `orders.code` yang tampil ke pembeli/admin tetap tanpa sufiks.
 */
class MidtransOrderIdUniqueTest extends TestCase
{
    use RefreshDatabase;

    private int $productId = 0;

    private int $variantId = 0;

    private FakeMidtransApi $api;

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

        $this->api = new FakeMidtransApi;
        $this->app->instance(MidtransApi::class, $this->api);

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

    public function test_dua_charge_untuk_pesanan_yang_sama_memakai_order_id_midtrans_berbeda(): void
    {
        $order = $this->buatPesanan();
        $pertama = $order->payment()->firstOrFail();

        // Charge kedua untuk order yang sama (jalur yang dulu memicu 406).
        $kedua = $this->app->make(MidtransService::class)->createQrisCharge($order);

        $this->assertSame(2, $this->api->chargeCount);

        $orderIdPertama = (string) ($this->api->charges[0]['transaction_details']['order_id'] ?? '');
        $orderIdKedua = (string) ($this->api->charges[1]['transaction_details']['order_id'] ?? '');

        $this->assertNotSame($orderIdPertama, $orderIdKedua);
        $this->assertNotSame((string) $pertama->order_id_midtrans, (string) $kedua->order_id_midtrans);

        foreach ([$pertama, $kedua] as $payment) {
            $orderIdMidtrans = (string) $payment->order_id_midtrans;

            $this->assertStringStartsWith($order->code.'-', $orderIdMidtrans);
            $this->assertMatchesRegularExpression('/^TK-\d{8}-\d{4}-[A-F0-9]{6}$/', $orderIdMidtrans);
            $this->assertLessThanOrEqual(
                60,
                strlen($orderIdMidtrans),
                'Panjang order_id Midtrans harus muat di kolom payments.order_id_midtrans (60).',
            );
        }

        // Kode pesanan yang tampil ke pembeli/admin tetap tanpa sufiks.
        $this->assertMatchesRegularExpression('/^TK-\d{8}-\d{4}$/', $order->code);
        $this->assertStringNotContainsString('-A', $order->code);
    }

    public function test_checkout_ulang_setelah_gagal_pasca_charge_tidak_memakai_order_id_yang_sudah_terpakai(): void
    {
        $this->api = new class extends FakeMidtransApi
        {
            public bool $rusakSekali = true;

            /**
             * @param  array<string, mixed>  $params
             * @return array<string, mixed>
             */
            public function charge(array $params): array
            {
                $response = parent::charge($params);

                if ($this->rusakSekali) {
                    $this->rusakSekali = false;
                    // Charge SUDAH sukses di Midtrans, tetapi bentuk respons ini membuat
                    // `qrUrl()` melempar galat sesudahnya (bentuk stdClass seperti SDK asli).
                    $response['actions'] = [(object) [
                        'name' => 'generate-qr-code',
                        'url' => 'https://api.sandbox.midtrans.test/qris/rusak',
                    ]];
                }

                return $response;
            }
        };
        $this->api->rejectDuplicateOrderIds = true;
        $this->app->instance(MidtransApi::class, $this->api);

        $this->isiKeranjang();

        $this->post('/checkout', $this->dataCheckout())->assertStatus(500);

        $this->assertSame(0, Order::query()->count(), 'Checkout gagal harus rollback tanpa order.');
        $this->assertSame(1, $this->api->chargeCount);

        $orderIdPertama = (string) $this->api->usedOrderIds[0];
        $kodePesanan = substr($orderIdPertama, 0, 16);

        $this->assertMatchesRegularExpression('/^TK-\d{8}-\d{4}$/', $kodePesanan);
        $this->assertStringStartsWith($kodePesanan.'-', $orderIdPertama);

        // Keranjang ikut rollback, jadi checkout ulang memakai kode pesanan yang SAMA.
        $this->post('/checkout', $this->dataCheckout())
            ->assertRedirect()
            ->assertSessionHas('success', 'Pesanan dibuat. Selesaikan pembayaran QRIS.');

        $order = Order::query()->firstOrFail();
        $payment = $order->payment()->firstOrFail();

        $this->assertSame($kodePesanan, $order->code);
        $this->assertSame(2, $this->api->chargeCount);
        $this->assertNotSame($orderIdPertama, (string) $payment->order_id_midtrans);
        $this->assertSame((string) $payment->order_id_midtrans, (string) $this->api->usedOrderIds[1]);
    }

    public function test_notifikasi_dengan_order_id_bersufiks_tetap_memperbarui_status(): void
    {
        $order = $this->buatPesanan();
        $payment = $order->payment()->firstOrFail();

        $this->assertNotSame($order->code, (string) $payment->order_id_midtrans);
        $this->assertStringStartsWith($order->code.'-', (string) $payment->order_id_midtrans);

        $payload = [
            'order_id' => (string) $payment->order_id_midtrans,
            'status_code' => '200',
            'gross_amount' => (string) (int) $order->total,
            'transaction_status' => 'settlement',
            'transaction_id' => 'trx-settlement-sufiks',
        ];
        $payload['signature_key'] = hash(
            'sha512',
            $payload['order_id'].$payload['status_code'].$payload['gross_amount'].'test-server-key',
        );

        $this->postJson('/midtrans/notification', $payload)
            ->assertOk()
            ->assertJson(['message' => 'ok']);

        $order->refresh();
        $payment->refresh();

        $this->assertSame(Order::PAYMENT_SETTLEMENT, $payment->status);
        $this->assertNotNull($payment->paid_at);
        $this->assertSame(Order::PAYMENT_SETTLEMENT, $order->payment_status);
        $this->assertSame(Order::STATUS_PAID, $order->status);
        $this->assertNotNull($order->paid_at);
    }

    private function buatPesanan(): Order
    {
        $this->isiKeranjang();

        $this->post('/checkout', $this->dataCheckout())
            ->assertSessionHas('success', 'Pesanan dibuat. Selesaikan pembayaran QRIS.');

        return Order::query()->firstOrFail();
    }

    private function isiKeranjang(): void
    {
        $this->post('/keranjang', [
            'product_id' => $this->productId,
            'variant_id' => $this->variantId,
            'qty' => 1,
        ])->assertSessionHas('success');
    }

    /**
     * @return array<string, string>
     */
    private function dataCheckout(): array
    {
        return [
            'customer_name' => 'Siti Aminah',
            'customer_phone' => '081234567890',
            'customer_email' => 'siti@example.test',
            'customer_address' => 'Jl. Melati No. 12, RT 02 RW 03',
            'customer_city' => 'Pekalongan',
            'customer_postal_code' => '51111',
            'note' => 'Tolong dibungkus rapi.',
        ];
    }
}

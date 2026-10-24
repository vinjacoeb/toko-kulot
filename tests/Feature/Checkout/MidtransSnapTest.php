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
 * Integrasi Midtrans Snap (PRD-v1.1 §2): pembuatan transaksi, penyimpanan
 * token/redirect, `payment_type` dari webhook, `orders.payment_method` saat
 * settlement, dan simulasi mode uji.
 *
 * Semua panggilan jaringan diganti `FakeMidtransApi` (kontrak §7.7, §7.12).
 */
class MidtransSnapTest extends TestCase
{
    use RefreshDatabase;

    private int $productId = 0;

    private int $variantId = 0;

    private FakeMidtransApi $api;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->useRealMode();

        $this->user = User::factory()->create();
        $this->actingAs($this->user);

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

    public function test_snap_menyimpan_token_redirect_dan_order_id_unik(): void
    {
        $order = $this->buatPesanan();
        $payment = $order->payment()->firstOrFail();

        $this->assertSame(1, $this->api->snapCount);
        $this->assertNotNull($payment->snap_token);
        $this->assertStringContainsString('midtrans', (string) $payment->snap_redirect_url);
        $this->assertNull($payment->payment_type, 'payment_type baru diketahui dari webhook.');
        $this->assertNull($payment->qr_string, 'Snap tidak memakai qr_string.');
        $this->assertNull($payment->qris_url);

        $params = $this->api->snaps[0];
        $this->assertSame(105000, $params['transaction_details']['gross_amount']);
        $this->assertSame(5, $params['expiry']['duration']);
        $this->assertArrayNotHasKey('enabled_payments', $params, 'Snap menampilkan semua kanal aktif akun merchant.');

        $firstOrderId = (string) $payment->order_id_midtrans;
        $this->assertStringStartsWith($order->code.'-', $firstOrderId);
        $this->assertLessThanOrEqual(60, strlen($firstOrderId));

        // Panggilan kedua untuk order yang sama harus memakai order_id berbeda.
        $second = $this->app->make(MidtransService::class)->createSnapTransaction($order);
        $this->assertNotSame($firstOrderId, (string) $second->order_id_midtrans);
        $this->assertSame(2, $this->api->snapCount);
    }

    public function test_webhook_bank_transfer_mengisi_payment_type_dan_payment_method(): void
    {
        $order = $this->buatPesanan();
        $payment = $order->payment()->firstOrFail();

        $this->postJson('/midtrans/notification', $this->payload($payment, [
            'transaction_status' => 'settlement',
            'payment_type' => 'bank_transfer',
        ]))->assertOk()->assertJson(['message' => 'ok']);

        $payment->refresh();
        $order->refresh();

        $this->assertSame(Order::PAYMENT_SETTLEMENT, $payment->status);
        $this->assertSame('bank_transfer', $payment->payment_type);
        $this->assertSame('bank_transfer', $order->payment_method);
        $this->assertSame('Transfer Bank', Order::paymentMethodLabel($order->payment_method));
        $this->assertNotNull($payment->paid_at);

        // Notifikasi ulang (status sama) tetap memperbarui kanal tanpa menggandakan apa pun.
        $this->postJson('/midtrans/notification', $this->payload($payment, [
            'transaction_status' => 'settlement',
            'payment_type' => 'echannel',
        ]))->assertOk();

        $payment->refresh();
        $order->refresh();

        $this->assertSame('echannel', $payment->payment_type);
        $this->assertSame('echannel', $order->payment_method);
        $this->assertSame(Order::PAYMENT_SETTLEMENT, $payment->status);
    }

    public function test_webhook_qris_menyimpan_payment_type_qris(): void
    {
        $order = $this->buatPesanan();
        $payment = $order->payment()->firstOrFail();

        $this->postJson('/midtrans/notification', $this->payload($payment, [
            'transaction_status' => 'settlement',
            'payment_type' => 'qris',
        ]))->assertOk();

        $payment->refresh();
        $order->refresh();

        $this->assertSame('qris', $payment->payment_type);
        $this->assertSame('qris', $order->payment_method);
        $this->assertSame('QRIS', Order::paymentMethodLabel($order->payment_method));
    }

    public function test_signature_salah_ditolak_dan_status_tidak_berubah(): void
    {
        $order = $this->buatPesanan();
        $payment = $order->payment()->firstOrFail();

        $payload = $this->payload($payment, [
            'transaction_status' => 'settlement',
            'payment_type' => 'qris',
        ]);
        $payload['signature_key'] = str_repeat('0', 128);

        $this->postJson('/midtrans/notification', $payload)->assertStatus(403);

        $payment->refresh();
        $this->assertSame(Order::PAYMENT_PENDING, $payment->status);
    }

    public function test_simulasi_mode_uji_menandai_lunas_dan_ditolak_di_mode_asli(): void
    {
        config(['midtrans.fake' => true, 'midtrans.server_key' => null, 'midtrans.client_key' => null]);

        $order = $this->buatPesanan();
        $payment = $order->payment()->firstOrFail();

        $this->assertNotNull($payment->qr_string, 'Mode uji menampilkan QRIS dummy.');
        $this->assertNull($payment->snap_token);

        $this->post(route('checkout.simulate', $order))
            ->assertRedirect(route('checkout.pay', $order))
            ->assertSessionHas('success', 'Pembayaran mode uji ditandai lunas.');

        $order->refresh();
        $payment->refresh();

        $this->assertSame(Order::PAYMENT_SETTLEMENT, $payment->status);
        $this->assertSame(Order::STATUS_PAID, $order->status);
        $this->assertNotNull($payment->paid_at);

        // Mode asli: tagihan uji tidak boleh disimulasikan.
        $this->useRealMode();
        $orderBaru = $this->buatPesanan();

        $this->post(route('checkout.simulate', $orderBaru))
            ->assertRedirect(route('checkout.pay', $orderBaru))
            ->assertSessionHas('error');

        $this->assertSame(Order::PAYMENT_PENDING, $orderBaru->payment()->firstOrFail()->status);
    }

    public function test_pengguna_lain_tidak_bisa_mensimulasikan_pembayaran(): void
    {
        config(['midtrans.fake' => true, 'midtrans.server_key' => null, 'midtrans.client_key' => null]);

        $order = $this->buatPesanan();

        $this->actingAs(User::factory()->create())
            ->post(route('checkout.simulate', $order))
            ->assertNotFound();

        $this->assertSame(Order::PAYMENT_PENDING, $order->payment()->firstOrFail()->status);
    }

    private function useRealMode(): void
    {
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

        return Order::query()->latest('id')->firstOrFail();
    }
}

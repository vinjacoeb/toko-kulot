<?php

namespace Tests\Feature\Checkout;

use App\Exceptions\CheckoutException;
use App\Models\Category;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\User;
use App\Services\Midtrans\MidtransApi;
use App\Services\MidtransService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Tests\Support\FakeMidtransApi;
use Tests\TestCase;

/**
 * Regresi kartu `t_2f443b75` + `t_56062a5c`: QRIS gagal dibuat / pesan salah.
 *
 * `other_qris` BUKAN acquirer Core API — itu metode Snap; dikirim sebagai
 * `qris.acquirer`, Midtrans menjawab **413 "Payload format is not supported"**
 * (docs/review-4.md §2 F2). Acquirer yang sah hanya `gopay` dan
 * `airpay shopee`. Kontrak yang dijaga di sini:
 * - kanal QRIS hanya dipilih lewat `qris.acquirer`; `enabled_payments` TIDAK
 *   PERNAH dikirim (kontrak §7.6/§7.7 bentuknya tetap);
 * - nilai config lama `other_qris` dipetakan ke acquirer sah `airpay shopee`;
 * - kegagalan 402 diulang SEKALI dengan acquirer sah satunya, pesanan tetap jadi;
 * - bila percobaan pertama 402, pesan akhir tetap pesan aktivasi kanal walau
 *   cadangan gagal dengan galat lain (mis. 413);
 * - kedua acquirer 402 → pesan yang menyebut aktivasi kanal, tanpa pesanan/stok
 *   setengah jadi;
 * - kegagalan non-402 tidak diulang (tidak ada risiko tagihan ganda).
 */
class QrisAcquirerFallbackTest extends TestCase
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
            'midtrans.qris_acquirer' => 'gopay',
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

    /**
     * Kegagalan seperti yang dibawa SDK: HTTP 402 dari Midtrans dibungkus
     * `CheckoutException` (pesan siap tampil) dengan sebab asli di `previous`.
     */
    private function kanalBelumAktif(): CheckoutException
    {
        return new CheckoutException(
            'Gagal membuat pembayaran QRIS. Coba lagi.',
            0,
            new RuntimeException(
                'Midtrans API is returning API error. HTTP status code: 402 API response: '
                .'{"status_code":"402","status_message":"Payment channel is not activated."}',
                402,
            ),
        );
    }

    /**
     * HTTP 413 yang dijawab Midtrans saat `qris.acquirer` bukan acquirer Core
     * API (mis. `other_qris`) — docs/review-4.md §2 F2.
     */
    private function payloadTidakDidukung(): CheckoutException
    {
        return new CheckoutException(
            'Gagal membuat pembayaran QRIS. Coba lagi.',
            0,
            new RuntimeException(
                'Midtrans API is returning API error. HTTP status code: 413 API response: '
                .'{"status_code":"413","status_message":"Payload format is not supported."}',
                413,
            ),
        );
    }

    public function test_payload_charge_memakai_qris_acquirer_tanpa_enabled_payments(): void
    {
        $this->isiKeranjang();

        $response = $this->post('/checkout', $this->dataCheckout());

        $order = Order::query()->firstOrFail();
        $response->assertRedirect(route('checkout.pay', $order));

        $this->assertSame(1, $this->api->chargeCount);
        $params = $this->api->chargeAttempts[0];
        $this->assertSame('qris', $params['payment_type']);
        $this->assertSame(['acquirer' => 'gopay'], $params['qris']);
        $this->assertArrayNotHasKey('enabled_payments', $params, 'Parameter Snap tidak boleh ikut di Core API.');

        $payment = Payment::query()->firstOrFail();
        $this->assertSame('pending', $payment->status);
        $this->assertSame((int) $order->total, (int) $payment->gross_amount);
        $this->assertNotEmpty($payment->qr_string);
    }

    public function test_402_diulang_dengan_acquirer_sah_lainnya_dan_pesanan_tetap_dibuat(): void
    {
        $this->api->chargeFailures = [$this->kanalBelumAktif()];

        $this->isiKeranjang();

        $response = $this->post('/checkout', $this->dataCheckout());

        $order = Order::query()->firstOrFail();
        $response->assertRedirect(route('checkout.pay', $order));

        $this->assertSame(2, $this->api->chargeCount);
        $this->assertSame('gopay', $this->api->chargeAttempts[0]['qris']['acquirer']);
        $this->assertSame('airpay shopee', $this->api->chargeAttempts[1]['qris']['acquirer']);

        foreach ($this->api->chargeAttempts as $index => $params) {
            $this->assertArrayNotHasKey(
                'enabled_payments',
                $params,
                'Percobaan ke-'.($index + 1).' tidak boleh mengirim parameter Snap.',
            );
            $this->assertNotSame(
                'other_qris',
                $params['qris']['acquirer'],
                '`other_qris` bukan acquirer Core API; hanya alias config lama.',
            );
        }

        $this->assertSame(
            $this->api->chargeAttempts[0]['transaction_details']['order_id'],
            $this->api->chargeAttempts[1]['transaction_details']['order_id'],
            'Percobaan ulang memakai order_id yang sama karena transaksi 402 tidak pernah dibuat.',
        );

        $this->assertSame(1, Payment::query()->count());
        $payment = Payment::query()->firstOrFail();
        $this->assertSame('pending', $payment->status);
        $this->assertNotEmpty($payment->qr_string);
        $this->assertSame(0, (int) Order::query()->where('status', 'batal')->count());
    }

    public function test_kedua_kanal_belum_aktif_memberi_pesan_aktivasi_tanpa_pesanan_setengah_jadi(): void
    {
        $this->api->chargeFailures = [$this->kanalBelumAktif(), $this->kanalBelumAktif()];

        $this->isiKeranjang();

        $this->post('/checkout', $this->dataCheckout())
            ->assertRedirect(route('checkout.index'))
            ->assertSessionHas('error', MidtransService::CHANNEL_INACTIVE_MESSAGE);

        $this->assertSame(2, $this->api->chargeCount);
        $this->assertSame(0, Order::query()->count());
        $this->assertSame(0, Payment::query()->count());
        $this->assertSame(10, (int) ProductVariant::query()->findOrFail($this->variantId)->stock, 'Stok tidak boleh terpotong.');
        $this->assertNotSame('Gagal membuat pembayaran QRIS. Coba lagi.', MidtransService::CHANNEL_INACTIVE_MESSAGE);
    }

    public function test_402_lalu_cadangan_gagal_galat_lain_tetap_memberi_pesan_kanal_tidak_aktif(): void
    {
        $this->api->chargeFailures = [$this->kanalBelumAktif(), $this->payloadTidakDidukung()];

        $this->isiKeranjang();

        $this->post('/checkout', $this->dataCheckout())
            ->assertRedirect(route('checkout.index'))
            ->assertSessionHas('error', MidtransService::CHANNEL_INACTIVE_MESSAGE);

        $this->assertSame(2, $this->api->chargeCount);
        $this->assertSame('gopay', $this->api->chargeAttempts[0]['qris']['acquirer']);
        $this->assertSame('airpay shopee', $this->api->chargeAttempts[1]['qris']['acquirer']);
        $this->assertSame(0, Order::query()->count(), 'Pesanan tidak boleh setengah jadi.');
        $this->assertSame(0, Payment::query()->count());
        $this->assertSame(10, (int) ProductVariant::query()->findOrFail($this->variantId)->stock, 'Stok tidak boleh terpotong.');
    }

    public function test_gagal_selain_kanal_belum_aktif_tidak_diulang(): void
    {
        $this->api->chargeException = RuntimeException::class;

        $this->isiKeranjang();

        $this->post('/checkout', $this->dataCheckout())
            ->assertRedirect(route('checkout.index'))
            ->assertSessionHas('error', 'Gagal membuat pembayaran QRIS. Coba lagi.');

        $this->assertSame(1, $this->api->chargeCount, 'Kegagalan jaringan tidak boleh diulang (risiko tagihan ganda).');
        $this->assertSame(0, Order::query()->count());
    }

    public function test_acquirer_bisa_dipilih_lewat_config(): void
    {
        config(['midtrans.qris_acquirer' => 'airpay shopee']);

        $this->isiKeranjang();

        $this->post('/checkout', $this->dataCheckout());

        $params = $this->api->chargeAttempts[0];
        $this->assertSame('airpay shopee', $params['qris']['acquirer']);
        $this->assertArrayNotHasKey('enabled_payments', $params);
    }

    public function test_nilai_config_lama_other_qris_dipetakan_ke_acquirer_sah(): void
    {
        config(['midtrans.qris_acquirer' => 'other_qris']);

        $this->isiKeranjang();

        $this->post('/checkout', $this->dataCheckout());

        $params = $this->api->chargeAttempts[0];
        $this->assertSame('airpay shopee', $params['qris']['acquirer'], 'Alias lama tidak boleh dikirim apa adanya (413).');
        $this->assertArrayNotHasKey('enabled_payments', $params);
    }
}

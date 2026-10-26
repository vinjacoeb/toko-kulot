<?php

namespace Tests\Feature\Checkout;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\User;
use App\Services\Midtrans\MidtransApi;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\FakeMidtransApi;
use Tests\TestCase;

/**
 * Midtrans Core API 8 kanal (PRD-v1.2 §2, kontrak §7.7/§7.7a/§7.8a).
 *
 * Checkout tidak memanggil Midtrans; charge baru dibuat saat pembeli memilih
 * kanal di halaman bayar. Kanal sama yang belum kedaluwarsa tidak di-charge
 * ulang; ganti kanal memakai `order_id_midtrans` baru (suffix `-2`).
 */
class MidtransCoreTest extends TestCase
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
            'midtrans.expiry_va_minutes' => 60,
            'midtrans.qris_acquirer' => 'gopay',
            'biteship.key' => null,
        ]);

        $this->api = new FakeMidtransApi;
        $this->app->instance(MidtransApi::class, $this->api);

        $this->user = User::factory()->create();
        $this->actingAs($this->user);

        Setting::create(['key' => 'shipping_cost_default', 'value' => '20000', 'group' => 'pengiriman', 'type' => 'number']);
        Setting::create(['key' => 'store_name', 'value' => '[CONTOH] Toko Daster Kulot', 'group' => 'umum', 'type' => 'text']);

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

    public function test_checkout_tidak_memanggil_midtrans_dan_membuat_tagihan_pending(): void
    {
        $order = $this->buatPesanan();
        $payment = $order->payment()->firstOrFail();

        $this->assertSame(0, $this->api->chargeCount, 'Checkout tidak boleh memanggil Midtrans.');
        $this->assertSame(Order::PAYMENT_PENDING, $payment->status);
        $this->assertNull($payment->payment_type);
        $this->assertNull($payment->order_id_midtrans);
        $this->assertNull($payment->expires_at);
        $this->assertSame((int) $order->total, (int) $payment->gross_amount);
    }

    public function test_halaman_bayar_menampilkan_8_kanal_dan_hanya_untuk_pemilik(): void
    {
        $order = $this->buatPesanan();

        $this->get(route('checkout.pay', $order))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/CheckoutPay', false)
                ->where('pembayaran.metode', null)
                ->where('pembayaran.instruksi', null)
                ->has('pembayaran.kanal', 8)
                ->where('pembayaran.kanal.0.id', 'qris')
                ->where('pembayaran.kanal.5.id', 'mandiri_bill'));

        $this->actingAs(User::factory()->create())
            ->get(route('checkout.pay', $order))
            ->assertNotFound();
    }

    public function test_pilih_qris_membuat_charge_expiry_5_menit_dan_instruksi_qr(): void
    {
        $order = $this->buatPesanan();

        $this->post(route('checkout.method', $order), ['metode' => 'qris'])
            ->assertRedirect(route('checkout.pay', $order))
            ->assertSessionMissing('error');

        $payment = $order->payment()->firstOrFail();

        $this->assertSame(1, $this->api->chargeCount);
        $this->assertSame('qris', $payment->payment_type);
        $this->assertSame($order->code, $payment->order_id_midtrans);

        $params = $this->api->charges[0];
        $this->assertSame('qris', $params['payment_type']);
        $this->assertSame('gopay', $params['qris']['acquirer']);
        $this->assertSame(5, $params['custom_expiry']['expiry_duration']);
        $this->assertSame('minute', $params['custom_expiry']['unit']);
        $this->assertSame((int) $order->total, $params['transaction_details']['gross_amount']);

        $this->assertNotNull($payment->qr_string);
        $this->assertNotNull($payment->qris_url);
        $this->assertNotNull($payment->expires_at);
        $this->assertTrue(
            $payment->expires_at->between(now()->addMinutes(4), now()->addMinutes(6)),
            'QRIS harus kedaluwarsa sekitar 5 menit.',
        );

        $this->get(route('checkout.pay', $order))
            ->assertInertia(fn ($page) => $page
                ->where('pembayaran.metode.id', 'qris')
                ->where('pembayaran.instruksi.jenis', 'qris')
                ->where('pembayaran.instruksi.qr_string', $payment->qr_string));
    }

    public function test_pilih_kanal_sama_sebelum_kedaluwarsa_tidak_charge_ulang(): void
    {
        $order = $this->buatPesanan();

        $this->post(route('checkout.method', $order), ['metode' => 'bca_va']);
        $this->post(route('checkout.method', $order), ['metode' => 'bca_va']);

        $this->assertSame(1, $this->api->chargeCount);
        $this->assertSame($order->code, $order->payment()->firstOrFail()->order_id_midtrans);
    }

    public function test_ganti_kanal_membuat_order_id_baru_dan_expiry_60_menit(): void
    {
        $order = $this->buatPesanan();

        $this->post(route('checkout.method', $order), ['metode' => 'qris']);
        $this->post(route('checkout.method', $order), ['metode' => 'bca_va']);

        $payment = $order->payment()->firstOrFail();

        $this->assertSame(2, $this->api->chargeCount);
        $this->assertSame('bca_va', $payment->payment_type);
        $this->assertSame($order->code.'-2', $payment->order_id_midtrans);
        $this->assertSame(60, $this->api->charges[1]['custom_expiry']['expiry_duration']);
        $this->assertSame('bank_transfer', $this->api->charges[1]['payment_type']);
        $this->assertSame('bca', $this->api->charges[1]['bank_transfer']['bank']);
        $this->assertNull($payment->qr_string, 'Ganti kanal harus membuang QR lama.');

        $this->get(route('checkout.pay', $order))
            ->assertInertia(fn ($page) => $page
                ->where('pembayaran.metode.id', 'bca_va')
                ->where('pembayaran.instruksi.jenis', 'va')
                ->where('pembayaran.instruksi.bank', 'BCA'));

        $this->assertNotNull($payment->expires_at);
        $this->assertTrue($payment->expires_at->between(now()->addMinutes(58), now()->addMinutes(61)));
    }

    public function test_pilih_mandiri_bill_dan_gerai_memakai_instruksi_berbeda(): void
    {
        $order = $this->buatPesanan();

        $this->post(route('checkout.method', $order), ['metode' => 'mandiri_bill']);
        $this->get(route('checkout.pay', $order))
            ->assertInertia(fn ($page) => $page
                ->where('pembayaran.instruksi.jenis', 'bill')
                ->where('pembayaran.instruksi.biller_code', '7777'));

        $this->post(route('checkout.method', $order), ['metode' => 'alfamart']);
        $this->get(route('checkout.pay', $order))
            ->assertInertia(fn ($page) => $page
                ->where('pembayaran.instruksi.jenis', 'gerai')
                ->where('pembayaran.instruksi.store', 'Alfamart'));
    }

    public function test_kanal_tidak_dikenal_ditolak_tanpa_charge(): void
    {
        $order = $this->buatPesanan();

        $this->post(route('checkout.method', $order), ['metode' => 'dana'])
            ->assertSessionHas('error');

        $this->assertSame(0, $this->api->chargeCount);
        $this->assertNull($order->payment()->firstOrFail()->payment_type);
    }

    public function test_gagal_charge_memberi_pesan_dan_tagihan_tetap_pending(): void
    {
        $order = $this->buatPesanan();
        $this->api->chargeException = \RuntimeException::class;

        $this->post(route('checkout.method', $order), ['metode' => 'qris'])
            ->assertRedirect(route('checkout.pay', $order))
            ->assertSessionHas('error', 'Gagal membuat pembayaran. Coba lagi.');

        $payment = $order->payment()->firstOrFail();

        $this->assertSame(Order::PAYMENT_PENDING, $payment->status);
        $this->assertNull($payment->payment_type);
        $this->assertNull($payment->order_id_midtrans);
    }

    public function test_halaman_selesai_mengalihkan_yang_tidak_dikenal_ke_beranda(): void
    {
        $this->get(route('midtrans.selesai'))->assertRedirect('/')->assertSessionHas('error', 'Pembayaran tidak dikenal.');
        $this->get(route('midtrans.selesai', ['order_id' => 'TIDAK-ADA']))->assertRedirect('/');
    }

    public function test_halaman_selesai_mengalihkan_pemilik_ke_halaman_bayar(): void
    {
        $order = $this->buatPesanan();
        $this->post(route('checkout.method', $order), ['metode' => 'qris']);
        $payment = $order->payment()->firstOrFail();

        $this->get(route('midtrans.selesai', ['order_id' => $payment->order_id_midtrans]))
            ->assertRedirect(route('checkout.pay', $order));

        $this->actingAs(User::factory()->create())
            ->get(route('midtrans.selesai', ['order_id' => $payment->order_id_midtrans]))
            ->assertRedirect('/');
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

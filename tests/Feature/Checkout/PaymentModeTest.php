<?php

namespace Tests\Feature\Checkout;

use App\Models\Admin;
use App\Models\Category;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\User;
use App\Services\Midtrans\MidtransApi;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Tests\Support\FakeMidtransApi;
use Tests\TestCase;

/**
 * Mode uji Midtrans terlihat di UI + tagihan mode uji dibuat ulang (kartu t_9f4b6aee,
 * temuan F-2 `docs/review.md`; kontrak props §7.5, §7.7, §7.8, §10.7).
 *
 * Semua panggilan jaringan Midtrans diganti `FakeMidtransApi`, jadi test tidak
 * butuh kredensial dan tidak pernah menghubungi Midtrans.
 */
class PaymentModeTest extends TestCase
{
    use RefreshDatabase;

    private FakeMidtransApi $api;

    private int $productId = 0;

    private int $variantId = 0;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->api = new FakeMidtransApi;
        $this->app->instance(MidtransApi::class, $this->api);

        $this->user = User::factory()->create();
        $this->actingAs($this->user);

        $this->modeUji();

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

    private function modeUji(): void
    {
        config([
            'midtrans.fake' => true,
            'midtrans.server_key' => 'test-server-key',
            'midtrans.client_key' => 'test-client-key',
            'midtrans.is_production' => false,
            'midtrans.expiry_minutes' => 5,
        ]);
    }

    private function modeAsli(): void
    {
        config([
            'midtrans.fake' => false,
            'midtrans.server_key' => 'test-server-key',
            'midtrans.client_key' => 'test-client-key',
        ]);
    }

    private function isiKeranjang(int $qty = 1): void
    {
        $this->post('/keranjang', [
            'product_id' => $this->productId,
            'variant_id' => $this->variantId,
            'qty' => $qty,
        ])->assertSessionHas('success');
    }

    private function buatPesananModeUji(): Order
    {
        $this->isiKeranjang(1);

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

    public function test_halaman_checkout_menampilkan_mode_uji(): void
    {
        $this->isiKeranjang(1);

        $this->get('/checkout')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Checkout', false)
                ->where('midtrans.mode', 'uji')
                ->where('midtrans.fake', true)
                ->where('midtrans.alasan_kode', 'fake_aktif')
            );
    }

    public function test_mode_uji_terlihat_pada_props_halaman_bayar(): void
    {
        $order = $this->buatPesananModeUji();

        $this->get('/checkout/'.$order->id.'/bayar')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/CheckoutPay', false)
                ->where('midtrans.mode', 'uji')
                ->where('midtrans.fake', true)
                ->where('midtrans.alasan_kode', 'fake_aktif')
                ->where('midtrans.alasan', 'MODE UJI aktif karena MIDTRANS_FAKE=true di .env: QRIS dibuat lokal (tanpa Midtrans) sehingga tidak bisa ditransfer.')
                ->where('midtrans.langkah_perbaikan.0', 'Ubah MIDTRANS_FAKE=false pada berkas .env.')
                ->where('midtrans.server_key_terisi', true)
                ->where('midtrans.sumber_kredensial', '.env (MIDTRANS_*)')
                ->where('midtrans.client_key', null)
                ->where('pembayaran.fake', true)
                ->where('pembayaran.galat', null)
                ->where('pembayaran.status', Order::PAYMENT_PENDING)
            );

        $this->assertSame(0, $this->api->chargeCount, 'Mode uji tidak boleh memanggil Midtrans.');
    }

    public function test_tagihan_mode_uji_dibuat_ulang_ke_baris_yang_sama(): void
    {
        $order = $this->buatPesananModeUji();
        $payment = Payment::query()->where('order_id', $order->id)->firstOrFail();
        $oldQrString = (string) $payment->qr_string;

        $this->assertStringStartsWith('fake-', (string) $payment->transaction_id);
        $this->assertSame('fake', $payment->payload['mode'] ?? null);

        $this->modeAsli();

        $this->get('/checkout/'.$order->id.'/bayar')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/CheckoutPay', false)
                ->where('midtrans.mode', 'asli')
                ->where('midtrans.alasan_kode', null)
                ->where('pembayaran.fake', false)
                ->where('pembayaran.galat', null)
                ->where('pembayaran.status', Order::PAYMENT_PENDING)
                ->where('pembayaran.qr_string', fn ($value) => is_string($value) && $value !== '' && $value !== $oldQrString)
            );

        $this->assertSame(1, $this->api->chargeCount);
        $midtransOrderId = (string) ($this->api->charges[0]['transaction_details']['order_id'] ?? '');
        $this->assertStringStartsWith($order->code.'-', $midtransOrderId);
        $this->assertMatchesRegularExpression('/^TK-\d{8}-\d{4}-[A-F0-9]{6}$/', $midtransOrderId);
        $this->assertSame((int) $order->total, $this->api->charges[0]['transaction_details']['gross_amount'] ?? null);
        $this->assertSame('qris', $this->api->charges[0]['payment_type'] ?? null);

        // Satu tagihan per pesanan (kontrak §7.5): baris lama dipakai ulang.
        $this->assertSame(1, Payment::query()->where('order_id', $order->id)->count());
        $this->assertSame(1, Payment::query()->count());

        $fresh = $payment->refresh();
        $this->assertStringStartsWith('trx-', (string) $fresh->transaction_id);
        $this->assertNotSame($oldQrString, (string) $fresh->qr_string);
        $this->assertNotEmpty($fresh->qr_string);
        $this->assertNotNull($fresh->qris_url);
        $this->assertNotNull($fresh->expires_at);
        $this->assertSame($midtransOrderId, (string) $fresh->order_id_midtrans);
    }

    public function test_pembuatan_ulang_gagal_menampilkan_galat_dan_tidak_mengubah_tagihan(): void
    {
        $order = $this->buatPesananModeUji();
        $payment = Payment::query()->where('order_id', $order->id)->firstOrFail();
        $oldQrString = (string) $payment->qr_string;

        $this->api->chargeException = RuntimeException::class;
        $this->modeAsli();

        $this->get('/checkout/'.$order->id.'/bayar')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/CheckoutPay', false)
                ->where('pembayaran.galat', 'Gagal membuat pembayaran QRIS. Coba lagi.')
                ->where('pembayaran.fake', true)
            );

        $this->assertSame(1, $this->api->chargeCount);

        $fresh = $payment->refresh();
        $this->assertStringStartsWith('fake-', (string) $fresh->transaction_id);
        $this->assertSame('fake', $fresh->payload['mode'] ?? null);
        $this->assertSame($oldQrString, (string) $fresh->qr_string);
        $this->assertSame(Order::PAYMENT_PENDING, $fresh->status);
    }

    public function test_status_membuat_ulang_tagihan_lalu_menanyakan_midtrans(): void
    {
        $order = $this->buatPesananModeUji();

        $this->modeAsli();
        // order_id Midtrans kini bersufiks (tidak bisa ditebak test), jadi pakai status bawaan.
        $this->api->defaultTransactionStatus = 'settlement';

        $this->get('/checkout/'.$order->id.'/status')
            ->assertOk()
            ->assertJson(['status' => Order::PAYMENT_SETTLEMENT]);

        $this->assertSame(1, $this->api->chargeCount, 'Tagihan mode uji dibuat ulang lebih dulu.');
        $this->assertSame(1, $this->api->statusCount);
        $this->assertSame(1, Payment::query()->where('order_id', $order->id)->count());

        $order->refresh();

        $this->assertSame(Order::PAYMENT_SETTLEMENT, $order->payment_status);
        $this->assertSame(Order::STATUS_PAID, $order->status);
        $this->assertNotNull($order->payment?->paid_at);
    }

    public function test_status_mode_uji_tidak_menghubungi_midtrans(): void
    {
        $order = $this->buatPesananModeUji();

        $this->get('/checkout/'.$order->id.'/status')
            ->assertOk()
            ->assertJson(['status' => Order::PAYMENT_PENDING]);

        $this->assertSame(0, $this->api->chargeCount);
        $this->assertSame(0, $this->api->statusCount);
    }

    public function test_tab_pembayaran_admin_menjelaskan_mode_uji(): void
    {
        $this->actingAs(Admin::factory()->create(), 'admin');

        $this->get(route('admin.settings.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Settings/Index', false)
                ->where('midtrans.mode', 'uji')
                ->where('midtrans.alasan_kode', 'fake_aktif')
                ->where('midtrans.alasan', 'MODE UJI aktif karena MIDTRANS_FAKE=true di .env: QRIS dibuat lokal (tanpa Midtrans) sehingga tidak bisa ditransfer.')
                ->where('midtrans.catatan', 'Kredensial efektif dibaca dari .env (MIDTRANS_*); kolom Midtrans pada tab Pembayaran admin belum dipakai jalur pembayaran ini.')
                ->where('midtrans.sumber_kredensial', '.env (MIDTRANS_*)')
            );
    }
}

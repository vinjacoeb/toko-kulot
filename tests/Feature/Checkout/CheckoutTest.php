<?php

namespace Tests\Feature\Checkout;

use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Checkout + pembayaran QRIS (PRD §5.1 langkah 3–7, §8).
 * Mode `fake` dipakai agar tidak ada panggilan jaringan ke Midtrans.
 * Alur dijalankan sebagai pembeli login (identitas keranjang stabil di test).
 */
class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    private int $productId = 0;

    private int $variantId = 0;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->actingAs($this->user);

        config([
            'midtrans.fake' => true,
            'midtrans.server_key' => 'test-server-key',
            'midtrans.expiry_minutes' => 15,
        ]);

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

    public function test_checkout_membuat_pesanan_memotong_stok_dan_tagihan_qris(): void
    {
        $this->isiKeranjang(2);

        $response = $this->post('/checkout', $this->dataCheckout());

        $order = Order::query()->firstOrFail();

        $response->assertRedirect(route('checkout.pay', $order));
        $response->assertSessionHas('success');

        $this->assertSame(Order::STATUS_PENDING, $order->status);
        $this->assertSame(Order::PAYMENT_PENDING, $order->payment_status);
        $this->assertSame(170000, (int) $order->subtotal);
        $this->assertSame(20000, (int) $order->shipping_cost);
        $this->assertSame(190000, (int) $order->total);
        $this->assertMatchesRegularExpression('/^TK-\d{8}-\d{4}$/', $order->code);

        $this->assertDatabaseCount('order_items', 1);
        $this->assertDatabaseHas('order_items', [
            'order_id' => $order->id,
            'product_name' => '[CONTOH] Daster Kulot Premium',
            'variant_label' => 'L / Merah',
            'qty' => 2,
            'unit_price' => 85000,
            'line_total' => 170000,
        ]);

        $this->assertSame(8, (int) ProductVariant::query()->findOrFail($this->variantId)->stock);
        $this->assertDatabaseHas('stock_movements', [
            'product_variant_id' => $this->variantId,
            'type' => StockMovement::TYPE_SALE,
            'qty' => 2,
        ]);

        $payment = Payment::query()->where('order_id', $order->id)->firstOrFail();
        $this->assertSame(Order::PAYMENT_PENDING, $payment->status);
        $this->assertSame(190000, (int) $payment->gross_amount);
        $this->assertNotEmpty($payment->qr_string);
        $this->assertStringStartsWith('000201', $payment->qr_string);
        $this->assertNotNull($payment->expires_at);

        $this->assertDatabaseCount('cart_items', 0);
        $this->assertSame(0, session('cart_count'));
    }

    public function test_checkout_dengan_keranjang_kosong_kembali_ke_keranjang(): void
    {
        $this->post('/checkout', $this->dataCheckout())
            ->assertRedirect(route('cart.index'))
            ->assertSessionHas('error', 'Keranjang masih kosong.');

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_checkout_menolak_stok_yang_sudah_habis(): void
    {
        $this->isiKeranjang(2);

        ProductVariant::query()->whereKey($this->variantId)->update(['stock' => 1]);

        $this->post('/checkout', $this->dataCheckout())
            ->assertRedirect(route('checkout.index'))
            ->assertSessionHas('error');

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_items', 0);
        $this->assertSame(1, (int) ProductVariant::query()->findOrFail($this->variantId)->stock);
    }

    public function test_validasi_formulir_checkout_mengembalikan_galat(): void
    {
        $this->isiKeranjang(1);

        $this->post('/checkout', [
            'customer_name' => 'A',
            'customer_phone' => '12345',
            'customer_address' => 'pendek',
            'customer_city' => 'X',
        ])->assertSessionHasErrors([
            'customer_name',
            'customer_phone',
            'customer_email',
            'customer_address',
            'customer_city',
            'customer_postal_code',
        ]);

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_notifikasi_settlement_menandai_pesanan_dibayar(): void
    {
        $this->isiKeranjang(2);
        $this->post('/checkout', $this->dataCheckout());
        $order = Order::query()->firstOrFail();

        $this->kirimNotifikasi($order, 'settlement', '200')
            ->assertOk()
            ->assertJson(['message' => 'ok']);

        $order->refresh();
        $payment = $order->payment()->firstOrFail();

        $this->assertSame(Order::PAYMENT_SETTLEMENT, $payment->status);
        $this->assertNotNull($payment->paid_at);
        $this->assertSame(Order::STATUS_PAID, $order->status);
        $this->assertNotNull($order->paid_at);

        // Stok tidak kembali setelah settlement.
        $this->assertSame(8, (int) ProductVariant::query()->findOrFail($this->variantId)->stock);
    }

    public function test_notifikasi_settlement_idempoten(): void
    {
        $this->isiKeranjang(1);
        $this->post('/checkout', $this->dataCheckout());
        $order = Order::query()->firstOrFail();

        $this->kirimNotifikasi($order, 'settlement', '200')->assertOk();
        $this->kirimNotifikasi($order, 'settlement', '200')->assertOk();

        $this->assertSame(1, Payment::query()->where('order_id', $order->id)->count());
        $this->assertSame(9, (int) ProductVariant::query()->findOrFail($this->variantId)->stock);
    }

    public function test_notifikasi_expire_mengembalikan_stok_dan_membatalkan_pesanan(): void
    {
        $this->isiKeranjang(2);
        $this->post('/checkout', $this->dataCheckout());
        $order = Order::query()->firstOrFail();

        $this->kirimNotifikasi($order, 'expire', '202')->assertOk();

        $order->refresh();

        $this->assertSame(Order::PAYMENT_EXPIRE, $order->payment_status);
        $this->assertSame(Order::STATUS_CANCELLED, $order->status);
        $this->assertSame(10, (int) ProductVariant::query()->findOrFail($this->variantId)->stock);
        $this->assertDatabaseHas('stock_movements', [
            'product_variant_id' => $this->variantId,
            'type' => StockMovement::TYPE_IN,
            'qty' => 2,
        ]);
    }

    public function test_notifikasi_dengan_signature_salah_ditolak(): void
    {
        $this->isiKeranjang(1);
        $this->post('/checkout', $this->dataCheckout());
        $order = Order::query()->firstOrFail();

        $this->postJson('/midtrans/notification', [
            'order_id' => $order->code,
            'status_code' => '200',
            'gross_amount' => (string) $order->total,
            'transaction_status' => 'settlement',
            'signature_key' => 'palsu',
        ])->assertStatus(403);

        $this->assertSame(Order::PAYMENT_PENDING, $order->refresh()->payment_status);
    }

    public function test_notifikasi_dengan_nominal_tidak_cocok_ditolak(): void
    {
        $this->isiKeranjang(1);
        $this->post('/checkout', $this->dataCheckout());
        $order = Order::query()->firstOrFail();

        $payload = [
            'order_id' => $order->code,
            'status_code' => '200',
            'gross_amount' => '1000',
            'transaction_status' => 'settlement',
        ];
        $payload['signature_key'] = $this->signature($payload);

        $this->postJson('/midtrans/notification', $payload)->assertStatus(422);

        $this->assertSame(Order::PAYMENT_PENDING, $order->refresh()->payment_status);
    }

    public function test_pesanan_orang_lain_tidak_bisa_dibuka(): void
    {
        $this->isiKeranjang(1);
        $this->post('/checkout', $this->dataCheckout());
        $order = Order::query()->firstOrFail();

        // Pembeli lain: bukan pemilik order (PRD §5.1 langkah 3, cegah IDOR).
        $this->actingAs(User::factory()->create());

        $this->get('/checkout/'.$order->id.'/bayar')->assertNotFound();
        $this->get('/checkout/'.$order->id.'/status')->assertNotFound();
        $this->get('/checkout/'.$order->id.'/selesai')->assertNotFound();
    }

    public function test_tamu_diarahkan_ke_login_sebelum_checkout(): void
    {
        $this->isiKeranjang(1);
        $this->app['auth']->forgetGuards();

        $this->get('/checkout')->assertRedirect(route('login'));
        $this->post('/checkout', $this->dataCheckout())->assertRedirect(route('login'));

        $this->assertSame(0, Order::query()->count());
    }

    public function test_halaman_bayar_menampilkan_qr_string_dan_batas_waktu(): void
    {
        $this->isiKeranjang(1);
        $this->post('/checkout', $this->dataCheckout());
        $order = Order::query()->firstOrFail();

        $response = $this->get('/checkout/'.$order->id.'/bayar');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/CheckoutPay', false)
            ->where('pesanan.code', $order->code)
            ->where('pesanan.total', (int) $order->total)
            ->where('pembayaran.method', 'qris')
            ->where('pembayaran.status', Order::PAYMENT_PENDING)
            ->where('midtrans.fake', true)
        );
    }

    public function test_halaman_selesai_menolak_pesanan_yang_belum_dibayar(): void
    {
        $this->isiKeranjang(1);
        $this->post('/checkout', $this->dataCheckout());
        $order = Order::query()->firstOrFail();

        $this->get('/checkout/'.$order->id.'/selesai')
            ->assertRedirect(route('checkout.pay', $order));
    }

    public function test_halaman_selesai_tampil_setelah_dibayar(): void
    {
        $this->isiKeranjang(1);
        $this->post('/checkout', $this->dataCheckout());
        $order = Order::query()->firstOrFail();

        $this->kirimNotifikasi($order, 'settlement', '200')->assertOk();

        $this->get('/checkout/'.$order->id.'/selesai')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/CheckoutSuccess', false)
                ->where('pesanan.payment_status', Order::PAYMENT_SETTLEMENT)
                ->where('ulasan.boleh', true)
                ->where('ulasan.sudah', [])
            );
    }

    private function kirimNotifikasi(Order $order, string $status, string $statusCode): \Illuminate\Testing\TestResponse
    {
        $payload = [
            'order_id' => $order->code,
            'status_code' => $statusCode,
            'gross_amount' => (string) $order->total,
            'transaction_status' => $status,
            'transaction_id' => 'trx-'.$order->code,
        ];
        $payload['signature_key'] = $this->signature($payload);

        return $this->postJson('/midtrans/notification', $payload);
    }

    /**
     * @param  array<string, string>  $payload
     */
    private function signature(array $payload): string
    {
        return hash(
            'sha512',
            $payload['order_id'].$payload['status_code'].$payload['gross_amount'].'test-server-key',
        );
    }
}

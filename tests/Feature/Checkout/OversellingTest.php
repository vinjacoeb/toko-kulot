<?php

namespace Tests\Feature\Checkout;

use App\Exceptions\CheckoutException;
use App\Models\Admin;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\StockMovement;
use App\Models\User;
use App\Services\BiteshipService;
use App\Services\CartService;
use App\Services\OrderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Dua pembeli memperebutkan stok terakhir (kartu t_36a48cac A).
 * Pembuatan pesanan mengunci varian dan memotong stok dalam satu transaksi,
 * jadi checkout kedua gagal dengan pesan jelas — bukan stok minus.
 */
class OversellingTest extends TestCase
{
    use RefreshDatabase;

    private ProductVariant $variant;

    private User $userA;

    private User $userB;

    protected function setUp(): void
    {
        parent::setUp();

        config(['biteship.key' => '']);

        Setting::create([
            'key' => 'shipping_cost_default',
            'value' => '20000',
            'group' => 'pengiriman',
            'type' => 'number',
        ]);

        $category = Category::create([
            'name' => '[CONTOH] Daster',
            'slug' => 'contoh-daster',
            'is_active' => true,
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => '[CONTOH] Daster Kulot Terakhir',
            'slug' => 'contoh-daster-kulot-terakhir',
            'base_price' => 85000,
            'is_active' => true,
        ]);

        $this->variant = ProductVariant::create([
            'product_id' => $product->id,
            'size' => 'L',
            'color' => 'Merah',
            'sku' => 'CONTOH-TERAKHIR',
            'price_delta' => 0,
            'stock' => 1,
            'is_active' => true,
        ]);

        $this->userA = User::factory()->create();
        $this->userB = User::factory()->create();
    }

    public function test_checkout_kedua_untuk_stok_terakhir_gagal_tanpa_stok_minus(): void
    {
        $cartA = $this->cartFor($this->userA);
        $cartB = $this->cartFor($this->userB);

        $order = $this->checkout($this->userA, $cartA);

        $this->assertSame(1, (int) $order->items()->count());
        $this->assertSame(0, (int) $this->variant->fresh()->stock);

        // Keranjang pembeli kedua melihat stok terkini: tidak tersedia.
        $ringkasanB = app(CartService::class)->summary($cartB);
        $this->assertFalse($ringkasanB['items'][0]['tersedia']);
        $this->assertSame(0, $ringkasanB['items'][0]['stock']);

        try {
            $this->checkout($this->userB, $cartB);
            $this->fail('Checkout kedua seharusnya ditolak.');
        } catch (CheckoutException $e) {
            $this->assertSame('Stok L / Merah tersisa 0. Perbarui keranjang.', $e->getMessage());
        }

        $this->assertSame(0, (int) $this->variant->fresh()->stock);
        $this->assertSame(1, Order::query()->count());
        $this->assertSame(1, StockMovement::query()->where('type', StockMovement::TYPE_SALE)->count());
    }

    public function test_ringkasan_checkout_dan_detail_admin_memuat_ongkir_asli(): void
    {
        $cart = $this->cartFor($this->userA);
        $this->actingAs($this->userA)
            ->get('/checkout')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/Checkout')
                ->where('ringkasan.subtotal', 85000)
                ->where('ringkasan.ongkir_asli', 20000)
                ->where('ringkasan.ongkir', 20000)
                ->where('ringkasan.ongkir_ditanggung_toko', 0)
                ->where('ringkasan.total', 105000)
                ->has('ringkasan.metode_bayar')
                ->has('ringkasan.ekspedisi'));

        $order = $this->checkout($this->userA, $cart);

        $this->actingAs(Admin::factory()->create(), 'admin')
            ->get(route('admin.orders.show', $order))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('pesanan.shipping_cost_original', 20000)
                ->where('pesanan.ringkasan.ongkir_asli', 20000)
                ->where('pesanan.ringkasan.ongkir', 20000)
                ->where('pesanan.ringkasan.ongkir_ditanggung_toko', 0)
                ->where('pesanan.ringkasan.total', 105000)
                ->where('pesanan.ringkasan.ekspedisi.tracking_number', null));
    }

    public function test_checkout_ringkasan_gratis_ongkir_tetap_kirim_tarif_asli(): void
    {
        Setting::create(['key' => 'free_shipping_enabled', 'value' => '1', 'group' => 'pengiriman', 'type' => 'boolean']);
        Setting::create(['key' => 'free_shipping_min', 'value' => '1000', 'group' => 'pengiriman', 'type' => 'number']);

        $this->cartFor($this->userA);

        $this->actingAs($this->userA)
            ->get('/checkout')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('ringkasan.ongkir_asli', 20000)
                ->where('ringkasan.ongkir', 0)
                ->where('ringkasan.ongkir_ditanggung_toko', 20000)
                ->where('ringkasan.total', 85000));
    }

    public function test_gratis_ongkir_menyimpan_tarif_asli_dan_selisih_ditanggung(): void
    {
        Setting::create(['key' => 'free_shipping_enabled', 'value' => '1', 'group' => 'pengiriman', 'type' => 'boolean']);
        Setting::create(['key' => 'free_shipping_min', 'value' => '1000', 'group' => 'pengiriman', 'type' => 'number']);

        $cart = $this->cartFor($this->userA);
        $opsi = app(BiteshipService::class)->rates('40111', [], 85000)['opsi'][0];

        $this->actingAs($this->userA);
        $order = app(OrderService::class)->createFromCart($cart, [
            'customer_name' => '[CONTOH] '.$this->userA->name,
            'customer_phone' => '081200000000',
            'customer_address' => '[CONTOH] Jalan Mawar 1',
            'customer_city' => 'Bandung',
            'customer_postal_code' => '40111',
            'shipping_courier' => $opsi['courier_code'],
            'shipping_service' => $opsi['service_code'],
        ]);

        $this->assertTrue((bool) $order->shipping_is_free);
        $this->assertSame(0, (int) $order->shipping_cost);
        $this->assertSame(20000, (int) $order->shipping_cost_original);

        $this->actingAs(Admin::factory()->create(), 'admin')
            ->get(route('admin.orders.show', $order))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('pesanan.ringkasan.ongkir_asli', 20000)
                ->where('pesanan.ringkasan.ongkir', 0)
                ->where('pesanan.ringkasan.ongkir_ditanggung_toko', 20000)
                ->where('pesanan.ringkasan.total', 85000));
    }

    private function cartFor(User $user): Cart
    {
        $cart = Cart::create(['user_id' => $user->id, 'expires_at' => now()->addDay()]);

        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $this->variant->product_id,
            'product_variant_id' => $this->variant->id,
            'qty' => 1,
        ]);

        return $cart;
    }

    private function checkout(User $user, Cart $cart): Order
    {
        $this->actingAs($user);

        return app(OrderService::class)->createFromCart($cart, [
            'customer_name' => '[CONTOH] '.$user->name,
            'customer_phone' => '081200000000',
            'customer_address' => '[CONTOH] Jalan Mawar 1',
            'customer_city' => 'Bandung',
            'customer_postal_code' => '40111',
        ]);
    }
}

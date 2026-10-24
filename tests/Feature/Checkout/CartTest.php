<?php

namespace Tests\Feature\Checkout;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Keranjang tamu & pembeli (PRD §5.1 langkah 2).
 *
 * Catatan: driver sesi `array` pada test tidak membawa cookie antar permintaan,
 * sehingga alur banyak-permintaan diuji sebagai pembeli login (identitas stabil
 * lewat `carts.user_id`). Alur tamu diuji dalam satu permintaan.
 */
class CartTest extends TestCase
{
    use RefreshDatabase;

    private int $productId = 0;

    private int $variantId = 0;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        // Ongkir mode uji agar ringkasan keranjang tidak memanggil Biteship.
        config(['biteship.key' => '']);

        $this->user = User::factory()->create();
        $this->actingAs($this->user);

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
            'name' => '[CONTOH] Daster Kulot Premium',
            'slug' => 'contoh-daster-kulot-premium',
            'base_price' => 85000,
            'wholesale_price' => 75000,
            'min_wholesale_qty' => 3,
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'size' => 'L',
            'color' => 'Merah',
            'sku' => 'CONTOH-L-MERAH',
            'price_delta' => 0,
            'stock' => 5,
            'is_active' => true,
        ]);

        $this->productId = (int) $product->id;
        $this->variantId = (int) $variant->id;
    }

    public function test_tamu_bisa_menambah_produk_ke_keranjang(): void
    {
        $this->app['auth']->forgetGuards();

        $response = $this->post('/keranjang', [
            'product_id' => $this->productId,
            'variant_id' => $this->variantId,
            'qty' => 2,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseCount('cart_items', 1);
        $this->assertDatabaseHas('cart_items', [
            'product_id' => $this->productId,
            'product_variant_id' => $this->variantId,
            'qty' => 2,
            'unit_price' => 85000,
        ]);

        $this->assertSame(2, session('cart_count'));
    }

    public function test_harga_grosir_dipakai_saat_qty_mencapai_minimum(): void
    {
        $this->post('/keranjang', [
            'product_id' => $this->productId,
            'variant_id' => $this->variantId,
            'qty' => 3,
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $this->productId,
            'qty' => 3,
            'unit_price' => 75000,
        ]);
    }

    public function test_qty_melebihi_stok_ditolak_dengan_pesan(): void
    {
        $response = $this->post('/keranjang', [
            'product_id' => $this->productId,
            'variant_id' => $this->variantId,
            'qty' => 6,
        ]);

        $response->assertSessionHas('error', 'Stok tersisa 5.');
        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_produk_tanpa_varian_dipilih_ditolak(): void
    {
        $response = $this->post('/keranjang', [
            'product_id' => $this->productId,
            'qty' => 1,
        ]);

        $response->assertSessionHas('error', 'Pilih ukuran/warna yang tersedia.');
        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_item_keranjang_milik_sesi_lain_tidak_bisa_diubah(): void
    {
        $cart = Cart::create([
            'user_id' => null,
            'session_id' => 'sesi-orang-lain',
            'expires_at' => now()->addDay(),
        ]);

        $item = CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $this->productId,
            'product_variant_id' => $this->variantId,
            'qty' => 1,
            'unit_price' => 85000,
        ]);

        $this->patch('/keranjang/'.$item->id, ['qty' => 2])->assertNotFound();
        $this->delete('/keranjang/'.$item->id)->assertNotFound();

        $this->assertDatabaseHas('cart_items', ['id' => $item->id, 'qty' => 1]);
    }

    public function test_qty_disesuaikan_bila_stok_menipis(): void
    {
        $this->post('/keranjang', [
            'product_id' => $this->productId,
            'variant_id' => $this->variantId,
            'qty' => 2,
        ]);

        $item = CartItem::query()->firstOrFail();

        ProductVariant::query()->whereKey($this->variantId)->update(['stock' => 1]);

        $response = $this->patch('/keranjang/'.$item->id, ['qty' => 5]);

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('cart_items', ['id' => $item->id, 'qty' => 1]);
    }

    public function test_item_dihapus_dari_keranjang(): void
    {
        $this->post('/keranjang', [
            'product_id' => $this->productId,
            'variant_id' => $this->variantId,
            'qty' => 1,
        ]);

        $item = CartItem::query()->firstOrFail();

        $this->delete('/keranjang/'.$item->id)->assertRedirect();

        $this->assertDatabaseCount('cart_items', 0);
        $this->assertSame(0, session('cart_count'));
    }
}

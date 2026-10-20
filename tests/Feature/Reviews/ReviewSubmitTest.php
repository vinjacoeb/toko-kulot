<?php

namespace Tests\Feature\Reviews;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Ulasan pasca checkout (PRD §7.3, kontrak props §9.1).
 *
 * Order dibuat langsung (bukan lewat alur checkout) supaya test fokus pada
 * aturan ulasan: pemilik order, status pembayaran, produk dalam order, unik.
 */
class ReviewSubmitTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Product $product;

    private ProductVariant $variant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $category = Category::create([
            'name' => '[CONTOH] Daster',
            'slug' => 'contoh-daster',
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'category_id' => $category->id,
            'name' => '[CONTOH] Daster Kulot Premium',
            'slug' => 'contoh-daster-kulot-premium',
            'base_price' => 85000,
            'is_active' => true,
        ]);

        $this->variant = ProductVariant::create([
            'product_id' => $this->product->id,
            'size' => 'L',
            'color' => 'Merah',
            'sku' => 'CONTOH-L-MERAH',
            'price_delta' => 0,
            'stock' => 10,
            'is_active' => true,
        ]);
    }

    private function buatOrder(
        string $status = Order::STATUS_PAID,
        string $paymentStatus = Order::PAYMENT_SETTLEMENT,
        ?User $pemilik = null,
        ?Product $produk = null,
    ): Order {
        $produk ??= $this->product;
        $pemilik ??= $this->user;

        $order = Order::create([
            'user_id' => $pemilik->id,
            'code' => 'TK-20261020-'.str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT),
            'status' => $status,
            'subtotal' => 85000,
            'shipping_cost' => 20000,
            'discount' => 0,
            'total' => 105000,
            'payment_method' => 'qris',
            'payment_status' => $paymentStatus,
            'customer_name' => 'Siti Aminah',
            'customer_phone' => '081234567890',
            'customer_email' => 'siti@example.test',
            'shipping_address' => 'Jl. Melati No. 12',
            'city' => 'Pekalongan',
            'postal_code' => '51111',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $produk->id,
            'product_variant_id' => $this->variant->id,
            'product_name' => $produk->name,
            'variant_label' => 'L / Merah',
            'qty' => 1,
            'unit_price' => 85000,
            'line_total' => 85000,
        ]);

        return $order;
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(int $rating = 5, string $comment = 'Bahan adem, jahitan rapi.'): array
    {
        return [
            'ulasan' => [
                [
                    'product_id' => $this->product->id,
                    'rating' => $rating,
                    'comment' => $comment,
                ],
            ],
        ];
    }

    public function test_ulasan_tersimpan_setelah_pembayaran_berhasil(): void
    {
        $order = $this->buatOrder();

        $this->actingAs($this->user)
            ->post(route('checkout.review', $order), $this->payload(5))
            ->assertRedirect(route('checkout.success', $order))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('reviews', [
            'order_id' => $order->id,
            'product_id' => $this->product->id,
            'user_id' => $this->user->id,
            'rating' => 5,
            'is_visible' => true,
        ]);

        $this->product->refresh();
        $this->assertSame(1, (int) $this->product->rating_count);
        $this->assertSame(5.0, (float) $this->product->rating_avg);
    }

    public function test_ulasan_ditolak_bila_pesanan_belum_dibayar(): void
    {
        $order = $this->buatOrder(Order::STATUS_PENDING, Order::PAYMENT_PENDING);

        $this->actingAs($this->user)
            ->post(route('checkout.review', $order), $this->payload())
            ->assertRedirect(route('checkout.success', $order))
            ->assertSessionHas('error', 'Ulasan bisa dikirim setelah pembayaran berhasil.');

        $this->assertDatabaseCount('reviews', 0);
    }

    public function test_pesanan_milik_pembeli_lain_tidak_bisa_dinilai(): void
    {
        $order = $this->buatOrder();

        $this->actingAs(User::factory()->create())
            ->post(route('checkout.review', $order), $this->payload())
            ->assertNotFound();

        $this->assertDatabaseCount('reviews', 0);
    }

    public function test_produk_di_luar_pesanan_ditolak(): void
    {
        $order = $this->buatOrder();

        $produkLain = Product::create([
            'category_id' => $this->product->category_id,
            'name' => '[CONTOH] Daster Lain',
            'slug' => 'contoh-daster-lain',
            'base_price' => 90000,
            'is_active' => true,
        ]);

        $this->actingAs($this->user)
            ->post(route('checkout.review', $order), [
                'ulasan' => [
                    ['product_id' => $produkLain->id, 'rating' => 4, 'comment' => 'Bukan pesanan saya.'],
                ],
            ])
            ->assertSessionHasErrors('ulasan.0.product_id');

        $this->assertDatabaseCount('reviews', 0);
    }

    public function test_ulasan_ganda_untuk_produk_yang_sama_ditolak(): void
    {
        $order = $this->buatOrder();

        $this->actingAs($this->user)->post(route('checkout.review', $order), $this->payload())->assertSessionHas('success');

        $this->actingAs($this->user)
            ->post(route('checkout.review', $order), $this->payload(3))
            ->assertSessionHasErrors('ulasan.0.product_id');

        $this->assertSame(1, \App\Models\Review::query()->where('order_id', $order->id)->count());
    }

    public function test_rating_harus_antara_satu_sampai_lima(): void
    {
        $order = $this->buatOrder();

        $this->actingAs($this->user)
            ->post(route('checkout.review', $order), $this->payload(9))
            ->assertSessionHasErrors('ulasan.0.rating');

        $this->assertDatabaseCount('reviews', 0);
    }

    public function test_tamu_diarahkan_ke_login(): void
    {
        $order = $this->buatOrder();

        $this->app['auth']->forgetGuards();

        $this->post(route('checkout.review', $order), $this->payload())
            ->assertRedirect(route('login'));

        $this->assertDatabaseCount('reviews', 0);
    }
}

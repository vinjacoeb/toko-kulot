<?php

namespace Tests\Feature\Admin;

use App\Models\Admin;
use App\Models\Category;
use App\Models\ContactMessage;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Panel admin: pesan masuk + moderasi ulasan (kontrak props §10.1–§10.6).
 */
class AdminInboxTest extends TestCase
{
    use RefreshDatabase;

    private Admin $admin;

    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = Admin::factory()->create();
        $this->actingAs($this->admin, 'admin');

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
    }

    private function buatPesan(bool $dibaca = false): ContactMessage
    {
        return ContactMessage::query()->create([
            'name' => 'Rina',
            'email' => 'rina@example.test',
            'phone' => '081298765432',
            'subject' => 'Tanya ukuran',
            'message' => 'Apakah tersedia ukuran XXL?',
            'is_read' => $dibaca,
        ]);
    }

    private function buatUlasan(int $rating = 4): Review
    {
        $user = User::factory()->create();

        $order = Order::create([
            'user_id' => $user->id,
            'code' => 'TK-20261020-0001',
            'status' => Order::STATUS_PAID,
            'subtotal' => 85000,
            'shipping_cost' => 20000,
            'discount' => 0,
            'total' => 105000,
            'payment_method' => 'qris',
            'payment_status' => Order::PAYMENT_SETTLEMENT,
            'customer_name' => 'Siti Aminah',
            'customer_phone' => '081234567890',
            'shipping_address' => 'Jl. Melati No. 12',
            'city' => 'Pekalongan',
            'postal_code' => '51111',
        ]);

        $variant = ProductVariant::create([
            'product_id' => $this->product->id,
            'size' => 'L',
            'color' => 'Merah',
            'sku' => 'CONTOH-L-MERAH',
            'price_delta' => 0,
            'stock' => 5,
            'is_active' => true,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $this->product->id,
            'product_variant_id' => $variant->id,
            'product_name' => $this->product->name,
            'variant_label' => 'L / Merah',
            'qty' => 1,
            'unit_price' => 85000,
            'line_total' => 85000,
        ]);

        return Review::query()->create([
            'order_id' => $order->id,
            'product_id' => $this->product->id,
            'user_id' => $user->id,
            'rating' => $rating,
            'comment' => 'Bahan adem.',
            'is_visible' => true,
        ]);
    }

    public function test_daftar_pesan_menampilkan_ringkasan_belum_dibaca(): void
    {
        $this->buatPesan();
        $this->buatPesan(dibaca: true);

        $this->get(route('admin.messages.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Messages/Index', false)
                ->where('ringkasan.total', 2)
                ->where('ringkasan.belum_dibaca', 1)
                ->has('pesan.data', 2)
            );
    }

    public function test_filter_status_belum_dibaca(): void
    {
        $this->buatPesan();
        $this->buatPesan(dibaca: true);

        $this->get(route('admin.messages.index', ['status' => 'belum']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Messages/Index', false)
                ->has('pesan.data', 1)
            );
    }

    public function test_tandai_pesan_sudah_dibaca(): void
    {
        $pesan = $this->buatPesan();

        $this->from(route('admin.messages.index'))
            ->patch(route('admin.messages.read', $pesan))
            ->assertRedirect(route('admin.messages.index'))
            ->assertSessionHas('success');

        $this->assertTrue((bool) $pesan->refresh()->is_read);
    }

    public function test_balas_pesan_menyimpan_balasan_dan_menandai_dibaca(): void
    {
        $pesan = $this->buatPesan();

        $this->from(route('admin.messages.index'))
            ->post(route('admin.messages.reply', $pesan), ['admin_reply' => 'Ukuran XXL tersedia.'])
            ->assertRedirect(route('admin.messages.index'))
            ->assertSessionHas('success');

        $pesan->refresh();

        $this->assertSame('Ukuran XXL tersedia.', $pesan->admin_reply);
        $this->assertNotNull($pesan->replied_at);
        $this->assertTrue((bool) $pesan->is_read);
    }

    public function test_balas_pesan_wajib_isi(): void
    {
        $pesan = $this->buatPesan();

        $this->from(route('admin.messages.index'))
            ->post(route('admin.messages.reply', $pesan), ['admin_reply' => ''])
            ->assertSessionHasErrors('admin_reply');

        $this->assertNull($pesan->refresh()->admin_reply);
    }

    public function test_daftar_ulasan_menampilkan_ringkasan_rating(): void
    {
        $this->buatUlasan(4);

        $this->get(route('admin.reviews.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Reviews/Index', false)
                ->where('ringkasan.rating_count', 1)
                ->where('ringkasan.rating_avg', 4)
                ->where('ringkasan.distribusi.4', 1)
                ->has('ulasan.data', 1)
            );
    }

    public function test_balas_ulasan_menyimpan_balasan(): void
    {
        $ulasan = $this->buatUlasan();

        $this->from(route('admin.reviews.index'))
            ->post(route('admin.reviews.reply', $ulasan), ['admin_reply' => 'Terima kasih sudah membeli.'])
            ->assertRedirect(route('admin.reviews.index'))
            ->assertSessionHas('success');

        $ulasan->refresh();

        $this->assertSame('Terima kasih sudah membeli.', $ulasan->admin_reply);
        $this->assertNotNull($ulasan->replied_at);
    }

    public function test_visibilitas_disembunyikan_menghitung_ulang_rating_produk(): void
    {
        $ulasan = $this->buatUlasan(5);

        $this->product->forceFill(['rating_avg' => 5, 'rating_count' => 1])->save();

        $this->from(route('admin.reviews.index'))
            ->patch(route('admin.reviews.visibility', $ulasan), ['is_visible' => false])
            ->assertRedirect(route('admin.reviews.index'))
            ->assertSessionHas('success');

        $this->assertFalse((bool) $ulasan->refresh()->is_visible);

        $this->product->refresh();
        $this->assertSame(0, (int) $this->product->rating_count);
        $this->assertSame(0.0, (float) $this->product->rating_avg);
    }

    public function test_visibilitas_tanpa_body_membalik_nilai(): void
    {
        $ulasan = $this->buatUlasan();
        $this->assertTrue((bool) $ulasan->is_visible);

        $this->from(route('admin.reviews.index'))
            ->patch(route('admin.reviews.visibility', $ulasan))
            ->assertRedirect(route('admin.reviews.index'));

        $this->assertFalse((bool) $ulasan->refresh()->is_visible);
    }

    public function test_tamu_tidak_boleh_membuka_pesan_masuk(): void
    {
        $this->app['auth']->forgetGuards();

        $this->get(route('admin.messages.index'))->assertRedirect(route('admin.login'));
    }
}

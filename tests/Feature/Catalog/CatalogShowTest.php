<?php

namespace Tests\Feature\Catalog;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

/**
 * Halaman detail produk `/produk/{slug}` (K11, kontrak props §11.2).
 */
class CatalogShowTest extends TestCase
{
    use RefreshDatabase;

    private int $urutan = 0;

    private function kategori(string $slug = 'contoh-daster', string $name = '[CONTOH] Daster'): Category
    {
        return Category::create(['name' => $name, 'slug' => $slug]);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function produk(Category $kategori, string $slug, array $attributes = []): Product
    {
        return Product::create(array_merge([
            'category_id' => $kategori->id,
            'name' => '[CONTOH] '.str_replace('-', ' ', $slug),
            'slug' => $slug,
            'sku' => 'CONTOH-'.strtoupper(substr(md5($slug), 0, 6)),
            'base_price' => 89000,
        ], $attributes));
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function varian(Product $produk, string $size, array $attributes = []): ProductVariant
    {
        return ProductVariant::create(array_merge([
            'product_id' => $produk->id,
            'size' => $size,
            'color' => 'Hitam',
            'sku' => $produk->slug.'-'.strtolower($size),
            'price_delta' => 0,
            'stock' => 5,
        ], $attributes));
    }

    private function pesananUntukUlasan(Product $produk, ProductVariant $varian, ?User $user): Order
    {
        $this->urutan++;

        $order = Order::create([
            'user_id' => $user?->id,
            'code' => 'TK-CONTOH-'.$this->urutan,
            'status' => Order::STATUS_COMPLETED,
            'payment_status' => Order::PAYMENT_SETTLEMENT,
            'customer_name' => $user?->name ?? '[CONTOH] Pembeli',
            'customer_phone' => '081200000000',
            'shipping_address' => 'Jl. Contoh No. 1',
            'city' => 'Pekalongan',
            'subtotal' => 89000,
            'shipping_cost' => 0,
            'discount' => 0,
            'total' => 89000,
        ]);

        $order->items()->create([
            'product_id' => $produk->id,
            'product_variant_id' => $varian->id,
            'product_name' => $produk->name,
            'variant_label' => 'M / Hitam',
            'qty' => 1,
            'unit_price' => 89000,
            'line_total' => 89000,
        ]);

        return $order;
    }

    private function ulasan(
        Product $produk,
        ProductVariant $varian,
        ?User $user,
        int $rating,
        string $komentar,
        bool $tampil = true
    ): Review {
        $order = $this->pesananUntukUlasan($produk, $varian, $user);

        return Review::create([
            'order_id' => $order->id,
            'product_id' => $produk->id,
            'user_id' => $user?->id,
            'rating' => $rating,
            'comment' => $komentar,
            'is_visible' => $tampil,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function props(TestResponse $response): array
    {
        return $response->viewData('page')['props'];
    }

    public function test_detail_mengirim_key_khusus_detail_dan_varian_urut_ukuran_baku(): void
    {
        $kategori = $this->kategori();
        $produk = $this->produk($kategori, 'contoh-detail', [
            'base_price' => 109000,
            'compare_price' => 129000,
            'description' => '[CONTOH] Daster rayon, adem.',
        ]);

        $this->varian($produk, 'XL');
        $this->varian($produk, 'M');

        $detail = $this->props($this->get('/produk/contoh-detail'))['product'];

        $this->assertSame('contoh-detail', $detail['slug']);
        $this->assertSame(109000, $detail['base_price']);
        $this->assertSame(129000, $detail['compare_price']);
        $this->assertSame('[CONTOH] Daster rayon, adem.', $detail['description']);
        $this->assertNull($detail['care']);
        $this->assertNull($detail['shipping_return']);
        $this->assertSame(['5' => 0, '4' => 0, '3' => 0, '2' => 0, '1' => 0], $detail['rating_distribution']);
        $this->assertSame([], $detail['reviews']);
        $this->assertSame([], $this->props($this->get('/produk/contoh-detail'))['related']);
        $this->assertSame(['M', 'XL'], array_column($detail['variants'], 'size'));
    }

    public function test_detail_hanya_mengirim_ulasan_yang_tampil(): void
    {
        $kategori = $this->kategori();
        $produk = $this->produk($kategori, 'contoh-ulasan');
        $varian = $this->varian($produk, 'M');

        $pembeli = User::factory()->create(['name' => 'Ayu Lestari']);

        $this->ulasan($produk, $varian, $pembeli, 5, '[CONTOH] Bahan adem.');
        $this->ulasan($produk, $varian, null, 3, '[CONTOH] Lumayan.');
        $this->ulasan($produk, $varian, $pembeli, 1, '[CONTOH] Tidak tampil.', tampil: false);

        $detail = $this->props($this->get('/produk/contoh-ulasan'))['product'];

        $this->assertSame(['5' => 1, '4' => 0, '3' => 1, '2' => 0, '1' => 0], $detail['rating_distribution']);
        $this->assertCount(2, $detail['reviews']);

        $nama = array_column($detail['reviews'], 'user_name');
        sort($nama);
        $this->assertSame(['Ayu Lestari', 'Pembeli'], $nama);

        $rating = array_column($detail['reviews'], 'rating');
        sort($rating);
        $this->assertSame([3, 5], $rating);

        $this->assertSame(
            ['id', 'user_name', 'rating', 'comment', 'created_at', 'reply'],
            array_keys($detail['reviews'][0])
        );
        $this->assertNull($detail['reviews'][0]['reply']);
    }

    public function test_related_maks_empat_produk_dari_kategori_sama(): void
    {
        $kategori = $this->kategori();
        $lain = $this->kategori('contoh-lain', '[CONTOH] Lain');

        $this->produk($kategori, 'contoh-utama');

        for ($i = 1; $i <= 5; $i++) {
            $this->produk($kategori, 'contoh-saudara-'.$i, ['rating_avg' => 4 + ($i / 100)]);
        }

        $this->produk($lain, 'contoh-beda-kategori', ['rating_avg' => 5]);

        $props = $this->props($this->get('/produk/contoh-utama'));

        $this->assertCount(4, $props['related']);
        $this->assertSame('contoh-saudara-5', $props['related'][0]['slug']);
        $this->assertNotContains('contoh-utama', array_column($props['related'], 'slug'));
        $this->assertNotContains('contoh-beda-kategori', array_column($props['related'], 'slug'));
    }

    public function test_produk_tidak_aktif_dianggap_tidak_ada(): void
    {
        $kategori = $this->kategori();
        $this->produk($kategori, 'contoh-nonaktif', ['is_active' => false]);

        $this->get('/produk/contoh-nonaktif')
            ->assertNotFound()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Products/Show', false)
                ->where('product', null)
                ->where('error', 'Produk tidak ditemukan.')
            );
    }

    public function test_slug_tidak_dikenal_memberi_halaman_404_dengan_pesan(): void
    {
        $this->get('/produk/produk-tidak-ada')
            ->assertNotFound()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Products/Show', false)
                ->where('product', null)
                ->where('related', [])
                ->where('error', 'Produk tidak ditemukan.')
            );
    }

    public function test_slug_angka_dibaca_sebagai_id_produk(): void
    {
        $kategori = $this->kategori();
        $produk = $this->produk($kategori, 'contoh-angka');

        $this->get('/produk/'.$produk->id)
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Products/Show', false)
                ->where('product.slug', 'contoh-angka')
                ->where('error', null)
            );
    }

    public function test_slug_angka_tidak_sesuai_id_tetap_404(): void
    {
        $kategori = $this->kategori();
        $this->produk($kategori, 'contoh-satu');

        $this->get('/produk/99999')
            ->assertNotFound()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Products/Show', false)
                ->where('product', null)
            );
    }
}

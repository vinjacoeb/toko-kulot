<?php

namespace Tests\Feature\Catalog;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

/**
 * Katalog `/produk` — filter, urut, paginasi (K11, kontrak props §11.1).
 *
 * Semua data uji dibuat langsung di dalam test (konvensi proyek: factory hanya
 * untuk User/Admin) dan ditandai `[CONTOH]`.
 */
class CatalogIndexTest extends TestCase
{
    use RefreshDatabase;

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

    private function pesan(Product $produk, ProductVariant $varian, int $qty, string $status = Order::STATUS_PAID): void
    {
        $order = Order::create([
            'code' => 'TK-CONTOH-'.substr(md5($produk->slug.$status.$qty), 0, 8),
            'status' => $status,
            'payment_status' => Order::PAYMENT_SETTLEMENT,
            'customer_name' => '[CONTOH] Pembeli',
            'customer_phone' => '081200000000',
            'shipping_address' => 'Jl. Contoh No. 1',
            'city' => 'Pekalongan',
            'subtotal' => 1000 * $qty,
            'shipping_cost' => 0,
            'discount' => 0,
            'total' => 1000 * $qty,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $produk->id,
            'product_variant_id' => $varian->id,
            'product_name' => $produk->name,
            'variant_label' => 'M / Hitam',
            'qty' => $qty,
            'unit_price' => 1000,
            'line_total' => 1000 * $qty,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function props(TestResponse $response): array
    {
        return $response->viewData('page')['props'];
    }

    public function test_paginator_mengirim_dua_belas_produk_per_halaman(): void
    {
        $kategori = $this->kategori();

        for ($i = 1; $i <= 14; $i++) {
            $this->produk($kategori, 'contoh-produk-'.$i, ['base_price' => 50000 + $i]);
        }

        $this->get('/produk')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Products/Index', false)
                ->where('products.per_page', 12)
                ->where('products.total', 14)
                ->where('products.last_page', 2)
                ->where('products.current_page', 1)
                ->where('error', null)
                ->has('products.data', 12)
            );
    }

    public function test_halaman_kedua_mengirim_sisa_produk(): void
    {
        $kategori = $this->kategori();

        for ($i = 1; $i <= 14; $i++) {
            $this->produk($kategori, 'contoh-produk-'.$i);
        }

        $this->get('/produk?page=2')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Products/Index', false)
                ->has('products.data', 2)
                ->where('products.current_page', 2)
                ->where('filters.page', 2)
            );
    }

    public function test_produk_tidak_aktif_tidak_muncul(): void
    {
        $kategori = $this->kategori();
        $this->produk($kategori, 'contoh-aktif');
        $this->produk($kategori, 'contoh-nonaktif', ['is_active' => false]);

        $this->get('/produk')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Products/Index', false)
                ->where('products.total', 1)
                ->has('products.data', 1)
                ->where('products.data.0.slug', 'contoh-aktif')
            );
    }

    public function test_filter_kategori_hanya_mengirim_produk_kategori_itu(): void
    {
        $daster = $this->kategori('contoh-daster', '[CONTOH] Daster');
        $kulot = $this->kategori('contoh-kulot', '[CONTOH] Kulot');

        $this->produk($daster, 'contoh-daster-satu');
        $this->produk($kulot, 'contoh-kulot-satu');

        $this->get('/produk?kategori=contoh-kulot')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Products/Index', false)
                ->has('products.data', 1)
                ->where('products.data.0.slug', 'contoh-kulot-satu')
                ->where('filters.kategori', 'contoh-kulot')
            );
    }

    public function test_slug_kategori_tidak_sah_diabaikan_bukan_galat(): void
    {
        $kategori = $this->kategori();
        $this->produk($kategori, 'contoh-satu');

        $this->get('/produk?kategori=Bukan%20Slug%21')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Products/Index', false)
                ->has('products.data', 1)
                ->where('filters.kategori', null)
                ->where('error', null)
            );
    }

    public function test_filter_ukuran_memakai_varian_aktif_saja(): void
    {
        $kategori = $this->kategori();

        $ukuranM = $this->produk($kategori, 'contoh-ukuran-m');
        $this->varian($ukuranM, 'M');

        $ukuranXl = $this->produk($kategori, 'contoh-ukuran-xl');
        $this->varian($ukuranXl, 'XL');

        $varianMati = $this->produk($kategori, 'contoh-ukuran-mati');
        $this->varian($varianMati, 'M', ['is_active' => false]);

        $this->get('/produk?ukuran=M')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Products/Index', false)
                ->has('products.data', 1)
                ->where('products.data.0.slug', 'contoh-ukuran-m')
                ->where('filters.ukuran', 'M')
            );
    }

    public function test_filter_harga_ditukar_bila_min_lebih_besar_dari_max(): void
    {
        $kategori = $this->kategori();
        $this->produk($kategori, 'contoh-murah', ['base_price' => 50000]);
        $this->produk($kategori, 'contoh-sedang', ['base_price' => 80000]);
        $this->produk($kategori, 'contoh-mahal', ['base_price' => 150000]);

        $this->get('/produk?harga_min=120000&harga_max=60000')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Products/Index', false)
                ->where('filters.harga_min', 60000)
                ->where('filters.harga_max', 120000)
                ->has('products.data', 1)
                ->where('products.data.0.slug', 'contoh-sedang')
            );
    }

    public function test_harga_bukan_angka_diabaikan(): void
    {
        $kategori = $this->kategori();
        $this->produk($kategori, 'contoh-satu', ['base_price' => 89000]);

        $this->get('/produk?harga_min=abc')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Products/Index', false)
                ->where('filters.harga_min', null)
                ->has('products.data', 1)
            );
    }

    public function test_urut_harga_asc_dan_desc(): void
    {
        $kategori = $this->kategori();
        $this->produk($kategori, 'contoh-mahal', ['base_price' => 150000]);
        $this->produk($kategori, 'contoh-murah', ['base_price' => 50000]);
        $this->produk($kategori, 'contoh-sedang', ['base_price' => 80000]);

        $naik = $this->props($this->get('/produk?urut=harga-asc'));
        $turun = $this->props($this->get('/produk?urut=harga-desc'));

        $this->assertSame(
            ['contoh-murah', 'contoh-sedang', 'contoh-mahal'],
            array_column($naik['products']['data'], 'slug')
        );
        $this->assertSame(
            ['contoh-mahal', 'contoh-sedang', 'contoh-murah'],
            array_column($turun['products']['data'], 'slug')
        );
    }

    public function test_urut_tidak_dikenal_kembali_ke_terbaru(): void
    {
        $kategori = $this->kategori();

        $lama = $this->produk($kategori, 'contoh-lama');
        $lama->forceFill(['created_at' => now()->subDays(2)])->save();

        $baru = $this->produk($kategori, 'contoh-baru');
        $baru->forceFill(['created_at' => now()])->save();

        $props = $this->props($this->get('/produk?urut=ngawur'));

        $this->assertSame('terbaru', $props['filters']['urut']);
        $this->assertSame(['contoh-baru', 'contoh-lama'], array_column($props['products']['data'], 'slug'));
    }

    public function test_urut_terlaris_memakai_qty_pesanan_yang_tidak_dibatalkan(): void
    {
        $kategori = $this->kategori();

        $laris = $this->produk($kategori, 'contoh-laris');
        $sepi = $this->produk($kategori, 'contoh-sepi');

        $this->pesan($laris, $this->varian($laris, 'M'), 5);
        $this->pesan($sepi, $this->varian($sepi, 'M'), 9, Order::STATUS_CANCELLED);

        $props = $this->props($this->get('/produk?urut=terlaris'));

        $this->assertSame('contoh-laris', $props['products']['data'][0]['slug']);
    }

    public function test_pencarian_q_mencocokkan_nama_dan_sku_serta_mengabaikan_wildcard(): void
    {
        $kategori = $this->kategori();
        $this->produk($kategori, 'contoh-batik', ['name' => '[CONTOH] Daster Batik', 'sku' => 'DXA-111']);
        $this->produk($kategori, 'contoh-linen', ['name' => '[CONTOH] Kulot Linen', 'sku' => 'KLT-222']);

        $this->get('/produk?q=Batik')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Products/Index', false)
                ->has('products.data', 1)
                ->where('products.data.0.slug', 'contoh-batik')
            );

        $this->get('/produk?q=KLT-222')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Products/Index', false)
                ->has('products.data', 1)
                ->where('products.data.0.slug', 'contoh-linen')
            );

        // `%` diperlakukan sebagai teks biasa: tidak mencocokkan semua produk.
        $this->get('/produk?q=%25')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Products/Index', false)
                ->has('products.data', 0)
                ->where('products.total', 0)
            );
    }

    public function test_q_dipotong_seratus_karakter(): void
    {
        $this->kategori();

        $props = $this->props($this->get('/produk?q='.str_repeat('a', 150)));

        $this->assertSame(100, mb_strlen($props['filters']['q']));
    }

    public function test_kategori_tanpa_produk_aktif_tidak_dikirim_dan_ukuran_urut_baku(): void
    {
        $kategori = $this->kategori();
        $this->kategori('contoh-kosong', '[CONTOH] Kosong');

        $produk = $this->produk($kategori, 'contoh-varian');
        $this->varian($produk, 'XL');
        $this->varian($produk, 'M');
        $this->varian($produk, 'L');

        $props = $this->props($this->get('/produk'));

        $this->assertSame(['contoh-daster'], array_column($props['categories'], 'slug'));
        $this->assertSame(1, $props['categories'][0]['product_count']);
        $this->assertSame(['M', 'L', 'XL'], $props['sizes']);
    }

    public function test_kartu_produk_memuat_compare_price_dan_varian_aktif(): void
    {
        $kategori = $this->kategori();
        $produk = $this->produk($kategori, 'contoh-diskon', ['base_price' => 89000, 'compare_price' => 109000]);

        $this->varian($produk, 'M', ['stock' => 4]);
        $this->varian($produk, 'XL', ['stock' => 99, 'is_active' => false]);

        $props = $this->props($this->get('/produk'));
        $kartu = $props['products']['data'][0];

        $this->assertSame(89000, $kartu['base_price']);
        $this->assertSame(109000, $kartu['compare_price']);
        $this->assertSame(4, $kartu['stock']);
        $this->assertCount(1, $kartu['variants']);
        $this->assertSame('M', $kartu['variants'][0]['size']);
        $this->assertSame(
            ['id', 'size', 'color', 'sku', 'price_delta', 'stock', 'is_active'],
            array_keys($kartu['variants'][0])
        );
        $this->assertSame(
            ['id', 'slug', 'name', 'sku', 'url', 'short_description', 'base_price', 'compare_price',
                'wholesale_price', 'min_wholesale_qty', 'rating_avg', 'rating_count', 'stock',
                'is_featured', 'category', 'images', 'variants'],
            array_keys($kartu)
        );
    }
}

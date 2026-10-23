<?php

namespace Tests\Feature\Catalog;

use App\Models\Admin;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

/**
 * Warna varian pada props publik (kontrak props §8.3 `variants[].color_hex`,
 * kartu `t_bc89df6d`).
 *
 * Yang dikunci di sini:
 * - produk yang dibuat lewat `/admin/produk` benar-benar mengirim seluruh varian
 *   ukuran × warna ke `/produk/{slug}` (tidak ada yang hilang/digabung);
 * - `color_hex` berisi warna nyata, bukan `null`/kosong, untuk nama warna umum;
 * - warna kosong/tidak dikenal tetap `null` (frontend memakai lingkaran netral).
 */
class ProductVariantColorPropsTest extends TestCase
{
    use RefreshDatabase;

    private function kategori(): Category
    {
        return Category::create([
            'name' => '[CONTOH] Daster',
            'slug' => 'contoh-daster',
            'sort_order' => 1,
            'is_active' => true,
        ]);
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
            'base_price' => 99000,
            'is_active' => true,
        ], $attributes));
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function varian(Product $produk, string $size, ?string $color, array $attributes = []): ProductVariant
    {
        return ProductVariant::create(array_merge([
            'product_id' => $produk->id,
            'size' => $size,
            'color' => $color,
            'sku' => $produk->sku.'-'.$size.'-'.substr(md5($size.($color ?? '')), 0, 4),
            'price_delta' => 0,
            'stock' => 5,
            'is_active' => true,
        ], $attributes));
    }

    /**
     * @return array<string, mixed>
     */
    private function props(TestResponse $response): array
    {
        return $response->viewData('page')['props'];
    }

    public function test_produk_dibuat_di_admin_mengirim_semua_kombinasi_ukuran_dan_warna(): void
    {
        $admin = Admin::factory()->create();
        $kategori = $this->kategori();

        $this->actingAs($admin, 'admin')
            ->post('/admin/produk', [
                'name' => '[CONTOH] Daster Warna Ganda',
                'sku' => 'CONTOH-WARNA',
                'category_id' => $kategori->id,
                'base_price' => 99000,
                'variants' => [
                    ['size' => 'L', 'color' => 'Hijau', 'sku' => 'CONTOH-WARNA-L-HIJAU', 'stock' => 4],
                    ['size' => 'L', 'color' => 'Merah', 'sku' => 'CONTOH-WARNA-L-MERAH', 'stock' => 6],
                    ['size' => 'XL', 'color' => 'Hijau', 'sku' => 'CONTOH-WARNA-XL-HIJAU', 'stock' => 8],
                    ['size' => 'XL', 'color' => 'Merah', 'sku' => 'CONTOH-WARNA-XL-MERAH', 'stock' => 10],
                ],
            ])
            ->assertRedirect('/admin/produk')
            ->assertSessionHas('success');

        $produk = Product::query()->where('sku', 'CONTOH-WARNA')->firstOrFail();

        $this->assertSame(4, $produk->variants()->count());

        $varian = $this->props($this->get('/produk/'.$produk->slug))['product']['variants'];

        $this->assertCount(4, $varian);
        $this->assertSame(
            [['L', 'Hijau'], ['L', 'Merah'], ['XL', 'Hijau'], ['XL', 'Merah']],
            array_map(fn (array $baris) => [$baris['size'], $baris['color']], $varian)
        );
        $this->assertSame(
            ['#16A34A', '#DC2626', '#16A34A', '#DC2626'],
            array_column($varian, 'color_hex')
        );
        $this->assertSame(['Hijau', 'Merah'], array_values(array_unique(array_column($varian, 'color'))));
        $this->assertSame(
            ['id', 'size', 'color', 'color_hex', 'sku', 'price_delta', 'stock', 'is_active'],
            array_keys($varian[0])
        );
    }

    public function test_kartu_katalog_juga_membawa_color_hex_per_varian(): void
    {
        $kategori = $this->kategori();
        $produk = $this->produk($kategori, 'contoh-katalog-warna');

        $this->varian($produk, 'M', 'Merah');
        $this->varian($produk, 'L', 'Navy');

        $props = $this->props($this->get('/produk'));
        $kartu = collect($props['products']['data'])->firstWhere('slug', 'contoh-katalog-warna');

        $this->assertNotNull($kartu);
        $this->assertSame(['#DC2626', '#1E3A8A'], array_column($kartu['variants'], 'color_hex'));
    }

    public function test_warna_kosong_atau_tidak_dikenal_tetap_null_tanpa_mengubah_bentuk(): void
    {
        $kategori = $this->kategori();
        $produk = $this->produk($kategori, 'contoh-warna-gelap');

        $this->varian($produk, 'M', null);
        $this->varian($produk, 'L', 'Motif Bunga');

        $varian = $this->props($this->get('/produk/'.$produk->slug))['product']['variants'];

        $this->assertSame(['M', 'L'], array_column($varian, 'size'));
        $this->assertSame([null, null], array_column($varian, 'color_hex'));
        $this->assertSame([null, 'Motif Bunga'], array_column($varian, 'color'));
    }
}

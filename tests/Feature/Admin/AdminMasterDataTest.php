<?php

namespace Tests\Feature\Admin;

use App\Models\Admin;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockMovement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Modul admin: Produk, Kategori, Stok (PRD §5.2, §6, §9; kontrak props §12.1–§12.15).
 *
 * Data uji memakai awalan [CONTOH] agar mudah dikenali.
 */
class AdminMasterDataTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): Admin
    {
        return Admin::factory()->create();
    }

    private function kategori(string $slug = 'contoh-daster'): Category
    {
        return Category::create([
            'name' => '[CONTOH] Daster',
            'slug' => $slug,
            'sort_order' => 1,
            'is_active' => true,
        ]);
    }

    /**
     * @return array{0: Product, 1: ProductVariant}
     */
    private function produk(Category $kategori, int $stok = 5, string $kode = 'CONTOH-DK'): array
    {
        $product = Product::create([
            'category_id' => $kategori->id,
            'name' => '[CONTOH] Daster Kulot',
            'slug' => 'contoh-'.strtolower($kode),
            'sku' => $kode,
            'base_price' => 89000,
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'size' => 'M',
            'sku' => $kode.'-M',
            'stock' => $stok,
            'is_active' => true,
        ]);

        return [$product, $variant];
    }

    public function test_daftar_produk_memakai_paginator_dan_membaca_filter(): void
    {
        $admin = $this->admin();
        $this->produk($this->kategori());

        $this->actingAs($admin, 'admin')
            ->get('/admin/produk?q=Daster')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Products/Index')
                ->has('produk.data', 1)
                ->where('produk.meta.per_page', 15)
                ->where('filter.q', 'Daster')
                ->has('ringkasan'));
    }

    public function test_tambah_produk_membuat_varian_dan_riwayat_stok_awal(): void
    {
        $admin = $this->admin();
        $kategori = $this->kategori();

        $this->actingAs($admin, 'admin')
            ->post('/admin/produk', [
                'name' => '[CONTOH] Daster Baru',
                'sku' => 'CONTOH-BARU',
                'category_id' => $kategori->id,
                'base_price' => 99000,
                'variants' => [
                    ['size' => 'M', 'sku' => 'CONTOH-BARU-M', 'stock' => 5],
                    ['size' => 'L', 'sku' => 'CONTOH-BARU-L', 'stock' => 0],
                ],
            ])
            ->assertRedirect('/admin/produk')
            ->assertSessionHas('success');

        $produk = Product::query()->where('sku', 'CONTOH-BARU')->firstOrFail();

        $this->assertSame(2, $produk->variants()->count());

        $varian = $produk->variants()->where('sku', 'CONTOH-BARU-M')->firstOrFail();

        $this->assertSame(5, (int) $varian->stock);
        $this->assertDatabaseHas('stock_movements', [
            'product_variant_id' => $varian->id,
            'type' => StockMovement::TYPE_IN,
            'qty' => 5,
            'admin_id' => $admin->id,
        ]);
    }

    public function test_tambah_produk_menolak_input_tidak_valid(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin, 'admin')
            ->post('/admin/produk', [
                'name' => '',
                'sku' => '',
                'category_id' => 999,
                'base_price' => -1,
                'variants' => [],
            ])
            ->assertSessionHasErrors(['name', 'sku', 'category_id', 'base_price', 'variants']);
    }

    public function test_tambah_produk_menolak_sku_ganda(): void
    {
        $admin = $this->admin();
        $kategori = $this->kategori();
        $this->produk($kategori);

        $this->actingAs($admin, 'admin')
            ->post('/admin/produk', [
                'name' => '[CONTOH] Produk Lain',
                'sku' => 'CONTOH-DK',
                'category_id' => $kategori->id,
                'base_price' => 50000,
                'variants' => [['size' => 'M', 'sku' => 'CONTOH-LAIN-M']],
            ])
            ->assertSessionHasErrors('sku');
    }

    public function test_kategori_terpakai_tidak_bisa_dihapus(): void
    {
        $admin = $this->admin();
        $kategori = $this->kategori();
        $this->produk($kategori);

        $respons = $this->actingAs($admin, 'admin')->delete('/admin/kategori/'.$kategori->id);

        $this->assertLessThan(500, $respons->getStatusCode());
        $this->assertDatabaseHas('categories', ['id' => $kategori->id]);
    }

    public function test_stok_masuk_dan_keluar_mencatat_pergerakan(): void
    {
        $admin = $this->admin();
        [, $varian] = $this->produk($this->kategori(), 5);

        $this->actingAs($admin, 'admin')
            ->post('/admin/stok/'.$varian->id.'/masuk', ['qty' => 4, 'note' => '[CONTOH] Restok'])
            ->assertSessionHas('success');

        $this->assertSame(9, (int) $varian->fresh()->stock);

        $this->actingAs($admin, 'admin')
            ->post('/admin/stok/'.$varian->id.'/keluar', ['qty' => 3, 'note' => '[CONTOH] Rusak'])
            ->assertSessionHas('success');

        $this->assertSame(6, (int) $varian->fresh()->stock);

        $this->assertDatabaseHas('stock_movements', [
            'product_variant_id' => $varian->id,
            'type' => StockMovement::TYPE_OUT,
            'qty' => 3,
            'admin_id' => $admin->id,
        ]);

        $this->assertSame(2, StockMovement::query()->where('product_variant_id', $varian->id)->count());
    }

    public function test_stok_keluar_ditolak_bila_melebihi_stok_dan_qty_di_bawah_satu(): void
    {
        $admin = $this->admin();
        [, $varian] = $this->produk($this->kategori(), 5);

        $this->actingAs($admin, 'admin')
            ->post('/admin/stok/'.$varian->id.'/keluar', ['qty' => 50])
            ->assertSessionHasErrors('qty');

        $this->assertSame(5, (int) $varian->fresh()->stock);

        $this->actingAs($admin, 'admin')
            ->post('/admin/stok/'.$varian->id.'/masuk', ['qty' => 0])
            ->assertSessionHasErrors('qty');

        $this->assertSame(5, (int) $varian->fresh()->stock);
    }

    public function test_riwayat_stok_menampilkan_pergerakan_masuk_dan_keluar(): void
    {
        $admin = $this->admin();
        [, $varian] = $this->produk($this->kategori(), 0);

        $this->actingAs($admin, 'admin')->post('/admin/stok/'.$varian->id.'/masuk', ['qty' => 4]);
        $this->actingAs($admin, 'admin')->post('/admin/stok/'.$varian->id.'/keluar', ['qty' => 1]);

        $this->actingAs($admin, 'admin')
            ->get('/admin/stok/riwayat')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Stocks/History', false)
                ->has('riwayat.data', 2));
    }
}

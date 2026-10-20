<?php

namespace Tests\Unit\Models;

use App\Models\Product;
use Tests\TestCase;

/**
 * Harga produk: eceran vs grosir (PRD §7.1 aturan A3) dan harga coret — K15.
 *
 * Memakai instance model tanpa menyimpan ke database supaya batas `qty`
 * grosir bisa diuji sebagai logika murni (boundary min-1 / min).
 */
class ProductPricingTest extends TestCase
{
    /**
     * @param  array<string, mixed>  $attributes
     */
    private function produk(array $attributes = []): Product
    {
        return new Product(array_merge([
            'base_price' => 85000,
            'wholesale_price' => 75000,
            'min_wholesale_qty' => 3,
        ], $attributes));
    }

    public function test_harga_eceran_dipakai_di_bawah_minimum_grosir(): void
    {
        $product = $this->produk();

        $this->assertSame(85000, $product->priceForQty(1));
        $this->assertSame(85000, $product->priceForQty(2));
    }

    public function test_batas_minimum_grosir_tepat_di_qty_min(): void
    {
        $product = $this->produk();

        $this->assertSame(75000, $product->priceForQty(3));
        $this->assertSame(75000, $product->priceForQty(99));
    }

    public function test_tanpa_harga_grosir_selalu_eceran(): void
    {
        $product = $this->produk(['wholesale_price' => null]);

        $this->assertSame(85000, $product->priceForQty(10));
    }

    public function test_minimum_grosir_nol_atau_kosong_tidak_aktif(): void
    {
        $this->assertSame(85000, $this->produk(['min_wholesale_qty' => 0])->priceForQty(50));
        $this->assertSame(85000, $this->produk(['min_wholesale_qty' => null])->priceForQty(50));
    }

    public function test_harga_coret_hanya_bermakna_bila_di_atas_harga_jual(): void
    {
        $this->assertTrue($this->produk(['compare_price' => 100000])->hasDiscount());
        $this->assertFalse($this->produk(['compare_price' => 85000])->hasDiscount());
        $this->assertFalse($this->produk(['compare_price' => 80000])->hasDiscount());
        $this->assertFalse($this->produk(['compare_price' => null])->hasDiscount());
    }
}

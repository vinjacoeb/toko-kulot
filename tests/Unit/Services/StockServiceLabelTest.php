<?php

namespace Tests\Unit\Services;

use App\Models\ProductVariant;
use App\Services\StockService;
use Tests\TestCase;

/**
 * Label varian pada pesan galat stok (PRD §7.1) — K15.
 *
 * Label dipakai di pesan "Stok tersisa N." saat checkout, sehingga kosongnya
 * label membuat pesan galat tidak dapat ditindaklanjuti pembeli.
 */
class StockServiceLabelTest extends TestCase
{
    private StockService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new StockService;
    }

    public function test_label_ukuran_dan_warna(): void
    {
        $variant = new ProductVariant(['size' => 'L', 'color' => 'Merah']);

        $this->assertSame('L / Merah', $this->service->label($variant));
    }

    public function test_label_hanya_ukuran(): void
    {
        $variant = new ProductVariant(['size' => 'XL', 'color' => null]);

        $this->assertSame('XL', $this->service->label($variant));
    }

    public function test_label_tanpa_ukuran_memakai_sku(): void
    {
        $variant = new ProductVariant(['size' => null, 'color' => null, 'sku' => 'CONTOH-L-MERAH']);

        $this->assertSame('CONTOH-L-MERAH', $this->service->label($variant));
    }

    public function test_label_tanpa_varian_disebut_produk(): void
    {
        $this->assertSame('produk', $this->service->label(null));
    }
}

<?php

namespace Tests\Unit\Support;

use App\Support\VariantSize;
use Tests\TestCase;

/**
 * Urutan ukuran baku (design §5.2, FilterPanel) — K15.
 *
 * Murni tanpa database: ukuran dipakai untuk mengurutkan `variants[]` dan daftar
 * filter ukuran, sehingga salah urut langsung terlihat di katalog publik.
 */
class VariantSizeTest extends TestCase
{
    public function test_rank_mengikuti_urutan_baku(): void
    {
        $this->assertLessThan(VariantSize::rank('M'), VariantSize::rank('S'));
        $this->assertLessThan(VariantSize::rank('L'), VariantSize::rank('M'));
        $this->assertLessThan(VariantSize::rank('XL'), VariantSize::rank('L'));
        $this->assertLessThan(VariantSize::rank('3XL'), VariantSize::rank('XXXL'));
        $this->assertSame(count(VariantSize::ORDER) - 1, VariantSize::rank('ALL SIZE'));
    }

    public function test_rank_tidak_peka_huruf_besar_kecil_dan_spasi(): void
    {
        $this->assertSame(VariantSize::rank('M'), VariantSize::rank(' m '));
    }

    public function test_ukuran_di_luar_daftar_baku_dapat_peringkat_terakhir(): void
    {
        $this->assertSame(count(VariantSize::ORDER), VariantSize::rank('JUMBO'));
        $this->assertSame(count(VariantSize::ORDER), VariantSize::rank(null));
    }

    public function test_sort_mengurutkan_baku_lalu_abjad_untuk_yang_tidak_dikenal(): void
    {
        $hasil = VariantSize::sort(['XL', 'S', 'Zebra', 'M', 'All Size', 'Anak']);

        $this->assertSame(['S', 'M', 'XL', 'All Size', 'Anak', 'Zebra'], $hasil);
    }

    public function test_sort_membuang_nilai_kosong_dan_duplikat(): void
    {
        $this->assertSame(['M', 'L'], VariantSize::sort(['M', '', '  ', 'L', 'M', null]));
    }

    public function test_sort_daftar_kosong_aman(): void
    {
        $this->assertSame([], VariantSize::sort([]));
    }
}

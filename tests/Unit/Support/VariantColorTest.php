<?php

namespace Tests\Unit\Support;

use App\Support\VariantColor;
use Tests\TestCase;

/**
 * Peta warna varian → hex untuk swatch publik (kontrak props §8.3
 * `variants[].color_hex`, kartu `t_bc89df6d`).
 *
 * Murni tanpa database: hex dipakai langsung oleh ColorSwatch di kartu katalog
 * dan halaman detail, jadi salah peta langsung terlihat sebagai warna salah.
 */
class VariantColorTest extends TestCase
{
    public function test_nama_warna_baku_dikenali_tanpa_peka_huruf_besar_kecil_dan_spasi(): void
    {
        $this->assertSame('#DC2626', VariantColor::hex('Merah'));
        $this->assertSame('#DC2626', VariantColor::hex('  merah  '));
        $this->assertSame('#1E3A8A', VariantColor::hex('NAVY'));
        $this->assertSame('#EFE3CB', VariantColor::hex('Krem'));
    }

    public function test_semua_warna_contoh_seeder_punya_hex(): void
    {
        foreach (['Cokelat', 'Navy', 'Biru Muda', 'Sage', 'Hitam', 'Maroon', 'Krem', 'Merah', 'Hijau'] as $warna) {
            $hex = VariantColor::hex($warna);

            $this->assertNotNull($hex, 'Warna '.$warna.' belum ada di peta.');
            $this->assertMatchesRegularExpression('/^#[0-9A-F]{6}$/', $hex);
        }
    }

    public function test_kata_kunci_spesifik_menang_atas_kata_kunci_umum(): void
    {
        $this->assertSame('#93C5FD', VariantColor::hex('Biru Muda'));
        $this->assertSame('#1E3A8A', VariantColor::hex('Biru Dongker'));
        $this->assertSame('#DC2626', VariantColor::hex('Warna Merah'));
        $this->assertSame('#7F1D1D', VariantColor::hex('Merah Marun'));
    }

    public function test_hex_mentah_diteruskan_dalam_huruf_besar(): void
    {
        $this->assertSame('#0EA5E9', VariantColor::hex('#0ea5e9'));
        $this->assertSame('#FFFFFF', VariantColor::hex('#fff'));
        $this->assertNull(VariantColor::hex('fff'));
        $this->assertNull(VariantColor::hex('#12'));
    }

    public function test_kosong_atau_nama_tidak_dikenal_mengirim_null(): void
    {
        $this->assertNull(VariantColor::hex(null));
        $this->assertNull(VariantColor::hex(''));
        $this->assertNull(VariantColor::hex('   '));
        $this->assertNull(VariantColor::hex('Motif Bunga'));
    }
}

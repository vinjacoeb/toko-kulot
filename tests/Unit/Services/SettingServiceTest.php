<?php

namespace Tests\Unit\Services;

use App\Models\Setting;
use App\Services\SettingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use Tests\TestCase;

/**
 * Baca-tulis pengaturan situs (PRD §6 tabel `settings`, §9) — K15.
 *
 * `SettingService` adalah satu-satunya pintu tulis `settings`; tipe simpan
 * (int/bool/json) harus konsisten supaya panel admin dan halaman publik
 * menerima tipe data yang sama.
 */
class SettingServiceTest extends TestCase
{
    use RefreshDatabase;

    private SettingService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new SettingService;
    }

    public function test_teks_disimpan_dan_dibaca_kembali(): void
    {
        $this->service->put('store_name', 'Toko Daster [CONTOH]');

        $this->assertDatabaseHas('settings', [
            'key' => 'store_name',
            'value' => 'Toko Daster [CONTOH]',
            'group' => 'umum',
            'type' => 'text',
        ]);
        $this->assertSame('Toko Daster [CONTOH]', $this->service->get('store_name'));
    }

    public function test_nilai_kosong_dibaca_sebagai_null(): void
    {
        $this->service->put('store_tagline', null);

        $this->assertNull($this->service->get('store_tagline'));
    }

    public function test_nilai_cadangan_dipakai_hanya_bila_key_belum_ada(): void
    {
        $this->service->put('store_tagline', null);

        $this->assertNull(
            $this->service->get('store_tagline', 'cadangan'),
            'Key yang ada namun bernilai kosong tetap null, bukan nilai cadangan.'
        );
        $this->assertSame('cadangan', $this->service->get('key_belum_ada', 'cadangan'));
    }

    public function test_ongkir_disimpan_sebagai_integer_tanpa_desimal(): void
    {
        $this->service->put('shipping_cost_default', '20000');

        $this->assertSame(20000, $this->service->get('shipping_cost_default'));
        $this->assertDatabaseHas('settings', ['key' => 'shipping_cost_default', 'value' => '20000']);
    }

    public function test_ongkir_negatif_dijepit_ke_nol(): void
    {
        $this->service->put('shipping_cost_default', -500);

        $this->assertSame(0, $this->service->get('shipping_cost_default'));
    }

    public function test_bendera_boolean_dibaca_sebagai_boolean(): void
    {
        $this->service->put('midtrans_is_production', true);
        $this->assertTrue($this->service->get('midtrans_is_production'));

        $this->service->put('midtrans_is_production', false);
        $this->assertFalse($this->service->get('midtrans_is_production'));

        $this->service->put('midtrans_is_production', 'ya');
        $this->assertFalse($this->service->get('midtrans_is_production'), 'Nilai non-boolean harus dianggap false.');
    }

    public function test_nilai_json_di_encode_dan_decode(): void
    {
        $navigasi = [
            ['label' => 'Beranda', 'url' => '/'],
            ['label' => 'Produk', 'url' => '/produk'],
        ];

        $this->service->put('header_nav', $navigasi);

        $this->assertSame($navigasi, $this->service->get('header_nav'));
        $this->assertDatabaseHas('settings', ['key' => 'header_nav', 'type' => 'json']);
    }

    public function test_key_di_luar_daftar_putih_ditolak(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $this->service->put('kolom_liar', 'x');
    }

    public function test_put_many_rollback_bila_ada_key_tidak_sah(): void
    {
        try {
            $this->service->putMany([
                'store_name' => 'Toko Daster [CONTOH]',
                'kolom_liar' => 'x',
            ]);
            $this->fail('Penulisan key tidak sah seharusnya gagal.');
        } catch (InvalidArgumentException) {
            // diharapkan
        }

        $this->assertDatabaseMissing('settings', ['key' => 'store_name']);
    }

    public function test_grouped_membagi_tujuh_grup_dan_menampung_key_luar_daftar(): void
    {
        $this->service->putMany(['store_name' => 'Toko Daster [CONTOH]']);
        Setting::create(['key' => 'key_tambahan', 'value' => 'x', 'group' => 'umum', 'type' => 'text']);

        $grouped = $this->service->grouped();

        foreach (SettingService::GROUPS as $group) {
            $this->assertArrayHasKey($group, $grouped);
        }

        $this->assertSame('Toko Daster [CONTOH]', $grouped['umum']['store_name']);
        $this->assertSame(['key_tambahan' => 'x'], $grouped['lainnya']);
    }

    public function test_footer_copyright_disimpan_dan_terbaca(): void
    {
        $this->service->put('footer_copyright', '© 2026 Toko Kulot');

        $this->assertSame('© 2026 Toko Kulot', $this->service->get('footer_copyright'));
        $this->assertDatabaseHas('settings', [
            'key' => 'footer_copyright',
            'group' => 'footer',
            'type' => 'text',
        ]);
        $this->assertSame('© 2026 Toko Kulot', $this->service->grouped()['footer']['footer_copyright']);
    }

    public function test_key_tidak_dikenal_tidak_bisa_ditulis(): void
    {
        $this->assertTrue($this->service->isWritable('store_name'));
        $this->assertFalse($this->service->isWritable('midtrans_server_key'));
    }
}

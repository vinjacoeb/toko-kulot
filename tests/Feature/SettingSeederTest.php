<?php

namespace Tests\Feature;

use App\Models\Setting;
use Database\Seeders\SettingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Seeder pengaturan harus idempoten, tidak menimpa nilai pemilik, dan
 * meninggalkan aset seed yang bisa dipakai (kartu t_101b9145).
 */
class SettingSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeder_idempoten_dan_tidak_menimpa_nilai_pemilik(): void
    {
        $this->seed(SettingSeeder::class);

        $this->assertSame(31, Setting::query()->count());
        $this->assertDatabaseHas('settings', ['key' => 'store_favicon', 'type' => 'image']);
        $this->assertDatabaseHas('settings', ['key' => 'footer_copyright', 'type' => 'text']);
        $this->assertDatabaseHas('settings', ['key' => 'landing_gallery', 'type' => 'json']);

        Setting::query()->where('key', 'store_name')->update(['value' => 'Toko Milik Pemilik']);
        Setting::query()->where('key', 'footer_copyright')->update(['value' => '© 2026 Pemilik']);

        $this->seed(SettingSeeder::class);

        $this->assertSame(31, Setting::query()->count());
        $this->assertSame('Toko Milik Pemilik', Setting::query()->where('key', 'store_name')->value('value'));
        $this->assertSame('© 2026 Pemilik', Setting::query()->where('key', 'footer_copyright')->value('value'));

        // Galeri seed: 4 item [CONTOH], berkasnya ada, dan seeder ulang tidak menduplikasi.
        $gallery = json_decode((string) Setting::query()->where('key', 'landing_gallery')->value('value'), true);
        $this->assertIsArray($gallery);
        $this->assertCount(4, $gallery);

        foreach ($gallery as $item) {
            $this->assertStringStartsWith('/images/seed/landing/galeri-', $item['image']);
            $this->assertStringContainsString('[CONTOH]', $item['caption']);
            $this->assertFileExists(public_path(ltrim($item['image'], '/')));
        }

        // Copy CTA akhir memuat nominal dan ketentuan pengiriman reguler (v1.1 §6).
        $sections = json_decode((string) Setting::query()->where('key', 'landing_sections')->value('value'), true);
        $this->assertStringContainsString('Rp300.000', $sections['newsletter']['subtitle']);
        $this->assertStringContainsString('reguler', $sections['newsletter']['subtitle']);

        $favicon = (string) Setting::query()->where('key', 'store_favicon')->value('value');
        $this->assertSame('/images/seed/favicon.png', $favicon);
        $this->assertFileExists(public_path(ltrim($favicon, '/')));
        $this->assertGreaterThan(0, (int) filesize(public_path(ltrim($favicon, '/'))));

        $this->assertFileExists(public_path('favicon.ico'));
        $this->assertGreaterThan(0, (int) filesize(public_path('favicon.ico')));
    }
}

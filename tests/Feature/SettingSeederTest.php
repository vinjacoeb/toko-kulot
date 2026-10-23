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

        $this->assertSame(21, Setting::query()->count());
        $this->assertDatabaseHas('settings', ['key' => 'store_favicon', 'type' => 'image']);
        $this->assertDatabaseHas('settings', ['key' => 'footer_copyright', 'type' => 'text']);

        Setting::query()->where('key', 'store_name')->update(['value' => 'Toko Milik Pemilik']);
        Setting::query()->where('key', 'footer_copyright')->update(['value' => '© 2026 Pemilik']);

        $this->seed(SettingSeeder::class);

        $this->assertSame(21, Setting::query()->count());
        $this->assertSame('Toko Milik Pemilik', Setting::query()->where('key', 'store_name')->value('value'));
        $this->assertSame('© 2026 Pemilik', Setting::query()->where('key', 'footer_copyright')->value('value'));

        $favicon = (string) Setting::query()->where('key', 'store_favicon')->value('value');
        $this->assertSame('/images/seed/favicon.png', $favicon);
        $this->assertFileExists(public_path(ltrim($favicon, '/')));
        $this->assertGreaterThan(0, (int) filesize(public_path(ltrim($favicon, '/'))));

        $this->assertFileExists(public_path('favicon.ico'));
        $this->assertGreaterThan(0, (int) filesize(public_path('favicon.ico')));
    }
}

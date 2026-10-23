<?php

namespace Tests\Feature\Public;

use App\Services\SettingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Identitas toko di storefront: props bersama `settings` dan tag favicon
 * (kontrak props §1/§4, kartu t_101b9145).
 */
class StorefrontSettingsTest extends TestCase
{
    use RefreshDatabase;

    private function settings(): SettingService
    {
        return $this->app->make(SettingService::class);
    }

    public function test_props_bersama_selalu_memuat_identitas_toko_walau_tabel_kosong(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/Home', false)
                ->has('settings.store_name')
                ->has('settings.store_logo')
                ->has('settings.store_favicon')
                ->has('settings.footer_copyright')
            );
    }

    public function test_props_bersama_memakai_nilai_pengaturan(): void
    {
        $this->settings()->putMany([
            'store_name' => 'Daster Kulot Asli',
            'store_logo' => '/storage/settings/logo.png',
            'store_favicon' => '/storage/settings/favicon.png',
            'footer_copyright' => '© 2026 Daster Kulot Asli',
        ]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/Home', false)
                ->where('settings.store_name', 'Daster Kulot Asli')
                ->where('settings.store_logo', '/storage/settings/logo.png')
                ->where('settings.store_favicon', '/storage/settings/favicon.png')
                ->where('settings.footer_copyright', '© 2026 Daster Kulot Asli')
            );
    }

    public function test_key_midtrans_tidak_ikut_props_bersama(): void
    {
        $this->settings()->putMany([
            'midtrans_client_key' => 'SB-Mid-client-contoh',
            'midtrans_is_production' => true,
        ]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/Home', false)
                ->missing('settings.midtrans_client_key')
                ->missing('settings.midtrans_is_production')
            );
    }

    public function test_tag_favicon_memakai_store_favicon(): void
    {
        $this->settings()->put('store_favicon', '/storage/settings/favicon.png');

        $this->get('/')
            ->assertOk()
            ->assertSee('rel="icon"', false)
            ->assertSee('/storage/settings/favicon.png', false)
            ->assertSee('type="image/png"', false);
    }

    public function test_tag_favicon_jatuh_ke_favicon_ico_bila_kosong(): void
    {
        $this->settings()->put('store_favicon', null);

        $this->get('/')
            ->assertOk()
            ->assertSee('rel="icon"', false)
            ->assertSee('/favicon.ico', false)
            ->assertSee('type="image/x-icon"', false);
    }
}

<?php

namespace Tests\Feature\Catalog;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Halaman statis `/kontak-kami` (K11, kontrak props §11.3).
 */
class ContactPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_halaman_kontak_dapat_dibuka_tanpa_login(): void
    {
        $this->get('/kontak-kami')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Public/Contact', false));
    }

    public function test_halaman_kontak_memuat_props_bersama(): void
    {
        $this->get('/kontak-kami')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Contact', false)
                ->has('auth')
                ->has('flash')
                ->has('settings')
            );
    }
}

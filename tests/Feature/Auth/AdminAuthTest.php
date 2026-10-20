<?php

namespace Tests\Feature\Auth;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Autentikasi panel admin dan pemisahan tier (PRD §3, §5.2, §11;
 * kontrak docs/kontrak-props.md §6.10–§6.13).
 */
class AdminAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_halaman_masuk_admin_tampil(): void
    {
        // Argumen kedua `false`: berkas halaman dibuat kartu frontend (K13).
        $this->get('/admin/login')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Login', false));
    }

    public function test_admin_bisa_masuk_dan_membuka_dashboard(): void
    {
        $admin = Admin::factory()->create([
            'email' => 'owner@tokokulot.test',
            'password' => 'rahasia123',
        ]);

        $this->post('/admin/login', [
            'email' => 'owner@tokokulot.test',
            'password' => 'rahasia123',
        ])->assertRedirect('/admin');

        $this->assertAuthenticatedAs($admin, 'admin');

        $this->get('/admin')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Dashboard', false)
                ->has('stats.orders_total')
                ->has('stats.orders_pending')
                ->has('stats.revenue_total')
                ->has('stats.products_active'));
    }

    public function test_kredensial_admin_salah_ditolak(): void
    {
        Admin::factory()->create([
            'email' => 'owner@tokokulot.test',
            'password' => 'rahasia123',
        ]);

        $this->post('/admin/login', [
            'email' => 'owner@tokokulot.test',
            'password' => 'salah-total',
        ])->assertSessionHasErrors(['email' => 'Email atau kata sandi salah.']);

        $this->assertGuest('admin');
    }

    public function test_pembeli_tidak_boleh_masuk_lewat_login_admin(): void
    {
        User::factory()->create([
            'email' => 'pembeli@contoh.test',
            'password' => 'rahasia123',
        ]);

        $this->post('/admin/login', [
            'email' => 'pembeli@contoh.test',
            'password' => 'rahasia123',
        ])->assertSessionHasErrors(['email' => 'Email atau kata sandi salah.']);

        $this->assertGuest('admin');
    }

    public function test_admin_nonaktif_tidak_bisa_masuk(): void
    {
        Admin::factory()->nonaktif()->create([
            'email' => 'staff@tokokulot.test',
            'password' => 'rahasia123',
        ]);

        $this->post('/admin/login', [
            'email' => 'staff@tokokulot.test',
            'password' => 'rahasia123',
        ])->assertSessionHasErrors(['email' => 'Akun ini dinonaktifkan. Hubungi owner toko.']);

        $this->assertGuest('admin');
    }

    public function test_admin_nonaktif_yang_sudah_masuk_langsung_dikeluarkan(): void
    {
        $admin = Admin::factory()->nonaktif()->create();

        $this->actingAs($admin, 'admin')
            ->get('/admin')
            ->assertRedirect('/admin/login');

        $this->assertGuest('admin');
    }

    public function test_tamu_diarahkan_ke_login_admin(): void
    {
        $this->get('/admin')->assertRedirect('/admin/login');
    }

    public function test_pembeli_tidak_boleh_membuka_panel_admin(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->get('/admin')
            ->assertRedirect('/admin/login');
    }

    public function test_percobaan_masuk_admin_dibatasi_setelah_lima_kali(): void
    {
        Admin::factory()->create(['email' => 'owner@tokokulot.test']);

        for ($attempt = 1; $attempt <= 5; $attempt++) {
            $this->post('/admin/login', [
                'email' => 'owner@tokokulot.test',
                'password' => 'salah-terus',
            ])->assertStatus(302);
        }

        $response = $this->post('/admin/login', [
            'email' => 'owner@tokokulot.test',
            'password' => 'salah-terus',
        ]);

        $response->assertStatus(429);
        $this->assertNotNull($response->headers->get('Retry-After'));
        $this->assertGuest('admin');
    }

    public function test_admin_bisa_keluar(): void
    {
        $admin = Admin::factory()->create();

        $this->actingAs($admin, 'admin')
            ->post('/admin/logout')
            ->assertRedirect('/admin/login')
            ->assertSessionHas('success', 'Anda sudah keluar dari panel admin.');

        $this->assertGuest('admin');
    }

    public function test_keluar_sebagai_admin_tidak_menghapus_sesi_pembeli(): void
    {
        $user = User::factory()->create();
        $admin = Admin::factory()->create();

        $this->actingAs($user, 'web');
        $this->actingAs($admin, 'admin');

        $this->post('/admin/logout')->assertRedirect('/admin/login');

        $this->assertGuest('admin');
        $this->assertAuthenticatedAs($user, 'web');
    }

    public function test_admin_yang_sudah_masuk_diarahkan_dari_halaman_login(): void
    {
        $admin = Admin::factory()->create();

        $this->actingAs($admin, 'admin')
            ->get('/admin/login')
            ->assertRedirect('/admin');
    }
}

<?php

namespace Tests\Feature\Auth;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Login pembeli pada guard `web` (PRD §3, §5.1, §11; kontrak §6.3–§6.4, §6.9).
 */
class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_halaman_masuk_tampil(): void
    {
        // Argumen kedua `false`: berkas halaman dibuat kartu frontend (K12/K13).
        $this->get('/login')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Public/Auth/Login', false));
    }

    public function test_pembeli_bisa_masuk(): void
    {
        $user = User::factory()->create([
            'email' => 'pembeli@contoh.test',
            'password' => 'rahasia123',
        ]);

        $this->post('/login', [
            'email' => 'pembeli@contoh.test',
            'password' => 'rahasia123',
        ])->assertRedirect('/');

        $this->assertAuthenticatedAs($user, 'web');
    }

    public function test_kata_sandi_salah_ditolak_dengan_pesan_umum(): void
    {
        User::factory()->create([
            'email' => 'pembeli@contoh.test',
            'password' => 'rahasia123',
        ]);

        $this->post('/login', [
            'email' => 'pembeli@contoh.test',
            'password' => 'salah-total',
        ])->assertSessionHasErrors(['email' => 'Email atau kata sandi salah.']);

        $this->assertGuest('web');
    }

    public function test_email_tidak_terdaftar_ditolak_dengan_pesan_umum(): void
    {
        $this->post('/login', [
            'email' => 'tidak-ada@contoh.test',
            'password' => 'rahasia123',
        ])->assertSessionHasErrors(['email' => 'Email atau kata sandi salah.']);

        $this->assertGuest('web');
    }

    public function test_akun_admin_tidak_boleh_masuk_lewat_login_pembeli(): void
    {
        Admin::factory()->create([
            'email' => 'owner@tokokulot.test',
            'password' => 'rahasia123',
        ]);

        $this->post('/login', [
            'email' => 'owner@tokokulot.test',
            'password' => 'rahasia123',
        ])->assertSessionHasErrors(['email' => 'Email atau kata sandi salah.']);

        $this->assertGuest('web');
        $this->assertGuest('admin');
    }

    public function test_percobaan_masuk_dibatasi_setelah_lima_kali(): void
    {
        User::factory()->create(['email' => 'pembeli@contoh.test']);

        for ($attempt = 1; $attempt <= 5; $attempt++) {
            $this->post('/login', [
                'email' => 'pembeli@contoh.test',
                'password' => 'salah-terus',
            ])->assertStatus(302);
        }

        $response = $this->post('/login', [
            'email' => 'pembeli@contoh.test',
            'password' => 'salah-terus',
        ]);

        $response->assertStatus(429);
        $this->assertNotNull($response->headers->get('Retry-After'));
        $this->assertGuest('web');
    }

    public function test_pembeli_bisa_keluar(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->post('/logout')
            ->assertRedirect('/')
            ->assertSessionHas('success', 'Anda sudah keluar.');

        $this->assertGuest('web');
    }

    public function test_keluar_sebagai_pembeli_tidak_menghapus_sesi_admin(): void
    {
        $user = User::factory()->create();
        $admin = Admin::factory()->create();

        $this->actingAs($user, 'web');
        $this->actingAs($admin, 'admin');

        $this->post('/logout')->assertRedirect('/');

        $this->assertGuest('web');
        $this->assertAuthenticatedAs($admin, 'admin');
    }

    public function test_pembeli_yang_sudah_masuk_diarahkan_dari_halaman_masuk(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->get('/login')
            ->assertRedirect('/');
    }
}

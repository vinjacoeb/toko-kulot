<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Lupa dan reset sandi pembeli (PRD §5.1; kontrak docs/kontrak-props.md §6.5–§6.8).
 */
class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_halaman_lupa_sandi_tampil(): void
    {
        // Argumen kedua `false`: berkas halaman dibuat kartu frontend (K12/K13).
        $this->get('/forgot-password')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Public/Auth/ForgotPassword', false));
    }

    public function test_permintaan_reset_mengirim_tautan_dan_menyimpan_token(): void
    {
        Notification::fake();

        $user = User::factory()->create(['email' => 'pembeli@contoh.test']);

        $this->post('/forgot-password', ['email' => 'pembeli@contoh.test'])
            ->assertSessionHas('success', 'Jika email terdaftar, tautan reset sudah dikirim.')
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('password_reset_tokens', ['email' => 'pembeli@contoh.test']);
        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_email_tidak_terdaftar_dibalas_netral(): void
    {
        Notification::fake();

        $this->post('/forgot-password', ['email' => 'tidak-ada@contoh.test'])
            ->assertSessionHas('success', 'Jika email terdaftar, tautan reset sudah dikirim.')
            ->assertSessionHasNoErrors();

        $this->assertDatabaseCount('password_reset_tokens', 0);
        Notification::assertNothingSent();
    }

    public function test_email_tidak_valid_ditolak(): void
    {
        $this->post('/forgot-password', ['email' => 'bukan-email'])
            ->assertSessionHasErrors(['email' => 'Format email tidak valid.']);
    }

    public function test_halaman_reset_sandi_membawa_token_dan_email(): void
    {
        $this->get('/reset-password/token-contoh?email=pembeli%40contoh.test')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/Auth/ResetPassword', false)
                ->where('token', 'token-contoh')
                ->where('email', 'pembeli@contoh.test'));
    }

    public function test_reset_sandi_dengan_token_valid_berhasil(): void
    {
        $user = User::factory()->create([
            'email' => 'pembeli@contoh.test',
            'password' => 'lama12345',
        ]);

        $token = Password::broker('users')->createToken($user);

        $this->post('/reset-password', [
            'token' => $token,
            'email' => 'pembeli@contoh.test',
            'password' => 'baru123456',
            'password_confirmation' => 'baru123456',
        ])
            ->assertRedirect('/login')
            ->assertSessionHas('success', 'Kata sandi berhasil diperbarui. Silakan masuk.');

        $this->assertTrue(Hash::check('baru123456', $user->fresh()->password));
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => 'pembeli@contoh.test']);
    }

    public function test_reset_sandi_dengan_token_palsu_ditolak(): void
    {
        User::factory()->create([
            'email' => 'pembeli@contoh.test',
            'password' => 'lama12345',
        ]);

        $this->post('/reset-password', [
            'token' => 'token-palsu',
            'email' => 'pembeli@contoh.test',
            'password' => 'baru123456',
            'password_confirmation' => 'baru123456',
        ])->assertSessionHasErrors([
            'email' => 'Tautan reset tidak valid atau sudah kedaluwarsa.',
        ]);

        $user = User::query()->where('email', 'pembeli@contoh.test')->firstOrFail();
        $this->assertTrue(Hash::check('lama12345', $user->password));
    }

    public function test_reset_sandi_konfirmasi_tidak_cocok_ditolak(): void
    {
        $user = User::factory()->create(['email' => 'pembeli@contoh.test']);
        $token = Password::broker('users')->createToken($user);

        $this->post('/reset-password', [
            'token' => $token,
            'email' => 'pembeli@contoh.test',
            'password' => 'baru123456',
            'password_confirmation' => 'beda123456',
        ])->assertSessionHasErrors(['password' => 'Konfirmasi kata sandi tidak cocok.']);
    }
}

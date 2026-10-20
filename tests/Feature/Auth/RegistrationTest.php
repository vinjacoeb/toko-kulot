<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Pendaftaran pembeli (PRD §5.1, kontrak docs/kontrak-props.md §6.1–§6.2).
 */
class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_halaman_daftar_tampil(): void
    {
        // Argumen kedua `false`: berkas halaman dibuat kartu frontend (K12/K13),
        // jadi keberadaan berkas JSX belum diperiksa di sini.
        $this->get('/register')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Public/Auth/Register', false));
    }

    public function test_pembeli_bisa_mendaftar_dan_langsung_masuk(): void
    {
        $response = $this->post('/register', [
            'name' => 'Siti Aminah',
            'email' => 'Siti@Contoh.Test',
            'phone' => '0812-0000-0001',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
            'terms' => '1',
        ]);

        $response->assertRedirect('/');
        $response->assertSessionHas('success', 'Akun berhasil dibuat. Selamat berbelanja!');

        $this->assertAuthenticated('web');

        $user = User::query()->where('email', 'siti@contoh.test')->firstOrFail();
        $this->assertSame('Siti Aminah', $user->name);
        $this->assertSame('0812-0000-0001', $user->phone);
        $this->assertNotNull($user->email_verified_at, 'A4: akun langsung aktif tanpa verifikasi email.');
        $this->assertTrue(Hash::check('rahasia123', $user->password));
        $this->assertNotSame('rahasia123', $user->password, 'Kata sandi harus tersimpan sebagai hash.');
    }

    public function test_email_duplikat_ditolak(): void
    {
        User::factory()->create(['email' => 'sudah@contoh.test']);

        $this->post('/register', $this->payload(['email' => 'sudah@contoh.test']))
            ->assertSessionHasErrors(['email' => 'Email sudah terdaftar.']);

        $this->assertGuest('web');
        $this->assertSame(1, User::query()->count());
    }

    public function test_konfirmasi_kata_sandi_harus_cocok(): void
    {
        $this->post('/register', $this->payload(['password_confirmation' => 'beda12345']))
            ->assertSessionHasErrors(['password' => 'Konfirmasi kata sandi tidak cocok.']);

        $this->assertGuest('web');
    }

    public function test_syarat_dan_ketentuan_wajib_disetujui(): void
    {
        $payload = $this->payload();
        unset($payload['terms']);

        $this->post('/register', $payload)
            ->assertSessionHasErrors(['terms' => 'Anda harus menyetujui syarat dan ketentuan.']);

        $this->assertGuest('web');
    }

    public function test_nomor_whatsapp_tidak_valid_ditolak(): void
    {
        $this->post('/register', $this->payload(['phone' => 'bukan-nomor']))
            ->assertSessionHasErrors('phone');

        $this->assertGuest('web');
    }

    public function test_kata_sandi_kurang_dari_delapan_karakter_ditolak(): void
    {
        $this->post('/register', $this->payload([
            'password' => 'pendek',
            'password_confirmation' => 'pendek',
        ]))->assertSessionHasErrors(['password' => 'Kata sandi minimal 8 karakter.']);

        $this->assertGuest('web');
    }

    public function test_pembeli_yang_sudah_masuk_diarahkan_dari_halaman_daftar(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->get('/register')
            ->assertRedirect('/');
    }

    /**
     * @param  array<string, mixed>  $override
     * @return array<string, mixed>
     */
    private function payload(array $override = []): array
    {
        return array_merge([
            'name' => 'Pembeli Contoh',
            'email' => 'pembeli@contoh.test',
            'phone' => '081200000002',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
            'terms' => '1',
        ], $override);
    }
}

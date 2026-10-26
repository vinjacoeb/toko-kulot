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
        $response = $this->post('/register', $this->payload([
            'name' => 'Siti Aminah',
            'email' => 'Siti@Contoh.Test',
            'phone' => '0812-0000-0001',
        ]));

        $response->assertRedirect('/');
        $response->assertSessionHas('success', 'Akun berhasil dibuat. Selamat berbelanja!');

        $this->assertAuthenticated('web');

        $user = User::query()->where('email', 'siti@contoh.test')->firstOrFail();
        $this->assertSame('Siti Aminah', $user->name);
        $this->assertSame('0812-0000-0001', $user->phone);
        // PRD-v1.2 §3: alamat wajib saat register, dipakai mem-prefill checkout.
        $this->assertSame('Jl. Melati No. 12, RT 02 RW 03', $user->address);
        $this->assertSame('Pekalongan', $user->city);
        $this->assertSame('51111', $user->postal_code);
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

    public function test_kode_pos_empat_angka_ditolak(): void
    {
        $this->post('/register', $this->payload(['postal_code' => '5111']))
            ->assertSessionHasErrors(['postal_code' => 'Kode pos harus 5 angka.']);

        $this->assertGuest('web');
        $this->assertSame(0, User::query()->count());
    }

    public function test_kode_pos_bukan_angka_ditolak(): void
    {
        $this->post('/register', $this->payload(['postal_code' => '5111A']))
            ->assertSessionHasErrors(['postal_code' => 'Kode pos harus 5 angka.']);

        $this->assertGuest('web');
    }

    public function test_alamat_kurang_dari_sepuluh_karakter_ditolak(): void
    {
        $this->post('/register', $this->payload(['address' => 'Jl. A']))
            ->assertSessionHasErrors(['address' => 'Alamat terlalu singkat. Tulis jalan, nomor, RT/RW.']);

        $this->assertGuest('web');
    }

    public function test_alamat_kota_dan_kode_pos_wajib_diisi(): void
    {
        $payload = $this->payload();
        unset($payload['address'], $payload['city'], $payload['postal_code']);

        $this->post('/register', $payload)
            ->assertSessionHasErrors([
                'address' => 'Alamat lengkap wajib diisi.',
                'city' => 'Kota wajib diisi.',
                'postal_code' => 'Kode pos wajib diisi.',
            ]);

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
            'address' => 'Jl. Melati No. 12, RT 02 RW 03',
            'city' => 'Pekalongan',
            'postal_code' => '51111',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
            'terms' => '1',
        ], $override);
    }
}

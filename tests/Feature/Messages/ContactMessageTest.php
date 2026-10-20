<?php

namespace Tests\Feature\Messages;

use App\Models\ContactMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Formulir kontak publik (PRD §8, kontrak props §9.2).
 */
class ContactMessageTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, string>
     */
    private function payload(): array
    {
        return [
            'name' => 'Rina',
            'email' => 'rina@example.test',
            'phone' => '081298765432',
            'subject' => 'Tanya ukuran',
            'message' => 'Apakah tersedia ukuran XXL?',
        ];
    }

    public function test_pesan_kontak_tersimpan_sebagai_belum_dibaca(): void
    {
        $this->post('/kontak-kami', $this->payload())
            ->assertRedirect('/kontak-kami')
            ->assertSessionHas('success');

        $this->assertDatabaseHas('contact_messages', [
            'name' => 'Rina',
            'email' => 'rina@example.test',
            'subject' => 'Tanya ukuran',
            'is_read' => false,
        ]);
    }

    public function test_honeypot_terisi_tidak_menyimpan_pesan(): void
    {
        $this->post('/kontak-kami', $this->payload() + ['website' => 'http://spam.example'])
            ->assertRedirect('/kontak-kami')
            ->assertSessionHas('success');

        $this->assertSame(0, ContactMessage::query()->count());
    }

    public function test_validasi_menolak_email_dan_pesan_kosong(): void
    {
        $this->post('/kontak-kami', [
            'name' => '',
            'email' => 'bukan-email',
            'subject' => '',
            'message' => '',
        ])->assertSessionHasErrors(['name', 'email', 'subject', 'message']);

        $this->assertSame(0, ContactMessage::query()->count());
    }

    public function test_batas_laju_tiga_pesan_per_menit_per_ip(): void
    {
        for ($i = 0; $i < 3; $i++) {
            $this->post('/kontak-kami', $this->payload())->assertRedirect('/kontak-kami');
        }

        $this->post('/kontak-kami', $this->payload())->assertStatus(429);

        $this->assertSame(3, ContactMessage::query()->count());
    }
}

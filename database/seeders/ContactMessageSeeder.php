<?php

namespace Database\Seeders;

use App\Models\ContactMessage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Pesan masuk contoh dari formulir kontak (2 belum dibaca, 1 sudah dibalas)
 * agar halaman /admin/pesan punya data awal.
 */
class ContactMessageSeeder extends Seeder
{
    /**
     * @var array<int, array{
     *     name: string, email: string, phone: string|null, subject: string,
     *     message: string, is_read: bool, admin_reply: string|null,
     *     replied_at: string|null, created_at: string
     * }>
     */
    private const MESSAGES = [
        [
            'name' => 'Rina Kusuma [CONTOH]',
            'email' => 'rina@example.test',
            'phone' => '081200000010',
            'subject' => 'Tanya stok kulot plisket warna krem',
            'message' => '[CONTOH] Selamat pagi, apakah kulot plisket warna krem masih tersedia ukuran L? '
                .'Kalau ambil 12 pcs bisa harga grosir?',
            'is_read' => false,
            'admin_reply' => null,
            'replied_at' => null,
            'created_at' => '2026-10-17 08:20:00',
        ],
        [
            'name' => 'Ahmad Fauzi [CONTOH]',
            'email' => 'ahmad@example.test',
            'phone' => '081200000011',
            'subject' => 'Cara jadi reseller',
            'message' => '[CONTOH] Saya tertarik jual lagi di marketplace. '
                .'Apakah ada syarat minimal pembelian untuk harga reseller?',
            'is_read' => false,
            'admin_reply' => null,
            'replied_at' => null,
            'created_at' => '2026-10-18 10:05:00',
        ],
        [
            'name' => 'Dewi Lestari [CONTOH]',
            'email' => 'dewi@example.test',
            'phone' => null,
            'subject' => 'Pesanan TK-20261016-0001',
            'message' => '[CONTOH] Nomor resi pesanan saya belum muncul di halaman pesanan. '
                .'Mohon dibantu dicek.',
            'is_read' => true,
            'admin_reply' => 'Sudah kami cek, resi akan tampil setelah paket diserahkan ke kurir.',
            'replied_at' => '2026-10-19 09:15:00',
            'created_at' => '2026-10-18 16:45:00',
        ],
    ];

    public function run(): void
    {
        DB::transaction(function (): void {
            foreach (self::MESSAGES as $data) {
                $message = ContactMessage::updateOrCreate(
                    ['email' => $data['email'], 'subject' => $data['subject']],
                    [
                        'name' => $data['name'],
                        'phone' => $data['phone'],
                        'message' => $data['message'],
                        'is_read' => $data['is_read'],
                        'admin_reply' => $data['admin_reply'],
                        'replied_at' => $data['replied_at'],
                        'ip' => null,
                    ],
                );

                DB::table('contact_messages')->where('id', $message->id)->update([
                    'created_at' => $data['created_at'],
                    'updated_at' => $data['replied_at'] ?? $data['created_at'],
                ]);
            }
        });
    }
}

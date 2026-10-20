<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * FAQ landing page (PRD §6 tabel `faqs`, dikelola di /admin/faq).
 * Urutan `sort_order` = urutan tampil di accordion.
 */
class FaqSeeder extends Seeder
{
    /**
     * @var array<int, array{question: string, answer: string}>
     */
    private const FAQS = [
        [
            'question' => 'Bagaimana cara memesan di Toko Kulot?',
            'answer' => 'Pilih produk dan varian (ukuran/warna), masukkan ke keranjang, lalu isi '
                .'data pengiriman di halaman checkout. Setelah itu Anda akan mendapat kode QRIS '
                .'untuk pembayaran. Pesanan diproses setelah pembayaran berhasil.',
        ],
        [
            'question' => 'Apakah ada harga grosir untuk reseller?',
            'answer' => 'Ada. Setiap produk punya harga grosir dengan minimal pembelian tertentu '
                .'(mulai 4 pcs untuk setelan, 6 pcs untuk daster dan kulot). Harga grosir otomatis '
                .'berlaku saat jumlah di keranjang mencapai minimal tersebut.',
        ],
        [
            'question' => 'Metode pembayaran apa yang tersedia?',
            'answer' => 'Pembayaran dilakukan dengan QRIS, sehingga bisa memakai semua e-wallet '
                .'dan mobile banking yang mendukung QRIS. Kode QRIS berlaku 15 menit setelah pesanan dibuat.',
        ],
        [
            'question' => 'Berapa lama pesanan dikirim?',
            'answer' => 'Pesanan dikemas pada hari yang sama untuk order sebelum pukul 15.00 WIB. '
                .'Estimasi pengiriman 1–2 hari untuk Jawa dan 2–4 hari untuk luar Jawa, tergantung ekspedisi.',
        ],
        [
            'question' => 'Bisa tukar ukuran kalau tidak pas?',
            'answer' => 'Bisa, dalam 3 hari setelah paket diterima dan label belum dilepas. '
                .'Hubungi kami lewat halaman Kontak Kami dengan menyertakan kode pesanan.',
        ],
        [
            'question' => 'Apakah stok selalu tersedia?',
            'answer' => 'Stok ditampilkan per varian di halaman produk. Jika muncul "Habis", '
                .'varian tersebut sedang kosong dan akan kami produksi ulang bila motifnya masih tersedia.',
        ],
    ];

    public function run(): void
    {
        DB::transaction(function (): void {
            foreach (self::FAQS as $index => $data) {
                Faq::updateOrCreate(
                    ['question' => $data['question']],
                    [
                        'answer' => $data['answer'],
                        'sort_order' => $index + 1,
                        'is_active' => true,
                    ],
                );
            }
        });
    }
}

<?php

namespace Database\Seeders;

use App\Models\Carousel;
use Database\Seeders\Concerns\WritesSeedImages;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Slide carousel landing page (PRD §6 tabel `carousels`, dikelola di /admin/carousel).
 * Gambar dibuat lokal oleh seeder, bukan diunduh dari internet (PRD §10).
 */
class CarouselSeeder extends Seeder
{
    use WritesSeedImages;

    /**
     * @var array<int, array{title: string, subtitle: string, link: string, button_text: string}>
     */
    private const SLIDES = [
        [
            'title' => 'Koleksi Daster Terbaru',
            'subtitle' => 'Motif batik dan bunga, bahan rayon adem untuk harian.',
            'link' => '/produk?kategori=daster',
            'button_text' => 'Lihat Daster',
        ],
        [
            'title' => 'Harga Grosir Mulai 4 Pcs',
            'subtitle' => 'Cocok untuk reseller dan toko kelontong.',
            'link' => '/produk?kategori=setelan',
            'button_text' => 'Belanja Grosir',
        ],
        [
            'title' => 'Kulot Plisket Favorit',
            'subtitle' => 'Pinggang karet, jatuh sempurna, tidak menerawang.',
            'link' => '/produk?kategori=kulot',
            'button_text' => 'Lihat Kulot',
        ],
    ];

    public function run(): void
    {
        DB::transaction(function (): void {
            foreach (self::SLIDES as $index => $data) {
                $sortOrder = $index + 1;

                $image = $this->seedImage(
                    'images/seed/carousel/slide-'.$sortOrder.'.png',
                    1600,
                    900,
                    $data['title'],
                );

                Carousel::updateOrCreate(
                    ['title' => $data['title']],
                    [
                        'subtitle' => $data['subtitle'],
                        'image' => $image,
                        'link' => $data['link'],
                        'button_text' => $data['button_text'],
                        'sort_order' => $sortOrder,
                        'is_active' => true,
                    ],
                );
            }
        });
    }
}

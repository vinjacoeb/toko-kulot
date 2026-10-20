<?php

namespace Database\Seeders;

use App\Models\Category;
use Database\Seeders\Concerns\WritesSeedImages;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Kategori contoh. Deskripsi diberi prefiks [CONTOH] agar baris seed mudah
 * dibersihkan tanpa menyentuh data pemilik (R13).
 */
class CategorySeeder extends Seeder
{
    use WritesSeedImages;

    /** @var array<int, array{slug: string, name: string, description: string, sort_order: int}> */
    private const CATEGORIES = [
        [
            'slug' => 'daster',
            'name' => 'Daster',
            'description' => '[CONTOH] Daster rayon dan batik untuk pemakaian harian, tersedia ukuran jumbo.',
            'sort_order' => 1,
        ],
        [
            'slug' => 'kulot',
            'name' => 'Kulot',
            'description' => '[CONTOH] Kulot plisket, linen, dan jeans stretch dengan pinggang karet nyaman.',
            'sort_order' => 2,
        ],
        [
            'slug' => 'setelan',
            'name' => 'Setelan',
            'description' => '[CONTOH] Setelan daster dan kulot satu paket, praktis untuk hadiah dan reseller.',
            'sort_order' => 3,
        ],
    ];

    public function run(): void
    {
        DB::transaction(function (): void {
            foreach (self::CATEGORIES as $data) {
                $image = $this->seedImage(
                    'images/seed/kategori/'.$data['slug'].'.png',
                    600,
                    800,
                    'KATEGORI '.$data['name'],
                );

                Category::updateOrCreate(
                    ['slug' => $data['slug']],
                    [
                        'name' => $data['name'],
                        'description' => $data['description'],
                        'image' => $image,
                        'sort_order' => $data['sort_order'],
                        'is_active' => true,
                    ],
                );
            }
        });
    }
}

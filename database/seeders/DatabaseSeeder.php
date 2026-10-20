<?php

namespace Database\Seeders;

use Database\Seeders\Concerns\VerifiesSeedData;
use Illuminate\Database\Seeder;

/**
 * Urutan seed mengikuti ketergantungan foreign key (PRD §6, docs/db.md §5):
 * admin & pembeli → settings → kategori → produk (gambar, varian, stok awal) →
 * konten landing (carousel, FAQ) → order (item, payment, movement `sale`) →
 * ulasan → keranjang → pesan kontak. Ditutup pemeriksaan yang gagal keras.
 *
 * Semua seeder idempoten: `php artisan db:seed` boleh dijalankan berulang (R13).
 */
class DatabaseSeeder extends Seeder
{
    use VerifiesSeedData;

    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            UserSeeder::class,
            SettingSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            CarouselSeeder::class,
            FaqSeeder::class,
            OrderSeeder::class,
            ReviewSeeder::class,
            CartSeeder::class,
            ContactMessageSeeder::class,
        ]);

        $this->verifySeedData();
    }
}

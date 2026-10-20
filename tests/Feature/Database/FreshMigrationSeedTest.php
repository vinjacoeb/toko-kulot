<?php

namespace Tests\Feature\Database;

use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * DoD global 15.1: `php artisan migrate:fresh --seed` harus berhasil di environment
 * bersih dan mengisi data contoh yang cukup untuk menjalankan alur utama — K15.
 *
 * Sengaja tidak memakai `RefreshDatabase`: test ini memang menguji ulang proses
 * migrasi + seeding dari nol pada database uji (SQLite in-memory).
 */
class FreshMigrationSeedTest extends TestCase
{
    public function test_migrate_fresh_seed_berhasil(): void
    {
        $this->artisan('migrate:fresh', ['--seed' => true])->assertSuccessful();
    }

    public function test_seeder_mengisi_data_contoh_untuk_alur_utama(): void
    {
        $this->artisan('migrate:fresh', ['--seed' => true])->assertSuccessful();

        $this->assertGreaterThan(0, DB::table('admins')->count(), 'Minimal satu akun admin (owner) harus tersedia.');
        $this->assertGreaterThan(0, DB::table('categories')->count(), 'Data contoh kategori dibutuhkan untuk menguji katalog.');
        $this->assertGreaterThan(0, DB::table('products')->count(), 'Data contoh produk dibutuhkan untuk menguji katalog.');
        $this->assertGreaterThan(0, DB::table('product_variants')->count(), 'Varian dibutuhkan untuk menguji stok dan checkout.');
        $this->assertGreaterThan(0, DB::table('settings')->count(), 'Pengaturan dasar dibutuhkan agar halaman publik tidak kosong.');
        $this->assertGreaterThan(0, DB::table('faqs')->count(), 'FAQ dibutuhkan untuk menguji beranda.');
    }

    public function test_seeder_dapat_dijalankan_dua_kali_tanpa_duplikasi(): void
    {
        $this->artisan('migrate:fresh', ['--seed' => true])->assertSuccessful();
        $sebelum = DB::table('products')->count();

        $this->artisan('db:seed')->assertSuccessful();

        $this->assertSame($sebelum, DB::table('products')->count(), 'Seeder harus idempoten (firstOrCreate/updateOrCreate).');
    }

    public function test_struktur_tabel_wajib_prd_6_tersedia(): void
    {
        $this->artisan('migrate:fresh', ['--seed' => true])->assertSuccessful();

        $wajib = [
            'users', 'admins', 'password_reset_tokens', 'categories', 'products',
            'product_images', 'product_variants', 'stock_movements', 'carts', 'cart_items',
            'orders', 'order_items', 'payments', 'reviews', 'contact_messages',
            'settings', 'carousels', 'faqs',
        ];

        $hilang = array_values(array_filter(
            $wajib,
            fn (string $tabel) => ! DB::getSchemaBuilder()->hasTable($tabel)
        ));

        $this->assertSame([], $hilang, "Tabel wajib PRD §6 belum ada:\n".implode("\n", $hilang));
    }
}

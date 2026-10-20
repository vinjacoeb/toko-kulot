<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Pembeli contoh. Email memakai domain `.test` agar jelas data demo dan tidak
 * bentrok dengan data pemilik. Password plaintext di-hash oleh cast `hashed`.
 */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            User::updateOrCreate(
                ['email' => 'budi@example.test'],
                [
                    'name' => 'Budi Santoso [CONTOH]',
                    'password' => 'password',
                    'phone' => '081200000002',
                    'address' => '[CONTOH] Jl. Melati No. 12, Kel. Kergon',
                    'city' => 'Pekalongan',
                    'postal_code' => '51111',
                ],
            );

            User::updateOrCreate(
                ['email' => 'sari@example.test'],
                [
                    'name' => 'Sari Wulandari [CONTOH]',
                    'password' => 'password',
                    'phone' => '081200000003',
                    'address' => '[CONTOH] Jl. Kenanga No. 4, Kel. Bendan',
                    'city' => 'Pekalongan',
                    'postal_code' => '51119',
                ],
            );
        });
    }
}

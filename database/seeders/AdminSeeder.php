<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Akun admin awal (PRD §14 A11) + satu akun staf contoh.
 * Password plaintext di-hash otomatis oleh cast `hashed` pada model Admin.
 * Kredensial lokal dicatat di docs/akun-dev.md — wajib diganti pemilik.
 */
class AdminSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            Admin::updateOrCreate(
                ['email' => 'admin@tokokulot.test'],
                [
                    'name' => 'Owner Toko Kulot',
                    'password' => 'Admin#12345',
                    'role' => Admin::ROLE_OWNER,
                    'is_active' => true,
                ],
            );

            Admin::updateOrCreate(
                ['email' => 'staff@tokokulot.test'],
                [
                    'name' => 'Staff Gudang [CONTOH]',
                    'password' => 'Staff#12345',
                    'role' => Admin::ROLE_STAFF,
                    'is_active' => true,
                ],
            );
        });
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Nomor resi manual pada pesanan (PRD A15; keputusan `docs/keputusan-a15-resi.md` §1).
 * Diisi admin di detail pesanan `/admin/pesanan/{order}`; `null` = belum diisi.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('tracking_number', 60)->nullable()->after('paid_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('tracking_number');
        });
    }
};

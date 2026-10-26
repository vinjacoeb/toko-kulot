<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Riwayat event webhook Biteship untuk timeline pembeli (PRD-v1.4 §4.1, kartu `t_f51f8c36`).
 *
 * `shipping_events` = daftar `{event, status, at}` urut lama → baru, maks 50 entri.
 * `shipping_webhook_payload` tetap menyimpan payload terakhir (tidak berubah).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->json('shipping_events')->nullable()->after('shipping_webhook_payload');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropColumn('shipping_events');
        });
    }
};

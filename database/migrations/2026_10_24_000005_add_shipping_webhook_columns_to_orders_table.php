<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Dua kolom webhook Biteship (PRD-v1.3 §2.5, kartu `t_2c6be520`).
 *
 * `shipping_updated_at` = waktu payload shipping terakhir diterapkan.
 * `shipping_webhook_payload` = payload webhook terakhir (mentah), bukan riwayat.
 * `shipping_payload` (jawaban create order) tidak pernah ditimpa webhook.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->timestamp('shipping_updated_at')->nullable()->after('shipped_at');
            $table->json('shipping_webhook_payload')->nullable()->after('shipping_updated_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropColumn(['shipping_webhook_payload', 'shipping_updated_at']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Resi otomatis Biteship pada `orders` (PRD-v1.2 §8 / F7).
 *
 * `biteship_order_id` = penanda idempoten: klik kedua tidak memanggil API lagi.
 * `shipping_payload` menyimpan jawaban Biteship utuh (termasuk `mode_uji`).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->string('biteship_order_id', 60)->nullable()->after('tracking_number');
            $table->string('shipping_status', 30)->nullable()->after('biteship_order_id');
            $table->json('shipping_payload')->nullable()->after('shipping_status');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropColumn(['biteship_order_id', 'shipping_status', 'shipping_payload']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Kolom ongkir Biteship pada `orders` (PRD v1.1 D2/D3): layanan yang dipilih
 * pembeli, berat saat checkout, dan penanda gratis ongkir.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->string('shipping_courier', 40)->nullable()->after('shipping_cost');
            $table->string('shipping_service', 60)->nullable()->after('shipping_courier');
            $table->string('shipping_etd', 30)->nullable()->after('shipping_service');
            $table->unsignedInteger('shipping_weight_gram')->nullable()->after('shipping_etd');
            $table->boolean('shipping_is_free')->default(false)->after('shipping_weight_gram');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropColumn([
                'shipping_courier',
                'shipping_service',
                'shipping_etd',
                'shipping_weight_gram',
                'shipping_is_free',
            ]);
        });
    }
};

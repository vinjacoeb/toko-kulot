<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * K11 — harga coret (sebelum diskon) untuk katalog `/produk` dan detail `/produk/{slug}`.
 * Dipakai `PriceBlock` (badge diskon) lewat key `compare_price` di kontrak §8.3 / §11.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedBigInteger('compare_price')->nullable()->after('base_price');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('compare_price');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Produk — PRD §6 tabel `products`. Harga integer rupiah (PRD §4.3).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')
                ->constrained('categories')
                ->restrictOnDelete();
            $table->string('name', 180);
            $table->string('slug', 200)->unique();
            $table->string('sku', 60)->nullable();
            $table->longText('description')->nullable();
            $table->string('short_description', 500)->nullable();
            $table->unsignedBigInteger('base_price')->default(0);
            $table->unsignedBigInteger('wholesale_price')->nullable();
            $table->unsignedInteger('min_wholesale_qty')->default(0);
            $table->unsignedInteger('weight_gram')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->decimal('rating_avg', 3, 2)->default(0);
            $table->unsignedInteger('rating_count')->default(0);
            $table->timestamps();

            $table->index(['category_id', 'is_active']);
            $table->index(['is_active', 'is_featured']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};

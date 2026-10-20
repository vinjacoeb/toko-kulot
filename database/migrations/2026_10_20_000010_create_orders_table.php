<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pesanan — PRD §6 tabel `orders`.
 * Status order: pending|dibayar|diproses|dikirim|selesai|batal (PRD §7).
 * Status pembayaran: pending|settlement|expire|deny|cancel (PRD §6, §8).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('code', 30)->unique();
            $table->string('status', 20)->default('pending');
            $table->unsignedBigInteger('subtotal')->default(0);
            $table->unsignedBigInteger('shipping_cost')->default(0);
            $table->unsignedBigInteger('discount')->default(0);
            $table->unsignedBigInteger('total')->default(0);
            $table->string('payment_method', 20)->default('qris');
            $table->string('payment_status', 20)->default('pending');
            $table->string('customer_name', 120);
            $table->string('customer_phone', 30);
            $table->string('customer_email', 180)->nullable();
            $table->text('shipping_address');
            $table->string('city', 100);
            $table->string('postal_code', 10)->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index(['payment_status', 'created_at']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};

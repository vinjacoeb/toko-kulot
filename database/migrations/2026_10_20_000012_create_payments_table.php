<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pembayaran QRIS Midtrans — PRD §6 tabel `payments`, §8.
 * `order_id_midtrans` = order id yang dikirim ke Midtrans (= orders.code),
 * disimpan terpisah agar idempotensi webhook bisa dicocokkan tanpa join.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')
                ->constrained('orders')
                ->cascadeOnDelete();
            $table->string('provider', 20)->default('midtrans');
            $table->string('transaction_id', 100)->nullable()->index();
            $table->string('order_id_midtrans', 60)->nullable()->index();
            $table->text('qris_url')->nullable();
            $table->text('qr_string')->nullable();
            $table->unsignedBigInteger('gross_amount')->default(0);
            $table->string('status', 20)->default('pending');
            $table->json('payload')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

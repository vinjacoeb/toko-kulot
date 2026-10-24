<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Kolom Snap Midtrans pada `payments` — PRD-v1.1 §2 (D1).
 *
 * Migrasi lama tidak diubah (aturan kartu). `payment_type` diisi dari payload
 * webhook Midtrans (`bank_transfer`, `echannel`, `qris`, `gopay`, …).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('snap_token', 255)->nullable()->after('order_id_midtrans');
            $table->text('snap_redirect_url')->nullable()->after('snap_token');
            $table->string('payment_type', 40)->nullable()->after('snap_redirect_url');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['snap_token', 'snap_redirect_url', 'payment_type']);
        });
    }
};

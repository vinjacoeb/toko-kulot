<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Waktu kirim pesanan untuk timeline riwayat & detail admin (design-v1.2 §9.3, K4).
 *
 * Diisi `OrderService::changeStatusByAdmin` saat status menjadi `dikirim`; pesanan lama
 * dibiarkan `null` (timeline menampilkan `—`, bukan tanggal karangan).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->timestamp('shipped_at')->nullable()->after('paid_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropColumn('shipped_at');
        });
    }
};

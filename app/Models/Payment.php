<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Pembayaran QRIS Midtrans — PRD §6 tabel `payments`, §8.
 */
class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'provider',
        'transaction_id',
        'order_id_midtrans',
        'qris_url',
        'qr_string',
        'gross_amount',
        'status',
        'payload',
        'paid_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'order_id' => 'integer',
            'gross_amount' => 'integer',
            'payload' => 'array',
            'paid_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Audit pergerakan stok — PRD §6 tabel `stock_movements`.
 * Tipe: in (stok masuk), out (stok keluar), adjust (koreksi), sale (penjualan).
 */
class StockMovement extends Model
{
    use HasFactory;

    public const TYPE_IN = 'in';

    public const TYPE_OUT = 'out';

    public const TYPE_ADJUST = 'adjust';

    public const TYPE_SALE = 'sale';

    /** @var array<string, string> */
    public const TYPE_LABELS = [
        self::TYPE_IN => 'Stok masuk',
        self::TYPE_OUT => 'Stok keluar',
        self::TYPE_ADJUST => 'Penyesuaian',
        self::TYPE_SALE => 'Penjualan',
    ];

    public static function typeLabel(?string $type): string
    {
        return self::TYPE_LABELS[$type ?? ''] ?? 'Tidak dikenal';
    }

    /**
     * `qty` bertanda untuk riwayat (kontrak props §12.15): masuk positif,
     * keluar/penjualan negatif, penyesuaian mengikuti selisih yang tersimpan.
     */
    public function signedQty(): int
    {
        $qty = (int) $this->qty;

        return match ($this->type) {
            self::TYPE_IN => abs($qty),
            self::TYPE_OUT, self::TYPE_SALE => -abs($qty),
            default => $qty,
        };
    }

    protected $fillable = [
        'product_variant_id',
        'type',
        'qty',
        'note',
        'admin_id',
    ];

    protected function casts(): array
    {
        return [
            'product_variant_id' => 'integer',
            'qty' => 'integer',
            'admin_id' => 'integer',
        ];
    }

    public function productVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(Admin::class);
    }
}

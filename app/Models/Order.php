<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Pesanan — PRD §6 tabel `orders`.
 * Status order: pending → dibayar → diproses → dikirim → selesai | batal (PRD §7).
 * Status pembayaran: pending | settlement | expire | deny | cancel (PRD §6, §8).
 * Nomor resi (`tracking_number`) diisi manual admin — PRD A15, kontrak props §12.18a.
 */
class Order extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_PAID = 'dibayar';

    public const STATUS_PROCESSING = 'diproses';

    public const STATUS_SHIPPED = 'dikirim';

    public const STATUS_COMPLETED = 'selesai';

    public const STATUS_CANCELLED = 'batal';

    public const PAYMENT_PENDING = 'pending';

    public const PAYMENT_SETTLEMENT = 'settlement';

    public const PAYMENT_EXPIRE = 'expire';

    public const PAYMENT_DENY = 'deny';

    public const PAYMENT_CANCEL = 'cancel';

    /** Rantai status pesanan (PRD §7): pending → dibayar → diproses → dikirim → selesai. */
    public const STATUS_FLOW = [
        self::STATUS_PENDING,
        self::STATUS_PAID,
        self::STATUS_PROCESSING,
        self::STATUS_SHIPPED,
        self::STATUS_COMPLETED,
    ];

    /**
     * Status order yang dihitung sebagai omzet (PRD §9 dashboard, kontrak props §6.13).
     * `pending` dan `batal` tidak pernah masuk omzet.
     */
    public const REVENUE_STATUSES = [
        self::STATUS_PAID,
        self::STATUS_PROCESSING,
        self::STATUS_SHIPPED,
        self::STATUS_COMPLETED,
    ];

    /** @var array<string, string> */
    public const STATUS_LABELS = [
        self::STATUS_PENDING => 'Pending',
        self::STATUS_PAID => 'Dibayar',
        self::STATUS_PROCESSING => 'Diproses',
        self::STATUS_SHIPPED => 'Dikirim',
        self::STATUS_COMPLETED => 'Selesai',
        self::STATUS_CANCELLED => 'Batal',
    ];

    /** @var array<string, string> */
    public const PAYMENT_LABELS = [
        self::PAYMENT_PENDING => 'Menunggu pembayaran',
        self::PAYMENT_SETTLEMENT => 'Lunas',
        self::PAYMENT_EXPIRE => 'Kedaluwarsa',
        self::PAYMENT_DENY => 'Ditolak',
        self::PAYMENT_CANCEL => 'Dibatalkan',
    ];

    public static function statusLabel(?string $status): string
    {
        return self::STATUS_LABELS[$status ?? ''] ?? 'Tidak dikenal';
    }

    public static function paymentLabel(?string $status): string
    {
        return self::PAYMENT_LABELS[$status ?? ''] ?? 'Tidak dikenal';
    }

    /**
     * Status yang boleh dipilih dari status sekarang (panel admin, kontrak props §12.17).
     *
     * @return list<string>
     */
    public function nextStatuses(): array
    {
        if ($this->isFinal()) {
            return [];
        }

        $index = array_search($this->status, self::STATUS_FLOW, true);

        if ($index === false) {
            return [];
        }

        $next = [];

        if (isset(self::STATUS_FLOW[$index + 1])) {
            $next[] = self::STATUS_FLOW[$index + 1];
        }

        $next[] = self::STATUS_CANCELLED;

        return $next;
    }

    /**
     * `true` bila status sudah final (selesai atau batal) sehingga tidak bisa diubah lagi.
     */
    public function isFinal(): bool
    {
        return in_array($this->status, [self::STATUS_COMPLETED, self::STATUS_CANCELLED], true);
    }

    protected $fillable = [
        'user_id',
        'code',
        'status',
        'subtotal',
        'shipping_cost',
        'discount',
        'total',
        'payment_method',
        'payment_status',
        'customer_name',
        'customer_phone',
        'customer_email',
        'shipping_address',
        'city',
        'postal_code',
        'notes',
        'paid_at',
        'tracking_number',
    ];

    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'subtotal' => 'integer',
            'shipping_cost' => 'integer',
            'discount' => 'integer',
            'total' => 'integer',
            'paid_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}

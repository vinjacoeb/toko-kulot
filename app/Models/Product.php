<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Produk — PRD §6 tabel `products`.
 * Harga disimpan sebagai integer rupiah tanpa desimal (PRD §4.3).
 */
class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'sku',
        'description',
        'short_description',
        'base_price',
        'compare_price',
        'wholesale_price',
        'min_wholesale_qty',
        'weight_gram',
        'is_active',
        'is_featured',
        'rating_avg',
        'rating_count',
    ];

    protected function casts(): array
    {
        return [
            'category_id' => 'integer',
            'base_price' => 'integer',
            'compare_price' => 'integer',
            'wholesale_price' => 'integer',
            'min_wholesale_qty' => 'integer',
            'weight_gram' => 'integer',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'rating_avg' => 'decimal:2',
            'rating_count' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    /**
     * Harga satuan untuk kuantitas tertentu: harga grosir aktif bila
     * qty >= min_wholesale_qty dan wholesale_price terisi (PRD §7.1, A3).
     */
    public function priceForQty(int $qty): int
    {
        if ($this->wholesale_price !== null
            && $this->min_wholesale_qty > 0
            && $qty >= $this->min_wholesale_qty) {
            return (int) $this->wholesale_price;
        }

        return (int) $this->base_price;
    }

    /**
     * Harga coret hanya bermakna bila di atas harga jual (kontrak §8.3, `PriceBlock`).
     */
    public function hasDiscount(): bool
    {
        return $this->compare_price !== null && (int) $this->compare_price > (int) $this->base_price;
    }
}

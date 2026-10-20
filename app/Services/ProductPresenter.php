<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Review;
use App\Support\VariantSize;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * Satu-satunya tempat yang menerjemahkan model `Product` menjadi bentuk produk
 * publik (docs/kontrak-props.md §8.3). Dipakai beranda (K-beranda) dan katalog
 * `/produk` (K11) supaya tidak ada dua bentuk produk yang berbeda.
 *
 * Uang tetap integer rupiah (PRD §4.3); `rating_avg` dikonversi ke angka karena
 * cast `decimal:2` di model mengembalikan string.
 */
class ProductPresenter
{
    /** Relasi minimum bentuk produk publik. */
    public const RELATIONS = ['category:id,name,slug', 'images', 'variants'];

    /** Jumlah ulasan yang dikirim di halaman detail (kontrak §11.2). */
    public const REVIEW_LIMIT = 20;

    /**
     * Query produk yang sudah memuat relasi dan total stok varian aktif
     * (alias `stock_total`). Pemanggil menambah filter/urut/limit sendiri.
     */
    public function query(): Builder
    {
        return Product::query()
            ->with(self::RELATIONS)
            ->withSum(
                ['variants as stock_total' => fn (Builder $query) => $query->where('is_active', true)],
                'stock'
            );
    }

    /**
     * @param  iterable<int, Product>  $products
     * @return array<int, array<string, mixed>>
     */
    public function cards(iterable $products): array
    {
        $cards = [];

        foreach ($products as $product) {
            $cards[] = $this->card($product);
        }

        return $cards;
    }

    /**
     * @return array<string, mixed>
     */
    public function card(Product $product): array
    {
        return [
            'id' => (int) $product->id,
            'slug' => $product->slug,
            'name' => $product->name,
            'sku' => $product->sku,
            'url' => '/produk/'.$product->slug,
            'short_description' => $product->short_description,
            'base_price' => (int) $product->base_price,
            'compare_price' => $product->compare_price === null ? null : (int) $product->compare_price,
            'wholesale_price' => $product->wholesale_price === null ? null : (int) $product->wholesale_price,
            'min_wholesale_qty' => (int) $product->min_wholesale_qty,
            'rating_avg' => round((float) $product->rating_avg, 2),
            'rating_count' => (int) $product->rating_count,
            'stock' => $this->stock($product),
            'is_featured' => (bool) $product->is_featured,
            'category' => [
                'id' => (int) $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug,
            ],
            'images' => $this->images($product),
            'variants' => $this->variants($product),
        ];
    }

    /**
     * Produk halaman detail: kartu + key khusus detail (kontrak §11.2).
     *
     * @return array<string, mixed>
     */
    public function detail(Product $product): array
    {
        return array_merge($this->card($product), [
            'description' => $product->description,
            'care' => null,
            'shipping_return' => null,
            'rating_distribution' => $this->ratingDistribution($product),
            'reviews' => $this->reviews($product),
        ]);
    }

    /**
     * Total stok varian aktif. Memakai `stock_total` bila query() sudah dipakai,
     * supaya daftar produk tidak menembak satu query per baris.
     */
    private function stock(Product $product): int
    {
        $total = $product->getAttribute('stock_total');

        if ($total === null) {
            $total = $product->variants()->where('is_active', true)->sum('stock');
        }

        return (int) $total;
    }

    /**
     * Varian aktif, urut ukuran baku lalu warna lalu id (kontrak §8.3).
     *
     * @return array<int, array<string, mixed>>
     */
    private function variants(Product $product): array
    {
        /** @var Collection<int, \App\Models\ProductVariant> $variants */
        $variants = $product->relationLoaded('variants')
            ? $product->variants->where('is_active', true)
            : $product->variants()->where('is_active', true)->get();

        $sorted = $variants
            ->sort(fn ($a, $b) => [
                VariantSize::rank($a->size),
                strtoupper((string) $a->color),
                (int) $a->id,
            ] <=> [
                VariantSize::rank($b->size),
                strtoupper((string) $b->color),
                (int) $b->id,
            ])
            ->values();

        return $sorted->map(fn ($variant) => [
            'id' => (int) $variant->id,
            'size' => $variant->size,
            'color' => $variant->color,
            'sku' => $variant->sku,
            'price_delta' => (int) $variant->price_delta,
            'stock' => (int) $variant->stock,
            'is_active' => (bool) $variant->is_active,
        ])->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function images(Product $product): array
    {
        /** @var Collection<int, \App\Models\ProductImage> $images */
        $images = $product->relationLoaded('images')
            ? $product->images->sortBy([['sort_order', 'asc'], ['id', 'asc']])->values()
            : $product->images()->orderBy('sort_order')->orderBy('id')->get();

        return $images->map(fn ($image) => [
            'id' => (int) $image->id,
            'path' => $image->path,
            'alt' => $image->alt,
            'is_primary' => (bool) $image->is_primary,
            'sort_order' => (int) $image->sort_order,
        ])->all();
    }

    /**
     * Sebaran bintang ulasan tampil: key `"5"`…`"1"`, key kosong = 0 (kontrak §11.2).
     *
     * @return array<string, int>
     */
    private function ratingDistribution(Product $product): array
    {
        $counts = Review::query()
            ->where('product_id', $product->id)
            ->where('is_visible', true)
            ->selectRaw('rating, count(*) as total')
            ->groupBy('rating')
            ->pluck('total', 'rating');

        $distribution = [];

        foreach ([5, 4, 3, 2, 1] as $star) {
            $distribution[(string) $star] = (int) ($counts[$star] ?? 0);
        }

        return $distribution;
    }

    /**
     * Ulasan tampil terbaru (kontrak §11.2).
     *
     * @return array<int, array<string, mixed>>
     */
    private function reviews(Product $product): array
    {
        $reviews = Review::query()
            ->with('user:id,name')
            ->where('product_id', $product->id)
            ->where('is_visible', true)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit(self::REVIEW_LIMIT)
            ->get();

        return $reviews->map(fn (Review $review) => [
            'id' => (int) $review->id,
            'user_name' => $review->user?->name ?? 'Pembeli',
            'rating' => (int) $review->rating,
            'comment' => $review->comment,
            'created_at' => $review->created_at?->toIso8601String(),
            'reply' => $review->admin_reply,
        ])->all();
    }
}

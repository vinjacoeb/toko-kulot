<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Review;
use Illuminate\Support\Carbon;

/**
 * Agregasi dashboard admin `/admin` (PRD §9, kontrak props §6.13).
 *
 * Semua angka dibaca langsung dari tabel pada setiap request — tidak ada cache, supaya
 * dashboard tidak pernah menampilkan nilai basi setelah order/stok/ulasan berubah.
 */
class DashboardService
{
    /** Batas stok kritis (PRD §9): varian dengan stok < 5 ditampilkan. */
    public const LOW_STOCK_THRESHOLD = 5;

    /** Jumlah baris "Stok kritis" di dashboard (design §5.11). */
    public const LOW_STOCK_LIMIT = 5;

    /** Panjang grafik penjualan (PRD §9: 14 hari). */
    public const SALES_WINDOW_DAYS = 14;

    /** Jumlah baris "Pesanan terbaru" dan "Ulasan terbaru" (PRD §9). */
    public const RECENT_LIMIT = 5;

    /**
     * Seluruh props dashboard dalam satu snapshot waktu.
     *
     * @return array{
     *     stats: array{orders_total: int, orders_pending: int, revenue_total: int, products_active: int},
     *     sales_14d: list<array{date: string, total: int}>,
     *     low_stock: list<array{id: int, product_name: string|null, size: string|null, color: string|null, stock: int}>,
     *     recent_orders: list<array{id: int, code: string, customer_name: string, total: int, status: string, created_at: string|null}>,
     *     recent_reviews: list<array{id: int, user_name: string|null, product_name: string|null, rating: int, comment: string|null, created_at: string|null}>,
     *     updated_at: string
     * }
     */
    public function snapshot(): array
    {
        $generatedAt = Carbon::now();

        return [
            'stats' => $this->stats(),
            'sales_14d' => $this->salesLast14Days($generatedAt),
            'low_stock' => $this->lowStock(),
            'recent_orders' => $this->recentOrders(),
            'recent_reviews' => $this->recentReviews(),
            'updated_at' => $generatedAt->toIso8601String(),
        ];
    }

    /**
     * Kartu KPI. `revenue_total` memakai daftar status omzet tunggal di model Order.
     *
     * @return array{orders_total: int, orders_pending: int, revenue_total: int, products_active: int}
     */
    public function stats(): array
    {
        return [
            'orders_total' => Order::query()->count(),
            'orders_pending' => Order::query()->where('status', Order::STATUS_PENDING)->count(),
            'revenue_total' => (int) Order::query()->whereIn('status', Order::REVENUE_STATUSES)->sum('total'),
            'products_active' => Product::query()->where('is_active', true)->count(),
        ];
    }

    /**
     * Grafik penjualan 14 hari terakhir, urut lama → baru, tanggal kosong tetap dikirim (0).
     *
     * @return list<array{date: string, total: int}>
     */
    public function salesLast14Days(?Carbon $today = null): array
    {
        $day = ($today ?? Carbon::now())->copy()->startOfDay();
        $start = $day->copy()->subDays(self::SALES_WINDOW_DAYS - 1);

        $totals = Order::query()
            ->whereIn('status', Order::REVENUE_STATUSES)
            ->whereBetween('created_at', [$start, $day->copy()->endOfDay()])
            ->selectRaw('DATE(created_at) as tanggal, COALESCE(SUM(total), 0) as total')
            ->groupBy('tanggal')
            ->pluck('total', 'tanggal');

        $series = [];

        for ($offset = self::SALES_WINDOW_DAYS - 1; $offset >= 0; $offset--) {
            $date = $day->copy()->subDays($offset)->toDateString();
            $series[] = [
                'date' => $date,
                'total' => (int) ($totals[$date] ?? 0),
            ];
        }

        return $series;
    }

    /**
     * Varian aktif dari produk aktif dengan stok < 5, urut paling kritis dulu.
     *
     * @return list<array{id: int, product_name: string|null, size: string|null, color: string|null, stock: int}>
     */
    public function lowStock(): array
    {
        return ProductVariant::query()
            ->with(['product:id,name'])
            ->where('is_active', true)
            ->where('stock', '<', self::LOW_STOCK_THRESHOLD)
            ->whereHas('product', fn ($product) => $product->where('is_active', true))
            ->orderBy('stock')
            ->orderBy('id')
            ->limit(self::LOW_STOCK_LIMIT)
            ->get()
            ->map(fn (ProductVariant $variant): array => [
                'id' => (int) $variant->id,
                'product_name' => $variant->product?->name,
                'size' => $variant->size,
                'color' => $variant->color,
                'stock' => (int) $variant->stock,
            ])
            ->all();
    }

    /**
     * Lima pesanan terbaru, semua status (termasuk batal) agar admin melihat kondisi nyata.
     *
     * @return list<array{id: int, code: string, customer_name: string, total: int, status: string, created_at: string|null}>
     */
    public function recentOrders(): array
    {
        return Order::query()
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit(self::RECENT_LIMIT)
            ->get(['id', 'code', 'customer_name', 'total', 'status', 'created_at'])
            ->map(fn (Order $order): array => [
                'id' => (int) $order->id,
                'code' => $order->code,
                'customer_name' => $order->customer_name,
                'total' => (int) $order->total,
                'status' => $order->status,
                'created_at' => $order->created_at?->toIso8601String(),
            ])
            ->all();
    }

    /**
     * Lima ulasan terbaru, termasuk yang disembunyikan karena panel admin memoderasinya.
     *
     * @return list<array{id: int, user_name: string|null, product_name: string|null, rating: int, comment: string|null, created_at: string|null}>
     */
    public function recentReviews(): array
    {
        return Review::query()
            ->with(['user:id,name', 'product:id,name'])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit(self::RECENT_LIMIT)
            ->get()
            ->map(fn (Review $review): array => [
                'id' => (int) $review->id,
                'user_name' => $review->user?->name,
                'product_name' => $review->product?->name,
                'rating' => (int) $review->rating,
                'comment' => $review->comment,
                'created_at' => $review->created_at?->toIso8601String(),
            ])
            ->all();
    }
}

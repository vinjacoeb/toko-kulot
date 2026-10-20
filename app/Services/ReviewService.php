<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Penilaian pasca checkout (PRD §7.3).
 *
 * Aturan yang dijaga di sini:
 * - hanya order yang sudah dibayar/lunas yang bisa dinilai;
 * - produk harus benar-benar ada di order tersebut;
 * - satu produk satu ulasan per order;
 * - `products.rating_avg` / `rating_count` dihitung ulang setiap ulasan tersimpan
 *   atau saat visibilitasnya diubah.
 */
class ReviewService
{
    /** Batas jumlah produk yang boleh dinilai dalam satu kiriman. */
    public const MAX_PER_SUBMIT = 20;

    /**
     * Status order yang dianggap sudah boleh dinilai (PRD §7.3).
     *
     * @var array<int, string>
     */
    private const REVIEWABLE_STATUSES = [
        Order::STATUS_PAID,
        Order::STATUS_PROCESSING,
        Order::STATUS_SHIPPED,
        Order::STATUS_COMPLETED,
    ];

    public function isEligible(Order $order): bool
    {
        return $order->payment_status === Order::PAYMENT_SETTLEMENT
            && in_array($order->status, self::REVIEWABLE_STATUSES, true);
    }

    /**
     * Simpan sekumpulan ulasan untuk satu order.
     *
     * @param  array<int, array{product_id: mixed, rating: mixed, comment?: mixed}>  $items
     * @return int jumlah ulasan yang tersimpan
     *
     * @throws ValidationException bila produk bukan milik order atau sudah dinilai
     */
    public function store(Order $order, User $user, array $items): int
    {
        return DB::transaction(function () use ($order, $user, $items): int {
            $orderProductIds = $order->items()
                ->pluck('product_id')
                ->map(fn ($id): int => (int) $id)
                ->unique()
                ->values()
                ->all();

            $existing = Review::query()
                ->where('order_id', $order->id)
                ->pluck('product_id')
                ->map(fn ($id): int => (int) $id)
                ->all();

            $errors = [];
            $accepted = [];

            foreach (array_values($items) as $index => $item) {
                $productId = (int) ($item['product_id'] ?? 0);

                if (! in_array($productId, $orderProductIds, true)) {
                    $errors["ulasan.{$index}.product_id"] = 'Produk ini bukan bagian dari pesanan Anda.';

                    continue;
                }

                if (in_array($productId, $existing, true) || in_array($productId, array_column($accepted, 'product_id'), true)) {
                    $errors["ulasan.{$index}.product_id"] = 'Produk ini sudah Anda nilai.';

                    continue;
                }

                $comment = isset($item['comment']) ? trim((string) $item['comment']) : '';

                $accepted[] = [
                    'product_id' => $productId,
                    'rating' => (int) $item['rating'],
                    'comment' => $comment === '' ? null : $comment,
                ];
            }

            if ($errors !== []) {
                throw ValidationException::withMessages($errors);
            }

            foreach ($accepted as $row) {
                Review::query()->create([
                    'order_id' => $order->id,
                    'product_id' => $row['product_id'],
                    'user_id' => $user->id,
                    'rating' => $row['rating'],
                    'comment' => $row['comment'],
                    'is_visible' => true,
                ]);
            }

            foreach (array_unique(array_column($accepted, 'product_id')) as $productId) {
                $this->recalculateRating((int) $productId);
            }

            return count($accepted);
        });
    }

    /**
     * Hitung ulang agregat rating produk dari ulasan yang tampil saja.
     */
    public function recalculateRating(int $productId): void
    {
        $aggregate = Review::query()
            ->where('product_id', $productId)
            ->where('is_visible', true)
            ->selectRaw('COUNT(*) as total, COALESCE(AVG(rating), 0) as average')
            ->first();

        Product::query()->whereKey($productId)->update([
            'rating_avg' => round((float) ($aggregate->average ?? 0), 2),
            'rating_count' => (int) ($aggregate->total ?? 0),
        ]);
    }
}

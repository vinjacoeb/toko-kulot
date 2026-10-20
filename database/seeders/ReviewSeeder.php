<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Ulasan contoh hanya untuk order berstatus `selesai` (PRD §7.5: ulasan hanya
 * dari pembelian yang selesai). Setelah menulis ulasan, `products.rating_avg`
 * dan `rating_count` dihitung ulang dari tabel reviews — bukan diisi manual.
 */
class ReviewSeeder extends Seeder
{
    private const REVIEW_ORDER_CODE = 'TK-20261015-0001';

    /**
     * @var array<int, array{product_slug: string, rating: int, comment: string, admin_reply: string|null}>
     */
    private const REVIEWS = [
        [
            'product_slug' => 'daster-batik-pekalongan-lengan-pendek',
            'rating' => 5,
            'comment' => '[CONTOH] Bahannya adem, jahitan rapi, dan sesuai deskripsi. '
                .'Beli 6 pcs dapat harga grosir, worth it untuk dijual lagi.',
            'admin_reply' => 'Terima kasih sudah belanja dan meninggalkan ulasan, Kak!',
        ],
        [
            'product_slug' => 'kulot-plisket-premium',
            'rating' => 4,
            'comment' => '[CONTOH] Kulotnya nyaman dan tidak menerawang. '
                .'Pengiriman agak lambat dua hari dari perkiraan.',
            'admin_reply' => null,
        ],
    ];

    public function run(): void
    {
        DB::transaction(function (): void {
            $order = Order::where('code', self::REVIEW_ORDER_CODE)->first();

            if ($order === null) {
                throw new RuntimeException(
                    'Order '.self::REVIEW_ORDER_CODE.' belum ada. Jalankan OrderSeeder lebih dulu.'
                );
            }

            $user = User::find($order->user_id);
            $repliedAt = '2026-10-17 10:30:00';

            foreach (self::REVIEWS as $data) {
                $product = Product::where('slug', $data['product_slug'])->first();

                if ($product === null) {
                    throw new RuntimeException("Produk {$data['product_slug']} belum ada. Jalankan ProductSeeder lebih dulu.");
                }

                $review = Review::updateOrCreate(
                    ['order_id' => $order->id, 'product_id' => $product->id],
                    [
                        'user_id' => $user?->id,
                        'rating' => $data['rating'],
                        'comment' => $data['comment'],
                        'admin_reply' => $data['admin_reply'],
                        'replied_at' => $data['admin_reply'] === null ? null : $repliedAt,
                        'is_visible' => true,
                    ],
                );

                DB::table('reviews')->where('id', $review->id)->update([
                    'created_at' => '2026-10-16 08:00:00',
                    'updated_at' => '2026-10-17 10:30:00',
                ]);
            }

            $this->recalculateProductRatings();
            unset($admin);
        });
    }

    private function recalculateProductRatings(): void
    {
        $products = Product::whereIn('id', Review::query()->select('product_id'))->get();

        foreach ($products as $product) {
            $average = Review::where('product_id', $product->id)->avg('rating');
            $count = Review::where('product_id', $product->id)->count();

            $product->forceFill([
                'rating_avg' => round((float) $average, 2),
                'rating_count' => $count,
            ])->save();
        }
    }
}

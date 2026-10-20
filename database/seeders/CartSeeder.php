<?php

namespace Database\Seeders;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Satu keranjang contoh untuk pembeli demo, supaya halaman keranjang dan
 * alur checkout bisa dicoba tanpa menambah barang manual.
 * `unit_price` memakai harga per kuantitas (eceran/grosir) saat seed dijalankan.
 */
class CartSeeder extends Seeder
{
    /** @var array<int, array{variant_sku: string, qty: int}> */
    private const ITEMS = [
        ['variant_sku' => 'KLT-JNS-STR-L-NAV', 'qty' => 1],
        ['variant_sku' => 'DSR-MXI-RND-L-MAR', 'qty' => 2],
    ];

    public function run(): void
    {
        DB::transaction(function (): void {
            $user = User::where('email', 'budi@example.test')->first();

            if ($user === null) {
                throw new RuntimeException('Pembeli budi@example.test belum ada. Jalankan UserSeeder lebih dulu.');
            }

            $cart = Cart::firstOrNew(['user_id' => $user->id, 'session_id' => null]);
            $cart->expires_at = null;
            $cart->save();

            foreach (self::ITEMS as $item) {
                $variant = ProductVariant::where('sku', $item['variant_sku'])->first();

                if ($variant === null || $variant->product === null) {
                    throw new RuntimeException("Varian {$item['variant_sku']} belum ada. Jalankan ProductSeeder lebih dulu.");
                }

                CartItem::updateOrCreate(
                    ['cart_id' => $cart->id, 'product_variant_id' => $variant->id],
                    [
                        'product_id' => $variant->product->id,
                        'qty' => $item['qty'],
                        'unit_price' => $variant->product->priceForQty($item['qty']) + (int) $variant->price_delta,
                    ],
                );
            }
        });
    }
}

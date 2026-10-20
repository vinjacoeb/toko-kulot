<?php

namespace Database\Seeders\Concerns;

use App\Models\ProductVariant;
use App\Models\StockMovement;

/**
 * Menjaga invarian stok: `product_variants.stock` selalu sama dengan jumlah
 * pergerakan stok (in + adjust − out − sale). Dipakai seeder agar stok tidak
 * pernah diisi langsung tanpa jejak `stock_movements` (docs/db.md §5).
 *
 * Konvensi tanda: `in`, `out`, dan `sale` menyimpan qty positif (arah dibaca
 * dari `type`), `adjust` boleh positif atau negatif.
 */
trait SyncsVariantStock
{
    protected function syncVariantStock(ProductVariant $variant): int
    {
        $incoming = (int) $variant->stockMovements()->where('type', StockMovement::TYPE_IN)->sum('qty');
        $adjustment = (int) $variant->stockMovements()->where('type', StockMovement::TYPE_ADJUST)->sum('qty');
        $outgoing = (int) $variant->stockMovements()
            ->whereIn('type', [StockMovement::TYPE_OUT, StockMovement::TYPE_SALE])
            ->sum('qty');

        $stock = max(0, $incoming + $adjustment - $outgoing);

        if ((int) $variant->stock !== $stock) {
            $variant->forceFill(['stock' => $stock])->save();
        }

        return $stock;
    }
}

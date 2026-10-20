<?php

namespace App\Services;

use App\Exceptions\CheckoutException;
use App\Models\ProductVariant;
use App\Models\StockMovement;
use Illuminate\Validation\ValidationException;

/**
 * Satu-satunya penulis `product_variants.stock` dan `stock_movements`
 * (PRD §6, §7 langkah 5). Setiap metode WAJIB dipanggil di dalam
 * DB::transaction milik pemanggil, dengan varian yang sudah dikunci
 * `lockForUpdate()` agar dua checkout paralel tidak menjual stok yang sama.
 */
class StockService
{
    /**
     * Potong stok karena penjualan (tipe `sale`). Menolak stok negatif.
     */
    public function decreaseForSale(ProductVariant $variant, int $qty, string $note): StockMovement
    {
        if ($qty < 1) {
            throw new CheckoutException('Jumlah tidak valid.');
        }

        $available = (int) $variant->stock;

        if ($available < $qty) {
            throw new CheckoutException(sprintf(
                'Stok %s tersisa %d. Perbarui keranjang.',
                $this->label($variant),
                $available,
            ));
        }

        $variant->forceFill(['stock' => $available - $qty])->save();

        return StockMovement::create([
            'product_variant_id' => $variant->id,
            'type' => StockMovement::TYPE_SALE,
            'qty' => $qty,
            'note' => $note,
            'admin_id' => null,
        ]);
    }

    /**
     * Kembalikan stok karena pembayaran gagal/kedaluwarsa (tipe `in`).
     */
    public function restoreForCancellation(ProductVariant $variant, int $qty, string $note): StockMovement
    {
        if ($qty < 1) {
            throw new CheckoutException('Jumlah tidak valid.');
        }

        $variant->forceFill(['stock' => (int) $variant->stock + $qty])->save();

        return StockMovement::create([
            'product_variant_id' => $variant->id,
            'type' => StockMovement::TYPE_IN,
            'qty' => $qty,
            'note' => $note,
            'admin_id' => null,
        ]);
    }

    /**
     * Stok masuk manual dari panel admin (tipe `in`), dicatat atas nama petugas.
     */
    public function increase(ProductVariant $variant, int $qty, ?string $note, ?int $adminId = null): StockMovement
    {
        if ($qty < 1) {
            throw ValidationException::withMessages(['qty' => 'Jumlah minimal 1.']);
        }

        $variant->forceFill(['stock' => (int) $variant->stock + $qty])->save();

        return StockMovement::create([
            'product_variant_id' => $variant->id,
            'type' => StockMovement::TYPE_IN,
            'qty' => $qty,
            'note' => $note,
            'admin_id' => $adminId,
        ]);
    }

    /**
     * Stok keluar manual dari panel admin (tipe `out`), menolak hasil negatif.
     */
    public function decrease(ProductVariant $variant, int $qty, ?string $note, ?int $adminId = null): StockMovement
    {
        if ($qty < 1) {
            throw ValidationException::withMessages(['qty' => 'Jumlah minimal 1.']);
        }

        $available = (int) $variant->stock;

        if ($available < $qty) {
            throw ValidationException::withMessages([
                'qty' => sprintf('Stok tidak cukup — stok saat ini %d.', $available),
            ]);
        }

        $variant->forceFill(['stock' => $available - $qty])->save();

        return StockMovement::create([
            'product_variant_id' => $variant->id,
            'type' => StockMovement::TYPE_OUT,
            'qty' => $qty,
            'note' => $note,
            'admin_id' => $adminId,
        ]);
    }

    /**
     * Setel stok varian ke nilai tertentu (simpan produk, kontrak props §12.4 & §12.6).
     * Selisihnya dicatat sebagai `adjust` bertanda — `SyncsVariantStock` menjumlahkan
     * baris `adjust` untuk menghitung ulang stok, jadi arah koreksi harus ikut tersimpan.
     */
    public function adjustTo(ProductVariant $variant, int $target, ?string $note, ?int $adminId = null): ?StockMovement
    {
        if ($target < 0) {
            throw ValidationException::withMessages(['stok' => 'Stok tidak boleh negatif.']);
        }

        $current = (int) $variant->stock;
        $delta = $target - $current;

        if ($delta === 0) {
            return null;
        }

        $variant->forceFill(['stock' => $target])->save();

        return StockMovement::create([
            'product_variant_id' => $variant->id,
            'type' => StockMovement::TYPE_ADJUST,
            'qty' => $delta,
            'note' => $note,
            'admin_id' => $adminId,
        ]);
    }

    /**
     * Label varian untuk pesan galat: "Ukuran L / Merah", atau SKU bila kosong.
     */
    public function label(?ProductVariant $variant): string
    {
        if (! $variant) {
            return 'produk';
        }

        $parts = array_filter([$variant->size, $variant->color], fn ($value) => filled($value));

        return $parts === [] ? (string) $variant->sku : implode(' / ', $parts);
    }
}

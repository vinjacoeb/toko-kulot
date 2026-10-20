<?php

namespace App\Services;

use App\Exceptions\CheckoutException;
use App\Exceptions\OrderStatusException;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;

/**
 * Pembuatan pesanan dari keranjang (PRD §5.1 langkah 5–7).
 *
 * Satu transaksi: kunci varian → validasi stok → snapshot order + order_items
 * → potong stok lewat StockService → buat tagihan QRIS → kosongkan keranjang.
 * Tidak ada jalur lain yang boleh membuat order atau memotong stok.
 */
class OrderService
{
    public function __construct(
        private readonly StockService $stock,
        private readonly MidtransService $midtrans,
        private readonly CartService $carts,
    ) {}

    /**
     * @param  array<string, mixed>  $data  data formulir checkout yang sudah divalidasi
     */
    public function createFromCart(Cart $cart, array $data): Order
    {
        return DB::transaction(function () use ($cart, $data): Order {
            $items = $cart->items()->orderBy('id')->get();

            if ($items->isEmpty()) {
                throw new CheckoutException('Keranjang masih kosong.');
            }

            $lines = $this->lockLines($items);

            $subtotal = array_sum(array_column($lines, 'line_total'));
            $shippingCost = $this->carts->shippingCost();

            $order = Order::create([
                'user_id' => auth('web')->id(),
                'code' => $this->nextCode(),
                'status' => Order::STATUS_PENDING,
                'subtotal' => (int) $subtotal,
                'shipping_cost' => $shippingCost,
                'discount' => 0,
                'total' => (int) $subtotal + $shippingCost,
                'payment_method' => 'qris',
                'payment_status' => Order::PAYMENT_PENDING,
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'customer_email' => $data['customer_email'] ?? null,
                'shipping_address' => $data['customer_address'],
                'city' => $data['customer_city'],
                'postal_code' => $data['customer_postal_code'] ?? null,
                'notes' => $data['note'] ?? null,
                'paid_at' => null,
            ]);

            foreach ($lines as $line) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $line['product']->id,
                    'product_variant_id' => $line['variant']?->id,
                    'product_name' => $line['product']->name,
                    'variant_label' => $this->carts->variantLabel($line['variant']),
                    'qty' => $line['qty'],
                    'unit_price' => $line['unit_price'],
                    'line_total' => $line['line_total'],
                ]);

                if ($line['variant']) {
                    $this->stock->decreaseForSale(
                        $line['variant'],
                        $line['qty'],
                        'Penjualan '.$order->code,
                    );
                }
            }

            $this->midtrans->createQrisCharge($order);

            $cart->items()->delete();
            $cart->forceFill(['expires_at' => now()->addDays(30)])->save();
            session([CartService::SESSION_COUNT => 0]);

            return $order->load(['items', 'payment']);
        });
    }

    /**
     * Kunci varian (urut id, cegah deadlock) lalu validasi stok & harga.
     *
     * @param  \Illuminate\Support\Collection<int, \App\Models\CartItem>  $items
     * @return list<array{product: Product, variant: ?ProductVariant, qty: int, unit_price: int, line_total: int}>
     */
    private function lockLines($items): array
    {
        $variantIds = $items->pluck('product_variant_id')
            ->filter()
            ->unique()
            ->sort()
            ->values()
            ->all();

        $lockedVariants = $variantIds === []
            ? collect()
            : ProductVariant::query()
                ->whereIn('id', $variantIds)
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

        $productIds = $items->pluck('product_id')->filter()->unique()->values()->all();

        $products = $productIds === []
            ? collect()
            : Product::query()->whereIn('id', $productIds)->get()->keyBy('id');

        $lines = [];

        foreach ($items as $item) {
            $product = $products->get($item->product_id);

            if (! $product || ! $product->is_active) {
                throw new CheckoutException('Ada produk yang sudah tidak tersedia. Hapus dari keranjang.');
            }

            $variant = $item->product_variant_id !== null
                ? $lockedVariants->get($item->product_variant_id)
                : null;

            if ($item->product_variant_id !== null && ! $variant) {
                throw new CheckoutException('Ada varian yang sudah tidak tersedia. Hapus dari keranjang.');
            }

            if ($variant && ! $variant->is_active) {
                throw new CheckoutException(sprintf(
                    '%s sudah tidak tersedia. Hapus dari keranjang.',
                    $product->name.' ('.$this->carts->variantLabel($variant).')',
                ));
            }

            $qty = (int) $item->qty;

            if ($qty < 1) {
                continue;
            }

            if ($variant && (int) $variant->stock < $qty) {
                throw new CheckoutException(sprintf(
                    'Stok %s tersisa %d. Perbarui keranjang.',
                    $this->stock->label($variant),
                    (int) $variant->stock,
                ));
            }

            $unitPrice = $this->carts->unitPrice($product, $variant, $qty);

            $lines[] = [
                'product' => $product,
                'variant' => $variant,
                'qty' => $qty,
                'unit_price' => $unitPrice,
                'line_total' => $unitPrice * $qty,
            ];
        }

        if ($lines === []) {
            throw new CheckoutException('Keranjang masih kosong.');
        }

        return $lines;
    }

    /**
     * Kode pesanan `TK-YYYYMMDD-NNNN` (PRD A10, docs/db.md), unik dengan retry.
     */
    public function nextCode(): string
    {
        $prefix = 'TK-'.now()->format('Ymd').'-';

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $sequence = Order::query()->where('code', 'like', $prefix.'%')->count() + 1 + $attempt;
            $code = $prefix.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);

            if (! Order::query()->where('code', $code)->exists()) {
                return $code;
            }
        }

        return $prefix.strtoupper(substr(bin2hex(random_bytes(3)), 0, 4));
    }

    /**
     * Ubah status pesanan dari panel admin (kontrak props §12.18).
     *
     * Transisi dicek terhadap rantai status pesanan; pembatalan mengembalikan stok semua
     * item (satu catatan `in` per varian, atas nama petugas), dan status `dibayar`
     * mengisi `paid_at` bila masih kosong.
     *
     * @param  array<string, mixed>  $data  data tervalidasi UpdateOrderStatusRequest
     */
    public function changeStatusByAdmin(Order $order, array $data, ?int $adminId = null): Order
    {
        return DB::transaction(function () use ($order, $data, $adminId): Order {
            $locked = Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();
            $target = (string) $data['status'];

            if (! in_array($target, $locked->nextStatuses(), true)) {
                throw new OrderStatusException(sprintf(
                    'Status pesanan tidak bisa diubah dari %s ke %s.',
                    Order::statusLabel($locked->status),
                    Order::statusLabel($target),
                ));
            }

            if ($target === Order::STATUS_CANCELLED) {
                $this->restoreStock($locked, $adminId, $this->note($data));
            }

            $attributes = ['status' => $target];

            if ($target === Order::STATUS_PAID && $locked->paid_at === null) {
                $attributes['paid_at'] = now();
            }

            $locked->forceFill($attributes)->save();

            return $locked;
        });
    }

    /**
     * Kembalikan stok semua item pesanan sebagai catatan `in` (PRD §7, kontrak §12.18).
     */
    private function restoreStock(Order $order, ?int $adminId, ?string $catatan): void
    {
        $items = $order->items()->with('variant')->orderBy('id')->get();

        foreach ($items as $item) {
            $variant = $item->variant;
            $qty = (int) $item->qty;

            if ($variant === null || $qty < 1) {
                continue;
            }

            $this->stock->increase(
                $variant,
                $qty,
                $catatan === null ? 'Pembatalan '.$order->code : 'Pembatalan '.$order->code.' — '.$catatan,
                $adminId,
            );
        }
    }

    /**
     * Catatan opsional dari form perubahan status (§12.18); `null` bila kosong.
     *
     * @param  array<string, mixed>  $data
     */
    private function note(array $data): ?string
    {
        if (! isset($data['note'])) {
            return null;
        }

        $note = trim((string) $data['note']);

        return $note === '' ? null : $note;
    }
}

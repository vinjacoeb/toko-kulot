<?php

namespace App\Services;

use App\Exceptions\CheckoutException;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Pembuatan pesanan dari keranjang (PRD §5.1 langkah 5–7).
 *
 * Satu transaksi: kunci varian → validasi stok → snapshot order + order_items
 * → potong stok lewat StockService → buat baris tagihan `pending` (tanpa
 * memanggil Midtrans; charge dibuat saat pembeli memilih kanal) → kosongkan
 * keranjang. Tidak ada jalur lain yang boleh membuat order atau memotong stok.
 */
class OrderService
{
    public function __construct(
        private readonly StockService $stock,
        private readonly MidtransService $midtrans,
        private readonly CartService $carts,
        private readonly BiteshipService $biteship,
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

            $subtotal = (int) array_sum(array_column($lines, 'line_total'));
            $weight = 0;
            $biteshipItems = [];

            foreach ($lines as $line) {
                // Satu dasar hitung dengan tarif & create order (PRD-v1.4 §2.2).
                $unitWeight = BiteshipService::beratUnit((int) $line['product']->weight_gram);
                $weight += $unitWeight * $line['qty'];
                $biteshipItems[] = [
                    'name' => $line['product']->name,
                    'value' => $line['unit_price'],
                    'quantity' => $line['qty'],
                    'weight' => $unitWeight,
                ];
            }

            $shipping = $this->resolveShipping($data, $biteshipItems, $subtotal);

            $order = Order::create([
                'user_id' => auth('web')->id(),
                'code' => $this->nextCode(),
                'status' => Order::STATUS_PENDING,
                'subtotal' => $subtotal,
                'shipping_cost' => $shipping['cost'],
                'discount' => 0,
                'total' => $subtotal + $shipping['cost'],
                'payment_method' => 'midtrans',
                'payment_status' => Order::PAYMENT_PENDING,
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'customer_email' => $data['customer_email'] ?? null,
                'shipping_address' => $data['customer_address'],
                'city' => $data['customer_city'],
                'postal_code' => $data['customer_postal_code'] ?? null,
                'shipping_courier' => $shipping['courier'],
                'shipping_service' => $shipping['service'],
                'shipping_etd' => $shipping['etd'],
                'shipping_weight_gram' => $weight,
                'shipping_is_free' => $shipping['is_free'],
                'notes' => $data['note'] ?? null,
                'paid_at' => null,
            ]);

            // Bukti tarif yang dipakai (PRD-v1.4 §2.2): satu baris per order, tanpa kunci API.
            Log::info(BiteshipService::LOG_TARIF, [
                'order' => $order->code,
                'origin_postal_code' => (int) $this->biteship->origin()['kode_pos'],
                'destination_postal_code' => (int) $order->postal_code,
                'weight_gram' => $weight,
                'courier' => $shipping['courier'],
                'service' => $shipping['service'],
                'cost' => (int) $shipping['cost'],
                'mode' => $this->biteship->mode(),
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

            $this->midtrans->createPendingPayment($order);

            $cart->items()->delete();
            $cart->forceFill(['expires_at' => now()->addDays(30)])->save();
            session([CartService::SESSION_COUNT => 0]);

            return $order->load(['items', 'payment']);
        });
    }

    /**
     * Tarif final dihitung server (PRD v1.1 D3): nilai `shipping_cost` dari
     * formulir hanya pembanding, bukan sumber kebenaran.
     *
     * @param  array<string, mixed>  $data
     * @param  list<array{name: string, value: int, quantity: int, weight: int}>  $items
     * @return array{cost: int, is_free: bool, courier: ?string, service: ?string, etd: ?string}
     */
    private function resolveShipping(array $data, array $items, int $subtotal): array
    {
        $courier = strtolower(trim((string) ($data['shipping_courier'] ?? '')));
        $service = trim((string) ($data['shipping_service'] ?? ''));

        // Mode uji tanpa pilihan kurir (form lama): tarif datar, tanpa gratis.
        if ($this->biteship->isFake() && ($courier === '' || $service === '')) {
            return [
                'cost' => $this->biteship->fakeRate(),
                'is_free' => false,
                'courier' => null,
                'service' => null,
                'etd' => null,
            ];
        }

        $postalCode = trim((string) ($data['customer_postal_code'] ?? ''));

        if (! preg_match('/^\d{5}$/', $postalCode)) {
            throw new CheckoutException('Kode pos harus 5 angka.');
        }

        $quote = $this->biteship->quote(
            $courier,
            $service,
            $postalCode,
            $items,
            $subtotal,
        );

        if ($quote === null) {
            throw new CheckoutException('Ongkir berubah, pilih ulang kurir.');
        }

        $expected = $quote['gratis'] ? 0 : (int) $quote['cost'];

        if (isset($data['shipping_cost']) && (int) $data['shipping_cost'] !== $expected) {
            throw new CheckoutException('Ongkir berubah, pilih ulang kurir.');
        }

        return [
            'cost' => $expected,
            'is_free' => (bool) $quote['gratis'],
            'courier' => $courier,
            'service' => $service,
            'etd' => $quote['etd'],
        ];
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
}

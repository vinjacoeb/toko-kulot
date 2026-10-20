<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\StockMovement;
use App\Models\User;
use Database\Seeders\Concerns\SyncsVariantStock;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Order contoh untuk demo dashboard admin, halaman pesanan, dan ulasan.
 *
 * Aturan yang diikuti (PRD §7.3 langkah 5): stok dikurangi saat order dibuat
 * lewat `stock_movements` tipe `sale`, bukan dengan menulis stok langsung.
 * Tanggal dibuat absolut dan deterministik supaya seed berulang tidak
 * menghasilkan kode order baru (R13).
 */
class OrderSeeder extends Seeder
{
    use SyncsVariantStock;

    /**
     * @var array<int, array{
     *     code: string, created_at: string, paid_at: string|null, status: string,
     *     payment_status: string, user: string, notes: string|null,
     *     items: array<int, array{variant_sku: string, qty: int}>
     * }>
     */
    private const ORDERS = [
        [
            'code' => 'TK-20261015-0001',
            'created_at' => '2026-10-15 09:15:00',
            'paid_at' => '2026-10-15 09:22:00',
            'status' => Order::STATUS_COMPLETED,
            'payment_status' => Order::PAYMENT_SETTLEMENT,
            'user' => 'budi@example.test',
            'notes' => 'Tolong dibungkus rapi, kirim lewat JNE.',
            'items' => [
                ['variant_sku' => 'DSR-BTK-PKL-L-COK', 'qty' => 6],
                ['variant_sku' => 'KLT-PLS-PRM-L-HIT', 'qty' => 2],
            ],
        ],
        [
            'code' => 'TK-20261016-0001',
            'created_at' => '2026-10-16 14:40:00',
            'paid_at' => '2026-10-16 14:48:00',
            'status' => Order::STATUS_SHIPPED,
            'payment_status' => Order::PAYMENT_SETTLEMENT,
            'user' => 'sari@example.test',
            'notes' => null,
            'items' => [
                ['variant_sku' => 'DSR-SNT-JMB-L-BIR', 'qty' => 1],
                ['variant_sku' => 'DSR-KNC-PJG-M-HIT', 'qty' => 1],
            ],
        ],
        [
            'code' => 'TK-20261018-0001',
            'created_at' => '2026-10-18 20:05:00',
            'paid_at' => null,
            'status' => Order::STATUS_PENDING,
            'payment_status' => Order::PAYMENT_PENDING,
            'user' => 'budi@example.test',
            'notes' => 'Kalau bisa dikirim minggu depan.',
            'items' => [
                ['variant_sku' => 'KLT-LNN-JMB-L-KRE', 'qty' => 2],
            ],
        ],
    ];

    private const FALLBACK_SHIPPING_COST = 20000;

    public function run(): void
    {
        DB::transaction(function (): void {
            $shippingCost = $this->shippingCost();
            $stockAdmin = Admin::where('role', Admin::ROLE_OWNER)->first();

            foreach (self::ORDERS as $data) {
                $user = User::where('email', $data['user'])->first();

                if ($user === null) {
                    throw new RuntimeException("Pembeli {$data['user']} belum ada. Jalankan UserSeeder lebih dulu.");
                }

                $items = $this->resolveItems($data['items']);
                $subtotal = 0;

                foreach ($items as $item) {
                    $subtotal += $item['unit_price'] * $item['qty'];
                }

                $total = $subtotal + $shippingCost;

                $order = Order::updateOrCreate(
                    ['code' => $data['code']],
                    [
                        'user_id' => $user->id,
                        'status' => $data['status'],
                        'subtotal' => $subtotal,
                        'shipping_cost' => $shippingCost,
                        'discount' => 0,
                        'total' => $total,
                        'payment_method' => 'qris',
                        'payment_status' => $data['payment_status'],
                        'customer_name' => $user->name,
                        'customer_phone' => (string) $user->phone,
                        'customer_email' => $user->email,
                        'shipping_address' => (string) $user->address,
                        'city' => (string) $user->city,
                        'postal_code' => (string) $user->postal_code,
                        'notes' => $data['notes'],
                        'paid_at' => $data['paid_at'],
                    ],
                );

                $this->stampTimestamps('orders', $order->id, $data['created_at'], $data['paid_at'] ?? $data['created_at']);

                foreach ($items as $item) {
                    $orderItem = OrderItem::updateOrCreate(
                        ['order_id' => $order->id, 'product_variant_id' => $item['variant']->id],
                        [
                            'product_id' => $item['product']->id,
                            'product_name' => $item['product']->name,
                            'variant_label' => $item['variant']->label(),
                            'qty' => $item['qty'],
                            'unit_price' => $item['unit_price'],
                            'line_total' => $item['unit_price'] * $item['qty'],
                        ],
                    );

                    $this->stampTimestamps('order_items', $orderItem->id, $data['created_at'], $data['created_at']);

                    $movement = StockMovement::updateOrCreate(
                        [
                            'product_variant_id' => $item['variant']->id,
                            'type' => StockMovement::TYPE_SALE,
                            'note' => '[CONTOH] penjualan '.$data['code'],
                        ],
                        ['qty' => $item['qty'], 'admin_id' => $stockAdmin?->id],
                    );

                    $this->stampTimestamps('stock_movements', $movement->id, $data['created_at'], $data['created_at']);

                    $this->syncVariantStock($item['variant']);
                }

                $payment = Payment::updateOrCreate(
                    ['order_id' => $order->id],
                    [
                        'provider' => 'midtrans',
                        'transaction_id' => $data['payment_status'] === Order::PAYMENT_SETTLEMENT
                            ? 'demo-'.$data['code']
                            : null,
                        'order_id_midtrans' => 'DEMO-'.$data['code'],
                        'qris_url' => null,
                        'qr_string' => null,
                        'gross_amount' => $total,
                        'status' => $data['payment_status'],
                        'payload' => [
                            'demo' => true,
                            'note' => '[CONTOH] dibuat oleh seeder, Midtrans tidak dipanggil',
                            'transaction_status' => $data['payment_status'],
                            'payment_type' => 'qris',
                            'gross_amount' => (string) $total,
                        ],
                        'paid_at' => $data['paid_at'],
                        'expires_at' => $data['paid_at'] === null
                            ? date('Y-m-d H:i:s', strtotime($data['created_at']) + 15 * 60)
                            : null,
                    ],
                );

                $this->stampTimestamps('payments', $payment->id, $data['created_at'], $data['created_at']);
            }
        });
    }

    private function shippingCost(): int
    {
        $value = Setting::where('key', 'shipping_cost_default')->value('value');

        return $value === null || $value === '' ? self::FALLBACK_SHIPPING_COST : (int) $value;
    }

    /**
     * @param  array<int, array{variant_sku: string, qty: int}>  $items
     * @return array<int, array{product: Product, variant: ProductVariant, qty: int, unit_price: int}>
     */
    private function resolveItems(array $items): array
    {
        $resolved = [];

        foreach ($items as $item) {
            $variant = ProductVariant::where('sku', $item['variant_sku'])->first();

            if ($variant === null) {
                throw new RuntimeException("Varian {$item['variant_sku']} belum ada. Jalankan ProductSeeder lebih dulu.");
            }

            $product = $variant->product;

            if ($product === null) {
                throw new RuntimeException("Produk untuk varian {$item['variant_sku']} tidak ditemukan.");
            }

            $resolved[] = [
                'product' => $product,
                'variant' => $variant,
                'qty' => $item['qty'],
                'unit_price' => $product->priceForQty($item['qty']) + (int) $variant->price_delta,
            ];
        }

        return $resolved;
    }

    private function stampTimestamps(string $table, int $id, string $createdAt, string $updatedAt): void
    {
        DB::table($table)->where('id', $id)->update([
            'created_at' => $createdAt,
            'updated_at' => $updatedAt,
        ]);
    }
}

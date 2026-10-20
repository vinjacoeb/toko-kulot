<?php

namespace App\Http\Controllers;

use App\Exceptions\CheckoutException;
use App\Http\Requests\CheckoutRequest;
use App\Models\Order;
use App\Models\Payment;
use App\Models\ProductImage;
use App\Models\Review;
use App\Services\CartService;
use App\Services\MidtransService;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Keranjang → checkout → pembayaran QRIS (PRD §5.1 langkah 3–7, kontrak §7.5–§7.9).
 *
 * Checkout wajib login (PRD §5.1 langkah 3). Akses halaman pesanan hanya untuk
 * pemilik order; order pembeli lain dijawab 404 (cegah IDOR).
 */
class CheckoutController extends Controller
{
    public function __construct(
        private readonly CartService $carts,
        private readonly OrderService $orders,
        private readonly MidtransService $midtrans,
    ) {}

    public function index(Request $request): Response|RedirectResponse
    {
        $cart = $this->carts->currentCart();
        $summary = $this->carts->summary($cart);

        if ($summary['is_empty']) {
            return redirect()->route('cart.index')->with('error', 'Keranjang masih kosong.');
        }

        $user = $request->user('web');

        return Inertia::render('Public/Checkout', [
            'keranjang' => $summary,
            'prefill' => [
                'customer_name' => $user?->name,
                'customer_phone' => $user?->phone,
                'customer_email' => $user?->email,
                'customer_address' => null,
                'customer_city' => null,
                'customer_postal_code' => null,
                'note' => null,
            ],
            'pembayaran' => $this->paymentMethodPayload(),
            'midtrans' => $this->midtransClientPayload(),
        ]);
    }

    public function store(CheckoutRequest $request): RedirectResponse
    {
        $cart = $this->carts->currentCart();

        if (! $cart) {
            return redirect()->route('cart.index')->with('error', 'Keranjang masih kosong.');
        }

        try {
            $order = $this->orders->createFromCart($cart, $request->validated());
        } catch (CheckoutException $exception) {
            return redirect()->route('checkout.index')->with('error', $exception->getMessage());
        }

        return redirect()
            ->route('checkout.pay', $order)
            ->with('success', 'Pesanan dibuat. Selesaikan pembayaran QRIS.');
    }

    public function pay(Request $request, Order $order): Response|RedirectResponse
    {
        $this->authorizeOrder($request, $order);

        $order->loadMissing(['items', 'payment']);
        $payment = $order->payment;

        if (! $payment) {
            return redirect()->route('cart.index')->with('error', 'Pesanan ini tidak memiliki tagihan pembayaran.');
        }

        if ($payment->status === Order::PAYMENT_SETTLEMENT) {
            return redirect()->route('checkout.success', $order);
        }

        return Inertia::render('Public/CheckoutPay', [
            'pesanan' => $this->orderPayload($order),
            'pembayaran' => $this->paymentPayload($payment),
            'midtrans' => $this->midtransClientPayload(),
        ]);
    }

    /**
     * Polling status pembayaran oleh halaman bayar (kontrak §7.7).
     */
    public function status(Request $request, Order $order): JsonResponse
    {
        $this->authorizeOrder($request, $order);

        $payment = $order->payment;

        if ($payment && $payment->status === Order::PAYMENT_PENDING && ! $this->midtrans->isFake()) {
            try {
                $this->midtrans->syncStatus($payment);
                $payment->refresh();
                $order->refresh();
            } catch (\Throwable $exception) {
                Log::warning('Sinkronisasi status Midtrans gagal', [
                    'order' => $order->code,
                    'error' => $exception->getMessage(),
                ]);
            }
        }

        return response()->json([
            'status' => $payment?->status ?? Order::PAYMENT_PENDING,
            'paid_at' => $payment?->paid_at?->toIso8601String(),
            'expires_at' => $payment?->expires_at?->toIso8601String(),
        ]);
    }

    public function success(Request $request, Order $order): Response|RedirectResponse
    {
        $this->authorizeOrder($request, $order);

        if ($order->payment_status !== Order::PAYMENT_SETTLEMENT) {
            return redirect()
                ->route('checkout.pay', $order)
                ->with('error', 'Pembayaran belum diterima.');
        }

        $order->loadMissing(['items', 'payment']);

        $reviewedProductIds = Review::query()
            ->where('order_id', $order->id)
            ->pluck('product_id')
            ->map(fn ($id) => (int) $id)
            ->all();

        return Inertia::render('Public/CheckoutSuccess', [
            'pesanan' => $this->orderPayload($order),
            'ulasan' => [
                'boleh' => $reviewedProductIds === [],
                'sudah' => $reviewedProductIds,
            ],
        ]);
    }

    /**
     * Kepemilikan order: hanya pembeli yang membuat order (kontrak §7.7–§7.9).
     */
    private function authorizeOrder(Request $request, Order $order): void
    {
        $user = $request->user('web');

        abort_unless($user && (int) $order->user_id === (int) $user->id, 404);
    }

    /**
     * @return array<string, mixed>
     */
    private function orderPayload(Order $order): array
    {
        $order->loadMissing(['items', 'payment']);

        $images = $this->primaryImages($order);

        return [
            'id' => (int) $order->id,
            'code' => $order->code,
            'status' => $order->status,
            'payment_status' => $order->payment_status,
            'subtotal' => (int) $order->subtotal,
            'shipping_cost' => (int) $order->shipping_cost,
            'discount' => (int) $order->discount,
            'total' => (int) $order->total,
            'customer_name' => $order->customer_name,
            'customer_phone' => $order->customer_phone,
            'customer_email' => $order->customer_email,
            'customer_address' => $order->shipping_address,
            'customer_city' => $order->city,
            'customer_postal_code' => $order->postal_code,
            'note' => $order->notes,
            'created_at' => $order->created_at?->toIso8601String(),
            'paid_at' => $order->paid_at?->toIso8601String(),
            'items' => $order->items->map(fn ($item) => [
                'id' => (int) $item->id,
                'product_id' => (int) $item->product_id,
                'variant_id' => $item->product_variant_id !== null ? (int) $item->product_variant_id : null,
                'name' => $item->product_name,
                'variant_label' => $item->variant_label,
                'qty' => (int) $item->qty,
                'unit_price' => (int) $item->unit_price,
                'line_total' => (int) $item->line_total,
                'image' => $images[(int) $item->product_id] ?? null,
            ])->values()->all(),
        ];
    }

    /**
     * Gambar utama tiap produk dalam order (hindari N+1).
     *
     * @return array<int, string>
     */
    private function primaryImages(Order $order): array
    {
        $productIds = $order->items->pluck('product_id')->map(fn ($id) => (int) $id)->unique()->values()->all();

        if ($productIds === []) {
            return [];
        }

        return ProductImage::query()
            ->whereIn('product_id', $productIds)
            ->orderByDesc('is_primary')
            ->orderBy('sort_order')
            ->get(['product_id', 'path'])
            ->groupBy('product_id')
            ->map(fn ($rows) => $rows->first()->path)
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function paymentPayload(?Payment $payment): array
    {
        return [
            'method' => 'qris',
            'label' => 'QRIS',
            'provider' => $payment?->provider ?? 'midtrans',
            'status' => $payment?->status ?? Order::PAYMENT_PENDING,
            'qr_string' => $payment?->qr_string,
            'qris_url' => $payment?->qris_url,
            'gross_amount' => (int) ($payment?->gross_amount ?? 0),
            'expires_at' => $payment?->expires_at?->toIso8601String(),
            'paid_at' => $payment?->paid_at?->toIso8601String(),
            'fake' => $this->midtrans->isFake(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function paymentMethodPayload(): array
    {
        return [
            'method' => 'qris',
            'label' => 'QRIS (semua e-wallet & m-banking)',
            'expiry_minutes' => (int) config('midtrans.expiry_minutes', 15),
        ];
    }

    /**
     * Data untuk memuat snap.js di halaman bayar. Client key aman dipublikasikan;
     * server key tidak pernah dikirim ke browser.
     *
     * @return array<string, mixed>
     */
    private function midtransClientPayload(): array
    {
        return [
            'client_key' => $this->midtrans->isFake() ? null : (string) config('midtrans.client_key'),
            'is_production' => (bool) config('midtrans.is_production'),
            'fake' => $this->midtrans->isFake(),
        ];
    }
}

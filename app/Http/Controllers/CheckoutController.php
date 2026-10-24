<?php

namespace App\Http\Controllers;

use App\Exceptions\CheckoutException;
use App\Http\Requests\CheckoutRequest;
use App\Models\Order;
use App\Models\Payment;
use App\Models\ProductImage;
use App\Models\Review;
use App\Services\BiteshipService;
use App\Services\CartService;
use App\Services\MidtransService;
use App\Services\OrderService;
use App\Services\ReviewService;
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
        private readonly ReviewService $reviews,
        private readonly BiteshipService $biteship,
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
            'midtrans' => $this->midtrans->modeInfo(),
            'pengiriman' => $this->shippingPayload($summary),
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
            ->with('success', 'Pesanan dibuat. Selesaikan pembayaran.');
    }

    /**
     * Hitung opsi ongkir untuk kode pos pembeli (kontrak §7.12). Server yang
     * memegang tarif; frontend hanya menampilkan `opsi`.
     */
    public function shipping(Request $request): JsonResponse
    {
        $data = $request->validate([
            'postal_code' => ['required', 'string', 'digits:5'],
            'city' => ['nullable', 'string', 'max:100'],
        ], [
            'postal_code.required' => 'Kode pos wajib diisi.',
            'postal_code.digits' => 'Kode pos harus 5 angka.',
        ]);

        $cart = $this->carts->currentCart();
        $summary = $this->carts->summary($cart);
        $free = $this->biteship->freeShipping();

        $payload = [
            'mode' => $this->biteship->mode(),
            'kode_pos' => $data['postal_code'],
            'berat_gram' => $summary['shipping']['berat_gram'],
            'subtotal' => $summary['subtotal'],
            'gratis' => [
                'aktif' => $free['aktif'],
                'min' => $free['min'],
                'terpenuhi' => $free['aktif'] && $summary['subtotal'] >= $free['min'],
            ],
            'opsi' => [],
            'galat' => null,
        ];

        if ($summary['is_empty']) {
            $payload['galat'] = 'Keranjang masih kosong.';

            return response()->json($payload, 422);
        }

        $result = $this->biteship->rates(
            $data['postal_code'],
            $this->carts->shippingItems($cart),
            $summary['subtotal'],
            $data['city'] ?? null,
        );

        $payload['opsi'] = $result['opsi'];
        $payload['galat'] = $result['galat'];

        return response()->json($payload);
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

        // Tagihan mode uji yang tertinggal dibuat ulang ke baris `payments` yang
        // sama sebelum halaman dirender (kontrak §7.7). Gagal menghubungi
        // Midtrans → halaman tetap tampil, tagihan lama tidak diubah.
        $galat = null;

        if ($this->midtrans->needsRegeneration($payment)) {
            try {
                $payment = $this->midtrans->regenerateCharge($payment, $order);
            } catch (CheckoutException $exception) {
                $galat = $exception->getMessage();
            }
        }

        return Inertia::render('Public/CheckoutPay', [
            'pesanan' => $this->orderPayload($order),
            'pembayaran' => $this->paymentPayload($payment, $galat),
            'midtrans' => $this->midtrans->modeInfo(),
        ]);
    }

    /**
     * Panel simulasi mode uji: tandai tagihan lunas (kontrak §7.12). Hanya
     * berlaku untuk tagihan yang dibuat mode uji; service menolak sisanya.
     */
    public function simulate(Request $request, Order $order): RedirectResponse
    {
        $this->authorizeOrder($request, $order);

        $payment = $order->payment;

        if (! $payment) {
            return redirect()->route('cart.index')->with('error', 'Pesanan ini tidak memiliki tagihan pembayaran.');
        }

        try {
            $this->midtrans->simulateSuccess($payment);
        } catch (CheckoutException $exception) {
            return redirect()->route('checkout.pay', $order)->with('error', $exception->getMessage());
        }

        return redirect()
            ->route('checkout.pay', $order)
            ->with('success', 'Pembayaran mode uji ditandai lunas.');
    }

    /**
     * Polling status pembayaran oleh halaman bayar (kontrak §7.7, §7.8).
     */
    public function status(Request $request, Order $order): JsonResponse
    {
        $this->authorizeOrder($request, $order);

        $payment = $order->payment;

        if ($payment && $payment->status === Order::PAYMENT_PENDING) {
            // Tagihan mode uji dibuat ulang dulu (kontrak §7.8) supaya QRIS yang
            // sedang ditampilkan benar-benar bisa dibayar.
            if ($this->midtrans->needsRegeneration($payment)) {
                try {
                    $payment = $this->midtrans->regenerateCharge($payment, $order);
                } catch (CheckoutException $exception) {
                    Log::warning('Pembuatan ulang tagihan mode uji gagal', [
                        'order' => $order->code,
                        'error' => $exception->getMessage(),
                    ]);
                }
            }

            // Tagihan mode uji tidak ditanyakan ke Midtrans; kegagalan jaringan
            // ditangani di dalam syncStatus (best effort, tanpa 500).
            if (! $this->midtrans->isFake() && ! $this->midtrans->isFakeCharge($payment)) {
                $this->midtrans->syncStatus($payment);
                $payment->refresh();
                $order->refresh();
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

        // `boleh` = server akan menerima minimal satu kiriman ulasan sekarang
        // (§7.9): syarat status yang boleh dinilai diambil dari satu sumber aturan
        // §9.1 — ReviewService::isEligible, bukan daftar status yang disalin —
        // dan masih ada `product_id` unik pesanan ini yang belum diulas; jadi
        // pesanan multi-produk yang baru sebagian diulas tetap `boleh = true`.
        $belumDiulas = $order->items
            ->pluck('product_id')
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->reject(fn (int $id): bool => in_array($id, $reviewedProductIds, true))
            ->values()
            ->all();

        return Inertia::render('Public/CheckoutSuccess', [
            'pesanan' => $this->orderPayload($order),
            'ulasan' => [
                'boleh' => $belumDiulas !== [] && $this->reviews->isEligible($order),
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
            'shipping_courier' => $order->shipping_courier,
            'shipping_service' => $order->shipping_service,
            'shipping_etd' => $order->shipping_etd,
            'shipping_is_free' => (bool) $order->shipping_is_free,
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
     * Blok `pengiriman` halaman checkout (kontrak §7.5).
     *
     * @param  array<string, mixed>  $summary
     * @return array<string, mixed>
     */
    private function shippingPayload(array $summary): array
    {
        $free = $this->biteship->freeShipping();
        $origin = $this->biteship->origin();
        $galat = null;

        if (! $this->biteship->isFake() && ! preg_match('/^\d{5}$/', (string) $origin['kode_pos'])) {
            $galat = 'Kode pos asal toko belum diatur. Lengkapi di halaman Ekspedisi.';
        }

        return [
            'mode' => $this->biteship->mode(),
            'key_terisi' => $this->biteship->keyFilled(),
            'tarif_uji' => $this->biteship->isFake() ? $this->biteship->fakeRate() : null,
            'berat_gram' => $summary['shipping']['berat_gram'],
            'gratis' => [
                'aktif' => $free['aktif'],
                'min' => $free['min'],
                'subtotal' => $summary['subtotal'],
                'terpenuhi' => $free['aktif'] && $summary['subtotal'] >= $free['min'],
            ],
            'asal' => $origin,
            'galat' => $galat,
        ];
    }

    /**
     * @param  string|null  $galat  Pesan galat siap tampil bila pembuatan ulang tagihan gagal.
     * @return array<string, mixed>
     */
    private function paymentPayload(?Payment $payment, ?string $galat = null): array
    {
        return [
            'method' => 'midtrans',
            'label' => 'Semua metode pembayaran (Midtrans)',
            'provider' => $payment?->provider ?? 'midtrans',
            'type' => $payment?->payment_type,
            'type_label' => Order::paymentMethodLabel($payment?->payment_type),
            'status' => $payment?->status ?? Order::PAYMENT_PENDING,
            'snap_token' => $payment?->snap_token,
            'snap_redirect_url' => $payment?->snap_redirect_url,
            'qr_string' => $payment?->qr_string,
            'qris_url' => $payment?->qris_url,
            'gross_amount' => (int) ($payment?->gross_amount ?? 0),
            'expires_at' => $payment?->expires_at?->toIso8601String(),
            'paid_at' => $payment?->paid_at?->toIso8601String(),
            'fake' => $this->midtrans->isFakeCharge($payment),
            'galat' => $galat,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function paymentMethodPayload(): array
    {
        return [
            'method' => 'midtrans',
            'label' => 'Semua metode pembayaran (Midtrans)',
            'expiry_minutes' => $this->midtrans->expiryMinutes(),
        ];
    }
}

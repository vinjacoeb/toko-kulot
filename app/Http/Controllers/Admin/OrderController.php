<?php

namespace App\Http\Controllers\Admin;

use App\Exceptions\CheckoutException;
use App\Http\Controllers\Admin\Concerns\ListProps;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderTrackingRequest;
use App\Models\Order;
use App\Models\Payment;
use App\Services\BiteshipService;
use App\Services\MidtransService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Pesanan admin — daftar, detail, nomor resi (PRD §5.2, §7, A15; kontrak props
 * §12.16–§12.17, §12.18a), dan sinkronisasi status pembayaran (§12.24).
 *
 * Status pesanan tidak diubah manual: hanya Midtrans (bayar/batal) dan webhook Biteship
 * (PRD-v1.4 §3). Penerapan status transaksi Midtrans dikerjakan MidtransService, jalur yang
 * sama dengan webhook.
 */
class OrderController extends Controller
{
    use ListProps;

    public function __construct(
        private readonly MidtransService $midtrans,
        private readonly BiteshipService $biteship,
    ) {}

    public function index(Request $request): Response
    {
        $statusKirim = Order::query()
            ->whereNotNull('shipping_status')
            ->distinct()
            ->orderBy('shipping_status')
            ->pluck('shipping_status')
            ->all();

        $filter = [
            'q' => $this->teks($request->query('q')),
            'status' => $this->pilihan(
                $request->query('status'),
                [...Order::STATUS_FLOW, Order::STATUS_CANCELLED],
                'semua',
            ),
            'bayar' => $this->pilihan($request->query('bayar'), [
                Order::PAYMENT_PENDING,
                Order::PAYMENT_SETTLEMENT,
                Order::PAYMENT_EXPIRE,
                Order::PAYMENT_DENY,
                Order::PAYMENT_CANCEL,
            ], 'semua'),
            'kirim' => $this->pilihan($request->query('kirim'), [...$statusKirim, 'belum'], 'semua'),
            'dari' => $this->tanggal($request->query('dari')),
            'sampai' => $this->tanggal($request->query('sampai')),
        ];

        $query = Order::query()->with(['payment'])->withCount('items');

        if ($filter['q'] !== null) {
            $like = '%'.$filter['q'].'%';
            $query->where(fn ($where) => $where
                ->where('code', 'like', $like)
                ->orWhere('customer_name', 'like', $like)
                ->orWhere('customer_phone', 'like', $like)
                ->orWhere('customer_email', 'like', $like));
        }

        if ($filter['status'] !== 'semua') {
            $query->where('status', $filter['status']);
        }

        if ($filter['bayar'] !== 'semua') {
            $query->where('payment_status', $filter['bayar']);
        }

        if ($filter['kirim'] === 'belum') {
            $query->whereNull('shipping_status');
        } elseif ($filter['kirim'] !== 'semua') {
            $query->where('shipping_status', $filter['kirim']);
        }

        if ($filter['dari'] !== null) {
            $query->whereDate('created_at', '>=', $filter['dari']);
        }

        if ($filter['sampai'] !== null) {
            $query->whereDate('created_at', '<=', $filter['sampai']);
        }

        $pesanan = $query
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        $perStatus = Order::query()
            ->selectRaw('status, count(*) as jumlah')
            ->groupBy('status')
            ->pluck('jumlah', 'status');

        $ringkasan = ['total' => Order::query()->count()];

        foreach ([...Order::STATUS_FLOW, Order::STATUS_CANCELLED] as $status) {
            $ringkasan[$status] = (int) $perStatus->get($status, 0);
        }

        $labels = $this->biteship->serviceLabels();

        return Inertia::render('Admin/Orders/Index', [
            'pesanan' => [
                'data' => collect($pesanan->items())->map(fn (Order $row) => $this->row($row, $labels))->all(),
                'links' => $pesanan->linkCollection()->all(),
                'meta' => $this->meta($pesanan),
            ],
            'filter' => $filter,
            'filter_opsi' => [
                'kirim' => collect([
                    ['value' => 'semua', 'label' => 'Semua'],
                    ['value' => 'belum', 'label' => 'Belum ada status'],
                ])->concat(collect($statusKirim)->map(fn (string $status) => [
                    'value' => $status,
                    'label' => BiteshipService::shippingLabel($status),
                ]))->values()->all(),
            ],
            'ringkasan' => $ringkasan,
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['items', 'payment']);

        return Inertia::render('Admin/Orders/Show', [
            'pesanan' => $this->detail($order, $this->biteship->serviceLabels()),
        ]);
    }

    /**
     * Simpan nomor resi manual (PRD A15, kontrak props §12.18a).
     *
     * Hanya kolom `orders.tracking_number` yang berubah; status pesanan, stok, dan
     * pembayaran tidak tersentuh. Kosong/`null` menghapus nomor resi.
     */
    public function resi(UpdateOrderTrackingRequest $request, Order $order): RedirectResponse
    {
        $order->update(['tracking_number' => $request->validated('tracking_number')]);

        return back()->with('success', 'Nomor resi pesanan diperbarui.');
    }

    /**
     * Buat resi otomatis lewat Biteship (PRD-v1.2 §8, kontrak props §12.25).
     *
     * Semua guard dan penulisan kolom ada di `BiteshipService::createOrder`; controller
     * hanya meneruskan hasil ke `flash.success`/`flash.error` (tidak pernah 500).
     */
    public function resiOtomatis(Order $order): RedirectResponse
    {
        $hasil = $this->biteship->createOrder($order);

        return back()->with($hasil['ok'] ? 'success' : 'error', $hasil['pesan']);
    }

    /**
     * Sinkronkan status pembayaran langsung dari Midtrans (kontrak props §12.24).
     *
     * Dipakai saat webhook tidak bisa masuk (pengembangan lokal). Tidak menulis ke
     * `payments`/`orders`/stok sendiri: penerapan status lewat `MidtransService`, jalur
     * yang sama dengan webhook, sehingga idempoten dan status final tidak pernah mundur.
     *
     * Gagal menghubungi Midtrans → `flash.error`, bukan 500; status tersimpan tidak berubah.
     */
    public function syncPayment(Order $order): RedirectResponse
    {
        $order->loadMissing('payment');
        $payment = $order->payment;

        if ($payment === null) {
            return back()->with('error', 'Pesanan ini belum punya tagihan pembayaran, jadi status tidak bisa disinkronkan.');
        }

        if ($order->payment_status === Order::PAYMENT_SETTLEMENT) {
            return back()->with('success', 'Pembayaran sudah lunas, sinkronisasi tidak perlu dijalankan.');
        }

        if ($this->midtrans->isFake() || $this->midtrans->isFakeCharge($payment)) {
            return back()->with('error', 'Mode uji Midtrans: status tidak bisa disinkronkan.');
        }

        $statusBefore = (string) $order->payment_status;
        $orderStatusBefore = (string) $order->status;

        try {
            $this->midtrans->syncStatusOrFail($payment);
        } catch (CheckoutException) {
            return back()->with('error', 'Gagal memeriksa status pembayaran. Coba lagi.');
        }

        $order->refresh();

        $statusAfter = (string) $order->payment_status;
        $orderStatusAfter = (string) $order->status;

        Log::info('Admin menyinkronkan status pembayaran dari Midtrans.', [
            'order' => $order->code,
            'payment' => $statusBefore.' -> '.$statusAfter,
            'order_status' => $orderStatusBefore.' -> '.$orderStatusAfter,
        ]);

        if ($statusAfter !== $statusBefore) {
            return back()->with('success', 'Status pembayaran diperbarui dari '.$this->paymentLabel($statusBefore).' ke '.$this->paymentLabel($statusAfter).'.');
        }

        return back()->with('success', 'Status pembayaran tidak berubah: '.$this->paymentLabel($statusAfter).'.');
    }

    /**
     * @param  array<string, array{courier_name: string, service_name: string}>  $labels
     * @return array<string, mixed>
     */
    private function row(Order $order, array $labels): array
    {
        $shipping = $this->biteship->shippingInfo($order, $labels);

        return [
            'id' => $order->id,
            'code' => $order->code,
            'status' => $order->status,
            'status_label' => Order::statusLabel($order->status),
            'payment_status' => $order->payment_status,
            'payment_label' => $this->paymentLabel($order->payment_status),
            'payment_method_label' => Order::paymentMethodLabel($order->payment_method),
            'customer_name' => $order->customer_name,
            'customer_phone' => $order->customer_phone,
            'customer_email' => $order->customer_email,
            'total' => (int) $order->total,
            'items_count' => (int) ($order->items_count ?? 0),
            'courier_name' => $shipping['courier_name'],
            'service_name' => $shipping['service_name'],
            'tracking_number' => $order->tracking_number,
            'shipping_status' => $order->shipping_status,
            'shipping_status_label' => BiteshipService::shippingLabel($order->shipping_status),
            'shipping_updated_at' => $order->shipping_updated_at?->toIso8601String(),
            'shipping_perlu_tindakan' => $this->biteship->shippingPerluTindakan($order),
            'mode_uji' => $this->modeUji($order),
            'paid_at' => $order->paid_at?->toIso8601String(),
            'created_at' => $order->created_at?->toIso8601String(),
            'url' => '/admin/pesanan/'.$order->id,
        ];
    }

    /**
     * @param  array<string, array{courier_name: string, service_name: string}>  $labels
     * @return array<string, mixed>
     */
    private function detail(Order $order, array $labels): array
    {
        $payment = $order->payment;

        return [
            'id' => $order->id,
            'code' => $order->code,
            'status' => $order->status,
            'status_label' => Order::statusLabel($order->status),
            'payment_status' => $order->payment_status,
            'payment_label' => $this->paymentLabel($order->payment_status),
            'subtotal' => (int) $order->subtotal,
            'shipping_cost' => (int) $order->shipping_cost,
            'discount' => (int) $order->discount,
            'total' => (int) $order->total,
            'payment_method' => $order->payment_method,
            'payment_method_label' => Order::paymentMethodLabel($order->payment_method),
            'notes' => $order->notes,
            'tracking_number' => $order->tracking_number,
            'mode_uji' => $this->modeUji($order),
            'customer' => [
                'name' => $order->customer_name,
                'phone' => $order->customer_phone,
                'email' => $order->customer_email,
                'address' => $order->shipping_address,
                'city' => $order->city,
                'postal_code' => $order->postal_code,
            ],
            'items' => $order->items
                ->map(fn ($item) => [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'variant_label' => $item->variant_label,
                    'qty' => (int) $item->qty,
                    'unit_price' => (int) $item->unit_price,
                    'line_total' => (int) $item->line_total,
                ])
                ->values()
                ->all(),
            'shipping' => $this->biteship->shippingInfoAdmin($order, $labels),
            'payment' => $payment === null ? null : $this->paymentRow($payment),
            'timeline' => [
                'created_at' => $order->created_at?->toIso8601String(),
                'paid_at' => $order->paid_at?->toIso8601String(),
                'shipped_at' => $order->shipped_at?->toIso8601String(),
            ],
            'created_at' => $order->created_at?->toIso8601String(),
            'paid_at' => $order->paid_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function paymentRow(Payment $payment): array
    {
        return [
            'provider' => $payment->provider,
            'status' => $payment->status,
            'transaction_id' => $payment->transaction_id,
            'metode' => $this->midtrans->channelOf($payment),
            'instruksi' => $this->midtrans->instructions($payment),
            'payment_type' => $payment->payment_type,
            'fake' => $this->midtrans->isFakeCharge($payment),
            'gross_amount' => (int) $payment->gross_amount,
            'expires_at' => $payment->expires_at?->toIso8601String(),
            'paid_at' => $payment->paid_at?->toIso8601String(),
        ];
    }

    /**
     * Badge `Mode uji` (design-v1.2 §7.1): tagihan uji Midtrans atau resi Biteship mode uji.
     */
    private function modeUji(Order $order): bool
    {
        return $this->midtrans->isFakeCharge($order->payment)
            || (bool) ($order->shipping_payload['mode_uji'] ?? false);
    }

    private function paymentLabel(?string $status): string
    {
        return Order::PAYMENT_LABELS[$status ?? ''] ?? 'Tidak dikenal';
    }
}

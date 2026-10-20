<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ListProps;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Exceptions\OrderStatusException;
use App\Models\Order;
use App\Models\Payment;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Pesanan admin — daftar, detail, dan perubahan status (PRD §5.2, §7, kontrak props §12.16–§12.18).
 *
 * Perubahan status (termasuk pengembalian stok saat batal) dikerjakan OrderService.
 */
class OrderController extends Controller
{
    use ListProps;

    public function __construct(private readonly OrderService $orders) {}

    public function index(Request $request): Response
    {
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
            'dari' => $this->tanggal($request->query('dari')),
            'sampai' => $this->tanggal($request->query('sampai')),
        ];

        $query = Order::query()->withCount('items');

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

        return Inertia::render('Admin/Orders/Index', [
            'pesanan' => [
                'data' => collect($pesanan->items())->map(fn (Order $row) => $this->row($row))->all(),
                'links' => $pesanan->linkCollection()->all(),
                'meta' => $this->meta($pesanan),
            ],
            'filter' => $filter,
            'ringkasan' => $ringkasan,
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['items', 'payment']);

        return Inertia::render('Admin/Orders/Show', [
            'pesanan' => $this->detail($order),
            'status_berikut' => collect($order->nextStatuses())
                ->map(fn (string $status) => [
                    'value' => $status,
                    'label' => Order::statusLabel($status),
                ])
                ->all(),
        ]);
    }

    public function status(UpdateOrderStatusRequest $request, Order $order): RedirectResponse
    {
        try {
            $this->orders->changeStatusByAdmin(
                $order,
                $request->validated(),
                $request->user('admin')?->id,
            );
        } catch (OrderStatusException $exception) {
            throw ValidationException::withMessages(['status' => $exception->getMessage()]);
        }

        return back()->with('success', 'Status pesanan diperbarui.');
    }

    /**
     * @return array<string, mixed>
     */
    private function row(Order $order): array
    {
        return [
            'id' => $order->id,
            'code' => $order->code,
            'status' => $order->status,
            'status_label' => Order::statusLabel($order->status),
            'payment_status' => $order->payment_status,
            'payment_label' => $this->paymentLabel($order->payment_status),
            'customer_name' => $order->customer_name,
            'customer_phone' => $order->customer_phone,
            'customer_email' => $order->customer_email,
            'total' => (int) $order->total,
            'items_count' => (int) ($order->items_count ?? 0),
            'paid_at' => $order->paid_at?->toIso8601String(),
            'created_at' => $order->created_at?->toIso8601String(),
            'url' => '/admin/pesanan/'.$order->id,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function detail(Order $order): array
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
            'notes' => $order->notes,
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
            'payment' => $payment === null ? null : $this->paymentRow($payment),
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
            'qris_url' => $payment->qris_url,
            'qr_string' => $payment->qr_string,
            'gross_amount' => (int) $payment->gross_amount,
            'expires_at' => $payment->expires_at?->toIso8601String(),
            'paid_at' => $payment->paid_at?->toIso8601String(),
        ];
    }

    private function paymentLabel(?string $status): string
    {
        return Order::PAYMENT_LABELS[$status ?? ''] ?? 'Tidak dikenal';
    }
}

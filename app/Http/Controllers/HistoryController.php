<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\ProductImage;
use App\Services\BiteshipService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Riwayat pesanan pembeli — `GET /history` (docs/rencana-perbaikan-5.md baris 1,
 * kontrak props §13).
 *
 * Rute wajib login guard `web`; tamu diarahkan middleware `auth:web` ke `/login`.
 * Halaman hanya membaca pesanan milik user login (tanpa filter dari klien) dan
 * menampilkan semua status — termasuk `batal` — terbaru dulu, 10 per halaman.
 */
class HistoryController extends Controller
{
    private const PER_PAGE = 10;

    public function __construct(private readonly BiteshipService $biteship) {}

    public function index(Request $request): Response
    {
        $user = $request->user('web');

        // v1.5: `?status=` hanya menerima status sah; nilai asing/berulang diabaikan.
        $status = $request->query('status');
        $status = is_string($status) && in_array($status, [...Order::STATUS_FLOW, Order::STATUS_CANCELLED], true)
            ? $status
            : null;

        $orders = Order::query()
            ->where('user_id', $user->id)
            ->when($status !== null, fn ($query) => $query->where('status', $status))
            ->with('items')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(self::PER_PAGE)
            ->withQueryString();

        $images = $this->primaryImages($orders->getCollection());

        // Ringkasan dihitung dari seluruh pesanan user, bukan hanya halaman ini dan tidak
        // ikut filter `?status=` (kontrak §13).
        $perStatus = Order::query()
            ->where('user_id', $user->id)
            ->selectRaw('status, count(*) as jumlah')
            ->groupBy('status')
            ->pluck('jumlah', 'status');

        $ringkasan = ['total' => (int) $perStatus->sum()];

        foreach ([...Order::STATUS_FLOW, Order::STATUS_CANCELLED] as $namaStatus) {
            $ringkasan[$namaStatus] = (int) $perStatus->get($namaStatus, 0);
        }

        $labels = $this->biteship->serviceLabels();

        return Inertia::render('Public/History', [
            'orders' => [
                'data' => $orders->getCollection()
                    ->map(fn (Order $order) => $this->row($order, $images, $labels))
                    ->all(),
                'links' => $orders->linkCollection()->all(),
                'meta' => [
                    'current_page' => $orders->currentPage(),
                    'last_page' => $orders->lastPage(),
                    'per_page' => $orders->perPage(),
                    'total' => $orders->total(),
                ],
            ],
            'ringkasan' => $ringkasan,
            'filter' => ['status' => $status],
        ]);
    }

    /**
     * Satu baris riwayat (kontrak §13).
     *
     * @param  array<int, string>  $images  peta `product_id` → path gambar utama
     * @param  array<string, array{courier_name: string, service_name: string}>  $labels
     * @return array<string, mixed>
     */
    private function row(Order $order, array $images, array $labels): array
    {
        return [
            'id' => (int) $order->id,
            'code' => $order->code,
            'status' => $order->status,
            'status_label' => Order::statusLabel($order->status),
            'payment_status' => $order->payment_status,
            'payment_label' => Order::paymentLabel($order->payment_status),
            'subtotal' => (int) $order->subtotal,
            'shipping_cost' => (int) $order->shipping_cost,
            'discount' => (int) $order->discount,
            'total' => (int) $order->total,
            'items_count' => $order->items->count(),
            'total_qty' => (int) $order->items->sum('qty'),
            'created_at' => $order->created_at?->toIso8601String(),
            'paid_at' => $order->paid_at?->toIso8601String(),
            'detail_url' => $this->detailUrl($order),
            'customer' => [
                'name' => $order->customer_name,
                'phone' => $order->customer_phone,
                'address' => $order->shipping_address,
                'city' => $order->city,
                'postal_code' => $order->postal_code,
            ],
            // `galat` = pesan penjaga tombol resi otomatis milik admin (§12.17). Pembeli tidak
            // menerimanya (PRD §9, QA B-01): key tetap ada bernilai null agar bentuk §13 sama.
            'shipping' => array_merge(
                $this->biteship->shippingInfo($order, $labels),
                ['galat' => null],
            ),
            'timeline' => [
                'created_at' => $order->created_at?->toIso8601String(),
                'paid_at' => $order->paid_at?->toIso8601String(),
                'shipped_at' => $order->shipped_at?->toIso8601String(),
                // v1.4 (PRD-v1.4 §4.2): node `Selesai` aktif bila terisi.
                'completed_at' => $this->biteship->shippingCompletedAt($order),
            ],
            'items' => $order->items->map(fn ($item) => [
                'id' => (int) $item->id,
                'product_id' => $item->product_id !== null ? (int) $item->product_id : null,
                'variant_id' => $item->product_variant_id !== null ? (int) $item->product_variant_id : null,
                'name' => $item->product_name,
                'variant_label' => $item->variant_label,
                'qty' => (int) $item->qty,
                'unit_price' => (int) $item->unit_price,
                'line_total' => (int) $item->line_total,
                'image' => $item->product_id !== null
                    ? ($images[(int) $item->product_id] ?? null)
                    : null,
            ])->values()->all(),
        ];
    }

    /**
     * Halaman yang bisa dibuka pembeli untuk pesanan ini, atau `null` bila tidak ada
     * (kontrak §13). Tidak ada rute detail pesanan khusus; `null` bukan galat.
     */
    private function detailUrl(Order $order): ?string
    {
        if ($order->payment_status === Order::PAYMENT_SETTLEMENT) {
            return route('checkout.success', $order);
        }

        if ($order->status === Order::STATUS_PENDING && $order->payment_status === Order::PAYMENT_PENDING) {
            return route('checkout.pay', $order);
        }

        return null;
    }

    /**
     * Gambar utama semua produk pada halaman ini dalam satu query (hindari N+1).
     *
     * @param  Collection<int, Order>  $orders
     * @return array<int, string>
     */
    private function primaryImages(Collection $orders): array
    {
        $productIds = $orders
            ->flatMap(fn (Order $order) => $order->items->pluck('product_id'))
            ->filter(fn ($id) => $id !== null)
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();

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
}

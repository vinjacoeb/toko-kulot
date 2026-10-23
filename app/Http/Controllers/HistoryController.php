<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\ProductImage;
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

    public function index(Request $request): Response
    {
        $user = $request->user('web');

        $orders = Order::query()
            ->where('user_id', $user->id)
            ->with('items')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(self::PER_PAGE);

        $images = $this->primaryImages($orders->getCollection());

        // Ringkasan dihitung dari seluruh pesanan user, bukan hanya halaman ini.
        $perStatus = Order::query()
            ->where('user_id', $user->id)
            ->selectRaw('status, count(*) as jumlah')
            ->groupBy('status')
            ->pluck('jumlah', 'status');

        $ringkasan = ['total' => (int) $orders->total()];

        foreach ([...Order::STATUS_FLOW, Order::STATUS_CANCELLED] as $status) {
            $ringkasan[$status] = (int) $perStatus->get($status, 0);
        }

        return Inertia::render('Public/History', [
            'orders' => [
                'data' => $orders->getCollection()
                    ->map(fn (Order $order) => $this->row($order, $images))
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
        ]);
    }

    /**
     * Satu baris riwayat (kontrak §13).
     *
     * @param  array<int, string>  $images  peta `product_id` → path gambar utama
     * @return array<string, mixed>
     */
    private function row(Order $order, array $images): array
    {
        return [
            'id' => (int) $order->id,
            'code' => $order->code,
            'status' => $order->status,
            'status_label' => Order::statusLabel($order->status),
            'payment_status' => $order->payment_status,
            'payment_label' => Order::paymentLabel($order->payment_status),
            'total' => (int) $order->total,
            'items_count' => $order->items->count(),
            'total_qty' => (int) $order->items->sum('qty'),
            'created_at' => $order->created_at?->toIso8601String(),
            'paid_at' => $order->paid_at?->toIso8601String(),
            'detail_url' => $this->detailUrl($order),
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

<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

/**
 * Sumber data halaman & ekspor laporan admin (kontrak props §14).
 */
class ReportService
{
    public const PERIODE = ['hari-ini', '7-hari', 'bulan-ini', 'kustom'];

    private const DEFAULT_PERIODE = 'bulan-ini';

    /**
     * Selesaikan periode menjadi rentang tanggal inklusif (zona app).
     * Nilai asing jatuh ke bulan ini supaya halaman tidak pernah 422.
     *
     * @return array{periode: string, dari: string, sampai: string, start: CarbonImmutable, end: CarbonImmutable}
     */
    public function resolve(?string $periode, ?string $dari, ?string $sampai): array
    {
        $periode = in_array($periode, self::PERIODE, true) ? $periode : self::DEFAULT_PERIODE;
        $hariIni = CarbonImmutable::today();

        $kustom = $periode === 'kustom' ? $this->customRange($dari, $sampai) : null;
        if ($periode === 'kustom' && $kustom === null) {
            $periode = self::DEFAULT_PERIODE;
        }

        [$start, $end] = match ($periode) {
            'hari-ini' => [$hariIni, $hariIni],
            '7-hari' => [$hariIni->subDays(6), $hariIni],
            'kustom' => $kustom,
            default => [$hariIni->startOfMonth(), $hariIni->endOfMonth()],
        };

        return [
            'periode' => $periode,
            'dari' => $start->toDateString(),
            'sampai' => $end->toDateString(),
            'start' => $start->startOfDay(),
            'end' => $end->endOfDay(),
        ];
    }

    /**
     * Rentang kustom dari input `YYYY-MM-DD`. Null bila tidak lengkap,
     * format salah, atau dari > sampai.
     *
     * @return array{0: CarbonImmutable, 1: CarbonImmutable}|null
     */
    private function customRange(?string $dari, ?string $sampai): ?array
    {
        if (! $dari || ! $sampai) {
            return null;
        }

        try {
            $start = CarbonImmutable::createFromFormat('!Y-m-d', $dari);
            $end = CarbonImmutable::createFromFormat('!Y-m-d', $sampai);
        } catch (\Throwable) {
            return null;
        }

        if (! $start || ! $end || $start->toDateString() !== $dari || $end->toDateString() !== $sampai) {
            return null;
        }

        if ($start->greaterThan($end)) {
            return null;
        }

        return [$start->startOfDay(), $end->endOfDay()];
    }

    /** @return array{omzet: int, jumlah_pesanan: int, rata_rata: int, total_ongkir: int, total_diskon: int, produk_terlaris: array<int, array{nama: string, qty: int, omzet: int}>} */
    public function ringkasan(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $row = Order::query()
            ->whereBetween('created_at', [$start, $end])
            ->whereIn('status', Order::REVENUE_STATUSES)
            ->selectRaw('COUNT(*) AS jumlah, COALESCE(SUM(total), 0) AS omzet, COALESCE(SUM(shipping_cost), 0) AS ongkir, COALESCE(SUM(discount), 0) AS diskon')
            ->first();

        $jumlah = (int) ($row->jumlah ?? 0);
        $omzet = (int) ($row->omzet ?? 0);

        return [
            'omzet' => $omzet,
            'jumlah_pesanan' => $jumlah,
            'rata_rata' => $jumlah > 0 ? (int) round($omzet / $jumlah) : 0,
            'total_ongkir' => (int) ($row->ongkir ?? 0),
            'total_diskon' => (int) ($row->diskon ?? 0),
            'produk_terlaris' => $this->produkTerlaris($start, $end),
        ];
    }

    /** @return array<int, array{nama: string, qty: int, omzet: int}> */
    public function produkTerlaris(CarbonImmutable $start, CarbonImmutable $end, int $limit = 5): array
    {
        return OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereBetween('orders.created_at', [$start, $end])
            ->whereIn('orders.status', Order::REVENUE_STATUSES)
            ->groupBy('order_items.product_name')
            ->orderByDesc(DB::raw('SUM(order_items.qty)'))
            ->limit($limit)
            ->get([
                DB::raw('order_items.product_name AS nama'),
                DB::raw('SUM(order_items.qty) AS qty'),
                DB::raw('SUM(order_items.line_total) AS omzet'),
            ])
            ->map(fn ($row) => [
                'nama' => (string) $row->nama,
                'qty' => (int) $row->qty,
                'omzet' => (int) $row->omzet,
            ])
            ->all();
    }

    /** Semua pesanan pada periode (semua status) — sheet Pesanan. */
    public function ordersQuery(CarbonImmutable $start, CarbonImmutable $end): Builder
    {
        return Order::query()
            ->whereBetween('created_at', [$start, $end])
            ->with('payment')
            ->orderBy('created_at')
            ->orderBy('id');
    }

    /** Semua item pesanan pada periode (semua status) — sheet Detail Item. */
    public function itemsQuery(CarbonImmutable $start, CarbonImmutable $end): Builder
    {
        return OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereBetween('orders.created_at', [$start, $end])
            ->orderBy('orders.created_at')
            ->orderBy('order_items.id')
            ->select([
                'order_items.id',
                'orders.code as order_code',
                'orders.created_at as order_created_at',
                'order_items.product_name',
                'order_items.variant_label',
                'order_items.qty',
                'order_items.unit_price',
                'order_items.line_total',
            ]);
    }

    /** Stok akhir seluruh varian — sheet Stok. */
    public function stokQuery(): Builder
    {
        return ProductVariant::query()
            ->join('products', 'products.id', '=', 'product_variants.product_id')
            ->with('product:id,name')
            ->select('product_variants.*')
            ->orderBy('products.name')
            ->orderBy('product_variants.id');
    }
}

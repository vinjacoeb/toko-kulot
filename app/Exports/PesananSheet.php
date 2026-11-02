<?php

namespace App\Exports;

use App\Models\Order;
use App\Services\ReportService;
use Carbon\CarbonImmutable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStrictNullComparison;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;

class PesananSheet implements FromQuery, WithColumnWidths, WithEvents, WithHeadings, WithMapping, WithStrictNullComparison, WithTitle
{
    public function __construct(
        private readonly ReportService $reports,
        private readonly CarbonImmutable $start,
        private readonly CarbonImmutable $end,
    ) {}

    public function query()
    {
        return $this->reports->ordersQuery($this->start, $this->end);
    }

    public function headings(): array
    {
        return [
            'No Order', 'Tanggal', 'Pembeli', 'Status', 'Metode Bayar',
            'Subtotal', 'Diskon', 'Ongkir Asli', 'Ongkir Ditanggung Toko', 'Total', 'Resi',
        ];
    }

    /** @param  Order  $order */
    public function map($order): array
    {
        $ongkirAsli = $this->ongkirAsli($order);

        return [
            $order->code,
            $order->created_at?->format('d/m/Y H:i'),
            $order->customer_name,
            Order::statusLabel($order->status),
            Order::paymentMethodLabel($order->payment?->payment_type ?? $order->payment_method),
            (int) $order->subtotal,
            (int) $order->discount,
            $ongkirAsli,
            max(0, $ongkirAsli - (int) $order->shipping_cost),
            (int) $order->total,
            $order->tracking_number,
        ];
    }

    /**
     * Tarif asli sebelum gratis ongkir. Diambil dari kolom snapshot; order lama
     * tanpa snapshot memakai harga Biteship di payload, lalu ongkir yang dibayar.
     */
    private function ongkirAsli(Order $order): int
    {
        if ($order->shipping_cost_original !== null) {
            return (int) $order->shipping_cost_original;
        }

        $payloadPrice = $order->shipping_payload['price'] ?? null;
        if (is_numeric($payloadPrice)) {
            return (int) $payloadPrice;
        }

        return (int) $order->shipping_cost;
    }

    /**
     * Gaya + format rupiah hanya pada baris terpakai. Rentang besar (mis. 100 ribu baris)
     * memaksa PhpSpreadsheet membuat sel sebanyak itu dan kehabisan memori.
     */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event): void {
                $sheet = $event->sheet->getDelegate();
                $terakhir = $sheet->getHighestRow();

                SheetStyle::header($sheet, 1, 'A', 'K', ['F', 'G', 'H', 'I', 'J']);
                $sheet->freezePane('A2');
                $sheet->setAutoFilter('A1:K'.max(1, $terakhir));
                SheetStyle::rows($sheet, 2, $terakhir, 'A', 'K');
                SheetStyle::format($sheet, 'F', 'J', 2, $terakhir, SheetStyle::RUPIAH);
            },
        ];
    }

    public function title(): string
    {
        return 'Pesanan';
    }

    public function columnWidths(): array
    {
        return [
            'A' => 22, 'B' => 18, 'C' => 28, 'D' => 12, 'E' => 18,
            'F' => 14, 'G' => 14, 'H' => 14, 'I' => 24, 'J' => 14, 'K' => 24,
        ];
    }
}

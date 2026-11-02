<?php

namespace App\Exports;

use App\Models\OrderItem;
use App\Services\ReportService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStrictNullComparison;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;

class DetailItemSheet implements FromQuery, WithColumnWidths, WithEvents, WithHeadings, WithMapping, WithStrictNullComparison, WithTitle
{
    public function __construct(
        private readonly ReportService $reports,
        private readonly CarbonImmutable $start,
        private readonly CarbonImmutable $end,
    ) {}

    public function query()
    {
        return $this->reports->itemsQuery($this->start, $this->end);
    }

    public function headings(): array
    {
        return ['No Order', 'Tanggal', 'Produk', 'Varian', 'Qty', 'Harga', 'Subtotal'];
    }

    /** @param  OrderItem  $item */
    public function map($item): array
    {
        return [
            $item->order_code,
            $item->order_created_at ? Carbon::parse($item->order_created_at)->format('d/m/Y H:i') : null,
            $item->product_name,
            $item->variant_label,
            (int) $item->qty,
            (int) $item->unit_price,
            (int) $item->line_total,
        ];
    }

    /** Gaya + format hanya baris terpakai (lihat PesananSheet) agar memori aman. */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event): void {
                $sheet = $event->sheet->getDelegate();
                $terakhir = $sheet->getHighestRow();

                SheetStyle::header($sheet, 1, 'A', 'G', ['E', 'F', 'G']);
                $sheet->freezePane('A2');
                $sheet->setAutoFilter('A1:G'.max(1, $terakhir));
                SheetStyle::rows($sheet, 2, $terakhir, 'A', 'G');
                SheetStyle::format($sheet, 'E', 'E', 2, $terakhir, SheetStyle::QTY);
                SheetStyle::format($sheet, 'F', 'G', 2, $terakhir, SheetStyle::RUPIAH);
            },
        ];
    }

    public function title(): string
    {
        return 'Detail Item';
    }

    public function columnWidths(): array
    {
        return ['A' => 22, 'B' => 18, 'C' => 32, 'D' => 20, 'E' => 8, 'F' => 14, 'G' => 14];
    }
}

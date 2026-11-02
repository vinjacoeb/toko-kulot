<?php

namespace App\Exports;

use App\Models\ProductVariant;
use App\Services\ReportService;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStrictNullComparison;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;

class StokSheet implements FromQuery, WithColumnWidths, WithEvents, WithHeadings, WithMapping, WithStrictNullComparison, WithTitle
{
    public function __construct(private readonly ReportService $reports) {}

    public function query()
    {
        return $this->reports->stokQuery();
    }

    public function headings(): array
    {
        return ['SKU', 'Produk', 'Varian', 'Stok Akhir', 'Status'];
    }

    /** @param  ProductVariant  $variant */
    public function map($variant): array
    {
        return [
            $variant->sku,
            $variant->product?->name,
            $variant->label(),
            (int) $variant->stock,
            $this->statusStok((int) $variant->stock),
        ];
    }

    private function statusStok(int $stock): string
    {
        if ($stock <= 0) {
            return 'Habis';
        }

        return $stock < 5 ? 'Menipis' : 'Aman';
    }

    /** Gaya + format hanya baris terpakai (lihat PesananSheet) agar memori aman. */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event): void {
                $sheet = $event->sheet->getDelegate();
                $terakhir = $sheet->getHighestRow();

                SheetStyle::header($sheet, 1, 'A', 'E', ['D']);
                $sheet->freezePane('A2');
                $sheet->setAutoFilter('A1:E'.max(1, $terakhir));
                SheetStyle::rows($sheet, 2, $terakhir, 'A', 'E');
                SheetStyle::format($sheet, 'D', 'D', 2, $terakhir, SheetStyle::QTY);
            },
        ];
    }

    public function title(): string
    {
        return 'Stok';
    }

    public function columnWidths(): array
    {
        return ['A' => 22, 'B' => 34, 'C' => 20, 'D' => 12, 'E' => 12];
    }
}

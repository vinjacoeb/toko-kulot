<?php

namespace App\Exports;

use App\Services\ReportService;
use Carbon\CarbonImmutable;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

/**
 * Workbook laporan admin — 4 sheet sesuai kontrak props §14.2.
 */
class LaporanExport implements WithMultipleSheets
{
    public function __construct(
        private readonly ReportService $reports,
        private readonly CarbonImmutable $start,
        private readonly CarbonImmutable $end,
    ) {}

    public function sheets(): array
    {
        return [
            'Ringkasan' => new RingkasanSheet($this->reports, $this->start, $this->end),
            'Pesanan' => new PesananSheet($this->reports, $this->start, $this->end),
            'Detail Item' => new DetailItemSheet($this->reports, $this->start, $this->end),
            'Stok' => new StokSheet($this->reports),
        ];
    }
}

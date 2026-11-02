<?php

namespace App\Exports;

use App\Services\ReportService;
use Carbon\CarbonImmutable;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithStrictNullComparison;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;

/**
 * Nomor baris di sini = baris nyata di sheet. Writer (maatwebsite/excel
 * Sheet::toArray via flatMap) membuang baris array kosong, jadi array()
 * sengaja tidak memakai baris pemisah [] dan indeks array == nomor baris.
 */
class RingkasanSheet implements FromArray, WithColumnWidths, WithEvents, WithStrictNullComparison, WithTitle
{
    private const HEADER_RINGKASAN = 3;

    private const BARIS_PERTAMA_RINGKASAN = 4;

    private const BARIS_TERAKHIR_RINGKASAN = 8;

    private const HEADER_PRODUK = 9;

    private const BARIS_PERTAMA_PRODUK = 10;

    public function __construct(
        private readonly ReportService $reports,
        private readonly CarbonImmutable $start,
        private readonly CarbonImmutable $end,
    ) {}

    public function array(): array
    {
        $ringkasan = $this->reports->ringkasan($this->start, $this->end);
        $periode = $this->start->locale('id')->translatedFormat('j F Y')
            .' – '.$this->end->locale('id')->translatedFormat('j F Y');

        $rows = [
            ['Laporan Penjualan Toko Daster Kulot'],
            ['Periode', $periode],
            ['Ringkasan', 'Nilai'],
            ['Omzet (pesanan dibayar selesai)', $ringkasan['omzet']],
            ['Jumlah pesanan', $ringkasan['jumlah_pesanan']],
            ['Rata-rata nilai pesanan', $ringkasan['rata_rata']],
            ['Total ongkir', $ringkasan['total_ongkir']],
            ['Total diskon', $ringkasan['total_diskon']],
            ['Produk terlaris', 'Qty', 'Omzet'],
        ];

        if ($ringkasan['produk_terlaris'] === []) {
            $rows[] = ['Belum ada penjualan pada periode ini'];
        } else {
            foreach ($ringkasan['produk_terlaris'] as $item) {
                $rows[] = [$item['nama'], $item['qty'], $item['omzet']];
            }
        }

        return $rows;
    }

    /** Gaya dan number format dihitung dari baris terpakai — tanpa rentang mati. */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event): void {
                $sheet = $event->sheet->getDelegate();
                $terakhir = $sheet->getHighestRow();

                $sheet->mergeCells('A1:C1');
                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
                $sheet->freezePane('A'.self::BARIS_PERTAMA_RINGKASAN);

                SheetStyle::header($sheet, self::HEADER_RINGKASAN, 'A', 'B', ['B']);
                SheetStyle::header($sheet, self::HEADER_PRODUK, 'A', 'C', ['B', 'C']);

                SheetStyle::rows($sheet, self::BARIS_PERTAMA_RINGKASAN, self::BARIS_TERAKHIR_RINGKASAN, 'A', 'B');
                SheetStyle::rows($sheet, self::BARIS_PERTAMA_PRODUK, $terakhir, 'A', 'C');

                SheetStyle::format($sheet, 'B', 'B', self::BARIS_PERTAMA_RINGKASAN, self::BARIS_PERTAMA_RINGKASAN, SheetStyle::RUPIAH);
                SheetStyle::format($sheet, 'B', 'B', self::BARIS_PERTAMA_RINGKASAN + 1, self::BARIS_PERTAMA_RINGKASAN + 1, SheetStyle::QTY);
                SheetStyle::format($sheet, 'B', 'B', self::BARIS_PERTAMA_RINGKASAN + 2, self::BARIS_TERAKHIR_RINGKASAN, SheetStyle::RUPIAH);

                // Produk terlaris bisa lebih dari 5 baris: batas bawah dari data, bukan angka mati.
                SheetStyle::format($sheet, 'B', 'B', self::BARIS_PERTAMA_PRODUK, $terakhir, SheetStyle::QTY);
                SheetStyle::format($sheet, 'C', 'C', self::BARIS_PERTAMA_PRODUK, $terakhir, SheetStyle::RUPIAH);
            },
        ];
    }

    public function title(): string
    {
        return 'Ringkasan';
    }

    public function columnWidths(): array
    {
        return ['A' => 36, 'B' => 20, 'C' => 20];
    }
}

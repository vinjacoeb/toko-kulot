<?php

namespace App\Exports;

use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Gaya visual bersama 4 sheet laporan (v1.7). Hanya tampilan — isi sel tidak disentuh.
 * Semua metode aman untuk sheet yang hanya berisi header (tidak menyentuh baris data kosong).
 */
final class SheetStyle
{
    public const RUPIAH = '"Rp" #,##0';

    public const QTY = '#,##0';

    private const NAVY = 'FF1F2A5E';

    private const ZEBRA = 'FFF6F6F4';

    private const LINE = 'FFE5E7EB';

    /**
     * Gaya header tabel: latar navy, teks putih tebal, tinggi 22, border bawah tipis.
     *
     * @param  string[]  $right  kolom huruf yang headernya rata kanan (kolom angka)
     */
    public static function header(Worksheet $sheet, int $row, string $firstCol, string $lastCol, array $right = []): void
    {
        $sheet->getStyle("{$firstCol}{$row}:{$lastCol}{$row}")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::NAVY]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['bottom' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => self::LINE]]],
        ]);

        foreach ($right as $col) {
            $sheet->getStyle("{$col}{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        }

        $sheet->getRowDimension($row)->setRowHeight(22);
    }

    /** Border tipis semua sisi + zebra pada baris data genap. */
    public static function rows(Worksheet $sheet, int $firstRow, int $lastRow, string $firstCol, string $lastCol): void
    {
        if ($lastRow < $firstRow) {
            return;
        }

        $sheet->getStyle("{$firstCol}{$firstRow}:{$lastCol}{$lastRow}")->applyFromArray([
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => self::LINE]]],
        ]);

        for ($row = $firstRow; $row <= $lastRow; $row++) {
            if ($row % 2 === 0) {
                $sheet->getStyle("{$firstCol}{$row}:{$lastCol}{$row}")->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::ZEBRA]],
                ]);
            }
        }
    }

    /** Number format hanya pada baris terpakai (tidak membuat sel di luar data). */
    public static function format(Worksheet $sheet, string $firstCol, string $lastCol, int $firstRow, int $lastRow, string $code): void
    {
        if ($lastRow < $firstRow) {
            return;
        }

        $sheet->getStyle("{$firstCol}{$firstRow}:{$lastCol}{$lastRow}")->getNumberFormat()->setFormatCode($code);
    }
}

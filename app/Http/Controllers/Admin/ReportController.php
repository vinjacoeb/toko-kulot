<?php

namespace App\Http\Controllers\Admin;

use App\Exports\LaporanExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReportFilterRequest;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Laporan penjualan (kontrak props §14).
 */
class ReportController extends Controller
{
    public function __construct(private readonly ReportService $reports) {}

    public function index(Request $request): Response
    {
        $periode = $this->reports->resolve(
            $this->queryString($request, 'periode'),
            $this->queryString($request, 'dari'),
            $this->queryString($request, 'sampai'),
        );

        return Inertia::render('Admin/Laporan', [
            'filter' => [
                'periode' => $periode['periode'],
                'dari' => $periode['dari'],
                'sampai' => $periode['sampai'],
            ],
            'ringkasan' => $this->reports->ringkasan($periode['start'], $periode['end']),
        ]);
    }

    public function export(ReportFilterRequest $request): BinaryFileResponse
    {
        $periode = $this->reports->resolve(
            $request->validated('periode'),
            $request->validated('dari'),
            $request->validated('sampai'),
        );

        $namaBerkas = 'laporan-'.$periode['dari'].'_sd_'.$periode['sampai'].'.xlsx';

        return Excel::download(
            new LaporanExport($this->reports, $periode['start'], $periode['end']),
            $namaBerkas,
        );
    }

    private function queryString(Request $request, string $key): ?string
    {
        $value = $request->query($key);

        return is_string($value) ? $value : null;
    }
}

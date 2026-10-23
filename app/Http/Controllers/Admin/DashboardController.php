<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Halaman awal panel admin (PRD §5.2 rute `admin.dashboard`, §9 isi dashboard).
 *
 * Seluruh angka dihitung ulang dari DB per request oleh DashboardService — tanpa cache —
 * sehingga kartu KPI, grafik 14 hari, stok kritis, pesanan, dan ulasan selalu sinkron.
 * Kontrak: docs/kontrak-props.md §6.13 (LOCKED).
 */
class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboard) {}

    public function index(): Response
    {
        return Inertia::render('Admin/Dashboard', $this->dashboard->snapshot());
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Halaman awal panel admin (PRD §5.2 rute `admin.dashboard`).
 *
 * Kartu K6 hanya menyediakan target redirect setelah login. Angka ringkas di bawah
 * dibaca langsung dari tabel; bentuk `stats` boleh diperluas kartu lanjutan (aditif).
 * Kontrak: docs/kontrak-props.md §6.13.
 */
class DashboardController extends Controller
{
    public function index(): Response
    {
        $revenueStatuses = [
            Order::STATUS_PAID,
            Order::STATUS_PROCESSING,
            Order::STATUS_SHIPPED,
            Order::STATUS_COMPLETED,
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'orders_total' => Order::query()->count(),
                'orders_pending' => Order::query()->where('status', Order::STATUS_PENDING)->count(),
                'revenue_total' => (int) Order::query()->whereIn('status', $revenueStatuses)->sum('total'),
                'products_active' => Product::query()->where('is_active', true)->count(),
            ],
        ]);
    }
}

<?php

namespace Tests\Feature\Admin;

use App\Models\Admin;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Dashboard admin `/admin` — kontrak `docs/kontrak-props.md` §6.13, aturan omzet PRD §10 — K15.
 *
 * `revenue_total` hanya menjumlahkan order berstatus dibayar/diproses/dikirim/selesai;
 * pending dan batal tidak boleh ikut terhitung.
 */
class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    private function order(string $kode, string $status, int $total): Order
    {
        return Order::create([
            'code' => $kode,
            'status' => $status,
            'subtotal' => $total,
            'shipping_cost' => 0,
            'discount' => 0,
            'total' => $total,
            'customer_name' => '[CONTOH] Pembeli',
            'customer_phone' => '0800000000',
            'shipping_address' => 'Jalan Uji No. 1',
            'city' => 'Bandung',
        ]);
    }

    public function test_dashboard_menampilkan_stats_sesuai_kontrak(): void
    {
        $admin = Admin::factory()->create();

        $this->actingAs($admin, 'admin')
            ->get('/admin')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Dashboard', false)
                ->has('stats')
                ->where('stats.orders_total', 0)
                ->where('stats.orders_pending', 0)
                ->where('stats.revenue_total', 0)
                ->where('stats.products_active', 0)
            );
    }

    public function test_revenue_total_hanya_menghitung_order_masuk_akuntansi(): void
    {
        $admin = Admin::factory()->create();

        $this->order('DS-1', Order::STATUS_PENDING, 100000);
        $this->order('DS-2', Order::STATUS_PAID, 200000);
        $this->order('DS-3', Order::STATUS_PROCESSING, 300000);
        $this->order('DS-4', Order::STATUS_SHIPPED, 400000);
        $this->order('DS-5', Order::STATUS_COMPLETED, 500000);
        $this->order('DS-6', Order::STATUS_CANCELLED, 900000);

        $this->actingAs($admin, 'admin')
            ->get('/admin')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Dashboard', false)
                ->where('stats.orders_total', 6)
                ->where('stats.orders_pending', 1)
                ->where('stats.revenue_total', 1400000)
            );
    }

    public function test_products_active_hanya_menghitung_produk_tayang(): void
    {
        $admin = Admin::factory()->create();
        $kategori = \App\Models\Category::create([
            'name' => '[CONTOH] Daster',
            'slug' => 'contoh-daster',
            'is_active' => true,
        ]);

        Product::create([
            'category_id' => $kategori->id,
            'name' => '[CONTOH] Tayang',
            'slug' => 'contoh-tayang',
            'sku' => 'CONTOH-1',
            'base_price' => 90000,
            'is_active' => true,
        ]);
        Product::create([
            'category_id' => $kategori->id,
            'name' => '[CONTOH] Draf',
            'slug' => 'contoh-draf',
            'sku' => 'CONTOH-2',
            'base_price' => 90000,
            'is_active' => false,
        ]);

        $this->actingAs($admin, 'admin')
            ->get('/admin')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Dashboard', false)
                ->where('stats.products_active', 1)
            );
    }
}

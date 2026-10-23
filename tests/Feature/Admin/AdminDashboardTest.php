<?php

namespace Tests\Feature\Admin;

use App\Models\Admin;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
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

    private function orderPada(string $kode, string $status, int $total, string $waktu): Order
    {
        $order = $this->order($kode, $status, $total);
        $order->forceFill(['created_at' => Carbon::parse($waktu)])->saveQuietly();

        return $order;
    }

    private function produk(string $slug, bool $aktif = true): Product
    {
        $kategori = Category::firstOrCreate(
            ['slug' => 'contoh-kategori'],
            ['name' => '[CONTOH] Daster', 'is_active' => true],
        );

        return Product::create([
            'category_id' => $kategori->id,
            'name' => '[CONTOH] Produk '.$slug,
            'slug' => $slug,
            'sku' => 'CONTOH-'.strtoupper($slug),
            'base_price' => 90000,
            'is_active' => $aktif,
        ]);
    }

    private function varian(Product $produk, string $sku, int $stok, bool $aktif = true): ProductVariant
    {
        return ProductVariant::create([
            'product_id' => $produk->id,
            'size' => 'M',
            'color' => 'Hitam',
            'sku' => $sku,
            'price_delta' => 0,
            'stock' => $stok,
            'is_active' => $aktif,
        ]);
    }

    public function test_dashboard_menampilkan_stats_sesuai_kontrak(): void
    {
        $this->travelTo(Carbon::parse('2026-10-22 10:00:00'));
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
                ->has('sales_14d', 14)
                ->where('sales_14d.0.date', '2026-10-09')
                ->where('sales_14d.0.total', 0)
                ->where('sales_14d.13.date', '2026-10-22')
                ->where('sales_14d.13.total', 0)
                ->has('low_stock', 0)
                ->has('recent_orders', 0)
                ->has('recent_reviews', 0)
                ->where('updated_at', Carbon::parse('2026-10-22 10:00:00')->toIso8601String())
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
        $kategori = Category::create([
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

    public function test_sales_14d_memakai_tanggal_order_dan_hanya_status_omzet(): void
    {
        $this->travelTo(Carbon::parse('2026-10-22 10:00:00'));
        $admin = Admin::factory()->create();

        // Di dalam jendela 14 hari (9–22 Oktober), status omzet.
        $this->orderPada('DS-1', Order::STATUS_PAID, 50000, '2026-10-09 00:30:00');
        $this->orderPada('DS-2', Order::STATUS_PROCESSING, 100000, '2026-10-22 09:00:00');

        // Di luar jendela (8 Oktober) — tidak boleh masuk.
        $this->orderPada('DS-3', Order::STATUS_PAID, 77000, '2026-10-08 23:59:00');

        // Status non-omzet pada hari ini — tidak boleh masuk.
        $this->orderPada('DS-4', Order::STATUS_PENDING, 999000, '2026-10-22 08:00:00');
        $this->orderPada('DS-5', Order::STATUS_CANCELLED, 888000, '2026-10-22 07:00:00');

        $this->actingAs($admin, 'admin')
            ->get('/admin')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Dashboard', false)
                ->has('sales_14d', 14)
                ->where('sales_14d.0.date', '2026-10-09')
                ->where('sales_14d.0.total', 50000)
                ->where('sales_14d.12.date', '2026-10-21')
                ->where('sales_14d.12.total', 0)
                ->where('sales_14d.13.date', '2026-10-22')
                ->where('sales_14d.13.total', 100000)
            );
    }

    public function test_low_stock_hanya_varian_aktif_dari_produk_aktif_di_bawah_lima(): void
    {
        $admin = Admin::factory()->create();

        $tayang = $this->produk('contoh-tayang');
        $this->varian($tayang, 'SKU-1', 4);            // masuk
        $this->varian($tayang, 'SKU-2', 0);            // masuk, paling kritis
        $this->varian($tayang, 'SKU-3', 5);            // batas, tidak masuk
        $this->varian($tayang, 'SKU-4', 3, false);     // varian nonaktif, tidak masuk

        $draf = $this->produk('contoh-draf', false);
        $this->varian($draf, 'SKU-5', 1);              // produk nonaktif, tidak masuk

        $this->actingAs($admin, 'admin')
            ->get('/admin')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Dashboard', false)
                ->has('low_stock', 2)
                ->where('low_stock.0.product_name', '[CONTOH] Produk contoh-tayang')
                ->where('low_stock.0.stock', 0)
                ->where('low_stock.1.stock', 4)
            );
    }

    public function test_low_stock_dibatasi_lima_baris_urut_stok_terendah(): void
    {
        $admin = Admin::factory()->create();

        $tayang = $this->produk('contoh-tayang');
        foreach ([0, 1, 2, 3, 4, 4] as $index => $stok) {
            $this->varian($tayang, 'SKU-'.$index, $stok);
        }

        $this->actingAs($admin, 'admin')
            ->get('/admin')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Dashboard', false)
                ->has('low_stock', 5)
                ->where('low_stock.0.stock', 0)
                ->where('low_stock.4.stock', 4)
            );
    }

    public function test_recent_orders_lima_terbaru_semua_status(): void
    {
        $admin = Admin::factory()->create();

        for ($hari = 16; $hari <= 21; $hari++) {
            $this->orderPada(
                'DS-'.$hari,
                $hari === 21 ? Order::STATUS_CANCELLED : Order::STATUS_PAID,
                100000 + $hari,
                '2026-10-'.$hari.' 10:00:00',
            );
        }

        $this->actingAs($admin, 'admin')
            ->get('/admin')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Dashboard', false)
                ->has('recent_orders', 5)
                ->where('recent_orders.0.code', 'DS-21')
                ->where('recent_orders.0.status', Order::STATUS_CANCELLED)
                ->where('recent_orders.4.code', 'DS-17')
                ->where('recent_orders.0.total', 100021)
            );
    }

    public function test_recent_reviews_lima_terbaru_termasuk_tersembunyi_dan_user_terhapus(): void
    {
        $admin = Admin::factory()->create();
        $produk = $this->produk('contoh-tayang');
        $pembeli = User::factory()->create(['name' => '[CONTOH] Sari']);

        for ($hari = 16; $hari <= 21; $hari++) {
            $order = $this->orderPada('DS-'.$hari, Order::STATUS_COMPLETED, 90000, '2026-10-'.$hari.' 09:00:00');
            $review = Review::create([
                'order_id' => $order->id,
                'product_id' => $produk->id,
                'user_id' => $hari === 20 ? null : $pembeli->id,
                'rating' => 5,
                'comment' => '[CONTOH] Ulasan '.$hari,
                'is_visible' => $hari !== 21,
            ]);
            $review->forceFill(['created_at' => Carbon::parse('2026-10-'.$hari.' 12:00:00')])->saveQuietly();
        }

        $this->actingAs($admin, 'admin')
            ->get('/admin')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Dashboard', false)
                ->has('recent_reviews', 5)
                ->where('recent_reviews.0.comment', '[CONTOH] Ulasan 21')
                ->where('recent_reviews.0.user_name', '[CONTOH] Sari')
                ->where('recent_reviews.1.user_name', null)
                ->where('recent_reviews.4.comment', '[CONTOH] Ulasan 17')
                ->where('recent_reviews.0.product_name', '[CONTOH] Produk contoh-tayang')
            );
    }
}

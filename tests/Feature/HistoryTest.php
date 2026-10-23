<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Riwayat pesanan pembeli `GET /history` — docs/rencana-perbaikan-5.md baris 1,
 * kontrak props §13.
 *
 * Cakupan: tamu dialihkan ke `/login`, hanya pesanan user login yang tampil,
 * semua status termasuk `batal`, urutan terbaru dulu, item & total benar,
 * pagination 10/halaman, `detail_url`, dan halaman kosong.
 */
class HistoryTest extends TestCase
{
    use RefreshDatabase;

    private int $urutan = 0;

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function pesanan(User $user, array $attributes = [], ?string $createdAt = null): Order
    {
        $this->urutan++;

        $order = Order::create(array_merge([
            'user_id' => $user->id,
            'code' => 'TK-20261023-'.str_pad((string) $this->urutan, 4, '0', STR_PAD_LEFT),
            'status' => Order::STATUS_PENDING,
            'payment_status' => Order::PAYMENT_PENDING,
            'subtotal' => 85000,
            'shipping_cost' => 20000,
            'discount' => 0,
            'total' => 105000,
            'customer_name' => '[CONTOH] Siti Aminah',
            'customer_phone' => '081234567890',
            'shipping_address' => 'Jl. Melati 12',
            'city' => 'Pekalongan',
        ], $attributes));

        if ($createdAt !== null) {
            $order->forceFill(['created_at' => $createdAt])->save();
        }

        return $order->refresh();
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function item(Order $order, array $attributes = []): OrderItem
    {
        return OrderItem::create(array_merge([
            'order_id' => $order->id,
            'product_id' => null,
            'product_variant_id' => null,
            'product_name' => '[CONTOH] Daster Kulot',
            'variant_label' => null,
            'qty' => 2,
            'unit_price' => 85000,
            'line_total' => 170000,
        ], $attributes));
    }

    private function produk(string $slug = 'contoh-daster-kulot'): Product
    {
        $kategori = Category::create([
            'name' => '[CONTOH] Daster',
            'slug' => 'contoh-daster',
            'is_active' => true,
        ]);

        return Product::create([
            'category_id' => $kategori->id,
            'name' => '[CONTOH] Daster Kulot Premium',
            'slug' => $slug,
            'base_price' => 85000,
            'is_active' => true,
        ]);
    }

    public function test_tamu_dialihkan_ke_halaman_login(): void
    {
        $this->get('/history')->assertRedirect('/login');
    }

    public function test_hanya_pesanan_sendiri_semua_status_dan_terbaru_dulu(): void
    {
        $pembeli = User::factory()->create();
        $orangLain = User::factory()->create();

        $produk = $this->produk();
        ProductImage::create([
            'product_id' => $produk->id,
            'path' => '/images/seed/produk/contoh-daster-1.png',
            'alt' => '[CONTOH] Daster Kulot Premium',
            'sort_order' => 1,
            'is_primary' => true,
        ]);

        $terlama = $this->pesanan($pembeli, [
            'status' => Order::STATUS_PENDING,
            'payment_status' => Order::PAYMENT_PENDING,
        ], '2026-10-21 10:00:00');

        $tengah = $this->pesanan($pembeli, [
            'status' => Order::STATUS_COMPLETED,
            'payment_status' => Order::PAYMENT_SETTLEMENT,
            'paid_at' => '2026-10-22 11:00:00',
        ], '2026-10-22 10:00:00');

        $batal = $this->pesanan($pembeli, [
            'status' => Order::STATUS_CANCELLED,
            'payment_status' => Order::PAYMENT_EXPIRE,
            'subtotal' => 340000,
            'total' => 360000,
        ], '2026-10-23 10:00:00');

        $this->item($batal, [
            'product_id' => $produk->id,
            'product_name' => '[CONTOH] Daster Batik Pekalongan',
            'variant_label' => 'Ukuran L / Merah',
            'qty' => 4,
            'unit_price' => 85000,
            'line_total' => 340000,
        ]);

        // Pesanan pembeli lain dibuat paling baru: tidak boleh mendorong data.0.
        $milikOrangLain = $this->pesanan($orangLain, [
            'status' => Order::STATUS_PENDING,
        ], '2026-10-24 10:00:00');

        $this->actingAs($pembeli)
            ->get('/history')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/History', false)
                ->has('orders.data', 3)
                ->where('orders.data.0.id', $batal->id)
                ->where('orders.data.0.code', $batal->code)
                ->where('orders.data.0.status', Order::STATUS_CANCELLED)
                ->where('orders.data.0.status_label', 'Batal')
                ->where('orders.data.0.payment_status', Order::PAYMENT_EXPIRE)
                ->where('orders.data.0.payment_label', 'Kedaluwarsa')
                ->where('orders.data.0.total', 360000)
                ->where('orders.data.0.items_count', 1)
                ->where('orders.data.0.total_qty', 4)
                ->where('orders.data.0.items.0.name', '[CONTOH] Daster Batik Pekalongan')
                ->where('orders.data.0.items.0.variant_label', 'Ukuran L / Merah')
                ->where('orders.data.0.items.0.qty', 4)
                ->where('orders.data.0.items.0.unit_price', 85000)
                ->where('orders.data.0.items.0.line_total', 340000)
                ->where('orders.data.0.items.0.image', '/images/seed/produk/contoh-daster-1.png')
                ->where('orders.data.0.detail_url', null)
                ->where('orders.data.1.id', $tengah->id)
                ->where('orders.data.2.id', $terlama->id)
                ->where('orders.data', fn ($data) => collect($data)->pluck('id')->doesntContain($milikOrangLain->id))
                ->where('orders.meta.current_page', 1)
                ->where('orders.meta.last_page', 1)
                ->where('orders.meta.per_page', 10)
                ->where('orders.meta.total', 3)
                ->where('ringkasan.total', 3)
                ->where('ringkasan.pending', 1)
                ->where('ringkasan.dibayar', 0)
                ->where('ringkasan.selesai', 1)
                ->where('ringkasan.batal', 1)
            );
    }

    public function test_pagination_sepuluh_per_halaman_dan_halaman_kedua(): void
    {
        $pembeli = User::factory()->create();

        $codes = [];

        foreach (range(1, 12) as $i) {
            $order = $this->pesanan($pembeli, [], sprintf('2026-10-01 10:%02d:00', $i));
            $codes[$i] = $order->code;
        }

        $this->actingAs($pembeli)
            ->get('/history')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('orders.data', 10)
                ->where('orders.data.0.code', $codes[12])
                ->where('orders.meta.current_page', 1)
                ->where('orders.meta.last_page', 2)
                ->where('orders.meta.per_page', 10)
                ->where('orders.meta.total', 12)
                ->where('ringkasan.total', 12)
            );

        $this->actingAs($pembeli)
            ->get('/history?page=2')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('orders.data', 2)
                ->where('orders.data.0.code', $codes[2])
                ->where('orders.data.1.code', $codes[1])
                ->where('orders.meta.current_page', 2)
                ->where('ringkasan.total', 12)
            );
    }

    public function test_detail_url_mengikuti_aturan_kontrak(): void
    {
        $pembeli = User::factory()->create();

        $belumBayar = $this->pesanan($pembeli, [], '2026-10-21 10:00:00');
        $lunas = $this->pesanan($pembeli, [
            'status' => Order::STATUS_PAID,
            'payment_status' => Order::PAYMENT_SETTLEMENT,
            'paid_at' => '2026-10-22 11:00:00',
        ], '2026-10-22 10:00:00');
        $batal = $this->pesanan($pembeli, [
            'status' => Order::STATUS_CANCELLED,
            'payment_status' => Order::PAYMENT_EXPIRE,
        ], '2026-10-23 10:00:00');

        $this->actingAs($pembeli)
            ->get('/history')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('orders.data.0.id', $batal->id)
                ->where('orders.data.0.detail_url', null)
                ->where('orders.data.1.id', $lunas->id)
                ->where('orders.data.1.detail_url', route('checkout.success', $lunas))
                ->where('orders.data.2.id', $belumBayar->id)
                ->where('orders.data.2.detail_url', route('checkout.pay', $belumBayar))
            );
    }

    public function test_pembeli_tanpa_pesanan_mendapat_daftar_kosong(): void
    {
        $pembeli = User::factory()->create();

        $this->actingAs($pembeli)
            ->get('/history')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/History', false)
                ->has('orders.data', 0)
                ->where('orders.meta.total', 0)
                ->where('ringkasan.total', 0)
                ->where('ringkasan.batal', 0)
            );
    }
}

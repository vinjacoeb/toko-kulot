<?php

namespace Tests\Feature\Admin;

use App\Models\Admin;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockMovement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Modul admin: Pesanan dan Akun (PRD §5.2, §7; kontrak props §12.16–§12.22).
 *
 * Data uji memakai awalan [CONTOH] agar mudah dikenali.
 */
class AdminSalesTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{0: Product, 1: ProductVariant}
     */
    private function produk(int $stok = 5): array
    {
        $kategori = Category::create([
            'name' => '[CONTOH] Daster',
            'slug' => 'contoh-daster',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $product = Product::create([
            'category_id' => $kategori->id,
            'name' => '[CONTOH] Daster Kulot',
            'slug' => 'contoh-daster-kulot',
            'sku' => 'CONTOH-DK',
            'base_price' => 89000,
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'size' => 'M',
            'sku' => 'CONTOH-DK-M',
            'stock' => $stok,
            'is_active' => true,
        ]);

        return [$product, $variant];
    }

    private function pesanan(Product $product, ProductVariant $variant, int $qty = 2): Order
    {
        $order = Order::create([
            'code' => 'CONTOH-PESANAN-1',
            'status' => Order::STATUS_PENDING,
            'subtotal' => 89000 * $qty,
            'total' => 89000 * $qty,
            'customer_name' => '[CONTOH] Pembeli',
            'customer_phone' => '081200000000',
            'shipping_address' => 'Jalan Contoh No. 1',
            'city' => 'Bandung',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'product_name' => $product->name,
            'variant_label' => 'M',
            'qty' => $qty,
            'unit_price' => 89000,
            'line_total' => 89000 * $qty,
        ]);

        return $order;
    }

    public function test_daftar_dan_detail_pesanan_menampilkan_langkah_status_berikut(): void
    {
        $admin = Admin::factory()->create();
        [$product, $variant] = $this->produk();
        $order = $this->pesanan($product, $variant);

        $this->actingAs($admin, 'admin')
            ->get('/admin/pesanan')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Orders/Index')
                ->has('pesanan.data', 1)
                ->where('pesanan.meta.per_page', 15));

        $this->actingAs($admin, 'admin')
            ->get('/admin/pesanan/'.$order->id)
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Orders/Show', false)
                ->where('pesanan.status', Order::STATUS_PENDING)
                ->has('pesanan.items', 1)
                ->where('status_berikut.0.value', Order::STATUS_PAID)
                ->where('status_berikut.1.value', Order::STATUS_CANCELLED));
    }

    public function test_ubah_status_menolak_transisi_tidak_sah(): void
    {
        $admin = Admin::factory()->create();
        [$product, $variant] = $this->produk();
        $order = $this->pesanan($product, $variant);

        $this->actingAs($admin, 'admin')
            ->patch('/admin/pesanan/'.$order->id.'/status', ['status' => Order::STATUS_COMPLETED])
            ->assertSessionHasErrors('status');

        $this->assertSame(Order::STATUS_PENDING, $order->fresh()->status);
    }

    public function test_pembatalan_mengembalikan_stok_dan_mencatat_riwayat(): void
    {
        $admin = Admin::factory()->create();
        [$product, $variant] = $this->produk(5);
        $order = $this->pesanan($product, $variant, 2);

        $this->actingAs($admin, 'admin')
            ->patch('/admin/pesanan/'.$order->id.'/status', [
                'status' => Order::STATUS_CANCELLED,
                'note' => '[CONTOH] Pembeli membatalkan',
            ])
            ->assertSessionHas('success');

        $this->assertSame(Order::STATUS_CANCELLED, $order->fresh()->status);
        $this->assertSame(7, (int) $variant->fresh()->stock);

        $this->assertDatabaseHas('stock_movements', [
            'product_variant_id' => $variant->id,
            'type' => StockMovement::TYPE_IN,
            'qty' => 2,
            'admin_id' => $admin->id,
        ]);

        $pergerakan = StockMovement::query()
            ->where('product_variant_id', $variant->id)
            ->orderByDesc('id')
            ->firstOrFail();

        $this->assertStringContainsString($order->code, (string) $pergerakan->note);
        $this->assertStringContainsString('[CONTOH] Pembeli membatalkan', (string) $pergerakan->note);
    }

    public function test_pesanan_final_tidak_bisa_diubah_lagi(): void
    {
        $admin = Admin::factory()->create();
        [$product, $variant] = $this->produk();
        $order = $this->pesanan($product, $variant);
        $order->forceFill(['status' => Order::STATUS_COMPLETED])->save();

        $this->actingAs($admin, 'admin')
            ->patch('/admin/pesanan/'.$order->id.'/status', ['status' => Order::STATUS_CANCELLED])
            ->assertSessionHasErrors('status');

        $this->assertSame(Order::STATUS_COMPLETED, $order->fresh()->status);
        $this->assertSame(5, (int) $variant->fresh()->stock);
    }

    public function test_daftar_akun_menandai_akun_sendiri(): void
    {
        $admin = Admin::factory()->create();

        $this->actingAs($admin, 'admin')
            ->get('/admin/akun')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Accounts/Index')
                ->has('akun.data', 1)
                ->where('akun.data.0.is_self', true));
    }

    public function test_akun_tidak_bisa_menonaktifkan_diri_sendiri(): void
    {
        $admin = Admin::factory()->create();

        $this->actingAs($admin, 'admin')
            ->put('/admin/akun/'.$admin->id, [
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => $admin->role,
                'is_active' => false,
            ])
            ->assertSessionHasErrors();

        $this->assertTrue((bool) $admin->fresh()->is_active);
    }

    public function test_tambah_akun_admin_dan_tolak_email_ganda(): void
    {
        $admin = Admin::factory()->create();

        $this->actingAs($admin, 'admin')
            ->post('/admin/akun', [
                'name' => '[CONTOH] Petugas',
                'email' => 'petugas@example.test',
                'password' => 'rahasia123',
                'role' => 'staff',
            ])
            ->assertRedirect('/admin/akun')
            ->assertSessionHas('success');

        $baru = Admin::query()->where('email', 'petugas@example.test')->firstOrFail();

        $this->assertTrue(Hash::check('rahasia123', $baru->password));
        $this->assertSame('staff', $baru->role);

        $this->actingAs($admin, 'admin')
            ->post('/admin/akun', [
                'name' => '[CONTOH] Petugas Dua',
                'email' => 'petugas@example.test',
                'password' => 'rahasia456',
                'role' => 'staff',
            ])
            ->assertSessionHasErrors('email');
    }
}

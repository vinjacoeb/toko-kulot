<?php

namespace Tests\Feature\Admin;

use App\Models\Admin;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;
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

    public function test_daftar_dan_detail_pesanan_admin_tanpa_prop_ubah_status(): void
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
                ->missing('status_berikut'));
    }

    public function test_daftar_pesanan_mengirim_label_kanal_bukan_id_mentah(): void
    {
        $admin = Admin::factory()->create();
        [$product, $variant] = $this->produk();
        $order = $this->pesanan($product, $variant);
        $order->update(['payment_method' => 'bca_va']);

        $this->actingAs($admin, 'admin')
            ->get('/admin/pesanan')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Orders/Index')
                ->where('pesanan.data.0.payment_method_label', 'Transfer Bank'));
    }

    public function test_rute_ubah_status_manual_sudah_dihapus(): void
    {
        $admin = Admin::factory()->create();
        [$product, $variant] = $this->produk();
        $order = $this->pesanan($product, $variant);

        // PRD-v1.4 §3.2: rute lama tidak lagi menerima permintaan (405/404, bukan 200).
        $this->actingAs($admin, 'admin')
            ->patch('/admin/pesanan/'.$order->id.'/status', ['status' => Order::STATUS_CANCELLED])
            ->assertNotFound();

        $this->assertSame(Order::STATUS_PENDING, $order->fresh()->status);
        $this->assertSame(5, (int) $variant->fresh()->stock);
        $this->assertSame(0, StockMovement::query()->count());
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

    public function test_detail_pesanan_memuat_props_nomor_resi(): void
    {
        $admin = Admin::factory()->create();
        [$product, $variant] = $this->produk();
        $order = $this->pesanan($product, $variant);

        $this->actingAs($admin, 'admin')
            ->get('/admin/pesanan/'.$order->id)
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Orders/Show', false)
                ->where('pesanan.tracking_number', null));

        $order->forceFill(['tracking_number' => 'JX1234567890'])->save();

        $this->actingAs($admin, 'admin')
            ->get('/admin/pesanan/'.$order->id)
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('pesanan.tracking_number', 'JX1234567890'));
    }

    public function test_simpan_nomor_resi_hanya_mengubah_kolom_resi(): void
    {
        $admin = Admin::factory()->create();
        [$product, $variant] = $this->produk(5);
        $order = $this->pesanan($product, $variant);

        $this->actingAs($admin, 'admin')
            ->from('/admin/pesanan/'.$order->id)
            ->patch('/admin/pesanan/'.$order->id.'/resi', ['tracking_number' => '  JX1234567890  '])
            ->assertRedirect('/admin/pesanan/'.$order->id)
            ->assertSessionHas('success', 'Nomor resi pesanan diperbarui.');

        $segar = $order->fresh();

        // Teks di-trim; kolom lain tidak ikut berubah.
        $this->assertSame('JX1234567890', $segar->tracking_number);
        $this->assertSame(Order::STATUS_PENDING, $segar->status);
        $this->assertSame(Order::PAYMENT_PENDING, $segar->payment_status);
        $this->assertSame(5, (int) $variant->fresh()->stock);
        $this->assertSame(0, StockMovement::query()->count());
    }

    public function test_nomor_resi_kosong_menghapus_nomor_resi(): void
    {
        $admin = Admin::factory()->create();
        [$product, $variant] = $this->produk();
        $order = $this->pesanan($product, $variant);

        $order->forceFill(['tracking_number' => 'JX1234567890'])->save();

        $this->actingAs($admin, 'admin')
            ->patch('/admin/pesanan/'.$order->id.'/resi', ['tracking_number' => ''])
            ->assertSessionHas('success', 'Nomor resi pesanan diperbarui.');

        $this->assertNull($order->fresh()->tracking_number);

        $order->forceFill(['tracking_number' => 'JX1234567890'])->save();

        $this->actingAs($admin, 'admin')
            ->patch('/admin/pesanan/'.$order->id.'/resi', ['tracking_number' => null])
            ->assertSessionHas('success', 'Nomor resi pesanan diperbarui.');

        $this->assertNull($order->fresh()->tracking_number);
    }

    public function test_nomor_resi_lebih_dari_60_karakter_ditolak(): void
    {
        $admin = Admin::factory()->create();
        [$product, $variant] = $this->produk();
        $order = $this->pesanan($product, $variant);
        $batas = str_repeat('A', 60);

        $this->actingAs($admin, 'admin')
            ->patch('/admin/pesanan/'.$order->id.'/resi', ['tracking_number' => $batas])
            ->assertSessionHas('success', 'Nomor resi pesanan diperbarui.');

        $this->assertSame($batas, $order->fresh()->tracking_number);

        $this->actingAs($admin, 'admin')
            ->patch('/admin/pesanan/'.$order->id.'/resi', ['tracking_number' => str_repeat('A', 61)])
            ->assertSessionHasErrors(['tracking_number' => 'Nomor resi maksimal 60 karakter.']);

        $this->assertSame($batas, $order->fresh()->tracking_number);

        $this->actingAs($admin, 'admin')
            ->patch('/admin/pesanan/'.$order->id.'/resi', ['tracking_number' => ['JX1']])
            ->assertSessionHasErrors(['tracking_number' => 'Nomor resi harus berupa teks.']);

        $this->assertSame($batas, $order->fresh()->tracking_number);
    }

    public function test_bukan_admin_tidak_bisa_menyimpan_nomor_resi(): void
    {
        [$product, $variant] = $this->produk();
        $order = $this->pesanan($product, $variant);
        $pembeli = User::factory()->create();

        // Tamu.
        $this->patch('/admin/pesanan/'.$order->id.'/resi', ['tracking_number' => 'JX1234567890'])
            ->assertRedirect('/admin/login');

        // Pembeli yang sudah masuk (guard `web` tidak berlaku untuk panel admin).
        $this->actingAs($pembeli, 'web')
            ->patch('/admin/pesanan/'.$order->id.'/resi', ['tracking_number' => 'JX1234567890'])
            ->assertRedirect('/admin/login');

        $this->assertNull($order->fresh()->tracking_number);
    }

    public function test_migrasi_nomor_resi_punya_up_dan_down(): void
    {
        $migrasi = require database_path('migrations/2026_10_21_000019_add_tracking_number_to_orders_table.php');

        $this->assertInstanceOf(Migration::class, $migrasi);
        $this->assertTrue(Schema::hasColumn('orders', 'tracking_number'));

        $migrasi->down();
        $this->assertFalse(Schema::hasColumn('orders', 'tracking_number'));

        $migrasi->up();
        $this->assertTrue(Schema::hasColumn('orders', 'tracking_number'));
    }

    public function test_nomor_resi_terlalu_panjang_membalas_422_untuk_klien_json(): void
    {
        $admin = Admin::factory()->create();
        [$product, $variant] = $this->produk();
        $order = $this->pesanan($product, $variant);

        $this->actingAs($admin, 'admin')
            ->patchJson('/admin/pesanan/'.$order->id.'/resi', ['tracking_number' => str_repeat('A', 61)])
            ->assertStatus(422)
            ->assertJsonPath('errors.tracking_number.0', 'Nomor resi maksimal 60 karakter.');

        $this->assertNull($order->fresh()->tracking_number);
    }

    public function test_daftar_dan_detail_menyertakan_kurir_resi_mode_uji_dan_filter_kirim(): void
    {
        $admin = Admin::factory()->create();
        [$product, $variant] = $this->produk();
        $order = $this->pesanan($product, $variant);

        $order->forceFill([
            'status' => Order::STATUS_PAID,
            'payment_status' => Order::PAYMENT_SETTLEMENT,
            'shipping_courier' => 'jne',
            'shipping_service' => 'reg',
            'shipping_etd' => '2-3 hari',
            'shipping_cost' => 20000,
            'tracking_number' => 'JX1234567890',
            'shipping_status' => 'confirmed',
        ])->save();

        Payment::create([
            'order_id' => $order->id,
            'provider' => 'midtrans',
            'transaction_id' => 'fake-1',
            'payment_type' => 'bca_va',
            'gross_amount' => 198000,
            'status' => Order::PAYMENT_SETTLEMENT,
            'payload' => ['mode' => 'fake'],
        ]);

        $this->actingAs($admin, 'admin')
            ->get('/admin/pesanan?kirim=confirmed')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('pesanan.data', 1)
                ->where('pesanan.data.0.courier_name', 'JNE')
                ->where('pesanan.data.0.service_name', 'REG')
                ->where('pesanan.data.0.tracking_number', 'JX1234567890')
                ->where('pesanan.data.0.shipping_status_label', 'Dikonfirmasi')
                ->where('pesanan.data.0.mode_uji', true)
                ->where('filter.kirim', 'confirmed')
                ->where('filter_opsi.kirim.2.value', 'confirmed')
                ->where('filter_opsi.kirim.2.label', 'Dikonfirmasi')
            );

        $this->actingAs($admin, 'admin')
            ->get('/admin/pesanan?kirim=belum')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->has('pesanan.data', 0));

        $this->actingAs($admin, 'admin')
            ->get('/admin/pesanan/'.$order->id)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('pesanan.shipping.courier_code', 'jne')
                ->where('pesanan.shipping.courier_name', 'JNE')
                ->where('pesanan.shipping.service_name', 'REG')
                ->where('pesanan.shipping.etd', '2-3 hari')
                ->where('pesanan.shipping.weight_gram', null)
                ->where('pesanan.shipping.galat', null)
                ->where('pesanan.payment.metode.id', 'bca_va')
                ->where('pesanan.payment.fake', true)
                ->where('pesanan.payment.payment_type', 'bca_va')
                ->where('pesanan.mode_uji', true)
                ->where('pesanan.timeline.shipped_at', null)
            );
    }

    public function test_detail_pesanan_menampilkan_shipped_at_status_dikirim(): void
    {
        $admin = Admin::factory()->create();
        [$product, $variant] = $this->produk();
        $order = $this->pesanan($product, $variant);

        // Status `dikirim` kini hanya datang dari webhook Biteship (PRD-v1.4 §3); di sini
        // keadaan DB disiapkan langsung untuk memeriksa prop `timeline.shipped_at`.
        $order->forceFill([
            'status' => Order::STATUS_SHIPPED,
            'payment_status' => Order::PAYMENT_SETTLEMENT,
            'shipped_at' => now(),
        ])->save();

        $this->actingAs($admin, 'admin')
            ->get('/admin/pesanan/'.$order->id)
            ->assertInertia(fn (Assert $page) => $page
                ->where('pesanan.timeline.shipped_at', $order->fresh()->shipped_at->toIso8601String())
            );
    }
}

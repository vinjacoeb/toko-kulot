<?php

namespace Tests\Feature\Admin;

use App\Exceptions\CheckoutException;
use App\Models\Admin;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockMovement;
use App\Models\User;
use App\Services\Midtrans\MidtransApi;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Mockery;
use Tests\Support\FakeMidtransApi;
use Tests\TestCase;

/**
 * Aksi admin "Sinkronkan status pembayaran" (kontrak props §12.24).
 *
 * Webhook Midtrans tidak bisa masuk ke localhost, jadi admin menarik status terakhir
 * langsung dari Midtrans. Penerapan status memakai `MidtransService` — jalur yang sama
 * dengan webhook, sehingga status final tidak pernah mundur dan stok ikut kembali
 * saat tagihan kedaluwarsa.
 *
 * Semua panggilan jaringan Midtrans diganti `FakeMidtransApi`, jadi test tidak butuh
 * kredensial dan tidak pernah menghubungi Midtrans (PRD §8, kontrak props §7.7/§7.8).
 */
class AdminSyncPaymentTest extends TestCase
{
    use RefreshDatabase;

    private FakeMidtransApi $api;

    private int $productId = 0;

    private int $variantId = 0;

    protected function setUp(): void
    {
        parent::setUp();

        $this->api = new FakeMidtransApi;
        $this->app->instance(MidtransApi::class, $this->api);

        $this->modeNyata();

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
            'stock' => 3,
            'is_active' => true,
        ]);

        $this->productId = (int) $product->id;
        $this->variantId = (int) $variant->id;
    }

    public function test_status_pembayaran_sinkron_mengubah_pesanan_pending_menjadi_dibayar(): void
    {
        $admin = Admin::factory()->create();
        $order = $this->pesanan();
        $payment = $this->tagihan($order);

        $this->api->statuses[$order->code] = [
            'order_id' => $order->code,
            'transaction_id' => 'trx-tk-20261021-0001',
            'transaction_status' => 'settlement',
        ];

        $this->actingAs($admin, 'admin')
            ->from('/admin/pesanan/'.$order->id)
            ->patch('/admin/pesanan/'.$order->id.'/sinkron-pembayaran')
            ->assertRedirect('/admin/pesanan/'.$order->id)
            ->assertSessionHas('success', 'Status pembayaran diperbarui dari Menunggu pembayaran ke Lunas.');

        $segar = $order->fresh();

        $this->assertSame(Order::PAYMENT_SETTLEMENT, $segar->payment_status);
        $this->assertSame(Order::STATUS_PAID, $segar->status);
        $this->assertNotNull($segar->paid_at);

        $tagihan = $payment->fresh();
        $this->assertSame(Order::PAYMENT_SETTLEMENT, $tagihan->status);
        $this->assertSame('trx-tk-20261021-0001', $tagihan->transaction_id);
        $this->assertNotNull($tagihan->paid_at);

        $this->assertSame(1, $this->api->statusCount);
    }

    public function test_status_sama_memberi_pesan_tidak_berubah(): void
    {
        $admin = Admin::factory()->create();
        $order = $this->pesanan();
        $this->tagihan($order);

        $this->api->statuses[$order->code] = [
            'order_id' => $order->code,
            'transaction_status' => 'pending',
        ];

        $this->actingAs($admin, 'admin')
            ->from('/admin/pesanan/'.$order->id)
            ->patch('/admin/pesanan/'.$order->id.'/sinkron-pembayaran')
            ->assertSessionHas('success', 'Status pembayaran tidak berubah: Menunggu pembayaran.');

        $segar = $order->fresh();

        $this->assertSame(Order::PAYMENT_PENDING, $segar->payment_status);
        $this->assertSame(Order::STATUS_PENDING, $segar->status);
        $this->assertNull($segar->paid_at);
        $this->assertSame(1, $this->api->statusCount);
    }

    public function test_status_tak_dikenal_tidak_mengubah_apa_pun(): void
    {
        $admin = Admin::factory()->create();
        $order = $this->pesanan();
        $this->tagihan($order);

        $this->api->statuses[$order->code] = [
            'order_id' => $order->code,
            'transaction_status' => 'refund_partial',
        ];

        $this->actingAs($admin, 'admin')
            ->from('/admin/pesanan/'.$order->id)
            ->patch('/admin/pesanan/'.$order->id.'/sinkron-pembayaran')
            ->assertSessionHas('success', 'Status pembayaran tidak berubah: Menunggu pembayaran.');

        $this->assertSame(Order::PAYMENT_PENDING, $order->fresh()->payment_status);
    }

    public function test_tagihan_kedaluwarsa_membatalkan_pesanan_dan_mengembalikan_stok(): void
    {
        $admin = Admin::factory()->create();
        $order = $this->pesanan();
        $this->tagihan($order);

        $this->api->statuses[$order->code] = [
            'order_id' => $order->code,
            'transaction_status' => 'expire',
        ];

        $this->actingAs($admin, 'admin')
            ->from('/admin/pesanan/'.$order->id)
            ->patch('/admin/pesanan/'.$order->id.'/sinkron-pembayaran')
            ->assertSessionHas('success', 'Status pembayaran diperbarui dari Menunggu pembayaran ke Kedaluwarsa.');

        $segar = $order->fresh();

        $this->assertSame(Order::PAYMENT_EXPIRE, $segar->payment_status);
        $this->assertSame(Order::STATUS_CANCELLED, $segar->status);
        $this->assertSame(5, (int) ProductVariant::query()->findOrFail($this->variantId)->stock);

        $gerakan = StockMovement::query()->firstOrFail();

        $this->assertSame(StockMovement::TYPE_IN, $gerakan->type);
        $this->assertSame(2, (int) $gerakan->qty);
        $this->assertStringContainsString('CONTOH-PESANAN-1', (string) $gerakan->note);
    }

    public function test_status_final_tidak_pernah_mundur(): void
    {
        $admin = Admin::factory()->create();
        $order = $this->pesanan();
        $payment = $this->tagihan($order, [
            'status' => Order::PAYMENT_EXPIRE,
            'paid_at' => null,
        ]);

        $order->forceFill([
            'status' => Order::STATUS_CANCELLED,
            'payment_status' => Order::PAYMENT_EXPIRE,
        ])->save();

        $this->api->statuses[$order->code] = [
            'order_id' => $order->code,
            'transaction_status' => 'settlement',
        ];

        $this->actingAs($admin, 'admin')
            ->from('/admin/pesanan/'.$order->id)
            ->patch('/admin/pesanan/'.$order->id.'/sinkron-pembayaran')
            ->assertSessionHas('success', 'Status pembayaran tidak berubah: Kedaluwarsa.');

        $segar = $order->fresh();

        $this->assertSame(Order::PAYMENT_EXPIRE, $segar->payment_status);
        $this->assertSame(Order::STATUS_CANCELLED, $segar->status);
        $this->assertSame(Order::PAYMENT_EXPIRE, $payment->fresh()->status);
        $this->assertSame(0, StockMovement::query()->count());
    }

    public function test_pesanan_tanpa_tagihan_tidak_memanggil_midtrans(): void
    {
        $admin = Admin::factory()->create();
        $order = $this->pesanan();

        $this->actingAs($admin, 'admin')
            ->from('/admin/pesanan/'.$order->id)
            ->patch('/admin/pesanan/'.$order->id.'/sinkron-pembayaran')
            ->assertSessionHas('error', 'Pesanan ini belum punya tagihan pembayaran, jadi status tidak bisa disinkronkan.');

        $this->assertSame(0, $this->api->statusCount);
        $this->assertSame(Order::PAYMENT_PENDING, $order->fresh()->payment_status);
    }

    public function test_mode_uji_tidak_bisa_disinkronkan(): void
    {
        $admin = Admin::factory()->create();
        $order = $this->pesanan();
        $this->tagihan($order);

        $this->modeUji();

        $this->actingAs($admin, 'admin')
            ->from('/admin/pesanan/'.$order->id)
            ->patch('/admin/pesanan/'.$order->id.'/sinkron-pembayaran')
            ->assertSessionHas('error', 'Mode uji Midtrans: status tidak bisa disinkronkan.');

        $this->assertSame(0, $this->api->statusCount);
        $this->assertSame(Order::PAYMENT_PENDING, $order->fresh()->payment_status);
    }

    public function test_tagihan_lama_mode_uji_tidak_bisa_disinkronkan(): void
    {
        $admin = Admin::factory()->create();
        $order = $this->pesanan();
        $this->tagihan($order, [
            'transaction_id' => 'fake-'.$order->code,
            'qr_string' => '00020101021226610014ID.CO.QRIS.WWW89000',
            'payload' => ['mode' => 'fake'],
        ]);

        $this->api->statuses[$order->code] = [
            'order_id' => $order->code,
            'transaction_status' => 'settlement',
        ];

        $this->actingAs($admin, 'admin')
            ->from('/admin/pesanan/'.$order->id)
            ->patch('/admin/pesanan/'.$order->id.'/sinkron-pembayaran')
            ->assertSessionHas('error', 'Mode uji Midtrans: status tidak bisa disinkronkan.');

        $this->assertSame(0, $this->api->statusCount);
        $this->assertSame(Order::PAYMENT_PENDING, $order->fresh()->payment_status);
    }

    public function test_pembayaran_sudah_lunas_tidak_memanggil_midtrans(): void
    {
        $admin = Admin::factory()->create();
        $order = $this->pesanan();
        $this->tagihan($order, [
            'status' => Order::PAYMENT_SETTLEMENT,
            'paid_at' => now(),
        ]);

        $order->forceFill([
            'status' => Order::STATUS_PAID,
            'payment_status' => Order::PAYMENT_SETTLEMENT,
            'paid_at' => now(),
        ])->save();

        $this->actingAs($admin, 'admin')
            ->from('/admin/pesanan/'.$order->id)
            ->patch('/admin/pesanan/'.$order->id.'/sinkron-pembayaran')
            ->assertSessionHas('success', 'Pembayaran sudah lunas, sinkronisasi tidak perlu dijalankan.');

        $this->assertSame(0, $this->api->statusCount);
        $this->assertSame(Order::PAYMENT_SETTLEMENT, $order->fresh()->payment_status);
    }

    public function test_kegagalan_midtrans_memberi_flash_error_bukan_500(): void
    {
        $admin = Admin::factory()->create();
        $order = $this->pesanan();
        $this->tagihan($order);

        $api = Mockery::mock(MidtransApi::class);
        $api->shouldReceive('status')
            ->once()
            ->with($order->code)
            ->andThrow(new CheckoutException('Gagal memeriksa status pembayaran. Coba lagi.'));

        $this->app->instance(MidtransApi::class, $api);

        $this->actingAs($admin, 'admin')
            ->from('/admin/pesanan/'.$order->id)
            ->patch('/admin/pesanan/'.$order->id.'/sinkron-pembayaran')
            ->assertRedirect('/admin/pesanan/'.$order->id)
            ->assertSessionHas('error', 'Gagal memeriksa status pembayaran. Coba lagi.');

        $segar = $order->fresh();

        $this->assertSame(Order::PAYMENT_PENDING, $segar->payment_status);
        $this->assertSame(Order::STATUS_PENDING, $segar->status);
    }

    public function test_log_sinkronisasi_tidak_memuat_rahasia(): void
    {
        $admin = Admin::factory()->create();
        $order = $this->pesanan();
        $this->tagihan($order);

        $this->api->statuses[$order->code] = [
            'order_id' => $order->code,
            'transaction_id' => 'trx-tk-20261021-0001',
            'transaction_status' => 'settlement',
        ];

        $log = Log::spy();

        $this->actingAs($admin, 'admin')
            ->from('/admin/pesanan/'.$order->id)
            ->patch('/admin/pesanan/'.$order->id.'/sinkron-pembayaran')
            ->assertSessionHas('success');

        $log->shouldHaveReceived('info')->once()->with(
            'Admin menyinkronkan status pembayaran dari Midtrans.',
            Mockery::on(function (array $context) use ($order): bool {
                $isi = json_encode($context);

                return $context['order'] === $order->code
                    && $context['payment'] === 'pending -> settlement'
                    && $context['order_status'] === 'pending -> dibayar'
                    && is_string($isi)
                    && ! str_contains($isi, 'test-server-key')
                    && ! str_contains($isi, 'trx-tk-20261021-0001');
            }),
        );
    }

    public function test_bukan_admin_tidak_bisa_menyinkronkan(): void
    {
        $order = $this->pesanan();
        $this->tagihan($order);
        $pembeli = User::factory()->create();

        $this->patch('/admin/pesanan/'.$order->id.'/sinkron-pembayaran')
            ->assertRedirect('/admin/login');

        $this->actingAs($pembeli, 'web')
            ->patch('/admin/pesanan/'.$order->id.'/sinkron-pembayaran')
            ->assertRedirect('/admin/login');

        $this->assertSame(0, $this->api->statusCount);
        $this->assertSame(Order::PAYMENT_PENDING, $order->fresh()->payment_status);
    }

    private function modeNyata(): void
    {
        config([
            'midtrans.fake' => false,
            'midtrans.server_key' => 'test-server-key',
            'midtrans.client_key' => 'test-client-key',
            'midtrans.is_production' => false,
        ]);
    }

    private function modeUji(): void
    {
        config([
            'midtrans.fake' => true,
            'midtrans.server_key' => 'test-server-key',
        ]);
    }

    private function pesanan(): Order
    {
        $order = Order::create([
            'code' => 'CONTOH-PESANAN-1',
            'status' => Order::STATUS_PENDING,
            'subtotal' => 178000,
            'total' => 178000,
            'customer_name' => '[CONTOH] Pembeli',
            'customer_phone' => '081200000000',
            'shipping_address' => 'Jalan Contoh No. 1',
            'city' => 'Bandung',
            'payment_status' => Order::PAYMENT_PENDING,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $this->productId,
            'product_variant_id' => $this->variantId,
            'product_name' => '[CONTOH] Daster Kulot',
            'variant_label' => 'M',
            'qty' => 2,
            'unit_price' => 89000,
            'line_total' => 178000,
        ]);

        return $order;
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function tagihan(Order $order, array $attributes = []): Payment
    {
        return Payment::create(array_merge([
            'order_id' => $order->id,
            'provider' => 'midtrans',
            'transaction_id' => 'trx-tk-20261021-0001',
            'order_id_midtrans' => $order->code,
            'qr_string' => '00020101021226610014ID.CO.QRIS.WWW178000',
            'gross_amount' => 178000,
            'status' => Order::PAYMENT_PENDING,
            'payload' => ['transaction_status' => 'pending'],
            'paid_at' => null,
            'expires_at' => now()->addMinutes(15),
        ], $attributes));
    }
}

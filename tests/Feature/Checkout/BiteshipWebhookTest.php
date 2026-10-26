<?php

namespace Tests\Feature\Checkout;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockMovement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

/**
 * Webhook Biteship inti (PRD-v1.3 §2.1–§2.4, kartu `t_2c6be520`).
 *
 * Token bersama lewat `?token=` atau header apa pun (v1.5 B2); event diterapkan
 * idempoten; status pesanan hanya maju; uang & stok tidak pernah disentuh.
 */
class BiteshipWebhookTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Mode uji lokal: token kosong = semua request diterima (PRD-v1.3 §2.1).
        config(['biteship.webhook_token' => null]);
    }

    /** Nomor urut kode pesanan uji (deterministik). */
    private int $nomor = 0;

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function pesanan(array $overrides = []): Order
    {
        $this->nomor++;

        return Order::create(array_merge([
            'code' => 'TK-20261024-'.str_pad((string) $this->nomor, 4, '0', STR_PAD_LEFT),
            'status' => Order::STATUS_PAID,
            'subtotal' => 85000,
            'shipping_cost' => 20000,
            'discount' => 0,
            'total' => 105000,
            'payment_method' => 'qris',
            'payment_status' => Order::PAYMENT_SETTLEMENT,
            'customer_name' => '[CONTOH] Pembeli Webhook',
            'customer_phone' => '081200000001',
            'shipping_address' => '[CONTOH] Jalan Mawar 1',
            'city' => 'Bandung',
            'postal_code' => '40111',
            'shipping_courier' => 'jne',
            'shipping_service' => 'reg',
            'biteship_order_id' => 'BIT-1',
        ], $overrides));
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function kirim(array $payload, string $query = ''): \Illuminate\Testing\TestResponse
    {
        return $this->postJson('/biteship/webhook'.$query, $payload);
    }

    public function test_order_status_picked_memajukan_dibayar_ke_dikirim_dan_mengisi_kolom(): void
    {
        $order = $this->pesanan();

        $this->kirim([
            'event' => 'order.status',
            'order_id' => 'BIT-1',
            'status' => 'picked',
            'courier_driver_name' => 'Budi',
            'courier_driver_phone' => '081200000002',
            'courier_link' => 'https://track.example/BIT-1',
        ])->assertOk()->assertExactJson(['message' => 'ok']);

        $order->refresh();

        $this->assertSame(Order::STATUS_SHIPPED, $order->status);
        $this->assertNotNull($order->shipped_at);
        $this->assertSame('picked', $order->shipping_status);
        $this->assertNotNull($order->shipping_updated_at);
        $this->assertSame('order.status', $order->shipping_webhook_payload['event']);
        $this->assertSame('Budi', $order->shipping_webhook_payload['courier_driver_name']);
    }

    public function test_order_status_delivered_pada_dikirim_menjadi_selesai(): void
    {
        $order = $this->pesanan(['status' => Order::STATUS_SHIPPED]);

        $this->kirim(['event' => 'order.status', 'order_id' => 'BIT-1', 'status' => 'delivered'])
            ->assertOk();

        $order->refresh();

        $this->assertSame(Order::STATUS_COMPLETED, $order->status);
        $this->assertSame('delivered', $order->shipping_status);
    }

    public function test_order_waybill_mengisi_resi_waybill_diutamakan_tanpa_memajukan_status(): void
    {
        $order = $this->pesanan();

        $this->kirim([
            'event' => 'order.waybill_id',
            'order_id' => 'BIT-1',
            'courier_waybill_id' => 'JNE123456789',
            'courier_tracking_id' => 'TRACK-999',
            'status' => 'confirmed',
        ])->assertOk();

        $order->refresh();

        $this->assertSame('JNE123456789', $order->tracking_number);
        $this->assertSame('confirmed', $order->shipping_status);
        $this->assertNotNull($order->shipping_updated_at);
        $this->assertSame(
            Order::STATUS_PAID,
            $order->status,
            'Event waybill tidak memajukan status pesanan (PRD-v1.3 §2.2).'
        );
    }

    public function test_order_price_tidak_mengubah_uang_stok_dan_menyimpan_payload(): void
    {
        $category = Category::create(['name' => '[CONTOH] Daster', 'slug' => 'contoh-daster', 'is_active' => true]);
        $product = Product::create([
            'category_id' => $category->id,
            'name' => '[CONTOH] Daster Kulot',
            'slug' => 'contoh-daster-kulot',
            'base_price' => 85000,
            'is_active' => true,
        ]);
        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'size' => 'L',
            'color' => 'Merah',
            'sku' => 'CONTOH-L-MERAH',
            'price_delta' => 0,
            'stock' => 10,
            'is_active' => true,
        ]);

        $order = $this->pesanan();
        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'product_name' => $product->name,
            'variant_label' => 'L / Merah',
            'qty' => 2,
            'unit_price' => 85000,
            'line_total' => 170000,
        ]);
        Payment::create([
            'order_id' => $order->id,
            'provider' => 'midtrans',
            'gross_amount' => 105000,
            'status' => Order::PAYMENT_SETTLEMENT,
        ]);

        $this->kirim([
            'event' => 'order.price',
            'order_id' => 'BIT-1',
            'price' => 28000,
            'shippment_fee' => 18000,
            'cash_on_delivery_fee' => 0,
            'proof_of_delivery_fee' => 0,
        ])->assertOk();

        $order->refresh();

        $this->assertSame(20000, (int) $order->shipping_cost, 'Ongkir tersimpan tidak boleh diubah webhook.');
        $this->assertSame(105000, (int) $order->total);
        $this->assertSame(105000, (int) $order->payment()->firstOrFail()->gross_amount);
        $this->assertSame(10, (int) $variant->refresh()->stock);
        $this->assertSame(0, StockMovement::count());
        $this->assertSame(28000, (int) $order->shipping_webhook_payload['price']);
        $this->assertNotNull($order->shipping_updated_at);
        $this->assertSame(
            Order::STATUS_PAID,
            $order->status,
            'Event price tidak mengubah status pesanan.'
        );
    }

    public function test_event_ganda_idempoten(): void
    {
        $order = $this->pesanan();

        $picked = ['event' => 'order.status', 'order_id' => 'BIT-1', 'status' => 'picked'];

        $this->kirim($picked)->assertOk();
        $pertama = $order->refresh()->shipped_at;

        $this->travel(5)->minutes();
        $this->kirim($picked)->assertOk();
        $order->refresh();

        $this->assertSame(Order::STATUS_SHIPPED, $order->status);
        $this->assertSame($pertama->toDateTimeString(), $order->shipped_at->toDateTimeString());

        $waybill = ['event' => 'order.waybill_id', 'order_id' => 'BIT-1', 'courier_waybill_id' => 'JNE777'];

        $this->kirim($waybill)->assertOk();
        $this->kirim($waybill)->assertOk();

        $this->assertSame('JNE777', $order->refresh()->tracking_number);
    }

    public function test_status_pesanan_tidak_pernah_mundur(): void
    {
        $dikirim = $this->pesanan(['code' => 'TK-20261024-0001', 'status' => Order::STATUS_SHIPPED]);
        $selesai = $this->pesanan([
            'code' => 'TK-20261024-0002',
            'biteship_order_id' => 'BIT-2',
            'status' => Order::STATUS_COMPLETED,
        ]);
        $batal = $this->pesanan([
            'code' => 'TK-20261024-0003',
            'biteship_order_id' => 'BIT-3',
            'status' => Order::STATUS_CANCELLED,
        ]);
        $pending = $this->pesanan([
            'code' => 'TK-20261024-0004',
            'biteship_order_id' => 'BIT-4',
            'status' => Order::STATUS_PENDING,
        ]);
        $dibayar = $this->pesanan([
            'code' => 'TK-20261024-0005',
            'biteship_order_id' => 'BIT-5',
            'status' => Order::STATUS_PAID,
        ]);

        $this->kirim(['event' => 'order.status', 'order_id' => 'BIT-1', 'status' => 'picked'])->assertOk();
        $this->kirim(['event' => 'order.status', 'order_id' => 'BIT-2', 'status' => 'delivered'])->assertOk();
        $this->kirim(['event' => 'order.status', 'order_id' => 'BIT-3', 'status' => 'picked'])->assertOk();
        $this->kirim(['event' => 'order.status', 'order_id' => 'BIT-4', 'status' => 'delivered'])->assertOk();
        $this->kirim(['event' => 'order.status', 'order_id' => 'BIT-5', 'status' => 'delivered'])->assertOk();

        $this->assertSame(Order::STATUS_SHIPPED, $dikirim->refresh()->status);
        $this->assertSame(Order::STATUS_COMPLETED, $selesai->refresh()->status);
        $this->assertSame(Order::STATUS_CANCELLED, $batal->refresh()->status);
        $this->assertSame(Order::STATUS_PENDING, $pending->refresh()->status);
        // `delivered` pada `dibayar` hanya satu langkah: `dikirim`, bukan langsung `selesai`.
        $this->assertSame(Order::STATUS_SHIPPED, $dibayar->refresh()->status);

        // `shipping_status` tetap dicatat untuk admin walau status pesanan berhenti.
        $this->assertSame('picked', $dikirim->shipping_status);
        $this->assertSame('delivered', $selesai->shipping_status);
    }

    public function test_status_kurir_bermasalah_tidak_membatalkan_pesanan(): void
    {
        $order = $this->pesanan();

        $this->kirim(['event' => 'order.status', 'order_id' => 'BIT-1', 'status' => 'returned'])->assertOk();

        $order->refresh();

        $this->assertSame(Order::STATUS_PAID, $order->status);
        $this->assertSame('returned', $order->shipping_status);
    }

    public function test_token_salah_ditolak_403(): void
    {
        config(['biteship.webhook_token' => 'rahasia-uji']);
        $order = $this->pesanan();

        $payload = ['event' => 'order.status', 'order_id' => 'BIT-1', 'status' => 'picked'];

        $this->kirim($payload, '?token=salah')->assertForbidden()->assertExactJson(['message' => 'invalid token']);
        $this->withHeader('X-Webhook-Token', 'salah')->postJson('/biteship/webhook', $payload)
            ->assertForbidden();

        $this->assertSame(Order::STATUS_PAID, $order->refresh()->status);

        $this->kirim($payload, '?token=rahasia-uji')->assertOk();
        $this->assertSame(Order::STATUS_SHIPPED, $order->refresh()->status);

        $kedua = $this->pesanan(['code' => 'TK-20261024-0005', 'biteship_order_id' => 'BIT-5']);
        $this->withHeader('X-Webhook-Token', 'rahasia-uji')
            ->postJson('/biteship/webhook', ['event' => 'order.status', 'order_id' => 'BIT-5', 'status' => 'picked'])
            ->assertOk();
        $this->assertSame(Order::STATUS_SHIPPED, $kedua->refresh()->status);
    }

    public function test_body_rusak_dibalas_422(): void
    {
        $this->call('POST', '/biteship/webhook', [], [], [], ['CONTENT_TYPE' => 'application/json'], '{bukan json')
            ->assertStatus(422)
            ->assertExactJson(['message' => 'invalid payload']);

        $this->call('POST', '/biteship/webhook', [], [], [], ['CONTENT_TYPE' => 'application/json'], '"teks"')
            ->assertStatus(422);
    }

    /**
     * Probe instalasi dashboard Biteship (PRD-v1.3 §2.1): POST body kosong tanpa
     * token benar tetap `200 ok`, tidak 422/403, dan tidak memproses apa pun.
     */
    public function test_probe_instalasi_post_body_kosong_dibalas_ok_tanpa_cek_token(): void
    {
        Log::spy();
        config(['biteship.webhook_token' => 'rahasia-uji']);

        $respons = $this->call(
            'POST',
            '/biteship/webhook?token=salah',
            [],
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            ''
        );

        $respons->assertOk()->assertExactJson(['status' => 'ok', 'success' => true]);
        $this->assertStringContainsString('ok', $respons->getContent());
        Log::shouldHaveReceived('info')->once();
    }

    /** Probe instalasi berbentuk GET (tanpa token, tanpa body) juga `200` berisi "ok". */
    public function test_probe_instalasi_get_dibalas_ok(): void
    {
        config(['biteship.webhook_token' => 'rahasia-uji']);

        $respons = $this->get('/biteship/webhook');

        $respons->assertOk();
        $this->assertStringContainsString('ok', $respons->getContent());
        $this->assertStringContainsString('"status":"ok"', $respons->getContent());
    }

    public function test_order_tidak_dikenal_dibalas_200_dan_dicatat(): void
    {
        Log::spy();

        $this->kirim(['event' => 'order.status', 'order_id' => 'BIT-TIDAK-ADA', 'status' => 'picked'])
            ->assertOk()
            ->assertExactJson(['message' => 'ok']);

        Log::shouldHaveReceived('warning')->once();

        // Event tak dikenal juga 200 (Biteship tidak perlu mengulang).
        $this->kirim(['event' => 'order.unknown', 'order_id' => 'BIT-1'])->assertOk();
    }

    /**
     * v1.5 B2: dashboard Biteship bebas memilih nama header — nilainya yang
     * menentukan. Log penolakan hanya memuat nama header, bukan nilainya.
     */
    public function test_token_di_header_kustom_apa_punya_diterima(): void
    {
        Log::spy();
        config(['biteship.webhook_token' => 'rahasia-uji']);
        $order = $this->pesanan();

        $payload = ['event' => 'order.status', 'order_id' => 'BIT-1', 'status' => 'picked'];

        $this->withHeader('X-Api-Key', 'salah')->postJson('/biteship/webhook', $payload)
            ->assertForbidden();
        $this->assertSame(Order::STATUS_PAID, $order->refresh()->status);

        Log::shouldHaveReceived('warning')->withArgs(function (string $pesan, array $konteks): bool {
            return $pesan === 'Webhook Biteship ditolak: token tidak valid'
                && in_array('x-api-key', $konteks['header'], true)
                && ! str_contains(json_encode($konteks), 'salah');
        })->once();

        $this->withHeader('X-Api-Key', 'rahasia-uji')->postJson('/biteship/webhook', $payload)
            ->assertOk()
            ->assertExactJson(['message' => 'ok']);
        $this->assertSame(Order::STATUS_SHIPPED, $order->refresh()->status);

        Log::shouldHaveReceived('info')->withArgs(function (string $pesan, array $konteks): bool {
            return $pesan === 'Webhook Biteship diterima: token cocok'
                && $konteks['sumber'] === 'x-api-key'
                && ! str_contains(json_encode($konteks), 'rahasia-uji');
        })->once();
    }

    /** v1.5 B2: token `.env` kosong (mode uji lokal) tetap menerima header apa pun. */
    public function test_token_kosong_menerima_header_apa_pun(): void
    {
        config(['biteship.webhook_token' => null]);
        $order = $this->pesanan();

        $this->withHeader('X-Nama-Bebas', 'apa-saja')
            ->postJson('/biteship/webhook', ['event' => 'order.status', 'order_id' => 'BIT-1', 'status' => 'picked'])
            ->assertOk();

        $this->assertSame(Order::STATUS_SHIPPED, $order->refresh()->status);
    }
}

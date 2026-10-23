<?php

namespace Tests\Feature\Checkout;

use App\Models\Category;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\User;
use App\Services\Midtrans\MidtransApi;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\Support\FakeMidtransApi;
use Tests\TestCase;

/**
 * Masa berlaku tagihan QRIS **5 menit** — keputusan pemilik `docs/pertanyaan-pemilik.md` §5 P1
 * (menggantikan 15 menit), kartu `t_e35050e8`.
 *
 * Berkas ini menjaga satu nilai yang dipakai di empat tempat: `custom_expiry.expiry_duration`
 * yang dikirim ke Midtrans, kolom `payments.expires_at`, prop `pembayaran.expiry_minutes`
 * halaman checkout (§7.5), dan `pembayaran.expires_at` halaman bayar (§7.6) — pada nilai
 * bawaan, override config, maupun saat tagihan mode uji dibuat ulang.
 * Jaringan Midtrans diganti `FakeMidtransApi`.
 */
class QrisExpiryTest extends TestCase
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

        $this->actingAs(User::factory()->create());

        $this->modeAsli();
        config(['midtrans.expiry_minutes' => 5]);

        Setting::create([
            'key' => 'shipping_cost_default',
            'value' => '20000',
            'group' => 'pengiriman',
            'type' => 'number',
        ]);

        Setting::create([
            'key' => 'store_name',
            'value' => '[CONTOH] Toko Daster Kulot',
            'group' => 'umum',
            'type' => 'text',
        ]);

        $category = Category::create([
            'name' => '[CONTOH] Daster',
            'slug' => 'contoh-daster-qris-expiry',
            'is_active' => true,
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => '[CONTOH] Daster Kulot Premium',
            'slug' => 'contoh-daster-kulot-premium-qris-expiry',
            'base_price' => 85000,
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'size' => 'L',
            'color' => 'Merah',
            'sku' => 'CONTOH-QE-L-MERAH',
            'price_delta' => 0,
            'stock' => 10,
            'is_active' => true,
        ]);

        $this->productId = (int) $product->id;
        $this->variantId = (int) $variant->id;
    }

    public function test_lima_menit_dipakai_di_props_checkout_custom_expiry_dan_expires_at(): void
    {
        $this->tambahKeKeranjang();

        $this->get('/checkout')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Checkout', false)
                ->where('pembayaran.expiry_minutes', 5)
            );

        $order = $this->buatPesanan();

        $this->assertSame(
            ['expiry_duration' => 5, 'unit' => 'minute'],
            $this->api->charges[0]['custom_expiry'] ?? null,
            'custom_expiry Midtrans harus 5 menit.'
        );

        $payment = Payment::query()->where('order_id', $order->id)->firstOrFail();
        $this->assertKedaluwarsa($payment->expires_at, 5);

        $props = $this->props('/checkout/'.$order->id.'/bayar');
        $this->assertKedaluwarsaIso($props['pembayaran']['expires_at'] ?? null, 5);
        $this->assertSame(1, $this->api->chargeCount, 'Membuka halaman bayar tidak boleh membuat tagihan kedua.');
    }

    public function test_override_config_dipakai_semua_tempat(): void
    {
        config(['midtrans.expiry_minutes' => 3]);

        $this->tambahKeKeranjang();

        $this->get('/checkout')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Checkout', false)
                ->where('pembayaran.expiry_minutes', 3)
            );

        $order = $this->buatPesanan();

        $this->assertSame(
            ['expiry_duration' => 3, 'unit' => 'minute'],
            $this->api->charges[0]['custom_expiry'] ?? null,
            'Override MIDTRANS_EXPIRY_MINUTES harus sampai ke Midtrans.'
        );

        $payment = Payment::query()->where('order_id', $order->id)->firstOrFail();
        $this->assertKedaluwarsa($payment->expires_at, 3);

        $props = $this->props('/checkout/'.$order->id.'/bayar');
        $this->assertKedaluwarsaIso($props['pembayaran']['expires_at'] ?? null, 3);
    }

    public function test_nilai_config_tidak_sah_jatuh_ke_bawaan_lima_menit(): void
    {
        config(['midtrans.expiry_minutes' => 0]);

        $this->tambahKeKeranjang();
        $order = $this->buatPesanan();

        $this->assertSame(
            ['expiry_duration' => 5, 'unit' => 'minute'],
            $this->api->charges[0]['custom_expiry'] ?? null
        );

        $payment = Payment::query()->where('order_id', $order->id)->firstOrFail();
        $this->assertKedaluwarsa($payment->expires_at, 5);
    }

    public function test_tagihan_dibuat_ulang_memakai_masa_berlaku_terbaru(): void
    {
        $this->modeUji();

        $this->tambahKeKeranjang();
        $order = $this->buatPesanan();
        $payment = Payment::query()->where('order_id', $order->id)->firstOrFail();

        $this->assertSame(0, $this->api->chargeCount, 'Mode uji tidak memanggil Midtrans.');
        $this->assertStringStartsWith('fake-', (string) $payment->transaction_id);

        $this->modeAsli();
        config(['midtrans.expiry_minutes' => 2]);

        $props = $this->props('/checkout/'.$order->id.'/bayar');

        $this->assertSame(1, $this->api->chargeCount, 'Tagihan mode uji dibuat ulang tepat sekali.');
        $this->assertSame(
            ['expiry_duration' => 2, 'unit' => 'minute'],
            $this->api->charges[0]['custom_expiry'] ?? null,
            'Tagihan yang dibuat ulang memakai nilai config terbaru.'
        );
        $this->assertSame(1, Payment::query()->count(), 'Satu tagihan per pesanan (kontrak §7.5).');

        $fresh = $payment->refresh();

        $this->assertStringStartsWith('trx-', (string) $fresh->transaction_id);
        $this->assertKedaluwarsa($fresh->expires_at, 2);
        $this->assertKedaluwarsaIso($props['pembayaran']['expires_at'] ?? null, 2);
    }

    private function modeAsli(): void
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
        config(['midtrans.fake' => true]);
    }

    private function tambahKeKeranjang(): void
    {
        $this->post('/keranjang', [
            'product_id' => $this->productId,
            'variant_id' => $this->variantId,
            'qty' => 1,
        ])->assertSessionHas('success');
    }

    private function buatPesanan(): Order
    {
        $this->post('/checkout', [
            'customer_name' => 'Siti Aminah',
            'customer_phone' => '081234567890',
            'customer_email' => 'siti@example.test',
            'customer_address' => 'Jl. Melati No. 12, RT 02 RW 03',
            'customer_city' => 'Pekalongan',
            'customer_postal_code' => '51111',
            'note' => 'Tolong dibungkus rapi.',
        ])->assertSessionHas('success');

        return Order::query()->firstOrFail();
    }

    /**
     * Props Inertia halaman (pola yang sudah dipakai test katalog).
     *
     * @return array<string, mixed>
     */
    private function props(string $url): array
    {
        $response = $this->get($url)->assertOk();

        /** @var array<string, mixed> $props */
        $props = $response->viewData('page')['props'];

        return $props;
    }

    /**
     * `payments.expires_at` (kolom model) harus ± `$menit` menit dari sekarang.
     */
    private function assertKedaluwarsa(?Carbon $expiresAt, int $menit): void
    {
        $this->assertNotNull($expiresAt, 'Kolom payments.expires_at wajib terisi (kontrak §7.5).');

        $this->assertSelisih($this->selisihDetik($expiresAt, $menit), $menit, 'payments.expires_at (kolom database)');
    }

    /**
     * `pembayaran.expires_at` (prop ISO 8601 halaman bayar) harus ± `$menit` menit dari sekarang —
     * nilai inilah yang dihitung Countdown di halaman bayar.
     */
    private function assertKedaluwarsaIso(?string $iso, int $menit): void
    {
        $this->assertNotNull($iso, 'Prop pembayaran.expires_at wajib berisi ISO 8601 (kontrak §7.6).');

        $this->assertSelisih($this->selisihDetik(Carbon::parse($iso), $menit), $menit, 'pembayaran.expires_at (prop)');
    }

    private function selisihDetik(Carbon $waktu, int $menit): int
    {
        return (int) abs($waktu->diffInSeconds(Carbon::now()->addMinutes($menit)));
    }

    private function assertSelisih(int $selisih, int $menit, string $label): void
    {
        $this->assertLessThanOrEqual(60, $selisih, "{$label} harus ±{$menit} menit dari sekarang; selisih {$selisih} detik.");
    }
}

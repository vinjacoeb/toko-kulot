<?php

namespace Tests\Feature\Checkout;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

/**
 * Verifikasi independen QA untuk props `ulasan.boleh` (kontrak §7.9, dibekukan 21 Okt 2026)
 * pada kartu `t_4ef6e8bd`. Test ini ditulis QA, bukan salinan test regresi backend
 * (`CheckoutTest` kartu `t_45344e00`), supaya klaim kartu diperiksa jalur yang berbeda:
 *
 * - matriks status: `boleh` harus `true` tepat pada status yang benar-benar diterima
 *   `ReviewService::isEligible()` (`dibayar`, `diproses`, `dikirim`, `selesai` + `settlement`);
 * - invarian "props tidak berbohong": untuk setiap keadaan, kiriman ulasan diterima server
 *   **jika dan hanya jika** `boleh` bernilai `true`;
 * - bentuk respons §7.9 (`boleh` boolean, `sudah` daftar product_id bulat, tanpa kunci baru);
 * - produk yang sama pada dua item (beda varian) dihitung sekali (`unique()`).
 *
 * Tanpa server jaringan: seluruh alur lewat HTTP kernel `php artisan test`/phpunit + sqlite
 * in-memory (phpunit.xml), bukan database pemilik. Webhook Midtrans memakai mode fake.
 */
class UlasanBolehVerifikasiQaTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private int $produkA = 0;

    private int $varianA1 = 0;

    private int $varianA2 = 0;

    private int $produkB = 0;

    private int $varianB = 0;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->actingAs($this->user);

        config([
            'midtrans.fake' => true,
            'midtrans.server_key' => 'test-server-key',
            'midtrans.expiry_minutes' => 5,
            'biteship.key' => null,
        ]);

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

        $kategori = Category::create([
            'name' => '[CONTOH] Daster',
            'slug' => 'contoh-daster',
            'is_active' => true,
        ]);

        $produkA = Product::create([
            'category_id' => $kategori->id,
            'name' => '[CONTOH] Daster Kulot Premium',
            'slug' => 'contoh-daster-kulot-premium',
            'base_price' => 85000,
            'is_active' => true,
        ]);

        $varianA1 = ProductVariant::create([
            'product_id' => $produkA->id,
            'size' => 'L',
            'color' => 'Merah',
            'sku' => 'QA-L-MERAH',
            'price_delta' => 0,
            'stock' => 10,
            'is_active' => true,
        ]);

        $varianA2 = ProductVariant::create([
            'product_id' => $produkA->id,
            'size' => 'XL',
            'color' => 'Biru',
            'sku' => 'QA-XL-BIRU',
            'price_delta' => 0,
            'stock' => 10,
            'is_active' => true,
        ]);

        $produkB = Product::create([
            'category_id' => $kategori->id,
            'name' => '[CONTOH] Daster Kulot Lengan Panjang',
            'slug' => 'contoh-daster-kulot-lengan-panjang',
            'base_price' => 95000,
            'is_active' => true,
        ]);

        $varianB = ProductVariant::create([
            'product_id' => $produkB->id,
            'size' => 'M',
            'color' => 'Hijau',
            'sku' => 'QA-M-HIJAU',
            'price_delta' => 0,
            'stock' => 10,
            'is_active' => true,
        ]);

        $this->produkA = (int) $produkA->id;
        $this->varianA1 = (int) $varianA1->id;
        $this->varianA2 = (int) $varianA2->id;
        $this->produkB = (int) $produkB->id;
        $this->varianB = (int) $varianB->id;
    }

    // ------------------------------------------------------------------ uji

    /**
     * Invarian inti §7.9: `boleh` menunjuk tepat pada kemampuan server menerima ulasan.
     * Matriks memuat empat status yang boleh dinilai (`dibayar`, `diproses`, `dikirim`, `selesai`)
     * plus dua keadaan penjaga (`batal`, dan `pending` yang dipaksakan lewat kolom status meski
     * alur UI tidak menawarkannya setelah lunas) untuk memastikan nilainya ikut `isEligible()`.
     */
    public function test_boleh_sama_persis_dengan_kemampuan_server_menerima_ulasan(): void
    {
        // Matriks ini mengirim 6 POST untuk mengukur `isEligible()`, sedangkan
        // `throttle:review` hanya 5/menit per pembeli+IP. Batas laju dilepas di sini
        // dan diuji sendiri oleh test_batas_laju_kiriman_ulasan_dibatasi_per_menit().
        $this->withoutMiddleware(ThrottleRequests::class);

        $matriks = [
            Order::STATUS_PAID => true,
            Order::STATUS_PROCESSING => true,
            Order::STATUS_SHIPPED => true,
            Order::STATUS_COMPLETED => true,
            Order::STATUS_CANCELLED => false,
            Order::STATUS_PENDING => false,
        ];

        foreach ($matriks as $status => $diharapkan) {
            $order = $this->pesananLunas([[$this->produkA, $this->varianA1], [$this->produkB, $this->varianB]]);
            $order->update(['status' => $status]);

            $props = $this->propsUlasan($order);

            $this->assertSame(
                Order::PAYMENT_SETTLEMENT,
                $props['pesanan']['payment_status'],
                "prasyarat: pesanan status {$status} harus tetap settlement",
            );
            $this->assertSame(
                $diharapkan,
                $props['ulasan']['boleh'],
                "boleh untuk status {$status} (settlement, belum ada ulasan)",
            );
            $this->assertSame([], $props['ulasan']['sudah'], "sudah harus kosong untuk status {$status}");

            // Bukti silang: server benar-benar menerima/menolak kiriman sesuai nilai `boleh`.
            $kiriman = $this->kirimUlasan($order, [
                ['product_id' => $this->produkA, 'rating' => 5, 'comment' => 'Uji invarian QA.'],
            ]);

            if ($diharapkan) {
                $kiriman->assertRedirect(route('checkout.success', $order));
                $kiriman->assertSessionHas('success');
                $this->assertSame(1, Review::query()->where('order_id', $order->id)->count(), "ulasan status {$status}");
            } else {
                $kiriman->assertSessionHas('error', 'Ulasan bisa dikirim setelah pembayaran berhasil.');
                $this->assertSame(0, Review::query()->where('order_id', $order->id)->count(), "ulasan status {$status}");
            }
        }
    }

    /**
     * Kasus wajib kartu: 2 produk, 1 diulas → `boleh = true` + `sudah` berisi 1 id,
     * dan produk sisa memang masih bisa dikirim (§9.1).
     */
    public function test_dua_produk_satu_ulasan_boleh_true_dan_sisa_produk_masih_diterima(): void
    {
        $order = $this->pesananLunas([[$this->produkA, $this->varianA1], [$this->produkB, $this->varianB]]);

        $this->kirimUlasan($order, [
            ['product_id' => $this->produkA, 'rating' => 4, 'comment' => 'Bahan adem.'],
        ])->assertSessionHas('success');

        $props = $this->propsUlasan($order);

        $this->assertSame(true, $props['ulasan']['boleh']);
        $this->assertSame([$this->produkA], $props['ulasan']['sudah']);

        $this->kirimUlasan($order, [
            ['product_id' => $this->produkB, 'rating' => 5, 'comment' => 'Sesuai foto.'],
        ])->assertSessionHas('success');

        $this->assertSame(2, Review::query()->where('order_id', $order->id)->count());

        $propsLengkap = $this->propsUlasan($order);

        $this->assertSame(false, $propsLengkap['ulasan']['boleh'], 'semua produk diulas → boleh false');
        $this->assertEqualsCanonicalizing(
            [$this->produkA, $this->produkB],
            $propsLengkap['ulasan']['sudah'],
            'sudah harus memuat kedua product_id (urutan tidak diatur kontrak §7.9)',
        );
    }

    /**
     * Kasus wajib kartu: `settlement` + status `batal` → `boleh = false` (server menolak).
     */
    public function test_settlement_status_batal_boleh_false_dan_kiriman_ditolak(): void
    {
        $order = $this->pesananLunas([[$this->produkA, $this->varianA1], [$this->produkB, $this->varianB]]);
        $order->update(['status' => Order::STATUS_CANCELLED]);

        $props = $this->propsUlasan($order);

        $this->assertSame(Order::PAYMENT_SETTLEMENT, $props['pesanan']['payment_status']);
        $this->assertSame(Order::STATUS_CANCELLED, $props['pesanan']['status']);
        $this->assertSame(false, $props['ulasan']['boleh']);
        $this->assertSame([], $props['ulasan']['sudah']);

        $this->kirimUlasan($order, [['product_id' => $this->produkA, 'rating' => 5]])
            ->assertSessionHas('error', 'Ulasan bisa dikirim setelah pembayaran berhasil.');

        $this->assertSame(0, Review::query()->where('order_id', $order->id)->count());
    }

    /**
     * Bentuk respons §7.9 tidak berubah: kunci tetap `{boleh, sudah}`, `boleh` boolean asli
     * (bukan 0/1/string), `sudah` daftar id bulat (bukan string).
     */
    public function test_bentuk_props_ulasan_tidak_berubah(): void
    {
        $order = $this->pesananLunas([[$this->produkA, $this->varianA1], [$this->produkB, $this->varianB]]);

        $props = $this->propsUlasan($order);
        $ulasan = $props['ulasan'];

        $this->assertIsArray($ulasan);
        $this->assertSame(['boleh', 'sudah'], array_keys($ulasan), 'kunci ulasan harus persis boleh + sudah');
        $this->assertIsBool($ulasan['boleh']);
        $this->assertSame(true, $ulasan['boleh']);
        $this->assertIsArray($ulasan['sudah']);
        $this->assertSame([], $ulasan['sudah']);

        $this->kirimUlasan($order, [['product_id' => $this->produkA, 'rating' => 3]])->assertSessionHas('success');

        $ulasan = $this->propsUlasan($order)['ulasan'];

        $this->assertIsBool($ulasan['boleh']);
        $this->assertIsArray($ulasan['sudah']);
        $this->assertSame(1, count($ulasan['sudah']));
        $this->assertIsInt($ulasan['sudah'][0], 'product_id harus integer, bukan string');
        $this->assertSame($this->produkA, $ulasan['sudah'][0]);
        $this->assertSame(array_values($ulasan['sudah']), $ulasan['sudah'], 'sudah harus list, bukan map');
    }

    /**
     * Produk yang sama dipesan pada dua varian berbeda: `sudah` tetap satu id unik dan
     * `boleh` langsung `false` setelah produk itu dinilai sekali.
     */
    public function test_produk_sama_dua_varian_dihitung_sekali(): void
    {
        $order = $this->pesananLunas([[$this->produkA, $this->varianA1], [$this->produkA, $this->varianA2]]);

        $this->assertSame(2, $order->items()->count(), 'prasyarat: dua item untuk produk yang sama');
        $this->assertSame(
            [$this->produkA],
            $order->items()->pluck('product_id')->map(fn ($id): int => (int) $id)->unique()->values()->all(),
            'prasyarat: satu product_id unik pada pesanan',
        );

        $this->assertSame(true, $this->propsUlasan($order)['ulasan']['boleh']);

        $this->kirimUlasan($order, [['product_id' => $this->produkA, 'rating' => 5]])->assertSessionHas('success');

        $props = $this->propsUlasan($order);

        $this->assertSame(false, $props['ulasan']['boleh'], 'produk unik sudah diulas → tidak ada sisa');
        $this->assertSame([$this->produkA], $props['ulasan']['sudah'], 'sudah tidak boleh memuat duplikat');
    }

    /**
     * Ulasan ganda untuk produk yang sama tetap ditolak validasi walaupun `boleh` sempat true
     * (idempotensi §9.1) — memastikan `boleh` tidak membuka celah ulasan ganda.
     */
    public function test_ulasan_ganda_produk_sama_ditolak_walau_boleh_sempat_true(): void
    {
        $order = $this->pesananLunas([[$this->produkA, $this->varianA1], [$this->produkB, $this->varianB]]);

        $this->kirimUlasan($order, [['product_id' => $this->produkA, 'rating' => 5]])->assertSessionHas('success');
        $this->assertSame(true, $this->propsUlasan($order)['ulasan']['boleh']);

        $this->kirimUlasan($order, [['product_id' => $this->produkA, 'rating' => 1]])
            ->assertSessionHasErrors(['ulasan.0.product_id']);

        $this->assertSame(1, Review::query()->where('order_id', $order->id)->where('product_id', $this->produkA)->count());
    }

    /**
     * Batas laju §11 pada endpoint ulasan (5 kiriman/menit per pembeli + IP) ikut
     * memagari kiriman ulasan: kiriman ke-6 dalam satu menit ditolak 429.
     * Dicatat sebagai bukti pendukung, bukan bagian kontrak `ulasan.boleh`.
     */
    public function test_batas_laju_kiriman_ulasan_dibatasi_per_menit(): void
    {
        $order = $this->pesananLunas([[$this->produkA, $this->varianA1], [$this->produkB, $this->varianB]]);

        for ($ke = 1; $ke <= 5; $ke++) {
            $respons = $this->kirimUlasan($order, [['product_id' => $this->produkA, 'rating' => 5]]);
            $this->assertNotSame(429, $respons->getStatusCode(), "kiriman ke-{$ke} masih dalam kuota");
        }

        $this->assertSame(
            429,
            $this->kirimUlasan($order, [['product_id' => $this->produkA, 'rating' => 5]])->getStatusCode(),
            'kiriman ke-6 dalam satu menit harus dibatasi',
        );

        // Yang tersimpan tetap satu ulasan untuk produk tersebut.
        $this->assertSame(1, Review::query()->where('order_id', $order->id)->count());
    }

    // -------------------------------------------------------------- pembantu

    /**
     * @param  array<int, array{0: int, 1: int}>  $baris  [product_id, variant_id]
     */
    private function pesananLunas(array $baris): Order
    {
        foreach ($baris as [$productId, $variantId]) {
            $this->post('/keranjang', [
                'product_id' => $productId,
                'variant_id' => $variantId,
                'qty' => 1,
            ])->assertSessionHas('success');
        }

        $this->post('/checkout', [
            'customer_name' => 'Siti Aminah',
            'customer_phone' => '081234567890',
            'customer_email' => 'siti@example.test',
            'customer_address' => 'Jl. Melati No. 12, RT 02 RW 03',
            'customer_city' => 'Pekalongan',
            'customer_postal_code' => '51111',
            'note' => 'Uji QA.',
        ]);

        $order = Order::query()->orderByDesc('id')->firstOrFail();

        $this->kirimNotifikasi($order, 'settlement', '200')->assertOk();

        return $order->refresh();
    }

    /**
     * @param  array<int, array{product_id: int, rating: int, comment?: string|null}>  $items
     */
    private function kirimUlasan(Order $order, array $items): TestResponse
    {
        return $this->post('/checkout/'.$order->id.'/ulasan', ['ulasan' => $items]);
    }

    /**
     * Props Inertia halaman selesai apa adanya (tanpa perantara assertion props).
     *
     * @return array<string, mixed>
     */
    private function propsUlasan(Order $order): array
    {
        $response = $this->get('/checkout/'.$order->id.'/selesai');
        $response->assertOk();

        $props = null;

        $response->assertInertia(function ($page) use (&$props): void {
            $page->component('Public/CheckoutSuccess', false);
            $props = $page->toArray()['props'] ?? null;
        });

        $this->assertIsArray($props, 'props Inertia tidak terbaca dari respons');

        return $props;
    }

    private function kirimNotifikasi(Order $order, string $status, string $statusCode): TestResponse
    {
        $payload = [
            'order_id' => $order->code,
            'status_code' => $statusCode,
            'gross_amount' => (string) $order->total,
            'transaction_status' => $status,
            'transaction_id' => 'qa-'.$order->code,
        ];
        $payload['signature_key'] = hash(
            'sha512',
            $payload['order_id'].$payload['status_code'].$payload['gross_amount'].'test-server-key',
        );

        return $this->postJson('/midtrans/notification', $payload);
    }
}

<?php

namespace Tests\Feature\Checkout;

use App\Services\BiteshipWebhookService;
use Illuminate\Testing\TestResponse;
use RuntimeException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

/**
 * T-13-01 (docs/review-v1.3.md §4): `POST /biteship/webhook` selalu membalas JSON,
 * termasuk saat exception internal — tanpa SQL, trace, atau nama kolom — walaupun
 * `Accept: application/json` tidak dikirim (Biteship server-ke-server) dan
 * `APP_DEBUG` terbuka. Jalur 200/403/422 tidak berubah.
 */
class BiteshipWebhookExceptionJsonTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config(['biteship.webhook_token' => null]);
    }

    /** Kirim body mentah tanpa `Accept: application/json` (seperti Biteship asli). */
    private function kirimMentah(string $body, string $query = ''): TestResponse
    {
        return $this->call('POST', '/biteship/webhook'.$query, [], [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], $body);
    }

    /** Ganti service webhook dengan tiruan yang selalu melempar `$galat`. */
    private function pasangServiceMelempar(\Throwable $galat): void
    {
        $this->app->instance(BiteshipWebhookService::class, new class($galat) extends BiteshipWebhookService
        {
            public function __construct(private \Throwable $galat) {}

            public function tokenValid(?string $given, ?string $ip = null): bool
            {
                return true;
            }

            public function handle(array $payload, ?string $ip = null): bool
            {
                throw $this->galat;
            }
        });
    }

    public function test_exception_internal_dibalas_json_generik_tanpa_bocor_detail(): void
    {
        $this->pasangServiceMelempar(new RuntimeException(
            'SQLSTATE[42S22]: Column not found: 1054 Unknown column orders.shipping_status in field list'
        ));

        $respons = $this->kirimMentah(json_encode([
            'event' => 'order.status',
            'order_id' => 'BIT-1',
            'status' => 'picked',
        ]));

        $respons->assertStatus(500)
            ->assertHeader('content-type', 'application/json')
            ->assertExactJson(['message' => 'internal error']);

        $isi = (string) $respons->getContent();

        foreach (['SQLSTATE', 'shipping_status', 'orders.', 'Trace', 'trace', base_path()] as $bocor) {
            $this->assertStringNotContainsString($bocor, $isi, "Badan balasan tidak boleh memuat '{$bocor}'.");
        }
    }

    public function test_http_exception_5xx_dari_kode_juga_digenerikkan(): void
    {
        $this->pasangServiceMelempar(new HttpException(503, 'SQLSTATE[HY000] detail internal'));

        $this->kirimMentah(json_encode(['event' => 'order.status', 'order_id' => 'BIT-1']))
            ->assertStatus(500)
            ->assertExactJson(['message' => 'internal error']);
    }

    public function test_token_salah_tetap_403_json(): void
    {
        config(['biteship.webhook_token' => 'rahasia-uji']);

        $this->kirimMentah(json_encode(['event' => 'order.status', 'order_id' => 'BIT-1']), '?token=salah')
            ->assertForbidden()
            ->assertHeader('content-type', 'application/json')
            ->assertExactJson(['message' => 'invalid token']);
    }

    public function test_body_bukan_json_tetap_422_json(): void
    {
        $this->kirimMentah('{bukan json')
            ->assertStatus(422)
            ->assertHeader('content-type', 'application/json')
            ->assertExactJson(['message' => 'invalid payload']);
    }

    public function test_halaman_lain_tetap_404_dan_bukan_pesan_webhook(): void
    {
        $respons = $this->get('/halaman-tidak-ada-xyz');

        $respons->assertNotFound();
        $this->assertStringNotContainsString('internal error', (string) $respons->getContent());
    }
}

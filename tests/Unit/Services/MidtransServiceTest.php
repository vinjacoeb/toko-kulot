<?php

namespace Tests\Unit\Services;

use App\Models\Order;
use App\Services\MidtransService;
use App\Services\StockService;
use Tests\Support\FakeMidtransApi;
use Tests\TestCase;

/**
 * Pemetaan status Midtrans dan verifikasi signature webhook (PRD §8) — K15.
 *
 * Tanpa jaringan: hanya kontrak signature dan tabel pemetaan status yang diuji.
 */
class MidtransServiceTest extends TestCase
{
    private MidtransService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new MidtransService(new StockService, new FakeMidtransApi);
    }

    public function test_mode_info_bentuk_baku_mengikuti_kontrak(): void
    {
        config([
            'midtrans.fake' => true,
            'midtrans.server_key' => 'kunci-uji',
            'midtrans.client_key' => 'kunci-client',
        ]);

        $info = $this->service->modeInfo();

        $this->assertSame('uji', $info['mode']);
        $this->assertSame('fake_aktif', $info['alasan_kode']);
        $this->assertNull($info['client_key'], 'Kunci klien tidak dipublikasikan di mode uji.');
        $this->assertTrue($info['server_key_terisi']);
        $this->assertNotEmpty($info['langkah_perbaikan']);
        $this->assertNotEmpty($info['alasan']);
        $this->assertSame('.env (MIDTRANS_*)', $info['sumber_kredensial']);

        config(['midtrans.fake' => false]);
        $asli = $this->service->modeInfo();

        $this->assertSame('asli', $asli['mode']);
        $this->assertSame('kunci-client', $asli['client_key']);
        $this->assertNull($asli['alasan_kode']);
        $this->assertNull($asli['alasan']);
        $this->assertSame([], $asli['langkah_perbaikan']);

        config(['midtrans.server_key' => '']);
        $tanpaKunci = $this->service->modeInfo();

        $this->assertSame('uji', $tanpaKunci['mode'], 'Tanpa server key tidak boleh memanggil Midtrans.');
        $this->assertSame('server_key_kosong', $tanpaKunci['alasan_kode']);
        $this->assertFalse($tanpaKunci['server_key_terisi']);
    }

    public function test_pemetaan_status_midtrans_ke_status_pembayaran(): void
    {
        $this->assertSame(Order::PAYMENT_SETTLEMENT, $this->service->mapStatus('settlement'));
        $this->assertSame(Order::PAYMENT_SETTLEMENT, $this->service->mapStatus('capture'));
        $this->assertSame(Order::PAYMENT_PENDING, $this->service->mapStatus('pending'));
        $this->assertSame(Order::PAYMENT_EXPIRE, $this->service->mapStatus('expire'));
        $this->assertSame(Order::PAYMENT_DENY, $this->service->mapStatus('deny'));
        $this->assertSame(Order::PAYMENT_CANCEL, $this->service->mapStatus('cancel'));
    }

    public function test_status_midtrans_tidak_dikenal_diabaikan(): void
    {
        $this->assertNull($this->service->mapStatus('refund'));
        $this->assertNull($this->service->mapStatus(''));
    }

    public function test_mode_fake_aktif_saat_server_key_kosong(): void
    {
        config(['midtrans.fake' => false, 'midtrans.server_key' => '']);

        $this->assertTrue($this->service->isFake(), 'Tanpa server key tidak boleh memanggil API Midtrans.');
    }

    public function test_mode_fake_mengikuti_flag_konfigurasi(): void
    {
        config(['midtrans.fake' => true, 'midtrans.server_key' => 'kunci-uji']);
        $this->assertTrue($this->service->isFake());

        config(['midtrans.fake' => false, 'midtrans.server_key' => 'kunci-uji']);
        $this->assertFalse($this->service->isFake());
    }

    public function test_signature_valid_diterima(): void
    {
        config(['midtrans.fake' => false, 'midtrans.server_key' => 'kunci-uji']);

        $payload = $this->payload();
        $payload['signature_key'] = hash('sha512', $payload['order_id'].$payload['status_code'].$payload['gross_amount'].'kunci-uji');

        $this->assertTrue($this->service->verifySignature($payload));
    }

    public function test_signature_salah_ditolak(): void
    {
        config(['midtrans.fake' => false, 'midtrans.server_key' => 'kunci-uji']);

        $payload = $this->payload();
        $payload['signature_key'] = str_repeat('a', 128);

        $this->assertFalse($this->service->verifySignature($payload));
    }

    public function test_signature_dengan_field_tidak_lengkap_ditolak(): void
    {
        config(['midtrans.fake' => false, 'midtrans.server_key' => 'kunci-uji']);

        $this->assertFalse($this->service->verifySignature([]));
        $this->assertFalse($this->service->verifySignature(['order_id' => 'DS-1', 'status_code' => '200']));
        $this->assertFalse($this->service->verifySignature($this->payload()));
    }

    public function test_tanpa_server_key_dan_tanpa_mode_fake_notifikasi_ditolak(): void
    {
        config(['midtrans.fake' => false, 'midtrans.server_key' => '']);

        $payload = $this->payload();
        $payload['signature_key'] = hash('sha512', $payload['order_id'].$payload['status_code'].$payload['gross_amount']);

        $this->assertFalse($this->service->verifySignature($payload));
    }

    public function test_mode_fake_menerima_notifikasi_lokal(): void
    {
        config(['midtrans.fake' => true, 'midtrans.server_key' => '']);

        $payload = $this->payload();
        $payload['signature_key'] = hash('sha512', $payload['order_id'].$payload['status_code'].$payload['gross_amount']);

        $this->assertTrue($this->service->verifySignature($payload));
    }

    /**
     * @return array<string, string>
     */
    private function payload(): array
    {
        return [
            'order_id' => 'DS-20261020-0001',
            'status_code' => '200',
            'gross_amount' => '105000.00',
            'transaction_status' => 'settlement',
        ];
    }
}

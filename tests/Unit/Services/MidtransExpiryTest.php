<?php

namespace Tests\Unit\Services;

use App\Services\MidtransService;
use App\Services\StockService;
use Tests\Support\FakeMidtransApi;
use Tests\TestCase;

/**
 * Masa berlaku tagihan QRIS — keputusan pemilik 21 Oktober 2026: **5 menit**
 * (docs/pertanyaan-pemilik.md §5 P1, menggantikan 15 menit di PRD §8 butir 6 + A17;
 * kartu t_e35050e8).
 *
 * Yang dijaga berkas ini: (1) bawaan berkas `config/midtrans.php`, (2) override lewat
 * `MIDTRANS_EXPIRY_MINUTES`, (3) nilai tidak sah tidak pernah lolos, dan (4) satu nilai
 * untuk `custom_expiry` Midtrans sekaligus `payments.expires_at`.
 *
 * Tanpa jaringan dan tanpa database: berkas config dibaca langsung dengan env
 * MIDTRANS_EXPIRY_MINUTES diatur sementara.
 */
class MidtransExpiryTest extends TestCase
{
    private const ENV_KEY = 'MIDTRANS_EXPIRY_MINUTES';

    private MidtransService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new MidtransService(new StockService, new FakeMidtransApi);
    }

    public function test_bawaan_berkas_config_lima_menit(): void
    {
        $this->assertSame(5, MidtransService::DEFAULT_EXPIRY_MINUTES);
        $this->assertSame(5, $this->bacaBerkasConfig(null)['expiry_minutes'], 'Bawaan: 5 menit (keputusan pemilik 21 Okt 2026).');
        $this->assertSame(60, $this->bacaBerkasConfig(null)['expiry_va_minutes'], 'Bawaan VA/gerai: 60 menit (PRD-v1.2 §2.2).');
    }

    public function test_expiry_per_kanal_memakai_lima_menit_untuk_qris_dan_enam_puluh_untuk_lainnya(): void
    {
        config(['midtrans.expiry_minutes' => 5, 'midtrans.expiry_va_minutes' => 60]);

        $this->assertSame(5, $this->service->expiryMinutesFor('qris'));
        $this->assertSame(60, $this->service->expiryMinutesFor('bca_va'));
        $this->assertSame(60, $this->service->expiryMinutesFor('mandiri_bill'));
        $this->assertSame(60, $this->service->expiryMinutesFor('alfamart'));
        $this->assertSame(60, $this->service->expiryMinutesFor(null), 'Belum ada kanal → batas VA.');
    }

    public function test_override_env_dipakai_berkas_config(): void
    {
        $this->assertSame(7, $this->bacaBerkasConfig('7')['expiry_minutes']);
        $this->assertSame(1, $this->bacaBerkasConfig('1')['expiry_minutes']);
    }

    public function test_nilai_env_tidak_sah_jatuh_ke_bawaan_lima_menit(): void
    {
        foreach (['0', '-3', 'abc', '3.5', ''] as $nilai) {
            $this->assertSame(
                5,
                $this->bacaBerkasConfig($nilai)['expiry_minutes'],
                "Nilai env \"{$nilai}\" harus jatuh ke bawaan 5 menit."
            );
        }
    }

    public function test_expiry_minutes_mengikuti_config_dan_menolak_nilai_tidak_sah(): void
    {
        config(['midtrans.expiry_minutes' => 5]);
        $this->assertSame(5, $this->service->expiryMinutes());

        config(['midtrans.expiry_minutes' => 3]);
        $this->assertSame(3, $this->service->expiryMinutes(), 'Override config harus dipakai apa adanya.');

        config(['midtrans.expiry_minutes' => 0]);
        $this->assertSame(5, $this->service->expiryMinutes(), 'Nol menit tidak masuk akal → bawaan.');

        config(['midtrans.expiry_minutes' => -10]);
        $this->assertSame(5, $this->service->expiryMinutes(), 'Negatif tidak masuk akal → bawaan.');

        config(['midtrans.expiry_minutes' => null]);
        $this->assertSame(5, $this->service->expiryMinutes(), 'Nilai kosong → bawaan.');

        config(['midtrans.expiry_minutes' => '4']);
        $this->assertSame(4, $this->service->expiryMinutes(), 'Nilai dari .env berbentuk teks → dibaca sebagai menit.');
    }

    /**
     * Baca `config/midtrans.php` seperti Laravel, dengan `MIDTRANS_EXPIRY_MINUTES`
     * diatur sementara lalu dikembalikan apa adanya (termasuk bila pemilik mengisinya
     * di `.env`).
     *
     * @return array<string, mixed>
     */
    private function bacaBerkasConfig(?string $nilai): array
    {
        $sebelumPutenv = getenv(self::ENV_KEY);
        $sebelumServer = $_SERVER[self::ENV_KEY] ?? null;
        $sebelumEnv = $_ENV[self::ENV_KEY] ?? null;

        if ($nilai === null) {
            putenv(self::ENV_KEY);
            unset($_SERVER[self::ENV_KEY], $_ENV[self::ENV_KEY]);
        } else {
            putenv(self::ENV_KEY.'='.$nilai);
            $_SERVER[self::ENV_KEY] = $nilai;
            $_ENV[self::ENV_KEY] = $nilai;
        }

        try {
            /** @var array<string, mixed> $config */
            $config = require base_path('config/midtrans.php');
        } finally {
            $sebelumPutenv === false
                ? putenv(self::ENV_KEY)
                : putenv(self::ENV_KEY.'='.$sebelumPutenv);

            $sebelumServer === null
                ? $_SERVER[self::ENV_KEY] = null
                : $_SERVER[self::ENV_KEY] = $sebelumServer;

            $sebelumEnv === null
                ? $_ENV[self::ENV_KEY] = null
                : $_ENV[self::ENV_KEY] = $sebelumEnv;
        }

        return $config;
    }
}

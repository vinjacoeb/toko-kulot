<?php

namespace App\Services;

use App\Exceptions\CheckoutException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Ongkir Biteship (PRD v1.1 D2/D3).
 *
 * Satu pintu tarif: `rates()` untuk daftar opsi (checkout) dan `quote()` untuk
 * harga final saat submit. Tanpa `BITESHIP_API_KEY` service berjalan mode `fake`
 * dengan tarif datar `settings.shipping_cost_default`; kegagalan API tidak pernah
 * menghasilkan tarif tebakan.
 */
class BiteshipService
{
    /** Layanan default seed (PRD v1.1 A20) saat settings belum berisi. */
    public const DEFAULT_COURIERS = [
        ['courier_code' => 'jne', 'courier_name' => 'JNE', 'service_code' => 'reg', 'service_name' => 'REG', 'label' => 'JNE REG', 'is_regular' => true],
        ['courier_code' => 'jnt', 'courier_name' => 'J&T', 'service_code' => 'ez', 'service_name' => 'EZ', 'label' => 'J&T EZ', 'is_regular' => true],
        ['courier_code' => 'sicepat', 'courier_name' => 'SiCepat', 'service_code' => 'reg', 'service_name' => 'REG', 'label' => 'SiCepat REG', 'is_regular' => true],
        ['courier_code' => 'anteraja', 'courier_name' => 'AnterAja', 'service_code' => 'reg', 'service_name' => 'REG', 'label' => 'AnterAja REG', 'is_regular' => true],
        ['courier_code' => 'ninja', 'courier_name' => 'Ninja Xpress', 'service_code' => 'standard', 'service_name' => 'Standard', 'label' => 'Ninja Standard', 'is_regular' => true],
        ['courier_code' => 'tiki', 'courier_name' => 'TIKI', 'service_code' => 'reg', 'service_name' => 'REG', 'label' => 'TIKI REG', 'is_regular' => true],
    ];

    public const GALAT_API = 'Ongkir tidak bisa dihitung saat ini. Coba lagi atau hubungi penjual.';

    /** Pesan Indonesia per kode error rates Biteship (biteship.com/en/docs/api/rates/error). */
    public const GALAT_KODE_POS = 'Kode pos tidak dikenal. Periksa kode pos tujuan; bila tetap gagal, hubungi penjual.';

    public const GALAT_PARAMETER = 'Ongkir tidak bisa dihitung karena pengaturan Biteship belum lengkap. Hubungi penjual.';

    public const GALAT_TANPA_KURIR = 'Tidak ada layanan kurir untuk kode pos ini. Coba kode pos lain.';

    /** Biteship 400 tanpa `code`: `No sufficient balance to call rates API. Please top up your balance`. */
    public const GALAT_SALDO = 'Ongkir tidak bisa dihitung karena saldo Biteship penjual habis. Hubungi penjual.';

    public function __construct(private readonly SettingService $settings) {}

    public function keyFilled(): bool
    {
        return trim((string) config('biteship.key')) !== '';
    }

    public function isFake(): bool
    {
        return ! $this->keyFilled();
    }

    public function mode(): string
    {
        return $this->isFake() ? 'fake' : 'api';
    }

    /** Tarif datar mode uji (default Rp20.000, PRD v1.1 D2). */
    public function fakeRate(): int
    {
        return (int) ($this->settings->get('shipping_cost_default') ?? 20000);
    }

    /**
     * @return array{aktif: bool, min: int}
     */
    public function freeShipping(): array
    {
        return [
            'aktif' => (bool) $this->settings->get('free_shipping_enabled', true),
            'min' => (int) ($this->settings->get('free_shipping_min') ?? 300000),
        ];
    }

    /**
     * @return array{nama: ?string, kode_pos: ?string}
     */
    public function origin(): array
    {
        return [
            'nama' => $this->settings->get('shipping_origin_name'),
            'kode_pos' => $this->settings->get('shipping_origin_postal_code'),
        ];
    }

    /**
     * Layanan kurir dari `settings.shipping_couriers` (bentuk PRD v1.1 §5).
     *
     * @return list<array{courier_code: string, courier_name: string, service_code: string, service_name: string, label: string, is_regular: bool, is_active: bool}>
     */
    public function services(bool $activeOnly = true): array
    {
        $stored = $this->settings->get('shipping_couriers');
        $rows = is_array($stored) ? $stored : [];
        $services = [];

        foreach ($rows as $row) {
            if (! is_array($row)) {
                continue;
            }

            $courier = strtolower(trim((string) ($row['courier_code'] ?? '')));
            $service = trim((string) ($row['service_code'] ?? ''));

            if ($courier === '' || $service === '') {
                continue;
            }

            $services[] = $this->normalize([
                'courier_code' => $courier,
                'service_code' => $service,
                'label' => $row['label'] ?? null,
                'is_regular' => (bool) ($row['is_regular'] ?? false),
                'is_active' => (bool) ($row['is_active'] ?? true),
            ]);
        }

        if ($services === []) {
            $services = array_map(fn (array $row): array => $this->normalize($row), self::DEFAULT_COURIERS);
        }

        return $activeOnly
            ? array_values(array_filter($services, fn (array $row): bool => $row['is_active']))
            : $services;
    }

    /**
     * Daftar opsi ongkir untuk checkout (kontrak §7.12).
     *
     * @param  list<array{name: string, value: int, quantity: int, weight: int}>  $items
     * @return array{mode: string, opsi: list<array<string, mixed>>, galat: ?string}
     */
    public function rates(string $postalCode, array $items, int $subtotal, ?string $city = null): array
    {
        $services = $this->services(true);

        if ($this->isFake()) {
            $rate = $this->fakeRate();

            return [
                'mode' => 'fake',
                'opsi' => array_map(fn (array $s): array => $this->option($s, $rate, '1-2 hari', $subtotal), $services),
                'galat' => null,
            ];
        }

        $origin = trim((string) $this->settings->get('shipping_origin_postal_code', ''));

        if (! preg_match('/^\d{5}$/', $origin)) {
            return [
                'mode' => 'api',
                'opsi' => [],
                'galat' => 'Kode pos asal toko belum diatur. Lengkapi di halaman Ekspedisi.',
            ];
        }

        $body = [
            'origin_postal_code' => (int) $origin,
            'destination_postal_code' => (int) $postalCode,
            'couriers' => implode(',', array_values(array_unique(array_column($services, 'courier_code')))),
            'items' => $items,
        ];

        if ($city !== null && trim($city) !== '') {
            $body['destination_city'] = trim($city);
        }

        try {
            $response = Http::withToken((string) config('biteship.key'))
                ->acceptJson()
                ->timeout((int) config('biteship.timeout', 8))
                ->post(rtrim((string) config('biteship.base_url'), '/').'/v1/rates/couriers', $body);
        } catch (Throwable $exception) {
            Log::warning('Biteship rates gagal dihubungi', [
                'error' => $exception->getMessage(),
                'origin_postal_code' => (int) $origin,
                'destination_postal_code' => (int) $postalCode,
            ]);

            return ['mode' => 'api', 'opsi' => [], 'galat' => self::GALAT_API];
        }

        $pricing = $response->successful() ? $response->json('pricing') : null;

        if (! is_array($pricing)) {
            $this->logGagalBiteship('Biteship rates menjawab tidak sukses', $response, [
                'origin_postal_code' => (int) $origin,
                'destination_postal_code' => (int) $postalCode,
            ]);

            return [
                'mode' => 'api',
                'opsi' => [],
                'galat' => $this->pesanGalat((int) $response->json('code'), $response->json('error')),
            ];
        }

        $byService = [];

        foreach ($pricing as $row) {
            if (! is_array($row)) {
                continue;
            }

            $key = strtolower(trim((string) ($row['courier_code'] ?? '')).':'.trim((string) ($row['courier_service_code'] ?? $row['service_code'] ?? '')));
            $cost = (int) ($row['price'] ?? $row['shipping_fee'] ?? 0);

            if ($key !== ':' && $cost > 0) {
                $byService[$key] = ['cost' => $cost, 'etd' => $this->etd($row)];
            }
        }

        $options = [];

        foreach ($services as $service) {
            $quote = $byService[strtolower($service['courier_code'].':'.$service['service_code'])] ?? null;

            if ($quote === null) {
                continue;
            }

            $options[] = $this->option($service, $quote['cost'], $quote['etd'], $subtotal);
        }

        return [
            'mode' => 'api',
            'opsi' => $options,
            'galat' => $options === [] ? self::GALAT_TANPA_KURIR : null,
        ];
    }

    /**
     * Harga final layanan pilihan pembeli. `null` = layanan tidak ada lagi.
     *
     * @param  list<array{name: string, value: int, quantity: int, weight: int}>  $items
     * @return array{cost: int, gratis: bool, is_regular: bool, etd: ?string, label: string}|null
     *
     * @throws CheckoutException saat Biteship gagal dihubungi
     */
    public function quote(string $courier, string $service, string $postalCode, array $items, int $subtotal, ?string $city = null): ?array
    {
        $result = $this->rates($postalCode, $items, $subtotal, $city);

        if ($result['galat'] !== null) {
            throw new CheckoutException($result['galat']);
        }

        foreach ($result['opsi'] as $option) {
            if ($option['courier_code'] === strtolower($courier) && $option['service_code'] === $service) {
                return [
                    'cost' => (int) $option['cost'],
                    'gratis' => (bool) $option['gratis'],
                    'is_regular' => (bool) $option['is_regular'],
                    'etd' => $option['etd'],
                    'label' => $option['label'],
                ];
            }
        }

        return null;
    }

    /**
     * Gabungan layanan Biteship + pilihan tersimpan untuk panel admin (§10.13).
     *
     * @return array{mode: string, key_terisi: bool, sumber: string, galat: ?string, daftar: list<array<string, mixed>>}
     */
    public function catalog(): array
    {
        $stored = $this->services(false);
        $storedByKey = [];

        foreach ($stored as $row) {
            $storedByKey[$row['courier_code'].':'.$row['service_code']] = $row;
        }

        if ($this->isFake()) {
            return [
                'mode' => 'fake',
                'key_terisi' => false,
                'sumber' => 'settings',
                'galat' => null,
                'daftar' => $stored,
            ];
        }

        try {
            $response = Http::withToken((string) config('biteship.key'))
                ->acceptJson()
                ->timeout((int) config('biteship.timeout', 8))
                ->get(rtrim((string) config('biteship.base_url'), '/').'/v1/couriers');
        } catch (Throwable $exception) {
            Log::warning('Biteship couriers gagal dihubungi', ['error' => $exception->getMessage()]);

            return $this->catalogFallback($stored);
        }

        $rows = $response->successful() ? $response->json('couriers') : null;

        if (! is_array($rows)) {
            $this->logGagalBiteship('Biteship couriers menjawab tidak sukses', $response);

            return $this->catalogFallback($stored);
        }

        $catalog = [];

        foreach ($rows as $row) {
            if (! is_array($row)) {
                continue;
            }

            $courier = strtolower(trim((string) ($row['courier_code'] ?? $row['code'] ?? '')));
            $service = trim((string) ($row['courier_service_code'] ?? $row['service_code'] ?? ''));

            if ($courier === '' || $service === '') {
                continue;
            }

            $key = $courier.':'.$service;
            $saved = $storedByKey[$key] ?? null;

            $catalog[$key] = $this->normalize([
                'courier_code' => $courier,
                'courier_name' => $row['courier_name'] ?? $row['name'] ?? $saved['courier_name'] ?? null,
                'service_code' => $service,
                'service_name' => $row['courier_service_name'] ?? $row['service_name'] ?? $saved['service_name'] ?? null,
                'label' => $saved['label'] ?? null,
                'is_regular' => $saved['is_regular'] ?? false,
                'is_active' => $saved['is_active'] ?? false,
            ]);
        }

        foreach ($stored as $row) {
            $catalog[$row['courier_code'].':'.$row['service_code']] ??= $row;
        }

        $daftar = array_values($catalog);
        usort($daftar, fn (array $a, array $b): int => [$a['courier_name'], $a['service_name']] <=> [$b['courier_name'], $b['service_name']]);

        return [
            'mode' => 'api',
            'key_terisi' => true,
            'sumber' => 'biteship',
            'galat' => null,
            'daftar' => $daftar,
        ];
    }

    /**
     * @param  list<array<string, mixed>>  $stored
     * @return array{mode: string, key_terisi: bool, sumber: string, galat: ?string, daftar: list<array<string, mixed>>}
     */
    private function catalogFallback(array $stored): array
    {
        return [
            'mode' => 'api',
            'key_terisi' => true,
            'sumber' => 'settings',
            'galat' => 'Daftar kurir Biteship gagal diambil. Isi kode layanan manual dengan format courier_code:service_code.',
            'daftar' => $stored,
        ];
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array{courier_code: string, courier_name: string, service_code: string, service_name: string, label: string, is_regular: bool, is_active: bool}
     */
    private function normalize(array $row): array
    {
        $courier = strtolower(trim((string) ($row['courier_code'] ?? '')));
        $service = trim((string) ($row['service_code'] ?? ''));
        $courierName = trim((string) ($row['courier_name'] ?? '')) ?: strtoupper($courier);
        $serviceName = trim((string) ($row['service_name'] ?? '')) ?: strtoupper($service);
        $label = trim((string) ($row['label'] ?? '')) ?: trim($courierName.' '.$serviceName);

        return [
            'courier_code' => $courier,
            'courier_name' => $courierName,
            'service_code' => $service,
            'service_name' => $serviceName,
            'label' => $label,
            'is_regular' => (bool) ($row['is_regular'] ?? false),
            'is_active' => (bool) ($row['is_active'] ?? true),
        ];
    }

    /**
     * @param  array{courier_code: string, courier_name: string, service_code: string, service_name: string, label: string, is_regular: bool, is_active: bool}  $service
     * @return array<string, mixed>
     */
    private function option(array $service, int $cost, ?string $etd, int $subtotal): array
    {
        $gratis = $this->freeShipping();

        return [
            'courier_code' => $service['courier_code'],
            'courier_name' => $service['courier_name'],
            'service_code' => $service['service_code'],
            'service_name' => $service['service_name'],
            'label' => $service['label'],
            'etd' => $etd,
            'cost' => $cost,
            'is_regular' => $service['is_regular'],
            'gratis' => $service['is_regular'] && $gratis['aktif'] && $subtotal >= $gratis['min'],
        ];
    }

    /**
     * Catat jawaban gagal Biteship: status, `success`, `error`, `code` + konteks pemanggil.
     * Tidak pernah mencatat header atau kunci API.
     *
     * @param  array<string, mixed>  $konteks
     */
    private function logGagalBiteship(string $pesan, Response $response, array $konteks = []): void
    {
        Log::warning($pesan, $konteks + [
            'status' => $response->status(),
            'success' => $response->json('success'),
            'error' => $response->json('error'),
            'code' => $response->json('code'),
        ]);
    }

    /**
     * Pesan siap tampil untuk kode error rates Biteship; kode lain tetap pesan umum.
     * `$error` menangkap galat 400 tanpa `code` (mis. saldo akun Biteship habis).
     */
    private function pesanGalat(int $code, ?string $error = null): string
    {
        return match ($code) {
            40001001 => self::GALAT_KODE_POS,
            40001002 => self::GALAT_PARAMETER,
            40001010 => self::GALAT_TANPA_KURIR,
            default => stripos((string) $error, 'balance') !== false ? self::GALAT_SALDO : self::GALAT_API,
        };
    }

    /**
     * @param  array<string, mixed>  $row
     */
    private function etd(array $row): ?string
    {
        $duration = trim((string) ($row['duration'] ?? ''));

        if ($duration !== '') {
            return str_replace(['days', 'day'], 'hari', $duration);
        }

        $range = trim((string) ($row['shipment_duration_range'] ?? ''));
        $unit = strtolower(trim((string) ($row['shipment_duration_unit'] ?? '')));

        if ($range === '') {
            return null;
        }

        $unit = $unit === '' ? '' : ' '.str_replace(['days', 'day'], 'hari', $unit);

        return trim($range.$unit);
    }
}

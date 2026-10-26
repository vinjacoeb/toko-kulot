<?php

namespace App\Services;

use App\Exceptions\CheckoutException;
use App\Models\Order;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
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

    /** Biteship 400 tanpa `code`: `No sufficient balance to call rates API`. */
    public const GALAT_SALDO = 'Ongkir tidak bisa dihitung karena saldo Biteship penjual habis. Hubungi penjual.';

    /** Berat pengganti per unit bila produk belum punya berat (PRD-v1.4 §2.2). */
    public const BERAT_FALLBACK_GRAM = 300;

    /** Bukti tarif yang dipakai saat order dibuat (PRD-v1.4 §2.2). */
    public const LOG_TARIF = 'Biteship tarif dipakai';

    /** Guard resi otomatis (PRD-v1.2 §8, kontrak props §12.25). */
    public const RESI_TANPA_KURIR = 'Pesanan ini belum menyimpan kurir/layanan pengiriman. Buat resi manual atau pilih kurir saat checkout.';

    public const RESI_GAGAL_HUBUNGI = 'Resi otomatis gagal: Biteship tidak bisa dihubungi. Coba lagi.';

    /** Cache katalog kurir Biteship (PRD-v1.2 §6): satu kali ambil per 24 jam. */
    public const KATALOG_CACHE_KEY = 'biteship.couriers';

    public const KATALOG_CACHE_HOURS = 24;

    public function __construct(private readonly SettingService $settings) {}

    /**
     * Satu dasar hitung berat untuk tarif & create order (PRD-v1.4 §2.2):
     * berat produk apa adanya, fallback 300 g/unit bila 0. Tanpa minimum 500 g.
     */
    public static function beratUnit(int $weightGram): int
    {
        return $weightGram > 0 ? $weightGram : self::BERAT_FALLBACK_GRAM;
    }

    /**
     * Bagi total berat pesanan jadi gram/unit tiap baris (PRD-v1.4 §2.2):
     * Σ(berat × qty) = total persis, karena Biteship mengalikan sendiri
     * dengan `quantity`. Sumber total = `orders.shipping_weight_gram`.
     *
     * @param  list<int>  $qty
     * @return list<int>
     */
    public static function bagiBerat(int $total, array $qty): array
    {
        $baris = count($qty);
        $jumlah = (int) array_sum($qty);

        if ($baris === 0) {
            return [];
        }

        if ($total <= 0 || $jumlah <= 0) {
            return array_fill(0, $baris, self::BERAT_FALLBACK_GRAM);
        }

        $unit = max(1, intdiv($total, $jumlah));
        $sisa = $total - $unit * $jumlah;
        $tambahan = array_fill(0, $baris, 0);

        // Sisa gram dibagikan utuh ke baris yang qty-nya muat; lebihan yang tak
        // muat ditutup kombinasi ±unit kecil (mis. qty 5 & 7).
        // ponytail: jendela ±3 unit cukup untuk sisa < Σqty; kasus mustahil
        // (total < Σqty) memakai berat minimum 1 g/unit dan dicatat warning
        // di orderPayload().
        while ($sisa > 0) {
            $pilih = null;

            foreach ($qty as $i => $q) {
                if ($q <= $sisa && ($pilih === null || $q > $qty[$pilih])) {
                    $pilih = $i;
                }
            }

            if ($pilih === null) {
                break;
            }

            $tambahan[$pilih]++;
            $sisa -= $qty[$pilih];
        }

        if ($sisa !== 0) {
            foreach (self::deltaBerat($qty, $sisa) ?? [] as $i => $geser) {
                $tambahan[$i] += $geser;
            }
        }

        $berat = [];

        foreach ($qty as $i => $q) {
            $berat[] = max(1, $unit + $tambahan[$i]);
        }

        return $berat;
    }

    /**
     * Kombinasi geseran unit (maks ±3 per baris) yang menutup `$sisa` gram.
     *
     * @param  list<int>  $qty
     * @return array<int, int>|null  indeks baris => geseran unit
     */
    private static function deltaBerat(array $qty, int $sisa): ?array
    {
        $dp = [0 => []];

        foreach ($qty as $i => $q) {
            $lanjut = $dp;

            foreach ([1, -1, 2, -2, 3, -3] as $geser) {
                foreach ($dp as $jumlah => $jalan) {
                    if (! array_key_exists($jumlah + $geser * $q, $lanjut)) {
                        $lanjut[$jumlah + $geser * $q] = $jalan + [$i => $geser];
                    }
                }
            }

            $dp = $lanjut;
        }

        return $dp[$sisa] ?? null;
    }

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
     * Bagian pengaturan asal yang belum lengkap (PRD-v1.4 §2.2), berurutan.
     *
     * @return list<string>
     */
    public function originMasalah(): array
    {
        $asal = [
            'Nama pengirim' => trim((string) $this->settings->get('shipping_origin_name')),
            'Telepon pengirim' => trim((string) $this->settings->get('shipping_origin_phone')),
            'Alamat asal' => trim((string) $this->settings->get('shipping_origin_address')),
            'Kode pos asal' => trim((string) $this->settings->get('shipping_origin_postal_code')),
        ];

        $kurang = array_keys(array_filter($asal, fn (string $nilai): bool => $nilai === ''));

        if (! in_array('Kode pos asal', $kurang, true) && ! preg_match('/^\d{5}$/', $asal['Kode pos asal'])) {
            $kurang[] = 'Kode pos asal (5 angka)';
        }

        if (trim((string) $this->settings->get('contact_email')) === '') {
            $kurang[] = 'Email kontak';
        }

        return $kurang;
    }

    /**
     * @param  list<string>  $kurang
     */
    public function pesanAsalBelumLengkap(array $kurang): string
    {
        return 'Pengaturan asal pengiriman belum lengkap: '.implode(', ', $kurang)
            .'. Lengkapi di halaman Ekspedisi/Pengaturan, lalu coba lagi.';
    }

    /**
     * Layanan kurir dari `settings.shipping_couriers` (bentuk PRD v1.1 §5).
     *
     * Menerima baris lama string `"courier:service"` maupun baris array; baris kosong
     * dibuang dan duplikat `courier:service` (tanpa beda huruf) dipakai yang pertama
     * (brief-v1.5 B1).
     *
     * @return list<array{courier_code: string, courier_name: string, service_code: string, service_name: string, label: string, is_regular: bool, is_active: bool}>
     */
    public function services(bool $activeOnly = true): array
    {
        $stored = $this->settings->get('shipping_couriers');
        $rows = is_array($stored) ? $stored : [];
        $services = [];
        $sudah = [];

        foreach ($rows as $row) {
            $service = $this->serviceRow($row);

            if ($service === null) {
                continue;
            }

            $key = strtolower($service['courier_code'].':'.$service['service_code']);

            if (isset($sudah[$key])) {
                continue;
            }

            $sudah[$key] = true;
            $services[] = $service;
        }

        if ($services === []) {
            $services = array_map(fn (array $row): array => $this->normalize($row), self::DEFAULT_COURIERS);
        }

        return $activeOnly
            ? array_values(array_filter($services, fn (array $row): bool => $row['is_active']))
            : $services;
    }

    /**
     * Satu baris `shipping_couriers` → layanan ternormalisasi; `null` bila tidak sah.
     * Bentuk lama yang tersimpan di settings: string `"courier:service"`.
     *
     * @return array{courier_code: string, courier_name: string, service_code: string, service_name: string, label: string, is_regular: bool, is_active: bool}|null
     */
    private function serviceRow(mixed $row): ?array
    {
        if (is_string($row)) {
            [$courier, $service] = array_pad(explode(':', $row, 2), 2, '');
            $row = ['courier_code' => $courier, 'service_code' => $service];
        }

        if (! is_array($row)) {
            return null;
        }

        $courier = strtolower(trim((string) ($row['courier_code'] ?? '')));
        $service = trim((string) ($row['service_code'] ?? ''));

        if ($courier === '' || $service === '') {
            return null;
        }

        return $this->normalize([
            'courier_code' => $courier,
            'service_code' => $service,
            'label' => $row['label'] ?? null,
            'is_regular' => (bool) ($row['is_regular'] ?? false),
            'is_active' => (bool) ($row['is_active'] ?? true),
        ]);
    }

    /**
     * Urut opsi ongkir menurut `courier_name`, lalu `service_name` (kontrak §7.12).
     *
     * @param  list<array{courier_code: string, courier_name: string, service_code: string, service_name: string, label: string, is_regular: bool, is_active: bool}>  $services
     * @return list<array{courier_code: string, courier_name: string, service_code: string, service_name: string, label: string, is_regular: bool, is_active: bool}>
     */
    private function urutOpsi(array $services): array
    {
        usort($services, fn (array $a, array $b): int => [$a['courier_name'], $a['service_name']] <=> [$b['courier_name'], $b['service_name']]);

        return $services;
    }

    /**
     * Daftar opsi ongkir untuk checkout (kontrak §7.12).
     *
     * @param  list<array{name: string, value: int, quantity: int, weight: int}>  $items
     * @return array{mode: string, opsi: list<array<string, mixed>>, galat: ?string}
     */
    public function rates(string $postalCode, array $items, int $subtotal): array
    {
        $services = $this->urutOpsi($this->services(true));

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

        $kurang = $this->originMasalah();

        if ($kurang !== []) {
            return ['mode' => 'api', 'opsi' => [], 'galat' => $this->pesanAsalBelumLengkap($kurang)];
        }

        $body = [
            'origin_postal_code' => (int) $origin,
            'destination_postal_code' => (int) $postalCode,
            'couriers' => implode(',', array_values(array_unique(array_column($services, 'courier_code')))),
            'items' => $items,
        ];

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
        $tanpaTarif = [];

        foreach ($services as $service) {
            $quote = $byService[strtolower($service['courier_code'].':'.$service['service_code'])] ?? null;

            if ($quote === null) {
                $tanpaTarif[] = $service['courier_code'].':'.$service['service_code'];

                continue;
            }

            $options[] = $this->option($service, $quote['cost'], $quote['etd'], $subtotal);
        }

        if ($tanpaTarif !== []) {
            Log::warning('Biteship layanan aktif tanpa tarif', ['layanan' => $tanpaTarif]);
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
    public function quote(string $courier, string $service, string $postalCode, array $items, int $subtotal): ?array
    {
        $result = $this->rates($postalCode, $items, $subtotal);

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
     * Buat resi Biteship untuk pesanan (PRD-v1.2 §8, kontrak props §12.25).
     *
     * Idempoten: `orders.biteship_order_id` terisi = tidak ada panggilan API lagi.
     * Semua guard berjalan sebelum API; gagal = tidak ada kolom yang berubah.
     * Mode uji (tanpa `BITESHIP_API_KEY`) tidak menghubungi jaringan.
     *
     * @return array{ok: bool, pesan: string, resi: ?string, ulang: bool}
     */
    public function createOrder(Order $order): array
    {
        return DB::transaction(function () use ($order): array {
            $fresh = Order::query()->lockForUpdate()->with('items.product')->find($order->id);

            if ($fresh === null) {
                return $this->hasilResi(false, 'Pesanan tidak ditemukan.', null);
            }

            if (trim((string) $fresh->biteship_order_id) !== '') {
                return $this->hasilResi(
                    true,
                    'Resi pesanan ini sudah dibuat: '.($fresh->tracking_number ?: '-').'.',
                    $fresh->tracking_number,
                    true,
                );
            }

            if (! in_array($fresh->status, [Order::STATUS_PAID, Order::STATUS_SHIPPED], true)) {
                return $this->hasilResi(false, sprintf(
                    'Resi otomatis hanya untuk pesanan berstatus Dibayar atau Dikirim. Pesanan ini masih %s.',
                    Order::statusLabel($fresh->status),
                ), null);
            }

            if (trim((string) $fresh->shipping_courier) === '' || trim((string) $fresh->shipping_service) === '') {
                return $this->hasilResi(false, self::RESI_TANPA_KURIR, null);
            }

            $origin = [
                'Nama pengirim' => trim((string) $this->settings->get('shipping_origin_name')),
                'Telepon pengirim' => trim((string) $this->settings->get('shipping_origin_phone')),
                'Alamat asal' => trim((string) $this->settings->get('shipping_origin_address')),
                'Kode pos asal' => trim((string) $this->settings->get('shipping_origin_postal_code')),
            ];
            $email = trim((string) $this->settings->get('contact_email'));
            $kurang = $this->originMasalah();

            if ($kurang !== []) {
                return $this->hasilResi(false, $this->pesanAsalBelumLengkap($kurang), null);
            }

            if ($this->isFake()) {
                $json = [
                    'success' => true,
                    'id' => 'FAKE-'.$fresh->code,
                    'status' => 'confirmed',
                    'courier' => [
                        'waybill_id' => 'FAKE-'.$fresh->code,
                        'tracking_id' => 'FAKE-'.$fresh->code,
                    ],
                    'mode_uji' => true,
                ];
            } else {
                try {
                    $response = Http::withToken((string) config('biteship.key'))
                        ->acceptJson()
                        ->timeout((int) config('biteship.timeout_order', 15))
                        ->post(rtrim((string) config('biteship.base_url'), '/').'/v1/orders', $this->orderPayload($fresh, $origin, $email));
                } catch (Throwable $exception) {
                    Log::warning('Biteship create order gagal dihubungi', [
                        'order' => $fresh->code,
                        'error' => $exception->getMessage(),
                    ]);

                    return $this->hasilResi(false, self::RESI_GAGAL_HUBUNGI, null);
                }

                $json = $response->successful() ? $response->json() : null;

                if (! is_array($json) || ($json['success'] ?? true) === false) {
                    $this->logGagalBiteship('Biteship create order menjawab tidak sukses', $response, [
                        'order' => $fresh->code,
                    ]);

                    $pesan = $response->json('error');
                    $pesan = is_string($pesan) && trim($pesan) !== '' ? trim($pesan) : 'Biteship menolak permintaan.';

                    return $this->hasilResi(false, 'Resi otomatis gagal: '.$pesan, null);
                }
            }

            $biteshipId = trim((string) ($json['id'] ?? ''));

            if ($biteshipId === '') {
                return $this->hasilResi(false, 'Resi otomatis gagal: Biteship tidak mengirim ID pesanan.', null);
            }

            $resi = trim((string) ($json['courier']['waybill_id'] ?? $json['courier']['tracking_id'] ?? ''));
            $resi = $resi !== '' ? $resi : null;

            $fresh->update([
                'biteship_order_id' => mb_substr($biteshipId, 0, 60),
                'tracking_number' => $resi,
                'shipping_status' => isset($json['status']) ? mb_substr((string) $json['status'], 0, 30) : null,
                'shipping_payload' => $json,
            ]);

            Log::info('Resi otomatis Biteship dibuat.', [
                'order' => $fresh->code,
                'biteship_order_id' => $biteshipId,
                'mode' => $this->mode(),
            ]);

            return $this->hasilResi(
                true,
                $resi === null
                    ? 'Resi dibuat, tetapi nomor resi belum tersedia dari Biteship. Periksa dashboard Biteship.'
                    : 'Resi dibuat: '.$resi.'.',
                $resi,
            );
        });
    }

    /**
     * @param  array<string, string>  $origin
     * @return array<string, mixed>
     */
    private function orderPayload(Order $order, array $origin, string $email): array
    {
        $baris = $order->items->values();
        $qty = $baris->map(fn ($item): int => max(1, (int) $item->qty))->all();

        // Berat dari snapshot `orders.shipping_weight_gram` (PRD-v1.4 §2.2), bukan
        // berat produk hidup: produk bisa diubah/dihapus sebelum resi dibuat.
        $total = (int) ($order->shipping_weight_gram ?? 0);
        $berat = $total > 0
            ? self::bagiBerat($total, $qty)
            : $baris->map(fn ($item): int => self::beratUnit((int) ($item->product?->weight_gram ?? 0)))->all();

        $items = [];
        $kirim = 0;

        foreach ($baris as $i => $item) {
            $kirim += $berat[$i] * $qty[$i];

            $items[] = [
                'name' => trim($item->product_name.' '.((string) $item->variant_label)),
                'value' => (int) $item->unit_price,
                'quantity' => $qty[$i],
                'weight' => $berat[$i],
            ];
        }

        if ($total > 0 && $kirim !== $total) {
            Log::warning('Berat create order Biteship tidak sama dengan shipping_weight_gram.', [
                'order' => $order->code,
                'shipping_weight_gram' => $total,
                'berat_terkirim' => $kirim,
            ]);
        }

        return [
            'shipper_contact_name' => $origin['Nama pengirim'],
            'shipper_contact_phone' => $origin['Telepon pengirim'],
            'shipper_contact_email' => $email,
            'shipper_organization' => (string) ($this->settings->get('store_name') ?? ''),
            'origin_contact_name' => $origin['Nama pengirim'],
            'origin_contact_phone' => $origin['Telepon pengirim'],
            'origin_address' => $origin['Alamat asal'],
            'origin_postal_code' => (int) $origin['Kode pos asal'],
            'destination_contact_name' => (string) $order->customer_name,
            'destination_contact_phone' => (string) $order->customer_phone,
            'destination_contact_email' => trim((string) $order->customer_email) ?: $email,
            'destination_address' => (string) $order->shipping_address,
            'destination_postal_code' => (int) $order->postal_code,
            'courier_company' => strtolower(trim((string) $order->shipping_courier)),
            'courier_type' => trim((string) $order->shipping_service),
            'delivery_type' => 'now',
            'order_note' => (string) ($order->notes ?? ''),
            'items' => $items,
        ];
    }

    /**
     * @return array{ok: bool, pesan: string, resi: ?string, ulang: bool}
     */
    private function hasilResi(bool $ok, string $pesan, ?string $resi, bool $ulang = false): array
    {
        return ['ok' => $ok, 'pesan' => $pesan, 'resi' => $resi, 'ulang' => $ulang];
    }

    /**
     * Label status pengiriman Biteship → teks Indonesia (badge §12.16/§12.17/§13).
     * Status tak dikenal tetap tampil apa adanya, bukan disembunyikan.
     */
    private const SHIPPING_LABELS = [
        'confirmed' => 'Dikonfirmasi',
        'allocated' => 'Dialokasikan',
        'picking_up' => 'Dijemput kurir',
        'picked' => 'Diterima kurir',
        'dropping_off' => 'Dalam pengiriman',
        'delivered' => 'Terkirim',
        'rejected' => 'Ditolak',
        'cancelled' => 'Dibatalkan',
        'returned' => 'Dikembalikan',
        'on_hold' => 'Ditahan',
        'disposed' => 'Dimusnahkan',
    ];

    public static function shippingLabel(?string $status): ?string
    {
        $status = strtolower(trim((string) $status));

        if ($status === '') {
            return null;
        }

        return self::SHIPPING_LABELS[$status] ?? ucfirst(str_replace('_', ' ', $status));
    }

    /**
     * Peta `courier:service` → nama layanan tersimpan, dibaca sekali per request
     * supaya daftar admin tidak N+1.
     *
     * @return array<string, array{courier_name: string, service_name: string}>
     */
    public function serviceLabels(): array
    {
        $labels = [];

        foreach ($this->services(false) as $row) {
            $labels[$row['courier_code'].':'.strtolower($row['service_code'])] = [
                'courier_name' => $row['courier_name'],
                'service_name' => $row['service_name'],
            ];
        }

        return $labels;
    }

    /**
     * Objek `shipping` bentuk dasar (pembeli §7.9/§13; admin memakai shippingInfoAdmin()).
     *
     * Key v1.3 (PRD-v1.3 §2.6) `updated_at`, `driver`, `perlu_tindakan`, `tindakan` ikut terkirim
     * ke pembeli (PRD hanya mengeluarkan `price_final`, `price_selisih`, `webhook_terakhir`), tetapi
     * pembeli tidak merender `perlu_tindakan`/`tindakan` (design-v1.3 baris 18–19).
     *
     * @param  array<string, array{courier_name: string, service_name: string}>  $labels  hasil serviceLabels()
     * @return array<string, mixed>
     */
    public function shippingInfo(Order $order, array $labels): array
    {
        $courier = strtolower(trim((string) $order->shipping_courier));
        $service = trim((string) $order->shipping_service);
        $known = $labels[$courier.':'.strtolower($service)] ?? null;

        return [
            'courier_code' => $courier === '' ? null : $courier,
            'courier_name' => $known['courier_name'] ?? ($courier === '' ? null : strtoupper($courier)),
            'service_name' => $known['service_name'] ?? ($service === '' ? null : strtoupper($service)),
            'etd' => $order->shipping_etd,
            'weight_gram' => $order->shipping_weight_gram === null ? null : (int) $order->shipping_weight_gram,
            'shipping_cost' => (int) $order->shipping_cost,
            'tracking_number' => $order->tracking_number,
            'status' => $order->shipping_status,
            'status_label' => self::shippingLabel($order->shipping_status),
            'biteship_order_id' => $order->biteship_order_id,
            'updated_at' => $order->shipping_updated_at?->toIso8601String(),
            'driver' => $this->shippingDriver($order),
            'perlu_tindakan' => $this->shippingPerluTindakan($order),
            'tindakan' => $this->shippingTindakan($order),
            'events' => $this->shippingEvents($order),
            'galat' => $this->resiGalat($order, $courier, $service),
        ];
    }

    /**
     * Riwayat event kurir untuk props pembeli (PRD-v1.4 §4.2, kartu `t_f51f8c36`):
     * `{status, label, at}` urut **terbaru → terlama**, maksimum 50; `[]` bila belum ada.
     *
     * @return array<int, array{status: string|null, label: string|null, at: string|null}>
     */
    public function shippingEvents(Order $order): array
    {
        $events = is_array($order->shipping_events) ? $order->shipping_events : [];
        $rows = [];

        foreach (array_reverse($events) as $event) {
            if (! is_array($event)) {
                continue;
            }

            $status = $event['status'] ?? null;
            $status = is_string($status) && $status !== '' ? $status : null;

            $rows[] = [
                'status' => $status,
                'label' => self::shippingLabel($status),
                'at' => is_string($event['at'] ?? null) ? $event['at'] : null,
            ];
        }

        return array_slice($rows, 0, 50);
    }

    /**
     * `timeline.completed_at` pembeli (PRD-v1.4 §4.2): `at` entri `delivered` terakhir di
     * `orders.shipping_events`, atau `shipping_updated_at` bila status `selesai` tanpa entri
     * `delivered`; `null` bila pesanan belum selesai.
     */
    public function shippingCompletedAt(Order $order): ?string
    {
        $events = is_array($order->shipping_events) ? $order->shipping_events : [];
        $delivered = null;

        foreach ($events as $event) {
            if (is_array($event) && ($event['status'] ?? null) === 'delivered' && is_string($event['at'] ?? null)) {
                $delivered = $event['at'];
            }
        }

        if ($delivered !== null) {
            return $delivered;
        }

        return $order->status === Order::STATUS_COMPLETED
            ? $order->shipping_updated_at?->toIso8601String()
            : null;
    }

    /**
     * Bentuk admin §12.17: bentuk dasar + tiga key khusus admin (PRD-v1.3 §2.6).
     *
     * @param  array<string, array{courier_name: string, service_name: string}>  $labels
     * @return array<string, mixed>
     */
    public function shippingInfoAdmin(Order $order, array $labels): array
    {
        $final = $this->shippingPriceFinal($order);

        return array_merge($this->shippingInfo($order, $labels), [
            'price_final' => $final,
            'price_selisih' => $final === null ? null : $final - (int) $order->shipping_cost,
            'webhook_terakhir' => $order->shipping_webhook_payload,
        ]);
    }

    /**
     * Ongkir aktual dari payload terakhir, hanya bila payload terakhir event `order.price`
     * (PRD-v1.3 §2.4: kolom menyimpan payload terakhir, bukan riwayat). `null` bila bukan.
     */
    public function shippingPriceFinal(Order $order): ?int
    {
        $payload = $order->shipping_webhook_payload;

        if (! is_array($payload) || ($payload['event'] ?? null) !== 'order.price') {
            return null;
        }

        $price = $payload['price'] ?? null;

        return is_numeric($price) ? (int) $price : null;
    }

    /**
     * Admin perlu bertindak (PRD-v1.3 §2.6): status kurir bermasalah pada pesanan yang belum
     * `batal`/`selesai`, atau selisih ongkir ≠ 0. Dipakai detail dan baris daftar admin.
     */
    public function shippingPerluTindakan(Order $order): bool
    {
        if ($this->shippingStatusBermasalah($order)) {
            return true;
        }

        $final = $this->shippingPriceFinal($order);

        return $final !== null && $final !== (int) $order->shipping_cost;
    }

    /**
     * Pesan siap tampil untuk `perlu_tindakan` (kontrak §12.17); `null` bila tidak ada.
     *
     * Sejak v1.4 tanpa ajakan "ubah status" (kontrol itu dihapus, PRD-v1.4 §3.1/§6):
     * paket retur/gagal diselesaikan di luar aplikasi.
     */
    public function shippingTindakan(Order $order): ?string
    {
        $bagian = [];

        if ($this->shippingStatusBermasalah($order)) {
            $bagian[] = [
                'cancelled' => 'Kurir membatalkan pengiriman.',
                'rejected' => 'Kurir menolak paket.',
                'returned' => 'Kurir melaporkan paket dikembalikan.',
                'disposed' => 'Kurir melaporkan paket dibuang.',
                'on_hold' => 'Kurir menahan paket sementara.',
            ][(string) $order->shipping_status];
        }

        $final = $this->shippingPriceFinal($order);

        if ($final !== null && $final !== (int) $order->shipping_cost) {
            $bagian[] = 'Ongkir aktual berbeda dari ongkir tagihan. Periksa selisih ongkir pesanan ini.';
        }

        return $bagian === [] ? null : implode(' ', $bagian);
    }

    /**
     * Status kurir bermasalah pada pesanan yang masih berjalan (PRD-v1.3 §2.3/§2.6).
     */
    private function shippingStatusBermasalah(Order $order): bool
    {
        return in_array((string) $order->shipping_status, BiteshipWebhookService::STATUS_BERMASALAH, true)
            && ! in_array($order->status, [Order::STATUS_CANCELLED, Order::STATUS_COMPLETED], true);
    }

    /**
     * Petugas kurir dari payload `order.status` (`courier_driver_name`, `courier_driver_phone`,
     * `courier_link`); tiap field boleh `null`, seluruhnya `null` bila payload kosong.
     *
     * @return array{name: ?string, phone: ?string, link: ?string}|null
     */
    public function shippingDriver(Order $order): ?array
    {
        $payload = $order->shipping_webhook_payload;

        if (! is_array($payload)) {
            return null;
        }

        $ambil = function (string $key) use ($payload): ?string {
            $nilai = trim((string) ($payload[$key] ?? ''));

            return $nilai === '' ? null : $nilai;
        };

        $driver = [
            'name' => $ambil('courier_driver_name'),
            'phone' => $ambil('courier_driver_phone'),
            'link' => $ambil('courier_link'),
        ];

        return array_filter($driver, fn (?string $nilai) => $nilai !== null) === [] ? null : $driver;
    }

    /**
     * Alasan tombol `Buat resi otomatis` tidak dapat dipakai sekarang — tampilan saja;
     * guard sebenarnya tetap di createOrder() saat POST.
     */
    private function resiGalat(Order $order, string $courier, string $service): ?string
    {
        if ($order->biteship_order_id !== null) {
            return null;
        }

        if (! in_array($order->status, [Order::STATUS_PAID, Order::STATUS_SHIPPED], true)) {
            return 'Resi otomatis hanya untuk pesanan berstatus Dibayar atau Dikirim. Pesanan ini masih '
                .Order::statusLabel($order->status).'.';
        }

        if ($courier === '' || $service === '') {
            return 'Pesanan ini belum menyimpan kurir/layanan pengiriman. Buat resi manual atau pilih kurir saat checkout.';
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

        $rows = $this->catalogRows();

        if ($rows === null) {
            return $this->catalogFallback($stored);
        }

        $catalog = [];

        foreach ($rows as $row) {
            $key = $row['courier_code'].':'.$row['service_code'];
            $saved = $storedByKey[$key] ?? null;

            $catalog[$key] = $this->normalize($row + [
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
     * Katalog mentah Biteship, di-cache 24 jam (PRD-v1.2 §6). `null` = API gagal
     * (kegagalan tidak di-cache, panel memakai daftar tersimpan).
     *
     * @return list<array{courier_code: string, courier_name: string, service_code: string, service_name: string, etd: ?string}>|null
     */
    private function catalogRows(): ?array
    {
        $cached = Cache::get(self::KATALOG_CACHE_KEY);

        if (is_array($cached) && $cached !== []) {
            return $cached;
        }

        try {
            $response = Http::withToken((string) config('biteship.key'))
                ->acceptJson()
                ->timeout((int) config('biteship.timeout', 8))
                ->get(rtrim((string) config('biteship.base_url'), '/').'/v1/couriers');
        } catch (Throwable $exception) {
            Log::warning('Biteship couriers gagal dihubungi', ['error' => $exception->getMessage()]);

            return null;
        }

        $rows = $response->successful() ? $response->json('couriers') : null;

        if (! is_array($rows)) {
            $this->logGagalBiteship('Biteship couriers menjawab tidak sukses', $response);

            return null;
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

            $catalog[$courier.':'.$service] = [
                'courier_code' => $courier,
                'courier_name' => trim((string) ($row['courier_name'] ?? $row['name'] ?? '')) ?: strtoupper($courier),
                'service_code' => $service,
                'service_name' => trim((string) ($row['courier_service_name'] ?? $row['service_name'] ?? '')) ?: strtoupper($service),
                'etd' => $this->etd($row),
            ];
        }

        if ($catalog === []) {
            return null;
        }

        $catalog = array_values($catalog);
        Cache::put(self::KATALOG_CACHE_KEY, $catalog, now()->addHours(self::KATALOG_CACHE_HOURS));

        return $catalog;
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
            'etd' => $row['etd'] ?? $this->etd($row),
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

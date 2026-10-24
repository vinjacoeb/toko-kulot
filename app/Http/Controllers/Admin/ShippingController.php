<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateShippingRequest;
use App\Services\BiteshipService;
use App\Services\SettingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Pengaturan ekspedisi (PRD v1.1 D2/D3, kontrak props §10.13).
 *
 * Panel ini tidak pernah menampilkan isi `BITESHIP_API_KEY`; hanya boolean
 * `key_terisi` dari service. Tarif final tetap dihitung checkout.
 */
class ShippingController extends Controller
{
    public function __construct(
        private readonly SettingService $settings,
        private readonly BiteshipService $biteship,
    ) {}

    public function index(): Response
    {
        return Inertia::render('Admin/Shipping/Index', [
            'pengaturan' => [
                'shipping_origin_name' => (string) ($this->settings->get('shipping_origin_name') ?? ''),
                'shipping_origin_phone' => (string) ($this->settings->get('shipping_origin_phone') ?? ''),
                'shipping_origin_address' => (string) ($this->settings->get('shipping_origin_address') ?? ''),
                'shipping_origin_postal_code' => (string) ($this->settings->get('shipping_origin_postal_code') ?? ''),
                'free_shipping_enabled' => (bool) $this->settings->get('free_shipping_enabled', true),
                'free_shipping_min' => (int) ($this->settings->get('free_shipping_min') ?? 300000),
                'shipping_cost_default' => (int) ($this->settings->get('shipping_cost_default') ?? 20000),
            ],
            'kurir' => $this->biteship->catalog(),
        ]);
    }

    public function update(UpdateShippingRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $couriers = [];

        foreach ($data['couriers'] as $row) {
            $key = strtolower(trim($row['courier_code'])).':'.trim($row['service_code']);

            $couriers[$key] = [
                'courier_code' => strtolower(trim($row['courier_code'])),
                'service_code' => trim($row['service_code']),
                'label' => trim((string) ($row['label'] ?? '')) ?: strtoupper(trim($row['service_code'])),
                'is_regular' => (bool) $row['is_regular'],
                'is_active' => (bool) $row['is_active'],
            ];
        }

        $couriers = array_values($couriers);

        if (array_filter($couriers, fn (array $row): bool => $row['is_active']) === []) {
            throw ValidationException::withMessages([
                'couriers' => 'Pilih minimal satu layanan kurir aktif.',
            ]);
        }

        $this->settings->putMany([
            'shipping_origin_name' => trim($data['shipping_origin_name']),
            'shipping_origin_phone' => trim($data['shipping_origin_phone']),
            'shipping_origin_address' => trim($data['shipping_origin_address']),
            'shipping_origin_postal_code' => trim($data['shipping_origin_postal_code']),
            'free_shipping_enabled' => $request->boolean('free_shipping_enabled'),
            'free_shipping_min' => (int) $data['free_shipping_min'],
            'shipping_cost_default' => (int) $data['shipping_cost_default'],
            'shipping_couriers' => $couriers,
        ]);

        return back()->with('success', 'Pengaturan ekspedisi disimpan.');
    }
}

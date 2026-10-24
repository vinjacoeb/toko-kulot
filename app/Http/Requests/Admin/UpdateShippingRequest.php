<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Formulir pengaturan ekspedisi (kontrak props §10.13).
 *
 * `couriers` adalah daftar layanan yang ditampilkan di checkout; minimal satu
 * harus aktif agar pembeli punya pilihan pengiriman.
 */
class UpdateShippingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'shipping_origin_name' => ['required', 'string', 'max:100'],
            'shipping_origin_phone' => ['required', 'string', 'max:30'],
            'shipping_origin_address' => ['required', 'string', 'max:500'],
            'shipping_origin_postal_code' => ['required', 'string', 'digits:5'],
            'free_shipping_enabled' => ['required', 'boolean'],
            'free_shipping_min' => ['required', 'integer', 'min:0', 'max:100000000'],
            'shipping_cost_default' => ['required', 'integer', 'min:0', 'max:10000000'],
            'couriers' => ['required', 'array', 'min:1'],
            'couriers.*.courier_code' => ['required', 'string', 'max:40', 'regex:/^[a-z0-9_-]+$/i'],
            'couriers.*.service_code' => ['required', 'string', 'max:60'],
            'couriers.*.label' => ['nullable', 'string', 'max:80'],
            'couriers.*.is_regular' => ['required', 'boolean'],
            'couriers.*.is_active' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'shipping_origin_name.required' => 'Nama pengirim wajib diisi.',
            'shipping_origin_name.max' => 'Nama pengirim maksimal 100 karakter.',
            'shipping_origin_phone.required' => 'Nomor telepon pengirim wajib diisi.',
            'shipping_origin_phone.max' => 'Nomor telepon pengirim maksimal 30 karakter.',
            'shipping_origin_address.required' => 'Alamat asal wajib diisi.',
            'shipping_origin_address.max' => 'Alamat asal maksimal 500 karakter.',
            'shipping_origin_postal_code.required' => 'Kode pos asal wajib diisi.',
            'shipping_origin_postal_code.digits' => 'Kode pos asal harus 5 angka.',
            'free_shipping_enabled.required' => 'Nilai gratis ongkir tidak valid.',
            'free_shipping_enabled.boolean' => 'Nilai gratis ongkir tidak valid.',
            'free_shipping_min.required' => 'Minimal belanja gratis ongkir tidak valid.',
            'free_shipping_min.integer' => 'Minimal belanja gratis ongkir tidak valid.',
            'free_shipping_min.min' => 'Minimal belanja gratis ongkir tidak valid.',
            'shipping_cost_default.required' => 'Tarif uji tidak valid.',
            'shipping_cost_default.integer' => 'Tarif uji tidak valid.',
            'shipping_cost_default.min' => 'Tarif uji tidak valid.',
            'couriers.required' => 'Pilih minimal satu layanan kurir.',
            'couriers.min' => 'Pilih minimal satu layanan kurir.',
            'couriers.*.courier_code.required' => 'Kode kurir tidak valid.',
            'couriers.*.courier_code.regex' => 'Kode kurir tidak valid.',
            'couriers.*.service_code.required' => 'Kode layanan tidak valid.',
            'couriers.*.label.max' => 'Label layanan maksimal 80 karakter.',
            'couriers.*.is_regular.required' => 'Nilai layanan reguler tidak valid.',
            'couriers.*.is_regular.boolean' => 'Nilai layanan reguler tidak valid.',
            'couriers.*.is_active.required' => 'Nilai layanan aktif tidak valid.',
            'couriers.*.is_active.boolean' => 'Nilai layanan aktif tidak valid.',
        ];
    }
}

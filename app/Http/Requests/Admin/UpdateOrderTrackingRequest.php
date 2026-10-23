<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Simpan nomor resi manual pada detail pesanan (PRD A15, kontrak props §12.18a).
 *
 * Kosong atau `null` berarti menghapus nomor resi. Teks di-trim di muka;
 * judul validasi hanya menyentuh satu kolom `orders.tracking_number`.
 */
class UpdateOrderTrackingRequest extends FormRequest
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
            'tracking_number' => ['nullable', 'string', 'max:60'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tracking_number.string' => 'Nomor resi harus berupa teks.',
            'tracking_number.max' => 'Nomor resi maksimal 60 karakter.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $resi = $this->input('tracking_number');

        if (is_string($resi)) {
            $resi = trim($resi);

            $this->merge(['tracking_number' => $resi === '' ? null : $resi]);
        }
    }
}

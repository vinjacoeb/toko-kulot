<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Formulir checkout (PRD §5.1 langkah 4, §8). Semua field wajib divalidasi
 * di server; `customer_address` adalah alamat pengiriman.
 */
class CheckoutRequest extends FormRequest
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
            'customer_name' => ['required', 'string', 'min:3', 'max:100'],
            'customer_phone' => ['required', 'string', 'regex:/^(\+62|62|0)8[0-9]{7,12}$/'],
            'customer_email' => ['required', 'email', 'max:150'],
            'customer_address' => ['required', 'string', 'min:10', 'max:500'],
            'customer_city' => ['required', 'string', 'min:3', 'max:100'],
            'customer_postal_code' => ['required', 'string', 'digits:5'],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'customer_name.required' => 'Nama penerima wajib diisi.',
            'customer_name.min' => 'Nama penerima minimal 3 karakter.',
            'customer_name.max' => 'Nama penerima maksimal 100 karakter.',
            'customer_phone.required' => 'Nomor WhatsApp wajib diisi.',
            'customer_phone.regex' => 'Nomor WhatsApp tidak valid.',
            'customer_email.required' => 'Email wajib diisi.',
            'customer_email.email' => 'Email tidak valid.',
            'customer_email.max' => 'Email maksimal 150 karakter.',
            'customer_address.required' => 'Alamat lengkap wajib diisi.',
            'customer_address.min' => 'Alamat terlalu singkat. Tulis jalan, nomor, RT/RW.',
            'customer_address.max' => 'Alamat maksimal 500 karakter.',
            'customer_city.required' => 'Kota/kecamatan wajib diisi.',
            'customer_city.min' => 'Nama kota/kecamatan terlalu singkat.',
            'customer_postal_code.required' => 'Kode pos wajib diisi.',
            'customer_postal_code.digits' => 'Kode pos harus 5 angka.',
            'note.max' => 'Catatan maksimal 500 karakter.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'customer_name' => 'nama penerima',
            'customer_phone' => 'nomor WhatsApp',
            'customer_email' => 'email',
            'customer_address' => 'alamat pengiriman',
            'customer_city' => 'kota/kabupaten',
            'customer_postal_code' => 'kode pos',
            'note' => 'catatan',
        ];
    }
}

<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validasi pendaftaran pembeli (PRD §5.1, PRD-v1.2 §3, kontrak docs/kontrak-props.md §6.2).
 *
 * Alamat/kota/kode pos wajib sejak v1.2: dipakai mem-prefill checkout dan
 * menghitung ongkir otomatis. Pesan galat mengikuti `docs/design-v1.2.md` §6.1.
 */
class RegisterRequest extends FormRequest
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
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'min:8', 'max:30', 'regex:/^[0-9+\-\s()]+$/'],
            'address' => ['required', 'string', 'min:10', 'max:500'],
            'city' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'digits:5'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'terms' => ['accepted'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $bersih = [];

        foreach (['name', 'email', 'phone', 'address', 'city', 'postal_code'] as $field) {
            $nilai = $this->input($field);
            $bersih[$field] = is_string($nilai) ? trim($nilai) : $nilai;
        }

        if (is_string($bersih['email'])) {
            $bersih['email'] = mb_strtolower($bersih['email']);
        }

        $this->merge($bersih);
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama wajib diisi.',
            'name.min' => 'Nama minimal 2 karakter.',
            'name.max' => 'Nama maksimal 100 karakter.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah terdaftar.',
            'phone.required' => 'Nomor WhatsApp wajib diisi.',
            'phone.min' => 'Format nomor WhatsApp tidak valid.',
            'phone.max' => 'Format nomor WhatsApp tidak valid.',
            'phone.regex' => 'Format nomor WhatsApp tidak valid.',
            'address.required' => 'Alamat lengkap wajib diisi.',
            'address.min' => 'Alamat terlalu singkat. Tulis jalan, nomor, RT/RW.',
            'address.max' => 'Alamat maksimal 500 karakter.',
            'city.required' => 'Kota wajib diisi.',
            'city.max' => 'Kota maksimal 100 karakter.',
            'postal_code.required' => 'Kode pos wajib diisi.',
            'postal_code.string' => 'Kode pos harus 5 angka.',
            'postal_code.digits' => 'Kode pos harus 5 angka.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.min' => 'Kata sandi minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
            'terms.accepted' => 'Anda harus menyetujui syarat dan ketentuan.',
        ];
    }
}

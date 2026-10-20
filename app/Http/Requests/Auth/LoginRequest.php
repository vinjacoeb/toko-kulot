<?php

namespace App\Http\Requests\Auth;

use App\Models\Admin;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

/**
 * Validasi dan eksekusi login pembeli pada guard `web` (PRD §3, §5.1).
 *
 * Akun pada tabel `admins` ditolak di sini: panel admin punya guard sendiri.
 */
class LoginRequest extends FormRequest
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
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string'],
            'remember' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'password.required' => 'Kata sandi wajib diisi.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('email'))) {
            $this->merge(['email' => mb_strtolower(trim($this->input('email')))]);
        }
    }

    /**
     * Coba masuk sebagai pembeli. Pesan galat selalu umum (tidak membocorkan
     * apakah email terdaftar).
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $email = (string) $this->input('email');

        // Pemisahan tier: email admin tidak boleh masuk lewat /login.
        if (Admin::query()->where('email', $email)->exists()) {
            throw ValidationException::withMessages([
                'email' => 'Email atau kata sandi salah.',
            ]);
        }

        $credentials = [
            'email' => $email,
            'password' => (string) $this->input('password'),
        ];

        if (! Auth::guard('web')->attempt($credentials, $this->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => 'Email atau kata sandi salah.',
            ]);
        }
    }
}

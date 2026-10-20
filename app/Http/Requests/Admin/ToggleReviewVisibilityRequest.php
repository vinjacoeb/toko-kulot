<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Ubah visibilitas ulasan (kontrak §10.6). Body kosong = nilai dibalik.
 */
class ToggleReviewVisibilityRequest extends FormRequest
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
            'is_visible' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'is_visible.boolean' => 'Nilai tampil/sembunyi tidak valid.',
        ];
    }
}

<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Tambah carousel beranda (kontrak §10.10).
 */
class StoreCarouselRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:150'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'link' => ['nullable', 'string', 'max:255'],
            'button_text' => ['nullable', 'string', 'max:60'],
            'sort_order' => ['nullable', 'integer', 'between:0,999'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Judul carousel wajib diisi.',
            'title.max' => 'Judul carousel maksimal 150 karakter.',
            'image.required' => 'Gambar carousel wajib diunggah.',
            'image.image' => 'Gambar carousel harus berupa gambar.',
            'image.mimes' => 'Gambar carousel harus JPG, PNG, atau WebP maksimal 2 MB.',
            'image.max' => 'Gambar carousel harus JPG, PNG, atau WebP maksimal 2 MB.',
            'sort_order.integer' => 'Urutan harus berupa angka.',
            'sort_order.between' => 'Urutan harus antara 0 sampai 999.',
        ];
    }

    protected function prepareForValidation(): void
    {
        foreach (['title', 'subtitle', 'link', 'button_text'] as $field) {
            $value = $this->input($field);

            if (is_string($value)) {
                $this->merge([$field => trim($value)]);
            }
        }
    }
}

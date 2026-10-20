<?php

namespace App\Http\Requests\Admin;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Ubah kategori (kontrak props §12.10).
 */
class UpdateCategoryRequest extends FormRequest
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
        $category = $this->route('category');

        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => [
                'nullable', 'string', 'max:140', 'regex:/^[a-z0-9]+(-[a-z0-9]+)*$/',
                Rule::unique('categories', 'slug')->ignore($category instanceof Category ? $category->id : null),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
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
            'name.required' => 'Nama kategori wajib diisi.',
            'name.max' => 'Nama kategori maksimal 120 karakter.',
            'slug.regex' => 'Slug hanya boleh huruf kecil, angka, dan tanda hubung.',
            'slug.unique' => 'Slug sudah dipakai kategori lain.',
            'description.max' => 'Deskripsi maksimal 1000 karakter.',
            'image.image' => 'Gambar kategori harus berupa gambar.',
            'image.mimes' => 'Gambar kategori harus JPG, PNG, atau WebP maksimal 2 MB.',
            'image.max' => 'Gambar kategori harus JPG, PNG, atau WebP maksimal 2 MB.',
            'sort_order.integer' => 'Urutan harus berupa angka.',
            'sort_order.between' => 'Urutan harus antara 0 sampai 999.',
        ];
    }

    protected function prepareForValidation(): void
    {
        foreach (['name', 'slug', 'description'] as $field) {
            $value = $this->input($field);

            if (is_string($value)) {
                $this->merge([$field => trim($value)]);
            }
        }
    }
}

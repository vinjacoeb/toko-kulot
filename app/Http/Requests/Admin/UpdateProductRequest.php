<?php

namespace App\Http\Requests\Admin;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Ubah produk + varian + galeri (kontrak props §12.6).
 */
class UpdateProductRequest extends FormRequest
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
        $product = $this->produk();

        return [
            'name' => ['required', 'string', 'max:180'],
            'slug' => [
                'nullable', 'string', 'max:200', 'regex:/^[a-z0-9]+(-[a-z0-9]+)*$/',
                Rule::unique('products', 'slug')->ignore($product?->id),
            ],
            'sku' => [
                'required', 'string', 'max:60',
                Rule::unique('products', 'sku')->ignore($product?->id),
            ],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'short_description' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'weight_gram' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'base_price' => ['required', 'integer', 'min:0', 'max:1000000000'],
            'compare_price' => ['nullable', 'integer', 'gt:base_price', 'max:1000000000'],
            'wholesale_price' => ['nullable', 'integer', 'min:0', 'lt:base_price'],
            'min_wholesale_qty' => ['nullable', 'integer', 'min:1', 'max:100000', 'required_with:wholesale_price'],
            'is_active' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],

            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'images_alt' => ['nullable', 'array', 'max:5'],
            'images_alt.*' => ['nullable', 'string', 'max:180'],
            'hapus_images' => ['nullable', 'array', 'max:20'],
            'hapus_images.*' => ['integer'],
            'primary_image_id' => ['nullable', 'integer'],

            'variants' => ['required', 'array', 'min:1', 'max:50'],
            'variants.*.id' => ['nullable', 'integer'],
            'variants.*.size' => ['required', 'string', 'max:30'],
            'variants.*.color' => ['nullable', 'string', 'max:40'],
            'variants.*.sku' => ['nullable', 'string', 'max:60', 'distinct'],
            'variants.*.price_delta' => ['nullable', 'integer', 'between:-100000000,100000000'],
            'variants.*.stock' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'variants.*.is_active' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama produk wajib diisi.',
            'name.max' => 'Nama produk maksimal 180 karakter.',
            'slug.regex' => 'Slug hanya boleh huruf kecil, angka, dan tanda hubung.',
            'slug.unique' => 'Slug sudah dipakai produk lain.',
            'sku.required' => 'SKU produk wajib diisi.',
            'sku.unique' => 'SKU sudah dipakai produk lain.',
            'category_id.required' => 'Kategori wajib dipilih.',
            'category_id.exists' => 'Kategori tidak ditemukan.',
            'base_price.required' => 'Harga wajib diisi.',
            'base_price.integer' => 'Harga harus berupa angka bulat rupiah.',
            'base_price.min' => 'Harga tidak boleh negatif.',
            'compare_price.gt' => 'Harga coret harus lebih besar dari harga jual.',
            'wholesale_price.lt' => 'Harga grosir harus lebih kecil dari harga jual.',
            'min_wholesale_qty.required_with' => 'Minimal qty grosir wajib diisi bila harga grosir diisi.',
            'images.max' => 'Maksimal 5 gambar per produk.',
            'images.*.mimes' => 'Gambar harus JPG, PNG, atau WebP maksimal 2 MB.',
            'images.*.max' => 'Gambar harus JPG, PNG, atau WebP maksimal 2 MB.',
            'hapus_images.*.integer' => 'Gambar yang dihapus tidak dikenali.',
            'variants.required' => 'Minimal satu varian harus diisi.',
            'variants.min' => 'Minimal satu varian harus diisi.',
            'variants.*.size.required' => 'Ukuran varian wajib dipilih.',
            'variants.*.sku.distinct' => 'SKU varian tidak boleh ganda.',
        ];
    }

    protected function prepareForValidation(): void
    {
        foreach (['name', 'slug', 'sku', 'short_description', 'description'] as $field) {
            $value = $this->input($field);

            if (is_string($value)) {
                $this->merge([$field => trim($value)]);
            }
        }
    }

    private function produk(): ?Product
    {
        $product = $this->route('product');

        return $product instanceof Product ? $product : null;
    }
}

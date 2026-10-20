<?php

namespace App\Http\Requests;

use App\Services\ReviewService;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Penilaian produk setelah checkout (PRD §7.3, kontrak §9.1).
 *
 * Kepemilikan order dan keanggotaan produk di order dicek lagi di
 * App\Services\ReviewService supaya tidak bisa ditembus lewat manipulasi payload.
 */
class StoreReviewRequest extends FormRequest
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
            'ulasan' => ['required', 'array', 'min:1', 'max:'.ReviewService::MAX_PER_SUBMIT],
            'ulasan.*.product_id' => ['required', 'integer', 'distinct', 'exists:products,id'],
            'ulasan.*.rating' => ['required', 'integer', 'between:1,5'],
            'ulasan.*.comment' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'ulasan.required' => 'Tidak ada produk yang dinilai.',
            'ulasan.array' => 'Format penilaian tidak valid.',
            'ulasan.max' => 'Terlalu banyak produk dalam satu kiriman.',
            'ulasan.*.product_id.required' => 'Produk yang dinilai tidak dikenal.',
            'ulasan.*.product_id.integer' => 'Produk yang dinilai tidak dikenal.',
            'ulasan.*.product_id.distinct' => 'Produk yang sama tidak boleh dinilai dua kali.',
            'ulasan.*.product_id.exists' => 'Produk tidak ditemukan.',
            'ulasan.*.rating.required' => 'Pilih jumlah bintang untuk setiap produk.',
            'ulasan.*.rating.between' => 'Penilaian harus antara 1 sampai 5 bintang.',
            'ulasan.*.comment.max' => 'Komentar maksimal 1000 karakter.',
        ];
    }

    /**
     * @return array<int, array{product_id: int, rating: int, comment: ?string}>
     */
    public function reviews(): array
    {
        return array_values((array) $this->validated('ulasan'));
    }
}

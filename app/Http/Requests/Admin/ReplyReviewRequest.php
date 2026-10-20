<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Balasan admin untuk ulasan pembeli (kontrak §10.5).
 */
class ReplyReviewRequest extends FormRequest
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
            'admin_reply' => ['required', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'admin_reply.required' => 'Balasan wajib diisi.',
            'admin_reply.max' => 'Balasan maksimal 1000 karakter.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $value = $this->input('admin_reply');

        if (is_string($value)) {
            $this->merge(['admin_reply' => trim($value)]);
        }
    }
}

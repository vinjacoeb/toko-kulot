<?php

namespace App\Http\Requests\Admin;

use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Ubah status pesanan (kontrak props §12.18). Transisi yang sah dicek OrderService.
 */
class UpdateOrderStatusRequest extends FormRequest
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
            'status' => [
                'required', 'string',
                Rule::in([...Order::STATUS_FLOW, Order::STATUS_CANCELLED]),
            ],
            'note' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'status.required' => 'Status pesanan wajib dipilih.',
            'status.in' => 'Status pesanan tidak dikenal.',
            'note.max' => 'Catatan maksimal 255 karakter.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $note = $this->input('note');

        if (is_string($note)) {
            $this->merge(['note' => trim($note)]);
        }
    }
}

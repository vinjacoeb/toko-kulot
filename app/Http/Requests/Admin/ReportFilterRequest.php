<?php

namespace App\Http\Requests\Admin;

use App\Services\ReportService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Filter unduhan laporan (kontrak props §14.2). Hanya rute unduh yang menolak
 * input tidak sah; halaman laporan selalu jatuh ke periode bawaan.
 */
class ReportFilterRequest extends FormRequest
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
            'periode' => ['required', Rule::in(ReportService::PERIODE)],
            'dari' => ['nullable', 'date_format:Y-m-d', 'required_if:periode,kustom'],
            'sampai' => ['nullable', 'date_format:Y-m-d', 'required_if:periode,kustom', 'after_or_equal:dari'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'periode.required' => 'Pilih periode laporan.',
            'periode.in' => 'Periode laporan tidak dikenal.',
            'dari.date_format' => 'Tanggal awal harus berformat YYYY-MM-DD.',
            'dari.required_if' => 'Tanggal awal wajib diisi untuk periode kustom.',
            'sampai.date_format' => 'Tanggal akhir harus berformat YYYY-MM-DD.',
            'sampai.required_if' => 'Tanggal akhir wajib diisi untuk periode kustom.',
            'sampai.after_or_equal' => 'Tanggal akhir tidak boleh sebelum tanggal awal.',
        ];
    }
}

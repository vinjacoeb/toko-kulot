<?php

namespace App\Http\Controllers\Admin\Concerns;

/**
 * Pembantu bersama daftar admin: bentuk paginator baku (kontrak props §12.0) dan
 * pembacaan filter query yang mengabaikan nilai tak sah (kembali ke bawaan).
 */
trait ListProps
{
    /**
     * @param  \Illuminate\Contracts\Pagination\LengthAwarePaginator<int, mixed>  $paginator
     * @return array<string, int>
     */
    protected function meta($paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ];
    }

    protected function teks(mixed $value): ?string
    {
        $text = trim((string) $value);

        return $text === '' ? null : $text;
    }

    protected function angka(mixed $value): ?int
    {
        return is_numeric($value) ? (int) $value : null;
    }

    /**
     * @param  list<string>  $allowed
     */
    protected function pilihan(mixed $value, array $allowed, string $default): string
    {
        $value = is_string($value) ? $value : '';

        return in_array($value, $allowed, true) ? $value : $default;
    }

    /**
     * Tanggal `YYYY-MM-DD` yang sah, selain itu `null`.
     */
    protected function tanggal(mixed $value): ?string
    {
        $text = trim((string) $value);

        return preg_match('/^\d{4}-\d{2}-\d{2}$/', $text) === 1 ? $text : null;
    }

    /**
     * Checkbox/boolean dari form; nilai tak ada memakai bawaan.
     */
    protected function flag(mixed $value, bool $default): bool
    {
        return $value === null ? $default : filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }
}

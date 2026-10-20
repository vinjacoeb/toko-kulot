import React from 'react';
import { cn } from '../lib/format';
import Select from './Select';

export const SORT_OPTIONS = [
    { value: 'terbaru', label: 'Terbaru' },
    { value: 'harga-asc', label: 'Harga terendah' },
    { value: 'harga-desc', label: 'Harga tertinggi' },
    { value: 'terlaris', label: 'Terlaris' },
    { value: 'rating', label: 'Rating' },
];

/** SortSelect - docs/design.md 4.19. Opsi baku, native select. */
export default function SortSelect({ value = 'terbaru', onChange = null, className = '' }) {
    return (
        <Select
            id="urutkan"
            aria-label="Urutkan produk"
            value={value}
            onChange={(event) => {
                if (typeof onChange === 'function') onChange(event.target.value);
            }}
            className={cn('w-full sm:w-48', className)}
        >
            {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </Select>
    );
}

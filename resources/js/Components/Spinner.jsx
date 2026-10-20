import React from 'react';
import { cn } from '../lib/format';

const SIZES = { 16: 16, 20: 20, 24: 24 };

/** Indikator memuat (docs/komponen.md §1). `label` dipakai screen reader. */
export default function Spinner({ size = 16, label = 'Memuat', className = '' }) {
    const px = SIZES[size] ?? 16;

    return (
        <svg
            className={cn('animate-spin text-current', className)}
            width={px}
            height={px}
            viewBox="0 0 24 24"
            fill="none"
            role="img"
            aria-label={label}
        >
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

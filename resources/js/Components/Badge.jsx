import React from 'react';
import { cn } from '../lib/format';

/**
 * Badge — label pendek non-status (promo / sale) — docs/design.md §4.21 v2.1, docs/komponen.md §1.
 * Tone: brand | accent | sale | success | warning | danger (jangan pakai warna di luar token).
 * Kelas baku §4.21 v2.1 — teks badge selalu < 24px (`text-badge`) sehingga ambangnya 4,5:1:
 *   accent  → `bg-accent-500 text-ink` (10,11:1; `text-white` di atas accent hanya 1,85:1 — dilarang)
 *   sale    → `bg-sale-500 text-white` (4,65:1; bentuk tint 10% + token dasar sale hanya 4,00:1 — dilarang)
 *   brand   → `bg-brand/10 text-brand` (9,35:1)
 *   success → `bg-success/10 text-success-strong` (5,33:1; token dasar success hanya 2,96:1 — dilarang)
 *   warning → `bg-warning/10 text-warning-strong` (5,34:1; token dasar warning hanya 2,86:1 — dilarang)
 *   danger  → `bg-danger/10 text-danger-strong` (5,95:1 di atas tint; token dasar danger 4,13:1 — dilarang)
 * Tone tak dikenal jatuh ke `brand` (satu-satunya tone yang pasti lolos di semua latar uji).
 */
const CLASSES = {
    brand: 'bg-brand/10 text-brand',
    accent: 'bg-accent-500 text-ink',
    sale: 'bg-sale-500 text-white',
    success: 'bg-success/10 text-success-strong',
    warning: 'bg-warning/10 text-warning-strong',
    danger: 'bg-danger/10 text-danger-strong',
};

export default function Badge({ tone = 'brand', children, className = '' }) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-1 text-badge uppercase',
                CLASSES[tone] ?? CLASSES.brand,
                className
            )}
        >
            {children}
        </span>
    );
}

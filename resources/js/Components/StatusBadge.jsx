import React from 'react';
import { cn } from '../lib/format';

/**
 * Pil status — docs/design.md §4.21.
 * Pemetaan baku status order (jangan bikin varian baru):
 * pending → warning, dibayar/diproses/dikirim → brand, selesai → success, batal → danger;
 * status di luar daftar (mis. "Sudah dibaca" §5.12, arsip) → neutral.
 * Bentuk kelas §4.21 v2.1: `bg-{token}/10 text-{token}-strong` — teks badge selalu < 24px
 * (`text-badge`) sehingga ambangnya 4,5:1, dan token dasar `warning`/`success` hanya 2,86:1/2,96:1
 * di atas tint-nya. `brand` tetap `bg-brand/10 text-brand` (9,35:1); `neutral` `bg-slate-200/60
 * text-slate-600` (6,17:1).
 */
const TONES = {
    pending: { token: 'warning', label: 'Menunggu' },
    dibayar: { token: 'brand', label: 'Dibayar' },
    diproses: { token: 'brand', label: 'Diproses' },
    dikirim: { token: 'brand', label: 'Dikirim' },
    selesai: { token: 'success', label: 'Selesai' },
    batal: { token: 'danger', label: 'Batal' },
};

const CLASSES = {
    brand: 'bg-brand/10 text-brand',
    warning: 'bg-warning/10 text-warning-strong',
    success: 'bg-success/10 text-success-strong',
    danger: 'bg-danger/10 text-danger-strong',
    neutral: 'bg-slate-200/60 text-slate-600',
};

export default function StatusBadge({ status = null, label = null, className = '' }) {
    const key = typeof status === 'string' ? status.trim().toLowerCase() : '';
    const tone = TONES[key] ?? null;
    const text = label ?? tone?.label ?? (key === '' ? '-' : status);

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-1 text-badge uppercase',
                CLASSES[tone?.token ?? 'neutral'],
                className
            )}
        >
            {text}
        </span>
    );
}

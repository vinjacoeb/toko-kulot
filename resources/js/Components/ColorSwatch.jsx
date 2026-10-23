import React from 'react';
import { cn } from '../lib/format';

const POLA_HEX = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/**
 * ColorSwatch — docs/design.md §4.6: lingkaran 28px, cincin aktif 2px `ink`, `aria-label` nama warna.
 * `hex` mengikuti kontrak §8.3 (`#RRGGBB` atau null). Nilai null/tidak sah tidak ditebak:
 * lingkaran netral `bg-surface` + huruf awal nama warna, nama lengkap di `aria-label`/`title`.
 */
export default function ColorSwatch({ name = 'Warna', hex = null, active = false, disabled = false, onClick = null, className = '' }) {
    const label = String(name ?? '').trim() || 'Warna';
    const teks = typeof hex === 'string' ? hex.trim() : '';
    const warna = POLA_HEX.test(teks) ? teks : null;

    return (
        <button
            type="button"
            onClick={() => {
                if (!disabled && typeof onClick === 'function') onClick();
            }}
            aria-pressed={active}
            aria-label={label}
            title={label}
            disabled={disabled}
            className={cn(
                'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line transition-shadow duration-hover',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
                !warna && 'bg-surface',
                active ? 'outline outline-2 outline-offset-2 outline-ink' : null,
                disabled ? 'cursor-not-allowed opacity-45' : null,
                className
            )}
            style={warna ? { backgroundColor: warna } : undefined}
        >
            {warna ? null : (
                <span aria-hidden="true" className="text-badge uppercase text-slate-600">
                    {label.charAt(0)}
                </span>
            )}
            <span className="sr-only">{label}</span>
        </button>
    );
}

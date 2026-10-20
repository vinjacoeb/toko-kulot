import React from 'react';
import { cn } from '../lib/format';

/** QtyStepper - docs/design.md 4.20. Tombol 44px, input tengah, min/max dijaga. */
export default function QtyStepper({
    value = 1,
    onChange = null,
    min = 1,
    max = 99,
    disabled = false,
    id = 'qty',
    label = 'Jumlah',
    className = '',
}) {
    const safeMax = Math.max(Number(max) || 1, 1);
    const safeMin = Math.max(Number(min) || 1, 1);
    const current = Math.min(Math.max(Number(value) || safeMin, safeMin), safeMax);

    const set = (next) => {
        if (disabled || typeof onChange !== 'function') return;
        onChange(Math.min(Math.max(next, safeMin), safeMax));
    };

    const buttonClass =
        'inline-flex h-field w-11 items-center justify-center text-ink transition-colors duration-hover hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:text-slate-300';

    return (
        <div className={cn('inline-flex items-stretch overflow-hidden rounded-md border border-line bg-white', className)}>
            <button
                type="button"
                onClick={() => set(current - 1)}
                disabled={disabled || current <= safeMin}
                aria-label="Kurangi jumlah"
                className={buttonClass}
            >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M5 12h14" strokeLinecap="round" />
                </svg>
            </button>
            <label htmlFor={id} className="sr-only">
                {label}
            </label>
            <input
                id={id}
                type="number"
                inputMode="numeric"
                min={safeMin}
                max={safeMax}
                value={current}
                disabled={disabled}
                onChange={(event) => set(Number(event.target.value))}
                className="h-field w-14 border-x border-line bg-white text-center text-body text-ink focus:outline-none focus:ring-[3px] focus:ring-brand/15 [appearance:textfield] disabled:bg-surface [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
                type="button"
                onClick={() => set(current + 1)}
                disabled={disabled || current >= safeMax}
                aria-label="Tambah jumlah"
                className={buttonClass}
            >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
            </button>
        </div>
    );
}

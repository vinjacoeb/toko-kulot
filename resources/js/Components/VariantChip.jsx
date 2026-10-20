import React from 'react';
import { cn } from '../lib/format';

/**
 * VariantChip - docs/design.md 4.6. Ukuran 44x40, aktif border 2px ink,
 * tidak tersedia: garis diagonal + aria-disabled.
 */
export default function VariantChip({ label, active = false, disabled = false, onClick = null, className = '' }) {
    return (
        <button
            type="button"
            onClick={() => {
                if (!disabled && typeof onClick === 'function') onClick();
            }}
            aria-pressed={active}
            aria-disabled={disabled ? 'true' : undefined}
            disabled={disabled}
            className={cn(
                'relative inline-flex h-10 min-w-11 items-center justify-center overflow-hidden rounded-sm border px-3 text-meta transition-colors duration-hover',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
                active ? 'border-2 border-ink text-ink' : 'border-line text-ink-soft hover:border-ink',
                disabled ? 'cursor-not-allowed text-slate-300' : null,
                className
            )}
        >
            {label}
            {disabled && (
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[140%] -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] bg-slate-300"
                />
            )}
        </button>
    );
}

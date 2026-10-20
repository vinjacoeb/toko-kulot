import React from 'react';
import { cn } from '../lib/format';

/** ColorSwatch - docs/design.md 4.6. Lingkaran 28px, aktif ring 2px ink. */
export default function ColorSwatch({ name = 'Warna', hex = null, active = false, disabled = false, onClick = null, className = '' }) {
    return (
        <button
            type="button"
            onClick={() => {
                if (!disabled && typeof onClick === 'function') onClick();
            }}
            aria-pressed={active}
            aria-label={name}
            title={name}
            disabled={disabled}
            className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded-full border border-line transition-shadow duration-hover',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
                active ? 'ring-2 ring-ink ring-offset-2' : null,
                disabled ? 'cursor-not-allowed opacity-45' : null,
                className
            )}
            style={{ backgroundColor: hex || '#EDE7DF' }}
        >
            <span className="sr-only">{name}</span>
        </button>
    );
}

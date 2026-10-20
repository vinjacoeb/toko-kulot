import React from 'react';
import { cn } from '../lib/format';

/**
 * Tombol ikon 44x44 (design §4.13). `label` wajib: menjadi aria-label.
 * Badge kecil untuk jumlah keranjang memakai `badge`.
 */
export default function IconButton({ label, badge = null, children, className = '', type = 'button', ...rest }) {
    return (
        <button
            type={type}
            aria-label={label}
            title={label}
            className={cn(
                'relative inline-flex h-touch w-touch items-center justify-center rounded-md text-brand',
                'transition-colors duration-hover hover:bg-surface disabled:opacity-45 disabled:cursor-not-allowed',
                className
            )}
            {...rest}
        >
            {children}
            {badge !== null && badge !== undefined && badge !== '' && (
                <span className="absolute right-1 top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-500 px-1 text-badge text-ink">
                    {badge}
                </span>
            )}
        </button>
    );
}

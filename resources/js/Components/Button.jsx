import React from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '../lib/format';
import { SpinnerIcon } from './icons';

const VARIANTS = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger:
        'inline-flex items-center justify-center gap-2 h-10 px-5 rounded-sm text-label font-semibold leading-none bg-danger text-white transition-colors duration-hover hover:opacity-90 disabled:opacity-45 disabled:cursor-not-allowed',
    link: 'inline-flex items-center gap-2 text-label text-brand underline underline-offset-4 rounded-sm',
};

const SIZES = {
    md: '',
    sm: 'h-10 px-4',
};

/**
 * Tombol baku (docs/komponen.md §4.1).
 * - `loading` menonaktifkan tombol dan menampilkan spinner (design §4.0).
 * - `href` mengubah tombol menjadi tautan Inertia.
 */
export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    as = 'button',
    href = null,
    type = 'button',
    loading = false,
    disabled = false,
    fullWidth = false,
    icon = null,
    className = '',
    ...rest
}) {
    const classes = cn(
        VARIANTS[variant] ?? VARIANTS.primary,
        size === 'sm' && variant !== 'link' ? SIZES.sm : null,
        variant === 'link' && size === 'sm' ? 'text-meta' : null,
        fullWidth ? 'w-full' : null,
        'whitespace-nowrap',
        className
    );

    const content = loading ? (
        <>
            <SpinnerIcon size={16} />
            <span>Memproses…</span>
        </>
    ) : (
        <>
            {icon}
            <span>{children}</span>
        </>
    );

    if (as === 'a') {
        return (
            <a href={href} className={classes} {...rest}>
                {content}
            </a>
        );
    }

    if (as === Link || as === 'Link' || href) {
        return (
            <Link href={href} className={classes} aria-busy={loading || undefined} {...rest}>
                {content}
            </Link>
        );
    }

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            {...rest}
        >
            {content}
        </button>
    );
}

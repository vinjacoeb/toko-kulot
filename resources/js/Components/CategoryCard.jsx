import React from 'react';
import { Link } from '@inertiajs/react';
import { cn, formatNumber } from '../lib/format';
import { ImageOffIcon } from './icons';

/**
 * Kartu kategori — docs/komponen.md §1, docs/design.md §4.16.
 * Rasio 3:4, overlay gradien bawah, judul `text-h3` putih, jumlah produk `text-badge`.
 * Kategori tanpa produk tidak dirender (state `empty`).
 */
export default function CategoryCard({ name, image = null, href = null, productCount = null, className = '' }) {
    if (!name) return null;

    const count = productCount === null || productCount === undefined ? null : formatNumber(productCount);
    const body = (
        <>
            {image ? (
                <img
                    src={image}
                    alt={name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-hover ease-smooth group-hover:scale-[1.03]"
                />
            ) : (
                <span className="flex h-full w-full items-center justify-center bg-surface text-slate-400">
                    <ImageOffIcon size={32} />
                </span>
            )}
            <span
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 text-white"
                aria-hidden="true"
            >
                <span className="block text-h3 text-white">{name}</span>
                {count !== null && <span className="mt-0.5 block text-badge text-white/75">{count} produk</span>}
            </span>
        </>
    );

    const classes = cn(
        'group relative block aspect-[3/4] overflow-hidden rounded-md bg-surface',
        className
    );

    if (!href) {
        return <div className={classes}>{body}</div>;
    }

    return (
        <Link href={href} className={classes} aria-label={`Kategori ${name}${count ? `, ${count} produk` : ''}`}>
            {body}
        </Link>
    );
}

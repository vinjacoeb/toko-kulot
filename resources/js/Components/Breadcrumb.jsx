import React from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '../lib/format';

/**
 * Breadcrumb - docs/design.md 4.13.
 * items = [{ label, href }]; item terakhir aria-current="page".
 * Mobile: maksimal 2 level, level tengah diganti elipsis.
 */
export default function Breadcrumb({ items = [], className = '' }) {
    const list = (Array.isArray(items) ? items : []).filter((item) => item && item.label);
    if (list.length === 0) return null;

    const first = list[0];
    const last = list[list.length - 1];
    const middle = list.slice(1, -1);

    const renderItem = (item, isLast) =>
        isLast || !item.href ? (
            <span className="text-ink" aria-current="page">
                {item.label}
            </span>
        ) : (
            <Link href={item.href} className="transition-colors duration-hover hover:text-ink">
                {item.label}
            </Link>
        );

    return (
        <nav aria-label="Breadcrumb" className={cn('h-12', className)}>
            <ol className="flex h-full items-center gap-2 text-meta text-slate-400">
                <li className="flex items-center gap-2">{renderItem(first, list.length === 1)}</li>
                {list.length > 1 && (
                    <li className="flex items-center gap-2" aria-hidden="true">
                        <span>/</span>
                    </li>
                )}
                {middle.length > 0 && (
                    <li className="flex items-center gap-2 sm:hidden" aria-hidden="true">
                        <span>...</span>
                    </li>
                )}
                {list.length > 1 && (
                    <li className="flex items-center gap-2">{renderItem(last, true)}</li>
                )}
            </ol>
        </nav>
    );
}

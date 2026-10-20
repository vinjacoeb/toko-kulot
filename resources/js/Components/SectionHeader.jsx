import React from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '../lib/format';

/** Judul seksi + tautan aksi — docs/design.md §4.14. Jarak bawah 24px. */
export default function SectionHeader({
    title,
    description = null,
    actionLabel = null,
    actionHref = null,
    className = '',
}) {
    return (
        <div className={cn('mb-6 flex items-end justify-between gap-4', className)}>
            <div className="min-w-0">
                <h2 className="font-display text-h2 text-brand">{title}</h2>
                {description && <p className="mt-1 text-meta text-ink-soft">{description}</p>}
            </div>
            {actionLabel && actionHref && (
                <Link
                    href={actionHref}
                    className="shrink-0 text-label text-brand underline underline-offset-4"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}

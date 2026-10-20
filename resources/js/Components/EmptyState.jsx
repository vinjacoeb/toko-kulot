import React from 'react';
import { cn } from '../lib/format';
import Button from './Button';
import { ImageOffIcon } from './icons';

/**
 * Kondisi kosong — docs/komponen.md §1, docs/design.md §4.23.
 * Tidak boleh dipakai untuk state error (pakai `ErrorState`).
 */
export default function EmptyState({
    title = 'Belum ada data',
    description = null,
    actionLabel = null,
    actionHref = null,
    onAction = null,
    icon = null,
    className = '',
}) {
    return (
        <div className={cn('flex flex-col items-center gap-3 py-12 text-center', className)}>
            <span className="text-slate-300" aria-hidden="true">
                {icon ?? <ImageOffIcon size={96} />}
            </span>
            <p className="text-h3 text-ink">{title}</p>
            {description && <p className="max-w-sm text-meta text-slate-600">{description}</p>}
            {actionLabel && onAction && (
                <Button variant="secondary" onClick={onAction} className="mt-2">
                    {actionLabel}
                </Button>
            )}
            {actionLabel && !onAction && actionHref && (
                <Button variant="secondary" href={actionHref} className="mt-2">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}

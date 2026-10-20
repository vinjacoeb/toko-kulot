import React from 'react';
import { cn } from '../lib/format';
import Breadcrumb from './Breadcrumb';

/**
 * Kepala halaman admin — docs/design.md §4.30.
 * Susunan: Breadcrumb → H1 → slot aksi di kanan.
 * Mobile: aksi turun ke bawah, selebar penuh.
 */
export default function PageHeader({ title = '', breadcrumb = [], actions = null, description = null, className = '' }) {
    return (
        <header className={cn('flex flex-col gap-3', className)}>
            {breadcrumb.length > 0 && <Breadcrumb items={breadcrumb} />}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-h1 font-bold text-ink">{title}</h1>
                    {description && <p className="mt-1 text-meta text-slate-600">{description}</p>}
                </div>

                {actions && <div className="flex flex-col gap-2 sm:flex-row sm:items-center">{actions}</div>}
            </div>
        </header>
    );
}

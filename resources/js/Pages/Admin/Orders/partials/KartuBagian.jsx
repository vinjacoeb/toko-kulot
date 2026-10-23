import React from 'react';
import { cn } from '../../../../lib/format';

/**
 * Kartu seksi halaman detail admin — design §5.12 (kartu pembeli, kartu pengiriman, tabel item).
 * Komponen lokal F5: komponen bersama tidak diubah (DoD-2 kartu t_018b2723).
 */
export default function KartuBagian({ title = '', description = null, actions = null, children = null, className = '' }) {
    return (
        <section className={cn('flex flex-col gap-4 rounded-lg border border-line bg-white p-6', className)}>
            {(title !== '' || actions) && (
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        {title !== '' && <h2 className="text-h3 text-ink">{title}</h2>}
                        {description && <p className="mt-1 text-meta text-slate-600">{description}</p>}
                    </div>
                    {actions}
                </div>
            )}

            {children}
        </section>
    );
}

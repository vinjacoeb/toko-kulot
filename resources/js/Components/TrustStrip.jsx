import React from 'react';
import { cn } from '../lib/format';
import { TRUST_ICONS } from './icons';

/**
 * Trust strip — docs/komponen.md §1 (`items: [{icon,label}]`, maks 4),
 * docs/design.md §4.17. Ikon 24px `text-brand`, teks `text-meta`, bg `surface`.
 */
export default function TrustStrip({ items = [], className = '' }) {
    const visible = items.slice(0, 4).filter((item) => item && item.label);

    if (!visible.length) return null;

    return (
        <section className={cn('bg-surface', className)}>
            <div className="container grid grid-cols-2 gap-gutter py-5 md:grid-cols-4">
                {visible.map((item, index) => {
                    const Icon = TRUST_ICONS[item.icon] ?? TRUST_ICONS.check;

                    return (
                        <div key={`${item.icon ?? 'item'}-${index}`} className="flex items-center gap-3">
                            <span className="shrink-0 text-brand" aria-hidden="true">
                                <Icon size={24} />
                            </span>
                            <span className="min-w-0">
                                <span className="block text-meta text-ink">{item.label}</span>
                                {item.description && (
                                    <span className="block text-meta text-ink-soft">
                                        {item.description}
                                    </span>
                                )}
                            </span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

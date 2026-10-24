import React from 'react';
import { cn } from '../lib/format';
import { TRUST_ICONS } from './icons';
import Reveal, { stagger } from './Reveal';

/**
 * Trust strip editorial — design-v1.1 §4.2.
 * Sumber `settings.landing_sections.trust_strip[]` `{icon,title,subtitle}` (maks 6).
 * Bukan baris ikon datar: pita putih bergaris atas/bawah, nomor editorial 01–06,
 * pemisah vertikal di desktop, hover garis aksen tumbuh dari kiri.
 * Kosong → seksi hilang. Item tanpa judul dilewati (tidak ada item karangan).
 */
const LG_COLUMNS = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
};

export default function TrustStrip({ items = [], className = '', label = 'Keunggulan belanja' }) {
    const visible = items.filter((item) => item && item.label).slice(0, 6);

    if (!visible.length) return null;

    return (
        <section aria-label={label} className={cn('border-y border-line bg-white', className)}>
            <div
                className={cn(
                    'container grid grid-cols-2 gap-x-gutter gap-y-6 py-7 md:grid-cols-3 lg:divide-x lg:divide-line lg:gap-x-0 lg:py-9',
                    LG_COLUMNS[visible.length] ?? 'lg:grid-cols-6'
                )}
            >
                {visible.map((item, index) => {
                    const Icon = TRUST_ICONS[item.icon] ?? TRUST_ICONS.check;

                    return (
                        <Reveal
                            key={`${item.icon ?? 'item'}-${index}`}
                            delay={stagger(index)}
                            className={cn(
                                'group relative min-w-0',
                                index === visible.length - 1 && visible.length % 2 === 1
                                    ? 'col-span-2 md:col-span-1 lg:col-span-1'
                                    : null,
                                index === visible.length - 1 && visible.length % 3 !== 0
                                    ? 'md:col-span-3 lg:col-span-1'
                                    : null,
                                'lg:px-5 lg:first:pl-0 lg:last:pr-0'
                            )}
                        >
                            <span
                                aria-hidden="true"
                                className="font-display text-h3 leading-none text-brand"
                            >
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <div className="mt-2 flex items-start gap-2">
                                <span aria-hidden="true" className="mt-0.5 shrink-0 text-brand">
                                    <Icon size={20} />
                                </span>
                                <div className="min-w-0">
                                    <h3 className="text-h3 text-ink">{item.label}</h3>
                                    {item.description && (
                                        <p className="mt-1 text-meta text-slate-600">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <span
                                aria-hidden="true"
                                className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-hover ease-smooth group-hover:scale-x-100 motion-reduce:transition-none"
                            />
                        </Reveal>
                    );
                })}
            </div>
        </section>
    );
}

import React from 'react';
import { cn, formatNumber } from '../lib/format';
import { StarIcon } from './icons';

function Stars({ value = 0, size = 16 }) {
    return (
        <span className="inline-flex items-center gap-0.5" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={star <= Math.round(value) ? 'text-accent-500' : 'text-slate-300'}>
                    <StarIcon filled={star <= Math.round(value)} width={size} height={size} />
                </span>
            ))}
        </span>
    );
}

/**
 * RatingSummary - docs/design.md 4.8. Rata-rata, jumlah ulasan, distribusi 5..1.
 * Batang tidak digambar bila total ulasan 0.
 */
export default function RatingSummary({ average = 0, count = 0, distribution = null, className = '' }) {
    const avg = Number(average ?? 0) || 0;
    const total = Number(count ?? 0) || 0;

    const bars = [5, 4, 3, 2, 1].map((star) => {
        const value = distribution && distribution[star] !== undefined ? Number(distribution[star]) || 0 : 0;
        const percent = total > 0 ? Math.round((value / total) * 100) : 0;
        return { star, value, percent };
    });

    return (
        <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6', className)}>
            <div className="flex items-baseline gap-2">
                <span className="text-[32px] font-bold leading-10 text-ink">{avg ? avg.toFixed(1) : '-'}</span>
                <div className="flex flex-col">
                    <Stars value={avg} />
                    <span className="text-meta text-slate-400">
                        {total > 0 ? formatNumber(total) + ' ulasan' : 'Belum ada ulasan'}
                    </span>
                </div>
            </div>

            {total > 0 && (
                <div className="flex-1 space-y-1.5">
                    {bars.map((bar) => (
                        <div key={bar.star} className="flex items-center gap-2">
                            <span className="w-8 shrink-0 text-meta text-slate-400">{bar.star} bintang</span>
                            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
                                <span
                                    className="block h-full rounded-full bg-accent-500"
                                    style={{ width: bar.percent + '%' }}
                                />
                            </span>
                            <span className="w-9 shrink-0 text-right text-meta text-slate-400">{bar.percent}%</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

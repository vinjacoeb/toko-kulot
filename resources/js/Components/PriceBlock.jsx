import React from 'react';
import { cn, rupiah } from '../lib/format';

/**
 * PriceBlock - docs/design.md 4.2 / 4.21.
 * Harga jual `text-h2` (size="lg") / `text-body`, tabular-nums; harga coret + badge
 * diskon hanya bila server mengirim `comparePrice` yang lebih besar.
 */
export default function PriceBlock({ price, comparePrice = null, size = 'lg', className = '' }) {
    const value = Number(price ?? 0);
    const compare = comparePrice === null || comparePrice === undefined ? null : Number(comparePrice);
    const hasCompare = compare !== null && Number.isFinite(compare) && compare > value && value > 0;
    const discount = hasCompare ? Math.round(((compare - value) / compare) * 100) : 0;

    return (
        <div className={cn('flex flex-wrap items-baseline gap-2', className)}>
            <span className={cn('font-bold text-ink tabular-nums', size === 'lg' ? 'text-h2' : 'text-body')}>
                {rupiah(value)}
            </span>
            {hasCompare && (
                <>
                    <span className="text-meta text-slate-500 line-through tabular-nums">{rupiah(compare)}</span>
                    <span className="rounded-sm bg-sale-500 px-1.5 py-0.5 text-badge font-semibold text-white">
                        {'-' + discount + '%'}
                    </span>
                </>
            )}
        </div>
    );
}

import React from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '../lib/format';
import Skeleton from './Skeleton';
import { TrendDownIcon, TrendUpIcon } from './icons';

/**
 * Kartu KPI admin — docs/design.md §4.26, docs/komponen.md §4.
 * label `text-label uppercase text-slate-500`, angka 28px 700 `ink`,
 * delta `text-meta` (naik `success`, turun `danger`), ikon 32px `bg-brand-100 text-brand`.
 * `value` sudah diformat pemanggil (uang lewat `rupiah()`, angka lewat `formatNumber()`).
 */
export default function KpiCard({
    label = '',
    value = null,
    delta = null,
    deltaLabel = null,
    icon = null,
    href = null,
    loading = false,
    className = '',
}) {
    const Icon = icon;
    const numericDelta = delta === null || delta === undefined || delta === '' ? null : Number(delta);
    const hasDelta = numericDelta !== null && Number.isFinite(numericDelta);
    const DeltaIcon = hasDelta && numericDelta < 0 ? TrendDownIcon : TrendUpIcon;
    const shownValue = value === null || value === undefined || value === '' ? '-' : value;

    const body = (
        <>
            <div className="flex items-start justify-between gap-3">
                <p className="text-label uppercase text-slate-500">{label}</p>
                {Icon && (
                    <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-100 text-brand"
                        aria-hidden="true"
                    >
                        <Icon size={18} />
                    </span>
                )}
            </div>

            {loading ? (
                <div className="flex flex-col gap-2">
                    <Skeleton variant="title" className="h-7 w-3/5" />
                    <Skeleton variant="text" className="h-3 w-2/5" />
                </div>
            ) : (
                <div className="flex flex-col gap-1">
                    <p className="text-[28px] font-bold leading-none text-ink">{shownValue}</p>
                    {(hasDelta || deltaLabel) && (
                        <p
                            className={cn(
                                'flex items-center gap-1 text-meta',
                                hasDelta && numericDelta > 0 && 'text-success-strong',
                                hasDelta && numericDelta < 0 && 'text-danger-strong',
                                (!hasDelta || numericDelta === 0) && 'text-ink-soft'
                            )}
                        >
                            {hasDelta && numericDelta !== 0 && <DeltaIcon size={14} />}
                            {hasDelta && numericDelta !== 0 && (
                                <span>
                                    {numericDelta > 0 ? '+' : ''}
                                    {numericDelta}%
                                </span>
                            )}
                            {deltaLabel && <span className="text-slate-500">{deltaLabel}</span>}
                        </p>
                    )}
                </div>
            )}
        </>
    );

    const base = cn(
        'flex h-full flex-col gap-3 rounded-lg border border-line bg-white p-4 text-left',
        className
    );

    if (loading) {
        return (
            <div className={base} aria-busy="true">
                {body}
            </div>
        );
    }

    if (href) {
        return (
            <Link
                href={href}
                className={cn(
                    base,
                    'transition-colors duration-hover hover:border-brand/40 hover:bg-surface/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
                )}
            >
                {body}
            </Link>
        );
    }

    return <div className={base}>{body}</div>;
}

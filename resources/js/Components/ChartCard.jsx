import React, { useId, useState } from 'react';
import { cn, rupiah } from '../lib/format';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import Skeleton from './Skeleton';
import { ChartIcon } from './icons';

const WIDTH = 600;
const HEIGHT = 180;
const PAD_TOP = 12;
const PAD_BOTTOM = 8;
const PAD_X = 8;

/** Label sumbu ringkas agar tidak memanjang: 1.250.000 -> "1,3 jt". */
const compact = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) return '0';
    if (Math.abs(number) >= 1_000_000) return `${(number / 1_000_000).toFixed(1).replace('.', ',')} jt`;
    if (Math.abs(number) >= 1_000) return `${Math.round(number / 1_000)} rb`;

    return String(number);
};

/**
 * Kartu grafik admin — docs/design.md §4.27, docs/komponen.md §4.
 * Hanya area chart (tanpa gradien). Nilai null tidak digambar; seri kosong
 * atau semua nol tampil sebagai EmptyState, bukan garis datar yang menyesatkan.
 */
export default function ChartCard({
    title = 'Grafik',
    range = null,
    series = [],
    labels = [],
    type = 'area',
    loading = false,
    error = null,
    onRetry = null,
    emptyTitle = 'Belum ada penjualan',
    emptyDescription = null,
    emptyActionLabel = null,
    emptyActionHref = null,
    height = HEIGHT,
    valueFormatter = rupiah,
    className = '',
}) {
    const [activeIndex, setActiveIndex] = useState(null);
    const titleId = useId();

    const values = (Array.isArray(series) ? series : []).map((item) => {
        if (item && typeof item === 'object') return item.value ?? null;
        return item;
    });

    const numeric = values.map((value) => {
        const number = Number(value);
        return value === null || value === undefined || value === '' || !Number.isFinite(number) ? null : number;
    });

    const present = numeric.filter((value) => value !== null);
    const maxValue = present.length > 0 ? Math.max(...present) : 0;
    const total = present.reduce((sum, value) => sum + value, 0);
    const hasData = present.length > 0 && maxValue > 0;
    const axisMax = hasData ? maxValue : 0;

    const count = numeric.length;
    const usableWidth = WIDTH - PAD_X * 2;
    const usableHeight = height - PAD_TOP - PAD_BOTTOM;

    const xAt = (index) => (count <= 1 ? WIDTH / 2 : PAD_X + (index / (count - 1)) * usableWidth);
    const yAt = (value) => PAD_TOP + usableHeight - (axisMax > 0 ? (value / axisMax) * usableHeight : 0);

    // Pecah seri jadi segmen kontinu supaya nilai null benar-benar tidak digambar.
    const segments = [];
    let current = [];

    numeric.forEach((value, index) => {
        if (value === null) {
            if (current.length > 0) segments.push(current);
            current = [];
            return;
        }

        current.push({ index, value, x: xAt(index), y: yAt(value) });
    });

    if (current.length > 0) segments.push(current);

    const linePath = (points) =>
        points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');

    const areaPath = (points) => {
        if (points.length === 0) return '';

        const baseline = PAD_TOP + usableHeight;

        return `${linePath(points)} L${points[points.length - 1].x.toFixed(2)} ${baseline} L${points[0].x.toFixed(2)} ${baseline} Z`;
    };

    const labelAt = (index) => {
        if (!Array.isArray(labels) || labels.length === 0) return null;
        return labels[index] ?? null;
    };

    const axisLabels = (() => {
        if (count === 0) return [];
        if (count <= 4) return numeric.map((_, index) => labelAt(index));

        return [labelAt(0), labelAt(Math.floor((count - 1) / 2)), labelAt(count - 1)];
    })();

    const activePoint =
        activeIndex !== null && numeric[activeIndex] !== null && numeric[activeIndex] !== undefined
            ? { x: xAt(activeIndex), value: numeric[activeIndex], label: labelAt(activeIndex) }
            : null;

    return (
        <section
            className={cn('flex flex-col gap-4 rounded-lg border border-line bg-white p-6', className)}
            aria-labelledby={titleId}
        >
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id={titleId} className="text-label font-semibold text-ink">
                    {title}
                </h2>
                {range && <p className="text-meta text-slate-500">{range}</p>}
            </div>

            {loading && (
                <div className="flex flex-col gap-3" aria-busy="true">
                    <Skeleton variant="title" className="h-4 w-1/4" />
                    <Skeleton variant="text" className="h-[180px] w-full" />
                </div>
            )}

            {!loading && error && (
                <ErrorState
                    title="Gagal memuat grafik"
                    description={typeof error === 'string' ? error : 'Periksa koneksi Anda lalu coba lagi.'}
                    onRetry={onRetry}
                    supportHref={null}
                />
            )}

            {!loading && !error && !hasData && (
                <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    actionLabel={emptyActionLabel}
                    actionHref={emptyActionHref}
                    icon={<ChartIcon size={72} />}
                    className="py-8"
                />
            )}

            {!loading && !error && hasData && (
                <div className="relative">
                    <svg
                        role="img"
                        aria-label={`${title}${range ? ` ${range}` : ''}: total ${valueFormatter(total)}`}
                        viewBox={`0 0 ${WIDTH} ${height}`}
                        width="100%"
                        height={height}
                        preserveAspectRatio="none"
                        className="block text-brand"
                        onMouseLeave={() => setActiveIndex(null)}
                    >
                        {[0, 0.5, 1].map((ratio) => {
                            const y = PAD_TOP + usableHeight * ratio;

                            return (
                                <line
                                    key={ratio}
                                    x1={PAD_X}
                                    x2={WIDTH - PAD_X}
                                    y1={y}
                                    y2={y}
                                    stroke="currentColor"
                                    strokeWidth="1"
                                    vectorEffect="non-scaling-stroke"
                                    className="text-line"
                                    aria-hidden="true"
                                />
                            );
                        })}

                        {type === 'area' &&
                            segments.map((points, index) => (
                                <path
                                    key={`area-${index}`}
                                    d={areaPath(points)}
                                    fill="currentColor"
                                    fillOpacity="0.12"
                                    stroke="none"
                                    aria-hidden="true"
                                />
                            ))}

                        {segments.map((points, index) => (
                            <path
                                key={`line-${index}`}
                                d={linePath(points)}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                vectorEffect="non-scaling-stroke"
                                aria-hidden="true"
                            />
                        ))}

                        {numeric.map((value, index) =>
                            value === null ? null : (
                                <circle
                                    key={`point-${index}`}
                                    cx={xAt(index)}
                                    cy={yAt(value)}
                                    r={activeIndex === index ? 4 : 2.5}
                                    fill="currentColor"
                                    aria-hidden="true"
                                />
                            )
                        )}

                        {numeric.map((value, index) =>
                            value === null ? null : (
                                <rect
                                    key={`hit-${index}`}
                                    x={xAt(index) - usableWidth / Math.max(count, 1) / 2}
                                    y={PAD_TOP}
                                    width={usableWidth / Math.max(count, 1)}
                                    height={usableHeight}
                                    fill="transparent"
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onFocus={() => setActiveIndex(index)}
                                    tabIndex={0}
                                    role="img"
                                    aria-label={`${labelAt(index) ?? `Titik ${index + 1}`}: ${valueFormatter(value)}`}
                                    className="outline-none"
                                />
                            )
                        )}
                    </svg>

                    {activePoint && (
                        <div
                            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-md border border-line bg-white px-2 py-1 text-meta text-ink shadow-raised"
                            style={{
                                left: `${(activePoint.x / WIDTH) * 100}%`,
                                top: `${(activePoint.y / height) * 100}%`,
                            }}
                        >
                            {activePoint.label && <span className="text-slate-500">{activePoint.label} · </span>}
                            {valueFormatter(activePoint.value)}
                        </div>
                    )}

                    {axisLabels.length > 0 && (
                        <div className="mt-2 flex justify-between text-meta text-slate-500" aria-hidden="true">
                            {axisLabels.map((label, index) => (
                                <span key={index}>{label ?? ''}</span>
                            ))}
                        </div>
                    )}

                    <p className="mt-1 text-meta text-slate-500">Tertinggi {compact(axisMax)}</p>
                </div>
            )}
        </section>
    );
}

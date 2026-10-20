import React, { useState } from 'react';
import { cn, formatNumber } from '../lib/format';
import { StarIcon } from './icons';

const SIZES = { sm: 14, md: 20, lg: 32 };

const stars = (size, filled) =>
    [0, 1, 2, 3, 4].map((index) => <StarIcon key={index} size={size} filled={filled} />);

/**
 * Rating bintang (docs/komponen.md §4.3).
 * readOnly: tampilan dengan aria-label "Rating 4,5 dari 5".
 * Interaktif: tombol bintang dengan aria-pressed + navigasi panah (design §4.3).
 */
export default function StarRating({
    value = 0,
    size = 'sm',
    readOnly = true,
    count = null,
    onChange,
    label = null,
}) {
    const px = SIZES[size] ?? SIZES.sm;
    const clamped = Math.max(0, Math.min(5, Number(value) || 0));
    const [preview, setPreview] = useState(0);
    const shown = preview || clamped;
    const readable = clamped.toFixed(1).replace('.', ',');

    if (readOnly) {
        return (
            <span className="inline-flex items-center gap-1.5">
                <span
                    className="relative inline-flex"
                    role="img"
                    aria-label={label ?? `Rating ${readable} dari 5`}
                    style={{ height: px }}
                >
                    <span className="flex gap-0.5 text-slate-300">{stars(px, false)}</span>
                    <span
                        className="absolute inset-y-0 left-0 flex gap-0.5 overflow-hidden text-accent-500"
                        style={{ width: `${(clamped / 5) * 100}%` }}
                        aria-hidden="true"
                    >
                        {stars(px, true)}
                    </span>
                </span>
                {count !== null && count !== undefined && (
                    <span className="text-meta text-slate-400">({formatNumber(count)})</span>
                )}
            </span>
        );
    }

    const step = (delta) => {
        const next = Math.max(1, Math.min(5, Math.round(shown) + delta));
        onChange?.(next);
    };

    return (
        <div
            className="inline-flex items-center gap-0.5"
            role="group"
            aria-label={label ?? 'Pilih rating'}
            onMouseLeave={() => setPreview(0)}
            onKeyDown={(event) => {
                if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
                    event.preventDefault();
                    step(1);
                } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
                    event.preventDefault();
                    step(-1);
                }
            }}
        >
            {[1, 2, 3, 4, 5].map((index) => (
                <button
                    key={index}
                    type="button"
                    className={cn(
                        'inline-flex h-touch w-touch items-center justify-center rounded-sm transition-colors duration-hover',
                        'hover:bg-surface'
                    )}
                    aria-label={`${index} dari 5 bintang`}
                    aria-pressed={clamped >= index}
                    onMouseEnter={() => setPreview(index)}
                    onFocus={() => setPreview(index)}
                    onBlur={() => setPreview(0)}
                    onClick={() => onChange?.(index)}
                >
                    <StarIcon size={px} filled={index <= shown} className={index <= shown ? 'text-accent-500' : 'text-slate-300'} />
                </button>
            ))}
        </div>
    );
}

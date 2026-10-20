import React from 'react';
import { cn } from '../lib/format';
import { StarIcon } from './icons';

function Stars({ value = 0 }) {
    return (
        <span className="inline-flex items-center gap-0.5" aria-label={'Rating ' + value + ' dari 5'}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={star <= Math.round(Number(value) || 0) ? 'text-accent-500' : 'text-slate-300'}>
                    <StarIcon filled={star <= Math.round(Number(value) || 0)} width={14} height={14} />
                </span>
            ))}
        </span>
    );
}

function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** ReviewCard - docs/design.md 4.8. Nama, rating, tanggal, isi, balasan toko. */
export default function ReviewCard({ review = null, className = '' }) {
    if (!review) return null;

    const name = review.user_name || review.name || 'Pembeli';
    const initial = name.trim().charAt(0).toUpperCase() || 'P';
    const date = formatDate(review.created_at);

    return (
        <article className={cn('border-b border-line py-4 last:border-b-0', className)}>
            <header className="flex items-center gap-3">
                <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-meta font-semibold text-brand-700"
                    aria-hidden="true"
                >
                    {initial}
                </span>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-meta font-semibold text-ink">{name}</p>
                    <div className="flex items-center gap-2">
                        <Stars value={review.rating} />
                        {date && <time className="text-meta text-slate-400">{date}</time>}
                    </div>
                </div>
            </header>

            {review.comment && (
                <p className="mt-2 whitespace-pre-line text-body text-ink-soft">{review.comment}</p>
            )}

            {review.reply && (
                <div className="mt-3 rounded-md bg-surface p-3">
                    <p className="text-meta font-semibold text-ink">Balasan Toko</p>
                    <p className="mt-1 whitespace-pre-line text-meta text-ink-soft">{review.reply}</p>
                </div>
            )}
        </article>
    );
}

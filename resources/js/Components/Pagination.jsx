import React from 'react';
import { cn } from '../lib/format';

function buildPages(current, last) {
    const pages = [];
    const push = (value) => {
        if (value >= 1 && value <= last && !pages.includes(value)) pages.push(value);
    };
    push(1);
    for (let page = current - 1; page <= current + 1; page += 1) push(page);
    push(last);
    return pages.sort((a, b) => a - b);
}

function Chevron({ direction }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {direction === 'left' ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}
        </svg>
    );
}

/** Pagination - docs/design.md 4.22. Tombol 36x36, aktif bg-brand-700. */
export default function Pagination({ currentPage = 1, lastPage = 1, onPageChange = null, className = '' }) {
    const current = Math.max(1, Number(currentPage) || 1);
    const last = Math.max(1, Number(lastPage) || 1);
    if (last <= 1 || typeof onPageChange !== 'function') return null;

    const go = (page) => {
        if (page < 1 || page > last || page === current) return;
        onPageChange(page);
    };

    const base =
        'inline-flex h-9 w-9 items-center justify-center rounded-sm text-meta transition-colors duration-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';
    const pages = buildPages(current, last);

    return (
        <nav aria-label="Navigasi halaman" className={cn('flex items-center justify-center gap-1', className)}>
            <button
                type="button"
                onClick={() => go(current - 1)}
                disabled={current <= 1}
                aria-label="Halaman sebelumnya"
                className={cn(base, 'text-slate-400 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-45')}
            >
                <Chevron direction="left" />
            </button>

            <span className="px-2 text-meta text-ink-soft sm:hidden" aria-live="polite">
                {current} / {last}
            </span>

            <div className="hidden items-center gap-1 sm:flex">
                {pages.map((page, index) => {
                    const previous = pages[index - 1];
                    const gap = previous && page - previous > 1;
                    return (
                        <React.Fragment key={page}>
                            {gap && (
                                <span className="px-1 text-meta text-slate-400" aria-hidden="true">
                                    ...
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={() => go(page)}
                                aria-current={page === current ? 'page' : undefined}
                                aria-label={'Halaman ' + page}
                                className={cn(
                                    base,
                                    page === current ? 'bg-brand-700 text-white' : 'text-ink hover:bg-surface'
                                )}
                            >
                                {page}
                            </button>
                        </React.Fragment>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={() => go(current + 1)}
                disabled={current >= last}
                aria-label="Halaman berikutnya"
                className={cn(base, 'text-slate-400 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-45')}
            >
                <Chevron direction="right" />
            </button>
        </nav>
    );
}

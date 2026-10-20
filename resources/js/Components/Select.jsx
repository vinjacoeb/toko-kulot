import React from 'react';
import { cn } from '../lib/format';

const BASE =
    'w-full h-field appearance-none rounded-md border border-line bg-white pl-3.5 pr-10 text-body text-ink transition-colors duration-hover focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface';

/** Select native bergaya h-field + chevron - docs/design.md 4.19. */
export default function Select({ error = null, className = '', id = null, children, ...rest }) {
    return (
        <span className="relative block">
            <select
                id={id}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error && id ? id + '-error' : undefined}
                className={cn(BASE, error ? 'border-danger' : null, className)}
                {...rest}
            >
                {children}
            </select>
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
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            >
                <path d="M6 9l6 6 6-6" />
            </svg>
        </span>
    );
}

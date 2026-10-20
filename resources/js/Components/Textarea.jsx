import React from 'react';
import { cn } from '../lib/format';

const BASE =
    'w-full min-h-[120px] resize-y rounded-md border border-line bg-white px-3.5 py-3 text-body text-ink transition-colors duration-hover placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface';

/** Textarea - docs/design.md 4.5 (min 120px, resize-y). */
export default function Textarea({ error = null, className = '', id = null, ...rest }) {
    return (
        <textarea
            id={id}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error && id ? id + '-error' : undefined}
            className={cn(BASE, error ? 'border-danger' : null, className)}
            {...rest}
        />
    );
}

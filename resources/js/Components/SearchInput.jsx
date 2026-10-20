import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/format';
import { CloseIcon, SearchIcon } from './icons';

/** SearchInput - docs/design.md 4.19. Debounce 300ms sebelum memanggil onChange. */
export default function SearchInput({
    value = '',
    onChange = null,
    placeholder = 'Cari produk',
    label = 'Cari produk',
    loading = false,
    className = '',
}) {
    const [text, setText] = useState(value);
    const mounted = useRef(false);

    useEffect(() => {
        setText(value);
    }, [value]);

    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            return undefined;
        }
        const timer = window.setTimeout(() => {
            if (typeof onChange === 'function') onChange(text.trim());
        }, 300);
        return () => window.clearTimeout(timer);
    }, [text]);

    return (
        <div className={cn('relative', className)}>
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">
                <SearchIcon width={18} height={18} />
            </span>
            <input
                type="search"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder={placeholder}
                aria-label={label}
                aria-busy={loading ? 'true' : undefined}
                className="h-field w-full rounded-md border border-line bg-white pl-10 pr-10 text-body text-ink transition-colors duration-hover placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15"
            />
            {text.length > 0 && (
                <button
                    type="button"
                    onClick={() => setText('')}
                    aria-label="Bersihkan pencarian"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1.5 text-slate-400 transition-colors duration-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                    <CloseIcon width={16} height={16} />
                </button>
            )}
        </div>
    );
}

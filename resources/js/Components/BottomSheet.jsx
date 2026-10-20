import React, { useEffect, useRef } from 'react';
import { cn } from '../lib/format';
import { CloseIcon } from './icons';

/** BottomSheet 80vh - docs/design.md 4.18. Esc menutup, scroll body dikunci. */
export default function BottomSheet({ open = false, onClose = null, title = null, children, footer = null }) {
    const panelRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKeyDown = (event) => {
            if (event.key === 'Escape' && typeof onClose === 'function') onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        if (panelRef.current) panelRef.current.focus();
        return () => {
            document.body.style.overflow = previous;
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-modal lg:hidden">
            <button
                type="button"
                aria-label="Tutup filter"
                onClick={() => typeof onClose === 'function' && onClose()}
                className="absolute inset-0 h-full w-full cursor-default bg-black/50"
            />
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={title ?? 'Filter'}
                tabIndex={-1}
                className={cn(
                    'absolute inset-x-0 bottom-0 flex max-h-[80vh] flex-col rounded-t-xl bg-white shadow-raised',
                    'focus:outline-none'
                )}
            >
                <div className="flex items-center justify-between border-b border-line px-5 py-3">
                    <span className="mx-auto h-1 w-10 rounded-full bg-line" aria-hidden="true" />
                    <span className="sr-only">{title ?? 'Filter'}</span>
                </div>
                {title && (
                    <div className="flex items-center justify-between px-5 pt-3">
                        <h2 className="text-h3 text-ink">{title}</h2>
                        <button
                            type="button"
                            onClick={() => typeof onClose === 'function' && onClose()}
                            aria-label="Tutup"
                            className="rounded-sm p-2 text-slate-400 transition-colors duration-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                        >
                            <CloseIcon width={18} height={18} />
                        </button>
                    </div>
                )}
                <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
                {footer && <div className="border-t border-line p-4">{footer}</div>}
            </div>
        </div>
    );
}

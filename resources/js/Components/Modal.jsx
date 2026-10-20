import React, { useEffect, useRef } from 'react';
import { cn } from '../lib/format';
import { useBodyScrollLock, useFocusTrap } from '../lib/hooks';
import { CloseIcon } from './icons';

const SIZES = {
    md: 'max-w-modal',
    lg: 'max-w-modalLg',
};

/**
 * Modal dasar — docs/design.md §4.24 (turunan: `ConfirmDialog`).
 * Overlay gelap, Esc menutup, klik overlay menutup, fokus terperangkap,
 * scroll body dikunci, `aria-modal="true"`.
 */
export default function Modal({
    open = false,
    title = null,
    description = null,
    children = null,
    footer = null,
    onClose,
    size = 'md',
    closeLabel = 'Tutup',
}) {
    const panelRef = useRef(null);

    useBodyScrollLock(open);
    useFocusTrap(panelRef, open);

    useEffect(() => {
        if (!open) return undefined;

        const onKeyDown = (event) => {
            if (event.key === 'Escape') onClose?.();
        };

        document.addEventListener('keydown', onKeyDown);

        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose?.();
            }}
        >
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
                tabIndex={-1}
                className={cn(
                    'w-full rounded-xl bg-white p-6 shadow-raised animate-modal-in',
                    SIZES[size] ?? SIZES.md
                )}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        {title && (
                            <h2 id="modal-title" className="text-h3 text-ink">
                                {title}
                            </h2>
                        )}
                        {description && <p className="mt-1 text-meta text-ink-soft">{description}</p>}
                    </div>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label={closeLabel}
                            className="-mr-2 -mt-1 inline-flex h-touch w-touch items-center justify-center rounded-md text-ink-soft transition-colors duration-hover hover:bg-surface"
                        >
                            <CloseIcon size={20} />
                        </button>
                    )}
                </div>

                {children && <div className="mt-4 text-body text-ink">{children}</div>}
                {footer && <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div>}
            </div>
        </div>
    );
}

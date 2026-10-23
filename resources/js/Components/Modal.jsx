import React, { useEffect, useRef } from 'react';
import { cn } from '../lib/format';
import { useBodyScrollLock, useFocusTrap } from '../lib/hooks';
import { CloseIcon } from './icons';

const SIZES = {
    md: 'max-w-modal',
    lg: 'max-w-modalLg',
};

/**
 * Modal dasar — docs/design.md §4.9 (turunan: `ConfirmDialog`).
 * Overlay gelap, Esc menutup, klik overlay menutup, fokus terperangkap,
 * scroll body dikunci, `aria-modal="true"`.
 *
 * Tinggi panel dibatasi viewport (`max-h-[calc(100dvh-2rem)]`); hanya area isi yang
 * digulir, sehingga header dan footer (tombol Simpan/Batal) selalu terlihat dan dapat
 * diklik di layar pendek — form panjang tidak lagi terpotong (docs/rencana-perbaikan-5.md
 * butir 4). Overlay tetap dapat digulir bila panel lebih tinggi dari viewport.
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

    const adaIsi = Boolean(children);
    const adaFooter = Boolean(footer);

    return (
        <div
            className="fixed inset-0 z-modal overflow-y-auto bg-black/50"
            onMouseDown={(event) => {
                // Klik di luar panel (termasuk bantalan overlay) menutup modal.
                if (!panelRef.current?.contains(event.target)) onClose?.();
            }}
        >
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    ref={panelRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={title ? 'modal-title' : undefined}
                    tabIndex={-1}
                    className={cn(
                        'flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-xl bg-white shadow-raised animate-modal-in',
                        SIZES[size] ?? SIZES.md
                    )}
                >
                    <div
                        className={cn(
                            'flex shrink-0 items-start justify-between gap-4 px-6 pt-6',
                            !adaIsi && !adaFooter && 'pb-6'
                        )}
                    >
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

                    {adaIsi && (
                        <div
                            className={cn(
                                'min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-4 text-body text-ink',
                                !adaFooter && 'pb-6'
                            )}
                        >
                            {children}
                        </div>
                    )}

                    {adaFooter && (
                        <div className="shrink-0 px-6 pb-6 pt-4">
                            <div className="flex flex-wrap justify-end gap-3">{footer}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

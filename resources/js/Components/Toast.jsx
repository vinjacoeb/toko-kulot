import React, { useEffect } from 'react';
import { cn } from '../lib/format';
import { AlertIcon, CheckIcon, CloseIcon, SearchIcon } from './icons';

const TONES = {
    info: { bar: 'border-l-brand', icon: SearchIcon, color: 'text-brand' },
    success: { bar: 'border-l-success', icon: CheckIcon, color: 'text-success' },
    warning: { bar: 'border-l-warning', icon: AlertIcon, color: 'text-warning' },
    error: { bar: 'border-l-danger', icon: AlertIcon, color: 'text-danger' },
};

/**
 * Notifikasi mengambang — docs/komponen.md §3, design §6 (`animate-fade-up`, `z-toast`).
 * Penumpukan maksimal 3 diatur pemanggil.
 */
export default function Toast({
    tone = 'info',
    title = null,
    message = null,
    duration = 4000,
    onClose = null,
}) {
    const config = TONES[tone] ?? TONES.info;
    const Icon = config.icon;

    useEffect(() => {
        if (!duration || !onClose) return undefined;

        const id = window.setTimeout(onClose, duration);

        return () => window.clearTimeout(id);
    }, [duration, onClose]);

    return (
        <div
            role={tone === 'error' ? 'alert' : 'status'}
            className={cn(
                'pointer-events-auto flex w-full max-w-[360px] items-start gap-3 rounded-md border border-line border-l-[3px] bg-white p-4 shadow-raised animate-fade-up',
                config.bar
            )}
        >
            <span className={cn('mt-0.5 shrink-0', config.color)} aria-hidden="true">
                <Icon size={20} />
            </span>
            <div className="min-w-0 flex-1">
                {title && <p className="text-label text-ink">{title}</p>}
                {message && <p className="text-meta text-ink-soft">{message}</p>}
            </div>
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Tutup notifikasi"
                    className="shrink-0 rounded-sm p-1 text-ink-soft transition-colors duration-hover hover:bg-surface"
                >
                    <CloseIcon size={16} />
                </button>
            )}
        </div>
    );
}

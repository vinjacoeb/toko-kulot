import React from 'react';
import { cn } from '../lib/format';
import { AlertIcon, CheckIcon, CloseIcon, SearchIcon } from './icons';

const TONES = {
    info: 'bg-brand-100 text-ink',
    success: 'bg-success/10 text-ink',
    warning: 'bg-warning/10 text-ink',
    error: 'bg-red-50 border border-danger text-ink',
};

const ICONS = {
    info: SearchIcon,
    success: CheckIcon,
    warning: AlertIcon,
    error: AlertIcon,
};

const ICON_TONES = {
    info: 'text-brand',
    success: 'text-success-strong',
    warning: 'text-warning-strong',
    error: 'text-danger',
};

/**
 * Pesan sebaris — docs/komponen.md §1, docs/design.md §4.23.
 * `role="alert"` untuk error, `role="status"` untuk tone lain.
 */
export default function InlineNotice({
    tone = 'info',
    title = null,
    children = null,
    onDismiss = null,
    className = '',
}) {
    const Icon = ICONS[tone] ?? ICONS.info;

    return (
        <div
            role={tone === 'error' ? 'alert' : 'status'}
            className={cn('flex items-start gap-3 rounded-md p-4', TONES[tone] ?? TONES.info, className)}
        >
            <span className={cn('mt-0.5 shrink-0', ICON_TONES[tone] ?? ICON_TONES.info)} aria-hidden="true">
                <Icon size={20} />
            </span>
            <div className="min-w-0 flex-1">
                {title && <p className="text-label">{title}</p>}
                {children && <div className="text-meta text-ink-soft">{children}</div>}
            </div>
            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    aria-label="Tutup pesan"
                    className="shrink-0 rounded-sm p-1 text-ink-soft transition-colors duration-hover hover:bg-white/60"
                >
                    <CloseIcon size={16} />
                </button>
            )}
        </div>
    );
}

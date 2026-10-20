import React from 'react';
import { cn } from '../lib/format';
import Button from './Button';
import { AlertIcon } from './icons';

/**
 * Kondisi gagal — docs/design.md §4.23. Selalu dirender di dalam layout,
 * header/footer tetap tampil; menyediakan "Coba lagi" + tautan bantuan.
 */
export default function ErrorState({
    title = 'Gagal memuat data',
    description = 'Periksa koneksi Anda lalu coba lagi.',
    onRetry = null,
    supportHref = '/kontak-kami',
    retryLabel = 'Coba lagi',
    supportLabel = 'Hubungi kami',
    className = '',
}) {
    return (
        <div
            role="alert"
            className={cn('flex flex-col items-center gap-3 py-12 text-center', className)}
        >
            <span className="text-danger" aria-hidden="true">
                <AlertIcon size={48} />
            </span>
            <p className="text-h3 text-ink">{title}</p>
            {description && <p className="max-w-sm text-meta text-slate-600">{description}</p>}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                {onRetry && (
                    <Button variant="primary" onClick={onRetry}>
                        {retryLabel}
                    </Button>
                )}
                {supportHref && (
                    <Button variant="secondary" href={supportHref}>
                        {supportLabel}
                    </Button>
                )}
            </div>
        </div>
    );
}

import React from 'react';
import { cn, rupiah } from '../lib/format';
import Button from './Button';

/**
 * Ringkasan pesanan — design §4.28, docs/komponen.md §3.
 * Kartu `rounded-xl` 320px sticky, baris Subtotal / Ongkir / Total (20px 700),
 * CTA `primary` full-width, catatan "Pembayaran QRIS".
 *
 * Angka selalu dari server (kontrak §7.0/§7.5/§7.7/§7.9); nilai kosong tampil "-".
 * `ctaHref` = tombol tautan Inertia, `onSubmit` + `formId` = tombol kirim formulir.
 */
export default function OrderSummary({
    subtotal = null,
    shipping = null,
    total = null,
    ctaLabel = null,
    ctaHref = null,
    onSubmit = null,
    formId = null,
    loading = false,
    disabled = false,
    note = 'Pembayaran QRIS',
    className = '',
    children = null,
}) {
    const row = 'flex items-baseline justify-between gap-4';

    return (
        <section className={cn('card p-6', className)} aria-label="Ringkasan pesanan">
            <h2 className="text-h3 text-ink">Ringkasan Pesanan</h2>

            <dl className="mt-4 flex flex-col gap-3">
                <div className={row}>
                    <dt className="text-body text-ink-soft">Subtotal</dt>
                    <dd className="text-body text-ink">{rupiah(subtotal) ?? '-'}</dd>
                </div>
                <div className={row}>
                    <dt className="text-body text-ink-soft">Ongkir</dt>
                    <dd className="text-body text-ink">{rupiah(shipping) ?? '-'}</dd>
                </div>
                <div className={cn(row, 'mt-1 border-t border-line pt-4')}>
                    <dt className="text-body font-bold text-ink">Total</dt>
                    <dd className="text-[20px] font-bold leading-none text-ink">{rupiah(total) ?? '-'}</dd>
                </div>
            </dl>

            {children}

            {ctaLabel && (ctaHref || onSubmit) && (
                <div className="mt-5">
                    {onSubmit ? (
                        <Button
                            type={formId ? 'submit' : 'button'}
                            form={formId ?? undefined}
                            fullWidth
                            loading={loading}
                            disabled={disabled}
                            onClick={formId ? undefined : onSubmit}
                        >
                            {ctaLabel}
                        </Button>
                    ) : (
                        <Button href={ctaHref} fullWidth loading={loading}>
                            {ctaLabel}
                        </Button>
                    )}
                </div>
            )}

            {note && <p className="mt-3 text-meta text-slate-500">{note}</p>}
        </section>
    );
}

import React from 'react';
import { cn, formatNumber, rupiah } from '../lib/format';
import Button from './Button';

/**
 * Ringkasan pesanan — design §5.1, §6.2; docs/komponen.md §3.
 * Baris opsional daftar item (gambar 48px, nama, varian, qty, line total) lalu
 * Subtotal / Ongkir / Total, CTA `primary` full-width, catatan di bawah CTA.
 *
 * Angka selalu dari server (kontrak §7.0/§7.5/§7.7/§7.9); nilai kosong tampil "-".
 * `ctaHref` = tombol tautan Inertia, `onSubmit` + `formId` = tombol kirim formulir.
 * `shippingText` mengganti nominal ongkir dengan teks ("—" saat tarif belum siap);
 * `shippingBadge` = badge di samping nominal; `helper` = penjelas di bawah total;
 * `ctaLabel` null = ringkasan tanpa tombol (varian mobile di atas Catatan).
 * `items` = `keranjang.items` (§7.0), hanya dirender bila diberikan.
 */
export default function OrderSummary({
    items = null,
    subtotal = null,
    shipping = null,
    total = null,
    shippingText = null,
    shippingBadge = null,
    totalLabel = 'Total',
    helper = null,
    ctaLabel = null,
    ctaHref = null,
    onSubmit = null,
    formId = null,
    loading = false,
    disabled = false,
    note = null,
    className = '',
    children = null,
}) {
    const row = 'flex items-baseline justify-between gap-4';
    const teksOngkir = typeof shippingText === 'string' && shippingText.trim() !== '' ? shippingText : null;
    const daftarItem = Array.isArray(items) ? items : [];

    return (
        <section className={cn('card p-6', className)} aria-label="Ringkasan pesanan">
            <h2 className="text-h3 text-ink">Ringkasan Pesanan</h2>

            {daftarItem.length > 0 && (
                <ul className="mt-4 flex flex-col gap-3 border-b border-line pb-4">
                    {daftarItem.map((item, index) => (
                        <li key={item?.id ?? index} className="flex items-start gap-3">
                            <span className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-surface">
                                {item?.image ? (
                                    <img src={item.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                                ) : null}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-body text-ink">{item?.name ?? '-'}</span>
                                {item?.variant_label ? (
                                    <span className="block text-meta text-slate-500">{item.variant_label}</span>
                                ) : null}
                                <span className="block text-meta text-slate-500">
                                    <span className="tabular-nums">{formatNumber(item?.qty ?? 0) ?? '-'}</span> ×{' '}
                                    <span className="tabular-nums">{rupiah(item?.unit_price) ?? '-'}</span>
                                </span>
                            </span>
                            <span className="shrink-0 whitespace-nowrap text-body font-semibold text-ink tabular-nums">
                                {rupiah(item?.line_total) ?? '-'}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            <dl className={cn('flex flex-col gap-3', daftarItem.length > 0 ? 'mt-4' : 'mt-4')}>
                <div className={row}>
                    <dt className="text-body text-ink-soft">Subtotal</dt>
                    <dd className="text-body text-ink tabular-nums">{rupiah(subtotal) ?? '-'}</dd>
                </div>
                <div className={row}>
                    <dt className="text-body text-ink-soft">Ongkir</dt>
                    <dd className="flex items-baseline justify-end gap-2 text-body text-ink">
                        <span className="whitespace-nowrap tabular-nums" aria-live="polite">
                            {teksOngkir ?? rupiah(shipping) ?? '-'}
                        </span>
                        {shippingBadge}
                    </dd>
                </div>
                <div className={cn(row, 'mt-1 border-t border-line pt-4')}>
                    <dt className="text-body font-bold text-ink">{totalLabel}</dt>
                    <dd className="whitespace-nowrap text-h3 font-bold text-ink tabular-nums" aria-live="polite">
                        {rupiah(total) ?? '-'}
                    </dd>
                </div>
            </dl>

            {helper && <p className="mt-2 text-meta tabular-nums text-slate-500">{helper}</p>}

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

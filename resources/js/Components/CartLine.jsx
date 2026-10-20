import React, { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { cn, rupiah } from '../lib/format';
import IconButton from './IconButton';
import InlineNotice from './InlineNotice';
import QtyStepper from './QtyStepper';
import Spinner from './Spinner';
import { ImageOffIcon, TrashIcon } from './icons';

/**
 * Satu baris keranjang — design §4.28, docs/komponen.md §3.
 * Bentuk data mengikuti kontrak props §7.0: `unit_price`, `line_total`, `variant_label`,
 * `stock`, `image`, `is_active`. Angka dari server bisa string → dikonversi aman.
 */
export default function CartLine({
    item = null,
    updating = false,
    onQtyChange = null,
    onRemove = null,
    className = '',
}) {
    const image = item?.image ?? null;
    const [imageFailed, setImageFailed] = useState(false);

    useEffect(() => {
        setImageFailed(false);
    }, [image]);

    if (!item) return null;

    const name = item.name ?? 'Produk';
    const slug = item.slug ?? null;
    const variantLabel = item.variant_label ?? null;
    const isActive = item.is_active !== false;
    const stock = Number(item.stock ?? 0);
    const qty = Number(item.qty ?? 0);
    const safeStock = Number.isFinite(stock) ? stock : 0;
    const maxQty = Math.max(1, Math.min(safeStock, 99));
    const unitPrice = rupiah(item.unit_price);
    const lineTotal = rupiah(item.line_total);
    const stepperId = `qty-item-${item.id ?? 'x'}`;
    const outOfStock = safeStock < 1;

    return (
        <li
            className={cn('border-b border-line py-5 last:border-b-0', className)}
            aria-busy={updating ? 'true' : undefined}
        >
            <div className="grid grid-cols-[80px_1fr] gap-4 lg:grid-cols-[80px_1fr_auto] lg:items-start lg:gap-5">
                <div className="h-cartThumb w-cartThumb overflow-hidden rounded-md bg-surface">
                    {image && !imageFailed ? (
                        <img
                            src={image}
                            alt=""
                            width="80"
                            height="80"
                            className="h-full w-full object-cover"
                            onError={() => setImageFailed(true)}
                        />
                    ) : (
                        <span className="flex h-full w-full items-center justify-center text-slate-300" aria-hidden="true">
                            <ImageOffIcon size={28} />
                        </span>
                    )}
                </div>

                <div className="min-w-0">
                    {slug ? (
                        <Link href={`/produk/${slug}`} className="text-h3 text-ink underline-offset-4 hover:text-brand hover:underline">
                            {name}
                        </Link>
                    ) : (
                        <p className="text-h3 text-ink">{name}</p>
                    )}

                    {variantLabel && <p className="mt-1 text-meta text-slate-500">{variantLabel}</p>}

                    <p className="mt-2 text-meta text-slate-500">
                        {unitPrice ?? '-'} <span className="text-slate-500">/ pcs</span>
                    </p>

                    {!isActive && (
                        <InlineNotice tone="warning" className="mt-3">
                            Produk ini sudah tidak dijual lagi. Hapus dari keranjang untuk melanjutkan.
                        </InlineNotice>
                    )}

                    <div className="mt-3 flex items-center gap-3 lg:hidden">
                        <QtyStepper
                            id={stepperId}
                            label={`Jumlah ${name}`}
                            value={qty}
                            max={maxQty}
                            disabled={updating || !isActive || outOfStock}
                            onChange={(next) => onQtyChange && onQtyChange(item, next)}
                        />
                        {updating && <Spinner label="Memperbarui jumlah" className="text-brand" />}
                    </div>
                </div>

                <div className="col-span-2 flex items-end justify-between gap-4 border-t border-line pt-3 lg:col-span-1 lg:flex-col lg:items-end lg:border-0 lg:pt-0">
                    <div className="hidden lg:block">
                        <QtyStepper
                            id={`${stepperId}-lg`}
                            label={`Jumlah ${name}`}
                            value={qty}
                            max={maxQty}
                            disabled={updating || !isActive || outOfStock}
                            onChange={(next) => onQtyChange && onQtyChange(item, next)}
                        />
                    </div>

                    <div className="min-w-0 lg:text-right">
                        <p className="text-meta text-slate-500 lg:hidden">Subtotal</p>
                        <p className="text-h3 text-ink">{lineTotal ?? '-'}</p>
                        {updating && (
                            <span className="mt-1 flex items-center gap-2 text-meta text-slate-500 lg:justify-end">
                                <Spinner size={16} label="Memperbarui jumlah" className="hidden lg:inline-block" />
                                <span className="lg:hidden">Memperbarui…</span>
                            </span>
                        )}
                    </div>

                    <IconButton
                        label={`Hapus ${name} dari keranjang`}
                        className="text-danger disabled:opacity-45"
                        disabled={updating}
                        onClick={() => onRemove && onRemove(item)}
                    >
                        <TrashIcon />
                    </IconButton>
                </div>
            </div>
        </li>
    );
}

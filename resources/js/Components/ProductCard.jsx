import React, { useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import { cn, rupiah, formatNumber } from '../lib/format';
import { ImageOffIcon } from './icons';
import StarRating from './StarRating';

/**
 * Kartu produk — docs/design.md §4.2, docs/komponen.md §1.
 * Props `product` mengikuti kolom `products` (docs/db.md, PRD §6):
 * id, slug, name, base_price, wholesale_price, min_wholesale_qty,
 * rating_avg, rating_count, images[] ({ path, alt, is_primary }), category ({ name }).
 */
export default function ProductCard({ product, onAddToCart = null, priority = false }) {
    const [broken, setBroken] = useState(false);

    const images = useMemo(() => {
        const list = Array.isArray(product?.images) ? product.images : [];
        return list
            .map((image) => (typeof image === 'string' ? { path: image, alt: '' } : image ?? null))
            .filter((image) => image && image.path);
    }, [product]);

    const primary = useMemo(() => {
        return images.find((image) => image.is_primary) ?? images[0] ?? null;
    }, [images]);

    const hoverImage = images.length > 1 ? images[1] : null;

    const name = product?.name ?? 'Produk';
    const href = product?.slug ? `/produk/${product.slug}` : '/produk';
    const price = rupiah(product?.base_price);
    const ratingValue = Number(product?.rating_avg ?? 0) || 0;
    const ratingCount = Number(product?.rating_count ?? 0) || 0;
    const wholesalePrice = rupiah(product?.wholesale_price);
    const minWholesale = Number(product?.min_wholesale_qty ?? 0) || 0;
    const stock = product?.stock ?? null;
    const soldOut = stock !== null && Number(stock) <= 0;

    const handleAdd = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (soldOut || !onAddToCart) return;
        onAddToCart(product);
    };

    return (
        <article className="group flex flex-col overflow-hidden rounded-md border border-line bg-white transition-shadow hover:shadow-raised">
            <Link href={href} className="relative block aspect-square bg-surface">
                {primary && !broken ? (
                    <>
                        <img
                            src={primary.path}
                            alt={primary.alt ?? name}
                            loading={priority ? 'eager' : 'lazy'}
                            decoding="async"
                            onError={() => setBroken(true)}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none"
                        />
                        {hoverImage && (
                            <img
                                src={hoverImage.path}
                                alt=""
                                aria-hidden="true"
                                loading="lazy"
                                decoding="async"
                                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:hidden"
                            />
                        )}
                    </>
                ) : (
                    <span className="flex h-full w-full items-center justify-center text-slate-400">
                        <ImageOffIcon size={32} />
                    </span>
                )}

                {soldOut && (
                    <span className="absolute inset-0 flex items-center justify-center bg-white/60">
                        <span className="rounded-sm bg-ink px-3 py-1 text-label text-white">
                            Habis
                        </span>
                    </span>
                )}

                {!soldOut && wholesalePrice && minWholesale > 0 && (
                    <span className="absolute left-2 top-2 rounded-sm bg-accent-500 px-2 py-1 text-badge text-ink">
                        {`Grosir ${formatNumber(minWholesale)}+`}
                    </span>
                )}
            </Link>

            <div className="flex flex-1 flex-col gap-1 p-3">
                {product?.category?.name && (
                    <p className="text-badge uppercase text-slate-400">{product.category.name}</p>
                )}

                <h3 className="min-h-[2.5rem] text-h3 text-ink">
                    <Link href={href} className="line-clamp-2 hover:text-brand">
                        {name}
                    </Link>
                </h3>

                <p className="text-h3 font-bold text-ink">{price ?? '-'}</p>

                {wholesalePrice && minWholesale > 0 && (
                    <p className="text-meta text-ink-soft">
                        {`Grosir ${wholesalePrice} mulai ${formatNumber(minWholesale)} pcs`}
                    </p>
                )}

                <div className="mt-1 flex items-center gap-1.5">
                    <StarRating value={ratingValue} size="sm" readOnly />
                    <span className="text-meta text-slate-400">{`(${formatNumber(ratingCount)})`}</span>
                </div>
            </div>

            <button
                type="button"
                onClick={handleAdd}
                disabled={soldOut || !onAddToCart}
                className={cn(
                    'btn-ghost w-full rounded-none border-t border-line',
                    (soldOut || !onAddToCart) && 'cursor-not-allowed opacity-60'
                )}
                aria-label={`Tambah ${name} ke keranjang`}
            >
                {soldOut ? 'Stok habis' : 'Tambah'}
            </button>
        </article>
    );
}

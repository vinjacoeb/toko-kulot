import React from 'react';
import { cn } from '../lib/format';
import { useLoadingTimeout } from '../lib/hooks';
import ProductCard from './ProductCard';
import Skeleton from './Skeleton';
import InlineNotice from './InlineNotice';

/**
 * Grid produk — docs/komponen.md §1. 4 kolom desktop / 3 tablet / 2 mobile.
 * `empty` ditangani halaman; komponen ini hanya merender loading/error/data.
 */
export default function ProductGrid({
    products = [],
    loading = false,
    error = null,
    onRetry = null,
    skeletonCount = 8,
    onAddToCart = null,
    priorityCount = 0,
    className = '',
}) {
    const timedOut = useLoadingTimeout(loading);
    const failed = Boolean(error) || timedOut;

    const gridClass = cn(
        'grid grid-cols-product gap-gutter md:grid-cols-product-md lg:grid-cols-product-lg lg:gap-gutterLg',
        className
    );

    if (failed) {
        return (
            <InlineNotice tone="error" title="Gagal memuat produk">
                <p>{typeof error === 'string' ? error : 'Periksa koneksi Anda lalu coba lagi.'}</p>
                {onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="mt-2 text-label text-brand underline underline-offset-4"
                    >
                        Coba lagi
                    </button>
                )}
            </InlineNotice>
        );
    }

    if (loading) {
        return (
            <div className={gridClass} aria-busy="true" aria-live="polite">
                {Array.from({ length: skeletonCount }).map((_, index) => (
                    <div key={index} className="overflow-hidden rounded-md border border-line bg-white">
                        <Skeleton variant="card" className="rounded-none" />
                        <div className="space-y-2 p-3">
                            <Skeleton variant="text" className="w-1/3" />
                            <Skeleton variant="text" />
                            <Skeleton variant="text" className="w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={gridClass}>
            {products.map((product, index) => (
                <ProductCard
                    key={product.id ?? product.slug ?? index}
                    product={product}
                    onAddToCart={onAddToCart}
                    priority={index < priorityCount}
                />
            ))}
        </div>
    );
}

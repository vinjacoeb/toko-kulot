import React, { useEffect, useMemo, useState } from 'react';
import { cn } from '../lib/format';
import { ImageOffIcon } from './icons';

/**
 * ProductGallery - docs/design.md 4.4.
 * Gambar utama 1:1, thumbnail 72px, zoom hover (dimatikan prefers-reduced-motion).
 * Gambar gagal dimuat jatuh ke placeholder lokal.
 */
export default function ProductGallery({ images = [], name = 'Produk', className = '' }) {
    const list = useMemo(() => {
        const raw = Array.isArray(images) ? images : [];
        return raw
            .map((image) => (typeof image === 'string' ? { path: image, alt: '' } : image ?? null))
            .filter((image) => image && image.path);
    }, [images]);

    const [index, setIndex] = useState(0);
    const [broken, setBroken] = useState({});

    useEffect(() => {
        setIndex(0);
        setBroken({});
    }, [images]);

    const current = list[index] ?? null;
    const currentBroken = current ? Boolean(broken[index]) : true;

    if (!current) {
        return (
            <div className={cn('flex aspect-square w-full items-center justify-center rounded-md bg-surface text-slate-400', className)}>
                <ImageOffIcon width={32} height={32} />
                <span className="sr-only">Gambar produk belum tersedia</span>
            </div>
        );
    }

    return (
        <div className={cn('flex flex-col gap-3', className)}>
            <div className="group relative aspect-square w-full overflow-hidden rounded-md bg-surface">
                {currentBroken ? (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <ImageOffIcon width={32} height={32} />
                        <span className="sr-only">Gambar gagal dimuat</span>
                    </div>
                ) : (
                    <img
                        src={current.path}
                        alt={current.alt || name}
                        onError={() => setBroken((state) => ({ ...state, [index]: true }))}
                        className="h-full w-full object-cover transition-transform duration-hover group-hover:scale-[1.4] motion-reduce:transform-none motion-reduce:transition-none"
                    />
                )}
            </div>

            {list.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {list.map((image, position) => (
                        <button
                            key={(image.path ?? '') + position}
                            type="button"
                            onClick={() => setIndex(position)}
                            aria-label={'Lihat gambar ' + (position + 1)}
                            aria-current={position === index ? 'true' : undefined}
                            className={cn(
                                'h-thumb w-thumb shrink-0 overflow-hidden rounded-sm border transition-colors duration-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                                position === index ? 'border-ink' : 'border-line hover:border-ink'
                            )}
                        >
                            {broken[position] ? (
                                <span className="flex h-full w-full items-center justify-center bg-surface text-slate-400">
                                    <ImageOffIcon width={16} height={16} />
                                </span>
                            ) : (
                                <img
                                    src={image.path}
                                    alt=""
                                    loading="lazy"
                                    onError={() => setBroken((state) => ({ ...state, [position]: true }))}
                                    className="h-full w-full object-cover"
                                />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

import React, { useState } from 'react';
import { cn } from '../lib/format';
import { normalizeGallery } from '../lib/gallery';
import { ImageOffIcon } from './icons';
import Reveal, { stagger } from './Reveal';

/**
 * Galeri landing — design-v1.1 §4.3.
 * Sumber `settings.landing_gallery[]` `{image,caption,alt}` (maks 8, urutan array =
 * urutan tampil). Kosong/`null` → seksi hilang total, tanpa heading.
 * Komposisi asimetris per jumlah gambar; caption di bawah gambar (nomor + teks),
 * alt kosong = dekoratif. Gambar below-the-fold: lazy + decoding async.
 */

function Tile({ item, index, delay = 0, className = '', ratio = 'aspect-portrait' }) {
    const [broken, setBroken] = useState(false);
    const number = String(index + 1).padStart(2, '0');

    return (
        <Reveal delay={delay} className={cn('group min-w-0', className)}>
            <figure className="flex h-full flex-col">
                <div className={cn('relative w-full flex-1 overflow-hidden rounded-md bg-slate-100', ratio)}>
                    {broken ? (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center">
                            <span aria-hidden="true" className="text-slate-500">
                                <ImageOffIcon size={24} />
                            </span>
                            <span className="text-meta text-slate-600">Gambar tidak tersedia</span>
                        </div>
                    ) : (
                        <img
                            src={item.image}
                            alt={item.alt}
                            loading="lazy"
                            decoding="async"
                            onError={() => setBroken(true)}
                            className="h-full w-full object-cover object-center transition-transform duration-hover ease-smooth group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        />
                    )}
                </div>
                {item.caption && (
                    <figcaption className="mt-2 flex items-baseline gap-2">
                        <span
                            aria-hidden="true"
                            className="font-display text-h2 text-accent transition-transform duration-hover ease-smooth group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                        >
                            {number}
                        </span>
                        <span className="line-clamp-2 text-body text-ink">{item.caption}</span>
                    </figcaption>
                )}
            </figure>
        </Reveal>
    );
}

export default function LandingGallery({ items = [] }) {
    const gallery = normalizeGallery(items);

    if (!gallery.length) return null;

    const count = gallery.length;

    const header = (
        <div className="mb-8 grid gap-2 md:grid-cols-12 md:items-end md:gap-6">
            <Reveal className="md:col-span-7">
                <p className="text-badge uppercase text-brand">Galeri</p>
                <h2 id="galeri-heading" className="mt-2 font-display text-h2 text-brand">
                    Potongan nyata, bukan foto katalog.
                </h2>
            </Reveal>
            <Reveal delay={50} className="md:col-span-5">
                <p className="text-meta text-slate-600 md:text-right">
                    Detail bahan, jahitan, dan warna asli dari toko.
                </p>
            </Reveal>
        </div>
    );

    let grid = null;

    if (count === 1) {
        grid = (
            <div className="max-w-[880px]">
                <Tile item={gallery[0]} index={0} ratio="aspect-editorial" />
            </div>
        );
    } else if (count === 2) {
        grid = (
            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
                {gallery.map((item, index) => (
                    <Tile key={item.image} item={item} index={index} delay={stagger(index)} ratio="aspect-portrait" />
                ))}
            </div>
        );
    } else if (count === 3) {
        grid = (
            <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-12">
                <Tile
                    item={gallery[0]}
                    index={0}
                    className="md:col-span-2 lg:col-span-7 lg:h-full"
                    ratio="aspect-editorial lg:aspect-auto lg:min-h-0 lg:flex-1"
                />
                <div className="grid gap-4 md:col-span-2 md:grid-cols-2 md:gap-6 lg:col-span-5 lg:grid-cols-1 lg:grid-rows-2">
                    {gallery.slice(1).map((item, offset) => (
                        <Tile
                            key={item.image}
                            item={item}
                            index={offset + 1}
                            delay={stagger(offset + 1)}
                            className="md:h-full"
                            ratio="aspect-portrait lg:aspect-auto lg:min-h-0 lg:flex-1"
                        />
                    ))}
                </div>
            </div>
        );
    } else {
        const rest = count - 3;
        const restSpan =
            rest <= 1
                ? 'lg:col-span-12'
                : rest === 2
                  ? 'lg:col-span-6'
                  : rest === 3
                    ? 'lg:col-span-4'
                    : 'lg:col-span-3';

        grid = (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4 lg:auto-rows-[220px] lg:grid-cols-12 lg:gap-6">
                {gallery.map((item, index) => {
                    let className = 'lg:h-full';
                    let ratio = 'aspect-portrait lg:aspect-auto lg:min-h-0 lg:flex-1';

                    if (index === 0) {
                        className = 'col-span-2 lg:col-span-7 lg:row-span-2 lg:h-full';
                        ratio = 'aspect-editorial lg:aspect-auto lg:min-h-0 lg:flex-1';
                    } else if (index === 1 || index === 2) {
                        className = 'lg:col-span-5 lg:h-full';
                    } else if (index >= 6) {
                        className = 'lg:col-span-6 lg:h-full';
                    } else {
                        className = cn(restSpan, 'lg:h-full');
                    }

                    return (
                        <Tile
                            key={item.image}
                            item={item}
                            index={index}
                            delay={stagger(index)}
                            className={className}
                            ratio={ratio}
                        />
                    );
                })}
            </div>
        );
    }

    return (
        <section
            id="galeri"
            aria-labelledby="galeri-heading"
            className="bg-white py-sectionMobile lg:py-section"
        >
            <div className="container">
                {header}
                {grid}
            </div>
        </section>
    );
}

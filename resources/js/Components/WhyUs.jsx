import React, { useState } from 'react';
import { cn } from '../lib/format';
import { ImageOffIcon } from './icons';
import Reveal, { stagger } from './Reveal';
import { normalizeGallery } from '../lib/gallery';

/**
 * Why-us editorial — design-v1.1 §4.4.
 * Sumber `settings.landing_sections.why_us` `{title, items[] {title, body}}` (3–6 item).
 * `title` menjadi eyebrow (bukan H2); statement adalah copy desain. Kontrak tidak punya
 * field gambar, jadi gambar pendukung memakai `settings.landing_gallery` item 1 dan 3
 * (index 0 dan 2). `items` kosong → seksi hilang.
 */
const FALLBACK_EYEBROW = 'KENAPA BELI DI SINI';
const STATEMENT = 'Bukan sekadar dasternya.';

const textOf = (value) => (typeof value === 'string' && value.trim() !== '' ? value.trim() : null);

function Shot({ image, ratio }) {
    const [broken, setBroken] = useState(false);

    return (
        <div className={cn('relative w-full overflow-hidden rounded-md bg-brand-700', ratio)}>
            {broken ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center">
                    <span aria-hidden="true" className="text-brand-100">
                        <ImageOffIcon size={24} />
                    </span>
                    <span className="text-meta text-brand-100">Gambar tidak tersedia</span>
                </div>
            ) : (
                <img
                    src={image.image}
                    alt={image.alt}
                    loading="lazy"
                    decoding="async"
                    onError={() => setBroken(true)}
                    className="h-full w-full object-cover object-center"
                />
            )}
        </div>
    );
}

function ShotFigure({ image, ratio, className = '' }) {
    return (
        <figure className={className}>
            <Shot image={image} ratio={ratio} />
            {image.caption && (
                <figcaption className="mt-2 text-meta text-brand-100">{image.caption}</figcaption>
            )}
        </figure>
    );
}

export default function WhyUs({ section = null, gallery = [] }) {
    const items = (Array.isArray(section?.items) ? section.items : [])
        .filter((item) => item && (textOf(item.title) || textOf(item.body)))
        .slice(0, 6)
        .map((item) => ({ title: textOf(item.title), body: textOf(item.body) }));

    if (!items.length) return null;

    const shots = normalizeGallery(gallery);
    const portrait = shots[0] ?? null;
    const editorial = shots[2] ?? null;
    const eyebrow = textOf(section?.title) ?? FALLBACK_EYEBROW;

    return (
        <section
            id="kenapa-kami"
            aria-labelledby="why-us-heading"
            className="bg-brand py-sectionMobile text-white lg:py-section"
        >
            <div className="container">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-12 lg:gap-6">
                    <Reveal className="md:col-span-2 lg:col-span-5 lg:row-start-1">
                        <p className="text-badge uppercase text-accent">
                            {eyebrow}
                        </p>
                        <h2
                            id="why-us-heading"
                            className="mt-3 font-display text-display text-white lg:text-display-xl"
                        >
                            {STATEMENT}
                        </h2>
                    </Reveal>

                    {portrait && (
                        <Reveal
                            delay={100}
                            className="md:col-span-1 lg:col-span-5 lg:col-start-1 lg:row-start-2"
                        >
                            <ShotFigure
                                image={portrait}
                                ratio="aspect-portrait"
                                className="max-w-[360px]"
                            />
                        </Reveal>
                    )}

                    <div className="md:col-span-1 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
                        <ul>
                            {items.map((item, index) => (
                                <Reveal
                                    as="li"
                                    key={`${item.title ?? 'item'}-${index}`}
                                    delay={stagger(index)}
                                    className="flex gap-4 border-t border-white/20 py-6 transition-colors duration-hover ease-smooth hover:border-t-accent motion-reduce:transition-none"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="mt-1 w-8 shrink-0 font-display text-h2 text-accent"
                                    >
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <div className="min-w-0">
                                        {item.title && (
                                            <h3 className="text-h3 text-white">{item.title}</h3>
                                        )}
                                        {item.body && (
                                            <p className="mt-1 line-clamp-3 text-meta text-brand-100 md:line-clamp-none">
                                                {item.body}
                                            </p>
                                        )}
                                    </div>
                                </Reveal>
                            ))}
                        </ul>

                        {editorial && (
                            <Reveal delay={100} className="mt-8 hidden lg:block">
                                <ShotFigure
                                    image={editorial}
                                    ratio="aspect-editorial"
                                    className="ml-auto max-w-[420px]"
                                />
                            </Reveal>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

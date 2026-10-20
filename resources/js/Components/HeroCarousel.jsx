import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '../lib/format';
import { useDocumentVisible, usePrefersReducedMotion } from '../lib/hooks';
import Skeleton from './Skeleton';
import { ChevronLeftIcon, ChevronRightIcon, ImageOffIcon } from './icons';

/**
 * Hero carousel — docs/komponen.md §1, docs/design.md §4.15.
 * Autoplay 6 detik, berhenti saat hover/focus/tab tidak aktif/reduced-motion.
 * Swipe di mobile, panah di desktop, dot indicator 8px (aktif 24px accent).
 */
export default function HeroCarousel({
    slides = [],
    autoplayMs = 6000,
    loading = false,
    error = null,
    fallback = null,
}) {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [broken, setBroken] = useState({});
    const touchStart = useRef(null);

    const reducedMotion = usePrefersReducedMotion();
    const tabVisible = useDocumentVisible();
    const total = slides.length;
    const canAutoplay = !reducedMotion && tabVisible && !paused && total > 1;

    const goTo = useCallback(
        (next) => {
            if (total === 0) return;
            setIndex(((next % total) + total) % total);
        },
        [total]
    );

    useEffect(() => {
        if (!canAutoplay) return undefined;

        const id = window.setTimeout(() => goTo(index + 1), autoplayMs);

        return () => window.clearTimeout(id);
    }, [autoplayMs, canAutoplay, goTo, index]);

    if (loading) {
        return (
            <div className="relative h-heroMobile w-full overflow-hidden md:h-hero" aria-busy="true">
                <Skeleton variant="card" className="h-full w-full rounded-none" />
            </div>
        );
    }

    const showFallback = Boolean(error) || total === 0;
    const slide = total > 0 ? slides[index] : null;

    if (showFallback) {
        return (
            <section className="relative flex h-heroMobile w-full items-center justify-center overflow-hidden bg-brand-700 md:h-hero">
                <div className="container flex flex-col items-center gap-3 text-center text-white">
                    <p className="text-badge uppercase text-white/75">
                        {fallback?.kicker ?? 'Toko Kulot'}
                    </p>
                    <h1 className="font-display text-display">{fallback?.title ?? 'Daster & Kulot Premium'}</h1>
                    {fallback?.subtitle && (
                        <p className="max-w-xl text-body text-white/75">{fallback.subtitle}</p>
                    )}
                    {fallback?.ctaLabel && fallback?.ctaHref && (
                        <Link
                            href={fallback.ctaHref}
                            className="btn-primary mt-2"
                        >
                            {fallback.ctaLabel}
                        </Link>
                    )}
                </div>
            </section>
        );
    }

    return (
        <section
            className="relative h-heroMobile w-full overflow-hidden md:h-hero"
            aria-roledescription="carousel"
            aria-label="Sorotan toko"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onTouchStart={(event) => {
                touchStart.current = event.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(event) => {
                const start = touchStart.current;
                const end = event.changedTouches[0]?.clientX ?? null;
                touchStart.current = null;

                if (start === null || end === null) return;
                if (Math.abs(end - start) < 40) return;

                goTo(end < start ? index + 1 : index - 1);
            }}
        >
            {broken[index] || !slide.image ? (
                <div className="absolute inset-0 flex items-center justify-center bg-surface text-slate-400">
                    <ImageOffIcon size={48} />
                </div>
            ) : (
                <img
                    key={slide.image}
                    src={slide.image}
                    alt={slide.alt ?? ''}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    onError={() => setBroken((prev) => ({ ...prev, [index]: true }))}
                    className="h-full w-full object-cover"
                />
            )}

            <div className="absolute inset-0 bg-black/35" aria-hidden="true" />

            <div className="absolute inset-0">
                <div className="container flex h-full flex-col items-center justify-center gap-3 text-center text-white md:items-start md:justify-end md:pb-16 md:text-left">
                    {slide.title && (
                        <h1 className="max-w-2xl font-display text-display">{slide.title}</h1>
                    )}
                    {slide.subtitle && (
                        <p className="max-w-xl text-body text-white/85">{slide.subtitle}</p>
                    )}
                    {slide.ctaLabel && slide.ctaHref && (
                        <Link href={slide.ctaHref} className="btn-primary mt-2">
                            {slide.ctaLabel}
                        </Link>
                    )}
                </div>
            </div>

            {total > 1 && (
                <>
                    <button
                        type="button"
                        onClick={() => goTo(index - 1)}
                        aria-label="Slide sebelumnya"
                        className="absolute left-4 top-1/2 hidden h-touch w-touch -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-brand transition-colors duration-hover hover:bg-white md:flex"
                    >
                        <ChevronLeftIcon size={20} />
                    </button>
                    <button
                        type="button"
                        onClick={() => goTo(index + 1)}
                        aria-label="Slide berikutnya"
                        className="absolute right-4 top-1/2 hidden h-touch w-touch -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-brand transition-colors duration-hover hover:bg-white md:flex"
                    >
                        <ChevronRightIcon size={20} />
                    </button>

                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 md:left-4 md:translate-x-0">
                        {slides.map((item, dotIndex) => (
                            <button
                                key={item.image ?? dotIndex}
                                type="button"
                                onClick={() => goTo(dotIndex)}
                                aria-label={`Slide ${dotIndex + 1} dari ${total}`}
                                aria-current={dotIndex === index ? 'true' : undefined}
                                className={cn(
                                    'h-2 rounded-full transition-all duration-carousel ease-smooth',
                                    dotIndex === index ? 'w-6 bg-accent-500' : 'w-2 bg-white/60 hover:bg-white'
                                )}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}

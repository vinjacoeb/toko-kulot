import React, { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';

/**
 * Hero utama landing — mandat `docs/rencana-perbaikan-5.md` butir 3.
 *
 * Sumber konten hanya `settings.landing_hero` (docs/kontrak-props.md §2):
 * `title`, `subtitle`, `cta_label`, `cta_url`, `image`. Tidak ada konten
 * karangan; bila judul dan gambar kosong, section tidak dirender.
 *
 * Visual mengikuti bahasa hero `docs/design.md` §3.3 butir 2, §4.15, §5.1:
 * tinggi `h-heroMobile` (480px) / `md:h-hero` (560px), gambar `object-cover`
 * dengan overlay `rgba(0,0,0,.35)`, judul `text-display` putih, CTA `h-btn`.
 * Konten tengah di mobile, kiri-bawah di desktop.
 *
 * Gambar 404/rusak: gambar dan overlay disembunyikan (tanpa ikon rusak),
 * teks tetap tampil di latar `brand-700`.
 */
export default function HeroSection({
    title = null,
    subtitle = null,
    ctaLabel = null,
    ctaHref = null,
    image = null,
    imageAlt = '',
}) {
    const [broken, setBroken] = useState(false);

    // URL gambar berubah dari admin: coba muat lagi, jangan simpan status rusak lama.
    useEffect(() => {
        setBroken(false);
    }, [image]);

    if (!title && !image) return null;

    const showImage = Boolean(image) && !broken;

    return (
        <section className="relative flex h-heroMobile w-full overflow-hidden bg-brand-700 md:h-hero">
            {showImage && (
                <img
                    src={image}
                    alt={imageAlt ?? ''}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    onError={() => setBroken(true)}
                    className="absolute inset-0 h-full w-full object-cover"
                />
            )}

            {showImage && <div className="absolute inset-0 bg-black/35" aria-hidden="true" />}

            <div className="absolute inset-0">
                <div className="container flex h-full flex-col items-center justify-center gap-3 text-center text-white md:items-start md:justify-end md:pb-16 md:text-left">
                    {title && <h1 className="max-w-2xl font-display text-display">{title}</h1>}
                    {subtitle && <p className="max-w-[65ch] text-body text-white/85">{subtitle}</p>}
                    {ctaLabel && ctaHref && (
                        <Link href={ctaHref} className="btn-primary mt-2">
                            {ctaLabel}
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}

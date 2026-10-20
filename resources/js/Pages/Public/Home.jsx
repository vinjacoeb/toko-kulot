import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';
import HeroCarousel from '../../Components/HeroCarousel';
import TrustStrip from '../../Components/TrustStrip';
import CategoryCard from '../../Components/CategoryCard';
import ProductGrid from '../../Components/ProductGrid';
import EmptyState from '../../Components/EmptyState';
import SectionHeader from '../../Components/SectionHeader';
import FaqAccordion from '../../Components/FaqAccordion';
import { TRUST_ICONS, ChevronRightIcon, ImageOffIcon } from '../../Components/icons';
import { toList } from '../../lib/format';

/**
 * Landing publik — docs/design.md §3.3 (urutan baku seksi 1–9).
 * Konten seksi 2–9 dari `settings.landing_sections` + `carousels` + `faqs`.
 * Uang = integer rupiah dari server; format hanya di klien (PRD A13).
 */
/**
 * Normalisasi kontrak `settings` (docs/kontrak-props.md §2):
 * tautan = `url`, gambar = `image`, CTA = `cta_label` / `cta_url`.
 * Alias lama (`href`, `image_url`) tetap dibaca agar data lama tidak pecah.
 */
const hrefOf = (item) => item?.url ?? item?.href ?? null;
const imageOf = (item) => item?.image ?? item?.image_url ?? item?.path ?? null;

/** `landing_hero` adalah objek tunggal; `carousels` adalah daftar. Keduanya jadi slide. */
function toSlides(carousels, hero) {
    const fromCarousels = toList(carousels)
        .filter((slide) => slide && slide.is_active !== false && imageOf(slide))
        .map((slide) => ({
            id: slide.id ?? slide.title ?? imageOf(slide),
            image: imageOf(slide),
            alt: slide.alt ?? slide.title ?? '',
            title: slide.title ?? null,
            subtitle: slide.subtitle ?? null,
            ctaLabel: slide.cta_label ?? slide.ctaLabel ?? null,
            ctaHref: slide.cta_url ?? hrefOf(slide),
        }));

    if (fromCarousels.length > 0) return fromCarousels;

    const single = Array.isArray(hero) ? hero[0] : hero;
    if (!single || typeof single !== 'object' || single.is_active === false) return [];
    if (!imageOf(single)) return [];

    return [
        {
            id: single.id ?? 'hero',
            image: imageOf(single),
            alt: single.alt ?? single.title ?? '',
            title: single.title ?? null,
            subtitle: single.subtitle ?? null,
            ctaLabel: single.cta_label ?? single.ctaLabel ?? null,
            ctaHref: single.cta_url ?? hrefOf(single),
        },
    ];
}

export default function Home({
    settings = {},
    carousels = [],
    categories = [],
    featured = [],
    faqs = [],
    cartCount = 0,
    user = null,
    loading = false,
    error = null,
    onAddToCart = null,
}) {
    const sections = settings?.landing_sections ?? {};
    const storeName = settings?.store_name ?? 'Toko Kulot';
    const tagline = settings?.store_tagline ?? settings?.tagline ?? null;

    // Gambar promo dari CMS bisa 404: jatuh ke placeholder lokal, bukan gambar rusak.
    const [promoBroken, setPromoBroken] = useState(false);

    const heroSlides = toSlides(carousels, settings?.landing_hero);

    const trustSection = sections?.trust_strip ?? sections?.trust ?? null;
    const trustItems = toList(trustSection)
        .filter((item) => item && (item.label || item.title))
        .map((item) => ({
            ...item,
            label: item.label ?? item.title,
            description: item.subtitle ?? item.body ?? item.description ?? null,
        }));

    const categoryItems = toList(categories).filter((item) => item && item.name);
    const featuredItems = toList(featured);
    const featuredSection = sections?.featured ?? null;

    const rawPromo = sections?.promo ?? null;
    const promo =
        rawPromo && rawPromo.is_active !== false
            ? {
                  kicker: rawPromo.kicker ?? null,
                  title: rawPromo.title ?? null,
                  description: rawPromo.subtitle ?? rawPromo.description ?? null,
                  ctaLabel: rawPromo.cta_label ?? rawPromo.ctaLabel ?? null,
                  ctaHref: rawPromo.cta_url ?? hrefOf(rawPromo),
                  image: imageOf(rawPromo),
                  imageAlt: rawPromo.alt ?? rawPromo.title ?? '',
              }
            : null;

    const whyUs = sections?.why_us ?? null;

    const rawNewsletter = sections?.newsletter ?? null;
    const newsletter = rawNewsletter
        ? {
              title: rawNewsletter.title ?? null,
              description: rawNewsletter.subtitle ?? rawNewsletter.description ?? null,
              ctaLabel: rawNewsletter.button_text ?? rawNewsletter.cta_label ?? 'Hubungi Kami',
              ctaHref: hrefOf(rawNewsletter) ?? '/kontak-kami',
          }
        : null;

    const handleAddToCart = (product) => {
        if (!product?.id) return;
        if (onAddToCart) {
            onAddToCart(product);
            return;
        }
        router.post(
            '/keranjang',
            { product_id: product.id, qty: 1 },
            { preserveScroll: true, preserveState: true }
        );
    };

    return (
        <PublicLayout settings={settings} cartCount={cartCount} user={user}>
            <Head title={settings?.seo_default_title ?? 'Beranda'} />

            {/* 2. Hero carousel */}
            <HeroCarousel
                slides={heroSlides}
                loading={loading && heroSlides.length === 0}
                error={error}
                fallback={{
                    kicker: tagline,
                    title: storeName,
                    subtitle: null,
                    ctaLabel: 'Lihat Produk',
                    ctaHref: '/produk',
                }}
            />

            {/* 3. Trust strip */}
            {trustItems.length > 0 && (
                <section className="bg-surface py-4" aria-label="Keunggulan belanja">
                    <div className="container">
                        <TrustStrip
                            items={trustItems.map((item) => ({
                                icon: TRUST_ICONS[String(item.icon ?? '').toLowerCase()]
                                    ? item.icon
                                    : 'check',
                                label: item.label,
                                description: item.description,
                            }))}
                        />
                    </div>
                </section>
            )}

            {/* 4. Kategori */}
            {categoryItems.length > 0 && (
                <section className="container py-sectionMobile lg:py-section">
                    <SectionHeader
                        title="Kategori"
                        description="Pilih kategori untuk mempersempit pilihan."
                        actionLabel="Lihat semua"
                        actionHref="/produk"
                    />
                    <div className="grid grid-cols-2 gap-gutter md:grid-cols-3 lg:grid-cols-4 lg:gap-gutterLg">
                        {categoryItems.map((category) => (
                            <CategoryCard
                                key={category.id ?? category.slug ?? category.name}
                                name={category.name}
                                image={category.image ?? null}
                                href={hrefOf(category) ?? `/produk?kategori=${category.slug ?? ''}`}
                                productCount={
                                    category.productCount ?? category.product_count ?? null
                                }
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* 5. Produk unggulan */}
            <section className="container pb-sectionMobile lg:pb-section">
                <SectionHeader
                    title={featuredSection?.title ?? 'Produk Unggulan'}
                    description={featuredSection?.subtitle ?? null}
                    actionLabel="Lihat semua"
                    actionHref="/produk"
                />

                {!loading && !error && featuredItems.length === 0 ? (
                    <EmptyState
                        title="Belum ada produk"
                        description="Produk akan tampil di sini setelah ditambahkan dari panel admin."
                        actionLabel="Hubungi Kami"
                        actionHref="/kontak-kami"
                    />
                ) : (
                    <ProductGrid
                        products={featuredItems}
                        loading={loading}
                        error={error}
                        skeletonCount={8}
                        onAddToCart={handleAddToCart}
                        priorityCount={4}
                    />
                )}
            </section>

            {/* 6. Banner promo */}
            {promo && (promo.title || promo.image) && (
                <section className="container pb-sectionMobile lg:pb-section">
                    <div className="grid overflow-hidden rounded-xl bg-brand-700 md:grid-cols-2">
                        <div className="flex flex-col justify-center gap-3 p-6 text-white md:p-10">
                            {promo.kicker && (
                                <p className="text-badge uppercase text-white/75">{promo.kicker}</p>
                            )}
                            {promo.title && (
                                <h2 className="font-display text-h2 text-white">{promo.title}</h2>
                            )}
                            {promo.description && (
                                <p className="max-w-md text-meta text-white/75">
                                    {promo.description}
                                </p>
                            )}
                            {promo.ctaLabel && promo.ctaHref && (
                                <Link href={promo.ctaHref} className="btn-primary mt-2 self-start">
                                    {promo.ctaLabel}
                                </Link>
                            )}
                        </div>

                        {promo.image && !promoBroken && (
                            <div className="h-56 md:h-banner">
                                <img
                                    src={promo.image}
                                    alt={promo.imageAlt ?? ''}
                                    loading="lazy"
                                    decoding="async"
                                    onError={() => setPromoBroken(true)}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}
                        {(!promo.image || promoBroken) && (
                            <div className="flex h-56 items-center justify-center bg-brand-700/90 md:h-banner">
                                <span className="text-white/60">
                                    <ImageOffIcon size={40} />
                                </span>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* 7. Kenapa beli di sini */}
            {whyUs && toList(whyUs.items).length > 0 && (
                <section className="bg-surface py-sectionMobile lg:py-section">
                    <div className="container">
                        <SectionHeader
                            title={whyUs.title ?? `Kenapa beli di ${storeName}`}
                            description={whyUs.description ?? null}
                        />
                        <div className="grid gap-6 md:grid-cols-3">
                            {toList(whyUs.items).map((item) => {
                                const Icon =
                                    TRUST_ICONS[String(item.icon ?? '').toLowerCase()] ?? null;

                                return (
                                    <div
                                        key={item.title ?? item.label}
                                        className="rounded-xl border border-line bg-white p-6"
                                    >
                                        {Icon && (
                                            <span className="text-brand">
                                                <Icon size={32} />
                                            </span>
                                        )}
                                        <p className="mt-3 text-h3 text-ink">
                                            {item.title ?? item.label}
                                        </p>
                                        {(item.body ?? item.description) && (
                                            <p className="mt-1 text-meta text-ink-soft">
                                                {item.body ?? item.description}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* 8. FAQ accordion */}
            <FaqAccordion items={toList(faqs)} loading={loading && toList(faqs).length === 0} />

            {/* 9. CTA akhir */}
            {newsletter && (newsletter.title || newsletter.description) && (
                <section className="container pb-sectionMobile lg:pb-section">
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-line bg-surface px-6 py-10 text-center">
                        {newsletter.title && (
                            <h2 className="font-display text-h2 text-brand">{newsletter.title}</h2>
                        )}
                        {newsletter.description && (
                            <p className="max-w-xl text-meta text-ink-soft">
                                {newsletter.description}
                            </p>
                        )}
                        <Link
                            href={newsletter.ctaHref ?? '/kontak-kami'}
                            className="btn-primary mt-2 inline-flex items-center gap-2"
                        >
                            {newsletter.ctaLabel ?? 'Hubungi Kami'}
                            <ChevronRightIcon size={20} />
                        </Link>
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}

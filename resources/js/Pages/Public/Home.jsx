import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';
import HeroSection from '../../Components/HeroSection';
import HeroCarousel from '../../Components/HeroCarousel';
import TrustStrip from '../../Components/TrustStrip';
import CategoryCard from '../../Components/CategoryCard';
import ProductGrid from '../../Components/ProductGrid';
import EmptyState from '../../Components/EmptyState';
import SectionHeader from '../../Components/SectionHeader';
import FaqAccordion from '../../Components/FaqAccordion';
import LandingGallery from '../../Components/LandingGallery';
import WhyUs from '../../Components/WhyUs';
import Reveal from '../../Components/Reveal';
import { TRUST_ICONS, ChevronRightIcon, ImageOffIcon } from '../../Components/icons';
import { toList } from '../../lib/format';

/**
 * Landing publik — design-v1.1 §4 (urutan baku Announcement → Hero → Trust strip →
 * Kategori → Produk unggulan → Galeri → Promo → Kenapa beli di sini → FAQ → CTA).
 * Konten dari `settings` (kontrak §2): `landing_hero`, `landing_sections`,
 * `landing_gallery`; plus `carousels`, `categories`, `featured`, `faqs`.
 * Uang = integer rupiah dari server; format hanya di klien (PRD A13).
 */
/**
 * Normalisasi kontrak `settings` (docs/kontrak-props.md §2):
 * tautan = `url`, gambar = `image`, CTA = `cta_label` / `cta_url`.
 * Alias lama (`href`, `image_url`) tetap dibaca agar data lama tidak pecah.
 */
const hrefOf = (item) => item?.url ?? item?.href ?? null;
const imageOf = (item) => item?.image ?? item?.image_url ?? item?.path ?? null;

/** Teks tampil: string kosong/spasi = tidak ada (jangan render elemen kosong). */
const textOf = (value) => (typeof value === 'string' && value.trim() !== '' ? value.trim() : null);

/** design-v1.1 §4.5: kalimat janji gratis ongkir tidak boleh hilang bila subtitle kosong. */
const FREE_SHIPPING = 'Gratis ongkir untuk belanja min. Rp300.000 — khusus pengiriman reguler.';
const FREE_SHIPPING_HIGHLIGHT = 'Gratis ongkir';

/** Sorot "Gratis ongkir" tanpa mengubah teks subtitle (design-v1.1 §4.5). */
function CtaSubtitle({ text }) {
    const at = text.indexOf(FREE_SHIPPING_HIGHLIGHT);

    if (at === -1) return text;

    return (
        <>
            {text.slice(0, at)}
            <span className="font-semibold text-brand underline decoration-accent decoration-2 underline-offset-4">
                {FREE_SHIPPING_HIGHLIGHT}
            </span>
            {text.slice(at + FREE_SHIPPING_HIGHLIGHT.length)}
        </>
    );
}

/**
 * `landing_hero` adalah objek tunggal (kontrak §2). Kunci kosong → `null`
 * sehingga HeroSection tidak dirender sama sekali.
 */
function toHero(hero) {
    const single = Array.isArray(hero) ? hero[0] : hero;

    if (!single || typeof single !== 'object' || single.is_active === false) return null;

    const title = textOf(single.title);
    const image = imageOf(single);

    if (!title && !image) return null;

    return {
        title,
        subtitle: textOf(single.subtitle),
        image,
        ctaLabel: textOf(single.cta_label ?? single.ctaLabel),
        ctaHref: textOf(single.cta_url ?? hrefOf(single)),
        imageAlt: textOf(single.alt ?? single.image_alt) ?? '',
    };
}

/** `carousels` adalah daftar slide; slide tanpa gambar atau nonaktif dilewati. */
function toSlides(carousels) {
    return toList(carousels)
        .filter((slide) => slide && slide.is_active !== false && imageOf(slide))
        .map((slide) => ({
            id: slide.id ?? slide.title ?? imageOf(slide),
            image: imageOf(slide),
            alt: slide.alt ?? slide.title ?? '',
            title: slide.title ?? null,
            subtitle: slide.subtitle ?? null,
            // Kontrak `carousels` memakai `link`/`button_text`; alias lama tetap dibaca.
            ctaLabel: slide.cta_label ?? slide.button_text ?? slide.ctaLabel ?? null,
            ctaHref: slide.cta_url ?? slide.link ?? hrefOf(slide),
        }));
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

    const heroSlides = toSlides(carousels);
    const landingHero = toHero(settings?.landing_hero);

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

    // Galeri dari props bersama `settings.landing_gallery` (kontrak §2), maks 8.
    const galleryItems = toList(settings?.landing_gallery);

    const rawNewsletter = sections?.newsletter ?? null;
    const cta = {
        title: textOf(rawNewsletter?.title) ?? 'Dapat Info Diskon',
        subtitle: textOf(rawNewsletter?.subtitle ?? rawNewsletter?.description) ?? FREE_SHIPPING,
        buttonText: textOf(rawNewsletter?.button_text ?? rawNewsletter?.cta_label) ?? 'Hubungi Kami',
        href: textOf(hrefOf(rawNewsletter)) ?? '/kontak-kami',
    };
    const ctaExternal = /^(https?:|mailto:|tel:)/i.test(cta.href);

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

            {/* 2. Hero utama `settings.landing_hero`; carousel hanya bila hero tidak diisi. */}
            {landingHero ? (
                <HeroSection {...landingHero} />
            ) : (
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
            )}

            {/* 3. Trust strip — pita putih bergaris, seksi hilang bila kosong. */}
            <TrustStrip
                items={trustItems.map((item) => ({
                    icon: TRUST_ICONS[String(item.icon ?? '').toLowerCase()]
                        ? item.icon
                        : 'check',
                    label: item.label,
                    description: item.description,
                }))}
            />

            {/* 4–5. Kategori + produk unggulan — latar `surface` (design-v1.1 §4.1) */}
            <div className="bg-surface">
                {categoryItems.length > 0 && (
                    <section className="container py-sectionMobile lg:py-section">
                        <Reveal>
                            <SectionHeader
                                title="Kategori"
                                description="Pilih kategori untuk mempersempit pilihan."
                                actionLabel="Lihat semua"
                                actionHref="/produk"
                            />
                        </Reveal>
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

                <section
                    className={
                        categoryItems.length > 0
                            ? 'container pb-sectionMobile lg:pb-section'
                            : 'container py-sectionMobile lg:py-section'
                    }
                >
                    <Reveal>
                        <SectionHeader
                            title={featuredSection?.title ?? 'Produk Unggulan'}
                            description={featuredSection?.subtitle ?? null}
                            actionLabel="Lihat semua"
                            actionHref="/produk"
                        />
                    </Reveal>

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
            </div>

            {/* 6. Galeri — kosong berarti seksi hilang seluruhnya (design-v1.1 §4.3) */}
            <LandingGallery items={galleryItems} />

            {/* 7. Promo grosir (existing) */}
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

            {/* 8. Kenapa beli di sini — editorial `bg-brand` (design-v1.1 §4.4) */}
            <WhyUs section={whyUs} gallery={galleryItems} />

            {/* 9. FAQ accordion — latar `surface` (design-v1.1 §4.1) */}
            <div className="bg-surface">
                <FaqAccordion items={toList(faqs)} loading={loading && toList(faqs).length === 0} />
            </div>

            {/* 10. CTA/newsletter — panel putih + garis aksen 4px (design-v1.1 §4.5) */}
            <section className="container pb-sectionMobile lg:pb-section">
                <Reveal>
                    <div className="border border-line border-t-4 border-t-accent bg-white p-8 md:p-10 lg:p-12">
                        <div className="grid items-center gap-6 md:grid-cols-12 md:gap-8">
                            <div className="md:col-span-7">
                                <h2 className="font-display text-h2 text-brand">{cta.title}</h2>
                                <p className="mt-2 text-body text-ink-soft">
                                    <CtaSubtitle text={cta.subtitle} />
                                </p>
                            </div>
                            <div className="md:col-span-5 md:justify-self-end">
                                {ctaExternal ? (
                                    <a
                                        href={cta.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary h-12 w-full justify-center md:w-auto"
                                    >
                                        {cta.buttonText}
                                        <ChevronRightIcon size={20} />
                                    </a>
                                ) : (
                                    <Link
                                        href={cta.href}
                                        className="btn-primary h-12 w-full justify-center md:w-auto"
                                    >
                                        {cta.buttonText}
                                        <ChevronRightIcon size={20} />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </Reveal>
            </section>
        </PublicLayout>
    );
}

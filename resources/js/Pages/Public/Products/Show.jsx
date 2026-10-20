import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '../../../Layouts/PublicLayout';
import Accordion from '../../../Components/Accordion';
import Breadcrumb from '../../../Components/Breadcrumb';
import Button from '../../../Components/Button';
import ColorSwatch from '../../../Components/ColorSwatch';
import ErrorState from '../../../Components/ErrorState';
import InlineNotice from '../../../Components/InlineNotice';
import PriceBlock from '../../../Components/PriceBlock';
import ProductGallery from '../../../Components/ProductGallery';
import ProductGrid from '../../../Components/ProductGrid';
import QtyStepper from '../../../Components/QtyStepper';
import RatingSummary from '../../../Components/RatingSummary';
import ReviewCard from '../../../Components/ReviewCard';
import Skeleton from '../../../Components/Skeleton';
import StarRating from '../../../Components/StarRating';
import VariantChip from '../../../Components/VariantChip';
import { formatNumber, rupiah } from '../../../lib/format';

function uniqueBy(list, key) {
    const seen = new Set();
    const out = [];
    (list || []).forEach((item) => {
        const value = item?.[key];
        if (value === null || value === undefined || value === '') return;
        if (seen.has(value)) return;
        seen.add(value);
        out.push(item);
    });
    return out;
}

/**
 * Detail produk `/produk/{slug}` — docs/design.md §5.3.
 * Bentuk produk baku kontrak §8.3 + key aditif K11 (`description`, `variants`, `reviews`).
 * Varian wajib dipilih sebelum menambah ke keranjang (kontrak §7.2).
 */
export default function ProductsShow({
    settings = null,
    cartCount = 0,
    user = null,
    product = null,
    related = [],
    flash = null,
    loading = false,
    error = null,
}) {
    const variants = useMemo(() => (Array.isArray(product?.variants) ? product.variants : []), [product]);
    const sizes = useMemo(() => uniqueBy(variants, 'size'), [variants]);
    const colors = useMemo(() => uniqueBy(variants, 'color'), [variants]);
    const hasSize = sizes.length > 0;
    const hasColor = colors.length > 0;

    const [size, setSize] = useState(null);
    const [color, setColor] = useState(null);
    const [qty, setQty] = useState(1);
    const [formError, setFormError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [openSection, setOpenSection] = useState(null);

    useEffect(() => {
        setSize(hasSize && sizes.length === 1 ? sizes[0].size : null);
        setColor(hasColor && colors.length === 1 ? colors[0].color : null);
        setQty(1);
        setFormError(null);
        setOpenSection(null);
    }, [product?.id]);

    const selectedVariant = useMemo(() => {
        if (variants.length === 0) return null;
        return (
            variants.find((variant) => {
                const sizeOk = !hasSize || variant.size === size;
                const colorOk = !hasColor || variant.color === color;
                return sizeOk && colorOk;
            }) ?? null
        );
    }, [variants, size, color, hasSize, hasColor]);

    const needsVariant = variants.length > 0 && !selectedVariant;
    const stockValue = selectedVariant ? Number(selectedVariant.stock ?? 0) : Number(product?.stock ?? 0);
    const soldOut = Number.isFinite(stockValue) && stockValue <= 0;
    const maxQty = soldOut ? 1 : Math.min(stockValue > 0 ? stockValue : 99, 99);

    const basePrice = Number(product?.base_price ?? 0) || 0;
    const priceDelta = Number(selectedVariant?.price_delta ?? 0) || 0;
    const effectivePrice = basePrice + priceDelta;
    const wholesalePrice = Number(product?.wholesale_price ?? 0) || 0;
    const minWholesale = Number(product?.min_wholesale_qty ?? 0) || 0;
    const hasWholesale = wholesalePrice > 0 && minWholesale > 0 && wholesalePrice < basePrice;

    const reviews = Array.isArray(product?.reviews) ? product.reviews : [];
    const relatedList = Array.isArray(related) ? related : Array.isArray(product?.related) ? product.related : [];
    const ratingCount = Number(product?.rating_count ?? 0) || 0;
    const ratingAvg = Number(product?.rating_avg ?? 0) || 0;

    const variantAvailable = (variant) => {
        if (!variant) return false;
        if (variant.is_active === false) return false;
        const stock = Number(variant.stock ?? 0);
        return !Number.isFinite(stock) || stock > 0;
    };

    const addToCart = (redirect = false) => {
        if (!product?.id || needsVariant || soldOut || submitting) return;
        setFormError(null);
        setSubmitting(true);
        const payload = { product_id: product.id, qty };
        if (selectedVariant?.id) payload.variant_id = selectedVariant.id;
        router.post('/keranjang', payload, {
            preserveScroll: true,
            onSuccess: () => {
                setSubmitting(false);
                if (redirect) router.visit('/keranjang');
            },
            onError: (errors) => {
                setSubmitting(false);
                const first = errors ? Object.values(errors)[0] : null;
                setFormError(typeof first === 'string' ? first : 'Produk gagal ditambahkan. Coba lagi.');
            },
        });
    };

    /**
     * Tambah cepat dari kartu "Produk Serupa". Produk bervarian wajib `variant_id`
     * (kontrak §7.2), jadi kartu langsung membuka halaman detail produk tersebut.
     */
    const addRelated = (item) => {
        if (!item?.id) return;
        const hasVariants = Array.isArray(item.variants) && item.variants.length > 0;
        if (hasVariants) {
            if (item.slug) router.visit('/produk/' + item.slug);
            return;
        }
        router.post('/keranjang', { product_id: item.id, qty: 1 }, { preserveScroll: true });
    };

    const shell = (children) => (
        <PublicLayout settings={settings} cartCount={cartCount} user={user}>
            {children}
        </PublicLayout>
    );

    if (error) {
        return shell(
            <>
                <Head title="Produk tidak ditemukan" />
                <div className="container py-10">
                    <ErrorState
                        title="Produk tidak dapat dimuat"
                        description={
                            typeof error === 'string' ? error : 'Produk mungkin sudah tidak dijual. Periksa koneksi Anda lalu coba lagi.'
                        }
                        onRetry={() => router.reload()}
                    />
                </div>
            </>
        );
    }

    if (loading || !product) {
        return shell(
            <>
                <Head title="Produk" />
                <div className="container py-8">
                    <div className="grid gap-6 lg:grid-cols-[58fr_42fr] lg:gap-12">
                        <Skeleton variant="card" className="aspect-square w-full" />
                        <div className="space-y-3">
                            <Skeleton variant="text" />
                            <Skeleton variant="title" />
                            <Skeleton variant="text" count={3} />
                            <Skeleton variant="row" count={2} />
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const name = product.name ?? 'Produk';
    const categoryName = product.category?.name ?? null;
    const categorySlug = product.category?.slug ?? null;

    const sections = [
        {
            id: 'deskripsi',
            title: 'Deskripsi',
            body: product.description ?? null,
            empty: 'Belum ada deskripsi untuk produk ini.',
        },
        {
            id: 'bahan',
            title: 'Bahan & Perawatan',
            body: product.care ?? settings?.product_care_note ?? null,
            empty: 'Belum ada informasi bahan dan perawatan.',
        },
        {
            id: 'pengiriman',
            title: 'Pengiriman & Retur',
            body: product.shipping_return ?? settings?.product_shipping_note ?? null,
            empty: 'Belum ada informasi pengiriman dan retur.',
        },
    ];

    return shell(
        <>
            <Head title={name}>
                {product.short_description ? <meta name="description" content={product.short_description} /> : null}
            </Head>

            <div className="container py-4">
                <Breadcrumb
                    items={[
                        { label: 'Beranda', href: '/' },
                        { label: 'Produk', href: '/produk' },
                        { label: name },
                    ]}
                />

                {flash?.success && (
                    <InlineNotice tone="success" className="mt-4">
                        <p>{flash.success}</p>
                    </InlineNotice>
                )}

                <div className="mt-2 grid gap-6 lg:grid-cols-[58fr_42fr] lg:gap-12">
                    <ProductGallery images={product.images ?? []} name={name} />

                    <div>
                        {categoryName && (
                            <Link
                                href={categorySlug ? '/produk?kategori=' + encodeURIComponent(categorySlug) : '/produk'}
                                className="text-badge uppercase tracking-wide text-slate-500 hover:text-brand"
                            >
                                Tipe: {categoryName}
                            </Link>
                        )}

                        <h1 className="mt-1 font-display text-h1 text-ink">{name}</h1>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-meta text-slate-500">
                            {ratingCount > 0 ? (
                                <>
                                    <StarRating value={ratingAvg} size="sm" />
                                    <a href="#ulasan" className="hover:text-ink">
                                        {ratingAvg.toFixed(1).replace('.', ',')} · {formatNumber(ratingCount)} ulasan
                                    </a>
                                </>
                            ) : (
                                <a href="#ulasan" className="hover:text-ink">
                                    Belum ada ulasan
                                </a>
                            )}
                        </div>

                        <div className="mt-4">
                            <PriceBlock price={effectivePrice} comparePrice={product?.compare_price} />
                            {hasWholesale && (
                                <p className="mt-1 text-meta text-success-strong">
                                    Harga grosir {rupiah(wholesalePrice)} mulai {formatNumber(minWholesale)} pcs
                                </p>
                            )}
                        </div>

                        {product.short_description && (
                            <p className="mt-3 whitespace-pre-line text-body text-ink-soft">{product.short_description}</p>
                        )}

                        {hasSize && (
                            <div className="mt-4">
                                <p className="mb-2 text-meta font-semibold text-ink">Ukuran</p>
                                <div className="flex flex-wrap gap-2" role="group" aria-label="Pilih ukuran">
                                    {sizes.map((variant) => {
                                        const value = variant.size;
                                        const available = variants.some(
                                            (item) => item.size === value && variantAvailable(item) && (!hasColor || item.color === color)
                                        );
                                        return (
                                            <VariantChip
                                                key={value}
                                                label={value}
                                                active={size === value}
                                                disabled={!available}
                                                onClick={() => setSize(value)}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {hasColor && (
                            <div className="mt-4">
                                <p className="mb-2 text-meta font-semibold text-ink">Warna{color ? ': ' + color : ''}</p>
                                <div className="flex flex-wrap gap-2" role="group" aria-label="Pilih warna">
                                    {colors.map((variant) => {
                                        const value = variant.color;
                                        const available = variants.some(
                                            (item) => item.color === value && variantAvailable(item) && (!hasSize || item.size === size)
                                        );
                                        return (
                                            <ColorSwatch
                                                key={value}
                                                name={value}
                                                hex={variant.color_hex ?? null}
                                                active={color === value}
                                                disabled={!available}
                                                onClick={() => setColor(value)}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <p className={soldOut ? 'mt-4 text-meta text-danger-strong' : 'mt-4 text-meta text-success-strong'}>
                            {soldOut
                                ? 'Stok habis'
                                : 'Stok: Tersedia' + (stockValue > 0 && stockValue < 100 ? ' (' + formatNumber(stockValue) + ')' : '')}
                        </p>

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            <span className="text-meta font-semibold text-ink">Jumlah</span>
                            <QtyStepper value={qty} onChange={setQty} min={1} max={maxQty} disabled={soldOut} />
                        </div>

                        {formError && (
                            <p className="mt-3 text-meta text-danger-strong" role="alert">
                                {formError}
                            </p>
                        )}

                        <div className="mt-4 flex flex-col gap-2">
                            {soldOut ? (
                                <>
                                    <Button variant="primary" fullWidth disabled>
                                        Stok Habis
                                    </Button>
                                    <Button variant="secondary" fullWidth href="/kontak-kami">
                                        Hubungi Kami
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="primary"
                                        fullWidth
                                        loading={submitting}
                                        disabled={needsVariant}
                                        onClick={() => addToCart(false)}
                                    >
                                        Tambah ke Keranjang
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        fullWidth
                                        disabled={needsVariant || submitting}
                                        onClick={() => addToCart(true)}
                                    >
                                        Beli Sekarang
                                    </Button>
                                </>
                            )}
                        </div>

                        {needsVariant && !soldOut && (
                            <p className="mt-2 text-meta text-warning-strong" role="status">
                                Pilih ukuran dan warna yang tersedia dulu.
                            </p>
                        )}

                        {hasWholesale && (
                            <div className="mt-5 border-t border-line pt-4">
                                <h2 className="text-meta font-semibold text-ink">Harga Grosir</h2>
                                <table className="mt-2 w-full text-left text-meta">
                                    <caption className="sr-only">
                                        Harga per pcs berdasarkan jumlah pembelian
                                    </caption>
                                    <thead className="text-slate-500">
                                        <tr>
                                            <th scope="col" className="pb-1 font-semibold">
                                                Jumlah
                                            </th>
                                            <th scope="col" className="pb-1 text-right font-semibold">
                                                Harga per pcs
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-ink">
                                        <tr className="border-t border-line">
                                            <td className="py-1.5">{'1 - ' + formatNumber(Math.max(minWholesale - 1, 1)) + ' pcs'}</td>
                                            <td className="py-1.5 text-right">{rupiah(basePrice)}</td>
                                        </tr>
                                        <tr className="border-t border-line">
                                            <td className="py-1.5">{'≥ ' + formatNumber(minWholesale) + ' pcs'}</td>
                                            <td className="py-1.5 text-right font-semibold text-success-strong">
                                                {rupiah(wholesalePrice)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="mt-5 border-t border-line pt-2">
                            <Accordion
                                items={sections.map((section) => ({
                                    id: section.id,
                                    title: section.title,
                                    content: (
                                        <div className="whitespace-pre-line text-body text-ink-soft">
                                            {section.body ?? section.empty}
                                        </div>
                                    ),
                                }))}
                                openId={openSection}
                                onToggle={setOpenSection}
                            />
                        </div>
                    </div>
                </div>

                <section id="ulasan" className="mt-10 scroll-mt-24" aria-labelledby="ulasan-judul">
                    <h2 id="ulasan-judul" className="text-h3 text-ink">
                        Ulasan Pembeli{ratingCount > 0 ? ' (' + formatNumber(ratingCount) + ')' : ''}
                    </h2>
                    <div className="mt-3">
                        <RatingSummary
                            average={ratingAvg}
                            count={ratingCount}
                            distribution={product.rating_distribution ?? null}
                        />
                    </div>
                    <div className="mt-4">
                        {reviews.length === 0 ? (
                            <div className="rounded-md border border-line bg-surface p-4">
                                <p className="text-body text-ink">Belum ada ulasan untuk produk ini.</p>
                                {!soldOut && (
                                    <p className="mt-1 text-meta text-ink-soft">
                                        Jadi yang pertama mengulas setelah pesanan Anda selesai.
                                    </p>
                                )}
                            </div>
                        ) : (
                            reviews.map((review) => <ReviewCard key={review.id} review={review} />)
                        )}
                    </div>
                </section>

                {relatedList.length > 0 && (
                    <section className="mt-12" aria-labelledby="terkait">
                        <h2 id="terkait" className="text-h3 text-ink">
                            Produk Serupa
                        </h2>
                        <div className="mt-4">
                            <ProductGrid products={relatedList.slice(0, 4)} skeletonCount={4} onAddToCart={addRelated} />
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}

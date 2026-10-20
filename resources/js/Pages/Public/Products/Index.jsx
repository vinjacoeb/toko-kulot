import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import PublicLayout from '../../../Layouts/PublicLayout';
import Breadcrumb from '../../../Components/Breadcrumb';
import EmptyState from '../../../Components/EmptyState';
import ErrorState from '../../../Components/ErrorState';
import FilterPanel from '../../../Components/FilterPanel';
import InlineNotice from '../../../Components/InlineNotice';
import Pagination from '../../../Components/Pagination';
import ProductGrid from '../../../Components/ProductGrid';
import SearchInput from '../../../Components/SearchInput';
import SortSelect from '../../../Components/SortSelect';
import { formatNumber } from '../../../lib/format';

/** Query string katalog. `kategori` mengikuti kontrak §8.2 (`/produk?kategori={slug}`). */
const FILTER_KEYS = ['q', 'kategori', 'ukuran', 'harga_min', 'harga_max', 'urut'];

function toSizeList(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string' && value.trim() !== '') {
        return value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }
    return [];
}

/** Buang nilai kosong; ukuran dikirim sebagai satu parameter dipisah koma. */
function buildParams(next) {
    const params = {};
    FILTER_KEYS.forEach((key) => {
        const value = next[key];
        if (key === 'ukuran') {
            const list = toSizeList(value);
            if (list.length > 0) params.ukuran = list.join(',');
            return;
        }
        if (value !== null && value !== undefined && String(value).trim() !== '') params[key] = value;
    });
    const page = Number(next.page ?? 0);
    if (Number.isFinite(page) && page > 1) params.page = page;
    return params;
}

/**
 * Katalog `/produk` — docs/design.md §5.2.
 * Filter, urutan, dan paginasi ada di query string; server sumber hasil (tidak memfilter di klien).
 * Kontrak props: bentuk produk baku §8.3, kategori §8.2.
 */
export default function ProductsIndex({
    settings = null,
    cartCount = 0,
    user = null,
    products = null,
    categories = [],
    sizes = [],
    filters = {},
    flash = null,
    loading = false,
    error = null,
}) {
    const list = useMemo(() => {
        if (Array.isArray(products)) return products;
        if (Array.isArray(products?.data)) return products.data;
        return [];
    }, [products]);

    const currentPage = Number(products?.current_page ?? filters?.page ?? 1) || 1;
    const lastPage = Number(products?.last_page ?? 1) || 1;
    const total = Number(products?.total ?? list.length) || 0;

    const activeFilters = useMemo(() => {
        const chips = [];
        if (filters?.q) chips.push({ key: 'q', label: 'Cari: ' + filters.q });
        if (filters?.kategori) {
            const found = (categories || []).find((item) => item?.slug === filters.kategori);
            chips.push({ key: 'kategori', label: found ? found.name : String(filters.kategori) });
        }
        toSizeList(filters?.ukuran).forEach((size) =>
            chips.push({ key: 'ukuran', value: size, label: 'Ukuran ' + size })
        );
        if (filters?.harga_min) chips.push({ key: 'harga_min', label: 'Min Rp' + formatNumber(filters.harga_min) });
        if (filters?.harga_max) chips.push({ key: 'harga_max', label: 'Maks Rp' + formatNumber(filters.harga_max) });
        return chips;
    }, [filters, categories]);

    const activeCount = activeFilters.length;
    const hasAnyFilter = activeCount > 0;

    const [busy, setBusy] = useState(false);
    const [navError, setNavError] = useState(null);
    const filtersRef = useRef(filters ?? {});
    filtersRef.current = filters ?? {};

    const navigate = useCallback((next) => {
        setNavError(null);
        const params = buildParams({ ...filtersRef.current, ...next });
        router.get('/produk', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setBusy(true),
            onFinish: () => setBusy(false),
            onError: () => setNavError('Filter gagal diterapkan. Periksa koneksi Anda lalu coba lagi.'),
        });
    }, []);

    const resetAll = useCallback(() => {
        setNavError(null);
        router.get('/produk', {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setBusy(true),
            onFinish: () => setBusy(false),
        });
    }, []);

    const removeChip = (chip) => {
        if (chip.key === 'ukuran') {
            const rest = toSizeList(filters?.ukuran).filter((size) => size !== chip.value);
            navigate({ ukuran: rest, page: 1 });
            return;
        }
        navigate({ [chip.key]: '', page: 1 });
    };

    /**
     * Produk bervarian wajib menyertakan `variant_id` (kontrak §7.2), jadi tombol tambah
     * pada kartu langsung membuka halaman detail bila produk punya varian aktif.
     */
    const addToCart = (product) => {
        if (!product?.id) return;
        const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
        if (hasVariants) {
            if (product.slug) router.visit('/produk/' + product.slug);
            return;
        }
        router.post('/keranjang', { product_id: product.id, qty: 1 }, { preserveScroll: true });
    };

    const isLoading = Boolean(loading || busy);

    return (
        <PublicLayout settings={settings} cartCount={cartCount} user={user}>
            <Head title="Produk" />

            <div className="container py-4">
                <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Produk' }]} />

                <header className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <h1 className="text-h1 text-ink">Produk Daster &amp; Kulot</h1>
                    <div className="flex items-center gap-2">
                        <SortSelect value={filters?.urut ?? 'terbaru'} onChange={(value) => navigate({ urut: value, page: 1 })} />
                        <SearchInput
                            value={filters?.q ?? ''}
                            onChange={(value) => navigate({ q: value, page: 1 })}
                            loading={isLoading}
                            className="w-full sm:w-64"
                        />
                    </div>
                </header>

                {flash?.success && (
                    <InlineNotice tone="success" className="mt-4">
                        <p>{flash.success}</p>
                    </InlineNotice>
                )}
                {flash?.error && (
                    <InlineNotice tone="error" className="mt-4">
                        <p>{flash.error}</p>
                    </InlineNotice>
                )}
                {navError && (
                    <InlineNotice tone="error" className="mt-4">
                        <p>{navError}</p>
                    </InlineNotice>
                )}

                {hasAnyFilter && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        {activeFilters.map((chip) => (
                            <button
                                key={chip.key + '-' + (chip.value ?? chip.label)}
                                type="button"
                                onClick={() => removeChip(chip)}
                                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-meta text-ink transition-colors duration-hover hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                            >
                                {chip.label}
                                <span aria-hidden="true">×</span>
                                <span className="sr-only">Hapus filter</span>
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={resetAll}
                            className="text-meta text-brand underline underline-offset-4"
                        >
                            Reset semua
                        </button>
                    </div>
                )}

                <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
                    <FilterPanel
                        categories={categories}
                        sizes={sizes}
                        value={filters ?? {}}
                        activeCount={activeCount}
                        onApply={(next) => navigate({ ...next, page: 1 })}
                        onReset={resetAll}
                        className="lg:w-sidebar lg:shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                        {error ? (
                            <ErrorState
                                title="Gagal memuat produk"
                                description={typeof error === 'string' ? error : 'Periksa koneksi Anda lalu coba lagi.'}
                                onRetry={() => router.reload({ only: ['products'] })}
                            />
                        ) : !isLoading && list.length === 0 ? (
                            <EmptyState
                                title={hasAnyFilter ? 'Produk tidak ditemukan' : 'Belum ada produk'}
                                description={
                                    hasAnyFilter
                                        ? 'Coba ubah kata kunci atau hapus filter yang aktif.'
                                        : 'Produk akan tampil di sini setelah tersedia.'
                                }
                                actionLabel={hasAnyFilter ? 'Reset filter' : null}
                                onAction={hasAnyFilter ? resetAll : null}
                            />
                        ) : (
                            <>
                                <ProductGrid
                                    products={list}
                                    loading={isLoading}
                                    skeletonCount={8}
                                    onAddToCart={addToCart}
                                    priorityCount={4}
                                />

                                {!isLoading && total > 0 && (
                                    <p className="mt-4 text-meta text-slate-500" aria-live="polite">
                                        Menampilkan {formatNumber(list.length)} dari {formatNumber(total)} produk
                                    </p>
                                )}
                            </>
                        )}

                        {!error && (
                            <Pagination
                                currentPage={currentPage}
                                lastPage={lastPage}
                                onPageChange={(page) => navigate({ page })}
                                className="mt-8"
                            />
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}

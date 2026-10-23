import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import PublicLayout from '../../../Layouts/PublicLayout';
import Breadcrumb from '../../../Components/Breadcrumb';
import Button from '../../../Components/Button';
import EmptyState from '../../../Components/EmptyState';
import ErrorState from '../../../Components/ErrorState';
import FilterPanel from '../../../Components/FilterPanel';
import InlineNotice from '../../../Components/InlineNotice';
import ProductGrid from '../../../Components/ProductGrid';
import SearchInput from '../../../Components/SearchInput';
import SortSelect from '../../../Components/SortSelect';
import Spinner from '../../../Components/Spinner';
import { formatNumber } from '../../../lib/format';

/** Query string katalog. `kategori` mengikuti kontrak (`/produk?kategori={slug}`). */
const FILTER_KEYS = ['q', 'kategori', 'ukuran', 'harga_min', 'harga_max', 'urut'];

/** Jarak sentinel sebelum menyentuh bawah viewport supaya batch berikutnya sudah siap. */
const SENTINEL_MARGIN = '240px 0px';

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
 * Kunci filter/urutan (tanpa `page`). Dipakai untuk tahu kapan akumulasi lazy scroll
 * harus direset, termasuk saat pengguna menekan tombol back/forward.
 */
function filterSignature(filters) {
    const value = filters ?? {};
    return JSON.stringify(
        FILTER_KEYS.map((key) =>
            key === 'ukuran' ? toSizeList(value.ukuran).join(',') : String(value[key] ?? '')
        )
    );
}

/** Nilai paginator / props apa pun → array produk (kontrak: `products` objek paginator). */
function productList(value) {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    return [];
}

/**
 * Gabung batch baru tanpa produk ganda. Kunci utama `id` (kontrak produk), cadangan `slug`.
 * Produk tanpa keduanya tetap ditampilkan agar data tidak hilang diam-diam.
 */
function mergeProducts(current, incoming) {
    const merged = [];
    const seen = new Set();
    [...(current ?? []), ...(incoming ?? [])].forEach((item) => {
        const key = item?.id ?? item?.slug ?? null;
        if (key !== null) {
            if (seen.has(key)) return;
            seen.add(key);
        }
        merged.push(item);
    });
    return merged;
}

/**
 * Katalog `/produk` — docs/design.md §5.2, docs/rencana-perbaikan-5.md §Keputusan.
 * Filter, urutan, dan halaman ada di query string; server sumber hasil (tidak memfilter di klien).
 * Daftar memakai lazy scroll (kartu t_ed78d5c6): batch pertama dari paginator, batch berikutnya
 * ditambahkan lewat IntersectionObserver, dedupe `id`, reset saat filter/urutan berubah.
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
    const firstBatch = useMemo(() => productList(products), [products]);

    const currentPage = Number(products?.current_page ?? filters?.page ?? 1) || 1;
    const lastPage = Number(products?.last_page ?? 1) || 1;
    const total = Number(products?.total ?? firstBatch.length) || 0;
    const signature = filterSignature(filters);

    /** Produk yang sudah terkumpul di layar (batch pertama + hasil "muat lebih banyak"). */
    const [items, setItems] = useState(firstBatch);
    const [loadedPage, setLoadedPage] = useState(currentPage);
    const [pageCount, setPageCount] = useState(lastPage);
    const [totalCount, setTotalCount] = useState(total);
    const [loadingMore, setLoadingMore] = useState(false);
    const [moreError, setMoreError] = useState(null);
    const [busy, setBusy] = useState(false);
    const [navError, setNavError] = useState(null);

    const filtersRef = useRef(filters ?? {});
    filtersRef.current = filters ?? {};
    const signatureRef = useRef(signature);
    const loadedPageRef = useRef(loadedPage);
    loadedPageRef.current = loadedPage;
    const pageCountRef = useRef(pageCount);
    pageCountRef.current = pageCount;
    const totalRef = useRef(totalCount);
    totalRef.current = totalCount;
    const loadingMoreRef = useRef(false);
    const sentinelRef = useRef(null);

    /** Pasang satu batch paginator sebagai titik awal akumulasi. */
    const applyBatch = useCallback((paginator, nextSignature) => {
        const data = productList(paginator);
        setItems(data);
        setLoadedPage(Number(paginator?.current_page ?? 1) || 1);
        setPageCount(Number(paginator?.last_page ?? 1) || 1);
        setTotalCount(Number(paginator?.total ?? data.length) || 0);
        setMoreError(null);
        signatureRef.current = nextSignature;
    }, []);

    // Reset akumulasi saat filter/kategori/pencarian/sort berubah (termasuk back/forward).
    useEffect(() => {
        if (signatureRef.current === signature) return;
        applyBatch(products, signature);
        loadingMoreRef.current = false;
        setLoadingMore(false);
    }, [signature, products, applyBatch]);

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

    const navigate = useCallback(
        (next) => {
            setNavError(null);
            const params = buildParams({ ...filtersRef.current, ...next });
            router.get('/produk', params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onStart: () => setBusy(true),
                onSuccess: (page) => {
                    const paginator = page?.props?.products ?? null;
                    const nextFilters = page?.props?.filters ?? null;
                    if (paginator && nextFilters) applyBatch(paginator, filterSignature(nextFilters));
                },
                onFinish: () => setBusy(false),
                onError: () => setNavError('Filter gagal diterapkan. Periksa koneksi Anda lalu coba lagi.'),
            });
        },
        [applyBatch]
    );

    const resetAll = useCallback(() => {
        setNavError(null);
        router.get('/produk', {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setBusy(true),
            onSuccess: (page) => {
                const paginator = page?.props?.products ?? null;
                const nextFilters = page?.props?.filters ?? null;
                if (paginator && nextFilters) applyBatch(paginator, filterSignature(nextFilters));
            },
            onFinish: () => setBusy(false),
            onError: () => setNavError('Filter gagal diterapkan. Periksa koneksi Anda lalu coba lagi.'),
        });
    }, [applyBatch]);

    /**
     * Ambil halaman berikutnya lalu tambahkan tanpa duplikat.
     * `preserveUrl` menjaga URL tetap pada filter aktif (nomor batch tidak masuk riwayat).
     */
    const loadMore = useCallback(() => {
        if (loadingMoreRef.current) return;
        if (loadedPageRef.current >= pageCountRef.current) return;

        const targetPage = loadedPageRef.current + 1;
        const startingSignature = signatureRef.current;

        loadingMoreRef.current = true;
        setLoadingMore(true);
        setMoreError(null);

        router.get('/produk', buildParams({ ...filtersRef.current, page: targetPage }), {
            only: ['products'],
            preserveState: true,
            preserveScroll: true,
            preserveUrl: true,
            onSuccess: (page) => {
                // Filter berubah saat permintaan berjalan → hasil lama tidak boleh ditambahkan.
                if (signatureRef.current !== startingSignature) return;
                const paginator = page?.props?.products ?? null;
                if (!paginator) return;
                const incoming = productList(paginator);
                setItems((prev) => mergeProducts(prev, incoming));
                loadedPageRef.current = Number(paginator.current_page ?? targetPage) || targetPage;
                setLoadedPage(loadedPageRef.current);
                pageCountRef.current = Number(paginator.last_page ?? pageCountRef.current) || pageCountRef.current;
                setPageCount(pageCountRef.current);
                totalRef.current = Number(paginator.total ?? totalRef.current) || 0;
                setTotalCount(totalRef.current);
            },
            onError: () =>
                setMoreError('Gagal memuat produk berikutnya. Periksa koneksi Anda lalu coba lagi.'),
            onFinish: () => {
                loadingMoreRef.current = false;
                setLoadingMore(false);
            },
        });
    }, []);

    const isLoading = Boolean(loading || busy);
    const hasNextPage = loadedPage < pageCount;
    const canLoadMore = !isLoading && !loadingMore && !moreError && !error && hasNextPage && items.length > 0;

    // Sentinel IntersectionObserver: batch berikutnya dimuat otomatis saat mendekati bawah.
    useEffect(() => {
        if (!canLoadMore) return undefined;
        const node = sentinelRef.current;
        if (!node || typeof IntersectionObserver === 'undefined') return undefined;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) loadMore();
            },
            { rootMargin: SENTINEL_MARGIN }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [canLoadMore, loadMore, loadedPage, pageCount]);

    /**
     * Produk bervarian wajib menyertakan `variant_id` (kontrak keranjang), jadi tombol tambah
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

    const removeChip = (chip) => {
        if (chip.key === 'ukuran') {
            const rest = toSizeList(filters?.ukuran).filter((size) => size !== chip.value);
            navigate({ ukuran: rest, page: 1 });
            return;
        }
        navigate({ [chip.key]: '', page: 1 });
    };

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
                        ) : !isLoading && items.length === 0 ? (
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
                                    products={isLoading ? [] : items}
                                    loading={isLoading}
                                    skeletonCount={8}
                                    onAddToCart={addToCart}
                                    priorityCount={4}
                                />

                                {!isLoading && items.length > 0 && (
                                    <div className="mt-4 flex flex-col items-center gap-3">
                                        <p className="text-meta text-slate-500" aria-live="polite">
                                            Menampilkan {formatNumber(items.length)} dari {formatNumber(totalCount)} produk
                                        </p>

                                        {loadingMore && (
                                            <p
                                                role="status"
                                                aria-live="polite"
                                                className="flex items-center gap-2 text-meta text-ink-soft"
                                            >
                                                <Spinner size={20} label="Memuat produk lainnya" />
                                                <span>Memuat produk…</span>
                                            </p>
                                        )}

                                        {moreError && (
                                            <InlineNotice tone="error" className="w-full">
                                                <p>{moreError}</p>
                                                <button
                                                    type="button"
                                                    onClick={loadMore}
                                                    className="mt-2 text-label text-brand underline underline-offset-4"
                                                >
                                                    Coba lagi
                                                </button>
                                            </InlineNotice>
                                        )}

                                        {!loadingMore && !moreError && hasNextPage && (
                                            <Button variant="secondary" onClick={loadMore}>
                                                Muat lebih banyak
                                            </Button>
                                        )}

                                        {!hasNextPage && (
                                            <p className="text-meta text-slate-500">Semua produk sudah tampil</p>
                                        )}

                                        <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}

import React, { useEffect, useMemo, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';
import DataTable from '../../../Components/DataTable';
import SearchInput from '../../../Components/SearchInput';
import Select from '../../../Components/Select';
import Field from '../../../Components/Field';
import Button from '../../../Components/Button';
import Textarea from '../../../Components/Textarea';
import Modal from '../../../Components/Modal';
import Pagination from '../../../Components/Pagination';
import RatingSummary from '../../../Components/RatingSummary';
import StatusBadge from '../../../Components/StatusBadge';
import StarRating from '../../../Components/StarRating';
import InlineNotice from '../../../Components/InlineNotice';
import Toast from '../../../Components/Toast';
import { formatDateTime, formatNumber } from '../../../lib/format';

/**
 * Moderasi penilaian produk — docs/design.md §5.12 dan docs/kontrak-props.md §10.4-§10.6.
 * Props server: `ulasan` (paginator), `filter` (q, rating, visibilitas), `ringkasan`.
 * Aksi memakai URL literal routes/admin.php:
 * balas -> POST /admin/penilaian/{id}/balas, visibilitas -> PATCH /admin/penilaian/{id}/tampil.
 */

const BREADCRUMB = [{ label: 'Dashboard', href: '/admin' }, { label: 'Penilaian' }];

const DEFAULT_FILTER = { q: '', rating: 'semua', visibilitas: 'semua' };

const RATING_OPTIONS = [
    { value: 'semua', label: 'Semua rating' },
    { value: '5', label: '5 bintang' },
    { value: '4', label: '4 bintang' },
    { value: '3', label: '3 bintang' },
    { value: '2', label: '2 bintang' },
    { value: '1', label: '1 bintang' },
];

const VISIBILITY_OPTIONS = [
    { value: 'semua', label: 'Semua status' },
    { value: 'tampil', label: 'Tampil' },
    { value: 'sembunyi', label: 'Sembunyi' },
];

/** Normalisasi props `filter` dari server; nilai kosong/tak dikenal -> bawaan. */
const normalizeFilter = (filter) => ({
    q: typeof filter?.q === 'string' ? filter.q : '',
    rating: filter?.rating === null || filter?.rating === undefined ? 'semua' : String(filter.rating),
    visibilitas:
        filter?.visibilitas === null || filter?.visibilitas === undefined
            ? 'semua'
            : String(filter.visibilitas),
});

/**
 * Paginator Laravel dikirim datar (`current_page`, `last_page`, `total`, `data`).
 * Kontrak §10.4 menulis bentuk `meta`; keduanya dibaca agar halaman tidak
 * bergantung pada satu bentuk saja.
 */
const readPaginator = (paginator) => {
    const source = paginator ?? {};
    const meta = source.meta && typeof source.meta === 'object' ? source.meta : source;

    return {
        rows: Array.isArray(source.data) ? source.data : [],
        currentPage: Math.max(1, Number(meta.current_page) || 1),
        lastPage: Math.max(1, Number(meta.last_page) || 1),
        total: Math.max(0, Number(meta.total) || 0),
    };
};

export default function ReviewsIndex({
    auth = null,
    ulasan = null,
    filter = null,
    ringkasan = null,
    flash = null,
}) {
    const [query, setQuery] = useState(() => normalizeFilter(filter));
    const [navLoading, setNavLoading] = useState(false);
    const [navError, setNavError] = useState(null);
    const [toast, setToast] = useState(null);
    const [busyId, setBusyId] = useState(null);
    const [actionError, setActionError] = useState(null);
    const [target, setTarget] = useState(null);
    const [askDiscard, setAskDiscard] = useState(false);

    const form = useForm({ admin_reply: '' });

    const paginator = useMemo(() => readPaginator(ulasan), [ulasan]);
    const average = Number(ringkasan?.rating_avg ?? 0) || 0;
    const count = Number(ringkasan?.rating_count ?? 0) || 0;
    const distribution = ringkasan?.distribusi ?? null;

    const filterActive =
        query.q.trim() !== '' ||
        query.rating !== DEFAULT_FILTER.rating ||
        query.visibilitas !== DEFAULT_FILTER.visibilitas;

    // Sinkron dari server hanya saat tidak ada permintaan berjalan supaya
    // ketikan pengguna tidak tertimpa respons yang tertinggal.
    useEffect(() => {
        if (navLoading) return;

        const next = normalizeFilter(filter);
        setQuery((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    }, [filter, navLoading]);

    useEffect(() => {
        if (flash?.success) {
            setToast({ tone: 'success', title: 'Berhasil', message: String(flash.success) });
        } else if (flash?.error) {
            setToast({ tone: 'error', title: 'Gagal', message: String(flash.error) });
        }
    }, [flash?.success, flash?.error]);

    const load = (params) => {
        router.get('/admin/penilaian', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => {
                setNavLoading(true);
                setNavError(null);
            },
            onFinish: () => setNavLoading(false),
            onError: () => setNavError('Gagal memuat daftar ulasan. Periksa koneksi lalu coba lagi.'),
        });
    };

    const paramsFor = (source, page = 1) => {
        const params = {};
        const q = source.q.trim();

        if (q !== '') params.q = q;
        if (source.rating !== DEFAULT_FILTER.rating) params.rating = source.rating;
        if (source.visibilitas !== DEFAULT_FILTER.visibilitas) params.visibilitas = source.visibilitas;
        if (page > 1) params.page = page;

        return params;
    };

    const applyFilters = (overrides = {}) => {
        const next = { ...query, ...overrides };
        setQuery(next);
        load(paramsFor(next));
    };

    const resetFilters = () => {
        setQuery(DEFAULT_FILTER);
        load({});
    };

    const changePage = (page) => load(paramsFor(query, page));

    const reload = () => load(paramsFor(query, paginator.currentPage));

    const openReply = (row) => {
        setActionError(null);
        setAskDiscard(false);
        form.setData('admin_reply', row.admin_reply ?? '');
        form.clearErrors();
        setTarget(row);
    };

    const closeReply = () => {
        setTarget(null);
        setAskDiscard(false);
        form.setData('admin_reply', '');
        form.clearErrors();
    };

    const replyDirty = target !== null && form.data.admin_reply.trim() !== String(target.admin_reply ?? '').trim();

    const requestClose = () => {
        if (form.processing) return;

        if (replyDirty) {
            setAskDiscard(true);
            return;
        }

        closeReply();
    };

    const submitReply = (event) => {
        if (event) event.preventDefault();

        if (target === null || form.processing) return;

        form.post(`/admin/penilaian/${target.id}/balas`, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => closeReply(),
        });
    };

    const toggleVisibility = (row) => {
        if (busyId !== null) return;

        setBusyId(row.id);
        setActionError(null);

        router.patch(
            `/admin/penilaian/${row.id}/tampil`,
            { is_visible: !row.is_visible },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setBusyId(null),
                onError: () =>
                    setActionError({
                        message: 'Visibilitas ulasan gagal diubah. Periksa koneksi lalu coba lagi.',
                        retry: () => toggleVisibility(row),
                    }),
            }
        );
    };

    const columns = [
        {
            key: 'pembeli',
            header: 'Pembeli',
            render: (row) => (
                <span className="block max-w-[180px] truncate font-semibold text-ink">
                    {row.pembeli ? String(row.pembeli) : '-'}
                </span>
            ),
        },
        {
            key: 'produk',
            header: 'Produk',
            render: (row) => (
                <span className="block max-w-[200px] truncate text-ink-soft">
                    {row.product?.name ? String(row.product.name) : '-'}
                </span>
            ),
        },
        {
            key: 'rating',
            header: 'Rating',
            render: (row) => (
                <span className="whitespace-nowrap">
                    <StarRating value={Number(row.rating) || 0} size="sm" readOnly />
                </span>
            ),
        },
        {
            key: 'comment',
            header: 'Ulasan',
            render: (row) => {
                const comment = typeof row.comment === 'string' ? row.comment : '';
                const reply = typeof row.admin_reply === 'string' ? row.admin_reply : '';

                return (
                    <div className="max-w-[320px] space-y-2">
                        <p className="whitespace-pre-line text-meta text-ink-soft">
                            {comment !== '' ? comment : '-'}
                        </p>
                        {reply !== '' && (
                            <div className="border-l-[3px] border-accent-500 bg-surface p-2">
                                <p className="text-badge uppercase text-slate-600">Balasan toko</p>
                                <p className="mt-1 whitespace-pre-line text-meta text-ink-soft">{reply}</p>
                                <p className="mt-1 text-meta text-slate-600">{formatDateTime(row.replied_at)}</p>
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'is_visible',
            header: 'Visibilitas',
            render: (row) => (
                <StatusBadge
                    status={row.is_visible ? 'tampil' : 'sembunyi'}
                    label={row.is_visible ? 'Tampil' : 'Sembunyi'}
                    className={row.is_visible ? 'bg-success/10 text-success-strong' : undefined}
                />
            ),
        },
        {
            key: 'created_at',
            header: 'Tanggal',
            render: (row) => <span className="whitespace-nowrap">{formatDateTime(row.created_at)}</span>,
        },
        {
            key: 'aksi',
            header: 'Aksi',
            align: 'right',
            render: (row) => (
                <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openReply(row)}>
                        Balas
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVisibility(row)}
                        loading={busyId === row.id}
                        disabled={busyId !== null && busyId !== row.id}
                    >
                        {row.is_visible ? 'Sembunyikan' : 'Tampilkan'}
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout auth={auth} title="Penilaian">
            <div className="flex flex-col gap-6">
                <PageHeader title="Penilaian" breadcrumb={BREADCRUMB} />

                <section className="card p-6">
                    <h2 className="text-h3 text-ink">Ringkasan penilaian</h2>
                    {filterActive && (
                        <p className="mt-1 text-meta text-slate-500">Ringkasan mengikuti filter yang aktif.</p>
                    )}
                    <RatingSummary className="mt-4" average={average} count={count} distribution={distribution} />
                </section>

                {actionError && (
                    <InlineNotice tone="error" title="Aksi gagal" onDismiss={() => setActionError(null)}>
                        <p>{actionError.message}</p>
                        <Button variant="secondary" size="sm" className="mt-3" onClick={actionError.retry}>
                            Coba lagi
                        </Button>
                    </InlineNotice>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <SearchInput
                        className="w-full sm:max-w-sm"
                        value={query.q}
                        onChange={(value) => applyFilters({ q: value })}
                        placeholder="Cari produk, pembeli, atau komentar"
                        label="Cari ulasan"
                        loading={navLoading}
                    />

                    <Field label="Rating" htmlFor="filter-rating" className="w-full sm:w-44">
                        <Select
                            id="filter-rating"
                            value={query.rating}
                            onChange={(event) => applyFilters({ rating: event.target.value })}
                        >
                            {RATING_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    </Field>

                    <Field label="Status" htmlFor="filter-visibilitas" className="w-full sm:w-44">
                        <Select
                            id="filter-visibilitas"
                            value={query.visibilitas}
                            onChange={(event) => applyFilters({ visibilitas: event.target.value })}
                        >
                            {VISIBILITY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    </Field>

                    {filterActive && (
                        <Button variant="secondary" onClick={resetFilters}>
                            Reset filter
                        </Button>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <DataTable
                        caption="Daftar ulasan pembeli"
                        columns={columns}
                        rows={paginator.rows}
                        loading={navLoading}
                        error={navError}
                        onRetry={reload}
                        emptyTitle={filterActive ? 'Tidak ada ulasan yang cocok' : 'Belum ada ulasan'}
                        emptyDescription={
                            filterActive
                                ? 'Ubah kata kunci atau filter untuk melihat ulasan lain.'
                                : 'Ulasan pembeli akan tampil di sini setelah pesanan selesai dinilai.'
                        }
                        emptyActionLabel={filterActive ? 'Reset filter' : null}
                        emptyActionHref={filterActive ? '/admin/penilaian' : null}
                    />

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-meta text-slate-600">
                            {paginator.total > 0
                                ? `Menampilkan ${formatNumber(paginator.rows.length)} dari ${formatNumber(
                                      paginator.total
                                  )} ulasan`
                                : 'Belum ada ulasan untuk ditampilkan.'}
                        </p>
                        <Pagination
                            currentPage={paginator.currentPage}
                            lastPage={paginator.lastPage}
                            onPageChange={changePage}
                        />
                    </div>
                </div>
            </div>

            <Modal
                open={target !== null}
                onClose={requestClose}
                title="Balas ulasan"
                description={
                    target
                        ? `${target.pembeli ? String(target.pembeli) : 'Tanpa nama'} · ${
                              target.product?.name ? String(target.product.name) : 'Produk tidak tersedia'
                          }`
                        : null
                }
                footer={
                    askDiscard ? (
                        <>
                            <p className="mr-auto self-center text-meta text-ink-soft">
                                Balasan belum tersimpan. Buang perubahan?
                            </p>
                            <Button variant="secondary" onClick={() => setAskDiscard(false)}>
                                Lanjut mengedit
                            </Button>
                            <Button variant="danger" onClick={closeReply}>
                                Buang
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="secondary" onClick={requestClose} disabled={form.processing} autoFocus>
                                Batal
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => submitReply(null)}
                                loading={form.processing}
                                disabled={!replyDirty}
                            >
                                Kirim balasan
                            </Button>
                        </>
                    )
                }
            >
                {target && (
                    <form className="flex flex-col gap-4" onSubmit={submitReply}>
                        <div className="rounded-md bg-surface p-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <StarRating value={Number(target.rating) || 0} size="sm" readOnly />
                                <span className="text-meta text-slate-600">
                                    {formatDateTime(target.created_at)}
                                </span>
                            </div>
                            {typeof target.comment === 'string' && target.comment !== '' && (
                                <p className="mt-2 whitespace-pre-line text-body text-ink-soft">{target.comment}</p>
                            )}
                        </div>

                        <Field
                            label="Balasan"
                            htmlFor="admin_reply"
                            required
                            hint="Maksimal 1000 karakter."
                            error={form.errors.admin_reply ?? null}
                        >
                            <Textarea
                                id="admin_reply"
                                name="admin_reply"
                                rows={5}
                                maxLength={1000}
                                value={form.data.admin_reply}
                                error={form.errors.admin_reply ?? null}
                                onChange={(event) => form.setData('admin_reply', event.target.value)}
                                placeholder="Tulis balasan untuk pembeli"
                            />
                        </Field>
                    </form>
                )}
            </Modal>

            {toast && (
                <div className="pointer-events-none fixed bottom-4 right-4 z-toast flex w-full max-w-[360px]">
                    <Toast
                        tone={toast.tone}
                        title={toast.title}
                        message={toast.message}
                        onClose={() => setToast(null)}
                    />
                </div>
            )}
        </AdminLayout>
    );
}

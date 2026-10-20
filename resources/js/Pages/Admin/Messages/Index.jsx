import React, { useEffect, useMemo, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout, { ADMIN_NAV } from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';
import DataTable from '../../../Components/DataTable';
import SearchInput from '../../../Components/SearchInput';
import Select from '../../../Components/Select';
import Field from '../../../Components/Field';
import Button from '../../../Components/Button';
import Textarea from '../../../Components/Textarea';
import Modal from '../../../Components/Modal';
import Pagination from '../../../Components/Pagination';
import StatusBadge from '../../../Components/StatusBadge';
import InlineNotice from '../../../Components/InlineNotice';
import Toast from '../../../Components/Toast';
import { formatDateTime, formatNumber } from '../../../lib/format';

/**
 * Pesan masuk dari formulir kontak — docs/design.md §5.12 ("Detail pesan: isi pesan,
 * textarea balasan, tombol 'Tandai dibaca'") dan docs/kontrak-props.md §10.1–§10.3.
 *
 * Props server (app/Http/Controllers/Admin/MessageController.php@index):
 *   pesan     paginator Laravel (data, links, current_page, last_page, total)
 *   filter    { q: string|null, status: 'semua'|'belum'|'sudah' }
 *   ringkasan { total, belum_dibaca }
 *   flash     { success, error } — props bersama (HandleInertiaRequests).
 *
 * Aksi memakai URL literal routes/admin.php:
 *   tandai dibaca -> PATCH /admin/pesan-masuk/{id}/baca  (kontrak §10.2, koreksi PATCH 20 Okt 2026)
 *   balas         -> POST  /admin/pesan-masuk/{id}/balas (kontrak §10.3)
 */

const BREADCRUMB = [{ label: 'Dashboard', href: '/admin' }, { label: 'Pesan Masuk' }];

const DEFAULT_FILTER = { q: '', status: 'semua' };

/** Enum `status` mengikuti kontrak §10.1: semua | belum | sudah. */
const STATUS_OPTIONS = [
    { value: 'semua', label: 'Semua status' },
    { value: 'belum', label: 'Belum dibaca' },
    { value: 'sudah', label: 'Sudah dibaca' },
];

/**
 * Sidebar admin: rute /admin/pesan-masuk sudah terdaftar (routes/admin.php), jadi
 * entri "Pesan" dibuka di halaman ini — pola sama dengan Settings/Index.jsx.
 */
const NAV_AKTIF = ADMIN_NAV.map((item) => (item.key === 'pesan' ? { ...item, disabled: false } : item));

/** Nilai server bisa null; semua teks melewati helper ini agar tidak ada "undefined" di layar. */
const asText = (value) => {
    if (value === null || value === undefined) return '';

    return typeof value === 'string' ? value : String(value);
};

/** Angka dari server bisa string; hasil selalu >= 0 dan bukan NaN. */
const asCount = (value) => {
    const number = Number(value ?? 0);

    return Number.isFinite(number) && number > 0 ? number : 0;
};

/** Normalisasi props `filter` dari server; nilai kosong/tak dikenal -> bawaan. */
const normalizeFilter = (filter) => ({
    q: typeof filter?.q === 'string' ? filter.q : '',
    status: filter?.status === null || filter?.status === undefined ? 'semua' : String(filter.status),
});

/**
 * Paginator Laravel dikirim datar (`current_page`, `last_page`, `total`, `data`);
 * kontrak §10.1 menuliskannya sebagai `links` + `meta`. Keduanya dibaca supaya
 * halaman tidak bergantung pada satu bentuk saja.
 */
const readPaginator = (paginator) => {
    const source = paginator ?? {};
    const meta = source.meta && typeof source.meta === 'object' ? source.meta : source;

    return {
        rows: Array.isArray(source.data) ? source.data : [],
        currentPage: Math.max(1, Number(meta.current_page) || 1),
        lastPage: Math.max(1, Number(meta.last_page) || 1),
        total: asCount(meta.total),
    };
};

export default function MessagesIndex({
    auth = null,
    pesan = null,
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
    const [targetId, setTargetId] = useState(null);
    const [askDiscard, setAskDiscard] = useState(false);

    const form = useForm({ admin_reply: '' });

    const paginator = useMemo(() => readPaginator(pesan), [pesan]);
    const total = asCount(ringkasan?.total);
    const belumDibaca = asCount(ringkasan?.belum_dibaca);

    // Baris detail dibaca ulang dari props terbaru, jadi status baca (dan balasan)
    // di modal ikut terbarui setelah aksi karena state halaman dipertahankan.
    const target = useMemo(
        () => paginator.rows.find((row) => row.id === targetId) ?? null,
        [paginator.rows, targetId]
    );

    const filterActive = query.q.trim() !== '' || query.status !== DEFAULT_FILTER.status;

    // Sinkron dari server hanya saat tidak ada permintaan berjalan supaya ketikan
    // pengguna tidak tertimpa respons yang tertinggal.
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
        router.get('/admin/pesan-masuk', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => {
                setNavLoading(true);
                setNavError(null);
            },
            onFinish: () => setNavLoading(false),
            onError: () => setNavError('Gagal memuat daftar pesan. Periksa koneksi lalu coba lagi.'),
        });
    };

    /** Parameter query yang benar-benar dikirim: nilai bawaan tidak ditulis ke URL. */
    const paramsFor = (source, page = 1) => {
        const params = {};
        const q = source.q.trim();

        if (q !== '') params.q = q;
        if (source.status !== DEFAULT_FILTER.status) params.status = source.status;
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

    const openDetail = (row) => {
        setActionError(null);
        setAskDiscard(false);
        form.setData('admin_reply', asText(row.admin_reply));
        form.clearErrors();
        setTargetId(row.id);
    };

    const closeDetail = () => {
        setTargetId(null);
        setAskDiscard(false);
        form.setData('admin_reply', '');
        form.clearErrors();
    };

    const replyDirty = target !== null && form.data.admin_reply.trim() !== asText(target.admin_reply).trim();

    const requestClose = () => {
        if (form.processing || busyId !== null) return;

        if (replyDirty) {
            setAskDiscard(true);

            return;
        }

        closeDetail();
    };

    /** Throttle `admin-write` (60/menit): beri pesan yang terbaca, bukan modal galat bawaan. */
    const onHttpException = (response) => {
        if (response?.status === 429) {
            setActionError({
                message: 'Terlalu banyak aksi berturut-turut. Tunggu sebentar, lalu coba lagi.',
                retry: null,
            });

            return false;
        }

        return undefined;
    };

    /** Tandai dibaca — wajib PATCH (kontrak §10.2, dikoreksi 20 Okt 2026). */
    const markRead = (row) => {
        if (busyId !== null || row.is_read) return;

        setBusyId(row.id);
        setActionError(null);

        router.patch(
            `/admin/pesan-masuk/${row.id}/baca`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onHttpException,
                onFinish: () => setBusyId(null),
                onError: () =>
                    setActionError({
                        message: 'Pesan gagal ditandai sudah dibaca. Periksa koneksi lalu coba lagi.',
                        retry: () => markRead(row),
                    }),
            }
        );
    };

    const submitReply = (event) => {
        if (event) event.preventDefault();

        if (target === null || form.processing) return;

        setActionError(null);

        form.post(`/admin/pesan-masuk/${target.id}/balas`, {
            preserveState: true,
            preserveScroll: true,
            onHttpException,
            onSuccess: () => closeDetail(),
        });
    };

    const columns = [
        {
            key: 'pengirim',
            header: 'Pengirim',
            render: (row) => (
                <div className="max-w-[220px]">
                    <p className="truncate font-semibold text-ink">{asText(row.name) || '-'}</p>
                    <p className="truncate text-meta text-slate-500">{asText(row.email) || '-'}</p>
                </div>
            ),
        },
        {
            key: 'subjek',
            header: 'Subjek',
            render: (row) => {
                const subject = asText(row.subject);
                const body = asText(row.message);
                const reply = asText(row.admin_reply);

                return (
                    <div className="max-w-[320px] space-y-1">
                        <p className="truncate font-semibold text-ink">
                            {subject !== '' ? subject : 'Tanpa subjek'}
                        </p>
                        <p className="truncate text-meta text-ink-soft">
                            {body !== '' ? body.replace(/\s+/g, ' ') : '-'}
                        </p>
                        {reply !== '' && (
                            <p className="truncate text-meta text-slate-500">
                                Dibalas {formatDateTime(row.replied_at)}
                            </p>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'created_at',
            header: 'Tanggal',
            render: (row) => <span className="whitespace-nowrap">{formatDateTime(row.created_at)}</span>,
        },
        {
            key: 'is_read',
            header: 'Status baca',
            render: (row) =>
                row.is_read ? (
                    <StatusBadge status="sudah dibaca" label="Sudah dibaca" className="bg-success/10 text-success-strong" />
                ) : (
                    <StatusBadge status="belum dibaca" label="Belum dibaca" className="bg-warning/10 text-warning-strong" />
                ),
        },
        {
            key: 'aksi',
            header: 'Aksi',
            align: 'right',
            render: (row) => (
                <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openDetail(row)}>
                        Baca detail
                    </Button>
                    {!row.is_read && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markRead(row)}
                            loading={busyId === row.id}
                            disabled={busyId !== null && busyId !== row.id}
                        >
                            Tandai dibaca
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    const replyText = target ? asText(target.admin_reply) : '';

    return (
        <AdminLayout auth={auth?.admin ?? null} nav={NAV_AKTIF} title="Pesan Masuk">
            <div className="flex flex-col gap-6">
                <PageHeader title="Pesan Masuk" breadcrumb={BREADCRUMB} />

                <p className="text-meta text-slate-600">
                    Total {formatNumber(total)} pesan · {formatNumber(belumDibaca)} belum dibaca
                </p>

                {actionError && (
                    <InlineNotice tone="error" title="Aksi gagal" onDismiss={() => setActionError(null)}>
                        <p>{actionError.message}</p>
                        {actionError.retry && (
                            <Button variant="secondary" size="sm" className="mt-3" onClick={actionError.retry}>
                                Coba lagi
                            </Button>
                        )}
                    </InlineNotice>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <SearchInput
                        className="w-full sm:max-w-sm"
                        value={query.q}
                        onChange={(value) => applyFilters({ q: value })}
                        placeholder="Cari nama, subjek, atau email"
                        label="Cari pesan"
                        loading={navLoading}
                    />

                    <Field label="Status baca" htmlFor="filter-status" className="w-full sm:w-48">
                        <Select
                            id="filter-status"
                            value={query.status}
                            onChange={(event) => applyFilters({ status: event.target.value })}
                        >
                            {STATUS_OPTIONS.map((option) => (
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
                        caption="Daftar pesan masuk dari formulir kontak"
                        columns={columns}
                        rows={paginator.rows}
                        loading={navLoading}
                        error={navError}
                        onRetry={reload}
                        emptyTitle={filterActive ? 'Tidak ada pesan yang cocok' : 'Belum ada pesan'}
                        emptyDescription={
                            filterActive
                                ? 'Ubah kata kunci atau filter untuk melihat pesan lain.'
                                : 'Pesan dari formulir kontak akan tampil di sini.'
                        }
                        emptyActionLabel={filterActive ? 'Reset filter' : null}
                        emptyActionHref={filterActive ? '/admin/pesan-masuk' : null}
                    />

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-meta text-slate-600">
                            {paginator.rows.length > 0
                                ? `Menampilkan ${formatNumber(paginator.rows.length)} dari ${formatNumber(
                                      paginator.total
                                  )} pesan`
                                : 'Tidak ada pesan untuk ditampilkan.'}
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
                title="Detail pesan"
                description={
                    target
                        ? `${asText(target.name) || 'Tanpa nama'} · ${asText(target.email) || 'Email tidak tersedia'}`
                        : null
                }
                size="lg"
                footer={
                    askDiscard ? (
                        <>
                            <p className="mr-auto self-center text-meta text-ink-soft">
                                Balasan belum tersimpan. Buang perubahan?
                            </p>
                            <Button variant="secondary" onClick={() => setAskDiscard(false)}>
                                Lanjut mengedit
                            </Button>
                            <Button variant="danger" onClick={closeDetail}>
                                Buang
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="secondary"
                                onClick={requestClose}
                                disabled={form.processing || busyId !== null}
                            >
                                Tutup
                            </Button>
                            {target && !target.is_read && (
                                <Button
                                    variant="ghost"
                                    onClick={() => markRead(target)}
                                    loading={busyId === target.id}
                                    disabled={busyId !== null && busyId !== target.id}
                                >
                                    Tandai dibaca
                                </Button>
                            )}
                            <Button
                                variant="primary"
                                onClick={() => submitReply(null)}
                                loading={form.processing}
                                disabled={!replyDirty || busyId !== null}
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
                            <p className="text-badge uppercase text-slate-600">Isi pesan</p>
                            <p className="mt-1 text-h3 text-ink">{asText(target.subject) || 'Tanpa subjek'}</p>

                            <dl className="mt-3 grid gap-x-6 gap-y-1 text-meta text-ink-soft sm:grid-cols-2">
                                <div className="flex gap-2">
                                    <dt className="shrink-0 text-slate-600">Email</dt>
                                    <dd className="min-w-0 break-all">{asText(target.email) || '-'}</dd>
                                </div>
                                <div className="flex gap-2">
                                    <dt className="shrink-0 text-slate-600">Telepon</dt>
                                    <dd>{asText(target.phone) || '-'}</dd>
                                </div>
                                <div className="flex gap-2 sm:col-span-2">
                                    <dt className="shrink-0 text-slate-600">Diterima</dt>
                                    <dd>{formatDateTime(target.created_at)}</dd>
                                </div>
                            </dl>

                            <p className="mt-3 whitespace-pre-line text-body text-ink-soft">
                                {asText(target.message) || '-'}
                            </p>
                        </div>

                        {replyText !== '' && (
                            <div className="border-l-[3px] border-accent-500 bg-surface p-3">
                                <p className="text-badge uppercase text-slate-600">Balasan toko</p>
                                <p className="mt-1 whitespace-pre-line text-meta text-ink-soft">{replyText}</p>
                                <p className="mt-1 text-meta text-slate-600">
                                    {formatDateTime(target.replied_at)}
                                </p>
                            </div>
                        )}

                        <Field
                            label="Balasan"
                            htmlFor="admin_reply"
                            required
                            hint="Maksimal 2000 karakter. Balasan dikirim ke email pengirim."
                            error={form.errors.admin_reply ?? null}
                        >
                            <Textarea
                                id="admin_reply"
                                name="admin_reply"
                                rows={5}
                                maxLength={2000}
                                value={form.data.admin_reply}
                                error={form.errors.admin_reply ?? null}
                                onChange={(event) => form.setData('admin_reply', event.target.value)}
                                placeholder="Tulis balasan untuk pengirim"
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

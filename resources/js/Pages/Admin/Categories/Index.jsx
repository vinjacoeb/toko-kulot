import React, { useEffect, useMemo, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';
import DataTable from '../../../Components/DataTable';
import SearchInput from '../../../Components/SearchInput';
import Select from '../../../Components/Select';
import Field from '../../../Components/Field';
import Input from '../../../Components/Input';
import Textarea from '../../../Components/Textarea';
import Button from '../../../Components/Button';
import Modal from '../../../Components/Modal';
import Pagination from '../../../Components/Pagination';
import StatusBadge from '../../../Components/StatusBadge';
import InlineNotice from '../../../Components/InlineNotice';
import Toast from '../../../Components/Toast';
import { ImageOffIcon } from '../../../Components/icons';
import { formatNumber } from '../../../lib/format';

/**
 * Kategori produk — docs/design.md §5.12 dan docs/kontrak-props.md §12.8–§12.11.
 *
 * Props server (app/Http/Controllers/Admin/CategoryController.php@index):
 *   kategori  paginator Laravel (data, links, meta { current_page, last_page, per_page, total })
 *   filter    { q: string|null, status: 'semua'|'aktif'|'nonaktif' }
 *   ringkasan { total, aktif, nonaktif }
 *   flash     { success, error } — props bersama (HandleInertiaRequests).
 *
 * Kontrak §12.8: tidak ada rute GET `admin/kategori/tambah` maupun `.../ubah` — form
 * tambah/ubah dikerjakan inline di halaman ini dalam Modal. Aksi memakai URL literal
 * routes/admin.php:
 *   POST   /admin/kategori          (§12.9)
 *   PUT    /admin/kategori/{id}     (§12.10, dikirim POST + `_method` karena ada unggahan gambar)
 *   DELETE /admin/kategori/{id}     (§12.11)
 */

const BREADCRUMB = [{ label: 'Dashboard', href: '/admin' }, { label: 'Kategori' }];

const DEFAULT_FILTER = { q: '', status: 'semua' };

/** Enum `status` mengikuti kontrak §12.8: semua | aktif | nonaktif. */
const STATUS_OPTIONS = [
    { value: 'semua', label: 'Semua status' },
    { value: 'aktif', label: 'Aktif' },
    { value: 'nonaktif', label: 'Nonaktif' },
];

/** Nilai awal form tambah/ubah; nama field persis kontrak §12.9–§12.10. */
const FORM_KOSONG = {
    name: '',
    slug: '',
    description: '',
    sort_order: '0',
    is_active: true,
    image: null,
};

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

/** Boolean dari server bisa 0/1/"1"; selain true dianggap nonaktif. */
const asBool = (value) => value === true || value === 1 || value === '1';

/** Normalisasi props `filter` dari server; nilai kosong/tak dikenal -> bawaan. */
const normalizeFilter = (filter) => ({
    q: typeof filter?.q === 'string' ? filter.q : '',
    status: filter?.status === null || filter?.status === undefined ? 'semua' : String(filter.status),
});

/**
 * Paginator Laravel bisa dikirim datar (`current_page`, `last_page`, `total`, `data`) atau
 * dengan `meta` seperti tertulis di kontrak §12.8. Keduanya dibaca supaya halaman tidak
 * bergantung pada satu bentuk saja.
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

/** Thumbnail kategori; berkas kosong atau gagal dimuat jatuh ke placeholder lokal. */
function Thumb({ src }) {
    const [gagal, setGagal] = useState(false);
    const sumber = asText(src);

    if (sumber === '' || gagal) {
        return (
            <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-slate-500"
            >
                <ImageOffIcon className="h-4 w-4" />
            </span>
        );
    }

    return (
        <img
            src={sumber}
            alt=""
            loading="lazy"
            className="h-10 w-10 shrink-0 rounded-md border border-line object-cover"
            onError={() => setGagal(true)}
        />
    );
}

/** Dialog konfirmasi hapus — design §5.12 ("Hapus -> ConfirmDialog dengan nama entitas"). */
function ConfirmDialog({ open, title, description, loading = false, error = null, onConfirm, onClose }) {
    // Desain §5.12 poin "Hapus": fokus awal dialog konfirmasi ada di tombol Batal.
    // Efek di sini berjalan setelah efek focus-trap `Modal`, jadi fokus akhir ada di Batal.
    useEffect(() => {
        if (!open) return undefined;

        const id = window.setTimeout(() => {
            document.getElementById('kategori-confirm-batal')?.focus();
        }, 0);

        return () => window.clearTimeout(id);
    }, [open]);

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            description={description}
            footer={
                <>
                    <Button id="kategori-confirm-batal" variant="secondary" onClick={onClose} disabled={loading}>
                        Batal
                    </Button>
                    <Button variant="danger" onClick={onConfirm} loading={loading}>
                        Hapus
                    </Button>
                </>
            }
        >
            {error ? (
                <InlineNotice tone="error" title="Kategori tidak dihapus">
                    <p>{error}</p>
                </InlineNotice>
            ) : (
                <p className="text-body text-ink-soft">
                    Kategori dihapus permanen. Tindakan ini tidak bisa dibatalkan.
                </p>
            )}
        </Modal>
    );
}

export default function CategoriesIndex({ kategori = null, filter = null, ringkasan = null, flash = null }) {
    const [query, setQuery] = useState(() => normalizeFilter(filter));
    const [navLoading, setNavLoading] = useState(false);
    const [navError, setNavError] = useState(null);
    const [toast, setToast] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [editRow, setEditRow] = useState(null);
    const [hapus, setHapus] = useState(null);
    const [hapusError, setHapusError] = useState(null);
    const [menghapus, setMenghapus] = useState(false);

    const form = useForm({ ...FORM_KOSONG });

    const paginator = useMemo(() => readPaginator(kategori), [kategori]);
    const total = asCount(ringkasan?.total);
    const totalAktif = asCount(ringkasan?.aktif);
    const totalNonaktif = asCount(ringkasan?.nonaktif);

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
        router.get('/admin/kategori', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => {
                setNavLoading(true);
                setNavError(null);
            },
            onFinish: () => setNavLoading(false),
            onError: () => setNavError('Gagal memuat daftar kategori. Periksa koneksi lalu coba lagi.'),
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

    const bukaTambah = () => {
        form.setData({ ...FORM_KOSONG });
        form.clearErrors();
        setEditRow(null);
        setFormOpen(true);
    };

    const bukaUbah = (row) => {
        form.setData({
            name: asText(row.name),
            slug: asText(row.slug),
            description: asText(row.description),
            sort_order: String(asCount(row.sort_order)),
            is_active: asBool(row.is_active),
            image: null,
        });
        form.clearErrors();
        setEditRow(row);
        setFormOpen(true);
    };

    const tutupForm = () => {
        if (form.processing) return;

        setFormOpen(false);
        setEditRow(null);
        form.clearErrors();
    };

    /** Simpan tambah/ubah. Galat validasi server tampil di dalam modal (modal tetap terbuka). */
    const simpan = (event) => {
        if (event) event.preventDefault();

        if (form.processing) return;

        const ubah = editRow !== null;
        const url = ubah ? `/admin/kategori/${editRow.id}` : '/admin/kategori';

        form.transform((data) => (ubah ? { ...data, _method: 'put' } : data));
        form.post(url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setFormOpen(false);
                setEditRow(null);
            },
        });
    };

    const bukaHapus = (row) => {
        setHapusError(null);
        setHapus(row);
    };

    const tutupHapus = () => {
        if (menghapus) return;

        setHapus(null);
        setHapusError(null);
    };

    /**
     * Hapus kategori. Penolakan server (mis. "Kategori masih dipakai 3 produk ...", kontrak
     * §12.11) datang sebagai `errors.kategori` dan ditampilkan di dalam dialog.
     */
    const konfirmasiHapus = () => {
        if (hapus === null || menghapus) return;

        setMenghapus(true);
        setHapusError(null);

        router.delete(`/admin/kategori/${hapus.id}`, {
            preserveScroll: true,
            onHttpException: (response) => {
                if (response?.status === 429) {
                    setHapusError('Terlalu banyak aksi berturut-turut. Tunggu sebentar, lalu coba lagi.');

                    return false;
                }

                return undefined;
            },
            onError: (errors) =>
                setHapusError(errors?.kategori ?? 'Kategori gagal dihapus. Periksa koneksi lalu coba lagi.'),
            onSuccess: () => {
                setHapus(null);
                setHapusError(null);
            },
            onFinish: () => setMenghapus(false),
        });
    };

    const columns = [
        {
            key: 'name',
            header: 'Kategori',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <Thumb src={row.image} />
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{asText(row.name) || '-'}</p>
                        <p className="truncate text-meta text-slate-500">{asText(row.slug) || '-'}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'product_count',
            header: 'Produk',
            align: 'right',
            render: (row) => <span className="whitespace-nowrap">{formatNumber(asCount(row.product_count))}</span>,
        },
        {
            key: 'sort_order',
            header: 'Urutan',
            align: 'right',
            render: (row) => <span className="whitespace-nowrap">{formatNumber(asCount(row.sort_order))}</span>,
        },
        {
            key: 'is_active',
            header: 'Status',
            render: (row) =>
                asBool(row.is_active) ? (
                    <StatusBadge status="aktif" label="Aktif" />
                ) : (
                    <StatusBadge status="nonaktif" label="Nonaktif" />
                ),
        },
        {
            key: 'aksi',
            header: 'Aksi',
            align: 'right',
            render: (row) => (
                <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => bukaUbah(row)}
                        aria-label={`Ubah kategori ${asText(row.name) || 'tanpa nama'}`}
                    >
                        Ubah
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => bukaHapus(row)}
                        aria-label={`Hapus kategori ${asText(row.name) || 'tanpa nama'}`}
                    >
                        Hapus
                    </Button>
                </div>
            ),
        },
    ];

    const namaHapus = hapus ? asText(hapus.name) || 'kategori tanpa nama' : '';
    const namaTerpakai = hapus ? asCount(hapus.product_count) : 0;

    return (
        <AdminLayout title="Kategori">
            <div className="flex flex-col gap-6">
                <PageHeader
                    title="Kategori"
                    breadcrumb={BREADCRUMB}
                    actions={
                        <Button variant="primary" onClick={bukaTambah}>
                            Tambah kategori
                        </Button>
                    }
                />

                <p className="text-meta text-slate-600">
                    Total {formatNumber(total)} kategori · {formatNumber(totalAktif)} aktif ·{' '}
                    {formatNumber(totalNonaktif)} nonaktif
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <SearchInput
                        className="w-full sm:max-w-sm"
                        value={query.q}
                        onChange={(value) => applyFilters({ q: value })}
                        placeholder="Cari nama atau slug kategori"
                        label="Cari kategori"
                        loading={navLoading}
                    />

                    <Field label="Status" htmlFor="filter-status" className="w-full sm:w-48">
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
                        caption="Daftar kategori produk"
                        columns={columns}
                        rows={paginator.rows}
                        loading={navLoading}
                        error={navError}
                        onRetry={reload}
                        emptyTitle={filterActive ? 'Tidak ada kategori yang cocok' : 'Belum ada kategori'}
                        emptyDescription={
                            filterActive
                                ? 'Ubah kata kunci atau filter untuk melihat kategori lain.'
                                : 'Kategori produk akan tampil di sini setelah kamu menambahkannya.'
                        }
                        emptyActionLabel={filterActive ? 'Reset filter' : null}
                        emptyActionHref={filterActive ? '/admin/kategori' : null}
                    />

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-meta text-slate-600">
                            {paginator.rows.length > 0
                                ? `Menampilkan ${formatNumber(paginator.rows.length)} dari ${formatNumber(
                                      paginator.total
                                  )} kategori`
                                : 'Tidak ada kategori untuk ditampilkan.'}
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
                open={formOpen}
                onClose={tutupForm}
                title={editRow === null ? 'Tambah kategori' : 'Ubah kategori'}
                description={
                    editRow === null
                        ? 'Kategori baru langsung bisa dipakai untuk mengelompokkan produk.'
                        : `Perbarui data kategori ${asText(editRow.name) || 'tanpa nama'}.`
                }
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={tutupForm} disabled={form.processing}>
                            Batal
                        </Button>
                        <Button variant="primary" type="submit" form="form-kategori" loading={form.processing}>
                            {editRow === null ? 'Simpan kategori' : 'Simpan perubahan'}
                        </Button>
                    </>
                }
            >
                <form id="form-kategori" className="flex flex-col gap-4" onSubmit={simpan} noValidate>
                    <Field
                        label="Nama"
                        htmlFor="kategori-name"
                        required
                        hint="Maksimal 120 karakter."
                        error={form.errors.name ?? null}
                    >
                        <Input
                            id="kategori-name"
                            name="name"
                            value={form.data.name}
                            maxLength={120}
                            error={form.errors.name ?? null}
                            onChange={(event) => form.setData('name', event.target.value)}
                            placeholder="mis. Daster"
                        />
                    </Field>

                    <Field
                        label="Slug"
                        htmlFor="kategori-slug"
                        hint="Kosongkan untuk dibuat otomatis dari nama."
                        error={form.errors.slug ?? null}
                    >
                        <Input
                            id="kategori-slug"
                            name="slug"
                            value={form.data.slug}
                            error={form.errors.slug ?? null}
                            onChange={(event) => form.setData('slug', event.target.value)}
                            placeholder="mis. daster"
                        />
                    </Field>

                    <Field
                        label="Deskripsi"
                        htmlFor="kategori-description"
                        hint="Opsional, maksimal 1000 karakter."
                        error={form.errors.description ?? null}
                    >
                        <Textarea
                            id="kategori-description"
                            name="description"
                            rows={3}
                            maxLength={1000}
                            value={form.data.description}
                            error={form.errors.description ?? null}
                            onChange={(event) => form.setData('description', event.target.value)}
                            placeholder="Keterangan singkat kategori"
                        />
                    </Field>

                    <Field
                        label="Urutan"
                        htmlFor="kategori-sort"
                        hint="Angka 0-999; nilai lebih kecil tampil lebih dulu."
                        error={form.errors.sort_order ?? null}
                    >
                        <Input
                            id="kategori-sort"
                            name="sort_order"
                            type="number"
                            min={0}
                            max={999}
                            step={1}
                            inputMode="numeric"
                            value={form.data.sort_order}
                            error={form.errors.sort_order ?? null}
                            onChange={(event) => form.setData('sort_order', event.target.value)}
                        />
                    </Field>

                    <Field
                        label="Gambar"
                        htmlFor="kategori-image"
                        hint="Opsional, JPG/PNG/WebP maksimal 2 MB."
                        error={form.errors.image ?? null}
                    >
                        <input
                            id="kategori-image"
                            name="image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            aria-invalid={form.errors.image ? 'true' : undefined}
                            aria-describedby={form.errors.image ? 'kategori-image-error' : 'kategori-image-hint'}
                            className="block w-full rounded-md border border-line bg-white px-3 py-2 text-meta text-ink-soft file:mr-3 file:rounded-sm file:border-0 file:bg-surface file:px-3 file:py-1.5 file:text-meta file:font-semibold file:text-brand"
                            onChange={(event) =>
                                form.setData(
                                    'image',
                                    event.target.files && event.target.files[0] ? event.target.files[0] : null
                                )
                            }
                        />
                    </Field>

                    {editRow !== null && asText(editRow.image) !== '' && (
                        <div className="flex items-center gap-3 rounded-md border border-line bg-surface p-3">
                            <Thumb src={editRow.image} />
                            <p className="text-meta text-slate-600">
                                Gambar saat ini. Unggah berkas baru untuk menggantinya.
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col">
                        <label htmlFor="kategori-active" className="flex items-start gap-3">
                            <input
                                id="kategori-active"
                                name="is_active"
                                type="checkbox"
                                className="mt-0.5 h-4 w-4 shrink-0"
                                checked={asBool(form.data.is_active)}
                                aria-describedby={
                                    form.errors.is_active ? 'kategori-active-error' : 'kategori-active-hint'
                                }
                                onChange={(event) => form.setData('is_active', event.target.checked)}
                            />
                            <span className="text-body text-ink">
                                Tampilkan kategori di katalog
                                <span id="kategori-active-hint" className="mt-0.5 block text-meta text-slate-500">
                                    Kategori nonaktif tidak tampil di halaman publik.
                                </span>
                            </span>
                        </label>
                        {form.errors.is_active && (
                            <p id="kategori-active-error" className="mt-1.5 text-meta text-danger-strong" role="alert">
                                {form.errors.is_active}
                            </p>
                        )}
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                open={hapus !== null}
                title="Hapus kategori?"
                description={
                    namaTerpakai > 0
                        ? `${namaHapus} masih dipakai ${formatNumber(namaTerpakai)} produk.`
                        : `Kategori ${namaHapus} akan dihapus.`
                }
                loading={menghapus}
                error={hapusError}
                onConfirm={konfirmasiHapus}
                onClose={tutupHapus}
            />

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


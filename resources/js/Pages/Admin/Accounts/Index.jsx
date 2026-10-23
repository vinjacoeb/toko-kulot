import React, { useEffect, useMemo, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';
import DataTable from '../../../Components/DataTable';
import SearchInput from '../../../Components/SearchInput';
import Select from '../../../Components/Select';
import Field from '../../../Components/Field';
import Input from '../../../Components/Input';
import Button from '../../../Components/Button';
import Modal from '../../../Components/Modal';
import Pagination from '../../../Components/Pagination';
import StatusBadge from '../../../Components/StatusBadge';
import InlineNotice from '../../../Components/InlineNotice';
import Toast from '../../../Components/Toast';
import { formatDate, formatNumber } from '../../../lib/format';

/**
 * Akun admin — docs/design.md §5.12, docs/PRD.md §9, dan docs/kontrak-props.md §12.19–§12.22.
 *
 * Props server (app/Http/Controllers/Admin/AccountController.php@index):
 *   akun      paginator Laravel (data, links, meta { current_page, last_page, per_page, total })
 *   filter    { q: string|null, role: 'semua'|'owner'|'admin'|'staff' }
 *   ringkasan { total, owner, admin, staff }
 *   flash     { success, error } — props bersama (HandleInertiaRequests).
 *
 * Baris `akun.data` membawa `is_self` (akun yang sedang login) — PRD §9: akun sendiri tidak
 * boleh dihapus, jadi tombol Hapus dimatikan dan alasannya ditampilkan pada baris itu.
 *
 * Kontrak §12.19: tidak ada rute GET `admin/akun/tambah` maupun `.../ubah` — form tambah/ubah
 * dikerjakan inline di halaman ini dalam Modal. Aksi memakai URL literal routes/admin.php:
 *   POST   /admin/akun          (§12.20)
 *   PUT    /admin/akun/{id}     (§12.21)
 *   DELETE /admin/akun/{id}     (§12.22)
 */

const BREADCRUMB = [{ label: 'Dashboard', href: '/admin' }, { label: 'Akun Admin' }];

const DEFAULT_FILTER = { q: '', role: 'semua', status: 'semua' };

/** Label enum `role` mengikuti kontrak §12.19–§12.21: owner | admin | staff. */
const ROLE_LABEL = { owner: 'Owner', admin: 'Admin', staff: 'Staff' };

/** Enum `role` filter mengikuti kontrak §12.19: semua | owner | admin | staff. */
const ROLE_OPTIONS = [
    { value: 'semua', label: 'Semua role' },
    { value: 'owner', label: 'Owner' },
    { value: 'admin', label: 'Admin' },
    { value: 'staff', label: 'Staff' },
];

/** Pilihan role pada form tambah/ubah (tanpa `semua`). */
const ROLE_FORM_OPTIONS = ROLE_OPTIONS.filter((option) => option.value !== 'semua');

/** Enum `status` filter mengikuti kontrak §12.19: semua | aktif | nonaktif. */
const STATUS_OPTIONS = [
    { value: 'semua', label: 'Semua status' },
    { value: 'aktif', label: 'Aktif' },
    { value: 'nonaktif', label: 'Nonaktif' },
];

/** Nilai awal form tambah; nama field persis kontrak §12.20–§12.21. */
const FORM_KOSONG = {
    name: '',
    email: '',
    password: '',
    role: 'admin',
    is_active: true,
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

/** Label role dari server; nilai tak dikenal ditampilkan sebagai "-". */
const roleLabel = (value) => ROLE_LABEL[asText(value)] ?? '-';

/** Normalisasi props `filter` dari server; nilai kosong/tak dikenal -> bawaan. */
const normalizeFilter = (filter) => ({
    q: typeof filter?.q === 'string' ? filter.q : '',
    role: filter?.role === null || filter?.role === undefined ? 'semua' : String(filter.role),
    status:
        filter?.status === null || filter?.status === undefined ? 'semua' : String(filter.status),
});

/**
 * Paginator Laravel bisa dikirim datar (`current_page`, `last_page`, `total`, `data`) atau
 * dengan `meta` seperti tertulis di kontrak §12.19. Keduanya dibaca supaya halaman tidak
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

/** Dialog konfirmasi hapus — design §5.12 ("Hapus -> ConfirmDialog dengan nama entitas"). */
function ConfirmDialog({ open, title, description, loading = false, error = null, onConfirm, onClose }) {
    // Desain §5.12 poin "Hapus": fokus awal dialog konfirmasi ada di tombol Batal.
    // Efek di sini berjalan setelah efek focus-trap `Modal`, jadi fokus akhir ada di Batal.
    useEffect(() => {
        if (!open) return undefined;

        const id = window.setTimeout(() => {
            document.getElementById('akun-confirm-batal')?.focus();
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
                    <Button id="akun-confirm-batal" variant="secondary" onClick={onClose} disabled={loading}>
                        Batal
                    </Button>
                    <Button variant="danger" onClick={onConfirm} loading={loading}>
                        Hapus
                    </Button>
                </>
            }
        >
            {error ? (
                <InlineNotice tone="error" title="Akun tidak dihapus">
                    <p>{error}</p>
                </InlineNotice>
            ) : (
                <p className="text-body text-ink-soft">
                    Akun dihapus permanen dan tidak bisa masuk lagi ke panel admin.
                </p>
            )}
        </Modal>
    );
}

export default function AccountsIndex({ akun = null, filter = null, ringkasan = null, flash = null }) {
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

    const paginator = useMemo(() => readPaginator(akun), [akun]);
    const total = asCount(ringkasan?.total);
    const totalOwner = asCount(ringkasan?.owner);
    const totalAdmin = asCount(ringkasan?.admin);
    const totalStaff = asCount(ringkasan?.staff);
    const totalAktif = asCount(ringkasan?.aktif);

    const filterActive =
        query.q.trim() !== '' ||
        query.role !== DEFAULT_FILTER.role ||
        query.status !== DEFAULT_FILTER.status;

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
        router.get('/admin/akun', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => {
                setNavLoading(true);
                setNavError(null);
            },
            onFinish: () => setNavLoading(false),
            onError: () => setNavError('Gagal memuat daftar akun admin. Periksa koneksi lalu coba lagi.'),
        });
    };

    /** Parameter query yang benar-benar dikirim: nilai bawaan tidak ditulis ke URL. */
    const paramsFor = (source, page = 1) => {
        const params = {};
        const q = source.q.trim();

        if (q !== '') params.q = q;
        if (source.role !== DEFAULT_FILTER.role) params.role = source.role;
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
            email: asText(row.email),
            password: '',
            role: asText(row.role) || 'admin',
            is_active: asBool(row.is_active),
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

    /**
     * Simpan tambah/ubah. Galat validasi server tampil di dalam modal (modal tetap terbuka).
     * Saat mengubah akun, kolom password yang kosong tidak dikirim supaya password lama tetap.
     */
    const simpan = (event) => {
        if (event) event.preventDefault();

        if (form.processing) return;

        const ubah = editRow !== null;

        form.transform((data) => {
            if (!ubah) return data;

            const next = { ...data };

            if (String(next.password ?? '').trim() === '') delete next.password;

            return next;
        });

        if (ubah) {
            form.put(`/admin/akun/${editRow.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setFormOpen(false);
                    setEditRow(null);
                },
            });

            return;
        }

        form.post('/admin/akun', {
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
     * Hapus akun. Penolakan server datang sebagai `errors.akun` dan ditampilkan di dalam dialog.
     * Akun sendiri tidak bisa dihapus (PRD §9); tombolnya memang sudah dimatikan di tabel.
     */
    const konfirmasiHapus = () => {
        if (hapus === null || menghapus) return;

        if (asBool(hapus.is_self)) {
            setHapusError('Tidak bisa menghapus akun sendiri.');

            return;
        }

        setMenghapus(true);
        setHapusError(null);

        router.delete(`/admin/akun/${hapus.id}`, {
            preserveScroll: true,
            onHttpException: (response) => {
                if (response?.status === 429) {
                    setHapusError('Terlalu banyak aksi berturut-turut. Tunggu sebentar, lalu coba lagi.');

                    return false;
                }

                return undefined;
            },
            onError: (errors) =>
                setHapusError(errors?.akun ?? 'Akun gagal dihapus. Periksa koneksi lalu coba lagi.'),
            onSuccess: () => {
                setHapus(null);
                setHapusError(null);
            },
            onFinish: () => setMenghapus(false),
        });
    };

    const SELF_REASON_ID = 'akun-self-reason';

    const columns = [
        {
            key: 'name',
            header: 'Akun',
            render: (row) => (
                <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{asText(row.name) || '-'}</p>
                    <p className="truncate text-meta text-slate-500">{asText(row.email) || '-'}</p>
                </div>
            ),
        },
        {
            key: 'role',
            header: 'Role',
            render: (row) => <span className="whitespace-nowrap">{roleLabel(row.role)}</span>,
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
            key: 'created_at',
            header: 'Dibuat',
            render: (row) => (
                <span className="whitespace-nowrap">
                    {asText(row.created_at) === '' ? '-' : formatDate(row.created_at)}
                </span>
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
                        aria-label={`Ubah akun ${asText(row.name) || 'tanpa nama'}`}
                    >
                        Ubah
                    </Button>
                    {asBool(row.is_self) ? (
                        <>
                            <Button
                                variant="danger"
                                size="sm"
                                disabled
                                title="Tidak bisa menghapus akun sendiri"
                                aria-describedby={SELF_REASON_ID}
                            >
                                Hapus
                            </Button>
                            <span id={SELF_REASON_ID} className="text-meta text-slate-500">
                                Akun sendiri
                            </span>
                        </>
                    ) : (
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => bukaHapus(row)}
                            aria-label={`Hapus akun ${asText(row.name) || 'tanpa nama'}`}
                        >
                            Hapus
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    const namaHapus = hapus ? asText(hapus.name) || 'akun tanpa nama' : '';

    return (
        <AdminLayout title="Akun Admin">
            <div className="flex flex-col gap-6">
                <PageHeader
                    title="Akun Admin"
                    breadcrumb={BREADCRUMB}
                    actions={
                        <Button variant="primary" onClick={bukaTambah}>
                            Tambah admin
                        </Button>
                    }
                />

                <p className="text-meta text-slate-600">
                    Total {formatNumber(total)} akun · {formatNumber(totalOwner)} owner ·{' '}
                    {formatNumber(totalAdmin)} admin · {formatNumber(totalStaff)} staff ·{' '}
                    {formatNumber(totalAktif)} aktif
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <SearchInput
                        className="w-full sm:max-w-sm"
                        value={query.q}
                        onChange={(value) => applyFilters({ q: value })}
                        placeholder="Cari nama atau email"
                        label="Cari akun admin"
                        loading={navLoading}
                    />

                    <Field label="Role" htmlFor="filter-role" className="w-full sm:w-48">
                        <Select
                            id="filter-role"
                            value={query.role}
                            onChange={(event) => applyFilters({ role: event.target.value })}
                        >
                            {ROLE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    </Field>

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
                        caption="Daftar akun admin"
                        columns={columns}
                        rows={paginator.rows}
                        loading={navLoading}
                        error={navError}
                        onRetry={reload}
                        emptyTitle={filterActive ? 'Tidak ada akun yang cocok' : 'Belum ada akun admin'}
                        emptyDescription={
                            filterActive
                                ? 'Ubah kata kunci atau filter untuk melihat akun lain.'
                                : 'Akun admin akan tampil di sini setelah kamu menambahkannya.'
                        }
                        emptyActionLabel={filterActive ? 'Reset filter' : null}
                        emptyActionHref={filterActive ? '/admin/akun' : null}
                    />

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-meta text-slate-600">
                            {paginator.rows.length > 0
                                ? `Menampilkan ${formatNumber(paginator.rows.length)} dari ${formatNumber(
                                      paginator.total
                                  )} akun`
                                : 'Tidak ada akun untuk ditampilkan.'}
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
                title={editRow === null ? 'Tambah akun admin' : 'Ubah akun admin'}
                description={
                    editRow === null
                        ? 'Akun baru bisa langsung masuk ke panel admin setelah disimpan.'
                        : `Perbarui data akun ${asText(editRow.name) || 'tanpa nama'}.`
                }
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={tutupForm} disabled={form.processing}>
                            Batal
                        </Button>
                        <Button variant="primary" type="submit" form="form-akun" loading={form.processing}>
                            {editRow === null ? 'Simpan akun' : 'Simpan perubahan'}
                        </Button>
                    </>
                }
            >
                <form id="form-akun" className="flex flex-col gap-4" onSubmit={simpan} noValidate>
                    <Field
                        label="Nama"
                        htmlFor="akun-name"
                        required
                        hint="Maksimal 120 karakter."
                        error={form.errors.name ?? null}
                    >
                        <Input
                            id="akun-name"
                            name="name"
                            value={form.data.name}
                            maxLength={120}
                            error={form.errors.name ?? null}
                            onChange={(event) => form.setData('name', event.target.value)}
                            placeholder="mis. Siti Aminah"
                        />
                    </Field>

                    <Field
                        label="Email"
                        htmlFor="akun-email"
                        required
                        hint="Dipakai untuk masuk ke panel admin."
                        error={form.errors.email ?? null}
                    >
                        <Input
                            id="akun-email"
                            name="email"
                            type="email"
                            autoComplete="off"
                            value={form.data.email}
                            error={form.errors.email ?? null}
                            onChange={(event) => form.setData('email', event.target.value)}
                            placeholder="mis. admin@tokokulot.test"
                        />
                    </Field>

                    <Field
                        label="Password"
                        htmlFor="akun-password"
                        required={editRow === null}
                        hint={
                            editRow === null
                                ? 'Minimal 8 karakter.'
                                : 'Biarkan kosong bila tidak ingin mengganti password.'
                        }
                        error={form.errors.password ?? null}
                    >
                        <Input
                            id="akun-password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            value={form.data.password}
                            error={form.errors.password ?? null}
                            onChange={(event) => form.setData('password', event.target.value)}
                            placeholder={editRow === null ? 'Minimal 8 karakter' : 'Password baru (opsional)'}
                        />
                    </Field>

                    <Field label="Role" htmlFor="akun-role" required error={form.errors.role ?? null}>
                        <Select
                            id="akun-role"
                            name="role"
                            value={form.data.role}
                            error={form.errors.role ?? null}
                            onChange={(event) => form.setData('role', event.target.value)}
                        >
                            {ROLE_FORM_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    </Field>

                    <div className="flex flex-col">
                        <label htmlFor="akun-active" className="flex items-start gap-3">
                            <input
                                id="akun-active"
                                name="is_active"
                                type="checkbox"
                                className="mt-0.5 h-4 w-4 shrink-0"
                                checked={asBool(form.data.is_active)}
                                aria-describedby={
                                    form.errors.is_active ? 'akun-active-error' : 'akun-active-hint'
                                }
                                onChange={(event) => form.setData('is_active', event.target.checked)}
                            />
                            <span className="text-body text-ink">
                                Akun aktif
                                <span id="akun-active-hint" className="mt-0.5 block text-meta text-slate-500">
                                    Hanya akun aktif yang bisa masuk ke panel admin.
                                </span>
                            </span>
                        </label>
                        {form.errors.is_active && (
                            <p id="akun-active-error" className="mt-1.5 text-meta text-danger-strong" role="alert">
                                {form.errors.is_active}
                            </p>
                        )}
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                open={hapus !== null}
                title="Hapus akun admin?"
                description={`Akun ${namaHapus} akan dihapus dan tidak bisa masuk lagi ke panel admin.`}
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


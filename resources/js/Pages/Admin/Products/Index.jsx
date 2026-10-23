import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';
import Badge from '../../../Components/Badge';
import Button from '../../../Components/Button';
import DataTable from '../../../Components/DataTable';
import Field from '../../../Components/Field';
import KpiCard from '../../../Components/KpiCard';
import Modal from '../../../Components/Modal';
import Pagination from '../../../Components/Pagination';
import SearchInput from '../../../Components/SearchInput';
import Select from '../../../Components/Select';
import StatusBadge from '../../../Components/StatusBadge';
import Toast from '../../../Components/Toast';
import { ImageOffIcon } from '../../../Components/icons';
import { formatNumber, rupiah } from '../../../lib/format';

/**
 * Daftar produk admin — PRD §9, design §5.12 (pola baku: PageHeader → toolbar →
 * DataTable → Pagination), kontrak props §12.1.
 * Filter dan urutan dikirim ke server lewat query string; server yang menyaring.
 */
const BREADCRUMB = [{ label: 'Dashboard', href: '/admin' }, { label: 'Produk' }];

const DASAR = { q: '', kategori: '', status: 'semua', stok: 'semua', urut: 'terbaru' };

const STATUS = [
    { value: 'semua', label: 'Semua status' },
    { value: 'aktif', label: 'Aktif' },
    { value: 'nonaktif', label: 'Nonaktif' },
];

const STOK = [
    { value: 'semua', label: 'Semua stok' },
    { value: 'habis', label: 'Stok habis' },
    { value: 'kritis', label: 'Stok kritis (di bawah 5)' },
];

const URUT = [
    { value: 'terbaru', label: 'Terbaru' },
    { value: 'nama', label: 'Nama A–Z' },
    { value: 'harga', label: 'Harga terendah' },
    { value: 'stok', label: 'Stok terendah' },
];

const asText = (value) => (value === null || value === undefined ? '' : String(value));

const asAngka = (value) => {
    const angka = Number(value);

    return Number.isFinite(angka) ? angka : 0;
};

const angkaTeks = (value) => (value === null || value === undefined ? '-' : formatNumber(value));

const keFilter = (sumber) => ({
    q: asText(sumber?.q ?? ''),
    kategori: sumber?.kategori === null || sumber?.kategori === undefined ? '' : asText(sumber.kategori),
    status: sumber?.status ? asText(sumber.status) : DASAR.status,
    stok: sumber?.stok ? asText(sumber.stok) : DASAR.stok,
    urut: sumber?.urut ? asText(sumber.urut) : DASAR.urut,
});

export default function Index({ produk = null, filter = null, kategori = [], ringkasan = null, flash = null }) {
    const aktif = keFilter(filter);
    const [memuat, setMemuat] = useState(false);
    const [galat, setGalat] = useState(null);
    const [toast, setToast] = useState(null);
    const [hapus, setHapus] = useState(null);

    // Pesan sukses dari server (flash.success) — pola sama dengan Admin/Categories/Index.jsx.
    useEffect(() => {
        if (flash?.success) {
            setToast({ tone: 'success', title: 'Berhasil', message: String(flash.success) });
        }
    }, [flash?.success]);

    const daftar = Array.isArray(produk?.data) ? produk.data : [];
    const meta = produk?.meta ?? {};
    const halaman = asAngka(meta.current_page) || 1;
    const halamanAkhir = asAngka(meta.last_page) || 1;

    const adaFilter =
        aktif.q !== DASAR.q ||
        aktif.kategori !== DASAR.kategori ||
        aktif.status !== DASAR.status ||
        aktif.stok !== DASAR.stok ||
        aktif.urut !== DASAR.urut;

    const buka = (perubahan, opsi = {}) => {
        const berikut = { ...aktif, ...perubahan };
        const query = {};

        if (berikut.q !== '') query.q = berikut.q;
        if (berikut.kategori !== '') query.kategori = berikut.kategori;
        if (berikut.status !== DASAR.status) query.status = berikut.status;
        if (berikut.stok !== DASAR.stok) query.stok = berikut.stok;
        if (berikut.urut !== DASAR.urut) query.urut = berikut.urut;
        if (opsi.page && opsi.page > 1) query.page = opsi.page;

        router.get('/admin/produk', query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => {
                setMemuat(true);
                setGalat(null);
            },
            onFinish: () => setMemuat(false),
            onError: () => setGalat('Gagal memuat daftar produk. Periksa koneksi lalu coba lagi.'),
        });
    };

    const reset = () => buka({ ...DASAR });

    const gantiSort = (key) => {
        const berikut = aktif.urut === key && key !== 'terbaru' ? 'terbaru' : key;

        buka({ urut: berikut });
    };

    const kolom = [
        {
            key: 'nama',
            header: 'Produk',
            width: 220,
            render: (baris) => (
                <div className="flex items-center gap-3">
                    {asText(baris?.image?.path) === '' ? (
                        <span className="flex h-thumb w-thumb shrink-0 items-center justify-center rounded-md border border-line bg-surface text-slate-500">
                            <ImageOffIcon />
                        </span>
                    ) : (
                        <img
                            src={asText(baris.image.path)}
                            alt={asText(baris.image.alt)}
                            loading="lazy"
                            className="h-thumb w-thumb shrink-0 rounded-md border border-line object-cover"
                        />
                    )}
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{asText(baris?.name) || '-'}</p>
                        <p className="truncate text-meta text-slate-500">{asText(baris?.sku) || 'Tanpa SKU'}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'kategori',
            header: 'Kategori',
            width: 108,
            sortable: false,
            render: (baris) => asText(baris?.category?.name) || '-',
        },
        {
            key: 'harga',
            header: 'Harga',
            width: 100,
            align: 'right',
            render: (baris) => rupiah(baris?.base_price) ?? '-',
        },
        {
            key: 'stok',
            header: 'Stok',
            width: 80,
            align: 'right',
            render: (baris) => (
                <div className="flex flex-col items-end">
                    <span className="font-semibold text-ink">{angkaTeks(baris?.stock)}</span>
                    <span className="text-meta text-slate-500">
                        {baris?.variant_count === null || baris?.variant_count === undefined
                            ? '-'
                            : `${formatNumber(baris.variant_count)} varian`}
                    </span>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            width: 176,
            sortable: false,
            render: (baris) => (
                <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                        status={baris?.is_active ? 'aktif' : 'nonaktif'}
                        label={baris?.is_active ? 'Aktif' : 'Nonaktif'}
                    />
                    {baris?.is_featured && <Badge tone="brand">Unggulan</Badge>}
                </div>
            ),
        },
        {
            key: 'aksi',
            header: 'Aksi',
            width: 256,
            align: 'right',
            sortable: false,
            render: (baris) => (
                <div className="flex items-center justify-end gap-2">
                    <Button variant="secondary" size="sm" href={`/admin/produk/${baris?.id}`}>
                        Detail
                    </Button>
                    <Button variant="secondary" size="sm" href={`/admin/produk/${baris?.id}/ubah`}>
                        Ubah
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setHapus(baris)}>
                        Hapus
                    </Button>
                </div>
            ),
        },
    ];

    const konfirmasiHapus = () => {
        if (hapus === null) return;

        router.delete(`/admin/produk/${hapus.id}`, {
            preserveScroll: true,
            onFinish: () => setHapus(null),
        });
    };

    return (
        <AdminLayout title="Produk">
            <div className="flex flex-col gap-6">
                <PageHeader
                    title="Produk"
                    breadcrumb={BREADCRUMB}
                    description="Kelola katalog produk, harga, varian, dan stok."
                    actions={
                        <Button variant="primary" href="/admin/produk/tambah">
                            Tambah produk
                        </Button>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        label="Total produk"
                        value={angkaTeks(ringkasan?.total)}
                        href="/admin/produk"
                    />
                    <KpiCard
                        label="Produk aktif"
                        value={angkaTeks(ringkasan?.aktif)}
                        href="/admin/produk?status=aktif"
                    />
                    <KpiCard
                        label="Produk nonaktif"
                        value={angkaTeks(ringkasan?.nonaktif)}
                        href="/admin/produk?status=nonaktif"
                    />
                    <KpiCard
                        label="Stok kritis"
                        value={angkaTeks(ringkasan?.stok_kritis)}
                        href="/admin/produk?stok=kritis"
                    />
                </div>

                <div className="flex flex-col gap-4 rounded-lg border border-line bg-white p-4">
                    <SearchInput value={aktif.q} onChange={(nilai) => buka({ q: nilai })} loading={memuat} />

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <Field label="Kategori" htmlFor="filter-kategori">
                            <Select
                                id="filter-kategori"
                                value={aktif.kategori}
                                disabled={memuat}
                                onChange={(event) => buka({ kategori: event.target.value })}
                            >
                                <option value="">Semua kategori</option>
                                {kategori.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {asText(item.name)}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        <Field label="Status" htmlFor="filter-status">
                            <Select
                                id="filter-status"
                                value={aktif.status}
                                disabled={memuat}
                                onChange={(event) => buka({ status: event.target.value })}
                            >
                                {STATUS.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        <Field label="Stok" htmlFor="filter-stok">
                            <Select
                                id="filter-stok"
                                value={aktif.stok}
                                disabled={memuat}
                                onChange={(event) => buka({ stok: event.target.value })}
                            >
                                {STOK.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        <Field label="Urutkan" htmlFor="filter-urut">
                            <Select
                                id="filter-urut"
                                value={aktif.urut}
                                disabled={memuat}
                                onChange={(event) => buka({ urut: event.target.value })}
                            >
                                {URUT.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </Select>
                        </Field>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-meta text-slate-500">
                            Menampilkan {formatNumber(daftar.length)} dari {angkaTeks(meta.total)} produk.
                        </p>
                        {adaFilter && (
                            <Button variant="secondary" size="sm" onClick={reset} disabled={memuat}>
                                Reset filter
                            </Button>
                        )}
                    </div>
                </div>

                <DataTable
                    columns={kolom}
                    rows={daftar}
                    loading={memuat}
                    error={galat}
                    onRetry={() => buka({})}
                    emptyTitle={adaFilter ? 'Tidak ada produk yang cocok' : 'Belum ada produk'}
                    emptyDescription={
                        adaFilter
                            ? 'Ubah kata kunci atau reset filter untuk melihat produk lain.'
                            : 'Tambahkan produk pertama agar katalog toko terisi.'
                    }
                    emptyActionLabel={adaFilter ? null : 'Tambah produk'}
                    emptyActionHref={adaFilter ? null : '/admin/produk/tambah'}
                    sort={{ key: aktif.urut, dir: aktif.urut === 'terbaru' ? 'desc' : 'asc' }}
                    onSort={gantiSort}
                    caption="Daftar produk"
                />

                <Pagination currentPage={halaman} lastPage={halamanAkhir} onPageChange={(page) => buka({}, { page })} />

                <Modal
                    open={hapus !== null}
                    onClose={() => setHapus(null)}
                    title="Hapus produk?"
                    description={hapus ? `Produk "${asText(hapus.name)}" akan dihapus dari katalog.` : ''}
                    footer={
                        <>
                            <Button variant="secondary" onClick={() => setHapus(null)}>
                                Batal
                            </Button>
                            <Button variant="danger" onClick={konfirmasiHapus}>
                                Hapus produk
                            </Button>
                        </>
                    }
                >
                    <p className="text-body text-ink-soft">
                        Gambar galeri produk ikut dihapus dari server. Tindakan ini tidak bisa dibatalkan.
                    </p>
                </Modal>
            </div>

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

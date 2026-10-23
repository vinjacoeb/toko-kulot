import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';
import DataTable from '../../../Components/DataTable';
import Pagination from '../../../Components/Pagination';
import SearchInput from '../../../Components/SearchInput';
import Select from '../../../Components/Select';
import Field from '../../../Components/Field';
import Button from '../../../Components/Button';
import Toast from '../../../Components/Toast';
import Badge from '../../../Components/Badge';
import KpiCard from '../../../Components/KpiCard';
import { formatDateTime, formatNumber } from '../../../lib/format';

/**
 * Riwayat pergerakan stok — PRD bagian stok admin (`/admin/stok/riwayat`), design §5.12
 * (pola baku daftar admin: PageHeader → KpiCard → toolbar → DataTable → Pagination),
 * kontrak props §12.15.
 *
 * Props server (app/Http/Controllers/Admin/StockController.php@history):
 *   riwayat   paginator { data, links, meta { current_page, last_page, per_page, total } }
 *   filter    { q: string|null, tipe: 'semua'|'in'|'out'|'adjust'|'sale', varian: int|null }
 *   varian    [{ id, label, product_name, sku }] untuk dropdown filter (maks 200, kontrak §12.15)
 *   ringkasan { masuk, keluar, adjust, sale } — jumlah baris pergerakan per tipe
 *   flash     { success, error } — props bersama (HandleInertiaRequests)
 *
 * Baris: { id, product_name, variant_label, variant_sku, type, tipe_label, qty, signed_qty,
 * note, admin:{id,name}|null, created_at }. `signed_qty` = qty bertanda (in positif;
 * out/sale negatif; adjust mengikuti selisih) — dipakai apa adanya untuk kolom Jumlah.
 *
 * Filter dan paginasi dikirim ke server lewat query string (`router.get`); server yang
 * menyaring dan mengurutkan (terbaru dulu, kontrak §12.15). Tabel tidak menyediakan
 * tombol urut karena kontrak tidak punya parameter `urut` di halaman ini.
 */

const BREADCRUMB = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Stok', href: '/admin/stok' },
    { label: 'Riwayat pergerakan' },
];

const DASAR = { q: '', tipe: 'semua', varian: '' };

/** Enum `tipe` filter kontrak §12.15; label sama dengan StockMovement::TYPE_LABELS. */
const TIPE = [
    { value: 'semua', label: 'Semua tipe' },
    { value: 'in', label: 'Stok masuk' },
    { value: 'out', label: 'Stok keluar' },
    { value: 'adjust', label: 'Penyesuaian' },
    { value: 'sale', label: 'Penjualan' },
];

/** Tone badge per tipe pergerakan — semua tone kelas baku design §4.21 v2.1. */
const TONE_TIPE = {
    in: 'success',
    out: 'danger',
    adjust: 'brand',
    sale: 'sale',
};

const asText = (value) => (value === null || value === undefined ? '' : String(value));

const asAngka = (value) => {
    const angka = Number(value);

    return Number.isFinite(angka) ? angka : 0;
};

const angkaTeks = (value) => (value === null || value === undefined ? '-' : formatNumber(value));

/** Normalisasi props `filter` dari server; nilai kosong/tak dikenal -> bawaan. */
const keFilter = (sumber) => ({
    q: asText(sumber?.q ?? ''),
    tipe: sumber?.tipe ? asText(sumber.tipe) : DASAR.tipe,
    varian: sumber?.varian === null || sumber?.varian === undefined ? '' : asText(sumber.varian),
});

export default function History({ riwayat = null, filter = null, varian = [], ringkasan = null, flash = null }) {
    const aktif = keFilter(filter);
    const [memuat, setMemuat] = useState(false);
    const [galat, setGalat] = useState(null);
    const [toast, setToast] = useState(null);

    // Pesan server (flash) selalu ditampilkan — pola sama dengan Admin/Accounts/Index.jsx.
    useEffect(() => {
        if (flash?.success) {
            setToast({ tone: 'success', title: 'Berhasil', message: String(flash.success) });
        } else if (flash?.error) {
            setToast({ tone: 'error', title: 'Gagal', message: String(flash.error) });
        }
    }, [flash?.success, flash?.error]);

    const daftar = Array.isArray(riwayat?.data) ? riwayat.data : [];
    const meta = riwayat?.meta ?? {};
    const halaman = asAngka(meta.current_page) || 1;
    const halamanAkhir = asAngka(meta.last_page) || 1;
    const total = meta.total === null || meta.total === undefined ? '-' : formatNumber(meta.total);
    const daftarVarian = Array.isArray(varian) ? varian.filter(Boolean) : [];

    const adaFilter = aktif.q !== DASAR.q || aktif.tipe !== DASAR.tipe || aktif.varian !== DASAR.varian;

    const buka = (perubahan, opsi = {}) => {
        const berikut = { ...aktif, ...perubahan };
        const query = {};

        if (berikut.q !== '') query.q = berikut.q;
        if (berikut.tipe !== DASAR.tipe) query.tipe = berikut.tipe;
        if (berikut.varian !== '') query.varian = berikut.varian;
        if (opsi.page && opsi.page > 1) query.page = opsi.page;

        router.get('/admin/stok/riwayat', query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => {
                setMemuat(true);
                setGalat(null);
            },
            onFinish: () => setMemuat(false),
            onError: () => setGalat('Gagal memuat riwayat stok. Periksa koneksi lalu coba lagi.'),
        });
    };

    const reset = () => buka({ ...DASAR });

    /** Angka bertanda dari server: `+10` untuk masuk, `-3` untuk keluar/penjualan. */
    const jumlahTanda = (baris) => {
        const nilai = asAngka(baris?.signed_qty);

        return `${nilai > 0 ? '+' : nilai < 0 ? '−' : ''}${formatNumber(Math.abs(nilai))}`;
    };

    const kolom = [
        {
            key: 'waktu',
            header: 'Waktu',
            sortable: false,
            render: (baris) => (
                <span className="whitespace-nowrap">
                    {asText(baris?.created_at) === '' ? '-' : formatDateTime(baris.created_at)}
                </span>
            ),
        },
        {
            key: 'produk',
            header: 'Produk',
            sortable: false,
            render: (baris) => (
                <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{asText(baris?.product_name) || '-'}</p>
                    <p className="truncate text-meta text-slate-500">
                        {asText(baris?.variant_label) || 'Varian tidak ditemukan'}
                    </p>
                </div>
            ),
        },
        {
            key: 'sku',
            header: 'SKU',
            sortable: false,
            render: (baris) => (
                <span className="whitespace-nowrap">{asText(baris?.variant_sku) || '-'}</span>
            ),
        },
        {
            key: 'tipe',
            header: 'Tipe',
            sortable: false,
            render: (baris) => (
                <Badge tone={TONE_TIPE[asText(baris?.type)] ?? 'brand'}>
                    {asText(baris?.tipe_label) || '-'}
                </Badge>
            ),
        },
        {
            key: 'jumlah',
            header: 'Jumlah',
            align: 'right',
            sortable: false,
            render: (baris) => {
                const nilai = asAngka(baris?.signed_qty);

                return (
                    <span
                        className={
                            nilai > 0
                                ? 'font-semibold text-success-strong'
                                : nilai < 0
                                  ? 'font-semibold text-danger-strong'
                                  : 'font-semibold text-slate-600'
                        }
                    >
                        {jumlahTanda(baris)}
                    </span>
                );
            },
        },
        {
            key: 'catatan',
            header: 'Catatan',
            sortable: false,
            render: (baris) => (
                <span className="block max-w-[320px] whitespace-pre-line break-words text-ink">
                    {asText(baris?.note) === '' ? '-' : asText(baris.note)}
                </span>
            ),
        },
        {
            key: 'petugas',
            header: 'Petugas',
            sortable: false,
            render: (baris) => (
                <span className="whitespace-nowrap">{asText(baris?.admin?.name) || '-'}</span>
            ),
        },
    ];

    return (
        <AdminLayout title="Riwayat stok">
            <div className="flex flex-col gap-6">
                <PageHeader
                    title="Riwayat pergerakan"
                    breadcrumb={BREADCRUMB}
                    description="Semua perubahan stok varian: stok masuk, stok keluar, penyesuaian dari form produk, dan pengurangan dari pesanan."
                    actions={
                        <Button variant="secondary" href="/admin/stok">
                            Daftar stok
                        </Button>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <KpiCard label="Pergerakan masuk" value={angkaTeks(ringkasan?.masuk)} href="/admin/stok/riwayat?tipe=in" />
                    <KpiCard label="Pergerakan keluar" value={angkaTeks(ringkasan?.keluar)} href="/admin/stok/riwayat?tipe=out" />
                    <KpiCard label="Penyesuaian" value={angkaTeks(ringkasan?.adjust)} href="/admin/stok/riwayat?tipe=adjust" />
                    <KpiCard label="Penjualan" value={angkaTeks(ringkasan?.sale)} href="/admin/stok/riwayat?tipe=sale" />
                </div>

                <p className="text-meta text-slate-600">
                    Angka kartu adalah jumlah baris pergerakan per tipe, bukan jumlah unit stok. Kolom Jumlah
                    memakai angka bertanda dari server: masuk positif, keluar dan penjualan negatif, penyesuaian
                    mengikuti selisih.
                </p>

                <div className="flex flex-col gap-4 rounded-lg border border-line bg-white p-4">
                    <SearchInput
                        value={aktif.q}
                        onChange={(nilai) => buka({ q: nilai })}
                        placeholder="Cari nama produk, SKU, atau catatan"
                        label="Cari riwayat pergerakan stok"
                        loading={memuat}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Tipe pergerakan" htmlFor="riwayat-tipe">
                            <Select
                                id="riwayat-tipe"
                                value={aktif.tipe}
                                disabled={memuat}
                                onChange={(event) => buka({ tipe: event.target.value })}
                            >
                                {TIPE.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        <Field label="Varian" htmlFor="riwayat-varian">
                            <Select
                                id="riwayat-varian"
                                value={aktif.varian}
                                disabled={memuat}
                                onChange={(event) => buka({ varian: event.target.value })}
                            >
                                <option value="">Semua varian</option>
                                {daftarVarian.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {`${asText(item.product_name) || 'Produk tanpa nama'} — ${
                                            asText(item.label) || 'varian tanpa label'
                                        }`}
                                    </option>
                                ))}
                            </Select>
                        </Field>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-meta text-slate-500">
                            Menampilkan {formatNumber(daftar.length)} dari {total} pergerakan.
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
                    emptyTitle={adaFilter ? 'Tidak ada pergerakan yang cocok' : 'Belum ada pergerakan stok'}
                    emptyDescription={
                        adaFilter
                            ? 'Ubah kata kunci atau reset filter untuk melihat riwayat lain.'
                            : 'Riwayat terisi otomatis saat ada stok masuk, stok keluar, penyesuaian dari form produk, atau pengurangan dari pesanan.'
                    }
                    emptyActionLabel={adaFilter ? null : 'Lihat daftar stok'}
                    emptyActionHref={adaFilter ? null : '/admin/stok'}
                    caption="Riwayat pergerakan stok"
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-meta text-slate-600">
                        Halaman {formatNumber(halaman)} dari {formatNumber(halamanAkhir)}
                    </p>
                    <Pagination
                        currentPage={halaman}
                        lastPage={halamanAkhir}
                        onPageChange={(page) => buka({}, { page })}
                    />
                </div>
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

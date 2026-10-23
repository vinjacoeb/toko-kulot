import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';
import KpiCard from '../../../Components/KpiCard';
import SearchInput from '../../../Components/SearchInput';
import Field from '../../../Components/Field';
import Input from '../../../Components/Input';
import Select from '../../../Components/Select';
import Button from '../../../Components/Button';
import DataTable from '../../../Components/DataTable';
import Pagination from '../../../Components/Pagination';
import StatusBadge from '../../../Components/StatusBadge';
import InlineNotice from '../../../Components/InlineNotice';
import Toast from '../../../Components/Toast';
import { formatDate, formatNumber, rupiah } from '../../../lib/format';

/**
 * Daftar pesanan admin — kontrak props §12.16 (GET /admin/pesanan, rute admin.pesanan.index).
 * Filter dan paginasi dikirim ke server lewat query string; server adalah sumber hasil.
 * Query: page (min 1), q (max 100), status (semua|pending|dibayar|diproses|dikirim|selesai|batal),
 * bayar (semua|pending|settlement|expire|deny|cancel), dari & sampai (YYYY-MM-DD).
 */

const DASAR = { q: '', status: 'semua', bayar: 'semua', dari: '', sampai: '' };

const STATUS = [
    { value: 'semua', label: 'Semua status' },
    { value: 'pending', label: 'Pending' },
    { value: 'dibayar', label: 'Dibayar' },
    { value: 'diproses', label: 'Diproses' },
    { value: 'dikirim', label: 'Dikirim' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'batal', label: 'Batal' },
];

const BAYAR = [
    { value: 'semua', label: 'Semua pembayaran' },
    { value: 'pending', label: 'Menunggu pembayaran' },
    { value: 'settlement', label: 'Lunas' },
    { value: 'expire', label: 'Kedaluwarsa' },
    { value: 'deny', label: 'Ditolak' },
    { value: 'cancel', label: 'Dibatalkan' },
];

const asText = (value) => (value === null || value === undefined ? '' : String(value));

const keFilter = (sumber) => ({
    q: asText(sumber?.q),
    status: sumber?.status ? asText(sumber.status) : DASAR.status,
    bayar: sumber?.bayar ? asText(sumber.bayar) : DASAR.bayar,
    dari: asText(sumber?.dari),
    sampai: asText(sumber?.sampai),
});

export default function Index({ pesanan = null, filter = null, ringkasan = null, flash = null }) {
    const daftar = Array.isArray(pesanan?.data) ? pesanan.data : [];
    const meta = pesanan?.meta ?? null;

    const aktif = keFilter(filter);
    const adaFilter =
        aktif.q !== '' ||
        aktif.status !== DASAR.status ||
        aktif.bayar !== DASAR.bayar ||
        aktif.dari !== '' ||
        aktif.sampai !== '';

    const [memuat, setMemuat] = useState(false);
    const [galat, setGalat] = useState(null);
    const [galatTanggal, setGalatTanggal] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setToast({ tone: 'success', title: 'Berhasil', message: asText(flash.success) });
        } else if (flash?.error) {
            setToast({ tone: 'error', title: 'Gagal', message: asText(flash.error) });
        }
    }, [flash?.success, flash?.error]);

    const halaman = Number(meta?.current_page) > 0 ? Number(meta.current_page) : 1;
    const halamanAkhir = Number(meta?.last_page) > 0 ? Number(meta.last_page) : 1;

    const urlFilter = (perubahan = {}) => {
        const berikut = { ...aktif, ...perubahan };
        const query = new URLSearchParams();

        if (berikut.q !== '') query.set('q', berikut.q);
        if (berikut.status !== DASAR.status) query.set('status', berikut.status);
        if (berikut.bayar !== DASAR.bayar) query.set('bayar', berikut.bayar);
        if (berikut.dari !== '') query.set('dari', berikut.dari);
        if (berikut.sampai !== '') query.set('sampai', berikut.sampai);

        const teks = query.toString();

        return teks === '' ? '/admin/pesanan' : `/admin/pesanan?${teks}`;
    };

    const buka = (perubahan = {}, opsi = {}) => {
        const berikut = { ...aktif, ...perubahan };
        const query = {};

        if (berikut.q !== '') query.q = berikut.q;
        if (berikut.status !== DASAR.status) query.status = berikut.status;
        if (berikut.bayar !== DASAR.bayar) query.bayar = berikut.bayar;
        if (berikut.dari !== '') query.dari = berikut.dari;
        if (berikut.sampai !== '') query.sampai = berikut.sampai;
        if (opsi.page && Number(opsi.page) > 1) query.page = Number(opsi.page);

        setGalat(null);

        router.get('/admin/pesanan', query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setMemuat(true),
            onFinish: () => setMemuat(false),
            onError: () => setGalat('Permintaan daftar pesanan gagal diproses. Periksa koneksi lalu coba lagi.'),
        });
    };

    const gantiTanggal = (kunci, nilai) => {
        const berikut = { ...aktif, [kunci]: nilai };

        if (berikut.dari !== '' && berikut.sampai !== '' && berikut.dari > berikut.sampai) {
            setGalatTanggal('Tanggal awal tidak boleh melewati tanggal akhir.');

            return;
        }

        setGalatTanggal(null);
        buka({ [kunci]: nilai });
    };

    const reset = () => {
        setGalatTanggal(null);
        buka({ ...DASAR });
    };

    const kpi = [
        { label: 'Total pesanan', value: ringkasan?.total, href: urlFilter({ status: 'semua' }) },
        { label: 'Pending', value: ringkasan?.pending, href: urlFilter({ status: 'pending' }) },
        { label: 'Dibayar', value: ringkasan?.dibayar, href: urlFilter({ status: 'dibayar' }) },
        { label: 'Diproses', value: ringkasan?.diproses, href: urlFilter({ status: 'diproses' }) },
        { label: 'Dikirim', value: ringkasan?.dikirim, href: urlFilter({ status: 'dikirim' }) },
        { label: 'Selesai', value: ringkasan?.selesai, href: urlFilter({ status: 'selesai' }) },
        { label: 'Batal', value: ringkasan?.batal, href: urlFilter({ status: 'batal' }) },
    ];

    const kolom = [
        {
            key: 'code',
            header: 'Kode pesanan',
            render: (baris) => <span className="font-semibold text-ink">{asText(baris?.code) || '-'}</span>,
        },
        {
            key: 'created_at',
            header: 'Tanggal',
            render: (baris) => <span className="whitespace-nowrap">{formatDate(baris?.created_at)}</span>,
        },
        {
            key: 'customer_name',
            header: 'Pelanggan',
            render: (baris) => (
                <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{asText(baris?.customer_name) || '-'}</p>
                    <p className="truncate text-meta text-slate-500">
                        {asText(baris?.customer_phone) || asText(baris?.customer_email) || '-'}
                    </p>
                </div>
            ),
        },
        {
            key: 'items_count',
            header: 'Item',
            align: 'right',
            render: (baris) =>
                baris?.items_count === null || baris?.items_count === undefined
                    ? '-'
                    : `${formatNumber(baris.items_count)} item`,
        },
        {
            key: 'total',
            header: 'Total',
            align: 'right',
            render: (baris) => (
                <span className="whitespace-nowrap font-semibold text-ink">{rupiah(baris?.total) ?? '-'}</span>
            ),
        },
        {
            key: 'payment_status',
            header: 'Status bayar',
            render: (baris) => (
                <StatusBadge status={baris?.payment_status} label={asText(baris?.payment_label) || null} />
            ),
        },
        {
            key: 'status',
            header: 'Status pesanan',
            render: (baris) => <StatusBadge status={baris?.status} label={asText(baris?.status_label) || null} />,
        },
        {
            key: 'aksi',
            header: 'Aksi',
            align: 'right',
            render: (baris) => (
                <Button
                    variant="link"
                    size="sm"
                    href={asText(baris?.url) || `/admin/pesanan/${asText(baris?.id)}`}
                >
                    Detail
                </Button>
            ),
        },
    ];

    return (
        <AdminLayout title="Pesanan">
            <div className="flex flex-col gap-6">
                <PageHeader
                    title="Pesanan"
                    description="Pantau pesanan masuk, status pembayaran, dan status pengirimannya."
                />

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
                    {kpi.map((item) => (
                        <KpiCard
                            key={item.label}
                            label={item.label}
                            value={
                                item.value === null || item.value === undefined || item.value === ''
                                    ? null
                                    : formatNumber(item.value)
                            }
                            href={item.href}
                        />
                    ))}
                </div>

                <div className="flex flex-col gap-4 rounded-lg border border-line bg-white p-4">
                    <SearchInput
                        value={aktif.q}
                        onChange={(nilai) => buka({ q: nilai })}
                        loading={memuat}
                        label="Cari pesanan"
                        placeholder="Cari kode, nama, telepon, atau email"
                    />

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <Field label="Status pesanan" htmlFor="filter-status">
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

                        <Field label="Status pembayaran" htmlFor="filter-bayar">
                            <Select
                                id="filter-bayar"
                                value={aktif.bayar}
                                disabled={memuat}
                                onChange={(event) => buka({ bayar: event.target.value })}
                            >
                                {BAYAR.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        <Field label="Dari tanggal" htmlFor="filter-dari" error={galatTanggal}>
                            <Input
                                id="filter-dari"
                                type="date"
                                value={aktif.dari}
                                disabled={memuat}
                                error={galatTanggal}
                                onChange={(event) => gantiTanggal('dari', event.target.value)}
                            />
                        </Field>

                        <Field label="Sampai tanggal" htmlFor="filter-sampai" error={galatTanggal}>
                            <Input
                                id="filter-sampai"
                                type="date"
                                value={aktif.sampai}
                                disabled={memuat}
                                error={galatTanggal}
                                onChange={(event) => gantiTanggal('sampai', event.target.value)}
                            />
                        </Field>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-meta text-slate-500">
                            Menampilkan {formatNumber(daftar.length)} dari{' '}
                            {meta?.total === null || meta?.total === undefined
                                ? '-'
                                : formatNumber(meta.total)}{' '}
                            pesanan.
                        </p>
                        {adaFilter && (
                            <Button variant="secondary" size="sm" onClick={reset} disabled={memuat}>
                                Reset filter
                            </Button>
                        )}
                    </div>
                </div>

                {galat && (
                    <InlineNotice tone="error" title="Gagal memuat daftar pesanan">
                        <div className="flex flex-col items-start gap-3">
                            <p>{galat}</p>
                            <Button variant="secondary" size="sm" onClick={() => buka({})} disabled={memuat}>
                                Coba lagi
                            </Button>
                        </div>
                    </InlineNotice>
                )}

                <DataTable
                    columns={kolom}
                    rows={daftar}
                    loading={memuat}
                    emptyTitle={adaFilter ? 'Tidak ada pesanan yang cocok' : 'Belum ada pesanan'}
                    emptyDescription={
                        adaFilter
                            ? 'Ubah atau reset filter untuk melihat pesanan lain.'
                            : 'Pesanan yang dibuat pelanggan lewat checkout akan tampil di sini.'
                    }
                    emptyActionLabel={adaFilter ? 'Tampilkan semua pesanan' : null}
                    emptyActionHref={adaFilter ? '/admin/pesanan' : null}
                    caption="Daftar pesanan"
                />

                <Pagination currentPage={halaman} lastPage={halamanAkhir} onPageChange={(page) => buka({}, { page })} />
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

import React, { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import Button from '../../Components/Button';
import ChartCard from '../../Components/ChartCard';
import DataTable from '../../Components/DataTable';
import EmptyState from '../../Components/EmptyState';
import ErrorState from '../../Components/ErrorState';
import KpiCard from '../../Components/KpiCard';
import PageHeader from '../../Components/PageHeader';
import StatusBadge from '../../Components/StatusBadge';
import { BoxIcon, CartIcon, ChartIcon, StarIcon, WalletIcon } from '../../Components/icons';
import { formatDate, formatDateTime, formatNumber, rupiah, toObject } from '../../lib/format';

const numOrNull = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
};

const pickName = (...candidates) => {
    for (const candidate of candidates) {
        if (candidate === null || candidate === undefined || candidate === '') continue;
        return candidate;
    }
    return null;
};

/** Panel admin — docs/design.md §5.11, docs/PRD.md §9. */
export default function Dashboard({ stats = null, sales_14d = null, low_stock = null, recent_orders = null, recent_reviews = null, updated_at = null, loading = false, error = null }) {
    const { auth } = usePage().props;
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 60_000);
        return () => window.clearInterval(timer);
    }, []);

    const summary = toObject(stats);
    const reload = () => router.reload();

    const kpiCards = [
        {
            key: 'revenue_total',
            label: 'Omzet total',
            value: rupiah(numOrNull(summary.revenue_total) ?? 0),
            icon: WalletIcon,
        },
        {
            key: 'orders_pending',
            label: 'Pesanan baru',
            value: formatNumber(numOrNull(summary.orders_pending) ?? 0),
            icon: CartIcon,
        },
        {
            key: 'orders_total',
            label: 'Total pesanan',
            value: formatNumber(numOrNull(summary.orders_total) ?? 0),
            icon: ChartIcon,
        },
        {
            key: 'products_active',
            label: 'Produk aktif',
            value: formatNumber(numOrNull(summary.products_active) ?? 0),
            icon: BoxIcon,
        },
    ];

    const hasStats = Object.keys(summary).length > 0;

    const chartSeries = Array.isArray(sales_14d)
        ? sales_14d.map((item) => numOrNull(item && typeof item === 'object' ? item.total : item))
        : [];
    const chartLabels = Array.isArray(sales_14d)
        ? sales_14d.map((item) => (item && typeof item === 'object' ? formatDate(item.date) : null))
        : [];

    const stockRows = Array.isArray(low_stock) ? low_stock : [];
    const orderRows = Array.isArray(recent_orders) ? recent_orders : [];
    const reviewRows = Array.isArray(recent_reviews) ? recent_reviews : [];

    const updatedLabel = (() => {
        if (!updated_at) return null;
        const stamp = new Date(updated_at);
        if (Number.isNaN(stamp.getTime())) return null;
        const minutes = Math.max(0, Math.floor((now - stamp.getTime()) / 60_000));
        if (minutes < 5) return null;
        if (minutes < 60) return `Diperbarui ${minutes} menit lalu`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Diperbarui ${hours} jam lalu`;
        return `Diperbarui ${Math.floor(hours / 24)} hari lalu`;
    })();

    const orderColumns = [
        {
            key: 'code',
            header: 'Kode',
            render: (row) => <span className="font-semibold text-ink">{pickName(row?.code, row?.order_code, '-')}</span>,
        },
        {
            key: 'customer_name',
            header: 'Pembeli',
            render: (row) => pickName(row?.customer_name, row?.buyer_name, '-'),
        },
        {
            key: 'total',
            header: 'Total',
            align: 'right',
            render: (row) => rupiah(numOrNull(row?.total) ?? 0),
        },
        {
            key: 'status',
            header: 'Status',
            render: (row) => <StatusBadge status={row?.status ?? null} />,
        },
        {
            key: 'created_at',
            header: 'Tanggal',
            align: 'right',
            render: (row) => formatDate(row?.created_at),
        },
    ];

    return (
        <AdminLayout auth={auth}>
            <div className="flex flex-col gap-6">
                <PageHeader
                    title="Dashboard"
                    breadcrumb={[{ label: 'Dashboard' }]}
                    description={updatedLabel}
                    actions={
                        <Button variant="secondary" onClick={reload} loading={loading}>
                            Muat ulang
                        </Button>
                    }
                />

                {error && (
                    <ErrorState
                        title="Gagal memuat ringkasan"
                        description={typeof error === 'string' ? error : 'Periksa koneksi Anda lalu coba lagi.'}
                        onRetry={reload}
                        supportHref={null}
                    />
                )}

                {!error && (
                    <section aria-label="Ringkasan" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {kpiCards.map((card) => (
                            <KpiCard
                                key={card.key}
                                label={card.label}
                                value={card.value}
                                icon={card.icon}
                                loading={loading || !hasStats}
                            />
                        ))}
                    </section>
                )}

                <div className="grid gap-4 lg:grid-cols-3">
                    <ChartCard
                        title="Penjualan 14 hari"
                        range="14 hari terakhir"
                        series={chartSeries}
                        labels={chartLabels}
                        loading={loading}
                        error={error}
                        onRetry={reload}
                        emptyTitle="Belum ada penjualan"
                        emptyDescription="Grafik muncul setelah ada pesanan yang dibayar."
                        emptyActionLabel="Tambah produk"
                        emptyActionHref="/admin/produk/tambah"
                        className="lg:col-span-2"
                    />

                    <section
                        aria-label="Stok kritis"
                        className="flex flex-col gap-4 rounded-lg border border-line bg-white p-6"
                    >
                        <h2 className="text-label font-semibold text-ink">Stok kritis</h2>

                        {error ? (
                            <ErrorState
                                description={typeof error === 'string' ? error : 'Periksa koneksi Anda lalu coba lagi.'}
                                onRetry={reload}
                                supportHref={null}
                                className="py-6"
                            />
                        ) : stockRows.length === 0 ? (
                            <EmptyState
                                title="Stok aman"
                                description="Tidak ada varian dengan stok menipis."
                                className="py-6"
                            />
                        ) : (
                            <ul className="flex flex-col divide-y divide-line">
                                {stockRows.map((row, index) => (
                                    <li key={row?.id ?? index} className="flex items-center justify-between gap-3 py-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-label text-ink">
                                                {pickName(row?.product_name, row?.product?.name, '-')}
                                            </p>
                                            <p className="text-meta text-slate-500">
                                                {[row?.size, row?.color].filter(Boolean).join(' · ') || '-'}
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-meta font-semibold text-danger-strong">
                                            {formatNumber(numOrNull(row?.stock) ?? 0)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>

                <section aria-label="Pesanan terbaru" className="flex flex-col gap-3">
                    <h2 className="text-label font-semibold text-ink">Pesanan terbaru</h2>
                    <DataTable
                        columns={orderColumns}
                        rows={orderRows}
                        loading={loading}
                        error={error}
                        onRetry={reload}
                        emptyTitle="Belum ada pesanan"
                        emptyDescription="Pesanan masuk akan tampil di sini."
                    />
                </section>

                <section aria-label="Ulasan terbaru" className="flex flex-col gap-3">
                    <h2 className="text-label font-semibold text-ink">Ulasan terbaru</h2>

                    {error ? (
                        <div className="rounded-lg border border-line bg-white">
                            <ErrorState
                                description={typeof error === 'string' ? error : 'Periksa koneksi Anda lalu coba lagi.'}
                                onRetry={reload}
                                supportHref={null}
                                className="py-8"
                            />
                        </div>
                    ) : reviewRows.length === 0 ? (
                        <div className="rounded-lg border border-line bg-white">
                            <EmptyState
                                title="Belum ada ulasan"
                                description="Ulasan pembeli tampil setelah pesanan selesai."
                                icon={<StarIcon size={72} />}
                                className="py-8"
                            />
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {reviewRows.map((row, index) => (
                                <li
                                    key={row?.id ?? index}
                                    className="flex flex-col gap-2 rounded-lg border border-line bg-white p-4"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-label font-semibold text-ink">
                                            {pickName(row?.user_name, row?.user?.name, 'Pembeli')}
                                        </p>
                                        <p className="flex items-center gap-1 text-meta text-warning-strong">
                                            <StarIcon size={14} />
                                            {formatNumber(numOrNull(row?.rating) ?? 0)}/5
                                        </p>
                                    </div>
                                    <p className="whitespace-pre-line text-meta text-ink">
                                        {pickName(row?.comment, 'Tanpa komentar')}
                                    </p>
                                    <p className="text-meta text-slate-500">
                                        {pickName(row?.product_name, row?.product?.name, '-')} ·{' '}
                                        {formatDateTime(row?.created_at)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}

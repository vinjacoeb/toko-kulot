import React, { useEffect, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';
import Breadcrumb from '../../Components/Breadcrumb';
import Button from '../../Components/Button';
import EmptyState from '../../Components/EmptyState';
import InlineNotice from '../../Components/InlineNotice';
import Pagination from '../../Components/Pagination';
import Spinner from '../../Components/Spinner';
import StatusBadge from '../../Components/StatusBadge';
import { ImageOffIcon } from '../../Components/icons';
import { formatDateTime, formatNumber, rupiah } from '../../lib/format';

/**
 * Riwayat pesanan pembeli — `GET /history`, kontrak props §13 (LOCKED 23 Okt 2026).
 *
 * Props: `orders` (paginator: `data`, `links`, `meta`) dan `ringkasan` (dihitung dari seluruh
 * pesanan user). Semua status tampil tanpa filter; `detail_url` boleh `null` (termasuk batal)
 * dan bukan galat. Halaman hanya membaca data milik user login — server yang menentukan.
 *
 * Pagination memakai query string `page` lewat `router.get('/history')`; server tetap sumber
 * hasil. Loading, kosong, dan galat dibedakan: paginasi yang gagal menampilkan `InlineNotice`
 * dengan "Coba lagi" tanpa menyamarkan daftar lama sebagai hasil baru.
 */

/** Angka aman: `null` bila tidak tersedia, bilangan bulat >= 0 bila sah. */
const toCount = (value) => {
    if (value === null || value === undefined || value === '') return null;

    const parsed = Number(value);

    return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : null;
};

/** Label CTA detail mengikuti microcopy design yang ada: state `paid` §4.4 dan ringkasan `/keranjang` §5.6. */
const labelDetail = (order) => {
    if (order?.payment_status === 'settlement') return 'Lihat Pesanan';
    if (order?.status === 'pending' && order?.payment_status === 'pending') return 'Lanjut ke Pembayaran';

    return 'Lihat Pesanan';
};

function ItemThumb({ src }) {
    const [gagal, setGagal] = useState(false);

    useEffect(() => {
        setGagal(false);
    }, [src]);

    if (!src || gagal) {
        return (
            <span
                className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface text-slate-300"
                aria-hidden="true"
            >
                <ImageOffIcon size={24} />
            </span>
        );
    }

    return (
        <span className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-surface">
            <img
                src={src}
                alt=""
                width="64"
                height="64"
                loading="lazy"
                className="h-full w-full object-cover"
                onError={() => setGagal(true)}
            />
        </span>
    );
}

function OrderCard({ order }) {
    const items = Array.isArray(order?.items) ? order.items : [];
    const jumlahProduk = toCount(order?.items_count) ?? items.length;
    const jumlahItem = toCount(order?.total_qty);
    const ringkasItem = [
        jumlahProduk > 0 ? `${formatNumber(jumlahProduk)} produk` : null,
        jumlahItem > 0 ? `${formatNumber(jumlahItem)} item` : null,
    ]
        .filter(Boolean)
        .join(' · ');

    const detailUrl = order?.detail_url ?? null;
    const paymentLabel = order?.payment_label ?? null;
    const headingId = `pesanan-${order?.id ?? 'tanpa-id'}`;

    return (
        <article className="card p-4 md:p-6" aria-labelledby={headingId}>
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
                <div className="min-w-0">
                    <h2 id={headingId} className="break-words text-h3 text-ink">
                        {order?.code ?? 'Pesanan'}
                    </h2>
                    <p className="mt-1 text-meta text-slate-500">{formatDateTime(order?.created_at)}</p>
                    {ringkasItem && <p className="mt-0.5 text-meta text-slate-500">{ringkasItem}</p>}
                </div>

                <div className="flex flex-col items-start gap-2 sm:items-end">
                    <StatusBadge status={order?.status} label={order?.status_label} />
                    <p className="text-meta text-slate-500">
                        Total <span className="ml-1 text-h3 font-bold text-ink">{rupiah(order?.total) ?? '-'}</span>
                    </p>
                </div>
            </div>

            {items.length > 0 && (
                <ul className="divide-y divide-line">
                    {items.map((item, index) => (
                        <li key={item?.id ?? `${order?.id ?? 'pesanan'}-${index}`} className="flex items-center gap-3 py-3">
                            <ItemThumb src={item?.image ?? null} />

                            <div className="min-w-0 flex-1">
                                <p className="break-words text-label text-ink">{item?.name ?? 'Produk'}</p>
                                {item?.variant_label && (
                                    <p className="mt-0.5 text-meta text-slate-500">{item.variant_label}</p>
                                )}
                                <p className="mt-1 text-meta text-slate-500">
                                    {formatNumber(item?.qty)} × {rupiah(item?.unit_price) ?? '-'}
                                </p>
                            </div>

                            <p className="shrink-0 text-label font-semibold text-ink">{rupiah(item?.line_total) ?? '-'}</p>
                        </li>
                    ))}
                </ul>
            )}

            {(paymentLabel || detailUrl) && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                    <p className="text-meta text-slate-500">
                        {paymentLabel ? `Pembayaran: ${paymentLabel}` : null}
                    </p>

                    {detailUrl && (
                        <Button href={detailUrl} variant="secondary" size="sm">
                            {labelDetail(order)}
                        </Button>
                    )}
                </div>
            )}
        </article>
    );
}

export default function History({ orders = null, ringkasan = null }) {
    const page = usePage();
    const settings = page?.props?.settings ?? {};

    const daftar = Array.isArray(orders?.data) ? orders.data : [];
    const currentPage = Math.max(1, Number(orders?.meta?.current_page) || 1);
    const lastPage = Math.max(1, Number(orders?.meta?.last_page) || 1);
    const totalPesanan = toCount(ringkasan?.total) ?? toCount(orders?.meta?.total) ?? daftar.length;

    const [memuat, setMemuat] = useState(false);
    const [galat, setGalat] = useState(null);
    const [halamanGagal, setHalamanGagal] = useState(null);

    const muat = (halaman) => {
        if (memuat) return;

        const tujuan = Math.min(Math.max(1, Number(halaman) || 1), lastPage);

        setGalat(null);
        setHalamanGagal(tujuan);
        setMemuat(true);

        router.get('/history', tujuan > 1 ? { page: tujuan } : {}, {
            preserveState: true,
            onHttpException: (response) => {
                setGalat(`Server mengembalikan ${response.status}. Coba lagi beberapa saat.`);

                return false;
            },
            onNetworkError: () => {
                setGalat('Tidak bisa menghubungi server. Periksa koneksi internet, lalu coba lagi.');

                return false;
            },
            onFinish: () => setMemuat(false),
        });
    };

    const kosong = daftar.length === 0;

    return (
        <PublicLayout settings={settings}>
            <Head title="Riwayat Pesanan" />

            <div className="container py-4">
                <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Riwayat Pesanan' }]} />

                <header className="mt-2">
                    <h1 className="text-h1 text-ink">Riwayat Pesanan</h1>
                    {totalPesanan > 0 && (
                        <p className="mt-1 text-body text-ink-soft">
                            {`${formatNumber(totalPesanan)} pesanan tercatat di akunmu.`}
                        </p>
                    )}
                </header>

                {galat && (
                    <InlineNotice tone="error" title="Riwayat pesanan gagal dimuat" className="mt-4">
                        <p>{galat}</p>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="mt-3"
                            onClick={() => muat(halamanGagal ?? currentPage)}
                        >
                            Coba lagi
                        </Button>
                    </InlineNotice>
                )}

                {memuat && (
                    <p role="status" className="mt-4 flex items-center gap-2 text-meta text-slate-500">
                        <Spinner size={16} label="Memuat pesanan" />
                        Memuat pesanan…
                    </p>
                )}

                {kosong ? (
                    <EmptyState
                        className="mt-6"
                        title="Belum ada pesanan"
                        actionLabel="Mulai Belanja"
                        actionHref="/produk"
                    />
                ) : (
                    <ul className="mt-6 flex flex-col gap-4" aria-busy={memuat || undefined}>
                        {daftar.map((order) => (
                            <li key={order?.id ?? order?.code}>
                                <OrderCard order={order} />
                            </li>
                        ))}
                    </ul>
                )}

                <Pagination
                    currentPage={currentPage}
                    lastPage={lastPage}
                    onPageChange={muat}
                    className="mt-8"
                />
            </div>
        </PublicLayout>
    );
}

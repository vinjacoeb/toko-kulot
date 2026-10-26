import React, { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';
import Breadcrumb from '../../Components/Breadcrumb';
import Button from '../../Components/Button';
import EmptyState from '../../Components/EmptyState';
import Field from '../../Components/Field';
import InlineNotice from '../../Components/InlineNotice';
import Pagination from '../../Components/Pagination';
import SalinButton from '../../Components/SalinButton';
import Select from '../../Components/Select';
import ShippingEvents from '../../Components/ShippingEvents';
import Skeleton from '../../Components/Skeleton';
import StatusBadge from '../../Components/StatusBadge';
import TimelinePesanan from '../../Components/TimelinePesanan';
import { ChevronDownIcon, ImageOffIcon } from '../../Components/icons';
import { cn, formatDateTime, formatNumber, rupiah } from '../../lib/format';

/**
 * Riwayat pesanan pembeli — `GET /history`, kontrak §13 (LOCKED 23 Okt 2026, revisi aditif
 * 24 Okt 2026: `subtotal`, `shipping_cost`, `discount`, `customer{}`, `shipping{}`,
 * `timeline{}`; v1.4 26 Okt 2026: `shipping.events` + `timeline.completed_at`).
 * Desain: docs/design-v1.2.md §9, design-v1.4 §1–§2.
 *
 * Kartu ringkas selalu tampil; rincian dikelompokkan dalam panel disclosure yang tertutup
 * secara default. Semua label status/pembayaran berasal dari server (`status_label`,
 * `payment_label`) — klien tidak menulis ulang label. `detail_url = null` bukan galat: tombol
 * utama tidak dirender. Nilai kosong tampil `—` / `Resi belum tersedia.`, bukan baris hilang.
 *
 * Kontrak §13 tidak memuat label metode bayar (`payment_method_label`); yang tersedia hanya
 * `payment_label` (status bayar). Dicatat di docs/catatan-frontend.md.
 */

const DASH = '—';

/** Label opsi filter — harus sama dengan `Order::statusLabel` (design-v1.5 §6.1). */
const LABEL_FILTER = {
    pending: 'Pending',
    dibayar: 'Dibayar',
    diproses: 'Diproses',
    dikirim: 'Dikirim',
    selesai: 'Selesai',
    batal: 'Batal',
};

const URUTAN_STATUS = ['pending', 'dibayar', 'diproses', 'dikirim', 'selesai', 'batal'];

/** Teks aman: `null`/kosong → `—`. */
const teks = (value) => {
    if (value === null || value === undefined) return DASH;

    const str = String(value).trim();

    return str === '' ? DASH : str;
};

/** Teks opsional: kosong → `null` supaya baris v1.3 tidak dirender (design-v1.3 §0). */
const opsional = (value) => {
    if (value === null || value === undefined) return null;

    const str = String(value).trim();

    return str === '' ? null : str;
};

/** Nominal aman: nilai tidak sah → `—`. */
const uang = (value) => rupiah(value) ?? DASH;

/** Angka aman: `null` bila tidak tersedia, bilangan bulat >= 0 bila sah. */
const toCount = (value) => {
    if (value === null || value === undefined || value === '') return null;

    const parsed = Number(value);

    return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : null;
};

const jumlah = (value) => {
    const angka = toCount(value);

    return angka === null ? DASH : formatNumber(angka);
};

/** Tanggal aman: tidak valid → `—`. */
const waktu = (value) => {
    const hasil = formatDateTime(value);

    return hasil === '-' ? DASH : hasil;
};

/** Gabung bagian teks yang tidak kosong; kosong semua → `—`. */
const gabung = (...values) => {
    const isi = values
        .filter((value) => value !== null && value !== undefined && String(value).trim() !== '')
        .map((value) => String(value).trim());

    return isi.length === 0 ? DASH : isi.join(' · ');
};

/** CTA `detail_url` — microcopy design §9.1. */
const labelDetail = (order) =>
    order?.payment_status === 'settlement' ? 'Lihat pesanan' : 'Bayar sekarang';

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

/** Satu baris label–nilai `<dl>`; `wrap` untuk teks panjang (alamat, resi, status). */
function Baris({ label, value, wrap = false }) {
    return (
        <div
            className={cn(
                'flex gap-4',
                wrap
                    ? 'flex-col gap-1 sm:flex-row sm:items-start sm:justify-between'
                    : 'items-baseline justify-between'
            )}
        >
            <dt className="shrink-0 text-body text-ink-soft">{label}</dt>
            <dd
                className={cn(
                    'min-w-0 text-body text-ink',
                    wrap ? 'break-words sm:text-right' : 'whitespace-nowrap text-right tabular-nums'
                )}
            >
                {value}
            </dd>
        </div>
    );
}

function OrderCard({ order }) {
    const [buka, setBuka] = useState(false);

    const items = Array.isArray(order?.items) ? order.items : [];
    const customer = order?.customer ?? {};
    const shipping = order?.shipping ?? {};
    const timeline = order?.timeline ?? null;

    const jumlahBaris = toCount(order?.items_count) ?? items.length;
    const jumlahItem = toCount(order?.total_qty);
    const ringkasItem =
        jumlahBaris > 0
            ? `${formatNumber(jumlahBaris)} item${jumlahItem !== null ? ` / ${formatNumber(jumlahItem)} qty` : ''}`
            : null;

    const detailUrl = order?.detail_url ?? null;
    const headingId = `pesanan-${order?.id ?? 'tanpa-id'}`;
    const panelId = `rincian-${order?.id ?? 'tanpa-id'}`;

    const tujuan = gabung(customer.name, customer.city);
    const kurirLayanan =
        [shipping.courier_name, shipping.service_name]
            .filter((value) => value !== null && value !== undefined && String(value).trim() !== '')
            .map((value) => String(value).trim())
            .join(' ') || DASH;
    const resi = shipping.tracking_number ? String(shipping.tracking_number) : null;

    /** Data webhook v1.3 bentuk pembeli (PRD-v1.3 §2.6) — hanya tampil, tanpa aksi. */
    const statusKirim = opsional(shipping.status_label);
    const petugasKirim = opsional(shipping.driver?.name);
    const teleponPetugas = opsional(shipping.driver?.phone);
    const diperbaruiKirim = waktu(shipping.updated_at);

    return (
        <article className="card p-4 md:p-6" aria-labelledby={headingId}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h2 id={headingId} className="break-words font-mono text-h3 text-ink">
                        {teks(order?.code)}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusBadge status={order?.status} label={order?.status_label} />
                        <StatusBadge status={order?.payment_status} label={order?.payment_label} />
                    </div>
                    <div className="mt-2 grid gap-0.5 text-meta text-slate-500 sm:grid-cols-2">
                        <p className="tabular-nums">{waktu(order?.created_at)}</p>
                        {ringkasItem && <p>{ringkasItem}</p>}
                    </div>
                </div>

                <p className="text-h3 font-bold text-ink sm:text-right">
                    <span className="sr-only">Total </span>
                    <span className="whitespace-nowrap tabular-nums">{uang(order?.total)}</span>
                </p>
            </div>

            <div className="mt-3 flex flex-col gap-1 border-t border-line pt-3">
                <p className="text-meta text-slate-600">
                    Dikirim ke <span className="text-ink">{tujuan}</span>
                </p>
                <p className="text-meta text-slate-600">
                    {kurirLayanan}
                    {resi && (
                        <>
                            {' · '}
                            <span className="font-mono tabular-nums text-ink">{resi}</span>
                        </>
                    )}
                </p>
                {statusKirim && <p className="text-meta text-ink">{statusKirim}</p>}
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-end">
                <Button
                    variant="secondary"
                    onClick={() => setBuka((nilai) => !nilai)}
                    aria-expanded={buka}
                    aria-controls={panelId}
                    className="w-full sm:w-auto"
                    icon={
                        <span
                            aria-hidden="true"
                            className={cn(
                                'transition-transform duration-accordion ease-smooth',
                                buka ? 'rotate-180' : 'rotate-0'
                            )}
                        >
                            <ChevronDownIcon size={16} />
                        </span>
                    }
                >
                    Lihat rincian
                </Button>

                {detailUrl && (
                    <Button href={detailUrl} className="w-full sm:w-auto">
                        {labelDetail(order)}
                    </Button>
                )}
            </div>

            <div
                id={panelId}
                className={cn(
                    'mt-4 flex-col gap-6 border-t border-line pt-4',
                    buka ? 'flex' : 'hidden'
                )}
            >
                <section aria-labelledby={`${panelId}-kirim`}>
                    <h3 id={`${panelId}-kirim`} className="text-h3 text-ink">
                        Pengiriman
                    </h3>
                    <dl className="mt-3 flex flex-col gap-2">
                        <Baris label="Penerima" value={teks(customer.name)} />
                        <Baris label="Telepon" value={teks(customer.phone)} />
                        <Baris label="Alamat" value={teks(customer.address)} wrap />
                        <Baris label="Kota" value={teks(customer.city)} />
                        <Baris label="Kode pos" value={teks(customer.postal_code)} />
                        <Baris label="Kurir / layanan" value={kurirLayanan} wrap />
                        <Baris
                            label="Resi"
                            wrap
                            value={
                                resi ? (
                                    <SalinButton
                                        value={resi}
                                        ariaLabel={`Salin nomor resi ${teks(order?.code)}`}
                                        valueClassName="font-mono tabular-nums"
                                    />
                                ) : (
                                    'Resi belum tersedia.'
                                )
                            }
                        />
                        <Baris label="Status pengiriman" value={teks(shipping.status_label)} wrap />
                        {petugasKirim && (
                            <Baris
                                label="Petugas kurir"
                                wrap
                                value={
                                    <>
                                        {petugasKirim}
                                        {teleponPetugas && (
                                            <span className="mt-0.5 block text-meta tabular-nums">
                                                {teleponPetugas}
                                            </span>
                                        )}
                                    </>
                                }
                            />
                        )}
                        {diperbaruiKirim !== DASH && <Baris label="Diperbarui" value={diperbaruiKirim} />}
                    </dl>
                </section>

                <section aria-labelledby={`${panelId}-biaya`}>
                    <h3 id={`${panelId}-biaya`} className="text-h3 text-ink">
                        Rincian biaya
                    </h3>
                    <dl className="mt-3 flex flex-col gap-2">
                        <Baris label="Subtotal" value={uang(order?.subtotal)} />
                        <Baris label="Ongkir" value={uang(order?.shipping_cost)} />
                        <Baris label="Diskon" value={uang(order?.discount)} />
                        <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
                            <dt className="text-body font-semibold text-ink">Total</dt>
                            <dd className="whitespace-nowrap text-h3 font-bold text-ink tabular-nums">
                                {uang(order?.total)}
                            </dd>
                        </div>
                    </dl>
                </section>

                <section aria-labelledby={`${panelId}-item`}>
                    <h3 id={`${panelId}-item`} className="text-h3 text-ink">
                        Item
                    </h3>
                    {items.length === 0 ? (
                        <p className="mt-3 text-meta text-slate-500">{DASH}</p>
                    ) : (
                        <ul className="mt-3 divide-y divide-line">
                            {items.map((item, index) => (
                                <li
                                    key={item?.id ?? `${order?.id ?? 'pesanan'}-${index}`}
                                    className="flex items-start gap-3 py-3"
                                >
                                    <ItemThumb src={item?.image ?? null} />

                                    <div className="min-w-0 flex-1">
                                        {item?.product_id ? (
                                            <Link
                                                href={`/produk/${item.product_id}`}
                                                className="line-clamp-2 text-body text-ink underline-offset-4 hover:text-brand hover:underline"
                                            >
                                                {teks(item?.name)}
                                            </Link>
                                        ) : (
                                            <p className="line-clamp-2 text-body text-ink">
                                                {teks(item?.name)}
                                            </p>
                                        )}
                                        {item?.variant_label && (
                                            <p className="mt-0.5 text-meta text-slate-500">
                                                {item.variant_label}
                                            </p>
                                        )}
                                        <p className="mt-1 text-meta text-slate-500">
                                            <span className="tabular-nums">{jumlah(item?.qty)}</span> ×{' '}
                                            <span className="tabular-nums">{uang(item?.unit_price)}</span>
                                        </p>
                                    </div>

                                    <p className="shrink-0 whitespace-nowrap text-label font-semibold text-ink tabular-nums">
                                        {uang(item?.line_total)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section aria-labelledby={`${panelId}-timeline`}>
                    <h3 id={`${panelId}-timeline`} className="text-h3 text-ink">
                        Timeline
                    </h3>
                    <TimelinePesanan
                        status={order?.status ?? null}
                        paymentStatus={order?.payment_status ?? null}
                        timeline={timeline}
                    />
                    <ShippingEvents
                        events={shipping.events}
                        className="mt-4 border-t border-line pt-4"
                    />
                </section>
            </div>
        </article>
    );
}

function SkeletonKartu() {
    return (
        <div className="card p-4 md:p-6">
            <Skeleton variant="title" />
            <Skeleton variant="text" className="mt-3" />
            <Skeleton variant="text" className="mt-2 w-1/2" />
        </div>
    );
}

export default function History({ orders = null, ringkasan = null, filter = null }) {
    const page = usePage();
    const settings = page?.props?.settings ?? {};

    const daftar = Array.isArray(orders?.data) ? orders.data : [];
    const currentPage = Math.max(1, Number(orders?.meta?.current_page) || 1);
    const lastPage = Math.max(1, Number(orders?.meta?.last_page) || 1);
    const totalPesanan = toCount(ringkasan?.total) ?? toCount(orders?.meta?.total) ?? daftar.length;
    const totalHasil = toCount(orders?.meta?.total) ?? daftar.length;

    /**
     * Filter v1.5 — nilai awal selalu dari prop `filter.status` (URL sumber kebenaran), tanpa
     * state lokal. `filter` absen / `ringkasan.total === 0` → kontrol tidak dirender
     * (design-v1.5 §4, §6.4).
     */
    const adaFilter = filter !== null && filter !== undefined;
    const statusAktif = URUTAN_STATUS.includes(filter?.status) ? filter.status : null;
    const tampilkanFilter = adaFilter && totalPesanan > 0;
    const teksHasil = !statusAktif
        ? `Menampilkan semua ${formatNumber(totalHasil)} pesanan.`
        : totalHasil === 0
          ? `Tidak ada pesanan berstatus ${LABEL_FILTER[statusAktif]}.`
          : `Menampilkan ${formatNumber(totalHasil)} pesanan berstatus ${LABEL_FILTER[statusAktif]}.`;

    const [memuat, setMemuat] = useState(false);
    const [galat, setGalat] = useState(null);

    /** Satu jalur permintaan untuk paginasi dan `Coba lagi`. */
    const ambil = (params, { jagaScroll = false, tolakSaatMemuat = false } = {}) => {
        if (tolakSaatMemuat && memuat) return;

        setGalat(null);
        setMemuat(true);

        router.get('/history', params, {
            preserveState: true,
            preserveScroll: jagaScroll,
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

    /** Paginasi membawa status aktif — design-v1.5 §4. */
    const muat = (halaman) => {
        const tujuan = Math.min(Math.max(1, Number(halaman) || 1), lastPage);

        ambil(
            {
                ...(tujuan > 1 ? { page: tujuan } : {}),
                ...(statusAktif ? { status: statusAktif } : {}),
            },
            { tolakSaatMemuat: true }
        );
    };

    /** Ubah filter selalu kembali ke halaman 1 — design-v1.5 §4. */
    const ubahFilter = (nilai) => {
        ambil(nilai === 'semua' ? {} : { status: nilai }, { jagaScroll: true });
    };

    const kosong = daftar.length === 0;

    return (
        <PublicLayout settings={settings}>
            <Head title="Riwayat Pesanan" />

            <div className="container py-4">
                <div className="mx-auto w-full max-w-[1040px]">
                    <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Riwayat Pesanan' }]} />

                    <header className="mt-2">
                        <h1 className="text-h1 text-ink">Riwayat Pesanan</h1>
                        {totalPesanan > 0 && (
                            <p className="mt-1 max-w-[65ch] text-body text-ink-soft">
                                {`${formatNumber(totalPesanan)} pesanan tercatat di akunmu.`}
                            </p>
                        )}
                    </header>

                    {tampilkanFilter && (
                        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <Field
                                label="Status pesanan"
                                htmlFor="filter-status"
                                className="w-full sm:max-w-[260px]"
                            >
                                <Select
                                    id="filter-status"
                                    value={filter?.status ?? 'semua'}
                                    onChange={(e) => ubahFilter(e.target.value)}
                                >
                                    <option value="semua">
                                        {`Semua status (${formatNumber(ringkasan?.total ?? 0)})`}
                                    </option>
                                    {URUTAN_STATUS.map((s) => (
                                        <option key={s} value={s}>
                                            {`${LABEL_FILTER[s]} (${formatNumber(ringkasan?.[s] ?? 0)})`}
                                        </option>
                                    ))}
                                </Select>
                            </Field>
                            <p className="text-meta text-slate-500" role="status" aria-live="polite">
                                {teksHasil}
                            </p>
                        </div>
                    )}

                    {galat && (
                        <InlineNotice tone="error" title="Riwayat pesanan gagal dimuat" className="mt-4">
                            <p>{galat}</p>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="mt-3"
                                onClick={() => muat(currentPage)}
                            >
                                Coba lagi
                            </Button>
                        </InlineNotice>
                    )}

                    {memuat ? (
                        <div
                            className="mt-6 flex flex-col gap-4"
                            role="status"
                            aria-busy="true"
                            aria-label="Memuat pesanan"
                        >
                            <SkeletonKartu />
                            <SkeletonKartu />
                            <SkeletonKartu />
                        </div>
                    ) : kosong ? (
                        statusAktif ? (
                            <EmptyState
                                className="mt-6"
                                title="Tidak ada pesanan pada filter ini."
                                description="Coba status lain, atau tampilkan semua pesanan."
                                actionLabel="Tampilkan semua pesanan"
                                onAction={() => ubahFilter('semua')}
                            />
                        ) : (
                            <EmptyState
                                className="mt-6"
                                title="Belum ada pesanan."
                                actionLabel="Mulai belanja"
                                actionHref="/produk"
                            />
                        )
                    ) : (
                        <ul className="mt-6 flex flex-col gap-4">
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
            </div>
        </PublicLayout>
    );
}

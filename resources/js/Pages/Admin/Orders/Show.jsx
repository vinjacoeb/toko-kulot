import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';
import Badge from '../../../Components/Badge';
import Button from '../../../Components/Button';
import DataTable from '../../../Components/DataTable';
import StatusBadge from '../../../Components/StatusBadge';
import Toast from '../../../Components/Toast';
import KartuBagian from './partials/KartuBagian';
import BuktiPembayaran from './partials/BuktiPembayaran';
import InfoResi from './partials/InfoResi';
import SyncPaymentButton from './partials/SyncPaymentButton';
import { cn, formatDateTime, formatNumber, rupiah } from '../../../lib/format';

/**
 * Detail pesanan admin — kontrak props §12.17 (GET /admin/pesanan/{order}, rute admin.pesanan.show),
 * design-v1.2 §7.1–7.3 + design-v1.4 §4.
 *
 * Props: `pesanan` (detail lengkap + `payment` yang bisa null), `timeline`, dan `flash` halaman.
 * Status hanya ditampilkan lewat `StatusBadge` (PRD-v1.4 §3: ubah status manual dihapus).
 * Sinkron pembayaran §12.24 dan resi otomatis §12.25 dirender sebagai notice di kartunya
 * masing-masing; flash pasangan itu dilaporkan lewat `flashAksi` agar tidak dobel sebagai Toast
 * (D13 + U6-1). Semua nilai status/label/mata uang berasal dari server — tidak dikarang di klien.
 */

const asText = (value) => (value === null || value === undefined ? '' : String(value));

const uang = (value) => rupiah(value) ?? '-';

const jumlah = (value) => (value === null || value === undefined ? '-' : formatNumber(value));

const waktu = (value) => (asText(value) === '' ? '—' : formatDateTime(value));

const barisInfo = (label, nilai, kunci) => (
    <div
        key={kunci ?? label}
        className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 last:border-b-0"
    >
        <dt className="text-body text-ink-soft">{label}</dt>
        <dd className="min-w-0 break-words text-right text-body text-ink tabular-nums">{nilai}</dd>
    </div>
);

const barisTotal = (label, nilai, kunci, tebal = false) => (
    <div key={kunci ?? label} className="flex items-center justify-between gap-4">
        <dt className={cn('text-body', tebal ? 'font-semibold text-ink' : 'text-slate-600')}>{label}</dt>
        <dd className={cn('text-body tabular-nums', tebal ? 'font-bold text-ink' : 'text-ink')}>{nilai}</dd>
    </div>
);

export default function Show({ pesanan = null, flash = null }) {
    const data = pesanan ?? {};
    const customer = data.customer ?? {};
    const items = Array.isArray(data.items) ? data.items : [];

    const [toast, setToast] = useState(null);
    const [flashAksi, setFlashAksi] = useState(null);

    const timeline = data.timeline ?? null;
    const pasanganFlash = `${asText(flash?.success)}|${asText(flash?.error)}`;

    useEffect(() => {
        if (flashAksi !== null && pasanganFlash !== '|' && pasanganFlash === flashAksi) {
            // Flash aksi (sinkron pembayaran / resi otomatis) sudah dirender satu kali sebagai
            // InlineNotice di kartunya — jangan dobel sebagai Toast.
            setToast(null);

            return;
        }

        if (flash?.success) {
            setToast({ tone: 'success', title: 'Berhasil', message: asText(flash.success) });
        } else if (flash?.error) {
            setToast({ tone: 'error', title: 'Gagal', message: asText(flash.error) });
        }
    }, [flash?.success, flash?.error, flashAksi, pasanganFlash]);

    const kolomItem = [
        {
            key: 'product_name',
            header: 'Produk',
            render: (baris) => (
                <div className="min-w-0">
                    <p className="font-semibold text-ink">{asText(baris?.product_name) || '-'}</p>
                    {asText(baris?.variant_label) !== '' && (
                        <p className="text-meta text-slate-500">{asText(baris.variant_label)}</p>
                    )}
                </div>
            ),
        },
        {
            key: 'qty',
            header: 'Jumlah',
            align: 'right',
            render: (baris) => jumlah(baris?.qty),
        },
        {
            key: 'unit_price',
            header: 'Harga satuan',
            align: 'right',
            render: (baris) => <span className="whitespace-nowrap">{uang(baris?.unit_price)}</span>,
        },
        {
            key: 'line_total',
            header: 'Subtotal',
            align: 'right',
            render: (baris) => (
                <span className="whitespace-nowrap font-semibold text-ink">{uang(baris?.line_total)}</span>
            ),
        },
    ];

    return (
        <AdminLayout title={asText(data.code) || 'Pesanan'}>
            <div className="flex flex-col gap-6">
                <PageHeader
                    title={asText(data.code) || 'Detail pesanan'}
                    description={
                        asText(data.created_at) === ''
                            ? null
                            : `Dibuat ${formatDateTime(data.created_at)}`
                    }
                    breadcrumb={[
                        { label: 'Dasbor', href: '/admin' },
                        { label: 'Pesanan', href: '/admin/pesanan' },
                        { label: asText(data.code) || 'Detail' },
                    ]}
                    actions={
                        <Button variant="secondary" href="/admin/pesanan">
                            Kembali ke daftar
                        </Button>
                    }
                />

                <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={data.status} label={asText(data.status_label) || null} />
                    <StatusBadge status={data.payment_status} label={asText(data.payment_label) || null} />
                    {data.mode_uji === true && <Badge tone="warning">Mode uji</Badge>}
                </div>

                <div className="grid gap-6 lg:grid-cols-12">
                    <div className="flex flex-col gap-6 lg:col-span-7">
                        <KartuBagian
                            title="Bukti pembayaran"
                            description="Kanal, instruksi, dan status dikirim penyedia pembayaran."
                        >
                            <div className="flex flex-col gap-4">
                                <BuktiPembayaran
                                    payment={data.payment ?? null}
                                    paymentLabel={data.payment_label ?? null}
                                    paymentMethodLabel={data.payment_method_label ?? null}
                                />

                                {data.payment !== null && data.payment !== undefined && (
                                    <SyncPaymentButton pesananId={data.id} onHasilSinkron={setFlashAksi} />
                                )}
                            </div>
                        </KartuBagian>

                        <KartuBagian title="Pengiriman">
                            <InfoResi pesanan={data} onHasilAksi={setFlashAksi} />
                        </KartuBagian>

                        <KartuBagian title="Catatan pembeli">
                            {asText(data.notes) === '' ? (
                                <p className="text-body text-slate-600">Tidak ada catatan dari pembeli.</p>
                            ) : (
                                <p className="whitespace-pre-line text-body text-ink">{asText(data.notes)}</p>
                            )}
                        </KartuBagian>
                    </div>

                    <div className="flex flex-col gap-6 lg:col-span-5">
                        <KartuBagian
                            title="Item pesanan"
                            description={`${jumlah(items.length)} baris item pada pesanan ini.`}
                        >
                            <DataTable
                                columns={kolomItem}
                                rows={items}
                                rowKey={(baris, index) => baris?.id ?? index}
                                emptyTitle="Pesanan ini belum punya item"
                                emptyDescription="Hubungi backend bila pesanan seharusnya berisi item."
                                caption="Item pesanan"
                            />

                            <dl className="flex flex-col gap-2 border-t border-line pt-4 sm:ml-auto sm:w-72">
                                {barisTotal('Subtotal', uang(data.subtotal), 'subtotal')}
                                {barisTotal('Ongkos kirim', uang(data.shipping_cost), 'ongkir')}
                                {barisTotal('Diskon', uang(data.discount), 'diskon')}
                                {barisTotal('Total', uang(data.total), 'total', true)}
                            </dl>
                        </KartuBagian>

                        <KartuBagian title="Pelanggan">
                            <dl className="flex flex-col">
                                {barisInfo('Nama', asText(customer.name) || '—')}
                                {barisInfo('Telepon', asText(customer.phone) || '—')}
                                {barisInfo('Email', asText(customer.email) || '—')}
                                {barisInfo(
                                    'Alamat',
                                    <span className="whitespace-pre-line">
                                        {asText(customer.address) || '—'}
                                    </span>,
                                )}
                                {barisInfo('Kota', asText(customer.city) || '—')}
                                {barisInfo('Kode pos', asText(customer.postal_code) || '—')}
                            </dl>
                        </KartuBagian>

                        <KartuBagian title="Timeline">
                            {timeline === null ? (
                                <p className="text-body text-slate-600">Belum ada riwayat.</p>
                            ) : (
                                <dl className="flex flex-col">
                                    {barisInfo('Dibuat', waktu(timeline.created_at), 'dibuat')}
                                    {barisInfo('Dibayar', waktu(timeline.paid_at), 'dibayar')}
                                    {barisInfo('Dikirim', waktu(timeline.shipped_at), 'dikirim')}
                                </dl>
                            )}
                        </KartuBagian>
                    </div>
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

import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';
import Button from '../../../Components/Button';
import DataTable from '../../../Components/DataTable';
import InlineNotice from '../../../Components/InlineNotice';
import StatusBadge from '../../../Components/StatusBadge';
import Toast from '../../../Components/Toast';
import KartuBagian from './partials/KartuBagian';
import BuktiPembayaran from './partials/BuktiPembayaran';
import InfoResi from './partials/InfoResi';
import SyncPaymentButton from './partials/SyncPaymentButton';
import UbahStatusModal from './partials/UbahStatusModal';
import { cn, formatDateTime, formatNumber, rupiah } from '../../../lib/format';

/**
 * Detail pesanan admin — kontrak props §12.17 (GET /admin/pesanan/{order}, rute admin.pesanan.show).
 * Props: `pesanan` (detail lengkap + `payment` yang bisa null), `status_berikut`
 * (`[{ value, label }]`; kosong = status final), dan `flash` halaman.
 * Perubahan status lewat §12.18 (PATCH /admin/pesanan/{order}/status) di
 * `partials/UbahStatusModal`. Sinkron status pembayaran lewat §12.24
 * (PATCH /admin/pesanan/{order}/sinkron-pembayaran) di `partials/SyncPaymentButton`: flash
 * milik aksi itu dirender satu kali sebagai `InlineNotice` di kartu "Bukti pembayaran" dan
 * di-suppress dari Toast halaman (D13 + U6-1).
 * Semua nilai status/label/mata uang berasal dari server — tidak dikarang di klien.
 */

const asText = (value) => (value === null || value === undefined ? '' : String(value));

const uang = (value) => rupiah(value) ?? '-';

const jumlah = (value) => (value === null || value === undefined ? '-' : formatNumber(value));

const barisInfo = (label, nilai, kunci) => (
    <div
        key={kunci ?? label}
        className="flex items-start justify-between gap-4 border-b border-line py-2.5 last:border-b-0"
    >
        <dt className="text-meta text-slate-600">{label}</dt>
        <dd className="min-w-0 break-words text-right text-body text-ink">{nilai}</dd>
    </div>
);

const barisTotal = (label, nilai, kunci, tebal = false) => (
    <div key={kunci ?? label} className="flex items-center justify-between gap-4">
        <dt className={cn('text-meta', tebal ? 'font-semibold text-ink' : 'text-slate-600')}>{label}</dt>
        <dd className={cn('text-body', tebal ? 'font-bold text-ink' : 'text-ink')}>{nilai}</dd>
    </div>
);

export default function Show({ pesanan = null, status_berikut = [], flash = null }) {
    const data = pesanan ?? {};
    const customer = data.customer ?? {};
    const items = Array.isArray(data.items) ? data.items : [];
    const berikut = Array.isArray(status_berikut) ? status_berikut : [];

    const [modalTerbuka, setModalTerbuka] = useState(false);
    const [toast, setToast] = useState(null);
    const [flashSinkron, setFlashSinkron] = useState(null);

    const final = berikut.length === 0;
    const pasanganFlash = `${asText(flash?.success)}|${asText(flash?.error)}`;

    useEffect(() => {
        if (flashSinkron !== null && pasanganFlash !== '|' && pasanganFlash === flashSinkron) {
            // Flash milik aksi "Sinkronkan status pembayaran" sudah dirender satu kali sebagai
            // InlineNotice di kartu "Bukti pembayaran" (D13 + U6-1) — jangan dobel sebagai Toast.
            setToast(null);

            return;
        }

        if (flash?.success) {
            setToast({ tone: 'success', title: 'Berhasil', message: asText(flash.success) });
        } else if (flash?.error) {
            setToast({ tone: 'error', title: 'Gagal', message: asText(flash.error) });
        }
    }, [flash?.success, flash?.error, flashSinkron, pasanganFlash]);

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
                        <>
                            <Button variant="secondary" href="/admin/pesanan">
                                Kembali ke daftar
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => setModalTerbuka(true)}
                                disabled={final}
                                aria-describedby={final ? 'status-final' : undefined}
                            >
                                Ubah status
                            </Button>
                        </>
                    }
                />

                {final && (
                    <div id="status-final">
                        <InlineNotice tone="info" title="Status sudah final">
                            Pesanan ini berstatus {asText(data.status_label) || '-'} dan tidak punya
                            status lanjutan, jadi tombol Ubah status dinonaktifkan.
                        </InlineNotice>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    <KartuBagian title="Ringkasan pesanan" className="lg:col-span-1">
                        <dl className="flex flex-col">
                            {barisInfo(
                                'Status pesanan',
                                <StatusBadge
                                    status={data.status}
                                    label={asText(data.status_label) || null}
                                />,
                            )}
                            {barisInfo(
                                'Status pembayaran',
                                <StatusBadge
                                    status={data.payment_status}
                                    label={asText(data.payment_label) || null}
                                />,
                            )}
                            {barisInfo('Metode pembayaran', asText(data.payment_method).toUpperCase() || '-')}
                            {barisInfo('Dibuat', formatDateTime(data.created_at))}
                            {barisInfo('Dibayar', formatDateTime(data.paid_at))}
                        </dl>
                    </KartuBagian>

                    <KartuBagian title="Data pembeli" className="lg:col-span-1">
                        <dl className="flex flex-col">
                            {barisInfo('Nama', asText(customer.name) || '-')}
                            {barisInfo('Telepon', asText(customer.phone) || '-')}
                            {barisInfo('Email', asText(customer.email) || '-')}
                        </dl>
                    </KartuBagian>

                    <KartuBagian title="Pengiriman" className="lg:col-span-1">
                        <div className="flex flex-col gap-4">
                            <dl className="flex flex-col">
                                {barisInfo('Nama penerima', asText(customer.name) || '-')}
                                {barisInfo('Telepon', asText(customer.phone) || '-')}
                                {barisInfo(
                                    'Alamat',
                                    <span className="whitespace-pre-line">{asText(customer.address) || '-'}</span>,
                                )}
                                {barisInfo('Kota', asText(customer.city) || '-')}
                                {barisInfo('Kode pos', asText(customer.postal_code) || '-')}
                            </dl>

                            <InfoResi pesanan={data} />
                        </div>
                    </KartuBagian>
                </div>

                <KartuBagian title="Item pesanan" description={`${jumlah(items.length)} baris item pada pesanan ini.`}>
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

                <div className="grid gap-6 lg:grid-cols-2">
                    <KartuBagian
                        title="Bukti pembayaran"
                        description="Pratinjau readonly — kode QR dan ID transaksi dikirim penyedia pembayaran."
                    >
                        <div className="flex flex-col gap-4">
                            <BuktiPembayaran payment={data.payment ?? null} paymentLabel={data.payment_label ?? null} />

                            {data.payment !== null && data.payment !== undefined && (
                                <SyncPaymentButton pesananId={data.id} onHasilSinkron={setFlashSinkron} />
                            )}
                        </div>
                    </KartuBagian>

                    <KartuBagian title="Catatan pembeli">
                        {asText(data.notes) === '' ? (
                            <p className="text-body text-slate-600">Tidak ada catatan dari pembeli.</p>
                        ) : (
                            <p className="whitespace-pre-line text-body text-ink">{asText(data.notes)}</p>
                        )}
                    </KartuBagian>
                </div>
            </div>

            <UbahStatusModal
                open={modalTerbuka}
                pesanan={data}
                statusBerikut={berikut}
                onClose={() => setModalTerbuka(false)}
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

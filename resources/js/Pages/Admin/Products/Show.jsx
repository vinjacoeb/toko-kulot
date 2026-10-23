import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';
import Badge from '../../../Components/Badge';
import Button from '../../../Components/Button';
import DataTable from '../../../Components/DataTable';
import KpiCard from '../../../Components/KpiCard';
import Modal from '../../../Components/Modal';
import StatusBadge from '../../../Components/StatusBadge';
import { ImageOffIcon } from '../../../Components/icons';
import { formatDate, formatNumber, rupiah } from '../../../lib/format';

/**
 * Detail produk admin — PRD §9, kontrak props §12.4.
 * Props: `produk` (bentuk detail), `ringkasan` = {varian_total, stok_total, stok_kritis, terjual}.
 */
const BREADCRUMB = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Produk', href: '/admin/produk' },
    { label: 'Detail produk' },
];

const asText = (value) => (value === null || value === undefined ? '' : String(value));

const asAngka = (value) => {
    const angka = Number(value);

    return Number.isFinite(angka) ? angka : null;
};

const angkaTeks = (value) => {
    const angka = asAngka(value);

    return angka === null ? '-' : formatNumber(angka);
};

function Baris({ label, children }) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-line py-3 last:border-b-0">
            <dt className="text-meta text-slate-500">{label}</dt>
            <dd className="text-right text-body text-ink">{children}</dd>
        </div>
    );
}

export default function Show({ produk = null, ringkasan = null }) {
    const [hapus, setHapus] = useState(false);

    if (produk === null) return null;

    const gambar = Array.isArray(produk.images) ? produk.images : [];
    const varian = Array.isArray(produk.variants) ? produk.variants : [];

    const kolomVarian = [
        { key: 'size', header: 'Ukuran', render: (baris) => asText(baris?.size) || '-' },
        { key: 'color', header: 'Warna', render: (baris) => asText(baris?.color) || '-' },
        { key: 'sku', header: 'SKU', render: (baris) => asText(baris?.sku) || '-' },
        {
            key: 'price_delta',
            header: 'Harga tambahan',
            align: 'right',
            render: (baris) => {
                const delta = asAngka(baris?.price_delta) ?? 0;

                if (delta === 0) return 'Tanpa tambahan';

                return `${delta > 0 ? '+' : '-'}${rupiah(Math.abs(delta)) ?? ''}`;
            },
        },
        {
            key: 'stock',
            header: 'Stok',
            align: 'right',
            render: (baris) => angkaTeks(baris?.stock),
        },
        {
            key: 'is_active',
            header: 'Status',
            sortable: false,
            render: (baris) => (
                <StatusBadge
                    status={baris?.is_active ? 'aktif' : 'nonaktif'}
                    label={baris?.is_active ? 'Aktif' : 'Nonaktif'}
                />
            ),
        },
    ];

    const konfirmasiHapus = () => {
        router.delete(`/admin/produk/${produk.id}`, {
            preserveScroll: true,
            onFinish: () => setHapus(false),
        });
    };

    return (
        <AdminLayout title={asText(produk.name)}>
            <div className="flex flex-col gap-6">
                <PageHeader
                    title={asText(produk.name) || '-'}
                    breadcrumb={BREADCRUMB}
                    description={`SKU ${asText(produk.sku) || '-'} · ${asText(produk.category?.name) || 'Tanpa kategori'}`}
                    actions={
                        <>
                            <Button variant="secondary" href="/admin/produk">
                                Kembali
                            </Button>
                            <Button variant="primary" href={`/admin/produk/${produk.id}/ubah`}>
                                Ubah produk
                            </Button>
                            <Button variant="danger" onClick={() => setHapus(true)}>
                                Hapus
                            </Button>
                        </>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <KpiCard label="Jumlah varian" value={angkaTeks(ringkasan?.varian_total)} />
                    <KpiCard label="Total stok" value={angkaTeks(ringkasan?.stok_total)} />
                    <KpiCard label="Varian stok kritis" value={angkaTeks(ringkasan?.stok_kritis)} />
                    <KpiCard label="Terjual" value={angkaTeks(ringkasan?.terjual)} />
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="flex flex-col gap-6">
                        <section className="flex flex-col gap-4 rounded-lg border border-line bg-white p-6">
                            <h2 className="text-h3 font-semibold text-ink">Galeri</h2>

                            {gambar.length === 0 ? (
                                <p className="text-meta text-slate-500">Produk ini belum punya gambar.</p>
                            ) : (
                                <ul className="grid gap-4 sm:grid-cols-3">
                                    {gambar.map((item) => (
                                        <li key={item.id} className="flex flex-col gap-2">
                                            {asText(item.path) === '' ? (
                                                <span className="flex h-32 items-center justify-center rounded-md border border-line bg-surface text-slate-500">
                                                    <ImageOffIcon />
                                                </span>
                                            ) : (
                                                <img
                                                    src={asText(item.path)}
                                                    alt={asText(item.alt)}
                                                    loading="lazy"
                                                    className="h-32 w-full rounded-md border border-line object-cover"
                                                />
                                            )}
                                            <p className="text-meta text-slate-500">
                                                {item.is_primary ? 'Gambar utama' : 'Gambar galeri'}
                                                {asText(item.alt) === '' ? ' · teks alternatif belum diisi' : ''}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        <section className="flex flex-col gap-3 rounded-lg border border-line bg-white p-6">
                            <h2 className="text-h3 font-semibold text-ink">Deskripsi</h2>
                            {asText(produk.short_description) !== '' && (
                                <p className="text-body text-ink">{asText(produk.short_description)}</p>
                            )}
                            {asText(produk.description) === '' ? (
                                <p className="text-meta text-slate-500">Belum ada deskripsi.</p>
                            ) : (
                                <p className="whitespace-pre-line text-body text-ink-soft">{asText(produk.description)}</p>
                            )}
                        </section>

                        <section className="flex flex-col gap-4 rounded-lg border border-line bg-white p-6">
                            <h2 className="text-h3 font-semibold text-ink">Varian</h2>

                            <DataTable
                                columns={kolomVarian}
                                rows={varian}
                                emptyTitle="Belum ada varian"
                                emptyDescription="Tambahkan varian lewat tombol Ubah produk."
                                caption="Daftar varian produk"
                            />
                        </section>
                    </div>

                    <div className="flex flex-col gap-6">
                        <section className="rounded-lg border border-line bg-white p-6">
                            <h2 className="text-h3 font-semibold text-ink">Rincian</h2>

                            <dl className="mt-2 flex flex-col">
                                <Baris label="Status">
                                    <span className="inline-flex flex-wrap items-center justify-end gap-2">
                                        <StatusBadge
                                            status={produk.is_active ? 'aktif' : 'nonaktif'}
                                            label={produk.is_active ? 'Aktif' : 'Nonaktif'}
                                        />
                                        {produk.is_featured && <Badge tone="brand">Unggulan</Badge>}
                                    </span>
                                </Baris>
                                <Baris label="Kategori">{asText(produk.category?.name) || '-'}</Baris>
                                <Baris label="Harga jual">{rupiah(produk.base_price) ?? '-'}</Baris>
                                <Baris label="Harga coret">
                                    {produk.compare_price === null || produk.compare_price === undefined
                                        ? '-'
                                        : rupiah(produk.compare_price) ?? '-'}
                                </Baris>
                                <Baris label="Harga grosir">
                                    {produk.wholesale_price === null || produk.wholesale_price === undefined
                                        ? '-'
                                        : `${rupiah(produk.wholesale_price) ?? '-'} · min ${angkaTeks(produk.min_wholesale_qty)} pcs`}
                                </Baris>
                                <Baris label="Total stok">{angkaTeks(produk.stock)}</Baris>
                                <Baris label="Berat">
                                    {produk.weight_gram === null || produk.weight_gram === undefined
                                        ? '-'
                                        : `${formatNumber(produk.weight_gram)} gram`}
                                </Baris>
                                <Baris label="Slug">{asText(produk.slug) || '-'}</Baris>
                                <Baris label="Tanggal dibuat">{formatDate(produk.created_at) ?? '-'}</Baris>
                                <Baris label="Terakhir diperbarui">{formatDate(produk.updated_at) ?? '-'}</Baris>
                            </dl>

                            {asText(produk.url) !== '' && (
                                <p className="mt-3 text-meta">
                                    <a
                                        href={asText(produk.url)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-brand underline-offset-2 transition-colors duration-hover hover:underline"
                                    >
                                        Lihat halaman publik produk
                                    </a>
                                </p>
                            )}
                        </section>
                    </div>
                </div>

                <Modal
                    open={hapus}
                    onClose={() => setHapus(false)}
                    title="Hapus produk?"
                    description={`Produk "${asText(produk.name)}" akan dihapus dari katalog.`}
                    footer={
                        <>
                            <Button variant="secondary" onClick={() => setHapus(false)}>
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
        </AdminLayout>
    );
}

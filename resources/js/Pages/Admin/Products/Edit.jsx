import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';
import ProdukForm from './partials/ProdukForm';

/**
 * Ubah produk — PRD §9, design §5.12, kontrak props §12.5/§12.6.
 * Form unggah diposting sebagai POST + `_method=put` (ditangani `ProdukForm`).
 */
const BREADCRUMB = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Produk', href: '/admin/produk' },
    { label: 'Ubah produk' },
];

const asText = (value) => (value === null || value === undefined ? '' : String(value));

export default function Edit({ produk = null, kategori = [], ukuran_baku = [] }) {
    if (produk === null) return null;

    return (
        <AdminLayout title={`Ubah ${asText(produk.name)}`}>
            <div className="flex flex-col gap-6">
                <PageHeader
                    title={`Ubah ${asText(produk.name)}`}
                    breadcrumb={BREADCRUMB}
                    description={`SKU ${asText(produk.sku) || '-'} · ${asText(produk.category?.name) || 'Tanpa kategori'}`}
                />

                <ProdukForm
                    produk={produk}
                    kategori={Array.isArray(kategori) ? kategori : []}
                    ukuran_baku={Array.isArray(ukuran_baku) ? ukuran_baku : []}
                />
            </div>
        </AdminLayout>
    );
}

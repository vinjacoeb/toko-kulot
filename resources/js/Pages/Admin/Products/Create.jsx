import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';
import ProdukForm from './partials/ProdukForm';

/**
 * Tambah produk — PRD §9, design §5.12 (form produk memakai halaman terpisah),
 * kontrak props §12.2/§12.3.
 */
const BREADCRUMB = [{ label: 'Dashboard', href: '/admin' }, { label: 'Produk', href: '/admin/produk' }, { label: 'Tambah produk' }];

export default function Create({ kategori = [], ukuran_baku = [] }) {
    return (
        <AdminLayout title="Tambah produk">
            <div className="flex flex-col gap-6">
                <PageHeader title="Tambah produk" breadcrumb={BREADCRUMB} description="Isi data produk, harga, varian, dan galeri." />

                <ProdukForm kategori={Array.isArray(kategori) ? kategori : []} ukuran_baku={Array.isArray(ukuran_baku) ? ukuran_baku : []} />
            </div>
        </AdminLayout>
    );
}

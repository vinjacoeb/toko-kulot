import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';
import DataTable from '../../../Components/DataTable';
import Button from '../../../Components/Button';

export default function Index({ products = [], loading = false, error = null }) {
    const columns = [
        { key: 'name', header: 'Nama Produk', render: (row) => row.name },
        { key: 'category', header: 'Kategori', render: (row) => row.category },
        { key: 'price', header: 'Harga', render: (row) => row.price },
        { key: 'stock', header: 'Stok', render: (row) => row.stock },
        { key: 'status', header: 'Status', render: (row) => row.status },
    ];

    return (
        <AdminLayout title="Produk">
            <PageHeader title="Produk">
                <Button href="/admin/produk/tambah">Tambah Produk</Button>
            </PageHeader>
            <DataTable
                columns={columns}
                rows={products}
                loading={loading}
                error={error}
            />
        </AdminLayout>
    );
}

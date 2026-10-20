import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';
import DataTable from '../../../Components/DataTable';

export default function Index({ stocks = [], loading = false, error = null }) {
    const columns = [
        { key: 'product_name', header: 'Produk', render: (row) => row.product_name },
        { key: 'variant', header: 'Varian', render: (row) => row.variant },
        { key: 'stock', header: 'Stok', render: (row) => row.stock },
        { key: 'status', header: 'Status', render: (row) => row.status },
    ];

    return (
        <AdminLayout title="Stok">
            <PageHeader title="Stok" />
            <DataTable
                columns={columns}
                rows={stocks}
                loading={loading}
                error={error}
            />
        </AdminLayout>
    );
}

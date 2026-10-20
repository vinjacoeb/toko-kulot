import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';
import DataTable from '../../../Components/DataTable';

export default function Index({ orders = [], loading = false, error = null }) {
    const columns = [
        { key: 'code', header: 'Kode Pesanan', render: (row) => row.code },
        { key: 'customer', header: 'Pelanggan', render: (row) => row.customer },
        { key: 'total', header: 'Total', render: (row) => row.total },
        { key: 'status', header: 'Status', render: (row) => row.status },
        { key: 'created_at', header: 'Tanggal', render: (row) => row.created_at },
    ];

    return (
        <AdminLayout title="Pesanan">
            <PageHeader title="Pesanan" />
            <DataTable
                columns={columns}
                rows={orders}
                loading={loading}
                error={error}
            />
        </AdminLayout>
    );
}

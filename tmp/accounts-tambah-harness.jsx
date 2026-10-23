// Harness verifikasi tombol "Tambah admin" + modal di halaman Admin/Accounts/Index
// (kartu t_15522fc1). Hanya alat verifikasi, bukan bagian aplikasi.
// Bangun: node tmp/build-accounts-tambah-check.mjs lalu buka tmp/accounts-tambah-harness.html.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { __reset, __setPageProps } from './inertia-stub-accounts.jsx';
import Index from '../resources/js/Pages/Admin/Accounts/Index.jsx';

const ROW_SELF = {
    id: 1,
    name: 'Owner Uji',
    email: 'owner@contoh.test',
    role: 'owner',
    is_active: 1,
    is_self: true,
    created_at: '2026-10-01T09:00:00+07:00',
};

const ROW_ADMIN = {
    id: 2,
    name: 'Admin Uji',
    email: 'admin@contoh.test',
    role: 'admin',
    is_active: 1,
    is_self: false,
    created_at: '2026-10-02T10:30:00+07:00',
};

const PROPS = {
    akun: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 2,
        data: [ROW_SELF, ROW_ADMIN],
        links: [],
    },
    filter: { q: null, role: 'semua', status: 'semua' },
    ringkasan: { total: '2', owner: '1', admin: '1', staff: '0', aktif: '2' },
    auth: { admin: { name: 'Admin Uji', email: 'admin@contoh.test' }, user: null },
    flash: null,
};

window.__props = PROPS;

export function render() {
    const host = document.getElementById('app');

    __reset();
    __setPageProps(PROPS);

    if (!host.__root) host.__root = createRoot(host);
    host.__root.render(React.createElement(Index, PROPS));
}

render();

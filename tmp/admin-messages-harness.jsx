// Entry harness verifikasi render halaman Admin/Messages/Index di browser nyata
// (docs/kontrak-props.md §10.1-§10.3, docs/design.md §5.12). Hanya alat verifikasi,
// bukan bagian aplikasi. Jalankan: node tmp/build-admin-messages-check.mjs lalu buka
// tmp/admin-messages-harness.html.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { __reset, __setPageProps } from './inertia-stub-messages.jsx';
import Index from '../resources/js/Pages/Admin/Messages/Index.jsx';

const PAG = (rows, extra = {}) => ({
    current_page: 1,
    last_page: 3,
    per_page: 10,
    total: rows.length,
    data: rows,
    links: [],
    ...extra,
});

const ROW_UNREAD = {
    id: 11,
    name: 'Rina',
    email: 'rina@contoh.test',
    phone: '081200000011',
    subject: 'Stok daster jumbo',
    message: 'Apakah daster jumbo ready?',
    admin_reply: null,
    replied_at: null,
    is_read: false,
    created_at: '2026-10-18T09:30:00+07:00',
};

const ROW_READ_REPLIED = {
    id: 12,
    name: 'Budi',
    email: 'budi@contoh.test',
    phone: null,
    subject: 'Pesanan belum sampai',
    message: 'Pesanan INV-0021 belum sampai.',
    admin_reply: 'Mohon maaf, kami cek dulu ya.',
    replied_at: '2026-10-19T11:05:00+07:00',
    is_read: true,
    created_at: '2026-10-17T08:00:00+07:00',
};

const ROW_KOSONG = {
    id: 13,
    name: null,
    email: null,
    phone: null,
    subject: null,
    message: null,
    admin_reply: '',
    replied_at: null,
    is_read: null,
    created_at: null,
};

const FIXTURES = [
    {
        label: 'daftar normal',
        props: {
            pesan: PAG([ROW_UNREAD, ROW_READ_REPLIED, ROW_KOSONG]),
            filter: { q: null, status: null },
            ringkasan: { total: 3, belum_dibaca: 1 },
            auth: { admin: { name: 'Admin Uji', email: 'admin@contoh.test' } },
            flash: { success: null, error: null },
        },
    },
    {
        label: 'angka berbentuk string',
        props: {
            pesan: PAG([ROW_UNREAD], { total: '7', last_page: '2' }),
            filter: { q: 'daster', status: 'belum' },
            ringkasan: { total: '7', belum_dibaca: '2' },
            auth: null,
            flash: { success: 'Balasan tersimpan.' },
        },
    },
    {
        label: 'kosong tanpa filter',
        props: {
            pesan: PAG([], { total: 0, last_page: 1 }),
            filter: { q: null, status: 'semua' },
            ringkasan: { total: 0, belum_dibaca: 0 },
            auth: null,
            flash: null,
        },
    },
    {
        label: 'kosong karena filter',
        props: {
            pesan: PAG([], { total: 0, last_page: 1 }),
            filter: { q: 'sepatu', status: 'sudah' },
            ringkasan: { total: 0, belum_dibaca: 0 },
            auth: null,
            flash: null,
        },
    },
    {
        label: 'props null semua',
        props: { pesan: null, filter: null, ringkasan: null, auth: null, flash: null },
    },
];

let root = null;

window.__fixtures = FIXTURES.map((f) => f.label);

window.__render = (index) => {
    const fixture = FIXTURES[index] ?? FIXTURES[0];
    const host = document.getElementById('app');

    if (root) root.unmount();
    host.replaceChildren();
    __reset();
    __setPageProps(fixture.props);
    root = createRoot(host);
    root.render(React.createElement(Index, fixture.props));

    return fixture.label;
};

window.__render(0);

// Harness verifikasi modal Ubah kategori di halaman Admin/Categories/Index
// (kartu t_aa6dc2df, docs/rencana-perbaikan-5.md butir 4). Hanya alat verifikasi.
// Bangun: node tmp/build-categories-modal-check.mjs lalu buka tmp/categories-modal-harness.html.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { __reset, __setPageProps } from './inertia-stub-categories.jsx';
import Index from '../resources/js/Pages/Admin/Categories/Index.jsx';

const ROW = {
    id: 7,
    name: 'Daster Kulot',
    slug: 'daster-kulot',
    description:
        'Kategori contoh untuk verifikasi. Deskripsi sengaja panjang agar form ubah kategori ' +
        'setinggi mungkin dan melewati batas viewport 768px, sehingga area isi harus bergulir ' +
        'sementara tombol Simpan perubahan dan Batal tetap terlihat di footer.',
    sort_order: '2',
    is_active: true,
    image: null,
    product_count: '3',
};

const PROPS = {
    kategori: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 1,
        data: [ROW],
        links: [],
    },
    filter: { q: null, status: 'semua' },
    ringkasan: { total: '1', aktif: '1', nonaktif: '0' },
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

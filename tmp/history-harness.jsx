// Harness verifikasi halaman /history + menu profil header (kartu t_326f766b).
// Hanya alat verifikasi, bukan bagian aplikasi. Bangun: node tmp/build-history-check.mjs
import React from 'react';
import { createRoot } from 'react-dom/client';
import { __reset, __setPageProps } from './inertia-stub-history.jsx';
import History from '../resources/js/Pages/Public/History.jsx';

const USER = { name: 'Siti Rahma', email: 'siti@contoh.test' };

const SETTINGS = {
    store_name: 'Toko Kulot',
    store_tagline: 'Daster kulot nyaman untuk sehari-hari.',
    header_nav: [
        { label: 'Beranda', url: '/' },
        { label: 'Produk', url: '/produk' },
        { label: 'Kontak', url: '/kontak-kami' },
    ],
    footer_links: [],
    footer_social: [],
    footer_copyright: '© 2026 Toko Kulot',
    contact_phone: null,
    contact_whatsapp: null,
    contact_email: null,
    contact_address: null,
};

const ITEM_A = {
    id: 101,
    name: 'Daster Kulot Lengan Pendek',
    variant_label: 'Motif Bunga / M',
    qty: '2',
    unit_price: '125000',
    line_total: '250000',
    image: null,
};

const ITEM_B = {
    id: 102,
    name: 'Daster Kulot Lengan Panjang',
    variant_label: 'Polos Navy / L',
    qty: '1',
    unit_price: '175000',
    line_total: '175000',
    image: 'gambar-rusak.jpg',
};

const ORDER_BAYAR = {
    id: 41,
    code: 'TK-20261020-0041',
    created_at: '2026-10-20T10:15:00+07:00',
    status: 'dibayar',
    status_label: 'Dibayar',
    payment_status: 'settlement',
    payment_label: 'Transfer Bank (Midtrans)',
    total: '425000',
    items_count: '2',
    total_qty: '3',
    detail_url: '/checkout/41/selesai',
    items: [ITEM_A, ITEM_B],
};

const ORDER_BATAL = {
    id: 42,
    code: 'TK-20261018-0042',
    created_at: '2026-10-18T08:05:00+07:00',
    status: 'batal',
    status_label: 'Batal',
    payment_status: 'expire',
    payment_label: 'Transfer Bank (Midtrans)',
    total: '150000',
    items_count: '1',
    total_qty: '1',
    detail_url: null,
    items: [
        {
            id: 103,
            name: 'Daster Kulot Jumbo',
            variant_label: null,
            qty: '1',
            unit_price: '150000',
            line_total: '150000',
            image: null,
        },
    ],
};

const ORDER_PENDING = {
    id: 43,
    code: 'TK-20261022-0043',
    created_at: '2026-10-22T19:40:00+07:00',
    status: 'pending',
    status_label: 'Menunggu Pembayaran',
    payment_status: 'pending',
    payment_label: 'QRIS',
    total: '199000',
    items_count: null,
    total_qty: null,
    detail_url: '/checkout/43/bayar',
    items: null,
};

const PAGE_1 = {
    data: [ORDER_BAYAR, ORDER_BATAL, ORDER_PENDING],
    links: [],
    meta: { current_page: 1, last_page: 2, per_page: 3, total: 4, from: 1, to: 3 },
};

const PAGE_2 = {
    data: [
        {
            ...ORDER_BATAL,
            id: 44,
            code: 'TK-20261010-0044',
            status: 'selesai',
            status_label: 'Selesai',
            payment_status: 'settlement',
            detail_url: '/checkout/44/selesai',
        },
    ],
    links: [],
    meta: { current_page: 2, last_page: 2, per_page: 3, total: 4, from: 4, to: 4 },
};

const BASE_PROPS = {
    auth: { user: USER, admin: null },
    settings: SETTINGS,
    cart: { count: 2 },
    errors: {},
    flash: null,
};

const host = document.getElementById('app');
const root = createRoot(host);

function render({ orders = PAGE_1, ringkasan = { total: '4' }, props = {} } = {}) {
    __reset();
    __setPageProps({ ...BASE_PROPS, ...props });
    root.render(React.createElement(History, { orders, ringkasan }));
}

window.__render = render;
window.__renderEmpty = () =>
    render({ orders: { data: [], links: [], meta: { current_page: 1, last_page: 1, total: 0 } }, ringkasan: { total: '0' } });
window.__renderGuest = () =>
    render({ props: { auth: { user: null, admin: null }, cart: { count: 0 } } });

render();

/**
 * Harness QA `t_3a240a11` — badge keranjang di halaman publik (butir 1 laporan pemilik, temuan F-1).
 *
 * Yang diperiksa (runtime, bukan hanya membaca kode):
 *   Markup SSR `PublicLayout` (komponen asli, tanpa diubah) lewat `renderToStaticMarkup`,
 *   memakai komposisi props persis seperti 8 halaman publik memanggilnya
 *   (`grep -rn "PublicLayout" resources/js/Pages/Public`).
 *   Badge diambil dari markup yang benar-benar dihasilkan `IconButton`
 *   (`span.bg-accent-500`) plus `aria-label` tombol keranjang (`Header.jsx:80-85`).
 *
 * Kontrol negatif: env `QA_BADGE_LAMA=1` dipakai driver
 * `jalankan-uji-badge-t_3a240a11.mjs`, yang membangun ulang `PublicLayout` dengan
 * satu baris pra-perbaikan F-1 **di memori** (plugin esbuild) — berkas aplikasi
 * tidak disentuh. Harness dinyatakan sah hanya bila pada mode itu badge benar-benar hilang.
 *
 * Batasan: ini bukan browser. Tata letak, posisi badge, warna nyata, fokus keyboard,
 * dan interaksi klik tidak diuji.
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import PublicLayout from '../../resources/js/Layouts/PublicLayout.jsx';
import { kendali, bersihkan } from './stub-inertia-badge-t_3a240a11.mjs';

const MODE = process.env.QA_BADGE_LAMA === '1' ? 'kontrol-lama' : 'normal';

const SETTINGS = {
    store_name: 'Toko Kulot',
    header_nav: [
        { label: 'Beranda', url: '/' },
        { label: 'Produk', url: '/produk' },
    ],
    footer_links: [],
    footer_social: [],
};

/** Komposisi props mengikuti halaman yang benar-benar ada di repo. */
const KASUS = [
    {
        id: 'S1',
        nama: 'Home.jsx (PublicLayout settings+cartCount=0+user)',
        props: { settings: SETTINGS, cartCount: 0, user: null },
        halaman: { props: { cart: { count: 3 } } },
    },
    {
        id: 'S2',
        nama: 'Contact.jsx (cartCount default 0)',
        props: { settings: SETTINGS, cartCount: 0, user: null },
        halaman: { props: { cart: { count: 3 } } },
    },
    {
        id: 'S3',
        nama: 'Products/Index.jsx (cartCount default 0)',
        props: { settings: SETTINGS, cartCount: 0, user: null },
        halaman: { props: { cart: { count: 3 } } },
    },
    {
        id: 'S4',
        nama: 'Products/Show.jsx (cartCount default 0)',
        props: { settings: SETTINGS, cartCount: 0, user: null },
        halaman: { props: { cart: { count: 3 } } },
    },
    {
        id: 'S5',
        nama: 'Cart.jsx (<PublicLayout> tanpa prop)',
        props: {},
        halaman: { props: { cart: { count: 3 } } },
    },
    {
        id: 'S6',
        nama: 'Checkout.jsx (<PublicLayout> tanpa prop)',
        props: {},
        halaman: { props: { cart: { count: 3 } } },
    },
    {
        id: 'S7',
        nama: 'CheckoutPay.jsx (<PublicLayout> tanpa prop)',
        props: {},
        halaman: { props: { cart: { count: 3 } } },
    },
    {
        id: 'S8',
        nama: 'CheckoutSuccess.jsx (<PublicLayout> tanpa prop)',
        props: {},
        halaman: { props: { cart: { count: 3 } } },
    },
    {
        id: 'S9',
        nama: 'keranjang kosong (cart.count = 0)',
        props: { settings: SETTINGS, cartCount: 0, user: null },
        halaman: { props: { cart: { count: 0 } } },
    },
    {
        id: 'S10',
        nama: 'shared prop tidak ada -> jatuh ke prop halaman cartCount=2',
        props: { settings: SETTINGS, cartCount: 2, user: null },
        halaman: { props: {} },
    },
    {
        id: 'S11',
        nama: 'prioritas shared prop (cart.count=5) di atas prop halaman cartCount=9',
        props: { settings: SETTINGS, cartCount: 9, user: null },
        halaman: { props: { cart: { count: 5 } } },
    },
    {
        id: 'S12',
        nama: 'cart.count berupa teks "4" (sesi serialisasi)',
        props: {},
        halaman: { props: { cart: { count: '4' } } },
    },
];

const ambilBadge = (markup) => {
    const cocok = markup.match(/bg-accent-500[^"]*"[^>]*>([^<]*)<\/span>/);

    if (!cocok) return null;

    const isi = cocok[1].trim();

    return /^-?\d+$/.test(isi) ? Number(isi) : isi;
};

const ambilLabel = (markup) => {
    const cocok = markup.match(/aria-label="Keranjang([^"]*)"/);

    return cocok ? `Keranjang${cocok[1]}` : null;
};

const hasil = [];

for (const kasus of KASUS) {
    bersihkan(kasus.halaman);

    let markup = '';
    let galat = null;

    try {
        markup = renderToStaticMarkup(
            React.createElement(
                PublicLayout,
                kasus.props,
                React.createElement('p', null, 'konten uji')
            )
        );
    } catch (kesalahan) {
        galat = kesalahan.message;
    }

    hasil.push({
        id: kasus.id,
        nama: kasus.nama,
        badge: galat ? null : ambilBadge(markup),
        label: galat ? null : ambilLabel(markup),
        galat,
    });
}

console.log(
    JSON.stringify(
        {
            mode: MODE,
            berkas: 'resources/js/Layouts/PublicLayout.jsx',
            node: process.version,
            jumlahKasus: hasil.length,
            hasil,
        },
        null,
        2
    )
);

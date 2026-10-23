/**
 * Harness SSR untuk halaman Admin/Products (t_5988a39e).
 * Fixture mengikuti kontrak props §12.1, §12.2, §12.4, §12.5.
 * Jalankan: node tmp/render-produk-t_5988a39e.mjs  (setelah di-bundle esbuild)
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import Index from '../resources/js/Pages/Admin/Products/Index.jsx';
import Create from '../resources/js/Pages/Admin/Products/Create.jsx';
import Edit from '../resources/js/Pages/Admin/Products/Edit.jsx';
import Show from '../resources/js/Pages/Admin/Products/Show.jsx';

const KATEGORI = [
    { id: 1, name: 'Daster', slug: 'daster' },
    { id: 2, name: 'Kulot', slug: 'kulot' },
];

const UKURAN = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '3XL', '4XL', '5XL', 'ALL SIZE'];

const BARIS = {
    id: 3,
    name: 'Daster Batik Pekalongan',
    slug: 'daster-batik-pekalongan',
    sku: 'DSR-BTK-01',
    category: { id: 1, name: 'Daster', slug: 'daster' },
    base_price: 85000,
    compare_price: 99000,
    wholesale_price: 75000,
    min_wholesale_qty: 6,
    is_active: true,
    is_featured: false,
    stock: 24,
    variant_count: 3,
    image: { id: 7, path: '/images/seed/produk/daster-1.png', alt: 'Daster Batik Pekalongan' },
    url: '/produk/daster-batik-pekalongan',
    created_at: '2026-10-20T09:15:00+07:00',
    updated_at: '2026-10-20T09:15:00+07:00',
};

const BARIS_TANPA_GAMBAR = {
    id: 4,
    name: 'Kulot Jumbo',
    slug: 'kulot-jumbo',
    sku: null,
    category: null,
    base_price: '99000',
    compare_price: null,
    wholesale_price: null,
    min_wholesale_qty: null,
    is_active: false,
    is_featured: true,
    stock: 0,
    variant_count: 1,
    image: null,
    url: '/produk/kulot-jumbo',
    created_at: null,
    updated_at: null,
};

const PRODUK_INDEX = {
    data: [BARIS, BARIS_TANPA_GAMBAR],
    links: [],
    meta: { current_page: 1, last_page: 2, per_page: 15, total: 17 },
};

const FILTER = { q: null, kategori: null, status: 'semua', stok: 'semua', urut: 'terbaru' };

const RINGKASAN_INDEX = { total: 3, aktif: 3, nonaktif: 0, stok_kritis: 1 };

const DETAIL = {
    id: 3,
    name: 'Daster Batik Pekalongan',
    slug: 'daster-batik-pekalongan',
    sku: 'DSR-BTK-01',
    category_id: 1,
    category: { id: 1, name: 'Daster', slug: 'daster' },
    short_description: 'Daster batik adem',
    description: 'Baris satu.\nBaris dua.',
    weight_gram: 300,
    base_price: 85000,
    compare_price: 99000,
    wholesale_price: 75000,
    min_wholesale_qty: 6,
    is_active: true,
    is_featured: false,
    stock: 24,
    variant_count: 3,
    url: '/produk/daster-batik-pekalongan',
    created_at: '2026-10-20T09:15:00+07:00',
    updated_at: '2026-10-20T09:15:00+07:00',
    images: [
        { id: 7, path: '/images/seed/produk/daster-1.png', alt: 'Daster depan', is_primary: true, sort_order: 0 },
        { id: 8, path: '/images/seed/produk/daster-2.png', alt: null, is_primary: false, sort_order: 1 },
    ],
    variants: [
        { id: 12, size: 'L', color: 'Hitam', sku: 'DSR-BTK-01-L-HITAM', label: 'L / Hitam', price_delta: 0, stock: 10, is_active: true },
        { id: 13, size: 'XL', color: null, sku: 'DSR-BTK-01-XL', label: 'XL', price_delta: '5000', stock: 0, is_active: false },
    ],
};

const KASUS = [
    ['Index — daftar terisi', Index, { produk: PRODUK_INDEX, filter: FILTER, kategori: KATEGORI, ringkasan: RINGKASAN_INDEX, flash: { success: 'Produk dihapus.' } }],
    ['Index — kosong tanpa filter', Index, { produk: { data: [], links: [], meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 } }, filter: FILTER, kategori: KATEGORI, ringkasan: { total: 0, aktif: 0, nonaktif: 0, stok_kritis: 0 } }],
    ['Index — filter aktif tanpa hasil', Index, { produk: { data: [], links: [], meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 } }, filter: { q: 'batik', kategori: 1, status: 'aktif', stok: 'kritis', urut: 'nama' }, kategori: KATEGORI, ringkasan: RINGKASAN_INDEX }],
    ['Index — props server hilang', Index, {}],
    ['Create', Create, { kategori: KATEGORI, ukuran_baku: UKURAN }],
    ['Create — kategori kosong', Create, { kategori: [], ukuran_baku: UKURAN }],
    ['Edit', Edit, { produk: DETAIL, kategori: KATEGORI, ukuran_baku: UKURAN }],
    ['Edit — tanpa gambar/varian', Edit, { produk: { ...DETAIL, images: [], variants: [] }, kategori: KATEGORI, ukuran_baku: UKURAN }],
    ['Show', Show, { produk: DETAIL, ukuran_baku: UKURAN, ringkasan: { varian_total: 3, stok_total: 24, stok_kritis: 1, terjual: 12 } }],
    ['Show — ringkasan null', Show, { produk: DETAIL }],
    ['Show — data null di banyak kolom', Show, { produk: { ...DETAIL, short_description: null, description: null, weight_gram: null, compare_price: null, wholesale_price: null, min_wholesale_qty: null, category: null, slug: null, stock: null, url: null, created_at: null, updated_at: null, images: [], variants: [] }, ringkasan: null }],
];

const HARUS_ADA = {
    'Index — daftar terisi': ['Daster Batik Pekalongan', 'DSR-BTK-01', 'Rp', 'varian', 'Kulot Jumbo', 'Tanpa SKU', 'Unggulan', 'Nonaktif', 'Tambah produk', 'Menampilkan 2 dari 17 produk', 'Produk dihapus.'],
    'Index — kosong tanpa filter': ['Belum ada produk', 'Tambah produk'],
    'Index — filter aktif tanpa hasil': ['Tidak ada produk yang cocok', 'Reset filter'],
    'Create': ['Tambah produk', 'Informasi produk', 'Varian', 'Galeri', 'Pilih ukuran', 'Ukuran *'],
    'Edit': ['Daster Batik Pekalongan', 'DSR-BTK-01', 'Gambar utama', 'Jadikan gambar utama', 'L / Hitam'.replace('L / Hitam', 'L')],
    'Show': ['Daster Batik Pekalongan', 'Gambar utama', 'Terjual', 'Lihat halaman publik produk', 'Tanpa tambahan', 'XL'],
};

let gagal = 0;

const periksa = (nama, markup, wajib = []) => {
    const masalah = [];

    if (/NaN/.test(markup)) masalah.push('mengandung teks NaN');
    if (/undefined/.test(markup)) masalah.push('mengandung teks undefined');
    if (/\[CONTOH\]|Placeholder|lorem ipsum/i.test(markup)) masalah.push('mengandung teks placeholder');
    if (/<img(?![^>]*\salt=)/.test(markup)) masalah.push('ada <img> tanpa alt');
    if (/text-slate-400/.test(markup)) masalah.push('memakai text-slate-400 (aturan §11.4 T1)');

    wajib.forEach((teks) => {
        if (!markup.includes(teks)) masalah.push(`teks wajib hilang: "${teks}"`);
    });

    if (masalah.length > 0) {
        gagal += 1;
        console.log(`GAGAL  ${nama}`);
        masalah.forEach((m) => console.log(`        - ${m}`));
    } else {
        console.log(`OK     ${nama} (${markup.length} karakter)`);
    }
};

KASUS.forEach(([nama, Komponen, props]) => {
    try {
        const markup = renderToStaticMarkup(React.createElement(Komponen, props));
        periksa(nama, markup, HARUS_ADA[nama] ?? []);
    } catch (error) {
        gagal += 1;
        console.log(`GAGAL  ${nama} -> render melempar: ${error?.message}`);
    }
});

// Kelengkapan rute yang dipakai halaman (literal, kontrak §12.1–§12.7).
const MARKUP_INDEX = renderToStaticMarkup(React.createElement(Index, { produk: PRODUK_INDEX, filter: FILTER, kategori: KATEGORI, ringkasan: RINGKASAN_INDEX }));
const MARKUP_DETAIL = renderToStaticMarkup(React.createElement(Show, { produk: DETAIL, ringkasan: null }));
const tautanWajib = [
    ['/admin/produk/tambah', MARKUP_INDEX],
    ['/admin/produk/3', MARKUP_INDEX],
    ['/admin/produk/3/ubah', MARKUP_INDEX],
    ['/admin/produk/4/ubah', MARKUP_INDEX],
    ['/admin/produk', MARKUP_DETAIL],
    ['/admin/produk/3/ubah', MARKUP_DETAIL],
];

tautanWajib.forEach(([href, markup]) => {
    if (!markup.includes(`href="${href}"`)) {
        gagal += 1;
        console.log(`GAGAL  tautan ${href} tidak ada di markup`);
    } else {
        console.log(`OK     tautan ${href}`);
    }
});

console.log(gagal === 0 ? '\nHASIL: semua kasus lulus' : `\nHASIL: ${gagal} masalah`);
process.exit(gagal === 0 ? 0 : 1);

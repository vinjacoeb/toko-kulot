/**
 * Harness verifikasi halaman Admin/Products — kartu t_5988a39e (F3), versi 2.
 *
 * Dua lapis:
 *  1. Render SSR tiap halaman dengan fixture kontrak §12.1/§12.4 + komponen bersama
 *     (Toast/Modal/DataTable) untuk membuktikan state loading/empty/error dan tidak ada
 *     NaN/undefined/teks placeholder di layar.
 *  2. Assert tingkat sumber: key query & nilai enum §12.1, literal rute admin.produk.*,
 *     mekanisme unggah §12.6 (`_method`), dan larangan stack (ziggy/route(), fetch/axios,
 *     localStorage, dangerouslySetInnerHTML).
 *
 * Jalankan: node tmp/render-produk-t_5988a39e.bundle.mjs  (di-bundle esbuild lebih dulu)
 */
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';

import Index from '../resources/js/Pages/Admin/Products/Index.jsx';
import Create from '../resources/js/Pages/Admin/Products/Create.jsx';
import Edit from '../resources/js/Pages/Admin/Products/Edit.jsx';
import Show from '../resources/js/Pages/Admin/Products/Show.jsx';
import Toast from '../resources/js/Components/Toast.jsx';
import Modal from '../resources/js/Components/Modal.jsx';
import DataTable from '../resources/js/Components/DataTable.jsx';

const AKAR = path.resolve('resources/js/Pages/Admin/Products');
const baca = (relatif) => fs.readFileSync(path.join(AKAR, relatif), 'utf8');
const SRC = {
    Index: baca('Index.jsx'),
    Create: baca('Create.jsx'),
    Edit: baca('Edit.jsx'),
    Show: baca('Show.jsx'),
    ProdukForm: baca('partials/ProdukForm.jsx'),
    VarianEditor: baca('partials/VarianEditor.jsx'),
    DropzoneGalery: baca('partials/DropzoneGalery.jsx'),
};

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

const BARIS_NULL = {
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
    data: [BARIS, BARIS_NULL],
    links: [],
    meta: { current_page: 1, last_page: 2, per_page: 15, total: 17 },
};

const FILTER = { q: null, kategori: null, status: 'semua', stok: 'semua', urut: 'terbaru' };
const RINGKASAN = { total: 3, aktif: 3, nonaktif: 0, stok_kritis: 1 };

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
    ['Index — daftar terisi', Index, { produk: PRODUK_INDEX, filter: FILTER, kategori: KATEGORI, ringkasan: RINGKASAN, flash: { success: 'Produk dihapus.' } }],
    ['Index — kosong tanpa filter', Index, { produk: { data: [], links: [], meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 } }, filter: FILTER, kategori: KATEGORI, ringkasan: { total: 0, aktif: 0, nonaktif: 0, stok_kritis: 0 } }],
    ['Index — filter aktif tanpa hasil', Index, { produk: { data: [], links: [], meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 } }, filter: { q: 'batik', kategori: 1, status: 'aktif', stok: 'kritis', urut: 'nama' }, kategori: KATEGORI, ringkasan: RINGKASAN }],
    ['Index — props server hilang', Index, {}],
    ['Index — angka berbentuk string', Index, { produk: { data: [{ ...BARIS, base_price: '85000', stock: '24', variant_count: '3' }], links: [], meta: { current_page: '1', last_page: '1', per_page: '15', total: '1' } }, filter: FILTER, kategori: KATEGORI, ringkasan: { total: '3', aktif: '3', nonaktif: '0', stok_kritis: '1' } }],
    ['Create', Create, { kategori: KATEGORI, ukuran_baku: UKURAN }],
    ['Create — kategori kosong', Create, { kategori: [], ukuran_baku: UKURAN }],
    ['Edit', Edit, { produk: DETAIL, kategori: KATEGORI, ukuran_baku: UKURAN }],
    ['Edit — tanpa gambar/varian', Edit, { produk: { ...DETAIL, images: [], variants: [] }, kategori: KATEGORI, ukuran_baku: UKURAN }],
    ['Edit — props server hilang', Edit, {}],
    ['Show', Show, { produk: DETAIL, ukuran_baku: UKURAN, ringkasan: { varian_total: 3, stok_total: 24, stok_kritis: 1, terjual: 12 } }],
    ['Show — ringkasan null', Show, { produk: DETAIL }],
    ['Show — banyak kolom null', Show, { produk: { ...DETAIL, short_description: null, description: null, weight_gram: null, compare_price: null, wholesale_price: null, min_wholesale_qty: null, category: null, slug: null, stock: null, url: null, created_at: null, updated_at: null, images: [], variants: [] }, ringkasan: null }],
    ['Toast sukses', Toast, { tone: 'success', title: 'Berhasil', message: 'Produk disimpan.' }],
    ['Toast galat', Toast, { tone: 'error', title: 'Gagal', message: 'Produk gagal disimpan.' }],
    ['DataTable — memuat', DataTable, { columns: [{ key: 'name', label: 'Produk' }], rows: [], loading: true }],
    ['DataTable — kosong', DataTable, { columns: [{ key: 'name', label: 'Produk' }], rows: [], emptyTitle: 'Belum ada produk' }],
    ['DataTable — galat', DataTable, { columns: [{ key: 'name', label: 'Produk' }], rows: [], error: 'Gagal memuat daftar produk.', onRetry: () => {} }],
    ['Modal konfirmasi hapus', Modal, { open: true, title: 'Hapus produk?', description: 'Produk yang dihapus tidak bisa dikembalikan.', onClose: () => {}, footer: React.createElement('button', { type: 'button' }, 'Hapus') }],
];

const WAJIB = {
    'Index — daftar terisi': ['Daster Batik Pekalongan', 'DSR-BTK-01', 'Rp', 'Kulot Jumbo', 'Unggulan', 'Nonaktif', 'Tambah produk'],
    'Index — kosong tanpa filter': ['Belum ada produk', 'Tambah produk'],
    'Index — filter aktif tanpa hasil': ['Tidak ada produk yang cocok'],
    'Index — props server hilang': ['Tambah produk'],
    Create: ['Tambah produk', 'Ukuran'],
    'Create — kategori kosong': ['Tambah produk'],
    Edit: ['Daster Batik Pekalongan', 'DSR-BTK-01', 'Hitam'],
    'Edit — tanpa gambar/varian': ['Daster Batik Pekalongan'],
    'Edit — props server hilang': [],
    Show: ['Daster Batik Pekalongan', 'Terjual'],
    'Show — ringkasan null': ['Daster Batik Pekalongan'],
    'Show — banyak kolom null': ['Daster Batik Pekalongan'],
    'DataTable — memuat': ['aria-busy="true"'],
    'DataTable — kosong': ['Belum ada produk'],
    'DataTable — galat': ['Gagal memuat daftar produk.'],
    'Toast sukses': ['role="status"', 'Produk disimpan.'],
    'Toast galat': ['role="alert"', 'Produk gagal disimpan.'],
    'Modal konfirmasi hapus': ['aria-modal="true"', 'Hapus produk?'],
};

let gagal = 0;

const laporkan = (nama, masalah) => {
    if (masalah.length === 0) {
        console.log(`OK     ${nama}`);
        return;
    }

    gagal += 1;
    console.log(`GAGAL  ${nama}`);
    masalah.forEach((m) => console.log(`        - ${m}`));
};

const artefakTerlarang = (markup) => {
    const masalah = [];

    if (/NaN/.test(markup)) masalah.push('mengandung teks NaN');
    if (/\bundefined\b/.test(markup)) masalah.push('mengandung teks undefined');
    if (/\[Grafik Placeholder\]|lorem ipsum|FIXME|TODO:/i.test(markup)) masalah.push('mengandung teks placeholder');

    const tanpaAlt = markup.match(/<img(?![^>]*\salt=)/g);
    if (tanpaAlt) masalah.push(`ada ${tanpaAlt.length} <img> tanpa alt`);

    // Teks informatif < 24px: slate-400 hanya sah untuk elemen non-teks/aria-hidden/dekoratif (design §2.1).
    const regex = /<(\w+)\b([^>]*text-slate-400[^>]*)>([^<]*)/g;
    let m;
    let contoh = 0;

    while ((m = regex.exec(markup)) !== null) {
        const atribut = m[2];
        const isi = m[3].replace(/\s+/g, ' ').trim();
        const adaTeks = (isi.match(/[A-Za-z0-9]/g) ?? []).length >= 2;

        if (adaTeks && !/aria-hidden/.test(atribut) && contoh < 3) {
            contoh += 1;
            masalah.push(`teks "${isi.slice(0, 45)}" memakai text-slate-400 (kontras 2,56:1, design §2.1/§11.4)`);
        }
    }

    return masalah;
};

KASUS.forEach(([nama, Komponen, props]) => {
    try {
        const markup = renderToStaticMarkup(React.createElement(Komponen, props));
        const masalah = artefakTerlarang(markup);

        (WAJIB[nama] ?? []).forEach((teks) => {
            if (!markup.includes(teks)) masalah.push(`teks wajib hilang: "${teks}"`);
        });

        laporkan(`${nama} (${markup.length} karakter)`, masalah);
    } catch (error) {
        laporkan(nama, [`render melempar: ${error?.message}`]);
    }
});

// Tautan literal ke rute admin.produk.* (kontrak §12.1–§12.7, tanpa Ziggy).
const MARKUP_INDEX = renderToStaticMarkup(React.createElement(Index, { produk: PRODUK_INDEX, filter: FILTER, kategori: KATEGORI, ringkasan: RINGKASAN }));
const MARKUP_DETAIL = renderToStaticMarkup(React.createElement(Show, { produk: DETAIL, ringkasan: null }));

[
    ['Index → /admin/produk/tambah', '/admin/produk/tambah', MARKUP_INDEX],
    ['Index → /admin/produk/3', '/admin/produk/3', MARKUP_INDEX],
    ['Index → /admin/produk/3/ubah', '/admin/produk/3/ubah', MARKUP_INDEX],
    ['Index → /admin/produk/4/ubah', '/admin/produk/4/ubah', MARKUP_INDEX],
    ['Index → /admin/produk?stok=kritis', '/admin/produk?stok=kritis', MARKUP_INDEX],
    ['Show → /admin/produk', '/admin/produk', MARKUP_DETAIL],
    ['Show → /admin/produk/3/ubah', '/admin/produk/3/ubah', MARKUP_DETAIL],
    ['Show → /produk/daster-batik-pekalongan', '/produk/daster-batik-pekalongan', MARKUP_DETAIL],
].forEach(([nama, href, markup]) => {
    laporkan(`tautan ${nama}`, markup.includes(`href="${href}"`) ? [] : [`href="${href}" tidak ada di markup`]);
});

const punya = (berkas, pola, keterangan) => {
    const sumber = SRC[berkas];
    const cocok = pola instanceof RegExp ? pola.test(sumber) : sumber.includes(pola);
    laporkan(`sumber ${berkas}: ${keterangan}`, cocok ? [] : [`pola tidak ditemukan: ${pola}`]);
};

const tidakPunya = (berkas, pola, keterangan) => {
    const sumber = SRC[berkas];
    const kena = pola instanceof RegExp ? pola.test(sumber) : sumber.includes(pola);
    laporkan(`sumber ${berkas}: ${keterangan}`, kena ? [`ditemukan pola terlarang: ${pola}`] : []);
};

// §12.1 query filter: key dan nilai enum persis.
punya('Index', "router.get('/admin/produk', query", 'memakai literal rute index + query');
punya('Index', 'preserveState: true', 'menjaga state filter (Inertia)');
punya('Index', 'preserveScroll: true', 'menjaga posisi scroll');
punya('Index', 'onError', 'menangani galat navigasi');
punya('Index', /flash\?\.success/, 'menampilkan flash.success server sebagai toast');
punya('Index', 'router.delete(', 'aksi hapus memakai DELETE');
punya('Index', '/admin/produk/${', 'URL hapus literal per produk');
['aktif', 'nonaktif', 'semua', 'habis', 'kritis', 'terbaru', 'nama', 'harga', 'stok'].forEach((nilai) => {
    punya('Index', `'${nilai}'`, `nilai enum §12.1 "${nilai}"`);
});

// §12.3/§12.6 form: unggah gambar + varian + _method.
punya('ProdukForm', '_method', 'mekanisme POST + _method=PUT (§12.3/§12.6)');
punya('ProdukForm', '/admin/produk', 'literal rute simpan/ubah');
punya('ProdukForm', 'errors.', 'menampilkan galat validasi server per kolom');
punya('ProdukForm', 'images_alt', 'mengirim images_alt[] (§12.3)');
punya('ProdukForm', 'hapus_images', 'mengirim hapus_images[] (§12.6)');
punya('ProdukForm', 'primary_image_id', 'mengirim primary_image_id (§12.6)');
punya('ProdukForm', 'variants', 'mengirim variants[] (§12.3)');
punya('DropzoneGalery', 'MAKS', 'batas maksimum gambar (maks 5, §12.3)');
punya('VarianEditor', 'price_delta', 'kolom price_delta varian (§12.3)');

// Larangan stack & keamanan (aturan kerja agent).
['Index', 'Create', 'Edit', 'Show', 'ProdukForm', 'VarianEditor', 'DropzoneGalery'].forEach((berkas) => {
    tidakPunya(berkas, /dangerouslySetInnerHTML/, 'tidak memakai dangerouslySetInnerHTML');
    tidakPunya(berkas, /\blocalStorage\b|\bsessionStorage\b/, 'tidak menyimpan apa pun di storage browser');
    tidakPunya(berkas, /\bfetch\(|axios/, 'tidak memanggil API langsung (props Inertia)');
    tidakPunya(berkas, /\broute\(|Ziggy/, 'tidak memakai helper route()/Ziggy');
});

console.log(gagal === 0 ? '\nHASIL: semua pemeriksaan lulus' : `\nHASIL: ${gagal} pemeriksaan gagal`);
process.exit(gagal === 0 ? 0 : 1);

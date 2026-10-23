/**
 * Harness QA `t_3a240a11` — render SSR halaman daftar Admin (butir 4 laporan pemilik:
 * daftar produk/stok/pesanan, pencarian, pagination, gambar).
 *
 * Menggunakan komponen aplikasi apa adanya (tidak ada berkas aplikasi yang diubah),
 * dijalankan lewat driver `jalankan-uji-admin-t_3a240a11.mjs` yang meng-alias
 * `@inertiajs/react` ke stub `stub-inertia-badge-t_3a240a11.mjs`.
 *
 * Data uji semuanya fiktif (bertanda "Uji") — tidak ada data pemilik/pelanggan nyata.
 * Batasan: bukan browser; tata letak, klik, dan fokus keyboard tidak diuji di sini.
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import ProductsIndex from '../../resources/js/Pages/Admin/Products/Index.jsx';
import StocksIndex from '../../resources/js/Pages/Admin/Stocks/Index.jsx';
import OrdersIndex from '../../resources/js/Pages/Admin/Orders/Index.jsx';

const PRODUK = {
    data: [
        {
            id: 1,
            name: 'Daster Kulot Batik Uji',
            sku: 'DKS-UJI-01',
            base_price: 85000,
            stock: 12,
            variant_count: 3,
            is_active: true,
            is_featured: false,
            category: { name: 'Daster' },
            image: { path: '/storage/produk/uji.jpg', alt: 'Daster batik uji' },
        },
    ],
    meta: { current_page: 1, last_page: 3, total: 31, per_page: 15 },
};

const STOK = {
    data: [
        {
            id: 1,
            product: { name: 'Daster Kulot Batik Uji', slug: 'daster-kulot-batik-uji' },
            label: 'S — Merah',
            sku: 'DKS-UJI-01-S-MERAH',
            stock: 4,
            status: 'kritis',
            is_active: true,
            updated_at: '2026-10-20 09:30:00',
        },
    ],
    meta: { current_page: 1, last_page: 3, total: 31, per_page: 15 },
};

const PESANAN = {
    data: [
        {
            id: 1,
            code: 'INV-UJI-0001',
            created_at: '2026-10-20 10:00:00',
            customer_name: 'Pelanggan Uji',
            customer_email: 'uji@example.test',
            customer_phone: '081200000000',
            items_count: 2,
            payment_label: 'QRIS',
            payment_status: 'settlement',
            status: 'dibayar',
            status_label: 'Dibayar',
            total: 170000,
            url: '/admin/pesanan/1',
        },
    ],
    meta: { current_page: 1, last_page: 3, total: 31, per_page: 15 },
};

const HALAMAN = [
    {
        id: 'A1',
        nama: 'Admin/Products/Index.jsx',
        komponen: ProductsIndex,
        props: {
            produk: PRODUK,
            filter: { q: '', kategori: '', status: '' },
            kategori: [{ id: 1, name: 'Daster' }],
            ringkasan: { total: 31, aktif: 24, nonaktif: 7, stok_kritis: 2 },
            flash: null,
        },
        checks: [
            { id: 'A1.1', harap: 'baris produk dirender', harus: ['Daster Kulot Batik Uji', 'DKS-UJI-01'] },
            { id: 'A1.2', harap: 'gambar produk dipakai sebagai <img src> + alt', harus: ['<img', 'src="/storage/produk/uji.jpg"', 'alt="Daster batik uji"'] },
            { id: 'A1.3', harap: 'KPI ringkasan tampil', harus: ['Total produk', '31'] },
        ],
    },
    {
        id: 'A2',
        nama: 'Admin/Stocks/Index.jsx',
        komponen: StocksIndex,
        props: {
            stok: STOK,
            filter: { q: '', kategori: '', status: '' },
            kategori: [{ id: 1, name: 'Daster' }],
            ringkasan: { varian: 31, habis: 2, kritis: 3 },
            flash: null,
            errors: null,
        },
        checks: [
            { id: 'A2.1', harap: 'baris varian + slug produk dirender', harus: ['Daster Kulot Batik Uji', 'S — Merah', 'DKS-UJI-01-S-MERAH'] },
            { id: 'A2.2', harap: 'badge status baris tampil', harus: ['Kritis'] },
            { id: 'A2.3', harap: 'nama tombol aksi memuat produk + varian (aria-label)', harus: ['Catat stok masuk untuk Daster Kulot Batik Uji — S — Merah'] },
        ],
    },
    {
        id: 'A3',
        nama: 'Admin/Orders/Index.jsx',
        komponen: OrdersIndex,
        props: {
            pesanan: PESANAN,
            filter: { q: '', status: '', bayar: '', dari: '', sampai: '' },
            ringkasan: { total: 31, pending: 3, dibayar: 5, diproses: 2, dikirim: 4, selesai: 16, batal: 1 },
            flash: null,
        },
        checks: [
            { id: 'A3.1', harap: 'baris pesanan dirender (kode + pelanggan)', harus: ['INV-UJI-0001', 'Pelanggan Uji'] },
            { id: 'A3.2', harap: 'label status pembayaran/status pesanan tampil', harus: ['Dibayar'] },
            { id: 'A3.3', harap: 'kolom pencarian pesanan tampil', harus: ['Cari kode, nama, telepon, atau email'] },
        ],
    },
];

const hasil = [];

for (const halaman of HALAMAN) {
    let markup = '';
    let galat = null;

    try {
        markup = renderToStaticMarkup(React.createElement(halaman.komponen, halaman.props));
    } catch (kesalahan) {
        galat = kesalahan.message;
    }

    const checks = halaman.checks.map((check) => {
        const temuan = check.harus.filter((teks) => !markup.includes(teks));

        return {
            id: check.id,
            harap: check.harap,
            harus: check.harus,
            tidakKetemu: galat ? check.harus : temuan,
            pass: !galat && temuan.length === 0,
        };
    });

    // Kualitas tambahan: markup tidak boleh membocorkan objek yang tak ter-render.
    checks.push({
        id: `${halaman.id}.4`,
        harap: 'tidak ada "[object Object]" (prop salah bentuk)',
        harus: ['bukan [object Object]'],
        tidakKetemu: markup.includes('[object Object]') ? ['markup memuat [object Object]'] : [],
        pass: !galat && !markup.includes('[object Object]'),
    });

    hasil.push({
        id: halaman.id,
        nama: halaman.nama,
        panjangMarkup: markup.length,
        galat,
        checks,
    });
}

console.log(JSON.stringify({ berkas: HALAMAN.map((h) => h.nama), node: process.version, hasil }, null, 2));

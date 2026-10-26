/**
 * Harness verifikasi kartu t_e3c1f107 — status kirim di halaman selesai + riwayat pembeli.
 *
 * Render SSR kedua halaman dengan fixture berbentuk kontrak §7.9/§13 + blok v1.3 (PRD-v1.3 §2.6),
 * lalu cek tiap keadaan design-v1.3 §4/§3: belum ada webhook, picked, delivered, delivered-dari-
 * diproses, resi kosong. Tidak boleh ada `undefined`/`NaN`, harga aktual, selisih, payload, atau
 * tautan lacak di riwayat.
 *
 * Jalankan: node tmp/build-ssr-v13-t_e3c1f107.mjs && node tmp/ssr-v13-t_e3c1f107.bundle.mjs
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import CheckoutSuccess from '../resources/js/Pages/Public/CheckoutSuccess.jsx';
import History from '../resources/js/Pages/Public/History.jsx';
import { __setPageProps } from '@inertiajs/react';

let gagal = 0;

const cek = (nama, kondisi, info = '') => {
    if (kondisi) {
        console.log(`OK   ${nama}`);
    } else {
        gagal += 1;
        console.log(`GAGAL ${nama}${info ? ` — ${info}` : ''}`);
    }
};

const render = (element) => renderToStaticMarkup(element);
const tanpaNilaiAneh = (nama, html) => {
    cek(`${nama}: tanpa undefined/NaN`, !/undefined|NaN/.test(html), (html.match(/undefined|NaN/g) ?? []).join(','));
};

__setPageProps({ settings: {}, cart: { count: 0 }, auth: { user: { name: 'Siti' } } });

const item = {
    product_id: 3,
    name: 'Daster Batik Pekalongan',
    variant_label: 'Ukuran L / Merah',
    qty: 1,
    unit_price: 340000,
    line_total: 340000,
    image: null,
};

const pesanan = (shipping) => ({
    id: 21,
    code: 'TK-20261020-0001',
    status: 'dibayar',
    payment_status: 'settlement',
    subtotal: 340000,
    shipping_cost: 20000,
    total: 360000,
    customer_name: 'Siti Aminah',
    customer_phone: '081234567890',
    customer_address: 'Jl. Melati 12',
    customer_city: 'Pekalongan',
    created_at: '2026-10-20T14:05:00+07:00',
    paid_at: '2026-10-20T14:09:00+07:00',
    items: [item],
    shipping,
});

const SHIP_KOSONG = {
    courier_code: 'jne',
    courier_name: 'JNE',
    service_name: 'REG',
    etd: '2-3 hari',
    weight_gram: 2000,
    shipping_cost: 20000,
    tracking_number: null,
    status: null,
    status_label: null,
    biteship_order_id: null,
    updated_at: null,
    driver: null,
    perlu_tindakan: false,
    tindakan: null,
    galat: null,
};

const ulasan = { boleh: false, sudah: [] };

// ---- Halaman selesai -------------------------------------------------------
const selesaiKosong = render(<CheckoutSuccess pesanan={pesanan(SHIP_KOSONG)} ulasan={ulasan} />);
tanpaNilaiAneh('selesai/belum ada webhook', selesaiKosong);
cek('selesai/belum ada webhook: "Resi sedang disiapkan."', selesaiKosong.includes('Resi sedang disiapkan.'));
cek('selesai/belum ada webhook: status "—"', selesaiKosong.includes('>—<'));
cek('selesai/belum ada webhook: tanpa "Lacak paket"', !selesaiKosong.includes('Lacak paket'));
cek('selesai: kop "Status pengiriman"', selesaiKosong.includes('Status pengiriman'));

const selesaiPicked = render(
    <CheckoutSuccess
        pesanan={pesanan({
            ...SHIP_KOSONG,
            tracking_number: 'JX1234567890',
            status: 'picked',
            status_label: 'Dikonfirmasi',
            updated_at: '2026-10-21T09:15:00+07:00',
            driver: { name: 'Budi', phone: '081234567891', link: 'https://track.contoh.id/BS-123' },
        })}
        ulasan={ulasan}
    />
);
tanpaNilaiAneh('selesai/picked', selesaiPicked);
cek('selesai/picked: label status dari server', selesaiPicked.includes('Dikonfirmasi'));
cek('selesai/picked: resi + tombol salin', selesaiPicked.includes('JX1234567890') && selesaiPicked.includes('Salin nomor resi'));
cek('selesai/picked: petugas kurir', selesaiPicked.includes('Petugas kurir') && selesaiPicked.includes('Budi'));
cek('selesai/picked: diperbarui', selesaiPicked.includes('Diperbarui'));
cek(
    'selesai/picked: tautan lacak aman',
    selesaiPicked.includes('Lacak paket') &&
        selesaiPicked.includes('href="https://track.contoh.id/BS-123"') &&
        selesaiPicked.includes('target="_blank"') &&
        selesaiPicked.includes('rel="noopener noreferrer"')
);

const selesaiDelivered = render(
    <CheckoutSuccess
        pesanan={pesanan({
            ...SHIP_KOSONG,
            tracking_number: 'JX1234567890',
            status: 'delivered',
            status_label: 'Terkirim',
            updated_at: '2026-10-22T10:00:00+07:00',
            driver: { name: null, phone: null, link: 'javascript:alert(1)' },
        })}
        ulasan={ulasan}
    />
);
tanpaNilaiAneh('selesai/delivered tanpa driver', selesaiDelivered);
cek('selesai/delivered: label "Terkirim"', selesaiDelivered.includes('Terkirim'));
cek('selesai: tautan non-http tidak dirender', !selesaiDelivered.includes('Lacak paket') && !selesaiDelivered.includes('javascript:'));
cek('selesai: baris Petugas kurir disembunyikan saat driver null', !selesaiDelivered.includes('Petugas kurir'));

const selesaiTanpaShipping = render(<CheckoutSuccess pesanan={{ ...pesanan(SHIP_KOSONG), shipping: null }} ulasan={ulasan} />);
tanpaNilaiAneh('selesai/tanpa shipping', selesaiTanpaShipping);
cek('selesai/tanpa shipping: tetap "Resi sedang disiapkan."', selesaiTanpaShipping.includes('Resi sedang disiapkan.'));

// ---- Riwayat ---------------------------------------------------------------
const order = (id, extra) => ({
    id,
    code: `TK-2026102${id}-0001`,
    status: 'pending',
    status_label: 'Pending',
    payment_status: 'pending',
    payment_label: 'Menunggu pembayaran',
    subtotal: 340000,
    shipping_cost: 20000,
    discount: 0,
    total: 360000,
    items_count: 1,
    total_qty: 1,
    created_at: '2026-10-23T09:00:00+07:00',
    paid_at: null,
    detail_url: null,
    customer: { name: 'Siti Aminah', phone: '0812', address: 'Jl. Melati 12', city: 'Pekalongan', postal_code: '51100' },
    shipping: SHIP_KOSONG,
    timeline: { created_at: '2026-10-23T09:00:00+07:00', paid_at: null, shipped_at: null },
    items: [item],
    ...extra,
});

const daftar = [
    order(42),
    order(43, {
        status: 'dikirim',
        status_label: 'Dikirim',
        shipping: {
            ...SHIP_KOSONG,
            tracking_number: 'JX1234567890',
            status: 'picked',
            status_label: 'Dikonfirmasi',
            updated_at: '2026-10-21T09:15:00+07:00',
            driver: { name: 'Budi', phone: '081234567891', link: 'https://track.contoh.id/BS-123' },
        },
        timeline: { created_at: '2026-10-23T09:00:00+07:00', paid_at: '2026-10-23T09:05:00+07:00', shipped_at: '2026-10-24T08:30:00+07:00' },
    }),
    order(44, {
        status: 'diproses',
        status_label: 'Diproses',
        shipping: {
            ...SHIP_KOSONG,
            tracking_number: 'JX999',
            status: 'delivered',
            status_label: 'Terkirim',
            updated_at: '2026-10-22T10:00:00+07:00',
            driver: null,
        },
    }),
    order(45, {
        status: 'selesai',
        status_label: 'Selesai',
        shipping: {
            ...SHIP_KOSONG,
            tracking_number: 'JX777',
            status: 'delivered',
            status_label: 'Terkirim',
            updated_at: '2026-10-25T11:00:00+07:00',
            driver: { name: 'Budi', phone: '081234567891', link: 'https://track.contoh.id/BS-777' },
        },
        timeline: { created_at: '2026-10-23T09:00:00+07:00', paid_at: '2026-10-23T09:05:00+07:00', shipped_at: '2026-10-24T08:30:00+07:00' },
    }),
];

const riwayat = render(
    <History
        orders={{
            data: daftar,
            links: [],
            meta: { current_page: 1, last_page: 1, per_page: 10, total: daftar.length },
        }}
        ringkasan={{ total: daftar.length, pending: 1, dibayar: 0, diproses: 1, dikirim: 1, selesai: 1, batal: 0 }}
    />
);

tanpaNilaiAneh('riwayat', riwayat);
cek('riwayat: resi kosong pakai copy existing', riwayat.includes('Resi belum tersedia.'));
cek('riwayat: status_label tampil (Dikonfirmasi/Terkirim)', riwayat.includes('Dikonfirmasi') && riwayat.includes('Terkirim'));
cek('riwayat: baris Petugas kurir + telepon', riwayat.includes('Petugas kurir') && riwayat.includes('081234567891'));
cek('riwayat: baris Diperbarui', riwayat.includes('Diperbarui'));
cek('riwayat: timeline Dikirim pakai shipped_at', riwayat.includes('24 Okt 2026, 08.30'));
cek('riwayat: tanpa tautan lacak', !riwayat.includes('Lacak paket') && !riwayat.includes('track.contoh.id'));
cek('riwayat: tanpa harga aktual/selisih/payload', !/price_final|price_selisih|webhook/i.test(riwayat));
cek('riwayat: tanpa aksi ubah status / tindakan', !/Perlu tindakan|Ubah status/i.test(riwayat));

// delivered-dari-diproses: webhook sudah "delivered" tetapi pesanan masih diproses, jadi
// `timeline.shipped_at` null (node Dikirim belum aktif) — label pengiriman tetap tampil apa adanya.
const riwayatDiproses = render(
    <History
        orders={{ data: [daftar[2]], links: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 1 } }}
        ringkasan={{ total: 1 }}
    />
);
tanpaNilaiAneh('riwayat/delivered-dari-diproses', riwayatDiproses);
cek(
    'riwayat/delivered-dari-diproses: label tampil, timeline Dikirim belum berisi waktu',
    riwayatDiproses.includes('Terkirim') && !riwayatDiproses.includes('08.30')
);

const riwayatKosong = render(
    <History orders={{ data: [], links: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 } }} ringkasan={{ total: 0 }} />
);
tanpaNilaiAneh('riwayat kosong', riwayatKosong);
cek('riwayat kosong: EmptyState', riwayatKosong.includes('Belum ada pesanan.'));

console.log(gagal === 0 ? '\nSEMUA CEK LULUS' : `\n${gagal} CEK GAGAL`);
process.exit(gagal === 0 ? 0 : 1);

/**
 * Harness verifikasi kartu t_02c3d20c (B2 — gate ulasan di CheckoutSuccess memakai `ulasan.boleh`).
 * File uji lokal (bukan bagian aplikasi). Perintah yang benar-benar dijalankan:
 *   ./node_modules/@esbuild/win32-x64/esbuild.exe tmp/uji-ssr-gate-boleh-t_02c3d20c.mjs --bundle \
 *     --platform=node --format=esm --jsx=automatic --packages=external \
 *     --outfile=tmp/uji-ssr-gate-boleh-t_02c3d20c.bundle.mjs \
 *     --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs
 *   node tmp/uji-ssr-gate-boleh-t_02c3d20c.bundle.mjs
 * Stub Inertia dipakai bersama harness kartu t_321bf03c; `--packages=external` wajib supaya
 * react-dom/server memakai require bawaan Node. Yang dirender adalah komponen asli (PublicLayout,
 * InlineNotice, ReviewForm) apa adanya lewat renderToStaticMarkup.
 * Dasar: kontrak §7.9 (dibekukan 21 Okt 2026) + docs/keputusan-f6-ulasan-boleh.md §3.
 *   Gate resmi: `tampilkanForm = boleh && pending.length > 0` (cabang kontradiksi dihapus).
 * Batasan: ini bukan browser — tata letak, fokus keyboard, dan tampilan nyata tidak diuji di sini.
 */
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import CheckoutSuccess from '../resources/js/Pages/Public/CheckoutSuccess.jsx';
import { kendali, bersihkan } from './stub-inertia-t_321bf03c.mjs';

const JEJAK = 'resources/js/Pages/Public/CheckoutSuccess.jsx';
const hasil = [];
const uji = (nama, fn) => {
    try {
        fn();
        hasil.push({ status: 'OK', nama, catatan: '' });
    } catch (galat) {
        hasil.push({ status: 'GAGAL', nama, catatan: galat.message });
    }
};

const harus = (kondisi, pesan) => {
    if (!kondisi) throw new Error(pesan);
};

const teks = (markup) =>
    String(markup ?? '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&#x27;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/\s+/g, ' ')
        .trim();

const jumlah = (teksnya, potongan) => teksnya.split(potongan).length - 1;

const KOTOR = ['NaN', 'undefined', '[object Object]', 'lorem ipsum', '[Grafik Placeholder]', 'TODO:', 'FIXME'];

const render = (props) => {
    bersihkan();
    kendali.halaman.props = { auth: { user: null }, cart: { count: 2 }, settings: {} };

    return renderToStaticMarkup(React.createElement(CheckoutSuccess, props));
};

// ---------------------------------------------------------------- fixture
const item = (productId, ubah = {}) => ({
    id: productId,
    product_id: productId,
    variant_id: null,
    name: `Produk ${productId}`,
    variant_label: 'Ukuran L / Merah',
    qty: 1,
    unit_price: 85000,
    line_total: 85000,
    image: `/images/seed/produk/produk-${productId}.png`,
    ...ubah,
});

const pesanan = (ubah = {}, items = [item(3), item(7)]) => ({
    id: 21,
    code: 'TK-20261020-0001',
    status: 'dibayar',
    payment_status: 'settlement',
    subtotal: 170000,
    shipping_cost: 20000,
    total: 190000,
    customer_name: 'Siti Aminah',
    customer_phone: '081234567890',
    customer_address: 'Jl. Melati 12',
    customer_city: 'Pekalongan',
    created_at: '2026-10-20T14:05:00+07:00',
    paid_at: '2026-10-20T14:09:00+07:00',
    items,
    ...ubah,
});

const SUKSES = 'Terima kasih! Penilaianmu membantu pembeli lain.';
const ALASAN = 'Ulasan bisa dikirim setelah pembayaran berhasil.';
const SUDAH_DINILAI = 'Produk ini sudah kamu nilai pada pesanan ini.';
const FORM = 'Seberapa puas kamu?';
const KIRIM = 'Kirim Penilaian';
const JUDUL_FORM = 'Beri Penilaian';
const JUDUL_TERTUTUP = 'Penilaianmu';

// ---------------------------------------------------------------- uji
uji('1. boleh=false, masih ada sisa produk -> TANPA form, tanpa notice alasan (DoD-1)', () => {
    const t = teks(render({ pesanan: pesanan(), ulasan: { boleh: false, sudah: [3] } }));

    harus(jumlah(t, FORM) === 0, `form harus 0 saat boleh=false, dapat ${jumlah(t, FORM)}`);
    harus(jumlah(t, KIRIM) === 0, `tombol kirim harus 0, dapat ${jumlah(t, KIRIM)}`);
    harus(!t.includes(JUDUL_FORM), 'judul form tidak boleh tampil saat gerbang tertutup');
    harus(t.includes(JUDUL_TERTUTUP), 'judul harus "Penilaianmu"');
    harus(jumlah(t, SUDAH_DINILAI) === 1, `kartu produk 3 harus tetap tampil, dapat ${jumlah(t, SUDAH_DINILAI)}`);
    harus(!t.includes(ALASAN), 'notice alasan §9.1 tidak berlaku: pesanan settlement + status dibayar');
    harus(!t.includes(SUKSES), 'terima kasih belum berlaku: masih ada produk yang belum dinilai');
});

uji('2. boleh=true, masih ada sisa produk -> form tampil (DoD-2)', () => {
    const t = teks(render({ pesanan: pesanan(), ulasan: { boleh: true, sudah: [3] } }));

    harus(jumlah(t, FORM) === 1, `form sisa harus 1, dapat ${jumlah(t, FORM)}`);
    harus(t.includes(JUDUL_FORM), 'judul harus "Beri Penilaian"');
    harus(jumlah(t, SUDAH_DINILAI) === 1, 'kartu produk yang sudah diulas harus tetap tampil');
    harus(!t.includes(ALASAN), 'notice alasan tidak boleh tampil bersama form');
});

uji('3. semua produk sudah diulas (boleh=false) -> tanpa form + terima kasih (DoD-3)', () => {
    const t = teks(render({ pesanan: pesanan(), ulasan: { boleh: false, sudah: [3, 7] } }));

    harus(jumlah(t, FORM) === 0, `form harus 0, dapat ${jumlah(t, FORM)}`);
    harus(jumlah(t, SUDAH_DINILAI) === 2, `kartu terkunci harus 2, dapat ${jumlah(t, SUDAH_DINILAI)}`);
    harus(t.includes(SUKSES), 'notice terima kasih harus tampil');
    harus(t.includes(JUDUL_TERTUTUP), 'judul harus "Penilaianmu"');
});

uji('4. boleh=false + sisa produk, syarat §9.1 belum terpenuhi -> notice alasan tampil', () => {
    const t = teks(render({ pesanan: pesanan({ payment_status: 'pending', paid_at: null }), ulasan: { boleh: false, sudah: [] } }));

    harus(jumlah(t, FORM) === 0, `form harus 0, dapat ${jumlah(t, FORM)}`);
    harus(t.includes(ALASAN), 'notice alasan pembayaran harus tampil');
});

uji('5. boleh=false + sisa produk, status batal -> tanpa form + notice alasan', () => {
    const t = teks(render({ pesanan: pesanan({ status: 'batal' }), ulasan: { boleh: false, sudah: [] } }));

    harus(jumlah(t, FORM) === 0, `form harus 0, dapat ${jumlah(t, FORM)}`);
    harus(t.includes(ALASAN), 'notice alasan harus tampil untuk status yang belum boleh dinilai');
});

uji('6. props `boleh=true` dipercaya apa adanya (keputusan §3: klien tidak menggandakan §9.1)', () => {
    const t = teks(render({ pesanan: pesanan({ status: 'pending' }), ulasan: { boleh: true, sudah: [] } }));

    harus(jumlah(t, FORM) === 2, `form harus 2 karena boleh=true, dapat ${jumlah(t, FORM)}`);
    harus(!t.includes(ALASAN), 'notice alasan tidak boleh tampil bersama form (saling eksklusif)');
});

uji('7. gate statis: `boleh && pending.length > 0`, cabang kontradiksi hilang, alasan pakai syaratDinilai', () => {
    const sumber = readFileSync(JEJAK, 'utf8');

    harus(
        sumber.includes('const tampilkanForm = boleh && pending.length > 0;'),
        'gate resmi `const tampilkanForm = boleh && pending.length > 0;` tidak ditemukan'
    );
    harus(!sumber.includes('kontradiksiBoleh'), 'cabang kontradiksiBoleh masih ada di komponen');
    harus(
        /const alasanBelumBoleh = !tampilkanForm && !syaratDinilai && pending\.length > 0;/.test(sumber),
        'notice alasan harus tetap memakai syaratDinilai'
    );
    harus(sumber.includes("const syaratDinilai ="), 'syaratDinilai hilang dari komponen');
});

uji('8. props `ulasan` tidak dikirim -> gerbang tertutup, halaman utuh', () => {
    const t = teks(render({ pesanan: pesanan(), ulasan: null }));

    harus(jumlah(t, FORM) === 0, `form harus 0 tanpa props ulasan, dapat ${jumlah(t, FORM)}`);
    harus(t.includes('Pesanan diterima'), 'halaman harus tetap utuh');
});

uji('9. sapu kotor (NaN/undefined/placeholder) di semua state di atas', () => {
    const kasus = [
        { pesanan: pesanan(), ulasan: { boleh: false, sudah: [3] } },
        { pesanan: pesanan(), ulasan: { boleh: true, sudah: [3] } },
        { pesanan: pesanan(), ulasan: { boleh: false, sudah: [3, 7] } },
        { pesanan: pesanan({ payment_status: 'pending', paid_at: null }), ulasan: { boleh: false, sudah: [] } },
        { pesanan: pesanan({ status: 'batal' }), ulasan: { boleh: false, sudah: [] } },
        { pesanan: pesanan({ status: 'pending' }), ulasan: { boleh: true, sudah: [] } },
        { pesanan: pesanan(), ulasan: null },
    ];

    kasus.forEach((props, i) => {
        const markup = render(props);
        const temuan = KOTOR.filter((p) => markup.includes(p));

        harus(temuan.length === 0, `kasus #${i + 1} memuat teks terlarang: ${temuan.join(', ')}`);
    });
});

// ---------------------------------------------------------------- laporan
const lebar = Math.max(...hasil.map((h) => h.nama.length));
hasil.forEach((h) => console.log(`${h.status.padEnd(5)} | ${h.nama.padEnd(lebar)} | ${h.catatan}`));

const gagal = hasil.filter((h) => h.status === 'GAGAL').length;
console.log(`\nRINGKASAN: ${hasil.length - gagal}/${hasil.length} uji lulus`);
process.exitCode = gagal === 0 ? 0 : 1;

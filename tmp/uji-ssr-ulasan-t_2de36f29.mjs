/**
 * Harness verifikasi kartu t_2de36f29 (F6 — halaman selesai checkout menghormati `ulasan.boleh`).
 * File uji lokal (bukan bagian aplikasi). Perintah yang benar-benar dijalankan:
 *   ./node_modules/@esbuild/win32-x64/esbuild.exe tmp/uji-ssr-ulasan-t_2de36f29.mjs --bundle \
 *     --platform=node --format=esm --jsx=automatic --packages=external \
 *     --outfile=tmp/uji-ssr-ulasan-t_2de36f29.bundle.mjs \
 *     --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs
 *   node tmp/uji-ssr-ulasan-t_2de36f29.bundle.mjs
 * Stub Inertia dipakai bersama harness kartu t_321bf03c; `--packages=external` wajib supaya
 * react-dom/server memakai require bawaan Node. Yang dirender adalah komponen asli
 * (PublicLayout, InlineNotice, ReviewForm) apa adanya lewat renderToStaticMarkup.
 * Batasan: ini bukan browser — tata letak, fokus keyboard, dan tampilan nyata tidak diuji di sini.
 * Diperbarui kartu t_02c3d20c (B2): gate resmi = `ulasan.boleh && pending.length > 0` (kontrak §7.9
 * dibekukan 21 Okt 2026) — uji 3, 7, dan 12 ikut definisi baru, uji lain tidak berubah.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import CheckoutSuccess from '../resources/js/Pages/Public/CheckoutSuccess.jsx';
import { kendali, bersihkan } from './stub-inertia-t_321bf03c.mjs';

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

// ---------------------------------------------------------------- uji
uji('1. boleh=true, belum ada ulasan -> 2 form, tanpa notice alasan', () => {
    const t = teks(render({ pesanan: pesanan(), ulasan: { boleh: true, sudah: [] } }));

    harus(jumlah(t, FORM) === 2, `form harus 2, dapat ${jumlah(t, FORM)}`);
    harus(jumlah(t, KIRIM) === 2, `tombol kirim harus 2, dapat ${jumlah(t, KIRIM)}`);
    harus(t.includes('Beri Penilaian'), 'judul "Beri Penilaian" hilang');
    harus(!t.includes(ALASAN), 'notice alasan tidak boleh tampil saat boleh=true');
    harus(!t.includes(SUKSES), 'notice terima kasih tidak boleh tampil sebelum ada ulasan');
});

uji('2. boleh=true, 1 dari 2 sudah diulas -> 1 form + 1 kartu terkunci', () => {
    const t = teks(render({ pesanan: pesanan(), ulasan: { boleh: true, sudah: [3] } }));

    harus(jumlah(t, FORM) === 1, `form harus 1, dapat ${jumlah(t, FORM)}`);
    harus(t.includes(SUDAH_DINILAI), 'kartu produk yang sudah diulas harus tampil');
    harus(t.includes('Beri Penilaian'), 'judul harus "Beri Penilaian" karena masih ada sisa');
});

uji('3. boleh=false padahal masih ada sisa produk -> tanpa form, tanpa notice alasan', () => {
    const t = teks(render({ pesanan: pesanan(), ulasan: { boleh: false, sudah: [3] } }));

    harus(jumlah(t, FORM) === 0, `form harus 0 saat boleh=false, dapat ${jumlah(t, FORM)}`);
    harus(!t.includes('Beri Penilaian'), 'judul harus "Penilaianmu" saat form tertutup');
    harus(jumlah(t, SUDAH_DINILAI) === 1, `kartu produk yang sudah diulas tetap tampil, dapat ${jumlah(t, SUDAH_DINILAI)}`);
    harus(!t.includes(ALASAN), 'alasan §9.1 tidak berlaku: pesanan sudah settlement + status boleh dinilai');
    harus(!t.includes(SUKSES), 'terima kasih belum berlaku: masih ada produk yang belum dinilai');
});

uji('4. boleh=false, semua sudah diulas -> tanpa form + terima kasih + 2 kartu', () => {
    const t = teks(render({ pesanan: pesanan(), ulasan: { boleh: false, sudah: [3, 7] } }));

    harus(jumlah(t, FORM) === 0, `form harus 0, dapat ${jumlah(t, FORM)}`);
    harus(jumlah(t, SUDAH_DINILAI) === 2, `kartu ulasan harus 2, dapat ${jumlah(t, SUDAH_DINILAI)}`);
    harus(t.includes(SUKSES), 'notice terima kasih harus tampil saat semua sudah diulas');
    harus(t.includes('Penilaianmu'), 'judul harus "Penilaianmu"');
});

uji('5. belum lunas (payment_status pending) -> tanpa form + alasan', () => {
    const t = teks(
        render({
            pesanan: pesanan({ payment_status: 'pending', paid_at: null }),
            ulasan: { boleh: false, sudah: [] },
        })
    );

    harus(jumlah(t, FORM) === 0, `form harus 0 saat belum lunas, dapat ${jumlah(t, FORM)}`);
    harus(t.includes(ALASAN), 'alasan syarat pembayaran harus tampil');
    harus(!t.includes(SUKSES), 'tidak boleh ada terima kasih saat belum ada ulasan');
});

uji('6. settlement status=batal -> tanpa form + alasan', () => {
    const t = teks(render({ pesanan: pesanan({ status: 'batal' }), ulasan: { boleh: false, sudah: [] } }));

    harus(jumlah(t, FORM) === 0, `form harus 0 saat status batal, dapat ${jumlah(t, FORM)}`);
    harus(t.includes(ALASAN), 'alasan harus tampil untuk status yang belum boleh dinilai');
});

uji('7. props `boleh=true` dipercaya apa adanya (server = sumber aturan §9.1) -> form tampil', () => {
    const t = teks(render({ pesanan: pesanan({ status: 'pending' }), ulasan: { boleh: true, sudah: [] } }));

    harus(jumlah(t, FORM) === 2, `form harus 2 karena boleh=true, dapat ${jumlah(t, FORM)}`);
    harus(t.includes('Beri Penilaian'), 'judul harus "Beri Penilaian"');
    harus(!t.includes(ALASAN), 'alasan §9.1 tidak boleh tampil bersama form (saling eksklusif)');
});

uji('8. flash.error dari server ditampilkan', () => {
    const t = teks(
        render({
            pesanan: pesanan({ status: 'pending' }),
            ulasan: { boleh: true, sudah: [] },
            flash: { error: ALASAN },
        })
    );

    harus(jumlah(t, ALASAN) >= 1, 'pesan galat server harus tampil');
});

uji('9. galat validasi ulasan (errors.ulasan) ditampilkan', () => {
    const t = teks(
        render({
            pesanan: pesanan(),
            ulasan: { boleh: true, sudah: [] },
            errors: { ulasan: 'Ulasan tidak sah.' },
        })
    );

    harus(t.includes('Ulasan tidak sah.'), 'galat validasi `ulasan` harus tampil');
});

uji('10. angka dari server sebagai string -> tanpa NaN, rupiah benar', () => {
    const items = [item(3, { qty: '4', unit_price: '85000', line_total: '340000' })];
    const t = teks(
        render({
            pesanan: pesanan({ total: '360000', subtotal: '340000', shipping_cost: '20000' }, items),
            ulasan: { boleh: true, sudah: [] },
        })
    );

    harus(t.includes('Rp340.000'), 'harga baris harus terformat dari string');
    harus(t.includes('Rp360.000'), 'total harus terformat dari string');
    harus(jumlah(t, '4 × Rp85.000') === 1, 'jumlah x harga harus terformat');
});

uji('11. items kosong -> tidak ada form/notice, tidak crash', () => {
    const t = teks(render({ pesanan: pesanan({}, []), ulasan: { boleh: false, sudah: [] } }));

    harus(jumlah(t, FORM) === 0, 'tidak boleh ada form');
    harus(!t.includes(SUKSES), 'tidak boleh ada terima kasih tanpa produk');
    harus(!t.includes(ALASAN), 'tidak boleh ada alasan tanpa produk yang bisa dinilai');
});

uji('12. props `ulasan` tidak dikirim (null) -> gerbang tertutup (tanpa form), halaman utuh', () => {
    const t = teks(render({ pesanan: pesanan(), ulasan: null }));

    harus(jumlah(t, FORM) === 0, `tanpa props ulasan gerbang harus tertutup, dapat ${jumlah(t, FORM)}`);
    harus(t.includes('Pesanan diterima'), 'halaman harus tetap utuh');
    harus(t.includes(ALASAN) === false, 'alasan §9.1 tidak berlaku: pesanan sudah settlement + status boleh dinilai');
});

uji('13. sapu kotor (NaN/undefined/placeholder) di semua state di atas', () => {
    const kasus = [
        { pesanan: pesanan(), ulasan: { boleh: true, sudah: [] } },
        { pesanan: pesanan(), ulasan: { boleh: false, sudah: [3] } },
        { pesanan: pesanan(), ulasan: { boleh: false, sudah: [3, 7] } },
        { pesanan: pesanan({ payment_status: 'pending', paid_at: null }), ulasan: { boleh: false, sudah: [] } },
        {
            pesanan: pesanan({ status: 'pending' }),
            ulasan: { boleh: true, sudah: [] },
            flash: { error: ALASAN },
            errors: { ulasan: 'Ulasan tidak sah.' },
        },
        { pesanan: pesanan({}, []), ulasan: null },
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

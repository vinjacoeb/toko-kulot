/**
 * Harness SSR/statik kartu t_d1028202 (F5b — isian nomor resi di /admin/pesanan/{order}).
 * File uji lokal (bukan bagian aplikasi). Tanpa browser dan tanpa pustaka uji baru.
 * Perintah yang benar-benar dijalankan:
 *   ./node_modules/@esbuild/win32-x64/esbuild.exe tmp/uji-ssr-resi-t_d1028202.mjs --bundle \
 *     --platform=node --format=esm --jsx=automatic --packages=external \
 *     --outfile=tmp/uji-ssr-resi-t_d1028202.bundle.mjs \
 *     --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs
 *   node tmp/uji-ssr-resi-t_d1028202.bundle.mjs
 * Yang diuji: markup nyata dari komponen asli (Field/Input/Button ikut dirender), teks beku
 * D12, nilai awal isian, baris status, galat server, dan props Show -> InfoResi.
 * Batasan: bukan browser — tata letak, fokus, dan klik nyata tidak diuji di sini.
 */
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import InfoResi from '../resources/js/Pages/Admin/Orders/partials/InfoResi.jsx';
import Show from '../resources/js/Pages/Admin/Orders/Show.jsx';
import { bersihkan, kendali } from './stub-inertia-t_321bf03c.mjs';

const AKAR = process.cwd();
const berkas = {
    resi: 'resources/js/Pages/Admin/Orders/partials/InfoResi.jsx',
    show: 'resources/js/Pages/Admin/Orders/Show.jsx',
};
const baca = (relatif) => fs.readFileSync(path.join(AKAR, relatif), 'utf8');

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

// ------------------------------------------------------------------ helper render
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

const render = (Komponen, props, errors = null) => {
    bersihkan();
    kendali.halaman.props = errors ? { errors } : {};

    return renderToStaticMarkup(React.createElement(Komponen, props));
};

const kotor = (s) =>
    ['undefined', 'NaN', '[object Object]', 'lorem ipsum', '[Grafik Placeholder]', 'TODO:', 'FIXME'].filter((p) =>
        s.includes(p)
    );

const pesanan = (ubah = {}) => ({
    id: 5,
    code: 'TK-20261020-0001',
    status: 'dikirim',
    status_label: 'Dikirim',
    payment_status: 'settlement',
    payment_label: 'Lunas',
    subtotal: 170000,
    shipping_cost: 5000,
    discount: 0,
    total: 175000,
    payment_method: 'qris',
    notes: null,
    tracking_number: 'JX1234567890',
    customer: {
        name: 'Siti Aminah',
        phone: '081234567890',
        email: 'siti@example.test',
        address: 'Jl. Melati 12',
        city: 'Pekalongan',
        postal_code: '51111',
    },
    items: [
        {
            id: 9,
            product_id: 3,
            product_name: 'Daster Kulot Lengan Panjang',
            variant_label: 'L / Hitam',
            qty: 2,
            unit_price: 85000,
            line_total: 170000,
        },
    ],
    payment: null,
    created_at: '2026-10-20T09:15:00+07:00',
    paid_at: '2026-10-20T09:20:00+07:00',
    ...ubah,
});

const propsShow = (ubah = {}) => ({
    pesanan: pesanan(),
    status_berikut: [{ value: 'selesai', label: 'Selesai' }],
    ...ubah,
});

// Teks beku (docs/keputusan-a15-resi.md §1, design D12 docs/design.md:869)
const LABEL = 'Nomor resi';
const BANTUAN = 'Isi nomor resi dari ekspedisi setelah paket dikirim. Kosongkan untuk menghapus.';
const KOSONG = 'Belum ada nomor resi.';
const TOMBOL = 'Simpan resi';
const NOTICE_LAMA = 'Nomor resi belum bisa diisi';

const markahTerkumpul = [];
const simpan = (nama, markup) => {
    markahTerkumpul.push({ nama, markup });
};

// ================================================================== A. InfoResi
uji('R1 resi terisi: nilai awal isian + baris status `Tersimpan:` + teks beku D12', () => {
    const markup = render(InfoResi, { pesanan: pesanan() });
    const t = teks(markup);
    simpan('R1', markup);

    harus(markup.includes('value="JX1234567890"'), 'input tidak memuat nilai awal dari props');
    harus(markup.includes('name="tracking_number"'), 'nama field bukan tracking_number');
    harus(markup.includes('type="text"'), 'input bukan type text');
    harus(/maxlength="60"/i.test(markup), 'maxLength 60 tidak dipasang');
    harus(markup.includes('for="resi-pesanan"'), 'label tidak terhubung ke isian');
    harus(t.includes(LABEL), `label hilang: ${LABEL}`);
    harus(t.includes(BANTUAN), 'teks bantuan D12 hilang');
    harus(t.includes(`Tersimpan: JX1234567890`), 'baris status nilai tersimpan hilang');
    harus(t.includes(TOMBOL), `tombol ${TOMBOL} hilang`);
    harus(!t.includes(KOSONG), 'status kosong tidak boleh tampil saat resi terisi');
    harus(!/\sdisabled(?:[=\s>])/.test(markup.match(/<button[^>]*>/)[0] ?? ''), 'tombol tidak boleh nonaktif saat diam');
});

uji('R2 `tracking_number` null -> input kosong + `Belum ada nomor resi.` (DoD)', () => {
    const markup = render(InfoResi, { pesanan: pesanan({ tracking_number: null }) });
    const t = teks(markup);
    simpan('R2', markup);

    harus(markup.includes('value=""'), 'input harus kosong saat null');
    harus(t.includes(KOSONG), `status kosong hilang: ${KOSONG}`);
    harus(!t.includes('Tersimpan:'), 'baris `Tersimpan:` tidak boleh tampil saat kosong');
    harus(t.includes(BANTUAN), 'bantuan tetap tampil saat kosong');
    harus(kotor(t).length === 0, `teks kotor: ${kotor(t).join(', ')}`);
});

uji('R3 `tracking_number` string kosong -> sama seperti null, tanpa `Tersimpan:`', () => {
    const markup = render(InfoResi, { pesanan: pesanan({ tracking_number: '' }) });
    const t = teks(markup);
    simpan('R3', markup);

    harus(markup.includes('value=""'), 'input harus kosong saat string kosong');
    harus(t.includes(KOSONG), 'status kosong hilang untuk string kosong');
    harus(!t.includes('Tersimpan:'), 'baris `Tersimpan:` tidak boleh tampil untuk string kosong');
});

uji('R4 galat server `errors.tracking_number` tampil di bawah input + aria terhubung', () => {
    const pesan = 'Nomor resi maksimal 60 karakter.';
    const markup = render(InfoResi, { pesanan: pesanan() }, { tracking_number: pesan });
    const t = teks(markup);
    simpan('R4', markup);

    harus(t.includes(pesan), 'pesan galat server tidak tampil');
    harus(markup.includes('role="alert"'), 'galat tidak punya role alert');
    harus(markup.includes('aria-describedby="resi-pesanan-error"'), 'galat tidak terhubung aria-describedby');
    harus(markup.includes('aria-invalid="true"'), 'input tidak ditandai aria-invalid');
    harus(!t.includes(BANTUAN), 'bantuan digantikan galat (aturan Field §4.5)');
    harus(markup.includes('value="JX1234567890"'), 'nilai isian tetap dari props saat galat');
});

uji('R5 galat field lain tidak menempel di isian resi', () => {
    const markup = render(InfoResi, { pesanan: pesanan() }, { status: 'Status pesanan wajib dipilih.' });
    simpan('R5', markup);

    harus(!teks(markup).includes('Status pesanan wajib dipilih.'), 'galat field lain bocor ke isian resi');
    harus(!markup.includes('aria-invalid'), 'input tidak boleh ditandai invalid oleh field lain');
});

uji('R6 pesanan tanpa id / props hilang -> aman, tanpa kontrol mati', () => {
    [undefined, null, {}, { code: 'TK-1' }].forEach((nilai) => {
        const markup = render(InfoResi, { pesanan: nilai });
        harus(markup === '', `harus tidak merender apa pun tanpa id, dapat: ${markup.slice(0, 120)}`);
    });
    const markupTanpaProps = render(InfoResi, {});
    harus(markupTanpaProps === '', 'tanpa props harus tidak merender kontrol');
});

uji('R7 notice lama F5 hilang dan tidak ada teks karangan', () => {
    const isi = baca(berkas.resi);
    harus(!isi.includes('InlineNotice'), 'InfoResi masih memakai InlineNotice lama');
    harus(!isi.includes(NOTICE_LAMA), 'teks notice lama masih ada');
    harus(!isi.includes('TODO') && !isi.includes('FIXME'), 'masih ada penanda pekerjaan');
    const t = teks(render(InfoResi, { pesanan: pesanan() }));
    harus(!t.includes(NOTICE_LAMA), 'notice lama masih tampil di markup');
});

uji('R8 nilai janggal dari server (angka, spasi) tidak menghasilkan NaN/undefined', () => {
    const angka = teks(render(InfoResi, { pesanan: pesanan({ tracking_number: 1234567890 }) }));
    simpan('R8-angka', render(InfoResi, { pesanan: pesanan({ tracking_number: 1234567890 }) }));
    harus(angka.includes('Tersimpan: 1234567890'), 'angka harus tampil sebagai teks');
    harus(!angka.includes('NaN'), 'angka menghasilkan NaN');
    harus(!angka.includes('undefined'), 'nilai hilang menghasilkan undefined');
});

// ================================================================== B. integrasi Show
uji('R9 Show mengirim props `pesanan` ke InfoResi (nilai resi dari props server)', () => {
    const markup = render(Show, propsShow());
    const t = teks(markup);
    simpan('R9', markup);

    harus(markup.includes('value="JX1234567890"'), 'Show tidak mengirim tracking_number ke isian resi');
    harus(t.includes(LABEL), 'label resi hilang di halaman detail');
    harus(t.includes('Pengiriman'), 'kartu Pengiriman hilang');
});

uji('R10 Show dengan tracking_number null -> isian kosong + status kosong', () => {
    const markup = render(Show, propsShow({ pesanan: pesanan({ tracking_number: null }) }));
    const t = teks(markup);
    simpan('R10', markup);

    harus(markup.includes('value=""'), 'isian resi tidak kosong saat props null');
    harus(t.includes(KOSONG), 'status kosong hilang di halaman detail');
    harus(!teks(markup).includes('undefined'), 'null tampil sebagai undefined');
});

uji('R11 sapu kotor di semua markup yang sudah diambil', () => {
    markahTerkumpul.forEach(({ nama, markup }) => {
        const t = teks(markup);
        const temuan = kotor(t);
        harus(temuan.length === 0, `${nama} memuat: ${temuan.join(', ')}`);
    });
});

// ================================================================== laporan
const lebar = Math.max(...hasil.map((h) => h.nama.length));
hasil.forEach((h) => console.log(`${h.status.padEnd(5)} | ${h.nama.padEnd(lebar)} | ${h.catatan}`));

const gagal = hasil.filter((h) => h.status === 'GAGAL').length;
console.log(`\nRINGKASAN: ${hasil.length - gagal}/${hasil.length} uji lulus`);
process.exitCode = gagal === 0 ? 0 : 1;

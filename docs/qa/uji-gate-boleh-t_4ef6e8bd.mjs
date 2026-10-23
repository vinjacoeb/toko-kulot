/**
 * Harness QA kartu t_4ef6e8bd — gerbang `ulasan.boleh` di halaman /checkout/{order}/selesai.
 *
 * Yang diperiksa (runtime, bukan pembacaan kode saja):
 *   Markup SSR komponen asli `CheckoutSuccess` lewat `renderToStaticMarkup`, dengan stub
 *   `@inertiajs/react` (lihat stub-inertia-qa-t_4ef6e8bd.mjs). Ini membuktikan gerbang klien
 *   tidak menampilkan form penilaian pada keadaan yang server tolak, dan sebaliknya.
 *
 *   Kontrol negatif: dengan env QA_GERBANG_LAMA=1 harness hanya menjalankan satu pemeriksaan
 *   terbalik — memastikan harness benar-benar BISA melihat form (dipakai driver
 *   `jalankan-uji-gate-t_4ef6e8bd.mjs` yang membangun ulang komponen dengan gerbang lama
 *   di memori, tanpa mengubah berkas aplikasi).
 *
 * Batasan: JSX di sini bukan browser. Tata letak, fokus keyboard, dan tampilan nyata
 * tidak diuji; interaksi tombol tidak diklik (tidak ada DOM).
 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import CheckoutSuccess from '../../resources/js/Pages/Public/CheckoutSuccess.jsx';
import { kendali, bersihkan } from './stub-inertia-qa-t_4ef6e8bd.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
const AKAR = resolve(DIR, '..', '..');

const MODE_KONTROL = process.env.QA_GERBANG_LAMA === '1';
const JEJAK_JSX = join(AKAR, 'resources', 'js', 'Pages', 'Public', 'CheckoutSuccess.jsx');

const PENANDA = {
    form: 'Seberapa puas kamu?',
    kirim: 'Kirim Penilaian',
    headingForm: 'Beri Penilaian',
    headingDiam: 'Penilaianmu',
    alasan: 'Ulasan bisa dikirim setelah pembayaran berhasil.',
    sudah: 'Produk ini sudah kamu nilai pada pesanan ini.',
    terimaKasih: 'Terima kasih! Penilaianmu membantu pembeli lain.',
};

const GATE_RESMI = 'const tampilkanForm = boleh && pending.length > 0;';

// ------------------------------------------------------------------ perkakas

const hasil = [];
const catat = (id, nama, lulus, catatan = '') => hasil.push({ id, nama, lulus: Boolean(lulus), catatan });

const harus = (syarat, pesan) => {
    if (!syarat) throw new Error(pesan);
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

const render = (props) => {
    bersihkan();
    kendali.halaman.props = { auth: { user: null }, cart: { count: 2 }, settings: {}, flash: {} };

    return renderToStaticMarkup(React.createElement(CheckoutSuccess, props));
};

const periksaRender = (id, nama, props, harapan) => {
    let markup;
    try {
        markup = render(props);
    } catch (galat) {
        catat(id, nama, false, `render gagal: ${galat.message}`);

        return null;
    }

    const isi = teks(markup);
    const salah = [];

    Object.entries(harapan).forEach(([penanda, target]) => {
        const potongan = penanda === 'komentar-3' || penanda === 'komentar-7'
            ? `id="ulasan-komentar-${penanda.split('-')[1]}"`
            : PENANDA[penanda];
        const nyata = penanda.startsWith('komentar-') ? jumlah(markup, potongan) : jumlah(isi, potongan);

        if (nyata !== target) {
            salah.push(`${penanda}: harap ${target}, dapat ${nyata}`);
        }
    });

    catat(id, nama, salah.length === 0, salah.join('; '));

    return { markup, isi };
};

// ---------------------------------------------------------------- fixture

const item = (productId, ubah = {}) => ({
    id: productId,
    product_id: productId,
    variant_id: null,
    name: `[CONTOH] Produk ${productId}`,
    variant_label: 'Ukuran L / Merah',
    qty: 1,
    unit_price: 85000,
    line_total: 85000,
    image: `/images/seed/produk/produk-${productId}.png`,
    ...ubah,
});

const pesanan = (ubah = {}, items = [item(3), item(7)]) => ({
    id: 21,
    code: 'TK-20261021-0001',
    status: 'dibayar',
    payment_status: 'settlement',
    subtotal: 170000,
    shipping_cost: 20000,
    total: 190000,
    customer_name: 'Siti Aminah',
    customer_phone: '081234567890',
    customer_address: 'Jl. Melati 12',
    customer_city: 'Pekalongan',
    created_at: '2026-10-21T14:05:00+07:00',
    paid_at: '2026-10-21T14:09:00+07:00',
    items,
    ...ubah,
});

// ------------------------------------------------------- mode kontrol negatif

if (MODE_KONTROL) {
    // Gerbang lama (deviasi F6): form tetap tampil walau server bilang `boleh: false`.
    const keluaran = periksaRender(
        'Q1-kontrol',
        'kontrol negatif: harness mampu melihat form saat gerbang lama dipakai',
        { pesanan: pesanan(), ulasan: { boleh: false, sudah: [] } },
        { form: 2, kirim: 2 },
    );

    const lulus = Boolean(keluaran) && hasil[hasil.length - 1].lulus;

    console.log(JSON.stringify({ mode: 'kontrol-lama', lulus, hasil }, null, 2));
    process.exitCode = lulus ? 0 : 1;
} else {
    // ------------------------------------------------------------------ runtime

    // Q1 — kasus wajib kartu: settlement + status `dibayar`, server bilang false, sisa 2 produk.
    periksaRender(
        'Q1',
        'boleh=false (settlement, status dibayar): tidak ada form penilaian',
        { pesanan: pesanan(), ulasan: { boleh: false, sudah: [] } },
        { form: 0, kirim: 0, headingForm: 0, alasan: 0, sudah: 0, headingDiam: 1 },
    );

    // Q2 — kontrol positif: `boleh=true` harus benar-benar memunculkan satu kartu per produk.
    const kartu = periksaRender(
        'Q2',
        'boleh=true: satu form per produk yang belum dinilai',
        { pesanan: pesanan(), ulasan: { boleh: true, sudah: [] } },
        { form: 2, kirim: 2, headingForm: 1, alasan: 0, 'komentar-3': 1, 'komentar-7': 1 },
    );

    if (kartu) {
        const tautan = [];
        try {
            const sumber = readFileSync(JEJAK_JSX, 'utf8');
            tautan.push(sumber.includes(GATE_RESMI) ? 'gate resmi ada' : 'gate resmi TIDAK ada');
        } catch (galat) {
            tautan.push(`baca sumber gagal: ${galat.message}`);
        }
        catat('Q2b', 'sumber CheckoutSuccess memuat gate resmi', tautan[0] === 'gate resmi ada', tautan.join('; '));
    }

    // Q3 — sebagian sudah dinilai, boleh=false: form hilang, kartu lama tetap tampil, alasan tidak muncul.
    periksaRender(
        'Q3',
        'boleh=false dengan sebagian sudah dinilai: form hilang, tanpa notice alasan',
        { pesanan: pesanan(), ulasan: { boleh: false, sudah: [3] } },
        { form: 0, kirim: 0, alasan: 0, sudah: 1 },
    );

    // Q4 — syarat §9.1 belum terpenuhi (belum settlement): notice alasan, bukan form.
    periksaRender(
        'Q4',
        'belum settlement: notice alasan tanpa form',
        {
            pesanan: pesanan({ payment_status: 'pending', status: 'pending' }),
            ulasan: { boleh: false, sudah: [] },
        },
        { form: 0, kirim: 0, alasan: 1, headingForm: 0 },
    );

    // Q5 — semua produk sudah dinilai: ringkasan terima kasih, tanpa form.
    periksaRender(
        'Q5',
        'semua sudah dinilai: tanpa form, ringkasan tampil',
        { pesanan: pesanan(), ulasan: { boleh: false, sudah: [3, 7] } },
        { form: 0, kirim: 0, alasan: 0, sudah: 2, terimaKasih: 1 },
    );

    // Q6 — props `ulasan` hilang/berbentuk lain: gagal tertutup (fail closed).
    periksaRender(
        'Q6',
        'props ulasan hilang pada order yang boleh dinilai: tanpa form',
        { pesanan: pesanan() },
        { form: 0, kirim: 0, alasan: 0 },
    );

    periksaRender(
        'Q6b',
        'props ulasan hilang pada order yang belum settlement: tetap notice alasan',
        { pesanan: pesanan({ payment_status: 'pending', status: 'pending' }), ulasan: null },
        { form: 0, alasan: 1, kirim: 0 },
    );

    // Q7 — `boleh` bertipe string (bukan boolean) tidak boleh dianggap true.
    periksaRender(
        'Q7',
        "boleh='true' (string) tidak dianggap true — perbandingan ketat",
        { pesanan: pesanan(), ulasan: { boleh: 'true', sudah: [] } },
        { form: 0, kirim: 0, alasan: 0 },
    );

    // ------------------------------------------------------------- statis

    let sumber = '';
    try {
        sumber = readFileSync(JEJAK_JSX, 'utf8');
    } catch (galat) {
        catat('Q8', 'sumber CheckoutSuccess dapat dibaca', false, galat.message);
    }

    if (sumber) {
        const masalah = [];
        if (!sumber.includes(GATE_RESMI)) masalah.push('gate resmi tidak ditemukan');
        if (sumber.includes('kontradiksiBoleh')) masalah.push('masih memuat kontradiksiBoleh');
        if (/tampilkanForm\s*=\s*[^;]*syaratDinilai/.test(sumber)) {
            masalah.push('tampilkanForm masih menghitung syaratDinilai sendiri');
        }
        catat('Q8', 'gerbang memakai `boleh` apa adanya, cabang kontradiksi tidak kembali', masalah.length === 0, masalah.join('; '));
    }

    // Q9 — daftar status di JSX harus sama dengan REVIEWABLE_STATUSES di PHP.
    try {
        const phpOrder = readFileSync(join(AKAR, 'app', 'Models', 'Order.php'), 'utf8');
        const phpService = readFileSync(join(AKAR, 'app', 'Services', 'ReviewService.php'), 'utf8');

        const konstanta = Object.fromEntries(
            [...phpOrder.matchAll(/const (STATUS_[A-Z_]+) = '([^']+)'/g)].map((m) => [m[1], m[2]]),
        );
        const blok = phpService.match(/REVIEWABLE_STATUSES\s*=\s*\[([\s\S]*?)\];/);
        harus(blok, 'REVIEWABLE_STATUSES tidak ditemukan di ReviewService.php');

        const statusPhp = [...blok[1].matchAll(/Order::(STATUS_[A-Z_]+)/g)]
            .map((m) => konstanta[m[1]])
            .filter(Boolean)
            .sort();

        const statusJs = JSON.parse(
            sumber.match(/STATUS_BOLEH_DINILAI = (\[[^\]]+\])/)[1].replace(/'/g, '"'),
        ).sort();

        catat(
            'Q9',
            'daftar status yang boleh dinilai sama antara ReviewService (PHP) dan CheckoutSuccess (JSX)',
            JSON.stringify(statusPhp) === JSON.stringify(statusJs),
            `PHP=[${statusPhp}] JSX=[${statusJs}]`,
        );
    } catch (galat) {
        catat('Q9', 'daftar status PHP vs JSX dapat dibandingkan', false, galat.message);
    }

    // Q10 — `ulasan.boleh` hanya dibaca halaman selesai checkout.
    try {
        const berkas = [];
        const telusuri = (dir) => {
            readdirSync(dir, { withFileTypes: true }).forEach((entri) => {
                const penuh = join(dir, entri.name);
                if (entri.isDirectory()) telusuri(penuh);
                else if (/\.(jsx?|tsx?)$/.test(entri.name)) berkas.push(penuh);
            });
        };
        telusuri(join(AKAR, 'resources', 'js'));

        const pembaca = berkas
            .filter((f) => /ulasan\??\.boleh/.test(readFileSync(f, 'utf8')))
            .map((f) => f.replace(AKAR + '\\', '').replace(AKAR + '/', '').replace(/\\/g, '/'));

        const menyebutBoleh = berkas
            .filter((f) => /\bboleh\b/.test(readFileSync(f, 'utf8')))
            .map((f) => f.replace(/\\/g, '/').split('/resources/js/')[1]);

        catat(
            'Q10',
            'hanya CheckoutSuccess.jsx yang membaca `ulasan.boleh`',
            pembaca.length === 1 && pembaca[0].endsWith('Pages/Public/CheckoutSuccess.jsx'),
            `pembaca=[${pembaca}] penyebut kata boleh=[${menyebutBoleh}]`,
        );
    } catch (galat) {
        catat('Q10', 'pemetaan pemakai `ulasan.boleh`', false, galat.message);
    }

    const gagal = hasil.filter((h) => !h.lulus);
    console.log(JSON.stringify({ mode: 'normal', total: hasil.length, gagal: gagal.length, hasil }, null, 2));
    process.exitCode = gagal.length === 0 ? 0 : 1;
}

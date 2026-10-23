/**
 * Harness interaksi kartu t_d1028202 (F5b — isian nomor resi di /admin/pesanan/{order}).
 * File uji lokal (bukan bagian aplikasi). Tanpa browser dan tanpa pustaka uji baru:
 * hook React diganti shim store, '@inertiajs/react' diganti stub pencatat, fungsi komponen
 * dipanggil langsung lalu handler-nya dipanggil. Perintah yang benar-benar dijalankan:
 *   ./node_modules/@esbuild/win32-x64/esbuild.exe tmp/uji-aksi-resi-t_d1028202.mjs --bundle \
 *     --platform=node --format=esm --jsx=automatic --packages=external \
 *     --outfile=tmp/uji-aksi-resi-t_d1028202.bundle.mjs \
 *     --alias:react/jsx-runtime=./tmp/shim-jsx-runtime-t_321bf03c.mjs \
 *     --alias:react=./tmp/shim-react-t_321bf03c.mjs \
 *     --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs
 *   node tmp/uji-aksi-resi-t_d1028202.bundle.mjs
 * Batasan: bukan browser — yang diuji kontrak pemanggilan (URL, payload, opsi Inertia, state UI),
 * bukan tata letak, fokus keyboard, atau klik nyata.
 */
import React from 'react';
import { store, mulaiPass, bersihkanStore } from './shim-react-t_321bf03c.mjs';
import { router, kendali, bersihkan } from './stub-inertia-t_321bf03c.mjs';
import InfoResi from '../resources/js/Pages/Admin/Orders/partials/InfoResi.jsx';

const hasil = [];
const uji = (nama, fn) => {
    try {
        bersihkanStore();
        bersihkan();
        kendali.halaman.props = {};
        fn();
        hasil.push({ status: 'OK', nama, catatan: '' });
    } catch (galat) {
        hasil.push({ status: 'GAGAL', nama, catatan: galat.message });
    }
};

const harus = (kondisi, pesan) => {
    if (!kondisi) throw new Error(pesan);
};

// ---------------------------------------------------------------- render pass
const renderPohon = (Komponen, props, maks = 10) => {
    let pohon = null;

    for (let i = 0; i < maks; i += 1) {
        mulaiPass();
        pohon = Komponen(props);

        if (!store.kotor) break;
    }

    return pohon;
};

const kumpulan = (pohon, hasilKumpul = []) => {
    if (pohon === null || pohon === undefined || typeof pohon === 'boolean') return hasilKumpul;

    if (Array.isArray(pohon)) {
        pohon.forEach((isi) => kumpulan(isi, hasilKumpul));

        return hasilKumpul;
    }

    if (typeof pohon === 'string' || typeof pohon === 'number') return hasilKumpul;

    hasilKumpul.push(pohon);
    kumpulan(pohon.props?.children, hasilKumpul);

    return hasilKumpul;
};

const semuaElemen = (pohon) => kumpulan(pohon);
const cari = (pohon, predikat) => semuaElemen(pohon).find(predikat) ?? null;
const bernama = (nama) => (el) => typeof el.type === 'function' && el.type.name === nama;
const host = (tag) => (el) => el.type === tag;

const form = (pohon) => cari(pohon, host('form'));
const isian = (pohon) => cari(pohon, bernama('Input'));
const tombol = (pohon) => cari(pohon, bernama('Button'));

const catatKunjungan = (nama, kunjungan) =>
    console.log(`        ${nama}: ${kunjungan.metode.toUpperCase()} ${kunjungan.url} ${JSON.stringify(kunjungan.data)}`);

// ---------------------------------------------------------------- fixture
const pesanan = (ubah = {}) => ({
    id: 5,
    code: 'TK-20261020-0001',
    status: 'dikirim',
    tracking_number: 'JX1234567890',
    customer: { name: 'Siti Aminah' },
    items: [],
    ...ubah,
});

// ---------------------------------------------------------------- uji
uji('B1 kirim resi baru -> PATCH /admin/pesanan/{id}/resi payload tracking_number', () => {
    const props = { pesanan: pesanan() };
    let pohon = renderPohon(InfoResi, props);

    harus(isian(pohon).props.value === 'JX1234567890', 'nilai awal isian harus dari props');

    isian(pohon).props.onChange({ target: { value: 'JX9988776655' } });
    pohon = renderPohon(InfoResi, props);
    harus(isian(pohon).props.value === 'JX9988776655', 'isian harus mengikuti ketikan');

    form(pohon).props.onSubmit({ preventDefault() {} });

    harus(kendali.kunjungan.length === 1, `panggilan router harus 1, dapat ${kendali.kunjungan.length}`);

    const kunjungan = kendali.kunjungan[0];
    catatKunjungan('B1', kunjungan);
    harus(kunjungan.metode === 'patch', `metode harus patch, dapat ${kunjungan.metode}`);
    harus(kunjungan.url === '/admin/pesanan/5/resi', `url salah: ${kunjungan.url}`);
    harus(
        kunjungan.data && kunjungan.data.tracking_number === 'JX9988776655',
        `payload tracking_number salah: ${JSON.stringify(kunjungan.data)}`
    );
    harus(Object.keys(kunjungan.data).length === 1, 'payload hanya boleh berisi tracking_number');
    harus(kunjungan.opsi?.preserveScroll === true, 'preserveScroll harus true');
    harus(typeof kunjungan.opsi?.onStart === 'function', 'onStart hilang');
    harus(typeof kunjungan.opsi?.onFinish === 'function', 'onFinish hilang');
    harus(tombol(pohon).props.loading === false, 'sebelum kirim tombol tidak boleh loading');
});

uji('B2 isian dikosongkan lalu dikirim -> tracking_number "" (hitung sebagai hapus, §12.18a)', () => {
    const props = { pesanan: pesanan() };
    let pohon = renderPohon(InfoResi, props);

    isian(pohon).props.onChange({ target: { value: '' } });
    pohon = renderPohon(InfoResi, props);
    form(pohon).props.onSubmit({ preventDefault() {} });

    harus(kendali.kunjungan.length === 1, `panggilan router harus 1, dapat ${kendali.kunjungan.length}`);
    const kunjungan = kendali.kunjungan[0];
    catatKunjungan('B2', kunjungan);
    harus(kunjungan.data.tracking_number === '', `payload harus string kosong, dapat ${JSON.stringify(kunjungan.data)}`);
    harus(kunjungan.url === '/admin/pesanan/5/resi', `url salah: ${kunjungan.url}`);
});

uji('B3 kiriman ganda ditahan selama proses, tombol loading, lalu bisa kirim lagi', () => {
    const props = { pesanan: pesanan() };
    let pohon = renderPohon(InfoResi, props);

    form(pohon).props.onSubmit({ preventDefault() {} });
    harus(kendali.kunjungan.length === 1, `kiriman pertama harus tercatat, dapat ${kendali.kunjungan.length}`);

    kendali.kunjungan[0].opsi.onStart();
    pohon = renderPohon(InfoResi, props);
    harus(tombol(pohon).props.loading === true, 'tombol harus loading selama proses');
    harus(tombol(pohon).props.type === 'submit', 'tombol harus type submit');

    form(pohon).props.onSubmit({ preventDefault() {} });
    harus(kendali.kunjungan.length === 1, `kiriman kedua harus ditahan, dapat ${kendali.kunjungan.length}`);

    kendali.kunjungan[0].opsi.onFinish();
    pohon = renderPohon(InfoResi, props);
    harus(tombol(pohon).props.loading === false, 'status loading harus bersih setelah selesai');

    form(pohon).props.onSubmit({ preventDefault() {} });
    harus(kendali.kunjungan.length === 2, `setelah selesai kiriman berikutnya jalan, dapat ${kendali.kunjungan.length}`);
    harus(
        kendali.kunjungan.every((k) => k.metode === 'patch' && k.url === '/admin/pesanan/5/resi'),
        'semua kiriman harus ke rute resi yang sama'
    );
});

uji('B4 url memakai id pesanan dari props, tanpa rute karangan lain', () => {
    let pohon = renderPohon(InfoResi, { pesanan: pesanan({ id: 42, tracking_number: null }) });
    form(pohon).props.onSubmit({ preventDefault() {} });

    const kunjungan = kendali.kunjungan[0];
    catatKunjungan('B4', kunjungan);
    harus(kunjungan.url === '/admin/pesanan/42/resi', `url salah: ${kunjungan.url}`);
    harus(
        kendali.kunjungan.every((k) => /^\/admin\/pesanan\/42\/resi$/.test(k.url)),
        'ada panggilan ke url lain di luar kontrak'
    );
    harus(kunjungan.data.tracking_number === '', 'nilai null harus dikirim sebagai string kosong');
});

uji('B5 galat server dibaca dari props halaman dan tidak mengunci form', () => {
    const pesan = 'Nomor resi maksimal 60 karakter.';
    const props = { pesanan: pesanan() };
    let pohon = renderPohon(InfoResi, props);

    harus(isian(pohon).props.error === null, 'galat tidak boleh muncul sebelum ada kiriman');

    kendali.halaman.props = { errors: { tracking_number: pesan } };
    form(pohon).props.onSubmit({ preventDefault() {} });
    kendali.kunjungan[0].opsi.onFinish();
    pohon = renderPohon(InfoResi, props);

    harus(isian(pohon).props.error === pesan, `galat server harus menempel di isian, dapat ${String(isian(pohon).props.error)}`);
    harus(isian(pohon).props.value === 'JX1234567890', 'nilai isian tetap dari nilai tersimpan server');
    harus(tombol(pohon).props.loading === false, 'galat tidak boleh meninggalkan status loading');

    form(pohon).props.onSubmit({ preventDefault() {} });
    harus(kendali.kunjungan.length === 2, 'setelah galat form harus tetap bisa dikirim ulang');
});

uji('B6 props server berubah -> isian mengikuti nilai tersimpan terbaru', () => {
    let pohon = renderPohon(InfoResi, { pesanan: pesanan({ tracking_number: 'JX-A' }) });
    harus(isian(pohon).props.value === 'JX-A', 'nilai awal salah');

    isian(pohon).props.onChange({ target: { value: 'JX-B-ketik' } });
    pohon = renderPohon(InfoResi, { pesanan: pesanan({ tracking_number: 'JX-A' }) });
    harus(isian(pohon).props.value === 'JX-B-ketik', 'ketikan tidak boleh hilang tanpa jawaban server');

    pohon = renderPohon(InfoResi, { pesanan: pesanan({ tracking_number: 'JX-C-tersimpan' }) });
    harus(isian(pohon).props.value === 'JX-C-tersimpan', 'isian harus mengikuti nilai tersimpan terbaru');

    pohon = renderPohon(InfoResi, { pesanan: pesanan({ id: 6, tracking_number: null }) });
    harus(isian(pohon).props.value === '', 'pindah pesanan harus mengosongkan isian');
});

uji('B7 kontrol isian sesuai kontrak: name, maxLength, dan tanpa nilai tersembunyi', () => {
    const pohon = renderPohon(InfoResi, { pesanan: pesanan() });
    const kontrol = isian(pohon).props;

    harus(kontrol.name === 'tracking_number', `name salah: ${kontrol.name}`);
    harus(kontrol.maxLength === 60, `maxLength salah: ${kontrol.maxLength}`);
    harus(kontrol.type === 'text', `type salah: ${kontrol.type}`);
    harus(kontrol.id === 'resi-pesanan', `id salah: ${kontrol.id}`);
    harus(kontrol.value === 'JX1234567890', 'isian harus terkendali dari state');
    harus(typeof kontrol.onChange === 'function', 'onChange hilang');
    harus(!('defaultValue' in kontrol), 'isian tidak boleh tak-terkendali (defaultValue)');
});

// ---------------------------------------------------------------- laporan
const lebar = Math.max(...hasil.map((h) => h.nama.length));
hasil.forEach((h) => console.log(`${h.status.padEnd(5)} | ${h.nama.padEnd(lebar)} | ${h.catatan}`));

const gagal = hasil.filter((h) => h.status === 'GAGAL').length;
console.log(`\nRINGKASAN: ${hasil.length - gagal}/${hasil.length} uji lulus`);
process.exitCode = gagal === 0 ? 0 : 1;

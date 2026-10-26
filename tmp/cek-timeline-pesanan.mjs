import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import TimelinePesanan from '../resources/js/Components/TimelinePesanan.jsx';

/**
 * Cek render `TimelinePesanan` (F2 v1.5) tanpa browser:
 * timeline null/parsial, node terminal batal/expire, ikon 20 px, label & waktu.
 * Jalankan: node_modules/.bin/esbuild tmp/cek-timeline-pesanan.mjs --bundle --platform=node
 *           --format=cjs --outfile=<scratch>/cek-timeline.cjs && node <scratch>/cek-timeline.cjs
 */

let gagal = 0;
const cek = (nama, ok) => {
    console.log(ok ? `OK   ${nama}` : `GAGAL ${nama}`);
    if (!ok) gagal++;
};

const render = (props) => renderToStaticMarkup(React.createElement(TimelinePesanan, props));
const node = (html) => (html.match(/<li /g) ?? []).length;

const kosong = render({ timeline: null });
cek('timeline null → 4 node', node(kosong) === 4);
cek('label empat node', ['Dibuat', 'Dibayar', 'Dikirim', 'Selesai'].every((l) => kosong.includes(l)));
cek('semua redup saat null', !kosong.includes('text-brand') && (kosong.match(/text-slate-300/g) ?? []).length === 4);
cek('waktu kosong jadi —', (kosong.match(/>—</g) ?? []).length === 4);
cek('empat ikon svg', (kosong.match(/<svg/g) ?? []).length === 4);

const parsial = render({ timeline: { created_at: '2026-10-26T10:00:00+07:00' } });
cek('parsial → 4 node, tanpa crash', node(parsial) === 4);
cek('satu node aktif', (parsial.match(/text-brand/g) ?? []).length === 1);
cek('tiga node redup', (parsial.match(/text-slate-300/g) ?? []).length === 3);
cek('waktu valid terformat', /26 Okt 2026/.test(parsial));
cek('urutan tetap Dibuat→Selesai', parsial.indexOf('Dibuat') < parsial.indexOf('Selesai'));
cek('horizontal ≥768', parsial.includes('md:flex-row'));

const batal = render({
    status: 'batal',
    paymentStatus: 'settle',
    timeline: { created_at: '2026-10-26T10:00:00+07:00' },
});
cek('batal → node merah Batal', batal.includes('Batal') && batal.includes('rounded-full bg-danger'));
cek('batal menggantikan node belum tercapai', !batal.includes('Dibayar') && node(batal) === 2);

const expire = render({ paymentStatus: 'expire', timeline: { created_at: '2026-10-26T10:00:00+07:00' } });
cek('expire → node Kedaluwarsa', expire.includes('Kedaluwarsa') && expire.includes('rounded-full bg-danger'));

const penuh = render({
    timeline: {
        created_at: '2026-10-20T09:00:00+07:00',
        paid_at: '2026-10-20T09:05:00+07:00',
        shipped_at: '2026-10-21T08:00:00+07:00',
        completed_at: '2026-10-24T15:30:00+07:00',
    },
});
cek('selesai → empat node aktif', (penuh.match(/text-brand/g) ?? []).length === 4);
cek('empat waktu terisi', (penuh.match(/tabular-nums/g) ?? []).length === 4 && !penuh.includes('>—<'));

if (gagal > 0) {
    console.error(`\n${gagal} cek gagal`);
    process.exit(1);
}
console.log('\nSemua cek lulus');

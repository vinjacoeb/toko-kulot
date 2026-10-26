import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ShippingEvents from '../resources/js/Components/ShippingEvents.jsx';

/**
 * Cek render `ShippingEvents` (F13 v1.4) tanpa browser:
 * kosong → tidak dirender, maks 10, urutan server, label/waktu null aman.
 * Jalankan: node_modules/.bin/esbuild tmp/cek-shipping-events.mjs --bundle --platform=node
 *           --format=cjs --outfile=<scratch>/cek-shipping-events.cjs && node <scratch>/...
 */

let gagal = 0;
const cek = (nama, ok) => {
    console.log(ok ? `OK   ${nama}` : `GAGAL ${nama}`);
    if (!ok) gagal++;
};

const render = (props) => renderToStaticMarkup(React.createElement(ShippingEvents, props));

cek('events kosong tidak dirender', render({ events: [] }) === '');
cek('events null tidak dirender', render({ events: null }) === '');
cek('events bukan array tidak dirender', render({ events: { a: 1 } }) === '');

const dua = render({
    events: [
        { status: 'delivered', label: 'Terkirim', at: '2026-10-26T10:00:00+07:00' },
        { status: 'picked', label: null, at: null },
    ],
    className: 'mt-4',
});
cek('judul "Riwayat pengiriman"', dua.includes('>Riwayat pengiriman</h4>'));
cek('label server dipakai', dua.includes('Terkirim'));
cek('label null jatuh ke status', dua.includes('picked'));
cek('waktu null jadi —', dua.includes('—'));
cek('waktu valid terformat', /26 Okt 2026/.test(dua));
cek('entri pertama titik brand', dua.includes('rounded-full bg-brand'));
cek('entri kedua titik slate', dua.includes('rounded-full bg-slate-300'));
cek('className diteruskan', dua.startsWith('<div class="mt-4">'));
cek('memakai <ol>', dua.includes('<ol'));

const banyak = render({
    events: Array.from({ length: 12 }, (_, i) => ({
        status: `s${i}`,
        label: `L${i}`,
        at: '2026-10-26T10:00:00+07:00',
    })),
});
cek('maksimal 10 baris', (banyak.match(/<li /g) ?? []).length === 10);
cek('urutan server dipertahankan', banyak.indexOf('L0') < banyak.indexOf('L9'));
cek('entri ke-11+ tidak dirender', !banyak.includes('L10') && !banyak.includes('L11'));

if (gagal > 0) {
    console.error(`\n${gagal} cek gagal`);
    process.exit(1);
}
console.log('\nSemua cek lulus');

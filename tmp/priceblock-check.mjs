// Harness verifikasi PriceBlock (kartu t_7cbe34dc): render statis dengan data sintetis.
// Jalankan: node tmp/priceblock-check.mjs   (tanpa server, tanpa DB, tanpa menyentuh data nyata)
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import PriceBlock from '../resources/js/Components/PriceBlock.jsx';

const cases = [
    { label: 'compare_price kosong (null)', props: { price: 169000, comparePrice: null, size: 'sm' } },
    { label: 'compare_price > harga', props: { price: 169000, comparePrice: 220000, size: 'sm' } },
    { label: 'compare_price < harga (tidak boleh ada badge)', props: { price: 169000, comparePrice: 150000, size: 'sm' } },
    { label: 'harga string dari server', props: { price: '169000', comparePrice: '220000', size: 'sm' } },
    { label: 'harga kosong', props: { price: null, comparePrice: null, size: 'sm' } },
];

let fail = 0;
for (const c of cases) {
    const html = renderToStaticMarkup(React.createElement(PriceBlock, c.props));
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const hasStrike = html.includes('line-through');
    const hasBadge = /-\d+%/.test(text);
    const hasNaN = /NaN|undefined/.test(text);
    if (hasNaN) fail += 1;
    console.log(`${c.label}: teks="${text}" | coret=${hasStrike} | badge=${hasBadge} | nan=${hasNaN}`);
}
console.log(fail === 0 ? 'HASIL: tidak ada NaN/undefined pada semua kasus' : `HASIL: ${fail} kasus mengandung NaN/undefined`);
process.exit(fail === 0 ? 0 : 1);

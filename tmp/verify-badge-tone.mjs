// Harness verifikasi kartu t_67576fb2 — aturan tone badge §4.21 v2.1 (`-strong`) + badge diskon solid.
// Menguji komponen yang benar-benar dirender (react-dom/server), bukan sekadar mencari string di sumber.
// Bentuk terlarang dinilai PER ATRIBUT class (konteks pil/badge), bukan per seluruh markup: `text-slate-500`
// tetap sah untuk teks meta di atas putih (mis. harga coret PriceBlock, design §11.4 T2), tetapi terlarang
// sebagai teks pil di atas tint `bg-slate-200/60` (T6).
// Jalankan: node tmp/build-badge-tone-check.mjs && node tmp/verify-badge-tone.bundle.mjs
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import StatusBadge from '../resources/js/Components/StatusBadge.jsx';
import Badge from '../resources/js/Components/Badge.jsx';
import PriceBlock from '../resources/js/Components/PriceBlock.jsx';

const BASE_PILL = 'inline-flex items-center rounded-full px-2.5 py-1 text-badge uppercase';

let checks = 0;
let failures = 0;

const ok = (label) => {
    checks += 1;
    console.log(`  ok   ${label}`);
};

const fail = (label, detail) => {
    checks += 1;
    failures += 1;
    console.log(`  FAIL ${label}${detail ? ` -> ${detail}` : ''}`);
};

const assert = (condition, label, detail = null) => (condition ? ok(label) : fail(label, detail));

const firstClass = (html) => {
    const match = /class="([^"]*)"/.exec(html);
    return match ? match[1] : '';
};

const textOf = (html) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

/** Semua atribut class pada markup, satu entri per elemen. */
const classAttrs = (html) => [...html.matchAll(/class="([^"]*)"/g)].map((m) => m[1]);

/** Bentuk kelas lama yang WAJIB hilang pada satu atribut class pil/badge (§4.21 v2.1). */
export const pillForbidden = (classAttr) => {
    const bad = [];
    if (/\btext-(warning|success|danger)(?![-\w])/.test(classAttr)) bad.push('token state dasar (wajib -strong)');
    if (/\bbg-slate-200/.test(classAttr) && /\btext-slate-500\b/.test(classAttr)) bad.push('teks slate-500 di atas tint 200/60 (wajib slate-600)');
    if (/\bbg-sale-500\/10\b/.test(classAttr) || /\btext-sale-500\b/.test(classAttr)) bad.push('tint sale (wajib solid bg-sale-500 text-white)');
    if (/\bbg-accent(\/|\b)/.test(classAttr) && /\btext-accent\b/.test(classAttr)) bad.push('tint accent (wajib bg-accent-500 text-ink)');
    if (/\bbg-accent-500\b/.test(classAttr) && /\btext-white\b/.test(classAttr)) bad.push('text-white di atas accent (wajib text-ink)');
    return bad;
};

/** Bentuk terlarang di seluruh markup — dinilai per elemen, bukan per baris teks. */
export const forbiddenInMarkup = (html) => classAttrs(html).flatMap((c) => pillForbidden(c));

const checkPill = (status, expectedClass, expectedText, extraProps = {}) => {
    const html = renderToStaticMarkup(React.createElement(StatusBadge, { status, ...extraProps }));
    const token = status === null ? 'null' : `"${status}"`;
    assert(firstClass(html) === expectedClass, `StatusBadge status=${token} kelas baku`, firstClass(html));
    assert(textOf(html) === expectedText, `StatusBadge status=${token} label "${expectedText}"`, textOf(html));
    const bad = pillForbidden(firstClass(html));
    assert(bad.length === 0, `StatusBadge status=${token} tanpa bentuk kelas lama/terlarang`, bad.join(', '));
    assert(!/text-white/.test(firstClass(html)), `StatusBadge status=${token} tidak memakai text-white di tint`, firstClass(html));
};

console.log('== StatusBadge — peta tone §4.21 v2.1 ==');
checkPill('pending', `${BASE_PILL} bg-warning/10 text-warning-strong`, 'Menunggu');
checkPill('PENDING', `${BASE_PILL} bg-warning/10 text-warning-strong`, 'Menunggu');
checkPill('dibayar', `${BASE_PILL} bg-brand/10 text-brand`, 'Dibayar');
checkPill('diproses', `${BASE_PILL} bg-brand/10 text-brand`, 'Diproses');
checkPill('dikirim', `${BASE_PILL} bg-brand/10 text-brand`, 'Dikirim');
checkPill('selesai', `${BASE_PILL} bg-success/10 text-success-strong`, 'Selesai');
checkPill('batal', `${BASE_PILL} bg-danger/10 text-danger-strong`, 'Batal');
checkPill('Sudah dibaca', `${BASE_PILL} bg-slate-200/60 text-slate-600`, 'Sudah dibaca');
checkPill('arsip', `${BASE_PILL} bg-slate-200/60 text-slate-600`, 'arsip');
checkPill(null, `${BASE_PILL} bg-slate-200/60 text-slate-600`, '-');
checkPill('batal', `${BASE_PILL} bg-danger/10 text-danger-strong`, 'Dibatalkan', { label: 'Dibatalkan' });

console.log('== StatusBadge — override tone per halaman (halaman pesan/ulasan admin) ==');
{
    const html = renderToStaticMarkup(
        React.createElement(StatusBadge, {
            status: 'belum dibaca',
            label: 'Belum dibaca',
            className: 'bg-warning/10 text-warning-strong',
        })
    );
    const cls = firstClass(html);
    assert(cls.endsWith('bg-warning/10 text-warning-strong'), 'override warning halaman pesan terpasang', cls);
    assert(pillForbidden(cls).length === 0, 'override warning halaman pesan tanpa token dasar', pillForbidden(cls).join(', '));
}
{
    const html = renderToStaticMarkup(
        React.createElement(StatusBadge, { status: 'sudah dibaca', label: 'Sudah dibaca', className: 'bg-success/10 text-success-strong' })
    );
    const cls = firstClass(html);
    assert(cls.endsWith('bg-success/10 text-success-strong'), 'override success halaman pesan terpasang', cls);
}
{
    const html = renderToStaticMarkup(React.createElement(StatusBadge, { status: 'tampil', label: 'Tampil' }));
    const cls = firstClass(html);
    assert(cls.endsWith('bg-slate-200/60 text-slate-600'), 'Reviews tanpa override (sembunyi) tetap neutral', cls);
}

console.log('== Badge — tone §4.21 v2.1 (promo/sale) ==');
const checkBadge = (tone, expectedClass, text, props = {}) => {
    const html = renderToStaticMarkup(React.createElement(Badge, tone === undefined ? props : { tone, ...props }, text));
    const cls = firstClass(html);
    const label = `Badge tone=${tone === undefined ? '(default)' : tone}`;
    assert(cls === expectedClass, `${label} kelas baku`, cls);
    assert(textOf(html) === text, `${label} isi "${text}"`, textOf(html));
    assert(pillForbidden(cls).length === 0, `${label} tanpa bentuk kelas lama/terlarang`, pillForbidden(cls).join(', '));
};

checkBadge(undefined, `${BASE_PILL} bg-brand/10 text-brand`, 'Baru');
checkBadge('brand', `${BASE_PILL} bg-brand/10 text-brand`, 'Baru');
checkBadge('accent', `${BASE_PILL} bg-accent-500 text-ink`, 'Promo');
checkBadge('sale', `${BASE_PILL} bg-sale-500 text-white`, 'Sale');
checkBadge('success', `${BASE_PILL} bg-success/10 text-success-strong`, 'Tersedia');
checkBadge('warning', `${BASE_PILL} bg-warning/10 text-warning-strong`, 'Terbatas');
checkBadge('danger', `${BASE_PILL} bg-danger/10 text-danger-strong`, 'Habis');
checkBadge('neon', `${BASE_PILL} bg-brand/10 text-brand`, 'Tone tak dikenal');
{
    const html = renderToStaticMarkup(React.createElement(Badge, { tone: 'accent' }, 'Promo'));
    assert(!/text-white/.test(firstClass(html)), 'Badge accent memakai text-ink, bukan text-white', firstClass(html));
}
{
    const html = renderToStaticMarkup(React.createElement(Badge, { tone: 'accent', className: 'ml-2' }, 'Promo'));
    assert(firstClass(html).endsWith(' bg-accent-500 text-ink ml-2'), 'Badge meneruskan className', firstClass(html));
}

console.log('== PriceBlock — badge diskon solid (T5) ==');
const priceHtml = (props) => renderToStaticMarkup(React.createElement(PriceBlock, props));
const badgeSpan = (html) => {
    const match = /<span class="([^"]*bg-sale-500[^"]*)">([^<]*)<\/span>/.exec(html);
    return match ? { className: match[1], text: match[2] } : null;
};
{
    const html = priceHtml({ price: 169000, comparePrice: 219000 });
    const badge = badgeSpan(html);
    assert(badge !== null, 'badge diskon dirender saat comparePrice > price', html);
    assert(badge?.className === 'rounded-sm bg-sale-500 px-1.5 py-0.5 text-badge font-semibold text-white', 'badge diskon solid bg-sale-500 text-white', badge?.className);
    assert(badge?.text === '-23%', 'persentase diskon benar', badge?.text);
    assert(forbiddenInMarkup(html).length === 0, 'PriceBlock tanpa tint sale/accent terlarang', forbiddenInMarkup(html).join(', '));
    assert(html.includes('Rp169.000'), 'harga jual tampil', html);
    assert(html.includes('class="text-meta text-slate-500 line-through"'), 'harga coret tetap text-meta text-slate-500 line-through (§11.4 T2, kartu t_90759be9)', html);
}
{
    const html = priceHtml({ price: 169000, comparePrice: 219000, size: 'sm' });
    assert(badgeSpan(html)?.className === 'rounded-sm bg-sale-500 px-1.5 py-0.5 text-badge font-semibold text-white', 'badge diskon solid juga pada size="sm"', badgeSpan(html)?.className);
}
{
    const html = priceHtml({ price: '169000', comparePrice: '219000' });
    assert(badgeSpan(html)?.text === '-23%', 'harga string dari server tetap benar', badgeSpan(html)?.text);
}
{
    const html = priceHtml({ price: 169000, comparePrice: null });
    assert(badgeSpan(html) === null, 'tanpa comparePrice tidak ada badge diskon', html);
}
{
    const html = priceHtml({ price: 169000, comparePrice: 150000 });
    assert(badgeSpan(html) === null, 'comparePrice < price tidak ada badge diskon', html);
}

console.log('== Kontrol negatif — harness harus menandai markup LAMA sebagai gagal ==');
{
    const cases = [
        ['pil warning lama', `${BASE_PILL} bg-warning/10 text-warning`, /token state dasar/],
        ['pil neutral lama', `${BASE_PILL} bg-slate-200/60 text-slate-500`, /slate-500 di atas tint/],
        ['pil accent lama (text-white)', `${BASE_PILL} bg-accent-500 text-white`, /text-white di atas accent/],
        ['pil accent tint lama', `${BASE_PILL} bg-accent/10 text-accent`, /tint accent/],
        ['badge diskon tint lama', 'rounded-sm bg-sale-500/10 px-1.5 py-0.5 text-badge font-semibold text-sale-500', /tint sale/],
    ];
    cases.forEach(([label, cls, re]) => {
        const found = pillForbidden(cls);
        assert(found.some((f) => re.test(f)), `kontrol negatif: ${label} tertangkap`, found.join(', ') || '(tidak tertangkap)');
    });
    const META = 'text-meta text-slate-500 line-through';
    assert(pillForbidden(META).length === 0, 'kontrol positif: teks meta slate-500 di atas putih TIDAK ditandai', pillForbidden(META).join(', '));
    const SOLID = 'rounded-sm bg-sale-500 px-1.5 py-0.5 text-badge font-semibold text-white';
    assert(pillForbidden(SOLID).length === 0, 'kontrol positif: badge diskon solid TIDAK ditandai', pillForbidden(SOLID).join(', '));
}

console.log('== Ringkasan ==');
console.log(`  ${checks - failures}/${checks} lulus, ${failures} gagal`);
process.exit(failures === 0 ? 0 : 1);

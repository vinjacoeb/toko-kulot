// Verifikasi render statis halaman auth memakai props `settings` ASLI dari server
// (bukan fixture): dihasilkan oleh tmp/dump-settings-json.py <html> tmp/settings-asli.json
// Jalankan: node tmp/build-real-check.mjs && node tmp/verify-auth-real.bundle.mjs
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'node:fs';
import { __reset, __setPageProps, __setFormErrors } from './inertia-stub.jsx';
import Login from '../resources/js/Pages/Public/Auth/Login.jsx';
import Register from '../resources/js/Pages/Public/Auth/Register.jsx';
import ForgotPassword from '../resources/js/Pages/Public/Auth/ForgotPassword.jsx';
import ResetPassword from '../resources/js/Pages/Public/Auth/ResetPassword.jsx';

const results = [];
const check = (label, ok, detail = '') => results.push({ label, ok: !!ok, detail });
const text = (html) =>
    html
        .replace(/<[^>]+>/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&#?\w+;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
// Perbandingan tahan perbedaan spasi/entitas HTML.
const rapat = (s) => String(s).replace(/&amp;/g, '&').replace(/\s+/g, '');

function render(Component, props = {}, pageProps = {}, formErrors = {}) {
    __reset();
    __setPageProps(pageProps);
    __setFormErrors(formErrors);
    return renderToStaticMarkup(React.createElement(Component, props));
}

const settings = JSON.parse(fs.readFileSync('tmp/settings-asli.json', 'utf8'));
const strip = settings?.landing_sections?.trust_strip ?? [];
const judul = strip.map((i) => i.title ?? i.label).filter(Boolean);
const subjudul = strip.map((i) => i.subtitle ?? i.description).filter(Boolean);

console.log(`settings asli: store_name=${settings.store_name} | trust_strip=${strip.length} item`);
console.log(`judul bullet: ${judul.join(' | ')}`);

// --- kasus A: keempat halaman memakai settings asli ------------------------
for (const [nama, Component] of [
    ['Login', Login],
    ['Register', Register],
    ['ForgotPassword', ForgotPassword],
    ['ResetPassword', ResetPassword],
]) {
    const html = render(Component, {}, { settings, flash: { success: null, error: null } });
    const t = text(html);
    check(`${nama}: nama toko asli tampil di panel brand`, t.includes(settings.store_name));
    check(`${nama}: tagline asli tampil`, !settings.store_tagline || t.includes(settings.store_tagline));
    check(`${nama}: tidak ada NaN/undefined`, !/NaN|undefined|null/.test(t), t.slice(0, 140));
}

// --- kasus B: bullet panel brand dari trust_strip asli (maks 3) ------------
{
    const html = render(Login, {}, { settings, flash: { success: null, error: null } });
    const t = text(html);
    const tiga = judul.slice(0, 3);
    check('panel brand: 3 bullet pertama dari trust_strip tampil', tiga.every((j) => t.includes(j)), tiga.join(' | '));
    check('panel brand: subjudul bullet tampil', subjudul.slice(0, 3).every((s) => t.includes(s)));
    check('panel brand: item ke-4 tidak tampil', judul.length < 4 || !t.includes(judul[3]), judul[3] ?? '-');
    check(
        'panel brand: ikon trust_strip dipakai (aria-hidden)',
        strip.slice(0, 3).every((i) => html.includes('aria-hidden="true"')),
    );
}

// --- kasus C: settings kosong -> nilai bawaan aman -------------------------
{
    const html = render(Login, {}, { settings: null, flash: { success: null, error: null } });
    const t = text(html);
    check('tanpa settings: nama bawaan Toko Kulot tampil', t.includes('Toko Kulot'));
    check('tanpa settings: tanpa NaN/undefined', !/NaN|undefined|null/.test(t), t.slice(0, 140));
    check('tanpa settings: tidak ada judul bullet asli', judul.every((j) => !t.includes(j)));
}

// --- kasus D: settings ada tapi trust_strip kosong -------------------------
{
    const tanpaStrip = { ...settings, landing_sections: { ...(settings.landing_sections ?? {}), trust_strip: [] } };
    const html = render(Login, {}, { settings: tanpaStrip, flash: { success: null, error: null } });
    const t = text(html);
    check('trust_strip kosong: panel tetap render nama toko', t.includes(settings.store_name));
    check('trust_strip kosong: tanpa bullet', judul.every((j) => !t.includes(j)));
}

let gagal = 0;
for (const r of results) {
    if (!r.ok) gagal += 1;
    console.log(`${r.ok ? 'LULUS' : 'GAGAL'}  ${r.label}${r.ok || !r.detail ? '' : '  -> ' + r.detail}`);
}
console.log(`\nringkasan: ${results.length} pemeriksaan, gagal ${gagal}`);
process.exit(gagal ? 1 : 0);

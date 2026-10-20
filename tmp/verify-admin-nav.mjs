// Harness verifikasi QA-007 (kartu t_6ee422f2): sidebar admin harus merender
// tautan aktif ke SETIAP modul yang rutenya sudah terdaftar, menyorot halaman
// aktif sesuai design §5.10, dan tidak lagi memakai item nonaktif.
// Jalankan: node tmp/build-admin-nav-check.mjs && node tmp/verify-admin-nav.bundle.mjs
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import AdminLayout, { ADMIN_NAV } from '../resources/js/Layouts/AdminLayout.jsx';
import { __setUrl } from './inertia-stub-admin-nav.jsx';

const ANCHOR = /<a\s([^>]*)>/g;
const ATTR = (tag, name) => {
    const match = new RegExp(`${name}="([^"]*)"`).exec(tag);
    return match ? match[1] : null;
};

let failures = 0;
let checks = 0;

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

// Tanda item nav (bukan tautan logo/header) pada markup hasil render.
const isNavItem = (anchor) => anchor.includes('h-11 items-center gap-3');

const renderNav = (url) => {
    __setUrl(url);
    const html = renderToStaticMarkup(React.createElement(AdminLayout, { title: 'Uji' }, React.createElement('p', null, 'konten')));
    const anchors = [...html.matchAll(ANCHOR)].map((m) => `href="${ATTR(m[1], 'href')}" ${m[1]}`);
    return { html, anchors };
};

// 1. Daftar nav: 9 modul PRD §5.2, semua punya href, tidak ada flag disabled.
console.log('1. ADMIN_NAV (sumber tunggal nav admin)');
const HARAPAN = [
    ['dashboard', '/admin'],
    ['produk', '/admin/produk'],
    ['kategori', '/admin/kategori'],
    ['stok', '/admin/stok'],
    ['pesanan', '/admin/pesanan'],
    ['pesan', '/admin/pesan-masuk'],
    ['penilaian', '/admin/penilaian'],
    ['pengaturan', '/admin/pengaturan'],
    ['akun', '/admin/akun'],
];
assert(ADMIN_NAV.length === HARAPAN.length, `jumlah item nav = ${HARAPAN.length}`, `dapat ${ADMIN_NAV.length}`);
for (const [key, href] of HARAPAN) {
    const item = ADMIN_NAV.find((i) => i.key === key);
    assert(!!item, `item ${key} ada`);
    if (!item) continue;
    assert(item.href === href, `item ${key} -> ${href}`, `dapat ${item.href}`);
    assert(!item.disabled, `item ${key} tidak disabled`, `disabled=${item.disabled}`);
    assert(typeof item.icon === 'function' || typeof item.icon === 'object', `item ${key} punya ikon`);
}

// 2. Setiap item harus jadi <a href> yang bisa diklik (bukan <span aria-disabled>).
console.log('2. Render per halaman (design §5.10)');
const KASUS = [
    ['/admin', 'dashboard'],
    ['/admin/', 'dashboard'],
    ['/admin/produk', 'produk'],
    ['/admin/produk/tambah', 'produk'],
    ['/admin/produk?page=2', 'produk'],
    ['/admin/kategori', 'kategori'],
    ['/admin/stok', 'stok'],
    ['/admin/stok/riwayat', 'stok'],
    ['/admin/pesanan', 'pesanan'],
    ['/admin/pesanan/12', 'pesanan'],
    ['/admin/pesan-masuk', 'pesan'],
    ['/admin/penilaian', 'penilaian'],
    ['/admin/pengaturan', 'pengaturan'],
    ['/admin/akun', 'akun'],
];

for (const [url, aktif] of KASUS) {
    const { html, anchors } = renderNav(url);
    const aktifHref = HARAPAN.find(([key]) => key === aktif)[1];
    const tautanNav = anchors.filter(isNavItem);

    assert(tautanNav.length === HARAPAN.length, `${url}: ${HARAPAN.length} tautan nav dirender`, `dapat ${tautanNav.length}`);
    assert(!html.includes('aria-disabled'), `${url}: tanpa item aria-disabled`);
    assert(!/<a[^>]*href="#"/.test(html), `${url}: tanpa href kosong`);
    assert(HARAPAN.every(([, href]) => tautanNav.some((a) => a.startsWith(`href="${href}" `))), `${url}: semua 9 tautan modul ada`);

    const current = tautanNav.filter((a) => a.includes('aria-current="page"'));
    assert(current.length === 1, `${url}: tepat satu item tersorot`, `dapat ${current.length}`);
    assert(current[0]?.startsWith(`href="${aktifHref}" `), `${url}: penyorotan di ${aktifHref}`, `dapat ${current[0] ?? '-'}`);
    assert(!!current[0]?.includes('border-accent-500'), `${url}: penyorot pakai border-accent-500`);
    assert(!!current[0]?.includes('bg-white/10'), `${url}: penyorot pakai bg-white/10`);
    assert(!!current[0]?.includes('text-white'), `${url}: penyorot teks putih`);

    const lain = tautanNav.filter((a) => !a.includes('aria-current="page"'));
    assert(lain.every((a) => a.includes('border-transparent')), `${url}: item lain border-transparent (tanpa geser tata letak)`);
}

// 3. Halaman boleh menimpa nav lewat prop `nav` (dipakai Pages/Admin/Messages & Settings).
console.log('3. Prop `nav` per halaman masih diterima');
{
    const nav = ADMIN_NAV.map((item) => ({ ...item, disabled: false }));
    __setUrl('/admin/pesan-masuk');
    const html = renderToStaticMarkup(
        React.createElement(AdminLayout, { nav, title: 'Uji' }, React.createElement('p', null, 'konten'))
    );
    const anchors = [...html.matchAll(ANCHOR)].map((m) => `href="${ATTR(m[1], 'href')}" ${m[1]}`);
    assert(anchors.filter(isNavItem).length === HARAPAN.length, 'nav kustom dari halaman tetap dirender', `dapat ${anchors.filter(isNavItem).length}`);
    assert(!html.includes('aria-disabled'), 'nav kustom tanpa aria-disabled');
}

console.log(`\n${failures === 0 ? 'LULUS' : 'GAGAL'}: ${checks - failures}/${checks} pemeriksaan lolos`);
process.exit(failures === 0 ? 0 : 1);

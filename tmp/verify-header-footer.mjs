// Verifikasi render header/footer dari pengaturan toko (kartu t_c915c033).
// Dijalankan setelah bundel dibuat: node tmp/verify-header-footer.mjs
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { __setProps } from '@inertiajs/react';
import PublicLayout from '../resources/js/Layouts/PublicLayout.jsx';

const year = new Date().getFullYear();
let failed = 0;

function check(label, html, mustHave, mustNotHave = []) {
    const missing = mustHave.filter((text) => !html.includes(text));
    const extra = mustNotHave.filter((text) => html.includes(text));
    const ok = missing.length === 0 && extra.length === 0;

    if (!ok) failed += 1;
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}`);
    if (missing.length) console.log('     tidak ada:', missing.join(' | '));
    if (extra.length) console.log('     tidak boleh ada:', extra.join(' | '));
}

function render(settingsProp, sharedSettings) {
    __setProps({
        settings: sharedSettings,
        auth: { user: null },
        cart: { count: 0 },
        flash: { success: null, error: null },
        errors: {},
    });

    return renderToStaticMarkup(
        React.createElement(
            PublicLayout,
            { settings: settingsProp },
            React.createElement('main', null, 'Isi halaman')
        )
    );
}

// 1. Props bersama (HandleInertiaRequests) + prop halaman kosong seperti Home.jsx.
const shared = {
    store_name: 'Daster Kulot Uji',
    store_logo: '/images/seed/logo-uji.png',
    footer_copyright: '© {tahun} {toko}. Semua hak dilindungi.',
    header_nav: [{ label: 'Beranda', url: '/' }],
};
const html1 = render({}, shared);
check('nama toko dari props bersama tampil di header', html1, ['>Daster Kulot Uji</span>', 'title="Daster Kulot Uji"']);
check('logo tampil di samping nama (alt dekoratif)', html1, [
    'src="/images/seed/logo-uji.png"',
    'alt=""',
]);
check('copyright placeholder {tahun}/{toko} diganti', html1, [
    `© ${year} Daster Kulot Uji. Semua hak dilindungi.`,
]);
check('tidak ada placeholder mentah', html1, [], ['{tahun}', '{toko}']);

// 2. Copyright kosong -> fallback © tahun nama toko; prop halaman menimpa nama bersama.
const html2 = render({ store_name: 'Nama Dari Halaman', footer_copyright: '' }, shared);
check('prop halaman menimpa nama bersama', html2, ['>Nama Dari Halaman</span>']);
check('copyright kosong jatuh ke fallback', html2, [`© ${year} Nama Dari Halaman`]);
check('fallback tanpa kalimat karangan', html2, [], ['Semua hak dilindungi']);

// 3. Data kosong sama sekali: layout tidak error dan memakai nama bawaan.
const html3 = render(null, {});
check('settings kosong tetap merender nama bawaan', html3, ['Toko Kulot']);

// 4. Copyright berupa spasi -> dianggap kosong.
const html4 = render(null, { store_name: 'Toko Spasi', footer_copyright: '   ' });
check('copyright spasi jatuh ke fallback', html4, [`© ${year} Toko Spasi`]);

if (failed > 0) {
    console.log(`\n${failed} pemeriksaan GAGAL`);
    process.exit(1);
}

console.log('\nSemua pemeriksaan header/footer lulus.');

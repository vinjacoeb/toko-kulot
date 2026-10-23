/**
 * Harness pohon elemen kartu t_e3f68f7f — footer drawer mobile PublicLayout
 * (pintu "Daftar" + "Masuk" untuk tamu) dan markup drawer terbuka.
 * File uji lokal (bukan bagian aplikasi). Hook React diganti shim store
 * (tmp/shim-react-t_321bf03c.mjs) supaya fungsi PublicLayout bisa dipanggil langsung
 * di luar React Renderer, lalu subtree footer digambar dengan react-dom/server.
 * Batasan: bukan browser — tidak menguji tata letak nyata, fokus keyboard, atau klik.
 * Perintah yang dijalankan ada di tmp/jalankan-uji-t_e3f68f7f.sh
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { bersihkanStore } from './shim-react-t_321bf03c.mjs';
import { Link, kendali, bersihkan } from './stub-inertia-t_321bf03c.mjs';
import PublicLayout from '../resources/js/Layouts/PublicLayout.jsx';
import NavDrawer from '../resources/js/Components/NavDrawer.jsx';

// --- DOM minimal (bukan jsdom) --------------------------------------------
// Shim hook menjalankan useEffect segera; useBodyScrollLock/useFocusTrap dan NavDrawer
// menyentuh document, jadi simpul tiruan ini perlu ada sebelum render di Node.
const bikinSimpul = () => ({
    style: {},
    classList: { add() {}, remove() {}, toggle() {} },
    addEventListener() {},
    removeEventListener() {},
    querySelector: () => null,
    querySelectorAll: () => [],
    appendChild() {},
    focus() {},
    contains: () => false,
    setAttribute() {},
    removeAttribute() {},
    getAttribute: () => null,
    offsetParent: null,
});

globalThis.document = {
    body: bikinSimpul(),
    documentElement: bikinSimpul(),
    activeElement: null,
    visibilityState: 'visible',
    addEventListener() {},
    removeEventListener() {},
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => bikinSimpul(),
};
globalThis.window = {
    scrollY: 0,
    innerWidth: 1280,
    addEventListener() {},
    removeEventListener() {},
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    setTimeout: () => 0,
    clearTimeout() {},
    requestAnimationFrame: (fn) => fn(),
};

const hasil = [];

const jalankan = (nama, fn) => {
    try {
        bersihkanStore();
        bersihkan();
        kendali.halaman.props = {
            auth: { user: null, admin: null },
            cart: { count: 0 },
            flash: { success: null, error: null },
            settings: {},
        };
        const catatan = fn();
        hasil.push({ status: 'OK', nama, catatan: catatan ?? '' });
    } catch (galat) {
        hasil.push({ status: 'GAGAL', nama, catatan: galat.message });
    }
};

const harus = (syarat, pesan) => {
    if (!syarat) throw new Error(pesan);
};

/** Semua elemen React di dalam satu pohon (rekursif, tanpa mengeksekusi komponen). */
const semuaElemen = (simpul, keluar = []) => {
    if (!simpul || typeof simpul !== 'object') return keluar;
    if (Array.isArray(simpul)) {
        simpul.forEach((s) => semuaElemen(s, keluar));
        return keluar;
    }
    if (simpul.$$typeof) {
        keluar.push(simpul);
        semuaElemen(simpul.props?.children, keluar);
    }
    return keluar;
};

const cari = (pohon, predikat) => semuaElemen(pohon).find(predikat);
const elemenDenganNama = (pohon, nama) => cari(pohon, (e) => typeof e.type === 'function' && e.type.name === nama);

const anakDatar = (elemen) => {
    const anak = elemen?.props?.children;
    if (anak === undefined || anak === null) return [];
    return (Array.isArray(anak) ? anak.flat(Infinity) : [anak]).filter((a) => a !== null && a !== undefined && a !== false);
};

const NAV = [
    { label: 'Beranda', href: '/' },
    { label: 'Produk', href: '/produk' },
    { label: 'Kontak', href: '/kontak-kami' },
];

/** Pintu tamu = Link Inertia ke /register atau /login. */
const pintuTamu = (pohon) =>
    semuaElemen(pohon).filter((e) => e.type === Link && (e.props.href === '/register' || e.props.href === '/login'));

let pohonTamu = null;
let footerTamu = null;

jalankan('P1 PublicLayout tamu: drawer dapat footer dua pintu (div flex flex-col gap-2, 2 tautan)', () => {
    pohonTamu = PublicLayout({ settings: { store_name: 'Toko Kulot' }, cartCount: 0, user: null, children: null });

    const drawer = cari(pohonTamu, (e) => e.type === NavDrawer);
    harus(drawer, 'NavDrawer tidak ada di pohon PublicLayout');
    harus(drawer.props.open === false, `drawer harus tertutup di awal, dapat ${String(drawer.props.open)}`);
    harus(drawer.props.title === 'Menu', `judul drawer berubah: ${String(drawer.props.title)}`);
    harus(Array.isArray(drawer.props.nav) && drawer.props.nav.length === 3, 'nav drawer tidak 3 item');
    harus(typeof drawer.props.onClose === 'function', 'drawer kehilangan onClose');

    footerTamu = drawer.props.footer;
    harus(footerTamu && footerTamu.type === 'div', 'footer tamu bukan <div>');
    harus(
        footerTamu.props.className === 'flex flex-col gap-2',
        `kelas footer tamu: ${footerTamu.props.className}`
    );

    const anak = anakDatar(footerTamu);
    harus(anak.length === 2, `jumlah tautan di footer tamu = ${anak.length}`);
    require_dua_tautan(anak);
    return `anak=${anak.length}`;
});

function require_dua_tautan(anak) {
    const [daftar, masuk] = anak;
    harus(daftar.type === Link, 'anak pertama bukan Link Inertia');
    harus(daftar.props.href === '/register', `href anak pertama: ${String(daftar.props.href)}`);
    harus(daftar.props.className === 'btn-primary w-full justify-center', `kelas Daftar: ${daftar.props.className}`);
    harus(daftar.props.children === 'Daftar', `teks anak pertama: ${String(daftar.props.children)}`);

    harus(masuk.type === Link, 'anak kedua bukan Link Inertia');
    harus(masuk.props.href === '/login', `href anak kedua: ${String(masuk.props.href)}`);
    harus(masuk.props.className === 'btn-secondary w-full justify-center', `kelas Masuk: ${masuk.props.className}`);
    harus(masuk.props.children === 'Masuk', `teks anak kedua: ${String(masuk.props.children)}`);

    for (const [nama, tautan] of [['Daftar', daftar], ['Masuk', masuk]]) {
        harus(tautan.props.onClick === undefined, `${nama}: tidak boleh punya onClick (navigasi Inertia biasa)`);
        harus(tautan.props.target === undefined, `${nama}: tidak boleh membuka tab baru`);
    }
}

jalankan('P2 PublicLayout tamu: pintu tamu hanya dari props.footer, header tetap menerima tamu', () => {
    // Pintu tamu hidup di props.footer drawer (bukan props.children), jadi rekursi children = 0.
    const tautan = pintuTamu(pohonTamu);
    harus(tautan.length === 0, `ada ${tautan.length} tautan tamu di luar props.footer drawer`);

    const header = elemenDenganNama(pohonTamu, 'Header');
    harus(header, 'Header tidak ada di pohon PublicLayout');
    harus(header.props.user === null, 'Header tidak menerima user tamu');
    harus(header.props.cartCount === 0, `badge keranjang Header: ${String(header.props.cartCount)}`);
    harus(header.props.storeName === 'Toko Kulot', `nama toko Header: ${String(header.props.storeName)}`);
    harus(typeof header.props.onOpenDrawer === 'function', 'Header kehilangan onOpenDrawer');
    harus(Array.isArray(header.props.nav) && header.props.nav.length === 3, 'nav Header tidak 3 item');
    return `tautan_luar_footer=${tautan.length}`;
});

jalankan('P3 Drawer terbuka: footer asli berada di dalam panel, Daftar sebelum Masuk', () => {
    const html = renderToStaticMarkup(
        React.createElement(NavDrawer, {
            open: true,
            nav: NAV,
            onClose: () => {},
            title: 'Menu',
            footer: footerTamu,
        })
    );

    harus(html.includes('class="border-t border-line p-4"'), 'wrapper footer drawer hilang');
    harus(html.includes('role="dialog"'), 'drawer kehilangan role dialog');

    const daftar = html.indexOf('href="/register"');
    const masuk = html.indexOf('href="/login"');
    harus(daftar >= 0 && masuk >= 0, 'pintu tamu tidak dirender di drawer');
    harus(daftar < masuk, 'urutan Daftar/Masuk tertukar di drawer');
    harus(daftar > html.indexOf('<nav'), 'footer drawer harus setelah blok nav');

    const slice = html.slice(html.indexOf('border-t border-line p-4'));
    harus(slice.includes('btn-primary w-full justify-center') && slice.includes('btn-secondary w-full justify-center'), 'kelas tombol footer berubah');
    harus(slice.includes('>Daftar<') && slice.includes('>Masuk<'), 'teks tombol footer berubah');
    return `posisi daftar=${daftar} masuk=${masuk}`;
});

jalankan('P4 PublicLayout pembeli: footer drawer = "Masuk sebagai ...", tanpa pintu tamu', () => {
    const pohon = PublicLayout({
        settings: { store_name: 'Toko Kulot' },
        cartCount: 1,
        user: { name: 'Siti', email: 'siti@contoh.test' },
        children: null,
    });

    const drawer = cari(pohon, (e) => e.type === NavDrawer);
    harus(drawer, 'NavDrawer tidak ada di pohon pembeli');
    const footer = drawer.props.footer;
    harus(footer && footer.type === 'p', 'footer pembeli bukan <p>');
    harus(String(footer.props.children).includes('Masuk sebagai Siti'), `teks footer pembeli: ${String(footer.props.children)}`);
    harus(pintuTamu(pohon).length === 0, 'pembeli login masih punya pintu tamu di pohon');

    const html = renderToStaticMarkup(
        React.createElement(NavDrawer, { open: true, nav: NAV, onClose: () => {}, title: 'Menu', footer })
    );
    harus(!html.includes('href="/register"') && !html.includes('href="/login"'), 'markup drawer pembeli memuat pintu tamu');
    harus(html.includes('Masuk sebagai Siti'), 'teks "Masuk sebagai" hilang di drawer pembeli');
});

jalankan('P5 Halaman pembeli: header/footer/pengumuman tetap, cart.count halaman menang atas prop', () => {
    // Urutan kontrak PublicLayout: cart.count (props bersama) → prop cartCount → settings → 0.
    kendali.halaman.props.cart = { count: 2 };

    const pohon = PublicLayout({ settings: {}, cartCount: 5, user: { name: 'Siti' }, children: null });
    const header = elemenDenganNama(pohon, 'Header');
    harus(header.props.user && header.props.user.name === 'Siti', 'Header tidak menerima user pembeli');
    harus(header.props.cartCount === 2, `badge keranjang bukan 2: ${String(header.props.cartCount)}`);
    harus(elemenDenganNama(pohon, 'Footer'), 'Footer publik hilang dari pohon');
    harus(elemenDenganNama(pohon, 'Announcement'), 'Announcement hilang dari pohon');
    harus(pintuTamu(pohon).length === 0, 'halaman pembeli masih punya pintu tamu');
});

const gagal = hasil.filter((r) => r.status === 'GAGAL');
for (const r of hasil) {
    console.log(`${r.status === 'OK' ? 'OK   ' : 'GAGAL'} ${r.nama}${r.catatan ? ` -> ${r.catatan}` : ''}`);
}
console.log(`\nringkasan: ${hasil.length - gagal.length}/${hasil.length} pemeriksaan lulus`);
process.exit(gagal.length === 0 ? 0 : 1);

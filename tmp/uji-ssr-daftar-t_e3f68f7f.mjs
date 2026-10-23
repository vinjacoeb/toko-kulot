/**
 * Harness render statis (SSR) kartu t_e3f68f7f — pintu "Daftar" untuk tamu di header
 * publik + tautan silang Masuk<->Daftar di /login dan /register (deviasi D14/D15/D16, design.md §11.3).
 * File uji lokal (bukan bagian aplikasi), tanpa browser dan tanpa pustaka uji baru:
 * '@inertiajs/react' diganti stub tmp/inertia-stub.jsx, komponen dirender dengan
 * react-dom/server. Batasan: yang diuji markup & kontrak props, bukan tata letak nyata,
 * fokus keyboard, atau klik di browser.
 * Perintah yang dijalankan ada di tmp/jalankan-uji-t_e3f68f7f.sh
 */
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { __reset, __setPageProps, __setFormErrors } from './inertia-stub.jsx';
import Header from '../resources/js/Components/Header.jsx';
import PublicLayout from '../resources/js/Layouts/PublicLayout.jsx';
import Login from '../resources/js/Pages/Public/Auth/Login.jsx';
import Register from '../resources/js/Pages/Public/Auth/Register.jsx';

const AKAR = path.resolve('.');
const hasil = [];

const uji = (nama, fn) => {
    try {
        fn();
        hasil.push({ status: 'OK', nama, catatan: '' });
    } catch (galat) {
        hasil.push({ status: 'GAGAL', nama, catatan: galat.message });
    }
};

const harus = (syarat, pesan) => {
    if (!syarat) throw new Error(pesan);
};

const teks = (html) =>
    html
        .replace(/<[^>]+>/g, ' ')
        .replace(/&#?\w+;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const hitung = (html, potongan) => html.split(potongan).length - 1;
/** Anchor lengkap (tag + isi) yang href-nya persis `href`; null bila tidak ada. */
const tautanDengan = (html, href) => {
    const m = html.match(new RegExp(`<a [^>]*href="${esc(href)}"[^>]*>(.*?)</a>`, 's'));
    if (!m) return null;
    return { tag: m[0].slice(0, m[0].indexOf('>') + 1), dalam: m[1].replace(/\s+/g, ' ').trim(), penuh: m[0] };
};
/** Href semua anchor yang teksnya persis `label` (membedakan logo toko dari item nav). */
const tautanBerlabel = (html, label) => {
    const semua = [...html.matchAll(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
    return semua.filter((m) => m[2].replace(/\s+/g, ' ').trim() === label).map((m) => m[1]);
};
const baca = (berkas) => fs.readFileSync(path.join(AKAR, berkas), 'utf8');
/** Buang komentar supaya pemeriksaan statik hanya menilai kode, bukan catatan docblock. */
const tanpaKomentar = (isi) => isi.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^[ \t]*\/\/.*$/gm, ' ');

const render = (Komponen, props = {}, pageProps = {}, formErrors = {}) => {
    __reset();
    __setPageProps(pageProps);
    __setFormErrors(formErrors);
    return renderToStaticMarkup(React.createElement(Komponen, props));
};

const NAV = [
    { label: 'Beranda', href: '/' },
    { label: 'Produk', href: '/produk' },
    { label: 'Kontak', href: '/kontak-kami' },
];
const KELAS_TAUTAN_AUTH = 'text-brand underline underline-offset-4';
// D14 (design.md §11.3): kelas aksi yang sudah dipakai header, pola teks "Keluar" (Header.jsx:92-98).
const KELAS_PINTU_DAFTAR = ['hidden', 'text-meta', 'text-brand', 'underline', 'underline-offset-4', 'md:inline-flex'];
// Kelas yang hanya boleh dipakai item nav di tengah (bukan tautan pintu Daftar).
const KELAS_ITEM_NAV = [
    'px-3.5',
    'py-3',
    'text-meta',
    'text-ink',
    'hover:underline',
    'hover:decoration-accent-500',
    'hover:decoration-2',
    'hover:underline-offset-4',
];

// --- Grup A: header publik, tamu (design §3.1, deviasi D14) ----------------
let htmlTamu = '';
let htmlPembeli = '';

uji('A1 Header tamu merender tanpa galat', () => {
    htmlTamu = render(Header, { nav: NAV, cartCount: 2, user: null, storeName: 'Toko Kulot' });
    harus(htmlTamu.includes('<header'), 'header tidak dirender');
});

uji('A2 Header tamu: tepat satu tautan /register bertulis "Daftar"', () => {
    harus(hitung(htmlTamu, 'href="/register"') === 1, `jumlah href="/register" = ${hitung(htmlTamu, 'href="/register"')}`);
    const a = tautanDengan(htmlTamu, '/register');
    harus(a, 'anchor /register tidak ditemukan');
    harus(a.dalam === 'Daftar', `teks tautan bukan "Daftar": ${a ? a.dalam : 'tidak ada'}`);
});

uji('A3 Header tamu: kelas tautan Daftar persis pola aksi header (D14)', () => {
    const a = tautanDengan(htmlTamu, '/register');
    harus(a, 'anchor /register tidak ditemukan');
    for (const kelas of KELAS_PINTU_DAFTAR) {
        harus(a.tag.includes(kelas), `kelas ${kelas} tidak ada di ${a.tag}`);
    }
    for (const kelas of ['px-3.5', 'py-3', 'hover:underline']) {
        harus(!a.tag.includes(kelas), `tautan Daftar memakai kelas item nav ${kelas}: ${a.tag}`);
    }
    // D14 menetapkan teks, bukan ikon.
    harus(!a.dalam.includes('<svg'), 'tautan Daftar berisi ikon');
});

uji('A4 Header tamu: tautan Daftar disembunyikan < md (hidden + md:inline-flex)', () => {
    const a = tautanDengan(htmlTamu, '/register');
    harus(a, 'anchor /register tidak ditemukan');
    harus(/\bhidden\b/.test(a.tag), `kelas hidden tidak ada: ${a.tag}`);
    harus(a.tag.includes('md:inline-flex'), `kelas md:inline-flex tidak ada: ${a.tag}`);
    harus(!a.tag.includes('md:hidden'), `tautan Daftar justru disembunyikan >= md: ${a.tag}`);
});

uji('A5 Header tamu: ikon Masuk tetap ada dan Daftar berada di sebelah kanannya', () => {
    const masuk = tautanDengan(htmlTamu, '/login');
    harus(masuk, 'ikon Masuk (anchor /login) tidak ada');
    harus(masuk.tag.includes('aria-label="Masuk"'), `ikon Masuk kehilangan aria-label: ${masuk.tag}`);
    harus(masuk.dalam.includes('<svg'), 'ikon Masuk bukan ikon lagi');
    const aMasuk = htmlTamu.indexOf('href="/login"');
    const aDaftar = htmlTamu.indexOf('href="/register"');
    harus(aMasuk < aDaftar, `urutan salah: login@${aMasuk}, register@${aDaftar}`);
});

uji('A6 Header tamu: navigasi, hamburger, cari, keranjang tidak berubah', () => {
    for (const item of NAV) {
        const href = tautanBerlabel(htmlTamu, item.label);
        harus(href.includes(item.href), `item nav ${item.label} hilang/berubah: ${href.join(',') || 'tidak ada'}`);
    }
    harus(hitung(htmlTamu, 'href="/produk"') === 2, 'tautan Produk harus ada di nav + ikon Cari');
    harus(htmlTamu.includes('aria-label="Buka menu"'), 'hamburger mobile hilang');
    harus(htmlTamu.includes('aria-label="Cari produk"'), 'tautan cari hilang');
    harus(htmlTamu.includes('aria-label="Keranjang, 2 item"'), 'badge keranjang berubah');
    harus(!htmlTamu.includes('>Keluar<'), 'tamu tidak boleh melihat tombol Keluar');
    const t = teks(htmlTamu);
    harus(!/NaN|undefined/.test(t), `ada NaN/undefined: ${t.slice(0, 120)}`);
});

uji('A7 Header pembeli: tidak ada pintu Daftar/Masuk, nama + Keluar tetap', () => {
    htmlPembeli = render(Header, {
        nav: NAV,
        cartCount: 1,
        user: { name: 'Siti', email: 'siti@contoh.test' },
        storeName: 'Toko Kulot',
    });
    harus(hitung(htmlPembeli, 'href="/register"') === 0, 'pembeli login tidak boleh melihat tautan Daftar');
    harus(hitung(htmlPembeli, 'href="/login"') === 0, 'pembeli login tidak boleh melihat tautan Masuk');
    harus(htmlPembeli.includes('>Keluar<'), 'tombol Keluar hilang');
    harus(teks(htmlPembeli).includes('Siti'), 'nama pengguna hilang');
    harus(!htmlPembeli.includes('aria-label="Masuk"'), 'ikon Masuk masih tampil untuk pembeli');
});

// --- Grup B: PublicLayout (SSR, drawer tertutup) ---------------------------
uji('B1 PublicLayout tamu: skip link + konten + tepat satu pintu Daftar dari header', () => {
    const html = render(PublicLayout, { settings: { store_name: 'Toko Kulot' }, cartCount: 0, user: null }, {}, {});
    harus(html.includes('id="konten-utama"'), 'main#konten-utama hilang');
    harus(html.includes('href="#konten-utama"'), 'skip link hilang');
    harus(hitung(html, 'href="/register"') === 1, `jumlah href="/register" di halaman tamu = ${hitung(html, 'href="/register"')}`);
    harus(hitung(html, 'href="/login"') === 1, `jumlah href="/login" di halaman tamu = ${hitung(html, 'href="/login"')}`);
});

uji('B2 PublicLayout pembeli: tanpa pintu Daftar/Masuk di halaman', () => {
    const html = render(
        PublicLayout,
        { settings: { store_name: 'Toko Kulot' }, cartCount: 3, user: { name: 'Siti' } }
    );
    harus(hitung(html, 'href="/register"') === 0, 'pembeli login masih melihat tautan Daftar');
    harus(hitung(html, 'href="/login"') === 0, 'pembeli login masih melihat tautan Masuk');
    harus(html.includes('>Keluar<'), 'tombol Keluar hilang di halaman pembeli');
});

// --- Grup C: /login (tautan silang ke /register) ---------------------------
uji('C1 Login: tepat satu tautan /register, teks "Belum punya akun? Daftar"', () => {
    const html = render(Login, {});
    harus(hitung(html, 'href="/register"') === 1, 'tautan silang /register tidak ada / ganda');
    const t = teks(html);
    harus(t.includes('Belum punya akun?'), `teks pengantar hilang: ${t.slice(0, 160)}`);
    const a = tautanDengan(html, '/register');
    harus(a && a.dalam === 'Daftar', `teks tautan bukan "Daftar": ${a ? a.dalam : 'tidak ada'}`);
});

uji('C2 Login: tautan silang setelah </form>, tautan lupa sandi tetap', () => {
    const html = render(Login, {});
    const akhirForm = html.indexOf('</form>');
    const tautanSilang = html.indexOf('href="/register"');
    harus(akhirForm >= 0 && tautanSilang > akhirForm, 'tautan silang tidak berada setelah form');
    harus(hitung(html, 'href="/forgot-password"') === 1, 'tautan lupa sandi hilang/berubah');
    harus(hitung(html, 'href="/login"') === 0, 'halaman Masuk tidak boleh menautkan ke dirinya sendiri');
});

uji('C3 Login: gaya tautan silang sama dengan tautan lupa sandi', () => {
    const html = render(Login, {});
    const a = tautanDengan(html, '/register');
    harus(a.tag.includes(KELAS_TAUTAN_AUTH), `kelas tautan silang: ${a.tag}`);
    const paragraf = html.slice(html.lastIndexOf('<p class="mt-4 text-meta">'));
    harus(paragraf.startsWith('<p class="mt-4 text-meta">'), `paragraf tautan silang: ${paragraf.slice(0, 80)}`);
});

uji('C4 Login: field, tombol, dan galat per kolom tidak berubah', () => {
    const html = render(Login, {});
    for (const id of ['login-email', 'login-password', 'login-remember']) {
        harus(html.includes(`id="${id}"`), `kontrol ${id} hilang`);
    }
    harus(/<button[^>]*type="submit"/.test(html) && teks(html).includes('Masuk'), 'tombol submit Masuk hilang');

    const pesan = 'Email atau kata sandi salah.';
    const htmlGalat = render(Login, { flash: { success: null, error: pesan } }, {}, { email: pesan });
    harus(htmlGalat.includes('role="alert"') && teks(htmlGalat).includes(pesan), 'galat global tidak tampil');
    harus(hitung(htmlGalat, 'href="/register"') === 1, 'tautan silang hilang saat galat');
});

// --- Grup D: /register (tautan silang ke /login) ---------------------------
uji('D1 Register: tepat satu tautan /login, teks "Sudah punya akun? Masuk"', () => {
    const html = render(Register, {});
    harus(hitung(html, 'href="/login"') === 1, 'tautan silang /login tidak ada / ganda');
    const t = teks(html);
    harus(t.includes('Sudah punya akun?'), `teks pengantar hilang: ${t.slice(0, 160)}`);
    const a = tautanDengan(html, '/login');
    harus(a && a.dalam === 'Masuk', `teks tautan bukan "Masuk": ${a ? a.dalam : 'tidak ada'}`);
});

uji('D2 Register: tautan silang setelah </form>, tidak menautkan ke dirinya sendiri', () => {
    const html = render(Register, {});
    const akhirForm = html.indexOf('</form>');
    const tautanSilang = html.indexOf('href="/login"');
    harus(akhirForm >= 0 && tautanSilang > akhirForm, 'tautan silang tidak berada setelah form');
    harus(hitung(html, 'href="/register"') === 0, 'halaman Daftar tidak boleh menautkan ke dirinya sendiri');
});

uji('D3 Register: gaya tautan silang sama dengan gaya tautan auth lain', () => {
    const html = render(Register, {});
    const a = tautanDengan(html, '/login');
    harus(a.tag.includes(KELAS_TAUTAN_AUTH), `kelas tautan silang: ${a.tag}`);
    const paragraf = html.slice(html.lastIndexOf('<p class="mt-4 text-meta">'));
    harus(paragraf.startsWith('<p class="mt-4 text-meta">'), `paragraf tautan silang: ${paragraf.slice(0, 80)}`);
});

uji('D4 Register: 6 field + tombol Daftar tidak berubah', () => {
    const html = render(Register, {});
    for (const id of [
        'register-name',
        'register-email',
        'register-phone',
        'register-password',
        'register-password-confirmation',
        'register-terms',
    ]) {
        harus(html.includes(`id="${id}"`), `kontrol ${id} hilang`);
    }
    harus(/<button[^>]*type="submit"/.test(html) && teks(html).includes('Daftar'), 'tombol submit Daftar hilang');
});

uji('D5 Register: galat per kolom tetap tampil apa adanya', () => {
    const pesan = 'Email sudah terdaftar.';
    const html = render(Register, {}, {}, { email: pesan, terms: 'Syarat dan ketentuan wajib disetujui.' });
    const t = teks(html);
    harus(t.includes(pesan), 'galat email tidak tampil');
    harus(t.includes('Syarat dan ketentuan wajib disetujui.'), 'galat terms tidak tampil');
    harus(html.includes('id="register-terms-error"'), 'id galat terms hilang');
    harus(hitung(html, 'href="/login"') === 1, 'tautan silang hilang saat galat');
});

uji('D6 Tidak ada NaN/undefined/[CONTOH]/lorem di markup halaman auth', () => {
    const semua = [render(Login, {}), render(Register, {})].map(teks).join(' || ');
    harus(!/NaN|undefined|\[CONTOH\]|lorem/i.test(semua), `teks rusak: ${semua.slice(0, 160)}`);
});

// --- Grup E: pemeriksaan statik sumber ------------------------------------
const BERKAS = {
    header: 'resources/js/Components/Header.jsx',
    layout: 'resources/js/Layouts/PublicLayout.jsx',
    login: 'resources/js/Pages/Public/Auth/Login.jsx',
    register: 'resources/js/Pages/Public/Auth/Register.jsx',
};

uji('E1 Tidak ada Ziggy/route(), localStorage, atau innerHTML di kode 4 berkas', () => {
    for (const [nama, berkas] of Object.entries(BERKAS)) {
        const kode = tanpaKomentar(baca(berkas));
        harus(!/ziggy/i.test(kode), `${nama}: memakai Ziggy`);
        harus(!/from\s+['"]ziggy|require\(['"]ziggy/i.test(kode), `${nama}: mengimpor ziggy`);
        harus(!/\broute\(/.test(kode), `${nama}: memakai helper route()`);
        harus(!/localStorage|sessionStorage/.test(kode), `${nama}: menyimpan data di storage browser`);
        harus(!/dangerouslySetInnerHTML/.test(kode), `${nama}: memakai dangerouslySetInnerHTML`);
    }
});

uji('E2 URL literal sesuai PRD §15.2 dan tidak ada rute karangan', () => {
    const header = baca(BERKAS.header);
    const layout = baca(BERKAS.layout);
    const login = baca(BERKAS.login);
    const register = baca(BERKAS.register);
    harus(header.includes('href="/register"'), 'Header: tautan /register hilang');
    harus(layout.includes('href="/register"') && layout.includes('href="/login"'), 'PublicLayout: pintu tamu hilang');
    harus(login.includes('href="/register"') && login.includes("post('/login')"), 'Login: tautan silang / URL kirim berubah');
    harus(register.includes('href="/login"') && register.includes("post('/register')"), 'Register: tautan silang / URL kirim berubah');
    const semuaTautan = [...`${header}${layout}${login}${register}`.matchAll(/href="(\/[a-z0-9/-]*)"/g)].map((m) => m[1]);
    harus(!semuaTautan.some((u) => u.includes('tiruan')), 'ada tautan sisa uji');
});

uji('E3 Register: impor @inertiajs/react tunggal berisi Link + useForm', () => {
    const isi = baca(BERKAS.register);
    const baris = isi.split('\n').filter((l) => l.includes("from '@inertiajs/react'"));
    harus(baris.length === 1, `jumlah impor @inertiajs/react = ${baris.length}`);
    harus(/Link/.test(baris[0]) && /useForm/.test(baris[0]), `impor tidak lengkap: ${baris[0]}`);
});

uji('E4 Jejak deviasi D14/D15/D16 tercatat di berkas yang tepat', () => {
    const peta = [
        ['Header.jsx', 'D14'],
        ['PublicLayout.jsx', 'D15'],
        ['Login.jsx', 'D16'],
        ['Register.jsx', 'D16'],
    ];
    let diperiksa = 0;
    const terlihat = new Set();
    for (const berkas of Object.values(BERKAS)) {
        const isi = baca(berkas);
        harus(!/D13\b/.test(isi), `${berkas}: memakai label D13 (milik kartu admin t_8e89556f)`);
        const label = peta.filter(([nama]) => String(berkas).endsWith(nama)).map(([, l]) => l);
        harus(label.length === 1, `${berkas}: tidak dipetakan ke tepat satu deviasi`);
        for (const l of label) {
            harus(isi.includes(l), `${berkas}: tanpa catatan deviasi ${l}`);
            terlihat.add(l);
        }
        diperiksa += 1;
    }
    harus(diperiksa === 4, `berkas diperiksa = ${diperiksa}`);
    harus(terlihat.size === 3, `label deviasi terlihat = ${[...terlihat].join(',')}`);
});

const gagal = hasil.filter((r) => r.status === 'GAGAL');
for (const r of hasil) {
    console.log(`${r.status === 'OK' ? 'OK   ' : 'GAGAL'} ${r.nama}${r.catatan ? ` -> ${r.catatan}` : ''}`);
}
console.log(`\nringkasan: ${hasil.length - gagal.length}/${hasil.length} pemeriksaan lulus`);
process.exit(gagal.length === 0 ? 0 : 1);

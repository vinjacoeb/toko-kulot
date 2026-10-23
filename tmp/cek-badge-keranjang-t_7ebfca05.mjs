// Probe badge keranjang t_7ebfca05 — menguji LOGIKA YANG ADA DI BERKAS, bukan salinan.
// 1) Ambil blok `const toCount = ...` dan baris `const count = ...` langsung dari
//    resources/js/Layouts/PublicLayout.jsx, lalu jalankan dengan mock props.
// 2) Reproduksi bug lama (ekspresi sebelum perbaikan) sebagai kontrol negatif.
import { readFileSync } from 'node:fs';

const SRC = 'resources/js/Layouts/PublicLayout.jsx';
const src = readFileSync(SRC, 'utf8');

const toCountStart = src.indexOf('/** Jumlah item yang aman ditampilkan');
const toCountEnd = src.indexOf('export default function PublicLayout');
if (toCountStart < 0 || toCountEnd < 0) {
    console.error('GAGAL: blok toCount tidak ditemukan di ' + SRC);
    process.exit(1);
}
const toCountSrc = src.slice(toCountStart, toCountEnd);

const countLineMatch = src.match(/^\s*const count = toCount\(.*$/m);
if (!countLineMatch) {
    console.error('GAGAL: baris `const count = toCount(...)` tidak ditemukan di ' + SRC);
    process.exit(1);
}
const countLine = countLineMatch[0].trim();

// Fungsi dirakit dari potongan berkas asli.
const buildCount = new Function(
    'page',
    'cartCount',
    'settings',
    `${toCountSrc}\n${countLine}\nreturn count;`
);

const oldCount = (page, cartCount, settings) => {
    const sharedCart = page?.props?.cart?.count;
    const cartCountDefaulted = cartCount === undefined ? 0 : cartCount;
    return Number(cartCountDefaulted ?? sharedCart ?? settings?.cart_count ?? 0) || 0;
};

const page = (cart) => ({ props: { cart } });

let gagal = 0;
const cek = (nama, dapat, harap) => {
    const ok = Object.is(dapat, harap);
    if (!ok) gagal += 1;
    console.log(`${ok ? 'OK  ' : 'GAGAL'} ${nama}: dapat ${JSON.stringify(dapat)}, harap ${JSON.stringify(harap)}`);
};

console.log('== Ekspresi baru (dari ' + SRC + ') ==');
cek('cart.count=3 (prop halaman 0 bawaan)', buildCount(page({ count: 3 }), 0, {}), 3);
cek('cart.count="4" (string dari server)', buildCount(page({ count: '4' }), 0, {}), 4);
cek('cart.count=0 -> badge disembunyikan', buildCount(page({ count: 0 }), 0, {}), 0);
cek('cart.count=null, cartCount=5 -> pakai prop', buildCount(page({ count: null }), 5, {}), 5);
cek('cart.count undefined, cartCount undefined, settings=2', buildCount(page(undefined), undefined, { cart_count: 2 }), 2);
cek('semua kosong -> 0', buildCount(page(undefined), undefined, {}), 0);
cek('cart.count="abc" -> 0 (bukan NaN)', buildCount(page({ count: 'abc' }), 0, {}), 0);
cek('cart.count=NaN -> 0', buildCount(page({ count: NaN }), 0, {}), 0);
cek('cart.count=-2 -> 0', buildCount(page({ count: -2 }), 0, {}), 0);
cek('cart.count=2.7 -> 2 (integer)', buildCount(page({ count: 2.7 }), 0, {}), 2);
cek('cart.count="" (string kosong) -> jatuh ke prop 7', buildCount(page({ count: '' }), 7, {}), 7);

console.log('\n== Kontrol negatif: ekspresi LAMA (sebelum perbaikan) ==');
cek('lama: cart.count=3, prop bawaan 0 -> 0 (bug pemilik)', oldCount(page({ count: 3 }), 0, {}), 0);

console.log('\n== Header: badge hanya dirender saat > 0 ==');
const header = readFileSync('resources/js/Components/Header.jsx', 'utf8');
const badgeLine = header.match(/badge=\{[^}]*\}/)?.[0] ?? '(tidak ada)';
console.log('Header.jsx: ' + badgeLine);
if (!/badge=\{count > 0 \? count : null\}/.test(header)) {
    gagal += 1;
    console.log('GAGAL: Header tidak menyembunyikan badge saat 0');
} else {
    console.log('OK   badge null saat 0, angka saat > 0');
}

console.log(`\n${gagal === 0 ? 'LULUS' : 'ADA ' + gagal + ' KEGAGALAN'} — ${gagal === 0 ? 'semua' : ''} pemeriksaan selesai`);
process.exit(gagal === 0 ? 0 : 1);

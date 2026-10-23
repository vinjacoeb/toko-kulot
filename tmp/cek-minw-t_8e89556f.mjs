/**
 * Probe kecil (file uji lokal, bukan bagian aplikasi) untuk memastikan kelas utilitas
 * min-w-64 memang dihasilkan Tailwind versi proyek ini. Dipakai kartu t_8e89556f
 * (F8 — tombol "Sinkronkan status pembayaran"; D13 "lebar dikunci saat memproses").
 * Jalankan: node tmp/cek-minw-t_8e89556f.mjs
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const defaultTheme = require('tailwindcss/defaultTheme');
const versi = require('tailwindcss/package.json').version;

const kunci = Object.keys(defaultTheme.minWidth ?? {});

console.log(`tailwindcss=${versi}`);
console.log(`minWidth_bawaan=${JSON.stringify(kunci)}`);
console.log(`punya_min_w_64=${kunci.includes('64')}`);

const resolusi =
    typeof require('tailwindcss/resolveConfig') === 'function'
        ? require('tailwindcss/resolveConfig')(require('../tailwind.config.js')).theme.minWidth
        : null;

if (resolusi) {
    const nama = Object.keys(resolusi);

    console.log(`minWidth_resolved_punya_64=${nama.includes('64')}`);
    console.log(`minWidth_resolved_contoh=${JSON.stringify(nama.filter((n) => /^(64|[0-9]+)$/.test(n)).slice(0, 8))}`);
}

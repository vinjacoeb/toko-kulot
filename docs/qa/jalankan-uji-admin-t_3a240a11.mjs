/**
 * Driver harness QA `t_3a240a11` — render SSR halaman daftar Admin.
 *
 * Membangun `uji-admin-index-t_3a240a11.mjs` dengan esbuild (alias `@inertiajs/react`
 * -> `stub-inertia-badge-t_3a240a11.mjs`), menjalankannya, lalu merangkum hasil check.
 * Tidak ada berkas aplikasi yang diubah; berkas bundle sementara dihapus setelah selesai.
 *
 * Perintah: node docs/qa/jalankan-uji-admin-t_3a240a11.mjs
 */

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const DIR = dirname(fileURLToPath(import.meta.url));
const AKAR = resolve(DIR, '..', '..');
const ENTRY = join(DIR, 'uji-admin-index-t_3a240a11.mjs');
const STUB = join(DIR, 'stub-inertia-badge-t_3a240a11.mjs');
const KELUARAN = join(DIR, '.bundle-admin-index.mjs');
const BERKAS_DIUJI = [
    'resources/js/Pages/Admin/Products/Index.jsx',
    'resources/js/Pages/Admin/Stocks/Index.jsx',
    'resources/js/Pages/Admin/Orders/Index.jsx',
];

console.log('=== Harness render SSR halaman daftar Admin — kartu t_3a240a11 (butir 4) ===');
console.log(`node: ${process.version}`);

for (const berkas of BERKAS_DIUJI) {
    const md5 = createHash('md5').update(readFileSync(join(AKAR, berkas))).digest('hex');
    console.log(`md5  ${md5}  ${berkas}`);
}
console.log('');

let kodeBangun = 0;

try {
    await build({
        absWorkingDir: AKAR,
        entryPoints: [ENTRY],
        outfile: KELUARAN,
        bundle: true,
        platform: 'node',
        format: 'esm',
        jsx: 'automatic',
        packages: 'external',
        alias: { '@inertiajs/react': STUB },
        logLevel: 'silent',
    });
} catch (galat) {
    console.log(`BANGUN GAGAL: ${galat.message}`);
    kodeBangun = 1;
}

let gagal = 0;

if (!kodeBangun) {
    const proses = spawnSync(process.execPath, [KELUARAN], { cwd: AKAR, encoding: 'utf8' });
    const mentah = String(proses.stdout ?? '');
    const mulai = mentah.indexOf('{');
    const akhir = mentah.lastIndexOf('}');
    const laporan = mulai >= 0 && akhir > mulai ? JSON.parse(mentah.slice(mulai, akhir + 1)) : null;

    if (!laporan) {
        console.log(`KELUARAN TIDAK TERBACA (exit ${proses.status})`);
        console.log(String(proses.stderr ?? '').split('\n').slice(0, 8).join('\n'));
        gagal += 1;
    } else {
        for (const halaman of laporan.hasil) {
            console.log(`--- ${halaman.id} ${halaman.nama} (markup ${halaman.panjangMarkup} karakter) ---`);

            if (halaman.galat) {
                console.log(`  RUNTIME ERROR: ${halaman.galat}`);
            }

            for (const check of halaman.checks) {
                console.log(`  ${check.pass ? 'LULUS' : 'GAGAL'}  ${check.id}  ${check.harap}`);

                if (!check.pass) {
                    gagal += 1;
                    console.log(`         tidak ditemukan: ${check.tidakKetemu.join(' | ')}`);
                }
            }

            console.log('');
        }
    }
}

for (const berkas of [KELUARAN]) {
    try {
        rmSync(berkas, { force: true });
    } catch {
        // abaikan
    }
}

console.log(gagal === 0 && kodeBangun === 0 ? 'RINGKASAN: seluruh check render admin LULUS' : `RINGKASAN: ${gagal} check GAGAL`);
process.exitCode = gagal === 0 && kodeBangun === 0 ? 0 : 1;

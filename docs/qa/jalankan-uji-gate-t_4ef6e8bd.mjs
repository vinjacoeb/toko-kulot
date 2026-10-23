/**
 * Driver harness QA kartu t_4ef6e8bd.
 *
 * Menjalankan dua bangunan dari berkas uji yang sama:
 *  1) "normal"  — komponen apa adanya (gerbang resmi `boleh && pending.length > 0`);
 *  2) "lama"    — komponen yang sama, tapi baris gerbang ditukar **di memori** (plugin esbuild)
 *                 dengan gerbang deviasi F6 (`boleh || kontradiksiBoleh`). Berkas aplikasi
 *                 tidak disentuh sama sekali; ini kontrol negatif agar terbukti harness
 *                 memang bisa melihat form penilaian (kalau tidak, hasil "bersih" di (1)
 *                 tidak bermakna).
 *
 * Perintah: node docs/qa/jalankan-uji-gate-t_4ef6e8bd.mjs
 * Syarat: dijalankan dari akar proyek (butuh node_modules: react, react-dom, esbuild).
 */

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const DIR = dirname(fileURLToPath(import.meta.url));
const AKAR = resolve(DIR, '..', '..');
const ENTRY = join(DIR, 'uji-gate-boleh-t_4ef6e8bd.mjs');
const STUB = join(DIR, 'stub-inertia-qa-t_4ef6e8bd.mjs');
const JSX = join(AKAR, 'resources', 'js', 'Pages', 'Public', 'CheckoutSuccess.jsx');
const KELUARAN_NORMAL = join(DIR, '.bundle-q1-normal.mjs');
const KELUARAN_LAMA = join(DIR, '.bundle-q1-lama.mjs');

const GATE_RESMI = 'const tampilkanForm = boleh && pending.length > 0;';
const GATE_LAMA = [
    'const kontradiksiBoleh = !boleh && syaratDinilai && pending.length > 0;',
    '    const tampilkanForm = (boleh || kontradiksiBoleh) && syaratDinilai && pending.length > 0;',
].join('\n');

const pluginGerbangLama = {
    name: 'gerbang-lama',
    setup(bangun) {
        bangun.onLoad({ filter: /CheckoutSuccess\.jsx$/ }, (args) => {
            const sumber = readFileSync(args.path, 'utf8');

            if (!sumber.includes(GATE_RESMI)) {
                throw new Error(`anchor gerbang resmi tidak ditemukan di ${args.path}`);
            }

            return {
                contents: sumber.replace(GATE_RESMI, GATE_LAMA),
                loader: 'jsx',
                resolveDir: dirname(args.path),
            };
        });
    },
};

const bangun = async (outfile, plugins = []) => {
    await build({
        absWorkingDir: AKAR,
        entryPoints: [ENTRY],
        outfile,
        bundle: true,
        platform: 'node',
        format: 'esm',
        jsx: 'automatic',
        packages: 'external',
        alias: { '@inertiajs/react': STUB },
        plugins,
        logLevel: 'silent',
    });
};

const jalankan = (outfile, tambahan = {}) => {
    const proses = spawnSync(process.execPath, [outfile], {
        cwd: AKAR,
        env: { ...process.env, ...tambahan },
        encoding: 'utf8',
    });

    const mentah = String(proses.stdout ?? '');
    const mulai = mentah.indexOf('{');
    const akhir = mentah.lastIndexOf('}');

    let laporan = null;
    if (mulai >= 0 && akhir > mulai) {
        try {
            laporan = JSON.parse(mentah.slice(mulai, akhir + 1));
        } catch (galat) {
            laporan = { galat: `JSON keluaran tidak terbaca: ${galat.message}` };
        }
    }

    return { kode: proses.status, laporan, stderr: String(proses.stderr ?? '').trim() };
};

const sidikJari = createHash('md5').update(readFileSync(JSX)).digest('hex');

console.log('=== Harness gerbang `ulasan.boleh` — kartu t_4ef6e8bd ===');
console.log(`node            : ${process.version}`);
console.log(`esbuild         : ${JSON.parse(readFileSync(join(AKAR, 'node_modules', 'esbuild', 'package.json'), 'utf8')).version}`);
console.log(`berkas diuji    : resources/js/Pages/Public/CheckoutSuccess.jsx`);
console.log(`md5 berkas uji  : ${sidikJari}`);
console.log('');

const gagal = [];

// 1) Bangunan normal --------------------------------------------------------
try {
    await bangun(KELUARAN_NORMAL);
} catch (galat) {
    console.log(`BANGUN NORMAL GAGAL: ${galat.message}`);
    process.exitCode = 1;
}

if (!process.exitCode) {
    console.log('--- 1. komponen apa adanya (gate resmi) ---');
    const normal = jalankan(KELUARAN_NORMAL);

    if (!normal.laporan || normal.laporan.galat) {
        console.log(`HASIL TIDAK TERBACA (exit ${normal.kode}): ${normal.laporan?.galat ?? 'stdout kosong'}`);
        if (normal.stderr) console.log(normal.stderr.split('\n').slice(0, 5).join('\n'));
        gagal.push('bangunan normal tidak menghasilkan laporan');
    } else {
        normal.laporan.hasil.forEach((h) => {
            console.log(`  [${h.lulus ? 'LULUS' : 'GAGAL'}] ${h.id} ${h.nama}${h.catatan ? ` — ${h.catatan}` : ''}`);
        });
        console.log(`  ringkasan: ${normal.laporan.total - normal.laporan.gagal}/${normal.laporan.total} lulus`);

        if (normal.laporan.gagal > 0) gagal.push(`${normal.laporan.gagal} kasus GAGAL pada komponen apa adanya`);
        if (normal.laporan.total < 11) gagal.push(`jumlah kasus hanya ${normal.laporan.total}, harap 11`);
    }
    console.log('');
}

// 2) Kontrol negatif: gerbang lama ditanam di memori ------------------------
try {
    await bangun(KELUARAN_LAMA, [pluginGerbangLama]);
    console.log('--- 2. kontrol negatif (gerbang lama `boleh || kontradiksiBoleh`, di memori) ---');
    const lama = jalankan(KELUARAN_LAMA, { QA_GERBANG_LAMA: '1' });

    if (!lama.laporan || lama.laporan.galat) {
        console.log(`HASIL TIDAK TERBACA (exit ${lama.kode}): ${lama.laporan?.galat ?? 'stdout kosong'}`);
        gagal.push('kontrol negatif tidak menghasilkan laporan');
    } else {
        console.log(`  mode=${lama.laporan.mode} lulus=${lama.laporan.lulus}`);
        (lama.laporan.hasil || []).forEach((h) => {
            console.log(`  [${h.lulus ? 'LULUS' : 'GAGAL'}] ${h.id} ${h.nama}${h.catatan ? ` — ${h.catatan}` : ''}`);
        });
        console.log(
            lama.laporan.lulus
                ? '  → harness MEMANG bisa melihat form: gerbang lama menampilkan form saat `boleh=false`,'
                    + ' sedangkan komponen apa adanya tidak. Pemeriksaan (1) bermakna.'
                : '  → kontrol negatif TIDAK menggigit: form tetap tidak tampil walau gerbang lama dipakai.',
        );
        if (!lama.laporan.lulus) gagal.push('kontrol negatif tidak menggigit');
    }
} catch (galat) {
    console.log(`BANGUN KONTROL NEGATIF GAGAL: ${galat.message}`);
    gagal.push(`bangunan kontrol negatif gagal: ${galat.message}`);
}

console.log('');

[KELUARAN_NORMAL, KELUARAN_LAMA].forEach((berkas) => {
    try {
        rmSync(berkas, { force: true });
    } catch {
        /* biarkan: hanya berkas bangunan sementara */
    }
});

if (gagal.length === 0) {
    console.log(`KESIMPULAN: LULUS — gerbang klien memakai `+ '`ulasan.boleh` apa adanya dan kontrol negatif menggigit.');
} else {
    console.log(`KESIMPULAN: ADA MASALAH — ${gagal.join('; ')}`);
    process.exitCode = 1;
}

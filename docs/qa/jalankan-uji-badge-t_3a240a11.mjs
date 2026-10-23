/**
 * Driver harness QA `t_3a240a11` — badge keranjang (butir 1 laporan pemilik, temuan F-1 `docs/review.md`).
 *
 * Menjalankan dua bangunan dari berkas uji yang sama:
 *   1) "normal"  — `PublicLayout` apa adanya;
 *   2) "kontrol" — `PublicLayout` yang sama, tetapi satu baris perhitungan badge (baris 57)
 *                  ditukar **di memori** lewat plugin esbuild dengan versi pra-perbaikan F-1
 *                  (`toCount(cartCount) ?? ...`, yaitu badge hanya dari prop halaman).
 *                  Berkas aplikasi tidak disentuh sama sekali. Kontrol negatif ini membuktikan
 *                  harness memang melihat badge yang sebenarnya dirender.
 *
 * Perintah: node docs/qa/jalankan-uji-badge-t_3a240a11.mjs
 * Syarat  : dijalankan dari akar proyek (butuh node_modules: react, react-dom, esbuild).
 */

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const DIR = dirname(fileURLToPath(import.meta.url));
const AKAR = resolve(DIR, '..', '..');
const ENTRY = join(DIR, 'uji-badge-keranjang-t_3a240a11.mjs');
const STUB = join(DIR, 'stub-inertia-badge-t_3a240a11.mjs');
const LAYOUT = join(AKAR, 'resources', 'js', 'Layouts', 'PublicLayout.jsx');
const KELUARAN_NORMAL = join(DIR, '.bundle-badge-normal.mjs');
const KELUARAN_KONTROL = join(DIR, '.bundle-badge-kontrol.mjs');

const BARIS_RESMI =
    'const count = toCount(page?.props?.cart?.count) ?? toCount(cartCount) ?? toCount(settings?.cart_count) ?? 0;';
const BARIS_PRA_F1 = 'const count = toCount(cartCount) ?? toCount(settings?.cart_count) ?? 0;';

const pluginPraF1 = {
    name: 'pra-f1',
    setup(bangun) {
        bangun.onLoad({ filter: /PublicLayout\.jsx$/ }, (args) => {
            const sumber = readFileSync(args.path, 'utf8');

            if (!sumber.includes(BARIS_RESMI)) {
                throw new Error(`anchor baris badge resmi tidak ditemukan di ${args.path}`);
            }

            return {
                contents: sumber.replace(BARIS_RESMI, BARIS_PRA_F1),
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

/** Harapan badge per mode. `null` = badge tidak boleh dirender. */
const HARAP_NORMAL = {
    S1: 3, S2: 3, S3: 3, S4: 3, S5: 3, S6: 3, S7: 3, S8: 3,
    S9: null, S10: 2, S11: 5, S12: 4,
};
const HARAP_KONTROL = {
    S1: null, S2: null, S3: null, S4: null, S5: null, S6: null, S7: null, S8: null,
    S9: null, S10: 2, S11: 9, S12: null,
};

const sidikJari = createHash('md5').update(readFileSync(LAYOUT)).digest('hex');

console.log('=== Harness badge keranjang — kartu t_3a240a11 (butir 1 laporan pemilik / F-1) ===');
console.log(`node           : ${process.version}`);
console.log(`berkas diuji   : resources/js/Layouts/PublicLayout.jsx`);
console.log(`md5 berkas uji : ${sidikJari}`);
console.log('');

const gagal = [];

const periksa = (label, blok, harap) => {
    if (!blok.laporan || blok.laporan.galat) {
        console.log(`HASIL TIDAK TERBACA (${label}, exit ${blok.kode}): ${blok.laporan?.galat ?? 'stdout kosong'}`);
        if (blok.stderr) console.log(blok.stderr.split('\n').slice(0, 6).join('\n'));
        process.exitCode = 1;
        gagal.push(`${label}: keluaran tidak terbaca`);

        return;
    }

    console.log(`--- ${label} (mode ${blok.laporan.mode}, ${blok.laporan.jumlahKasus} kasus) ---`);

    for (const hasil of blok.laporan.hasil) {
        const diharap = harap[hasil.id];
        const lulus = !hasil.galat && hasil.badge === diharap;
        const tampil = (nilai) => (nilai === null ? 'tanpa badge' : `badge=${JSON.stringify(nilai)}`);

        console.log(
            `${lulus ? 'LULUS' : 'GAGAL'}  ${hasil.id}  harap ${tampil(diharap)} | dapat ${tampil(hasil.badge)}` +
                `  ${hasil.label ? `| aria-label "${hasil.label}"` : ''}  — ${hasil.nama}`
        );

        if (!lulus) gagal.push(`${label}/${hasil.id}: harap ${JSON.stringify(diharap)}, dapat ${JSON.stringify(hasil.badge)}${hasil.galat ? ` (galat: ${hasil.galat})` : ''}`);
    }

    console.log('');
};

// 1) Bangunan normal --------------------------------------------------------
try {
    await bangun(KELUARAN_NORMAL);
} catch (galat) {
    console.log(`BANGUN NORMAL GAGAL: ${galat.message}`);
    process.exitCode = 1;
}

if (!process.exitCode) {
    periksa('1. PublicLayout apa adanya', jalankan(KELUARAN_NORMAL), HARAP_NORMAL);
}

// 2) Kontrol negatif: baris pra-F1 di memori --------------------------------
try {
    await bangun(KELUARAN_KONTROL, [pluginPraF1]);
} catch (galat) {
    console.log(`BANGUN KONTROL GAGAL: ${galat.message}`);
    process.exitCode = 1;
}

if (!process.exitCode) {
    const kontrol = jalankan(KELUARAN_KONTROL, { QA_BADGE_LAMA: '1' });
    periksa('2. Kontrol negatif (baris pra-perbaikan F-1, di memori)', kontrol, HARAP_KONTROL);

    const hilang =
        kontrol.laporan?.hasil?.filter((h) => ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'].includes(h.id) && h.badge === null)
            .length === 8;

    console.log(`Kontrol negatif terlihat: ${hilang ? 'YA' : 'TIDAK'} — badge hilang di 8 komposisi halaman saat baris pra-F1 dipakai`);

    if (!hilang) {
        gagal.push('kontrol negatif tidak mereproduksi F-1');
        process.exitCode = 1;
    }

    console.log('');
}

for (const berkas of [KELUARAN_NORMAL, KELUARAN_KONTROL]) {
    try {
        rmSync(berkas, { force: true });
    } catch {
        // abaikan
    }
}

console.log(gagal.length === 0 ? 'RINGKASAN: semua pemeriksaan badge LULUS' : `RINGKASAN: ${gagal.length} pemeriksaan GAGAL`);

for (const baris of gagal) console.log(`  - ${baris}`);

process.exitCode = gagal.length === 0 ? 0 : 1;

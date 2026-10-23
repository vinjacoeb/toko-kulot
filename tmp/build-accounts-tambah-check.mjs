// Bundel harness verifikasi tombol "Tambah admin" di /admin/akun (kartu t_15522fc1).
// Jalankan: node tmp/build-accounts-tambah-check.mjs
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

await esbuild.build({
    entryPoints: ['tmp/accounts-tambah-harness.jsx'],
    outfile: 'tmp/accounts-tambah-harness.js',
    bundle: true,
    format: 'iife',
    platform: 'browser',
    jsx: 'transform',
    define: { 'process.env.NODE_ENV': '"development"' },
    logLevel: 'warning',
    alias: { '@inertiajs/react': './tmp/inertia-stub-accounts.jsx' },
    loader: { '.png': 'dataurl', '.jpg': 'dataurl', '.jpeg': 'dataurl', '.svg': 'dataurl', '.webp': 'dataurl' },
});

const cssFiles = fs
    .readdirSync('public/build/assets')
    .filter((f) => /^app-.*\.css$/.test(f))
    .sort(
        (a, b) =>
            fs.statSync(path.join('public/build/assets', b)).mtimeMs -
            fs.statSync(path.join('public/build/assets', a)).mtimeMs
    );
const cssHref = cssFiles.length > 0 ? `../public/build/assets/${cssFiles[0]}` : null;

const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Harness tombol Tambah admin</title>
${cssHref ? `<link rel="stylesheet" href="${cssHref}">` : ''}
</head>
<body>
<div id="app"></div>
<script src="accounts-tambah-harness.js"></script>
</body>
</html>
`;

fs.writeFileSync('tmp/accounts-tambah-harness.html', html);
console.log(`harness siap: tmp/accounts-tambah-harness.html (css: ${cssHref ?? 'tidak ada'})`);

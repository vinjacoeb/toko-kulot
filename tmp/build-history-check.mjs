// Bundel harness verifikasi /history + menu profil header (kartu t_326f766b).
// Jalankan: node tmp/build-history-check.mjs
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

await esbuild.build({
    entryPoints: ['tmp/history-harness.jsx'],
    outfile: 'tmp/history-harness.js',
    bundle: true,
    format: 'iife',
    platform: 'browser',
    jsx: 'transform',
    define: { 'process.env.NODE_ENV': '"development"' },
    logLevel: 'warning',
    alias: { '@inertiajs/react': './tmp/inertia-stub-history.jsx' },
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
<title>Harness riwayat pesanan + menu profil</title>
${cssHref ? `<link rel="stylesheet" href="${cssHref}">` : ''}
</head>
<body>
<div id="app"></div>
<script src="history-harness.js"></script>
</body>
</html>
`;

fs.writeFileSync('tmp/history-harness.html', html);
console.log(`harness siap: tmp/history-harness.html (css: ${cssHref ?? 'tidak ada'})`);

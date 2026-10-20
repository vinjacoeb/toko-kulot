// Bundel harness verifikasi halaman Admin/Messages/Index jadi satu berkas IIFE
// yang bisa dibuka langsung dari browser lewat file://.
// Jalankan: node tmp/build-admin-messages-check.mjs
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const JS_ROOT = path.resolve('resources/js');
const EXT = ['.jsx', '.js', '.mjs', '.tsx', '.ts'];

function resolveAtPath(spec) {
    const base = path.join(JS_ROOT, spec.slice(2));

    for (const c of [base, ...EXT.map((e) => base + e), ...EXT.map((e) => path.join(base, 'index' + e))]) {
        if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
    }

    return null;
}

await esbuild.build({
    entryPoints: ['tmp/admin-messages-harness.jsx'],
    outfile: 'tmp/admin-messages-harness.js',
    bundle: true,
    format: 'iife',
    platform: 'browser',
    jsx: 'transform',
    define: { 'process.env.NODE_ENV': '"development"' },
    logLevel: 'warning',
    alias: { '@inertiajs/react': './tmp/inertia-stub-messages.jsx' },
    loader: { '.png': 'dataurl', '.jpg': 'dataurl', '.jpeg': 'dataurl', '.svg': 'dataurl', '.webp': 'dataurl' },
    plugins: [
        {
            name: 'alias-at-resources',
            setup(build) {
                build.onResolve({ filter: /^@\// }, (args) => {
                    const resolved = resolveAtPath(args.path);

                    if (!resolved) return { errors: [{ text: `tidak bisa resolve ${args.path}` }] };

                    return { path: resolved };
                });
            },
        },
    ],
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

if (!cssHref) console.warn('peringatan: CSS hasil build tidak ditemukan, harness tanpa gaya.');

const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Harness Admin/Messages/Index</title>
${cssHref ? `<link rel="stylesheet" href="${cssHref}">` : ''}
</head>
<body>
<div id="app"></div>
<script src="admin-messages-harness.js"></script>
</body>
</html>
`;

fs.writeFileSync('tmp/admin-messages-harness.html', html);
console.log(`harness siap: tmp/admin-messages-harness.html (css: ${cssHref ?? 'tidak ada'})`);

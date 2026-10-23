// Bundel dua harness kartu t_e3f68f7f jadi berkas .mjs agar bisa dijalankan Node.
// Jalankan: node tmp/build-daftar-check-t_e3f68f7f.mjs
// 1) tmp/uji-ssr-daftar-t_e3f68f7f.mjs   : render statis (react asli, stub Inertia)
// 2) tmp/uji-pohon-daftar-t_e3f68f7f.mjs : pohon elemen (shim hook React, stub Inertia)
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const JS_ROOT = path.resolve('resources/js');
const EXT = ['.jsx', '.js', '.mjs', '.tsx', '.ts'];

// Vite menambah ekstensi; esbuild tidak. Jadi resolusi '@/' diselesaikan di sini.
function resolveAtPath(spec) {
    const base = path.join(JS_ROOT, spec.slice(2));
    const candidates = [base, ...EXT.map((e) => base + e), ...EXT.map((e) => path.join(base, 'index' + e))];
    for (const c of candidates) {
        if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
    }
    return null;
}

const pluginAt = () => ({
    name: 'alias-at-resources',
    setup(build) {
        build.onResolve({ filter: /^@\// }, (args) => {
            const resolved = resolveAtPath(args.path);
            if (!resolved) return { errors: [{ text: `tidak bisa resolve ${args.path}` }] };
            return { path: resolved };
        });
    },
});

const umum = {
    bundle: true,
    format: 'esm',
    platform: 'node',
    jsx: 'automatic',
    logLevel: 'warning',
    external: ['react', 'react-dom', 'react-dom/server', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    loader: { '.png': 'dataurl', '.jpg': 'dataurl', '.jpeg': 'dataurl', '.svg': 'dataurl', '.webp': 'dataurl' },
    plugins: [pluginAt()],
};

await esbuild.build({
    ...umum,
    entryPoints: ['tmp/uji-ssr-daftar-t_e3f68f7f.mjs'],
    outfile: 'tmp/uji-ssr-daftar-t_e3f68f7f.bundle.mjs',
    alias: { '@inertiajs/react': './tmp/inertia-stub.jsx' },
});

await esbuild.build({
    ...umum,
    entryPoints: ['tmp/uji-pohon-daftar-t_e3f68f7f.mjs'],
    outfile: 'tmp/uji-pohon-daftar-t_e3f68f7f.bundle.mjs',
    alias: {
        'react/jsx-runtime': './tmp/shim-jsx-runtime-t_321bf03c.mjs',
        react: './tmp/shim-react-t_321bf03c.mjs',
        '@inertiajs/react': './tmp/stub-inertia-t_321bf03c.mjs',
    },
});

console.log('bundel harness siap: tmp/uji-ssr-daftar-t_e3f68f7f.bundle.mjs, tmp/uji-pohon-daftar-t_e3f68f7f.bundle.mjs');

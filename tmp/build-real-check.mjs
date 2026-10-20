// Bundel harness render statis dengan settings ASLI: tmp/verify-auth-real.mjs
// Jalankan: node tmp/build-real-check.mjs
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const JS_ROOT = path.resolve('resources/js');
const EXT = ['.jsx', '.js', '.mjs', '.tsx', '.ts'];

function resolveAtPath(spec) {
    const base = path.join(JS_ROOT, spec.slice(2));
    const candidates = [base, ...EXT.map((e) => base + e), ...EXT.map((e) => path.join(base, 'index' + e))];
    for (const c of candidates) {
        if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
    }
    return null;
}

await esbuild.build({
    entryPoints: ['tmp/verify-auth-real.mjs'],
    outfile: 'tmp/verify-auth-real.bundle.mjs',
    bundle: true,
    format: 'esm',
    platform: 'node',
    jsx: 'transform',
    logLevel: 'warning',
    external: ['react', 'react-dom', 'react-dom/server', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    alias: { '@inertiajs/react': './tmp/inertia-stub.jsx' },
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

console.log('bundel harness (settings asli) siap: tmp/verify-auth-real.bundle.mjs');

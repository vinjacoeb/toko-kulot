// Bundel harness SSR v1.3 (kartu t_e3c1f107). Jalankan: node tmp/build-ssr-v13-t_e3c1f107.mjs
import * as esbuild from 'esbuild';

await esbuild.build({
    entryPoints: ['tmp/ssr-v13-t_e3c1f107.mjs'],
    outfile: 'tmp/ssr-v13-t_e3c1f107.bundle.mjs',
    bundle: true,
    format: 'esm',
    platform: 'node',
    external: ['react', 'react-dom', 'react-dom/server'],
    jsx: 'transform',
    define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'warning',
    alias: { '@inertiajs/react': './tmp/inertia-stub-ssr-v13.jsx' },
    loader: { '.mjs': 'jsx', '.png': 'dataurl', '.jpg': 'dataurl', '.jpeg': 'dataurl', '.svg': 'dataurl', '.webp': 'dataurl' },
});

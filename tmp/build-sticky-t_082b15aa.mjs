import { build } from 'esbuild';
import { pathToFileURL } from 'node:url';

await build({
    entryPoints: ['tmp/sticky-entry-t_082b15aa.jsx'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: 'tmp/sticky-entry-t_082b15aa.bundle.mjs',
    jsx: 'transform',
    external: ['react', 'react-dom', 'react-dom/server'],
    logLevel: 'warning',
});

const mod = await import(pathToFileURL('tmp/sticky-entry-t_082b15aa.bundle.mjs').href + '?t=' + Date.now());
console.log(mod.writeHarness('tmp/sticky-harness-t_082b15aa.html'));

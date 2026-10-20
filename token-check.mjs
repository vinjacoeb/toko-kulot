// Verifikasi token: docs/design.md §2 → tailwind.config.js
// Catatan: 'tailwindcss/defaultTheme' tidak bisa di-resolve oleh Node ESM polos
// (tanpa ekstensi .js), jadi stub defaultTheme disuntikkan saat verifikasi.
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import resolveConfig from 'tailwindcss/resolveConfig.js';

const src = readFileSync('./tailwind.config.js', 'utf8').replace(
    "import defaultTheme from 'tailwindcss/defaultTheme';",
    "const defaultTheme = { fontFamily: { sans: ['ui-sans-serif', 'system-ui', 'sans-serif'] } };"
);
const tmp = './.token-check.config.mjs';
writeFileSync(tmp, src);
const { default: cfg } = await import(`./.token-check.config.mjs?t=${Date.now()}`);
unlinkSync(tmp);

const t = resolveConfig(cfg).theme;
const checks = [
    ['colors.brand.700', '#1F2A5E'],
    ['colors.brand.soft', 'rgba(31,42,94,0.75)'],
    ['colors.accent.500', '#F5B301'],
    ['colors.accent.600', '#D99E00'],
    ['colors.sale.500', '#E02B00'],
    ['colors.ink.DEFAULT', '#121212'],
    ['colors.ink.soft', 'rgba(0,0,0,0.75)'],
    ['colors.surface', '#F6F6F4'],
    ['colors.footer', '#0E0E0E'],
    ['colors.success', '#16A34A'],
    ['colors.warning', '#D97706'],
    ['colors.danger', '#DC2626'],
    ['colors.success-strong', '#166534'],
    ['colors.warning-strong', '#92400E'],
    ['colors.danger-strong', '#991B1B'],
    ['colors.slate.400', '#94a3b8'],
    ['colors.slate.200', '#e2e8f0'],
    ['colors.line', '#E5E7EB'],
    ['colors.white', '#fff'],
    ['fontFamily.display.0', '"Bebas Neue"'],
    ['fontFamily.sans.0', 'Inter'],
    ['fontSize.display.0', null],
    ['fontSize.h1.0', null],
    ['fontSize.h2.0', null],
    ['fontSize.h3.0', null],
    ['fontSize.body.0', null],
    ['fontSize.meta.0', null],
    ['fontSize.label.0', null],
    ['fontSize.badge.0', null],
    ['borderRadius.sm', '6px'],
    ['borderRadius.md', '8px'],
    ['borderRadius.lg', '9px'],
    ['borderRadius.full', '999px'],
    ['boxShadow.card', null],
    ['boxShadow.raised', null],
    ['spacing.header', '68px'],
    ['spacing.headerMobile', '56px'],
    ['spacing.section', '64px'],
    ['spacing.sectionMobile', '40px'],
    ['spacing.gutter', '16px'],
    ['spacing.gutterLg', '24px'],
    ['maxWidth.page', '1300px'],
    ['height.btn', '47px'],
    ['height.header', '68px'],
    ['height.headerMobile', '56px'],
    ['screens.xs', '360px'],
    ['screens.sm', '640px'],
    ['screens.md', '768px'],
    ['screens.lg', '1024px'],
    ['screens.xl', '1300px'],
    ['gridTemplateColumns.product', null],
    ['gridTemplateColumns.product-md', null],
    ['gridTemplateColumns.product-lg', null],
    ['transitionTimingFunction.smooth', null],
    ['animation.fade-up', null],
];

let bad = 0;
for (const [path, expect] of checks) {
    const val = path.split('.').reduce((o, k) => (o == null ? o : o[k]), t);
    const ok = val !== undefined && (expect === null || val === expect);
    if (!ok) {
        bad += 1;
        console.log('MISS', path, '->', JSON.stringify(val), 'expected', expect);
    }
}
console.log(bad === 0 ? `OK: semua ${checks.length} token ter-resolve` : `GAGAL: ${bad} token`);
console.log('fontSize.display =', t.fontSize.display[0]);
console.log('fontSize.h1 =', t.fontSize.h1[0]);
console.log('container padding =', JSON.stringify(t.container.padding), '| screens.xl =', t.screens.xl);

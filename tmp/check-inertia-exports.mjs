// Cek ekspor nyata paket @inertiajs/react yang dipakai halaman auth:
// Head, Link, useForm, usePage harus benar-benar ada (named export).
// Jalankan: node tmp/check-inertia-exports.mjs
const mod = await import('@inertiajs/react');
const need = ['Head', 'Link', 'useForm', 'usePage'];
let fail = 0;
for (const name of need) {
    const v = mod[name];
    // Link diekspor sebagai hasil React.forwardRef (object), bukan fungsi biasa.
    const ok = typeof v === 'function' || (v !== null && typeof v === 'object' && '$$typeof' in v);
    if (!ok) fail += 1;
    console.log(`${name}: ${ok ? 'OK' : 'TIDAK ADA'} (typeof ${typeof v})`);
}
console.log('ekspor tersedia:', Object.keys(mod).sort().join(', '));
process.exit(fail === 0 ? 0 : 1);

/**
 * Stub `@inertiajs/react` untuk harness badge keranjang (kartu QA `t_3a240a11`).
 *
 * Berkas uji, bukan bagian aplikasi. Disuntik lewat opsi `alias` esbuild saat
 * membangun harness, jadi berkas aplikasi tidak disentuh.
 *
 * Hanya memuat permukaan API yang benar-benar dipakai subtree `PublicLayout`:
 * `Head`, `Link`, `router`, `usePage` (dicek lewat
 * `grep -rn "from '@inertiajs/react'" resources/js/Layouts resources/js/Components`).
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const R = require('react');

export const kendali = {
    /** Catatan setiap panggilan router: {metode, url, data, opsi}. */
    kunjungan: [],
    /** Props halaman tiruan untuk `usePage()`. */
    halaman: { props: {} },
};

export const bersihkan = (halaman = { props: {} }) => {
    kendali.kunjungan.length = 0;
    kendali.halaman = halaman;
};

const catat = (metode, url, data, opsi) => {
    const kunjungan = { metode, url, data, opsi: opsi || {} };
    kendali.kunjungan.push(kunjungan);

    return kunjungan;
};

export const router = {
    get: (url, data, opsi) => catat('get', url, data, opsi),
    post: (url, data, opsi) => catat('post', url, data, opsi),
    put: (url, data, opsi) => catat('put', url, data, opsi),
    patch: (url, data, opsi) => catat('patch', url, data, opsi),
    delete: (url, data, opsi) => catat('delete', url, data, opsi),
    visit: (url, opsi) => catat('visit', url, null, opsi),
    reload: (opsi) => catat('reload', null, null, opsi),
};

export const usePage = () => kendali.halaman;

export const Link = ({ href, children, ...rest }) =>
    R.createElement('a', { href, ...rest }, children);

export const Head = () => null;

export const useForm = (awal = {}) => ({
    data: { ...(awal || {}) },
    errors: {},
    processing: false,
    recentlySuccessful: false,
    setData() {},
    reset() {},
    clearErrors() {},
    transform() {
        return this;
    },
    post() {},
    put() {},
    patch() {},
    delete() {},
});

export default { router, usePage, useForm, Link, Head };

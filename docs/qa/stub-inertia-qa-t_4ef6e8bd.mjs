/**
 * Stub `@inertiajs/react` untuk harness QA kartu t_4ef6e8bd (file uji, bukan bagian aplikasi).
 *
 * Harness merender komponen asli lewat `renderToStaticMarkup`, jadi tidak ada browser:
 * stub hanya perlu menyediakan permukaan API yang benar-benar dipakai halaman
 * (`Head`, `router`, `usePage`, `Link`) plus `useForm` minimal supaya impor tidak meledak.
 * Disuntik lewat opsi `alias` esbuild: {'@inertiajs/react': '<file ini>'}.
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

export const bersihkan = () => {
    kendali.kunjungan.length = 0;
    kendali.halaman = { props: {} };
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
    reload: (opsi) => catat('reload', null, null, opsi),
    visit: (url, opsi) => catat('visit', url, null, opsi),
};

export const usePage = () => kendali.halaman;

export const useForm = (awal = {}) => {
    const bentuk = {
        data: { ...(awal || {}) },
        errors: {},
        processing: false,
        setData(kunci, nilai) {
            if (kunci && typeof kunci === 'object') {
                Object.assign(bentuk.data, kunci);
            } else {
                bentuk.data[kunci] = nilai;
            }
        },
        reset: () => undefined,
        clearErrors: () => undefined,
        setError: () => undefined,
        transform: () => bentuk,
        post: (url, opsi) => catat('post', url, bentuk.data, opsi),
        put: (url, opsi) => catat('put', url, bentuk.data, opsi),
        patch: (url, opsi) => catat('patch', url, bentuk.data, opsi),
        delete: (url, opsi) => catat('delete', url, bentuk.data, opsi),
    };

    return bentuk;
};

export const Link = ({ href, children, ...sisa }) => R.createElement('a', { href, ...sisa }, children);
export const Head = () => null;
export const Deferred = ({ children }) => (typeof children === 'function' ? children() : children);
export const WhenVisible = ({ children }) => (typeof children === 'function' ? children() : children);
export const createInertiaApp = () => {
    throw new Error('createInertiaApp tidak dipakai di harness QA');
};

export default { router, usePage, useForm, Link, Head };

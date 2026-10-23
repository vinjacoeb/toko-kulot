/**
 * Stub '@inertiajs/react' untuk harness kartu t_321bf03c (file uji lokal).
 *
 * Mencatat setiap panggilan router, menyediakan useForm yang bisa dikendalikan uji
 * (processing/errors/onSuccess), dan usePage yang bisa diganti.
 * Dipakai lewat alias esbuild: --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const R = require('react');
const h = R.createElement;

export const kendali = {
    kunjungan: [],
    formulir: [],
    halaman: { props: {} },
    berikutnya: { processing: false, errors: {}, sukses: null },
};

export const bersihkan = () => {
    kendali.kunjungan.length = 0;
    kendali.formulir.length = 0;
    kendali.berikutnya = { processing: false, errors: {}, sukses: null };
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

/**
 * useForm tiruan: satu formulir aktif per harness (modal stok satu-satunya pemakai di
 * halaman ini). Data dan errors bertahan antar render pass; `processing` dibaca ulang tiap
 * pass dari `kendali.berikutnya.processsing` supaya uji bisa menyuntikkan jawaban server.
 */
export const useForm = (awal = {}) => {
    const nilaiAwal = { ...(awal || {}) };

    if (!kendali.formulir[0]) {
        const bentuk = {
            data: { ...nilaiAwal },
            errors: { ...kendali.berikutnya.errors },
            processing: Boolean(kendali.berikutnya.processing),
            __aksi: null,
            setData(kunci, nilai) {
                if (kunci && typeof kunci === 'object') {
                    Object.assign(bentuk.data, kunci);
                } else {
                    bentuk.data[kunci] = nilai;
                }

                return bentuk.data;
            },
        reset(...argumen) {
            if (argumen.length === 0) {
                bentuk.data = { ...nilaiAwal };
            } else if (argumen.length === 1 && argumen[0] && typeof argumen[0] === 'object') {
                bentuk.data = { ...argumen[0] };
            } else {
                argumen.forEach((nama) => {
                    bentuk.data[nama] = nilaiAwal[nama] ?? '';
                });
            }
        },
        clearErrors(...nama) {
            if (nama.length === 0) {
                bentuk.errors = {};
            } else {
                nama.forEach((kunci) => delete bentuk.errors[kunci]);
            }
        },
        setError(kunci, pesan) {
            bentuk.errors[kunci] = pesan;
        },
        transform(fn) {
            bentuk.__transform = fn;

            return bentuk;
        },
        post(url, opsi) {
            bentuk.__aksi = catat('post', url, { ...bentuk.data }, opsi);

            return bentuk.__aksi;
        },
        put(url, opsi) {
            bentuk.__aksi = catat('put', url, { ...bentuk.data }, opsi);

            return bentuk.__aksi;
        },
        patch(url, opsi) {
            bentuk.__aksi = catat('patch', url, { ...bentuk.data }, opsi);

            return bentuk.__aksi;
        },
        delete(url, opsi) {
            bentuk.__aksi = catat('delete', url, { ...bentuk.data }, opsi);

            return bentuk.__aksi;
        },
        };

        kendali.formulir[0] = bentuk;
    }

    const bentuk = kendali.formulir[0];
    // `errors` milik objek form (seperti Inertia asli: berubah saat server menjawab, reset,
    // atau clearErrors). Harness menyuntik galat server lewat kendali.formulir[0].errors.
    bentuk.processing = Boolean(kendali.berikutnya.processing);

    return bentuk;
};

export const Link = ({ href, children, ...sisa }) => h('a', { href, ...sisa }, children);
export const Head = () => null;
export const Deferred = ({ children }) => (typeof children === 'function' ? children() : children);
export const WhenVisible = ({ children }) => (typeof children === 'function' ? children() : children);
export const createInertiaApp = () => {
    throw new Error('createInertiaApp tidak dipakai di harness');
};

export default { router, usePage, useForm, Link, Head };

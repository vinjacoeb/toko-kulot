/**
 * Stub '@inertiajs/react' untuk harness SSR (tmp/render-produk-t_5988a39e.mjs).
 * Hanya permukaan yang dipakai halaman Admin/Products dan layout bersama.
 * Bukan bagian aplikasi; tidak masuk bundel rilis.
 */
import React from 'react';

export const kunjungan = { calls: [] };

export const Head = () => null;

const hrefDari = (href) => (typeof href === 'string' ? href : (href?.url ?? '#'));

export const Link = ({ href, children, ...rest }) =>
    React.createElement('a', { href: hrefDari(href), ...rest }, children);

export const router = {
    get: (url, data, opsi) => kunjungan.calls.push({ method: 'get', url, data, opsi }),
    post: (url, data, opsi) => kunjungan.calls.push({ method: 'post', url, data, opsi }),
    put: (url, data, opsi) => kunjungan.calls.push({ method: 'put', url, data, opsi }),
    patch: (url, data, opsi) => kunjungan.calls.push({ method: 'patch', url, data, opsi }),
    delete: (url, opsi) => kunjungan.calls.push({ method: 'delete', url, opsi }),
    reload: (opsi) => kunjungan.calls.push({ method: 'reload', opsi }),
    visit: (url, opsi) => kunjungan.calls.push({ method: 'visit', url, opsi }),
};

export const halamanStub = {
    props: { flash: {}, auth: { admin: { name: 'Admin Uji' } }, errors: {} },
    url: '/admin/produk',
    component: 'Admin/Products/Index',
};

export const usePage = () => halamanStub;

export const useForm = (awal = {}) => {
    const [data, setDataState] = React.useState({ ...awal });
    const [errors] = React.useState({});
    const transformRef = React.useRef(null);

    const setData = (key, value) => {
        setDataState((sebelumnya) => {
            if (typeof key === 'object' && key !== null) return { ...sebelumnya, ...key };

            return { ...sebelumnya, [key]: value };
        });
    };

    return {
        data,
        errors,
        processing: false,
        progress: null,
        wasSuccessful: false,
        recentlySuccessful: false,
        hasErrors: Object.keys(errors).length > 0,
        setData,
        transform: (fn) => {
            transformRef.current = fn;
        },
        post: (url, opsi) => kunjungan.calls.push({ method: 'post', url, opsi }),
        put: (url, opsi) => kunjungan.calls.push({ method: 'put', url, opsi }),
        patch: (url, opsi) => kunjungan.calls.push({ method: 'patch', url, opsi }),
        delete: (url, opsi) => kunjungan.calls.push({ method: 'delete', url, opsi }),
        reset: (...fields) =>
            setDataState((sebelumnya) => {
                if (fields.length === 0) return { ...awal };

                const berikut = { ...sebelumnya };
                fields.forEach((f) => {
                    berikut[f] = awal[f];
                });

                return berikut;
            }),
        clearErrors: () => {},
        setError: () => {},
    };
};

export const createInertiaApp = () => {
    throw new Error('createInertiaApp tidak dipakai di harness SSR.');
};

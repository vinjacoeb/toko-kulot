// Stub @inertiajs/react untuk harness verifikasi halaman Admin/Accounts/Index
// (tmp/accounts-tambah-harness.jsx). Bukan bagian aplikasi.
// Salinan pola tmp/inertia-stub-messages.jsx; URL halaman disesuaikan.
import React from 'react';

let pageProps = {
    errors: {},
    auth: { user: null, admin: null },
    flash: { success: null, error: null },
};

let formErrors = {};

export const __calls = [];
window.__calls = __calls;

export function __reset() {
    pageProps = { errors: {}, auth: { user: null, admin: null }, flash: { success: null, error: null } };
    formErrors = {};
    __calls.length = 0;
}

export function __setPageProps(next) {
    pageProps = { ...pageProps, ...next };
}

export function __setFormErrors(next) {
    formErrors = next;
}

export function usePage() {
    return { props: pageProps, url: '/admin/akun', component: 'Admin/Accounts/Index', version: null };
}

export function Head() {
    return null;
}

export function Link({ href, children, ...rest }) {
    return (
        <a href={typeof href === 'string' ? href : '#'} {...rest}>
            {children}
        </a>
    );
}

/** useForm tiruan yang stateful: cukup untuk mengisi form ubah kategori. */
export function useForm(initial = {}) {
    const [data, setDataState] = React.useState(initial);

    const setData = (key, value) => {
        if (typeof key === 'object' && key !== null) {
            setDataState((prev) => ({ ...prev, ...key }));

            return;
        }

        setDataState((prev) => ({ ...prev, [key]: value }));
    };

    return {
        data,
        setData,
        post: (url, options = {}) => {
            __calls.push({ kind: 'form.post', url, data: { ...data } });
            options.onSuccess?.();
        },
        put: (url) => __calls.push({ kind: 'form.put', url }),
        patch: (url) => __calls.push({ kind: 'form.patch', url }),
        delete: (url) => __calls.push({ kind: 'form.delete', url }),
        processing: false,
        errors: formErrors,
        hasErrors: Object.keys(formErrors).length > 0,
        reset: () => setDataState(initial),
        clearErrors: () => {},
        setError: () => {},
        transform: () => {},
    };
}

export const router = {
    get: (url, params, options = {}) => {
        __calls.push({ kind: 'router.get', url, params });
        options.onStart?.();
        options.onFinish?.();
    },
    post: (url, data, options = {}) => {
        __calls.push({ kind: 'router.post', url, data });
        options.onStart?.();
        options.onFinish?.();
    },
    patch: (url, data, options = {}) => {
        __calls.push({ kind: 'router.patch', url, data });
        options.onStart?.();
        options.onFinish?.();
    },
    put: (url) => __calls.push({ kind: 'router.put', url }),
    delete: (url, options = {}) => {
        __calls.push({ kind: 'router.delete', url });
        options.onStart?.();
        options.onSuccess?.();
        options.onFinish?.();
    },
    visit: (url) => __calls.push({ kind: 'router.visit', url }),
    reload: () => __calls.push({ kind: 'router.reload' }),
};

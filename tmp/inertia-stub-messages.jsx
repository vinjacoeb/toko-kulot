// Stub @inertiajs/react yang mencatat panggilan router/useForm, khusus harness
// verifikasi halaman Admin/Messages/Index (tmp/admin-messages-harness.jsx).
// Bukan bagian aplikasi: dipakai supaya aksi UI bisa diperiksa (URL, verb, payload).
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
    return { props: pageProps, url: '/admin/pesan-masuk', component: 'Admin/Messages/Index', version: null };
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

/** useForm tiruan yang stateful: cukup untuk memeriksa alur kirim balasan. */
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

        if (window.__failNextGet) {
            window.__failNextGet = false;
            options.onError?.({ status: 500, data: {} });
        }

        if (!window.__holdGet) options.onFinish?.();
    },
    post: (url, data, options = {}) => {
        __calls.push({ kind: 'router.post', url, data });
        options.onStart?.();
        options.onFinish?.();
    },
    patch: (url, data, options = {}) => {
        __calls.push({ kind: 'router.patch', url, data });
        options.onStart?.();

        if (window.__failNextPatch) {
            const status = window.__failNextPatch;
            window.__failNextPatch = null;

            // Inertia memanggil onHttpException; false = sudah ditangani halaman.
            const handled = options.onHttpException?.({ status, data: {} });

            if (handled === undefined) options.onError?.({ status, data: {} });
        }

        options.onFinish?.();
    },
    put: (url) => __calls.push({ kind: 'router.put', url }),
    delete: (url) => __calls.push({ kind: 'router.delete', url }),
    visit: (url) => __calls.push({ kind: 'router.visit', url }),
    reload: () => __calls.push({ kind: 'router.reload' }),
};

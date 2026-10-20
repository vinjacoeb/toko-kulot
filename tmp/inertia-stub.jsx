// Stub @inertiajs/react untuk verifikasi render statis halaman Public/Auth.
// Bukan bagian aplikasi: hanya dipakai harness tmp/verify-auth-render.mjs.
import React from 'react';

let pageProps = {
    errors: {},
    auth: { user: null, admin: null },
    cart: { count: 0 },
    flash: { success: null, error: null },
    meta: { description: null },
    settings: { store_name: 'Toko Kulot', store_logo: null, store_tagline: null },
};
let formErrors = {};

export function __reset() {
    pageProps = {
        errors: {},
        auth: { user: null, admin: null },
        cart: { count: 0 },
        flash: { success: null, error: null },
        meta: { description: null },
        settings: { store_name: 'Toko Kulot', store_logo: null, store_tagline: null },
    };
    formErrors = {};
}

export function __setPageProps(next) {
    pageProps = { ...pageProps, ...next };
}

export function __setFormErrors(next) {
    formErrors = next;
}

export function usePage() {
    return { props: pageProps, url: '/', component: '', version: null };
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

export function useForm(initial = {}) {
    return {
        data: initial,
        setData: () => {},
        post: () => {},
        put: () => {},
        patch: () => {},
        delete: () => {},
        processing: false,
        errors: formErrors,
        hasErrors: Object.keys(formErrors).length > 0,
        reset: () => {},
        clearErrors: () => {},
        setError: () => {},
        transform: () => {},
    };
}

export const router = { get: () => {}, post: () => {}, visit: () => {}, reload: () => {} };

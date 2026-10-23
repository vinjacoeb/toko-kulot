// Stub @inertiajs/react untuk harness verifikasi riwayat pesanan + menu profil
// (tmp/history-harness.jsx). Hanya alat verifikasi, bukan bagian aplikasi.
import React from 'react';

let pageProps = {
    errors: {},
    auth: { user: null, admin: null },
    settings: {},
    cart: { count: 0 },
    flash: null,
};

export const __calls = [];
window.__calls = __calls;

let lastGet = null;

export function __reset() {
    pageProps = {
        errors: {},
        auth: { user: null, admin: null },
        settings: {},
        cart: { count: 0 },
        flash: null,
    };
    __calls.length = 0;
    lastGet = null;
    window.__lastGet = null;
}

export function __setPageProps(next) {
    pageProps = { ...pageProps, ...next };
}

export function usePage() {
    return { props: pageProps, url: '/history', component: 'Public/History', version: null };
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

export const router = {
    visit: (url, options = {}) => {
        __calls.push({ kind: 'visit', url });
        options.onFinish?.();
    },
    post: (url, data = {}, options = {}) => {
        __calls.push({ kind: 'post', url, data });
        options.onFinish?.();
    },
    get: (url, data = {}, options = {}) => {
        __calls.push({ kind: 'get', url, data });
        lastGet = { url, data, options };
        window.__lastGet = lastGet;
    },
};

/** Selesaikan permintaan GET terakhir: status 500 → onHttpException, lalu onFinish. */
window.__selesaikanGet = (status = null) => {
    if (!lastGet) return false;

    if (status) lastGet.options.onHttpException?.({ status });
    lastGet.options.onFinish?.();

    return true;
};

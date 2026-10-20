// Stub @inertiajs/react untuk harness verifikasi nav admin (kartu t_6ee422f2).
// Bukan bagian aplikasi: hanya dipakai tmp/verify-admin-nav.mjs.
import React from 'react';

let currentUrl = '/admin';

export function __setUrl(url) {
    currentUrl = url;
}

export function usePage() {
    return {
        props: {
            errors: {},
            auth: { admin: { name: 'Admin Uji', email: 'admin@contoh.test' } },
            flash: { success: null, error: null },
        },
        url: currentUrl,
        component: 'Admin/Products/Index',
        version: null,
    };
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

export const router = { get: () => {}, post: () => {}, visit: () => {}, reload: () => {} };

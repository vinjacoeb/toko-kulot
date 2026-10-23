// Stub @inertiajs/react untuk harness verifikasi header/footer (kartu t_c915c033).
// Bukan bagian aplikasi: hanya dipakai tmp/verify-header-footer.mjs.
import React from 'react';

let currentProps = {
    settings: {},
    auth: { user: null },
    cart: { count: 0 },
    flash: { success: null, error: null },
    errors: {},
};

export function __setProps(next) {
    currentProps = next;
}

export function usePage() {
    return {
        props: currentProps,
        url: '/',
        component: 'Public/Home',
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

// Stub @inertiajs/react untuk harness SSR v1.3 (kartu t_e3c1f107). Alat verifikasi saja.
import React from 'react';

let pageProps = { errors: {}, auth: { user: null, admin: null }, settings: {}, cart: { count: 0 }, flash: null };

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
    visit: () => {},
    post: () => {},
    get: () => {},
    delete: () => {},
};

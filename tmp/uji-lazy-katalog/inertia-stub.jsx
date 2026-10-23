import React from 'react';

/**
 * Stub @inertiajs/react untuk uji browser katalog (/produk) tanpa server Laravel.
 * Bukan integrasi: hanya meniru kontrak router Inertia (get + only + callback) dan usePage.
 */

let pageProps = {};
let handler = null;
const listeners = new Set();

const emit = () => listeners.forEach((fn) => fn());

export function __setPageProps(next) {
    pageProps = next;
    emit();
}

export function __setHandler(fn) {
    handler = fn;
}

export function __getPageProps() {
    return pageProps;
}

export function usePage() {
    const [, force] = React.useReducer((x) => x + 1, 0);
    React.useEffect(() => {
        listeners.add(force);
        return () => listeners.delete(force);
    }, []);
    return { props: pageProps, url: '/produk' };
}

export function Head() {
    return null;
}

export function Link({ href, children, onClick, ...rest }) {
    return (
        <a href={typeof href === 'string' ? href : '/'} onClick={(event) => event.preventDefault()} {...rest}>
            {children}
        </a>
    );
}

export function useForm(initial = {}) {
    const [data, setData] = React.useState(initial);
    return {
        data,
        setData,
        post() {},
        put() {},
        patch() {},
        delete() {},
        get() {},
        processing: false,
        progress: null,
        errors: {},
        reset() {
            setData(initial);
        },
        clearErrors() {},
        recentlySuccessful: false,
    };
}

const call = (fn, ...args) => {
    if (typeof fn === 'function') fn(...args);
};

export const router = {
    get(url, data = {}, options = {}) {
        window.__req = window.__req || [];
        window.__req.push({ url: url, data: JSON.parse(JSON.stringify(data || {})) });
        call(options.onStart);
        const run = handler ? handler(data || {}, options) : Promise.resolve({ props: {} });
        Promise.resolve(run)
            .then((page) => {
                const merged = { ...pageProps, ...(page?.props ?? {}) };
                pageProps = merged;
                emit();
                call(options.onSuccess, { ...page, props: merged });
            })
            .catch(() => call(options.onError, {}))
            .finally(() => call(options.onFinish));
    },
    visit(url, options = {}) {
        call(options.onStart);
        call(options.onFinish);
    },
    post(url, data, options = {}) {
        call(options.onStart);
        call(options.onSuccess, { props: pageProps });
        call(options.onFinish);
    },
    reload(options = {}) {
        router.get('/produk', {}, options);
    },
    remember() {},
};

export function createInertiaApp() {
    return null;
}

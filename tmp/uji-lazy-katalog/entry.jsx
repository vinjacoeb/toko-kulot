import React from 'react';
import { createRoot } from 'react-dom/client';
import ProductsIndex from '../../resources/js/Pages/Public/Products/Index.jsx';
import { __setPageProps, usePage } from '@inertiajs/react';
import { __setHandler } from '@inertiajs/react';

/**
 * Harness uji lazy scroll /produk (kartu t_ed78d5c6).
 * Data contoh [CONTOH]; kontrak props mengikuti docs/kontrak-props.md §11.1 (products = paginator).
 */

const PER_PAGE = 12;
const TOTAL = 30;
const LATENCY = 120;

const CATEGORIES = [
    { id: 1, slug: 'daster', name: 'Daster' },
    { id: 2, slug: 'kulot', name: 'Kulot' },
];
const SIZES = ['S', 'M', 'L', 'XL'];

const IMAGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" fill="#e5e7eb"/><text x="50%" y="52%" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#6b7280">[CONTOH]</text></svg>`;
const IMAGE_SRC = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(IMAGE_SVG);

const PRODUCTS = Array.from({ length: TOTAL }, (_, index) => {
    const id = index + 1;
    const kategori = id % 2 === 0 ? CATEGORIES[1] : CATEGORIES[0];
    return {
        id,
        slug: `produk-contoh-${id}`,
        name: `Produk Contoh ${id} [CONTOH]`,
        // Sebagian harga sengaja string: server nyata bisa mengirim string (aturan standar implementasi).
        base_price: id % 3 === 0 ? String(89000 + id * 1000) : 89000 + id * 1000,
        wholesale_price: null,
        min_wholesale_qty: null,
        rating_avg: id % 4 === 0 ? null : 4.5,
        rating_count: id % 5 === 0 ? null : 12 + id,
        stock: id % 7 === 0 ? 0 : 8,
        images: [
            { path: IMAGE_SRC, alt: `Produk contoh ${id} [CONTOH]`, is_primary: true },
            { path: IMAGE_SRC, alt: '', is_primary: false },
        ],
        category: { name: kategori.name, slug: kategori.slug },
    };
});

/** Halaman 2 sengaja mengulang produk terakhir halaman 1 untuk menguji dedupe `id`. */
const OVERLAP_PAGE = 2;

function makePage(params = {}) {
    const page = Math.max(1, Number(params.page || 1));
    const kategori = params.kategori || '';
    const q = String(params.q || '').toLowerCase();

    const filtered = PRODUCTS.filter((product) => {
        const cocokKategori = !kategori || product.category.slug === kategori;
        const cocokCari = !q || product.name.toLowerCase().includes(q);
        return cocokKategori && cocokCari;
    });

    const total = filtered.length;
    const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));
    const start = (page - 1) * PER_PAGE;

    let data = filtered.slice(start, start + PER_PAGE);
    if (page === OVERLAP_PAGE && !kategori && !q && filtered.length > PER_PAGE) {
        data = [filtered[PER_PAGE - 1], ...data];
    }

    return {
        products: {
            data,
            current_page: page,
            last_page: lastPage,
            per_page: PER_PAGE,
            total,
        },
        categories: CATEGORIES,
        sizes: SIZES,
        filters: {
            q: params.q || '',
            kategori,
            ukuran: params.ukuran || '',
            harga_min: params.harga_min || '',
            harga_max: params.harga_max || '',
            urut: params.urut || 'terbaru',
        },
    };
}

const SETTINGS = {
    store_name: 'Toko Kulot [CONTOH]',
    store_tagline: 'Daster & kulot harian',
    contact_phone: null,
    contact_whatsapp: null,
    contact_email: null,
    contact_address: null,
    footer_links: [],
    footer_social: [],
};

let failNext = false;

__setHandler(
    (data) =>
        new Promise((resolve, reject) => {
            window.setTimeout(() => {
                if (failNext) {
                    failNext = false;
                    reject(new Error('jaringan uji gagal'));
                    return;
                }
                resolve({ props: makePage(data) });
            }, LATENCY);
        })
);

__setPageProps({ settings: SETTINGS, cartCount: 0, user: null, ...makePage({}), flash: null });

function App() {
    const page = usePage();
    return <ProductsIndex {...page.props} />;
}

createRoot(document.getElementById('app')).render(<App />);

const grid = () => Array.from(document.querySelectorAll('#konten-utama article'));
const links = () => Array.from(document.querySelectorAll('#konten-utama article a[href^="/produk/"]'));

window.__uji = {
    ready: false,
    failNext: () => {
        failNext = true;
    },
    count: () => grid().length,
    slugs: () => {
        const unique = new Set(links().map((a) => a.getAttribute('href')));
        return Array.from(unique);
    },
    itemIds: () => grid().map((card) => card.querySelector('h3')?.textContent?.trim() ?? ''),
    buttonLabel: () => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const target = buttons.find((button) => ['Muat lebih banyak', 'Coba lagi'].includes(button.textContent.trim()));
        return target ? target.textContent.trim() : null;
    },
    endMessage: () => document.body.textContent.includes('Semua produk sudah tampil'),
    counter: () => {
        const match = document.body.textContent.match(/Menampilkan\s+(\d+)\s+dari\s+(\d+)\s+produk/);
        return match ? { shown: Number(match[1]), total: Number(match[2]) } : null;
    },
    status: () => document.body.textContent.includes('Memuat produk…'),
    eagerImages: () => Array.from(document.querySelectorAll('#konten-utama article img')).filter((img) => img.loading === 'eager').length,
    lazyImages: () => Array.from(document.querySelectorAll('#konten-utama article img')).filter((img) => img.loading === 'lazy').length,
    setSort: (value) => {
        const select = document.getElementById('urutkan');
        const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        setter.call(select, value);
        select.dispatchEvent(new Event('change', { bubbles: true }));
    },
    scrollBottom: () => window.scrollTo(0, document.documentElement.scrollHeight),
    sentinelVisible: () => {
        const nodes = Array.from(document.querySelectorAll('#konten-utama [aria-hidden="true"]'));
        const sentinel = nodes.find((node) => node.className.includes('h-px'));
        if (!sentinel) return null;
        const rect = sentinel.getBoundingClientRect();
        return rect.top < window.innerHeight + 240;
    },
};

window.setTimeout(() => {
    window.__uji.ready = true;
}, 0);

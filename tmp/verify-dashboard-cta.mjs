// Harness verifikasi kartu t_099c813c: empty state grafik penjualan di Dashboard
// admin harus punya CTA "Tambah produk" -> /admin/produk/tambah (design §5.11),
// dan CTA itu HANYA boleh muncul pada state empty (bukan saat ada data / loading).
// Diperluas kartu t_8bca0661: saat galat halaman, blok grafik wajib menampilkan
// galat + "Coba lagi" (error per blok design §5.11), bukan empty state + CTA.
// Diperluas kartu t_950a38ca: tiga blok lain (stok kritis, pesanan terbaru,
// ulasan terbaru) juga wajib galat per blok + "Coba lagi", bukan empty state.
// Jalankan: node tmp/build-dashboard-cta-check.mjs && node tmp/verify-dashboard-cta.bundle.mjs
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Dashboard from '../resources/js/Pages/Admin/Dashboard.jsx';
import { __setUrl } from './inertia-stub-admin-nav.jsx';

const CTA_LABEL = 'Tambah produk';
const CTA_HREF = '/admin/produk/tambah';
const EMPTY_TITLE = 'Belum ada penjualan';
const RETRY_LABEL = 'Coba lagi';

let checks = 0;
let failures = 0;

const ok = (label) => {
    checks += 1;
    console.log(`  ok   ${label}`);
};

const fail = (label, detail) => {
    checks += 1;
    failures += 1;
    console.log(`  FAIL ${label}${detail ? ` -> ${detail}` : ''}`);
};

const assert = (condition, label, detail = null) => (condition ? ok(label) : fail(label, detail));

const textOf = (fragment) => fragment.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

/** Semua <a> pada markup: { href, class, text }. */
const anchors = (html) =>
    [...html.matchAll(/<a\s([^>]*)>([\s\S]*?)<\/a>/g)].map((match) => ({
        href: (/href="([^"]*)"/.exec(match[1]) ?? [])[1] ?? null,
        className: (/class="([^"]*)"/.exec(match[1]) ?? [])[1] ?? '',
        text: textOf(match[2]),
    }));

const render = (props) => {
    __setUrl('/admin');
    return renderToStaticMarkup(React.createElement(Dashboard, props));
};

const sales = (totals) => totals.map((total, index) => ({ date: `2026-10-${String(index + 1).padStart(2, '0')}`, total }));

const STATS = { revenue_total: 1250000, orders_pending: 3, orders_total: 12, products_active: 4 };

const scenario = (label, props) => {
    const html = render(props);
    const cta = anchors(html).filter((anchor) => anchor.text === CTA_LABEL);
    console.log(`\n${label}`);
    return { html, cta };
};

const checkNoNoise = (html, label) => {
    assert(!/NaN/.test(html), `${label}: tidak ada NaN di markup`);
    assert(!/undefined/.test(html), `${label}: tidak ada undefined di markup`);
    assert(!/\[CONTOH\]|lorem ipsum|Placeholder/i.test(html), `${label}: tidak ada teks placeholder`);
};

/** Grafik asli (ChartCard) memakai viewBox ini + label sumbu "Tertinggi". */
const hasChartGraphics = (html) => html.includes('viewBox="0 0 600 180"') || html.includes('Tertinggi');

/** Sub-markup blok grafik: dari judul ChartCard sampai section "Stok kritis" berikutnya. */
const chartBlock = (html) => {
    const start = html.indexOf('Penjualan 14 hari');
    if (start === -1) return '';
    const end = html.indexOf('Stok kritis', start);
    return end === -1 ? html.slice(start) : html.slice(start, end);
};

const occurrences = (html, needle) => html.split(needle).length - 1;

/** Sub-markup antar dua judul blok; endText null = sampai akhir markup. */
const blockBetween = (html, startText, endText = null) => {
    const start = html.indexOf(startText);
    if (start === -1) return '';
    if (!endText) return html.slice(start);
    const end = html.indexOf(endText, start + startText.length);
    return end === -1 ? html.slice(start) : html.slice(start, end);
};

/** Cuplikan teks agar detail kegagalan bisa dibaca di log. */
const snippet = (html) => textOf(html).slice(0, 200);

console.log('Harness Dashboard admin — CTA empty state grafik penjualan (t_099c813c)');
console.log('Design §5.11: empty = "Belum ada penjualan" + CTA tambah produk.\n');
console.log('1. State empty grafik');

// 1a. Tidak ada deret sama sekali.
{
    const { html, cta } = scenario('   (a) sales_14d = []', { stats: STATS, sales_14d: [], loading: false });
    assert(html.includes(EMPTY_TITLE), 'judul empty "Belum ada penjualan" tampil');
    assert(cta.length === 1, 'CTA "Tambah produk" muncul tepat 1 kali di grafik', `dapat ${cta.length}`);
    assert(cta[0]?.href === CTA_HREF, `CTA menunjuk ${CTA_HREF}`, `dapat ${cta[0]?.href ?? '(tidak ada)'}`);
    assert(/btn-secondary/.test(cta[0]?.className ?? ''), 'CTA memakai tombol variant secondary (design §406 EmptyState)', cta[0]?.className ?? '(tidak ada)');
    assert(/href="\/admin\/produk\/tambah"/.test(html), 'lihat juga pemeriksaan anchor (atribut href mentah)');
    assert(!hasChartGraphics(html), 'grafik tidak digambar saat tidak ada data');
    checkNoNoise(html, 'empty (a)');
}

// 1b. Deret ada tapi semua nol -> tetap empty (ChartCard: maxValue 0 => bukan data).
{
    const { html, cta } = scenario('   (b) sales_14d = 14 hari semua total 0', {
        stats: STATS,
        sales_14d: sales(Array.from({ length: 14 }, () => 0)),
        loading: false,
    });
    assert(html.includes(EMPTY_TITLE), 'judul empty "Belum ada penjualan" tampil');
    assert(cta.length === 1, 'CTA "Tambah produk" muncul tepat 1 kali', `dapat ${cta.length}`);
    assert(cta[0]?.href === CTA_HREF, `CTA menunjuk ${CTA_HREF}`, `dapat ${cta[0]?.href ?? '(tidak ada)'}`);
    assert(!hasChartGraphics(html), 'grafik tidak digambar saat semua nol');
    checkNoNoise(html, 'empty (b)');
}

// 1c. Angka dari server sebagai string (kontrak: nilai bisa string).
{
    const { html, cta } = scenario('   (c) sales_14d = 14 hari total "0" (string dari server)', {
        stats: { revenue_total: '0', orders_pending: '0', orders_total: '0', products_active: '4' },
        sales_14d: sales(Array.from({ length: 14 }, () => '0')),
        loading: false,
    });
    assert(html.includes(EMPTY_TITLE), 'judul empty "Belum ada penjualan" tampil');
    assert(cta.length === 1, 'CTA "Tambah produk" muncul tepat 1 kali', `dapat ${cta.length}`);
    checkNoNoise(html, 'empty (c)');
}

console.log('\n2. State ada data (CTA tidak boleh tampil)');
{
    const { html, cta } = scenario('   sales_14d = 14 hari dengan penjualan', {
        stats: STATS,
        sales_14d: sales([0, 250000, 175000, null, 320000, 90000, 0, 410000, 275000, 120000, 98000, 260000, 331000, 155000]),
        loading: false,
    });
    assert(!html.includes(EMPTY_TITLE), 'judul empty tidak tampil saat ada data');
    assert(cta.length === 0, 'CTA "Tambah produk" TIDAK tampil saat ada data', `dapat ${cta.length}`);
    assert(hasChartGraphics(html), 'grafik digambar saat ada data');
    assert(html.includes('Tertinggi'), 'label ringkasan sumbu tampil');
    checkNoNoise(html, 'ada data');
}

console.log('\n3. State loading (skeleton, belum ada CTA)');
{
    const { html, cta } = scenario('   loading = true', { stats: null, sales_14d: null, loading: true });
    assert(cta.length === 0, 'CTA "Tambah produk" TIDAK tampil saat loading', `dapat ${cta.length}`);
    assert(!html.includes(EMPTY_TITLE), 'judul empty tidak tampil saat loading');
    checkNoNoise(html, 'loading');
}

console.log('\n4. State error halaman — error per blok (design §5.11, kartu t_8bca0661 + t_950a38ca)');
{
    const { html, cta } = scenario('   error = "koneksi gagal"', {
        stats: null,
        sales_14d: null,
        loading: false,
        error: 'koneksi gagal',
    });
    assert(html.includes('Gagal memuat ringkasan'), 'galat tampil sebagai ErrorState di dalam layout');
    assert(html.includes('koneksi gagal'), 'pesan galat dari server ditampilkan apa adanya');

    const chart = chartBlock(html);
    const retryCount = occurrences(html, RETRY_LABEL);
    const retryButtons = occurrences(html, `<span>${RETRY_LABEL}</span>`);
    const retryLinks = anchors(html).filter((anchor) => anchor.text === RETRY_LABEL);
    const chartAnchors = anchors(chart);

    assert(chart.length > 0, 'blok grafik dapat diisolasi dari markup untuk diperiksa');
    assert(chart.includes('Gagal memuat grafik'), 'blok grafik menampilkan galat sendiri, bukan empty state', snippet(chart));
    assert(chart.includes('koneksi gagal'), 'pesan galat halaman tampil juga di blok grafik');
    assert(chart.includes(RETRY_LABEL), `blok grafik punya aksi "${RETRY_LABEL}" (onRetry diteruskan)`, snippet(chart));
    assert(retryCount === 5, `"${RETRY_LABEL}" tampil 5 kali: ringkasan halaman + 4 blok (grafik, stok kritis, pesanan, ulasan)`, `dapat ${retryCount}`);
    assert(retryButtons === 5, `kelima aksi "${RETRY_LABEL}" dirender sebagai tombol (bukan tautan)`, `dapat ${retryButtons}`);
    assert(retryLinks.length === 0, `tidak ada "${RETRY_LABEL}" berbentuk tautan tanpa aksi`, `dapat ${retryLinks.length}`);
    assert(occurrences(html, 'Gagal memuat data') === 3, 'tiga blok (stok kritis, pesanan terbaru, ulasan terbaru) memakai judul galat baku "Gagal memuat data" (design §442)', `dapat ${occurrences(html, 'Gagal memuat data')}`);
    assert(!chart.includes(EMPTY_TITLE), `judul empty "${EMPTY_TITLE}" TIDAK tampil saat galat`, snippet(chart));
    assert(cta.length === 0, `CTA "${CTA_LABEL}" TIDAK tampil saat galat (galat bukan data kosong)`, `dapat ${cta.length}`);
    assert(!hasChartGraphics(chart), 'grafik tidak digambar saat galat');
    assert(chartAnchors.length === 0, 'blok grafik pada state galat tidak menyisakan tautan CTA/empty', `dapat ${chartAnchors.length}`);
    assert(!/<svg[^>]*viewBox="0 0 600 180"/.test(chart), 'tidak ada grafik kosong yang menyesatkan di blok grafik');
    checkNoNoise(html, 'error');
}

// 4b. Kartu t_950a38ca: tiga blok lain juga error per blok, bukan empty state.
console.log('\n4b. Tiga blok lain pada state galat (kartu t_950a38ca)');
{
    const { html } = scenario('   error = "koneksi gagal" (blok diisolasi satu per satu)', {
        stats: null,
        sales_14d: null,
        low_stock: null,
        recent_orders: null,
        recent_reviews: null,
        loading: false,
        error: 'koneksi gagal',
    });

    const blocks = [
        { label: 'Stok kritis', start: 'Stok kritis', end: 'Pesanan terbaru', emptyTitle: 'Stok aman', bodyMarkup: '<ul' },
        { label: 'Pesanan terbaru (DataTable)', start: 'Pesanan terbaru', end: 'Ulasan terbaru', emptyTitle: 'Belum ada pesanan', bodyMarkup: '<table' },
        { label: 'Ulasan terbaru', start: 'Ulasan terbaru', end: null, emptyTitle: 'Belum ada ulasan', bodyMarkup: '<ul' },
    ];

    blocks.forEach(({ label, start, end, emptyTitle, bodyMarkup }) => {
        const block = blockBetween(html, start, end);

        assert(block.length > 0, `blok "${label}" dapat diisolasi dari markup`, snippet(block));
        assert(block.includes('role="alert"'), `blok "${label}" merender ErrorState (role="alert")`, snippet(block));
        assert(block.includes('Gagal memuat data'), `blok "${label}" menampilkan judul galat baku, bukan empty state`, snippet(block));
        assert(block.includes('koneksi gagal'), `pesan galat halaman tampil di blok "${label}"`);
        assert(block.includes(RETRY_LABEL), `blok "${label}" punya aksi "${RETRY_LABEL}" (onRetry diteruskan)`, snippet(block));
        assert(!block.includes(emptyTitle), `empty state "${emptyTitle}" TIDAK tampil di blok "${label}" saat galat`, snippet(block));
        assert(!block.includes(bodyMarkup), `blok "${label}" tidak menggambar daftar/tabel data saat galat`, snippet(block));
        assert(anchors(block).length === 0, `blok "${label}" tidak menyisakan tautan (termasuk CTA empty state)`, snippet(block));
    });

    console.log(`   cuplikan blok stok kritis    : ${snippet(blockBetween(html, 'Stok kritis', 'Pesanan terbaru'))}`);
    console.log(`   cuplikan blok pesanan        : ${snippet(blockBetween(html, 'Pesanan terbaru', 'Ulasan terbaru'))}`);
    console.log(`   cuplikan blok ulasan         : ${snippet(blockBetween(html, 'Ulasan terbaru', null))}`);
}

console.log('\n5. Interaksi tombol lain tidak ikut berubah');
{
    const { html } = scenario('   empty state lain (stok/pesanan/ulasan)', { stats: STATS, sales_14d: [], loading: false });
    assert(html.includes('Stok aman'), 'empty state "Stok aman" (stok kritis) tetap ada');
    assert(html.includes('Belum ada pesanan'), 'empty state "Belum ada pesanan" tetap ada');
    assert(html.includes('Belum ada ulasan'), 'empty state "Belum ada ulasan" tetap ada');
    assert(html.includes('Muat ulang'), 'aksi "Muat ulang" di PageHeader tetap ada');
    assert(anchors(html).every((anchor) => anchor.text !== 'Muat ulang'), 'aksi "Muat ulang" tetap tombol, bukan tautan');
    const sameLabel = anchors(html).filter((anchor) => anchor.text === CTA_LABEL);
    assert(sameLabel.length === 1, `label "${CTA_LABEL}" hanya muncul sekali di halaman`, `dapat ${sameLabel.length}`);
}

console.log(`\nHASIL: ${checks - failures}/${checks} lulus, ${failures} gagal`);
process.exit(failures === 0 ? 0 : 1);

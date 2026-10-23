/**
 * Harness verifikasi kartu t_e60e7733 (F2 — penanda mode uji + hitung mundur).
 * File uji lokal (bukan bagian aplikasi). Perintah yang benar-benar dijalankan:
 *   ./node_modules/@esbuild/win32-x64/esbuild.exe tmp/uji-ssr-midtrans-t_e60e7733.mjs --bundle \
 *     --platform=node --format=esm --jsx=automatic --packages=external \
 *     --outfile=tmp/uji-ssr-midtrans-t_e60e7733.bundle.mjs \
 *     --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs
 *   node tmp/uji-ssr-midtrans-t_e60e7733.bundle.mjs
 * `--packages=external` wajib supaya react-dom/server bisa require bawaan Node.
 * Stub Inertia dipakai bersama harness kartu t_321bf03c (router + useForm + usePage).
 *
 * Catatan: `window` disuntik minimal sebelum impor halaman admin, karena tab awal
 * `Admin/Settings/Index` dibaca dari query string (`readTabFromUrl`).
 */
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const ALASAN_UJI =
    'MODE UJI aktif karena MIDTRANS_FAKE=true di .env: QRIS dibuat lokal (tanpa Midtrans) sehingga tidak bisa ditransfer.';
const LANGKAH_UJI = [
    'Ubah MIDTRANS_FAKE=false pada berkas .env.',
    'Isi MIDTRANS_CLIENT_KEY dan MIDTRANS_SERVER_KEY dari dashboard Midtrans.',
    'Jalankan php artisan config:clear, lalu muat ulang halaman pembayaran.',
];
const CATATAN_ADMIN =
    'Kredensial efektif dibaca dari .env (MIDTRANS_*); kolom Midtrans pada tab Pembayaran admin belum dipakai jalur pembayaran ini.';
const GALAT_BAYAR =
    'Permintaan ke Midtrans gagal (HTTP 500) — periksa <b>server key</b> dan koneksi keluar server.';

globalThis.window = {
    location: {
        pathname: '/admin/pengaturan',
        search: '?tab=pembayaran',
        href: 'http://127.0.0.1:8000/admin/pengaturan?tab=pembayaran',
    },
    addEventListener() {},
    removeEventListener() {},
    scrollTo() {},
};

const { bersihkan, kendali } = await import('./stub-inertia-t_321bf03c.mjs');
const QrisPanel = (await import('../resources/js/Components/QrisPanel.jsx')).default;
const Countdown = (await import('../resources/js/Components/Countdown.jsx')).default;
const CheckoutPay = (await import('../resources/js/Pages/Public/CheckoutPay.jsx')).default;
const SettingsIndex = (await import('../resources/js/Pages/Admin/Settings/Index.jsx')).default;
const { midtransMode } = await import('../resources/js/lib/midtrans.js');

const AKAR = process.cwd();
const hasil = [];
const bukti = [];
const uji = (nama, fn) => {
    try {
        const catatan = fn();
        hasil.push({ status: 'OK', nama });
        bukti.push(`[OK]    ${nama}${catatan ? ` — ${catatan}` : ''}`);
    } catch (galat) {
        hasil.push({ status: 'GAGAL', nama, pesan: galat.message });
        bukti.push(`[GAGAL] ${nama} — ${galat.message}`);
    }
};
const harus = (kondisi, pesan) => {
    if (!kondisi) throw new Error(pesan);
};
const teks = (markup) =>
    String(markup ?? '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&#x27;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/\s+/g, ' ')
        .trim();
const POTONGAN_KOTOR = ['undefined', 'NaN', '[object Object]', 'lorem ipsum', '[Grafik Placeholder]', 'TODO:', 'FIXME'];
const kotor = (markup) => POTONGAN_KOTOR.filter((potongan) => String(markup).includes(potongan));
const render = (Komponen, props = {}) => {
    bersihkan();

    return renderToStaticMarkup(React.createElement(Komponen, props));
};
const MODE_UJI = {
    client_key: null,
    is_production: false,
    fake: true,
    mode: 'uji',
    alasan_kode: 'fake_aktif',
    alasan: ALASAN_UJI,
    langkah_perbaikan: LANGKAH_UJI,
    server_key_terisi: false,
    sumber_kredensial: '.env (MIDTRANS_*)',
    catatan: CATATAN_ADMIN,
};
const MODE_ASLI = {
    client_key: 'SB-Mid-client-CONTOH',
    is_production: false,
    fake: false,
    mode: 'asli',
    alasan_kode: null,
    alasan: null,
    langkah_perbaikan: [],
    server_key_terisi: true,
    sumber_kredensial: '.env (MIDTRANS_*)',
    catatan: CATATAN_ADMIN,
};
const menitKeDepan = (menit, detikTambahan = 0) => new Date(Date.now() + menit * 60_000 + detikTambahan * 1000).toISOString();
const PESANAN = { id: 91, code: 'INV-2026-0091', total: '149000', status: 'pending' };
const PEMBAYARAN = {
    status: 'pending',
    qr_string: '00020101021226610014ID.CO.QRIS.WWW01189360091400000000000215',
    qris_url: null,
    gross_amount: '149000',
    expires_at: menitKeDepan(4, 30),
    paid_at: null,
    galat: null,
};
const PENGATURAN = {
    umum: {},
    header: {},
    footer: {},
    kontak: {},
    seo: {},
    pembayaran: { shipping_cost_default: '20000', midtrans_client_key: '', midtrans_is_production: false },
};

// ── A. helper midtransMode ────────────────────────────────────────────────────────────────
uji('A1 midtransMode: mode uji lengkap', () => {
    const mode = midtransMode(MODE_UJI);
    harus(mode.uji === true, 'uji harus true');
    harus(mode.alasan === ALASAN_UJI, 'alasan harus diteruskan apa adanya');
    harus(mode.langkah.length === 3, `langkah harus 3, dapat ${mode.langkah.length}`);
    harus(mode.catatan === CATATAN_ADMIN, 'catatan harus diteruskan');

    return 'uji=true, alasan & 3 langkah terisi';
});
uji('A2 midtransMode: mode asli menihilkan alasan/langkah', () => {
    const mode = midtransMode(MODE_ASLI);
    harus(mode.uji === false, 'uji harus false');
    harus(mode.alasan === null && mode.langkah.length === 0, 'alasan/langkah harus kosong di mode asli');

    return 'alasan=null, langkah=[]';
});
uji('A3 midtransMode: fake sebagai string "true" tetap terbaca uji', () => {
    const mode = midtransMode({ ...MODE_UJI, mode: undefined, fake: 'true' });
    harus(mode.uji === true, 'fake="true" harus terbaca uji');

    return 'fake="true" → uji=true';
});
uji('A4 midtransMode: prop null / bukan objek tidak melempar', () => {
    const a = midtransMode(null);
    const b = midtransMode('bukan-objek');
    harus(a.uji === false && b.uji === false, 'keduanya harus false');
    harus(a.alasan === null && b.catatan === null, 'teks harus null');
    harus(a.diketahui === false && b.diketahui === false, 'mode tidak boleh dianggap diketahui');

    return 'null & string → uji=false, diketahui=false tanpa galat';
});
uji('A5 midtransMode: alasan kosong/spasi jadi null (anti "undefined" di layar)', () => {
    const mode = midtransMode({ ...MODE_UJI, alasan: '   ', langkah_perbaikan: [null, '', 'ok'] });
    harus(mode.alasan === null, 'alasan spasi harus null');
    harus(mode.langkah.length === 1, `langkah tak sah harus tersaring, dapat ${mode.langkah.length}`);

    return 'alasan=null, langkah tersaring → 1';
});
uji('A6 midtransMode: `diketahui` hanya true bila server benar-benar menyebut mode', () => {
    const kosong = midtransMode({});
    const asli = midtransMode({ fake: false });
    const ujiKode = midtransMode({ mode: 'uji' });
    const asing = midtransMode({ mode: 'sandbox' });
    harus(kosong.diketahui === false, 'objek kosong tidak diketahui');
    harus(asli.diketahui === true && asli.uji === false, 'fake=false → diketahui, mode asli');
    harus(ujiKode.diketahui === true && ujiKode.uji === true, 'mode=uji → diketahui + uji');
    harus(asing.diketahui === false, 'mode asing tidak dianggap diketahui');

    return '{} & mode asing → diketahui=false; fake=false & mode=uji → true';
});

// ── B. Countdown ──────────────────────────────────────────────────────────────────────────
uji('B1 Countdown: 5 menit → warna normal `text-ink-soft`, tanpa denyut', () => {
    const markup = render(Countdown, { expiresAt: menitKeDepan(5) });
    harus(markup.includes('text-ink-soft'), 'harus text-ink-soft');
    harus(!markup.includes('text-danger') && !markup.includes('animate-pulse'), 'tidak boleh danger/pulse');

    return 'text-ink-soft';
});
uji('B2 Countdown: 2 menit 58 detik → `text-danger` + `animate-pulse` + `motion-reduce:animate-none`', () => {
    const markup = render(Countdown, { expiresAt: menitKeDepan(2, 58) });
    harus(markup.includes('text-danger '), 'harus text-danger');
    harus(markup.includes('animate-pulse'), 'harus animate-pulse');
    harus(markup.includes('motion-reduce:animate-none'), 'harus hormati prefers-reduced-motion');
    harus(teks(markup).includes('02:5'), `sisa waktu harus terlihat, dapat ${teks(markup)}`);

    return 'text-danger + animate-pulse + motion-reduce:animate-none, sisa 02:5x';
});
uji('B3 Countdown: 3 menit 2 detik → masih normal (ambang kurang dari 3 menit)', () => {
    const markup = render(Countdown, { expiresAt: menitKeDepan(3, 2) });
    harus(markup.includes('text-ink-soft'), 'harus masih normal');
    harus(!markup.includes('animate-pulse'), 'belum boleh denyut');

    return 'text-ink-soft di 03:0x';
});
uji('B4 Countdown: lewat waktu → `Kedaluwarsa` + `text-danger-strong`', () => {
    const markup = render(Countdown, { expiresAt: new Date(Date.now() - 5000).toISOString() });
    harus(teks(markup).includes('Kedaluwarsa'), 'harus menampilkan Kedaluwarsa');
    harus(markup.includes('text-danger-strong'), 'harus text-danger-strong');
    harus(!markup.includes('animate-pulse'), 'denyut harus berhenti');

    return 'Kedaluwarsa + text-danger-strong';
});
uji('B5 Countdown: waktu sisa terbaca screen reader (bukan hanya label)', () => {
    const markup = render(Countdown, { expiresAt: menitKeDepan(2, 58) });
    harus(/Sisa waktu( pembayaran)? 02:5\d/.test(teks(markup)), `sr-only harus memuat sisa waktu, dapat ${teks(markup)}`);

    return 'sr-only memuat sisa waktu (02:5x)';
});
uji('B6 Countdown: `expires_at` null / tidak sah → tidak dirender, tanpa NaN', () => {
    const a = render(Countdown, { expiresAt: null });
    const b = render(Countdown, { expiresAt: 'bukan-tanggal' });
    harus(a === '' && b === '', `dua-duanya harus kosong, dapat "${a}" / "${b}"`);

    return "'' untuk null & 'bukan-tanggal'";
});

// ── C. QrisPanel ──────────────────────────────────────────────────────────────────────────
uji('C1 QrisPanel pending + mode uji: penanda "Mode uji" + alasan + langkah perbaikan di atas QR', () => {
    const markup = render(QrisPanel, { status: 'pending', qrString: PEMBAYARAN.qr_string, orderCode: PESANAN.code, total: PESANAN.total, expiresAt: PEMBAYARAN.expires_at, midtrans: MODE_UJI });
    const isi = teks(markup);
    harus(isi.includes('Mode uji'), 'penanda Mode uji harus ada');
    harus(isi.includes(ALASAN_UJI), 'alasan server harus tampil apa adanya');
    harus(isi.includes('Langkah perbaikan untuk pemilik:'), 'label langkah perbaikan harus ada (kartu F2 butir a)');
    harus(markup.includes('<ol'), 'langkah perbaikan harus berupa daftar bernomor');
    LANGKAH_UJI.forEach((langkah) => harus(isi.includes(langkah), `langkah "${langkah}" harus tampil apa adanya`));
    harus(markup.includes('<svg'), 'kode QR tetap dirender');
    harus(/0[0-4]:[0-5]\d/.test(isi), `hitung mundur harus tampil, dapat ${isi}`);
    harus(isi.indexOf(ALASAN_UJI) < isi.indexOf('Kode pesanan'), 'penanda harus di atas kode QR');

    return 'penanda + alasan + 3 langkah tampil di atas QR, hitung mundur tetap ada';
});
uji('C2 QrisPanel pending + mode asli: tanpa penanda apa pun', () => {
    const markup = render(QrisPanel, { status: 'pending', qrString: PEMBAYARAN.qr_string, orderCode: PESANAN.code, total: PESANAN.total, expiresAt: PEMBAYARAN.expires_at, midtrans: MODE_ASLI });
    harus(!teks(markup).includes('Mode uji'), 'penanda tidak boleh dirender saat fake=false');

    return 'tidak ada teks "Mode uji"';
});
uji('C3 QrisPanel tanpa prop midtrans: tidak melempar & tanpa penanda', () => {
    const markup = render(QrisPanel, { status: 'pending', qrString: PEMBAYARAN.qr_string, orderCode: PESANAN.code, total: PESANAN.total, expiresAt: PEMBAYARAN.expires_at });
    harus(!teks(markup).includes('Mode uji'), 'tanpa prop tidak ada penanda');
    harus(kotor(markup).length === 0, `tidak boleh ada penanda kotor: ${kotor(markup).join(', ')}`);

    return 'render normal, 0 penanda kotor';
});
uji('C4 QrisPanel state error + asli: hitung mundur tetap jalan (design §4.4)', () => {
    const markup = render(QrisPanel, { status: 'error', qrString: PEMBAYARAN.qr_string, orderCode: PESANAN.code, total: PESANAN.total, expiresAt: PEMBAYARAN.expires_at, midtrans: MODE_ASLI });
    const isi = teks(markup);
    harus(/0[0-4]:[0-5]\d/.test(isi), `hitung mundur harus tampil di state error, dapat ${isi}`);
    harus(isi.includes('Gagal memeriksa status pembayaran'), 'pesan galat harus tetap ada');
    harus(isi.includes('Coba lagi'), 'tombol Coba lagi harus tetap ada');

    return 'hitung mundur + pesan galat + Coba lagi';
});
uji('C5 QrisPanel state error + mode uji: penanda tetap tampil (QR belum hilang)', () => {
    const markup = render(QrisPanel, { status: 'error', qrString: PEMBAYARAN.qr_string, orderCode: PESANAN.code, total: PESANAN.total, expiresAt: PEMBAYARAN.expires_at, midtrans: MODE_UJI });
    harus(teks(markup).includes('Mode uji'), 'penanda harus tetap tampil');

    return 'penanda Mode uji tampil';
});
uji('C6 QrisPanel checking + mode uji: penanda tampil, spinner ada', () => {
    const markup = render(QrisPanel, { status: 'checking', qrString: PEMBAYARAN.qr_string, orderCode: PESANAN.code, total: PESANAN.total, expiresAt: PEMBAYARAN.expires_at, midtrans: MODE_UJI });
    const isi = teks(markup);
    harus(isi.includes('Mode uji'), 'penanda harus tampil');
    harus(isi.includes('Memeriksa status pembayaran'), 'teks memeriksa harus ada');
    harus(markup.includes('animate-spin'), 'spinner harus ada');

    return 'penanda + spinner';
});
uji('C7 QrisPanel paid/expired: penanda tidak muncul (QR sudah tidak ditampilkan)', () => {
    const paid = render(QrisPanel, { status: 'paid', orderCode: PESANAN.code, total: PESANAN.total, paidAt: menitKeDepan(1), midtrans: MODE_UJI, successHref: '/checkout/91/selesai' });
    const expired = render(QrisPanel, { status: 'expired', orderCode: PESANAN.code, total: PESANAN.total, reason: 'expire', midtrans: MODE_UJI });
    harus(teks(paid).includes('Pembayaran diterima') && !teks(paid).includes('Mode uji'), 'paid: tanpa penanda');
    harus(teks(expired).includes('Pembayaran tidak selesai') && !teks(expired).includes('Mode uji'), 'expired: tanpa penanda');

    return 'paid & expired bersih dari penanda';
});
uji('C8 QrisPanel mode uji tanpa `alasan` (bentuk menyimpang): pakai kalimat cadangan, tanpa "undefined"', () => {
    const markup = render(QrisPanel, { status: 'pending', qrString: PEMBAYARAN.qr_string, orderCode: PESANAN.code, total: PESANAN.total, expiresAt: PEMBAYARAN.expires_at, midtrans: { ...MODE_UJI, alasan: null } });
    const isi = teks(markup);
    harus(isi.includes('Mode uji'), 'penanda harus tetap ada');
    harus(isi.includes('tidak bisa ditransfer'), 'kalimat cadangan harus muncul');
    harus(!isi.includes('undefined'), 'tidak boleh ada undefined');

    return 'kalimat cadangan tampil, tanpa undefined';
});
uji('C9 QrisPanel: angka dari server sebagai string tetap diformat, nilai kosong jadi "-"', () => {
    const markup = render(QrisPanel, { status: 'pending', orderCode: null, total: null, qrString: null, midtrans: MODE_ASLI });
    const isi = teks(markup);
    harus(isi.includes('Kode pesanan -'), `kode kosong harus "-", dapat ${isi}`);
    harus(!isi.includes('Rp') || !isi.includes('NaN'), 'tanpa NaN');
    harus(kotor(markup).length === 0, `penanda kotor: ${kotor(markup).join(', ')}`);

    return 'kode "-", 0 penanda kotor';
});
uji('C10 QrisPanel: langkah_perbaikan kosong / berisi nilai tak sah → tanpa daftar, tanpa "undefined"', () => {
    const kosong = render(QrisPanel, { status: 'pending', qrString: PEMBAYARAN.qr_string, orderCode: PESANAN.code, total: PESANAN.total, midtrans: { ...MODE_UJI, langkah_perbaikan: [] } });
    const aneh = render(QrisPanel, { status: 'pending', qrString: PEMBAYARAN.qr_string, orderCode: PESANAN.code, total: PESANAN.total, midtrans: { ...MODE_UJI, langkah_perbaikan: [null, '   ', 7] } });
    harus(teks(kosong).includes('Mode uji') && !kosong.includes('<ol') && !teks(kosong).includes('Langkah perbaikan'), 'langkah kosong: penanda tetap ada tanpa daftar');
    harus(teks(aneh).includes('Mode uji') && !aneh.includes('<ol'), 'langkah tak sah: tanpa daftar');
    harus(teks(aneh).includes('Langkah perbaikan') === false, 'label langkah tidak boleh tampil tanpa isi sah');
    harus(kotor(aneh).length === 0, `penanda kotor: ${kotor(aneh).join(', ')}`);

    return 'langkah [] & [null, "   ", 7] → tanpa <ol>, tanpa undefined';
});
uji('C11 QrisPanel: `pembayaran.galat` (kontrak §7.7) tampil apa adanya di atas QR, teks di-escape', () => {
    const markup = render(QrisPanel, { status: 'pending', qrString: PEMBAYARAN.qr_string, orderCode: PESANAN.code, total: PESANAN.total, expiresAt: PEMBAYARAN.expires_at, galat: GALAT_BAYAR, midtrans: MODE_UJI });
    const isi = teks(markup);
    harus(isi.includes('Pembayaran QRIS bermasalah'), 'judul galat harus ada');
    harus(isi.includes(GALAT_BAYAR), 'teks galat server harus tampil apa adanya');
    harus(markup.includes('&lt;b&gt;server key&lt;/b&gt;') && !markup.includes('<b>server key</b>'), 'teks galat harus di-escape, bukan HTML');
    harus(isi.includes('Mode uji'), 'penanda mode uji tetap tampil');
    harus(isi.indexOf('Permintaan ke Midtrans gagal') < isi.indexOf('Mode uji'), 'galat ditampilkan di atas penanda mode uji');

    return 'galat apa adanya (ter-escape) di atas penanda mode uji';
});
uji('C12 QrisPanel: `galat` null / kosong / bukan teks → tidak ada notice galat', () => {
    const samaran = [null, '', '   ', 0, {}, []].map((nilai) => teks(render(QrisPanel, { status: 'pending', qrString: PEMBAYARAN.qr_string, orderCode: PESANAN.code, total: PESANAN.total, galat: nilai, midtrans: MODE_ASLI })));
    samaran.forEach((isi, index) => harus(!isi.includes('Pembayaran QRIS bermasalah'), `nilai ke-${index} tidak boleh memunculkan galat`));

    return '6 bentuk kosong → 0 notice galat';
});

// ── D. CheckoutPay ────────────────────────────────────────────────────────────────────────
uji('D1 CheckoutPay: prop `midtrans` diteruskan ke QrisPanel', () => {
    const markup = render(CheckoutPay, { pesanan: PESANAN, pembayaran: PEMBAYARAN, midtrans: MODE_UJI });
    const isi = teks(markup);
    harus(isi.includes('Selesaikan Pembayaran'), 'panel QRIS harus dirender');
    harus(isi.includes('Mode uji') && isi.includes(ALASAN_UJI), 'penanda + alasan harus terlihat pembeli');
    harus(kotor(markup).length === 0, `penanda kotor: ${kotor(markup).join(', ')}`);

    return 'penanda + alasan tampil di halaman bayar';
});
uji('D2 CheckoutPay: tanpa prop `midtrans` tetap render, tanpa penanda', () => {
    const markup = render(CheckoutPay, { pesanan: PESANAN, pembayaran: PEMBAYARAN });
    harus(teks(markup).includes('Selesaikan Pembayaran'), 'halaman harus tetap render');
    harus(!teks(markup).includes('Mode uji'), 'tanpa prop tidak ada penanda');
    harus(kotor(markup).length === 0, `penanda kotor: ${kotor(markup).join(', ')}`);

    return 'render normal, 0 penanda kotor';
});
uji('D3 CheckoutPay: mode asli tidak memunculkan penanda meski prop lengkap', () => {
    const markup = render(CheckoutPay, { pesanan: PESANAN, pembayaran: PEMBAYARAN, midtrans: MODE_ASLI });
    harus(!teks(markup).includes('Mode uji'), 'penanda tidak boleh muncul di mode asli');

    return 'bersih';
});

uji('D4 CheckoutPay: `pembayaran.galat` diteruskan ke QrisPanel (kontrak §7.7)', () => {
    const markup = render(CheckoutPay, { pesanan: PESANAN, pembayaran: { ...PEMBAYARAN, galat: GALAT_BAYAR }, midtrans: MODE_UJI });
    const isi = teks(markup);
    harus(isi.includes('Selesaikan Pembayaran'), 'panel QRIS harus dirender');
    harus(isi.includes(GALAT_BAYAR), 'teks galat server harus tampil apa adanya');

    return 'galat server tampil di halaman bayar';
});
uji('D5 CheckoutPay: `pembayaran.galat` null → tanpa notice galat', () => {
    const markup = render(CheckoutPay, { pesanan: PESANAN, pembayaran: PEMBAYARAN, midtrans: MODE_ASLI });
    const isi = teks(markup);
    harus(!isi.includes('Pembayaran QRIS bermasalah'), 'tanpa galat tidak ada notice galat');
    harus(kotor(markup).length === 0, `penanda kotor: ${kotor(markup).join(', ')}`);

    return '0 notice galat, 0 penanda kotor';
});
// ── E. Admin/Settings/Index tab Pembayaran ───────────────────────────────────────────────
const adminProps = (midtrans, tab) => {
    globalThis.window.location.search = tab ? `?tab=${tab}` : '';

    return { auth: { user: { name: 'Pemilik' } }, pengaturan: PENGATURAN, carousels: [], faqs: [], flash: null, midtrans };
};
uji('E1 tab Pembayaran + mode uji: badge, alasan, 3 langkah, sumber kredensial, catatan', () => {
    const markup = render(SettingsIndex, adminProps(MODE_UJI, 'pembayaran'));
    const isi = teks(markup);
    harus(isi.includes('Mode uji'), 'badge Mode uji harus ada');
    harus(isi.includes(ALASAN_UJI), 'alasan server harus tampil');
    LANGKAH_UJI.forEach((langkah) => harus(isi.includes(langkah), `langkah harus tampil: ${langkah}`));
    harus(isi.includes('Kredensial dibaca dari .env (MIDTRANS_*)'), 'sumber kredensial harus tampil');
    harus(isi.includes(CATATAN_ADMIN), 'catatan server (kolom belum dipakai) harus tampil');
    harus(kotor(markup).length === 0, `penanda kotor: ${kotor(markup).join(', ')}`);

    return 'badge + alasan + 3 langkah + sumber kredensial + catatan';
});
uji('E2 tab Pembayaran + mode asli: badge netral, tanpa notice mode uji', () => {
    const markup = render(SettingsIndex, adminProps(MODE_ASLI, 'pembayaran'));
    const isi = teks(markup);
    harus(isi.includes('Mode asli'), 'badge Mode asli harus ada');
    harus(!isi.includes('Mode uji'), 'notice mode uji tidak boleh dirender');
    harus(!isi.includes(LANGKAH_UJI[0]), 'langkah perbaikan tidak perlu di mode asli');
    harus(isi.includes(CATATAN_ADMIN), 'catatan server tetap tampil');

    return 'badge "Mode asli", 0 notice';
});
uji('E3 tab Pembayaran: hint kolom tidak lagi menyesatkan (D11)', () => {
    const markup = render(SettingsIndex, adminProps(MODE_UJI, 'pembayaran'));
    const isi = teks(markup);
    harus(!isi.includes('Client key hanya dipakai untuk memuat halaman pembayaran'), 'hint lama harus hilang');
    harus(isi.includes('Catatan saja: nilai ini tidak dibaca jalur pembayaran QRIS'), 'hint catatan harus ada');
    harus(isi.includes('Midtrans mode produksi (0/1)'), 'label lama dipertahankan (menunggu keputusan pemilik P3)');

    return 'hint lama hilang, hint catatan muncul 2x, label dipertahankan';
});
uji('E4 tab Pembayaran tanpa prop midtrans: baris status tidak dirender (tidak menebak mode)', () => {
    const markup = render(SettingsIndex, adminProps(null, 'pembayaran'));
    const isi = teks(markup);
    harus(isi.includes('Midtrans client key'), 'blok Midtrans harus tetap ada');
    harus(!isi.includes('Mode uji') && !isi.includes('Mode asli'), 'tanpa prop tidak ada baris mode');
    harus(kotor(markup).length === 0, `penanda kotor: ${kotor(markup).join(', ')}`);

    return 'blok tetap ada, 0 klaim mode';
});
uji('E4b tab Pembayaran dengan mode tak dikenal (mode="sandbox"): tidak mengklaim apa pun', () => {
    const markup = render(SettingsIndex, adminProps({ ...MODE_UJI, mode: 'sandbox', fake: undefined }, 'pembayaran'));
    const isi = teks(markup);
    harus(!isi.includes('Mode uji') && !isi.includes('Mode asli'), 'mode asing tidak boleh diklaim');
    harus(kotor(markup).length === 0, `penanda kotor: ${kotor(markup).join(', ')}`);

    return '0 klaim mode untuk bentuk tak dikenal';
});
uji('E5 tab Pembayaran + bentuk menyimpang (alasan/langkah hilang): fallback, tanpa "undefined"', () => {
    const markup = render(SettingsIndex, adminProps({ ...MODE_UJI, alasan: null, langkah_perbaikan: null, catatan: null, sumber_kredensial: null }, 'pembayaran'));
    const isi = teks(markup);
    harus(isi.includes('Mode uji'), 'badge tetap ada');
    harus(isi.includes('QRIS dibuat lokal (tanpa Midtrans) sehingga tidak bisa ditransfer'), 'kalimat cadangan tampil');
    harus(!isi.includes('undefined') && !isi.includes('NaN'), 'tanpa undefined/NaN');

    return 'fallback tampil, 0 undefined';
});
uji('E6 penanda hanya di tab Pembayaran (tab lain tidak terpengaruh)', () => {
    const markup = render(SettingsIndex, adminProps(MODE_UJI, null));
    const isi = teks(markup);
    harus(!isi.includes('Mode uji'), 'tab bawaan (Umum) tidak boleh memuat penanda pembayaran');
    harus(!isi.includes('Midtrans client key'), 'form Pembayaran tidak dirender di tab lain');

    return 'tab Umum bersih dari blok Midtrans';
});

globalThis.window.location.search = '?tab=pembayaran';

// ── F. ringkasan ──────────────────────────────────────────────────────────────────────────
const gagal = hasil.filter((baris) => baris.status === 'GAGAL');
const laporan = [
    'Bukti verifikasi frontend — kartu t_e60e7733 (F2: penanda mode uji + hitung mundur)',
    `Waktu: ${new Date().toISOString()}`,
    `Cara: esbuild (bundle harness uji SSR) + node, stub @inertiajs/react; SSR murni tanpa server pengembangan.`,
    `Hasil: ${hasil.length - gagal.length}/${hasil.length} uji OK${gagal.length ? `, ${gagal.length} GAGAL` : ''}`,
    '',
    ...bukti,
    '',
];
if (gagal.length) {
    laporan.push('Rincian kegagalan:');
    gagal.forEach((baris) => laporan.push(`- ${baris.nama}: ${baris.pesan}`));
    laporan.push('');
}

const tujuan = path.join(AKAR, 'docs', 'bukti-frontend-t_e60e7733.txt');
fs.writeFileSync(tujuan, laporan.join('\n'), 'utf8');
console.log(laporan.join('\n'));
console.log(`laporan lengkap: ${tujuan}`);
process.exit(gagal.length ? 1 : 0);

/**
 * Harness verifikasi kartu t_321bf03c — bagian A: render SSR (React asli) + pemeriksaan statik.
 * File uji lokal (bukan bagian aplikasi). Dijalankan lewat bundel esbuild — perintah lengkap yang
 * benar-benar dijalankan ada di docs/catatan-frontend.md dan docs/bukti-frontend-t_321bf03c.txt:
 *   ./node_modules/@esbuild/win32-x64/esbuild.exe tmp/uji-ssr-stok-t_321bf03c.mjs --bundle \
 *     --platform=node --format=esm --jsx=automatic --packages=external \
 *     --outfile=tmp/uji-ssr-stok-t_321bf03c.bundle.mjs \
 *     --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs
 * `--packages=external` wajib (tanpa itu bundling react-dom/server gagal: "Dynamic require of
 * \"util\" is not supported"), dan react TIDAK boleh dialias ke shim (modal memakai react-dom asli).
 */
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import Index from '../resources/js/Pages/Admin/Stocks/Index.jsx';
import History from '../resources/js/Pages/Admin/Stocks/History.jsx';
import StokAksiModal from '../resources/js/Pages/Admin/Stocks/partials/StokAksiModal.jsx';
import DataTable from '../resources/js/Components/DataTable.jsx';
import { bersihkan, kendali } from './stub-inertia-t_321bf03c.mjs';

const AKAR = process.cwd();
const hasil = [];
const uji = (nama, fn) => {
    try {
        fn();
        hasil.push({ status: 'OK', nama });
    } catch (galat) {
        hasil.push({ status: 'GAGAL', nama, pesan: galat.message });
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
const render = (Komponen, props, opsi = {}) => {
    bersihkan();

    if (opsi.errors) kendali.berikutnya.errors = opsi.errors;
    if (opsi.processing) kendali.berikutnya.processing = true;

    return renderToStaticMarkup(React.createElement(Komponen, props));
};
const teksKotor = (s) => ['undefined', 'NaN', '[object Object]', 'Lorem ipsum', '[Grafik Placeholder]', 'TODO'].filter((p) => s.includes(p));

// ---------------------------------------------------------------- fixture
const barisIndex = (ubah = {}) => ({
    id: 12,
    product: { id: 3, name: 'Daster Batik Kulot', slug: 'daster-batik-kulot' },
    size: 'L',
    color: 'Hitam',
    label: 'L / Hitam',
    sku: 'DSR-BTK-01-L-HITAM',
    stock: 3,
    is_active: true,
    status: 'kritis',
    updated_at: '2026-10-20T09:15:00+07:00',
    ...ubah,
});
const paginatorIndex = (data, meta = {}) => ({
    data,
    links: [],
    meta: { current_page: 1, last_page: 3, per_page: 15, total: 36, ...meta },
});
const propsIndex = (ubah = {}) => ({
    stok: paginatorIndex(
        [
            barisIndex({ id: 12, stock: 3, status: 'kritis' }),
            barisIndex({ id: 13, stock: 0, status: 'habis', label: 'M / Coklat', sku: 'DSR-BTK-01-M-CKL' }),
            barisIndex({ id: 14, stock: 24, status: 'aman', label: 'XL / Hitam' }),
        ],
        { total: 36 }
    ),
    filter: { q: null, status: 'semua', kategori: null, urut: 'nama' },
    kategori: [{ id: 1, name: 'Daster', slug: 'daster' }],
    ringkasan: { varian: 36, habis: 4, kritis: 9, aman: 23 },
    ...ubah,
});
const barisRiwayat = (ubah = {}) => ({
    id: 7,
    product_name: 'Daster Batik Kulot',
    variant_label: 'L / Hitam',
    variant_sku: 'DSR-BTK-01-L-HITAM',
    type: 'in',
    tipe_label: 'Masuk',
    qty: 10,
    signed_qty: 10,
    note: 'Restock dari supplier',
    admin: { id: 2, name: 'Sari Admin' },
    created_at: '2026-10-20T09:15:00+07:00',
    ...ubah,
});
const propsHistory = (ubah = {}) => ({
    riwayat: {
        data: [
            barisRiwayat(),
            barisRiwayat({ id: 8, type: 'out', tipe_label: 'Keluar', signed_qty: -3, note: null, admin: null }),
            barisRiwayat({ id: 9, type: 'adjust', tipe_label: 'Penyesuaian', signed_qty: -2, note: 'Koreksi opname' }),
            barisRiwayat({ id: 10, type: 'sale', tipe_label: 'Penjualan', signed_qty: -1 }),
        ],
        links: [],
        meta: { current_page: 2, last_page: 4, per_page: 15, total: 52 },
    },
    filter: { q: null, tipe: 'semua', varian: null },
    varian: [{ id: 12, label: 'L / Hitam', product_name: 'Daster Batik Kulot' }],
    ringkasan: { masuk: 8, keluar: 5, adjust: 3, sale: 11 },
    ...ubah,
});

// ============================================================== A. statik
const baca = (relatif) => fs.readFileSync(path.join(AKAR, relatif), 'utf8');
const berkasHalaman = [
    'resources/js/Pages/Admin/Stocks/Index.jsx',
    'resources/js/Pages/Admin/Stocks/History.jsx',
    'resources/js/Pages/Admin/Stocks/partials/StokAksiModal.jsx',
];

uji('S1 tidak ada fetch/axios/SPA client', () => {
    berkasHalaman.forEach((relatif) => {
        const isi = baca(relatif);
        ['fetch(', 'axios', 'new XMLHttpRequest', 'useSWR', '@tanstack'].forEach((pola) => {
            harus(!isi.includes(pola), `${relatif} memuat "${pola}"`);
        });
    });
});

uji('S2 tidak ada route()/Ziggy dan tidak ada akses storage', () => {
    berkasHalaman.forEach((relatif) => {
        const isi = baca(relatif);
        ['route(', 'Ziggy', 'localStorage', 'sessionStorage', 'dangerouslySetInnerHTML'].forEach((pola) => {
            harus(!isi.includes(pola), `${relatif} memuat "${pola}"`);
        });
    });
});

uji('S3 semua impor relatif ada di disk', () => {
    berkasHalaman.forEach((relatif) => {
        const isi = baca(relatif);
        const dir = path.dirname(relatif);
        const cocok = isi.match(/from '(\.[^']+)'/g) || [];
        cocok.forEach((baris) => {
            const impor = baris.replace(/from '|'/g, '');
            const pilihan = ['', '.jsx', '.js', '/index.jsx'].map((ekor) => path.join(AKAR, dir, impor + ekor));
            harus(pilihan.some((p) => fs.existsSync(p)), `${relatif} impor ${impor} tidak ditemukan`);
        });
    });
});

uji('S4 props halaman ⊆ props yang dikirim StockController (kontrak §12.12/§12.15)', () => {
    const php = baca('app/Http/Controllers/Admin/StockController.php');
    const ambilProps = (halaman) => {
        const awal = php.indexOf(`Inertia::render('Admin/Stocks/${halaman}', [`);
        harus(awal !== -1, `render Admin/Stocks/${halaman} tidak ditemukan`);
        const potong = php.slice(awal, php.indexOf(']);', awal));
        return Array.from(potong.matchAll(/^ {12}'([a-z_]+)' =>/gm)).map((m) => m[1]);
    };
    const propsServer = {
        Index: ambilProps('Index'),
        History: ambilProps('History'),
    };
    const propsHalaman = (modul) => {
        const isi = baca(modul.berkas);
        const tanda = isi.match(/export default function [A-Za-z]+\(\{([^}]*)\}/);
        harus(Boolean(tanda), `${modul.berkas} tanpa signature props`);
        return tanda[1]
            .split(',')
            .map((bagian) => bagian.split('=')[0].trim())
            .filter((nama) => nama !== '');
    };
    const peta = {
        Index: propsHalaman({ berkas: berkasHalaman[0] }),
        History: propsHalaman({ berkas: berkasHalaman[1] }),
    };
    Object.entries(peta).forEach(([halaman, daftar]) => {
        daftar.forEach((nama) => {
            harus(
                propsServer[halaman].includes(nama) || nama === 'errors' || nama === 'flash',
                `props "${nama}" di ${halaman} tidak dikirim server (server: ${propsServer[halaman].join(', ')})`
            );
        });
    });
});

uji('S5 URL literal halaman sama dengan rute admin.php', () => {
    const rute = baca('routes/admin.php');
    ['/stok', '/stok/{variant}/masuk', '/stok/{variant}/keluar', '/stok/riwayat'].forEach((pola) => {
        harus(!rute.includes('xx'), 'sanity');
        harus(rute.includes(pola) || rute.includes(pola.replace('/', '')), `rute ${pola} tidak ada di admin.php`);
    });
    const index = baca(berkasHalaman[0]);
    harus(index.includes("router.get('/admin/stok'"), 'Index tidak memakai router.get(\'/admin/stok\')');
    const modal = baca(berkasHalaman[2]);
    harus(modal.includes('/admin/stok/${idVarian}/masuk'), 'modal tidak memakai URL /admin/stok/{id}/masuk');
    harus(modal.includes('/admin/stok/${idVarian}/keluar'), 'modal tidak memakai URL /admin/stok/{id}/keluar');
    const history = baca(berkasHalaman[1]);
    harus(history.includes("router.get('/admin/stok/riwayat'"), 'History tidak memakai router.get(\'/admin/stok/riwayat\')');
});

uji('S6 tidak ada teks placeholder tersisa', () => {
    berkasHalaman.forEach((relatif) => {
        const isi = baca(relatif);
        ['[Grafik Placeholder]', 'lorem ipsum', 'Lorem Ipsum', 'FIXME', 'XXX-'].forEach((pola) => {
            harus(!isi.includes(pola), `${relatif} memuat "${pola}"`);
        });
    });
});

// ====================================================== B. render Index
uji('I1 daftar terisi: nama, label, SKU, stok, status, ringkasan, hitung', () => {
    const teksHalaman = teks(render(Index, propsIndex()));
    ['Daster Batik Kulot', 'L / Hitam', 'DSR-BTK-01-L-HITAM', 'Kritis', 'Habis', 'Aman'].forEach((potongan) =>
        harus(teksHalaman.includes(potongan), `hilang: ${potongan}`)
    );
    harus(teksHalaman.includes('Menampilkan 3 dari 36 varian.'), 'teks hitung varian tidak sesuai');
    harus(teksHalaman.includes('Halaman 1 dari 3'), 'pager halaman tidak sesuai');
    harus(teksHalaman.includes('Batas kritis') || teksHalaman.includes('Batas kritis 5'), 'label batas kritis hilang');
    harus(teksKotor(teksHalaman).length === 0, `teks kotor: ${teksKotor(teksHalaman).join(', ')}`);
});

uji('I2 status kolom rendah-stok mengikuti aturan kontrak (0 habis / 1-4 kritis / >=5 aman)', () => {
    const markup = render(Index, propsIndex());
    const pemetaan = { habis: 'Habis', kritis: 'Kritis', aman: 'Aman' };
    Object.values(pemetaan).forEach((label) => harus(teks(markup).includes(label), `label ${label} tidak tampil`));
    const jumlah = (label) => (teks(markup).match(new RegExp(`\\b${label}\\b`, 'g')) || []).length;
    harus(jumlah('Habis') >= 1 && jumlah('Kritis') >= 1 && jumlah('Aman') >= 1, 'badge status tidak lengkap');
    // status tak dikenal dari server -> tidak boleh jadi 'undefined'
    const markupAneh = render(Index, propsIndex({ stok: paginatorIndex([barisIndex({ status: 'entah', stock: '7' })]) }));
    harus(!teks(markupAneh).includes('undefined'), 'status tak dikenal menghasilkan undefined');
});

uji('I3 kosong tanpa filter: ajakan menambah produk, bukan pesan galat', () => {
    const teksHalaman = teks(render(Index, propsIndex({ stok: paginatorIndex([], { total: 0, last_page: 1 }) })));
    harus(teksHalaman.includes('Belum ada varian'), 'judul kosong hilang');
    harus(teksHalaman.includes('Tambah produk'), 'aksi tambah produk hilang');
    harus(teksHalaman.includes('Menampilkan 0 dari 0 varian.'), 'hitung kosong tidak sesuai');
    harus(!teksHalaman.includes('Gagal memuat'), 'kosong tidak boleh tampil sebagai galat');
});

uji('I4 kosong karena filter: pesan "tidak cocok" + reset filter', () => {
    const teksHalaman = teks(
        render(
            Index,
            propsIndex({
                stok: paginatorIndex([], { total: 0, last_page: 1 }),
                filter: { q: 'daster', status: 'habis', kategori: null, urut: 'nama' },
            })
        )
    );
    harus(teksHalaman.includes('Tidak ada varian yang cocok'), 'judul filter kosong hilang');
    harus(teksHalaman.toLowerCase().includes('reset'), 'aksi reset filter hilang');
    harus(!teksHalaman.includes('Belum ada varian'), 'kosong terfilter tidak boleh memakai pesan kosong awal');
});

uji('I5 props hilang/null: halaman tetap render aman', () => {
    const teksHalaman = teks(render(Index, {}));
    harus(teksHalaman.includes('Belum ada varian'), 'tanpa props tetap harus tampil state kosong');
    harus(teksKotor(teksHalaman).length === 0, `teks kotor: ${teksKotor(teksHalaman).join(', ')}`);
});

uji('I6 angka dari server sebagai string & nilai null tetap tampil benar', () => {
    const markup = render(
        Index,
        propsIndex({
            stok: paginatorIndex(
                [barisIndex({ stock: '3', product: null, sku: null, label: null, updated_at: null, status: 'kritis' })],
                { current_page: '1', last_page: '3', total: '36' }
            ),
        })
    );
    const teksHalaman = teks(markup);
    harus(teksHalaman.includes('Menampilkan 1 dari 36 varian.'), 'string angka tidak terkonversi');
    harus(teksHalaman.includes('-'), 'nilai kosong tidak memakai "-"');
    harus(teksHalaman.includes('Tanpa SKU'), 'sku null tidak punya fallback');
    harus(markup.includes('Catat stok masuk untuk Produk tanpa nama'), 'nama aksesibilitas aksi hilang');
    harus(teksKotor(teksHalaman).length === 0, `teks kotor: ${teksKotor(teksHalaman).join(', ')}`);
});

uji('I7 filter terpilih mengikuti props (status/urut/kategori/q)', () => {
    const markup = render(
        Index,
        propsIndex({ filter: { q: 'batik', status: 'habis', kategori: 1, urut: 'stok_terkecil' } })
    );
    harus(markup.includes('value="batik"'), 'kata kunci tidak terisi');
    harus(/<option[^>]*value="habis"[^>]*selected/.test(markup), 'opsi status habis tidak terpilih');
    harus(/<option[^>]*value="1"[^>]*selected/.test(markup), 'opsi kategori terpilih hilang');
    harus(/<option[^>]*value="stok_terkecil"[^>]*selected/.test(markup), 'opsi urut terpilih hilang');
});

uji('I8 modal setel tertutup secara bawaan + tautan riwayat tersedia', () => {
    const markup = render(Index, propsIndex());
    harus(!markup.includes('aria-modal="true"'), 'modal tidak boleh terbuka saat render awal');
    harus(markup.includes('href="/admin/stok/riwayat"'), 'tautan riwayat hilang');
});

// ==================================================== C. render History
uji('H1 riwayat terisi: angka bertanda, tipe, petugas kosong -> "-"', () => {
    const teksHalaman = teks(render(History, propsHistory()));
    ['+10', '\u22123', '\u22122', '\u22121', 'Masuk', 'Keluar', 'Penyesuaian', 'Penjualan', 'Sari Admin'].forEach(
        (potongan) => harus(teksHalaman.includes(potongan), `hilang: ${potongan}`)
    );
    harus(teksHalaman.includes('Menampilkan 4 dari 52 pergerakan.'), 'teks hitung pergerakan tidak sesuai');
    harus(teksHalaman.includes('Halaman 2 dari 4'), 'pager halaman tidak sesuai');
    harus(teksKotor(teksHalaman).length === 0, `teks kotor: ${teksKotor(teksHalaman).join(', ')}`);
});

uji('H2 angka kartu ringkasan = jumlah baris per tipe (bukan unit stok)', () => {
    const teksHalaman = teks(render(History, propsHistory({ ringkasan: { masuk: '8', keluar: 5, adjust: null, sale: 11 } })));
    harus(teksHalaman.includes('Pergerakan masuk'), 'label kartu masuk hilang');
    harus(teksHalaman.includes('Penyesuaian'), 'label kartu penyesuaian hilang');
    harus(teksHalaman.includes('-'), 'ringkasan null harus tampil "-"');
    harus(teksKotor(teksHalaman).length === 0, `teks kotor: ${teksKotor(teksHalaman).join(', ')}`);
});

uji('H3 kosong tanpa filter vs kosong karena filter', () => {
    const kosong = { riwayat: { data: [], links: [], meta: { total: 0, last_page: 1, current_page: 1 } } };
    const teksTanpa = teks(render(History, propsHistory(kosong)));
    harus(teksTanpa.includes('Belum ada pergerakan stok'), 'judul kosong hilang');
    const teksFilter = teks(render(History, propsHistory({ ...kosong, filter: { q: 'batik', tipe: 'out', varian: null } })));
    harus(teksFilter.includes('Tidak ada') && teksFilter.toLowerCase().includes('reset'), 'kosong terfilter butuh pesan + reset');
    harus(!teksFilter.includes('Gagal memuat'), 'kosong tidak boleh tampil sebagai galat');
});

uji('H4 props hilang/null: halaman tetap render aman', () => {
    const teksHalaman = teks(render(History, {}));
    harus(!teksKotor(teksHalaman).includes('undefined'), 'tanpa props menghasilkan undefined');
    harus(teksKotor(teksHalaman).length === 0, `teks kotor: ${teksKotor(teksHalaman).join(', ')}`);
});

uji('H5 signed_qty null & angka string tidak menghasilkan NaN', () => {
    const teksHalaman = teks(
        render(
            History,
            propsHistory({
                riwayat: {
                    data: [barisRiwayat({ signed_qty: null, qty: '5' }), barisRiwayat({ id: 8, signed_qty: '-4', tipe_label: null })],
                    links: [],
                    meta: { total: '52', last_page: '4', current_page: '2' },
                },
            })
        )
    );
    harus(!teksHalaman.includes('NaN'), 'signed_qty null menghasilkan NaN');
    harus(teksHalaman.includes('\u22124'), 'signed_qty string gagal diformat');
    harus(teksHalaman.includes('Menampilkan 2 dari 52 pergerakan.'), 'string meta gagal diformat');
});

// ============================================== D. modal aksi (StokAksiModal)
uji('M1 modal mode masuk: judul, field, tombol sesuai desain', () => {
    const markup = render(StokAksiModal, { mode: 'in', baris: barisIndex(), open: true, onClose: () => {} });
    const teksModal = teks(markup);
    harus(teksModal.includes('Catat stok masuk'), 'judul modal masuk hilang');
    harus(teksModal.includes('Simpan stok masuk'), 'tombol simpan modal masuk hilang');
    harus(/<label[^>]*for="stok-aksi-qty"/.test(markup), 'field qty tanpa label terhubung');
    harus(markup.includes('aria-modal="true"'), 'modal tidak memakai aria-modal');
    harus(teksModal.includes('stok tercatat saat ini 3'), 'stok saat ini tidak tampil di deskripsi');
    harus(teksKotor(teksModal).length === 0, `teks kotor: ${teksKotor(teksModal).join(', ')}`);
});

uji('M2 galat server per kolom terhubung aria-describedby', () => {
    const markup = render(
        StokAksiModal,
        { mode: 'out', baris: barisIndex({ stock: 1 }), open: true, onClose: () => {} },
        { errors: { qty: 'Stok tidak cukup — stok saat ini 1.' } }
    );
    const teksModal = teks(markup);
    harus(teksModal.includes('Catat stok keluar'), 'judul modal keluar hilang');
    harus(teksModal.includes('Stok tidak cukup'), 'pesan galat server tidak tampil');
    harus(markup.includes('aria-describedby="'), 'input tanpa aria-describedby');
    harus(markup.includes('aria-invalid="true"'), 'input galat tanpa aria-invalid');
});

uji('M3 galat non-kolom tampil sebagai notice, mode keluar beda tombol', () => {
    const markup = render(
        StokAksiModal,
        { mode: 'out', baris: barisIndex({ stock: 3 }), open: true, onClose: () => {} },
        { errors: { stok: 'Varian tidak aktif.' } }
    );
    const teksModal = teks(markup);
    harus(teksModal.includes('Varian tidak aktif.'), 'galat non-kolom tidak tampil');
    harus(teksModal.includes('Simpan stok keluar'), 'tombol simpan mode keluar hilang');
});

// ============================================ E. state tabel (DataTable)
uji('D1 DataTable: loading, error + Coba lagi, kosong adalah tiga hal berbeda', () => {
    const kolom = [{ key: 'nama', header: 'Nama', render: (b) => b.nama }];
    const muat = render(DataTable, { columns: kolom, rows: [], loading: true });
    harus(muat.includes('aria-busy="true"') || teks(muat).toLowerCase().includes('memuat'), 'state loading tidak jelas');
    const galat = teks(render(DataTable, { columns: kolom, rows: [], error: 'Gagal memuat daftar stok.', onRetry: () => {} }));
    harus(galat.includes('Gagal memuat daftar stok.'), 'pesan galat tidak tampil');
    harus(galat.includes('Coba lagi'), 'tombol Coba lagi hilang');
    const kosong = teks(render(DataTable, { columns: kolom, rows: [], emptyTitle: 'Belum ada data' }));
    harus(kosong.includes('Belum ada data'), 'state kosong tidak tampil');
    harus(!kosong.includes('Coba lagi'), 'state kosong tidak boleh menawarkan Coba lagi');
});

// ------------------------------------------------------------- laporan
if (process.env.DEBUG_RENDER) {
    const cuplikan = (markup, sekitar) => {
        const posisi = markup.indexOf(sekitar);
        const mulai = Math.max(0, posisi - 300);
        console.log(`\n--- potongan markup sekitar "${sekitar}" ---\n${markup.slice(mulai, posisi + 300)}`);
    };
    const markupH1 = render(History, propsHistory());
    const keluaranH1 = markupH1.slice(markupH1.indexOf('<tbody>'));
    console.log('\nH1 baris keluar/penyesuaian:', keluaranH1.split('</tr>').slice(1, 3).join('</tr>'));
    const markupI6 = render(Index, propsIndex({ stok: paginatorIndex([barisIndex({ stock: '3', product: null, sku: null, label: null, updated_at: null })]) }));
    const keluaranI6 = markupI6.slice(markupI6.indexOf('<tbody>'));
    console.log('\nI6 baris:', keluaranI6.split('</tr>')[0]);
}

console.log('=== UJI SSR + STATIK kartu t_321bf03c ===');
hasil.forEach((baris) => {
    console.log(`[${baris.status}] ${baris.nama}${baris.pesan ? ` -> ${baris.pesan}` : ''}`);
});
const gagal = hasil.filter((baris) => baris.status === 'GAGAL');
console.log(`\nTOTAL: ${hasil.length} uji, ${gagal.length} gagal`);
process.exit(gagal.length === 0 ? 0 : 1);

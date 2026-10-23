/**
 * Harness verifikasi kartu t_018b2723 (F5 — Admin Pesanan Index + Show).
 * File uji lokal (bukan bagian aplikasi). Perintah yang benar-benar dijalankan:
 *   ./node_modules/@esbuild/win32-x64/esbuild.exe tmp/uji-ssr-pesanan-t_018b2723.mjs --bundle \
 *     --platform=node --format=esm --jsx=automatic --packages=external \
 *     --outfile=tmp/uji-ssr-pesanan-t_018b2723.bundle.mjs \
 *     --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs
 *   node tmp/uji-ssr-pesanan-t_018b2723.bundle.mjs
 * Stub Inertia dipakai bersama dengan harness kartu t_321bf03c (router + useForm + usePage).
 * `--packages=external` wajib supaya react-dom/server bisa require bawaan Node.
 */
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import Index from '../resources/js/Pages/Admin/Orders/Index.jsx';
import Show from '../resources/js/Pages/Admin/Orders/Show.jsx';
import UbahStatusModal from '../resources/js/Pages/Admin/Orders/partials/UbahStatusModal.jsx';
import BuktiPembayaran from '../resources/js/Pages/Admin/Orders/partials/BuktiPembayaran.jsx';
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

    if (opsi.errors) {
        // galat server harus dipasang SEBELUM render: useForm tiruan membaca kendali.berikutnya.errors
        kendali.berikutnya.errors = { ...opsi.errors };
        kendali.formulir.length = 0;
    }

    return renderToStaticMarkup(React.createElement(Komponen, props));
};
const kotor = (s) =>
    ['undefined', 'NaN', '[object Object]', 'lorem ipsum', '[Grafik Placeholder]', 'TODO:', 'FIXME'].filter((p) =>
        s.includes(p)
    );

// ---------------------------------------------------------------- fixture
const barisPesanan = (ubah = {}) => ({
    id: 5,
    code: 'ORD-0005',
    status: 'dibayar',
    status_label: 'Dibayar',
    payment_status: 'settlement',
    payment_label: 'Lunas',
    total: 149000,
    items_count: 2,
    created_at: '2026-10-20T09:15:00+07:00',
    customer_name: 'Sari Pembeli',
    customer_phone: '081200000001',
    customer_email: 'sari@example.test',
    url: '/admin/pesanan/5',
    ...ubah,
});
const paginator = (data, meta = {}) => ({
    data,
    links: [],
    meta: { current_page: 1, last_page: 3, per_page: 15, total: 36, ...meta },
});
const propsIndex = (ubah = {}) => ({
    pesanan: paginator([
        barisPesanan({ id: 5, code: 'ORD-0005', status: 'dibayar', status_label: 'Dibayar' }),
        barisPesanan({ id: 6, code: 'ORD-0006', status: 'dikirim', status_label: 'Dikirim', payment_label: null }),
        barisPesanan({ id: 7, code: 'ORD-0007', status: 'batal', status_label: 'Batal', customer_name: null }),
    ]),
    filter: { q: null, status: 'semua', bayar: null, dari: null, sampai: null },
    ringkasan: { total: 36, pending: 4, dibayar: 12, diproses: 9, dikirim: 6, selesai: 4, batal: 1 },
    ...ubah,
});
const detailPesanan = (ubah = {}) => ({
    id: 5,
    code: 'ORD-0005',
    status: 'dikirim',
    status_label: 'Dikirim',
    payment_status: 'settlement',
    payment_label: 'Lunas',
    payment_method: 'qris',
    subtotal: 278000,
    shipping_cost: 20000,
    discount: 0,
    total: 298000,
    notes: 'Ganti warna bila bisa',
    created_at: '2026-10-20T09:15:00+07:00',
    paid_at: '2026-10-20T09:20:00+07:00',
    customer: {
        name: 'Sari Pembeli',
        phone: '081200000001',
        email: 'sari@example.test',
        address: 'Jl. Melati 12, RT 3 / RW 4',
        city: 'Bandung',
        postal_code: '40123',
    },
    items: [
        {
            id: 11,
            product_name: 'Daster Batik Kulot',
            variant_label: 'L / Hitam',
            qty: 2,
            unit_price: 139000,
            line_total: 278000,
        },
    ],
    payment: {
        provider: 'midtrans',
        transaction_id: 'TRX-9f2b31',
        status: 'settlement',
        gross_amount: 298000,
        qr_string: '00020101021226610014ID.CO.QRIS.WWW',
        expires_at: '2026-10-20T09:45:00+07:00',
        paid_at: '2026-10-20T09:20:00+07:00',
    },
    ...ubah,
});
const propsShow = (ubah = {}) => ({
    pesanan: detailPesanan(),
    status_berikut: [
        { value: 'selesai', label: 'Selesai' },
        { value: 'batal', label: 'Batal' },
    ],
    ...ubah,
});

// ============================================================== A. statik
const baca = (relatif) => fs.readFileSync(path.join(AKAR, relatif), 'utf8');
const berkasHalaman = [
    'resources/js/Pages/Admin/Orders/Index.jsx',
    'resources/js/Pages/Admin/Orders/Show.jsx',
    'resources/js/Pages/Admin/Orders/partials/KartuBagian.jsx',
    'resources/js/Pages/Admin/Orders/partials/BuktiPembayaran.jsx',
    'resources/js/Pages/Admin/Orders/partials/InfoResi.jsx',
    'resources/js/Pages/Admin/Orders/partials/UbahStatusModal.jsx',
];

uji('S1 tidak ada fetch/axios/SPA client di berkas Orders', () => {
    berkasHalaman.forEach((relatif) => {
        const isi = baca(relatif);
        ['fetch(', 'axios', 'new XMLHttpRequest', 'useSWR', '@tanstack'].forEach((pola) => {
            harus(!isi.includes(pola), `${relatif} memuat "${pola}"`);
        });
    });
});

uji('S2 tidak ada route()/Ziggy, storage, atau dangerouslySetInnerHTML', () => {
    berkasHalaman.forEach((relatif) => {
        const isi = baca(relatif);
        ['route(', 'Ziggy', 'localStorage', 'sessionStorage', 'dangerouslySetInnerHTML'].forEach((pola) => {
            harus(!isi.includes(pola), `${relatif} memuat "${pola}"`);
        });
    });
});

uji('S3 semua impor relatif ada di disk (kedalaman path benar)', () => {
    berkasHalaman.forEach((relatif) => {
        const isi = baca(relatif);
        const dir = path.dirname(relatif);
        const cocok = isi.match(/from '(\.[^']+)'/g) || [];
        harus(cocok.length >= 1, `${relatif} tanpa impor relatif`);
        cocok.forEach((baris) => {
            const impor = baris.replace(/from '|'/g, '');
            const pilihan = ['', '.jsx', '.js', '/index.jsx'].map((ekor) => path.join(AKAR, dir, impor + ekor));
            harus(pilihan.some((p) => fs.existsSync(p)), `${relatif} impor ${impor} tidak ditemukan`);
        });
    });
});

uji('S4 props halaman ⊆ props yang dikirim OrderController (kontrak §12.16/§12.17)', () => {
    const php = baca('app/Http/Controllers/Admin/OrderController.php');
    const ambil = (halaman) => {
        const awal = php.indexOf(`Inertia::render('Admin/Orders/${halaman}', [`);
        harus(awal !== -1, `render Admin/Orders/${halaman} tidak ditemukan di controller`);
        const potong = php.slice(awal, php.indexOf(']);', awal));
        return Array.from(potong.matchAll(/^ {12}'([a-z_]+)' =>/gm)).map((m) => m[1]);
    };
    const server = { Index: ambil('Index'), Show: ambil('Show') };
    const dipakai = (relatif) => {
        const tanda = baca(relatif).match(/export default function [A-Za-z]+\(\{([^}]*)\}/);
        harus(Boolean(tanda), `${relatif} tanpa signature props`);
        return tanda[1]
            .split(',')
            .map((bagian) => bagian.split('=')[0].trim())
            .filter((nama) => nama !== '');
    };
    const peta = {
        Index: { berkas: berkasHalaman[0], props: dipakai(berkasHalaman[0]) },
        Show: { berkas: berkasHalaman[1], props: dipakai(berkasHalaman[1]) },
    };
    Object.entries(peta).forEach(([halaman, isi]) => {
        harus(isi.props.length > 0, `${halaman} tanpa props`);
        isi.props.forEach((nama) => {
            harus(
                server[halaman].includes(nama) || nama === 'errors' || nama === 'flash',
                `props "${nama}" di ${halaman} tidak dikirim server (server: ${server[halaman].join(', ')})`
            );
        });
    });
});

uji('S5 URL literal halaman cocok dengan rute admin.php', () => {
    const rute = baca('routes/admin.php');
    ["'/pesanan'", "'/pesanan/{order}'", "'/pesanan/{order}/status'"].forEach((pola) => {
        harus(rute.includes(pola), `rute ${pola} tidak ada di admin.php`);
    });
    harus(
        rute.includes("->name('orders.index')") && rute.includes("->name('orders.status')"),
        'nama rute admin.orders.* tidak ada di admin.php'
    );
    harus(baca(berkasHalaman[0]).includes("router.get('/admin/pesanan'"), "Index tidak memakai router.get('/admin/pesanan')");
    harus(
        baca(berkasHalaman[5]).includes('form.patch(`/admin/pesanan/${id}/status`'),
        'modal tidak memakai PATCH /admin/pesanan/{id}/status'
    );
});

uji('S6 tidak ada placeholder; isian resi memakai rute simpan yang ada (F5b t_d1028202)', () => {
    berkasHalaman.forEach((relatif) => {
        const isi = baca(relatif);
        ['[Grafik Placeholder]', 'lorem ipsum', 'Lorem Ipsum', 'FIXME', 'XXX-'].forEach((pola) => {
            harus(!isi.includes(pola), `${relatif} memuat "${pola}"`);
        });
    });
    const resi = baca(berkasHalaman[4]);
    harus(!resi.includes('InlineNotice'), 'InfoResi masih memuat notice temuan lama');
    harus(resi.includes('<Input'), 'InfoResi harus memakai Input standar');
    harus(resi.includes('tracking_number'), 'field resi harus bernama tracking_number (kontrak §12.17)');
    harus(
        baca(berkasHalaman[1]).includes('<InfoResi pesanan={data} />'),
        'Show tidak mengirim props pesanan ke InfoResi'
    );
});

uji('S7 state galat Index punya pesan konkret + tombol Coba lagi', () => {
    const isi = baca(berkasHalaman[0]);
    harus(isi.includes('Gagal memuat daftar pesanan'), 'judul galat hilang');
    harus(isi.includes('Coba lagi'), 'aksi Coba lagi hilang');
    harus(isi.includes('onError: () => setGalat(') || isi.includes('setGalat('), 'galat tidak diisi dari kegagalan router');
});

// ====================================================== B. render Index
uji('I1 daftar terisi: kode, pembeli, status, ringkasan, hitung, pager', () => {
    const markup = render(Index, propsIndex());
    const t = teks(markup);
    ['ORD-0005', 'ORD-0006', 'Sari Pembeli', '081200000001', 'Dibayar', 'Dikirim', 'Batal', 'Lunas'].forEach((p) =>
        harus(t.includes(p), `hilang: ${p}`)
    );
    harus(t.includes('Menampilkan 3 dari 36 pesanan.'), `teks hitung tidak sesuai: ${t.slice(0, 400)}`);
    harus(t.includes('1 / 3'), 'penanda halaman (current / last) tidak sesuai');
    harus(markup.includes('aria-label="Halaman 3"'), 'kontrol paginasi halaman terakhir hilang');
    ['Total pesanan', 'Pending', 'Diproses', 'Selesai'].forEach((p) => harus(t.includes(p), `kartu ringkasan ${p} hilang`));
    harus(t.includes('Rp149.000'), 'total rupiah tidak terformat');
    harus(kotor(t).length === 0, `teks kotor: ${kotor(t).join(', ')}`);
});

uji('I2 kosong tanpa filter: ajakan, bukan galat', () => {
    const t = teks(render(Index, propsIndex({ pesanan: paginator([], { total: 0, last_page: 1 }) })));
    harus(t.includes('Belum ada pesanan'), 'judul kosong hilang');
    harus(t.includes('Menampilkan 0 dari 0 pesanan.'), 'hitung kosong tidak sesuai');
    harus(!t.includes('Gagal memuat'), 'kosong tidak boleh tampil sebagai galat');
});

uji('I3 kosong karena filter: pesan "tidak cocok" + aksi tampilkan semua', () => {
    const markup = render(
        Index,
        propsIndex({
            pesanan: paginator([], { total: 0, last_page: 1 }),
            filter: { q: 'sari', status: 'dikirim', bayar: 'settlement', dari: null, sampai: null },
        })
    );
    const t = teks(markup);
    harus(t.includes('Tidak ada pesanan yang cocok'), 'judul kosong-terfilter hilang');
    harus(t.includes('Reset filter'), 'aksi reset filter hilang');
    harus(!t.includes('Belum ada pesanan'), 'kosong terfilter tidak boleh memakai pesan kosong awal');
    harus(!t.includes('Gagal memuat'), 'kosong terfilter tidak boleh tampil sebagai galat');
});

uji('I4 props hilang/null: halaman tetap render aman', () => {
    const t = teks(render(Index, {}));
    harus(t.includes('Belum ada pesanan'), 'tanpa props harus tampil state kosong');
    harus(kotor(t).length === 0, `teks kotor: ${kotor(t).join(', ')}`);
});

uji('I5 angka string & nilai null: "-" bukan NaN/undefined', () => {
    const markup = render(
        Index,
        propsIndex({
            pesanan: paginator(
                [barisPesanan({ total: '149000', customer_name: null, customer_phone: null, created_at: null, payment_label: null })],
                { current_page: '1', last_page: '3', total: '36' }
            ),
        })
    );
    const t = teks(markup);
    harus(t.includes('Menampilkan 1 dari 36 pesanan.'), 'string meta gagal diformat');
    harus(t.includes('Rp149.000'), 'string total gagal diformat');
    harus(t.includes('Tanpa nama') || t.includes('-'), 'nilai null tanpa fallback');
    harus(kotor(t).length === 0, `teks kotor: ${kotor(t).join(', ')}`);
});

uji('I6 filter terpilih mengikuti props (q, status, bayar, tanggal)', () => {
    const markup = render(
        Index,
        propsIndex({
            filter: { q: 'batik', status: 'dikirim', bayar: 'settlement', dari: '2026-10-01', sampai: '2026-10-31' },
        })
    );
    harus(markup.includes('value="batik"'), 'kata kunci tidak terisi');
    harus(/<option[^>]*value="dikirim"[^>]*selected/.test(markup), 'opsi status dikirim tidak terpilih');
    harus(/<option[^>]*value="settlement"[^>]*selected/.test(markup), 'opsi status bayar tidak terpilih');
    harus(markup.includes('value="2026-10-01"') && markup.includes('value="2026-10-31"'), 'tanggal tidak terisi');
});

uji('I7 ringkasan hilang: kartu "-" (bukan 0 karangan); meta hilang: "-"', () => {
    const t = teks(render(Index, propsIndex({ ringkasan: null })));
    harus(t.includes('Total pesanan -'), `ringkasan null tidak memakai "-": ${t.slice(0, 300)}`);
    harus(t.includes('Menampilkan 3 dari 36 pesanan.'), 'hitung harus tetap dari meta pesanan');
    const tanpaMeta = teks(
        render(Index, propsIndex({ pesanan: { data: [barisPesanan()], links: [], meta: null } }))
    );
    harus(tanpaMeta.includes('Menampilkan 1 dari - pesanan.'), `meta hilang tidak memakai "-": ${tanpaMeta.slice(0, 300)}`);
    harus(kotor(tanpaMeta).length === 0, `teks kotor: ${kotor(tanpaMeta).join(', ')}`);
});

uji('I8 penanganan flash server ada (toast, bukan efek SSR)', () => {
    [berkasHalaman[0], berkasHalaman[1]].forEach((relatif) => {
        const isi = baca(relatif);
        harus(isi.includes('flash?.success') && isi.includes('flash?.error'), `${relatif} tidak menangani flash`);
        harus(isi.includes('<Toast'), `${relatif} tidak menampilkan toast`);
    });
});

// ======================================================= C. render Show
uji('H1 detail terisi: pembeli, alamat, item, total, status', () => {
    const t = teks(render(Show, propsShow()));
    ['ORD-0005', 'Sari Pembeli', 'Jl. Melati 12', 'Bandung', '40123', 'Daster Batik Kulot', 'L / Hitam'].forEach((p) =>
        harus(t.includes(p), `hilang: ${p}`)
    );
    harus(t.includes('Rp278.000') && t.includes('Rp20.000') && t.includes('Rp298.000'), 'rincian biaya tidak lengkap');
    harus(t.includes('Status pesanan') && t.includes('Status pembayaran'), 'label status hilang');
    harus(t.includes('Ganti warna bila bisa'), 'catatan pembeli hilang');
    harus(t.includes('Ubah status'), 'aksi ubah status hilang');
    harus(kotor(t).length === 0, `teks kotor: ${kotor(t).join(', ')}`);
});

uji('H2 status final: tombol nonaktif + penjelasan, tanpa modal terbuka', () => {
    const markup = render(Show, propsShow({ status_berikut: [] }));
    const t = teks(markup);
    harus(t.includes('Status sudah final'), 'penjelasan status final hilang');
    const rapat = markup.replace(/\n/g, ' ');
    harus(/disabled=""[^>]*>[\s\S]{0,240}?Ubah status/.test(rapat), 'tombol Ubah status tidak dinonaktifkan');
    harus(!markup.includes('aria-modal="true"'), 'modal tidak boleh terbuka saat render awal');
});

uji('H3 status tidak final: tombol aktif, modal tetap tertutup', () => {
    const markup = render(Show, propsShow());
    harus(!markup.includes('aria-modal="true"'), 'modal tidak boleh terbuka saat render awal');
    harus(!teks(markup).includes('Status sudah final'), 'penjelasan final tidak boleh tampil saat ada status lanjutan');
});

uji('H4 bukti pembayaran: ada -> detail, null -> pesan jelas (bukan galat)', () => {
    const ada = teks(render(Show, propsShow()));
    harus(ada.includes('Bukti pembayaran'), 'judul kartu bukti hilang');
    harus(ada.includes('TRX-9f2b31'), 'ID transaksi hilang');
    const kosong = render(Show, propsShow({ pesanan: detailPesanan({ payment: null }) }));
    harus(teks(kosong).includes('Belum ada data pembayaran'), 'state tanpa pembayaran tidak jelas');
    harus(!teks(kosong).includes('Gagal'), 'pembayaran kosong tidak boleh tampil sebagai galat');
});

uji('H5 items kosong & catatan kosong punya pesan sendiri', () => {
    const t = teks(render(Show, propsShow({ pesanan: detailPesanan({ items: [], notes: null }) })));
    harus(t.includes('Pesanan ini belum punya item'), 'pesan item kosong hilang');
    harus(t.includes('Tidak ada catatan dari pembeli.'), 'pesan catatan kosong hilang');
});

uji('H6 props hilang/null: halaman tetap render aman', () => {
    const t = teks(render(Show, {}));
    harus(t.includes('Detail pesanan'), 'tanpa props harus tetap punya judul');
    harus(kotor(t).length === 0, `teks kotor: ${kotor(t).join(', ')}`);
    const tKosong = teks(render(Show, { pesanan: { items: null, customer: null }, status_berikut: null }));
    harus(kotor(tKosong).length === 0, `teks kotor (objek parsial): ${kotor(tKosong).join(', ')}`);
});

uji('H7 isian resi tampil dengan nilai dari props server (F5b t_d1028202)', () => {
    const markup = render(Show, propsShow());
    const t = teks(markup);
    harus(t.includes('Nomor resi'), 'label resi hilang');
    harus(/<input[^>]*id="resi-pesanan"/i.test(markup), 'isian resi tidak tampil');
    harus(t.includes('Simpan resi'), 'tombol simpan resi hilang');
    harus(!t.includes('Nomor resi belum bisa diisi'), 'notice temuan lama masih tampil');
});

uji('H8 flash sukses ditangani halaman detail (toast, bukan efek SSR)', () => {
    const isi = baca(berkasHalaman[1]);
    harus(isi.includes('flash?.success'), 'Show tidak membaca flash.success');
    harus(isi.includes('setToast'), 'Show tidak menyiapkan toast untuk flash');
});

// ===================================================== D. modal ubah status
uji('M1 modal terbuka: label server, opsi status, tombol simpan', () => {
    const markup = render(UbahStatusModal, {
        open: true,
        pesanan: detailPesanan(),
        statusBerikut: [
            { value: 'selesai', label: 'Selesai' },
            { value: 'batal', label: 'Batal' },
        ],
        onClose: () => {},
    });
    const t = teks(markup);
    harus(markup.includes('aria-modal="true"'), 'modal tidak memakai aria-modal');
    harus(t.includes('Ubah status'), 'judul modal hilang');
    harus(t.includes('Selesai') && t.includes('Batal'), 'opsi status lanjutan hilang');
    harus(t.includes('Simpan status'), 'tombol simpan hilang');
    harus(/<label[^>]*for="status-pesanan"/.test(markup), 'field status tanpa label terhubung');
    harus(kotor(t).length === 0, `teks kotor: ${kotor(t).join(', ')}`);
});

uji('M2 galat server per kolom terhubung aria-describedby', () => {
    const markup = render(
        UbahStatusModal,
        { open: true, pesanan: detailPesanan(), statusBerikut: [{ value: 'selesai', label: 'Selesai' }], onClose: () => {} },
        { errors: { status: 'Transisi status tidak sah.' } }
    );
    const t = teks(markup);
    harus(t.includes('Transisi status tidak sah.'), 'galat kolom tidak tampil');
    harus(markup.includes('aria-describedby="'), 'input tanpa aria-describedby');
});

uji('M3 bukti pembayaran tanpa QR: peringatan, bukan galat mati', () => {
    const t = teks(render(BuktiPembayaran, { payment: { provider: 'midtrans', status: 'pending', gross_amount: 298000 } }));
    harus(t.includes('Kode QR belum tersedia'), 'state QR kosong tidak jelas');
    harus(kotor(t).length === 0, `teks kotor: ${kotor(t).join(', ')}`);
});

// ------------------------------------------------------------- laporan
console.log('=== UJI SSR + STATIK kartu t_018b2723 (F5 Admin Pesanan) ===');
hasil.forEach((baris) => console.log(`[${baris.status}] ${baris.nama}${baris.pesan ? ` -> ${baris.pesan}` : ''}`));
const gagal = hasil.filter((baris) => baris.status === 'GAGAL');
console.log(`\nTOTAL: ${hasil.length} uji, ${gagal.length} gagal`);
process.exit(gagal.length === 0 ? 0 : 1);

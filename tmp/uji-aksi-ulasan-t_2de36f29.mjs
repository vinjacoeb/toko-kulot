/**
 * Harness interaksi kartu t_2de36f29 (F6 — gerbang ulasan di halaman selesai checkout).
 * File uji lokal (bukan bagian aplikasi). Tanpa browser dan tanpa pustaka uji baru:
 * hook React diganti shim store, '@inertiajs/react' diganti stub pencatat, fungsi komponen
 * dipanggil langsung lalu handler-nya dipanggil. Perintah yang benar-benar dijalankan:
 *   ./node_modules/@esbuild/win32-x64/esbuild.exe tmp/uji-aksi-ulasan-t_2de36f29.mjs --bundle \
 *     --platform=node --format=esm --jsx=automatic --packages=external \
 *     --outfile=tmp/uji-aksi-ulasan-t_2de36f29.bundle.mjs \
 *     --alias:react/jsx-runtime=./tmp/shim-jsx-runtime-t_321bf03c.mjs \
 *     --alias:react=./tmp/shim-react-t_321bf03c.mjs \
 *     --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs
 *   node tmp/uji-aksi-ulasan-t_2de36f29.bundle.mjs
 * Batasan: bukan browser — yang diuji kontrak pemanggilan (URL, payload, opsi Inertia, state UI),
 * bukan tata letak, fokus keyboard, atau render tampilan.
 * Diperbarui kartu t_02c3d20c (B2): ditambah uji 7 (boleh=false + sisa produk -> nol jalur kirim),
 * gerbang resmi = `ulasan.boleh && pending.length > 0` (kontrak §7.9 dibekukan 21 Okt 2026).
 */
import React from 'react';
import { store, mulaiPass, bersihkanStore } from './shim-react-t_321bf03c.mjs';
import { router, kendali, bersihkan } from './stub-inertia-t_321bf03c.mjs';
import CheckoutSuccess from '../resources/js/Pages/Public/CheckoutSuccess.jsx';

const hasil = [];
const uji = (nama, fn) => {
    try {
        bersihkanStore();
        bersihkan();
        kendali.halaman.props = { auth: { user: null }, cart: { count: 2 }, settings: {} };
        fn();
        hasil.push({ status: 'OK', nama, catatan: '' });
    } catch (galat) {
        hasil.push({ status: 'GAGAL', nama, catatan: galat.message });
    }
};

const harus = (kondisi, pesan) => {
    if (!kondisi) throw new Error(pesan);
};

// ---------------------------------------------------------------- render pass
const renderPohon = (Komponen, props, maks = 10) => {
    let pohon = null;

    for (let i = 0; i < maks; i += 1) {
        mulaiPass();
        pohon = Komponen(props);

        if (!store.kotor) break;
    }

    return pohon;
};

const kumpulan = (pohon, hasilKumpul = []) => {
    if (pohon === null || pohon === undefined || typeof pohon === 'boolean') return hasilKumpul;

    if (Array.isArray(pohon)) {
        pohon.forEach((isi) => kumpulan(isi, hasilKumpul));

        return hasilKumpul;
    }

    if (typeof pohon === 'string' || typeof pohon === 'number') return hasilKumpul;

    hasilKumpul.push(pohon);
    kumpulan(pohon.props?.children, hasilKumpul);

    return hasilKumpul;
};

const semuaElemen = (pohon) => kumpulan(pohon);
const cariSemua = (pohon, predikat) => semuaElemen(pohon).filter(predikat);
const bernama = (nama) => (el) => typeof el.type === 'function' && el.type.name === nama;

const teksPohon = (pohon) => {
    const bagian = [];
    const kumpul = (simpul) => {
        if (simpul === null || simpul === undefined || typeof simpul === 'boolean') return;
        if (Array.isArray(simpul)) return simpul.forEach(kumpul);
        if (typeof simpul === 'string' || typeof simpul === 'number') {
            bagian.push(String(simpul));

            return;
        }
        if (typeof simpul === 'object') {
            kumpul(simpul.props?.children);
            kumpul(simpul.props?.title);
        }
    };

    kumpul(pohon);

    return bagian.join(' | ');
};

// ---------------------------------------------------------------- fixture
const item = (productId) => ({
    id: productId,
    product_id: productId,
    variant_id: null,
    name: `Produk ${productId}`,
    variant_label: 'Ukuran L / Merah',
    qty: 1,
    unit_price: 85000,
    line_total: 85000,
    image: `/images/seed/produk/produk-${productId}.png`,
});

const pesanan = (ubah = {}) => ({
    id: 21,
    code: 'TK-20261020-0001',
    status: 'dibayar',
    payment_status: 'settlement',
    subtotal: 170000,
    shipping_cost: 20000,
    total: 190000,
    customer_name: 'Siti Aminah',
    customer_phone: '081234567890',
    customer_address: 'Jl. Melati 12',
    customer_city: 'Pekalongan',
    created_at: '2026-10-20T14:05:00+07:00',
    paid_at: '2026-10-20T14:09:00+07:00',
    items: [item(3), item(7)],
    ...ubah,
});

const SUKSES = 'Terima kasih! Penilaianmu membantu pembeli lain.';

const formAktif = (pohon) => cariSemua(pohon, bernama('ReviewForm')).filter((el) => typeof el.props.onSubmit === 'function');
const formTerkunci = (pohon) => cariSemua(pohon, bernama('ReviewForm')).filter((el) => el.props.onSubmit === undefined);
const formUntuk = (pohon, productId) =>
    cariSemua(pohon, bernama('ReviewForm')).find((el) => Number(el.props.productId) === Number(productId)) ?? null;

// ---------------------------------------------------------------- uji
uji('1. kirim ulasan -> POST /checkout/{order}/ulasan payload kontrak §9.1', () => {
    const props = { pesanan: pesanan(), ulasan: { boleh: true, sudah: [] } };
    let pohon = renderPohon(CheckoutSuccess, props);

    const aktif = formAktif(pohon);
    harus(aktif.length === 2, `form aktif harus 2, dapat ${aktif.length}`);

    formUntuk(pohon, 3).props.onSubmit({ product_id: 3, rating: 5, comment: 'Bagus' });

    harus(kendali.kunjungan.length === 1, `panggilan router harus 1, dapat ${kendali.kunjungan.length}`);

    const kunjungan = kendali.kunjungan[0];
    harus(kunjungan.metode === 'post', `metode harus post, dapat ${kunjungan.metode}`);
    harus(kunjungan.url === '/checkout/21/ulasan', `url salah: ${kunjungan.url}`);
    harus(Array.isArray(kunjungan.data?.ulasan) && kunjungan.data.ulasan.length === 1, 'payload `ulasan` harus array 1 entri');
    harus(kunjungan.data.ulasan[0].product_id === 3, 'product_id entri salah');
    harus(kunjungan.data.ulasan[0].rating === 5, 'rating entri salah');
    harus(kunjungan.data.ulasan[0].comment === 'Bagus', 'comment entri salah');
    harus(kunjungan.opsi?.preserveScroll === true, 'preserveScroll harus true');
    harus(typeof kunjungan.opsi?.onSuccess === 'function', 'onSuccess hilang');
    harus(typeof kunjungan.opsi?.onFinish === 'function', 'onFinish hilang');

    kunjungan.opsi.onSuccess();
    pohon = renderPohon(CheckoutSuccess, props);

    harus(formAktif(pohon).length === 1, `sisa form aktif harus 1, dapat ${formAktif(pohon).length}`);
    harus(formUntuk(pohon, 3).props.submitted === true, 'produk yang baru dikirim harus tampil sebagai terkirim');
    harus(formUntuk(pohon, 3).props.alreadyReviewed === false, 'produk yang baru dikirim bukan "sudah pernah dinilai"');
    harus(formUntuk(pohon, 7).props.submitted === undefined, 'produk lain harus tetap berupa form aktif');
    harus(typeof formUntuk(pohon, 7).props.onSubmit === 'function', 'produk lain harus tetap bisa dinilai');

    kunjungan.opsi.onFinish();
});

uji('2. kirim ganda dicegah selama kiriman pertama belum selesai', () => {
    const props = { pesanan: pesanan(), ulasan: { boleh: true, sudah: [] } };
    let pohon = renderPohon(CheckoutSuccess, props);

    formUntuk(pohon, 3).props.onSubmit({ product_id: 3, rating: 4, comment: null });
    harus(kendali.kunjungan.length === 1, `hanya 1 kiriman, dapat ${kendali.kunjungan.length}`);
    harus(kendali.kunjungan[0].data.ulasan[0].comment === null, 'komentar kosong harus tetap null');

    // Pass berikutnya = seperti React mengejar state `busyProduct` sebelum pengguna bisa klik lagi.
    pohon = renderPohon(CheckoutSuccess, props);
    harus(formUntuk(pohon, 3).props.submitting === true, 'produk yang sedang dikirim harus berstatus submitting');
    harus(formUntuk(pohon, 7).props.submitting === false, 'produk lain tidak berstatus submitting');

    formUntuk(pohon, 7).props.onSubmit({ product_id: 7, rating: 5, comment: null });
    harus(kendali.kunjungan.length === 1, `kiriman kedua harus ditahan, dapat ${kendali.kunjungan.length}`);

    kendali.kunjungan[0].opsi.onFinish();
    pohon = renderPohon(CheckoutSuccess, props);
    harus(formUntuk(pohon, 7).props.submitting === false, 'status submitting harus bersih setelah selesai');

    formUntuk(pohon, 7).props.onSubmit({ product_id: 7, rating: 5, comment: null });
    harus(kendali.kunjungan.length === 2, `setelah selesai kiriman berikutnya jalan, dapat ${kendali.kunjungan.length}`);
    harus(kendali.kunjungan[1].data.ulasan[0].product_id === 7, 'produk kiriman kedua salah');
});

uji('3. boleh=false & semua sudah diulas -> tanpa form, kartu terkunci, terima kasih', () => {
    const props = { pesanan: pesanan(), ulasan: { boleh: false, sudah: [3, 7] } };
    const pohon = renderPohon(CheckoutSuccess, props);

    harus(formAktif(pohon).length === 0, `form aktif harus 0, dapat ${formAktif(pohon).length}`);
    harus(formTerkunci(pohon).length === 2, `kartu terkunci harus 2, dapat ${formTerkunci(pohon).length}`);
    harus(formTerkunci(pohon).every((el) => el.props.alreadyReviewed === true), 'kartu harus berstatus sudah dinilai');
    harus(teksPohon(pohon).includes(SUKSES), 'notice terima kasih hilang');
});

uji('4. belum boleh dinilai -> tidak ada jalur kirim ulasan sama sekali', () => {
    const props = {
        pesanan: pesanan({ payment_status: 'pending', paid_at: null }),
        ulasan: { boleh: false, sudah: [] },
    };
    const pohon = renderPohon(CheckoutSuccess, props);

    harus(cariSemua(pohon, bernama('ReviewForm')).length === 0, 'tidak boleh ada kartu penilaian');
    harus(kendali.kunjungan.length === 0, 'tidak boleh ada panggilan router');
});

uji('5. galat validasi server menempel pada produk yang dikirim', () => {
    const props = {
        pesanan: pesanan(),
        ulasan: { boleh: true, sudah: [] },
        errors: { 'ulasan.0.rating': 'Rating wajib diisi.' },
    };
    let pohon = renderPohon(CheckoutSuccess, props);

    harus(formUntuk(pohon, 3).props.error === null, 'galat tidak boleh muncul sebelum ada kiriman');

    formUntuk(pohon, 3).props.onSubmit({ product_id: 3, rating: 0, comment: null });
    pohon = renderPohon(CheckoutSuccess, props);

    harus(formUntuk(pohon, 3).props.error === 'Rating wajib diisi.', 'galat server harus menempel pada produk 3');
    harus(formUntuk(pohon, 7).props.error === null, 'produk lain tidak boleh kena galat');
});

uji('6. seluruh produk selesai dinilai dalam sesi -> form habis + terima kasih', () => {
    const props = { pesanan: pesanan(), ulasan: { boleh: true, sudah: [] } };
    let pohon = renderPohon(CheckoutSuccess, props);

    [3, 7].forEach((id) => {
        formUntuk(pohon, id).props.onSubmit({ product_id: id, rating: 5, comment: null });
        const kunjungan = kendali.kunjungan[kendali.kunjungan.length - 1];
        kunjungan.opsi.onSuccess();
        kunjungan.opsi.onFinish();
        pohon = renderPohon(CheckoutSuccess, props);
    });

    harus(formAktif(pohon).length === 0, `form aktif harus 0, dapat ${formAktif(pohon).length}`);
    harus(formTerkunci(pohon).length === 2, `kartu terkirim harus 2, dapat ${formTerkunci(pohon).length}`);
    harus(teksPohon(pohon).includes(SUKSES), 'notice terima kasih hilang');
    harus(kendali.kunjungan.length === 2, `total kiriman harus 2, dapat ${kendali.kunjungan.length}`);
});

uji('7. boleh=false + masih ada sisa produk -> tanpa form aktif, nol panggilan router', () => {
    const props = { pesanan: pesanan(), ulasan: { boleh: false, sudah: [3] } };
    const pohon = renderPohon(CheckoutSuccess, props);

    harus(formAktif(pohon).length === 0, `form aktif harus 0 saat boleh=false, dapat ${formAktif(pohon).length}`);
    harus(formUntuk(pohon, 7) === null, 'produk sisa tidak dirender sebagai kartu penilaian');
    harus(formUntuk(pohon, 3)?.props.alreadyReviewed === true, 'kartu produk yang sudah diulas harus tetap tampil terkunci');
    harus(kendali.kunjungan.length === 0, `tidak boleh ada panggilan router, dapat ${kendali.kunjungan.length}`);
    harus(teksPohon(pohon).includes('Penilaianmu'), 'judul harus "Penilaianmu" saat gerbang tertutup');
});

// ---------------------------------------------------------------- laporan
const lebar = Math.max(...hasil.map((h) => h.nama.length));
hasil.forEach((h) => console.log(`${h.status.padEnd(5)} | ${h.nama.padEnd(lebar)} | ${h.catatan}`));

const gagal = hasil.filter((h) => h.status === 'GAGAL').length;
console.log(`\nRINGKASAN: ${hasil.length - gagal}/${hasil.length} uji lulus`);
process.exitCode = gagal === 0 ? 0 : 1;

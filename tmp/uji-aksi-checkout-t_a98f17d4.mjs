/**
 * Harness interaksi kartu t_a98f17d4 (file uji lokal, bukan bagian aplikasi).
 *
 * Menguji /checkout tanpa browser dan tanpa pustaka uji baru:
 *   - React inti diganti shim store: --alias:react=./tmp/shim-react-t_321bf03c.mjs
 *   - '@inertiajs/react' diganti stub pencatat: --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs
 *   - `document.getElementById` dipalsukan supaya panggilan scrollIntoView/focus dapat direkam
 *
 * Bangun bundel (pakai biner esbuild langsung; pembungkus npm meneruskan gagal tanpa pesan):
 *   ./node_modules/@esbuild/win32-x64/esbuild.exe tmp/uji-aksi-checkout-t_a98f17d4.mjs --bundle \
 *     --platform=node --format=esm --jsx=automatic --packages=external \
 *     --outfile=tmp/uji-aksi-checkout-t_a98f17d4.bundle.mjs \
 *     --alias:react/jsx-runtime=./tmp/shim-jsx-runtime-t_321bf03c.mjs \
 *     --alias:react=./tmp/shim-react-t_321bf03c.mjs \
 *     --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs
 *   node tmp/uji-aksi-checkout-t_a98f17d4.bundle.mjs
 *
 * Batasan yang disadari: ini bukan browser. Yang diuji adalah kontrak pemanggilan
 * (URL, data form, opsi Inertia, pesan validasi, notice, gulir/fokus) — bukan tata letak
 * atau tampilan sesungguhnya.
 */
import { readFileSync } from 'node:fs';
import { store, mulaiPass, bersihkanStore } from './shim-react-t_321bf03c.mjs';
import { kendali, bersihkan } from './stub-inertia-t_321bf03c.mjs';
import Checkout from '../resources/js/Pages/Public/Checkout.jsx';
import Field from '../resources/js/Components/Field.jsx';
import Input from '../resources/js/Components/Input.jsx';
import OrderSummary from '../resources/js/Components/OrderSummary.jsx';

// ------------------------------------------------- pesan server (sumber kebenaran)
const berkasRequest = readFileSync(new URL('../app/Http/Requests/CheckoutRequest.php', import.meta.url), 'utf8');
const pesanServer = {};

for (const m of berkasRequest.matchAll(/'([a-z_]+)\.([a-z_]+)'\s*=>\s*'([^']*)'/g)) {
    pesanServer[`${m[1]}.${m[2]}`] = m[3];
}

// ---------------------------------------------------------------- DOM minimal
let gerakDikurangi = false;
const dicatat = { gulir: [], fokus: [] };
const elemenAda = new Map();

const daftarId = [
    'customer_name',
    'customer_phone',
    'customer_email',
    'customer_address',
    'customer_city',
    'customer_postal_code',
    'note',
];

const daftarkanElemen = (id) => {
    if (!elemenAda.has(id)) {
        elemenAda.set(id, {
            id,
            scrollIntoView(opsi) {
                dicatat.gulir.push({ id, opsi });
            },
            focus(opsi) {
                dicatat.fokus.push({ id, opsi });
            },
        });
    }

    return elemenAda.get(id);
};

daftarId.forEach(daftarkanElemen);

const banyakKelas = () => ({ add() {}, remove() {}, toggle() {}, contains: () => false });
const jam = { antre: [], urut: 0 };

globalThis.HTMLElement = class HTMLElement {};

globalThis.window = {
    scrollY: 0,
    innerWidth: 1280,
    location: { href: 'http://127.0.0.1:8000/checkout', pathname: '/checkout', search: '' },
    matchMedia: () => ({ matches: gerakDikurangi, addEventListener() {}, removeEventListener() {} }),
    addEventListener() {},
    removeEventListener() {},
    setTimeout(fn, ms) {
        jam.urut += 1;
        jam.antre.push({ id: jam.urut, fn, ms });

        return jam.urut;
    },
    clearTimeout(id) {
        jam.antre = jam.antre.filter((t) => t.id !== id);
    },
};

globalThis.document = {
    visibilityState: 'visible',
    activeElement: null,
    documentElement: { classList: banyakKelas(), style: {} },
    body: {
        style: { overflow: '' },
        classList: banyakKelas(),
        appendChild() {},
        removeChild() {},
        addEventListener() {},
        removeEventListener() {},
        contains: () => false,
    },
    addEventListener() {},
    removeEventListener() {},
    getElementById: (id) => elemenAda.get(id) ?? null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ style: {}, classList: banyakKelas(), appendChild() {} }),
};

// ---------------------------------------------------------------- render pass
/**
 * Jalankan satu fungsi komponen sampai state stabil (maks 10 pass).
 * Satu komponen per pass — syarat model hook shim (urutan hook).
 */
const renderPohon = (Komponen, props, maks = 10) => {
    let pohon = null;

    for (let i = 0; i < maks; i += 1) {
        mulaiPass();
        pohon = Komponen(props);

        if (!store.kotor) break;
    }

    return pohon;
};

const kumpulan = (pohon, hasil = []) => {
    if (pohon === null || pohon === undefined || typeof pohon === 'boolean') return hasil;

    if (Array.isArray(pohon)) {
        pohon.forEach((isi) => kumpulan(isi, hasil));

        return hasil;
    }

    if (typeof pohon === 'string' || typeof pohon === 'number') return hasil;
    if (typeof pohon.type === 'function' && pohon.type.__shim) return hasil;

    hasil.push(pohon);
    kumpulan(pohon.props?.children, hasil);

    return hasil;
};

const semuaElemen = (pohon) => kumpulan(pohon);
const cari = (pohon, predikat) => semuaElemen(pohon).find(predikat) ?? null;
const cariSemua = (pohon, predikat) => semuaElemen(pohon).filter(predikat);

const bernama = (nama) => (el) => typeof el.type === 'function' && el.type.name === nama;
const berid = (id) => (el) => el.props?.id === id;

/** Semua teks yang terlihat di pohon (untuk cek microcopy). */
const teksPohon = (pohon) => {
    const bagian = [];
    const kumpul = (simpul) => {
        if (simpul === null || simpul === undefined || typeof simpul === 'boolean') return;
        if (Array.isArray(simpul)) return simpul.forEach(kumpul);
        if (typeof simpul === 'string' || typeof simpul === 'number') {
            bagian.push(String(simpul));

            return;
        }
        if (typeof simpul === 'object') kumpul(simpul.props?.children);
    };

    kumpul(pohon);

    return bagian.join(' | ');
};

const kirimKejadian = (el, nilai) =>
    el.props.onChange?.({ target: { value: nilai }, currentTarget: { value: nilai }, preventDefault() {} });

const klik = (el) => el.props.onClick?.({ preventDefault() {}, stopPropagation() {}, currentTarget: { disabled: false } });
const poskan = (el) => el.props.onSubmit?.({ preventDefault() {} });

const medanDari = (pohon, htmlFor) => cari(pohon, (el) => bernama('Field')(el) && el.props.htmlFor === htmlFor);

const noticeKolom = (pohon) =>
    cariSemua(pohon, bernama('InlineNotice')).filter(
        (el) => el.props.tone === 'error' && String(el.props.title ?? '').includes('kolom yang perlu diperbaiki')
    );

const tombolPerbaiki = (pohon) =>
    cariSemua(pohon, bernama('Button')).filter((el) => teksPohon(el).includes('Perbaiki kolom'));

// ---------------------------------------------------------------- fixture
const keranjangIsi = () => ({
    items: [
        {
            id: 1,
            product_id: 7,
            name: 'Daster Kulot Batik',
            slug: 'daster-kulot-batik',
            variant_label: 'L / Hitam',
            qty: 2,
            price: 85000,
            subtotal: 170000,
        },
    ],
    count: 2,
    subtotal: 170000,
    shipping_cost: 0,
    total: 170000,
    is_empty: false,
});

const keranjangKosong = () => ({
    items: [],
    count: 0,
    subtotal: 0,
    shipping_cost: 0,
    total: 0,
    is_empty: true,
});

const propsCheckout = ({ keranjang, ...sisa } = {}) => ({
    keranjang: keranjang === undefined ? keranjangIsi() : keranjang,
    prefill: null,
    pembayaran: { method: 'qris', label: 'QRIS (semua e-wallet & m-banking)', expiry_minutes: 5 },
    flash: null,
    ...sisa,
});

const ISI_SAH = {
    customer_name: 'Siti Aminah',
    customer_phone: '081234567890',
    customer_email: 'siti@example.com',
    customer_address: 'Jl. Melati 12, RT 03 RW 04, Pekalongan',
    customer_city: 'Pekalongan',
    customer_postal_code: '51111',
    note: 'Tolong dibungkus rapi.',
};

/** Isi semua kolom lalu kembalikan pohon terakhir (kirim tidak dilakukan). */
const isiSemua = (props, ubah = {}) => {
    const nilai = { ...ISI_SAH, ...ubah };
    let pohon = renderPohon(Checkout, props);

    Object.entries(nilai).forEach(([kunci, isi]) => {
        kirimKejadian(cari(pohon, berid(kunci)), isi);
    });

    return renderPohon(Checkout, props);
};

// ---------------------------------------------------------------- runner
const hasil = [];

const uji = (nama, fn) => {
    bersihkanStore();
    bersihkan();
    dicatat.gulir = [];
    dicatat.fokus = [];
    gerakDikurangi = false;
    jam.antre = [];

    try {
        fn();
        hasil.push({ nama, lulus: true, pesan: '' });
    } catch (galat) {
        hasil.push({ nama, lulus: false, pesan: galat.message });
    }
};

const harus = (syarat, pesan) => {
    if (!syarat) throw new Error(pesan);
};

const sama = (nyata, harap, pesan) => {
    const a = JSON.stringify(nyata);
    const b = JSON.stringify(harap);

    if (a !== b) throw new Error(`${pesan} (dapat ${a}, harap ${b})`);
};

// ========================================================= A. CTA + validasi klien
uji('A1 CTA "Buat Pesanan" submit ke form yang sama, mati hanya saat processing/keranjang kosong', () => {
    const ringkasan = (pohon) => cari(pohon, bernama('OrderSummary'));

    let cta = ringkasan(renderPohon(Checkout, propsCheckout()));
    harus(cta !== null, 'OrderSummary tidak dirender');
    harus(cta.props.formId === 'checkout-form', `CTA tidak menunjuk formulir checkout (formId=${cta.props.formId})`);
    harus(cta.props.ctaLabel === 'Buat Pesanan', 'label CTA berubah');
    harus(cta.props.disabled === false && cta.props.loading === false, 'CTA harus aktif saat keranjang berisi');
    harus(typeof cta.props.onSubmit === 'function', 'CTA kehilangan penangan submit formulir');

    // processing: sekali kirim, tombol mati (cegah double submit).
    kendali.berikutnya.processing = true;
    cta = ringkasan(renderPohon(Checkout, propsCheckout()));
    harus(cta.props.loading === true, 'CTA tidak menandai loading saat processing');
    harus(cta.props.disabled === true, 'CTA masih bisa diklik saat processing');

    kendali.berikutnya.processing = false;
    cta = ringkasan(renderPohon(Checkout, propsCheckout({ keranjang: keranjangKosong() })));
    harus(cta.props.disabled === true, 'CTA harus mati saat keranjang kosong');
    harus(cta.props.loading === false, 'keranjang kosong bukan keadaan memuat');

    cta = ringkasan(renderPohon(Checkout, propsCheckout({ keranjang: null })));
    harus(cta.props.disabled === true, 'keranjang null harus dianggap kosong');
    harus(teksPohon(renderPohon(Checkout, propsCheckout({ keranjang: null }))).includes('Keranjang masih kosong'), 'notice cart-empty hilang');
});

uji('A2 validate() gagal: tidak ada permintaan ke server, notice di atas form DAN di atas CTA', () => {
    const props = propsCheckout();
    const pohon = renderPohon(Checkout, props);

    poskan(cari(pohon, (el) => el.type === 'form'));

    harus(kendali.kunjungan.length === 0, 'formulir tidak sah tetap dikirim ke server');

    const kini = renderPohon(Checkout, props);
    const notice = noticeKolom(kini);
    harus(notice.length === 2, `notice kolom bermasalah tidak tampil dua kali (dapat ${notice.length})`);

    // Isi pesan: kolom pertama + jumlah kolom bermasalah.
    sama(notice[0].props.title, 'Ada 6 kolom yang perlu diperbaiki', 'judul notice salah');
    harus(
        teksPohon(notice[0]).includes('Kolom pertama Nama Penerima: Nama penerima wajib diisi.'),
        'notice tidak menyebut kolom pertama dan sebabnya'
    );
    harus(teksPohon(notice[0]).includes('Perbaiki kolom'), 'tombol Perbaiki kolom hilang dari notice atas');
    sama(teksPohon(notice[1]), teksPohon(notice[0]), 'notice atas CTA berbunyi beda dari notice atas form');

    // Urutan dokumen: notice atas form -> <form> -> notice di dalam OrderSummary (tepat di atas CTA).
    const urut = semuaElemen(kini);
    const indeksForm = urut.findIndex((el) => el.type === 'form');
    const indeksNoticeAtas = urut.indexOf(notice[0]);
    const indeksNoticeBawah = urut.indexOf(notice[1]);
    harus(indeksNoticeAtas < indeksForm, 'notice pertama tidak berada sebelum formulir');
    harus(indeksNoticeBawah > indeksForm, 'notice kedua tidak berada setelah formulir (dekat CTA)');

    const ringkasan = cari(kini, bernama('OrderSummary'));
    harus(
        semuaElemen(ringkasan.props.children).includes(notice[1]),
        'notice dekat CTA tidak berada di dalam OrderSummary'
    );
    harus(
        teksPohon(ringkasan.props.children).includes('Perbaiki kolom'),
        'notice di dalam OrderSummary kehilangan tombol Perbaiki kolom'
    );

    // Galat per kolom ikut terpasang di Field dan Input-nya.
    sama(medanDari(kini, 'customer_name').props.error, 'Nama penerima wajib diisi.', 'galat Field name salah');
    sama(cari(kini, berid('customer_name')).props.error, 'Nama penerima wajib diisi.', 'galat Input name salah');
    sama(medanDari(kini, 'note').props.error, null, 'catatan opsional tidak boleh dianggap salah');

    // Bukti sambungan aria: Field & Input tanpa hook dirender sendiri.
    const fieldJadi = renderPohon(Field, medanDari(kini, 'customer_name').props);
    harus(teksPohon(fieldJadi).includes('Nama penerima wajib diisi.'), 'pesan galat tidak dirender Field');
    harus(cari(fieldJadi, (el) => el.props?.id === 'customer_name-error') !== null, 'elemen galat tanpa id customer_name-error');
    const inputJadi = cari(renderPohon(Input, cari(kini, berid('customer_name')).props), (el) => el.type === 'input');
    harus(inputJadi.props['aria-invalid'] === 'true', 'input galat tanpa aria-invalid');
    sama(inputJadi.props['aria-describedby'], 'customer_name-error', 'input galat tanpa aria-describedby');

    // Memperbaiki satu kolom menghapus galatnya.
    kirimKejadian(cari(kini, berid('customer_name')), 'Siti Aminah');
    const sesudah = renderPohon(Checkout, props);
    sama(medanDari(sesudah, 'customer_name').props.error, null, 'galat kolom tidak dibersihkan setelah diperbaiki');
    harus(noticeKolom(sesudah).length === 2, 'notice harus tetap tampil sampai semua kolom benar');
});

uji('A3 pesan klien sama persis dengan pesan server (dibaca dari CheckoutRequest.php)', () => {
    const kasus = [
        [{ customer_name: 'ab' }, 'customer_name.min', 'Nama penerima minimal 3 karakter.'],
        [{ customer_name: 'x'.repeat(101) }, 'customer_name.max', 'Nama penerima maksimal 100 karakter.'],
        [{ customer_phone: '12345' }, 'customer_phone.regex', 'Nomor WhatsApp tidak valid.'],
        [{ customer_phone: '62812' }, 'customer_phone.regex', 'Nomor WhatsApp tidak valid.'],
        [{ customer_email: 'bukan-email' }, 'customer_email.email', 'Email tidak valid.'],
        [{ customer_address: 'pendek' }, 'customer_address.min', 'Alamat terlalu singkat. Tulis jalan, nomor, RT/RW.'],
        [{ customer_city: 'ab' }, 'customer_city.min', 'Nama kota/kecamatan terlalu singkat.'],
        [{ customer_postal_code: '1234' }, 'customer_postal_code.digits', 'Kode pos harus 5 angka.'],
        [{ customer_postal_code: '12345 6' }, 'customer_postal_code.digits', 'Kode pos harus 5 angka.'],
        [{ note: 'x'.repeat(501) }, 'note.max', 'Catatan maksimal 500 karakter.'],
    ];

    kasus.forEach(([ubah, kunci, harap]) => {
        bersihkanStore();
        bersihkan();
        dicatat.gulir = [];
        dicatat.fokus = [];

        const props = propsCheckout();
        const pohon = isiSemua(props, ubah);
        poskan(cari(pohon, (el) => el.type === 'form'));

        const kolom = Object.keys(ubah)[0];
        harus(kendali.kunjungan.length === 0, `${kolom} ${JSON.stringify(ubah[kolom]).slice(0, 20)} tetap dikirim ke server`);
        sama(medanDari(renderPohon(Checkout, props), kolom).props.error, harap, `pesan ${kunci} tidak sesuai`);
        sama(
            pesanServer[kunci],
            harap,
            `harapan harness tidak lagi sama dengan CheckoutRequest.php untuk ${kunci}`
        );
    });

    // Nilai sah (termasuk +62) harus lolos ke server.
    bersihkanStore();
    bersihkan();
    const props = propsCheckout();
    poskan(cari(isiSemua(props, { customer_phone: '+6281234567890' }), (el) => el.type === 'form'));
    harus(kendali.kunjungan.length === 1, 'nilai sah ditolak validasi klien');
    sama(kendali.kunjungan[0].url, '/checkout', 'URL kirim salah');
});

uji('A4 kirim sah: URL literal, data form utuh, dan processing mencegah kirim ganda', () => {
    const props = propsCheckout();
    poskan(cari(isiSemua(props), (el) => el.type === 'form'));

    const kirim = kendali.kunjungan[kendali.kunjungan.length - 1] ?? null;
    harus(kirim !== null, 'formulir sah tidak dikirim');
    harus(kirim.metode === 'post', 'aksi checkout bukan POST');
    sama(kirim.url, '/checkout', 'URL checkout salah');
    sama(kirim.data, ISI_SAH, 'data form tidak utuh');
    harus(kirim.opsi.preserveScroll === true, 'preserveScroll hilang');
    harus(typeof kirim.opsi.onHttpException === 'function', 'penangan 429 hilang');

    // 429 -> pesan tunggu, bukan gagal senyap.
    kirim.opsi.onHttpException({ status: 429 });
    harus(
        teksPohon(renderPohon(Checkout, props)).includes('Terlalu banyak percobaan membuat pesanan'),
        'pesan 429 tidak tampil'
    );

    // processing: klik kedua tidak menghasilkan permintaan baru.
    bersihkanStore();
    bersihkan();
    kendali.berikutnya.processing = true;
    const sebelum = kendali.kunjungan.length;
    poskan(cari(renderPohon(Checkout, propsCheckout()), (el) => el.type === 'form'));
    sama(kendali.kunjungan.length, sebelum, 'kirim ganda saat processing tidak dicegah');
});

// ================================================= B. galat server & tombol perbaikan
uji('B1 galat dari server: notice sama + gulir ke kolom pertama tanpa merebut fokus', () => {
    const props = propsCheckout();
    renderPohon(Checkout, props);

    kendali.formulir[0].errors = {
        customer_email: 'Email tidak valid.',
        customer_postal_code: 'Kode pos harus 5 angka.',
    };
    const pohon = renderPohon(Checkout, props);

    const notice = noticeKolom(pohon);
    harus(notice.length === 2, `notice galat server tidak tampil dua kali (dapat ${notice.length})`);
    sama(notice[0].props.title, 'Ada 2 kolom yang perlu diperbaiki', 'jumlah kolom bermasalah dari server salah');
    harus(
        teksPohon(notice[0]).includes('Kolom pertama Email: Email tidak valid.'),
        'notice galat server tidak menyebut kolom pertama'
    );

    sama(dicatat.gulir, [{ id: 'customer_email', opsi: { behavior: 'smooth', block: 'center' } }], 'gulir kolom pertama salah');
    sama(dicatat.fokus, [], 'fokus tidak boleh direbut saat jawaban server datang');
    sama(medanDari(pohon, 'customer_email').props.error, 'Email tidak valid.', 'galat server tidak sampai ke Field');
});

uji('B2 tombol "Perbaiki kolom": scrollIntoView + focus kolom pertama, hormat prefers-reduced-motion', () => {
    const props = propsCheckout();
    poskan(cari(renderPohon(Checkout, props), (el) => el.type === 'form'));

    const pohon = renderPohon(Checkout, props);
    const tombol = tombolPerbaiki(pohon);
    harus(tombol.length === 2, `tombol Perbaiki kolom tidak ada di kedua notice (dapat ${tombol.length})`);

    klik(tombol[0]);
    sama(dicatat.gulir, [{ id: 'customer_name', opsi: { behavior: 'smooth', block: 'center' } }], 'gulir kolom pertama salah');
    sama(dicatat.fokus, [{ id: 'customer_name', opsi: { preventScroll: true } }], 'fokus kolom pertama salah');

    // Tombol di notice kedua menuju kolom yang sama.
    dicatat.gulir = [];
    dicatat.fokus = [];
    klik(tombol[1]);
    sama(dicatat.gulir.map((g) => g.id), ['customer_name'], 'tombol dekat CTA menuju kolom lain');
    sama(dicatat.fokus.map((f) => f.id), ['customer_name'], 'tombol dekat CTA memfokuskan kolom lain');

    // prefers-reduced-motion: gulir tanpa animasi.
    dicatat.gulir = [];
    gerakDikurangi = true;
    klik(tombol[0]);
    sama(dicatat.gulir, [{ id: 'customer_name', opsi: { behavior: 'instant', block: 'center' } }], 'prefers-reduced-motion diabaikan');
});

uji('B3 galat kolom kedua kali (setelah semua lengkap) menggulir ke kolom yang benar', () => {
    const props = propsCheckout();
    const pohon = isiSemua(props, { customer_postal_code: '5111' });
    poskan(cari(pohon, (el) => el.type === 'form'));

    harus(kendali.kunjungan.length === 0, 'kode pos 4 angka tetap dikirim ke server');
    const kini = renderPohon(Checkout, props);
    sama(noticeKolom(kini)[0].props.title, 'Ada 1 kolom yang perlu diperbaiki', 'hitungan kolom bermasalah salah');
    harus(
        teksPohon(noticeKolom(kini)[0]).includes('Kolom Kode Pos: Kode pos harus 5 angka.'),
        'kolom pertama bukan Kode Pos'
    );

    klik(tombolPerbaiki(kini)[0]);
    sama(dicatat.fokus.map((f) => f.id), ['customer_postal_code'], 'fokus bukan pada kolom kode pos');
});

uji('B4 order tidak dobel saat error-payment (design §5.7): pesan flash server tetap tampil', () => {
    const props = propsCheckout({ flash: { error: 'Gagal membuat pembayaran QRIS. Coba lagi.' } });
    const pohon = renderPohon(Checkout, props);

    harus(
        teksPohon(pohon).includes('Gagal membuat pembayaran QRIS. Coba lagi.'),
        'pesan galat pembayaran dari server tidak ditampilkan'
    );
    harus(noticeKolom(pohon).length === 0, 'notice kolom bermasalah muncul tanpa galat kolom');
    const ringkasan = cari(pohon, bernama('OrderSummary'));
    harus(ringkasan.props.formId === 'checkout-form', 'CTA berubah target setelah galat pembayaran');
});

// ---------------------------------------------------------------- laporan
console.log('=== UJI INTERAKSI kartu t_a98f17d4 (/checkout) ===');

hasil.forEach((item) => {
    console.log(`${item.lulus ? '[OK]  ' : '[GAGAL]'} ${item.nama}${item.lulus ? '' : ` -> ${item.pesan}`}`);
});

const gagal = hasil.filter((item) => !item.lulus).length;

console.log(`\nTOTAL: ${hasil.length} uji, ${gagal} gagal`);
console.log(`Cek 1: pesan server terbaca ${Object.keys(pesanServer).length} kunci dari CheckoutRequest.php`);

process.exitCode = gagal === 0 ? 0 : 1;

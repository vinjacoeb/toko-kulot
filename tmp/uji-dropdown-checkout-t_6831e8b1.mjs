/**
 * Harness kartu t_6831e8b1 (F1 v1.5): dropdown ekspedisi di /checkout — file uji lokal, bukan aplikasi.
 *
 * Tanpa browser dan tanpa pustaka uji baru:
 *   react        -> shim store        tmp/shim-react-t_321bf03c.mjs
 *   inertia      -> stub pencatat     tmp/stub-inertia-t_321bf03c.mjs
 *   fetch()      -> jawaban tarif palsu (di bawah)
 *   setTimeout   -> antrean jam buatan (debounce 600 ms dijalankan manual)
 *
 * Bangun + jalankan:
 *   ./node_modules/@esbuild/win32-x64/esbuild.exe tmp/uji-dropdown-checkout-t_6831e8b1.mjs --bundle \
 *     --platform=node --format=esm --jsx=automatic --packages=external \
 *     --outfile=tmp/uji-dropdown-checkout-t_6831e8b1.bundle.mjs \
 *     --alias:react/jsx-runtime=./tmp/shim-jsx-runtime-t_321bf03c.mjs \
 *     --alias:react=./tmp/shim-react-t_321bf03c.mjs \
 *     --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs
 *   node tmp/uji-dropdown-checkout-t_6831e8b1.bundle.mjs
 *
 * Batas: menguji struktur elemen, teks, data form, dan gulir/fokus — bukan tata letak 360 px.
 */
import { store, mulaiPass, bersihkanStore } from './shim-react-t_321bf03c.mjs';
import { kendali, bersihkan } from './stub-inertia-t_321bf03c.mjs';
import Checkout from '../resources/js/Pages/Public/Checkout.jsx';

// ---------------------------------------------------------------- DOM minimal
const dicatat = { gulir: [], fokus: [] };
const elemenAda = new Map();

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
};

['customer_name', 'customer_address', 'customer_postal_code', 'judul-pengiriman', 'pilih-layanan'].forEach(daftarkanElemen);

const banyakKelas = () => ({ add() {}, remove() {}, toggle() {}, contains: () => false });
const jam = { antre: [], urut: 0 };

globalThis.HTMLElement = class HTMLElement {};

globalThis.window = {
    scrollY: 0,
    innerWidth: 1280,
    location: { href: 'http://127.0.0.1:8000/checkout', pathname: '/checkout', search: '' },
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
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
    body: { style: {}, classList: banyakKelas(), appendChild() {}, removeChild() {}, addEventListener() {}, removeEventListener() {}, contains: () => false },
    addEventListener() {},
    removeEventListener() {},
    getElementById: (id) => elemenAda.get(id) ?? null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ style: {}, classList: banyakKelas(), appendChild() {} }),
};

// ---------------------------------------------------------------- tarif palsu
const OPSI = [
    { courier_code: 'jne', courier_name: 'JNE', service_code: 'reg', service_name: 'REG', label: 'JNE REG', etd: '2-3 hari', cost: 18000, is_regular: true, gratis: false },
    { courier_code: 'sicepat', courier_name: 'SiCepat', service_code: 'best', service_name: 'BEST', label: 'SiCepat BEST', etd: null, cost: 25000, is_regular: false, gratis: false },
    { courier_code: 'jne', courier_name: 'JNE', service_code: 'yes', service_name: 'YES', label: 'JNE YES', etd: '1-1 hari', cost: 20000, is_regular: true, gratis: true },
];

let jawabTarif = { ok: true, body: { opsi: OPSI, gratis: { aktif: true, min: 300000, terpenuhi: true }, galat: null } };

globalThis.fetch = async () => ({ ok: jawabTarif.ok, json: async () => jawabTarif.body });

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
const berid = (id) => (el) => el.props?.id === id;
const bertipe = (tipe) => (el) => el.type === tipe;
const bernama = (nama) => (el) => typeof el.type === 'function' && el.type.name === nama;

/** Stub Inertia belum mendukung `setData(fn)`; Checkout memakai bentuk itu. Tambal per formulir. */
const patchSetData = () => {
    const bentuk = kendali.formulir[0];
    if (!bentuk || bentuk.__tambal) return;
    bentuk.setData = (kunci, nilai) => {
        if (typeof kunci === 'function') Object.assign(bentuk.data, kunci(bentuk.data));
        else if (kunci && typeof kunci === 'object') Object.assign(bentuk.data, kunci);
        else bentuk.data[kunci] = nilai;

        return bentuk.data;
    };
    bentuk.__tambal = true;
};

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

const kirimKejadian = (el, nilai) => el.props.onChange?.({ target: { value: nilai }, currentTarget: { value: nilai }, preventDefault() {} });
const poskan = (el) => el.props.onSubmit?.({ preventDefault() {} });

const jalankanTimer = (ms) => {
    const antre = jam.antre.filter((t) => t.ms === ms);
    jam.antre = jam.antre.filter((t) => t.ms !== ms);
    antre.forEach((t) => t.fn());
};

const flush = async () => {
    for (let i = 0; i < 8; i += 1) await new Promise((r) => setImmediate(r));
};

// ---------------------------------------------------------------- fixture
const keranjang = () => ({
    items: [{ id: 1, product_id: 7, name: 'Daster Kulot Batik', slug: 'daster-kulot-batik', variant_label: 'L / Hitam', qty: 2, price: 85000, subtotal: 170000 }],
    count: 2,
    subtotal: 170000,
    shipping_cost: 0,
    total: 170000,
    is_empty: false,
});

const propsCheckout = (pengiriman = {}) => ({
    keranjang: keranjang(),
    prefill: null,
    pengiriman: { mode: 'api', asal: { nama: 'Toko Kulot', kode_pos: '51111' }, berat_gram: 500, gratis: { aktif: true, min: 300000, terpenuhi: true }, ...pengiriman },
    pembayaran: null,
    flash: null,
});

const ISI_SAH = {
    customer_name: 'Siti Aminah',
    customer_phone: '081234567890',
    customer_email: 'siti@example.com',
    customer_address: 'Jl. Melati 12, RT 03 RW 04, Pekalongan',
    customer_city: 'Pekalongan',
    customer_postal_code: '51111',
    note: '',
};

const isiKolom = (props) => {
    let pohon = renderPohon(Checkout, props);
    patchSetData();
    Object.entries(ISI_SAH).forEach(([kunci, isi]) => kirimKejadian(cari(pohon, berid(kunci)), isi));

    return renderPohon(Checkout, props);
};

/** Isi alamat + kode pos, jalankan debounce 600 ms, tunggu jawaban fetch → keadaan `siap`. */
const siapkanTarif = async (props) => {
    let pohon = isiKolom(props);
    jalankanTimer(600);
    await flush();

    return renderPohon(Checkout, props);
};

const selectLayanan = (pohon) => cari(pohon, berid('pilih-layanan'));

const pilih = (pohon, nilai) => {
    kirimKejadian(selectLayanan(pohon), nilai);

    return renderPohon(Checkout, terakhirProps);
};

let terakhirProps = null;

// ---------------------------------------------------------------- runner
const hasil = [];
const daftarUji = [];

const uji = (nama, fn) => daftarUji.push({ nama, fn });

const harus = (syarat, pesan) => {
    if (!syarat) throw new Error(pesan);
};

const sama = (nyata, harap, pesan) => {
    const a = JSON.stringify(nyata);
    const b = JSON.stringify(harap);

    if (a !== b) throw new Error(`${pesan} (dapat ${a}, harap ${b})`);
};

const teksOpsiDari = (pohon) => cariSemua(pohon, bertipe('option')).map((el) => ({ nilai: el.props.value, teks: teksPohon(el.props.children) }));

// ================================================================ uji
uji('D1 keadaan siap: satu Select ber-optgroup, tanpa radio', async () => {
    const props = propsCheckout();
    terakhirProps = props;
    const pohon = await siapkanTarif(props);

    sama(cariSemua(pohon, (el) => el.type === 'input' && el.props?.type === 'radio').length, 0, 'masih ada radio ongkir');

    const selectEl = selectLayanan(pohon);
    harus(selectEl !== null, 'Select #pilih-layanan tidak dirender');
    harus(selectEl.props['aria-describedby'] === 'pilih-layanan-hint', 'Select tanpa aria-describedby pilih-layanan-hint');
    const field = cariSemua(pohon, bernama('Field')).find((el) => el.props.htmlFor === 'pilih-layanan');
    harus(Boolean(field), 'Field pembungkus #pilih-layanan hilang');
    const fieldPohon = renderPohon(field.type, field.props);
    const hint = cari(fieldPohon, berid('pilih-layanan-hint'));
    harus(hint !== null, 'target aria-describedby (hint) tidak ada di DOM');
    harus(teksPohon(hint).includes('Tarif untuk kode pos 51111'), 'hint kode pos salah');
    sama(selectEl.props.value, '', 'nilai awal Select harus kosong (tanpa auto-pilih)');

    const selectPohon = renderPohon(selectEl.type, selectEl.props);
    sama(cariSemua(selectPohon, bertipe('select')).length, 1, 'jumlah Select bukan satu');

    const opsi = teksOpsiDari(selectPohon);
    sama(opsi[0], { nilai: '', teks: 'Pilih layanan pengiriman' }, 'placeholder salah');
    harus(cari(selectPohon, bertipe('option')).props.disabled === true, 'placeholder harus disabled');

    sama(
        opsi.slice(1),
        [
            { nilai: 'jne|reg', teks: 'REG · 2-3 hari · Rp18.000' },
            { nilai: 'jne|yes', teks: 'YES · 1-1 hari · GRATIS' },
            { nilai: 'sicepat|best', teks: 'BEST · — · Rp25.000' },
        ],
        'teks/nilai opsi atau urutan server berubah'
    );

    const grup = cariSemua(selectPohon, bertipe('optgroup'));
    sama(grup.map((g) => g.props.label), ['JNE', 'SiCepat'], 'label optgroup bukan courier_name / urutan kemunculan salah');
});

uji('D2 pilih layanan reguler: tiga field terkirim + ringkasan di bawah kontrol', async () => {
    const props = propsCheckout();
    terakhirProps = props;
    const pohon = await siapkanTarif(props);

    const sesudah = pilih(pohon, 'jne|reg');
    sama(selectLayanan(sesudah).props.value, 'jne|reg', 'nilai Select tidak mengikuti pilihan');
    sama(
        { courier: kendali.formulir[0].data.shipping_courier, service: kendali.formulir[0].data.shipping_service, cost: kendali.formulir[0].data.shipping_cost },
        { courier: 'jne', service: 'reg', cost: 18000 },
        'data form tidak membawa tiga field ongkir'
    );

    const teks = teksPohon(sesudah);
    harus(teks.includes('JNE REG · 2-3 hari'), 'ringkasan pilihan tidak tampil');
    harus(teks.includes('Rp18.000'), 'harga ringkasan tidak tampil');
    harus(!teks.includes('Layanan ini tidak termasuk gratis ongkir.'), 'catatan gratis salah muncul untuk layanan reguler');

    const status = cariSemua(sesudah, (el) => el.props?.role === 'status').filter((el) => teksPohon(el).includes('JNE REG'));
    sama(status.length, 1, 'ringkasan tidak berada di region role=status');
    sama(status[0].props['aria-live'], 'polite', 'region ringkasan bukan aria-live polite');

    const lencana = cariSemua(status[0], bernama('Badge')).map((el) => teksPohon(el.props.children));
    sama(lencana, ['Reguler'], 'badge ringkasan harus hanya Reguler untuk layanan reguler');
});

uji('D3 layanan non-reguler saat gratis terpenuhi: catatan khusus', async () => {
    const props = propsCheckout();
    terakhirProps = props;
    const pohon = await siapkanTarif(props);

    const sesudah = pilih(pohon, 'sicepat|best');
    const teks = teksPohon(sesudah);
    harus(teks.includes('SiCepat BEST · —'), 'ringkasan layanan tanpa etd salah');
    harus(teks.includes('Rp25.000'), 'harga layanan non-reguler salah');
    harus(teks.includes('Layanan ini tidak termasuk gratis ongkir.'), 'catatan gratis hilang untuk layanan non-reguler');
    const status = cariSemua(sesudah, (el) => el.props?.role === 'status').filter((el) => teksPohon(el).includes('SiCepat BEST'));
    sama(status.length, 1, 'ringkasan non-reguler tidak berada di region role=status');
    const lencana = cariSemua(status[0], bernama('Badge')).map((el) => teksPohon(el.props.children));
    sama(lencana, [], 'badge Reguler muncul untuk layanan non-reguler');
});

uji('D4 layanan gratis: shipping_cost 0 + label GRATIS', async () => {
    const props = propsCheckout();
    terakhirProps = props;
    const pohon = await siapkanTarif(props);

    const sesudah = pilih(pohon, 'jne|yes');
    sama(kendali.formulir[0].data.shipping_cost, 0, 'layanan gratis tidak mengirim shipping_cost 0');
    sama(kendali.formulir[0].data.shipping_service, 'yes', 'service_code gratis salah');
    const teks = teksPohon(sesudah);
    harus(teks.includes('GRATIS'), 'ringkasan tidak menampilkan GRATIS');
    const status = cariSemua(sesudah, (el) => el.props?.role === 'status').filter((el) => teksPohon(el).includes('JNE YES'));
    sama(status.length, 1, 'ringkasan gratis tidak berada di region role=status');
    const lencana = cariSemua(status[0], bernama('Badge')).map((el) => teksPohon(el.props.children));
    sama(lencana, ['Reguler', 'Gratis Ongkir'], 'badge layanan gratis salah');
});

uji('D5 submit ditolak tanpa pilihan (mode api) → gulir + fokus Select; mode fake tetap lolos', async () => {
    const props = propsCheckout();
    terakhirProps = props;
    const pohon = await siapkanTarif(props);

    poskan(cari(pohon, bertipe('form')));
    sama(kendali.kunjungan.length, 0, 'mode api tanpa pilihan tetap dikirim ke server');
    sama(dicatat.gulir, [{ id: 'judul-pengiriman', opsi: { behavior: 'smooth', block: 'center' } }], 'gulir ke judul pengiriman hilang');
    sama(dicatat.fokus.filter((f) => f.id === 'pilih-layanan').length, 1, 'Select tidak difokuskan setelah ditolak');
    harus(teksPohon(renderPohon(Checkout, props)).includes('Pilih layanan pengiriman dulu.'), 'alasan tolak hilang');

    // Mode fake: boleh submit tanpa memilih.
    bersihkanStore();
    bersihkan();
    dicatat.gulir = [];
    dicatat.fokus = [];
    const fake = propsCheckout({ mode: 'fake', tarif_uji: 15000 });
    terakhirProps = fake;
    poskan(cari(isiKolom(fake), bertipe('form')));
    sama(kendali.kunjungan.length, 1, 'mode uji tidak boleh diblokir karena belum memilih');
    sama(kendali.kunjungan[0].data.shipping_courier, null, 'mode uji mengirim kurir tanpa pilihan');
    sama(kendali.kunjungan[0].data.shipping_cost, null, 'mode uji mengirim biaya tanpa pilihan');
});

uji('D6 keadaan memuat/kosong/galat tetap tanpa Select', async () => {
    // memuat: debounce sudah jalan, jawaban belum datang.
    const props = propsCheckout();
    terakhirProps = props;
    let pohon = isiKolom(props);
    jalankanTimer(600);
    pohon = renderPohon(Checkout, props);
    sama(selectLayanan(pohon), null, 'Select dirender saat tarif masih dimuat');
    const skeleton = cari(pohon, bernama('SkeletonOpsi'));
    harus(skeleton !== null, 'placeholder memuat tarif hilang');
    harus(teksPohon(renderPohon(skeleton.type, skeleton.props)).includes('Memuat tarif…'), 'teks Memuat tarif… hilang');
    await flush();

    // kosong
    bersihkanStore();
    bersihkan();
    jawabTarif = { ok: true, body: { opsi: [], gratis: { aktif: true, min: 300000, terpenuhi: false }, galat: null } };
    pohon = await siapkanTarif(props);
    sama(selectLayanan(pohon), null, 'Select dirender untuk daftar kosong');
    harus(teksPohon(pohon).includes('Belum ada layanan aktif untuk kode pos ini.'), 'copy kosong hilang');

    // galat
    bersihkanStore();
    bersihkan();
    jawabTarif = { ok: true, body: { opsi: [], gratis: null, galat: 'Ongkir tidak bisa dihitung saat ini. Coba lagi atau hubungi penjual.' } };
    pohon = await siapkanTarif(props);
    sama(selectLayanan(pohon), null, 'Select dirender saat tarif gagal');
    const pemberitahuan = cariSemua(pohon, bernama('InlineNotice')).map((el) => el.props.title);
    harus(pemberitahuan.includes('Tarif gagal dimuat.'), 'judul galat tarif hilang');
    const tombol = cariSemua(pohon, bernama('Button')).map((el) => teksPohon(el.props.children));
    harus(tombol.includes('Coba lagi'), 'tombol Coba lagi hilang');
    harus(cari(pohon, bertipe('form')) !== null, 'galat tarif merusak formulir');
});

// ---------------------------------------------------------------- laporan
console.log('=== UJI DROPDOWN EKSPEDISI t_6831e8b1 (/checkout) ===');

for (const { nama, fn } of daftarUji) {
    bersihkanStore();
    bersihkan();
    dicatat.gulir = [];
    dicatat.fokus = [];
    jam.antre = [];
    jawabTarif = { ok: true, body: { opsi: OPSI, gratis: { aktif: true, min: 300000, terpenuhi: true }, galat: null } };

    try {
        await fn();
        hasil.push({ nama, lulus: true, pesan: '' });
    } catch (galat) {
        hasil.push({ nama, lulus: false, pesan: galat.message });
    }
}

hasil.forEach((item) => console.log(`${item.lulus ? '[OK]  ' : '[GAGAL]'} ${item.nama}${item.lulus ? '' : ` -> ${item.pesan}`}`));

const gagal = hasil.filter((item) => !item.lulus).length;
console.log(`\nTOTAL: ${hasil.length} uji, ${gagal} gagal`);
process.exitCode = gagal === 0 ? 0 : 1;

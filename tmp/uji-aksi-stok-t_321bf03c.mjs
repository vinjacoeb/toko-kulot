/**
 * Harness interaksi kartu t_321bf03c (file uji lokal, bukan bagian aplikasi).
 *
 * Menguji perilaku halaman Stocks tanpa browser dan tanpa pustaka uji baru:
 *   - React inti diganti shim store: --alias:react=./tmp/shim-react-t_321bf03c.mjs
 *   - '@inertiajs/react' diganti stub pencatat: --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs
 *   - fungsi komponen dipanggil langsung; pohon elemen dibaca, handler-nya dipanggil
 *
 * Bangun bundel (perintah ini yang dijalankan, bukan `node_modules/.bin/esbuild` — pembungkus npm
 * itu meneruskan gagal tanpa pesan; pakai biner langsung agar galat terlihat):
 *   ./node_modules/@esbuild/win32-x64/esbuild.exe tmp/uji-aksi-stok-t_321bf03c.mjs --bundle \
 *     --platform=node --format=esm --jsx=automatic --packages=external \
 *     --outfile=tmp/uji-aksi-stok-t_321bf03c.bundle.mjs \
 *     --alias:react/jsx-runtime=./tmp/shim-jsx-runtime-t_321bf03c.mjs \
 *     --alias:react=./tmp/shim-react-t_321bf03c.mjs \
 *     --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs
 *   node tmp/uji-aksi-stok-t_321bf03c.bundle.mjs
 *
 * Batasan yang disadari: ini bukan browser. Yang diuji adalah kontrak pemanggilan
 * (URL, data query, opsi Inertia, pesan validasi, state UI) — bukan tata letak, fokus
 * keyboard, atau tampilan sesungguhnya.
 */
import React from 'react';
import { store, mulaiPass, bersihkanStore } from './shim-react-t_321bf03c.mjs';
import { router, kendali, bersihkan } from './stub-inertia-t_321bf03c.mjs';
import Index from '../resources/js/Pages/Admin/Stocks/Index.jsx';
import History from '../resources/js/Pages/Admin/Stocks/History.jsx';
import StokAksiModal from '../resources/js/Pages/Admin/Stocks/partials/StokAksiModal.jsx';
import SearchInput from '../resources/js/Components/SearchInput.jsx';
import DataTable from '../resources/js/Components/DataTable.jsx';
import Field from '../resources/js/Components/Field.jsx';
import Input from '../resources/js/Components/Input.jsx';

// ---------------------------------------------------------------- DOM minimal
const jam = { antre: [], urut: 0 };
const banyakKelas = () => ({ add() {}, remove() {}, toggle() {}, contains: () => false });

globalThis.HTMLElement = class HTMLElement {};

globalThis.window = {
    scrollY: 0,
    innerWidth: 1280,
    location: { href: 'http://127.0.0.1:8000/admin/stok', pathname: '/admin/stok', search: '' },
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
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ style: {}, classList: banyakKelas(), appendChild() {} }),
};

/** Jalankan timer tunda (debounce SearchInput) yang masih mengantre. */
const majukanWaktu = () => {
    const kini = [...jam.antre];
    jam.antre = [];
    kini.forEach((t) => t.fn());

    return kini.length;
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
const berteks = (potongan) => (el) => {
    const isi = el.props?.children;

    return typeof isi === 'string' && isi.includes(potongan);
};

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

const klik = (el) =>
    el.props.onClick?.({ preventDefault() {}, stopPropagation() {}, currentTarget: { disabled: false } });

/** Tombol (Button) berdasarkan potongan teks labelnya. */
// Apakah teks tampil sebagai nilai prop di suatu tempat dalam pohon (mis. EmptyState/InlineNotice
// menerima pesan lewat prop, bukan anak elemen).
const adaNilai = (simpul, teks) => {
    if (simpul === null || simpul === undefined) return false;
    if (typeof simpul === 'string') return simpul.includes(teks);
    if (Array.isArray(simpul)) return simpul.some((anak) => adaNilai(anak, teks));
    if (typeof simpul === 'object') {
        if (typeof simpul.type === 'function' || typeof simpul.type === 'object') {
            return adaNilai(simpul.props ?? {}, teks) || adaNilai(simpul.props?.children, teks);
        }
        return Object.values(simpul).some((nilai) => adaNilai(nilai, teks));
    }
    return false;
};

const tombol = (pohon, teks) => cariSemua(pohon, bernama('Button')).find((el) => teksPohon(el).includes(teks)) ?? null;

const poskan = (el) => el.props.onSubmit?.({ preventDefault() {} });

// ---------------------------------------------------------------- fixture
const barisIndex = (ubah = {}) => ({
    id: 12,
    product: { id: 7, name: 'Daster Batik Kulot', slug: 'daster-batik-kulot' },
    size: 'L',
    color: 'Hitam',
    label: 'L / Hitam',
    sku: 'DBK-L-HTM',
    stock: 9,
    is_active: true,
    status: 'aman',
    updated_at: '2026-10-20 09:15:00',
    ...ubah,
});

const paginator = (data, meta = {}) => ({
    data,
    links: [],
    meta: { current_page: 1, last_page: 1, per_page: 15, total: data.length, ...meta },
});

const propsIndex = (ubah = {}) => ({
    stok: paginator([barisIndex()], { total: 1 }),
    filter: { q: null, status: 'semua', kategori: null, urut: 'nama' },
    kategori: [{ id: 3, name: 'Daster', slug: 'daster' }],
    ringkasan: { varian: 24, habis: 2, kritis: 5 },
    flash: null,
    errors: null,
    ...ubah,
});

const barisRiwayat = (ubah = {}) => ({
    id: 7,
    product_name: 'Daster Batik Kulot',
    variant_label: 'L / Hitam',
    variant_sku: 'DBK-L-HTM',
    type: 'in',
    tipe_label: 'Masuk',
    qty: 10,
    signed_qty: 10,
    note: 'Kiriman supplier',
    admin: { id: 2, name: 'Sari Admin' },
    created_at: '2026-10-20 09:15:00',
    ...ubah,
});

const propsHistory = (ubah = {}) => ({
    riwayat: paginator([barisRiwayat()], { total: 1 }),
    filter: { q: null, tipe: 'semua', varian: null },
    varian: [{ id: 12, label: 'L / Hitam', product_name: 'Daster Batik Kulot', sku: 'DBK-L-HTM' }],
    ringkasan: { masuk: 4, keluar: 1, adjust: 2, sale: 3 },
    flash: null,
    ...ubah,
});

// ---------------------------------------------------------------- runner
const hasil = [];

const uji = (nama, fn) => {
    // Store hook shim berkunci URUTAN per pass, jadi harus bersih di antara dua uji.
    bersihkanStore();
    bersihkan();
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

const kunjunganTerakhir = () => kendali.kunjungan[kendali.kunjungan.length - 1] ?? null;

// =========================================================== A. halaman stok
uji('A1 tombol urut tabel mengirim query urut ke server', () => {
    bersihkan();
    let tabel = cari(renderPohon(Index, propsIndex()), bernama('DataTable'));
    sama(tabel.props.sort, { key: 'produk', dir: 'asc' }, 'penanda urut awal salah');

    tabel.props.onSort('stok');
    sama(kunjunganTerakhir(), {
        metode: 'get',
        url: '/admin/stok',
        data: { urut: 'stok_terbesar' },
        opsi: {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: kunjunganTerakhir().opsi.onStart,
            onFinish: kunjunganTerakhir().opsi.onFinish,
            onError: kunjunganTerakhir().opsi.onError,
        },
    }, 'urut stok pertama bukan stok_terbesar');

    tabel = cari(
        renderPohon(Index, propsIndex({ filter: { q: null, status: 'semua', kategori: null, urut: 'stok_terbesar' } })),
        bernama('DataTable')
    );
    sama(tabel.props.sort, { key: 'stok', dir: 'desc' }, 'penanda urut stok_terbesar salah');

    tabel.props.onSort('stok');
    sama(kunjunganTerakhir().data, { urut: 'stok_terkecil' }, 'urut kedua bukan stok_terkecil');

    tabel.props.onSort('produk');
    sama(kunjunganTerakhir().data, {}, 'kembali ke urut nama harus tanpa query');
});

uji('A2 filter status, kategori, dan urutan lewat router.get literal', () => {
    bersihkan();
    const pohon = renderPohon(Index, propsIndex());

    kirimKejadian(cari(pohon, berid('filter-status')), 'habis');
    sama(kunjunganTerakhir(), { metode: 'get', url: '/admin/stok', data: { status: 'habis' }, opsi: kunjunganTerakhir().opsi }, 'filter status salah');

    kirimKejadian(cari(pohon, berid('filter-kategori')), '3');
    sama(kunjunganTerakhir().data, { kategori: '3' }, 'filter kategori salah');

    kirimKejadian(cari(pohon, berid('filter-urut')), 'stok_terkecil');
    sama(kunjunganTerakhir().data, { urut: 'stok_terkecil' }, 'filter urut salah');

    harus(
        cariSemua(pohon, bernama('Select')).every((el) => el.props.disabled === false),
        'select filter tidak boleh terkunci saat tidak memuat'
    );
});

uji('A3 pencarian menunggu debounce 300ms sebelum memanggil server', () => {
    const dipanggil = [];
    const cek = (tahap) => {
        if (!process.env.DEBUG_A3) return;
        console.log(`    [A3:${tahap}] dipanggil=${JSON.stringify(dipanggil)} text=${JSON.stringify(store.state['state#1'])} antre=${jam.antre.length} deps=${JSON.stringify(store.deps['efek#2'])}`);
    };
    let pohon = renderPohon(SearchInput, { value: '', onChange: (nilai) => dipanggil.push(nilai) });

    majukanWaktu();
    harus(dipanggil.length === 0, 'debounce memanggil onChange di pass pertama');
    cek('pass1');

    kirimKejadian(cari(pohon, (el) => el.props?.type === 'search'), '  batik  ');
    pohon = renderPohon(SearchInput, { value: '', onChange: (nilai) => dipanggil.push(nilai) });
    harus(dipanggil.length === 0, 'onChange dipanggil sebelum 300ms');
    cek('setelah tik');

    const dijalankan = majukanWaktu();
    harus(dijalankan === 1, `timer debounce tidak dijalankan (${dijalankan})`);
    sama(dipanggil, ['batik'], 'nilai pencarian tidak dirapikan');
    cek('setelah debounce1');

    // Tombol bersihkan: isian langsung kosong, nilai kosong menyusul lewat debounce.
    const kotak = renderPohon(SearchInput, { value: 'batik', onChange: (nilai) => dipanggil.push(nilai) });
    sama(cari(kotak, (el) => el.type === 'input').props.value, 'batik', 'isian tidak menampilkan nilai terkirim');

    klik(cari(kotak, (el) => el.props?.['aria-label'] === 'Bersihkan pencarian'));
    const kosong = renderPohon(SearchInput, { value: 'batik', onChange: (nilai) => dipanggil.push(nilai) });
    sama(cari(kosong, (el) => el.type === 'input').props.value, '', 'tombol bersihkan tidak mengosongkan isian');
    harus(dipanggil.length === 1, 'bersihkan memanggil server sebelum debounce selesai');

    majukanWaktu();
    sama(dipanggil, ['batik', ''], 'nilai kosong tidak terkirim setelah debounce');
});

uji('A4 reset filter mengembalikan query ke kosong', () => {
    bersihkan();
    const pohon = renderPohon(
        Index,
        propsIndex({ filter: { q: 'batik', status: 'kritis', kategori: '3', urut: 'stok_terbesar' } })
    );
    const tombol = cariSemua(pohon, bernama('Button')).find((el) => /Reset filter/i.test(teksPohon(el)));
    harus(Boolean(tombol), 'tombol Reset filter tidak ada saat filter aktif');

    klik(tombol);
    sama(kunjunganTerakhir(), { metode: 'get', url: '/admin/stok', data: {}, opsi: kunjunganTerakhir().opsi }, 'reset filter tidak mengosongkan query');
});

uji('A5 memuat -> galat -> Coba lagi: tiga keadaan berbeda', () => {
    bersihkan();
    const pohon = renderPohon(Index, propsIndex());
    const sebelum = cari(pohon, bernama('DataTable'));
    harus(sebelum.props.loading === false && sebelum.props.error === null, 'keadaan awal harus tenang');

    // Keadaan awal tenang; interaksi pertama (urut) -> onStart -> memuat.
    sebelum.props.onSort('stok');
    const opsiUrut = kunjunganTerakhir().opsi;
    opsiUrut.onStart();
    let kini = cari(renderPohon(Index, propsIndex()), bernama('DataTable'));
    harus(kini.props.loading === true, 'onStart tidak menandai memuat');
    harus(Array.isArray(kini.props.rows) && kini.props.rows.length === 1, 'baris tidak dipertahankan saat memuat');

    // onError: galat nyata, bukan daftar kosong.
    kendali.berikutnya.processing = false;
    opsiUrut.onError();
    opsiUrut.onFinish(); // Inertia selalu memanggil onFinish setelah onError
    kini = cari(renderPohon(Index, propsIndex()), bernama('DataTable'));
    harus(kini.props.error === 'Gagal memuat daftar stok. Periksa koneksi lalu coba lagi.', 'onError tidak mengisi pesan galat');
    harus(kini.props.loading === false, 'galat harus mengakhiri keadaan memuat');

    const tabelGalat = cari(renderPohon(Index, propsIndex()), bernama('DataTable'));
    harus(typeof tabelGalat.props.onRetry === 'function', 'tidak ada aksi Coba lagi saat galat');
    // DataTable tanpa hook: dirender sendiri supaya pesan galat terbukti sampai ke markup.
    const pohonGalat = renderPohon(DataTable, tabelGalat.props);
    harus(adaNilai(pohonGalat, 'Gagal memuat daftar stok.'), 'pesan galat tidak tampil di tabel');
    // Cabang galat menang atas daftar kosong: judul daftar kosong tidak dirender.
    // Label tombol Coba lagi milik komponen bersama DataTable (dipakai juga oleh F3/F5).
    harus(!teksPohon(pohonGalat).includes('Belum ada varian'), 'galat tampil sebagai daftar kosong');

    // Coba lagi: kunjungan baru + onStart membersihkan galat.
    tabelGalat.props.onRetry();
    harus(kunjunganTerakhir().url === '/admin/stok', 'Coba lagi tidak memuat ulang halaman stok');
    kunjunganTerakhir().opsi.onStart();
    kini = cari(renderPohon(Index, propsIndex()), bernama('DataTable'));
    harus(kini.props.error === null, 'galat tidak dibersihkan saat memuat ulang');
});

uji('A6 paginasi mengirim page hanya bila > 1', () => {
    bersihkan();
    const pohon = renderPohon(Index, propsIndex({ stok: paginator([barisIndex()], { last_page: 4, total: 52 }) }));
    const pager = cari(pohon, bernama('Pagination'));
    harus(Boolean(pager), 'Pagination tidak dirender padahal last_page 4');

    pager.props.onPageChange(3);
    sama(kunjunganTerakhir().data, { page: 3 }, 'page 3 tidak dikirim');

    pager.props.onPageChange(1);
    sama(kunjunganTerakhir().data, {}, 'page 1 tidak boleh ikut query');
});

uji('A7 aksi baris membuka modal stok masuk/keluar dan modal Setel', () => {
    bersihkan();
    const pohon = renderPohon(Index, propsIndex());
    const kolom = cari(pohon, bernama('DataTable')).props.columns;
    const kolomAksi = kolom.find((k) => k.key === 'aksi');

    const tombolMasuk = cari(kolomAksi.render(barisIndex()), (el) => /^Catat stok masuk/.test(el.props?.['aria-label'] ?? ''));
    harus(Boolean(tombolMasuk), 'tombol Masuk tanpa nama aksesibilitas');

    klik(tombolMasuk);
    let modal = cari(renderPohon(Index, propsIndex()), bernama('StokAksiModal'));
    harus(modal.props.open === true, 'modal tidak terbuka setelah klik Masuk');
    harus(modal.props.mode === 'in', 'mode modal bukan in');
    harus(modal.props.baris?.id === 12, 'baris modal salah');

    const tombolKeluar = cari(kolomAksi.render(barisIndex()), (el) => /^Catat stok keluar/.test(el.props?.['aria-label'] ?? ''));
    klik(tombolKeluar);
    modal = cari(renderPohon(Index, propsIndex()), bernama('StokAksiModal'));
    harus(modal.props.mode === 'out', 'mode modal bukan out');

    const tombolSetel = cari(kolomAksi.render(barisIndex()), (el) => /^Setel stok/.test(el.props?.['aria-label'] ?? ''));
    klik(tombolSetel);
    const sesudah = renderPohon(Index, propsIndex());
    const modalSetel = cari(sesudah, (el) => bernama('Modal')(el) && el.props.title === 'Setel stok');
    harus(modalSetel?.props.open === true, 'modal Setel tidak terbuka');
    harus(String(modalSetel.props.description).includes('Daster Batik Kulot — L / Hitam'), 'deskripsi modal Setel tidak memuat nama produk');
    const bukaForm = cari(modalSetel.props.footer, (el) => bernama('Button')(el) && el.props.href !== undefined);
    harus(bukaForm?.props.href === '/admin/produk/7/ubah', 'tautan form produk salah');
    harus(teksPohon(modalSetel.props.footer).includes('Buka form produk'), 'tombol Buka form produk hilang');
    harus(teksPohon(modalSetel).includes('penyesuaian'), 'penjelasan penyesuaian hilang dari modal Setel');
});

// ========================================================== B. modal aksi stok
/**
 * Judul, deskripsi, dan tombol modal ada di props elemen `Modal` (Modal memakai hook,
 * jadi tidak ikut dirender di sini); isi form ada di anak-anaknya.
 */
const modalDari = (pohon, judul) => cari(pohon, (el) => bernama('Modal')(el) && el.props.title === judul);

const modalProps = (ubah = {}) => ({
    open: true,
    mode: 'in',
    baris: barisIndex(),
    onClose: null,
    ...ubah,
});

const simpanDari = (modal) =>
    cari(modal.props.footer, (el) => bernama('Button')(el) && el.props.form === 'form-stok-aksi');

const medanDari = (pohon, htmlFor) =>
    cari(pohon, (el) => bernama('Field')(el) && el.props.htmlFor === htmlFor);

/** Isi qty (dan catatan) lalu kirim form pada pass yang sama. */
const isiDanKirim = (pohon, qty, note = null) => {
    kirimKejadian(cari(pohon, berid('stok-aksi-qty')), qty);

    if (note !== null) kirimKejadian(cari(pohon, berid('stok-aksi-note')), note);

    poskan(cari(pohon, (el) => el.type === 'form'));
};

uji('B1 validasi klien: pesan per kondisi, tanpa memanggil server', () => {
    const kasus = [
        ['', 'Jumlah wajib diisi.'],
        ['0', 'Jumlah minimal 1.'],
        ['abc', 'Jumlah minimal 1.'],
        ['2.5', 'Jumlah minimal 1.'],
        ['100001', 'Jumlah maksimal 100.000.'],
    ];

    kasus.forEach(([nilai, pesan]) => {
        bersihkanStore();
        bersihkan();
        isiDanKirim(renderPohon(StokAksiModal, modalProps()), nilai);

        harus(kendali.kunjungan.length === 0, `qty "${nilai}" tetap dikirim ke server`);
        sama(medanDari(renderPohon(StokAksiModal, modalProps()), 'stok-aksi-qty').props.error, pesan, `pesan untuk qty "${nilai}" salah`);
        sama(cari(renderPohon(StokAksiModal, modalProps()), berid('stok-aksi-qty')).props.error, pesan, 'Input tidak menerima galat dari Field');
    });
});

uji('B2 kirim sah: URL literal, data form, opsi Inertia, tutup saat sukses', () => {
    let ditutup = 0;
    const props = () => modalProps({ onClose: () => (ditutup += 1) });

    isiDanKirim(renderPohon(StokAksiModal, props()), '5', 'Kiriman supplier');

    const kirim = kunjunganTerakhir();
    harus(kirim.metode === 'post', 'aksi stok bukan POST');
    harus(kirim.url === '/admin/stok/12/masuk', `URL masuk salah: ${kirim.url}`);
    sama(kirim.data, { qty: '5', note: 'Kiriman supplier' }, 'data form tidak sesuai');
    harus(kirim.opsi.preserveState === true, 'modal harus tetap terbuka saat server menolak (preserveState)');
    harus(kirim.opsi.preserveScroll === true, 'preserveScroll hilang');
    harus(ditutup === 0, 'modal ditutup sebelum server menjawab');

    const modal = modalDari(renderPohon(StokAksiModal, props()), 'Catat stok masuk');
    harus(modal !== null, 'judul modal masuk hilang');
    harus(teksPohon(modal.props.footer).includes('Simpan stok masuk'), 'tombol simpan masuk hilang');
    harus(simpanDari(modal)?.props.type === 'submit', 'tombol simpan bukan type submit');
    harus(teksPohon(modal.props.footer).includes('Batal'), 'tombol Batal hilang');
    harus(String(modal.props.description).includes('stok tercatat saat ini 9'), 'deskripsi stok masuk salah');

    kirim.opsi.onSuccess();
    harus(ditutup === 1, 'modal tidak ditutup setelah sukses');
});

uji('B3 mode keluar: URL keluar, judul, hint stok saat ini, dan tombolnya', () => {
    const props = () => modalProps({ mode: 'out', baris: barisIndex({ stock: 3 }) });
    const pohon = renderPohon(StokAksiModal, props());

    const modal = modalDari(pohon, 'Catat stok keluar');
    harus(modal !== null, 'judul modal keluar hilang');
    harus(String(modal.props.description).includes('stok tercatat saat ini 3'), 'stok saat ini tidak ditampilkan di deskripsi');
    harus(teksPohon(modal.props.footer).includes('Simpan stok keluar'), 'tombol simpan keluar hilang');

    const medan = medanDari(pohon, 'stok-aksi-qty');
    harus(String(medan.props.hint).includes('Stok tercatat saat ini 3.'), `hint stok keluar salah: ${medan.props.hint}`);

    isiDanKirim(renderPohon(StokAksiModal, props()), '2');
    harus(kunjunganTerakhir().url === '/admin/stok/12/keluar', `URL keluar salah: ${kunjunganTerakhir().url}`);
    sama(kunjunganTerakhir().data, { qty: '2', note: '' }, 'data keluar salah');
});

uji('B4 jumlah dikirim sekali saja saat server masih memproses', () => {
    kendali.berikutnya.processing = true;
    const pohon = renderPohon(StokAksiModal, modalProps());
    const simpan = simpanDari(modalDari(pohon, 'Catat stok masuk'));

    harus(simpan.props.loading === true, 'tombol tidak menampilkan keadaan memproses');

    isiDanKirim(pohon, '5');
    harus(kendali.kunjungan.length === 0, 'kirim ganda saat processing tidak dicegah');
});

uji('B5 varian null: tombol simpan mati dan tidak ada URL /null/', () => {
    const props = () => modalProps({ baris: null });
    const modal = modalDari(renderPohon(StokAksiModal, props()), 'Catat stok masuk');

    harus(simpanDari(modal)?.props.disabled === true, 'tombol simpan tetap aktif tanpa varian');
    harus(String(modal.props.description) === '', 'deskripsi harus kosong tanpa varian');

    isiDanKirim(renderPohon(StokAksiModal, props()), '5');
    harus(kendali.kunjungan.length === 0, 'varian null tetap mengirim permintaan');
});

uji('B6 galat server per kolom terhubung aria-describedby, galat lain jadi notice', () => {
    const pesan = 'Stok tidak cukup — stok saat ini 1.';
    renderPohon(StokAksiModal, modalProps({ baris: barisIndex({ stock: 1 }) }));

    // Jawaban server: Inertia mengisi errors pada objek form, bukan pada props halaman.
    kendali.formulir[0].errors = { qty: pesan };
    const pohon = renderPohon(StokAksiModal, modalProps({ baris: barisIndex({ stock: 1 }) }));

    if (process.env.DEBUG_B6) {
        console.log(`    [B6] pass=${store.pass} berikutnya=${JSON.stringify(kendali.berikutnya.errors)} formulir=${JSON.stringify(kendali.formulir[0]?.errors)} data=${JSON.stringify(kendali.formulir[0]?.data)}`);
        console.log(`    [B6] field=${JSON.stringify(cariSemua(pohon, bernama('Field')).map((el) => [el.props.htmlFor, el.props.error, el.props.hint]))}`);
        console.log(`    [B6] input=${JSON.stringify(cari(pohon, berid('stok-aksi-qty'))?.props)}`);
    }

    sama(medanDari(pohon, 'stok-aksi-qty').props.error, pesan, 'Field tidak menerima galat qty');
    sama(cari(pohon, berid('stok-aksi-qty')).props.error, pesan, 'Input tidak menerima galat qty');

    // Field dan Input tidak memakai hook: dirender sendiri untuk membuktikan sambungan aria.
    const fieldJadi = renderPohon(Field, medanDari(pohon, 'stok-aksi-qty').props);
    harus(teksPohon(fieldJadi).includes(pesan), 'pesan galat tidak dirender Field');
    harus(cari(fieldJadi, (el) => el.props?.role === 'alert') !== null, 'galat Field tanpa role=alert');
    harus(cari(fieldJadi, (el) => el.props?.id === 'stok-aksi-qty-error') !== null, 'elemen galat tanpa id stok-aksi-qty-error');
    // `fieldJadi` dari medanDari adalah Input ber-id sama; label dan penanda wajib ada di Field.
    const fieldQty = cariSemua(pohon, bernama('Field')).find((el) => el.props.htmlFor === 'stok-aksi-qty');
    harus(fieldQty !== undefined, 'Field qty tidak dirender');
    harus(
        fieldQty.props.label === 'Jumlah' && fieldQty.props.required === true,
        `label atau penanda wajib hilang saat galat (label=${JSON.stringify(fieldQty.props.label)} required=${JSON.stringify(fieldQty.props.required)})`
    );

    const inputJadi = cari(renderPohon(Input, cari(pohon, berid('stok-aksi-qty')).props), (el) => el.type === 'input');
    harus(inputJadi.props['aria-invalid'] === 'true', 'input galat tanpa aria-invalid');
    sama(inputJadi.props['aria-describedby'], 'stok-aksi-qty-error', 'input galat tanpa aria-describedby yang benar');
    harus(inputJadi.props.min === 1 && inputJadi.props.max === 100000, 'batas min/max qty hilang');
    harus(inputJadi.props.inputMode === 'numeric', 'inputMode numeric hilang');

    kendali.formulir[0].errors = { stok: 'Varian tidak aktif.' };
    const pohonLain = renderPohon(StokAksiModal, modalProps());
    harus(teksPohon(pohonLain).includes('Varian tidak aktif.'), 'galat non-kolom tidak tampil');
    // `teksPohon` tidak masuk ke dalam komponen fungsi (InlineNotice merender `title` sebagai
    // <p> di dalam layoutnya, Components/InlineNotice.jsx:52), jadi judul diperiksa sebagai
    // nilai prop — bukan sebagai teks bebas di pohon elemen.
    const noticeGalat = cariSemua(pohonLain, bernama('InlineNotice'));
    harus(
        noticeGalat.some((el) => el.props.tone === 'error' && el.props.title === 'Perubahan stok gagal disimpan'),
        'judul notice galat hilang'
    );
});

// ======================================================== C. halaman riwayat
uji('C1 filter riwayat: tipe, varian, dan reset', () => {
    bersihkan();
    const pohon = renderPohon(History, propsHistory());
    harus(teksPohon(cari(pohon, berid('riwayat-varian'))).includes('Daster Batik Kulot — L / Hitam'), 'opsi varian salah');

    kirimKejadian(cari(pohon, berid('riwayat-tipe')), 'adjust');
    sama(kunjunganTerakhir().data, { tipe: 'adjust' }, 'filter tipe salah');

    kirimKejadian(cari(pohon, berid('riwayat-varian')), '12');
    sama(kunjunganTerakhir().data, { varian: '12' }, 'filter varian salah');

    const denganFilter = renderPohon(History, propsHistory({ filter: { q: 'batik', tipe: 'out', varian: '12' } }));
    const tombol = cariSemua(denganFilter, bernama('Button')).find((el) => /Reset filter/i.test(teksPohon(el)));
    harus(Boolean(tombol), 'tombol Reset filter riwayat tidak ada');
    klik(tombol);
    sama(kunjunganTerakhir(), { metode: 'get', url: '/admin/stok/riwayat', data: {}, opsi: kunjunganTerakhir().opsi }, 'reset filter riwayat salah');
});

uji('C2 galat riwayat tidak menyamar sebagai riwayat kosong + Coba lagi', () => {
    bersihkan();
    const pohon = renderPohon(History, propsHistory());
    const tabel = cari(pohon, bernama('DataTable'));
    harus(tabel.props.onSort === undefined, 'riwayat tidak boleh punya tombol urut (kontrak §12.15)');

    kirimKejadian(cari(pohon, berid('riwayat-tipe')), 'in');
    const opsi = kunjunganTerakhir().opsi;

    opsi.onStart();
    let kini = cari(renderPohon(History, propsHistory()), bernama('DataTable'));
    harus(kini.props.loading === true, 'onStart riwayat tidak menandai memuat');

    opsi.onError();
    opsi.onFinish(); // Inertia selalu memanggil onFinish
    kini = cari(renderPohon(History, propsHistory()), bernama('DataTable'));
    harus(kini.props.error === 'Gagal memuat riwayat stok. Periksa koneksi lalu coba lagi.', 'pesan galat riwayat salah');

    const tabelRiwayat = cari(renderPohon(History, propsHistory()), bernama('DataTable'));
    harus(typeof tabelRiwayat.props.onRetry === 'function', 'tidak ada aksi Coba lagi saat galat riwayat');
    const pohonRiwayat = renderPohon(DataTable, tabelRiwayat.props);
    if (process.env.DEBUG_C2) {
        console.log(
            `    [C2] error=${JSON.stringify(tabelRiwayat.props.error)} retry=${typeof tabelRiwayat.props.onRetry} ` +
                `kosong=${JSON.stringify(tabelRiwayat.props.emptyTitle)} loading=${tabelRiwayat.props.loading}`
        );
    }
    harus(adaNilai(pohonRiwayat, 'Gagal memuat riwayat stok.'), 'galat riwayat tidak tampil');
    // Cabang galat menang atas riwayat kosong: judul riwayat kosong tidak dirender.
    harus(!teksPohon(pohonRiwayat).includes('Belum ada pergerakan stok'), 'galat riwayat tampil sebagai riwayat kosong');

    tabelRiwayat.props.onRetry();
    harus(kunjunganTerakhir().url === '/admin/stok/riwayat', 'Coba lagi riwayat salah URL');
});

uji('C3 pencarian riwayat ikut debounce dan memakai query q', () => {
    const pohon = renderPohon(History, propsHistory());
    const kotak = cari(pohon, bernama('SearchInput'));
    harus(kotak !== null, 'SearchInput tidak dirender riwayat');
    harus(kotak.props.placeholder === 'Cari nama produk, SKU, atau catatan', `placeholder pencarian riwayat salah: ${kotak.props.placeholder}`);
    harus(kotak.props.value === '', `kotak pencarian harus kosong saat tanpa filter: ${kotak.props.value}`);

    // SearchInput tanpa hook global: dirender sendiri untuk menembak event-nya.
    const isian = cari(renderPohon(SearchInput, kotak.props), (el) => el.type === 'input');
    kirimKejadian(isian, 'batik');
    renderPohon(SearchInput, kotak.props);
    const dijalankan = majukanWaktu();
    harus(dijalankan >= 1, `timer debounce riwayat tidak dijalankan (${dijalankan})`);
    harus(kunjunganTerakhir().url === '/admin/stok/riwayat', `pencarian riwayat salah URL: ${kunjunganTerakhir().url}`);
    sama(kunjunganTerakhir().data, { q: 'batik' }, 'pencarian riwayat tidak memakai query q');
});

// ---------------------------------------------------------------- laporan
console.log('=== UJI INTERAKSI kartu t_321bf03c ===');

hasil.forEach((item) => {
    console.log(`${item.lulus ? '[OK]  ' : '[GAGAL]'} ${item.nama}${item.lulus ? '' : ` -> ${item.pesan}`}`);
});

const gagal = hasil.filter((item) => !item.lulus).length;

console.log(`\nTOTAL: ${hasil.length} uji, ${gagal} gagal`);

process.exitCode = gagal === 0 ? 0 : 1;

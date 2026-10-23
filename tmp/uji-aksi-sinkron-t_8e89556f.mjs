/**
 * Harness interaksi kartu t_8e89556f (F8 — tombol "Sinkronkan status pembayaran" di
 * /admin/pesanan/{order}). File uji lokal (bukan bagian aplikasi). Tanpa browser dan tanpa
 * pustaka uji baru: hook React diganti shim store, '@inertiajs/react' diganti stub pencatat,
 * fungsi komponen dipanggil langsung lalu handler-nya dipanggil. Perintah yang benar-benar
 * dijalankan (lihat tmp/jalankan-uji-t_8e89556f.sh):
 *   ./node_modules/@esbuild/win32-x64/esbuild.exe tmp/uji-aksi-sinkron-t_8e89556f.mjs --bundle \
 *     --platform=node --format=esm --jsx=automatic --packages=external \
 *     --outfile=tmp/uji-aksi-sinkron-t_8e89556f.bundle.mjs \
 *     --alias:react/jsx-runtime=./tmp/shim-jsx-runtime-t_321bf03c.mjs \
 *     --alias:react=./tmp/shim-react-t_321bf03c.mjs \
 *     --alias:@inertiajs/react=./tmp/stub-inertia-t_321bf03c.mjs
 *   node tmp/uji-aksi-sinkron-t_8e89556f.bundle.mjs
 * Batasan: bukan browser — yang diuji kontrak pemanggilan (URL, metode, opsi Inertia, state UI,
 * wiring props Show → partial → notice) dan logika suppress Toast, bukan tata letak, fokus
 * keyboard, atau klik nyata.
 */
import React from 'react';
import { store, mulaiPass, bersihkanStore } from './shim-react-t_321bf03c.mjs';
import { kendali, bersihkan } from './stub-inertia-t_321bf03c.mjs';
import SyncPaymentButton from '../resources/js/Pages/Admin/Orders/partials/SyncPaymentButton.jsx';
import Show from '../resources/js/Pages/Admin/Orders/Show.jsx';
import KartuBagian from '../resources/js/Pages/Admin/Orders/partials/KartuBagian.jsx';
import InlineNotice from '../resources/js/Components/InlineNotice.jsx';
import Toast from '../resources/js/Components/Toast.jsx';
import Button from '../resources/js/Components/Button.jsx';

const LABEL = 'Sinkronkan status pembayaran';
const URL_SINKRON = '/admin/pesanan/5/sinkron-pembayaran';

const hasil = [];
const uji = (nama, fn) => {
    try {
        bersihkanStore();
        bersihkan();
        kendali.halaman.props = {};
        kendali.berikutnya = { processing: false, errors: {}, sukses: null };
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

const kumpul = (pohon, keluar = []) => {
    if (pohon === null || pohon === undefined || typeof pohon === 'boolean') return keluar;

    if (Array.isArray(pohon)) {
        pohon.forEach((isi) => kumpul(isi, keluar));

        return keluar;
    }

    if (React.isValidElement(pohon)) {
        keluar.push(pohon);
        kumpul(pohon.props?.children, keluar);

        return keluar;
    }

    return keluar;
};

const teksDari = (simpul, keluar = []) => {
    if (simpul === null || simpul === undefined || typeof simpul === 'boolean') return keluar;

    if (Array.isArray(simpul)) {
        simpul.forEach((isi) => teksDari(isi, keluar));

        return keluar;
    }

    if (React.isValidElement(simpul)) {
        teksDari(simpul.props?.children, keluar);

        return keluar;
    }

    keluar.push(String(simpul));

    return keluar;
};

const semuaTeks = (pohon) => teksDari(pohon).join(' | ');

// Partial merender elemen komponen `Button` (§4.1), bukan <button>. Button tidak memakai hook,
// jadi props-nya dipanggil langsung di sini agar assertion memeriksa DOM yang benar-benar
// dihasilkan (type, label, disabled, aria-busy, kelas) beserta handler onClick yang sama.
const tombolDari = (pohon) =>
    kumpul(pohon)
        .filter((el) => el.type === Button)
        .map((el) => Button(el.props));

const PESANAN_UJI = {
    id: 5,
    code: 'TK-20261020-0001',
    status: 'pending',
    status_label: 'Menunggu pembayaran',
    payment_status: 'pending',
    payment_label: 'Menunggu pembayaran',
    subtotal: 170000,
    shipping_cost: 5000,
    discount: 0,
    total: 175000,
    payment_method: 'qris',
    notes: null,
    tracking_number: null,
    customer: { name: 'Pembeli Uji', phone: '0800000000', email: 'uji@contoh.test', address: 'Jl. Uji', city: 'Bandung', postal_code: '40000' },
    items: [],
    payment: { provider: 'midtrans', status: 'pending', transaction_id: 'trx-uji', qris_url: 'https://contoh.test/qr.png', qr_string: 'QR-UJI', gross_amount: 175000, expires_at: '2026-10-22T10:00:00+07:00', paid_at: null },
    created_at: '2026-10-22T09:00:00+07:00',
    paid_at: null,
};

const BERIKUT_UJI = [{ value: 'diproses', label: 'Diproses' }];

// ================================================================ A. partial
uji('A1. Render: satu tombol, label beku, varian secondary, lebar dikunci min-w-[16rem]', () => {
    const pohon = renderPohon(SyncPaymentButton, { pesananId: 5 });
    const tombol = tombolDari(pohon);

    harus(tombol.length === 1, `jumlah tombol harus 1, dapat ${tombol.length}`);
    harus(semuaTeks(tombol[0]).includes(LABEL), 'label beku tidak ditemukan');
    harus(tombol[0].props.type === 'button', 'tombol harus type="button"');
    harus(String(tombol[0].props.className).includes('btn-secondary'), 'varian harus btn-secondary §4.1');
    harus(String(tombol[0].props.className).includes('min-w-[16rem]'), 'lebar dikunci (D13) tidak ada di className');
    harus(tombol[0].props.disabled !== true, 'tombol tidak boleh disabled saat idle (alasan terlihat §4.0)');
    harus(!tombol[0].props['aria-busy'], 'aria-busy hanya saat memproses');
});

uji('A2. Klik: PATCH URL literal kontrak §12.24, tanpa body, preserveScroll + preserveState', () => {
    const pohon = renderPohon(SyncPaymentButton, { pesananId: 5 });
    const tombol = tombolDari(pohon)[0];

    tombol.props.onClick();
    harus(kendali.kunjungan.length === 1, `kunjungan harus 1, dapat ${kendali.kunjungan.length}`);

    const kunjungan = kendali.kunjungan[0];

    harus(kunjungan.metode === 'patch', `metode harus patch, dapat ${kunjungan.metode}`);
    harus(kunjungan.url === URL_SINKRON, `url harus ${URL_SINKRON}, dapat ${kunjungan.url}`);
    harus(Object.keys(kunjungan.data ?? {}).length === 0, 'body harus kosong (§12.24 tanpa field)');
    harus(kunjungan.opsi.preserveScroll === true, 'preserveScroll harus true');
    harus(kunjungan.opsi.preserveState === true, 'preserveState harus true (state hasil bertahan setelah props berganti)');
    harus(typeof kunjungan.opsi.onSuccess === 'function', 'onSuccess harus dipasang');
});

uji('A3. State memproses: label "Memproses…" + disabled + aria-busy, kelas lebar tetap', () => {
    renderPohon(SyncPaymentButton, { pesananId: 5 });
    kendali.berikutnya.processing = true;

    const pohon = renderPohon(SyncPaymentButton, { pesananId: 5 });
    const tombol = tombolDari(pohon)[0];
    const teks = semuaTeks(tombol);

    harus(tombol.props.disabled === true, 'tombol harus disabled saat memproses');
    harus(tombol.props['aria-busy'] === true, 'aria-busy harus true saat memproses');
    harus(teks.includes('Memproses…'), 'label saat memproses harus "Memproses…" (§4.1)');
    harus(!teks.includes(LABEL), 'label beku diganti saat memproses');
    harus(String(tombol.props.className).includes('min-w-[16rem]'), 'kelas lebar dikunci harus tetap ada saat memproses');
});

uji('A4. Klik ganda saat memproses: tidak ada kunjungan kedua', () => {
    const pohon = renderPohon(SyncPaymentButton, { pesananId: 5 });
    tombolDari(pohon)[0].props.onClick();
    kendali.berikutnya.processing = true;

    const pohon2 = renderPohon(SyncPaymentButton, { pesananId: 5 });
    tombolDari(pohon2)[0].props.onClick();

    harus(kendali.kunjungan.length === 1, `kunjungan harus tetap 1, dapat ${kendali.kunjungan.length}`);
});

uji('A5. Jawaban flash.error: InlineNotice tone error + pesan server apa adanya + pelaporan pasangan', () => {
    const tersalur = [];
    const pohon = renderPohon(SyncPaymentButton, { pesananId: 5, onHasilSinkron: (p) => tersalur.push(p) });

    tombolDari(pohon)[0].props.onClick();

    const pesan = 'Mode uji Midtrans: status tidak bisa disinkronkan.';

    kendali.kunjungan[0].opsi.onSuccess({ props: { flash: { error: pesan } } });

    const pohon2 = renderPohon(SyncPaymentButton, { pesananId: 5, onHasilSinkron: (p) => tersalur.push(p) });
    const notice = kumpul(pohon2).filter((el) => el.type === InlineNotice);

    harus(notice.length === 1, `harus ada 1 InlineNotice, dapat ${notice.length}`);
    harus(notice[0].props.tone === 'error', `tone harus error, dapat ${notice[0].props.tone}`);
    harus(semuaTeks(notice[0]).includes(pesan), 'pesan server harus tampil apa adanya');
    harus(tersalur.length === 1 && tersalur[0] === `|${pesan}`, `pasangan flash harus dilaporkan, dapat ${JSON.stringify(tersalur)}`);
});

uji('A6. Jawaban flash.success: InlineNotice tone success + pelaporan pasangan', () => {
    const tersalur = [];
    const pohon = renderPohon(SyncPaymentButton, { pesananId: 5, onHasilSinkron: (p) => tersalur.push(p) });

    tombolDari(pohon)[0].props.onClick();

    const pesan = 'Status pembayaran diperbarui dari Menunggu pembayaran ke Lunas.';

    kendali.kunjungan[0].opsi.onSuccess({ props: { flash: { success: pesan } } });

    const pohon2 = renderPohon(SyncPaymentButton, { pesananId: 5, onHasilSinkron: (p) => tersalur.push(p) });
    const notice = kumpul(pohon2).filter((el) => el.type === InlineNotice);

    harus(notice.length === 1, `harus ada 1 InlineNotice, dapat ${notice.length}`);
    harus(notice[0].props.tone === 'success', `tone harus success, dapat ${notice[0].props.tone}`);
    harus(semuaTeks(notice[0]).includes(pesan), 'pesan server harus tampil apa adanya');
    harus(tersalur.length === 1 && tersalur[0] === `${pesan}|`, `pasangan flash harus dilaporkan, dapat ${JSON.stringify(tersalur)}`);
});

uji('A7. Klik berikutnya: notice lama hilang sebelum jawaban baru', () => {
    const pohon = renderPohon(SyncPaymentButton, { pesananId: 5 });

    tombolDari(pohon)[0].props.onClick();
    kendali.kunjungan[0].opsi.onSuccess({ props: { flash: { success: 'Pembayaran sudah lunas, sinkronisasi tidak perlu dijalankan.' } } });

    const pohon2 = renderPohon(SyncPaymentButton, { pesananId: 5 });

    harus(kumpul(pohon2).some((el) => el.type === InlineNotice), 'notice pertama harus tampil lebih dulu');

    tombolDari(pohon2)[0].props.onClick();

    const pohon3 = renderPohon(SyncPaymentButton, { pesananId: 5 });

    harus(!kumpul(pohon3).some((el) => el.type === InlineNotice), 'notice lama harus hilang saat aksi baru dimulai');
});

uji('A8. Tanpa id pesanan: tidak merender tombol (tidak menembak URL tanpa id)', () => {
    const nol = renderPohon(SyncPaymentButton, { pesananId: null });

    harus(nol === null, 'pesananId null harus merender null');
    harus(renderPohon(SyncPaymentButton, { pesananId: '' }) === null, 'pesananId kosong harus merender null');
    harus(renderPohon(SyncPaymentButton, {}) === null, 'pesananId absen harus merender null');
});

uji('A9. Higiene teks: tanpa undefined/NaN/[CONTOH]/placeholder di semua state', () => {
    const pohon = renderPohon(SyncPaymentButton, { pesananId: 5 });
    const teks = `${semuaTeks(pohon)} ${String(tombolDari(pohon)[0].props.className)}`;

    ['undefined', 'NaN', '[CONTOH]', 'lorem'].forEach((buruk) => {
        harus(!teks.includes(buruk), `teks/kelas tidak boleh memuat "${buruk}"`);
    });
});

// ================================================================ B. Show.jsx
uji('B1. Show: tombol dirender di dalam kartu "Bukti pembayaran" dengan props dari pesanan.id', () => {
    const pohon = renderPohon(Show, { pesanan: PESANAN_UJI, status_berikut: BERIKUT_UJI, flash: null });
    const elems = kumpul(pohon);
    const sinkron = elems.filter((el) => el.type === SyncPaymentButton);
    const kartu = elems.filter((el) => el.type === KartuBagian && el.props.title === 'Bukti pembayaran');

    harus(sinkron.length === 1, `tombol sinkron harus 1, dapat ${sinkron.length}`);
    harus(sinkron[0].props.pesananId === 5, 'pesananId harus dari pesanan.id');
    harus(typeof sinkron[0].props.onHasilSinkron === 'function', 'onHasilSinkron harus terhubung ke halaman');
    harus(kartu.length === 1, 'kartu "Bukti pembayaran" harus ada');
    harus(kumpul(kartu[0].props.children).some((el) => el.type === SyncPaymentButton), 'tombol harus di dalam kartu yang sama (D13)');
    harus(!elems.some((el) => el.type === Toast), 'tanpa flash: Toast tidak boleh tampil');
    harus(!semuaTeks(pohon).includes('undefined'), 'teks halaman tidak boleh memuat undefined');
});

uji('B2. Show: payment null/absen → tombol sinkron tidak dirender (D13)', () => {
    [{ ...PESANAN_UJI, payment: null }, { ...PESANAN_UJI, payment: undefined }].forEach((pesanan) => {
        const elems = kumpul(renderPohon(Show, { pesanan, status_berikut: BERIKUT_UJI, flash: null }));

        harus(!elems.some((el) => el.type === SyncPaymentButton), 'tombol tidak boleh dirender tanpa baris payments');
    });
});

uji('B3. Show: flash aksi lain tetap menjadi Toast halaman (suppress tidak bocor)', () => {
    const pohon = renderPohon(Show, {
        pesanan: PESANAN_UJI,
        status_berikut: BERIKUT_UJI,
        flash: { success: 'Nomor resi pesanan diperbarui.' },
    });
    const toast = kumpul(pohon).filter((el) => el.type === Toast);

    harus(toast.length === 1, `Toast harus tampil untuk flash aksi lain, dapat ${toast.length}`);
    harus(toast[0].props.message === 'Nomor resi pesanan diperbarui.', 'pesan Toast harus dari flash server');
});

uji('B4. Show: flash aksi sinkron di-suppress dari Toast setelah dilaporkan partial (U6-1)', () => {
    const pesan = 'Status pembayaran tidak berubah: Lunas.';
    const pohon = renderPohon(Show, { pesanan: PESANAN_UJI, status_berikut: BERIKUT_UJI, flash: null });
    const sinkron = kumpul(pohon).filter((el) => el.type === SyncPaymentButton)[0];

    sinkron.props.onHasilSinkron(`${pesan}|`);
    harus(store.kotor === true, 'pelaporan pasangan harus memicu render ulang halaman');

    const panjangTulisan = store.tulisan.length;
    const pohon2 = renderPohon(Show, { pesanan: PESANAN_UJI, status_berikut: BERIKUT_UJI, flash: { success: pesan } });
    const toast = kumpul(pohon2).filter((el) => el.type === Toast);

    harus(toast.length === 0, 'flash aksi sinkron tidak boleh muncul lagi sebagai Toast (dobel dengan InlineNotice)');
    harus(store.tulisan.length === panjangTulisan, 'tidak ada state Toast baru yang ditulis untuk flash aksi sinkron');
});

uji('B5. Integrasi: props dari Show → klik → URL kontrak → flash.error server tampil di kartu', () => {
    const pohon = renderPohon(Show, { pesanan: PESANAN_UJI, status_berikut: BERIKUT_UJI, flash: null });
    const propsDariShow = kumpul(pohon).filter((el) => el.type === SyncPaymentButton)[0].props;

    bersihkanStore();

    const pohon2 = renderPohon(SyncPaymentButton, propsDariShow);
    const tombol = tombolDari(pohon2);

    harus(tombol.length === 1, 'tombol harus dirender dari props Show');
    harus(semuaTeks(tombol[0]).includes(LABEL), 'label beku harus tampil');

    tombol[0].props.onClick();
    harus(kendali.kunjungan.length === 1, 'klik harus memanggil satu kunjungan');
    harus(kendali.kunjungan[0].url === URL_SINKRON, `url harus ${URL_SINKRON}, dapat ${kendali.kunjungan[0].url}`);

    const pesan = 'Pesanan ini belum punya tagihan pembayaran, jadi status tidak bisa disinkronkan.';

    kendali.kunjungan[0].opsi.onSuccess({ props: { flash: { error: pesan } } });

    const pohon3 = renderPohon(SyncPaymentButton, propsDariShow);
    const notice = kumpul(pohon3).filter((el) => el.type === InlineNotice);

    harus(notice.length === 1, `notice hasil harus tampil sekali, dapat ${notice.length}`);
    harus(semuaTeks(notice[0]).includes(pesan), 'pesan server harus tampil apa adanya');
    harus(!kumpul(pohon3).some((el) => el.type === Toast), 'partial tidak boleh membuat Toast sendiri');
});

// ---------------------------------------------------------------- laporan
const gagal = hasil.filter((b) => b.status === 'GAGAL');

console.log('=== Hasil harness aksi kartu t_8e89556f (F8) ===');
hasil.forEach((b, i) => {
    console.log(`${String(i + 1).padStart(2, '0')}. [${b.status}] ${b.nama}${b.catatan === '' ? '' : `\n      -> ${b.catatan}`}`);
});
console.log(`\nRINGKAS: ${hasil.length - gagal.length}/${hasil.length} OK, ${gagal.length} GAGAL`);

if (gagal.length > 0) process.exit(1);

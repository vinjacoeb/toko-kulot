import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';
import Badge from '../../Components/Badge';
import Breadcrumb from '../../Components/Breadcrumb';
import Button from '../../Components/Button';
import Field from '../../Components/Field';
import InlineNotice from '../../Components/InlineNotice';
import Input from '../../Components/Input';
import OrderSummary from '../../Components/OrderSummary';
import Textarea from '../../Components/Textarea';
import { cn, formatNumber, rupiah } from '../../lib/format';

const PHONE_PATTERN = /^(\+62|62|0)8[0-9]{7,12}$/;
const POSTAL_PATTERN = /^\d{5}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Jeda sebelum tarif diminta otomatis (design-v1.2 §5.3 S0→S1). */
const TARIF_DEBOUNCE_MS = 600;
/** Batas tunggu tarif sebelum state S7 (design-v1.2 §5.3: maks 10 detik). */
const TARIF_TIMEOUT_MS = 10000;

/** Urutan kolom formulir — dipakai menentukan "kolom pertama" yang bermasalah (design §5.7 state `error-field`). */
const URUTAN_KOLOM = [
    'customer_name',
    'customer_phone',
    'customer_email',
    'customer_address',
    'customer_city',
    'customer_postal_code',
    'note',
];

/** Label kolom persis seperti yang tampil di formulir, supaya pengguna bisa menemukan kolom yang dimaksud. */
const LABEL_KOLOM = {
    customer_name: 'Nama Penerima',
    customer_phone: 'Nomor WhatsApp',
    customer_email: 'Email',
    customer_address: 'Alamat Lengkap',
    customer_city: 'Kota/Kecamatan',
    customer_postal_code: 'Kode Pos',
    note: 'Catatan',
};

/**
 * Validasi ringan di klien (kontrak §7.6). Aturan **dan pesannya disamakan dengan server**
 * (`app/Http/Requests/CheckoutRequest.php`) supaya pembeli tidak kena 422 tanpa melihat sebabnya;
 * server tetap sumber kebenaran.
 */
function validate(values) {
    const errors = {};
    const teks = (nilai) => String(nilai ?? '').trim();

    const nama = teks(values.customer_name);
    if (nama === '') errors.customer_name = 'Nama penerima wajib diisi.';
    else if (nama.length < 3) errors.customer_name = 'Nama penerima minimal 3 karakter.';
    else if (nama.length > 100) errors.customer_name = 'Nama penerima maksimal 100 karakter.';

    const telepon = teks(values.customer_phone);
    if (telepon === '') errors.customer_phone = 'Nomor WhatsApp wajib diisi.';
    else if (!PHONE_PATTERN.test(telepon)) errors.customer_phone = 'Nomor WhatsApp tidak valid.';

    const email = teks(values.customer_email);
    if (email === '') errors.customer_email = 'Email wajib diisi.';
    else if (!EMAIL_PATTERN.test(email)) errors.customer_email = 'Email tidak valid.';
    else if (email.length > 150) errors.customer_email = 'Email maksimal 150 karakter.';

    const alamat = teks(values.customer_address);
    if (alamat === '') errors.customer_address = 'Alamat lengkap wajib diisi.';
    else if (alamat.length < 10) errors.customer_address = 'Alamat terlalu singkat. Tulis jalan, nomor, RT/RW.';
    else if (alamat.length > 500) errors.customer_address = 'Alamat maksimal 500 karakter.';

    const kota = teks(values.customer_city);
    if (kota === '') errors.customer_city = 'Kota/kecamatan wajib diisi.';
    else if (kota.length < 3) errors.customer_city = 'Nama kota/kecamatan terlalu singkat.';
    else if (kota.length > 100) errors.customer_city = 'Kota/kecamatan maksimal 100 karakter.';

    const kodePos = teks(values.customer_postal_code);
    if (kodePos === '') errors.customer_postal_code = 'Kode pos wajib diisi.';
    else if (!POSTAL_PATTERN.test(kodePos)) errors.customer_postal_code = 'Kode pos harus 5 angka.';

    if (teks(values.note).length > 500) errors.note = 'Catatan maksimal 500 karakter.';

    return errors;
}

/** Gulir (opsional: sekalian fokuskan) satu elemen; gerak dihormati `prefers-reduced-motion` (design §6). */
function gulirKe(id, { fokus = true } = {}) {
    if (!id || typeof document === 'undefined') return;

    const elemen = document.getElementById(id);
    if (!elemen) return;

    const gerakDikurangi =
        typeof window !== 'undefined' && typeof window.matchMedia === 'function'
            ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
            : false;

    if (typeof elemen.scrollIntoView === 'function') {
        elemen.scrollIntoView({ behavior: gerakDikurangi ? 'instant' : 'smooth', block: 'center' });
    }

    if (fokus && typeof elemen.focus === 'function') elemen.focus({ preventScroll: true });
}

/** Empat skeleton kartu layanan (design-v1.6 §1.3 `memuat`). */
function SkeletonOpsi() {
    return (
        <div className="mt-4">
            <p className="sr-only" role="status" aria-live="polite">
                Memuat tarif pengiriman…
            </p>
            <div className="grid gap-2 sm:grid-cols-2" aria-hidden="true">
                {[0, 1, 2, 3].map((baris) => (
                    <div key={baris} className="h-[84px] rounded-md bg-slate-200 motion-safe:animate-pulse" />
                ))}
            </div>
        </div>
    );
}

/**
 * `/checkout` — kontrak props §7.5/§7.6/§7.12, design §6 + design-v1.2 §5.
 * Props: `{ keranjang, prefill, pengiriman, pembayaran, flash }`. Formulir 7/12 + `OrderSummary`
 * sticky 5/12 (mobile: ringkasan tepat di atas tombol). Ongkir diminta otomatis 600 ms setelah kode
 * pos 5 angka + alamat ≥10 karakter (`GET /checkout/ongkir?postal_code=`, §7.12) → dropdown satu layanan
 * → total final; submit mengirim `shipping_courier`/`shipping_service`/`shipping_cost` (§7.6).
 * Mode fake: tarif uji datar boleh tanpa memilih layanan; mode api wajib memilih.
 */
export default function Checkout({ keranjang = null, prefill = null, pengiriman = null, ringkasan = null, flash = null }) {
    const [clientErrors, setClientErrors] = useState({});
    const [throttle, setThrottle] = useState(null);

    const form = useForm({
        customer_name: prefill?.customer_name ?? '',
        customer_phone: prefill?.customer_phone ?? '',
        customer_email: prefill?.customer_email ?? '',
        customer_address: prefill?.customer_address ?? '',
        customer_city: prefill?.customer_city ?? '',
        customer_postal_code: prefill?.customer_postal_code ?? '',
        note: prefill?.note ?? '',
        shipping_courier: null,
        shipping_service: null,
        shipping_cost: null,
    });

    const [opsi, setOpsi] = useState([]);
    const [gratis, setGratis] = useState(pengiriman?.gratis ?? null);
    const [pilihan, setPilihan] = useState(null);
    /** Galat submit karena layanan belum dipilih / berubah (design-v1.6 §1.2). */
    const [galatEkspedisi, setGalatEkspedisi] = useState(null);
    /** S0 menunggu · S1 memuat · S2 siap · S3 kosong · S4 galat · S7 timeout (design-v1.2 §5.3). */
    const [statusTarif, setStatusTarif] = useState('menunggu');
    const [galatTarif, setGalatTarif] = useState(null);
    /** Naikkan untuk meminta ulang tarif (tombol Coba lagi). */
    const [versiTarif, setVersiTarif] = useState(0);

    const abortRef = useRef(null);
    /** Cache tarif per kode pos selama halaman terbuka (design-v1.2 §5.3 S2). */
    const cacheRef = useRef(new Map());

    const items = Array.isArray(keranjang?.items) ? keranjang.items : [];
    const isEmpty = keranjang?.is_empty === true || items.length === 0;
    const subtotal = Number(keranjang?.subtotal ?? 0) || 0;

    const modeFake = pengiriman?.mode === 'fake';
    const galatKonfig = pengiriman?.galat ?? null;
    const asal = pengiriman?.asal ?? null;
    const beratGram = Number(pengiriman?.berat_gram ?? 0) || 0;
    const tarifUji = Number(pengiriman?.tarif_uji ?? 0) || 0;
    const gratisAktif = gratis?.aktif === true;
    const gratisTerpenuhi = gratis?.terpenuhi === true;
    const gratisMin = Number(gratis?.min ?? 0) || 0;

    const postal = String(form.data.customer_postal_code ?? '');
    const alamat = String(form.data.customer_address ?? '');
    const postalValid = POSTAL_PATTERN.test(postal);
    /** S0: tarif baru diminta setelah kode pos 5 angka + alamat ≥10 karakter (design-v1.2 §5.3). */
    const tarifSiap = postalValid && alamat.trim().length >= 10;

    /** Mode fake boleh submit tanpa memilih layanan; mode api wajib (kontrak §7.12). */
    const biayaOngkir = pilihan
        ? pilihan.gratis === true
            ? 0
            : Number(pilihan.cost ?? 0) || 0
        : modeFake && statusTarif === 'siap'
          ? tarifUji
          : null;
    const ongkirFinal = biayaOngkir !== null;
    /** Diskon dari server ikut mengurangi total (design-v1.6 §4). */
    const diskonNilai = Number(ringkasan?.diskon ?? 0) || 0;
    const totalServer = ringkasan?.total == null ? NaN : Number(ringkasan.total);
    const total = ongkirFinal
        ? subtotal - diskonNilai + biayaOngkir
        : Number.isFinite(totalServer)
          ? totalServer
          : subtotal - diskonNilai;
    /** Harga asli untuk tampilan GRATIS: tarif opsi terpilih, atau `ringkasan` awal. */
    const ongkirAsli = pilihan
        ? Number(pilihan.cost) > 0
            ? Number(pilihan.cost)
            : null
        : (ringkasan?.ongkir_asli ?? null);
    const ongkirDitanggung = pilihan
        ? pilihan.gratis === true
            ? (ongkirAsli ?? 0)
            : 0
        : (ringkasan?.ongkir_ditanggung_toko ?? null);

    /** S1/S3/S4/S5/S7 memblokir submit (design-v1.2 §5.4). */
    const tarifMemblokir = ['memuat', 'kosong', 'galat', 'timeout'].includes(statusTarif);
    /** Mode api wajib pilih kurir; mode fake boleh submit tanpa memilih (S6). */
    const siapKirim =
        !isEmpty && !galatKonfig && !tarifMemblokir && (Boolean(pilihan) || modeFake);

    const fieldError = (key) => clientErrors[key] ?? form.errors?.[key] ?? null;

    /** Kolom bermasalah (klien + server), urut sesuai formulir; nilai kosong dari klien diabaikan. */
    const kolomBermasalah = URUTAN_KOLOM.filter((key) => Boolean(fieldError(key)));
    const kolomPertama = kolomBermasalah[0] ?? null;
    const jumlahBermasalah = kolomBermasalah.length;

    /**
     * design §5.7 state `error-field`: galat yang datang dari server (422 yang lolos validasi klien)
     * digulirkan otomatis ke kolom pertama; fokus tidak direbut agar pembaca layar tidak tersentak.
     */
    const kunciGalatServer = URUTAN_KOLOM.filter((key) => Boolean(form.errors?.[key])).join(',');

    useEffect(() => {
        if (kunciGalatServer === '') return;

        gulirKe(kunciGalatServer.split(',')[0], { fokus: false });
    }, [kunciGalatServer]);

    /** Alamat profil kosong → notice + fokus ke kolom alamat (design-v1.2 §5.2). */
    useEffect(() => {
        if (String(prefill?.customer_address ?? '').trim().length >= 10) return undefined;

        const timer = window.setTimeout(() => document.getElementById('customer_address')?.focus?.(), 0);
        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** design §6.6: `flash.error` "Ongkir berubah, pilih ulang kurir." → buang cache + minta tarif ulang. */
    useEffect(() => {
        if (typeof flash?.error !== 'string' || !flash.error.includes('Ongkir berubah')) return;

        setPilihan(null);
        form.setData((data) => ({ ...data, shipping_courier: null, shipping_service: null, shipping_cost: null }));
        cacheRef.current.delete(String(form.data.customer_postal_code ?? ''));
        setVersiTarif((nilai) => nilai + 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flash?.error]);

    const update = (key, value) => {
        form.setData(key, value);
        if (clientErrors[key]) setClientErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    /** Hapus pilihan kurir + biaya; `null` di form berarti server memakai tarif uji (mode fake). */
    const kosongkanKurir = () => {
        form.setData((nilai) => ({
            ...nilai,
            shipping_courier: null,
            shipping_service: null,
            shipping_cost: null,
        }));
    };

    /**
     * Kode pos berubah → daftar, pilihan, dan biaya lama dibuang supaya tarif lama tidak pernah
     * terkirim (design-v1.2 §5.3).
     */
    const updateKodePos = (value) => {
        update('customer_postal_code', value);

        if (value !== postal) {
            setOpsi([]);
            setPilihan(null);
            setGalatTarif(null);
            setGalatEkspedisi(null);
            setStatusTarif('menunggu');
            kosongkanKurir();
        }
    };

    /**
     * Tarif otomatis (design-v1.2 §5.3): jeda 600 ms setelah kode pos 5 angka + alamat ≥10 karakter,
     * cache per kode pos, respons lama dibatalkan, batas tunggu 10 detik (S7).
     */
    useEffect(() => {
        let debounce = null;
        let controller = null;
        let batas = null;
        let lewat = false;

        if (abortRef.current) abortRef.current.abort();
        abortRef.current = null;

        if (galatKonfig) {
            setStatusTarif('menunggu');
            return undefined;
        }

        if (!tarifSiap) {
            setOpsi([]);
            setPilihan(null);
            setGalatTarif(null);
            setStatusTarif('menunggu');
            kosongkanKurir();
            return undefined;
        }

        const tersimpan = cacheRef.current.get(postal);
        if (tersimpan) {
            setOpsi(tersimpan.opsi);
            setGratis(tersimpan.gratis ?? null);
            setGalatTarif(null);
            setStatusTarif(tersimpan.opsi.length > 0 ? 'siap' : 'kosong');
            return undefined;
        }

        const mulai = () => {
            controller = new AbortController();
            abortRef.current = controller;
            // Tarif lama tidak boleh tampil sebagai tarif sah saat memuat/ timeout (design-v1.6 §1.3).
            setOpsi([]);
            setPilihan(null);
            kosongkanKurir();
            setStatusTarif('memuat');
            setGalatTarif(null);

            batas = window.setTimeout(() => {
                lewat = true;
                controller.abort();
            }, TARIF_TIMEOUT_MS);

            fetch(`/checkout/ongkir?postal_code=${encodeURIComponent(postal)}`, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
                signal: controller.signal,
            })
                .then(async (response) => {
                    if (abortRef.current !== controller) return;

                    let data = null;
                    try {
                        data = await response.json();
                    } catch {
                        data = null;
                    }

                    if (abortRef.current !== controller) return;

                    if (!data || typeof data !== 'object') {
                        setOpsi([]);
                        setPilihan(null);
                        setGalatTarif(null);
                        setStatusTarif('galat');
                        kosongkanKurir();
                        return;
                    }

                    if (!response.ok) {
                        const pesan =
                            data?.errors?.postal_code?.[0] ??
                            data?.errors?.customer_postal_code?.[0] ??
                            data?.message ??
                            null;
                        setOpsi([]);
                        setPilihan(null);
                        setGalatTarif(pesan);
                        setStatusTarif('galat');
                        kosongkanKurir();
                        return;
                    }

                    const daftar = Array.isArray(data?.opsi) ? data.opsi : [];
                    const daftarSemua = Array.isArray(data?.semua) ? data.semua : [];
                    const pesanGalat = typeof data?.galat === 'string' && data.galat.trim() !== '' ? data.galat : null;

                    setOpsi(daftar);
                    setPilihan(null);
                    setGratis(data?.gratis ?? null);

                    if (pesanGalat) {
                        setGalatTarif(pesanGalat);
                        setStatusTarif('galat');
                        kosongkanKurir();
                        return;
                    }

                    cacheRef.current.set(postal, { opsi: daftar, semua: daftarSemua, gratis: data?.gratis ?? null });
                    setGalatTarif(null);
                    setStatusTarif(daftar.length > 0 ? 'siap' : 'kosong');
                    kosongkanKurir();
                })
                .catch((error) => {
                    if (abortRef.current !== controller) return;

                    if (error?.name === 'AbortError') {
                        if (lewat) {
                            setGalatTarif(null);
                            setStatusTarif('timeout');
                        }
                        return;
                    }

                    setOpsi([]);
                    setPilihan(null);
                    setGalatTarif(null);
                    setStatusTarif('galat');
                    kosongkanKurir();
                })
                .finally(() => {
                    if (batas) window.clearTimeout(batas);
                    if (abortRef.current === controller) abortRef.current = null;
                });
        };

        debounce = window.setTimeout(mulai, TARIF_DEBOUNCE_MS);

        return () => {
            if (debounce) window.clearTimeout(debounce);
            if (batas) window.clearTimeout(batas);
            if (controller) controller.abort();
            if (abortRef.current === controller) abortRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postal, tarifSiap, galatKonfig, versiTarif]);

    const cobaLagiTarif = () => setVersiTarif((nilai) => nilai + 1);

    /** Pilih satu layanan; `shipping_cost` 0 untuk layanan gratis (§7.12). */
    const pilihOpsi = (baris) => {
        if (!baris || baris.tersedia !== true) return;
        // Tarif resmi diambil dari `opsi[]` (hanya layanan bertarif).
        const terpilih = cariOpsi(`${baris.courier_code}|${baris.service_code}`) ?? baris;
        setPilihan(terpilih);
        setGalatEkspedisi(null);
        form.setData((nilai) => ({
            ...nilai,
            shipping_courier: terpilih?.courier_code ?? null,
            shipping_service: terpilih?.service_code ?? null,
            shipping_cost: terpilih ? (terpilih.gratis === true ? 0 : Number(terpilih.cost ?? 0) || 0) : null,
        }));
    };

    /** Cari opsi dari nilai `courier|service` dengan mencocokkan kedua kode, bukan teksnya. */
    const cariOpsi = (nilai) => {
        const [kodeKurir, kodeLayanan] = String(nilai ?? '').split('|');
        return opsi.find((item) => item?.courier_code === kodeKurir && item?.service_code === kodeLayanan) ?? null;
    };

    /**
     * Daftar ceklis: hanya `opsi[]` (layanan bertarif) selama `statusTarif === 'siap'` (design-v1.7 §1).
     * `semua[]` tetap disimpan di cache tetapi tidak lagi dirender.
     */
    const daftarEkspedisi =
        statusTarif === 'siap' ? opsi.filter((item) => item?.tersedia === true) : [];

    /** Kelompokkan per `courier_code` dengan urutan kemunculan pertama (urutan server). */
    const grupEkspedisi = [];
    daftarEkspedisi.forEach((item) => {
        const kode = item?.courier_code ?? '-';
        let kelompok = grupEkspedisi.find((pasangan) => pasangan[0] === kode);
        if (!kelompok) {
            kelompok = [kode, { courier_name: item?.courier_name || kode, opsi: [] }];
            grupEkspedisi.push(kelompok);
        }
        kelompok[1].opsi.push(item);
    });

    const galatPilihan =
        galatEkspedisi ??
        form.errors?.shipping_service ??
        form.errors?.shipping_courier ??
        form.errors?.shipping_cost ??
        null;

    const submit = (event) => {
        event.preventDefault();
        if (form.processing) return;

        const found = validate(form.data);
        setClientErrors(found);
        if (Object.keys(found).length > 0) {
            gulirKe(URUTAN_KOLOM.find((key) => found[key]) ?? null);
            return;
        }

        if (!siapKirim) {
            gulirKe('judul-pengiriman', { fokus: false });
            // design-v1.6 §1.2: fokus ke kartu layanan pertama yang tersedia.
            if (!pilihan) {
                if (statusTarif === 'siap') setGalatEkspedisi('Pilih layanan pengiriman dulu.');
                const radio = document.querySelector('input[name="shipping_service"]:not(:disabled)');
                const aksi = document.querySelector('#cobaLagiTarif, a[href="/kontak-kami"]');
                (radio ?? aksi)?.focus?.({ preventScroll: true });
            }
            return;
        }

        setThrottle(null);
        form.post('/checkout', {
            preserveScroll: true,
            onHttpException: (response) => {
                if (response?.status === 429) {
                    setThrottle('Terlalu banyak percobaan membuat pesanan. Tunggu sebentar, lalu coba lagi.');
                    return false;
                }

                return undefined;
            },
        });
    };

    /**
     * Ringkasan kolom bermasalah: kolom pertama + jumlahnya (design §5.7 `error-field`).
     * Dipakai dua kali — di atas formulir dan tepat di atas CTA di dalam `OrderSummary`.
     */
    const noticeValidasi = (className) => {
        if (jumlahBermasalah === 0) return null;

        const label = LABEL_KOLOM[kolomPertama] ?? kolomPertama;
        const pesan = fieldError(kolomPertama);
        const ringkas = jumlahBermasalah === 1 ? `Kolom ${label}: ${pesan}` : `Kolom pertama ${label}: ${pesan}`;

        return (
            <InlineNotice tone="error" className={className} title={`Ada ${jumlahBermasalah} kolom yang perlu diperbaiki`}>
                <p>{ringkas}</p>
                <Button variant="secondary" className="mt-3" onClick={() => gulirKe(kolomPertama)}>
                    Perbaiki kolom
                </Button>
            </InlineNotice>
        );
    };

    const sisaGratis = gratisAktif && !gratisTerpenuhi && gratisMin > subtotal ? gratisMin - subtotal : 0;

    /** design §6.2: helper ringkasan berubah mengikuti pilihan kurir, bukan error merah. */
    const helperRingkasan = pilihan
        ? pilihan.gratis === true
            ? 'Gratis ongkir reguler aktif.'
            : gratisTerpenuhi && pilihan.is_regular !== true
              ? 'Layanan ini tidak termasuk gratis ongkir.'
              : sisaGratis > 0
                ? `Tambah ${rupiah(sisaGratis) ?? '-'} lagi untuk gratis ongkir reguler.`
                : null
        : null;

    /** Baris kecil di bawah ceklis (design-v1.6 §1.1). */
    const helperGratis =
        gratisAktif && gratisTerpenuhi
            ? 'Gratis ongkir reguler aktif.'
            : sisaGratis > 0 && pilihan
              ? `Tambah ${rupiah(sisaGratis) ?? '-'} lagi untuk gratis ongkir reguler.`
              : null;

    /** Alasan tombol nonaktif, tampil di bawah tombol (design-v1.2 §5.4). */
    const alasanTolak =
        !isEmpty && !modeFake && statusTarif === 'siap' && !pilihan ? 'Pilih layanan pengiriman dulu.' : null;

    const panelRingkasan = (className, { tanpaCta = false } = {}) => (
        <OrderSummary
            className={className}
            items={items}
            subtotal={keranjang?.subtotal ?? null}
            discount={diskonNilai || null}
            shipping={biayaOngkir}
            shippingOriginal={ongkirAsli}
            shippingCovered={ongkirDitanggung}
            shippingBadge={ongkirFinal && modeFake ? <Badge tone="warning">Tarif uji</Badge> : null}
            total={total}
            helper={helperRingkasan}
            ctaLabel={tanpaCta ? null : form.processing ? 'Membuat pesanan…' : 'Buat pesanan'}
            formId="checkout-form"
            onSubmit={submit}
            loading={form.processing}
            disabled={form.processing || isEmpty || !siapKirim}
            note={tanpaCta ? null : alasanTolak ?? 'Pembayaran dipilih di langkah berikutnya.'}
        >
            {noticeValidasi('mt-4')}
        </OrderSummary>
    );

    return (
        <PublicLayout>
            <Head title="Checkout" />

            <div className="container py-4">
                <Breadcrumb
                    items={[{ label: 'Beranda', href: '/' }, { label: 'Keranjang', href: '/keranjang' }, { label: 'Checkout' }]}
                />

                <header className="mt-2">
                    <h1 className="text-h1 text-ink">Checkout</h1>
                    <p className="mt-1 text-body text-ink-soft">Lengkapi data penerima, pilih pengiriman, lalu buat pesanan.</p>
                </header>

                {isEmpty && (
                    <InlineNotice tone="warning" className="mt-4">
                        <p>
                            Keranjang masih kosong.{' '}
                            <Link href="/keranjang" className="underline underline-offset-4">
                                Kembali ke keranjang
                            </Link>{' '}
                            untuk menambah produk.
                        </p>
                    </InlineNotice>
                )}

                {flash?.error && (
                    <InlineNotice tone="error" className="mt-4">
                        <p>{flash.error}</p>
                    </InlineNotice>
                )}

                {throttle && (
                    <InlineNotice tone="error" className="mt-4">
                        <p>{throttle}</p>
                    </InlineNotice>
                )}

                {noticeValidasi('mt-4')}

                <div className="mt-6 flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:items-start lg:gap-10">
                    <form id="checkout-form" className="min-w-0 lg:col-span-7" onSubmit={submit} noValidate>
                        <section className="card p-6" aria-labelledby="judul-penerima">
                            <h2 id="judul-penerima" className="text-h3 text-ink">
                                Kontak &amp; Penerima
                            </h2>

                            <div className="mt-4 flex flex-col gap-4">
                                <Field label="Nama Penerima" htmlFor="customer_name" required error={fieldError('customer_name')}>
                                    <Input
                                        id="customer_name"
                                        name="customer_name"
                                        autoComplete="name"
                                        required
                                        maxLength={100}
                                        value={form.data.customer_name}
                                        error={fieldError('customer_name')}
                                        onChange={(event) => update('customer_name', event.target.value)}
                                    />
                                </Field>

                                <Field
                                    label="Nomor WhatsApp"
                                    htmlFor="customer_phone"
                                    required
                                    error={fieldError('customer_phone')}
                                    hint="Format 08…, 62…, atau +62…"
                                >
                                    <Input
                                        id="customer_phone"
                                        name="customer_phone"
                                        type="tel"
                                        inputMode="tel"
                                        autoComplete="tel"
                                        placeholder="08xxxxxxxxxx"
                                        maxLength={20}
                                        required
                                        value={form.data.customer_phone}
                                        error={fieldError('customer_phone')}
                                        onChange={(event) => update('customer_phone', event.target.value)}
                                    />
                                </Field>

                                <Field label="Email" htmlFor="customer_email" required error={fieldError('customer_email')}>
                                    <Input
                                        id="customer_email"
                                        name="customer_email"
                                        type="email"
                                        autoComplete="email"
                                        maxLength={150}
                                        value={form.data.customer_email}
                                        error={fieldError('customer_email')}
                                        onChange={(event) => update('customer_email', event.target.value)}
                                    />
                                </Field>
                            </div>
                        </section>

                        <section className="card mt-6 p-6" aria-labelledby="judul-alamat">
                            <h2 id="judul-alamat" className="text-h3 text-ink">
                                Alamat Pengiriman
                            </h2>
                            <p className="mt-1 text-meta text-slate-500">
                                Diisi dari alamat akun. Perubahan hanya berlaku untuk pesanan ini.
                            </p>

                            {String(prefill?.customer_address ?? '').trim().length < 10 &&
                                String(form.data.customer_address ?? '').trim().length < 10 && (
                                    <InlineNotice
                                        tone="warning"
                                        className="mt-4"
                                        title="Lengkapi alamat pengiriman untuk menghitung ongkir."
                                    />
                                )}

                            <div className="mt-4 flex flex-col gap-4">
                                <Field
                                    label="Alamat Lengkap"
                                    htmlFor="customer_address"
                                    required
                                    error={fieldError('customer_address')}
                                    hint="Nama jalan, nomor rumah, RT/RW, kelurahan, dan patokan bila ada."
                                >
                                    <Textarea
                                        id="customer_address"
                                        name="customer_address"
                                        autoComplete="street-address"
                                        maxLength={500}
                                        value={form.data.customer_address}
                                        error={fieldError('customer_address')}
                                        onChange={(event) => update('customer_address', event.target.value)}
                                    />
                                </Field>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field label="Kota/Kecamatan" htmlFor="customer_city" required error={fieldError('customer_city')}>
                                        <Input
                                            id="customer_city"
                                            name="customer_city"
                                            autoComplete="address-level2"
                                            maxLength={100}
                                            value={form.data.customer_city}
                                            error={fieldError('customer_city')}
                                            onChange={(event) => update('customer_city', event.target.value)}
                                        />
                                    </Field>

                                    <Field label="Kode Pos" htmlFor="customer_postal_code" required error={fieldError('customer_postal_code')}>
                                        <Input
                                            id="customer_postal_code"
                                            name="customer_postal_code"
                                            inputMode="numeric"
                                            autoComplete="postal-code"
                                            maxLength={5}
                                            value={form.data.customer_postal_code}
                                            error={fieldError('customer_postal_code')}
                                            onChange={(event) => updateKodePos(event.target.value.replace(/[^0-9]/g, ''))}
                                        />
                                    </Field>
                                </div>
                            </div>
                        </section>

                        <section className="card mt-6 p-6" aria-labelledby="judul-pengiriman">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h2 id="judul-pengiriman" className="text-h3 text-ink">
                                    Pengiriman
                                </h2>
                                {modeFake ? <Badge tone="warning">Tarif uji</Badge> : <Badge tone="success">Tarif Biteship</Badge>}
                            </div>

                            <p className="mt-2 text-meta text-slate-500">
                                {asal?.nama
                                    ? `Dikirim dari ${asal.nama}${asal.kode_pos ? ` (${asal.kode_pos})` : ''}.`
                                    : 'Asal pengiriman belum diatur penjual.'}
                                {beratGram > 0 ? ` Berat ${formatNumber(beratGram)} g.` : ''}
                            </p>

                            {galatKonfig && (
                                <InlineNotice tone="error" className="mt-4" title="Pengiriman belum siap">
                                    <p>{galatKonfig}</p>
                                    <p className="mt-1">
                                        <Link href="/kontak-kami" className="underline underline-offset-4">
                                            Hubungi penjual
                                        </Link>{' '}
                                        untuk menyelesaikan pesanan.
                                    </p>
                                </InlineNotice>
                            )}

                            {!galatKonfig && statusTarif === 'menunggu' && (
                                <p className="mt-4 text-body text-ink-soft">
                                    Tarif muncul otomatis setelah alamat dan kode pos terisi.
                                </p>
                            )}

                            {!galatKonfig && statusTarif === 'memuat' && <SkeletonOpsi />}

                            {!galatKonfig && statusTarif === 'galat' && (
                                <InlineNotice tone="error" className="mt-4" title="Tarif gagal dimuat.">
                                    {galatTarif ? <p>{galatTarif}</p> : null}
                                    <Button id="cobaLagiTarif" variant="secondary" className="mt-3" onClick={cobaLagiTarif}>
                                        Coba lagi
                                    </Button>
                                </InlineNotice>
                            )}

                            {!galatKonfig && statusTarif === 'timeout' && (
                                <InlineNotice tone="warning" className="mt-4" title="Tarif lama dimuat. Coba lagi.">
                                    <Button id="cobaLagiTarif" variant="secondary" className="mt-3" onClick={cobaLagiTarif}>
                                        Coba lagi
                                    </Button>
                                </InlineNotice>
                            )}

                            {!galatKonfig &&
                                (statusTarif === 'kosong' || (statusTarif === 'siap' && daftarEkspedisi.length === 0)) && (
                                <InlineNotice tone="warning" className="mt-4" title="Tidak ada layanan untuk kode pos ini.">
                                    <Link href="/kontak-kami" className="underline underline-offset-4">
                                        Hubungi penjual
                                    </Link>
                                </InlineNotice>
                            )}

                            {!galatKonfig && statusTarif === 'siap' && daftarEkspedisi.length > 0 && (
                                <fieldset
                                    className="mt-4"
                                    aria-labelledby="judul-pengiriman"
                                    aria-describedby={galatPilihan ? 'galat-ekspedisi' : undefined}
                                >
                                    <legend className="sr-only">Pilih layanan pengiriman</legend>
                                    <div className="flex flex-col gap-4">
                                        {grupEkspedisi.map(([kode, kelompok]) => (
                                            <div key={kode}>
                                                <p className="mb-2 text-label text-slate-600">{kelompok.courier_name}</p>
                                                <div className="grid gap-2 sm:grid-cols-2">
                                                    {kelompok.opsi.map((item) => {
                                                        const aktif =
                                                            pilihan?.courier_code === item?.courier_code &&
                                                            pilihan?.service_code === item?.service_code;
                                                        const harga = Number(item?.cost);
                                                        const id = `pilih-layanan-${item?.courier_code ?? '-'}-${item?.service_code ?? '-'}`;

                                                        return (
                                                            <label
                                                                key={`${item?.courier_code ?? '-'}|${item?.service_code ?? '-'}`}
                                                                htmlFor={id}
                                                                className={cn(
                                                                    'relative flex min-h-[84px] cursor-pointer items-start gap-3 rounded-md border-2 bg-white p-3.5 transition-colors',
                                                                    aktif ? 'border-brand bg-brand-100/40' : 'border-line hover:border-brand',
                                                                    'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand has-[:focus-visible]:ring-offset-2 peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2',
                                                                )}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    id={id}
                                                                    name="shipping_service"
                                                                    value={`${item?.courier_code ?? '-'}|${item?.service_code ?? '-'}`}
                                                                    checked={aktif}
                                                                    aria-invalid={galatPilihan ? true : undefined}
                                                                    onChange={() => pilihOpsi(item)}
                                                                    className="peer sr-only"
                                                                />
                                                                <span
                                                                    aria-hidden="true"
                                                                    className={cn(
                                                                        'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
                                                                        aktif ? 'border-brand bg-brand' : 'border-slate-400 bg-white',
                                                                    )}
                                                                >
                                                                    {aktif && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                                                                </span>
                                                                <span className="min-w-0 flex-1">
                                                                    <span className="block truncate text-body font-semibold text-ink">
                                                                        {item?.service_name || item?.service_code || '-'}
                                                                    </span>
                                                                    <span className="mt-0.5 block text-meta text-slate-600">
                                                                        {item?.etd || 'Estimasi belum tersedia'}
                                                                    </span>
                                                                </span>
                                                                <span className="shrink-0 text-right">
                                                                    {item?.gratis === true ? (
                                                                        <>
                                                                            <span className="block text-label font-semibold text-success-strong">
                                                                                GRATIS
                                                                            </span>
                                                                            {harga > 0 && (
                                                                                <span className="block text-meta text-slate-600 line-through tabular-nums">
                                                                                    {rupiah(harga)}
                                                                                </span>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <span className="block text-body font-semibold tabular-nums text-ink">
                                                                            {rupiah(harga) ?? '—'}
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {helperGratis && <p className="mt-3 text-meta text-slate-500">{helperGratis}</p>}
                                    {galatPilihan && (
                                        <p id="galat-ekspedisi" role="alert" className="mt-2 text-meta text-danger-strong">
                                            {galatPilihan}
                                        </p>
                                    )}
                                </fieldset>
                            )}
                        </section>

                        <div className="mt-6 lg:hidden">{panelRingkasan(null, { tanpaCta: true })}</div>

                        <section className="card mt-6 p-6" aria-labelledby="judul-catatan">
                            <h2 id="judul-catatan" className="text-h3 text-ink">
                                Catatan (opsional)
                            </h2>

                            <div className="mt-4">
                                <Field
                                    label="Catatan"
                                    htmlFor="note"
                                    error={fieldError('note')}
                                    hint="Contoh: ukuran atau warna alternatif bila stok habis."
                                >
                                    <Textarea
                                        id="note"
                                        name="note"
                                        maxLength={500}
                                        value={form.data.note}
                                        error={fieldError('note')}
                                        onChange={(event) => update('note', event.target.value)}
                                    />
                                </Field>
                                <p className="mt-1 text-right text-meta text-slate-500" aria-live="polite">
                                    {String(form.data.note ?? '').length}/500
                                </p>
                            </div>
                        </section>

                        <div className="mt-6 lg:hidden">
                            <Button
                                type="submit"
                                form="checkout-form"
                                fullWidth
                                loading={form.processing}
                                disabled={form.processing || isEmpty || !siapKirim}
                            >
                                Buat pesanan
                            </Button>
                            <p className="mt-2 text-meta text-slate-500">
                                {alasanTolak ?? 'Pembayaran dipilih di langkah berikutnya.'}
                            </p>
                        </div>
                    </form>

                    <div className="hidden lg:col-span-5 lg:block">{panelRingkasan('lg:sticky lg:top-[88px]')}</div>
                </div>

                <p className="mt-4 text-meta text-slate-500">
                    Pembayaran aman lewat Midtrans.
                    {asal?.nama ? ` Dikirim dari ${asal.nama}.` : ''}
                </p>
            </div>
        </PublicLayout>
    );
}

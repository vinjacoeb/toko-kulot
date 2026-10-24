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

/** Batas tunggu Cek Ongkir (design §6.4: maks 10 detik). */
const CEK_TIMEOUT_MS = 10000;

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

/** Skeleton dua baris opsi (design §6.4 state loading). */
function SkeletonOpsi() {
    return (
        <div aria-busy="true" aria-live="polite" className="mt-4 flex flex-col gap-3">
            <span className="sr-only">Mengecek ongkir…</span>
            {[0, 1].map((baris) => (
                <div key={baris} className="flex items-start gap-3 rounded-md border border-line p-4 motion-safe:animate-pulse">
                    <span className="mt-1 h-4 w-4 shrink-0 rounded-full bg-line" aria-hidden="true" />
                    <span className="flex min-w-0 flex-1 flex-col gap-2">
                        <span className="h-3 w-2/5 rounded bg-line" aria-hidden="true" />
                        <span className="h-3 w-3/5 rounded bg-line" aria-hidden="true" />
                    </span>
                </div>
            ))}
        </div>
    );
}

/**
 * `/checkout` — kontrak props §7.5/§7.6/§7.12, design §6.
 * Props: `{ keranjang, prefill, pengiriman, pembayaran, flash }`. Formulir 7/12 + `OrderSummary`
 * sticky 5/12 (mobile: ringkasan tepat di atas tombol). Ongkir baru diketahui setelah **Cek Ongkir**
 * (`GET /checkout/ongkir?postal_code=`) → radio satu layanan → total final; submit mengirim
 * `shipping_courier`/`shipping_service`/`shipping_cost` (§7.6). Mode fake: tarif uji datar boleh tanpa
 * memilih layanan; mode api wajib memilih.
 */
export default function Checkout({ keranjang = null, prefill = null, pengiriman = null, flash = null }) {
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
    const [opsiGalat, setOpsiGalat] = useState(null);
    const [cekLoading, setCekLoading] = useState(false);
    /** Kode pos yang dipakai daftar opsi saat ini; kosong = belum pernah cek. */
    const [kodePosOpsi, setKodePosOpsi] = useState(null);
    /** Opsi lama ditandai kedaluwarsa karena kode pos berubah (design §6.3–§6.4). */
    const [kedaluwarsa, setKedaluwarsa] = useState(false);

    const abortRef = useRef(null);
    const timerRef = useRef(null);
    const legendRef = useRef(null);

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

    const postalValid = POSTAL_PATTERN.test(String(form.data.customer_postal_code ?? ''));
    /** Design §6.4/§6.6: mode fake pun memilih opsi eksplisit — total final hanya setelah satu opsi dipilih. */
    const ongkirFinal = Boolean(pilihan);
    const biayaOngkir = pilihan ? (pilihan.gratis === true ? 0 : Number(pilihan.cost ?? 0) || 0) : 0;
    const total = subtotal + biayaOngkir;

    /** Submit butuh data wajib terisi; mode api juga butuh satu layanan dipilih (§7.6). */
    const wajibTerisi =
        String(form.data.customer_name ?? '').trim() !== '' &&
        String(form.data.customer_phone ?? '').trim() !== '' &&
        String(form.data.customer_email ?? '').trim() !== '' &&
        String(form.data.customer_address ?? '').trim() !== '' &&
        String(form.data.customer_city ?? '').trim() !== '' &&
        postalValid;

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

    /** design §6.6: `flash.error` "Ongkir berubah, pilih ulang kurir." → kosongkan pilihan + fokus Cek Ongkir. */
    useEffect(() => {
        if (typeof flash?.error !== 'string' || !flash.error.includes('Ongkir berubah')) return;

        setPilihan(null);
        setKedaluwarsa(true);
        form.setData((data) => ({ ...data, shipping_courier: null, shipping_service: null, shipping_cost: null }));
        // Kartu: "tampilkan pesan + muat ulang opsi" — tarif server berubah, jadi langsung cek ulang.
        cekOngkir();
        gulirKe('cek-ongkir');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flash?.error]);

    /** Bersihkan permintaan & timer saat halaman ditinggalkan. */
    useEffect(
        () => () => {
            if (abortRef.current) abortRef.current.abort();
            if (timerRef.current) window.clearTimeout(timerRef.current);
        },
        []
    );

    const update = (key, value) => {
        form.setData(key, value);
        if (clientErrors[key]) setClientErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    /**
     * Kode pos berubah setelah opsi tampil → daftar ditandai kedaluwarsa, pilihan dikosongkan,
     * total kembali subtotal (design §6.3–§6.4). Tarif lama tidak pernah dikirim.
     */
    const updateKodePos = (value) => {
        update('customer_postal_code', value);

        if (kodePosOpsi && value !== kodePosOpsi) {
            setPilihan(null);
            setKedaluwarsa(true);
            form.setData((data) => ({ ...data, shipping_courier: null, shipping_service: null, shipping_cost: null }));
        }
    };

    const hentikanCek = () => {
        if (abortRef.current) abortRef.current.abort();
        if (timerRef.current) window.clearTimeout(timerRef.current);
        abortRef.current = null;
        timerRef.current = null;
        setCekLoading(false);
    };

    /** `GET /checkout/ongkir?postal_code=` (§7.12) — hanya lewat tombol, respons lama dibatalkan. */
    const cekOngkir = async () => {
        if (cekLoading) return;

        if (!postalValid) {
            setClientErrors((prev) => ({ ...prev, customer_postal_code: 'Kode pos harus 5 angka.' }));
            setOpsi([]);
            setPilihan(null);
            setOpsiGalat(null);
            setKodePosOpsi(null);
            gulirKe('customer_postal_code');
            return;
        }

        hentikanCek();
        const controller = new AbortController();
        abortRef.current = controller;
        setCekLoading(true);
        setOpsiGalat(null);

        timerRef.current = window.setTimeout(() => {
            if (abortRef.current === controller) {
                controller.abort();
                abortRef.current = null;
                setCekLoading(false);
                setOpsiGalat('Ongkir belum bisa dihitung.');
            }
        }, CEK_TIMEOUT_MS);

        try {
            const response = await fetch(`/checkout/ongkir?postal_code=${encodeURIComponent(form.data.customer_postal_code)}`, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
                signal: controller.signal,
            });

            let data = null;
            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (abortRef.current !== controller) return;

            if (!response.ok) {
                const pesanKolom = data?.errors?.postal_code?.[0] ?? data?.errors?.customer_postal_code?.[0] ?? null;
                setOpsi([]);
                setPilihan(null);
                setKodePosOpsi(null);
                setOpsiGalat(pesanKolom ?? data?.message ?? 'Ongkir belum bisa dihitung.');
                return;
            }

            const daftar = Array.isArray(data?.opsi) ? data.opsi : [];
            setOpsi(daftar);
            setKodePosOpsi(String(form.data.customer_postal_code ?? ''));
            setKedaluwarsa(false);
            setPilihan(null);
            if (data?.gratis) setGratis(data.gratis);
            setOpsiGalat(typeof data?.galat === 'string' && data.galat.trim() !== '' ? data.galat : null);
            form.setData((nilai) => ({ ...nilai, shipping_courier: null, shipping_service: null, shipping_cost: null }));

            if (daftar.length > 0) {
                window.setTimeout(() => legendRef.current?.focus?.(), 0);
            }
        } catch (error) {
            if (error?.name === 'AbortError') return;
            if (abortRef.current !== controller) return;

            setOpsi([]);
            setPilihan(null);
            setKodePosOpsi(null);
            setOpsiGalat('Ongkir belum bisa dihitung.');
        } finally {
            if (abortRef.current === controller) {
                if (timerRef.current) window.clearTimeout(timerRef.current);
                timerRef.current = null;
                abortRef.current = null;
                setCekLoading(false);
            }
        }
    };

    /** Pilih satu layanan; `shipping_cost` 0 untuk layanan gratis (§7.12). */
    const pilihOpsi = (opsiDipilih) => {
        setPilihan(opsiDipilih);
        form.setData((nilai) => ({
            ...nilai,
            shipping_courier: opsiDipilih?.courier_code ?? null,
            shipping_service: opsiDipilih?.service_code ?? null,
            shipping_cost: opsiDipilih ? (opsiDipilih.gratis === true ? 0 : Number(opsiDipilih.cost ?? 0) || 0) : null,
        }));
    };

    const submit = (event) => {
        event.preventDefault();
        if (form.processing) return;

        const found = validate(form.data);
        setClientErrors(found);
        if (Object.keys(found).length > 0) {
            gulirKe(URUTAN_KOLOM.find((key) => found[key]) ?? null);
            return;
        }

        if (!pilihan) {
            setOpsiGalat('Pilih layanan pengiriman.');
            gulirKe('cek-ongkir');
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
        : 'Ongkir ditambahkan setelah kurir dipilih.';

    const ringkasan = (className) => (
        <OrderSummary
            className={className}
            items={items}
            subtotal={keranjang?.subtotal ?? null}
            shipping={pilihan ? biayaOngkir : null}
            shippingText={ongkirFinal ? null : 'Belum dipilih'}
            shippingBadge={pilihan?.gratis === true ? <Badge tone="success">Gratis Ongkir</Badge> : null}
            totalLabel={ongkirFinal ? 'Total' : 'Subtotal'}
            total={ongkirFinal ? total : subtotal}
            helper={helperRingkasan}
            ctaLabel={form.processing ? 'Membuat pesanan…' : 'Buat Pesanan'}
            formId="checkout-form"
            onSubmit={submit}
            loading={form.processing}
            disabled={form.processing || isEmpty || Boolean(galatKonfig) || !wajibTerisi || !pilihan}
            note="Pembayaran dipilih di langkah berikutnya."
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

                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <Button
                                    id="cek-ongkir"
                                    variant="secondary"
                                    onClick={cekOngkir}
                                    disabled={cekLoading || !postalValid || Boolean(galatKonfig)}
                                >
                                    {cekLoading ? 'Mengecek ongkir…' : 'Cek Ongkir'}
                                </Button>
                                {!kodePosOpsi && !cekLoading && (
                                    <p className="text-meta text-slate-500">Masukkan kode pos untuk melihat layanan.</p>
                                )}
                                {modeFake && !kodePosOpsi && !cekLoading && (
                                    <p className="text-meta text-slate-500">
                                        Mode uji: semua layanan memakai tarif {rupiah(tarifUji) ?? '-'} dari pengaturan toko.
                                    </p>
                                )}
                            </div>

                            {cekLoading && <SkeletonOpsi />}

                            {!cekLoading && opsiGalat && (
                                <InlineNotice tone="error" className="mt-4">
                                    <p>{opsiGalat}</p>
                                    {!galatKonfig && (
                                        <Button variant="secondary" className="mt-3" onClick={cekOngkir}>
                                            Coba Lagi
                                        </Button>
                                    )}
                                </InlineNotice>
                            )}

                            {!cekLoading && kedaluwarsa && opsi.length > 0 && (
                                <InlineNotice tone="warning" className="mt-4">
                                    <p>Kode pos berubah. Cek ongkir lagi.</p>
                                </InlineNotice>
                            )}

                            {!cekLoading && !opsiGalat && opsi.length === 0 && kodePosOpsi && (
                                <p className="mt-4 text-body text-ink-soft">
                                    Belum ada layanan aktif untuk kode pos ini.{' '}
                                    <Link href="/kontak-kami" className="underline underline-offset-4">
                                        Hubungi penjual
                                    </Link>
                                    .
                                </p>
                            )}

                            {!cekLoading && opsi.length > 0 && (
                                <fieldset className="mt-4" aria-describedby="pilih-layanan-hint">
                                    <legend
                                        ref={legendRef}
                                        tabIndex={-1}
                                        className="text-label uppercase text-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
                                    >
                                        Pilih layanan pengiriman
                                    </legend>
                                    <p id="pilih-layanan-hint" className="mt-1 text-meta text-slate-500">
                                        Satu layanan per pesanan. Harga dan estimasi dari server.
                                    </p>

                                    <div className="mt-3 flex flex-col gap-3">
                                        {opsi.map((item) => {
                                            const kunci = `${item?.courier_code ?? '-'}-${item?.service_code ?? '-'}`;
                                            const dipilih =
                                                pilihan?.courier_code === item?.courier_code &&
                                                pilihan?.service_code === item?.service_code;
                                            const harga = Number(item?.cost ?? 0) || 0;

                                            return (
                                                <label
                                                    key={kunci}
                                                    className={cn(
                                                        'flex cursor-pointer items-start gap-3 rounded-md border-2 p-4 transition-colors',
                                                        dipilih ? 'border-brand bg-brand-100' : 'border-line bg-white hover:border-brand/40',
                                                        kedaluwarsa && 'cursor-not-allowed opacity-60',
                                                        'focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent-500'
                                                    )}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="shipping_service"
                                                        value={kunci}
                                                        className="mt-1 h-4 w-4 shrink-0 accent-brand"
                                                        checked={dipilih}
                                                        disabled={kedaluwarsa}
                                                        onChange={() => pilihOpsi(item)}
                                                    />
                                                    <span className="min-w-0 flex-1">
                                                        <span className="flex flex-wrap items-center gap-2">
                                                            <span className="text-body font-semibold text-ink">
                                                                {item?.label ??
                                                                    [item?.courier_name, item?.service_name].filter(Boolean).join(' ')}
                                                            </span>
                                                            {item?.is_regular === true && <Badge tone="brand">Reguler</Badge>}
                                                            {item?.gratis === true && <Badge tone="success">Gratis Ongkir</Badge>}
                                                        </span>
                                                        <span className="mt-1 block text-meta text-slate-500">
                                                            {item?.etd ? `${item.etd}` : 'Estimasi tidak tersedia'}
                                                        </span>
                                                        <span className="mt-1 flex flex-wrap items-baseline gap-2 text-body text-ink">
                                                            {item?.gratis === true ? (
                                                                <>
                                                                    <span className="text-meta text-slate-500 line-through">
                                                                        {rupiah(harga) ?? '-'}
                                                                    </span>
                                                                    <span className="font-semibold">Rp0</span>
                                                                    <span className="text-meta text-success-strong">
                                                                        Hemat {rupiah(harga) ?? '-'}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className="font-semibold">{rupiah(harga) ?? '-'}</span>
                                                            )}
                                                        </span>
                                                        {gratisTerpenuhi && item?.is_regular !== true && (
                                                            <span className="mt-1 block text-meta text-slate-500">
                                                                Layanan ini tidak termasuk gratis ongkir.
                                                            </span>
                                                        )}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    {gratisAktif && gratisTerpenuhi && (
                                        <p className="mt-3 text-meta text-success-strong">Gratis ongkir reguler aktif.</p>
                                    )}
                                    {sisaGratis > 0 && pilihan && (
                                        <p className="mt-3 text-meta text-slate-500">
                                            Tambah {rupiah(sisaGratis) ?? '-'} lagi untuk gratis ongkir reguler.
                                        </p>
                                    )}
                                </fieldset>
                            )}
                        </section>

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

                        <div className="mt-6 lg:hidden">{ringkasan()}</div>
                    </form>

                    <div className="hidden lg:col-span-5 lg:block">{ringkasan('lg:sticky lg:top-[88px]')}</div>
                </div>

                <p className="mt-4 text-meta text-slate-500">
                    Pembayaran aman lewat Midtrans.
                    {asal?.nama ? ` Dikirim dari ${asal.nama}.` : ''}
                </p>
            </div>
        </PublicLayout>
    );
}

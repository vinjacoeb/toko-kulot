import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';
import Breadcrumb from '../../Components/Breadcrumb';
import Field from '../../Components/Field';
import InlineNotice from '../../Components/InlineNotice';
import Input from '../../Components/Input';
import OrderSummary from '../../Components/OrderSummary';
import Textarea from '../../Components/Textarea';

const PHONE_PATTERN = /^(\+62|62|0)8[0-9]{7,12}$/;
const POSTAL_PATTERN = /^\d{5}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Validasi ringan di klien (kontrak §7.6); server tetap sumber kebenaran. */
function validate(values) {
    const errors = {};

    if (String(values.customer_name).trim() === '') errors.customer_name = 'Nama penerima wajib diisi.';
    if (String(values.customer_phone).trim() === '') errors.customer_phone = 'Nomor WhatsApp wajib diisi.';
    else if (!PHONE_PATTERN.test(String(values.customer_phone).trim())) errors.customer_phone = 'Nomor WhatsApp tidak valid.';

    if (String(values.customer_email).trim() === '') errors.customer_email = 'Email wajib diisi.';
    else if (!EMAIL_PATTERN.test(String(values.customer_email).trim())) errors.customer_email = 'Email tidak valid.';

    if (String(values.customer_address).trim() === '') errors.customer_address = 'Alamat lengkap wajib diisi.';
    if (String(values.customer_city).trim() === '') errors.customer_city = 'Kota/kecamatan wajib diisi.';

    if (String(values.customer_postal_code).trim() === '') errors.customer_postal_code = 'Kode pos wajib diisi.';
    else if (!POSTAL_PATTERN.test(String(values.customer_postal_code).trim())) errors.customer_postal_code = 'Kode pos harus 5 angka.';

    if (String(values.note).length > 500) errors.note = 'Catatan maksimal 500 karakter.';

    return errors;
}

/**
 * `/checkout` — kontrak props §7.5/§7.6, design §5.7.
 * Props: `{ keranjang, prefill, pembayaran, midtrans }`. Formulir dua kolom,
 * `OrderSummary` sticky mengirim formulir yang sama lewat atribut `form` (anti kirim ganda
 * dijaga `processing`).
 */
export default function Checkout({ keranjang = null, prefill = null, pembayaran = null, flash = null }) {
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
    });

    const items = Array.isArray(keranjang?.items) ? keranjang.items : [];
    const isEmpty = keranjang?.is_empty === true || items.length === 0;
    const expiryMinutes = Number(pembayaran?.expiry_minutes ?? 0) || null;

    const fieldError = (key) => clientErrors[key] ?? form.errors?.[key] ?? null;

    const update = (key, value) => {
        form.setData(key, value);
        if (clientErrors[key]) setClientErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const submit = (event) => {
        event.preventDefault();
        if (form.processing) return;

        const found = validate(form.data);
        setClientErrors(found);
        if (Object.keys(found).length > 0) return;

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

    return (
        <PublicLayout>
            <Head title="Checkout" />

            <div className="container py-4">
                <Breadcrumb
                    items={[
                        { label: 'Beranda', href: '/' },
                        { label: 'Keranjang', href: '/keranjang' },
                        { label: 'Checkout' },
                    ]}
                />

                <header className="mt-2">
                    <h1 className="text-h1 text-ink">Checkout</h1>
                    <p className="mt-1 text-body text-ink-soft">
                        Lengkapi data penerima, lalu selesaikan pembayaran QRIS.
                    </p>
                </header>

                {isEmpty && (
                    <InlineNotice tone="warning" className="mt-4">
                        <p>
                            Keranjang masih kosong. <Link href="/keranjang" className="underline underline-offset-4">Kembali ke keranjang</Link> untuk
                            menambah produk.
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

                <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
                    <form
                        id="checkout-form"
                        className="min-w-0 flex-1 lg:basis-[60%]"
                        onSubmit={submit}
                        noValidate
                    >
                        <section className="card p-6" aria-labelledby="judul-penerima">
                            <h2 id="judul-penerima" className="text-h3 text-ink">
                                Data Penerima
                            </h2>

                            <div className="mt-4 flex flex-col gap-4">
                                <Field label="Nama Penerima" htmlFor="customer_name" required error={fieldError('customer_name')}>
                                    <Input
                                        id="customer_name"
                                        name="customer_name"
                                        autoComplete="name"
                                        maxLength={100}
                                        value={form.data.customer_name}
                                        error={fieldError('customer_name')}
                                        onChange={(event) => update('customer_name', event.target.value)}
                                    />
                                </Field>

                                <Field label="Nomor WhatsApp" htmlFor="customer_phone" required error={fieldError('customer_phone')}>
                                    <Input
                                        id="customer_phone"
                                        name="customer_phone"
                                        type="tel"
                                        inputMode="tel"
                                        autoComplete="tel"
                                        placeholder="08xxxxxxxxxx"
                                        maxLength={20}
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
                                            onChange={(event) => update('customer_postal_code', event.target.value.replace(/[^0-9]/g, ''))}
                                        />
                                    </Field>
                                </div>

                                <Field
                                    label="Catatan (opsional)"
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
                            </div>
                        </section>

                        <section className="card mt-6 p-6" aria-labelledby="judul-pembayaran">
                            <h2 id="judul-pembayaran" className="text-h3 text-ink">
                                Metode Pembayaran
                            </h2>

                            <label className="mt-3 block rounded-md border-2 border-brand p-4">
                                <span className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="qris"
                                        defaultChecked
                                        disabled
                                        aria-describedby="metode-qris-hint"
                                        className="h-4 w-4 accent-brand"
                                    />
                                    <span className="text-body font-semibold text-ink">
                                        {pembayaran?.label ?? 'QRIS (semua e-wallet & m-banking)'}
                                    </span>
                                </span>
                                <span id="metode-qris-hint" className="mt-1 block pl-7 text-meta text-slate-500">
                                    Pindai kode QR dengan aplikasi e-wallet atau m-banking
                                    {expiryMinutes ? `, lalu bayar dalam ${expiryMinutes} menit.` : '.'}
                                </span>
                            </label>

                            <p className="mt-2 text-meta text-slate-500">Metode pembayaran lain belum tersedia.</p>
                        </section>

                    </form>

                    <div className="lg:w-summary lg:shrink-0">
                        <OrderSummary
                            className="lg:sticky lg:top-20"
                            subtotal={keranjang?.subtotal ?? null}
                            shipping={keranjang?.shipping_cost ?? null}
                            total={keranjang?.total ?? null}
                            ctaLabel="Buat Pesanan"
                            formId="checkout-form"
                            onSubmit={submit}
                            loading={form.processing}
                            disabled={form.processing || isEmpty}
                            note="Pembayaran QRIS"
                        />
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}

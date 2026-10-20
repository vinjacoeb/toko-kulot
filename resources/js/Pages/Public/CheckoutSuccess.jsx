import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';
import Breadcrumb from '../../Components/Breadcrumb';
import InlineNotice from '../../Components/InlineNotice';
import ReviewForm from '../../Components/ReviewForm';
import Button from '../../Components/Button';
import { CheckIcon } from '../../Components/icons';
import { formatDateTime, formatNumber, rupiah } from '../../lib/format';

/**
 * `/checkout/{order}/selesai` — kontrak props §7.9 dan §9.1, design §5.8.
 * Props: `{ pesanan, ulasan: { boleh, sudah } }` + `errors` hasil validasi Inertia.
 * Satu kartu penilaian per produk; kirim ulasan lewat `POST /checkout/{order}/ulasan`.
 */
export default function CheckoutSuccess({ pesanan = null, ulasan = null, errors = {}, flash = null }) {
    const orderId = pesanan?.id ?? null;
    const items = Array.isArray(pesanan?.items) ? pesanan.items : [];
    const sudah = (Array.isArray(ulasan?.sudah) ? ulasan.sudah : []).map((id) => Number(id));

    const [busyProduct, setBusyProduct] = useState(null);
    const [submittedId, setSubmittedId] = useState(null);
    const [justRated, setJustRated] = useState({});

    /** Produk yang belum dinilai pada pesanan ini — server menolak produk yang sudah dinilai. */
    const pending = items.filter(
        (item) => !sudah.includes(Number(item.product_id)) && justRated[item.product_id] === undefined
    );

    /** Satu kiriman = satu entri `ulasan[]` (kontrak §9.1), jadi galat selalu di indeks 0. */
    const errorFor = (item) =>
        Number(item?.product_id) !== Number(submittedId)
            ? null
            : errors?.['ulasan.0.rating'] ?? errors?.['ulasan.0.product_id'] ?? errors?.['ulasan.0.comment'] ?? null;

    const submitReview = (payload) => {
        if (!orderId || busyProduct !== null) return;

        setSubmittedId(payload.product_id ?? null);
        setBusyProduct(payload.product_id ?? 'x');
        router.post(
            `/checkout/${orderId}/ulasan`,
            {
                ulasan: [
                    {
                        product_id: payload.product_id,
                        rating: payload.rating,
                        comment: payload.comment,
                    },
                ],
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setJustRated((prev) => ({ ...prev, [payload.product_id]: payload.rating }));
                },
                onFinish: () => setBusyProduct(null),
            }
        );
    };

    return (
        <PublicLayout>
            <Head title="Pesanan Diterima" />

            <div className="container py-4">
                <Breadcrumb
                    items={[
                        { label: 'Beranda', href: '/' },
                        { label: 'Keranjang', href: '/keranjang' },
                        { label: 'Pesanan Diterima' },
                    ]}
                />

                <div className="mx-auto max-w-qris text-center">
                    <span
                        className="mt-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success-strong"
                        aria-hidden="true"
                    >
                        <CheckIcon size={32} />
                    </span>

                    <h1 className="mt-3 text-h1 text-ink">Pesanan diterima</h1>

                    {pesanan?.code && (
                        <p className="mt-1 text-body text-ink-soft">
                            Kode order <span className="font-mono">{pesanan.code}</span>
                        </p>
                    )}

                    {pesanan?.paid_at && (
                        <p className="mt-1 text-meta text-slate-500">Dibayar {formatDateTime(pesanan.paid_at)}</p>
                    )}
                </div>

                {flash?.success && (
                    <InlineNotice tone="success" className="mt-4">
                        <p>{flash.success}</p>
                    </InlineNotice>
                )}

                {flash?.error && (
                    <InlineNotice tone="error" className="mt-4">
                        <p>{flash.error}</p>
                    </InlineNotice>
                )}

                <section className="card mt-6 p-6" aria-labelledby="judul-ringkasan">
                    <h2 id="judul-ringkasan" className="text-h3 text-ink">
                        Ringkasan Pesanan
                    </h2>

                    <ul className="mt-4 flex flex-col gap-3">
                        {items.map((item) => (
                            <li key={item.product_id} className="flex items-start justify-between gap-4">
                                <span className="min-w-0">
                                    <span className="block text-body text-ink">{item.name ?? 'Produk'}</span>
                                    <span className="block text-meta text-slate-500">
                                        {item.variant_label ? `${item.variant_label} · ` : ''}
                                        {formatNumber(item.qty)} × {rupiah(item.unit_price) ?? '-'}
                                    </span>
                                </span>
                                <span className="shrink-0 text-body text-ink">{rupiah(item.line_total) ?? '-'}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-5 border-t border-line pt-4">
                        <dl className="flex flex-col gap-3">
                            <div className="flex items-baseline justify-between gap-4">
                                <dt className="text-body text-ink-soft">Subtotal</dt>
                                <dd className="text-body text-ink">{rupiah(pesanan?.subtotal) ?? '-'}</dd>
                            </div>
                            <div className="flex items-baseline justify-between gap-4">
                                <dt className="text-body text-ink-soft">Ongkir</dt>
                                <dd className="text-body text-ink">{rupiah(pesanan?.shipping_cost) ?? '-'}</dd>
                            </div>
                            <div className="flex items-baseline justify-between gap-4">
                                <dt className="text-body font-bold text-ink">Total</dt>
                                <dd className="text-[20px] font-bold leading-none text-ink">{rupiah(pesanan?.total) ?? '-'}</dd>
                            </div>
                        </dl>
                    </div>

                    {pesanan?.customer_name && (
                        <div className="mt-5 border-t border-line pt-5">
                            <h3 className="text-label uppercase text-slate-500">Dikirim ke</h3>
                            <p className="mt-2 text-body text-ink">{pesanan.customer_name}</p>
                            <p className="mt-1 text-meta text-slate-500">{pesanan.customer_phone ?? '-'}</p>
                            <p className="mt-2 text-body text-ink-soft">
                                {pesanan.customer_address ?? '-'}
                                {pesanan.customer_city ? `, ${pesanan.customer_city}` : ''}
                            </p>
                        </div>
                    )}
                </section>

                <section className="mt-8" aria-labelledby="judul-penilaian">
                    <h2 id="judul-penilaian" className="text-h2 text-ink">
                        {pending.length > 0 ? 'Beri Penilaian' : 'Penilaianmu'}
                    </h2>

                    {errors?.ulasan && (
                        <InlineNotice tone="error" className="mt-3">
                            <p>{errors.ulasan}</p>
                        </InlineNotice>
                    )}

                    {pending.length === 0 && (
                        <InlineNotice tone="success" className="mt-3">
                            <p>Terima kasih! Penilaianmu membantu pembeli lain.</p>
                        </InlineNotice>
                    )}

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        {pending.map((item) => (
                            <ReviewForm
                                key={`isi-${item.product_id}`}
                                productId={item.product_id}
                                product={item}
                                submitting={busyProduct === item.product_id}
                                error={errorFor(item)}
                                onSubmit={submitReview}
                            />
                        ))}

                        {items
                            .filter(
                                (item) =>
                                    sudah.includes(Number(item.product_id)) || justRated[item.product_id] !== undefined
                            )
                            .map((item) => (
                                <ReviewForm
                                    key={`sudah-${item.product_id}`}
                                    productId={item.product_id}
                                    product={item}
                                    rating={justRated[item.product_id] ?? 0}
                                    submitted={justRated[item.product_id] !== undefined}
                                    alreadyReviewed={justRated[item.product_id] === undefined}
                                />
                            ))}
                    </div>
                </section>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button href="/produk" variant="secondary">
                        Lihat Produk Lain
                    </Button>
                    <Button href="/">Kembali ke Beranda</Button>
                </div>
            </div>
        </PublicLayout>
    );
}

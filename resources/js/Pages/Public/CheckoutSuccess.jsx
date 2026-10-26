import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';
import Breadcrumb from '../../Components/Breadcrumb';
import InlineNotice from '../../Components/InlineNotice';
import ReviewForm from '../../Components/ReviewForm';
import ShippingEvents from '../../Components/ShippingEvents';
import TimelinePesanan from '../../Components/TimelinePesanan';
import SalinButton from '../../Components/SalinButton';
import Button from '../../Components/Button';
import { CheckIcon } from '../../Components/icons';
import { formatDateTime, formatNumber, rupiah } from '../../lib/format';

/** Status order yang boleh dinilai — kontrak §9.1, sama dengan `ReviewService::isEligible`. */
const STATUS_BOLEH_DINILAI = ['dibayar', 'diproses', 'dikirim', 'selesai'];

/** Nilai teks opsional: kosong → `null` supaya barisnya tidak dirender (design-v1.3 §0). */
const isi = (value) => {
    const str = String(value ?? '').trim();

    return str === '' ? null : str;
};

/** Satu baris `<dl>` dua kolom — design-v1.3 §4. */
function BarisKirim({ label, children }) {
    return (
        <div className="flex flex-col gap-0.5">
            <dt className="text-body text-ink-soft">{label}</dt>
            <dd className="min-w-0 break-words text-body text-ink">{children}</dd>
        </div>
    );
}

/**
 * `/checkout/{order}/selesai` — kontrak props §7.9 dan §9.1, design §5.8.
 * Props: `{ pesanan, ulasan: { boleh, sudah } }` + `errors` hasil validasi Inertia.
 * Satu kartu penilaian per produk; kirim ulasan lewat `POST /checkout/{order}/ulasan`.
 */
export default function CheckoutSuccess({ pesanan = null, ulasan = null, errors = {}, flash = null }) {
    const orderId = pesanan?.id ?? null;
    const items = Array.isArray(pesanan?.items) ? pesanan.items : [];
    const sudah = (Array.isArray(ulasan?.sudah) ? ulasan.sudah : []).map((id) => Number(id));

    /** Bentuk pembeli §7.9/§13 — tanpa `price_final`/`price_selisih`/`webhook_terakhir`. */
    const shipping = pesanan?.shipping ?? null;
    const statusKirim = isi(shipping?.status_label);
    const resi = isi(shipping?.tracking_number);
    const kurirKirim = [isi(shipping?.courier_name), isi(shipping?.service_name)].filter(Boolean).join(' · ');
    const petugasKirim = isi(shipping?.driver?.name);
    const diperbaruiKirim = formatDateTime(shipping?.updated_at);
    const linkLacak = /^https?:\/\//i.test(isi(shipping?.driver?.link) ?? '') ? isi(shipping?.driver?.link) : null;

    /** Gerbang penilaian dari server — kontrak §7.9. */
    const boleh = ulasan?.boleh === true;

    /** Syarat kirim ulasan (kontrak §9.1): order sudah `settlement` dan statusnya boleh dinilai. */
    const syaratDinilai =
        pesanan?.payment_status === 'settlement' && STATUS_BOLEH_DINILAI.includes(String(pesanan?.status ?? ''));

    const [busyProduct, setBusyProduct] = useState(null);
    const [submittedId, setSubmittedId] = useState(null);
    const [justRated, setJustRated] = useState({});

    /**
     * `pesanan.items` berisi satu baris per varian, sedangkan ulasan berlaku per produk
     * (design §5.8, kontrak §9.1): kelompokkan per `product_id` unik lebih dulu supaya satu
     * produk dengan 2+ varian tetap dapat satu kartu penilaian. Ringkasan pesanan di atas
     * tetap memakai `items` per baris varian.
     */
    const produkUnik = items.reduce((daftar, item) => {
        const id = Number(item?.product_id);
        if (!Number.isFinite(id) || id <= 0) return daftar;

        let produk = daftar.find((row) => row.product_id === id);
        if (!produk) {
            produk = { ...item, product_id: id, labelVarian: [] };
            daftar.push(produk);
        }

        const label = String(item?.variant_label ?? '').trim();
        if (label && !produk.labelVarian.includes(label)) produk.labelVarian.push(label);

        return daftar;
    }, []).map(({ labelVarian, ...produk }) => ({
        ...produk,
        variant_label: labelVarian.length > 0 ? labelVarian.join(', ') : null,
    }));

    /** Produk yang belum dinilai pada pesanan ini — server menolak produk yang sudah dinilai. */
    const pending = produkUnik.filter(
        (item) => !sudah.includes(item.product_id) && justRated[item.product_id] === undefined
    );

    /** Produk yang ulasannya sudah tersimpan — dari server atau dari kiriman di sesi ini. */
    const sudahAda = produkUnik.filter(
        (item) => sudah.includes(item.product_id) || justRated[item.product_id] !== undefined
    );

    /**
     * Gerbang penilaian memakai `boleh` dari server — kontrak §7.9, dibekukan 21 Okt 2026: `boleh`
     * bernilai `true` hanya bila server akan menerima minimal satu kiriman ulasan sekarang (syarat
     * §9.1 lewat `ReviewService::isEligible` dan masih ada produk yang belum diulas). Klien tidak
     * mengulang syarat itu sebagai gerbang dan tidak menambal props yang berbeda; cabang
     * "kontradiksi" lama dihapus bersama deviasi servernya (`docs/keputusan-f6-ulasan-boleh.md` §3).
     */
    const tampilkanForm = boleh && pending.length > 0;

    /**
     * Masih ada produk yang belum dinilai tetapi syarat §9.1 belum terpenuhi (belum `settlement`
     * atau statusnya belum boleh dinilai) — notice alasan, bukan gerbang. Saling eksklusif dengan
     * form supaya alasan tidak pernah muncul di atas form yang sedang tampil.
     */
    const alasanBelumBoleh = !tampilkanForm && !syaratDinilai && pending.length > 0;

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
                            Kode order <span className="font-mono tabular-nums">{pesanan.code}</span>
                        </p>
                    )}

                    {pesanan?.paid_at && (
                        <p className="mt-1 text-meta tabular-nums text-slate-500">Dibayar {formatDateTime(pesanan.paid_at)}</p>
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

                {pesanan?.timeline && (
                    <section className="card mt-6 p-6" aria-labelledby="judul-status-pesanan">
                        <h2 id="judul-status-pesanan" className="text-h3 text-ink">
                            Status pesanan
                        </h2>
                        <TimelinePesanan timeline={pesanan.timeline} />
                    </section>
                )}

                <section className="card mt-6 p-6" aria-labelledby="judul-ringkasan">
                    <h2 id="judul-ringkasan" className="text-h3 text-ink">
                        Ringkasan Pesanan
                    </h2>

                    <ul className="mt-4 flex flex-col gap-3">
                        {items.map((item, index) => (
                            <li key={`${item.product_id ?? 'x'}-${index}`} className="flex items-start justify-between gap-4">
                                <span className="min-w-0">
                                    <span className="block text-body text-ink">{item.name ?? 'Produk'}</span>
                                    <span className="block text-meta tabular-nums text-slate-500">
                                        {item.variant_label ? `${item.variant_label} · ` : ''}
                                        {formatNumber(item.qty)} × {rupiah(item.unit_price) ?? '-'}
                                    </span>
                                </span>
                                <span className="shrink-0 whitespace-nowrap text-body tabular-nums text-ink">{rupiah(item.line_total) ?? '-'}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-5 border-t border-line pt-4">
                        <dl className="flex flex-col gap-3">
                            <div className="flex items-baseline justify-between gap-4">
                                <dt className="text-body text-ink-soft">Subtotal</dt>
                                <dd className="text-body tabular-nums text-ink">{rupiah(pesanan?.subtotal) ?? '-'}</dd>
                            </div>
                            <div className="flex items-baseline justify-between gap-4">
                                <dt className="text-body text-ink-soft">Ongkir</dt>
                                <dd className="text-body tabular-nums text-ink">{rupiah(pesanan?.shipping_cost) ?? '-'}</dd>
                            </div>
                            <div className="flex items-baseline justify-between gap-4">
                                <dt className="text-body font-bold text-ink">Total</dt>
                                <dd className="whitespace-nowrap text-h2 font-bold tabular-nums text-ink">{rupiah(pesanan?.total) ?? '-'}</dd>
                            </div>
                        </dl>
                    </div>

                    {pesanan?.customer_name && (
                        <div className="mt-5 border-t border-line pt-5">
                            <h3 className="text-h3 text-ink">Dikirim ke</h3>
                            <p className="mt-2 text-body text-ink">{pesanan.customer_name}</p>
                            <p className="mt-1 text-meta text-slate-500">{pesanan.customer_phone ?? '-'}</p>
                            <p className="mt-2 text-body text-ink-soft">
                                {pesanan.customer_address ?? '-'}
                                {pesanan.customer_city ? `, ${pesanan.customer_city}` : ''}
                            </p>
                        </div>
                    )}

                    <section className="mt-5 border-t border-line pt-5" aria-labelledby="judul-pengiriman">
                        <h3 id="judul-pengiriman" className="text-h3 text-ink">
                            Status pengiriman
                        </h3>
                        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                            <BarisKirim label="Status">{statusKirim ?? '—'}</BarisKirim>

                            <BarisKirim label="Resi">
                                {resi ? (
                                    <SalinButton
                                        value={resi}
                                        ariaLabel={`Salin nomor resi ${pesanan?.code ?? ''}`.trim()}
                                        valueClassName="font-mono tabular-nums"
                                    >
                                        {resi}
                                    </SalinButton>
                                ) : (
                                    'Resi sedang disiapkan.'
                                )}
                            </BarisKirim>

                            {kurirKirim && <BarisKirim label="Kurir">{kurirKirim}</BarisKirim>}
                            {petugasKirim && <BarisKirim label="Petugas kurir">{petugasKirim}</BarisKirim>}
                            {diperbaruiKirim !== '-' && (
                                <BarisKirim label="Diperbarui">
                                    <span className="tabular-nums">{diperbaruiKirim}</span>
                                </BarisKirim>
                            )}
                        </dl>

                        {linkLacak && (
                            <Button
                                as="a"
                                variant="secondary"
                                href={linkLacak}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4"
                            >
                                Lacak paket
                            </Button>
                        )}

                        <ShippingEvents
                            events={shipping?.events}
                            className="mt-5 border-t border-line pt-5"
                        />
                    </section>
                </section>

                <section className="mt-8" aria-labelledby="judul-penilaian">
                    <h2 id="judul-penilaian" className="text-h2 text-ink">
                        {tampilkanForm ? 'Beri Penilaian' : 'Penilaianmu'}
                    </h2>

                    {errors?.ulasan && (
                        <InlineNotice tone="error" className="mt-3">
                            <p>{errors.ulasan}</p>
                        </InlineNotice>
                    )}

                    {alasanBelumBoleh && (
                        <InlineNotice tone="warning" className="mt-3">
                            <p>Ulasan bisa dikirim setelah pembayaran berhasil.</p>
                        </InlineNotice>
                    )}

                    {sudahAda.length > 0 && pending.length === 0 && (
                        <InlineNotice tone="success" className="mt-3">
                            <p>Terima kasih! Penilaianmu membantu pembeli lain.</p>
                        </InlineNotice>
                    )}

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        {tampilkanForm &&
                            pending.map((item) => (
                                <ReviewForm
                                    key={`isi-${item.product_id}`}
                                    productId={item.product_id}
                                    product={item}
                                    submitting={busyProduct === item.product_id}
                                    error={errorFor(item)}
                                    onSubmit={submitReview}
                                />
                            ))}

                        {sudahAda.map((item) => (
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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Head } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';
import Breadcrumb from '../../Components/Breadcrumb';
import InlineNotice from '../../Components/InlineNotice';
import QrisPanel from '../../Components/QrisPanel';
import { formatNumber, rupiah } from '../../lib/format';
import { useDocumentVisible, useLoadingTimeout } from '../../lib/hooks';

/** `pembayaran.status` (§7.7) → state `QrisPanel` (§5.8). */
const STATUS_MAP = {
    pending: 'pending',
    settlement: 'paid',
    expire: 'expired',
    deny: 'expired',
    cancel: 'expired',
};

const POLL_MS = 5000;

/**
 * `/checkout/{order}/bayar` — kontrak props §7.7/§7.8, design §5.8.
 * Panel QRIS terpusat `max-w-qris`; "Cek Status" + polling 5 detik ke
 * `GET /checkout/{order}/status` (JSON) berhenti saat status final.
 * `midtrans` (kontrak §7.7) diteruskan apa adanya ke `QrisPanel` supaya mode
 * pembayaran efektif terlihat pembeli (mode uji = QRIS tidak bisa ditransfer,
 * design §11.3 D9); `pembayaran.galat` (§7.7) diteruskan sebagai `galat`.
 */
export default function CheckoutPay({ pesanan = null, pembayaran = null, midtrans = null, flash = null }) {
    const orderId = pesanan?.id ?? null;
    const [status, setStatus] = useState(() => STATUS_MAP[pembayaran?.status] ?? 'pending');
    const [paidAt, setPaidAt] = useState(pembayaran?.paid_at ?? null);
    const [expiresAt, setExpiresAt] = useState(pembayaran?.expires_at ?? null);
    const [localExpired, setLocalExpired] = useState(false);
    const [checking, setChecking] = useState(false);
    const inFlight = useRef(false);
    const visible = useDocumentVisible();
    const stalled = useLoadingTimeout(checking, 10000);

    /** Hitung mundur habis = QR kedaluwarsa sampai server menyatakan status final. */
    const effectiveStatus = status === 'pending' && localExpired ? 'expired' : status;
    const amount = rupiah(pesanan?.total ?? pembayaran?.gross_amount ?? null) ?? '-';
    const items = Array.isArray(pesanan?.items) ? pesanan.items : [];

    const readStatus = useCallback(
        async (auto = false) => {
            if (!orderId || inFlight.current) return;

            inFlight.current = true;
            if (!auto) setChecking(true);

            try {
                const response = await fetch(`/checkout/${orderId}/status`, {
                    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    credentials: 'same-origin',
                });

                if (!response.ok) throw new Error(`status ${response.status}`);

                const data = await response.json();
                const next = STATUS_MAP[data?.status] ?? 'pending';

                setStatus(next);
                setPaidAt(data?.paid_at ?? null);
                if (data?.expires_at) setExpiresAt(data.expires_at);
                if (next !== 'pending') {
                    setLocalExpired(false);
                    setChecking(false);
                }
            } catch {
                setStatus('error');
                setChecking(false);
            } finally {
                inFlight.current = false;
            }
        },
        [orderId]
    );

    useEffect(() => {
        if (stalled) setStatus('error');
    }, [stalled]);

    useEffect(() => {
        if (effectiveStatus !== 'pending' || !visible) return undefined;

        const timer = window.setInterval(() => readStatus(true), POLL_MS);

        return () => window.clearInterval(timer);
    }, [effectiveStatus, visible, readStatus]);

    const check = () => {
        if (inFlight.current) return;

        setStatus('checking');
        setChecking(true);
        readStatus(false);
    };

    return (
        <PublicLayout>
            <Head title="Pembayaran" />

            <div className="container py-4">
                <Breadcrumb
                    items={[
                        { label: 'Beranda', href: '/' },
                        { label: 'Checkout', href: '/checkout' },
                        { label: 'Pembayaran' },
                    ]}
                />

                <div className="mx-auto max-w-qris">
                    <header className="mt-2 text-center">
                        <h1 className="text-h1 text-ink">Pembayaran QRIS</h1>
                        {pesanan?.code && (
                            <p className="mt-1 text-body text-ink-soft">
                                Pesanan <span className="font-mono">{pesanan.code}</span>
                            </p>
                        )}
                    </header>

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

                    <QrisPanel
                        className="mt-6"
                        status={effectiveStatus}
                        qrString={pembayaran?.qr_string ?? null}
                        qrUrl={pembayaran?.qris_url ?? null}
                        orderCode={pesanan?.code ?? null}
                        total={pesanan?.total ?? pembayaran?.gross_amount ?? null}
                        expiresAt={expiresAt}
                        paidAt={paidAt}
                        reason={pembayaran?.status ?? null}
                        midtrans={midtrans}
                        galat={pembayaran?.galat ?? null}
                        onCheck={check}
                        onExpire={() => setLocalExpired(true)}
                        successHref={orderId ? `/checkout/${orderId}/selesai` : null}
                    />

                    <ol className="mt-6 flex list-decimal flex-col gap-3 pl-5 text-body text-ink-soft">
                        <li>Buka aplikasi e-wallet atau m-banking yang mendukung QRIS.</li>
                        <li>
                            Pindai kode QR di atas, lalu periksa nama toko dan total <strong className="font-semibold text-ink">{amount}</strong>.
                        </li>
                        <li>Selesaikan pembayaran. Status di halaman ini diperbarui otomatis setiap 5 detik.</li>
                    </ol>

                    <section className="card mt-6 p-6" aria-labelledby="judul-rincian">
                        <h2 id="judul-rincian" className="text-h3 text-ink">
                            Rincian Pesanan
                        </h2>

                        <ul className="mt-4 flex flex-col gap-3">
                            {items.map((item) => (
                                <li key={item.id ?? item.product_id} className="flex items-start justify-between gap-4">
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
                                    <dd className="text-[20px] font-bold leading-none text-ink">
                                        {rupiah(pesanan?.total) ?? '-'}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </section>

                    {pesanan?.customer_name && (
                        <section className="card mt-6 p-6" aria-labelledby="judul-kirim">
                            <h2 id="judul-kirim" className="text-h3 text-ink">
                                Dikirim ke
                            </h2>
                            <p className="mt-3 text-body text-ink">{pesanan.customer_name}</p>
                            <p className="mt-1 text-meta text-slate-500">{pesanan.customer_phone ?? '-'}</p>
                            <p className="mt-3 text-body text-ink-soft">
                                {pesanan.customer_address ?? '-'}
                                {pesanan.customer_city ? `, ${pesanan.customer_city}` : ''}
                                {pesanan.customer_postal_code ? ` ${pesanan.customer_postal_code}` : ''}
                            </p>
                            {pesanan.note && (
                                <p className="mt-3 text-meta text-slate-500">Catatan: {pesanan.note}</p>
                            )}
                        </section>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}

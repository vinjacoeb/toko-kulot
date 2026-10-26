import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';
import Badge from '../../Components/Badge';
import Breadcrumb from '../../Components/Breadcrumb';
import CartLine from '../../Components/CartLine';
import EmptyState from '../../Components/EmptyState';
import InlineNotice from '../../Components/InlineNotice';
import OrderSummary from '../../Components/OrderSummary';
import { CartIcon } from '../../Components/icons';
import { formatNumber, rupiah } from '../../lib/format';

/**
 * `/keranjang` — kontrak props §7.0/§7.1, design §5.6.
 * Props: `{ keranjang }` + `flash` bersama (§1). Aksi qty/hapus memakai
 * `PATCH`/`DELETE /keranjang/{item}` (§7.3/§7.4) dan mengembalikan nilai baru dari server.
 */
export default function Cart({ keranjang = null, flash = null }) {
    const { props } = usePage();
    const user = props?.auth?.user ?? null;
    const [updatingId, setUpdatingId] = useState(null);
    const [throttle, setThrottle] = useState(null);

    const items = Array.isArray(keranjang?.items) ? keranjang.items : [];
    const isEmpty = keranjang?.is_empty === true || items.length === 0;
    const count = Number(keranjang?.count ?? 0) || items.length;

    const busy = updatingId !== null;

    const ship = keranjang?.shipping ?? null;
    const gratis = ship?.gratis ?? null;
    const ongkirApi = ship?.mode === 'api';
    const tarifUji = ship?.mode === 'fake' ? (ship?.tarif_uji ?? keranjang?.shipping_cost ?? null) : null;
    /** Ongkir gratis (§7.0: `shipping.gratis` + biaya 0) — chip hijau di samping nominal. */
    const ongkirGratis = !ongkirApi && gratis?.terpenuhi === true && (Number(keranjang?.shipping_cost ?? 0) || 0) === 0;
    const badgeOngkir = ongkirGratis ? (
        <Badge tone="success">Gratis Ongkir</Badge>
    ) : ship?.mode === 'fake' ? (
        <Badge tone="warning">Tarif uji</Badge>
    ) : null;
    const helperOngkir = ongkirApi
        ? gratis?.aktif
            ? `Ongkir dihitung setelah kode pos diisi. Gratis ongkir untuk layanan reguler min. ${rupiah(gratis.min) ?? '-'}.`
            : 'Ongkir dihitung setelah kode pos diisi di halaman checkout.'
        : ship?.mode === 'fake'
          ? `Tarif uji ${rupiah(tarifUji) ?? '-'} dari toko — bukan tarif kurir sebenarnya.`
          : null;

    /** Throttle keranjang (30/menit) — beri tahu pemakai alih-alih membiarkan modal galat bawaan. */
    const onHttpException = (response) => {
        if (response?.status === 429) {
            setThrottle('Terlalu banyak perubahan keranjang. Tunggu sebentar, lalu coba lagi.');
            return false;
        }

        return undefined;
    };

    const changeQty = (item, qty) => {
        if (!item || busy) return;

        setThrottle(null);
        setUpdatingId(item.id ?? null);
        router.patch(
            `/keranjang/${item.id}`,
            { qty },
            {
                preserveScroll: true,
                onHttpException,
                onFinish: () => setUpdatingId(null),
            }
        );
    };

    const removeItem = (item) => {
        if (!item || busy) return;

        setThrottle(null);
        setUpdatingId(item.id ?? null);
        router.delete(`/keranjang/${item.id}`, {
            preserveScroll: true,
            onHttpException,
            onFinish: () => setUpdatingId(null),
        });
    };

    return (
        <PublicLayout>
            <Head title="Keranjang" />

            <div className="container py-4">
                <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Keranjang' }]} />

                <header className="mt-2">
                    <h1 className="text-h1 text-ink">Keranjang</h1>
                    {!isEmpty && (
                        <p className="mt-1 text-body tabular-nums text-ink-soft">
                            {formatNumber(count)} produk di keranjang. Periksa jumlah sebelum melanjutkan.
                        </p>
                    )}
                </header>

                {flash?.success && (
                    <InlineNotice tone="success" className="mt-4">
                        <p>{flash.success}</p>
                    </InlineNotice>
                )}

                {flash?.error && (
                    <InlineNotice tone="warning" className="mt-4">
                        <p>{flash.error}</p>
                    </InlineNotice>
                )}

                {throttle && (
                    <InlineNotice tone="warning" className="mt-4">
                        <p>{throttle}</p>
                    </InlineNotice>
                )}

                {isEmpty ? (
                    <EmptyState
                        className="mt-6"
                        icon={<CartIcon size={96} />}
                        title="Keranjang masih kosong"
                        actionLabel="Mulai Belanja"
                        actionHref="/produk"
                    />
                ) : (
                    <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
                        <section className="min-w-0 flex-1" aria-label="Daftar item keranjang">
                            <div className="hidden grid-cols-[80px_1fr_auto] gap-5 border-b border-line pb-2 text-label text-slate-600 lg:grid">
                                <span className="col-span-2">Produk</span>
                                <span className="text-right">Jumlah &amp; Subtotal</span>
                            </div>

                            <ul>
                                {items.map((item) => (
                                    <CartLine
                                        key={item.id ?? `${item.product_id}-${item.variant_id}`}
                                        item={item}
                                        updating={updatingId === item.id}
                                        onQtyChange={changeQty}
                                        onRemove={removeItem}
                                    />
                                ))}
                            </ul>
                        </section>

                        <div className="lg:w-summary lg:shrink-0">
                            {!user && (
                                <InlineNotice tone="info" className="mb-4">
                                    <p>
                                        Kamu belum masuk. Setelah menekan “Lanjut ke Pembayaran” kamu akan diarahkan
                                        ke halaman masuk — keranjang tetap tersimpan.
                                    </p>
                                </InlineNotice>
                            )}

                            <OrderSummary
                                className="lg:sticky lg:top-20"
                                subtotal={keranjang?.subtotal ?? null}
                                shipping={keranjang?.shipping_cost ?? null}
                                shippingText={ongkirApi ? 'Dihitung saat checkout' : null}
                                shippingBadge={badgeOngkir}
                                totalLabel={ongkirApi ? 'Subtotal' : 'Total'}
                                total={ongkirApi ? (keranjang?.subtotal ?? null) : (keranjang?.total ?? null)}
                                helper={helperOngkir}
                                ctaLabel="Lanjut ke Pembayaran"
                                ctaHref="/checkout"
                                note="Pembayaran aman lewat Midtrans."
                            />
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}

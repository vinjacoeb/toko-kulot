import React, { useState } from 'react';
import { cn, formatDateTime, rupiah } from '../lib/format';
import { midtransMode } from '../lib/midtrans';
import Button from './Button';
import Countdown from './Countdown';
import InlineNotice from './InlineNotice';
import Spinner from './Spinner';
import QrCode from './QrCode';
import { AlertIcon, CheckIcon, CopyIcon, ImageOffIcon } from './icons';

const EXPIRED_MESSAGES = {
    expire: 'Waktu pembayaran habis dan pesanan dibatalkan. Stok sudah dikembalikan ke toko.',
    deny: 'Pembayaran ditolak. Pesanan dibatalkan dan stok sudah dikembalikan ke toko.',
    cancel: 'Pembayaran dibatalkan. Pesanan dibatalkan dan stok sudah dikembalikan ke toko.',
};

/**
 * Panel pembayaran QRIS — design §4.4, §5.8; kontrak §7.7 dan §7.8.
 * `status`: pending | checking | paid | expired | error (design §5.8).
 * QR dirender dari `qrString` (kontrak §7.7: `qr_string` bila `qris_url` null).
 * `midtrans`: status mode pembayaran efektif (kontrak §7.5/§7.7). Saat mode uji
 * (`fake`) panel menampilkan penanda "Mode uji" + `alasan` + `langkah_perbaikan`
 * dari server di atas kode QR (design §11.3 D9, kartu F2); saat `fake=false`
 * penanda tidak dirender. `galat` = `pembayaran.galat` (§7.7) yang siap tampil
 * apa adanya sebagai galat di panel QRIS.
 */
export default function QrisPanel({
    status = 'pending',
    qrString = null,
    qrUrl = null,
    orderCode = null,
    total = null,
    expiresAt = null,
    paidAt = null,
    reason = null,
    midtrans = null,
    galat = null,
    onCheck = null,
    onExpire = null,
    successHref = null,
    newOrderHref = '/produk',
    className = '',
}) {
    const [copied, setCopied] = useState(false);
    const [qrFailed, setQrFailed] = useState(false);

    const busy = status === 'checking';
    const code = orderCode ?? '-';
    const amount = rupiah(total) ?? '-';
    const hasQr = Boolean(qrString) || (Boolean(qrUrl) && !qrFailed);
    const mode = midtransMode(midtrans);
    /** `pembayaran.galat` (§7.7): teks galat siap tampil apa adanya di panel QRIS. */
    const galatText = typeof galat === 'string' && galat.trim() !== '' ? galat : null;

    const copy = async () => {
        if (!orderCode) return;

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(orderCode);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
            }
        } catch {
            setCopied(false);
        }
    };

    if (status === 'paid') {
        return (
            <section
                className={cn('card p-6 text-center', className)}
                aria-live="polite"
                aria-label="Status pembayaran QRIS"
            >
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success-strong" aria-hidden="true">
                    <CheckIcon size={32} />
                </span>
                <h2 className="mt-4 text-h2 text-ink">Pembayaran diterima</h2>
                <p className="mt-2 text-body text-ink-soft">
                    Pesanan <span className="font-mono">{code}</span> sudah dibayar
                    {paidAt ? ` pada ${formatDateTime(paidAt)}` : ''}.
                </p>
                <p className="mt-3 text-[20px] font-bold leading-none text-ink">{amount}</p>
                {successHref && (
                    <div className="mt-5">
                        <Button href={successHref} fullWidth>
                            Lihat Pesanan
                        </Button>
                    </div>
                )}
            </section>
        );
    }

    if (status === 'expired') {
        return (
            <section
                className={cn('card bg-surface p-6 text-center', className)}
                aria-live="polite"
                aria-label="Status pembayaran QRIS"
            >
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-slate-500" aria-hidden="true">
                    <AlertIcon size={32} />
                </span>
                <h2 className="mt-4 text-h2 text-ink">Pembayaran tidak selesai</h2>
                <p className="mt-2 text-body text-ink-soft">
                    {EXPIRED_MESSAGES[reason] ?? EXPIRED_MESSAGES.expire}
                </p>
                <p className="mt-4 text-meta text-slate-600">
                    Kode pesanan <span className="font-mono text-slate-600">{code}</span> · {amount}
                </p>
                <div className="mt-5">
                    <Button href={newOrderHref} fullWidth>
                        Buat Pesanan Baru
                    </Button>
                </div>
            </section>
        );
    }

    return (
        <section className={cn('card p-6', className)} aria-label="Pembayaran QRIS">
            <h2 className="text-center text-h2 text-ink">Selesaikan Pembayaran</h2>

            {(status === 'pending' || status === 'error') && expiresAt && (
                <div className="mt-2 text-center">
                    <Countdown expiresAt={expiresAt} onExpire={onExpire} label="Sisa waktu pembayaran" />
                </div>
            )}
            {status === 'checking' && (
                <p className="mt-2 flex items-center justify-center gap-2 text-meta text-slate-500">
                    <Spinner label="Memeriksa status pembayaran" className="text-brand" />
                    Memeriksa status pembayaran…
                </p>
            )}

            {galatText && (
                <InlineNotice tone="error" title="Pembayaran QRIS bermasalah" className="mt-5">
                    <p>{galatText}</p>
                </InlineNotice>
            )}

            {mode.uji && (
                <InlineNotice tone="warning" title="Mode uji" className="mt-5">
                    <p>{mode.alasan ?? 'Mode uji aktif: tagihan QRIS dibuat lokal (tanpa Midtrans) sehingga tidak bisa ditransfer.'}</p>
                    {mode.langkah.length > 0 ? (
                        <>
                            <p className="mt-2 font-semibold text-ink">Langkah perbaikan untuk pemilik:</p>
                            <ol className="mt-1 list-decimal pl-4">
                                {mode.langkah.map((langkah, index) => (
                                    <li key={index}>{langkah}</li>
                                ))}
                            </ol>
                        </>
                    ) : null}
                </InlineNotice>
            )}

            <div className="mt-5 flex justify-center">
                <div className="rounded-lg border border-line bg-white p-4">
                    {qrString ? (
                        <QrCode value={qrString} size={240} label={`Kode QR pembayaran ${code}`} />
                    ) : qrUrl && !qrFailed ? (
                        <img
                            src={qrUrl}
                            alt={`Kode QR pembayaran ${code}`}
                            width="240"
                            height="240"
                            className="h-[240px] w-[240px] object-contain"
                            onError={() => setQrFailed(true)}
                        />
                    ) : (
                        <div className="flex h-[240px] w-[240px] flex-col items-center justify-center gap-2 text-slate-300">
                            <ImageOffIcon size={40} />
                            <span className="text-meta text-slate-500">Kode QR belum tersedia</span>
                        </div>
                    )}
                </div>
            </div>

            <p className="mt-5 text-center text-[20px] font-bold leading-none text-ink">{amount}</p>
            <p className="mt-2 text-center text-meta text-slate-500">
                Kode pesanan <span className="font-mono text-slate-500">{code}</span>
            </p>

            {status === 'error' && (
                <InlineNotice tone="error" className="mt-4">
                    Gagal memeriksa status pembayaran. Periksa koneksi lalu coba lagi
                    {hasQr ? ' — pembayaran yang sudah kamu lakukan tetap tercatat.' : '.'}
                </InlineNotice>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button
                    variant="primary"
                    fullWidth
                    loading={busy}
                    disabled={busy}
                    onClick={onCheck ?? undefined}
                >
                    {status === 'error' ? 'Coba lagi' : 'Cek Status'}
                </Button>
                <Button variant="secondary" fullWidth onClick={copy} disabled={!orderCode}>
                    <CopyIcon size={18} />
                    {copied ? 'Tersalin' : 'Salin Kode'}
                </Button>
            </div>

            {copied && (
                <p role="status" className="mt-2 text-center text-meta text-success-strong">
                    Kode pesanan disalin.
                </p>
            )}
        </section>
    );
}

import React, { useState } from 'react';
import Badge from '../../../../Components/Badge';
import SalinButton from '../../../../Components/SalinButton';
import StatusBadge from '../../../../Components/StatusBadge';
import QrCode from '../../../../Components/QrCode';
import { ImageOffIcon } from '../../../../Components/icons';
import { formatDateTime, rupiah } from '../../../../lib/format';

/**
 * Panel pembayaran admin — design-v1.2 §7.2, kontrak props §12.17.
 *
 * Kanal = `payment.metode.label` (fallback `pesanan.payment_method_label`); `payment.payment_type`
 * mentah tidak pernah tampil. Instruksi per `payment.instruksi.jenis` (§7.7); semua key selalu ada,
 * yang tidak relevan `null`. `payment` = `null` → teks kosong, bukan galat.
 */

const asText = (value) => (value === null || value === undefined ? '' : String(value));

const uang = (value) => rupiah(value) ?? '-';

const waktu = (value) => (asText(value) === '' ? '—' : formatDateTime(value));

const kelompok = (value) => asText(value).replace(/(\d{4})(?=\d)/g, '$1 ');

const baris = (label, nilai, kunci) => (
    <div
        key={kunci ?? label}
        className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 last:border-b-0"
    >
        <dt className="text-body text-ink-soft">{label}</dt>
        <dd className="min-w-0 break-words text-right text-body text-ink tabular-nums">{nilai}</dd>
    </div>
);

const BarisInstruksi = ({ instruksi }) => {
    const jenis = asText(instruksi?.jenis);

    if (jenis === '') {
        return null;
    }

    if (jenis === 'va') {
        return (
            <>
                {baris('Bank', asText(instruksi.bank) || '—', 'bank')}
                {baris(
                    'Nomor VA',
                    asText(instruksi.nomor_va) === '' ? (
                        '—'
                    ) : (
                        <SalinButton
                            value={asText(instruksi.nomor_va)}
                            ariaLabel="Salin nomor virtual account"
                            className="justify-end"
                            valueClassName="font-mono tabular-nums"
                        >
                            {kelompok(instruksi.nomor_va)}
                        </SalinButton>
                    ),
                    'nomor_va',
                )}
            </>
        );
    }

    if (jenis === 'bill') {
        return (
            <>
                {baris('Biller code', asText(instruksi.biller_code) || '—', 'biller_code')}
                {baris('Bill key', asText(instruksi.bill_key) || '—', 'bill_key')}
            </>
        );
    }

    if (jenis === 'gerai') {
        return (
            <>
                {baris('Gerai', asText(instruksi.store) || '—', 'store')}
                {baris(
                    'Kode bayar',
                    asText(instruksi.payment_code) === '' ? (
                        '—'
                    ) : (
                        <SalinButton
                            value={asText(instruksi.payment_code)}
                            ariaLabel="Salin kode bayar"
                            className="justify-end"
                            valueClassName="font-mono tabular-nums"
                        >
                            {asText(instruksi.payment_code)}
                        </SalinButton>
                    ),
                    'payment_code',
                )}
            </>
        );
    }

    if (jenis === 'qris') {
        // QRIS dirender sebagai gambar QR / tautan `Buka gambar QR` oleh panel di atas — jangan
        // mengulang tautan yang sama di daftar instruksi.
        return null;
    }

    return null;
};

export default function BuktiPembayaran({ payment = null, paymentLabel = null, paymentMethodLabel = null }) {
    const [gambarGagal, setGambarGagal] = useState(false);

    if (payment === null || payment === undefined) {
        return <p className="text-body text-slate-600">Belum ada tagihan.</p>;
    }

    const instruksi = payment.instruksi ?? null;
    const kanal = asText(payment.metode?.label) || asText(paymentMethodLabel) || '—';
    const qrString = asText(instruksi?.qr_string) || asText(payment.qr_string);
    const qrisUrl = asText(instruksi?.qr_url) || asText(payment.qris_url);

    return (
        <div className="flex flex-col gap-4">
            <dl className="flex flex-col">
                {baris('Kanal', kanal, 'kanal')}
                {baris(
                    'Status Midtrans',
                    <StatusBadge status={payment.status} label={asText(paymentLabel) || null} />,
                    'status',
                )}
                {baris(
                    'Transaction ID',
                    asText(payment.transaction_id) === '' ? (
                        '—'
                    ) : (
                        <SalinButton
                            value={asText(payment.transaction_id)}
                            ariaLabel="Salin ID transaksi"
                            className="justify-end"
                            valueClassName="font-mono tabular-nums"
                        >
                            {asText(payment.transaction_id)}
                        </SalinButton>
                    ),
                    'transaction_id',
                )}
                {baris('Jumlah', uang(payment.gross_amount), 'jumlah')}
            </dl>

            {qrString !== '' ? (
                <div className="flex flex-col items-center gap-3 rounded-md border border-line bg-white p-4">
                    <QrCode value={qrString} size={200} label="Kode QR pembayaran pesanan" />
                    {qrisUrl !== '' && (
                        <a
                            href={qrisUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-touch items-center text-label text-brand underline underline-offset-4"
                        >
                            Buka gambar QR
                        </a>
                    )}
                </div>
            ) : (
                qrisUrl !== '' && (
                    <div className="flex justify-center rounded-md border border-line bg-white p-4">
                        {gambarGagal ? (
                            <div className="flex flex-col items-center gap-2 text-center">
                                <span className="text-slate-500" aria-hidden="true">
                                    <ImageOffIcon size={28} />
                                </span>
                                <p className="text-meta text-slate-600">
                                    Gambar QR gagal dimuat. Buka pesanan ini lagi untuk mencoba
                                    ulang.
                                </p>
                            </div>
                        ) : (
                            <img
                                src={qrisUrl}
                                alt="Gambar kode QR pembayaran dari penyedia"
                                width={200}
                                height={200}
                                className="h-[200px] w-[200px] object-contain"
                                onError={() => setGambarGagal(true)}
                            />
                        )}
                    </div>
                )
            )}

            <BarisInstruksi instruksi={instruksi} />

            <dl className="flex flex-col">
                {baris('Kedaluwarsa', waktu(payment.expires_at), 'kedaluwarsa')}
                {baris('Dibayar', waktu(payment.paid_at), 'dibayar')}
            </dl>

            {payment.fake === true && (
                <div className="flex flex-col gap-2">
                    <Badge tone="warning" className="self-start">
                        Mode uji
                    </Badge>
                    <p className="text-meta text-slate-600">Tagihan dibuat tanpa Midtrans.</p>
                </div>
            )}
        </div>
    );
}

import React, { useState } from 'react';
import InlineNotice from '../../../../Components/InlineNotice';
import StatusBadge from '../../../../Components/StatusBadge';
import QrCode from '../../../../Components/QrCode';
import { ImageOffIcon } from '../../../../Components/icons';
import { formatDateTime, rupiah } from '../../../../lib/format';

/**
 * Bukti pembayaran pesanan — kontrak §12.17 (`pesanan.payment`, `null` bila belum ada baris).
 * QrisPanel tidak dipakai: ia panel pembayaran interaktif milik halaman publik; di admin hanya
 * pratinjau readonly. Nilai status/label selalu dari server (tidak dikarang di klien).
 */

const asText = (value) => (value === null || value === undefined ? '' : String(value));

const uang = (value) => rupiah(value) ?? '-';

const baris = (label, nilai, kunci) => (
    <div
        key={kunci ?? label}
        className="flex items-start justify-between gap-4 border-b border-line py-2.5 last:border-b-0"
    >
        <dt className="text-meta text-slate-600">{label}</dt>
        <dd className="min-w-0 break-words text-right text-body text-ink">{nilai}</dd>
    </div>
);

export default function BuktiPembayaran({ payment = null, paymentLabel = null }) {
    const [gambarGagal, setGambarGagal] = useState(false);

    if (payment === null || payment === undefined) {
        return (
            <InlineNotice tone="info" title="Belum ada data pembayaran">
                Pesanan ini belum punya baris pembayaran di server, jadi kode QR dan ID transaksi
                belum tersedia.
            </InlineNotice>
        );
    }

    const qrString = asText(payment.qr_string);
    const qrisUrl = asText(payment.qris_url);
    const lunas = asText(payment.status) === 'settlement';

    return (
        <div className="flex flex-col gap-4">
            {lunas && (
                <InlineNotice tone="success" title="Pembayaran lunas">
                    Server mencatat pembayaran diterima pada {formatDateTime(payment.paid_at)}.
                </InlineNotice>
            )}

            {qrString !== '' ? (
                <div className="flex justify-center rounded-md border border-line bg-white p-4">
                    <QrCode value={qrString} size={200} label="Kode QR pembayaran pesanan" />
                </div>
            ) : qrisUrl !== '' && !gambarGagal ? (
                <div className="flex justify-center rounded-md border border-line bg-white p-4">
                    <img
                        src={qrisUrl}
                        alt="Gambar kode QR pembayaran dari penyedia"
                        width={200}
                        height={200}
                        className="h-[200px] w-[200px] object-contain"
                        onError={() => setGambarGagal(true)}
                    />
                </div>
            ) : qrisUrl !== '' && gambarGagal ? (
                <div className="flex flex-col items-center gap-2 rounded-md border border-line bg-white p-6 text-center">
                    <span className="text-slate-500" aria-hidden="true">
                        <ImageOffIcon size={28} />
                    </span>
                    <p className="text-meta text-slate-600">
                        Gambar QR dari penyedia pembayaran gagal dimuat. Buka pesanan ini lagi untuk
                        mencoba ulang.
                    </p>
                </div>
            ) : (
                <InlineNotice tone="warning" title="Kode QR belum tersedia">
                    Penyedia pembayaran belum mengirim tautan gambar maupun isi kode QR untuk
                    pesanan ini.
                </InlineNotice>
            )}

            <dl className="flex flex-col">
                {baris(
                    'Status pembayaran',
                    <StatusBadge status={payment.status} label={asText(paymentLabel) || null} />,
                )}
                {baris('Penyedia', asText(payment.provider) || '-')}
                {baris('ID transaksi', asText(payment.transaction_id) || '-')}
                {baris('Jumlah', uang(payment.gross_amount))}
                {baris('Kedaluwarsa', formatDateTime(payment.expires_at))}
                {baris('Dibayar', formatDateTime(payment.paid_at))}
            </dl>
        </div>
    );
}

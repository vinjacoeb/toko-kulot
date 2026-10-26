import React from 'react';
import { formatDateTime } from '../lib/format';

/**
 * Daftar "Riwayat pengiriman" — design-v1.4 §2–§3, kontrak §13 / §7.9.
 *
 * `events` dari server sudah urut terbaru → terlama (`{status, label, at}`); komponen
 * menampilkan maksimal 10 entri dan tidak merender apa pun bila kosong. Label status
 * berasal dari server — klien tidak menerjemahkan `status` mentah. Dipakai
 * `Public/History` dan `Public/CheckoutSuccess`.
 */

const DASH = '—';

const waktu = (value) => {
    const hasil = formatDateTime(value);

    return hasil === '-' ? DASH : hasil;
};

const label = (event) => {
    const str = String(event?.label ?? event?.status ?? '').trim();

    return str === '' ? DASH : str;
};

export default function ShippingEvents({ events = null, className = '' }) {
    const daftar = (Array.isArray(events) ? events : [])
        .filter((event) => event !== null && typeof event === 'object')
        .slice(0, 10);

    if (daftar.length === 0) return null;

    return (
        <div className={className}>
            <h4 className="text-body font-medium text-ink">Riwayat pengiriman</h4>
            <ol className="mt-3 flex flex-col gap-3">
                {daftar.map((event, index) => (
                    <li
                        key={`${event?.at ?? 'tanpa-waktu'}-${index}`}
                        className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2"
                    >
                        <span className="flex min-w-0 items-center gap-2">
                            <span
                                aria-hidden="true"
                                className={`h-2 w-2 shrink-0 rounded-full ${
                                    index === 0 ? 'bg-brand' : 'bg-slate-300'
                                }`}
                            />
                            <span className="min-w-0 text-body text-ink">{label(event)}</span>
                        </span>
                        <span className="pl-4 text-sm tabular-nums text-slate-600 sm:pl-0">
                            {waktu(event?.at)}
                        </span>
                    </li>
                ))}
            </ol>
        </div>
    );
}

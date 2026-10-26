import React from 'react';
import { cn, formatDateTime } from '../lib/format';
import { BoxIcon, CheckIcon, TruckIcon, WalletIcon } from './icons';

const DASH = '—';

/** Ikon per node aktif — docs/design-v1.5.md §2. */
const IKON = { created: BoxIcon, paid: WalletIcon, shipped: TruckIcon, completed: CheckIcon };

/** Tanggal aman: tidak valid → `—`. */
const waktu = (value) => {
    const hasil = formatDateTime(value);

    return hasil === '-' ? DASH : hasil;
};

/**
 * Timeline `Dibuat → Dibayar → Dikirim → Selesai` — design §9.3, design-v1.4 §1, design-v1.5 §2.
 * Node aktif = punya waktu; `batal` menambah node merah `Batal`, `payment_status = expire`
 * menambah `Kedaluwarsa`, keduanya menggantikan node yang belum tercapai. Horizontal ≥768,
 * vertikal di 360. `timeline` null/parsial → node tanpa waktu redup, tanpa crash.
 */
export default function TimelinePesanan({ status = null, paymentStatus = null, timeline = null }) {
    const nodes = [
        { key: 'created', label: 'Dibuat', time: timeline?.created_at ?? null },
        { key: 'paid', label: 'Dibayar', time: timeline?.paid_at ?? null },
        { key: 'shipped', label: 'Dikirim', time: timeline?.shipped_at ?? null },
        { key: 'completed', label: 'Selesai', time: timeline?.completed_at ?? null },
    ];

    const terminal =
        status === 'batal'
            ? { key: 'batal', label: 'Batal', danger: true }
            : paymentStatus === 'expire'
              ? { key: 'expire', label: 'Kedaluwarsa', danger: true }
              : null;

    const tampil = terminal
        ? [...nodes.filter((node) => node.time !== null), { ...terminal, time: null }]
        : nodes;

    return (
        <ol className="mt-3 flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
            {tampil.map((node) => {
                const aktif = Boolean(node.time);
                const bahaya = Boolean(node.danger);

                return (
                    <li key={node.key} className="flex items-start gap-3 md:flex-1 md:flex-col md:gap-2">
                        {bahaya ? (
                            <span
                                aria-hidden="true"
                                className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-danger md:mt-0"
                            />
                        ) : (
                            <span
                                aria-hidden="true"
                                className={cn(
                                    '-mt-0.5 shrink-0 md:mt-0',
                                    aktif ? 'text-brand' : 'text-slate-300'
                                )}
                            >
                                {React.createElement(IKON[node.key], { size: 20 })}
                            </span>
                        )}
                        <span className="min-w-0">
                            <span
                                className={cn(
                                    'block text-label',
                                    bahaya ? 'text-danger-strong' : aktif ? 'text-ink' : 'text-slate-400'
                                )}
                            >
                                {node.label}
                            </span>
                            <span
                                className={cn(
                                    'mt-1 block text-meta tabular-nums',
                                    aktif ? 'text-slate-500' : 'text-slate-400'
                                )}
                            >
                                {waktu(node.time)}
                            </span>
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}

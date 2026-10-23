import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/format';

const pad = (value) => String(Math.max(0, value)).padStart(2, '0');

function remainingMs(expiresAt) {
    if (!expiresAt) return null;
    const target = new Date(expiresAt).getTime();
    if (Number.isNaN(target)) return null;
    return target - Date.now();
}

/**
 * Hitung mundur masa bayar — docs/design.md §4.21, §5.8, §4.4.
 * `expires_at` null / tidak valid = tanpa batas waktu (tanpa hitungan).
 * Warna: normal `text-ink-soft`; < 3 menit `text-danger` + `animate-pulse`;
 * berhenti di 00:00 lalu memicu `onExpire` (state `expired` §4.4).
 */
export default function Countdown({ expiresAt = null, onExpire = null, className = '', label = 'Sisa waktu' }) {
    const [ms, setMs] = useState(() => remainingMs(expiresAt));
    const firedRef = useRef(false);
    const onExpireRef = useRef(onExpire);
    onExpireRef.current = onExpire;

    useEffect(() => {
        firedRef.current = false;
        setMs(remainingMs(expiresAt));

        if (!expiresAt) return undefined;
        const timer = window.setInterval(() => {
            const next = remainingMs(expiresAt);
            setMs(next);
            if (next !== null && next <= 0) {
                window.clearInterval(timer);
                if (!firedRef.current) {
                    firedRef.current = true;
                    if (typeof onExpireRef.current === 'function') onExpireRef.current();
                }
            }
        }, 1000);

        return () => window.clearInterval(timer);
    }, [expiresAt]);

    if (ms === null) return null;

    const expired = ms <= 0;
    const soon = !expired && ms <= 3 * 60 * 1000;
    const totalSeconds = Math.floor(ms / 1000);
    const text = `${pad(Math.floor(totalSeconds / 60))}:${pad(totalSeconds % 60)}`;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 text-meta font-mono',
                expired
                    ? 'text-danger-strong'
                    : soon
                      ? 'text-danger animate-pulse motion-reduce:animate-none'
                      : 'text-ink-soft',
                className
            )}
            role="timer"
            aria-live="off"
        >
            <span className="sr-only">{expired ? 'Waktu pembayaran habis' : `${label} ${text}`}</span>
            <span aria-hidden="true">{expired ? 'Kedaluwarsa' : text}</span>
        </span>
    );
}

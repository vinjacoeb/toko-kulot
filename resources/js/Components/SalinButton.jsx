import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/format';
import { CheckIcon, CopyIcon } from './icons';

/**
 * Nilai + tombol salin — design-v1.2 §4.3. `navigator.clipboard` dulu,
 * fallback `document.execCommand('copy')`; sukses → label `Tersalin` 2 detik
 * (diumumkan lewat `role="status"`), gagal → teks diseleksi + helper manual.
 */
export default function SalinButton({
    value = '',
    ariaLabel = 'Salin',
    children = null,
    className = '',
    valueClassName = '',
    buttonClassName = '',
}) {
    const [tersalin, setTersalin] = useState(false);
    const [gagal, setGagal] = useState(false);
    const nilaiRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => () => window.clearTimeout(timerRef.current), []);

    const pilihTeks = () => {
        const node = nilaiRef.current;

        if (!node || typeof window === 'undefined' || !window.getSelection) return;

        const range = document.createRange();
        range.selectNodeContents(node);

        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    };

    const salin = async () => {
        const teks = String(value ?? '');

        if (teks === '') return;

        let berhasil = false;

        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
            try {
                await navigator.clipboard.writeText(teks);
                berhasil = true;
            } catch {
                berhasil = false;
            }
        }

        if (!berhasil && typeof document !== 'undefined') {
            try {
                const area = document.createElement('textarea');
                area.value = teks;
                area.setAttribute('readonly', '');
                area.style.position = 'fixed';
                area.style.opacity = '0';
                document.body.appendChild(area);
                area.select();
                berhasil = document.execCommand('copy');
                document.body.removeChild(area);
            } catch {
                berhasil = false;
            }
        }

        if (berhasil) {
            setTersalin(true);
            setGagal(false);
            window.clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(() => setTersalin(false), 2000);

            return;
        }

        setTersalin(false);
        setGagal(true);
        pilihTeks();
    };

    return (
        <span className={cn('inline-flex flex-wrap items-center gap-2', className)}>
            <span ref={nilaiRef} className={cn('min-w-0 break-all', valueClassName)}>
                {children ?? value}
            </span>

            <button
                type="button"
                onClick={salin}
                aria-label={ariaLabel}
                className={cn(
                    'inline-flex h-touch min-w-touch shrink-0 items-center justify-center gap-1.5 rounded-md border border-line px-3 text-label text-ink transition-colors duration-hover hover:bg-surface',
                    buttonClassName
                )}
            >
                {tersalin ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                <span>{tersalin ? 'Tersalin' : 'Salin'}</span>
            </button>

            <span role="status" className="sr-only">
                {tersalin ? 'Tersalin' : ''}
            </span>

            {gagal && <span className="basis-full text-meta text-ink-soft">Salin manual: tekan Ctrl+C.</span>}
        </span>
    );
}

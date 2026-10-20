import React, { useMemo } from 'react';
import { qrMatrix, qrPath } from '../lib/qr';

/**
 * QR dari `qr_string` server — docs/design.md §4.4 (kotak putih 240px).
 * Modul digambar sebagai satu path SVG agar hemat node.
 */
export default function QrCode({ value = '', size = 240, label = 'Kode QR pembayaran', className = '' }) {
    const matrix = useMemo(() => {
        if (!value) return null;
        try {
            return qrMatrix(value);
        } catch (error) {
            return null;
        }
    }, [value]);

    if (!matrix) {
        return (
            <div
                className={className}
                style={{ width: size, height: size }}
                role="img"
                aria-label="Kode QR belum tersedia"
            />
        );
    }

    const total = matrix.size;
    const path = qrPath(matrix);

    return (
        <svg
            className={className}
            viewBox={`0 0 ${total} ${total}`}
            width={size}
            height={size}
            role="img"
            aria-label={label}
            shapeRendering="crispEdges"
        >
            <rect width={total} height={total} fill="#ffffff" />
            <path d={path} fill="#111827" />
        </svg>
    );
}

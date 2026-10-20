import React from 'react';
import { Link } from '@inertiajs/react';

/**
 * Announcement bar — docs/design.md §3.3 butir 1.
 * Tinggi 36px, latar `brand-700`, teks putih `text-meta`.
 * Tidak dirender bila `text` kosong.
 */
export default function Announcement({ text = null, href = null }) {
    if (!text) return null;

    const content = <span className="text-meta text-white">{text}</span>;

    return (
        <div className="flex h-9 items-center justify-center bg-brand-700 px-4 text-center">
            {href ? (
                <Link href={href} className="underline-offset-4 hover:underline">
                    {content}
                </Link>
            ) : (
                content
            )}
        </div>
    );
}

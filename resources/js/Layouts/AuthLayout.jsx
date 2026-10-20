import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import { TRUST_ICONS } from '../Components/icons';
import { toList } from '../lib/format';

/**
 * AuthLayout — layout halaman autentikasi pembeli, docs/design.md §5.5.
 * Dua kolom: kiri panel brand (`bg-brand-700`, tinggi penuh, logo + tagline +
 * maks 3 bullet manfaat), kanan form `max-w-form` (400px) terpusat vertikal.
 * Mobile: panel brand jadi header 160px (bullet disembunyikan agar muat).
 * Halaman auth tampil tanpa shell publik, seperti `/admin/login` (design §5.9).
 *
 * Bullet manfaat diambil dari data server `settings.landing_sections.trust_strip`
 * (label admin: "keunggulan") — tidak ada teks manfaat karangan; bila kosong,
 * panel hanya menampilkan logo, nama, dan tagline.
 */
export default function AuthLayout({ title, heading, lead = null, settings = null, children }) {
    const page = usePage();
    const source = settings ?? page?.props?.settings ?? null;

    const storeName = source?.store_name ?? 'Toko Kulot';
    const tagline = source?.store_tagline ?? source?.tagline ?? null;
    const logoUrl = source?.store_logo ?? source?.logo_url ?? null;

    // Kontrak props §2 memakai `{ icon, title, subtitle }` (data server nyata);
    // alias `label`/`description` dipertahankan agar tetap cocok dengan TrustStrip.
    const bullets = toList(source?.landing_sections?.trust_strip)
        .filter((item) => item && (item.title || item.label))
        .slice(0, 3)
        .map((item) => ({
            icon: item.icon ?? 'check',
            title: item.title ?? item.label,
            subtitle: item.subtitle ?? item.description ?? item.body ?? null,
        }));

    return (
        <div className="min-h-screen bg-white text-ink lg:grid lg:grid-cols-2">
            <Head title={title} />

            <a
                href="#konten-utama"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-toast focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
            >
                Lewati ke konten utama
            </a>

            <aside className="flex h-[160px] flex-col justify-center gap-3 bg-brand-700 px-6 py-6 text-white lg:h-auto lg:justify-between lg:gap-10 lg:px-12 lg:py-14">
                <div className="flex items-center gap-3">
                    {logoUrl && <img src={logoUrl} alt="" className="h-10 w-auto" />}
                    <span className="font-display text-h2 uppercase text-white">{storeName}</span>
                </div>

                {tagline && <p className="hidden text-body text-white/75 lg:block">{tagline}</p>}

                {bullets.length > 0 && (
                    <ul className="hidden space-y-5 lg:block">
                        {bullets.map((item, index) => {
                            const Icon = TRUST_ICONS[String(item.icon).toLowerCase()] ?? TRUST_ICONS.check;

                            return (
                                <li key={`${item.icon}-${index}`} className="flex items-start gap-3">
                                    <span className="mt-0.5 shrink-0 text-accent-500" aria-hidden="true">
                                        <Icon size={22} />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-label text-white">{item.title}</span>
                                        {item.subtitle && (
                                            <span className="mt-0.5 block text-meta text-white/75">
                                                {item.subtitle}
                                            </span>
                                        )}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </aside>

            <main id="konten-utama" className="flex items-center justify-center px-4 py-10 lg:px-12 lg:py-16">
                <div className="w-full max-w-form">
                    <h1 className="text-h1 text-ink">{heading}</h1>
                    {lead && <p className="mt-2 text-body text-ink-soft">{lead}</p>}
                    <div className="mt-6">{children}</div>
                </div>
            </main>
        </div>
    );
}

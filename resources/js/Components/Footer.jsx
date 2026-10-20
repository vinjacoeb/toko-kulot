import React from 'react';
import { Link } from '@inertiajs/react';
import { SOCIAL_ICONS, MailIcon, MapPinIcon, PhoneIcon } from './icons';

/**
 * Footer — docs/design.md §3.2 + §4.31, kontrak props docs/komponen.md §1.
 * Props: `about`, `links`, `social`, `contact`, `storeName`.
 * Kolom tanpa data tidak dirender (tidak mengarang tautan atau kontak).
 */
export default function Footer({
    about = null,
    links = [],
    social = [],
    contact = null,
    storeName = 'Toko Kulot',
}) {
    const {
        phone = null,
        whatsapp = null,
        email = null,
        address = null,
    } = contact ?? {};


    const columns = Array.isArray(links)
        ? links
              .filter((column) => column && column.title && Array.isArray(column.items))
              .map((column) => ({
                  title: column.title,
                  items: column.items
                      .filter((item) => item && item.label && (item.href ?? item.url))
                      .map((item) => ({ label: item.label, href: item.href ?? item.url })),
              }))
              .filter((column) => column.items.length > 0)
        : [];

    const socialItems = Array.isArray(social)
        ? social
              .filter((item) => item && (item.name ?? item.platform) && (item.href ?? item.url))
              .map((item) => ({
                  name: item.name ?? item.platform,
                  label: item.label ?? null,
                  href: item.href ?? item.url,
              }))
        : [];

    const contactRows = [
        phone && { icon: PhoneIcon, text: phone, href: `tel:${String(phone).replace(/[^\d+]/g, '')}` },
        whatsapp && {
            icon: PhoneIcon,
            text: whatsapp,
            href: `https://wa.me/${String(whatsapp).replace(/[^\d]/g, '')}`,
        },
        email && { icon: MailIcon, text: email, href: `mailto:${email}` },
        address && { icon: MapPinIcon, text: address, href: null },
    ].filter(Boolean);

    const year = new Date().getFullYear();

    return (
        <footer className="bg-footer pb-8 pt-section text-white/75">
            <div className="container">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-gutterLg">
                    <div className="md:col-span-1">
                        <p className="font-display text-h2 uppercase text-white">{storeName}</p>
                        {about && (
                            <p className="mt-3 max-w-xs text-meta text-white/75">{about}</p>
                        )}

                        {socialItems.length > 0 && (
                            <ul className="mt-4 flex items-center gap-3">
                                {socialItems.map((item) => {
                                    const Icon = SOCIAL_ICONS[String(item.name).toLowerCase()];
                                    if (!Icon) return null;

                                    return (
                                        <li key={`${item.name}-${item.href}`}>
                                            <a
                                                href={item.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={item.label ?? item.name}
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/75 transition-colors duration-hover hover:border-white/50 hover:text-white"
                                            >
                                                <Icon size={20} />
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {columns.map((column) => (
                        <div key={column.title}>
                            <p className="text-badge uppercase text-white">{column.title}</p>
                            <ul className="mt-3 space-y-2">
                                {column.items.map((item) => (
                                    <li key={`${column.title}-${item.label}`}>
                                        {item.href?.startsWith('http') ? (
                                            <a
                                                href={item.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-meta text-white/75 hover:text-white hover:underline"
                                            >
                                                {item.label}
                                            </a>
                                        ) : (
                                            <Link
                                                href={item.href ?? '#'}
                                                className="text-meta text-white/75 hover:text-white hover:underline"
                                            >
                                                {item.label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {contactRows.length > 0 && (
                        <div>
                            <p className="text-badge uppercase text-white">Hubungi Kami</p>
                            <ul className="mt-3 space-y-2">
                                {contactRows.map((row) => (
                                    <li key={row.text} className="flex items-start gap-2">
                                        <span className="mt-0.5 shrink-0 text-white/60">
                                            <row.icon size={20} />
                                        </span>
                                        {row.href ? (
                                            <a
                                                href={row.href}
                                                className="text-meta text-white/75 hover:text-white hover:underline"
                                            >
                                                {row.text}
                                            </a>
                                        ) : (
                                            <span className="text-meta text-white/75">{row.text}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="mt-10 border-t border-white/15 pt-6">
                    <p className="text-meta text-white/60">
                        {`© ${year} ${storeName}. Semua hak dilindungi.`}
                    </p>
                </div>
            </div>
        </footer>
    );
}

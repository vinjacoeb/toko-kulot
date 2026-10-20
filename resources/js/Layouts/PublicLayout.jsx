import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Announcement from '../Components/Announcement';
import Footer from '../Components/Footer';
import Header from '../Components/Header';
import NavDrawer from '../Components/NavDrawer';

/**
 * PublicLayout — docs/komponen.md §2.
 * Props: `settings` (store_name, store_tagline, contact_*, header_nav, footer_*), `cartCount`, `user`, `children`.
 * `settings` dibagikan lewat HandleInertiaRequests.
 * Kontrak settings memakai `url` untuk tautan (docs/kontrak-props.md §2); `href` lama tetap dibaca.
 */
const DEFAULT_NAV = [
    { label: 'Beranda', href: '/' },
    { label: 'Produk', href: '/produk' },
    { label: 'Kontak', href: '/kontak-kami' },
];

const hrefOf = (item) => item?.url ?? item?.href ?? null;

export default function PublicLayout({ settings = {}, cartCount = 0, user = null, children }) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const page = usePage();

    const storeName = settings?.store_name ?? 'Toko Kulot';
    const rawNav = settings?.header_nav;
    const nav =
        Array.isArray(rawNav) && rawNav.length > 0
            ? rawNav
                  .filter((item) => item && item.label && hrefOf(item))
                  .map((item) => ({ label: item.label, href: hrefOf(item) }))
            : DEFAULT_NAV;

    const announcement = settings?.landing_sections?.announcement ?? null;
    const announcementText = announcement?.text ?? settings?.announcement_text ?? null;
    const announcementHref = announcement
        ? hrefOf(announcement)
        : settings?.announcement_href ?? null;

    const sharedCart = page?.props?.cart?.count;
    const currentUser = user ?? page?.props?.auth?.user ?? null;
    const count = Number(cartCount ?? sharedCart ?? settings?.cart_count ?? 0) || 0;

    return (
        <div className="flex min-h-screen flex-col bg-white text-ink">
            <a
                href="#konten-utama"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-toast focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
            >
                Lewati ke konten utama
            </a>

            <Announcement text={announcementText} href={announcementHref} />

            <Header
                nav={nav}
                cartCount={count}
                user={currentUser}
                storeName={storeName}
                logoUrl={settings?.store_logo ?? settings?.logo_url ?? null}
                onOpenDrawer={() => setDrawerOpen(true)}
            />

            <NavDrawer
                open={drawerOpen}
                nav={nav}
                onClose={() => setDrawerOpen(false)}
                title="Menu"
                footer={
                    currentUser ? (
                        <p className="text-meta text-ink-soft">
                            {`Masuk sebagai ${currentUser.name ?? currentUser.email ?? 'Akun'}`}
                        </p>
                    ) : (
                        <Link href="/login" className="btn-primary w-full justify-center">
                            Masuk
                        </Link>
                    )
                }
            />

            <main id="konten-utama" className="flex-1">
                {children}
            </main>

            <Footer
                about={settings?.footer_about ?? settings?.store_tagline ?? settings?.tagline ?? null}
                links={settings?.footer_links ?? []}
                social={settings?.footer_social ?? []}
                contact={{
                    phone: settings?.contact_phone ?? null,
                    whatsapp: settings?.contact_whatsapp ?? null,
                    email: settings?.contact_email ?? null,
                    address: settings?.contact_address ?? null,
                }}
                storeName={storeName}
            />
        </div>
    );
}

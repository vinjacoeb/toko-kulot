import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import Announcement from '../Components/Announcement';
import Footer from '../Components/Footer';
import Header from '../Components/Header';
import NavDrawer from '../Components/NavDrawer';

/**
 * PublicLayout — docs/komponen.md §2.
 * Props: `settings` (store_name, store_tagline, contact_*, header_nav, footer_*), `cartCount`, `user`, `children`.
 * Dasar identitas = props bersama `settings` dari `HandleInertiaRequests` (docs/kontrak-props.md §1),
 * lalu prop `settings` eksplisit halaman (bila ada) menimpa per key. Dengan begitu halaman yang
 * controller-nya tidak mengirim `settings` — /keranjang, /checkout, /checkout/{order}/bayar,
 * /checkout/{order}/selesai — tetap memakai nama toko, logo, dan copyright dari pengaturan
 * (docs/rencana-perbaikan-5.md butir 5).
 * Kontrak settings memakai `url` untuk tautan (docs/kontrak-props.md §2); `href` lama tetap dibaca.
 *
 * Badge keranjang: sumber utama = props bersama `cart.count` (kontrak §1/§7,
 * `HandleInertiaRequests` membagikan `cart_count` sesi = jumlah qty item). Urutan:
 * `cart.count` → prop halaman `cartCount` → `settings.cart_count` → `0`.
 * Semua aksi keranjang (POST/PATCH/DELETE `/keranjang`) adalah kunjungan Inertia penuh dan
 * `usePage()` ikut memperbarui props, jadi badge terbaru tanpa reload manual. Angka 0 = badge tidak dirender.
 */
const DEFAULT_NAV = [
    { label: 'Beranda', href: '/' },
    { label: 'Produk', href: '/produk' },
    { label: 'Kontak', href: '/kontak-kami' },
];

const hrefOf = (item) => item?.url ?? item?.href ?? null;

/** Jumlah item yang aman ditampilkan: `null` bila nilai tidak tersedia, `0` bila kosong/tidak sah. */
const toCount = (value) => {
    if (value === null || value === undefined || value === '') return null;

    const parsed = Number(value);

    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
};

export default function PublicLayout({ settings: settingsProp = null, cartCount = null, user = null, children }) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const page = usePage();

    /* Dasar: props bersama `settings` (kontrak §1). Prop eksplisit halaman menimpa per key;
       nilai kosong dari halaman tidak menghapus identitas yang dibagikan server. */
    const sharedSettings = page?.props?.settings;
    const settings = {
        ...(sharedSettings && typeof sharedSettings === 'object' ? sharedSettings : {}),
        ...(settingsProp && typeof settingsProp === 'object' ? settingsProp : {}),
    };

    const storeName = settings.store_name || 'Toko Kulot';
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

    const currentUser = user ?? page?.props?.auth?.user ?? null;
    const count = toCount(page?.props?.cart?.count) ?? toCount(cartCount) ?? toCount(settings?.cart_count) ?? 0;

    const keluar = () => {
        if (loggingOut) return;

        setLoggingOut(true);
        router.post('/logout', {}, { onFinish: () => setLoggingOut(false) });
    };

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
                        <div className="flex flex-col gap-3">
                            <p className="text-meta text-ink-soft">
                                {`Masuk sebagai ${currentUser.name ?? currentUser.email ?? 'Akun'}`}
                            </p>
                            <Link
                                href="/history"
                                onClick={() => setDrawerOpen(false)}
                                className="btn-secondary w-full justify-center"
                            >
                                Riwayat pesanan
                            </Link>
                            <button
                                type="button"
                                onClick={keluar}
                                disabled={loggingOut}
                                aria-busy={loggingOut || undefined}
                                className="btn-ghost w-full justify-center disabled:cursor-not-allowed disabled:opacity-45"
                            >
                                {loggingOut ? 'Memproses…' : 'Keluar'}
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {/* Dua pintu untuk tamu: Daftar (primary) + Masuk (secondary) — deviasi D15 (design.md §3.1/§11.3, kartu UIUX t_46901364; kartu t_e3f68f7f). */}
                            <Link href="/register" className="btn-primary w-full justify-center">
                                Daftar
                            </Link>
                            <Link href="/login" className="btn-secondary w-full justify-center">
                                Masuk
                            </Link>
                        </div>
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
                copyright={settings.footer_copyright ?? null}
            />
        </div>
    );
}

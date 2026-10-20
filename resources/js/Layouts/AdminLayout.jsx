import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { cn } from '../lib/format';
import { useBodyScrollLock, useFocusTrap } from '../lib/hooks';
import {
    ArchiveIcon,
    BoxIcon,
    CartIcon,
    CloseIcon,
    GearIcon,
    GridIcon,
    LayersIcon,
    LogOutIcon,
    MailIcon,
    MenuIcon,
    StarIcon,
    UserIcon,
} from '../Components/icons';

/**
 * Kerangka admin — docs/design.md §5.10, docs/komponen.md §2.
 * Sidebar `w-sidebar bg-brand-700` (desktop tetap, mobile drawer), topbar `h-topbar`.
 * Seluruh item menunjuk rute yang terdaftar di `routes/admin.php` (PRD §5.2), jadi
 * semuanya tautan aktif. Jangan menambah item tanpa rutenya, dan jangan
 * menonaktifkan item yang rutenya ada — sidebar yang mati memutus navigasi
 * antar-modul admin (QA-007).
 *
 * Deviasi disengaja (design §5.10 catatan D8, keputusan kartu `t_b5de72e3`): kolom `⌕ cari`
 * pada topbar TIDAK dirender — jalur pencarian admin adalah toolbar per halaman daftar
 * (design §5.12) dan PRD §5.2 tidak memuat rute pencarian. Jangan menambahkannya sendiri.
 */
export const ADMIN_NAV = [
    { key: 'dashboard', label: 'Dashboard', href: '/admin', icon: GridIcon },
    { key: 'produk', label: 'Produk', href: '/admin/produk', icon: BoxIcon },
    { key: 'kategori', label: 'Kategori', href: '/admin/kategori', icon: LayersIcon },
    { key: 'stok', label: 'Stok', href: '/admin/stok', icon: ArchiveIcon },
    { key: 'pesanan', label: 'Pesanan', href: '/admin/pesanan', icon: CartIcon },
    { key: 'pesan', label: 'Pesan', href: '/admin/pesan-masuk', icon: MailIcon },
    { key: 'penilaian', label: 'Penilaian', href: '/admin/penilaian', icon: StarIcon },
    { key: 'pengaturan', label: 'Pengaturan', href: '/admin/pengaturan', icon: GearIcon },
    { key: 'akun', label: 'Akun', href: '/admin/akun', icon: UserIcon },
];

const isActive = (url, href) => {
    if (!url || !href) return false;
    if (href === '/admin') return url === '/admin' || url === '/admin/';
    return url === href || url.startsWith(`${href}/`) || url.startsWith(`${href}?`);
};

export default function AdminLayout({ auth = null, nav = ADMIN_NAV, title = null, children }) {
    const page = usePage();
    const url = page?.url ?? '';
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const drawerRef = useRef(null);
    const menuRef = useRef(null);

    useBodyScrollLock(drawerOpen);
    useFocusTrap(drawerRef, drawerOpen);

    useEffect(() => {
        setDrawerOpen(false);
        setMenuOpen(false);
    }, [url]);

    useEffect(() => {
        if (!menuOpen) return undefined;

        const onPointerDown = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
        };

        const onKeyDown = (event) => {
            if (event.key === 'Escape') setMenuOpen(false);
        };

        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [menuOpen]);

    const items = Array.isArray(nav) && nav.length > 0 ? nav : ADMIN_NAV;
    const userName = auth?.name ?? 'Admin';
    const userEmail = auth?.email ?? null;
    const initial = String(userName).trim().charAt(0).toUpperCase() || 'A';

    const logout = () => router.post('/admin/logout');

    const navList = (onNavigate = null) => (
        <ul className="flex flex-1 flex-col gap-1 p-3">
            {items.map((item) => {
                const Icon = item.icon ?? GridIcon;
                const active = isActive(url, item.href);

                return (
                    <li key={item.key ?? item.href}>
                        <Link
                            href={item.href}
                            onClick={onNavigate}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                                'flex h-11 items-center gap-3 rounded-md border-l-[3px] px-3 text-meta transition-colors duration-hover',
                                active
                                    ? 'border-accent-500 bg-white/10 text-white'
                                    : 'border-transparent text-white/75 hover:bg-white/10 hover:text-white'
                            )}
                        >
                            <Icon size={18} />
                            {item.label}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );

    return (
        <div className="min-h-screen bg-surface">
            {title && <Head title={title} />}

            {/* Sidebar desktop */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-sidebar flex-col bg-brand-700 lg:flex">
                <div className="flex h-topbar items-center px-4 text-white">
                    <Link href="/admin" className="text-label font-semibold uppercase tracking-wide">
                        Daster Kulot
                    </Link>
                </div>
                <nav aria-label="Navigasi admin" className="flex flex-1 flex-col overflow-y-auto">
                    {navList()}
                </nav>
            </aside>

            {/* Drawer mobile */}
            {drawerOpen && (
                <div className="fixed inset-0 z-drawer lg:hidden">
                    <button
                        type="button"
                        aria-label="Tutup menu"
                        onClick={() => setDrawerOpen(false)}
                        className="absolute inset-0 h-full w-full bg-ink/40"
                    />
                    <div
                        ref={drawerRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Navigasi admin"
                        className="animate-drawer-in absolute inset-y-0 left-0 flex w-drawer max-w-[85%] flex-col bg-brand-700"
                    >
                        <div className="flex h-topbar items-center justify-between px-4 text-white">
                            <span className="text-label font-semibold uppercase tracking-wide">Daster Kulot</span>
                            <button
                                type="button"
                                onClick={() => setDrawerOpen(false)}
                                aria-label="Tutup menu"
                                className="flex h-touch w-touch items-center justify-center rounded-md text-white/80 transition-colors duration-hover hover:bg-white/10 hover:text-white"
                            >
                                <CloseIcon size={20} />
                            </button>
                        </div>
                        <nav aria-label="Navigasi admin" className="flex flex-1 flex-col overflow-y-auto">
                            {navList(() => setDrawerOpen(false))}
                        </nav>
                    </div>
                </div>
            )}

            <div className="lg:pl-sidebar">
                <header className="sticky top-0 z-20 flex h-topbar items-center justify-between gap-3 border-b border-line bg-white px-4 lg:px-6">
                    <button
                        type="button"
                        onClick={() => setDrawerOpen(true)}
                        aria-label="Buka menu"
                        aria-expanded={drawerOpen}
                        className="flex h-touch w-touch items-center justify-center rounded-md text-ink transition-colors duration-hover hover:bg-surface lg:hidden"
                    >
                        <MenuIcon size={20} />
                    </button>

                    <p className="hidden text-label font-semibold text-ink lg:block">Panel Admin</p>

                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setMenuOpen((open) => !open)}
                            aria-haspopup="menu"
                            aria-expanded={menuOpen}
                            className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors duration-hover hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        >
                            <span
                                aria-hidden="true"
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-label font-semibold text-brand"
                            >
                                {initial}
                            </span>
                            <span className="hidden max-w-[160px] truncate text-meta text-ink sm:block">{userName}</span>
                        </button>

                        {menuOpen && (
                            <div
                                role="menu"
                                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-line bg-white shadow-raised"
                            >
                                <div className="border-b border-line px-4 py-3">
                                    <p className="truncate text-label font-semibold text-ink">{userName}</p>
                                    {userEmail && (
                                        <p className="truncate text-meta text-slate-500">{userEmail}</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={logout}
                                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-label text-ink transition-colors duration-hover hover:bg-surface"
                                >
                                    <LogOutIcon size={16} />
                                    Keluar
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <main className="mx-auto w-full max-w-[1200px] px-4 py-6 lg:px-6">{children}</main>
            </div>
        </div>
    );
}

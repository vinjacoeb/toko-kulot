import React from 'react';
import { Link, router } from '@inertiajs/react';
import { cn } from '../lib/format';
import { useScrolled } from '../lib/hooks';
import IconButton from './IconButton';
import {
    CartIcon,
    MenuIcon,
    SearchIcon,
    UserIcon,
} from './icons';

/**
 * Header sticky — docs/komponen.md §1, docs/design.md §3.1.
 * Struktur: logo kiri → menu → ikon kanan (Cari, Keranjang, Masuk).
 * Scroll > 8px menambah `backdrop-blur-sm` + `border-b`.
 * Mobile: hamburger kiri, logo tengah, keranjang kanan.
 */
export default function Header({
    nav = [],
    cartCount = 0,
    user = null,
    onOpenDrawer,
    storeName = 'Toko Kulot',
    logoUrl = null,
    searchHref = '/produk',
    loginHref = '/login',
    cartHref = '/keranjang',
}) {
    const scrolled = useScrolled(8);
    const count = Number(cartCount) || 0;

    const wordmark = logoUrl ? (
        <img src={logoUrl} alt={storeName} className="h-8 w-auto" loading="eager" />
    ) : (
        <span className="font-display text-h2 uppercase tracking-[0.02em] text-brand">{storeName}</span>
    );

    return (
        <header
            className={cn(
                'sticky top-0 z-header border-b bg-white',
                scrolled ? 'border-line backdrop-blur-sm' : 'border-transparent'
            )}
        >
            <div className="container flex h-headerMobile items-center justify-between gap-4 md:h-header">
                <div className="flex items-center gap-2 md:hidden">
                    <IconButton label="Buka menu" onClick={onOpenDrawer} className="-ml-2">
                        <MenuIcon size={20} />
                    </IconButton>
                </div>

                <Link href="/" className="flex items-center md:mr-6" aria-label={`${storeName} — beranda`}>
                    {wordmark}
                </Link>

                <nav className="hidden flex-1 items-center gap-1 md:flex" aria-label="Navigasi utama">
                    {nav.map((item) => (
                        <Link
                            key={item.href ?? item.label}
                            href={item.href}
                            className="px-3.5 py-3 text-meta text-ink hover:underline hover:decoration-accent-500 hover:decoration-2 hover:underline-offset-4"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-1">
                    <Link
                        href={searchHref}
                        aria-label="Cari produk"
                        title="Cari produk"
                        className="hidden h-touch w-touch items-center justify-center rounded-md text-brand transition-colors duration-hover hover:bg-surface md:inline-flex"
                    >
                        <SearchIcon size={20} />
                    </Link>

                    <IconButton
                        label={`Keranjang${count > 0 ? `, ${count} item` : ''}`}
                        badge={count > 0 ? count : null}
                        onClick={() => router.visit(cartHref)}
                    >
                        <CartIcon size={20} />
                    </IconButton>

                    {user ? (
                        <div className="hidden items-center gap-2 md:flex">
                            <span className="max-w-[120px] truncate text-meta text-ink">
                                {user.name ?? user.email ?? 'Akun'}
                            </span>
                            <button
                                type="button"
                                onClick={() => router.post('/logout')}
                                className="text-meta text-brand underline underline-offset-4"
                            >
                                Keluar
                            </button>
                        </div>
                    ) : (
                        <Link
                            href={loginHref}
                            aria-label="Masuk"
                            title="Masuk"
                            className="hidden h-touch w-touch items-center justify-center rounded-md text-brand transition-colors duration-hover hover:bg-surface md:inline-flex"
                        >
                            <UserIcon size={20} />
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}

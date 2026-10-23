import React, { useEffect, useRef, useState } from 'react';
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
 * Struktur: logo + nama toko kiri → menu → ikon kanan (Cari, Keranjang, Masuk).
 * Nama toko selalu tampil di samping logo (docs/rencana-perbaikan-5.md baris 15) dan dipotong
 * dengan `truncate` di mobile agar header tidak melebar; logo dekoratif (`alt=""`).
 * Tamu >=md: ikon Masuk + tautan teks "Daftar" ke `/register` — deviasi **D14** (design.md §3.1/§11.3,
 * cabang pembeli login tidak berubah.
 * Scroll > 8px menambah `backdrop-blur-sm` + `border-b`.
 * Mobile: hamburger kiri, logo tengah, keranjang kanan.
 *
 * Menu profil (docs/rencana-perbaikan-5.md baris 22, kartu t_326f766b): ikon profil tetap;
 * hover/focus membuka panel berisi nama, "Riwayat pesanan" (/history), dan "Keluar".
 * Panel turun di bawah ikon (`top-full` + padding jembatan hover) sehingga tidak menutupi ikon.
 * Escape menutup dan mengembalikan fokus ke ikon; Tab berpindah ke tautan menu; blur di luar
 * panel menutup menu. Tamu tetap diarahkan ke `/login` lewat ikon yang sama.
 */

const itemMenu =
    'flex min-h-touch w-full items-center gap-2 rounded-md px-3 text-left text-meta transition-colors duration-hover hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';

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

    const [menuOpen, setMenuOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [logoFailed, setLogoFailed] = useState(false);
    const menuButtonRef = useRef(null);
    const skipFocusOpen = useRef(false);

    const displayName = user?.name ?? user?.email ?? 'Akun';
    const displayEmail = user?.name && user?.email ? user.email : null;

    const tutupMenu = () => setMenuOpen(false);

    const tutupDanFokus = () => {
        setMenuOpen(false);
        skipFocusOpen.current = true;
        menuButtonRef.current?.focus();
        skipFocusOpen.current = false;
    };

    const onMenuKeyDown = (event) => {
        if (event.key !== 'Escape' || !menuOpen) return;

        event.stopPropagation();
        tutupDanFokus();
    };

    /* Escape menutup juga saat panel terbuka karena hover (fokus masih di luar). */
    useEffect(() => {
        if (!menuOpen) return undefined;

        const onEscape = (event) => {
            if (event.key === 'Escape') tutupDanFokus();
        };

        document.addEventListener('keydown', onEscape);

        return () => document.removeEventListener('keydown', onEscape);
    }, [menuOpen]);

    const keluar = () => {
        if (loggingOut) return;

        setLoggingOut(true);
        router.post('/logout', {}, {
            onFinish: () => {
                setLoggingOut(false);
                setMenuOpen(false);
            },
        });
    };

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

                {/* Identitas toko: logo + nama di sampingnya (keluhan pemilik #6, docs/rencana-perbaikan-5.md).
                    Nama dipotong di mobile agar header tidak melebar; teks penuh ada di `title`. */}
                <Link
                    href="/"
                    title={storeName}
                    aria-label={`${storeName} — beranda`}
                    className="flex min-w-0 items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 md:mr-6"
                >
                    {logoUrl && !logoFailed && (
                        <img
                            src={logoUrl}
                            alt=""
                            className="h-8 w-auto shrink-0"
                            loading="eager"
                            onError={() => setLogoFailed(true)}
                        />
                    )}
                    <span className="max-w-[42vw] truncate font-display text-h2 uppercase tracking-[0.02em] text-brand md:max-w-[24rem]">
                        {storeName}
                    </span>
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
                        <div
                            className="relative hidden md:block"
                            onMouseEnter={() => setMenuOpen(true)}
                            onMouseLeave={() => setMenuOpen(false)}
                            onBlur={(event) => {
                                if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false);
                            }}
                            onKeyDown={onMenuKeyDown}
                        >
                            <button
                                type="button"
                                ref={menuButtonRef}
                                aria-haspopup="true"
                                aria-expanded={menuOpen}
                                aria-controls="menu-profil"
                                aria-label={`Menu akun ${displayName}`}
                                title="Menu akun"
                                onClick={() => setMenuOpen(true)}
                                onFocus={(event) => {
                                    /* Klik mouse juga memicu focus; biarkan klik yang membuka agar
                                       tidak langsung tertutup oleh toggle. Keyboard (Tab) tetap membuka. */
                                    if (!skipFocusOpen.current && event.target.matches(':focus-visible')) {
                                        setMenuOpen(true);
                                    }
                                }}
                                className="inline-flex h-touch w-touch items-center justify-center rounded-md text-brand transition-colors duration-hover hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                            >
                                <UserIcon size={20} />
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 top-full pt-2">
                                    <div
                                        id="menu-profil"
                                        className="w-60 rounded-xl border border-line bg-white p-2 shadow-raised"
                                    >
                                        <div className="border-b border-line px-3 pb-3 pt-2">
                                            <p className="truncate text-label font-semibold text-ink">{displayName}</p>
                                            {displayEmail && (
                                                <p className="mt-0.5 truncate text-meta text-slate-500">{displayEmail}</p>
                                            )}
                                        </div>

                                        <Link href="/history" onClick={tutupMenu} className={cn(itemMenu, 'mt-2 text-ink')}>
                                            Riwayat pesanan
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={keluar}
                                            disabled={loggingOut}
                                            aria-busy={loggingOut || undefined}
                                            className={cn(itemMenu, 'text-brand disabled:cursor-not-allowed disabled:opacity-45')}
                                        >
                                            {loggingOut ? 'Memproses…' : 'Keluar'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link
                                href={loginHref}
                                aria-label="Masuk"
                                title="Masuk"
                                className="hidden h-touch w-touch items-center justify-center rounded-md text-brand transition-colors duration-hover hover:bg-surface md:inline-flex"
                            >
                                <UserIcon size={20} />
                            </Link>

                            {/* Pintu Daftar untuk tamu >= md — deviasi D14 (design.md §3.1/§11.3, kartu UIUX t_46901364; kartu t_e3f68f7f). */}
                            <Link
                                href="/register"
                                className="hidden text-meta text-brand underline underline-offset-4 md:inline-flex"
                            >
                                Daftar
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

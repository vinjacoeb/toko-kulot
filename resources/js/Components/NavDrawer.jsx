import React, { useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '../lib/format';
import { useBodyScrollLock, useFocusTrap } from '../lib/hooks';
import { CloseIcon } from './icons';

/**
 * Drawer navigasi mobile — docs/komponen.md §1, docs/design.md §4.12.
 * Lebar `w-drawer`, item `h-drawerItem`, fokus terperangkap, Esc menutup,
 * scroll body dikunci, overlay gelap, `z-drawer`.
 */
export default function NavDrawer({ open = false, nav = [], onClose, title = 'Menu', footer = null }) {
    const panelRef = useRef(null);

    useBodyScrollLock(open);
    useFocusTrap(panelRef, open);

    useEffect(() => {
        if (!open) return undefined;

        const onKeyDown = (event) => {
            if (event.key === 'Escape') onClose?.();
        };

        document.addEventListener('keydown', onKeyDown);

        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-drawer">
            <button
                type="button"
                aria-label="Tutup menu"
                onClick={onClose}
                className="absolute inset-0 h-full w-full cursor-default bg-black/50"
            />
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                tabIndex={-1}
                className={cn(
                    'relative flex h-screen w-drawer max-w-[84%] flex-col bg-white animate-drawer-in'
                )}
            >
                <div className="flex h-header items-center justify-between border-b border-line px-4">
                    <span className="text-badge uppercase text-slate-500">{title}</span>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup menu"
                        className="inline-flex h-touch w-touch items-center justify-center rounded-md text-brand transition-colors duration-hover hover:bg-surface"
                    >
                        <CloseIcon size={20} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto" aria-label="Navigasi utama">
                    <ul>
                        {nav.map((item) => (
                            <li key={item.href ?? item.label}>
                                <Link
                                    href={item.href}
                                    onClick={onClose}
                                    className="flex h-drawerItem items-center border-b border-line px-4 text-label text-ink transition-colors duration-hover hover:bg-surface"
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {footer && <div className="border-t border-line p-4">{footer}</div>}
            </div>
        </div>
    );
}

/**
 * Ikon SVG inline 20px, stroke-width 1.5 (design §7 butir 2).
 * Semua ikon dekoratif: aria-hidden, label diberikan oleh elemen induk.
 */
import React from 'react';

const Svg = ({ size = 20, className = '', children, filled = false, ...rest }) => (
    <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={filled ? 'currentColor' : 'none'}
        stroke={filled ? 'none' : 'currentColor'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...rest}
    >
        {children}
    </svg>
);

export const SearchIcon = (props) => (
    <Svg {...props}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20.5 20.5-3.9-3.9" />
    </Svg>
);

export const CartIcon = (props) => (
    <Svg {...props}>
        <path d="M3 4h2.2l2.1 10.4a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L20.5 7H6" />
        <circle cx="10" cy="20" r="1.2" />
        <circle cx="17.5" cy="20" r="1.2" />
    </Svg>
);

export const MenuIcon = (props) => (
    <Svg {...props}>
        <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
);

export const CloseIcon = (props) => (
    <Svg {...props}>
        <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
);

export const ChevronDownIcon = (props) => (
    <Svg {...props}>
        <path d="m6 9 6 6 6-6" />
    </Svg>
);

export const ChevronLeftIcon = (props) => (
    <Svg {...props}>
        <path d="m14 6-6 6 6 6" />
    </Svg>
);

export const ChevronRightIcon = (props) => (
    <Svg {...props}>
        <path d="m10 6 6 6-6 6" />
    </Svg>
);

export const StarIcon = ({ filled = false, ...props }) => (
    <Svg filled={filled} {...props}>
        <path d="M12 3.6l2.6 5.3 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.7l5.9-.8L12 3.6z" />
    </Svg>
);

export const CheckIcon = (props) => (
    <Svg {...props}>
        <path d="m5 12.5 4.5 4.5L19 7" />
    </Svg>
);

export const TruckIcon = (props) => (
    <Svg {...props}>
        <path d="M2.5 7.5h10v8h-10z" />
        <path d="M12.5 10.5h4l3 3v2h-7z" />
        <circle cx="6" cy="18" r="1.6" />
        <circle cx="16.5" cy="18" r="1.6" />
    </Svg>
);

export const ReturnIcon = (props) => (
    <Svg {...props}>
        <path d="M4 9h9a5 5 0 0 1 0 10H8" />
        <path d="m7.5 5.5-3.5 3.5 3.5 3.5" />
    </Svg>
);

export const ShieldCheckIcon = (props) => (
    <Svg {...props}>
        <path d="M12 3.5l7 2.5v5.4c0 4-3 7.2-7 8.6-4-1.4-7-4.6-7-8.6V6l7-2.5z" />
        <path d="m8.8 12 2.2 2.2 4.2-4.2" />
    </Svg>
);

export const HeadsetIcon = (props) => (
    <Svg {...props}>
        <path d="M4.5 13v-1a7.5 7.5 0 0 1 15 0v1" />
        <path d="M4.5 13h2.2v5H5.6A1.6 1.6 0 0 1 4 16.4V13z" />
        <path d="M19.5 13h-2.2v5h1.1a1.6 1.6 0 0 0 1.6-1.6V13z" />
        <path d="M17.3 18v.6a2.4 2.4 0 0 1-2.4 2.4H12" />
    </Svg>
);

export const UserIcon = (props) => (
    <Svg {...props}>
        <circle cx="12" cy="8.5" r="3.5" />
        <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </Svg>
);

export const MailIcon = (props) => (
    <Svg {...props}>
        <rect x="3" y="5.5" width="18" height="13" rx="2" />
        <path d="m4 7 8 6 8-6" />
    </Svg>
);

export const PhoneIcon = (props) => (
    <Svg {...props}>
        <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" />
    </Svg>
);

export const MapPinIcon = (props) => (
    <Svg {...props}>
        <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.6" />
    </Svg>
);

export const AlertIcon = (props) => (
    <Svg {...props}>
        <path d="M12 4.5 21 20H3L12 4.5z" />
        <path d="M12 10v4" />
        <path d="M12 17h.01" />
    </Svg>
);

export const ImageOffIcon = (props) => (
    <Svg {...props}>
        <path d="M4 5.5h16v13H4z" />
        <path d="m4 15 4.5-4.5 4 4 3-3 4.5 4.5" />
        <path d="M3 3l18 18" />
    </Svg>
);

export const SpinnerIcon = ({ size = 16, className = '' }) => (
    <svg
        className={`animate-spin ${className}`}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
    >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const InstagramIcon = (props) => (
    <Svg {...props}>
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17 7h.01" />
    </Svg>
);

export const FacebookIcon = (props) => (
    <Svg {...props}>
        <path d="M14.5 8.5h2.5V5h-2.5a4 4 0 0 0-4 4v2H8v3.5h2.5V21H14v-6.5h2.5L17 11h-3V9.5a1 1 0 0 1 1-1z" />
    </Svg>
);

export const TikTokIcon = (props) => (
    <Svg {...props}>
        <path d="M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5" />
        <path d="M14 4c.5 2.4 2.2 3.9 4.5 4" />
    </Svg>
);

export const WhatsAppIcon = (props) => (
    <Svg {...props}>
        <path d="M20 11.7A8 8 0 0 1 8.3 19L4 20l1-4.2A8 8 0 1 1 20 11.7z" />
        <path d="M9 9.5c.6 2.2 2.3 3.9 4.5 4.5" />
    </Svg>
);

export const LeafIcon = (props) => (
    <Svg {...props}>
        <path d="M20 4c-8 0-13 3.5-13 9.5A5.5 5.5 0 0 0 12.5 19C18.5 19 20 12 20 4z" />
        <path d="M4 21c1.5-5 5-8.5 9-10.5" />
    </Svg>
);

export const ScissorsIcon = (props) => (
    <Svg {...props}>
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="6" cy="18" r="2.5" />
        <path d="M8.2 7.6 20 18M8.2 16.4 20 6" />
    </Svg>
);

export const GridIcon = (props) => (
    <Svg {...props}>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </Svg>
);

export const BoxIcon = (props) => (
    <Svg {...props}>
        <path d="M20.5 7.8v8.4a1.5 1.5 0 0 1-.8 1.3l-7 3.7a1.5 1.5 0 0 1-1.4 0l-7-3.7a1.5 1.5 0 0 1-.8-1.3V7.8" />
        <path d="m3.9 7.1 7.4-3.8a1.5 1.5 0 0 1 1.4 0l7.4 3.8-8.1 4.2Z" />
        <path d="M12 11.3V20" />
    </Svg>
);

export const LayersIcon = (props) => (
    <Svg {...props}>
        <path d="m12 3.5 8 4-8 4-8-4Z" />
        <path d="m4 12 8 4 8-4" />
        <path d="m4 16.5 8 4 8-4" />
    </Svg>
);

export const ArchiveIcon = (props) => (
    <Svg {...props}>
        <rect x="3.5" y="4" width="17" height="4" rx="1" />
        <path d="M5 8v10.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V8" />
        <path d="M10 12h4" />
    </Svg>
);

export const GearIcon = (props) => (
    <Svg {...props}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </Svg>
);

export const LogOutIcon = (props) => (
    <Svg {...props}>
        <path d="M15 4.5h3A1.5 1.5 0 0 1 19.5 6v12a1.5 1.5 0 0 1-1.5 1.5h-3" />
        <path d="M10 8 6 12l4 4" />
        <path d="M6 12h9" />
    </Svg>
);

export const WalletIcon = (props) => (
    <Svg {...props}>
        <rect x="3" y="6" width="18" height="13" rx="2.5" />
        <path d="M3 10.5h18" />
        <path d="M16.5 15h2" />
    </Svg>
);

export const TrendUpIcon = (props) => (
    <Svg {...props}>
        <path d="m3.5 16.5 5.5-5.5 3.5 3.5 7.5-7.5" />
        <path d="M15 7h5v5" />
    </Svg>
);

export const TrendDownIcon = (props) => (
    <Svg {...props}>
        <path d="m3.5 7.5 5.5 5.5 3.5-3.5 7.5 7.5" />
        <path d="M15 17h5v-5" />
    </Svg>
);

export const ChartIcon = (props) => (
    <Svg {...props}>
        <path d="M4 20V4" />
        <path d="M4 20h16" />
        <path d="M8 16v-4" />
        <path d="M12.5 16V8" />
        <path d="M17 16v-6" />
    </Svg>
);

/** Ikon hapus — aksi hapus baris keranjang (design §4.28). */
export const TrashIcon = (props) => (
    <Svg {...props}>
        <path d="M4 7h16" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
        <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
    </Svg>
);

/** Ikon salin — tombol "Salin" kode pesanan (design §5.8). */
export const CopyIcon = (props) => (
    <Svg {...props}>
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M15 6.5V5.5A1.5 1.5 0 0 0 13.5 4H5.5A1.5 1.5 0 0 0 4 5.5v8A1.5 1.5 0 0 0 5.5 15h1" />
    </Svg>
);

/** Pemetaan nama ikon dari pengaturan admin ke komponen (kontrak: truck|refresh|qris|chat|leaf|scissors). */
export const TRUST_ICONS = {
    truck: TruckIcon,
    shipping: TruckIcon,
    return: ReturnIcon,
    retur: ReturnIcon,
    refresh: ReturnIcon,
    qris: ShieldCheckIcon,
    payment: ShieldCheckIcon,
    secure: ShieldCheckIcon,
    support: HeadsetIcon,
    headset: HeadsetIcon,
    chat: HeadsetIcon,
    leaf: LeafIcon,
    scissors: ScissorsIcon,
    check: CheckIcon,
};

export const SOCIAL_ICONS = {
    instagram: InstagramIcon,
    facebook: FacebookIcon,
    tiktok: TikTokIcon,
    whatsapp: WhatsAppIcon,
};

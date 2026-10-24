import defaultTheme from 'tailwindcss/defaultTheme';

/**
 * Design token Toko Kulot — sumber kebenaran: docs/design.md §2.
 * Setiap token di design.md §2.1–§2.4 punya key di sini (peta lengkap: design.md §2.5).
 * Jangan menulis hex di JSX; pakai kelas token.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/**/*.blade.php',
        './resources/**/*.js',
        './resources/**/*.jsx',
        './resources/**/*.vue',
    ],
    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: '16px',
                lg: '50px',
            },
        },
        extend: {
            // §2.1 Warna
            colors: {
                brand: {
                    DEFAULT: '#1F2A5E',
                    700: '#1F2A5E',
                    600: '#2A3775',
                    100: '#E7E9F2',
                    soft: 'rgba(31,42,94,0.75)',
                },
                accent: {
                    DEFAULT: '#F5B301',
                    500: '#F5B301',
                    600: '#D99E00',
                },
                sale: {
                    DEFAULT: '#E02B00',
                    500: '#E02B00',
                },
                ink: {
                    DEFAULT: '#121212',
                    soft: 'rgba(0,0,0,0.75)',
                },
                surface: '#F6F6F4',
                footer: '#0E0E0E',
                line: '#E5E7EB',
                success: '#16A34A',
                warning: '#D97706',
                danger: '#DC2626',
                // §2.1 varian teks gelap (tangga palette 800) — aturan tone badge §4.21
                // dan aturan kontras teks state §2.1 (kartu t_8cd61512). Hanya untuk TEKS < 24px;
                // token dasar tetap dipakai untuk ikon/garis/latar tint.
                'success-strong': '#166534',
                'warning-strong': '#92400E',
                'danger-strong': '#991B1B',
            },
            // §2.2 Tipografi — fluid, nilai mobile (360px) → desktop (1300px)
            fontFamily: {
                display: ['"Bebas Neue"', 'Impact', ...defaultTheme.fontFamily.sans],
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            fontSize: {
                // design-v1.1 §2.1: satu statement editorial why-us di desktop.
                'display-xl': ['72px', { lineHeight: '0.95', letterSpacing: '0.01em' }],
                display: ['clamp(40px, 2.55vw + 30.8px, 64px)', { lineHeight: '1', letterSpacing: '0.02em' }],
                h1: ['clamp(32px, 1.28vw + 27.4px, 44px)', { lineHeight: '1.05', letterSpacing: '0.02em' }],
                h2: ['clamp(26px, 0.64vw + 23.7px, 32px)', { lineHeight: '1.1', letterSpacing: '0.02em' }],
                h3: ['clamp(15px, 0.11vw + 14.6px, 16px)', { lineHeight: '1.35', fontWeight: '600' }],
                body: ['clamp(15px, 0.11vw + 14.6px, 16px)', { lineHeight: '1.5' }],
                meta: ['clamp(13px, 0.11vw + 12.6px, 14px)', { lineHeight: '1.45' }],
                label: ['clamp(14px, 0.11vw + 13.6px, 15px)', { lineHeight: '1', letterSpacing: '1px', fontWeight: '600' }],
                badge: ['clamp(11px, 0.11vw + 10.6px, 12px)', { lineHeight: '1', letterSpacing: '0.08em', fontWeight: '700' }],
            },
            // §2.4 Breakpoint (xs & xl menggeser default Tailwind)
            screens: {
                xs: '360px',
                xl: '1300px',
            },
            borderRadius: {
                sm: '6px',
                md: '8px',
                lg: '9px',
                xl: '12px',
                full: '999px',
            },
            // design-v1.1 §2.1: rasio potret konsisten (tile galeri, gambar why-us).
            aspectRatio: {
                portrait: '4 / 5',
                editorial: '16 / 10',
            },
            boxShadow: {
                card: '0 1px 2px rgba(0,0,0,.04)',
                raised: '0 8px 24px rgba(0,0,0,.08)',
            },
            // §2.3 Spacing / ukuran
            spacing: {
                header: '68px',
                headerMobile: '56px',
                section: '64px',
                sectionMobile: '40px',
                gutter: '16px',
                gutterLg: '24px',
                sidebar: '240px',
                summary: '320px',
                thumb: '72px',
                cartThumb: '80px',
                field: '44px',
                touch: '44px',
                topbar: '64px',
            },
            maxWidth: {
                page: '1300px',
                form: '400px',
                adminLogin: '420px',
                modal: '480px',
                modalLg: '720px',
                qris: '480px',
            },
            height: {
                btn: '47px',
                header: '68px',
                headerMobile: '56px',
                tableHead: '44px',
                tableRow: '56px',
                drawerItem: '48px',
                qr: '240px',
                hero: '560px',
                heroMobile: '480px',
                banner: '320px',
                map: '320px',
            },
            width: {
                sidebar: '240px',
                summary: '320px',
                drawer: '84%',
                qr: '240px',
                thumb: '72px',
            },
            // §2.3 Grid produk
            gridTemplateColumns: {
                product: 'repeat(2, minmax(0, 1fr))',
                'product-md': 'repeat(3, minmax(0, 1fr))',
                'product-lg': 'repeat(4, minmax(0, 1fr))',
            },
            // §6 Motion
            transitionDuration: {
                hover: '300ms',
                toast: '180ms',
                accordion: '200ms',
                drawer: '250ms',
                carousel: '400ms',
            },
            transitionTimingFunction: {
                smooth: 'cubic-bezier(.2,.8,.2,1)',
            },
            // Lapisan z-index baku
            zIndex: {
                header: '40',
                drawer: '50',
                modal: '60',
                toast: '70',
            },
            keyframes: {
                'fade-up': {
                    '0%': { opacity: '0', transform: 'translateY(8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'drawer-in': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                'modal-in': {
                    '0%': { opacity: '0', transform: 'scale(.96)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
            },
            animation: {
                'fade-up': 'fade-up 180ms ease-out',
                'drawer-in': 'drawer-in 250ms ease-in-out',
                'modal-in': 'modal-in 200ms cubic-bezier(.2,.8,.2,1)',
                'pulse-slow': 'pulse 1.5s cubic-bezier(0.4,0,0.6,1) infinite',
            },
        },
    },
    plugins: [],
};

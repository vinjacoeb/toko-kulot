import { useCallback, useEffect, useRef, useState } from 'react';

/** Header `scrolled`: true bila halaman digulir melewati ambang (design §3.1). */
export function useScrolled(threshold = 8) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > threshold);

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, [threshold]);

    return scrolled;
}

/** Menghormati `prefers-reduced-motion` (design §6). */
export function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReduced(query.matches);

        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    return reduced;
}

/** Tab browser aktif — carousel berhenti saat tab tidak terlihat. */
export function useDocumentVisible() {
    const [visible, setVisible] = useState(
        typeof document === 'undefined' ? true : document.visibilityState !== 'hidden'
    );

    useEffect(() => {
        const update = () => setVisible(document.visibilityState !== 'hidden');

        document.addEventListener('visibilitychange', update);

        return () => document.removeEventListener('visibilitychange', update);
    }, []);

    return visible;
}

/**
 * design §4.0: loading yang melewati 10 detik wajib berubah jadi error.
 * Mengembalikan true bila ambang waktu terlampaui.
 */
export function useLoadingTimeout(loading, timeoutMs = 10000) {
    const [timedOut, setTimedOut] = useState(false);

    useEffect(() => {
        if (!loading) {
            setTimedOut(false);
            return undefined;
        }

        const id = window.setTimeout(() => setTimedOut(true), timeoutMs);

        return () => window.clearTimeout(id);
    }, [loading, timeoutMs]);

    return timedOut;
}

/** Kunci scroll body saat drawer/modal terbuka (design §4.12). */
export function useBodyScrollLock(active) {
    useEffect(() => {
        if (!active) return undefined;

        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previous;
        };
    }, [active]);
}

/**
 * Fokus terperangkap di dalam ref selama `active` (drawer/modal).
 * Tab berputar di elemen fokusable pertama-terakhir, Esc diserahkan ke pemanggil.
 */
export function useFocusTrap(ref, active) {
    const previouslyFocused = useRef(null);

    const focusFirst = useCallback(() => {
        const node = ref.current;
        if (!node) return;

        const targets = node.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (targets.length > 0) targets[0].focus();
        else node.focus();
    }, [ref]);

    useEffect(() => {
        if (!active) return undefined;

        previouslyFocused.current = document.activeElement;
        focusFirst();

        const onKeyDown = (event) => {
            if (event.key !== 'Tab') return;

            const node = ref.current;
            if (!node) return;

            const targets = Array.from(
                node.querySelectorAll(
                    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                )
            ).filter((el) => el.offsetParent !== null);

            if (targets.length === 0) {
                event.preventDefault();
                return;
            }

            const first = targets[0];
            const last = targets[targets.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('keydown', onKeyDown);

            if (previouslyFocused.current instanceof HTMLElement) {
                previouslyFocused.current.focus();
            }
        };
    }, [active, focusFirst, ref]);
}

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/format';

/**
 * Reveal — scroll reveal berbasis `IntersectionObserver`, design-v1.1 §4.6.
 *
 * Konten langsung terlihat bila: `prefers-reduced-motion: reduce`, browser tanpa
 * `IntersectionObserver`, atau JS tidak berjalan (tanpa React tidak ada render sama
 * sekali). Elemen muncul sekali lalu di-unobserve; stagger maksimal 4 item × 50ms
 * diatur pemanggil lewat prop `delay`.
 */
const canReveal = () => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return false;

    return !(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false);
};

export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(() => !canReveal());

    useEffect(() => {
        if (visible) return undefined;

        const node = ref.current;
        if (!node) return undefined;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setVisible(true);
                    observer.unobserve(node);
                }
            },
            { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, [visible]);

    return (
        <Tag
            ref={ref}
            style={delay ? { transitionDelay: `${delay}ms` } : undefined}
            className={cn(
                'transition duration-hover ease-smooth motion-reduce:transition-none',
                visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
                className
            )}
        >
            {children}
        </Tag>
    );
}

/** Jeda stagger: maksimal 4 item × 50ms (design-v1.1 §4.6). */
export const stagger = (index) => Math.min(Math.max(index, 0), 3) * 50;

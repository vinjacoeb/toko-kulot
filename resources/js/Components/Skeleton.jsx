import React from 'react';
import { cn } from '../lib/format';

const SHAPES = {
    text: 'h-3 w-full',
    title: 'h-6 w-2/3',
    card: 'aspect-square w-full',
    row: 'h-tableRow w-full',
    circle: 'h-10 w-10 rounded-full',
};

/** Placeholder memuat (design §4.17, §6). Dekoratif: aria-hidden. */
export default function Skeleton({ variant = 'text', count = 1, className = '' }) {
    return Array.from({ length: count }).map((_, index) => (
        <div
            key={index}
            aria-hidden="true"
            className={cn('skeleton', SHAPES[variant] ?? SHAPES.text, className)}
        />
    ));
}

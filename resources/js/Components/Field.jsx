import React from 'react';
import { cn } from '../lib/format';

/**
 * Pembungkus isian - docs/design.md 4.5.
 * Label wajib htmlFor; hint dan galat terhubung lewat aria-describedby.
 */
export default function Field({
    label,
    htmlFor,
    required = false,
    hint = null,
    error = null,
    children,
    className = '',
}) {
    const hintId = htmlFor ? htmlFor + '-hint' : undefined;
    const errorId = htmlFor ? htmlFor + '-error' : undefined;

    return (
        <div className={cn('flex flex-col', className)}>
            {label && (
                <label htmlFor={htmlFor} className="mb-1.5 block text-meta font-semibold text-ink">
                    {label}
                    {required && (
                        <span className="text-danger" aria-hidden="true">
                            {' *'}
                        </span>
                    )}
                </label>
            )}
            {children}
            {hint && !error && (
                <p id={hintId} className="mt-1.5 text-meta text-slate-400">
                    {hint}
                </p>
            )}
            {error && (
                <p id={errorId} className="mt-1.5 text-meta text-danger" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

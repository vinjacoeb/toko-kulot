import React from 'react';
import { cn } from '../lib/format';
import { ChevronDownIcon } from './icons';

/**
 * Accordion — docs/komponen.md §1, docs/design.md §4.24-adjacent (FAQ).
 * `openId` dikendalikan pemanggil; animasi 200ms (`duration-accordion`).
 * Satu item terbuka pada satu waktu (perilaku FAQ landing).
 */
export default function Accordion({ items = [], openId = null, onToggle = null, className = '' }) {
    if (!items.length) return null;

    return (
        <div className={cn('border-t border-line', className)}>
            {items.map((item) => {
                const id = item.id ?? item.title;
                const open = openId === id;
                const panelId = `accordion-panel-${id}`;
                const buttonId = `accordion-button-${id}`;

                return (
                    <div key={id} className="border-b border-line">
                        <h3>
                            <button
                                type="button"
                                id={buttonId}
                                aria-expanded={open}
                                aria-controls={panelId}
                                onClick={() => onToggle?.(open ? null : id)}
                                className="flex w-full items-center justify-between gap-4 py-4 text-left text-h3 text-ink transition-colors duration-hover hover:text-brand"
                            >
                                <span>{item.title}</span>
                                <span
                                    className={cn(
                                        'shrink-0 text-brand transition-transform duration-accordion ease-smooth',
                                        open ? 'rotate-180' : 'rotate-0'
                                    )}
                                    aria-hidden="true"
                                >
                                    <ChevronDownIcon size={20} />
                                </span>
                            </button>
                        </h3>
                        <div
                            id={panelId}
                            role="region"
                            aria-labelledby={buttonId}
                            hidden={!open}
                            className="pb-4 text-meta text-ink-soft"
                        >
                            {item.content}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

import React, { useEffect, useState } from 'react';
import { cn, formatNumber, rupiah } from '../lib/format';
import BottomSheet from './BottomSheet';
import Field from './Field';
import Input from './Input';
import VariantChip from './VariantChip';

function toArray(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (value === null || value === undefined || value === '') return [];
    return [value];
}

function Group({ title, children }) {
    return (
        <section className="border-b border-line py-4 first:pt-0 last:border-b-0">
            <h3 className="mb-2 text-label text-ink">{title}</h3>
            {children}
        </section>
    );
}

function FilterGroups({ draft, setDraft, categories, sizes }) {
    const ukuran = toArray(draft.ukuran);

    const toggleSize = (size) => {
        const next = ukuran.includes(size) ? ukuran.filter((item) => item !== size) : [...ukuran, size];
        setDraft({ ...draft, ukuran: next });
    };

    return (
        <div>
            <Group title="Kategori">
                <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-body text-ink">
                        <input
                            type="radio"
                            name="kategori"
                            value=""
                            checked={!draft.kategori}
                            onChange={() => setDraft({ ...draft, kategori: '' })}
                            className="h-4 w-4 border-line text-brand focus:ring-brand"
                        />
                        Semua kategori
                    </label>
                    {(categories || []).map((category) => (
                        <label key={category.id ?? category.slug} className="flex items-center gap-2 text-body text-ink">
                            <input
                                type="radio"
                                name="kategori"
                                value={category.slug ?? ''}
                                checked={draft.kategori === (category.slug ?? '')}
                                onChange={() => setDraft({ ...draft, kategori: category.slug ?? '' })}
                                className="h-4 w-4 border-line text-brand focus:ring-brand"
                            />
                            <span className="flex-1">{category.name}</span>
                            {category.product_count !== undefined && (
                                <span className="text-meta text-slate-500">{formatNumber(category.product_count)}</span>
                            )}
                        </label>
                    ))}
                </div>
            </Group>

            <Group title="Harga">
                <div className="flex items-center gap-2">
                    <Field label="Minimum" htmlFor="harga-min" className="flex-1">
                        <Input
                            id="harga-min"
                            type="number"
                            inputMode="numeric"
                            min="0"
                            placeholder="0"
                            value={draft.harga_min ?? ''}
                            onChange={(event) => setDraft({ ...draft, harga_min: event.target.value })}
                        />
                    </Field>
                    <Field label="Maksimum" htmlFor="harga-max" className="flex-1">
                        <Input
                            id="harga-max"
                            type="number"
                            inputMode="numeric"
                            min="0"
                            placeholder="Tanpa batas"
                            value={draft.harga_max ?? ''}
                            onChange={(event) => setDraft({ ...draft, harga_max: event.target.value })}
                        />
                    </Field>
                </div>
                {(draft.harga_min || draft.harga_max) && (
                    <p className="mt-2 text-meta tabular-nums text-slate-500">
                        {rupiah(Number(draft.harga_min || 0)) + ' - ' + (draft.harga_max ? rupiah(Number(draft.harga_max)) : 'tanpa batas')}
                    </p>
                )}
            </Group>

            {sizes && sizes.length > 0 && (
                <Group title="Ukuran">
                    <div className="flex flex-wrap gap-2">
                        {sizes.map((size) => (
                            <VariantChip
                                key={size}
                                label={size}
                                active={ukuran.includes(size)}
                                onClick={() => toggleSize(size)}
                            />
                        ))}
                    </div>
                </Group>
            )}
        </div>
    );
}

/**
 * FilterPanel - docs/design.md 4.18.
 * Sidebar sticky di desktop (langsung menerapkan), bottom sheet di mobile (Terapkan).
 */
export default function FilterPanel({
    categories = [],
    sizes = [],
    value = {},
    onApply = null,
    onReset = null,
    activeCount = 0,
    className = '',
}) {
    const [draft, setDraft] = useState(value || {});
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setDraft(value || {});
    }, [value]);

    const apply = (next) => {
        if (typeof onApply === 'function') onApply(next);
    };

    return (
        <>
            <aside className={cn('hidden lg:block', className)} aria-label="Filter produk">
                <div className="sticky top-[68px] rounded-md border border-line bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-h3 text-ink">Filter</h2>
                        {activeCount > 0 && typeof onReset === 'function' && (
                            <button
                                type="button"
                                onClick={onReset}
                                className="text-meta text-brand underline underline-offset-4"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                    <FilterGroups
                        draft={draft}
                        setDraft={(next) => {
                            setDraft(next);
                            apply(next);
                        }}
                        categories={categories}
                        sizes={sizes}
                    />
                </div>
            </aside>

            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex h-field items-center gap-2 rounded-md border border-line bg-white px-4 text-meta font-semibold text-ink lg:hidden"
            >
                Filter
                {activeCount > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-700 px-1.5 text-badge text-white">
                        {activeCount}
                    </span>
                )}
            </button>

            <BottomSheet
                open={open}
                onClose={() => setOpen(false)}
                title="Filter"
                footer={
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                const reset = {};
                                setDraft(reset);
                                if (typeof onReset === 'function') onReset();
                                setOpen(false);
                            }}
                            className="h-field flex-1 rounded-md border border-line text-meta font-semibold text-ink"
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                apply(draft);
                                setOpen(false);
                            }}
                            className="h-field flex-1 rounded-md bg-brand-700 text-meta font-semibold text-white"
                        >
                            Terapkan
                        </button>
                    </div>
                }
            >
                <FilterGroups draft={draft} setDraft={setDraft} categories={categories} sizes={sizes} />
            </BottomSheet>
        </>
    );
}

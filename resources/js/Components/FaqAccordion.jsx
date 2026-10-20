import React, { useState } from 'react';
import Accordion from './Accordion';
import SectionHeader from './SectionHeader';
import Skeleton from './Skeleton';

/**
 * FaqAccordion — docs/design.md §3.3 butir 8 + §4.6.
 * Maks 6 item dari `faqs`; seksi disembunyikan bila tidak ada data.
 * Satu item terbuka pada satu waktu.
 */
export default function FaqAccordion({
    items = [],
    title = 'Pertanyaan yang sering ditanya',
    description = null,
    loading = false,
    error = null,
    onRetry = null,
    id = 'faq',
}) {
    const [openId, setOpenId] = useState(null);

    const rows = Array.isArray(items)
        ? items
              .filter((item) => item && item.question && item.answer)
              .slice(0, 6)
              .map((item) => ({
                  id: item.id ?? item.question,
                  title: item.question,
                  content: item.answer,
              }))
        : [];

    if (loading) {
        return (
            <section id={id} className="container py-sectionMobile lg:py-section" aria-busy="true">
                <Skeleton variant="title" className="mb-6 h-8 w-64" />
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} variant="row" className="mb-3 h-12 w-full" />
                ))}
            </section>
        );
    }

    if (error) {
        return (
            <section id={id} className="container py-sectionMobile lg:py-section">
                <SectionHeader title={title} />
                <p className="text-meta text-slate-400" role="alert">
                    FAQ gagal dimuat.
                </p>
                {onRetry && (
                    <button type="button" onClick={onRetry} className="btn-secondary mt-4">
                        Coba lagi
                    </button>
                )}
            </section>
        );
    }

    if (!rows.length) return null;

    return (
        <section id={id} className="container py-sectionMobile lg:py-section">
            <SectionHeader title={title} description={description} />
            <Accordion items={rows} openId={openId} onToggle={setOpenId} />
        </section>
    );
}
